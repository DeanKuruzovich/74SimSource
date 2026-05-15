// ── specificChipsSim.js ──────────────────────────────────────────────────────
// All chip-specific simulation logic, extracted from simulator.js.
// `chipEvaluators` is Object.assigned onto CircuitSimulator.prototype by
// simulator.js after the class definition, so all methods work as normal
// instance methods with `this` referring to the CircuitSimulator instance.

import { COMP } from './constants.js';
import { BCD_7SEG_CC_TABLE, BCD_7SEG_TABLE } from './chips.js';

const VCC_VOLTAGE = 5; // matches simulator.js needed by 555 timer internal threshold

const chipEvaluators = {};

// ── Class-method evaluators ──────────────────────────────────────────────────
// Originally lived inside the CircuitSimulator class body.  Wrapping them
// in a shadow class lets us copy them to chipEvaluators without any syntax
// transformation class method shorthand is identical to object method
// shorthand and they close over the same module scope (BCD tables, etc.).
class _ChipEvalMixin {
  _evaluateChip(comp) {
    // Chip requires BOTH VCC and GND connections to function
    let hasVCC = false, hasGND = false;
    for (const pin of comp.pins) {
      if (pin.type !== 'power') continue;
      const net = this.netlist.findNetByHole(pin.holeId);
      if (!net) continue;
      if (net.isVCC) hasVCC = true;
      if (net.isGND) hasGND = true;
    }
    if (!hasVCC || !hasGND) return false;

    let changed = false;

    for (const gate of comp.chipDef.gates) {
      switch (gate.type) {
        case 'D_FF':
          if (this._evaluateDFF(comp, gate)) changed = true;
          continue;
        case 'JK_FF':
          if (this._evaluateJKFF(comp, gate)) changed = true;
          continue;
        case 'JK_FF_SIMPLE':
          if (this._evaluateJKFFSimple(comp, gate)) changed = true;
          continue;
        case 'JK_FF_FULL':
          if (this._evaluateJKFFFull(comp, gate)) changed = true;
          continue;
        case 'JK_FF_FULL_NEG':
          if (this._evaluateJKFFFullNeg(comp, gate)) changed = true;
          continue;
        case 'D_LATCH':
          if (this._evaluateDLatch(comp, gate)) changed = true;
          continue;
        case 'ADDER_4BIT':
          if (this._evaluateAdder4Bit(comp, gate)) changed = true;
          continue;
        case 'COMPARATOR_4BIT':
          if (this._evaluateComparator4Bit(comp, gate)) changed = true;
          continue;
        case 'RAM_16X4':
          if (this._evaluateRam16x4(comp, gate)) changed = true;
          continue;
        case 'BCD_7SEG':
          if (this._evaluateBCD7Seg(comp, gate)) changed = true;
          continue;
        case 'BCD_7SEG_CC':
          if (this._evaluateBCD7SegCC(comp, gate)) changed = true;
          continue;
        case 'DECODER_3TO8':
          if (this._evaluateDecoder3to8(comp, gate)) changed = true;
          continue;
        case 'DECODER_2TO4':
          if (this._evaluateDecoder2to4(comp, gate)) changed = true;
          continue;
        case 'COUNTER_DECADE':
          if (this._evaluateCounterDecade(comp, gate)) changed = true;
          continue;
        case 'COUNTER_DIV12':
          if (this._evaluateCounterDiv12(comp, gate)) changed = true;
          continue;
        case 'COUNTER_4BIT':
          if (this._evaluateCounter4Bit(comp, gate)) changed = true;
          continue;
        case 'SHIFT_REG_SISO':
          if (this._evaluateShiftRegSISO(comp, gate)) changed = true;
          continue;
        case 'SHIFT_REG_4BIT':
          if (this._evaluateShiftReg4Bit(comp, gate)) changed = true;
          continue;
        case 'MONOSTABLE':
          if (this._evaluateMonostable(comp, gate)) changed = true;
          continue;
        case 'MONOSTABLE_RETRIG':
          if (this._evaluateMonostableRetrig(comp, gate)) changed = true;
          continue;
        case 'MONOSTABLE_122':
          if (this._evaluateMonostable122(comp, gate)) changed = true;
          continue;
        case 'TRI_BUFFER_LO':
          if (this._evaluateTriBufferLo(comp, gate)) changed = true;
          continue;
        case 'TRI_BUFFER_HI':
          if (this._evaluateTriBufferHi(comp, gate)) changed = true;
          continue;
        case 'PRIORITY_ENC_8TO3':
          if (this._evaluatePriorityEnc8to3(comp, gate)) changed = true;
          continue;
        case 'MUX_16TO1':
          if (this._evaluateMux16to1(comp, gate)) changed = true;
          continue;
        case 'MUX_8TO1':
          if (this._evaluateMux8to1(comp, gate)) changed = true;
          continue;
        case 'MUX_4TO1':
          if (this._evaluateMux4to1(comp, gate)) changed = true;
          continue;
        case 'DECODER_4TO16':
          if (this._evaluateDecoder4to16(comp, gate)) changed = true;
          continue;
        case 'MUX_2TO1':
          if (this._evaluateMux2to1(comp, gate)) changed = true;
          continue;
        case 'COUNTER_SYNC_DECADE':
          if (this._evaluateCounterSyncDecade(comp, gate)) changed = true;
          continue;
        case 'COUNTER_SYNC_BIN':
          if (this._evaluateCounterSyncBin(comp, gate)) changed = true;
          continue;
        case 'COUNTER_SYNC_BIN_SC':
          if (this._evaluateCounterSyncBinSC(comp, gate)) changed = true;
          continue;
        case 'SHIFT_REG_SIPO':
          if (this._evaluateShiftRegSIPO(comp, gate)) changed = true;
          continue;
        case 'SHIFT_REG_PISO':
          if (this._evaluateShiftRegPISO(comp, gate)) changed = true;
          continue;
        case 'REG_4BIT_TRI':
          if (this._evaluateReg4BitTri(comp, gate)) changed = true;
          continue;
        case 'D_FF_HEX':
          if (this._evaluateDFFHex(comp, gate)) changed = true;
          continue;
        case 'D_FF_QUAD':
          if (this._evaluateDFFQuad(comp, gate)) changed = true;
          continue;
        case 'COUNTER_UPDOWN':
          if (this._evaluateCounterUpDown(comp, gate)) changed = true;
          continue;
        case 'COUNTER_UPDOWN_DC':
          if (this._evaluateCounterUpDownDC(comp, gate)) changed = true;
          continue;
        case 'TRI_NOT_LO':
          if (this._evaluateTriNotLo(comp, gate)) changed = true;
          continue;
        case 'TRANSCEIVER_8BIT':
          if (this._evaluateTransceiver8Bit(comp, gate)) changed = true;
          continue;
        case 'BUS_SWITCH_10BIT':
          if (this._evaluateBusSwitch10Bit(comp, gate)) changed = true;
          continue;
        case 'BUS_SWITCH_8BIT':
          if (this._evaluateBusSwitch8Bit(comp, gate)) changed = true;
          continue;
        case 'MUX_2TO1_TRI':
          if (this._evaluateMux2to1Tri(comp, gate)) changed = true;
          continue;
        case 'ADDRESSABLE_LATCH':
          if (this._evaluateAddressableLatch(comp, gate)) changed = true;
          continue;
        case 'D_FF_OCTAL':
          if (this._evaluateDFFOctal(comp, gate)) changed = true;
          continue;
        case 'D_LATCH_OCTAL_TRI':
          if (this._evaluateDLatchOctalTri(comp, gate)) changed = true;
          continue;
        case 'D_FF_OCTAL_TRI':
          if (this._evaluateDFFOctalTri(comp, gate)) changed = true;
          continue;
        case 'TRI_BUFFER_DUAL_OE':
          if (this._evaluateTriBufferDualOE(comp, gate)) changed = true;
          continue;
        case 'TRI_BUFFER_SEL_INV':
          if (this._evaluateTriBufferSelInv(comp, gate)) changed = true;
          continue;
        case 'SHIFT_REG_LATCH':
          if (this._evaluateShiftRegLatch(comp, gate)) changed = true;
          continue;
        case 'BCD_DECIMAL':
          if (this._evaluateBCDDecimal(comp, gate)) changed = true;
          continue;
        case 'XS3_DECIMAL':
          if (this._evaluateXS3Decimal(comp, gate)) changed = true;
          continue;
        case 'GRAY_DECIMAL':
          if (this._evaluateGrayDecimal(comp, gate)) changed = true;
          continue;
        case 'FREQ_DIV_50':
          if (this._evaluateFreqDiv(comp, gate, 50)) changed = true;
          continue;
        case 'FREQ_DIV_60':
          if (this._evaluateFreqDiv(comp, gate, 60)) changed = true;
          continue;
        case 'COUNTER_DECADE_SIMPLE':
          if (this._evaluateCounterDecadeSimple(comp, gate)) changed = true;
          continue;
        case 'COUNTER_BIN_SIMPLE':
          if (this._evaluateCounterBinSimple(comp, gate)) changed = true;
          continue;
        case 'D_LATCH_Q':
          if (this._evaluateDLatchQ(comp, gate)) changed = true;
          continue;
        case 'ADDER_1BIT':
          if (this._evaluateAdder1Bit(comp, gate)) changed = true;
          continue;
        case 'ADDER_2BIT':
          if (this._evaluateAdder2Bit(comp, gate)) changed = true;
          continue;
        case 'RAM16x1':
          if (this._evaluateRam16x1(comp, gate)) changed = true;
          continue;
        case 'TC01':
          if (this._evaluateTC01(comp, gate)) changed = true;
          continue;
        case 'JK_FF_PRESET':
          if (this._evaluateJKFFPreset(comp, gate)) changed = true;
          continue;
        case 'SHIFT_REG_4BIT_DUAL_PRESET':
          if (this._evaluateShiftReg4BitDualPreset(comp, gate)) changed = true;
          continue;
        case 'SHIFT_REG_5BIT':
          if (this._evaluateShiftReg5Bit(comp, gate)) changed = true;
          continue;
        case 'RATE_MULT_6BIT':
          if (this._evaluateRateMult6Bit(comp, gate)) changed = true;
          continue;
        case 'SEL_REG_4BIT':
          if (this._evaluateSelReg4Bit(comp, gate)) changed = true;
          continue;
        case 'SHIFT_REG_4BIT_BIDIR':
          if (this._evaluateShiftReg4BitBidir(comp, gate)) changed = true;
          continue;
        case 'SR_LATCH':
          if (this._evaluateSRLatch(comp, gate)) changed = true;
          continue;
        case 'DEC_3TO8_REG':
          if (this._evaluateDec3To8Reg(comp, gate)) changed = true;
          continue;
        case 'DEC_3TO8_LATCH':
          if (this._evaluateDec3To8Latch(comp, gate)) changed = true;
          continue;
        case 'PRIORITY_ENC_10TO4':
          if (this._evaluatePriorityEnc10to4(comp, gate)) changed = true;
          continue;
        case 'PRIORITY_ENC_8LINE':
          if (this._evaluatePriorityEnc8Line(comp, gate)) changed = true;
          continue;
        case 'MUX_8TO1_INV':
          if (this._evaluateMux8to1Inv(comp, gate)) changed = true;
          continue;
        case 'COUNTER_DEC_NIXIE':
          if (this._evaluateCounterDecNixie(comp, gate)) changed = true;
          continue;
        case 'COUNTER_7SEG':
          if (this._evaluateCounter7Seg(comp, gate)) changed = true;
          continue;
        case 'COUNTER_SYNC_DECADE_SC':
          if (this._evaluateCounterSyncDecadeSC(comp, gate)) changed = true;
          continue;
        case 'DEMUX_2TO4':
          if (this._evaluateDemux2to4(comp, gate)) changed = true;
          continue;
        case 'SHIFT_REG_8BIT_PAR':
          if (this._evaluateShiftReg8BitPar(comp, gate)) changed = true;
          continue;
        case 'RATE_MULT_DECADE':
          if (this._evaluateRateMultDecade(comp, gate)) changed = true;
          continue;
        case 'COUNTER_UPDOWN_DECADE':
          if (this._evaluateCounterUpDownDecade(comp, gate)) changed = true;
          continue;
        case 'COUNTER_UPDOWN_BIN':
          if (this._evaluateCounterUpDownBin(comp, gate)) changed = true;
          continue;
        case 'REG_FILE_4X4':
          if (this._evaluateRegFile4x4(comp, gate)) changed = true;
          continue;
        case 'REG_FILE_8X2_TRI':
          if (this._evaluateRegFile8x2Tri(comp, gate)) changed = true;
          continue;
        case 'COUNTER_BIQ_PRESET':
          if (this._evaluateCounterBiqPreset(comp, gate)) changed = true;
          continue;
        case 'COUNTER_BIN_PRESET':
          if (this._evaluateCounterBinPreset(comp, gate)) changed = true;
          continue;
        case 'SHIFT_REG_4BIT_CLR':
          if (this._evaluateShiftReg4BitClr(comp, gate)) changed = true;
          continue;
        case 'PARITY_9BIT':
          if (this._evaluateParity9Bit(comp, gate)) changed = true;
          continue;
        case 'ALU_4BIT':
          if (this._evaluateAlu4Bit(comp, gate)) changed = true;
          continue;
        case 'CARRY_LOOKAHEAD':
          if (this._evaluateCarryLookahead(comp, gate)) changed = true;
          continue;
        case 'FULL_ADDER_DUAL':
          if (this._evaluateFullAdderDual(comp, gate)) changed = true;
          continue;
        case 'BCD_TO_BIN_5':
          if (this._evaluateBcdToBin5(comp, gate)) changed = true;
          continue;
        case 'BIN_TO_BCD_6':
          if (this._evaluateBinToBcd6(comp, gate)) changed = true;
          continue;
        case 'RAM_16X4_INV':
          if (this._evaluateRam16x4Inv(comp, gate)) changed = true;
          continue;
        case 'COUNTER_UPDOWN_DECADE_SINGLE':
          if (this._evaluateCounterUpDownDecadeSingle(comp, gate)) changed = true;
          continue;
        case 'COUNTER_DECADE_DC':
          if (this._evaluateCounterDecadeDC(comp, gate)) changed = true;
          continue;
        case 'SHIFT_REG_4BIT_BIDIR_CLR':
          if (this._evaluateShiftReg4BitBidirClr(comp, gate)) changed = true;
          continue;
        case 'SHIFT_REG_4BIT_JK':
          if (this._evaluateShiftReg4BitJK(comp, gate)) changed = true;
          continue;
        case 'SHIFT_REG_8BIT_BIDIR':
          if (this._evaluateShiftReg8BitBidir(comp, gate)) changed = true;
          continue;
        case 'SHIFT_REG_8BIT_JK':
          if (this._evaluateShiftReg8BitJK(comp, gate)) changed = true;
          continue;
        case 'RAM_256X1':
          if (this._evaluateRam256x1(comp, gate)) changed = true;
          continue;
        case 'RAM_256X1_PD':
          if (this._evaluateRam256x1PD(comp, gate)) changed = true;
          continue;
        case 'RAM_256X1_OC':
          if (this._evaluateRam256x1OC(comp, gate)) changed = true;
          continue;
        case 'RAM_256X4_COMMON':
          if (this._evaluateRam256x4Common(comp, gate)) changed = true;
          continue;
        case 'RAM_256X4':
          if (this._evaluateRam256x4(comp, gate)) changed = true;
          continue;
        case 'RAM_1024X1':
          if (this._evaluateRam1024x1(comp, gate)) changed = true;
          continue;
        case 'RAM_1024X1_PD':
          if (this._evaluateRam1024x1PD(comp, gate)) changed = true;
          continue;
        case 'RAM_16X9_LATCH':
          if (this._evaluateRam16x9Latch(comp, gate)) changed = true;
          continue;
        case 'RAM_16X9':
          if (this._evaluateRam16x9(comp, gate)) changed = true;
          continue;
        case 'RAM_16X12':
          if (this._evaluateRam16x12(comp, gate)) changed = true;
          continue;
        case 'RAM_64X4_COMMON':
          if (this._evaluateRam64x4Common(comp, gate)) changed = true;
          continue;
        case 'RAM_64X4':
          if (this._evaluateRam64x4(comp, gate)) changed = true;
          continue;
        case 'RAM_32X8_COMMON':
          if (this._evaluateRam32x8Common(comp, gate)) changed = true;
          continue;
        case 'RAM_16X4_NI':
          if (this._evaluateRam16x4NI(comp, gate)) changed = true;
          continue;
        case 'FIFO_16X4_SYNC':
          if (this._evaluateFifo16x4Sync(comp, gate)) changed = true;
          continue;
        case 'FIFO_16X4':
          if (this._evaluateFifo16x4(comp, gate)) changed = true;
          continue;
        case 'FIFO_16X5_ASYNC':
          if (this._evaluateFifo16x5Async(comp, gate)) changed = true;
          continue;
        case 'FIFO_16X4_ASYNC':
          if (this._evaluateFifo16x4Async(comp, gate)) changed = true;
          continue;
        case 'FIFO_64X4_ASYNC':
          if (this._evaluateFifo64x4Async(comp, gate)) changed = true;
          continue;
        case 'FIFO_64X5_ASYNC':
          if (this._evaluateFifo64x5Async(comp, gate)) changed = true;
          continue;
        case 'FIFO_16X4_SYNC_OC':
          if (this._evaluateFifo16x4SyncOC(comp, gate)) changed = true;
          continue;
        case 'FIFO_16X4_OC':
          if (this._evaluateFifo16x4OC(comp, gate)) changed = true;
          continue;
        case 'LATCH_TRANS_4BIT':
          if (this._evaluateLatchTrans4Bit(comp, gate)) changed = true;
          continue;
        case 'TRI_NOT_HI':
          if (this._evaluateTriNotHi(comp, gate)) changed = true;
          continue;
        case 'DECODER_3TO8_HI':
          if (this._evaluateDecoder3to8Hi(comp, gate)) changed = true;
          continue;
        case 'DECODER_2TO4_HI':
          if (this._evaluateDecoder2to4Hi(comp, gate)) changed = true;
          continue;
        case 'DEC_3TO8_LATCH_HI':
          if (this._evaluateDec3To8LatchHi(comp, gate)) changed = true;
          continue;
        case 'TRANSCEIVER_4BIT':
          if (this._evaluateTransceiver4Bit(comp, gate)) changed = true;
          continue;
        case 'TRANSCEIVER_4BIT_INV':
          if (this._evaluateTransceiver4BitInv(comp, gate)) changed = true;
          continue;
        case 'MUX_16TO1_TRI':
          if (this._evaluateMux16to1Tri(comp, gate)) changed = true;
          continue;
        case 'MUX_8TO1_TRI':
          if (this._evaluateMux8to1Tri(comp, gate)) changed = true;
          continue;
        case 'MUX_4TO1_TRI':
          if (this._evaluateMux4to1Tri(comp, gate)) changed = true;
          continue;
        case 'DEMUX_2TO4_TRI':
          if (this._evaluateDemux2to4Tri(comp, gate)) changed = true;
          continue;
        case 'DUAL_ADDR_LATCH_4BIT':
          if (this._evaluateDualAddrLatch4Bit(comp, gate)) changed = true;
          continue;
        case 'MUX_2TO1_INV_TRI':
          if (this._evaluateMux2to1InvTri(comp, gate)) changed = true;
          continue;
        case 'MULT_2X4BIT':
          if (this._evaluateMult2x4Bit(comp, gate)) changed = true;
          continue;
        case 'BUFFER_COMP':
          if (this._evaluateBufferComp(comp, gate)) changed = true;
          continue;
        case 'D_LATCH_HEX_TRI':
          if (this._evaluateDLatchHexTri(comp, gate)) changed = true;
          continue;
        case 'COUNTER_8BIT_BIDIR':
          if (this._evaluateCounter8BitBidir(comp, gate)) changed = true;
          continue;
        case 'MULT_4X4BIT_TRI':
          if (this._evaluateMult4x4BitTri(comp, gate)) changed = true;
          continue;
        case 'WALLACE_TREE_7BIT':
          if (this._evaluateWallaceTree7Bit(comp, gate)) changed = true;
          continue;
        case 'JK_FF_QUAD_SEP_CLK':
          if (this._evaluateJKFFQuadSepClk(comp, gate)) changed = true;
          continue;
        case 'PRIORITY_REG_4BIT':
          if (this._evaluatePriorityReg4Bit(comp, gate)) changed = true;
          continue;
        case 'SR_LATCH_NOR_NAND':
          if (this._evaluateSRLatchNorNand(comp, gate)) changed = true;
          continue;
        case 'PARITY_9BIT_SIMPLE':
          if (this._evaluateParity9BitSimple(comp, gate)) changed = true;
          continue;
        case 'ACCUMULATOR_4BIT':
          if (this._evaluateAccumulator4Bit(comp, gate)) changed = true;
          continue;
        case 'CARRY_LOOKAHEAD_SEL':
          if (this._evaluateCarryLookaheadSel(comp, gate)) changed = true;
          continue;
        case 'MULT_4X4BIT_HI':
          if (this._evaluateMult4x4BitHi(comp, gate)) changed = true;
          continue;
        case 'MULT_4X4BIT_LO':
          if (this._evaluateMult4x4BitLo(comp, gate)) changed = true;
          continue;
        case 'PARITY_9BIT_PE':
          if (this._evaluateParity9BitPE(comp, gate)) changed = true;
          continue;
        case 'RAM_16X4_OC_INV':
          if (this._evaluateRam16x4OcInv(comp, gate)) changed = true;
          continue;
        case 'COUNTER_DECADE_DIV':
          if (this._evaluateCounterDecadeDiv(comp, gate)) changed = true;
          continue;
        case 'FREQ_DIV_PROG':
          if (this._evaluateFreqDivProg(comp, gate)) changed = true;
          continue;
        case 'FREQ_DIV_PROG_12BIT':
          if (this._evaluateFreqDivProg12Bit(comp, gate)) changed = true;
          continue;
        case 'COUNTER_4BIT_DIV':
          if (this._evaluateCounter4BitDiv(comp, gate)) changed = true;
          continue;
        case 'SHIFT_REG_4BIT_BIDIR_TRI':
          if (this._evaluateShiftReg4BitBidirTri(comp, gate)) changed = true;
          continue;
        case 'PLL_FILTER':
          if (this._evaluatePllFilter(comp, gate)) changed = true;
          continue;
        case 'MUX_QUAD_2TO1_STORED':
          if (this._evaluateMuxQuad2to1Stored(comp, gate)) changed = true;
          continue;
        case 'SHIFT_REG_8BIT_UNIV_TRI':
          if (this._evaluateShiftReg8BitUnivTri(comp, gate)) changed = true;
          continue;
        case 'RAM_256X1_OC':
          if (this._evaluateRam256x1OC(comp, gate)) changed = true;
          continue;
        case 'CLK_DIV2_OCT':
          if (this._evaluateClkDiv2Oct(comp, gate)) changed = true;
          continue;
        case 'CLK_DIV2_OCT_4INV':
          if (this._evaluateClkDiv2Oct4Inv(comp, gate)) changed = true;
          continue;
        case 'BUS_XCVR_8BIT_GTL':
          if (this._evaluateBusXcvr8BitGtl(comp, gate)) changed = true;
          continue;
        case 'RAM_1024X1_OC':
          if (this._evaluateRam1024x1OC(comp, gate)) changed = true;
          continue;
        case 'BUFFER_OCT_INV_ST_TRI':
          if (this._evaluateBufferOctInvStTri(comp, gate)) changed = true;
          continue;
        case 'RAM_16X9_LATCH_OC':
          if (this._evaluateRam16x9LatchOC(comp, gate)) changed = true;
          continue;
        case 'RAM_16X9_OC':
          if (this._evaluateRam16x9OC(comp, gate)) changed = true;
          continue;
        case 'RAM_16X12_OC':
          if (this._evaluateRam16x12OC(comp, gate)) changed = true;
          continue;
        case 'RAM_64X4_CMN_OC':
          if (this._evaluateRam64x4CmnOC(comp, gate)) changed = true;
          continue;
        case 'RAM_64X4_OC':
          if (this._evaluateRam64x4OC(comp, gate)) changed = true;
          continue;
        case 'RAM_32X8_OC':
          if (this._evaluateRam32x8OC(comp, gate)) changed = true;
          continue;
        case 'RAM_16X4_OC':
          if (this._evaluateRam16x4OC(comp, gate)) changed = true;
          continue;
        case 'CRYSTAL_OSC':
          if (this._evaluateCrystalOsc(comp, gate)) changed = true;
          continue;
        case 'CRYSTAL_OSC_DIV':
          if (this._evaluateCrystalOscDiv(comp, gate)) changed = true;
          continue;
        // ── Block 21 ──────────────────────────────────────────────────────────
        case 'SHIFT_REG_8BIT_SIGN_EXT':
          if (this._evaluateShiftReg8BitSignExt(comp, gate)) changed = true;
          continue;
        case 'SHIFT_REG_8BIT_BIDIR_CLR_TRI':
          if (this._evaluateShiftReg8BitBidirClrTri(comp, gate)) changed = true;
          continue;
        case 'VCO_SINGLE_EN':
          if (this._evaluateVcoSingleEn(comp, gate)) changed = true;
          continue;
        case 'VCO_DUAL':
          if (this._evaluateVcoDual(comp, gate)) changed = true;
          continue;
        case 'VCO_DUAL_EN':
          if (this._evaluateVcoDualEn(comp, gate)) changed = true;
          continue;
        case 'PLA_12IN_6OUT_TRI':
          if (this._evaluatePla12in6outTri(comp, gate)) changed = true;
          continue;
        case 'PLA_12IN_6OUT_OC':
          if (this._evaluatePla12in6outOC(comp, gate)) changed = true;
          continue;
        case 'PLA_12IN_6OUT_SREG_TRI':
          if (this._evaluatePla12in6outSregTri(comp, gate)) changed = true;
          continue;
        case 'PLA_12IN_6OUT_SREG_OC':
          if (this._evaluatePla12in6outSregOC(comp, gate)) changed = true;
          continue;
        case 'CLK_DRIVER_QUAD_TRI':
          if (this._evaluateClkDriverQuadTri(comp, gate)) changed = true;
          continue;
        case 'BUFFER_OCT_ST_TRI':
          if (this._evaluateBufferOctStTri(comp, gate)) changed = true;
          continue;
        // ── Block 22 ──────────────────────────────────────────────────────────
        case 'PRIORITY_ENC_8TO3_TRI':
          if (this._evaluatePriorityEnc8to3Tri(comp, gate)) changed = true;
          continue;
        case 'SHIFTER_4BIT_TRI':
          if (this._evaluateShifter4BitTri(comp, gate)) changed = true;
          continue;
        case 'MUX_8TO1_COMPL_TRI':
          if (this._evaluateMux8to1ComplTri(comp, gate)) changed = true;
          continue;
        case 'MUX_4TO1_INV':
          if (this._evaluateMux4to1Inv(comp, gate)) changed = true;
          continue;
        case 'MUX_4TO1_TRI_INV':
          if (this._evaluateMux4to1TriInv(comp, gate)) changed = true;
          continue;
        case 'MUX_8TO1_LATCH_TRI':
          if (this._evaluateMux8to1LatchTri(comp, gate)) changed = true;
          continue;
        case 'MUX_8TO1_REG_TRI':
          if (this._evaluateMux8to1RegTri(comp, gate)) changed = true;
          continue;
        case 'BUBBLE_MEM_TIMING':
          if (this._evaluateBubbleMemTiming(comp, gate)) changed = true;
          continue;
        case 'CLK_4PHASE_GEN':
          if (this._evaluateClk4PhaseGen(comp, gate)) changed = true;
          continue;
        case 'BUFFER_HEX_TRI':
          if (this._evaluateBufferHexTri(comp, gate)) changed = true;
          continue;
        case 'BUFFER_HEX_INV_TRI':
          if (this._evaluateBufferHexInvTri(comp, gate)) changed = true;
          continue;
        case 'D_LATCH_QUAD_COMPL':
          if (this._evaluateDLatchQuadCompl(comp, gate)) changed = true;
          continue;
        case 'JK_NOT_FF_QUAD':
          if (this._evaluateJkNotFfQuad(comp, gate)) changed = true;
          continue;
        case 'D_FF_OCTAL_CE':
          if (this._evaluateDFfOctalCe(comp, gate)) changed = true;
          continue;
        case 'D_FF_HEX_CE':
          if (this._evaluateDFfHexCe(comp, gate)) changed = true;
          continue;
        case 'D_FF_QUAD_CE_COMPL':
          if (this._evaluateDFfQuadCeCompl(comp, gate)) changed = true;
          continue;
        case 'MULTI_FUNC_REG_8BIT':
          if (this._evaluateMultiFuncReg8Bit(comp, gate)) changed = true;
          continue;
        case 'ALU_4BIT_381':
          if (this._evaluateAlu4Bit381(comp, gate)) changed = true;
          continue;
        case 'ALU_4BIT_382':
          if (this._evaluateAlu4Bit382(comp, gate)) changed = true;
          continue;
        case 'D_FF_OCTAL_OC':
          if (this._evaluateDFfOctalOc(comp, gate)) changed = true;
          continue;
        case 'MULTIPLIER_8X1':
          if (this._evaluateMultiplier8x1(comp, gate)) changed = true;
          continue;
        case 'SERIAL_ADDER_QUAD':
          if (this._evaluateSerialAdderQuad(comp, gate)) changed = true;
          continue;
        case 'D_FF_QUAD_TRI_COMPL':
          if (this._evaluateDFfQuadTriCompl(comp, gate)) changed = true;
          continue;
        case 'COUNTER_DECADE_DUAL':
          if (this._evaluateCounterDecadeDual(comp, gate)) changed = true;
          continue;
        case 'COUNTER_4BIT_DUAL':
          if (this._evaluateCounter4BitDual(comp, gate)) changed = true;
          continue;
        case 'SHIFT_REG_4BIT_TRI':
          if (this._evaluateShiftReg4BitTri(comp, gate)) changed = true;
          continue;
        case 'D_FF_OCTAL_OC_PAR':
          if (this._evaluateDFfOctalOcPar(comp, gate)) changed = true;
          continue;
        case 'MUX_QUAD_2TO1_STORED_COMPL':
          if (this._evaluateMuxQuad2to1StoredCompl(comp, gate)) changed = true;
          continue;
        case 'CRC_16BIT':
          if (this._evaluateCrc16Bit(comp, gate)) changed = true;
          continue;
        case 'POLY_CHECKER':
          if (this._evaluatePolyChecker(comp, gate)) changed = true;
          continue;
        case 'FIFO_16X4_TRI':
          if (this._evaluateFifo16x4Tri(comp, gate)) changed = true;
          continue;
        case 'DECODER_3TO8_INV':
          if (this._evaluateDecoder3to8Inv(comp, gate)) changed = true;
          continue;
        case 'DATA_ACCESS_REG_8BIT':
          if (this._evaluateDataAccessReg8Bit(comp, gate)) changed = true;
          continue;
        case 'RAM_16X4_REG_TRI':
          if (this._evaluateRam16x4RegTri(comp, gate)) changed = true;
          continue;
        case 'MULTIMODE_LATCH_8BIT':
          if (this._evaluateMultimodeLatch8Bit(comp, gate)) changed = true;
          continue;
        case 'FIFO_64X4':
          if (this._evaluateFifo64x4(comp, gate)) changed = true;
          continue;
        case 'INTR_PRIORITY_CTRL':
          if (this._evaluateIntrPriorityCtrl(comp, gate)) changed = true;
          continue;
        case 'BUS_XCVR_4BIT_TRI':
          if (this._evaluateBusXcvr4BitTri(comp, gate)) changed = true;
          continue;
        case 'COUNTER_MOD2_MOD5':
          if (this._evaluateCounterMod2Mod5(comp, gate)) changed = true;
          continue;
        case 'CLK_GEN_TWOPHASE':
          if (this._evaluateClkGenTwophase(comp, gate)) changed = true;
          continue;
        case 'BUFFER_QUAD_TRI_NLOW':
          if (this._evaluateBufferQuadTriNlow(comp, gate)) changed = true;
          continue;
        case 'BUFFER_QUAD_TRI_NHIGH':
          if (this._evaluateBufferQuadTriNhigh(comp, gate)) changed = true;
          continue;
        case 'FIFO_64X4_TRI':
          if (this._evaluateFifo64x4Tri(comp, gate)) changed = true;
          continue;
        case 'LINE_DRIVER_6X':
          if (this._evaluateLineDriver6x(comp, gate)) changed = true;
          continue;
        case 'BUS_XCVR_QUAD_TRI_OC':
          if (this._evaluateBusXcvrQuadTriOc(comp, gate)) changed = true;
          continue;
        case 'BUS_XCVR_QUAD_INV_OC':
          if (this._evaluateBusXcvrQuadInvOc(comp, gate)) changed = true;
          continue;
        case 'BUS_XCVR_QUAD_TRI':
          if (this._evaluateBusXcvrQuadTri(comp, gate)) changed = true;
          continue;
        case 'BUS_XCVR_QUAD_INV_TRI':
          if (this._evaluateBusXcvrQuadInvTri(comp, gate)) changed = true;
          continue;
        case 'BUS_XCVR_QUAD_MIX_TRI':
          if (this._evaluateBusXcvrQuadMixTri(comp, gate)) changed = true;
          continue;
        case 'MUX_16TO1_COMPL':
          if (this._evaluateMux16to1Compl(comp, gate)) changed = true;
          continue;
        case 'COUNTER_DECADE_DUAL_SYNC':
          if (this._evaluateCounterDecadeDualSync(comp, gate)) changed = true;
          continue;
        case 'MUX_QUAD_4TO1':
          if (this._evaluateMuxQuad4to1(comp, gate)) changed = true;
          continue;
        case 'COUNTER_DECADE_UPDOWN_DUAL':
          if (this._evaluateCounterDecadeUpdownDual(comp, gate)) changed = true;
          continue;
        case 'BUFFER_OCTAL_PARITY_INV':
          if (this._evaluateBufferOctalParityInv(comp, gate)) changed = true;
          continue;
        case 'BUFFER_OCTAL_PARITY':
          if (this._evaluateBufferOctalParity(comp, gate)) changed = true;
          continue;
        case 'NINES_COMPLEMENT':
          if (this._evaluateNinesComplement(comp, gate)) changed = true;
          continue;
        case 'COMPARATOR_10BIT':
          if (this._evaluateComparator10Bit(comp, gate)) changed = true;
          continue;
        case 'COUNTER_8BIT_PRESET':
          if (this._evaluateCounter8BitPreset(comp, gate)) changed = true;
          continue;
        // ── Block 27 ──────────────────────────────────────────────────────────
        case 'FIBER_OPTIC_TX':
          if (this._evaluateFiberOpticTx(comp, gate)) changed = true;
          continue;
        case 'FIBER_OPTIC_RX':
          if (this._evaluateFiberOpticRx(comp, gate)) changed = true;
          continue;
        case 'BUFFER_OCTAL_TRI':
          if (this._evaluateBufferOctalTri(comp, gate)) changed = true;
          continue;
        case 'BUFFER_OCTAL_INV_TRI':
          if (this._evaluateBufferOctalInvTri(comp, gate)) changed = true;
          continue;
        case 'COUNTER_8BIT_UPDOWN_SYNC':
          if (this._evaluateCounter8BitUpdownSync(comp, gate)) changed = true;
          continue;
        // Block 28
        case 'BURST_ERR_RECOVERY':
          if (this._evaluateBurstErrRecovery(comp, gate)) changed = true;
          continue;
        case 'CONTROL_SLICE_4BIT':
          if (this._evaluateControlSlice4Bit(comp, gate)) changed = true;
          continue;
        case 'BCD_TO_BIN':
          if (this._evaluateBcdToBin(comp, gate)) changed = true;
          continue;
        case 'BIN_TO_BCD':
          if (this._evaluateBinToBcd(comp, gate)) changed = true;
          continue;
        case 'COUNTER_10BIT_UPDOWN':
          if (this._evaluateCounter10BitUpdown(comp, gate)) changed = true;
          continue;
        case 'SHIFT_REG_8BIT_BIDI':
          if (this._evaluateShiftReg8BitBidi(comp, gate)) changed = true;
          continue;
        case 'ADC_6BIT_FLASH':
          if (this._evaluateAdc6BitFlash(comp, gate)) changed = true;
          continue;
        case 'SAR_8BIT':
          if (this._evaluateSar8Bit(comp, gate)) changed = true;
          continue;
        case 'SAR_8BIT_EXP':
          if (this._evaluateSar8BitExp(comp, gate)) changed = true;
          continue;
        case 'SAR_12BIT_EXP':
          if (this._evaluateSar12BitExp(comp, gate)) changed = true;
          continue;
        case 'ADC_8BIT_SAR':
          if (this._evaluateAdc8BitSar(comp, gate)) changed = true;
          continue;
        case 'MULTIPLIER_8BIT':
          if (this._evaluateMultiplier8Bit(comp, gate)) changed = true;
          continue;
        case 'DECODER_PROG_2TO4':
          if (this._evaluateDecoderProg2to4(comp, gate)) changed = true;
          continue;
        case 'MULTIPLIER_16BIT':
          if (this._evaluateMultiplier16Bit(comp, gate)) changed = true;
          continue;
        case 'CMP_8BIT_OC':
          if (this._evaluateCmp8BitOc(comp, gate)) changed = true;
          continue;
        case 'CMP_8BIT_INV':
          if (this._evaluateCmp8BitInv(comp, gate)) changed = true;
          continue;
        case 'CMP_8BIT_INV_OC':
          if (this._evaluateCmp8BitInvOc(comp, gate)) changed = true;
          continue;
        case 'CMP_8BIT_REG_OC':
          if (this._evaluateCmp8BitRegOc(comp, gate)) changed = true;
          continue;
        case 'CMP_16BIT_PROG':
          if (this._evaluateCmp16BitProg(comp, gate)) changed = true;
          continue;
        case 'CMP_12BIT_PROG':
          if (this._evaluateCmp12BitProg(comp, gate)) changed = true;
          continue;
        case 'CMP_12BIT_OC':
          if (this._evaluateCmp12BitOc(comp, gate)) changed = true;
          continue;
        case 'LATCH_OCTAL_TRI':
          if (this._evaluateLatchOctalTri(comp, gate)) changed = true;
          continue;
        case 'REG_OCTAL_TRI':
          if (this._evaluateRegOctalTri(comp, gate)) changed = true;
          continue;
        case 'LATCH_OCTAL_INV_TRI':
          if (this._evaluateLatchOctalInvTri(comp, gate)) changed = true;
          continue;
        case 'REG_OCTAL_INV_TRI':
          if (this._evaluateRegOctalInvTri(comp, gate)) changed = true;
          continue;
        case 'BCD_DECIMAL_DEC_TRI':
          if (this._evaluateBcdDecimalDecTri(comp, gate)) changed = true;
          continue;
        case 'DECODER_3TO8_TRI':
          if (this._evaluateDecoder3to8Tri(comp, gate)) changed = true;
          continue;
        case 'DECODER_2TO4_TRI':
          if (this._evaluateDecoder2to4Tri(comp, gate)) changed = true;
          continue;
        case 'BUF_OCTAL_INV_TRI':
          if (this._evaluateBufOctalInvTri(comp, gate)) changed = true;
          continue;
        case 'TRANSCEIVER_OCTAL_REG':
          if (this._evaluateTransceiverOctalReg(comp, gate)) changed = true;
          continue;
        case 'TRANSCEIVER_OCTAL_REG_INV':
          if (this._evaluateTransceiverOctalRegInv(comp, gate)) changed = true;
          continue;
        case 'TRANSCEIVER_OCTAL_LATCH':
          if (this._evaluateTransceiverOctalLatch(comp, gate)) changed = true;
          continue;
        case 'DECODER_3TO8_LATCH_ACK':
          if (this._evaluateDecoder3to8LatchAck(comp, gate)) changed = true;
          continue;
        case 'REG_8BIT_PIPELINE':
          if (this._evaluateReg8BitPipeline(comp, gate)) changed = true;
          continue;
        case 'DECODER_3TO8_ACK':
          if (this._evaluateDecoder3to8Ack(comp, gate)) changed = true;
          continue;
        case 'LATCH_8BIT_PIPELINE':
          if (this._evaluateLatch8BitPipeline(comp, gate)) changed = true;
          continue;
        case 'MULTIPLIER_8BIT_TC':
          if (this._evaluateMultiplier8BitTc(comp, gate)) changed = true;
          continue;
        case 'COUNTER_SYNC_DECADE_TRI':
          if (this._evaluateCounterSyncDecadeTri(comp, gate)) changed = true;
          continue;
        case 'COUNTER_SYNC_BIN_TRI':
          if (this._evaluateCounterSyncBinTri(comp, gate)) changed = true;
          continue;
        // ── Block 31 ──────────────────────────────────────────────────────────
        case 'TRANSCEIVER_OCTAL_LATCH_INV':
          if (this._evaluateTransceiverOctalLatchInv(comp, gate)) changed = true;
          continue;
        case 'COUNTER_SYNC_DECADE_UPDOWN_TRI':
          if (this._evaluateCounterSyncDecadeUpdownTri(comp, gate)) changed = true;
          continue;
        case 'COUNTER_SYNC_BIN_UPDOWN_TRI':
          if (this._evaluateCounterSyncBinUpdownTri(comp, gate)) changed = true;
          continue;
        case 'REG_OCTAL_SYNCLR_TRI':
          if (this._evaluateRegOctalSynclrTri(comp, gate)) changed = true;
          continue;
        case 'REG_OCTAL_SYNCLR_INV_TRI':
          if (this._evaluateRegOctalSynclrInvTri(comp, gate)) changed = true;
          continue;
        case 'COUNTER_8BIT_BIDIR_TRI':
          if (this._evaluateCounter8BitBidirTri(comp, gate)) changed = true;
          continue;
        case 'ALU_BCD_4BIT':
          if (this._evaluateAluBcd4Bit(comp, gate)) changed = true;
          continue;
        case 'ADDER_BCD_4BIT':
          if (this._evaluateAdderBcd4Bit(comp, gate)) changed = true;
          continue;
        case 'SHIFT_REG_8BIT_LATCH_TRI':
          if (this._evaluateShiftReg8BitLatchTri(comp, gate)) changed = true;
          continue;
        case 'COUNTER_8BIT_REG_OUT_TRI':
          if (this._evaluateCounter8BitRegOutTri(comp, gate)) changed = true;
          continue;
        case 'COUNTER_8BIT_REG_OUT_OC':
          if (this._evaluateCounter8BitRegOutOc(comp, gate)) changed = true;
          continue;
        case 'COUNTER_8BIT_REG_IN':
          if (this._evaluateCounter8BitRegIn(comp, gate)) changed = true;
          continue;
        case 'COUNTER_8BIT_REG_IN_TRI':
          if (this._evaluateCounter8BitRegInTri(comp, gate)) changed = true;
          continue;
        case 'SHIFT_REG_8BIT_LATCH_BUF':
          if (this._evaluateShiftReg8BitLatchBuf(comp, gate)) changed = true;
          continue;
        case 'SHIFT_REG_8BIT_PISO_LATCH':
          if (this._evaluateShiftReg8BitPisoLatch(comp, gate)) changed = true;
          continue;
        case 'SHIFT_REG_8BIT_SEL_TRI':
          if (this._evaluateShiftReg8BitSelTri(comp, gate)) changed = true;
          continue;
        case 'DRAM_REFRESH_STUB':
          if (this._evaluateDramRefreshStub(comp, gate)) changed = true;
          continue;
        case 'MEM_CYCLE_CTRL':
          if (this._evaluateMemCycleCtrl(comp, gate)) changed = true;
          continue;
        case 'TRANSCEIVER_8BIT_INV':
          if (this._evaluateTransceiver8BitInv(comp, gate)) changed = true;
          continue;
        case 'ECC_STUB':
          if (this._evaluateEccStub(comp, gate)) changed = true;
          continue;
        case 'PARITY_BUFFER_STUB':
        case 'PARITY_BUFFER_INV_STUB':
          if (this._evaluateParityBufferStub(comp, gate)) changed = true;
          continue;
        case 'LATCH_8BIT_TRI':
          if (this._evaluateLatch8BitTri(comp, gate)) changed = true;
          continue;
        case 'LATCH_8BIT_INV_TRI':
          if (this._evaluateLatch8BitInvTri(comp, gate)) changed = true;
          continue;
        case 'SHIFT_REG_16BIT_STUB':
          if (this._evaluateShiftReg16BitStub(comp, gate)) changed = true;
          continue;
        case 'ADDR_COMP_16BIT_STUB':
          if (this._evaluateAddrComp16BitStub(comp, gate)) changed = true;
          continue;
        // ── Block 36 ──────────────────────────────────────────────────────────
        case 'ACC_4BIT_STUB':
          if (this._evaluateAcc4BitStub(comp, gate)) changed = true;
          continue;
        case 'COMPARATOR_8BIT_PQ':
          if (this._evaluateComparator8BitPq(comp, gate)) changed = true;
          continue;
        case 'COMPARATOR_8BIT_PQ_EN':
          if (this._evaluateComparator8BitPqEn(comp, gate)) changed = true;
          continue;
        case 'COMPARATOR_8BIT_EQ':
          if (this._evaluateComparator8BitEq(comp, gate)) changed = true;
          continue;
        case 'COUNTER_LATCH_MUX_STUB':
          if (this._evaluateCounterLatchMuxStub(comp, gate)) changed = true;
          continue;
        // ── Block 37 ──────────────────────────────────────────────────────────
        case 'PLL_7046':
          if (this._evaluatePll7046(comp, gate)) changed = true;
          continue;
        case 'PLL_9046':
          if (this._evaluatePll9046(comp, gate)) changed = true;
          continue;
        case 'JTAG_ASP':
          if (this._evaluateJtagAsp(comp, gate)) changed = true;
          continue;
        case 'GENERIC_STUB':
          if (this._evaluateGenericStub(comp, gate)) changed = true;
          continue;
        // ── Block 67 555/556/558 Timers ────────────────────────────────────
        case 'TIMER_555':
          if (this._evaluateTimer555(comp, gate)) changed = true;
          continue;
        case 'TIMER_558_SECTION':
          if (this._evaluateTimer558Section(comp, gate)) changed = true;
          continue;
        case 'MUX_QUINT_2TO1':
          if (this._evaluateMuxQuint2to1(comp, gate)) changed = true;
          continue;
        // ── Block 58 ──────────────────────────────────────────────────────────
        case 'SHIFT_REG_LATCH_4094':
          if (this._evaluateShiftRegLatch4094(comp, gate)) changed = true;
          continue;
        case 'D_LATCH_OCTAL_TRI_INV':
          if (this._evaluateDLatchOctalTriInv(comp, gate)) changed = true;
          continue;
        case 'D_FF_OCTAL_TRI_INV':
          if (this._evaluateDFFOctalTriInv(comp, gate)) changed = true;
          continue;
        // ── Block 59 ──────────────────────────────────────────────────────────
        case 'COUNTER_BCD_UPDOWN_CD':
          if (this._evaluateCounterBcdUpdownCd(comp, gate)) changed = true;
          continue;
        case 'BCD_7SEG_4511':
          if (this._evaluateBcd7seg4511(comp, gate)) changed = true;
          continue;
        case 'BCD_7SEG_4543':
          if (this._evaluateBcd7seg4543(comp, gate)) changed = true;
          continue;
        case 'DEC_4TO16_LATCH_HI':
          if (this._evaluateDec4to16LatchHi(comp, gate)) changed = true;
          continue;
        case 'DEC_4TO16_LATCH_LO':
          if (this._evaluateDec4to16LatchLo(comp, gate)) changed = true;
          continue;
        case 'COUNTER_BIN_UPDOWN_CD':
          if (this._evaluateCounterBinUpdownCd(comp, gate)) changed = true;
          continue;
        case 'COUNTER_GATED_DECADE':
          if (this._evaluateCounterGatedDecade(comp, gate)) changed = true;
          continue;
        case 'COUNTER_GATED_BIN':
          if (this._evaluateCounterGatedBin(comp, gate)) changed = true;
          continue;
        // ── Block 68 ──────────────────────────────────────────────────────────
        case 'D_FF_ACTHI':
          if (this._evaluateDFFActHi(comp, gate)) changed = true;
          continue;
        case 'SHIFT_REG_8BIT_PISO_CD':
          if (this._evaluateShiftReg8BitPisoCd(comp, gate)) changed = true;
          continue;
        case 'SHIFT_REG_4BIT_SIPO':
          if (this._evaluateShiftReg4BitSipo(comp, gate)) changed = true;
          continue;
        case 'BILATERAL_SWITCH':
          if (this._evaluateBilateralSwitch(comp, gate)) changed = true;
          continue;
        case 'COUNTER_DECADE_DECODED':
          if (this._evaluateCounterDecadeDecoded(comp, gate)) changed = true;
          continue;
        case 'COUNTER_BIN_OSC_14':
          if (this._evaluateCounterBinOsc14(comp, gate)) changed = true;
          continue;
        // ── Block 63 ─────────────────────────────────────────────────────────
        case 'SHIFT_REG_8BIT_CS_OE':
          if (this._evaluateShiftReg8BitCsOe(comp, gate)) changed = true;
          continue;
        case 'DUAL_CTR_8BIT_REG':
          if (this._evaluateDualCtr8BitReg(comp, gate)) changed = true;
          continue;
        // ── Block 65 ─────────────────────────────────────────────────────────
        case 'BCD_DOWN_2DEC':
          if (this._evaluateBcdDown2Dec(comp, gate)) changed = true;
          continue;
        case 'BIN_DOWN_8BIT':
          if (this._evaluateBinDown8Bit(comp, gate)) changed = true;
          continue;
        case 'FIFO_16X4_RST_TRI':
          if (this._evaluateFifo16x4RstTri(comp, gate)) changed = true;
          continue;
      }

      // Read input pin voltages → digital values
      const inputBits = this._readGateInputs(comp, gate.inputs);

      // Compute gate output
      let outputBit;
      switch (gate.type) {
        case 'XORSEL':   { const [a,b,c] = inputBits; const xorVal = a ^ b; outputBit = c ? (xorVal ? 0 : 1) : xorVal; break; }
        case 'MUX_2TO1_INV': { const [a,b,sel,g] = inputBits; outputBit = g === 1 ? 0 : ((sel ? b : a) ? 0 : 1); break; }
        case 'NAND12_3ST': { const oe = inputBits[inputBits.length - 1]; if (oe !== 0) { if (this._drivePinHighZ(comp, gate.output)) changed = true; continue; } outputBit = inputBits.slice(0, -1).every(b => b) ? 0 : 1; break; }
        case 'VCO_STUB': { for (const op of gate.outputs) { if (this._drivePinHighZ(comp, op)) changed = true; } continue; }
        case 'AND':  outputBit = inputBits.every(b => b) ? 1 : 0; break;
        case 'OR':   outputBit = inputBits.some(b => b)  ? 1 : 0; break;
        case 'NAND': outputBit = inputBits.every(b => b) ? 0 : 1; break;
        case 'NOR':  outputBit = inputBits.some(b => b)  ? 0 : 1; break;
        case 'NOT':  outputBit = inputBits[0] ? 0 : 1; break;
        case 'XOR':    outputBit = inputBits.reduce((a, b) => a ^ b, 0); break;
        case 'XNOR':   outputBit = inputBits.reduce((a, b) => a ^ b, 0) ? 0 : 1; break;
        case 'BUFFER': outputBit = inputBits[0] ? 1 : 0; break;
        case 'AOI_2WIDE': outputBit = ((inputBits[0] & inputBits[1]) | (inputBits[2] & inputBits[3])) ? 0 : 1; break;
        case 'AOI_4WIDE': outputBit = ((inputBits[0] & inputBits[1]) | (inputBits[2] & inputBits[3]) | (inputBits[4] & inputBits[5]) | (inputBits[6] & inputBits[7])) ? 0 : 1; break;
        // NOR_STROBE: last input is strobe G (active HIGH disable). G=1→Y=1; G=0→Y=NOR(rest)
        case 'NOR_STROBE': {
          const g = inputBits[inputBits.length - 1];
          outputBit = g ? 1 : (inputBits.slice(0, -1).some(b => b) ? 0 : 1);
          break;
        }
        // AND-OR and AND-OR-INVERT gate types for complex 74xx chips
        // AO_3222: (A1&A2&A3)|(B1&B2)|(C1&C2)|(D1&D2)  [inputs 0..8]
        case 'AO_3222': outputBit = ((inputBits[0]&inputBits[1]&inputBits[2])|(inputBits[3]&inputBits[4])|(inputBits[5]&inputBits[6])|(inputBits[7]&inputBits[8])) ? 1 : 0; break;
        case 'AOI_3222': outputBit = ((inputBits[0]&inputBits[1]&inputBits[2])|(inputBits[3]&inputBits[4])|(inputBits[5]&inputBits[6])|(inputBits[7]&inputBits[8])) ? 0 : 1; break;
        // AOI_44: NOT((A1&A2&A3&A4)|(B1&B2&B3&B4))  [inputs 0..7]
        case 'AOI_44': outputBit = ((inputBits[0]&inputBits[1]&inputBits[2]&inputBits[3])|(inputBits[4]&inputBits[5]&inputBits[6]&inputBits[7])) ? 0 : 1; break;
        // AOI_33: NOT((A1&A2&A3)|(B1&B2&B3))  [inputs 0..5]  used by 74x51 gate 2
        case 'AOI_33': outputBit = ((inputBits[0]&inputBits[1]&inputBits[2])|(inputBits[3]&inputBits[4]&inputBits[5])) ? 0 : 1; break;
        // AOI_2332: NOT((A1&A2)|(B1&B2&B3)|(C1&C2&C3)|(D1&D2))  [inputs 0..9]  used by 74x54
        case 'AOI_2332': outputBit = ((inputBits[0]&inputBits[1])|(inputBits[2]&inputBits[3]&inputBits[4])|(inputBits[5]&inputBits[6]&inputBits[7])|(inputBits[8]&inputBits[9])) ? 0 : 1; break;
        // AO_33: (A1&A2&A3)|(B1&B2&B3)  [inputs 0..5]
        case 'AO_33': outputBit = ((inputBits[0]&inputBits[1]&inputBits[2])|(inputBits[3]&inputBits[4]&inputBits[5])) ? 1 : 0; break;
        // AO_22: (A1&A2)|(B1&B2)  [inputs 0..3]
        case 'AO_22': outputBit = ((inputBits[0]&inputBits[1])|(inputBits[2]&inputBits[3])) ? 1 : 0; break;
        // AOI_32: NOT((A1&A2&A3)|(B1&B2))  [inputs 0..4]
        case 'AOI_32': outputBit = ((inputBits[0]&inputBits[1]&inputBits[2])|(inputBits[3]&inputBits[4])) ? 0 : 1; break;
        // AO_3322: (A1&A2&A3)|(B1&B2&B3)|(C1&C2)|(D1&D2)  [inputs 0..9]
        case 'AO_3322': outputBit = ((inputBits[0]&inputBits[1]&inputBits[2])|(inputBits[3]&inputBits[4]&inputBits[5])|(inputBits[6]&inputBits[7])|(inputBits[8]&inputBits[9])) ? 1 : 0; break;
        // AOI_4322: NOT((A1&A2&A3&A4)|(B1&B2&B3)|(C1&C2)|(D1&D2))  [inputs 0..10]
        case 'AOI_4322': outputBit = ((inputBits[0]&inputBits[1]&inputBits[2]&inputBits[3])|(inputBits[4]&inputBits[5]&inputBits[6])|(inputBits[7]&inputBits[8])|(inputBits[9]&inputBits[10])) ? 0 : 1; break;
        default: continue;
      }

      // For open-collector chips, use OC drive (HIGH → HiZ, LOW → sink to GND)
      const isOC = comp.chipDef && comp.chipDef.openCollector;
      if (isOC) {
        if (this._drivePinOC(comp, gate.output, outputBit)) changed = true;
      } else {
        if (this._drivePinBit(comp, gate.output, outputBit)) changed = true;
      }
    }

    return changed;
  }

  _evaluateDFF(comp, gate) {
    const [dName, clkName, preName, clrName] = gate.inputs;
    const [qName, qnName] = gate.outputs;

    const dBit = this._readPinBit(comp, dName);
    const clkBit = this._readPinBit(comp, clkName);
    const preBit = this._readPinBit(comp, preName);
    const clrBit = this._readPinBit(comp, clrName);
    const state = this._getSeqState(comp, qName, { q: 0, prevClk: 0 });

    if (clrBit === 0) {
      state.q = 0;
    } else if (preBit === 0) {
      state.q = 1;
    } else if (clkBit === 1 && state.prevClk === 0) {
      state.q = dBit;
    }

    state.prevClk = clkBit;
    return this._drivePinBits(comp, [qName, qnName], [state.q, state.q ? 0 : 1]);
  }

  _evaluateJKFF(comp, gate) {
    const [j1, j2, j3, k1, k2, k3, clkName, preName, clrName] = gate.inputs;
    return this._evaluateJKGate(comp, {
      jPins: [j1, j2, j3],
      kPins: [k1, k2, k3],
      clkPin: clkName,
      prePin: preName,
      clrPin: clrName,
      outputs: gate.outputs,
    });
  }

  _evaluateJKFFSimple(comp, gate) {
    const [jName, kName, clkName, clrName] = gate.inputs;
    return this._evaluateJKGate(comp, {
      jPins: [jName],
      kPins: [kName],
      clkPin: clkName,
      clrPin: clrName,
      outputs: gate.outputs,
    });
  }

  _evaluateJKFFFull(comp, gate) {
    const [jName, kName, clkName, preName, clrName] = gate.inputs;
    return this._evaluateJKGate(comp, {
      jPins: [jName],
      kPins: [kName],
      clkPin: clkName,
      prePin: preName,
      clrPin: clrName,
      outputs: gate.outputs,
    });
  }

  _evaluateJKFFFullNeg(comp, gate) {
    const [jName, kName, clkName, preName, clrName] = gate.inputs;
    return this._evaluateJKGate(comp, {
      jPins: [jName],
      kPins: [kName],
      clkPin: clkName,
      prePin: preName,
      clrPin: clrName,
      outputs: gate.outputs,
      triggerEdge: 'falling',
    });
  }

  _evaluateDLatch(comp, gate) {
    const [dName, enableName] = gate.inputs;
    const [qName, qnName] = gate.outputs;
    const dBit = this._readPinBit(comp, dName);
    const enableBit = this._readPinBit(comp, enableName);
    const state = this._getSeqState(comp, qName, { q: 0 });

    if (enableBit === 1) state.q = dBit;
    return this._drivePinBits(comp, [qName, qnName], [state.q, state.q ? 0 : 1]);
  }

  _evaluateAdder4Bit(comp, gate) {
    const [a1, a2, a3, a4, b1, b2, b3, b4, c0] = this._readGateInputs(comp, gate.inputs);
    const a = a1 | (a2 << 1) | (a3 << 2) | (a4 << 3);
    const b = b1 | (b2 << 1) | (b3 << 2) | (b4 << 3);
    const sum = a + b + c0;
    return this._drivePinBits(comp, gate.outputs, [
      sum & 1,
      (sum >> 1) & 1,
      (sum >> 2) & 1,
      (sum >> 3) & 1,
      (sum >> 4) & 1,
    ]);
  }

  _evaluateComparator4Bit(comp, gate) {
    const [a0, a1, a2, a3, b0, b1, b2, b3, agtbin, aeqbin, altbin] = this._readGateInputs(comp, gate.inputs);
    const a = a0 | (a1 << 1) | (a2 << 2) | (a3 << 3);
    const b = b0 | (b1 << 1) | (b2 << 2) | (b3 << 3);

    let outputBits;
    if (a > b) outputBits = [1, 0, 0];
    else if (a < b) outputBits = [0, 0, 1];
    else if (agtbin) outputBits = [1, 0, 0];
    else if (altbin) outputBits = [0, 0, 1];
    else outputBits = [0, aeqbin ? 1 : 0, 0];

    return this._drivePinBits(comp, gate.outputs, outputBits);
  }

  _evaluateRam16x4(comp, gate) {
    const [a0, a1, a2, a3, d1, d2, d3, d4, meBit, weBit] = this._readGateInputs(comp, gate.inputs);
    const address = a0 | (a1 << 1) | (a2 << 2) | (a3 << 3);
    const ramState = this._getRamState(comp);
    const dataBits = [d1, d2, d3, d4];
    const writeMode = meBit === 1 && weBit === 1;
    const readMode = meBit === 0 && weBit === 0;

    let changed = false;
    if (writeMode) {
      const word = ramState.words[address];
      for (let i = 0; i < dataBits.length; i++) {
        if (word[i] !== dataBits[i]) {
          word[i] = dataBits[i];
          changed = true;
        }
      }
    }

    const outputBits = readMode ? ramState.words[address] : [0, 0, 0, 0];
    if (this._drivePinBits(comp, gate.outputs, outputBits)) changed = true;
    return changed;
  }

  _evaluateBCD7Seg(comp, gate) {
    const inputBits = gate.inputs.map(inputPinName => this._readPinBit(comp, inputPinName));
    const bcdVal = (inputBits[3] << 3) | (inputBits[2] << 2) | (inputBits[1] << 1) | inputBits[0];
    const lampTestLow = comp.getPinByName('LT') ? this._readPinBit(comp, 'LT') === 0 : false;
    const blankingLow = comp.getPinByName('BI/RBO') ? this._readPinBit(comp, 'BI/RBO') === 0
      : (comp.getPinByName('BI') ? this._readPinBit(comp, 'BI') === 0 : false);
    const rippleBlankZero = comp.getPinByName('RBI') && this._readPinBit(comp, 'RBI') === 0 && bcdVal === 0;

    let segBits;
    if (lampTestLow) {
      segBits = [0, 0, 0, 0, 0, 0, 0];
    } else if (blankingLow || rippleBlankZero) {
      segBits = [1, 1, 1, 1, 1, 1, 1];
    } else {
      const row = BCD_7SEG_TABLE.find(r => {
        const rowVal = (r[0] << 3) | (r[1] << 2) | (r[2] << 1) | r[3];
        return rowVal === bcdVal;
      });
      if (!row) return false;
      segBits = row.slice(4, 11);
    }

    let changed = false;
    const isOC = comp.chipDef && comp.chipDef.openCollector;
    for (let i = 0; i < gate.outputs.length; i++) {
      const outBit = segBits[i];
      if (isOC) {
        if (this._drivePinOC(comp, gate.outputs[i], outBit)) changed = true;
      } else {
        if (this._drivePinBit(comp, gate.outputs[i], outBit)) changed = true;
      }
    }
    return changed;
  }

  _evaluateBCD7SegCC(comp, gate) {
    const inputBits = gate.inputs.map(inputPinName => this._readPinBit(comp, inputPinName));
    const bcdVal = (inputBits[3] << 3) | (inputBits[2] << 2) | (inputBits[1] << 1) | inputBits[0];
    const lampTestName = comp.getPinByName('LAMP_TEST') ? 'LAMP_TEST' : (comp.getPinByName('LT') ? 'LT' : null);
    const lampTestLow = lampTestName ? this._readPinBit(comp, lampTestName) === 0 : false;
    const blankingLow = comp.getPinByName('BI/RBO') ? this._readPinBit(comp, 'BI/RBO') === 0
      : (comp.getPinByName('BI') ? this._readPinBit(comp, 'BI') === 0 : false);
    const rippleBlankZero = comp.getPinByName('RBI') && this._readPinBit(comp, 'RBI') === 0 && bcdVal === 0;

    let segBits;
    if (lampTestLow) {
      segBits = [1, 1, 1, 1, 1, 1, 1];
    } else if (blankingLow || rippleBlankZero) {
      segBits = [0, 0, 0, 0, 0, 0, 0];
    } else {
      const row = BCD_7SEG_CC_TABLE.find(r => {
        const rowVal = (r[0] << 3) | (r[1] << 2) | (r[2] << 1) | r[3];
        return rowVal === bcdVal;
      });
      if (!row) return false;
      segBits = row.slice(4, 11);
    }

    let changed = false;
    const isOC = comp.chipDef && comp.chipDef.openCollector;
    for (let i = 0; i < gate.outputs.length; i++) {
      if (isOC) {
        if (this._drivePinOC(comp, gate.outputs[i], segBits[i])) changed = true;
      } else {
        if (this._drivePinBit(comp, gate.outputs[i], segBits[i])) changed = true;
      }
    }
    return changed;
  }

  _evaluateDecoder3to8(comp, gate) {
    const inputBits = [];
    for (const inputPinName of gate.inputs) {
      const pin = comp.getPinByName(inputPinName);
      if (!pin) { inputBits.push(0); continue; }
      const net = this.netlist.findNetByHole(pin.holeId);
      if (!net) { inputBits.push(0); continue; }
      const v = this.netVoltages.get(net.id);
      inputBits.push(v !== undefined && v > 2.5 ? 1 : 0);
    }

    const [a, b, c, g1, g2a, g2b] = inputBits;
    const enabled = g1 === 1 && g2a === 0 && g2b === 0;
    const selectedIndex = a | (b << 1) | (c << 2);

    let changed = false;
    for (let i = 0; i < gate.outputs.length; i++) {
      const outputBit = enabled && i === selectedIndex ? 0 : 1;
      if (this._drivePinBit(comp, gate.outputs[i], outputBit)) changed = true;
    }
    return changed;
  }

  _evaluateDecoder2to4(comp, gate) {
    // Active low enable G: G=0 enables, G=1 disables all outputs (all high)
    const [aName, bName, gName] = gate.inputs;
    const enabled = this._readPinBit(comp, gName) === 0;
    const a = this._readPinBit(comp, aName);
    const b = this._readPinBit(comp, bName);
    const selectedIndex = a | (b << 1);

    let changed = false;
    for (let i = 0; i < gate.outputs.length; i++) {
      // Active low outputs: selected = 0V, all others = 5V
      const outputBit = enabled && i === selectedIndex ? 0 : 1;
      if (this._drivePinBit(comp, gate.outputs[i], outputBit)) changed = true;
    }
    return changed;
  }

  // ── Ripple counter helpers ────────────────────────────────────────────────

  // Advance BCD ÷5 section (used by 7490 decade counter)
  // Encodes state as (qb | qc<<1 | qd<<2): 0→1→2→3→4→0
  _advanceBCDDiv5(qb, qc, qd) {
    const state = qb | (qc << 1) | (qd << 2);
    const next = state < 4 ? state + 1 : 0;
    return { qb: next & 1, qc: (next >> 1) & 1, qd: (next >> 2) & 1 };
  }

  // Advance divide-by-6 section (used by 7492 divide-by-12 counter)
  // States: 0→1→2→3→4→5→0
  _advanceDiv6(qb, qc, qd) {
    const state = qb | (qc << 1) | (qd << 2);
    const next = state < 5 ? state + 1 : 0;
    return { qb: next & 1, qc: (next >> 1) & 1, qd: (next >> 2) & 1 };
  }

  _evaluateCounterDecade(comp, gate) {
    // 7490: Two independent sections.
    // Section A: CKA → QA (÷2 toggle, falling-edge triggered)
    // Section B: CKB → QB/QC/QD (÷5 BCD counter, falling-edge triggered)
    // R01 AND R02 = 1 → async reset all to 0 (highest priority)
    // R91 AND R92 = 1 → async set to 9 (QA=1, QB=0, QC=0, QD=1)
    const [ckaName, ckbName, r01Name, r02Name, r91Name, r92Name] = gate.inputs;
    const [qaName, qbName, qcName, qdName] = gate.outputs;
    const state = this._getSeqState(comp, qaName,
      { qa: 0, qb: 0, qc: 0, qd: 0, prevCKA: 0, prevCKB: 0 });

    // Pre-drive current state so externally wired connections (e.g. QA→CKB) see
    // the correct voltage before we read inputs. Needed because netVoltages is
    // cleared at the start of every evaluate() call.
    this._drivePinBits(comp, [qaName, qbName, qcName, qdName],
      [state.qa, state.qb, state.qc, state.qd]);

    const r0 = this._readPinBit(comp, r01Name) & this._readPinBit(comp, r02Name);
    const r9 = this._readPinBit(comp, r91Name) & this._readPinBit(comp, r92Name);
    const cka = this._readPinBit(comp, ckaName);
    const ckb = this._readPinBit(comp, ckbName);

    if (r0) {
      state.qa = state.qb = state.qc = state.qd = 0;
    } else if (r9) {
      state.qa = 1; state.qb = 0; state.qc = 0; state.qd = 1;
    } else {
      if (state.prevCKA === 1 && cka === 0) state.qa ^= 1;
      if (state.prevCKB === 1 && ckb === 0) {
        const next = this._advanceBCDDiv5(state.qb, state.qc, state.qd);
        state.qb = next.qb; state.qc = next.qc; state.qd = next.qd;
      }
    }
    state.prevCKA = cka;
    state.prevCKB = ckb;
    return this._drivePinBits(comp, [qaName, qbName, qcName, qdName],
      [state.qa, state.qb, state.qc, state.qd]);
  }

  _evaluateCounterDiv12(comp, gate) {
    // 7492: Section A = ÷2 (CKA/QA), Section B = ÷6 (CKB/QB/QC/QD)
    // R01 AND R02 = 1 → async reset all to 0
    const [ckaName, ckbName, r01Name, r02Name] = gate.inputs;
    const [qaName, qbName, qcName, qdName] = gate.outputs;
    const state = this._getSeqState(comp, qaName,
      { qa: 0, qb: 0, qc: 0, qd: 0, prevCKA: 0, prevCKB: 0 });

    this._drivePinBits(comp, [qaName, qbName, qcName, qdName],
      [state.qa, state.qb, state.qc, state.qd]);

    const r0 = this._readPinBit(comp, r01Name) & this._readPinBit(comp, r02Name);
    const cka = this._readPinBit(comp, ckaName);
    const ckb = this._readPinBit(comp, ckbName);

    if (r0) {
      state.qa = state.qb = state.qc = state.qd = 0;
    } else {
      if (state.prevCKA === 1 && cka === 0) state.qa ^= 1;
      if (state.prevCKB === 1 && ckb === 0) {
        const next = this._advanceDiv6(state.qb, state.qc, state.qd);
        state.qb = next.qb; state.qc = next.qc; state.qd = next.qd;
      }
    }
    state.prevCKA = cka;
    state.prevCKB = ckb;
    return this._drivePinBits(comp, [qaName, qbName, qcName, qdName],
      [state.qa, state.qb, state.qc, state.qd]);
  }

  _evaluateCounter4Bit(comp, gate) {
    // 7493: Section A = ÷2 (CKA/QA), Section B = ÷8 binary (CKB/QB/QC/QD)
    // R01 AND R02 = 1 → async reset all to 0
    const [ckaName, ckbName, r01Name, r02Name] = gate.inputs;
    const [qaName, qbName, qcName, qdName] = gate.outputs;
    const state = this._getSeqState(comp, qaName,
      { qa: 0, qb: 0, qc: 0, qd: 0, prevCKA: 0, prevCKB: 0 });

    this._drivePinBits(comp, [qaName, qbName, qcName, qdName],
      [state.qa, state.qb, state.qc, state.qd]);

    const r0 = this._readPinBit(comp, r01Name) & this._readPinBit(comp, r02Name);
    const cka = this._readPinBit(comp, ckaName);
    const ckb = this._readPinBit(comp, ckbName);

    if (r0) {
      state.qa = state.qb = state.qc = state.qd = 0;
    } else {
      if (state.prevCKA === 1 && cka === 0) state.qa ^= 1;
      if (state.prevCKB === 1 && ckb === 0) {
        const bin3 = state.qb | (state.qc << 1) | (state.qd << 2);
        const next = (bin3 + 1) & 7;
        state.qb = next & 1; state.qc = (next >> 1) & 1; state.qd = (next >> 2) & 1;
      }
    }
    state.prevCKA = cka;
    state.prevCKB = ckb;
    return this._drivePinBits(comp, [qaName, qbName, qcName, qdName],
      [state.qa, state.qb, state.qc, state.qd]);
  }

  _evaluateShiftRegSISO(comp, gate) {
    // 7491: 8 bit serial-in serial-out shift register.
    // Data input = A AND B. Shifts on rising edge of CP.
    // Q = output of 8th stage, Qn = its complement.
    const [aName, bName, cpName] = gate.inputs;
    const [qName, qnName] = gate.outputs;
    const state = this._getSeqState(comp, qName,
      { stages: new Array(8).fill(0), prevCP: 0 });

    const cp = this._readPinBit(comp, cpName);
    if (state.prevCP === 0 && cp === 1) {
      // Rising edge: shift data in at position 0, drop from position 7
      const dataBit = this._readPinBit(comp, aName) & this._readPinBit(comp, bName);
      state.stages.unshift(dataBit);
      state.stages.pop();
    }
    state.prevCP = cp;
    const q = state.stages[7];
    return this._drivePinBits(comp, [qName, qnName], [q, q ? 0 : 1]);
  }

  _evaluateShiftReg4Bit(comp, gate) {
    // 7495: 4 bit parallel-access shift register.
    // MODE=0: shift mode rising CLK1 shifts SER→QA→QB→QC→QD
    // MODE=1: parallel load rising CLK2 loads A→QA, B→QB, C→QC, D→QD
    const [serName, aName, bName, cName, dName, modeName, clk1Name, clk2Name] = gate.inputs;
    const [qaName, qbName, qcName, qdName] = gate.outputs;
    const state = this._getSeqState(comp, qaName,
      { qa: 0, qb: 0, qc: 0, qd: 0, prevCLK1: 0, prevCLK2: 0 });

    this._drivePinBits(comp, [qaName, qbName, qcName, qdName],
      [state.qa, state.qb, state.qc, state.qd]);

    const mode = this._readPinBit(comp, modeName);
    const clk1 = this._readPinBit(comp, clk1Name);
    const clk2 = this._readPinBit(comp, clk2Name);

    if (mode === 0 && state.prevCLK1 === 0 && clk1 === 1) {
      // Shift mode, rising CLK1
      const ser = this._readPinBit(comp, serName);
      state.qd = state.qc;
      state.qc = state.qb;
      state.qb = state.qa;
      state.qa = ser;
    } else if (mode === 1 && state.prevCLK2 === 0 && clk2 === 1) {
      // Parallel load, rising CLK2
      state.qa = this._readPinBit(comp, aName);
      state.qb = this._readPinBit(comp, bName);
      state.qc = this._readPinBit(comp, cName);
      state.qd = this._readPinBit(comp, dName);
    }
    state.prevCLK1 = clk1;
    state.prevCLK2 = clk2;
    return this._drivePinBits(comp, [qaName, qbName, qcName, qdName],
      [state.qa, state.qb, state.qc, state.qd]);
  }

  _evaluateMonostable(comp, gate) {
    // 74121: Monostable multivibrator.
    // Static logic model (no timing): triggered when (A1=0 OR A2=0) AND B=1.
    // Q=1, Qn=0 when trigger condition is statically asserted; Q=0, Qn=1 otherwise.
    const [a1Name, a2Name, bName] = gate.inputs;
    const [qName, qnName] = gate.outputs;
    const a1 = this._readPinBit(comp, a1Name);
    const a2 = this._readPinBit(comp, a2Name);
    const b  = this._readPinBit(comp, bName);
    const triggered = ((a1 === 0 || a2 === 0) && b === 1) ? 1 : 0;
    return this._drivePinBits(comp, [qName, qnName], [triggered, triggered ? 0 : 1]);
  }

  _evaluateMonostableRetrig(comp, gate) {
    // 74123: Retriggerable monostable multivibrator.
    // Static logic model: CLR=0 → output reset. CLR=1: triggered when A=0 AND B=1.
    const [aName, bName, clrName] = gate.inputs;
    const [qName, qnName] = gate.outputs;
    const a   = this._readPinBit(comp, aName);
    const b   = this._readPinBit(comp, bName);
    const clr = this._readPinBit(comp, clrName);
    const triggered = (clr === 0) ? 0 : (a === 0 && b === 1) ? 1 : 0;
    return this._drivePinBits(comp, [qName, qnName], [triggered, triggered ? 0 : 1]);
  }

  _evaluateMonostable122(comp, gate) {
    // 74122: Retriggerable monostable multivibrator with clear.
    // Static model: CLR=0 → output reset.
    // Triggered when (A1=0 OR A2=0) AND (B1=1 AND B2=1) and CLR is HIGH.
    const [a1Name, a2Name, b1Name, b2Name, clrName] = gate.inputs;
    const [qName, qnName] = gate.outputs;
    const a1  = this._readPinBit(comp, a1Name);
    const a2  = this._readPinBit(comp, a2Name);
    const b1  = this._readPinBit(comp, b1Name);
    const b2  = this._readPinBit(comp, b2Name);
    const clr = this._readPinBit(comp, clrName);
    const triggered = (clr === 0) ? 0 : ((a1 === 0 || a2 === 0) && b1 === 1 && b2 === 1) ? 1 : 0;
    return this._drivePinBits(comp, [qName, qnName], [triggered, triggered ? 0 : 1]);
  }

  _evaluateTriBufferLo(comp, gate) {
    // 74125: Active low output enable tri-state buffer.
    // OE=0 (low) → output follows A. OE=1 (high) → HiZ.
    const [aName, oeName] = gate.inputs;
    const oe = this._readPinBit(comp, oeName);
    if (oe !== 0) return this._drivePinHighZ(comp, gate.output);
    const a = this._readPinBit(comp, aName);
    return this._drivePinBit(comp, gate.output, a);
  }

  _evaluateTriBufferHi(comp, gate) {
    // 74126: Active high output enable tri-state buffer.
    // OE=1 (high) → output follows A. OE=0 (low) → HiZ.
    const [aName, oeName] = gate.inputs;
    const oe = this._readPinBit(comp, oeName);
    if (oe !== 1) return this._drivePinHighZ(comp, gate.output);
    const a = this._readPinBit(comp, aName);
    return this._drivePinBit(comp, gate.output, a);
  }

  // ── Chips5 gate evaluators ────────────────────────────────────────────────

  _evaluatePriorityEnc8to3(comp, gate) {
    // 74148: 8-to-3 priority encoder. All inputs/outputs active LOW.
    // inputs: [I0..I7, EI], outputs: [A0, A1, A2, GS, EO]
    // EI=1 (disabled): all outputs HIGH.
    // EI=0, no input active: A=111, GS=1, EO=0.
    // EI=0, some input active (I7 highest): A=~index, GS=0, EO=1.
    const [i0,i1,i2,i3,i4,i5,i6,i7,ei] = this._readGateInputs(comp, gate.inputs);
    const [a0n,a1n,a2n,gsn,eon] = gate.outputs;
    if (ei === 1) {
      return this._drivePinBits(comp, [a0n,a1n,a2n,gsn,eon], [1,1,1,1,1]);
    }
    // Find highest-priority active (LOW) input; I7=highest priority
    let active = -1;
    if (!i7) active = 7;
    else if (!i6) active = 6;
    else if (!i5) active = 5;
    else if (!i4) active = 4;
    else if (!i3) active = 3;
    else if (!i2) active = 2;
    else if (!i1) active = 1;
    else if (!i0) active = 0;
    if (active === -1) {
      // No input active
      return this._drivePinBits(comp, [a0n,a1n,a2n,gsn,eon], [1,1,1,1,0]);
    }
    // Outputs are inverted binary of highest active index
    const a0 = (active >> 0) & 1 ? 0 : 1;
    const a1 = (active >> 1) & 1 ? 0 : 1;
    const a2 = (active >> 2) & 1 ? 0 : 1;
    return this._drivePinBits(comp, [a0n,a1n,a2n,gsn,eon], [a0,a1,a2,0,1]);
  }

  _evaluateMux16to1(comp, gate) {
    // 74150: 16-to-1 mux. G=strobe (active LOW). W=complemented output.
    // inputs: [E0..E15, A, B, C, D, G], outputs: [W]
    const bits = this._readGateInputs(comp, gate.inputs);
    const g = bits[20];
    if (g === 1) return this._drivePinBit(comp, gate.outputs[0], 1);
    const sel = bits[16] | (bits[17] << 1) | (bits[18] << 2) | (bits[19] << 3);
    const data = bits[sel];
    return this._drivePinBit(comp, gate.outputs[0], data ? 0 : 1);
  }

  _evaluateMux8to1(comp, gate) {
    // 74151: 8-to-1 mux. G=strobe (active LOW). Y=true, W=complemented.
    // inputs: [D0..D7, A, B, C, G], outputs: [Y, W]
    const bits = this._readGateInputs(comp, gate.inputs);
    const g = bits[11];
    if (g === 1) return this._drivePinBits(comp, gate.outputs, [0,1]);
    const sel = bits[8] | (bits[9] << 1) | (bits[10] << 2);
    const data = bits[sel];
    return this._drivePinBits(comp, gate.outputs, [data, data ? 0 : 1]);
  }

  _evaluateMux4to1(comp, gate) {
    // 74153: single 4-to-1 mux section. G=active LOW enable. Output=true.
    // inputs: [C0, C1, C2, C3, A, B, G], output (single name string)
    const [c0,c1,c2,c3,a,b,g] = this._readGateInputs(comp, gate.inputs);
    if (g === 1) return this._drivePinBit(comp, gate.output, 0);
    const sel = a | (b << 1);
    const data = [c0,c1,c2,c3][sel];
    return this._drivePinBit(comp, gate.output, data);
  }

  _evaluateDecoder4to16(comp, gate) {
    // 74154: 4-to-16 decoder. G1,G2 active LOW enables. Outputs active LOW.
    // inputs: [A, B, C, D, G1, G2], outputs: [Y0..Y15]
    const [a,b,c,d,g1,g2] = this._readGateInputs(comp, gate.inputs);
    const enabled = (g1 === 0) && (g2 === 0);
    const sel = a | (b << 1) | (c << 2) | (d << 3);
    let changed = false;
    for (let i = 0; i < 16; i++) {
      const bit = (enabled && i === sel) ? 0 : 1;
      if (this._drivePinBit(comp, gate.outputs[i], bit)) changed = true;
    }
    return changed;
  }

  _evaluateFreqDiv(comp, gate, divisor) {
    // 74x56 (÷50) / 74x57 (÷60): count rising clock edges, toggle output every N.
    // inputs: [CLK], outputs: [Q]
    const [clkName] = gate.inputs;
    const [qName] = gate.outputs;
    const state = this._getSeqState(comp, qName, { q: 0, count: 0, prevClk: 0 });
    const clk = this._readPinBit(comp, clkName);
    if (clk === 1 && state.prevClk === 0) {
      state.count++;
      if (state.count >= divisor) {
        state.count = 0;
        state.q = state.q ? 0 : 1;
      }
    }
    state.prevClk = clk;
    return this._drivePinBit(comp, qName, state.q);
  }

  _evaluateCounterDecadeSimple(comp, gate) {
    // 74x68: simple decade counter (0-9), rising-edge CLK, active LOW CLR.
    // inputs: [CLK, CLR], outputs: [QA, QB, QC, QD]
    const [clkN, clrN] = gate.inputs;
    const [qaName, qbName, qcName, qdName] = gate.outputs;
    const state = this._getSeqState(comp, qaName, { count: 0, prevClk: 0 });
    this._drivePinBits(comp, [qaName, qbName, qcName, qdName],
      [state.count & 1, (state.count >> 1) & 1, (state.count >> 2) & 1, (state.count >> 3) & 1]);
    const clr = this._readPinBit(comp, clrN);
    if (clr === 0) {
      state.count = 0;
      state.prevClk = this._readPinBit(comp, clkN);
      return this._drivePinBits(comp, [qaName, qbName, qcName, qdName], [0, 0, 0, 0]);
    }
    const clk = this._readPinBit(comp, clkN);
    if (state.prevClk === 0 && clk === 1) state.count = (state.count + 1) % 10;
    state.prevClk = clk;
    return this._drivePinBits(comp, [qaName, qbName, qcName, qdName],
      [state.count & 1, (state.count >> 1) & 1, (state.count >> 2) & 1, (state.count >> 3) & 1]);
  }

  _evaluateCounterBinSimple(comp, gate) {
    // 74x69: simple 4 bit binary counter (0-15), rising-edge CLK, active LOW CLR.
    // inputs: [CLK, CLR], outputs: [QA, QB, QC, QD]
    const [clkN, clrN] = gate.inputs;
    const [qaName, qbName, qcName, qdName] = gate.outputs;
    const state = this._getSeqState(comp, qaName, { count: 0, prevClk: 0 });
    this._drivePinBits(comp, [qaName, qbName, qcName, qdName],
      [state.count & 1, (state.count >> 1) & 1, (state.count >> 2) & 1, (state.count >> 3) & 1]);
    const clr = this._readPinBit(comp, clrN);
    if (clr === 0) {
      state.count = 0;
      state.prevClk = this._readPinBit(comp, clkN);
      return this._drivePinBits(comp, [qaName, qbName, qcName, qdName], [0, 0, 0, 0]);
    }
    const clk = this._readPinBit(comp, clkN);
    if (state.prevClk === 0 && clk === 1) state.count = (state.count + 1) & 15;
    state.prevClk = clk;
    return this._drivePinBits(comp, [qaName, qbName, qcName, qdName],
      [state.count & 1, (state.count >> 1) & 1, (state.count >> 2) & 1, (state.count >> 3) & 1]);
  }

  _evaluateDLatchQ(comp, gate) {
    // D latch with enable, Q output only (no Qn). Active HIGH enable.
    // inputs: [D, E], outputs: [Q]
    const [dName, enableName] = gate.inputs;
    const [qName] = gate.outputs;
    const dBit = this._readPinBit(comp, dName);
    const enableBit = this._readPinBit(comp, enableName);
    const state = this._getSeqState(comp, qName, { q: 0 });
    if (enableBit === 1) state.q = dBit;
    return this._drivePinBit(comp, qName, state.q);
  }

  _evaluateAdder1Bit(comp, gate) {
    // Single-bit full adder. inputs: [A, B, CIN], outputs: [SUM, COUT]
    const [a, b, cin] = this._readGateInputs(comp, gate.inputs);
    const sum = a ^ b ^ cin;
    const cout = (a & b) | (b & cin) | (a & cin);
    return this._drivePinBits(comp, gate.outputs, [sum, cout]);
  }

  _evaluateAdder2Bit(comp, gate) {
    // 2 bit binary full adder. inputs: [A1, A2, B1, B2, CIN], outputs: [SUM1, SUM2, COUT]
    const [a1, a2, b1, b2, cin] = this._readGateInputs(comp, gate.inputs);
    const total = (a1 | (a2 << 1)) + (b1 | (b2 << 1)) + cin;
    return this._drivePinBits(comp, gate.outputs, [total & 1, (total >> 1) & 1, (total >> 2) & 1]);
  }

  _evaluateRam16x1(comp, gate) {
    // 16×1 bit RAM. inputs: [A0, A1, A2, A3, DIN, CE, WE], outputs: [Q, Qn]
    // CE=1 enables chip. WE=1 write. Read when CE=1, WE=0.
    const [a0N, a1N, a2N, a3N, dinN, ceN, weN] = gate.inputs;
    const [qName, qnName] = gate.outputs;
    const addr = this._readPinBit(comp, a0N) | (this._readPinBit(comp, a1N) << 1) |
                 (this._readPinBit(comp, a2N) << 2) | (this._readPinBit(comp, a3N) << 3);
    const state = this._getSeqState(comp, qName, { words: new Array(16).fill(0) });
    const ce = this._readPinBit(comp, ceN);
    const we = this._readPinBit(comp, weN);
    const din = this._readPinBit(comp, dinN);
    if (ce === 1 && we === 1) state.words[addr] = din;
    const out = (ce === 1) ? state.words[addr] : 0;
    return this._drivePinBits(comp, [qName, qnName], [out, out ? 0 : 1]);
  }

  _evaluateTC01(comp, gate) {
    // True/Complement/Zero/One element.
    // inputs: [S0, S1, A, B, C, D], outputs: [QA, QB, QC, QD]
    // S1=0,S0=0 → all zero; S1=0,S0=1 → true; S1=1,S0=0 → complement; S1=1,S0=1 → all one
    const [s0N, s1N, ...inputNames] = gate.inputs;
    const s0 = this._readPinBit(comp, s0N);
    const s1 = this._readPinBit(comp, s1N);
    const bits = inputNames.map(n => this._readPinBit(comp, n));
    let outBits;
    if (!s1 && !s0)      outBits = bits.map(() => 0);
    else if (!s1 && s0)  outBits = bits;
    else if (s1 && !s0)  outBits = bits.map(b => b ? 0 : 1);
    else                  outBits = bits.map(() => 1);
    return this._drivePinBits(comp, gate.outputs, outBits);
  }

  _evaluateJKFFPreset(comp, gate) {
    // JK flip-flop with 3 input AND J and K, preset only (no CLR).
    // inputs: [J1, J2, J3, K1, K2, K3, CLK, PRE], outputs: [Q, Qn]
    const [j1, j2, j3, k1, k2, k3, clkName, preName] = gate.inputs;
    return this._evaluateJKGate(comp, {
      jPins: [j1, j2, j3],
      kPins: [k1, k2, k3],
      clkPin: clkName,
      prePin: preName,
      clrPin: null,
      outputs: gate.outputs,
    });
  }

  _evaluateShiftReg4BitDualPreset(comp, gate) {
    // 74x94: 4 bit right-shift register with dual async parallel presets.
    // inputs: [CLK, CLR, SER, P1A, P1B, P1C, P1D, P2A, P2B, P2C, P2D, S1, S2]
    // outputs: [QD] only the last stage is exposed externally.
    // CLR=0: async clear. S1=1: async preset from P1. S2=1: async preset from P2.
    // Rising CLK (no async): shift right (SER→QA→QB→QC→QD).
    const [clkN, clrN, serN, p1aN, p1bN, p1cN, p1dN, p2aN, p2bN, p2cN, p2dN, s1N, s2N] = gate.inputs;
    const qdName = gate.outputs[0];
    const state = this._getSeqState(comp, qdName, { qa: 0, qb: 0, qc: 0, qd: 0, prevClk: 0 });
    this._drivePinBit(comp, qdName, state.qd);
    const clr = this._readPinBit(comp, clrN);
    if (clr === 0) {
      state.qa = state.qb = state.qc = state.qd = 0;
      state.prevClk = 0;
      return this._drivePinBit(comp, qdName, 0);
    }
    const s1 = this._readPinBit(comp, s1N);
    const s2 = this._readPinBit(comp, s2N);
    if (s1 === 1) {
      state.qa = this._readPinBit(comp, p1aN);
      state.qb = this._readPinBit(comp, p1bN);
      state.qc = this._readPinBit(comp, p1cN);
      state.qd = this._readPinBit(comp, p1dN);
    } else if (s2 === 1) {
      state.qa = this._readPinBit(comp, p2aN);
      state.qb = this._readPinBit(comp, p2bN);
      state.qc = this._readPinBit(comp, p2cN);
      state.qd = this._readPinBit(comp, p2dN);
    } else {
      const clk = this._readPinBit(comp, clkN);
      if (state.prevClk === 0 && clk === 1) {
        const ser = this._readPinBit(comp, serN);
        state.qd = state.qc; state.qc = state.qb; state.qb = state.qa; state.qa = ser;
      }
      state.prevClk = this._readPinBit(comp, clkN);
    }
    return this._drivePinBit(comp, qdName, state.qd);
  }

  _evaluateShiftReg5Bit(comp, gate) {
    // 74x96: 5 bit PIPO shift register with async preset and clear.
    // inputs: [CLK, CLR, SER, A, B, C, D, E, PE], outputs: [QA, QB, QC, QD, QE]
    // CLR=0: async clear. PE=1: parallel load A-E on rising CLK. PE=0: shift SER→QA..→QE.
    const [clkN, clrN, serN, aN, bN, cN, dN, eN, peN] = gate.inputs;
    const [qaName, qbName, qcName, qdName, qeName] = gate.outputs;
    const state = this._getSeqState(comp, qaName, { qa: 0, qb: 0, qc: 0, qd: 0, qe: 0, prevClk: 0 });
    this._drivePinBits(comp, gate.outputs, [state.qa, state.qb, state.qc, state.qd, state.qe]);
    const clr = this._readPinBit(comp, clrN);
    if (clr === 0) {
      state.qa = state.qb = state.qc = state.qd = state.qe = 0;
      state.prevClk = 0;
      return this._drivePinBits(comp, gate.outputs, [0, 0, 0, 0, 0]);
    }
    const clk = this._readPinBit(comp, clkN);
    if (state.prevClk === 0 && clk === 1) {
      const pe = this._readPinBit(comp, peN);
      if (pe === 1) {
        state.qa = this._readPinBit(comp, aN);
        state.qb = this._readPinBit(comp, bN);
        state.qc = this._readPinBit(comp, cN);
        state.qd = this._readPinBit(comp, dN);
        state.qe = this._readPinBit(comp, eN);
      } else {
        const ser = this._readPinBit(comp, serN);
        state.qe = state.qd; state.qd = state.qc; state.qc = state.qb; state.qb = state.qa; state.qa = ser;
      }
    }
    state.prevClk = clk;
    return this._drivePinBits(comp, gate.outputs, [state.qa, state.qb, state.qc, state.qd, state.qe]);
  }

  _evaluateRateMult6Bit(comp, gate) {
    // 74x97: 6 bit binary rate multiplier. Simplified: Y = CLK & ENP when no cascade.
    // inputs: [CLK, ENP, A, B, C, D, E, F], outputs: [Y, Z, UNITY]
    // Static approximation: Y = CLK AND ENP (pass-through with enable).
    const [clkN, enpN] = gate.inputs;
    const [yName, zName] = gate.outputs;
    const clk = this._readPinBit(comp, clkN);
    const enp = this._readPinBit(comp, enpN);
    const y = clk & enp;
    let changed = false;
    if (this._drivePinBit(comp, yName, y)) changed = true;
    if (zName && this._drivePinBit(comp, zName, y)) changed = true;
    return changed;
  }

  _evaluateSelReg4Bit(comp, gate) {
    // 74x98: 4 bit data selector/storage register.
    // inputs: [CLK, S, 0A, 0B, 0C, 0D, 1A, 1B, 1C, 1D], outputs: [QA, QB, QC, QD]
    // On rising CLK: S=0 → load from 0A-0D; S=1 → load from 1A-1D.
    const [clkN, sN, a0N, b0N, c0N, d0N, a1N, b1N, c1N, d1N] = gate.inputs;
    const [qaName, qbName, qcName, qdName] = gate.outputs;
    const state = this._getSeqState(comp, qaName, { qa: 0, qb: 0, qc: 0, qd: 0, prevClk: 0 });
    this._drivePinBits(comp, gate.outputs, [state.qa, state.qb, state.qc, state.qd]);
    const clk = this._readPinBit(comp, clkN);
    if (state.prevClk === 0 && clk === 1) {
      const s = this._readPinBit(comp, sN);
      if (s === 0) {
        state.qa = this._readPinBit(comp, a0N); state.qb = this._readPinBit(comp, b0N);
        state.qc = this._readPinBit(comp, c0N); state.qd = this._readPinBit(comp, d0N);
      } else {
        state.qa = this._readPinBit(comp, a1N); state.qb = this._readPinBit(comp, b1N);
        state.qc = this._readPinBit(comp, c1N); state.qd = this._readPinBit(comp, d1N);
      }
    }
    state.prevClk = clk;
    return this._drivePinBits(comp, gate.outputs, [state.qa, state.qb, state.qc, state.qd]);
  }

  _evaluateShiftReg4BitBidir(comp, gate) {
    // 74x99: 4 bit bidirectional universal shift register.
    // inputs: [CLK, S0, S1, SER_R, SER_L, A, B, C, D], outputs: [QA, QB, QC, QD]
    // S1=0,S0=0: hold. S1=0,S0=1: shift right (SER_R→QA..QD). 
    // S1=1,S0=0: shift left (SER_L→QD..QA). S1=1,S0=1: parallel load.
    const [clkN, s0N, s1N, serRN, serLN, aN, bN, cN, dN] = gate.inputs;
    const [qaName, qbName, qcName, qdName] = gate.outputs;
    const state = this._getSeqState(comp, qaName, { qa: 0, qb: 0, qc: 0, qd: 0, prevClk: 0 });
    this._drivePinBits(comp, gate.outputs, [state.qa, state.qb, state.qc, state.qd]);
    const clk = this._readPinBit(comp, clkN);
    if (state.prevClk === 0 && clk === 1) {
      const s0 = this._readPinBit(comp, s0N);
      const s1 = this._readPinBit(comp, s1N);
      if (s1 === 0 && s0 === 1) {
        const ser = this._readPinBit(comp, serRN);
        state.qd = state.qc; state.qc = state.qb; state.qb = state.qa; state.qa = ser;
      } else if (s1 === 1 && s0 === 0) {
        const ser = this._readPinBit(comp, serLN);
        state.qa = state.qb; state.qb = state.qc; state.qc = state.qd; state.qd = ser;
      } else if (s1 === 1 && s0 === 1) {
        state.qa = this._readPinBit(comp, aN); state.qb = this._readPinBit(comp, bN);
        state.qc = this._readPinBit(comp, cN); state.qd = this._readPinBit(comp, dN);
      }
    }
    state.prevClk = clk;
    return this._drivePinBits(comp, gate.outputs, [state.qa, state.qb, state.qc, state.qd]);
  }

  _evaluateSRLatch(comp, gate) {
    // SR Latch: for 74x118 hex set/reset latch.
    // inputs: [S, CLR], output: [Q]
    // CLR=0 (active LOW): async reset Q=0.
    // S=1 (set): Q=1. S=0: hold.
    const [sN, clrN] = gate.inputs;
    const qName = gate.outputs[0];
    const state = this._getSeqState(comp, qName, { q: 0 });
    const clr = this._readPinBit(comp, clrN);
    if (clr === 0) {
      state.q = 0;
    } else {
      const s = this._readPinBit(comp, sN);
      if (s === 1) state.q = 1;
      // else hold
    }
    return this._drivePinBit(comp, qName, state.q);
  }

  _evaluateDec3To8Reg(comp, gate) {
    // 74AS131/74ALS131: 3-to-8 line decoder with address register, inverting outputs.
    // inputs: [CLK, OE, A0, A1, A2], outputs: [Y0..Y7]
    // Rising CLK: latch address inputs. OE=0: decode latched address → active LOW outputs.
    // OE=1: all outputs HiZ (3-state).
    const [clkN, oeN, a0N, a1N, a2N] = gate.inputs;
    const stateName = gate.outputs[0];
    const state = this._getSeqState(comp, stateName, { addr: 0, prevClk: 0 });
    const oe = this._readPinBit(comp, oeN);
    let changed = false;
    const clk = this._readPinBit(comp, clkN);
    if (state.prevClk === 0 && clk === 1) {
      const a0 = this._readPinBit(comp, a0N);
      const a1 = this._readPinBit(comp, a1N);
      const a2 = this._readPinBit(comp, a2N);
      state.addr = a0 | (a1 << 1) | (a2 << 2);
    }
    state.prevClk = clk;
    if (oe !== 0) {
      for (const op of gate.outputs) {
        if (this._drivePinHighZ(comp, op)) changed = true;
      }
      return changed;
    }
    for (let i = 0; i < gate.outputs.length; i++) {
      const bit = (i === state.addr) ? 0 : 1; // active LOW: selected output = 0
      if (this._drivePinBit(comp, gate.outputs[i], bit)) changed = true;
    }
    return changed;
  }

  _evaluateDec3To8Latch(comp, gate) {
    // 74x137: 3-to-8 decoder with address latch. Active LOW G1n, active HIGH G2 enables.
    // inputs: [A0, A1, A2, G1n, G2, LE], outputs: [Y0..Y7]
    // LE=1 (transparent): address passes through. LE=0: address latched.
    // Outputs active LOW. Enabled when G1n=0 AND G2=1.
    const [a0N, a1N, a2N, g1nN, g2N, leN] = gate.inputs;
    const stateName = gate.outputs[0];
    const state = this._getSeqState(comp, stateName, { addr: 0 });
    const le = this._readPinBit(comp, leN);
    if (le === 1) {
      state.addr = this._readPinBit(comp, a0N) |
                   (this._readPinBit(comp, a1N) << 1) |
                   (this._readPinBit(comp, a2N) << 2);
    }
    const g1n = this._readPinBit(comp, g1nN);
    const g2 = this._readPinBit(comp, g2N);
    const enabled = (g1n === 0) && (g2 === 1);
    let changed = false;
    for (let i = 0; i < gate.outputs.length; i++) {
      const bit = (enabled && i === state.addr) ? 0 : 1;
      if (this._drivePinBit(comp, gate.outputs[i], bit)) changed = true;
    }
    return changed;
  }

  _evaluatePriorityEnc10to4(comp, gate) {
    // 74x147: 10-to-4-line BCD priority encoder. All inputs/outputs active LOW.
    // inputs: [I1..I9] (9 active LOW inputs; I0 implicit lowest priority = any undriven)
    // outputs: [A0n, A1n, A2n, A3n] (active LOW BCD)
    // I9=highest priority. All inactive → output 0000 (all HIGH = ~0).
    const [i1,i2,i3,i4,i5,i6,i7,i8,i9] = this._readGateInputs(comp, gate.inputs);
    let val = 0;
    if (!i1) val = 1; if (!i2) val = 2; if (!i3) val = 3;
    if (!i4) val = 4; if (!i5) val = 5; if (!i6) val = 6;
    if (!i7) val = 7; if (!i8) val = 8; if (!i9) val = 9;
    // Active LOW inverted BCD output
    return this._drivePinBits(comp, gate.outputs, [
      (val & 1) ? 0 : 1,
      (val & 2) ? 0 : 1,
      (val & 4) ? 0 : 1,
      (val & 8) ? 0 : 1,
    ]);
  }

  _evaluatePriorityEnc8Line(comp, gate) {
    // 74x149: 8-line cascadable priority encoder (1-of-8 output).
    // inputs: [X0..X7, EI] X7=highest priority, active HIGH; EI=1 disables
    // outputs: [Y0..Y7, EO] Yn=LOW if Xn is highest active; EO=0 if no active input
    const bits = this._readGateInputs(comp, gate.inputs);
    const ei = bits[8];
    let changed = false;
    if (ei === 1) {
      for (let i = 0; i < 8; i++) { if (this._drivePinBit(comp, gate.outputs[i], 1)) changed = true; }
      if (this._drivePinBit(comp, gate.outputs[8], 0)) changed = true;
      return changed;
    }
    let highest = -1;
    for (let i = 7; i >= 0; i--) { if (bits[i]) { highest = i; break; } }
    for (let i = 0; i < 8; i++) {
      const bit = (i === highest) ? 0 : 1;
      if (this._drivePinBit(comp, gate.outputs[i], bit)) changed = true;
    }
    const eo = (highest === -1) ? 0 : 1;
    if (this._drivePinBit(comp, gate.outputs[8], eo)) changed = true;
    return changed;
  }

  _evaluateMux8to1Inv(comp, gate) {
    // 74x152: 8-to-1 multiplexer, inverted W output only, no strobe.
    // inputs: [D0..D7, A, B, C], outputs: [W]
    const bits = this._readGateInputs(comp, gate.inputs);
    const sel = bits[8] | (bits[9] << 1) | (bits[10] << 2);
    return this._drivePinBit(comp, gate.outputs[0], bits[sel] ? 0 : 1);
  }

  _evaluateDemux2to4(comp, gate) {
    // Demux 2-to-4 with data input (C). Used by 74x155, 74x156.
    // inputs: [A, B, G, C] G=active LOW enable, C is data; pin ending 'n' → auto-invert
    // outputs: [Y0..Y3] active LOW: Y_sel=0, others=1
    // enabled when G=0 AND effective_C=0 (C if normal, NOT(pin) if name ends 'n')
    const [aName, bName, gName, cName] = gate.inputs;
    const a = this._readPinBit(comp, aName);
    const b = this._readPinBit(comp, bName);
    const g = this._readPinBit(comp, gName);
    const c = this._readPinBit(comp, cName, { invert: cName.endsWith('n') });
    const enabled = (g === 0) && (c === 0);
    const sel = a | (b << 1);
    const isOC = comp.chipDef && comp.chipDef.openCollector;
    let changed = false;
    for (let i = 0; i < gate.outputs.length; i++) {
      const bit = (enabled && i === sel) ? 0 : 1;
      if (isOC) { if (this._drivePinOC(comp, gate.outputs[i], bit)) changed = true; }
      else { if (this._drivePinBit(comp, gate.outputs[i], bit)) changed = true; }
    }
    return changed;
  }

  _evaluateCounterDecNixie(comp, gate) {
    // 74x142: Decade counter + 1-of-10 decoder + Nixie OC driver.
    // inputs: [CLK, CLR, STROBE]
    // outputs: [Y0..Y9] (OC, active LOW: count-matching Y goes LOW)
    // CLR=1: async clear. Rising CLK: count++. STROBE=1: transparent; STROBE=0: latches.
    const [clkN, clrN, strobeN] = gate.inputs;
    const stateName = gate.outputs[0];
    const state = this._getSeqState(comp, stateName, { count: 0, prevClk: 0, latched: 0 });
    const clr = this._readPinBit(comp, clrN);
    const clk = this._readPinBit(comp, clkN);
    const strobe = this._readPinBit(comp, strobeN);
    if (clr === 1) { state.count = 0; state.latched = 0; }
    else if (state.prevClk === 0 && clk === 1) {
      state.count = (state.count + 1) % 10;
    }
    state.prevClk = clk;
    if (strobe === 1) state.latched = state.count;
    const displayVal = state.latched;
    const isOC = comp.chipDef && comp.chipDef.openCollector;
    let changed = false;
    for (let i = 0; i < 10; i++) {
      const bit = (i === displayVal) ? 0 : 1;
      if (isOC) { if (this._drivePinOC(comp, gate.outputs[i], bit)) changed = true; }
      else { if (this._drivePinBit(comp, gate.outputs[i], bit)) changed = true; }
    }
    return changed;
  }

  _evaluateCounter7Seg(comp, gate) {
    // 74x143/74x144: Decade counter + latch + 7-segment decoder + driver.
    // inputs: [CLK, CLR, STROBE, ENP, ENT]
    // outputs: [QA, QB, QC, QD, RCO, a, b, c, d, e, f, g]
    // CLR=1(H): async clear. Rising CLK with ENP&ENT: count 0-9.
    // STROBE=1: transparent; STROBE=0: latch for 7-seg output.
    // 74143: constant-current outputs (push-pull). 74144: OC outputs.
    const [clkN, clrN, strobeN, enpN, entN] = gate.inputs;
    const [qaName, qbName, qcName, qdName, rcoName] = gate.outputs.slice(0, 5);
    const segNames = gate.outputs.slice(5); // a,b,c,d,e,f,g
    const state = this._getSeqState(comp, qaName, { count: 0, prevClk: 0, latched: 0 });
    const clr = this._readPinBit(comp, clrN);
    const clk = this._readPinBit(comp, clkN);
    const enp = this._readPinBit(comp, enpN);
    const ent = this._readPinBit(comp, entN);
    const strobe = this._readPinBit(comp, strobeN);
    if (clr === 1) { state.count = 0; state.latched = 0; }
    else if (state.prevClk === 0 && clk === 1) {
      if (enp && ent) state.count = (state.count + 1) % 10;
    }
    state.prevClk = clk;
    if (strobe === 1) state.latched = state.count;
    const n = state.count;
    const rco = (ent === 1 && n === 9) ? 1 : 0;
    let changed = false;
    changed = this._drivePinBits(comp, [qaName, qbName, qcName, qdName],
      [n&1, (n>>1)&1, (n>>2)&1, (n>>3)&1]);
    if (this._drivePinBit(comp, rcoName, rco)) changed = true;
    // 7-segment decode: standard mapping, active HIGH segments
    const SEG7 = [
      [1,1,1,1,1,1,0], // 0
      [0,1,1,0,0,0,0], // 1
      [1,1,0,1,1,0,1], // 2
      [1,1,1,1,0,0,1], // 3
      [0,1,1,0,0,1,1], // 4
      [1,0,1,1,0,1,1], // 5
      [1,0,1,1,1,1,1], // 6
      [1,1,1,0,0,0,0], // 7
      [1,1,1,1,1,1,1], // 8
      [1,1,1,1,0,1,1], // 9
    ];
    const segs = SEG7[state.latched] || SEG7[0];
    const isOC = comp.chipDef && comp.chipDef.openCollector;
    for (let i = 0; i < segNames.length && i < 7; i++) {
      const bit = segs[i] || 0;
      if (isOC) { if (this._drivePinOC(comp, segNames[i], bit)) changed = true; }
      else { if (this._drivePinBit(comp, segNames[i], bit)) changed = true; }
    }
    return changed;
  }

  _evaluateCounterSyncDecadeSC(comp, gate) {
    // 74x162: Synchronous 4 bit decade counter with SYNCHRONOUS clear.
    // inputs: [CLK, CLR, LOAD, ENP, ENT, A, B, C, D]
    // outputs: [QA, QB, QC, QD, RCO]
    // CLR=0 takes effect on next rising CLK (synchronous). RCO = ENT AND (count==9).
    const [clkN,clrN,loadN,enpN,entN,aN,bN,cN,dN] = gate.inputs;
    const [qaName,qbName,qcName,qdName,rcoName] = gate.outputs;
    const state = this._getSeqState(comp, qaName, { count: 0, prevClk: 0 });
    this._drivePinBits(comp, [qaName,qbName,qcName,qdName],
      [state.count&1,(state.count>>1)&1,(state.count>>2)&1,(state.count>>3)&1]);
    const clk = this._readPinBit(comp, clkN);
    if (state.prevClk === 0 && clk === 1) {
      const clr  = this._readPinBit(comp, clrN);
      const load = this._readPinBit(comp, loadN);
      const enp  = this._readPinBit(comp, enpN);
      const ent  = this._readPinBit(comp, entN);
      if (clr === 0) {
        state.count = 0;
      } else if (load === 0) {
        const a = this._readPinBit(comp, aN);
        const b = this._readPinBit(comp, bN);
        const c = this._readPinBit(comp, cN);
        const d = this._readPinBit(comp, dN);
        state.count = a | (b<<1) | (c<<2) | (d<<3);
      } else if (enp && ent) {
        state.count = (state.count + 1) % 10;
      }
    }
    state.prevClk = clk;
    const ent = this._readPinBit(comp, entN);
    const rco = (ent && state.count === 9) ? 1 : 0;
    let changed = this._drivePinBits(comp, [qaName,qbName,qcName,qdName],
      [state.count&1,(state.count>>1)&1,(state.count>>2)&1,(state.count>>3)&1]);
    if (this._drivePinBit(comp, rcoName, rco)) changed = true;
    return changed;
  }

  _evaluateShiftReg8BitPar(comp, gate) {
    // 74166: 8 bit parallel-load shift register with CLK enable.
    // inputs: [CLK, CLR, SHLD, SER, A, B, C, D, E, F, G, H, CLK_EN]
    // outputs: [QH]
    // CLR=0: async clear. SH/LD=1: shift; SH/LD=0: parallel load on rising CLK.
    // CLK_EN=1: inhibits clock (disables counting/shifting).
    const [clkN, clrN, shldN, serN, aN, bN, cN, dN, eN, fN, gN, hN, clkEnN] = gate.inputs;
    const [qhName] = gate.outputs;
    const state = this._getSeqState(comp, qhName, { reg: 0, prevClk: 0 });
    const clk = this._readPinBit(comp, clkN);
    const clr = this._readPinBit(comp, clrN);
    const clkEn = this._readPinBit(comp, clkEnN);
    if (clr === 0) {
      state.reg = 0;
    } else if (clkEn === 0 && state.prevClk === 0 && clk === 1) {
      const shld = this._readPinBit(comp, shldN);
      if (shld === 0) {
        // Parallel load: A→QA(bit0)...H→QH(bit7)
        state.reg = this._readPinBit(comp, aN) | (this._readPinBit(comp, bN)<<1) |
          (this._readPinBit(comp, cN)<<2) | (this._readPinBit(comp, dN)<<3) |
          (this._readPinBit(comp, eN)<<4) | (this._readPinBit(comp, fN)<<5) |
          (this._readPinBit(comp, gN)<<6) | (this._readPinBit(comp, hN)<<7);
      } else {
        // Shift: SER enters at QA (bit0), bits shift toward QH (bit7)
        state.reg = ((state.reg << 1) & 0xFF) | this._readPinBit(comp, serN);
      }
    }
    state.prevClk = clk;
    return this._drivePinBit(comp, qhName, (state.reg >> 7) & 1);
  }

  _evaluateRateMultDecade(comp, gate) {
    // 74167: Synchronous decade rate multiplier.
    // inputs: [CLK, CLR, LOAD, ENP, ENT, A, B, C, D]
    // outputs: [Z, Y, RCO]
    // CLR=0: async clear. LOAD=0: sync load on next CLK. ENP AND ENT to enable count.
    // Z: goes LOW (one period) when count == loaded rate value AND enabled.
    // Y = ENT (cascade enable output). RCO = ENT AND count==9.
    const [clkN, clrN, loadN, enpN, entN, aN, bN, cN, dN] = gate.inputs;
    const [zName, yName, rcoName] = gate.outputs;
    const state = this._getSeqState(comp, zName, { count: 0, rate: 0, prevClk: 0 });
    const clk = this._readPinBit(comp, clkN);
    const clr = this._readPinBit(comp, clrN);
    if (clr === 0) { state.count = 0; }
    else if (state.prevClk === 0 && clk === 1) {
      const load = this._readPinBit(comp, loadN);
      const enp = this._readPinBit(comp, enpN);
      const ent = this._readPinBit(comp, entN);
      if (load === 0) {
        state.rate = this._readPinBit(comp, aN) | (this._readPinBit(comp, bN)<<1) |
          (this._readPinBit(comp, cN)<<2) | (this._readPinBit(comp, dN)<<3);
      } else if (enp === 1 && ent === 1) {
        state.count = (state.count + 1) % 10;
      }
    }
    state.prevClk = clk;
    const ent = this._readPinBit(comp, entN);
    const enp = this._readPinBit(comp, enpN);
    const enabled = (ent === 1 && enp === 1);
    const z = (enabled && state.count === state.rate) ? 0 : 1;
    const rco = (ent === 1 && state.count === 9) ? 0 : 1;
    let changed = false;
    if (this._drivePinBit(comp, zName, z)) changed = true;
    if (this._drivePinBit(comp, yName, ent)) changed = true;
    if (this._drivePinBit(comp, rcoName, rco)) changed = true;
    return changed;
  }

  _evaluateCounterUpDownDecade(comp, gate) {
    // 74168: Synchronous 4 bit up/down decade counter (single CLK).
    // inputs: [CLK, UD, LOAD, ENP, ENT, A, B, C, D]
    // outputs: [QA, QB, QC, QD, RCO]
    // UD=1: count up; UD=0: count down. LOAD=0: sync load on rising CLK. No CLR.
    // ENP AND ENT must both be HIGH to enable. RCO: active LOW at terminal count AND ENT=1.
    const [clkN, udN, loadN, enpN, entN, aN, bN, cN, dN] = gate.inputs;
    const [qaName, qbName, qcName, qdName, rcoName] = gate.outputs;
    const state = this._getSeqState(comp, qaName, { count: 0, prevClk: 0 });
    const clk = this._readPinBit(comp, clkN);
    if (state.prevClk === 0 && clk === 1) {
      const ud   = this._readPinBit(comp, udN);
      const load = this._readPinBit(comp, loadN);
      const enp  = this._readPinBit(comp, enpN);
      const ent  = this._readPinBit(comp, entN);
      if (load === 0) {
        state.count = this._readPinBit(comp, aN) | (this._readPinBit(comp, bN)<<1) |
          (this._readPinBit(comp, cN)<<2) | (this._readPinBit(comp, dN)<<3);
      } else if (enp === 1 && ent === 1) {
        if (ud === 1) state.count = (state.count + 1) % 10;
        else state.count = (state.count - 1 + 10) % 10;
      }
    }
    state.prevClk = clk;
    const ent = this._readPinBit(comp, entN);
    const ud  = this._readPinBit(comp, udN);
    const terminal = (ud === 1) ? 9 : 0;
    const rco = (ent === 1 && state.count === terminal) ? 0 : 1;
    let changed = this._drivePinBits(comp, [qaName,qbName,qcName,qdName],
      [state.count&1,(state.count>>1)&1,(state.count>>2)&1,(state.count>>3)&1]);
    if (this._drivePinBit(comp, rcoName, rco)) changed = true;
    return changed;
  }

  _evaluateCounterUpDownBin(comp, gate) {
    // 74169: Synchronous 4 bit up/down binary counter (single CLK).
    // inputs: [CLK, UD, LOAD, ENP, ENT, A, B, C, D]
    // outputs: [QA, QB, QC, QD, RCO]
    // Same as 74168 but binary (0-15) and terminal: 15 for up, 0 for down.
    const [clkN, udN, loadN, enpN, entN, aN, bN, cN, dN] = gate.inputs;
    const [qaName, qbName, qcName, qdName, rcoName] = gate.outputs;
    const state = this._getSeqState(comp, qaName, { count: 0, prevClk: 0 });
    const clk = this._readPinBit(comp, clkN);
    if (state.prevClk === 0 && clk === 1) {
      const ud   = this._readPinBit(comp, udN);
      const load = this._readPinBit(comp, loadN);
      const enp  = this._readPinBit(comp, enpN);
      const ent  = this._readPinBit(comp, entN);
      if (load === 0) {
        state.count = this._readPinBit(comp, aN) | (this._readPinBit(comp, bN)<<1) |
          (this._readPinBit(comp, cN)<<2) | (this._readPinBit(comp, dN)<<3);
      } else if (enp === 1 && ent === 1) {
        if (ud === 1) state.count = (state.count + 1) & 0xF;
        else state.count = (state.count - 1 + 16) & 0xF;
      }
    }
    state.prevClk = clk;
    const ent = this._readPinBit(comp, entN);
    const ud  = this._readPinBit(comp, udN);
    const terminal = (ud === 1) ? 15 : 0;
    const rco = (ent === 1 && state.count === terminal) ? 0 : 1;
    let changed = this._drivePinBits(comp, [qaName,qbName,qcName,qdName],
      [state.count&1,(state.count>>1)&1,(state.count>>2)&1,(state.count>>3)&1]);
    if (this._drivePinBit(comp, rcoName, rco)) changed = true;
    return changed;
  }

  _evaluateRegFile4x4(comp, gate) {
    // 74170: 4×4 register file (4 words × 4 bits).
    // inputs: [D1, D2, D3, D4, WA1, WA2, WE, RA1, RA2, RE]
    // outputs: [Q1, Q2, Q3, Q4]
    // WE=0: write D1-D4 to address WA1,WA2. RE=0: read from address RA1,RA2.
    // RE=1: outputs disabled (HIGH_Z for 3-state, OC pull up for open-collector).
    const [d1N,d2N,d3N,d4N,wa1N,wa2N,weN,ra1N,ra2N,reN] = gate.inputs;
    const state = this._getSeqState(comp, gate.outputs[0], { mem: [0,0,0,0] });
    const we = this._readPinBit(comp, weN);
    if (we === 0) {
      const wa = this._readPinBit(comp, wa1N) | (this._readPinBit(comp, wa2N)<<1);
      state.mem[wa] = this._readPinBit(comp, d1N) | (this._readPinBit(comp, d2N)<<1) |
        (this._readPinBit(comp, d3N)<<2) | (this._readPinBit(comp, d4N)<<3);
    }
    const re = this._readPinBit(comp, reN);
    if (re !== 0) {
      let changed = false;
      for (const out of gate.outputs) { if (this._drivePinHighZ(comp, out)) changed = true; }
      return changed;
    }
    const ra = this._readPinBit(comp, ra1N) | (this._readPinBit(comp, ra2N)<<1);
    const data = state.mem[ra];
    const isOC = comp.chipDef && comp.chipDef.openCollector;
    let changed = false;
    for (let i = 0; i < 4; i++) {
      const bit = (data >> i) & 1;
      if (isOC) { if (this._drivePinOC(comp, gate.outputs[i], bit)) changed = true; }
      else { if (this._drivePinBit(comp, gate.outputs[i], bit)) changed = true; }
    }
    return changed;
  }

  _evaluateRegFile8x2Tri(comp, gate) {
    // 74172: 8×2 multi-port register file (8 words × 2 bits), 3-state outputs.
    // inputs: [D1, D2, WA1, WA2, WA3, WE, RA1, RA2, RA3, OE]
    // outputs: [Y1, Y2]
    // WE=0: write D1,D2 to write address (WA1-WA3, 3 bit → 8 words).
    // OE=0: read from read address RA1-RA3. OE=1: Y1,Y2 = HIGH_Z.
    const [d1N,d2N,wa1N,wa2N,wa3N,weN,ra1N,ra2N,ra3N,oeN] = gate.inputs;
    const state = this._getSeqState(comp, gate.outputs[0], { mem: new Array(8).fill(0) });
    const we = this._readPinBit(comp, weN);
    if (we === 0) {
      const wa = this._readPinBit(comp, wa1N) | (this._readPinBit(comp, wa2N)<<1) | (this._readPinBit(comp, wa3N)<<2);
      state.mem[wa] = this._readPinBit(comp, d1N) | (this._readPinBit(comp, d2N)<<1);
    }
    const oe = this._readPinBit(comp, oeN);
    if (oe !== 0) {
      let changed = false;
      for (const out of gate.outputs) { if (this._drivePinHighZ(comp, out)) changed = true; }
      return changed;
    }
    const ra = this._readPinBit(comp, ra1N) | (this._readPinBit(comp, ra2N)<<1) | (this._readPinBit(comp, ra3N)<<2);
    const data = state.mem[ra];
    return this._drivePinBits(comp, gate.outputs, [(data)&1, (data>>1)&1]);
  }

  _evaluateCounterBiqPreset(comp, gate) {
    // 74176: Presettable decade bi-quinary counter/latch.
    // inputs: [CLK1, CLK2, CLR, LOAD, A, B, C, D]
    // outputs: [QA, QB, QC, QD]
    // CLK1: toggles QA (÷2). CLK2: counts QBD in sequence (÷5 = 0,1,2,3,4,0...).
    // LOAD=0 (async): immediately loads A,B,C,D. CLR=0 (async): clears all.
    const [clk1N, clk2N, clrN, loadN, aN, bN, cN, dN] = gate.inputs;
    const [qaName, qbName, qcName, qdName] = gate.outputs;
    const state = this._getSeqState(comp, qaName, { qa: 0, cnt5: 0, prevClk1: 0, prevClk2: 0 });
    const clr = this._readPinBit(comp, clrN);
    const load = this._readPinBit(comp, loadN);
    if (clr === 0) {
      state.qa = 0; state.cnt5 = 0;
    } else if (load === 0) {
      state.qa = this._readPinBit(comp, aN);
      // B,C,D → cnt5 mapping: BCD codes of 1-5 → cnt5=0-4
      const b = this._readPinBit(comp, bN);
      const c = this._readPinBit(comp, cN);
      const d = this._readPinBit(comp, dN);
      state.cnt5 = b | (c<<1) | (d<<2); // simplified (BCD 0-4 → 0-4)
    } else {
      const clk1 = this._readPinBit(comp, clk1N);
      const clk2 = this._readPinBit(comp, clk2N);
      if (state.prevClk1 === 1 && clk1 === 0) state.qa ^= 1; // toggle on falling CLK1
      if (state.prevClk2 === 1 && clk2 === 0) state.cnt5 = (state.cnt5 + 1) % 5; // count mod 5 on falling CLK2
      state.prevClk1 = clk1;
      state.prevClk2 = clk2;
    }
    // cnt5 to BCD: 0→000, 1→001, 2→010, 3→011, 4→100
    const qb = state.cnt5 & 1;
    const qc = (state.cnt5 >> 1) & 1;
    const qd = (state.cnt5 >> 2) & 1;
    return this._drivePinBits(comp, [qaName, qbName, qcName, qdName], [state.qa, qb, qc, qd]);
  }

  _evaluateCounterBinPreset(comp, gate) {
    // 74177: Presettable binary counter/latch.
    // inputs: [CLK1, CLK2, CLR, LOAD, A, B, C, D]
    // outputs: [QA, QB, QC, QD]
    // CLK1: toggles QA (÷2). CLK2: counts QBD (÷8 = 0-7). Together: 4 bit binary 0-15.
    // LOAD=0: async preset. CLR=0: async clear.
    const [clk1N, clk2N, clrN, loadN, aN, bN, cN, dN] = gate.inputs;
    const [qaName, qbName, qcName, qdName] = gate.outputs;
    const state = this._getSeqState(comp, qaName, { qa: 0, cnt8: 0, prevClk1: 0, prevClk2: 0 });
    const clr = this._readPinBit(comp, clrN);
    const load = this._readPinBit(comp, loadN);
    if (clr === 0) {
      state.qa = 0; state.cnt8 = 0;
    } else if (load === 0) {
      state.qa = this._readPinBit(comp, aN);
      state.cnt8 = this._readPinBit(comp, bN) | (this._readPinBit(comp, cN)<<1) | (this._readPinBit(comp, dN)<<2);
    } else {
      const clk1 = this._readPinBit(comp, clk1N);
      const clk2 = this._readPinBit(comp, clk2N);
      if (state.prevClk1 === 1 && clk1 === 0) state.qa ^= 1;
      if (state.prevClk2 === 1 && clk2 === 0) state.cnt8 = (state.cnt8 + 1) & 7;
      state.prevClk1 = clk1;
      state.prevClk2 = clk2;
    }
    return this._drivePinBits(comp, [qaName, qbName, qcName, qdName],
      [state.qa, state.cnt8&1, (state.cnt8>>1)&1, (state.cnt8>>2)&1]);
  }

  _evaluateShiftReg4BitClr(comp, gate) {
    // 74179: 4 bit parallel-access shift register with async CLR and complementary QDn.
    // inputs: [SER, A, B, C, D, PE, CLK, CLR]
    // outputs: [QA, QB, QC, QD, QDn]
    // CLR=0: async clear. PE=1: parallel load on rising CLK. PE=0: shift on rising CLK.
    const [serN, aN, bN, cN, dN, peN, clkN, clrN] = gate.inputs;
    const [qaName, qbName, qcName, qdName, qdnName] = gate.outputs;
    const state = this._getSeqState(comp, qaName, { qa: 0, qb: 0, qc: 0, qd: 0, prevClk: 0 });
    const clr = this._readPinBit(comp, clrN);
    if (clr === 0) {
      state.qa = state.qb = state.qc = state.qd = 0;
    } else {
      const clk = this._readPinBit(comp, clkN);
      if (state.prevClk === 0 && clk === 1) {
        const pe = this._readPinBit(comp, peN);
        if (pe === 1) {
          // Parallel load
          state.qa = this._readPinBit(comp, aN);
          state.qb = this._readPinBit(comp, bN);
          state.qc = this._readPinBit(comp, cN);
          state.qd = this._readPinBit(comp, dN);
        } else {
          // Shift right: SER→QA, QA→QB, QB→QC, QC→QD
          state.qd = state.qc;
          state.qc = state.qb;
          state.qb = state.qa;
          state.qa = this._readPinBit(comp, serN);
        }
      }
      state.prevClk = this._readPinBit(comp, clkN);
    }
    return this._drivePinBits(comp, [qaName, qbName, qcName, qdName, qdnName],
      [state.qa, state.qb, state.qc, state.qd, state.qd ? 0 : 1]);
  }

  _evaluateParity9Bit(comp, gate) {
    // 74180: 9 bit odd/even parity generator/checker.
    // inputs: [A, B, C, D, E, F, G, H, EVEN_IN, ODD_IN]
    // outputs: [EVEN_OUT, ODD_OUT]
    // P = XOR of all 8 data bits (P=1 means odd number of HIGHs).
    const bits = this._readGateInputs(comp, gate.inputs);
    const p = bits.slice(0, 8).reduce((acc, b) => acc ^ b, 0); // 0=even, 1=odd
    const evenIn = bits[8];
    const oddIn  = bits[9];
    let evenOut, oddOut;
    if (evenIn === oddIn) {
      // Both same: both 0 → EVEN_OUT=1,ODD_OUT=1; both 1 → EVEN_OUT=0,ODD_OUT=0
      evenOut = evenIn ? 0 : 1;
      oddOut  = evenOut;
    } else if (evenIn === 1) {
      // EVEN mode: EVEN_OUT=1 if even parity, ODD_OUT=1 if odd parity
      evenOut = p === 0 ? 1 : 0;
      oddOut  = p === 1 ? 1 : 0;
    } else {
      // ODD mode: EVEN_OUT=1 if odd parity, ODD_OUT=1 if even parity
      evenOut = p === 1 ? 1 : 0;
      oddOut  = p === 0 ? 1 : 0;
    }
    return this._drivePinBits(comp, gate.outputs, [evenOut, oddOut]);
  }

  _evaluateAlu4Bit(comp, gate) {
    // 74181: 4 bit ALU and function generator (active HIGH data convention).
    // inputs: [A0,A1,A2,A3, B0,B1,B2,B3, S0,S1,S2,S3, M, Cn]
    // outputs: [F0,F1,F2,F3, Cn4, P, G, AeqB]
    // M=1: logic operations. M=0: arithmetic operations.
    // Cn is carry-in (active HIGH for arithmetic; ignored for logic).
    const bits = this._readGateInputs(comp, gate.inputs);
    const a  = bits[0] | (bits[1]<<1) | (bits[2]<<2) | (bits[3]<<3);
    const b  = bits[4] | (bits[5]<<1) | (bits[6]<<2) | (bits[7]<<3);
    const s  = bits[8] | (bits[9]<<1) | (bits[10]<<2) | (bits[11]<<3);
    const m  = bits[12];
    const cn = bits[13];

    let f, cn4, p, g;

    if (m === 1) {
      // Logic operations (Cn ignored)
      const logicFns = [
        (a,b) => (~a) & 0xF,
        (a,b) => ~(a|b) & 0xF,
        (a,b) => (~a)&b & 0xF,
        (a,b) => 0,
        (a,b) => ~(a&b) & 0xF,
        (a,b) => (~b) & 0xF,
        (a,b) => (a^b) & 0xF,
        (a,b) => a&(~b) & 0xF,
        (a,b) => (~a|b) & 0xF,
        (a,b) => ~(a^b) & 0xF,
        (a,b) => b & 0xF,
        (a,b) => (a&b) & 0xF,
        (a,b) => 0xF,
        (a,b) => (a|(~b)) & 0xF,
        (a,b) => (a|b) & 0xF,
        (a,b) => a & 0xF,
      ];
      f = logicFns[s](a, b);
      cn4 = 0; p = 0; g = 0;
    } else {
      // Arithmetic operations (Cn is carry-in)
      const bnot = (~b) & 0xF;
      const arithBase = [
        a,                   // 0000: A
        a | b,               // 0001: A OR B
        a | bnot,            // 0010: A OR NOT B
        0xF,                 // 0011: all ones (−1)
        a + (a & bnot),      // 0100: A + (A AND NOT B)
        (a|b) + (a&bnot),    // 0101: (A OR B) + (A AND NOT B)
        a - b - 1,           // 0110: A MINUS B MINUS 1
        (a&bnot) - 1,        // 0111: (A AND NOT B) - 1
        a + (a&b),           // 1000: A + (A AND B)
        a + b,               // 1001: A PLUS B
        (a|bnot) + (a&b),    // 1010: (A OR NOT B) + (A AND B)
        (a&b) - 1,           // 1011: (A AND B) - 1
        a + a,               // 1100: A + A (shift left)
        (a|b) + a,           // 1101: (A OR B) + A
        (a|bnot) + a,        // 1110: (A OR NOT B) + A
        a - 1,               // 1111: A MINUS 1
      ];
      const raw = arithBase[s] + cn;
      f    = raw & 0xF;
      cn4  = (raw >> 4) & 1;
      // P (propagate): CLA propagate = all bits propagate individually
      // G (generate): CLA generate from groups
      // Simplified: use carry propagate/generate for lookahead
      // Per-bit propagate pi = ai XOR bi (or as defined by S)
      // For simplicity, approximate P and G from the carry expression
      p = ((a | b) === 0xF) ? 1 : 0;  // all bits propagate
      g = (a & b) === 0 ? 0 : 1;       // any bit generates (simplified)
    }

    const [f0,f1,f2,f3] = [f&1,(f>>1)&1,(f>>2)&1,(f>>3)&1];
    const aeqb = (f === 0xF) ? 1 : 0; // A=B when all F bits are 1 (in logic mode comparison)
    return this._drivePinBits(comp, gate.outputs, [f0,f1,f2,f3, cn4, p, g, aeqb]);
  }

  _evaluateCarryLookahead(comp, gate) {
    // 74182: Lookahead carry generator. Works with 74181 ALUs.
    // inputs: [P0, G0, P1, G1, P2, G2, P3, G3, Cn]
    // outputs: [Cn_x, Cn_y, Cn_z, P, G]
    // Generates carry outputs for groups of 4 bit slices:
    // Cn_x = G0 + P0·Cn        (carry out from group 0, into group 1)
    // Cn_y = G1 + P1·Cn_x      (carry out from group 1, into group 2)
    // Cn_z = G2 + P2·Cn_y      (carry out from group 2, into group 3)
    // P_grp = P3·P2·P1·P0      (propagate through all 4 groups)
    // G_grp = G3 + P3·G2 + P3·P2·G1 + P3·P2·P1·G0   (group generate)
    const bits = this._readGateInputs(comp, gate.inputs);
    const p0=bits[0], g0=bits[1], p1=bits[2], g1=bits[3];
    const p2=bits[4], g2=bits[5], p3=bits[6], g3=bits[7], cn=bits[8];
    const cnX = g0 | (p0 & cn);
    const cnY = g1 | (p1 & cnX);
    const cnZ = g2 | (p2 & cnY);
    const pGrp = p3 & p2 & p1 & p0;
    const gGrp = g3 | (p3 & g2) | (p3 & p2 & g1) | (p3 & p2 & p1 & g0);
    return this._drivePinBits(comp, gate.outputs, [cnX, cnY, cnZ, pGrp, gGrp]);
  }

  _evaluateFullAdderDual(comp, gate) {
    // 74183: Dual carry-save full adder.
    // Each section: inputs [A, B, Cin] → outputs [Sum, Cout]
    // inputs: [A1, B1, C1in, A2, B2, C2in]
    // outputs: [S1, C1out, S2, C2out]
    const bits = this._readGateInputs(comp, gate.inputs);
    const sum1 = bits[0] + bits[1] + bits[2];
    const sum2 = bits[3] + bits[4] + bits[5];
    return this._drivePinBits(comp, gate.outputs, [
      sum1 & 1, (sum1 >> 1) & 1,
      sum2 & 1, (sum2 >> 1) & 1,
    ]);
  }

  _evaluateBcdToBin5(comp, gate) {
    // 74184: BCD to binary converter (ROM-based, open-collector, 5 input).
    // inputs: [B1, B2, B3, B4, B5, G]  (B1=bit1, B2=bit2, ..., B5=bit5 of BCD)
    // outputs: [Y2, Y3, Y4, Y5, Y6, Y7, Y8]  (bits 1-7 of binary, OC)
    // G=0: enabled. G=1: all outputs HIGH_Z (OC disabled).
    // BCD value = B1×2 + B2×4 + B3×8 + B4×10 + B5×20
    // Output Y(k) = bit (k-1) of binary equivalent.
    const bits = this._readGateInputs(comp, gate.inputs);
    const g = bits[5];
    if (g !== 0) {
      let changed = false;
      for (const out of gate.outputs) { if (this._drivePinHighZ(comp, out)) changed = true; }
      return changed;
    }
    const bcdVal = bits[0]*2 + bits[1]*4 + bits[2]*8 + bits[3]*10 + bits[4]*20;
    const isOC = comp.chipDef && comp.chipDef.openCollector;
    let changed = false;
    for (let i = 0; i < gate.outputs.length; i++) {
      const bit = (bcdVal >> (i + 1)) & 1;  // Y2=bit1, Y3=bit2, ..., Y8=bit7
      if (isOC) { if (this._drivePinOC(comp, gate.outputs[i], bit)) changed = true; }
      else { if (this._drivePinBit(comp, gate.outputs[i], bit)) changed = true; }
    }
    return changed;
  }

  _evaluateBinToBcd6(comp, gate) {
    // 74185: 6 bit binary-to-BCD converter (ROM-based, open-collector).
    // inputs: [B1, B2, B3, B4, B5, B6, G]  (B1=bit0 ... B6=bit5 of binary)
    // outputs: [Y2, Y3, Y4, Y5, Y6, Y7, Y8]  (bits 0-6 of packed BCD)
    // G=0: enabled. G=1: all outputs HIGH_Z.
    // binVal = B1 | (B2<<1) | ... | (B6<<5)  → 0-63
    // bcdPacked = (tens<<4) | units  → packed 2-digit BCD
    // Y(k) = bit(k-2) of bcdPacked
    const bits = this._readGateInputs(comp, gate.inputs);
    const g = bits[6];
    if (g !== 0) {
      let changed = false;
      for (const out of gate.outputs) { if (this._drivePinHighZ(comp, out)) changed = true; }
      return changed;
    }
    const binVal = bits[0] | (bits[1]<<1) | (bits[2]<<2) | (bits[3]<<3) | (bits[4]<<4) | (bits[5]<<5);
    const tens = Math.floor(binVal / 10);
    const units = binVal % 10;
    const bcdPacked = (tens << 4) | units;
    const isOC = comp.chipDef && comp.chipDef.openCollector;
    let changed = false;
    for (let i = 0; i < gate.outputs.length; i++) {
      const bit = (bcdPacked >> i) & 1;  // Y2=bit0, Y3=bit1, ..., Y8=bit6
      if (isOC) { if (this._drivePinOC(comp, gate.outputs[i], bit)) changed = true; }
      else { if (this._drivePinBit(comp, gate.outputs[i], bit)) changed = true; }
    }
    return changed;
  }

  _evaluateRam16x4Inv(comp, gate) {
    // 74189: 64 bit static RAM (16×4) with inverted 3-state outputs.
    // inputs: [A0, A1, A2, A3, D1, D2, D3, D4, CS, WE]
    // outputs: [Q1, Q2, Q3, Q4]  (inverted data outputs)
    // CS=0: chip enabled. CS=1: all outputs HiZ.
    // WE=0: write D1-D4 to address. WE=1 (read): output ~stored_data.
    const bits = this._readGateInputs(comp, gate.inputs);
    const addr = bits[0] | (bits[1]<<1) | (bits[2]<<2) | (bits[3]<<3);
    const cs = bits[8];
    const we = bits[9];
    const state = this._getSeqState(comp, gate.outputs[0], { mem: Array.from({length:16}, () => [0,0,0,0]) });
    if (cs !== 0) {
      let changed = false;
      for (const out of gate.outputs) { if (this._drivePinHighZ(comp, out)) changed = true; }
      return changed;
    }
    if (we === 0) {
      // Write (non-inverted) data to memory
      for (let i = 0; i < 4; i++) state.mem[addr][i] = bits[4 + i];
    }
    // Read: output INVERTED stored data
    const stored = state.mem[addr];
    return this._drivePinBits(comp, gate.outputs, [stored[0]^1, stored[1]^1, stored[2]^1, stored[3]^1]);
  }

  _evaluateCounterUpDownDecadeSingle(comp, gate) {
    // 74190: Synchronous presettable BCD decade up/down counter, single clock.
    // inputs: [CLK, UD, CTEN, LOAD, A, B, C, D]
    // outputs: [QA, QB, QC, QD, MX_MN, RCO]
    // LOAD=0 (async): immediately load A-D. CTEN=0: count enabled (active LOW).
    // UD=0: count up (terminal=9); UD=1: count down (terminal=0).
    // MX_MN=HIGH at terminal count when enabled. RCO=LOW at terminal when enabled.
    const [clkN, udN, ctenN, loadN, aN, bN, cN, dN] = gate.inputs;
    const [qaName, qbName, qcName, qdName, mxmnName, rcoName] = gate.outputs;
    const state = this._getSeqState(comp, qaName, { count: 0, prevClk: 0 });
    const load = this._readPinBit(comp, loadN);
    if (load === 0) {
      // Async preset
      state.count = this._readPinBit(comp, aN) | (this._readPinBit(comp, bN)<<1) |
        (this._readPinBit(comp, cN)<<2) | (this._readPinBit(comp, dN)<<3);
    } else {
      const clk = this._readPinBit(comp, clkN);
      const cten = this._readPinBit(comp, ctenN);
      if (cten === 0 && state.prevClk === 0 && clk === 1) {
        const ud = this._readPinBit(comp, udN);
        if (ud === 0) state.count = (state.count + 1) % 10;
        else state.count = (state.count - 1 + 10) % 10;
      }
      state.prevClk = this._readPinBit(comp, clkN);
    }
    const ud = this._readPinBit(comp, udN);
    const cten = this._readPinBit(comp, ctenN);
    const terminal = (ud === 0) ? 9 : 0;
    const atTerminal = (cten === 0 && state.count === terminal);
    const mxmn = atTerminal ? 1 : 0;
    const rco  = atTerminal ? 0 : 1;
    let changed = this._drivePinBits(comp, [qaName,qbName,qcName,qdName],
      [state.count&1,(state.count>>1)&1,(state.count>>2)&1,(state.count>>3)&1]);
    if (this._drivePinBit(comp, mxmnName, mxmn)) changed = true;
    if (this._drivePinBit(comp, rcoName,  rco))  changed = true;
    return changed;
  }

  _evaluateCounterDecadeDC(comp, gate) {
    // 74192: Synchronous BCD decade up/down counter with dual clock and async CLR/LOAD.
    // inputs: [A, B, C, D, CLK_UP, CLK_DOWN, CLR, LOAD]
    // outputs: [QA, QB, QC, QD, CO, BO]
    // CLR=1 (active HIGH, async): clear to 0. LOAD=0 (active LOW, async): load A-D.
    // CLK_UP rising: count up (decade). CLK_DOWN rising: count down (decade).
    // CO=LOW when count==9 and CLK_UP==0 (carry ripple). BO=LOW when count==0 and CLK_DOWN==0.
    const [aN,bN,cN,dN,upN,downN,clrN,loadN] = gate.inputs;
    const [qaName,qbName,qcName,qdName,coName,boName] = gate.outputs;
    const state = this._getSeqState(comp, qaName, { count: 0, prevUP: 0, prevDOWN: 0 });
    this._drivePinBits(comp, [qaName,qbName,qcName,qdName],
      [state.count&1,(state.count>>1)&1,(state.count>>2)&1,(state.count>>3)&1]);
    const clr  = this._readPinBit(comp, clrN);
    const load = this._readPinBit(comp, loadN);
    const up   = this._readPinBit(comp, upN);
    const down = this._readPinBit(comp, downN);
    if (clr === 1) {
      state.count = 0;
      state.prevUP = up; state.prevDOWN = down;
    } else if (load === 0) {
      state.count = this._readPinBit(comp,aN)|(this._readPinBit(comp,bN)<<1)|
        (this._readPinBit(comp,cN)<<2)|(this._readPinBit(comp,dN)<<3);
      state.prevUP = up; state.prevDOWN = down;
    } else {
      if (state.prevUP === 0 && up === 1)
        state.count = (state.count + 1) % 10;
      if (state.prevDOWN === 0 && down === 1)
        state.count = (state.count - 1 + 10) % 10;
      state.prevUP = up; state.prevDOWN = down;
    }
    const co = (state.count === 9 && up   === 0) ? 0 : 1;
    const bo = (state.count === 0 && down === 0) ? 0 : 1;
    let changed = this._drivePinBits(comp, [qaName,qbName,qcName,qdName],
      [state.count&1,(state.count>>1)&1,(state.count>>2)&1,(state.count>>3)&1]);
    if (this._drivePinBit(comp, coName, co)) changed = true;
    if (this._drivePinBit(comp, boName, bo)) changed = true;
    return changed;
  }

  _evaluateShiftReg4BitBidirClr(comp, gate) {
    // 74194: 4 bit bidirectional universal shift register with async CLR.
    // inputs: [CLR, CLK, S0, S1, SER_R, SER_L, A, B, C, D]
    // outputs: [QA, QB, QC, QD]
    // CLR=0: async clear. S1=0,S0=0: hold. S1=0,S0=1: shift right (SER_R→QA).
    // S1=1,S0=0: shift left (SER_L→QD). S1=1,S0=1: parallel load.
    const [clrN, clkN, s0N, s1N, serRN, serLN, aN, bN, cN, dN] = gate.inputs;
    const [qaName, qbName, qcName, qdName] = gate.outputs;
    const state = this._getSeqState(comp, qaName, { qa:0, qb:0, qc:0, qd:0, prevClk:0 });
    const clr = this._readPinBit(comp, clrN);
    if (clr === 0) {
      state.qa = state.qb = state.qc = state.qd = 0;
    } else {
      const clk = this._readPinBit(comp, clkN);
      if (state.prevClk === 0 && clk === 1) {
        const s0 = this._readPinBit(comp, s0N);
        const s1 = this._readPinBit(comp, s1N);
        if (s1 === 0 && s0 === 1) {
          // Shift right: SER_R→QA, QA→QB, QB→QC, QC→QD
          state.qd = state.qc; state.qc = state.qb; state.qb = state.qa;
          state.qa = this._readPinBit(comp, serRN);
        } else if (s1 === 1 && s0 === 0) {
          // Shift left: SER_L→QD, QD→QC, QC→QB, QB→QA
          state.qa = state.qb; state.qb = state.qc; state.qc = state.qd;
          state.qd = this._readPinBit(comp, serLN);
        } else if (s1 === 1 && s0 === 1) {
          // Parallel load
          state.qa = this._readPinBit(comp, aN); state.qb = this._readPinBit(comp, bN);
          state.qc = this._readPinBit(comp, cN); state.qd = this._readPinBit(comp, dN);
        }
        // s1=0,s0=0: hold
      }
      state.prevClk = this._readPinBit(comp, clkN);
    }
    return this._drivePinBits(comp, [qaName,qbName,qcName,qdName],
      [state.qa, state.qb, state.qc, state.qd]);
  }

  _evaluateShiftReg4BitJK(comp, gate) {
    // 74195: 4 bit parallel-access shift register with J-K̄ serial input, async CLR.
    // inputs: [CLR, CLK, J, Kn, PE, A, B, C, D]
    // outputs: [QA, QB, QC, QD, QDn]
    // CLR=0: async clear. PE=0: parallel load on rising CLK. PE=1: shift on rising CLK.
    // Shift: QA_next = (J & ~QA) | (Kn & QA)  (JK behavior)
    //        QB=QA_old, QC=QB_old, QD=QC_old
    const [clrN, clkN, jN, knN, peN, aN, bN, cN, dN] = gate.inputs;
    const [qaName, qbName, qcName, qdName, qdnName] = gate.outputs;
    const state = this._getSeqState(comp, qaName, { qa:0, qb:0, qc:0, qd:0, prevClk:0 });
    const clr = this._readPinBit(comp, clrN);
    if (clr === 0) {
      state.qa = state.qb = state.qc = state.qd = 0;
    } else {
      const clk = this._readPinBit(comp, clkN);
      if (state.prevClk === 0 && clk === 1) {
        const pe = this._readPinBit(comp, peN);
        if (pe === 0) {
          // Parallel load
          state.qa = this._readPinBit(comp, aN); state.qb = this._readPinBit(comp, bN);
          state.qc = this._readPinBit(comp, cN); state.qd = this._readPinBit(comp, dN);
        } else {
          // Shift right with JK input to QA
          const j  = this._readPinBit(comp, jN);
          const kn = this._readPinBit(comp, knN);
          const qaNew = (j & (~state.qa & 1)) | (kn & state.qa);
          state.qd = state.qc; state.qc = state.qb; state.qb = state.qa; state.qa = qaNew;
        }
      }
      state.prevClk = this._readPinBit(comp, clkN);
    }
    return this._drivePinBits(comp, [qaName,qbName,qcName,qdName,qdnName],
      [state.qa, state.qb, state.qc, state.qd, state.qd ? 0 : 1]);
  }

  _evaluateShiftReg8BitBidir(comp, gate) {
    // 74198: 8 bit bidirectional universal shift register with async CLR.
    // inputs: [CLR, CLK, S0, S1, SER_R, SER_L, A, B, C, D, E, F, G, H]
    // outputs: [QA, QB, QC, QD, QE, QF, QG, QH]
    // CLR=0: async clear. S1=0,S0=0: hold. S1=0,S0=1: right. S1=1,S0=0: left. S1=1,S0=1: load.
    const [clrN, clkN, s0N, s1N, serRN, serLN, aN, bN, cN, dN, eN, fN, gN, hN] = gate.inputs;
    const outs = gate.outputs; // [QA,QB,QC,QD,QE,QF,QG,QH]
    const state = this._getSeqState(comp, outs[0], { q: [0,0,0,0,0,0,0,0], prevClk: 0 });
    const clr = this._readPinBit(comp, clrN);
    if (clr === 0) {
      state.q = [0,0,0,0,0,0,0,0];
    } else {
      const clk = this._readPinBit(comp, clkN);
      if (state.prevClk === 0 && clk === 1) {
        const s0 = this._readPinBit(comp, s0N);
        const s1 = this._readPinBit(comp, s1N);
        if (s1 === 0 && s0 === 1) {
          // Shift right: SER_R→QA
          for (let i = 7; i > 0; i--) state.q[i] = state.q[i-1];
          state.q[0] = this._readPinBit(comp, serRN);
        } else if (s1 === 1 && s0 === 0) {
          // Shift left: SER_L→QH
          for (let i = 0; i < 7; i++) state.q[i] = state.q[i+1];
          state.q[7] = this._readPinBit(comp, serLN);
        } else if (s1 === 1 && s0 === 1) {
          const pins = [aN, bN, cN, dN, eN, fN, gN, hN];
          for (let i = 0; i < 8; i++) state.q[i] = this._readPinBit(comp, pins[i]);
        }
        // s1=0,s0=0: hold
      }
      state.prevClk = this._readPinBit(comp, clkN);
    }
    return this._drivePinBits(comp, outs, state.q);
  }

  _evaluateShiftReg8BitJK(comp, gate) {
    // 74199: 8 bit shift register with J-K̄ serial input, async CLR, parallel load.
    // inputs: [CLR, CLK, J, Kn, PE, A, B, C, D, E, F, G, H]
    // outputs: [QA, QB, QC, QD, QE, QF, QG, QH]
    // CLR=0: async clear. PE=0: parallel load on rising CLK. PE=1: shift right with JK input.
    const [clrN, clkN, jN, knN, peN, aN, bN, cN, dN, eN, fN, gN, hN] = gate.inputs;
    const outs = gate.outputs;
    const state = this._getSeqState(comp, outs[0], { q: [0,0,0,0,0,0,0,0], prevClk: 0 });
    const clr = this._readPinBit(comp, clrN);
    if (clr === 0) {
      state.q = [0,0,0,0,0,0,0,0];
    } else {
      const clk = this._readPinBit(comp, clkN);
      if (state.prevClk === 0 && clk === 1) {
        const pe = this._readPinBit(comp, peN);
        if (pe === 0) {
          const pData = [aN, bN, cN, dN, eN, fN, gN, hN];
          for (let i = 0; i < 8; i++) state.q[i] = this._readPinBit(comp, pData[i]);
        } else {
          const j  = this._readPinBit(comp, jN);
          const kn = this._readPinBit(comp, knN);
          const qaNew = (j & (~state.q[0] & 1)) | (kn & state.q[0]);
          for (let i = 7; i > 0; i--) state.q[i] = state.q[i-1];
          state.q[0] = qaNew;
        }
      }
      state.prevClk = this._readPinBit(comp, clkN);
    }
    return this._drivePinBits(comp, outs, state.q);
  }

  _evaluateRam256x1(comp, gate) {
    // 74200/74201: 256 bit static RAM (256×1) with 3-state output.
    // inputs: [A0, A1, A2, A3, A4, A5, A6, A7, DIN, CS, WE]
    // outputs: [DOUT]
    // CS=0: enabled. CS=1: DOUT=HiZ. WE=0: write DIN. WE=1: read DOUT=stored bit.
    const bits = this._readGateInputs(comp, gate.inputs);
    const addr = bits[0]|(bits[1]<<1)|(bits[2]<<2)|(bits[3]<<3)|(bits[4]<<4)|(bits[5]<<5)|(bits[6]<<6)|(bits[7]<<7);
    const din = bits[8];
    const cs  = bits[9];
    const we  = bits[10];
    if (cs !== 0) return this._drivePinHighZ(comp, gate.outputs[0]);
    const state = this._getSeqState(comp, gate.outputs[0] + '_ram256', { mem: {} });
    if (we === 0) state.mem[addr] = din;
    return this._drivePinBit(comp, gate.outputs[0], state.mem[addr] || 0);
  }

  _evaluateRam256x1PD(comp, gate) {
    // 74202: 256 bit RAM (256×1) with power-down. Same as RAM_256X1 with PD override.
    // inputs: [A0..A7, DIN, CS, WE, PD]
    // PD=1: all HiZ (power-down). Otherwise same as RAM_256X1.
    const bits = this._readGateInputs(comp, gate.inputs);
    const pd  = bits[11];
    if (pd !== 0) return this._drivePinHighZ(comp, gate.outputs[0]);
    const addr = bits[0]|(bits[1]<<1)|(bits[2]<<2)|(bits[3]<<3)|(bits[4]<<4)|(bits[5]<<5)|(bits[6]<<6)|(bits[7]<<7);
    const din = bits[8];
    const cs  = bits[9];
    const we  = bits[10];
    if (cs !== 0) return this._drivePinHighZ(comp, gate.outputs[0]);
    const state = this._getSeqState(comp, gate.outputs[0] + '_ram256', { mem: {} });
    if (we === 0) state.mem[addr] = din;
    return this._drivePinBit(comp, gate.outputs[0], state.mem[addr] || 0);
  }

  // ── Chips15 evaluators ──────────────────────────────────────────────────

  _evaluateRam256x1OC(comp, gate) {
    // 74206: 256×1 RAM with open-collector output.
    // inputs: [A0..A7, DIN, CS, WE]  outputs: [DOUT]
    // CS=0, WE=0: write; CS=0, WE=1: read (OC); CS=1: HiZ
    const bits = this._readGateInputs(comp, gate.inputs);
    const addr = bits[0]|(bits[1]<<1)|(bits[2]<<2)|(bits[3]<<3)|(bits[4]<<4)|(bits[5]<<5)|(bits[6]<<6)|(bits[7]<<7);
    const din = bits[8], cs = bits[9], we = bits[10];
    if (cs !== 0) return this._drivePinHighZ(comp, gate.outputs[0]);
    const state = this._getSeqState(comp, gate.outputs[0] + '_r256oc', { mem: {} });
    if (we === 0) state.mem[addr] = din;
    return this._drivePinOC(comp, gate.outputs[0], state.mem[addr] !== undefined ? state.mem[addr] : 0);
  }

  _evaluateRam256x4Common(comp, gate) {
    // 74207: 256×4 common I/O RAM (3-state).
    // inputs: [A0..A7, IO0..IO3, WE, CS]  outputs: [IO0..IO3]
    // CS=0, WE=0: write (IO→HiZ, capture external); CS=0, WE=1: read; CS=1: HiZ
    const bits = this._readGateInputs(comp, gate.inputs);
    const addr = bits[0]|(bits[1]<<1)|(bits[2]<<2)|(bits[3]<<3)|(bits[4]<<4)|(bits[5]<<5)|(bits[6]<<6)|(bits[7]<<7);
    const ioData = [bits[8], bits[9], bits[10], bits[11]];
    const we = bits[12], cs = bits[13];
    const state = this._getSeqState(comp, gate.outputs[0] + '_r256x4c', { mem: {} });
    if (cs !== 0) return this._drivePinsHighZ(comp, gate.outputs);
    if (we === 0) {
      state.mem[addr] = [...ioData];
      return this._drivePinsHighZ(comp, gate.outputs);
    }
    return this._drivePinBits(comp, gate.outputs, state.mem[addr] || [0,0,0,0]);
  }

  _evaluateRam256x4(comp, gate) {
    // 74208: 256×4 RAM with separate I/O (3-state).
    // inputs: [A0..A7, DIN0..DIN3, CS, WE]  outputs: [DOUT0..DOUT3]
    // CS=0, WE=0: write; CS=0, WE=1: read (HiZ during write); CS=1: HiZ
    const bits = this._readGateInputs(comp, gate.inputs);
    const addr = bits[0]|(bits[1]<<1)|(bits[2]<<2)|(bits[3]<<3)|(bits[4]<<4)|(bits[5]<<5)|(bits[6]<<6)|(bits[7]<<7);
    const din = [bits[8], bits[9], bits[10], bits[11]];
    const cs = bits[12], we = bits[13];
    const state = this._getSeqState(comp, gate.outputs[0] + '_r256x4', { mem: {} });
    if (cs !== 0) return this._drivePinsHighZ(comp, gate.outputs);
    if (we === 0) {
      state.mem[addr] = [...din];
      return this._drivePinsHighZ(comp, gate.outputs);
    }
    return this._drivePinBits(comp, gate.outputs, state.mem[addr] || [0,0,0,0]);
  }

  _evaluateRam1024x1(comp, gate) {
    // 74209/74214: 1024×1 RAM (3-state).
    // inputs: [A0..A9, DIN, CS, WE]  outputs: [DOUT]
    // CS=0, WE=0: write; CS=0, WE=1: read; CS=1: HiZ
    const bits = this._readGateInputs(comp, gate.inputs);
    const addr = bits[0]|(bits[1]<<1)|(bits[2]<<2)|(bits[3]<<3)|(bits[4]<<4)|(bits[5]<<5)|(bits[6]<<6)|(bits[7]<<7)|(bits[8]<<8)|(bits[9]<<9);
    const din = bits[10], cs = bits[11], we = bits[12];
    const state = this._getSeqState(comp, gate.outputs[0] + '_r1k1', { mem: {} });
    if (cs !== 0) return this._drivePinHighZ(comp, gate.outputs[0]);
    if (we === 0) { state.mem[addr] = din; return this._drivePinHighZ(comp, gate.outputs[0]); }
    return this._drivePinBit(comp, gate.outputs[0], state.mem[addr] !== undefined ? state.mem[addr] : 0);
  }

  _evaluateRam1024x1PD(comp, gate) {
    // 74215: 1024×1 RAM with power-down (3-state).
    // inputs: [A0..A9, DIN, PD, WE]  outputs: [DOUT]
    // PD=1: power-down → HiZ; PD=0, WE=0: write; PD=0, WE=1: read
    const bits = this._readGateInputs(comp, gate.inputs);
    const addr = bits[0]|(bits[1]<<1)|(bits[2]<<2)|(bits[3]<<3)|(bits[4]<<4)|(bits[5]<<5)|(bits[6]<<6)|(bits[7]<<7)|(bits[8]<<8)|(bits[9]<<9);
    const din = bits[10], pd = bits[11], we = bits[12];
    const state = this._getSeqState(comp, gate.outputs[0] + '_r1k1pd', { mem: {} });
    if (pd !== 0) return this._drivePinHighZ(comp, gate.outputs[0]);
    if (we === 0) { state.mem[addr] = din; return this._drivePinHighZ(comp, gate.outputs[0]); }
    return this._drivePinBit(comp, gate.outputs[0], state.mem[addr] !== undefined ? state.mem[addr] : 0);
  }

  _evaluateRam16x9Latch(comp, gate) {
    // 74211: 16×9 RAM with output latch (3-state, common I/O).
    // inputs: [A0..A3, IO0..IO7, WE, CE, OE, LE]  outputs: [IO0..IO7]
    // CE=1: HiZ; CE=0, WE=0: write; CE=0, WE=1, OE=0: read; CE=0, WE=1, OE=1: HiZ
    // LE=1 (transparent): outputs follow mem[addr]; LE=0 (hold): outputs hold last value
    const bits = this._readGateInputs(comp, gate.inputs);
    const addr = bits[0]|(bits[1]<<1)|(bits[2]<<2)|(bits[3]<<3);
    const ioData = bits.slice(4, 12);
    const we = bits[12], ce = bits[13], oe = bits[14], le = bits[15];
    const state = this._getSeqState(comp, gate.outputs[0] + '_r16x9L', { mem: {}, latch: [0,0,0,0,0,0,0,0] });
    if (ce !== 0) return this._drivePinsHighZ(comp, gate.outputs);
    if (we === 0) {
      state.mem[addr] = [...ioData];
      if (le !== 0) state.latch = [...ioData];
      return this._drivePinsHighZ(comp, gate.outputs);
    }
    if (oe !== 0) return this._drivePinsHighZ(comp, gate.outputs);
    if (le !== 0) state.latch = [...(state.mem[addr] || [0,0,0,0,0,0,0,0])];
    return this._drivePinBits(comp, gate.outputs, le !== 0 ? (state.mem[addr] || [0,0,0,0,0,0,0,0]) : state.latch);
  }

  _evaluateRam16x9(comp, gate) {
    // 74212: 16×9 RAM without output latch (3-state, common I/O).
    // inputs: [A0..A3, IO0..IO7, WE, CE, OE]  outputs: [IO0..IO7]
    // CE=1: HiZ; CE=0, WE=0: write; CE=0, WE=1, OE=0: read; CE=0, WE=1, OE=1: HiZ
    const bits = this._readGateInputs(comp, gate.inputs);
    const addr = bits[0]|(bits[1]<<1)|(bits[2]<<2)|(bits[3]<<3);
    const ioData = bits.slice(4, 12);
    const we = bits[12], ce = bits[13], oe = bits[14];
    const state = this._getSeqState(comp, gate.outputs[0] + '_r16x9', { mem: {} });
    if (ce !== 0) return this._drivePinsHighZ(comp, gate.outputs);
    if (we === 0) {
      state.mem[addr] = [...ioData];
      return this._drivePinsHighZ(comp, gate.outputs);
    }
    if (oe !== 0) return this._drivePinsHighZ(comp, gate.outputs);
    return this._drivePinBits(comp, gate.outputs, state.mem[addr] || [0,0,0,0,0,0,0,0]);
  }

  _evaluateRam16x12(comp, gate) {
    // 74213: 16×12 RAM (3-state, common I/O).
    // inputs: [A0..A3, IO0..IO11, WE, CE]  outputs: [IO0..IO11]
    // CE=1: HiZ; CE=0, WE=0: write; CE=0, WE=1: read
    const bits = this._readGateInputs(comp, gate.inputs);
    const addr = bits[0]|(bits[1]<<1)|(bits[2]<<2)|(bits[3]<<3);
    const ioData = bits.slice(4, 16);
    const we = bits[16], ce = bits[17];
    const state = this._getSeqState(comp, gate.outputs[0] + '_r16x12', { mem: {} });
    if (ce !== 0) return this._drivePinsHighZ(comp, gate.outputs);
    if (we === 0) {
      state.mem[addr] = [...ioData];
      return this._drivePinsHighZ(comp, gate.outputs);
    }
    return this._drivePinBits(comp, gate.outputs, state.mem[addr] || [0,0,0,0,0,0,0,0,0,0,0,0]);
  }

  _evaluateRam64x4Common(comp, gate) {
    // 74216: 64×4 common I/O RAM (3-state).
    // inputs: [A0..A5, IO0..IO3, WE, CS, OE]  outputs: [IO0..IO3]
    // CS=1: HiZ; CS=0, WE=0: write; CS=0, WE=1, OE=0: read; CS=0, WE=1, OE=1: HiZ
    const bits = this._readGateInputs(comp, gate.inputs);
    const addr = bits[0]|(bits[1]<<1)|(bits[2]<<2)|(bits[3]<<3)|(bits[4]<<4)|(bits[5]<<5);
    const ioData = [bits[6], bits[7], bits[8], bits[9]];
    const we = bits[10], cs = bits[11], oe = bits[12];
    const state = this._getSeqState(comp, gate.outputs[0] + '_r64x4c', { mem: {} });
    if (cs !== 0) return this._drivePinsHighZ(comp, gate.outputs);
    if (we === 0) {
      state.mem[addr] = [...ioData];
      return this._drivePinsHighZ(comp, gate.outputs);
    }
    if (oe !== 0) return this._drivePinsHighZ(comp, gate.outputs);
    return this._drivePinBits(comp, gate.outputs, state.mem[addr] || [0,0,0,0]);
  }

  _evaluateRam64x4(comp, gate) {
    // 74217: 64×4 separate I/O RAM (3-state).
    // inputs: [A0..A5, DIN0..DIN3, WE, CS, OE]  outputs: [DOUT0..DOUT3]
    // CS=1: HiZ; CS=0, WE=0: write; CS=0, WE=1, OE=0: read; CS=0, WE=1, OE=1: HiZ
    const bits = this._readGateInputs(comp, gate.inputs);
    const addr = bits[0]|(bits[1]<<1)|(bits[2]<<2)|(bits[3]<<3)|(bits[4]<<4)|(bits[5]<<5);
    const din = [bits[6], bits[7], bits[8], bits[9]];
    const we = bits[10], cs = bits[11], oe = bits[12];
    const state = this._getSeqState(comp, gate.outputs[0] + '_r64x4', { mem: {} });
    if (cs !== 0) return this._drivePinsHighZ(comp, gate.outputs);
    if (we === 0) { state.mem[addr] = [...din]; return this._drivePinsHighZ(comp, gate.outputs); }
    if (oe !== 0) return this._drivePinsHighZ(comp, gate.outputs);
    return this._drivePinBits(comp, gate.outputs, state.mem[addr] || [0,0,0,0]);
  }

  _evaluateRam32x8Common(comp, gate) {
    // 74218: 32×8 common I/O RAM (3-state).
    // inputs: [A0..A4, IO0..IO7, WE, CS, OE]  outputs: [IO0..IO7]
    // CS=1: HiZ; CS=0, WE=0: write; CS=0, WE=1, OE=0: read; CS=0, WE=1, OE=1: HiZ
    const bits = this._readGateInputs(comp, gate.inputs);
    const addr = bits[0]|(bits[1]<<1)|(bits[2]<<2)|(bits[3]<<3)|(bits[4]<<4);
    const ioData = bits.slice(5, 13);
    const we = bits[13], cs = bits[14], oe = bits[15];
    const state = this._getSeqState(comp, gate.outputs[0] + '_r32x8c', { mem: {} });
    if (cs !== 0) return this._drivePinsHighZ(comp, gate.outputs);
    if (we === 0) {
      state.mem[addr] = [...ioData];
      return this._drivePinsHighZ(comp, gate.outputs);
    }
    if (oe !== 0) return this._drivePinsHighZ(comp, gate.outputs);
    return this._drivePinBits(comp, gate.outputs, state.mem[addr] || [0,0,0,0,0,0,0,0]);
  }

  _evaluateRam16x4NI(comp, gate) {
    // 74219: 16×4 RAM with non-inverting 3-state outputs.
    // inputs: [A0..A3, D1..D4, CS, WE]  outputs: [Q1..Q4]
    // CS=0, WE=0: write; CS=0, WE=1: read (non-inverting); CS=1: HiZ
    const [a0,a1,a2,a3, d1,d2,d3,d4, cs, we] = this._readGateInputs(comp, gate.inputs);
    const addr = a0|(a1<<1)|(a2<<2)|(a3<<3);
    const state = this._getSeqState(comp, gate.outputs[0] + '_r16x4ni', { mem: {} });
    if (cs !== 0) return this._drivePinsHighZ(comp, gate.outputs);
    if (we === 0) {
      state.mem[addr] = [d1,d2,d3,d4];
      return this._drivePinsHighZ(comp, gate.outputs);
    }
    return this._drivePinBits(comp, gate.outputs, state.mem[addr] || [0,0,0,0]);
  }

  _evaluateFifo16x4Sync(comp, gate) {
    // 74222: 64 bit synchronous FIFO (16×4) with full status flags.
    // inputs: [DIN0..DIN3, WR_CLK, RD_CLK, WR_EN, RD_EN]
    // outputs: [DOUT0..DOUT3, EF, FF, IR, OR]
    // EF: active LOW empty flag (LOW when empty)
    // FF: active LOW full flag (LOW when full)
    // IR: input ready = HIGH when not full; OR: output ready = HIGH when not empty
    const bits = this._readGateInputs(comp, gate.inputs);
    const [d0,d1,d2,d3, wrClk, rdClk, wrEn, rdEn] = bits;
    const state = this._getSeqState(comp, gate.outputs[0] + '_fifo16s', { queue: [], prevWrClk: 0, prevRdClk: 0, lastRead: [0,0,0,0] });
    if (state.prevWrClk === 0 && wrClk === 1 && wrEn === 0 && state.queue.length < 16)
      state.queue.push([d0,d1,d2,d3]);
    state.prevWrClk = wrClk;
    if (state.prevRdClk === 0 && rdClk === 1 && rdEn === 0 && state.queue.length > 0)
      state.lastRead = state.queue.shift();
    else if (rdClk === 0 && state.queue.length > 0)
      state.lastRead = [...state.queue[0]];
    state.prevRdClk = rdClk;
    const ef = state.queue.length === 0 ? 0 : 1;
    const ff = state.queue.length >= 16 ? 0 : 1;
    const ir = state.queue.length < 16 ? 1 : 0;
    const or = state.queue.length > 0 || (rdClk === 1) ? 1 : 0;
    return this._drivePinBits(comp, gate.outputs, [...state.lastRead, ef, ff, ir, or]);
  }

  _evaluateFifo16x4(comp, gate) {
    // 74224: 64 bit synchronous FIFO (16×4) with EF/FF flags only.
    // inputs: [DIN0..DIN3, WR_CLK, RD_CLK, WR_EN, RD_EN]
    // outputs: [DOUT0..DOUT3, EF, FF]
    // EF: active LOW empty flag (LOW when empty)
    // FF: active LOW full flag (LOW when full)
    const bits = this._readGateInputs(comp, gate.inputs);
    const [d0,d1,d2,d3, wrClk, rdClk, wrEn, rdEn] = bits;
    const state = this._getSeqState(comp, gate.outputs[0] + '_fifo16', { queue: [], prevWrClk: 0, prevRdClk: 0, lastRead: [0,0,0,0] });
    if (state.prevWrClk === 0 && wrClk === 1 && wrEn === 0 && state.queue.length < 16)
      state.queue.push([d0,d1,d2,d3]);
    state.prevWrClk = wrClk;
    if (state.prevRdClk === 0 && rdClk === 1 && rdEn === 0 && state.queue.length > 0)
      state.lastRead = state.queue.shift();
    else if (rdClk === 0 && state.queue.length > 0)
      state.lastRead = [...state.queue[0]];
    state.prevRdClk = rdClk;
    const ef = state.queue.length === 0 ? 0 : 1;
    const ff = state.queue.length >= 16 ? 0 : 1;
    return this._drivePinBits(comp, gate.outputs, [...state.lastRead, ef, ff]);
  }

  _evaluateBCDDecimal(comp, gate) {
    // inputs: [A, B, C, D], outputs: [Y0..Y9]
    // Invalid codes (10-15): all outputs HIGH.
    const [a,b,c,d] = this._readGateInputs(comp, gate.inputs);
    const sel = a | (b << 1) | (c << 2) | (d << 3);
    const isOC = comp.chipDef && comp.chipDef.openCollector;
    let changed = false;
    for (let i = 0; i < 10; i++) {
      const bit = (sel < 10 && i === sel) ? 0 : 1;
      if (isOC) {
        if (this._drivePinOC(comp, gate.outputs[i], bit)) changed = true;
      } else {
        if (this._drivePinBit(comp, gate.outputs[i], bit)) changed = true;
      }
    }
    return changed;
  }

  _evaluateXS3Decimal(comp, gate) {
    // 74x43: Excess-3 to decimal decoder (active LOW outputs).
    // inputs: [A, B, C, D], outputs: [Y0..Y9]
    // XS3 digit n is encoded as binary (n+3). Valid codes: 0011(0)..1100(9).
    // Invalid codes: all outputs HIGH.
    const [a,b,c,d] = this._readGateInputs(comp, gate.inputs);
    const code = a | (b << 1) | (c << 2) | (d << 3);
    const isOC = comp.chipDef && comp.chipDef.openCollector;
    const sel = code - 3; // XS3 decode: subtract 3 to get decimal value
    let changed = false;
    for (let i = 0; i < 10; i++) {
      const bit = (sel >= 0 && sel < 10 && i === sel) ? 0 : 1;
      if (isOC) {
        if (this._drivePinOC(comp, gate.outputs[i], bit)) changed = true;
      } else {
        if (this._drivePinBit(comp, gate.outputs[i], bit)) changed = true;
      }
    }
    return changed;
  }

  _evaluateGrayDecimal(comp, gate) {
    // 74x44: Gray code to decimal decoder (active LOW outputs).
    // inputs: [A, B, C, D], outputs: [Y0..Y9]
    // Gray codes for 0-9: 0000,0001,0011,0010,0110,0111,0101,0100,1100,1101
    // Invalid codes: all outputs HIGH.
    const GRAY_TO_DEC = [0, 1, 3, 2, 7, 6, 4, 5, -1, -1, -1, -1, 8, 9, -1, -1];
    const [a,b,c,d] = this._readGateInputs(comp, gate.inputs);
    const code = a | (b << 1) | (c << 2) | (d << 3);
    const isOC = comp.chipDef && comp.chipDef.openCollector;
    const sel = GRAY_TO_DEC[code];
    let changed = false;
    for (let i = 0; i < 10; i++) {
      const bit = (sel >= 0 && i === sel) ? 0 : 1;
      if (isOC) {
        if (this._drivePinOC(comp, gate.outputs[i], bit)) changed = true;
      } else {
        if (this._drivePinBit(comp, gate.outputs[i], bit)) changed = true;
      }
    }
    return changed;
  }

  _evaluateMux2to1(comp, gate) {
    // 74157: single 2-to-1 mux section. G=active LOW enable.
    // inputs: [A, B, SEL, G], output (single name string)
    // SEL=0 → output=A; SEL=1 → output=B; G=1 → output=0
    const [a,b,sel,g] = this._readGateInputs(comp, gate.inputs);
    if (g === 1) return this._drivePinBit(comp, gate.output, 0);
    return this._drivePinBit(comp, gate.output, sel ? b : a);
  }

  _evaluateCounterSyncDecade(comp, gate) {
    // 74160: Synchronous decade counter (0-9). Async CLR (active LOW).
    // inputs: [CLK, CLR, LOAD, ENP, ENT, A, B, C, D]
    // outputs: [QA, QB, QC, QD, RCO]
    // CLR=0: async clear. On rising CLK: LOAD=0→load; ENP&ENT=1→count.
    // RCO = ENT AND (count == 9)
    const [clkN,clrN,loadN,enpN,entN,aN,bN,cN,dN] = gate.inputs;
    const [qaName,qbName,qcName,qdName,rcoName] = gate.outputs;
    const state = this._getSeqState(comp, qaName,
      { count: 0, prevClk: 0 });

    this._drivePinBits(comp, [qaName,qbName,qcName,qdName],
      [state.count&1, (state.count>>1)&1, (state.count>>2)&1, (state.count>>3)&1]);

    const clr = this._readPinBit(comp, clrN);
    if (clr === 0) {
      state.count = 0;
      state.prevClk = this._readPinBit(comp, clkN);
      const ent = this._readPinBit(comp, entN);
      const rco = (ent && state.count === 9) ? 1 : 0;
      let changed = this._drivePinBits(comp, [qaName,qbName,qcName,qdName], [0,0,0,0]);
      if (this._drivePinBit(comp, rcoName, rco)) changed = true;
      return changed;
    }

    const clk = this._readPinBit(comp, clkN);
    if (state.prevClk === 0 && clk === 1) {
      const load = this._readPinBit(comp, loadN);
      const enp  = this._readPinBit(comp, enpN);
      const ent  = this._readPinBit(comp, entN);
      if (load === 0) {
        const a = this._readPinBit(comp, aN);
        const b = this._readPinBit(comp, bN);
        const c = this._readPinBit(comp, cN);
        const d = this._readPinBit(comp, dN);
        state.count = a | (b<<1) | (c<<2) | (d<<3);
      } else if (enp && ent) {
        state.count = (state.count + 1) % 10;
      }
    }
    state.prevClk = clk;
    const ent = this._readPinBit(comp, entN);
    const rco = (ent && state.count === 9) ? 1 : 0;
    let changed = this._drivePinBits(comp, [qaName,qbName,qcName,qdName],
      [state.count&1,(state.count>>1)&1,(state.count>>2)&1,(state.count>>3)&1]);
    if (this._drivePinBit(comp, rcoName, rco)) changed = true;
    return changed;
  }

  _evaluateCounterSyncBin(comp, gate) {
    // 74161: Synchronous 4 bit binary counter (0-15). Async CLR (active LOW).
    // inputs: [CLK, CLR, LOAD, ENP, ENT, A, B, C, D]
    // outputs: [QA, QB, QC, QD, RCO]
    // RCO = ENT AND (count == 15)
    const [clkN,clrN,loadN,enpN,entN,aN,bN,cN,dN] = gate.inputs;
    const [qaName,qbName,qcName,qdName,rcoName] = gate.outputs;
    const state = this._getSeqState(comp, qaName,
      { count: 0, prevClk: 0 });

    this._drivePinBits(comp, [qaName,qbName,qcName,qdName],
      [state.count&1,(state.count>>1)&1,(state.count>>2)&1,(state.count>>3)&1]);

    const clr = this._readPinBit(comp, clrN);
    if (clr === 0) {
      state.count = 0;
      state.prevClk = this._readPinBit(comp, clkN);
      const ent = this._readPinBit(comp, entN);
      const rco = (ent && state.count === 15) ? 1 : 0;
      let changed = this._drivePinBits(comp, [qaName,qbName,qcName,qdName], [0,0,0,0]);
      if (this._drivePinBit(comp, rcoName, rco)) changed = true;
      return changed;
    }

    const clk = this._readPinBit(comp, clkN);
    if (state.prevClk === 0 && clk === 1) {
      const load = this._readPinBit(comp, loadN);
      const enp  = this._readPinBit(comp, enpN);
      const ent  = this._readPinBit(comp, entN);
      if (load === 0) {
        const a = this._readPinBit(comp, aN);
        const b = this._readPinBit(comp, bN);
        const c = this._readPinBit(comp, cN);
        const d = this._readPinBit(comp, dN);
        state.count = a | (b<<1) | (c<<2) | (d<<3);
      } else if (enp && ent) {
        state.count = (state.count + 1) & 15;
      }
    }
    state.prevClk = clk;
    const ent = this._readPinBit(comp, entN);
    const rco = (ent && state.count === 15) ? 1 : 0;
    let changed = this._drivePinBits(comp, [qaName,qbName,qcName,qdName],
      [state.count&1,(state.count>>1)&1,(state.count>>2)&1,(state.count>>3)&1]);
    if (this._drivePinBit(comp, rcoName, rco)) changed = true;
    return changed;
  }

  _evaluateCounterSyncBinSC(comp, gate) {
    // 74163: Synchronous 4 bit binary counter with SYNCHRONOUS clear.
    // inputs: [CLK, CLR, LOAD, ENP, ENT, A, B, C, D]
    // outputs: [QA, QB, QC, QD, RCO]
    // CLR=0 takes effect on next rising CLK edge (synchronous).
    const [clkN,clrN,loadN,enpN,entN,aN,bN,cN,dN] = gate.inputs;
    const [qaName,qbName,qcName,qdName,rcoName] = gate.outputs;
    const state = this._getSeqState(comp, qaName,
      { count: 0, prevClk: 0 });

    this._drivePinBits(comp, [qaName,qbName,qcName,qdName],
      [state.count&1,(state.count>>1)&1,(state.count>>2)&1,(state.count>>3)&1]);

    const clk = this._readPinBit(comp, clkN);
    if (state.prevClk === 0 && clk === 1) {
      const clr  = this._readPinBit(comp, clrN);
      const load = this._readPinBit(comp, loadN);
      const enp  = this._readPinBit(comp, enpN);
      const ent  = this._readPinBit(comp, entN);
      if (clr === 0) {
        state.count = 0;
      } else if (load === 0) {
        const a = this._readPinBit(comp, aN);
        const b = this._readPinBit(comp, bN);
        const c = this._readPinBit(comp, cN);
        const d = this._readPinBit(comp, dN);
        state.count = a | (b<<1) | (c<<2) | (d<<3);
      } else if (enp && ent) {
        state.count = (state.count + 1) & 15;
      }
    }
    state.prevClk = clk;
    const ent = this._readPinBit(comp, entN);
    const rco = (ent && state.count === 15) ? 1 : 0;
    let changed = this._drivePinBits(comp, [qaName,qbName,qcName,qdName],
      [state.count&1,(state.count>>1)&1,(state.count>>2)&1,(state.count>>3)&1]);
    if (this._drivePinBit(comp, rcoName, rco)) changed = true;
    return changed;
  }

  _evaluateShiftRegSIPO(comp, gate) {
    // 74164: 8 bit SIPO shift register. Serial in = A AND B. Async CLR.
    // inputs: [A, B, CLK, CLR], outputs: [QA..QH]
    const [aName,bName,clkName,clrName] = gate.inputs;
    const qaName = gate.outputs[0];
    const state = this._getSeqState(comp, qaName,
      { stages: new Array(8).fill(0), prevClk: 0 });

    this._drivePinBits(comp, gate.outputs, state.stages.slice());

    const clr = this._readPinBit(comp, clrName);
    if (clr === 0) {
      state.stages.fill(0);
      state.prevClk = this._readPinBit(comp, clkName);
      return this._drivePinBits(comp, gate.outputs, state.stages.slice());
    }

    const clk = this._readPinBit(comp, clkName);
    if (state.prevClk === 0 && clk === 1) {
      const data = this._readPinBit(comp, aName) & this._readPinBit(comp, bName);
      // Shift: QA gets new data, QH gets old QG
      state.stages.pop();
      state.stages.unshift(data);
    }
    state.prevClk = clk;
    return this._drivePinBits(comp, gate.outputs, state.stages.slice());
  }

  _evaluateShiftRegPISO(comp, gate) {
    // 74165: 8 bit PISO shift register.
    // SH/LD=0: asynchronous parallel load (A..H → stages).
    // SH/LD=1: shift right on rising CLK (if CLKINH=0); SER enters at QA.
    // QH=MSB output (last stage), QHn=complement.
    // inputs: [A, B, C, D, E, F, G, H, SER, CLK, CLKINH, 'SH/LD']
    // outputs: [QH, QHn]
    const [aN,bN,cN,dN,eN,fN,gN,hN,serN,clkN,clkinhN,shldN] = gate.inputs;
    const [qhName, qhnName] = gate.outputs;
    const state = this._getSeqState(comp, qhName,
      { stages: new Array(8).fill(0), prevClk: 0 });

    const shld = this._readPinBit(comp, shldN);
    if (shld === 0) {
      // Asynchronous parallel load
      state.stages[0] = this._readPinBit(comp, aN);
      state.stages[1] = this._readPinBit(comp, bN);
      state.stages[2] = this._readPinBit(comp, cN);
      state.stages[3] = this._readPinBit(comp, dN);
      state.stages[4] = this._readPinBit(comp, eN);
      state.stages[5] = this._readPinBit(comp, fN);
      state.stages[6] = this._readPinBit(comp, gN);
      state.stages[7] = this._readPinBit(comp, hN);
    } else {
      const clk   = this._readPinBit(comp, clkN);
      const clkinh = this._readPinBit(comp, clkinhN);
      if (!clkinh && state.prevClk === 0 && clk === 1) {
        // Rising edge: shift right (A-side → H-side)
        const ser = this._readPinBit(comp, serN);
        state.stages.pop();
        state.stages.unshift(ser);
      }
      state.prevClk = this._readPinBit(comp, clkN);
    }

    const qh = state.stages[7];
    return this._drivePinBits(comp, [qhName, qhnName], [qh, qh ? 0 : 1]);
  }

  _evaluateReg4BitTri(comp, gate) {
    // 74173: 4 bit D register with tri-state outputs. Synchronous CLR.
    // IE1=0 AND IE2=0: data enabled (latch on rising CLK edge).
    // OE1=0 AND OE2=0: outputs enabled; otherwise HiZ (modelled as 0).
    // CLR=1 (active HIGH, synchronous): clears register on rising CLK.
    // inputs: [1D, 2D, 3D, 4D, CLK, CLR, IE1, IE2, OE1, OE2]
    // outputs: [1Q, 2Q, 3Q, 4Q]
    const [d1n,d2n,d3n,d4n,clkN,clrN,ie1N,ie2N,oe1N,oe2N] = gate.inputs;
    const [q1n,q2n,q3n,q4n] = gate.outputs;
    const state = this._getSeqState(comp, q1n,
      { q: [0,0,0,0], prevClk: 0 });

    const clk = this._readPinBit(comp, clkN);
    if (state.prevClk === 0 && clk === 1) {
      const clr  = this._readPinBit(comp, clrN);
      const ie1  = this._readPinBit(comp, ie1N);
      const ie2  = this._readPinBit(comp, ie2N);
      if (clr === 1) {
        state.q = [0,0,0,0];
      } else if (ie1 === 0 && ie2 === 0) {
        state.q[0] = this._readPinBit(comp, d1n);
        state.q[1] = this._readPinBit(comp, d2n);
        state.q[2] = this._readPinBit(comp, d3n);
        state.q[3] = this._readPinBit(comp, d4n);
      }
    }
    state.prevClk = clk;

    const oe1 = this._readPinBit(comp, oe1N);
    const oe2 = this._readPinBit(comp, oe2N);
    const outEnabled = (oe1 === 0) && (oe2 === 0);
    if (outEnabled) {
      return this._drivePinBits(comp, [q1n,q2n,q3n,q4n], state.q);
    } else {
      return this._drivePinsHighZ(comp, [q1n,q2n,q3n,q4n]);
    }
  }

  _evaluateDFFHex(comp, gate) {
    // 74174: Hex D flip-flop with asynchronous active LOW clear.
    // inputs: [1D, 2D, 3D, 4D, 5D, 6D, CLK, CLR]
    // outputs: [1Q, 2Q, 3Q, 4Q, 5Q, 6Q]
    const [d1n,d2n,d3n,d4n,d5n,d6n,clkN,clrN] = gate.inputs;
    const [q1n,q2n,q3n,q4n,q5n,q6n] = gate.outputs;
    const state = this._getSeqState(comp, q1n,
      { q: [0,0,0,0,0,0], prevClk: 0 });

    const clr = this._readPinBit(comp, clrN);
    if (clr === 0) {
      state.q = [0,0,0,0,0,0];
      state.prevClk = this._readPinBit(comp, clkN);
      return this._drivePinBits(comp, [q1n,q2n,q3n,q4n,q5n,q6n], state.q.slice());
    }

    const clk = this._readPinBit(comp, clkN);
    if (state.prevClk === 0 && clk === 1) {
      state.q[0] = this._readPinBit(comp, d1n);
      state.q[1] = this._readPinBit(comp, d2n);
      state.q[2] = this._readPinBit(comp, d3n);
      state.q[3] = this._readPinBit(comp, d4n);
      state.q[4] = this._readPinBit(comp, d5n);
      state.q[5] = this._readPinBit(comp, d6n);
    }
    state.prevClk = clk;
    return this._drivePinBits(comp, [q1n,q2n,q3n,q4n,q5n,q6n], state.q.slice());
  }

  // ── Chips6 gate evaluators ───────────────────────────────────────────────

  _evaluateDFFQuad(comp, gate) {
    // 74175: Quad D flip-flop with asynchronous active LOW clear.
    // inputs: [1D, 2D, 3D, 4D, CLK, CLR]
    // outputs: [1Q, 1Qn, 2Q, 2Qn, 3Q, 3Qn, 4Q, 4Qn]
    const [d1n,d2n,d3n,d4n,clkN,clrN] = gate.inputs;
    const [q1n,q1nn,q2n,q2nn,q3n,q3nn,q4n,q4nn] = gate.outputs;
    const state = this._getSeqState(comp, q1n, { q: [0,0,0,0], prevClk: 0 });

    const clr = this._readPinBit(comp, clrN);
    if (clr === 0) {
      state.q = [0,0,0,0];
      state.prevClk = this._readPinBit(comp, clkN);
      return this._drivePinBits(comp,
        [q1n,q1nn,q2n,q2nn,q3n,q3nn,q4n,q4nn],
        [0,1, 0,1, 0,1, 0,1]);
    }

    const clk = this._readPinBit(comp, clkN);
    if (state.prevClk === 0 && clk === 1) {
      state.q[0] = this._readPinBit(comp, d1n);
      state.q[1] = this._readPinBit(comp, d2n);
      state.q[2] = this._readPinBit(comp, d3n);
      state.q[3] = this._readPinBit(comp, d4n);
    }
    state.prevClk = clk;
    const [q0,q1,q2,q3] = state.q;
    return this._drivePinBits(comp,
      [q1n,q1nn, q2n,q2nn, q3n,q3nn, q4n,q4nn],
      [q0, q0?0:1, q1, q1?0:1, q2, q2?0:1, q3, q3?0:1]);
  }

  _evaluateCounterUpDown(comp, gate) {
    // 74191: Synchronous 4 bit up/down binary counter. Single clock.
    // CTEN=0 (active LOW): count enable. D/U=0: up, D/U=1: down.
    // LOAD=0 (active LOW, synchronous): load A,B,C,D on rising CLK.
    // MAX/MIN: HIGH at terminal count while CTEN=0.
    // RCO: LOW at terminal count while CTEN=0.
    // Terminal count: 15 when counting up (D/U=0), 0 when counting down (D/U=1).
    const [aN,bN,cN,dN,clkN,ctenN,duN,loadN] = gate.inputs;
    const [qaName,qbName,qcName,qdName,maxminName,rcoName] = gate.outputs;
    const state = this._getSeqState(comp, qaName, { count: 0, prevClk: 0 });

    this._drivePinBits(comp, [qaName,qbName,qcName,qdName],
      [state.count&1, (state.count>>1)&1, (state.count>>2)&1, (state.count>>3)&1]);

    const clk  = this._readPinBit(comp, clkN);
    const cten = this._readPinBit(comp, ctenN);
    const du   = this._readPinBit(comp, duN);
    const load = this._readPinBit(comp, loadN);

    if (state.prevClk === 0 && clk === 1) {
      if (load === 0) {
        state.count = this._readPinBit(comp, aN)
          | (this._readPinBit(comp, bN) << 1)
          | (this._readPinBit(comp, cN) << 2)
          | (this._readPinBit(comp, dN) << 3);
      } else if (cten === 0) {
        if (du === 0) {
          state.count = (state.count + 1) & 15;
        } else {
          state.count = (state.count - 1 + 16) & 15;
        }
      }
    }
    state.prevClk = clk;

    const terminal = (du === 0) ? 15 : 0;
    const atTerminal = (cten === 0) && (state.count === terminal);
    let changed = this._drivePinBits(comp, [qaName,qbName,qcName,qdName],
      [state.count&1,(state.count>>1)&1,(state.count>>2)&1,(state.count>>3)&1]);
    if (this._drivePinBit(comp, maxminName, atTerminal ? 1 : 0)) changed = true;
    if (this._drivePinBit(comp, rcoName,    atTerminal ? 0 : 1)) changed = true;
    return changed;
  }

  _evaluateCounterUpDownDC(comp, gate) {
    // 74193: Synchronous 4 bit up/down counter with dual clock.
    // CLR=1 (active HIGH, async): clears count to 0.
    // LOAD=0 (active LOW, async): immediately loads A,B,C,D.
    // UP: rising edge counts up. DOWN: rising edge counts down.
    // CO: LOW when count==15 AND UP==0 (carry ripple output).
    // BO: LOW when count==0  AND DOWN==0 (borrow ripple output).
    const [aN,bN,cN,dN,upN,downN,clrN,loadN] = gate.inputs;
    const [qaName,qbName,qcName,qdName,coName,boName] = gate.outputs;
    const state = this._getSeqState(comp, qaName,
      { count: 0, prevUP: 0, prevDOWN: 0 });

    this._drivePinBits(comp, [qaName,qbName,qcName,qdName],
      [state.count&1,(state.count>>1)&1,(state.count>>2)&1,(state.count>>3)&1]);

    const clr  = this._readPinBit(comp, clrN);
    const load = this._readPinBit(comp, loadN);
    const up   = this._readPinBit(comp, upN);
    const down = this._readPinBit(comp, downN);

    if (clr === 1) {
      state.count = 0;
      state.prevUP = up;
      state.prevDOWN = down;
    } else if (load === 0) {
      state.count = this._readPinBit(comp, aN)
        | (this._readPinBit(comp, bN) << 1)
        | (this._readPinBit(comp, cN) << 2)
        | (this._readPinBit(comp, dN) << 3);
      state.prevUP = up;
      state.prevDOWN = down;
    } else {
      if (state.prevUP === 0 && up === 1)     state.count = (state.count + 1) & 15;
      if (state.prevDOWN === 0 && down === 1) state.count = (state.count - 1 + 16) & 15;
      state.prevUP   = up;
      state.prevDOWN = down;
    }

    const co = (state.count === 15 && up   === 0) ? 0 : 1;
    const bo = (state.count === 0  && down === 0) ? 0 : 1;
    let changed = this._drivePinBits(comp, [qaName,qbName,qcName,qdName],
      [state.count&1,(state.count>>1)&1,(state.count>>2)&1,(state.count>>3)&1]);
    if (this._drivePinBit(comp, coName, co)) changed = true;
    if (this._drivePinBit(comp, boName, bo)) changed = true;
    return changed;
  }

  _evaluateTriNotLo(comp, gate) {
    // 74240-style: inverting tri-state buffer with active LOW output enable.
    // OE=0: output = NOT(A). OE=1: HiZ.
    const [aName, oeName] = gate.inputs;
    const oe = this._readPinBit(comp, oeName);
    if (oe !== 0) return this._drivePinHighZ(comp, gate.output);
    const a = this._readPinBit(comp, aName);
    return this._drivePinBit(comp, gate.output, a ? 0 : 1);
  }

  _evaluateTransceiver8Bit(comp, gate) {
    // 74245: Octal bidirectional bus transceiver.
    // gate.inputs: [A1..A8, B1..B8, DIR, OE]  (indices 0-7=A, 8-15=B, 16=DIR, 17=OE)
    // gate.outputs: [A1..A8, B1..B8]           (indices 0-7=A, 8-15=B)
    // OE=0: enabled; OE=1: all outputs HiZ.
    // DIR=1: A→B (read A, drive B; A-side HiZ). DIR=0: B→A (read B, drive A; B-side HiZ).
    const oe  = this._readPinBit(comp, gate.inputs[17]);
    const dir = this._readPinBit(comp, gate.inputs[16]);
    let changed = false;
    if (oe !== 0) {
      // All outputs HiZ
      if (this._drivePinsHighZ(comp, gate.outputs)) changed = true;
    } else if (dir === 1) {
      // A→B: drive B-side, HiZ A-side
      for (let i = 0; i < 8; i++) {
        if (this._drivePinHighZ(comp, gate.outputs[i])) changed = true;
      }
      for (let i = 0; i < 8; i++) {
        const bit = this._readPinBit(comp, gate.inputs[i]);
        if (this._drivePinBit(comp, gate.outputs[8 + i], bit)) changed = true;
      }
    } else {
      // B→A: drive A-side, HiZ B-side
      for (let i = 0; i < 8; i++) {
        const bit = this._readPinBit(comp, gate.inputs[8 + i]);
        if (this._drivePinBit(comp, gate.outputs[i], bit)) changed = true;
      }
      for (let i = 0; i < 8; i++) {
        if (this._drivePinHighZ(comp, gate.outputs[8 + i])) changed = true;
      }
    }
    return changed;
  }

  _evaluateMux2to1Tri(comp, gate) {
    // 74257-style: 2-to-1 multiplexer with active LOW tri-state output enable.
    // inputs: [A, B, SEL, OE], output (single name string)
    // OE=0: SEL=0→Y=A, SEL=1→Y=B. OE=1: HiZ.
    const [aName,bName,selName,oeName] = gate.inputs;
    const oe = this._readPinBit(comp, oeName);
    if (oe !== 0) return this._drivePinHighZ(comp, gate.output);
    const a   = this._readPinBit(comp, aName);
    const b   = this._readPinBit(comp, bName);
    const sel = this._readPinBit(comp, selName);
    return this._drivePinBit(comp, gate.output, sel ? b : a);
  }

  _evaluateAddressableLatch(comp, gate) {
    // 74259: 8 bit addressable latch.
    // inputs: [A0, A1, A2, D, G, CLR]
    // outputs: [Q0..Q7]
    // CLR=0 (active LOW, async): clears all Q to 0.
    // CLR=1, G=0 (active LOW enable): addressed latch follows D; others hold.
    // CLR=1, G=1: all latches hold state.
    const [a0N,a1N,a2N,dN,gN,clrN] = gate.inputs;
    const state = this._getSeqState(comp, gate.outputs[0],
      { q: new Array(8).fill(0) });

    const clr = this._readPinBit(comp, clrN);
    if (clr === 0) {
      state.q.fill(0);
    } else {
      const g = this._readPinBit(comp, gN);
      if (g === 0) {
        const addr = this._readPinBit(comp, a0N)
          | (this._readPinBit(comp, a1N) << 1)
          | (this._readPinBit(comp, a2N) << 2);
        state.q[addr] = this._readPinBit(comp, dN);
      }
    }
    return this._drivePinBits(comp, gate.outputs, state.q.slice());
  }

  _evaluateDFFOctal(comp, gate) {
    // 74273: Octal D flip-flop with asynchronous active LOW clear.
    // inputs: [1D..8D, CLK, CLR], outputs: [1Q..8Q]
    const dNames    = gate.inputs.slice(0, 8);
    const [clkN,clrN] = gate.inputs.slice(8);
    const state = this._getSeqState(comp, gate.outputs[0],
      { q: new Array(8).fill(0), prevClk: 0 });

    const clr = this._readPinBit(comp, clrN);
    if (clr === 0) {
      state.q.fill(0);
      state.prevClk = this._readPinBit(comp, clkN);
      return this._drivePinBits(comp, gate.outputs, state.q.slice());
    }

    const clk = this._readPinBit(comp, clkN);
    if (state.prevClk === 0 && clk === 1) {
      for (let i = 0; i < 8; i++) state.q[i] = this._readPinBit(comp, dNames[i]);
    }
    state.prevClk = clk;
    return this._drivePinBits(comp, gate.outputs, state.q.slice());
  }

  _evaluateDLatchOctalTri(comp, gate) {
    // 74373/74573: Octal D transparent latch with tri-state outputs.
    // inputs: [1D..8D, LE, OE], outputs: [1Q..8Q]
    // LE=1: Q follows D (transparent). LE=0: hold.
    // OE=0 (active LOW): outputs enabled. OE=1: HiZ (0).
    const dNames    = gate.inputs.slice(0, 8);
    const [leN,oeN] = gate.inputs.slice(8);
    const state = this._getSeqState(comp, gate.outputs[0],
      { q: new Array(8).fill(0) });

    const le = this._readPinBit(comp, leN);
    if (le === 1) {
      for (let i = 0; i < 8; i++) state.q[i] = this._readPinBit(comp, dNames[i]);
    }

    const oe = this._readPinBit(comp, oeN);
    if (oe === 0) {
      return this._drivePinBits(comp, gate.outputs, state.q);
    } else {
      return this._drivePinsHighZ(comp, gate.outputs);
    }
  }

  _evaluateDFFOctalTri(comp, gate) {
    // 74374/74574: Octal D edge-triggered flip-flop with tri-state outputs.
    // inputs: [1D..8D, CLK, OE], outputs: [1Q..8Q]
    // Rising CLK: Q latches D.
    // OE=0 (active LOW): outputs enabled. OE=1: HiZ.
    const dNames     = gate.inputs.slice(0, 8);
    const [clkN,oeN] = gate.inputs.slice(8);
    const state = this._getSeqState(comp, gate.outputs[0],
      { q: new Array(8).fill(0), prevClk: 0 });

    const clk = this._readPinBit(comp, clkN);
    if (state.prevClk === 0 && clk === 1) {
      for (let i = 0; i < 8; i++) state.q[i] = this._readPinBit(comp, dNames[i]);
    }
    state.prevClk = clk;

    const oe = this._readPinBit(comp, oeN);
    if (oe === 0) {
      return this._drivePinBits(comp, gate.outputs, state.q);
    } else {
      return this._drivePinsHighZ(comp, gate.outputs);
    }
  }

  _evaluateTriBufferDualOE(comp, gate) {
    // 74541-style: non-inverting tri-state buffer with two active LOW OE inputs.
    // inputs: [A, OE1, OE2], output (single name string)
    // OE1=0 AND OE2=0: Y=A. Otherwise: HiZ.
    const [aName,oe1Name,oe2Name] = gate.inputs;
    const oe1 = this._readPinBit(comp, oe1Name);
    const oe2 = this._readPinBit(comp, oe2Name);
    if (!(oe1 === 0 && oe2 === 0)) return this._drivePinHighZ(comp, gate.output);
    const a = this._readPinBit(comp, aName);
    return this._drivePinBit(comp, gate.output, a);
  }

  _evaluateTriBufferSelInv(comp, gate) {
    // 74x8541-style: selectable inverting/non-inverting tri-state buffer.
    // inputs: [A, OE1, INV] OE1 active LOW; INV selects polarity (1=invert, 0=non-invert).
    // output: single pin Y
    // OE1=0, INV=0: Y = A (non-inverting).  OE1=0, INV=1: Y = NOT A.  OE1=1: HiZ.
    const [aName, oe1Name, invName] = gate.inputs;
    const oe1 = this._readPinBit(comp, oe1Name);
    if (oe1 !== 0) return this._drivePinHighZ(comp, gate.output);
    const a   = this._readPinBit(comp, aName);
    const inv = this._readPinBit(comp, invName);
    return this._drivePinBit(comp, gate.output, inv ? (a ? 0 : 1) : a);
  }

  _evaluateShiftRegLatch(comp, gate) {
    // 74595: 8 bit SIPO shift register with separate output latch.
    // Shift register (SR): SER enters at index 0 (QA side), shifts toward index 7 (QH).
    // Output register (OR): captures SR on rising RCLK. Drives QA..QH.
    // SRCLR=0 (active LOW): async clears SR (OR unchanged until RCLK).
    // OE=0 (active LOW): QA..QH driven from OR. OE=1: HiZ.
    // QHs always reflects SR[7] (last shift stage; not tri-stated).
    // inputs: [SER, SRCLK, RCLK, SRCLR, OE]
    // outputs: [QA, QB, QC, QD, QE, QF, QG, QH, QHs]
    const [serN,srclkN,rclkN,srclrN,oeN] = gate.inputs;
    const state = this._getSeqState(comp, gate.outputs[0],
      { sr: new Array(8).fill(0), or: new Array(8).fill(0),
        prevSRCLK: 0, prevRCLK: 0 });

    const srclr = this._readPinBit(comp, srclrN);
    if (srclr === 0) {
      state.sr.fill(0);
      state.prevSRCLK = this._readPinBit(comp, srclkN);
    } else {
      const srclk = this._readPinBit(comp, srclkN);
      if (state.prevSRCLK === 0 && srclk === 1) {
        const ser = this._readPinBit(comp, serN);
        state.sr.pop();
        state.sr.unshift(ser);
      }
      state.prevSRCLK = srclk;
    }

    const rclk = this._readPinBit(comp, rclkN);
    if (state.prevRCLK === 0 && rclk === 1) {
      state.or = state.sr.slice();
    }
    state.prevRCLK = rclk;

    const oe = this._readPinBit(comp, oeN);
    let changed;
    if (oe === 0) {
      changed = this._drivePinBits(comp, gate.outputs.slice(0, 8), state.or);
    } else {
      changed = this._drivePinsHighZ(comp, gate.outputs.slice(0, 8));
    }
    // QHs = last stage of shift register (always active, not tri-stated)
    if (this._drivePinBit(comp, gate.outputs[8], state.sr[7])) changed = true;
    return changed;
  }


  _evaluateFifo16x5Async(comp, gate) {
    // Asynchronous FIFO 16×5 (74225/229/233).
    // inputs: [DIN0..DIN4, WR, RD, OE]
    // outputs: [DOUT0..DOUT4, EF, FF]
    // WR=LOW → write DIN to queue (if not full). RD=LOW → read/pop (if not empty).
    // OE=LOW → outputs enabled; OE=HIGH → HiZ on data outputs.
    // EF: active LOW empty flag; FF: active LOW full flag.
    const [d0,d1,d2,d3,d4, wr, rd, oe] = this._readGateInputs(comp, gate.inputs);
    const state = this._getSeqState(comp, gate.outputs[0] + '_fifo16x5a', { queue: [], lastRead: [0,0,0,0,0] });
    if (wr === 0 && state.queue.length < 16)
      state.queue.push([d0,d1,d2,d3,d4]);
    if (rd === 0 && state.queue.length > 0)
      state.lastRead = state.queue.shift();
    else if (state.queue.length > 0)
      state.lastRead = [...state.queue[0]];
    const ef = state.queue.length === 0 ? 0 : 1;
    const ff = state.queue.length >= 16 ? 0 : 1;
    let changed = false;
    if (oe !== 0) {
      for (let i = 0; i < 5; i++) { if (this._drivePinHighZ(comp, gate.outputs[i])) changed = true; }
    } else {
      for (let i = 0; i < 5; i++) { if (this._drivePinBit(comp, gate.outputs[i], state.lastRead[i])) changed = true; }
    }
    if (this._drivePinBit(comp, gate.outputs[5], ef)) changed = true;
    if (this._drivePinBit(comp, gate.outputs[6], ff)) changed = true;
    return changed;
  }

  _evaluateFifo16x4Async(comp, gate) {
    // Asynchronous FIFO 16×4 (74232).
    // inputs: [DIN0..DIN3, WR, RD, OE]
    // outputs: [DOUT0..DOUT3, EF, FF]
    const [d0,d1,d2,d3, wr, rd, oe] = this._readGateInputs(comp, gate.inputs);
    const state = this._getSeqState(comp, gate.outputs[0] + '_fifo16x4a', { queue: [], lastRead: [0,0,0,0] });
    if (wr === 0 && state.queue.length < 16)
      state.queue.push([d0,d1,d2,d3]);
    if (rd === 0 && state.queue.length > 0)
      state.lastRead = state.queue.shift();
    else if (state.queue.length > 0)
      state.lastRead = [...state.queue[0]];
    const ef = state.queue.length === 0 ? 0 : 1;
    const ff = state.queue.length >= 16 ? 0 : 1;
    let changed = false;
    if (oe !== 0) {
      for (let i = 0; i < 4; i++) { if (this._drivePinHighZ(comp, gate.outputs[i])) changed = true; }
    } else {
      for (let i = 0; i < 4; i++) { if (this._drivePinBit(comp, gate.outputs[i], state.lastRead[i])) changed = true; }
    }
    if (this._drivePinBit(comp, gate.outputs[4], ef)) changed = true;
    if (this._drivePinBit(comp, gate.outputs[5], ff)) changed = true;
    return changed;
  }

  _evaluateFifo64x4Async(comp, gate) {
    // Asynchronous FIFO 64×4 (74234/236).
    // inputs: [DIN0..DIN3, WR, RD, OE]
    // outputs: [DOUT0..DOUT3, EF, FF]
    const [d0,d1,d2,d3, wr, rd, oe] = this._readGateInputs(comp, gate.inputs);
    const state = this._getSeqState(comp, gate.outputs[0] + '_fifo64x4a', { queue: [], lastRead: [0,0,0,0] });
    if (wr === 0 && state.queue.length < 64)
      state.queue.push([d0,d1,d2,d3]);
    if (rd === 0 && state.queue.length > 0)
      state.lastRead = state.queue.shift();
    else if (state.queue.length > 0)
      state.lastRead = [...state.queue[0]];
    const ef = state.queue.length === 0 ? 0 : 1;
    const ff = state.queue.length >= 64 ? 0 : 1;
    let changed = false;
    if (oe !== 0) {
      for (let i = 0; i < 4; i++) { if (this._drivePinHighZ(comp, gate.outputs[i])) changed = true; }
    } else {
      for (let i = 0; i < 4; i++) { if (this._drivePinBit(comp, gate.outputs[i], state.lastRead[i])) changed = true; }
    }
    if (this._drivePinBit(comp, gate.outputs[4], ef)) changed = true;
    if (this._drivePinBit(comp, gate.outputs[5], ff)) changed = true;
    return changed;
  }

  _evaluateFifo64x5Async(comp, gate) {
    // Asynchronous FIFO 64×5 (74235).
    // inputs: [DIN0..DIN4, WR, RD, OE]
    // outputs: [DOUT0..DOUT4, EF, FF]
    const [d0,d1,d2,d3,d4, wr, rd, oe] = this._readGateInputs(comp, gate.inputs);
    const state = this._getSeqState(comp, gate.outputs[0] + '_fifo64x5a', { queue: [], lastRead: [0,0,0,0,0] });
    if (wr === 0 && state.queue.length < 64)
      state.queue.push([d0,d1,d2,d3,d4]);
    if (rd === 0 && state.queue.length > 0)
      state.lastRead = state.queue.shift();
    else if (state.queue.length > 0)
      state.lastRead = [...state.queue[0]];
    const ef = state.queue.length === 0 ? 0 : 1;
    const ff = state.queue.length >= 64 ? 0 : 1;
    let changed = false;
    if (oe !== 0) {
      for (let i = 0; i < 5; i++) { if (this._drivePinHighZ(comp, gate.outputs[i])) changed = true; }
    } else {
      for (let i = 0; i < 5; i++) { if (this._drivePinBit(comp, gate.outputs[i], state.lastRead[i])) changed = true; }
    }
    if (this._drivePinBit(comp, gate.outputs[5], ef)) changed = true;
    if (this._drivePinBit(comp, gate.outputs[6], ff)) changed = true;
    return changed;
  }

  _evaluateFifo16x4SyncOC(comp, gate) {
    // 74227: 64 bit synchronous FIFO (16×4) with open-collector outputs, IR/OR flags.
    // inputs: [DIN0..DIN3, WR_CLK, RD_CLK, WR_EN, RD_EN]
    // outputs: [DOUT0..DOUT3, EF, FF, IR, OR]
    const bits = this._readGateInputs(comp, gate.inputs);
    const [d0,d1,d2,d3, wrClk, rdClk, wrEn, rdEn] = bits;
    const state = this._getSeqState(comp, gate.outputs[0] + '_fifo16soc', { queue: [], prevWrClk: 0, prevRdClk: 0, lastRead: [0,0,0,0] });
    if (state.prevWrClk === 0 && wrClk === 1 && wrEn === 0 && state.queue.length < 16)
      state.queue.push([d0,d1,d2,d3]);
    state.prevWrClk = wrClk;
    if (state.prevRdClk === 0 && rdClk === 1 && rdEn === 0 && state.queue.length > 0)
      state.lastRead = state.queue.shift();
    else if (rdClk === 0 && state.queue.length > 0)
      state.lastRead = [...state.queue[0]];
    state.prevRdClk = rdClk;
    const ef = state.queue.length === 0 ? 0 : 1;
    const ff = state.queue.length >= 16 ? 0 : 1;
    const ir = state.queue.length < 16 ? 1 : 0;
    const or = state.queue.length > 0 ? 1 : 0;
    const vals = [...state.lastRead, ef, ff, ir, or];
    let changed = false;
    for (let i = 0; i < gate.outputs.length; i++) {
      if (this._drivePinOC(comp, gate.outputs[i], vals[i])) changed = true;
    }
    return changed;
  }

  _evaluateFifo16x4OC(comp, gate) {
    // 74228: 64 bit synchronous FIFO (16×4) with open-collector outputs, EF/FF only.
    // inputs: [DIN0..DIN3, WR_CLK, RD_CLK, WR_EN, RD_EN]
    // outputs: [DOUT0..DOUT3, EF, FF]
    const bits = this._readGateInputs(comp, gate.inputs);
    const [d0,d1,d2,d3, wrClk, rdClk, wrEn, rdEn] = bits;
    const state = this._getSeqState(comp, gate.outputs[0] + '_fifo16oc', { queue: [], prevWrClk: 0, prevRdClk: 0, lastRead: [0,0,0,0] });
    if (state.prevWrClk === 0 && wrClk === 1 && wrEn === 0 && state.queue.length < 16)
      state.queue.push([d0,d1,d2,d3]);
    state.prevWrClk = wrClk;
    if (state.prevRdClk === 0 && rdClk === 1 && rdEn === 0 && state.queue.length > 0)
      state.lastRead = state.queue.shift();
    else if (rdClk === 0 && state.queue.length > 0)
      state.lastRead = [...state.queue[0]];
    state.prevRdClk = rdClk;
    const ef = state.queue.length === 0 ? 0 : 1;
    const ff = state.queue.length >= 16 ? 0 : 1;
    const vals = [...state.lastRead, ef, ff];
    let changed = false;
    for (let i = 0; i < gate.outputs.length; i++) {
      if (this._drivePinOC(comp, gate.outputs[i], vals[i])) changed = true;
    }
    return changed;
  }

  _evaluateLatchTrans4Bit(comp, gate) {
    // 74226: 4 bit latched bus transceiver.
    // inputs: [A1,B1,A2,B2,A3,B3,A4,B4, OEA,OEB,DIR,LE]
    // outputs: [A1,B1,A2,B2,A3,B3,A4,B4]  (bidirectional)
    // LE=1: transparent (latch follows inputs). LE=0: latch holds last value.
    // DIR=1: A→B (B outputs driven, A HiZ). DIR=0: B→A (A outputs driven, B HiZ).
    // OEA=0: A-side outputs enabled. OEA=1: A-side HiZ.
    // OEB=0: B-side outputs enabled. OEB=1: B-side HiZ.
    const bits = this._readGateInputs(comp, gate.inputs);
    const [a1,b1,a2,b2,a3,b3,a4,b4, oea, oeb, dir, le] = bits;
    const state = this._getSeqState(comp, gate.outputs[0] + '_latch4', { latch: [0,0,0,0] });
    const aInputs = [a1,a2,a3,a4];
    const bInputs = [b1,b2,b3,b4];
    if (le === 1) {
      if (dir === 1) state.latch = [...aInputs];  // A→B direction: latch A
      else           state.latch = [...bInputs];   // B→A direction: latch B
    }
    let changed = false;
    // A outputs at indices 0,2,4,6; B outputs at indices 1,3,5,7
    const aOutNames = [gate.outputs[0],gate.outputs[2],gate.outputs[4],gate.outputs[6]];
    const bOutNames = [gate.outputs[1],gate.outputs[3],gate.outputs[5],gate.outputs[7]];
    if (dir === 1) {
      // A→B: drive B with latched A data
      for (let i = 0; i < 4; i++) {
        if (this._drivePinHighZ(comp, aOutNames[i])) changed = true;
        const bit = oeb === 0 ? state.latch[i] : -1;
        if (bit === -1) { if (this._drivePinHighZ(comp, bOutNames[i])) changed = true; }
        else { if (this._drivePinBit(comp, bOutNames[i], bit)) changed = true; }
      }
    } else {
      // B→A: drive A with latched B data
      for (let i = 0; i < 4; i++) {
        if (this._drivePinHighZ(comp, bOutNames[i])) changed = true;
        const bit = oea === 0 ? state.latch[i] : -1;
        if (bit === -1) { if (this._drivePinHighZ(comp, aOutNames[i])) changed = true; }
        else { if (this._drivePinBit(comp, aOutNames[i], bit)) changed = true; }
      }
    }
    return changed;
  }

  _evaluateTriNotHi(comp, gate) {
    // Inverting tri-state buffer with active HIGH output enable.
    // OE=1: output = NOT(A). OE=0: HiZ.
    const [aName, oeName] = gate.inputs;
    const oe = this._readPinBit(comp, oeName);
    if (oe !== 1) return this._drivePinHighZ(comp, gate.output);
    const a = this._readPinBit(comp, aName);
    return this._drivePinBit(comp, gate.output, a ? 0 : 1);
  }

  _evaluateDecoder3to8Hi(comp, gate) {
    // 74238: 3-to-8 decoder, active HIGH outputs.
    // inputs: [A0, A1, A2, E3, E1n, E2n]
    // outputs: [Y0..Y7]
    // Enabled when E3=1 AND E1n=0 AND E2n=0. Selected output HIGH; others LOW.
    const inputBits = [];
    for (const inputPinName of gate.inputs) {
      const pin = comp.getPinByName(inputPinName);
      if (!pin) { inputBits.push(0); continue; }
      const net = this.netlist.findNetByHole(pin.holeId);
      if (!net) { inputBits.push(0); continue; }
      const v = this.netVoltages.get(net.id);
      inputBits.push(v !== undefined && v > 2.5 ? 1 : 0);
    }
    const [a, b, c, e3, e1n, e2n] = inputBits;
    const enabled = e3 === 1 && e1n === 0 && e2n === 0;
    const selectedIndex = a | (b << 1) | (c << 2);
    let changed = false;
    for (let i = 0; i < gate.outputs.length; i++) {
      const outputBit = enabled && i === selectedIndex ? 1 : 0;
      if (this._drivePinBit(comp, gate.outputs[i], outputBit)) changed = true;
    }
    return changed;
  }

  _evaluateDecoder2to4Hi(comp, gate) {
    // 74239: 2-to-4 decoder, active HIGH outputs.
    // inputs: [A0, A1, E]  E=1 enables
    // outputs: [Y0..Y3]
    // Selected output HIGH; others LOW. Disabled: all LOW.
    const [aName, bName, eName] = gate.inputs;
    const enabled = this._readPinBit(comp, eName) === 1;
    const a = this._readPinBit(comp, aName);
    const b = this._readPinBit(comp, bName);
    const selectedIndex = a | (b << 1);
    let changed = false;
    for (let i = 0; i < gate.outputs.length; i++) {
      const outputBit = enabled && i === selectedIndex ? 1 : 0;
      if (this._drivePinBit(comp, gate.outputs[i], outputBit)) changed = true;
    }
    return changed;
  }

  _evaluateDec3To8LatchHi(comp, gate) {
    // 74237: 3-to-8 decoder with address latch, active HIGH outputs.
    // inputs: [A0, A1, A2, E1n, E2, LE]
    // outputs: [Y0..Y7]
    // LE=1 (transparent): address passes through. LE=0: address latched.
    // Enabled when E1n=0 AND E2=1. Selected output HIGH; others LOW.
    const [a0N, a1N, a2N, e1nN, e2N, leN] = gate.inputs;
    const stateName = gate.outputs[0] + '_dl8hi';
    const state = this._getSeqState(comp, stateName, { addr: 0 });
    const le = this._readPinBit(comp, leN);
    if (le === 1) {
      state.addr = this._readPinBit(comp, a0N) |
                   (this._readPinBit(comp, a1N) << 1) |
                   (this._readPinBit(comp, a2N) << 2);
    }
    const e1n = this._readPinBit(comp, e1nN);
    const e2  = this._readPinBit(comp, e2N);
    const enabled = (e1n === 0) && (e2 === 1);
    let changed = false;
    for (let i = 0; i < gate.outputs.length; i++) {
      const bit = (enabled && i === state.addr) ? 1 : 0;
      if (this._drivePinBit(comp, gate.outputs[i], bit)) changed = true;
    }
    return changed;
  }

  _evaluateTransceiver4Bit(comp, gate) {
    // 74243: 4 bit non-inverting bus transceiver with separate direction controls.
    // inputs: [A1,B1,A2,B2,A3,B3,A4,B4, GABn, GBAn]
    // outputs: [A1,B1,A2,B2,A3,B3,A4,B4]
    // GABn=0: A→B enabled. GBAn=0: B→A enabled. Both=1: HiZ.
    const gab  = this._readPinBit(comp, gate.inputs[8]);
    const gba  = this._readPinBit(comp, gate.inputs[9]);
    // A inputs at indices 0,2,4,6; B inputs at indices 1,3,5,7
    const aInNames = [gate.inputs[0], gate.inputs[2], gate.inputs[4], gate.inputs[6]];
    const bInNames = [gate.inputs[1], gate.inputs[3], gate.inputs[5], gate.inputs[7]];
    const aOutNames = [gate.outputs[0], gate.outputs[2], gate.outputs[4], gate.outputs[6]];
    const bOutNames = [gate.outputs[1], gate.outputs[3], gate.outputs[5], gate.outputs[7]];
    let changed = false;
    if (gab === 0 && gba !== 0) {
      // A→B
      for (let i = 0; i < 4; i++) {
        if (this._drivePinHighZ(comp, aOutNames[i])) changed = true;
        if (this._drivePinBit(comp, bOutNames[i], this._readPinBit(comp, aInNames[i]))) changed = true;
      }
    } else if (gba === 0 && gab !== 0) {
      // B→A
      for (let i = 0; i < 4; i++) {
        if (this._drivePinBit(comp, aOutNames[i], this._readPinBit(comp, bInNames[i]))) changed = true;
        if (this._drivePinHighZ(comp, bOutNames[i])) changed = true;
      }
    } else {
      // Both disabled: HiZ all
      if (this._drivePinsHighZ(comp, gate.outputs)) changed = true;
    }
    return changed;
  }

  _evaluateTransceiver4BitInv(comp, gate) {
    // 74242: 4 bit inverting bus transceiver with separate direction controls.
    // Same as TRANSCEIVER_4BIT but outputs are inverted.
    // inputs: [A1,B1,A2,B2,A3,B3,A4,B4, GABn, GBAn]
    // outputs: [A1,B1,A2,B2,A3,B3,A4,B4]
    const gab  = this._readPinBit(comp, gate.inputs[8]);
    const gba  = this._readPinBit(comp, gate.inputs[9]);
    const aInNames  = [gate.inputs[0], gate.inputs[2], gate.inputs[4], gate.inputs[6]];
    const bInNames  = [gate.inputs[1], gate.inputs[3], gate.inputs[5], gate.inputs[7]];
    const aOutNames = [gate.outputs[0], gate.outputs[2], gate.outputs[4], gate.outputs[6]];
    const bOutNames = [gate.outputs[1], gate.outputs[3], gate.outputs[5], gate.outputs[7]];
    let changed = false;
    if (gab === 0 && gba !== 0) {
      // A→B (inverted)
      for (let i = 0; i < 4; i++) {
        if (this._drivePinHighZ(comp, aOutNames[i])) changed = true;
        if (this._drivePinBit(comp, bOutNames[i], this._readPinBit(comp, aInNames[i]) ? 0 : 1)) changed = true;
      }
    } else if (gba === 0 && gab !== 0) {
      // B→A (inverted)
      for (let i = 0; i < 4; i++) {
        if (this._drivePinBit(comp, aOutNames[i], this._readPinBit(comp, bInNames[i]) ? 0 : 1)) changed = true;
        if (this._drivePinHighZ(comp, bOutNames[i])) changed = true;
      }
    } else {
      if (this._drivePinsHighZ(comp, gate.outputs)) changed = true;
    }
    return changed;
  }

  _evaluateMux16to1Tri(comp, gate) {
    // 74250: 16-to-1 mux with tri-state complemented output W.
    // inputs: [E1..E16, A, B, C, D, OE]
    // OE=0: enabled; W = NOT(selected data). OE=1: W HiZ.
    const bits = this._readGateInputs(comp, gate.inputs);
    const oe  = bits[20];
    if (oe !== 0) return this._drivePinHighZ(comp, gate.outputs[0]);
    const sel = bits[16] | (bits[17] << 1) | (bits[18] << 2) | (bits[19] << 3);
    const data = bits[sel];
    return this._drivePinBit(comp, gate.outputs[0], data ? 0 : 1);
  }

  _evaluateMux8to1Tri(comp, gate) {
    // 74251: 8-to-1 mux with tri-state outputs Y (true) and W (complemented).
    // inputs: [D0..D7, A, B, C, Gn]
    // Gn=0: enabled. Gn=1: Y and W HiZ.
    const bits = this._readGateInputs(comp, gate.inputs);
    const gn  = bits[11];
    if (gn !== 0) {
      let changed = false;
      if (this._drivePinHighZ(comp, gate.outputs[0])) changed = true;
      if (this._drivePinHighZ(comp, gate.outputs[1])) changed = true;
      return changed;
    }
    const sel  = bits[8] | (bits[9] << 1) | (bits[10] << 2);
    const data = bits[sel];
    return this._drivePinBits(comp, gate.outputs, [data, data ? 0 : 1]);
  }

  _evaluateMux4to1Tri(comp, gate) {
    // 74253: single 4-to-1 mux section with tri-state output.
    // inputs: [C0, C1, C2, C3, S0, S1, Gn], output (single name string)
    // Gn=0: enabled; output = selected data. Gn=1: HiZ.
    const [c0,c1,c2,c3,s0,s1,gn] = this._readGateInputs(comp, gate.inputs);
    if (gn !== 0) return this._drivePinHighZ(comp, gate.output);
    const sel  = s0 | (s1 << 1);
    const data = [c0,c1,c2,c3][sel];
    return this._drivePinBit(comp, gate.output, data);
  }

  _evaluateDemux2to4Tri(comp, gate) {
    // 74255: dual 1-of-4 demultiplexer/decoder with tri-state inverting outputs.
    // inputs: [S0, S1, Gn, C]
    // outputs: [Y0n, Y1n, Y2n, Y3n]
    // Gn=0 AND C=0: decoded output LOW, rest HIGH. Otherwise HiZ.
    const [s0,s1,gn,c] = this._readGateInputs(comp, gate.inputs);
    let changed = false;
    if (gn !== 0 || c !== 0) {
      // HiZ all outputs
      for (const out of gate.outputs) {
        if (this._drivePinHighZ(comp, out)) changed = true;
      }
      return changed;
    }
    const sel = s0 | (s1 << 1);
    for (let i = 0; i < gate.outputs.length; i++) {
      const bit = (i === sel) ? 0 : 1;
      if (this._drivePinBit(comp, gate.outputs[i], bit)) changed = true;
    }
    return changed;
  }

  _evaluateDualAddrLatch4Bit(comp, gate) {
    // 74256: dual 4 bit addressable latch.
    // inputs: [A0, A1, D, GS, CLR1, CLR2]
    // outputs: [1Q0, 1Q1, 1Q2, 1Q3, 2Q0, 2Q1, 2Q2, 2Q3]
    // CLR1=0: clear section 1 (Q0-Q3). CLR2=0: clear section 2 (Q4-Q7).
    // GS=0 (gate strobe active): addressed bit follows D.
    // A0,A1: 2 bit address selects one of 4 bits per section.
    const [a0N,a1N,dN,gsN,clr1N,clr2N] = gate.inputs;
    const stateName = gate.outputs[0] + '_dal4';
    const state = this._getSeqState(comp, stateName, { q: [0,0,0,0,0,0,0,0] });
    const a0  = this._readPinBit(comp, a0N);
    const a1  = this._readPinBit(comp, a1N);
    const d   = this._readPinBit(comp, dN);
    const gs  = this._readPinBit(comp, gsN);
    const clr1 = this._readPinBit(comp, clr1N);
    const clr2 = this._readPinBit(comp, clr2N);
    const addr = a0 | (a1 << 1);
    if (clr1 === 0) { state.q[0] = 0; state.q[1] = 0; state.q[2] = 0; state.q[3] = 0; }
    if (clr2 === 0) { state.q[4] = 0; state.q[5] = 0; state.q[6] = 0; state.q[7] = 0; }
    if (gs === 0) {
      // Gate strobe: addressed bit follows D in both sections
      if (clr1 !== 0) state.q[addr]     = d;
      if (clr2 !== 0) state.q[4 + addr] = d;
    }
    let changed = false;
    for (let i = 0; i < 8; i++) {
      if (this._drivePinBit(comp, gate.outputs[i], state.q[i])) changed = true;
    }
    return changed;
  }

  _evaluateMux2to1InvTri(comp, gate) {
    // 74258: single 2-to-1 mux section with inverting tri-state output.
    // inputs: [A, B, S, OEn], output (single name string)
    // OEn=0: enabled; output = NOT(S ? B : A). OEn=1: HiZ.
    const [aName,bName,sName,oenName] = gate.inputs;
    const oen = this._readPinBit(comp, oenName);
    if (oen !== 0) return this._drivePinHighZ(comp, gate.output);
    const a = this._readPinBit(comp, aName);
    const b = this._readPinBit(comp, bName);
    const s = this._readPinBit(comp, sName);
    return this._drivePinBit(comp, gate.output, (s ? b : a) ? 0 : 1);
  }

  _evaluateMult2x4Bit(comp, gate) {
    // 74261: 2 bit by 4 bit parallel binary multiplier.
    // inputs: [B1, B2, A1, A2, Y1, Y2, Y3, Y4]
    // outputs: [P1, P2, P3, P4, P5, P6]
    // B = 2 bit multiplicand (B1=bit0, B2=bit1)
    // A = 2 bit partial product addend (A1=bit0, A2=bit1)
    // Y = 4 bit multiplier (Y1=bit0, Y4=bit3)
    // Product = B * Y + A  (max = 3*15+3 = 48, fits in 6 bits)
    const [b1,b2,a1,a2,y1,y2,y3,y4] = this._readGateInputs(comp, gate.inputs);
    const B = b1 | (b2 << 1);
    const A = a1 | (a2 << 1);
    const Y = y1 | (y2 << 1) | (y3 << 2) | (y4 << 3);
    const product = B * Y + A;
    let changed = false;
    for (let i = 0; i < 6; i++) {
      if (this._drivePinBit(comp, gate.outputs[i], (product >> i) & 1)) changed = true;
    }
    return changed;
  }

}

for (const _name of Object.getOwnPropertyNames(_ChipEvalMixin.prototype)) {
  if (_name !== 'constructor') chipEvaluators[_name] = _ChipEvalMixin.prototype[_name];
}


// ── Block 18 Evaluator Methods ───────────────────────────────────────────────

// Attach evaluators to the Simulator class retroactively to keep file structure flat.
// These are defined as standalone functions then assigned in a subsequent block.

function _evaluateBufferComp_fn(comp, gate) {
  // 74265: complementary output buffer.
  // inputs: [A], outputs: [Y, Yn]
  const [a] = this._readGateInputs(comp, gate.inputs);
  let changed = false;
  if (this._drivePinBit(comp, gate.outputs[0], a ? 1 : 0)) changed = true;
  if (this._drivePinBit(comp, gate.outputs[1], a ? 0 : 1)) changed = true;
  return changed;
}

function _evaluateDLatchHexTri_fn(comp, gate) {
  // 74268: hex D-type latch with tri-state output.
  // inputs: [1D,2D,3D,4D,5D,6D, G, OEn]
  // outputs: [1Q,2Q,3Q,4Q,5Q,6Q]
  const bits = this._readGateInputs(comp, gate.inputs);
  const g   = bits[6]; // gate enable (active HIGH = transparent)
  const oen = bits[7]; // output enable (active LOW)
  if (!comp._state) comp._state = {};
  if (g) {
    // transparent: latch data inputs
    for (let i = 0; i < 6; i++) comp._state[`d${i}`] = bits[i];
  }
  let changed = false;
  for (let i = 0; i < 6; i++) {
    const stored = comp._state[`d${i}`] ?? 0;
    if (oen !== 0) {
      if (this._drivePinHighZ(comp, gate.outputs[i])) changed = true;
    } else {
      if (this._drivePinBit(comp, gate.outputs[i], stored)) changed = true;
    }
  }
  return changed;
}

function _evaluateCounter8BitBidir_fn(comp, gate) {
  // 74269: 8 bit synchronous up/down binary counter.
  // inputs: [CLK, ENT, ENP, U_Dn, LOAD, A0..A7]
  // outputs: [Q0..Q7, TC]
  const bits = this._readGateInputs(comp, gate.inputs);
  const clk  = bits[0];
  const ent  = bits[1];
  const enp  = bits[2];
  const upDn = bits[3]; // 0=down, 1=up
  const load = bits[4]; // active LOW
  if (!comp._state) comp._state = { q: 0, prevClk: 0 };
  let changed = false;
  const rising = (clk === 1) && (comp._state.prevClk === 0);
  comp._state.prevClk = clk;
  if (rising) {
    if (load === 0) {
      // synchronous load
      let val = 0;
      for (let i = 0; i < 8; i++) val |= (bits[5 + i] << i);
      comp._state.q = val;
    } else if (ent === 1 && enp === 1) {
      if (upDn === 1) {
        comp._state.q = (comp._state.q + 1) & 0xFF;
      } else {
        comp._state.q = (comp._state.q - 1 + 256) & 0xFF;
      }
    }
  }
  const q = comp._state.q;
  for (let i = 0; i < 8; i++) {
    if (this._drivePinBit(comp, gate.outputs[i], (q >> i) & 1)) changed = true;
  }
  // TC: terminal count (when at max going up, or 0 going down, and enabled)
  const tc = ent === 1 && ((upDn === 1 && q === 0xFF) || (upDn === 0 && q === 0x00)) ? 1 : 0;
  if (this._drivePinBit(comp, gate.outputs[8], tc)) changed = true;
  return changed;
}



function _evaluateMult4x4BitTri_fn(comp, gate) {
  // 74274: 4×4 bit multiplier with tri-state output.
  // inputs: [X0,X1,X2,X3, Y0,Y1,Y2,Y3, OEn]
  // outputs: [P0..P7]
  const bits = this._readGateInputs(comp, gate.inputs);
  const oen  = bits[8];
  let changed = false;
  if (oen !== 0) {
    for (const out of gate.outputs) {
      if (this._drivePinHighZ(comp, out)) changed = true;
    }
    return changed;
  }
  const x = bits[0] | (bits[1]<<1) | (bits[2]<<2) | (bits[3]<<3);
  const y = bits[4] | (bits[5]<<1) | (bits[6]<<2) | (bits[7]<<3);
  const p = (x * y) & 0xFF;
  for (let i = 0; i < 8; i++) {
    if (this._drivePinBit(comp, gate.outputs[i], (p >> i) & 1)) changed = true;
  }
  return changed;
}

function _evaluateWallaceTree7Bit_fn(comp, gate) {
  // 74275: 7 bit slice Wallace tree.
  // inputs: [W0,W1,W2,W3, X0,X1, Y0]
  // outputs: [S0,S1,S2,S3, C2,C3, Y1]
  // Implements carry-save adder tree for 4+2+1 inputs per column.
  // This is a simplified but functionally correct model:
  // For a 4 bit slice position, compute partial product sums.
  // W0-W3: 4 partial product bits at this weight
  // X0-X1: 2 partial product bits at next weight
  // Y0: carry-in from previous slice at this weight
  // S0-S3: sum outputs
  // C2,C3: carry outputs
  // Y1: carry-out to next slice
  const [w0,w1,w2,w3, x0,x1, y0] = this._readGateInputs(comp, gate.inputs);
  // First CSA: (W0, W1, W2) → S_a (sum), C_a (carry)
  const sumA = w0 ^ w1 ^ w2;
  const carA = (w0 & w1) | (w1 & w2) | (w0 & w2);
  // Second CSA: (W3, Y0, sumA) → S_b (sum), C_b (carry)
  const sumB = w3 ^ y0 ^ sumA;
  const carB = (w3 & y0) | (y0 & sumA) | (w3 & sumA);
  // X0, X1 are at higher weight, combine with carries
  const s0 = sumB;
  const c2b = carA;
  const c3b = carB;
  // Combine x0 with c2b
  const sumC = x0 ^ x1 ^ c2b;
  const carC = (x0 & x1) | (x1 & c2b) | (x0 & c2b);
  const s1 = sumC;
  const c2 = c3b;
  const c3 = carC;
  // Y1 = carry from combining at highest weight
  const y1 = c3;
  const s2 = 0; // higher bits not resolved in this slice
  const s3 = 0;
  let changed = false;
  const outs = [s0,s1,s2,s3,c2,c3,y1];
  for (let i = 0; i < 7; i++) {
    if (this._drivePinBit(comp, gate.outputs[i], outs[i] ? 1 : 0)) changed = true;
  }
  return changed;
}

function _evaluateJKFFQuadSepClk_fn(comp, gate) {
  // 74276: Quad JK FFs with separate clocks (shared CLKn line), shared PRE/CLR.
  // inputs: [CLKn, 1J,1K, 2J,2K, 3J,3K, 4J,4K, PRE_CLRn]
  // outputs: [1Q,1Qn, 2Q,2Qn, 3Q,3Qn, 4Q,4Qn]
  // CLKn is shared (active LOW clock pulse)
  // PRE_CLRn: active LOW simultaneous preset and clear (metastable avoid: both set = no-op)
  const bits  = this._readGateInputs(comp, gate.inputs);
  const clkn  = bits[0];
  const preclrn = bits[9];
  if (!comp._state) comp._state = { q: [0,0,0,0], prevClk: 1 };
  let changed = false;
  // Active LOW clock: falling edge triggers
  const falling = (clkn === 0) && (comp._state.prevClk === 1);
  comp._state.prevClk = clkn;
  for (let i = 0; i < 4; i++) {
    const j = bits[1 + i*2];
    const k = bits[2 + i*2];
    if (preclrn === 0) {
      // Both SET and CLEAR active simultaneously → keep current or set known state
      // Datasheet: illegal state; outputs undefined. We model as both Q=1 then release
      // For simulation: keep current value
    } else if (falling) {
      // JK logic
      if (j === 0 && k === 0) { /* hold */ }
      else if (j === 1 && k === 0) comp._state.q[i] = 1;
      else if (j === 0 && k === 1) comp._state.q[i] = 0;
      else comp._state.q[i] = comp._state.q[i] ? 0 : 1; // toggle
    }
    if (this._drivePinBit(comp, gate.outputs[i*2],     comp._state.q[i]))     changed = true;
    if (this._drivePinBit(comp, gate.outputs[i*2 + 1], comp._state.q[i] ? 0 : 1)) changed = true;
  }
  return changed;
}

function _evaluatePriorityReg4Bit_fn(comp, gate) {
  // 74278: 4 bit cascadeable priority register.
  // inputs: [D0,D1,D2,D3, EI, CLK, CLRn]
  // outputs: [Q0,Q1,Q2, GS, EO]
  // EI (enable input): active HIGH cascade enable
  // GS: group select (at least one asserted priority input with EI=1)
  // EO: enable output (no asserted inputs and EI=1)
  // Q2:Q1:Q0 encode highest-priority active input (D3=highest)
  const bits = this._readGateInputs(comp, gate.inputs);
  const [d0,d1,d2,d3, ei, clk, clrn] = bits;
  if (!comp._state) comp._state = { q: 0, prevClk: 0 };
  let changed = false;
  const rising = (clk === 1) && (comp._state.prevClk === 0);
  comp._state.prevClk = clk;
  if (clrn === 0) {
    comp._state.q = 0;
  } else if (rising) {
    if (ei === 1) {
      // Encode highest priority active input
      if      (d3) comp._state.q = 3;
      else if (d2) comp._state.q = 2;
      else if (d1) comp._state.q = 1;
      else if (d0) comp._state.q = 0;
      else         comp._state.q = 0;
    }
  }
  const q = comp._state.q;
  const anyActive = (ei === 1) && (d0 || d1 || d2 || d3) ? 1 : 0;
  const gs = anyActive;
  const eo = (ei === 1) && !anyActive ? 1 : 0;
  if (this._drivePinBit(comp, gate.outputs[0], (q >> 0) & 1)) changed = true;
  if (this._drivePinBit(comp, gate.outputs[1], (q >> 1) & 1)) changed = true;
  if (this._drivePinBit(comp, gate.outputs[2], (q >> 2) & 1)) changed = true; // always 0 for 4-in
  if (this._drivePinBit(comp, gate.outputs[3], gs)) changed = true;
  if (this._drivePinBit(comp, gate.outputs[4], eo)) changed = true;
  return changed;
}

function _evaluateSRLatchNorNand_fn(comp, gate) {
  // 74279: SR latch cell with NAND implementation (active LOW S and R).
  // inputs: [S1n, S2n, Rn]  (S = NAND of S1n,S2n; R from Rn)
  // output: Q (single string)
  // Active LOW inputs: S=0 → set, R=0 → reset, both=1 → hold
  const bits = this._readGateInputs(comp, gate.inputs);
  const sn = bits[0] & bits[1]; // NAND of dual S inputs → active LOW when either=0
  const rn = bits[2];
  if (!comp._state) comp._state = { q: 0 };
  let changed = false;
  // s (active low set): sn=0 means S active
  // r (active low reset): rn=0 means R active
  const sActive = (sn === 0);
  const rActive = (rn === 0);
  if (sActive && !rActive) {
    comp._state.q = 1;
  } else if (rActive && !sActive) {
    comp._state.q = 0;
  }
  // both active: metastable hold last
  if (this._drivePinBit(comp, gate.output, comp._state.q)) changed = true;
  return changed;
}

function _evaluateParity9BitSimple_fn(comp, gate) {
  // 74280: 9 bit parity generator/checker.
  // inputs: [A,B,C,D,E,F,G,H,I]
  // outputs: [EVEN, ODD]
  const bits = this._readGateInputs(comp, gate.inputs);
  const ones = bits.reduce((sum, b) => sum + b, 0);
  const parity = ones & 1; // 1 = odd number of ones
  let changed = false;
  if (this._drivePinBit(comp, gate.outputs[0], parity ? 0 : 1)) changed = true; // EVEN = 1 when even count
  if (this._drivePinBit(comp, gate.outputs[1], parity ? 1 : 0)) changed = true; // ODD = 1 when odd count
  return changed;
}

function _evaluateAccumulator4Bit_fn(comp, gate) {
  // 74281: 4 bit parallel binary accumulator with ALU function select.
  // inputs: [B0,B1,B2,B3, M0,M1,M2,M3, S0,S1,S2,S3, Cn, CLRn, CLK]
  // outputs: [F0,F1,F2,F3, Cn4, OVR]
  // M: mask to control which bits of accumulator participate in B
  // S: ALU function select (4 bit for 74181-compatible operations)
  // Simplified: performs A op B where A is the internal accumulator
  const bits = this._readGateInputs(comp, gate.inputs);
  const b   = bits[0] | (bits[1]<<1) | (bits[2]<<2) | (bits[3]<<3);
  const m   = bits[4] | (bits[5]<<1) | (bits[6]<<2) | (bits[7]<<3);
  const s   = bits[8] | (bits[9]<<1) | (bits[10]<<2) | (bits[11]<<3);
  const cn  = bits[12];
  const clrn = bits[13];
  const clk  = bits[14];
  if (!comp._state) comp._state = { acc: 0, prevClk: 0 };
  let changed = false;
  const rising = (clk === 1) && (comp._state.prevClk === 0);
  comp._state.prevClk = clk;
  if (clrn === 0) {
    comp._state.acc = 0;
  } else if (rising) {
    const a = comp._state.acc;
    const bMasked = b & m; // mask B by M
    let result;
    // Simplified operation based on S select:
    switch (s & 0xF) {
      case 0x0: result = (~a) & 0xF; break;        // F = NOT A
      case 0x1: result = (~a | bMasked) & 0xF; break; // F = NOT A OR B
      case 0x3: result = 0xFF; break;              // F = all 1s
      case 0x5: result = bMasked; break;           // F = B
      case 0x6: result = (a ^ bMasked) & 0xF; break; // F = A XOR B
      case 0x9: result = (~(a ^ bMasked)) & 0xF; break; // F = XNOR
      case 0xA: result = bMasked; break;           // F = B (copy)
      case 0xC: result = 0x0; break;               // F = all 0s
      case 0xF: result = a; break;                 // F = A (hold)
      default:
        // Addition: A + B·M + Cn
        result = (a + bMasked + cn) & 0x1F;
    }
    comp._state.acc = result & 0xF;
  }
  const f = comp._state.acc;
  for (let i = 0; i < 4; i++) {
    if (this._drivePinBit(comp, gate.outputs[i], (f >> i) & 1)) changed = true;
  }
  // Cn4 and OVR simplified carry/overflow
  const sum = (comp._state.acc + b) & 0x1F;
  if (this._drivePinBit(comp, gate.outputs[4], (sum >> 4) & 1)) changed = true; // Cn4
  if (this._drivePinBit(comp, gate.outputs[5], 0)) changed = true; // OVR simplified
  return changed;
}

function _evaluateCarryLookaheadSel_fn(comp, gate) {
  // 74282: look-ahead carry generator with selectable carry inputs.
  // inputs: [P0,G0,P1,G1,P2,G2,P3,G3, Cn, SEL, P_in, G_in]
  // outputs: [Cn4, Cn8, Cn12, P, G]
  // SEL=0: use Cn as carry input; SEL=1: use P_in/G_in cascade
  const bits = this._readGateInputs(comp, gate.inputs);
  const [p0,g0,p1,g1,p2,g2,p3,g3, cn, sel, p_in, g_in] = bits;
  // Effective carry in
  const cin = sel ? (g_in | (p_in & cn)) : cn;
  // Standard carry lookahead: Cn+1 = G + P·Cn
  const c1 = g0 | (p0 & cin);
  const c2 = g1 | (p1 & c1);
  const c3 = g2 | (p2 & c2);
  const c4 = g3 | (p3 & c3);
  // Group propagate and generate
  const pg = p0 & p1 & p2 & p3;
  const gg = g3 | (p3 & g2) | (p3 & p2 & g1) | (p3 & p2 & p1 & g0);
  let changed = false;
  if (this._drivePinBit(comp, gate.outputs[0], c4))  changed = true; // Cn4
  if (this._drivePinBit(comp, gate.outputs[1], 0))   changed = true; // Cn8 (would need 2nd group)
  if (this._drivePinBit(comp, gate.outputs[2], 0))   changed = true; // Cn12
  if (this._drivePinBit(comp, gate.outputs[3], pg))  changed = true; // P
  if (this._drivePinBit(comp, gate.outputs[4], gg))  changed = true; // G
  return changed;
}

function _evaluateMult4x4BitHi_fn(comp, gate) {
  // 74284: 4×4 multiplier high-order product bits (P4-P7).
  // inputs: [A0,A1,A2,A3, B0,B1,B2,B3]
  // outputs: [P4,P5,P6,P7]
  const bits = this._readGateInputs(comp, gate.inputs);
  const a = bits[0] | (bits[1]<<1) | (bits[2]<<2) | (bits[3]<<3);
  const b = bits[4] | (bits[5]<<1) | (bits[6]<<2) | (bits[7]<<3);
  const p = (a * b) & 0xFF;
  let changed = false;
  for (let i = 0; i < 4; i++) {
    if (this._drivePinBit(comp, gate.outputs[i], (p >> (i + 4)) & 1)) changed = true;
  }
  return changed;
}

function _evaluateMult4x4BitLo_fn(comp, gate) {
  // 74285: 4×4 multiplier low-order product bits (P0-P3).
  // inputs: [A0,A1,A2,A3, B0,B1,B2,B3]
  // outputs: [P0,P1,P2,P3]
  const bits = this._readGateInputs(comp, gate.inputs);
  const a = bits[0] | (bits[1]<<1) | (bits[2]<<2) | (bits[3]<<3);
  const b = bits[4] | (bits[5]<<1) | (bits[6]<<2) | (bits[7]<<3);
  const p = (a * b) & 0xFF;
  let changed = false;
  for (let i = 0; i < 4; i++) {
    if (this._drivePinBit(comp, gate.outputs[i], (p >> i) & 1)) changed = true;
  }
  return changed;
}

// ── Assign Block 18 evaluators to CircuitSimulator.prototype ─────────────────
chipEvaluators._evaluateBufferComp       = _evaluateBufferComp_fn;
chipEvaluators._evaluateDLatchHexTri     = _evaluateDLatchHexTri_fn;
chipEvaluators._evaluateCounter8BitBidir = _evaluateCounter8BitBidir_fn;
chipEvaluators._evaluateMult4x4BitTri    = _evaluateMult4x4BitTri_fn;
chipEvaluators._evaluateWallaceTree7Bit  = _evaluateWallaceTree7Bit_fn;
chipEvaluators._evaluateJKFFQuadSepClk   = _evaluateJKFFQuadSepClk_fn;
chipEvaluators._evaluatePriorityReg4Bit  = _evaluatePriorityReg4Bit_fn;
chipEvaluators._evaluateSRLatchNorNand   = _evaluateSRLatchNorNand_fn;
chipEvaluators._evaluateParity9BitSimple = _evaluateParity9BitSimple_fn;
chipEvaluators._evaluateAccumulator4Bit  = _evaluateAccumulator4Bit_fn;
chipEvaluators._evaluateCarryLookaheadSel = _evaluateCarryLookaheadSel_fn;
chipEvaluators._evaluateMult4x4BitHi     = _evaluateMult4x4BitHi_fn;
chipEvaluators._evaluateMult4x4BitLo     = _evaluateMult4x4BitLo_fn;

// ── Block 19 evaluator functions ─────────────────────────────────────────────

function _evaluateParity9BitPE_fn(comp, gate) {
  // 74286: 9 bit parity generator/checker with parity enable (PE).
  // inputs: [A,B,C,D,E,F,G,H,I,PE]
  // outputs: [EVEN, ODD]
  // Computes parity over all 9 data inputs XOR'd; PE controls EVEN/ODD polarity.
  // When PE=0: EVEN=1 means even parity; when PE=1: polarity flipped.
  const bits = this._readGateInputs(comp, gate.inputs);
  const [a,b,c,d,e,f,g,h,i,pe] = bits;
  const parSum = a ^ b ^ c ^ d ^ e ^ f ^ g ^ h ^ i;
  const evenOut = parSum ^ pe ? 0 : 1;  // EVEN asserted when total parity (with PE) is even
  const oddOut  = evenOut ? 0 : 1;
  let changed = false;
  if (this._drivePinBit(comp, gate.outputs[0], evenOut)) changed = true;
  if (this._drivePinBit(comp, gate.outputs[1], oddOut))  changed = true;
  return changed;
}



function _evaluateRam16x4OcInv_fn(comp, gate) {
  // 74289: 16×4 static RAM, open-collector, inverted outputs.
  // inputs: [A0,A1,A2,A3,CSn,WEn,D0,D1,D2,D3]
  // outputs: [Q0n,Q1n,Q2n,Q3n]
  const bits = this._readGateInputs(comp, gate.inputs);
  const csn = bits[4], wen = bits[5];
  if (!comp.state) comp.state = {};
  if (!comp.state.ram) comp.state.ram = new Uint8Array(16);
  const addr = bits[0] | (bits[1]<<1) | (bits[2]<<2) | (bits[3]<<3);
  let changed = false;
  if (csn !== 0) {
    // Not selected: outputs float high (open-collector not driven → HiZ / pulled up)
    for (const op of gate.outputs) { if (this._drivePinHighZ(comp, op)) changed = true; }
    return changed;
  }
  if (wen === 0) {
    // Write: store data (non-inverted)
    const d = bits[6] | (bits[7]<<1) | (bits[8]<<2) | (bits[9]<<3);
    comp.state.ram[addr] = d & 0xF;
  }
  // Read: inverted outputs
  const val = comp.state.ram[addr] & 0xF;
  for (let i = 0; i < 4; i++) {
    if (this._drivePinBit(comp, gate.outputs[i], ((val >> i) & 1) ? 0 : 1)) changed = true;
  }
  return changed;
}

function _evaluateCounterDecadeDiv_fn(comp, gate) {
  // 74290: Decade counter with separate ÷2 (CLK_A→QA) and ÷5 (CLK_B→QB,QC,QD) sections.
  // inputs: [CLK_A, CLK_B, R01, R02, R91, R92]
  // outputs: [QA, QB, QC, QD]
  const bits = this._readGateInputs(comp, gate.inputs);
  const [clkA, clkB, r01, r02, r91, r92] = bits;
  if (!comp.state) comp.state = {};
  if (comp.state.qa === undefined) { comp.state.qa = 0; comp.state.div5 = 0; }
  if (typeof comp.state.prevClkA === 'undefined') comp.state.prevClkA = 1;
  if (typeof comp.state.prevClkB === 'undefined') comp.state.prevClkB = 1;
  let changed = false;

  // Async reset/set takes priority
  if (r01 && r02) {
    comp.state.qa = 0; comp.state.div5 = 0;
  } else if (r91 && r92) {
    comp.state.qa = 1; comp.state.div5 = 4; // BCD 9 = QD=1,QC=0,QB=0,QA=1 → div5=4 gives QD=1
  } else {
    // ÷2 section: QA toggles on falling edge of CLK_A
    if (comp.state.prevClkA === 1 && clkA === 0) {
      comp.state.qa ^= 1;
    }
    // ÷5 section: QB,QC,QD cycle 0-4 on falling edge of CLK_B
    if (comp.state.prevClkB === 1 && clkB === 0) {
      comp.state.div5 = (comp.state.div5 + 1) % 5;
    }
  }
  comp.state.prevClkA = clkA;
  comp.state.prevClkB = clkB;

  // QB,QC,QD from div5 counter (binary 0..4)
  const qa = comp.state.qa;
  const q5 = comp.state.div5;
  const qb = (q5 >> 0) & 1;
  const qc = (q5 >> 1) & 1;
  const qd = (q5 >> 2) & 1;

  if (this._drivePinBit(comp, gate.outputs[0], qa)) changed = true;
  if (this._drivePinBit(comp, gate.outputs[1], qb)) changed = true;
  if (this._drivePinBit(comp, gate.outputs[2], qc)) changed = true;
  if (this._drivePinBit(comp, gate.outputs[3], qd)) changed = true;
  return changed;
}

function _evaluateFreqDivProg_fn(comp, gate) {
  // 74292/74294: Programmable frequency divider.
  // inputs: [CLK, S0..S9]  (S0-S9 select divisor 1..1024)
  // outputs: [OUT]
  // Divides CLK by (N+1) where N = binary value of S0..S9.
  // OUT toggles after N+1 input pulses (50% duty when divisor even).
  const bits = this._readGateInputs(comp, gate.inputs);
  const clk = bits[0];
  let n = 0;
  for (let i = 0; i < 10; i++) n |= (bits[1+i] << i);
  const divisor = n + 1;
  if (!comp.state) comp.state = { cnt: 0, out: 0, prevClk: clk };
  let changed = false;
  if (comp.state.prevClk === 1 && clk === 0) {
    comp.state.cnt++;
    if (comp.state.cnt >= divisor) {
      comp.state.cnt = 0;
      comp.state.out ^= 1;
    }
  }
  comp.state.prevClk = clk;
  if (this._drivePinBit(comp, gate.outputs[0], comp.state.out)) changed = true;
  return changed;
}

function _evaluateFreqDivProg12Bit_fn(comp, gate) {
  // TC74HC7292AP: 12 bit programmable frequency divider.
  // inputs: [CLK, D0..D11]  (D0-D11 select divisor 1..4096)
  // outputs: [OUT]
  // Divides CLK by (N+1) where N = binary value of D0..D11.
  // OUT toggles after N+1 falling CLK edges (50% duty when divisor is even).
  const bits = this._readGateInputs(comp, gate.inputs);
  const clk = bits[0];
  let n = 0;
  for (let i = 0; i < 12; i++) n |= (bits[1 + i] << i);
  const divisor = n + 1;
  if (!comp.state) comp.state = { cnt: 0, out: 0, prevClk: clk };
  let changed = false;
  if (comp.state.prevClk === 1 && clk === 0) {
    comp.state.cnt++;
    if (comp.state.cnt >= divisor) {
      comp.state.cnt = 0;
      comp.state.out ^= 1;
    }
  }
  comp.state.prevClk = clk;
  if (this._drivePinBit(comp, gate.outputs[0], comp.state.out)) changed = true;
  return changed;
}

function _evaluateCounter4BitDiv_fn(comp, gate) {
  // 74293: 4 bit binary counter with separate ÷2 (CLK_A→QA) and ÷8 (CLK_B→QB,QC,QD) sections.
  // inputs: [CLK_A, CLK_B, R01, R02]
  // outputs: [QA, QB, QC, QD]
  const bits = this._readGateInputs(comp, gate.inputs);
  const [clkA, clkB, r01, r02] = bits;
  if (!comp.state) comp.state = {};
  if (comp.state.qa === undefined) { comp.state.qa = 0; comp.state.div8 = 0; }
  if (typeof comp.state.prevClkA === 'undefined') comp.state.prevClkA = 1;
  if (typeof comp.state.prevClkB === 'undefined') comp.state.prevClkB = 1;
  let changed = false;

  if (r01 && r02) {
    comp.state.qa = 0; comp.state.div8 = 0;
  } else {
    if (comp.state.prevClkA === 1 && clkA === 0) {
      comp.state.qa ^= 1;
    }
    if (comp.state.prevClkB === 1 && clkB === 0) {
      comp.state.div8 = (comp.state.div8 + 1) & 0x7;
    }
  }
  comp.state.prevClkA = clkA;
  comp.state.prevClkB = clkB;

  const qa = comp.state.qa;
  const q8 = comp.state.div8;
  if (this._drivePinBit(comp, gate.outputs[0], qa)) changed = true;
  if (this._drivePinBit(comp, gate.outputs[1], (q8 >> 0) & 1)) changed = true;
  if (this._drivePinBit(comp, gate.outputs[2], (q8 >> 1) & 1)) changed = true;
  if (this._drivePinBit(comp, gate.outputs[3], (q8 >> 2) & 1)) changed = true;
  return changed;
}

function _evaluateShiftReg4BitBidirTri_fn(comp, gate) {
  // 74295: 4 bit bidirectional shift register with tri-state outputs.
  // inputs: [SER, A, B, C, D, MODE, CLK, OEn]
  // outputs: [QA, QB, QC, QD]
  // MODE=0: shift right (QA←SER, QB←QA,...); MODE=1: parallel load (QA←A,...).
  // OEn=1: outputs HiZ.
  const bits = this._readGateInputs(comp, gate.inputs);
  const [ser, a, b, c, d, mode, clk, oen] = bits;
  if (!comp.state) comp.state = { reg: 0, prevClk: 1 };
  let changed = false;

  if (comp.state.prevClk === 0 && clk === 1) {
    // Rising edge
    if (mode === 1) {
      // Parallel load
      comp.state.reg = (a | (b<<1) | (c<<2) | (d<<3)) & 0xF;
    } else {
      // Shift right: new MSB = ser
      comp.state.reg = ((comp.state.reg >> 1) | (ser << 3)) & 0xF;
    }
  }
  comp.state.prevClk = clk;

  if (oen !== 0) {
    for (const op of gate.outputs) { if (this._drivePinHighZ(comp, op)) changed = true; }
    return changed;
  }
  for (let i = 0; i < 4; i++) {
    if (this._drivePinBit(comp, gate.outputs[i], (comp.state.reg >> i) & 1)) changed = true;
  }
  return changed;
}

function _evaluatePllFilter_fn(comp, gate) {
  // 74297: Digital PLL filter simplified stub.
  // inputs: [CLK_IN, REF, K1,K2,K3,K4, N1,N2,N3,N4, V_IN]
  // outputs: [CLK_OUT, UP_DN]
  // Stub: CLK_OUT = CLK_IN through a ÷K divider; UP_DN = phase compare of REF vs CLK_OUT.
  const bits = this._readGateInputs(comp, gate.inputs);
  const clkIn = bits[0], ref = bits[1];
  const k = 1 + (bits[2] | (bits[3]<<1) | (bits[4]<<2) | (bits[5]<<3));
  if (!comp.state) comp.state = { cnt: 0, out: 0, prevClk: clkIn, prevRef: 1, phase: 0 };
  let changed = false;

  // Divide CLK_IN by k
  if (comp.state.prevClk === 1 && clkIn === 0) {
    comp.state.cnt++;
    if (comp.state.cnt >= k) {
      comp.state.cnt = 0;
      comp.state.out ^= 1;
      // Phase accumulate: if out rising and ref is 1, in phase; else drift
      if (comp.state.out === 1) comp.state.phase += (ref ? 0 : 1);
    }
  }
  comp.state.prevClk = clkIn;

  const upDn = (comp.state.phase & 1);
  if (this._drivePinBit(comp, gate.outputs[0], comp.state.out)) changed = true;
  if (this._drivePinBit(comp, gate.outputs[1], upDn))           changed = true;
  return changed;
}

function _evaluateMuxQuad2to1Stored_fn(comp, gate) {
  // 74298: Quad 2-to-1 MUX with clocked storage.
  // inputs: [A1,B1, A2,B2, A3,B3, A4,B4, SEL, CLK]
  // outputs: [Q1, Q2, Q3, Q4]
  // On rising CLK: Q[i] = SEL ? B[i] : A[i]
  const bits = this._readGateInputs(comp, gate.inputs);
  const [a1,b1,a2,b2,a3,b3,a4,b4,sel,clk] = bits;
  if (!comp.state) comp.state = { q: [0,0,0,0], prevClk: 0 };
  let changed = false;

  if (comp.state.prevClk === 0 && clk === 1) {
    comp.state.q[0] = sel ? b1 : a1;
    comp.state.q[1] = sel ? b2 : a2;
    comp.state.q[2] = sel ? b3 : a3;
    comp.state.q[3] = sel ? b4 : a4;
  }
  comp.state.prevClk = clk;

  for (let i = 0; i < 4; i++) {
    if (this._drivePinBit(comp, gate.outputs[i], comp.state.q[i])) changed = true;
  }
  return changed;
}

function _evaluateShiftReg8BitUnivTri_fn(comp, gate) {
  // 74299: 8 bit universal bidirectional shift/storage register, tri-state.
  // inputs: [S0,S1, SR,SL, OEAn,OEBn, QA,QB,QC,QD,QE,QF,QG,QH, CLK]
  //   S0,S1: 00=hold, 01=shift right, 10=shift left, 11=parallel load
  //   SR: serial input for right-shift (into QH end)
  //   SL: serial input for left-shift (into QA end)
  //   QA-QH are also parallel data inputs during load (S1S0=11)
  //   OEAn/OEBn: enable outputs (both must be 0 to output)
  //   In parallel-load mode (11), I/O pins are inputs; tri-state the outputs so
  //   external drivers can set the pin values before clock edge.
  // outputs: [QA,QB,QC,QD,QE,QF,QG,QH]
  const bits = this._readGateInputs(comp, gate.inputs);
  const [s0,s1,sr,sl,oeAn,oeBn,qa_in,qb_in,qc_in,qd_in,qe_in,qf_in,qg_in,qh_in,clk] = bits;
  if (!comp.state) comp.state = { reg: 0, prevClk: 0 };
  let changed = false;
  const mode = (s1 << 1) | s0;

  if (comp.state.prevClk === 0 && clk === 1) {
    const cur = comp.state.reg;
    switch (mode) {
      case 0: break; // hold
      case 1: // shift right: QH←SR, rest shift
        comp.state.reg = ((cur >> 1) | (sr << 7)) & 0xFF;
        break;
      case 2: // shift left: QA←SL, rest shift
        comp.state.reg = ((cur << 1) | sl) & 0xFF;
        break;
      case 3: // parallel load capture whatever is on the I/O pins
        comp.state.reg = (qa_in | (qb_in<<1) | (qc_in<<2) | (qd_in<<3) |
                          (qe_in<<4) | (qf_in<<5) | (qg_in<<6) | (qh_in<<7)) & 0xFF;
        break;
    }
  }
  comp.state.prevClk = clk;

  // When in parallel-load mode, the I/O pins act as external inputs do NOT
  // drive them; leave them as they were (externally driven) so they can be read.
  if (mode === 3) {
    return changed;
  }

  if (oeAn !== 0 || oeBn !== 0) {
    for (const op of gate.outputs) { if (this._drivePinHighZ(comp, op)) changed = true; }
    return changed;
  }
  for (let i = 0; i < 8; i++) {
    if (this._drivePinBit(comp, gate.outputs[i], (comp.state.reg >> i) & 1)) changed = true;
  }
  return changed;
}

function _evaluateRam256x1OC_fn(comp, gate) {
  // 74300/74301/74302: 256×1 static RAM, open-collector output.
  // inputs: [A0,A1,A2,A3,A4,A5,A6,A7, WEn, CSn, DI]
  // outputs: [DO]
  const bits = this._readGateInputs(comp, gate.inputs);
  const wen = bits[8], csn = bits[9], di = bits[10];
  if (!comp.state) comp.state = {};
  if (!comp.state.ram) comp.state.ram = new Uint8Array(32); // 256 bits packed
  const addr = bits[0] | (bits[1]<<1) | (bits[2]<<2) | (bits[3]<<3) |
               (bits[4]<<4) | (bits[5]<<5) | (bits[6]<<6) | (bits[7]<<7);
  let changed = false;
  if (csn !== 0) {
    if (this._drivePinHighZ(comp, gate.outputs[0])) changed = true;
    return changed;
  }
  if (wen === 0) {
    const byteIdx = addr >> 3;
    const bitIdx  = addr & 7;
    if (di) comp.state.ram[byteIdx] |=  (1 << bitIdx);
    else    comp.state.ram[byteIdx] &= ~(1 << bitIdx);
  }
  const byteIdx = addr >> 3;
  const bitIdx  = addr & 7;
  const val = (comp.state.ram[byteIdx] >> bitIdx) & 1;
  if (this._drivePinBit(comp, gate.outputs[0], val)) changed = true;
  return changed;
}

function _evaluateClkDiv2Oct_fn(comp, gate) {
  // 74303: Octal ÷2 clock driver.
  // inputs: [CLK1..CLK8]
  // outputs: [Q3,Q4,Q5,Q6,Q7n,Q8]  (Q7 output is inverted)
  // Each CLK toggles its Q on falling edges; Q7n is inverted output of section 7.
  const bits = this._readGateInputs(comp, gate.inputs);
  if (!comp.state) comp.state = {};
  if (!comp.state.q) comp.state.q = new Uint8Array(8);
  if (!comp.state.prev) comp.state.prev = new Uint8Array(8).fill(1);
  let changed = false;

  for (let i = 0; i < 8; i++) {
    if (comp.state.prev[i] === 1 && bits[i] === 0) {
      comp.state.q[i] ^= 1;
    }
    comp.state.prev[i] = bits[i];
  }

  // gate.outputs: [Q3,Q4,Q5,Q6,Q7n,Q8] → sections 2,3,4,5,6,7 (0-indexed)
  const outMap = [2,3,4,5,6,7];
  const invIdx = 4; // Q7n at output index 4 is inverted
  for (let oi = 0; oi < gate.outputs.length; oi++) {
    let val = comp.state.q[outMap[oi]];
    if (oi === invIdx) val ^= 1; // Q7n is inverted
    if (this._drivePinBit(comp, gate.outputs[oi], val)) changed = true;
  }
  return changed;
}

// ── Assign Block 19 evaluators to CircuitSimulator.prototype ─────────────────
chipEvaluators._evaluateParity9BitPE        = _evaluateParity9BitPE_fn;
chipEvaluators._evaluateRam16x4OcInv        = _evaluateRam16x4OcInv_fn;
chipEvaluators._evaluateCounterDecadeDiv    = _evaluateCounterDecadeDiv_fn;
chipEvaluators._evaluateFreqDivProg         = _evaluateFreqDivProg_fn;
chipEvaluators._evaluateFreqDivProg12Bit    = _evaluateFreqDivProg12Bit_fn;
chipEvaluators._evaluateCounter4BitDiv      = _evaluateCounter4BitDiv_fn;
chipEvaluators._evaluateShiftReg4BitBidirTri = _evaluateShiftReg4BitBidirTri_fn;
chipEvaluators._evaluatePllFilter           = _evaluatePllFilter_fn;
chipEvaluators._evaluateMuxQuad2to1Stored   = _evaluateMuxQuad2to1Stored_fn;
chipEvaluators._evaluateShiftReg8BitUnivTri = _evaluateShiftReg8BitUnivTri_fn;
chipEvaluators._evaluateRam256x1OC          = _evaluateRam256x1OC_fn;
chipEvaluators._evaluateClkDiv2Oct          = _evaluateClkDiv2Oct_fn;

// ── Block 20 evaluator functions ─────────────────────────────────────────────

function _evaluateClkDiv2Oct4Inv_fn(comp, gate) {
  // 74305: Octal ÷2 clock driver, lower 4 outputs normal, upper 4 inverted.
  // inputs: [CLK1..CLK8]
  // outputs: [Q3,Q4, Q5n,Q6n,Q7n,Q8n]  (Q5-Q8 outputs are inverted)
  const bits = this._readGateInputs(comp, gate.inputs);
  if (!comp.state) comp.state = {};
  if (!comp.state.q) comp.state.q = new Uint8Array(8);
  if (!comp.state.prev) comp.state.prev = new Uint8Array(8).fill(1);
  let changed = false;

  for (let i = 0; i < 8; i++) {
    if (comp.state.prev[i] === 1 && bits[i] === 0) comp.state.q[i] ^= 1;
    comp.state.prev[i] = bits[i];
  }

  // gate.outputs: [Q3,Q4,Q5n,Q6n,Q7n,Q8n] → sections 2,3,4,5,6,7
  const outMap = [2,3,4,5,6,7];
  for (let oi = 0; oi < gate.outputs.length; oi++) {
    let val = comp.state.q[outMap[oi]];
    if (oi >= 2) val ^= 1; // Q5n..Q8n are inverted (output indices 2-5)
    if (this._drivePinBit(comp, gate.outputs[oi], val)) changed = true;
  }
  return changed;
}

function _evaluateBusXcvr8BitGtl_fn(comp, gate) {
  // 74306: 8 bit bus transceiver LV-TTL ↔ GTL+.
  // inputs: [OEn, DIR, A1..A8]
  // outputs: [B1..B8]
  // DIR=0: A→B (A side to B side); DIR=1: B→A (stub, outputs HiZ).
  // OEn=1: all outputs HiZ.
  const bits = this._readGateInputs(comp, gate.inputs);
  const oen = bits[0], dir = bits[1];
  let changed = false;
  if (oen !== 0 || dir !== 0) {
    for (const op of gate.outputs) { if (this._drivePinHighZ(comp, op)) changed = true; }
    return changed;
  }
  for (let i = 0; i < 8; i++) {
    if (this._drivePinBit(comp, gate.outputs[i], bits[2+i])) changed = true;
  }
  return changed;
}

function _evaluateRam1024x1OC_fn(comp, gate) {
  // 74309/74314/74315: 1024×1 RAM, open-collector.
  // inputs: [A0..A9, WEn, CSn, DI]
  // outputs: [DO]
  const bits = this._readGateInputs(comp, gate.inputs);
  const wen = bits[10], csn = bits[11], di = bits[12];
  if (!comp.state) comp.state = {};
  if (!comp.state.ram) comp.state.ram = new Uint8Array(128); // 1024 bits packed
  const addr = bits[0] | (bits[1]<<1) | (bits[2]<<2) | (bits[3]<<3) |
               (bits[4]<<4) | (bits[5]<<5) | (bits[6]<<6) | (bits[7]<<7) |
               (bits[8]<<8) | (bits[9]<<9);
  let changed = false;
  if (csn !== 0) {
    if (this._drivePinHighZ(comp, gate.outputs[0])) changed = true;
    return changed;
  }
  if (wen === 0) {
    const byteIdx = addr >> 3, bitIdx = addr & 7;
    if (di) comp.state.ram[byteIdx] |=  (1 << bitIdx);
    else    comp.state.ram[byteIdx] &= ~(1 << bitIdx);
  }
  const byteIdx = addr >> 3, bitIdx = addr & 7;
  const val = (comp.state.ram[byteIdx] >> bitIdx) & 1;
  if (this._drivePinBit(comp, gate.outputs[0], val)) changed = true;
  return changed;
}

function _evaluateBufferOctInvStTri_fn(comp, gate) {
  // 74310: Octal inverting buffer, Schmitt trigger inputs, tri-state.
  // inputs: [A1..A8, OE1n, OE2n]
  // outputs: [Y1..Y8]
  // OE1n=0 → enables lower 4; OE2n=0 → enables upper 4; each when 0.
  const bits = this._readGateInputs(comp, gate.inputs);
  const [a1,a2,a3,a4,a5,a6,a7,a8,oe1n,oe2n] = bits;
  const a = [a1,a2,a3,a4,a5,a6,a7,a8];
  const oe = [oe1n,oe1n,oe1n,oe1n,oe2n,oe2n,oe2n,oe2n];
  let changed = false;
  for (let i = 0; i < 8; i++) {
    if (oe[i] !== 0) {
      if (this._drivePinHighZ(comp, gate.outputs[i])) changed = true;
    } else {
      if (this._drivePinBit(comp, gate.outputs[i], a[i] ? 0 : 1)) changed = true;
    }
  }
  return changed;
}

function _evaluateRam16x9LatchOC_fn(comp, gate) {
  // 74311: 16×9 RAM with output latch, OC. Simplified: single packed Q output.
  // inputs: [A0..A3, WEn, CSn, OEn, LE, D0..D8]
  // outputs: [Q]  (9 bit, but single pin outputs a compound number; simplified to D0)
  // In reality it has 9 separate Q pins; here we model a simplified version.
  const bits = this._readGateInputs(comp, gate.inputs);
  const [a0,a1,a2,a3,wen,csn,oen,le,...dataAndQ] = bits;
  const d = dataAndQ.slice(0,9); // D0..D8
  if (!comp.state) comp.state = { ram: [], latch: 0 };
  if (!comp.state.ram) comp.state.ram = new Array(16).fill(0);
  const addr = a0 | (a1<<1) | (a2<<2) | (a3<<3);
  let changed = false;

  if (csn === 0 && wen === 0) {
    let val = 0;
    for (let i = 0; i < 9; i++) val |= (d[i] << i);
    comp.state.ram[addr] = val;
  }
  if (le) comp.state.latch = comp.state.ram[addr] || 0;

  if (oen !== 0) {
    if (this._drivePinHighZ(comp, gate.outputs[0])) changed = true;
    return changed;
  }
  // Drive Q as bit 0 of the latched word
  const q = comp.state.latch & 1;
  if (this._drivePinBit(comp, gate.outputs[0], q)) changed = true;
  return changed;
}

function _evaluateRam16x9OC_fn(comp, gate) {
  // 74312: 16×9 RAM, OC. Similar to 74311 without latch.
  // inputs: [A0..A3, WEn, CSn, OEn, D0..D8]
  // outputs: [Q]
  const bits = this._readGateInputs(comp, gate.inputs);
  const [a0,a1,a2,a3,wen,csn,oen,...data] = bits;
  const d = data.slice(0,9);
  if (!comp.state) comp.state = {};
  if (!comp.state.ram) comp.state.ram = new Array(16).fill(0);
  const addr = a0 | (a1<<1) | (a2<<2) | (a3<<3);
  let changed = false;

  if (csn === 0 && wen === 0) {
    let val = 0;
    for (let i = 0; i < 9; i++) val |= (d[i] << i);
    comp.state.ram[addr] = val;
  }
  if (oen !== 0) {
    if (this._drivePinHighZ(comp, gate.outputs[0])) changed = true;
    return changed;
  }
  const q = comp.state.ram[addr] & 1;
  if (this._drivePinBit(comp, gate.outputs[0], q)) changed = true;
  return changed;
}

function _evaluateRam16x12OC_fn(comp, gate) {
  // 74313: 16×12 RAM, OC. No output pin in gate definition.
  // inputs: [A0..A3, WEn, CSn, OEn, D0..D10]
  // outputs: [] (no output pin specified in the chip gate)
  const bits = this._readGateInputs(comp, gate.inputs);
  const [a0,a1,a2,a3,wen,csn,oen,...data] = bits;
  if (!comp.state) comp.state = {};
  if (!comp.state.ram) comp.state.ram = new Array(16).fill(0);
  const addr = a0 | (a1<<1) | (a2<<2) | (a3<<3);
  if (csn === 0 && wen === 0) {
    let val = 0;
    for (let i = 0; i < 12 && i < data.length; i++) val |= ((data[i]||0) << i);
    comp.state.ram[addr] = val;
  }
  return false;
}

function _evaluateRam64x4CmnOC_fn(comp, gate) {
  // 74316: 64×4 RAM, common I/O lines, OC.
  // inputs: [A0..A5, WEn, CSn, D0, D1, IO0..IO3]
  // outputs: [IO0..IO3]
  // Common I/O: on read, IO pins driven; on write, IO pins HiZ (input).
  const bits = this._readGateInputs(comp, gate.inputs);
  const [a0,a1,a2,a3,a4,a5,wen,csn,d0,d1,io0,io1,io2,io3] = bits;
  if (!comp.state) comp.state = {};
  if (!comp.state.ram) comp.state.ram = new Uint8Array(64);
  const addr = a0 | (a1<<1) | (a2<<2) | (a3<<3) | (a4<<4) | (a5<<5);
  let changed = false;
  if (csn !== 0) {
    for (const op of gate.outputs) { if (this._drivePinHighZ(comp, op)) changed = true; }
    return changed;
  }
  if (wen === 0) {
    // Write from IO pins
    comp.state.ram[addr] = (io0 | (io1<<1) | (io2<<2) | (io3<<3)) & 0xF;
    // HiZ outputs during write
    for (const op of gate.outputs) { if (this._drivePinHighZ(comp, op)) changed = true; }
    return changed;
  }
  // Read
  const val = comp.state.ram[addr];
  for (let i = 0; i < 4; i++) {
    if (this._drivePinBit(comp, gate.outputs[i], (val >> i) & 1)) changed = true;
  }
  return changed;
}

function _evaluateRam64x4OC_fn(comp, gate) {
  // 74317: 64×4 RAM, separate I/O, OC.
  // inputs: [A0..A5, WEn, CSn, D0..D3]
  // outputs: [Q0..Q3]
  const bits = this._readGateInputs(comp, gate.inputs);
  const [a0,a1,a2,a3,a4,a5,wen,csn,d0,d1,d2,d3] = bits;
  if (!comp.state) comp.state = {};
  if (!comp.state.ram) comp.state.ram = new Uint8Array(64);
  const addr = a0 | (a1<<1) | (a2<<2) | (a3<<3) | (a4<<4) | (a5<<5);
  let changed = false;
  if (csn !== 0) {
    for (const op of gate.outputs) { if (this._drivePinHighZ(comp, op)) changed = true; }
    return changed;
  }
  if (wen === 0) {
    comp.state.ram[addr] = (d0 | (d1<<1) | (d2<<2) | (d3<<3)) & 0xF;
  }
  const val = comp.state.ram[addr];
  for (let i = 0; i < 4; i++) {
    if (this._drivePinBit(comp, gate.outputs[i], (val >> i) & 1)) changed = true;
  }
  return changed;
}

function _evaluateRam32x8OC_fn(comp, gate) {
  // 74318: 32×8 RAM, OC. Has 3 output pins (Q5,Q6,Q7) in gate definition;
  // simplified to drive only Q5/Q6/Q7 as the visible output bits.
  // inputs: [A0..A4, WEn, CSn, D0..D7]
  // outputs: [Q5,Q6,Q7]
  const bits = this._readGateInputs(comp, gate.inputs);
  const [a0,a1,a2,a3,a4,wen,csn,d0,d1,d2,d3,d4,d5,d6,d7] = bits;
  if (!comp.state) comp.state = {};
  if (!comp.state.ram) comp.state.ram = new Uint8Array(32);
  const addr = a0 | (a1<<1) | (a2<<2) | (a3<<3) | (a4<<4);
  let changed = false;
  if (csn !== 0) {
    for (const op of gate.outputs) { if (this._drivePinHighZ(comp, op)) changed = true; }
    return changed;
  }
  if (wen === 0) {
    comp.state.ram[addr] = (d0 | (d1<<1) | (d2<<2) | (d3<<3) |
                            (d4<<4) | (d5<<5) | (d6<<6) | (d7<<7)) & 0xFF;
  }
  const val = comp.state.ram[addr];
  // Outputs Q5,Q6,Q7 = bits 5,6,7
  if (this._drivePinBit(comp, gate.outputs[0], (val >> 5) & 1)) changed = true;
  if (this._drivePinBit(comp, gate.outputs[1], (val >> 6) & 1)) changed = true;
  if (this._drivePinBit(comp, gate.outputs[2], (val >> 7) & 1)) changed = true;
  return changed;
}

function _evaluateRam16x4OC_fn(comp, gate) {
  // 74319: 16×4 RAM, OC. Non-inverted outputs (unlike 74289).
  // inputs: [A0..A3, CSn, WEn, D0..D3]
  // outputs: [Q0..Q3]
  const bits = this._readGateInputs(comp, gate.inputs);
  const [a0,a1,a2,a3,csn,wen,d0,d1,d2,d3] = bits;
  if (!comp.state) comp.state = {};
  if (!comp.state.ram) comp.state.ram = new Uint8Array(16);
  const addr = a0 | (a1<<1) | (a2<<2) | (a3<<3);
  let changed = false;
  if (csn !== 0) {
    for (const op of gate.outputs) { if (this._drivePinHighZ(comp, op)) changed = true; }
    return changed;
  }
  if (wen === 0) {
    comp.state.ram[addr] = (d0 | (d1<<1) | (d2<<2) | (d3<<3)) & 0xF;
  }
  const val = comp.state.ram[addr];
  for (let i = 0; i < 4; i++) {
    if (this._drivePinBit(comp, gate.outputs[i], (val >> i) & 1)) changed = true;
  }
  return changed;
}

function _evaluateCrystalOsc_fn(comp, gate) {
  // 74320: Crystal-controlled oscillator.
  // Stub: OUT = XTAL1 (pass-through; real behavior requires time-domain sim).
  const bits = this._readGateInputs(comp, gate.inputs);
  let changed = false;
  if (this._drivePinBit(comp, gate.outputs[0], bits[0])) changed = true;
  return changed;
}

function _evaluateCrystalOscDiv_fn(comp, gate) {
  // 74321: Crystal oscillator with F/2 and F/4 outputs.
  // Stub: OUT=XTAL1, F2 = XTAL1 divided by 2 (toggle), F4 = XTAL1/4.
  const bits = this._readGateInputs(comp, gate.inputs);
  const clk = bits[0];
  if (!comp.state) comp.state = { cnt: 0, f2: 0, f4: 0, prevClk: clk };
  let changed = false;
  if (comp.state.prevClk === 1 && clk === 0) {
    comp.state.cnt++;
    if (comp.state.cnt & 1) comp.state.f2 ^= 1;
    if ((comp.state.cnt & 3) === 3) comp.state.f4 ^= 1;
  }
  comp.state.prevClk = clk;
  if (this._drivePinBit(comp, gate.outputs[0], clk)) changed = true;       // OUT
  if (this._drivePinBit(comp, gate.outputs[1], comp.state.f2)) changed = true; // F2
  if (this._drivePinBit(comp, gate.outputs[2], comp.state.f4)) changed = true; // F4
  return changed;
}

// ── Assign Block 20 evaluators to CircuitSimulator.prototype ─────────────────
chipEvaluators._evaluateClkDiv2Oct4Inv      = _evaluateClkDiv2Oct4Inv_fn;
chipEvaluators._evaluateBusXcvr8BitGtl      = _evaluateBusXcvr8BitGtl_fn;
chipEvaluators._evaluateRam1024x1OC         = _evaluateRam1024x1OC_fn;
chipEvaluators._evaluateBufferOctInvStTri   = _evaluateBufferOctInvStTri_fn;
chipEvaluators._evaluateRam16x9LatchOC      = _evaluateRam16x9LatchOC_fn;
chipEvaluators._evaluateRam16x9OC           = _evaluateRam16x9OC_fn;
chipEvaluators._evaluateRam16x12OC          = _evaluateRam16x12OC_fn;
chipEvaluators._evaluateRam64x4CmnOC        = _evaluateRam64x4CmnOC_fn;
chipEvaluators._evaluateRam64x4OC           = _evaluateRam64x4OC_fn;
chipEvaluators._evaluateRam32x8OC           = _evaluateRam32x8OC_fn;
chipEvaluators._evaluateRam16x4OC           = _evaluateRam16x4OC_fn;
chipEvaluators._evaluateCrystalOsc          = _evaluateCrystalOsc_fn;
chipEvaluators._evaluateCrystalOscDiv       = _evaluateCrystalOscDiv_fn;


// ── Block 21 Evaluator Functions ─────────────────────────────────────────────

function _evaluateShiftReg8BitSignExt_fn(comp, gate) {
  // 74322: 8 bit shift register with sign extend, tri-state.
  // inputs: [S, D0-D7, SER, OEn, CLK]
  //   S=0: parallel load, S=1: shift right (sign extend MSB).
  //   SER: serial input (only used when S=0 for serial operation on some versions;
  //        74322 actually uses S=1 for shift, preserving MSB sign bit).
  //   OEn: active low output enable.
  // outputs: [Q0,Q1,Q2,Q3,Q4,Q5,Q6,Q7]
  const bits = this._readGateInputs(comp, gate.inputs);
  const [s, d0,d1,d2,d3,d4,d5,d6,d7, ser, oen, clk] = bits;
  if (!comp.state) comp.state = { reg: 0, prevClk: clk };
  let changed = false;

  if (comp.state.prevClk === 0 && clk === 1) {
    if (s === 0) {
      // Parallel load
      comp.state.reg = (d0|(d1<<1)|(d2<<2)|(d3<<3)|(d4<<4)|(d5<<5)|(d6<<6)|(d7<<7)) & 0xFF;
    } else {
      // Shift right, sign extend (MSB preserved)
      const msb = (comp.state.reg >> 7) & 1;
      comp.state.reg = ((comp.state.reg >> 1) | (msb << 7)) & 0xFF;
    }
  }
  comp.state.prevClk = clk;

  if (oen !== 0) {
    for (const op of gate.outputs) { if (this._drivePinHighZ(comp, op)) changed = true; }
    return changed;
  }
  for (let i = 0; i < 8; i++) {
    if (this._drivePinBit(comp, gate.outputs[i], (comp.state.reg >> i) & 1)) changed = true;
  }
  return changed;
}

function _evaluateShiftReg8BitBidirClrTri_fn(comp, gate) {
  // 74323: 8 bit bidirectional universal shift/storage register, synchronous clear.
  // inputs: [S0,S1, SR,SL, OEAn,OEBn, CLRn,
  //          QA_I,QB_I,QC_I,QD_I,QE_I,QF_I,QG_I,QH_I, CLK]
  //   Mode: 00=hold, 01=shift right, 10=shift left, 11=parallel load.
  //   CLRn=0: synchronous clear on rising edge.
  //   OEAn/OEBn: tri-state enables (both 0 to output).
  // outputs: [QA,QB,QC,QD,QE,QF,QG,QH]
  const bits = this._readGateInputs(comp, gate.inputs);
  const [s0,s1,sr,sl,oeAn,oeBn,clrn,
         qa_i,qb_i,qc_i,qd_i,qe_i,qf_i,qg_i,qh_i,clk] = bits;
  if (!comp.state) comp.state = { reg: 0, prevClk: clk };
  let changed = false;
  const mode = (s1 << 1) | s0;

  if (comp.state.prevClk === 0 && clk === 1) {
    if (clrn === 0) {
      comp.state.reg = 0;
    } else {
      switch (mode) {
        case 0: break; // hold
        case 1: comp.state.reg = ((comp.state.reg >> 1) | (sr << 7)) & 0xFF; break; // shift right
        case 2: comp.state.reg = ((comp.state.reg << 1) | sl) & 0xFF; break; // shift left
        case 3: // parallel load
          comp.state.reg = (qa_i|(qb_i<<1)|(qc_i<<2)|(qd_i<<3)|
                            (qe_i<<4)|(qf_i<<5)|(qg_i<<6)|(qh_i<<7)) & 0xFF;
          break;
      }
    }
  }
  comp.state.prevClk = clk;

  // In parallel load mode, I/O pins act as inputs don't drive them
  if (mode === 3) return changed;

  if (oeAn !== 0 || oeBn !== 0) {
    for (const op of gate.outputs) { if (this._drivePinHighZ(comp, op)) changed = true; }
    return changed;
  }
  for (let i = 0; i < 8; i++) {
    if (this._drivePinBit(comp, gate.outputs[i], (comp.state.reg >> i) & 1)) changed = true;
  }
  return changed;
}

function _evaluateVcoSingleEn_fn(comp, gate) {
  // 74324: VCO (analog). Stub: OUT=EN, OUTn=!EN.
  const bits = this._readGateInputs(comp, gate.inputs);
  const en = bits[0];
  let changed = false;
  if (this._drivePinBit(comp, gate.outputs[0], en)) changed = true;       // OUT
  if (this._drivePinBit(comp, gate.outputs[1], en ? 0 : 1)) changed = true; // OUTn
  return changed;
}

function _evaluateVcoDual_fn(comp, gate) {
  // 74325/74327: Dual VCO. Stub: OUT1=VIN1, OUT1n=!VIN1, OUT2=VIN2, OUT2n=!VIN2.
  const bits = this._readGateInputs(comp, gate.inputs);
  const [vin1, vin2] = bits;
  let changed = false;
  if (this._drivePinBit(comp, gate.outputs[0], vin1)) changed = true;
  if (this._drivePinBit(comp, gate.outputs[1], vin1 ? 0 : 1)) changed = true;
  if (this._drivePinBit(comp, gate.outputs[2], vin2)) changed = true;
  if (this._drivePinBit(comp, gate.outputs[3], vin2 ? 0 : 1)) changed = true;
  return changed;
}

function _evaluateVcoDualEn_fn(comp, gate) {
  // 74326: Dual VCO with enable. Stub: when EN=1 → OUT=VIN, else OUT=0.
  // inputs: [EN1, VIN1, EN2, VIN2]
  const bits = this._readGateInputs(comp, gate.inputs);
  const [en1, vin1, en2, vin2] = bits;
  let changed = false;
  const o1 = en1 ? vin1 : 0;
  const o2 = en2 ? vin2 : 0;
  if (this._drivePinBit(comp, gate.outputs[0], o1)) changed = true;
  if (this._drivePinBit(comp, gate.outputs[1], o1 ? 0 : 1)) changed = true;
  if (this._drivePinBit(comp, gate.outputs[2], o2)) changed = true;
  if (this._drivePinBit(comp, gate.outputs[3], o2 ? 0 : 1)) changed = true;
  return changed;
}

function _evaluatePla12in6outTri_fn(comp, gate) {
  // 74330/74334/74336: PLA stub all outputs = 0 (not programmed).
  // inputs: [OEn, I0..I11]
  // outputs: [F0..F5]
  const bits = this._readGateInputs(comp, gate.inputs);
  const oen = bits[0];
  let changed = false;
  if (oen !== 0) {
    for (const op of gate.outputs) { if (this._drivePinHighZ(comp, op)) changed = true; }
    return changed;
  }
  for (const op of gate.outputs) { if (this._drivePinBit(comp, op, 0)) changed = true; }
  return changed;
}

function _evaluatePla12in6outOC_fn(comp, gate) {
  // 74331/74336: PLA OC stub all outputs = 0 when OEn=0.
  // inputs: [OEn, I0..I11]
  // outputs: [F0..F5]
  const bits = this._readGateInputs(comp, gate.inputs);
  const oen = bits[0];
  let changed = false;
  if (oen !== 0) {
    for (const op of gate.outputs) { if (this._drivePinHighZ(comp, op)) changed = true; }
    return changed;
  }
  for (const op of gate.outputs) { if (this._drivePinBit(comp, op, 0)) changed = true; }
  return changed;
}

function _evaluatePla12in6outSregTri_fn(comp, gate) {
  // 74333/74335: PLA with state registers + clock. Stub: OEn=0 → all outputs 0.
  // inputs: [OEn, CLK, I0..I11]
  // outputs: [F0..F5]
  const bits = this._readGateInputs(comp, gate.inputs);
  const oen = bits[0];
  let changed = false;
  if (oen !== 0) {
    for (const op of gate.outputs) { if (this._drivePinHighZ(comp, op)) changed = true; }
    return changed;
  }
  for (const op of gate.outputs) { if (this._drivePinBit(comp, op, 0)) changed = true; }
  return changed;
}

function _evaluatePla12in6outSregOC_fn(comp, gate) {
  // 74335: PLA OC with state registers. Stub: OEn=0 → all outputs 0.
  const bits = this._readGateInputs(comp, gate.inputs);
  const oen = bits[0];
  let changed = false;
  if (oen !== 0) {
    for (const op of gate.outputs) { if (this._drivePinHighZ(comp, op)) changed = true; }
    return changed;
  }
  for (const op of gate.outputs) { if (this._drivePinBit(comp, op, 0)) changed = true; }
  return changed;
}

function _evaluateClkDriverQuadTri_fn(comp, gate) {
  // 74337: Quad clock driver, tri-state.
  // inputs: [OE1n,CLK1, OE2n,CLK2, OE3n,CLK3, OE4n,CLK4]
  // outputs: [OUT1,OUT1n, OUT2,OUT2n, OUT3,OUT3n, OUT4,OUT4n]
  const bits = this._readGateInputs(comp, gate.inputs);
  let changed = false;
  for (let ch = 0; ch < 4; ch++) {
    const oen = bits[ch * 2];
    const clk = bits[ch * 2 + 1];
    const outIdx = ch * 2;
    if (oen !== 0) {
      if (this._drivePinHighZ(comp, gate.outputs[outIdx])) changed = true;
      if (this._drivePinHighZ(comp, gate.outputs[outIdx + 1])) changed = true;
    } else {
      if (this._drivePinBit(comp, gate.outputs[outIdx], clk)) changed = true;
      if (this._drivePinBit(comp, gate.outputs[outIdx + 1], clk ? 0 : 1)) changed = true;
    }
  }
  return changed;
}

function _evaluateBufferOctStTri_fn(comp, gate) {
  // 74341/74344: Octal buffer, non-inverting, Schmitt, tri-state.
  // inputs: [A1..A8, OE1n, OE2n]
  // outputs: [Y1..Y8]
  // OE1n controls Y1-Y4, OE2n controls Y5-Y8.
  const bits = this._readGateInputs(comp, gate.inputs);
  let changed = false;
  const oe1n = bits[8], oe2n = bits[9];
  for (let i = 0; i < 4; i++) {
    if (oe1n !== 0) {
      if (this._drivePinHighZ(comp, gate.outputs[i])) changed = true;
    } else {
      if (this._drivePinBit(comp, gate.outputs[i], bits[i])) changed = true;
    }
  }
  for (let i = 4; i < 8; i++) {
    if (oe2n !== 0) {
      if (this._drivePinHighZ(comp, gate.outputs[i])) changed = true;
    } else {
      if (this._drivePinBit(comp, gate.outputs[i], bits[i])) changed = true;
    }
  }
  return changed;
}

// ── Assign Block 21 evaluators to CircuitSimulator.prototype ─────────────────
chipEvaluators._evaluateShiftReg8BitSignExt    = _evaluateShiftReg8BitSignExt_fn;
chipEvaluators._evaluateShiftReg8BitBidirClrTri= _evaluateShiftReg8BitBidirClrTri_fn;
chipEvaluators._evaluateVcoSingleEn            = _evaluateVcoSingleEn_fn;
chipEvaluators._evaluateVcoDual                = _evaluateVcoDual_fn;
chipEvaluators._evaluateVcoDualEn              = _evaluateVcoDualEn_fn;
chipEvaluators._evaluatePla12in6outTri         = _evaluatePla12in6outTri_fn;
chipEvaluators._evaluatePla12in6outOC          = _evaluatePla12in6outOC_fn;
chipEvaluators._evaluatePla12in6outSregTri     = _evaluatePla12in6outSregTri_fn;
chipEvaluators._evaluatePla12in6outSregOC      = _evaluatePla12in6outSregOC_fn;
chipEvaluators._evaluateClkDriverQuadTri       = _evaluateClkDriverQuadTri_fn;
chipEvaluators._evaluateBufferOctStTri         = _evaluateBufferOctStTri_fn;


// ── Block 22 Evaluator Functions ─────────────────────────────────────────────

function _evaluatePriorityEnc8to3Tri_fn(comp, gate) {
  // 74348: 8-to-3 priority encoder, tri-state.
  // inputs: [I0,I1,I2,I3,I4,I5,I6,I7, EIn]
  // outputs: [A0n, A1n, A2n, GS, EO]
  // Inputs active low (I=0 means asserted). Priority: I7 > I6 > ... > I0.
  // EIn=1: all outputs HiZ. EIn=0: enabled.
  const bits = this._readGateInputs(comp, gate.inputs);
  const [i0,i1,i2,i3,i4,i5,i6,i7, ein] = bits;
  let changed = false;
  if (ein !== 0) {
    for (const op of gate.outputs) { if (this._drivePinHighZ(comp, op)) changed = true; }
    return changed;
  }
  const inputs = [i0,i1,i2,i3,i4,i5,i6,i7];
  // Find highest priority asserted (active low → asserted when bit=0)
  let pri = -1;
  for (let i = 7; i >= 0; i--) {
    if (inputs[i] === 0) { pri = i; break; }
  }
  const enc = pri >= 0 ? pri : 0;
  const a0n = pri >= 0 ? ((enc & 1) ? 0 : 1) : 1;
  const a1n = pri >= 0 ? ((enc & 2) ? 0 : 1) : 1;
  const a2n = pri >= 0 ? ((enc & 4) ? 0 : 1) : 1;
  const gs  = pri >= 0 ? 0 : 1; // GS=0 when any input asserted
  const eo  = pri >= 0 ? 1 : 0; // EO=0 when no input asserted (pass-on enable)
  if (this._drivePinBit(comp, gate.outputs[0], a0n)) changed = true;
  if (this._drivePinBit(comp, gate.outputs[1], a1n)) changed = true;
  if (this._drivePinBit(comp, gate.outputs[2], a2n)) changed = true;
  if (this._drivePinBit(comp, gate.outputs[3], gs)) changed = true;
  if (this._drivePinBit(comp, gate.outputs[4], eo)) changed = true;
  return changed;
}

function _evaluateShifter4BitTri_fn(comp, gate) {
  // 74350: 4 bit shifter with tri-state outputs.
  // inputs: [S0, S1, DIR, D0, D1, D2, D3, OEn]
  // outputs: [Y0, Y1, Y2, Y3]
  // S0,S1: shift amount (0-3 bits). DIR=0: right-shift, DIR=1: left-shift.
  const bits = this._readGateInputs(comp, gate.inputs);
  const [s0,s1,dir,d0,d1,d2,d3,oen] = bits;
  let changed = false;
  if (oen !== 0) {
    for (const op of gate.outputs) { if (this._drivePinHighZ(comp, op)) changed = true; }
    return changed;
  }
  const data  = d0 | (d1<<1) | (d2<<2) | (d3<<3);
  const shift = s0 | (s1<<1);
  const result = dir === 0 ? ((data >> shift) & 0xF) : ((data << shift) & 0xF);
  for (let i = 0; i < 4; i++) {
    if (this._drivePinBit(comp, gate.outputs[i], (result >> i) & 1)) changed = true;
  }
  return changed;
}

function _evaluateMux8to1ComplTri_fn(comp, gate) {
  // 74351: 8→1 mux with complementary tri-state outputs.
  // inputs: [D0..D7, S0, S1, S2, Gn]
  // outputs: [W, Wn]
  const bits = this._readGateInputs(comp, gate.inputs);
  const [d0,d1,d2,d3,d4,d5,d6,d7,s0,s1,s2,gn] = bits;
  let changed = false;
  if (gn !== 0) {
    if (this._drivePinHighZ(comp, gate.outputs[0])) changed = true;
    if (this._drivePinHighZ(comp, gate.outputs[1])) changed = true;
    return changed;
  }
  const sel  = s0 | (s1<<1) | (s2<<2);
  const data = [d0,d1,d2,d3,d4,d5,d6,d7][sel];
  if (this._drivePinBit(comp, gate.outputs[0], data)) changed = true;
  if (this._drivePinBit(comp, gate.outputs[1], data ^ 1)) changed = true;
  return changed;
}

function _evaluateMux4to1Inv_fn(comp, gate) {
  // 74352: single 4→1 mux section with inverting output.
  // inputs: [C0, C1, C2, C3, A, B, Gn], output (single string)
  // Gn=0: Y = NOT(selected). Gn=1: disabled
  const [c0,c1,c2,c3,a,b,gn] = this._readGateInputs(comp, gate.inputs);
  if (gn !== 0) return this._drivePinBit(comp, gate.output, 1);
  const sel  = a | (b << 1);
  const data = [c0,c1,c2,c3][sel];
  return this._drivePinBit(comp, gate.output, data ^ 1);
}

function _evaluateMux4to1TriInv_fn(comp, gate) {
  // 74353: single 4→1 mux section with inverting tri-state output.
  // inputs: [C0, C1, C2, C3, A, B, Gn], output (single string)
  // Gn=0: Y = NOT(selected), enabled. Gn=1: HiZ.
  const [c0,c1,c2,c3,a,b,gn] = this._readGateInputs(comp, gate.inputs);
  if (gn !== 0) return this._drivePinHighZ(comp, gate.output);
  const sel  = a | (b << 1);
  const data = [c0,c1,c2,c3][sel];
  return this._drivePinBit(comp, gate.output, data ^ 1);
}

function _evaluateMux8to1LatchTri_fn(comp, gate) {
  // 74354/74355: 8→1 mux with transparent latch + tri-state complementary outputs.
  // inputs: [I0..I7, S0, S1, S2, LE, OEn]
  // outputs: [W, Wn]
  const bits = this._readGateInputs(comp, gate.inputs);
  const [i0,i1,i2,i3,i4,i5,i6,i7,s0,s1,s2,le,oen] = bits;
  if (!comp.state) comp.state = { q: 0 };
  const sel = s0 | (s1<<1) | (s2<<2);
  if (le !== 0) comp.state.q = [i0,i1,i2,i3,i4,i5,i6,i7][sel];
  let changed = false;
  if (oen !== 0) {
    if (this._drivePinHighZ(comp, gate.outputs[0])) changed = true;
    if (this._drivePinHighZ(comp, gate.outputs[1])) changed = true;
    return changed;
  }
  if (this._drivePinBit(comp, gate.outputs[0], comp.state.q)) changed = true;
  if (this._drivePinBit(comp, gate.outputs[1], comp.state.q ^ 1)) changed = true;
  return changed;
}

function _evaluateMux8to1RegTri_fn(comp, gate) {
  // 74356/74357: 8→1 mux with edge-triggered register + tri-state complementary outputs.
  // inputs: [I0..I7, S0, S1, S2, CLK, OEn]
  // outputs: [W, Wn]
  const bits = this._readGateInputs(comp, gate.inputs);
  const [i0,i1,i2,i3,i4,i5,i6,i7,s0,s1,s2,clk,oen] = bits;
  if (!comp.state) comp.state = { q: 0, prevClk: clk };
  const sel = s0 | (s1<<1) | (s2<<2);
  if (comp.state.prevClk === 0 && clk === 1) {
    comp.state.q = [i0,i1,i2,i3,i4,i5,i6,i7][sel];
  }
  comp.state.prevClk = clk;
  let changed = false;
  if (oen !== 0) {
    if (this._drivePinHighZ(comp, gate.outputs[0])) changed = true;
    if (this._drivePinHighZ(comp, gate.outputs[1])) changed = true;
    return changed;
  }
  if (this._drivePinBit(comp, gate.outputs[0], comp.state.q)) changed = true;
  if (this._drivePinBit(comp, gate.outputs[1], comp.state.q ^ 1)) changed = true;
  return changed;
}

function _evaluateBubbleMemTiming_fn(comp, gate) {
  // 74361: Bubble memory timing generator. Stub: all outputs 0.
  let changed = false;
  for (const op of gate.outputs) { if (this._drivePinBit(comp, op, 0)) changed = true; }
  return changed;
}

function _evaluateClk4PhaseGen_fn(comp, gate) {
  // 74362: Four-phase clock gen for TMS9900. Stub: rotating phase outputs.
  const bits = this._readGateInputs(comp, gate.inputs);
  const [clk, rst] = bits;
  if (!comp.state) comp.state = { phase: 0, prevClk: clk };
  let changed = false;
  if (rst !== 0) {
    comp.state.phase = 0;
  } else if (comp.state.prevClk === 0 && clk === 1) {
    comp.state.phase = (comp.state.phase + 1) & 3;
  }
  comp.state.prevClk = clk;
  for (let i = 0; i < 4; i++) {
    if (this._drivePinBit(comp, gate.outputs[i], comp.state.phase === i ? 1 : 0)) changed = true;
  }
  return changed;
}

function _evaluateBufferHexTri_fn(comp, gate) {
  // 74365: Hex buffer, non-inverting, tri-state.
  // inputs: [A1..A6, G1n, G2n]
  // outputs: [Y1..Y6]
  const bits = this._readGateInputs(comp, gate.inputs);
  const g1n = bits[6], g2n = bits[7];
  let changed = false;
  if (g1n !== 0 || g2n !== 0) {
    for (const op of gate.outputs) { if (this._drivePinHighZ(comp, op)) changed = true; }
    return changed;
  }
  for (let i = 0; i < 6; i++) {
    if (this._drivePinBit(comp, gate.outputs[i], bits[i])) changed = true;
  }
  return changed;
}

function _evaluateBufferHexInvTri_fn(comp, gate) {
  // 74366: Hex buffer, inverting, tri-state.
  // inputs: [A1..A6, G1n, G2n]
  // outputs: [Y1..Y6]
  const bits = this._readGateInputs(comp, gate.inputs);
  const g1n = bits[6], g2n = bits[7];
  let changed = false;
  if (g1n !== 0 || g2n !== 0) {
    for (const op of gate.outputs) { if (this._drivePinHighZ(comp, op)) changed = true; }
    return changed;
  }
  for (let i = 0; i < 6; i++) {
    if (this._drivePinBit(comp, gate.outputs[i], bits[i] ^ 1)) changed = true;
  }
  return changed;
}

// ── Assign Block 22 evaluators to CircuitSimulator.prototype ─────────────────
chipEvaluators._evaluatePriorityEnc8to3Tri  = _evaluatePriorityEnc8to3Tri_fn;
chipEvaluators._evaluateShifter4BitTri       = _evaluateShifter4BitTri_fn;
chipEvaluators._evaluateMux8to1ComplTri      = _evaluateMux8to1ComplTri_fn;
chipEvaluators._evaluateMux4to1Inv           = _evaluateMux4to1Inv_fn;
chipEvaluators._evaluateMux4to1TriInv        = _evaluateMux4to1TriInv_fn;
chipEvaluators._evaluateMux8to1LatchTri      = _evaluateMux8to1LatchTri_fn;
chipEvaluators._evaluateMux8to1RegTri        = _evaluateMux8to1RegTri_fn;
chipEvaluators._evaluateBubbleMemTiming      = _evaluateBubbleMemTiming_fn;
chipEvaluators._evaluateClk4PhaseGen         = _evaluateClk4PhaseGen_fn;
chipEvaluators._evaluateBufferHexTri         = _evaluateBufferHexTri_fn;
chipEvaluators._evaluateBufferHexInvTri      = _evaluateBufferHexInvTri_fn;


// ── Block 23 Evaluator Functions ─────────────────────────────────────────────



function _evaluateDLatchQuadCompl_fn(comp, gate) {
  // 74375: Quad bistable latch with complementary outputs.
  // inputs: [1D, 2D, 3D, 4D, C12, C34]
  // outputs: [1Q, 1Qn, 2Q, 2Qn, 3Q, 3Qn, 4Q, 4Qn]
  // C12=1: latches 1&2 transparent. C34=1: latches 3&4 transparent.
  const bits = this._readGateInputs(comp, gate.inputs);
  const [d1,d2,d3,d4,c12,c34] = bits;
  if (!comp.state) comp.state = { q: [0,0,0,0] };
  if (c12 !== 0) { comp.state.q[0] = d1; comp.state.q[1] = d2; }
  if (c34 !== 0) { comp.state.q[2] = d3; comp.state.q[3] = d4; }
  const [q1,q2,q3,q4] = comp.state.q;
  let changed = false;
  if (this._drivePinBit(comp, gate.outputs[0], q1))   changed = true;
  if (this._drivePinBit(comp, gate.outputs[1], q1^1)) changed = true;
  if (this._drivePinBit(comp, gate.outputs[2], q2))   changed = true;
  if (this._drivePinBit(comp, gate.outputs[3], q2^1)) changed = true;
  if (this._drivePinBit(comp, gate.outputs[4], q3))   changed = true;
  if (this._drivePinBit(comp, gate.outputs[5], q3^1)) changed = true;
  if (this._drivePinBit(comp, gate.outputs[6], q4))   changed = true;
  if (this._drivePinBit(comp, gate.outputs[7], q4^1)) changed = true;
  return changed;
}

function _evaluateJkNotFfQuad_fn(comp, gate) {
  // 74376: Quad J-NOT-K flip-flop (K=~J internally). Shared CLK and CLRn.
  // inputs: [1J, 2J, 3J, 4J, CLK, CLRn]
  // outputs: [1Q, 1Qn, 2Q, 2Qn, 3Q, 3Qn, 4Q, 4Qn]
  // CLRn=0: all Q→0. Rising CLK: Q →  J (since K=~J: sets if J=1, resets if J=0).
  const bits = this._readGateInputs(comp, gate.inputs);
  const [j1,j2,j3,j4,clk,clrn] = bits;
  if (!comp.state) comp.state = { q: [0,0,0,0], prevClk: clk };
  let changed = false;
  if (clrn === 0) {
    comp.state.q = [0,0,0,0];
    comp.state.prevClk = clk;
  } else {
    if (comp.state.prevClk === 0 && clk === 1) {
      comp.state.q[0] = j1;
      comp.state.q[1] = j2;
      comp.state.q[2] = j3;
      comp.state.q[3] = j4;
    }
    comp.state.prevClk = clk;
  }
  const q = comp.state.q;
  for (let i = 0; i < 4; i++) {
    if (this._drivePinBit(comp, gate.outputs[i*2],   q[i]))   changed = true;
    if (this._drivePinBit(comp, gate.outputs[i*2+1], q[i]^1)) changed = true;
  }
  return changed;
}

function _evaluateDFfOctalCe_fn(comp, gate) {
  // 74377: 8 bit register with clock enable.
  // inputs: [D1..D8, CLK, En]  (En active LOW)
  // outputs: [Q1..Q8]
  const bits = this._readGateInputs(comp, gate.inputs);
  const ds  = bits.slice(0, 8);
  const clk = bits[8];
  const en  = bits[9];
  if (!comp.state) comp.state = { q: new Array(8).fill(0), prevClk: clk };
  if (comp.state.prevClk === 0 && clk === 1 && en === 0) {
    comp.state.q = ds.slice();
  }
  comp.state.prevClk = clk;
  let changed = false;
  for (let i = 0; i < 8; i++) {
    if (this._drivePinBit(comp, gate.outputs[i], comp.state.q[i])) changed = true;
  }
  return changed;
}

function _evaluateDFfHexCe_fn(comp, gate) {
  // 74378: 6 bit register with clock enable.
  // inputs: [D1..D6, CLK, En]  (En active LOW)
  // outputs: [Q1..Q6]
  const bits = this._readGateInputs(comp, gate.inputs);
  const ds  = bits.slice(0, 6);
  const clk = bits[6];
  const en  = bits[7];
  if (!comp.state) comp.state = { q: new Array(6).fill(0), prevClk: clk };
  if (comp.state.prevClk === 0 && clk === 1 && en === 0) {
    comp.state.q = ds.slice();
  }
  comp.state.prevClk = clk;
  let changed = false;
  for (let i = 0; i < 6; i++) {
    if (this._drivePinBit(comp, gate.outputs[i], comp.state.q[i])) changed = true;
  }
  return changed;
}

function _evaluateDFfQuadCeCompl_fn(comp, gate) {
  // 74379: 4 bit register with clock enable and complementary outputs.
  // inputs: [D1, D2, D3, D4, CLK, En]  (En active LOW)
  // outputs: [Q1, Q1n, Q2, Q2n, Q3, Q3n, Q4, Q4n]
  const bits = this._readGateInputs(comp, gate.inputs);
  const [d1,d2,d3,d4,clk,en] = bits;
  if (!comp.state) comp.state = { q: [0,0,0,0], prevClk: clk };
  if (comp.state.prevClk === 0 && clk === 1 && en === 0) {
    comp.state.q = [d1,d2,d3,d4];
  }
  comp.state.prevClk = clk;
  const q = comp.state.q;
  let changed = false;
  for (let i = 0; i < 4; i++) {
    if (this._drivePinBit(comp, gate.outputs[i*2],   q[i]))   changed = true;
    if (this._drivePinBit(comp, gate.outputs[i*2+1], q[i]^1)) changed = true;
  }
  return changed;
}

function _evaluateMultiFuncReg8Bit_fn(comp, gate) {
  // 74380: 8 bit multifunction register. Simplified: D-FF with tri-state.
  // inputs: [D1..D8, CLK, S0, S1, S2, OEn]
  // outputs: [Q1..Q8]
  // For simulation purposes: when OEn=0, outputs Q on rising CLK.
  const bits = this._readGateInputs(comp, gate.inputs);
  const ds   = bits.slice(0, 8);
  const clk  = bits[8];
  const oen  = bits[12];
  if (!comp.state) comp.state = { q: new Array(8).fill(0), prevClk: clk };
  if (comp.state.prevClk === 0 && clk === 1) {
    comp.state.q = ds.slice();
  }
  comp.state.prevClk = clk;
  let changed = false;
  if (oen !== 0) {
    for (const op of gate.outputs) { if (this._drivePinHighZ(comp, op)) changed = true; }
    return changed;
  }
  for (let i = 0; i < 8; i++) {
    if (this._drivePinBit(comp, gate.outputs[i], comp.state.q[i])) changed = true;
  }
  return changed;
}

function _alu381Compute(a4, b4, cn, s) {
  // 74381/74382 function table (active HIGH):
  // s=0: clear (F=0). s=1: B-A-Cn'. s=2: A-B-Cn'. s=3: A+B+Cn.
  // s=4: A XOR B. s=5: A OR B. s=6: A AND B. s=7: preset (F=all-ones).
  switch (s) {
    case 0: return { f: 0, cn4: 0 };
    case 1: { const r = b4 - a4 - (1-cn); return { f: r & 0xF, cn4: (r >> 4) & 1 }; }
    case 2: { const r = a4 - b4 - (1-cn); return { f: r & 0xF, cn4: (r >> 4) & 1 }; }
    case 3: { const r = a4 + b4 + cn;     return { f: r & 0xF, cn4: (r >> 4) & 1 }; }
    case 4: return { f: (a4 ^ b4) & 0xF, cn4: 0 };
    case 5: return { f: (a4 | b4) & 0xF, cn4: 0 };
    case 6: return { f: (a4 & b4) & 0xF, cn4: 0 };
    case 7: return { f: 0xF, cn4: 1 };
    default: return { f: 0, cn4: 0 };
  }
}

function _evaluateAlu4Bit381_fn(comp, gate) {
  // 74381: 4 bit ALU with G and P outputs.
  // inputs: [A0,A1,A2,A3, B0,B1,B2,B3, Cn, S0,S1,S2]
  // outputs: [F0,F1,F2,F3, G, P]
  const bits = this._readGateInputs(comp, gate.inputs);
  const a4   = bits[0] | (bits[1]<<1) | (bits[2]<<2) | (bits[3]<<3);
  const b4   = bits[4] | (bits[5]<<1) | (bits[6]<<2) | (bits[7]<<3);
  const cn   = bits[8];
  const s    = bits[9] | (bits[10]<<1) | (bits[11]<<2);
  const { f, cn4 } = _alu381Compute(a4, b4, cn, s);
  // G (generate) and P (propagate) for lookahead carry
  const g = (a4 & b4) !== 0 ? 1 : 0;
  const p = ((a4 | b4) === 0xF) ? 1 : 0;
  let changed = false;
  for (let i = 0; i < 4; i++) {
    if (this._drivePinBit(comp, gate.outputs[i], (f >> i) & 1)) changed = true;
  }
  if (this._drivePinBit(comp, gate.outputs[4], g)) changed = true;
  if (this._drivePinBit(comp, gate.outputs[5], p)) changed = true;
  return changed;
}

function _evaluateAlu4Bit382_fn(comp, gate) {
  // 74382: 4 bit ALU with Cn4 (ripple carry) and OVR (overflow) outputs.
  // inputs: [A0,A1,A2,A3, B0,B1,B2,B3, Cn, S0,S1,S2]
  // outputs: [F0,F1,F2,F3, Cn4, OVR]
  const bits = this._readGateInputs(comp, gate.inputs);
  const a4   = bits[0] | (bits[1]<<1) | (bits[2]<<2) | (bits[3]<<3);
  const b4   = bits[4] | (bits[5]<<1) | (bits[6]<<2) | (bits[7]<<3);
  const cn   = bits[8];
  const s    = bits[9] | (bits[10]<<1) | (bits[11]<<2);
  const { f, cn4 } = _alu381Compute(a4, b4, cn, s);
  // Overflow: sign bit of a XOR sign bit of b (for add/sub functions only)
  const aSign = (a4 >> 3) & 1;
  const bSign = (b4 >> 3) & 1;
  const fSign = (f  >> 3) & 1;
  // Two's complement overflow: inputs same sign, result different sign
  const ovr = (s >= 1 && s <= 3)
    ? ((aSign === bSign && fSign !== aSign) ? 1 : 0)
    : 0;
  let changed = false;
  for (let i = 0; i < 4; i++) {
    if (this._drivePinBit(comp, gate.outputs[i], (f >> i) & 1)) changed = true;
  }
  if (this._drivePinBit(comp, gate.outputs[4], cn4)) changed = true;
  if (this._drivePinBit(comp, gate.outputs[5], ovr)) changed = true;
  return changed;
}

function _evaluateDFfOctalOc_fn(comp, gate) {
  // 74383: 8 bit register, open-collector. Same as D_FF_OCTAL (74273) but OC outputs.
  // inputs: [D1..D8, CLK, CLRn], outputs: [Q1..Q8]
  const bits = this._readGateInputs(comp, gate.inputs);
  const ds   = bits.slice(0, 8);
  const clk  = bits[8];
  const clrn = bits[9];
  if (!comp.state) comp.state = { q: new Array(8).fill(0), prevClk: clk };
  if (clrn === 0) { comp.state.q.fill(0); comp.state.prevClk = clk; }
  else {
    if (comp.state.prevClk === 0 && clk === 1) comp.state.q = ds.slice();
    comp.state.prevClk = clk;
  }
  let changed = false;
  for (let i = 0; i < 8; i++) {
    if (this._drivePinBit(comp, gate.outputs[i], comp.state.q[i])) changed = true;
  }
  return changed;
}

function _evaluateMultiplier8x1_fn(comp, gate) {
  // 74384: 8×1 two's complement multiplier. Y (8 bit signed) × X (1 bit).
  // inputs: [Y0..Y7, X], outputs: [P0..P4] (low 5 bits of 9 bit signed product)
  // If X=0: product=0. If X=1: product=Y (sign-extended).
  const bits = this._readGateInputs(comp, gate.inputs);
  const yRaw = bits[0] | (bits[1]<<1) | (bits[2]<<2) | (bits[3]<<3) |
               (bits[4]<<4) | (bits[5]<<5) | (bits[6]<<6) | (bits[7]<<7);
  // Sign-extend 8 bit to signed
  const y  = yRaw < 128 ? yRaw : yRaw - 256;
  const x  = bits[8];
  const prod = x ? y : 0; // 9 bit result
  let changed = false;
  for (let i = 0; i < 5; i++) {
    if (this._drivePinBit(comp, gate.outputs[i], (prod >> i) & 1)) changed = true;
  }
  return changed;
}

function _evaluateSerialAdderQuad_fn(comp, gate) {
  // 74385: Quad serial adder/subtractor. Simplified serial adder stub.
  // inputs: [1A,1B,1AS, 2A,2B,2AS, 3A,3B,3AS, 4A,4B,4AS, CLK]
  // outputs: [1S,2S,3S,4S]
  // Each unit: AS=0 → add, AS=1 → subtract. S = A XOR B XOR carry_in.
  const bits = this._readGateInputs(comp, gate.inputs);
  const clk  = bits[12];
  if (!comp.state) comp.state = { carry: [0,0,0,0], prevClk: clk, s: [0,0,0,0] };
  let changed = false;
  if (comp.state.prevClk === 0 && clk === 1) {
    for (let i = 0; i < 4; i++) {
      const a  = bits[i*3];
      const b  = bits[i*3+1];
      const as = bits[i*3+2];
      const bEff = as ? (b ^ 1) : b; // subtract: invert b
      const sum = a + bEff + comp.state.carry[i];
      comp.state.s[i] = sum & 1;
      comp.state.carry[i] = (sum >> 1) & 1;
    }
  }
  comp.state.prevClk = clk;
  for (let i = 0; i < 4; i++) {
    if (this._drivePinBit(comp, gate.outputs[i], comp.state.s[i])) changed = true;
  }
  return changed;
}

// ── Assign Block 23 evaluators to CircuitSimulator.prototype ─────────────────
chipEvaluators._evaluateDLatchQuadCompl   = _evaluateDLatchQuadCompl_fn;
chipEvaluators._evaluateJkNotFfQuad       = _evaluateJkNotFfQuad_fn;
chipEvaluators._evaluateDFfOctalCe        = _evaluateDFfOctalCe_fn;
chipEvaluators._evaluateDFfHexCe          = _evaluateDFfHexCe_fn;
chipEvaluators._evaluateDFfQuadCeCompl    = _evaluateDFfQuadCeCompl_fn;
chipEvaluators._evaluateMultiFuncReg8Bit  = _evaluateMultiFuncReg8Bit_fn;
chipEvaluators._evaluateAlu4Bit381        = _evaluateAlu4Bit381_fn;
chipEvaluators._evaluateAlu4Bit382        = _evaluateAlu4Bit382_fn;
chipEvaluators._evaluateDFfOctalOc        = _evaluateDFfOctalOc_fn;
chipEvaluators._evaluateMultiplier8x1     = _evaluateMultiplier8x1_fn;
chipEvaluators._evaluateSerialAdderQuad   = _evaluateSerialAdderQuad_fn;

// ── Block 24 Evaluator Functions ─────────────────────────────────────────────


function _evaluateDFfQuadTriCompl_fn(comp, gate) {
  // 74388: 4 bit D-FF with tri-state outputs and complementary Q/Qn.
  // inputs: [D1,D2,D3,D4,CLK,OEn]
  // outputs: [Q1,Q1n,Q2,Q2n,Q3,Q3n,Q4,Q4n]
  // OEn=1 → Q and Qn all HiZ (no conflict, they float).
  const bits = this._readGateInputs(comp, gate.inputs);
  const [d1,d2,d3,d4,clk,oen] = bits;
  const d = [d1,d2,d3,d4];
  if (!comp.state) comp.state = { q: [0,0,0,0], prevClk: clk };
  let changed = false;
  // Rising edge capture
  if (comp.state.prevClk === 0 && clk === 1) {
    for (let i = 0; i < 4; i++) comp.state.q[i] = d[i];
  }
  comp.state.prevClk = clk;
  // Drive outputs
  if (oen !== 0) {
    for (const op of gate.outputs) { if (this._drivePinHighZ(comp, op)) changed = true; }
    return changed;
  }
  for (let i = 0; i < 4; i++) {
    const qi = comp.state.q[i];
    if (this._drivePinBit(comp, gate.outputs[i*2],   qi))     changed = true;
    if (this._drivePinBit(comp, gate.outputs[i*2+1], qi^1))   changed = true;
  }
  return changed;
}

function _evaluateCounterDecadeDual_fn(comp, gate) {
  // 74390: Dual decade counter (÷2 + ÷5 per section), async clear.
  // inputs: [CLK1A, CLR1, CLK1B, CLK2A, CLR2, CLK2B]
  // outputs: [QA1,QB1,QC1,QD1, QA2,QB2,QC2,QD2]
  const bits = this._readGateInputs(comp, gate.inputs);
  const [clk1A, clr1, clk1B, clk2A, clr2, clk2B] = bits;
  if (!comp.state) comp.state = {
    qa: [0,0], div5: [0,0],
    prevClkA: [clk1A, clk2A], prevClkB: [clk1B, clk2B]
  };
  let changed = false;
  const clrArr = [clr1, clr2];
  const clkAArr = [clk1A, clk2A];
  const clkBArr = [clk1B, clk2B];
  for (let s = 0; s < 2; s++) {
    if (clrArr[s]) {
      comp.state.qa[s] = 0; comp.state.div5[s] = 0;
    } else {
      if (comp.state.prevClkA[s] === 1 && clkAArr[s] === 0) comp.state.qa[s] ^= 1;
      if (comp.state.prevClkB[s] === 1 && clkBArr[s] === 0) {
        comp.state.div5[s] = (comp.state.div5[s] + 1) % 5;
      }
    }
    comp.state.prevClkA[s] = clkAArr[s];
    comp.state.prevClkB[s] = clkBArr[s];
    const qa = comp.state.qa[s];
    const q5 = comp.state.div5[s];
    const qb = (q5 >> 0) & 1, qc = (q5 >> 1) & 1, qd = (q5 >> 2) & 1;
    const base = s * 4;
    if (this._drivePinBit(comp, gate.outputs[base],   qa)) changed = true;
    if (this._drivePinBit(comp, gate.outputs[base+1], qb)) changed = true;
    if (this._drivePinBit(comp, gate.outputs[base+2], qc)) changed = true;
    if (this._drivePinBit(comp, gate.outputs[base+3], qd)) changed = true;
  }
  return changed;
}

function _evaluateCounter4BitDual_fn(comp, gate) {
  // 74393: Dual 4 bit binary counter, async clear.
  // inputs: [CLK1, CLR1, CLK2, CLR2]
  // outputs: [QA1,QB1,QC1,QD1, QA2,QB2,QC2,QD2]
  const bits = this._readGateInputs(comp, gate.inputs);
  const [clk1, clr1, clk2, clr2] = bits;
  if (!comp.state) comp.state = { cnt: [0,0], prevClk: [clk1, clk2] };
  let changed = false;
  const clkArr = [clk1, clk2];
  const clrArr = [clr1, clr2];
  for (let s = 0; s < 2; s++) {
    if (clrArr[s]) {
      comp.state.cnt[s] = 0;
    } else {
      if (comp.state.prevClk[s] === 1 && clkArr[s] === 0) {
        comp.state.cnt[s] = (comp.state.cnt[s] + 1) & 0xF;
      }
    }
    comp.state.prevClk[s] = clkArr[s];
    const cnt = comp.state.cnt[s];
    const base = s * 4;
    for (let b = 0; b < 4; b++) {
      if (this._drivePinBit(comp, gate.outputs[base+b], (cnt >> b) & 1)) changed = true;
    }
  }
  return changed;
}

function _evaluateShiftReg4BitTri_fn(comp, gate) {
  // 74395: 4 bit cascadable shift register, tri-state.
  // inputs: [SER, A, B, C, D, SRn, CLK, CLRn, OEn]
  // outputs: [QA, QB, QC, QD, QDn]
  // SRn=0 → shift mode; SRn=1 → parallel load.
  // CLRn=0 → async clear. OEn=1 → QA-QC HiZ (QD/QDn always driven).
  const bits = this._readGateInputs(comp, gate.inputs);
  const [ser, pA, pB, pC, pD, srn, clk, clrn, oen] = bits;
  if (!comp.state) comp.state = { q: [0,0,0,0], prevClk: clk };
  let changed = false;
  if (!clrn) {
    comp.state.q = [0,0,0,0];
  } else if (comp.state.prevClk === 0 && clk === 1) {
    if (!srn) {
      // Shift: SER→QA, QA→QB, QB→QC, QC→QD
      comp.state.q[3] = comp.state.q[2];
      comp.state.q[2] = comp.state.q[1];
      comp.state.q[1] = comp.state.q[0];
      comp.state.q[0] = ser;
    } else {
      // Parallel load
      comp.state.q = [pA, pB, pC, pD];
    }
  }
  comp.state.prevClk = clk;
  const [qa, qb, qc, qd] = comp.state.q;
  if (oen !== 0) {
    if (this._drivePinHighZ(comp, gate.outputs[0])) changed = true; // QA
    if (this._drivePinHighZ(comp, gate.outputs[1])) changed = true; // QB
    if (this._drivePinHighZ(comp, gate.outputs[2])) changed = true; // QC
  } else {
    if (this._drivePinBit(comp, gate.outputs[0], qa)) changed = true;
    if (this._drivePinBit(comp, gate.outputs[1], qb)) changed = true;
    if (this._drivePinBit(comp, gate.outputs[2], qc)) changed = true;
  }
  // QD and QDn always driven (cascadable)
  if (this._drivePinBit(comp, gate.outputs[3], qd))    changed = true;
  if (this._drivePinBit(comp, gate.outputs[4], qd^1))  changed = true;
  return changed;
}

function _evaluateDFfOctalOcPar_fn(comp, gate) {
  // 74396: Octal storage register (7 bit variant), OC.
  // inputs: [D1..D7, CLK]
  // outputs: [Q1..Q7]
  // Rising CLK captures D.
  const bits = this._readGateInputs(comp, gate.inputs);
  const clk = bits[7];
  const d = bits.slice(0, 7);
  if (!comp.state) comp.state = { q: new Uint8Array(7), prevClk: clk };
  let changed = false;
  if (comp.state.prevClk === 0 && clk === 1) {
    for (let i = 0; i < 7; i++) comp.state.q[i] = d[i];
  }
  comp.state.prevClk = clk;
  for (let i = 0; i < 7; i++) {
    if (this._drivePinBit(comp, gate.outputs[i], comp.state.q[i])) changed = true;
  }
  return changed;
}

function _evaluateMuxQuad2to1StoredCompl_fn(comp, gate) {
  // 74398: Quad 2-to-1 MUX with storage and Q/Qn outputs.
  // inputs: [A1,B1,A2,B2,A3,B3,A4,B4,SEL,CLK]
  // outputs: [Q1,Q1n,Q2,Q2n,Q3,Q3n,Q4,Q4n]
  // SEL=0 → select A; SEL=1 → select B. Rising CLK stores.
  const bits = this._readGateInputs(comp, gate.inputs);
  const sel = bits[8], clk = bits[9];
  if (!comp.state) comp.state = { q: [0,0,0,0], prevClk: clk };
  let changed = false;
  if (comp.state.prevClk === 0 && clk === 1) {
    for (let i = 0; i < 4; i++) {
      const a = bits[i*2], b = bits[i*2+1];
      comp.state.q[i] = sel ? b : a;
    }
  }
  comp.state.prevClk = clk;
  for (let i = 0; i < 4; i++) {
    const qi = comp.state.q[i];
    if (this._drivePinBit(comp, gate.outputs[i*2],   qi))   changed = true;
    if (this._drivePinBit(comp, gate.outputs[i*2+1], qi^1)) changed = true;
  }
  return changed;
}

function _evaluateCrc16Bit_fn(comp, gate) {
  // 74401: CRC generator/checker stub.
  // inputs: [CLK, DATA, SYNn, RESn, P2, P1, CEn]
  // outputs: [ERR, SO, STS, DR, COR]
  // Complex internal polynomial logic; simplified: outputs 0 unless driven.
  const bits = this._readGateInputs(comp, gate.inputs);
  const resn = bits[3];
  let changed = false;
  if (!resn) {
    for (const op of gate.outputs) { if (this._drivePinBit(comp, op, 0)) changed = true; }
    return changed;
  }
  // Stub: just drive all outputs low
  for (const op of gate.outputs) { if (this._drivePinBit(comp, op, 0)) changed = true; }
  return changed;
}

function _evaluatePolyChecker_fn(comp, gate) {
  // 74402: Serial polynomial generator/checker stub.
  // inputs: [CLK, DATA, GEN, P0, P1, P2, P3, SYNn, RESn, CEn]
  // outputs: [ERR, SO, STS, DR]
  // Complex; simplified stub: outputs 0.
  let changed = false;
  for (const op of gate.outputs) { if (this._drivePinBit(comp, op, 0)) changed = true; }
  return changed;
}

function _evaluateFifo16x4Tri_fn(comp, gate) {
  // 74403: 16×4 FIFO with tri-state outputs.
  // inputs: [DIN0..DIN3, WR_CLK, RD_CLK, WR_EN, RD_EN, OEn]
  // outputs: [DOUT0..DOUT3, EF, FF, IR, OR]
  const bits = this._readGateInputs(comp, gate.inputs);
  const [d0,d1,d2,d3, wrClk, rdClk, wrEn, rdEn, oen] = bits;
  if (!comp.state) comp.state = {
    fifo: [], prevWrClk: wrClk, prevRdClk: rdClk,
    dout: [0,0,0,0], ef: 1, ff: 0, ir: 0, or: 0
  };
  let changed = false;
  // Write on rising WR_CLK if WR_EN active and not full
  if (comp.state.prevWrClk === 0 && wrClk === 1 && wrEn) {
    if (comp.state.fifo.length < 16) {
      comp.state.fifo.push((d0|(d1<<1)|(d2<<2)|(d3<<3)) & 0xF);
    }
  }
  // Read on rising RD_CLK if RD_EN active and not empty
  if (comp.state.prevRdClk === 0 && rdClk === 1 && rdEn) {
    if (comp.state.fifo.length > 0) {
      const v = comp.state.fifo.shift();
      comp.state.dout = [(v>>0)&1,(v>>1)&1,(v>>2)&1,(v>>3)&1];
    }
  }
  comp.state.prevWrClk = wrClk;
  comp.state.prevRdClk = rdClk;
  comp.state.ef = comp.state.fifo.length === 0 ? 1 : 0;
  comp.state.ff = comp.state.fifo.length >= 16 ? 1 : 0;
  // Drive outputs
  if (oen !== 0) {
    for (let i = 0; i < 4; i++) { if (this._drivePinHighZ(comp, gate.outputs[i])) changed = true; }
  } else {
    for (let i = 0; i < 4; i++) {
      if (this._drivePinBit(comp, gate.outputs[i], comp.state.dout[i])) changed = true;
    }
  }
  if (this._drivePinBit(comp, gate.outputs[4], comp.state.ef)) changed = true;
  if (this._drivePinBit(comp, gate.outputs[5], comp.state.ff)) changed = true;
  if (this._drivePinBit(comp, gate.outputs[6], 0)) changed = true; // IR stub
  if (this._drivePinBit(comp, gate.outputs[7], 0)) changed = true; // OR stub
  return changed;
}

function _evaluateDecoder3to8Inv_fn(comp, gate) {
  // 74405: 3-to-8 decoder (Intel 8205), active LOW outputs.
  // inputs: [A0, A1, A2, E0n, E1n, E2]
  // outputs: [Y0n..Y7n]
  // Enable: E0n=0 AND E1n=0 AND E2=1 → enabled.
  const bits = this._readGateInputs(comp, gate.inputs);
  const [a0,a1,a2,e0n,e1n,e2] = bits;
  let changed = false;
  const enabled = (!e0n && !e1n && e2);
  const sel = a0 | (a1<<1) | (a2<<2);
  for (let i = 0; i < 8; i++) {
    const yn = enabled ? (i === sel ? 0 : 1) : 1;
    if (this._drivePinBit(comp, gate.outputs[i], yn)) changed = true;
  }
  return changed;
}

function _evaluateDataAccessReg8Bit_fn(comp, gate) {
  // 74407: Data access register, 8 bit, tri-state.
  // inputs: [D0..D7, CLK, OEn, LD, CLRn]
  // outputs: [Q0..Q7]
  // CLRn=0 → async clear. LD=1+rising CLK → load D. OEn=1 → HiZ.
  const bits = this._readGateInputs(comp, gate.inputs);
  const [d0,d1,d2,d3,d4,d5,d6,d7,clk,oen,ld,clrn] = bits;
  const d = [d0,d1,d2,d3,d4,d5,d6,d7];
  if (!comp.state) comp.state = { q: new Uint8Array(8), prevClk: clk };
  let changed = false;
  if (!clrn) {
    for (let i = 0; i < 8; i++) comp.state.q[i] = 0;
  } else if (comp.state.prevClk === 0 && clk === 1 && ld) {
    for (let i = 0; i < 8; i++) comp.state.q[i] = d[i];
  }
  comp.state.prevClk = clk;
  if (oen !== 0) {
    for (const op of gate.outputs) { if (this._drivePinHighZ(comp, op)) changed = true; }
    return changed;
  }
  for (let i = 0; i < 8; i++) {
    if (this._drivePinBit(comp, gate.outputs[i], comp.state.q[i])) changed = true;
  }
  return changed;
}

function _evaluateRam16x4RegTri_fn(comp, gate) {
  // 74410: 16×4 RAM with output register, tri-state.
  // inputs: [A0..A3, DI0..DI3, WEn, OEn, CLK, CSn]
  // outputs: [DO0..DO3]
  // CSn=1 → HiZ. WEn=0 → write. Rising CLK → output register captures RAM[addr].
  const bits = this._readGateInputs(comp, gate.inputs);
  const [a0,a1,a2,a3,di0,di1,di2,di3,wen,oen,clk,csn] = bits;
  if (!comp.state) comp.state = { ram: new Uint8Array(16), outreg: [0,0,0,0], prevClk: clk };
  let changed = false;
  const addr = a0 | (a1<<1) | (a2<<2) | (a3<<3);
  if (!csn && !wen) {
    comp.state.ram[addr] = (di0|(di1<<1)|(di2<<2)|(di3<<3)) & 0xF;
  }
  if (comp.state.prevClk === 0 && clk === 1 && !csn) {
    const v = comp.state.ram[addr] & 0xF;
    comp.state.outreg = [(v>>0)&1,(v>>1)&1,(v>>2)&1,(v>>3)&1];
  }
  comp.state.prevClk = clk;
  if (oen !== 0 || csn) {
    for (const op of gate.outputs) { if (this._drivePinHighZ(comp, op)) changed = true; }
    return changed;
  }
  for (let i = 0; i < 4; i++) {
    if (this._drivePinBit(comp, gate.outputs[i], comp.state.outreg[i])) changed = true;
  }
  return changed;
}

function _evaluateMultimodeLatch8Bit_fn(comp, gate) {
  // 74412: Multi-mode 8 bit latch (Intel 8212/3212 equiv), tri-state.
  // inputs: [DS1, DI0..DI7, STB, MD, OEn, DS2n]
  // outputs: [DO0..DO7, INT]
  // DS1=1 AND DS2n=0 → device selected.
  // MD=0 (input mode): STB rising edge → latch DI.
  // MD=1 (output mode): transparent latch (DI visible immediately when selected).
  // OEn=1 → DO HiZ. INT = !STB (interrupt output, active LOW).
  const bits = this._readGateInputs(comp, gate.inputs);
  const [ds1,di0,di1,di2,di3,di4,di5,di6,di7,stb,md,oen,ds2n] = bits;
  const di = [di0,di1,di2,di3,di4,di5,di6,di7];
  const selected = ds1 && !ds2n;
  if (!comp.state) comp.state = { q: new Uint8Array(8), prevStb: stb };
  let changed = false;
  if (selected) {
    if (!md) {
      // Input mode: capture on rising STB
      if (comp.state.prevStb === 0 && stb === 1) {
        for (let i = 0; i < 8; i++) comp.state.q[i] = di[i];
      }
    } else {
      // Output mode: transparent
      for (let i = 0; i < 8; i++) comp.state.q[i] = di[i];
    }
  }
  comp.state.prevStb = stb;
  // INT = inverted STB (active when data is being latched)
  const intVal = stb ? 0 : 1;
  if (oen !== 0) {
    for (let i = 0; i < 8; i++) { if (this._drivePinHighZ(comp, gate.outputs[i])) changed = true; }
  } else {
    for (let i = 0; i < 8; i++) {
      if (this._drivePinBit(comp, gate.outputs[i], comp.state.q[i])) changed = true;
    }
  }
  if (this._drivePinBit(comp, gate.outputs[8], intVal)) changed = true;
  return changed;
}

function _evaluateFifo64x4_fn(comp, gate) {
  // 74413: 64×4 FIFO.
  // inputs: [DIN0..DIN3, WR_CLK, RD_CLK, WR_EN, RD_EN]
  // outputs: [DOUT0..DOUT3, EF, FF]
  const bits = this._readGateInputs(comp, gate.inputs);
  const [d0,d1,d2,d3, wrClk, rdClk, wrEn, rdEn] = bits;
  if (!comp.state) comp.state = {
    fifo: [], prevWrClk: wrClk, prevRdClk: rdClk, dout: [0,0,0,0]
  };
  let changed = false;
  if (comp.state.prevWrClk === 0 && wrClk === 1 && wrEn) {
    if (comp.state.fifo.length < 64) {
      comp.state.fifo.push((d0|(d1<<1)|(d2<<2)|(d3<<3)) & 0xF);
    }
  }
  if (comp.state.prevRdClk === 0 && rdClk === 1 && rdEn) {
    if (comp.state.fifo.length > 0) {
      const v = comp.state.fifo.shift();
      comp.state.dout = [(v>>0)&1,(v>>1)&1,(v>>2)&1,(v>>3)&1];
    }
  }
  comp.state.prevWrClk = wrClk;
  comp.state.prevRdClk = rdClk;
  const ef = comp.state.fifo.length === 0 ? 1 : 0;
  const ff = comp.state.fifo.length >= 64 ? 1 : 0;
  for (let i = 0; i < 4; i++) {
    if (this._drivePinBit(comp, gate.outputs[i], comp.state.dout[i])) changed = true;
  }
  if (this._drivePinBit(comp, gate.outputs[4], ef)) changed = true;
  if (this._drivePinBit(comp, gate.outputs[5], ff)) changed = true;
  return changed;
}

// ── Assign Block 24 evaluators to CircuitSimulator.prototype ─────────────────
chipEvaluators._evaluateDFfQuadTriCompl        = _evaluateDFfQuadTriCompl_fn;
chipEvaluators._evaluateCounterDecadeDual      = _evaluateCounterDecadeDual_fn;
chipEvaluators._evaluateCounter4BitDual        = _evaluateCounter4BitDual_fn;
chipEvaluators._evaluateShiftReg4BitTri        = _evaluateShiftReg4BitTri_fn;
chipEvaluators._evaluateDFfOctalOcPar          = _evaluateDFfOctalOcPar_fn;
chipEvaluators._evaluateMuxQuad2to1StoredCompl = _evaluateMuxQuad2to1StoredCompl_fn;
chipEvaluators._evaluateCrc16Bit               = _evaluateCrc16Bit_fn;
chipEvaluators._evaluatePolyChecker            = _evaluatePolyChecker_fn;
chipEvaluators._evaluateFifo16x4Tri            = _evaluateFifo16x4Tri_fn;
chipEvaluators._evaluateDecoder3to8Inv         = _evaluateDecoder3to8Inv_fn;
chipEvaluators._evaluateDataAccessReg8Bit      = _evaluateDataAccessReg8Bit_fn;
chipEvaluators._evaluateRam16x4RegTri          = _evaluateRam16x4RegTri_fn;
chipEvaluators._evaluateMultimodeLatch8Bit     = _evaluateMultimodeLatch8Bit_fn;
chipEvaluators._evaluateFifo64x4               = _evaluateFifo64x4_fn;

// ---------------------------------------------------------------------------
// BLOCK 25 Evaluators (74414 74445)
// ---------------------------------------------------------------------------

function _evaluateIntrPriorityCtrl_fn(comp, gate) {
  // 74414: Interrupt Priority Controller complex, stub all outputs LOW
  let changed = false;
  for (const pin of gate.outputs) {
    if (this._drivePinBit(comp, pin, 0)) changed = true;
  }
  return changed;
}

function _evaluateBusXcvr4BitTri_fn(comp, gate) {
  // 74416: 4 bit Bus Transceiver, tri-state
  // inputs: OEn, DIR, A1..A4   outputs: B1..B4
  // OEn=1 → HiZ; DIR=0 → A→B non-inv; DIR=1 → stub HiZ
  const bits = this._readGateInputs(comp, gate.inputs);
  const OEn = bits[0], DIR = bits[1];
  let changed = false;
  if (OEn !== 0 || DIR !== 0) {
    for (const pin of gate.outputs) { if (this._drivePinHighZ(comp, pin)) changed = true; }
    return changed;
  }
  for (let i = 0; i < 4; i++) {
    if (this._drivePinBit(comp, gate.outputs[i], bits[2+i])) changed = true;
  }
  return changed;
}

function _evaluateCounterMod2Mod5_fn(comp, gate) {
  // 74417: Modulo-2/Modulo-5 counter
  // inputs: CLK2, CLK5, P0, P1, P2, LD, CLRn  outputs: Q0, Q1, Q2
  // ÷2: CLK2 falling → Q0 toggles
  // ÷5: CLK5 falling → internal div5 (0..4) increments, Q1=(div5>>0)&1, Q2=(div5>>1)&1
  const bits = this._readGateInputs(comp, gate.inputs);
  const CLK2 = bits[0], CLK5 = bits[1];
  const P0 = bits[2], P1 = bits[3], P2 = bits[4];
  const LD = bits[5], CLRn = bits[6];

  if (!comp.state) comp.state = {};
  if (comp.state.q0 === undefined) { comp.state.q0 = 0; comp.state.div5 = 0; }
  if (comp.state._clk2Prev === undefined) comp.state._clk2Prev = CLK2;
  if (comp.state._clk5Prev === undefined) comp.state._clk5Prev = CLK5;

  if (CLRn === 0) {
    comp.state.q0 = 0; comp.state.div5 = 0;
  } else if (LD === 1) {
    comp.state.q0 = P0;
    // Reconstruct div5 from P1,P2 (P1=bit0, P2=bit1 of div5)
    comp.state.div5 = (P1 & 1) | ((P2 & 1) << 1);
    if (comp.state.div5 >= 5) comp.state.div5 = 0;
  } else {
    if (comp.state._clk2Prev === 1 && CLK2 === 0) {
      comp.state.q0 ^= 1;
    }
    if (comp.state._clk5Prev === 1 && CLK5 === 0) {
      comp.state.div5 = (comp.state.div5 + 1) % 5;
    }
  }
  comp.state._clk2Prev = CLK2;
  comp.state._clk5Prev = CLK5;

  const Q0 = comp.state.q0;
  const Q1 = (comp.state.div5 >> 0) & 1;
  const Q2 = (comp.state.div5 >> 1) & 1;

  let changed = false;
  if (this._drivePinBit(comp, gate.outputs[0], Q0)) changed = true;
  if (this._drivePinBit(comp, gate.outputs[1], Q1)) changed = true;
  if (this._drivePinBit(comp, gate.outputs[2], Q2)) changed = true;
  return changed;
}

function _evaluateClkGenTwophase_fn(comp, gate) {
  // 74424: Two-phase Clock Generator stub, all outputs HiZ
  let changed = false;
  for (const pin of gate.outputs) { if (this._drivePinHighZ(comp, pin)) changed = true; }
  return changed;
}

function _evaluateBufferQuadTriNlow_fn(comp, gate) {
  // 74425: Quad Buffer, active LOW individual enables, tri-state
  // inputs: A1,E1n, A2,E2n, A3,E3n, A4,E4n   outputs: Y1..Y4
  const bits = this._readGateInputs(comp, gate.inputs);
  let changed = false;
  for (let i = 0; i < 4; i++) {
    const A = bits[i*2], En = bits[i*2+1];
    if (En !== 0) {
      if (this._drivePinHighZ(comp, gate.outputs[i])) changed = true;
    } else {
      if (this._drivePinBit(comp, gate.outputs[i], A)) changed = true;
    }
  }
  return changed;
}

function _evaluateBufferQuadTriNhigh_fn(comp, gate) {
  // 74426: Quad Buffer, active HIGH individual enables, tri-state
  // inputs: A1,E1, A2,E2, A3,E3, A4,E4   outputs: Y1..Y4
  const bits = this._readGateInputs(comp, gate.inputs);
  let changed = false;
  for (let i = 0; i < 4; i++) {
    const A = bits[i*2], En = bits[i*2+1];
    if (En === 0) {
      if (this._drivePinHighZ(comp, gate.outputs[i])) changed = true;
    } else {
      if (this._drivePinBit(comp, gate.outputs[i], A)) changed = true;
    }
  }
  return changed;
}

function _evaluateFifo64x4Tri_fn(comp, gate) {
  // 74433: 64×4 FIFO with tri-state outputs
  // inputs: DIN0..DIN3, WR_CLK, RD_CLK, WR_EN, RD_EN, OEn
  // outputs: DOUT0..DOUT3, EF, FF
  const bits = this._readGateInputs(comp, gate.inputs);
  const WR_CLK = bits[4], RD_CLK = bits[5], WR_EN = bits[6], RD_EN = bits[7], OEn = bits[8];

  if (!comp.state) comp.state = {};
  if (!comp.state._fifo64t) comp.state._fifo64t = [];
  if (comp.state._wcp64t === undefined) comp.state._wcp64t = WR_CLK;
  if (comp.state._rcp64t === undefined) comp.state._rcp64t = RD_CLK;

  const fifo = comp.state._fifo64t;
  if (comp.state._wcp64t === 0 && WR_CLK === 1 && WR_EN === 1 && fifo.length < 64) {
    fifo.push(bits[0] | (bits[1]<<1) | (bits[2]<<2) | (bits[3]<<3));
  }
  let rdOut = comp.state._ro64t || 0;
  if (comp.state._rcp64t === 0 && RD_CLK === 1 && RD_EN === 1 && fifo.length > 0) {
    rdOut = fifo.shift();
  }
  comp.state._ro64t = rdOut;
  comp.state._wcp64t = WR_CLK;
  comp.state._rcp64t = RD_CLK;

  const EF = fifo.length === 0 ? 1 : 0;
  const FF = fifo.length >= 64 ? 1 : 0;
  let changed = false;
  for (let i = 0; i < 4; i++) {
    if (OEn !== 0) {
      if (this._drivePinHighZ(comp, gate.outputs[i])) changed = true;
    } else {
      if (this._drivePinBit(comp, gate.outputs[i], (rdOut >> i) & 1)) changed = true;
    }
  }
  if (this._drivePinBit(comp, gate.outputs[4], EF)) changed = true;
  if (this._drivePinBit(comp, gate.outputs[5], FF)) changed = true;
  return changed;
}

function _evaluateLineDriver6x_fn(comp, gate) {
  // 74436/74437: 6-channel Line Driver
  // inputs: A1..A6, OEn, EN   outputs: Y1..Y6
  const bits = this._readGateInputs(comp, gate.inputs);
  const OEn = bits[6], EN = bits[7];
  let changed = false;
  if (OEn !== 0 || EN === 0) {
    for (const pin of gate.outputs) { if (this._drivePinHighZ(comp, pin)) changed = true; }
    return changed;
  }
  for (let i = 0; i < 6; i++) {
    if (this._drivePinBit(comp, gate.outputs[i], bits[i])) changed = true;
  }
  return changed;
}

function _evaluateBusXcvrQuadTriOc_fn(comp, gate) {
  // 74440: Quad Bus Transceiver, OC outputs
  // inputs: OE1n, OE2n, DIR, A1..A4   outputs: B1..B4
  const bits = this._readGateInputs(comp, gate.inputs);
  const OE1n = bits[0], OE2n = bits[1], DIR = bits[2];
  let changed = false;
  if (OE1n !== 0 || OE2n !== 0 || DIR !== 0) {
    for (const pin of gate.outputs) { if (this._drivePinHighZ(comp, pin)) changed = true; }
    return changed;
  }
  for (let i = 0; i < 4; i++) {
    if (this._drivePinBit(comp, gate.outputs[i], bits[3+i])) changed = true;
  }
  return changed;
}

function _evaluateBusXcvrQuadInvOc_fn(comp, gate) {
  // 74441: Quad Inverting Bus Transceiver, OC outputs
  // inputs: OE1n, OE2n, DIR, A1..A4   outputs: B1..B4
  const bits = this._readGateInputs(comp, gate.inputs);
  const OE1n = bits[0], OE2n = bits[1], DIR = bits[2];
  let changed = false;
  if (OE1n !== 0 || OE2n !== 0 || DIR !== 0) {
    for (const pin of gate.outputs) { if (this._drivePinHighZ(comp, pin)) changed = true; }
    return changed;
  }
  for (let i = 0; i < 4; i++) {
    if (this._drivePinBit(comp, gate.outputs[i], bits[3+i] ? 0 : 1)) changed = true;
  }
  return changed;
}

function _evaluateBusXcvrQuadTri_fn(comp, gate) {
  // 74442: Quad Bus Transceiver, tri-state outputs
  // inputs: OE1n, OE2n, DIR, A1..A4   outputs: B1..B4
  const bits = this._readGateInputs(comp, gate.inputs);
  const OE1n = bits[0], OE2n = bits[1], DIR = bits[2];
  let changed = false;
  if (OE1n !== 0 || OE2n !== 0 || DIR !== 0) {
    for (const pin of gate.outputs) { if (this._drivePinHighZ(comp, pin)) changed = true; }
    return changed;
  }
  for (let i = 0; i < 4; i++) {
    if (this._drivePinBit(comp, gate.outputs[i], bits[3+i])) changed = true;
  }
  return changed;
}

function _evaluateBusXcvrQuadInvTri_fn(comp, gate) {
  // 74443: Quad Inverting Bus Transceiver, tri-state outputs
  // inputs: OE1n, OE2n, DIR, A1..A4   outputs: B1..B4
  const bits = this._readGateInputs(comp, gate.inputs);
  const OE1n = bits[0], OE2n = bits[1], DIR = bits[2];
  let changed = false;
  if (OE1n !== 0 || OE2n !== 0 || DIR !== 0) {
    for (const pin of gate.outputs) { if (this._drivePinHighZ(comp, pin)) changed = true; }
    return changed;
  }
  for (let i = 0; i < 4; i++) {
    if (this._drivePinBit(comp, gate.outputs[i], bits[3+i] ? 0 : 1)) changed = true;
  }
  return changed;
}

function _evaluateBusXcvrQuadMixTri_fn(comp, gate) {
  // 74444: Quad Mixed Bus Transceiver, tri-state outputs
  // DIR=0 → A→B non-inv; DIR=1 → stub HiZ
  const bits = this._readGateInputs(comp, gate.inputs);
  const OE1n = bits[0], OE2n = bits[1], DIR = bits[2];
  let changed = false;
  if (OE1n !== 0 || OE2n !== 0 || DIR !== 0) {
    for (const pin of gate.outputs) { if (this._drivePinHighZ(comp, pin)) changed = true; }
    return changed;
  }
  for (let i = 0; i < 4; i++) {
    if (this._drivePinBit(comp, gate.outputs[i], bits[3+i])) changed = true;
  }
  return changed;
}

// Prototype assignments Block 25
chipEvaluators._evaluateIntrPriorityCtrl      = _evaluateIntrPriorityCtrl_fn;
chipEvaluators._evaluateBusXcvr4BitTri        = _evaluateBusXcvr4BitTri_fn;
chipEvaluators._evaluateCounterMod2Mod5       = _evaluateCounterMod2Mod5_fn;
chipEvaluators._evaluateClkGenTwophase        = _evaluateClkGenTwophase_fn;
chipEvaluators._evaluateBufferQuadTriNlow     = _evaluateBufferQuadTriNlow_fn;
chipEvaluators._evaluateBufferQuadTriNhigh    = _evaluateBufferQuadTriNhigh_fn;
chipEvaluators._evaluateFifo64x4Tri           = _evaluateFifo64x4Tri_fn;
chipEvaluators._evaluateLineDriver6x          = _evaluateLineDriver6x_fn;
chipEvaluators._evaluateBusXcvrQuadTriOc      = _evaluateBusXcvrQuadTriOc_fn;
chipEvaluators._evaluateBusXcvrQuadInvOc      = _evaluateBusXcvrQuadInvOc_fn;
chipEvaluators._evaluateBusXcvrQuadTri        = _evaluateBusXcvrQuadTri_fn;
chipEvaluators._evaluateBusXcvrQuadInvTri     = _evaluateBusXcvrQuadInvTri_fn;
chipEvaluators._evaluateBusXcvrQuadMixTri     = _evaluateBusXcvrQuadMixTri_fn;


// ---------------------------------------------------------------------------
// BLOCK 26 Evaluators (74446 74461)
// ---------------------------------------------------------------------------



function _evaluateMux16to1Compl_fn(comp, gate) {
  // 74x450: 16-to-1 mux with complementary outputs (W only, inverted).
  // inputs: [E0..E15, A, B, C, D, Gn]  outputs: [W]
  // Gn=1 → W=1 (disabled). Else W = NOT(selected data).
  const bits = this._readGateInputs(comp, gate.inputs);
  const gn = bits[20];
  let changed = false;
  if (gn !== 0) {
    if (this._drivePinBit(comp, gate.outputs[0], 1)) changed = true;
    return changed;
  }
  const sel  = bits[16] | (bits[17] << 1) | (bits[18] << 2) | (bits[19] << 3);
  const data = bits[sel];
  if (this._drivePinBit(comp, gate.outputs[0], data ? 0 : 1)) changed = true;
  return changed;
}

function _evaluateCounterDecadeDualSync_fn(comp, gate) {
  // 74452: Dual synchronous decade counter with individual CLK and CLRn.
  // inputs: [CLK1, CLRn1, CLK2, CLRn2]
  // outputs: [QA1, QB1, QC1, QD1, TC1, QA2, QB2, QC2, QD2, TC2]
  if (!comp.state) comp.state = {};
  if (comp.state.cnt1 === undefined) { comp.state.cnt1 = 0; comp.state.clk1Last = 0; }
  if (comp.state.cnt2 === undefined) { comp.state.cnt2 = 0; comp.state.clk2Last = 0; }
  const bits = this._readGateInputs(comp, gate.inputs);
  const [clk1, clrn1, clk2, clrn2] = bits;
  let changed = false;

  // Section 1
  if (clrn1 === 0) {
    comp.state.cnt1 = 0;
  } else if (clk1 === 1 && comp.state.clk1Last === 0) {
    comp.state.cnt1 = (comp.state.cnt1 + 1) % 10;
  }
  comp.state.clk1Last = clk1;

  // Section 2
  if (clrn2 === 0) {
    comp.state.cnt2 = 0;
  } else if (clk2 === 1 && comp.state.clk2Last === 0) {
    comp.state.cnt2 = (comp.state.cnt2 + 1) % 10;
  }
  comp.state.clk2Last = clk2;

  const c1 = comp.state.cnt1;
  const c2 = comp.state.cnt2;
  const tc1 = (c1 === 9) ? 1 : 0;
  const tc2 = (c2 === 9) ? 1 : 0;
  // outputs: [QA1, QB1, QC1, QD1, TC1, QA2, QB2, QC2, QD2, TC2]
  const outBits = [
    (c1>>0)&1, (c1>>1)&1, (c1>>2)&1, (c1>>3)&1, tc1,
    (c2>>0)&1, (c2>>1)&1, (c2>>2)&1, (c2>>3)&1, tc2,
  ];
  for (let i = 0; i < gate.outputs.length; i++) {
    if (this._drivePinBit(comp, gate.outputs[i], outBits[i])) changed = true;
  }
  return changed;
}

function _evaluateMuxQuad4to1_fn(comp, gate) {
  // 74x453: Quad 4-to-1 mux with common select lines S0, S1.
  // inputs: [C1_0,C1_1,C1_2,C1_3, C2_0,C2_1,C2_2,C2_3,
  //          C3_0,C3_1,C3_2,C3_3, C4_0,C4_1,C4_2,C4_3, S0,S1]
  // outputs: [Y1, Y2, Y3, Y4]
  const bits = this._readGateInputs(comp, gate.inputs);
  const s0 = bits[16], s1 = bits[17];
  const sel = s0 | (s1 << 1);
  let changed = false;
  for (let sec = 0; sec < 4; sec++) {
    const base = sec * 4;
    const data = bits[base + sel];
    if (this._drivePinBit(comp, gate.outputs[sec], data)) changed = true;
  }
  return changed;
}

function _evaluateCounterDecadeUpdownDual_fn(comp, gate) {
  // 74454: Dual decade up/down counter (shares CLK, U/Dn, ENT, LOADn, CLRn).
  // inputs: [CLK, CLK2, U_Dn, ENP, ENT, ENP2, LOADn, CLRn,
  //          P0,P1,P2,P3, P4,P5,P6,P7]
  // outputs: [Q0,Q1,Q2,Q3, TCD,TCU]
  // (Two independent 4 bit sections sharing some controls; we model here as one.)
  if (!comp.state) comp.state = {};
  if (comp.state.cnt === undefined) { comp.state.cnt = 0; comp.state.clkLast = 0; }
  const bits = this._readGateInputs(comp, gate.inputs);
  const [clk,clk2,ud,enp,ent,enp2,loadn,clrn] = bits;
  const p = (bits[8]) | (bits[9]<<1) | (bits[10]<<2) | (bits[11]<<3) |
            (bits[12]<<4) | (bits[13]<<5) | (bits[14]<<6) | (bits[15]<<7);
  let changed = false;

  if (clrn === 0) {
    comp.state.cnt = 0;
  } else if (loadn === 0) {
    comp.state.cnt = p & 0x0F; // load lower nibble
  } else if (clk === 1 && comp.state.clkLast === 0 && enp !== 0 && ent !== 0) {
    if (ud === 0) {
      comp.state.cnt = (comp.state.cnt + 1) % 10;
    } else {
      comp.state.cnt = (comp.state.cnt === 0) ? 9 : comp.state.cnt - 1;
    }
  }
  comp.state.clkLast = clk;

  const c = comp.state.cnt & 0xF;
  const tcu = (ud === 0 && c === 9 && ent !== 0) ? 1 : 0;
  const tcd = (ud !== 0 && c === 0 && ent !== 0) ? 1 : 0;
  const outBits = [(c>>0)&1, (c>>1)&1, (c>>2)&1, (c>>3)&1, tcd, tcu];
  for (let i = 0; i < gate.outputs.length; i++) {
    if (this._drivePinBit(comp, gate.outputs[i], outBits[i])) changed = true;
  }
  return changed;
}

function _evaluateBufferOctalParityInv_fn(comp, gate) {
  // 74F455: Octal buffer with parity, inverting outputs, tri-state.
  // inputs: [A0..A7, OEn, EP]  outputs: [Y0..Y7, PERR]
  // OEn=1 → all outputs HiZ.
  // EP=0: even parity. EP=1: odd parity. PERR=1 when parity error detected.
  // Y outputs are inverted.
  const bits = this._readGateInputs(comp, gate.inputs);
  const oen = bits[8], ep = bits[9];
  let changed = false;
  if (oen !== 0) {
    for (const op of gate.outputs) { if (this._drivePinHighZ(comp, op)) changed = true; }
    return changed;
  }
  let ones = 0;
  for (let i = 0; i < 8; i++) ones += bits[i];
  // Drive inverted data outputs
  for (let i = 0; i < 8; i++) {
    if (this._drivePinBit(comp, gate.outputs[i], bits[i] ? 0 : 1)) changed = true;
  }
  // Parity: EP=0 → even parity expected; PERR=1 when odd count
  // EP=1 → odd parity expected; PERR=1 when even count
  const perr = ep ? ((ones % 2) === 0 ? 1 : 0) : ((ones % 2) !== 0 ? 1 : 0);
  if (this._drivePinBit(comp, gate.outputs[8], perr)) changed = true;
  return changed;
}

function _evaluateBufferOctalParity_fn(comp, gate) {
  // 74F456: Octal buffer with parity, non-inverting outputs, tri-state.
  // inputs: [A0..A7, OEn, EP]  outputs: [Y0..Y7, PERR]
  const bits = this._readGateInputs(comp, gate.inputs);
  const oen = bits[8], ep = bits[9];
  let changed = false;
  if (oen !== 0) {
    for (const op of gate.outputs) { if (this._drivePinHighZ(comp, op)) changed = true; }
    return changed;
  }
  let ones = 0;
  for (let i = 0; i < 8; i++) ones += bits[i];
  // Drive non-inverted data outputs
  for (let i = 0; i < 8; i++) {
    if (this._drivePinBit(comp, gate.outputs[i], bits[i])) changed = true;
  }
  const perr = ep ? ((ones % 2) === 0 ? 1 : 0) : ((ones % 2) !== 0 ? 1 : 0);
  if (this._drivePinBit(comp, gate.outputs[8], perr)) changed = true;
  return changed;
}

function _evaluateNinesComplement_fn(comp, gate) {
  // 74458: Nines complement / zero element.
  // inputs: [A0,A1,A2,A3, ZEn]  outputs: [Y0,Y1,Y2,Y3]
  // ZEn=1: Y = 9's complement of BCD digit (9 - A if A<=9, else 0).
  // ZEn=0: Y = 0 (zero element).
  const bits = this._readGateInputs(comp, gate.inputs);
  const a = bits[0] | (bits[1]<<1) | (bits[2]<<2) | (bits[3]<<3);
  const zen = bits[4];
  let changed = false;
  let result = 0;
  if (zen !== 0 && a <= 9) {
    result = 9 - a;
  }
  for (let i = 0; i < 4; i++) {
    if (this._drivePinBit(comp, gate.outputs[i], (result >> i) & 1)) changed = true;
  }
  return changed;
}

function _evaluateComparator10Bit_fn(comp, gate) {
  // 74x460: 10 bit identity comparator.
  // inputs: [A0..A9, B0..B9, OEn]  outputs: [AEQB]
  // OEn=1 → AEQB = HiZ. Else AEQB=1 if A==B, 0 otherwise.
  const bits = this._readGateInputs(comp, gate.inputs);
  const oen = bits[20];
  let changed = false;
  if (oen !== 0) {
    if (this._drivePinHighZ(comp, gate.outputs[0])) changed = true;
    return changed;
  }
  let aEqB = 1;
  for (let i = 0; i < 10; i++) {
    if (bits[i] !== bits[10 + i]) { aEqB = 0; break; }
  }
  if (this._drivePinBit(comp, gate.outputs[0], aEqB)) changed = true;
  return changed;
}

function _evaluateCounter8BitPreset_fn(comp, gate) {
  // 74461: 8 bit presettable binary counter, tri-state outputs.
  // inputs: [CLK, CLRn, LOADn, ENP, ENT, OEn, P0..P7]
  // outputs: [Q1..Q7, RCO]  (note: Q0 not exposed, Q7 MSB; actual bit order Q1..Q7 = bits 1..7)
  // Actually outputs: [Q1,Q2,Q3,Q4,Q5,Q6,Q7,RCO] where bit i corresponds to count bit i.
  if (!comp.state) comp.state = {};
  if (comp.state.cnt === undefined) { comp.state.cnt = 0; comp.state.clkLast = 0; }
  const bits = this._readGateInputs(comp, gate.inputs);
  const [clk,clrn,loadn,enp,ent,oen] = bits;
  const p = bits[6] | (bits[7]<<1) | (bits[8]<<2) | (bits[9]<<3) |
            (bits[10]<<4) | (bits[11]<<5) | (bits[12]<<6) | (bits[13]<<7);
  let changed = false;

  if (clrn === 0) {
    comp.state.cnt = 0;
  } else if (loadn === 0) {
    comp.state.cnt = p & 0xFF;
  } else if (clk === 1 && comp.state.clkLast === 0 && enp !== 0 && ent !== 0) {
    comp.state.cnt = (comp.state.cnt + 1) & 0xFF;
  }
  comp.state.clkLast = clk;

  if (oen !== 0) {
    for (const op of gate.outputs) { if (this._drivePinHighZ(comp, op)) changed = true; }
    return changed;
  }
  const c = comp.state.cnt;
  const rco = (c === 0xFF && ent !== 0) ? 1 : 0;
  // outputs order: Q1,Q2,Q3,Q4,Q5,Q6,Q7,RCO  (bits 1-7 of counter, then carry)
  const outBits = [
    (c>>1)&1, (c>>2)&1, (c>>3)&1, (c>>4)&1,
    (c>>5)&1, (c>>6)&1, (c>>7)&1, rco,
  ];
  for (let i = 0; i < gate.outputs.length; i++) {
    if (this._drivePinBit(comp, gate.outputs[i], outBits[i])) changed = true;
  }
  return changed;
}

chipEvaluators._evaluateMux16to1Compl          = _evaluateMux16to1Compl_fn;
chipEvaluators._evaluateCounterDecadeDualSync  = _evaluateCounterDecadeDualSync_fn;
chipEvaluators._evaluateMuxQuad4to1            = _evaluateMuxQuad4to1_fn;
chipEvaluators._evaluateCounterDecadeUpdownDual = _evaluateCounterDecadeUpdownDual_fn;
chipEvaluators._evaluateBufferOctalParityInv   = _evaluateBufferOctalParityInv_fn;
chipEvaluators._evaluateBufferOctalParity      = _evaluateBufferOctalParity_fn;
chipEvaluators._evaluateNinesComplement        = _evaluateNinesComplement_fn;
chipEvaluators._evaluateComparator10Bit        = _evaluateComparator10Bit_fn;
chipEvaluators._evaluateCounter8BitPreset      = _evaluateCounter8BitPreset_fn;

// ── Block 27 evaluators ───────────────────────────────────────────────────────

function _evaluateFiberOpticTx_fn(comp, gate) {
  // Fiber-optic transmitter stub: drive TX=0
  let changed = false;
  if (this._drivePinBit(comp, gate.outputs[0], 0)) changed = true;
  return changed;
}

function _evaluateFiberOpticRx_fn(comp, gate) {
  // Fiber-optic receiver stub: drive all outputs=0
  let changed = false;
  for (const op of gate.outputs) {
    if (this._drivePinBit(comp, op, 0)) changed = true;
  }
  return changed;
}

function _evaluateBufferOctalTri_fn(comp, gate) {
  // 74465/74467: Octal buffer, non-inverting, tri-state
  // inputs: [A1..A8, G1n, G2n]  outputs: [Y1..Y8]
  const bits = this._readGateInputs(comp, gate.inputs);
  const g1n = bits[8], g2n = bits[9];
  let changed = false;
  if (g1n !== 0 || g2n !== 0) {
    for (const op of gate.outputs) { if (this._drivePinHighZ(comp, op)) changed = true; }
    return changed;
  }
  for (let i = 0; i < 8; i++) {
    if (this._drivePinBit(comp, gate.outputs[i], bits[i])) changed = true;
  }
  return changed;
}

function _evaluateBufferOctalInvTri_fn(comp, gate) {
  // 74466/74468: Octal buffer, inverting outputs, tri-state
  // inputs: [A1..A8, G1n, G2n]  outputs: [Y1..Y8]
  const bits = this._readGateInputs(comp, gate.inputs);
  const g1n = bits[8], g2n = bits[9];
  let changed = false;
  if (g1n !== 0 || g2n !== 0) {
    for (const op of gate.outputs) { if (this._drivePinHighZ(comp, op)) changed = true; }
    return changed;
  }
  for (let i = 0; i < 8; i++) {
    if (this._drivePinBit(comp, gate.outputs[i], bits[i] ^ 1)) changed = true;
  }
  return changed;
}

function _evaluateCounter8BitUpdownSync_fn(comp, gate) {
  // 74469: 8 bit synchronous up/down counter
  // inputs: [CLK, LOADn, U_Dn, ENn, OEn, P0..P7]  outputs: [Q0..Q7, RCO]
  // ENn=0 -> enabled; U_Dn=0 -> up; U_Dn=1 -> down; OEn=1 -> HiZ
  // LOADn=0 -> parallel load (async)
  if (!comp.state) comp.state = {};
  if (comp.state.cnt === undefined) { comp.state.cnt = 0; comp.state.clkLast = 0; }
  const bits = this._readGateInputs(comp, gate.inputs);
  const clk = bits[0], loadn = bits[1], ud = bits[2], enn = bits[3], oen = bits[4];
  const p = bits[5] | (bits[6] << 1) | (bits[7] << 2) | (bits[8] << 3) |
            (bits[9] << 4) | (bits[10] << 5) | (bits[11] << 6) | (bits[12] << 7);
  let changed = false;
  if (loadn === 0) {
    comp.state.cnt = p & 0xFF;
  } else if (clk === 1 && comp.state.clkLast === 0 && enn === 0) {
    if (ud === 0) comp.state.cnt = (comp.state.cnt + 1) & 0xFF;
    else comp.state.cnt = (comp.state.cnt + 255) & 0xFF;
  }
  comp.state.clkLast = clk;
  if (oen !== 0) {
    for (const op of gate.outputs) { if (this._drivePinHighZ(comp, op)) changed = true; }
    return changed;
  }
  const c = comp.state.cnt;
  const rco = (ud === 0 ? (c === 0xFF) : (c === 0x00)) ? 1 : 0;
  const outBits = [(c >> 0) & 1, (c >> 1) & 1, (c >> 2) & 1, (c >> 3) & 1,
                   (c >> 4) & 1, (c >> 5) & 1, (c >> 6) & 1, (c >> 7) & 1, rco];
  for (let i = 0; i < gate.outputs.length; i++) {
    if (this._drivePinBit(comp, gate.outputs[i], outBits[i])) changed = true;
  }
  return changed;
}









chipEvaluators._evaluateFiberOpticTx         = _evaluateFiberOpticTx_fn;
chipEvaluators._evaluateFiberOpticRx         = _evaluateFiberOpticRx_fn;
chipEvaluators._evaluateBufferOctalTri       = _evaluateBufferOctalTri_fn;
chipEvaluators._evaluateBufferOctalInvTri    = _evaluateBufferOctalInvTri_fn;
chipEvaluators._evaluateCounter8BitUpdownSync = _evaluateCounter8BitUpdownSync_fn;

// ─── Block 28 evaluators ─────────────────────────────────────────────────────

// 74480: Burst Error Recovery (stub)
function _evaluateBurstErrRecovery_fn(comp, gate) {
  let changed = false;
  // Stub: drive ERR=0, Q0-Q7=0
  for (const p of gate.outputs) {
    if (this._drivePinBit(comp, p, 0)) changed = true;
  }
  return changed;
}

// 74482: 4 bit Control Slice (stub)
function _evaluateControlSlice4Bit_fn(comp, gate) {
  let changed = false;
  for (const p of gate.outputs) {
    if (this._drivePinBit(comp, p, 0)) changed = true;
  }
  return changed;
}

// 74484: BCD-to-Binary Converter
// inputs: A1 B1 C1 D1 A2 B2 C2 D2 OEn
// outputs: Y0-Y6 (7 bit binary = ones + tens*10, 0-99)
function _evaluateBcdToBin_fn(comp, gate) {
  const bits = this._readGateInputs(comp, gate.inputs);
  const [a1, b1, c1, d1, a2, b2, c2, d2, oen] = bits;
  let changed = false;
  if (oen) {
    for (const p of gate.outputs) {
      if (this._drivePinHighZ(comp, p)) changed = true;
    }
    return changed;
  }
  const ones = (d1 << 3) | (c1 << 2) | (b1 << 1) | a1;
  const tens = (d2 << 3) | (c2 << 2) | (b2 << 1) | a2;
  const val = tens * 10 + ones;
  for (let i = 0; i < gate.outputs.length; i++) {
    if (this._drivePinBit(comp, gate.outputs[i], (val >> i) & 1)) changed = true;
  }
  return changed;
}

// 74485: Binary-to-BCD Converter
// inputs: I0-I6 OEn
// outputs: A1 B1 C1 D1 A2 B2 C2 D2
function _evaluateBinToBcd_fn(comp, gate) {
  const bits = this._readGateInputs(comp, gate.inputs);
  const oen = bits[7];
  let changed = false;
  if (oen) {
    for (const p of gate.outputs) {
      if (this._drivePinHighZ(comp, p)) changed = true;
    }
    return changed;
  }
  let val = 0;
  for (let i = 0; i < 7; i++) val |= (bits[i] << i);
  const tens = Math.floor(val / 10);
  const ones = val % 10;
  // outputs: A1 B1 C1 D1 A2 B2 C2 D2
  const bcd = (ones & 0xF) | ((tens & 0xF) << 4);
  const outNames = gate.outputs; // [A1,B1,C1,D1,A2,B2,C2,D2]
  for (let i = 0; i < outNames.length; i++) {
    if (this._drivePinBit(comp, outNames[i], (bcd >> i) & 1)) changed = true;
  }
  return changed;
}

// 74491: 10 bit Up/Down synchronous counter
// inputs: CLK U_Dn ENn CLRn LOADn P0-P9 OEn
// outputs: Q0-Q5 (lower 6 bits of 10 bit counter)
function _evaluateCounter10BitUpdown_fn(comp, gate) {
  if (!comp.state) comp.state = {};
  const st = comp.state;
  if (st.cnt === undefined) st.cnt = 0;
  if (st.prevClk === undefined) st.prevClk = 0;
  const bits = this._readGateInputs(comp, gate.inputs);
  const [clk, udn, enn, clrn, loadn] = bits;
  // P0-P9 = bits[5..14], OEn = bits[15]
  const oen = bits[15];
  let changed = false;
  if (!clrn) { st.cnt = 0; }
  else if (!loadn) {
    let v = 0;
    for (let i = 0; i < 10; i++) v |= (bits[5 + i] << i);
    st.cnt = v & 0x3FF;
  } else if (clk && !st.prevClk && !enn) {
    if (!udn) { st.cnt = (st.cnt + 1) & 0x3FF; }
    else       { st.cnt = (st.cnt - 1 + 1024) & 0x3FF; }
  }
  st.prevClk = clk;
  for (let i = 0; i < gate.outputs.length; i++) {
    const bit = oen ? 0 : (st.cnt >> i) & 1;
    if (oen && this._drivePinHighZ(comp, gate.outputs[i])) changed = true;
    else if (!oen && this._drivePinBit(comp, gate.outputs[i], bit)) changed = true;
  }
  return changed;
}

// 74498: 8 bit bidirectional shift register
// inputs: CLK S0 S1 SRL SRR P0-P7 OEn
// S1S0=00→hold; 01→shift right (Q0=SRR,Qi=Q[i-1]); 10→shift left (Q7=SRL,Qi=Q[i+1]); 11→parallel load
function _evaluateShiftReg8BitBidi_fn(comp, gate) {
  if (!comp.state) comp.state = {};
  const st = comp.state;
  if (st.reg === undefined) st.reg = 0;
  if (st.prevClk === undefined) st.prevClk = 0;
  const bits = this._readGateInputs(comp, gate.inputs);
  //     0    1   2   3    4    5-12   13
  const [clk, s0, s1, srl, srr] = bits;
  const oen = bits[13];
  let changed = false;
  if (clk && !st.prevClk) {
    const mode = (s1 << 1) | s0;
    if (mode === 0) { /* hold */ }
    else if (mode === 1) {
      // shift right: Q0=SRR, Qi = Q[i-1]
      st.reg = ((st.reg << 1) | srr) & 0xFF;
    } else if (mode === 2) {
      // shift left: Q7=SRL, Qi = Q[i+1]
      st.reg = ((st.reg >> 1) | (srl << 7)) & 0xFF;
    } else {
      // parallel load
      let v = 0;
      for (let i = 0; i < 8; i++) v |= (bits[5 + i] << i);
      st.reg = v & 0xFF;
    }
  }
  st.prevClk = clk;
  for (let i = 0; i < gate.outputs.length; i++) {
    if (oen) {
      if (this._drivePinHighZ(comp, gate.outputs[i])) changed = true;
    } else {
      if (this._drivePinBit(comp, gate.outputs[i], (st.reg >> i) & 1)) changed = true;
    }
  }
  return changed;
}

// 74500: 6 bit Flash ADC (stub)
function _evaluateAdc6BitFlash_fn(comp, gate) {
  let changed = false;
  for (const p of gate.outputs) {
    if (this._drivePinBit(comp, p, 0)) changed = true;
  }
  return changed;
}

// 74502: 8 bit SAR (stub)
function _evaluateSar8Bit_fn(comp, gate) {
  let changed = false;
  for (const p of gate.outputs) {
    const bit = (p === 'EOC' || p === 'SC') ? 1 : 0;
    if (this._drivePinBit(comp, p, bit)) changed = true;
  }
  return changed;
}

// 74503: 8 bit SAR with expansion (stub)
function _evaluateSar8BitExp_fn(comp, gate) {
  let changed = false;
  for (const p of gate.outputs) {
    const bit = (p === 'EOC' || p === 'EXP') ? 1 : 0;
    if (this._drivePinBit(comp, p, bit)) changed = true;
  }
  return changed;
}

// 74504: 12 bit SAR with expansion (stub)
function _evaluateSar12BitExp_fn(comp, gate) {
  let changed = false;
  for (const p of gate.outputs) {
    const bit = (p === 'EOC' || p === 'EXP') ? 1 : 0;
    if (this._drivePinBit(comp, p, bit)) changed = true;
  }
  return changed;
}

// 74505: 8 bit SAR ADC (stub)
function _evaluateAdc8BitSar_fn(comp, gate) {
  let changed = false;
  for (const p of gate.outputs) {
    const bit = (p === 'EOC') ? 1 : 0;
    if (this._drivePinBit(comp, p, bit)) changed = true;
  }
  return changed;
}

// 74508: 8 bit Multiplier (8x8 two's complement, lower 6 bits out)
// inputs: A0-A7 B0-B7
// outputs: P0-P5 (lower 6 bits of 16 bit product)
function _evaluateMultiplier8Bit_fn(comp, gate) {
  const bits = this._readGateInputs(comp, gate.inputs);
  let aVal = 0, bVal = 0;
  for (let i = 0; i < 8; i++) aVal |= (bits[i] << i);
  for (let i = 0; i < 8; i++) bVal |= (bits[8 + i] << i);
  // Two's complement
  if (aVal & 0x80) aVal = aVal - 256;
  if (bVal & 0x80) bVal = bVal - 256;
  const product = aVal * bVal;
  let changed = false;
  for (let i = 0; i < gate.outputs.length; i++) {
    if (this._drivePinBit(comp, gate.outputs[i], (product >> i) & 1)) changed = true;
  }
  return changed;
}

// 74515: Programmable 2-to-4 decoder
// inputs: A0 A1 E0-E8 (9 enables)
// outputs: Y0n-Y3n (active LOW)
// All enables must be high (active HIGH) to enable decoding
function _evaluateDecoderProg2to4_fn(comp, gate) {
  const bits = this._readGateInputs(comp, gate.inputs);
  const [a0, a1] = bits;
  const addr = (a1 << 1) | a0;
  // E0-E8 are bits[2..10]; all must be 1 to enable
  let enable = 1;
  for (let i = 2; i < 11; i++) { if (!bits[i]) { enable = 0; break; } }
  let changed = false;
  for (let i = 0; i < gate.outputs.length; i++) {
    const out = (enable && addr === i) ? 0 : 1; // active LOW
    if (this._drivePinBit(comp, gate.outputs[i], out)) changed = true;
  }
  return changed;
}

// 74516: 4x4 bit Multiplier (two's complement, 8 bits out)
// inputs: A0-A3 B0-B3
// outputs: P0-P7 (8 bit product)
function _evaluateMultiplier16Bit_fn(comp, gate) {
  const bits = this._readGateInputs(comp, gate.inputs);
  let aVal = 0, bVal = 0;
  for (let i = 0; i < 4; i++) aVal |= (bits[i] << i);
  for (let i = 0; i < 4; i++) bVal |= (bits[4 + i] << i);
  // Two's complement 4 bit
  if (aVal & 0x8) aVal = aVal - 16;
  if (bVal & 0x8) bVal = bVal - 16;
  const product = aVal * bVal;
  let changed = false;
  for (let i = 0; i < gate.outputs.length; i++) {
    if (this._drivePinBit(comp, gate.outputs[i], (product >> i) & 1)) changed = true;
  }
  return changed;
}

chipEvaluators._evaluateBurstErrRecovery  = _evaluateBurstErrRecovery_fn;
chipEvaluators._evaluateControlSlice4Bit  = _evaluateControlSlice4Bit_fn;
chipEvaluators._evaluateBcdToBin          = _evaluateBcdToBin_fn;
chipEvaluators._evaluateBinToBcd          = _evaluateBinToBcd_fn;
chipEvaluators._evaluateCounter10BitUpdown = _evaluateCounter10BitUpdown_fn;
chipEvaluators._evaluateShiftReg8BitBidi  = _evaluateShiftReg8BitBidi_fn;
chipEvaluators._evaluateAdc6BitFlash      = _evaluateAdc6BitFlash_fn;
chipEvaluators._evaluateSar8Bit           = _evaluateSar8Bit_fn;
chipEvaluators._evaluateSar8BitExp        = _evaluateSar8BitExp_fn;
chipEvaluators._evaluateSar12BitExp       = _evaluateSar12BitExp_fn;
chipEvaluators._evaluateAdc8BitSar        = _evaluateAdc8BitSar_fn;
chipEvaluators._evaluateMultiplier8Bit    = _evaluateMultiplier8Bit_fn;
chipEvaluators._evaluateDecoderProg2to4   = _evaluateDecoderProg2to4_fn;
chipEvaluators._evaluateMultiplier16Bit   = _evaluateMultiplier16Bit_fn;

// ── Block 29 evaluators ───────────────────────────────────────────────────────

function _evaluateCmp8BitOc_fn(comp, gate) {
  // 74518/74519: 8 bit identity comparator, open-collector
  // inputs: G1n, A0-A7, B0-B7
  // G1n=1 → EQn=HiZ; equal→EQn=0; unequal→EQn=1
  const bits = this._readGateInputs(comp, gate.inputs);
  const g1n = bits[0];
  const eqnPin = gate.outputs[0];
  let changed = false;
  if (g1n) {
    if (this._drivePinHighZ(comp, eqnPin)) changed = true;
    return changed;
  }
  let aVal = 0, bVal = 0;
  for (let i = 0; i < 8; i++) aVal |= (bits[1 + i] << i);
  for (let i = 0; i < 8; i++) bVal |= (bits[9 + i] << i);
  const eqn = (aVal === bVal) ? 0 : 1;
  if (this._drivePinBit(comp, eqnPin, eqn)) changed = true;
  return changed;
}

function _evaluateCmp8BitInv_fn(comp, gate) {
  // 74520/74521: 8 bit inverting comparator, tri-state
  // inputs: G1n, A0-A7, B0-B7
  // G1n=1 → EQ=HiZ; equal→EQ=1; unequal→EQ=0
  const bits = this._readGateInputs(comp, gate.inputs);
  const g1n = bits[0];
  const eqPin = gate.outputs[0];
  let changed = false;
  if (g1n) {
    if (this._drivePinHighZ(comp, eqPin)) changed = true;
    return changed;
  }
  let aVal = 0, bVal = 0;
  for (let i = 0; i < 8; i++) aVal |= (bits[1 + i] << i);
  for (let i = 0; i < 8; i++) bVal |= (bits[9 + i] << i);
  const eq = (aVal === bVal) ? 1 : 0;
  if (this._drivePinBit(comp, eqPin, eq)) changed = true;
  return changed;
}

function _evaluateCmp8BitInvOc_fn(comp, gate) {
  // 74522: 8 bit inverting comparator, OC
  // inputs: G1n, A0-A7, B0-B7
  // G1n=1 → EQ not driven (OC = open); equal→EQ=1; unequal→EQ=0
  const bits = this._readGateInputs(comp, gate.inputs);
  const g1n = bits[0];
  const eqPin = gate.outputs[0];
  let changed = false;
  if (g1n) {
    if (this._drivePinHighZ(comp, eqPin)) changed = true;
    return changed;
  }
  let aVal = 0, bVal = 0;
  for (let i = 0; i < 8; i++) aVal |= (bits[1 + i] << i);
  for (let i = 0; i < 8; i++) bVal |= (bits[9 + i] << i);
  const eq = (aVal === bVal) ? 1 : 0;
  if (this._drivePinBit(comp, eqPin, eq)) changed = true;
  return changed;
}

function _evaluateCmp8BitRegOc_fn(comp, gate) {
  // 74524: 8 bit registered identity comparator, OC
  // inputs: CLK, A0-A7, B0-B7
  // On rising CLK edge: capture A==B; EQn=0 if equal, =1 if not
  if (!comp.state) comp.state = { prevClk: 0, eqn: 1 };
  const bits = this._readGateInputs(comp, gate.inputs);
  const clk = bits[0];
  let changed = false;
  const eqnPin = gate.outputs[0];
  if (clk && !comp.state.prevClk) {
    let aVal = 0, bVal = 0;
    for (let i = 0; i < 8; i++) aVal |= (bits[1 + i] << i);
    for (let i = 0; i < 8; i++) bVal |= (bits[9 + i] << i);
    comp.state.eqn = (aVal === bVal) ? 0 : 1;
  }
  comp.state.prevClk = clk;
  if (this._drivePinBit(comp, eqnPin, comp.state.eqn)) changed = true;
  return changed;
}

function _evaluateCmp16BitProg_fn(comp, gate) {
  // 74526: 16 bit fuse-programmable identity comparator (stub always matches when enabled)
  // inputs: G1n, A0-A15
  // G1n=1 → EQn=HiZ; otherwise EQn=0 (match)
  const bits = this._readGateInputs(comp, gate.inputs);
  const g1n = bits[0];
  const eqnPin = gate.outputs[0];
  let changed = false;
  if (g1n) {
    if (this._drivePinHighZ(comp, eqnPin)) changed = true;
    return changed;
  }
  if (this._drivePinBit(comp, eqnPin, 0)) changed = true;
  return changed;
}

function _evaluateCmp12BitProg_fn(comp, gate) {
  // 74527: 8+4 bit fuse-programmable identity comparator (stub always matches when enabled)
  // inputs: G1n, A0-A11, B8-B11
  const bits = this._readGateInputs(comp, gate.inputs);
  const g1n = bits[0];
  const eqnPin = gate.outputs[0];
  let changed = false;
  if (g1n) {
    if (this._drivePinHighZ(comp, eqnPin)) changed = true;
    return changed;
  }
  if (this._drivePinBit(comp, eqnPin, 0)) changed = true;
  return changed;
}

function _evaluateCmp12BitOc_fn(comp, gate) {
  // 74528: 12 bit fuse-programmable identity comparator, OC (stub always matches when enabled)
  // inputs: G1n, A0-A11
  const bits = this._readGateInputs(comp, gate.inputs);
  const g1n = bits[0];
  const eqnPin = gate.outputs[0];
  let changed = false;
  if (g1n) {
    if (this._drivePinHighZ(comp, eqnPin)) changed = true;
    return changed;
  }
  if (this._drivePinBit(comp, eqnPin, 0)) changed = true;
  return changed;
}

function _evaluateLatchOctalTri_fn(comp, gate) {
  // 74531: Octal transparent latch, tri-state
  // inputs: OEn, LE, D0-D7
  // OEn=1 → Q[0-7]=HiZ; LE=1 → transparent (Q=D); LE=0 → hold
  if (!comp.state) comp.state = { q: new Array(8).fill(0) };
  const bits = this._readGateInputs(comp, gate.inputs);
  const oen = bits[0];
  const le  = bits[1];
  let changed = false;
  if (le) {
    for (let i = 0; i < 8; i++) comp.state.q[i] = bits[2 + i];
  }
  for (let i = 0; i < 8; i++) {
    if (oen) {
      if (this._drivePinHighZ(comp, gate.outputs[i])) changed = true;
    } else {
      if (this._drivePinBit(comp, gate.outputs[i], comp.state.q[i])) changed = true;
    }
  }
  return changed;
}

function _evaluateRegOctalTri_fn(comp, gate) {
  // 74532: Octal D-type register, tri-state
  // inputs: OEn, CLK, D0-D7
  // On rising CLK: capture D→Q; OEn=1 → Q=HiZ
  if (!comp.state) comp.state = { prevClk: 0, q: new Array(8).fill(0) };
  const bits = this._readGateInputs(comp, gate.inputs);
  const oen = bits[0];
  const clk = bits[1];
  let changed = false;
  if (clk && !comp.state.prevClk) {
    for (let i = 0; i < 8; i++) comp.state.q[i] = bits[2 + i];
  }
  comp.state.prevClk = clk;
  for (let i = 0; i < 8; i++) {
    if (oen) {
      if (this._drivePinHighZ(comp, gate.outputs[i])) changed = true;
    } else {
      if (this._drivePinBit(comp, gate.outputs[i], comp.state.q[i])) changed = true;
    }
  }
  return changed;
}

function _evaluateLatchOctalInvTri_fn(comp, gate) {
  // 74533/74535: Octal transparent latch inverting, tri-state
  // inputs: OEn, LE, D0-D7
  // OEn=1 → Qn=HiZ; LE=1 → transparent (Qn=NOT(D)); LE=0 → hold
  if (!comp.state) comp.state = { q: new Array(8).fill(1) };
  const bits = this._readGateInputs(comp, gate.inputs);
  const oen = bits[0];
  const le  = bits[1];
  let changed = false;
  if (le) {
    for (let i = 0; i < 8; i++) comp.state.q[i] = bits[2 + i] ^ 1;
  }
  for (let i = 0; i < 8; i++) {
    if (oen) {
      if (this._drivePinHighZ(comp, gate.outputs[i])) changed = true;
    } else {
      if (this._drivePinBit(comp, gate.outputs[i], comp.state.q[i])) changed = true;
    }
  }
  return changed;
}

function _evaluateRegOctalInvTri_fn(comp, gate) {
  // 74534/74536: Octal D-type register inverting, tri-state
  // inputs: OEn, CLK, D0-D7
  // On rising CLK: capture NOT(D)→Qn; OEn=1 → Qn=HiZ
  if (!comp.state) comp.state = { prevClk: 0, q: new Array(8).fill(1) };
  const bits = this._readGateInputs(comp, gate.inputs);
  const oen = bits[0];
  const clk = bits[1];
  let changed = false;
  if (clk && !comp.state.prevClk) {
    for (let i = 0; i < 8; i++) comp.state.q[i] = bits[2 + i] ^ 1;
  }
  comp.state.prevClk = clk;
  for (let i = 0; i < 8; i++) {
    if (oen) {
      if (this._drivePinHighZ(comp, gate.outputs[i])) changed = true;
    } else {
      if (this._drivePinBit(comp, gate.outputs[i], comp.state.q[i])) changed = true;
    }
  }
  return changed;
}

function _evaluateBcdDecimalDecTri_fn(comp, gate) {
  // 74537: BCD to decimal decoder, tri-state
  // inputs: OEn, A (LSB), B, C, D (MSB)
  // OEn=1 → Y[0-9]=HiZ; decode BCD(D,C,B,A); Y[val]=1, others=0 (val 0-9); val>=10 → all=0
  const bits = this._readGateInputs(comp, gate.inputs);
  const oen = bits[0];
  const a = bits[1], b = bits[2], c = bits[3], d = bits[4];
  let changed = false;
  const val = (d << 3) | (c << 2) | (b << 1) | a;
  for (let i = 0; i < 10; i++) {
    if (oen) {
      if (this._drivePinHighZ(comp, gate.outputs[i])) changed = true;
    } else {
      const out = (val < 10 && val === i) ? 1 : 0;
      if (this._drivePinBit(comp, gate.outputs[i], out)) changed = true;
    }
  }
  return changed;
}

chipEvaluators._evaluateCmp8BitOc         = _evaluateCmp8BitOc_fn;
chipEvaluators._evaluateCmp8BitInv        = _evaluateCmp8BitInv_fn;
chipEvaluators._evaluateCmp8BitInvOc      = _evaluateCmp8BitInvOc_fn;
chipEvaluators._evaluateCmp8BitRegOc      = _evaluateCmp8BitRegOc_fn;
chipEvaluators._evaluateCmp16BitProg      = _evaluateCmp16BitProg_fn;
chipEvaluators._evaluateCmp12BitProg      = _evaluateCmp12BitProg_fn;
chipEvaluators._evaluateCmp12BitOc        = _evaluateCmp12BitOc_fn;
chipEvaluators._evaluateLatchOctalTri     = _evaluateLatchOctalTri_fn;
chipEvaluators._evaluateRegOctalTri       = _evaluateRegOctalTri_fn;
chipEvaluators._evaluateLatchOctalInvTri  = _evaluateLatchOctalInvTri_fn;
chipEvaluators._evaluateRegOctalInvTri    = _evaluateRegOctalInvTri_fn;
chipEvaluators._evaluateBcdDecimalDecTri  = _evaluateBcdDecimalDecTri_fn;

// ── Block 30 evaluators ───────────────────────────────────────────────────────

function _evaluateDecoder3to8Tri_fn(comp, gate) {
  // 74538: 3-to-8 decoder, tri-state
  // inputs: A, B, C, G1, G2An, G2Bn, OEn
  // OEn=1 → all HiZ; enabled when G1=1 AND G2An=0 AND G2Bn=0
  // Outputs active HIGH (one Y=1, rest=0) when enabled
  const bits = this._readGateInputs(comp, gate.inputs);
  const [a, b, c, g1, g2an, g2bn, oen] = bits;
  let changed = false;
  const enabled = g1 && !g2an && !g2bn;
  const sel = (c << 2) | (b << 1) | a;
  for (let i = 0; i < 8; i++) {
    if (oen) {
      if (this._drivePinHighZ(comp, gate.outputs[i])) changed = true;
    } else if (!enabled) {
      if (this._drivePinBit(comp, gate.outputs[i], 0)) changed = true;
    } else {
      if (this._drivePinBit(comp, gate.outputs[i], i === sel ? 1 : 0)) changed = true;
    }
  }
  return changed;
}

function _evaluateDecoder2to4Tri_fn(comp, gate) {
  // 74539: 2-to-4 decoder, tri-state (one half)
  // inputs: OEn, G, A0, A1
  // OEn=1 → all HiZ; G=0 → all 0; else Y[sel]=1, others=0 (active HIGH)
  const bits = this._readGateInputs(comp, gate.inputs);
  const [oen, g, a0, a1] = bits;
  let changed = false;
  const sel = (a1 << 1) | a0;
  for (let i = 0; i < 4; i++) {
    if (oen) {
      if (this._drivePinHighZ(comp, gate.outputs[i])) changed = true;
    } else if (!g) {
      if (this._drivePinBit(comp, gate.outputs[i], 0)) changed = true;
    } else {
      if (this._drivePinBit(comp, gate.outputs[i], i === sel ? 1 : 0)) changed = true;
    }
  }
  return changed;
}

function _evaluateBufOctalInvTri_fn(comp, gate) {
  // 74540: Octal buffer, inverting, tri-state
  // inputs: OEn, A0-A7; outputs: Y0-Y7 = NOT(A)
  const bits = this._readGateInputs(comp, gate.inputs);
  const oen = bits[0];
  let changed = false;
  for (let i = 0; i < 8; i++) {
    if (oen) {
      if (this._drivePinHighZ(comp, gate.outputs[i])) changed = true;
    } else {
      if (this._drivePinBit(comp, gate.outputs[i], bits[1 + i] ^ 1)) changed = true;
    }
  }
  return changed;
}

function _evaluateTransceiverOctalReg_fn(comp, gate) {
  // 74543/74546: Octal registered transceiver, non-inverting
  // inputs: OEABn, OEBAn, LEAB, LEBA, CLK, DIR, A0-A7, B0-B7
  // On rising CLK: if DIR=1 latch AB-side (A→regAB), if DIR=0 latch BA-side (B→regBA)
  // DIR=1: drive B from regAB if !OEABn; DIR=0: drive A from regBA if !OEBAn
  if (!comp.state) comp.state = { prevClk: 0, regAB: new Array(8).fill(0), regBA: new Array(8).fill(0) };
  const bits = this._readGateInputs(comp, gate.inputs);
  const oeabn = bits[0], oeban = bits[1], leab = bits[2], leba = bits[3], clk = bits[4], dir = bits[5];
  const aVals = bits.slice(6, 14);
  const bVals = bits.slice(14, 22);
  let changed = false;
  if (clk && !comp.state.prevClk) {
    if (dir) { for (let i = 0; i < 8; i++) comp.state.regAB[i] = aVals[i]; }
    else      { for (let i = 0; i < 8; i++) comp.state.regBA[i] = bVals[i]; }
  }
  comp.state.prevClk = clk;
  if (dir) {
    // A→B direction: only drive B outputs; leave A pins alone (they are inputs)
    for (let i = 0; i < 8; i++) {
      if (!oeabn) {
        if (this._drivePinBit(comp, gate.outputs[8 + i], comp.state.regAB[i])) changed = true;
      } else {
        if (this._drivePinHighZ(comp, gate.outputs[8 + i])) changed = true;
      }
    }
  } else {
    // B→A direction: only drive A outputs; leave B pins alone (they are inputs)
    for (let i = 0; i < 8; i++) {
      if (!oeban) {
        if (this._drivePinBit(comp, gate.outputs[i], comp.state.regBA[i])) changed = true;
      } else {
        if (this._drivePinHighZ(comp, gate.outputs[i])) changed = true;
      }
    }
  }
  return changed;
}

function _evaluateTransceiverOctalRegInv_fn(comp, gate) {
  // 74544: Octal registered transceiver, inverting
  // Same as TRANSCEIVER_OCTAL_REG but outputs are inverted
  if (!comp.state) comp.state = { prevClk: 0, regAB: new Array(8).fill(0), regBA: new Array(8).fill(0) };
  const bits = this._readGateInputs(comp, gate.inputs);
  const oeabn = bits[0], oeban = bits[1], leab = bits[2], leba = bits[3], clk = bits[4], dir = bits[5];
  const aVals = bits.slice(6, 14);
  const bVals = bits.slice(14, 22);
  let changed = false;
  if (clk && !comp.state.prevClk) {
    if (dir) { for (let i = 0; i < 8; i++) comp.state.regAB[i] = aVals[i]; }
    else      { for (let i = 0; i < 8; i++) comp.state.regBA[i] = bVals[i]; }
  }
  comp.state.prevClk = clk;
  if (dir) {
    for (let i = 0; i < 8; i++) {
      if (!oeabn) {
        if (this._drivePinBit(comp, gate.outputs[8 + i], comp.state.regAB[i] ^ 1)) changed = true;
      } else {
        if (this._drivePinHighZ(comp, gate.outputs[8 + i])) changed = true;
      }
    }
  } else {
    for (let i = 0; i < 8; i++) {
      if (!oeban) {
        if (this._drivePinBit(comp, gate.outputs[i], comp.state.regBA[i] ^ 1)) changed = true;
      } else {
        if (this._drivePinHighZ(comp, gate.outputs[i])) changed = true;
      }
    }
  }
  return changed;
}

function _evaluateTransceiverOctalLatch_fn(comp, gate) {
  // 74547 (LS): Octal latched transceiver, non-inverting
  // inputs: OEABn, OEBAn, LEAB, LEBA, DIR, A0-A7, B0-B7
  // LEAB=1 → latch AB-side (A→regAB); LEBA=1 → latch BA-side (B→regBA)
  if (!comp.state) comp.state = { regAB: new Array(8).fill(0), regBA: new Array(8).fill(0) };
  const bits = this._readGateInputs(comp, gate.inputs);
  const oeabn = bits[0], oeban = bits[1], leab = bits[2], leba = bits[3], dir = bits[4];
  const aVals = bits.slice(5, 13);
  const bVals = bits.slice(13, 21);
  let changed = false;
  if (leab) { for (let i = 0; i < 8; i++) comp.state.regAB[i] = aVals[i]; }
  if (leba) { for (let i = 0; i < 8; i++) comp.state.regBA[i] = bVals[i]; }
  if (dir) {
    for (let i = 0; i < 8; i++) {
      if (!oeabn) {
        if (this._drivePinBit(comp, gate.outputs[8 + i], comp.state.regAB[i])) changed = true;
      } else {
        if (this._drivePinHighZ(comp, gate.outputs[8 + i])) changed = true;
      }
      if (this._drivePinHighZ(comp, gate.outputs[i])) changed = true;
    }
  } else {
    for (let i = 0; i < 8; i++) {
      if (!oeban) {
        if (this._drivePinBit(comp, gate.outputs[i], comp.state.regBA[i])) changed = true;
      } else {
        if (this._drivePinHighZ(comp, gate.outputs[i])) changed = true;
      }
      if (this._drivePinHighZ(comp, gate.outputs[8 + i])) changed = true;
    }
  }
  return changed;
}

function _evaluateDecoder3to8LatchAck_fn(comp, gate) {
  // 74F547: 3-to-8 decoder with address latch and acknowledge output (stub)
  // inputs: A0, A1, A2, STB, G
  // outputs: Y0-Y7, ACK
  // STB=1 latches address; G=1 enables output; ACK=1 when enabled
  if (!comp.state) comp.state = { la: [0, 0, 0] };
  const bits = this._readGateInputs(comp, gate.inputs);
  const [a0, a1, a2, stb, g] = bits;
  let changed = false;
  if (stb) { comp.state.la = [a0, a1, a2]; }
  const sel = (comp.state.la[2] << 2) | (comp.state.la[1] << 1) | comp.state.la[0];
  for (let i = 0; i < 8; i++) {
    const out = g ? (i === sel ? 1 : 0) : 0;
    if (this._drivePinBit(comp, gate.outputs[i], out)) changed = true;
  }
  if (this._drivePinBit(comp, gate.outputs[8], g ? 1 : 0)) changed = true; // ACK
  return changed;
}

function _evaluateReg8BitPipeline_fn(comp, gate) {
  // 74x548: 8 bit two-stage pipelined register
  // inputs: OEn, CLK1, CLK2, D0-D7
  // Stage 1 captures on CLK1 rising; Stage 2 captures on CLK2 rising; OEn=1→HiZ
  if (!comp.state) comp.state = { prevClk1: 0, prevClk2: 0, stage1: new Array(8).fill(0), stage2: new Array(8).fill(0) };
  const bits = this._readGateInputs(comp, gate.inputs);
  const oen = bits[0], clk1 = bits[1], clk2 = bits[2];
  const d = bits.slice(3, 11);
  let changed = false;
  if (clk1 && !comp.state.prevClk1) {
    for (let i = 0; i < 8; i++) comp.state.stage1[i] = d[i];
  }
  if (clk2 && !comp.state.prevClk2) {
    for (let i = 0; i < 8; i++) comp.state.stage2[i] = comp.state.stage1[i];
  }
  comp.state.prevClk1 = clk1;
  comp.state.prevClk2 = clk2;
  for (let i = 0; i < 8; i++) {
    if (oen) {
      if (this._drivePinHighZ(comp, gate.outputs[i])) changed = true;
    } else {
      if (this._drivePinBit(comp, gate.outputs[i], comp.state.stage2[i])) changed = true;
    }
  }
  return changed;
}

function _evaluateDecoder3to8Ack_fn(comp, gate) {
  // 74F548: 3-to-8 decoder with acknowledge output (no latch)
  // inputs: A0, A1, A2, G
  // outputs: Y0-Y7, ACK
  // G=1 → decode; ACK=G
  const bits = this._readGateInputs(comp, gate.inputs);
  const [a0, a1, a2, g] = bits;
  let changed = false;
  const sel = (a2 << 2) | (a1 << 1) | a0;
  for (let i = 0; i < 8; i++) {
    const out = g ? (i === sel ? 1 : 0) : 0;
    if (this._drivePinBit(comp, gate.outputs[i], out)) changed = true;
  }
  if (this._drivePinBit(comp, gate.outputs[8], g ? 1 : 0)) changed = true; // ACK
  return changed;
}

function _evaluateLatch8BitPipeline_fn(comp, gate) {
  // 74x549: 8 bit two-stage pipelined latch
  // inputs: OEn, LE1, LE2, D0-D7
  // LE1=1 → transparent first stage; LE2=1 → transparent second stage; OEn=1→HiZ
  if (!comp.state) comp.state = { stage1: new Array(8).fill(0), stage2: new Array(8).fill(0) };
  const bits = this._readGateInputs(comp, gate.inputs);
  const oen = bits[0], le1 = bits[1], le2 = bits[2];
  const d = bits.slice(3, 11);
  let changed = false;
  if (le1) { for (let i = 0; i < 8; i++) comp.state.stage1[i] = d[i]; }
  if (le2) { for (let i = 0; i < 8; i++) comp.state.stage2[i] = comp.state.stage1[i]; }
  for (let i = 0; i < 8; i++) {
    if (oen) {
      if (this._drivePinHighZ(comp, gate.outputs[i])) changed = true;
    } else {
      if (this._drivePinBit(comp, gate.outputs[i], comp.state.stage2[i])) changed = true;
    }
  }
  return changed;
}

function _evaluateMultiplier8BitTc_fn(comp, gate) {
  // 74F559: 8 bit expandable two's complement multiplier/divider (stub)
  // inputs: OEn, TCn, A0-A7, B0-B2
  // outputs: P0-P7, TCp
  const bits = this._readGateInputs(comp, gate.inputs);
  const oen = bits[0];
  let changed = false;
  for (let i = 0; i < 8; i++) {
    if (oen) {
      if (this._drivePinHighZ(comp, gate.outputs[i])) changed = true;
    } else {
      if (this._drivePinBit(comp, gate.outputs[i], 0)) changed = true;
    }
  }
  if (this._drivePinBit(comp, gate.outputs[8], 1)) changed = true; // TCp
  return changed;
}

function _evaluateCounterSyncDecadeTri_fn(comp, gate) {
  // 74560: Synchronous 4 bit decade counter with tri-state outputs
  // inputs: CLRn, CLK, ENP, LOAD, ENT, A, B, C, D, OEn
  // outputs: QA, QB, QC, QD, RCO
  // CLRn=0 → sync clear; LOAD=0 → load; ENP&ENT → count; OEn=1 → Q=HiZ
  if (!comp.state) comp.state = { prevClk: 0, q: 0 };
  const bits = this._readGateInputs(comp, gate.inputs);
  const [clrn, clk, enp, load, ent, a, b, c, d, oen] = bits;
  let changed = false;
  if (clk && !comp.state.prevClk) {
    if (!clrn)      { comp.state.q = 0; }
    else if (!load) { comp.state.q = (d << 3) | (c << 2) | (b << 1) | a; }
    else if (enp && ent) {
      comp.state.q = (comp.state.q + 1) % 10;
    }
  }
  comp.state.prevClk = clk;
  const rco = (comp.state.q === 9 && ent) ? 1 : 0;
  const outputBits = [comp.state.q & 1, (comp.state.q >> 1) & 1,
                      (comp.state.q >> 2) & 1, (comp.state.q >> 3) & 1];
  for (let i = 0; i < 4; i++) {
    if (oen) {
      if (this._drivePinHighZ(comp, gate.outputs[i])) changed = true;
    } else {
      if (this._drivePinBit(comp, gate.outputs[i], outputBits[i])) changed = true;
    }
  }
  if (this._drivePinBit(comp, gate.outputs[4], rco)) changed = true; // RCO always driven
  return changed;
}

function _evaluateCounterSyncBinTri_fn(comp, gate) {
  // 74561: Synchronous 4 bit binary counter with tri-state outputs
  // inputs: CLRn, CLK, ENP, LOAD, ENT, A, B, C, D, OEn
  // outputs: QA, QB, QC, QD, RCO
  if (!comp.state) comp.state = { prevClk: 0, q: 0 };
  const bits = this._readGateInputs(comp, gate.inputs);
  const [clrn, clk, enp, load, ent, a, b, c, d, oen] = bits;
  let changed = false;
  if (clk && !comp.state.prevClk) {
    if (!clrn)      { comp.state.q = 0; }
    else if (!load) { comp.state.q = (d << 3) | (c << 2) | (b << 1) | a; }
    else if (enp && ent) {
      comp.state.q = (comp.state.q + 1) & 0xF;
    }
  }
  comp.state.prevClk = clk;
  const rco = (comp.state.q === 15 && ent) ? 1 : 0;
  const outputBits = [comp.state.q & 1, (comp.state.q >> 1) & 1,
                      (comp.state.q >> 2) & 1, (comp.state.q >> 3) & 1];
  for (let i = 0; i < 4; i++) {
    if (oen) {
      if (this._drivePinHighZ(comp, gate.outputs[i])) changed = true;
    } else {
      if (this._drivePinBit(comp, gate.outputs[i], outputBits[i])) changed = true;
    }
  }
  if (this._drivePinBit(comp, gate.outputs[4], rco)) changed = true;
  return changed;
}

chipEvaluators._evaluateDecoder3to8Tri         = _evaluateDecoder3to8Tri_fn;
chipEvaluators._evaluateDecoder2to4Tri         = _evaluateDecoder2to4Tri_fn;
chipEvaluators._evaluateBufOctalInvTri         = _evaluateBufOctalInvTri_fn;
chipEvaluators._evaluateTransceiverOctalReg    = _evaluateTransceiverOctalReg_fn;
chipEvaluators._evaluateTransceiverOctalRegInv = _evaluateTransceiverOctalRegInv_fn;
chipEvaluators._evaluateTransceiverOctalLatch  = _evaluateTransceiverOctalLatch_fn;
chipEvaluators._evaluateDecoder3to8LatchAck    = _evaluateDecoder3to8LatchAck_fn;
chipEvaluators._evaluateReg8BitPipeline        = _evaluateReg8BitPipeline_fn;
chipEvaluators._evaluateDecoder3to8Ack         = _evaluateDecoder3to8Ack_fn;
chipEvaluators._evaluateLatch8BitPipeline      = _evaluateLatch8BitPipeline_fn;
chipEvaluators._evaluateMultiplier8BitTc       = _evaluateMultiplier8BitTc_fn;
chipEvaluators._evaluateCounterSyncDecadeTri   = _evaluateCounterSyncDecadeTri_fn;
chipEvaluators._evaluateCounterSyncBinTri      = _evaluateCounterSyncBinTri_fn;

// ── Block 31 evaluators ───────────────────────────────────────────────────────

function _evaluateTransceiverOctalLatchInv_fn(comp, gate) {
  // 74567: 8 bit bidirectional latched transceiver, inverting outputs
  // inputs: OEABn, OEBAn, LEAB, LEBA, DIR, A0-A7, B0-B7
  // LEAB=1 → latch AB-side (A→regAB); LEBA=1 → latch BA-side (B→regBA)
  // DIR=1: drive B from NOT(regAB) if !OEABn; DIR=0: drive A from NOT(regBA) if !OEBAn
  if (!comp.state) comp.state = { regAB: new Array(8).fill(0), regBA: new Array(8).fill(0) };
  const bits = this._readGateInputs(comp, gate.inputs);
  const oeabn = bits[0], oeban = bits[1], leab = bits[2], leba = bits[3], dir = bits[4];
  const aVals = bits.slice(5, 13);
  const bVals = bits.slice(13, 21);
  let changed = false;
  if (leab) { for (let i = 0; i < 8; i++) comp.state.regAB[i] = aVals[i]; }
  if (leba) { for (let i = 0; i < 8; i++) comp.state.regBA[i] = bVals[i]; }
  if (dir) {
    // A→B direction: drive B outputs (inverted); leave A pins alone
    for (let i = 0; i < 8; i++) {
      if (!oeabn) {
        if (this._drivePinBit(comp, gate.outputs[8 + i], comp.state.regAB[i] ^ 1)) changed = true;
      } else {
        if (this._drivePinHighZ(comp, gate.outputs[8 + i])) changed = true;
      }
    }
  } else {
    // B→A direction: drive A outputs (inverted); leave B pins alone
    for (let i = 0; i < 8; i++) {
      if (!oeban) {
        if (this._drivePinBit(comp, gate.outputs[i], comp.state.regBA[i] ^ 1)) changed = true;
      } else {
        if (this._drivePinHighZ(comp, gate.outputs[i])) changed = true;
      }
    }
  }
  return changed;
}

function _evaluateCounterSyncDecadeUpdownTri_fn(comp, gate) {
  // 74568: Synchronous 4 bit decade up/down counter with tri-state outputs
  // inputs: CLRn, CLK, U_Dn, ENP, A, B, C, D, ENT, LOAD, OEn
  // outputs: QA, QB, QC, QD, RCO
  // CLRn=0 → sync clear; LOAD=0 → load; U_Dn=1→count up, 0→count down
  // ENP&ENT → count; OEn=1 → Q=HiZ
  if (!comp.state) comp.state = { prevClk: 0, q: 0 };
  const bits = this._readGateInputs(comp, gate.inputs);
  const [clrn, clk, updn, enp, a, b, c, d, ent, load, oen] = bits;
  let changed = false;
  if (clk && !comp.state.prevClk) {
    if (!clrn) {
      comp.state.q = 0;
    } else if (!load) {
      comp.state.q = (d << 3) | (c << 2) | (b << 1) | a;
    } else if (enp && ent) {
      if (updn) {
        comp.state.q = (comp.state.q + 1) % 10;
      } else {
        comp.state.q = (comp.state.q - 1 + 10) % 10;
      }
    }
  }
  comp.state.prevClk = clk;
  // RCO: terminal count at 9 going up (and ENT), or at 0 going down (and ENT)
  const rco = ent && ((updn && comp.state.q === 9) || (!updn && comp.state.q === 0)) ? 1 : 0;
  for (let i = 0; i < 4; i++) {
    if (oen) {
      if (this._drivePinHighZ(comp, gate.outputs[i])) changed = true;
    } else {
      if (this._drivePinBit(comp, gate.outputs[i], (comp.state.q >> i) & 1)) changed = true;
    }
  }
  if (this._drivePinBit(comp, gate.outputs[4], rco)) changed = true;
  return changed;
}

function _evaluateCounterSyncBinUpdownTri_fn(comp, gate) {
  // 74569: Synchronous 4 bit binary up/down counter with tri-state outputs
  // inputs: CLRn, CLK, U_Dn, ENP, A, B, C, D, ENT, LOAD, OEn
  // outputs: QA, QB, QC, QD, RCO
  if (!comp.state) comp.state = { prevClk: 0, q: 0 };
  const bits = this._readGateInputs(comp, gate.inputs);
  const [clrn, clk, updn, enp, a, b, c, d, ent, load, oen] = bits;
  let changed = false;
  if (clk && !comp.state.prevClk) {
    if (!clrn) {
      comp.state.q = 0;
    } else if (!load) {
      comp.state.q = (d << 3) | (c << 2) | (b << 1) | a;
    } else if (enp && ent) {
      if (updn) {
        comp.state.q = (comp.state.q + 1) & 0xF;
      } else {
        comp.state.q = (comp.state.q - 1 + 16) & 0xF;
      }
    }
  }
  comp.state.prevClk = clk;
  const rco = ent && ((updn && comp.state.q === 15) || (!updn && comp.state.q === 0)) ? 1 : 0;
  for (let i = 0; i < 4; i++) {
    if (oen) {
      if (this._drivePinHighZ(comp, gate.outputs[i])) changed = true;
    } else {
      if (this._drivePinBit(comp, gate.outputs[i], (comp.state.q >> i) & 1)) changed = true;
    }
  }
  if (this._drivePinBit(comp, gate.outputs[4], rco)) changed = true;
  return changed;
}



function _evaluateRegOctalSynclrTri_fn(comp, gate) {
  // 74575: Octal D-type FF with synchronous clear, tri-state
  // inputs: OEn, CLRn, CLK, D0-D7
  // On rising CLK: if !CLRn → clear; else capture D→Q; OEn=1 → Q=HiZ
  if (!comp.state) comp.state = { prevClk: 0, q: new Array(8).fill(0) };
  const bits = this._readGateInputs(comp, gate.inputs);
  const oen = bits[0], clrn = bits[1], clk = bits[2];
  let changed = false;
  if (clk && !comp.state.prevClk) {
    if (!clrn) {
      for (let i = 0; i < 8; i++) comp.state.q[i] = 0;
    } else {
      for (let i = 0; i < 8; i++) comp.state.q[i] = bits[3 + i];
    }
  }
  comp.state.prevClk = clk;
  for (let i = 0; i < 8; i++) {
    if (oen) {
      if (this._drivePinHighZ(comp, gate.outputs[i])) changed = true;
    } else {
      if (this._drivePinBit(comp, gate.outputs[i], comp.state.q[i])) changed = true;
    }
  }
  return changed;
}

function _evaluateRegOctalSynclrInvTri_fn(comp, gate) {
  // 74577: Octal D-type FF with synchronous clear, inverting outputs, tri-state
  // inputs: OEn, CLRn, CLK, D0-D7
  // On rising CLK: if !CLRn → set Qn=1 (cleared Q=0 → inverted Qn=1); else capture NOT(D)→Qn
  if (!comp.state) comp.state = { prevClk: 0, q: new Array(8).fill(1) };
  const bits = this._readGateInputs(comp, gate.inputs);
  const oen = bits[0], clrn = bits[1], clk = bits[2];
  let changed = false;
  if (clk && !comp.state.prevClk) {
    if (!clrn) {
      for (let i = 0; i < 8; i++) comp.state.q[i] = 1; // Q=0 → Qn=1
    } else {
      for (let i = 0; i < 8; i++) comp.state.q[i] = bits[3 + i] ^ 1;
    }
  }
  comp.state.prevClk = clk;
  for (let i = 0; i < 8; i++) {
    if (oen) {
      if (this._drivePinHighZ(comp, gate.outputs[i])) changed = true;
    } else {
      if (this._drivePinBit(comp, gate.outputs[i], comp.state.q[i])) changed = true;
    }
  }
  return changed;
}

function _evaluateCounter8BitBidirTri_fn(comp, gate) {
  // 74579: 8 bit bidirectional synchronous binary counter with tri-state outputs
  // inputs: CLK, ENT, ENP, U_Dn, LOAD, OEn, A0-A7
  // outputs: A0-A7 (bidirectional), TC
  // U_Dn=1→up, 0→down; LOAD=0→load; OEn=1→Q=HiZ
  if (!comp.state) comp.state = { prevClk: 0, q: 0 };
  const bits = this._readGateInputs(comp, gate.inputs);
  const [clk, ent, enp, updn, load, oen] = bits;
  let changed = false;
  const rising = clk && !comp.state.prevClk;
  comp.state.prevClk = clk;
  if (rising) {
    if (!load) {
      let val = 0;
      for (let i = 0; i < 8; i++) val |= (bits[6 + i] << i);
      comp.state.q = val;
    } else if (ent && enp) {
      if (updn) {
        comp.state.q = (comp.state.q + 1) & 0xFF;
      } else {
        comp.state.q = (comp.state.q - 1 + 256) & 0xFF;
      }
    }
  }
  const q = comp.state.q;
  // Drive Q outputs (A0-A7 as bidirectional)
  for (let i = 0; i < 8; i++) {
    if (oen) {
      if (this._drivePinHighZ(comp, gate.outputs[i])) changed = true;
    } else {
      if (this._drivePinBit(comp, gate.outputs[i], (q >> i) & 1)) changed = true;
    }
  }
  // TC: terminal count when at max (up) or 0 (down) and ENT active
  const tc = ent && ((updn && q === 0xFF) || (!updn && q === 0x00)) ? 1 : 0;
  if (this._drivePinBit(comp, gate.outputs[8], tc)) changed = true;
  return changed;
}

function _evaluateAluBcd4Bit_fn(comp, gate) {
  // 74582: 4 bit BCD ALU (stub outputs F=A+B in BCD for add operations)
  // inputs: A0-A3, B0-B3, Cn, M, S0-S3
  // outputs: F0-F3, Cn4, OVR, P, G
  const bits = this._readGateInputs(comp, gate.inputs);
  const [a0, a1, a2, a3, b0, b1, b2, b3, cn, m, s0, s1, s2, s3] = bits;
  const a = a0 | (a1 << 1) | (a2 << 2) | (a3 << 3);
  const b = b0 | (b1 << 1) | (b2 << 2) | (b3 << 3);
  let changed = false;
  // Basic: if M=0 (arithmetic) and S=1001 (add), do BCD add; else pass A
  let result = 0, cout = 0;
  const sel = s0 | (s1 << 1) | (s2 << 2) | (s3 << 3);
  if (!m && sel === 0b1001) {
    // BCD add: A + B + Cn
    const sum = a + b + cn;
    if (sum > 9) { result = (sum + 6) & 0xF; cout = 1; }
    else         { result = sum; cout = 0; }
  } else {
    result = a; cout = 0;
  }
  const f = [result & 1, (result >> 1) & 1, (result >> 2) & 1, (result >> 3) & 1];
  for (let i = 0; i < 4; i++) {
    if (this._drivePinBit(comp, gate.outputs[i], f[i])) changed = true;
  }
  if (this._drivePinBit(comp, gate.outputs[4], cout)) changed = true;  // Cn4
  if (this._drivePinBit(comp, gate.outputs[5], 0))    changed = true;  // OVR
  if (this._drivePinBit(comp, gate.outputs[6], 0))    changed = true;  // P
  if (this._drivePinBit(comp, gate.outputs[7], 0))    changed = true;  // G
  return changed;
}

function _evaluateAdderBcd4Bit_fn(comp, gate) {
  // 74583: 4 bit BCD adder
  // inputs: A0-A3, B0-B3, Cin
  // outputs: S0-S3, Cout
  // Adds two BCD digits (0-9) with carry; result is BCD
  const bits = this._readGateInputs(comp, gate.inputs);
  const [a0, a1, a2, a3, b0, b1, b2, b3, cin] = bits;
  const a = a0 | (a1 << 1) | (a2 << 2) | (a3 << 3);
  const b = b0 | (b1 << 1) | (b2 << 2) | (b3 << 3);
  let changed = false;
  const sum = a + b + cin;
  let result, cout;
  if (sum > 9) { result = (sum + 6) & 0xF; cout = 1; }
  else         { result = sum; cout = 0; }
  for (let i = 0; i < 4; i++) {
    if (this._drivePinBit(comp, gate.outputs[i], (result >> i) & 1)) changed = true;
  }
  if (this._drivePinBit(comp, gate.outputs[4], cout)) changed = true;
  return changed;
}

chipEvaluators._evaluateTransceiverOctalLatchInv    = _evaluateTransceiverOctalLatchInv_fn;
chipEvaluators._evaluateCounterSyncDecadeUpdownTri  = _evaluateCounterSyncDecadeUpdownTri_fn;
chipEvaluators._evaluateCounterSyncBinUpdownTri     = _evaluateCounterSyncBinUpdownTri_fn;
chipEvaluators._evaluateRegOctalSynclrTri           = _evaluateRegOctalSynclrTri_fn;
chipEvaluators._evaluateRegOctalSynclrInvTri        = _evaluateRegOctalSynclrInvTri_fn;
chipEvaluators._evaluateCounter8BitBidirTri         = _evaluateCounter8BitBidirTri_fn;
chipEvaluators._evaluateAluBcd4Bit                  = _evaluateAluBcd4Bit_fn;
chipEvaluators._evaluateAdderBcd4Bit                = _evaluateAdderBcd4Bit_fn;

// ── Block 32 evaluators ──────────────────────────────────────────────────────

function _evaluateShiftReg8BitLatchTri_fn(comp, gate) {
  // 74589: 8 bit serial-in shift register with input latch, tri-state QH output.
  // Input latch: D0-D7 transparent while RCK=1; latched when RCK=0.
  // CKEN=0: clock enabled; CKEN=1: shift clock inhibited.
  // On rising SRCK (when CKEN=0): SER enters at QA (bit0), shifts toward QH (bit7).
  // OE=0: QH output driven; OE=1: QH HiZ.
  // inputs: [SER, SRCK, RCK, CKEN, OE, D0, D1, D2, D3, D4, D5, D6, D7]
  // outputs: [QH]
  const [serN, srckN, rckN, ckenN, oeN, d0N, d1N, d2N, d3N, d4N, d5N, d6N, d7N] = gate.inputs;
  const [qhName] = gate.outputs;
  const state = this._getSeqState(comp, qhName,
    { sr: new Array(8).fill(0), latch: new Array(8).fill(0),
      prevSRCK: 0, prevRCK: 0 });

  // Input latch: transparent on RCK=1
  const rck = this._readPinBit(comp, rckN);
  const dNames = [d0N, d1N, d2N, d3N, d4N, d5N, d6N, d7N];
  if (rck === 1) {
    for (let i = 0; i < 8; i++) state.latch[i] = this._readPinBit(comp, dNames[i]);
  }
  state.prevRCK = rck;

  // Shift register: clocked on rising SRCK when CKEN=0
  const cken = this._readPinBit(comp, ckenN);
  const srck = this._readPinBit(comp, srckN);
  if (cken === 0 && state.prevSRCK === 0 && srck === 1) {
    const ser = this._readPinBit(comp, serN);
    state.sr.pop();
    state.sr.unshift(ser);
  }
  state.prevSRCK = srck;

  const oe = this._readPinBit(comp, oeN);
  if (oe === 0) {
    return this._drivePinBit(comp, qhName, state.sr[7]);
  } else {
    return this._drivePinHighZ(comp, qhName);
  }
}

function _evaluateCounter8BitRegOutTri_fn(comp, gate) {
  // 74590/74591: 8 bit binary counter with separate output register, tri-state.
  // CCLKn: counter clock, active LOW (rising edge = falling CCLKn).
  // CCLR=0: async clear counter. RCLR=0: async clear output register.
  // Rising RCLK: latch counter value into output register.
  // OEn=0: drive Q0-Q7; OEn=1: HiZ.
  // RC output: carry high when counter==255.
  // inputs: [CCLKn, CCLR, RCLK, RCLR, OEn]
  // outputs: [Q0..Q7, RC]
  const [ccclknN, cclrN, rclkN, rclrN, oenN] = gate.inputs;
  const state = this._getSeqState(comp, gate.outputs[0],
    { count: 0, reg: new Array(8).fill(0),
      prevCCLKn: 1, prevRCLK: 0 });

  // Async clears
  const cclr = this._readPinBit(comp, cclrN);
  if (cclr === 0) state.count = 0;

  const rclr = this._readPinBit(comp, rclrN);
  if (rclr === 0) state.reg.fill(0);

  // Counter: increment on falling CCLKn (rising edge of inverted clock)
  const ccclkn = this._readPinBit(comp, ccclknN);
  if (state.prevCCLKn === 1 && ccclkn === 0 && cclr === 1) {
    state.count = (state.count + 1) & 0xFF;
  }
  state.prevCCLKn = ccclkn;

  // Output register: latch on rising RCLK
  const rclk = this._readPinBit(comp, rclkN);
  if (state.prevRCLK === 0 && rclk === 1 && rclr === 1) {
    for (let i = 0; i < 8; i++) state.reg[i] = (state.count >> i) & 1;
  }
  state.prevRCLK = rclk;

  const oen = this._readPinBit(comp, oenN);
  let changed = false;
  if (oen === 0) {
    changed = this._drivePinBits(comp, gate.outputs.slice(0, 8), state.reg);
  } else {
    changed = this._drivePinsHighZ(comp, gate.outputs.slice(0, 8));
  }
  // RC = ripple carry: high when counter is at max (255)
  if (this._drivePinBit(comp, gate.outputs[8], state.count === 255 ? 1 : 0)) changed = true;
  return changed;
}

function _evaluateCounter8BitRegOutOc_fn(comp, gate) {
  // 74591: Same as 74590 but OC reuse the same logic (OC modeled same as TRI here)
  return _evaluateCounter8BitRegOutTri_fn.call(this, comp, gate);
}

function _evaluateCounter8BitRegIn_fn(comp, gate) {
  // 74592: 8 bit binary counter with input registers (no output bus).
  // RCK rising: latch D0-D7 into input register.
  // CCK rising: if CKEN=0→parallel load from input register; if CKEN=1→count up.
  // CCLR=0: async clear counter (active LOW).
  // RC output: high when counter==255 (ripple carry).
  // inputs: [CCK, CCLR, RCK, CKEN, D0..D7]
  // outputs: [RC]
  const [cckN, cclrN, rckN, ckenN, d0N, d1N, d2N, d3N, d4N, d5N, d6N, d7N] = gate.inputs;
  const [rcName] = gate.outputs;
  const state = this._getSeqState(comp, rcName,
    { count: 0, inputReg: new Array(8).fill(0),
      prevCCK: 0, prevRCK: 0 });

  // Async clear
  const cclr = this._readPinBit(comp, cclrN);
  if (cclr === 0) state.count = 0;

  // Input register latch on rising RCK
  const rck = this._readPinBit(comp, rckN);
  if (state.prevRCK === 0 && rck === 1) {
    const dNames = [d0N, d1N, d2N, d3N, d4N, d5N, d6N, d7N];
    for (let i = 0; i < 8; i++) state.inputReg[i] = this._readPinBit(comp, dNames[i]);
  }
  state.prevRCK = rck;

  // Counter operation on rising CCK
  const cck = this._readPinBit(comp, cckN);
  if (cclr === 1 && state.prevCCK === 0 && cck === 1) {
    const cken = this._readPinBit(comp, ckenN);
    if (cken === 0) {
      // Parallel load from input register
      state.count = 0;
      for (let i = 0; i < 8; i++) state.count |= (state.inputReg[i] << i);
    } else {
      state.count = (state.count + 1) & 0xFF;
    }
  }
  state.prevCCK = cck;

  return this._drivePinBit(comp, rcName, state.count === 255 ? 1 : 0);
}

function _evaluateCounter8BitRegInTri_fn(comp, gate) {
  // 74593: Like 74592 but with tri-state output on D0-D7 bidirectional bus.
  // When OEn=0: drives D0-D7 from counter value.
  // inputs: [CCK, CCLR, RCK, CKEN, OEn, D0..D7]
  // outputs: [D0..D7, RC]
  const [cckN, cclrN, rckN, ckenN, oenN, d0N, d1N, d2N, d3N, d4N, d5N, d6N, d7N] = gate.inputs;
  const dOutNames = gate.outputs.slice(0, 8); // D0..D7 as outputs
  const rcName = gate.outputs[8];
  const state = this._getSeqState(comp, rcName,
    { count: 0, inputReg: new Array(8).fill(0),
      prevCCK: 0, prevRCK: 0 });

  // Async clear
  const cclr = this._readPinBit(comp, cclrN);
  if (cclr === 0) state.count = 0;

  const oen = this._readPinBit(comp, oenN);

  // Input register latch on rising RCK (only when OEn=1, i.e. reading from bus)
  const rck = this._readPinBit(comp, rckN);
  if (state.prevRCK === 0 && rck === 1 && oen === 1) {
    const dInNames = [d0N, d1N, d2N, d3N, d4N, d5N, d6N, d7N];
    for (let i = 0; i < 8; i++) state.inputReg[i] = this._readPinBit(comp, dInNames[i]);
  }
  state.prevRCK = rck;

  // Counter operation on rising CCK
  const cck = this._readPinBit(comp, cckN);
  if (cclr === 1 && state.prevCCK === 0 && cck === 1) {
    const cken = this._readPinBit(comp, ckenN);
    if (cken === 0) {
      state.count = 0;
      for (let i = 0; i < 8; i++) state.count |= (state.inputReg[i] << i);
    } else {
      state.count = (state.count + 1) & 0xFF;
    }
  }
  state.prevCCK = cck;

  let changed = false;
  // Drive Q outputs on D0-D7 bus when OEn=0
  if (oen === 0) {
    const bits = [];
    for (let i = 0; i < 8; i++) bits.push((state.count >> i) & 1);
    changed = this._drivePinBits(comp, dOutNames, bits);
  } else {
    changed = this._drivePinsHighZ(comp, dOutNames);
  }
  if (this._drivePinBit(comp, rcName, state.count === 255 ? 1 : 0)) changed = true;
  return changed;
}

function _evaluateShiftReg8BitLatchBuf_fn(comp, gate) {
  // 74594/74599: 8 bit SIPO shift register with separate output latch, buffered outputs.
  // Like 74595 but NO OEn (outputs always driven from output register).
  // SRCLR=0: async clear shift register (output register unchanged).
  // RCLR=0: async clear output register.
  // On rising SRCLK: SER enters at QA (bit0), shifts toward QH (bit7).
  // On rising RCLK: latch SR → output register → QA..QH.
  // QHs: always reflects SR[7] (last shift stage; not gated).
  // inputs: [SER, SRCLK, RCLK, SRCLR, RCLR]
  // outputs: [QA..QH, QHs]
  const [serN, srclkN, rclkN, srclrN, rclrN] = gate.inputs;
  const state = this._getSeqState(comp, gate.outputs[0],
    { sr: new Array(8).fill(0), or: new Array(8).fill(0),
      prevSRCLK: 0, prevRCLK: 0 });

  // Async clear SR
  const srclr = this._readPinBit(comp, srclrN);
  if (srclr === 0) {
    state.sr.fill(0);
    state.prevSRCLK = this._readPinBit(comp, srclkN);
  } else {
    const srclk = this._readPinBit(comp, srclkN);
    if (state.prevSRCLK === 0 && srclk === 1) {
      const ser = this._readPinBit(comp, serN);
      state.sr.pop();
      state.sr.unshift(ser);
    }
    state.prevSRCLK = srclk;
  }

  // Async clear OR
  const rclr = this._readPinBit(comp, rclrN);
  if (rclr === 0) {
    state.or.fill(0);
    state.prevRCLK = this._readPinBit(comp, rclkN);
  } else {
    const rclk = this._readPinBit(comp, rclkN);
    if (state.prevRCLK === 0 && rclk === 1) {
      state.or = state.sr.slice();
    }
    state.prevRCLK = rclk;
  }

  // Outputs always driven (buffered, no OEn)
  let changed = this._drivePinBits(comp, gate.outputs.slice(0, 8), state.or);
  if (this._drivePinBit(comp, gate.outputs[8], state.sr[7])) changed = true;
  return changed;
}

function _evaluateShiftReg8BitPisoLatch_fn(comp, gate) {
  // 74597: 8 bit parallel-in serial-out shift register with input latches.
  // D0-D7 latched into input register on rising RCK.
  // SHLD=0: async parallel load from input latch into shift register.
  // SHLD=1 + rising SRCK: shift right (SER enters at bit0, QH=bit7 is output).
  // QG and QH are outputs; QH is the serial output.
  // inputs: [SER, SRCK, RCK, SHLD, D0..D7]
  // outputs: [QH]
  const [serN, srckN, rckN, shldN, d0N, d1N, d2N, d3N, d4N, d5N, d6N, d7N] = gate.inputs;
  const [qhName] = gate.outputs;
  const state = this._getSeqState(comp, qhName,
    { sr: new Array(8).fill(0), latch: new Array(8).fill(0),
      prevSRCK: 0, prevRCK: 0 });

  // Input latch: capture on rising RCK
  const rck = this._readPinBit(comp, rckN);
  if (state.prevRCK === 0 && rck === 1) {
    const dNames = [d0N, d1N, d2N, d3N, d4N, d5N, d6N, d7N];
    for (let i = 0; i < 8; i++) state.latch[i] = this._readPinBit(comp, dNames[i]);
  }
  state.prevRCK = rck;

  // SHLD=0: async parallel load from latch
  const shld = this._readPinBit(comp, shldN);
  if (shld === 0) {
    state.sr = state.latch.slice();
  } else {
    // SHLD=1: shift on rising SRCK
    const srck = this._readPinBit(comp, srckN);
    if (state.prevSRCK === 0 && srck === 1) {
      const ser = this._readPinBit(comp, serN);
      // Shift right: bit0 gets SER, bit1 gets old bit0, ..., bit7 gets old bit6
      state.sr.pop();
      state.sr.unshift(ser);
    }
    state.prevSRCK = this._readPinBit(comp, srckN);
  }

  // QH = bit7 (MSB end of shift chain)
  return this._drivePinBit(comp, qhName, state.sr[7]);
}

function _evaluateShiftReg8BitSelTri_fn(comp, gate) {
  // 74598: 8 bit shift register, selectable PI/PO, input latches, tri-state.
  // D0-D7 latched on rising RCK.
  // S1/S0 mode select (on rising CLK):
  //   00: hold; 01: shift right (SER→bit0); 10: parallel load from latch; 11: parallel out
  // OEn=0: drive D0-D7 (parallel out mode) and QH output.
  // inputs: [SER, CLK, RCK, S0, S1, OEn, D0..D7]
  // outputs: [D0..D7, QH]
  const [serN, clkN, rckN, s0N, s1N, oenN, d0N, d1N, d2N, d3N, d4N, d5N, d6N, d7N] = gate.inputs;
  const dOutNames = gate.outputs.slice(0, 8);
  const qhName = gate.outputs[8];
  const state = this._getSeqState(comp, qhName,
    { sr: new Array(8).fill(0), latch: new Array(8).fill(0),
      prevCLK: 0, prevRCK: 0 });

  // Input latch on rising RCK
  const rck = this._readPinBit(comp, rckN);
  if (state.prevRCK === 0 && rck === 1) {
    const dNames = [d0N, d1N, d2N, d3N, d4N, d5N, d6N, d7N];
    for (let i = 0; i < 8; i++) state.latch[i] = this._readPinBit(comp, dNames[i]);
  }
  state.prevRCK = rck;

  // Mode select on rising CLK
  const clk = this._readPinBit(comp, clkN);
  if (state.prevCLK === 0 && clk === 1) {
    const s0 = this._readPinBit(comp, s0N);
    const s1 = this._readPinBit(comp, s1N);
    const mode = (s1 << 1) | s0;
    if (mode === 1) {
      // Shift right: SER→bit0, bits shift toward bit7
      const ser = this._readPinBit(comp, serN);
      state.sr.pop();
      state.sr.unshift(ser);
    } else if (mode === 2) {
      // Parallel load from input latch
      state.sr = state.latch.slice();
    }
    // mode 0: hold; mode 3: parallel out (driven on OEn=0 below)
  }
  state.prevCLK = clk;

  const oen = this._readPinBit(comp, oenN);
  let changed = false;
  if (oen === 0) {
    // Drive D0-D7 outputs from shift register
    changed = this._drivePinBits(comp, dOutNames, state.sr.slice());
  } else {
    changed = this._drivePinsHighZ(comp, dOutNames);
  }
  // QH is always driven (serial output = bit7)
  if (this._drivePinBit(comp, qhName, state.sr[7])) changed = true;
  return changed;
}

function _evaluateDramRefreshStub_fn(comp, gate) {
  // 74600/601/602/603: DRAM refresh controller stub implementation.
  // Drives all outputs HiZ (complex controller not fully simulated).
  // inputs: [OSC, BURST, MR, OEn]
  // outputs: [TC, RAS, CAS, RFSH]
  let changed = false;
  for (const outPin of gate.outputs) {
    if (this._drivePinHighZ(comp, outPin)) changed = true;
  }
  return changed;
}

function _evaluateMemCycleCtrl_fn(comp, gate) {
  // 74608: Memory cycle controller stub implementation.
  // Simple pass-through: CS active when EN1=0 AND EN2=0. OE/WE from RD/WR.
  // WAIT driven inactive (1). Stub only models basic enable logic.
  // inputs: [A0, A1, A2, A3, EN1, EN2, RD, WR, CLK, MR]
  // outputs: [CS, OE, WE, WAIT]
  const [a0N, a1N, a2N, a3N, en1N, en2N, rdN, wrN, clkN, mrN] = gate.inputs;
  const [csName, oeName, weName, waitName] = gate.outputs;

  const en1 = this._readPinBit(comp, en1N);
  const en2 = this._readPinBit(comp, en2N);
  const rd  = this._readPinBit(comp, rdN);
  const wr  = this._readPinBit(comp, wrN);
  const mr  = this._readPinBit(comp, mrN);

  // CS active (0) when both enables active
  const cs = (en1 === 0 && en2 === 0 && mr === 1) ? 0 : 1;
  // OE active (0) when CS active and RD active (0)
  const oe = (cs === 0 && rd === 0) ? 0 : 1;
  // WE active (0) when CS active and WR active (0)
  const we = (cs === 0 && wr === 0) ? 0 : 1;

  let changed = false;
  if (this._drivePinBit(comp, csName,   cs))   changed = true;
  if (this._drivePinBit(comp, oeName,   oe))   changed = true;
  if (this._drivePinBit(comp, weName,   we))   changed = true;
  if (this._drivePinBit(comp, waitName, 1))    changed = true;  // WAIT inactive
  return changed;
}

chipEvaluators._evaluateShiftReg8BitLatchTri  = _evaluateShiftReg8BitLatchTri_fn;
chipEvaluators._evaluateCounter8BitRegOutTri  = _evaluateCounter8BitRegOutTri_fn;
chipEvaluators._evaluateCounter8BitRegOutOc   = _evaluateCounter8BitRegOutOc_fn;
chipEvaluators._evaluateCounter8BitRegIn      = _evaluateCounter8BitRegIn_fn;
chipEvaluators._evaluateCounter8BitRegInTri   = _evaluateCounter8BitRegInTri_fn;
chipEvaluators._evaluateShiftReg8BitLatchBuf  = _evaluateShiftReg8BitLatchBuf_fn;
chipEvaluators._evaluateShiftReg8BitPisoLatch = _evaluateShiftReg8BitPisoLatch_fn;
chipEvaluators._evaluateShiftReg8BitSelTri    = _evaluateShiftReg8BitSelTri_fn;
chipEvaluators._evaluateDramRefreshStub       = _evaluateDramRefreshStub_fn;
chipEvaluators._evaluateMemCycleCtrl          = _evaluateMemCycleCtrl_fn;

// ── Block 33 evaluators ───────────────────────────────────────────────────

function _evaluateTransceiver8BitInv_fn(comp, gate) {
  // 74620/622/638/640: Octal bidirectional bus transceiver, inverting outputs.
  // gate.inputs: [A1..A8, B1..B8, DIR, OEn]  (indices 0-7=A, 8-15=B, 16=DIR, 17=OEn)
  // gate.outputs: [A1..A8, B1..B8]           (indices 0-7=A, 8-15=B)
  // OEn=0: enabled; OEn=1: all outputs HiZ.
  // DIR=1: A→/B (read A-side, drive inverted B-side; A-side HiZ).
  // DIR=0: B→/A (read B-side, drive inverted A-side; B-side HiZ).
  const oe  = this._readPinBit(comp, gate.inputs[17]);
  const dir = this._readPinBit(comp, gate.inputs[16]);
  let changed = false;
  if (oe !== 0) {
    if (this._drivePinsHighZ(comp, gate.outputs)) changed = true;
  } else if (dir === 1) {
    // A→/B: drive inverted B-side, HiZ A-side
    for (let i = 0; i < 8; i++) {
      if (this._drivePinHighZ(comp, gate.outputs[i])) changed = true;
    }
    for (let i = 0; i < 8; i++) {
      const bit = this._readPinBit(comp, gate.inputs[i]) ^ 1;
      if (this._drivePinBit(comp, gate.outputs[8 + i], bit)) changed = true;
    }
  } else {
    // B→/A: drive inverted A-side, HiZ B-side
    for (let i = 0; i < 8; i++) {
      const bit = this._readPinBit(comp, gate.inputs[8 + i]) ^ 1;
      if (this._drivePinBit(comp, gate.outputs[i], bit)) changed = true;
    }
    for (let i = 0; i < 8; i++) {
      if (this._drivePinHighZ(comp, gate.outputs[8 + i])) changed = true;
    }
  }
  return changed;
}

function _evaluateEccStub_fn(comp, gate) {
  // 74636/637: 8 bit ECC too complex to simulate. Drive all outputs HiZ.
  let changed = false;
  for (const op of gate.outputs) {
    if (this._drivePinHighZ(comp, op)) changed = true;
  }
  return changed;
}

chipEvaluators._evaluateTransceiver8BitInv = _evaluateTransceiver8BitInv_fn;
chipEvaluators._evaluateEccStub            = _evaluateEccStub_fn;

// ── Block 34 evaluators ───────────────────────────────────────────────────

function _evaluateParityBufferStub_fn(comp, gate) {
  // 74655/656/657: Octal buffer/transceiver with parity generator.
  // Parity logic is non-trivial to simulate generically here;
  // drive all outputs HiZ (stub). In practice the user can probe data lines directly.
  let changed = false;
  for (const op of gate.outputs) {
    if (this._drivePinHighZ(comp, op)) changed = true;
  }
  return changed;
}

chipEvaluators._evaluateParityBufferStub = _evaluateParityBufferStub_fn;

function _evaluateLatch8BitTri_fn(comp, gate) {
  // 74666: 8 bit D-type transparent read-back latch, non-inverting, tri-state.
  // inputs: [D0..D7, LE, OEn, CLR]
  // outputs: [Q0..Q7]
  // CLR=0 → async clear all Q to 0.
  // LE=1 → transparent (output follows D); LE=0 → latch (hold).
  // OEn=1 → outputs HiZ.
  const state = this._getSeqState(comp, gate.outputs[0], { q: new Array(8).fill(0) });
  const bits = this._readGateInputs(comp, gate.inputs);
  const [d0,d1,d2,d3,d4,d5,d6,d7, le, oen, clr] = bits;
  const d = [d0,d1,d2,d3,d4,d5,d6,d7];
  let changed = false;
  if (!clr) {
    state.q.fill(0);
  } else if (le) {
    for (let i = 0; i < 8; i++) state.q[i] = d[i];
  }
  for (let i = 0; i < 8; i++) {
    if (oen) {
      if (this._drivePinHighZ(comp, gate.outputs[i])) changed = true;
    } else {
      if (this._drivePinBit(comp, gate.outputs[i], state.q[i])) changed = true;
    }
  }
  return changed;
}

chipEvaluators._evaluateLatch8BitTri = _evaluateLatch8BitTri_fn;

function _evaluateLatch8BitInvTri_fn(comp, gate) {
  // 74667: 8 bit D-type transparent read-back latch, inverting, tri-state.
  // Same as 74666 but outputs are inverted (~D when transparent, ~latched when held).
  // inputs: [D0..D7, LE, OEn, CLR]
  // outputs: [Q0..Q7]
  const state = this._getSeqState(comp, gate.outputs[0], { q: new Array(8).fill(0) });
  const bits = this._readGateInputs(comp, gate.inputs);
  const [d0,d1,d2,d3,d4,d5,d6,d7, le, oen, clr] = bits;
  const d = [d0,d1,d2,d3,d4,d5,d6,d7];
  let changed = false;
  if (!clr) {
    state.q.fill(1); // inverting clear: Q = NOT 0 = 1
  } else if (le) {
    for (let i = 0; i < 8; i++) state.q[i] = d[i] ? 0 : 1;
  }
  for (let i = 0; i < 8; i++) {
    if (oen) {
      if (this._drivePinHighZ(comp, gate.outputs[i])) changed = true;
    } else {
      if (this._drivePinBit(comp, gate.outputs[i], state.q[i])) changed = true;
    }
  }
  return changed;
}

chipEvaluators._evaluateLatch8BitInvTri = _evaluateLatch8BitInvTri_fn;

function _evaluateShiftReg16BitStub_fn(comp, gate) {
  // 74673/674/675/676: 16 bit shift register (various serial/parallel configs).
  // Complex multi-clock logic stub drives all outputs HiZ.
  let changed = false;
  for (const op of gate.outputs) {
    if (this._drivePinHighZ(comp, op)) changed = true;
  }
  return changed;
}

chipEvaluators._evaluateShiftReg16BitStub = _evaluateShiftReg16BitStub_fn;

function _evaluateAddrComp16BitStub_fn(comp, gate) {
  // 74677: 16 bit address comparator with enable.
  // Complex registered comparator stub drives all outputs HiZ.
  let changed = false;
  for (const op of gate.outputs) {
    if (this._drivePinHighZ(comp, op)) changed = true;
  }
  return changed;
}

chipEvaluators._evaluateAddrComp16BitStub = _evaluateAddrComp16BitStub_fn;

// ── Block 36 evaluators ───────────────────────────────────────────────────────

function _evaluateAcc4BitStub_fn(comp, gate) {
  // 74681: 4 bit parallel binary accumulator, tri-state outputs.
  // Complex ALU/accumulator stub drives all outputs HiZ.
  let changed = false;
  for (const op of gate.outputs) {
    if (this._drivePinHighZ(comp, op)) changed = true;
  }
  return changed;
}

function _evaluateComparator8BitPq_fn(comp, gate) {
  // 74682/683/684/685: 8 bit magnitude comparator, P>Q output.
  // inputs: [P0..P7, Q0..Q7, G]  (G=enable, active LOW)
  // outputs: [PGQ]  (active LOW: LOW when P>Q)
  // G=0 → enabled, G=1 → output HiZ (TRI) or open (OC)
  const bits = this._readGateInputs(comp, gate.inputs);
  const p = bits[0]|(bits[1]<<1)|(bits[2]<<2)|(bits[3]<<3)|(bits[4]<<4)|(bits[5]<<5)|(bits[6]<<6)|(bits[7]<<7);
  const q = bits[8]|(bits[9]<<1)|(bits[10]<<2)|(bits[11]<<3)|(bits[12]<<4)|(bits[13]<<5)|(bits[14]<<6)|(bits[15]<<7);
  const g = bits[16]; // enable, active LOW
  const isOC = comp.chipDef && comp.chipDef.openCollector;
  let changed = false;
  if (g !== 0) {
    // Disabled
    if (isOC) {
      if (this._drivePinOC(comp, gate.outputs[0], 1)) changed = true;
    } else {
      if (this._drivePinHighZ(comp, gate.outputs[0])) changed = true;
    }
  } else {
    // Enabled: PGQ is active LOW, LOW when P>Q
    const pgq = (p > q) ? 0 : 1;
    if (isOC) {
      if (this._drivePinOC(comp, gate.outputs[0], pgq)) changed = true;
    } else {
      if (this._drivePinBit(comp, gate.outputs[0], pgq)) changed = true;
    }
  }
  return changed;
}

function _evaluateComparator8BitPqEn_fn(comp, gate) {
  // 74686/687: 8 bit magnitude comparator, P>Q and P==Q outputs, dual enable.
  // inputs: [P0..P7, Q0..Q7, G1, G2]  (G1 AND G2 both active LOW → enabled)
  // outputs: [PGQ, PEQQ]  (both active LOW)
  const bits = this._readGateInputs(comp, gate.inputs);
  const p = bits[0]|(bits[1]<<1)|(bits[2]<<2)|(bits[3]<<3)|(bits[4]<<4)|(bits[5]<<5)|(bits[6]<<6)|(bits[7]<<7);
  const q = bits[8]|(bits[9]<<1)|(bits[10]<<2)|(bits[11]<<3)|(bits[12]<<4)|(bits[13]<<5)|(bits[14]<<6)|(bits[15]<<7);
  const g1 = bits[16];
  const g2 = bits[17];
  const isOC = comp.chipDef && comp.chipDef.openCollector;
  let changed = false;
  if (g1 !== 0 || g2 !== 0) {
    // Disabled
    for (const op of gate.outputs) {
      if (isOC) {
        if (this._drivePinOC(comp, op, 1)) changed = true;
      } else {
        if (this._drivePinHighZ(comp, op)) changed = true;
      }
    }
  } else {
    // Enabled
    const pgq  = (p > q) ? 0 : 1;    // active LOW: LOW when P>Q
    const peqq = (p === q) ? 0 : 1;  // active LOW: LOW when P==Q
    const outVals = [pgq, peqq];
    for (let i = 0; i < gate.outputs.length; i++) {
      if (isOC) {
        if (this._drivePinOC(comp, gate.outputs[i], outVals[i])) changed = true;
      } else {
        if (this._drivePinBit(comp, gate.outputs[i], outVals[i])) changed = true;
      }
    }
  }
  return changed;
}

function _evaluateComparator8BitEq_fn(comp, gate) {
  // 74688/689: 8 bit identity comparator, equality (P==Q) output with enable.
  // inputs: [P0..P7, Q0..Q7, G]  (G=enable, active LOW)
  // outputs: [PEQQ]  (active LOW: LOW when P==Q)
  const bits = this._readGateInputs(comp, gate.inputs);
  const isOC = comp.chipDef && comp.chipDef.openCollector;
  const g = bits[16]; // enable, active LOW
  let changed = false;
  if (g !== 0) {
    // Disabled
    if (isOC) {
      if (this._drivePinOC(comp, gate.outputs[0], 1)) changed = true;
    } else {
      if (this._drivePinHighZ(comp, gate.outputs[0])) changed = true;
    }
  } else {
    // Enabled: compare all 8 bit pairs
    let eq = 1;
    for (let i = 0; i < 8; i++) {
      if (bits[i] !== bits[8 + i]) { eq = 0; break; }
    }
    const peqq = eq ? 0 : 1; // active LOW: LOW when equal
    if (isOC) {
      if (this._drivePinOC(comp, gate.outputs[0], peqq)) changed = true;
    } else {
      if (this._drivePinBit(comp, gate.outputs[0], peqq)) changed = true;
    }
  }
  return changed;
}

function _evaluateCounterLatchMuxStub_fn(comp, gate) {
  // 74690/691/692/693: 4 bit counter/latch/multiplexer combination.
  // Complex sequential chip stub drives all outputs HiZ.
  let changed = false;
  for (const op of gate.outputs) {
    if (this._drivePinHighZ(comp, op)) changed = true;
  }
  return changed;
}

chipEvaluators._evaluateAcc4BitStub           = _evaluateAcc4BitStub_fn;
chipEvaluators._evaluateComparator8BitPq      = _evaluateComparator8BitPq_fn;
chipEvaluators._evaluateComparator8BitPqEn    = _evaluateComparator8BitPqEn_fn;
chipEvaluators._evaluateComparator8BitEq      = _evaluateComparator8BitEq_fn;
chipEvaluators._evaluateCounterLatchMuxStub   = _evaluateCounterLatchMuxStub_fn;

// ── Block 37 evaluators ─────────────────────────────────────────────────────

function _evaluatePll7046_fn(comp, gate) {
  // 74x7046: PLL with VCO and lock detector (CD74HC7046A family).
  // inputs:  [COMPi, INH, C1A, C1B, VCOi, R1, R2, SIGi]
  // outputs: [PCout, PC1, VCOo, DEMo, PC2, PC3]
  //
  // PCout = edge-triggered frequency/phase comparator (PC2-type):
  //         1 when SIGi leads COMPi, 0 when COMPi leads, 0 on simultaneous
  // PC1   = SIGi XOR COMPi  (XOR phase comparator)
  // VCOo  = SIGi when INH=0, else 0
  // DEMo  = SIGi when INH=0, else 0  (demodulator output mirrors VCOo)
  // PC2   = !(SIGi XOR COMPi)  (XNOR complement of PC1)
  // PC3   = 1 when SIGi === COMPi  (lock detector)
  const bits = this._readGateInputs(comp, gate.inputs);
  const [compIn, inh, , , , , , sigIn] = bits;
  if (!comp.state) comp.state = { prevSig: 0, prevComp: 0, pcout: 0 };
  let changed = false;

  const risingSig  = comp.state.prevSig  === 0 && sigIn  === 1;
  const risingComp = comp.state.prevComp === 0 && compIn === 1;
  if (risingSig  && !risingComp) comp.state.pcout = 1;
  if (risingComp && !risingSig)  comp.state.pcout = 0;
  if (risingSig  &&  risingComp) comp.state.pcout = 0;
  comp.state.prevSig  = sigIn;
  comp.state.prevComp = compIn;

  const pc1   = sigIn ^ compIn;
  const pc2   = pc1 ^ 1;
  const vcoO  = inh ? 0 : sigIn;
  const pc3   = (sigIn === compIn) ? 1 : 0;

  if (this._drivePinBit(comp, gate.outputs[0], comp.state.pcout)) changed = true; // PCout
  if (this._drivePinBit(comp, gate.outputs[1], pc1))              changed = true; // PC1
  if (this._drivePinBit(comp, gate.outputs[2], vcoO))             changed = true; // VCOo
  if (this._drivePinBit(comp, gate.outputs[3], vcoO))             changed = true; // DEMo
  if (this._drivePinBit(comp, gate.outputs[4], pc2))              changed = true; // PC2
  if (this._drivePinBit(comp, gate.outputs[5], pc3))              changed = true; // PC3
  return changed;
}

chipEvaluators._evaluatePll7046 = _evaluatePll7046_fn;


function _evaluatePll9046_fn(comp, gate) {
  // 74x9046: PLL with band-gap controlled VCO (CD74HC7046A family reference).
  // inputs:  [COMPin, INH, C1A, C1B, VCOin, DEMin, R1, R2, SIGin]
  // outputs: [PC1out, PC2out, VCOout, PC3out, LD]
  //
  // PC1out  = SIGin XOR COMPin  (XOR phase comparator)
  // PC2out  = edge-triggered frequency/phase comparator: 1 when SIGin leads,
  //           0 when COMPin leads, 0 when both edges coincide
  // VCOout  = SIGin when INH=0, else 0  (loop model: VCO tracks signal)
  // PC3out  = !(SIGin XOR COMPin)  (XNOR / PC1 complement)
  // LD      = 1 when SIGin === COMPin (lock detect)
  const bits = this._readGateInputs(comp, gate.inputs);
  const [compIn, inh, , , , , , , sigIn] = bits;
  if (!comp.state) comp.state = { prevSig: 0, prevComp: 0, pc2: 0 };
  let changed = false;

  const risingSig  = comp.state.prevSig  === 0 && sigIn  === 1;
  const risingComp = comp.state.prevComp === 0 && compIn === 1;
  if (risingSig  && !risingComp) comp.state.pc2 = 1;
  if (risingComp && !risingSig)  comp.state.pc2 = 0;
  if (risingSig  &&  risingComp) comp.state.pc2 = 0;
  comp.state.prevSig  = sigIn;
  comp.state.prevComp = compIn;

  const pc1    = sigIn ^ compIn;
  const pc3    = pc1 ^ 1;
  const vcoOut = inh ? 0 : sigIn;
  const ld     = (sigIn === compIn) ? 1 : 0;

  if (this._drivePinBit(comp, gate.outputs[0], pc1))            changed = true;
  if (this._drivePinBit(comp, gate.outputs[1], comp.state.pc2)) changed = true;
  if (this._drivePinBit(comp, gate.outputs[2], vcoOut))         changed = true;
  if (this._drivePinBit(comp, gate.outputs[3], pc3))            changed = true;
  if (this._drivePinBit(comp, gate.outputs[4], ld))             changed = true;
  return changed;
}

chipEvaluators._evaluatePll9046 = _evaluatePll9046_fn;

function _evaluateJtagAsp_fn(comp, gate) {
  // 74x8996: Multidrop-addressable JTAG ASP (BYP-controlled routing model).
  // inputs:  [BYP, PTRST, PTCK, PTDI, PTMS, STDI]
  // outputs: [STCK, STRST, STDO, STMS, PTDO, CON]
  //
  // STCK  always follows PTCK (index 2)
  // STRST always follows PTRST (index 1)
  // BYP=0 (connected): STDO=PTDI, PTDO=STDI, STMS=PTMS, CON=0 (active LOW)
  // BYP=1 (disconnected): STDO=HiZ, PTDO=HiZ, STMS=1, CON=1
  const bits = this._readGateInputs(comp, gate.inputs);
  const [byp, ptrst, ptck, ptdi, ptms, stdi] = bits;
  let changed = false;
  if (this._drivePinBit(comp, gate.outputs[0], ptck))  changed = true; // STCK
  if (this._drivePinBit(comp, gate.outputs[1], ptrst)) changed = true; // STRST
  if (byp) {
    if (this._drivePinHighZ(comp, gate.outputs[2])) changed = true; // STDO HiZ
    if (this._drivePinBit(comp, gate.outputs[3], 1)) changed = true; // STMS=H
    if (this._drivePinHighZ(comp, gate.outputs[4])) changed = true; // PTDO HiZ
    if (this._drivePinBit(comp, gate.outputs[5], 1)) changed = true; // CON=H (deasserted)
  } else {
    if (this._drivePinBit(comp, gate.outputs[2], ptdi)) changed = true; // STDO=PTDI
    if (this._drivePinBit(comp, gate.outputs[3], ptms)) changed = true; // STMS=PTMS
    if (this._drivePinBit(comp, gate.outputs[4], stdi)) changed = true; // PTDO=STDI
    if (this._drivePinBit(comp, gate.outputs[5], 0))    changed = true; // CON=L (asserted)
  }
  return changed;
}

chipEvaluators._evaluateJtagAsp = _evaluateJtagAsp_fn;

function _evaluateGenericStub_fn(comp, gate) {
  // Generic stub: drives all outputs HiZ (for complex chips not yet modeled).
  let changed = false;
  for (const op of gate.outputs) {
    if (this._drivePinHighZ(comp, op)) changed = true;
  }
  return changed;
}

function _evaluateMuxQuint2to1_fn(comp, gate) {
  // 74711: Five 2-to-1 multiplexers, tri-state outputs.
  // inputs: [A0,B0, A1,B1, A2,B2, A3,B3, A4,B4, SEL, OEn]  (12 inputs)
  // outputs: [Y0, Y1, Y2, Y3, Y4]
  // OEn=HIGH → all Y HiZ.
  // SEL=LOW  → Yi = Ai;  SEL=HIGH → Yi = Bi.
  const bits = this._readGateInputs(comp, gate.inputs);
  const oen = bits[11];
  const sel = bits[10];
  let changed = false;
  if (oen !== 0) {
    for (const op of gate.outputs) if (this._drivePinHighZ(comp, op)) changed = true;
    return changed;
  }
  for (let i = 0; i < 5; i++) {
    const bit = sel ? bits[2 * i + 1] : bits[2 * i]; // A=even index, B=odd index
    if (this._drivePinBit(comp, gate.outputs[i], bit)) changed = true;
  }
  return changed;
}

chipEvaluators._evaluateGenericStub     = _evaluateGenericStub_fn;
chipEvaluators._evaluateMuxQuint2to1    = _evaluateMuxQuint2to1_fn;

// ── Block 67 555 Timer ──────────────────────────────────────────────────

function _evaluateTimer555_fn(comp, gate) {
  // NE555 Timer analog comparator model.
  //
  // Internal architecture:
  //   - Three equal resistors form a voltage divider: VCC → R → R → R → GND
  //     producing reference voltages at 2/3 VCC and 1/3 VCC.
  //   - Upper comparator: THRESH (pin 6) vs upper reference (2/3 VCC or CTRL)
  //   - Lower comparator: TRIG (pin 2) vs lower reference (1/3 VCC or CTRL/2)
  //   - SR flip-flop: SET when TRIG < lower ref, RESET when THRESH > upper ref
  //   - DISCH (pin 7): open-collector NPN, ON (sinking to GND) when output LOW
  //   - RESETn (pin 4): active LOW, forces output LOW and DISCH ON
  //   - CTRL (pin 5): overrides the 2/3 VCC reference; lower ref = CTRL/2
  //
  // This reads ACTUAL analog voltages from the MNA solver, so the timer
  // works with real capacitor charge/discharge curves not pattern matching.

  const [trigName, threshName, resetName, ctrlName] = gate.inputs;
  const [outName, dischName] = gate.outputs;

  // Read analog voltages from the nets
  const vTrig   = this._readPinVoltage(comp, trigName);
  const vThresh = this._readPinVoltage(comp, threshName);
  const vCtrl   = this._readPinVoltage(comp, ctrlName);

  // CTRL pin sets the upper threshold. If floating (no external connection),
  // default to 2/3 VCC (standard 555 behavior internal resistor divider).
  const upperThresh = (vCtrl !== null) ? vCtrl : (VCC_VOLTAGE * 2 / 3);
  const lowerThresh = upperThresh / 2;

  // RESETn is digital (active LOW)
  const resetn = this._readPinBit(comp, resetName);

  // Internal SR flip-flop state
  const state = this._getSeqState(comp, outName, { q: 0 });

  if (resetn === 0) {
    // Active low reset: force output LOW, discharge ON
    state.q = 0;
  } else {
    // Lower comparator: TRIG < 1/3 VCC → SET (output HIGH)
    // Upper comparator: THRESH > 2/3 VCC → RESET (output LOW)
    // If both asserted simultaneously, SET takes priority (per datasheet).
    const trigBelow  = (vTrig !== null)   && (vTrig < lowerThresh);
    const threshAbove = (vThresh !== null) && (vThresh > upperThresh);

    if (trigBelow) {
      state.q = 1;  // SET
    } else if (threshAbove) {
      state.q = 0;  // RESET
    }
    // else: hold state neither comparator is triggering
  }

  let changed = false;

  // Drive OUT pin: push-pull, HIGH (5V) when q=1, LOW (0V) when q=0
  if (this._drivePinBit(comp, outName, state.q)) changed = true;

  // Drive DISCH pin: open-collector behavior
  //   q=1 (output HIGH) → DISCH is high-impedance (capacitor can charge)
  //   q=0 (output LOW)  → DISCH sinks to GND (capacitor discharges)
  if (state.q) {
    if (this._drivePinHighZ(comp, dischName)) changed = true;
  } else {
    if (this._drivePinSink(comp, dischName)) changed = true;
  }

  return changed;
}

chipEvaluators._evaluateTimer555 = _evaluateTimer555_fn;

// ── NE558 Quad Timer per-section evaluator ──────────────────────────────
// Each section is identical to the 555 except that THRESH and DISCH are the
// same physical pin (DISCH_x). The gate definition passes the DISCH pin name
// as both the threshold-input (gate.inputs[1]) and the discharge-output
// (gate.outputs[1]). The evaluator reads the DISCH net voltage for threshold
// comparison, then drives the same pin HiZ or SINK depending on latch state.

function _evaluateTimer558Section_fn(comp, gate) {
  // inputs:  [TRIG_x, DISCH_x (= threshold), RESETn, CTRL]
  // outputs: [OUT_x,  DISCH_x (= discharge)]
  const [trigName, dischThreshName, resetName, ctrlName] = gate.inputs;
  const [outName, dischName] = gate.outputs;
  // dischThreshName and dischName refer to the same DISCH pin.

  const vTrig  = this._readPinVoltage(comp, trigName);
  const vThresh = this._readPinVoltage(comp, dischThreshName); // reads cap voltage
  const vCtrl  = this._readPinVoltage(comp, ctrlName);

  const upperThresh = (vCtrl !== null) ? vCtrl : (VCC_VOLTAGE * 2 / 3);
  const lowerThresh = upperThresh / 2;

  const resetn = this._readPinBit(comp, resetName);
  const state  = this._getSeqState(comp, outName, { q: 0 });

  if (resetn === 0) {
    state.q = 0;
  } else {
    const trigBelow   = (vTrig   !== null) && (vTrig   < lowerThresh);
    const threshAbove = (vThresh !== null) && (vThresh > upperThresh);

    if (trigBelow) {
      state.q = 1;
    } else if (threshAbove) {
      state.q = 0;
    }
  }

  let changed = false;
  if (this._drivePinBit(comp, outName, state.q)) changed = true;

  if (state.q) {
    if (this._drivePinHighZ(comp, dischName)) changed = true;
  } else {
    if (this._drivePinSink(comp, dischName)) changed = true;
  }

  return changed;
}

chipEvaluators._evaluateTimer558Section = _evaluateTimer558Section_fn;



function _evaluateShiftRegLatch4094_fn(comp, gate) {
  // CD74x4094: 8 bit shift register with storage latch and tri-state outputs.
  // inputs: [D, CLK, STR, OE]
  // outputs: [Q1..Q8, QS1, QS2]
  // Rising CLK: shift data in (D enters at index 0, shifts toward index 7).
  // STR=HIGH: storage register follows shift register (transparent).
  // STR=LOW: storage register holds.
  // OE=HIGH (active HIGH): Q1-Q8 driven from storage register.
  // OE=LOW: Q1-Q8 HiZ.
  // QS1 = shift register[7] (always driven, not affected by OE).
  // QS2 = shift register[6] (always driven, not affected by OE).
  const [dN, clkN, strN, oeN] = gate.inputs;
  const state = this._getSeqState(comp, gate.outputs[0],
    { sr: new Array(8).fill(0), store: new Array(8).fill(0), prevCLK: 0 });

  const clk = this._readPinBit(comp, clkN);
  if (state.prevCLK === 0 && clk === 1) {
    const d = this._readPinBit(comp, dN);
    state.sr.pop();
    state.sr.unshift(d);
  }
  state.prevCLK = clk;

  const str = this._readPinBit(comp, strN);
  if (str === 1) {
    state.store = state.sr.slice();
  }

  const oe = this._readPinBit(comp, oeN);
  let changed;
  if (oe === 1) {
    changed = this._drivePinBits(comp, gate.outputs.slice(0, 8), state.store);
  } else {
    changed = this._drivePinsHighZ(comp, gate.outputs.slice(0, 8));
  }
  // QS1 = last stage of shift register (always driven)
  if (this._drivePinBit(comp, gate.outputs[8], state.sr[7])) changed = true;
  // QS2 = second-to-last stage of shift register (always driven)
  if (this._drivePinBit(comp, gate.outputs[9], state.sr[6])) changed = true;
  return changed;
}

function _evaluateDLatchOctalTriInv_fn(comp, gate) {
  // 74x4301: Octal D transparent latch with inverting tri-state outputs.
  // inputs: [D1..D8, LE, OEn], outputs: [Q1n..Q8n]
  // LE=1: Q follows ~D (transparent). LE=0: hold.
  // OEn=0 (active LOW): outputs enabled. OEn=1: HiZ.
  const dNames    = gate.inputs.slice(0, 8);
  const [leN,oeN] = gate.inputs.slice(8);
  const state = this._getSeqState(comp, gate.outputs[0],
    { q: new Array(8).fill(0) });

  const le = this._readPinBit(comp, leN);
  if (le === 1) {
    for (let i = 0; i < 8; i++) state.q[i] = this._readPinBit(comp, dNames[i]) ? 0 : 1;
  }

  const oe = this._readPinBit(comp, oeN);
  if (oe === 0) {
    return this._drivePinBits(comp, gate.outputs, state.q);
  } else {
    return this._drivePinsHighZ(comp, gate.outputs);
  }
}

function _evaluateDFFOctalTriInv_fn(comp, gate) {
  // 74x4303: Octal D edge-triggered flip-flop with inverting tri-state outputs.
  // inputs: [D1..D8, CLK, OEn], outputs: [Q1n..Q8n]
  // Rising CLK: Q latches ~D.
  // OEn=0 (active LOW): outputs enabled. OEn=1: HiZ.
  const dNames     = gate.inputs.slice(0, 8);
  const [clkN,oeN] = gate.inputs.slice(8);
  const state = this._getSeqState(comp, gate.outputs[0],
    { q: new Array(8).fill(0), prevClk: 0 });

  const clk = this._readPinBit(comp, clkN);
  if (state.prevClk === 0 && clk === 1) {
    for (let i = 0; i < 8; i++) state.q[i] = this._readPinBit(comp, dNames[i]) ? 0 : 1;
  }
  state.prevClk = clk;

  const oe = this._readPinBit(comp, oeN);
  if (oe === 0) {
    return this._drivePinBits(comp, gate.outputs, state.q);
  } else {
    return this._drivePinsHighZ(comp, gate.outputs);
  }
}

chipEvaluators._evaluateShiftRegLatch4094  = _evaluateShiftRegLatch4094_fn;
chipEvaluators._evaluateDLatchOctalTriInv  = _evaluateDLatchOctalTriInv_fn;
chipEvaluators._evaluateDFFOctalTriInv     = _evaluateDFFOctalTriInv_fn;

// ── Block 59 gate implementations ─────────────────────────────────────────

function _evaluateCounterBcdUpdownCd_fn(comp, gate) {
  // CD74x4510: Presettable synchronous BCD up/down counter.
  // inputs: [CP, UD, PE, CI, MR, P0, P1, P2, P3]
  // outputs: [Q0, Q1, Q2, Q3, COn]
  // MR=HIGH: async reset to 0.
  // PE=HIGH: async load of P0-P3.
  // CI=HIGH: counting enabled. CI=LOW: counting disabled.
  // UD=HIGH: count up. UD=LOW: count down.
  // CP: positive-edge clock.
  // COn: active LOW carry output at terminal count when CI=HIGH.
  const [cpN, udN, peN, ciN, mrN, p0N, p1N, p2N, p3N] = gate.inputs;
  const [q0, q1, q2, q3, coN] = gate.outputs;
  const state = this._getSeqState(comp, q0, { count: 0, prevClk: 0 });

  const mr = this._readPinBit(comp, mrN);
  if (mr === 1) {
    state.count = 0;
  } else {
    const pe = this._readPinBit(comp, peN);
    if (pe === 1) {
      state.count = this._readPinBit(comp, p0N) | (this._readPinBit(comp, p1N) << 1) |
        (this._readPinBit(comp, p2N) << 2) | (this._readPinBit(comp, p3N) << 3);
      if (state.count > 9) state.count = 9;
    } else {
      const clk = this._readPinBit(comp, cpN);
      const ci = this._readPinBit(comp, ciN);
      if (state.prevClk === 0 && clk === 1 && ci === 1) {
        const ud = this._readPinBit(comp, udN);
        if (ud === 1) state.count = (state.count + 1) % 10;
        else state.count = (state.count - 1 + 10) % 10;
      }
      state.prevClk = clk;
    }
  }

  const ci = this._readPinBit(comp, ciN);
  const ud = this._readPinBit(comp, udN);
  const terminal = (ud === 1) ? 9 : 0;
  const co = (ci === 1 && state.count === terminal) ? 0 : 1;
  let changed = this._drivePinBits(comp, [q0, q1, q2, q3],
    [state.count & 1, (state.count >> 1) & 1, (state.count >> 2) & 1, (state.count >> 3) & 1]);
  if (this._drivePinBit(comp, coN, co)) changed = true;
  return changed;
}

function _evaluateBcd7seg4511_fn(comp, gate) {
  // CD74x4511: BCD to 7-segment latch/decoder/driver (active HIGH, common cathode).
  // inputs: [A, B, C, D, LE, BIn, LTn]
  // outputs: [a, b, c, d, e, f, g]
  // LTn=LOW: all segments ON (lamp test, highest priority).
  // BIn=LOW: all segments OFF (blanking).
  // LE=HIGH: latch holds. LE=LOW: transparent.
  const [aN, bN, cN, dN, leN, biN, ltN] = gate.inputs;
  const state = this._getSeqState(comp, gate.outputs[0], { bcd: 0 });

  const le = this._readPinBit(comp, leN);
  if (le === 0) {
    state.bcd = this._readPinBit(comp, aN) | (this._readPinBit(comp, bN) << 1) |
      (this._readPinBit(comp, cN) << 2) | (this._readPinBit(comp, dN) << 3);
  }

  const lt = this._readPinBit(comp, ltN);
  const bi = this._readPinBit(comp, biN);

  let segs;
  if (lt === 0) {
    segs = [1, 1, 1, 1, 1, 1, 1]; // lamp test: all ON
  } else if (bi === 0) {
    segs = [0, 0, 0, 0, 0, 0, 0]; // blank: all OFF
  } else {
    // BCD → 7-segment (active HIGH outputs for common cathode)
    //           a  b  c  d  e  f  g
    const T = [
      /* 0 */ [1, 1, 1, 1, 1, 1, 0],
      /* 1 */ [0, 1, 1, 0, 0, 0, 0],
      /* 2 */ [1, 1, 0, 1, 1, 0, 1],
      /* 3 */ [1, 1, 1, 1, 0, 0, 1],
      /* 4 */ [0, 1, 1, 0, 0, 1, 1],
      /* 5 */ [1, 0, 1, 1, 0, 1, 1],
      /* 6 */ [1, 0, 1, 1, 1, 1, 1],
      /* 7 */ [1, 1, 1, 0, 0, 0, 0],
      /* 8 */ [1, 1, 1, 1, 1, 1, 1],
      /* 9 */ [1, 1, 1, 1, 0, 1, 1],
    ];
    segs = (state.bcd <= 9) ? T[state.bcd] : [0, 0, 0, 0, 0, 0, 0];
  }

  return this._drivePinBits(comp, gate.outputs, segs);
}

function _evaluateBcd7seg4543_fn(comp, gate) {
  // CD4543: BCD to 7-segment latch/decoder/driver (common-anode or common-cathode).
  // inputs: [A, B, C, D, LE, BL, Ph]
  // outputs: [a, b, c, d, e, f, g]
  // LE=LOW: transparent (outputs follow BCD input in real time).
  // LE=HIGH: latch holds current BCD value.
  // BL=HIGH: blanks all segments (active HIGH, opposite of CD4511).
  // Ph=LOW: active HIGH outputs (common cathode).
  // Ph=HIGH: active LOW outputs (common anode)   all segment bits inverted.
  // BCD 10 15: blank (all segments off).
  const [aN, bN, cN, dN, leN, blN, phN] = gate.inputs;
  const state = this._getSeqState(comp, gate.outputs[0], { bcd: 0 });

  const le = this._readPinBit(comp, leN);
  if (le === 0) {
    state.bcd = this._readPinBit(comp, aN) | (this._readPinBit(comp, bN) << 1) |
      (this._readPinBit(comp, cN) << 2) | (this._readPinBit(comp, dN) << 3);
  }

  const bl = this._readPinBit(comp, blN);
  const ph = this._readPinBit(comp, phN);

  let segs;
  if (bl === 1) {
    segs = [0, 0, 0, 0, 0, 0, 0]; // blanking: all segments off (active HIGH blank)
  } else {
    // BCD → 7-segment (active HIGH reference table, same as CD4511)
    //           a  b  c  d  e  f  g
    const T = [
      /* 0 */ [1, 1, 1, 1, 1, 1, 0],
      /* 1 */ [0, 1, 1, 0, 0, 0, 0],
      /* 2 */ [1, 1, 0, 1, 1, 0, 1],
      /* 3 */ [1, 1, 1, 1, 0, 0, 1],
      /* 4 */ [0, 1, 1, 0, 0, 1, 1],
      /* 5 */ [1, 0, 1, 1, 0, 1, 1],
      /* 6 */ [1, 0, 1, 1, 1, 1, 1],
      /* 7 */ [1, 1, 1, 0, 0, 0, 0],
      /* 8 */ [1, 1, 1, 1, 1, 1, 1],
      /* 9 */ [1, 1, 1, 1, 0, 1, 1],
    ];
    segs = (state.bcd <= 9) ? T[state.bcd] : [0, 0, 0, 0, 0, 0, 0];
  }

  // Ph=HIGH inverts all outputs for common-anode displays
  if (ph === 1) segs = segs.map(b => b ^ 1);

  return this._drivePinBits(comp, gate.outputs, segs);
}

function _evaluateDec4to16LatchHi_fn(comp, gate) {
  // CD74x4514: 4-to-16 decoder with input latches, active HIGH outputs.
  // inputs: [A, B, C, D, LE, ENn]
  // outputs: [Y0..Y15]
  // LE=LOW: address transparent. LE=HIGH: address latched.
  // ENn=LOW: enabled (selected output HIGH). ENn=HIGH: all outputs LOW.
  const state = this._getSeqState(comp, gate.outputs[0], { addr: 0 });
  const bits = this._readGateInputs(comp, gate.inputs);
  const le = bits[4];
  const en = bits[5];

  if (le === 0) {
    state.addr = bits[0] | (bits[1] << 1) | (bits[2] << 2) | (bits[3] << 3);
  }

  let changed = false;
  if (en !== 0) {
    for (let i = 0; i < 16; i++) {
      if (this._drivePinBit(comp, gate.outputs[i], 0)) changed = true;
    }
  } else {
    for (let i = 0; i < 16; i++) {
      if (this._drivePinBit(comp, gate.outputs[i], i === state.addr ? 1 : 0)) changed = true;
    }
  }
  return changed;
}

function _evaluateDec4to16LatchLo_fn(comp, gate) {
  // CD74x4515: 4-to-16 decoder with input latches, active LOW outputs.
  // inputs: [A, B, C, D, LE, ENn]
  // outputs: [Y0n..Y15n]
  // LE=LOW: address transparent. LE=HIGH: address latched.
  // ENn=LOW: enabled (selected output LOW, others HIGH). ENn=HIGH: all outputs HIGH.
  const state = this._getSeqState(comp, gate.outputs[0], { addr: 0 });
  const bits = this._readGateInputs(comp, gate.inputs);
  const le = bits[4];
  const en = bits[5];

  if (le === 0) {
    state.addr = bits[0] | (bits[1] << 1) | (bits[2] << 2) | (bits[3] << 3);
  }

  let changed = false;
  if (en !== 0) {
    for (let i = 0; i < 16; i++) {
      if (this._drivePinBit(comp, gate.outputs[i], 1)) changed = true;
    }
  } else {
    for (let i = 0; i < 16; i++) {
      if (this._drivePinBit(comp, gate.outputs[i], i === state.addr ? 0 : 1)) changed = true;
    }
  }
  return changed;
}

function _evaluateCounterBinUpdownCd_fn(comp, gate) {
  // CD74x4516: Presettable synchronous 4 bit binary up/down counter.
  // Same interface as 4510 but binary (0-15).
  const [cpN, udN, peN, ciN, mrN, p0N, p1N, p2N, p3N] = gate.inputs;
  const [q0, q1, q2, q3, coN] = gate.outputs;
  const state = this._getSeqState(comp, q0, { count: 0, prevClk: 0 });

  const mr = this._readPinBit(comp, mrN);
  if (mr === 1) {
    state.count = 0;
  } else {
    const pe = this._readPinBit(comp, peN);
    if (pe === 1) {
      state.count = this._readPinBit(comp, p0N) | (this._readPinBit(comp, p1N) << 1) |
        (this._readPinBit(comp, p2N) << 2) | (this._readPinBit(comp, p3N) << 3);
    } else {
      const clk = this._readPinBit(comp, cpN);
      const ci = this._readPinBit(comp, ciN);
      if (state.prevClk === 0 && clk === 1 && ci === 1) {
        const ud = this._readPinBit(comp, udN);
        if (ud === 1) state.count = (state.count + 1) & 0xF;
        else state.count = (state.count - 1 + 16) & 0xF;
      }
      state.prevClk = clk;
    }
  }

  const ci = this._readPinBit(comp, ciN);
  const ud = this._readPinBit(comp, udN);
  const terminal = (ud === 1) ? 15 : 0;
  const co = (ci === 1 && state.count === terminal) ? 0 : 1;
  let changed = this._drivePinBits(comp, [q0, q1, q2, q3],
    [state.count & 1, (state.count >> 1) & 1, (state.count >> 2) & 1, (state.count >> 3) & 1]);
  if (this._drivePinBit(comp, coN, co)) changed = true;
  return changed;
}

function _evaluateCounterGatedDecade_fn(comp, gate) {
  // CD74x4518 section: Gated decade counter.
  // inputs: [CP, EN, MR]
  // outputs: [Q0, Q1, Q2, Q3]
  // Advances on rising edge of CP when EN=HIGH, OR rising edge of EN when CP=HIGH.
  // MR=HIGH: async reset.
  const [cpN, enN, mrN] = gate.inputs;
  const [q0, q1, q2, q3] = gate.outputs;
  const state = this._getSeqState(comp, q0, { count: 0, prevCP: 0, prevEN: 0 });

  const mr = this._readPinBit(comp, mrN);
  if (mr === 1) {
    state.count = 0;
    state.prevCP = this._readPinBit(comp, cpN);
    state.prevEN = this._readPinBit(comp, enN);
  } else {
    const cp = this._readPinBit(comp, cpN);
    const en = this._readPinBit(comp, enN);
    const cpRise = (state.prevCP === 0 && cp === 1) && en === 1;
    const enRise = (state.prevEN === 0 && en === 1) && cp === 1;
    if (cpRise || enRise) {
      state.count = (state.count + 1) % 10;
    }
    state.prevCP = cp;
    state.prevEN = en;
  }

  return this._drivePinBits(comp, [q0, q1, q2, q3],
    [state.count & 1, (state.count >> 1) & 1, (state.count >> 2) & 1, (state.count >> 3) & 1]);
}

function _evaluateCounterGatedBin_fn(comp, gate) {
  // CD74x4520 section: Gated 4 bit binary counter.
  // Same as gated decade but counts 0-15.
  const [cpN, enN, mrN] = gate.inputs;
  const [q0, q1, q2, q3] = gate.outputs;
  const state = this._getSeqState(comp, q0, { count: 0, prevCP: 0, prevEN: 0 });

  const mr = this._readPinBit(comp, mrN);
  if (mr === 1) {
    state.count = 0;
    state.prevCP = this._readPinBit(comp, cpN);
    state.prevEN = this._readPinBit(comp, enN);
  } else {
    const cp = this._readPinBit(comp, cpN);
    const en = this._readPinBit(comp, enN);
    const cpRise = (state.prevCP === 0 && cp === 1) && en === 1;
    const enRise = (state.prevEN === 0 && en === 1) && cp === 1;
    if (cpRise || enRise) {
      state.count = (state.count + 1) & 0xF;
    }
    state.prevCP = cp;
    state.prevEN = en;
  }

  return this._drivePinBits(comp, [q0, q1, q2, q3],
    [state.count & 1, (state.count >> 1) & 1, (state.count >> 2) & 1, (state.count >> 3) & 1]);
}

chipEvaluators._evaluateCounterBcdUpdownCd = _evaluateCounterBcdUpdownCd_fn;
chipEvaluators._evaluateBcd7seg4511        = _evaluateBcd7seg4511_fn;
chipEvaluators._evaluateBcd7seg4543        = _evaluateBcd7seg4543_fn;
chipEvaluators._evaluateDec4to16LatchHi    = _evaluateDec4to16LatchHi_fn;
chipEvaluators._evaluateDec4to16LatchLo    = _evaluateDec4to16LatchLo_fn;
chipEvaluators._evaluateCounterBinUpdownCd = _evaluateCounterBinUpdownCd_fn;
chipEvaluators._evaluateCounterGatedDecade = _evaluateCounterGatedDecade_fn;
chipEvaluators._evaluateCounterGatedBin    = _evaluateCounterGatedBin_fn;


// ── NEW GATE TYPE IMPLEMENTATIONS ─────────────────────────────────────────

function _evaluateDFFActHi_fn(comp, gate) {
  // CD4013 D flip-flop with active HIGH set and reset
  const [dN, clkN, setN, rstN] = gate.inputs;
  const [qN, qnN] = gate.outputs;
  const state = this._getSeqState(comp, qN, { q: 0, prevClk: 0 });

  const setVal = this._readPinBit(comp, setN);
  const rstVal = this._readPinBit(comp, rstN);

  if (rstVal === 1) {
    state.q = 0;
  } else if (setVal === 1) {
    state.q = 1;
  } else {
    const clk = this._readPinBit(comp, clkN);
    if (state.prevClk === 0 && clk === 1) {
      state.q = this._readPinBit(comp, dN);
    }
    state.prevClk = clk;
  }

  return this._drivePinBits(comp, [qN, qnN], [state.q, state.q ^ 1]);
}

function _evaluateShiftReg8BitPisoCd_fn(comp, gate) {
  // CD4014 8-stage synchronous PISO shift register
  // inputs: [CLK, PE, DS, P1, P2, P3, P4, P5, P6, P7, P8]
  // outputs: [Q5, Q6, Q7]
  const [clkN, peN, dsN, p1N, p2N, p3N, p4N, p5N, p6N, p7N, p8N] = gate.inputs;
  const [q5N, q6N, q7N] = gate.outputs;
  const state = this._getSeqState(comp, q5N, { reg: 0, prevClk: 0 });

  const clk = this._readPinBit(comp, clkN);
  if (state.prevClk === 0 && clk === 1) {
    const pe = this._readPinBit(comp, peN);
    if (pe === 1) {
      const p1 = this._readPinBit(comp, p1N);
      const p2 = this._readPinBit(comp, p2N);
      const p3 = this._readPinBit(comp, p3N);
      const p4 = this._readPinBit(comp, p4N);
      const p5 = this._readPinBit(comp, p5N);
      const p6 = this._readPinBit(comp, p6N);
      const p7 = this._readPinBit(comp, p7N);
      const p8 = this._readPinBit(comp, p8N);
      state.reg = (p8 << 7) | (p7 << 6) | (p6 << 5) | (p5 << 4) | (p4 << 3) | (p3 << 2) | (p2 << 1) | p1;
    } else {
      const ds = this._readPinBit(comp, dsN);
      state.reg = ((state.reg << 1) | ds) & 0xFF;
    }
  }
  state.prevClk = clk;

  const q5 = (state.reg >> 4) & 1;
  const q6 = (state.reg >> 5) & 1;
  const q7 = (state.reg >> 6) & 1;
  return this._drivePinBits(comp, [q5N, q6N, q7N], [q5, q6, q7]);
}

function _evaluateShiftReg4BitSipo_fn(comp, gate) {
  // CD4015 4-stage SIPO shift register
  // inputs: [D, CLK, RST]
  // outputs: [Q0, Q1, Q2, Q3]
  const [dN, clkN, rstN] = gate.inputs;
  const [q0N, q1N, q2N, q3N] = gate.outputs;
  const state = this._getSeqState(comp, q0N, { reg: 0, prevClk: 0 });

  const rst = this._readPinBit(comp, rstN);
  if (rst === 1) {
    state.reg = 0;
    state.prevClk = this._readPinBit(comp, clkN);
  } else {
    const clk = this._readPinBit(comp, clkN);
    if (state.prevClk === 0 && clk === 1) {
      const d = this._readPinBit(comp, dN);
      state.reg = ((state.reg << 1) | d) & 0xF;
    }
    state.prevClk = clk;
  }

  return this._drivePinBits(comp, [q0N, q1N, q2N, q3N], [
    state.reg & 1,
    (state.reg >> 1) & 1,
    (state.reg >> 2) & 1,
    (state.reg >> 3) & 1,
  ]);
}

function _evaluateBilateralSwitch_fn(comp, gate) {
  // CD4016 bilateral analog switch
  // inputs: [X, EN], output: Y (singular)
  const [xN, enN] = gate.inputs;
  const yN = gate.output;
  const en = this._readPinBit(comp, enN);
  if (en === 1) {
    const x = this._readPinBit(comp, xN);
    return this._drivePinBit(comp, yN, x);
  } else {
    return this._drivePinHighZ(comp, yN);
  }
}

function _evaluateCounterDecadeDecoded_fn(comp, gate) {
  // CD4017 Johnson decade counter with decoded outputs
  // inputs: [CLK, MR, CI]
  // outputs: [Q0, Q1, Q2, Q3, Q4, Q5, Q6, Q7, Q8, Q9, CO]
  const [clkN, mrN, ciN] = gate.inputs;
  const [q0N, q1N, q2N, q3N, q4N, q5N, q6N, q7N, q8N, q9N, coN] = gate.outputs;
  const state = this._getSeqState(comp, q0N, { count: 0, prevClk: 0 });

  const mr = this._readPinBit(comp, mrN);
  if (mr === 1) {
    state.count = 0;
    state.prevClk = this._readPinBit(comp, clkN);
  } else {
    const ci = this._readPinBit(comp, ciN);
    const clk = this._readPinBit(comp, clkN);
    if (ci === 0 && state.prevClk === 0 && clk === 1) {
      state.count = (state.count + 1) % 10;
    }
    state.prevClk = clk;
  }

  const cnt = state.count;
  const outputs = [q0N, q1N, q2N, q3N, q4N, q5N, q6N, q7N, q8N, q9N];
  const vals = outputs.map((_, i) => (i === cnt ? 1 : 0));
  const co = cnt <= 4 ? 1 : 0;
  vals.push(co);

  return this._drivePinBits(comp, [...outputs, coN], vals);
}

function _evaluateCounterBinOsc14_fn(comp, gate) {
  // CD4060 14-stage binary ripple counter
  // inputs: [CLK, MR, CEXT, REXT]
  // outputs: [Q4, Q5, Q6, Q7, Q8, Q9, Q10, Q12, Q13, Q14]
  const [clkN, mrN] = gate.inputs;
  const [q4N, q5N, q6N, q7N, q8N, q9N, q10N, q12N, q13N, q14N] = gate.outputs;
  const state = this._getSeqState(comp, q4N, { count: 0, prevClk: 0 });

  const mr = this._readPinBit(comp, mrN);
  if (mr === 1) {
    state.count = 0;
    state.prevClk = this._readPinBit(comp, clkN);
  } else {
    const clk = this._readPinBit(comp, clkN);
    if (state.prevClk === 1 && clk === 0) {
      state.count = (state.count + 1) & 0x3FFF;
    }
    state.prevClk = clk;
  }

  const cnt = state.count;
  return this._drivePinBits(comp,
    [q4N, q5N, q6N, q7N, q8N, q9N, q10N, q12N, q13N, q14N],
    [
      (cnt >> 3) & 1,
      (cnt >> 4) & 1,
      (cnt >> 5) & 1,
      (cnt >> 6) & 1,
      (cnt >> 7) & 1,
      (cnt >> 8) & 1,
      (cnt >> 9) & 1,
      (cnt >> 11) & 1,
      (cnt >> 12) & 1,
      (cnt >> 13) & 1,
    ]
  );
}

chipEvaluators._evaluateDFFActHi              = _evaluateDFFActHi_fn;
chipEvaluators._evaluateShiftReg8BitPisoCd    = _evaluateShiftReg8BitPisoCd_fn;
chipEvaluators._evaluateShiftReg4BitSipo      = _evaluateShiftReg4BitSipo_fn;
chipEvaluators._evaluateBilateralSwitch       = _evaluateBilateralSwitch_fn;
chipEvaluators._evaluateCounterDecadeDecoded  = _evaluateCounterDecadeDecoded_fn;
chipEvaluators._evaluateCounterBinOsc14       = _evaluateCounterBinOsc14_fn;

// ── Block 61: FET bus switch evaluator (74x6800, 74x6845) ─────────────────

function _evaluateBusSwitchNBit_fn(comp, gate, n) {
  // Passive bidirectional N-channel FET bus switch.
  // gate.inputs:  [OEn, PRE, A1..An, B1..Bn]
  // gate.outputs: [A1..An, B1..Bn]
  // OEn=0 (active LOW): each An-Bn pair is connected bidirectionally.
  //   Modelled by driving An ← Bn and Bn ← An simultaneously; the iterative
  //   MNA solver converges to the correct state when one side is externally driven.
  // OEn=1: all channels Hi-Z (buses isolated).
  // PRE (precharge) has no effect in a steady-state digital model.
  const oen = this._readPinBit(comp, gate.inputs[0]);
  let changed = false;
  if (oen !== 0) {
    for (let i = 0; i < 2 * n; i++) {
      if (this._drivePinHighZ(comp, gate.outputs[i])) changed = true;
    }
  } else {
    for (let i = 0; i < n; i++) {
      const aVal = this._readPinBit(comp, gate.inputs[2 + i]);
      const bVal = this._readPinBit(comp, gate.inputs[2 + n + i]);
      if (this._drivePinBit(comp, gate.outputs[i],     bVal)) changed = true; // A ← B
      if (this._drivePinBit(comp, gate.outputs[n + i], aVal)) changed = true; // B ← A
    }
  }
  return changed;
}

function _evaluateBusSwitch10Bit_fn(comp, gate) {
  return _evaluateBusSwitchNBit_fn.call(this, comp, gate, 10);
}

function _evaluateBusSwitch8Bit_fn(comp, gate) {
  return _evaluateBusSwitchNBit_fn.call(this, comp, gate, 8);
}

chipEvaluators._evaluateBusSwitch10Bit = _evaluateBusSwitch10Bit_fn;
chipEvaluators._evaluateBusSwitch8Bit  = _evaluateBusSwitch8Bit_fn;

// ── Block 65 74x40102 BCD down counter evaluator ────────────────────────

function _evaluateBcdDown2Dec_fn(comp, gate) {
  // CD40102B: Presettable synchronous 2-decade BCD down counter.
  // inputs:  [CLK, PEn, P0, P1, P2, P3, P4, P5, P6, P7, CEn, SPE]
  // outputs: [TC, TCdec]
  // PEn=0 AND rising CLK → load preset into both decades
  // CEn=0 AND SPE=0 → counting enabled
  // TCdec: active LOW, LOW when units decade = 0
  // TC:    active LOW, LOW when both decades = 0
  const [clkN, penN, p0N, p1N, p2N, p3N, p4N, p5N, p6N, p7N, cenN, speN] = gate.inputs;
  const [tcName, tcdecName] = gate.outputs;
  const state = this._getSeqState(comp, tcName + '_bcd2dec',
    { units: 0, tens: 0, prevClk: 0 });

  const clk = this._readPinBit(comp, clkN);
  const pen = this._readPinBit(comp, penN);
  const cen = this._readPinBit(comp, cenN);
  const spe = this._readPinBit(comp, speN);

  if (state.prevClk === 0 && clk === 1) {
    if (pen === 0) {
      // Synchronous preset load
      state.units = this._readPinBit(comp, p0N) | (this._readPinBit(comp, p1N) << 1)
                  | (this._readPinBit(comp, p2N) << 2) | (this._readPinBit(comp, p3N) << 3);
      state.tens  = this._readPinBit(comp, p4N) | (this._readPinBit(comp, p5N) << 1)
                  | (this._readPinBit(comp, p6N) << 2) | (this._readPinBit(comp, p7N) << 3);
      // Clamp to valid BCD (0-9)
      if (state.units > 9) state.units = 9;
      if (state.tens  > 9) state.tens  = 9;
    } else if (cen === 0 && spe === 0) {
      // Synchronous count down
      if (state.units === 0) {
        state.units = 9;
        state.tens = state.tens === 0 ? 9 : state.tens - 1;
      } else {
        state.units -= 1;
      }
    }
  }
  state.prevClk = clk;

  const tcdec = state.units === 0 ? 0 : 1; // active LOW: LOW when units=0
  const tc    = (state.units === 0 && state.tens === 0) ? 0 : 1; // active LOW
  let changed = false;
  if (this._drivePinBit(comp, tcName,    tc))    changed = true;
  if (this._drivePinBit(comp, tcdecName, tcdec)) changed = true;
  return changed;
}

// ── Block 65 74x40103 binary down counter evaluator ─────────────────────

function _evaluateBinDown8Bit_fn(comp, gate) {
  // CD74HC40103: Presettable synchronous 8 bit binary down counter.
  // inputs:  [CLK, PEn, P0, P1, P2, P3, P4, P5, P6, P7, CEn, SPE]
  // outputs: [TC]
  // PEn=0 AND rising CLK → load 8 bit preset
  // CEn=0 AND SPE=0 → counting enabled
  // TC: active LOW, LOW when counter reaches 0
  const [clkN, penN, p0N, p1N, p2N, p3N, p4N, p5N, p6N, p7N, cenN, speN] = gate.inputs;
  const [tcName] = gate.outputs;
  const state = this._getSeqState(comp, tcName + '_bin8dn', { count: 0, prevClk: 0 });

  const clk = this._readPinBit(comp, clkN);
  const pen = this._readPinBit(comp, penN);
  const cen = this._readPinBit(comp, cenN);
  const spe = this._readPinBit(comp, speN);

  if (state.prevClk === 0 && clk === 1) {
    if (pen === 0) {
      // Synchronous preset load
      state.count = this._readPinBit(comp, p0N)        | (this._readPinBit(comp, p1N) << 1)
                  | (this._readPinBit(comp, p2N) << 2)  | (this._readPinBit(comp, p3N) << 3)
                  | (this._readPinBit(comp, p4N) << 4)  | (this._readPinBit(comp, p5N) << 5)
                  | (this._readPinBit(comp, p6N) << 6)  | (this._readPinBit(comp, p7N) << 7);
    } else if (cen === 0 && spe === 0) {
      state.count = state.count === 0 ? 255 : state.count - 1;
    }
  }
  state.prevClk = clk;

  const tc = state.count === 0 ? 0 : 1; // active LOW: LOW when count=0
  return this._drivePinBit(comp, tcName, tc);
}

chipEvaluators._evaluateBcdDown2Dec = _evaluateBcdDown2Dec_fn;
chipEvaluators._evaluateBinDown8Bit = _evaluateBinDown8Bit_fn;

// ── Block 65 74x40105 FIFO evaluator ────────────────────────────────────

function _evaluateFifo16x4RstTri_fn(comp, gate) {
  // CD74HC40105: 16-word × 4 bit asynchronous FIFO with tri-state outputs and reset.
  // inputs:  [D0, D1, D2, D3, WR, RD, RSTn, OEn]
  // outputs: [Q0, Q1, Q2, Q3, FF, EF]
  // WR rising edge → push word (if not full and RSTn=1)
  // RD rising edge → pop word  (if not empty and RSTn=1)
  // RSTn=0 (active LOW) → async reset, clear queue
  // OEn=0  (active LOW) → Q0-Q3 driven; OEn=1 → Q0-Q3 high-Z
  // FF: active LOW full flag  (LOW when full)
  // EF: active LOW empty flag (LOW when empty)
  const [d0,d1,d2,d3, wr, rd, rstn, oen] = this._readGateInputs(comp, gate.inputs);
  const state = this._getSeqState(comp, gate.outputs[0] + '_fifo16x4rst',
    { queue: [], prevWr: 0, prevRd: 0, lastRead: [0,0,0,0] });

  if (rstn === 0) {
    state.queue = [];
    state.lastRead = [0,0,0,0];
    state.prevWr = wr;
    state.prevRd = rd;
  } else {
    if (state.prevWr === 0 && wr === 1 && state.queue.length < 16)
      state.queue.push([d0,d1,d2,d3]);
    state.prevWr = wr;
    if (state.prevRd === 0 && rd === 1 && state.queue.length > 0)
      state.lastRead = state.queue.shift();
    else if (state.queue.length > 0)
      state.lastRead = [...state.queue[0]];
    state.prevRd = rd;
  }

  const ff = state.queue.length >= 16 ? 0 : 1;
  const ef = state.queue.length === 0  ? 0 : 1;
  let changed = false;
  if (oen !== 0) {
    for (let i = 0; i < 4; i++) { if (this._drivePinHighZ(comp, gate.outputs[i])) changed = true; }
  } else {
    for (let i = 0; i < 4; i++) { if (this._drivePinBit(comp, gate.outputs[i], state.lastRead[i])) changed = true; }
  }
  if (this._drivePinBit(comp, gate.outputs[4], ff)) changed = true;
  if (this._drivePinBit(comp, gate.outputs[5], ef)) changed = true;
  return changed;
}

chipEvaluators._evaluateFifo16x4RstTri = _evaluateFifo16x4RstTri_fn;

export { chipEvaluators };
