---
title: ESP32 + WiFi LED-helderheidsregeling
date: 2026-08-04
description: WiFi-webserver en PWM-LED-helderheidsregeling via een browserinterface.

type: lab
category: Embedded systemen
cover: cover.png

tags:
  - ESP32
  - WiFi
  - PWM
  - Webserver

tools:
  - ESP32
  - Arduino IDE
  - NeoPixelBus

featured: true

lang: nl

translationKey: esp32-wifi-led-brightness-control
---

# Overzicht

Het idee was simpel: een LED aansturen vanaf mijn telefoon. Geen Bluetooth, geen app; gewoon een webpagina die door de ESP32 zelf wordt geserveerd en bereikbaar is vanaf elk apparaat op mijn thuis-wifi. Ik zou een schuifregelaar in de browser krijgen en de LED zou in realtime reageren. Het bleek een leuke kleine oefening in het combineren van WiFi, HTTP en PWM; drie dingen die in vrijwel elk IoT-project terugkomen.

# Systeemarchitectuur

De ESP32 is tegelijk WiFi-client en webserver.

# Hardware

- ESP32-WROOM-32-ontwikkelbord
- Ingebouwde LED (GPIO 2)
- USB-kabel

Begonnen met de ingebouwde LED, voor het gemak. Geen breadboard, geen externe componenten; alleen het ontwikkelbord en een USB-kabel. De LED op het bord zit op GPIO 2, wat handig is omdat die al is aangesloten en je niet hoeft na te denken over stroombegrenzingsweerstanden.

# Software

Omgeving: Arduino IDE met de ESP32 Arduino Core

Bibliotheken:

```cpp
#include <WiFi.h>
#include <WebServer.h>
```

Beide bibliotheken worden meegeleverd met de ESP32 Arduino Core, dus je hoeft niets extra te installeren. `WiFi.h` verzorgt de verbinding en `WebServer.h` geeft je een lichtgewicht HTTP-server; perfect voor dit soort dingen.

# Implementatie

## WiFi-webserver

De ESP32 maakt verbinding met je lokale WiFi en serveert een bedieningspagina. <br>
Apparaten op hetzelfde netwerk kunnen het toegewezen IP-adres openen, bijvoorbeeld http://192.168.x.x/.

Dit is wat ik het leukst vind aan de ESP32: je draait een webserver op in een handvol regels en ineens is je microcontroller bereikbaar vanaf elk apparaat op het netwerk. Geen routerconfiguratie, geen port forwarding, gewoon een lokaal IP-adres.

## PWM-helderheidsregeling

De helderheid gebruikt PWM met een 8-bits resolutie (0–255 komt overeen met 0%–100%). <br>
De schuifregelaar op de webpagina stuurt een HTTP-verzoek om de dutycycle te wijzigen:

Browser → /set?value=brightness → PWM-uitgang van de ESP32

Ik koos voor 8-bits PWM (0–255) omdat dat mooi aansluit op het bereik van `ledcWrite` en op de `min`/`max`-attributen van de schuifregelaar. De webpagina gebruikt `fetch()` om bij elke beweging van de schuifregelaar een GET-verzoek naar `/set?value=128` te sturen, en de ESP32 parseert de waarde en schrijft die naar het PWM-kanaal. Op 5000 Hz is er geen zichtbare flikkering.

# Testen

1. Upload de sketch.
2. Open de Serial Monitor en noteer het IP-adres dat na het verbinden wordt getoond.
3. Ga in een browser naar dat IP-adres.
4. Beweeg de schuifregelaar om de LED-helderheid te wijzigen.

# Resultaat

De ESP32 maakt verbinding, serveert de interface, ontvangt HTTP-helderheidswaarden en stuurt de LED aan via PWM. De hele keten (hardware, netwerk, interface, fysieke uitvoer) werkt zoals verwacht en vormt een basis voor meer interactieve IoT-projecten.

Dit is een van die projecten waar de verhouding tussen inspanning en opbrengst erg bevredigend is. Met ongeveer 160 regels code krijg je een werkend, webgestuurd licht. Hetzelfde patroon (WiFi + webserver + PWM) leent zich net zo goed voor zaken als motortoerentalregeling, servopositionering of het aansturen van een LED-strip via een MOSFET.

# Volledige code

```cpp
#include <WiFi.h>
#include <WebServer.h>

// Replace with your WiFi name and password
const char* ssid = "YOUR_WIFI_USERNAME_HERE";
const char* password = "YOUR_WIFI_PASSWORD_HERE";

WebServer server(80);

// LED pin
#define LED_PIN 2

// PWM settings
#define PWM_CHANNEL 0
#define PWM_FREQ 5000
#define PWM_RESOLUTION 8   // 8-bit = 0–255

void setup() {
  Serial.begin(115200);

  // Configure PWM
  ledcAttach(LED_PIN, PWM_FREQ, PWM_RESOLUTION);

  // Start at 50% brightness
  ledcWrite(PWM_CHANNEL, 128);

  // Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.println("WiFi connected");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());

  // Home page
  server.on("/", []() {
    String html = R"rawliteral(
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>ESP32 LED Control</title>
<style>
body { text-align: center; font-family: Arial; }
input { width: 80%; }
</style>
</head>
<body>
<h1>ESP32 LED Control</h1>
<h2>Brightness Control</h2>
<input type="range" min="0" max="255" value="128" id="brightness"
       oninput="changeBrightness(this.value)">
<p>Current Brightness: <span id="value">128</span></p>
<script>
function changeBrightness(value) {
  document.getElementById("value").innerHTML = value;
  fetch("/set?value=" + value);
}
</script>
</body>
</html>
    )rawliteral";
    server.send(200, "text/html;charset=utf-8", html);
  });

  // Receive brightness data from web page
  server.on("/set", []() {
    if (server.hasArg("value")) {
      int brightness = server.arg("value").toInt();
      // Output PWM signal
      ledcWrite(LED_PIN, brightness);
      Serial.print("Brightness: ");
      Serial.println(brightness);
    }
    server.send(200, "text/plain", "OK");
  });

  server.begin();
  Serial.println("Web server started");
}

void loop() {
  server.handleClient();
}
```
