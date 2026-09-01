---
title: "Isolatie en GPIO-driver: MOSFET, BJT, relais, optocoupler"
date: 2026-08-10
description: "Een complete gids voor het aansturen van hoogvermogenbelastingen vanuit een MCU: spanningsgestuurd schakelen met MOSFETs, BJT versus MOSFET vergeleken, relaisisolatie, veiligheidsisolatie met optocouplers en PWM-dimmen in de praktijk."

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

- MOS = de elektronische schakelaar tussen je MCU en hoogvermogenbelastingen.
- **De Gate stuurt aan, de Drain draagt de belasting, de Source gaat naar de referentie (meestal GND bij NMOS).**
- De GPIO voedt de belasting niet; die stuurt alleen de Gate aan.
- **NMOS + low-side schakelaar + PWM** is de meest voorkomende drivertopologie in slimme hardware. Beheers deze als eerste.

# Wat een GPIO eigenlijk is

GPIO is de algemene input/output-interface van de MCU; instelbaar als ingang (externe niveaus meten) of uitgang (hoog/laag genereren). Maar in essentie is het een digitale besturingsinterface, geen voeding. Hoog ≈ 3.3V (of 5V), laag ≈ 0V, voor logische 1 en 0. De uitgangsstroom is sterk beperkt; doorgaans rond de 20mA.

Dat is het kernconflict: de GPIO levert 3.3V/20mA, maar je moet een LED-paneel van 12V/2A aansturen. Twee ordes van grootte verschil. Je hebt een "vertaler" nodig; iets dat het zwakke signaal van de MCU overneemt en de hoge stroom van de externe voeding bestuurt. Dat is wat een drivercircuit doet.

## MOSFET-basis: spanningsgestuurde elektronische schakelaar

MOSFETs zijn hier perfect voor omdat ze spanningsgestuurd zijn: de Gate trekt vrijwel geen continue stroom; je hebt alleen genoeg spanning nodig om hem aan te zetten. De MCU levert het stuursignaal aan de Gate via GPIO/PWM, en de belastingsstroom loopt van de externe voeding door het Drain-Source-pad. Twee volledig gescheiden circuits.

### Drie aansluitingen

| Pin | Naam   | Rol                                    |
| --- | ------ | --------------------------------------- |
| G   | Gate   | Stuuringang, vrijwel geen stationaire stroom |
| D   | Drain  | Verbonden met de belasting, draagt de werkstroom |
| S   | Source | Stroomretour (bij NMOS meestal naar GND)       |

Belangrijk inzicht: **het stuursignaal en de belastingsstroom lopen door volledig gescheiden paden**. De GPIO raakt alleen de Gate. Het Drain-Source-kanaal draagt de hoge stroom van de externe voeding. Ze zijn elektrisch geïsoleerd.

## Waarom MCU's belastingen niet direct kunnen aansturen

Een LED-paneel van 12V/24W heeft 2A nodig. Een Arduino-GPIO levert ~20mA; een kloof van 100×. De MOSFET overbrugt die: de MCU levert de stuurspanning, de externe 12V-voeding levert de stroom. Ieder doet zijn eigen werk.

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

PWM verlaagt de spanning niet; het schakelt op hoge snelheid tussen volledig aan en volledig uit, en varieert de aan-tijdverhouding (dutycycle) om het gemiddelde vermogen te regelen. Dankzij de traagheid van het menselijk oog lijken LED's continu te branden (niet te flikkeren), zolang de frequentie hoog genoeg is.

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

- **Kies altijd een logic-level NMOS**: standaard-MOSFETs hebben vaak ~10V Gate-aansturing nodig om volledig open te gaan en hun gespecificeerde R_DS(on) te halen. Een 3.3V-GPIO kan dat simpelweg niet. **Logic-level MOSFETs** (zoals de IRLZ44N; de "L" staat voor Logic) halen een zeer lage R_DS(on) bij 3.3V of 5V. Controleer dit voor 3.3V-systemen in de datasheet; kijk naar de R_DS(on) bij JOUW werkelijke Gate-spanning, niet naar het headline-getal bij V_GS = 10V.

- **Een Gate-weerstand is niet optioneel**
  - **Gate in serie, 10-100Ω**: de Gate gedraagt zich als een condensator. Wanneer de GPIO schakelt, moet hij die capaciteit laden/ontladen, en de momentane stroom kan verrassend hoog zijn. De serieweerstand begrenst deze stroom om de GPIO-pin te beschermen en onderdrukt parasitaire oscillaties.
  - **Gate-Source pull-down 10kΩ**: bij het opstarten of wanneer de GPIO hoogimpedant is (ingangsmodus) kan de Gate zweven. Een zwevende Gate kan de MOSFET gedeeltelijk aanzetten; hoge weerstand, enorme dissipatie, het einde van het silicium. De pull-down houdt de Gate stevig op 0V wanneer die niet actief wordt aangestuurd. Sla dit in productie nooit over.

- **Inductieve belastingen MOETEN een vrijloopdiode hebben**.

- **Gemeenschappelijke aarde**: de GND van de MCU en de GND van de voeding moeten direct met elkaar verbonden zijn. Zonder een gedeelde referentie heeft het Gate-stuursignaal geen retourpad en schakelt de MOSFET niet. Dit is de grootste beginnersvalkuil. Heb je isolatie tussen MCU en belasting nodig, gebruik dan een optocoupler; probeer de aardingen niet zonder optocoupler gescheiden te houden.

- **Checklist voor MOSFET-selectie**:
  - V_GS(th): Gate-drempelspanning (let op: dit is waar hij *begint* te geleiden, niet volledig aan)
  - **R_DS(on): aan-weerstand (lager is altijd beter; warmte = I² × R_DS(on))**
  - I_D maximale stroom (houd marge)
  - V_DS maximale spanning (houd ook marge)

- **PWM-frequentie**: LED-dimmen >200Hz voorkomt flikkeren (Arduino 490Hz/980Hz is prima). Motoraansturing enkele kHz tot 20kHz. Te laag → flikkeren/ruis, te hoog → warmte door schakelverliezen.

![MOSFET-illustratie 1](./02-mosfet-illustration-1.png)
![MOSFET-illustratie 2](./03-mosfet-illustration-2.png)
