---
title: Tinkercad 3-kanaals LED-stripbesturing
date: 2026-07-25
description: Virtuele 3-kanaals LED-stripcontroller met drukknoppen en RGB-regeling via potentiometers.

type: lab
category: Embedded systemen
cover: 01-tinkercad-circuit.png

tags:
  - Arduino
  - Tinkercad
  - NeoPixel
  - Potentiometer
  - Simulatie

tools:
  - Tinkercad Circuits
  - Arduino (gesimuleerd)
  - NeoPixel-strip ×3
  - Potentiometer ×4
  - Drukknop ×3

featured: false

lang: nl

translationKey: tinkercad-3ch-led-strip
---

![Tinkercad-circuit](./01-tinkercad-circuit.png)

# Doel
Voordat ik me vastlegde op echte hardware, wilde ik eerst een meerkanaals LED-controller prototypen in een simulatie. Tinkercad Circuits is verrassend capabel voor dit soort dingen: het geeft je een virtuele Arduino, NeoPixel-strips, potentiometers, knoppen en een werkende Serial Monitor, allemaal zonder ook maar iets te solderen.

Het circuit stuurt drie onafhankelijke NeoPixel-strips aan. Met drie drukknoppen kies je welke strip "actief" is, en vier potentiometers verzorgen de kleurmenging: drie voor RGB, één voor de hoofdhelderheid. De geselecteerde strip wordt in realtime bijgewerkt, terwijl de andere twee hun laatste toestand vasthouden. Een kleine status-LED spiegelt de kleur van het actieve kanaal, zodat je in één oogopslag ziet welke strip je aan het bewerken bent.

# Bediening

- **3 drukknoppen:** Selecteren de actieve LED-strip (1, 2 of 3). Een knop indrukken maakt die strip actief en werkt de status-LED bij.
- **3 potentiometers:** R-, G- en B-waarden, omgezet van 0-1023 (analoog inlezen) naar 0-255 voor de NeoPixel-uitvoer.
- **1 potentiometer:** Hoofdhelderheid voor de actieve strip. Wordt toegepast als schaalfactor nadat de RGB-waarden zijn ingesteld.
- **RGB-status-LED:** Brandt rood, groen of blauw om aan te geven welk kanaal is geselecteerd. Simpel maar effectief; je hoeft niet naar de Serial Monitor te kijken om te weten wat je aan het bewerken bent.

# Codestructuur

```cpp
struct LightState {
  int r, g, b, brightness;
};

LightState lights[3];  // one per strip

void loop() {
  // Read buttons → select strip
  // Read pots → update current strip RGB + brightness
  // Apply: output = color × brightness / 255
  // Update status LED colour
}
```

De schaalformule voor helderheid `output = base_color × brightness / 255` houdt het simpel: elk kanaal wordt evenredig gedimd zonder dat de tint verschuift. Dat is belangrijker dan je zou denken: als je de ruwe waarden gewoon afkapt, krijg je kleurvervorming bij lage helderheid.

# Toekomstige overweging

HSV (Hue, Saturation, Value) aansturen in plaats van RGB is waarschijnlijk intuïtiever wanneer je daadwerkelijk voor de hardware staat en aan fysieke knoppen draait. Bij HSV zit de helderheidspotentiometer direct op de V-component; precies wat je zou verwachten. De drie kleurpotentiometers zouden dan tint, verzadiging en iets anders kunnen regelen (misschien witbalans of kleurtemperatuur). RGB is prima voor een proof of concept, maar het is niet hoe mensen over kleur denken. Ik kom hier waarschijnlijk op terug wanneer ik de fysieke versie bouw.

# Resultaat

De Tinkercad-simulatie bevestigde dat de aanpak werkt voordat ik ook maar een cent aan hardware uitgaf:

De Tinkercad-simulatie bevestigde dat de aanpak werkt voordat ik ook maar een cent aan hardware uitgaf. Drie onafhankelijke LED-strips houden elk hun eigen toestand in het geheugen bij, dus als je naar een andere strip schakelt blijft de kleur gewoon staan. De kanaalselectie gaat via knoppen met nette ontdendering, al zijn de gesimuleerde knoppen van Tinkercad toegegeven schoner dan echte. Vier potentiometers geven realtime RGB- en helderheidsregeling, en de analoog-naar-digitaalomzetting van 0–1023 naar 0–255 is een simpele deling, maar werkt goed genoeg voor een simulatie. De statusindicator-LED geeft duidelijke visuele feedback over welk kanaal actief is, een klein detail dat de interface doordacht laat aanvoelen in plaats van giswerk.
