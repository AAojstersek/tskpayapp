# One-Shot Implementation Instructions

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** None

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
- Bank statement parsing (PDF/XML)
- Transaction matching logic
- Aggregation logic for dashboard and reports
- Export functionality (CSV/PDF)

**Important guidelines:**
- **DO NOT** redesign or restyle the provided components — use them as-is
- **DO** wire up the callback props to your routing and API calls
- **DO** replace sample data with real data from your backend
- **DO** implement proper error handling and loading states
- **DO** implement empty states when no records exist (first-time users, after deletions)
- **DO** use test-driven development — write tests first using `tests.md` instructions
- The components are props-based and ready to integrate — focus on the backend and data layer

---

## Implementation Sequence

Build this product in the following order:

1. **Foundation** — Design tokens, data model types, routing, application shell
2. **Člani in skupine** — Member, parent, and group management
3. **Stroški in obračunavanje** — Cost creation and bulk billing
4. **Plačila in bančni uvoz** — Bank statement import and payment processing
5. **Pregled in poročila** — Dashboard, obligations, financial reports, audit log

Each milestone builds on the previous one. Complete them in order.

---

## Milestone 1: Foundation

### Goal

Set up the foundational elements: design tokens, data model types, routing structure, and application shell.

### What to Implement

#### 1. Design Tokens

Configure your styling system with these tokens:

- See `product-plan/design-system/tokens.css` for CSS custom properties
- See `product-plan/design-system/tailwind-colors.md` for Tailwind configuration
- See `product-plan/design-system/fonts.md` for Google Fonts setup

#### 2. Data Model Types

Create TypeScript interfaces for your core entities:

- See `product-plan/data-model/data-model.md` for entity definitions
- See `product-plan/data-model/README.md` for entity relationships

#### 3. Routing Structure

Create placeholder routes for each section:

- `/clani-in-skupine` — Člani in skupine
- `/stroski-in-obracunavanje` — Stroški in obračunavanje
- `/placila-in-bancni-uvoz` — Plačila in bančni uvoz
- `/pregled-in-porocila` — Pregled in poročila (default view)
- `/nastavitve` — Nastavitve

#### 4. Application Shell

Copy the shell components from `product-plan/shell/components/` to your project:

- `AppShell.tsx` — Main layout wrapper
- `MainNav.tsx` — Navigation component
- `UserMenu.tsx` — User menu with avatar

**Wire Up Navigation:**

Connect navigation to your routing:
- Člani in skupine → `/clani-in-skupine`
- Stroški in obračunavanje → `/stroski-in-obracunavanje`
- Plačila in bančni uvoz → `/placila-in-bancni-uvoz`
- Pregled in poročila → `/pregled-in-porocila` (default)
- Nastavitve → `/nastavitve`

**User Menu:**

The user menu expects:
- User name
- Avatar URL (optional)
- Logout callback

### Done When

- [ ] Design tokens are configured
- [ ] Data model types are defined
- [ ] Routes exist for all sections (can be placeholder pages)
- [ ] Shell renders with navigation
- [ ] Navigation links to correct routes
- [ ] User menu shows user info
- [ ] Responsive on mobile

---

## Milestone 2: Člani in skupine

### Goal

Implement the Člani in skupine feature — upravljanje tekmovalcev, staršev in trenerskih skupin kot osnova sistema.

### Overview

Osnovni administrativni del sistema za upravljanje tekmovalcev, staršev in trenerskih skupin. Omogoča bančniku hitro dodajanje, urejanje in organizacijo članov kluba z jasnimi statusnimi indikatorji in učinkovitimi filtri.

**Key Functionality:**
- View a list of all members with status indicators
- Filter members by search, status, or group
- Add new members with basic information
- Edit existing member details
- Link members to parents (select from existing or quick add)
- Assign members to coach groups (one group at a time)
- Change member status (active/inactive/archived)
- Perform bulk operations (status change, group assignment)
- Manage parents and coaches as supporting sub-views

### Components

Copy the section components from `product-plan/sections/clani-in-skupine/components/`:

- `MemberList` — Main component displaying list of members with filters and bulk actions
- `MemberRow` — Row component for displaying individual member in the table
- `MemberForm` — Form component for adding/editing a member

### Data Layer

The components expect these data shapes:

- `Member` — id, firstName, lastName, dateOfBirth, status, notes, parentId, groupId
- `Parent` — id, firstName, lastName, email, phone
- `Group` — id, name, coachId
- `Coach` — id, name, email, phone

### Callbacks

Wire up these user actions:

- `onViewMember(id)` — Navigate to member detail page or open detail view
- `onEditMember(id)` — Open edit form with member data
- `onDeleteMember(id)` — Delete member (with confirmation)
- `onCreateMember()` — Open create form
- `onStatusChange(id, status)` — Update member status
- `onAssignGroup(memberId, groupId)` — Assign member to group
- `onBulkStatusChange(memberIds, status)` — Bulk status change for selected members
- `onBulkAssignGroup(memberIds, groupId)` — Bulk group assignment for selected members
- `onSearchChange(search)` — Filter members by search term
- `onStatusFilterChange(status)` — Filter members by status
- `onGroupFilterChange(groupId)` — Filter members by group
- `onManageParents()` — Open parents management view
- `onManageCoaches()` — Open coaches management view

### Files to Reference

- `product-plan/sections/clani-in-skupine/README.md` — Feature overview
- `product-plan/sections/clani-in-skupine/tests.md` — Test-writing instructions
- `product-plan/sections/clani-in-skupine/components/` — React components
- `product-plan/sections/clani-in-skupine/types.ts` — TypeScript interfaces
- `product-plan/sections/clani-in-skupine/sample-data.json` — Test data
- `product-plan/sections/clani-in-skupine/member-list.png` — Visual reference
- `product-plan/sections/clani-in-skupine/member-form.png` — Visual reference

### Done When

- [ ] Tests written for key user flows
- [ ] All tests pass
- [ ] Components render with real data
- [ ] Empty states display properly
- [ ] All user actions work (create, edit, delete, bulk operations)
- [ ] Filters work correctly
- [ ] User can complete all expected flows end-to-end
- [ ] Matches the visual design
- [ ] Responsive on mobile

---

## Milestone 3: Stroški in obračunavanje

### Goal

Implement the Stroški in obračunavanje feature — ustvarjanje stroškov, masovno obračunavanje po skupinah in upravljanje različnih vrst stroškov.

### Overview

Sekcija za upravljanje stroškov in obračunavanje obveznosti. Omogoča bančniku hitro ustvarjanje posameznih in masovnih stroškov za tekmovalce, pregled obveznosti in upravljanje različnih vrst stroškov z jasnim statusnim sledenjem.

**Key Functionality:**
- View a list of all costs with status indicators (pending/paid/cancelled)
- Toggle between "by-cost" and "by-member" view modes
- Filter costs by group, status, or cost type
- Create individual costs for specific members
- Perform bulk billing for multiple selected members
- Edit existing costs (title, description, dueDate - amount cannot be changed after creation)
- Cancel/void costs (logical cancellation for audit trail)
- Manage cost types (vadnine, oprema, članarine, priprave, modre kartice, zdravniški pregledi)

### Components

Copy the section components from `product-plan/sections/stroski-in-obracunavanje/components/`:

- `CostList` — Main component displaying costs with filters, view mode toggle, and bulk actions
- `CostRow` — Row component for displaying individual cost in the table

### Data Layer

The components expect these data shapes:

- `Cost` — id, memberId, title, description, amount, costType, dueDate, status, createdAt
- `CostType` — name (predefined list)

### Callbacks

Wire up these user actions:

- `onViewModeChange(mode)` — Toggle between 'by-cost' and 'by-member' view
- `onCreateCost()` — Open cost creation form
- `onEditCost(id)` — Open cost edit form
- `onCancelCost(id)` — Cancel/void a cost (with confirmation)
- `onBulkBilling(memberIds)` — Open bulk billing form for selected members
- `onGroupFilterChange(groupId)` — Filter costs by group
- `onStatusFilterChange(status)` — Filter costs by status
- `onCostTypeFilterChange(costType)` — Filter costs by cost type

### Files to Reference

- `product-plan/sections/stroski-in-obracunavanje/README.md` — Feature overview
- `product-plan/sections/stroski-in-obracunavanje/tests.md` — Test-writing instructions
- `product-plan/sections/stroski-in-obracunavanje/components/` — React components
- `product-plan/sections/stroski-in-obracunavanje/types.ts` — TypeScript interfaces
- `product-plan/sections/stroski-in-obracunavanje/sample-data.json` — Test data
- `product-plan/sections/stroski-in-obracunavanje/cost-list.png` — Visual reference

### Done When

- [ ] Tests written for key user flows
- [ ] All tests pass
- [ ] Components render with real data
- [ ] Empty states display properly
- [ ] All user actions work (create, edit, cancel, bulk billing)
- [ ] View mode toggle works correctly
- [ ] Filters work correctly
- [ ] Cost amount cannot be edited after creation
- [ ] User can complete all expected flows end-to-end
- [ ] Matches the visual design
- [ ] Responsive on mobile

---

## Milestone 4: Plačila in bančni uvoz

### Goal

Implement the Plačila in bančni uvoz feature — avtomatski uvoz PDF izpiskov, pametno povezovanje transakcij s starši ter pregled in potrjevanje plačil.

### Overview

Sekcija za avtomatizacijo uvoza bančnih izpiskov in upravljanje plačil. Omogoča bančniku hitro uvoz PDF in XML izpiskov, pametno povezovanje transakcij s starši, ročno popravljanje povezav in potrjevanje plačil za zapis v sistem.

**Key Functionality:**
- Upload bank statements (PDF or XML files)
- Automatic processing and transaction extraction from statements
- Smart matching of transactions to parents (by name or reference number)
- View transaction list with color-coded status indicators
- Inline editing of transaction-parent matches (dropdown selection)
- Confirm individual transactions as payments
- Bulk confirm all matched transactions from a statement
- Filter transactions by status, statement, parent, or date range
- View import statistics (total, matched, unmatched, confirmed)

### Components

Copy the section components from `product-plan/sections/placila-in-bancni-uvoz/components/`:

- `TransactionList` — Main component displaying transactions with filters and confirmation actions
- `TransactionRow` — Row component for displaying individual transaction with inline editing
- `BankStatementList` — Component for displaying list of imported bank statements

### Data Layer

The components expect these data shapes:

- `BankStatement` — id, fileName, fileType, importedAt, status, totalTransactions, matchedTransactions, unmatchedTransactions
- `BankTransaction` — id, bankStatementId, transactionDate, amount, description, reference, accountNumber, matchedParentId, matchConfidence, status, paymentId
- `Payment` — id, parentId, amount, paymentDate, paymentMethod, referenceNumber, notes, importedFromBank, bankTransactionId, createdAt

### Special Implementation Requirements

- **Bank statement parsing** — Implement PDF/XML parsing logic (or integrate with parsing service)
- **Transaction matching** — Implement logic to match transactions to parents by name or reference number

### Callbacks

Wire up these user actions:

- `onUploadStatement(file)` — Upload and process bank statement file
- `onViewStatement(statementId)` — Open statement details view
- `onCloseStatement()` — Close statement details view
- `onUpdateTransactionMatch(transactionId, parentId)` — Update transaction-parent match
- `onConfirmTransaction(transactionId)` — Confirm single transaction as payment
- `onConfirmAllTransactions(statementId)` — Confirm all matched transactions from statement
- `onTransactionStatusFilterChange(status)` — Filter transactions by status
- `onStatementFilterChange(statementId)` — Filter transactions by statement
- `onParentFilterChange(parentId)` — Filter transactions by parent
- `onDateFromChange(date)` — Filter transactions by date from
- `onDateToChange(date)` — Filter transactions by date to

### Files to Reference

- `product-plan/sections/placila-in-bancni-uvoz/README.md` — Feature overview
- `product-plan/sections/placila-in-bancni-uvoz/tests.md` — Test-writing instructions
- `product-plan/sections/placila-in-bancni-uvoz/components/` — React components
- `product-plan/sections/placila-in-bancni-uvoz/types.ts` — TypeScript interfaces
- `product-plan/sections/placila-in-bancni-uvoz/sample-data.json` — Test data
- `product-plan/sections/placila-in-bancni-uvoz/transaction-list.png` — Visual reference

### Done When

- [ ] Tests written for key user flows
- [ ] All tests pass
- [ ] Components render with real data
- [ ] Empty states display properly
- [ ] Bank statement upload works (PDF and XML)
- [ ] Transaction parsing works correctly
- [ ] Transaction matching logic works (by name and reference)
- [ ] Inline editing of matches works
- [ ] Transaction confirmation works (creates Payment records)
- [ ] Filters work correctly
- [ ] User can complete all expected flows end-to-end
- [ ] Matches the visual design
- [ ] Responsive on mobile

---

## Milestone 5: Pregled in poročila

### Goal

Implement the Pregled in poročila feature — nadzorna plošča z pregledom obveznosti, izvoz odprtih postav in finančni pregledi.

### Overview

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

### Special Implementation Requirements

- **Aggregation logic** — Calculate KPIs, obligations, financial reports from costs and payments
- **Export functionality** — Generate CSV/PDF exports of obligations

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

### Files to Reference

- `product-plan/sections/pregled-in-porocila/README.md` — Feature overview
- `product-plan/sections/pregled-in-porocila/tests.md` — Test-writing instructions
- `product-plan/sections/pregled-in-porocila/components/` — React components
- `product-plan/sections/pregled-in-porocila/types.ts` — TypeScript interfaces
- `product-plan/sections/pregled-in-porocila/sample-data.json` — Test data
- `product-plan/sections/pregled-in-porocila/dashboard-view.png` — Visual reference

### Done When

- [ ] Tests written for key user flows
- [ ] All tests pass
- [ ] Components render with real data
- [ ] Empty states display properly
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

---

## General Testing Guidelines

For each milestone, write tests based on the `tests.md` files in each section directory. The test instructions are framework-agnostic and include:

- Key user flows to test (success and failure paths)
- Specific UI elements, button labels, and interactions to verify
- Expected behaviors and assertions
- Empty state tests
- Edge cases
- Accessibility checks

**TDD Workflow:**
1. Read `tests.md` and write failing tests for the key user flows
2. Implement the feature to make tests pass
3. Refactor while keeping tests green

---

## Final Checklist

When all milestones are complete:

- [ ] All sections are implemented and functional
- [ ] All tests pass
- [ ] Empty states work correctly
- [ ] Error handling is in place
- [ ] Loading states are implemented
- [ ] Responsive design works on mobile
- [ ] Matches visual designs
- [ ] Authentication and authorization are implemented
- [ ] Data validation is in place
- [ ] Export functionality works
- [ ] Audit logging is implemented
- [ ] Performance is acceptable

---

## Getting Help

If you encounter issues or need clarification:

1. Review the `README.md` files in each section directory for feature overviews
2. Check the `tests.md` files for detailed test scenarios
3. Reference the visual designs (PNG files) for UI expectations
4. Review the TypeScript types for data structure requirements
5. Check sample data files for example data shapes

Good luck with your implementation!

