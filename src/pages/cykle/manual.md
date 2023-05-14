---
layout: ../../layouts/AboutLayout.astro
title: cykle user manual
---

<img src="../../assets/cykle/cykle.png" alt="cykle">

## Table of contents

- [Table of contents](#table-of-contents)
- [Overview](#overview)
  - [Standalone \& AUv3](#standalone--auv3)
- [Terminology](#terminology)
- [Main view](#main-view)
- [Sequence menu](#sequence-menu)
- [Pattern transformations](#pattern-transformations)
- [Pattern menu](#pattern-menu)
- [Snapshot view](#snapshot-view)
- [Song mode](#song-mode)
- [Channel view](#channel-view)
  - [MIDI input mode](#midi-input-mode)
- [Saving and loading patterns](#saving-and-loading-patterns)
- [Credits](#credits)

## Overview

**cykle** is an inventive, semi-generative melodic step sequencer for iOS, iPadOS and Mac (Catalyst). cykle abstracts every musical parameter (such as _pitch_, _velocity_, _length_, _transposition_ and more) into its own sequence using decoupled sequencer lanes, producing complex and musically engaging patterns from the interactions between simple elements.

cykle's design was partly influenced by the article [Manipulations of Musical Patterns](http://retiary.org/ls/writings/musical_manip.html) (1981) by American composer [Laurie Spiegel](https://en.wikipedia.org/wiki/Laurie_Spiegel).

### Standalone & AUv3

cykle can be used either as a **standalone app** or as an Audio Unit 3 (**AUv3**) MIDI plugin in a compatible host (such as [AUM](https://kymatica.com/apps/aum), [Audiobus 3](https://audiob.us/), [ApeMatrix](https://www.apesoft.it/apematrix/) or [Beatmaker 3](https://intua.net/beatmaker3/)). Note that currently cykle unfortunately does **not** work in GarageBand, since it does not support MIDI plugins.

The standalone app communicates with other MIDI-enabled apps via CoreMIDI virtual endpoints (configurable in the [channel view](#channel-view)).

## Terminology

This manual uses various terms specific to sequencers and cykle, which will be established below:

- **step**  
   A _step_ is the atomic unit of a sequence. A step can have a binary (on/off) value or some other musically meaningful value (for instance, a pitch class such A#, or a beat division such as 1/4, i.e., a quarter note).

- **sequence**  
   A _sequence_ is a sequentially ordered list of steps. There are various types of sequences (such as _pulse_, _pitch_ and _velocity_), each of which will be described in more detail shortly.

- **channel**  
   A _channel_ holds one or more sequences, which together produce a repeating musical phrase. Channels can play back simultaneously, similar to the independent channels of audio on a mixing console, and every channel can route its MIDI output to a different destination and/or channel.

- **snapshot**  
   A _snapshot_ is the saved state of a sequence. Snapshots can be accessed via the snapshot menu and can be used create and switch between different variations on a pattern. They are labeled with the alphabetic letters **A** to **H**.

- **pattern**  
   A _pattern_ contains one or more snapshots and/or channels, and specifies the musical metadata such as tempo, swing, scale and key. Note that in the AUv3 version of cykle, a pattern can contain only a single channel, since any number instances of the plugin can be loaded.

To summarize: a _pattern_ contains _snapshots_, which contain _channels_, which contain _sequences_, which contain _steps_.

## Main view

<img src="../../assets/cykle/cykle_main.png" alt="cykle's main view" width="600" />

The main view displayed when launching cykle. It shows the lanes of various sequencer types (_pulse_, _pitch_ and _length_, by default) as expandable cells. Tap on a cell to reveal its sequence grid. New sequences can be added to a channel by tapping the **+** icon in the top right of the screen. Sequences can be removed by swiping to the left on a non-expanded cell and tapping _delete_.

A key feature of cykle is the ability for each sequence to have different lengths. Combining sequences with varying lengths is a powerful technique, as it quickly and easily generates musical phrases that are interesting and complex, yet regular and self-similar.

## Sequence menu

Tapping the **+** icon in the top right of the screen opens the _add sequence_ menu, allowing you to add new sequence lanes to the selected channel. Each sequencer types modulates the pattern in a specific way, as explained below:

<img src="../../assets/cykle/sequence_menu.png" alt="cykle's sequence menu" width="600"/>

- **pulse**  
   the pulse sequence determines whether a step will play or not, using a row of on/off steps like a Roland X0X-style drum machine. By default, it emits the root note of the selected scale. To select other pitches, combine it with the pitch sequence.

- **rest**  
   The rest sequence is effectively the inverse of the pitch sequence; an active step mutes the events that would otherwise play on that step. Use the rest sequence in combination with the pulse sequence to generate more complex pulse patterns.

- **offset**  
   The offset sequence moves a step ahead in time by a small increment, allowing for swing or more complex timing variations.

- **length**  
   The length sequence sets the duration of a step within a 1/16th to a whole note range. Varying step lengths for yields more varied rhythmic patterns.

- **velocity**  
   The velocity sequence sets a step's loudness, yielding more dynamic sounding patterns. If no velocity is given, all MIDI notes default to a velocity of 100.

- **chance**  
   The chance sequence introduces randomness into a pattern, specifying the probability that notes will play on a step in a range from 20% to 100%.

- **pitch**  
   The pitch sequence sets pitch class per step, corresponding to the pitches in the selected key and scale (e.g., C major). It allows multiselection for polyphony. Steps cannot be empty; use pulse or rest sequences to add rests.

- **accent**  
   Accented steps play louder (at a velocity of 120, by default) than non-accented steps. Accented steps override the velocity sequence value.

- **gate**  
   The gate sequence sets the duration of the events on a step in a range between 1/16 and 1 whole note. Note that this is independent from step length (i.e., longer notes can overlap).

- **accidental**  
   The accidental sequence sharpens (♯) or flattens (♭) a selected step's note, adding chromaticism to the sequence.

- **transpose**  
   The transpose sequence transposes MIDI notes on a step by degrees in the selected scale.

- **invert**  
   The invert sequence inverts chords on a step, transposing notes up starting from the lowest note or down starting from the highest note. Single notes are transposed by one or more octaves.

- **octave**  
   The octave sequence transposes note pitches up or down by one or more octaves. Like the _pitch_ sequence, it allows multiselection, doubling pitches across octaves.

- **ratchet**  
   The ratchet sequence divides a step into equidistant pulses, creating note rolls in a musical subdivision of the main pulse. This adds rhythmic variety as used extensively in the Berlin School of electronic music (e.g., Tangerine Dream).

- **control**  
   The control sequence sends a MIDI CC (Continuous Control) message to a configurable destination number, typically controlling synthesizer parameters like filter cutoff, resonance, and envelope settings. Tap the control destination number (e.g., 74 - Brightness) to select the output address. Channels can contain multiple control sequences for simultaneous parameter control.

- **pitch bend**  
   The pitch bend sequence sends a MIDI pitch bend message, altering MIDI note pitches by sub-semitone intervals. The exact alteration depends on the receiving MIDI device's implementation.

## Pattern transformations

Patterns can be instantly **transformed** by various actions, creating subtle or dramatic changes in the pattern. The available transformations are displayed in a horizontally scrollable area above the pattern grid of an expanded sequence cell. From left to right, they are:

<img src="../../assets/cykle/pattern_transformations.png" alt="cykle's pattern transformation options" width="700" />

- **on/off**  
   Turns the sequence on or off.

- **clock division**  
   Divides clock pulses on the specified cell, meaning every step of the sequence plays two or more times.

- **playback mode**
  Sets the way in which the sequence will play back. The available modes are: forward, backward, random, and jump.

- **clear**  
   Deletes all steps in the sequence.

- **add**  
  Appends a step to the sequence; sequence length can also be changed by dragging the resizing indicator to the right of the sequence grid.

- **remove**  
   Removes the last step from the sequence.

- **randomize**  
  Randomizes the sequence; for binary sequences, it produces a [Euclidean pattern](http://cgm.cs.mcgill.ca/~godfried/publications/banff.pdf), yielding more musically interesting results than pure randomness.

- **mutate**  
   Randomly changes one value in the pattern, introducing gradual change without altering the entire pattern.

- **shift left/right**  
  Shifts (or rotates) the sequence along its horizontal axis.

- **shift up/down**  
   Shifts or rotates the sequence along its vertical axis.

- **reverse**  
   Reverses the pattern.

- **invert**  
   Inverts the pattern; for binary patterns, active steps become inactive and vice versa. For scalar patterns, values are mirrored along the vertical axis.

- **multiply**  
   Doubles the pattern by duplicating existing steps.

- **bisect**  
   Bisects the pattern by removing the latter half of the steps.

## Pattern menu

<img src="../../assets/cykle/pattern_menu.png" alt="pattern menu" width="600">

Tapping the BPM indicator in the navigation bar opens the pattern menu, where you can set **tempo**, **swing**, **scale**, and **key** for the selected pattern.

In the AUv3 version, these settings are located in the hamburger menu on the top left. You can also edit global settings there, clear the current pattern, and copy/paste patterns between different AUv3 instances.

## Snapshot view

Tapping the letter displayed (e.g., A) on the top navigation bar reveals the **snapshot menu**. Snapshots store the current state of a pattern and allow to easily create and switch between different variations. Tap **+** to add a new snapshot to the pattern. Long press on a snapshot cell to delete or duplicate the current snapshot, or move its position.

## Song mode

<img src="../../assets/cykle/song_mode.png" alt="song mode" width="600">

By tapping the icon to the right of the snapshot menu, you open the **song mode** screen. Here you can activate/deactivate song mode, create a sequence of snapshots to play back in a specific order. Tap the **+** icon to add the selected snapshot to the song, drag its edges in the timeline view to change its length, use the arrow (< >) icons to change its position, and tap the trash icon to remove it from the song.

## Channel view

<img src="../../assets/cykle/channel_view.png" alt="channel view" width="600">

At the bottom of the main view is the channel view, where you can add and remove channels, with a maximum of 8. Note that the AUv3 version only has a single-channel, since you can open multiple instances of the plugin.

Swipe up on the channel view to reveal the channel configuration panel. Here, you can enable/disable the selected channel and choose its MIDI destination and output channel.

### MIDI input mode

Here, you can select the MIDI input mode. cykle can react to MIDI input by adjusting the pitches in the pattern to MIDI pitches sent to its input. Here you can choose between two input modes: 1) _Arp_ mode arpeggiates over the played notes, while _Chord_ mode plays them simultaneously, as a chord.

Long press on a channel cell to reveal a tooltip where you can delete or duplicate channels.

## Saving and loading patterns

Patterns can be loaded and saved via the main menu (accessible via the hamburger icon on the top left of the screen). Cykle ships with a number of factory patterns to use as presets or to serve as inspiration. Patterns in the AUv3 version are with the session of the host, and can be as presets in the host.

## Credits

**concept, design & development:** Corné Driesprong

**beta testers:** Rolf Seese, Jusep Torres Campalans, Trevor Llewellyn, Gad Baruch Hinkis and others.
