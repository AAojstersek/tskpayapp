# Test Instructions: Pregled in poročila

These test-writing instructions are **framework-agnostic**. Adapt them to your testing setup (Jest, Vitest, Playwright, Cypress, React Testing Library, RSpec, Minitest, PHPUnit, etc.).

## Overview

This section provides a dashboard view of financial status, obligations, financial reports, and audit logs. Key functionality includes viewing KPIs, filtering obligations, exporting data, and viewing financial comparisons.

---

## User Flow Tests

### Flow 1: View Dashboard

**Scenario:** User opens the section and sees dashboard with KPIs

#### Success Path

**Setup:**
- Dashboard data exists with KPIs and obligations

**Steps:**
1. User navigates to `/pregled-in-porocila`
2. User sees dashboard with KPI cards
3. User sees obligations table
4. User sees financial reports and audit log

**Expected Results:**
- [ ] Four KPI cards are visible: Skupni odprti dolg, Odprte postavke, Prejeta plačila, Neujemajoče transakcije
- [ ] KPI values are displayed correctly with formatting
- [ ] Filters section is visible
- [ ] Obligations table is visible
- [ ] Financial report section is visible
- [ ] Audit log section is visible

---

### Flow 2: Filter Obligations

**Scenario:** User filters obligations by period, group, or member status

#### Success Path: Period Filter

**Setup:**
- Obligations exist for different periods

**Steps:**
1. User sets "Obdobje od" to "2024-01-01"
2. User sets "Obdobje do" to "2024-03-31"
3. Obligations are filtered

**Expected Results:**
- [ ] Date inputs are visible and functional
- [ ] After setting dates, obligations are filtered to the period
- [ ] KPI values update based on filtered period
- [ ] Financial reports update based on filtered period

#### Success Path: Group Filter

**Setup:**
- Obligations exist for different groups

**Steps:**
1. User selects "Andrejeva skupina" from group filter
2. Obligations are filtered

**Expected Results:**
- [ ] Group dropdown shows available groups
- [ ] After selection, only obligations for that group are shown
- [ ] KPI values update based on filtered group

#### Success Path: Member Status Filter

**Setup:**
- Obligations exist for members with different statuses

**Steps:**
1. User selects "Aktivni" from status filter
2. Obligations are filtered

**Expected Results:**
- [ ] Status dropdown shows: Vsi, Aktivni, Neaktivni
- [ ] After selection, only obligations for active members are shown
- [ ] Archived members are hidden by default

---

### Flow 3: Toggle View Mode

**Scenario:** User switches between 'by-member' and 'by-group' view

#### Success Path

**Setup:**
- Obligations exist in the system

**Steps:**
1. User clicks "Po skupinah" tab
2. User sees obligations grouped by group

**Expected Results:**
- [ ] View mode toggle shows "Po tekmovalcih" as default
- [ ] After clicking "Po skupinah", view changes
- [ ] Table columns update (group view shows different columns)
- [ ] Group obligations are displayed with totals
- [ ] User can switch back to "Po tekmovalcih"

---

### Flow 4: Drill-Down to Member Details

**Scenario:** User clicks on member to view details

#### Success Path

**Setup:**
- Member obligations exist

**Steps:**
1. User clicks on member name in the table
2. Member details view opens

**Expected Results:**
- [ ] Member name is clickable (appears as link/button)
- [ ] After clicking, onViewMemberDetails is called with member id
- [ ] Navigation to member details page (implementation-specific)

---

### Flow 5: Export Obligations by Parent

**Scenario:** User exports obligations for a specific parent

#### Success Path

**Setup:**
- Parent obligations exist
- User has selected a parent (by clicking on parent name)

**Steps:**
1. User clicks on parent name in the table
2. "Izvoz" button appears
3. User clicks "Izvoz" button
4. User selects "CSV" from dropdown
5. Export is generated

**Expected Results:**
- [ ] Parent name is clickable
- [ ] After clicking parent, export button appears
- [ ] Export dropdown shows: "Izvozi CSV", "Izvozi PDF"
- [ ] After selecting format, onExportByParent is called with parent id and format
- [ ] Export file is generated and downloaded

---

### Flow 6: Export Obligations by Group

**Scenario:** User exports obligations for a specific group

#### Success Path

**Setup:**
- Group obligations exist
- User is in "Po skupinah" view
- User has clicked on a group

**Steps:**
1. User clicks on group name in the table
2. "Izvoz" button appears
3. User clicks "Izvoz" button
4. User selects "PDF" from dropdown
5. Export is generated

**Expected Results:**
- [ ] Group name is clickable
- [ ] After clicking group, export button appears
- [ ] Export dropdown shows: "Izvozi CSV", "Izvozi PDF"
- [ ] After selecting format, onExportByGroup is called with group id and format
- [ ] Export file is generated and downloaded

---

## Empty State Tests

### Primary Empty State

**Scenario:** User has no obligations yet (first-time)

**Setup:**
- Obligations list is empty (`[]`)

**Expected Results:**
- [ ] Empty state message is visible: "Ni obveznosti, ki bi ustrezale filtrom"
- [ ] KPI cards show zero values
- [ ] Financial reports show zero values
- [ ] No blank screen - The UI is helpful, not empty or broken

### Filtered Empty State

**Scenario:** User applies filters that return no results

**Setup:**
- Obligations exist but filter matches nothing

**Expected Results:**
- [ ] Clear message: "Ni obveznosti, ki bi ustrezale filtrom"
- [ ] Guidance: "Poskusite spremeniti filtre"
- [ ] Reset option available

---

## Component Interaction Tests

### DashboardView Component

**Renders correctly:**
- [ ] Displays four KPI cards with correct values
- [ ] Shows formatted amounts correctly
- [ ] Filters section is visible with all filter inputs
- [ ] Obligations table displays correctly
- [ ] Financial report section displays correctly
- [ ] Audit log section displays correctly

**User interactions:**
- [ ] Changing period filters calls onPeriodFromChange/onPeriodToChange
- [ ] Changing group filter calls onGroupFilterChange
- [ ] Changing status filter calls onMemberStatusFilterChange
- [ ] Toggling view mode calls onViewModeChange
- [ ] Export buttons appear when parent/group is selected

### MemberObligationRow Component

**Renders correctly:**
- [ ] Displays member name correctly
- [ ] Displays parent name correctly
- [ ] Displays group name correctly
- [ ] Shows formatted balance
- [ ] Shows open items count
- [ ] Shows overdue items count and amount
- [ ] Status badge displays correctly

**User interactions:**
- [ ] Clicking member name calls onViewMemberDetails
- [ ] Clicking parent name calls onViewParentDetails and selects parent for export

### GroupObligationRow Component

**Renders correctly:**
- [ ] Displays group name correctly
- [ ] Displays member count
- [ ] Shows formatted total debt
- [ ] Shows open items count
- [ ] Shows overdue items count and amount

**User interactions:**
- [ ] Clicking group name calls onViewGroupDetails and selects group for export

---

## Edge Cases

- [ ] Handles very large amounts with proper formatting
- [ ] Works correctly with 1 obligation and 100+ obligations
- [ ] Handles obligations with no overdue items
- [ ] Handles obligations with all overdue items
- [ ] Period filters work correctly with various date ranges
- [ ] Export works with various data sizes
- [ ] Financial reports handle zero values correctly
- [ ] Audit log displays correctly with many entries
- [ ] View mode toggle preserves filter state

---

## Accessibility Checks

- [ ] All interactive elements are keyboard accessible
- [ ] Form fields have associated labels
- [ ] Error messages are announced to screen readers
- [ ] Focus is managed appropriately after actions
- [ ] Table headers are properly marked up
- [ ] KPI cards are properly structured
- [ ] Export buttons are accessible

---

## Sample Test Data

```typescript
// Example test data - member obligation
const mockMemberObligation = {
  memberId: "mem-001",
  memberName: "Luka Novak",
  parentId: "par-001",
  parentName: "Janez Novak",
  groupId: "grp-001",
  groupName: "Andrejeva skupina",
  status: "active",
  balance: 450.00,
  openItemsCount: 3,
  overdueItemsCount: 1,
  overdueAmount: 50.00,
  openItems: [/* ... */]
};

// Example test data - dashboard KPIs
const mockKPIs = {
  totalOpenDebt: 1015.00,
  openItemsCount: 8,
  paymentsInPeriod: 420.00,
  unmatchedTransactionsCount: 4
};
```

---

## Notes for Test Implementation

- Mock API calls to test both success and failure scenarios
- Test each callback prop is called with correct arguments
- Verify UI updates when filters change
- Test that KPI values update based on filters
- Test export functionality with various formats
- Ensure error boundaries catch and display errors gracefully
- **Always test empty states** — Pass empty arrays to verify helpful empty state UI appears
- Test drill-down functionality
- Test financial report calculations
- Test audit log display

