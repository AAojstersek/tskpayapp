# Milestone 2: Člani in skupine

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestone 1 (Foundation) complete

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

Implement the Člani in skupine feature — upravljanje tekmovalcev, staršev in trenerskih skupin kot osnova sistema.

## Overview

Osnovni administrativni del sistema za upravljanje tekmovalcev, staršev in trenerskih skupin. Omogoča bančniku hitro dodajanje, urejanje in organizacijo članov kluba z jasnimi statusnimi indikatorji in učinkovitimi filtri.

**Key Functionality:**
- View a list of all members with status indicators
- Filter members by search, status, or group
- Add new members with basic information (name, date of birth, status, notes)
- Edit existing member details
- Link members to parents (select from existing or quick add)
- Assign members to coach groups (one group at a time)
- Change member status (active/inactive/archived)
- Perform bulk operations (status change, group assignment) for multiple selected members
- Manage parents and coaches as supporting sub-views within the section

## Recommended Approach: Test-Driven Development

Before implementing this section, **write tests first** based on the test specifications provided.

See `product-plan/sections/clani-in-skupine/tests.md` for detailed test-writing instructions including:
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

You'll need to:
- Create API endpoints or data fetching logic for members, parents, groups, coaches
- Connect real data to the components
- Handle member creation, update, deletion
- Handle parent and coach management

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

### Empty States

Implement empty state UI for when no records exist yet:

- **No members yet:** Show a helpful message and "Dodaj tekmovalca" button when the member list is empty
- **No parents/coaches:** Handle cases where parent or coach lists are empty in forms
- **First-time user experience:** Guide users to create their first member with clear CTAs

The provided components include empty state designs — make sure to render them when data is empty rather than showing blank screens.

## Files to Reference

- `product-plan/sections/clani-in-skupine/README.md` — Feature overview and design intent
- `product-plan/sections/clani-in-skupine/tests.md` — Test-writing instructions (use for TDD)
- `product-plan/sections/clani-in-skupine/components/` — React components
- `product-plan/sections/clani-in-skupine/types.ts` — TypeScript interfaces
- `product-plan/sections/clani-in-skupine/sample-data.json` — Test data
- `product-plan/sections/clani-in-skupine/member-list.png` — Visual reference
- `product-plan/sections/clani-in-skupine/member-form.png` — Visual reference

## Expected User Flows

When fully implemented, users should be able to complete these flows:

### Flow 1: Create a New Member

1. User clicks "Dodaj tekmovalca" button
2. User fills in member details (firstName, lastName, dateOfBirth, status, notes)
3. User selects a parent from dropdown (or creates new parent)
4. User selects a group from dropdown
5. User clicks "Shrani" to save
6. **Outcome:** New member appears in the list, success message shown

### Flow 2: Edit an Existing Member

1. User clicks on a member row or "Uredi" button
2. User modifies the member details
3. User clicks "Shrani" to confirm changes
4. **Outcome:** Member updates in place, changes persisted

### Flow 3: Bulk Status Change

1. User checks checkboxes for multiple members
2. User clicks "Spremeni status" button
3. User selects new status from dropdown
4. User confirms the action
5. **Outcome:** All selected members' status changes, checkboxes cleared

### Flow 4: Filter Members

1. User types search term in search input
2. User selects status from status filter
3. User selects group from group filter
4. **Outcome:** Member list filters to show only matching members

## Done When

- [ ] Tests written for key user flows (success and failure paths)
- [ ] All tests pass
- [ ] Components render with real data
- [ ] Empty states display properly when no records exist
- [ ] All user actions work (create, edit, delete, bulk operations)
- [ ] Filters work correctly
- [ ] User can complete all expected flows end-to-end
- [ ] Matches the visual design
- [ ] Responsive on mobile

