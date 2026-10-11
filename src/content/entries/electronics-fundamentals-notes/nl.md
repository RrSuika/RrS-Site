---
title: "Elektronica-fundamenten: zelfstudienotities"
date: 2026-05-14
description: "Begin hier als elektronica nog als magie voelt. Wat spanning en stroom echt zijn, waarom een lamp meteen brandt als je het licht aandoet, en wat elk onderdeel op een printplaat doet."

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

Ik wilde naar een printplaat kunnen kijken en kunnen zeggen wat elk onderdeel doet. Dit zijn de aantekeningen die ik vanaf nul heb opgebouwd. Na het lezen zou je moeten kunnen uitleggen waarom een LED een weerstand voor zich nodig heeft, wat een condensator doet dat een weerstand niet kan, en waarom de stroom die ergens instroomt gelijk is aan de stroom die eruit gaat.

> **Opmerking:** de afbeeldingen zijn uitsluitend bedoeld voor educatieve doeleinden en zelfstudie.

## De wateranalogie: een prima startpunt

Het snelste beeld van de drie basisgrootheden is een waterleiding.

- **Spanning (V):** de duw, in volt. Vergelijkbaar met waterdruk.
- **Stroom (I):** hoeveel lading er per seconde langs een punt gaat, in ampère. Vergelijkbaar met liters per seconde.
- **Weerstand (R):** hoeveel iets de stroom tegenhoudt, in ohm. Vergelijkbaar met een nauwe buis.

> **Wet van Ohm: V = I × R**

Lees het als: bij dezelfde weerstand duwt meer spanning meer stroom door. Bij dezelfde spanning betekent meer weerstand minder stroom. De watervergelijking is niet perfect, maar goed genoeg.

## Dieper begrip: wat er echt gebeurt als je een schakelaar omzet

Zet een schakelaar om en de lamp brandt meteen. Dus de elektronen racen met de lichtsnelheid van de batterij naar de lamp, toch? Nee. Dit was het meest contra-intuïtieve dat ik leerde.

### Waarom brandt de lamp meteen als de elektronen kruipen?

Een koperdraad zit al vol vrije elektronen. Ze zitten tussen de atomen van het metaal, als water in een leiding die al vol zit.

Zet je spanning aan, dan gaan die elektronen langzaam driften, maar onderweg botsen ze steeds tegen de metaalatomen. Hun netto snelheid is maar tientallen micrometers per seconde, langzamer dan een slak.

Waarom brandt de lamp dan meteen? Omdat de energie niet in de elektronen reist. Ze reist als een elektrisch veld, dat vrijwel meteen de hele kring vult, met 60 tot 90 procent van de lichtsnelheid. Elk elektron in de draad krijgt op hetzelfde moment een duw.

Wat wij elektriciteit noemen is vooral het veld dat beweegt, niet de elektronen.

### Wat is spanning dan precies?

Een batterij gebruikt chemische energie om negatieve lading naar de ene kant te duwen en positieve naar de andere. Die scheiding bouwt een elektrisch veld op in de kring. Terwijl lading door dat veld beweegt, verricht het veld arbeid. Spanning is die arbeid gedeeld door de hoeveelheid lading.

## De wetten van Kirchhoff

Deze twee regels komen uit twee dingen die niet gemaakt of vernietigd kunnen worden: lading en energie. Het zijn de twee nuttigste feiten uit de circuitanalyse.

## De stroomwet van Kirchhoff (KCL)

### Waarom de stroom die erin gaat gelijk is aan de stroom die eruit komt

Neem een punt waar draden samenkomen. De stroom die erin gaat moet gelijk zijn aan de stroom die eruit gaat. Lading kan daar niet blijven liggen: ging er meer in dan uit, dan hoopte negatieve lading zich op, en gelijke ladingen stoten elkaar af. Die afstoting duwt het overschot er meteen weer uit. De regel geldt dus precies.

## De spanningswet van Kirchhoff (KVL)

### Waarom de spanningen rond een lus elkaar opheffen

Een batterij is als een lift voor lading: ze verbruikt chemische energie om lading naar een hoger energieniveau te tillen. Stroomt die lading door de rest van de kring, dan staat ze die energie weer af, vooral als warmte. Tegen de tijd dat ze terug is bij de batterij, is er niets meer over. De spanningen rond een gesloten lus heffen elkaar dus precies op.

## Weerstand

![Dwarsdoorsnede van een koolstoffilmweerstand](./18.jpg)

Een weerstand is het simpelste onderdeel in de elektronica: hij maakt het moeilijker om stroom door te duwen. Twee toepassingen. Stroom begrenzen zodat een LED niet doorbrandt. En een spanning opdelen in een kleinere.

### Wat zit er in een weerstand?

1. **Een keramische staaf.** De vaste kern.
2. **Een koolstoffilm.** Een dun laagje koolstof op de staaf. Dat is wat de stroom tegenhoudt.
3. **Een spiraalgroef.** Een laser snijdt een spiraal in de film. Een kort, breed pad houdt minder tegen; een lang, dun pad meer.
4. **Eindkapjes en poten.** Metalen kapjes op beide uiteinden, met draadpoten eraan gelast.
5. **Lak en kleurbanden.** Isolerende lak, plus gekleurde strepen die de waarde coderen.

De waarde hangt af van het materiaal en de vorm: een lang dun pad houdt meer tegen dan een kort breed pad. Het filmlaagje bepaalt ook hoeveel de waarde wegloopt als hij warm wordt, en hoeveel elektrische ruis hij toevoegt.

![Kleurbanden van weerstanden](./21.png)

### Waarom heeft een LED een weerstand nodig?

![Stroombegrenzing: met weerstand versus LED doorgebrand door te veel stroom](./17.png)

Een LED is een lampje van halfgeleidermateriaal. Laat je hem alleen, dan trekt hij net zolang stroom uit de voeding tot hij zichzelf stukmaakt. Een weerstand in serie begrenst die stroom tot een veilige waarde.

**De weerstand voor één LED uitrekenen:**
Stel de LED wil 3V en 13,5mA (duizendsten van een ampère), en je voeding is 5V.

- Het verschil moet de weerstand opvangen: 5V - 3V = 2V.
- Weerstand is spanning gedeeld door stroom: 2V ÷ 0,0135A = 148Ω. Neem de dichtstbijzijnde standaardwaarde, 150Ω.

Nog één controle: die 2V wordt warmte in de weerstand. Dat is ongeveer 27mW, en een gewone ¼W-weerstand kan ruim tien keer zoveel hebben.

### Hoe maken twee weerstanden een kleinere spanning?

Zet twee weerstanden achter elkaar en de spanning verdeelt zich. De grootste krijgt het grootste deel. Zo maak je van een grote spanning een kleinere.

### Kan een LED als weerstand dienen?

Nee. Een weerstand volgt een simpele regel: twee keer zoveel spanning, twee keer zoveel stroom. Een LED doet dat niet. Onder een bepaalde spanning geleidt hij bijna niets, en net daarboven schiet de stroom omhoog. Je kunt ze dus niet voor elkaar inwisselen.

### Hoe zie je welke van twee spanningen groter is?

![Spanningscomparator, schema 1](./23.png)
![Spanningscomparator, schema 2](./22.png)

### Welke weerstand moet ik kopen?

![Overzicht weerstandstypen](./extra.png)

Er zijn een paar soorten: koolstoffilm, metaalfilm, draadgewonden voor veel vermogen, en kleine SMD-chips voor fabrieksprinten. Bij het kiezen let je op vier dingen: hoeveel vermogen hij aankan, hoe dicht de echte waarde bij de opgedrukte ligt, hoeveel hij wegloopt als hij warm wordt, en hoeveel ruis hij toevoegt. Voor analoge schakelingen kies ik standaard metaalfilm.

### Wat je van weerstanden moet onthouden

![Samenvatting weerstanden](./20.png)

## Condensator

![Overzicht condensatoren 1](./27.png)
![Overzicht condensatoren 2](./28.png)

Een condensator slaat energie op in het elektrisch veld tussen twee platen. Zie hem als een buffer: hij loopt vol als er spanning over is en leegt zich als de spanning zakt. Er loopt alleen stroom zolang de spanning over hem verandert. Snelle veranderingen gaan er dus door, een gelijkblijvende spanning niet. Daarom maakt hij voedingen glad en bepaalt hij tijden.

## Spoel

![Overzicht spoelen](./29.png)

Een spoel is een stuk wikkeldraad. Hij slaat energie op in een magnetisch veld en verzet zich tegen elke verandering van de stroom. Zijn regel is het spiegelbeeld van de condensator: de spanning over de spoel hangt af van hoe snel de stroom verandert. Spoel en condensator zijn de twee helften van de meeste filters.

### Hoe maken een spoel en een condensator een voeding glad?

![Gelijkrichtbrug met spoel 1](./24.png)
![Gelijkrichtbrug met spoel 2](./25.png)

In een voeding werken ze samen. De gelijkrichtbrug maakt van wisselspanning (stroom die steeds van richting wisselt) gelijkspanning (stroom die één kant op gaat), maar het resultaat schommelt. De spoel vlakt de schommeling in de stroom af, de condensator die in de spanning.

Hetzelfde gebeurt op accuniveau. Een omvormer trekt honderd keer per seconde stroompulsen uit de accu. In de kabel worden die pulsen een schommelende spanning, doordat de kabel de stroom tegenhoudt. Korte, dikke kabel houdt die schommeling klein. Victron zet de alarmgrens op 2,25V RMS bij een 24V-systeem, en RMS is te lezen als een soort gemiddelde van een schommelende spanning.

## Diode

![Overzicht diodes](./30.png)

Een diode is een terugslagklep voor stroom. Hij geleidt van de ene poot, de anode, naar de andere, de kathode, en blokkeert de andere richting. Door een siliciumdiode kost dat ongeveer 0,7V; door een Schottky-diode, gebouwd voor een kleinere val, 0,2 tot 0,4V. Diodes maken van wisselspanning gelijkspanning en beschermen tegen een accu die verkeerd om is aangesloten.

### Hoe maken vier diodes van wisselspanning gelijkspanning?

![Gelijkrichtbrug: diodetoepassing](./26.png)

Zet vier diodes in een ring en je hebt een gelijkrichtbrug. Welke kant de wisselspanning ook op gaat, er geleiden er altijd twee, dus de stroom vertrekt elke keer dezelfde kant op. Een condensator erachter maakt de schommeling glad. Bijna elke lineaire voeding begint zo.

## Transistor

🚧 _Binnenkort beschikbaar: de transistor-inhoud is in de maak._

## MOSFET

🚧 _Binnenkort beschikbaar: MOSFET-inhoud volgt._

## Lineaire versus schakelende voedingen

![Overzicht lineaire versus schakelende voeding](./31.png)

Een voeding maakt van wat uit het stopcontact of uit de accu komt de stabiele lage spanning die je schakeling nodig heeft. Dat kan op twee manieren.

- **Lineaire voeding**: een transformator verlaagt de spanning, daarna stookt een chip de rest op als warmte. Simpel en stil, maar verspillend.
- **Schakelende voeding (SMPS)**: de spanning wordt in hoogfrequente pulsen gehakt, door een transformator gestuurd en daarna gladgemaakt. Meer onderdelen, maar veel minder warmte en veel kleiner.

### Wat zit er in een 230V naar 12V voeding?

![SMPS-analyse 1](./32.png)
![SMPS-analyse 2](./33.png)
![SMPS-analyse 3](./34.png)

Stap voor stap door een echt schema lopen is de snelste manier om te zien hoe de delen samenwerken: het netfilter, de gelijkrichtbrug, de schakelchip, de transformator, de gelijkrichting aan de uitgang, en de terugkoppellus die de uitgangsspanning stabiel houdt.

## Praktische vaardigheden

![Overzicht praktische vaardigheden](./35.png)

De vaardigheden die tellen zijn fysiek: een schakeling op een breadboard bouwen, solderen, een multimeter goed gebruiken, een schema lezen en een fout opsporen. Van theorie alleen kom je niet ver. Op de dag dat ik met een multimeter een losse aarddraad vond, viel een hoop theorie ineens op zijn plaats.

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
