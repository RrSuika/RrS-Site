---
title: ESP32 + multi-OLED + encoder HSV-besturingssysteem
date: 2026-09-14
description: "Drie OLED + encoder-modules op één I2C-bus via een TCA9548A, tweezijdig gesynchroniseerd met een WiFi-webpagina: de HSV-tests."

type: lab
category: Embedded systeem
cover: 01-hardware.jpeg

tags:
  - ESP32
  - WiFi
  - OLED
  - EC11-encoder
  - HSV
  - TCA9548A
  - Webserver

tools:
  - ESP32
  - TCA9548A I2C-multiplexer
  - SH1106 1.3" OLED + EC11-module ×3
  - 5V 2A-voeding
  - Webserver

featured: true

lang: nl

translationKey: esp32-multi-oled-encoder-hsv
---

![Hardware-opstelling](./01-hardware.jpeg)

# Wat ik heb gebouwd

Dit was een vrij belangrijke test: de multiplexer scheelt flink wat pinnen, waardoor een tekort aan GPIO's geen probleem meer is. Het eerste prototype bewees dat één ESP32 twee encoders en twee OLED's tegelijk aankan. Deze keer ging ik van twee naar drie modules, en in plaats van kale hoeken kreeg elke module een echte taak: H, S en V. Eén ESP32, één TCA9548A, drie SH1106-OLED's en drie EC11-encoders, plus een WiFi-webpagina die de kleur live voorvertoont en met de knoppen meesynchroniseert in beide richtingen.

Het systeem doet vier dingen:

1. **Drie OLED's tonen elk één HSV-kanaal**: Hue (H), Saturation (S) en Value (V), elk met een voortgangsbalk in de actuele kleur.
2. **Drie encoders regelen de drie kanalen**: aan de knop draaien en waarde plus balk bewegen mee.
3. **Een webpagina geeft de kleur live weer** en synchroniseert met de hardware in beide richtingen.
4. **Een kant-en-klare hook voor NeoPixel later**: het refresh-pad is zo gebouwd dat een LED-strip aan dezelfde HSV-state kan hangen.

Drie problemen maakten het interessant:

1. **Alle drie de OLED's delen I2C-adres 0x3C**, dus parallel op de bus kan niet zomaar.
2. **Drie encoders kosten zes GPIO's**, en ik wilde het pinbudget beheersbaar houden.
3. **WiFi-RF stoort op I2C**, en de stroompiek bij zenden kan de board resetten.

# Hardware

| Component | Aantal | Opmerkingen |
|---|---|---|
| ESP32-devboard | 1 | ESP32-D0WD-V3 |
| TCA9548A I2C-multiplexer | 1 | Standaardadres 0x70 |
| 1.3" OLED + EC11-module | 3 | Driverchip is SH1106, geen SSD1306 |
| Dupont-draden | een handvol | Kort en dik wint van lang en dun |
| 5V 2A-voeding | 1 | Niet voeden vanaf een PC-USB-poort |

> Let op: 1.3" OLED's zijn vrijwel altijd SH1106, alleen de 0.96"-versies zijn SSD1306. Verkeerde library betekent een wit scherm met af en toe een zwarte regel.

# Bedrading

## De OLED + EC11-module (9 pinnen, twee groepen)

OLED-zijde (4 pinnen, I2C):

| Opschrift | Betekenis | Aansluiting |
|---|---|---|
| VCC | Voeding | 3.3V |
| GND | Massa | GND |
| SDA | I2C-data | via TCA9548A-kanaal |
| SCL | I2C-klok | via TCA9548A-kanaal |

Encoder-zijde (5 pinnen, mechanische schakelaar):

| Opschrift | Betekenis | Aansluiting |
|---|---|---|
| TRA | Fase A | ESP32-GPIO |
| TRB | Fase B | ESP32-GPIO |
| CON | Common | Module trekt hem intern omhoog, mag los |
| PSH | Knopzijde 1 | Los als ongebruikt |
| BAK | Knopzijde 2 | Los als ongebruikt |

> Mijn modules trekken CON/BAK intern omhoog naar 3.3V, dus er hoeft niets aangesloten te worden. Reageert die van jou niet met losse CON, leg CON dan aan GND.

## ESP32 naar TCA9548A

| ESP32 | TCA9548A | Opmerkingen |
|---|---|---|
| GPIO 21 | SDA | Hoofd-I2C-data |
| GPIO 22 | SCL | Hoofd-I2C-klok |
| 3.3V | VIN | Voeding |
| GND | GND | Gedeelde massa |
| los | RST | Mag los, bij mij hangt hij los |

> Over RST: active-low reset. De meeste modules hebben een interne pull-up, dus los laten werkt. Hij heeft hier de hele tijd los gehangen, zonder problemen.

## TCA9548A naar de drie OLED's

| Module | OLED SDA | OLED SCL |
|---|---|---|
| 1 | SD0 | SC0 |
| 2 | SD1 | SC1 |
| 3 | SD2 | SC2 |

Elke module: VCC naar 3.3V, GND naar GND.

## ESP32 naar de drie encoders

| Module | TRA | TRB | CON | PSH | BAK |
|---|---|---|---|---|---|
| 1 | GPIO 25 | GPIO 18 | los | los | los |
| 2 | GPIO 26 | GPIO 27 | los | los | los |
| 3 | GPIO 4 | GPIO 16 | los | los | los |

## Pinbudget

| Doel | GPIO's | Aantal |
|---|---|---|
| I2C (SDA/SCL) | 21, 22 | 2 |
| Encoder module 1 | TRA→GPIO 25, TRB→GPIO 18 | 2 |
| Encoder module 2 | TRA→GPIO 26, TRB→GPIO 27 | 2 |
| Encoder module 3 | TRA→GPIO 4, TRB→GPIO 16 | 2 |
| Totaal | | 8 |

Elke extra module kost twee GPIO's (TRA, TRB). Die rekensom klopte prima.

# De TCA9548A-truc

Alle drie de OLED's antwoorden op 0x3C, dus parallel aansluiten geeft drie schermen die hetzelfde frame tonen. De TCA9548A vertakt één I2C-bus naar 8 kanalen, en je kiest het actieve kanaal door een bitmask naar adres 0x70 te schrijven:

```cpp
Wire.beginTransmission(0x70);
Wire.write(1 << channel);  // kanaal `channel` inschakelen
Wire.endTransmission();
```

Er geleidt maar één kanaal tegelijk, dus de drie 0x3C-OLED's zien elkaar nooit.

De encoders gaan bewust niet door de multiplexer: een EC11 is een mechanische schakelaar die kale niveaus uitstuurt, geen I2C-device. De TCA9548A stuurt alleen SDA/SCL door, dus TRA/TRB gaan rechtstreeks naar ESP32-GPIO's. Wie echt pinnen wil besparen, verhuist ze naar een ander soort module, een I2C GPIO-expander zoals de MCP23017. Maar elke module kost maar 2 GPIO's en drie modules maar 6, en die heeft de ESP32 ruim liggen, dus een MCP23017 verdient pas boven de 5 modules zijn plek.

# Encoderdecodering

Een EC11 geeft Gray-code op A/B: 11 → 10 → 00 → 01 → 11. Mechanische contacten stuiteren, en een simpele lookuptabel laat stappen vallen of verdubbelt ze. De Ben Buxton-state machine houdt 4 bits historie bij en telt per overgang richting op via een tabel met 16 waarden:

```cpp
static const int8_t KNOB_DIR[16] = {
   0, -1,  1,  0,
   1,  0,  0, -1,
  -1,  0,  0,  1,
   0,  1, -1,  0
};

void IRAM_ATTR isrEnc1() {
  uint8_t s = (digitalRead(ENC1_A) << 1) | digitalRead(ENC1_B);
  encState[0] = ((encState[0] << 2) | s) & 0x0F;
  int8_t d = KNOB_DIR[encState[0]];
  if (d) encDelta[0] += d;
}
```

Het stuiteren was daarna grotendeels weg.

# Websynchronisatie

![Webpagina](./02-web-view.png)

De pagina heeft drie sliders en een live kleurvoorbeeld, inclusief donker/licht-schakelaar, want op een lichte pagina ziet het voorbeeld er niet uit.

- **Hardware → web**: de pagina pollt elke 400ms GET /get en raakt de sliders alleen aan als de waarden echt verschillen.
- **Web → hardware**: elke slider-input vuurt GET /hsv?value=h,s,v, en de ESP32 ververst meteen alle drie de OLED's.
- **Conflictpreventie**: de pagina onthoudt lastInteraction en slaat 800ms na gebruikersinput het pollen over, zodat een poll nooit door een lopende drag heen prikt.

# De bugs

## Bug 1: 1.3" OLED's zijn SH1106, geen SSD1306

**Symptoom**: scherm grotendeels wit, af en toe flitst er één regel zwarte tekst.

**Oorzaak**: het RAM van de SH1106 is 132 kolommen breed. Een SSD1306-library schrijft 128 kolommen en het hele frame komt verschoven binnen.

**Oplossing**: de Adafruit_SH110X-library en een Adafruit_SH1106G-object:

```cpp
#include <Adafruit_SH110X.h>
Adafruit_SH1106G disp(128, 64, &Wire, -1);
disp.begin(0x3C, true);   // true = de module heeft een eigen resetcircuit
```

## Bug 2: zendpiek van WiFi reset de board

**Symptoom**: de seriële poort meldt rst:0x1 (POWERON_RESET), telkens 1-2 seconden nadat WiFi start.

**Oorzaak**: WiFi-zenden piekt rond de 500mA. Met drie OLED's erbij kan de AMS1117-regulator op de board dat transiënt niet bijbenen.

**Oplossingen, op volgorde van prioriteit**:

1. Zendvermogen verlagen (het effectiefst, kost niets):
   ```cpp
   WiFi.setTxPower(WIFI_POWER_11dBm);
   ```
   11dBm is ruim genoeg voor een router een paar meter verderop.
2. Voeden uit een 5V 2A-lader, nooit uit een PC-USB-poort.
3. Een elco van 470µF-1000µF over 3.3V en GND om de pieken op te vangen.
4. De drie OLED's uit een eigen 3.3V-rail voeden, met gedeelde GND.

## Bug 3: WiFi-RF-interrupts breken I2C

**Symptoom**: zodra WiFi verbindt, stoppen de OLED's met verversen, reageren de encoders niet meer en doet de webpagina niets.

**Oorzaak**: de ESP32 zet WiFi standaard in power-save. De RF-interrupts hakken dwars door de I2C-timing heen.

**Oplossing**:

```cpp
WiFi.setSleep(false);   // WiFi power-save uitzetten
```

## Bug 4: de RST-pin van de TCA9548A

RST is active-low reset. De meeste modules trekken hem intern omhoog, dus los laten is prima, en zo heeft hij hier de hele tijd gedraaid, volledig stabiel.

Doet de TCA9548A raar, check dan eerst de gebruikelijke verdachten: SDA/SCL omgewisseld, een losse dupont-draad, een draad waar iemand tegenaan is gelopen.

## Bug 5: contact van encoderfase A versleten

**Symptoom**: module 1 springt tussen 0 en 359, netto delta nul. Modules 2 en 3 doen het normaal.

**Oorzaak**: het A- of B-contact van de EC11 is fysiek versleten. Met nog maar één fase die schakelt, registreert de state machine +1 en daarna -1, en de som valt weg.

**Diagnose**:

1. Flash een mini-sketch die alleen de A/B-niveaus print.
2. Draai aan de knop en check of beide fases 0/1 schakelen.
3. Schakelt er maar één, wissel dan de A/B-draden om.
4. Verhuist het probleem met de encoder mee, dan is de encoder dood. Verhuist het met de GPIO mee, dan is de GPIO of de draad het.

**Oplossing**: een reservemodule erin. Module 1 heeft dat uiteindelijk gekregen.

# Resultaat

Seriële output bij het opstarten:

```
=== ESP32 HSV Controller (final) ===
OK OLED 1
OK OLED 2
OK OLED 3
Connecting to MyWiFi .....
WiFi OK. IP: 192.168.1.254
HTTP server on port 80
Ready.
```

Elke OLED toont de kanaalnaam, de actuele waarde en een voortgangsbalk in de kleur van de huidige HSV-waarde, alle drie de balken in dezelfde kleur. Interacties:

| Actie | Effect |
|---|---|
| Encoder 1 draaien | H verandert, OLED 1 en de webpagina volgen |
| Encoder 2 draaien | S verandert |
| Encoder 3 draaien | V verandert |
| Een webslider slepen | Alle drie de OLED's verversen tegelijk |
| Pagina pollt elke 400ms | Encoderwijzigingen verschijnen vanzelf op de pagina |

# Opschalen

| Modules | Aanpak |
|---|---|
| 1-5 | Rechtstreeks op GPIO's, het simpelst |
| 6-8 | TCA9548A met alle 8 kanalen + 12 GPIO's |
| 8+ | Een MCP23017 (16 GPIO's over I2C) of een tweede TCA9548A |

De NeoPixel-hook: voeg in refreshAll() een call toe die de huidige HSV omzet naar RGB888 en naar de strip duwt.

```cpp
#include <Adafruit_NeoPixel.h>

Adafruit_NeoPixel strip(LED_COUNT, LED_PIN, NEO_GRB + NEO_KHZ800);

void updateStrip() {
  uint8_t r, g, b;
  hsvToRgb888(hVal, sVal, vVal, r, g, b);
  for (int i = 0; i < LED_COUNT; i++) {
    strip.setPixelColor(i, strip.Color(r, g, b));
  }
  strip.show();
}
```

De webpagina en de encoderpaden veranderen helemaal niet.

# Volledige code

Libraries: Adafruit SH110X, Adafruit GFX Library, Adafruit BusIO (wordt automatisch geïnstalleerd). Board: ESP32 Dev Module.

```cpp
/*
 * ESP32 + TCA9548A + 3x (OLED + EC11) + WiFi web sync
 * Final version
 */

#include <WiFi.h>
#include <WebServer.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SH110X.h>

// ==================== WiFi config ====================
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

// ==================== OLED ====================
Adafruit_SH1106G disp1(128, 64, &Wire, -1);
Adafruit_SH1106G disp2(128, 64, &Wire, -1);
Adafruit_SH1106G disp3(128, 64, &Wire, -1);

WebServer server(80);

// ==================== HSV state ====================
int hVal = 0;
int sVal = 100;
int vVal = 100;

// ==================== Encoder state machine ====================
static const int8_t KNOB_DIR[16] = {
   0, -1,  1,  0,
   1,  0,  0, -1,
  -1,  0,  0,  1,
   0,  1, -1,  0
};

volatile uint8_t encState[3] = {0, 0, 0};
volatile int8_t  encDelta[3] = {0, 0, 0};

// ==================== Web page HTML ====================
const char htmlPage[] PROGMEM = R"rawliteral(
<!DOCTYPE html>
<html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0,user-scalable=yes">
<title>HSV Controller</title>
<style>
:root{--bg:#000;--text:#f5f5f7;--card-bg:rgba(28,28,30,0.65);--slider-track:#3a3a3c;--slider-thumb:#0a84ff;--border:rgba(255,255,255,0.15);--shadow:rgba(0,0,0,0.5);}
body.light{--bg:#f2f2f7;--text:#1c1c1e;--card-bg:rgba(255,255,255,0.7);--slider-track:#c7c7cc;--slider-thumb:#007aff;--border:rgba(0,0,0,0.1);--shadow:rgba(0,0,0,0.08);}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:var(--bg);color:var(--text);margin:0;padding:20px;display:flex;justify-content:center;align-items:center;min-height:100vh;transition:background-color .3s ease,color .3s ease;}
.container{width:100%;max-width:480px;background:var(--card-bg);backdrop-filter:blur(30px);-webkit-backdrop-filter:blur(30px);border-radius:32px;padding:30px 28px;box-shadow:0 20px 50px var(--shadow);border:1px solid var(--border);}
.color-preview{width:100%;height:130px;border-radius:20px;margin-bottom:24px;box-shadow:0 10px 30px rgba(0,0,0,.35);transition:background .12s linear;border:1px solid var(--border);}
.header{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;}
h1{font-size:22px;font-weight:600;margin:0;letter-spacing:-.4px;}
.theme-toggle{background:rgba(255,255,255,.15);border:none;border-radius:50%;width:42px;height:42px;font-size:18px;cursor:pointer;color:var(--text);display:flex;align-items:center;justify-content:center;transition:transform .2s;}
.theme-toggle:hover{transform:scale(1.08);}
.slider-group{margin:16px 0;}
.slider-group label{display:flex;align-items:center;justify-content:space-between;font-size:15px;font-weight:500;gap:8px;}
.slider-group span{min-width:60px;text-align:right;font-weight:600;font-variant-numeric:tabular-nums;}
input[type="range"]{-webkit-appearance:none;appearance:none;width:100%;height:6px;border-radius:3px;background:var(--slider-track);outline:none;margin:8px 0;}
input[type="range"]::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:24px;height:24px;border-radius:50%;background:var(--slider-thumb);border:2px solid rgba(255,255,255,.3);cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,.3);}
input[type="range"]::-moz-range-thumb{width:22px;height:22px;border-radius:50%;background:var(--slider-thumb);border:2px solid rgba(255,255,255,.3);cursor:pointer;}
.info{margin-top:20px;font-size:13px;opacity:.75;text-align:center;font-weight:500;line-height:1.6;}
.status-dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:#30d158;margin-right:6px;vertical-align:middle;animation:pulse 2s infinite;}
@keyframes pulse{0%,100%{opacity:1;}50%{opacity:.4;}}
</style></head>
<body class="dark">
<div class="container">
<div class="header"><h1>HSV Control</h1><button class="theme-toggle" id="theme-toggle">☀️</button></div>
<div class="color-preview" id="preview"></div>
<div class="slider-group"><label>Hue <input id="h" type="range" min="0" max="360" value="0"><span id="h-val">0°</span></label></div>
<div class="slider-group"><label>Saturation <input id="s" type="range" min="0" max="100" value="100"><span id="s-val">100%</span></label></div>
<div class="slider-group"><label>Value <input id="v" type="range" min="0" max="100" value="100"><span id="v-val">100%</span></label></div>
<div class="info" id="info"><span class="status-dot"></span>RGB: 255,0,0</div>
</div>
<script>
let H=0,S=100,V=100,lastInteraction=0;
const preview=document.getElementById('preview'),info=document.getElementById('info');
const elH=document.getElementById('h'),elS=document.getElementById('s'),elV=document.getElementById('v');
const elHv=document.getElementById('h-val'),elSv=document.getElementById('s-val'),elVv=document.getElementById('v-val');
function hsvToRgb(h,s,v){s/=100;v/=100;let c=v*s,x=c*(1-Math.abs((h/60)%2-1)),m=v-c,r=0,g=0,b=0;if(h<60){r=c;g=x;}else if(h<120){r=x;g=c;}else if(h<180){g=c;b=x;}else if(h<240){g=x;b=c;}else if(h<300){r=x;b=c;}else{r=c;b=x;}return[Math.round((r+m)*255),Math.round((g+m)*255),Math.round((b+m)*255)];}
function updateUI(){const rgb=hsvToRgb(H,S,V);preview.style.background='rgb('+rgb[0]+','+rgb[1]+','+rgb[2]+')';info.innerHTML='<span class="status-dot"></span>RGB: '+rgb.join(',')+' &nbsp;|&nbsp; HSV: '+Math.round(H)+'°, '+S+'%, '+V+'%';if(document.activeElement!==elH)elH.value=H;if(document.activeElement!==elS)elS.value=S;if(document.activeElement!==elV)elV.value=V;elHv.textContent=Math.round(H)+'°';elSv.textContent=S+'%';elVv.textContent=V+'%';}
function sendHSV(){lastInteraction=Date.now();fetch('/hsv?value='+Math.round(H)+','+Math.round(S)+','+Math.round(V)).catch(()=>{});}
elH.addEventListener('input',function(){H=Number(this.value)%360;updateUI();sendHSV();});
elS.addEventListener('input',function(){S=Number(this.value);updateUI();sendHSV();});
elV.addEventListener('input',function(){V=Number(this.value);updateUI();sendHSV();});
setInterval(function(){if(Date.now()-lastInteraction<800)return;fetch('/get').then(r=>r.json()).then(d=>{if(d.h!==Math.round(H)||d.s!==S||d.v!==V){H=d.h;S=d.s;V=d.v;updateUI();}}).catch(()=>{});},400);
const themeToggle=document.getElementById('theme-toggle');const body=document.body;const savedTheme=localStorage.getItem('theme');
if(savedTheme==='light'){body.classList.remove('dark');body.classList.add('light');themeToggle.innerHTML='🌙';}
themeToggle.addEventListener('click',function(){if(body.classList.contains('dark')){body.classList.remove('dark');body.classList.add('light');themeToggle.innerHTML='🌙';localStorage.setItem('theme','light');}else{body.classList.remove('light');body.classList.add('dark');themeToggle.innerHTML='☀️';localStorage.setItem('theme','dark');}});
updateUI();
</script></body></html>
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

// ==================== HSV to RGB565 ====================
uint16_t hsvToRgb565(int h, int s, int v) {
  float sf = s / 100.0f, vf = v / 100.0f, hf = h / 60.0f;
  int i = (int)hf; float f = hf - i;
  float p = vf * (1 - sf);
  float q = vf * (1 - sf * f);
  float t = vf * (1 - sf * (1 - f));
  float r, g, b;
  switch (i % 6) {
    case 0: r=vf; g=t;  b=p;  break;
    case 1: r=q;  g=vf; b=p;  break;
    case 2: r=p;  g=vf; b=t;  break;
    case 3: r=p;  g=q;  b=vf; break;
    case 4: r=t;  g=p;  b=vf; break;
    case 5: r=vf; g=p;  b=q;  break;
    default: r=g=b=0;
  }
  return ((uint16_t)(r*31)<<11) | ((uint16_t)(g*63)<<5) | (uint16_t)(b*31);
}

// ==================== Draw one OLED ====================
void drawOne(Adafruit_SH1106G &disp, const char* label, int value,
             int maxVal, uint16_t barColor) {
  disp.clearDisplay();
  disp.setTextSize(1);
  disp.setTextColor(SH110X_WHITE);
  disp.setCursor(0, 0);
  disp.print(label);

  disp.setTextSize(2);
  disp.setCursor(0, 14);
  disp.print(value);
  disp.print(maxVal == 359 ? " deg" : " %");

  disp.drawRect(0, 46, 128, 14, SH110X_WHITE);
  int fillW = map(value, 0, maxVal, 0, 126);
  if (fillW > 0) disp.fillRect(1, 47, fillW, 12, barColor);

  disp.display();
}

void refreshAll() {
  uint16_t color = hsvToRgb565(hVal, sVal, vVal);
  if (tcaSelect(0)) drawOne(disp1, "Hue (H)", hVal, 359, color);
  if (tcaSelect(1)) drawOne(disp2, "Saturation (S)", sVal, 100, color);
  if (tcaSelect(2)) drawOne(disp3, "Value (V)", vVal, 100, color);
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

// ==================== Handle encoders ====================
void handleEncoders() {
  int8_t d[3];
  noInterrupts();
  d[0] = encDelta[0]; encDelta[0] = 0;
  d[1] = encDelta[1]; encDelta[1] = 0;
  d[2] = encDelta[2]; encDelta[2] = 0;
  interrupts();

  bool changed = false;
  if (d[0] != 0) {
    hVal = (hVal + d[0] + 360) % 360;
    changed = true;
  }
  if (d[1] != 0) {
    sVal = constrain(sVal + d[1], 0, 100);
    changed = true;
  }
  if (d[2] != 0) {
    vVal = constrain(vVal + d[2], 0, 100);
    changed = true;
  }
  if (changed) refreshAll();
}

// ==================== HTTP handlers ====================
void handleRoot() {
  server.send_P(200, "text/html; charset=utf-8", htmlPage);
}

void handleHSV() {
  if (server.hasArg("value")) {
    String val = server.arg("value");
    int p1 = val.indexOf(',');
    int p2 = val.indexOf(',', p1 + 1);
    if (p1 > 0 && p2 > p1) {
      hVal = constrain(val.substring(0, p1).toInt(), 0, 359);
      sVal = constrain(val.substring(p1 + 1, p2).toInt(), 0, 100);
      vVal = constrain(val.substring(p2 + 1).toInt(), 0, 100);
      refreshAll();
    }
  }
  server.send(200, "text/plain", "OK");
}

void handleGet() {
  char buf[64];
  snprintf(buf, sizeof(buf), "{\"h\":%d,\"s\":%d,\"v\":%d}", hVal, sVal, vVal);
  server.send(200, "application/json", buf);
}

// ==================== Setup ====================
void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("\n=== ESP32 HSV Controller (final) ===");

  Wire.begin(SDA_PIN, SCL_PIN);
  Wire.setClock(100000);
  delay(100);

  // --- Init the three OLEDs ---
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
      // Self-test: show a big number
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

  // --- Three encoders ---
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

  // --- First real frame ---
  refreshAll();

  // --- Start WiFi ---
  WiFi.mode(WIFI_STA);
  WiFi.setSleep(false);                 // keep WiFi from interfering with I2C
  WiFi.setTxPower(WIFI_POWER_11dBm);    // keep the current spike from resetting the board
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
  server.on("/",    handleRoot);
  server.on("/hsv", handleHSV);
  server.on("/get", handleGet);
  server.begin();
  Serial.println("HTTP server on port 80");
  Serial.println("Ready.");
}

// ==================== Loop ====================
uint32_t lastRefresh = 0;

void loop() {
  server.handleClient();
  handleEncoders();

  // Force a full refresh every 3 seconds (against display drift)
  if (millis() - lastRefresh > 3000) {
    lastRefresh = millis();
    refreshAll();
  }

  delay(3);
}
```
