# GitGlucose

> **"Roast the Git. Rescue with Glucose."**  
> An evidence-grounded GitHub portfolio auditor that gives candidates an honest, data-backed roast, simulates 30 seconds of recruiter attention, and prescribes an actionable rescue plan.

[![Tests](https://img.shields.io/badge/tests-32%20passed-success?style=flat-square)](https://github.com/iamanishsinha/Git_Glucose)
[![Node.js](https://img.shields.io/badge/node.js-v20%2B-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![Cloud Run](https://img.shields.io/badge/deploy-Google%20Cloud%20Run-4285F4?style=flat-square&logo=googlecloud&logoColor=white)](https://cloud.google.com/run)
[![Single Branch](https://img.shields.io/badge/git%20branch-main%20only-informational?style=flat-square)](https://github.com/iamanishsinha/Git_Glucose)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [The Problem & Target Persona](#the-problem--target-persona)
3. [The 5-Step Audit Journey](#the-5-step-audit-journey)
4. [Architecture & Philosophy](#architecture--philosophy)
5. [Deterministic Scoring Engine](#deterministic-scoring-engine)
6. [30-Second Recruiter Attention Scan](#30-second-recruiter-attention-scan)
7. [Rescue System & Live Score Projection](#rescue-system--live-score-projection)
8. [Side-by-Side Profile Comparison](#side-by-side-profile-comparison)
9. [Token Security & GitHub API Usage Rules](#token-security--github-api-usage-rules)
10. [Repository Structure](#repository-structure)
11. [Getting Started & Local Development](#getting-started--local-development)
12. [Cloud Run Deployment](#cloud-run-deployment)
13. [Hackathon Alignment](#hackathon-alignment)

---

## Executive Summary

* **Event:** PromptWars × The Prompt Arena
* **Organizers:** Pondicherry University, IIC, Hack2Skill, Google Developer Groups (GDG), Google for Developers
* **Track:** **GitHub Roast and Rescue**
* **Repository:** [https://github.com/iamanishsinha/Git_Glucose.git](https://github.com/iamanishsinha/Git_Glucose.git)

Most AI portfolio feedback tools generate generic flattery or superficial roasts detached from reality. **GitGlucose** takes a radically grounded approach:
1. **Roast the Git:** Audits the candidate's public GitHub footprint with sharp observational wit, backed strictly by verified facts (no hallucinations).
2. **Rescue with Glucose:** Translates detected vulnerabilities into an immediate 30-minute quick-win checklist and a structured 7-day engineering sprint roadmap.

---

## The Problem & Target Persona

### Target Persona
Computer science students, bootcamp graduates, early-career developers, and hackathon competitors preparing for internship and junior engineering screening.

### The Reality
* **Recruiter Window:** Technical recruiters spend **15 to 30 seconds** scanning a candidate's GitHub before deciding whether to shortlist or reject.
* **Common Gaps:** Over 70% of candidate profiles suffer from blank bios, missing profile READMEs, vague repository names (`test-1`, `final_proj`), absent descriptions, and zero live demo links.
* **The Solution:** GitGlucose gives candidates an instant simulation of recruiter scrutiny, transparent evidence tracing, and prioritized fixes to maximize portfolio signal.

---

## The 5-Step Audit Journey

GitGlucose features a responsive Single Page Application (SPA) dashboard structured across 5 dedicated views:

```
[ 1. Quick Roast ] ➔ [ 2. Deep Dive ] ➔ [ 3. Rescue Plan ] ➔ [ 4. Career Fit ] ➔ [ 5. Compare ]
```

| Step | View | Key Highlights |
|:---:|---|---|
| **1** | **Quick Roast** | 5-axis overall Git Health Score (0–100), verdict tier badge, sharp data-grounded roast bullets, suggested bio rewrite, and one-click navigation forks. |
| **2** | **Deep Dive** | Interactive 5-axis SVG Radar Geometry, 30-second recruiter simulation breakdown, and a ranked repository table with signal and lifecycle tags. |
| **3** | **Rescue Plan** | 30-Minute time-boxed checklist with interactive checkboxes that dynamically increase your projected score in real time, plus a 7-day sprint plan. |
| **4** | **Career Fit** | In-place role positioning against 6 developer profiles (*Full Stack, Backend, Frontend, AI/ML, DevOps, Generalist*) with matched evidence. |
| **5** | **Compare** | Real side-by-side profile battle: overall winner declaration, 9-category winner grid, comparative progress bars, and custom strengths/improvements. |

---

## Architecture & Philosophy

```
                    ┌──────────────────────────────────────────────┐
                    │            PUBLIC GITHUB PROFILE             │
                    └──────────────────────┬───────────────────────┘
                                           │
                           Parallel REST Calls (User + Repos + README)
                           Auto-Pagination for 10, 50, 100+ Repositories
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
                    │   • 30-Second Recruiter Attention Model      │
                    │   • Precomputed 6-Role Career Matrices       │
                    │   • Dynamic Score Projection Model           │
                    └──────────────────────┬───────────────────────┘
                                           │
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │    ROAST DELIVERY & ZERO-FAIL FALLBACK       │
                    │   • Strict Fact-to-Inference Grounding       │
                    │   • 100% Reliable Deterministic Fallback     │
                    │   • Zero External Runtime Dependencies       │
                    └──────────────────────┬───────────────────────┘
                                           │
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │          INTERACTIVE SPA DASHBOARD           │
                    │   [Roast] [Deep] [Rescue] [Career] [Compare] │
                    └──────────────────────────────────────────────┘
```

### Core Architectural Principle
> **The Deterministic Engine decides what is true. The Delivery Layer decides how to present it.**
* The analyzer compiles verified facts (repository sizes, description hygiene, commit momentum, README coverage).
* If external AI providers hit rate limits or are disabled, GitGlucose's **Deterministic Delivery Engine** takes over seamlessly. The application never fails or crashes.

---

## Deterministic Scoring Engine

GitGlucose computes an overall **Git Health Score (0–100)** across five mathematically weighted dimensions:

| Dimension | Weight | Signals Evaluated |
|---|:---:|---|
| **First Impression** | **25%** | Display name presence, bio completeness, profile README presence, social/blog links. |
| **Repository Hygiene** | **20%** | Percentage of repositories with descriptions (>=15 chars), README documentation coverage, and noise repository avoidance. |
| **Substance** | **25%** | Original non-fork ratio, code depth (>50 KB), multi-repository volume, and community validation. |
| **Activity Momentum** | **20%** | Public push recency (`pushed_at`), activity distribution, and commit recency. |
| **Technical Range** | **10%** | Language count and balance across repositories (penalizing superficial single-line repository padding). |

### Verdict Tiers
* `90–100`: **EXCEPTIONAL** — High-signal portfolio ready for senior engineering review.
* `75–89`: **STRONG** — Solid foundation requiring targeted polish and live demo URLs.
* `60–74`: **DEVELOPING** — Good project seeds buried under uneven presentation and documentation gaps.
* `40–59`: **MESSY / NEEDS WORK** — High noise-to-signal ratio; recruiter attention drops off rapidly.
* `0–39`: **BLANK / CRITICAL** — Sparse public footprint; urgent portfolio rescue required.

---

## 30-Second Recruiter Attention Scan

GitGlucose models the real-world cognitive process of a technical recruiter scanning a GitHub profile:

```
[0–5 SEC]   Identity & First Impression  ➔ Bio completeness & engineering direction
[5–10 SEC]  Profile Landing & Context    ➔ Profile README front door & flagship project
[10–20 SEC] Repository Selection & Depth ➔ Original codebases vs forks, README depth & size
[20–25 SEC] Live Demos & Consistency     ➔ Working demo URLs & commit momentum
[25–30 SEC] Screening Verdict            ➔ Shortlist Decision (SHORTLIST / MAYBE / PASS)
```

All 5 windows are dynamically populated with real candidate data, key signals, and actionable feedback.

---

## Rescue System & Live Score Projection

* **30-Minute Quick Wins:** Time-boxed tasks (5m, 10m, 15m) targeting immediate high-impact fixes (e.g. bio rewrite, adding missing descriptions, linking live deployments).
* **Interactive Score Booster:** Checking off completed tasks immediately increases the candidate's projected score in real time (`+4 pts` per task completed).
* **7-Day Sprint:** Structured daily engineering roadmap taking a portfolio from messy to recruiter-ready:
  - *Day 1:* Profile Front Door & Identity
  - *Day 2:* Flagship Project Architecture Documentation
  - *Day 3:* Code Hygiene & Junk Repo Archive
  - *Day 4:* Live Deployments & Demo Links
  - *Day 5:* Technology Stack Evidence Alignment
  - *Day 6:* Commit Momentum & Polish
  - *Day 7:* Recruiter Benchmark & Final Verification

---

## Side-by-Side Profile Comparison

Compare any two GitHub profiles side-by-side:
* **Current Audit Pre-fill:** Profile A automatically reflects your active audit.
* **Overall Winner Card:** Highlights the stronger overall portfolio and the lead differential (e.g., `@iamanishsinha takes the lead (+25 pts)`).
* **Category Winners Grid:** 9 distinct category cards (Overall Health, Code Hygiene, Substance, Momentum, Language Diversity, Stars, Repositories, Followers, Live Demos).
* **Comparative Metric Bars:** Side-by-side visual indicators with units.
* **Custom Actionable Takeaways:** Tailored strengths and specific improvement areas for both developers.

---

## Token Security & GitHub API Usage Rules

GitGlucose strictly adheres to production token management principles:

1. **Default Mode is Public:** Development, local runs, automated tests, and judge evaluations run under `GITHUB_AUTH_MODE=public`.
2. **TOKEN PRESENT ≠ TOKEN AUTHORIZED FOR USE:** The server will never silently consume a token unless `GITHUB_AUTH_MODE=authenticated` is explicitly configured.
3. **No Automatic Token Fallback:** If GitHub returns `429 Rate Limited`, the system displays a clear and structured rate-limit advisory instead of secretly consuming personal credentials.
4. **Zero Tracked Secrets:** All `.env` and `Token.env` files are excluded from Git tracking via `.gitignore`.
5. **DNS IPv4 Optimization:** Automatically enforces IPv4 resolution order (`dns.setDefaultResultOrder('ipv4first')`) to prevent Windows IPv6 connection timeouts.

---

## Repository Structure

```
GitGlucose/
├── public/                       # Static Frontend (Zero build step, vanilla ES modules)
│   ├── index.html                # Accessible semantic HTML5 layout & SPA views
│   ├── styles.css                # Custom CSS (Inter + JetBrains Mono, WCAG contrast)
│   └── app.js                    # SPA state machine, SVG radar chart, interactive checklist
├── server/                       # Node.js HTTP Server & Core Intelligence Engines
│   ├── index.html                # (Root redirection guard)
│   ├── index.js                  # Production HTTP server, rate limiter, security headers
│   ├── github.js                 # GitHub API client, pagination, memory caching, DNS resolver
│   ├── analyzer.js               # 5-axis scoring, recruiter scan, and role positioning
│   ├── comparison.js             # Neutral, side-by-side developer comparison engine
│   ├── validate.js               # Strict GitHub username validation and sanitization
│   ├── rules.js                  # Score weight constants and role matrices
│   ├── fallback.js               # Zero-failure deterministic roast generation
│   └── gemini.js                 # Optional Gemini Flash personality enhancement
├── scripts/                      # Pre-submission verification protocols
│   └── verify-submission.js      # 5-stage verification (tests, branches, secrets, size, docker)
├── test/                         # Native node:test suite (Zero external dependencies)
│   ├── analyzer.test.js          # Scoring engine accuracy tests
│   ├── comparison.test.js        # Comparative differential tests
│   ├── endpoints.test.js         # HTTP API endpoint tests
│   ├── fallback.test.js          # Fallback reliability tests
│   ├── github-auth.test.js       # Strict token control and auth mode tests
│   ├── repository.test.js        # Repo ranking and signal tests
│   ├── rules.test.js             # Weight balance and matrix tests
│   ├── validation.test.js        # Username and input sanitization tests
│   └── flow-verification.js      # End-to-end integration verification script
├── Dockerfile                    # Multi-stage production container for Cloud Run
├── .dockerignore                 # Container build exclusions
├── .gitignore                    # Secrets, node_modules, and cache ignore rules
├── .env.example                  # Template configuration file
├── package.json                  # Scripts and manifest (zero external dependencies)
└── README.md                     # Comprehensive documentation
```

---

## Getting Started & Local Development

### Prerequisites
* **Node.js**: `v20.0.0` or higher
* **npm**: `v9.0.0` or higher

### Quick Start (3 Steps)

```bash
# 1. Clone the repository
git clone https://github.com/iamanishsinha/Git_Glucose.git
cd Git_Glucose

# 2. Run automated test suite (32 tests)
npm test

# 3. Start the production server
npm start
```

Visit **[http://localhost:8080](http://localhost:8080)** in your browser.

---

## Verification Protocols

Run the official pre-submission compliance audit:

```bash
npm run verify
```

Expected output:
```text
====================================================
  GITGLUCOSE PRE-SUBMISSION VERIFICATION PROTOCOL
====================================================
[1/5] Running automated test suite (node:test)...
  ✔ All tests passed successfully (32/32).
[2/5] Checking Git branches (Must have EXACTLY ONE branch)...
  ✔ Exactly one branch detected: * main
[3/5] Scanning for sensitive environment secrets in Git index...
  ✔ No forbidden secret files tracked in Git.
[4/5] Checking repository size (Must be LESS THAN 10 MB)...
  Total project code size: ~0.26 MB (< 10 MB limit).
[5/5] Checking Cloud Run Dockerfile and healthcheck requirements...
  ✔ Dockerfile and .dockerignore are present.
====================================================
  VERIFICATION RESULT: ALL CHECKS PASSED (100% READY)!
====================================================
```

---

## Cloud Run Deployment

GitGlucose is fully containerized and deployable to Google Cloud Run:

```bash
# Deploy to Google Cloud Run
gcloud run deploy gitglucose \
  --source . \
  --region asia-south1 \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars="NODE_ENV=production,PORT=8080,GITHUB_AUTH_MODE=public"
```

* **Healthcheck Endpoint:** `GET /healthz` returns `{"ok": true, "status": "healthy", "version": "1.0.0"}` with HTTP 200.

---

## Hackathon Alignment

| Judging Parameter | Implementation in GitGlucose |
|---|---|
| **Code Quality & Architecture** | Modular Node.js ESM architecture with cleanly separated concerns. Canonical `AnalysisResult` contract. Zero spaghetti code. |
| **Security & Privacy** | Strict regex input sanitization, CSP/nosniff/X-Frame headers, in-memory IP rate limiting, zero tracked secrets. |
| **Efficiency & Repository Size** | Zero bloated client frameworks. Sub-50ms page load. Total project code size is **0.26 MB** (well under the 10 MB limit). |
| **Testing & Reliability** | **32 automated tests** using native `node:test`. 100% deterministic fallback guarantees zero crashes even under API outages. |
| **Accessibility (WCAG)** | Semantic HTML5, visible focus indicators, screen reader live regions (`aria-live`), high-contrast SaaS palette, reduced motion support. |
| **Challenge Alignment** | Specifically designed for the **GitHub Roast and Rescue** challenge. Tagline: *"Roast the Git. Rescue with Glucose."* |

---

## License

This project is licensed under the [MIT License](LICENSE).