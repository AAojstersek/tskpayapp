# Test Instructions: Plačila in bančni uvoz

These test-writing instructions are **framework-agnostic**. Adapt them to your testing setup (Jest, Vitest, Playwright, Cypress, React Testing Library, RSpec, Minitest, PHPUnit, etc.).

## Overview

This section manages bank statement imports and payment processing. Key functionality includes uploading bank statements, matching transactions to parents, confirming payments, and filtering transactions.

---

## User Flow Tests

### Flow 1: View Bank Statements List

**Scenario:** User opens the section and sees a list of imported bank statements

#### Success Path

**Setup:**
- Bank statements exist in the system
- Sample data: 2-3 statements with different statuses

**Steps:**
1. User navigates to `/placila-in-bancni-uvoz`
2. User sees the bank statements list table
3. User sees statements with file names, import dates, and statuses

**Expected Results:**
- [ ] Table displays all bank statements
- [ ] Status badges are visible (completed, processing, failed)
- [ ] File names are displayed correctly
- [ ] Import dates are formatted correctly
- [ ] Transaction counts are shown (total, matched, unmatched)
- [ ] "Naloži izpisek" button is visible
- [ ] "Odpri" button is visible for completed statements

---

### Flow 2: Upload Bank Statement

**Scenario:** User uploads a new bank statement file

#### Success Path

**Setup:**
- User has a PDF or XML file ready

**Steps:**
1. User clicks "Naloži izpisek" button
2. User selects a PDF file from file picker
3. File is uploaded

**Expected Results:**
- [ ] File picker opens when button is clicked
- [ ] Only PDF and XML files are accepted
- [ ] File uploads successfully
- [ ] New statement appears in list with "processing" status
- [ ] Status changes to "completed" after processing
- [ ] Transactions are extracted and displayed

#### Failure Path: Invalid File Type

**Setup:**
- User tries to upload a non-PDF/XML file

**Steps:**
1. User clicks "Naloži izpisek" button
2. User selects a .txt file

**Expected Results:**
- [ ] File picker only shows PDF/XML files
- [ ] Or error message appears: "Nepodprta vrsta datoteke. Uporabite PDF ali XML."

#### Failure Path: Upload Error

**Setup:**
- Server returns error during upload

**Steps:**
1. User uploads file
2. Server returns 500 error

**Expected Results:**
- [ ] Error message appears: "Napaka pri nalaganju izpiska. Poskusite znova."
- [ ] Statement is not added to list
- [ ] User can retry upload

---

### Flow 3: View Statement Transactions

**Scenario:** User opens a statement to view its transactions

#### Success Path

**Setup:**
- Bank statement exists with transactions

**Steps:**
1. User clicks "Odpri" button on a statement
2. User sees transaction list for that statement
3. User sees transactions with amounts, descriptions, and match statuses

**Expected Results:**
- [ ] Statement details view opens
- [ ] Statement file name is shown in header
- [ ] "Nazaj" button is visible
- [ ] Transaction table displays all transactions from the statement
- [ ] Statistics are shown: total, matched, unmatched, confirmed
- [ ] Transactions are color-coded by status (green=matched, red=unmatched, blue=confirmed)
- [ ] Status badges are visible for each transaction

---

### Flow 4: Match Transaction to Parent

**Scenario:** User manually matches an unmatched transaction to a parent

#### Success Path

**Setup:**
- Transaction exists with status "unmatched"
- Parents exist in the system

**Steps:**
1. User sees unmatched transaction in table
2. User clicks on parent dropdown for that transaction
3. User selects a parent from dropdown
4. Transaction match is updated

**Expected Results:**
- [ ] Parent dropdown is visible and enabled for unmatched transactions
- [ ] Dropdown shows list of available parents
- [ ] After selection, transaction status changes to "matched"
- [ ] Transaction row background changes to green
- [ ] Status badge updates to "Ujemajoča"
- [ ] onUpdateTransactionMatch is called with transaction id and parent id

---

### Flow 5: Confirm Single Transaction

**Scenario:** User confirms a single matched transaction as payment

#### Success Path

**Setup:**
- Transaction exists with status "matched" and matchedParentId set

**Steps:**
1. User sees matched transaction in table
2. User clicks "Potrdi" button on the transaction
3. Transaction is confirmed

**Expected Results:**
- [ ] "Potrdi" button is visible and enabled for matched transactions
- [ ] Button is disabled for unmatched transactions (no parent match)
- [ ] After clicking, transaction status changes to "confirmed"
- [ ] Status badge updates to "Potrjena"
- [ ] Transaction row background changes to blue
- [ ] Payment is created in the system
- [ ] onConfirmTransaction is called with transaction id

#### Failure Path: No Parent Match

**Setup:**
- Transaction exists with status "unmatched" (no parent match)

**Steps:**
1. User tries to click "Potrdi" button

**Expected Results:**
- [ ] "Potrdi" button is disabled
- [ ] Tooltip or message explains: "Najprej izberite starša"

---

### Flow 6: Confirm All Transactions

**Scenario:** User confirms all matched transactions from a statement at once

#### Success Path

**Setup:**
- Statement exists with multiple matched transactions

**Steps:**
1. User views statement transactions
2. User sees "Potrdi vse ujemajoče" button
3. User clicks the button
4. All matched transactions are confirmed

**Expected Results:**
- [ ] "Potrdi vse ujemajoče" button is visible in header
- [ ] Button is only enabled when there are matched transactions
- [ ] After clicking, all matched transactions change to "confirmed"
- [ ] All payments are created in the system
- [ ] Statistics update (confirmed count increases)
- [ ] onConfirmAllTransactions is called with statement id

---

## Empty State Tests

### Primary Empty State

**Scenario:** User has no bank statements yet (first-time)

**Setup:**
- Bank statements list is empty (`[]`)

**Expected Results:**
- [ ] Empty state message is visible: "Ni uvoženih izpiskov"
- [ ] Helpful description: "Naložite prvi bančni izpisek"
- [ ] Primary CTA is visible: "Naloži izpisek" button
- [ ] CTA is functional: Clicking opens file picker
- [ ] No blank screen - The UI is helpful, not empty or broken

### Filtered Empty State

**Scenario:** User applies filters that return no transactions

**Setup:**
- Transactions exist but filter matches nothing

**Expected Results:**
- [ ] Clear message: "Ni transakcij, ki bi ustrezale filtrom"
- [ ] Guidance: "Poskusite spremeniti filtre"
- [ ] Reset option available

---

## Component Interaction Tests

### TransactionList Component

**Renders correctly:**
- [ ] Displays transaction table with columns: Datum, Znesek, Opis, Referenca, Starš, Status, Akcije
- [ ] Shows formatted amounts correctly
- [ ] Shows formatted dates correctly
- [ ] Statistics cards display correct numbers
- [ ] Filters are visible and functional

**User interactions:**
- [ ] Clicking "Nazaj" button calls onCloseStatement
- [ ] Changing filters calls respective filter change callbacks
- [ ] Clicking "Potrdi vse ujemajoče" button calls onConfirmAllTransactions

### TransactionRow Component

**Renders correctly:**
- [ ] Displays transaction date correctly
- [ ] Displays formatted amount
- [ ] Displays transaction description
- [ ] Shows reference number or "-" if null
- [ ] Shows correct status badge with color
- [ ] Row background color matches status

**User interactions:**
- [ ] Parent dropdown is functional for unmatched transactions
- [ ] Changing parent selection calls onUpdateTransactionMatch
- [ ] "Potrdi" button calls onConfirmTransaction when clicked
- [ ] Button is disabled when no parent is matched
- [ ] Confirmed transactions show "Potrjeno" text instead of button

### BankStatementList Component

**Renders correctly:**
- [ ] Displays statement table with file names and statuses
- [ ] Shows import dates correctly
- [ ] Shows transaction counts
- [ ] Status badges are visible

**User interactions:**
- [ ] Clicking "Naloži izpisek" opens file picker
- [ ] Clicking "Odpri" button calls onViewStatement with statement id
- [ ] "Odpri" button is disabled for processing/failed statements

---

## Edge Cases

- [ ] Handles very long transaction descriptions with text truncation
- [ ] Works correctly with 1 transaction and 100+ transactions
- [ ] Handles transactions with null reference numbers
- [ ] Handles transactions with null parent matches
- [ ] Confirmed transactions cannot be edited
- [ ] Processing statements show loading state
- [ ] Failed statements show error state
- [ ] Date filters work correctly with various date ranges
- [ ] Multiple statements can be open in sequence

---

## Accessibility Checks

- [ ] All interactive elements are keyboard accessible
- [ ] Form fields have associated labels
- [ ] Error messages are announced to screen readers
- [ ] Focus is managed appropriately after actions
- [ ] Table headers are properly marked up
- [ ] Dropdowns are keyboard navigable
- [ ] File upload is accessible

---

## Sample Test Data

```typescript
// Example test data - matched transaction
const mockTransaction = {
  id: "txn-001",
  bankStatementId: "stmt-001",
  transactionDate: "2024-01-15",
  amount: 50.00,
  description: "Nakazilo Janez Novak",
  reference: "SI56012345678901234",
  accountNumber: "SI56012345678901234",
  matchedParentId: "par-001",
  matchConfidence: "high",
  status: "matched",
  paymentId: null
};

// Example test data - unmatched transaction
const mockUnmatchedTransaction = {
  id: "txn-007",
  bankStatementId: "stmt-001",
  transactionDate: "2024-01-28",
  amount: 75.50,
  description: "Nakazilo neznanega plačnika",
  reference: null,
  accountNumber: "SI56067890123456789",
  matchedParentId: null,
  matchConfidence: null,
  status: "unmatched",
  paymentId: null
};
```

---

## Notes for Test Implementation

- Mock file upload functionality
- Test both PDF and XML file uploads
- Mock transaction matching logic
- Test each callback prop is called with correct arguments
- Verify UI updates optimistically where appropriate
- Test that loading states appear during async operations
- Ensure error boundaries catch and display errors gracefully
- **Always test empty states** — Pass empty arrays to verify helpful empty state UI appears
- Test color coding and status indicators
- Test inline editing functionality
- Test bulk confirmation actions

