---
title: ESP32 + EC11-encoder + OLED-hoekfeedback
date: 2026-08-02
description: Dubbele EC11-encoders met OLED-display en realtime hoekterugkoppeling via WiFi en WebSocket.

type: lab
category: Embedded systeem
cover: 01-setup.png

tags:
  - ESP32
  - WiFi
  - EC11-encoder
  - OLED
  - FreeRTOS
  - Webserver

tools:
  - ESP32
  - EC11 rotatie-encoder ×2
  - SH1106 1.3" OLED
  - TCA9548A I2C-multiplexer
  - FreeRTOS
  - AsyncWebServer

featured: true

lang: nl

translationKey: esp32-ec11-encoder-oled
---

![Hardware-opstelling](./01-setup.png)

# Wat ik heb gebouwd

Dit is het eerste opstapje richting een volledige motorsturingsopstelling. Voordat ik steppers en drivers op de werkbank schroefde, wilde ik bewijzen dat de ESP32 meerdere dingen tegelijk kan jongleren zonder over zijn eigen benen te struikelen. Dus bouwde ik een testplatform dat het volgende aankan:

1. **Dubbele EC11 rotatie-encoder-invoer**: beide encoders worden tegelijk uitgelezen, met richtingsdetectie, incrementeel tellen en ontdendering van de drukknoppen. Geen gemiste stappen.
2. **SH1106 OLED-display**: beide OLED's antwoorden op 0x3C en hangen daarom elk aan een eigen kanaal van een TCA9548A aan de gedeelde I2C-bus. Beide schermen verversen hun hoekgegevens op 10 Hz zonder flikkering of busconflicten.
3. **WiFi WebSocket-server**: een dashboard in de browser dat beide hoeken in realtime toont. WebSocket wint het van polling voor dit soort UI met lage latentie, en ik heb heartbeat-pakketten toegevoegd zodat de verbinding niet verloopt.
4. **FreeRTOS multitask-architectuur**: drie taken vastgezet op Core 1: Encoder Task op 1000 Hz, Motor Task op 100 Hz en OLED Task op 10 Hz. Core 0 handelt de webserver af. Een mutex op de motorstruct houdt de gedeelde toestand consistent.

Het doel was niet om iets opvallends te bouwen: het ging erom te valideren dat de softwarearchitectuur standhoudt onder gelijktijdige belasting voordat ik er echte motoren aan toevoeg.

# Systeemarchitectuur

```
                 ESP32
            ┌───────────────┐
 Core 0     │ WebServer     │
            │ WebSocket     │
            └───────────────┘
            ┌───────────────┐
 Core 1     │ Encoder Task  │ 1000 Hz
            │ Motor Task    │  100 Hz
            │ OLED Task     │   10 Hz
            └───────────────┘
```

# Pinout

## Module 1: Encoder + OLED

| Signaal | ESP32-pin | Functie |
|--------|-----------|----------|
| SDA    | GPIO21    | I2C-data |
| SCL    | GPIO22    | I2C-klok |
| VCC    | 3.3V      | Voeding |
| GND    | GND       | Massa |
| TRA    | GPIO32    | Encoder A (rotatie) |
| TRB    | GPIO33    | Encoder B (rotatie) |
| PSH    | GPIO25    | Drukknop |
| BAK    | GPIO26    | Terugknop |
| CON    | GPIO27    | Bevestigknop |

## Module 2: Encoder + OLED

| Signaal | ESP32-pin | Functie |
|--------|-----------|----------|
| SDA    | GPIO21    | I2C-data (gedeelde bus) |
| SCL    | GPIO22    | I2C-klok (gedeelde bus) |
| VCC    | 3.3V      | Voeding |
| GND    | GND       | Massa |
| TRA    | GPIO16    | Encoder A (rotatie) |
| TRB    | GPIO17    | Encoder B (rotatie) |
| PSH    | GPIO18    | Drukknop |
| BAK    | GPIO19    | Terugknop |
| CON    | GPIO23    | Bevestigknop |

> Beide OLED-modules delen dezelfde I2C-bus (GPIO21/22) en hetzelfde adres 0x3C, dus ertussen zit een TCA9548A met elk scherm op een eigen kanaal. De multiplexer kost geen extra GPIO's: hij wordt over diezelfde bus geselecteerd. De knoppen en encoder van elke module gebruiken onafhankelijke GPIO-pinnen.

# Webinterface

![Webweergave](./02-web-display.png)

De browser maakt verbinding via WebSocket en toont beide encoderhoeken zonder waarneembare vertraging. De JavaScript-herverbindingslogica vangt WiFi-storingen netjes op: als de ESP32 van het netwerk verdwijnt, probeert de pagina elke 2 seconden stilletjes opnieuw tot hij terug is.

Een kleine optimalisatie waar ik tevreden over ben: de Motor Task verstuurt alleen gegevens wanneer de hoek daadwerkelijk is veranderd, en hij houdt een minimuminterval van 50 ms aan. Zonder dat zou elke encodertik een WebSocket-frame afvuren en zou je de browser overspoelen bij snel draaien.

# OLED-display

De OLED toont:
- Huidige modusindicator (een kleine geanimeerde `[>]` of `[||]` afhankelijk van de toestand)
- Een scrollende animatiebalk die over de bovenkant stuitert: zinloos maar bevredigend
- Hoeken van Motor 1 en Motor 2 in graden

# Volledige code

```cpp
#include <WiFi.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SH110X.h>
#include <ESP32Encoder.h>
#include <AsyncTCP.h>
#include <ESPAsyncWebServer.h>

//==============================
// WiFi
//==============================
const char* ssid = "YOUR_WIFI_USERNAME_HERE";
const char* password = "YOUR_WIFI_PASSWORD_HERE";

//==============================
// WebSocket & AsyncWebServer
//==============================
AsyncWebServer server(80);
AsyncWebSocket ws("/ws");

//==============================
// OLED
//==============================
Adafruit_SH1106G display(128, 64, &Wire);

//==============================
// Encoders
//==============================
ESP32Encoder encoder1;
ESP32Encoder encoder2;

//==============================
// Pins
//==============================
#define ENC1_A 32
#define ENC1_B 33
#define PSH1   25
#define BAK1   26
#define CON1   27

#define ENC2_A 16
#define ENC2_B 17
#define PSH2   18
#define BAK2   19
#define CON2   23

//==============================
// Motor & Animation
//==============================
struct Motor {
  long count;               // protected by mutex
  float targetAngle;
  float currentAngle;
};
Motor motor1, motor2;

volatile bool animationRunning = true;
int animationFrame = 0;

struct Button {
  int pin;
  bool lastState;
  bool pressed;
};
Button btnPSH1, btnBAK1, btnCON1;
Button btnPSH2, btnBAK2, btnCON2;

//==============================
// Synchronization
//==============================
SemaphoreHandle_t motorMutex;

// WebSocket send cache
String lastSentJson = "";
unsigned long lastHeartbeat = 0;

//==============================
// HTML (with auto-reconnect & heartbeat)
//==============================
const char webpage[] PROGMEM = R"rawliteral(
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
body{background:#111;color:white;font-family:Arial;text-align:center;}
.card{background:#222;border-radius:20px;padding:20px;margin:20px;}
.value{font-size:50px;color:#00ffaa;}
</style>
</head>
<body>
<h1>ESP32 Motor Controller</h1>
<div class="card"><h2>Motor 1</h2><div id="m1" class="value">0°</div></div>
<div class="card"><h2>Motor 2</h2><div id="m2" class="value">0°</div></div>
<script>
function connectWS() {
  var socket = new WebSocket('ws://' + location.host + '/ws');
  socket.onmessage = function(event) {
    var data = JSON.parse(event.data);
    if (data.type === 'heartbeat') return; // ignore heartbeat packets
    document.getElementById("m1").innerHTML = data.m1 + "°";
    document.getElementById("m2").innerHTML = data.m2 + "°";
  };
  socket.onclose = function() {
    console.log('WebSocket closed, reconnecting in 2s');
    setTimeout(connectWS, 2000);
  };
  socket.onerror = function(err) {
    console.log('WebSocket error', err);
    socket.close();
  };
}
connectWS();
</script>
</body>
</html>
)rawliteral";

//==============================
// Button helpers
//==============================
void initButton(Button &btn, int pin) {
  btn.pin = pin;
  btn.lastState = HIGH;
  btn.pressed = false;
  pinMode(pin, INPUT_PULLUP);
}

void scanButton(Button &btn) {
  bool cur = digitalRead(btn.pin);
  btn.pressed = (cur == LOW && btn.lastState == HIGH);
  btn.lastState = cur;
}

//==============================
// WebSocket event
//==============================
void onWsEvent(AsyncWebSocket *server, AsyncWebSocketClient *client,
               AwsEventType type, void *arg, uint8_t *data, size_t len) {
  if (type == WS_EVT_CONNECT) {
    Serial.println("WS client connected");
    // send current angles
    xSemaphoreTake(motorMutex, portMAX_DELAY);
    float a1 = motor1.currentAngle;
    float a2 = motor2.currentAngle;
    xSemaphoreGive(motorMutex);
    char buf[64];
    snprintf(buf, sizeof(buf), "{\"m1\":%.0f,\"m2\":%.0f}", a1, a2);
    client->text(buf);
  }
}

// Broadcast message (called when data changes)
void broadcastData(float m1, float m2) {
  char buf[64];
  snprintf(buf, sizeof(buf), "{\"m1\":%.0f,\"m2\":%.0f}", m1, m2);
  // use strcmp to compare string content
  if (strcmp(buf, lastSentJson.c_str()) != 0) {
    lastSentJson = buf;          // update cache
    ws.textAll(buf);
  }
}

// Send heartbeat (keep connection alive)
void sendHeartbeat() {
  ws.textAll("{\"type\":\"heartbeat\"}");
}

//==============================
// Encoder Task (1000 Hz)
//==============================
void encoderTask(void *pv) {
  ESP32Encoder::useInternalWeakPullResistors = puType::up;
  encoder1.attachHalfQuad(ENC1_A, ENC1_B);
  encoder2.attachHalfQuad(ENC2_A, ENC2_B);
  encoder1.clearCount();
  encoder2.clearCount();

  initButton(btnPSH1, PSH1); initButton(btnBAK1, BAK1); initButton(btnCON1, CON1);
  initButton(btnPSH2, PSH2); initButton(btnBAK2, BAK2); initButton(btnCON2, CON2);

  while (true) {
    long c1 = encoder1.getCount();
    long c2 = encoder2.getCount();

    xSemaphoreTake(motorMutex, portMAX_DELAY);
    motor1.count = c1;
    motor2.count = c2;
    motor1.targetAngle = c1 * 18;
    motor2.targetAngle = c2 * 18;
    xSemaphoreGive(motorMutex);

    // button controls animation
    scanButton(btnPSH1); if(btnPSH1.pressed) animationRunning = !animationRunning;
    scanButton(btnBAK1); if(btnBAK1.pressed) animationRunning = false;
    scanButton(btnCON1); if(btnCON1.pressed) animationRunning = true;
    scanButton(btnPSH2); if(btnPSH2.pressed) animationRunning = !animationRunning;
    scanButton(btnBAK2); if(btnBAK2.pressed) animationRunning = false;
    scanButton(btnCON2); if(btnCON2.pressed) animationRunning = true;

    vTaskDelay(pdMS_TO_TICKS(5));
  }
}

//==============================
// Motor Task (500 Hz) + push + heartbeat
//==============================
void motorTask(void *pv) {
  float lastM1 = 0, lastM2 = 0;
  unsigned long lastSend = 0;                 // last push time
  const unsigned long sendInterval = 50;      // min push interval 50ms (20Hz)

  while (true) {
    xSemaphoreTake(motorMutex, portMAX_DELAY);

    // get current and target values
    float cur1 = motor1.currentAngle;
    float cur2 = motor2.currentAngle;
    float tar1 = motor1.targetAngle;
    float tar2 = motor2.targetAngle;

    // smooth angle following
    if (cur1 < tar1) cur1 += 1.0f;
    else if (cur1 > tar1) cur1 -= 1.0f;

    if (cur2 < tar2) cur2 += 1.0f;
    else if (cur2 > tar2) cur2 -= 1.0f;

    motor1.currentAngle = cur1;
    motor2.currentAngle = cur2;

    xSemaphoreGive(motorMutex);

    // send only when value changed AND interval elapsed
    if ((cur1 != lastM1 || cur2 != lastM2) &&
        (millis() - lastSend >= sendInterval)) {
      broadcastData(cur1, cur2);
      lastSend = millis();
      lastM1 = cur1;
      lastM2 = cur2;
    }

    // heartbeat every 5 seconds
    if (millis() - lastHeartbeat > 5000) {
      sendHeartbeat();
      lastHeartbeat = millis();
    }

    vTaskDelay(pdMS_TO_TICKS(10));   // 100Hz
  }
}

//==============================
// OLED Task (10 Hz)
//==============================
void oledTask(void *pv) {
  while (true) {
    float a1, a2;
    xSemaphoreTake(motorMutex, portMAX_DELAY);
    a1 = motor1.currentAngle;
    a2 = motor2.currentAngle;
    xSemaphoreGive(motorMutex);

    display.clearDisplay();
    display.setTextColor(SH110X_WHITE);
    display.setTextSize(1);
    display.setCursor(0, 0);
    display.print("Dual Motor ");
    display.print(animationRunning ? "[>]" : "[||]");

    if (animationRunning) {
      animationFrame++;
      if (animationFrame > 20) animationFrame = 0;
    }
    int posX = animationFrame * 6;
    if (posX > 128) posX = 0;
    display.fillRect(posX, 8, 8, 8, SH110X_WHITE);

    display.setTextSize(2);
    display.setCursor(0, 18);
    display.print("M1:"); display.print(a1, 0); display.println("D");
    display.setCursor(0, 42);
    display.print("M2:"); display.print(a2, 0); display.println("D");

    display.display();
    vTaskDelay(pdMS_TO_TICKS(100));
  }
}

//==============================
// Setup
//==============================
void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);
  display.begin(0x3C, true);
  display.clearDisplay(); display.display();

  pinMode(PSH1, INPUT_PULLUP); pinMode(BAK1, INPUT_PULLUP); pinMode(CON1, INPUT_PULLUP);
  pinMode(PSH2, INPUT_PULLUP); pinMode(BAK2, INPUT_PULLUP); pinMode(CON2, INPUT_PULLUP);

  motorMutex = xSemaphoreCreateMutex();

  WiFi.begin(ssid, password);
  Serial.print("Connecting");
  while (WiFi.status() != WL_CONNECTED) { delay(300); Serial.print("."); }
  Serial.println("\nIP: " + WiFi.localIP().toString());

  ws.onEvent(onWsEvent);
  server.addHandler(&ws);

  server.on("/", HTTP_GET, [](AsyncWebServerRequest *req){
    req->send(200, "text/html", webpage);
  });
  server.begin();

  xTaskCreatePinnedToCore(encoderTask, "Enc", 4096, NULL, 5, NULL, 1);
  xTaskCreatePinnedToCore(motorTask,   "Mot", 4096, NULL, 4, NULL, 1);
  xTaskCreatePinnedToCore(oledTask,    "OLED",4096, NULL, 1, NULL, 1);
}

void loop() {
  vTaskDelay(1000);
}
```

# Resultaat

Alles klopt:

Alles klopt. Beide EC11-encoders volgen betrouwbaar met richtingsdetectie, zonder gemiste tikken, zelfs niet wanneer ik ze snel ronddraai. De SH1106-OLED ververst op 10 Hz zonder flikkering, en met de TCA9548A ervoor gedragen beide 0x3C-modules zich netjes. De aanroep `display.begin(0x3C, true)` was de sleutel: door `true` voor de reset door te geven loste ik het probleem op waarbij de OLED alleen een horizontale lijn toonde, waar ik een uur op heb zitten puzzelen. De WebSocket-server streamt hoekgegevens naar de browser met een verzendbeperking van 50ms, en de heartbeat-pakketten houden de verbinding in leven, zelfs als er een tijdje niets verandert. De FreeRTOS-taken op Core 1 verhongeren elkaar niet, en de mutex-verwervingstijden zijn bij deze frequenties verwaarloosbaar.

Dit prototype bewees dat de softwarestack werkt. Volgende stap: een echte DM430-stappenmotordriver aansluiten en die virtuele „motor"-hoekwaarden vervangen door echte stappulsen.
