---
"@duly/ui": minor
---

Trust model — dos componentes nuevos para completar los seis ejes agentic:

- `DataProvenanceCard`: procedencia de datos (data lineage) — qué fuente
  (table/document/retrieval/api/user-input) alimentó un output, con frescura,
  verificación y hash de snapshot; resume por el peor tono de confianza.
  Hermano de `ModelProvenanceCard`.
- `RollbackTimeline`: línea de tiempo de reversibilidad — deshace acciones ya
  ejecutadas con `reversibility` (reversible/compensating/irreversible),
  dualidad de actor, puntos de restauración y "revert to here" con confirmación
  inline y blast-radius explícito.

Nueva guía `docs/guides/trust-model.md` que mapea los seis ejes (identidad,
alcance, historial, procedencia, aprobación, reversibilidad) a los componentes
del DS.
