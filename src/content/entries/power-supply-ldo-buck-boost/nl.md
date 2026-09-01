---
title: "Voeding: LDO-, buck- en boost-omzetters"
date: 2026-08-10
description: "Een ontwerpersgids voor voedingstopologieën: LDO-lineaire regelaars, buck-/boost-schakelomzetters, batterijopladen, beveiligingscircuits en praktische selectiecriteria."

type: note
category: Elektronica

tags:
  - Elektronica
  - Voeding
  - LDO
  - Buck-omzetter
  - Circuitbeveiliging

tools:
  - Circuitontwerp

featured: false

lang: nl

translationKey: power-supply-ldo-buck-boost
---

# Voedingsontwerp: drie vragen die ik eerst stel

Voordat ik enig ander deel van het schema aanraak, stel ik mezelf drie vragen:

1. Wat is het spanningsverschil tussen in- en uitgang? Is dat meer dan 3V en komt de stroom boven 0.3A, dan overweeg ik niet eens een LDO; meteen naar Buck.
2. Is het systeem ruisgevoelig? Draadloze modules en analoge precisieschakelingen neigen naar LDO's, of op zijn minst extra filtering na een switcher.
3. Hoe zit het met ruimte en thermiek? Een volledig afgesloten, kleine behuizing betekent dat ik voor schakelend ga; warmte hoopt zich in een klein kastje snel op.

Deze drie vragen hebben me veel herwerk bespaard.

## Vermogensarchitectuur: het is een energiedistributiesysteem

Na een tijdje besefte ik: voedingsontwerp gaat niet over "elektriciteit opwekken". Het gaat erom de juiste spanning, de juiste stroom en het juiste ruisniveau naar elke module te brengen, precies daar waar het nodig is. Als ik nu naar een printplaat kijk, is mijn eerste reflex om de voedingsingang te vinden en het vermogenspad stroomafwaarts te volgen.

## Voedingssystemen zijn ketens van meertrapsomzetting

Een typische voedingsketen in een product ziet er zo uit:

```
Ingang (USB/batterij) → Beveiliging (zekering, omgekeerde polariteit) → Laadbeheer → Batterij → DC/DC-omzetting → Meerdere spanningsrails → MCU/sensoren/LED's/motoren
```

Verschillende blokken op dezelfde print hebben verschillende spanningen nodig:

| Module          | Typische spanning |
| --------------- | --------------- |
| MCU             | 3.3V            |
| Arduino         | 5V              |
| Sensoren         | 1.8~3.3V        |
| LED's            | 2~3V            |
| Hoogvermogenbelastingen| 12V/24V         |

Binnen één product bestaan er dus vaak 5V-, 3.3V-, 1.8V- en andere rails naast elkaar.

Wat ik heb geleerd:
- Elke trap in het vermogenspad heeft verliezen; beoordeel de efficiëntie trap voor trap.
- Plan je spanningsrails zorgvuldig. Gevoelige schakelingen hebben mogelijk extra filtering op hun voeding nodig.
- Beveiligingscomponenten (zekering, omgekeerde polariteit) zien er eenvoudig uit, maar ze leggen de ondergrens van de veiligheid van je product vast. Bespaar hier nooit op.

## LDO-lineaire regelaars: schoon en simpel, maar ze worden heet

Een LDO verbrandt overtollige spanning in feite als warmte. De rekensom is duidelijk:

```
P_loss = (Vin - Vout) × I
```

Maar LDO's zijn niet altijd inefficiënt; het hangt af van de situatie. Klein spanningsverschil: van 5.5V naar 5V bij 1A, P_loss = 0.5W, ~91% efficiënt; helemaal prima. Groot verschil: van 12V naar 5V bij 1A, P_loss = 7W, slechts 42% efficiënt; rampzalig.

Voordelen van LDO's: doodsimpel circuit (ingangscondensator + LDO + uitgangscondensator, meer niet), lage kosten, weinig ruis, stabiele uitgang.

Ik grijp naar een LDO wanneer:
- Ik van 3.6V Li-ion naar 3.3V ga voor een MCU of sensor; slechts 0.3V verschil, nauwelijks warmte.
- Ik ruisgevoelige analoge/RF-schakelingen voed (audioversterkers, ADC-referenties).
- Ik zou er GEEN gebruiken voor 12V-naar-5V bij hoog vermogen; dan heb je een enorm koellichaam nodig. Niet de moeite waard.

Praktijklessen:
- Na het berekenen van P_loss geldt: junctietemperatuur = omgevingstemperatuur + P_loss × θJA. Houd die in de veilige zone.
- Groot spanningsverschil + hoge stroom? Gebruik een switcher. Forceer geen LDO.
- PCB-koper kan dienen als koellichaam; stort koper onder de tab van de LDO en verbind het met via's. Dat verlaagt de thermische weerstand effectief.

## Buck-schakelomzetters: efficiënt, maar met rimpel

Een Buck pakt het heel anders aan: in plaats van overtollige spanning te verbranden, schakelt hij een MOSFET op hoge snelheid aan en uit en maakt hij de uitgang glad met een LC-filter. De efficiëntie ligt doorgaans tussen 85%–97%.

De keerzijde: de uitgang heeft hoogfrequente rimpel en je hebt meer externe componenten nodig; minimaal een spoel, een vrijloopdiode (of een synchrone gelijkrichter-MOSFET) en in- en uitgangscondensatoren.

Ik kies standaard voor Buck wanneer het spanningsverschil groter is dan ~3V en de stroom boven ~0.3A komt, zoals bij 12V-systemen, of bij het omlaag brengen van batterijspanning voor hoogvermogenbelastingen. De LM2596-module is mijn vaste prototyping-module; instelbare uitgang, goedkoop, betrouwbaar.

Lessen die ik op de harde manier heb geleerd:
- De keuze van de spoel is cruciaal: de verzadigingsstroom moet boven de maximale belastingsstroom liggen. Zodra een spoel verzadigt, is het in feite een draad; en je MOSFET sterft onmiddellijk.
- Houd het spoor van het schakelknooppunt kort en breed om EMI te minimaliseren.
- Voeg voor gevoelige schakelingen een LDO of een π-filter na de Buck toe om de rimpel te onderdrukken.

## Boost en Buck-Boost

- **Boost**: verhoogt de spanning. Eén Li-ion-cel van 3.7V → 5V of 12V. Principe: schakelaar AAN slaat energie op in de spoel; schakelaar UIT geeft die vrij in serie met de ingang, waardoor Vout > Vin wordt.
- **Buck-Boost**: vangt het geval op waarin Vin boven of onder Vout kan liggen. Een Li-ion-batterij loopt van 4.2V vol tot 2.7V bijna leeg, maar je hebt een stabiele 3.3V nodig; een Buck-Boost schakelt automatisch tussen de modi.

Praktische aantekeningen:
- Boost-circuits kunnen bij het opstarten inschakelstroom hebben; soft-start is eigenlijk standaard.
- De efficiëntie van Buck-Boost ligt door het extra schakelen doorgaans een paar procentpunten lager dan bij zuivere Buck of Boost.
- De Boost-uitgang kan niet direct worden kortgesloten; plan je beveiliging vooraf.

## Batterijladen en beveiliging: beide zijn verplicht

Je kunt een Li-ion-cel absoluut niet opladen door er rechtstreeks 5V op te zetten. Je hebt een laadbeheer-IC nodig.

- **TP4056**: lineair laden, eerst CC en daarna CV (4.2V), overtollige spanning wordt warmte. Dat grote vrijliggende pad aan de onderkant is voor warmteafvoer; stort koper en verbind met via's, anders raakt hij tijdens het laden oververhit.
- **Beveiligingsprint** (DW01+8205A): bewaakt overladen (>4.25V), te diep ontladen (<2.5V), overstroom en kortsluiting. Schakelt het circuit bij een fout onmiddellijk uit.

Mijn beeld: de TP4056 handhaaft de laadregels. De beveiligingsprint is het vangnet. Beide zijn niet-onderhandelbaar.

Complete keten voor één Li-ion-cel:

![Vermogensketen](./01-power-chain.png)

De beveiligingsprint is doorgaans als één geheel met de batterij geïntegreerd.

```
Ingang 5V → TP4056 → [Li-ion-cel + beveiligingsprint (geïntegreerd)] → Buck/Boost → Diverse belastingen
                    ↑____Laden____↑   ↑____Ontladen____↑
```

- Laden: de TP4056 regelt de stroom naar de batterij; de beveiligingsprint bewaakt de spanning.
- Ontladen: de stroom loopt van de batterij door de beveiligingsprint, daarna via DC/DC-omzetting naar de belastingen; de beveiligingsprint let op te diep ontladen en kortsluiting.

Houd bij het instellen van de laadstroom van de TP4056 rekening met wat je USB-bron aankan en met de thermiek; de standaard 1A kan voor kleine cellen te hoog zijn. De beveiligingsprint MOET direct op de batterij worden aangesloten, niet op afstand op de hoofdprint. Gangbare TP4056-modules op de markt hebben de DW01+8205A meestal al geïntegreerd, wat een handige alles-in-één laad- en beveiligingsoplossing vormt.

## Efficiëntie en thermisch ontwerp: hoge efficiëntie ≠ geen warmte

Een Buck met 95% efficiëntie die 50W levert, dissipeert nog steeds ~2.6W. Genoeg om een MOSFET merkbaar warm te maken.

Verliesbronnen in een MOSFET: geleidingsverlies P = I² × R_DS(on), plus schakelverlies (overlap van spanning en stroom, aanzienlijk bij hoge frequentie).

Denk het thermische pad door: MOSFET → thermisch pad → metalen frame/aluminium behuizing → lucht. Veel producten gebruiken de behuizing zelf als koellichaam; telefoonladers en laptopadapters werken allemaal zo.

Mijn ervaring:
- Word niet zelfgenoegzaam omdat het efficiëntiegetal er goed uitziet. Bereken het absolute aantal verloren watts.
- Ook de DCR van de spoel genereert warmte; controleer die tijdens de selectie.
- Thermische simulatie of een opwarmtest is niet optioneel; zorg dat componenten onder de maximale junctietemperatuur blijven bij de slechtst denkbare omgevingstemperatuur.
- Ventilatieopeningen, thermische interfacematerialen; hier overlappen mechanisch en elektrisch ontwerp elkaar.

## De drie vragen opnieuw bekeken, met een casestudy

Laat me die drie vragen herhalen; ze werken echt:

1. Spanningsverschil tussen in- en uitgang? >3V en >0.3A → sla de LDO over, gebruik Buck.
2. Is het systeem ruisgevoelig? Draadloze modules, precisie-analoog → LDO of extra filtering.
3. Ruimte en thermiek? Afgesloten, kleine behuizing → ga voor schakelend, voorkom warmteopbouw.

### Twee vergelijkingscases

- LM7805 (lineair): 9V ingang → 7805 → uitgang naar Arduino. Laat hem 5 minuten draaien en raak de chip aan; merkbaar heet. ~55.6% efficiëntie.
- LM2596-module (Buck): afgesteld op 5V uitgang, dezelfde belasting. Nauwelijks warm. ~92.6% efficiëntie.

Conclusie: draagbare producten op batterijen moeten prioriteit geven aan schakelende voedingen.

### Teardown: het vermogenspad volgen in een oude telefoonlader

Ik heb een oude lader uit elkaar gehaald en het vermogenspad op de print gevolgd; enorm bevredigend:

```
AC 220V → smeltweerstand → common-mode smoorspoel → gelijkrichtbrug → 400V elco (bulk) → primaire zijde transformator → schakel-IC → secundaire zijde transformator → Schottky-gelijkrichter → elektrolytisch filter → 5V USB-uitgang
```

Belangrijkste component: de optocoupler overbrugt de barrière tussen hoog- en laagspanning en koppelt de uitgangsspanning terug terwijl hij voor veiligheidsisolatie zorgt. Als ik nu naar een print kijk, is mijn eerste reflex om deze blokken te lokaliseren.

## Kerninzichten

- Voedingsontwerp is energiedistributie, geen "elektriciteit maken".
- LDO en Buck zijn geen concurrenten; de LDO is de ruisarme, laagvermogenoplossing, de Buck verwerkt hoog vermogen met efficiëntie.
- Schakelende voedingen zijn efficiënt, maar de absolute verliezen zijn nog steeds aanzienlijk; thermisch ontwerp is verplicht.
- Ontwerpketen: energiestroom → spanningsomzetting → thermisch pad → mechanische integratie. Hier komen EE en industrieel ontwerp samen.
- Laadbeheer (TP4056) bepaalt de laadregels, de beveiligingsprint is het vangnet, DC/DC zet de spanning om.

## FAQ

### Waarom moet de beveiligingsprint in de batterij zitten?
De beveiligingsprint moet de celspanning en -stroom direct en zonder vertraging kunnen bewaken; doorgaans wordt hij met nikkelstrips rechtstreeks op de celpolen puntgelast. Als hij met draden en connectoren ertussen op de hoofdprint zit, tasten weerstand en losse verbindingen de betrouwbaarheid van de beveiliging ernstig aan.

### Kan ik een beveiligde batterij rechtstreeks met een TP4056 opladen?
Ja, dit is de standaardaanpak. De TP4056 voert het CC/CV-laadprofiel uit; de beveiligingsprint fungeert als laatste verdedigingslinie en schakelt het circuit uit als de spanning abnormaal hoog wordt.

### Waarom wordt mijn Buck-circuit nog steeds heet?
Zelfs 1–2W werkelijk verlies laat de junctietemperatuur zonder adequate koeling pieken. Controleer de verzadigingsstroom van de spoel, de R_DS(on) van de MOSFET, het koperoppervlak op de PCB en het thermische pad.

## Kennisbank: referentiekaarten voor modules

### Spanningsregelaarmodules

| Module    | Type   | Vin       | Vout            | I_max        | Efficiëntie | Warmte   | Toepassing                 |
| --------- | ------ | --------- | --------------- | ------------ | ---------- | ------ | ------------------------ |
| LM7805    | Lineair | 7-25V     | 5V              | 1.5A (met koellichaam)| ≈Vo/Vin  | Hoog   | Lage stroom, ruisgevoelig |
| LM2596    | Buck   | 4.5-40V   | Instelbaar 1.25-37V    | 2-3A         | 85-93%     | Laag    | Groot spanningsverschil, efficiëntie eerst |

### Laad-/beveiligingsmodules

| Module           | Functie              | Laadmethode    | Beveiliging                    | Opmerkingen                        |
| ---------------- | --------------------- | ---------------- | ----------------------------- | ---------------------------- |
| TP4056+beveiliging| 1S Li-ion laden    | Lineair, 1A instelbaar   | OV, UV, OC, SC                | Moet met een beveiligingsprint worden gecombineerd |

## Verder lezen

### Vermogensniveaus van AC-DC-topologieën

**Flyback**
- Onder ~100W is dit in feite de standaard. Weinig componenten, lage kosten, geïsoleerd, meerdere uitgangen mogelijk.
- Toepassingen: telefoonladers, routervoedingen, kleine huishoudelijke apparaten, LED-drivers.

**Forward**
- De stap boven flyback, 100W+. Betere efficiëntie, maar complexer.

**Push-Pull**
- Nog hoger vermogen. Komt vaak voor in omvormers voor auto's en in hoogvermogen-DC/DC-omzetters.

**Half Bridge**
- Servervoedingen, industriële voedingen, UPS-systemen.

**Full Bridge**
- Nog hoger vermogen, veel gebruikt in het bereik 1000W–5000W.

**LLC (resonant)**
- Alle moderne pc-voedingen gebruiken dit. Typische ATX-PSU-architectuur: PFC → LLC → synchrone gelijkrichting → 12V, 90%–96% efficiëntie.

### Rimpelonderdrukking bij schakelende voedingen

Voeg voor gevoelige schakelingen een LDO of een π-filter (C-L-C) na de Buck toe. De combinatie Buck+LDO geeft je zowel efficiëntie als weinig ruis.

**DC-ingang → Buck → LDO → Belasting**

1. **De Buck verzorgt de "efficiënte, grove step-down"**
   - De Buck neemt het grote spanningsverschil (bijv. 12V→5.5V) voor zijn rekening met 90%+ efficiëntie en produceert heel weinig warmte.
   - Converteert omlaag tot net boven de uiteindelijke LDO-uitgang (doorgaans 0.3–0.5V hoofdruimte).

2. **De LDO verzorgt de "precisieregeling en opschoning"**
   - Klein spanningsverschil (0.3–0.5V), dus P_loss is verwaarloosbaar; geen warmteprobleem.
   - De hoge PSRR van de LDO verplettert elke rimpel die de Buck heeft overleefd. De uitgang is uitzonderlijk schone DC.

### Batterijselectie en planning van de vermogensboom

Bepaal eerst de spanningsvereisten van het systeem en beslis daarna op basis van de batterijkarakteristieken (Li-ion 3.7V, NiMH 1.2V) of je Boost of Buck-Boost nodig hebt. Zo voorkom je later grote aanpassingen.
