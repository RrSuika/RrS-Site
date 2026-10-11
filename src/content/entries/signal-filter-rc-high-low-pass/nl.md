---
title: "Signaalfiltering: RC-hoogdoorlaat- en laagdoorlaatfilters"
date: 2026-08-10
description: "Eén weerstand en één condensator kunnen ruis wegfilteren, een PWM-signaal afvlakken of een DC-offset blokkeren. Dit is wat dat paar echt doet, en wanneer je het inzet."

type: note
category: Elektronica

tags:
  - Elektronica
  - Signaalverwerking
  - RC-filter
  - Hoogdoorlaatfilter
  - Laagdoorlaatfilter

tools:
  - Circuitanalyse
  - Analoge elektronica

featured: false

lang: nl

translationKey: signal-filter-rc-high-low-pass
---
# Passieve RC-filters: twee componenten, overal om je heen

Na dit stuk weet je hoe één weerstand en één condensator snelle signalen van langzame scheiden. Je weet ook hoe je ze aansluit en hoe je de twee waarden kiest. Dat tweetal duikt overal op: vóór metende chips, achter rommelige voedingen, op stuiterende knoppen.

## Kernprincipe: de impedantie van een condensator varieert met de frequentie

Een weerstand houdt stroom altijd evenveel tegen, wat het signaal ook doet. Een condensator niet: hoe sneller het signaal, hoe minder hij in de weg zit. Die snelheidsafhankelijke tegenwerking heet impedantie.

Naast een weerstand verdeelt hij een snel signaal anders dan een langzaam signaal. Dat is filteren.

- **Langzaam signaal (lage frequentie)**: de condensator is als een onderbreking in de draad.
- **Snel signaal (hoge frequentie)**: hij is als een gewoon stuk draad.
- **De kantelfrequentie** is waar beide even moeilijk zijn om langs te komen. Daaronder komt het signaal door, daarboven wordt het kleiner. Hij heet fc: **fc = 1/(2πRC)**.

R is in ohm, C in farad, fc in hertz. Maak één van de twee groter en de kantelfrequentie zakt, dus uitrekenen hoeft niet.

## RC-laagdoorlaatfilter

### Hoe de schakeling eruitziet

```
Vin ── R ──┬── Vout
            │
            C
            │
           GND
```

De weerstand zit in het pad van het signaal. De condensator hangt vanaf de zijkant naar aarde, de 0V-lijn waartegen alles gemeten wordt. Langzame signalen lopen door de weerstand, snelle nemen de condensator en eindigen op aarde.

### Wat het met snelle en langzame signalen doet

- Onder de kantelfrequentie komt het signaal er ongeveer uit zoals het erin ging.
- Daarboven: tien keer de frequentie, tien keer kleiner eruit.
- Een spanning die niet verandert, gaat er ongewijzigd door.

### Waar ik het echt gebruik

- **Vóór een chip die spanning meet.** Zo'n chip, een ADC, leest vele malen per seconde; wat sneller beweegt dan dat, leest hij als onzin.
- **Achter een schakelvoeding**, die snelle troep op zijn uitgang achterlaat.
- **Op een stuiterende knop.** 10kΩ met 100nF strijkt het glad, maar alleen de flanken, dus ik bevestig de druk alsnog in software.
- **Op een pin die snel aan en uit gaat**, dat heet PWM: de laagdoorlaat geeft je het gemiddelde, een goedkope regelbare spanning.
- **In een luidsprekerfilter**, dat de lage tonen naar de grote speaker stuurt.

### Waar je op moet letten

- Wat je aan de uitgang hangt, moet moeilijker langs te komen zijn dan R, anders verschuift je kantelfrequentie.
- Eén RC-trap is vriendelijk. Wil je scherper afsnijden, zet dan twee trappen achter elkaar of stap over op een actief filter.
- Kies in een signaalpad een condensator die voor signalen bedoeld is. Sommige goedkope keramische exemplaren vervormen.

## RC-hoogdoorlaatfilter

### Hoe de schakeling eruitziet

```
Vin ── C ──┬── Vout
            │
            R
            │
           GND
```

Dezelfde twee onderdelen, omgewisseld. De condensator zit in het pad en de weerstand gaat naar aarde. Snelle signalen gaan moeiteloos door de condensator. Langzame niet, en wat er nog doorheen sijpelt, trekt de weerstand naar 0V.

### Wat het met snelle en langzame signalen doet

- Boven de kantelfrequentie komt het signaal er ongeveer uit zoals het erin ging.
- Daaronder wordt het kleiner, in hetzelfde tempo.
- De kantelfrequentie gebruikt dezelfde formule: **fc = 1/(2πRC)**.

### Waar ik het echt gebruik

- **Om het vaste deel van een sensorsignaal weg te halen.** Veel sensoren geven een vaste spanning met een klein wiebeltje erop, en dat wiebeltje is de informatie.
- **Tussen twee audiotrappen**, die op verschillende vaste spanningen staan. De condensator laat het geluid door en de vaste spanning niet.
- **In een bewegingssensor.** Iemand die voorbijloopt verandert het infrarood snel, een opwarmende kamer langzaam. De hoogdoorlaat houdt de persoon over.
- **Op hartsignalen.** De elektroden brengen zelf een grote vaste spanning mee; haal die weg en het kleine hartslagje is groot genoeg om te meten.
- **In een luidsprekerfilter**, dat de hoge tonen naar de kleine speaker stuurt.

### Waar je op moet letten

- Zet de kantelfrequentie ruim onder het langzaamste signaal dat je nodig hebt, anders raak je een deel kwijt.
- Wat het filter voedt heeft zelf ook weerstand. Die komt bij R op, dus R moet groot genoeg blijven om de baas te zijn.
- Maak de condensator niet groter dan nodig; een grote doet er langer over om stabiel te worden.

## RC-banddoorlaatfilter

Zet eerst een hoogdoorlaat en daarna een laagdoorlaat; alleen het midden overleeft. De eerste trap houdt tegen wat te langzaam is, de tweede wat te snel is.

De tweede trap trekt aan de eerste en sleept beide kantelfrequenties mee. Doen die getallen ertoe, zet er een buffer tussen: een trap die de spanning overneemt zonder stroom te trekken. De tekening laat die weg.

```
Vin ── C1 ──┬── R1 ──┬── Vout
             │        │
             R2       C2
             │        │
            GND      GND
```

Gebruik het voor één band frequenties en niets anders: een toonregeling, of één signaal uit een radio pikken.

## Vergeet het tijddomein niet: τ

Tot nu toe ging alles over frequentie. Dezelfde twee onderdelen bepalen ook hoe snel de uitgang kan veranderen, en dat telt zodra je iets inschakelt.

Laat je de condensator via de weerstand vollopen, dan kruipt de spanning omhoog, eerst snel en daarna langzamer. Die reis ligt vast met **τ = RC** (R in ohm, C in farad, τ in seconden). Na één τ ben je ongeveer twee derde onderweg; na vijf is het klaar.

Een grotere R of C betekent dus een trager circuit. Alles wat moet wachten, een inschakelvertraging of een debouncetimer, is zo gemaakt.

## Actieve filters: wat komt er hierna

Passieve filters, de soort met alleen een weerstand en een condensator, hebben drie beperkingen: zwakke uitgang, alleen maar kleiner, en een vriendelijke afsnijding.

Een versterkerchip achter het RC-netwerk lost alle drie op: een sterke uitgang, versterking, en terugkoppeling om de vorm van de afsnijding te bepalen. Dat is een actief filter. De namen die je tegenkomt zijn **Sallen-Key** (meest voorkomend), **multiple feedback** (scherper) en **switched-capacitor** (kantelfrequentie via een klok).

Maar leer eerst de passieve versie. Vaak is een simpele RC alles wat de schakeling nodig heeft.
