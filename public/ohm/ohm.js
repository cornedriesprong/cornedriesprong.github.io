// Turns every <script type="text/ohm"> into a playable editor.
// One engine is shared: playing a snippet swaps its program in.
//
//   <script type="module" src="ohm.js"></script>
//   <script type="text/ohm">
//   saw 220 * 0.2
//   </script>
//
// attributes:
//   inline   one line within text, with a play button
//   static   code only, not runnable (block or inline)
//   muted    runs and shows the scope, but makes no sound
//
// data-ohm-audio="off" on any ancestor (e.g. <body>) mutes its snippets by default.
// blocks have a button to mute and unmute.
//
// keys in an editor: cmd/ctrl+enter plays or reloads, escape stops, tab indents.
// inline: enter plays or reloads, escape stops.
// anywhere: cmd/ctrl+. stops, cmd/ctrl+m toggles mute.

const base = new URL(".", import.meta.url);
let engine; // promise of { ctx, node, analyser }
let active; // snippet that is sounding
const snippets = new WeakMap(); // root element → snippet
const replies = []; // resolvers of pending loads, answered in order

function start() {
  engine ??= (async () => {
    const ctx = new AudioContext();
    // fresh copies, so rebuilds show up without a hard reload
    await ctx.audioWorklet.addModule(
      new URL(`ohm-worklet.js?${Date.now()}`, base)
    );
    const module = await WebAssembly.compileStreaming(
      fetch(new URL("ohm_rs.wasm", base), { cache: "no-cache" })
    );
    const node = new AudioWorkletNode(ctx, "ohm", {
      outputChannelCount: [2],
      processorOptions: { module },
    });
    node.port.onmessage = ({ data }) => replies.shift()?.(data);
    node.onprocessorerror = () => {
      active?.showError("engine crashed, reload the page");
      active?.setPlaying(false);
      active = undefined;
    };
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    // after the analyser, so muted snippets still show on the scope
    const gain = ctx.createGain();
    node.connect(analyser).connect(gain).connect(ctx.destination);
    return { ctx, node, analyser, gain };
  })();
  return engine;
}

async function load(src, fresh) {
  const { node } = await start();
  const reply = new Promise(resolve => replies.push(resolve));
  node.port.postMessage({ src: new TextEncoder().encode(src), fresh });
  const { ok, err } = await reply;
  return ok ? null : new TextDecoder().decode(err);
}

export async function stop() {
  if (!active) return;
  active.setPlaying(false);
  active = undefined;
  (await engine).ctx.suspend();
}

// loads the snippet's source and makes it the active one
async function play(snippet) {
  let err;
  try {
    // reloading the active snippet keeps its state, anything else starts fresh
    err = await load(snippet.source, active !== snippet);
  } catch (e) {
    err = `could not start the engine: ${e.message}`;
  }
  snippet.showError(err);
  if (err) return; // the previous program keeps playing
  if (active !== snippet) {
    active?.setPlaying(false);
    active = snippet;
    snippet.setPlaying(true);
  }
  const { ctx, gain } = await engine;
  gain.gain.value = snippet.muted ? 0 : 1;
  await ctx.resume();
  if (!drawing) {
    drawing = true;
    requestAnimationFrame(draw);
  }
}

const speaker =
  '<svg viewBox="0 0 24 24" width="1.1em" height="1.1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4z"/>';
const icons = {
  on: `${speaker}<path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19 5a10 10 0 0 1 0 14"/></svg>`,
  off: `${speaker}<path d="m23 9-6 6"/><path d="m17 9 6 6"/></svg>`,
};

function mutedByDefault(script) {
  return (
    script.hasAttribute("muted") ||
    script.closest("[data-ohm-audio]")?.dataset.ohmAudio === "off"
  );
}

function setMuted(snippet, muted) {
  snippet.muted = muted;
  snippet.root.classList.toggle("ohm-muted", muted);
  if (snippet.mute) {
    snippet.mute.innerHTML = muted ? icons.off : icons.on;
    snippet.mute.setAttribute("aria-label", muted ? "unmute" : "mute");
  }
  if (active === snippet)
    engine.then(({ gain }) => (gain.gain.value = muted ? 0 : 1));
}

function setPlaying(root, button, playing) {
  const scope = root.querySelector(".ohm-scope");
  if (!playing)
    scope?.getContext("2d").clearRect(0, 0, scope.width, scope.height);
  root.classList.toggle("playing", playing);
  button.textContent = playing ? "■" : "▶";
  button.setAttribute("aria-label", playing ? "stop" : "play");
}

function dedent(text) {
  const lines = text.replace(/^\s*\n|\s+$/g, "").split("\n");
  const indent = Math.min(
    ...lines.filter(l => l.trim()).map(l => l.match(/^ */)[0].length)
  );
  return lines.map(l => l.slice(indent)).join("\n");
}

class Snippet {
  constructor(script) {
    this.root = document.createElement("div");
    this.root.className = "ohm";
    this.root.innerHTML = `
      <div class="ohm-row">
        <textarea spellcheck="false" autocapitalize="off" autocomplete="off"></textarea>
        <button type="button" class="ohm-play" aria-label="play">▶</button>
        <button type="button" class="ohm-mute"></button>
        <canvas class="ohm-scope"></canvas>
      </div>
      <pre class="ohm-error" hidden></pre>`;
    this.code = this.root.querySelector("textarea");
    this.button = this.root.querySelector("button");
    this.scope = this.root.querySelector("canvas");
    this.error = this.root.querySelector(".ohm-error");

    this.code.value = dedent(script.textContent);
    this.fit();
    this.code.addEventListener("input", () => this.fit());
    this.code.addEventListener("keydown", e => this.onKey(e));
    this.button.addEventListener("click", () =>
      active === this ? stop() : play(this)
    );
    this.mute = this.root.querySelector(".ohm-mute");
    this.mute.addEventListener("click", () => setMuted(this, !this.muted));
    setMuted(this, mutedByDefault(script));
    if (script.hasAttribute("muted")) {
      this.button.remove();
      this.scope.remove();
      this.scope = null;
    }
    snippets.set(this.root, this);
    script.replaceWith(this.root);
  }

  get source() {
    return this.code.value;
  }

  fit() {
    this.code.rows = this.code.value.split("\n").length;
  }

  onKey(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      play(this);
    } else if (e.key === "Escape") {
      stop();
    } else if (e.key === "Tab" && !e.shiftKey) {
      // indentation is syntax in ohm
      e.preventDefault();
      document.execCommand("insertText", false, "  ") ||
        this.code.setRangeText(
          "  ",
          this.code.selectionStart,
          this.code.selectionEnd,
          "end"
        );
    }
  }

  setPlaying(playing) {
    setPlaying(this.root, this.button, playing);
  }

  showError(err) {
    this.error.hidden = !err;
    this.error.textContent = err ?? "";
  }
}

// one line within text; errors show on hover
class Inline {
  constructor(script) {
    this.root = document.createElement("span");
    this.root.className = "ohm-inline";
    this.root.innerHTML = `<code></code><button type="button" class="ohm-play" aria-label="play">▶</button><canvas class="ohm-scope"></canvas>`;
    this.button = this.root.querySelector("button");
    this.code = this.root.querySelector("code");
    this.scope = this.root.querySelector("canvas");
    this.code.textContent = script.textContent.trim();
    this.code.spellcheck = false;
    this.code.contentEditable = "plaintext-only";
    if (this.code.contentEditable !== "plaintext-only")
      this.code.contentEditable = "true";
    this.code.addEventListener("keydown", e => this.onKey(e));
    this.code.addEventListener("paste", e => {
      // one line of plain text
      e.preventDefault();
      const text = e.clipboardData
        .getData("text/plain")
        .replace(/\s*\n\s*/g, " ");
      document.execCommand("insertText", false, text);
    });
    this.button.addEventListener("click", () =>
      active === this ? stop() : play(this)
    );
    setMuted(this, mutedByDefault(script));
    if (script.hasAttribute("muted")) {
      this.button.remove();
      this.scope.remove();
      this.scope = null;
    }
    snippets.set(this.root, this);
    script.replaceWith(this.root);
  }

  onKey(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      play(this);
    } else if (e.key === "Escape") {
      stop();
      this.code.blur();
    }
  }

  get source() {
    return this.code.textContent;
  }

  setPlaying(playing) {
    setPlaying(this.root, this.button, playing);
  }

  showError(err) {
    this.root.classList.toggle("error", !!err);
    this.root.title = err ?? "";
  }
}

// code that doesn't run
function staticCode(script) {
  const code = document.createElement("code");
  code.className = "ohm-static";
  if (script.hasAttribute("inline")) {
    code.textContent = script.textContent.trim();
    script.replaceWith(code);
  } else {
    code.textContent = dedent(script.textContent);
    const pre = document.createElement("pre");
    pre.className = "ohm-static";
    pre.append(code);
    script.replaceWith(pre);
  }
}

// oscilloscope of the active snippet, triggered on a rising zero crossing so it stands still
let samples,
  drawing = false;
async function draw() {
  drawing = !!active?.scope;
  if (!drawing) return;
  const { analyser } = await engine;
  const canvas = active?.scope;
  if (!canvas) return void (drawing = false);
  const dpr = devicePixelRatio;
  const w = Math.round(canvas.clientWidth * dpr);
  const h = Math.round(canvas.clientHeight * dpr);
  if (canvas.width !== w || canvas.height !== h)
    Object.assign(canvas, { width: w, height: h });

  samples ??= new Float32Array(analyser.fftSize);
  analyser.getFloatTimeDomainData(samples);
  const span = samples.length / 2;
  let start = 0;
  while (start < span && !(samples[start] <= 0 && samples[start + 1] > 0))
    start++;
  if (start === span) start = 0;

  const g = canvas.getContext("2d");
  g.clearRect(0, 0, w, h);
  g.strokeStyle = getComputedStyle(canvas).color;
  g.lineWidth = 1.5 * dpr;
  g.beginPath();
  for (let x = 0; x < w; x++) {
    const v = samples[start + Math.floor((x / w) * span)];
    g.lineTo(x, h / 2 - v * (h / 2) * 0.9);
  }
  g.stroke();
  requestAnimationFrame(draw);
}

const style = document.createElement("style");
style.textContent = `
  .ohm { --ohm-accent: var(--accent, #e8a33d); margin: 1em 0; }
  /* code | play | mute | scope, centered vertically; the code is as tall as its lines */
  .ohm-row { display: flex; align-items: center; gap: 0.6em; }
  .ohm textarea {
    flex: 1; min-width: 0; box-sizing: border-box; resize: none; overflow: hidden;
    font: inherit; font-family: ui-monospace, "SF Mono", Menlo, monospace; font-size: 0.8em; line-height: 1.5;
    color: var(--code-fg, inherit); background: var(--code-bg, rgba(127, 127, 127, 0.1));
    border: 1px solid transparent; border-radius: 6px;
    padding: 0.6em 0.8em; tab-size: 2; white-space: pre; overflow-x: auto;
  }
  .ohm textarea:focus { outline: none; border-color: var(--ohm-accent); }
  .ohm.playing textarea { border-color: var(--ohm-accent); }
  .ohm-play {
    font-size: 0.7em; width: 2.4em; height: 2.4em; border-radius: 50%; cursor: pointer; flex: none;
    border: 1px solid var(--ohm-accent); background: transparent; color: var(--ohm-accent);
  }
  .ohm .ohm-play { align-self: center; }
  .ohm.playing .ohm-play { background: var(--ohm-accent); color: var(--bg, #000); }
  /* muted: a dashed button, as it plays without sound */
  .ohm-muted > .ohm-play, .ohm-muted .ohm-row > .ohm-play { border-style: dashed; }
  .ohm-mute {
    flex: none; align-self: center; display: grid; place-items: center; padding: 0;
    font-size: 0.7em; width: 2.4em; height: 2.4em; border-radius: 50%; cursor: pointer;
    border: 1px solid var(--code-border, rgba(127, 127, 127, 0.25)); background: transparent; color: var(--ohm-accent);
  }
  .ohm-muted .ohm-mute { color: var(--muted, gray); }
  .ohm-scope {
    flex: none; width: 6em; aspect-ratio: 3 / 2; align-self: center; box-sizing: border-box;
    color: var(--ohm-accent);
  }
  .ohm-error { color: var(--error, #e5534b); font-size: 0.7em; margin: 0.4em 0 0; white-space: pre-wrap; }

  .ohm-inline { --ohm-accent: var(--accent, #e8a33d); white-space: nowrap; }
  .ohm-inline .ohm-play { font-size: 0.45em; vertical-align: 0.35em; margin: 0 0.6em 0 0.8em; }
  .ohm-inline .ohm-scope { width: 1.8em; vertical-align: middle; }
  .ohm-inline code { cursor: text; outline: none; border-radius: 3px; padding: 0 0.15em; }
  .ohm-inline code:hover { box-shadow: 0 1px 0 var(--code-border, rgba(127, 127, 127, 0.4)); }
  .ohm-inline code:focus { background: var(--code-bg, rgba(127, 127, 127, 0.1)); box-shadow: 0 0 0 1px var(--ohm-accent); }
  .ohm-inline.playing .ohm-play { background: var(--ohm-accent); color: var(--bg, #000); }
  .ohm-inline.error code { text-decoration: wavy underline var(--error, #e5534b); }
  pre.ohm-static {
    margin: 1em 0; padding: 0.6em 0.8em; line-height: 1.5; overflow-x: auto;
    background: var(--code-bg, rgba(127, 127, 127, 0.1));
    border: 1px solid transparent; border-radius: 6px;
  }
  pre.ohm-static code { font-size: 0.8em; color: var(--code-fg, inherit); }
`;
document.head.append(style);

// cmd/ctrl+. stops playback anywhere on the page
document.addEventListener("keydown", e => {
  if ((e.metaKey || e.ctrlKey) && e.key === ".") {
    e.preventDefault();
    stop();
  } else if ((e.metaKey || e.ctrlKey) && e.key === "m") {
    // the playing snippet, or else the focused one
    const snippet =
      active ??
      snippets.get(document.activeElement?.closest(".ohm, .ohm-inline"));
    if (!snippet) return;
    e.preventDefault();
    setMuted(snippet, !snippet.muted);
  }
});

export function upgrade(root = document) {
  root.querySelectorAll('script[type="text/ohm"]').forEach(script => {
    if (script.hasAttribute("static")) staticCode(script);
    else if (script.hasAttribute("inline")) new Inline(script);
    else new Snippet(script);
  });
}

upgrade();
