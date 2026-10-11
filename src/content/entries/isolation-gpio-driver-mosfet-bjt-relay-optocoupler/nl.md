---
title: "Isolatie en GPIO-driver: MOSFET, BJT, relais, optocoupler"
date: 2026-08-10
description: "Een chippin levert een paar milliampère; een ledstrip of motor wil ampères. Dit is hoe een transistor, een relais of een optocoupler een klein signaal iets groots laat schakelen."

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

Na dit stuk weet je waarom een chippin geen lamp kan schakelen, en hoe een klein extra circuitje een piepklein signaal iets groots laat besturen.

Een microcontroller (het kleine computertje dat je project bestuurt) kan op een pin alleen "hoog" of "laag" zeggen. Een LED-paneel, een motor of een solenoïde wil veel meer stroom, bij een andere spanning. Het circuit dat daartussen vertaalt, heet een driver.

# Wat een GPIO eigenlijk is

GPIO staat voor general-purpose input/output. Het is een pin die je als ingang kunt gebruiken, om een spanning te lezen, of als uitgang, om een hoog of laag niveau te sturen. Hoog is ongeveer 3,3V, laag ongeveer 0V.

Een GPIO vervoert een signaal, geen vermogen. Hij kan ongeveer 20mA leveren.

## MOSFET-basis: spanningsgestuurde elektronische schakelaar

Een MOSFET is een schakelaar met drie pinnen en geen bewegende delen. Je voert er geen stroom naartoe: je zet een spanning op één pin, de Gate, en de schakelaar sluit.

Daarom kan een microcontroller hem rechtstreeks aansturen. De MCU levert een spanning, een aparte voeding levert de stroom. Die stroom komt binnen bij de Drain, gaat door de belasting en verlaat het geheel bij de Source.

Het stuursignaal en de belastingsstroom lopen dus verschillende paden en komen samen bij de Source, die dezelfde aarde deelt als de MCU. Dat is geen isolatie: juist door die gedeelde aarde kan een signaal van 3,3V de schakelaar bedienen. Echte isolatie vraagt een optocoupler of een relais, verderop in dit stuk.

### Wat de drie pinnen doen

| Pin | Naam   | Rol                                    |
| --- | ------ | --------------------------------------- |
| G   | Gate   | Stuuringang, vrijwel geen stationaire stroom |
| D   | Drain  | Verbonden met de belasting, draagt de werkstroom |
| S   | Source | Stroomretour (bij NMOS meestal naar GND)       |

Die drie namen zijn de hele woordenschat: jij bestuurt de Gate, en het pad van Drain naar Source doet het werk.

## Waarom MCU's belastingen niet direct kunnen aansturen

Je paneel van 12V neemt 24W op, dus 2A. Een GPIO biedt ongeveer 20mA bij 3,3V: honderd keer te weinig, en de verkeerde spanning.

Sluit het paneel direct op de pin aan en de pin houdt zijn niveau niet vast: de spanning zakt in, de chip wordt warm. Dus wordt het werk opgesplitst. De MCU bepaalt wanneer er geschakeld wordt, een aparte voeding levert de stroom, en de MOSFET verbindt de twee.

## NMOS versus PMOS

MOSFETs bestaan in twee polariteiten, en de twee namen zeggen alleen waar de schakelaar in de kring zit.

### NMOS: de schakelaar aan de massazijde

```
12V
 │
LED
 │
NMOS
 │
GND
```

NMOS zit tussen de belasting en de massa. Zijn Gate wordt gemeten ten opzichte van diezelfde massa, dus een pin van 3,3V zet hem direct open.

### PMOS: de schakelaar aan de voedingszijde

```
12V
 │
PMOS
 │
LED
 │
GND
```

PMOS zit tussen de voeding en de belasting. Om hem open te zetten moet de Gate onder de voeding worden getrokken, dus hij moet richting 12V, en daar komt een pin van 3,3V niet. Daarom raad ik hem niet aan om mee te beginnen.

## PWM-dimmen

PWM staat voor pulse-width modulation. Het verlaagt de spanning niet: het schakelt de belasting heel snel volledig aan en uit, en varieert hoe lang elke "aan"-stoot duurt. Het gemiddelde vermogen volgt die verhouding, dus de lamp lijkt dimmer of feller.

Het schakelen moet sneller gaan dan je oog kan volgen. Boven ongeveer 200 keer per seconde ziet een LED er stabiel uit. De Arduino-standaard van ongeveer 490 keer per seconde zit daar ruim boven.

Te langzaam en je ziet flikkeren of hoort een motor piepen; heel snel en de MOSFET staat een deel van elke cyclus half open, en dat wordt warmte.

## Waarom je een vrijloopdiode nodig hebt

Dit geldt voor alles wat uit een spoel bestaat: motoren, ventilatoren, solenoïdes, relaisspoelen.

Een spoel slaat energie op in een magneetveld. Zodra de MOSFET uitschakelt, stort dat veld in en duwt het een spanningspiek de andere kant op, meerdere keren de voedingsspanning, en dat kan de MOSFET slopen.

De oplossing is één diode over de spoel. Een diode is een eenrichtingsklep voor stroom: hij blokkeert de normale richting en gaat alleen open voor de piek, zodat de opgeslagen energie via een veilige lus wegloopt.

Een LED is geen spoel, dus die heeft dit niet nodig.

## MOSFET versus BJT (NPN/PNP)

| Eigenschap         | BJT (NPN/PNP)    | MOSFET         |
| ---------------- | ---------------- | -------------- |
| Stuurmethode   | Stroomgestuurd | Spanningsgestuurd |
| Ingangsimpedantie  | Laag              | Extreem hoog |
| Stationaire GPIO-stroom | Vereist       | Vrijwel geen |
| Warmte             | Hoger           | Lager          |
| Hoogfrequente PWM    | Matig          | Uitstekend      |
| Hoge stromen     | Matig          | Uitstekend      |

Een BJT is de oudere soort transistor. Hij schakelt op stroom in plaats van op spanning. Je moet stroom in één pin, de basis, blijven sturen zolang hij aan moet blijven. Die stroom gaat verloren als warmte. NPN en PNP zijn zijn twee polariteiten.

Een MOSFET schakelt op spanning: zodra zijn Gate geladen is, loopt er bijna geen stroom meer in, dus de MCU houdt hem bijna gratis aan. BJT's horen nog thuis in analoge schakelingen, waar hun stroomgedrag juist het punt is.

## Relais versus MOSFET

| MOSFET          | Relais               |
| --------------- | ------------------- |
| Geen mechanische contacten | Mechanische contacten |
| PWM mogelijk     | Geen PWM              |
| Snel            | Trager              |
| Lange levensduur       | Beperkte mechanische levensduur |
| Stil          | Hoorbare klik       |
| Alleen DC         | Zowel AC als DC          |

Een relais is een mechanische schakelaar, geen halfgeleider: een klein spoeltje trekt een metalen contact dicht. Daardoor kan hij zowel AC als DC schakelen, en in open toestand is er een echte fysieke opening, dus er lekt niets door.

Ik pak een relais voor netspanning, voor die fysieke opening, of als de twee kanten volledig gescheiden moeten blijven. Ik pak een MOSFET voor DC-belastingen zoals LED's, motoren en ventilatoren, waar ik snel en stil wil schakelen met PWM.

## Optocoupler: wanneer je echte elektrische isolatie nodig hebt

Een optocoupler geeft een signaal door als licht: binnenin kijken een klein LEDje en een lichtgevoelig onderdeel elkaar aan over een opening, dus er verbindt geen draad de twee kanten.

Dat maakt hem veilig naast netspanning: een microcontroller van 3,3V kan netapparatuur schakelen, en de netzijde heeft geen geleidend pad terug. De twee kanten delen ook geen aarde meer.

De gebruikelijke keten is: MCU-pin, een stroombegrenzende weerstand, de optocoupler, de driverstrap, en dan de belasting op het net.

## Analyse van industriële producten: mijn raamwerk

Als ik een product openmaak en het vermogensdeel wil begrijpen, kijk ik in deze volgorde.

1. Waar komt het vermogen binnen?
2. Welke onderdelen zijn de hoogvermogenbelastingen?
3. Wie stuurt ze aan (MOSFET/relais)?
4. Hoe bestuurt de MCU ze (GPIO/PWM)?
5. Welke beveiliging is er (vrijloopdiode, spanningsklem, zekering, optocoupler)?

LED-lampen, RGB-strips, ventilatoren en pompen volgen hetzelfde patroon.

## Ontwerpaantekeningen: geleerde lessen

**Kies een MOSFET die bij 3,3V volledig opengaat.** Veel exemplaren zijn gemaakt voor een stuursignaal van 10V en gaan bij 3,3V maar half open. Een halfopen schakelaar gedraagt zich als een weerstand, en een weerstand waar 2A doorheen gaat wordt warm. De types die je wilt hebben, worden als "logic-level" verkocht.

**Laat de Gate nooit zweven.** Zet een weerstand van 10kΩ van de Gate naar de massa. Anders staat de Gate op een onbepaalde spanning zodra de MCU hem niet aanstuurt, en dan kan hij de schakelaar half openzetten en voor niets vermogen verstoken.

**Zet een kleine weerstand in serie met de Gate, 10 tot 100Ω.** De Gate gedraagt zich als een kleine condensator, dus bij elke omschakeling loopt er even een stroomstoot die de weerstand van de pin weghoudt.

**Inductieve belastingen hebben een vrijloopdiode nodig.** Zie hierboven. Die is niet optioneel.

**Verbind de aardingen.** De massa van de MCU en die van de voeding moeten direct verbonden zijn. Zonder gedeelde referentie betekent de Gate-spanning niets en gaat de schakelaar nooit open. Dit is de klassieke beginnersvalkuil. Heb je de twee kanten echt gescheiden nodig, gebruik dan een optocoupler.

**Bewaar deze tot de basis vertrouwd voelt:**
- Een MOSFET kiezen komt neer op vier getallen uit de datasheet: de gate-drempelspanning, de aan-weerstand, de maximale stroom en de maximale spanning.
- Voor de vrijloopdiode voldoet een 1N4148 bij een kleine relaisspoel, en een SS14 bij grotere stromen.

![MOSFET-illustratie 1](./02-mosfet-illustration-1.png)
![MOSFET-illustratie 2](./03-mosfet-illustration-2.png)
