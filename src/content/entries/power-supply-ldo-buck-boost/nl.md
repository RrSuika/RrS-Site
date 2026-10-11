---
title: "Voeding: LDO-, buck- en boost-omzetters"
date: 2026-08-10
description: "Waar begin je als een project voeding nodig heeft: de drie vragen om eerst te stellen, waarom de ene regelaar heet wordt en de andere ruis geeft, en waarom een accu zowel een lader als een beveiliging nodig heeft."

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

Een schakeling werkt bijna nooit op de spanning die je toevallig hebt. Je moet de spanningen zelf maken, en dat doen maar twee families onderdelen: de lineaire en de schakelende. Na dit stuk weet je welke je moet kiezen, hoeveel warmte elk ervan maakt, en hoe je een lithiumcel veilig oplaadt.

1. Hoe groot is het verschil tussen de spanning die erin gaat en de spanning die ik nodig heb? Meer dan ongeveer 3V en 0,3A, en de lineaire soort valt af.
2. Kan dit deel van de schakeling slecht tegen elektrische ruis? Draadloze modules en precisie-analoog wel.
3. Hoeveel ruimte is er, en hoe warm mag het worden? In een klein gesloten kastje kan de warmte nergens heen.

Deze drie vragen hebben me veel herwerk bespaard.

## Vermogensarchitectuur: het is een energiedistributiesysteem

Een voeding is een bezorgsysteem: elk onderdeel heeft een bepaalde spanning, een bepaalde stroom en een bepaalde rust nodig, en wel op zijn eigen pinnen.

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

Zo heeft één product vaak meerdere rails naast elkaar: 5V, 3.3V, 1.8V. Een rail is gewoon één van die voedingsspanningen.

Elke trap in die keten verliest een deel van het vermogen dat erdoorheen gaat, en een gevoelig onderdeel heeft misschien extra filtering op zijn eigen voeding nodig.

Zekeringselectie kent vier checks in de bedradingsgids: stroomwaarde, spanningswaarde, onderbrekingsvermogen en snelheid (FF/F/M/T/TT). Het onderbrekingsvermogen wordt op batterijschaal veiligheidskritisch: LiFePO4 levert veel hogere kortsluitstromen dan loodzuur, en de zekering moet die foutstroom kunnen onderbreken zonder zelf te barsten. Typische waarden: MEGA-zekeringen 2,5kA bij 70V DC, NH-meszekeringen 25kA, Class T 20kA bij 125V DC. De gewoonte op printniveau om beveiliging te kiezen op basis van wat die moet doorstaan, gaat één-op-één over naar batterijsystemen.

## LDO-lineaire regelaars: schoon en simpel, maar ze worden heet

Een zekering heeft vier cijfers die tellen: de stroom, de spanning, de foutstroom die hij kan onderbreken, en hoe snel hij doorslaat. Op een batterij is de derde het belangrijkst: een lithiumbatterij duwt een enorme stroom in een kortsluiting, en de zekering moet dat kunnen afsnijden zonder zelf te barsten. Eén voorbeeld: een Class T-zekering onderbreekt 20kA bij 125V DC.

```
P_loss = (Vin - Vout) × I
```

Een LDO (low drop-out) is een lineaire regelaar die nog werkt als de ingang maar weinig boven de uitgang zit. Hij gedraagt zich als een automatische weerstand: hij laat de overtollige spanning vallen zodat de uitgang stabiel blijft, en die spanning wordt warmte. Het verlies is makkelijk uit te rekenen:

In woorden: het verlies is de spanning over het onderdeel maal de stroom erdoorheen. Van 5.5V naar 5V bij 1A gaat 0,5W verloren, ongeveer 91% efficiënt. Van 12V naar 5V bij 1A gaat 7W verloren, maar 42% efficiënt.

Ik grijp naar een LDO wanneer:
- Een lithiumcel staat op 3.6V en de microcontroller heeft 3.3V nodig, dus er blijft maar 0,3V over.
- Het onderdeel dat gevoed wordt, is gevoelig voor ruis, zoals een audioversterker of een analoog-digitaal-omzetter.

Voor 12V naar 5V bij hoge stroom zou ik er geen gebruiken; dan wordt het koellichaam belachelijk.

Praktijklessen:
- De temperatuur in de chip is de omgevingstemperatuur plus het verlies maal de thermische weerstand van de behuizing. Houd die onder de grens in de datasheet.

## Buck-schakelomzetters: efficiënt, maar met rimpel

Een Buck doet het omgekeerde: hij verbrandt de extra spanning niet. Hij hakt de ingang duizenden keren per seconde aan en uit en strijkt het resultaat daarna glad tot een stabiele uitgang. Een MOSFET, een schakelaar die door spanning wordt gestuurd in plaats van door stroom, doet het hakken; een spoel en een condensator strijken het glad. De efficiëntie ligt meestal tussen 85% en 97%.

De prijs is een kleine wiebel op de uitgang op de schakelfrequentie, en die wiebel heet rimpel. Je hebt ook meer onderdelen nodig: een spoel, een diode die de stroom van de spoel ergens heen laat als de schakelaar opent, en condensatoren aan de in- en uitgang.

Rimpel bestaat ook op batterijschaal, om een andere reden. Een omvormer trekt zijn stroom in pulsen op tweemaal de netfrequentie (100Hz), en de weerstand van de accukabel maakt daar een spanningswiebel op de hele DC-bus van. De gids van Victron zet het alarmniveau op 2,25V RMS bij een 24V-systeem.

Mijn standaard is dus een Buck zodra het verschil groter is dan ongeveer 3V en de stroom boven ongeveer 0,3A komt: 12V naar 5V, of een batterij naar iets wat veel trekt. De LM2596-module is degene die ik op de bank heb liggen: goedkoop, en je zet de uitgang met een klein schroefje.

Lessen die ik op de harde manier heb geleerd:
- Kies de spoel op de stroom die erdoorheen gaat. Voorbij zijn grens, verzadiging, gedraagt hij zich niet meer als spoel maar als een stuk draad, dus hij begrenst de stroom niet meer en de MOSFET kan sneuvelen.
- Houd het koperspoor waar de MOSFET en de spoel samenkomen kort en breed; dat punt schakelt snel en strooit storing rond.

## Boost en Buck-Boost

Een Boost gaat de andere kant op: hij maakt van een lage spanning een hoge, dus één lithiumcel van 3.7V kan een 5V- of 12V-belasting voeden. Hij slaat energie op in de spoel terwijl de schakelaar aan staat, en laat die energie in serie met de ingang weer los als de schakelaar opent, waardoor de twee spanningen optellen. Een Buck-Boost vangt het geval op waarin de ingang boven de uitgang begint en eronder eindigt: een lithiumcel is 4.2V vol en 2.7V bijna leeg, dus hij schakelt zelf tussen de modi om 3.3V vast te houden.

Praktische aantekeningen:
- Een Boost kan bij het starten een grote stroomstoot trekken, dus de meeste komen rustig op gang. Dat heet soft-start.
- Sluit de uitgang van een Boost niet kort; bedenk vooraf hoe je hem beveiligt.

## Batterijladen en beveiliging: beide zijn verplicht

Je kunt een lithiumcel niet opladen door er 5V direct op te zetten. De stroom moet begrensd worden en de spanning moet bewaakt worden, en dat doet een aparte chip.

- **TP4056**: een kleine laadchip. Hij laadt met een constante stroom tot de cel 4.2V bereikt, houdt daarna die spanning vast, en maakt van de overtollige spanning warmte. Het grote pad aan de onderkant brengt die warmte in de print, dus stort er koper onder en verbind het met via's.
- **Beveiligingsprint** (een DW01-chip en een 8205A-paar schakelaars): hij bewaakt de hele tijd de spanning en de stroom van de cel, en knipt de verbinding af als de spanning naar ongeveer 4.30V klimt, naar ongeveer 2.40V zakt, de stroom te hoog wordt, of de uitgang kortgesloten raakt.

De complete keten voor één lithiumcel:

![Vermogensketen](./01-power-chain.png)

De meeste cellen komen al met de beveiligingsprint erin, als één geheel.

```
Ingang 5V → TP4056 → [Li-ion-cel + beveiligingsprint (geïntegreerd)] → Buck/Boost → Diverse belastingen
                    ↑____Laden____↑   ↑____Ontladen____↑
```

- Tijdens het laden regelt de TP4056 de stroom die erin gaat en bewaakt de beveiligingsprint de spanning.
- Tijdens het ontladen verlaat de stroom de cel via de beveiligingsprint, die blijft letten op een te lage spanning of een kortsluiting.

Bedenk bij het instellen van de laadstroom waar die stroom vandaan komt: je USB-poort. De gebruikelijke 1A is te veel voor een kleine cel. De beveiligingsprint moet op de cel zitten, niet op de hoofdprint aan het eind van twee draden. De meeste TP4056-modules bevatten de DW01 en de 8205A al, dus laden en beveiligen zitten op één printje.

## Efficiëntie en thermisch ontwerp: hoge efficiëntie ≠ geen warmte

Een Buck die 95% efficiënt is en 50W levert, maakt nog steeds ongeveer 2.6W warmte, genoeg om de MOSFET merkbaar warm te maken.

Die warmte gaat via het pad onder de MOSFET naar de behuizing en de lucht in; telefoonladers en laptopadapters gebruiken de behuizing zelf als koellichaam.

Wat ik controleer:
- De temperatuur, via een test of een simulatie, en zorg dat niets boven zijn grens komt in de slechtste omstandigheden die het ooit zal meemaken.

## De drie vragen opnieuw bekeken, met een casestudy

### Wat gebeurt er bij dezelfde belasting?

- **LM7805**, een lineaire regelaar: 9V in, 5V uit naar een Arduino. Na vijf minuten is de chip merkbaar heet, bij ongeveer 55.6% efficiëntie.
- **LM2596**, een Buck-module op 5V met dezelfde belasting: nauwelijks warm, ongeveer 92.6% efficiënt.

Voor alles wat op een batterij werkt, zou ik met een schakelende voeding beginnen.

### Een oude telefoonlader openmaken

Ik heb een oude telefoonlader uit elkaar gehaald en de stroom gevolgd van de stekker tot de USB-uitgang.

```
AC 220V → smeltweerstand → common-mode smoorspoel → gelijkrichtbrug → 400V elco (bulk) → primaire zijde transformator → schakel-IC → secundaire zijde transformator → Schottky-gelijkrichter → elektrolytisch filter → 5V USB-uitgang
```

Het interessantste onderdeel vind ik de optocoupler, die over de barrière tussen de gevaarlijke netzijde en de veilige 5V-zijde zit.

## Kerninzichten

De ontwerpketen loopt van energiestroom → spanningsomzetting → thermisch pad → mechanische integratie. Hier komen EE en industrieel ontwerp samen.

## FAQ

### Waarom moet de beveiligingsprint in de batterij zitten?
Omdat hij zo dicht mogelijk bij de cel moet zitten, meestal met nikkelstrips direct op de celpolen gelast. Zet je hem op de hoofdprint, dan loopt de stroom onderweg naar en van de cel door extra draden en connectoren.

### Kan ik een beveiligde batterij rechtstreeks met een TP4056 opladen?
Ja, dat is de normale manier. De TP4056 doet het laden en de beveiligingsprint is de laatste verdedigingslinie.

### Waarom wordt mijn Buck-circuit nog steeds heet?
Zelfs één of twee watt duwt de temperatuur in de chip omhoog als niets de warmte afvoert. Controleer de stroomcapaciteit van de spoel, het koperoppervlak op de print en waar de warmte heen gaat.

## Kennisbank: referentiekaarten voor modules

### Regelaarmodules die ik op de bank heb liggen

| Module    | Type   | Vin       | Vout            | I_max        | Efficiëntie | Warmte   | Toepassing                 |
| --------- | ------ | --------- | --------------- | ------------ | ---------- | ------ | ------------------------ |
| LM7805    | Lineair | 7-25V     | 5V              | 1.5A (met koellichaam)| ≈Vo/Vin  | Hoog   | Lage stroom, ruisgevoelig |
| LM2596    | Buck   | 4.5-40V   | Instelbaar 1.25-37V    | 2-3A         | 85-93%     | Laag    | Groot spanningsverschil, efficiëntie eerst |

### Laden en beveiligen op één printje

| Module           | Functie              | Laadmethode    | Beveiliging                    | Opmerkingen                        |
| ---------------- | --------------------- | ---------------- | ----------------------------- | ---------------------------- |
| TP4056+beveiliging| 1S Li-ion laden    | Lineair, 1A instelbaar   | OV, UV, OC, SC                | Moet met een beveiligingsprint worden gecombineerd |

## Verder lezen

### Hoe netadapters zijn opgebouwd, per vermogen

Netadapters komen in families per vermogen: de flyback tot ongeveer 100W, daarboven de forward-, push-pull- en brugschakelingen, en de resonante LLC in moderne pc-voedingen, die 90% tot 96% haalt.

### Rimpel wegwerken

Wil je efficiëntie én een stille uitgang, zet dan een LDO achter de Buck.

**DC-ingang → Buck → LDO → Belasting**

De Buck neemt het grote verschil voor zijn rekening, bijvoorbeeld 12V naar 5.5V, met meer dan 90% efficiëntie. De LDO heeft dan nog maar 0,3–0.5V te verwerken, dus hij wordt nauwelijks warm en strijkt de wiebel glad.

### Kies eerst de batterij

Reken eerst uit welke spanningen het systeem nodig heeft en kies dan de batterij: een lithiumcel is 3.7V, een NiMH-cel 1.2V, en dat bepaalt of je een Boost of een Buck-Boost nodig hebt.

### Als het een accubank wordt

Als dit uitgroeit tot een accubank komen dezelfde vragen groter terug. [Victron Wiring Unlimited](https://www.victronenergy.com/upload/documents/The_Wiring_Unlimited_book/43562-Wiring_Unlimited-pdf-en.pdf) behandelt ze in detail, en mijn off-grid zonneproject leunt er zwaar op: [Circuitontwerp: zonnepaneelsysteem voor thuis](/nl/projects/home-solar-storage-design/)
