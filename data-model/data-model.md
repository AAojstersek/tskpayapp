# Data Model

## Entities

### Member
Tekmovalec kluba, ki je vezan na starša (plačnika) in pripada eni ali več trenerskim skupinam.

### Parent
Starš tekmovalca, ki je odgovoren za plačila in je vezan na enega ali več tekmovalcev.

### Coach
Trener, ki vodi trenersko skupino in je odgovoren za določeno starostno skupino otrok.

### Group
Trenerska skupina (npr. Andrejeva skupina, Klemnova skupina, Luka skupina), ki ima enega trenerja in vključuje več tekmovalcev.

### Cost
Strošek, ki je vezan na tekmovalca in predstavlja različne vrste obveznosti (vadnine, oprema, članarine, priprave, modre kartice, zdravniški pregledi).

### Payment
Plačilo od starša, ki lahko pokrije enega ali več stroškov tekmovalcev tega starša.

### Bank Statement
Bančni izpisek v PDF formatu, ki vsebuje več bančnih transakcij in je uvožen v sistem.

### Bank Transaction
Posamezna transakcija iz bančnega izpiska, ki se lahko poveže s staršem ali plačilom na podlagi imena ali referenčne številke.

## Relationships

- Member belongs to Parent (vsak tekmovalec ima starša)
- Member belongs to Group (tekmovalci so v trenerskih skupinah)
- Group has one Coach (vsaka skupina ima trenerja)
- Cost belongs to Member (stroški so vezani na tekmovalce)
- Payment belongs to Parent (plačila so vezana na starše)
- Payment can cover many Costs (eno plačilo lahko pokrije več stroškov)
- Bank Statement has many Bank Transactions (izpisek vsebuje več transakcij)
- Bank Transaction can be matched to Payment or Parent (transakcija se lahko poveže s plačilom ali staršem)

