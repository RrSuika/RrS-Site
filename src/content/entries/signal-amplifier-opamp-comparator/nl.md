---
title: "Signaalversterking: op-amp en spanningscomparator"
date: 2026-08-10
description: "Een sensor geeft een signaal dat te klein is om te meten. Dit is hoe een op-amp het groter maakt zonder het te verpesten, en hoe een comparator er een simpel ja of nee van maakt."

type: note
category: Elektronica

tags:
  - Elektronica
  - Signaalverwerking
  - Op-Amp
  - Comparator
  - Analoge schakelingen

tools:
  - Circuitanalyse
  - Analoge elektronica

featured: false

lang: nl

translationKey: signal-amplifier-opamp-comparator
---

# Op-amps en spanningscomparators

![Introductie op-amp](./01-opamp-intro.png)![Op-amp, basis](./02-opamp-basics.png)

Bronnen: [Bilibili](https://www.bilibili.com/video/BV1VeQdYUELe) [Zhihu](https://zhuanlan.zhihu.com/p/1928161464247620032)

Aan het eind van dit stuk weet je wat een op-amp doet, waarom zijn twee ingangspinnen zich gedragen zoals ze doen, en welke van de klassieke schakelingen je pakt als het signaal van een sensor te zwak is voor de microcontroller. Ik schreef het nadat de twee regels hieronder eindelijk op hun plaats vielen: een heleboel schakelingen zagen er ineens niet meer uit als magie.

## De twee regels die bijna alles verklaren

Bijna elke op-ampschakeling die je ooit leest is een van deze twee regels in een bepaalde vorm, dus het loont om ze eerst goed te krijgen.

**Virtueel open.** De twee ingangspinnen trekken bijna geen stroom. In alle berekeningen hieronder mag je doen alsof ze helemaal geen stroom trekken, en ze behandelen als pinnen waar niets aan hangt. Dat is wat de naam zegt: open, maar niet echt.

**Virtuele kortsluiting.** Leg de uitgang terug naar de ingang met het - teken en je hebt een terugkoppelingslus gemaakt, dat wil zeggen dat een deel van de uitgang teruggaat naar de ingang. In die lus stuurt de op-amp zijn uitgang tot beide ingangspinnen op dezelfde spanning staan. Er verbindt niets de pinnen; de op-amp dwingt het. Elke versterkingsberekening hieronder begint hier.

## Nog twee dingen die bepalen of het werkt

**Uitgangsverzadiging.** De uitgang komt niet voorbij de voedingsspanning. Vraag je een grotere uitslag dan de voeding toestaat, dan stopt de uitgang gewoon op zijn grens en clipt hij: onder die grens volgt hij de ingang, erboven is de vorm weg.

**Spanningsvolger.** Zet de versterking op precies 1 en de uitgang kopieert de ingangsspanning, maar kan nu een zware belasting aandrijven. Je zet er een tussen een zwakke sensor en de volgende trap, zodat de sensor niet wordt omlaaggetrokken door wat erachter komt.

## De versterker die het signaal nauwelijks aanraakt

Gebruik deze als het signaal van iets zwaks komt, zoals een sensor. Het signaal gaat naar de + ingang, en die trekt bijna geen stroom, dus de sensor merkt nauwelijks dat er iets aan hangt. Twee weerstanden bepalen hoeveel groter de uitgang wordt: Rf loopt van de uitgang terug naar de - ingang, en Rg loopt van de - ingang naar aarde. De uitgang stijgt tot de spanning op de - ingang gelijk is aan die op de + ingang.

### Formule: Vout = Vin × (1 + Rf/Rg)

Lees het als: de uitgang is de ingang maal een plus de verhouding van de twee weerstanden. Maak Rf gelijk aan Rg en de versterking is 2. Maak Rf negen keer Rg en de versterking is 10. Door die 1 in de formule kan de versterking nooit onder 1 komen, dus deze schakeling maakt een signaal alleen maar groter.

![Niet-inverterende versterker](./03-non-inverting-amp.png)![Inverterende versterker](./04-inverting-amp.png)

## De versterker die het signaal ondersteboven zet

Gebruik deze als je signalen bij elkaar wilt optellen, of een stroom in een spanning wilt omzetten. Het signaal gaat naar de - ingang en de + ingang gaat naar aarde, dus hij beweegt de andere kant op: omhoog erin, omlaag eruit. De prijs is dat de - ingang stroom uit de bron trekt, dus hij past bij signaalbronnen die dat kunnen leveren. Rin zit tussen het signaal en de - ingang, en Rf zit tussen de - ingang en de uitgang.

### Formule: Vout = (-R2/R1) × Vi

Het minteken betekent dat de uitgang ondersteboven staat, en de grootte van de versterking is Rf gedeeld door Rin. Die versterking kan ook kleiner dan 1 zijn, dus deze schakeling kan een signaal zowel groter als kleiner maken.

Omdat de + ingang aan aarde ligt, houdt de op-amp de - ingang ook op aarde, ook al verbindt niets hem daarmee. Dat punt heet de virtuele aarde, en het is precies waarom meerdere ingangsstromen op één plek kunnen optellen.

## Welke moet ik hebben?

| Eigenschap        | Niet-inverterend          | Inverterend                  |
| --------------- | ---------------------- | -------------------------- |
| Ingangsimpedantie | Extreem hoog (MΩ)    | Gelijk aan Rin (kΩ)            |
| Versterking            | 1+Rf/Rg, ≥1            | −Rf/Rin, kan <1 zijn         |
| Uitgangsfase    | Zelfde als ingang          | Geïnverteerd                   |
| Virtuele aarde  | Nee                     | Ja, op de inverterende ingang    |
| Typisch gebruik     | Hoogohmige buffer, sensoren | Audiomix, inversie, I-V  |

De regel die de meeste keuzes bepaalt is de ingangsimpedantie, oftewel hoeveel de schakeling de bron belast. De niet-inverterende ingang trekt bijna niets, dus die is veilig vóór een zwakke sensor. De inverterende ingang ziet er voor de bron uit als Rin en trekt er stroom doorheen; dat is precies wat je wilt als je stromen optelt, en precies wat je niet wilt bij een sensor met hoge impedantie.

## Schakelingen die je al in huis hebt

Een keukenweegschaal of druksensor geeft een piepklein verschil tussen twee draden, en de op-amp maakt daar een spanning van die de ADC kan lezen (de ADC is het deel van de microcontroller dat een spanning meet). Het bereik moet zo gekozen worden dat harde signalen niet clippen. Een thermokoppel geeft nog minder, en daar wordt het versterkte signaal twee keer gebruikt: één keer voor het display, één keer om een relais om te zetten zodra een ingestelde temperatuur wordt gepasseerd. Een PIR-bewegingssensor geeft een kleine wisselende spanning als er iets warms beweegt, en de versterker filtert die voordat een comparator (een onderdeel dat alleen ja of nee antwoordt) beslist of er een lamp aangaat. Motorstroom wordt gemeten als een kleine spanning over een weerstand in het pad van de motor, en daarna versterkt zodat de microcontroller de voeding kan afsnijden als die te hoog wordt. In audio wordt het signaal van een microfoon versterkt en gefilterd voordat het bij een eindversterker of een ADC komt.

## Schakelingen met de inverterende versie

Audiomixers zijn het klassieke geval: elk kanaal krijgt zijn eigen ingangsweerstand, allemaal komen ze op dezelfde virtuele aarde uit, en daar tellen de stromen op. Daarom storen de kanalen elkaar niet. Dezelfde trap lost een sensor op die de verkeerde kant op wijst: sommige sensoren geven een lagere spanning als de druk stijgt, en één inverterende trap draait dat weer terug. Haal Rin weg en stuur een stroom rechtstreeks de - ingang in, en dezelfde schakeling zet stroom om in spanning, wat bijna elke fotodiodeschakeling doet (een fotodiode is een lichtsensor die stroom levert). Zet een inverterende en een niet-inverterende trap achter elkaar en je krijgt een differentiële versterker, de trap die industriële sensoren gebruiken als het signaal het verschil tussen twee draden is.

## Wat je tegenkomt als je het echt bouwt

Een gewone op-amp zoals de LM358 kan zijn uitgang niet helemaal naar de voedingsspanning laten uitslaan. Bij een 5 V-voeding stopt hij rond 3.5 V, en voor de ingangen geldt dezelfde grens: die werken van aarde tot ongeveer 3.5 V. Zet je 6 V op een ingang, dan zit je boven de voeding zelf en gedraagt het onderdeel zich niet meer zoals bedoeld. Met een ADC van 3.3 V maakt dat uit, want de op-amp kan voorbij de full scale van de ADC sturen: het is de ADC, niet de op-amp, die de bovenkant bepaalt van wat je kunt meten. Heb je de volle uitslag nodig, neem dan een rail-to-rail op-amp, een waarvan de uitgang beide voedingsrails kan halen.

Twee dingen vergeet je makkelijk. De ingangspinnen trekken nog steeds een beetje stroom, en die stroom moet ergens heen: geef elke ingang een pad naar aarde, via een weerstand of via de bron zelf, anders drift de ingangsspanning en drift de uitgang mee. En zet een condensator van 0.1 μF van elke voedingspin naar aarde, direct bij de chip. Sla die niet over.

Als het echt een ja/nee-beslissing is, gebruik dan een comparator, en geef hem een beetje hysteresis: één weerstand van de uitgang terug naar de + ingang maakt een kleine dode zone tussen inschakelen en uitschakelen. Zonder die zone klappert de uitgang zodra de ingang bij de drempel hangt, en elke schakeling die een langzaam of rumoerig signaal vergelijkt heeft die dode zone nodig.

## De klassieke schakelingen en waar ze voor dienen

Ik heb ze met de hand afgeleid toen ik ze aan het leren was. Hier staat waar elke schakeling voor dient en wat hij met het signaal doet, zonder de algebra.

### Twee spanningen bij elkaar optellen (inverterende ingang)
![Opteller 1](./05-adder-circuit-1.png)

Beide ingangen gaan via hun eigen weerstand naar de - ingang, die op de virtuele aarde ligt. Omdat dat punt niet kan bewegen, tellen de stromen van de twee ingangen daar op. Met drie even grote weerstanden is de uitgang de som van de twee ingangen, geïnverteerd: de grootte klopt, het teken staat op zijn kop.

### Twee spanningen bij elkaar optellen (niet-inverterende ingang)
![Opteller 2](./06-adder-circuit-2.png)

Dezelfde som, anders opgebouwd. De twee ingangen komen via R1 en R2 op de + ingang uit, en R3 en R4 vormen de terugkoppeldeler. Met R1 = R2 en R3 = R4 is de uitgang de som van de twee ingangen, deze keer zonder inversie.

### De ene spanning van de andere aftrekken
![Aftrekker](./07-subtractor-circuit.png)

Elke ingang krijgt een weerstand naar een van de op-ampingangen, en de terugkoppelweerstanden zijn per paar gelijk. Welke ingang op de + pin uitkomt is degene die je houdt, en de ingang aan de - kant wordt ervan afgetrokken. Met gelijke weerstanden is de uitgang precies dat verschil.

### De ingang over de tijd optellen (integrator)
![Integrator](./08-integrator-circuit.png)

Vervang de terugkoppelweerstand door een condensator en de schakeling doet iets anders: hij telt op wat er binnenkomt. Houd de ingang stil en de uitgang blijft bewegen, als een stopwatch die nooit stopt. Een constante ingang laat de uitgang in een rechte lijn oplopen, en dat loopt door tot de uitgang de voedingsrail bereikt en daar stopt.

### Reageren op hoe snel de ingang verandert (differentiator)
![Differentiator](./09-differentiator-circuit.png)

Het spiegelbeeld: een condensator in de ingang en een weerstand in de terugkoppeling. Deze reageert op verandering, niet op niveau. Houd de ingang stil en de uitgang blijft op nul; laat de ingang springen en je krijgt een piek de andere kant op.

### Het verschil tussen twee draden lezen (differentiële versterker)
![Differentiële versterker](./10-differential-amplifier.png)

Dit is de schakeling voor een signaal dat bestaat als het verschil tussen twee draden. De eerste trap meet dat verschil over de middelste weerstand, en de keten weerstanden eromheen bepaalt hoe vaak dat verschil wordt vermenigvuldigd. Een tweede trap trekt de ene kant van de andere af, zodat je één uitgang krijgt. Wat beide draden in gelijke mate oppikken heft elkaar op en wordt niet versterkt.

### Een sensorstroom van 4~20mA lezen
![Stroomdetectie](./11-current-detection.png)

Sommige industriële transmitters sturen een stroom in plaats van een spanning: 4 mA onderaan hun bereik en 20 mA bovenaan, en controllers accepteren vaak een stroom van 0~20mA of 4~20mA. Stuur die stroom door een weerstand van 100Ω en er wordt 0.4~2V van. De versterker vermenigvuldigt dat met 2.2, ingesteld door de weerstanden van 22k en 10k, dus de ADC ziet 0.88~4.4V. De uitgang komt er negatief uit; draai de stroom om en hij is positief.

### Een stroom maken van een spanning
![Spanning-naar-stroomomzetter](./12-voltage-current-converter.png)

De omgekeerde truc: een spanning erin, een stroom eruit. Hier loopt het terugkoppelpad door een transistor in plaats van rechtstreeks via een weerstand terug. Dat maakt er geen comparator van: zolang de transistor in zijn actieve gebied zit, gelden de twee regels nog steeds. De stroom door R7 wordt bepaald door de ingangsspanning gedeeld door de waarde van R7, en zolang de belasting veel kleiner is dan de weerstand van 100kΩ aan de uitgang gaat bijna al die stroom door de belasting.

### Een PT100-temperatuursensor lezen
![PT100-sensor](./13-pt100-sensor.png)

Een PT100 is een temperatuursensor: een weerstand waarvan de waarde met de temperatuur verandert, waarna je de temperatuur in een tabel opzoekt. Er gaan drie draden naartoe, allemaal van hetzelfde materiaal en dezelfde lengte. Twee ervan voeren de stroom, en de weerstand van de kabel zelf staat in serie met de sensor, dus hij telt mee in de meting: een lange kabel ziet eruit als extra temperatuur.

De schakeling omzeilt dat door op de derde draad de spanningsval over de kabel zelf te meten. De eerste versterker zet de sensorweerstand om in een spanning, en een tweede versterker meet de kabelweerstand apart. Twee metingen, twee onbekenden, dus je kunt de sensorweerstand er alleen uit halen en de temperatuur opzoeken. Die tweede versterker moet op het punt van de kabelspanningsval aangesloten zitten en niet op de uitgang van de eerste: als hij de eerste versterker gewoon kopieerde, zouden beide metingen dezelfde onbekende bevatten en kon je ze niet scheiden.

### Waarom heet het "operationeel"?

De naam komt uit de tijd van de analoge computers, toen deze schakelingen echt het rekenwerk deden: optellen, aftrekken, integreren. De naam is blijven hangen.

![Analoge computer 1](./14-analog-computer-1.png)![Analoge computer 2](./15-analog-computer-2.png)

## Op-amp of comparator: welke heb ik nodig?

Een **comparator** ziet er bijna hetzelfde uit als een op-amp en doet iets anders. Hij probeert niet lineair te blijven: hij vergelijkt zijn twee ingangen en antwoordt met één bit, hoog of laag. Sommige kunnen hun uitgang helemaal niet hoog trekken en hebben daar een weerstand naar de voeding voor nodig.

**Op-amps (zoals de LM358)** zijn gebouwd om in het **lineaire gebied** te blijven. Met terugkoppeling houden ze beide ingangen gelijk, en de uitgang volgt de ingang continu. Hun werk is versterken, wat betekent dat de vorm van de uitgang moet kloppen met die van de ingang: breng een fotodiodesignaal van 0.2V naar 2V en de golfvorm komt er ongeschonden uit. Je kunt er in een noodgeval open-loop een comparator van maken, maar daar is hij niet voor gemaakt.

**Comparators (zoals de LM393)** zijn gebouwd om te schakelen. Ze laten de twee ingangen bewust uiteenlopen, en de uitgang klapt tegen de ene of de andere rail, dus er zijn maar twee toestanden. Hun werk is beslissen: stel een drempel van 2.5V in en de uitgang verandert op het moment dat die wordt gepasseerd.

Mijn vuistregel:
- Moet je een **continue analoge waarde lezen** (temperatuurcurve, lichtniveau, drukgolfvorm) → gebruik een **op-amp** voor buffering, versterking en filtering, en voer daarna de ADC.
- Moet je een **binaire beslissing nemen** (temperatuurdrempel bereikt, beweging gedetecteerd, batterij bijna leeg) → gebruik een **comparator** voor een schone hoog/laag-uitgang of interrupttrigger.
