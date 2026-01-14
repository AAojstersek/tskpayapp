# Test Instructions: Stroški in obračunavanje

These test-writing instructions are **framework-agnostic**. Adapt them to your testing setup (Jest, Vitest, Playwright, Cypress, React Testing Library, RSpec, Minitest, PHPUnit, etc.).

## Overview

This section manages costs and billing for members. Key functionality includes viewing costs, creating individual and bulk costs, filtering, and managing cost statuses.

---

## User Flow Tests

### Flow 1: View Costs List

**Scenario:** User opens the section and sees a list of costs

#### Success Path

**Setup:**
- Costs exist in the system
- Sample data: 5-10 costs with different statuses and types

**Steps:**
1. User navigates to `/stroski-in-obracunavanje`
2. User sees the cost list table
3. User sees costs with amounts, types, due dates, and statuses

**Expected Results:**
- [ ] Table displays all costs
- [ ] View mode toggle shows "Po stroških" as default
- [ ] Status badges are visible and correctly colored
- [ ] Filters are visible: group, status, cost type
- [ ] "Ustvari strošek" button is visible
- [ ] "Masovno obračunavanje" button is visible

---

### Flow 2: Toggle View Mode

**Scenario:** User switches between 'by-cost' and 'by-member' view

#### Success Path

**Setup:**
- Costs exist in the system

**Steps:**
1. User clicks "Po tekmovalcih" tab
2. User sees costs grouped by member

**Expected Results:**
- [ ] View mode changes to "Po tekmovalcih"
- [ ] Costs are grouped by member
- [ ] Each member shows their total costs
- [ ] User can switch back to "Po stroških"

---

### Flow 3: Bulk Billing

**Scenario:** User creates costs for multiple members at once

#### Success Path

**Setup:**
- Multiple members exist
- User has filtered by group "Andrejeva skupina"
- User has selected 3 members using checkboxes

**Steps:**
1. User checks checkboxes for 3 members
2. User clicks "Masovno obračunavanje" button
3. User sees bulk billing modal/form
4. User enters: title="Vadnine - Februar 2024", amount=50.00, costType="Vadnine", dueDate="2024-03-15"
5. User clicks "Ustvari" button

**Expected Results:**
- [ ] Checkboxes are visible and functional
- [ ] Bulk billing button appears when members are selected
- [ ] Modal/form opens with cost input fields
- [ ] Cost type dropdown shows available types
- [ ] After submission, 3 new costs are created (one for each selected member)
- [ ] New costs appear in the list
- [ ] Checkboxes are cleared after action
- [ ] Success message is shown

#### Failure Path: No Members Selected

**Setup:**
- No members are selected

**Steps:**
1. User clicks "Masovno obračunavanje" button

**Expected Results:**
- [ ] Button is disabled or shows message "Izberite tekmovalce"
- [ ] Modal does not open

---

### Flow 4: Create Individual Cost

**Scenario:** User creates a cost for a single member

#### Success Path

**Setup:**
- Members exist in the system

**Steps:**
1. User clicks "Ustvari strošek" button
2. User sees cost creation form
3. User selects a member from dropdown
4. User enters: title="Oprema - Smučarske palice", amount=120.00, costType="Oprema"
5. User clicks "Ustvari" button

**Expected Results:**
- [ ] Form opens with all required fields
- [ ] Member dropdown shows available members
- [ ] Cost type dropdown shows available types
- [ ] After submission, new cost is created
- [ ] New cost appears in the list
- [ ] Form closes after successful creation

---

### Flow 5: Edit Cost

**Scenario:** User edits an existing cost

#### Success Path

**Setup:**
- Cost exists: title="Vadnine - Januar", amount=50.00, dueDate="2024-02-15"

**Steps:**
1. User clicks "Uredi" button on a cost
2. User sees cost form pre-filled with existing data
3. User changes dueDate to "2024-02-20"
4. User clicks "Shrani" button

**Expected Results:**
- [ ] Form opens with existing cost data pre-filled
- [ ] Amount field is disabled (cannot be changed after creation)
- [ ] User can modify title, description, dueDate
- [ ] After saving, cost data updates in the list
- [ ] Due date updates correctly

---

### Flow 6: Cancel Cost

**Scenario:** User cancels/voids a cost

#### Success Path

**Setup:**
- Cost exists with status "pending"

**Steps:**
1. User clicks "Razveljavi" button on a cost
2. User confirms cancellation in confirmation dialog
3. Cost status changes to "cancelled"

**Expected Results:**
- [ ] Confirmation dialog appears: "Ali ste prepričani, da želite razveljaviti ta strošek?"
- [ ] After confirmation, cost status changes to "cancelled"
- [ ] Status badge updates to show "Razveljavljeno"
- [ ] Cost is still visible in list but marked as cancelled

---

## Empty State Tests

### Primary Empty State

**Scenario:** User has no costs yet (first-time or all deleted)

**Setup:**
- Costs list is empty (`[]`)

**Expected Results:**
- [ ] Empty state message is visible: "Ni stroškov" or similar
- [ ] Helpful description: "Ustvarite prvi strošek, da začnete"
- [ ] Primary CTA is visible: "Ustvari strošek" button
- [ ] CTA is functional: Clicking opens the cost form
- [ ] No blank screen - The UI is helpful, not empty or broken

### Filtered Empty State

**Scenario:** User applies filters that return no results

**Setup:**
- Costs exist but filter matches nothing

**Expected Results:**
- [ ] Clear message: "Ni stroškov, ki bi ustrezali filtrom"
- [ ] Guidance: "Poskusite spremeniti filtre"
- [ ] Reset option: "Počisti filtre" link or button

---

## Component Interaction Tests

### CostList Component

**Renders correctly:**
- [ ] Displays cost table with columns based on view mode
- [ ] Shows formatted amounts correctly (e.g., "50,00 €")
- [ ] Status badges display with correct colors
- [ ] View mode toggle is visible and functional

**User interactions:**
- [ ] Clicking "Ustvari strošek" button calls onCreateCost
- [ ] Clicking "Masovno obračunavanje" button calls onBulkBilling with selected member IDs
- [ ] Changing view mode calls onViewModeChange with correct mode
- [ ] Changing filters calls respective filter change callbacks

**Bulk actions:**
- [ ] Checking member checkbox adds member to selection
- [ ] "Masovno obračunavanje" button appears when members are selected
- [ ] Button is disabled when no members are selected

### CostRow Component

**Renders correctly:**
- [ ] Displays cost title correctly
- [ ] Displays formatted amount
- [ ] Displays cost type
- [ ] Shows due date if available
- [ ] Shows correct status badge

**User interactions:**
- [ ] Clicking "Uredi" button calls onEditCost with cost id
- [ ] Clicking "Razveljavi" button calls onCancelCost with cost id
- [ ] Status change is reflected immediately

---

## Edge Cases

- [ ] Handles costs with very long titles with text truncation
- [ ] Works correctly with 1 cost and 100+ costs
- [ ] Bulk billing works with all members selected
- [ ] Bulk billing works with single member selected
- [ ] Cost amount cannot be edited after creation
- [ ] Cancelled costs are still visible but marked appropriately
- [ ] Costs without due dates display correctly
- [ ] View mode toggle preserves filter state

---

## Accessibility Checks

- [ ] All interactive elements are keyboard accessible
- [ ] Form fields have associated labels
- [ ] Error messages are announced to screen readers
- [ ] Focus is managed appropriately after actions
- [ ] Table headers are properly marked up
- [ ] Checkboxes have proper labels

---

## Sample Test Data

```typescript
// Example test data - populated state
const mockCost = {
  id: "cost-001",
  memberId: "mem-001",
  title: "Vadnine - Januar 2024",
  description: "Mesečne vadnine za januar",
  amount: 50.00,
  costType: "Vadnine",
  dueDate: "2024-02-15",
  status: "pending",
  createdAt: "2024-01-01T10:00:00Z"
};

const mockCosts = [mockCost, /* ... more costs */];

// Example test data - empty states
const mockEmptyList = [];
```

---

## Notes for Test Implementation

- Mock API calls to test both success and failure scenarios
- Test each callback prop is called with correct arguments
- Verify UI updates optimistically where appropriate
- Test that loading states appear during async operations
- Ensure error boundaries catch and display errors gracefully
- **Always test empty states** — Pass empty arrays to verify helpful empty state UI appears
- Test bulk operations with various selection counts
- Test that amount field is disabled when editing existing cost

