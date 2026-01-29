# Ticket Template for Human Validation

> Copy this template when creating new tickets. The "How to Test" section is the most important part.

---

## [TYPE] Title

**Type:** `[FEATURE]` | `[BUG]` | `[IMPROVEMENT]` | `[REFACTOR]`

**Priority:** `P0 (Critical)` | `P1 (High)` | `P2 (Medium)` | `P3 (Low)`

**Estimated Effort:** `XS` | `S` | `M` | `L` | `XL`

---

### Context

_Why are we building this? What problem does it solve? Link to any relevant discussions or user feedback._

```
Example:
Restaurant owners have asked for a way to see tip trends over time.
Currently they can only see individual tips, not patterns.
This will help them understand peak tipping hours and train staff accordingly.
```

---

### Description

_What needs to be built? Be specific about scope. What's included? What's explicitly NOT included?_

```
Example:
Add a "Tip Analytics" section to the restaurant dashboard showing:
- Daily tip totals for the last 7 days (bar chart)
- Average tip percentage
- Best performing time slots

NOT included in this ticket:
- Export to CSV (separate ticket)
- Per-waiter breakdown (future feature)
```

---

### Acceptance Criteria

_Checkboxes that define "done". Each should be independently verifiable._

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3
- [ ] Criterion 4

```
Example:
- [ ] "Tip Analytics" menu item visible in sidebar
- [ ] Bar chart shows last 7 days of tips
- [ ] Average tip percentage displayed above chart
- [ ] Time slot breakdown shows morning/afternoon/evening
- [ ] Works on mobile (responsive)
- [ ] Loading state shown while data fetches
```

---

### How to Test

> **THIS IS THE MOST IMPORTANT SECTION**
>
> Write steps that someone who didn't build this feature can follow.
> Be explicit about URLs, test accounts, and what "success" looks like.

**Environment:** `staging.yourapp.com`

**Test Account:**
- Email: `test@yourapp.com`
- Password: `testpass123`
- Restaurant: `Demo Restaurant`

**Prerequisites:**
_List anything that needs to be set up before testing_

```
Example:
- Restaurant must have at least 10 orders with tips in the last 7 days
- User must have "owner" role
```

**Steps:**

1. Go to [staging.yourapp.com](https://staging.yourapp.com)
2. Log in with test credentials above
3. Click "Demo Restaurant" to enter dashboard
4. **✅ Verify:** "Tip Analytics" appears in the left sidebar
5. Click "Tip Analytics"
6. **✅ Verify:** Page loads without errors
7. **✅ Verify:** Bar chart displays with 7 bars (one per day)
8. Hover over a bar
9. **✅ Verify:** Tooltip shows date and tip total
10. **✅ Verify:** "Average tip: X%" displayed above chart
11. Scroll down to time slot section
12. **✅ Verify:** Three cards (Morning, Afternoon, Evening) with tip totals
13. Resize browser to mobile width (< 768px)
14. **✅ Verify:** Chart and cards stack vertically, no horizontal scroll
15. Refresh the page
16. **✅ Verify:** Loading spinner appears briefly, then data loads

---

### Edge Cases to Check

_Additional scenarios beyond the happy path. Testers should check these after the main flow._

- [ ] What if restaurant has no tips in the last 7 days? (Empty state)
- [ ] What if user is on slow connection? (Loading state)
- [ ] What if user doesn't have "owner" role? (Access denied)
- [ ] What happens on the first day of the month? (Date boundaries)

---

### Technical Notes (For Developer)

_Implementation hints, relevant files, or technical context. Not required for testers to read._

```
Example:
- API endpoint: GET /api/restaurants/:id/analytics/tips
- Use existing Chart.js library (already in bundle)
- Tip data is in `orders.tip_amount` column
- Time slots: Morning (6-12), Afternoon (12-18), Evening (18-24)
```

---

### Screenshots / Mockups

_Attach any relevant designs, wireframes, or reference screenshots._

---

### Related Tickets

- Depends on: #123 (if any)
- Blocks: #456 (if any)
- Related: #789 (if any)

---

## Template Usage Tips

### Good "How to Test" Examples

```markdown
❌ BAD: "Test that tips show correctly"
✅ GOOD: "Go to /dashboard/analytics. ✅ Verify: Bar chart shows 7 bars with
         dates Mon-Sun. Hover over Wednesday bar. ✅ Verify: Tooltip shows
         'Wed, Jan 15: €127.50'"
```

```markdown
❌ BAD: "Check mobile works"
✅ GOOD: "Open Chrome DevTools (F12). Click device toolbar (Ctrl+Shift+M).
         Select 'iPhone 12 Pro'. ✅ Verify: Chart fits screen width,
         no horizontal scrollbar"
```

```markdown
❌ BAD: "Login and check the page"
✅ GOOD: "Go to staging.yourapp.com/login. Enter email: test@yourapp.com,
         password: testpass123. Click 'Sign In'. ✅ Verify: Redirected to
         /dashboard within 3 seconds"
```

### The ✅ Verify Pattern

Every testable assertion should be marked with `✅ Verify:` followed by what exactly to check. This makes it crystal clear what "passing" looks like.

### Keep Test Data Consistent

Always include:
- Exact URLs (not "go to the app")
- Test credentials (email + password)
- Test data identifiers (which restaurant, which order, etc.)
- Expected values where possible
