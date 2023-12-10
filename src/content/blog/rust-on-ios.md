---
author: Corné Driesprong
pubDatetime: 2023-12-10T18:52:00Z
title: Using Rust in an iOS audio app
postSlug: rust-on-ios
featured: true
draft: false
tags:
  - iOS, MacOS, Rust, C, C++, Swift, audio
ogImage: ""
description: My experiences using Rust in an iOS audio app
---

In a recent project, I decided to try using [Rust](https://www.rust-lang.org/) together with Swift in a cross-platform iOS/MacOS (SwiftUI) audio app. I wrote the real-time audio generation part of the code in Rust, while building out the user interface in Swift and SwiftUI using Apple's SDKs. Even though for this project I eventually went with C++ instead of Rust (for reasons outlined below), I felt that it was worth mentioning some things about my experience using Rust in this context.

A Github repository with an example project that integrates Rust into an iOS codebase can be found [here](https://github.com/cornedriesprong/SwiftRustAudioExample).

## Why Rust?

> The goal of the Swift project is to create the best available language for uses ranging from **systems programming**, to mobile and desktop apps, scaling up to cloud services. (...) - [Swift.org](https://www.swift.org/) (emphasis mine)

Even though Apple has been calling Swift as a "language for [...] _systems programming_", this seems mostly marketing hyperbole and as of yet Swift can't realistically be called a systems programming language. Even though there are [some proposals](https://forums.swift.org/t/a-roadmap-for-improving-swift-performance-predictability-arc-improvements-and-ownership-control/54206) underway towards fully deterministic performance characteristics and enabling Swift on [embedded](https://github.com/swift-embedded/swift-embedded) systems, many standard language features (such as reference types, generics or anything calling into the Objective-C runtime) are currently realtime-unsafe, making the language largely unsuitable for systems- or audio programming work unless you're extremely careful and have a lot of in-depth knowledge about the implementation details of the language itself (which may be subject to change in future versions)[^2]. Therefore, even Apple themselves at this point don't formally endorse using Swift for audio programming, as is shown by the fact that the Audio Unit Extension template in the latest version of Xcode still generates a whole bunch of C++ code to facilitate realtime-safe DSP[^3].

Even though C++ is the industry standard for realtime audio programming[^5], it's not without its shortcomings. C++ is a large, complex language with a lot of legacy baggage that is hard to use correctly for a relative newcomer like myself. In terms of alternatives to C++, for audio programming we are limited to languages that have deterministic runtime behaviour. The most obvious contender is Rust, which has been gaining a reasonable amount of traction in the audio development community in recent years[^4]. Rust uniquely offers memory safety without the runtime overhead (such as a garbage collector) that make most other memory-safe languages unsuitable for use in a realtime context. Also, while the security guarantees that memory safety give you may not be a primary concern in audio apps, it does eliminate a whole class of bugs that tend to come up quite frequently in audio development such as out-of-bounds access and use-after-free. Moreover, Rust offers really nice facilities for concurrency and multithreading, which are really useful in audio programming.

To summarize: Swift is as of yet unsuitable for realtime audio programming. While C++ is the obvious candidate and is well-integrated into Apple's systems, Rust is a promising alternative that addresses many of its shortcomings, so I was curious to try it out.

## Rust vs Swift

Rust is known to have a steep learning curve, but having experience in various other languages including Swift and C++, I didn’t find it too hard to pick up. Of course, I did struggle a bit with the borrow checker. Furthermore, Rust's influence on Swift is quite obvious[^9], for example in its use of optionals and its extensive pattern matching capabilities, so I found that a lot of my Swift knowledge carried over to Rust. In fact, I can see a lot of overlap between the two languages, to the point where Swift feels like a slightly more verbose yet more approachable Rust; both share a similarly strict yet expressive type system—with Swift using automatic reference counting instead of Rust's borrow checker, as well as less explicit move and copy semantics (i.e., implicit copy-on-write), structured concurrency (since Swift 5.5) and support for more "classic" object-oriented features (classes and inheritance) while also supporting Rust's composition-over-inheritance model of polymorphism via protocols (called _traits_ in Rust). Furthermore, both are rather large, featureful languages supporting multiple programming-paradigms, though not (yet) as large and convoluted as C++.

## Setting up Rust in an Xcode project

Rust has a Foreign Function Interface (FFI) which allow it to interoperate with other languages via a standard C header. Setting up Rust code in an Xcode project involves a lot of fiddly configuration, including editing the Xcode project file by hand, but once set up it seems to work pretty well, with Xcode automatically (re)compiling the Rust code along with the other source code via a build script. Apparently, there used to be a Cargo[^4] subcommand called [`lipo`](https://github.com/TimNN/cargo-lipo) to automatically create universal libraries for iOS, but this project seems to have been deprecated in favor of the approach outlined here. To set up Rust in an iOS project, I followed the steps in [this tutorial](https://blog.mozilla.org/data/2022/01/31/this-week-in-glean-building-and-deploying-a-rust-library-on-ios/) so I won't repeat them here extensively. In summary:

1. In your Xcode project, create a new Rust static library using Cargo, Rust's package manager.
2. Link the Rust library to your Xcode target. This involves editing the Xcode project file by hand, setting the library search path.
3. Add a build script phase which compiles the Rust library from Xcode.
4. Disable `ENABLE_USER_SCRIPT_SANDBOXING` in the build settings for Xcode to be able to run the build script (this is not mentioned in the tutorial above!)
5. Create a FFI (Foreign Function Interface) C header file for your Rust library. Note that if you want to call them from C++ (or Objective-C++, for that matter) you'll need to wrap the function declarations in `extern "C" { ... }` blocks.
6. Import the FFI C header and call the render from your audio callback.

In this example, we'll create the "Hello World" of audio programming (rendering a sine wave) in Rust, so we define a `Sine` struct inside our `lib.rs` file:

```rust
struct Sine {
    frequency: f32,
    sample_rate: f32,
    phase: f32,
}
```

For its implementation, we provide an initializer (`new`) and a render method that actually produces the sound samples:

```rust
impl Sine {
    fn new(frequency: f32, sample_rate: f32) -> Self {
        Self {
            frequency,
            sample_rate,
            phase: 0.0,
        }
    }

    #[inline]
    fn render(&mut self) -> f32 {
        let value =
            (self.phase * self.frequency * 2.0 * std::f32::consts::PI / self.sample_rate).sin();
        self.phase = (self.phase + 1.0) % self.sample_rate;
        value
    }
}
```

Next, we create an init function that we can call from our app code, that creates an instance of the `Sine` object and passes a pointer to it to our app code[^6]. Note that we need to mark this function as `extern "C"` so that it can be called via the FFI:

```rust
#[no_mangle]
pub extern "C" fn sine_init(sample_rate: f32) -> Box<Sine> {
    let sine = Sine::new(440.0, sample_rate);

    return Box::new(sine);
}
```

Because we're communicating via a C header, we can't use Rust or Objective-C's object-oriented features. Therefore, we're using the C convention of passing a pointer to an object around to the functions that need it (such as the `render` function below). Finally, we define a render function that we can call from our audio callback:

```rust
#[no_mangle]
pub extern "C" fn render(sine: &mut Sine) -> c_float {
    sine.render()
}
```

Now, in the initializer of our Audio Unit, we can instantiate the `Sine` object as follows (I've defined `_sine` as a member variable on the Objective-C++ Audio Unit class):

```c
_sine = sine_init(self.outputBus.format.sampleRate);
```

Finally, in our Audio Unit's render callback, we can call the `render` function like so:

```objective-c
return ^AUAudioUnitStatus(AudioUnitRenderActionFlags *actionFlags,
                          const AudioTimeStamp *timestamp,
                          AVAudioFrameCount frameCount,
                          NSInteger outputBusNumber,
                          AudioBufferList *outputData,
                          const AURenderEvent *realtimeEventListHead,
                          AURenderPullInputBlock __unsafe_unretained pullInputBlock) {

  for (AVAudioFrameCount i = 0; i < frameCount; ++i) {
      // call the render function for every audio frame
      // and write the result to the output buffer
      float s = render(self->_sine);
      ((float*)outputData->mBuffers[0].mData)[i] = s;
      ((float*)outputData->mBuffers[1].mData)[i] = s;
  }

  return noErr;
};
```

### Pros and cons

Because of the number of manual steps involved in getting Rust code to compile nicely alongside an Mac/iOS project, I would be hesitant to use this setup in a large production application out of fear that things might break with future Xcode updates. But for a personal project I'd be willing to take that risk. Apart from that, my general impression so far is pretty positive despite some caveats. Here are some pros and cons I found:

**Pros:**

- Rust has really nice built-in facilities for concurrency and multithreading, which are very useful for realtime programming where you often have to pass data between the UI and the audio thread in a safe way. In cases where the standard library doesn’t provide everything you need, the [crossbeam](https://github.com/crossbeam-rs/crossbeam) crate is really nice.
- Since I'm not a full-time C/C++ programmer, I don't feel super confident using it knowing all the ways that you can shoot yourself in the foot. I found that the safety and strictness of Rust to provide a nice guardrail for all the potential mistakes C and C++ let you make.
- Having all the high-level abstractions that Rust provides (in terms of error handling, generics and collection methods such as `map`, `filter` and `fold`, for example) available in the standard library at no runtime cost feels pretty luxurious for such a low-level language, and often feels like the best of both worlds (low-level control + high-level abstractions).
- Cargo is a really nice, batteries-included package manager and test runner. The other tooling around Rust (i.e., formatter, linter, LSP-support) is also pretty nice, especially compared to C/C++.

**Cons:**

- One of Rust’s strengths is in its memory safety. However, all of these go out the window at the FFI boundary, making this particular setup (Swift and/or Objective-C code calling into Rust and vice-versa) prone to breaking, despite Rust’s safety guarantees.
- Since you’re limited to communicating with Rust via C functions and data types, you lose the convenience of Rust’s object orientation, and sharing more complex data types between languages can be tricky. This is especially true compared to Swift, which now supports [C++ interoperability](https://www.swift.org/documentation/cxx-interop/).
- Obviously, Xcode doesn’t support debugging Rust the same way it does across Swift, Objective-C and C++.

Because of these downsides, I eventually decided to go back to C++ for my iOS/Mac audio development. This has little to do with Rust itself, but more with the tooling support for my specific use case. Xcode is still the only feasible IDE to develop iOS or Mac apps in, and it has first class support for C++ and none for Rust. Therefore, I found the experience to be lacking. I suppose this is less of a project if the work is split up between people or teams (working separately on Swift and Rust codebases), but in my case it's just really nice to be able to run and debug code across language boundaries. Despite these downsides, I still think Rust is a very promising language for audio development, and I'm looking forward to seeing how it evolves in the future.

[^1]: Source: https://www.swift.org/server/
[^2]: For a more in-depth review of the non-realtime safe aspects of Swift and Objective-C, see [Four Common Mistakes in Audio Development](https://atastypixel.com/four-common-mistakes-in-audio-development/).
[^3]: Apple's developer documentation for writing Audio Units states: "_A class called FilterDSPKernel provides the plug-in’s digital signal processing (DSP) logic, and is written in C++ to ensure real-time safety_" ([source](https://developer.apple.com/documentation/audiotoolbox/audio_unit_v3_plug-ins/creating_custom_audio_effects)). See also [Is Swift really not performant enough for realtime audio?](https://forums.swift.org/t/is-swift-really-not-performant-enough-for-realtime-audio/65372).
[^4]: For instance, at this year's Audio Developer Conference (2023) there have been a number of talks about using Rust for audio development. For a good introduction on the merits of Rust for audio development, check out this talk by Ian Hobson called [An introduction to Rust for audio developers](https://www.youtube.com/watch?v=Yom9E-67bdI&t=783s).
[^5]: I should mention that Python is used quite a lot in audio programming contexts where realtime performance is not a requirement, but as a dynamic, interpreted, garbage-collected is not suitable for contexts where realtime performance is a requirement (arguably even less so than Swift).
[^6]: Since we have to communicate between Rust and our app code via C functions, we can't use any of the object-oriented features of neither Rust or C++/Objective-C, which is why we're passing pointers around rather than calling methods on objects.
[^9]: Rust's influence on Swift is mentioned by Swift's creator, Chris Lattner, on [his homepage](https://nondot.org/sabre/)
