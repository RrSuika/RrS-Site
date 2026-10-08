---
title: ESP32 + seriële communicatietest
date: 2026-07-20
description: "Verificatie van de ESP32-microcontroller: een sketch uploaden en seriële communicatie via USB bevestigen."

type: lab
category: Embedded systemen
cover: cover.png

tags:
  - ESP32
  - Seriële communicatie
  - Aan de slag

tools:
  - ESP32
  - Arduino IDE
  - USB-kabel

featured: false

lang: nl

translationKey: esp32-serial-test
---

# Doel

Voordat ik me op iets ambitieuzers stortte, moest ik zeker weten dat het ESP32-bord het daadwerkelijk deed; dat ik er een sketch op kon flashen, er via USB mee kon praten en uitvoer van een draaiend programma kon zien. Het is het soort sanity check dat je later uren debuggen bespaart. Als de seriële communicatie niet werkt, werkt al het vervolg ook niet.

# Code

```cpp
void setup() {
  Serial.begin(115200);
}

void loop() {
  Serial.println("ESP32 OK");
  delay(1000);
}
```

Niets bijzonders: alleen de seriële poort initialiseren op 115200 baud en elke seconde een heartbeat printen. Als dit in de Serial Monitor verschijnt, weet ik dat het bord leeft, dat de USB-naar-UART-bridge werkt en dat de Arduino IDE er goed mee kan communiceren.

# Teststappen

1. Selecteer het ESP32-bord en de bijbehorende COM-poort in de Arduino IDE.
2. Sluit de ESP32 via USB aan en upload de code.
3. Wanneer `Connecting......` verschijnt, druk je op de IO0-knop op de ESP32 om naar de flashmodus te gaan.
4. Open na het uploaden de Serial Monitor en zet de baudrate op **115200**.

De stap met de IO0-knop verraste me de eerste keer; de ESP32 gaat niet op elk bord automatisch naar de flashmodus, dus je moet IO0 ingedrukt houden of kort indrukken wanneer de IDE "Connecting" aangeeft. Als je dat moment mist, loopt de upload gewoon tegen een timeout aan en probeer je het opnieuw. Een klassieke ESP32-eigenaardigheid.

# Resultaat

De Serial Monitor geeft continu het volgende weer:

```
ESP32 OK
ESP32 OK
ESP32 OK
```

Alles klopt. Het bord accepteert een sketch, de sketch draait en ik zie de uitvoer. Op naar het volgende.
