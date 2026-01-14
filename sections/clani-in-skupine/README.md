# Člani in skupine

## Overview

Osnovni administrativni del sistema za upravljanje tekmovalcev, staršev in trenerskih skupin. Omogoča bančniku hitro dodajanje, urejanje in organizacijo članov kluba z jasnimi statusnimi indikatorji in učinkovitimi filtri.

## User Flows

- Bančnik odpre sekcijo in vidi seznam vseh članov v tabeli
- Bančnik uporabi filtre (iskanje, status, skupina) za hitro iskanje specifičnih članov
- Bančnik odpre posameznega člana iz seznama za pregled ali urejanje podatkov
- Bančnik doda novega tekmovalca z izpolnitvijo osnovnih podatkov (ime, priimek, datum rojstva, status, opombe)
- Bančnik poveže tekmovalca s staršem (izbor iz obstoječega seznama ali hiter vnos novega starša)
- Bančnik dodeli tekmovalca v trenersko skupino (samo ena skupina naenkrat)
- Bančnik spremeni status tekmovalca (aktivni/neaktivni/arhivirani)
- Bančnik izvede masovne operacije (sprememba statusa, dodelitev v skupino) za več izbranih tekmovalcev
- Bančnik upravlja starše in trenerje kot podporne podpoglede znotraj sekcije

## Design Decisions

- Tabela s seznamom vseh članov z možnostjo filtriranja in iskanja
- Jasni statusni indikatorji za vizualno ločevanje statusov (aktivni/neaktivni/arhivirani)
- Enostaven obrazec za dodajanje/urejanje tekmovalca
- Masovne akcije za izbrane tekmovalce (checkboxi za izbiro)
- Poudarek na hitrosti in preglednosti - brez kompleksnih pogledov

## Data Used

**Entities:**
- Member — Tekmovalec kluba z osnovnimi podatki, statusom in povezavami
- Parent — Starš tekmovalca, odgovoren za plačila
- Group — Trenerska skupina z enim trenerjem
- Coach — Trener, ki vodi trenersko skupino

**From global model:**
- Member, Parent, Group, Coach entities

## Visual Reference

See `member-list.png` and `member-form.png` for the target UI design.

## Components Provided

- `MemberList` — Main component displaying list of members with filters and bulk actions
- `MemberRow` — Row component for displaying individual member in the table
- `MemberForm` — Form component for adding/editing a member

## Callback Props

| Callback | Description |
|----------|-------------|
| `onViewMember` | Called when user clicks to view member details |
| `onEditMember` | Called when user clicks to edit member |
| `onDeleteMember` | Called when user clicks to delete member |
| `onCreateMember` | Called when user clicks to create new member |
| `onStatusChange` | Called when user changes member status |
| `onAssignGroup` | Called when user assigns member to a group |
| `onBulkStatusChange` | Called when user performs bulk status change |
| `onBulkAssignGroup` | Called when user performs bulk group assignment |
| `onSearchChange` | Called when user changes search filter |
| `onStatusFilterChange` | Called when user changes status filter |
| `onGroupFilterChange` | Called when user changes group filter |
| `onManageParents` | Called when user wants to manage parents |
| `onManageCoaches` | Called when user wants to manage coaches |

