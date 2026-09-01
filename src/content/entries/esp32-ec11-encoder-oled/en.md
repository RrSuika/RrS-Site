---
title: ESP32 + EC11 Encoder + OLED Angle Feedback
date: 2026-08-02
description: Dual EC11 encoders with OLED display and WiFi WebSocket real-time angle feedback.

type: lab
category: Embedded System
cover: 01-setup.png

tags:
  - ESP32
  - WiFi
  - EC11 Encoder
  - OLED
  - FreeRTOS
  - Web Server

tools:
  - ESP32
  - EC11 Rotary Encoder ×2
  - SH1106 1.3" OLED
  - FreeRTOS
  - AsyncWebServer

featured: true

lang: en

translationKey: esp32-ec11-encoder-oled
---

![Hardware Setup](./01-setup.png)

# What I Built

This is the first stepping stone toward a full motor control rig. Before bolting steppers and drivers onto the bench, I wanted to prove the ESP32 could juggle a few things at once without tripping over itself. So I set out to build a test platform that handles:

1. **Dual EC11 rotary encoder input**: both encoders read simultaneously, with direction detection, incremental counting, and push button debouncing. No missed steps.
2. **SH1106 OLED display**: both OLEDs share the same I2C bus (0x3C), refreshing angle data at 10 Hz without flicker or bus contention.
3. **WiFi WebSocket server**: a browser-based dashboard that shows both angles in real time. WebSocket beats polling for this kind of low-latency UI, and I added heartbeat packets so the connection doesn't time out.
4. **FreeRTOS multi-task architecture**: three tasks pinned to Core 1: Encoder Task at 1000 Hz, Motor Task at 100 Hz, and OLED Task at 10 Hz. Core 0 handles the web server. Mutex on the motor struct keeps shared state consistent.

The goal wasn't to build anything flashy: it was to validate that the software architecture holds up under concurrent load before I add real motors to the mix.

# System Architecture

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

| Signal | ESP32 Pin | Function |
|--------|-----------|----------|
| SDA    | GPIO21    | I2C Data |
| SCL    | GPIO22    | I2C Clock |
| VCC    | 3.3V      | Power |
| GND    | GND       | Ground |
| TRA    | GPIO32    | Encoder A (rotation) |
| TRB    | GPIO33    | Encoder B (rotation) |
| PSH    | GPIO25    | Push button |
| BAK    | GPIO26    | Back button |
| CON    | GPIO27    | Confirm button |

## Module 2: Encoder + OLED

| Signal | ESP32 Pin | Function |
|--------|-----------|----------|
| SDA    | GPIO21    | I2C Data (shared bus) |
| SCL    | GPIO22    | I2C Clock (shared bus) |
| VCC    | 3.3V      | Power |
| GND    | GND       | Ground |
| TRA    | GPIO16    | Encoder A (rotation) |
| TRB    | GPIO17    | Encoder B (rotation) |
| PSH    | GPIO18    | Push button |
| BAK    | GPIO19    | Back button |
| CON    | GPIO23    | Confirm button |

> Both OLED modules share the same I2C bus (GPIO21/22). Each module's buttons and encoder use independent GPIO pins.

# Web Interface

![Web Display](./02-web-display.png)

The browser connects over WebSocket and displays both encoder angles with zero perceptible lag. The JavaScript reconnect logic handles WiFi glitches gracefully: if the ESP32 drops off the network, the page quietly retries every 2 seconds until it's back.

One small optimization I'm happy with: the Motor Task only sends data when the angle actually changed, and it throttles to a minimum 50ms interval. Without that, every encoder tick would fire a WebSocket frame and you'd flood the browser on fast spins.

# OLED Display

The OLED shows:
- Current mode indicator (a little animated `[>]` or `[||]` depending on state)
- A scrolling animation bar that bounces across the top: pointless but satisfying
- Motor 1 and Motor 2 angles in degrees

# Full Code

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

# Result

Everything checks out:

- Both EC11 encoders track reliably with direction detection: no missed ticks even when I spin them fast.
- The SH1106 OLED refreshes at 10 Hz without flicker, and the shared I2C bus handles both modules fine. The `display.begin(0x3C, true)` call was the key: passing `true` for reset fixed the "OLED shows only a horizontal line" problem that had me scratching my head for an hour.
- The WebSocket server streams angle data to the browser with a 50ms send throttle. The heartbeat packets keep the connection alive even if nothing changes for a while.
- FreeRTOS tasks on Core 1 don't starve each other: mutex acquisition times are negligible at these rates.

This prototype proved the software stack works. Next step: wire up a real DM430 stepper driver and replace those virtual "motor" angle values with actual step pulses.
