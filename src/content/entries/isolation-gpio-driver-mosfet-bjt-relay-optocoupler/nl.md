---
title: "Isolatie en GPIO-driver: MOSFET, BJT, relais, optocoupler"
date: 2026-08-10
description: "Van een 3,3V-GPIO naar een belasting van 12V/2A: wat een NMOS low-side schakelaar echt doet, wanneer een BJT, een relais of een optocoupler het betere antwoord is, en welke beveiligingsonderdelen je niet kunt weglaten."

type: note
category: Elektronica

tags:
  - Elektronica
  - MOSFET
  - Circuitbeveiliging
  - Optocoupler
  - Vermogensdriver

tools:
  - Circuitontwerp
  - Vermogenselektronica

featured: false

lang: nl

translationKey: isolation-gpio-driver-mosfet-bjt-relay-optocoupler
---

![MOSFET-schakelaar](./01-mosfet-switch.png)

Een MCU-pin is een logische uitgang. De dingen die je wilt schakelen, LED-panelen, motoren, solenoïdes, zijn geen logische belastingen: de spanning klopt niet en de stroom is ongeveer honderd keer te groot. Een drivercircuit is de vertaler ertussen, en voor DC-belastingen is dat vrijwel altijd een MOSFET.

# Wat een GPIO eigenlijk is

GPIO is de algemene input/output-interface van de MCU; instelbaar als ingang (externe niveaus meten) of uitgang (hoog/laag genereren). Maar in essentie is het een digitale besturingsinterface. Hoog ≈ 3.3V (of 5V), laag ≈ 0V, voor logische 1 en 0. De uitgangsstroom is sterk beperkt; doorgaans rond de 20mA.

Die 20mA is het getal waar alles daarna op teruggaat: een GPIO is een signaal, geen voeding.

## MOSFET-basis: spanningsgestuurde elektronische schakelaar

MOSFETs zijn hier perfect voor omdat ze spanningsgestuurd zijn: de Gate trekt vrijwel geen continue stroom; je hebt alleen genoeg spanning nodig om hem aan te zetten. De MCU levert het stuursignaal aan de Gate via GPIO/PWM, en de belastingsstroom loopt van de externe voeding door het Drain-Source-pad. Twee gescheiden paden die elkaar alleen bij de Source-pin raken.

### Drie aansluitingen

| Pin | Naam   | Rol                                    |
| --- | ------ | --------------------------------------- |
| G   | Gate   | Stuuringang, vrijwel geen stationaire stroom |
| D   | Drain  | Verbonden met de belasting, draagt de werkstroom |
| S   | Source | Stroomretour (bij NMOS meestal naar GND)       |

Belangrijk inzicht: **het stuursignaal en de belastingsstroom lopen door aparte paden**. De GPIO raakt alleen de Gate; het Drain-Source-kanaal draagt de stroom van de externe voeding. Aparte paden zijn alleen geen isolatie: de Source zit aan dezelfde knoop als de GND van de MCU, en precies daarom werkt een low-side schakelaar met een stuursignaal van 3,3V. Echte isolatie vraagt een optocoupler of een relais.

## Waarom MCU's belastingen niet direct kunnen aansturen

Een LED-paneel van 12V/24W heeft 2A nodig. Een Arduino-GPIO levert ~20mA: een kloof van 100×, en de spanning klopt ook niet. De MOSFET overbrugt beide: de MCU levert de stuurspanning, de externe 12V-voeding levert de stroom. Ieder doet zijn eigen werk, en ze komen samen bij de Source-pin, die aan de GND van de MCU hangt.

## NMOS versus PMOS

### NMOS (low-side schakelaar): aanbevolen
```
12V
 │
LED
 │
NMOS
 │
GND
```
- NMOS zit tussen belasting en GND
- De Gate is gerefereerd aan GND, dus een GPIO van 3.3V of 5V kan hem direct aansturen (uitgaande van een logic-level MOSFET)
- Simpel circuit, weinig geleidingsverlies, perfect voor PWM
- Hier ben ik begonnen, en dit gebruik ik in de meeste projecten

### PMOS (high-side schakelaar)
```
12V
 │
PMOS
 │
LED
 │
GND
```
- PMOS zit tussen voeding en belasting
- Om een PMOS aan te zetten, moet de Gate minstens V_GS(th) onder de Source worden getrokken. De Source staat op 12V, dus de Gate moet in de buurt van 12V - V_GS(th) komen; dat kan een 3.3V-GPIO niet
- Vereist extra level shifting of een gate-driver-IC; complexer
- Niet aanbevolen voor beginners

## PWM-dimmen

PWM verlaagt de spanning niet; het schakelt op hoge snelheid tussen volledig aan en volledig uit, en varieert de aan-tijdverhouding (dutycycle) om het gemiddelde vermogen te regelen. Het oog integreert die pulsen, dus zodra de schakelfrequentie boven de flikkerfusiefrequentie ligt, ervaar je de LED als continu brandend.

- LED-dimmen: >200Hz voorkomt zichtbaar flikkeren. De Arduino-standaardwaarden 490Hz/980Hz zijn prima
- Motoraansturing: doorgaans enkele kHz tot 20kHz
- Te laag → zichtbaar flikkeren of hoorbaar fluiten
- Te hoog → de schakelverliezen nemen toe (de MOS brengt meer tijd door in het overgangsgebied)

## Waarom je een vrijloopdiode nodig hebt

**Van toepassing op**: motoren, ventilatoren, solenoïdes, relaisspoelen; alles met een gewikkelde spoel.

Wanneer de MOSFET uitschakelt, stort het magnetische veld van de spoel in, wat een omgekeerde hoogspanningspiek opwekt die meerdere keren de voedingsspanning kan bedragen; genoeg om de Drain-Source-overgang van de MOSFET op te blazen. Een vrijloopdiode (1N4148 voor laag vermogen, SS14 of een vergelijkbare Schottky voor hogere stromen) antiparallel over de inductieve belasting geeft die opgeslagen energie een veilige weg om te recirculeren.

Zuiver resistieve belastingen zoals LED's hebben er meestal geen nodig, maar het kan geen kwaad om er een toe te voegen.

## MOSFET versus BJT (NPN/PNP)

| Eigenschap         | BJT (NPN/PNP)    | MOSFET         |
| ---------------- | ---------------- | -------------- |
| Stuurmethode   | Stroomgestuurd | Spanningsgestuurd |
| Ingangsimpedantie  | Laag              | Extreem hoog |
| Stationaire GPIO-stroom | Vereist       | Vrijwel geen |
| Warmte             | Hoger           | Lager          |
| Hoogfrequente PWM    | Matig          | Uitstekend      |
| Hoge stromen     | Matig          | Uitstekend      |

BJT's zijn stroomgestuurd: je moet basistroom blijven toevoeren om ze aan te houden. MOSFETs zijn spanningsgestuurd: zodra de Gate-capaciteit is opgeladen, loopt er vrijwel geen stroom meer. In moderne DC-vermogensschakelingen winnen MOSFETs op alle fronten. BJT's komen nog voor in analoge schakelingen (versterking, lineaire regeling) en in enkele hoogspanningsniches, maar voor het aansturen van belastingen vanuit een MCU? Altijd een MOSFET.

## Relais versus MOSFET

| MOSFET          | Relais               |
| --------------- | ------------------- |
| Geen mechanische contacten | Mechanische contacten |
| PWM mogelijk     | Geen PWM              |
| Snel            | Trager              |
| Lange levensduur       | Beperkte mechanische levensduur |
| Stil          | Hoorbare klik       |
| Alleen DC         | Zowel AC als DC          |

**Ik gebruik een relais wanneer**: ik 220V AC schakel, een echte fysieke scheiding nodig heb (geen lekstroom) of volledige galvanische isolatie nodig heb.
**Ik gebruik een MOSFET wanneer**: LED's, motoren, ventilatoren, producten op batterijen; DC-belastingen die snelheid, stilte en PWM-aansturing nodig hebben.

## Optocoupler: wanneer je echte elektrische isolatie nodig hebt

Een optocoupler geeft signalen door met licht: een interne LED schijnt op een lichtgevoelige ontvanger. Er is geen geleidend pad tussen in- en uitgang; alleen fotonen. Zo kan een 3.3V-MCU veilig 220V-apparatuur aansturen, terwijl aardlussen worden doorbroken en de ruisimmuniteit verbetert.

Klassieke opbouw: MCU-GPIO → stroombegrenzende weerstand → optocoupler-LED → optocoupler-transistor → drivercircuit → TRIAC of relais → netbelasting. De laagspannings- en hoogspanningszijde zijn volledig van elkaar geïsoleerd.

## Analyse van industriële producten: mijn raamwerk

Wanneer ik naar de vermogenstrap van een willekeurig product kijk, stel ik vijf vragen:

1. Waar komt het vermogen binnen?
2. Welke onderdelen zijn de hoogvermogenbelastingen?
3. Wie stuurt ze aan (MOSFET/relais)?
4. Hoe bestuurt de MCU ze (GPIO/PWM)?
5. Welke beveiliging is aanwezig (vrijloopdiode, TVS, zekering, optocoupler)?

Veelvoorkomende MOSFET-aangestuurde producten: LED-verlichting, RGB-strips, ventilatoren, motoren, waterpompen, solenoïdesloten, magneetventielen, USB-PD-voedingen, Li-ion-batterijbeheer, DC-DC-omzetters, motorcontrollers voor drones en EV's.

## Ontwerpaantekeningen: geleerde lessen

**Kies een logic-level NMOS, en let op bij welke gate-spanning hij is gespecificeerd.** Standaard-MOSFETs hebben vaak ~10V gate-aansturing nodig om volledig open te gaan en hun R_DS(on) te halen; een 3,3V-GPIO krijgt dat niet voor elkaar. Logic-level typen worden bij een lagere gate-spanning gekarakteriseerd, maar let op welke: de L in IRLZ44N is IR's markering voor een logic-level gate, en dat type geeft R_DS(on) bij V_GS = 5V, dus een 3,3V-ontwerp wil een onderdeel dat op 2,5–3,3V is gespecificeerd. Zoek de datasheetregel bij JOUW gate-spanning, niet het headline-getal bij V_GS = 10V.

**Een gate-weerstand is niet optioneel.** In serie, 10–100Ω: de Gate gedraagt zich als een condensator, elke GPIO-flank moet die laden of ontladen, en de momentane stroom kan hoog genoeg zijn om de pin te belasten. De serieweerstand begrenst die stroom en onderdrukt parasitaire oscillatie. Tussen Gate en Source, 10kΩ: bij het opstarten of wanneer de GPIO hoogimpedant is, zou de Gate anders zweven. Een zwevende Gate kan half open staan, waardoor het kanaal hoogohmig blijft en echt vermogen dissipeert. De pull-down houdt hem op 0V zolang niets hem actief aanstuurt, en in productie is er geen reden om hem weg te laten.

**Inductieve belastingen moeten een vrijloopdiode hebben.**

**Gemeenschappelijke aarde is net zo min optioneel.** De GND van de MCU en die van de voeding moeten direct verbonden zijn: zonder gedeelde referentie heeft de gate-aansturing geen retourpad en schakelt de MOSFET nooit. Dit is de grootste beginnersvalkuil. Heb je MCU en belasting echt gescheiden nodig, gebruik dan een optocoupler in plaats van de twee aardingen uit elkaar te houden.

**Checklist voor MOSFET-selectie:**
- V_GS(th): Gate-drempelspanning (waar hij *begint* te geleiden, niet volledig aan)
- **R_DS(on): aan-weerstand (lager is altijd beter; warmte = I² × R_DS(on))**
- I_D maximale stroom (houd marge)
- V_DS maximale spanning (houd ook marge)

**PWM-frequentie**: LED-dimmen >200Hz voorkomt flikkeren (Arduino 490Hz/980Hz is prima), motoraansturing enkele kHz tot 20kHz. Te laag → flikkeren/ruis, te hoog → warmte door schakelverliezen.

![MOSFET-illustratie 1](./02-mosfet-illustration-1.png)
![MOSFET-illustratie 2](./03-mosfet-illustration-2.png)
