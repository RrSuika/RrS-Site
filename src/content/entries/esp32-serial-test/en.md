---
title: ESP32 Serial Output Test
date: 2026-07-20
description: "ESP32 microcontroller verification: uploading a sketch and confirming serial communication over USB."

type: lab
category: Embedded System
cover: cover.png

tags:
  - ESP32
  - Serial Communication
  - Getting Started

tools:
  - ESP32
  - Arduino IDE
  - USB Cable

featured: false

lang: en

translationKey: esp32-serial-test
---

# Purpose

Before diving into anything more ambitious, I needed to make sure the ESP32 board actually worked: that I could flash it, talk to it over USB, and see output from a running program. It's the kind of sanity check that saves you hours of debugging later. If serial communication isn't working, nothing downstream will either.

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

Nothing fancy here: just initialising the serial port at 115200 baud and printing a heartbeat every second. If this shows up in the Serial Monitor, I know the board is alive, the USB-to-UART bridge works, and the Arduino IDE can talk to it properly.

# Test Steps

1. Select the ESP32 board and corresponding COM port in Arduino IDE.
2. Connect the ESP32 via USB and upload the code.
3. When `Connecting......` appears, press the IO0 button on the ESP32 to enter flash mode.
4. After uploading, open the Serial Monitor and set the baud rate to **115200**.

The IO0 button step caught me the first time: the ESP32 won't enter flash mode automatically on every board, so you have to hold or tap IO0 when the IDE says "Connecting." If you miss the window, the upload just times out and you try again. Classic ESP32 quirk.

# Result

The Serial Monitor continuously outputs:

```
ESP32 OK
ESP32 OK
ESP32 OK
```

Everything checks out. The board takes a sketch, the sketch runs, and I can see the output. On to the next thing.
