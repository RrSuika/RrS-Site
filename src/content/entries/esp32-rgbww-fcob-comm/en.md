---
title: ESP32 + RGBWW FCOB LED Communication
date: 2026-08-02
description: "NeoPixelBus communication test with RGBWW FCOB LED strip: channel cycling and protocol verification."

type: lab
category: Embedded System
cover: 01-fcob-setup.png

tags:
  - ESP32
  - NeoPixel

tools:
  - ESP32
  - RGBWW FCOB LED Strip
  - NeoPixelBus Library

featured: false

lang: en

translationKey: esp32-rgbww-fcob-comm
---

![FCOB LED Setup](./01-fcob-setup.png)

# Purpose

Before I could do anything interesting with the FCOB strip, I needed to confirm the basics: that the ESP32 could talk to it, that the data line was connected to the right pin, and that I understood the colour channel order. FCOB strips are a bit different from regular addressable LEDs: they use a continuous phosphor coating instead of discrete beads, which gives you a much smoother, more even light. But the communication protocol is the same NeoPixel/WS2812-style one-wire interface, so the software side is familiar territory.

# Code

```cpp
#include <NeoPixelBus.h>

#define LED_PIN 5
// Assume 150 control points for now
#define LED_COUNT 150

NeoPixelBus<NeoGrbwFeature, NeoEsp32Rmt0800KbpsMethod> strip(LED_COUNT, LED_PIN);

void setup() {
  strip.Begin();
  strip.Show();
}

void loop() {
  // Red
  for (int i = 0; i < LED_COUNT; i++) {
    strip.SetPixelColor(i, RgbwColor(255, 0, 0, 0));
  }
  strip.Show();
  delay(2000);

  // Green
  for (int i = 0; i < LED_COUNT; i++) {
    strip.SetPixelColor(i, RgbwColor(0, 255, 0, 0));
  }
  strip.Show();
  delay(2000);

  // Blue
  for (int i = 0; i < LED_COUNT; i++) {
    strip.SetPixelColor(i, RgbwColor(0, 0, 255, 0));
  }
  strip.Show();
  delay(2000);

  // White (WW channel)
  for (int i = 0; i < LED_COUNT; i++) {
    strip.SetPixelColor(i, RgbwColor(0, 0, 0, 255));
  }
  strip.Show();
  delay(2000);
}
```

I hard-coded 150 LEDs as a placeholder: I didn't actually know the exact control point count on this strip yet (that came later). For a comms test it doesn't matter; you just need a number high enough to cover the whole strip. The important things to verify here were the `NeoGrbwFeature` colour order (the library expects Red, White, Green, Blue: not the usual R, G, B, W) and the `NeoEsp32Rmt0800KbpsMethod`, which uses the ESP32's RMT peripheral for stable timing at 800 kbps. If you get the feature type or the pin number wrong, nothing lights up, or worse, you get random colours that make you question your wiring for an hour.

# Result

The FCOB LED strip cycles through red, green, blue, and warm white in sequence. Communication between the ESP32 and the NeoPixel strip is stable, and all four colour channels (R, G, B, W) respond correctly.

Satisfying moment: the whole strip lights up in a clean, uniform colour, no flickering, no glitches. The RMT-based method on the ESP32 handles the tight timing requirements of the WS2812 protocol without breaking a sweat. With the comms confirmed, I could move on to building an actual colour control interface.
