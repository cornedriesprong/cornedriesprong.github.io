---
layout: ../../layouts/AboutLayout.astro
title: polybeat user manual
---

## Table of contents

- [Table of contents](#table-of-contents)
- [Overview](#overview)
  - [Features](#features)
  - [AUv3](#auv3)
- [Main view](#main-view)
- [Sequencer header view](#sequencer-header-view)
- [Modulation view](#modulation-view)
- [Snapshot view](#snapshot-view)
- [Custom MIDI mappings](#custom-midi-mappings)
- [MIDI input](#midi-input)
- [credits](#credits)

[comment]: <> (TOC generated with https://ecotrust-canada.github.io/markdown-toc/)

## Overview

**polybeat** is an advanced and highly flexible drum and percussion sequencer for iOS, iPadOS and Mac (Catalyst) capable of generating complex and intricate polyrhythmic and polymetric drum patterns.

### Features

- Configurable **sequence length** per drum voice (1-16 steps)
- Configurable **step length** per drum voice (double whole notes to 64th notes, including tuplets and dotted notes)
- Sequencer step attributes:
  - Accent on/off
  - Velocity
  - Ratchet (note repeats)
  - Skip (note every _n_ loops)
  - Chance
  - Timing offset
  - MIDI CC (Continuous Control)
- **Sample-accurate** sequencing engine
- Slick and responsive **native UI**
- **Mute** or **solo** indidividual drum voices
- Sequences **transformations**:
  - Shift left/right
  - Rotate
  - Randomize
  - Mirror
  - Reverse
  - Double
  - Bisect
- Full AUv3 **preset and state-saving**
- Ability to **copy/paste** patterns between plugin instances
- **Mapping presets** for common AUv3 drum apps and hardware drum machines
- **Musical scale presets** for usage as a melodic sequencer
- **MIDI controllable** pattern switching and transformation
- Works **offline**
- No **push notifications**
- No **ads or in-app purchases**
- No **third-party behavioural tracking tools**
- Ongoing development and support

### AUv3

Polybeat can be used as an Audio Unit 3 (**AUv3**) MIDI plugin in a compatible host (such as [AUM](https://kymatica.com/apps/aum), [Audiobus 3](https://audiob.us/), [Garageband](https://www.apple.com/ios/garageband/), [ApeMatrix](https://www.apesoft.it/apematrix/), [NanoStudio 2](https://www.blipinteractive.co.uk/nanostudio2/), [Cubasis 3](https://apps.apple.com/us/app/cubasis-3/id1207839273) or [Beatmaker 3](https://intua.net/beatmaker3/)).

## Main view

<img src="../../assets/polybeat/main_view.png" alt="polybeats's main view" width="740" />

The main view displays a sequencer lane for each drum voice (e.g., kick, snare, clap, or hihat). Sequences run left to right and can be scrolled. Adjust a track's sequence length by dragging the handle on its right side, or using plus (+), minus (-), double (\*), or bisect (/) buttons in the sequencer header view.

Edit available drum voices by selecting a different MIDI mapping in the menu (menu > MIDI mapping > apps/hardware/scales) or creating a custom mapping from scratch (menu > MIDI mapping > custom).

## Sequencer header view

<img src="../../assets/polybeat/sequence_header_menu.png" alt="sequence header view" width="740" />

The top of the main view shows the horizontally scrollable sequencer header, containing per-sequence operations. These actions can instantly transform sequences, creating subtle or dramatic pattern changes. Actions are performed on the selected sequencer track, identifiable by icon colors matching the track. Available options and transformations, from left to right, include:

**clear**  
 Remove all the triggers from the selected track.

**mute**  
 Mute the selected track.

**solo**  
 Solo the selected track (i.e., mute all other tracks).

**set step length**  
 Shows the menu for step length selection. Default is 16th notes; options range from double whole to 64th notes, including dotted, double dotted, and tuplets (duplets, triplets, quintuplets, septuplets).

**randomize**  
 Randomizes sequence. For binary sequences, generates a [Euclidean pattern](http://cgm.cs.mcgill.ca/~godfried/publications/banff.pdf), yielding even patterning for more musically engaging outcomes.

**mutate**  
 Alters one value in pattern randomly, enabling subtle change without significantly modifying the entire pattern.

**shift left/right**  
 Rotates the sequence along its horizontal axis.

**reverse**  
 Reverses the pattern.

**invert**  
 Inverts the pattern, meaning all the steps that active are set to inactive and vice versa.

**multiply**  
 Doubles the pattern by duplicating the existing steps.

**bisect**  
 Bisects the pattern by removing the latter half of the steps.

## Modulation view

<img src="../../assets/polybeat/modulation_view.png" alt="polybeats's main view" width="740" />

The modulation view, located at the main view's bottom, displays step attributes adjustable per step. Values correspond to the selected sequencer track, identified by separator line color. The available step attributes are:

**accent**  
 Accentuation of steps, meaning they will be played louder (with a higher velocity value) than regular steps.

**velocity**  
 Modifies the loudness of each step, similar to accent attribute; velocity can be set within a 0-127 range.

**ratchet**  
 Ratchet divides a step into equidistant triggers for fast note rolls in subdivisions of the sequence's main pulse.

**skip**  
 Skips trigger on selected step every n loops; e.g., skip value of 3 plays note on specific trigger every 3 sequence loops, adding variety to shorter sequences.

**chance**  
 Chance sequence introduces randomness into a pattern; value on a step sets probability, ranging from 20% (note plays 20% of the time) to 100% (note always plays).

**offset**  
 Offset sequence shifts selected step ahead by a small increment, enabling swing or complex timing variations.

**CC**  
 Sends MIDI CC values to control other apps or external hardware parameters. One destination per channel; configure by tapping CC selection button on chosen CC modulation lane.

## Snapshot view

<img src="../../assets/polybeat/snapshot_view.png" alt="snapshot view" width="740" />

Tapping the letter displayed (e.g., A) on the top navigation bar reveals the **snapshot menu**. Snapshots store the current state of a pattern and allow to easily create and switch between different variations. Tap **+** to add a new snapshot to the pattern. Long press on a snapshot cell to delete or duplicate the current snapshot.

## Custom MIDI mappings

<img src="../../assets/polybeat/custom_mapping.png" alt="snapshot view" width="340" />

Polybeat ships with a large number of MIDI mapping presets for popular apps and hardware drum machines (see menu > MIDI mapping > apps/hardware). For custom mappings, use (menu > MIDI mapping > custom). Tap "+" to add a drum voice, set name and MIDI output. Slide left on a cell to remove drum voice.

## MIDI input

Polybeat can be controlled via MIDI, for instance by using an external MIDI controller or another app or plugin that sends MIDI. The MIDI mapping is as follows:

**select snapshot**  
pitches **0-7** (MIDI note input)

**select track**  
pitches **8-24** (MIDI note input, pitch 8 = track 1, pitch 9 = track 2, etc.)

**sequence operations** (on currently selected track)  
**25** clear  
**26** mute  
**27** solo  
**28** randomize  
**29** mutate  
**30** shift left  
**31** shift right  
**32** add  
**33** remove  
**34** reverse  
**35** mirror  
**36** duplicate  
**37** bisect

## credits

**concept, design & development:** Corné Driesprong

**beta testers:** Rolf Seese
