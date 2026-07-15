// Diccionario canónico de copy — inglés, el default sin configuración (ver
// context.tsx: CopyProvider). Namespaces compartidos (common/tone/nodeStatus/
// approvalStatus) antes que namespaces por componente, para que frases
// repetidas (Approve, Reject, Acknowledge...) no se dupliquen entre
// componentes que ya comparten el vocabulario de 5 tonos / 6 estados.
export const enCopy = {
  common: {
    approve: "Approve",
    reject: "Reject",
    escalate: "Escalate",
    acknowledge: "Acknowledge",
    loading: "Loading…",
    confirm: "Confirm",
    cancel: "Cancel",
  },
  tone: {
    info: "info",
    ok: "ok",
    review: "review",
    warn: "warning",
    block: "block",
  },
  nodeStatus: {
    success: "Success",
    error: "Failed",
    running: "Running",
    waiting: "Waiting",
    retrying: "Retrying",
    skipped: "Skipped",
  },
  nodeStatusBadge: {
    retryAttempt: (statusLabel: string, current: number, max: number) =>
      `${statusLabel}, attempt ${current} of ${max}`,
    legendHint: {
      success: "solid",
      running: "animated dashed",
      retrying: "animated dashed, red",
      waiting: "dashed, slow pulse",
      error: "solid, red",
      skipped: "thin dotted, dim",
    },
  },
  approvalStatus: {
    pending: { label: "Pending review", verb: "Requested" },
    approved: { label: "Approved", verb: "Approved" },
    rejected: { label: "Rejected", verb: "Rejected" },
    escalated: { label: "Escalated", verb: "Escalated" },
    expired: { label: "Expired — no reviewer", verb: "Expired" },
  },
  approvalGateCard: {
    requestAriaLabel: (action: string, riskLabel: string) => `Approval request: ${action} — ${riskLabel}`,
    expiresIn: (time: string) => `expires in ${time}`,
    what: "What",
    why: "Why",
    blastRadius: "Blast radius",
    rollback: "Rollback",
    decidedBy: (verb: string, by: string) => `${verb} by ${by}`,
    confirmApprove: (action: string) => `Approve "${action}"? This can't be undone.`,
  },
  humanInterruptQueue: {
    title: "Human review queue",
    empty: "No actions awaiting review.",
    pending: "pending",
    critical: "critical",
    expiresIn: (t: string) => `expires ${t}`,
  },
  tokenCostMeter: {
    title: "Cost",
    budgetSuffix: (b: string) => `of ${b} budget`,
    budgetUsed: "Budget used",
    costBreakdown: "Cost breakdown",
  },
  alarmBanner: {
    noActive: "No active alarms",
    unacknowledged: (n: number) => `${n} unacknowledged`,
  },
  streamingMessage: {
    thinking: "Thinking…",
  },
  dataTable: {
    empty: "No data.",
  },
  filterBar: {
    allOption: "All",
    searchPlaceholder: (label: string) => `Filter ${label.toLowerCase()}…`,
  },
  savedViews: {
    nameLabel: "View name",
    namePlaceholder: "View name…",
    save: "Save view",
    savedViewsLabel: "Saved views",
    remove: (name: string) => `Remove view ${name}`,
  },
  agentTopologyGraph: {
    defaultAriaLabel: "Agent topology",
    loadingGraph: "Loading graph…",
  },
  relationshipMap: {
    defaultAriaLabel: "Relationship map",
  },
  auditLogTable: {
    emptyLabel: "No audit events in this range.",
    captionSuffix: (title: string) => `${title}: immutable action log by actor`,
  },
  whoDidWhatTimeline: {
    emptyLabel: "No activity for this saved query.",
  },
  approvalChainStepper: {
    approved: "Approved",
    rejected: "Rejected",
    pending: "Pending",
    escalated: "Escalated",
    unreached: "not reached",
  },
  alarmSummaryTable: {
    priority: "Priority",
    description: "Description",
    area: "Area",
    time: "Time",
    actions: "Actions",
    acknowledge: (tag: string) => `Acknowledge ${tag}`,
    shelve: (tag: string) => `Shelve ${tag}`,
    defaultCaption: "Active alarms",
  },
  processValueTile: {
    outOfLimit: "Out of limit",
  },
  oeeWaterfall: {
    title: "OEE — production losses",
  },
  autonomyModeSwitch: {
    levelGroupLabel: "Autonomy level",
    confirmRaise: (levelLabel: string) => `Raise autonomy to ${levelLabel}?`,
    confirm: "Confirm",
    cancel: "Cancel",
  },
  evidenceExportDialog: {
    title: "Export signed evidence",
    description: (recordCount: string, range: string) =>
      `You'll export ${recordCount} records from ${range} with a hash manifest that certifies their integrity.`,
    generating: "Generating signed export…",
    ready: "Export ready — verified",
    errorSuffix: "— retry or check your signing configuration.",
    manifest: "Manifest:",
    download: "Download file",
    close: "Close",
  },
  errorState: {
    defaultTitle: "Something went wrong.",
  },
  modelProvenanceCard: {
    model: "Model",
    modelVersion: "Model version",
    provider: "Provider",
    promptVersion: "Prompt version",
    temperature: "Temperature",
    configHash: "Config hash",
    details: "Details",
  },
  appShell: {
    skipToContent: "Skip to content",
    navigation: "Navigation",
    openNavigation: "Open navigation",
    collapseSidebar: "Collapse sidebar",
    expandSidebar: "Expand sidebar",
    breadcrumbs: "Breadcrumbs",
    workspaces: "Workspaces",
    search: "Search…",
    density: "Density",
    densityComfortable: "Comfortable density",
    densityCompact: "Compact density",
    withCount: (label: string, count: number) => `${label} (${count})`,
    commandPalette: {
      title: "Command palette",
      placeholder: "Type a command or search…",
      empty: "No results found.",
    },
    environment: {
      production: "Production",
      staging: "Staging",
      development: "Development",
      sandbox: "Sandbox",
    },
  },
  dateRangePicker: {
    label: "Date range",
    openCalendar: "Open calendar",
    timezoneNote: (tz: string) => `Times shown in ${tz}`,
    presets: {
      label: "Quick ranges",
      last7: "Last 7 days",
      last30: "Last 30 days",
      monthToDate: "Month to date",
      quarterToDate: "Quarter to date",
    },
  },
};
