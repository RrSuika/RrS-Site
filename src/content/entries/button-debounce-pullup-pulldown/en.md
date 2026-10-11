---
title: "Button Input: Debounce & Pull-Up/Down Resistors"
date: 2026-08-10
description: "Why a button needs a pull-up or pull-down at all, what a floating pin does to an MCU input, how to debounce in hardware and software, and why industrial products end up on pull-up."

type: note
category: Electronics

tags:
  - Electronics
  - Input Design
  - Pull-Up Resistor
  - Debounce
  - Circuit Protection

tools:
  - Circuit Design
  - Embedded Development

featured: false

lang: en

translationKey: button-debounce-pullup-pulldown
---

![Pull-Up Basics](./01-pullup-basics.png)

[Article: Purpose and Principles of Pull-Up and Pull-Down Resistors: Zhihu](https://zhuanlan.zhihu.com/p/258321463)

# What a Button Actually Is

A button is a mechanical switch. All it does is connect or disconnect two metal contacts, which leaves the MCU with an electrical problem: the pin it is wired to has no defined level whenever the contacts are open. Not pressed: `── ──`, pressed: `──────`.

The MCU can't sense the button directly. It only reads voltage on a GPIO pin. So the whole chain is: mechanical action → GPIO voltage change → MCU reads voltage → firmware decides state. The button changes the circuit; the MCU reads the result.

## The Floating Problem

The simplest possible wiring: GPIO → Button → GND. Pressed = GPIO pulled to GND = LOW. That works. But when it's NOT pressed? The GPIO pin is connected to nothing. It floats. The voltage is undefined: anywhere between 0V and 3.3V, completely at the mercy of nearby electric fields and noise. The MCU reads random garbage.

This is why you need a pull resistor: it gives the GPIO a known default state.

## A Beginner's Mistake

Someone might think: `5V → GPIO → Button → GND`. When not pressed, GPIO sits at HIGH. Looks fine. And the moment you press the button, the wire and the switch are a dead short from 5V to ground: near-zero path resistance, so the only thing limiting the current is the supply itself. Before you even press it, 5V on a 3.3V pin is above the pin's absolute maximum (VDD + 0.3V), so the pin's clamp diode is already conducting into the 3.3V rail. At best you fry the IO pin. At worst, the whole chip.

Never do this.

## The Right Way

```
5V → 10kΩ resistor → GPIO + Button → GND
```

- **Not pressed**: 5V charges the GPIO pin through the 10kΩ resistor. GPIO input impedance is megohm-level (nearly an insulator), so it draws almost no current. Barely any voltage drops across the resistor: the pin sits at a solid HIGH.
- **Pressed**: GPIO gets shorted straight to ground = LOW. Current = 5V / 10kΩ = 0.5mA (the same circuit on a 3.3V rail draws 0.33mA, which is what the rest of this note uses). That's tiny: safe, efficient, and the pin gets pulled reliably to 0V.

This is "weak pull-up, strong pull-down" in action: the resistor's pull is weak enough that the button's direct short to ground easily overrides it, but strong enough to hold the pin HIGH when the button is open.

## Pull-Up vs Pull-Down

```
3.3V
│
10kΩ
│
●──── GPIO
│
│
Button closed
│
GND
```

Pull-up: resistor from VCC to GPIO. Default = HIGH, pressed = LOW (active-low).
Pull-down: resistor from GPIO to GND. Default = LOW, pressed = HIGH (active-high).

A resistor from power to GPIO is a pull-up: it clamps the pin HIGH by default. A resistor from GPIO to ground is a pull-down: it clamps the pin LOW. Both also limit current: without the resistor, pressing the button is a dead short.

![Pull-Up vs Pull-Down Comparison](./02-pullup-pulldown-comparison.png)

Key functions of pull resistors:

- They set a known default state, preventing floating and false triggers. At power-up, the pin level is uncertain: a pull-up guarantees it starts HIGH and won't glitch.
- On an open-drain or open-collector output, the pull-up is the only thing that can pull the line HIGH; the transistor can only pull it LOW.

## Why Not Wire GPIO Directly to 3.3V?

Same failure as A Beginner's Mistake above, just on 3.3V instead of 5V. In this circuit the current-limiting element is the pull resistor itself.

## Why 10kΩ?

Common pull resistor values: 4.7kΩ, 10kΩ, 22kΩ, 47kΩ.

- Lower resistance → stronger pull, better noise immunity, but more power burned
- Higher resistance → less power, but more susceptible to noise
- 10kΩ hits the sweet spot: 3.3V/10kΩ = 0.33mA, negligible power, reliable noise immunity.

Whether to pull up or down depends on the system. An active-high enable signal (EN) that should default to inactive → use pull-down. An active-low reset (RST#) that should default to inactive → use pull-up. For motor control, a floating pin could get noise-triggered to HIGH and spin the motor by accident: a pull-down locking the default to LOW is critical there.

Internal MCU pull resistors are typically weak: high value, 20kΩ~50kΩ.

## Why Buttons Bounce

Mechanical buttons aren't ideal switches. When you press one, the metal contacts don't close cleanly: they collide, rebound, collide again, rebound again, producing a burst of rapid ON-OFF-ON-OFF-ON transitions over several milliseconds (sometimes tens of ms). On an oscilloscope, a single press looks like a dense pulse train. A fast MCU can easily count each bounce as a separate press.

## Debounce

**Software debounce**: Detect pin change → wait ~20ms → read again → confirm it's still the new state → act. Zero hardware cost, good enough for most cases.

**Hardware debounce**: RC low-pass filter (e.g., 10kΩ + 100nF). fc = 1/(2πRC) ≈ 159Hz; the RC sets how fast the node can move between the two levels, and the Schmitt trigger input cleans up what is left.

Many products use both: RC for the first pass, software for confirmation.

## Production-Grade Button Circuit

```
3.3V
│
10kΩ
│
GPIO────┼────100nF────GND
│
Button
│
GND
```

- Button: user input
- 10kΩ: pull-up, anti-float, current limiting
- 100nF cap: hardware debounce, noise filtering
- GPIO: state detection

## What Industrial Designers Should Know

- Mechanical design: button size, travel, actuation force, rebound speed, assembly tolerances, long-term wear.
- Environmental reliability: water/dust resistance (IP rating), ESD protection, EMC immunity.
- User experience: single click, double click, long press, repeat trigger, state feedback (haptic/visual/audio).
- Product lifetime: rated cycle count, mechanical fatigue, temperature effects on materials.

A TV remote and a rice cooker use the same button logic: user input → button → GPIO → MCU → execute function.

## Core Summary

- Core circuit: 3.3V → pull-up resistor → GPIO node → button → GND.
- Core idea: the resistor provides the default state and limits current, the button changes the circuit, the GPIO reads the result.

## FAQ

### Why Pull-Up Dominates in Industrial Design

#### Built-In MCU Pull-Ups Are Free

Most MCUs (STM32, ESP32, AVR) have programmable internal pull-up resistors. Internal pull-downs are less universal: many classic 8-bit parts, AVR and 8051 among them, have none at all. Enable the internal pull-up and you save a resistor and PCB space: zero BOM cost. Engineers naturally reach for the free option, and over time this created a "pull-up first" design culture.

#### Fail-Safe: What an Open Circuit Actually Does

- In a pull-up circuit, pressed = LOW.
- If the wire between button and board breaks, a connector comes loose, or a solder joint cracks, the pull-up immediately yanks the floating GPIO back to a solid HIGH: "not pressed."
- **Result**: the failure does NOT cause a false trigger. The system stays safe.

Flip the scheme around and the same open circuit behaves the same way: a pull-down holds the pin LOW, and in that convention LOW means "not pressed". An open circuit fails to idle in both schemes. What does differ is the short: a pull-up input reads a short to ground as a permanent press, a pull-down input reads a short to the supply as a permanent press, and in a vehicle the accidental contact is far more often chassis ground than the supply.

#### Ground as Reference Is More Reliable

- The ground plane is the 0V reference for the entire system: it is everywhere and its impedance is very low, which makes it a much stiffer reference than the supply rail.
- Static or noise from a finger touch gets safely shunted to earth rather than injected into the sensitive power rail.

#### Power and Logic Naturally Align

- **Quiescent power**: when not pressed, both ends of the pull-up are HIGH: virtually zero power. Pressed = 3.3V/10kΩ = 0.33mA, consumed only during the action. A pull-down scheme produces the same current (VCC through button to pull-down), so there's no static power advantage either way.
- **Logic intuition**: many sequential logic circuits (reset circuits, etc.) use active-low signaling. Pull-up + button-to-ground naturally gives "pressed = 0", matching interrupt triggers and reset logic: less mental overhead when writing firmware.

#### Open-Drain and Bus Compatibility

When multiple devices share a signal line (I²C, 1-Wire, or a button sharing a pin with a status indicator), open-drain + pull-up is the standard topology. Pull-up slots right in. Pull-down needs extra level translation or circuit rework.

---

### When Would You Actually Choose Pull-Down?

Some designs actively choose pull-down:

- **Active-high requirement**: some peripheral reset or enable pins are active-high. For logic consistency, design the button to output HIGH when pressed → use pull-down.
- **Ultra-low-power wake-up pin limits**: some ultra-low-power MCUs only support rising-edge or high-level wake-up. You must use pull-down with the button tied to VCC.

## Further Reading

### Internal vs External Pull-Up

MCU internal pull-ups (20kΩ~50kΩ) save components, but they're high-value and weak. In long traces or noisy environments, they're not reliable enough. Industrial products often add an external 10kΩ even when the MCU supports internal pull-ups: lower resistance, stronger noise immunity. The designer chooses based on trace length, ambient noise, and power budget.

### Debounce State Machine

A simple delay(20ms) only handles basic clicks. Production-grade interaction needs a state machine:

IDLE → press detected → DEBOUNCE_PRESS (wait 20ms confirm) → PRESSED (execute, enter release debounce) → release detected → DEBOUNCE_RELEASE (wait 20ms confirm) → back to IDLE.

This framework prevents long-press retriggering and is the foundation for double-click, long-press, and other gestures.

### Polling vs Interrupt

Polling: main loop or timer periodically reads GPIO. Simple but burns CPU, bad for low power.

Interrupt: button on interrupt pin, edge-triggered ISR, start a timer in the ISR for debounce. Lower power, faster response: essential for battery-powered devices.

Real products often combine both: interrupt wakes the system, then polling handles debounce.

### Quantitative Hardware Debounce Design

RC filter (10kΩ + 100nF): fc = 1/(2πRC) ≈ 159Hz, far below the mechanical bounce frequency (kHz range), so filtering is very effective. τ = RC = 1ms. With a Schmitt trigger, residual ripple gets further suppressed. Tune the capacitor value based on actual bounce characteristics: balance response speed against filtering.

### Safety and Reliability Design

GPIO mode misconfiguration protection: if GPIO accidentally gets set to push-pull output HIGH and the button is pressed, you get a short. Place a 100Ω~1kΩ protection resistor between GPIO and the button node to limit the fault current to 3.3V/100Ω = 33mA at the low end instead of a dead short; check the per-pin current limit in the datasheet, because 33mA is above the absolute maximum on some MCUs.

ESD protection: an exposed button is a direct human-touch path, so it wants a TVS or dedicated ESD diode to ground, which shunts the zap away before it reaches the MCU.

### Multi-Button and GPIO Optimization

One button per GPIO only works for a few buttons.

When you have many, the industry uses matrix scanning (row/column) or an ADC resistor-ladder (a chain of resistors dividing voltage; one ADC pin reads different voltages for different buttons) to dramatically save GPIO pins.
