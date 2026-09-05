---
title: "Elektronica-fundamenten: zelfstudienotities"
date: 2026-05-14
description: Een gestructureerd studielogboek over spanning- en stroomtheorie, de wetten van Kirchhoff en de principes van elementaire elektronische componenten, waaronder weerstanden, condensatoren, diodes en voedingen.

type: note
category: Elektronica
cover: cover.png

tags:
  - Elektronica
  - Grondslagen
  - Analoge schakelingen
  - Componenten
  - Zelfstudie

tools:
  - Circuitanalyse
  - Wet van Ohm
  - Wetten van Kirchhoff
  - Analoge elektronica

featured: true

lang: nl

translationKey: electronics-fundamentals-notes
---

# Elektronica-fundamenten: mijn zelfstudienotities

Dit zijn de aantekeningen die ik heb opgebouwd terwijl ik mezelf systematisch hardware en analoge elektronica aanleerde. Beginnend bij de absolute basis, wat spanning eigenlijk is, hoe stroom werkt, hoe een weerstand er vanbinnen uitziet, met als doel een printplaat te kunnen bekijken en te begrijpen wat elke component doet. Ik kom regelmatig terug op deze aantekeningen, en elke keer ontdek ik iets nieuws.

> **Opmerking:** de afbeeldingen zijn uitsluitend bedoeld voor educatieve doeleinden en zelfstudie.

## Spanning en stroom

## De wateranalogie: een prima startpunt

Voordat je in de natuurkundige vergelijkingen duikt, kun je waterleidingen gebruiken om intuïtie op te bouwen:

- **Spanning (V):** vergelijkbaar met waterdruk; de "duw" die ladingen door een circuit drijft, oftewel het verschil in potentiële energie
- **Stroom (I):** vergelijkbaar met de waterstroomsnelheid; de daadwerkelijke beweging van ladingen door de geleider
- **Weerstand (R):** vergelijkbaar met de diameter van de buis; een smallere buis betekent meer weerstand

> **Wet van Ohm: V = I × R**

De analogie is niet perfect (geen enkele is dat), maar goed genoeg als werkend mentaal model.

## Dieper begrip: wat er echt gebeurt als je een schakelaar omzet

Zet een schakelaar om en de lamp brandt meteen. Dus de elektronen moeten met lichtsnelheid van de batterij naar de lamp racen, toch? Nee. Volledig fout. Dit was een van de meest contra-intuïtieve dingen die ik heb geleerd.

### "Slakkentempo"-elektronen versus "lichtsnelheid"-energie

In koperdraad vullen vrije elektronen het hele kristalrooster van het metaal; samen vormen ze de zogenoemde **"elektronenzee"**; ze zijn al overal in de draad.

- **Driftsnelheid**: leg een spanning aan, het elektrische veld duwt elektronen vooruit. Maar ze botsen voortdurend met het rooster van koperatomen, waardoor hun netto voorwaartse snelheid ongelooflijk laag is; doorgaans slechts **enkele micrometers tot millimeters per seconde**. Langzamer dan een slak.

- **Waarom brandt de lamp dan meteen?** Omdat de energie niet door de elektronen zelf wordt getransporteerd, maar door het **elektromagnetische veld**. Zodra de schakelaar sluit, plant het elektrische veld zich langs de draad voort met **bijna de lichtsnelheid** (~3 × 10⁸ m/s). De elektronen zijn al overal in de draad; het veld geeft ze allemaal tegelijk de duw (F = qE), en ze beginnen allemaal samen te driften.

Dit was voor mij een echt "aha-moment"; elektronen bewegen nauwelijks, maar het veld reist met lichtsnelheid. Wat wij "elektriciteit" noemen, is eigenlijk veldvoortplanting.

### De essentie van spanning: ruimtelijke accumulatie van elektrische veldkracht

In de natuurkunde is spanning een **elektrisch potentiaalverschil**. Een batterij gebruikt chemische energie om positieve en negatieve ladingen uit elkaar te halen, waardoor er een **elektrisch veld** in de ruimte ontstaat. Op elektronen die door dit veld bewegen, verricht de veldkracht arbeid. Spanning is die arbeid, per eenheid lading.

Spanning is dus geen mysterieuze gasdruk; het is de **"onzichtbare duw" van het elektrische veld op ladingen, opgebouwd over een ruimtelijke afstand**.

## De wetten van Kirchhoff

Deze twee wetten zijn niet zomaar handige hulpmiddelen voor circuitanalyse. Erachter staan twee fundamentele behoudswetten van het universum: **behoud van lading** en **behoud van energie**.

## De stroomwet van Kirchhoff (KCL)

### Waarom elektronen zich niet zomaar op een knooppunt kunnen opstapelen

- **Formule**: Σ I_in = Σ I_out
- **De natuurkunde**: elektronen dragen een negatieve lading. Volgens de **wet van Coulomb** stoten gelijke ladingen elkaar met enorme kracht af. Als er meer elektronen een knooppunt binnenstromen dan er vertrekken, zou zich daar negatieve lading ophopen.
- **Zelfcorrigerend mechanisme**: zodra lading zich begint op te bouwen, duwt de afstotende kracht binnenkomende elektronen weg en versnelt ze de vertrekkende. Deze microscopische zelfbalancering gebeurt in nanoseconden. Onder stationaire omstandigheden kan **geen enkel knooppunt een netto overtollige lading vasthouden**. Wat erin gaat, komt eruit, exact.

## De spanningswet van Kirchhoff (KVL)

### Waarom een volledige lus altijd op nul uitkomt

- **Formule**: Σ V = 0
- **De natuurkunde**: in de elektrostatica en in laagfrequente schakelingen is het elektrische veld een **conservatief veld** (rotatievrij). De arbeid die de veldkracht verricht, hangt alleen af van het begin- en eindpunt, niet van de afgelegde weg.

- **Het energiebeeld**: zie de voedingsbron als een "ladingenlift"; die verbruikt chemische energie om elektronen van laag potentiaal naar hoog potentiaal te tillen. Terwijl elektronen door weerstanden stromen, geven ze al die potentiële energie af via botsingen met het atoomrooster, en zetten die om in **warmte** of **licht**. Tegen de tijd dat een elektron terugkeert bij de negatieve pool van de batterij, is alle gewonnen energie weer afgestaan. Energie kan niet worden gecreëerd of vernietigd; dat is KVL in de kern.

## Elementaire elektronische componenten

## Weerstand

![Dwarsdoorsnede van een koolstoffilmweerstand](./18.jpg)

Weerstanden zijn passieve componenten die de stroomdoorgang belemmeren. Twee hoofdtoepassingen: stroombegrenzing (zodat je LED niet doorbrandt) en spanningsdeling (voor het maken van referentieniveaus).

### Binnenin een koolstoffilmweerstand

1. **Keramische kern**: een massief staafje van hoogwaardig keramiek (isolator); de structurele basis.
2. **Koolstoffilmlaag**: een dunne laag zuivere koolstof die op het keramische oppervlak is aangebracht. Dit is het eigenlijke weerstandsmateriaal.
3. **Spiraalgroef**: een spiraal wordt met laser in de koolstoffilm gesneden. Een kortere, bredere spiraal = lagere weerstand; langer, dunner = hogere weerstand. De spiraalgeometrie bepaalt de waarde.
4. **Eindkappen en aansluitdraden**: metalen kapjes worden op beide uiteinden geperst, vertinde koperdraden worden op de kapjes gelast.
5. **Beschermende coating en kleurbanden**: isolerende lak met gekleurde strepen die de weerstandswaarde en tolerantie coderen.

De weerstand van een bepaalde geometrie schaalt met de soortelijke weerstand ρ van het materiaal. De geleidbaarheidstabel uit de bedradingsgids zet koper op 1,7 × 10⁻⁸ Ω·m, koolstofstaal op 16,9 × 10⁻⁸ Ω·m en titanium op 41,7 × 10⁻⁸ Ω·m. Die spreiding is dezelfde fysica die koolstoffilm- van metaalfilmweerstanden scheidt; het filmmateriaal bepaalt hoeveel spiraal er voor een streefwaarde nodig is, en daarmee ook het temperatuurgedrag en de ruisvloer.

![Kleurbanden van weerstanden](./21.png)

### Stroombegrenzing voor LED's

![Stroombegrenzing: met weerstand versus LED doorgebrand door te veel stroom](./17.png)

Waarschijnlijk het eerste weerstandscircuit dat iedereen bouwt: LED + serieweerstand. Zonder de weerstand trekt de LED zoveel stroom als de voeding kan leveren, tot hij zichzelf vernietigt.

### Spanningsdeler

In een serieschakeling is de spanningsval over elke weerstand evenredig met zijn weerstand (grotere R = groter spanningsaandeel).

**Praktijkberekening: een serieweerstand voor een LED dimensioneren:**
De LED werkt op 3V en trekt 13.5mA (0.0135A), met een 5V-voeding.

- V_drop = V_source - V_LED = 5V - 3V = 2V
- R = V_drop / I = 2V / 0.0135A = 148.15Ω → **gebruik een weerstand van 150Ω**

Nog één controle voordat je gaat solderen: de weerstand verbrandt P = I² × R = 0,0135² × 150 ≈ 27mW, dus een standaard ¼W-weerstand draait op ongeveer 11% van zijn vermogen. Hetzelfde antwoord komt uit P = V × I (2V × 0,0135A = 27mW). Bij hogere stromen klimt het vermogen met I², en daarom doet het wattage van een weerstand er net zo veel toe als de weerstandswaarde.

### Kan een LED als weerstand dienen?

Nee. Een LED is een diode; die is niet-lineair. Een weerstand volgt de wet van Ohm (stroom evenredig met spanning). De I-V-curve van een LED is exponentieel: onder de doorlaatspanning geleidt hij nauwelijks; daarboven schiet de stroom omhoog. Je kunt hem niet vervangen door een vaste weerstand.

### Praktijkcase: spanningscomparator

![Spanningscomparator, schema 1](./23.png)
![Spanningscomparator, schema 2](./22.png)

### Soorten weerstanden

![Overzicht weerstandstypen](./extra.png)

Er is behoorlijk wat variatie: koolstoffilm, metaalfilm, draadgewonden, SMD-chipweerstanden, potentiometers (instelbare weerstanden). De keuze hangt af van het vermogen, de tolerantie, de temperatuurcoëfficiënt en de ruiseisen. Voor analoge schakelingen kies ik standaard voor metaalfilm; minder ruis dan koolstoffilm en een betere temperatuurstabiliteit.

### Samenvatting weerstanden

![Samenvatting weerstanden](./20.png)

## Condensator

![Overzicht condensatoren 1](./27.png)
![Overzicht condensatoren 2](./28.png)

Condensatoren slaan energie op in een elektrisch veld tussen twee geleidende platen, gescheiden door een diëlektricum (isolator). Ze worden gebruikt voor filtering, ontkoppeling, timingcircuits en energieopslag. Kernformule: I = C × dV/dt; de stroom door een condensator is evenredig met de snelheid van de spanningsverandering.

## Spoel

![Overzicht spoelen](./29.png)

Spoelen slaan energie op in een magnetisch veld wanneer er stroom doorheen loopt. Het is een draadspoel, meestal gewikkeld rond een magnetische kern. Het kenmerkende gedrag: een spoel verzet zich tegen veranderingen in stroom. Kernformule: V = L × dI/dt; de spanning over een spoel is evenredig met de snelheid van de stroomverandering.

### Praktijkcase: LC-filter na een gelijkrichtbrug

![Gelijkrichtbrug met spoel 1](./24.png)
![Gelijkrichtbrug met spoel 2](./25.png)

In voedingscircuits werken spoelen en condensatoren samen als LC-filters. Nadat de gelijkrichtbrug wisselspanning heeft omgezet in pulserende gelijkspanning, onderdrukt de spoel de rimpelstroom en maakt de condensator de spanning glad. De resulterende gelijkspanning is veel schoner dan bij filtering met alleen een condensator.

Dezelfde rimpelfysica duikt op systeemschaal op in de bedradingsgids: een omvormer trekt een fluctuerende gelijkstroom uit de accu op tweemaal de netfrequentie (100Hz), en de weerstand van de accukabel maakt daarvan rimpelspanning op de gelijkstroombus; Victron alarmeert op een 24V-systeem bij 2,25V RMS. Kleine filtercomponenten of dikke accukabels, het mechanisme is hetzelfde: rimpel is fluctuerende stroom maal serieweerstand.

## Diode

![Overzicht diodes](./30.png)

Diodes laten stroom maar in één richting door: van anode naar kathode. Ze vormen de basis van gelijkrichting (AC→DC), verkeerdompoolbeveiliging en allerlei vormen van signaalverwerking. Doorlaatspanning: ~0.7V voor siliciumdiodes, ~0.2-0.4V voor Schottky-diodes.

### Praktijkcase: gelijkrichtbrug

![Gelijkrichtbrug: diodetoepassing](./26.png)

Vier diodes in een brugschakeling zetten wisselspanning om in pulserende gelijkspanning. De condensator na de brug maakt die glad tot iets bruikbaars. Dit is de ingangstrap van vrijwel elke lineaire voeding.

## Transistor

🚧 _Binnenkort beschikbaar: de transistor-inhoud is in de maak._

## MOSFET

🚧 _Binnenkort beschikbaar: MOSFET-inhoud volgt._

## Lineaire versus schakelende voedingen

![Overzicht lineaire versus schakelende voeding](./31.png)

Voedingen zetten ingangsvermogen om in een geregelde gelijkspanningsuitgang. Twee hoofdtopologieën:

- **Lineaire voeding**: transformator → gelijkrichter → filtercondensator → lineaire regelaar. Simpel, weinig ruis, maar inefficiënt; de overtollige spanning wordt allemaal warmte.
- **Schakelende voeding (SMPS)**: hoogfrequent schakelen → transformator → gelijkrichting → terugkoppelingsregeling. Complexer, maar veel efficiënter en aanzienlijk kleiner.

### Praktijkcase: 230V → 12V schakelende voeding

![SMPS-analyse 1](./32.png)
![SMPS-analyse 2](./33.png)
![SMPS-analyse 3](./34.png)

Stap voor stap door een SMPS-schema lopen (ingangsfiltering, gelijkrichtbrug, schakelcontroller, transformator, uitgangsgelijkrichting, terugkoppelingslus) is een geweldige manier om echt voedingsontwerp te begrijpen.

## Praktische vaardigheden

![Overzicht praktische vaardigheden](./35.png)

De praktische vaardigheden waaraan ik bouw: circuits opbouwen op een breadboard, solderen, een multimeter correct gebruiken, schema's lezen, elementaire troubleshooting. Theorie brengt je maar tot op zekere hoogte; op het moment dat je die losse aardverbinding met een multimeter vindt, valt een hoop theorie ineens op zijn plaats.

## Referenties

1. [LED-weerstandscalculator](https://www.budgetronics.eu/nl/led-weerstand-calculator/c-7)
2. [Weerstandswarmtecalculator](https://a2zcalculators.com/science-and-engineering-calculators/resistor-heat-calculator)
3. [Pull-up- en pull-down-weerstanden](https://www.circuitbasics.com/pull-up-and-pull-down-resistors/)
4. [LM393 spanningscomparator, datasheet | TI.com](https://www.ti.com/product/LM393#features)
5. [Hoe je een spanningscomparatorcircuit bouwt met een LM393](https://www.learningaboutelectronics.com/Articles/LM393-voltage-comparator-circuit.php)
6. [LC-filtercalculator](https://www.omnicalculator.com/physics/lc-filter)
7. [Spanning en stroom uitgelegd](https://www.ariat-tech.com/blog/comprehensive-overview-of-voltage-and-current.html)
8. [25 soorten condensatoren en hun toepassingen](https://www.etechnophiles.com/types-of-capacitors/)
9. [Lineaire geregelde voeding: blokschema en circuitschema](https://www.hackatronic.com/linear-regulated-power-supply-block-diagram-circuit-diagram/)
10. [Hoe je een lineaire voeding bouwt](https://www.circuitbasics.com/linear-power-supplies/)
11. [Voedingsbasics: deel 1](https://mcitransformer.com/power-supply-basics-part-1-unregulated-linear-regulated-linear/)
12. [Geïsoleerde versus niet-geïsoleerde voedingen](https://resources.altium.com/p/isolated-vs-non-isolated-power-supplies-right-choice-without-fail)
13. [Galliumnitride-vermogenshalfgeleiders in de vermogenselektronica](https://www.mdpi.com/1996-1073/16/9/3894)
14. [Hoe telefoonladers werken | SMPS](https://www.youtube.com/watch?v=F2dCS5qOE8A)
15. [Modulaire EMI-filters voor netspanning uitgelegd](https://passive-components.eu/modular-ac-line-emi-filters-explained/)
16. [Gelijkrichtbrug met condensatorfilter](https://www.voltagelab.com/bridge-rectifier-with-capacitor-filter/)
17. [Koolstoffilmweerstanden begrijpen](https://www.utmel.com/blog/categories/resistor/understanding-of-carbon-film-resistors)
18. [Kleurcodes van weerstanden: betekenis van de kleurbanden](https://www.te.com/en/products/passive-components/resistors/intersection/resistor-color-codes.html)
19. [Victron Wiring Unlimited](https://www.victronenergy.com/upload/documents/The_Wiring_Unlimited_book/43562-Wiring_Unlimited-pdf-en.pdf)
