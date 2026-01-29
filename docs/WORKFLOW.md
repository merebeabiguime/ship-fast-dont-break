# Workflow: Human Validation That Actually Works

> Automated tests tell you if code works. Human testers tell you if the *product* works.

---

## The Core Insight

When you don't have automated tests, you need to make human testing **systematic** and **efficient**. The key realization:

> **The person who codes the feature knows exactly how to test it. The person who tests doesn't.**

If you don't write explicit testing steps, testers will:
- Miss edge cases you know about
- Get stuck ("where is this button?")
- Test the wrong thing
- Ask you questions (wasting both your time)

---

## The Jira Board Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              JIRA BOARD                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  TO DO        IN PROGRESS     IN TESTING      NEEDS WORK      DONE         │
│  ┌─────┐      ┌─────┐         ┌─────┐         ┌─────┐         ┌─────┐      │
│  │     │      │     │         │     │         │     │         │     │      │
│  │ T-5 │      │ T-3 │         │ T-1 │         │ T-2 │         │ T-0 │      │
│  │     │      │     │         │     │         │     │         │     │      │
│  │ T-6 │      └─────┘         │ T-4 │         └─────┘         │ T-7 │      │
│  │     │                      │     │                         │     │      │
│  │ T-8 │                      └─────┘                         │ T-9 │      │
│  │     │                                                      │     │      │
│  └─────┘                                                      └─────┘      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

Legend:
- TO DO: Prioritized backlog for this sprint
- IN PROGRESS: Developer currently working on it
- IN TESTING: On staging, waiting for testers
- NEEDS WORK: Testers found issues
- DONE: Tested by 2-3 people, ready for prod (or already in prod)
```

---

## The Ticket Structure

Every ticket follows this format:

```markdown
## [FEATURE] Add tip percentage selector

### Context
Brief business context. Why are we building this?

### Description
What needs to be built. Clear scope boundaries.

### Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

### How to Test  ← THE MOST IMPORTANT SECTION

**Environment:** staging.tipntap.fr
**Test account:** Use restaurant "Demo Resto"

**Steps:**
1. Go to [staging.tipntap.fr](https://staging.tipntap.fr)
2. Scan QR code for table 1 (or use direct link: /r/demo-resto/table-1)
3. Add any item to cart
4. Click "Checkout"
5. ✅ Verify: Three tip buttons visible (10%, 15%, 20%)
6. Click "15%"
7. ✅ Verify: Total updates to show +15%
8. Click "Custom"
9. Enter "12" in the input
10. ✅ Verify: Total updates to show +€12
11. Complete payment with test card: 4242 4242 4242 4242
12. ✅ Verify: Success screen shows tip amount
13. Go to admin dashboard → Orders
14. ✅ Verify: Order shows correct tip in "Tip" column

### Edge Cases to Check
- [ ] What happens with 0% tip?
- [ ] What happens with very large custom tip (€999)?
- [ ] Does it work on mobile?
```

---

## The "How to Test" Rules

### Rule 1: Be Specific About URLs

```markdown
❌ Bad:  "Go to the checkout page"
✅ Good: "Go to staging.tipntap.fr/r/demo-resto/table-1, add an item, click Checkout"
```

### Rule 2: Use Checkpoints (✅ Verify)

```markdown
❌ Bad:  "Click the button and check if it works"
✅ Good: "Click 'Submit'. ✅ Verify: Success toast appears within 2 seconds"
```

### Rule 3: Include Test Data

```markdown
❌ Bad:  "Log in with a test account"
✅ Good: "Log in with email: test@tipntap.fr, password: testpass123"
```

### Rule 4: Cover the Happy Path First

```markdown
✅ Structure:
1. Main flow (the feature should work)
2. Edge cases (separately listed)
3. Error states (if applicable)
```

### Rule 5: State What "Success" Looks Like

```markdown
❌ Bad:  "The payment should process"
✅ Good: "✅ Verify: Redirect to /success page with order ID visible"
```

---

## The Validation Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FEATURE LIFECYCLE                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   1. TICKET CREATED                                                         │
│      │                                                                      │
│      │  Who: Product owner, designer, or developer                          │
│      │  When: Sunday sprint planning                                        │
│      │  Must include: "How to Test" section                                 │
│      │                                                                      │
│      ▼                                                                      │
│   2. DEVELOPMENT                                                            │
│      │                                                                      │
│      │  Developer picks ticket from TO DO                                   │
│      │  Moves to IN PROGRESS                                                │
│      │  Commits to main branch                                              │
│      │  Auto-deploys to staging                                             │
│      │                                                                      │
│      ▼                                                                      │
│   3. READY FOR TESTING                                                      │
│      │                                                                      │
│      │  Developer moves ticket to IN TESTING                                │
│      │  Notifies team: "T-42 ready for testing"                             │
│      │  Continues working on next ticket                                    │
│      │                                                                      │
│      ▼                                                                      │
│   4. HUMAN VALIDATION                                                       │
│      │                                                                      │
│      │  ┌─────────────────────────────────────────────────────────────┐    │
│      │  │  Tester 1 (Designer): Follows "How to Test"                 │    │
│      │  │  └─► Checks UI, UX, visual consistency                      │    │
│      │  │                                                              │    │
│      │  │  Tester 2 (Co-founder): Follows "How to Test"               │    │
│      │  │  └─► Checks business logic, real-world scenarios            │    │
│      │  │                                                              │    │
│      │  │  Tester 3 (Developer): Quick edge case check                │    │
│      │  │  └─► Checks error states, technical edge cases              │    │
│      │  └─────────────────────────────────────────────────────────────┘    │
│      │                                                                      │
│      ├──► Issues found? → NEEDS WORK (with specific feedback)               │
│      │                      │                                               │
│      │                      └──► Developer fixes → Back to IN TESTING       │
│      │                                                                      │
│      └──► All pass? → Continue                                              │
│           │                                                                 │
│           ▼                                                                 │
│   5. PRODUCTION DEPLOY                                                      │
│      │                                                                      │
│      │  Merge main → production branch                                      │
│      │  Auto-deploys to production                                          │
│      │                                                                      │
│      ▼                                                                      │
│   6. PRODUCTION SANITY CHECK                                                │
│      │                                                                      │
│      │  Quick run-through of "How to Test" on production                    │
│      │  Usually takes 2-3 minutes                                           │
│      │  Confirms deployment worked                                          │
│      │                                                                      │
│      ▼                                                                      │
│   7. DONE                                                                   │
│                                                                             │
│      Ticket moved to DONE                                                   │
│      Feature is live                                                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Why Multiple Testers Matter

Each person catches different things:

| Tester | Perspective | Catches |
|--------|-------------|---------|
| **Designer** | "Does it look/feel right?" | UI bugs, UX friction, missing states |
| **Business** | "Does it solve the problem?" | Wrong logic, edge cases from real usage |
| **Developer** | "What could break?" | Error states, performance, technical debt |

**Real Example:**

A "add tip" feature was tested by:

1. **Designer found:** Button was misaligned on mobile
2. **Co-founder found:** Couldn't add tip after splitting bill (business logic bug)
3. **Developer found:** Large tips (>€100) caused rounding errors

One person would have missed at least two of these.

---

## The Time Investment

```
┌─────────────────────────────────────────────────────────────────┐
│                TIME BREAKDOWN PER FEATURE                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Writing "How to Test"          │  5-10 min (developer)        │
│  Testing (per person)           │  10-15 min (3 testers)       │
│  Fixing issues (if any)         │  15-30 min (developer)       │
│  Re-testing after fixes         │  5 min (quick check)         │
│  Production sanity check        │  2-3 min                     │
│  ─────────────────────────────────────────────────────────────  │
│  TOTAL PER FEATURE              │  45-75 min                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

Compare this to:
- Writing comprehensive automated tests: 2-4 hours
- Debugging a production incident: 1-4 hours + stress + customer impact

**The ROI is clear for early-stage.**

---

## The "NEEDS WORK" Feedback Format

When a tester finds an issue, they should report:

```markdown
### Issue: [Brief description]

**Step where it failed:** Step 6 in "How to Test"
**Expected:** Total should update to show +15%
**Actual:** Total doesn't update, still shows original amount
**Screenshot:** [attached]
**Device/Browser:** iPhone 12 / Safari
```

This gives the developer everything they need to reproduce and fix.

---

## The Weekly Rhythm

```
┌────────────────────────────────────────────────────────────────────────────┐
│                          WEEKLY SCHEDULE                                   │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  MONDAY - THURSDAY                                                         │
│  ├── Developer: Build features, deploy to staging                          │
│  ├── Testers: Validate features in IN TESTING column                       │
│  └── Continuous flow: code → test → fix → test → done                      │
│                                                                            │
│  FRIDAY                                                                    │
│  ├── Morning: Wrap up current work                                         │
│  ├── Afternoon: Team retrospective                                         │
│  │   ├── What went well?                                                   │
│  │   ├── What didn't go well?                                              │
│  │   └── What do we want to improve?                                       │
│  └── End of day: Production deploy of validated features                   │
│                                                                            │
│  SATURDAY                                                                  │
│  └── Rest (important!)                                                     │
│                                                                            │
│  SUNDAY                                                                    │
│  └── Sprint planning                                                       │
│      ├── Review goals for next week                                        │
│      ├── Create tickets with "How to Test"                                 │
│      └── Prioritize backlog                                                │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## When This Approach Breaks Down

Be honest about the limitations:

| Scenario | Problem | Mitigation |
|----------|---------|------------|
| **High-traffic moments** | Can't test all devices/browsers | Prioritize most common (mobile Safari, Chrome) |
| **Regression bugs** | Old features might break | Consider E2E tests for critical paths |
| **Complex integrations** | Stripe webhooks, third-party APIs | Document how to test these specifically |
| **Team scaling** | 10+ people = coordination overhead | Invest in automation at this point |

**This approach is for early-stage (2-5 people).** When you hit product-market fit and scale, invest in proper test infrastructure.

---

## The Psychological Benefit

Beyond catching bugs, structured human testing has a hidden benefit:

> **It forces product thinking at every step.**

When you write "How to Test," you're forced to think:
- What does "working" actually mean?
- What edge cases exist?
- How will a real user interact with this?

This often catches design issues *before* they're built.

---

[← Architecture](ARCHITECTURE.md) | [Back to README](../README.md)
