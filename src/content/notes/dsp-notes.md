---
author: Corné Driesprong
title: DSP notes
postSlug: dsp-notes
draft: true
tags:
  - DSP
  - audio
ogImage: ""
description: My notes as I learn about the theory of digital signal processing
---

## Signals / sinusoids

- **continuous time** is written with round brackets, as $x(t)$
- **discrete time** is written as $x[n]$
- _periodic_ signals have these properties:
  - **period** ($T$): shortest distance between identical points: $x(t + T) = x(t)$, or $x(t+2\pi) = x(t)$ ($2\pi$ of a sine is equal to one period)
  - **phase** ($\cos$) is the offset in time of a signal relative to another signal, for example the phase of cosine is shifted $\frac{\pi}{2}$ relative to sine:
    $$\sin\phi = cos\left(\phi - \frac{\pi}{2}\right)$$
    (...in trigonometric terms, phase can be thought of as the angle between the rotating line around the unit circle and the x-axis)
    (we call sinusoids that are offset by 90° or $pi/2$ radians **quadrature components**)
  - **amplitude** ($A$): a signal with amplitude $A$ oscillates between $+A$ and $-A$, relates to perceived loudness
  - **magnitude** (absolute value): similar to amplitude, but measured as distance from 0
  - **frequency** ($f$) is the inverse of period ($T$):
    $$f = \left(\frac{1}{T}\right)$$
- **angular frequency** (radians per second) is denoted as $\omega$ (omega), such that:
  $$θ = ωt + φ$$
  (where $θ$ is phase/angle, $ω$ is (angular) frequency, $t$ is time and $φ$ is phase offset.
- lowercase letters are used for the _**time domain**_ and uppercase for the _**frequency domain**_ (except with frequency ($f$) and period ($T$))
- we can write the formula for **sinusoidal signals** as:
  $$x[n] = Acos\left(\omega 0 + \phi\right)$$
  ...where $n$ is (discrete) time, $A$ is amplitude, $w$ is (angular) frequency, or:
  $$x[n] = Acos(2\pi fn + \phi)$$
- unit impulse signal
- linear time invariants
- impulse decomposition (superposition): any signal can be decomposed into a sum of weighted, shifted signals
- **convolution**: describe a system by its impulse response ($h[n]$)
- **odd signal**: has odd symmetry across y axis ($x[-n] = -x[n]$) (e.g., a cosine)
- **even signal**: $[-n] = x[n]$ (e.g. a sine)
- **time invariant system**: phase shift is preserved
- **unit step signal**: causal signal
- real exponential signal
- time scaling: up-/downsampling

## Sampling

> _The fundamental trick to sampling is understanding *precisely* how often you must sample in order to avoid information loss_

- potential possible variations of a signal based on a sampling are called _aliases_, since they are indistinguishable based on the signal
- _Nyquist Limit_: half the sampling rate
- Every samples sine wave has an **infinite** number of aliases

> Any frequencies that go over the Nyquist limit and that are not multiples of the fundamental frequency will create “inharmonic” sounds." (aliasing

## Systems

- a **system** is a process that produces an **output** ($y[n]$) signal in response to an **input** signal ($x[n]$)
- $H$ is used to denote a frequency response
- **linear system**: a linear system has two properties
  - **homogeneity**: an amplitude change in the input produces an identical amplitude change in the output
  - **additivity**: when 2 or more inputs signals are passed, they don't interfere with each other
- **nonlinear system**

## Complex numbers

- **complex numbers** are useful for representing signals
  - any signal can be **broken down into sinusoids**
  - when we perform a **Fourier transform**, each frequency (e.g., sinusoidal component) can be represented by a complex number with a magnitude (real part) and a phase (imaginary number)
    - magnitude ($r$) = distance from origin (0,0) (i.e.: the _hypotenuse_ of a triangle)
    - angle from the real positive axis ($\theta$)
    - this called _**polar form**_ (geometric) ($z = r\angle\theta$)
    - in polar form, $r$ can be calculated using the Pythagorean theorem $r=\sqrt{ a^2 + b^2}$
- numbers that give a **negative** result when squared, i.e.: $x^2 = -1$
- _real_ vs _**imaginary**_ numbers
- real numbers are always **positive** when squared, even when they're negative (because the squaring cancels out the negative)
- ...so get a number that is negative when squared, we have to _invent_ a special number called unit $i$ (or $j$), where $i = \sqrt{-1}$ or $i^2 = -1$
- if we multiply a real number by $i$, it becomes an **imaginary number**, e.g.: 5 x $i$ = 5$i$, or -5x$i$=-5$i$
- e.g.: every time we multiply by $i$, a number rotates around the real and imaginary axes or the _complex plane_
- **complex numbers** have _real_ and _imaginary_ part: $z = a + bi$ where $a$ is the real part and $bi$ is the imaginary part
- complex numbers can have either a real of imaginary part of 0

### Complex number arithmetic

we can perform arithmetic with complex numbers like so:

- **addition**: $(a + bi) + (c + di) = (a + c) + (b + d)i$ (where $i$ denotes the imaginary part)
- **subtraction:** $(a + bi) - (c + di) = (a - c) + (b - d)i$
- **multiplication:**
- **division:**

## Transforms

- a **transform** is a tool to translate between representations, e.g.: from Cartesian (grid-based) to polar (rotation-based) coordinates:
  - **rotation** ($r$): $\arctan(y/x)$ or
  - **length** ($\theta$): $\sqrt{(x^2+y^2)}$
- the **Fourier transform** is a transform to translate between _frequency domain representation_ (a list of phasors) to a _time based representation_ (a list of samples)
- the **Discrete Fourier Transform** always produces a set of phasors which are harmonically related

## The dot product

- the **dot product** can be calculated by taking two signals of equal length, multiplying their elements together one-by-one, and then sum up the products, i.e. given two signals a and b:
  **a[n]** = [3, 5, 7, 9, 4]  
  **b[n]** = [8, 2, 5, 3, 1]
  ...we can calculate the dot product by doing (3 × 8) + (5 × 2) + (7 × 5) + (9 × 3) + (4 × 1), which leaves us with 24 + 10 + 35 + 27 + 4 = *_100_
- it turns out that the dot product uncovers geometric properties of signals, as we can measure the degree in which signals point in the same direction, i.e.: a measure of similarity or **correlation**
- By calculating the dot product of sine **and** cosine waves in the harmonic series of a given input signal, we can detect the presence of sinusoidal components

## The Fourier transform

- each of the complex numbers in the DFT-output is called a _**bin**_
- the 1st bin is called the **DC-bin**, i.e: the DC-offset
- when a frequency component does not match up with the bin frequencies, its energy "spills" out to all the bins, this called **spectral leakage**
- The **_Fast_ Fourier Transform** is a _faster_ version of the Discrete Fourier Transform

## Impulse signals

- **impulse signals** are useful since they contain (sinusoids of) all possible frequencies
- an impulse signal represents a discrete/sampled waveform of a frequency of Nyquist
- the continuous version of the impulse signal is called the **sinc** (sine cardinal) function
- an impulse function can be used to measure the **impulse response** of DSP systems
- the impulse response is the time domain representation (i.e., reverse FFT output) of the frequency response in the frequency domain
- we distinguish **Finite Impulse Response** (FIR) and **Infinite Impulse Response** (IIR) filters (see [[#Filter types]])
- for a FIR filter(?), the impulse response is identical to the filter coefficients, i.e., we can derive the coefficients by performing an inverse FFT on the frequency response so we get an impulse response which represents the coefficients in series

## Algorithmic building blocks

The following building blocks are important in many DSP operations:

- **n-sample delay** (delays a signal by _n_ samples): `y[n] = x[n-N]`
- **multiplier** (multiplies a signal by a **coefficient**): `y[n] = x[n]*N`
- **adder** (adds two signals together): `y[n] = p[n] + q[n]` )si

## Filters

> "Since each frequency is really a sine wave, all the filter does is make the amplitudes for certain sine waves become larger or smaller — but only if the sine waves with these frequencies are already present in the signal."

> "The amount of time smearing is equal to the maximum delay in the signal path"

> "Delay elements create phase shifts in the signal"

### Frequency response

- **cutoff frequency** is the frequency at which attenuation is -3 db
- the **roll-off slope** is measured in decibels (of attenuation) per octave (e.g., -3 db for a 1st order FIR lowpass filter, -6 db = 2nd order, -12 db = 3rd order, etc.)
- the **order** of the filter determines the steepness of the roll-off slope
- 1> filter orders create _passband ripple_, _stopband attenuation_ etc.

### Phase response

- The delayed element in a filter topology create phase shifts in the signal
- The phase response is crucial to the working of a filter, e.g. frequencies with (partly) opposing phase cancel each other out (negative interference)

### Filter types

- A low-pass filter **smooths** out the input signal (e.g., reducing high frequency content)
- There are two main ways to lowpass-filter a signal:
  - stable/moving average (Finite Impulse Response (FIR), i.e., feed-forward topology)
  - running average (Infinite Impulse Response (IIR), feedback topology)
- Different types of filters:
  - A simple **1st order one-pole lowpass filter** (6 db/oct) is a great utility for smoothing out changes in **exponential** values, but not so much for filtering sound
  - **Biquad filters**: 2nd order IIR filter, (12 db/oct) very versatile (lowpass, highpass, bandpass, notch, allpass). can blow up when modulated rapidly because of accumulations in the feedback paths.
  - **Allpass filter**: passes all frequencies equally in gain, but changes the phase relationship among various frequencies by delaying different parts of the frequency spectrum by different amounts. Typically implemented as a IIR structure. Can be cascaded to form higher-order allpass filters.
  - **Trapezoidal filter**: produces an average between forward and reverse integration, which means the phase response is less skewed than with other topologies and it can easily be modulated without the internal integrators accumulating error or runaway DC causing instability.
    - **State Variable Filters** (SVF) (12 db/oct) produces all filter responses (Low-pass, High-pass, Band-pass, Notch, All-pass) simultaneously. Typically a good choice for audio effects. There are various implementations of the SVF filter:
    - [Chamberlin](https://www.musicdsp.org/en/latest/Filters/142-state-variable-filter-chamberlin-version.html)
    - Cytomic (Andrew Simper)
  - **Ladder filter (Moog style)**: a steep (24 db/oct) lowpass(?) filter
- A **dc block** filter is a very low (3 Hz) highpass filter that compensates for any DC offset by
- Filters can be cascaded in series to increase cutoff steepness

## Oscillators

### Waveforms

- a **sine** wave has no harmonics
- a **sawtooth** wave has all harmonics
- a **square** wave only has odd harmonics

### Band limiting

- The naive implementations of complex oscillators (saw, square, etc.) produce aliasing noise because of frequencies outside of the audible frequency range.
- To avoid this, we can **bandlimit** oscillators to not produce frequencies outside the audible range. There are various techniques:
  - **BLIT**: Bandlimited Impulse Train
  - **BLEP**: Bandlimited Step Function

### DC offset

- A DC offset occurs when all the average of samples in the signal is not zero. I.e., all the samples are effectively offset from zero by some amount.
- It can cause a click/pop in the speaker when the signal stops and moves back to zero.

## Waveform modulation

We can modulate some elements of periodic signals that can generate interesting sonic effects:

- **Amplitude modulation (AM) / tremolo**
  Modulating the amplitude of a bipolar oscillator with a unipolar oscillator. Also known as _vibrato_.
- **Ring modulation (RM)**
  Modulating the amplitude of a bipolar oscillator with another bipolar oscillator
  nb: we can interpolate (or modulate) between AM and RM
- **Frequency modulation (FM) / vibrato** / **Phase modulation (PM)**
  Frequency- and phase modulation generally have the same effect (minus some technical details). In the DX7 PM means modulating the way the carrier wave is scanned(?). PM also allows for feedback. FM is also known as _tremolo_.
- **Phase distortion is about skewing the ramp which scans the waveform.** is about skewing the ramp which scans the waveform

> Phase modulation is like a high-frequency Doppler-shift

## Effects

### Modulation effects

Modulation effects are created by splitting the signal into two identical copies, modulating one of the copies, and then mixing both signals back together.

- **Flanger**: the 2nd signal is delayed slightly (4-20 ms). a related phenomenon is **comb filtering**.
- **Phaser**: the phase of 2nd signal is modulated using a series of allpass filters.
- **Chorus**: the pitch of 2nd signal is modulated. Splitting the signal into more than two copies is called **ensemble**.

### Reverb

> Reverb(eration) is delay in 3D.

A reverb usually has early- (initial reflections) and late stages.

There are generally two types of reverb:

1. **Convolution** reverb
   - _convolves_ the sound with an **Impulse Response** (IR)
2. **Algorithmic** reverb
   - i.e., Feedback Delay Network (FDN)

- sound diffusion:
  - (nested) allpass filters
  - allpass filters inside delay feedback loop
- modulate delay times (with interpolation)
- nested delay lines
- filtering
- Dattoro? (classic reverb algorithm)

### Delay

> Repetition is the mirror of the infinite

> Repetition and resemblance do not presuppose a prior identity; they can only be understood in terms of difference: not as a difference between two things, but as the divergence and decentering within the repeated itself.
> _Gilles Deleuze - Difference et Repetition_

- delay is one-pole filter stretched out in time
- **feedforward** vs **feedback** delay
  - **feedforward**: signal doesn’t flow back into input (no loop)
  - single echo or comb filter
- **multitap** delay has multiple read heads

## Reading list

### Books

- Richard G. Lyons - Understanding Digital Signal Processing
- [Allen B. Downey - Think DSP](https://greenteapress.com/wp/think-dsp/)
- [Steven W. Smith - The Scientist and Engineer's Guide to Digital Signal Processing](http://www.dspguide.com/)
- Graham Wakefield , Gregory Taylor - Generating Sound & Organizing Time
- Will Pirkle - Designing Audio Effect Plug-Ins in C++
- Will Pirkle - Designing Software Synthesizer Plug-Ins in C++
- [Sophocles J. Orfanidis - Introduction to Signal Processing](http://eceweb1.rutgers.edu/~orfanidi/intro2sp/)
- [Curtis Roads - Microsound](https://monoskop.org/images/d/d1/Roads_Curtis_Microsound.pdf)
- Curtis Roads - The Computer Music Tutorial
- [Miller Puckette - The Theory and Technique of Electronic Music](<>)
- [Daniel R. Mitchell - Basic Synth](https://basicsynth.com/)
- Colin W. Clark - Math Overboard!
- [Eric Lyon - Designing Audio Objects for Max/MSP and Pd](https://www.areditions.com/lyon-designing-audio-objects-for-max-msp-and-pd-das025.html)
- [Boulanger, Lazzarini - The Audio Programming Book](https://mitpress.mit.edu/9780262014465/the-audio-programming-book/)
- Musimathics I & II

### Articles

- [# μ](https://mu.krj.st/)
- [gDSP](http://gdsp.hf.ntnu.no/)
- [Martin Finke](https://www.martin-finke.de/)
- [Paul Batchelor - Soundkit notes](https://pbat.ch/sndkit/algos/)
- [Mutable Instruments - From zero to boutique module manufacturer](https://pichenettes.github.io/mutable-instruments-documentation/tech_notes/education/)
- [Vadim Zavalishin - The Art of VA Filter Design](https://www.native-instruments.com/fileadmin/ni_media/downloads/pdf/VAFilterDesign_2.1.0.pdf)
- [Julius O. Smith](https://ccrma.stanford.edu/~jos/pubs.html) [2](https://ccrma.stanford.edu/~jos/pasp/)
- [Demystifying digital filters](https://cycling74.com/tutorials/demystifying-digital-filters-part-1)
