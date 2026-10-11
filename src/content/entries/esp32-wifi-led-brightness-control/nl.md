---
title: ESP32 + WiFi LED-helderheidsregeling
date: 2026-08-04
description: Een webpagina die de ESP32 zelf serveert stuurt de ingebouwde LED aan via 8-bits PWM, zodat elk apparaat op het lokale netwerk de helderheid kan instellen.

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

# Doel

Het idee was simpel: een LED aansturen vanaf mijn telefoon. Geen Bluetooth en geen app, alleen een webpagina die de ESP32 zelf serveert en die elk apparaat op mijn thuis-wifi kan openen. Een schuifregelaar in de browser, en de LED volgt die in realtime. Daarmee komen WiFi, HTTP en PWM in één klein bouwsel samen, en daarom koos ik dit als oefening.

De ESP32 is hier zowel WiFi-client als webserver.

# Hardware

- ESP32-WROOM-32-ontwikkelbord
- Ingebouwde LED (GPIO 2)
- USB-kabel

Ik begon met de ingebouwde LED om het aantal onderdelen op nul te houden: geen breadboard, geen externe componenten, alleen het ontwikkelbord en een USB-kabel. De LED op het bord zit op GPIO 2 met de stroombegrenzingsweerstand er al bij, dus aan de hardwarekant viel er niets mis te gaan voordat er code geschreven was.

# Software

Arduino IDE met de ESP32 Arduino Core.

```cpp
#include <WiFi.h>
#include <WebServer.h>
```

Beide bibliotheken zitten bij de core, dus er hoefde niets extra's geïnstalleerd te worden. `WiFi.h` doet de verbinding en `WebServer.h` levert een lichtgewicht HTTP-server, en meer had dit niet nodig.

# Implementatie

## WiFi-webserver

De ESP32 meldt zich aan op mijn lokale wifi en serveert een bedieningspagina.<br>
Elk apparaat op hetzelfde netwerk kan het toegewezen IP-adres openen, bijvoorbeeld http://192.168.x.x/.

Dit is het onderdeel van de ESP32 dat ik het leukst vind. Een handvol regels zet een webserver op, en ineens is de microcontroller bereikbaar vanaf alles op het netwerk. Geen routerconfiguratie, geen port forwarding, gewoon een lokaal adres.

## PWM-helderheidsregeling

De helderheid loopt op 8-bits PWM, dus 0–255 valt samen met 0%–100%.<br>
De schuifregelaar stuurt een HTTP-verzoek dat de dutycycle verandert:

Browser → /set?value=brightness → PWM-uitgang van de ESP32

8 bits was de voor de hand liggende keuze, want dat sluit aan op het bereik dat `ledcWrite` aanneemt en op de `min`- en `max`-attributen van de schuifregelaar. De pagina gebruikt `fetch()` om bij elke beweging van de schuifregelaar een GET naar `/set?value=128` te sturen, en de ESP32 parst de waarde en schrijft die naar het PWM-kanaal. Op 5000 Hz is er geen zichtbare flikkering.

# Testen

1. Upload de sketch.
2. Open de Serial Monitor en noteer het IP-adres dat na het verbinden wordt getoond.
3. Ga in een browser naar dat IP-adres.
4. Beweeg de schuifregelaar om de LED-helderheid te wijzigen.

# Resultaat

De ESP32 maakt verbinding, serveert de interface, ontvangt HTTP-helderheidswaarden en stuurt de LED aan via PWM. De hele keten werkt van begin tot eind, van hardware via netwerk en interface naar de fysieke uitgang, en daarmee staat er een basis om interactievere dingen op te bouwen.

In ongeveer 160 regels code staat er een werkend, webgestuurd licht. Dezelfde combinatie van WiFi, webserver en PWM gaat net zo goed op voor motortoeren, servopositie of het aansturen van een LED-strip via een MOSFET.

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
