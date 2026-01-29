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

## Who Is This For?

This approach works best if you:

- Are at **early-stage** (pre-seed to Series A)
- Have a **small team** (2-5 people) with non-technical members
- Need to **ship fast** (multiple deploys per week)
- Are **bootstrapped** or budget-constrained
- Can't justify the time investment in comprehensive automated testing *yet*

It's **not** a replacement for automated testing at scale. Once you have product-market fit and a larger team, invest in proper test infrastructure.

---

## 🚀 Getting Started

### Clone the Repository

```bash
git clone https://github.com/merebeabiguime/ship-fast-dont-break.git
cd ship-fast-dont-break
```

### Structure du Projet

```
ship-fast-dont-break/
├── README.md                         # You are here!
├── docs/
│   ├── EVOLUTION.md                  # How the process evolved (chaos → structure)
│   ├── ARCHITECTURE.md               # Infrastructure diagrams + decisions
│   └── WORKFLOW.md                   # The human validation workflow
├── pipelines/
│   ├── backend/
│   │   ├── deploy-staging.yml        # Auto-deploy on push to main
│   │   └── deploy-production.yml     # Deploy on push to production branch
│   └── migrations/
│       └── deploy-migrations.yml     # Manual trigger with command choice
├── docker/
│   ├── Dockerfile.api                # Multi-stage build for Node.js API
│   └── Dockerfile.migrations         # Ephemeral container for DB migrations
├── scripts/
│   └── upload-env-to-s3.js           # CLI tool to version ENV files
└── templates/
    └── ticket-template.md            # Structured ticket for human validation
```

### Explorer le Code

**Parcours recommandé pour comprendre le système :**

1. **Comprendre l'évolution** → [`docs/EVOLUTION.md`](./docs/EVOLUTION.md) — Du chaos initial au système mature
2. **Voir l'architecture** → [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — Diagrammes Mermaid + décisions
3. **Le workflow humain** → [`docs/WORKFLOW.md`](./docs/WORKFLOW.md) — Comment tester sans tests automatisés
4. **Pipeline staging** → [`pipelines/backend/deploy-staging.yml`](./pipelines/backend/deploy-staging.yml) — Auto-deploy commenté
5. **Dockerfile API** → [`docker/Dockerfile.api`](./docker/Dockerfile.api) — Multi-stage build expliqué
6. **Template de ticket** → [`templates/ticket-template.md`](./templates/ticket-template.md) — Le format qui structure la validation

**Tous les fichiers sont hyper-commentés** pour expliquer le "pourquoi" de chaque décision.

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

## 📝 À Propos : Product Engineer

### Mon Parcours

En tant que **Product Engineer chez Tipntap** (startup early-stage B2B SaaS), j'ai dû résoudre un problème que beaucoup de startups rencontrent :

> Comment déployer souvent sans casser la prod quand on n'a ni budget QA, ni temps pour des tests automatisés complets ?

Ma réponse : **un système de validation humaine structuré + une architecture qui isole les risques**.

**Résultat sur 1 an :** 50+ déploiements, 0 rollback, 0 crash majeur — avec une équipe de 2-4 personnes et < $50/mois d'infra.

### Ce Que Je Recherche

Je cherche des opportunités en tant que **Product Engineer** dans des startups early-stage qui :
- Valorisent l'excellence technique ET le product thinking
- Veulent construire vite sans sacrifier la stabilité
- Comprennent qu'un bon process vaut mieux que zéro bug
- Cherchent quelqu'un qui a déjà vécu les contraintes early-stage

### Compétences

**Backend & DevOps :**
- Node.js + TypeScript
- Docker + CI/CD (GitHub Actions)
- AWS (EC2, RDS, S3, ECR, SSM)
- Infrastructure as Code
- Database migrations (Sequelize)

**Frontend :**
- React 18 + TypeScript
- Redux Toolkit
- Cloudflare Pages

**Product Engineering :**
- MVP → Product-Market Fit
- Itérations rapides basées sur feedbacks
- Architecture évolutive
- Gestion de la dette technique
- Process de validation humaine

### Contact

- 📧 Email : [merebeabiguime@outlook.fr](mailto:merebeabiguime@outlook.fr)
- 💼 LinkedIn : [linkedin.com/in/mérébé-abiguime-96b4842b2](https://www.linkedin.com/in/mérébé-abiguime-96b4842b2)
- 🐙 GitHub : [@merebeabiguime](https://github.com/merebeabiguime)
- 🌐 Portfolio : [merebeabiguime.com](https://merebeabiguime.com)

---

## 📚 Ressources Supplémentaires

### Autres Repos Showcase

- **[Frontend MVP Architecture](https://github.com/merebeabiguime/frontend-mvp-architecture)** — Comment je structure mes apps React pour itérer rapidement

### Références

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Multi-Stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [AWS Systems Manager (SSM)](https://docs.aws.amazon.com/systems-manager/latest/userguide/what-is-systems-manager.html)
- [The Twelve-Factor App](https://12factor.net/) — Principes de déploiement modernes

---

## 📄 License

MIT License — Utilisez librement ce code comme template pour vos propres déploiements.

---

## ⭐ Si Ce Projet Vous Aide

Si ce système vous aide dans votre startup, n'hésitez pas à :
- ⭐ Star le repo
- 🔄 Partager avec d'autres Product Engineers
- 💬 Me contacter pour discuter déploiement et process

**Ship fast, don't break!** 🚀

---

<div align="center">
  <sub>Built with ❤️ by a Product Engineer who's been there.</sub>
</div>
