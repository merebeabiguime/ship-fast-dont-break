# Ship Fast, Don't Break: Deploying Often in Early-Stage Without Automated Tests

> **50+ deployments. 0 rollbacks. 0 major crashes.** No automated tests, no QA team, just a structured human process and isolated architecture.

## The Problem

Early-stage startups face a painful paradox:

- **You need to ship fast** to iterate on product-market fit
- **You can't afford** a QA team, comprehensive test suites, or complex CI/CD
- **Every deployment is stressful** because one mistake can break production
- **Your team is small** (2-4 people) and non-technical members need to validate features

Most advice says "write tests" or "hire QA." But when you're bootstrapped, shipping 3-5 features per week, and pivoting constantly, that's not realistic.

**This repo documents how I solved this at [Tipntap](https://tipntap.fr)**, a B2B SaaS for restaurants that I co-founded and built over ~1 year.

---

## The Solution: Structured Human Validation + Isolated Architecture

Instead of fighting the constraints, I built a system that works *with* them:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         THE DEPLOYMENT SYSTEM                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   1. ISOLATED COMPONENTS          2. STAGING = PROD MIRROR              │
│   ┌──────────┐ ┌──────────┐       ┌─────────────────────────┐          │
│   │ Frontend │ │ Backend  │       │  Same infra, same data  │          │
│   │Cloudflare│ │EC2+Docker│       │  Non-tech can test      │          │
│   └──────────┘ └──────────┘       │  autonomously           │          │
│   ┌──────────┐ ┌──────────┐       └─────────────────────────┘          │
│   │Migrations│ │ ENV files│                                             │
│   │ Bastion  │ │    S3    │       3. HUMAN VALIDATION                   │
│   └──────────┘ └──────────┘       ┌─────────────────────────┐          │
│                                    │  Structured tickets     │          │
│   Each component deploys           │  Step-by-step testing   │          │
│   independently = isolated         │  2-3 people validate    │          │
│   blast radius                     │  before prod            │          │
│                                    └─────────────────────────┘          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Key Principles

| Principle | Implementation | Why It Works |
|-----------|----------------|--------------|
| **Isolate blast radius** | Separate repos for frontend, backend, migrations | A frontend bug can't crash the API |
| **Mirror staging to prod** | Same Docker images, same infra, different instances | What works in staging works in prod |
| **Structured human testing** | Tickets with step-by-step "how to test" | Non-tech teammates can validate autonomously |
| **Multiple validators** | 2-3 people test each feature before prod | Catches edge cases humans notice, machines miss |
| **Version everything** | ENV files versioned on S3 with semver | Can always trace back to a known good state |

---

## Results

Over ~1 year of active development:

| Metric | Value |
|--------|-------|
| **Total deployments** | 50+ |
| **Rollbacks needed** | 0 |
| **Major production crashes** | 0 |
| **Automated test coverage** | 0% |
| **Team size** | 2-4 people |
| **Monthly AWS cost** | < $50 |

---

## What's in This Repo

This repository contains the actual infrastructure code I used, with detailed comments explaining the *why* behind each decision.

```
ship-fast-dont-break/
├── README.md                 # You are here
├── docs/
│   ├── EVOLUTION.md          # How the process evolved (chaos → structure)
│   ├── ARCHITECTURE.md       # Infrastructure diagram + decisions
│   └── WORKFLOW.md           # The human validation workflow
├── pipelines/
│   ├── backend/
│   │   ├── deploy-staging.yml    # Auto-deploy on push to main
│   │   └── deploy-production.yml # Deploy on push to production branch
│   └── migrations/
│       └── deploy-migrations.yml # Manual trigger with command choice
├── docker/
│   ├── Dockerfile.api        # Multi-stage build for Node.js API
│   └── Dockerfile.migrations # Ephemeral container for DB migrations
├── scripts/
│   └── upload-env-to-s3.js   # CLI tool to version ENV files
└── templates/
    └── ticket-template.md    # Structured ticket for human validation
```

---

## Quick Links

- **[Evolution: From Chaos to System](docs/EVOLUTION.md)** — The 4 phases our process went through
- **[Architecture Deep Dive](docs/ARCHITECTURE.md)** — Why each component is separated
- **[The Human Validation Workflow](docs/WORKFLOW.md)** — How we test without automated tests

---

## Who Is This For?

This approach works best if you:

- Are at **early-stage** (pre-seed to Series A)
- Have a **small team** (2-5 people) with non-technical members
- Need to **ship fast** (multiple deploys per week)
- Are **bootstrapped** or budget-constrained
- Can't justify the time investment in comprehensive automated testing *yet*

It's **not** a replacement for automated testing at scale. Once you have product-market fit and a larger team, invest in proper test infrastructure.

---

## The Honest Trade-offs

This system isn't perfect. Here's what I'd improve with more resources:

| Trade-off | Impact | Future Solution |
|-----------|--------|-----------------|
| Manual ENV deployment | Sometimes forgot to push updated ENV | Automate with GitHub Actions secrets sync |
| No orchestration | Deploy order matters (migrations before API) | Use deployment dependencies or monorepo |
| Human testing takes time | ~30min-1h per feature validation | Add smoke tests for critical paths |
| No regression tests | Could break old features unknowingly | Add E2E tests for core user journeys |

---

## About the Author

I'm a **Product Engineer** who built Tipntap's entire technical stack solo while my co-founders handled business and design.

- **Stack**: TypeScript, React, Node.js, MySQL, AWS, Cloudflare
- **Looking for**: Product Engineer roles at B2B SaaS startups (early-stage to Series A)

**Other showcase repos:**
- [Frontend MVP Architecture](https://github.com/merebeabiguime/frontend-mvp-architecture) — How I structure React apps for rapid iteration

---

## License

MIT — Feel free to use this as a template for your own deployment process.
