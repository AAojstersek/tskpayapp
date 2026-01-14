# Plačila in bančni uvoz

## Overview

Sekcija za avtomatizacijo uvoza bančnih izpiskov in upravljanje plačil. Omogoča bančniku hitro uvoz PDF in XML izpiskov, pametno povezovanje transakcij s starši, ročno popravljanje povezav in potrjevanje plačil za zapis v sistem.

## User Flows

- Bančnik odpre sekcijo in vidi seznam uvozov bančnih izpiskov z statusi obdelave
- Bančnik naloži nov bančni izpisek (PDF ali XML)
- Sistem samodejno obdela izpisek in predlaga povezave transakcij s starši
- Bančnik odpre podrobnosti posameznega uvoza in vidi tabelo transakcij
- Bančnik pregleda transakcije z jasnim označevanjem ujemanj in napak (barvno označevanje in statusni badge-i)
- Bančnik popravi povezave neujemajočih transakcij inline v tabeli z dropdownom za izbiro starša
- Bančnik potrdi posamezno transakcijo ali vse transakcije iz uvoza hkrati
- Potrjena plačila se zapišejo v sistem in se povežejo z ustreznimi stroški
- Bančnik uporabi filtre (status, uvoz, starš, časovno obdobje) za iskanje specifičnih transakcij

## Design Decisions

- Ločen pogled za seznam uvozov bančnih izpiskov z možnostjo vstopa v podrobnosti posameznega uvoza
- Tabela transakcij z jasnim označevanjem ujemanj in napak (barvno označevanje, statusni badge-i)
- Inline popravljanje povezav v tabeli z dropdownom za izbiro starša (brez modalnega okna)
- Preprost akcijski gumb za potrjevanje posamezne transakcije
- Gumb za masovno potrjevanje vseh transakcij iz uvoza
- Filtri: status transakcije, uvoz, starš, časovno obdobje (datum)
- Statusni indikatorji za uvoz (obdelava, dokončano, napaka)
- Statusni indikatorji za transakcije (neujemajoča, ujemajoča, potrjena)
- Pregled statistik uvoza (skupno transakcij, ujemanj, neujemanj)

## Data Used

**Entities:**
- BankStatement — Bančni izpisek v PDF ali XML formatu z več transakcijami
- BankTransaction — Posamezna transakcija iz bančnega izpiska z možnostjo povezave s staršem
- Payment — Plačilo, ki je bilo potrjeno iz bančne transakcije

**From global model:**
- Parent entity (for matching transactions)

## Visual Reference

See `transaction-list.png` for the target UI design.

## Components Provided

- `TransactionList` — Main component displaying transactions with filters and confirmation actions
- `TransactionRow` — Row component for displaying individual transaction with inline editing
- `BankStatementList` — Component for displaying list of imported bank statements

## Callback Props

| Callback | Description |
|----------|-------------|
| `onUploadStatement` | Called when user uploads a new bank statement file |
| `onViewStatement` | Called when user opens statement details |
| `onCloseStatement` | Called when user closes statement details |
| `onUpdateTransactionMatch` | Called when user changes transaction parent match |
| `onConfirmTransaction` | Called when user confirms a single transaction |
| `onConfirmAllTransactions` | Called when user confirms all transactions from a statement |
| `onTransactionStatusFilterChange` | Called when user changes transaction status filter |
| `onStatementFilterChange` | Called when user changes statement filter |
| `onParentFilterChange` | Called when user changes parent filter |
| `onDateFromChange` | Called when user changes date from filter |
| `onDateToChange` | Called when user changes date to filter |

