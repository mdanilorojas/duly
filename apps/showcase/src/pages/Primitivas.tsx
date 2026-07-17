import { useState } from "react";
import { CalendarDate } from "@internationalized/date";
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Checkbox,
  RadioGroup,
  RadioGroupItem,
  Switch,
  Textarea,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Separator,
  Alert,
  AlertTitle,
  AlertDescription,
  Skeleton,
  ErrorState,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  AppTopbar,
  TopbarIconButton,
  CommandPalette,
  useCommandPalette,
  EnvironmentBadge,
  useDataTable,
  DataTable,
  FilterBar,
  SavedViews,
  DateRangePicker,
  vizCat,
  vizSeq,
  VIZ_CAT_SLOTS,
  VIZ_SEQ_STEPS,
  type CommandPaletteItem,
  type ColumnDef,
  type DateRange,
} from "@enregla-ui/duly-ui";
import { Bell } from "lucide-react";

const sectionLabelStyle: React.CSSProperties = {
  fontSize: "0.78rem",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  color: "var(--faint)",
  marginBottom: "0.8rem",
  fontFamily: "var(--font-mono)",
};

const cardStyle: React.CSSProperties = {
  border: "1px solid var(--border-default)",
  borderRadius: "0.5rem",
  background: "var(--surface-2)",
  padding: "1rem",
};

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 style={sectionLabelStyle}>{label}</h2>
      <div style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: "1rem" }}>{children}</div>
    </div>
  );
}

interface Proveedor {
  id: string;
  nombre: string;
  categoria: string;
  riesgo: "bajo" | "medio" | "alto";
  contrato: string;
}

const proveedores: Proveedor[] = [
  { id: "p1", nombre: "Acme Cloud", categoria: "Infraestructura", riesgo: "bajo", contrato: "2027-03-01" },
  { id: "p2", nombre: "Northwind Legal", categoria: "Legal", riesgo: "medio", contrato: "2026-11-15" },
  { id: "p3", nombre: "Zenith Payroll", categoria: "RRHH", riesgo: "alto", contrato: "2026-08-30" },
  { id: "p4", nombre: "Vertex Analytics", categoria: "Datos", riesgo: "medio", contrato: "2027-01-20" },
  { id: "p5", nombre: "Solstice Security", categoria: "Seguridad", riesgo: "bajo", contrato: "2026-12-05" },
  { id: "p6", nombre: "Halcyon CRM", categoria: "Ventas", riesgo: "medio", contrato: "2027-05-10" },
];

const proveedorColumns: ColumnDef<Proveedor>[] = [
  { accessorKey: "nombre", header: "Proveedor" },
  { accessorKey: "categoria", header: "Categoría" },
  { accessorKey: "riesgo", header: "Riesgo" },
  { accessorKey: "contrato", header: "Renovación" },
];

const commandItems: CommandPaletteItem[] = [
  { id: "c1", label: "Ir a Compliance", group: "Navegación", onSelect: () => {} },
  { id: "c2", label: "Ir a Comercial", group: "Navegación", onSelect: () => {} },
  { id: "c3", label: "Nuevo proveedor", group: "Acciones", onSelect: () => {} },
];

function DataTableDemo() {
  const table = useDataTable<Proveedor>({ data: proveedores, columns: proveedorColumns, getRowId: (r) => r.id });
  return (
    <DataTable
      table={table}
      caption="Proveedores bajo evaluación"
      toolbar={
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem", justifyContent: "space-between" }}>
          <FilterBar
            table={table}
            fields={[
              { columnId: "nombre", kind: "text", label: "Buscar proveedor", placeholder: "Buscar…" },
              {
                columnId: "riesgo",
                kind: "select",
                label: "Riesgo",
                options: [
                  { value: "bajo", label: "Bajo" },
                  { value: "medio", label: "Medio" },
                  { value: "alto", label: "Alto" },
                ],
              },
            ]}
          />
          <SavedViews table={table} storageKey="showcase-proveedores" density="comfortable" />
        </div>
      }
    />
  );
}

function CommandPaletteDemo() {
  const { open, setOpen } = useCommandPalette();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Abrir command palette (⌘K)
      </Button>
      <CommandPalette open={open} onOpenChange={setOpen} items={commandItems} placeholder="Buscar comando…" />
    </div>
  );
}

export function Primitivas() {
  const [range, setRange] = useState<DateRange | null>({
    start: new CalendarDate(2026, 6, 1),
    end: new CalendarDate(2026, 6, 30),
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: 1100, margin: "0 auto" }}>
      <div>
        <h1 style={{ fontSize: "1.3rem", fontWeight: 700 }}>Primitivas</h1>
        <p style={{ color: "var(--dim)", marginTop: "0.3rem" }}>
          Todos los building blocks del sistema de diseño, en un solo lugar.
        </p>
      </div>

      <Section label="Formularios">
        <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <Label htmlFor="p-nombre">Nombre</Label>
            <Input id="p-nombre" placeholder="Ada Lovelace" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <Label htmlFor="p-categoria">Categoría</Label>
            <Select defaultValue="datos">
              <SelectTrigger id="p-categoria">
                <SelectValue placeholder="Elegir…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="infra">Infraestructura</SelectItem>
                <SelectItem value="datos">Datos</SelectItem>
                <SelectItem value="legal">Legal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Checkbox id="p-check" defaultChecked />
            <Label htmlFor="p-check">Notificar al equipo</Label>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Switch id="p-switch" defaultChecked />
            <Label htmlFor="p-switch">Modo automático</Label>
          </div>
        </div>
        <RadioGroup defaultValue="medio" style={{ display: "flex", gap: "1.2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <RadioGroupItem value="bajo" id="r-bajo" />
            <Label htmlFor="r-bajo">Riesgo bajo</Label>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <RadioGroupItem value="medio" id="r-medio" />
            <Label htmlFor="r-medio">Riesgo medio</Label>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <RadioGroupItem value="alto" id="r-alto" />
            <Label htmlFor="r-alto">Riesgo alto</Label>
          </div>
        </RadioGroup>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <Label htmlFor="p-notas">Notas de la evaluación</Label>
          <Textarea id="p-notas" placeholder="Escribe hallazgos, mitigaciones, próximos pasos…" />
        </div>
        <DateRangePicker
          timeZone="America/Guayaquil"
          value={range}
          onChange={setRange}
          description="Ventana de evidencia — usada por exportes de auditoría"
        />
      </Section>

      <Section label="Superposiciones">
        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Abrir diálogo</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirmar renovación</DialogTitle>
                <DialogDescription>Esto renueva el contrato con Acme Cloud por 12 meses más.</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="secondary">Cancelar</Button>
                <Button variant="default">Confirmar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">Abrir panel lateral</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Detalle del proveedor</SheetTitle>
                <SheetDescription>Zenith Payroll · Riesgo alto · Renueva 2026-08-30.</SheetDescription>
              </SheetHeader>
              <SheetFooter>
                <Button variant="default">Ver contrato</Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Acciones ▾</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Proveedor</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Ver evidencia</DropdownMenuItem>
              <DropdownMenuItem>Reasignar dueño</DropdownMenuItem>
              <DropdownMenuItem>Archivar</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Section>

      <Section label="Layout">
        <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
          <Card>
            <CardHeader>
              <CardTitle>Zenith Payroll</CardTitle>
              <CardDescription>Riesgo alto · categoría RRHH</CardDescription>
            </CardHeader>
            <CardContent>
              <p style={{ fontSize: "0.85rem", color: "var(--dim)" }}>
                Renovación en 46 días. Evidencia SOC 2 pendiente de subir.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="secondary">Ver evidencia</Button>
            </CardFooter>
          </Card>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            <p style={{ fontSize: "0.85rem" }}>Sección A</p>
            <Separator />
            <p style={{ fontSize: "0.85rem" }}>Sección B</p>
          </div>
        </div>
      </Section>

      <Section label="Retroalimentación">
        <Alert variant="warn">
          <AlertTitle>Evidencia por vencer</AlertTitle>
          <AlertDescription>3 proveedores tienen certificados que vencen este trimestre.</AlertDescription>
        </Alert>
        <div style={{ display: "flex", gap: "0.6rem", flexDirection: "column", maxWidth: 320 }}>
          <Skeleton style={{ height: "1rem", width: "100%" }} />
          <Skeleton style={{ height: "1rem", width: "70%" }} />
        </div>
        <ErrorState
          variant="subtle"
          title="No se pudo cargar el historial"
          description="Reintenta en unos segundos o contacta a plataforma."
          action={<Button variant="outline">Reintentar</Button>}
        />
      </Section>

      <Section label="Visualización">
        <Accordion type="single" collapsible defaultValue="a1">
          <AccordionItem value="a1">
            <AccordionTrigger>¿Qué pasa si un proveedor no responde?</AccordionTrigger>
            <AccordionContent>
              Se escala a Deal Desk y se marca el contrato como "en riesgo" hasta obtener respuesta.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="a2">
            <AccordionTrigger>¿Con qué frecuencia se revisa el riesgo?</AccordionTrigger>
            <AccordionContent>Trimestralmente, o al detectar un incidente de seguridad reportado.</AccordionContent>
          </AccordionItem>
        </Accordion>

        <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
          <Avatar>
            <AvatarImage src="" alt="Ada Lovelace" />
            <AvatarFallback>AL</AvatarFallback>
          </Avatar>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span style={{ fontSize: "0.85rem", textDecoration: "underline dotted", cursor: "help" }}>
                  Ada Lovelace
                </span>
              </TooltipTrigger>
              <TooltipContent>Dueña de la relación · Deal Desk</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <Tabs defaultValue="resumen">
          <TabsList>
            <TabsTrigger value="resumen">Resumen</TabsTrigger>
            <TabsTrigger value="contratos">Contratos</TabsTrigger>
            <TabsTrigger value="incidentes">Incidentes</TabsTrigger>
          </TabsList>
          <TabsContent value="resumen">6 proveedores activos, 1 en riesgo alto.</TabsContent>
          <TabsContent value="contratos">Próxima renovación: Zenith Payroll, 2026-08-30.</TabsContent>
          <TabsContent value="incidentes">Sin incidentes abiertos este trimestre.</TabsContent>
        </Tabs>
      </Section>

      <Section label="Chrome de aplicación">
        <AppTopbar
          breadcrumbs={[{ label: "Proveedores" }, { label: "Zenith Payroll" }]}
          actions={
            <>
              <EnvironmentBadge environment="staging" />
              <TopbarIconButton icon={Bell} label="Notificaciones" count={2} />
            </>
          }
        />
        <CommandPaletteDemo />
      </Section>

      <Section label="Tabla de datos">
        <DataTableDemo />
      </Section>

      <Section label="Fundamentos: tokens de data-viz">
        <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
          <div>
            <p style={{ fontSize: "0.78rem", color: "var(--faint)", fontFamily: "var(--font-mono)", marginBottom: "0.4rem" }}>
              Categórico · {VIZ_CAT_SLOTS} slots, orden fijo (seguridad CVD)
            </p>
            <div style={{ display: "flex", gap: "0.4rem" }}>
              {Array.from({ length: VIZ_CAT_SLOTS }, (_, i) => (
                <div
                  key={i}
                  title={`viz-cat-${i + 1}`}
                  style={{ width: 32, height: 32, borderRadius: "0.35rem", background: vizCat(i + 1) }}
                />
              ))}
            </div>
          </div>
          <div>
            <p style={{ fontSize: "0.78rem", color: "var(--faint)", fontFamily: "var(--font-mono)", marginBottom: "0.4rem" }}>
              Sequential · {VIZ_SEQ_STEPS} pasos
            </p>
            <div style={{ display: "flex", gap: "0.4rem" }}>
              {Array.from({ length: VIZ_SEQ_STEPS }, (_, i) => (
                <div
                  key={i}
                  title={`viz-seq-${i + 1}`}
                  style={{ width: 32, height: 32, borderRadius: "0.35rem", background: vizSeq(i + 1) }}
                />
              ))}
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
