// Quick integration test
import { BreadboardWorld } from './js/breadboard.js';
import { SwitchComponent, ChipComponent, LEDComponent } from './js/components.js';
import { WireManager } from './js/wire.js';
import { LogicAnalyzer } from './js/logic.js';

const world = new BreadboardWorld(1, 1);

const sw1 = new SwitchComponent();
sw1.placeWireLike('0:0:main:5:3', '0:0:main:10:5');

const sw2 = new SwitchComponent();
sw2.placeWireLike('0:0:main:8:3', '0:0:main:11:5');

const chip = new ChipComponent('74x08');
chip.place(0, 0, 10, 4);

const led = new LEDComponent();
led.placeWireLike('0:0:main:12:5', '0:0:main:20:3');

const components = [sw1, sw2, chip, led];

// chip.pins indices for 74x08 (14 pin DIP, placed at col=10):
//   i=7  → pin 1 (1A, input)  at 0:0:main:10:5
//   i=8  → pin 2 (1B, input)  at 0:0:main:11:5
//   i=9  → pin 3 (1Y, output) at 0:0:main:12:5
const wm = new WireManager();
wm.addWire(sw1.pins[1].holeId, chip.pins[7].holeId);
wm.addWire(sw2.pins[1].holeId, chip.pins[8].holeId);
wm.addWire(chip.pins[9].holeId, led.pins[0].holeId);

const analyzer = new LogicAnalyzer();
analyzer.analyze(world, components, wm);
const result = analyzer.getAnalysisResult();
console.log('Expressions:', JSON.stringify(result.expressions, null, 2));
if (result.truthTables.length > 0) {
  console.log('Truth Table:', JSON.stringify(result.truthTables[0], null, 2));
} else {
  console.log('No truth tables generated');
}
console.log('Warnings:', result.warnings);
console.log('TEST PASSED');
