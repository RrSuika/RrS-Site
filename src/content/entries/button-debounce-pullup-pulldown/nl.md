---
title: "Knopinvoer: debounce en pull-up/pull-down-weerstanden"
date: 2026-08-10
description: "Waarom een knop überhaupt een pull-up of pull-down nodig heeft, wat een zwevende pin met een MCU-ingang doet, hoe je debouncet in hardware en software, en waarom industriële producten op pull-up uitkomen."

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

Een knop is een mechanische schakelaar. Alles wat hij doet is twee metalen contacten verbinden of loskoppelen, en dat laat de MCU met een elektrisch probleem achter: de pin waar hij aan hangt heeft geen bepaald niveau zolang de contacten open staan. Niet ingedrukt: `── ──`, ingedrukt: `──────`.

De MCU kan de knop niet direct waarnemen. Hij leest alleen de spanning op een GPIO-pin. De hele keten is dus: mechanische actie → verandering van de GPIO-spanning → MCU leest spanning → firmware bepaalt de toestand. De knop verandert het circuit; de MCU leest het resultaat.

## Het probleem van een zwevende pin

De simpelst mogelijke bedrading: GPIO - knop - GND. Ingedrukt = GPIO wordt naar GND getrokken = laag. Dat werkt. Maar als de knop NIET is ingedrukt? Dan is de GPIO-pin met niets verbonden. Hij zweeft. De spanning is ongedefinieerd, ergens tussen 0V en 3.3V, volledig overgeleverd aan elektrische velden en ruis in de buurt. De MCU leest willekeurige onzin.

Daarom heb je een pull-weerstand nodig: die geeft de GPIO een bekende standaardtoestand.

## Een beginnersfout

Iemand zou kunnen denken: `5V → GPIO → knop → GND`. Zolang de knop niet is ingedrukt, staat de GPIO op hoog. Lijkt prima. Maar zodra je de knop indrukt, vormen de draad en de schakelaar een directe kortsluiting van 5V naar aarde: het pad heeft bijna geen weerstand, dus alleen de voeding begrenst de stroom. En nog voor je indrukt staat er 5V op een 3.3V-pin, boven de absolute maximumwaarde (VDD + 0.3V), waardoor de clampdiode van de pin stroom in de 3.3V-rail duwt. In het beste geval brand je de IO-pin door. In het slechtste geval de hele chip.

Doe dit nooit.

## De juiste manier

```
5V → 10kΩ weerstand → GPIO + knop → GND
```

- **Niet ingedrukt**: 5V laadt de GPIO-pin op via de 10kΩ-weerstand. De ingangsimpedantie van een GPIO ligt op megaohm-niveau (bijna een isolator), dus er loopt nauwelijks stroom. Over de weerstand valt bijna geen spanning, de pin staat stevig op hoog.
- **Ingedrukt**: de GPIO wordt direct met aarde kortgesloten = laag. Stroom = 5V / 10kΩ = 0.5mA (op een 3.3V-rail geeft dezelfde schakeling 0.33mA; de rest van deze notitie gebruikt 3.3V). Dat is weinig; veilig, efficiënt, en de pin wordt betrouwbaar naar 0V getrokken.

Dit is "zwakke pull-up, sterke pull-down" in actie: de pull-up is zwak genoeg dat de directe kortsluiting van de knop naar aarde hem overwint, maar sterk genoeg om de pin hoog te houden wanneer de knop open is.

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

Pull-up: weerstand van VCC naar GPIO. Standaard = hoog, ingedrukt = laag (actief-laag).
Pull-down: weerstand van GPIO naar GND. Standaard = laag, ingedrukt = hoog (actief-hoog).

Een weerstand van de voeding naar de GPIO is een pull-up; die klemt de pin standaard op hoog. Een weerstand van de GPIO naar aarde is een pull-down; die klemt de pin op laag. Beide beperken ook de stroom: zonder de weerstand is het indrukken van de knop een directe kortsluiting.

![Vergelijking pull-up en pull-down](./02-pullup-pulldown-comparison.png)

Belangrijkste functies van pull-weerstanden:

- Ze leggen een bekende standaardtoestand vast, waardoor zweven en valse triggers worden voorkomen. Bij het opstarten is het pin-niveau onzeker; een pull-up garandeert dat de pin hoog begint en niet glitcht.
- Bij een open-drain- (of open-collector-)uitgang is de pull-up het enige dat de lijn hoog kan trekken; de transistor kan hem alleen laag trekken.

## Waarom de GPIO niet direct op 3.3V aansluiten?

Dezelfde fout als bij Een beginnersfout hierboven, alleen op 3.3V in plaats van 5V. Het onderdeel dat hier de stroom begrenst is de pull-weerstand zelf.

## Waarom 10kΩ?

Veelgebruikte pull-weerstandswaarden: 4.7kΩ, 10kΩ, 22kΩ, 47kΩ.

- Lagere weerstand → sterkere pull, betere ruisimmuniteit, maar meer verbruikt vermogen
- Hogere weerstand → minder vermogen, maar gevoeliger voor ruis
- 10kΩ is de sweet spot: 3.3V/10kΩ = 0.33mA, verwaarloosbaar vermogen, betrouwbare ruisimmuniteit.

Of je pull-up of pull-down gebruikt, hangt af van het systeem. Een actief-hoog enable-signaal (EN) dat standaard inactief moet zijn → gebruik pull-down. Een actief-laag reset-signaal (RST#) dat standaard inactief moet zijn → gebruik pull-up. Bij motoraansturing kan een zwevende pin door ruis naar hoog worden getriggerd en de motor per ongeluk laten draaien; een pull-down die het standaardniveau op laag vastzet is daar cruciaal.

Interne pull-weerstanden van een MCU zijn doorgaans zwak: hoge waarde, 20kΩ~50kΩ.

## Waarom knoppen stuiteren

Mechanische knoppen zijn geen ideale schakelaars. Als je er een indrukt, sluiten de metalen contacten niet netjes; ze botsen, stuiteren terug, botsen opnieuw, stuiteren weer terug, en produceren een reeks snelle AAN-UIT-AAN-UIT-AAN-overgangen gedurende enkele milliseconden (soms tientallen ms). Op een oscilloscoop ziet een enkele indrukking eruit als een dichte pulstrein. Een snelle MCU kan elke stuiter makkelijk als een aparte indrukking tellen.

## Debounce

**Software-debounce**: detecteer pinverandering → wacht ~20ms → lees opnieuw → bevestig dat de toestand nog steeds de nieuwe is → handel. Nul hardwarekosten, goed genoeg voor de meeste gevallen.

**Hardware-debounce**: RC-laagdoorlaatfilter (bijv. 10kΩ + 100nF). fc = 1/(2πRC) ≈ 159Hz; de RC bepaalt hoe snel het knooppunt tussen de twee niveaus kan bewegen, en een Schmitt-trigger-ingang ruimt op wat er overblijft.

Veel producten gebruiken beide: RC voor de eerste ronde, software voor de bevestiging.

## Knopcircuit op productieniveau

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

- Mechanisch ontwerp: knopgrootte, slag, bedieningskracht, terugveersnelheid, montagetoleranties, slijtage op lange termijn.
- Omgevingsbetrouwbaarheid: water-/stofbestendigheid (IP-classificatie), ESD-bescherming, EMC-immuniteit.
- Gebruikerservaring: enkele klik, dubbele klik, lang indrukken, herhaaltrigger, toestandsfeedback (haptisch/visueel/audio).
- Productlevensduur: aantal schakelcycli, mechanische vermoeiing, invloed van temperatuur op materialen.

Een tv-afstandsbediening en een rijstkoker gebruiken dezelfde knoplogica: gebruikersinvoer → knop → GPIO → MCU → functie uitvoeren.

## Kernsamenvatting

- Kerncircuit: 3.3V → pull-up-weerstand → GPIO-knooppunt → knop → GND.
- Kernidee: de weerstand zorgt voor de standaardtoestand en begrenst de stroom, de knop verandert het circuit, de GPIO leest het resultaat.

## FAQ

### Waarom pull-up domineert in industrieel ontwerp

#### Ingebouwde MCU-pull-ups zijn gratis

De meeste MCU's (STM32, ESP32, AVR) hebben programmeerbare interne pull-up-weerstanden. Interne pull-downs zijn minder vanzelfsprekend: veel klassieke 8-bits onderdelen (AVR, 8051) hebben ze helemaal niet. Schakel de interne pull-up in en je bespaart een weerstand en PCB-ruimte; nul BOM-kosten. Ingenieurs grijpen vanzelf naar de gratis optie, en na verloop van tijd is daaruit een "pull-up-first"-ontwerpcultuur ontstaan.

#### Fail-safe: wat een open circuit echt doet

- In een pull-up-circuit geldt: ingedrukt = laag.
- Als de draad tussen knop en print breekt, een connector loskomt of een soldeerverbinding scheurt, trekt de pull-up de zwevende GPIO meteen terug naar een stevige hoog, "niet ingedrukt".
- **Resultaat**: de storing veroorzaakt GEEN valse trigger. Het systeem blijft veilig.

Draai het schema om en hetzelfde open circuit gedraagt zich hetzelfde: een pull-down houdt de pin laag, en in die conventie betekent laag "niet ingedrukt". Een open circuit valt in beide schema's naar de ruststand. Wat wel verschilt is de kortsluiting: een pull-up-ingang leest een kortsluiting naar aarde als een permanente indrukking, een pull-down-ingang leest een kortsluiting naar de voeding als een permanente indrukking, en in een voertuig is contact met het chassis veel waarschijnlijker dan met de voeding.

#### Aarde als referentie is betrouwbaarder

- Het groundvlak is de 0V-referentie voor het hele systeem: het zit overal en de impedantie is zeer laag, wat het een veel stijvere referentie maakt dan de voedingsrail.
- Statische elektriciteit of ruis van een vingeraanraking wordt veilig naar aarde afgevoerd in plaats van in de gevoelige voedingsrail geïnjecteerd.

#### Vermogen en logica sluiten van nature op elkaar aan

- **Rustvermogen**: als de knop niet is ingedrukt, staan beide uiteinden van de pull-up hoog; vrijwel nul vermogen. Ingedrukt = 3.3V/10kΩ = 0.33mA, alleen verbruikt tijdens de actie. Een pull-down-schema levert dezelfde stroom op (VCC via de knop naar de pull-down), dus er is geen statisch vermogensvoordeel in welke richting dan ook.
- **Logische intuïtie**: veel sequentiële logische schakelingen (resetcircuits, enzovoort) gebruiken actief-laag signalering. Pull-up + knop-naar-aarde geeft van nature "ingedrukt = 0", wat aansluit bij interrupt-triggers en resetlogica; minder mentale overhead bij het schrijven van firmware.

#### Open-drain en buscompatibiliteit

Wanneer meerdere apparaten een signaallijn delen (I²C, 1-Wire, of een knop die een pin deelt met een statusindicator), is open-drain + pull-up de standaardtopologie. Pull-up past er naadloos in. Pull-down vereist extra niveau-omzetting of een circuitaanpassing.

---

### Wanneer zou je dan wél voor pull-down kiezen?

Sommige ontwerpen kiezen bewust voor pull-down:

- **Actief-hoog vereiste**: sommige reset- of enable-pinnen van randapparatuur zijn actief-hoog. Voor logische consistentie ontwerp je de knop zo dat hij hoog afgeeft wanneer hij wordt ingedrukt → gebruik pull-down.
- **Beperkingen van ultra-low-power wake-uppinnen**: sommige ultra-low-power MCU's ondersteunen alleen wake-up op stijgende flank of op hoog niveau. Dan moet je pull-down gebruiken met de knop aan VCC.

## Verder lezen

### Interne versus externe pull-up

Interne MCU-pull-ups (20kΩ~50kΩ) besparen componenten, maar ze hebben een hoge waarde en zijn zwak. Bij lange sporen of in rumoerige omgevingen zijn ze niet betrouwbaar genoeg. Industriële producten voegen vaak een externe 10kΩ toe, zelfs als de MCU interne pull-ups ondersteunt; lagere weerstand, sterkere ruisimmuniteit. De ontwerper kiest op basis van spoorlengte, omgevingsruis en vermogensbudget.

### Debounce-state-machine

Een simpele delay(20ms) is alleen geschikt voor eenvoudige kliks. Interactie op productieniveau vraagt om een state machine:

IDLE → indrukking gedetecteerd → DEBOUNCE_PRESS (20ms wachten en bevestigen) → PRESSED (uitvoeren, loslaat-debounce starten) → loslaten gedetecteerd → DEBOUNCE_RELEASE (20ms wachten en bevestigen) → terug naar IDLE.

Dit raamwerk voorkomt dat lang indrukken opnieuw triggert en vormt de basis voor dubbelklik, lang indrukken en andere gebaren.

### Polling versus interrupt

Polling: de hoofdlus of een timer leest de GPIO periodiek uit. Simpel, maar vreet CPU-tijd en niet geschikt voor een laag verbruik.

Interrupt: knop op een interrupt-pin, flankgetriggerde ISR, start in de ISR een timer voor de debounce. Lager verbruik, snellere respons; essentieel voor apparaten op batterijen.

Echte producten combineren vaak beide: de interrupt wekt het systeem, daarna verzorgt polling de debounce.

### Kwantitatief ontwerp van hardware-debounce

RC-filter (10kΩ + 100nF): fc = 1/(2πRC) ≈ 159Hz, ver onder de mechanische stuiterfrequentie (kHz-bereik), dus de filtering is zeer effectief. τ = RC = 1ms. Met een Schmitt-trigger wordt resterende rimpel nog verder onderdrukt. Stem de condensatorwaarde af op de werkelijke stuiterkarakteristiek; balanceer responssnelheid tegen filtering.

### Ontwerp voor veiligheid en betrouwbaarheid

Bescherming tegen verkeerde GPIO-modusconfiguratie: als de GPIO per ongeluk als push-pull-uitgang op hoog wordt ingesteld en de knop wordt ingedrukt, krijg je kortsluiting. Plaats een beschermingsweerstand van 100Ω~1kΩ tussen de GPIO en het knopknooppunt ; daarmee wordt de foutstroom 3.3V/100Ω = 33mA in plaats van een directe kortsluiting. Controleer de per-pin limiet in de datasheet, want 33mA ligt bij sommige MCU's boven het absolute maximum.

ESD-bescherming: een extern bereikbare knop is een direct menselijk aanraakpad en hoort een TVS of speciale ESD-beschermingsdiode naar aarde te hebben; die leidt de ontlading weg voordat die de MCU bereikt.

### Meerdere knoppen en GPIO-optimalisatie

Een ontwerp met één knop werkt alleen voor een paar knoppen.

Bij veel knoppen gebruikt de industrie matrixscanning (rij/kolom) of een ADC-weerstandsladder (een keten weerstanden die de spanning verdeelt; één ADC-pin leest verschillende spanningen voor verschillende knoppen) om flink op GPIO-pinnen te besparen.
