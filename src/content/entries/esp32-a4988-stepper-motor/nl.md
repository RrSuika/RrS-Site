---
title: ESP32 + A4988 24V-stappenmotorbesturing
date: 2026-09-15
description: Ik heb de drie HSV-kleurkanalen omgebouwd tot generieke Rails en Rail 1 een A4988 met 24V-stappenmotor laten aansturen, terwijl encoders en webpagina blijven meedraaien.

type: lab
category: Embedded systeem
cover: cover.png

tags:
  - ESP32
  - WiFi
  - EC11-encoder
  - OLED
  - Stappenmotor
  - A4988
  - Motion control
  - Webserver

tools:
  - ESP32
  - A4988-stappenmotordriver
  - 24V-stappenmotor
  - SH1106 1.3" OLED + EC11-module ×3
  - TCA9548A

featured: true

lang: nl

translationKey: esp32-a4988-stepper-motor
---

# Wat ik heb gebouwd

De HSV-opstelling was een kleurmeng-oefening: drie kanalen, drie knoppen, drie schermen. Dit is diezelfde opstelling met de kleur eruit en een motor eraan vast.

De drie HSV-kanalen werden drie generieke kanalen, Rail 1 tot en met Rail 3, elk nog steeds 0–100, elk nog steeds bediend door zijn eigen encoder en zijn eigen slider op de webpagina. Alleen wat eraan hangt is veranderd. Ik heb Rail 1 aan een A4988-driver en een 24V-stappenmotor gehangen, en wat ik eigenlijk wilde weten was of de rest van het systeem bleef draaien terwijl de motor beweegt. Dat doet het: GPIO 13 blijft stappulsen uitsturen terwijl de OLED's verversen, de encoders tellen en de webpagina antwoordt. Dat was het punt van deze test.

Er zijn maar twee nieuwe pinnen. GPIO 12 doet de richting, GPIO 13 doet de stap. SLEEP en RESET hangen aan 3.3V, de drie microstepping-pinnen en ENABLE aan massa, en op Rail 2 en 3 zit nog niets aangesloten.

# Hardware

| Component | Aantal | Doel |
|---|---|---|
| ESP32 | 1 | Hoofdcontroller |
| A4988-stappenmotordriver | 1 | Stappenmotordriver |
| 24V-stappenmotor | 1 | Actuator |
| 24V externe voeding | 1 | Motorvoeding |
| 47µF / 50V elco | 1 | VMOT-voedingsfiltering |
| TCA9548A | 1 | I2C-multiplexer |
| 1.3" SH1106 OLED + EC11-module | 3 | Rail-weergave en -bediening |

De motor draait op zijn eigen 24V-voeding. De ESP32 stuurt alleen de logische signalen.

| ESP32-GPIO | Functie |
|---|---|
| GPIO 21 | I2C SDA |
| GPIO 22 | I2C SCL |
| GPIO 25 | Encoder 1 A |
| GPIO 18 | Encoder 1 B |
| GPIO 26 | Encoder 2 A |
| GPIO 27 | Encoder 2 B |
| GPIO 4 | Encoder 3 A |
| GPIO 16 | Encoder 3 B |
| GPIO 12 | A4988 DIRECTION |
| GPIO 13 | A4988 STEP |

Afgezien van die twee zit elke pin precies waar hij in de HSV-opstelling zat.

# A4988-bedrading

| A4988-pin | Aansluiting | Functie |
|---|---|---|
| DIRECTION | ESP32 GPIO 12 | Motorrichting |
| STEP | ESP32 GPIO 13 | Stappuls |
| SLEEP | 3.3V | Driver wakker houden |
| RESET | 3.3V | Reset loslaten |
| MS1 | GND | Full-step-modus |
| MS2 | GND | Full-step-modus |
| MS3 | GND | Full-step-modus |
| ENABLE | GND | Driver continu ingeschakeld |

De A4988 heeft twee voedingsdomeinen, en die uit elkaar houden is de hele truc. VDD krijgt de 3.3V van de ESP32 voor de logica. VMOT krijgt de externe 24V voor de motor. De min van de 24V gaat naar de motorzijde-GND van de A4988, en de ESP32-GND komt op datzelfde punt uit, zodat STEP en DIRECTION een referentie met de driver delen. De 24V-voeding raakt nooit de 3.3V- of 5V-pinnen van de ESP32.

Vlak bij de VMOT-ingang zit een elco van 47µF / 50V, plus naar VMOT, min naar GND. Hij geeft de motorvoeding lokale energieopslag en dempt de spanningsschommelingen die het schakelen van de driver veroorzaakt. 50V op een 24V-rail is ruim genoeg.

De motor heeft vier draden en twee spoelen: 1A/1B voor spoel A, 2A/2B voor spoel B. Draadkleuren verschillen per motor, dus de betrouwbare manier om ze te pairen is een multimeter. Twee draden van dezelfde spoel geven een meetbare weerstand, draden van verschillende spoelen meten open.

De eerste test draaide ik bewust op full-step, met MS1, MS2 en MS3 allemaal aan massa. Full-step houdt de relatie tussen STEP-pulsen en beweging overzichtelijk, en dat is wat een eerste test nodig heeft. Microstepping kan wachten tot soepelheid of fijne positionering echt gaat tellen.

# Rail-architectuur

De HSV-variabelen hVal, sVal en vVal werden rail1Val, rail2Val en rail3Val. Elke Rail loopt van 0–100. Encoder 1 stuurt Rail 1, encoder 2 stuurt Rail 2, encoder 3 stuurt Rail 3. De websliders schrijven dezelfde waarden, en elke OLED toont zijn eigen Rail. De drie kanalen weten niets meer van kleur.

Rail 1 mapt lineair op een doelaantal stappen:

```
Rail 1 = 0   → 0 stappen
Rail 1 = 10  → 100 stappen
Rail 1 = 50  → 500 stappen
Rail 1 = 100 → 1000 stappen
```

Dat plafond van 1000 stappen is een testwaarde, geen volledige omwenteling. Hoe ver de as echt draait hangt af van de staphhoek van de motor en de microstepping-instelling.

# Motorsoftware

STEP en DIRECTION doen al het werk. De firmware houdt twee posities bij:

```cpp
long currentStep;
long targetStep;
```

targetStep is waar Rail 1 de motor naartoe wilde hebben, currentStep is waar de software denkt dat hij staat. Verschillen ze, dan pulst de controller STEP tot ze gelijk zijn, met DIRECTION aan de kant die voorloopt.

Niets daarvan blokkeert de hoofdlus. Elke ronde doet de webserver, de encoderverwerking, één motorstap per 1000µs en een OLED-verversing, en begint dan opnieuw. De webpagina en de andere twee encoders blijven de hele tijd responsief terwijl de motor beweegt. Dezelfde structuur kan later drie A4988's aan, zonder herschrijven.

# Webinterface

De pagina houdt de opzet van de HSV-opstelling, met drie Rail-sliders in plaats van de kleurregeling. Rail 1 in de browser verplaatsen verandert het motordoel precies zoals aan encoder 1 draaien. Het /get-endpoint geeft de actuele Rail-waarden plus currentStep en targetStep, en de browser synchroniseert daar op een timer tegenaan.

# Test en resultaat

Bij de eerste run stuurde ik geen volledige-bereik-commando's. Ik zette hem aan en liep fase voor fase na: ESP32-boot, OLED-initialisatie, TCA9548A-communicatie, encoderinvoer, WiFi-verbinding en pas daarna de besturingssignalen van de A4988. Pas toen dat allemaal klopte liet ik Rail 1 in kleine stapjes oplopen, 1, 5, 10, 20, 50, en de motor volgde ze allemaal.

De test is geslaagd. De ESP32 stuurde de A4988 aan via GPIO 12 en 13, de A4988 dreef de 24V-stappenmotor, en de bestaande driekanaals-UI bleef de hele tijd werken. Rail 1 bewoog zowel vanaf de EC11-knop als vanaf de webpagina, met de waarde op OLED 1.

Het bord zit nu in het midden van twee takken: ESP32 ── TCA9548A ── 3× (OLED + EC11) aan de ene kant, en ESP32 ── A4988 ── 42mm-stappenmotor aan de andere.

Rail 2 en 3 zijn nog steeds onafhankelijke kanalen zonder iets eraan, vrijgehouden voor latere motoren of andere actuatoren.

# Veiligheidsnotities

- Motorvoeding en logische voeding blijven gescheiden. 24V komt alleen op de motoringang van de A4988; de logische rail komt van de ESP32.
- De massa's zijn gemeenschappelijk, zodat STEP en DIRECTION een referentie met de driver delen.
- De elco zit er met de juiste polariteit in, plus naar VMOT en min naar GND, en hij is 50V-rated op een 24V-rail.
- Koppel de motor nooit los of aan terwijl de driver onder spanning staat. De inductieve last gooit spanningstransiënten op die de driver slopen.
- Zet de stroomlimiet van de A4988 op de nominale stroom van de motor voordat je hem langere tijd laat lopen.

# Volgende stap

De enkelmotorige test is het sjabloon voor een drieassige opstelling:

```
Rail 1 → A4988 → Motor 1
Rail 2 → A4988 → Motor 2
Rail 3 → A4988 → Motor 3
```

Drie A4988's, drie motoren, dezelfde softwarestructuur.

# Volledige code

```cpp
/*
 * ESP32 + TCA9548A + 3x (OLED + EC11)
 * + WiFi web control
 * + A4988 stepper motor
 *
 * Rail 1 → A4988 → Stepper Motor
 * Rail 2 → independent control variable
 * Rail 3 → independent control variable
 *
 * A4988:
 * STEP      GPIO 13
 * DIRECTION GPIO 12
 * SLEEP     3.3V
 * RESET     3.3V
 * MS1       GND
 * MS2       GND
 * MS3       GND
 * ENABLE    GND
 *
 * Motor power:
 * VMOT → external 24V
 * GND  → 24V supply GND
 *
 * ESP32 GND and 24V supply GND are common
 */

#include <WiFi.h>
#include <WebServer.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SH110X.h>

// ==================== WiFi ====================
const char* ssid     = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// ==================== I2C ====================
#define SDA_PIN 21
#define SCL_PIN 22
#define TCA_ADDR 0x70

// ==================== Encoders ====================
#define ENC1_A 25
#define ENC1_B 18
#define ENC2_A 26
#define ENC2_B 27
#define ENC3_A 4
#define ENC3_B 16

// ==================== A4988 ====================
#define A4988_DIR  12
#define A4988_STEP 13

// ==================== OLED ====================
Adafruit_SH1106G disp1(128, 64, &Wire, -1);
Adafruit_SH1106G disp2(128, 64, &Wire, -1);
Adafruit_SH1106G disp3(128, 64, &Wire, -1);

// ==================== Web server ====================
WebServer server(80);

// ==================== Rail state ====================
int rail1Val = 0;
int rail2Val = 0;
int rail3Val = 0;

// ==================== Encoder state machine ====================
static const int8_t KNOB_DIR[16] = {
   0, -1,  1,  0,
   1,  0,  0, -1,
  -1,  0,  0,  1,
   0,  1, -1,  0
};

volatile uint8_t encState[3] = {0, 0, 0};
volatile int8_t  encDelta[3] = {0, 0, 0};

// ==================== A4988 motor control ====================
long currentStep = 0;                 // software position
long targetStep  = 0;                 // position requested by Rail 1

const long MAX_MOTOR_STEPS = 1000;    // Rail 1 = 100 → 1000 steps

const unsigned long STEP_INTERVAL_US = 1000;  // smaller = faster

unsigned long lastStepMicros = 0;

// ==================== Web page ====================
const char htmlPage[] PROGMEM = R"rawliteral(
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0,user-scalable=yes">
<title>Rail Controller</title>
<style>
:root{--bg:#000;--text:#f5f5f7;--card-bg:rgba(28,28,30,0.65);--slider-track:#3a3a3c;--slider-thumb:#0a84ff;--border:rgba(255,255,255,0.15);--shadow:rgba(0,0,0,0.5);}
body.light{--bg:#f2f2f7;--text:#1c1c1e;--card-bg:rgba(255,255,255,0.7);--slider-track:#c7c7cc;--slider-thumb:#007aff;--border:rgba(0,0,0,0.1);--shadow:rgba(0,0,0,0.08);}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:var(--bg);color:var(--text);margin:0;padding:20px;display:flex;justify-content:center;align-items:center;min-height:100vh;transition:background-color .3s ease,color .3s ease;}
.container{width:100%;max-width:480px;background:var(--card-bg);backdrop-filter:blur(30px);-webkit-backdrop-filter:blur(30px);border-radius:32px;padding:30px 28px;box-shadow:0 20px 50px var(--shadow);border:1px solid var(--border);}
.header{display:flex;justify-content:space-between;align-items:center;margin-bottom:25px;}
h1{font-size:22px;font-weight:600;margin:0;letter-spacing:-.4px;}
.theme-toggle{background:rgba(255,255,255,.15);border:none;border-radius:50%;width:42px;height:42px;font-size:18px;cursor:pointer;color:var(--text);display:flex;align-items:center;justify-content:center;transition:transform .2s;}
.theme-toggle:hover{transform:scale(1.08);}
.slider-group{margin:20px 0;}
.slider-group label{display:flex;align-items:center;justify-content:space-between;font-size:15px;font-weight:500;gap:8px;}
.slider-group span{min-width:50px;text-align:right;font-weight:600;font-variant-numeric:tabular-nums;}
input[type="range"]{-webkit-appearance:none;appearance:none;width:100%;height:6px;border-radius:3px;background:var(--slider-track);outline:none;margin:12px 0;}
input[type="range"]::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:24px;height:24px;border-radius:50%;background:var(--slider-thumb);border:2px solid rgba(255,255,255,.3);cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,.3);}
input[type="range"]::-moz-range-thumb{width:22px;height:22px;border-radius:50%;background:var(--slider-thumb);border:2px solid rgba(255,255,255,.3);cursor:pointer;}
.info{margin-top:25px;font-size:13px;opacity:.75;text-align:center;font-weight:500;line-height:1.6;}
.status-dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:#30d158;margin-right:6px;vertical-align:middle;animation:pulse 2s infinite;}
@keyframes pulse{0%,100%{opacity:1;}50%{opacity:.4;}}
</style>
</head>
<body class="dark">
<div class="container">
<div class="header"><h1>Rail Control</h1><button class="theme-toggle" id="theme-toggle">☀️</button></div>
<div class="slider-group"><label>Rail 1 <span id="rail1-val">0</span></label><input id="rail1" type="range" min="0" max="100" value="0"></div>
<div class="slider-group"><label>Rail 2 <span id="rail2-val">0</span></label><input id="rail2" type="range" min="0" max="100" value="0"></div>
<div class="slider-group"><label>Rail 3 <span id="rail3-val">0</span></label><input id="rail3" type="range" min="0" max="100" value="0"></div>
<div class="info" id="info"><span class="status-dot"></span>Rail 1: 0 &nbsp;|&nbsp; Rail 2: 0 &nbsp;|&nbsp; Rail 3: 0</div>
</div>
<script>
let R1 = 0, R2 = 0, R3 = 0;
let lastInteraction = 0;
const elR1 = document.getElementById('rail1');
const elR2 = document.getElementById('rail2');
const elR3 = document.getElementById('rail3');
const elR1v = document.getElementById('rail1-val');
const elR2v = document.getElementById('rail2-val');
const elR3v = document.getElementById('rail3-val');
const info = document.getElementById('info');
function updateUI(){
  if(document.activeElement !== elR1) elR1.value = R1;
  if(document.activeElement !== elR2) elR2.value = R2;
  if(document.activeElement !== elR3) elR3.value = R3;
  elR1v.textContent = R1;
  elR2v.textContent = R2;
  elR3v.textContent = R3;
  info.innerHTML = '<span class="status-dot"></span>' +
    'Rail 1: ' + R1 + ' &nbsp;|&nbsp; ' +
    'Rail 2: ' + R2 + ' &nbsp;|&nbsp; ' +
    'Rail 3: ' + R3;
}
function sendRails(){
  lastInteraction = Date.now();
  fetch('/rail?value=' + Math.round(R1) + ',' + Math.round(R2) + ',' + Math.round(R3)).catch(()=>{});
}
elR1.addEventListener('input', function(){ R1 = Number(this.value); updateUI(); sendRails(); });
elR2.addEventListener('input', function(){ R2 = Number(this.value); updateUI(); sendRails(); });
elR3.addEventListener('input', function(){ R3 = Number(this.value); updateUI(); sendRails(); });
setInterval(function(){
  if(Date.now() - lastInteraction < 800) return;
  fetch('/get').then(r => r.json()).then(d => {
    if(d.r1 !== R1 || d.r2 !== R2 || d.r3 !== R3){
      R1 = d.r1; R2 = d.r2; R3 = d.r3;
      updateUI();
    }
  }).catch(()=>{});
}, 400);
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;
const savedTheme = localStorage.getItem('theme');
if(savedTheme === 'light'){
  body.classList.remove('dark');
  body.classList.add('light');
  themeToggle.innerHTML = '🌙';
}
themeToggle.addEventListener('click', function(){
  if(body.classList.contains('dark')){
    body.classList.remove('dark');
    body.classList.add('light');
    themeToggle.innerHTML = '🌙';
    localStorage.setItem('theme', 'light');
  } else {
    body.classList.remove('light');
    body.classList.add('dark');
    themeToggle.innerHTML = '☀️';
    localStorage.setItem('theme', 'dark');
  }
});
updateUI();
</script>
</body>
</html>
)rawliteral";

// ==================== TCA9548A ====================
bool tcaSelect(uint8_t ch) {
  for (int i = 0; i < 3; i++) {
    Wire.beginTransmission(TCA_ADDR);
    Wire.write(1 << ch);
    if (Wire.endTransmission() == 0) return true;
    delayMicroseconds(100);
  }
  return false;
}

// ==================== OLED draw ====================
void drawOne(Adafruit_SH1106G &disp, const char* label, int value) {
  disp.clearDisplay();
  disp.setTextSize(1);
  disp.setTextColor(SH110X_WHITE);
  disp.setCursor(0, 0);
  disp.print(label);

  disp.setTextSize(2);
  disp.setCursor(0, 14);
  disp.print(value);
  disp.print(" %");

  disp.drawRect(0, 46, 128, 14, SH110X_WHITE);   // frame
  int fillW = map(value, 0, 100, 0, 126);        // progress bar
  if (fillW > 0) disp.fillRect(1, 47, fillW, 12, SH110X_WHITE);

  disp.display();
}

// ==================== Refresh all three OLEDs ====================
void refreshAll() {
  if (tcaSelect(0)) drawOne(disp1, "Rail 1", rail1Val);
  if (tcaSelect(1)) drawOne(disp2, "Rail 2", rail2Val);
  if (tcaSelect(2)) drawOne(disp3, "Rail 3", rail3Val);
}

// ==================== Encoder ISRs ====================
void IRAM_ATTR isrEnc1() {
  uint8_t s = (digitalRead(ENC1_A) << 1) | digitalRead(ENC1_B);
  encState[0] = ((encState[0] << 2) | s) & 0x0F;
  int8_t d = KNOB_DIR[encState[0]];
  if (d) encDelta[0] += d;
}
void IRAM_ATTR isrEnc2() {
  uint8_t s = (digitalRead(ENC2_A) << 1) | digitalRead(ENC2_B);
  encState[1] = ((encState[1] << 2) | s) & 0x0F;
  int8_t d = KNOB_DIR[encState[1]];
  if (d) encDelta[1] += d;
}
void IRAM_ATTR isrEnc3() {
  uint8_t s = (digitalRead(ENC3_A) << 1) | digitalRead(ENC3_B);
  encState[2] = ((encState[2] << 2) | s) & 0x0F;
  int8_t d = KNOB_DIR[encState[2]];
  if (d) encDelta[2] += d;
}

// ==================== Update A4988 target ====================
void updateMotorTarget() {
  targetStep = map(rail1Val, 0, 100, 0, MAX_MOTOR_STEPS);
}

// ==================== Non-blocking stepper control ====================
void updateMotor() {
  if (currentStep == targetStep) return;

  unsigned long now = micros();
  if (now - lastStepMicros < STEP_INTERVAL_US) return;
  lastStepMicros = now;

  // direction
  if (targetStep > currentStep) digitalWrite(A4988_DIR, HIGH);
  else                          digitalWrite(A4988_DIR, LOW);

  // STEP pulse
  digitalWrite(A4988_STEP, HIGH);
  delayMicroseconds(3);
  digitalWrite(A4988_STEP, LOW);

  // update software position
  if (targetStep > currentStep) currentStep++;
  else                          currentStep--;
}

// ==================== Handle encoders ====================
void handleEncoders() {
  int8_t d[3];
  noInterrupts();
  d[0] = encDelta[0]; encDelta[0] = 0;
  d[1] = encDelta[1]; encDelta[1] = 0;
  d[2] = encDelta[2]; encDelta[2] = 0;
  interrupts();

  bool changed = false;

  // -------------------- Rail 1 --------------------
  if (d[0] != 0) {
    rail1Val = constrain(rail1Val + d[0], 0, 100);
    updateMotorTarget();
    changed = true;
  }

  // -------------------- Rail 2 --------------------
  if (d[1] != 0) {
    rail2Val = constrain(rail2Val + d[1], 0, 100);
    changed = true;
  }

  // -------------------- Rail 3 --------------------
  if (d[2] != 0) {
    rail3Val = constrain(rail3Val + d[2], 0, 100);
    changed = true;
  }

  if (changed) refreshAll();
}

// ==================== HTTP root ====================
void handleRoot() {
  server.send_P(200, "text/html; charset=utf-8", htmlPage);
}

// ==================== HTTP rail ====================
void handleRail() {
  if (server.hasArg("value")) {
    String val = server.arg("value");
    int p1 = val.indexOf(',');
    int p2 = val.indexOf(',', p1 + 1);
    if (p1 > 0 && p2 > p1) {
      rail1Val = constrain(val.substring(0, p1).toInt(), 0, 100);
      rail2Val = constrain(val.substring(p1 + 1, p2).toInt(), 0, 100);
      rail3Val = constrain(val.substring(p2 + 1).toInt(), 0, 100);
      updateMotorTarget();
      refreshAll();
    }
  }
  server.send(200, "text/plain", "OK");
}

// ==================== HTTP get ====================
void handleGet() {
  char buf[100];
  snprintf(buf, sizeof(buf),
    "{\"r1\":%d,\"r2\":%d,\"r3\":%d,\"currentStep\":%ld,\"targetStep\":%ld}",
    rail1Val, rail2Val, rail3Val, currentStep, targetStep);
  server.send(200, "application/json", buf);
}

// ==================== Setup ====================
void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("\n=== ESP32 Rail Controller ===");

  // --- A4988 GPIO ---
  pinMode(A4988_DIR, OUTPUT);
  pinMode(A4988_STEP, OUTPUT);
  digitalWrite(A4988_DIR, LOW);
  digitalWrite(A4988_STEP, LOW);
  Serial.println("A4988 GPIO initialized.");

  // --- I2C ---
  Wire.begin(SDA_PIN, SCL_PIN);
  Wire.setClock(100000);
  delay(100);

  // --- OLED self-test ---
  Adafruit_SH1106G* disps[3] = { &disp1, &disp2, &disp3 };
  for (int ch = 0; ch < 3; ch++) {
    if (!tcaSelect(ch)) {
      Serial.printf("!! tcaSelect(%d) FAIL\n", ch);
      continue;
    }
    delay(20);
    if (!disps[ch]->begin(0x3C, true)) {
      Serial.printf("!! OLED %d begin FAIL\n", ch + 1);
    } else {
      Serial.printf("OK OLED %d\n", ch + 1);
      // self-test: big number
      disps[ch]->clearDisplay();
      disps[ch]->setTextSize(5);
      disps[ch]->setTextColor(SH110X_WHITE);
      char num[2] = { (char)('1' + ch), 0 };
      disps[ch]->setCursor(50, 12);
      disps[ch]->print(num);
      disps[ch]->display();
    }
  }

  delay(800);

  // --- Encoders ---
  const uint8_t aPin[3] = {ENC1_A, ENC2_A, ENC3_A};
  const uint8_t bPin[3] = {ENC1_B, ENC2_B, ENC3_B};
  for (int i = 0; i < 3; i++) {
    pinMode(aPin[i], INPUT_PULLUP);
    pinMode(bPin[i], INPUT_PULLUP);
    encState[i] = (digitalRead(aPin[i]) << 1) | digitalRead(bPin[i]);
  }
  attachInterrupt(digitalPinToInterrupt(ENC1_A), isrEnc1, CHANGE);
  attachInterrupt(digitalPinToInterrupt(ENC1_B), isrEnc1, CHANGE);
  attachInterrupt(digitalPinToInterrupt(ENC2_A), isrEnc2, CHANGE);
  attachInterrupt(digitalPinToInterrupt(ENC2_B), isrEnc2, CHANGE);
  attachInterrupt(digitalPinToInterrupt(ENC3_A), isrEnc3, CHANGE);
  attachInterrupt(digitalPinToInterrupt(ENC3_B), isrEnc3, CHANGE);

  // --- First frame ---
  refreshAll();

  // --- WiFi ---
  WiFi.mode(WIFI_STA);
  WiFi.setSleep(false);                  // keep WiFi from interfering with I2C
  WiFi.setTxPower(WIFI_POWER_11dBm);     // keep the TX spike from resetting the board
  Serial.printf("Connecting to %s ", ssid);
  WiFi.begin(ssid, password);
  uint32_t t0 = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - t0 < 20000) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("WiFi OK. IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("WiFi failed");
  }

  delay(300);
  refreshAll();   // refresh once more after WiFi settles

  // --- HTTP routes ---
  server.on("/", handleRoot);
  server.on("/rail", handleRail);
  server.on("/get", handleGet);
  server.begin();
  Serial.println("HTTP server on port 80");
  Serial.println("Ready.");
  Serial.println();
  Serial.println("Rail 1 controls A4988.");
  Serial.println("Rail 1 = 0   -> 0 step");
  Serial.println("Rail 1 = 100 -> 1000 step");
}

// ==================== Loop ====================
uint32_t lastRefresh = 0;

void loop() {
  server.handleClient();   // WiFi
  handleEncoders();        // three knobs
  updateMotor();           // A4988

  // refresh OLEDs every 3 seconds (against display drift)
  if (millis() - lastRefresh > 3000) {
    lastRefresh = millis();
    refreshAll();
  }

  delay(1);
}
```
