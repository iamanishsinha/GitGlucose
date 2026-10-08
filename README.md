# GITGLUCOSE
> ### **"Roast the Git. Rescue with Glucose."**
> **GitHub Portfolio Intelligence & Evidence-Grounded Audit Engine**
> *PromptWars × The Prompt Arena Hackathon Build*

[![Tests](https://img.shields.io/badge/tests-18%20passed-success)](https://github.com/)
[![Node.js](https://img.shields.io/badge/node.js-v20%2B-blue)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![Deployment](https://img.shields.io/badge/deploy-Google%20Cloud%20Run-blueviolet)](https://cloud.google.com/run)

---

## 1. Challenge & Executive Summary

* **Event:** PromptWars × The Prompt Arena
* **Organizers:** Pondicherry University, IIC, Hack2Skill, Google Developer Groups (GDG), Google for Developers
* **Selected Challenge:** **GITHUB ROAST AND RESCUE**
* **Challenge Intent:** *"Give a messy GitHub profile the honest feedback it deserves."*

### Why GitGlucose?
Most AI profile tools produce generic, hallucinated flattery or superficial insults that offer zero actionable guidance. **GitGlucose** bridges this gap:
1. **Roast the Git:** Audits the public GitHub profile honestly with razor-sharp observational wit backed **strictly** by verifiable data.
2. **Rescue with Glucose:** Translates every detected flaw into a prioritized, measurable 30-minute prescription and a 7-day recovery roadmap.

---

## 2. Problem Statement & Target Persona

### Primary Persona
* **Target Audience:** Computer Science students, boot camp graduates, early-career engineers, and hackathon competitors preparing for technical internships and full-time hiring.
* **The Reality:** 
  - Over **70%** of early-career GitHub profiles suffer from blank bios, missing profile READMEs, vague repository titles (`test-1`, `final_proj`), absent descriptions, and zero installation documentation.
  - Technical recruiters spend only **15 to 30 seconds** scanning a public GitHub before deciding whether to shortlist or pass.
* **The Solution:** GitGlucose gives candidates an immediate simulation of what a recruiter notices, proves *why* the roast happened via transparent fact-to-inference tracing, and prescribes exact steps to maximize portfolio signal.

---

## 3. Core Product Philosophy & Architecture

```
                    ┌──────────────────────────────────────────────┐
                    │            PUBLIC GITHUB PROFILE             │
                    └──────────────────────┬───────────────────────┘
                                           │
                           Parallel REST Calls (User + Repos + README)
                                           │
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │          CANONICAL NORMALIZATION             │
                    └──────────────────────┬───────────────────────┘
                                           │
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │      DETERMINISTIC ANALYSIS ENGINE           │
                    │   • 5-Dimension Score Calculation            │
                    │   • Fact ➔ Inference ➔ Action Findings       │
                    │   • Composite Repo Ranking & Lifecycle       │
                    │   • Recruiter Attention Simulation           │
                    │   • Simulated Before/After Projection        │
                    └──────────────────────┬───────────────────────┘
                                           │
                            Constrained Audit Payload
                                           │
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │       GEMINI 2.5 FLASH PERSONALITY           │
                    │      (Personality & Roast Writing ONLY)      │
                    │     * Seamless Deterministic Fallback *      │
                    └──────────────────────┬───────────────────────┘
                                           │
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │        CANONICAL ANALYSISRESULT OBJECT       │
                    └──────────────────────┬───────────────────────┘
                                           │
     ┌─────────────────────────────────────┴─────────────────────────────────────┐
     ▼                                     ▼                                     ▼
QUICK ROAST                           DEEP ROAST                            RECRUITER EYE
 • Health Score (0-100)                • Traceable Evidence                  • 30-Sec Timeline
 • Witty Roast Lines                   • Consistency Matrix                  • Shortlist Sim
 • Dimension Breakdown                 • AI-Assistance Signal                • Gaps & Strengths
     │                                     │                                     │
     └─────────────────────────────────────┼─────────────────────────────────────┘
                                           ▼
                                      RESCUE PLAN
                               • 30-Minute Quick Prescription
                               • 7-Day Full Recovery Roadmap
                               • Simulated +Points Potential
```

### Critical Architectural Rule
> **The Deterministic Engine decides what is true. Gemini decides how to say it.**
- Gemini **never** invents facts or calculates scores.
- The backend evaluates the profile deterministically, compiles verified evidence, and passes a constrained payload to Gemini for witty delivery.
- If Gemini times out, hits rate limits, or is unconfigured, GitGlucose's **Deterministic Fallback Engine** generates 100% reliable roast lines and bio suggestions. The product never crashes.

---

## 4. Deterministic Scoring System

Profiles are evaluated across 5 weighted dimensions to produce the final **Git Health Score (0–100)**:

| Dimension | Weight | Signals Evaluated |
|---|:---:|---|
| **First Impression** | **25%** | Profile bio completeness, Profile README presence, distinct user identity, social/blog links. |
| **Repository Hygiene** | **20%** | Percentage of repositories with descriptions (>=15 chars), README coverage, and noise/junk repository avoidance. |
| **Substance** | **25%** | Original non-fork ratio, code size (>50 KB), multi-repository volume, and community validation. |
| **Activity Momentum** | **20%** | Public push recency (`pushed_at`), activity concentration, and commits in the last 30/90/180/365 days. |
| **Technical Range** | **10%** | Language count and balance across repositories (penalizing superficial 1-line file accumulation). |

### Verdict Tiers
* `90–100`: **EXCEPTIONAL** — High-signal portfolio ready for senior review.
* `75–89`: **STRONG** — Solid foundation requiring only polish and live deployment links.
* `60–74`: **DEVELOPING** — Good project seeds buried under uneven presentation and documentation gaps.
* `40–59`: **MESSY / NEEDS WORK** — High noise-to-signal ratio; recruiter attention will drop off quickly.
* `0–39`: **BLANK / VERY WEAK SIGNAL** — Sparse public footprint; urgent rescue required.

---

## 5. Recruiter Eye: 30-Second Attention Simulation

Simulates how a technical recruiter or engineering manager scans a GitHub portfolio:

1. **0–5 sec — Identity & First Impression:** Bio presence and clarity of engineering focus.
2. **5–10 sec — Profile Landing & Context:** Profile README presence and pinned repositories.
3. **10–20 sec — Project Selection & Depth:** Top 3 repository titles, descriptions, and substance.
4. **20–25 sec — Technology Stack Clarity:** Dominant languages and stack consistency.
5. **25–30 sec — Activity & Commitment:** Recency of pushes and ongoing learning momentum.

### Shortlist Simulation (🟢 SHORTLIST / 🟡 MAYBE / 🔴 PASS)
* Clearly labeled as an **analytical portfolio simulation**, never an absolute hiring decision.

---

## 6. The Rescue System

* **30-Minute Quick Prescription:** 5 time-boxed actions (0–5m, 5–10m, 10–20m, 20–27m, 27–30m) with interactive checkboxes and a live progress tracker.
* **7-Day Full Recovery Roadmap:** Structured daily roadmap from Day 1 (Identity) to Day 7 (Recruiter Benchmark).
* **Recovery Projection Simulation:** Projects realistic potential score gains (e.g. `+14 PTS`) based on addressable findings.

---

## 7. Advanced Featured Intelligence

1. **Repository Ranking:** Evaluates every repository across 6 criteria (Clarity, Documentation, Substance, Activity, Completeness, Portfolio Relevance) and tags them with Signal (`HIGH SIGNAL`, `MEDIUM SIGNAL`, `LOW SIGNAL`, `NOISE / EXPERIMENTAL`) and Lifecycle (`ACTIVE`, `EXPERIMENTAL`, `STALE`, `ABANDONED`).
2. **Technology Intelligence:** Analyzes language distribution and separates **Detected** languages from **Inferred** framework ecosystems.
3. **Activity Analytics:** Breakdown of push recency across time buckets (30d, 90d, 180d, 365d, >1y).
4. **Career Positioning:** Interactive alignment matrices for roles (Full Stack, Backend, Frontend, AI/ML, DevOps, Generalist).
5. **Compare Profiles:** Side-by-side comparison between two developers generating objective, neutral observations without declaring who is "better".
6. **Roast History:** Saved locally in browser `localStorage`.
7. **Markdown Export:** Generates and downloads a timestamped report (`gitglucose_<username>_<timestamp>.md`).

---

## 8. Judging Evaluation Parameters Alignment

### 1. Code Quality
* Pure modular architecture: cleanly separated into `server/` (scoring, github, rules, analyzer, validation, fallback) and `public/` (accessible UI).
* Zero messy monolithic files. Single source of truth canonical `AnalysisResult`.

### 2. Security
* Strict GitHub username regex validation (`^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$`).
* Production security headers: `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`.
* In-memory sliding-window per-IP rate limiting (30 requests/min).
* **Zero secrets exposed**: `GEMINI_API_KEY` and `GITHUB_TOKEN` remain strictly server-side; `.env` is ignored by git.

### 3. Efficiency & Repository Size
* **Zero bloated client bundles**: Vanilla ES modules with sub-50ms page load.
* Total repository code size is **< 1 MB** (well under the **10 MB limit**).
* Exactly **one branch** (`main`).
* Parallel GitHub API fetches using `Promise.all`.
* Bounded LRU/TTL in-memory caching (10 min TTL, max 200 items).

### 4. Testing
* Built with Node.js native `node:test` and `node:assert`.
* **18 comprehensive unit & integration tests** covering validation, rules, repository scoring, fallback roasts, profile comparison, master analyzer, and API endpoints.

```bash
npm test
```

### 5. Accessibility (WCAG Compliant)
* Semantic HTML5 elements (`<main>`, `<aside>`, `<nav>`, `<button>`).
* Visible focus rings (`:focus-visible`) across all interactive elements.
* Screen reader live regions (`aria-live="polite"`) for audit announcements.
* Contrast compliant dark editorial palette.
* Full `@media (prefers-reduced-motion: reduce)` support.

### 6. Problem Statement Alignment
* Specifically built for **GitHub Roast and Rescue**.
* Tagline: **"Roast the Git. Rescue with Glucose."**

---

## 9. Local Setup & Testing

### Prerequisites
* Node.js v20+ or v22+
* npm

### Quick Start
```bash
# 1. Clone repository
git clone https://github.com/<username>/GitGlucose.git
cd GitGlucose

# 2. Configure environment (optional)
cp .env.example .env

# 3. Run automated tests
npm test

# 4. Start local production server
npm start
```
Open [http://localhost:8080](http://localhost:8080) in your browser.

---

## 10. Cloud Run Deployment

GitGlucose is containerized and ready for Google Cloud Run:

```bash
# Build & Deploy to Google Cloud Run
gcloud run deploy gitglucose \
  --source . \
  --region asia-south1 \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars="NODE_ENV=production,GEMINI_MODEL=gemini-2.5-flash" \
  --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest"
```

* Cloud Run Health Check Endpoint: `GET /healthz` returns `{"ok": true, "status": "healthy"}`.

---

## 11. Assumptions & Data Limitations

1. **Public Data Only:** Only public GitHub profile and repository metadata are accessible; private repositories/commits are not factored in.
2. **Activity Proxy:** Repository push timestamps (`pushed_at`) serve as an activity proxy.
3. **AI-Assistance Signal:** Calculated via repository naming and topic heuristics; public metadata cannot measure exact code percentage authorship.
4. **Simulations:** Recruiter Shortlist and Before/After projections are analytical simulations, not hiring guarantees.

---

## 12. LinkedIn Post Template

```text
🚀 Excited to unveil GitGlucose for the PromptWars × The Prompt Arena Hackathon!

Challenge: GitHub Roast and Rescue
Tagline: "Roast the Git. Rescue with Glucose."

Most portfolio reviews are either generic flattery or superficial roasts. We built GitGlucose to change that.

🔍 What it does:
1. Quick Roast: Witty, observational roast backed strictly by verifiable GitHub data.
2. Recruiter Eye: 30-second simulation of recruiter attention and shortlist probability.
3. Deep Roast: Fact ➔ Inference ➔ Prescription traceability.
4. Rescue Plan: 30-minute quick prescription & 7-day recovery roadmap.

Built with pure Node.js, deterministic scoring engines, Gemini 2.5 Flash, and deployed on Google Cloud Run.

Check it out:
GitHub: https://github.com/<user>/GitGlucose.git
Live App: https://gitglucose-service.run.app

#PromptWars #GoogleDevelopers #GDG #GitHub #Gemini #Hackathon #WebDev
```
#   G i t _ G l u c o s e  
 #   G i t G l u c o s e  
 