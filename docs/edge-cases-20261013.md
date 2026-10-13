# DATA MIRAGE edge-case audit — 2026-10-13

This systematic edge-case audit is distinct from the earlier maintenance. Evidence is LOCAL only. No commit/push/deploy, gallery/ranking edit, delegation, provider/cost, schema/retention, bank-version, scoring or science-content change occurred.

All three named repositories were inventoried before implementation. Only the owned repository files were edited. The supplied AGENTS and architecture > api-spec > requirements > README precedence apply.

## Commands and evidence levels

N identifiers map to exact new Node test names in the catalog. They execute under npm test and the existing verify workflow. DOM doubles are labeled; they are not browser/layout evidence. B identifiers map to tools/edge-browser.mjs. Current CI runs npm test and npm run check; **it does not execute this manual browser harness**.

Browser prerequisites verified/reused: ../output/playwright/implement-20261012/package.json, Playwright1.61.1 and C:/Program Files/Google/Chrome/Application/chrome.exe. No dependency/install/CI change. PLAYWRIGHT_PACKAGE can override the installed package.json; CHROME_PATH can override the executable.

Start node tools/serve.mjs 0 in a persistent session. In PowerShell set $env:EDGE_URL='http://127.0.0.1:<printed-port>/' then run node --test tools/edge-browser.mjs. The harness requires loopback, uses isolated headed Chrome with audio muted, fresh QA contexts, and closes its own browser. No personal browser profile/records accessed.

Functional paths use actual typing, clicks, selects and keyboard input. Composition/detached controls, quota/denial, delayed/rejected files deliberately inject labeled events/failures. They are not naturally occurring quota exhaustion, real OS IME, or mobile hardware proof. Existing reusable QA flows were read/adapted; element-atlas additionally executes its existing qa-import.js.

Captures:1440×1000/390×844/320×780; numeric page-overflow checks passed. Selected desktop initial/mobile feedback/result/experiment/lesson captures were visually reviewed. Sites are scrollable documents; this is not an exhaustive visual review of all states.

## Inventory and source coverage

Clean main baseline HEADf290148c4c7465edb7954d202d2f5e5ddf4e7206;33tracked files,appendix. Root:dist/src,docs,test,tools,.github,ignored output/.playwright-cli. api-spec.md/requirements.md/repository AGENTS.md absent.

VERIFIED full authoritative reads:architecture/README/decisions,package/.gitattributes/.gitignore/workflow. VERIFIED relevant source/tests:curriculum/problem-bank/study-ui,exercises/exercise-ui/progress,model/math/statistics/interpretation,app/ui/investigations,focused tests/tools/check/serve. Root review-20261009/data-qa.mjs read. Repository overall PARTIAL:older verification appendices and presentation/CSS selected,not expert certification of prose. .git/dependencies,siblings/gallery/ranking/publicsite NOT_INSPECTED.

## Results / failures-before / fixes-after

npm test **54/54 PASS**,fail/skip/todo0:43existing+11new (8pure+3labeledDOM doubles). Manual browser **7/7 PASS**. npm run check/git diff --check PASS after normalization.

Unchanged study-ui: $env:EDGE_URL='http://127.0.0.1:63148/'; node --test --test-name-pattern='stale next' tools/edge-browser.mjs failed B1: late next must preserve new problem and inputs. Expected new pooledprompt A12/13/9;B18/19/12,actual anotherprompt A7/17/5;B8/24/4 after detachedprior next.

Minimalfix: result next callback owns submittedchallenge and advances only while it is current and closed. The same B1 assertion passed in the full seven-case harness. N9 retains lifecycle regression in Node CI;its firstexecution was afterfix,not separateRED_GREEN. Pure/model/storage cases passed unchangedproduction. Harness initially included trailingperiod in correlation numericwitness;decimal regex corrected,no exercise/grade change or weakened assertion.

## Feature/boundary matrix

|Feature|Cases|Actual tests/results|Remaining|
|---|---|---|---|
|Curriculum/transitions|lesson→problem→concept→sameclosedattempt;experiment transition|N10,B4;existing 18 lessons and 24 families connect to valid levels, checks and primary references VERIFIED|All18checkUI NOT_RUN|
|24type grading/generation|24×64seeds,canonical injectedfield immunity,independent probability/moment/optimization|N2;existing problem-bank tests;B4paired micro-observation oracle for pooled moments VERIFIED|All24browseranswers/allseeds NOT_RUN|
|Numeric input|signedfraction/exponent,48chars,±1e8,49chars/justoutside,empty/type/nonfinite/zerodenominator|N1,N2;existing canonical grading ignores answer injection and rejects invalid numeric expressions;B4 VERIFIED|Everyparserexpression NOT_RUN|
|Submission/repeat/late|invalidsecond open,wrongfirst closesonce,duplicateignored,oldnext cannotreplace freshattempt|N2,N9,N10;B1,B2,B4 VERIFIED|OSIME/everyinterleave NOT_RUN|
|History/scratch|13submissions retainlast12,next clears scratch,navigationkeepscounts|N11;B2 VERIFIED|maxLength6000inspected,programmaticoversize NOT_RUN|
|Axis|0/51,outside/nonfinite,growthinvariant,actual Home/End|N4;existing axis truncation changes displayed ratio, not underlying growth;exploration VERIFIED|Coercible auxiliaryinputs semantics unchanged|
|Sampling|n5/80allmodes,4/81/fraction/string/nonfinite reject,uniqueness/immutability/mean|N4,N6;existing samples are reproducible, unique, bounded and do not mutate population;high80/resampleexploration VERIFIED|Everypopulationseed NOT_RUN|
|Simpson|all10/80corners,denominator90,offstep/outside/type/nonfinite,balanced→reversal|N4;existing Simpson reversal disappears with balanced condition counts;exploration VERIFIED|Everybrowser slidercombination NOT_RUN|
|Hunt|seed1/uint32max,1/12metrics,prefixes,n1/80coin,independentconvolution/stoppingoracle|N5,N6;existing statistics tests;B5raw79/160→corrected3/160 VERIFIED|Allcampaignseeds NOT_RUN|
|Correlation|empty/onepoint/nonfinite reject,constant r=null,independentanalytic/leaveoneout/worldviewchanges|N5;existing Pearson handles analytic correlations, translation/scaling invariance and undefined coordinates;B5 VERIFIED|Externalcoordinateimports N/A|
|Interval|n1/200,s0/n,outside invalid,20/200prefix,biasedpool,clipping/exactcoverage|N5,N6;existing exact Bernoulli coverage satisfies the advertised bound at every exposed size and confidence;B5/exploration VERIFIED|Othermodel N/A|
|Six separate exercises|±1000/32chars valid,33/outside/nonfinite reject,wrongclosed,newcorrectaward,missionchangesdiscard|N3;existing independent exercises have executable solutions calculated from their displayed evidence;B3,B6 VERIFIED|Allsix fullbrowserawardcycles NOT_RUN|
|Storage/aggregate|512/513private,8192/8193shared,malformed/version/quota/clock,15allowlist,write→deniedreadback partial|N7,N8;existing progress tests;B6,B7 VERIFIED|Crosstabatomicity NOT_RUN|
|Reset/cancel/restore/isolation|ownclear only,exact siblingbytes,durable reload,mission reset|N8;B3,B6 VERIFIED|Undo/import/cancel-dialog N/A:notprovided|
|Export|allrawreplications,4MiBbound,actualcorrelationJSONseed42|existing largest supported trace stays below the 4 MiB download cap / trace contains every current and repeated observation and replays all actual calculations;B5 VERIFIED|OSdownloadcancel/diskfull NOT_RUN|
|Keyboard/focus/mobile|formEnter,tabHome/Endfocus,select/range,3viewports|B4,B5,B6 VERIFIED|OSIME/touch/screenreader/otherbrowsers NOT_RUN|
|Malformed/oversizedimport/remoteasync|no inboundfile/import/remote service|N/A|Learningdesk staysmemoryonly|
|WebMCP|validatedwrappers/fallback inspected|PARTIAL|Native runtime NOT_RUN|

Actual exploratory UI (~54secspan):axis endpoints,high80sample/resample,balanced/reversal,huntsignal/fixed/Bonferroni,interval20/99%/biased,LRTinvalid thenwrong,review/scratchreset. No visible overlap/illegible feedback in reviewed captures. Synthetic calculations are not empirical statistics or actual scientific-population observations.

## Changes / evidence / integration

dist/src/study-ui.js;new test/edge-cases.test.js,test/study-ui.test.js,tools/edge-browser.mjs;docs/decisions.md,docs/verification.md,thisreport. Purecalculations/expectedanswers/curriculum/storagekeys/totals/retention unchanged.

Ignored output/playwright/edge-20261013:initial/answer/experiment-{1440,390,320}.png,correlation.json,red-green.txt. No nominal visual or layout change; thumbnail refresh is unnecessary. Node22.23.2,UTF8/noBOM/CRLF,diff checks verified. Ownbrowser/server closed. N9–N11 execute in Node CI; the browser harness is manual. REMOTE_CI/LIVE/DEPLOY NOT_RUN;The parent handles integration and release.

## Exact new test catalog

- N1 — `edge: numeric parser signed fraction/exponent, exact length and magnitude boundaries` — test/edge-cases.test.js — PASS
- N2 — `edge: invalid second answer does not mutate grading inputs and corrected resubmit uses canonical problem` — test/edge-cases.test.js — PASS
- N3 — `edge: exercise input endpoints are valid attempts, just outside and nonfinite keep attempt open` — test/edge-cases.test.js — PASS
- N4 — `edge: axis/sample/Simpson min and max cases retain independent totals and input snapshots` — test/edge-cases.test.js — PASS
- N5 — `edge: fair coin n=1/80 and interval n=1/200 validate just-outside counts and clipping` — test/edge-cases.test.js — PASS
- N6 — `edge: uint32 endpoint streams/sample prefixes survive maximum workload and remain immutable` — test/edge-cases.test.js — PASS
- N7 — `edge: private/shared read caps accept exact boundary and reject one-over without overwriting` — test/edge-cases.test.js — PASS
- N8 — `edge: private write followed by denied readback reports partial durability; denied remove keeps siblings` — test/edge-cases.test.js — PASS
- N9 — `edge DOM double: stale next after navigation cannot discard an active problem` — test/study-ui.test.js — PASS
- N10 — `edge DOM double: invalid second field leaves attempt open then wrong first submission closes once` — test/study-ui.test.js — PASS
- N11 — `edge DOM double: review retains twelve recent solutions and next resets scratch` — test/study-ui.test.js — PASS
- B1 — `edge-browser: stale next callback cannot discard a fresh problem` — tools/edge-browser.mjs — PASS
- B2 — `edge-browser: review history cap, scratch reset, wrong terminal attempt and repeated next` — tools/edge-browser.mjs — PASS
- B3 — `edge-browser: changing investigation discards pending exercise without durable award` — tools/edge-browser.mjs — PASS
- B4 — `edge-browser: pooled independent microdata oracle, invalid and repeated submissions, lesson transitions` — tools/edge-browser.mjs — PASS
- B5 — `edge-browser: invalid seed preserves experiment, keyboard tabs, six controls and actual download` — tools/edge-browser.mjs — PASS
- B6 — `edge-browser: first wrong exercise closes, new correct award reloads, clear preserves sibling` — tools/edge-browser.mjs — PASS
- B7 — `edge-browser: denied storage still permits exercise with failure disclosure` — tools/edge-browser.mjs — PASS

## Baseline tracked inventory (names only)

Inventory does not imply every auxiliary file was fully read. Ignored QA output, dependencies and .git were not recursively reviewed. New audit files are listed above.

```text
.gitattributes
.github/workflows/pages.yml
.gitignore
README.md
architecture.md
dist/index.html
dist/src/app.js
dist/src/curriculum.js
dist/src/exercise-ui.js
dist/src/exercises.js
dist/src/interpretation.js
dist/src/investigations.js
dist/src/math.js
dist/src/model.js
dist/src/problem-bank.js
dist/src/progress.js
dist/src/statistics.js
dist/src/study-ui.js
dist/src/ui.js
dist/study.css
dist/styles.css
docs/decisions.md
docs/learning-provenance.md
docs/verification.md
package.json
test/exercises.test.js
test/interpretation.test.js
test/model.test.js
test/problem-bank.test.js
test/progress.test.js
test/statistics.test.js
tools/check.mjs
tools/serve.mjs
```

