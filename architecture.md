# DATA MIRAGE architecture

## Purpose

Six investigations about chart baselines, biased samples, Simpson's paradox, optional stopping/multiple comparisons, correlation sensitivity/confounding, and bounded sampling uncertainty with computed outcomes. All datasets are explicitly synthetic; no real-world or medical measurements are implied.

## Structure

Independent static GitHub Pages site at /data-mirage/. dist/src/model.js owns the original pure calculations; dist/src/statistics.js owns pure investigation calculations and conditional mission judgments; dist/src/math.js owns pure validation and seeded pseudorandom helpers. dist/src/app.js owns UI, bounded inputs and page lifecycle; dist/src/investigations.js renders the new mission controls and computed evidence; dist/styles.css owns responsive presentation. Pure seeded statistics fixtures -> charts and mission feedback; counts, denominators and axis labels remain explicit. Pure modules never import UI or browser globals. This extends the same calculation/UI boundary rather than adding a layer or service.

The browser chooses a uint32 seed using crypto.getRandomValues; pure calculations use a deterministic LCG for reproducible finite synthetic observations. Each hunt has at most 12 streams × 80 flips × 161 experiments, including the current trial. Intervals have at most 200 replacement draws × 161 experiments. Correlation has 24 points and 24 leave-one-out calculations. Only visited missions are computed; current results are cached in page memory and invalidated by seed/settings changes. Same seeds/settings reproduce results; increasing stream count/sample size preserves observation prefixes. Seed replay does not reset control choices. Mathematical guarantees assume ideal independent draws and the stated fixed schedules; pseudorandom simulation frequencies are observations, not proofs of those guarantees.

No backend, account, tracking, cookies, visitor persistence, external fonts or runtime API. Input and experiments are transient page memory; explicit image download is user-owned local output, not server storage. Optional page-scoped WebMCP tools use the same validated state/actions as the visible controls, and feature-detect unsupported browsers. Tool summaries contain no private image bytes.

No eval, user HTML injection or remote embeds. External links use noopener/noreferrer. CSP restricts connections and execution; GitHub hosting logs are separate. Only dist is deployed. UTF-8 without BOM / CRLF. Preserve all other repositories.

## Visual direction

ink/white editorial data-investigation desk. The working surface opens immediately; no marketing landing page ahead of controls. Keyboard controls, touch input, readable labels and reduced motion are part of the UI. Diagrams/canvas represent actual computed state rather than decorative or fictional results.
