# Trust model — the six agentic primitives

Duly is a design system for **agent-ops**: consoles that a CISO, an auditor and a
process operator must find *credible, operable and demonstrable* (see
[`NORTH_STAR.md`](../../NORTH_STAR.md)). Everything else in the system —
themeable tokens, dense tables, live states — exists to make that trust legible.

This guide names the **six trust primitives** every agentic surface should be
able to answer, and maps each one to the components that render it. Treat it as
the checklist an auditor walks: for any AI action on screen, can the operator
see *who did it, what they were allowed to do, what happened, where the data
came from, who signed off, and how to take it back?*

| # | Primitive | The question it answers | Regulatory anchor |
|---|---|---|---|
| 1 | **Agent identity** | *Who* acted — which agent, with what published capabilities? | Know-Your-Agent |
| 2 | **Permission scope** | What was this agent *allowed* to do? | least-privilege / RBAC |
| 3 | **Action history** | What actually *happened*, immutably recorded? | EU AI Act Art. 12 |
| 4 | **Data provenance** | Where did the *data* feeding an output come from? | EU AI Act Art. 12/13 |
| 5 | **Human approval** | Who *signed off* before a sensitive action ran? | human-in-the-loop |
| 6 | **Reversibility** | Can the action be *revoked or undone*, and at what blast radius? | fail-safe / rollback |

---

## 1. Agent identity — *who acted*

Every event carries an actor, and an agent actor is never anonymous: it has a
visual identity, a declared profile, and a discoverable capability document.

| Component | Role |
|---|---|
| `AgentCore` / `AgentGallery` | Per-agent WebGL identity (orbs), distinguishable at a glance |
| `AgentConsentCard` | Know-Your-Agent profile shown *before* a sensitive action |
| `A2AAgentCardViewer` | Renders an agent's A2A discovery doc (skills, auth, endpoints) |

Principle #5 ("actor duality on every event") means human vs. agent vs. system
must be distinguishable everywhere — see the actor icons in `RollbackTimeline`
and `RetryControls`.

## 2. Permission scope — *what it was allowed to do*

| Component | Role |
|---|---|
| `AgentConsentCard` | Explicit scope list (checkbox per permission) + configurable limits |
| `GuardrailIndicator` | Pass/warn/block against the policy that fired, expandable to the rule |
| `CredentialCard` | Credential type, owner, health, shared-with |

## 3. Action history — *what happened*

| Component | Role |
|---|---|
| `AuditLogTable` | Immutable event stream with `HashBadge` per record |
| `WhoDidWhatTimeline` | Actor-attributed chronological timeline |
| `TraceTree` | Nested spans (LLM/tool/agent/retrieval) with cost and tokens |
| `ExecutionHistoryConsole` / `RunInspector` | Read-only replay of any past run, node by node |
| `RetentionBadge` | How long the record is retained (EU AI Act Art. 19), WORM / legal-hold |

## 4. Data provenance — *where the data came from*

Two different questions, two different components:

- **`ModelProvenanceCard`** — *what model/prompt/config produced this output*
  (EU AI Act Art. 12/13). Model, version, prompt version, config hash.
- **`DataProvenanceCard`** — *what data fed this output* (data lineage). Each
  source declares its kind (`table` / `document` / `retrieval` / `api` /
  `user-input`), freshness, trust, and a snapshot hash. The card summarizes by
  the **worst** trust tone of its sources, so a single stale or unverified
  source is visible at a glance. An output with **no** declared provenance is
  rendered as a `warn` finding, not a neutral blank.

```tsx
import { DataProvenanceCard } from "@duly/ui";

<DataProvenanceCard
  sources={[
    { kind: "table", ref: "warehouse.transactions", trust: "ok", freshness: "live", hash: "sha256:1a2b3c4d5e" },
    { kind: "retrieval", ref: "policy-handbook.pdf#p12", trust: "ok", freshness: "snapshot Jun 2026" },
    { kind: "api", ref: "sanctions-screening.gov/v2", trust: "warn", freshness: "cached 41m" },
  ]}
/>
```

## 5. Human approval — *who signed off*

A principle of the DS: **an Approve button never goes naked** — it carries
evidence (what, why, blast radius, rollback).

| Component | Role |
|---|---|
| `ApprovalGateCard` | Evidence pack + approve/reject/escalate + timeout |
| `HumanInterruptQueue` | Inbox of paused runs awaiting review, ordered by risk then age |
| `ApprovalChainStepper` | Multi-approver chain with the rejection branch made visible |

## 6. Reversibility — *revoke or undo*

Three distinct operations, deliberately not conflated:

- **Re-run** a failed run — `RetryControls` (retry from start vs. from the
  failed node, manual vs. automatic).
- **Cut future authority** — the `revoked` state on `AgentConsentCard` and
  `CredentialCard` stops an agent acting *going forward*.
- **Undo a completed action** — **`RollbackTimeline`** reverses actions that
  already had an effect in the world. Each action declares its
  `reversibility` — `reversible` (clean undo), `compensating` (needs an inverse
  transaction, e.g. a wire reversal), or `irreversible` (e.g. an email already
  sent). "Revert to here" undoes everything after a chosen point, with an inline
  confirmation and an explicit **blast radius**; if the range crosses an
  irreversible action, the confirmation says so. An irreversible action is shown
  and its revert is blocked — never hidden.

```tsx
import { RollbackTimeline } from "@duly/ui";

<RollbackTimeline
  actions={[
    { id: "cp1", label: "Checkpoint: pre-disbursement", reversibility: "reversible", state: "restore-point", actorKind: "system", at: "10:02" },
    { id: "a2", label: "Sent wire transfer $48,200", reversibility: "compensating", actorKind: "agent", actor: "payments-agent", at: "10:03" },
    { id: "a3", label: "Emailed confirmation", reversibility: "irreversible", actorKind: "agent", actor: "notify-agent", at: "10:03" },
  ]}
  onRevertTo={(id) => revertRunTo(id)}
/>
```

---

## Coverage checklist

Use this when designing a new agentic surface — every AI action should let the
operator reach all six:

- [ ] **Identity** — is the acting agent named and profiled, not anonymous?
- [ ] **Scope** — is what it was allowed to do visible?
- [ ] **History** — is the action in an immutable, replayable record?
- [ ] **Data provenance** — can you trace the output back to its data sources?
- [ ] **Approval** — for sensitive actions, is the sign-off (and its evidence) shown?
- [ ] **Reversibility** — is it clear whether the action can be undone, and at what blast radius?
