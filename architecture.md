# DATA MIRAGE architecture

## Purpose

Six investigations about chart baselines, biased samples, Simpson's paradox, optional stopping/multiple comparisons, correlation sensitivity/confounding, and bounded sampling uncertainty with computed outcomes. All datasets are explicitly synthetic; no real-world or medical measurements are implied.

## Structure

Independent static GitHub Pages site at /data-mirage/. dist/src/model.js owns the original pure calculations; dist/src/statistics.js owns pure investigation calculations and conditional mission judgments; dist/src/math.js owns pure validation and seeded pseudorandom helpers. dist/src/interpretation.js derives comparisons and complete synthetic-run exports; dist/src/exercises.js generates and evaluates six independent numerical exercises. dist/src/app.js owns UI, bounded inputs and page lifecycle; dist/src/investigations.js renders mission controls and computed evidence; dist/src/exercise-ui.js owns first-submission lifecycle; dist/src/progress.js is the sole storage boundary; dist/styles.css owns responsive presentation. Pure modules never import UI, storage or browser globals. Existing six investigations and all statistical calculations are retained.

The browser chooses a uint32 seed using crypto.getRandomValues; pure calculations use a deterministic LCG for reproducible finite synthetic observations. Each hunt has at most 12 streams × 80 flips × 161 experiments, including the current trial. Intervals have at most 200 replacement draws × 161 experiments. Correlation has 24 points and 24 leave-one-out calculations. Only visited missions are computed; current results are cached in page memory and invalidated by seed/settings changes. Same seeds/settings reproduce results; increasing stream count/sample size preserves observation prefixes. Seed replay does not reset control choices. Mathematical guarantees assume ideal independent draws and the stated fixed schedules; pseudorandom simulation frequencies are observations, not proofs of those guarantees.

No backend, account, tracking, cookies, external fonts or runtime API. Experiment inputs, seeds, exercise answers and results remain transient page memory. Explicit JSON download contains the current synthetic run, not visitor actions: up to 161 hunt trials × 12 streams × 80 observations; 161 interval trials × 200 draws; or 24 correlation coordinates and all 24 leave-one-out results. The browser caps UTF-8 output at 4 MiB, uses a temporary Blob URL and revokes it. Optional page-scoped WebMCP tools use the same validated state/actions as visible controls and feature-detect unsupported browsers. They cannot award progress.

## Approved device-local completion boundary (D08)

Only a first valid correct submission to a separately generated exercise earns its investigation ID. A wrong valid submission ends that attempt and reveals the calculation; another submission to the same attempt cannot earn progress. Invalid numeric input leaves the attempt open. Experiment visits, controls, examples, mission judgments and definitions do not award IDs. Six unique IDs are the complete durable evidence; there is no ranking, score history or completion badge on visiting.

`data-mirage-achievements-v1`: `{version:1,completed:[ID,...]}`, at most six allowlisted IDs, 512-character read cap. No answers, seeds, actions, names or timestamps. Existing durable IDs are merged on a subsequent successful award. No completion data is written on opening a fresh page.

`web-lab-progress-v1`: `{version:1,apps:{[repoId]:{completed,total,updatedAt}}}`. Each write rereads the actual private completion IDs and existing aggregate, validates the envelope and every record, and changes only data-mirage. Exactly 15 allowlisted repo IDs; integer bounds `0 <= completed <= total <= 1000`; canonical ISO timestamp from the actual current clock; 8192-character read cap. Own total is six. With no own durable IDs, only a stale own summary is removed. Other valid app records are preserved. The gallery reads this aggregate and cannot infer seeds or answers from it.

Explicit clear removes only the own private key and own aggregate entry. Blocked storage, malformed values, unsupported versions, unknown keys, quota errors and invalid clocks fail safely; corrupt shared values are not rewritten. Private persistence can succeed while aggregate persistence fails, and the UI reports that distinction. Corrupt private records require explicit own clear. The storage boundary grants no integrity guarantee against device-local edits. Read-modify-write is synchronous within one handler, not a cross-tab transaction; subsequent initialization/award recomputes own aggregate. D08 deliberately supersedes D02/D06's former blanket storage prohibition only for these two keys. Network, tracking, session storage, IndexedDB and cookies remain prohibited, enforced by focused checks.

No eval, user HTML injection or remote embeds. External links use noopener/noreferrer. CSP restricts connections and execution; GitHub hosting logs are separate. Only dist is deployed. UTF-8 without BOM / CRLF. Preserve all other repositories.

## Visual direction

ink/white editorial data-investigation desk. The working surface opens immediately; no marketing landing page ahead of controls. Keyboard controls, touch input, readable labels and reduced motion are part of the UI. Diagrams/canvas represent actual computed state rather than decorative or fictional results.
