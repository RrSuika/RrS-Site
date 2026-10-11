---
title: "Isolation & GPIO Driver: MOSFET, BJT, Relay, Optocoupler"
date: 2026-08-10
description: "How to get from a 3.3V GPIO to a 12V/2A load: what an NMOS low-side switch actually does, when a BJT, a relay or an optocoupler is the better answer, and which protection parts you cannot leave out."

type: note
category: Electronics

tags:
  - Electronics
  - MOSFET
  - Circuit Protection
  - Optocoupler
  - Power Driver

tools:
  - Circuit Design
  - Power Electronics

featured: false

lang: en

translationKey: isolation-gpio-driver-mosfet-bjt-relay-optocoupler
---

![MOSFET Switch](./01-mosfet-switch.png)

An MCU pin is a logic output. The things you usually want to switch, LED panels, motors, solenoids, are not logic loads: they want a different voltage and roughly a hundred times the current. A driver circuit is the translator between the two, and for DC loads that translator is almost always a MOSFET.

# What GPIO Actually Is

GPIO is the MCU's general-purpose input/output interface: configurable as input (sense external levels) or output (generate HIGH/LOW). But its essence is a digital control interface. HIGH ≈ 3.3V (or 5V), LOW ≈ 0V, representing logic 1 and 0. Its output current is severely limited: typically around 20mA.

That 20mA is the number everything after this hangs on. A GPIO is a signal, not a supply.

## MOSFET Basics: Voltage-Controlled Electronic Switch

MOSFETs are perfect for this because they're voltage-controlled: the Gate draws essentially zero continuous current: you just need enough voltage to turn it on. The MCU provides the control signal to the Gate via GPIO/PWM, and the load current flows from the external supply through the Drain-Source path. Two separate paths that meet only at the Source pin.

### Three Terminals

| Pin | Name   | Role                                    |
| --- | ------ | --------------------------------------- |
| G   | Gate   | Control input, virtually no steady current |
| D   | Drain  | Connects to load, carries the work current |
| S   | Source | Current return (NMOS usually to GND)       |

Key insight: **the control signal and the load current travel through separate paths**. The GPIO only touches the Gate; the Drain-Source channel carries the external supply's current. Separate paths are not isolation, though: the Source sits on the same node as the MCU's ground, and that shared node is exactly why a low-side switch works on a 3.3V gate signal. Real isolation needs an optocoupler or a relay.

## Why MCUs Can't Drive Loads Directly

A 12V/24W LED panel needs 2A. An Arduino GPIO outputs ~20mA: a 100× gap, and the supply voltage is wrong as well. The MOSFET bridges both: the MCU provides the control voltage, the external 12V supply provides the current. Each does its own job, and the two meet at the Source pin, which is tied to the MCU's ground.

## NMOS vs PMOS

### NMOS (Low-Side Switch): Recommended
```
12V
 │
LED
 │
NMOS
 │
GND
```
- NMOS sits between load and GND
- Gate is referenced to GND, so a 3.3V or 5V GPIO can drive it directly (assuming logic-level MOSFET)
- Simple circuit, low conduction loss, perfect for PWM
- This is where I started and what I use in most projects

### PMOS (High-Side Switch)
```
12V
 │
PMOS
 │
LED
 │
GND
```
- PMOS sits between supply and load
- To turn on PMOS, Gate must be pulled below Source by at least V_GS(th). Source is at 12V, so Gate needs to be near 12V - V_GS(th): a 3.3V GPIO can't do that
- Needs extra level shifting or a gate driver IC: more complex
- Not recommended for beginners

## PWM Dimming

PWM doesn't reduce voltage: it switches between full-on and full-off at high speed, varying the on-time ratio (duty cycle) to control average power. The eye integrates those pulses, so once the switching is faster than the flicker-fusion frequency the LED reads as continuously lit.

- LED dimming: >200Hz avoids visible flicker. Arduino defaults of 490Hz/980Hz are fine
- Motor control: typically several kHz to 20kHz
- Too low → visible flicker or audible whine
- Too high → switching losses increase (the MOSFET spends more time in the transition region)

## Why You Need a Freewheeling Diode

**Applies to**: motors, fans, solenoids, relay coils: anything with a wound inductor.

When the MOSFET turns off, the inductor's magnetic field collapses, generating a reverse high-voltage spike that can be several times the supply voltage: enough to blow the MOSFET's Drain-Source junction. A freewheeling diode (1N4148 for low power, SS14 or similar Schottky for higher current) placed anti-parallel across the inductive load gives that stored energy a safe path to recirculate.

Pure resistive loads like LEDs generally don't need one, but it doesn't hurt to add it.

## MOSFET vs BJT (NPN/PNP)

| Property         | BJT (NPN/PNP)    | MOSFET         |
| ---------------- | ---------------- | -------------- |
| Control method   | Current-controlled | Voltage-controlled |
| Input impedance  | Low              | Extremely high |
| GPIO steady current | Required       | Virtually none |
| Heat             | Higher           | Lower          |
| High-freq PWM    | Average          | Excellent      |
| High current     | Average          | Excellent      |

BJTs are current-controlled: you have to keep feeding base current to stay on. MOSFETs are voltage-controlled: once the Gate capacitance is charged, basically zero current flows. In modern DC power switching, MOSFETs win across the board. BJTs still appear in analog circuits (amplification, linear regulation) and some high-voltage niches, but for driving loads from an MCU? MOSFET every time.

## Relay vs MOSFET

| MOSFET          | Relay               |
| --------------- | ------------------- |
| No mechanical contacts | Mechanical contacts |
| PWM capable     | No PWM              |
| Fast            | Slower              |
| Long life       | Limited mechanical life |
| Silent          | Audible click       |
| DC only         | AC/DC both          |

**I use a relay when**: switching 220V AC, need true physical disconnect (zero leakage current), or need full galvanic isolation.
**I use a MOSFET when**: LEDs, motors, fans, battery-powered products: DC loads that need speed, silence, and PWM control.

## Optocoupler: When You Need True Electrical Isolation

An optocoupler transmits signals using light: an internal LED shines on a photosensitive receiver. There's no conductive path between input and output: only photons. This lets a 3.3V MCU safely control 220V equipment, while also breaking ground loops and improving noise immunity.

Classic usage: MCU GPIO → current-limiting resistor → optocoupler LED → optocoupler transistor → driver circuit → TRIAC or relay → mains load. The low-voltage and high-voltage sides are completely isolated.

## Industrial Product Analysis: My Framework

When I look at any product's power stage, I ask five questions:

1. Where does power enter?
2. Which parts are the high-power loads?
3. What drives them (MOSFET/relay)?
4. How does the MCU control them (GPIO/PWM)?
5. What protection is in place (freewheeling diode, TVS, fuse, optocoupler)?

Common MOSFET-driven products: LED lights, RGB strips, fans, motors, water pumps, solenoid locks, solenoid valves, USB PD power supplies, Li-ion battery management, DC-DC converters, drone and EV motor controllers.

## Design Notes: Lessons Learned

**Pick a logic-level NMOS, and check which gate voltage it is specified at.** Standard MOSFETs often need ~10V of gate drive to reach their rated R_DS(on), which a 3.3V GPIO cannot provide. Logic-level parts are characterised at a lower gate voltage, but read which one: the L in IRLZ44N is IR's marker for a logic-level gate, and that part quotes R_DS(on) at V_GS = 5V, so a 3.3V design wants a device specified at 2.5–3.3V. Check the datasheet row for YOUR gate voltage, not the headline number at V_GS = 10V.

**The gate resistor is not optional.** In series, 10–100Ω: the gate looks like a capacitor, and every GPIO edge has to charge or discharge it, so the instantaneous current can be high enough to stress the pin. The series resistor limits it and suppresses parasitic oscillation. Gate to source, 10kΩ: at power-up or whenever the GPIO is high-impedance, the gate is otherwise floating. A floating gate can sit half-on, which leaves the channel at high resistance and burning real power. The pull-down holds it at 0V whenever nothing is driving it, and it is never worth skipping in production.

**Inductive loads must have a freewheeling diode.**

**Common ground is not optional either.** The MCU's GND and the supply's GND have to be connected directly: without a shared reference the gate drive has no return path and the MOSFET never switches. This is the number one beginner trap. If you genuinely need the MCU and the load separated, use an optocoupler rather than trying to keep the two grounds apart.

**MOSFET selection checklist:**
- V_GS(th): gate threshold voltage (where it *starts* turning on, not fully on)
- **R_DS(on): on-resistance (lower is always better: heat = I² × R_DS(on))**
- I_D max current (leave margin)
- V_DS max voltage (leave margin too)

**PWM frequency**: LED dimming >200Hz avoids flicker (Arduino 490Hz/980Hz is fine), motor control several kHz to 20kHz. Too low → flicker/noise, too high → switching loss heat.

![MOSFET Illustration 1](./02-mosfet-illustration-1.png)
![MOSFET Illustration 2](./03-mosfet-illustration-2.png)
