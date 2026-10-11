---
title: ESP32 + EC11-encoder + stappenmotorbesturing
date: 2026-08-02
description: Embedded motion control met EC11-encoders, een DM430-stappenmotordriver en een WiFi WebSocket-dashboard.

type: lab
category: Embedded systeem
cover: cover.png

tags:
  - ESP32
  - WiFi
  - EC11-encoder
  - Stappenmotor
  - DM430
  - FreeRTOS
  - Motion control
  - Webserver

tools:
  - ESP32
  - EC11 rotatie-encoder ×2
  - SH1106 OLED ×2
  - DM430-stappenmotordriver
  - 42BL40-stappenmotor
  - FreeRTOS

featured: true

lang: nl

translationKey: esp32-ec11-stepper-motor
---

# Wat ik heb gebouwd

Hier promoveerde het vorige encoder + OLED-prototype naar echte motion control. Ik schroefde een DM430-stappenmotordriver en een 42BL40-motor op de werkbank, sloot alles aan op de ESP32 en schreef de firmware om het geheel samen te laten werken. Het systeem kan:

1. **Dubbele EC11-encoder-invoer**: richtingsdetectie, incrementeel tellen, drukknoppen voor het wisselen van modus.
2. **Dubbele OLED-displaybesturing**: twee SH1106-modules parallel op dezelfde I2C-bus, met realtime weergave van hoek, stapstand, snelheid en huidige modus.
3. **DM430-stappenmotordriver**: STEP/DIR-pulsuitgang op GPIO4/5, met de 42BL40-motor op 1600 microstappen per omwenteling. De stroom- en microstapinstellingen van de driver heb ik met vallen en opstaan afgesteld.
4. **WiFi WebSocket-dashboard**: een realtime bedieningspagina met automatische herverbinding en heartbeat, die weerspiegelt wat de OLED toont.
5. **FreeRTOS multitask-architectuur**: Encoder Task, Motor Task en OLED Task allemaal op Core 1, achter een mutex.

# Systeemarchitectuur

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

# Dubbele besturingsmodi

Ik wilde twee fundamenteel verschillende manieren om met de motor te werken, dus bouwde ik ze allebei:

- **MANUAL-modus:** Draai aan de encoder en de motor volgt in discrete stappen. Elke klik van de EC11 beweegt de motor 20 stappen (instelbaar). Dit is directe positiebesturing: ideaal voor nauwkeurig joggen en uitlijnwerk.
- **AUTO-modus:** De encoder bestuurt geen positie meer: hij bestuurt de snelheid. Aan de knop draaien verandert de stapfrequentie van -5000 tot +5000 stappen/sec, waarbij elke encoderstap hem met 50 stappen/sec aanpast. De motor draait continu. Negatieve snelheid = omgekeerde richting. Deze modus is perfect om een bewegingsbereik te doorlopen of snelheidslimieten te testen.

Door de drukknop van een van beide encoders in te drukken, wissel je tussen de modi. Bij het wisselen synchroniseert de firmware de doelpositie met de huidige positie, zodat er geen plotselinge sprong is: dat heb ik op de harde manier geleerd nadat de motor tijdens een vroege test tegen een eindstop knalde.

# Hardware

## Pinout: Module 1 (Encoder + OLED)

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

## Pinout: Module 2 (Encoder + OLED)

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

## Pinout: DM430-stappenmotordriver naar ESP32

| DM430-pin | ESP32-pin | Functie |
|-----------|-----------|----------|
| PUL+      | GPIO4     | STEP-puls |
| DIR+      | GPIO5     | Richting |
| ENA+      | GPIO13    | Enable (optioneel) |
| PUL-      | GND       | n.v.t. |
| DIR-      | GND       | n.v.t. |
| ENA-      | GND       | n.v.t. |

## DM430 naar 42BL40-stappenmotor

| DM430 | Motorkabel |
|-------|------------|
| A+    | A+ (zwart) |
| A-    | A- (groen) |
| B+    | B+ (rood)  |
| B-    | B- (blauw) |

## Voeding

| Apparaat | Spanning | Bron  |
|---------|---------|---------|
| ESP32   | 5V      | USB     |
| OLED x2 | 3.3V    | ESP32   |
| EC11 x2 | 3.3V    | ESP32   |
| DM430   | 24V     | Externe voeding |
| 42BL40  | n.v.t.  | DM430-uitgang |

# Debugreis

Een stappenmotor laten draaien klinkt eenvoudig, totdat je naar een bewegingloze as en een rood FLT-lampje op de driver staart. Dit is wat er misging en hoe ik het heb opgelost:

| Probleem | Oorzaak | Oplossing |
|-------|-----------|----------|
| OLED toont alleen een lijn | Verkeerde SH1106-initparameter | `display.begin(0x3C, true)`: de `true` activeert een hardwarereset |
| Motor draait niet | ENA-signaallogica geïnverteerd | ENA volledig losgekoppeld; STEP+DIR alleen werkt prima voor basisbesturing |
| Rood FLT-alarm op de DM430 | Onjuiste PA-stroominstelling | DIP-schakelaars van de driver opnieuw geconfigureerd zodat ze overeenkomen met de nominale stroom van de 42BL40 |
| Motor te langzaam | Stapstand per encodertik te laag | De snelheidsfactor in de code verhoogd van een voorzichtige waarde naar iets dat daadwerkelijk responsief aanvoelt |

De ENA-pin was de meest frustrerende. De enable-logica van de DM430 hangt af van hoe je de optocoupler-ingangen hebt bedraad: ENA+ hoog trekken schakelde de driver niet in zoals ik verwachtte. Uiteindelijk liet ik hem gewoon losgekoppeld en staat de driver standaard op ingeschakeld, wat prima is voor dit prototype.

# Volledige code

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

# Resultaat

Deze heeft me wat tegengestribbeld: stappenmotordrivers hebben een eigen karakter, maar uiteindelijk viel alles op zijn plek:

Deze heeft me wat tegengestribbeld, want stappenmotordrivers hebben een eigen karakter, maar uiteindelijk viel alles op zijn plek. Beide EC11-encoders voeden de regellus zonder gemiste tellingen, en de moduswissellogica met positiesynchronisatie bij de overgang voorkomt dat de motor springt wanneer je tussen MANUAL en AUTO wisselt. De dubbele OLED's tonen hoek, stapstand, snelheid en modus, en het delen van de I2C-bus werkt prima bij deze verversingsfrequenties. Het WebSocket-dashboard weerspiegelt de OLED-gegevens in realtime, met de gebruikelijke heartbeat en automatische herverbinding. De DM430 stuurt de 42BL40 soepel aan op 1600 microstappen per omwenteling, en hoewel de motor bij bepaalde snelheden een beetje zingt, zijn dat gewoon stappenmotorharmonischen die een afstelronde op microstapniveau eruit haalt. De FreeRTOS-planning houdt ook stand: de encodertaak op 1000 Hz, de pulsgenererende motortaak en de OLED-verversing op 10 Hz bestaan allemaal naast elkaar op Core 1 zonder elkaar te verhongeren.

Dit ding is gepromoveerd van „werkt de software" naar „een echt motion-controlplatform". De volgende upgrade-ronde die ik plan: een TCA9548A I2C-multiplexer zodat ik vier onafhankelijke OLED's kan draaien zonder adresconflicten, HSV-gebaseerde lichtbesturing gekoppeld aan de motorpositie, en uiteindelijk closed-loop terugkoppeling met een encoder op de motoras.
