---
title: "Signal Filtering: RC High-Pass & Low-Pass"
date: 2026-08-10
description: "One resistor and one capacitor can take out noise, smooth a PWM signal or block a DC offset. This is what that pair actually does, and when to reach for it."

type: note
category: Electronics

tags:
  - Electronics
  - Signal Processing
  - RC Filter
  - High-Pass Filter
  - Low-Pass Filter

tools:
  - Circuit Analysis
  - Analog Electronics

featured: false

lang: en

translationKey: signal-filter-rc-high-low-pass
---
# RC Passive Filters: Two Components, Everywhere You Look

By the end of this you will know how one resistor and one capacitor tell fast signals apart from slow ones. You will also know which way round to fit them, and how to choose the two values. I meet the same pair everywhere: in front of measuring chips, behind noisy supplies, on bouncing buttons.

## Core Principle: Capacitor Impedance Varies With Frequency

A resistor holds current back by the same amount whatever the signal does. A capacitor does not: the faster the signal, the less it gets in the way. That speed-dependent resistance is called impedance.

Beside a resistor, the capacitor splits a fast signal differently from a slow one. That is filtering.

- **Slow signal (low frequency)**: the capacitor looks like a break in the wire.
- **Fast signal (high frequency)**: it looks like a plain piece of wire.
- **The cutoff frequency** is where the two are equally hard to pass. Below it signals come through, above it they get squashed. It is written fc: **fc = 1/(2πRC)**.

R is in ohms, C in farads, fc in hertz. Make either bigger and the cutoff drops, so you never have to calculate it.

## RC Low-Pass Filter

### What the circuit looks like

```
Vin ── R ──┬── Vout
            │
            C
            │
           GND
```

The resistor sits in the signal path; the capacitor hangs off the side to ground, the 0V line everything is measured against. Slow signals walk through the resistor, fast ones take the capacitor and end at ground.

### What it does to fast and slow signals

- Below the cutoff the signal comes out roughly as it went in.
- Above it, ten times the frequency means ten times smaller out.
- A steady voltage passes straight through.

### Where I actually use it

- **In front of a chip that measures voltage.** Such a chip, an ADC, reads many times a second; anything faster than that comes back as nonsense.
- **Behind a switching power supply**, which leaves fast rubbish on its output.
- **On a bouncing button.** 10kΩ with 100nF smooths it out, though only the edges, so I still confirm the press in software.
- **On a fast on/off pin**, called PWM: the low-pass hands you the average, a cheap adjustable voltage.
- **In a speaker crossover**, sending the low notes to the big speaker.

### Things to watch out for

- Whatever you hang on the output must be harder to get through than R, or your cutoff moves.
- One RC stage is gentle. Chain two stages if you need a sharper cut, or use an active filter.
- In a signal path, pick a capacitor meant for signals. Some cheap ceramic ones distort.

## RC High-Pass Filter

### What the circuit looks like

```
Vin ── C ──┬── Vout
            │
            R
            │
           GND
```

Same two parts, swapped. The capacitor sits in the signal path and the resistor goes down to ground. Fast signals pass through the capacitor easily. Slow ones cannot, and whatever is left is pulled to 0V.

### What it does to fast and slow signals

- Above the cutoff the signal comes out roughly as it went in.
- Below it the signal shrinks at the same rate.
- The cutoff uses the same formula: **fc = 1/(2πRC)**.

### Where I actually use it

- **To strip the fixed part off a sensor signal.** Many sensors give a steady voltage with a small wobble on top, and the wobble is the information.
- **Between two audio stages**, which sit at different steady voltages. The capacitor passes the sound and not the steady voltage.
- **In a motion sensor.** A person walking past changes the infrared quickly, a warming room slowly. The high-pass keeps the person.
- **On heart signals.** The electrodes bring a large steady voltage of their own; remove it and the tiny heartbeat is big enough to measure.
- **In a speaker crossover**, sending the high notes to the small speaker.

### Things to watch out for

- Set the cutoff well below the slowest signal you care about, or you lose part of it.
- Whatever feeds the filter has resistance too. It adds to R, so R has to stay big enough to be in charge.
- Do not oversize the capacitor; a big one takes longer to settle at power-up.

## RC Band-Pass Filter

Put a high-pass first and a low-pass after it, and only the middle survives. The first stage blocks what is too slow, the second what is too fast.

The second stage pulls on the first and drags both cutoffs. If the numbers matter, buffer between them: a stage that copies the voltage without drawing current. The drawing leaves it out.

```
Vin ── C1 ──┬── R1 ──┬── Vout
             │        │
             R2       C2
             │        │
            GND      GND
```

Use it for one band of frequencies and nothing else: a tone control, or one signal out of a radio.

## Don't Forget the Time Domain: τ

Everything so far was about frequency. The same two parts also set how fast the output can change, which is what matters the moment you switch something on.

Charge the capacitor through the resistor and the voltage climbs, fast then slower. The trip is set by **τ = RC** (R in ohms, C in farads, τ in seconds). After one τ you are about two thirds of the way; after five, it is done.

A bigger R or C means a slower circuit. Anything that has to wait, a power-on delay or a debounce timer, is built this way.

## Active Filters: What's Next

Passive filters, the resistor-and-capacitor kind, have three limits: weak output, smaller-only, and a gentle cut.

An amplifier chip after the RC network fixes all three: a strong output, gain, and feedback to shape the cut. That is an active filter. The names you will meet are **Sallen-Key** (most common), **multiple feedback** (sharper), and **switched-capacitor** (cutoff set by a clock).

But learn the passive version first. Often a plain RC is all the circuit needs.
