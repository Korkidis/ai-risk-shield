# Governance Backbone

Status: Internal working draft extracted from the codebase on 2026-03-22  
Audience: Product, legal ops, trust and safety, brand governance, GTM, implementation teams  
Scope: Private doctrine and operating model for scan interpretation, mitigation reporting, policy overlays, and future governance features  

## Why This Exists

The scanner is the signal.

The mitigation report is the flashlight, the microscope, and the medicine.

The scan surfaces symptoms. The governance layer interprets those symptoms, adds doctrine, applies policy, weighs business context, and recommends a defensible course of action. This document is the private knowledge backbone that should shape that second layer.

Today, the product already contains meaningful governance logic, but the knowledge is fragmented across Gemini prompts, scoring code, brand-guideline logic, mitigation schemas, public governance copy, help copy, and operator docs. This file consolidates that into one internal point of view that can later be split into a full governance repository.

## Current Product Truths

- Image scanning is Gemini-driven today, not deterministic rules-only. It uses multi-persona analysis for IP, brand safety, and provenance reasoning, plus C2PA verification and a synthesized "chief officer strategy".
- Video scanning is materially thinner than image scanning. It relies on extracted frames, separate analyzers, max-frame aggregation, and weaker governance context.
- Brand guidelines are the only live policy overlay mechanism in the product today.
- Mitigation reporting already has a strong consultant-style structure, but it is not yet grounded in a real doctrine corpus of cases, standards, platform rules, and operational precedent.
- Public governance and help pages overstate determinism and understate the generative nature of the shipped analysis pipeline. When documentation conflicts with code, code is the present-tense truth.

## The Six Sections

This backbone is organized into six sections that can later become six top-level repo modules:

1. Risk Worldview
2. External Doctrine
3. Domain Frameworks
4. Policy Overlays
5. Decisioning Workflows
6. Mitigation Playbooks

---

## 1. Risk Worldview

### Purpose

This section defines how the company should think about AI content risk before any model, score, or report speaks.

### Operating Thesis

We are not building a novelty detector. We are building a publication-governance layer.

The scanner does not exist to produce a number. It exists to help teams decide whether an asset should be published, revised, escalated, documented, or blocked.

### Core Principles

- Governance is about decision quality, not just model output quality.
- False negatives matter more than mild review friction when IP, reputational, or compliance exposure is meaningful.
- Provenance is evidence of origin and handling. It is not proof of legal safety, originality, or brand suitability.
- Indemnity is a backstop, not a primary control.
- Human review should be triggered by consequence, not only by score.
- Tenant policy overlays matter because "acceptable" is partly legal and partly enterprise-specific.
- Mitigation must be operational. A good report tells a team what to do next, who should do it, what evidence is missing, and what residual risk remains after action.

### What Good Governance Produces

- A defensible publication decision
- A record of what was known at the time
- Clear escalation when legal, brand, or trust questions exceed automated confidence
- Reusable guidance that improves future decisions
- A stable point of view even as laws, models, and standards change

### Scanner Versus Mitigation

| Layer | Job | Output |
| --- | --- | --- |
| Scanner | Detect signals and surface likely symptoms | Scores, findings, evidence objects, initial strategy |
| Governance backbone | Interpret those signals through doctrine and policy | Point of view, decision logic, escalation rules |
| Mitigation report | Convert findings into action | Specific remediation plan, approvals, residual risk |

### Source Material Already Present In The Repo

The current public governance hub already sketches a six-part worldview in `lib/marketing/ai-content-governance.ts`:

- Assessing AI Content Risk
- AI Indemnity And Enterprise Controls
- Content Credentials For Enterprise Teams
- Human Review Workflows For AI Content
- Brand Policy Controls For AI Content
- AI Mitigation Layers

That file is the strongest existing conceptual seed, even though it is currently used as marketing and educational content rather than as a runtime knowledge source.

---

## 2. External Doctrine

### Purpose

This section is where external reality gets converted into internal operating guidance.

It should answer one question for every case, regulation, standard, settlement, or platform rule:

What changes operationally because of this?

### Doctrine Categories To Maintain

- Landmark litigation and settlement signals
- Copyright, trademark, trade dress, and right-of-publicity developments
- Synthetic media authenticity and disclosure standards
- National and regional AI governance frameworks
- Vendor indemnity commitments and tool-provider representations
- Platform policy changes for ads, marketplaces, publishing, and creator tools
- Procurement requirements from enterprise buyers, insurers, and regulated clients

### Current Doctrine Signals Already Hard-Coded

The repo already contains a small evidence layer in `lib/marketing/ai-content-governance.ts`:

- Anthropic authors settlement
- Runway synthetic media filing burst
- AI copyright case volume crossed 80+
- Content Credentials 2.3 launched
- US National AI Policy Framework
- EU AI Act: 50 enforcement rules go live

This is useful as a signal board, but it is not yet a real doctrine library. It does not currently provide structured implications for scoring, mitigation wording, human escalation, or policy updates.

### What A Doctrine Entry Should Contain

Every doctrine item in the future repo should capture:

- Title
- Date
- Jurisdiction
- Source type
- Affected domains
- Plain-English summary
- Why it matters operationally
- What it should change in scanner interpretation
- What it should change in mitigation reports
- What it should change in review workflows
- Review owner
- Next review date

### National Landmark Coverage Cases

For the repository you described, national landmark coverage should not sit in a legal-news bucket. It should be normalized into issue classes that can directly feed mitigation playbooks:

- Training-data and output-similarity disputes
- Copyrightability and ownership questions
- Trademark, logo, mascot, and trade dress confusion
- Celebrity, likeness, and right-of-publicity exposure
- Deepfake, deception, and authenticity disclosure obligations
- Public-sector and regulated-industry procurement requirements
- Standards adoption signals that affect evidentiary expectations

### Doctrine Rule

No external development should enter the repository unless it answers all three of these:

- What kind of finding does this make more important?
- What kind of mitigation does this make more necessary?
- What kind of review threshold does this raise or lower?

That is how news becomes operational wisdom.

---

## 3. Domain Frameworks

### Purpose

This section breaks governance into distinct analytical lenses. The scanner can detect multiple symptoms at once, but the mitigation layer must know which domain it is speaking from and why.

### Domain Map

| Domain | Core Question | Typical Red Flags | Default Mitigation Direction | Current Product State |
| --- | --- | --- | --- | --- |
| IP and identity | Does the asset appear to borrow protected expression, marks, likeness, or franchise signals? | Logos, trade dress, mascots, celebrities, franchise lookalikes, recognizable characters, signature product styling | Replace, redesign, document rights, narrow use, escalate to legal | Strongest current scanner domain |
| Brand safety and platform policy | Could this asset create reputational, policy, or advertiser-suitability risk? | Hate, sexual content, violence, drugs, self-harm, minors, political or scandal adjacency | Hold, edit, channel-restrict, require comms review, block | Strong current scanner domain |
| Provenance and authenticity | Can we credibly show where the asset came from and what happened to it? | Missing or invalid Content Credentials, broken chain, unverifiable origin, inconsistent metadata | Obtain origin evidence, regenerate with credentialed tools, disclose uncertainty, hold sensitive use | Strong evidence layer, but narrow doctrine |
| Bias, RAI, and compliance | Could the asset create fairness, exclusion, disclosure, or regulated-claims risk? | Stereotypes, protected-class issues, demographic skew, unsupported claims, missing disclosures | Revise copy or visuals, add disclosure, escalate to compliance, substitute content | Present in mitigation schema, thin in upstream detection |

### 3.1 IP And Identity Framework

The current Gemini IP analyst already encodes a conservative posture around:

- Copyright-like similarity
- Trademark and logo presence
- Character and franchise resemblance
- Celebrity or public-figure appearance
- Trade dress and signature commercial identity

This domain should be understood more broadly than "copyright". It is the full family of expressive and identity-based exposure.

#### Questions This Domain Should Always Ask

- Is any recognizable protected source being evoked, copied, parodied, or implied?
- Is the exposure direct, stylized, or merely suggestive?
- Is the asset commercially promotional, editorial, internal, or experimental?
- Is there any evidence of authorization, license, indemnity, or safe provenance?
- Would an ordinary reviewer see a known brand, property, character, or person?

#### Default IP Posture

- If a mark, character, or celebrity cue is obvious, assume review is warranted.
- If similarity is strong and provenance is weak, escalate aggressively.
- If provenance is valid, uncertainty may narrow, but infringement risk is not automatically cured.

### 3.2 Brand Safety And Platform Policy Framework

The safety analyst in `lib/gemini.ts` is already oriented around Fortune 500, PR, and platform-policy sensibilities. This is broader than moderation. It is about business suitability.

#### Questions This Domain Should Always Ask

- Could the asset embarrass the brand, sponsor, or client?
- Could it violate platform, ad network, or marketplace policy?
- Could it trigger internal reputational or crisis response concerns?
- Is the issue contextual, visual, textual, implied, or audience-dependent?

#### Default Brand Safety Posture

- Context matters. A medical, documentary, or news use can change interpretation, but it does not erase risk.
- Internal brand approvals can lower score for normal expected content, but they should not override hard legal or platform blocks.
- When audience or platform matters, the mitigation should be channel-specific, not generic.

### 3.3 Provenance And Authenticity Framework

The strongest current provenance mechanism is C2PA verification. The scanner already treats Content Credentials as a first-class evidence object and derives provenance score from credential status.

#### Questions This Domain Should Always Ask

- Is there a cryptographically valid chain?
- Is the chain standard, self-signed, missing, broken, or invalid?
- Do metadata and claimed origin align?
- Does the intended use require stronger authenticity evidence than the asset currently carries?

#### Default Provenance Posture

- Valid credentials reduce uncertainty and strengthen defensibility.
- Missing credentials are not proof of wrongdoing, but they are a governance weakness.
- Invalid or contradictory provenance should sharply increase review requirements.
- Provenance should influence both risk scoring and evidence requirements in mitigation.

### 3.4 Bias, RAI, And Compliance Framework

This domain is currently underdeveloped in upstream scanning, but it is already implied by the mitigation schema and product positioning.

#### Questions This Domain Should Always Ask

- Does the asset reinforce harmful stereotypes or exclusion?
- Does it make implied regulated claims without support?
- Does it need disclosures because of jurisdiction, industry, or audience?
- Is there a mismatch between the content and the standards of the target market?

#### Default Bias And Compliance Posture

- Treat this as a first-class review domain, not a nice-to-have appendix.
- Connect it to market overlays, platform overlays, and use-case context.
- Favor concrete compliance implications over abstract ethics language.

---

## 4. Policy Overlays

### Purpose

This section defines how enterprise-specific policy modifies the baseline governance model.

The baseline answers, "What is generally risky?"

The overlay answers, "What is risky for this specific brand, market, platform, or campaign?"

### What Is Live Today

The current brand-guideline system stores and applies:

- `name`
- `industry`
- `prohibitions[]`
- `requirements[]`
- `context_modifiers[]`
- `target_markets[]`
- `target_platforms[]`

`formatGuidelineRules()` in `lib/gemini.ts` turns those fields into explicit scoring instructions for Gemini:

- Brand-normal content is instructed to score 0-9
- Approved contextual items are instructed to score 0-9
- Prohibited items are instructed to score 90-100
- Requirements can act as approvals or can add risk when absent
- Markets and platforms are passed as interpretive context

### Current Overlay Semantics

The current live system already implies these important rules:

- Approval is not binary. Context can lower risk.
- Prohibition is not advisory. It is a critical-risk instruction.
- Missing required controls can themselves be a finding.
- The same asset can score differently for different tenants if their policy overlays differ.

### Recommended Policy Precedence

Policy should be applied in this order:

1. Hard legal, platform, or safety blocks
2. Enterprise legal and brand prohibitions
3. Market-specific overlays
4. Platform-specific overlays
5. Campaign or use-case-specific approvals
6. Generic model heuristics

### Overlay Types The Repo Should Add

The current schema is useful but incomplete. The governance repository should be able to hold:

- Restricted vocabulary and forbidden phrasing
- Named marks, mascots, public figures, and competitor references
- Approved creative-tool or model lists
- Required provenance standards by use case
- Mandatory disclosures by market, industry, or platform
- Regulated-industry overlays
- Child-safety and sensitive-audience overlays
- Risk acceptance exceptions with approver and expiry

### Overlay Design Rule

An overlay should never be just a document upload. It should resolve to explicit machine-usable guidance:

- What to score lower
- What to score higher
- What evidence to require
- What reviewer must sign off
- What channels are restricted

### Repo Pattern For Future Extraction

If this file later becomes a real repository, policy overlays should be split into composable modules such as:

- `policy-overlays/global/`
- `policy-overlays/markets/`
- `policy-overlays/platforms/`
- `policy-overlays/industries/`
- `policy-overlays/brands/`
- `policy-overlays/campaigns/`

---

## 5. Decisioning Workflows

### Purpose

This section defines how findings become decisions.

### Canonical Workflow

1. Detect the signal
2. Contextualize it with doctrine and policy
3. Verify supporting evidence
4. Decide publish, revise, escalate, hold, or block
5. Generate mitigation instructions
6. Record the rationale and approvals

### Current Scoring Truth In Code

The present implementation in `lib/risk/scoring.ts` and `lib/risk/tiers.ts` is:

- C2PA trust override: if C2PA is valid, cap IP at 10
- Weighted composite: IP 40%, Safety 40%, Provenance 20%
- Compound boost: if IP >= 80 and provenance >= 60, raise the composite
- Critical override: if IP >= 90, floor composite at 95
- Tier thresholds: 91 critical, 76 high, 51 review, 26 caution, else safe

This is the actual product behavior and should be treated as canonical until changed in code.

### Decision Should Not Be Score-Only

Scores are useful, but governance decisions should also consider:

- Type of finding
- Confidence and evidence quality
- Intended use
- Market and platform
- Rights documentation
- Tool provenance
- Brand overlay rules
- Potential business consequence if wrong

### Recommended Decision Lanes

| Outcome | When To Use It | Required Action |
| --- | --- | --- |
| Publish | Low risk, evidence is adequate, no hard policy conflict | Record evidence and proceed |
| Publish with disclosure | Asset is usable but provenance or compliance context needs transparency | Add disclosure, store rationale |
| Revise and rescan | Findings appear remediable without deeper legal review | Modify asset or prompt, rescan, compare deltas |
| Hold for review | Risk is uncertain, compounded, or business-sensitive | Route to legal, brand, trust, or compliance reviewer |
| Block and replace | Risk is severe or plainly prohibited | Stop usage, source new asset, document rejection |

### Human Review Lanes

- Legal or IP review for copyright, trademark, trade dress, likeness, and franchise issues
- Brand or comms review for reputational and message-alignment issues
- Trust and safety review for harmful content or policy-sensitive contexts
- Compliance review for regulated claims, disclosures, and market-specific obligations
- Procurement or vendor review for tool provenance, indemnity, and enterprise contract questions

### Required Evidence Bundle

Every non-trivial decision should be able to point to:

- Asset ID and storage path
- Timestamp and scan metadata
- Risk profile and findings
- C2PA or provenance report
- Guideline or overlay used
- Chief strategy or mitigation summary
- Human approver notes
- Final disposition

### Decisioning Rule

When model confidence is lower than business consequence, escalate.

That single rule should survive every scoring-model change.

---

## 6. Mitigation Playbooks

### Purpose

This section defines the voice, structure, and operating logic for consultant-grade mitigation reports.

The mitigation report should not repeat findings in prose. It should translate findings into action.

### Standard Mitigation Structure

Every mitigation output should include:

- What was found
- Why it matters
- What to do immediately
- What evidence is missing
- What remediation options exist
- Who should review or approve
- What residual risk remains after mitigation
- What to monitor if the asset is still used

### Recommended Consultant Voice

The report should sound:

- Calm
- Specific
- Operational
- Defensible
- Non-performative
- Clear about uncertainty

It should not sound:

- Alarmist without guidance
- Overly academic
- Generic
- Legal-advice adjacent when it lacks legal grounding

### Core Playbook Types

| Finding Pattern | Mitigation Spine |
| --- | --- |
| Trademark or logo contamination | Remove or replace the visual element, validate no confusingly similar substitute remains, route to legal if commercial use continues |
| Character, franchise, or trade-dress resemblance | Redesign away from recognizable cues, test distinctiveness on rescan, require legal review if campaign value depends on the resemblance |
| Celebrity or likeness implication | Block promotional use absent rights, replace with rights-cleared asset, escalate for publicity-right review |
| Brand safety conflict | Assess channel and audience, revise or suppress sensitive elements, route to comms or policy review before use |
| Missing or invalid provenance | Obtain source evidence, regenerate through credentialed workflow if needed, add disclosure or hold sensitive use until chain is stronger |
| Bias, fairness, or compliance issue | Revise representation or claim, add disclosure where required, validate against market and platform overlays, escalate if regulated |
| Compounded findings across domains | Treat as a workflow problem, not a one-line fix; coordinate legal, brand, and compliance actions with explicit owner and deadline |

### Mitigation Design Rules

- Recommend actions in priority order.
- Separate immediate containment from longer-term process fixes.
- State what can be solved by editing the asset versus what requires rights, policy, or workflow change.
- Tie every recommendation to a finding, not to abstract governance language.
- Include residual risk even after recommended changes.

### What "Operational Wisdom" Means Here

Operational wisdom means the report knows more than the scanner.

It understands:

- Which findings are normal friction versus escalation-worthy
- Which issues can be redesigned away versus documented away
- When provenance helps and when it does not
- When the right answer is "change the workflow", not "change the asset"
- How market, platform, and brand context change the answer

---

## Appendix A: Current Codebase Extraction

These files are the strongest current sources for the governance backbone:

- `lib/marketing/ai-content-governance.ts`
  - Six governance guides
  - Risk watch and policy signal objects
  - Current public framing of governance topics
- `lib/gemini.ts`
  - Real scanner point of view for IP, safety, provenance, chief strategy
  - Live brand-guideline injection logic
- `lib/ai/mitigation-generator.ts`
  - Current mitigation report schema and tone scaffold
- `lib/risk/scoring.ts`
  - Real composite logic
- `lib/risk/tiers.ts`
  - Canonical thresholds
- `lib/ai/scan-processor.ts`
  - Orchestration, especially image versus video differences
- `app/api/guidelines/extract/route.ts`
  - Current guideline extraction model and assumptions
- `types/database.ts`
  - Stored mitigation-report structure
- `components/dashboard/UnifiedScanDrawer.tsx`
  - What the product currently surfaces from mitigation output
- `lib/pdf-generator.ts`
  - Broader mitigation output than the in-app drawer reveals
- `AGENTS.md` and `.claude/CLAUDE.md`
  - Operator-facing methodology claims, including drift

## Appendix B: Known Gaps And Drift To Reconcile

### Documentation Drift

- Public governance and help pages say the engine is deterministic and does not rely on generative AI. The shipped scanner and mitigation flows are Gemini-generated.
- Help and AGENTS copy still describe a 70/20/10 style composite with a red-flag-at-85 posture. The real implementation is 40/40/20 with a valid-C2PA cap, compound boost, and IP >= 90 critical override.
- AGENTS says `gemini-2.5-flash` is the model of record, but guideline extraction still uses `gemini-1.5-flash`.
- Public copy references restricted vocabulary and policy-document support, but the live schema only supports prohibitions, requirements, context modifiers, target markets, and target platforms.

### Capability Gaps

- Governance guides are not currently fed into scan analysis or mitigation generation as a knowledge source.
- There is no structured doctrine corpus for landmark cases, settlements, standards, or platform rules.
- Bias and compliance are mostly post-scan narrative concepts, not first-class upstream detectors.
- Video governance does not yet have parity with image governance, especially for policy overlays.
- The mitigation report is structurally rich, but its intelligence is still mostly generated from scan-local context rather than a durable knowledge base.

### Operator-Docs Gaps

- `AGENTS.md` and `.claude/CLAUDE.md` reference missing `CURRENT_STATE.md` files.
- The methodology story is spread across multiple docs without a single internal canonical governance file.

## Appendix C: Maintenance Rules

This document should be updated whenever any of the following changes:

- Scoring logic
- Gemini prompt philosophy
- Brand-guideline schema
- Mitigation report schema
- Platform-policy assumptions
- External legal or standards signals that change our operational posture

### Update Rule

When updating this backbone, prefer this order:

1. Update code or schema truth first
2. Update this internal backbone second
3. Update public-facing methodology copy last

That order keeps marketing from outrunning implementation.

### Graduation Path To A Full Repo

When this file becomes too large, split it into:

- `01-risk-worldview.md`
- `02-external-doctrine.md`
- `03-domain-frameworks.md`
- `04-policy-overlays.md`
- `05-decisioning-workflows.md`
- `06-mitigation-playbooks.md`
- `templates/doctrine-entry.md`
- `templates/mitigation-pattern.md`
- `appendices/current-system-extraction.md`
- `appendices/gaps-and-drift.md`

Until then, this file is the working source of truth.

## Appendix D: Curated Session Doctrine

### Purpose

This appendix captures durable governance signal extracted from a noisy exploratory working session. It is written as normalized doctrine, not as requirements, chat residue, or legal interpretation.

### Mitigation Posture

- Findings and mitigation are distinct layers.
- Findings should report what the system detected, where it appears, and why it may matter.
- Mitigation should convert those findings into practical next steps, evidence requests, approval guidance, safer alternatives, and residual-risk framing.
- The scanner is the signal. The mitigation report is the flashlight, the microscope, and the medicine.
- The value of the product is not only in identifying symptoms. It is in turning those symptoms into useful, practical, defensible guidance.
- The mitigation report should feel like high-quality consulting, not generic AI copy and not legal advice.

### Creativity, Risk, And Practical Judgment

- The system should be pro-creativity, pro-human workflow, and pro-defensibility at the same time.
- The purpose of governance is not to shut work down reflexively. It is to help teams understand what may be too close, too unclear, too undocumented, or too exposed for the use they intend.
- Clear and recognizable issues should be treated differently from ambiguous ones.
- A clearly identifiable public figure, character, logo, product, or brand asset is materially different from a loose resemblance, cultural echo, nostalgic similarity, or general aesthetic overlap.
- Ambiguous likeness or style signals should usually be surfaced as considerations rather than automatically labeled as violations.
- The system should avoid overcorrecting for model imperfections in ways that would unnecessarily suppress legitimate creative work.
- At the same time, the system should not normalize obvious mimicry, confusion, or protected-asset reuse merely because generative models make ambiguity common.

### Likeness, Style, And Similarity

- Likeness should be treated as a spectrum of concern, not as a false binary.
- The most important practical distinction is between clearly recognizable identity signals and softer resemblance signals.
- Where resemblance is obvious enough that a reasonable reviewer would immediately identify a person, character, or protected source, mitigation should be firm and specific.
- Where resemblance is suggestive but uncertain, the system should surface the issue, explain why it may matter, and provide practical options such as revision, regeneration, evidence gathering, or human review.
- Style and composition should be treated as governance-relevant signals even when they are not reducible to direct pixel copying.
- The goal is not to claim legal certainty about style-based claims. The goal is to identify when a team may be entering a zone of reputational, IP, or review friction and to give them a practical path forward.

### Provenance And Defensibility

- Provenance matters because it strengthens or weakens defensibility, auditability, and confidence.
- Missing credentials are not proof of infringement, wrongdoing, or bad intent.
- Missing, weak, or contradictory provenance should still change the posture of the mitigation report by increasing the need for evidence, disclosure, attestation, or review.
- Provenance should be treated as part of the explanation chain for how an asset was made, not as a standalone verdict about whether the asset is permissible.
- Human editing, transformation, and downstream design work can strengthen defensibility, but they should not be described as a universal reset button.
- The system should help users document how an asset was made and what evidence exists, because explainability is part of how real teams get work approved.

### Policy Overlays And Customer Context

- Customer policy should meaningfully shape interpretation and mitigation.
- If a customer has explicit permissions, approved tools, indemnified workflows, category rules, market restrictions, platform restrictions, or exclusions, those should modify the recommendations the report provides.
- In the absence of customer policy, the system should fall back to a baseline point of view that is conservative, practical, and useful.
- Baseline doctrine should help teams make better decisions when policy is silent, incomplete, or immature.
- Industry, category, market, and platform context are legitimate policy overlays, not decorative metadata.
- Competitor contamination, category-sensitive usage, and channel-specific concerns are valid mitigation dimensions and should appear in recommendations where relevant.

### Human Review And Workflow Reality

- The product should support real review workflows rather than pretending automation replaces them.
- Mitigation should help creatives, brand reviewers, marketers, trust and safety teams, compliance teams, procurement teams, and legal reviewers communicate more clearly.
- Review pathways differ across organizations, so the report should support stage-gate style decisioning without hardcoding one enterprise approval model as universal.
- The product should give users language, evidence framing, and practical options that fit into existing approval chains.
- Agencies should be treated as trusted but verified. The report can help them document what they made and what needs review without implying that the system has cleared liability on their behalf.

### Mitigation Design Rules

- Mitigation should be symptom-specific.
- If the finding is likely trademark contamination, the recommendation should focus on trademark removal, substitution, approval checks, or channel restrictions.
- If the finding is likely likeness exposure, the recommendation should focus on likeness remediation, rights verification, regeneration, or review.
- If the finding is provenance weakness, the recommendation should focus on evidence, credentialing, disclosure, attestation, or safer workflow alternatives.
- If policy is present, the mitigation should explain how the recommendation aligns with or deviates from that policy.
- If policy is absent, the mitigation should make clear that it is applying the product's baseline point of view.
- Recommendations should be practical enough that a team can act on them without needing to decode abstract governance language.

### External Doctrine And Policy Anchors

- U.S. and EU policy developments should be treated as external doctrine and operating context, not as simplistic scanner rules.
- The White House National AI Legislative Framework released on March 20, 2026 should be treated as a U.S. policy signal, especially around children, community impacts, creators, digital replicas, innovation, and federal preemption.
- That White House framework is a legislative-recommendations document, not enacted law, and should not be flattened into claims of settled legal standards.
- EU AI Act Article 50 should be treated as a major transparency and disclosure anchor, especially for synthetic-content disclosure and deepfake-related duties.
- EU obligations should be handled with care and specificity rather than reduced to blanket rules like "label everything."
- Unsettled legal questions should remain explicitly unsettled in the governance backbone. The repository should track them as doctrine, precedent, and operating context rather than convert them into false certainty.

### Guardrails For How This Appendix Should Be Used

- This appendix is a doctrine source for mitigation tone, framing, and default posture.
- It should not be treated as a substitute for product requirements, scoring code, or legal advice.
- It should not be used to invent fake precision, such as arbitrary point penalties, hardcoded resemblance percentages, or pseudo-scientific edit prescriptions.
- It should not be used to imply that provider indemnity, human transformation, or provenance alone resolves all downstream risk.
- It should be used to make mitigation reports more useful, more defensible, more contextual, and more aligned with how real teams evaluate creative risk.
