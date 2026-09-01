---
title: "Signal Filtering: RC High-Pass & Low-Pass"
date: 2026-08-10
description: "A designer's guide to passive RC filter circuits: cutoff frequency calculation, frequency response characteristics, and practical applications in signal conditioning."

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

RC filters were one of the first things I learned in analog circuits. Just a resistor and a capacitor: looks almost too simple. But then I kept running into them in real projects: anti-aliasing before ADCs, button debounce, audio inter-stage coupling, PWM smoothing... all RC filter variants. Once you understand how capacitive reactance changes with frequency, all these circuits trace back to the same core formula.

## Core Principle: Capacitor Impedance Varies With Frequency

Capacitive reactance: **Xc = 1/(2πfC)**. Higher frequency → lower impedance. Lower frequency → higher impedance. Pair this with a resistor divider and you get different attenuation for different frequencies.

- **At low frequencies**: the capacitor is effectively an open circuit (high impedance). Depending on configuration, signal is either blocked or passes freely.
- **At high frequencies**: the capacitor is effectively a short (low impedance).
- **Cutoff frequency fc**: when |Xc| = R, f = 1/(2πRC), output power drops to half (-3dB).

fc = 1/(2πRC): probably the most-used formula in my notebook. I've calculated it for debounce circuits, audio filters, ADC front-ends... it shows up everywhere.

## RC Low-Pass Filter

### Circuit

```
Vin ── R ──┬── Vout
            │
            C
            │
           GND
```

Resistor in series, capacitor to ground. Low frequencies pass through the resistor to the output. High frequencies get shunted to ground by the capacitor: the output voltage stays low.

### Characteristics

- Cutoff: **fc = 1/(2πRC)**
- Above fc, attenuation rolls off at -20dB/decade
- DC gain = 1 (0dB): DC passes through unchanged

### Where I Actually Use Low-Pass Filters

- **Anti-aliasing before ADC**: anything above the Nyquist frequency (fs/2) must be eliminated before sampling, or it folds back as aliasing. Stick an RC low-pass right at the ADC input pin.
- **Power ripple suppression**: DC/DC switching noise: use RC (or LC) low-pass to knock it down.
- **Hardware button debounce**: 10kΩ + 100nF, fc ≈ 159Hz. Mechanical contact bounce is in the kHz range: an order of magnitude apart, so filtering is very effective. I usually combine hardware and software debounce.
- **PWM to analog voltage**: feed PWM square wave through a low-pass with fc well below the PWM frequency, and you get smooth DC proportional to duty cycle. A simple DAC.
- **Audio bass extraction**: in crossovers and tone controls, the low-pass picks out the low frequencies for the bass path.

### Design Notes

- The next stage's input impedance must be >> R, or the divider ratio shifts and your cutoff frequency drifts. If the next stage is low-Z, buffer it.
- A single RC stage gives only -20dB/decade. Need steeper roll-off? Cascade stages (buffer between them) or go active.
- Capacitor type matters in the signal path. C0G/NP0 or film caps preferred. X7R ceramics have piezoelectric effects and nonlinearity: they introduce distortion.

## RC High-Pass Filter

### Circuit

```
Vin ── C ──┬── Vout
            │
            R
            │
           GND
```

Capacitor in series, resistor to ground. High frequencies sail through the capacitor to the output. Low frequencies get blocked by the capacitor's high impedance, and whatever residual gets through is pulled to ground by the resistor.

### Characteristics

- Cutoff: **fc = 1/(2πRC)**: same formula
- Below fc, attenuation at -20dB/decade
- At sufficiently high frequencies, gain approaches 1 (0dB)

### Where I Actually Use High-Pass Filters

- **AC coupling / DC blocking**: strip the DC offset from a sensor signal, keep only the AC variation. Ubiquitous in audio and sensor circuits.
- **Audio inter-stage coupling**: a capacitor between stages isolates their different DC operating points so they don't mess with each other.
- **PIR sensor signal extraction**: human body movement causes AC infrared changes. A high-pass filters out the slow ambient temperature drift, leaving only the useful motion signal.
- **ECG / bio-potential signals**: electrode half-cell potentials create DC offsets of tens to hundreds of mV. A high-pass removes the offset so you can safely amplify the actual heartbeat waveform.
- **Audio treble extraction**: in crossovers, the high-pass sends high frequencies to the tweeters.

### Design Notes

- Set fc well below your minimum signal frequency so in-band attenuation is negligible (fc << f_min).
- The source output impedance and R form a divider that affects passband gain: R needs to be large enough.
- Don't go oversized on coupling caps. Bigger C means longer settling time at power-up before the DC level stabilizes.

## RC Band-Pass Filter

Cascade a high-pass followed by a low-pass (buffer between them to avoid loading):

```
Vin ── C1 ──┬── R1 ──┬── Vout
             │        │
             R2       C2
             │        │
            GND      GND
```

- Lower cutoff f_L = 1/(2π × R2 × C1), set by the high-pass stage
- Upper cutoff f_H = 1/(2π × R1 × C2), set by the low-pass stage
- Bandwidth BW = f_H - f_L, center frequency f_0 = √(f_L × f_H)

Applications: audio equalizers, communication receiver IF filtering, extracting and detecting signals at specific frequencies.

## Don't Forget the Time Domain: τ

RC circuits are just as important in the time domain:

- **Time constant τ = RC**
- Charging: Vout(t) = V_final × (1 - e^(-t/τ))
- Discharging: Vout(t) = V_initial × e^(-t/τ)
- After 1τ: ~63% change. After 5τ: >99%, effectively settled.

The same RC network acts as a filter in the frequency domain and controls rise/fall time in the time domain. Timing circuits, power-on reset delays, debounce sequencing, pulse shaping: they all depend on τ.

## Active Filters: What's Next

Passive RC filters have three clear limitations:
- High output impedance, weak load-driving ability
- Attenuation only: no gain
- Single-stage -20dB/decade isn't very steep

Active filters add an op-amp after the RC network and solve all of these: buffering for drive strength, gain, and feedback to shape the response:
- **Sallen-Key topology**: the most common second-order active filter
- **Multiple Feedback (MFB)**: better for high-Q applications
- **Switched-capacitor filters**: clock-tunable cutoff, great for integration

But honestly? Getting solid on passive RC filters first is the right move. They're the foundation of all filter design, and half the time a simple RC is all you actually need. No reason to overcomplicate it.
