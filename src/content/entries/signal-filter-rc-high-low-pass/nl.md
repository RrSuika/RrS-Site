---
title: "Signaalfiltering: RC-hoogdoorlaat- en laagdoorlaatfilters"
date: 2026-08-10
description: "Eén weerstand, één condensator en één formule achter anti-aliasing, debounce, PWM-afvlakking en audiokoppeling: hoe fc = 1/(2πRC) zich gedraagt in het frequentie- en het tijddomein, en waar elke variant opduikt."

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

RC-filters waren een van de eerste dingen die ik leerde bij analoge schakelingen. Gewoon een weerstand en een condensator; het ziet er bijna te simpel uit. Maar daarna kwam ik ze in echte projecten telkens weer tegen: anti-aliasing vóór ADC's, knopdebounce, audiokoppeling tussen trappen, PWM-afvlakking... allemaal varianten van het RC-filter. Zodra je begrijpt hoe capacitieve reactantie met de frequentie verandert, zijn al deze circuits terug te voeren op dezelfde kernformule.

## Kernprincipe: de impedantie van een condensator varieert met de frequentie

Capacitieve reactantie: **Xc = 1/(2πfC)**. Hogere frequentie → lagere impedantie. Lagere frequentie → hogere impedantie. Combineer dit met een weerstandsdeler en je krijgt per frequentie een andere demping.

- **Bij lage frequenties**: de condensator gedraagt zich effectief als een open circuit (hoge impedantie). Wat dat met het signaal doet, hangt af van waar hij zit: in serie blokkeert hij, naar aarde laat hij door.
- **Bij hoge frequenties**: de condensator is effectief een kortsluiting (lage impedantie).
- **Kantelfrequentie fc**: wanneer |Xc| = R, geldt f = 1/(2πRC) en zakt het uitgangsvermogen naar de helft (-3dB).

Die ene formule is waarschijnlijk de regel die het vaakst terugkomt in mijn schrift: debouncecircuits, audiofilters, ADC-front-ends, hij duikt overal op.

## RC-laagdoorlaatfilter

### Circuit

```
Vin ── R ──┬── Vout
            │
            C
            │
           GND
```

Weerstand in serie, condensator naar aarde. Lage frequenties gaan door de weerstand naar de uitgang. Hoge frequenties worden door de condensator naar aarde geleid; de uitgangsspanning blijft laag.

### Kenmerken

- Kantelfrequentie: **fc = 1/(2πRC)**
- Boven fc loopt de demping af met -20dB/decade
- DC-versterking = 1 (0dB); DC gaat onveranderd door

### Waar ik laagdoorlaatfilters echt gebruik

- **Anti-aliasing vóór de ADC**: alles boven de Nyquistfrequentie (fs/2) moet vóór het samplen worden geëlimineerd, anders vouwt het terug als aliasing. Plaats een RC-laagdoorlaat direct op de ADC-ingangspin.
- **Onderdrukking van voedingsrimpel**: schakelruis van DC/DC; gebruik een RC- (of LC-) laagdoorlaat om die omlaag te krijgen.
- **Hardware-knopdebounce**: 10kΩ + 100nF, fc ≈ 159Hz. Een schakelaar stuitert ruwweg 0,1–10ms, en het RC-filter vlakt alleen de flanken af: één pool laat de uitgang nog steeds langzaam door de logische drempel kruipen, dus ik combineer het met een Schmitt-trigger-ingang of software-debounce.
- **PWM naar analoge spanning**: stuur een PWM-blokgolf door een laagdoorlaat met fc ver onder de PWM-frequentie en je krijgt een gladde gelijkspanning, evenredig met de dutycycle. Een simpele DAC.
- **Baspad in audio**: in crossovers en toonregelaars pikt de laagdoorlaat de lage frequenties eruit voor de bas.

### Ontwerpaantekeningen

- De ingangsimpedantie van de volgende trap moet >> R zijn, anders verschuift de delerverhouding en verloopt je kantelfrequentie. Is de volgende trap laagohmig, buffer die dan.
- Een enkele RC-trap geeft slechts -20dB/decade. Heb je een steilere afval nodig? Cascadeer trappen (met een buffer ertussen) of ga actief.
- In het signaalpad doet het condensatortype ertoe. C0G/NP0 of filmcondensatoren hebben de voorkeur. X7R-keramiek heeft piëzo-elektrische effecten en niet-lineariteit; die introduceren vervorming.

## RC-hoogdoorlaatfilter

### Circuit

```
Vin ── C ──┬── Vout
            │
            R
            │
           GND
```

Condensator in serie, weerstand naar aarde. Hoge frequenties zeilen door de condensator naar de uitgang. Lage frequenties worden geblokkeerd door de hoge impedantie van de condensator, en wat er nog resterend doorkomt, wordt door de weerstand naar aarde getrokken.

### Kenmerken

- Kantelfrequentie: **fc = 1/(2πRC)**; dezelfde formule
- Onder fc: demping van -20dB/decade
- Bij voldoende hoge frequenties nadert de versterking 1 (0dB)

### Waar ik hoogdoorlaatfilters echt gebruik

- **AC-koppeling / DC-blokkering**: strip de DC-offset van een sensorsignaal en behoud alleen de AC-variatie. Alomtegenwoordig in audio- en sensorcircuits.
- **Audiokoppeling tussen trappen**: een condensator tussen trappen isoleert hun verschillende DC-werkpunten, zodat ze elkaar niet verstoren.
- **PIR-sensoren**: beweging van een menselijk lichaam veroorzaakt AC-veranderingen in het infraroodsignaal. Een hoogdoorlaat filtert de langzame drift van de omgevingstemperatuur weg, zodat alleen het bruikbare bewegingssignaal overblijft.
- **ECG / biopotentialen**: halfcelpotentialen van elektroden veroorzaken DC-offsets van tientallen tot honderden mV. De hoogdoorlaat verwijdert die, zodat je de echte hartslag-golfvorm veilig kunt versterken.
- **Hoogpad in audio**: in crossovers stuurt de hoogdoorlaat de hoge frequenties naar de tweeters.

### Ontwerpaantekeningen

- Stel fc ruim onder je minimale signaalfrequentie in, zodat de demping binnen de band verwaarloosbaar is (fc << f_min).
- De uitgangsimpedantie van de bron en R vormen samen een deler die de doorlaatbandversterking beïnvloedt; R moet groot genoeg zijn.
- Maak koppelcondensatoren niet te groot. Een grotere C betekent een langere insteltijd bij het opstarten voordat het DC-niveau stabiliseert.

## RC-banddoorlaatfilter

Cascadeer een hoogdoorlaat gevolgd door een laagdoorlaat, met een buffer ertussen. De tekening laat die buffer weg: zonder hem belast de tweede trap de eerste en verschuiven beide kantelfrequenties.

```
Vin ── C1 ──┬── R1 ──┬── Vout
             │        │
             R2       C2
             │        │
            GND      GND
```

- Onderste kantelfrequentie f_L = 1/(2π × R2 × C1), bepaald door de hoogdoorlaattrap
- Bovenste kantelfrequentie f_H = 1/(2π × R1 × C2), bepaald door de laagdoorlaattrap
- Bandbreedte BW = f_H - f_L, middenfrequentie f_0 = √(f_L × f_H)

Toepassingen: audio-equalizers, IF-filtering in communicatieontvangers, het extraheren en detecteren van signalen op specifieke frequenties.

## Vergeet het tijddomein niet: τ

RC-circuits zijn in het tijddomein net zo belangrijk:

- **Tijdconstante τ = RC**
- Opladen: Vout(t) = V_final × (1 - e^(-t/τ))
- Ontladen: Vout(t) = V_initial × e^(-t/τ)
- Na 1τ: ~63% verandering. Na 5τ: >99%; effectief ingeregeld.

Hetzelfde RC-netwerk werkt in het frequentiedomein als filter en bepaalt in het tijddomein de stijg-/daaltijd. Timingcircuits, power-on-resetvertragingen, debounce-sequenties, pulsvorming; ze hangen allemaal af van τ.

## Actieve filters: wat komt er hierna

Passieve RC-filters hebben drie duidelijke beperkingen:
- Hoge uitgangsimpedantie, zwak vermogen om belastingen aan te sturen
- Alleen demping; geen versterking
- Een enkele trap van -20dB/decade is niet erg steil

Actieve filters plaatsen een op-amp na het RC-netwerk en lossen dit alles op: buffering voor aanstuurkracht, versterking en terugkoppeling om de respons vorm te geven:
- **Sallen-Key-topologie**: het meest voorkomende actieve filter van de tweede orde
- **Multiple Feedback (MFB)**: beter voor toepassingen met hoge Q
- **Switched-capacitorfilters**: klokafstembare kantelfrequentie, ideaal voor integratie

Maar eerlijk gezegd? Eerst stevig worden in passieve RC-filters is de juiste zet. Ze vormen de basis van al het filterontwerp, en in de helft van de gevallen is een simpel RC-filter alles wat je echt nodig hebt. Geen reden om het te overcompliceren.
