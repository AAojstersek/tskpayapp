# Milestone 5: Pregled in poročila

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** All previous milestones complete (Foundation, Člani in skupine, Stroški in obračunavanje, Plačila in bančni uvoz)

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
- **Aggregation logic** — Calculate KPIs, obligations, financial reports from costs and payments
- **Export functionality** — Generate CSV/PDF exports of obligations

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

Implement the Pregled in poročila feature — nadzorna plošča z pregledom obveznosti, izvoz odprtih postav in finančni pregledi.

## Overview

Nadzorna plošča za pregled finančnega stanja kluba. Omogoča pregled obveznosti po tekmovalcih in skupinah, izvoz odprtih postavk za komunikacijo s starši, finančne preglede po obdobjih in revizijsko sled akcij.

**Key Functionality:**
- View dashboard with key performance indicators (KPIs)
- Filter obligations by period, group, or member status
- View obligations by members (saldo, open items, overdue items)
- View obligations by groups (total open debt per group)
- Toggle between "by-member" and "by-group" view modes
- Drill-down to member/parent/group details
- Export obligations by parent or group (CSV/PDF format)
- View financial reports (income by period, costs by period and type, comparison created vs. paid)
- View audit log of recent actions (bulk billing, import confirmations, cost cancellations)

## Recommended Approach: Test-Driven Development

Before implementing this section, **write tests first** based on the test specifications provided.

See `product-plan/sections/pregled-in-porocila/tests.md` for detailed test-writing instructions including:
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

Copy the section components from `product-plan/sections/pregled-in-porocila/components/`:

- `DashboardView` — Main component displaying dashboard KPIs, obligations, financial reports, and audit log
- `MemberObligationRow` — Row component for displaying member obligations
- `GroupObligationRow` — Row component for displaying group obligations

### Data Layer

The components expect these data shapes:

- `DashboardKPIs` — totalOpenDebt, openItemsCount, paymentsInPeriod, unmatchedTransactionsCount
- `MemberObligation` — memberId, memberName, parentId, parentName, groupId, groupName, status, balance, openItemsCount, overdueItemsCount, overdueAmount, openItems
- `GroupObligation` — groupId, groupName, totalOpenDebt, openItemsCount, overdueItemsCount, overdueAmount, memberCount
- `FinancialReport` — period, income (total, byMonth), costs (total, byMonth, byType), comparison (created, paid, difference, paymentRate)
- `AuditLogEntry` — id, action, description, userId, userName, timestamp, details

You'll need to:
- Create aggregation logic to calculate KPIs from costs and payments
- Create aggregation logic to calculate member obligations from costs and payments
- Create aggregation logic to calculate group obligations
- Create aggregation logic to generate financial reports
- Implement audit log tracking for key actions
- Create API endpoints for dashboard data
- Implement export functionality (CSV/PDF generation)
- Connect real data to the components

### Callbacks

Wire up these user actions:

- `onPeriodFromChange(date)` — Filter obligations by period start
- `onPeriodToChange(date)` — Filter obligations by period end
- `onGroupFilterChange(groupId)` — Filter obligations by group
- `onMemberStatusFilterChange(status)` — Filter obligations by member status
- `onViewModeChange(mode)` — Toggle between 'by-member' and 'by-group' view
- `onViewMemberDetails(memberId)` — Navigate to member details
- `onViewParentDetails(parentId)` — Navigate to parent details and select for export
- `onViewGroupDetails(groupId)` — Navigate to group details and select for export
- `onExportByParent(parentId, format, options)` — Export obligations by parent (CSV/PDF)
- `onExportByGroup(groupId, format, options)` — Export obligations by group (CSV/PDF)

### Empty States

Implement empty state UI for when no records exist yet:

- **No obligations yet:** Show a helpful message when obligations list is empty
- **No obligations matching filters:** Show message when filters return no results
- **No financial data:** Show appropriate messages when financial reports have no data

The provided components include empty state designs — make sure to render them when data is empty rather than showing blank screens.

## Files to Reference

- `product-plan/sections/pregled-in-porocila/README.md` — Feature overview and design intent
- `product-plan/sections/pregled-in-porocila/tests.md` — Test-writing instructions (use for TDD)
- `product-plan/sections/pregled-in-porocila/components/` — React components
- `product-plan/sections/pregled-in-porocila/types.ts` — TypeScript interfaces
- `product-plan/sections/pregled-in-porocila/sample-data.json` — Test data
- `product-plan/sections/pregled-in-porocila/dashboard-view.png` — Visual reference

## Expected User Flows

When fully implemented, users should be able to complete these flows:

### Flow 1: View Dashboard

1. User navigates to `/pregled-in-porocila`
2. User sees dashboard with KPIs, obligations, financial reports, and audit log
3. **Outcome:** All dashboard data is displayed correctly

### Flow 2: Filter and View Obligations

1. User sets period filters (from/to dates)
2. User selects group filter
3. User selects member status filter
4. User toggles between "Po tekmovalcih" and "Po skupinah" view
5. **Outcome:** Obligations are filtered and displayed correctly, KPIs update

### Flow 3: Export Obligations

1. User clicks on parent name in obligations table
2. User clicks "Izvoz" button
3. User selects "CSV" or "PDF" format
4. **Outcome:** Export file is generated and downloaded with parent's obligations

### Flow 4: View Financial Reports

1. User views financial report section
2. User sees income by month, costs by month and type, and comparison
3. **Outcome:** Financial data is displayed correctly with calculations

## Done When

- [ ] Tests written for key user flows (success and failure paths)
- [ ] All tests pass
- [ ] Components render with real data
- [ ] Empty states display properly when no records exist
- [ ] KPI calculations are correct
- [ ] Obligation aggregations are correct
- [ ] Financial report calculations are correct
- [ ] Filters work correctly
- [ ] View mode toggle works correctly
- [ ] Drill-down navigation works
- [ ] Export functionality works (CSV/PDF)
- [ ] Audit log displays correctly
- [ ] User can complete all expected flows end-to-end
- [ ] Matches the visual design
- [ ] Responsive on mobile

