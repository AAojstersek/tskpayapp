# Milestone 3: Stroški in obračunavanje

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestone 1 (Foundation) and Milestone 2 (Člani in skupine) complete

---

## About These Instructions

**What you're receiving:**
- Finished UI designs (React components with full styling)
- Data model definitions (TypeScript types and sample data)
- UI/UX specifications (user flows, requirements, screenshots)
- Design system tokens (colors, typography, spacing)
- Test-writing instructions for each section (for TDD approach)

**What you need to build:**
- Backend API endpoints and database schema
- Authentication and authorization
- Data fetching and state management
- Business logic and validation
- Integration of the provided UI components with real data

**Important guidelines:**
- **DO NOT** redesign or restyle the provided components — use them as-is
- **DO** wire up the callback props to your routing and API calls
- **DO** replace sample data with real data from your backend
- **DO** implement proper error handling and loading states
- **DO** implement empty states when no records exist (first-time users, after deletions)
- **DO** use test-driven development — write tests first using `tests.md` instructions
- The components are props-based and ready to integrate — focus on the backend and data layer

---

## Goal

Implement the Stroški in obračunavanje feature — ustvarjanje stroškov, masovno obračunavanje po skupinah in upravljanje različnih vrst stroškov.

## Overview

Sekcija za upravljanje stroškov in obračunavanje obveznosti. Omogoča bančniku hitro ustvarjanje posameznih in masovnih stroškov za tekmovalce, pregled obveznosti in upravljanje različnih vrst stroškov z jasnim statusnim sledenjem.

**Key Functionality:**
- View a list of all costs with status indicators (pending/paid/cancelled)
- Toggle between "by-cost" and "by-member" view modes
- Filter costs by group, status, or cost type
- Create individual costs for specific members
- Perform bulk billing for multiple selected members (create same cost for all)
- Edit existing costs (title, description, dueDate - amount cannot be changed after creation)
- Cancel/void costs (logical cancellation for audit trail)
- Manage cost types (vadnine, oprema, članarine, priprave, modre kartice, zdravniški pregledi)

## Recommended Approach: Test-Driven Development

Before implementing this section, **write tests first** based on the test specifications provided.

See `product-plan/sections/stroski-in-obracunavanje/tests.md` for detailed test-writing instructions including:
- Key user flows to test (success and failure paths)
- Specific UI elements, button labels, and interactions to verify
- Expected behaviors and assertions

The test instructions are framework-agnostic — adapt them to your testing setup (Jest, Vitest, Playwright, Cypress, RSpec, Minitest, PHPUnit, etc.).

**TDD Workflow:**
1. Read `tests.md` and write failing tests for the key user flows
2. Implement the feature to make tests pass
3. Refactor while keeping tests green

## What to Implement

### Components

Copy the section components from `product-plan/sections/stroski-in-obracunavanje/components/`:

- `CostList` — Main component displaying costs with filters, view mode toggle, and bulk actions
- `CostRow` — Row component for displaying individual cost in the table

### Data Layer

The components expect these data shapes:

- `Cost` — id, memberId, title, description, amount, costType, dueDate, status, createdAt
- `CostType` — name (predefined list: vadnine, oprema, članarine, priprave, modre kartice, zdravniški pregledi)

You'll need to:
- Create API endpoints or data fetching logic for costs
- Connect real data to the components
- Handle cost creation (individual and bulk)
- Handle cost updates (title, description, dueDate only - amount is immutable)
- Handle cost cancellation (logical delete, not physical)
- Manage cost types

### Callbacks

Wire up these user actions:

- `onViewModeChange(mode)` — Toggle between 'by-cost' and 'by-member' view
- `onCreateCost()` — Open cost creation form
- `onEditCost(id)` — Open cost edit form
- `onCancelCost(id)` — Cancel/void a cost (with confirmation)
- `onBulkBilling(memberIds)` — Open bulk billing form for selected members
- `onGroupFilterChange(groupId)` — Filter costs by group
- `onStatusFilterChange(status)` — Filter costs by status (pending/paid/cancelled/all)
- `onCostTypeFilterChange(costType)` — Filter costs by cost type

### Empty States

Implement empty state UI for when no records exist yet:

- **No costs yet:** Show a helpful message and "Ustvari strošek" button when the cost list is empty
- **No costs for filtered criteria:** Show message when filters return no results
- **First-time user experience:** Guide users to create their first cost with clear CTAs

The provided components include empty state designs — make sure to render them when data is empty rather than showing blank screens.

## Files to Reference

- `product-plan/sections/stroski-in-obracunavanje/README.md` — Feature overview and design intent
- `product-plan/sections/stroski-in-obracunavanje/tests.md` — Test-writing instructions (use for TDD)
- `product-plan/sections/stroski-in-obracunavanje/components/` — React components
- `product-plan/sections/stroski-in-obracunavanje/types.ts` — TypeScript interfaces
- `product-plan/sections/stroski-in-obracunavanje/sample-data.json` — Test data
- `product-plan/sections/stroski-in-obracunavanje/cost-list.png` — Visual reference

## Expected User Flows

When fully implemented, users should be able to complete these flows:

### Flow 1: Bulk Billing

1. User filters members by group or selects members with checkboxes
2. User clicks "Masovno obračunavanje" button
3. User enters cost details (title, amount, costType, dueDate)
4. User clicks "Ustvari" to confirm
5. **Outcome:** New costs are created for all selected members, appear in the list

### Flow 2: Create Individual Cost

1. User clicks "Ustvari strošek" button
2. User selects a member from dropdown
3. User enters cost details (title, amount, costType, dueDate)
4. User clicks "Ustvari" to save
5. **Outcome:** New cost appears in the list, success message shown

### Flow 3: Edit a Cost

1. User clicks "Uredi" button on a cost
2. User modifies cost details (title, description, dueDate - amount is disabled)
3. User clicks "Shrani" to confirm changes
4. **Outcome:** Cost updates in place, changes persisted

### Flow 4: Cancel a Cost

1. User clicks "Razveljavi" button on a cost
2. User confirms cancellation in dialog
3. **Outcome:** Cost status changes to "cancelled", still visible but marked

## Done When

- [ ] Tests written for key user flows (success and failure paths)
- [ ] All tests pass
- [ ] Components render with real data
- [ ] Empty states display properly when no records exist
- [ ] All user actions work (create, edit, cancel, bulk billing)
- [ ] View mode toggle works correctly
- [ ] Filters work correctly
- [ ] Cost amount cannot be edited after creation
- [ ] User can complete all expected flows end-to-end
- [ ] Matches the visual design
- [ ] Responsive on mobile

