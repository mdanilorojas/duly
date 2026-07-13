import * as React from "react";
import { cn } from "@/lib/utils";
import {
  buildFragmentShader,
  VERTEX_SHADER,
  type NeuralAgent,
} from "./neural-agents.js";

export interface AgentCoreProps extends React.ComponentProps<"div"> {
  /** Agente a renderizar (aporta glow + shader). */
  agent: NeuralAgent;
  /** Diámetro del core en px. */
  size?: number;
  /** Nivel de actividad 0..1 — sube el brillo/velocidad del shader (ej. en hover). */
  active?: boolean;
}

// ---------------------------------------------------------------------------
// Renderer compartido (singleton a nivel de módulo, no un Context de React
// — ningún consumidor necesita envolver su árbol en un provider nuevo).
//
// El navegador tiene un techo de ~16 contextos WebGL vivos simultáneos. Antes
// de este refactor, cada AgentCore creaba su propio canvas + contexto WebGL;
// una galería de 24 agentes (ver legal/petroleum/software/industrial-agents.ts)
// lo golpearía y algunos cores caerían al fallback estático sin animar.
//
// Ahora hay UN solo contexto WebGL "maestro" (canvas offscreen, nunca en el
// DOM), creado perezosamente al montar el primer AgentCore. Cada instancia
// sigue montando su propio <canvas> visible, pero como contexto 2D — pinta
// ahí proyectando el maestro vía drawImage cada frame del loop compartido.
// ---------------------------------------------------------------------------

// Techo de calidad: consumidores con size > 120 (backing res > 240) escalan
// el maestro hacia arriba y pierden nitidez. Ningún consumidor actual pasa
// de 120; subir esto si alguno lo necesita.
const MASTER_SIZE = 240;

interface RenderEntry {
  program: WebGLProgram;
  posLoc: number;
  locTime: WebGLUniformLocation | null;
  locRes: WebGLUniformLocation | null;
  locAct: WebGLUniformLocation | null;
  targetRef: React.MutableRefObject<number>;
  currentActivity: number;
  startTime: number;
  ctx2d: CanvasRenderingContext2D;
  isVisible: boolean;
}

class SharedAgentRenderer {
  private gl: WebGLRenderingContext | null = null;
  private masterCanvas: HTMLCanvasElement | null = null;
  private vertexShader: WebGLShader | null = null;
  private positionBuffer: WebGLBuffer | null = null;
  private initFailed = false;
  private entries = new Map<string, RenderEntry>();
  private rafId = 0;

  private ensureInit(): boolean {
    if (this.gl) return true;
    if (this.initFailed) return false;

    const canvas = document.createElement("canvas");
    canvas.width = MASTER_SIZE;
    canvas.height = MASTER_SIZE;
    const gl = canvas.getContext("webgl", {
      antialias: false,
      alpha: true,
      premultipliedAlpha: true,
    });
    if (!gl) {
      this.initFailed = true;
      return false;
    }

    const vs = gl.createShader(gl.VERTEX_SHADER);
    if (!vs) {
      this.initFailed = true;
      return false;
    }
    gl.shaderSource(vs, VERTEX_SHADER);
    gl.compileShader(vs);
    if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
      console.error("[AgentCore] vertex shader error", gl.getShaderInfoLog(vs));
      this.initFailed = true;
      return false;
    }

    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    this.gl = gl;
    this.masterCanvas = canvas;
    this.vertexShader = vs;
    this.positionBuffer = buffer;
    return true;
  }

  /** Registra un agente. Devuelve false si WebGL no está disponible o el shader falló al compilar. */
  register(
    id: string,
    agent: NeuralAgent,
    ctx2d: CanvasRenderingContext2D,
    targetRef: React.MutableRefObject<number>,
    reduced: boolean,
  ): boolean {
    if (!this.ensureInit()) return false;
    const gl = this.gl!;

    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    if (!fs) return false;
    gl.shaderSource(fs, buildFragmentShader(agent.glsl));
    gl.compileShader(fs);
    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
      console.error("[AgentCore] shader error", agent.name, gl.getShaderInfoLog(fs));
      gl.deleteShader(fs);
      return false;
    }

    const program = gl.createProgram();
    if (!program) return false;
    gl.attachShader(program, this.vertexShader!);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.deleteShader(fs);

    const posLoc = gl.getAttribLocation(program, "position");
    const locTime = gl.getUniformLocation(program, "u_time");
    const locRes = gl.getUniformLocation(program, "u_resolution");
    const locAct = gl.getUniformLocation(program, "u_activity");

    if (reduced) {
      // prefers-reduced-motion: un solo frame estático — nunca entra al loop
      // compartido, así que no gasta un draw call por frame para siempre.
      gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer!);
      gl.useProgram(program);
      gl.enableVertexAttribArray(posLoc);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
      gl.uniform1f(locTime, 0);
      gl.uniform2f(locRes, MASTER_SIZE, MASTER_SIZE);
      gl.uniform1f(locAct, 0);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      const w = ctx2d.canvas.width;
      const h = ctx2d.canvas.height;
      ctx2d.clearRect(0, 0, w, h);
      ctx2d.drawImage(this.masterCanvas!, 0, 0, w, h);
      gl.deleteProgram(program);
      return true;
    }

    // Desfase pseudo-aleatorio estable por agente para que no sincronicen exacto.
    const seed = agent.id.charCodeAt(0) * 37 + agent.id.charCodeAt(agent.id.length - 1);
    const startTime = (typeof performance !== "undefined" ? performance.now() : 0) - seed;

    this.entries.set(id, {
      program,
      posLoc,
      locTime,
      locRes,
      locAct,
      targetRef,
      currentActivity: 0,
      startTime,
      ctx2d,
      isVisible: true,
    });
    this.ensureLoop();
    return true;
  }

  unregister(id: string) {
    const entry = this.entries.get(id);
    if (entry && this.gl) this.gl.deleteProgram(entry.program);
    this.entries.delete(id);
    if (this.entries.size === 0) this.stopLoop();
  }

  setVisible(id: string, visible: boolean) {
    const entry = this.entries.get(id);
    if (entry) entry.isVisible = visible;
  }

  private ensureLoop() {
    if (this.rafId) return;
    const tick = () => {
      this.rafId = requestAnimationFrame(tick);
      const gl = this.gl;
      if (!gl || !this.positionBuffer || !this.masterCanvas) return;

      gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
      const now = typeof performance !== "undefined" ? performance.now() : Date.now();

      this.entries.forEach((entry) => {
        entry.currentActivity += (entry.targetRef.current - entry.currentActivity) * 0.1;
        // Fuera de viewport y ya en reposo: salta el draw call de esta instancia.
        if (!entry.isVisible && entry.currentActivity < 0.01) return;

        const time = (now - entry.startTime) / 1000;
        gl.useProgram(entry.program);
        gl.enableVertexAttribArray(entry.posLoc);
        gl.vertexAttribPointer(entry.posLoc, 2, gl.FLOAT, false, 0, 0);
        gl.uniform1f(entry.locTime, time);
        gl.uniform2f(entry.locRes, MASTER_SIZE, MASTER_SIZE);
        gl.uniform1f(entry.locAct, entry.currentActivity);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        const w = entry.ctx2d.canvas.width;
        const h = entry.ctx2d.canvas.height;
        entry.ctx2d.clearRect(0, 0, w, h);
        entry.ctx2d.drawImage(this.masterCanvas!, 0, 0, w, h);
      });
    };
    this.rafId = requestAnimationFrame(tick);
  }

  private stopLoop() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = 0;
  }
}

const sharedRenderer = new SharedAgentRenderer();
let nextInstanceId = 0;

/**
 * Core neural WebGL de un agente. Renderiza el shader del agente proyectado
 * desde un contexto WebGL compartido (ver `SharedAgentRenderer` arriba) hacia
 * su propio canvas 2D. Degrada a un glow estático si WebGL no está disponible.
 * Con `prefers-reduced-motion` pinta un solo frame en vez de animar.
 */
export function AgentCore({
  agent,
  size = 120,
  active = false,
  className,
  style,
  ...props
}: AgentCoreProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const targetRef = React.useRef(0);
  const [supported, setSupported] = React.useState(true);
  const instanceIdRef = React.useRef<string | null>(null);
  if (!instanceIdRef.current) instanceIdRef.current = `agent-core-${nextInstanceId++}`;

  React.useEffect(() => {
    targetRef.current = active ? 1 : 0;
  }, [active]);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx2d = canvas.getContext("2d");
    if (!ctx2d) {
      setSupported(false);
      return;
    }

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    const id = instanceIdRef.current!;
    const ok = sharedRenderer.register(id, agent, ctx2d, targetRef, !!reduced);
    setSupported(ok);
    if (!ok) return;

    const observer =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(([entry]) => {
            sharedRenderer.setVisible(id, entry.isIntersecting);
          })
        : null;
    observer?.observe(canvas);

    return () => {
      observer?.disconnect();
      sharedRenderer.unregister(id);
    };
  }, [agent.glsl, agent.id]);

  const px = size;
  const res = size * 2; // doble resolución (retina)

  return (
    <div
      className={cn("relative rounded-full", className)}
      style={{
        width: px,
        height: px,
        // eslint-disable-next-line no-restricted-syntax -- glow de identidad del agente (WebGL), no tokenizable
        boxShadow: `0 0 30px ${agent.glow}, inset 0 0 10px rgba(0,0,0,0.5)`,
        ...style,
      }}
      {...props}
    >
      {supported ? (
        <canvas
          ref={canvasRef}
          width={res}
          height={res}
          className="block h-full w-full rounded-full"
          aria-hidden
        />
      ) : (
        // Fallback sin WebGL: glow radial estático con el color del agente.
        <div
          className="h-full w-full rounded-full"
          style={{
            background: `radial-gradient(circle at 50% 40%, ${agent.glow}, transparent 70%)`,
          }}
          aria-hidden
        />
      )}
    </div>
  );
}
