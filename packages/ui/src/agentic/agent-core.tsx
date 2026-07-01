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

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type);
  if (!s) return null;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    // Shader inválido: no rompas la app, solo omite este core.
    console.error("[AgentCore] shader error", gl.getShaderInfoLog(s));
    gl.deleteShader(s);
    return null;
  }
  return s;
}

/**
 * Core neural WebGL de un agente. Renderiza el shader del agente en un canvas
 * circular. Degrada a un glow estático si no hay WebGL. Con `prefers-reduced-motion`
 * pinta un solo frame en vez de animar.
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

  React.useEffect(() => {
    targetRef.current = active ? 1 : 0;
  }, [active]);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false });
    if (!gl) {
      setSupported(false);
      return;
    }

    const program = gl.createProgram();
    const vs = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = compile(gl, gl.FRAGMENT_SHADER, buildFragmentShader(agent.glsl));
    if (!program || !vs || !fs) {
      setSupported(false);
      return;
    }
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    const posLoc = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const locTime = gl.getUniformLocation(program, "u_time");
    const locRes = gl.getUniformLocation(program, "u_resolution");
    const locAct = gl.getUniformLocation(program, "u_activity");

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let current = 0;
    // Desfase pseudo-aleatorio estable por agente para que no sincronicen exacto.
    const seed = agent.id.charCodeAt(0) * 37 + agent.id.charCodeAt(agent.id.length - 1);
    const start = (typeof performance !== "undefined" ? performance.now() : 0) - seed;

    const draw = (nowMs: number) => {
      current += (targetRef.current - current) * 0.1;
      const time = (nowMs - start) / 1000;
      gl.uniform1f(locTime, time);
      gl.uniform2f(locRes, canvas.width, canvas.height);
      gl.uniform1f(locAct, current);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(draw);
    };

    if (reduced) {
      // Un frame estático: sin loop de animación.
      current = targetRef.current;
      draw(start);
      cancelAnimationFrame(raf);
    } else {
      raf = requestAnimationFrame(draw);
    }

    return () => {
      cancelAnimationFrame(raf);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
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
