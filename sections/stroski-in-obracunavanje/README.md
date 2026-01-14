# Stroški in obračunavanje

## Overview

Sekcija za upravljanje stroškov in obračunavanje obveznosti. Omogoča bančniku hitro ustvarjanje posameznih in masovnih stroškov za tekmovalce, pregled obveznosti in upravljanje različnih vrst stroškov z jasnim statusnim sledenjem.

## User Flows

- Bančnik odpre sekcijo in vidi pregled stroškov (privzeto po stroških)
- Bančnik preklopi med pregledom po stroških in pregledom po tekmovalcih
- Bančnik uporabi filtre (skupina, status, vrsta stroška) za iskanje specifičnih stroškov
- Bančnik izbere skupino ali filtrira člane in označi tekmovalce z checkboxi
- Bančnik klikne na gumb za masovno obračunavanje in vnese podatke stroška (naziv, znesek, vrsta, rok)
- Sistem ustvari obveznosti za vse izbrane tekmovalce in jih prikaže v pregledu
- Bančnik ustvari posamezen strošek za izbranega tekmovalca
- Bančnik uredi obstoječi strošek (naziv, opis, rok) - znesek se ne spreminja po potrditvi
- Bančnik razveljavi strošek (logična razveljavitev za sledljivost)
- Bančnik pregleda status stroškov (odprto/poravnano/razveljavljeno)

## Design Decisions

- Kombiniran pregled stroškov z možnostjo preklopa med pogledom po stroških in pogledom po tekmovalcih
- Tabela s filtri in checkboxi za izbiro tekmovalcev
- Jasen "bulk action" gumb za masovno dodajanje stroška
- Modalno okno za vnos podatkov stroška
- Prednastavljen seznam vrst stroškov z možnostjo dodajanja novih
- Jasni statusni indikatorji (odprto/poravnano/razveljavljeno)

## Data Used

**Entities:**
- Cost — Strošek vezan na tekmovalca z nazivom, zneskom, vrsto, rokom in statusom
- CostType — Vrsta stroška (vadnine, oprema, članarine, priprave, modre kartice, zdravniški pregledi)

**From global model:**
- Member, Group entities (for filtering and bulk operations)

## Visual Reference

See `cost-list.png` for the target UI design.

## Components Provided

- `CostList` — Main component displaying costs with filters, view mode toggle, and bulk actions
- `CostRow` — Row component for displaying individual cost in the table

## Callback Props

| Callback | Description |
|----------|-------------|
| `onViewModeChange` | Called when user toggles between 'by-cost' and 'by-member' view |
| `onCreateCost` | Called when user clicks to create new cost |
| `onEditCost` | Called when user clicks to edit cost |
| `onCancelCost` | Called when user cancels/voids a cost |
| `onBulkBilling` | Called when user performs bulk billing for selected members |
| `onGroupFilterChange` | Called when user changes group filter |
| `onStatusFilterChange` | Called when user changes status filter |
| `onCostTypeFilterChange` | Called when user changes cost type filter |

