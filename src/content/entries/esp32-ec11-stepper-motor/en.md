---
title: ESP32 + EC11 Encoder + Stepper Motor Control
date: 2026-08-02
description: Embedded motion control with EC11 encoders, DM430 stepper driver, and WiFi WebSocket dashboard.

type: lab
category: Embedded System
cover: cover.png

tags:
  - ESP32
  - WiFi
  - EC11 Encoder
  - Stepper Motor
  - DM430
  - FreeRTOS
  - Motion Control
  - Web Server

tools:
  - ESP32
  - EC11 Rotary Encoder ×2
  - SH1106 OLED ×2
  - DM430 Stepper Driver
  - 42BL40 Stepper Motor
  - FreeRTOS

featured: true

lang: en

translationKey: esp32-ec11-stepper-motor
---

# What I Built

This is where the previous encoder + OLED prototype graduated to actual motion control. I bolted a DM430 stepper driver and a 42BL40 motor onto the bench, wired everything up to the ESP32, and wrote the firmware to make it all work together. The system handles:

1. **Dual EC11 encoder input**: direction detection, incremental counting, push buttons for mode toggling.
2. **Dual OLED display control**: two SH1106 modules in parallel on the same I2C bus, showing real-time angle, step count, speed, and current mode.
3. **DM430 stepper motor driver**: STEP/DIR pulse output on GPIO4/5, with the 42BL40 motor running at 1600 microsteps per revolution. Tuned the driver's current and microstep settings through trial and error.
4. **WiFi WebSocket dashboard**: a real-time control page with auto-reconnect and heartbeat, mirroring what the OLED shows.
5. **FreeRTOS multi-task architecture**: Encoder Task, Motor Task, and OLED Task all on Core 1 behind a mutex.

# System Architecture

```
                    ESP32
               ┌──────────────┐
    Core 0     │ AsyncWebSvr  │  WiFi + WebSocket
               └──────────────┘
               ┌──────────────┐
    Core 1     │ Encoder Task │  Rotary input
               │ Motor Task   │  DM430 pulses
               │ OLED Task    │  Display refresh
               └──────────────┘
                        │
                   STEP / DIR
                        │
                  ┌─────────┐
                  │  DM430  │  24V
                  └─────────┘
                        │
                  ┌─────────┐
                  │ 42BL40  │  Stepper
                  └─────────┘
```

# Dual Control Modes

I wanted two fundamentally different ways to interact with the motor, so I built both:

- **MANUAL mode:** Spin the encoder and the motor follows in discrete steps. Each detent on the EC11 moves the motor by 20 steps (configurable). This is direct position control: great for precise jogging and alignment work.
- **AUTO mode:** The encoder doesn't control position anymore: it controls speed. Twisting the knob changes the step rate from -5000 to +5000 steps/sec, with each encoder increment adjusting by 50 steps/sec. The motor runs continuously. Negative speed = reverse direction. This mode is perfect for sweeping through a motion range or testing speed limits.

Pressing either encoder's push button toggles between modes. When you switch modes, the firmware syncs the target position to the current position so there's no sudden jump: I learned that one the hard way after the motor slammed into an endstop during an early test.

# Hardware

## Pinout: Module 1 (Encoder + OLED)

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

## Pinout: Module 2 (Encoder + OLED)

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

## Pinout: DM430 Stepper Driver to ESP32

| DM430 Pin | ESP32 Pin | Function |
|-----------|-----------|----------|
| PUL+      | GPIO4     | STEP pulse |
| DIR+      | GPIO5     | Direction |
| ENA+      | GPIO13    | Enable (optional) |
| PUL-      | GND       |: |
| DIR-      | GND       |: |
| ENA-      | GND       |: |

## DM430 to 42BL40 Stepper Motor

| DM430 | Motor Wire |
|-------|------------|
| A+    | A+ (Black) |
| A-    | A- (Green) |
| B+    | B+ (Red)   |
| B-    | B- (Blue)  |

## Power Supply

| Device  | Voltage | Source  |
|---------|---------|---------|
| ESP32   | 5V      | USB     |
| OLED x2 | 3.3V    | ESP32   |
| EC11 x2 | 3.3V    | ESP32   |
| DM430   | 24V     | External PSU |
| 42BL40  |:       | DM430 output |

# Debugging Journey

Getting a stepper motor to spin sounds simple until you're staring at a motionless shaft and a red FLT light on the driver. Here's what went wrong and how I fixed it:

| Issue | Root Cause | Solution |
|-------|-----------|----------|
| OLED shows only a line | SH1106 init param wrong | `display.begin(0x3C, true)`: the `true` triggers a hardware reset |
| Motor not spinning | ENA signal logic inverted | Disconnected ENA entirely; STEP+DIR alone works fine for basic control |
| DM430 red FLT alarm | PA current setting incorrect | Reconfigured driver DIP switches to match the 42BL40's rated current |
| Motor too slow | Step count per encoder tick too low | Bumped the speed factor in code from a conservative value to something that actually feels responsive |

The ENA pin was the most frustrating one. The DM430's enable logic depends on how you've wired the optocoupler inputs: pulling ENA+ high didn't enable the driver the way I expected. In the end I just left it disconnected and the driver defaults to enabled, which is fine for this prototype.

# Full Code

```cpp
#include <WiFi.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SH110X.h>
#include <ESP32Encoder.h>
#include <AsyncTCP.h>
#include <ESPAsyncWebServer.h>

//================================================
// WiFi
//================================================
const char* ssid = "YOUR_WIFI_USERNAME_HERE";
const char* password = "YOUR_WIFI_PASSWORD_HERE";

//================================================
// Web
//================================================
AsyncWebServer server(80);
AsyncWebSocket ws("/ws");

//================================================
// OLED
//================================================
Adafruit_SH1106G display(128, 64, &Wire);

//================================================
// Encoder
//================================================
ESP32Encoder encoder1;
ESP32Encoder encoder2;

//================================================
// Module 1
//================================================
#define ENCODER_SPEED 20          // steps per encoder increment in manual mode

#define ENC1_A 32
#define ENC1_B 33

#define PSH1 25
#define BAK1 26
#define CON1 27

//================================================
// Module 2
//================================================
#define ENC2_A 16
#define ENC2_B 17

#define PSH2 18
#define BAK2 19
#define CON2 23

//================================================
// DM430 Stepper Driver
//================================================
#define STEP_PIN 4
#define DIR_PIN 5
#define EN_PIN 13

//================================================
// Stepper Parameters
//================================================
#define MICROSTEP 1600
#define STEP_PER_REV MICROSTEP

volatile long targetStep = 0;
volatile long currentStep = 0;
float currentAngle = 0;

//=====================================
// Control Mode
//=====================================
enum ControlMode {
    MANUAL,
    AUTO
};
volatile ControlMode mode = MANUAL;

// Auto mode target speed (steps/sec)
volatile int autoSpeed = 0;               // actual speed value
#define AUTO_SPEED_MIN  -5000
#define AUTO_SPEED_MAX   5000
#define AUTO_SPEED_STEP  50               // each encoder increment changes speed by 50 steps/sec

// Auto mode direction (reserved, not currently used)
volatile int autoDirection = 1;

//================================================
// Button structure
//================================================
struct Button {
    int pin;
    bool lastState;
    bool pressed;
};

Button btnPSH1;
Button btnPSH2;

//================================================
// Mutex (protects shared variables)
//================================================
SemaphoreHandle_t motorMutex;

//================================================
// WebSocket & Heartbeat
//================================================
String lastJson = "";
unsigned long lastHeartbeat = 0;

//================================================
// HTML page (PROGMEM)
//================================================
const char webpage[] PROGMEM = R"rawliteral(
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
body{background:#111;color:white;font-family:Arial;text-align:center;}
.card{background:#222;padding:20px;border-radius:20px;margin:20px;}
.value{font-size:50px;color:#00ffaa;}
.small{font-size:20px;color:#aaaaaa;}
</style>
</head>
<body>
<h1>ESP32 Stepper Controller</h1>
<div class="card">
<div id="angle" class="value">0°</div>
<div id="step" class="small">0 Step</div>
<div id="mode" class="small">MANUAL</div>
<div id="speed" class="small">SPD:0</div>
</div>
<script>
function connectWS(){
  let socket = new WebSocket("ws://"+location.host+"/ws");
  socket.onmessage = function(event){
    let data = JSON.parse(event.data);
    if(data.type=="heartbeat") return;
    document.getElementById("angle").innerHTML = data.angle+"°";
    document.getElementById("step").innerHTML = data.step+" Step";
    document.getElementById("mode").innerHTML = data.mode;
    document.getElementById("speed").innerHTML = "SPD:"+data.speed;
  };
  socket.onclose=function(){ setTimeout(connectWS,1000); };
  socket.onerror=function(){ socket.close(); };
}
connectWS();
</script>
</body>
</html>
)rawliteral";

//================================================
// Button init & scan
//================================================
void initButton(Button& btn, int pin) {
    btn.pin = pin;
    btn.lastState = HIGH;
    btn.pressed = false;
    pinMode(pin, INPUT_PULLUP);
}

void scanButton(Button& btn) {
    bool cur = digitalRead(btn.pin);
    btn.pressed = (cur == LOW && btn.lastState == HIGH);
    btn.lastState = cur;
}

//================================================
// WebSocket
//================================================
void sendHeartbeat() {
    ws.textAll("{\"type\":\"heartbeat\"}");
}

void broadcastData() {
    char buf[128];
    snprintf(buf, sizeof(buf),
        "{\"angle\":%.1f,"
        "\"step\":%ld,"
        "\"speed\":%d,"
        "\"mode\":\"%s\"}",
        currentAngle,
        currentStep,
        autoSpeed,
        mode == MANUAL ? "MANUAL" : "AUTO");

    if (lastJson != String(buf)) {
        lastJson = String(buf);
        ws.textAll(buf);
    }
}

void onWsEvent(AsyncWebSocket *server, AsyncWebSocketClient *client,
               AwsEventType type, void *arg, uint8_t *data, size_t len) {
    if (type == WS_EVT_CONNECT) {
        broadcastData();
    }
}

//================================================
// Step pulse (single pulse)
//================================================
void pulseMotor(int dir) {
    digitalWrite(DIR_PIN, dir > 0);
    digitalWrite(STEP_PIN, HIGH);
    delayMicroseconds(5);
    digitalWrite(STEP_PIN, LOW);
    delayMicroseconds(5);
}

//================================================
// Encoder Task
//================================================
void encoderTask(void *pv) {
    ESP32Encoder::useInternalWeakPullResistors = puType::up;

    encoder1.attachHalfQuad(ENC1_A, ENC1_B);
    encoder2.attachHalfQuad(ENC2_A, ENC2_B);

    encoder1.clearCount();
    encoder2.clearCount();

    initButton(btnPSH1, PSH1);
    initButton(btnPSH2, PSH2);

    long old1 = 0;
    long old2 = 0;

    // track last mode for detecting mode switch
    ControlMode lastMode = MANUAL;

    while (true) {
        // read encoder increments
        long c1 = encoder1.getCount();
        long c2 = encoder2.getCount();
        long delta1 = c1 - old1;
        long delta2 = c2 - old2;

        // process encoder input based on current mode
        xSemaphoreTake(motorMutex, portMAX_DELAY);   // protect shared variables

        if (mode == MANUAL) {
            // manual mode: directly change target steps
            if (delta1 != 0) {
                targetStep += delta1 * ENCODER_SPEED;
                old1 = c1;
            }
            if (delta2 != 0) {
                targetStep += delta2 * ENCODER_SPEED;
                old2 = c2;
            }
        } else { // AUTO
            // auto mode: adjust speed value
            if (delta1 != 0) {
                autoSpeed += delta1 * AUTO_SPEED_STEP;
                autoSpeed = constrain(autoSpeed, AUTO_SPEED_MIN, AUTO_SPEED_MAX);
                old1 = c1;
            }
            if (delta2 != 0) {
                autoSpeed += delta2 * AUTO_SPEED_STEP;
                autoSpeed = constrain(autoSpeed, AUTO_SPEED_MIN, AUTO_SPEED_MAX);
                old2 = c2;
            }
        }

        // detect if mode just switched
        if (lastMode != mode) {
            if (mode == MANUAL) {
                // switched back to manual: clear encoder hardware counts, eliminate history increments
                encoder1.clearCount();
                encoder2.clearCount();
                old1 = 0;
                old2 = 0;
                // sync target step to current actual position to prevent jump
                targetStep = currentStep;
            } else { // entered AUTO
                // entering auto: sync target and reset speed
                targetStep = currentStep;
                autoSpeed = 0;
            }
            lastMode = mode;
        }

        xSemaphoreGive(motorMutex);

        // scan buttons (toggle mode)
        scanButton(btnPSH1);
        if (btnPSH1.pressed) {
            xSemaphoreTake(motorMutex, portMAX_DELAY);
            if (mode == MANUAL) {
                mode = AUTO;
                autoSpeed = 0;
                targetStep = currentStep;   // sync position
            } else {
                mode = MANUAL;
                autoSpeed = 0;
                targetStep = currentStep;
                // encoder count clearing will be handled in next loop's mode change detection
            }
            xSemaphoreGive(motorMutex);
        }

        scanButton(btnPSH2);
        if (btnPSH2.pressed) {
            xSemaphoreTake(motorMutex, portMAX_DELAY);
            if (mode == MANUAL) {
                mode = AUTO;
                autoSpeed = 0;
                targetStep = currentStep;
            } else {
                mode = MANUAL;
                autoSpeed = 0;
                targetStep = currentStep;
            }
            xSemaphoreGive(motorMutex);
        }

        vTaskDelay(pdMS_TO_TICKS(2));
    }
}

//================================================
// Motor Task
//================================================
void motorTask(void *pv) {
    unsigned long lastSend = 0;
    unsigned long lastPulseTime = 0;   // for auto mode timed pulses

    while (true) {
        bool pulseSent = false;   // flag whether a pulse was sent this cycle

        // generate motion based on mode
        xSemaphoreTake(motorMutex, portMAX_DELAY);

        if (mode == MANUAL) {
            if (currentStep < targetStep) {
                pulseMotor(1);
                currentStep++;
                pulseSent = true;
            } else if (currentStep > targetStep) {
                pulseMotor(-1);
                currentStep--;
                pulseSent = true;
            }
            if (!pulseSent) lastPulseTime = micros();  // reset timer
        } else { // AUTO
            if (autoSpeed != 0) {
                unsigned long now = micros();
                unsigned long interval = (1000000UL / abs(autoSpeed));
                if (interval < 50) interval = 50;
                if (now - lastPulseTime >= interval) {
                    int dir = (autoSpeed > 0) ? 1 : -1;
                    pulseMotor(dir);
                    currentStep += dir;
                    lastPulseTime = now;
                    pulseSent = true;
                }
            } else {
                lastPulseTime = micros();
            }
        }

        // update angle display
        currentAngle = 360.0f * currentStep / STEP_PER_REV;

        xSemaphoreGive(motorMutex);

        if (!pulseSent) {
            vTaskDelay(pdMS_TO_TICKS(1));   // sleep 1ms when no action, yield CPU
        }

        if (millis() - lastSend > 10) {
            broadcastData();
            lastSend = millis();
        }
        if (millis() - lastHeartbeat > 5000) {
            sendHeartbeat();
            lastHeartbeat = millis();
        }

        taskYIELD();
    }
}

//================================================
// OLED Display Task
//================================================
void oledTask(void *pv) {
    while (true) {
        display.clearDisplay();
        display.setTextSize(1);
        display.setCursor(0, 0);
        display.print("MODE:");
        if (mode == MANUAL) display.println("MANUAL");
        else                 display.println("AUTO");

        display.drawLine(0, 10, 128, 10, SH110X_WHITE);

        display.setTextSize(2);
        display.setCursor(0, 18);
        display.print(currentAngle, 0);
        display.println(" D");

        display.setTextSize(1);
        display.setCursor(0, 45);
        display.print("STEP:");
        display.println(currentStep);

        display.setCursor(0, 55);
        display.print("SPD:");
        display.println(autoSpeed);

        display.display();
        vTaskDelay(pdMS_TO_TICKS(50));
    }
}

//================================================
// Setup
//================================================
void setup() {
    Serial.begin(115200);
    motorMutex = xSemaphoreCreateMutex();

    Wire.begin(21, 22);
    display.begin(0x3C, true);
    display.clearDisplay();
    display.setTextColor(SH110X_WHITE);
    display.setTextSize(1);
    display.setCursor(0,0);
    display.println("ESP32 STEPPER");
    display.display();

    pinMode(STEP_PIN, OUTPUT);
    pinMode(DIR_PIN, OUTPUT);
    pinMode(EN_PIN, OUTPUT);
    digitalWrite(EN_PIN, HIGH);   // enable (depends on driver, may need LOW to enable)

    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
        delay(300);
        Serial.print(".");
    }
    Serial.println();
    Serial.println(WiFi.localIP());

    ws.onEvent(onWsEvent);
    server.addHandler(&ws);
    server.on("/", HTTP_GET, [](AsyncWebServerRequest *request){
        request->send(200, "text/html", webpage);
    });
    server.begin();

    // create tasks (all pinned to core 1, synchronized via mutex)
    xTaskCreatePinnedToCore(encoderTask, "ENCODER", 4096, NULL, 5, NULL, 1);
    xTaskCreatePinnedToCore(motorTask,   "MOTOR",   4096, NULL, 4, NULL, 1);
    xTaskCreatePinnedToCore(oledTask,    "OLED",    4096, NULL, 3, NULL, 1);
}

void loop() {
    delay(1000);
}
```

# Result

This one fought me a bit: stepper drivers have their own personality: but everything came together:

- Both EC11 encoders feed into the control loop with no dropped counts, and the mode-switching logic (with position sync on transition) prevents the motor from jumping when you toggle between MANUAL and AUTO.
- Dual OLEDs display angle, step count, speed, and mode: I2C bus sharing works fine at these refresh rates.
- The WebSocket dashboard mirrors the OLED data in real time, with the usual heartbeat and auto-reconnect.
- The DM430 drives the 42BL40 smoothly at 1600 microsteps/rev. The motor sings a bit at certain speeds but that's just stepper harmonics: nothing a microstep tuning pass can't dial out.
- FreeRTOS scheduling holds up: the 1000 Hz encoder task, the pulse-generation motor task, and the 10 Hz OLED refresh all coexist on Core 1 without starving each other.

This thing has graduated from "does the software work" to "actual motion control platform." The next round of upgrades I'm planning: a TCA9548A I2C multiplexer so I can run four independent OLEDs without address conflicts, HSV-based lighting control tied to motor position, and eventually closed-loop feedback with an encoder on the motor shaft.
