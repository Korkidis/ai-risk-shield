# AI Risk Shield - North Star Document
**Version:** 1.0 | **Last Updated:** January 19 2026 | **Status:** Active Development

## HOW TO USE THIS DOCUMENT

**For AI Coding Agents:**
Read this document in full before implementing ANY new feature. When making implementation decisions:
1. Check if this document addresses it explicitly
2. If ambiguous, ask before proceeding
3. When in doubt, prioritize: User Jobs → Business Model → Technical Architecture

This is the single source of truth for product vision, user needs, and implementation priorities. If code conflicts with this document, the document wins (or we update the document with clear reasoning).

**Update Protocol:**
- Any deviation from this spec requires updating this document first
- Document version bumps on material changes
- All team members must review changes before implementation

---

## CRITICAL CONSTRAINTS (Read First)

### Non-Negotiable Requirements:
- **Security:** SOC 2 compliance mandatory - every feature must respect PII protection, RLS, audit logging
- **Self-Serve:** No "Contact Sales" except Enterprise tier - product must be intuitive enough for signup → value in <5 minutes
- **Speed:** Results in <20 seconds or users churn - optimize for perceived speed (progress indicators, realtime updates)
- **Margins:** 96% target margin requires keeping infrastructure costs <4% of revenue - don't over-engineer
- **Solo Founder:** Implementation must be manageable by one person + AI agents - no features requiring 24/7 operations

### Design Philosophy:
- **Dieter Rams/Braun Aesthetic:** "Instrument-grade clarity" - looks like $50K lab equipment, not consumer app
- **Less, but better:** Ship 3 features that work perfectly vs. 10 half-done features
- **Progressive disclosure:** Show complexity only when needed - default to simple
- **Trust through precision:** Every number, label, color must convey authority and accuracy

### Technical Constraints:

# Jobs to Be Done - AI Risk Shield (Updated with Current Solutions)

---

## **Primary Job (Functional)**

**"Help me confidently publish AI-generated content without getting sued or banned."**

**Sub-jobs:**
1. **Validate before publishing:** "I need to know if this AI image/video is safe to use commercially before my boss/client/legal team sees it"
2. **Document due diligence:** "I need proof that I checked for IP risks in case we get sued later"
3. **Avoid platform bans and disclaimer laws in EU and other for assets:** "I need to make sure Instagram/Facebook won't flag or remove this content and Im in compliance"
4. **Satisfy legal/compliance:** "Legal is blocking all AI use - I need technical validation they'll accept so we can move forward"
5. **Client approval workflow:** "My client's legal team needs documentation showing asset provenance and risk assessment before they'll approve the campaign"
6. **Prove asset authenticity:** "I need to show the complete creation and edit trail to demonstrate this wasn't stolen or misrepresented"
7. **Get actionable mitigation guidance:** "Don't just tell me it's risky - tell me exactly how to fix it or connect me with experts who can"

---

## **Emotional Jobs**

1. **Reduce career anxiety:** "If I publish something that gets us sued, I'll be blamed/fired - I need CYA"
2. **Feel like a responsible professional:** "I'm doing the right thing by validating content, not just YOLO publishing"
3. **Gain confidence:** "I can tell my client 'this scored 28/100, it's safe' instead of 'I think it's fine?'"
4. **Avoid feeling stupid:** "I don't want to be the person who caused a $680K settlement because I didn't check"
5. **Demonstrate transparency:** "I can show clients exactly how their assets were created and that we're not hiding anything"
6. **Feel sophisticated and professional:** "This tool is beautiful - makes me look cutting-edge to legal and clients"

---

## **Social Jobs**

1. **Look competent to stakeholders:** "Show my boss/client I'm being thorough and professional"
2. **Protect the company/client:** "I'm the guardian preventing legal exposure for my team"
3. **Enable AI adoption:** "Legal says 'no AI' because they don't know how to assess risk - I can give them data to say yes"
4. **Justify budget:** "I can show ROI: 'This tool prevented us from using risky content worth $X in potential liability'"
5. **Streamline client approvals:** "Client legal can review the provenance report instead of asking 20 questions about how we made it"
6. **Maintain agency reputation:** "We can demonstrate to clients that we validate all AI content - positions us as responsible partners"
7. **Bridge technical-legal divide:** "Legal loves the interface, creatives love the interface - everyone can use it without training"

---

## **Enterprise/Agency-Specific Jobs**

### **For Agencies:**

**"Provide audit-ready documentation for every client deliverable"**
- **Context:** Large agencies already document asset creation for client legal review (stock licenses, photographer agreements, usage rights)
- **AI adds complexity:** "How was this created? What tool? Any edits? Can we prove it's not stolen?"
- **Job:** "Generate a provenance report I can attach to the creative brief showing: Tool used → Original creation date → Edit history → Risk assessment"
- **Success:** Client legal approves deliverables in first review instead of 3-round questioning

**"Protect agency from client liability claims"**
- **Context:** If client gets sued, they'll blame the agency
- **Job:** "Show we did reasonable due diligence validating assets before delivery"
- **Success:** Contract indemnification holds up because we have documented validation

**"Enable creative team velocity without legal bottleneck"**
- **Context:** Creative wants to use AI to iterate faster, legal says "not until we review each one"
- **Job:** "Give legal a technical report they trust so creatives can self-clear low-risk content"
- **Success:** 2-day campaign timeline possible instead of 2-week legal review

**"Get expert help when we're out of our depth"**
- **Context:** Critical client campaign flagged as 95/100 risk, agency doesn't have IP counsel on staff
- **Job:** "Connect me with IP consultant or insurance solution for high-stakes situations"
- **Success:** Purchased Deep Mitigation Report ($X), hired recommended IP attorney, secured coverage, campaign approved

### **For Enterprise In-House Teams:**

**"Create repeatable approval process for AI content"**
- **Context:** Marketing creates 100+ AI images/month, legal can't review each manually
- **Job:** "Establish threshold rules: <40 score = auto-approve, 40-70 = legal review, >70 = reject. Use custom brand guidelines to tune scoring for our specific needs."
- **Success:** 80% of AI content auto-clears, legal only sees flagged items

**"Audit AI content usage across organization"**
- **Context:** Multiple departments using AI, no visibility into what's being created
- **Job:** "Central dashboard showing all AI content scans, who created what, risk levels"
- **Success:** Compliance can report to board: "We scanned 1,247 AI assets, 94% low-risk, documented all high-risk rejections"

**"Prove content authenticity in disputes"**
- **Context:** Competitor claims you stole their content, or you claim competitor stole yours
- **Job:** "Export provenance report showing C2PA trail: Created and editited with [tool] on [date], no edits from external sources"
- **Success:** Legal uses report as evidence in cease-and-desist or court filing

**"Customize validation for our industry and brand context"**
- **Context:** Standard platform safety rules don't match our business (we're a swimsuit brand, bikini images are legitimate)
- **Job:** "Upload our brand guidelines and set custom rules so scoring reflects OUR context, not generic platform policies"
- **Success:** Stopped getting false positives on legitimate product imagery, validation now relevant to our business

### **For In-House Legal/IP Teams:**

**"Enforce IP compliance proactively"**
- **Context:** Legal wants to prevent infringement before it happens, not clean up lawsuits after
- **Job:** "Set company policy: All AI content must score <50 before publishing, attach report to every campaign brief"
- **Success:** Zero AI-related legal incidents because high-risk content blocked upstream

**"Investigate infringement claims efficiently"**
- **Context:** Receive C&D letter claiming our content infringes, need to assess validity quickly
- **Job:** "Pull provenance report showing: Original creation date (before their claim), C2PA signature (proves our origin), similarity score (quantify overlap)"
- **Success:** Respond to legal threat in 24 hours with technical evidence instead of 2-week investigation

**"Maintain evidence for litigation"**
- **Context:** If we do get sued, need complete documentation of content creation
- **Job:** "Archive every scan report with provenance trails as legal hold evidence"
- **Success:** Discovery response ready: "Here are 347 AI assets with complete creation/validation records"

**"Make technical analysis accessible to non-technical lawyers"**
- **Context:** In-house counsel understands law, not AI/ML or image forensics
- **Job:** "Interface so intuitive that any lawyer can understand risk levels instantly - looks like high-end professional equipment, not consumer app"
- **Success:** Legal team adopts tool without training, trusts results because UI conveys precision and authority (Dieter Rams/Braun aesthetic)

---

## **Provenance Trail Specific Jobs**

### **"Show client how their assets were made"**
- **User:** Agency creative director presenting to client
- **Job:** "Walk through provenance report showing: Prompt used → DALL-E 3 generated base → Edited in Photoshop (color correction) → Final output"
- **Why:** Client marketing needs to explain to their legal why this image exists and that it's not stolen stock
- **Success:** Client says "Great, approved for launch"

### **"Prove we didn't use competitor's IP"**
- **User:** In-house brand manager
- **Job:** "Competitor claims we copied their campaign - export C2PA report showing our creation date was 3 months before theirs"
- **Why:** Defend against false infringement claim
- **Success:** Competitor drops claim, no lawsuit

### **"Audit vendor deliverables"**
- **User:** Enterprise procurement/legal
- **Job:** "Agency delivered 50 AI images - scan all for provenance to verify they actually created them vs. scraped from web"
- **Why:** Contract requires original work, need to verify
- **Success:** Discover 5 images have no C2PA (agency bought stock, claimed AI) - reject those, accept others

### **"Demonstrate content authenticity for regulatory compliance"**
- **User:** Pharma/Financial services marketing
- **Job:** "FDA/SEC requires proof that marketing images weren't manipulated to mislead - C2PA trail shows no deceptive edits"
- **Why:** Regulatory filing requirement
- **Success:** Regulator accepts submission with provenance documentation

### **"Create paper trail for insurance claims"**
- **User:** Risk management team
- **Job:** "If we get sued for AI content, insurance will ask 'what validation did you do?' - archive all scan reports"
- **Why:** E&O insurance claim defense
- **Success:** Insurance covers legal defense because we demonstrated reasonable precautions

---

## **Current Solutions to User Needs**

### **1. "Fix the issue for me" → SOLVED via Mitigation Reports & Services**

**Basic Scan (Free/Paid Plans):**
- Identifies issues: "Nike logo detected, 98/100 IP risk"
- Shows location: "Bottom-right corner, coordinates (450px, 320px)"
- Basic recommendation: "Remove logo or regenerate"

**Deep Mitigation Report (One-time purchase OR included in higher plans):**
- **What it includes:**
  - Step-by-step remediation instructions
  - Regeneration prompts (copy-paste ready)
  - Legal reasoning (why this matters, potential liability)
  - Alternative approaches (crop, blur, regenerate, license)
  - Contact info for licensed alternatives (e.g., "License this image from Getty: [link]")
  
**Expert Services Upsell (for 75+ scores):**
- **IP Consultation:** "This is complex - would you like to speak with an IP attorney? [$500 consultation]"
- **Indemnity Insurance:** "Protect yourself: Get coverage for this campaign [$X premium for $10M coverage]"
- **Why affiliate model works:** We identify the problem (high risk), connect user to solution (insurance/legal), take commission

**User journey:**
1. Upload image → Score: 95/100 (Critical)
2. See finding: "Disney character detected"
3. Click "Get Mitigation Guidance" → Purchase Deep Report ($29) OR use included scan (Team+ plan)
4. Report shows: "You cannot use this. Here are 3 alternative approaches..."
5. If still stuck: "Need expert help? [Book IP Consultation] [Get Insurance Quote]"

---

### **2. "Explain this to non-technical people" → SOLVED via Rams/Braun UI Design**

**Design principle:** Instrument-grade clarity that both technical and non-technical users trust instantly.

**How the UI communicates:**

**Score Display:**
- Not: "Risk coefficient: 0.847"
- Instead: Large gauge reading "85/100" with red zone clearly marked, "CRITICAL RISK - DO NOT PUBLISH"

**Findings:**
- Not: "Pattern matching algorithm detected derivative similarity coefficient..."
- Instead: "Mickey Mouse character detected (98% confidence). Disney trademark. Lawsuit risk: $750K-$2M."

**Provenance:**
- Not: "C2PA validation failed: signature mismatch in CBOR manifest..."
- Instead: "⚠️ No content credentials found. Cannot verify this wasn't stolen from stock library."

**Why Dieter Rams/Braun aesthetic:**
- **Precision:** Looks like a $50,000 scientific instrument hipsters would want in their home → Legal trusts it
- **Simplicity:** Clean, uncluttered → Marketing can use without training
- **Authority:** Industrial design → Conveys seriousness (not a toy)
- **Universal:** Non-technical people intuitively understand gauges, color coding, clear warnings

**Result:** CMO can show this to GC and both immediately understand the risk without translation.

---

### **3. "Batch validate 100 images" → FUTURE (Month 6+)**

**Current state:** Upload one at a time
**Roadmap:** Bulk upload feature for Agency+ plans
**Why later:** Need to validate single-scan UX first, then scale

---

### **4. "Monitor ongoing use" → OUT OF SCOPE (Different Business Model)**

**Why not building this:**
- Requires continuous monitoring infrastructure (expensive)
- Different value prop (prevention vs. monitoring)
- Crowded market (TinEye, Pixsy do this)
- Our strength: Pre-publication validation, not post-publication surveillance


---

### **5. "Generate compliant alternative" → OUT OF SCOPE (Different Business Model)**

**Why not building this:**
- We validate, not create
- Generative AI is separate product category
- Users already have creation tools (Midjourney, DALL-E)
- Our value: Expert validation, not replacement creation

**Alternative:** Provide detailed regeneration prompts in Deep Mitigation Report

---

### **6. "White-label for client delivery" → ENTERPRISE FUTURE (Month 9+)**

**Current state:** Reports show "AI Risk Shield" branding
**Future:** Agency+ and Enterprise plans get custom branding
**Why later:** Need 2+ enterprise customers before this is ROI-positive

---

### **7. "Possible API integration" → ENTERPRISE FUTURE (Month 9+)**

**Current state:** Manual upload via web UI
**Future:** REST API for DAM/CMS integration
**Why later:** Self-serve web product must work first, then scale to enterprise workflows

---

### **8. "Competitive intelligence" → OUT OF SCOPE (Different Industry)**

**Why not building this:**
- Legal gray area (scanning others' content without permission)
- Different buyer (competitive intelligence teams, not marketing)
- Not our core competency

---



**Why this works:**
- Brand guidelines = custom rules engine
- We're already scanning for similarity to known copyrighted works
- User defines their acceptable thresholds (knob settings)

**Example custom rules:**
- "Flag if similar to Getty/Shutterstock aesthetic (even without exact match)"
- "Allow our licensed stock (Getty #ABC123) but flag unlicensed"
- "Alcohol context OK for our brand, but flag competitor alcohol brands"

---

## **When Do They Hire This Product?**

**Trigger moments:**
- Marketing manager sees NYT v. OpenAI headline → "Oh shit, are WE at risk?"
- Designer's client asks "Is this AI image safe?" → Designer has no answer
- Legal department blocks AI use → Team needs proof/validation to unblock
- Platform removes content → "How do I prevent this next time?"
- Insurance renewal asks "Do you use AI-generated content?" → Need to show due diligence
- Competitor gets sued for AI content → "We need to check ours NOW"
- **Client legal sends 10-question email about asset creation** → "I need documentation that answers this"
- **Agency pitch requires 'responsible AI' proof** → "Need to differentiate our process"
- **Regulatory audit requests content authenticity documentation** → "Must produce provenance records"
- **Internal audit discovers ungoverned AI use** → "Need to establish validation process company-wide"
- **High-stakes campaign needs insurance** → "Risk too high, need coverage to proceed"

---

## **What Are They Firing? (Alternatives)**

1. **Doing nothing (hope for the best)** - Too risky now, headlines everywhere
2. **Asking legal team to review manually** - Too slow ($400/hr, 2-week turnaround)
3. **Using reverse image search** - Only catches exact copies, not similarity/style
4. **Reading AI vendor ToS** - Confusing, doesn't actually validate specific outputs
5. **Generic content moderation tools** - Don't check IP risk, only NSFW
6. **Just avoiding AI entirely** - Competitive disadvantage (others using AI faster/cheaper)
7. **Manual provenance documentation (spreadsheets)** - Error-prone, not verifiable, no audit trail
8. **Relying on vendor indemnification** - Doesn't cover output infringement, false sense of security
9. **Client trust alone** - "Agency says it's fine" doesn't satisfy legal department anymore
10. **Consumer-grade tools** - Legal doesn't trust tools that look like toys

---

## **Success Metrics (How They Measure the Job)**

**Functional success:**
- ✓ Got a clear yes/no answer in <20 seconds
- ✓ Can download a report to show legal/client
- ✓ Didn't publish risky content (avoided lawsuit)
- ✓ Platform didn't ban the post
- ✓ **Client legal approved deliverables without additional documentation requests**
- ✓ **Complete provenance trail available for audit/litigation if needed**
- ✓ **Got actionable mitigation steps (not just "it's risky")** via Deep Report
- ✓ **Connected with expert when needed** (IP attorney, insurance)

**Emotional success:**
- ✓ Feel confident hitting "publish"
- ✓ Can sleep at night (not worried about lawsuit)
- ✓ Boss/client thinks I'm thorough and professional
- ✓ **Feel transparent and honest with clients about AI use**
- ✓ **Feel sophisticated using tool** (interface conveys expertise)
- ✓ **Protected from catastrophic loss** (insurance secured for high-risk campaign)

**Social success:**
- ✓ Legal team approves AI use (I'm the hero who made it possible)
- ✓ Saved company from potential $X liability
- ✓ Enabled marketing to move faster with AI
- ✓ **Agency differentiated in pitch: "We validate all AI content, competitors don't"**
- ✓ **Compliance can report to board: "AI governance process established and documented"**
- ✓ **Legal understands and trusts the tool** (UI bridges technical-legal gap)

**Enterprise-specific success:**
- ✓ **Reduced legal review bottleneck by 80%** (self-clearing low-risk content)
- ✓ **Client approval cycle shortened from 2 weeks to 2 days**
- ✓ **Zero AI-related incidents in 12 months** (vs. industry average X%)
- ✓ **Insurance premium reduced** because demonstrated risk management process
- ✓ **Custom brand rules eliminate false positives** (scoring relevant to our business)

---

## **Jobs the Product Doesn't Do (Scope Boundaries)**

❌ Give legal advice ("Can I publish this?") - We give data, lawyer decides
❌ Create AI content - We validate, not generate
❌ Monitor all your published content - We scan on-demand only (monitoring = different business)
❌ Represent you in court - Forensic report is evidence, not legal defense
❌ Guarantee zero risk - We assess risk, can't eliminate it entirely
❌ Replace legal review entirely - High-risk content still needs lawyer
❌ Validate non-AI content - Designed for AI outputs, not general IP clearance
❌ Scan competitors' content - Legal/ethical issues, not our market
❌ Generate alternative content - We validate, users create (via their tools)

---

## **Primary Persona x Job Mapping**

**Marketing Manager at startup:**
- Job: "Validate this campaign image before launch so legal approves it"
- Trigger: CMO demands AI-scale content, Legal is nervous
- Success: "Legal signed off in 1 hour instead of 2 weeks"
- Uses: Basic scans + brand guidelines to auto-clear most content

**Freelance Designer:**
- Job: "Answer client's 'Is this safe?' question professionally"
- Trigger: Client asks about AI risk, designer has no answer
- Success: "Client impressed with forensic report, paid invoice faster"
- Uses: Per-scan purchases ($29 reports), sends branded PDF to clients

**In-house Legal/Compliance:**
- Job: "Give marketing a framework to use AI without calling me every time"
- Trigger: 50 marketing requests to review AI images
- Success: "Marketing self-serves validation, I only review red flags"
- Uses: Enterprise plan with custom thresholds (auto-approve <40, escalate >70)

**Agency Account Director:**
- Job: "Streamline client approval process with documented provenance"
- Trigger: Client legal requires proof of asset creation for every deliverable
- Success: "Client approves full campaign in one meeting instead of 3-round back-and-forth"
- Uses: Team/Agency plan with bulk scanning + Deep Mitigation Reports for high-risk assets

**Enterprise Risk/Compliance Officer:**
- Job: "Establish and enforce AI content governance policy"
- Trigger: Board asks "How are we managing AI risk?"
- Success: "Implemented validation workflow, documented 95% compliance rate, zero incidents"
- Uses: Enterprise plan with API integration (future), audit dashboard, custom brand rules

**IP Attorney (In-house or Agency Counsel):**
- Job: "Investigate infringement claims and maintain litigation-ready evidence"
- Trigger: Received C&D letter or need to defend against competitor claim
- Success: "Responded in 24 hours with technical provenance report, claim dropped"
- Uses: Scan archive for evidence, Deep Mitigation Reports for legal reasoning, insurance referrals for high-exposure cases

---

## **Revenue Tie-In to Jobs**

**Job → Product Tier Mapping:**

| Job | Plan | Why |
|-----|------|-----|
| "Validate one-off project" | Free (3 scans) → $29 report | Testing, low volume |
| "Regular validation for my freelance work" | Individual ($49/mo) | Predictable monthly need |
| "Team needs to self-serve without bottleneck" | Team ($199/mo) | Multiple users, brand guidelines |
| "Agency validates all client deliverables" | Agency ($599/mo) | High volume, white-label future |
| "Enterprise governance + audit trail" | Enterprise (custom) | API, compliance, custom SLAs |
| "High-risk campaign needs expert help" | Deep Mitigation Report ($X) | One-time expert guidance |
| "Campaign over $1M budget, need insurance" | Insurance referral (commission) | Risk transfer, not just assessment |

---

**The core job:** *"Turn AI content risk from a scary unknown into a quantified, manageable decision with documentation that satisfies legal, clients, and compliance - delivered through an interface so clear that both technical and non-technical stakeholders trust it instantly."*

**The mitigation extension:** *"When risk is identified, provide actionable remediation guidance and connect users to expert services (legal, insurance) for high-stakes situations."*

**The enterprise extension:** *"Create audit-ready provenance trails with custom brand rules that demonstrate responsible AI use and protect against liability claims."*

---

## PHASED ROLLOUT PLAN

### Phase 1: MVP Core (Weeks 1-4) - "It Works"
**Goal:** Free users can upload → see results → enter email → get sample report

**Must Have:**
- [ ] Landing page with upload zone
- [ ] Image upload + analysis (Gemini IP + Safety)
-[ ] C2PA verification (especialy important for EU cotnet EUGDPR/CCPA)
-[ ] Detailed provenance display
- [ ] Results display (score + top 3 findings)
- [ ] Email gate modal
- [ ] Sample report generation (2 pages)
- [ ] Basic auth (signup/login)
- [ ] Free tier quota enforcement (3 scans/month)
- [ ]Video support (with thumbnails)
- [ ]Brand guidelines
- [ ] Stripe integration (checkout + webhooks)
- [ ] $29 one-time report purchase
- [ ] Full 6-page report generation
- [ ] $49/mo Individual plan subscription
- [ ] Quota tracking + overage billing
- [ ] Billing & Usage page
- [ ] Payment method management
- [ ] Scan History view (see past scans)
- [ ] Policy/Brand Rules/Guidelines (upload + apply)
- [ ] Video support (paid tiers only)
- [ ] Email sequences (welcome, nurture, upgrade)
- [ ] Help & Docs section
- [ ] Team plan ($199/mo, 5 seats)
- [ ] Performance optimization (caching, CDN)
- [ ] Error monitoring (Sentry)
- [ ] Analytics (Posthog or similar)
- [ ] Customer support system (Intercom)
- [ ] Compliance documentation (SOC 2 prep)
- [ ] Backup/disaster recovery
- [ ] API rate limiting
- [ ] Referral tracking (who invited whom)

---

## DECISION FRAMEWORK

When implementation features use this prioritization:

### 1. Does it serve a core job?
✅ Yes → High priority
❌ No → Defer or cut

### 2. Does it block monetization?
✅ Yes → Must ship before Phase 2 complete
❌ No → Can wait

### 3. Does it require ongoing maintenance?
✅ Yes → De-prioritize (solo founder constraint)
❌ No → Prefer this approach

### 5. Does it differentiate us?
✅ Yes → Core feature, polish heavily
❌ No → Table stakes, ship fast, don't over-engineer

---

## (Do Not Build)

These seem useful but are out of scope:

❌ **Real-time monitoring of published content** - Different business model, expensive infrastructure
❌ **AI content generation** - We validate, not create - users have Midjourney/DALL-E
❌ **Competitor scanning** - Legal/ethical issues, different market
❌ **Social media scheduling** - Saturated market, not our competency
❌ **Design collaboration tools** - Figma exists, stay focused
❌ **Mobile native apps** - Web-first, mobile-responsive is enough for now
❌ **Plagiarism detection for text** - Image/video only, text is different product


---

## TECHNICAL DEBT TOLERANCE

We're building fast with AI agents. Some debt is acceptable:

### Acceptable Debt (Ship it):
- Duplicate code across components (refactor later when patterns emerge)
- Hard-coded copy in components (move to CMS later when content stabilizes)
- Manual admin tasks (build admin UI later when we have 100+ users)
- Basic error messages (polish when we see what actually breaks)
- Minimal test coverage (add tests for critical paths, not everything)

### Unacceptable Debt (Fix immediately):
- Security vulnerabilities (PII exposure, broken RLS, missing auth)
- Data loss scenarios (no backups, destructive actions without confirmation)
- Payment bugs (double charging, incorrect billing)
- Core flow blockers (can't upload, can't see results, can't pay)
- Performance cliffs (20+ second load times, memory leaks)

**Rule:** Ship with acceptable debt, but document it. Review debt quarterly and refactor top 3 pain points.

---

## EDGE CASES & ERROR HANDLING (Note to agent adjust if incorrect)

### When Things Go Wrong:

**Gemini API failure:**
- Retry once, then show user: "Analysis temporarily unavailable, try again in 60 seconds"
- Don't charge their quota if scan fails
- Log error for founder review

**C2PA verification error:**
- Continue with scan (don't block on provenance)
- Set provenance status = "error"
- Show user: "Unable to verify provenance (not a content issue)"

**Stripe webhook missed:**
- Retry webhook 3 times (Stripe does this automatically)
- After 3 failures: Manual review queue for founder
- Email user: "Payment confirmed, access granted" even if webhook delays

**Upload fails:**
- Show specific error: "File too large" / "Unsupported format" / "Network error"
- Don't make user re-authenticate
- Preserve form state (filename, selected brand profile)

**User hits quota limit:**
- Block upload with clear modal: "You've used 3/3 free scans"
- Show upgrade options immediately
- Don't lose uploaded file (save in temp state for post-upgrade)

### Progressive Enhancement:
- Core flow works without JavaScript (forms, auth)
- Images lazy load
- Realtime is enhancement (page still updates on refresh if websocket fails)
- If brand guidelines fail to load, show generic validation

---

## COPY & MESSAGING TONE

**Voice:** Professional but human. Confident without arrogance. Educational without condescension.

**Do:**
- "This content has high IP risk" ✅
- "You've saved $435 vs. per-scan pricing" ✅
- "[IP; Mickey Mouse] detected - Disney trademark" ✅

**Don't:**
- "Uh oh! Looks like trouble!" ❌ (too casual for legal context)
- "Our AI detected..." ❌ (users don't care about our tech)
- "You're doing it wrong" ❌ (blame user)

**Legal Disclaimer (always include):**
- "This is technical analysis, not legal advice"
- "Consult qualified legal counsel for final determination"
- "We assess risk, we don't guarantee outcomes"

**Severity Language:**
- 0-25: "Low risk - Safe to publish"
- 26-50: "Moderate risk - Review recommended"
- 51-75: "High risk - Address issues before publishing"
- 76-90: "Critical risk - Do not publish"



---

## FOUNDER DECISION LOG

Track major decisions here to maintain context:

| Date | Decision | Reasoning | Outcome |
|------|----------|-----------|---------|
| Jan 2026 | Chose Gemini api | multimodal and reasoning + costst | TBD |
| Jan 2026 | Freemium over paid-only | Lower barrier, email list growth | TBD |
| Jan 2026 | backend decisions to add  plus ther important ones
| Jan 2026 | Hierarchical Tenancy | Implemented Parent/Child tenants + `switch-tenant` API for Agencies | SUCCESS |

*(Update this table as major architectural decisions are made)*

---

## GLOSSARY (For AI Agents)

**Terms that might be ambiguous:**

- **Scan:** One uploaded image/video analyzed for risk
- **Finding:** Individual issue detected (e.g., "logo detected")
- **Report:** PDF document with full analysis
- **Sample Report:** 2-page teaser (free with email)
- **Full Report:** 6-page detailed analysis (paid)
- ** Mitigation Report:** Expert guidance for high-risk scans (premium)
- **Brand Profile/Guidelines:** User's custom rules
- **Provenance:** C2PA cryptographic verification of content origin
- **Tenant:** Organization (one tenant can have multiple users)
- **RLS:** Row Level Security (database isolation)
- **Overage:** Scans beyond monthly quota (billed extra)
- **ClearCheck Score:** Our composite 0-100 risk score
- **IP Risk:** Copyright/trademark infringement likelihood
- **Safety Risk:** Platform policy violations (NSFW, violence, etc.)

---

## CONTACT & ESCALATION

**When AI agents get stuck:**

1. Check this document first
2. Check .md in repo (for specific context)
3. Search existing code for similar patterns
4. If still unclear: Ask founder in chat (don't assume)


---

## INSPIRATION & REFERENCES

**Products we admire (study these):**
- **Stripe:** Self-serve pricing, docs, developer experience
- **Linear:** Speed, polish design
- **Figma:** Real-time collaboration, performance
- **Vercel:** Deploy experience, edge optimization
- **Supabase:** Developer experience, speed to value

**Design references:**
- **Braun:** Dieter Rams' 10 principles of good design
- **Lab equipment:** Keysight oscilloscopes, Fluke meters
- **Medical devices:** Clean, precise, authoritative interfaces



---

## DOCUMENT CHANGELOG

- **v1.0 (Jan 2026):** Initial North Star document created
- *(Future changes tracked here)*

---

**Last Review:** January 2026  
**Next Review:**
**Owner:** Yani Uzumaki  
**Status:** 🟢 Active Development

---


---

## TECHNICAL ENABLERS & BUSINESS LOGIC

### Technical Enablers
*   **Forensic Analysis**: Powered by **Google Gemini 1.5 Pro** (Multimodal) for reasoning capabilities that surpass simple pattern matching.
*   **Provenance Verification**: Built on **C2PA (Coalition for Content Provenance and Authenticity)** standards (`c2pa-node`) to cryptographically verify asset origins.
*   **Frictionless Access**: Enabled by **Supabase Anonymous Sessions** (custom RLS policies) allowing instant usage without signup.
*   **Global Payments**: Integrated with **Stripe** for immediate one-time reports or enterprise subscriptions.

### Business Logic (The "Freemium" Engine)
*   **The Hook**: Anonymous users can scan assets immediately (stored via `session_id`).
*   **The Gate**: High-level results are teased; full report download requires **Email Capture** (Magic Link).
*   **The Upsell**: Detailed "Deep Mitigation" or high-volume usage requires **Payment** (tracked via `purchased` boolean).

---

*End of North Star Document*
