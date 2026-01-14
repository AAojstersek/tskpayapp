# Test Instructions: Člani in skupine

These test-writing instructions are **framework-agnostic**. Adapt them to your testing setup (Jest, Vitest, Playwright, Cypress, React Testing Library, RSpec, Minitest, PHPUnit, etc.).

## Overview

This section manages members (competitors), parents, and coach groups. Key functionality includes viewing member lists, filtering, adding/editing members, bulk operations, and managing parents and coaches.

---

## User Flow Tests

### Flow 1: View Member List

**Scenario:** User opens the section and sees a list of all members

#### Success Path

**Setup:**
- Members exist in the system
- Sample data: 3-5 members with different statuses (active, inactive, archived)

**Steps:**
1. User navigates to `/clani-in-skupine`
2. User sees the member list table
3. User sees member names, parents, groups, and status indicators

**Expected Results:**
- [ ] Table displays all members
- [ ] Status badges are visible and correctly colored (active=green, inactive=yellow, archived=gray)
- [ ] Search filter input is visible
- [ ] Status filter dropdown is visible
- [ ] Group filter dropdown is visible
- [ ] "Dodaj tekmovalca" button is visible

---

### Flow 2: Filter Members

**Scenario:** User filters members by search, status, or group

#### Success Path: Search Filter

**Setup:**
- Members exist with various names

**Steps:**
1. User types "Luka" in the search input
2. User sees filtered results

**Expected Results:**
- [ ] Only members with "Luka" in first or last name are shown
- [ ] Filter input shows the entered text
- [ ] Other members are hidden

#### Success Path: Status Filter

**Setup:**
- Members exist with different statuses

**Steps:**
1. User selects "Aktivni" from status filter dropdown
2. User sees filtered results

**Expected Results:**
- [ ] Only active members are shown
- [ ] Inactive and archived members are hidden
- [ ] Status filter shows "Aktivni" as selected

#### Success Path: Group Filter

**Setup:**
- Members exist in different groups

**Steps:**
1. User selects "Andrejeva skupina" from group filter dropdown
2. User sees filtered results

**Expected Results:**
- [ ] Only members in "Andrejeva skupina" are shown
- [ ] Members from other groups are hidden
- [ ] Group filter shows selected group

---

### Flow 3: Create New Member

**Scenario:** User adds a new member to the system

#### Success Path

**Setup:**
- Parents and groups exist in the system

**Steps:**
1. User clicks "Dodaj tekmovalca" button
2. User sees member form
3. User enters: firstName="Tine", lastName="Novak", dateOfBirth="2010-05-15", status="active"
4. User selects a parent from dropdown
5. User selects a group from dropdown
6. User clicks "Shrani" button

**Expected Results:**
- [ ] Form opens with all required fields
- [ ] Parent dropdown shows available parents
- [ ] Group dropdown shows available groups
- [ ] After clicking "Shrani", form closes
- [ ] New member appears in the list
- [ ] Success message is shown (if implemented)

#### Failure Path: Validation Error

**Setup:**
- Form is open

**Steps:**
1. User leaves firstName field empty
2. User clicks "Shrani" button

**Expected Results:**
- [ ] Form shows validation error for firstName field
- [ ] Form is not submitted
- [ ] Error message is visible: "Ime je obvezno" or similar
- [ ] Focus moves to first invalid field

#### Failure Path: Server Error

**Setup:**
- Form is open with valid data
- Server returns 500 error

**Steps:**
1. User fills form with valid data
2. User clicks "Shrani" button
3. Server returns error

**Expected Results:**
- [ ] Error message appears: "Napaka pri shranjevanju. Poskusite znova."
- [ ] Form data is preserved, not cleared
- [ ] User can retry submission

---

### Flow 4: Edit Member

**Scenario:** User edits an existing member's details

#### Success Path

**Setup:**
- Member exists with data: firstName="Luka", lastName="Novak", status="active"

**Steps:**
1. User clicks on member row or "Uredi" button
2. User sees member form pre-filled with existing data
3. User changes status to "inactive"
4. User clicks "Shrani" button

**Expected Results:**
- [ ] Form opens with existing member data pre-filled
- [ ] User can modify fields
- [ ] After saving, member data updates in the list
- [ ] Status badge updates to "Neaktivni" with yellow color

---

### Flow 5: Bulk Status Change

**Scenario:** User changes status for multiple members at once

#### Success Path

**Setup:**
- Multiple members exist
- User has selected 3 members using checkboxes

**Steps:**
1. User checks checkboxes for 3 members
2. User clicks "Spremeni status" button
3. User selects "Arhivirani" from status dropdown
4. User confirms the action

**Expected Results:**
- [ ] Checkboxes are visible and functional
- [ ] Bulk action button appears when members are selected
- [ ] Status change dialog/menu appears
- [ ] After confirmation, all 3 members' status changes to "Arhivirani"
- [ ] Status badges update for all selected members
- [ ] Checkboxes are cleared after action

---

### Flow 6: Bulk Group Assignment

**Scenario:** User assigns multiple members to a group at once

#### Success Path

**Setup:**
- Multiple members exist
- User has selected 2 members using checkboxes

**Steps:**
1. User checks checkboxes for 2 members
2. User clicks "Dodeli skupino" button
3. User selects "Klemnova skupina" from group dropdown
4. User confirms the action

**Expected Results:**
- [ ] Bulk action button appears when members are selected
- [ ] Group selection dialog/menu appears
- [ ] After confirmation, both members are assigned to "Klemnova skupina"
- [ ] Group column updates for both members
- [ ] Checkboxes are cleared after action

---

## Empty State Tests

### Primary Empty State

**Scenario:** User has no members yet (first-time or all deleted)

**Setup:**
- Members list is empty (`[]`)

**Expected Results:**
- [ ] Empty state message is visible: "Ni članov" or similar
- [ ] Helpful description: "Dodajte prvega tekmovalca, da začnete"
- [ ] Primary CTA is visible: "Dodaj tekmovalca" button
- [ ] CTA is functional: Clicking opens the member form
- [ ] No blank screen - The UI is helpful, not empty or broken

### Filtered Empty State

**Scenario:** User applies filters that return no results

**Setup:**
- Members exist but filter matches nothing (e.g., search for "XYZ123")

**Expected Results:**
- [ ] Clear message: "Ni rezultatov, ki bi ustrezali filtrom"
- [ ] Guidance: "Poskusite spremeniti filtre" or similar
- [ ] Reset option: "Počisti filtre" link or button

---

## Component Interaction Tests

### MemberList Component

**Renders correctly:**
- [ ] Displays member table with columns: Ime, Starš, Skupina, Status, Akcije
- [ ] Shows formatted dates correctly
- [ ] Status badges display with correct colors

**User interactions:**
- [ ] Clicking "Dodaj tekmovalca" button calls onCreateMember
- [ ] Clicking search input allows typing
- [ ] Changing status filter calls onStatusFilterChange with correct value
- [ ] Changing group filter calls onGroupFilterChange with correct value

**Bulk actions:**
- [ ] Checking member checkbox adds member to selection
- [ ] Unchecking removes member from selection
- [ ] "Spremeni status" button appears when members are selected
- [ ] "Dodeli skupino" button appears when members are selected

### MemberRow Component

**Renders correctly:**
- [ ] Displays member name correctly
- [ ] Displays parent name correctly
- [ ] Displays group name correctly
- [ ] Shows correct status badge

**User interactions:**
- [ ] Clicking member name calls onViewMember with member id
- [ ] Clicking "Uredi" button calls onEditMember with member id
- [ ] Clicking "Izbriši" button calls onDeleteMember with member id
- [ ] Status change dropdown works correctly

### MemberForm Component

**Renders correctly:**
- [ ] All form fields are visible: firstName, lastName, dateOfBirth, status, notes
- [ ] Parent dropdown shows available parents
- [ ] Group dropdown shows available groups
- [ ] Form is pre-filled when editing existing member

**User interactions:**
- [ ] Form fields accept input
- [ ] Date picker works for dateOfBirth
- [ ] Dropdowns allow selection
- [ ] "Shrani" button submits form
- [ ] "Prekliči" button closes form without saving

**Validation:**
- [ ] Required fields show error when empty
- [ ] Date format is validated
- [ ] Error messages are clear and helpful

---

## Edge Cases

- [ ] Handles very long member names with text truncation
- [ ] Works correctly with 1 member and 100+ members
- [ ] Preserves filter state when navigating away and back
- [ ] Transition from empty to populated: After creating first member, list renders correctly
- [ ] Transition from populated to empty: After deleting last member, empty state appears
- [ ] Bulk operations work with all members selected
- [ ] Bulk operations work with single member selected
- [ ] Status filter "Vsi" shows all members including archived
- [ ] Archived members are hidden by default but visible when filter is set to "Vsi"

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

Use the data from `sample-data.json` or create variations:

```typescript
// Example test data - populated state
const mockMember = {
  id: "mem-001",
  firstName: "Luka",
  lastName: "Novak",
  dateOfBirth: "2010-03-15",
  status: "active",
  notes: "Odličen napredek",
  parentId: "par-001",
  groupId: "grp-001"
};

const mockMembers = [mockMember, /* ... more members */];

// Example test data - empty states
const mockEmptyList = [];

// Example test data - filtered state
const mockFilteredMembers = mockMembers.filter(m => m.status === "active");
```

---

## Notes for Test Implementation

- Mock API calls to test both success and failure scenarios
- Test each callback prop is called with correct arguments
- Verify UI updates optimistically where appropriate
- Test that loading states appear during async operations
- Ensure error boundaries catch and display errors gracefully
- **Always test empty states** — Pass empty arrays to verify helpful empty state UI appears (not blank screens)
- Test transitions: empty → first member created, last member deleted → empty state returns
- Test bulk operations with various selection counts (1, 2, all, none)

