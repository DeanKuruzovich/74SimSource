// ── Logic Expression Builder & Truth Table Generator ─────────────────────────
// Traces from output pins back through chip gate definitions to input pins,
// builds symbolic boolean expressions, and generates truth tables.

import { COMP } from './constants.js';
import { BCD_7SEG_TABLE } from './chips.js';
import { Netlist } from './netlist.js';

// ── Expression node types ────────────────────────────────────────────────────
// { type: 'input', name: 'SW1.A' }
// { type: 'const', value: 0|1 }
// { type: 'not', operand: node }
// { type: 'and'|'or'|'nand'|'nor'|'xor'|'xnor', operands: [node, node, ...] }

function exprInput(name) { return { type: 'input', name }; }
function exprConst(v) { return { type: 'const', value: v ? 1 : 0 }; }
function exprNot(a) { return { type: 'not', operand: a }; }
function exprGate(gateType, operands) { return { type: gateType.toLowerCase(), operands }; }

// ── Expression to string ────────────────────────────────────────────────────

export function exprToString(node) {
  if (!node) return '?';
  switch (node.type) {
    case 'input': return node.name;
    case 'const': return String(node.value);
    case 'not': return `NOT(${exprToString(node.operand)})`;
    case 'and': return `(${node.operands.map(exprToString).join(' AND ')})`;
    case 'or': return `(${node.operands.map(exprToString).join(' OR ')})`;
    case 'nand': return `NAND(${node.operands.map(exprToString).join(', ')})`;
    case 'nor': return `NOR(${node.operands.map(exprToString).join(', ')})`;
    case 'xor': return `(${node.operands.map(exprToString).join(' XOR ')})`;
    case 'xnor': return `XNOR(${node.operands.map(exprToString).join(', ')})`;
    default: return '?';
  }
}

// ── Format expression in different notations ────────────────────────────────
// Precedence (higher binds tighter):
//   atom = 100, not = 90, and = 80, xor = 70, or = 60
// nand/nor/xnor are rendered using their dedicated symbol or as !(...).

const PREC = { atom: 100, not: 90, and: 80, xor: 70, or: 60 };

function wrap(str, myPrec, parentPrec) {
  return myPrec < parentPrec ? `(${str})` : str;
}

// Walk an expression tree and rename input nodes via the given map.
export function renameInputs(node, nameMap) {
  if (!node) return node;
  if (node.type === 'input') {
    return { type: 'input', name: nameMap.get(node.name) || node.name };
  }
  if (node.type === 'const') return node;
  if (node.type === 'not') {
    return { type: 'not', operand: renameInputs(node.operand, nameMap) };
  }
  return { type: node.type, operands: node.operands.map(o => renameInputs(o, nameMap)) };
}

// Programming notation: a*b+c, !a, a^b
export function exprToProgramming(node, parentPrec = 0) {
  if (!node) return '?';
  switch (node.type) {
    case 'input': return node.name;
    case 'const': return String(node.value);
    case 'not': {
      const inner = exprToProgramming(node.operand, PREC.not);
      return wrap(`!${inner}`, PREC.not, parentPrec);
    }
    case 'and': {
      const s = node.operands.map(o => exprToProgramming(o, PREC.and)).join('*');
      return wrap(s, PREC.and, parentPrec);
    }
    case 'or': {
      const s = node.operands.map(o => exprToProgramming(o, PREC.or)).join('+');
      return wrap(s, PREC.or, parentPrec);
    }
    case 'xor': {
      const s = node.operands.map(o => exprToProgramming(o, PREC.xor)).join('^');
      return wrap(s, PREC.xor, parentPrec);
    }
    case 'nand': {
      const s = node.operands.map(o => exprToProgramming(o, PREC.and)).join('*');
      return wrap(`!(${s})`, PREC.not, parentPrec);
    }
    case 'nor': {
      const s = node.operands.map(o => exprToProgramming(o, PREC.or)).join('+');
      return wrap(`!(${s})`, PREC.not, parentPrec);
    }
    case 'xnor': {
      const s = node.operands.map(o => exprToProgramming(o, PREC.xor)).join('^');
      return wrap(`!(${s})`, PREC.not, parentPrec);
    }
    default: return '?';
  }
}

// Mathematical notation: a∧b∨c, ¬a, a⊕b, a↑b (NAND), a↓b (NOR), a≡b (XNOR)
export function exprToMath(node, parentPrec = 0) {
  if (!node) return '?';
  switch (node.type) {
    case 'input': return node.name;
    case 'const': return String(node.value);
    case 'not': {
      const inner = exprToMath(node.operand, PREC.not);
      return wrap(`¬${inner}`, PREC.not, parentPrec);
    }
    case 'and': {
      const s = node.operands.map(o => exprToMath(o, PREC.and)).join(' ∧ ');
      return wrap(s, PREC.and, parentPrec);
    }
    case 'or': {
      const s = node.operands.map(o => exprToMath(o, PREC.or)).join(' ∨ ');
      return wrap(s, PREC.or, parentPrec);
    }
    case 'xor': {
      const s = node.operands.map(o => exprToMath(o, PREC.xor)).join(' ⊕ ');
      return wrap(s, PREC.xor, parentPrec);
    }
    case 'nand': {
      const s = node.operands.map(o => exprToMath(o, PREC.and)).join(' ↑ ');
      return wrap(s, PREC.and, parentPrec);
    }
    case 'nor': {
      const s = node.operands.map(o => exprToMath(o, PREC.or)).join(' ↓ ');
      return wrap(s, PREC.or, parentPrec);
    }
    case 'xnor': {
      const s = node.operands.map(o => exprToMath(o, PREC.xor)).join(' ≡ ');
      return wrap(s, PREC.xor, parentPrec);
    }
    default: return '?';
  }
}

// Statement notation: (a AND b) OR c, NOT a words with precedence-based parens.
export function exprToStatement(node, parentPrec = 0) {
  if (!node) return '?';
  switch (node.type) {
    case 'input': return node.name;
    case 'const': return String(node.value);
    case 'not': {
      const inner = exprToStatement(node.operand, PREC.not);
      return wrap(`NOT ${inner}`, PREC.not, parentPrec);
    }
    case 'and': {
      const s = node.operands.map(o => exprToStatement(o, PREC.and)).join(' AND ');
      return wrap(s, PREC.and, parentPrec);
    }
    case 'or': {
      const s = node.operands.map(o => exprToStatement(o, PREC.or)).join(' OR ');
      return wrap(s, PREC.or, parentPrec);
    }
    case 'xor': {
      const s = node.operands.map(o => exprToStatement(o, PREC.xor)).join(' XOR ');
      return wrap(s, PREC.xor, parentPrec);
    }
    case 'nand': {
      const s = node.operands.map(o => exprToStatement(o, PREC.and)).join(' NAND ');
      return wrap(s, PREC.and, parentPrec);
    }
    case 'nor': {
      const s = node.operands.map(o => exprToStatement(o, PREC.or)).join(' NOR ');
      return wrap(s, PREC.or, parentPrec);
    }
    case 'xnor': {
      const s = node.operands.map(o => exprToStatement(o, PREC.xor)).join(' XNOR ');
      return wrap(s, PREC.xor, parentPrec);
    }
    default: return '?';
  }
}

// ── Evaluate expression ─────────────────────────────────────────────────────

export function evalExpr(node, inputs) {
  if (!node) return 0;
  switch (node.type) {
    case 'input': return inputs[node.name] || 0;
    case 'const': return node.value;
    case 'not': return evalExpr(node.operand, inputs) ? 0 : 1;
    case 'and': return node.operands.every(o => evalExpr(o, inputs)) ? 1 : 0;
    case 'or': return node.operands.some(o => evalExpr(o, inputs)) ? 1 : 0;
    case 'nand': return node.operands.every(o => evalExpr(o, inputs)) ? 0 : 1;
    case 'nor': return node.operands.some(o => evalExpr(o, inputs)) ? 0 : 1;
    case 'xor': {
      let count = 0;
      for (const o of node.operands) count += evalExpr(o, inputs);
      return (count % 2) ? 1 : 0;
    }
    case 'xnor': {
      let count = 0;
      for (const o of node.operands) count += evalExpr(o, inputs);
      return (count % 2) ? 0 : 1;
    }
    default: return 0;
  }
}

// ── Logic Analyzer ──────────────────────────────────────────────────────────

export class LogicAnalyzer {
  constructor() {
    this.netlist = new Netlist();
    this.expressions = [];   // [{ outputName, expr, inputNames }]
    this.truthTables = [];   // [{ outputName, inputNames, rows }]
    this.errors = [];
    this.hasSequential = false;
  }

  analyze(world, components, wireManager) {
    this.expressions = [];
    this.truthTables = [];
    this.errors = [];
    this.hasSequential = false;

    // Build netlist
    const nodes = this.netlist.build(world, components, wireManager);

    // Find all input components (switches/buttons)
    const inputComps = components.filter(c =>
      c.placed && (c.type === COMP.SWITCH || c.type === COMP.BUTTON || c.type === COMP.PUSH_BUTTON || c.type === COMP.SLIDE_SWITCH)
    );

    // Find all output components (LEDs)
    const outputComps = components.filter(c =>
      c.placed && (c.type === COMP.LED)
    );

    // Find all chips
    const chips = components.filter(c => c.placed && c.type === COMP.CHIP);

    // Check for sequential elements
    for (const chip of chips) {
      if (chip.chipDef && chip.chipDef.sequential) {
        this.hasSequential = true;
      }
    }

    if (inputComps.length === 0 || outputComps.length === 0) {
      return; // Nothing to analyze
    }

    // Build name map for inputs
    // Each switch/button pin 'A' (output side) that connects to a net gets a name
    const inputNames = [];
    const netToInputName = new Map();

    for (const sw of inputComps) {
      // Candidate "logic side" pins per component type. 4-pin tactile buttons
      // have no 'A' pin (their pins are TL/TR/BL/BR), and on 2-pin switches
      // either lead may face the logic — so prefer the pin whose net is NOT a
      // power rail: the rail side carries no signal information, and naming a
      // VCC/GND net would mislabel everything else tied to that rail.
      const candidates = sw.type === COMP.SLIDE_SWITCH ? ['2']
        : sw.type === COMP.BUTTON ? ['TR', 'TL']
        : ['A', 'B'];
      // Pick the best candidate net: a non-rail net that is actually wired to
      // something beyond the switch's own pin beats a non-rail dangling net,
      // which beats a rail net (last-resort fallback only).
      let net = null;
      let netScore = -1;
      for (const pinName of candidates) {
        const pin = sw.pins.find(p => p.name === pinName);
        if (!pin) continue;
        const n = this.netlist.findNetByHole(pin.holeId);
        if (!n) continue;
        const isRail = n.isVCC || n.isGND;
        const isConnected = n.pins.length > 1 || n.holes.size > 1;
        const score = isRail ? 0 : (isConnected ? 2 : 1);
        if (score > netScore) { net = n; netScore = score; }
      }
      if (!net) continue;
      const name = `${sw.name}${sw.id}`;
      inputNames.push(name);
      netToInputName.set(net.id, name);
    }

    // For each output LED, trace back to find the expression
    for (const led of outputComps) {
      const anodePin = led.pins.find(p => p.name === 'Anode');
      if (!anodePin) continue;
      const net = this.netlist.findNetByHole(anodePin.holeId);
      if (!net) continue;

      const outputName = `LED${led.id}`;
      const visited = new Set();
      const expr = this._traceNet(net, netToInputName, chips, visited);

      if (expr) {
        // Collect all input names used in this expression
        const usedInputs = this._collectInputNames(expr);
        this.expressions.push({ outputName, expr, inputNames: usedInputs });

        // Generate truth table if it's combinational
        if (!this.hasSequential && usedInputs.length > 0 && usedInputs.length <= 10) {
          const table = this._generateTruthTable(expr, usedInputs, outputName);
          this.truthTables.push(table);
        }
      } else {
        // Output not driveable by combinational logic from known inputs
        this.expressions.push({ outputName, expr: null, inputNames: [] });
      }
    }
  }

  // Trace a net back to find the expression driving it
  _traceNet(net, netToInputName, chips, visited) {
    // Check if this net has an input name
    if (netToInputName.has(net.id)) {
      return exprInput(netToInputName.get(net.id));
    }

    // Check if a chip output pin drives this net
    for (const pinInfo of net.pins) {
      if (pinInfo.comp.type !== COMP.CHIP) continue;
      const chip = pinInfo.comp;
      if (!chip.chipDef) continue;

      const pinName = pinInfo.pin.name;

      // Find the gate that has this pin as output
      for (const gate of chip.chipDef.gates) {
        const isOutput = gate.output === pinName ||
          (gate.outputs && gate.outputs.includes(pinName));

        if (!isOutput) continue;

        // Cycle guard: a pin counts as "already seen" only while it is on the
        // CURRENT trace path (a true feedback loop). The key is removed again
        // before returning, so legal reconvergent fanout — one gate output
        // feeding several downstream inputs — is re-traced each time instead
        // of collapsing to a constant 0.
        const key = `${chip.id}:${pinName}`;
        if (visited.has(key)) return exprConst(0);
        visited.add(key);

        if (gate.type === 'D_FF' || gate.type === 'BCD_7SEG' || gate.type === 'BCD_7SEG_CC' || gate.type === 'BCD_7SEG_CC_7448' || gate.type === 'DECODER_3TO8') {
          // Sequential or complex just label it
          visited.delete(key);
          return exprInput(`${chip.name}[${pinName}]`);
        }

        // Trace each input of this gate
        const inputExprs = [];
        for (const inputPinName of gate.inputs) {
          const inputPin = chip.getPinByName(inputPinName);
          if (!inputPin) {
            inputExprs.push(exprConst(0));
            continue;
          }
          const inputNet = this.netlist.findNetByHole(inputPin.holeId);
          if (!inputNet) {
            inputExprs.push(exprConst(0));
            continue;
          }
          const inputExpr = this._traceNet(inputNet, netToInputName, chips, visited);
          inputExprs.push(inputExpr || exprConst(0));
        }
        visited.delete(key);

        // Build gate expression
        if (gate.type === 'NOT') {
          return exprNot(inputExprs[0]);
        }
        return exprGate(gate.type, inputExprs);
      }
    }

    // No driver found floating
    return null;
  }

  // Collect all input variable names from an expression tree
  _collectInputNames(expr) {
    const names = new Set();
    const walk = (node) => {
      if (!node) return;
      if (node.type === 'input') { names.add(node.name); return; }
      if (node.operand) walk(node.operand);
      if (node.operands) node.operands.forEach(walk);
    };
    walk(expr);
    return [...names].sort();
  }

  // Generate truth table for a combinational expression
  _generateTruthTable(expr, inputNames, outputName) {
    const numInputs = inputNames.length;
    const rows = [];
    const numRows = 1 << numInputs;

    for (let i = 0; i < numRows; i++) {
      const inputs = {};
      const inputVals = [];
      for (let j = 0; j < numInputs; j++) {
        const val = (i >> (numInputs - 1 - j)) & 1;
        inputs[inputNames[j]] = val;
        inputVals.push(val);
      }
      const output = evalExpr(expr, inputs);
      rows.push({ inputs: inputVals, output });
    }

    return { outputName, inputNames, rows };
  }

  // Get a formatted analysis result for display
  getAnalysisResult() {
    const result = {
      expressions: [],
      truthTables: [],
      warnings: [],
    };

    for (const e of this.expressions) {
      result.expressions.push({
        name: e.outputName,
        expression: e.expr ? exprToString(e.expr) : null,
        expr: e.expr,
        inputs: e.inputNames,
      });
    }

    for (const t of this.truthTables) {
      result.truthTables.push(t);
    }

    result.hasSequential = this.hasSequential;

    if (this.hasSequential) {
      result.warnings.push('Circuit contains sequential elements (flip flops). Full evaluation not supported in Phase 1.');
    }

    return result;
  }
}
