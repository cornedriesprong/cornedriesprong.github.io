// runs the wasm engine on the audio thread.
// TextEncoder/TextDecoder don't exist here, so strings cross the port as bytes.
class Ohm extends AudioWorkletProcessor {
  constructor(options) {
    super();
    this.wasm = new WebAssembly.Instance(
      options.processorOptions.module,
      {}
    ).exports;
    this.port.onmessage = ({ data }) => this.load(data);
  }

  view(ptr, len, Type = Uint8Array) {
    // memory may grow, so take a fresh view every time
    return new Type(this.wasm.memory.buffer, ptr, len);
  }

  // src: utf-8 bytes, fresh: drop the previous program's state
  load({ src, fresh }) {
    this.view(this.wasm.src_buffer(src.length), src.length).set(src);
    if (this.wasm.load(fresh)) return this.port.postMessage({ ok: true });
    const err = this.view(this.wasm.error_ptr(), this.wasm.error_len()).slice();
    this.port.postMessage({ ok: false, err });
  }

  process(_, [out]) {
    const n = out[0].length;
    const buf = this.view(
      this.wasm.process(n, sampleRate),
      n * 2,
      Float32Array
    );
    for (let c = 0; c < out.length; c++)
      for (let i = 0; i < n; i++) out[c][i] = buf[i * 2 + Math.min(c, 1)];
    return true;
  }
}

registerProcessor("ohm", Ohm);
