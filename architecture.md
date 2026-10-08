# DATA MIRAGE architecture

## Purpose

Three interactive cases about chart baselines, biased samples and Simpson's paradox with computed outcomes.

## Structure

Independent static GitHub Pages site at /data-mirage/. dist/src/model.js owns pure calculation; dist/src/app.js owns UI, bounded inputs, playback and page lifecycle; dist/styles.css owns responsive presentation. pure seeded statistics fixtures -> charts and mission feedback; counts, denominators and axis labels remain explicit.

No backend, account, tracking, cookies, visitor persistence, external fonts or runtime API. Input and experiments are transient page memory; explicit image download is user-owned local output, not server storage. Optional page-scoped WebMCP tools use the same validated state/actions as the visible controls, and feature-detect unsupported browsers. Tool summaries contain no private image bytes.

No eval, user HTML injection or remote embeds. External links use noopener/noreferrer. CSP restricts connections and execution; GitHub hosting logs are separate. Only dist is deployed. UTF-8 without BOM / CRLF. Preserve all other repositories.

## Visual direction

ink/white editorial data-investigation desk. The working surface opens immediately; no marketing landing page ahead of controls. Keyboard controls, touch input, readable labels and reduced motion are part of the UI. Diagrams/canvas represent actual computed state rather than decorative or fictional results.
