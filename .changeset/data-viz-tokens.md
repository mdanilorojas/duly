---
"@duly/tokens": minor
"@duly/ui": minor
---

Data-viz tokens (área D del NORTH_STAR): `--viz-cat-1..8` (paleta categórica CVD-safe, mismos 8 hues re-escalonados por superficie, ≥3:1 sobre los temas oscuros, gates permanentes de CVD/visión-normal/contraste/no-impersonación-de-status en el build test) y `--viz-seq-1..7` (rampa sequential con la hue del accent de cada tema, lightness monotónica), emitidos en los theme CSS, mapeados a utilidades Tailwind (`--color-viz-*`) y expuestos en el export JS `viz`. En `@duly/ui`: helpers `vizCat`/`vizSeq`/`vizCategorical` + story `Data-viz Tokens/V001` con swatches, reglas de uso (orden fijo, cap all-pairs, alert = status tokens) y demo aplicada con recharts + tabla accesible.
