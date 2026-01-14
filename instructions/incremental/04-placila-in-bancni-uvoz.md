# Milestone 4: Plačila in bančni uvoz

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestone 1 (Foundation), Milestone 2 (Člani in skupine), and Milestone 3 (Stroški in obračunavanje) complete

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
- **Bank statement parsing** — PDF/XML parsing logic (or integration with parsing service)
- **Transaction matching** — Logic to match transactions to parents by name or reference number

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

Implement the Plačila in bančni uvoz feature — avtomatski uvoz PDF izpiskov, pametno povezovanje transakcij s starši ter pregled in potrjevanje plačil.

## Overview

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

## Recommended Approach: Test-Driven Development

Before implementing this section, **write tests first** based on the test specifications provided.

See `product-plan/sections/placila-in-bancni-uvoz/tests.md` for detailed test-writing instructions including:
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

Copy the section components from `product-plan/sections/placila-in-bancni-uvoz/components/`:

- `TransactionList` — Main component displaying transactions with filters and confirmation actions
- `TransactionRow` — Row component for displaying individual transaction with inline editing
- `BankStatementList` — Component for displaying list of imported bank statements

### Data Layer

The components expect these data shapes:

- `BankStatement` — id, fileName, fileType, importedAt, status, totalTransactions, matchedTransactions, unmatchedTransactions
- `BankTransaction` — id, bankStatementId, transactionDate, amount, description, reference, accountNumber, matchedParentId, matchConfidence, status, paymentId
- `Payment` — id, parentId, amount, paymentDate, paymentMethod, referenceNumber, notes, importedFromBank, bankTransactionId, createdAt

You'll need to:
- Create API endpoints for bank statement upload and processing
- Implement PDF/XML parsing logic (or integrate with parsing service)
- Implement transaction matching logic (match by name or reference number)
- Create API endpoints for transaction management
- Handle transaction confirmation (create Payment records)
- Connect real data to the components

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

### Empty States

Implement empty state UI for when no records exist yet:

- **No bank statements yet:** Show a helpful message and "Naloži izpisek" button when the statement list is empty
- **No transactions for statement:** Show message when statement has no transactions
- **No transactions matching filters:** Show message when filters return no results

The provided components include empty state designs — make sure to render them when data is empty rather than showing blank screens.

## Files to Reference

- `product-plan/sections/placila-in-bancni-uvoz/README.md` — Feature overview and design intent
- `product-plan/sections/placila-in-bancni-uvoz/tests.md` — Test-writing instructions (use for TDD)
- `product-plan/sections/placila-in-bancni-uvoz/components/` — React components
- `product-plan/sections/placila-in-bancni-uvoz/types.ts` — TypeScript interfaces
- `product-plan/sections/placila-in-bancni-uvoz/sample-data.json` — Test data
- `product-plan/sections/placila-in-bancni-uvoz/transaction-list.png` — Visual reference

## Expected User Flows

When fully implemented, users should be able to complete these flows:

### Flow 1: Upload and Process Bank Statement

1. User clicks "Naloži izpisek" button
2. User selects PDF or XML file
3. File is uploaded and processed
4. **Outcome:** Statement appears in list with "processing" status, then "completed" with extracted transactions

### Flow 2: Match Transaction to Parent

1. User views statement transactions
2. User sees unmatched transaction
3. User selects parent from dropdown for that transaction
4. **Outcome:** Transaction status changes to "matched", row background turns green

### Flow 3: Confirm Transaction

1. User sees matched transaction
2. User clicks "Potrdi" button
3. **Outcome:** Transaction status changes to "confirmed", payment is created, row background turns blue

### Flow 4: Bulk Confirm Transactions

1. User views statement with multiple matched transactions
2. User clicks "Potrdi vse ujemajoče" button
3. **Outcome:** All matched transactions are confirmed, payments are created

## Done When

- [ ] Tests written for key user flows (success and failure paths)
- [ ] All tests pass
- [ ] Components render with real data
- [ ] Empty states display properly when no records exist
- [ ] Bank statement upload works (PDF and XML)
- [ ] Transaction parsing works correctly
- [ ] Transaction matching logic works (by name and reference)
- [ ] Inline editing of matches works
- [ ] Transaction confirmation works (creates Payment records)
- [ ] Filters work correctly
- [ ] User can complete all expected flows end-to-end
- [ ] Matches the visual design
- [ ] Responsive on mobile

