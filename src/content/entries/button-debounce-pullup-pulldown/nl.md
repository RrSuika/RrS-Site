---
title: "Knopinvoer: debounce en pull-up/pull-down-weerstanden"
date: 2026-08-10
description: "Een knop is gewoon een schakelaar, waarom heeft die dan een weerstand nodig? Wat een zwevende pin met een chip doet, waarom één druk als vijf kan tellen, en hoe je beide oplost."

type: note
category: Elektronica

tags:
  - Elektronica
  - Invoerontwerp
  - Pull-up-weerstand
  - Debounce
  - Circuitbeveiliging

tools:
  - Circuitontwerp
  - Embedded-ontwikkeling

featured: false

lang: nl

translationKey: button-debounce-pullup-pulldown
---

![Pull-up, basis](./01-pullup-basics.png)

[Artikel: doel en principes van pull-up- en pull-down-weerstanden, Zhihu](https://zhuanlan.zhihu.com/p/258321463)

# Wat een knop eigenlijk is

Na dit stuk weet je waarom een kale knop niet betrouwbaar te lezen is, waarom één weerstand dat oplost, en wanneer je software er nog overheen moet zetten.

Een knop is niets meer dan twee metalen contacten die elkaar raken als je drukt. Het onderdeel dat hem uitleest is de microcontroller, of MCU, de kleine chip waarop je firmware draait. De MCU ziet niet of die contacten elkaar raken. Hij meet alleen de spanning op een van zijn pinnen, en zo'n pin die je uitleest heet een GPIO. De keten is dus: jij drukt, de contacten raken elkaar, de spanning op de pin verandert, en de firmware beslist wat dat betekent.

Twee woorden eerst. LAAG betekent dat de pin rond 0V zit, de spanning van aarde. HOOG betekent dat hij rond de voedingsspanning zit, 3.3V op de meeste boards en 5V op oudere.

## Het probleem van een zwevende pin

De simpelste bedrading is een pin, een knop en aarde: GPIO → knop → GND. Druk je, dan hangt de pin aan aarde en leest de MCU laag.

Het probleem begint als je loslaat. De pin hangt dan aan niets, dus niets houdt zijn spanning vast. We zeggen dat de pin zweeft, en hij beweegt mee met de elektrische ruis in de buurt. Je firmware ziet daardoor indrukkingen die nooit hebben plaatsgevonden. De pin heeft dus iets nodig dat hem op een bekend niveau houdt zolang de knop open staat, en dat iets is een weerstand.

## Een beginnersfout

Het is verleidelijk de pin direct aan de voeding te hangen: `5V → GPIO → knop → GND`. Zolang je niet indrukt leest de pin hoog, en dat ziet er goed uit.

Maar zodra je indrukt, heb je 5V met aarde verbonden via niets anders dan een draad en een schakelaar. In dat pad zit bijna geen weerstand meer, dus alleen de voeding begrenst de stroom. Ergens wordt het te heet en gaat het stuk.

Er is nog een tweede probleem, en dat is er al voor je indrukt. 5V op een pin die op 3.3V hoort te werken is meer dan die pin aankan. Elke pin heeft binnenin een kleine beveiligingsdiode die gaat geleiden zodra de spanning te hoog wordt, en die duwt stroom de 3.3V-rail in.

Doe dit nooit.

## De juiste manier

```
5V → 10kΩ weerstand → GPIO + knop → GND
```

Zet in plaats daarvan een weerstand tussen de voeding en de pin. Een weerstand begrenst hoeveel stroom er kan lopen, en 10kΩ betekent 10.000 ohm.

- **Niet ingedrukt**: de weerstand verbindt de pin met 5V, dus de pin leest hoog. De pin zelf trekt bijna geen stroom, dus over de weerstand valt bijna geen spanning.
- **Ingedrukt**: de knop verbindt de pin met aarde, dus de pin leest laag. De weerstand bepaalt nu de stroom: 5V / 10kΩ = 0.5mA, een fractie van wat een indicator-LED gebruikt. Op een 3.3V-board geeft dezelfde schakeling 0.33mA, en dat is wat de rest van dit stuk gebruikt.

De weerstand trekt zwak, de knop trekt hard. Staat de knop open, dan wint de weerstand en blijft de pin hoog; druk je hem in, dan wint de directe verbinding met aarde ruim.

## Pull-up versus pull-down

```
3.3V
│
10kΩ
│
●──── GPIO
│
│
Knop gesloten
│
GND
```

De weerstand kan aan beide kanten van de pin zitten, en daar komen de twee namen vandaan:

- Pull-up: weerstand van de voeding naar de pin. Standaard hoog, ingedrukt laag, en dat heet actief-laag.
- Pull-down: weerstand van de pin naar aarde. Standaard laag, ingedrukt hoog, en dat heet actief-hoog.

Beide houden een standaardniveau vast en begrenzen de stroom, en daarom krijg je nooit de kortsluiting van de vorige paragraaf.

![Vergelijking pull-up en pull-down](./02-pullup-pulldown-comparison.png)

Wat de keuze bepaalt is het niveau dat je firmware verwacht. Een pin die bij het opstarten niet actief mag zijn krijgt een pull-up als hij actief-laag is, een pull-down als hij actief-hoog is.

Er is nog een geval dat je wilt kennen. Sommige chips kunnen een lijn alleen laag trekken, nooit hoog, omdat de uitgangstransistor maar één kant op werkt. Op zulke lijnen is de pull-up het enige dat het hoge niveau kan maken.

## Waarom de GPIO niet direct op 3.3V aansluiten?

Dezelfde fout als de beginnersfout hierboven, alleen op 3.3V: je drukt de knop in en verbindt de voeding direct met aarde. De weerstand is wat die stroom begrenst.

## Waarom 10kΩ?

Een lagere weerstand houdt de pin steviger vast en is beter bestand tegen ruis, maar verbruikt meer stroom. Een hogere verbruikt minder, maar ruis krijgt hem makkelijker om. 10kΩ is de gebruikelijke middenweg.

Op 3.3V loopt er 3.3V / 10kΩ = 0.33mA, klein genoeg om te vergeten. Lees die som zo: bij een vaste spanning betekent een grotere weerstand minder stroom.

Naar welke kant je trekt hangt af van wat de pin doet. Een enable-pin die bij het opstarten uit moet blijven krijgt een pull-down als hij actief-hoog is, en een pull-up als hij actief-laag is: een motordriver mag bijvoorbeeld niet door ruis worden aangezet als zijn pin zweeft.

De meeste MCU's hebben ook een pull-up ingebouwd, die je in software aanzet. Hij is zwak, meestal tientallen kΩ: op een kort draadje prima, op een lang draadje minder betrouwbaar.

## Waarom knoppen stuiteren

Echte knoppen zijn geen schone schakelaars. De contacten zijn stukjes metaal die tegen elkaar slaan, dus ze raken elkaar, stuiteren terug, raken opnieuw en komen dan tot rust, allemaal binnen een paar milliseconden. Je firmware draait in die milliseconden misschien wel duizenden keren, en elke stuiter lijkt een aparte indrukking. Zo wordt één keer drukken geteld als vijf.

## Debounce: waarom één keer drukken als vijf telt

Debouncen betekent de rommel negeren, en dat kan op twee manieren.

**Software-debounce**: ziet de firmware de pin veranderen, dan wacht hij ongeveer 20ms en leest de pin opnieuw. Staat de pin nog in de nieuwe toestand, dan was de indrukking echt. Kost geen hardware en is voor de meeste knoppen genoeg.

**Hardware-debounce**: een weerstand en een condensator naast de pin strijken de snelle sprongen glad, zodat de firmware maar één schone verandering ziet. Een condensator bewaart een beetje lading, waardoor de spanning niet in één keer kan verspringen. Sommige chips hebben ook een Schmitt-trigger-ingang: een schakeling die een halfhoge spanning beslist naar één kant duwt in plaats van te twijfelen.

De meeste producten doen beide: de condensator haalt de rommel weg, de firmware bevestigt.

## Het volledige circuit, onderdeel voor onderdeel

```
3.3V
│
10kΩ
│
GPIO────┼────100nF────GND
│
Knop
│
GND
```

- Knop: gebruikersinvoer
- 10kΩ: pull-up, anti-zweven, stroombegrenzing
- 100nF condensator: hardware-debounce, ruisfiltering
- GPIO: toestandsdetectie

## Wat industriële ontwerpers moeten weten

- Mechanisch ontwerp: knopgrootte, slag, bedieningskracht, terugveersnelheid, toleranties, slijtage.
- Omgevingsbetrouwbaarheid: water en stof (IP-classificatie), ESD, EMC.
- Gebruikerservaring: enkele klik, dubbele klik, lang indrukken, herhaling, feedback (haptisch, visueel, audio).
- Productlevensduur: aantal schakelcycli, mechanische vermoeiing, invloed van temperatuur.

Een tv-afstandsbediening en een rijstkoker gebruiken dezelfde knoplogica: gebruikersinvoer → knop → GPIO → MCU → functie uitvoeren.

## Kernsamenvatting

- Kerncircuit: 3.3V → pull-up-weerstand → GPIO-knooppunt → knop → GND.
- Kernidee: de weerstand zorgt voor de standaardtoestand en begrenst de stroom, de knop verandert het circuit, de GPIO leest het resultaat.

## FAQ

### Waarom pull-up domineert in industrieel ontwerp

#### Ingebouwde MCU-pull-ups zijn gratis

De meeste MCU's hebben een pull-up in de pin zelf, aan te zetten met één regel code, wat een onderdeel en wat boardruimte scheelt. Pull-downs zijn minder gebruikelijk: veel klassieke 8-bits chips, AVR en 8051 bijvoorbeeld, hebben ze helemaal niet.

#### Fail-safe: wat een open circuit echt doet

Breekt de draad naar de knop, dan trekt de pull-up de pin terug naar hoog, en dat betekent niet ingedrukt: een gebroken draad lijkt niet op een indrukking.

Draai het circuit om. Een pull-down houdt de pin laag, en daarin betekent laag ook niet ingedrukt, dus een gebroken draad valt in beide gevallen naar de ruststand.

Het verschil zit in een kortsluiting. Met een pull-up leest een kortsluiting naar aarde als een permanente indrukking; met een pull-down doet een kortsluiting naar de voeding dat. In een auto raakt een draad veel sneller het chassis dan de voeding.

#### Aarde als referentie is betrouwbaarder

Aarde is de 0V-referentie voor het hele board, en de impedantie is zeer laag, wat het stijver maakt dan de voedingsrail.

#### Vermogen en logica sluiten van nature op elkaar aan

Staat de knop open, dan loopt er geen stroom, en tijdens het indrukken is die miniem. Een pull-down trekt bij indrukken dezelfde stroom, dus geen van beide spaart vermogen. Veel chips zien een laag niveau ook als het actieve niveau, resetpinnen bijvoorbeeld.

#### Open-drain en buscompatibiliteit

Sommige draden worden door meerdere chips gedeeld, I²C bijvoorbeeld: geen enkele chip trekt ze hoog, alleen laag, en één weerstand trekt ze voor iedereen hoog.

### Wanneer zou je dan wél voor pull-down kiezen?

- **De pin is actief-hoog**: sommige reset- en enable-pinnen verwachten een hoog niveau. Sluit de knop dan zo aan dat hij hoog geeft bij indrukken, dus met een pull-down.
- **De chip wekt alleen op een stijgende flank**: sommige zeer zuinige MCU's wekken alleen als de pin van laag naar hoog gaat, wat een pull-down met de knop aan de voeding dwingt.

## Verder lezen

### Interne versus externe pull-up

Gebruik de ingebouwde zolang de draad kort en het board rustig is, en een externe 10kΩ als de draad lang of rumoerig is.

### Debounce-state-machine

20ms wachten dekt één klik. Wil je dubbelklikken en lang indrukken, dan moet je bijhouden waar je bent:

IDLE → indrukking gedetecteerd → DEBOUNCE_PRESS (20ms wachten) → PRESSED (uitvoeren, daarna op loslaten letten) → loslaten gedetecteerd → DEBOUNCE_RELEASE (20ms wachten) → terug naar IDLE.

Die structuur voorkomt dat een lange indrukking steeds opnieuw afgaat.

### Polling versus interrupt

Polling betekent dat de hoofdlus de pin leest bij elke ronde: simpel, maar de CPU is er constant mee bezig.

Een interrupt doet het omgekeerde. De pinverandering roept zelf een stukje code aan, een interrupt-handler, en de CPU kan tot dan slapen, daarom gebruiken apparaten op batterijen het. Veel ontwerpen doen beide: de interrupt wekt het systeem, polling doet de debounce.

### Kwantitatief ontwerp van hardware-debounce

10kΩ en 100nF zijn het gebruikelijke startpunt, en samen geven ze een tijdconstante van 1ms, langer dan één stuiter. Als filter ligt de kantelfrequentie op 1/(2πRC) ≈ 159Hz: lees dat als veranderingen langzamer dan ongeveer 160 keer per seconde komen door, snellere worden vlakgestreken.

### Ontwerp voor veiligheid en betrouwbaarheid

Zet de firmware de pin per ongeluk als uitgang, dan kortsluit je die uitgang naar aarde als je de knop indrukt. Een weerstand van 100Ω tot 1kΩ in serie met de knop begrenst de foutstroom (3.3V / 100Ω = 33mA). Controleer de per-pin limiet van je chip voor je de lage kant gebruikt, want sommige chips staan minder toe.

Een extern bereikbare knop is ook een pad voor statische elektriciteit van je vinger; een beveiligingsdiode naar aarde geeft die lading een uitweg voor ze de chip bereikt.

### Meerdere knoppen en GPIO-optimalisatie

Eén pin per knop raakt snel op. De gebruikelijke oplossingen zijn een matrix, waarbij knoppen rijen en kolommen delen, of een weerstandsladder, waarbij één pin per knop een andere spanning leest.
