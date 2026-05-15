// Example projects.
// Tries the API first (web), then falls back to locally bundled JSON files
// so examples work in the Tauri desktop build where no backend is running.

let _cache = null;

const LOCAL_EXAMPLES = [
  { id: 'helloLED',          name: 'Hello LED',              description: 'Basic LED circuit with a resistor', file: '/js/examples/helloLED.json' },
  { id: 'CombinationalLogic',name: 'Combinational Logic',    description: 'Logic gates and combinational circuits', file: '/js/examples/CombinationalLogic.json' },
  { id: '4BitAdderExample',  name: '4-Bit Adder',            description: 'Full adder built from 74LS series chips', file: '/js/examples/4BitAdderExample.json' },
  { id: '8-3-8',             name: '8-to-3 Priority Encoder',description: '8-line to 3-line priority encoder', file: '/js/examples/8-3-8.json' },
  { id: '2x555timers',       name: '2× 555 Timers',          description: 'Astable 555 timer oscillator circuits', file: '/js/examples/2x555timers.json' },
];

async function loadLocalExamples() {
  const results = [];
  await Promise.all(LOCAL_EXAMPLES.map(async meta => {
    try {
      const res = await fetch(meta.file);
      if (!res.ok) return;
      const state = await res.json();
      results.push({ id: meta.id, name: meta.name, description: meta.description, state });
    } catch { /* skip */ }
  }));
  // Return in original order.
  return LOCAL_EXAMPLES
    .map(m => results.find(r => r.id === m.id))
    .filter(Boolean);
}

export async function loadExamples() {
  if (_cache) return _cache;
  try {
    const res = await fetch('/api/examples');
    if (res.ok) {
      _cache = await res.json();
      return _cache;
    }
  } catch { /* fall through to local */ }
  _cache = await loadLocalExamples();
  return _cache;
}
