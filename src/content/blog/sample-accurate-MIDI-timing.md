---
author: Corné Driesprong
pubDatetime: 2023-04-28T14:50:00Z
title: Sample accurate MIDI timing in AUv3 plugins
postSlug: sample-accurate-MIDI-timing
featured: true
draft: false
tags:
  - iOS, MIDI, Audio Unit, AUv3, sequencer, timing
ogImage: ""
description: How to obtain sample accurate MIDI timing in the context of AUv3 plugins
---

## Preface

One of the biggest technical challenges I faced while building my MIDI sequencer AUv3[^1] plugins **[cykle](https://cp3.io/cykle)** and **[polybeat](https://cp3.io/polybeat)** was obtaining sample-accurate MIDI sequencing. Ensuring precise MIDI event timing on a sample-level is crucial for accurate playback. Since not all AUv3 plugins appear to do this correctly[^2], I've written this post to explain how I do these calculations in my apps.

A Github repository containing the code from this article can be found <a href="https://github.com/cornedriesprong/AUv3SequencerExample" target="_blank">here</a>.

## Timing calculations

To obtain sample-accurate MIDI timing, calculations should be performed in a realtime context: on the audio thread. For an AUv3 plugin, this means doing these calculations in the block returned by the `internalRenderBlock` method of the Audio Unit class[^6].

In the render callback we must cache (at least) two blocks provided by the Audio Unit host: `AUHostMusicalContextBlock` and `AUMIDIOutputEventBlock`[^4]. The former is used for obtaining information on the host sequencer's current musical time, while the latter is needed for passing timestamped MIDI data back to the host for playback.

A naive approach would be to generate MIDI events and send them back to the host immediately, using a timestamp of either zero or `AUEventSampleTimeImmediate`, like so:

```c
// a MIDI note-on event with pitch 48 and a velocity of 100
uint8_t midiData[] = { 0x90, 48, 100 };

// sending the MIDI event to the output
midiOutputBlock(AUEventSampleTimeImmediate, 0, sizeof(midiData), midiData);
```

Many apps and plugins seem to handle MIDI data this way, as if it was a realtime-system: generating a MIDI event without a timestamp and output it immediately. This causes the MIDI event to be delivered at the start of the next audio buffer. While this effect might not be particularly noticeable with smaller buffer sizes (such as 128 or 256 samples), it becomes more apparent with larger buffer sizes (> 512 samples), resulting in significant timing jitter.[^3].

To properly timestamp MIDI events, an offset from the start of the buffer in samples is required[^8]. This can be achieved by adding an `offset` to the `mSampleTime` provided by the `timestamp` argument given to the render block:

```c
AUEventSampleTime sampleTime = timestamp->mSampleTime + offset;
midiOutputEventBlock(sampleTime, 0, midi.length, midi);
```

But how to calculate this `offset`? First, we need the following information:

1. The current tempo (e.g., 120 beats per minute) and beat position (e.g., 1.25) of the host sequencer, provided via the `AUHostMusicalContextBlock`;
2. the current sample rate of the output bus;
3. the length of the current buffer, via the `frameCount` argument provided to the render block.

```c
// get the tempo and beat position
double tempo;
double beatPosition;
musicalContextBlock(&tempo, NULL, NULL, &beatPosition, NULL, NULL);

// get the frame rate and buffer length (frame count) for the audio context
double sampleRate = self.outputBus.format.sampleRate;
double frameCount = 512; // this is passed to the render block by CoreAudio
```

Using the provided information, we can determine the host transport's current beat position (modulo the internal sequencer buffer's loop length), the sequencer buffer's length in samples, and the buffer start and end times.

```c
// the length of the sequencer loop in musical time (8.0 == 8 quarter notes)
double lengthInSamples = sequence.length / tempo * 60. * sampleRate;
double beatPositionInSamples = beatPosition / tempo * 60. * sampleRate;

// the sample time at the start of the render cycle, as given by the render block,
// modulo the length of the sequencer loop
double bufferStartTime = fmod(beatPositionInSamples, lengthInSamples);
// the end time is the start time + the number of frames in the render cycle (e.g., 512)
double bufferEndTime = bufferStartTime + frameCount;
```

With the buffer start and end times available, we can identify any MIDI events that should be scheduled for playback within the current render cycle. This might look something like this:

```c
// loop over the events in the sequencer buffer to check whether
// they should be scheduled in the current render cycle
for (int i = 0; i < sequence.eventCount; i++) {
  // get the event timestamp, given in musical time (e.g., 1.25)
  MIDIEvent event = sequence.events[i];
  // convert the event's timestamp to sample time (e.g, 55125)
  double eventTime = event.timestamp / tempo * 60. * sampleRate;
  // check whether the event should be scheduled in the current cycle
  bool shouldPlay = eventTime >= bufferStartTime && eventTime < bufferEndTime;

  if (shouldPlay) {
    // ...if so, calculate the timing offset
    double offset = eventTime - bufferStartTime;

    // add the offset to the absolute timestamp
    AUEventSampleTime sampleTime = timestamp->mSampleTime + offset;
    uint8_t cable = 0;
    uint8_t midiData[] = { event.status, event.data1, event.data2 };
    // pass events to the MIDI output block provided by the host
    midiOutputBlock(sampleTime, cable, sizeof(midiData), midiData);
  }
}
```

We calculate the offset by subtracting the sample time at the render cycle's start (modulo the sequencer loop's length) from the event timestamp (in samples). This provides the exact offset to add to the absolute sample time at the render cycle's beginning (timestamp->mSampleTime) for a sample-accurate timestamp passed to the host.

> consider collecting all the current render cycle's events and calling the midiOutputBlock only once. Note that, depending on buffer size and MIDI event density, multiple output block calls within a single render cycle might be needed if events with different timestamps occur in the same cycle[^5]. For simplicity, these considerations are omitted here.

Now the events should be timestamped correctly, however you may observe some skipped events. This happens when a sequencer loop transition occurs during a render cycle (i.e., bufferStartTime is later than bufferEndTime due to loop wrapping), and events for the next loop's beginning should already be scheduled. This can be addressed as follows:

```c
double lengthInSamples = sequence.length / tempo * 60. * sampleRate;
double bufferEndTime = bufferStartTime + frameCount;
// check whether there is a loop transition during the current render cycle
// and whether the event should occur at the beginning of the next sequencer loop
bool loopsAround = bufferEndTime > lengthInSamples
  && eventTime < fmod(bufferEndTime, lengthInSamples);
// if loopsAround == true, we should schedule the event...
```

Here, we verify whether a loop transition is occurring and if the current event should be scheduled within the current buffer, specifically at the start of the next loop. If this is true, we need to add the remaining frames of the current buffer to the offset:

```c
if (loopsAround) {
  // in case of a loop transition, add the remaining frames of the current buffer to the offset
  double remainingFramesInBuffer = lengthInSamples - bufferStartTime;
  offset = eventTime + remainingFramesInBuffer;
}
```

Eventually, our render block should look something like this:

```c
- (AUInternalRenderBlock)internalRenderBlock {

  // cache the musical context and MIDI output blocks provided by the host
  __block AUHostMusicalContextBlock musicalContextBlock = self.musicalContextBlock;
  __block AUMIDIOutputEventBlock midiOutputBlock = self.MIDIOutputEventBlock;

  // get the current sample rate from the output bus
  __block double sampleRate = self.outputBus.format.sampleRate;

  return ^AUAudioUnitStatus(AudioUnitRenderActionFlags  *actionFlags,
                            const AudioTimeStamp        *timestamp,
                            AVAudioFrameCount           frameCount,
                            NSInteger                   outputBusNumber,
                            AudioBufferList             *outputData,
                            const AURenderEvent         *realtimeEventListHead,
                            AURenderPullInputBlock      __unsafe_unretained pullInputBlock) {

    // get the tempo and beat position from the musical context provided by the host
    double tempo;
    double beatPosition;
    musicalContextBlock(&tempo, NULL, NULL, &beatPosition, NULL, NULL);

    // the length of the sequencer loop in musical time (8.0 == 8 quarter notes)
    double lengthInSamples = sequence.length / tempo * 60. * sampleRate;
    double beatPositionInSamples = beatPosition / tempo * 60. * sampleRate;

    // the sample time at the start of the buffer, as given by the render block,
    // ...modulo the length of the sequencer loop
    double bufferStartTime = fmod(beatPositionInSamples, lengthInSamples);
    double bufferEndTime = bufferStartTime + frameCount;

    for (int i = 0; i < sequence.eventCount; i++) {
      // get the event timestamp, given in musical time (e.g., 1.25)
      MIDIEvent event = sequence.events[i];
      // convert the timestamp to sample time (e.g, 55125)
      double eventTime = event.timestamp / tempo * 60. * sampleRate;

      bool eventIsInCurrentBuffer = eventTime >= bufferStartTime && eventTime < bufferEndTime;
      // there is a loop transition in the current buffer
      bool loopsAround = bufferEndTime > lengthInSamples
        && eventTime < fmod(bufferEndTime, lengthInSamples);

      // check if the event should occur within the current buffer OR there is a loop transition
      if (eventIsInCurrentBuffer || loopsAround) {
        // calculate the timing offset
        double offset = eventTime - bufferStartTime;

        if (loopsAround) {
          // in case of a loop transitition, add the remaining frames
          // of the current buffer to the offset
          double remainingFramesInBuffer = lengthInSamples - bufferStartTime;
          offset = eventTime + remainingFramesInBuffer;
        }

        // add the offset to the absolute timestamp
        AUEventSampleTime sampleTime = timestamp->mSampleTime + offset;
        uint8_t cable = 0;
        uint8_t midiData[] = { event.status, event.data1, event.data2 };
        // pass events to the MIDI output block provided by the host
        midiOutputBlock(sampleTime, cable, sizeof(midiData), midiData);
      }
    }

    return noErr;
  };
}
```

There's more to building a complete MIDI sequencer, such as safely passing sequencer data from the main thread to the audio thread (via a FIFO-buffer), but those are mostly covered elsewhere[^7].

## Addendum: CoreMIDI

One more aspect worth mentioning is the conversion of sample-based timestamps from an AUv3 plugin to CoreMIDI timestamps, considering the AUv3 host's perspective. CoreMIDI uses host ticks (e.g., `mach_absolute_time()`) rather than samples for timestamps. Here's how I ended up converting between the two:

```c
// get the platform specific timebase to be able to convert from ticks to milliseconds
mach_timebase_info_data_t info;
mach_timebase_info(&info);

// get the conversion factor to convert from milliseconds to host ticks
double msToHostTicks = 1.0 / (((double)info.numer / (double)info.denom) * 1.0e-6);

// get the sample rate from the shared AVAudioSession instance and convert to Khz
double sampleRateInKhz = [AVAudioSession sharedInstance].sampleRate / 1000.0;

// use the sample rate and the conversion factor to convert from samples to host ticks
double timestampInHostTicks = (sampleTime / sampleRateInKhz) * msToHostTicks;
```

I hope that the above will be valuable for those interested in implementing precise timing in AUv3 plugins or apps. Keep in mind that a typical music-making session involves many Audio Unit-plugins working together, so every Audio Unit should be a good citizen and provide correctly timestamped MIDI events. For inquiries or feedback, feel free to reach out via email. The code referenced is available as an AUv3 extension within an Xcode project in in <a href="https://github.com/cornedriesprong/AUv3SequencerExample" target="_blank">this repository</a>.

[^1]: Audio Unit version 3, a type of audio plugin by Apple that works cross-platform on Mac, iOS and iPadOS.
[^2]: Refer to <a href="https://forum.audiob.us/discussion/46251/let-s-talk-about-midi-sequencer-timing" target="_blank">this thread on the AudioBus forum</a> for an overview of the plugin ecosystem regarding this issue.
[^3]: The human ear is extremely sensitive to timing fluctuations. An non-timestamped MIDI event during audio playback with a buffer size of 256 with a sample rate of 48000 Hz results in a latency of up to 5~ ms which is already noticeable.
[^4]: For an explanation of how to implement a MIDI AUv3 plugin, see <a href="https://ruismaker.com/au-midi-plugins/" target="_blank">Bram Bos' article on the subject</a>, and <a href="http://devnotes.kymatica.com/ios_midi_timestamps" target="_blank">Jonathan Liljedahl's article on iOS MIDI timestamps</a>.
[^5]: Be prepared for your callback and timing calculations to handle all kinds of unusual buffer sizes, including ones that aren’t multiples of 64, 128, 256, etc. in case of sample rate conversion. Also, some hardware, such as Apple Airpods, are known to throw unusual buffer sizes at the audio system.
[^6]: It is crucial not to allocate any memory on the on the audio thread. For an extended discussion of this subject, see Michael Tyson's article <a href="https://atastypixel.com/blog/four-common-mistakes-in-audio-development/" target="_blank">Four common mistakes in audio development</a>.
[^7]: The <a href="https://github.com/cornedriesprong/AUv3SequencerExample" target="_blank">repo</a> contains an example of how to do this. Also, see <a href="https://atastypixel.com/blog/four-common-mistakes-in-audio-development/" target="_blank">Four common mistakes in audio development</a> for more in-depth information about the subject.
[^8]: For example, at a sample rate of 48Khz, an offset of 48 samples equals one millisecond.
