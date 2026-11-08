// step-through of one sample frame on the ohm vm of
//   saw {110 220} * 0.5 -> mix
// usage: <div class="vm-trace"></div> <script type="module" src="assets/vm-trace.js"></script>
// click or "." steps forward, "," steps back

const SR = 48000;
// in the order the compiler inserts them
const slots = ["output/0/node/0/lhs/osc", "output/0/node/1/lhs/osc"];
// phases picked for round outputs: saw 0.8 and 0.5
const initial = [0.1, 0.25];

// as in vm.rs, without the polyblep correction (zero away from the jump)
const saw = p => 1 - 2 * p;

const num = v => String(+v.toFixed(3));
const phase = v => v.toFixed(5);

function osc(vm, name, wave, slot) {
  const offset = vm.pop();
  const freq = vm.top();
  const p = vm.read(slot);
  const out = wave((p + offset.v) % 1);
  const next = (p + freq.v / SR) % 1;
  vm.replace(out);
  vm.write(slot, next);
  return `pop offset ${num(offset.v)} · read phase · ${name} → ${num(out)} · advance phase`;
}

function mul(vm) {
  const b = vm.pop().v;
  const a = vm.top().v;
  vm.replace(a * b);
  return `pop ${num(b)} · ${num(a)} × ${num(b)} → ${num(a * b)}`;
}

function mix(vm, length) {
  const items = Array.from({ length }, () => vm.pop().v).reverse();
  const sum = items.reduce((a, b) => a + b, 0);
  vm.push(sum);
  return `pop ${length} items · ${items.map(num).join(" + ")} → ${num(sum)}`;
}

const voice = (freq, slot) => [
  [`Num ${freq}`, vm => (vm.push(freq), `push ${freq} (frequency)`)],
  ["Num 0", vm => (vm.push(0), "push 0 (phase offset)")],
  ["Osc saw", vm => osc(vm, "saw", saw, slot)],
  ["Num 0.5", vm => (vm.push(0.5), "push 0.5")],
  ["Mul", mul],
];
// in program order
const ops = [...voice(110, 0), ...voice(220, 1), ["Mix 2", vm => mix(vm, 2)]];

// runs the frame once, keeping a snapshot after every opcode
function trace() {
  let id = 0;
  const vm = {
    stack: [],
    state: [...initial],
    out: [null],
    push(v) {
      this.stack.push({ v, id: id++ });
    },
    pop() {
      const item = this.stack.pop();
      this.popped.push(item);
      return item;
    },
    top() {
      return this.stack[this.stack.length - 1];
    },
    replace(v) {
      this.pop();
      this.push(v);
    },
    read(slot) {
      this.reads.add(slot);
      return this.state[slot];
    },
    write(slot, v) {
      this.writes.add(slot);
      this.state[slot] = v;
    },
  };
  const snapshot = (pc, note) => ({
    pc,
    note,
    stack: [...vm.stack],
    popped: vm.popped,
    reads: vm.reads,
    writes: vm.writes,
    state: [...vm.state],
    out: [...vm.out],
  });
  const reset = () =>
    Object.assign(vm, { popped: [], reads: new Set(), writes: new Set() });

  reset();
  const frames = [snapshot(-1, "")];
  ops.forEach(([, run], pc) => {
    reset();
    frames.push(snapshot(pc, run(vm)));
  });
  reset();
  vm.out[0] = vm.pop().v;
  frames.push(snapshot(ops.length, `pop ${num(vm.out[0])} → out 0`));
  return frames;
}

const css = `
.vm-trace {
  font: min(1.7vw, 3.2vh)/1.4 ui-monospace, "SF Mono", Menlo, monospace;
  display: grid;
  gap: 1.2em;
  margin: 1em 0;
  cursor: pointer;
  user-select: none;
  --vt-line: var(--code-border, #d9d3c6);
  --vt-accent: var(--accent, #c4741a);
  --vt-muted: var(--muted, #77716a);
}
.vm-trace h4 { margin: 0 0 0.4em; font-weight: normal; color: var(--vt-muted); }
.vt-cell {
  border: 1px solid var(--vt-line);
  padding: 0.3em 0.6em;
  text-align: center;
  white-space: nowrap;
}
.vt-ops { display: flex; flex-wrap: wrap; gap: 0.3em; }
.vt-ops .vt-cell { color: var(--vt-muted); }
.vt-ops .vt-done { color: inherit; }
.vt-ops .vt-pc { color: var(--vt-accent); border-color: var(--vt-accent); box-shadow: inset 0 0 0 1px var(--vt-accent); }
.vt-note { margin: 0; min-height: 1.4em; }
.vt-main { display: grid; grid-template-columns: 8em auto auto; gap: 3em; align-items: end; justify-content: start; }
.vt-stack .vt-cells { display: flex; flex-direction: column-reverse; gap: 0.3em; }
.vt-stack .vt-cell { height: 1.4em; }
.vt-stack .vt-new { color: var(--vt-accent); border-color: var(--vt-accent); }
.vt-state table { border-collapse: collapse; }
.vt-state td { border: 1px solid var(--vt-line); padding: 0.3em 0.6em; }
.vt-state td:last-child { text-align: right; min-width: 5em; }
.vt-state .vt-read td:last-child { color: var(--vt-accent); }
.vt-state .vt-write td:last-child { color: var(--vt-accent); box-shadow: inset 0 0 0 1px var(--vt-accent); }
.vt-out .vt-cells { display: grid; grid-template-columns: auto 5em; gap: 0.3em 0.6em; align-items: center; }
.vt-out .vt-new { color: var(--vt-accent); border-color: var(--vt-accent); }
.vt-nav { display: flex; gap: 0.6em; align-items: center; color: var(--vt-muted); }
.vt-nav button {
  font: inherit; color: inherit; background: none; cursor: pointer;
  border: 1px solid var(--vt-line); border-radius: 4px; width: 2em; height: 2em;
}
.vt-anim .vt-new { animation: vt-in 0.35s ease-out; }
.vt-anim .vt-gone { animation: vt-gone 0.35s ease-in forwards; }
.vt-anim .vt-write td:last-child { animation: vt-flash 0.5s ease-out; }
@keyframes vt-in { from { opacity: 0; transform: translateY(-0.8em); } }
@keyframes vt-gone { from { color: var(--vt-accent); } to { color: transparent; } }
@keyframes vt-flash { from { background: color-mix(in srgb, var(--vt-accent) 25%, transparent); } }
`;

function render(root, frames, i, animate) {
  const f = frames[i];
  const prev = frames[i - 1];
  const fresh = new Set(
    prev ? f.stack.filter(s => !prev.stack.includes(s)).map(s => s.id) : []
  );
  const depth = Math.max(5, f.stack.length + f.popped.length);

  const opCells = ops
    .map(([label], pc) => {
      const cls = pc === f.pc ? "vt-pc" : pc < f.pc ? "vt-done" : "";
      return `<span class="vt-cell ${cls}">${label}</span>`;
    })
    .join("");

  const stack = [
    ...f.stack.map(
      s =>
        `<span class="vt-cell ${fresh.has(s.id) ? "vt-new" : ""}">${num(s.v)}</span>`
    ),
    // popped items leave from the top
    ...(animate
      ? [...f.popped]
          .reverse()
          .map(s => `<span class="vt-cell vt-gone">${num(s.v)}</span>`)
      : []),
  ];
  while (stack.length < depth) stack.push(`<span class="vt-cell"></span>`);

  const state = slots
    .map((name, s) => {
      const cls = f.writes.has(s)
        ? "vt-write"
        : f.reads.has(s)
          ? "vt-read"
          : "";
      return `<tr class="${cls}"><td>${name}</td><td>${phase(f.state[s])}</td></tr>`;
    })
    .join("");

  const out = f.out
    .map((v, c) => {
      const cls = v !== null && prev?.out[c] === null ? "vt-new" : "";
      return `<span>out ${c}</span><span class="vt-cell ${cls}">${v === null ? "" : num(v)}</span>`;
    })
    .join("");

  root.classList.toggle("vt-anim", animate);
  root.innerHTML = `
    <div class="vt-ops">${opCells}</div>
    <p class="vt-note">${f.note}</p>
    <div class="vt-main">
      <div class="vt-stack"><h4>stack</h4><div class="vt-cells">${stack.join("")}</div></div>
      <div class="vt-state"><h4>state</h4><table>${state}</table></div>
      <div class="vt-out"><h4>output</h4><div class="vt-cells">${out}</div></div>
    </div>
    <div class="vt-nav">
      <button type="button" data-step="-1" aria-label="previous step">‹</button>
      <span>${i} / ${frames.length - 1}</span>
      <button type="button" data-step="1" aria-label="next step">›</button>
    </div>`;
}

const style = document.createElement("style");
style.textContent = css;
document.head.append(style);

const frames = trace();
const widgets = [...document.querySelectorAll(".vm-trace")].map(root => {
  let i = 0;
  const step = d => {
    const next = (i + d + frames.length) % frames.length;
    render(root, frames, next, d > 0 && next > 0);
    i = next;
  };
  root.addEventListener("click", e => {
    const button = e.target.closest("button");
    step(button ? +button.dataset.step : 1);
  });
  render(root, frames, 0, false);
  return { root, step };
});

document.addEventListener("keydown", e => {
  if (e.key !== "." && e.key !== ",") return;
  if (e.target.closest?.("textarea") || e.target.isContentEditable) return;
  for (const w of widgets) {
    if (w.root.closest(".slide")?.classList.contains("current") ?? true)
      w.step(e.key === "." ? 1 : -1);
  }
});
