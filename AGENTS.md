# RAMS research instructions

## Scope and sources
- Read README.md, research/definitions.md, data/sources.json, data/claims.json and data/tasks.json before research.
- Work on one ready task at a time. Write explicit proofs, countermodels and reproducible commands in research/.
- Preserve imported manuscripts verbatim under references/originals/; put proposed revisions elsewhere.
- Shared-chat text is a research lead, not a verified manuscript. Never reconstruct missing attachments as if read.
- Do not change established definitions silently. Propose changes separately with their effect on existing claims.

## Mathematical standards
- State signature, order, residual convention, integrality, commutativity, bounds and all modal assumptions.
- Distinguish Löb quasi-equations from FLöb inequalities; distinguish existence, at-most uniqueness, unique existence, uniform term definability and effective construction.
- Specify parameters, their quantifier order, allowed constants, guardedness, occurrence counts, modal depth and system cardinality.
- Keep claim status pending, proved, finite_checked, sampled or refuted. A proved claim needs a complete explicit proof and a separate audit document by a distinct reviewer or fresh review session. Computational output alone is finite_checked or sampled.
- A refutation needs a witness, a check of all required hypotheses and an explicit failed conclusion.
- Exhaustive closure over one finite algebra proves only that finite instance. A bounded search that finds nothing proves no universal theorem.
- Report exhaustion of time, memory or function bounds as incomplete. Never report it as successful exhaustive verification.
- Keep correctness and novelty separate. Cite primary sources with exact assumptions; never invent a reference.

## Workflow
- Pick a task with no unmet dependencies, prepare a prompt with npm run plan -- TASK-ID, then follow docs/workflow.md.
- Keep speculative discovery and subsequent audit in separate reports. Review reports must identify exactly what was checked.
- Preserve source IDs and stable claim IDs. Record negative results and unresolved steps.
- Run npm run verify after changing executable tools or ledgers. Keep generated experiments reproducible with exact inputs.
- CI performs deterministic checks; it does not prove pending mathematics or launch an LLM researcher.
- Do not merge or publish speculative conclusions as proved. Do not auto-push research runs.

## Deliverables
- Main slides and papers use audited claims only. Keep proof details and unresolved questions clearly labeled.
- Japanese Beamer slides: 16:9, LuaLaTeX; keep theme, macros and content separate. Render and inspect before delivery.
- End each research report with assumptions used, evidence, limitations and the next concrete task.
