# Studio DS conventions (@studio/ui)

## Theme

All components assume `data-theme="cockpit"` on an ancestor element. The design system is dark-first — do not use components on a white/light background. The `PreviewWrapper` applies this automatically.

```jsx
// Always wrap in PreviewWrapper (provides data-theme="cockpit" + CSS custom properties)
<PreviewWrapper>
  <YourDesign />
</PreviewWrapper>
```

## Bundle access

```js
const { Button, Badge, Card, TraceLog, ... } = window.StudioUi;
```

## Groups + when to use each

| Group | Components | Use for |
|-------|-----------|---------|
| `primitives` | Button, Badge, Checkbox, Input, Label, RadioGroup, Select, Switch, Textarea | Form controls and atomic UI |
| `display` | Accordion, Avatar, Tabs, Tooltip | Interactive display patterns |
| `feedback` | Alert, Progress, Skeleton | System state communication |
| `layout` | Card, Separator | Layout structure |
| `overlay` | Dialog, DropdownMenu, Sheet | Contextual overlays |
| `agent-ops` | TraceLog | Agent/pipeline log timelines |

## TraceLog — compound component

TraceLog is the only non-shadcn component. It uses a compound pattern:

```jsx
<TraceLog.Root density="comfortable" streaming={false}>
  <TraceLog.Header title="Pipeline run" hint="4 stages" />
  <TraceLog.Body maxHeight={400}>
    <TraceLog.Row tone="ok" agent="Geocoder" step="1/4" timestamp="00:01">
      138 records processed
    </TraceLog.Row>
    <TraceLog.Row tone="warn" agent="Validator" step="2/4">
      3 records failed geometry check
    </TraceLog.Row>
  </TraceLog.Body>
</TraceLog.Root>
```

`tone` values: `info` (default), `ok` (green), `review` (cyan), `warn` (yellow), `block` (red).
Use `streaming={true}` on live/updating logs to enable `aria-live="polite"`.

## Button variants

```jsx
<Button variant="default">Primary</Button>      // teal fill
<Button variant="secondary">Secondary</Button>  // muted fill
<Button variant="outline">Outline</Button>      // border only
<Button variant="ghost">Ghost</Button>          // no border, hover only
<Button variant="destructive">Delete</Button>   // red fill
<Button variant="link">Link</Button>            // text only
```

Sizes: `xs` `sm` `default` `lg` — icon variants: `icon-xs` `icon-sm` `icon` `icon-lg`.

## Alert tones

```jsx
<Alert variant="default">Info message</Alert>
<Alert variant="destructive">Error message</Alert>
```

## Card compound

```jsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
  <CardFooter><Button>Action</Button></CardFooter>
</Card>
```

## Color + typography tokens

Use CSS custom properties (defined under `[data-theme="cockpit"]` in `styles.css`). Verified token names:

**Surfaces / background**
- `--bg-base` — primary page background
- `--bg-elevated` — elevated background
- `--surface-2` — card / panel surface
- `--surface-3` — raised surface
- `--surface-sunken` — inset surface
- `--surface-header` — header strip

**Text**
- `--ink` — primary text (near-white)
- `--dim` — secondary text
- `--faint` — tertiary / disabled text

**Borders** (default border-color is applied to every element via the `components` layer)
- `--border-subtle` — default border
- `--border-default`, `--border-strong`, `--border-divider` — heavier / divider borders

**Accent + state**
- `--accent` — primary teal accent (primary actions)
- `--accent-secondary` — violet accent
- `--ok` green, `--warn` yellow, `--block` red (destructive), `--review` cyan, `--info` — status tones (each has a matching `--on-*` for text-on-tone, e.g. `--on-block`)

**Radius**
- `--radius-2xl` (1rem) plus the Tailwind radius scale `--radius-xs … --radius-2xl` — component corner radius

Monospace: apply the `font-mono` utility class (JetBrains Mono; falls back to system monospace — no woff2 ships, so `var(--font-mono)` is not a resolvable custom property).
