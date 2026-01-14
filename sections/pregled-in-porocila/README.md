# Pregled in poročila

## Overview

Nadzorna plošča za pregled finančnega stanja kluba. Omogoča pregled obveznosti po tekmovalcih in skupinah, izvoz odprtih postavk za komunikacijo s starši, finančne preglede po obdobjih in revizijsko sled akcij.

## User Flows

- Bančnik odpre sekcijo in vidi nadzorno ploščo s ključnimi številkami (skupni odprti dolg, število odprtih postavk, prejeta plačila v izbranem obdobju, število neujemajočih transakcij)
- Bančnik izbere obdobje in opcijsko skupino z filtri
- Bančnik pregleda pregled obveznosti po tekmovalcih (saldo, odprte postavke, zapadle postavke) ali po skupinah (vsota odprtih obveznosti)
- Bančnik klikne na starša ali tekmovalca za podrobnosti (drill-down)
- Bančnik izvozi odprte postavke po staršu ali skupini (CSV/PDF) z možnostjo izbire obdobja in filtra "samo zapadlo / vse odprto"
- Bančnik pregleda finančne preglede: prihodke (plačila) po obdobjih, stroške/obračune po obdobjih in tipih stroškov, primerjavo "ustvarjeno vs. plačano"
- Bančnik pregleda revizijsko sled zadnjih akcij (bulk obračuni, potrditve uvozov, razveljavitve stroškov)

## Design Decisions

- Dashboard kartice s ključnimi številkami (KPI)
- Filtri: obdobje, skupina, status člana (aktivni/neaktivni; arhivirani skriti privzeto)
- Tabela obveznosti po tekmovalcih z možnostjo drill-down
- Tabela obveznosti po skupinah (vsota odprtih obveznosti po skupini)
- Preklop med pogledoma (po tekmovalcih/po skupinah)
- Gumbi za izvoz (CSV/PDF) na vrhu filtriranih seznamov
- Finančni pregledi: prihodki po obdobjih, stroški po obdobjih in tipih, primerjava "ustvarjeno vs. plačano"
- Revizijska sled: seznam zadnjih akcij z informacijami "kdo/kdaj/kaj"

## Data Used

**Entities:**
- DashboardKPIs — Ključne številke za nadzorno ploščo
- MemberObligation — Obveznosti po tekmovalcih z saldom in odprtimi postavkami
- GroupObligation — Obveznosti po skupinah z vsoto odprtih obveznosti
- FinancialReport — Finančni pregledi z prihodki in stroški po obdobjih
- AuditLogEntry — Revizijska sled akcij

**From global model:**
- Member, Parent, Group entities (for drill-down and filtering)

## Visual Reference

See `dashboard-view.png` for the target UI design.

## Components Provided

- `DashboardView` — Main component displaying dashboard KPIs, obligations, financial reports, and audit log
- `MemberObligationRow` — Row component for displaying member obligations
- `GroupObligationRow` — Row component for displaying group obligations

## Callback Props

| Callback | Description |
|----------|-------------|
| `onPeriodFromChange` | Called when user changes period from filter |
| `onPeriodToChange` | Called when user changes period to filter |
| `onGroupFilterChange` | Called when user changes group filter |
| `onMemberStatusFilterChange` | Called when user changes member status filter |
| `onViewModeChange` | Called when user toggles between 'by-member' and 'by-group' view |
| `onViewMemberDetails` | Called when user clicks on member for drill-down |
| `onViewParentDetails` | Called when user clicks on parent for drill-down |
| `onViewGroupDetails` | Called when user clicks on group for drill-down |
| `onExportByParent` | Called when user exports obligations by parent (CSV/PDF) |
| `onExportByGroup` | Called when user exports obligations by group (CSV/PDF) |

