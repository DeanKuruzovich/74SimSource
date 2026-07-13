// ── specificChipsSim.js ──────────────────────────────────────────────────────
// All chip-specific simulation logic, extracted from simulator.js.
// `chipEvaluators` is Object.assigned onto CircuitSimulator.prototype by
// simulator.js after the class definition, so all methods work as normal
// instance methods with `this` referring to the CircuitSimulator instance.

import { COMP, DRIVE } from './constants.js';
import { BCD_7SEG_CC_TABLE, BCD_7SEG_CC_7448_TABLE, BCD_7SEG_TABLE, BCD_7SEG_7447_TABLE } from './chips.js';

const VCC_VOLTAGE = 5; // matches simulator.js needed by 555 timer internal threshold

const chipEvaluators = {};

// ── Class-method evaluators ──────────────────────────────────────────────────
// Originally lived inside the CircuitSimulator class body.  Wrapping them
// in a shadow class lets us copy them to chipEvaluators without any syntax
// transformation class method shorthand is identical to object method
// shorthand and they close over the same module scope (BCD tables, etc.).
class _ChipEvalMixin {
  _evaluateChip(comp) {
    // Chip requires BOTH VCC and GND connections to function.
    // Chips flagged noVccPin (ULN2003, LM7805) have no VCC pin at all and
    // only need GND.
    let hasVCC = false, hasGND = false;
    for (const pin of comp.pins) {
      if (pin.type !== 'power') continue;
      const net = this.netlist.findNetByHole(pin.holeId);
      if (!net) continue;
      if (net.isVCC) hasVCC = true;
      if (net.isGND) hasGND = true;
    }
    if (!hasGND || (!hasVCC && !comp.chipDef.noVccPin)) return false;

    let changed = false;

    for (const gate of comp.chipDef.gates) {
      switch (gate.type) {
        case 'D_FF':
          if (this._evaluateDFF(comp, gate)) changed = true;
          continue;
        case 'D_FF_NEG':
          if (this._evaluateDFFNeg(comp, gate)) changed = true;
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
        case 'JK_FF_CMOS':
          if (this._evaluateJKFFCMOS(comp, gate)) changed = true;
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
        case 'BCD_7SEG_7447':
          if (this._evaluateBCD7Seg7447(comp, gate)) changed = true;
          continue;
        case 'BCD_7SEG_CC':
          if (this._evaluateBCD7SegCC(comp, gate)) changed = true;
          continue;
        case 'BCD_7SEG_CC_7448':
          if (this._evaluateBCD7SegCC7448(comp, gate)) changed = true;
          continue;
        case 'SEG7_TO_BCD_915':
          if (this._evaluateSeg7ToBcd915(comp, gate)) changed = true;
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
        case 'SHIFT_REG_18BIT_4006':
          if (this._evaluateShiftReg18Bit4006(comp, gate)) changed = true;
          continue;
        case 'SHIFT_REG_64BIT_4031':
          if (this._evaluateShiftReg64Bit4031(comp, gate)) changed = true;
          continue;
        case 'SHIFT_REG_4BIT':
          if (this._evaluateShiftReg4Bit(comp, gate)) changed = true;
          continue;
        case 'SHIFT_REG_4BIT_PIPO_4035':
          if (this._evaluateShiftReg4BitPipo4035(comp, gate)) changed = true;
          continue;
        case 'MONOSTABLE':
          if (this._evaluateMonostable(comp, gate)) changed = true;
          continue;
        case 'MONOSTABLE_RC':
          if (this._evaluateMonostableRC(comp, gate)) changed = true;
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
        case 'SHIFT_REG_DUAL4_SIPO_4015':
          if (this._evaluateShiftRegDual4Sipo4015(comp, gate)) changed = true;
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
        case 'COUNTER_UPDOWN_4029':
          if (this._evaluateCounterUpDown4029(comp, gate)) changed = true;
          continue;
        case 'COUNTER_UPDOWN_TRI_779':
          if (this._evaluateCounterUpDownTri779(comp, gate)) changed = true;
          continue;
        case 'COUNTER_PROG_MODN_4018':
          if (this._evaluateCounterProgModN4018(comp, gate)) changed = true;
          continue;
        case 'TRI_NOT_LO':
          if (this._evaluateTriNotLo(comp, gate)) changed = true;
          continue;
        case 'TRANSCEIVER_8BIT':
          if (this._evaluateTransceiver8Bit(comp, gate)) changed = true;
          continue;
        case 'BUS_XCVR_10BIT_DUAL_TRI':
          if (this._evaluateBusXcvr10BitDualTri(comp, gate)) changed = true;
          continue;
        case 'BUS_XCVR_9BIT_QUAD_OE':
          if (this._evaluateBusXcvr9BitQuadOe(comp, gate)) changed = true;
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
        case 'MUX_3BUS_TRI':
          if (this._evaluateMux3BusTri(comp, gate)) changed = true;
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
        case 'READBACK_LATCH':
          if (this._evaluateReadBackLatch(comp, gate)) changed = true;
          continue;
        case 'D_FF_OCTAL_TRI':
          if (this._evaluateDFFOctalTri(comp, gate)) changed = true;
          continue;
        case 'D_FF_REG_TRI':
          if (this._evaluateDFFRegTri(comp, gate)) changed = true;
          continue;
        case 'D_FF_REG_TRI_CLR_EN':
          if (this._evaluateDFFRegTriClrEn(comp, gate)) changed = true;
          continue;
        case 'D_FF_REG_TRI_SET_INV':
          if (this._evaluateDFFRegTriSetInv(comp, gate)) changed = true;
          continue;
        case 'D_FF_REG_SYNC_CLR_TRI':
          if (this._evaluateDFFRegSyncClrTri(comp, gate)) changed = true;
          continue;
        case 'D_FF_REG_TRI_CLR':
          if (this._evaluateDFFRegTriClr(comp, gate)) changed = true;
          continue;
        case 'D_LATCH_REG_TRI':
          if (this._evaluateDLatchRegTri(comp, gate)) changed = true;
          continue;
        case 'LATCH_READBACK_TRI':
          if (this._evaluateLatchReadbackTri(comp, gate)) changed = true;
          continue;
        case 'LATCH_READBACK_BIDIR_TRI':
          if (this._evaluateLatchReadbackBidirTri(comp, gate)) changed = true;
          continue;
        case 'REG_READBACK_996':
          if (this._evaluateRegReadback996(comp, gate)) changed = true;
          continue;
        case 'DIAG_SCAN_REG_818':
          if (this._evaluateDiagScanReg818(comp, gate)) changed = true;
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
        case 'BCD_DECIMAL_HI':
          if (this._evaluateBCDDecimalHi(comp, gate)) changed = true;
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
        case 'COUNTER_JOHNSON_4018':
          if (this._evaluateCounterJohnson4018(comp, gate)) changed = true;
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
        case 'SR_LATCH_QUAD_TRI':
          if (this._evaluateSRLatchQuadTri(comp, gate)) changed = true;
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
        case 'PRIORITY_ENC_8TO3_HI':
          if (this._evaluatePriorityEnc8to3Hi(comp, gate)) changed = true;
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
        case 'COUNTER_7SEG_4026':
          if (this._evaluateCounter7Seg4026(comp, gate)) changed = true;
          continue;
        case 'COUNTER_7SEG_RB':
          if (this._evaluateCounter7SegRb(comp, gate)) changed = true;
          continue;
        case 'COUNTER_7SEG_40110':
          if (this._evaluateCounter7Seg40110(comp, gate)) changed = true;
          continue;
        case 'COUNTER_DISP_MUX_925':
          if (this._evaluateCounterDispMux925(comp, gate)) changed = true;
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
        case 'RATE_MULT_BCD_4527':
          if (this._evaluateRateMultBcd4527(comp, gate)) changed = true;
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
        case 'REG_FILE_DUAL16X4_TRI':
          if (this._evaluateRegFileDual16x4Tri(comp, gate)) changed = true;
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
        case 'CARRY_LOOKAHEAD_32':
          if (this._evaluateCarryLookahead32(comp, gate)) changed = true;
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
        case 'SHIFT_REG_8BIT_BUS_4034':
          if (this._evaluateShiftReg8BitBus4034(comp, gate)) changed = true;
          continue;
        case 'SHIFT_REG_8BIT_DUALRANK_952':
          if (this._evaluateShiftReg8BitDualRank952(comp, gate)) changed = true;
          continue;
        case 'SHIFT_REG_8BIT_DUALRANK_964':
          if (this._evaluateShiftReg8BitDualRank964(comp, gate)) changed = true;
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
        case 'LATCH_4BIT_TRI_RST':
          if (this._evaluateLatch4BitTriRst(comp, gate)) changed = true;
          continue;
        case 'LATCH_4BIT_TRI_873':
          if (this._evaluateLatch4BitTri873(comp, gate)) changed = true;
          continue;
        case 'LATCH_4BIT_TRI_INV_880':
          if (this._evaluateLatch4BitTriInv880(comp, gate)) changed = true;
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
        case 'MUX_8TO1_TRI_INH':
          if (this._evaluateMux8to1TriInh(comp, gate)) changed = true;
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
        case 'MULT_2X2_4554':
          if (this._evaluateMult2x2_4554(comp, gate)) changed = true;
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
        case 'PARITY_9BIT_INH':
          if (this._evaluateParity9BitInh(comp, gate)) changed = true;
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
        case 'FREQ_DIV_PROG_4059':
          if (this._evaluateFreqDivProg4059(comp, gate)) changed = true;
          continue;
        case 'FREQ_DIV_PROG_4536':
          if (this._evaluateFreqDivProg4536(comp, gate)) changed = true;
          continue;
        case 'COUNTER_4BIT_DIV':
          if (this._evaluateCounter4BitDiv(comp, gate)) changed = true;
          continue;
        case 'SHIFT_REG_4BIT_BIDIR_TRI':
          if (this._evaluateShiftReg4BitBidirTri(comp, gate)) changed = true;
          continue;
        case 'SHIFT_REG_4BIT_UNIV_TRI':
          if (this._evaluateShiftReg4BitUnivTri(comp, gate)) changed = true;
          continue;
        case 'MUX_QUAD_2TO1_STORED':
          if (this._evaluateMuxQuad2to1Stored(comp, gate)) changed = true;
          continue;
        case 'SHIFT_REG_8BIT_UNIV_TRI':
          if (this._evaluateShiftReg8BitUnivTri(comp, gate)) changed = true;
          continue;
        case 'RAM_256X1_OC_N':
          if (this._evaluateRam256x1OCN(comp, gate)) changed = true;
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
        case 'SHIFT_REG_8BIT_UNIV_CLR_TRI':
          if (this._evaluateShiftReg8BitUnivClrTri(comp, gate)) changed = true;
          continue;
        case 'VCO_STUB':
          if (this._evaluateVco124(comp, gate)) changed = true;
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
        case 'D_LATCH_QUAD_4042':
          if (this._evaluateDLatchQuad4042(comp, gate)) changed = true;
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
        case 'D_FF_9BIT_CLR_CE_TRI':
          if (this._evaluateDFf9BitClrCeTri(comp, gate)) changed = true;
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
        case 'SERIAL_ADDER_TRIPLE_4032':
          if (this._evaluateSerialAdderTriple4032(comp, gate)) changed = true;
          continue;
        case 'SERIAL_ADDER_TRIPLE_4038':
          if (this._evaluateSerialAdderTriple4038(comp, gate)) changed = true;
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
        case 'COUNTER_8BIT_SYNC_867':
          if (this._evaluateCounter8BitSync867(comp, gate)) changed = true;
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
        case 'LATCH_OCTAL_TRI':
          if (this._evaluateLatchOctalTri(comp, gate)) changed = true;
          continue;
        case 'REG_OCTAL_TRI':
          if (this._evaluateRegOctalTri(comp, gate)) changed = true;
          continue;
        case 'LATCH_OCTAL_INV_TRI':
          if (this._evaluateLatchOctalInvTri(comp, gate)) changed = true;
          continue;
        case 'LATCH_READBACK_INV':
          if (this._evaluateLatchReadbackInv(comp, gate)) changed = true;
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
        case 'TRANSCEIVER_OCTAL_LATCH_SEL':
          if (this._evaluateTransceiverOctalLatchSel(comp, gate)) changed = true;
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
        case 'BUS_FF_9BIT_TRI':
          if (this._evaluateBusFf9BitTri(comp, gate)) changed = true;
          continue;
        case 'BUS_FF_10BIT_TRI':
          if (this._evaluateBusFf10BitTri(comp, gate)) changed = true;
          continue;
        case 'BUS_FF_8BIT_3OE_TRI':
          if (this._evaluateBusFf8Bit3OeTri(comp, gate)) changed = true;
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
        case 'LATCH_TRANS_TRI':
          if (this._evaluateLatchTransTri(comp, gate)) changed = true;
          continue;
        case 'LATCH_8BIT_TRI':
          if (this._evaluateLatch8BitTri(comp, gate)) changed = true;
          continue;
        case 'LATCH_8BIT_INV_TRI':
          if (this._evaluateLatch8BitInvTri(comp, gate)) changed = true;
          continue;
        case 'LATCH_10BIT_READBACK_INV':
          if (this._evaluateLatch10BitReadbackInv(comp, gate)) changed = true;
          continue;
        case 'LATCH_9BIT_PRE_CLR_TRI':
          if (this._evaluateLatch9BitPreClrTri(comp, gate)) changed = true;
          continue;
        case 'LATCH_8BIT_PRE_CLR_OC3_TRI':
          if (this._evaluateLatch8BitPreClrOc3Tri(comp, gate)) changed = true;
          continue;
        case 'LATCH_9BIT_READBACK_TRI':
          if (this._evaluateLatch9BitReadbackTri(comp, gate)) changed = true;
          continue;
        case 'SHIFT_REG_16BIT_STUB':
          if (this._evaluateShiftReg16BitStub(comp, gate)) changed = true;
          continue;
        case 'ADDR_COMP_16BIT_STUB':
          if (this._evaluateAddrComp16BitStub(comp, gate)) changed = true;
          continue;
        // ── Block 36 ──────────────────────────────────────────────────────────
        case 'ACC_4BIT_681':
          if (this._evaluateAcc4Bit681(comp, gate)) changed = true;
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
        case 'COMPARATOR_8BIT_CASCADE':
          if (this._evaluateComparator8BitCascade(comp, gate)) changed = true;
          continue;
        case 'COMPARATOR_8BIT_LATCH':
          if (this._evaluateComparator8BitLatch(comp, gate)) changed = true;
          continue;
        case 'PARITY_BUFFER':
          if (this._evaluateParityBuffer(comp, gate)) changed = true;
          continue;
        case 'PARITY_BUFFER_INV':
          if (this._evaluateParityBufferInv(comp, gate)) changed = true;
          continue;
        case 'XCVR_PARITY_LATCH_INV':
          if (this._evaluateXcvrParityLatch854(comp, gate)) changed = true;
          continue;
        case 'XCVR_PARITY_REG':
          if (this._evaluateXcvrParityReg833(comp, gate)) changed = true;
          continue;
        case 'XCVR_PARITY_REG_INV':
          if (this._evaluateXcvrParityReg834(comp, gate)) changed = true;
          continue;
        case 'XCVR_PARITY_LATCH':
          if (this._evaluateXcvrParityLatch853(comp, gate)) changed = true;
          continue;
        case 'PARITY_XCVR':
          if (this._evaluateParityXcvr(comp, gate)) changed = true;
          continue;
        case 'XCVR_PARITY':
          if (this._evaluateXcvrParity(comp, gate)) changed = true;
          continue;
        case 'XCVR_PARITY_INV':
          if (this._evaluateXcvrParityInv(comp, gate)) changed = true;
          continue;
        case 'ADDR_COMP_CASCADE':
          if (this._evaluateAddrCompCascade(comp, gate)) changed = true;
          continue;
        case 'ADDR_COMP_LATCH':
          if (this._evaluateAddrCompLatch(comp, gate)) changed = true;
          continue;
        case 'ADDR_COMP_FIXED':
          if (this._evaluateAddrCompFixed(comp, gate)) changed = true;
          continue;
        case 'ECC_SECDED':
          if (this._evaluateEccSecded(comp, gate)) changed = true;
          continue;
        case 'COUNTER_LATCH_MUX_STUB':
          if (this._evaluateCounterLatchMuxStub(comp, gate)) changed = true;
          continue;
        case 'COUNTER_REG_MUX_TRI':
          if (this._evaluateCounterRegMuxTri(comp, gate)) changed = true;
          continue;
        case 'COUNTER_UPDOWN_REG_MUX_TRI':
          if (this._evaluateCounterUpdownRegMuxTri(comp, gate)) changed = true;
          continue;
        case 'DUAL_CTR16_REG_TRI':
          if (this._evaluateDualCtr16RegTri(comp, gate)) changed = true;
          continue;
        case 'BUS_XCVR_9BIT_DUAL_OE':
          if (this._evaluateBusXcvr9BitDualOE(comp, gate)) changed = true;
          continue;
        // ── Block 37 ──────────────────────────────────────────────────────────
        case 'JTAG_ASP':
          if (this._evaluateJtagAsp(comp, gate)) changed = true;
          continue;
        case 'COUNTER_PROG_RIPPLE_OSC':
          if (this._evaluateCounterProgRippleOsc(comp, gate)) changed = true;
          continue;
        case 'KEY_ENCODER_SCAN':
          if (this._evaluateKeyEncoderScan(comp, gate)) changed = true;
          continue;
        case 'DUAL_RANK_SHIFT_962':
          if (this._evaluateDualRankShift962(comp, gate)) changed = true;
          continue;
        case 'GENERIC_STUB':
          if (this._evaluateGenericStub(comp, gate)) changed = true;
          continue;
        case 'SHIFT_REG_DUAL_RANK_963':
          if (this._evaluateShiftRegDualRank963(comp, gate)) changed = true;
          continue;
        // ── Block 67 555/556/558 Timers ────────────────────────────────────
        case 'TIMER_555':
          if (this._evaluateTimer555(comp, gate)) changed = true;
          continue;
        case 'TIMER_558_SECTION':
          if (this._evaluateTimer558Section(comp, gate)) changed = true;
          continue;
        // ── Block 71 — analog companions, 2764 EPROM, crystal oscillator ──
        case 'COMPARATOR_OC':
          if (this._evaluateComparatorOC(comp, gate)) changed = true;
          continue;
        case 'OPAMP':
          if (this._evaluateOpamp(comp, gate)) changed = true;
          continue;
        case 'DARLINGTON_OC':
          if (this._evaluateDarlingtonOC(comp, gate)) changed = true;
          continue;
        case 'VREG_5V':
          if (this._evaluateVreg5V(comp, gate)) changed = true;
          continue;
        case 'EPROM_8KX8':
          if (this._evaluateEprom8kx8(comp, gate)) changed = true;
          continue;
        case 'XTAL_OSC':
          if (this._evaluateXtalOsc(comp, gate)) changed = true;
          continue;
        case 'MUX_QUINT_2TO1':
          if (this._evaluateMuxQuint2to1(comp, gate)) changed = true;
          continue;
        case 'MUX_QUINT_3TO1':
          if (this._evaluateMuxQuint3to1(comp, gate)) changed = true;
          continue;
        case 'MUX_HEX_UNIVERSAL':
          if (this._evaluateMuxHexUniversal(comp, gate)) changed = true;
          continue;
        case 'MUX_3IN_4BIT_DC_OE':
          if (this._evaluateMux3in4bitDcOe(comp, gate)) changed = true;
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
        case 'BCD_DIVN_DOWN_4522':
          if (this._evaluateBcdDivNDown4522(comp, gate)) changed = true;
          continue;
        case 'BCD_7SEG_4511':
          if (this._evaluateBcd7seg4511(comp, gate)) changed = true;
          continue;
        case 'BCD_7SEG_4543':
          if (this._evaluateBcd7seg4543(comp, gate)) changed = true;
          continue;
        case 'BCD_7SEG_4543_HC':
          if (this._evaluateBcd7seg4543hc(comp, gate)) changed = true;
          continue;
        case 'BCD_7SEG_4055':
          if (this._evaluateBcd7seg4055(comp, gate)) changed = true;
          continue;
        case 'BCD_7SEG_4056':
          if (this._evaluateBcd7seg4056(comp, gate)) changed = true;
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
        case 'SERIAL_PARALLEL_MULT_784':
          if (this._evaluateSerialParallelMult784(comp, gate)) changed = true;
          continue;
        case 'SHIFT_REG_8BIT_PISO_CD4021':
          if (this._evaluateShiftReg8BitPisoCd4021(comp, gate)) changed = true;
          continue;
        case 'SHIFT_REG_MUX_LATCH_835':
          if (this._evaluateShiftRegMuxLatch835(comp, gate)) changed = true;
          continue;
        case 'SHIFT_REG_4BIT_SIPO':
          if (this._evaluateShiftReg4BitSipo(comp, gate)) changed = true;
          continue;
        case 'BILATERAL_SWITCH':
          if (this._evaluateBilateralSwitch(comp, gate)) changed = true;
          continue;
        case 'ANALOG_MUX_8':
          if (this._evaluateAnalogMux8(comp, gate)) changed = true;
          continue;
        case 'ANALOG_MUX_16':
          if (this._evaluateAnalogMux16(comp, gate)) changed = true;
          continue;
        case 'ANALOG_MUX_DUAL4':
          if (this._evaluateAnalogMuxDual4(comp, gate)) changed = true;
          continue;
        case 'ANALOG_MUX_DUAL4_4852':
          if (this._evaluateAnalogMuxDual4_4852(comp, gate)) changed = true;
          continue;
        case 'ANALOG_MUX_DUAL8':
          if (this._evaluateAnalogMuxDual8(comp, gate)) changed = true;
          continue;
        case 'ANALOG_MUX_TRIPLE2':
          if (this._evaluateAnalogMuxTriple2(comp, gate)) changed = true;
          continue;
        case 'ANALOG_MUX_8_LATCH':
          if (this._evaluateAnalogMux8Latch(comp, gate)) changed = true;
          continue;
        case 'ANALOG_MUX_DUAL4_LATCH':
          if (this._evaluateAnalogMuxDual4Latch(comp, gate)) changed = true;
          continue;
        case 'ANALOG_MUX_TRIPLE2_LATCH':
          if (this._evaluateAnalogMuxTriple2Latch(comp, gate)) changed = true;
          continue;
        case 'COUNTER_DECADE_DECODED':
          if (this._evaluateCounterDecadeDecoded(comp, gate)) changed = true;
          continue;
        case 'COUNTER_OCTAL_DECODED':
          if (this._evaluateCounterOctalDecoded(comp, gate)) changed = true;
          continue;
        case 'COUNTER_BIN_OSC_14':
          if (this._evaluateCounterBinOsc14(comp, gate)) changed = true;
          continue;
        case 'COUNTER_BIN_OSC_14_CLKO':
          if (this._evaluateCounterBinOsc14Clko(comp, gate)) changed = true;
          continue;
        case 'COUNTER_DISPLAY_4DIGIT_928':
          if (this._evaluateCounterDisplay4Digit928(comp, gate)) changed = true;
          continue;
        case 'COUNTER_DISPLAY_4DIGIT_926':
          if (this._evaluateCounterDisplay4Digit926(comp, gate)) changed = true;
          continue;
        case 'COUNTER_DISPLAY_4DIGIT_927':
          if (this._evaluateCounterDisplay4Digit927(comp, gate)) changed = true;
          continue;
        case 'COUNTER_BIN_RIPPLE':
          if (this._evaluateCounterBinRipple(comp, gate)) changed = true;
          continue;
        case 'COUNTER_BCD_DUAL_4518':
          if (this._evaluateCounterBcdDual4518(comp, gate)) changed = true;
          continue;
        // ── Block 65 ─────────────────────────────────────────────────────────
        case 'BCD_DOWN_2DEC':
          if (this._evaluateBcdDown2Dec(comp, gate)) changed = true;
          continue;
        // ── Block 129 (CD40102) ───────────────────────────────────────────────
        case 'BCD_DOWN_2DEC_CD40102':
          if (this._evaluateBcdDown2DecCd40102(comp, gate)) changed = true;
          continue;
        case 'BIN_DOWN_8BIT':
          if (this._evaluateBinDown8Bit(comp, gate)) changed = true;
          continue;
        case 'FIFO_16X4_RST_TRI':
          if (this._evaluateFifo16x4RstTri(comp, gate)) changed = true;
          continue;
        // ── Block 70 ─────────────────────────────────────────────────────────
        case 'EEPROM_2KX8':
          if (this._evaluateEeprom2kx8(comp, gate)) changed = true;
          continue;
        // ── Block 104 ────────────────────────────────────────────────────────
        case 'AO_BIPHASE_PAIR':
          if (this._evaluateAoBiphasePair(comp, gate)) changed = true;
          continue;
      }

      // Read input pin voltages → digital values.
      // Schmitt-input chips (chipDef.schmittInputs) use hysteretic reading
      // with VT+/VT- thresholds and per-input latched state.
      const inputBits = (comp.chipDef && comp.chipDef.schmittInputs)
        ? gate.inputs.map(pin => this._readSchmittBit(comp, pin))
        : this._readGateInputs(comp, gate.inputs);

      // Compute gate output
      let outputBit;
      switch (gate.type) {
        case 'XORSEL':   { const [a,b,c] = inputBits; const xorVal = a ^ b; outputBit = c ? (xorVal ? 0 : 1) : xorVal; break; }
        case 'MUX_2TO1_INV': { const [a,b,sel,g] = inputBits; outputBit = g === 1 ? 0 : ((sel ? b : a) ? 0 : 1); break; }
        case 'NAND12_3ST': { const oe = inputBits[inputBits.length - 1]; if (oe !== 0) { if (this._drivePinHighZ(comp, gate.output)) changed = true; continue; } outputBit = inputBits.slice(0, -1).every(b => b) ? 0 : 1; break; }
        case 'AND':  outputBit = inputBits.every(b => b) ? 1 : 0; break;
        case 'OR':   outputBit = inputBits.some(b => b)  ? 1 : 0; break;
        case 'NAND': outputBit = inputBits.every(b => b) ? 0 : 1; break;
        case 'NOR':  outputBit = inputBits.some(b => b)  ? 0 : 1; break;
        case 'NOT':  outputBit = inputBits[0] ? 0 : 1; break;
        case 'XOR':    outputBit = inputBits.reduce((a, b) => a ^ b, 0); break;
        case 'XNOR':   outputBit = inputBits.reduce((a, b) => a ^ b, 0) ? 0 : 1; break;
        case 'BUFFER': outputBit = inputBits[0] ? 1 : 0; break;
        // AOI_2WIDE: NOT((A&B)|(C&D)). Optional 5th input is an active-HIGH INHIBIT
        // that ORs into the sum before inversion (E = NOT(INH + A·B + C·D)) — used
        // by the CD4085 (two 2-in ANDs driving a 3-in NOR). Parts with only 4 inputs
        // (74x50/74x51) leave inputBits[4] undefined, which coerces to 0 in the
        // bitwise OR, so their behavior is unchanged.
        case 'AOI_2WIDE': outputBit = ((inputBits[0] & inputBits[1]) | (inputBits[2] & inputBits[3]) | (inputBits[4] | 0)) ? 0 : 1; break;
        // AOI_4WIDE: NOT((A·B)+(C·D)+(E·F)+(G·H)). Optional 9th/10th inputs model
        // the CD4086's expand controls: inputBits[8] = INHIBIT/EXP (active-HIGH,
        // ORs straight into the NOR — an active AND-gate fed here OR-expands the
        // gate); inputBits[9] = ENABLE/EXP (active-HIGH enable — a LOW forces the
        // output LOW, which is how a preceding stage's output AND-expands the gate:
        // J = ENABLE · NOT(INH + ΣpairANDs)). Parts with only 8 inputs (a plain
        // 4-wide AOI like the 74x54) leave both undefined → no inhibit, enabled.
        case 'AOI_4WIDE': {
          const inh4 = inputBits[8] | 0;
          const endis4 = (inputBits[9] === undefined) ? 0 : (inputBits[9] ? 0 : 1);
          outputBit = ((inputBits[0] & inputBits[1]) | (inputBits[2] & inputBits[3]) | (inputBits[4] & inputBits[5]) | (inputBits[6] & inputBits[7]) | inh4 | endis4) ? 0 : 1;
          break;
        }
        // NOR_STROBE: last input is strobe G. Per the TI SN7423/SN7425 datasheet
        // (SDLS082) the function is Y = NOT(G AND (A+B+C+D)): strobe HIGH enables
        // normal NOR operation; strobe LOW forces the output HIGH. A floating
        // strobe reads HIGH through the TTL pull-up, so an unwired strobe gives
        // plain NOR behavior — matching the real part on a breadboard.
        case 'NOR_STROBE': {
          const g = inputBits[inputBits.length - 1];
          outputBit = g ? (inputBits.slice(0, -1).some(b => b) ? 0 : 1) : 1;
          break;
        }
        // AND OR and AND OR-INVERT gate types for complex 74xx chips
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

      // For open collector chips, use OC drive (HIGH → HiZ, LOW → sink to GND)
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

  // Negative (falling) edge triggered D flip flop with active-LOW async preset
  // and clear. Identical to _evaluateDFF except D is captured on the HIGH→LOW
  // clock transition. Used by the 74x1074 (dual negative-edge dual D FF).
  _evaluateDFFNeg(comp, gate) {
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
    } else if (clkBit === 0 && state.prevClk === 1) {
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
      // Default false → active-LOW preset/clear (unchanged for existing JK_FF
      // users). The CD4095/CD4096 gated J-K FFs set this true: their SET/RESET
      // pins are active HIGH (see chips114.js).
      preClrActiveHigh: gate.preClrActiveHigh || false,
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
      // Optional per-gate clock edge. Absent (undefined) → _evaluateJKGate's
      // 'rising' default, so every existing JK_FF_SIMPLE user is unchanged.
      // Negative-edge parts (e.g. 74x107) set triggerEdge:'falling' on their
      // gate to update Q on the HIGH→LOW transition (issues.md C113).
      triggerEdge: gate.triggerEdge,
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

  _evaluateJKFFCMOS(comp, gate) {
    const [jName, kName, clkName, sName, rName] = gate.inputs;
    return this._evaluateJKGate(comp, {
      jPins: [jName],
      kPins: [kName],
      clkPin: clkName,
      prePin: sName,
      clrPin: rName,
      outputs: gate.outputs,
      preClrActiveHigh: true,
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
    // '46A/'47A/'246/'247 shared glyph font (6 and 9 drawn "with tails").
    return this._evaluateBCD7SegTable(comp, gate, BCD_7SEG_TABLE);
  }

  _evaluateBCD7Seg7447(comp, gate) {
    // 7446/7447 glyph font (tail-less 6 and 9, per TI SDLS111 T1), active LOW /
    // common anode. Same control-pin behavior as above; only the digit patterns
    // for 6 and 9 differ. See issues.md C108/C115.
    return this._evaluateBCD7SegTable(comp, gate, BCD_7SEG_7447_TABLE);
  }

  // Shared common-anode (active-LOW) BCD-to-7-seg evaluator. `table` selects the
  // glyph font. Segment ON = output LOW; lamp test (LT# LOW) wins, then blanking
  // (BI#/RBO# or BI# LOW, or RBI# LOW on a decimal zero), then decode. Outputs
  // sink open-collector when the chip def sets openCollector, else push-pull.
  _evaluateBCD7SegTable(comp, gate, table) {
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
      const row = table.find(r => {
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
    // '247/'248 glyph font (6 and 9 drawn "with tails").
    return this._evaluateBCD7SegCCTable(comp, gate, BCD_7SEG_CC_TABLE);
  }

  _evaluateBCD7SegCC7448(comp, gate) {
    // 7446/7447/7448 glyph font (tail-less 6 and 9, per TI SDLS111). Same
    // control-pin behavior as above, only the digit patterns differ.
    return this._evaluateBCD7SegCCTable(comp, gate, BCD_7SEG_CC_7448_TABLE);
  }

  // Shared common-cathode (active-HIGH) BCD-to-7-seg evaluator. `table` selects
  // the glyph font. Control pins are read directly off the component by name:
  // LT/LAMP_TEST (all segments on), BI or BI/RBO (all segments off), and RBI
  // (blank on a decimal zero). Lamp test wins, then blanking, then decode.
  _evaluateBCD7SegCCTable(comp, gate, table) {
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
      const row = table.find(r => {
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

  // MM74C915 7-segment-to-BCD converter: the inverse of a 7-seg decoder.
  // Reads the seven segment lines a..g of a display and works out which BCD
  // digit (if any) they spell. See the 74x915 entry in chips44.js for the
  // datasheet citation and the full segment/function table this encodes.
  // inputs:  [a, b, c, d, e, f, g, INV, LE, OE]   (OE active LOW)
  // outputs: [A, B, C, D, ERROR, MINUS]           (A=2^0 .. D=2^3)
  _evaluateSeg7ToBcd915(comp, gate) {
    const [aN, bN, cN, dN, eN, fN, gN, invN, leN, oeN] = gate.inputs;
    const [aOut, bOut, cOut, dOut, errOut, minusOut] = gate.outputs;

    // INVERT/NON-INVERT control: 0 = active-HIGH segments (input HIGH = lit),
    // 1 = active-LOW segments (input LOW = lit). Normalise to "lit" bits.
    const inv = this._readPinBit(comp, invN);
    const raw = [aN, bN, cN, dN, eN, fN, gN].map(n => this._readPinBit(comp, n));
    const seg = raw.map(v => (inv === 1 ? (v === 0 ? 1 : 0) : v));
    const key = seg.join('');

    // Valid character patterns, segment order [a,b,c,d,e,f,g]. Standard digit
    // shapes plus the two accepted forms each for 1, 6 and 9 shown as paired
    // glyphs in the datasheet truth table.
    const DIGITS = {
      '1111110': 0,
      '0110000': 1, '0000110': 1,            // 1: right (b,c) or left (e,f)
      '1101101': 2,
      '1111001': 3,
      '0110011': 4,
      '1011011': 5,
      '1011111': 6, '0011111': 6,            // 6: with top bar a, or without
      '1110000': 7,
      '1111111': 8,
      '1111011': 9, '1110011': 9,            // 9: with bottom d, or without
    };

    // Resolve current input to {bcd:0-15 or null for Hi-Z, error, minus}.
    let resolved;
    if (key === '0000000') {
      resolved = { bcd: 0b1111, error: 0, minus: 0 };   // blank display -> 1111
    } else if (key === '0000001') {
      resolved = { bcd: null, error: 1, minus: 1 };       // minus sign (g only)
    } else if (Object.prototype.hasOwnProperty.call(DIGITS, key)) {
      resolved = { bcd: DIGITS[key], error: 0, minus: 0 };
    } else {
      resolved = { bcd: null, error: 1, minus: 0 };       // non-standard code
    }

    // Latch Enable: LE=0 flow-through (transparent), LE=1 holds last value.
    const state = this._getSeqState(comp, aOut, { bcd: null, error: 0, minus: 0 });
    if (this._readPinBit(comp, leN) === 0) {
      state.bcd = resolved.bcd;
      state.error = resolved.error;
      state.minus = resolved.minus;
    }

    let changed = false;
    // ERROR and MINUS are always driven.
    if (this._drivePinBit(comp, errOut, state.error)) changed = true;
    if (this._drivePinBit(comp, minusOut, state.minus)) changed = true;

    // BCD outputs go Hi-Z on an error condition (incl. minus) or when the
    // active-LOW output enable is HIGH.
    const oe = this._readPinBit(comp, oeN);
    if (state.bcd === null || state.error === 1 || oe === 1) {
      if (this._drivePinsHighZ(comp, [aOut, bOut, cOut, dOut])) changed = true;
    } else {
      const bits = [
        state.bcd & 1,
        (state.bcd >> 1) & 1,
        (state.bcd >> 2) & 1,
        (state.bcd >> 3) & 1,
      ];
      if (this._drivePinBits(comp, [aOut, bOut, cOut, dOut], bits)) changed = true;
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

  // Advance divide by-6 section (used by 7492 divide by-12 counter)
  // States: 0→1→2→3→4→5→0
  _advanceDiv6(qb, qc, qd) {
    // 7492 ÷6 section is a ÷3 (QB,QC) followed by a ÷2 (QD), NOT a straight
    // binary ÷6. Per the TI SN74LS92 COUNT SEQUENCE (SDLS940A, p.3), the states
    // (QD QC QB) run 000,001,010,100,101,110 and repeat: QB,QC cycle 00→01→10→00
    // (÷3) and QD toggles each time that ÷3 wraps back to 0, so QD is a symmetric
    // ÷12 output. (A plain 0–5 binary count would give 011/111, which the real
    // part never produces.)
    const div3 = qb | (qc << 1);          // ÷3 sub-counter: 0,1,2
    const wrap = div3 === 2;              // about to roll 2 → 0
    const next3 = wrap ? 0 : div3 + 1;
    const nqd = wrap ? (qd ^ 1) : qd;     // ÷2 toggles when the ÷3 wraps
    return { qb: next3 & 1, qc: (next3 >> 1) & 1, qd: nqd };
  }

  _evaluateCounterDecade(comp, gate) {
    // 7490: Two independent sections.
    // Section A: CKA → QA (÷2 toggle, falling edge triggered)
    // Section B: CKB → QB/QC/QD (÷5 BCD counter, falling edge triggered)
    // R91 AND R92 = 1 → async set to 9 (QA=1, QB=0, QC=0, QD=1) — HIGHEST priority.
    // R01 AND R02 = 1 → async reset all to 0.
    // Per the TI SN7490A/SN74LS90 RESET/COUNT FUNCTION TABLE, set-to-nine wins when
    // both the reset and the set-to-nine pairs are asserted (R0 is "don't care" in the
    // set-to-9 row), so R9 is checked before R0.
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

    if (r9) {
      state.qa = 1; state.qb = 0; state.qc = 0; state.qd = 1;
    } else if (r0) {
      state.qa = state.qb = state.qc = state.qd = 0;
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
    // 7491: 8 bit serial in serial out shift register.
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
    // 7495-family 4-bit parallel-access shift register.
    //   MODE=0: shift mode  active CLK1 edge shifts SER→QA→QB→QC→QD
    //   MODE=1: parallel load  active CLK2 edge loads A→QA, B→QB, C→QC, D→QD
    // Clock edge: gate.edge === 'falling' → clock on the HIGH→LOW transition,
    //   matching the real negative-edge-triggered SN74x95 (and 74x178). When
    //   the flag is absent the legacy rising-edge behaviour is kept so other
    //   users of this primitive are unaffected.
    const [serName, aName, bName, cName, dName, modeName, clk1Name, clk2Name] = gate.inputs;
    const [qaName, qbName, qcName, qdName] = gate.outputs;
    const state = this._getSeqState(comp, qaName,
      { qa: 0, qb: 0, qc: 0, qd: 0, prevCLK1: 0, prevCLK2: 0 });

    this._drivePinBits(comp, [qaName, qbName, qcName, qdName],
      [state.qa, state.qb, state.qc, state.qd]);

    const mode = this._readPinBit(comp, modeName);
    const clk1 = this._readPinBit(comp, clk1Name);
    const clk2 = this._readPinBit(comp, clk2Name);
    const falling = gate.edge === 'falling';
    const edge1 = falling ? (state.prevCLK1 === 1 && clk1 === 0)
                          : (state.prevCLK1 === 0 && clk1 === 1);
    const edge2 = falling ? (state.prevCLK2 === 1 && clk2 === 0)
                          : (state.prevCLK2 === 0 && clk2 === 1);

    if (mode === 0 && edge1) {
      // Shift mode, active CLK1 edge
      const ser = this._readPinBit(comp, serName);
      state.qd = state.qc;
      state.qc = state.qb;
      state.qb = state.qa;
      state.qa = ser;
    } else if (mode === 1 && edge2) {
      // Parallel load, active CLK2 edge
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

  _evaluateShiftReg4BitPipo4035(comp, gate) {
    // CD4035: 4-stage clocked parallel-in/parallel-out shift register with
    // J-K(bar) serial inputs, true/complement outputs, and async reset.
    //   inputs:  [J, KBAR, CLK, PS, TC, RESET, I1, I2, I3, I4]
    //   outputs: [Q1, Q2, Q3, Q4]
    // Stage 1 is a J-K flip-flop whose second serial input is K-BAR (the
    // complement of K): Q1next = J·(~Q1) + KBAR·Q1 (tie J=KBAR=D → a D-FF).
    // Stages 2-4 are serial D flip-flops (Q2←Q1, Q3←Q2, Q4←Q3).
    // All transfers happen on the POSITIVE clock edge. P/S (PARALLEL/SERIAL
    // CONTROL) HIGH → synchronous parallel load of I1..I4 instead of shifting.
    // RESET is asynchronous, ACTIVE HIGH (forces every stage to 0). T/C
    // (TRUE/COMPLEMENT) chooses the output polarity asynchronously: HIGH →
    // true register contents, LOW → the complement.
    const [jName, kbarName, clkName, psName, tcName, resetName,
           i1Name, i2Name, i3Name, i4Name] = gate.inputs;
    const [q1Name, q2Name, q3Name, q4Name] = gate.outputs;
    const state = this._getSeqState(comp, q1Name,
      { q1: 0, q2: 0, q3: 0, q4: 0, prevCLK: 0 });

    const reset = this._readPinBit(comp, resetName);
    const clk = this._readPinBit(comp, clkName);

    if (reset === 1) {
      // Asynchronous active-HIGH reset (overrides the clock).
      state.q1 = 0; state.q2 = 0; state.q3 = 0; state.q4 = 0;
    } else if (state.prevCLK === 0 && clk === 1) {
      // Positive clock edge.
      const ps = this._readPinBit(comp, psName);
      if (ps === 1) {
        // Synchronous parallel load.
        state.q1 = this._readPinBit(comp, i1Name);
        state.q2 = this._readPinBit(comp, i2Name);
        state.q3 = this._readPinBit(comp, i3Name);
        state.q4 = this._readPinBit(comp, i4Name);
      } else {
        // Serial shift: stage 1 is a J-K(bar) flip-flop, stages 2-4 follow.
        const j = this._readPinBit(comp, jName);
        const kbar = this._readPinBit(comp, kbarName);
        const nq1 = (j === 1 && state.q1 === 0) || (kbar === 1 && state.q1 === 1) ? 1 : 0;
        state.q4 = state.q3;
        state.q3 = state.q2;
        state.q2 = state.q1;
        state.q1 = nq1;
      }
    }
    state.prevCLK = clk;

    // True/complement output control (asynchronous w.r.t. the clock).
    const tc = this._readPinBit(comp, tcName);
    const pol = (q) => (tc === 0 ? (q ? 0 : 1) : q);
    return this._drivePinBits(comp, [q1Name, q2Name, q3Name, q4Name],
      [pol(state.q1), pol(state.q2), pol(state.q3), pol(state.q4)]);
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
    // 74125: Active low output enable tri state buffer.
    // OE=0 (low) → output follows A. OE=1 (high) → HiZ.
    const [aName, oeName] = gate.inputs;
    const oe = this._readPinBit(comp, oeName);
    if (oe !== 0) return this._drivePinHighZ(comp, gate.output);
    const a = this._readPinBit(comp, aName);
    return this._drivePinBit(comp, gate.output, a);
  }

  _evaluateTriBufferHi(comp, gate) {
    // 74126: Active high output enable tri state buffer.
    // OE=1 (high) → output follows A. OE=0 (low) → HiZ.
    const [aName, oeName] = gate.inputs;
    const oe = this._readPinBit(comp, oeName);
    if (oe !== 1) return this._drivePinHighZ(comp, gate.output);
    const a = this._readPinBit(comp, aName);
    return this._drivePinBit(comp, gate.output, a);
  }

  // ── Chips5 gate evaluators ────────────────────────────────────────────────

  _evaluatePriorityEnc8to3(comp, gate) {
    // 74148: 8 to 3 priority encoder. All inputs/outputs active LOW.
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
    // 74x68: simple decade counter (0-9), rising edge CLK, active LOW CLR.
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
    // 74x69: simple 4 bit binary counter (0-15), rising edge CLK, active LOW CLR.
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
    // JK flip flop with 3 input AND J and K, preset only (no CLR).
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
    // 74x96 / SN7496: 5-bit shift register, five R-S master-slave flip-flops.
    // Source: TI SDLS946 (SN7496/SN74LS96), page 1 function table + positive-
    //   logic logic diagram, read as PDF page images (issues.md C4).
    //   - CLR (pin 16) active-LOW, ASYNCHRONOUS: LOW forces every output LOW,
    //     independent of the clock.
    //   - Parallel load is an ASYNCHRONOUS, SET-ONLY preset. While PE (preset
    //     enable) is HIGH, each preset input A..E that is HIGH forces its stage
    //     HIGH; a LOW preset input does nothing (that stage holds). A preset
    //     can only write 1s, so loading an exact word means CLEAR first, then
    //     preset. Presetting is independent of the clock.
    //   - Shift: on the rising CLK edge (PE low) SERIAL enters QA and the chain
    //     shifts QA→QB→QC→QD→QE (QE is the serial output).
    // Simplification: the datasheet forbids asserting CLEAR and PRESET together;
    //   here CLEAR wins that illegal overlap (clear is the master reset), and
    //   PE HIGH gates the clocked shift off (datasheet: PE must be low to clock).
    // inputs: [CLK, CLR, SER, A, B, C, D, E, PE], outputs: [QA, QB, QC, QD, QE]
    const [clkN, clrN, serN, aN, bN, cN, dN, eN, peN] = gate.inputs;
    const [qaName] = gate.outputs;
    const state = this._getSeqState(comp, qaName, { qa: 0, qb: 0, qc: 0, qd: 0, qe: 0, prevClk: 0 });
    this._drivePinBits(comp, gate.outputs, [state.qa, state.qb, state.qc, state.qd, state.qe]);
    const clk = this._readPinBit(comp, clkN);
    // Asynchronous clear dominates everything.
    if (this._readPinBit(comp, clrN) === 0) {
      state.qa = state.qb = state.qc = state.qd = state.qe = 0;
      state.prevClk = clk;
      return this._drivePinBits(comp, gate.outputs, [0, 0, 0, 0, 0]);
    }
    const pe = this._readPinBit(comp, peN);
    // Clocked shift only when preset enable is low.
    if (pe === 0 && state.prevClk === 0 && clk === 1) {
      const ser = this._readPinBit(comp, serN);
      state.qe = state.qd; state.qd = state.qc; state.qc = state.qb; state.qb = state.qa; state.qa = ser;
    }
    // Asynchronous, set-only preset (level-sensitive): HIGH input + PE HIGH sets that stage.
    if (pe === 1) {
      if (this._readPinBit(comp, aN) === 1) state.qa = 1;
      if (this._readPinBit(comp, bN) === 1) state.qb = 1;
      if (this._readPinBit(comp, cN) === 1) state.qc = 1;
      if (this._readPinBit(comp, dN) === 1) state.qd = 1;
      if (this._readPinBit(comp, eN) === 1) state.qe = 1;
    }
    state.prevClk = clk;
    return this._drivePinBits(comp, gate.outputs, [state.qa, state.qb, state.qc, state.qd, state.qe]);
  }

  _evaluateCounterJohnson4018(comp, gate) {
    // CD4018B: CMOS presettable divide-by-N counter = 5 Johnson-counter stages.
    // Source: TI/Harris, "CD4018B Types — CMOS Presettable Divide-By-'N' Counter",
    //   SCHS028B (rev. Oct 2003), p.1 Description + p.2 Fig.1 Logic diagram, read
    //   as rendered PDF page images (issues.md C4).
    // Five D-type stages in a shift chain: on the POSITIVE clock edge each stage
    // takes the previous stage's value and stage 1 takes DATA (Q1<-DATA,
    // Q2<-Q1, ... Q5<-Q4). A divide-by-N is built externally by feeding ~Qn back
    // to DATA (÷10,8,6,4,2 from ~Q5..~Q1; odd ratios via an external gate).
    // RESET (pin 15) is active-HIGH and ASYNCHRONOUS — a HIGH clears all stages.
    // PRESET ENABLE (pin 10) is active-HIGH and ASYNCHRONOUS — while HIGH the JAM
    // inputs (J1..J5) are jammed into the stages, level-sensitive (no clock edge),
    // per the datasheet: "A high PRESET-ENABLE signal allows information on the
    // JAM inputs to preset the counter."
    // inputs:  [CLK, RESET, DATA, PE, J1, J2, J3, J4, J5]
    // outputs: [Q1, Q2, Q3, Q4, Q5]   (Q1 = first stage / Johnson LSB)
    const [clkN, rstN, dataN, peN, j1N, j2N, j3N, j4N, j5N] = gate.inputs;
    const [q1Name] = gate.outputs;
    const state = this._getSeqState(comp, q1Name, { q1: 0, q2: 0, q3: 0, q4: 0, q5: 0, prevClk: 0 });
    this._drivePinBits(comp, gate.outputs, [state.q1, state.q2, state.q3, state.q4, state.q5]);
    const clk = this._readPinBit(comp, clkN);
    // RESET dominates PRESET ENABLE (clear wins the disallowed RESET=PE=HIGH case).
    if (this._readPinBit(comp, rstN) === 1) {
      state.q1 = state.q2 = state.q3 = state.q4 = state.q5 = 0;
      state.prevClk = clk;
      return this._drivePinBits(comp, gate.outputs, [0, 0, 0, 0, 0]);
    }
    if (this._readPinBit(comp, peN) === 1) {
      state.q1 = this._readPinBit(comp, j1N);
      state.q2 = this._readPinBit(comp, j2N);
      state.q3 = this._readPinBit(comp, j3N);
      state.q4 = this._readPinBit(comp, j4N);
      state.q5 = this._readPinBit(comp, j5N);
      state.prevClk = clk;
      return this._drivePinBits(comp, gate.outputs, [state.q1, state.q2, state.q3, state.q4, state.q5]);
    }
    if (state.prevClk === 0 && clk === 1) {
      const data = this._readPinBit(comp, dataN);
      state.q5 = state.q4; state.q4 = state.q3; state.q3 = state.q2; state.q2 = state.q1; state.q1 = data;
    }
    state.prevClk = clk;
    return this._drivePinBits(comp, gate.outputs, [state.q1, state.q2, state.q3, state.q4, state.q5]);
  }

  _evaluateRateMult6Bit(comp, gate) {
    // 74x97: 6 bit binary rate multiplier. Simplified: Y = CLK & ENP when no cascade.
    // inputs: [CLK, ENP, A, B, C, D, E, F], outputs: [Y, Z, UNITY]
    // Static approximation: Y = CLK AND ENP (pass-through with enable).
    // gate.enableActiveLow (opt-in, default off): the enable pin is active LOW, so
    //   Y = CLK AND (NOT ENP). Used by the CD4089B whose STROBE blanks OUT when
    //   HIGH (STR=1 → OUT=L per its truth table); the 74x97 leaves the flag off so
    //   its behavior is unchanged.
    const [clkN, enpN] = gate.inputs;
    const [yName, zName] = gate.outputs;
    const clk = this._readPinBit(comp, clkN);
    const enpRaw = this._readPinBit(comp, enpN);
    const enp = gate.enableActiveLow ? (enpRaw ^ 1) : enpRaw;
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

  _evaluateSRLatchQuadTri(comp, gate) {
    // Quad cross-coupled 3-STATE CMOS R/S latch with one common active-HIGH
    // output ENABLE. Backs two siblings sharing this structure (TI CD4043B/CD4044B,
    // SCHS041D); set gate.activeLow to pick the variant:
    //
    //   gate.activeLow falsy → CD4043B (NOR latch, active-HIGH S/R, SET dominant).
    //     ENABLE=1 truth table:
    //       S=0,R=0 → hold;  S=1,R=0 → Q=1 (set);  S=0,R=1 → Q=0 (reset);
    //       S=1,R=1 → Q=1 (datasheet: "DOMINATED BY S=1 INPUT").
    //
    //   gate.activeLow true  → CD4044B (NAND latch, active-LOW S/R, RESET dominant).
    //     ENABLE=1 truth table:
    //       S=1,R=1 → hold;  S=0,R=1 → Q=1 (set);  S=1,R=0 → Q=0 (reset);
    //       S=0,R=0 → Q=0 (datasheet: "DOMINATED BY R=0 INPUT").
    //
    // inputs:  [S1,R1, S2,R2, S3,R3, S4,R4, ENABLE]
    // outputs: [Q1, Q2, Q3, Q4]
    // ENABLE = 0 → all four Q outputs go open-circuit (3-state / Hi-Z); the internal
    //   latch state is retained, so re-enabling restores the held value.
    // The latch state lives in a single 4-element array keyed off the first output.
    const activeLow = gate.activeLow === true;
    const state = this._getSeqState(comp, gate.outputs[0], { q: [0, 0, 0, 0] });
    const en = this._readPinBit(comp, gate.inputs[8]);
    let changed = false;
    for (let i = 0; i < 4; i++) {
      const s = this._readPinBit(comp, gate.inputs[2 * i]);
      const r = this._readPinBit(comp, gate.inputs[2 * i + 1]);
      if (activeLow) {
        // NAND latch (CD4044): active-LOW inputs, RESET dominant.
        if (r === 0) state.q[i] = 0;        // reset (dominates a simultaneous set)
        else if (s === 0) state.q[i] = 1;   // set
        // else (s=1,r=1): hold
      } else {
        // NOR latch (CD4043): active-HIGH inputs, SET dominant.
        if (s === 1) state.q[i] = 1;        // set (dominates a simultaneous reset)
        else if (r === 1) state.q[i] = 0;   // reset
        // else (s=0,r=0): hold
      }
      const qName = gate.outputs[i];
      if (en === 1) {
        if (this._drivePinBit(comp, qName, state.q[i])) changed = true;
      } else {
        if (this._drivePinHighZ(comp, qName)) changed = true;
      }
    }
    return changed;
  }

  _evaluateDec3To8Reg(comp, gate) {
    // 74AS131/74ALS131: 3 to 8 line decoder with address register, inverting outputs.
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
    // 74x137: 3 to 8 decoder with address latch. Active LOW G1n, active HIGH G2 enables.
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
    // 74x147: 10-to-4 line BCD priority encoder. All inputs/outputs active LOW.
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
    // 74x149: 8 line cascadable priority encoder (1-of-8 output).
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

  _evaluatePriorityEnc8to3Hi(comp, gate) {
    // CD4532B: CMOS 8-bit priority encoder. ALL inputs and outputs are
    // ACTIVE HIGH — this is the active-HIGH sibling of the 74x148
    // (PRIORITY_ENC_8TO3), which is fully active-LOW with inverted-binary
    // outputs and so does NOT fit here (issues.md C2 lesson). The hinted
    // PRIORITY_ENC_8LINE (74x149) is a 1-of-8 active-LOW one-hot output, also
    // wrong shape. New primitive required.
    //   inputs:  [D0..D7, EI]   D7 = highest priority. EI = chip enable.
    //   outputs: [Q0, Q1, Q2, GS, EO]  Q2Q1Q0 = binary index of highest D set.
    // Behaviour (TI CD4532B SCHS082C TRUTH TABLE, verified — see chip header):
    //   EI=0 (disabled):           GS=0, Q=000, EO=0  (all outputs LOW).
    //   EI=1, no input active:     GS=0, Q=000, EO=1.
    //   EI=1, Dn highest active:   GS=1, Q=bin(n), EO=0.
    const bits = this._readGateInputs(comp, gate.inputs);
    const ei = bits[8];
    const [q0n, q1n, q2n, gsn, eon] = gate.outputs;
    if (ei === 0) {
      return this._drivePinBits(comp, [q0n, q1n, q2n, gsn, eon], [0, 0, 0, 0, 0]);
    }
    let highest = -1;
    for (let i = 7; i >= 0; i--) { if (bits[i]) { highest = i; break; } }
    if (highest === -1) {
      return this._drivePinBits(comp, [q0n, q1n, q2n, gsn, eon], [0, 0, 0, 0, 1]);
    }
    return this._drivePinBits(comp, [q0n, q1n, q2n, gsn, eon], [
      (highest >> 0) & 1,
      (highest >> 1) & 1,
      (highest >> 2) & 1,
      1, // GS: priority input(s) present
      0, // EO: low when any input is asserted
    ]);
  }

  _evaluateMux8to1Inv(comp, gate) {
    // 74x152: 8-to-1 multiplexer, inverted W output only, no strobe.
    // inputs: [D0..D7, A, B, C], outputs: [W]
    const bits = this._readGateInputs(comp, gate.inputs);
    const sel = bits[8] | (bits[9] << 1) | (bits[10] << 2);
    return this._drivePinBit(comp, gate.outputs[0], bits[sel] ? 0 : 1);
  }

  _evaluateDemux2to4(comp, gate) {
    // Demux 2-to-4 with data input (C). Used by 74x155, 74x156 (active-LOW out),
    // and the CD4555/CD4556 dual 1-of-4 decoders.
    // inputs: [A, B, G, C] G=active LOW enable, C is data; pin ending 'n' → auto-invert
    // outputs: [Y0..Y3], sel = A | (B<<1) (A=LSB).
    //   default (active-LOW, 74139/155/156 and CD4556): selected Y=0, others=1;
    //     disabled → all=1.
    //   gate.activeHigh (CD4555, "outputs HIGH on select"): selected Y=1, others=0;
    //     disabled → all=0. Default off, so existing active-LOW users are unchanged.
    // enabled when G=0 AND effective_C=0 (C if normal, NOT(pin) if name ends 'n').
    //   A single-enable part (CD4555/CD4556 has only Enable Ē) wires Ē into both
    //   the G and C slots so enabled ⇔ Ē=0.
    const [aName, bName, gName, cName] = gate.inputs;
    const a = this._readPinBit(comp, aName);
    const b = this._readPinBit(comp, bName);
    const g = this._readPinBit(comp, gName);
    const c = this._readPinBit(comp, cName, { invert: cName.endsWith('n') });
    const enabled = (g === 0) && (c === 0);
    const sel = a | (b << 1);
    const activeHigh = gate.activeHigh === true;
    const isOC = comp.chipDef && comp.chipDef.openCollector;
    let changed = false;
    for (let i = 0; i < gate.outputs.length; i++) {
      const selected = enabled && i === sel;
      const bit = activeHigh ? (selected ? 1 : 0) : (selected ? 0 : 1);
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
    // 74x143/74x144: Decade counter + latch + 7 segment decoder + driver.
    // inputs: [CLK, CLR, STROBE, ENP, ENT]
    // outputs: [QA, QB, QC, QD, RCO, a, b, c, d, e, f, g]
    // CLR=1(H): async clear. Rising CLK with ENP&ENT: count 0-9.
    // STROBE=1: transparent; STROBE=0: latch for 7-seg output.
    // 74143: constant-current outputs (push pull). 74144: OC outputs.
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
    // 7 segment decode: standard mapping, active HIGH segments
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
    const csList = comp.chipDef && comp.chipDef.currentSourceOutputs;
    const csSet = csList ? new Set(csList) : null;
    const csAmps = (comp.chipDef && comp.chipDef.currentSourceAmps) || 0.015;
    for (let i = 0; i < segNames.length && i < 7; i++) {
      const bit = segs[i] || 0;
      const pin = segNames[i];
      if (isOC) {
        if (this._drivePinOC(comp, pin, bit)) changed = true;
      } else if (csSet && csSet.has(pin)) {
        // Constant-current driver (e.g. 74x143): inject csAmps when segment is ON,
        // tri-state when OFF (an isolated CS pin would otherwise blow up the MNA).
        const ch = bit
          ? this._drivePinCurrentSource(comp, pin, csAmps)
          : this._drivePinHighZ(comp, pin);
        if (ch) changed = true;
      } else {
        if (this._drivePinBit(comp, pin, bit)) changed = true;
      }
    }
    return changed;
  }

  _evaluateCounter7Seg4026(comp, gate) {
    // CD4026B: decade (5-stage Johnson) counter + decoded 7-segment outputs
    // with DISPLAY ENABLE blanking. NOT the 74x143/144 COUNTER_7SEG part — the
    // CD4026 has no BCD QA..QD pins, no ENP/ENT, no STROBE latch and no
    // count==9 RCO. Instead:
    //   inputs:  [CLOCK, CLKINH, RESET, DISPEN]
    //   outputs: [CARRY, DISPEN_OUT, UNGATED_C, a, b, c, d, e, f, g]
    // RESET=1(H): async clear to count 0. Counter advances on the rising edge
    // of the gated clock G = (CLOCK AND NOT CLKINH) — so it counts on a positive
    // CLOCK transition while CLOCK INHIBIT is low, and (with CLOCK held high)
    // CLOCK INHIBIT acts as a negative-edge clock. CARRY OUT is the divide-by-10
    // output: HIGH for counts 0-4, LOW for 5-9 (rising edge at the 9->0 rollover
    // clocks the next decade). DISPLAY ENABLE IN low forces the seven SEGMENT
    // outputs low (display blank / power save) but does NOT affect CARRY OUT or
    // the UNGATED "C" SEGMENT, which stay available continuously. DISPLAY ENABLE
    // OUT is a buffered copy of DISPLAY ENABLE IN for cascading. Verified vs TI
    // CD4026B SCHS031B (terminal diagram, Fig.1 logic diagram, Fig.3 timing).
    const [clkN, clkInhN, resetN, dispEnN] = gate.inputs;
    const [carryName, deoName, ucName] = gate.outputs.slice(0, 3);
    const segNames = gate.outputs.slice(3); // a,b,c,d,e,f,g
    const state = this._getSeqState(comp, carryName, { count: 0, prevGclk: 0 });
    const clk   = this._readPinBit(comp, clkN);
    const inh   = this._readPinBit(comp, clkInhN);
    const reset = this._readPinBit(comp, resetN);
    const dispEn = this._readPinBit(comp, dispEnN);
    const gclk = (clk === 1 && inh === 0) ? 1 : 0;
    if (reset === 1) {
      state.count = 0;
    } else if (state.prevGclk === 0 && gclk === 1) {
      state.count = (state.count + 1) % 10;
    }
    state.prevGclk = gclk;
    const n = state.count;
    const carry = (n < 5) ? 1 : 0;
    // Standard 7-segment font (active-HIGH), order a,b,c,d,e,f,g.
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
    const segs = SEG7[n] || SEG7[0];
    let changed = false;
    if (this._drivePinBit(comp, carryName, carry)) changed = true;
    if (this._drivePinBit(comp, deoName, dispEn)) changed = true;
    // UNGATED "C" SEGMENT: c-segment decode, never gated by DISPLAY ENABLE.
    if (this._drivePinBit(comp, ucName, segs[2])) changed = true;
    for (let i = 0; i < segNames.length && i < 7; i++) {
      const bit = dispEn ? (segs[i] || 0) : 0;
      if (this._drivePinBit(comp, segNames[i], bit)) changed = true;
    }
    return changed;
  }

  _evaluateCounter7SegRb(comp, gate) {
    // CD4033B: decade counter + decoded 7-segment driver with RIPPLE BLANKING
    // and LAMP TEST (the zero-suppression sibling of the CD4026's DISPLAY ENABLE).
    // inputs:  [CLK, CLK_INHIBIT, RESET, RBI, LAMP_TEST]
    // outputs: [a, b, c, d, e, f, g, CARRY, RBO]
    //   • Counter 0-9 advances on the RISING CLK edge while CLOCK INHIBIT is LOW.
    //   • RESET=1 (HIGH): asynchronous clear to count 0.
    //   • CARRY OUT (CLOCK/10): HIGH for counts 0-4, LOW for counts 5-9 — so its
    //     rising edge at the 9->0 rollover clocks the next decade in a chain.
    //   • Segments are active-HIGH (common-cathode) standard 7-seg decode.
    //   • LAMP TEST=1 forces all seven segments ON (display "8"), overriding decode.
    //   • Ripple blanking: a leading zero (count==0 AND RBI=LOW) is blanked (all
    //     segments OFF) and RBO is driven LOW to propagate blanking to the next
    //     less-significant stage; otherwise RBO is HIGH.
    const [clkN, ciN, resetN, rbiN, ltN] = gate.inputs;
    const segNames = gate.outputs.slice(0, 7); // a,b,c,d,e,f,g
    const carryName = gate.outputs[7];
    const rboName = gate.outputs[8];
    const state = this._getSeqState(comp, segNames[0], { count: 0, prevClk: 0 });
    const reset = this._readPinBit(comp, resetN);
    const clk = this._readPinBit(comp, clkN);
    const ci = this._readPinBit(comp, ciN);
    if (reset === 1) {
      state.count = 0;
    } else if (state.prevClk === 0 && clk === 1 && ci === 0) {
      state.count = (state.count + 1) % 10;
    }
    state.prevClk = clk;
    const n = state.count;
    const rbi = this._readPinBit(comp, rbiN);
    const lampTest = this._readPinBit(comp, ltN);
    // standard 7-segment decode, active-HIGH segments [a,b,c,d,e,f,g]
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
    const blank = (n === 0 && rbi === 0); // leading-zero suppression
    let segs;
    if (lampTest === 1) segs = [1,1,1,1,1,1,1];
    else if (blank) segs = [0,0,0,0,0,0,0];
    else segs = SEG7[n] || SEG7[0];
    let changed = false;
    for (let i = 0; i < segNames.length && i < 7; i++) {
      if (this._drivePinBit(comp, segNames[i], segs[i] || 0)) changed = true;
    }
    const carry = (n <= 4) ? 1 : 0;
    if (this._drivePinBit(comp, carryName, carry)) changed = true;
    const rbo = blank ? 0 : 1;
    if (this._drivePinBit(comp, rboName, rbo)) changed = true;
    return changed;
  }

  _evaluateCounter7Seg40110(comp, gate) {
    // CD40110B: DUAL-CLOCKED decade up/down counter + output latch + 7-segment
    // decoder + bipolar segment driver, plus CARRY and BORROW cascade outputs.
    //   inputs:  [CLK_UP, CLK_DOWN, LATCH_ENABLE, TOGGLE_ENABLE, RESET]
    //   outputs: [a, b, c, d, e, f, g, CARRY, BORROW]
    // Source: Texas Instruments (data sheet acquired from Harris Semiconductor),
    //   "CD40110B Types — CMOS Decade Up/Down Counter/Latch/Display Driver",
    //   SCHS100. Verified vs the TRUTH TABLE + Functional Diagram (pages 1, 6)
    //   read as 300-dpi PDF page images (issues.md C4). Behaviour modeled:
    //   • CLK UP (pin 9) and CLK DOWN (pin 7) are SEPARATE positive-edge clocks:
    //     a LOW->HIGH transition on CLK UP increments, on CLK DOWN decrements
    //     (decade, mod-10 wrap). (Real silicon needs ~100 ns between the two
    //     clocks' rising edges; 74Sim has no propagation delay — issues.md A1.)
    //   • RESET (pin 5) active-HIGH, asynchronous: counter goes to 0.
    //   • TOGGLE ENABLE (pin 4): truth-table column is the active-LOW count
    //     enable — pin HIGH inhibits counting (count held), pin LOW enables it.
    //   • LATCH ENABLE (pin 6): LOW = latch transparent (display follows the
    //     counter); HIGH = latch holds the last value (display fixed) while the
    //     counter keeps running underneath.
    //   • Segments a-g are active-HIGH (sources current to a common-cathode LED),
    //     standard 7-seg decode of the LATCHED value.
    //   • CARRY (pin 10) is normally HIGH and pulses LOW when count==9 while
    //     CLK UP is LOW; its rising edge at the 9->0 rollover clocks the next
    //     decade. BORROW (pin 11) is normally HIGH and pulses LOW when count==0
    //     while CLK DOWN is LOW. Same convention as the 74x192 COUNTER_DECADE_DC,
    //     so CARRY->CLK UP / BORROW->CLK DOWN cascading works.
    const [upN, downN, leN, teN, resetN] = gate.inputs;
    const segNames = gate.outputs.slice(0, 7); // a,b,c,d,e,f,g
    const carryName = gate.outputs[7];
    const borrowName = gate.outputs[8];
    const state = this._getSeqState(comp, segNames[0],
      { count: 0, prevUP: 0, prevDOWN: 0, latched: 0 });
    const up = this._readPinBit(comp, upN);
    const down = this._readPinBit(comp, downN);
    const le = this._readPinBit(comp, leN);
    const te = this._readPinBit(comp, teN);
    const reset = this._readPinBit(comp, resetN);
    if (reset === 1) {
      state.count = 0;
    } else if (te === 0) { // TOGGLE ENABLE LOW = counting enabled
      if (state.prevUP === 0 && up === 1)
        state.count = (state.count + 1) % 10;
      if (state.prevDOWN === 0 && down === 1)
        state.count = (state.count - 1 + 10) % 10;
    }
    state.prevUP = up; state.prevDOWN = down;
    // Output latch: transparent while LATCH ENABLE is LOW, holds while HIGH.
    if (le === 0) state.latched = state.count;
    const displayVal = state.latched;
    // Standard active-HIGH 7-seg decode [a,b,c,d,e,f,g].
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
    const segs = SEG7[displayVal] || SEG7[0];
    let changed = false;
    for (let i = 0; i < segNames.length && i < 7; i++) {
      if (this._drivePinBit(comp, segNames[i], segs[i] || 0)) changed = true;
    }
    const carry  = (state.count === 9 && up   === 0) ? 0 : 1;
    const borrow = (state.count === 0 && down === 0) ? 0 : 1;
    if (this._drivePinBit(comp, carryName, carry)) changed = true;
    if (this._drivePinBit(comp, borrowName, borrow)) changed = true;
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

  _evaluateRateMultBcd4527(comp, gate) {
    // CD4527B: CMOS BCD (decade) rate multiplier.
    //   inputs:  [CLK, CLR, SET9, STR, INH, CAS, A, B, C, D]
    //   outputs: [OUT, OUTn, NINE, CARRY]   (CARRY = INHIBIT/CARRY OUT, pin 7)
    //
    // Source: Texas Instruments (acquired from Harris), "CD4527B Types — CMOS BCD
    //   Rate Multiplier", SCHS080C (Rev. July 2003). Verified by reading the saved
    //   PDF as page images (Read with pages:, NOT the text summarizer — issues.md
    //   C4): TOP-VIEW Terminal Assignment (page 1), TRUTH TABLE (page 6), Logic
    //   Diagram Fig.13 + Timing Diagram Fig.14 (page 5). Function: OUT delivers N
    //   pulses for every 10 clock pulses, where N = BCD value of (D,C,B,A); e.g. the
    //   datasheet's "when the BCD input is 8, there will be 8 out of every 10 input
    //   pulses." A is LSB (weight 1) … D is MSB (weight 8). NOT cloned from the
    //   74167 RATE_MULT_DECADE primitive (whose CLR/LOAD/ENP/ENT pin contract and
    //   single-pulse Z model do not match this part — issues.md C2 lesson).
    //
    // Model: an internal decade counter (0-9) advances on each rising CLOCK edge.
    //   Each of the ten counter states is "owned" by one rate weight; OUT pulses
    //   (follows the clock) during the states whose owning weight bit is HIGH:
    //     A (weight 1) owns {9}        B (weight 2) owns {3,7}
    //     C (weight 4) owns {1,4,6,8}  D (weight 8) owns {1,2,3,4,5,6,7,8}
    //   These state sets were chosen so the count of enabled states reproduces the
    //   datasheet TRUTH TABLE for ALL 16 input codes: valid BCD 0-9 give exactly N
    //   pulses, and the invalid codes 10-15 give 8 (A=0) or 9 (A=1) exactly as the
    //   table shows — because every B/C state is a subset of D's eight states, so
    //   adding B or C to D contributes nothing. The exact intra-cycle pulse PHASE of
    //   the real silicon is not reproduced (74Sim has no sub-clock timing — A1);
    //   only the pulse COUNT per 10 clocks and the truth-table logic levels are
    //   modeled. Behavioral approximation in the spirit of issues.md B4.
    const A_MASK = 1 << 9;                                       // {9}
    const B_MASK = (1 << 3) | (1 << 7);                          // {3,7}
    const C_MASK = (1 << 1) | (1 << 4) | (1 << 6) | (1 << 8);    // {1,4,6,8}
    const D_MASK = (1<<1)|(1<<2)|(1<<3)|(1<<4)|(1<<5)|(1<<6)|(1<<7)|(1<<8); // {1..8}
    const [clkN, clrN, set9N, strN, inhN, casN, aN, bN, cN, dN] = gate.inputs;
    const [outName, outnName, nineName, carryName] = gate.outputs;
    const state = this._getSeqState(comp, outName, { count: 0, prevClk: 0 });
    const clk  = this._readPinBit(comp, clkN);
    const clr  = this._readPinBit(comp, clrN);
    const set9 = this._readPinBit(comp, set9N);
    // Asynchronous CLEAR (→0, dominant) and SET TO "9" (→9), both active HIGH; the
    // datasheet warns CLEAR and SET should not be HIGH together (non-valid state).
    if (clr === 1) {
      state.count = 0;
    } else if (set9 === 1) {
      state.count = 9;
    } else if (state.prevClk === 0 && clk === 1) {
      state.count = (state.count + 1) % 10;
    }
    state.prevClk = clk;

    const a = this._readPinBit(comp, aN);
    const b = this._readPinBit(comp, bN);
    const c = this._readPinBit(comp, cN);
    const d = this._readPinBit(comp, dN);
    const s = state.count;
    const enabled = (
      (a && ((A_MASK >> s) & 1)) || (b && ((B_MASK >> s) & 1)) ||
      (c && ((C_MASK >> s) & 1)) || (d && ((D_MASK >> s) & 1))
    ) ? 1 : 0;

    const str = this._readPinBit(comp, strN);   // STROBE: HIGH blanks OUT (→L)
    const inh = this._readPinBit(comp, inhN);   // INHIBIT IN (carry in): HIGH inhibits
    const cas = this._readPinBit(comp, casN);   // CASCADE: HIGH forces OUT HIGH

    // OUT priority follows the datasheet truth-table order: any of INHIBIT-IN /
    // STROBE / CLEAR / SET blanks the output LOW; CASCADE forces it HIGH; otherwise
    // OUT is the clock-gated rate pulse (HIGH during the clock-HIGH of an owned state).
    let out;
    if (inh === 1 || str === 1 || clr === 1 || set9 === 1) {
      out = 0;
    } else if (cas === 1) {
      out = 1;
    } else {
      out = (enabled && clk) ? 1 : 0;
    }
    const nine = (state.count === 9) ? 1 : 0;   // "9" OUT (pin 1): HIGH at count 9
    // INHIBIT/CARRY OUT (pin 7): normally HIGH; LOW at terminal count 9 (the carry
    // pulse that drives the next stage's INHIBIT IN when cascading). INHIBIT IN HIGH
    // forces it HIGH (truth table).
    let carry = (state.count === 9) ? 0 : 1;
    if (inh === 1) carry = 1;

    let changed = false;
    if (this._drivePinBit(comp, outName, out)) changed = true;
    if (outnName  && this._drivePinBit(comp, outnName, out ^ 1)) changed = true;
    if (nineName  && this._drivePinBit(comp, nineName, nine)) changed = true;
    if (carryName && this._drivePinBit(comp, carryName, carry)) changed = true;
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
    // RE=1: outputs disabled (HIGH_Z for 3-state, OC pull up for open collector).
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

  _evaluateRegFileDual16x4Tri(comp, gate) {
    // 74x870: dual 16-word × 4-bit register file with two bidirectional 3-state ports.
    // Source: Texas Instruments, "SN74ALS870 Dual 16-by-4 Register Files", datasheet.
    //   Verified: pin assignment read from page 1 as a rendered PDF-page image
    //   (alldatasheet idx 28301); function semantics (S0/S1 file-select per port,
    //   S2/S3 direction per port, per-file 1W/2W write-enable and 1A/2A address) and
    //   the "B-input port takes priority" write tie-break confirmed from the TI
    //   datasheet text. See the chip-entry header comment for full citations.
    //
    // inputs:  [S0,S1,S2,S3, 1W,2W,
    //           1A0,1A1,1A2,1A3, 2A0,2A1,2A2,2A3,
    //           DQA0,DQA1,DQA2,DQA3, DQB0,DQB1,DQB2,DQB3]
    // outputs: [DQA0,DQA1,DQA2,DQA3, DQB0,DQB1,DQB2,DQB3]  (same physical bidir pins)
    // Each file owns one address bus (1A / 2A) and one write-enable (1W / 2W, active LOW).
    // S0 routes port A to file 1 (L) or file 2 (H); S1 does the same for port B.
    // S2 sets port A direction: L = output (drive the DQA bus from the selected file),
    // H = input (release DQA and write it into the selected file). S3 controls port B.
    // Writes are level-sensitive while the file's W is LOW. If both ports write the
    // same file, the B port's data is stored (B priority).
    const [s0n,s1n,s2n,s3n, w1n,w2n,
           a10,a11,a12,a13, a20,a21,a22,a23,
           dqa0,dqa1,dqa2,dqa3, dqb0,dqb1,dqb2,dqb3] = gate.inputs;
    const state = this._getSeqState(comp, gate.outputs[0],
      { file1: new Array(16).fill(0), file2: new Array(16).fill(0) });

    const s0 = this._readPinBit(comp, s0n);
    const s1 = this._readPinBit(comp, s1n);
    const s2 = this._readPinBit(comp, s2n);
    const s3 = this._readPinBit(comp, s3n);
    const w1 = this._readPinBit(comp, w1n);
    const w2 = this._readPinBit(comp, w2n);
    const addr1 = this._readPinBit(comp,a10) | (this._readPinBit(comp,a11)<<1) |
                  (this._readPinBit(comp,a12)<<2) | (this._readPinBit(comp,a13)<<3);
    const addr2 = this._readPinBit(comp,a20) | (this._readPinBit(comp,a21)<<1) |
                  (this._readPinBit(comp,a22)<<2) | (this._readPinBit(comp,a23)<<3);
    const dqaIn = this._readPinBit(comp,dqa0) | (this._readPinBit(comp,dqa1)<<1) |
                  (this._readPinBit(comp,dqa2)<<2) | (this._readPinBit(comp,dqa3)<<3);
    const dqbIn = this._readPinBit(comp,dqb0) | (this._readPinBit(comp,dqb1)<<1) |
                  (this._readPinBit(comp,dqb2)<<2) | (this._readPinBit(comp,dqb3)<<3);

    const aInput = s2 === 1;   // port A in input (write) mode
    const bInput = s3 === 1;   // port B in input (write) mode
    const aFile2 = s0 === 1;   // port A routed to file 2
    const bFile2 = s1 === 1;   // port B routed to file 2

    // Level-sensitive writes; B port wins a same-file conflict.
    if (w1 === 0) {
      if (bInput && !bFile2)      state.file1[addr1] = dqbIn;
      else if (aInput && !aFile2) state.file1[addr1] = dqaIn;
    }
    if (w2 === 0) {
      if (bInput && bFile2)       state.file2[addr2] = dqbIn;
      else if (aInput && aFile2)  state.file2[addr2] = dqaIn;
    }

    let changed = false;
    // Port A: output mode drives its file's word; input mode releases the bus.
    if (aInput) {
      for (const p of [dqa0,dqa1,dqa2,dqa3]) if (this._drivePinHighZ(comp, p)) changed = true;
    } else {
      const w = aFile2 ? state.file2[addr2] : state.file1[addr1];
      if (this._drivePinBits(comp, [dqa0,dqa1,dqa2,dqa3],
        [w&1,(w>>1)&1,(w>>2)&1,(w>>3)&1])) changed = true;
    }
    // Port B.
    if (bInput) {
      for (const p of [dqb0,dqb1,dqb2,dqb3]) if (this._drivePinHighZ(comp, p)) changed = true;
    } else {
      const w = bFile2 ? state.file2[addr2] : state.file1[addr1];
      if (this._drivePinBits(comp, [dqb0,dqb1,dqb2,dqb3],
        [w&1,(w>>1)&1,(w>>2)&1,(w>>3)&1])) changed = true;
    }
    return changed;
  }

  _evaluateCounterBiqPreset(comp, gate) {
    // 74176: Presettable decade bi quinary counter/latch.
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
    // 74179: 4 bit parallel access shift register with async CLR and complementary QDn.
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

  _evaluateAoBiphasePair(comp, gate) {
    // CD4037 AND/OR bi-phase pair (one of three sections).
    // inputs: [A, B, C]  (A,B = the two common control lines; C = section data)
    // outputs: [D, E]    (complementary bi-phase split outputs)
    //
    // Verified against the RCA CD4037A truth table (1980 RCA COS/MOS databook,
    // p.519–520, read as a 300-dpi PDF page render — the scanned PDF's text layer
    // is garbled OCR, so the functional diagram + truth table were read as images):
    //   A B │ D    E
    //   0 0 │ 1    1
    //   1 0 │ C    C̄
    //   0 1 │ C̄    C
    //   1 1 │ 0    0
    // which is exactly the AND-OR-INVERT pair (the on-chip output buffers invert):
    //   D = NOT( (A·C̄) + (B·C) )
    //   E = NOT( (A·C)  + (B·C̄) )
    // The hinted non-inverting AO_22 can't reproduce this (output is HIGH when
    // A=B=0, impossible from positive literals A/B/C), and the engine has no
    // internal-net support to chain a NOT into AO_22 — hence this dedicated
    // primitive. See issues.md.
    const [a, b, c] = this._readGateInputs(comp, gate.inputs);
    const nc = c ? 0 : 1;
    const d = ((a & nc) | (b & c)) ? 0 : 1;
    const e = ((a & c) | (b & nc)) ? 0 : 1;
    return this._drivePinBits(comp, gate.outputs, [d, e]);
  }

  _evaluateAlu4Bit(comp, gate) {
    // 74181: 4 bit ALU and function generator (active HIGH data convention).
    // inputs: [A0,A1,A2,A3, B0,B1,B2,B3, S0,S1,S2,S3, M, Cn]
    // outputs: [F0,F1,F2,F3, Cn4, P, G, AeqB]
    // M=1: logic operations. M=0: arithmetic operations.
    // Cn is carry in (active HIGH for arithmetic; ignored for logic).
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
      // Arithmetic operations (Cn is carry in)
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

  _evaluateCarryLookahead32(comp, gate) {
    // 74882: 32 bit lookahead carry generator. Combines the propagate/generate
    // signals of eight 4 bit ALU groups (e.g. eight 74x181/74x881, = 32 bits) and
    // produces the anticipated carry into each 8 bit boundary in one gate delay.
    // inputs:  [P0,G0,P1,G1,P2,G2,P3,G3,P4,G4,P5,G5,P6,G6,P7,G7, Cn]
    // outputs: [Cn8, Cn16, Cn24, Cn32]
    //
    // Polarity note: the real SN74AS882 takes ACTIVE-LOW carry propagate/generate
    // (P̄, Ḡ) and a HIGH Cn, and drives HIGH carry outputs. This model uses
    // ACTIVE-HIGH P/G to match the rest of the in-sim 74x181 family: ALU_4BIT
    // (_evaluateAlu4Bit) emits active-high P (all bits propagate) and G (any bit
    // generates), and CARRY_LOOKAHEAD (74x182) consumes them active-high, so the
    // 882 chains straight off the sim's ALUs. Under one consistent polarity the
    // Boolean carry values are identical to the datasheet part.
    //
    // The carry out of group i is c(i+1) = G_i + P_i·c_i, with c0 = Cn. The four
    // outputs are the carries crossing the 8/16/24/32 bit boundaries, i.e. the
    // carries out of groups 1, 3, 5 and 7. Computing the group carries in sequence
    // yields the same Boolean result the datasheet's flattened lookahead does.
    const bits = this._readGateInputs(comp, gate.inputs);
    let c = bits[16]; // Cn
    const cout = new Array(8);
    for (let i = 0; i < 8; i++) {
      const p = bits[2 * i];
      const g = bits[2 * i + 1];
      c = g | (p & c);
      cout[i] = c;
    }
    return this._drivePinBits(comp, gate.outputs, [cout[1], cout[3], cout[5], cout[7]]);
  }

  _evaluateFullAdderDual(comp, gate) {
    // 74183: Dual carry save full adder.
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
    // 74184: BCD to binary converter (ROM based, open collector, 5 input).
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
    // 74185: 6 bit binary-to-BCD converter (ROM based, open collector).
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
      // Write (non inverted) data to memory
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
    // 74195: 4 bit parallel access shift register with JK̄ serial input, async CLR.
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

  _evaluateShiftReg8BitBus4034(comp, gate) {
    // CD4034B: 8-stage static bidirectional parallel/serial I/O bus register.
    // Source: TI/Harris CD4034B SCHS037B (Rev. June 2003), p.1 description +
    //   p.4 "TRUTH TABLE FOR REGISTER INPUT-LEVELS" + Fig.11 register-stage logic.
    // inputs:  [CLK, PS, AS, AB, AE, SER,
    //           A1,A2,A3,A4,A5,A6,A7,A8, B1,B2,B3,B4,B5,B6,B7,B8]
    // outputs: [A1,A2,A3,A4,A5,A6,A7,A8, B1,B2,B3,B4,B5,B6,B7,B8]  (bidirectional)
    //   stage i (0=LSB end / serial in) maps to A(i+1) and B(i+1); the serial
    //   chain enters stage 0 and shifts toward stage 7 (= A8/B8, the serial out).
    //   PS  (P/S):  HIGH = parallel mode, LOW = serial mode.
    //   AS  (A/S):  HIGH = asynchronous, LOW = synchronous (parallel mode only;
    //               serial mode is internally forced synchronous).
    //   AB  (A/B):  HIGH → A lines are inputs, B lines are outputs;
    //               LOW  → A lines are outputs, B lines are inputs.
    //   AE  ("A" ENABLE): gates the A side only. When A is the output side it must
    //               be HIGH to drive (else A outputs Hi-Z); when A is the input
    //               side, AE LOW disables the A input → the register recirculates
    //               (holds) instead of loading.
    //   B side has no enable: it always drives when it is the output side and
    //               always loads when it is the input side.
    const [clkN, psN, asN, abN, aeN, serN] = gate.inputs;
    const aInN = gate.inputs.slice(6, 14);   // A1..A8 as inputs
    const bInN = gate.inputs.slice(14, 22);  // B1..B8 as inputs
    const aOut = gate.outputs.slice(0, 8);   // A1..A8 as outputs
    const bOut = gate.outputs.slice(8, 16);  // B1..B8 as outputs
    const state = this._getSeqState(comp, aOut[0] + '_cd4034', { q: [0,0,0,0,0,0,0,0], prevClk: 0 });

    const clk = this._readPinBit(comp, clkN);
    const ps  = this._readPinBit(comp, psN);
    const as  = this._readPinBit(comp, asN);
    const ab  = this._readPinBit(comp, abN);
    const ae  = this._readPinBit(comp, aeN);
    const rising = (state.prevClk === 0 && clk === 1);

    if (ps === 0) {
      // SERIAL mode: shift on the rising clock edge (always synchronous).
      if (rising) {
        for (let i = 7; i > 0; i--) state.q[i] = state.q[i-1];
        state.q[0] = this._readPinBit(comp, serN);
      }
    } else {
      // PARALLEL mode. Input side is A (when AB=1, gated by AE) or B (when AB=0).
      let data = null; // null → recirculate / hold
      if (ab === 1) {
        if (ae === 1) data = aInN.map(n => this._readPinBit(comp, n));
        // ae===0 → A input disabled → recirculation (hold), data stays null
      } else {
        data = bInN.map(n => this._readPinBit(comp, n));
      }
      if (data) {
        if (as === 1) {
          state.q = data;            // asynchronous: transparent (level) load
        } else if (rising) {
          state.q = data;            // synchronous: load on rising clock edge
        }
      }
    }
    state.prevClk = clk;

    // Drive the output side; the input side is left Hi-Z (high-impedance input).
    let changed = false;
    if (ab === 1) {
      // B is the output side (always driven); A side Hi-Z.
      if (this._drivePinsHighZ(comp, aOut)) changed = true;
      if (this._drivePinBits(comp, bOut, state.q)) changed = true;
    } else {
      // A is the output side (driven only when AE=HIGH); B side Hi-Z.
      if (this._drivePinsHighZ(comp, bOut)) changed = true;
      if (ae === 1) {
        if (this._drivePinBits(comp, aOut, state.q)) changed = true;
      } else {
        if (this._drivePinsHighZ(comp, aOut)) changed = true;
      }
    }
    return changed;
  }

  _evaluateShiftReg8BitDualRank952(comp, gate) {
    // 74x952 (National Semiconductor DM74LS952): dual-rank 8-bit TRI-STATE I/O
    // shift register. Two 8-bit ranks sit in parallel:
    //   Upper register "A"  — the I/O register, connected to the 8 bidirectional
    //                         I/O pins through TRI-STATE buffers.
    //   Lower register "B"  — the serial shift register (called "S"/"B" in the
    //                         datasheet), with serial in Is and serial out Os.
    // Every operation is edge-triggered on the rising CLK; the five active-LOW
    // DIS control lines pick the mode and are independent of the clock level.
    //
    // Source: National Semiconductor, "DM74LS952 Dual Rank 8-Bit TRI-STATE Shift
    //   Registers", in "National Semiconductor LS/S TTL Logic Databook" (1989),
    //   p. 2-505..2-508 (doc TL/F/6437). [Online]. Available:
    //   http://bitsavers.org/components/national/_dataBooks/1989_National_LS_S_TTL_Logic_Databook.pdf
    //   Verified: Connection Diagram terminal assignment (p. 2-505) + Function
    //   Table I (p. 2-508), read as a 300-dpi PDF page image (issues.md C4),
    //   NOT cloned from a sibling (issues.md C2). Pin map (18-pin DIP):
    //   1 DISo, 2 Is, 3 DISi, 4 DISTU, 5 DISTD, 6 DISs, 7 Os, 8 CLK, 9 GND,
    //   10 I/O8, 11 I/O7, 12 I/O6, 13 I/O5, 14 I/O4, 15 I/O3, 16 I/O2, 17 I/O1,
    //   18 VCC.
    //
    // inputs:  [CLK, Is, DISo, DISi, DISTU, DISTD, DISs, I/O1..I/O8]
    // outputs: [Os, I/O1..I/O8]   — the eight I/O pins are bidirectional, so each
    //   is listed in BOTH inputs (read the bus when the chip releases it) and
    //   outputs (drive the bus from register A). Same convention as the CD4034.
    const [clkN, isN, disoN, disiN, distuN, distdN, dissN] = gate.inputs;
    const ioIn  = gate.inputs.slice(7, 15);    // I/O1..I/O8 as inputs
    const osOut = gate.outputs[0];
    const ioOut = gate.outputs.slice(1, 9);    // I/O1..I/O8 as outputs
    const state = this._getSeqState(comp, osOut + '_952',
      { A: [0,0,0,0,0,0,0,0], B: [0,0,0,0,0,0,0,0], prevClk: 0 });

    const clk   = this._readPinBit(comp, clkN);
    const diso  = this._readPinBit(comp, disoN);
    const disi  = this._readPinBit(comp, disiN);
    const distu = this._readPinBit(comp, distuN);
    const distd = this._readPinBit(comp, distdN);
    const diss  = this._readPinBit(comp, dissN);
    const rising = (state.prevClk === 0 && clk === 1);

    if (rising) {
      const A = state.A, B = state.B;                       // pre-edge contents
      const I = ioIn.map(n => this._readPinBit(comp, n));   // levels on I/O pins
      const d = this._readPinBit(comp, isN);                // serial input bit

      // All DIS lines are active LOW. Modes (from Function Table I):
      const inp   = (disi  === 0);                       // input:    A ← I/O pins
      const clear = (distu === 0 && distd === 0);        // sync clear both ranks
      const tup   = (distu === 0 && distd === 1);        // transfer up:   A ← B
      const tdn   = (distd === 0 && distu === 1);        // transfer down: B ← A
      const shift = (diss  === 0 && distd === 1);         // shift B (Is→B1); a
                                                          // transfer-down wins.

      // Upper register "A". Input dominates; input + transfer-up is the "DOR"
      // (data-OR) mode where A ← I/O OR B. Under clear, an active input still
      // loads the I/O pins into A (only B is forced to 0).
      const nA = new Array(8);
      for (let i = 0; i < 8; i++) {
        if (clear)           nA[i] = inp ? I[i] : 0;
        else if (inp && tup) nA[i] = I[i] | B[i];       // DOR
        else if (inp)        nA[i] = I[i];
        else if (tup)        nA[i] = B[i];
        else                 nA[i] = A[i];              // hold
      }

      // Lower register "B".
      let nB;
      if (clear)      nB = [0,0,0,0,0,0,0,0];
      else if (tdn)   nB = A.slice();                    // transfer down A → B
      else if (shift) nB = [d, B[0],B[1],B[2],B[3],B[4],B[5],B[6]];  // Is → B1
      else            nB = B.slice();                    // hold

      state.A = nA;
      state.B = nB;
    }
    state.prevClk = clk;

    let changed = false;
    // Serial output Os = last stage of the lower shift register (B8); always driven.
    if (this._drivePinBit(comp, osOut, state.B[7])) changed = true;
    // I/O pins: register A drives the bus only when output-enabled (DISo LOW) and
    // NOT in input mode (DISi HIGH — "input disable dominates over output disable").
    // Otherwise the pins are high-impedance so an external source can drive them.
    if (diso === 0 && disi === 1) {
      if (this._drivePinBits(comp, ioOut, state.A)) changed = true;
    } else {
      if (this._drivePinsHighZ(comp, ioOut)) changed = true;
    }
    return changed;
  }

  _evaluateShiftReg8BitDualRank964(comp, gate) {
    // 74x964 (SN74ALS964): dual-rank 8-bit shift register with 3-state I/O bus.
    // Two 8-bit ranks share one rising-edge clock:
    //   Reg 1 = the parallel I/O register, tied to the 8 bidirectional ports
    //           A/QA..H/QH (bit 0 = A/QA … bit 7 = H/QH).
    //   Reg 2 = the shift register: SERIN enters the A end, data moves toward the
    //           H end, and SEROUT continuously reflects the H stage (bit 7).
    // Active-LOW mode controls, each enabling one data path on the rising edge:
    //   GIN  L → load Reg 1 from the I/O ports (ports act as inputs)
    //   G2-1 L → copy Reg 2 → Reg 1
    //   G1-2 L → copy Reg 1 → Reg 2   (takes priority over GSH)
    //   GSH  L → shift Reg 2 (SERIN → bit0 → … → bit7)
    // GIN and G2-1 both low load Reg 1 with the OR of the I/O ports and Reg 2.
    // G2-1 and G1-2 both low exchange the two ranks (both read pre-edge values).
    // Clears (active HIGH): ACLR is asynchronous (immediate, dominates); SCLR is
    // synchronous. SCLR zeroes the Reg 2 data path, so a Reg-1 load from the I/O
    // ports still happens while Reg 2 is cleared (function-table bottom row).
    // OE is active LOW and gates ONLY the port outputs; SEROUT is always driven.
    //
    // Source: Texas Instruments, "SN54ALS963, SN54ALS964, SN74ALS963, SN74ALS964
    //   Dual-Rank 8-Bit Shift Registers With 3-State Outputs", doc D2887, Nov 1985
    //   revised May 1986 (Product Preview), in "The TTL Data Book, Volume 3 —
    //   Advanced Low-Power Schottky, Advanced Schottky" (1986), pp. 2-783..2-791.
    //   [Online]. Available:
    //   http://bitsavers.org/components/ti/_dataBooks/1986_TI_ALS_AS_Logic_Data_Book.pdf
    //   Verified: 'ALS964 DW/NT-package terminal assignment (p. 2-783) + 'ALS964
    //   Function Table (p. 2-789), read as 300/400-dpi PDF page images (issues.md
    //   C4), NOT cloned from the 74x952/963 siblings (issues.md C2). The hand-
    //   entered stub pinout was wrong (missing pins 1-4, invented QA0..QA3) and is
    //   corrected here. Verified 20-pin DIP map: 1 OE, 2 SERIN, 3 GIN, 4 G2-1,
    //   5 SCLR, 6 G1-2, 7 GSH, 8 SEROUT, 9 CLK, 10 GND, 11 ACLR, 12 H/QH, 13 G/QG,
    //   14 F/QF, 15 E/QE, 16 D/QD, 17 C/QC, 18 B/QB, 19 A/QA, 20 VCC.
    //
    // inputs:  [OE, GIN, G2-1, G1-2, GSH, CLK, ACLR, SCLR, SERIN,
    //           A/QA, B/QB, C/QC, D/QD, E/QE, F/QF, G/QG, H/QH]  (ports as inputs)
    // outputs: [SEROUT, A/QA, B/QB, C/QC, D/QD, E/QE, F/QF, G/QG, H/QH]
    //   The eight I/O ports are bidirectional, so each is listed in BOTH inputs
    //   (read the bus when released) and outputs (drive it from Reg 1), exactly
    //   like the CD4034 / 74x952.
    const [oeN, ginN, g21N, g12N, gshN, clkN, aclrN, sclrN, serN] = gate.inputs;
    const portIn  = gate.inputs.slice(9, 17);   // A/QA..H/QH read as inputs
    const serOut  = gate.outputs[0];
    const portOut = gate.outputs.slice(1, 9);   // A/QA..H/QH driven as outputs
    const state = this._getSeqState(comp, serOut + '_964',
      { reg1: [0,0,0,0,0,0,0,0], reg2: [0,0,0,0,0,0,0,0], prevClk: 0 });

    const oe   = this._readPinBit(comp, oeN);
    const gin  = this._readPinBit(comp, ginN);
    const g21  = this._readPinBit(comp, g21N);
    const g12  = this._readPinBit(comp, g12N);
    const gsh  = this._readPinBit(comp, gshN);
    const clk  = this._readPinBit(comp, clkN);
    const aclr = this._readPinBit(comp, aclrN);
    const sclr = this._readPinBit(comp, sclrN);
    const rising = (state.prevClk === 0 && clk === 1);

    if (aclr === 1) {
      // Asynchronous clear dominates and needs no clock edge.
      state.reg1 = [0,0,0,0,0,0,0,0];
      state.reg2 = [0,0,0,0,0,0,0,0];
    } else if (rising) {
      const r1 = state.reg1, r2 = state.reg2;              // pre-edge contents
      const io = portIn.map(n => this._readPinBit(comp, n));
      const ser = this._readPinBit(comp, serN);

      // ── next Reg 2 ──
      let n2;
      if (sclr === 1)     n2 = [0,0,0,0,0,0,0,0];           // synchronous clear
      else if (g12 === 0) n2 = r1.slice();                  // copy Reg 1 → Reg 2
      else if (gsh === 0) n2 = [ser, r2[0], r2[1], r2[2], r2[3], r2[4], r2[5], r2[6]]; // shift
      else                n2 = r2.slice();                  // hold

      // ── next Reg 1 ──  (OR of the enabled sources; SCLR zeroes the Reg 2 source)
      let n1;
      if (gin === 1 && g21 === 1 && sclr === 0) {
        n1 = r1.slice();                                     // hold
      } else {
        n1 = [0,0,0,0,0,0,0,0];
        if (gin === 0)               for (let i = 0; i < 8; i++) n1[i] |= io[i];
        if (g21 === 0 && sclr === 0) for (let i = 0; i < 8; i++) n1[i] |= r2[i];
      }

      state.reg1 = n1;
      state.reg2 = n2;
    }
    state.prevClk = clk;

    // ── drive outputs ──
    let changed = false;
    // SEROUT continuously reflects the H stage (Reg 2 bit 7); never 3-stated.
    if (this._drivePinBit(comp, serOut, state.reg2[7])) changed = true;
    // I/O ports: high-impedance while used as inputs (GIN low) or output-disabled
    // (OE high); otherwise Reg 1 drives them.
    if (gin === 0 || oe === 1) {
      if (this._drivePinsHighZ(comp, portOut)) changed = true;
    } else {
      if (this._drivePinBits(comp, portOut, state.reg1)) changed = true;
    }
    return changed;
  }

  _evaluateShiftReg8BitJK(comp, gate) {
    // 74199: 8 bit shift register with JK̄ serial input, async CLR, parallel load.
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
    // 74206: 256×1 RAM with open collector output.
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
    // 74219: 16×4 RAM with non inverting 3-state outputs.
    // inputs: [A0..A3, D1..D4, CS, WE]  outputs: [Q1..Q4]
    // CS=0, WE=0: write; CS=0, WE=1: read (non inverting); CS=1: HiZ
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

  _evaluateBCDDecimalHi(comp, gate) {
    // CD4028: BCD-to-decimal / binary-to-octal decoder with ACTIVE-HIGH outputs
    // (the active-LOW sibling is BCD_DECIMAL / 7442). inputs: [A, B, C, D]
    // (A = LSB ... D = MSB), outputs: [Y0..Y9]. The one selected output is HIGH,
    // all others LOW. Invalid BCD codes (10-15): every output LOW (verified vs
    // TI/Harris CD4028B SCHS033C Table I truth table). For 3-to-8 octal use,
    // drive A/B/C and hold D LOW: outputs 0-7 give the octal decode.
    const [a,b,c,d] = this._readGateInputs(comp, gate.inputs);
    const sel = a | (b << 1) | (c << 2) | (d << 3);
    let changed = false;
    for (let i = 0; i < 10; i++) {
      const bit = (sel < 10 && i === sel) ? 1 : 0;
      if (this._drivePinBit(comp, gate.outputs[i], bit)) changed = true;
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

  _evaluateShiftRegDual4Sipo4015(comp, gate) {
    // CD4015: two independent 4-stage serial-in / parallel-out shift registers.
    // Per register: positive-edge clock (CP), one serial Data input (D), and an
    // active-HIGH asynchronous overriding Master Reset (MR). The level on D is
    // loaded into Q0 on each LOW->HIGH CP transition while the stored bits move
    // one stage along (Q0->Q1->Q2->Q3). MR=1 forces Q0..Q3 LOW regardless of CP.
    // Verified vs TI CD54HC4015/CD74HC4015 truth table & functional diagram.
    // inputs:  ['1CP','1D','1MR','2CP','2D','2MR']
    // outputs: ['1Q0','1Q1','1Q2','1Q3','2Q0','2Q1','2Q2','2Q3']
    const [cp1, d1, mr1, cp2, d2, mr2] = gate.inputs;
    let changed = false;
    if (this._evalSipo4Stage(comp, cp1, d1, mr1, gate.outputs.slice(0, 4))) changed = true;
    if (this._evalSipo4Stage(comp, cp2, d2, mr2, gate.outputs.slice(4, 8))) changed = true;
    return changed;
  }

  _evalSipo4Stage(comp, cpName, dName, mrName, qNames) {
    // One 4015 register section. qNames = [Q0, Q1, Q2, Q3].
    const state = this._getSeqState(comp, qNames[0],
      { stages: [0, 0, 0, 0], prevClk: 0 });

    const mr = this._readPinBit(comp, mrName);
    if (mr === 1) {
      // Asynchronous overriding reset: clear immediately, ignore the clock.
      state.stages = [0, 0, 0, 0];
      state.prevClk = this._readPinBit(comp, cpName);
      return this._drivePinBits(comp, qNames, state.stages.slice());
    }

    const clk = this._readPinBit(comp, cpName);
    if (state.prevClk === 0 && clk === 1) {
      const data = this._readPinBit(comp, dName);
      state.stages.pop();          // drop Q3 (oldest stage)
      state.stages.unshift(data);  // D enters Q0; everything else shifts up
    }
    state.prevClk = clk;
    return this._drivePinBits(comp, qNames, state.stages.slice());
  }

  _evaluateReg4BitTri(comp, gate) {
    // 74173: 4 bit D register with tri state outputs. Synchronous CLR (default).
    // IE1=0 AND IE2=0: data enabled (latch on rising CLK edge).
    // OE1=0 AND OE2=0: outputs enabled; otherwise HiZ.
    // CLR=1 (active HIGH): clears register. Synchronous by default; set
    //   gate.asyncReset:true for the CD4076-style ASYNCHRONOUS RESET (clears
    //   immediately, independent of the clock — verified vs TI CD4076B SCHS058C
    //   truth table & Fig.8 logic diagram). The 74173 entry leaves the flag unset.
    // inputs: [1D, 2D, 3D, 4D, CLK, CLR, IE1, IE2, OE1, OE2]
    // outputs: [1Q, 2Q, 3Q, 4Q]
    const [d1n,d2n,d3n,d4n,clkN,clrN,ie1N,ie2N,oe1N,oe2N] = gate.inputs;
    const [q1n,q2n,q3n,q4n] = gate.outputs;
    const state = this._getSeqState(comp, q1n,
      { q: [0,0,0,0], prevClk: 0 });

    const clk = this._readPinBit(comp, clkN);
    const clr = this._readPinBit(comp, clrN);
    if (gate.asyncReset && clr === 1) {
      // Asynchronous active-HIGH reset: clear regardless of clock state.
      state.q = [0,0,0,0];
    } else if (state.prevClk === 0 && clk === 1) {
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
    // 74174: Hex D flip flop with asynchronous active LOW clear.
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
    // 74175: Quad D flip flop with asynchronous active LOW clear.
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
    // LOAD=0 (active LOW, ASYNCHRONOUS): the outputs follow A,B,C,D immediately,
    //   independent of the clock (TI SDLS072: "Asynchronously Presettable with
    //   Load Control"). Fixed 2026-07-05 — this primitive previously loaded only
    //   on the rising CLK edge, which is wrong for the '191. See issues.md C105.
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

    if (load === 0) {
      // Asynchronous parallel load: outputs follow A-D regardless of the clock.
      state.count = this._readPinBit(comp, aN)
        | (this._readPinBit(comp, bN) << 1)
        | (this._readPinBit(comp, cN) << 2)
        | (this._readPinBit(comp, dN) << 3);
    } else if (state.prevClk === 0 && clk === 1 && cten === 0) {
      if (du === 0) {
        state.count = (state.count + 1) & 15;
      } else {
        state.count = (state.count - 1 + 16) & 15;
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

  _evaluateCounterUpDown4029(comp, gate) {
    // CD4029: CMOS presettable up/down counter, binary OR BCD-decade selectable.
    // Single CLOCK. Verified against TI/Harris SCHS034C (CD4029B datasheet).
    //   PE   (PRESET ENABLE, active HIGH, ASYNCHRONOUS): while HIGH the JAM inputs
    //        J1-J4 are loaded into Q1-Q4 continuously, independent of the clock.
    //   CE   (CARRY IN / CLOCK ENABLE, active LOW): LOW enables counting; HIGH (or
    //        PE HIGH) inhibits advance. Advance happens on the POSITIVE clock edge.
    //   U/D  (UP/DOWN): HIGH = count up, LOW = count down.
    //   B/D  (BINARY/DECADE): HIGH = binary (0-15), LOW = BCD decade (0-9).
    //   CARRY OUT (active LOW): normally HIGH; goes LOW at terminal count (max in
    //        UP mode, 0 in DOWN mode) provided CARRY IN (CE) is LOW. It is purely
    //        combinational on the current count, so it behaves like a clock-enable
    //        ripple line for cascading (see datasheet Fig 17).
    // Note: unlike the 74191 COUNTER_UPDOWN primitive, the load is asynchronous and
    // active HIGH, the direction polarity is inverted, and decade mode is supported.
    const [j1N,j2N,j3N,j4N,clkN,ceN,udN,peN,bdN] = gate.inputs;
    const [q1Name,q2Name,q3Name,q4Name,coName] = gate.outputs;
    const state = this._getSeqState(comp, q1Name, { count: 0, prevClk: 0 });

    this._drivePinBits(comp, [q1Name,q2Name,q3Name,q4Name],
      [state.count&1,(state.count>>1)&1,(state.count>>2)&1,(state.count>>3)&1]);

    const clk = this._readPinBit(comp, clkN);
    const ce  = this._readPinBit(comp, ceN);
    const ud  = this._readPinBit(comp, udN);
    const pe  = this._readPinBit(comp, peN);
    const bd  = this._readPinBit(comp, bdN);

    if (pe === 1) {
      // Asynchronous jam load (tracks JAM inputs while PE is HIGH).
      state.count = this._readPinBit(comp, j1N)
        | (this._readPinBit(comp, j2N) << 1)
        | (this._readPinBit(comp, j3N) << 2)
        | (this._readPinBit(comp, j4N) << 3);
    } else if (state.prevClk === 0 && clk === 1 && ce === 0) {
      // Count on positive clock edge when enabled.
      if (ud === 1) {            // up
        if (bd === 1) state.count = (state.count + 1) & 15;       // binary 0-15
        else          state.count = (state.count >= 9) ? 0 : state.count + 1; // decade 0-9
      } else {                   // down
        if (bd === 1) state.count = (state.count - 1 + 16) & 15;  // binary 0-15
        else          state.count = (state.count <= 0) ? 9 : state.count - 1; // decade 0-9
      }
    }
    state.prevClk = clk;

    const maxCount = (bd === 1) ? 15 : 9;
    const atTerminal = (ud === 1) ? (state.count === maxCount) : (state.count === 0);
    const carryOut = (atTerminal && ce === 0) ? 0 : 1; // active LOW, normally HIGH

    let changed = this._drivePinBits(comp, [q1Name,q2Name,q3Name,q4Name],
      [state.count&1,(state.count>>1)&1,(state.count>>2)&1,(state.count>>3)&1]);
    if (this._drivePinBit(comp, coName, carryOut)) changed = true;
    return changed;
  }

  _evaluateCounterUpDownTri779(comp, gate) {
    // 74F779: fully synchronous 8-bit up/down binary counter with one set of
    // multiplexed 3-STATE I/O pins (the count outputs and the load inputs share
    // the same eight pins). All actions happen on the rising clock edge; the mode
    // is chosen by S1/S0, counting is gated by CET (active LOW), and the output
    // buffers are gated by OE (active LOW). TC is active LOW lookahead carry.
    //   inputs:  [CP, S1, S0, CETn, OEn, IO0..IO7]   (IO read as load inputs)
    //   outputs: [IO0..IO7, TCn]                      (IO0 = LSB)
    // Source: Fairchild 74F779 DS009593 function table + logic diagram (see the
    //   chip entry header in js/chips/chips39.js for the full IEEE citation).
    const [cpN, s1N, s0N, cetN, oeN] = gate.inputs;
    const ioInN = gate.inputs.slice(5, 13);   // IO0..IO7 as inputs (parallel load)
    const ioOut = gate.outputs.slice(0, 8);   // IO0..IO7 as driven outputs
    const tcN   = gate.outputs[8];            // TC (active LOW)
    const state = this._getSeqState(comp, ioOut[0] + '_f779', { count: 0, prevClk: 0 });

    const cp  = this._readPinBit(comp, cpN);
    const s1  = this._readPinBit(comp, s1N);
    const s0  = this._readPinBit(comp, s0N);
    const cet = this._readPinBit(comp, cetN);   // active LOW: 0 = count enabled
    const oe  = this._readPinBit(comp, oeN);     // active LOW: 0 = outputs driven
    const rising = (state.prevClk === 0 && cp === 1);

    if (rising) {
      if (s1 === 0 && s0 === 0) {
        // Parallel load: capture the level present on each I/O pin (IO0 = LSB).
        let v = 0;
        for (let i = 0; i < 8; i++) v |= this._readPinBit(comp, ioInN[i]) << i;
        state.count = v;
      } else if (cet === 0) {
        if (s1 === 1 && s0 === 0)      state.count = (state.count + 1) & 0xFF; // up
        else if (s1 === 0 && s0 === 1) state.count = (state.count - 1) & 0xFF; // down
        // S1=H,S0=H → hold (no change)
      }
      // CET HIGH (and not a load) → hold.
    }
    state.prevClk = cp;

    // Terminal Count (active LOW): asserted only while counting is enabled and the
    // counter sits at the end of its range for the active direction.
    let tcBit = 1;
    if (cet === 0) {
      if (s1 === 1 && s0 === 0 && state.count === 0xFF) tcBit = 0;      // up, all 1s
      else if (s1 === 0 && s0 === 1 && state.count === 0x00) tcBit = 0; // down, all 0s
    }

    let changed = false;
    if (oe === 1) {
      // OE HIGH → I/O port is high-impedance and acts as an input bus.
      if (this._drivePinsHighZ(comp, ioOut)) changed = true;
    } else {
      const bits = [];
      for (let i = 0; i < 8; i++) bits.push((state.count >> i) & 1);
      if (this._drivePinBits(comp, ioOut, bits)) changed = true;
    }
    if (this._drivePinBits(comp, [tcN], [tcBit])) changed = true;
    return changed;
  }

  _evaluateCounterProgModN4018(comp, gate) {
    // Motorola MC4018 ("74418") Programmable Modulo-N Hexadecimal Counter.
    // Core: 4-bit synchronous binary up counter, Q0 = LSB ... Q3 = MSB.
    // Verified against Motorola "Programmable Modulo-N Counters", MC4316 thru
    // MC4319 / MC4016 thru MC4019 data sheet (see chips66.js header comment).
    //   MR  (pin 10, active LOW, ASYNCHRONOUS master reset): LOW forces count 0
    //       and holds it (dominant over preset). Datasheet: a logic 0 on MR and
    //       PE enters all zeros and stops counting.
    //   PE  (pin 3, active LOW, ASYNCHRONOUS parallel load): LOW (with MR HIGH)
    //       jams D0-D3 into the counter, independent of the clock.
    //   Gate (pin 4, active HIGH, SYNCHRONOUS load enable): when HIGH, the rising
    //       clock edge loads D0-D3 instead of counting up. The brief 3-page data
    //       sheet gives no Gate truth table; the clock is ungated in the logic
    //       diagram and Gate sits in the data/load path, so it is modeled as the
    //       synchronous-load twin of the asynchronous PE. The exact Gate/internal-
    //       carry cascade feedback is simplified (see issues.md).
    //   Bus (pin 12): carry output = (count == max) AND R. Active HIGH.
    //   R   (pin 13, active HIGH, internal ~2.2k pull-up to VCC): gates Bus.
    //       Floating reads HIGH (carry enabled), matching the on-chip pull-up.
    // gate.mod selects the modulus (16 for the MC4018 hex part; 10 for the
    // MC4016 decade sibling, if added later). Defaults to 16.
    const [clkN, peN, gateN, mrN, d0N, d1N, d2N, d3N, rN] = gate.inputs;
    const [q0Name, q1Name, q2Name, q3Name, busName] = gate.outputs;
    const mod = (gate.mod && gate.mod > 1) ? gate.mod : 16;
    const state = this._getSeqState(comp, q0Name, { count: 0, prevClk: 0 });

    const clk  = this._readPinBit(comp, clkN);
    const pe   = this._readPinBit(comp, peN);
    const gt   = this._readPinBit(comp, gateN);
    const mr   = this._readPinBit(comp, mrN);
    const data = this._readPinBit(comp, d0N)
      | (this._readPinBit(comp, d1N) << 1)
      | (this._readPinBit(comp, d2N) << 2)
      | (this._readPinBit(comp, d3N) << 3);

    if (mr === 0) {
      // Asynchronous master reset, dominant.
      state.count = 0;
    } else if (pe === 0) {
      // Asynchronous parallel load, tracks D while PE is LOW.
      state.count = data % mod;
    } else if (state.prevClk === 0 && clk === 1) {
      // Rising clock edge: synchronous load when Gate HIGH, else count up.
      if (gt === 1) state.count = data % mod;
      else          state.count = (state.count + 1) % mod;
    }
    state.prevClk = clk;

    // R (pin 13) has an internal pull-up: floating reads HIGH (carry enabled).
    const vR = this._readPinVoltage(comp, rN);
    const r  = (vR === null) ? 1 : (vR > this._specFor(comp).VTH ? 1 : 0);
    const bus = (state.count === (mod - 1) && r === 1) ? 1 : 0;

    let changed = this._drivePinBits(comp, [q0Name, q1Name, q2Name, q3Name],
      [state.count & 1, (state.count >> 1) & 1, (state.count >> 2) & 1, (state.count >> 3) & 1]);
    if (this._drivePinBit(comp, busName, bus)) changed = true;
    return changed;
  }

  _evaluateTriNotLo(comp, gate) {
    // 74240-style: inverting tri state buffer with active LOW output enable.
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
    // If chipDef.openCollector, data outputs sink only (Hi-Z on logic 1, pull to GND on 0).
    const oe  = this._readPinBit(comp, gate.inputs[17]);
    const dir = this._readPinBit(comp, gate.inputs[16]);
    const oc  = !!(comp.chipDef && comp.chipDef.openCollector);
    const drive = (pin, bit) => oc ? this._drivePinOC(comp, pin, bit) : this._drivePinBit(comp, pin, bit);
    let changed = false;
    if (oe !== 0) {
      if (this._drivePinsHighZ(comp, gate.outputs)) changed = true;
    } else if (dir === 1) {
      for (let i = 0; i < 8; i++) {
        if (this._drivePinHighZ(comp, gate.outputs[i])) changed = true;
      }
      for (let i = 0; i < 8; i++) {
        const bit = this._readPinBit(comp, gate.inputs[i]);
        if (drive(gate.outputs[8 + i], bit)) changed = true;
      }
    } else {
      for (let i = 0; i < 8; i++) {
        const bit = this._readPinBit(comp, gate.inputs[8 + i]);
        if (drive(gate.outputs[i], bit)) changed = true;
      }
      for (let i = 0; i < 8; i++) {
        if (this._drivePinHighZ(comp, gate.outputs[8 + i])) changed = true;
      }
    }
    return changed;
  }

  _evaluateBusXcvr10BitDualTri(comp, gate) {
    // 74x861 (non-inverting) / 74x862 (inverting): 10 bit bus transceiver with
    // dual active-LOW output enables and NO direction pin. gate.invert opt-in
    // (true => data complemented as it crosses, 74x862); defaults off so the
    // 74x861 path is unchanged.
    // gate.inputs:  [A1..A10, B1..B10, OEABn, OEBAn]  (0-9 A, 10-19 B, 20 OEAB, 21 OEBA)
    // gate.outputs: [A1..A10, B1..B10]                (0-9 A, 10-19 B)
    // Function table (TI SCBS199C, p.2):
    //   OEAB=L OEBA=H -> A data to B bus (drive B from A; A side Hi-Z)
    //   OEAB=H OEBA=L -> B data to A bus (drive A from B; B side Hi-Z)
    //   OEAB=H OEBA=H -> Isolation      (both sides Hi-Z)
    //   OEAB=L OEBA=L -> "Latch A and B (A=B)": both drivers active form a feedback
    //     latch that holds the last word. Modeled here by re-driving both buses
    //     with the last value that flowed through (a faithful digital approximation
    //     of the analog bus-hold; see issues.md).
    const inv = !!gate.invert;  // 74x862 inverting variant (opt-in; '861 leaves it off)
    const oeAB = this._readPinBit(comp, gate.inputs[20]);
    const oeBA = this._readPinBit(comp, gate.inputs[21]);
    const aOut = gate.outputs.slice(0, 10);
    const bOut = gate.outputs.slice(10, 20);
    const state = this._getSeqState(comp, gate.outputs[0] + '_xcvr861', { latched: new Array(10).fill(0), lastDir: 'AB' });
    let changed = false;
    if (oeAB === 0 && oeBA !== 0) {
      // A -> B
      if (this._drivePinsHighZ(comp, aOut)) changed = true;
      const aBits = [];
      for (let i = 0; i < 10; i++) aBits.push(this._readPinBit(comp, gate.inputs[i]));
      state.latched = aBits.slice();
      state.lastDir = 'AB';
      if (this._drivePinBits(comp, bOut, inv ? aBits.map(b => b ^ 1) : aBits)) changed = true;
    } else if (oeBA === 0 && oeAB !== 0) {
      // B -> A
      if (this._drivePinsHighZ(comp, bOut)) changed = true;
      const bBits = [];
      for (let i = 0; i < 10; i++) bBits.push(this._readPinBit(comp, gate.inputs[10 + i]));
      state.latched = bBits.slice();
      state.lastDir = 'BA';
      if (this._drivePinBits(comp, aOut, inv ? bBits.map(b => b ^ 1) : bBits)) changed = true;
    } else if (oeAB === 0 && oeBA === 0) {
      // Latch: hold last word. `latched` is the source side; the destination
      // side held its (possibly inverted) copy. Re-drive both buses.
      const src = state.latched;
      const dst = inv ? src.map(b => b ^ 1) : src;
      if (this._drivePinBits(comp, aOut, state.lastDir === 'AB' ? src : dst)) changed = true;
      if (this._drivePinBits(comp, bOut, state.lastDir === 'AB' ? dst : src)) changed = true;
    } else {
      // Isolation
      if (this._drivePinsHighZ(comp, gate.outputs)) changed = true;
    }
    return changed;
  }

  _evaluateBusXcvr9BitQuadOe(comp, gate) {
    // 74x863: 9 bit non-inverting bus transceiver, 3-state, with two active-LOW
    // output-enable pins per direction (both of a pair must be LOW to enable that
    // direction). Source: TI, "SN54ABT863, SN74ABT863 9-Bit Bus Transceivers With
    // 3-State Outputs", SCBS201E (Jul 1998).
    // gate.inputs:  [A1..A9, B1..B9, OEBA1, OEBA2, OEAB1, OEAB2]
    //   indices 0-8 A, 9-17 B, 18 OEBA1, 19 OEBA2, 20 OEAB1, 21 OEAB2
    // gate.outputs: [A1..A9, B1..B9]  (0-8 A, 9-17 B)
    // FUNCTION TABLE (SCBS201E p.2):
    //   A->B enabled  when OEAB1=L and OEAB2=L
    //   B->A enabled  when OEBA1=L and OEBA2=L
    //   both enabled  -> "Latch A and B": both drivers active, holds the last word
    //   neither       -> Isolation (all Hi-Z)
    const oeba1 = this._readPinBit(comp, gate.inputs[18]);
    const oeba2 = this._readPinBit(comp, gate.inputs[19]);
    const oeab1 = this._readPinBit(comp, gate.inputs[20]);
    const oeab2 = this._readPinBit(comp, gate.inputs[21]);
    const a2b = (oeab1 === 0 && oeab2 === 0);
    const b2a = (oeba1 === 0 && oeba2 === 0);
    const aOut = gate.outputs.slice(0, 9);
    const bOut = gate.outputs.slice(9, 18);
    const state = this._getSeqState(comp, gate.outputs[0] + '_xcvr863', { latched: new Array(9).fill(0) });
    let changed = false;
    if (a2b && !b2a) {
      // A -> B
      if (this._drivePinsHighZ(comp, aOut)) changed = true;
      const aBits = [];
      for (let i = 0; i < 9; i++) aBits.push(this._readPinBit(comp, gate.inputs[i]));
      state.latched = aBits.slice();
      if (this._drivePinBits(comp, bOut, aBits)) changed = true;
    } else if (b2a && !a2b) {
      // B -> A
      if (this._drivePinsHighZ(comp, bOut)) changed = true;
      const bBits = [];
      for (let i = 0; i < 9; i++) bBits.push(this._readPinBit(comp, gate.inputs[9 + i]));
      state.latched = bBits.slice();
      if (this._drivePinBits(comp, aOut, bBits)) changed = true;
    } else if (a2b && b2a) {
      // Latch A and B (A = B): hold last word on both buses.
      if (this._drivePinBits(comp, aOut, state.latched)) changed = true;
      if (this._drivePinBits(comp, bOut, state.latched)) changed = true;
    } else {
      // Isolation
      if (this._drivePinsHighZ(comp, gate.outputs)) changed = true;
    }
    return changed;
  }

  _evaluateMux2to1Tri(comp, gate) {
    // 74257-style: 2-to-1 multiplexer with active LOW tri state output enable.
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

  _evaluateMux3BusTri(comp, gate) {
    // Signetics 74F732 (inverting) / 74F733 (non-inverting): Quad Data
    // Multiplexer. Three bidirectional 4-bit bus ports A, B, C share one set of
    // select/direction controls. (S0,S1,DIR) pick a data-flow source→dest from
    // the datasheet FUNCTION TABLE; each port has its own active-LOW Output
    // Enable. A port with OE=HIGH is Hi-Z (input only). gate.invert => a driven
    // destination carries the complement of the source (74F732); an enabled
    // port with no selected source is forced HIGH (74F732) / LOW (74F733).
    //   inputs:  [A0..A3, B0..B3, C0..C3, S0, S1, DIR, OEAn, OEBn, OECn]  (0-17)
    //   outputs: [A0..A3, B0..B3, C0..C3]                                 (0-11)
    // Bus index: 0=A, 1=B, 2=C (bus k uses input/output slots [k*4 .. k*4+3]).
    const inv = !!gate.invert;
    const s0  = this._readPinBit(comp, gate.inputs[12]);
    const s1  = this._readPinBit(comp, gate.inputs[13]);
    const dir = this._readPinBit(comp, gate.inputs[14]);
    const oe  = [ this._readPinBit(comp, gate.inputs[15]),    // OEAn
                  this._readPinBit(comp, gate.inputs[16]),    // OEBn
                  this._readPinBit(comp, gate.inputs[17]) ];  // OECn

    // Resolve source bus + destination set from (S0,S1,DIR) per FUNCTION TABLE.
    let src, dests;
    if (s0 === 1 && s1 === 1)      { src = 0; dests = [1, 2]; }                          // A → B and C (DIR x)
    else if (s0 === 0 && s1 === 0) { if (dir === 0) { src = 0; dests = [2]; } else { src = 2; dests = [0]; } } // A↔C
    else if (s0 === 0 && s1 === 1) { if (dir === 0) { src = 1; dests = [2]; } else { src = 2; dests = [1]; } } // B↔C
    else                          { if (dir === 0) { src = 0; dests = [1]; } else { src = 1; dests = [0]; } }  // A↔B (S0=1,S1=0)

    const forced = inv ? 1 : 0;
    let changed = false;
    for (let bus = 0; bus < 3; bus++) {
      const outBase = bus * 4;
      if (oe[bus] !== 0) {                          // OE HIGH → release the bus (input only)
        for (let i = 0; i < 4; i++)
          if (this._drivePinHighZ(comp, gate.outputs[outBase + i])) changed = true;
      } else if (bus !== src && dests.indexOf(bus) !== -1) {  // valid destination → follow source
        const srcBase = src * 4;
        for (let i = 0; i < 4; i++) {
          let bit = this._readPinBit(comp, gate.inputs[srcBase + i]);
          if (inv) bit = bit ? 0 : 1;
          if (this._drivePinBit(comp, gate.outputs[outBase + i], bit)) changed = true;
        }
      } else {                                      // enabled but no source selected → forced level
        for (let i = 0; i < 4; i++)
          if (this._drivePinBit(comp, gate.outputs[outBase + i], forced)) changed = true;
      }
    }
    return changed;
  }

  _evaluateAddressableLatch(comp, gate) {
    // 74259 / CD4099: 8 bit addressable latch.
    // inputs: [A0, A1, A2, D, G, CLR]
    // outputs: [Q0..Q7]
    // Default (active-LOW controls, e.g. 74x259 / 74x4724 HC259). Four modes,
    // straight from the SN74LS259B / SN74HC259 function table (CLR and G both
    // active LOW):
    //   CLR=1, G=0: addressable latch  — addressed latch follows D; others hold.
    //   CLR=1, G=1: memory             — all latches hold state.
    //   CLR=0, G=0: 8-line demux       — addressed output follows D; others 0.
    //   CLR=0, G=1: clear              — all outputs 0 (asynchronous).
    // gate.resetActiveHigh (CD4724B, 4000-series): the two control pins invert
    //   polarity AND the reset is GATED by write-disable, giving a true 1-of-8
    //   demultiplexer mode. The G slot carries WRITE DISABLE (active HIGH =
    //   inhibit writes) and the CLR slot carries RESET (active HIGH). Per the
    //   CD4724B MODE SELECTION table:
    //     WD=0,R=0: addressed follows D; unaddressed hold.
    //     WD=0,R=1: addressed follows D (active-high 8-ch demux); unaddressed → 0.
    //     WD=1,R=0: all hold.
    //     WD=1,R=1: all reset to 0.
    const [a0N,a1N,a2N,dN,gN,clrN] = gate.inputs;
    const state = this._getSeqState(comp, gate.outputs[0],
      { q: new Array(8).fill(0) });

    const addr = this._readPinBit(comp, a0N)
      | (this._readPinBit(comp, a1N) << 1)
      | (this._readPinBit(comp, a2N) << 2);

    if (gate.resetActiveHigh) {
      const wd = this._readPinBit(comp, gN);   // WRITE DISABLE, active HIGH
      const r  = this._readPinBit(comp, clrN); // RESET, active HIGH
      const d  = this._readPinBit(comp, dN);
      for (let i = 0; i < 8; i++) {
        if (i === addr) {
          if (wd === 0)     state.q[i] = d;    // addressed latch follows data
          else if (r === 1) state.q[i] = 0;    // WD=1,R=1: reset addressed bit
          // else WD=1,R=0: hold
        } else {
          if (r === 1)      state.q[i] = 0;    // unaddressed reset when R high
          // else hold previous state
        }
      }
      return this._drivePinBits(comp, gate.outputs, state.q.slice());
    }

    const clr = this._readPinBit(comp, clrN);
    const g = this._readPinBit(comp, gN);
    if (clr === 0) {
      // CLR active (LOW): every UNADDRESSED latch is held cleared to 0.
      if (g === 0) {
        // 8-line demultiplexer mode (CLR=L, G=L): the addressed output follows
        // D while all seven others stay LOW ('259 function table, row 3). Before
        // this fix the demux mode was broken — CLR=L forced ALL outputs to 0,
        // so the addressed output never went HIGH even with D=1 (issues.md C116).
        const d = this._readPinBit(comp, dN);
        for (let i = 0; i < 8; i++) state.q[i] = (i === addr) ? d : 0;
      } else {
        // Clear mode (CLR=L, G=H): all outputs LOW.
        state.q.fill(0);
      }
    } else if (g === 0) {
      // Addressable-latch mode (CLR=H, G=L): addressed latch follows D, others hold.
      state.q[addr] = this._readPinBit(comp, dN);
    }
    // else CLR=H, G=H: memory mode — every latch holds its stored value.
    return this._drivePinBits(comp, gate.outputs, state.q.slice());
  }

  _evaluateDFFOctal(comp, gate) {
    // 74273: Octal D flip flop with asynchronous active LOW clear.
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
    // 74373/74573: Octal D transparent latch with tri state outputs.
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

  _evaluateReadBackLatch(comp, gate) {
    // 74x990 family: N-bit D-type transparent READ-BACK latch.
    // The Q outputs are TRUE LOGIC outputs (always driven, never 3-stated) that
    // follow the D inputs while LE is HIGH and hold when LE is LOW. The special
    // feature is read-back: the D pins are a 3-state I/O bus. When OERB is LOW,
    // the stored latch data is driven back onto the D pins; when OERB is HIGH,
    // the D pins are released (input only). OERB does not affect the Q outputs or
    // the internal latch state.
    //   Width N = half of gate.outputs.length.
    //   inputs:  [D0..D(N-1), LE, OERB]
    //   outputs: [Q0..Q(N-1),  D0..D(N-1)]   (the D pins are listed again as the
    //            read-back drive targets, the 74x870 bidirectional-pin pattern)
    //   gate.invert === true → Q = NOT stored (reserved for the inverting 74x991;
    //            unused by the 990). Read-back always presents the stored data.
    const n      = gate.outputs.length / 2;
    const dNames = gate.inputs.slice(0, n);
    const leN    = gate.inputs[n];
    const oerbN  = gate.inputs[n + 1];
    const qOut   = gate.outputs.slice(0, n);
    const dOut   = gate.outputs.slice(n, 2 * n);
    const inv    = gate.invert === true;
    const state  = this._getSeqState(comp, gate.outputs[0],
      { q: new Array(n).fill(0) });

    const le = this._readPinBit(comp, leN);
    if (le === 1) {
      for (let i = 0; i < n; i++) state.q[i] = this._readPinBit(comp, dNames[i]);
    }

    let changed = false;
    // True logic Q outputs — always driven.
    const qVals = inv ? state.q.map(b => b ^ 1) : state.q.slice();
    if (this._drivePinBits(comp, qOut, qVals)) changed = true;

    // Read-back: OERB LOW drives the stored byte back onto the D pins; OERB HIGH
    // releases them so the D pins act as ordinary inputs.
    const oerb = this._readPinBit(comp, oerbN);
    if (oerb === 0) {
      if (this._drivePinBits(comp, dOut, state.q.slice())) changed = true;
    } else {
      for (const p of dOut) if (this._drivePinHighZ(comp, p)) changed = true;
    }
    return changed;
  }

  _evaluateDFFOctalTri(comp, gate) {
    // 74374/74574: Octal D edge triggered flip flop with tri state outputs.
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

  _evaluateDFFRegTri(comp, gate) {
    // Width-agnostic edge-triggered D register with common clock and 3-state
    // outputs. Width N = number of outputs.
    // 74x821 (10-bit, non-inverting) and 74x822 (10-bit, inverting) use this;
    // the octal 374/574 keep their own primitive.
    // inputs: [D0..D(N-1), CLK, OE], outputs: [Q0..Q(N-1)]
    // Rising CLK: each Q latches its D (gate.invert === true → Q = NOT D, the
    // '822). OE=0 (active LOW): drive Q. OE=1: HiZ.
    // OE does not affect the stored state (Function Table: NC in data on hold).
    const inv      = gate.invert === true;
    const n        = gate.outputs.length;
    const dNames   = gate.inputs.slice(0, n);
    const [clkN,oeN] = gate.inputs.slice(n);
    const state = this._getSeqState(comp, gate.outputs[0],
      { q: new Array(n).fill(0), prevClk: 0 });

    const clk = this._readPinBit(comp, clkN);
    if (state.prevClk === 0 && clk === 1) {
      for (let i = 0; i < n; i++) {
        const d = this._readPinBit(comp, dNames[i]);
        state.q[i] = inv ? (d ^ 1) : d;
      }
    }
    state.prevClk = clk;

    const oe = this._readPinBit(comp, oeN);
    if (oe === 0) {
      return this._drivePinBits(comp, gate.outputs, state.q);
    } else {
      return this._drivePinsHighZ(comp, gate.outputs);
    }
  }

  _evaluateDFFRegTriClrEn(comp, gate) {
    // Width-agnostic edge-triggered D register with async clear, clock enable,
    // and 3-state outputs gated by one or more active-LOW output enables.
    // Width N = number of outputs. Used by the 74x82x "bus interface" registers:
    //   74x825 (8-bit, non-inverting, three OE), and reusable for the 9-bit 74x823.
    // inputs: [D0..D(N-1), CLK, CLRn, ENn, OE0..OEk], outputs: [Q0..Q(N-1)]
    // Source of behavior: Fairchild/National 54ACT/74ACT825 function table.
    //   CLRn = 0            : async clear, internal Q -> 0 (dominant over clock/EN)
    //   CLRn = 1, ENn = 0   : rising CLK loads D (Q = NOT D when gate.invert)
    //   CLRn = 1, ENn = 1   : hold, clock ignored
    //   any OE input HIGH   : outputs HiZ; all OE LOW: outputs drive Q.
    // Output enable never affects the stored state (Function Table: internal Q
    // holds/loads while outputs are High-Z).
    const inv    = gate.invert === true;
    const n      = gate.outputs.length;
    const dNames = gate.inputs.slice(0, n);
    const clkN   = gate.inputs[n];
    const clrN   = gate.inputs[n + 1];
    const enN    = gate.inputs[n + 2];
    const oeNames = gate.inputs.slice(n + 3);
    const state = this._getSeqState(comp, gate.outputs[0],
      { q: new Array(n).fill(0), prevClk: 0 });

    const clr = this._readPinBit(comp, clrN);
    const clk = this._readPinBit(comp, clkN);
    const en  = this._readPinBit(comp, enN);
    if (clr === 0) {
      // Asynchronous, level-sensitive clear dominates.
      for (let i = 0; i < n; i++) state.q[i] = 0;
    } else if (state.prevClk === 0 && clk === 1 && en === 0) {
      for (let i = 0; i < n; i++) {
        const d = this._readPinBit(comp, dNames[i]);
        state.q[i] = inv ? (d ^ 1) : d;
      }
    }
    state.prevClk = clk;

    // Outputs drive only when every active-LOW output enable is LOW.
    let enabled = true;
    for (const oeN of oeNames) {
      if (this._readPinBit(comp, oeN) !== 0) { enabled = false; break; }
    }
    if (enabled) {
      return this._drivePinBits(comp, gate.outputs, state.q);
    } else {
      return this._drivePinsHighZ(comp, gate.outputs);
    }
  }

  _evaluateDFFRegTriSetInv(comp, gate) {
    // Width-agnostic positive-edge-triggered D register with async active-LOW
    // preset and INVERTING 3-state outputs. One bank (N = number of outputs);
    // the 74x876 is two of these driven independently.
    // inputs: [D0..D(N-1), CLK, PREn, OEn], outputs: [Q0n..Q(N-1)]
    // Source of behavior: TI SDAS061C function table (SN74ALS876A / SN74AS876),
    // OUTPUT column is Q̄:
    //   OE=L PRE=L  X  X  -> Q̄=L   (async preset forces internal Q=1)
    //   OE=L PRE=H  ^  H  -> Q̄=L   (rising CLK loads D=1 -> Q=1)
    //   OE=L PRE=H  ^  L  -> Q̄=H   (rising CLK loads D=0 -> Q=0)
    //   OE=L PRE=H  L  X  -> Q̄0    (hold)
    //   OE=H  X     X  X  -> Z      (output disabled; internal Q unaffected)
    // The stored state is the true Q; each output pin drives NOT Q.
    const n          = gate.outputs.length;
    const dNames     = gate.inputs.slice(0, n);
    const [clkN,preN,oeN] = gate.inputs.slice(n);
    const state = this._getSeqState(comp, gate.outputs[0],
      { q: new Array(n).fill(0), prevClk: 0 });

    const pre = this._readPinBit(comp, preN);
    const clk = this._readPinBit(comp, clkN);
    if (pre === 0) {
      // Asynchronous, level-sensitive preset dominates: internal Q -> 1.
      for (let i = 0; i < n; i++) state.q[i] = 1;
    } else if (state.prevClk === 0 && clk === 1) {
      for (let i = 0; i < n; i++) state.q[i] = this._readPinBit(comp, dNames[i]);
    }
    state.prevClk = clk;

    const oe = this._readPinBit(comp, oeN);
    if (oe === 0) {
      // Inverting outputs: drive NOT Q.
      return this._drivePinBits(comp, gate.outputs, state.q.map(b => b ^ 1));
    } else {
      return this._drivePinsHighZ(comp, gate.outputs);
    }
  }

  _evaluateDFFRegSyncClrTri(comp, gate) {
    // Width-agnostic positive-edge-triggered D register with SYNCHRONOUS clear
    // and 3-state outputs gated by one active-LOW output enable. Width N = number
    // of outputs. One instance models one 4-bit bank; the dual 74x878 (true) and
    // 74x879 (inverting) each use two of these gates.
    // inputs: [D0..D(N-1), CLK, CLRn, OE], outputs: [Q0..Q(N-1)]
    // Behavior from the SN74ALS878A/SN74ALS879A function table (see chips43.js
    // header comment). state.q holds the value driven onto the pins. On the
    // LOW->HIGH transition of CLK:
    //   CLRn = 0 : internal register -> 0 (synchronous clear, only acts on edge)
    //   CLRn = 1 : internal register  = D
    // For an inverting part (gate.invert, the '879) each output pin drives the
    // complement, so a cleared register reads HIGH and a loaded D reads NOT D.
    // CLK not rising: Q holds. OE (OC, active LOW): OE=0 drive Q, OE=1 High-Z.
    // OE never affects the stored state.
    const inv    = gate.invert === true;
    const n      = gate.outputs.length;
    const dNames = gate.inputs.slice(0, n);
    const clkN   = gate.inputs[n];
    const clrN   = gate.inputs[n + 1];
    const oeN    = gate.inputs[n + 2];
    const state = this._getSeqState(comp, gate.outputs[0],
      { q: new Array(n).fill(0), prevClk: 0 });

    const clk = this._readPinBit(comp, clkN);
    if (state.prevClk === 0 && clk === 1) {
      const clr = this._readPinBit(comp, clrN);
      if (clr === 0) {
        // Synchronous clear: internal register -> 0. An inverting output pin
        // (the '879) therefore reads HIGH; a true output (the '878) reads LOW.
        for (let i = 0; i < n; i++) state.q[i] = inv ? 1 : 0;
      } else {
        for (let i = 0; i < n; i++) {
          const d = this._readPinBit(comp, dNames[i]);
          state.q[i] = inv ? (d ^ 1) : d;
        }
      }
    }
    state.prevClk = clk;

    const oe = this._readPinBit(comp, oeN);
    if (oe === 0) {
      return this._drivePinBits(comp, gate.outputs, state.q);
    } else {
      return this._drivePinsHighZ(comp, gate.outputs);
    }
  }

  _evaluateDFFRegTriClr(comp, gate) {
    // Width-agnostic positive-edge-triggered D register with asynchronous
    // active-LOW clear and a single active-LOW 3-state output enable. No clock
    // enable (distinct from D_FF_REG_TRI_CLR_EN). Width N = number of outputs.
    // Each of the two 4-bit banks of the 74x874 uses this primitive.
    // inputs: [D0..D(N-1), CLK, CLRn, OEn], outputs: [Q0..Q(N-1)]
    // Source of behavior: Texas Instruments SN74ALS874B function table (each
    //   flip-flop): OE=L CLR=L -> Q=L (async clear, dominates clock); OE=L CLR=H
    //   rising CLK -> Q=D; OE=L CLR=H no edge -> Q holds; OE=H -> outputs HiZ.
    // gate.invert === true → Q = NOT D (the '876 inverting variant, if wired).
    // Output enable never affects the stored state.
    const inv    = gate.invert === true;
    const n      = gate.outputs.length;
    const dNames = gate.inputs.slice(0, n);
    const clkN   = gate.inputs[n];
    const clrN   = gate.inputs[n + 1];
    const oeN    = gate.inputs[n + 2];
    const state = this._getSeqState(comp, gate.outputs[0],
      { q: new Array(n).fill(0), prevClk: 0 });

    const clr = this._readPinBit(comp, clrN);
    const clk = this._readPinBit(comp, clkN);
    if (clr === 0) {
      // Asynchronous, level-sensitive clear dominates the clock.
      for (let i = 0; i < n; i++) state.q[i] = 0;
    } else if (state.prevClk === 0 && clk === 1) {
      for (let i = 0; i < n; i++) {
        const d = this._readPinBit(comp, dNames[i]);
        state.q[i] = inv ? (d ^ 1) : d;
      }
    }
    state.prevClk = clk;

    const oe = this._readPinBit(comp, oeN);
    if (oe === 0) {
      return this._drivePinBits(comp, gate.outputs, state.q);
    } else {
      return this._drivePinsHighZ(comp, gate.outputs);
    }
  }

  _evaluateDLatchRegTri(comp, gate) {
    // Width-agnostic transparent D-type LATCH bank with common latch-enable (LE)
    // and 3-state outputs. Width N = number of outputs.
    // 74x841 (10-bit, non-inverting) uses this; the octal 373/573 keep their own
    // _evaluateDLatchOctalTri primitive, and a future 74x842 (inverting D) can
    // reuse this with gate.invert.
    // inputs: [D0..D(N-1), LE, OE], outputs: [Q0..Q(N-1)]
    // Level-controlled (NOT edge-triggered):
    //   LE=1 → transparent, Q follows D (Q = NOT D when gate.invert, the '842)
    //   LE=0 → latched, Q holds its last value
    // OE=0 (active LOW): drive Q. OE=1: HiZ.
    // Per the SN74ALS841 Function Table, OE does not affect the internal latch:
    // data can still be captured while the outputs are disabled.
    const inv        = gate.invert === true;
    const n          = gate.outputs.length;
    const dNames     = gate.inputs.slice(0, n);
    const [leN, oeN] = gate.inputs.slice(n);
    const state = this._getSeqState(comp, gate.outputs[0],
      { q: new Array(n).fill(0) });

    const le = this._readPinBit(comp, leN);
    if (le === 1) {
      for (let i = 0; i < n; i++) {
        const d = this._readPinBit(comp, dNames[i]);
        state.q[i] = inv ? (d ^ 1) : d;
      }
    }

    const oe = this._readPinBit(comp, oeN);
    if (oe === 0) {
      return this._drivePinBits(comp, gate.outputs, state.q);
    } else {
      return this._drivePinsHighZ(comp, gate.outputs);
    }
  }

  _evaluateRegReadback996(comp, gate) {
    // 74x996: 8-bit D-type edge-triggered read-back latch with 3-state I/O.
    // Source of behavior: TI SN54ALS996/SN74ALS996 "8-Bit D-Type Edge-Triggered
    //   Read-Back Latches" SDAS098B, description + logic diagram, page 1-2.
    // The eight D pins are BIDIRECTIONAL (bus-structured): normally inputs, but
    // driven with the stored byte during a read-back. So each D name appears in
    // both gate.inputs (to sense external data) and gate.outputs (to drive it).
    //   inputs:  [1D..8D, ENn, RDn, CLK, CLRn, TC, OEn]  (0-7 D, 8 EN, 9 RD,
    //            10 CLK, 11 CLR, 12 T/C, 13 OE)
    //   outputs: [1Q..8Q, 1D..8D]                        (0-7 Q, 8-15 D read-back)
    // Function (all enables active LOW):
    //   CLRn = 0            : async clear, internal register -> 0 (overrides all)
    //   CLRn = 1, ENn = 0   : rising CLK loads the D pins into the register
    //   ENn  = 1            : write disabled AND read-back disabled; CLK ignored
    //   Q outputs: T/C = 1 -> Q = stored data; T/C = 0 -> Q = inverted stored.
    //   OEn = 1            : Q pins high-Z (does not affect stored state).
    //   ENn = 0 AND RDn = 0: drive the stored (true) byte back onto the D pins;
    //     otherwise the D drivers are high-Z so the pins act as data inputs.
    //   Read-back presents true stored data, unaffected by T/C (per logic diagram:
    //   the read-back buffer taps the flip-flop Q ahead of the T/C polarity XOR).
    const dNames = gate.inputs.slice(0, 8);
    const enN    = gate.inputs[8];
    const rdN    = gate.inputs[9];
    const clkN   = gate.inputs[10];
    const clrN   = gate.inputs[11];
    const tcN    = gate.inputs[12];
    const oeN    = gate.inputs[13];
    const qOut   = gate.outputs.slice(0, 8);
    const dOut   = gate.outputs.slice(8, 16);
    const state = this._getSeqState(comp, gate.outputs[0],
      { q: new Array(8).fill(0), prevClk: 0 });

    const clr = this._readPinBit(comp, clrN);
    const en  = this._readPinBit(comp, enN);
    const clk = this._readPinBit(comp, clkN);
    if (clr === 0) {
      // Asynchronous, level-sensitive clear dominates the clock.
      for (let i = 0; i < 8; i++) state.q[i] = 0;
    } else if (state.prevClk === 0 && clk === 1 && en === 0) {
      for (let i = 0; i < 8; i++) state.q[i] = this._readPinBit(comp, dNames[i]);
    }
    state.prevClk = clk;

    let changed = false;

    // Q outputs: polarity set by T/C, released to high-Z by OE.
    const tc = this._readPinBit(comp, tcN);
    const oe = this._readPinBit(comp, oeN);
    const qBits = tc === 1 ? state.q.slice() : state.q.map(b => b ^ 1);
    if (oe === 0) {
      if (this._drivePinBits(comp, qOut, qBits)) changed = true;
    } else {
      if (this._drivePinsHighZ(comp, qOut)) changed = true;
    }

    // Read-back onto the D bus: only when both EN and RD are LOW.
    const rd = this._readPinBit(comp, rdN);
    if (en === 0 && rd === 0) {
      if (this._drivePinBits(comp, dOut, state.q.slice())) changed = true;
    } else {
      if (this._drivePinsHighZ(comp, dOut)) changed = true;
    }
    return changed;
  }

  _evaluateLatchReadbackBidirTri(comp, gate) {
    // Width-agnostic TRANSPARENT D-type READ-BACK latch with a true BIDIRECTIONAL
    // read-back path. Models the TI ALS read-back-latch family as drawn on the
    // datasheet: SN74ALS990 (8-bit), SN74ALS994 (10-bit). This is the level-
    // controlled twin of the edge-triggered 74x996 (_evaluateRegReadback996
    // above) and shares that part's 3-state I/O read-back convention.
    // (Distinct from LATCH_READBACK_TRI, which a sibling models Q-side-only with
    // an OEn/CLR contract and no read-back onto D — see that primitive.)
    //
    // Unlike the 74x841 (D_LATCH_REG_TRI): the Q outputs here ALWAYS drive
    // (true logic outputs, never Hi-Z) and the enable pin does not gate Q.
    // Instead the D pins are BIDIRECTIONAL: when OERB (Output-Enable Read-Back,
    // active LOW) is taken LOW the stored word is driven BACK onto the D pins so
    // a CPU can read the held value off the same data bus it was captured from.
    // Each D name therefore appears in both gate.inputs (sense) and gate.outputs
    // (drive during read-back).
    // Source: TI, "SN74ALS994 10-Bit D-Type Transparent Read-Back Latch",
    //   SDAS237A (Oct 1984, rev. Jan 1995), description + logic diagram, page 1.
    //   inputs:  [D0..D(N-1), LE, OERB]     (D pins are the bidir data bus)
    //   outputs: [Q0..Q(N-1), D0..D(N-1)]   (Q always driven; D driven only
    //                                        during read-back)
    // Level-controlled, NOT edge-triggered:
    //   LE=1   -> transparent, Q follows D
    //   LE=0   -> latched, Q holds its last value
    //   OERB=0 -> drive the stored word back onto the D pins (read-back)
    //   OERB=1 -> D drivers Hi-Z, so the D pins act as plain inputs
    // OERB does not affect the internal latch (data is still captured while
    // read-back is active). With OERB tied HIGH this is a plain N-bit
    // transparent latch with permanently-enabled true outputs. gate.invert
    // (opt-in) complements the stored data for an inverting sibling.
    const inv          = gate.invert === true;
    const n            = gate.outputs.length / 2;
    const dNames       = gate.inputs.slice(0, n);
    const [leN, oerbN] = gate.inputs.slice(n);
    const qOut         = gate.outputs.slice(0, n);
    const dOut         = gate.outputs.slice(n, 2 * n);
    const state = this._getSeqState(comp, gate.outputs[0],
      { q: new Array(n).fill(0) });

    const le = this._readPinBit(comp, leN);
    if (le === 1) {
      for (let i = 0; i < n; i++) {
        const d = this._readPinBit(comp, dNames[i]);
        state.q[i] = inv ? (d ^ 1) : d;
      }
    }

    let changed = false;
    // True logic outputs: Q always drives the stored word.
    if (this._drivePinBits(comp, qOut, state.q.slice())) changed = true;
    // Read-back path onto the D I/O pins.
    const oerb = this._readPinBit(comp, oerbN);
    if (oerb === 0) {
      if (this._drivePinBits(comp, dOut, state.q.slice())) changed = true;
    } else {
      if (this._drivePinsHighZ(comp, dOut)) changed = true;
    }
    return changed;
  }

  _evaluateDiagScanReg818(comp, gate) {
    // 74x818 / CY29FCT818T / Am29818: 8-bit diagnostic scan register.
    // Two 8-bit registers linked by a MODE-selected multiplexer:
    //   - Pipeline register P0..P7  → drives Y0..Y7 through the OE tri-state buffer.
    //   - Shadow register  S0..S7  → serial scan chain (SDI in, SDO = S7 out).
    // Two independent clocks (DCLK for the shadow reg, PCLK for the pipeline reg)
    // and a MODE input choosing the data paths. Function table (datasheet, page 2):
    //   MODE=L, DCLK↑        : shadow serial shift, S0←SDI, Si←Si-1     (SDO=S7)
    //   MODE=L, PCLK↑        : pipeline load from D inputs, Pi←Di
    //   MODE=H, SDI=L, DCLK↑ : shadow load from Y outputs, Si←Yi (=Pi)
    //   MODE=H, SDI=H, DCLK↑ : shadow hold
    //   MODE=H, PCLK↑        : pipeline load from shadow, Pi←Si
    // OE (active LOW) enables Y0..Y7; SDO (=S7) is always driven.
    // inputs: [OEn, DCLK, PCLK, MODE, SDI, D0..D7]
    // outputs: [SDO, Y0..Y7]
    const [oeN, dclkN, pclkN, modeN, sdiN] = gate.inputs.slice(0, 5);
    const dNames = gate.inputs.slice(5, 13);
    const state = this._getSeqState(comp, gate.outputs[0],
      { s: new Array(8).fill(0), p: new Array(8).fill(0), prevDclk: 0, prevPclk: 0 });

    const mode = this._readPinBit(comp, modeN);
    const sdi  = this._readPinBit(comp, sdiN);
    const dclk = this._readPinBit(comp, dclkN);
    const pclk = this._readPinBit(comp, pclkN);
    // Snapshot pre-edge register contents so DCLK and PCLK edges that land in the
    // same evaluation both use the old values (the two clocks are independent).
    const oldS = state.s.slice();
    const oldP = state.p.slice();

    if (state.prevDclk === 0 && dclk === 1) {
      if (mode === 0) {
        state.s = [sdi, ...oldS.slice(0, 7)];   // S0←SDI, Si←Si-1
      } else if (sdi === 0) {
        state.s = oldP.slice();                 // Si←Yi (= pipeline Pi)
      }                                         // MODE=H, SDI=H → hold
    }
    state.prevDclk = dclk;

    if (state.prevPclk === 0 && pclk === 1) {
      if (mode === 0) {
        state.p = dNames.map((n) => this._readPinBit(comp, n));   // Pi←Di
      } else {
        state.p = oldS.slice();                                   // Pi←Si
      }
    }
    state.prevPclk = pclk;

    let changed = this._drivePinBit(comp, gate.outputs[0], state.s[7]);  // SDO = S7
    const oe = this._readPinBit(comp, oeN);
    if (oe === 0) {
      if (this._drivePinBits(comp, gate.outputs.slice(1, 9), state.p)) changed = true;
    } else {
      if (this._drivePinsHighZ(comp, gate.outputs.slice(1, 9))) changed = true;
    }
    return changed;
  }

  _evaluateTriBufferDualOE(comp, gate) {
    // 74541-style: tri state buffer with two active LOW OE inputs.
    // inputs: [A, OE1, OE2], output (single name string)
    // OE1=0 AND OE2=0: Y=A. Otherwise: HiZ.
    // gate.invert === true → Y = NOT A when enabled (74x828 inverting variant;
    // the two OEs are the datasheet's NOR-combined OE0/OE1, enabled only when
    // both are LOW).
    const [aName,oe1Name,oe2Name] = gate.inputs;
    const oe1 = this._readPinBit(comp, oe1Name);
    const oe2 = this._readPinBit(comp, oe2Name);
    if (!(oe1 === 0 && oe2 === 0)) return this._drivePinHighZ(comp, gate.output);
    const a = this._readPinBit(comp, aName);
    return this._drivePinBit(comp, gate.output, (gate.invert === true) ? (a ^ 1) : a);
  }

  _evaluateTriBufferSelInv(comp, gate) {
    // 74x8541-style: selectable inverting/non inverting tri state buffer.
    // inputs: [A, OE1, INV] OE1 active LOW; INV selects polarity (1=invert, 0=non-invert).
    // output: single pin Y
    // OE1=0, INV=0: Y = A (non inverting).  OE1=0, INV=1: Y = NOT A.  OE1=1: HiZ.
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
    // QHs always reflects SR[7] (last shift stage; not tri stated).
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
    // QHs = last stage of shift register (always active, not tri stated)
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
    // 74227: 64 bit synchronous FIFO (16×4) with open collector outputs, IR/OR flags.
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
    // 74228: 64 bit synchronous FIFO (16×4) with open collector outputs, EF/FF only.
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

  _evaluateLatch4BitTriRst(comp, gate) {
    // One independent 4-bit transparent latch of the CD4508 (dual 4-bit latch).
    // Each latch has an active-HIGH STROBE (transparent enable), an active-HIGH
    // RESET (clears the stored data), and an active-HIGH OUTPUT DISABLE that puts
    // the four outputs into the high-impedance (3-state) state for bus use.
    //   inputs:  [D0, D1, D2, D3, STROBE, DISABLE, RESET]
    //   outputs: [Q0, Q1, Q2, Q3]
    // Truth table (TI CD4508B SCHS070B, Fig. 7 — RESET/DISABLE/STROBE/D → Q):
    //   DISABLE=1            -> Q = Hi-Z (dominant; "X 1 X X | Z")
    //   else RESET=1         -> Q = 0   (latch cleared, regardless of STROBE)
    //   else STROBE=1        -> transparent: Q follows D
    //   else (STROBE=0)      -> hold last latched value
    // DISABLE only gates the output buffer, so RESET still clears the internal
    // latch even while the outputs are disabled — the state is updated first,
    // then the output stage is gated by DISABLE (matches every truth-table row).
    const [d0, d1, d2, d3, strobe, disable, reset] =
      this._readGateInputs(comp, gate.inputs);
    const state = this._getSeqState(comp, gate.outputs[0], { q: [0, 0, 0, 0] });
    if (reset === 1) {
      state.q = [0, 0, 0, 0];
    } else if (strobe === 1) {
      state.q = [d0, d1, d2, d3];
    }
    if (disable === 1) {
      return this._drivePinsHighZ(comp, gate.outputs);
    }
    return this._drivePinBits(comp, gate.outputs, state.q);
  }

  _evaluateLatch4BitTri873(comp, gate) {
    // One independent 4-bit transparent latch section of the 74x873 (dual
    // 4-bit D-type latch with 3-state outputs). Unlike the CD4508
    // (LATCH_4BIT_TRI_RST) both control pins here are ACTIVE-LOW, matching the
    // 74x873 function table (TI SN74ALS873B, SDAS036D, "FUNCTION TABLE (each
    // latch)"):
    //   OE̅  CLR̅  LE  D  | Q
    //   L   L    X   X  | L    (clear dominates: Q forced low, independent of LE)
    //   L   H    H   H  | H    (transparent: Q follows D)
    //   L   H    H   L  | L
    //   L   H    L   X  | Q0   (hold last latched value)
    //   H   X    X   X  | Z    (output disabled: high impedance)
    //   inputs:  [D0, D1, D2, D3, LE, OEn, CLRn]
    //   outputs: [Q0, Q1, Q2, Q3]
    // CLR̅ clears the internal latch even while OE̅ is high (output disabled),
    // so the state is updated first and the output stage is gated by OE̅ last.
    const [d0, d1, d2, d3, le, oen, clrn] =
      this._readGateInputs(comp, gate.inputs);
    const state = this._getSeqState(comp, gate.outputs[0], { q: [0, 0, 0, 0] });
    if (clrn === 0) {
      state.q = [0, 0, 0, 0];
    } else if (le === 1) {
      state.q = [d0, d1, d2, d3];
    }
    if (oen === 1) {
      return this._drivePinsHighZ(comp, gate.outputs);
    }
    return this._drivePinBits(comp, gate.outputs, state.q);
  }

  _evaluateLatch4BitTriInv880(comp, gate) {
    // One independent 4-bit transparent latch section of the 74x880 (dual
    // 4-bit D latch, INVERTING 3-state outputs). This is the inverting-output
    // sibling of the 74x873 (LATCH_4BIT_TRI_873): identical package and control
    // pins, but the outputs are Q̄ (complement of the stored data) and the
    // asynchronous input is a PRESET, not a clear.
    // TI SN74ALS880A/SN74AS880 "FUNCTION TABLE (each latch)" (doc D2661):
    //   OC̅  PRE̅  ENABLE C  D | Q̄
    //   L   L    X         X | L    (preset dominates: Q̄ forced LOW, independent of C)
    //   L   H    H         H | L    (transparent: Q̄ follows D inverted)
    //   L   H    H         L | H
    //   L   H    L         X | Q̄0   (hold last latched value)
    //   H   X    X         X | Z    (output disabled: high impedance)
    //   inputs:  [D1, D2, D3, D4, LE(=ENABLE C), OEn(=OC̅), PREn(=PRE̅)]
    //   outputs: [Q1n, Q2n, Q3n, Q4n]   (the Q̄ terminals)
    // PRE̅ presets the internal register (true Q -> 1) so the inverting Q̄
    // outputs go LOW; it dominates the latch enable. PRE̅ acts on the stored
    // state even while OC̅ disables the output buffer, so — matching the 873
    // model — the state is updated first and the output stage is gated by OC̅ last.
    const [d1, d2, d3, d4, le, oen, pren] =
      this._readGateInputs(comp, gate.inputs);
    // state.qbar holds the value driven to the Q̄ terminals.
    const state = this._getSeqState(comp, gate.outputs[0], { qbar: [1, 1, 1, 1] });
    if (pren === 0) {
      state.qbar = [0, 0, 0, 0];
    } else if (le === 1) {
      state.qbar = [d1 ? 0 : 1, d2 ? 0 : 1, d3 ? 0 : 1, d4 ? 0 : 1];
    }
    if (oen === 1) {
      return this._drivePinsHighZ(comp, gate.outputs);
    }
    return this._drivePinBits(comp, gate.outputs, state.qbar);
  }

  _evaluateTriNotHi(comp, gate) {
    // Inverting tri state buffer with active HIGH output enable.
    // OE=1: output = NOT(A). OE=0: HiZ.
    const [aName, oeName] = gate.inputs;
    const oe = this._readPinBit(comp, oeName);
    if (oe !== 1) return this._drivePinHighZ(comp, gate.output);
    const a = this._readPinBit(comp, aName);
    return this._drivePinBit(comp, gate.output, a ? 0 : 1);
  }

  _evaluateDecoder3to8Hi(comp, gate) {
    // 74238: 3 to 8 decoder, active HIGH outputs.
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
    // inputs: [A0, A1, En]  enable is active LOW per the datasheet (same G̅
    // as the 74139); pin names ending in 'n' read inverted, matching the
    // suffix convention used by the JK and VCO evaluators.
    // outputs: [Y0..Y3]
    // Selected output HIGH; others LOW. Disabled (En=1): all LOW.
    const [aName, bName, eName] = gate.inputs;
    const eBit = this._readPinBit(comp, eName);
    const enabled = eName.endsWith('n') ? eBit === 0 : eBit === 1;
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
    // 74237: 3 to 8 decoder with address latch, active HIGH outputs.
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
    // 74243: 4 bit non inverting bus transceiver with separate direction controls.
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
    // 74250: 16-to-1 mux with tri state complemented output W.
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
    // 74251: 8-to-1 mux with tri state outputs Y (true) and W (complemented).
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

  _evaluateMux8to1TriInh(comp, gate) {
    // CD4512: 8-channel data selector with a single NON-inverting 3-state
    // output, a separate active-HIGH INHIBIT, and a separate active-HIGH
    // 3-STATE DISABLE. Distinct from MUX_8TO1_TRI (the 74251), which has
    // complementary Y/W outputs and only one Gn enable.
    // inputs: [D0..D7, A, B, C, INHIBIT, DISABLE]   (A=LSB select)
    // output (single name string): SEL OUTPUT
    // Per TI CD4512B (SCHS073C) truth table:
    //   DISABLE=1            -> high-impedance (dominant)
    //   DISABLE=0, INHIBIT=1 -> output driven LOW (0)
    //   DISABLE=0, INHIBIT=0 -> output = D[A | B<<1 | C<<2]
    const bits = this._readGateInputs(comp, gate.inputs);
    const inh = bits[11];
    const dis = bits[12];
    if (dis !== 0) return this._drivePinHighZ(comp, gate.output);
    if (inh !== 0) return this._drivePinBit(comp, gate.output, 0);
    const sel = bits[8] | (bits[9] << 1) | (bits[10] << 2);
    return this._drivePinBit(comp, gate.output, bits[sel]);
  }

  _evaluateMux4to1Tri(comp, gate) {
    // 74253: single 4-to-1 mux section with tri state output.
    // inputs: [C0, C1, C2, C3, S0, S1, Gn], output (single name string)
    // Gn=0: enabled; output = selected data. Gn=1: HiZ.
    const [c0,c1,c2,c3,s0,s1,gn] = this._readGateInputs(comp, gate.inputs);
    if (gn !== 0) return this._drivePinHighZ(comp, gate.output);
    const sel  = s0 | (s1 << 1);
    const data = [c0,c1,c2,c3][sel];
    return this._drivePinBit(comp, gate.output, data);
  }

  _evaluateDemux2to4Tri(comp, gate) {
    // 74255: dual 1-of-4 demultiplexer/decoder with tri state inverting outputs.
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
    // 74258: single 2-to-1 mux section with inverting tri state output.
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

  _evaluateMult2x2_4554(comp, gate) {
    // CD4554 / MC14554B: 2-bit by 2-bit parallel binary multiplier.
    // Source: Motorola, "MC14554B — 2-Bit by 2-Bit Parallel Binary Multiplier",
    //   MC14554B/D, Rev 3 (1994). [Online]. Available (page images):
    //   https://www.alldatasheet.com/datasheet-pdf/pdf/3687/MOTOROLA/MC14554B.html
    //   Verified: terminal assignment, EQUATIONS + worked example (page 1) and the
    //   gate-level LOGIC DIAGRAM with the MULTIPLIER CELL detail (page 3), read as
    //   rendered PDF page images (issues.md C4), NOT cloned from MULT_2X4BIT (C2).
    //
    // Function: S = (X x Y) + K + M, with X=X1X0, Y=Y1Y0 the 2-bit operands,
    // K=K1K0 and M=M2M1M0 the cascade/add inputs, output S3S2S1S0 plus carry C0.
    // Each of the four MULTIPLIER CELLs is a full adder of {Xi*Yj, M, K}:
    //   S = (Xi*Yj) ^ M ^ K,  C = majority(Xi*Yj, M, K).
    // Array wiring traced from the page-3 logic diagram (cell partial-product
    // weights TR=X0Y0:1, TL=X0Y1:2, BR=X1Y0:2, BL=X1Y1:4):
    //   TR: a = X0Y0 + M0 + K0    -> S0,   carry -> TL.K
    //   TL: b = X0Y1 + M1 + TR.C  -> TL.S, carry -> C0 (pin 4 output)
    //   BR: d = X1Y0 + TL.S + K1  -> S1,   carry -> BL.K
    //   BL: e = X1Y1 + M2 + BR.C  -> S2,   carry -> S3 (=C1, pin 6)
    // C0 is the top-row weight-4 carry, brought out for expansion; the datasheet
    // note "C0 connected to M2 for this size multiplier" is the EXTERNAL wiring a
    // user makes for a standalone 2x2 (M2 = weight-4 addend into BL). The chip
    // itself leaves C0 and M2 as independent pins, so this model is pure
    // combinational (no internal feedback). Verified vs the datasheet example
    // X=2,Y=3,K=1,M=2 -> S=1001 (=9): a=1(S0=1,c=0) b=1(TLs=1,C0=0)
    // d=2(S1=0,c=1) e=2(S2=0,S3=1) -> S3..S0 = 1001. (Only divergence: A1
    // no-propagation-delay idealization; settled outputs are exact.)
    // inputs:  [X0, X1, Y0, Y1, K0, K1, M0, M1, M2]
    // outputs: [S0, S1, S2, S3, C0]
    const [x0, x1, y0, y1, k0, k1, m0, m1, m2] = this._readGateInputs(comp, gate.inputs);
    const a = (x0 & y0) + m0 + k0;          const s0 = a & 1,  cTR = a >> 1;
    const b = (x0 & y1) + m1 + cTR;         const sTL = b & 1, c0  = b >> 1;
    const d = (x1 & y0) + sTL + k1;         const s1 = d & 1,  cBR = d >> 1;
    const e = (x1 & y1) + m2 + cBR;         const s2 = e & 1,  s3  = e >> 1;
    let changed = false;
    if (this._drivePinBit(comp, gate.outputs[0], s0)) changed = true;
    if (this._drivePinBit(comp, gate.outputs[1], s1)) changed = true;
    if (this._drivePinBit(comp, gate.outputs[2], s2)) changed = true;
    if (this._drivePinBit(comp, gate.outputs[3], s3)) changed = true;
    if (this._drivePinBit(comp, gate.outputs[4], c0)) changed = true;
    return changed;
  }

  // ── Block 70 evaluators ──────────────────────────────────────────────────

  _evaluateEeprom2kx8(comp, gate) {
    // AT28C16 / 28C16: 2K × 8 EEPROM with bidirectional I/O.
    // gate.inputs:  [A0..A10 (11), IO0..IO7 (8), CE, OE, WE]
    // gate.outputs: [IO0..IO7]
    // Standby  (CE=1):             IO → Hi-Z
    // Write    (CE=0, OE=1, WE=0): latch IO bus → mem[addr], IO → Hi-Z
    // Read     (CE=0, OE=0, WE=1): drive mem[addr] → IO
    // Disabled (CE=0, OE=1, WE=1): IO → Hi-Z (no write)
    const bits = this._readGateInputs(comp, gate.inputs);
    const addr = bits[0]  | (bits[1]  << 1)  | (bits[2]  << 2)  | (bits[3]  << 3)  |
                 (bits[4]  << 4)  | (bits[5]  << 5)  | (bits[6]  << 6)  | (bits[7]  << 7)  |
                 (bits[8]  << 8)  | (bits[9]  << 9)  | (bits[10] << 10);
    const ioIn = bits.slice(11, 19);
    const ce = bits[19], oe = bits[20], we = bits[21];

    if (ce !== 0) return this._drivePinsHighZ(comp, gate.outputs);

    const state = this._getSeqState(comp, gate.outputs[0] + '_eeprom2k', { mem: {} });

    if (oe !== 0 && we === 0) {
      state.mem[addr] = [...ioIn];
      return this._drivePinsHighZ(comp, gate.outputs);
    }
    if (oe === 0 && we !== 0) {
      return this._drivePinBits(comp, gate.outputs, state.mem[addr] || [0,0,0,0,0,0,0,0]);
    }
    return this._drivePinsHighZ(comp, gate.outputs);
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
  // 74268: hex D type latch with tri state output.
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
  // 74274: 4×4 bit multiplier with tri state output.
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
  // Implements carry save adder tree for 4+2+1 inputs per column.
  // This is a simplified but functionally correct model:
  // For a 4 bit slice position, compute partial product sums.
  // W0-W3: 4 partial product bits at this weight
  // X0-X1: 2 partial product bits at next weight
  // Y0: carry in from previous slice at this weight
  // S0-S3: sum outputs
  // C2,C3: carry outputs
  // Y1: carry out to next slice
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

function _evaluateParity9BitInh_fn(comp, gate) {
  // CD40101: CMOS 9-bit (8 data + 1 parity) parity generator/checker with INHIBIT.
  // inputs:  [D1,D2,D3,D4,D5,D6,D7,D8,D9, INHIBIT]
  // outputs: [EVEN, ODD]
  // Like the 74280 (PARITY_9BIT_SIMPLE) but with an active-HIGH INHIBIT: per the
  // RCA/Intersil CD40101BMS datasheet, when INHIBIT = logical "1" both the EVEN and
  // ODD outputs are forced to logical "0". With INHIBIT LOW, EVEN = 1 when the number
  // of HIGH data inputs (D1..D9) is even, ODD = 1 when it is odd (always complementary
  // for 9 inputs). A separate primitive (not PARITY_9BIT_SIMPLE) so the 9th term is a
  // real data bit and the inhibit is excluded from the parity sum.
  const bits = this._readGateInputs(comp, gate.inputs);
  const inh = bits[9];
  const ones = bits.slice(0, 9).reduce((sum, b) => sum + b, 0);
  const parity = ones & 1; // 1 = odd number of ones
  let even, odd;
  if (inh === 1) {
    even = 0;
    odd = 0;
  } else {
    even = parity ? 0 : 1; // EVEN = 1 when even count
    odd  = parity ? 1 : 0; // ODD  = 1 when odd count
  }
  let changed = false;
  if (this._drivePinBit(comp, gate.outputs[0], even)) changed = true;
  if (this._drivePinBit(comp, gate.outputs[1], odd)) changed = true;
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
  // 74282: look ahead carry generator with selectable carry inputs.
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
chipEvaluators._evaluateParity9BitInh = _evaluateParity9BitInh_fn;
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
  // 74289: 16×4 static RAM, open collector, inverted outputs.
  // inputs: [A0,A1,A2,A3,CSn,WEn,D0,D1,D2,D3]
  // outputs: [Q0n,Q1n,Q2n,Q3n]
  const bits = this._readGateInputs(comp, gate.inputs);
  const csn = bits[4], wen = bits[5];
  if (!comp.state) comp.state = {};
  if (!comp.state.ram) comp.state.ram = new Uint8Array(16);
  const addr = bits[0] | (bits[1]<<1) | (bits[2]<<2) | (bits[3]<<3);
  let changed = false;
  if (csn !== 0) {
    // Not selected: outputs float high (open collector not driven → HiZ / pulled up)
    for (const op of gate.outputs) { if (this._drivePinHighZ(comp, op)) changed = true; }
    return changed;
  }
  if (wen === 0) {
    // Write: store data (non inverted)
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

function _evaluateFreqDivProg4059_fn(comp, gate) {
  // CD4059A: CMOS Programmable Divide-by-"N" Counter (24-pin).
  // Source: Texas Instruments / Harris, "CD4059A Types — CMOS Programmable
  //   Divide-by-'N' Counter", SCHS109B (rev. June 2003). [Online]. Available:
  //   https://www.ti.com/lit/ds/symlink/cd4059a.pdf  Verified: Table I (Mode
  //   Select), "HOW TO PRESET THE CD4059A" eqs. (1)/(2) with worked examples
  //   A/B/C, Fig.1 (total count of 3) and Fig.5 (functional block diagram),
  //   read as 300-dpi PDF page images (issues.md C4).
  //
  // inputs:  [CLK, LE, Ka, Kb, Kc, J1..J16]
  // outputs: [OUT]
  //
  // The chip emits one clock-wide output pulse every N input clocks. N is set by
  // the Mode-Select inputs Ka/Kb/Kc (which fix the modulus M of the first
  // counting section and the modulus of the last section, per Table I) and the
  // 16 jam inputs grouped into five decade values:
  //   N = M * (1000*D5 + 100*D4 + 10*D3 + D2) + D1      (eq. 1, MODE = M)
  // The first-section modulus M and which jam inputs carry the units decade D1
  // and the thousands decade D5 both depend on the mode (J1 = LSB of each group):
  //   Ka Kb Kc   M    D1 (units)      D5 (thousands)   last section
  //    1  1  1    2   J1              J2,J3,J4         ÷8
  //    0  1  1    4   J1,J2           J3,J4            ÷4
  //    1  0  1    5   J1,J2,J3        J4               ÷2
  //    0  0  1    8   J1,J2,J3        J4               ÷2
  //    1  1  0   10   J1,J2,J3,J4     (none → 0)       ÷1
  //    X  0  0   MASTER PRESET (counter held loaded, not counting)
  // D2=J5..J8, D3=J9..J12, D4=J13..J16 in every counting mode (the three
  // cascaded ÷10 intermediate decades).
  const bits = this._readGateInputs(comp, gate.inputs);
  const clk = bits[0], le = bits[1], ka = bits[2], kb = bits[3], kc = bits[4];
  const J = (i) => bits[4 + i];                 // J(i) for i = 1..16 (bits[5..20])
  const grp = (lo, hi) => { let v = 0, p = 0; for (let i = lo; i <= hi; i++) v |= (J(i) << p++); return v; };

  const masterPreset = (kb === 0 && kc === 0);  // Table I: Kb=0,Kc=0 (Ka X)
  let M, D1, D5;
  if      (ka === 1 && kb === 1 && kc === 1) { M = 2;  D1 = grp(1, 1); D5 = grp(2, 4); }
  else if (ka === 0 && kb === 1 && kc === 1) { M = 4;  D1 = grp(1, 2); D5 = grp(3, 4); }
  else if (ka === 1 && kb === 0 && kc === 1) { M = 5;  D1 = grp(1, 3); D5 = grp(4, 4); }
  else if (ka === 0 && kb === 0 && kc === 1) { M = 8;  D1 = grp(1, 3); D5 = grp(4, 4); }
  else if (ka === 1 && kb === 1 && kc === 0) { M = 10; D1 = grp(1, 4); D5 = 0;         }
  else                                       { M = 10; D1 = 0;         D5 = 0;         } // master preset / undefined
  const D2 = grp(5, 8), D3 = grp(9, 12), D4 = grp(13, 16);
  const N = M * (1000 * D5 + 100 * D4 + 10 * D3 + D2) + D1;

  if (!comp.state) comp.state = { cnt: 0, out: 0, prevClk: clk };
  let changed = false;

  if (masterPreset) {
    // Master-preset state: the counter sits jam-loaded and does not count; the
    // output stays low until a real counting mode is selected.
    comp.state.cnt = 0;
    comp.state.out = 0;
  } else if (comp.state.prevClk === 0 && clk === 1) {  // CD4059 counts on the rising clock edge
    // A non-latched output pulse is exactly one clock period wide, so the pulse
    // raised on the previous terminal count is cleared on the next rising edge.
    if (comp.state.out === 1 && le === 0) comp.state.out = 0;
    comp.state.cnt++;
    if (N >= 1 && comp.state.cnt >= N) {
      comp.state.cnt = 0;
      comp.state.out = 1;                              // one clock-wide pulse every N clocks (Fig.1)
    }
    // LE high latches OUT high once a pulse occurs; it is released (above) on the
    // first rising edge after LE returns low (datasheet: "remain high until the
    // latch input returns to 0"). Simplification: release is edge-synced, not the
    // instantaneous level release of real silicon (engine has no propagation
    // delay — issues.md A1).
  }
  comp.state.prevClk = clk;

  if (this._drivePinBit(comp, gate.outputs[0], comp.state.out)) changed = true;
  return changed;
}

function _evaluateFreqDivProg4536_fn(comp, gate) {
  // CD4536B: CMOS Programmable Timer (16-pin). Modeled core = the externally-
  // clocked programmable frequency divider with the variable-pulse-width one-shot
  // bypassed (the datasheet's "ground MONO IN through 10kOhm or higher" mode, which
  // "disables the one-shot circuit and connects the decoder directly to the
  // DECODE OUT terminal"). The on-chip RC oscillator (IN1/OUT1/OUT2 + RS,CT,RT) and
  // the variable monostable pulse width (MONO IN to VDD via RT,CT) are NOT modeled:
  // 74Sim has no free-running RC-oscillator timebase (issues.md A3/A9). So IN1 must
  // be driven by an external clock and DECODE OUT is the raw divided clock.
  //
  // Source: Intersil/Harris, "CD4536BMS — CMOS Programmable Timer", File No. 3345
  //   (December 1992). [Online]. Verified: Pinout (TOP VIEW) + Functional Diagram
  //   p.1, Description p.1, and Logic Diagram Fig.1 (24 ripple stages FF1..FF24,
  //   1-of-16 decoder on the last 16 stages, 8-BYPASS, A/B/C/D BCD select),
  //   read as PDF page images (issues.md C4).
  //
  // inputs:  [IN1, CLOCK_INHIBIT, BYPASS8, RESET, SET, A, B, C, D]
  // outputs: [DECODE_OUT]
  //
  // The chip has 24 ripple-binary stages. The 1-of-16 decoder selects one of the
  // LAST 16 stages (stages 9..24) via the BCD code A(LSB)..D(MSB). A logic 1 on
  // 8-BYPASS bypasses the first 8 stages so stage 9 becomes the first counter
  // stage. Because tapping bit k of a free-running binary counter is exactly a
  // divide-by-2^(k+1), the full 24-bit counter always advances and the bypass just
  // relocates the output tap by 8 bits:
  //   BYPASS8=0 -> DECODE OUT = bit (8+n) of count  (stage 9..24 => /2^9 .. /2^24)
  //   BYPASS8=1 -> DECODE OUT = bit  (n)  of count  (stage 9 acts as stage 1 => /2)
  // with n = A + 2B + 4C + 8D, n in 0..15.
  const [clkN, ciN, bypN, rstN, setN, aN, bN, cN, dN] = gate.inputs;
  const MASK = 0xFFFFFF;                              // 24 stages -> wrap at 2^24
  const state = this._getSeqState(comp, gate.outputs[0], { count: 0, prevClk: 0 });

  const rst = this._readPinBit(comp, rstN);
  const set = this._readPinBit(comp, setN);
  const ci  = this._readPinBit(comp, ciN);
  const clk = this._readPinBit(comp, clkN);

  if (rst === 1) {
    // Active-HIGH RESET clears all stages asynchronously. RESET dominates SET here;
    // the real part's RESET+SET+8-BYPASS combo is the fast-test mode (counter split
    // into three 8-stage sections), which is not modeled.
    state.count = 0;
    state.prevClk = clk;
  } else if (set === 1) {
    // Active-HIGH SET asynchronously sets all stages (DECODE OUT high regardless of tap).
    state.count = MASK;
    state.prevClk = clk;
  } else {
    // Ripple counter advances on the falling edge of IN1 (CD4000 ripple convention,
    // as in the CD4020/4040). CLOCK INHIBIT high freezes the count.
    if (ci === 0 && state.prevClk === 1 && clk === 0) {
      state.count = (state.count + 1) & MASK;
    }
    state.prevClk = clk;
  }

  const n = this._readPinBit(comp, aN)
          | (this._readPinBit(comp, bN) << 1)
          | (this._readPinBit(comp, cN) << 2)
          | (this._readPinBit(comp, dN) << 3);
  const byp = this._readPinBit(comp, bypN);
  const bit = byp === 1 ? n : (8 + n);
  const out = (state.count >> bit) & 1;
  return this._drivePinBit(comp, gate.outputs[0], out);
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
  // 74295: 4 bit bidirectional shift register with tri state outputs.
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

function _evaluateShiftReg4BitUnivTri_fn(comp, gate) {
  // CD40104B / HEF40104B / MC14104B: 4-bit bidirectional UNIVERSAL shift register
  // with three-state outputs. Distinct from the 74295 SHIFT_REG_4BIT_BIDIR_TRI
  // primitive (which has only ONE shift direction + load via a single MODE pin)
  // and from the 74194-style SHIFT_REG_4BIT_BIDIR (4 modes but mode 00 = HOLD and
  // no tri-state). The 40104B is the universal register WITH tri-state outputs
  // whose mode 00 is a SYNCHRONOUS CLEAR (it has no separate reset pin — that is
  // the sibling 40194B).
  //   inputs:  [SR, SL, D0, D1, D2, D3, S0, S1, CLK, OE]
  //   outputs: [Q0, Q1, Q2, Q3]   (Q0 = first stage, Q3 = last stage)
  // Mode (S1,S0): 00 → synchronous clear (reg→0); 01 → shift right
  //   (SR enters Q0, data moves Q0→Q1→Q2→Q3); 10 → shift left (SL enters Q3,
  //   data moves Q3→Q2→Q1→Q0); 11 → parallel load (D0..D3).
  // All actions occur on the positive CLOCK edge. OUTPUT ENABLE is active HIGH:
  // OE=0 → all outputs high-impedance; OE=1 → outputs driven.
  // Source: see CD40104 block header in js/chips/chips134.js
  // (SGS-Thomson HCC/HCF40104B/40194B, June 1989).
  const bits = this._readGateInputs(comp, gate.inputs);
  const [sr, sl, d0, d1, d2, d3, s0, s1, clk, oe] = bits;
  if (!comp.state) comp.state = { reg: 0, prevClk: 0 };
  let changed = false;

  if (comp.state.prevClk === 0 && clk === 1) {
    const mode = (s1 << 1) | s0;
    const cur = comp.state.reg;
    switch (mode) {
      case 0: comp.state.reg = 0; break;                                  // synchronous clear
      case 1: comp.state.reg = ((cur << 1) | sr) & 0xF; break;            // shift right: SR→Q0
      case 2: comp.state.reg = ((cur >> 1) | (sl << 3)) & 0xF; break;     // shift left: SL→Q3
      case 3: comp.state.reg = (d0 | (d1<<1) | (d2<<2) | (d3<<3)) & 0xF; break; // parallel load
    }
  }
  comp.state.prevClk = clk;

  if (oe === 0) {
    for (const op of gate.outputs) { if (this._drivePinHighZ(comp, op)) changed = true; }
    return changed;
  }
  for (let i = 0; i < 4; i++) {
    if (this._drivePinBit(comp, gate.outputs[i], (comp.state.reg >> i) & 1)) changed = true;
  }
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
  // 74299: 8 bit universal bidirectional shift/storage register, tri state.
  // inputs: [S0,S1, SR,SL, OEAn,OEBn, QA,QB,QC,QD,QE,QF,QG,QH, CLK]
  //   S0,S1: 00=hold, 01=shift right, 10=shift left, 11=parallel load
  //   SR: serial input for right-shift (into QH end)
  //   SL: serial input for left-shift (into QA end)
  //   QA-QH are also parallel data inputs during load (S1S0=11)
  //   OEAn/OEBn: enable outputs (both must be 0 to output)
  //   In parallel-load mode (11), I/O pins are inputs; tri state the outputs so
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

function _evaluateRam256x1OCN_fn(comp, gate) {
  // 74300/74301/74302: 256×1 static RAM, open collector output.
  // inputs: [A0,A1,A2,A3,A4,A5,A6,A7, WEn, CSn, DI]
  // outputs: [DO]
  // NOTE: distinct gate type from RAM_256X1_OC (74206), whose inputs end
  // [DIN, CS, WE] — sharing one evaluator name made the 74206 misread WE as
  // data and corrupt its memory on every read.
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
  // Open collector output: HIGH releases (external pull-up), LOW sinks.
  if (this._drivePinOC(comp, gate.outputs[0], val)) changed = true;
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
chipEvaluators._evaluateFreqDivProg4059     = _evaluateFreqDivProg4059_fn;
chipEvaluators._evaluateFreqDivProg4536     = _evaluateFreqDivProg4536_fn;
chipEvaluators._evaluateCounter4BitDiv      = _evaluateCounter4BitDiv_fn;
chipEvaluators._evaluateShiftReg4BitBidirTri = _evaluateShiftReg4BitBidirTri_fn;
chipEvaluators._evaluateShiftReg4BitUnivTri  = _evaluateShiftReg4BitUnivTri_fn;
chipEvaluators._evaluateMuxQuad2to1Stored   = _evaluateMuxQuad2to1Stored_fn;
chipEvaluators._evaluateShiftReg8BitUnivTri = _evaluateShiftReg8BitUnivTri_fn;
chipEvaluators._evaluateRam256x1OCN         = _evaluateRam256x1OCN_fn;
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
  // 74309/74314/74315: 1024×1 RAM, open collector.
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
  // 74310: Octal inverting buffer, Schmitt trigger inputs, tri state.
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
  // 74319: 16×4 RAM, OC. Non inverted outputs (unlike 74289).
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
  // 74322: 8 bit shift register with sign extend, tri state.
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
  //   OEAn/OEBn: tri state enables (both 0 to output).
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

// Voltage-controlled square-wave oscillator (shared by all VCO chips).
// Phase counter advances by this.dt/period each tick; output toggles at the
// half-period boundary. When EN is inactive, phase freezes and output holds
// LOW. (PLL chips were removed from the catalog rather than stubbed — see
// js/Simplifications.md §2 "Note on PLL parts".)
function _vcoTick_fn(comp, key, vinVolt, rngBit, enActive) {
  const state = this._getSeqState(comp, key, { phase: 0, q: 0 });
  if (!enActive) { state.q = 0; return 0; }
  // 0V → 10 Hz, VCC → 1 kHz. RNG=1 multiplies frequency by 10 (up to ~10 kHz,
  // which under-samples at dt=1ms but is still useful as a coarse range bit).
  // If VIN is null/floating, default to 100 Hz so the chip blinks usefully
  // without any analog driver attached.
  let freq;
  if (vinVolt !== null && vinVolt !== undefined) {
    const v = Math.max(0, Math.min(VCC_VOLTAGE, vinVolt));
    freq = 10 + (v / VCC_VOLTAGE) * (1000 - 10);
  } else {
    freq = 100;
  }
  if (rngBit === 1) freq *= 10;
  const period = 1 / freq;
  let phase = state.phase + this.dt / period;
  if (phase >= 1) phase -= Math.floor(phase);
  state.phase = phase;
  state.q = (phase < 0.5) ? 1 : 0;
  return state.q;
}

// Shared per-channel VCO gate (74x124 and the 74x624 629 family).
// inputs: [EN, FREQ, RNG]   outputs: [Y, Yn]
// EN: null/absent → free running; name ending in 'n' (OEn) → active LOW
// (matching the JK evaluators' suffix convention); otherwise active HIGH.
// FREQ/RNG: null/absent → defaults (100 Hz, range off) inside _vcoTick.
function _evaluateVco124_fn(comp, gate) {
  const [enName, freqName, rngName] = gate.inputs;
  const [outName, outnName] = gate.outputs;
  let enActive = true;
  if (enName) {
    const bit = this._readPinBit(comp, enName);
    enActive = enName.endsWith('n') ? bit === 0 : bit === 1;
  }
  const vFreq = freqName ? this._readPinVoltage(comp, freqName) : null;
  const rng   = rngName ? this._readPinBit(comp, rngName) : 0;
  const q = this._vcoTick(comp, outName, vFreq, rng, enActive);
  let changed = false;
  if (this._drivePinBit(comp, outName,  q))         changed = true;
  if (this._drivePinBit(comp, outnName, q ? 0 : 1)) changed = true;
  return changed;
}

// 74x324: single VCO with EN. EN active HIGH (matches existing gate convention).
// inputs: [EN, VIN, RNG]   outputs: [OUT, OUTn]
function _evaluateVcoSingleEn_fn(comp, gate) {
  const [enName, vinName, rngName] = gate.inputs;
  const [outName, outnName] = gate.outputs;
  const en  = this._readPinBit(comp, enName);
  const vIn = this._readPinVoltage(comp, vinName);
  const rng = this._readPinBit(comp, rngName);
  const q = this._vcoTick(comp, outName, vIn, rng, en === 1);
  let changed = false;
  if (this._drivePinBit(comp, outName,  q))         changed = true;
  if (this._drivePinBit(comp, outnName, q ? 0 : 1)) changed = true;
  return changed;
}

// 74x325 / 74x327: dual VCO, no enable (always running).
// inputs: [VIN1, RNG1, VIN2, RNG2]   outputs: [OUT1, OUT1n, OUT2, OUT2n]
function _evaluateVcoDual_fn(comp, gate) {
  const [v1n, r1n, v2n, r2n] = gate.inputs;
  const [o1, o1n, o2, o2n] = gate.outputs;
  const v1 = this._readPinVoltage(comp, v1n);
  const r1 = this._readPinBit(comp, r1n);
  const v2 = this._readPinVoltage(comp, v2n);
  const r2 = this._readPinBit(comp, r2n);
  const q1 = this._vcoTick(comp, o1, v1, r1, true);
  const q2 = this._vcoTick(comp, o2, v2, r2, true);
  let changed = false;
  if (this._drivePinBit(comp, o1,  q1))         changed = true;
  if (this._drivePinBit(comp, o1n, q1 ? 0 : 1)) changed = true;
  if (this._drivePinBit(comp, o2,  q2))         changed = true;
  if (this._drivePinBit(comp, o2n, q2 ? 0 : 1)) changed = true;
  return changed;
}

// 74x326: dual VCO with per-channel EN. EN active HIGH.
// inputs: [EN1, VIN1, RNG1, EN2, VIN2, RNG2]   outputs: [OUT1, OUT1n, OUT2, OUT2n]
function _evaluateVcoDualEn_fn(comp, gate) {
  const [e1n, v1n, r1n, e2n, v2n, r2n] = gate.inputs;
  const [o1, o1n, o2, o2n] = gate.outputs;
  const en1 = this._readPinBit(comp, e1n);
  const en2 = this._readPinBit(comp, e2n);
  const v1  = this._readPinVoltage(comp, v1n);
  const v2  = this._readPinVoltage(comp, v2n);
  const r1  = this._readPinBit(comp, r1n);
  const r2  = this._readPinBit(comp, r2n);
  const q1 = this._vcoTick(comp, o1, v1, r1, en1 === 1);
  const q2 = this._vcoTick(comp, o2, v2, r2, en2 === 1);
  let changed = false;
  if (this._drivePinBit(comp, o1,  q1))         changed = true;
  if (this._drivePinBit(comp, o1n, q1 ? 0 : 1)) changed = true;
  if (this._drivePinBit(comp, o2,  q2))         changed = true;
  if (this._drivePinBit(comp, o2n, q2 ? 0 : 1)) changed = true;
  return changed;
}

function _evaluateClkDriverQuadTri_fn(comp, gate) {
  // 74337: Quad clock driver, tri state.
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
  // 74341/74344: Octal buffer, non inverting, Schmitt, tri state.
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
chipEvaluators._vcoTick                        = _vcoTick_fn;
chipEvaluators._evaluateVco124                 = _evaluateVco124_fn;
chipEvaluators._evaluateVcoSingleEn            = _evaluateVcoSingleEn_fn;
chipEvaluators._evaluateVcoDual                = _evaluateVcoDual_fn;
chipEvaluators._evaluateVcoDualEn              = _evaluateVcoDualEn_fn;
chipEvaluators._evaluateClkDriverQuadTri       = _evaluateClkDriverQuadTri_fn;
chipEvaluators._evaluateBufferOctStTri         = _evaluateBufferOctStTri_fn;


// ── Block 22 Evaluator Functions ─────────────────────────────────────────────

function _evaluatePriorityEnc8to3Tri_fn(comp, gate) {
  // 74348: 8 to 3 priority encoder, tri state.
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
  // 74350: 4 bit shifter with tri state outputs.
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
  // 74351: 8→1 mux with complementary tri state outputs.
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
  // 74353: single 4→1 mux section with inverting tri state output.
  // inputs: [C0, C1, C2, C3, A, B, Gn], output (single string)
  // Gn=0: Y = NOT(selected), enabled. Gn=1: HiZ.
  const [c0,c1,c2,c3,a,b,gn] = this._readGateInputs(comp, gate.inputs);
  if (gn !== 0) return this._drivePinHighZ(comp, gate.output);
  const sel  = a | (b << 1);
  const data = [c0,c1,c2,c3][sel];
  return this._drivePinBit(comp, gate.output, data ^ 1);
}

function _evaluateMux8to1LatchTri_fn(comp, gate) {
  // 74354/74355: 8→1 mux with transparent latch + tri state complementary outputs.
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
  // 74356/74357: 8→1 mux with edge triggered register + tri state complementary outputs.
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
  // 74365: Hex buffer, non inverting, tri state.
  // inputs: [A1..A6, G1n, G2n]      (both enables active-LOW, applied to all 6)
  // outputs: [Y1..Y6]
  //
  // CD4503B split-disable mode (gate.splitDisable === true):
  //   inputs: [A1..A6, DIS_A, DIS_B]
  //   - The CD4503 has TWO independent disable controls, each ACTIVE HIGH:
  //       DIS A (HIGH) → buffers 1-4 (outputs[0..3]) go high-impedance (Z).
  //       DIS B (HIGH) → buffers 5-6 (outputs[4..5]) go high-impedance (Z).
  //   - otherwise: Yn = An  (non-inverting buffer).
  //   This differs from the bare 74365 in two ways the plain primitive cannot
  //   express: the enables are active HIGH, and they gate DIFFERENT groups of
  //   buffers (4 + 2) rather than all six together. Gated behind the opt-in flag
  //   so the 74365 entries (flag unset) keep their original combined active-LOW
  //   path. Truth table (CD4503B datasheet SCHS068C):
  //     Dn DIS(A/B) | Qn      0 0 | 0      1 0 | 1      X 1 | Z
  const bits = this._readGateInputs(comp, gate.inputs);
  let changed = false;
  if (gate.splitDisable) {
    const disA = bits[6], disB = bits[7];
    for (let i = 0; i < 6; i++) {
      const dis = (i < 4) ? disA : disB;
      if (dis !== 0) {
        if (this._drivePinHighZ(comp, gate.outputs[i])) changed = true;
      } else {
        if (this._drivePinBit(comp, gate.outputs[i], bits[i])) changed = true;
      }
    }
    return changed;
  }
  // 74367 split-enable mode (gate.splitEnable === true):
  //   inputs: [A1..A6, G1n, G2n]   (both enables active-LOW, SPLIT 4+2)
  //   - 1G (G1n) enables the first FOUR buffers: outputs[0..3] (Y1-Y4).
  //   - 2G (G2n) enables the last TWO buffers:   outputs[4..5] (Y5-Y6).
  //   Each group tri-states independently when its enable is HIGH; otherwise
  //   Yn = An (non-inverting). This is the '367A split, distinct from the '365A
  //   combined enable below (EITHER enable HIGH tri-states all six). The 74365
  //   leaves this flag unset and keeps the combined path. Truth table (TI SDLS102
  //   '367A logic diagram, verified as PDF page images — issues.md C4):
  //     1G An | Yn(1-4)     0 0 | 0     0 1 | 1     1 X | Z    (2G governs Y5-Y6)
  if (gate.splitEnable) {
    const g1n = bits[6], g2n = bits[7];
    for (let i = 0; i < 6; i++) {
      const en = (i < 4) ? g1n : g2n;   // active-LOW: HIGH → tri-state
      if (en !== 0) {
        if (this._drivePinHighZ(comp, gate.outputs[i])) changed = true;
      } else {
        if (this._drivePinBit(comp, gate.outputs[i], bits[i])) changed = true;
      }
    }
    return changed;
  }
  const g1n = bits[6], g2n = bits[7];
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
  // 74366: Hex buffer, inverting, tri state.
  // inputs: [A1..A6, G1n, G2n]
  // outputs: [Y1..Y6]
  //
  // CD4502B strobed-hex-inverter mode (gate.strobedInhibit === true):
  //   inputs: [A1..A6, OUTPUT_DISABLE, INHIBIT]
  //   - OUTPUT DISABLE (active HIGH) → all six outputs high-impedance (Z).
  //   - INHIBIT (active HIGH, with DISABLE low) → all six outputs forced LOW (0),
  //     NOT high-impedance. This "strobe" behavior is what distinguishes the
  //     CD4502 from a plain 74366 tri-state enable; the bare enable cannot
  //     express it, so it is gated behind the opt-in flag (74366 entries leave
  //     the flag unset and keep their original active-LOW combined-enable path).
  //   - otherwise: Qn = NOT(Dn).
  //   Truth table (CD4502B datasheet SCHS067B):
  //     DISABLE INHIBIT Dn | Qn      0 0 0 | 1     0 0 1 | 0
  //                                  0 1 X | 0     1 X X | Z
  const bits = this._readGateInputs(comp, gate.inputs);
  let changed = false;
  if (gate.strobedInhibit) {
    const disable = bits[6], inhibit = bits[7];
    if (disable !== 0) {
      for (const op of gate.outputs) { if (this._drivePinHighZ(comp, op)) changed = true; }
      return changed;
    }
    if (inhibit !== 0) {
      for (const op of gate.outputs) { if (this._drivePinBit(comp, op, 0)) changed = true; }
      return changed;
    }
    for (let i = 0; i < 6; i++) {
      if (this._drivePinBit(comp, gate.outputs[i], bits[i] ^ 1)) changed = true;
    }
    return changed;
  }
  // 74368 split-enable mode (gate.splitEnable === true):
  //   inputs: [A1..A6, G1n, G2n]   (both enables active-LOW, SPLIT 4+2)
  //   - 1G (G1n) enables the first FOUR inverters: outputs[0..3] (Y1-Y4).
  //   - 2G (G2n) enables the last TWO inverters:   outputs[4..5] (Y5-Y6).
  //   Each group tri-states independently when its enable is HIGH; otherwise
  //   Yn = NOT(An). This is the '367A/'368A split, distinct from the '365A/'366A
  //   combined enable below (where EITHER enable HIGH tri-states all six). The
  //   74366 leaves this flag unset and keeps the combined path. Truth table
  //   (TI SDLS102 '368A logic diagram, verified as PDF page images — issues.md C4):
  //     1G An | Yn(1-4)     0 0 | 1     0 1 | 0     1 X | Z    (2G governs Y5-Y6)
  if (gate.splitEnable) {
    const g1n = bits[6], g2n = bits[7];
    for (let i = 0; i < 6; i++) {
      const en = (i < 4) ? g1n : g2n;   // active-LOW: HIGH → tri-state
      if (en !== 0) {
        if (this._drivePinHighZ(comp, gate.outputs[i])) changed = true;
      } else {
        if (this._drivePinBit(comp, gate.outputs[i], bits[i] ^ 1)) changed = true;
      }
    }
    return changed;
  }
  const g1n = bits[6], g2n = bits[7];
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

function _evaluateDLatchQuad4042_fn(comp, gate) {
  // CD4042: Quad clocked "D" latch with complementary Q/Qn outputs and a
  // single common CLOCK gated by a POLARITY input (no per-latch enable pins,
  // so the 74375 D_LATCH_QUAD_COMPL primitive does not fit — see issues.md).
  // inputs:  [D1, D2, D3, D4, CLOCK, POLARITY]
  // outputs: [Q1, Q1n, Q2, Q2n, Q3, Q3n, Q4, Q4n]
  // Truth table (TI CD4042B SCHS040D, Fig. 1):
  //   POLARITY=0: latches transparent while CLOCK=0; data latched on CLOCK 0→1.
  //   POLARITY=1: latches transparent while CLOCK=1; data latched on CLOCK 1→0.
  // i.e. transparent (Q follows D) when CLOCK == POLARITY; hold otherwise.
  const bits = this._readGateInputs(comp, gate.inputs);
  const [d1, d2, d3, d4, clk, pol] = bits;
  if (!comp.state) comp.state = { q: [0, 0, 0, 0] };
  if (clk === pol) {
    comp.state.q[0] = d1;
    comp.state.q[1] = d2;
    comp.state.q[2] = d3;
    comp.state.q[3] = d4;
  }
  const [q1, q2, q3, q4] = comp.state.q;
  let changed = false;
  if (this._drivePinBit(comp, gate.outputs[0], q1))     changed = true;
  if (this._drivePinBit(comp, gate.outputs[1], q1 ^ 1)) changed = true;
  if (this._drivePinBit(comp, gate.outputs[2], q2))     changed = true;
  if (this._drivePinBit(comp, gate.outputs[3], q2 ^ 1)) changed = true;
  if (this._drivePinBit(comp, gate.outputs[4], q3))     changed = true;
  if (this._drivePinBit(comp, gate.outputs[5], q3 ^ 1)) changed = true;
  if (this._drivePinBit(comp, gate.outputs[6], q4))     changed = true;
  if (this._drivePinBit(comp, gate.outputs[7], q4 ^ 1)) changed = true;
  return changed;
}

function _evaluateJkNotFfQuad_fn(comp, gate) {
  // 74376: Quad J-NOT-K flip flop (K=~J internally). Shared CLK and CLRn.
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

function _evaluateDFf9BitClrCeTri_fn(comp, gate) {
  // 74823: 9-bit bus-interface D register with async clear, clock enable, and
  // 3-state outputs. Source-verified function table (SN74AS823, all active LOW):
  //   OEn  CLRn  CEN  CLK   D | Q
  //    L    L    X    X     X | L      (async clear dominates)
  //    L    H    L    rise  H | H      (CEN low: load D on rising edge)
  //    L    H    L    rise  L | L
  //    L    H    H    X     X | hold   (CEN high: clock disabled, latch)
  //    H    X    X    X     X | Z      (output control; internal FFs unaffected)
  // inputs:  [OEn, CLRn, CEN, CLK, D0..D8]   outputs: [Q0..Q8]
  const bits = this._readGateInputs(comp, gate.inputs);
  const oen  = bits[0];
  const clrn = bits[1];
  const cen  = bits[2];
  const clk  = bits[3];
  const ds   = bits.slice(4, 13);
  if (!comp.state) comp.state = { q: new Array(9).fill(0), prevClk: clk };
  if (clrn === 0) {
    // Asynchronous clear: holds outputs LOW regardless of clock.
    comp.state.q = new Array(9).fill(0);
  } else if (comp.state.prevClk === 0 && clk === 1 && cen === 0) {
    comp.state.q = ds.slice();
  }
  comp.state.prevClk = clk;
  let changed = false;
  if (oen !== 0) {
    // Output control places the bus pins in high-impedance; FF state is kept.
    for (const op of gate.outputs) { if (this._drivePinHighZ(comp, op)) changed = true; }
    return changed;
  }
  for (let i = 0; i < 9; i++) {
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
  // 74380: 8 bit multifunction register. Simplified: D-FF with tri state.
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
  // 74383: 8 bit register, open collector. Same as D_FF_OCTAL (74273) but OC outputs.
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
  const isOC = comp.chipDef && comp.chipDef.openCollector;
  let changed = false;
  for (let i = 0; i < 8; i++) {
    if (isOC) {
      if (this._drivePinOC(comp, gate.outputs[i], comp.state.q[i])) changed = true;
    } else {
      if (this._drivePinBit(comp, gate.outputs[i], comp.state.q[i])) changed = true;
    }
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
chipEvaluators._evaluateDLatchQuad4042    = _evaluateDLatchQuad4042_fn;
chipEvaluators._evaluateJkNotFfQuad       = _evaluateJkNotFfQuad_fn;
chipEvaluators._evaluateDFfOctalCe        = _evaluateDFfOctalCe_fn;
chipEvaluators._evaluateDFfHexCe          = _evaluateDFfHexCe_fn;
chipEvaluators._evaluateDFf9BitClrCeTri   = _evaluateDFf9BitClrCeTri_fn;
chipEvaluators._evaluateDFfQuadCeCompl    = _evaluateDFfQuadCeCompl_fn;
chipEvaluators._evaluateMultiFuncReg8Bit  = _evaluateMultiFuncReg8Bit_fn;
chipEvaluators._evaluateAlu4Bit381        = _evaluateAlu4Bit381_fn;
chipEvaluators._evaluateAlu4Bit382        = _evaluateAlu4Bit382_fn;
chipEvaluators._evaluateDFfOctalOc        = _evaluateDFfOctalOc_fn;
chipEvaluators._evaluateMultiplier8x1     = _evaluateMultiplier8x1_fn;
chipEvaluators._evaluateSerialAdderQuad   = _evaluateSerialAdderQuad_fn;

// ── CD4032B / CD4038B triple serial adder ────────────────────────────────────
// Three independent serial full adders sharing one CLOCK and one CARRY-RESET.
// Each adder adds two serial bit streams A,B (LSB first) plus the carry stored
// from the previous bit; an INVERT command complements the SUM OUTPUT (used to
// build a complemented / 2's-complement subtract result). Distinct from the
// 74385 SERIAL_ADDER_QUAD primitive, which models subtract by inverting the B
// *input* — that corrupts the carry chain, has no CARRY-RESET, and is quad.
//
// Source: SGS-Thomson Microelectronics, "HCC/HCF4032B HCC/HCF4038B Triple
//   Serial Adders", doc 5-2677 (June 1989). [Online]. Available:
//   https://www.sm0vpo.com/_pdf/CD/CD_4032.pdf. Verified: PIN CONNECTIONS +
//   FUNCTIONAL DIAGRAM (p.1-2) and LOGIC/TIMING DIAGRAM (p.3), read as rendered
//   PDF page images (issues.md C4). Behaviour: "Each adder has ... an INVERT
//   command signal. When the command signal is a logical 1, the sum is
//   complemented." / "The carry is only added at the positive-going clock
//   transition for the HCC/HCF4032B" (4038B = negative-going). CARRY-RESET HIGH
//   forces the carry to 0 for the start of the next word.
//
// inputs:  [A1,B1,INV1, A2,B2,INV2, A3,B3,INV3, CARRY_RESET, CLOCK]
// outputs: [SUM1,SUM2,SUM3]
function _evaluateSerialAdderTriple4032_fn(comp, gate) {
  const bits = this._readGateInputs(comp, gate.inputs);
  const cr  = bits[9];   // CARRY RESET (active HIGH)
  const clk = bits[10];  // CLOCK (4032B: carry latched on positive edge)
  if (!comp.state) comp.state = { carry: [0, 0, 0], prevClk: clk };
  let changed = false;

  // Carry flip-flops update on the rising clock edge (carry from the previous
  // bit position is what the *current* SUM uses; this edge captures the carry
  // OUT for the next bit). CARRY-RESET HIGH clears the carry instead.
  if (comp.state.prevClk === 0 && clk === 1) {
    for (let i = 0; i < 3; i++) {
      if (cr) { comp.state.carry[i] = 0; continue; }
      const a = bits[i * 3];
      const b = bits[i * 3 + 1];
      const c = comp.state.carry[i];
      comp.state.carry[i] = (a & b) | (a & c) | (b & c); // carry-out = majority
    }
  }
  comp.state.prevClk = clk;

  // SUM is combinational: A XOR B XOR carry_in, then complemented by INVERT.
  for (let i = 0; i < 3; i++) {
    const a   = bits[i * 3];
    const b   = bits[i * 3 + 1];
    const inv = bits[i * 3 + 2];
    const sum = a ^ b ^ comp.state.carry[i] ^ inv;
    if (this._drivePinBit(comp, gate.outputs[i], sum)) changed = true;
  }
  return changed;
}
chipEvaluators._evaluateSerialAdderTriple4032 = _evaluateSerialAdderTriple4032_fn;

// ── CD4038B triple serial adder (negative-going clock sibling of the CD4032B) ─
// Identical function to SERIAL_ADDER_TRIPLE_4032 except the carry flip-flops
// latch on the FALLING clock edge. Kept as a separate primitive so the CD4032
// (positive edge) and CD4038 (negative edge) entries are each self-contained and
// neither agent's work depends on a shared flag mid-flight.
//
// Source: SGS-Thomson Microelectronics, "HCC/HCF4032B HCC/HCF4038B Triple
//   Serial Adders", drawing s-2677 (June 1989). [Online]. Available:
//   https://www.sm0vpo.com/_pdf/CD/CD_4032.pdf. Verified: DESCRIPTION + PIN
//   CONNECTIONS + FUNCTIONAL DIAGRAM (p.1-2) and the 4038B LOGIC/TIMING DIAGRAM
//   (p.4), read as rendered PDF page images (issues.md C4). Key behaviour: "The
//   carry is only added at ... the negative-going clock for the HCC/HCF4038B";
//   "When the [INVERT] command signal is a logical 1, the sum is complemented";
//   data enters LSB first; CARRY-RESET HIGH one bit before the first bit of the
//   next word forces the carry to 0.
//
// inputs:  [A1,B1,INV1, A2,B2,INV2, A3,B3,INV3, CARRY_RESET, CLOCK]
// outputs: [SUM1,SUM2,SUM3]
function _evaluateSerialAdderTriple4038_fn(comp, gate) {
  const bits = this._readGateInputs(comp, gate.inputs);
  const cr  = bits[9];   // CARRY RESET (active HIGH)
  const clk = bits[10];  // CLOCK (4038B: carry latched on the NEGATIVE edge)
  if (!comp.state) comp.state = { carry: [0, 0, 0], prevClk: clk };
  let changed = false;

  // Carry flip-flops update on the FALLING clock edge. CARRY-RESET HIGH clears
  // the carry instead of latching the carry-out.
  if (comp.state.prevClk === 1 && clk === 0) {
    for (let i = 0; i < 3; i++) {
      if (cr) { comp.state.carry[i] = 0; continue; }
      const a = bits[i * 3];
      const b = bits[i * 3 + 1];
      const c = comp.state.carry[i];
      comp.state.carry[i] = (a & b) | (a & c) | (b & c); // carry-out = majority
    }
  }
  comp.state.prevClk = clk;

  // SUM is combinational: A XOR B XOR carry_in, then complemented by INVERT.
  for (let i = 0; i < 3; i++) {
    const a   = bits[i * 3];
    const b   = bits[i * 3 + 1];
    const inv = bits[i * 3 + 2];
    const sum = a ^ b ^ comp.state.carry[i] ^ inv;
    if (this._drivePinBit(comp, gate.outputs[i], sum)) changed = true;
  }
  return changed;
}
chipEvaluators._evaluateSerialAdderTriple4038 = _evaluateSerialAdderTriple4038_fn;

// ── Block 24 Evaluator Functions ─────────────────────────────────────────────


function _evaluateDFfQuadTriCompl_fn(comp, gate) {
  // 74388: 4 bit D-FF with tri state outputs and complementary Q/Qn.
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
  // 74395: 4 bit cascadable shift register, tri state.
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
  const isOC = comp.chipDef && comp.chipDef.openCollector;
  let changed = false;
  if (comp.state.prevClk === 0 && clk === 1) {
    for (let i = 0; i < 7; i++) comp.state.q[i] = d[i];
  }
  comp.state.prevClk = clk;
  for (let i = 0; i < 7; i++) {
    if (isOC) {
      if (this._drivePinOC(comp, gate.outputs[i], comp.state.q[i])) changed = true;
    } else {
      if (this._drivePinBit(comp, gate.outputs[i], comp.state.q[i])) changed = true;
    }
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
  // 74401: CRC generator/checker stub (9401 equivalent).
  // inputs: [CP, D, S0, S1, S2, CWE, P, MR]
  // outputs: [Q, ER]
  // Full operation requires the selected polynomial division; the simplified
  // stub drives both outputs LOW (no detected error, zero remainder).
  let changed = false;
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
  // 74403: 16×4 FIFO with tri state outputs.
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
  // 74405: 3 to 8 decoder (Intel 8205), active LOW outputs.
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
  // 74407: Data access register, 8 bit, tri state.
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
  // 74410: 16×4 RAM with output register, tri state.
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
  // 74412: Multi-mode 8 bit latch (Intel 8212/3212 equiv), tri state.
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
  // 74416: 4 bit Bus Transceiver, tri state
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
  // 74425: Quad Buffer, active LOW individual enables, tri state
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
  // 74426: Quad Buffer, active HIGH individual enables, tri state
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
  // 74433: 64×4 FIFO with tri state outputs
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
  const isOC = comp.chipDef && comp.chipDef.openCollector;
  let changed = false;
  if (OE1n !== 0 || OE2n !== 0 || DIR !== 0) {
    for (const pin of gate.outputs) { if (this._drivePinHighZ(comp, pin)) changed = true; }
    return changed;
  }
  for (let i = 0; i < 4; i++) {
    if (isOC) {
      if (this._drivePinOC(comp, gate.outputs[i], bits[3+i])) changed = true;
    } else {
      if (this._drivePinBit(comp, gate.outputs[i], bits[3+i])) changed = true;
    }
  }
  return changed;
}

function _evaluateBusXcvrQuadInvOc_fn(comp, gate) {
  // 74441: Quad Inverting Bus Transceiver, OC outputs
  // inputs: OE1n, OE2n, DIR, A1..A4   outputs: B1..B4
  const bits = this._readGateInputs(comp, gate.inputs);
  const OE1n = bits[0], OE2n = bits[1], DIR = bits[2];
  const isOC = comp.chipDef && comp.chipDef.openCollector;
  let changed = false;
  if (OE1n !== 0 || OE2n !== 0 || DIR !== 0) {
    for (const pin of gate.outputs) { if (this._drivePinHighZ(comp, pin)) changed = true; }
    return changed;
  }
  for (let i = 0; i < 4; i++) {
    const out = bits[3+i] ? 0 : 1;
    if (isOC) {
      if (this._drivePinOC(comp, gate.outputs[i], out)) changed = true;
    } else {
      if (this._drivePinBit(comp, gate.outputs[i], out)) changed = true;
    }
  }
  return changed;
}

function _evaluateBusXcvrQuadTri_fn(comp, gate) {
  // 74442: Quad Bus Transceiver, tri state outputs
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
  // 74443: Quad Inverting Bus Transceiver, tri state outputs
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
  // 74444: Quad Mixed Bus Transceiver, tri state outputs
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
  // 74F455: Octal buffer with parity, inverting outputs, tri state.
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
  // 74F456: Octal buffer with parity, non inverting outputs, tri state.
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
  // Drive non inverted data outputs
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
  // 74461: 8 bit presettable binary counter, tri state outputs.
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
  // 74465/74467: Octal buffer, non inverting, tri state
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
  // 74466/74468: Octal buffer, inverting outputs, tri state
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

// 74x867 (async clear) / 74x869 (sync clear): synchronous 8-bit up/down counter.
// Control is an S1/S0 mode select, NOT discrete load/clear/direction pins:
//   Mode = 2*S1 + S0 -> 0 = Clear, 1 = Count down, 2 = Load, 3 = Count up.
// ENPn and ENTn are both active-LOW and must both be LOW to count. RCOn is
// active-LOW; ENT (not ENP) feeds it forward, and it pulses LOW at terminal
// count in the active direction (255 counting up, 0 counting down) for cascading.
// Outputs are plain totem-pole (no output-enable / 3-state on this family).
// gate.syncClear true => clear is synchronous (the '869); default async (the '867).
// Source: Texas Instruments, "SN54AS867/869, SN74ALS867A, SN74ALS869,
//   SN74AS867/869 Synchronous 8-Bit Up/Down Counters", SDAS115C (Dec 1982,
//   rev Jan 1995). [Online]. Available:
//   https://www.ti.com/lit/ds/symlink/sn74als867a.pdf. Verified: function table
//   (S1/S0), cascading description (ENT feeds RCO; both ENP/ENT low to count;
//   RCO low at 0 down / 255 up), and 'AS867 logic symbol (async 0R clear),
//   pages 1-4, read as PDF page images.
function _evaluateCounter8BitSync867_fn(comp, gate) {
  // inputs:  [S0, S1, A, B, C, D, E, F, G, H, ENPn, ENTn, CLK]
  // outputs: [QA, QB, QC, QD, QE, QF, QG, QH, RCOn]
  if (!comp.state) comp.state = {};
  if (comp.state.cnt === undefined) { comp.state.cnt = 0; comp.state.clkLast = 0; }
  const bits = this._readGateInputs(comp, gate.inputs);
  const s0 = bits[0], s1 = bits[1];
  const d = bits[2] | (bits[3] << 1) | (bits[4] << 2) | (bits[5] << 3) |
            (bits[6] << 4) | (bits[7] << 5) | (bits[8] << 6) | (bits[9] << 7);
  const enpn = bits[10], entn = bits[11], clk = bits[12];
  const mode = (s1 << 1) | s0; // 0 clear, 1 down, 2 load, 3 up
  const syncClear = !!gate.syncClear;

  // Asynchronous clear ('867): mode 0 forces zero immediately, independent of CLK.
  if (mode === 0 && !syncClear) comp.state.cnt = 0;

  const rising = (clk === 1 && comp.state.clkLast === 0);
  if (rising) {
    if (mode === 0) {                 // Clear
      if (syncClear) comp.state.cnt = 0;  // '869: clears on the clock edge
    } else if (mode === 2) {          // Load D inputs (synchronous)
      comp.state.cnt = d & 0xFF;
    } else if (enpn === 0 && entn === 0) {
      if (mode === 3) comp.state.cnt = (comp.state.cnt + 1) & 0xFF;        // up
      else if (mode === 1) comp.state.cnt = (comp.state.cnt + 255) & 0xFF; // down
    }
  }
  comp.state.clkLast = clk;

  const c = comp.state.cnt;
  // RCOn active-LOW: gated by ENT, asserted at terminal count in active direction.
  const rcoActive = (entn === 0) &&
    ((mode === 3 && c === 0xFF) || (mode === 1 && c === 0x00));
  const rcon = rcoActive ? 0 : 1;
  const outBits = [(c >> 0) & 1, (c >> 1) & 1, (c >> 2) & 1, (c >> 3) & 1,
                   (c >> 4) & 1, (c >> 5) & 1, (c >> 6) & 1, (c >> 7) & 1, rcon];
  let changed = false;
  for (let i = 0; i < gate.outputs.length; i++) {
    if (this._drivePinBit(comp, gate.outputs[i], outBits[i])) changed = true;
  }
  return changed;
}
chipEvaluators._evaluateCounter8BitSync867 = _evaluateCounter8BitSync867_fn;

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

// 74484: BCD to Binary Converter
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

// Shared linear ADC eval used by 74500 and 74505. Conversion is treated as
// instantaneous CLK/STARTn handshake is not stepped, output tracks VIN
// continuously. EOC/CC are held HIGH ("ready"). When OEn is HIGH the data
// outputs go HiZ; EOC/CC are still driven.
function _evaluateAdcLinear(comp, gate, bits) {
  const vin  = this._readPinVoltage(comp, 'VIN');
  let   vref = this._readPinVoltage(comp, 'VREF');
  if (!(vref > 0)) vref = VCC_VOLTAGE;
  const v    = (vin === undefined) ? 0 : vin;

  const fullScale = (1 << bits) - 1;
  let code = Math.round((v / vref) * fullScale);
  if (code < 0) code = 0;
  if (code > fullScale) code = fullScale;

  const oeDisabled = this._readPinBit(comp, 'OEn') === 1;
  let changed = false;

  for (let i = 0; i < bits; i++) {
    const pin = 'D' + i;
    if (oeDisabled) {
      if (this._drivePinHighZ(comp, pin)) changed = true;
    } else {
      if (this._drivePinBit(comp, pin, (code >> i) & 1)) changed = true;
    }
  }

  const donePin = gate.outputs.find(p => p === 'EOC' || p === 'CC');
  if (donePin && this._drivePinBit(comp, donePin, 1)) changed = true;

  return changed;
}

// 74500: 6 bit Flash ADC. Simplified: code = round((VIN/VREF) * 63).
function _evaluateAdc6BitFlash_fn(comp, gate) {
  return _evaluateAdcLinear.call(this, comp, gate, 6);
}

// 74505: 8 bit SAR ADC. Simplified: code = round((VIN/VREF) * 255).
function _evaluateAdc8BitSar_fn(comp, gate) {
  return _evaluateAdcLinear.call(this, comp, gate, 8);
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
chipEvaluators._evaluateAdc8BitSar        = _evaluateAdc8BitSar_fn;
chipEvaluators._evaluateMultiplier8Bit    = _evaluateMultiplier8Bit_fn;
chipEvaluators._evaluateDecoderProg2to4   = _evaluateDecoderProg2to4_fn;
chipEvaluators._evaluateMultiplier16Bit   = _evaluateMultiplier16Bit_fn;

// ── Block 29 evaluators ───────────────────────────────────────────────────────

function _evaluateCmp8BitOc_fn(comp, gate) {
  // 74518/74519: 8 bit identity comparator, open collector
  // inputs: G1n, A0-A7, B0-B7
  // G1n=1 → EQn=HiZ; equal→EQn=0; unequal→EQn=1
  const bits = this._readGateInputs(comp, gate.inputs);
  const g1n = bits[0];
  const eqnPin = gate.outputs[0];
  const isOC = comp.chipDef && comp.chipDef.openCollector;
  let changed = false;
  if (g1n) {
    if (this._drivePinHighZ(comp, eqnPin)) changed = true;
    return changed;
  }
  let aVal = 0, bVal = 0;
  for (let i = 0; i < 8; i++) aVal |= (bits[1 + i] << i);
  for (let i = 0; i < 8; i++) bVal |= (bits[9 + i] << i);
  const eqn = (aVal === bVal) ? 0 : 1;
  if (isOC) {
    if (this._drivePinOC(comp, eqnPin, eqn)) changed = true;
  } else {
    if (this._drivePinBit(comp, eqnPin, eqn)) changed = true;
  }
  return changed;
}

function _evaluateCmp8BitInv_fn(comp, gate) {
  // 74520/74521: 8 bit inverting comparator, tri state
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
  const isOC = comp.chipDef && comp.chipDef.openCollector;
  let changed = false;
  if (g1n) {
    if (this._drivePinHighZ(comp, eqPin)) changed = true;
    return changed;
  }
  let aVal = 0, bVal = 0;
  for (let i = 0; i < 8; i++) aVal |= (bits[1 + i] << i);
  for (let i = 0; i < 8; i++) bVal |= (bits[9 + i] << i);
  const eq = (aVal === bVal) ? 1 : 0;
  if (isOC) {
    if (this._drivePinOC(comp, eqPin, eq)) changed = true;
  } else {
    if (this._drivePinBit(comp, eqPin, eq)) changed = true;
  }
  return changed;
}

function _evaluateCmp8BitRegOc_fn(comp, gate) {
  // 74524: 8 bit registered identity comparator, OC
  // inputs: CLK, A0-A7, B0-B7
  // On rising CLK edge: capture A==B; EQn=0 if equal, =1 if not
  if (!comp.state) comp.state = { prevClk: 0, eqn: 1 };
  const bits = this._readGateInputs(comp, gate.inputs);
  const clk = bits[0];
  const isOC = comp.chipDef && comp.chipDef.openCollector;
  let changed = false;
  const eqnPin = gate.outputs[0];
  if (clk && !comp.state.prevClk) {
    let aVal = 0, bVal = 0;
    for (let i = 0; i < 8; i++) aVal |= (bits[1 + i] << i);
    for (let i = 0; i < 8; i++) bVal |= (bits[9 + i] << i);
    comp.state.eqn = (aVal === bVal) ? 0 : 1;
  }
  comp.state.prevClk = clk;
  if (isOC) {
    if (this._drivePinOC(comp, eqnPin, comp.state.eqn)) changed = true;
  } else {
    if (this._drivePinBit(comp, eqnPin, comp.state.eqn)) changed = true;
  }
  return changed;
}

function _evaluateLatchOctalTri_fn(comp, gate) {
  // 74531: Octal transparent latch, tri state
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
  // 74532: Octal D type register, tri state
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
  // 74533/74535: Octal transparent latch inverting, tri state
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

function _evaluateLatchReadbackInv_fn(comp, gate) {
  // 74x991: 8-bit D-type transparent read-back latch, inverting outputs.
  // inputs:  [OERBn, LE, D0..D7]              (OERBn active LOW)
  // outputs: [Q0n..Q7n, D0..D7]
  //   Q0n..Q7n : true logic (always-driven) INVERTING outputs — Qn = NOT(stored).
  //   D0..D7   : the shared 3-state read-back I/O bus (same pins as the D inputs).
  //
  // The '991 is a read-back latch: unlike a '533/'535 (LATCH_OCTAL_INV_TRI), the
  // 3-state control does NOT gate the Q outputs — those are always driven. Instead
  // OERBn gates a read-back buffer that pushes the stored byte back onto the D data
  // bus. This is the part's defining feature, so it is modeled directly using the
  // engine's bidirectional-pin support (same mechanism the octal transceivers use).
  //
  //   LE   HIGH  → latch transparent: capture D0..D7.
  //   LE   LOW   → hold.
  //   Qn         = NOT(stored)                 (always driven).
  //   OERBn LOW  → drive the stored TRUE byte back onto D0..D7 (read-back).
  //   OERBn HIGH → release D0..D7 (read-back buffer Hi-Z; D0..D7 act as inputs).
  //
  // Read-back presents the TRUE stored value (what was written in), matching the
  // '990/'992 datasheet definition of read-back; only the Q outputs are inverted.
  // Driving read-back onto D0..D7 while an external source also drives them is a
  // bus conflict on real hardware — the datasheet warns against it — so a caller
  // should release the D bus before asserting OERBn LOW, exactly as in silicon.
  if (!comp.state) comp.state = { q: new Array(8).fill(0) };
  const bits = this._readGateInputs(comp, gate.inputs);
  const oerbn = bits[0];
  const le    = bits[1];
  let changed = false;
  if (le) {
    for (let i = 0; i < 8; i++) comp.state.q[i] = bits[2 + i];
  }
  // Q outputs: inverting, always driven.
  for (let i = 0; i < 8; i++) {
    if (this._drivePinBit(comp, gate.outputs[i], comp.state.q[i] ^ 1)) changed = true;
  }
  // Read-back bus: true data onto D0..D7 when OERBn LOW, else released.
  for (let i = 0; i < 8; i++) {
    if (!oerbn) {
      if (this._drivePinBit(comp, gate.outputs[8 + i], comp.state.q[i])) changed = true;
    } else {
      if (this._drivePinHighZ(comp, gate.outputs[8 + i])) changed = true;
    }
  }
  return changed;
}

function _evaluateRegOctalInvTri_fn(comp, gate) {
  // 74534/74536: Octal D type register inverting, tri state
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
  // 74537: BCD to decimal decoder, tri state
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
chipEvaluators._evaluateLatchOctalTri     = _evaluateLatchOctalTri_fn;
chipEvaluators._evaluateRegOctalTri       = _evaluateRegOctalTri_fn;
chipEvaluators._evaluateLatchOctalInvTri  = _evaluateLatchOctalInvTri_fn;
chipEvaluators._evaluateLatchReadbackInv  = _evaluateLatchReadbackInv_fn;
chipEvaluators._evaluateRegOctalInvTri    = _evaluateRegOctalInvTri_fn;
chipEvaluators._evaluateBcdDecimalDecTri  = _evaluateBcdDecimalDecTri_fn;

// ── Block 30 evaluators ───────────────────────────────────────────────────────

function _evaluateDecoder3to8Tri_fn(comp, gate) {
  // 74538: 3 to 8 decoder, tri state
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
  // 74539: 2-to-4 decoder, tri state (one half)
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
  // 74540: Octal buffer/line driver, inverting, 3-state.
  // inputs: OE1, OE2, A1-A8; outputs: Y1-Y8 = NOT(A).
  // 3-state control is a 2-input NOR (TI SDAS025D, p.2): outputs drive only when
  // BOTH OE1 and OE2 are LOW; if either is HIGH all eight go high impedance.
  const bits = this._readGateInputs(comp, gate.inputs);
  const disabled = bits[0] || bits[1];
  let changed = false;
  for (let i = 0; i < 8; i++) {
    if (disabled) {
      if (this._drivePinHighZ(comp, gate.outputs[i])) changed = true;
    } else {
      if (this._drivePinBit(comp, gate.outputs[i], bits[2 + i] ^ 1)) changed = true;
    }
  }
  return changed;
}

function _evaluateTransceiverOctalReg_fn(comp, gate) {
  // 74543/74546/74615/74646/74647: Octal registered transceiver, non inverting
  // inputs: OEABn, OEBAn, LEAB, LEBA, CLK, DIR, A0-A7, B0-B7
  // On rising CLK: if DIR=1 latch AB-side (A→regAB), if DIR=0 latch BA-side (B→regBA)
  // DIR=1: drive B from regAB if !OEABn; DIR=0: drive A from regBA if !OEBAn
  // If chipDef.openCollector, data outputs sink only.
  if (!comp.state) comp.state = { prevClk: 0, regAB: new Array(8).fill(0), regBA: new Array(8).fill(0) };
  const bits = this._readGateInputs(comp, gate.inputs);
  const oeabn = bits[0], oeban = bits[1], clk = bits[4], dir = bits[5];
  const aVals = bits.slice(6, 14);
  const bVals = bits.slice(14, 22);
  const oc = !!(comp.chipDef && comp.chipDef.openCollector);
  const drive = (pin, bit) => oc ? this._drivePinOC(comp, pin, bit) : this._drivePinBit(comp, pin, bit);
  let changed = false;
  if (clk && !comp.state.prevClk) {
    if (dir) { for (let i = 0; i < 8; i++) comp.state.regAB[i] = aVals[i]; }
    else      { for (let i = 0; i < 8; i++) comp.state.regBA[i] = bVals[i]; }
  }
  comp.state.prevClk = clk;
  if (dir) {
    for (let i = 0; i < 8; i++) {
      if (!oeabn) {
        if (drive(gate.outputs[8 + i], comp.state.regAB[i])) changed = true;
      } else {
        if (this._drivePinHighZ(comp, gate.outputs[8 + i])) changed = true;
      }
    }
  } else {
    for (let i = 0; i < 8; i++) {
      if (!oeban) {
        if (drive(gate.outputs[i], comp.state.regBA[i])) changed = true;
      } else {
        if (this._drivePinHighZ(comp, gate.outputs[i])) changed = true;
      }
    }
  }
  return changed;
}

function _evaluateTransceiverOctalRegInv_fn(comp, gate) {
  // 74544/74614/74648/74649: Octal registered transceiver, inverting
  // Same as TRANSCEIVER_OCTAL_REG but outputs are inverted.
  // If chipDef.openCollector, data outputs sink only.
  if (!comp.state) comp.state = { prevClk: 0, regAB: new Array(8).fill(0), regBA: new Array(8).fill(0) };
  const bits = this._readGateInputs(comp, gate.inputs);
  const oeabn = bits[0], oeban = bits[1], clk = bits[4], dir = bits[5];
  const aVals = bits.slice(6, 14);
  const bVals = bits.slice(14, 22);
  const oc = !!(comp.chipDef && comp.chipDef.openCollector);
  const drive = (pin, bit) => oc ? this._drivePinOC(comp, pin, bit) : this._drivePinBit(comp, pin, bit);
  let changed = false;
  if (clk && !comp.state.prevClk) {
    if (dir) { for (let i = 0; i < 8; i++) comp.state.regAB[i] = aVals[i]; }
    else      { for (let i = 0; i < 8; i++) comp.state.regBA[i] = bVals[i]; }
  }
  comp.state.prevClk = clk;
  if (dir) {
    for (let i = 0; i < 8; i++) {
      if (!oeabn) {
        if (drive(gate.outputs[8 + i], comp.state.regAB[i] ^ 1)) changed = true;
      } else {
        if (this._drivePinHighZ(comp, gate.outputs[8 + i])) changed = true;
      }
    }
  } else {
    for (let i = 0; i < 8; i++) {
      if (!oeban) {
        if (drive(gate.outputs[i], comp.state.regBA[i] ^ 1)) changed = true;
      } else {
        if (this._drivePinHighZ(comp, gate.outputs[i])) changed = true;
      }
    }
  }
  return changed;
}

function _evaluateTransceiverOctalLatch_fn(comp, gate) {
  // 74547 (LS): Octal latched transceiver, non inverting
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

function _evaluateTransceiverOctalLatchSel_fn(comp, gate) {
  // 74x956 (SN74BCT956): Octal bus transceiver + latch, single OE, real-time/stored select.
  // The latch version of the 'BCT646 registered transceiver.
  // inputs:  OEn, DIR, LEAB, LEBA, SAB, SBA, A0-A7 (=A1..A8), B0-B7 (=B1..B8)
  // outputs: A0-A7 (=A1..A8), B0-B7 (=B1..B8)   (bidir pins; undriven side is Hi-Z)
  // Latches (transparent): LEAB HIGH → latchAB follows A, LOW → holds; LEBA likewise for B.
  //   (Datasheet: "data ... is stored in the latches when the ... latch-enable ... is low.")
  // Direction / enable: OEn LOW = transceiver; DIR HIGH → drive B (A is input),
  //   DIR LOW → drive A (B is input). OEn HIGH → isolation, both sides Hi-Z.
  // Select mux (per direction): SAB LOW → B gets real-time A, HIGH → B gets latched A;
  //   SBA LOW → A gets real-time B, HIGH → A gets latched B.
  // Source: TI SCBS088A FUNCTION TABLE + Figure 1, verified as PDF page images.
  if (!comp.state) comp.state = { latchAB: new Array(8).fill(0), latchBA: new Array(8).fill(0) };
  const bits = this._readGateInputs(comp, gate.inputs);
  const oen = bits[0], dir = bits[1], leab = bits[2], leba = bits[3], sab = bits[4], sba = bits[5];
  const aVals = bits.slice(6, 14);
  const bVals = bits.slice(14, 22);
  let changed = false;
  // Input latches are always enabled; capture while the latch is transparent (LE HIGH).
  if (leab) { for (let i = 0; i < 8; i++) comp.state.latchAB[i] = aVals[i]; }
  if (leba) { for (let i = 0; i < 8; i++) comp.state.latchBA[i] = bVals[i]; }
  for (let i = 0; i < 8; i++) {
    if (oen) {
      // Isolation: release both buses.
      if (this._drivePinHighZ(comp, gate.outputs[i])) changed = true;
      if (this._drivePinHighZ(comp, gate.outputs[8 + i])) changed = true;
    } else if (dir) {
      // A → B: B outputs, A released.
      const bOut = sab ? comp.state.latchAB[i] : aVals[i];
      if (this._drivePinBit(comp, gate.outputs[8 + i], bOut)) changed = true;
      if (this._drivePinHighZ(comp, gate.outputs[i])) changed = true;
    } else {
      // B → A: A outputs, B released.
      const aOut = sba ? comp.state.latchBA[i] : bVals[i];
      if (this._drivePinBit(comp, gate.outputs[i], aOut)) changed = true;
      if (this._drivePinHighZ(comp, gate.outputs[8 + i])) changed = true;
    }
  }
  return changed;
}

function _evaluateDecoder3to8LatchAck_fn(comp, gate) {
  // 74F547: 3 to 8 decoder with address latch and acknowledge output (stub)
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
  // 74F548: 3 to 8 decoder with acknowledge output (no latch)
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
  // 74560: Synchronous 4 bit decade counter with tri state outputs
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
  // 74561: Synchronous 4 bit binary counter with tri state outputs
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
chipEvaluators._evaluateTransceiverOctalLatchSel = _evaluateTransceiverOctalLatchSel_fn;
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
  // 74568: Synchronous 4 bit decade up/down counter with tri state outputs
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
  // 74569: Synchronous 4 bit binary up/down counter with tri state outputs
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
  // 74575: Octal D type FF with synchronous clear, tri state
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
  // 74577: Octal D type FF with synchronous clear, inverting outputs, tri state
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

function _evaluateBusFf9BitTri_fn(comp, gate) {
  // 74823 (non-inverting) / 74824 (inverting): 9 bit bus-interface D flip-flop with
  // asynchronous clear, active-LOW clock enable, and 3-state outputs.
  // inputs:  OEn, CLRn, CLKENn, CLK, D0..D8   (13 inputs)
  // outputs: Q0..Q8                            (9 outputs)
  // gate.invert === true → SN74AS824A: registered Q = NOT(D); otherwise Q = D.
  // Per the function table: CLRn LOW forces every Q LOW asynchronously (independent of
  // the clock); CLKENn HIGH inhibits the clock (hold Q0); on a CLK low-to-high edge with
  // CLKENn LOW the data is captured; OEn HIGH places the outputs in Hi-Z without
  // disturbing the stored data.
  const inv = gate.invert === true;
  if (!comp.state) comp.state = { prevClk: 0, q: new Array(9).fill(0) };
  const bits = this._readGateInputs(comp, gate.inputs);
  const oen = bits[0], clrn = bits[1], clken = bits[2], clk = bits[3];
  let changed = false;
  if (!clrn) {
    for (let i = 0; i < 9; i++) comp.state.q[i] = 0;          // async clear → Q = LOW
  } else if (clk && !comp.state.prevClk && !clken) {
    for (let i = 0; i < 9; i++) comp.state.q[i] = inv ? (bits[4 + i] ^ 1) : bits[4 + i];
  }
  comp.state.prevClk = clk;
  for (let i = 0; i < 9; i++) {
    if (oen) {
      if (this._drivePinHighZ(comp, gate.outputs[i])) changed = true;
    } else {
      if (this._drivePinBit(comp, gate.outputs[i], comp.state.q[i])) changed = true;
    }
  }
  return changed;
}

function _evaluateBusFf10BitTri_fn(comp, gate) {
  // 74F1821 / 74F821: 10 bit bus-interface D flip-flop with a common buffered clock,
  // a common active-LOW output enable, and 3-state true outputs. No clear, no clock
  // enable — the plain 10-bit register of the F-series bus-interface family.
  // inputs:  OEn, CLK, D0..D9   (12 inputs)
  // outputs: Q0..Q9             (10 outputs)
  // gate.invert === true → inverting sibling: registered Q = NOT(D); otherwise Q = D.
  // Per the 74F821 function table: on a CLK low-to-high transition the data is captured;
  // holding CLK HIGH or LOW (no edge) holds the stored data; OEn HIGH floats the outputs
  // (Hi-Z) without disturbing the flip-flop contents; OEn LOW presents the stored data.
  const inv = gate.invert === true;
  if (!comp.state) comp.state = { prevClk: 0, q: new Array(10).fill(0) };
  const bits = this._readGateInputs(comp, gate.inputs);
  const oen = bits[0], clk = bits[1];
  let changed = false;
  if (clk && !comp.state.prevClk) {
    for (let i = 0; i < 10; i++) comp.state.q[i] = inv ? (bits[2 + i] ^ 1) : bits[2 + i];
  }
  comp.state.prevClk = clk;
  for (let i = 0; i < 10; i++) {
    if (oen) {
      if (this._drivePinHighZ(comp, gate.outputs[i])) changed = true;
    } else {
      if (this._drivePinBit(comp, gate.outputs[i], comp.state.q[i])) changed = true;
    }
  }
  return changed;
}

function _evaluateBusFf8Bit3OeTri_fn(comp, gate) {
  // 74825 (non-inverting) / 74826 (inverting): 8 bit bus-interface D flip-flop with
  // asynchronous clear, active-LOW clock enable, and 3-state outputs gated by THREE
  // active-LOW output enables (OE1n, OE2n, OE3n) for multi-master bus control.
  // inputs:  OE1n, OE2n, OE3n, CLRn, CLKENn, CLK, D0..D7   (14 inputs)
  // outputs: Q0..Q7                                          (8 outputs)
  // gate.invert === true → 74826 (registered Q = NOT(D)); otherwise Q = D (74825).
  // Per the datasheet function table: CLRn LOW forces every Q LOW asynchronously
  // (dominates the clock); CLKENn HIGH inhibits the clock (hold); on a CLK
  // low-to-high edge with CLKENn LOW the data is captured; the outputs go to Hi-Z
  // unless all three output enables are LOW, without disturbing the stored data.
  const inv = gate.invert === true;
  if (!comp.state) comp.state = { prevClk: 0, q: new Array(8).fill(0) };
  const bits = this._readGateInputs(comp, gate.inputs);
  const oe1 = bits[0], oe2 = bits[1], oe3 = bits[2];
  const clrn = bits[3], clken = bits[4], clk = bits[5];
  const hiZ = oe1 || oe2 || oe3;               // any OEn HIGH → outputs float
  let changed = false;
  if (!clrn) {
    for (let i = 0; i < 8; i++) comp.state.q[i] = 0;          // async clear → Q = LOW
  } else if (clk && !comp.state.prevClk && !clken) {
    for (let i = 0; i < 8; i++) comp.state.q[i] = inv ? (bits[6 + i] ^ 1) : bits[6 + i];
  }
  comp.state.prevClk = clk;
  for (let i = 0; i < 8; i++) {
    if (hiZ) {
      if (this._drivePinHighZ(comp, gate.outputs[i])) changed = true;
    } else {
      if (this._drivePinBit(comp, gate.outputs[i], comp.state.q[i])) changed = true;
    }
  }
  return changed;
}

function _evaluateCounter8BitBidirTri_fn(comp, gate) {
  // 74579: 8 bit bidirectional synchronous binary counter with tri state outputs
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
chipEvaluators._evaluateBusFf9BitTri                = _evaluateBusFf9BitTri_fn;
chipEvaluators._evaluateBusFf10BitTri               = _evaluateBusFf10BitTri_fn;
chipEvaluators._evaluateBusFf8Bit3OeTri             = _evaluateBusFf8Bit3OeTri_fn;
chipEvaluators._evaluateCounter8BitBidirTri         = _evaluateCounter8BitBidirTri_fn;
chipEvaluators._evaluateAluBcd4Bit                  = _evaluateAluBcd4Bit_fn;
chipEvaluators._evaluateAdderBcd4Bit                = _evaluateAdderBcd4Bit_fn;

// ── Block 32 evaluators ──────────────────────────────────────────────────────

function _evaluateShiftReg8BitLatchTri_fn(comp, gate) {
  // 74589: 8 bit serial in shift register with input latch, tri state QH output.
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
  // 74590/74591: 8 bit binary counter with separate output register, tri state.
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
  const isOC = !!(comp.chipDef && comp.chipDef.openCollector);
  let changed = false;
  if (oen === 0) {
    if (isOC) {
      changed = this._drivePinBitsOC(comp, gate.outputs.slice(0, 8), state.reg);
    } else {
      changed = this._drivePinBits(comp, gate.outputs.slice(0, 8), state.reg);
    }
  } else {
    changed = this._drivePinsHighZ(comp, gate.outputs.slice(0, 8));
  }
  // RC = ripple carry: high when counter is at max (255)
  const rcBit = state.count === 255 ? 1 : 0;
  if (isOC) {
    if (this._drivePinOC(comp, gate.outputs[8], rcBit)) changed = true;
  } else {
    if (this._drivePinBit(comp, gate.outputs[8], rcBit)) changed = true;
  }
  return changed;
}

function _evaluateCounter8BitRegOutOc_fn(comp, gate) {
  // 74591: OC variant. The shared TRI evaluator branches on chipDef.openCollector,
  // so this thin wrapper just delegates.
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
  // 74593: Like 74592 but with tri state output on D0-D7 bidirectional bus.
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
  // 74x597: 8-bit parallel-in / serial-out shift register with an input storage latch.
  // A-H captured into the storage latch on the rising edge of RCK.
  // SRCLR=0  (active low): direct/async clear of the shift register (overrides load + shift).
  // SRLOAD=0 (active low): direct/async load of the storage latch into the shift register.
  // SRCLR=1 & SRLOAD=1 & rising SRCK: shift (SER enters stage A=bit0, stage H=bit7 exits at QHs).
  // QHs = bit7 = the only serial output (datasheet label QH').
  // inputs:  [SER, SRCK, RCK, SRLOAD, SRCLR, A, B, C, D, E, F, G, H]
  // outputs: [QHs]
  const [serN, srckN, rckN, srloadN, srclrN,
         aN, bN, cN, dN, eN, fN, gN, hN] = gate.inputs;
  const [qhName] = gate.outputs;
  const state = this._getSeqState(comp, qhName,
    { sr: new Array(8).fill(0), latch: new Array(8).fill(0),
      prevSRCK: 0, prevRCK: 0 });

  // Input storage latch: capture A-H on rising RCK
  const rck = this._readPinBit(comp, rckN);
  if (state.prevRCK === 0 && rck === 1) {
    const dNames = [aN, bN, cN, dN, eN, fN, gN, hN];
    for (let i = 0; i < 8; i++) state.latch[i] = this._readPinBit(comp, dNames[i]);
  }
  state.prevRCK = rck;

  const srclr  = this._readPinBit(comp, srclrN);
  const srload = this._readPinBit(comp, srloadN);
  const srck   = this._readPinBit(comp, srckN);

  if (srclr === 0) {
    // Direct overriding clear (async) — dominates load and shift
    state.sr = new Array(8).fill(0);
  } else if (srload === 0) {
    // Direct overriding load from the storage latch (async)
    state.sr = state.latch.slice();
  } else if (state.prevSRCK === 0 && srck === 1) {
    // Shift on rising SRCK: bit0 gets SER, bit1 gets old bit0, ..., bit7 gets old bit6
    const ser = this._readPinBit(comp, serN);
    state.sr.pop();
    state.sr.unshift(ser);
  }
  state.prevSRCK = srck;

  // QHs = bit7 (stage H = serial output end of the chain)
  return this._drivePinBit(comp, qhName, state.sr[7]);
}

function _evaluateShiftReg8BitSelTri_fn(comp, gate) {
  // 74598: 8 bit shift register, selectable PI/PO, input latches, tri state.
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
  // 74620/622/638/640/642/644: Octal bidirectional bus transceiver, inverting outputs.
  // gate.inputs: [A1..A8, B1..B8, DIR, OEn]  (indices 0-7=A, 8-15=B, 16=DIR, 17=OEn)
  // gate.outputs: [A1..A8, B1..B8]           (indices 0-7=A, 8-15=B)
  // OEn=0: enabled; OEn=1: all outputs HiZ.
  // DIR=1: A→/B (read A-side, drive inverted B-side; A-side HiZ).
  // DIR=0: B→/A (read B-side, drive inverted A-side; B-side HiZ).
  // If chipDef.openCollector, data outputs sink only.
  const oe  = this._readPinBit(comp, gate.inputs[17]);
  const dir = this._readPinBit(comp, gate.inputs[16]);
  const oc  = !!(comp.chipDef && comp.chipDef.openCollector);
  const drive = (pin, bit) => oc ? this._drivePinOC(comp, pin, bit) : this._drivePinBit(comp, pin, bit);
  let changed = false;
  if (oe !== 0) {
    if (this._drivePinsHighZ(comp, gate.outputs)) changed = true;
  } else if (dir === 1) {
    for (let i = 0; i < 8; i++) {
      if (this._drivePinHighZ(comp, gate.outputs[i])) changed = true;
    }
    for (let i = 0; i < 8; i++) {
      const bit = this._readPinBit(comp, gate.inputs[i]) ^ 1;
      if (drive(gate.outputs[8 + i], bit)) changed = true;
    }
  } else {
    for (let i = 0; i < 8; i++) {
      const bit = this._readPinBit(comp, gate.inputs[8 + i]) ^ 1;
      if (drive(gate.outputs[i], bit)) changed = true;
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
  // 74666: 8 bit D type transparent read-back latch, non inverting, tri state.
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

function _evaluateLatchTransTri_fn(comp, gate) {
  // Width-agnostic non-inverting D-type transparent latch with 3-state outputs.
  // No clear line. This is the 74x841/'1841 (10-bit) function; the bit count comes
  // from gate.outputs.length so 8/9-bit siblings can share it.
  //   inputs:  [OEn, LE, D0..D(n-1)]     outputs: [Q0..Q(n-1)]
  // Function table (SN74ALS841, TI SDAS059C, page 2):
  //   OEn LOW,  LE HIGH → transparent: Q follows D.
  //   OEn LOW,  LE LOW  → hold the last sampled word (Q0).
  //   OEn HIGH          → Q outputs high-impedance; stored state is untouched
  //                       ("OE does not affect the internal operation of the latches").
  const n     = gate.outputs.length;
  const state = this._getSeqState(comp, gate.outputs[0], { q: new Array(n).fill(0) });
  const bits  = this._readGateInputs(comp, gate.inputs);
  const oen = bits[0];
  const le  = bits[1];
  const d   = bits.slice(2, 2 + n);
  let changed = false;
  if (le) {
    for (let i = 0; i < n; i++) state.q[i] = d[i];
  }
  for (let i = 0; i < n; i++) {
    if (oen) {
      if (this._drivePinHighZ(comp, gate.outputs[i])) changed = true;
    } else {
      if (this._drivePinBit(comp, gate.outputs[i], state.q[i])) changed = true;
    }
  }
  return changed;
}

chipEvaluators._evaluateLatchTransTri = _evaluateLatchTransTri_fn;

function _evaluateLatchReadbackTri_fn(comp, gate) {
  // Width-agnostic D-type transparent read-back latch with 3-state outputs and an
  // asynchronous active-LOW clear. This is the wide sibling of LATCH_8BIT_TRI /
  // LATCH_8BIT_INV_TRI (74x666/667): the SN74ALS99x read-back latch family.
  // Used by the 9-bit '992 (non-inverting) / '993 (inverting) 24-pin parts; the
  // bit count comes from gate.outputs.length so the 8/10-bit siblings can share it.
  //   inputs:  [D0..D(n-1), LE, OEn, CLRn]     outputs: [Q0..Q(n-1)]
  //   gate.invert === true → inverting outputs (the '993/'991/'995).
  //     CLRn LOW  → internal latch cleared to 0 (async, dominates LE)
  //     LE   HIGH → transparent, latch follows D
  //     LE   LOW  → hold last stored word
  //     OEn  HIGH → Q outputs high-impedance; stored state is untouched
  //     OEn  LOW  → drive Q = stored bit (complemented when gate.invert)
  // NOTE: the separate read-back enable (OERB) that drives the stored word back
  // onto the D bus is NOT modeled — the D pins are unidirectional inputs in this
  // engine, so read-back onto them would need bidirectional I/O ports. The Q-side
  // behavior above is faithful; only the read-back path is omitted (issues.md C88).
  const n     = gate.outputs.length;
  const inv   = gate.invert === true;
  const state = this._getSeqState(comp, gate.outputs[0], { q: new Array(n).fill(0) });
  const bits  = this._readGateInputs(comp, gate.inputs);
  const d    = bits.slice(0, n);
  const le   = bits[n];
  const oen  = bits[n + 1];
  const clrn = bits[n + 2];
  let changed = false;
  if (!clrn) {
    state.q.fill(0);
  } else if (le) {
    for (let i = 0; i < n; i++) state.q[i] = d[i];
  }
  for (let i = 0; i < n; i++) {
    if (oen) {
      if (this._drivePinHighZ(comp, gate.outputs[i])) changed = true;
    } else {
      const q = inv ? (state.q[i] ^ 1) : state.q[i];
      if (this._drivePinBit(comp, gate.outputs[i], q)) changed = true;
    }
  }
  return changed;
}

chipEvaluators._evaluateLatchReadbackTri = _evaluateLatchReadbackTri_fn;

function _evaluateLatch8BitInvTri_fn(comp, gate) {
  // 74667: 8 bit D type transparent read-back latch, inverting, tri state.
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

function _evaluateLatch10BitReadbackInv_fn(comp, gate) {
  // 74x995: 10-bit inverting D-type transparent read-back latch.
  //
  // Architecture (per the SN74ALS990/992 family datasheets — the 995-specific
  // datasheet is obsolete/unavailable, see the chip entry's header comment):
  //   * LE (latch enable) HIGH  → transparent: internal latch follows D0..D9.
  //     LE LOW → hold the last sampled word.
  //   * Q0n..Q9n are dedicated TRUE-LOGIC outputs (always driven, never 3-state)
  //     that present the INVERTED stored word. Unlike a 373-style latch, the
  //     single control pin does NOT 3-state these — the 10-bit part has no room
  //     for a separate output-enable pin.
  //   * OERB (read-back output enable, active LOW) is the only 3-state control.
  //     OERB LOW drives the stored word back onto the bidirectional D0..D9 bus;
  //     OERB HIGH releases D0..D9 (Hi-Z) so they act as inputs. Read-back presents
  //     the stored (non-inverted) value, matching the verified 990 read-back path
  //     ("the data present at the output of the data latches"); only the dedicated
  //     Q outputs invert. OERB does not affect the internal latch.
  //
  // inputs:  [OERB, D0..D9, LE]
  // outputs: [Q0n..Q9n, D0..D9]   (Q outputs + read-back drivers on the D bus)
  const oerbN     = gate.inputs[0];
  const dNames    = gate.inputs.slice(1, 11);   // D0..D9 as inputs
  const leN       = gate.inputs[11];
  const qNames    = gate.outputs.slice(0, 10);  // Q0n..Q9n
  const dOutNames = gate.outputs.slice(10, 20); // D0..D9 as read-back drivers
  const state = this._getSeqState(comp, qNames[0], { q: new Array(10).fill(0) });

  // Transparent sample while LE HIGH.
  const le = this._readPinBit(comp, leN);
  if (le === 1) {
    for (let i = 0; i < 10; i++) state.q[i] = this._readPinBit(comp, dNames[i]);
  }

  let changed = false;
  // Dedicated Q outputs: inverted stored word, always driven.
  for (let i = 0; i < 10; i++) {
    if (this._drivePinBit(comp, qNames[i], state.q[i] ? 0 : 1)) changed = true;
  }
  // Read-back onto the D bus: OERB LOW drives stored word; OERB HIGH → Hi-Z.
  const oerb = this._readPinBit(comp, oerbN);
  for (let i = 0; i < 10; i++) {
    if (oerb === 0) {
      if (this._drivePinBit(comp, dOutNames[i], state.q[i])) changed = true;
    } else {
      if (this._drivePinHighZ(comp, dOutNames[i])) changed = true;
    }
  }
  return changed;
}

chipEvaluators._evaluateLatch10BitReadbackInv = _evaluateLatch10BitReadbackInv_fn;

function _evaluateLatch9BitPreClrTri_fn(comp, gate) {
  // 74843 / 74844: 9-bit bus-interface transparent D latch with async preset,
  // async clear, and 3-state outputs. Source-verified function table
  // (SN74ALS843, PRE/CLR/OE all active LOW, non-inverting data):
  //   PRE  CLR  OE  LE  D | Q
  //    L   X    L   X   X | H     (async preset dominates)
  //    H   L    L   X   X | L     (async clear)
  //    H   H    L   H   L | L     (LE high: transparent, Q follows D)
  //    H   H    L   H   H | H
  //    H   H    L   L   X | Q0    (LE low: latched, hold)
  //    X   X    H   X   X | Z     (output disabled; latch state unaffected)
  // gate.invert === true selects the inverting-output '844: the latch core is
  // identical (same PRE/CLR/LE behavior on the internal bit), only the output
  // buffer inverts. So on the '844 preset drives Q LOW, clear drives Q HIGH, and
  // while transparent Q = NOT D. state.q always holds the internal (non-inverted)
  // bit so the inversion never affects hold/preset/clear state, only the drive.
  // inputs:  [D0..D8, LE, OEn, CLRn, PREn]   outputs: [Q0..Q8]
  const inv   = gate.invert === true;
  const state = this._getSeqState(comp, gate.outputs[0], { q: new Array(9).fill(0) });
  const bits = this._readGateInputs(comp, gate.inputs);
  const d    = bits.slice(0, 9);
  const le   = bits[9];
  const oen  = bits[10];
  const clrn = bits[11];
  const pren = bits[12];
  let changed = false;
  if (!pren) {
    state.q.fill(1);        // preset dominates clear
  } else if (!clrn) {
    state.q.fill(0);
  } else if (le) {
    for (let i = 0; i < 9; i++) state.q[i] = d[i];
  }
  for (let i = 0; i < 9; i++) {
    if (oen) {
      if (this._drivePinHighZ(comp, gate.outputs[i])) changed = true;
    } else {
      const q = inv ? (state.q[i] ^ 1) : state.q[i];
      if (this._drivePinBit(comp, gate.outputs[i], q)) changed = true;
    }
  }
  return changed;
}

chipEvaluators._evaluateLatch9BitPreClrTri = _evaluateLatch9BitPreClrTri_fn;

function _evaluateLatch9BitReadbackTri_fn(comp, gate) {
  // 74x992: 9-bit D-type transparent READ-BACK latch, non-inverting, 3-state.
  // Source-verified function (SN74ALS992, all controls active LOW):
  //   CLR  OEQ  OERB  LE  D | Q       D pins
  //    L    X    X    X   X | L        (async clear: latch -> 0)
  //    H    L    H    H   d | d        (LE high: transparent, Q follows D)
  //    H    L    H    L   X | Q0       (LE low: latched, hold)
  //    H    H    X    X   X | Z         Q outputs disabled by OEQ (state kept)
  //    H    X    L    X   X | -        stored word driven back onto the D pins
  //    H    X    H    X   X | -        D pins released (act as data inputs)
  // Two independent 3-state controls: OEQ gates the true Q outputs; OERB gates a
  // read-back path that drives the *latched* word back onto the shared D bus.
  // Neither OE alters the stored bits. The nine D pins are bidirectional: while
  // OERB is HIGH they are data inputs; while OERB is LOW the chip sources them.
  // Per the datasheet timing note read-back is intended while the latch holds
  // (LE low), so the read-back drive and the latch's own input never fight.
  //
  // gate.inputs:  [D0..D8 (0-8), LE (9), OEQn (10), OERBn (11), CLRn (12)]
  // gate.outputs: [Q0..Q8 (0-8), D0..D8 (9-17)]   (D repeated: read-back drive)
  const state = this._getSeqState(comp, gate.outputs[0], { q: new Array(9).fill(0) });
  const bits  = this._readGateInputs(comp, gate.inputs);
  const d     = bits.slice(0, 9);
  const le    = bits[9];
  const oeqn  = bits[10];
  const oerbn = bits[11];
  const clrn  = bits[12];
  let changed = false;
  if (!clrn) {
    state.q.fill(0);
  } else if (le) {
    for (let i = 0; i < 9; i++) state.q[i] = d[i];
  }
  // True Q outputs (outputs[0..8]), gated by OEQ.
  for (let i = 0; i < 9; i++) {
    if (oeqn) {
      if (this._drivePinHighZ(comp, gate.outputs[i])) changed = true;
    } else {
      if (this._drivePinBit(comp, gate.outputs[i], state.q[i])) changed = true;
    }
  }
  // Read-back onto the D pins (outputs[9..17]), gated by OERB.
  for (let i = 0; i < 9; i++) {
    if (oerbn) {
      if (this._drivePinHighZ(comp, gate.outputs[9 + i])) changed = true;
    } else {
      if (this._drivePinBit(comp, gate.outputs[9 + i], state.q[i])) changed = true;
    }
  }
  return changed;
}

chipEvaluators._evaluateLatch9BitReadbackTri = _evaluateLatch9BitReadbackTri_fn;

function _evaluateLatch8BitPreClrOc3Tri_fn(comp, gate) {
  // 74845 / 74846: 8-bit bus-interface transparent D latch with async preset,
  // async clear, three separate output-control pins, and 3-state outputs.
  // Source-verified function table (SN74ALS845, non-inverting data):
  //   PRE  CLR  OC1 OC2 OC3  C   D | Q
  //    L    H    L   L   L   X   X | H     (async preset dominates)
  //    H    L    L   L   L   X   X | L     (async clear)
  //    L    L    L   L   L   X   X | H     (both low → preset condition, H)
  //    H    H    L   L   L   H   L | L     (C high: transparent, Q follows D)
  //    H    H    L   L   L   H   H | H
  //    H    H    L   L   L   L   X | Q0    (C low: latched, hold)
  //    X    X    H   X   X   X   X | Z     (any OC high → outputs disabled)
  //    X    X    X   H   X   X   X | Z
  //    X    X    X   X   H   X   X | Z
  // C is the latch-enable (level-sensitive, active HIGH) — this part is a
  // transparent latch, not an edge-triggered flip-flop. Outputs are enabled only
  // when all three output controls are LOW; any HIGH forces Hi-Z. The three OC
  // pins let three bus masters each veto the drive independently.
  // gate.invert === true selects the inverting '846. Per the Am29846 function
  // table the inversion applies ONLY to the transparent data path (internal Q =
  // NOT D), NOT to the asynchronous controls: preset still forces the outputs
  // HIGH and clear still forces them LOW, exactly as on the non-inverting '845.
  // So state.q holds the final OUTPUT-domain value and only the D-capture step
  // is inverted. For invert === false this is identical to the plain '845.
  // inputs: [D0..D7, LE, OC1, OC2, OC3, CLRn, PREn]   outputs: [Q0..Q7]
  const inv   = gate.invert === true;
  const state = this._getSeqState(comp, gate.outputs[0], { q: new Array(8).fill(0) });
  const bits  = this._readGateInputs(comp, gate.inputs);
  const d    = bits.slice(0, 8);
  const le   = bits[8];
  const oc1  = bits[9];
  const oc2  = bits[10];
  const oc3  = bits[11];
  const clrn = bits[12];
  const pren = bits[13];
  const disabled = oc1 || oc2 || oc3;
  let changed = false;
  if (!pren) {
    state.q.fill(1);        // preset dominates clear → outputs HIGH (not inverted)
  } else if (!clrn) {
    state.q.fill(0);        // clear → outputs LOW (not inverted)
  } else if (le) {
    for (let i = 0; i < 8; i++) state.q[i] = inv ? (d[i] ^ 1) : d[i];
  }
  for (let i = 0; i < 8; i++) {
    if (disabled) {
      if (this._drivePinHighZ(comp, gate.outputs[i])) changed = true;
    } else {
      if (this._drivePinBit(comp, gate.outputs[i], state.q[i])) changed = true;
    }
  }
  return changed;
}

chipEvaluators._evaluateLatch8BitPreClrOc3Tri = _evaluateLatch8BitPreClrOc3Tri_fn;

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

function _evaluateAcc4Bit681_fn(comp, gate) {
  // 74x681: 4-bit parallel binary accumulator with 3-state I/O.
  // Full datasheet citation lives in the chips36.js '74x681' entry header.
  //
  // Architecture (TI SN54LS681/SN74LS681, function tables 1/2/3):
  //   • A REGISTER  — 4-bit storage (QA), one ALU operand.
  //   • B SHIFT REGISTER — 4-bit storage/shift/accumulator (QB), other operand.
  //   • ALU — 16 arithmetic (M=L, Table 1) + 16 logic (M=H, Table 2) functions of
  //     QA and QB, selected by AS2..AS0 and carry-in Cn (active HIGH).
  //   • Four bidirectional I/O ports carry the ALU result F out, or load word A/B in.
  //   • RS2..RS0 pick one of eight register modes each rising clock edge (Table 3).
  //
  // gate.inputs (15):  [CLK, RS2, RS1, RS0, AS2, AS1, AS0, M, Cn,
  //                     LI/RO, RI/LO, I/O0, I/O1, I/O2, I/O3]
  // gate.outputs (9):  [I/O0, I/O1, I/O2, I/O3, Cn+4, G, P, LI/RO, RI/LO]
  const [clkN, rs2N, rs1N, rs0N, as2N, as1N, as0N, mN, cnN,
         liroN, riloN, io0N, io1N, io2N, io3N] = gate.inputs;
  const [oIo0, oIo1, oIo2, oIo3, oCn4, oG, oP, oLiro, oRilo] = gate.outputs;

  const state = this._getSeqState(comp, oCn4, { A: [0,0,0,0], B: [0,0,0,0], prevClk: 0 });

  const rs = this._readPinBit(comp, rs0N) | (this._readPinBit(comp, rs1N) << 1) | (this._readPinBit(comp, rs2N) << 2);
  const as = this._readPinBit(comp, as0N) | (this._readPinBit(comp, as1N) << 1) | (this._readPinBit(comp, as2N) << 2);
  const m   = this._readPinBit(comp, mN);
  const cn  = this._readPinBit(comp, cnN);
  const clk = this._readPinBit(comp, clkN);

  // ── ALU: combinational function of the A and B REGISTER contents ──────────
  // (not of the external I/O pins). Both modes reduce to "operand-word + Cn":
  //   arithmetic (Table 1): F = combination(A,B) + Cn, ripple carry → Cn+4.
  //   logic (Table 2): F = perbit_logic(A,B) + Cn (the datasheet's "PLUS 1"
  //   column IS the same adder incrementing the logic word — e.g. AS=000 gives
  //   0000 → 0001 when Cn=H, AS=011 gives 1111 → 0000 with carry out).
  const alu = (A, B) => {
    let base; // operand combination BEFORE the Cn increment (may exceed 15)
    if (m === 0) {                         // arithmetic, Table 1
      const nA = (~A) & 15, nB = (~B) & 15;
      switch (as) {
        case 0:  base = 15;     break;     // -1 (+carry): Fj=H at Cn=L, L at Cn=H
        case 1:  base = B + nA; break;     // B MINUS A   (= B + ~A + carry)
        case 2:  base = A + nB; break;     // A MINUS B
        case 3:  base = A + B;  break;     // A PLUS B
        case 4:  base = B;      break;     // B   (+1 with carry)
        case 5:  base = nB;     break;     // B̄  (+1)
        case 6:  base = A;      break;     // A   (+1)
        default: base = nA;     break;     // Ā  (+1)
      }
    } else {                               // logic, Table 2 (per-bit word)
      let W = 0;
      for (let i = 0; i < 4; i++) {
        const a = (A >> i) & 1, b = (B >> i) & 1;
        let w;
        switch (as) {
          case 0:  w = 0;             break; // L
          case 1:  w = a ^ b;         break; // XOR
          case 2:  w = (a ^ b) ? 0 : 1; break; // XNOR
          case 3:  w = 1;             break; // H
          case 4:  w = a & b;         break; // AND
          case 5:  w = (a | b) ? 0 : 1; break; // NOR
          case 6:  w = (a & b) ? 0 : 1; break; // NAND
          default: w = a | b;         break; // OR
        }
        W |= (w << i);
      }
      base = W;
    }
    const sum = base + cn;                 // Cn active-HIGH adds 1
    const F   = sum & 15;
    const cn4 = (sum >> 4) & 1;            // Cn+4 carry out (active HIGH)
    // Carry look-ahead terms for the '182 generator (active-LOW pins):
    //   G = group generates a carry independent of Cn; P = a carry-in propagates.
    const gbar = (base >= 16) ? 0 : 1;
    const pbar = ((base & 15) === 15) ? 0 : 1;
    return { Fbits: [F & 1, (F >> 1) & 1, (F >> 2) & 1, (F >> 3) & 1], cn4, gbar, pbar };
  };

  const Aval = state.A[0] | (state.A[1] << 1) | (state.A[2] << 2) | (state.A[3] << 3);
  const Bval = state.B[0] | (state.B[1] << 1) | (state.B[2] << 2) | (state.B[3] << 3);
  const pre  = alu(Aval, Bval);            // ALU result BEFORE this clock edge

  // ── Register update on the LOW→HIGH clock edge (Table 3) ──────────────────
  // Shift modes: LEFT shifts QB toward QB0 (serial in at QB3 from LI/RO, out at
  // QB0→RI/LO); RIGHT shifts toward QB3 (serial in at QB0 from RI/LO, out at
  // QB3→LI/RO). The ARITH variants hold QB3 (sign) instead of overwriting it.
  // (Exact serial-fill of the arith shifts is read from a low-quality 1985
  // databook scan — see issues.md B4 — but the core LOAD/ACCUM/HOLD modes and
  // the full 16+16 ALU are unambiguous.)
  if (state.prevClk === 0 && clk === 1) {
    const io = [ this._readPinBit(comp, io0N), this._readPinBit(comp, io1N),
                 this._readPinBit(comp, io2N), this._readPinBit(comp, io3N) ];
    const li = this._readPinBit(comp, liroN);   // serial in on LI/RO (left shift)
    const ri = this._readPinBit(comp, riloN);   // serial in on RI/LO (right shift)
    const F  = pre.Fbits;
    const b  = state.B;
    switch (rs) {
      case 0:  state.B = F.slice();                break; // ACCUM: B ← ALU result
      case 1:  state.B = io.slice();               break; // LOAD B ← I/O bus
      case 2:  state.B = [b[1], b[2], b[3], li];   break; // LEFT SHIFT LOGICAL
      case 3:  state.B = [b[1], b[2], li,  b[3]];  break; // LEFT SHIFT ARITH (QB3 held)
      case 4:  state.B = [ri,  b[0], b[1], b[2]];  break; // RIGHT SHIFT LOGICAL
      case 5:  state.B = [ri,  b[0], b[1], b[3]];  break; // RIGHT SHIFT ARITH (QB3 held)
      case 6:  /* HOLD: A and B unchanged */       break;
      default: state.A = io.slice();               break; // LOAD A ← I/O bus (rs=7)
    }
  }
  state.prevClk = clk;

  // ── Outputs reflect the (possibly updated) register contents ──────────────
  const A2  = state.A[0] | (state.A[1] << 1) | (state.A[2] << 2) | (state.A[3] << 3);
  const B2  = state.B[0] | (state.B[1] << 1) | (state.B[2] << 2) | (state.B[3] << 3);
  const out = alu(A2, B2);

  let changed = false;
  // The four I/O ports drive the ALU result F, EXCEPT in the two load modes
  // (LOAD B, LOAD A) where they are inputs → released to Hi-Z.
  const ioPins = [oIo0, oIo1, oIo2, oIo3];
  if (rs === 1 || rs === 7) {
    if (this._drivePinsHighZ(comp, ioPins)) changed = true;
  } else {
    if (this._drivePinBits(comp, ioPins, out.Fbits)) changed = true;
  }

  // Cn+4 / G̅ / P̅ are combinational carry outputs, always driven.
  if (this._drivePinBit(comp, oCn4, out.cn4))  changed = true;
  if (this._drivePinBit(comp, oG,   out.gbar)) changed = true;
  if (this._drivePinBit(comp, oP,   out.pbar)) changed = true;

  // Serial ports carry the register end-bit during a shift; else released.
  const leftShift  = (rs === 2 || rs === 3);
  const rightShift = (rs === 4 || rs === 5);
  if (leftShift) {
    if (this._drivePinBit(comp, oRilo, state.B[0])) changed = true;
    if (this._drivePinHighZ(comp, oLiro)) changed = true;
  } else if (rightShift) {
    if (this._drivePinBit(comp, oLiro, state.B[3])) changed = true;
    if (this._drivePinHighZ(comp, oRilo)) changed = true;
  } else {
    if (this._drivePinHighZ(comp, oLiro)) changed = true;
    if (this._drivePinHighZ(comp, oRilo)) changed = true;
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

chipEvaluators._evaluateAcc4Bit681            = _evaluateAcc4Bit681_fn;
chipEvaluators._evaluateComparator8BitPq      = _evaluateComparator8BitPq_fn;
chipEvaluators._evaluateComparator8BitPqEn    = _evaluateComparator8BitPqEn_fn;
chipEvaluators._evaluateComparator8BitEq      = _evaluateComparator8BitEq_fn;
chipEvaluators._evaluateCounterLatchMuxStub   = _evaluateCounterLatchMuxStub_fn;
chipEvaluators._evaluateCounterRegMuxTri      = _evaluateCounterRegMuxTri_fn;
chipEvaluators._evaluateCounterUpdownRegMuxTri = _evaluateCounterUpdownRegMuxTri_fn;

function _evaluateCounterRegMuxTri_fn(comp, gate) {
  // 74x690 family: synchronous up-counter + 4-bit output register + quad 2:1
  //   multiplexer driving shared 3-state Q outputs. Verified vs TI D2423
  //   (SN74LS690..693), 1988 TTL Logic Data Book pp. 2-1139..2-1146.
  //   gate.mod  = counter modulus (10 = '690 decade, 16 = '691 binary).
  //   gate.syncClear = true makes BOTH clears synchronous: CCLR to CCK and
  //     RCLR to RCK ('692/'693). Default (false) = both async ('690/'691).
  //     Per ST M54/74HC690-693 datasheet (March 1993) p.1-2: the counter and
  //     register clears track the family together — synchronous for HC692/HC693,
  //     asynchronous for HC690/HC691.
  // inputs:  [CCLR, CCK, A, B, C, D, ENP, ENT, RCLR, RCK, LOAD, G, R/C]
  // outputs: [QA, QB, QC, QD, RCO]   (QA = LSB, A = LSB data input)
  const [cclrN,cckN,aN,bN,cN,dN,enpN,entN,rclrN,rckN,loadN,gN,rcN] = gate.inputs;
  const [qaN,qbN,qcN,qdN,rcoN] = gate.outputs;
  const mod = gate.mod || 10;
  const state = this._getSeqState(comp, qaN,
    { count: 0, reg: 0, prevCCK: 0, prevRCK: 0 });

  const cclr = this._readPinBit(comp, cclrN);
  const cck  = this._readPinBit(comp, cckN);
  const rclr = this._readPinBit(comp, rclrN);
  const rck  = this._readPinBit(comp, rckN);

  // Snapshot the count as it stands on entry. The register captures this
  // pre-update value, so when CCK and RCK are tied the register lags the
  // counter by one clock (datasheet Note 2).
  const oldCount = state.count;

  // ── Output register ──────────────────────────────────────────────────────
  // RCLR active LOW clears the register. On '690/'691 that clear is
  // asynchronous (immediate); on '692/'693 (syncClear) it is synchronous to
  // the rising RCK edge, like the counter clear. Otherwise the register loads
  // the counter value on the rising RCK edge.
  if (rclr === 0 && !gate.syncClear) {
    state.reg = 0;
  } else if (state.prevRCK === 0 && rck === 1) {
    state.reg = (rclr === 0) ? 0 : oldCount;
  }

  // ── Counter ──────────────────────────────────────────────────────────────
  // CCLR active LOW: asynchronous clear on '690/'691, synchronous on '693.
  if (cclr === 0 && !gate.syncClear) {
    state.count = 0;
  } else if (state.prevCCK === 0 && cck === 1) {
    if (cclr === 0) {                       // synchronous clear ('693)
      state.count = 0;
    } else if (this._readPinBit(comp, loadN) === 0) {
      // Synchronous parallel load — overrides counting, independent of enables.
      state.count = this._readPinBit(comp, aN)
        | (this._readPinBit(comp, bN) << 1)
        | (this._readPinBit(comp, cN) << 2)
        | (this._readPinBit(comp, dN) << 3);
    } else if (this._readPinBit(comp, enpN) === 1 &&
               this._readPinBit(comp, entN) === 1) {
      // Count up; wrap at the modulus.
      state.count = (state.count >= mod - 1) ? 0 : state.count + 1;
    }
  }
  state.prevCCK = cck;
  state.prevRCK = rck;

  // ── Ripple carry: active HIGH at terminal count while ENT is HIGH ─────────
  const ent = this._readPinBit(comp, entN);
  const rco = (state.count === mod - 1 && ent === 1) ? 1 : 0;

  // ── Quad 2:1 output MUX + 3-state gating ─────────────────────────────────
  // R/C LOW → live counter; R/C HIGH → stored register. G active LOW enables.
  const sel = (this._readPinBit(comp, rcN) === 1) ? state.reg : state.count;
  let changed = false;
  if (this._readPinBit(comp, gN) === 0) {
    if (this._drivePinBits(comp, [qaN,qbN,qcN,qdN],
        [sel & 1, (sel >> 1) & 1, (sel >> 2) & 1, (sel >> 3) & 1])) changed = true;
  } else {
    for (const op of [qaN,qbN,qcN,qdN]) {
      if (this._drivePinHighZ(comp, op)) changed = true;
    }
  }
  if (this._drivePinBit(comp, rcoN, rco)) changed = true;
  return changed;
}

function _evaluateCounterUpdownRegMuxTri_fn(comp, gate) {
  // 74x696/697/698/699 family: synchronous UP/DOWN counter + 4-bit output
  //   register + quad 2:1 multiplexer driving shared 3-state Q outputs.
  //   Verified vs TI SDLS199 (SN54/74LS696/697/699), Jan 1981 rev. Mar 1988:
  //   terminal assignment + description + positive-logic logic diagrams +
  //   IEC logic symbols, page 1-2, read as rendered ~150-dpi PDF page images.
  //   Note the family-wide ACTIVE-LOW pins (overbars in the datasheet):
  //   ENP, ENT and RCO are active LOW, and cascading ties RCO -> ENT.
  //   This differs from the up-only 74x690 (COUNTER_REG_MUX_TRI), so it is a
  //   separate primitive rather than a flag on that one.
  //   gate.mod  = counter modulus (10 = '696 decade, 16 = '697/'699 binary).
  //   gate.syncClear = true makes CCLR synchronous ('698/'699); the '696/'697
  //                    leave it default (asynchronous direct clear).
  // inputs:  [UD, CCK, A, B, C, D, ENP, ENT, CCLR, RCK, LOAD, G, RC]
  // outputs: [QA, QB, QC, QD, RCO]   (QA = LSB, A = LSB data input)
  const [udN,cckN,aN,bN,cN,dN,enpN,entN,cclrN,rckN,loadN,gN,rcN] = gate.inputs;
  const [qaN,qbN,qcN,qdN,rcoN] = gate.outputs;
  const mod = gate.mod || 16;
  const state = this._getSeqState(comp, qaN,
    { count: 0, reg: 0, prevCCK: 0, prevRCK: 0 });

  const cclr = this._readPinBit(comp, cclrN);   // active LOW
  const cck  = this._readPinBit(comp, cckN);
  const rck  = this._readPinBit(comp, rckN);

  // Snapshot the count on entry. The register captures this pre-update value,
  // so when CCK and RCK are tied the register lags the counter by one clock
  // (datasheet Note 2).
  const oldCount = state.count;

  // ── Output register ──────────────────────────────────────────────────────
  // No register clear on this family (the '690 RCLR pin is replaced by U/D).
  // On the rising RCK edge the register snapshots the current count.
  if (state.prevRCK === 0 && rck === 1) {
    state.reg = oldCount;
  }

  // ── Counter ──────────────────────────────────────────────────────────────
  // CCLR active LOW: asynchronous on '696/'697, synchronous on '698/'699.
  if (cclr === 0 && !gate.syncClear) {
    state.count = 0;
  } else if (state.prevCCK === 0 && cck === 1) {
    if (cclr === 0) {                       // synchronous clear ('698/'699)
      state.count = 0;
    } else if (this._readPinBit(comp, loadN) === 0) {
      // Synchronous parallel load (LOAD active LOW) — overrides counting.
      state.count = this._readPinBit(comp, aN)
        | (this._readPinBit(comp, bN) << 1)
        | (this._readPinBit(comp, cN) << 2)
        | (this._readPinBit(comp, dN) << 3);
    } else if (this._readPinBit(comp, enpN) === 0 &&
               this._readPinBit(comp, entN) === 0) {
      // Both enables active LOW -> count. U/D HIGH = up, LOW = down.
      if (this._readPinBit(comp, udN) === 1) {
        state.count = (state.count >= mod - 1) ? 0 : state.count + 1;
      } else {
        state.count = (state.count <= 0) ? mod - 1 : state.count - 1;
      }
    }
  }
  state.prevCCK = cck;
  state.prevRCK = rck;

  // ── Ripple carry RCO (active LOW): asserted at terminal count while ENT is
  //   active (LOW). Terminal count is max when counting up, 0 when down. ──────
  const entActive = (this._readPinBit(comp, entN) === 0);
  const up = (this._readPinBit(comp, udN) === 1);
  const atTerminal = up ? (state.count === mod - 1) : (state.count === 0);
  const rco = (atTerminal && entActive) ? 0 : 1;   // active LOW

  // ── Quad 2:1 output MUX + 3-state gating ─────────────────────────────────
  // R/C HIGH -> stored register; LOW -> live counter. G active LOW enables.
  const sel = (this._readPinBit(comp, rcN) === 1) ? state.reg : state.count;
  let changed = false;
  if (this._readPinBit(comp, gN) === 0) {
    if (this._drivePinBits(comp, [qaN,qbN,qcN,qdN],
        [sel & 1, (sel >> 1) & 1, (sel >> 2) & 1, (sel >> 3) & 1])) changed = true;
  } else {
    for (const op of [qaN,qbN,qcN,qdN]) {
      if (this._drivePinHighZ(comp, op)) changed = true;
    }
  }
  if (this._drivePinBit(comp, rcoN, rco)) changed = true;
  return changed;
}

chipEvaluators._evaluateDualCtr16RegTri = _evaluateDualCtr16RegTri_fn;

function _evaluateDualCtr16RegTri_fn(comp, gate) {
  // 74x8154: dual 16-bit binary counter with a 32-bit storage register read out
  //   8 bits at a time onto a shared 3-state Y bus.
  //   Verified vs TI SN74LV8154 SCLS589B (Aug 2004, rev. May 2020): Pin
  //   Functions (Table 1), Function Table (Table 2), Functional Block Diagram
  //   (Fig. in 8.2), and Detailed Description 8.1/8.3, read as 200-dpi PDF page
  //   images (issues.md C4). Behaviour modeled:
  //   • Two independent 16-bit up-counters: counter A on the rising CLKA edge,
  //     counter B on the rising CLKB edge, but B counts only while CLKBEN is LOW
  //     (active-LOW clock enable). Tie RCOA->CLKBEN with CLKA/CLKB common to make
  //     one 32-bit counter.
  //   • CCLR (active LOW) asynchronously clears BOTH counters to zero. It does
  //     not touch the storage register.
  //   • RCLK rising edge snapshots both counters into the 32-bit storage
  //     register (held until the next RCLK edge).
  //   • RCOA (active LOW) = LOW when counter A is at full count (0xFFFF), i.e.
  //     ready to overflow on the next CLKA. Decoded from the LIVE counter A.
  //   • Output bus reads the STORED register one byte at a time via four
  //     active-LOW gates (Table 2): GAL->A low byte, GAU->A high byte,
  //     GBL->B low byte, GBU->B high byte. With all four HIGH the Y bus is Hi-Z.
  // inputs:  [CLKA, CLKB, CLKBEN, CCLR, RCLK, GAL, GAU, GBL, GBU]
  // outputs: [Y0..Y7, RCOA]   (Y0 = byte LSB)
  const [clkaN,clkbN,clkbenN,cclrN,rclkN,galN,gauN,gblN,gbuN] = gate.inputs;
  const yN  = gate.outputs.slice(0, 8);
  const rcoaN = gate.outputs[8];
  const state = this._getSeqState(comp, yN[0],
    { ca: 0, cb: 0, ra: 0, rb: 0, prevCLKA: 0, prevCLKB: 0, prevRCLK: 0 });

  const cclr   = this._readPinBit(comp, cclrN);    // active LOW
  const clka   = this._readPinBit(comp, clkaN);
  const clkb   = this._readPinBit(comp, clkbN);
  const clkben = this._readPinBit(comp, clkbenN);  // active LOW enable
  const rclk   = this._readPinBit(comp, rclkN);

  // Snapshot the counters as they stand on entry. The storage register captures
  // this pre-update value, so when a count clock and RCLK are tied the register
  // lags the counter by one clock.
  const oldCa = state.ca, oldCb = state.cb;
  if (state.prevRCLK === 0 && rclk === 1) { state.ra = oldCa; state.rb = oldCb; }

  // Counters. CCLR (async, active LOW) dominates.
  if (cclr === 0) {
    state.ca = 0;
    state.cb = 0;
  } else {
    if (state.prevCLKA === 0 && clka === 1) state.ca = (state.ca + 1) & 0xFFFF;
    if (clkben === 0 && state.prevCLKB === 0 && clkb === 1)
      state.cb = (state.cb + 1) & 0xFFFF;
  }
  state.prevCLKA = clka;
  state.prevCLKB = clkb;
  state.prevRCLK = rclk;

  // RCOA active LOW at counter-A full count.
  const rcoa = (state.ca === 0xFFFF) ? 0 : 1;

  // Byte select from the STORED register (active-LOW gates, Table 2 priority).
  let val = null;
  if      (this._readPinBit(comp, galN) === 0) val = state.ra & 0xFF;
  else if (this._readPinBit(comp, gauN) === 0) val = (state.ra >> 8) & 0xFF;
  else if (this._readPinBit(comp, gblN) === 0) val = state.rb & 0xFF;
  else if (this._readPinBit(comp, gbuN) === 0) val = (state.rb >> 8) & 0xFF;

  let changed = false;
  if (val === null) {
    for (const op of yN) if (this._drivePinHighZ(comp, op)) changed = true;
  } else {
    if (this._drivePinBits(comp, yN,
        [0,1,2,3,4,5,6,7].map(i => (val >> i) & 1))) changed = true;
  }
  if (this._drivePinBit(comp, rcoaN, rcoa)) changed = true;
  return changed;
}

// ── Block 37 evaluators ─────────────────────────────────────────────────────

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

function _evaluateCounterProgRippleOsc_fn(comp, gate) {
  // 74x9323 / 74HC6323A: programmable ripple counter with oscillator, 3-state.
  // Source: Nexperia 74HC6323A datasheet, Rev. 4 (2018), Fig. 3 (logic diagram),
  //   Table 2 (pin description), Table 3 (function table). See chips65.js header.
  // inputs:  [X1, MR, S1, S2]   outputs: [OUT, X2]
  //
  // X1 is the clock (or one crystal terminal). The counter advances on each
  //   negative-going (falling) edge of X1 — modeled as a 3-bit binary up-count.
  // MR (pin 5, active LOW): LOW resets the counter, stops the oscillator, and
  //   forces OUT to high-Z. Datasheet Fig. 3 shows internal pull-ups on MR, S1,
  //   and S2, so an unconnected one of these reads HIGH (inactive / divide-by-8).
  // X2 (pin 6) = oscillator output = NAND(X1, MR): inactive (HIGH) while MR=LOW,
  //   otherwise the inverse of X1 (matches the VOH X2 test conditions, page 5).
  // OUT (pin 1), per Table 3: S1=0,S2=0 → fi (follows the clock);
  //   S1=0,S2=1 → fi/2 (Q0); S1=1,S2=0 → fi/4 (Q1); S1=1,S2=1 → fi/8 (Q2).
  const [x1Name, mrName, s1Name, s2Name] = gate.inputs;
  const [outName, x2Name] = gate.outputs;

  // Read a pin honoring its internal pull-up: an unconnected net reads HIGH.
  const readPullup = (name) => {
    const pin = comp.getPinByName(name);
    const net = pin ? this.netlist.findNetByHole(pin.holeId) : null;
    return net ? this._readPinBit(comp, name) : 1;
  };

  const x1 = this._readPinBit(comp, x1Name);
  const mr = readPullup(mrName); // active LOW, pulled up
  const s1 = readPullup(s1Name); // pulled up
  const s2 = readPullup(s2Name); // pulled up

  const state = this._getSeqState(comp, outName, { q0: 0, q1: 0, q2: 0, prevX1: 1 });

  if (mr === 0) {
    state.q0 = state.q1 = state.q2 = 0;
  } else if (state.prevX1 === 1 && x1 === 0) {
    // Falling edge of X1 → advance the 3-bit ripple counter.
    const next = ((state.q0 | (state.q1 << 1) | (state.q2 << 2)) + 1) & 7;
    state.q0 = next & 1; state.q1 = (next >> 1) & 1; state.q2 = (next >> 2) & 1;
  }
  state.prevX1 = x1;

  // X2 oscillator output = NAND(X1, MR).
  const x2 = (mr === 1 && x1 === 1) ? 0 : 1;

  let outBit;
  if (s1 === 0 && s2 === 0)      outBit = x1;        // divide by 1
  else if (s1 === 0 && s2 === 1) outBit = state.q0;  // divide by 2
  else if (s1 === 1 && s2 === 0) outBit = state.q1;  // divide by 4
  else                          outBit = state.q2;   // divide by 8

  let changed = false;
  if (mr === 0) {
    if (this._drivePinHighZ(comp, outName)) changed = true; // 3-state on reset
  } else {
    if (this._drivePinBit(comp, outName, outBit)) changed = true;
  }
  if (this._drivePinBit(comp, x2Name, x2)) changed = true;
  return changed;
}

chipEvaluators._evaluateCounterProgRippleOsc = _evaluateCounterProgRippleOsc_fn;

function _evaluateGenericStub_fn(comp, gate) {
  // Generic stub: drives all outputs HiZ (for complex chips not yet modeled).
  let changed = false;
  for (const op of gate.outputs) {
    if (this._drivePinHighZ(comp, op)) changed = true;
  }
  return changed;
}

function _evaluateMuxQuint2to1_fn(comp, gate) {
  // 74711: Five 2-to-1 multiplexers, tri state outputs.
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

function _evaluateMuxQuint3to1_fn(comp, gate) {
  // 74712: Five 3-to-1 multiplexers, common select S0/S1, true (non-inverting)
  // totem-pole outputs — no output enable, no invert control (those are 'F711 only).
  // inputs: [S0, S1, D0a,D0b,D0c, D1a,D1b,D1c, D2a,D2b,D2c, D3a,D3b,D3c, D4a,D4b,D4c]
  // outputs: [Q0, Q1, Q2, Q3, Q4]
  // FUNCTION TABLE (Signetics FAST Data Manual, 'F712, p.6-676):
  //   S1=0,S0=0 → Qn = a ;  S1=0,S0=1 → Qn = b ;  S1=1,S0=x → Qn = c.
  // S1 dominates: when S1 is HIGH the c input wins regardless of S0 (no unused code).
  const bits = this._readGateInputs(comp, gate.inputs);
  const s0 = bits[0];
  const s1 = bits[1];
  let changed = false;
  for (let i = 0; i < 5; i++) {
    const base = 2 + 3 * i;          // a=base, b=base+1, c=base+2
    const bit = s1 ? bits[base + 2] : (s0 ? bits[base + 1] : bits[base]);
    if (this._drivePinBit(comp, gate.outputs[i], bit)) changed = true;
  }
  return changed;
}

function _evaluateMuxHexUniversal_fn(comp, gate) {
  // SN54ALS857/SN74ALS857: hextuple ("hex") 2-to-1 UNIVERSAL multiplexer with
  // 3-state outputs. Per channel i the part selects one operand bit, optionally
  // complements it (COMP), and drives Yi; a shared OPER=0 pin reports whether the
  // selected operand is all-zero (zero detect). Source function table (page 2):
  //   COMP S1 S0 | Y     | OPER=0
  //    L   L  L  | A     | H if all A inputs L
  //    L   L  H  | B     | H if all B inputs L
  //    L   H  L  | A·B   | Z
  //    L   H  H  | L     | L
  //    H   L  L  | /A    | H if all A inputs L
  //    H   L  H  | /B    | H if all B inputs L
  //    H   H  L  | /(A·B)| Z
  //    H   H  H  | Z     | Z
  // inputs:  [S0,S1,COMP, 1A,1B, 2A,2B, 3A,3B, 4A,4B, 5A,5B, 6A,6B]  (15)
  // outputs: [1Y,2Y,3Y,4Y,5Y,6Y, OPER0]                              (7)
  const b   = this._readGateInputs(comp, gate.inputs);
  const s0  = b[0], s1 = b[1], cmp = b[2];
  const A   = [b[3], b[5], b[7], b[9],  b[11], b[13]];
  const B   = [b[4], b[6], b[8], b[10], b[12], b[14]];
  const oper = gate.outputs[6];
  let changed = false;

  // Disable: COMP=S0=S1=H places every output (the six Y and OPER=0) in Hi-Z.
  if (cmp === 1 && s1 === 1 && s0 === 1) {
    for (const op of gate.outputs) if (this._drivePinHighZ(comp, op)) changed = true;
    return changed;
  }

  // Per-channel operand select, then optional complement.
  for (let i = 0; i < 6; i++) {
    let d;
    if (s1 === 0 && s0 === 0)      d = A[i];           // select A
    else if (s1 === 0 && s0 === 1) d = B[i];           // select B
    else if (s1 === 1 && s0 === 0) d = A[i] & B[i];    // AND mask (A·B)
    else                           d = 0;              // S1=S0=H, COMP=L: force L
    const y = cmp === 1 ? (d ^ 1) : d;
    if (this._drivePinBit(comp, gate.outputs[i], y)) changed = true;
  }

  // OPER=0 zero-detect. HIGH iff every bit of the selected operand is LOW.
  if (s1 === 0) {
    const ops = (s0 === 0) ? A : B;
    const allLow = ops.every(v => v === 0) ? 1 : 0;
    if (this._drivePinBit(comp, oper, allLow)) changed = true;
  } else if (s0 === 1) {
    // S1=H,S0=H,COMP=L (the disable case COMP=H is handled above): OPER=0 = L.
    if (this._drivePinBit(comp, oper, 0)) changed = true;
  } else {
    // AND modes (S1=H,S0=L): OPER=0 is Hi-Z.
    if (this._drivePinHighZ(comp, oper)) changed = true;
  }
  return changed;
}

function _evaluateMux3in4bitDcOe(comp, gate) {
  // Signetics 8264 (the "733" three-bus mux): 3-input, 4-bit digital multiplexer
  // with a Data Complement input and an output-enable code. Each output bit fn
  // selects the same bit from one of three 4-bit buses A/B/C (or a forced 0),
  // optionally inverts it, then drives it through a bare-collector output stage.
  // Function table (Signetics 8263/64 datasheet, page 563):
  //   S0 S1 | selected   |   DC=L → out = selected ;  DC=H → out = /selected
  //    H  H |  An
  //    L  H |  Bn
  //    H  L |  Cn
  //    L  L |  0  (forced)
  //   Output Enable (8264): outputs active only while OE1·OE2·OE3 are all HIGH.
  //   When the enable code is not satisfied every output sits at logic 1 (the
  //   bare-collector transistor is off and an external pull-up holds the line
  //   HIGH); we drive a hard 1 to represent that pulled-up disabled state.
  // inputs:  [A0,A1,A2,A3, B0,B1,B2,B3, C0,C1,C2,C3, S0,S1, DC, OE1,OE2,OE3] (18)
  // outputs: [Y0,Y1,Y2,Y3]  (= datasheet f0..f3)
  const b   = this._readGateInputs(comp, gate.inputs);
  const A   = [b[0], b[1], b[2], b[3]];
  const B   = [b[4], b[5], b[6], b[7]];
  const C   = [b[8], b[9], b[10], b[11]];
  const s0  = b[12], s1 = b[13], dc = b[14];
  const enabled = (b[15] === 1) && (b[16] === 1) && (b[17] === 1);
  let changed = false;
  for (let i = 0; i < 4; i++) {
    let out;
    if (!enabled) {
      out = 1; // disabled: bare-collector off, line pulled HIGH
    } else {
      let sel;
      if      (s0 === 1 && s1 === 1) sel = A[i];
      else if (s0 === 0 && s1 === 1) sel = B[i];
      else if (s0 === 1 && s1 === 0) sel = C[i];
      else                          sel = 0; // S0=L,S1=L → forced 0
      out = (dc === 1) ? (sel ^ 1) : sel;
    }
    if (this._drivePinBit(comp, gate.outputs[i], out)) changed = true;
  }
  return changed;
}

chipEvaluators._evaluateGenericStub     = _evaluateGenericStub_fn;
chipEvaluators._evaluateMux3in4bitDcOe  = _evaluateMux3in4bitDcOe;
chipEvaluators._evaluateMuxQuint2to1    = _evaluateMuxQuint2to1_fn;
chipEvaluators._evaluateMuxQuint3to1    = _evaluateMuxQuint3to1_fn;
chipEvaluators._evaluateMuxHexUniversal = _evaluateMuxHexUniversal_fn;

// ── Block 67 555 Timer ──────────────────────────────────────────────────

function _evaluateTimer555_fn(comp, gate) {
  // NE555 Timer analog comparator model.
  //
  // Internal architecture:
  //   - Three equal resistors form a voltage divider: VCC → R → R → R → GND
  //     producing reference voltages at 2/3 VCC and 1/3 VCC.
  //   - Upper comparator: THRESH (pin 6) vs upper reference (2/3 VCC or CTRL)
  //   - Lower comparator: TRIG (pin 2) vs lower reference (1/3 VCC or CTRL/2)
  //   - SR flip flop: SET when TRIG < lower ref, RESET when THRESH > upper ref
  //   - DISCH (pin 7): open collector NPN, ON (sinking to GND) when output LOW
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

  // Internal SR flip flop state
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

  // Drive OUT pin: push pull, HIGH (5V) when q=1, LOW (0V) when q=0
  if (this._drivePinBit(comp, outName, state.q)) changed = true;

  // Drive DISCH pin: open collector behavior
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

// ── Retriggerable monostable with external RC (74x123, CD4538) ───────────
// Same physics as the 555 in monostable mode (see _evaluateTimer555_fn): the
// chip holds the timing capacitor discharged while idle, releases it on a
// trigger edge, and watches the cap voltage charge through the external R
// until it crosses 2/3 VCC, at which point the pulse ends.
//
// Wiring convention (also stated in each chip's user-facing guide):
//   - C from CEXT pin to GND
//   - R from CEXT pin to VCC
//   - REXT pin on the chip is documentation-only; not read by the simulator.
//
// Pulse width emerges from the MNA solver (~0.7·R·C) — no formula in code.
//
// Trigger semantics: rising edge on B while A=LOW, OR falling edge on A while
// B=HIGH. CLR=LOW aborts and forces idle.
//
// Retrigger: a new trigger edge while pulsing re-asserts the latch. Because
// the cap is mid-charge (not discharged on retrigger like real silicon), the
// pulse ends slightly sooner than a full R·C cycle after retrigger. Accepted
// inaccuracy.
function _evaluateMonostableRC_fn(comp, gate) {
  const [aName, bName, clrName, cextName] = gate.inputs;
  const [qName, qnName] = gate.outputs;

  const a   = this._readPinBit(comp, aName);
  const b   = this._readPinBit(comp, bName);
  const clr = this._readPinBit(comp, clrName);

  const state = this._getSeqState(comp, qName,
    { q: 0, prevA: 1, prevB: 0 });

  // Default reset is active LOW (74x123, CD4538). Some parts (e.g. CD4047
  // EXTERNAL RESET) use an active-HIGH reset; gate.resetActiveHigh flips it.
  // With active-HIGH reset an unconnected reset pin (reads 0) means "not
  // reset", which is the sensible breadboard default.
  const resetActive = gate.resetActiveHigh ? (clr === 1) : (clr === 0);

  if (resetActive) {
    state.q = 0;
  } else {
    const triggerEdge =
      (b === 1 && state.prevB === 0 && a === 0) ||
      (a === 0 && state.prevA === 1 && b === 1);
    if (triggerEdge) {
      state.q = 1;
    } else if (state.q === 1) {
      const v = this._readPinVoltage(comp, cextName);
      if (v !== null && v > (VCC_VOLTAGE * 2 / 3)) {
        state.q = 0;
      }
    }
  }
  state.prevA = a;
  state.prevB = b;

  let changed = false;
  if (this._drivePinBit(comp, qName, state.q)) changed = true;
  if (this._drivePinBit(comp, qnName, state.q ? 0 : 1)) changed = true;
  // CEXT: SINK when idle (cap held discharged), HiZ while pulsing (charges through R).
  if (state.q) {
    if (this._drivePinHighZ(comp, cextName)) changed = true;
  } else {
    if (this._drivePinSink(comp, cextName)) changed = true;
  }
  return changed;
}

chipEvaluators._evaluateMonostableRC = _evaluateMonostableRC_fn;

function _evaluateShiftRegLatch4094_fn(comp, gate) {
  // CD74x4094: 8 bit shift register with storage latch and tri state outputs.
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

function _evaluateDualRankShift962_fn(comp, gate) {
  // DM74LS962: dual-rank 8-bit TRI-STATE shift register.
  // Two 8-bit ranks share one clock:
  //   Reg A  = upper parallel I/O register (bit i tied to I/O pin i)
  //   Reg B  = lower serial shift register (serial in IS -> serial out OS)
  // Six control inputs, ALL active LOW (asserted at logic 0). They gate,
  // independently, what happens to each rank on the RISING clock edge:
  //   DISI  (Input disable)     asserted -> Reg A loads from the I/O pins.
  //   DISTU (Transfer-up dis.)  asserted -> Reg A loads from Reg B.
  //   DISTD (Transfer-down dis.)asserted -> Reg B loads from Reg A.
  //   DISS  (Shift disable)     asserted -> Reg B shifts one bit (IS -> B1 -> ... -> B8).
  //   DISO  (Output disable)    asserted -> I/O pins drive out Reg A (TRI-STATE enable).
  // Combinations are legal and act simultaneously on the same edge, so:
  //   DISTU+DISTD asserted  = EXCHANGE (A<->B swap).
  //   When Reg A is also loading from the I/O pins (DISI asserted), the value
  //   written picks up the "Data-ORing" (DOR) term: bit = I/O OR (other rank).
  // Priority per the function table (Table I): a rank that is being loaded from
  // another rank ignores the shift for that edge (DISTD dominates DISS on Reg B;
  // DISI dominates DISO on the pins). OS is a plain (non-TRI-STATE) output that
  // always reflects the last shift stage B8.
  // inputs:  [CLK, IS, DISO, DISI, DISTU, DISTD, DISS, IO1..IO8]
  // outputs: [OS, IO1..IO8]
  const [clkN, isN, disoN, disiN, distuN, distdN, dissN] = gate.inputs;
  const ioIn = gate.inputs.slice(7, 15);   // IO1..IO8 read side
  const ioOut = gate.outputs.slice(1, 9);  // IO1..IO8 drive side
  const osN = gate.outputs[0];

  const state = this._getSeqState(comp, gate.outputs[0],
    { a: new Array(8).fill(0), b: new Array(8).fill(0), prevCLK: 0 });

  const clk   = this._readPinBit(comp, clkN);
  const inA   = this._readPinBit(comp, disiN)  === 0; // load Reg A from I/O pins
  const outEn = this._readPinBit(comp, disoN)  === 0 && !inA; // drive pins from Reg A
  const tu    = this._readPinBit(comp, distuN) === 0; // Reg A <- Reg B
  const td    = this._readPinBit(comp, distdN) === 0; // Reg B <- Reg A
  const sh    = this._readPinBit(comp, dissN)  === 0; // shift Reg B

  if (state.prevCLK === 0 && clk === 1) {
    const io = ioIn.map(n => this._readPinBit(comp, n)); // I/O pins as inputs at the edge
    const is = this._readPinBit(comp, isN);
    const a0 = state.a.slice(), b0 = state.b.slice(); // snapshot: exchange reads both old ranks
    // Reg A next state.
    if (tu && inA)      for (let i = 0; i < 8; i++) state.a[i] = io[i] | b0[i]; // transfer-up + DOR
    else if (tu)        for (let i = 0; i < 8; i++) state.a[i] = b0[i];
    else if (inA)       for (let i = 0; i < 8; i++) state.a[i] = io[i];
    // else Reg A holds.
    // Reg B next state (transfer-down dominates shift).
    if (td) {
      if (inA) for (let i = 0; i < 8; i++) state.b[i] = io[i] | a0[i]; // transfer-down + DOR
      else     for (let i = 0; i < 8; i++) state.b[i] = a0[i];
    } else if (sh) {
      state.b = [is, b0[0], b0[1], b0[2], b0[3], b0[4], b0[5], b0[6]];
    }
    // else Reg B holds.
  }
  state.prevCLK = clk;

  let changed = false;
  if (outEn) { if (this._drivePinBits(comp, ioOut, state.a)) changed = true; }
  else       { if (this._drivePinsHighZ(comp, ioOut)) changed = true; }
  if (this._drivePinBit(comp, osN, state.b[7])) changed = true; // OS = B8, always driven
  return changed;
}

chipEvaluators._evaluateDualRankShift962 = _evaluateDualRankShift962_fn;

function _evaluateDLatchOctalTriInv_fn(comp, gate) {
  // 74x4301: Octal D transparent latch with inverting tri state outputs.
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
  // 74x4303: Octal D edge triggered flip flop with inverting tri state outputs.
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

function _evaluateBcdDivNDown4522_fn(comp, gate) {
  // CD4522B: programmable BCD divide-by-N down counter.
  // inputs:  [CL, CI, PE, MR, CF, P0, P1, P2, P3]
  // outputs: [Q0, Q1, Q2, Q3, ZERO]  (ZERO = the decoded-"0" output, pin 12)
  //
  // Behaviour, from the CD4522B datasheet TRUTH TABLES (TI/Harris SCHS079C, p.1):
  //   MR=1 ............... asynchronous Reset, count -> 0 (highest priority)
  //   PE=1 ............... asynchronous Preset, count <- P0..P3 (BCD jam load)
  //   CI=1 ............... No Count (clock inhibit)
  //   CL static (0 or 1), CI=0, PE=0, MR=0 ... No Count
  //   CL positive edge (CI=0) .... Count Down
  //   CI negative edge (CL=1) .... Count Down
  // "Logic edge-clocked design   increments on positive Clock transition or on
  //  negative Clock Inhibit transition" (datasheet Features). It is a DOWN counter,
  //  so each such edge decrements the BCD count (0 wraps to 9).
  //
  // Cascade Feedback (CF, pin 13): for single-stage divide-by-N the datasheet says
  // tie the "0" output to PE and hold CF HIGH. CF gates both counting and the "0"
  // decode so stages chain "without the need for external gating" (datasheet
  // Description): CF=1 enables counting and ZERO = (count==0 AND CF). Feeding a
  // lower stage's ZERO into a higher stage's CF makes the higher stage step only
  // when the lower stage is at zero, and ANDs the decoded-zero up the chain. For a
  // lone chip CF must be tied HIGH or it will never count   that matches hardware.
  // CF only affects multi-stage cascades; in the common single-stage hookup CF=1
  // always, so this choice is behaviourally identical to ungated counting there.
  //
  // Source: Texas Instruments (data sheet acquired from Harris Semiconductor),
  //   "CD4522B Types   CMOS Programmable BCD Divide-by-'N' Counter", SCHS079C
  //   (Rev. October 2003). [Online]. Available:
  //   https://www.ti.com/lit/ds/symlink/cd4522b.pdf. Verified: TERMINAL ASSIGNMENT
  //   (p.5) + FUNCTIONAL DIAGRAM, TRUTH TABLES and OUTPUTS (count->Q0..Q3) table
  //   (p.1-2) + Description (p.1), read as 300-dpi PDF page images (issues.md C4).
  //   Pinout (DIP-16): Q3=1 P3=2 PE=3 CI=4 P0=5 CL=6 Q0=7 VSS=8 Q1=9 MR=10 P1=11
  //   "0"=12 CF=13 P2=14 Q2=15 VDD=16. Q0=LSB BCD. Not cloned from a sibling
  //   (issues.md C2): the hinted FREQ_DIV_PROG primitive is the 74292 (single
  //   toggling OUT, /(N+1), no BCD outputs / preset / inhibit / CF / MR) and does
  //   not fit, so this dedicated primitive was added.
  const [clN, ciN, peN, mrN, cfN, p0N, p1N, p2N, p3N] = gate.inputs;
  const [q0, q1, q2, q3, zeroN] = gate.outputs;
  const state = this._getSeqState(comp, q0, { count: 0, prevClk: 0, prevCi: 0 });

  const cl = this._readPinBit(comp, clN);
  const ci = this._readPinBit(comp, ciN);
  const cf = this._readPinBit(comp, cfN);

  const mr = this._readPinBit(comp, mrN);
  if (mr === 1) {
    state.count = 0;
  } else {
    const pe = this._readPinBit(comp, peN);
    if (pe === 1) {
      let p = this._readPinBit(comp, p0N) | (this._readPinBit(comp, p1N) << 1) |
        (this._readPinBit(comp, p2N) << 2) | (this._readPinBit(comp, p3N) << 3);
      if (p > 9) p = 9; // invalid BCD preset clamped to the top decade digit
      state.count = p;
    } else {
      // Count down on a positive CLOCK edge (CI low) OR a negative CLOCK INHIBIT
      // edge (CLOCK high). Counting is enabled only while Cascade Feedback is HIGH.
      const clockEdge = (state.prevClk === 0 && cl === 1 && ci === 0);
      const inhibitEdge = (state.prevCi === 1 && ci === 0 && cl === 1);
      if (cf === 1 && (clockEdge || inhibitEdge)) {
        state.count = (state.count - 1 + 10) % 10;
      }
    }
  }
  state.prevClk = cl;
  state.prevCi = ci;

  const zero = (state.count === 0 && cf === 1) ? 1 : 0;
  let changed = this._drivePinBits(comp, [q0, q1, q2, q3],
    [state.count & 1, (state.count >> 1) & 1, (state.count >> 2) & 1, (state.count >> 3) & 1]);
  if (this._drivePinBit(comp, zeroN, zero)) changed = true;
  return changed;
}

function _evaluateBcd7seg4511_fn(comp, gate) {
  // CD74x4511: BCD to 7 segment latch/decoder/driver (active HIGH, common cathode).
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
    // BCD → 7 segment (active HIGH outputs for common cathode)
    // Per the CD4511B TRUTH TABLE (TI SCHS072B, p.4): the CD4511 uses the classic
    // "tail-less" font — 6 has NO top bar (segment a off) and 9 has NO bottom bar
    // (segment d off). This differs from the CD4543's tailed 6/9.
    //           a  b  c  d  e  f  g
    const T = [
      /* 0 */ [1, 1, 1, 1, 1, 1, 0],
      /* 1 */ [0, 1, 1, 0, 0, 0, 0],
      /* 2 */ [1, 1, 0, 1, 1, 0, 1],
      /* 3 */ [1, 1, 1, 1, 0, 0, 1],
      /* 4 */ [0, 1, 1, 0, 0, 1, 1],
      /* 5 */ [1, 0, 1, 1, 0, 1, 1],
      /* 6 */ [0, 0, 1, 1, 1, 1, 1],
      /* 7 */ [1, 1, 1, 0, 0, 0, 0],
      /* 8 */ [1, 1, 1, 1, 1, 1, 1],
      /* 9 */ [1, 1, 1, 0, 0, 1, 1],
    ];
    segs = (state.bcd <= 9) ? T[state.bcd] : [0, 0, 0, 0, 0, 0, 0];
  }

  return this._drivePinBits(comp, gate.outputs, segs);
}

function _evaluateBcd7seg4543_fn(comp, gate) {
  // CD4543: BCD to 7 segment latch/decoder/driver (common-anode or common-cathode).
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
    // BCD → 7 segment (active HIGH reference table, same as CD4511)
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

function _evaluateBcd7seg4543hc_fn(comp, gate) {
  // 74x4543 / CD74HC4543 / CD4543B: BCD-to-7-segment latch/decoder/driver for LCDs.
  // inputs:  [A, B, C, D, LD, BI, PH]   A=2^0(LSB) .. D=2^3(MSB)
  // outputs: [a, b, c, d, e, f, g]
  //
  // Latch-DISABLE polarity is the OPPOSITE of the existing BCD_7SEG_4543 primitive,
  // which is why this part gets its own evaluator instead of reusing it. Per the
  // datasheet function table, LD=HIGH makes the latch transparent (the BCD value is
  // loaded/follows the inputs) and LD=LOW holds the last value loaded while LD was
  // HIGH. BI=HIGH blanks (all segments off). PH=HIGH inverts every segment output
  // (common-anode LED, or one half of the LCD square-wave drive); PH=LOW gives
  // active-HIGH segments (common-cathode LED). Codes 10-15 blank.
  //
  // Source: Texas Instruments (Harris Semiconductor), "CD74HC4543 High-Speed CMOS
  //   Logic BCD-to-7-Segment Latch/Decoder/Driver for LCDs", SCHS217B (Feb 1998,
  //   rev. Jul 2003). [Online]. Available:
  //   https://www.ti.com/lit/ds/symlink/cd74hc4543.pdf. Verified: pinout (TOP VIEW,
  //   page 1) and FUNCTION TABLE (page 2), read as rendered PDF page images (C4):
  //   LD=H transparent / LD=L hold ("Depends on BCD code previously applied when
  //   LD = high"), BI=H blank, PH=H "Inverse of Above", codes 10-15 blank.
  // Source: Texas Instruments (Harris Semiconductor), "CD4543B Types — CMOS
  //   BCD-to-Seven-Segment Latch/Decoder/Driver For Liquid-Crystal Displays",
  //   SCHS086D (rev. Apr 2004). [Online]. Available:
  //   https://www.ti.com/lit/ds/symlink/cd4543b.pdf. Verified: TERMINAL ASSIGNMENT
  //   (page 1) and "TRUTH TABLE FOR CD4543B" (page 5), read as rendered PDF page
  //   images — identical pinout and behaviour to the HC part; "Depends upon the BCD
  //   code previously applied when LD=1", "Inverse of Output Combinations Above"
  //   for Ph=1. Both sources agree, so either confirms the model.
  const [aN, bN, cN, dN, ldN, biN, phN] = gate.inputs;
  const state = this._getSeqState(comp, gate.outputs[0], { bcd: 0 });

  const ld = this._readPinBit(comp, ldN);
  if (ld === 1) {
    // LD HIGH: latch transparent — capture the current BCD code.
    state.bcd = this._readPinBit(comp, aN) | (this._readPinBit(comp, bN) << 1) |
      (this._readPinBit(comp, cN) << 2) | (this._readPinBit(comp, dN) << 3);
  }
  // LD LOW: hold state.bcd unchanged.

  const bi = this._readPinBit(comp, biN);
  const ph = this._readPinBit(comp, phN);

  let segs;
  if (bi === 1) {
    segs = [0, 0, 0, 0, 0, 0, 0]; // BI HIGH: blank (all segments off)
  } else {
    // BCD → 7 segment, active-HIGH reference (PH=LOW). Codes 10-15 blank.
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

  // PH HIGH inverts all outputs (common-anode LED, or LCD anti-phase drive).
  if (ph === 1) segs = segs.map(b => b ^ 1);

  return this._drivePinBits(comp, gate.outputs, segs);
}

function _evaluateBcd7seg4055_fn(comp, gate) {
  // CD4055B: BCD-to-7-segment LCD decoder/driver with a DISPLAY-FREQUENCY output.
  // inputs:  [A, B, C, D, DF]            A=2^0 (LSB) .. D=2^3 (MSB); DF = DISPLAY FREQUENCY IN
  // outputs: [a, b, c, d, e, f, g, DFO]  DFO = DISPLAY FREQUENCY OUT
  //
  // Purely combinational — there is NO input latch/strobe (that is the sibling
  // CD4056B) and NO blanking input. All sixteen input codes are decoded: 0-9
  // plus L, H, P, A, "-" and a blank position.
  //
  // DF (DISPLAY FREQUENCY) sets output polarity exactly the way the CD4543 Ph pin
  // does (TI/Harris SCHS048C, page 1): when DF is LOW the segments SELECTED by the
  // BCD code drive HIGH (active-HIGH, e.g. common-cathode LED use); when DF is HIGH
  // every segment bit is inverted so a selected segment drives LOW. On real silicon
  // a square wave on DF makes selected segments swing 180 degrees out of phase with
  // DF (and unselected segments in phase) to AC-drive a liquid-crystal display;
  // 74Sim resolves DF as a static level, so only the static HIGH/LOW polarity is
  // modeled (the square-wave / AC-across-glass LCD behavior is not — see issues.md
  // A3 and the chip note). DFO is a buffered copy of DF IN (on hardware a
  // level-shifted backplane drive used to cascade to a CD4054B); modeled as DFO=DF.
  //
  // Source: Texas Instruments (data sheet acquired from Harris Semiconductor),
  //   "CD4054B, CD4055B, CD4056B Types — CMOS Liquid-Crystal Display Drivers,
  //   High-Voltage Types (20-Volt Rating)", SCHS048C (Revised October 2003).
  //   [Online]. Available: https://www.ti.com/lit/ds/symlink/cd4054b.pdf. Verified:
  //   "TRUTH TABLE FOR CD4055B and CD4056B" (16 codes, segments a-g + display char)
  //   and the DF polarity text on page 1, read as 300-dpi PDF page images.
  const [aN, bN, cN, dN, dfN] = gate.inputs;
  const bcd = this._readPinBit(comp, aN) | (this._readPinBit(comp, bN) << 1) |
    (this._readPinBit(comp, cN) << 2) | (this._readPinBit(comp, dN) << 3);
  const df = this._readPinBit(comp, dfN);

  // BCD -> 7 segment, active-HIGH reference (DF=LOW). Verified vs SCHS048C truth
  // table.   a  b  c  d  e  f  g
  const T = [
    /*  0       */ [1, 1, 1, 1, 1, 1, 0],
    /*  1       */ [0, 1, 1, 0, 0, 0, 0],
    /*  2       */ [1, 1, 0, 1, 1, 0, 1],
    /*  3       */ [1, 1, 1, 1, 0, 0, 1],
    /*  4       */ [0, 1, 1, 0, 0, 1, 1],
    /*  5       */ [1, 0, 1, 1, 0, 1, 1],
    /*  6       */ [1, 0, 1, 1, 1, 1, 1],
    /*  7       */ [1, 1, 1, 0, 0, 0, 0],
    /*  8       */ [1, 1, 1, 1, 1, 1, 1],
    /*  9       */ [1, 1, 1, 1, 0, 1, 1],
    /* 10 "L"   */ [0, 0, 0, 1, 1, 1, 0],
    /* 11 "H"   */ [0, 1, 1, 0, 1, 1, 1],
    /* 12 "P"   */ [1, 1, 0, 0, 1, 1, 1],
    /* 13 "A"   */ [1, 1, 1, 0, 1, 1, 1],
    /* 14 "-"   */ [0, 0, 0, 0, 0, 0, 1],
    /* 15 blank */ [0, 0, 0, 0, 0, 0, 0],
  ];
  let segs = T[bcd].slice();

  // DF=HIGH inverts every segment output (active-LOW selection).
  if (df === 1) segs = segs.map(b => b ^ 1);

  // DFO = buffered DISPLAY FREQUENCY IN (same phase).
  return this._drivePinBits(comp, gate.outputs, [...segs, df]);
}

function _evaluateBcd7seg4056_fn(comp, gate) {
  // CD4056B: BCD-to-7-segment decoder/driver with a STROBED LATCH and a
  // DISPLAY-FREQUENCY (DF) phase input, for liquid-crystal (and DC) displays.
  // The sibling of the CD4055B above; same full 16-code decode, but the CD4056B
  // adds an input STROBE latch (and has NO DISPLAY-FREQUENCY OUTPUT pin).
  //
  // inputs:  [A, B, C, D, ST, DF]   A=2^0 (LSB) .. D=2^3 (MSB)
  // outputs: [a, b, c, d, e, f, g]
  //
  // STROBE (ST): HIGH = transparent (the latch follows the BCD inputs);
  //   LOW = data latched, decoded segments hold. This is the OPPOSITE polarity
  //   to the CD4543 LE (which is LOW=transparent), so the CD4056B gets its own
  //   primitive instead of reusing _evaluateBcd7seg4543. (Datasheet page 1:
  //   "data is transferred from input to output by placing a high voltage level
  //   at the strobe input. A low voltage level at the strobe input latches the
  //   data"; cf. the CD4054B truth table ST=1 -> follow, ST=0 -> hold.)
  // DISPLAY FREQUENCY (DF): each output = decoded_segment XOR DF.
  //   DF=0 -> a selected segment drives HIGH; DF=1 -> a selected segment drives
  //   LOW. A square wave on DF gives the AC drive a real LCD needs (selected
  //   segment 180 deg out of phase with DF, non-selected in phase). 74Sim
  //   resolves nets to DC levels and has only idealized clocks (A3), so DF is
  //   modeled as a STATIC invert (same simplification as the CD4543 Ph pin and
  //   the CD4055B DF above; see issues.md). In DC-display use (DF tied LOW/HIGH)
  //   this is exact.
  // Full decode of all 16 input codes: 0-9, then L, H, P, A, -, blank for codes
  //   10-15 -- unlike the CD4511/CD4543, which blank codes 10-15.
  //
  // Source: Texas Instruments (data sheet acquired from Harris Semiconductor),
  //   "CD4054B, CD4055B, CD4056B Types — CMOS Liquid-Crystal Display Drivers,
  //   High-Voltage Types (20-Volt Rating)", SCHS048C (Revised October 2003).
  //   [Online]. Available: https://www.ti.com/lit/ds/symlink/cd4056b.pdf.
  //   Verified: "CD4056B Terminal Assignment" (92CS-24487) + "Fig.3 CD4056B
  //   functional diagram" + "TRUTH TABLE FOR CD4055B and CD4056B", read as
  //   300-dpi PDF page images. NOT cloned from the CD4543 (issues.md C2).
  const [aN, bN, cN, dN, stN, dfN] = gate.inputs;
  const state = this._getSeqState(comp, gate.outputs[0], { bcd: 0 });

  const st = this._readPinBit(comp, stN);
  if (st === 1) {
    state.bcd = this._readPinBit(comp, aN) | (this._readPinBit(comp, bN) << 1) |
      (this._readPinBit(comp, cN) << 2) | (this._readPinBit(comp, dN) << 3);
  }

  const df = this._readPinBit(comp, dfN);

  // BCD -> 7 segment, active-HIGH reference (DF=LOW). Verified vs SCHS048C truth
  // table.            a  b  c  d  e  f  g
  const T = [
    /*  0       */ [1, 1, 1, 1, 1, 1, 0],
    /*  1       */ [0, 1, 1, 0, 0, 0, 0],
    /*  2       */ [1, 1, 0, 1, 1, 0, 1],
    /*  3       */ [1, 1, 1, 1, 0, 0, 1],
    /*  4       */ [0, 1, 1, 0, 0, 1, 1],
    /*  5       */ [1, 0, 1, 1, 0, 1, 1],
    /*  6       */ [1, 0, 1, 1, 1, 1, 1],
    /*  7       */ [1, 1, 1, 0, 0, 0, 0],
    /*  8       */ [1, 1, 1, 1, 1, 1, 1],
    /*  9       */ [1, 1, 1, 1, 0, 1, 1],
    /* 10 "L"   */ [0, 0, 0, 1, 1, 1, 0],
    /* 11 "H"   */ [0, 1, 1, 0, 1, 1, 1],
    /* 12 "P"   */ [1, 1, 0, 0, 1, 1, 1],
    /* 13 "A"   */ [1, 1, 1, 0, 1, 1, 1],
    /* 14 "-"   */ [0, 0, 0, 0, 0, 0, 1],
    /* 15 blank */ [0, 0, 0, 0, 0, 0, 0],
  ];
  let segs = T[state.bcd & 0x0f].slice();

  // DF=HIGH inverts every segment output (static model of the phase drive).
  if (df === 1) segs = segs.map(b => b ^ 1);

  return this._drivePinBits(comp, gate.outputs, segs);
}

function _evaluateDec4to16LatchHi_fn(comp, gate) {
  // CD74x4514: 4-to-16 decoder with input latches, active HIGH outputs.
  // inputs: [A, B, C, D, LE, ENn]
  // outputs: [Y0..Y15]
  // LE=LOW: address transparent. LE=HIGH: address latched.
  // ENn=LOW: enabled (selected output HIGH). ENn=HIGH: all outputs LOW.
  //
  // gate.strobeActiveHigh: the original CMOS CD4514B uses a STROBE pin whose
  // transparent/latched sense is the OPPOSITE of the default LE here — STROBE
  // HIGH is transparent, and data is held on the STROBE 1->0 transition (per
  // the TI CD4514B SCHS074A datasheet). Set this flag so the latch-input bit is
  // inverted before the transparent-when-0 logic below applies. Default (flag
  // absent) preserves the existing 74x4514/74x4515 active-LOW-transparent LE.
  const state = this._getSeqState(comp, gate.outputs[0], { addr: 0 });
  const bits = this._readGateInputs(comp, gate.inputs);
  const le = gate.strobeActiveHigh ? (bits[4] ? 0 : 1) : bits[4];
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
  //
  // gate.strobeActiveHigh: the original CMOS CD4515B uses a STROBE pin whose
  // transparent/latched sense is the OPPOSITE of the default LE here — STROBE
  // HIGH is transparent, and data is held on the STROBE 1->0 transition (per
  // the TI CD4515B SCHS074A datasheet). Set this flag so the latch-input bit is
  // inverted before the transparent-when-0 logic below applies. Default (flag
  // absent) preserves the existing 74x4515 active-LOW-transparent LE.
  const state = this._getSeqState(comp, gate.outputs[0], { addr: 0 });
  const bits = this._readGateInputs(comp, gate.inputs);
  const le = gate.strobeActiveHigh ? (bits[4] ? 0 : 1) : bits[4];
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
  // gate.carryActiveLow: true models the real CD4516B/CD4510B (and the
  //   74HC4516) in which CARRY IN and CARRY OUT are ACTIVE LOW — counting is
  //   enabled while CARRY IN is LOW, and CARRY OUT pulses LOW at terminal
  //   count. Defaults false (the legacy active-HIGH behavior of the existing
  //   74x4516 entry — left unchanged so that part is undisturbed).
  const [cpN, udN, peN, ciN, mrN, p0N, p1N, p2N, p3N] = gate.inputs;
  const [q0, q1, q2, q3, coN] = gate.outputs;
  const carryActiveLow = !!gate.carryActiveLow;
  const carryAsserted = (raw) => carryActiveLow ? (raw === 0) : (raw === 1);
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
      const ciEn = carryAsserted(this._readPinBit(comp, ciN));
      if (state.prevClk === 0 && clk === 1 && ciEn) {
        const ud = this._readPinBit(comp, udN);
        if (ud === 1) state.count = (state.count + 1) & 0xF;
        else state.count = (state.count - 1 + 16) & 0xF;
      }
      state.prevClk = clk;
    }
  }

  const ciEn = carryAsserted(this._readPinBit(comp, ciN));
  const ud = this._readPinBit(comp, udN);
  const terminal = (ud === 1) ? 15 : 0;
  const co = (ciEn && state.count === terminal) ? 0 : 1;
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
chipEvaluators._evaluateBcdDivNDown4522    = _evaluateBcdDivNDown4522_fn;
chipEvaluators._evaluateBcd7seg4511        = _evaluateBcd7seg4511_fn;
chipEvaluators._evaluateBcd7seg4543        = _evaluateBcd7seg4543_fn;
chipEvaluators._evaluateBcd7seg4543hc      = _evaluateBcd7seg4543hc_fn;
chipEvaluators._evaluateBcd7seg4055        = _evaluateBcd7seg4055_fn;
chipEvaluators._evaluateBcd7seg4056        = _evaluateBcd7seg4056_fn;
chipEvaluators._evaluateDec4to16LatchHi    = _evaluateDec4to16LatchHi_fn;
chipEvaluators._evaluateDec4to16LatchLo    = _evaluateDec4to16LatchLo_fn;
chipEvaluators._evaluateCounterBinUpdownCd = _evaluateCounterBinUpdownCd_fn;
chipEvaluators._evaluateCounterGatedDecade = _evaluateCounterGatedDecade_fn;
chipEvaluators._evaluateCounterGatedBin    = _evaluateCounterGatedBin_fn;


// ── NEW GATE TYPE IMPLEMENTATIONS ─────────────────────────────────────────

function _evaluateDFFActHi_fn(comp, gate) {
  // CD4013 D flip flop with active HIGH set and reset
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

function _evaluateShiftReg8BitPisoCd4021_fn(comp, gate) {
  // CD4021 8-stage ASYNCHRONOUS-load PISO shift register.
  // Differs from the CD4014 (SHIFT_REG_8BIT_PISO_CD) on two points verified
  // against the TI/Harris CD4014B/CD4021B datasheet (SCHS024C, Fig. 2 logic
  // diagram + Terminal Diagram, read as PDF page images — see issues.md C4):
  //   1. Parallel entry is ASYNCHRONOUS: while PARALLEL/SERIAL CONTROL (PS) is
  //      HIGH the parallel data is jammed straight into the register, the
  //      internal stage clock is "forced", and no CLOCK edge is needed.
  //   2. The brought-out stages are Q6/Q7/Q8 (the last stage Q8 is the main
  //      serial output) — bits 5/6/7 — NOT the 5/6/7 stages of the CD4014.
  // inputs:  [CLK, PS, SER, P1, P2, P3, P4, P5, P6, P7, P8]
  // outputs: [Q6, Q7, Q8]
  const [clkN, psN, serN, p1N, p2N, p3N, p4N, p5N, p6N, p7N, p8N] = gate.inputs;
  const [q6N, q7N, q8N] = gate.outputs;
  const state = this._getSeqState(comp, q8N, { reg: 0, prevClk: 0 });

  const clk = this._readPinBit(comp, clkN);
  const ps = this._readPinBit(comp, psN);
  if (ps === 1) {
    // Asynchronous jam-load: continuously track the parallel inputs while
    // PARALLEL/SERIAL CONTROL is HIGH, independent of the clock line.
    const p1 = this._readPinBit(comp, p1N);
    const p2 = this._readPinBit(comp, p2N);
    const p3 = this._readPinBit(comp, p3N);
    const p4 = this._readPinBit(comp, p4N);
    const p5 = this._readPinBit(comp, p5N);
    const p6 = this._readPinBit(comp, p6N);
    const p7 = this._readPinBit(comp, p7N);
    const p8 = this._readPinBit(comp, p8N);
    state.reg = (p8 << 7) | (p7 << 6) | (p6 << 5) | (p5 << 4) | (p4 << 3) | (p3 << 2) | (p2 << 1) | p1;
  } else if (state.prevClk === 0 && clk === 1) {
    // Serial shift on the rising clock edge (PS LOW). New serial bit enters
    // stage 1; stage 8 (Q8) shifts out first.
    const ser = this._readPinBit(comp, serN);
    state.reg = ((state.reg << 1) | ser) & 0xFF;
  }
  state.prevClk = clk;

  const q6 = (state.reg >> 5) & 1;
  const q7 = (state.reg >> 6) & 1;
  const q8 = (state.reg >> 7) & 1;
  return this._drivePinBits(comp, [q6N, q7N, q8N], [q6, q7, q8]);
}

function _evaluateShiftRegMuxLatch835_fn(comp, gate) {
  // 74F835 — 8-bit shift register with 2:1 mux-in, latched "B" inputs, serial out.
  // The datasheet describes the part purely as a composite of three standard FAST
  // building blocks (no separate truth table is printed): "Combines the 'F373, two
  // 'F157s, and the 'F166 functions in one package." Polarities below are taken
  // from those constituent parts:
  //   • 'F373 octal transparent latch  → all eight "B" inputs pass through a latch
  //     gated by LE: LE HIGH = transparent (latch follows DnB), LE LOW = hold.
  //   • two 'F157 octal 2:1 muxes       → per bit, SEL LOW selects DnA, SEL HIGH
  //     selects the latched DnB (the 'F157 select: LOW→A, HIGH→B; non-inverting).
  //   • 'F166 8-bit PISO shift register → on the rising CP edge, PE LOW (active-LOW
  //     Parallel Enable) synchronously loads the eight muxed bits into stages 0..7;
  //     PE HIGH shifts toward stage 7, the serial input SER entering stage 0. Stage
  //     7 is the only brought-out stage and is the serial output Q7.
  // Source verified against Philips Components-Signetics, "8-Bit Shift Register with
  // 2:1 Mux-In, Latched 'B' Inputs, and Serial Out" (74F835), doc 853-0615, Jan 8
  // 1990 (1990 Signetics FAST Supplement, p.174-176), read as rendered PDF page
  // images — see header comment on the chip entry. The latch is level-sensitive and
  // updates asynchronously, independent of CP.
  // inputs:  [PEn, CP, SEL, LE, SER,
  //           D0A,D1A,D2A,D3A,D4A,D5A,D6A,D7A,
  //           D0B,D1B,D2B,D3B,D4B,D5B,D6B,D7B]
  // outputs: [Q7]
  const [peN, cpN, selN, leN, serN,
         d0aN, d1aN, d2aN, d3aN, d4aN, d5aN, d6aN, d7aN,
         d0bN, d1bN, d2bN, d3bN, d4bN, d5bN, d6bN, d7bN] = gate.inputs;
  const [q7N] = gate.outputs;
  const state = this._getSeqState(comp, q7N, { reg: 0, bLatch: 0, prevClk: 0 });

  const aPins = [d0aN, d1aN, d2aN, d3aN, d4aN, d5aN, d6aN, d7aN];
  const bPins = [d0bN, d1bN, d2bN, d3bN, d4bN, d5bN, d6bN, d7bN];

  // 'F373 transparent latch on the B bank — level-sensitive, async to CP.
  const le = this._readPinBit(comp, leN);
  if (le === 1) {
    let b = 0;
    for (let n = 0; n < 8; n++) b |= this._readPinBit(comp, bPins[n]) << n;
    state.bLatch = b;
  }

  // 'F157 octal 2:1 mux: SEL LOW → A bank, SEL HIGH → latched B bank.
  const sel = this._readPinBit(comp, selN);
  let mux = 0;
  for (let n = 0; n < 8; n++) {
    const bit = sel === 1 ? (state.bLatch >> n) & 1 : this._readPinBit(comp, aPins[n]);
    mux |= bit << n;
  }

  // 'F166 register: rising CP edge loads (PE LOW) or shifts (PE HIGH).
  const cp = this._readPinBit(comp, cpN);
  if (state.prevClk === 0 && cp === 1) {
    const pe = this._readPinBit(comp, peN);
    if (pe === 0) {
      state.reg = mux & 0xFF;
    } else {
      const ser = this._readPinBit(comp, serN);
      state.reg = ((state.reg << 1) | ser) & 0xFF; // stage0←SER, stage_n←stage_(n-1)
    }
  }
  state.prevClk = cp;

  return this._drivePinBits(comp, [q7N], [(state.reg >> 7) & 1]);
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

function _evaluateShiftReg18Bit4006_fn(comp, gate) {
  // CD4006B — 18-stage static shift register, four independent sections.
  // Verified against SYC Semiconductores' second-source CD4006 datasheet,
  // "CMOS 18-Stage Static Register" (TI/RCA-format part), Pinout (CD4006BM
  // TOP VIEW) + Functional Diagram, read as a rendered PDF page image
  // (issues.md C4 — the TI cd4006b.pdf URL 404s, and text summaries of these
  // scans hallucinate). The functional diagram shows:
  //   • Section 1: D1 → 4-stage → D1+4 (pin 13). Its output also feeds an
  //     extra LATCH → D1+4' (pin 2), the same data delayed one HALF clock
  //     cycle to ease cascading when clock edges are slow.
  //   • Section 2: D2 → 4-stage (tap = D2+4, pin 11) → +1 stage → D2+5 (pin 12).
  //   • Section 3: D3 → 4-stage → D3+4 (pin 10).
  //   • Section 4: D4 → 4-stage (tap = D4+4, pin 8) → +1 stage → D4+5 (pin 9).
  // A single common CLOCK drives every stage. "Data are shifted to the next
  // stages on NEGATIVE-going transitions of the clock" — i.e. the FALLING
  // edge (datasheet Description). The D1+4' latch is the opposite phase, so it
  // updates on the RISING edge (half a cycle after D1+4 changes).
  // inputs:  [D1, D2, D3, D4, CLOCK]
  // outputs: [D1+4, D1+4', D2+4, D2+5, D3+4, D4+4, D4+5]
  const [d1N, d2N, d3N, d4N, clkN] = gate.inputs;
  const [o1_4N, o1_4pN, o2_4N, o2_5N, o3_4N, o4_4N, o4_5N] = gate.outputs;
  const state = this._getSeqState(comp, o1_4N, {
    s1: [0, 0, 0, 0],        // section 1: 4 stages
    s2: [0, 0, 0, 0, 0],     // section 2: 5 stages (tap at index 3)
    s3: [0, 0, 0, 0],        // section 3: 4 stages
    s4: [0, 0, 0, 0, 0],     // section 4: 5 stages (tap at index 3)
    latch: 0,                // D1+4' half-cycle latch
    prevClk: 0,
  });

  const clk = this._readPinBit(comp, clkN);
  // shiftIn: arr[0] takes the new bit, everything else moves one stage along.
  const shiftIn = (arr, din) => { for (let i = arr.length - 1; i > 0; i--) arr[i] = arr[i - 1]; arr[0] = din; };

  if (state.prevClk === 1 && clk === 0) {
    // Falling edge: every section advances one stage.
    shiftIn(state.s1, this._readPinBit(comp, d1N));
    shiftIn(state.s2, this._readPinBit(comp, d2N));
    shiftIn(state.s3, this._readPinBit(comp, d3N));
    shiftIn(state.s4, this._readPinBit(comp, d4N));
  } else if (state.prevClk === 0 && clk === 1) {
    // Rising edge: the D1+4' latch captures the current D1+4 (= s1 last stage),
    // delaying it one half clock cycle relative to D1+4 itself.
    state.latch = state.s1[3];
  }
  state.prevClk = clk;

  return this._drivePinBits(comp,
    [o1_4N, o1_4pN, o2_4N, o2_5N, o3_4N, o4_4N, o4_5N],
    [state.s1[3], state.latch, state.s2[3], state.s2[4], state.s3[3], state.s4[3], state.s4[4]]);
}

function _evaluateShiftReg64Bit4031_fn(comp, gate) {
  // CD4031B — CMOS 64-stage static shift register (serial-in / serial-out), with
  // a 2:1 input data-source select, a half-stage delayed data output, and a
  // delayed clock output for cascading.
  // Source: Texas Instruments (data sheet acquired from Harris Semiconductor),
  //   "CD4031B Types — CMOS 64-Stage Static Shift Register", SCHS036B
  //   (Revised July 2003). [Online]. Available:
  //   https://www.ti.com/lit/ds/symlink/cd4031b.pdf. Verified: FUNCTIONAL DIAGRAM,
  //   INPUT CONTROL CIRCUIT TRUTH TABLE, TYPICAL STAGE TRUTH TABLE, and the
  //   Q'/Terminal-5 truth table, read as 400-dpi rendered PDF page images
  //   (issues.md C4), not cloned from a sibling (issues.md C2).
  // inputs:  [DI1, DI2, CLK, MODE]
  // outputs: [Q, QBAR, QP, CLD]
  //   Datasheet facts encoded:
  //   • 64 D-type master/slave stages. The bit selected for stage 1 shifts one
  //     stage toward the output on each POSITIVE (rising) CL edge — TYPICAL STAGE
  //     TRUTH TABLE ("Data → Data+1" on the rising edge). Fully static: a stopped
  //     clock holds the pattern.
  //   • MODE CONTROL selects the bit entering stage 1 (INPUT CONTROL CIRCUIT
  //     TRUTH TABLE): MODE=0 → DI1 (DATA IN 1, pin 15); MODE=1 → DI2 (DATA IN 2 /
  //     RECIRCULATE, pin 1).
  //   • Q (pin 6) = stage-64 output (Data+64); QBAR (pin 7) = its complement.
  //   • QP = Q' (pin 5) from the extra "1/2 stage", a D-type master-only flip-flop
  //     that captures the stage-64 value on the NEGATIVE (falling) CL edge — the
  //     Q'/Terminal-5 truth table shows "Data+64 → Data+64½" on the falling edge —
  //     so Q' is the Q data delayed by half a clock (for slow-edge cascading).
  //   • CLD = CL_D (pin 9), the delayed clock output used to cascade packages with
  //     reduced clock drive. In 74Sim's zero-delay engine (issues.md A1) it carries
  //     the same logic level as CL IN, which is the correct functional model — the
  //     real part adds only propagation delay, not a logic change.
  const [di1N, di2N, clkN, modeN] = gate.inputs;
  const [qN, qbarN, qpN, cldN] = gate.outputs;
  const state = this._getSeqState(comp, qN, {
    stages: new Array(64).fill(0),  // stages[0] = stage 1 (input end) … stages[63] = stage 64 (Q)
    half: 0,                        // 1/2 stage output (Q')
    prevClk: 0,
  });
  const clk = this._readPinBit(comp, clkN);
  if (state.prevClk === 0 && clk === 1) {
    // Rising edge: shift one stage toward the output; stage 1 takes the
    // MODE-selected input bit.
    const din = this._readPinBit(comp, modeN) === 1
      ? this._readPinBit(comp, di2N)
      : this._readPinBit(comp, di1N);
    for (let i = 63; i > 0; i--) state.stages[i] = state.stages[i - 1];
    state.stages[0] = din;
  } else if (state.prevClk === 1 && clk === 0) {
    // Falling edge: the 1/2 stage captures the stage-64 output (Q' = Data+64½).
    state.half = state.stages[63];
  }
  state.prevClk = clk;
  const q = state.stages[63];
  return this._drivePinBits(comp, [qN, qbarN, qpN, cldN],
    [q, q ^ 1, state.half, clk]);
}

function _evaluateBilateralSwitch_fn(comp, gate) {
  // CD4016 / CD4066 / 4316 family quad bilateral analog switch channel.
  // gate.inputs:  [X, Y, EN]
  // gate.outputs: [X, Y]  (legacy; ignored — channel is purely passive now)
  // EN=1: stamp a fixed on-resistance between X and Y so the MNA solver
  //   passes any analog voltage between them (no rail snapping).
  // EN=0: clear the coupling so the two terminals are electrically isolated.
  const [xN, yN, enN] = gate.inputs;
  const en = this._readPinBit(comp, enN);
  const gateKey = 'bsw:' + xN + '|' + yN;
  const R_ON = (comp.chipDef && comp.chipDef.onResistance) || 200;
  if (en === 1) {
    return this._coupleChipPins(comp, gateKey, xN, yN, R_ON);
  }
  return this._uncoupleChipPins(comp, gateKey);
}

function _evaluateAnalogMux8_fn(comp, gate) {
  // CD4051 8:1 analog mux/demux. Common = Z (override with gate.common,
  // e.g. 'COM' on the 74x4851); channels = Y0..Y7.
  // INH=1 disconnects all channels; otherwise the channel indexed by
  // (C<<2)|(B<<1)|A is coupled to the common node through onResistance.
  const [aN, bN, cN, inhN] = gate.inputs;
  const common = gate.common || 'Z';
  const inh = this._readPinBit(comp, inhN);
  const sel = (this._readPinBit(comp, cN) << 2)
            | (this._readPinBit(comp, bN) << 1)
            |  this._readPinBit(comp, aN);
  const R_ON = (comp.chipDef && comp.chipDef.onResistance) || 125;
  const yPins = ['Y0','Y1','Y2','Y3','Y4','Y5','Y6','Y7'];
  let changed = false;
  for (let i = 0; i < 8; i++) {
    const key = 'mux8:' + yPins[i];
    if (inh === 0 && i === sel) {
      if (this._coupleChipPins(comp, key, common, yPins[i], R_ON)) changed = true;
    } else {
      if (this._uncoupleChipPins(comp, key)) changed = true;
    }
  }
  return changed;
}

function _evaluateAnalogMux16_fn(comp, gate) {
  // CD4067 16:1 analog mux/demux. Common = Z; channels = Y0..Y15.
  // INH=1 disconnects all channels; otherwise the channel indexed by
  // (D<<3)|(C<<2)|(B<<1)|A is coupled to Z through onResistance.
  const [aN, bN, cN, dN, inhN] = gate.inputs;
  const inh = this._readPinBit(comp, inhN);
  const sel = (this._readPinBit(comp, dN) << 3)
            | (this._readPinBit(comp, cN) << 2)
            | (this._readPinBit(comp, bN) << 1)
            |  this._readPinBit(comp, aN);
  const R_ON = (comp.chipDef && comp.chipDef.onResistance) || 125;
  let changed = false;
  for (let i = 0; i < 16; i++) {
    const yName = 'Y' + i;
    const key = 'mux16:' + yName;
    if (inh === 0 && i === sel) {
      if (this._coupleChipPins(comp, key, 'Z', yName, R_ON)) changed = true;
    } else {
      if (this._uncoupleChipPins(comp, key)) changed = true;
    }
  }
  return changed;
}

function _evaluateAnalogMuxDual4_fn(comp, gate) {
  // CD4052 dual 4:1 analog mux/demux. Two sections share A/B/INH:
  //   X section: XZ ↔ Xn   Y section: YZ ↔ Yn  for n = (B<<1)|A.
  const [aN, bN, inhN] = gate.inputs;
  const inh = this._readPinBit(comp, inhN);
  const sel = (this._readPinBit(comp, bN) << 1) | this._readPinBit(comp, aN);
  const R_ON = (comp.chipDef && comp.chipDef.onResistance) || 125;
  const xPins = ['X0','X1','X2','X3'];
  const yPins = ['Y0','Y1','Y2','Y3'];
  let changed = false;
  for (let i = 0; i < 4; i++) {
    const xKey = 'muxX:' + xPins[i];
    const yKey = 'muxY:' + yPins[i];
    if (inh === 0 && i === sel) {
      if (this._coupleChipPins(comp, xKey, 'XZ', xPins[i], R_ON)) changed = true;
      if (this._coupleChipPins(comp, yKey, 'YZ', yPins[i], R_ON)) changed = true;
    } else {
      if (this._uncoupleChipPins(comp, xKey)) changed = true;
      if (this._uncoupleChipPins(comp, yKey)) changed = true;
    }
  }
  return changed;
}

function _evaluateAnalogMuxDual4_4852_fn(comp, gate) {
  // SN74HC4852 dual 4:1 analog mux/demux. Functionally a 4052 (same decode),
  // but the two sections use this part's own pin labels:
  //   section 1: 1Z ↔ 1Y(n)   section 2: 2Z ↔ 2Y(n)  for n = (B<<1)|A.
  // INH=1 opens every channel in both sections (both commons float).
  // Source: TI SN74HC4852, SCLS573A, Table 4-1 "Function Table" —
  //   INH/B/A select 1Yn,2Yn together; A=LSB, B=MSB; INH=H -> None.
  const [aN, bN, inhN] = gate.inputs;
  const inh = this._readPinBit(comp, inhN);
  const sel = (this._readPinBit(comp, bN) << 1) | this._readPinBit(comp, aN);
  const R_ON = (comp.chipDef && comp.chipDef.onResistance) || 125;
  let changed = false;
  for (let i = 0; i < 4; i++) {
    const ch1 = '1Y' + i;
    const ch2 = '2Y' + i;
    const k1 = 'mux4852-1:' + ch1;
    const k2 = 'mux4852-2:' + ch2;
    if (inh === 0 && i === sel) {
      if (this._coupleChipPins(comp, k1, '1Z', ch1, R_ON)) changed = true;
      if (this._coupleChipPins(comp, k2, '2Z', ch2, R_ON)) changed = true;
    } else {
      if (this._uncoupleChipPins(comp, k1)) changed = true;
      if (this._uncoupleChipPins(comp, k2)) changed = true;
    }
  }
  return changed;
}

function _evaluateAnalogMuxDual8_fn(comp, gate) {
  // CD4097 differential (dual) 8:1 analog mux/demux. Two independent
  // 8-channel sections share a common 3-bit address A/B/C and one INHIBIT:
  //   X section: XZ ↔ Xn   Y section: YZ ↔ Yn  for n = (C<<2)|(B<<1)|A.
  // INH=1 opens all channels in both sections (both commons float).
  // Source: TI CD4067B/CD4097B (SCHS052D) Table 4-2 "CD4097 TRUTH TABLE" —
  //   A=LSB, C=MSB select 0X/0Y..7X/7Y; inh=1 -> None.
  const [aN, bN, cN, inhN] = gate.inputs;
  const inh = this._readPinBit(comp, inhN);
  const sel = (this._readPinBit(comp, cN) << 2)
            | (this._readPinBit(comp, bN) << 1)
            |  this._readPinBit(comp, aN);
  const R_ON = (comp.chipDef && comp.chipDef.onResistance) || 125;
  let changed = false;
  for (let i = 0; i < 8; i++) {
    const xName = 'X' + i;
    const yName = 'Y' + i;
    const xKey = 'mux8X:' + xName;
    const yKey = 'mux8Y:' + yName;
    if (inh === 0 && i === sel) {
      if (this._coupleChipPins(comp, xKey, 'XZ', xName, R_ON)) changed = true;
      if (this._coupleChipPins(comp, yKey, 'YZ', yName, R_ON)) changed = true;
    } else {
      if (this._uncoupleChipPins(comp, xKey)) changed = true;
      if (this._uncoupleChipPins(comp, yKey)) changed = true;
    }
  }
  return changed;
}

function _evaluateAnalogMuxTriple2_fn(comp, gate) {
  // CD4053 triple 2:1 analog mux (three independent SPDT switches).
  // Section A: ZA ↔ Y0A (A=0) or Y1A (A=1)
  // Section B: ZB ↔ Y0B (B=0) or Y1B (B=1)
  // Section C: ZC ↔ Y0C (C=0) or Y1C (C=1)
  // INH=1 opens all three sections.
  const [aN, bN, cN, inhN] = gate.inputs;
  const inh = this._readPinBit(comp, inhN);
  const R_ON = (comp.chipDef && comp.chipDef.onResistance) || 125;
  const sections = [
    { sel: aN, common: 'ZA', y0: 'Y0A', y1: 'Y1A', tag: 'A' },
    { sel: bN, common: 'ZB', y0: 'Y0B', y1: 'Y1B', tag: 'B' },
    { sel: cN, common: 'ZC', y0: 'Y0C', y1: 'Y1C', tag: 'C' },
  ];
  let changed = false;
  for (const s of sections) {
    const bit = this._readPinBit(comp, s.sel);
    const k0 = 'mux3:' + s.tag + ':0';
    const k1 = 'mux3:' + s.tag + ':1';
    if (inh !== 0) {
      if (this._uncoupleChipPins(comp, k0)) changed = true;
      if (this._uncoupleChipPins(comp, k1)) changed = true;
      continue;
    }
    if (bit === 0) {
      if (this._coupleChipPins(comp, k0, s.common, s.y0, R_ON)) changed = true;
      if (this._uncoupleChipPins(comp, k1)) changed = true;
    } else {
      if (this._uncoupleChipPins(comp, k0)) changed = true;
      if (this._coupleChipPins(comp, k1, s.common, s.y1, R_ON)) changed = true;
    }
  }
  return changed;
}

function _evaluateAnalogMux8Latch_fn(comp, gate) {
  // CD74HC4351 8-channel analog mux/demux WITH an address latch.
  // Channels A0..A7 are bidirectional transmission gates; the addressed one is
  // resistively coupled to the common COM. Select = (S2<<2)|(S1<<1)|S0, captured
  // by a level-sensitive latch: LE HIGH = transparent (follows S0..S2), LE LOW =
  // hold last address. Two enables: device is enabled only when E1 is LOW AND
  // E2 is HIGH; otherwise every switch is open ("None"). See the per-chip
  // citation in js/chips/chips59.js for the datasheet reference.
  // inputs: [S0, S1, S2, LE, E1, E2]
  const [s0N, s1N, s2N, leN, e1N, e2N] = gate.inputs;
  if (!comp.state) comp.state = { sel: 0 };
  const le = this._readPinBit(comp, leN);
  if (le === 1) {
    comp.state.sel = (this._readPinBit(comp, s2N) << 2)
                   | (this._readPinBit(comp, s1N) << 1)
                   |  this._readPinBit(comp, s0N);
  }
  const enabled = (this._readPinBit(comp, e1N) === 0)
               && (this._readPinBit(comp, e2N) === 1);
  const sel = comp.state.sel;
  const R_ON = (comp.chipDef && comp.chipDef.onResistance) || 125;
  let changed = false;
  for (let i = 0; i < 8; i++) {
    const ch = 'A' + i;
    const key = 'mux8L:' + ch;
    if (enabled && i === sel) {
      if (this._coupleChipPins(comp, key, 'COM', ch, R_ON)) changed = true;
    } else {
      if (this._uncoupleChipPins(comp, key)) changed = true;
    }
  }
  return changed;
}

function _evaluateAnalogMuxDual4Latch_fn(comp, gate) {
  // CD74HC4352 DUAL 4-channel analog mux/demux WITH a shared address latch.
  // Two independent transmission-gate banks, A and B, switch together off one
  // 2-bit select: the addressed A channel is coupled to common ACOM and the
  // matching B channel to common BCOM. Select = (S1<<1)|S0, captured by a
  // level-sensitive latch: LE HIGH = transparent (follows S0/S1), LE LOW = hold
  // the last address. Two enables: device is enabled only when E1 is LOW AND E2
  // is HIGH; otherwise every switch is open ("None"). See the per-chip citation
  // in js/chips/chips59.js for the datasheet reference. Mirrors the single-bank
  // ANALOG_MUX_8_LATCH (CD74HC4351) on the same die.
  // inputs: [S0, S1, LE, E1, E2]
  const [s0N, s1N, leN, e1N, e2N] = gate.inputs;
  if (!comp.state) comp.state = { sel: 0 };
  const le = this._readPinBit(comp, leN);
  if (le === 1) {
    comp.state.sel = (this._readPinBit(comp, s1N) << 1)
                   |  this._readPinBit(comp, s0N);
  }
  const enabled = (this._readPinBit(comp, e1N) === 0)
               && (this._readPinBit(comp, e2N) === 1);
  const sel = comp.state.sel;
  const R_ON = (comp.chipDef && comp.chipDef.onResistance) || 100;
  let changed = false;
  for (let i = 0; i < 4; i++) {
    const aCh = 'A' + i;
    const bCh = 'B' + i;
    const aKey = 'mux4LA:' + aCh;
    const bKey = 'mux4LB:' + bCh;
    if (enabled && i === sel) {
      if (this._coupleChipPins(comp, aKey, 'ACOM', aCh, R_ON)) changed = true;
      if (this._coupleChipPins(comp, bKey, 'BCOM', bCh, R_ON)) changed = true;
    } else {
      if (this._uncoupleChipPins(comp, aKey)) changed = true;
      if (this._uncoupleChipPins(comp, bKey)) changed = true;
    }
  }
  return changed;
}

function _evaluateAnalogMuxTriple2Latch_fn(comp, gate) {
  // CD74HC4353 TRIPLE 2-channel analog mux/demux WITH an address latch.
  // Three independent SPDT transmission-gate sections X, Y, Z, each switched by
  // its own select bit (A->X, B->Y, C->Z). Within a section the common node is
  // resistively coupled to channel 0 (select LOW) or channel 1 (select HIGH).
  // The three selects are captured together by one level-sensitive latch: LE
  // HIGH = transparent (follows A/B/C), LE LOW = hold the last address. Two
  // enables: the device is enabled only when E1 is LOW AND E2 is HIGH;
  // otherwise every switch is open ("None"). Functionally a 4053 with an
  // address latch and dual enable. See the per-chip citation in
  // js/chips/chips59.js for the datasheet reference.
  // inputs: [A, B, C, LE, E1, E2]
  const [aN, bN, cN, leN, e1N, e2N] = gate.inputs;
  if (!comp.state) comp.state = { a: 0, b: 0, c: 0 };
  const le = this._readPinBit(comp, leN);
  if (le === 1) {
    comp.state.a = this._readPinBit(comp, aN);
    comp.state.b = this._readPinBit(comp, bN);
    comp.state.c = this._readPinBit(comp, cN);
  }
  const enabled = (this._readPinBit(comp, e1N) === 0)
               && (this._readPinBit(comp, e2N) === 1);
  const R_ON = (comp.chipDef && comp.chipDef.onResistance) || 80;
  const sections = [
    { bit: comp.state.a, common: 'XCOM', ch0: 'X0', ch1: 'X1', tag: 'X' },
    { bit: comp.state.b, common: 'YCOM', ch0: 'Y0', ch1: 'Y1', tag: 'Y' },
    { bit: comp.state.c, common: 'ZCOM', ch0: 'Z0', ch1: 'Z1', tag: 'Z' },
  ];
  let changed = false;
  for (const s of sections) {
    const k0 = 'mux2L:' + s.tag + ':0';
    const k1 = 'mux2L:' + s.tag + ':1';
    if (enabled && s.bit === 0) {
      if (this._coupleChipPins(comp, k0, s.common, s.ch0, R_ON)) changed = true;
      if (this._uncoupleChipPins(comp, k1)) changed = true;
    } else if (enabled && s.bit === 1) {
      if (this._uncoupleChipPins(comp, k0)) changed = true;
      if (this._coupleChipPins(comp, k1, s.common, s.ch1, R_ON)) changed = true;
    } else {
      if (this._uncoupleChipPins(comp, k0)) changed = true;
      if (this._uncoupleChipPins(comp, k1)) changed = true;
    }
  }
  return changed;
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

function _evaluateCounterOctalDecoded_fn(comp, gate) {
  // CD4022 octal (divide-by-8) Johnson counter with 8 decoded outputs.
  // Octal sibling of COUNTER_DECADE_DECODED (CD4017): mod-8 instead of mod-10,
  // 8 decoded outputs Q0..Q7, and CARRY OUT HIGH for the first half of the
  // cycle (counts 0-3) so it can ripple-clock a following stage every 8 pulses.
  // inputs:  [CLK, MR, CI]
  // outputs: [Q0, Q1, Q2, Q3, Q4, Q5, Q6, Q7, CO]
  const [clkN, mrN, ciN] = gate.inputs;
  const [q0N, q1N, q2N, q3N, q4N, q5N, q6N, q7N, coN] = gate.outputs;
  const state = this._getSeqState(comp, q0N, { count: 0, prevClk: 0 });

  const mr = this._readPinBit(comp, mrN);
  if (mr === 1) {
    state.count = 0;
    state.prevClk = this._readPinBit(comp, clkN);
  } else {
    const ci = this._readPinBit(comp, ciN);
    const clk = this._readPinBit(comp, clkN);
    if (ci === 0 && state.prevClk === 0 && clk === 1) {
      state.count = (state.count + 1) % 8;
    }
    state.prevClk = clk;
  }

  const cnt = state.count;
  const outputs = [q0N, q1N, q2N, q3N, q4N, q5N, q6N, q7N];
  const vals = outputs.map((_, i) => (i === cnt ? 1 : 0));
  const co = cnt <= 3 ? 1 : 0;
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

function _evaluateCounterBinOsc14Clko_fn(comp, gate) {
  // 74HC4060 / SN74HC4060: 14-stage binary ripple counter with oscillator pins.
  // Same counter core as COUNTER_BIN_OSC_14, but this part brings out the two
  // oscillator buffer outputs CLKO and CLKOn as real driven pins.
  // Source: Texas Instruments, "SN54HC4060, SN74HC4060 14-Stage Asynchronous
  //   Binary Counters and Oscillators", SCLS161D (1982, rev. 2003), p.1-2.
  //   Function table: CLKI high-to-low transition advances the counter; a HIGH
  //   on CLR clears all stages AND parks the oscillator (CLKO HIGH, CLKOn LOW).
  // inputs:  [CLKI, CLR]
  // outputs: [Q4,Q5,Q6,Q7,Q8,Q9,Q10,Q12,Q13,Q14, CLKO, CLKOn]
  const [clkN, clrN] = gate.inputs;
  const q = gate.outputs;
  const clkoN = q[10], clkonN = q[11];
  const state = this._getSeqState(comp, q[0], { count: 0, prevClk: 0 });

  const clr = this._readPinBit(comp, clrN);
  const clk = this._readPinBit(comp, clkN);
  if (clr === 1) {
    state.count = 0;
    state.prevClk = clk;
  } else if (state.prevClk === 1 && clk === 0) {
    // advance on the falling (high-to-low) edge of CLKI
    state.count = (state.count + 1) & 0x3FFF;
    state.prevClk = clk;
  } else {
    state.prevClk = clk;
  }

  const cnt = state.count;
  let changed = this._drivePinBits(comp,
    [q[0], q[1], q[2], q[3], q[4], q[5], q[6], q[7], q[8], q[9]],
    [
      (cnt >> 3) & 1,   // Q4
      (cnt >> 4) & 1,   // Q5
      (cnt >> 5) & 1,   // Q6
      (cnt >> 6) & 1,   // Q7
      (cnt >> 7) & 1,   // Q8
      (cnt >> 8) & 1,   // Q9
      (cnt >> 9) & 1,   // Q10
      (cnt >> 11) & 1,  // Q12 (stage 11 not brought out)
      (cnt >> 12) & 1,  // Q13
      (cnt >> 13) & 1,  // Q14
    ]
  );

  // Oscillator buffer pins. While CLR is HIGH the oscillator is disabled and
  // the datasheet pins CLKO HIGH / CLKOn LOW. Otherwise they present
  // complementary buffered copies of the CLKI node so an RC/crystal loop (or
  // an observer) sees an oscillator-style waveform.
  const clko  = clr === 1 ? 1 : (clk === 0 ? 1 : 0);
  const clkon = clr === 1 ? 0 : (clk === 0 ? 0 : 1);
  if (this._drivePinBits(comp, [clkoN, clkonN], [clko, clkon])) changed = true;
  return changed;
}

function _evaluateCounterDisplay4Digit928_fn(comp, gate) {
  // MM74C925/926/928 family — 4-digit counter + multiplexed 7-segment display
  // driver. One primitive covers the whole family; the per-chip differences are
  // passed in on the gate:
  //   • gate.maxCount  — terminal count before wrap-to-0 (default 1999 = '928).
  //                      9999 for the full 4-decade '925/'926.
  //   • inputs[3] (DS) — optional DISPLAY SELECT. Present on '926/'928 (HIGH = show
  //                      live counter, LOW = show latch). Absent on the '925, whose
  //                      multiplexer reads the latch directly — so a missing DS pin
  //                      reads as "show latch" (= DS LOW), which with LE HIGH still
  //                      shows the live count. See the '925 logic diagram, p.2.
  //   • outputs[11] (CO) — optional CARRY-OUT/overflow. Present on '926/'928, absent
  //                      on the '925. Driven only when wired.
  //
  // Source: Fairchild Semiconductor, "MM74C925 / MM74C926 / MM74C927 / MM74C928
  //   4-Digit Counters with Multiplexed 7-Segment Output Drivers", DS005919
  //   (Oct 1987, rev. Jan 1999). [Online]. Available:
  //   https://pdf.datasheet.live/3e8c607b/fairchildsemi.com/74C925.pdf (TI/Fairchild
  //   reprint; the jameco.com 44599.pdf mirror is Cloudflare-gated). Verified as
  //   300-dpi PDF page images (issues.md C4 — the text summarizer hallucinates
  //   these pinouts):
  //     • '928 18-pin DIP terminal assignment, "Connection Diagrams" p.2 and the
  //       MM74C928 logic diagram p.3 — d1 e2 f3 g4, LATCH ENABLE 5,
  //       DISPLAY SELECT 6, A_OUT 7, B_OUT 8, GND 9, C_OUT 10, D_OUT 11,
  //       CLOCK 12, RESET 13, CARRY-OUT 14, a15 b16 c17, VCC 18. (The pre-existing
  //       stub had this as a 16-pin part with no DISPLAY SELECT or CARRY-OUT —
  //       a C2-class hand-entered pinout error, corrected here.)
  //     • '925 16-pin DIP terminal assignment, "Connection Diagrams" p.2 (left)
  //       and MM74C925 logic diagram p.2 — d1 e2 f3 g4, LATCH ENABLE 5, A_OUT 6,
  //       B_OUT 7, GND 8, C_OUT 9, D_OUT 10, CLOCK 11, RESET 12, a13 b14 c15,
  //       VCC 16. NO display-select and NO carry-out pin (those are '926/'928
  //       additions). The '925 is a full 4-decade counter (0000–9999).
  //     • Functional Description p.2: Reset = asynchronous, active HIGH; Clock =
  //       negative-edge sensitive; Latch Enable HIGH = flow-through, LOW = latch;
  //       Display Select HIGH = show counter, LOW = show latch.
  //     • General Description p.1: the '928 is the '926 except the most-significant
  //       digit divides by 2 (so the display reads 0000–1999, "3½ digits") and the
  //       carry-out is an OVERFLOW indicator that goes HIGH at terminal count and
  //       returns LOW only on reset.
  //
  // inputs:  [CLK, RST, LE, (DS)]
  // outputs: [a, b, c, d, e, f, g, D1, D2, D3, D4, (CO)]
  //   D1=A_OUT (units) … D4=D_OUT (thousands). CO = overflow (optional).
  const maxCount = (typeof gate.maxCount === 'number') ? gate.maxCount : 1999;
  const [clkN, rstN, leN, dsN] = gate.inputs;
  const segN = gate.outputs.slice(0, 7);                 // a..g
  const digitN = gate.outputs.slice(7, 11);              // D1..D4
  const coN = gate.outputs[11];                          // optional
  const state = this._getSeqState(comp, gate.outputs[0],
    { count: 0, latch: 0, overflow: 0, prevClk: 0 });

  const rst = this._readPinBit(comp, rstN);
  const clk = this._readPinBit(comp, clkN);
  const le  = this._readPinBit(comp, leN);
  const ds  = (dsN !== undefined) ? this._readPinBit(comp, dsN) : 0;

  if (rst === 1) {
    // Asynchronous, active-HIGH reset: counter and overflow flag both cleared.
    state.count = 0;
    state.overflow = 0;
    state.prevClk = clk;
  } else {
    // Negative-edge (HIGH→LOW) clock advances the counter. Rolling over past the
    // terminal count latches the overflow flag (datasheet: carry-out HIGH at the
    // top count, stays HIGH until reset).
    if (state.prevClk === 1 && clk === 0) {
      const next = state.count + 1;
      if (next > maxCount) { state.count = 0; state.overflow = 1; }
      else state.count = next;
    }
    state.prevClk = clk;
  }

  // Output latch: transparent while LE HIGH (flow-through), holds while LE LOW.
  if (le === 1) state.latch = state.count;
  // Display Select: HIGH shows the live counter, LOW shows the latched value.
  const shown = ds === 1 ? state.count : state.latch;

  // Split into the four displayed BCD digits: D1=units … D4=thousands (0/1).
  const digitVal = [
    shown % 10,
    Math.floor(shown / 10) % 10,
    Math.floor(shown / 100) % 10,
    Math.floor(shown / 1000) % 10,
  ];

  // Time-multiplexed scan. The real part drives one digit at a time from an
  // internal ~1 kHz oscillator that has NO external pin, so there is nothing to
  // clock it from in the netlist. We stand in for that oscillator with the
  // simulator's own per-evaluate tick (simVersion, incremented once at the end of
  // each evaluate()): one digit position is driven per pass and the four cycle in
  // turn, exactly as a real multiplexed display does when stepped by the
  // time-domain loop. (Approximation: the scan only advances while the circuit is
  // being stepped — e.g. a CLOCK component drives CLK — not between manual edits.)
  const pos = this.simVersion % 4;
  const digitSel = [0, 0, 0, 0];
  digitSel[pos] = 1;                                       // active digit = HIGH (sourcing)
  const segBits = BCD_7SEG_CC_TABLE[digitVal[pos]].slice(4, 11); // active-HIGH segments

  let changed = false;
  if (this._drivePinBits(comp, segN, segBits)) changed = true;
  if (this._drivePinBits(comp, digitN, digitSel)) changed = true;
  if (coN !== undefined && this._drivePinBit(comp, coN, state.overflow)) changed = true;
  return changed;
}

function _evaluateCounterDisplay4Digit926_fn(comp, gate) {
  // MM74C926 — 4-digit decade counter + multiplexed 7-segment display driver.
  //
  // Source: Fairchild Semiconductor, "MM74C925 / MM74C926 / MM74C927 / MM74C928
  //   4-Digit Counters with Multiplexed 7-Segment Output Drivers", DS005919
  //   (Oct 1987, rev. Jan 1999). [Online]. Available:
  //   https://media.digikey.com/pdf/Data%20Sheets/Fairchild%20PDFs/MM74C925-28.pdf
  //   Verified as 300-dpi PDF page images (issues.md C4 — the text summarizer
  //   hallucinates these pinouts):
  //     • 18-pin DIP terminal assignment, "Connection Diagrams" p.2 (the
  //       MM74C926/927/928 share one diagram) and the MM74C926 logic diagram
  //       p.3 — d1 e2 f3 g4, LATCH ENABLE 5, DISPLAY SELECT 6, A_OUT 7,
  //       B_OUT 8, GND 9, C_OUT 10, D_OUT 11, CLOCK 12, RESET 13, CARRY-OUT 14,
  //       a15 b16 c17, VCC 18. (The pre-existing stub had this as a 16-pin part
  //       with no DISPLAY SELECT or CARRY-OUT — a C2-class hand-entered pinout
  //       error, corrected here. The 16-pin layout actually belongs to the
  //       MM74C925, the no-display-select/no-carry sibling.)
  //     • Functional Description p.2: Reset = asynchronous, active HIGH; Clock =
  //       negative-edge sensitive; Latch Enable HIGH = flow-through, LOW = latch;
  //       Display Select HIGH = show counter, LOW = show latch. (Identical to the
  //       '928 — the parts differ only in the counter modulus and carry-out.)
  //     • General Description p.1: the '926 is the '925 plus a display select and
  //       a carry-out for cascading. All four digits divide by 10, so the display
  //       reads 0000–9999. The carry-out "goes HIGH at 6000, goes back LOW at
  //       0000" — i.e. CO = (count >= 6000); it is a level, NOT the latched
  //       overflow flag of the '928 (which is HIGH at 2000 until reset).
  //
  // inputs:  [CLK, RST, LE, DS]
  // outputs: [a, b, c, d, e, f, g, D1, D2, D3, D4, CO]
  //   D1=A_OUT (units) … D4=D_OUT (thousands). CO = cascade carry (count>=6000).
  const [clkN, rstN, leN, dsN] = gate.inputs;
  const segN = gate.outputs.slice(0, 7);                 // a..g
  const digitN = gate.outputs.slice(7, 11);              // D1..D4
  const coN = gate.outputs[11];
  const state = this._getSeqState(comp, gate.outputs[0],
    { count: 0, latch: 0, prevClk: 0 });

  const rst = this._readPinBit(comp, rstN);
  const clk = this._readPinBit(comp, clkN);
  const le  = this._readPinBit(comp, leN);
  const ds  = this._readPinBit(comp, dsN);

  if (rst === 1) {
    // Asynchronous, active-HIGH reset: counter cleared.
    state.count = 0;
    state.prevClk = clk;
  } else {
    // Negative-edge (HIGH→LOW) clock advances the 0–9999 decade counter,
    // wrapping back to 0 after 9999.
    if (state.prevClk === 1 && clk === 0) {
      state.count = (state.count + 1) % 10000;
    }
    state.prevClk = clk;
  }

  // Output latch: transparent while LE HIGH (flow-through), holds while LE LOW.
  if (le === 1) state.latch = state.count;
  // Display Select: HIGH shows the live counter, LOW shows the latched value.
  const shown = ds === 1 ? state.count : state.latch;

  // Split into the four displayed BCD digits: D1=units … D4=thousands.
  const digitVal = [
    shown % 10,
    Math.floor(shown / 10) % 10,
    Math.floor(shown / 100) % 10,
    Math.floor(shown / 1000) % 10,
  ];

  // Carry-out for cascading: HIGH while the count is 6000–9999, LOW otherwise.
  // The rollover from 9999→0000 therefore presents a HIGH→LOW edge that a
  // cascaded '926's negative-edge clock advances on. (Datasheet level, not the
  // '928's latched overflow.) It tracks the live counter, not the display latch.
  const carry = state.count >= 6000 ? 1 : 0;

  // Time-multiplexed scan. The real part drives one digit at a time from an
  // internal ~1 kHz oscillator that has NO external pin, so there is nothing to
  // clock it from in the netlist. We stand in for that oscillator with the
  // simulator's own per-evaluate tick (simVersion, incremented once at the end
  // of each evaluate()): one digit position is driven per pass and the four
  // cycle in turn, exactly as a real multiplexed display does when stepped by
  // the time-domain loop. (Approximation: the scan only advances while the
  // circuit is being stepped — e.g. a CLOCK component drives CLK — not between
  // manual edits.)
  const pos = this.simVersion % 4;
  const digitSel = [0, 0, 0, 0];
  digitSel[pos] = 1;                                       // active digit = HIGH (sourcing)
  const segBits = BCD_7SEG_CC_TABLE[digitVal[pos]].slice(4, 11); // active-HIGH segments

  let changed = false;
  if (this._drivePinBits(comp, segN, segBits)) changed = true;
  if (this._drivePinBits(comp, digitN, digitSel)) changed = true;
  if (this._drivePinBit(comp, coN, carry)) changed = true;
  return changed;
}

function _evaluateCounterDisplay4Digit927_fn(comp, gate) {
  // MM74C927 — 4-digit timer counter + multiplexed 7-segment display driver.
  // Identical to the '926 except the second-most-significant digit divides by 6
  // instead of 10, so with a 10 Hz clock the display reads minutes : seconds .
  // tenths (max 9:59.9).
  //
  // Source: National Semiconductor (Fairchild), "MM74C925 / MM74C926 / MM74C927
  //   / MM74C928 4-Digit Counters with Multiplexed 7-Segment Output Drivers",
  //   DS005919 (March 1988, rev. 1995). [Online]. Available:
  //   https://archive.org/details/manuallib-id-2710717 (file 2710717.pdf).
  //   Verified as 300-dpi PDF page images (issues.md C4 — the text summarizer
  //   hallucinates these pinouts):
  //     • 18-pin DIP terminal assignment, "Connection Diagrams" p.1 (the
  //       MM74C926/927/928 share one diagram) and the MM74C927 Logic and Block
  //       Diagram p.4 — d1 e2 f3 g4, LATCH ENABLE 5, DISPLAY SELECT 6, A_OUT 7,
  //       B_OUT 8, GND 9, C_OUT 10, D_OUT 11, CLOCK 12, RESET 13, CARRY-OUT 14,
  //       a15 b16 c17, VCC 18. (The pre-existing stub had this as a 16-pin part
  //       with no DISPLAY SELECT or CARRY-OUT — a C2-class hand-entered pinout
  //       error, corrected here. The 16-pin layout actually belongs to the
  //       MM74C925, the no-display-select/no-carry sibling.)
  //     • Logic and Block Diagram p.4: the four decade dividers, MSD→LSD, are
  //       ÷10, ÷6, ÷10, ÷10 — i.e. the second-most-significant digit (C_OUT/D3)
  //       is the ÷6 one. Mixed-radix count of 6000 states (0–5999 internally).
  //     • Functional Description p.3: Reset = asynchronous, active HIGH; Clock =
  //       negative-edge sensitive; Latch Enable HIGH = flow-through, LOW = latch;
  //       Display Select HIGH = show counter, LOW = show latch. (Identical to the
  //       '926 — the parts differ only in the counter modulus and carry-out.)
  //     • General Description p.1 + Carry-Out Waveforms p.6: CARRY-OUT goes HIGH
  //       at display 6:00.0 and back LOW at the 9:59.9→0:00.0 rollover — a
  //       repeating cascade level (CO = minutes digit >= 6, i.e. count >= 3600),
  //       NOT the '928's latched overflow. The HIGH→LOW edge at rollover advances
  //       a cascaded '927's negative-edge clock.
  //
  // inputs:  [CLK, RST, LE, DS]
  // outputs: [a, b, c, d, e, f, g, D1, D2, D3, D4, CO]
  //   D1=A_OUT (tenths) … D4=D_OUT (minutes). CO = cascade carry.
  const [clkN, rstN, leN, dsN] = gate.inputs;
  const segN = gate.outputs.slice(0, 7);                 // a..g
  const digitN = gate.outputs.slice(7, 11);              // D1..D4
  const coN = gate.outputs[11];
  const state = this._getSeqState(comp, gate.outputs[0],
    { count: 0, latch: 0, prevClk: 0 });

  const rst = this._readPinBit(comp, rstN);
  const clk = this._readPinBit(comp, clkN);
  const le  = this._readPinBit(comp, leN);
  const ds  = this._readPinBit(comp, dsN);

  if (rst === 1) {
    // Asynchronous, active-HIGH reset: counter cleared.
    state.count = 0;
    state.prevClk = clk;
  } else {
    // Negative-edge (HIGH→LOW) clock advances the mixed-radix timer counter.
    // The chain is units ÷10 → seconds-units ÷10 → seconds-tens ÷6 →
    // minutes ÷10, which is a single linear counter of 6000 states wrapping
    // back to 0 after 5999 (display 9:59.9 → 0:00.0).
    if (state.prevClk === 1 && clk === 0) {
      state.count = (state.count + 1) % 6000;
    }
    state.prevClk = clk;
  }

  // Output latch: transparent while LE HIGH (flow-through), holds while LE LOW.
  if (le === 1) state.latch = state.count;
  // Display Select: HIGH shows the live counter, LOW shows the latched value.
  const shown = ds === 1 ? state.count : state.latch;

  // Split into the four displayed digits. The seconds-tens digit (D3) is the
  // ÷6 stage, so it spans 0–5 and weighs 100; minutes (D4) weighs 600.
  const digitVal = [
    shown % 10,
    Math.floor(shown / 10) % 10,
    Math.floor(shown / 100) % 6,
    Math.floor(shown / 600) % 10,
  ];

  // Carry-out for cascading: HIGH once the minutes digit reaches 6 (count
  // 3600, display 6:00.0) and LOW otherwise, so the 5999→0 rollover presents a
  // HIGH→LOW edge. Tracks the live counter, not the display latch.
  const carry = state.count >= 3600 ? 1 : 0;

  // Time-multiplexed scan. The real part drives one digit at a time from an
  // internal ~1 kHz oscillator that has NO external pin, so there is nothing to
  // clock it from in the netlist. We stand in for that oscillator with the
  // simulator's own per-evaluate tick (simVersion, incremented once at the end
  // of each evaluate()): one digit position is driven per pass and the four
  // cycle in turn, exactly as a real multiplexed display does when stepped by
  // the time-domain loop. (Approximation: the scan only advances while the
  // circuit is being stepped — e.g. a CLOCK component drives CLK — not between
  // manual edits.)
  const pos = this.simVersion % 4;
  const digitSel = [0, 0, 0, 0];
  digitSel[pos] = 1;                                       // active digit = HIGH (sourcing)
  const segBits = BCD_7SEG_CC_TABLE[digitVal[pos]].slice(4, 11); // active-HIGH segments

  let changed = false;
  if (this._drivePinBits(comp, segN, segBits)) changed = true;
  if (this._drivePinBits(comp, digitN, digitSel)) changed = true;
  if (this._drivePinBit(comp, coN, carry)) changed = true;
  return changed;
}

chipEvaluators._evaluateCounterDisplay4Digit928 = _evaluateCounterDisplay4Digit928_fn;
chipEvaluators._evaluateCounterDisplay4Digit926 = _evaluateCounterDisplay4Digit926_fn;
chipEvaluators._evaluateCounterDisplay4Digit927 = _evaluateCounterDisplay4Digit927_fn;
chipEvaluators._evaluateDFFActHi              = _evaluateDFFActHi_fn;
chipEvaluators._evaluateShiftReg8BitPisoCd    = _evaluateShiftReg8BitPisoCd_fn;
chipEvaluators._evaluateShiftReg8BitPisoCd4021 = _evaluateShiftReg8BitPisoCd4021_fn;
chipEvaluators._evaluateShiftRegMuxLatch835    = _evaluateShiftRegMuxLatch835_fn;
chipEvaluators._evaluateShiftReg18Bit4006     = _evaluateShiftReg18Bit4006_fn;
chipEvaluators._evaluateShiftReg64Bit4031     = _evaluateShiftReg64Bit4031_fn;
chipEvaluators._evaluateShiftReg4BitSipo      = _evaluateShiftReg4BitSipo_fn;
chipEvaluators._evaluateBilateralSwitch       = _evaluateBilateralSwitch_fn;
chipEvaluators._evaluateAnalogMux8             = _evaluateAnalogMux8_fn;
chipEvaluators._evaluateAnalogMux16            = _evaluateAnalogMux16_fn;
chipEvaluators._evaluateAnalogMuxDual4         = _evaluateAnalogMuxDual4_fn;
chipEvaluators._evaluateAnalogMuxDual4_4852    = _evaluateAnalogMuxDual4_4852_fn;
chipEvaluators._evaluateAnalogMuxDual8         = _evaluateAnalogMuxDual8_fn;
chipEvaluators._evaluateAnalogMuxTriple2       = _evaluateAnalogMuxTriple2_fn;
chipEvaluators._evaluateAnalogMux8Latch        = _evaluateAnalogMux8Latch_fn;
chipEvaluators._evaluateAnalogMuxDual4Latch     = _evaluateAnalogMuxDual4Latch_fn;
chipEvaluators._evaluateAnalogMuxTriple2Latch   = _evaluateAnalogMuxTriple2Latch_fn;
chipEvaluators._evaluateCounterDecadeDecoded  = _evaluateCounterDecadeDecoded_fn;
chipEvaluators._evaluateCounterOctalDecoded   = _evaluateCounterOctalDecoded_fn;
chipEvaluators._evaluateCounterBinOsc14       = _evaluateCounterBinOsc14_fn;
chipEvaluators._evaluateCounterBinOsc14Clko   = _evaluateCounterBinOsc14Clko_fn;

function _evaluateKeyEncoderScan_fn(comp, gate) {
  // Matrix key-scan encoder — MM74C922 (16-key, 4 cols x 4 rows) and the
  // 5-row MM74C923 share this logic, differing only in row count / output bits.
  //
  // Source: Fairchild Semiconductor, "MM74C922 / MM74C923 16-Key Encoder /
  //   20-Key Encoder", DS006037 (Oct 1987, rev. Apr 2001).
  //   [Online]. Available:
  //   https://ece-classes.usc.edu/ee459/library/datasheets/MM74C922.pdf
  //   Verified: DIP terminal assignment (p.1), Truth Tables (p.2), Block
  //   Diagram (p.3) and Theory of Operation (p.8), read as 300-dpi PDF page
  //   images (issues.md C4 — the text summarizer hallucinates these pinouts).
  //
  // How the real part works (Theory of Operation, p.8): an on-chip Schmitt
  // oscillator clocks a 2-bit counter that drives a 2-to-4 decoder. The decoder
  // outputs (COLUMN X1..X4) are open-drain and pull one column LOW at a time,
  // 25% of the time each; the rest are off (high-impedance). ROW inputs Y1..Y4
  // have on-chip pull-ups, so with no key down every row reads HIGH and the
  // scan free-runs. When the key at (Yi, Xj) closes WHILE column Xj is the one
  // being scanned LOW, row Yi is pulled LOW; that "key detect" stops the
  // counter (freezing Xj LOW), locks out the other rows (2-key roll-over),
  // latches the code, and after the debounce period raises DATA AVAILABLE.
  //
  // Encoding (Truth Table, p.2): code = colIndex(X-1) | (rowIndex(Y-1) << 2),
  // i.e. A,B = the scanned column 0..3, C,D = the detected row 0..3 (E = bit 4
  // for the 5-row '923). A is the LSB.
  //
  // Engine modeling notes (digital approximations of analog behavior):
  //   * Columns are driven open-drain via _drivePinOC (scanned = sink LOW,
  //     others = Hi-Z), exactly as the datasheet describes. Rows are read with
  //     the on-chip pull-up modeled: a floating row net reads HIGH.
  //   * The RC debounce period (set by the C_KBM capacitor on the KEYBOUNCE
  //     MASK pin) and the RC oscillator (C_OSC) are not modeled — this is the
  //     datasheet's "synchronous scan" mode where OSC is driven directly as a
  //     clock and the cap is omitted. KBM is therefore not a logic input here.
  //   * Detection is combinational each pass (rows settle through the external
  //     matrix between passes); the counter only advances on an OSC rising edge
  //     when the current column shows no key, so a held key stops the scan.
  //
  // inputs:  [R1..Rn, OSC, OEn]   (n = 4 for '922, 5 for '923)
  // outputs: [C1, C2, C3, C4, DA, A, B, C, D(, E)]
  const nCols = 4;
  const nRows = gate.inputs.length - 2;
  const rowNames = gate.inputs.slice(0, nRows);
  const oscN = gate.inputs[nRows];
  const oeN  = gate.inputs[nRows + 1];
  const colNames  = gate.outputs.slice(0, nCols);
  const daN       = gate.outputs[nCols];
  const dataNames = gate.outputs.slice(nCols + 1);

  const state = this._getSeqState(comp, daN,
    { count: 0, prevOsc: 0, locked: false, lockRow: 0, code: 0, da: 0 });

  // Read each row with the on-chip pull-up modeled: a floating/undriven row
  // net (no key connecting it to the LOW scanned column) reads HIGH.
  const vth = this._specFor(comp).VTH;
  const rowLow = rowNames.map(name => {
    const v = this._readPinVoltage(comp, name);
    if (v === null) return false;      // floating → pull-up HIGH → not pressed
    return v <= vth;                   // pulled LOW by a closed key → pressed
  });

  const osc = this._readPinBit(comp, oscN);
  const rising = state.prevOsc === 0 && osc === 1;

  if (state.locked) {
    // Stay locked while the latched key is still held on its frozen column.
    if (rowLow[state.lockRow]) {
      state.da = 1;
    } else {
      state.locked = false;            // key released — DA drops, scan resumes
      state.da = 0;
    }
  } else {
    // Scanning. Look for a key on the column currently driven LOW (state.count).
    // Lowest-index row wins (priority / row lock-out).
    let pressed = -1;
    for (let r = 0; r < nRows; r++) { if (rowLow[r]) { pressed = r; break; } }
    if (pressed >= 0) {
      state.locked  = true;
      state.lockRow = pressed;
      state.code    = state.count | (pressed << 2);
      state.da      = 1;
    } else {
      state.da = 0;
      if (rising) state.count = (state.count + 1) % nCols; // advance only if clear
    }
  }
  state.prevOsc = osc;

  // Drive columns open-drain: the scanned (or locked) column sinks LOW, the
  // rest are high-impedance.
  let changed = false;
  for (let c = 0; c < nCols; c++) {
    if (this._drivePinOC(comp, colNames[c], c === state.count ? 0 : 1)) changed = true;
  }
  // DATA AVAILABLE is a normal push-pull output (not 3-stated).
  if (this._drivePinBit(comp, daN, state.da)) changed = true;
  // Data outputs are 3-state: enabled only when OUTPUT ENABLE (OEn) is LOW.
  if (this._readPinBit(comp, oeN) === 0) {
    const bits = dataNames.map((_, k) => (state.code >> k) & 1);
    if (this._drivePinBits(comp, dataNames, bits)) changed = true;
  } else {
    if (this._drivePinsHighZ(comp, dataNames)) changed = true;
  }
  return changed;
}
chipEvaluators._evaluateKeyEncoderScan        = _evaluateKeyEncoderScan_fn;

function _evaluateCounterBinRipple_fn(comp, gate) {
  // Generic N-stage binary ripple counter (CD4020 14-stage, CD4024 7-stage,
  // CD4040 12-stage, etc.). Counts on the FALLING edge of the clock; the
  // master-reset input is active HIGH and clears all stages asynchronously.
  //   inputs:  [CLK, MR]
  //   outputs: Qn pins named by stage number (Q1 = stage 1 = bit 0, Q14 = bit 13).
  // Only the stages that are physically brought out need be listed; the wrap
  // width is taken from the highest stage number present, so each part divides
  // by 2^N correctly (the CD4020 wraps at 2^14 even though Q2/Q3 are internal).
  //
  // Optional overrides for parts whose output pins aren't named "Qn":
  //   gate.bits   = [bitIndex,...] parallel to gate.outputs (explicit stage→bit)
  //   gate.maxBit = wrap width is 2^(maxBit+1)
  // Used by the CD4045B, whose single counter output is the 21st stage brought
  // out under the datasheet name "y+d" (no digits to parse), so it passes
  // bits:[20], maxBit:20 → divide-by-2^21. Default path is unchanged.
  const [clkN, mrN] = gate.inputs;
  const outNames = gate.outputs;
  const bitIndex = gate.bits
    ? gate.bits.slice()
    : outNames.map(n => {
        const stage = parseInt(String(n).replace(/[^0-9]/g, ''), 10) || 1;
        return stage - 1;
      });
  const maxBit = (gate.maxBit !== undefined)
    ? gate.maxBit
    : bitIndex.reduce((m, b) => Math.max(m, b), 0);
  const mask = (1 << (maxBit + 1)) - 1;        // wrap at 2^(highest stage)
  const state = this._getSeqState(comp, outNames[0], { count: 0, prevClk: 0 });

  const mr = this._readPinBit(comp, mrN);
  if (mr === 1) {
    state.count = 0;
    state.prevClk = this._readPinBit(comp, clkN);
  } else {
    const clk = this._readPinBit(comp, clkN);
    if (state.prevClk === 1 && clk === 0) {
      state.count = (state.count + 1) & mask;
    }
    state.prevClk = clk;
  }

  const cnt = state.count;
  return this._drivePinBits(comp, outNames, bitIndex.map(b => (cnt >> b) & 1));
}
chipEvaluators._evaluateCounterBinRipple      = _evaluateCounterBinRipple_fn;

function _evaluateCounterBcdDual4518_fn(comp, gate) {
  // CD4518 dual BCD up-counter (the CD4520 binary version can reuse this via
  // gate.mod = 16). Two identical, independent synchronous up-counter sections.
  // Each section has a D-type CLOCK and ENABLE input that let it advance on
  // EITHER edge, per the datasheet truth table (TI SCHS076D):
  //   - the rising (L->H) edge of CLOCK while ENABLE is HIGH, or
  //   - the falling (H->L) edge of ENABLE while CLOCK is LOW.
  // All other CLOCK/ENABLE transitions hold the count. RESET is active HIGH and
  // asynchronously clears that section to zero. Carry within a section is
  // synchronous, so the four stages present a clean BCD (mod-10) count.
  //   inputs:  [CLOCK_A, ENABLE_A, RESET_A,  CLOCK_B, ENABLE_B, RESET_B]
  //   outputs: [Q1A,Q2A,Q3A,Q4A,  Q1B,Q2B,Q3B,Q4B]   (Q1 = LSB / weight 1)
  // gate.mod selects the modulus (10 = BCD/CD4518, 16 = binary/CD4520); default 10.
  const mod = gate.mod || 10;
  const state = this._getSeqState(comp, gate.outputs[0],
    { cnt: [0, 0], prevClk: [0, 0], prevEn: [0, 0] });
  let changed = false;
  for (let s = 0; s < 2; s++) {
    const clk   = this._readPinBit(comp, gate.inputs[s * 3]);
    const en    = this._readPinBit(comp, gate.inputs[s * 3 + 1]);
    const reset = this._readPinBit(comp, gate.inputs[s * 3 + 2]);
    if (reset === 1) {
      state.cnt[s] = 0;
    } else {
      const clockEdge  = (state.prevClk[s] === 0 && clk === 1 && en === 1);
      const enableEdge = (state.prevEn[s]  === 1 && en  === 0 && clk === 0);
      if (clockEdge || enableEdge) {
        state.cnt[s] = (state.cnt[s] + 1) % mod;
      }
    }
    state.prevClk[s] = clk;
    state.prevEn[s]  = en;
    const cnt = state.cnt[s];
    const base = s * 4;
    if (this._drivePinBit(comp, gate.outputs[base],     (cnt >> 0) & 1)) changed = true;
    if (this._drivePinBit(comp, gate.outputs[base + 1], (cnt >> 1) & 1)) changed = true;
    if (this._drivePinBit(comp, gate.outputs[base + 2], (cnt >> 2) & 1)) changed = true;
    if (this._drivePinBit(comp, gate.outputs[base + 3], (cnt >> 3) & 1)) changed = true;
  }
  return changed;
}
chipEvaluators._evaluateCounterBcdDual4518    = _evaluateCounterBcdDual4518_fn;

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
  // Presettable synchronous 8 bit binary down counter (CD40103B / CD74HC40103).
  //
  // Legacy 12-input contract (pre-existing 74x4103 / 74x40103 entries):
  //   inputs:  [CLK, PEn, P0, P1, P2, P3, P4, P5, P6, P7, CEn, SPE]
  //   PEn=0 AND rising CLK → synchronous load; CEn=0 AND SPE=0 → count enabled;
  //   TC active LOW, LOW when count=0. Behaviour preserved exactly below.
  //
  // Extended 14-input contract (the verified CD40103B, js/chips/chips130.js):
  //   inputs:  [..legacy 12.., APE, CLR]  (both active LOW, async)
  //   Adds the two async controls the real silicon has and the legacy entries
  //   lacked, plus the CI/CE-gated terminal count. Per the TI CD40102B/CD40103B
  //   TRUTH TABLE (SCHS104B, Fig. 13), priority high→low:
  //     CLR=0 → async clear to MAXIMUM count (255); APE=0 → async preset (load
  //     JAM); SPE(=PEn)=0 → synchronous preset on the next rising CLK; else
  //     CI/CE(=CEn)=0 → count down on rising CLK (0→255 wrap); else hold.
  //   CO/ZD (TC) is LOW only when count=0 AND CI/CE=0 (so cascades chain on the
  //   carry). The extra inputs are read defensively, so any def passing only the
  //   12 legacy inputs keeps its original behaviour bit-for-bit.
  const ins = gate.inputs;
  const [clkN, penN, p0N, p1N, p2N, p3N, p4N, p5N, p6N, p7N, cenN, speN] = ins;
  const apeN = ins[12];                 // optional async preset enable (active LOW)
  const clrN = ins[13];                 // optional master clear-to-max (active LOW)
  const fullModel = apeN !== undefined || clrN !== undefined;
  const [tcName] = gate.outputs;
  const state = this._getSeqState(comp, tcName + '_bin8dn', { count: 0, prevClk: 0 });

  const clk = this._readPinBit(comp, clkN);
  const pen = this._readPinBit(comp, penN);
  const cen = this._readPinBit(comp, cenN);
  const spe = this._readPinBit(comp, speN);
  const ape = apeN !== undefined ? this._readPinBit(comp, apeN) : 1;
  const clr = clrN !== undefined ? this._readPinBit(comp, clrN) : 1;
  const jam = () =>
        this._readPinBit(comp, p0N)        | (this._readPinBit(comp, p1N) << 1)
      | (this._readPinBit(comp, p2N) << 2)  | (this._readPinBit(comp, p3N) << 3)
      | (this._readPinBit(comp, p4N) << 4)  | (this._readPinBit(comp, p5N) << 5)
      | (this._readPinBit(comp, p6N) << 6)  | (this._readPinBit(comp, p7N) << 7);

  if (fullModel) {
    // Asynchronous controls are level-sensitive: applied every solve, CLR wins.
    if (clr === 0) {
      state.count = 255;
    } else if (ape === 0) {
      state.count = jam();
    } else if (state.prevClk === 0 && clk === 1) {
      if (pen === 0) state.count = jam();                                        // sync preset
      else if (cen === 0) state.count = state.count === 0 ? 255 : state.count - 1; // count down
      // else: inhibit (hold)
    }
  } else if (state.prevClk === 0 && clk === 1) {
    if (pen === 0) {
      state.count = jam();
    } else if (cen === 0 && spe === 0) {
      state.count = state.count === 0 ? 255 : state.count - 1;
    }
  }
  state.prevClk = clk;

  // Active LOW: LOW when count=0. Real CO/ZD is gated by CI/CE (full model only);
  // the legacy entries kept the simpler ungated zero-detect.
  const tc = fullModel ? (state.count === 0 && cen === 0 ? 0 : 1)
                       : (state.count === 0 ? 0 : 1);
  return this._drivePinBit(comp, tcName, tc);
}

chipEvaluators._evaluateBcdDown2Dec = _evaluateBcdDown2Dec_fn;
chipEvaluators._evaluateBinDown8Bit = _evaluateBinDown8Bit_fn;

// ── Block 129 CD40102B 2-decade BCD presettable synchronous down counter ──
// Faithful model of the real CD40102B, which differs from the older
// `BCD_DOWN_2DEC` primitive (that one invented a 2nd TC/TCdec output and lacked
// the asynchronous preset and the clear-to-max-count). Behaviour and the
// control-input precedence below are taken directly from the datasheet:
//   Source: Texas Instruments (Harris), "CD40102B, CD40103B Types - CMOS 8-Stage
//     Presettable Synchronous Down Counters", SCHS095B (revised July 2003).
//     [Online]. Available: https://www.ti.com/lit/ds/symlink/cd40102b.pdf.
//     Verified: page-1 functional description, the page-5 TRUTH TABLE, and the
//     page-6 (3-381) Fig.15 timing diagram, read as 300-dpi PDF page images
//     (issues.md C4).
function _evaluateBcdDown2DecCd40102_fn(comp, gate) {
  // inputs:  [CLK, CLR, CICE, APE, SPE, J0, J1, J2, J3, J4, J5, J6, J7]
  //   CLR  (pin 2)  active LOW: async clear to MAX count (99) - dominates all.
  //   CICE (pin 3)  CARRY-IN/COUNTER ENABLE, active LOW: LOW enables counting.
  //   APE  (pin 9)  ASYNC PRESET ENABLE, active LOW: async jam-load of J0..J7.
  //   SPE  (pin 15) SYNC PRESET ENABLE, active LOW: jam-load on next rising CLK.
  //   J0..J3 = LSD (units BCD, J3 MSB); J4..J7 = MSD (tens BCD, J7 MSB) [note 4].
  // outputs: [COZD]
  //   CO/ZD (pin 14) active LOW: LOW when count == 0 AND CICE is LOW; the count
  //   sits at zero for exactly one clock period (it jumps to max on the next
  //   rising edge), so CO/ZD is naturally a one-clock-wide LOW pulse.
  // Truth-table precedence (CLR > APE > SPE > count): page-5 TRUTH TABLE.
  const [clkN, clrN, ciceN, apeN, speN,
         j0N, j1N, j2N, j3N, j4N, j5N, j6N, j7N] = gate.inputs;
  const [cozdName] = gate.outputs;
  const state = this._getSeqState(comp, cozdName + '_bcd2dec40102',
    { units: 9, tens: 9, prevClk: 0 });

  const clk  = this._readPinBit(comp, clkN);
  const clr  = this._readPinBit(comp, clrN);
  const cice = this._readPinBit(comp, ciceN);
  const ape  = this._readPinBit(comp, apeN);
  const spe  = this._readPinBit(comp, speN);

  const readJamUnits = () =>
      this._readPinBit(comp, j0N)        | (this._readPinBit(comp, j1N) << 1)
    | (this._readPinBit(comp, j2N) << 2) | (this._readPinBit(comp, j3N) << 3);
  const readJamTens = () =>
      this._readPinBit(comp, j4N)        | (this._readPinBit(comp, j5N) << 1)
    | (this._readPinBit(comp, j6N) << 2) | (this._readPinBit(comp, j7N) << 3);
  const clampBcd = (v) => (v > 9 ? 9 : v); // invalid BCD jam codes 10-15 -> 9

  const rising = (state.prevClk === 0 && clk === 1);

  if (clr === 0) {
    // CLR LOW (active): async clear to maximum count (99). Dominates everything.
    state.units = 9;
    state.tens  = 9;
  } else if (ape === 0) {
    // APE LOW (active): async jam-load, regardless of SPE/CICE/CLOCK.
    state.units = clampBcd(readJamUnits());
    state.tens  = clampBcd(readJamTens());
  } else if (rising) {
    if (spe === 0) {
      // SPE LOW: synchronous jam-load on the rising edge (regardless of CICE).
      state.units = clampBcd(readJamUnits());
      state.tens  = clampBcd(readJamTens());
    } else if (cice === 0) {
      // Count enabled: decrement one BCD count. At 00 the counter jumps to the
      // maximum count (99) on this edge - the documented count-to-max wrap.
      if (state.units === 0) {
        state.units = 9;
        state.tens  = (state.tens === 0) ? 9 : state.tens - 1;
      } else {
        state.units -= 1;
      }
    }
  }
  state.prevClk = clk;

  // CO/ZD active LOW: LOW only when the full count is zero AND CICE is LOW.
  const cozd = (state.units === 0 && state.tens === 0 && cice === 0) ? 0 : 1;
  return this._drivePinBit(comp, cozdName, cozd);
}
chipEvaluators._evaluateBcdDown2DecCd40102 = _evaluateBcdDown2DecCd40102_fn;


// ── Block 65 74x40105 FIFO evaluator ────────────────────────────────────

function _evaluateFifo16x4RstTri_fn(comp, gate) {
  // CD74HC40105: 16 word × 4 bit asynchronous FIFO with tri state outputs and reset.
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

// ── Cascaded comparators, parity, ECC ─────────────────────────────────────
// Implementations promoted from generic stubs once js/Simplifications.md §5
// declared the underlying truth tables in-scope for the simulator.

function _evaluateComparator8BitCascade_fn(comp, gate) {
  // 74x885: 8 bit magnitude comparator with cascade inputs.
  // inputs:  [A0,B0, A1,B1, A2,B2, A3,B3, A4,B4, A5,B5, A6,B6, A7,B7, ALTBI, AEQBI]
  // outputs: [AGEB, ALTB, AEQB, AGTB]
  // Truth table at A=B: cascade inputs decide; conflicting cascade is treated
  // per the SN74AS885 datasheet ('00' defaults to A>B, '11' is invalid).
  const bits = this._readGateInputs(comp, gate.inputs);
  let a = 0, b = 0;
  for (let i = 0; i < 8; i++) {
    a |= bits[2 * i]     << i;
    b |= bits[2 * i + 1] << i;
  }
  const altbi = bits[16];
  const aeqbi = bits[17];
  let ageb, altb, aeqb, agtb;
  if (a > b)      { ageb = 1; altb = 0; aeqb = 0; agtb = 1; }
  else if (a < b) { ageb = 0; altb = 1; aeqb = 0; agtb = 0; }
  else {
    // A == B: defer to cascade. AEQBI alone → equal; ALTBI alone → less than;
    // both LOW → default greater than; both HIGH → invalid (all LOW).
    if (aeqbi && !altbi)      { ageb = 1; altb = 0; aeqb = 1; agtb = 0; }
    else if (altbi && !aeqbi) { ageb = 0; altb = 1; aeqb = 0; agtb = 0; }
    else if (!altbi && !aeqbi){ ageb = 1; altb = 0; aeqb = 0; agtb = 1; }
    else                      { ageb = 0; altb = 0; aeqb = 0; agtb = 0; }
  }
  return this._drivePinBits(comp, gate.outputs, [ageb, altb, aeqb, agtb]);
}

function _evaluateComparator8BitLatch_fn(comp, gate) {
  // 74x866: 8 bit magnitude comparator with latched outputs.
  // inputs:  [A0,B0, A1,B1, ... A7,B7, LE]
  // outputs: [AGEB, ALTB, AGTB, AEQB]
  // LE=HIGH → transparent (outputs follow comparison).
  // LE=LOW  → latched (hold previous result).
  const state = this._getSeqState(comp, gate.outputs[0], { ageb: 0, altb: 0, agtb: 0, aeqb: 0 });
  const bits = this._readGateInputs(comp, gate.inputs);
  let a = 0, b = 0;
  for (let i = 0; i < 8; i++) {
    a |= bits[2 * i]     << i;
    b |= bits[2 * i + 1] << i;
  }
  const le = bits[16];
  if (le) {
    if (a > b)      { state.ageb = 1; state.altb = 0; state.agtb = 1; state.aeqb = 0; }
    else if (a < b) { state.ageb = 0; state.altb = 1; state.agtb = 0; state.aeqb = 0; }
    else            { state.ageb = 1; state.altb = 0; state.agtb = 0; state.aeqb = 1; }
  }
  return this._drivePinBits(comp, gate.outputs, [state.ageb, state.altb, state.agtb, state.aeqb]);
}

function _parityBufferDrive(self, comp, gate, invert) {
  // 74x655/74x656: Octal buffer with parity generator (24-pin).
  // inputs:  [OEn, PEOEn, A0..A7, PEIn]
  // outputs: [YA0, YA1, YB0..YB7, PE]
  // YA0/YA1 are second copies of A0/A1 (datasheet feature).
  // PE = XOR of A0..A7 and PEIn (parity tree); PEIn lets users cascade.
  const bits  = self._readGateInputs(comp, gate.inputs);
  const oen   = bits[0];
  const peoen = bits[1];
  const a     = bits.slice(2, 10);
  const pein  = bits[10];
  let changed = false;

  for (let i = 0; i < 10; i++) {
    const outName = gate.outputs[i];
    if (oen !== 0) {
      if (self._drivePinHighZ(comp, outName)) changed = true;
    } else {
      let srcBit;
      if (i === 0)      srcBit = a[0]; // YA0
      else if (i === 1) srcBit = a[1]; // YA1
      else              srcBit = a[i - 2]; // YB0..YB7 ← A0..A7
      const outBit = invert ? (srcBit ? 0 : 1) : srcBit;
      if (self._drivePinBit(comp, outName, outBit)) changed = true;
    }
  }

  const peOut = gate.outputs[10];
  if (peoen !== 0) {
    if (self._drivePinHighZ(comp, peOut)) changed = true;
  } else {
    const parity = a.reduce((acc, bit) => acc ^ bit, 0) ^ pein;
    if (self._drivePinBit(comp, peOut, parity)) changed = true;
  }
  return changed;
}

function _evaluateParityBuffer_fn(comp, gate)    { return _parityBufferDrive(this, comp, gate, false); }
function _evaluateParityBufferInv_fn(comp, gate) { return _parityBufferDrive(this, comp, gate, true);  }

function _evaluateParityXcvr_fn(comp, gate) {
  // 74x657: Parity tree wrapped around the transceiver.
  // inputs:  [OEBAn, PEn, DIR, A0..A7, B0..B7]
  // outputs: [PE]
  // PEn=HIGH → PE = LOW (parity check disabled).
  // PEn=LOW  → PE = even parity of the active 8 bit bus (A side when DIR=1, B side when DIR=0).
  const bits  = this._readGateInputs(comp, gate.inputs);
  const pen   = bits[1];
  const dir   = bits[2];
  if (pen !== 0) {
    return this._drivePinBit(comp, gate.outputs[0], 0);
  }
  const start = dir === 1 ? 3 : 11; // A side starts at index 3, B side at index 11
  let parity = 0;
  for (let i = 0; i < 8; i++) parity ^= bits[start + i];
  return this._drivePinBit(comp, gate.outputs[0], parity);
}

function _evaluateAddrCompCascade_fn(comp, gate) {
  // 74x677: 8 bit address comparator with three cascade enables.
  // inputs:  [A0..A7, B0..B7, EGn, ELn, EQn]   outputs: [GEn, EQout]
  // EQout (active HIGH) = 1 when A == B and EQn = LOW.
  // GEn  (active LOW)   = 0 when (A > B AND EGn=LOW) OR (A == B AND ELn=LOW with EGn=LOW).
  //                     Disabled enables raise the corresponding output to its inactive state.
  const bits = this._readGateInputs(comp, gate.inputs);
  let a = 0, b = 0;
  for (let i = 0; i < 8; i++) {
    a |= bits[i]     << i;
    b |= bits[8 + i] << i;
  }
  const egn = bits[16];
  const eln = bits[17];
  const eqn = bits[18];

  const eqout = (a === b && eqn === 0) ? 1 : 0;
  let gen = 1;
  if (egn === 0 && a >  b) gen = 0;
  if (egn === 0 && a === b && eln === 0) gen = 0;
  return this._drivePinBits(comp, gate.outputs, [gen, eqout]);
}

function _evaluateAddrCompLatch_fn(comp, gate) {
  // 74x678 (16 bit) / 74x679 (12 bit): address comparator with internal latched reference.
  // inputs:  [A0..An, LE, OEn]  outputs: [GEn, EQout]
  // LE=HIGH stores the current A word as the internal reference.
  // OEn=HIGH drives both outputs HiZ.
  // Otherwise EQout=HIGH when A==ref, GEn=LOW when A>=ref.
  const numAddr = gate.inputs.length - 2;
  const state = this._getSeqState(comp, gate.outputs[0], { ref: 0 });
  const bits = this._readGateInputs(comp, gate.inputs);
  let a = 0;
  for (let i = 0; i < numAddr; i++) a |= bits[i] << i;
  const le  = bits[numAddr];
  const oen = bits[numAddr + 1];
  if (le) state.ref = a;
  if (oen !== 0) {
    let changed = false;
    for (const op of gate.outputs) if (this._drivePinHighZ(comp, op)) changed = true;
    return changed;
  }
  const eqout = a === state.ref ? 1 : 0;
  const gen   = a >= state.ref ? 0 : 1;
  return this._drivePinBits(comp, gate.outputs, [gen, eqout]);
}

function _evaluateAddrCompFixed_fn(comp, gate) {
  // 74x680: 12 bit address comparator with mask programmable fixed reference.
  // inputs:  [A0..A11, G]  outputs: [GEn, EQout]
  // Real silicon ships with a factory-set reference; the simulator uses zero
  // as the fixed reference, so EQout asserts when the address is all-LOW.
  const bits = this._readGateInputs(comp, gate.inputs);
  let a = 0;
  for (let i = 0; i < 12; i++) a |= bits[i] << i;
  const g = bits[12];
  if (g !== 0) {
    return this._drivePinBits(comp, gate.outputs, [1, 0]);
  }
  const eqout = a === 0 ? 1 : 0;
  const gen   = 0; // A >= 0 is always true for unsigned A
  return this._drivePinBits(comp, gate.outputs, [gen, eqout]);
}

// SEC-DED parity-check matrix used by 74x636/74x637.
// 8 columns for data bits D0-D7 plus 7 columns for check bits CB0-CB6.
// Every data column carries an odd-weight, unique 7-bit signature so single
// bit errors produce a syndrome that maps back to exactly one position.
const ECC_SECDED_DATA_COLS = [
  0b0000111, 0b0001011, 0b0001101, 0b0001110,
  0b0010011, 0b0010101, 0b0010110, 0b0011001,
];
const ECC_SECDED_CHECK_COLS = [
  0b0000001, 0b0000010, 0b0000100, 0b0001000,
  0b0010000, 0b0100000, 0b1000000,
];

function _eccComputeCheckBits(dataBits) {
  // Each check bit i = XOR of D[j] across all data columns whose i-th bit is set.
  const cb = [0, 0, 0, 0, 0, 0, 0];
  for (let j = 0; j < 8; j++) {
    if (!dataBits[j]) continue;
    const col = ECC_SECDED_DATA_COLS[j];
    for (let i = 0; i < 7; i++) {
      if ((col >> i) & 1) cb[i] ^= 1;
    }
  }
  return cb;
}

function _evaluateEccSecded_fn(comp, gate) {
  // 74x636 / 74x637: 8 bit SECDED error detection and correction.
  // inputs:  [OEn, SEn, D0..D7, CB0..CB6]
  // outputs: [D0..D7, CB0..CB6, fE]
  // OEn=HIGH → every output HiZ.
  // SEn=LOW  (write/generate): chip drives CB outputs from D inputs, leaves D
  //          HiZ so the user supplies the data; fE=0.
  // SEn=HIGH (read/check): both D and CB are driven externally. Chip computes
  //          syndrome and asserts fE=HIGH on a non-correctable (even-weight)
  //          syndrome — i.e. when at least two bit errors are present.
  const bits = this._readGateInputs(comp, gate.inputs);
  const oen = bits[0];
  const sen = bits[1];
  const d   = bits.slice(2, 10);
  const cbIn = bits.slice(10, 17);
  const isOC = comp.chipDef && comp.chipDef.openCollector;
  let changed = false;

  if (oen !== 0) {
    for (const op of gate.outputs) {
      if (this._drivePinHighZ(comp, op)) changed = true;
    }
    return changed;
  }

  const computedCb = _eccComputeCheckBits(d);

  // D pins: always HiZ from the chip (data is externally sourced in both modes).
  for (let i = 0; i < 8; i++) {
    if (this._drivePinHighZ(comp, gate.outputs[i])) changed = true;
  }

  if (sen === 0) {
    // Write/generate mode: drive CB outputs with the computed check bits.
    for (let i = 0; i < 7; i++) {
      const outName = gate.outputs[8 + i];
      if (isOC) {
        if (this._drivePinOC(comp, outName, computedCb[i])) changed = true;
      } else {
        if (this._drivePinBit(comp, outName, computedCb[i])) changed = true;
      }
    }
    const feOut = gate.outputs[15];
    if (isOC) {
      if (this._drivePinOC(comp, feOut, 0)) changed = true;
    } else {
      if (this._drivePinBit(comp, feOut, 0)) changed = true;
    }
    return changed;
  }

  // Read/check mode: CB pins are externally sourced too, so keep HiZ from chip.
  for (let i = 0; i < 7; i++) {
    if (this._drivePinHighZ(comp, gate.outputs[8 + i])) changed = true;
  }

  // Compute the 7-bit syndrome.
  let syndrome = 0;
  for (let i = 0; i < 7; i++) {
    if ((cbIn[i] ^ computedCb[i]) === 1) syndrome |= (1 << i);
  }

  let fe = 0;
  if (syndrome !== 0) {
    // Odd-weight syndrome = single-bit (or 3-bit) error: matches a column, treat as correctable.
    // Even-weight non-zero syndrome = double-bit error: uncorrectable.
    let weight = 0;
    for (let i = 0; i < 7; i++) if ((syndrome >> i) & 1) weight++;
    if ((weight & 1) === 0) fe = 1;
    else {
      // Confirm the syndrome corresponds to a known column; if not, flag too.
      let matched = false;
      for (const col of ECC_SECDED_DATA_COLS)  if (col === syndrome) { matched = true; break; }
      if (!matched) {
        for (const col of ECC_SECDED_CHECK_COLS) if (col === syndrome) { matched = true; break; }
      }
      if (!matched) fe = 1;
    }
  }

  const feOut = gate.outputs[15];
  if (isOC) {
    if (this._drivePinOC(comp, feOut, fe)) changed = true;
  } else {
    if (this._drivePinBit(comp, feOut, fe)) changed = true;
  }
  return changed;
}

chipEvaluators._evaluateComparator8BitCascade = _evaluateComparator8BitCascade_fn;
chipEvaluators._evaluateComparator8BitLatch   = _evaluateComparator8BitLatch_fn;
chipEvaluators._evaluateParityBuffer          = _evaluateParityBuffer_fn;
chipEvaluators._evaluateParityBufferInv       = _evaluateParityBufferInv_fn;
chipEvaluators._evaluateParityXcvr            = _evaluateParityXcvr_fn;
chipEvaluators._evaluateAddrCompCascade       = _evaluateAddrCompCascade_fn;
chipEvaluators._evaluateAddrCompLatch         = _evaluateAddrCompLatch_fn;
chipEvaluators._evaluateAddrCompFixed         = _evaluateAddrCompFixed_fn;
chipEvaluators._evaluateEccSecded             = _evaluateEccSecded_fn;

function _xcvrParityDrive(self, comp, gate, invert) {
  // 74x658/659/664/665: A→B transceiver with parity output.
  // inputs:  [OEABn, OEBAn, DIR, PEn, A0..A7]
  // outputs: [B0..B7, PAR]
  // The gate definition only exposes the A→B path. B drives are valid when
  // OEABn=LOW and DIR=HIGH; otherwise the B side floats. PAR = even parity
  // over A0-A7 when PEn=LOW, else LOW.
  const bits   = self._readGateInputs(comp, gate.inputs);
  const oeabn  = bits[0];
  const dir    = bits[2];
  const pen    = bits[3];
  const a      = bits.slice(4, 12);
  const driveB = oeabn === 0 && dir === 1;
  let changed = false;

  for (let i = 0; i < 8; i++) {
    const outName = gate.outputs[i];
    if (driveB) {
      const outBit = invert ? (a[i] ? 0 : 1) : a[i];
      if (self._drivePinBit(comp, outName, outBit)) changed = true;
    } else {
      if (self._drivePinHighZ(comp, outName)) changed = true;
    }
  }

  const parOut = gate.outputs[8];
  if (pen !== 0) {
    if (self._drivePinBit(comp, parOut, 0)) changed = true;
  } else {
    const parity = a.reduce((acc, bit) => acc ^ bit, 0);
    if (self._drivePinBit(comp, parOut, parity)) changed = true;
  }
  return changed;
}

function _evaluateXcvrParity_fn(comp, gate)    { return _xcvrParityDrive(this, comp, gate, false); }
function _evaluateXcvrParityInv_fn(comp, gate) { return _xcvrParityDrive(this, comp, gate, true);  }

chipEvaluators._evaluateXcvrParity    = _evaluateXcvrParity_fn;
chipEvaluators._evaluateXcvrParityInv = _evaluateXcvrParityInv_fn;

function _evaluateXcvrParityReg833_fn(comp, gate) {
  // 74x833: 8-bit-to-9-bit parity bus transceiver with a *stored* error flag.
  // Distinct from the 655/657/658 parity primitives above: this part is
  // bidirectional, carries the 9th (parity) bit on its own I/O pin, and latches
  // a sticky parity-error flag into an on-chip register (CLK/CLRn).
  // Source: TI SCBS195C FUNCTION TABLE + ERROR-FLAG FUNCTION TABLE + logic
  //   diagram (see the 74x833 header comment in js/chips/chips41.js).
  //
  // inputs:  [OEAn, OEBn, CLRn, CLK, A1..A8, B1..B8, PARITY]
  //          indices 0,   1,    2,   3,  4-11,   12-19,  20
  // outputs: [A1..A8, B1..B8, PARITY, ERRn]
  //          indices 0-7,   8-15,   16,     17
  // A1-A8, B1-B8 and PARITY are bidirectional (listed in inputs AND outputs).
  //
  // Odd parity: a valid 9-bit word (8 data bits + PARITY) has an odd count of 1s.
  // Modes, with OEA/OEB active LOW (FUNCTION TABLE):
  //   OEB=L, OEA=H : A->B, PARITY = generated odd-parity of the A byte.
  //   OEB=L, OEA=L : A->B, PARITY = the inverted parity bit (a forced-error
  //                  diagnostic — the far end will see a bad word).
  //   OEB=H, OEA=L : B->A, PARITY is an INPUT; the 9-bit B-side word is checked.
  //   OEB=H, OEA=H : isolation, A/B/PARITY all Hi-Z.
  // ERR (pin 10) is an open-collector, active-LOW, sticky flag. Per the
  // ERROR-FLAG FUNCTION TABLE, on a CLK rising edge ERRnext = pOk AND ERRprev
  // (pOk=1 means the sampled word had valid odd parity): once a bad word is
  // caught the flag latches LOW and holds until CLRn is pulsed LOW.
  //
  // Simplification: the datasheet marks ERR "NA" while transmitting (OEB=L), so
  // the register is only sampled in the two OEB=H (receive / isolation) modes;
  // transmit modes hold the stored flag. Documented in issues.md.
  const oea = this._readPinBit(comp, gate.inputs[0]);
  const oeb = this._readPinBit(comp, gate.inputs[1]);
  const clr = this._readPinBit(comp, gate.inputs[2]);
  const clk = this._readPinBit(comp, gate.inputs[3]);
  let changed = false;

  const errName = gate.outputs[17];
  const state = this._getSeqState(comp, errName, { err: 1, prevClk: 0 });

  let pOk = 1;         // 1 = sampled word had valid odd parity (no error)
  let sample = false;  // whether this CLK edge updates the error register

  if (oeb === 0) {
    // Transmit A -> B and generate parity. A side Hi-Z; PARITY driven.
    const a = [];
    for (let i = 0; i < 8; i++) a.push(this._readPinBit(comp, gate.inputs[4 + i]));
    for (let i = 0; i < 8; i++) if (this._drivePinHighZ(comp, gate.outputs[i])) changed = true;
    for (let i = 0; i < 8; i++) if (this._drivePinBit(comp, gate.outputs[8 + i], a[i])) changed = true;
    const aOnesOdd = a.reduce((x, b) => x ^ b, 0);   // 1 if A holds an odd count of 1s
    const genParity = aOnesOdd ? 0 : 1;              // odd-parity generator bit
    const inverted = (oea === 0);
    const parOut = inverted ? (genParity ? 0 : 1) : genParity;
    if (this._drivePinBit(comp, gate.outputs[16], parOut)) changed = true;
  } else if (oea === 0) {
    // Receive B -> A and check parity. B and PARITY are inputs; A driven.
    const b = [];
    for (let i = 0; i < 8; i++) b.push(this._readPinBit(comp, gate.inputs[12 + i]));
    const par = this._readPinBit(comp, gate.inputs[20]);
    for (let i = 0; i < 8; i++) if (this._drivePinBit(comp, gate.outputs[i], b[i])) changed = true;
    for (let i = 0; i < 8; i++) if (this._drivePinHighZ(comp, gate.outputs[8 + i])) changed = true;
    if (this._drivePinHighZ(comp, gate.outputs[16])) changed = true;
    pOk = b.reduce((x, bit) => x ^ bit, 0) ^ par;    // odd 9-bit word => valid => pOk=1
    sample = true;
  } else {
    // Isolation: A / B / PARITY all Hi-Z. Per the datasheet note, a clocked ERR
    // then reflects the A-bus parity (A odd => no error).
    for (let i = 0; i < 8; i++) if (this._drivePinHighZ(comp, gate.outputs[i])) changed = true;
    for (let i = 0; i < 8; i++) if (this._drivePinHighZ(comp, gate.outputs[8 + i])) changed = true;
    if (this._drivePinHighZ(comp, gate.outputs[16])) changed = true;
    let aOnesOdd = 0;
    for (let i = 0; i < 8; i++) aOnesOdd ^= this._readPinBit(comp, gate.inputs[4 + i]);
    pOk = aOnesOdd;
    sample = true;
  }

  // Sticky error register: async CLRn LOW forces ERR HIGH (no error); otherwise
  // sample on the CLK rising edge with ERRnext = pOk AND ERRprev.
  if (clr === 0) {
    state.err = 1;
  } else if (sample && clk === 1 && state.prevClk === 0) {
    state.err = (pOk && state.err) ? 1 : 0;
  }
  state.prevClk = clk;

  // ERR is open-collector active-LOW: err=1 releases (Hi-Z, pulled up => HIGH),
  // err=0 sinks the pin LOW.
  if (this._drivePinOC(comp, errName, state.err)) changed = true;
  return changed;
}

chipEvaluators._evaluateXcvrParityReg833 = _evaluateXcvrParityReg833_fn;

function _evaluateXcvrParityReg834_fn(comp, gate) {
  // 74x834: the INVERTING sibling of the 74x833 8-bit-to-9-bit parity bus
  // transceiver. Same architecture as _evaluateXcvrParityReg833_fn — bidirectional
  // byte buses, the 9th (parity) bit on its own I/O pin, and a sticky parity-error
  // flag latched into an on-chip register (CP/CLRn). The ONE difference: the data
  // buses are inverted end to end — B = NOT A on transmit, A = NOT B on receive.
  // The parity generator and the error check are identical to the 833, because
  // inverting all eight data bits leaves the count of 1s the same parity (8 is
  // even), so the transmitted 9-bit word is still valid odd parity.
  // Source: Signetics/Philips SN74ABT834 FUNCTION TABLE + ERROR-FLAG FUNCTION TABLE
  //   + pin configuration (see the 74x834 header comment in js/chips/chips41.js).
  //   Data columns read B = A̅ (transmit) and A = B̅ (receive); PARITY and ERROR
  //   columns match the 833 exactly.
  //
  // inputs:  [OEAn, OEBn, CLRn, CP, A0..A7, B0..B7, PARITY]
  //          indices 0,   1,    2,   3, 4-11,  12-19,  20
  // outputs: [A0..A7, B0..B7, PARITY, ERRn]
  //          indices 0-7,   8-15,   16,     17
  // Modes, OEA/OEB active LOW:
  //   OEB=L, OEA=H : A->B, B = A̅, PARITY = generated odd-parity of the A byte.
  //   OEB=L, OEA=L : A->B, B = A̅, PARITY = inverted parity (forced-error diagnostic).
  //   OEB=H, OEA=L : B->A, A = B̅, PARITY is an INPUT; the 9-bit B word is checked.
  //   OEB=H, OEA=H : isolation, A/B/PARITY all Hi-Z.
  const oea = this._readPinBit(comp, gate.inputs[0]);
  const oeb = this._readPinBit(comp, gate.inputs[1]);
  const clr = this._readPinBit(comp, gate.inputs[2]);
  const clk = this._readPinBit(comp, gate.inputs[3]);
  let changed = false;

  const errName = gate.outputs[17];
  const state = this._getSeqState(comp, errName, { err: 1, prevClk: 0 });

  let pOk = 1;         // 1 = sampled word had valid odd parity (no error)
  let sample = false;  // whether this CLK edge updates the error register

  if (oeb === 0) {
    // Transmit A -> B (inverted) and generate parity. A side Hi-Z; PARITY driven.
    const a = [];
    for (let i = 0; i < 8; i++) a.push(this._readPinBit(comp, gate.inputs[4 + i]));
    for (let i = 0; i < 8; i++) if (this._drivePinHighZ(comp, gate.outputs[i])) changed = true;
    for (let i = 0; i < 8; i++) if (this._drivePinBit(comp, gate.outputs[8 + i], a[i] ? 0 : 1)) changed = true;
    const aOnesOdd = a.reduce((x, b) => x ^ b, 0);   // 1 if A holds an odd count of 1s
    const genParity = aOnesOdd ? 0 : 1;              // odd-parity generator bit
    const inverted = (oea === 0);                    // both OE low => forced-error
    const parOut = inverted ? (genParity ? 0 : 1) : genParity;
    if (this._drivePinBit(comp, gate.outputs[16], parOut)) changed = true;
  } else if (oea === 0) {
    // Receive B -> A (inverted) and check parity. B and PARITY are inputs; A driven.
    const b = [];
    for (let i = 0; i < 8; i++) b.push(this._readPinBit(comp, gate.inputs[12 + i]));
    const par = this._readPinBit(comp, gate.inputs[20]);
    for (let i = 0; i < 8; i++) if (this._drivePinBit(comp, gate.outputs[i], b[i] ? 0 : 1)) changed = true;
    for (let i = 0; i < 8; i++) if (this._drivePinHighZ(comp, gate.outputs[8 + i])) changed = true;
    if (this._drivePinHighZ(comp, gate.outputs[16])) changed = true;
    pOk = b.reduce((x, bit) => x ^ bit, 0) ^ par;    // odd 9-bit word => valid => pOk=1
    sample = true;
  } else {
    // Isolation: A / B / PARITY all Hi-Z. Per the datasheet note, a clocked ERR
    // then reflects the A-bus parity (A odd => no error).
    for (let i = 0; i < 8; i++) if (this._drivePinHighZ(comp, gate.outputs[i])) changed = true;
    for (let i = 0; i < 8; i++) if (this._drivePinHighZ(comp, gate.outputs[8 + i])) changed = true;
    if (this._drivePinHighZ(comp, gate.outputs[16])) changed = true;
    let aOnesOdd = 0;
    for (let i = 0; i < 8; i++) aOnesOdd ^= this._readPinBit(comp, gate.inputs[4 + i]);
    pOk = aOnesOdd;
    sample = true;
  }

  // Sticky error register: async CLRn LOW forces ERR HIGH (no error); otherwise
  // sample on the CP rising edge with ERRnext = pOk AND ERRprev.
  if (clr === 0) {
    state.err = 1;
  } else if (sample && clk === 1 && state.prevClk === 0) {
    state.err = (pOk && state.err) ? 1 : 0;
  }
  state.prevClk = clk;

  // ERR (pin 10) is open-collector active-LOW: err=1 releases (Hi-Z, pulled up =>
  // HIGH), err=0 sinks the pin LOW.
  if (this._drivePinOC(comp, errName, state.err)) changed = true;
  return changed;
}

chipEvaluators._evaluateXcvrParityReg834 = _evaluateXcvrParityReg834_fn;

function _evaluateXcvrParityLatch853_fn(comp, gate) {
  // 74x853: 8-bit-to-9-bit parity bus transceiver, non-inverting. Same bus and
  // parity architecture as the 74x833 (_evaluateXcvrParityReg833_fn) — the ONLY
  // difference is the error-flag storage element. The 833 clocks its flag into an
  // edge-triggered register on a CLK rising edge; the 853 holds its flag in a
  // level-sensitive LATCH gated by LE (pin 13, active LOW): LE LOW is transparent
  // (ERR follows the live parity check), LE HIGH freezes the captured value.
  // Because it is a plain transparent latch, the 853 flag is NOT accumulate-sticky
  // the way the 833 register is — while LE is LOW a later good word re-clears it;
  // the flag only "sticks" once LE is raised to hold it. Async CLRn LOW forces the
  // flag to no-error regardless of LE.
  // Source: TI SCBS198G FUNCTION TABLE (see the 74x853 header comment in
  //   js/chips/chips42.js), read as rendered PDF page images (issues.md C4).
  //
  // inputs:  [OEAn, OEBn, CLRn, LEn, A1..A8, B1..B8, PARITY]
  //          indices 0,   1,    2,   3,  4-11,   12-19,  20
  // outputs: [A1..A8, B1..B8, PARITY, ERRn]
  //          indices 0-7,   8-15,   16,     17
  // A1-A8, B1-B8 and PARITY are bidirectional (listed in inputs AND outputs).
  //
  // Odd parity: a valid 9-bit word (8 data bits + PARITY) has an odd count of 1s.
  // Modes, with OEA/OEB active LOW (FUNCTION TABLE):
  //   OEB=L, OEA=H : A->B, PARITY = generated odd-parity of the A byte.
  //   OEB=L, OEA=L : A->B, PARITY = the inverted parity bit (forced-error
  //                  diagnostic — the far end sees a bad word). ERR = NA (held).
  //   OEB=H, OEA=L : B->A, PARITY is an INPUT; the 9-bit B-side word is checked.
  //   OEB=H, OEA=H : isolation, A/B/PARITY all Hi-Z; ERR (when latched) reflects
  //                  A-bus parity, matching the 833 model.
  // ERR (pin 10) is an open-collector, active-LOW flag.
  const oea = this._readPinBit(comp, gate.inputs[0]);
  const oeb = this._readPinBit(comp, gate.inputs[1]);
  const clr = this._readPinBit(comp, gate.inputs[2]);
  const le  = this._readPinBit(comp, gate.inputs[3]);
  let changed = false;

  const errName = gate.outputs[17];
  const state = this._getSeqState(comp, errName, { err: 1 });

  let pOk = 1;         // 1 = sampled word had valid odd parity (no error)
  let sample = false;  // whether this mode presents a check to the latch

  if (oeb === 0) {
    // Transmit A -> B and generate parity. A side Hi-Z; PARITY driven.
    const a = [];
    for (let i = 0; i < 8; i++) a.push(this._readPinBit(comp, gate.inputs[4 + i]));
    for (let i = 0; i < 8; i++) if (this._drivePinHighZ(comp, gate.outputs[i])) changed = true;
    for (let i = 0; i < 8; i++) if (this._drivePinBit(comp, gate.outputs[8 + i], a[i])) changed = true;
    const aOnesOdd = a.reduce((x, b) => x ^ b, 0);   // 1 if A holds an odd count of 1s
    const genParity = aOnesOdd ? 0 : 1;              // odd-parity generator bit
    const inverted = (oea === 0);                    // both OE low => forced-error
    const parOut = inverted ? (genParity ? 0 : 1) : genParity;
    if (this._drivePinBit(comp, gate.outputs[16], parOut)) changed = true;
    // ERR is NA while transmitting: the latch holds its stored value.
  } else if (oea === 0) {
    // Receive B -> A and check parity. B and PARITY are inputs; A driven.
    const b = [];
    for (let i = 0; i < 8; i++) b.push(this._readPinBit(comp, gate.inputs[12 + i]));
    const par = this._readPinBit(comp, gate.inputs[20]);
    for (let i = 0; i < 8; i++) if (this._drivePinBit(comp, gate.outputs[i], b[i])) changed = true;
    for (let i = 0; i < 8; i++) if (this._drivePinHighZ(comp, gate.outputs[8 + i])) changed = true;
    if (this._drivePinHighZ(comp, gate.outputs[16])) changed = true;
    pOk = b.reduce((x, bit) => x ^ bit, 0) ^ par;    // odd 9-bit word => valid => pOk=1
    sample = true;
  } else {
    // Isolation: A / B / PARITY all Hi-Z. Per the datasheet note, a latched ERR
    // then reflects the A-bus parity (A odd => no error).
    for (let i = 0; i < 8; i++) if (this._drivePinHighZ(comp, gate.outputs[i])) changed = true;
    for (let i = 0; i < 8; i++) if (this._drivePinHighZ(comp, gate.outputs[8 + i])) changed = true;
    if (this._drivePinHighZ(comp, gate.outputs[16])) changed = true;
    let aOnesOdd = 0;
    for (let i = 0; i < 8; i++) aOnesOdd ^= this._readPinBit(comp, gate.inputs[4 + i]);
    pOk = aOnesOdd;
    sample = true;
  }

  // Level-sensitive error latch: async CLRn LOW forces ERR HIGH (no error);
  // otherwise, while LE is LOW (transparent) the flag follows the live check.
  // LE HIGH (or a transmit mode where no check is presented) holds the flag.
  if (clr === 0) {
    state.err = 1;
  } else if (sample && le === 0) {
    state.err = pOk ? 1 : 0;
  }

  // ERR is open-collector active-LOW: err=1 releases (Hi-Z, pulled up => HIGH),
  // err=0 sinks the pin LOW.
  if (this._drivePinOC(comp, errName, state.err)) changed = true;
  return changed;
}

chipEvaluators._evaluateXcvrParityLatch853 = _evaluateXcvrParityLatch853_fn;

function _evaluateXcvrParityLatch854_fn(comp, gate) {
  // 74x854: the INVERTING sibling of the 74x853 8-bit-to-9-bit parity bus
  // transceiver with a level-sensitive error-flag LATCH. Relationship to the 853
  // (_evaluateXcvrParityLatch853_fn) is exactly the relationship of the 74x834 to
  // the 74x833: identical control, parity generator, error-flag latch, and pin
  // map — the ONE difference is that both data buses invert end to end
  // (B = NOT A on transmit, A = NOT B on receive). Inverting all eight data bits
  // leaves the count of 1s the same parity (8 is even), so the transmitted 9-bit
  // word is still valid odd parity and the generator/checker math is unchanged.
  // The error flag is a transparent latch (LE pin 13, active LOW: LE LOW =
  // transparent, LE HIGH = hold), NOT the accumulate-sticky register of the 833/834
  // — while LE is LOW a later good word re-clears it. Async CLRn LOW forces
  // no-error regardless of LE.
  // Source: Signetics/Philips SN74ABT854 FUNCTION TABLE + ERROR-FLAG FUNCTION TABLE
  //   + PIN DESCRIPTION (see the 74x854 header comment in js/chips/chips42.js),
  //   read as rendered PDF page images (issues.md C4). Data columns read B = A̅
  //   (transmit) and A = B̅ (receive); PARITY and ERROR columns match the 853.
  //
  // inputs:  [OEAn, OEBn, CLRn, LEn, A0..A7, B0..B7, PARITY]
  //          indices 0,   1,    2,   3,  4-11,   12-19,  20
  // outputs: [A0..A7, B0..B7, PARITY, ERRn]
  //          indices 0-7,   8-15,   16,     17
  // A0-A7, B0-B7 and PARITY are bidirectional (listed in inputs AND outputs).
  //
  // Modes, OEA/OEB active LOW:
  //   OEB=L, OEA=H : A->B, B = A̅, PARITY = generated odd-parity of the A byte.
  //   OEB=L, OEA=L : A->B, B = A̅, PARITY = inverted parity (forced-error diagnostic).
  //   OEB=H, OEA=L : B->A, A = B̅, PARITY is an INPUT; the 9-bit B word is checked.
  //   OEB=H, OEA=H : isolation, A/B/PARITY all Hi-Z; ERR (when latched) reflects
  //                  A-bus parity, matching the 853/833 model.
  const oea = this._readPinBit(comp, gate.inputs[0]);
  const oeb = this._readPinBit(comp, gate.inputs[1]);
  const clr = this._readPinBit(comp, gate.inputs[2]);
  const le  = this._readPinBit(comp, gate.inputs[3]);
  let changed = false;

  const errName = gate.outputs[17];
  const state = this._getSeqState(comp, errName, { err: 1 });

  let pOk = 1;         // 1 = sampled word had valid odd parity (no error)
  let sample = false;  // whether this mode presents a check to the latch

  if (oeb === 0) {
    // Transmit A -> B (inverted) and generate parity. A side Hi-Z; PARITY driven.
    const a = [];
    for (let i = 0; i < 8; i++) a.push(this._readPinBit(comp, gate.inputs[4 + i]));
    for (let i = 0; i < 8; i++) if (this._drivePinHighZ(comp, gate.outputs[i])) changed = true;
    for (let i = 0; i < 8; i++) if (this._drivePinBit(comp, gate.outputs[8 + i], a[i] ? 0 : 1)) changed = true;
    const aOnesOdd = a.reduce((x, b) => x ^ b, 0);   // 1 if A holds an odd count of 1s
    const genParity = aOnesOdd ? 0 : 1;              // odd-parity generator bit
    const inverted = (oea === 0);                    // both OE low => forced-error
    const parOut = inverted ? (genParity ? 0 : 1) : genParity;
    if (this._drivePinBit(comp, gate.outputs[16], parOut)) changed = true;
    // ERR is NA while transmitting: the latch holds its stored value.
  } else if (oea === 0) {
    // Receive B -> A (inverted) and check parity. B and PARITY are inputs; A driven.
    const b = [];
    for (let i = 0; i < 8; i++) b.push(this._readPinBit(comp, gate.inputs[12 + i]));
    const par = this._readPinBit(comp, gate.inputs[20]);
    for (let i = 0; i < 8; i++) if (this._drivePinBit(comp, gate.outputs[i], b[i] ? 0 : 1)) changed = true;
    for (let i = 0; i < 8; i++) if (this._drivePinHighZ(comp, gate.outputs[8 + i])) changed = true;
    if (this._drivePinHighZ(comp, gate.outputs[16])) changed = true;
    pOk = b.reduce((x, bit) => x ^ bit, 0) ^ par;    // odd 9-bit word => valid => pOk=1
    sample = true;
  } else {
    // Isolation: A / B / PARITY all Hi-Z. Per the datasheet note, a latched ERR
    // then reflects the A-bus parity (A odd => no error).
    for (let i = 0; i < 8; i++) if (this._drivePinHighZ(comp, gate.outputs[i])) changed = true;
    for (let i = 0; i < 8; i++) if (this._drivePinHighZ(comp, gate.outputs[8 + i])) changed = true;
    if (this._drivePinHighZ(comp, gate.outputs[16])) changed = true;
    let aOnesOdd = 0;
    for (let i = 0; i < 8; i++) aOnesOdd ^= this._readPinBit(comp, gate.inputs[4 + i]);
    pOk = aOnesOdd;
    sample = true;
  }

  // Level-sensitive error latch: async CLRn LOW forces ERR HIGH (no error);
  // otherwise, while LE is LOW (transparent) the flag follows the live check.
  // LE HIGH (or a transmit mode where no check is presented) holds the flag.
  if (clr === 0) {
    state.err = 1;
  } else if (sample && le === 0) {
    state.err = pOk ? 1 : 0;
  }

  // ERR is open-collector active-LOW: err=1 releases (Hi-Z, pulled up => HIGH),
  // err=0 sinks the pin LOW.
  if (this._drivePinOC(comp, errName, state.err)) changed = true;
  return changed;
}

chipEvaluators._evaluateXcvrParityLatch854 = _evaluateXcvrParityLatch854_fn;

// ── Block 71 evaluators: analog companion chips ─────────────────────────────
// LM393 comparator, LM741 op-amp, ULN2003 Darlington array, LM7805 regulator,
// 2764 EPROM, and the crystal-oscillator can. The analog parts read real MNA
// net voltages (same mechanism as the 555 timer).

// LM393-style comparator section with open-collector output.
// inputs: [IN+, IN-]   output: OUT
// Output transistor ON (sinks to GND) when IN- is above IN+; released (Hi-Z,
// pulled HIGH by the chip's implicit OC pull-up) when IN+ is above IN-.
// A small deadband holds the previous decision when the inputs are within a
// few mV so the gate↔MNA iteration cannot chatter around the crossing point.
function _evaluateComparatorOC_fn(comp, gate) {
  const vP = this._readPinVoltage(comp, gate.inputs[0]);
  const vN = this._readPinVoltage(comp, gate.inputs[1]);
  if (vP === null || vN === null) return this._drivePinHighZ(comp, gate.output);
  const state = this._getSeqState(comp, gate.output + '_cmp', { q: 1 }); // q=1 → released
  const DEADBAND = 0.005; // V
  if (vP - vN > DEADBAND) state.q = 1;
  else if (vN - vP > DEADBAND) state.q = 0;
  return state.q
    ? this._drivePinHighZ(comp, gate.output)
    : this._drivePinSink(comp, gate.output);
}

// LM741-style op-amp. inputs: [IN+, IN-]   output: OUT
// Damped relaxation: each pass the output moves by STEP_GAIN × (V+ − V−),
// clamped to the single-supply swing. Open loop this slams to a rail like a
// comparator; with resistive negative feedback the fixed-point iteration
// converges to the feedback-defined output (STEP_GAIN < 2 keeps a unity-
// feedback follower stable; convergence continues across time steps).
function _evaluateOpamp_fn(comp, gate) {
  const vP = this._readPinVoltage(comp, gate.inputs[0]);
  const vN = this._readPinVoltage(comp, gate.inputs[1]);
  // A 741 on a 5 V single supply cannot swing near either rail.
  const OUT_LO = 1.0, OUT_HI = 4.0, STEP_GAIN = 1.5;
  const state = this._getSeqState(comp, gate.output + '_opamp', { v: (OUT_LO + OUT_HI) / 2 });
  // The output stage always drives (a real op-amp output is never Hi-Z) —
  // crucial for feedback wiring where IN- connects only to OUT and would
  // otherwise read as floating forever. Integrate only when both inputs
  // carry a real voltage.
  if (vP !== null && vN !== null) {
    const vNext = Math.max(OUT_LO, Math.min(OUT_HI, state.v + STEP_GAIN * (vP - vN)));
    if (Math.abs(vNext - state.v) > 1e-4) state.v = vNext;
  }
  return this._drivePin(comp, gate.output, DRIVE.PUSH_PULL, state.v);
}

// ULN2003-style Darlington sink channel. inputs: [IN]   output: OUT
// Inverting open-collector power switch: input HIGH → output sinks hard to
// GND; input LOW → output floats. Modeled with a much lower saturation
// resistance than a logic output so it out-drives pull-ups, mirroring the
// real part's 500 mA capability. A floating input is OFF (the Darlington
// base needs real current), hence the analog read instead of _readPinBit.
const ULN_R_SAT = 30; // Ω — Darlington Vce(sat) ≈ 0.9 V at ~30 mA scale
function _evaluateDarlingtonOC_fn(comp, gate) {
  const vIn = this._readPinVoltage(comp, gate.inputs[0]);
  const on = vIn !== null && vIn > 2.0; // datasheet input threshold ≈ 2.4 V
  return on
    ? this._drivePin(comp, gate.output, DRIVE.SINK_ONLY, 0, ULN_R_SAT)
    : this._drivePinHighZ(comp, gate.output);
}

// LM7805-style +5 V regulator. inputs: [VIN]   output: VOUT
// The simulator's rails are already regulated 5 V, so the part is idealized:
// VOUT follows VIN capped at 5 V, driven as a stiff source (real headroom
// requirements are covered in the chip guide instead).
const VREG_R_OUT = 5; // Ω — much stiffer than a logic output
function _evaluateVreg5V_fn(comp, gate) {
  const vIn = this._readPinVoltage(comp, gate.inputs[0]);
  if (vIn === null || vIn < 0.5) return this._drivePinHighZ(comp, gate.output);
  const vOut = Math.min(VCC_VOLTAGE, vIn);
  return this._drivePin(comp, gate.output, DRIVE.PUSH_PULL, vOut, VREG_R_OUT);
}

// 2764-style 8K × 8 UV EPROM.
// gate.inputs:  [A0..A12 (13), O0..O7 (8), CE, OE, PGM, VPP]
// gate.outputs: [O0..O7]
// Erased state is all-1s (0xFF) and a program pulse can only clear bits —
// real EPROM physics. "UV erase" = remove the chip and place it again
// (a fresh component starts with empty ffState).
//   Standby (CE=1):                         O → Hi-Z
//   Read    (CE=0, OE=0, PGM=1):            drive mem[addr] → O
//   Program (CE=0, OE=1, PGM=0, VPP=1):     mem[addr] &= O bus, O → Hi-Z
function _evaluateEprom8kx8_fn(comp, gate) {
  const bits = this._readGateInputs(comp, gate.inputs);
  let addr = 0;
  for (let i = 0; i < 13; i++) addr |= bits[i] << i;
  const dataIn = bits.slice(13, 21);
  const ce = bits[21], oe = bits[22], pgm = bits[23], vpp = bits[24];

  if (ce !== 0) return this._drivePinsHighZ(comp, gate.outputs);

  const state = this._getSeqState(comp, gate.outputs[0] + '_eprom8k', { mem: {} });
  const ERASED = [1, 1, 1, 1, 1, 1, 1, 1];

  if (pgm === 0 && oe !== 0 && vpp === 1) {
    const cur = state.mem[addr] || ERASED;
    state.mem[addr] = cur.map((b, i) => b & dataIn[i]);
    return this._drivePinsHighZ(comp, gate.outputs);
  }
  if (oe === 0 && pgm !== 0) {
    return this._drivePinBits(comp, gate.outputs, state.mem[addr] || ERASED);
  }
  return this._drivePinsHighZ(comp, gate.outputs);
}

// Crystal-oscillator can. inputs: [EN]   output: OUT   gate.freqHz: frequency
// Free-running 50%-duty square wave derived from simTime. EN floating or HIGH
// runs the oscillator; LOW tri-states OUT (standard can behavior). Phase only
// advances when simTime has moved, so the multi-pass gate↔MNA iteration inside
// one evaluate() cannot over-advance the clock.
function _evaluateXtalOsc_fn(comp, gate) {
  const vEn = this._readPinVoltage(comp, gate.inputs[0]);
  const enabled = vEn === null || vEn > this._specFor(comp).VTH;
  if (!enabled) return this._drivePinHighZ(comp, gate.output);
  const state = this._getSeqState(comp, gate.output + '_xo', { phase: 0, lastT: null });
  if (state.lastT !== null && this.simTime > state.lastT) {
    const freq = gate.freqHz || 10;
    state.phase = (state.phase + (this.simTime - state.lastT) * freq) % 1;
  }
  state.lastT = this.simTime;
  return this._drivePinBit(comp, gate.output, state.phase < 0.5 ? 1 : 0);
}

chipEvaluators._evaluateComparatorOC = _evaluateComparatorOC_fn;
chipEvaluators._evaluateOpamp        = _evaluateOpamp_fn;
chipEvaluators._evaluateDarlingtonOC = _evaluateDarlingtonOC_fn;
chipEvaluators._evaluateVreg5V       = _evaluateVreg5V_fn;
chipEvaluators._evaluateEprom8kx8    = _evaluateEprom8kx8_fn;
chipEvaluators._evaluateXtalOsc      = _evaluateXtalOsc_fn;

// 74x299 / 74x2299: 8-bit universal shift/storage register with 3-state I/O,
// dedicated cascade outputs QA'/QH', and a direct (asynchronous) overriding
// clear. The '2299 is the Advanced-Schottky variant with 25 Ohm series output
// resistors; its logic and pinout are identical to the '299, so one evaluator
// serves both. Distinct from SHIFT_REG_8BIT_BIDIR_CLR_TRI (74x323) because that
// part's clear is synchronous and it has no separate QA'/QH' outputs.
//
// Source: Texas Instruments, "SN54ALS299, SN74ALS299 8-Bit Universal
//   Shift/Storage Registers With 3-State Outputs", SDAS220B (Dec 1982, rev.
//   Dec 1994). [Online]. Available:
//   https://www.ti.com/lit/ds/symlink/sn74als299.pdf. Verified: terminal
//   assignment (DW/N package top view), function table, and positive-logic
//   logic diagram, pages 1-3, read as PDF page images. The '299 family pinout
//   and function are industry-standard and shared by the AS-family '2299.
//
// inputs:  [S0,S1, SR,SL, OE1n,OE2n, CLRn, CLK,
//           A/QA,B/QB,C/QC,D/QD,E/QE,F/QF,G/QG,H/QH]   (I/O ports read as data)
// outputs: [A/QA,B/QB,C/QC,D/QD,E/QE,F/QF,G/QG,H/QH, QA', QH']
//   Mode (S1:S0): 00=hold, 01=shift right (SR enters at QA), 10=shift left
//     (SL enters at QH), 11=synchronous parallel load from the I/O ports.
//   Bit i (i=0..7) = register stage QA..QH.
//   CLRn=0 forces the register to 0 immediately, overriding the clock.
//   The eight I/O ports drive out the stored bits only when OE1n=OE2n=0 and the
//   part is not in load mode; in load mode they are released (high-Z) so the
//   external bus can present data to be clocked in. QA'/QH' are taken directly
//   off the flip-flops and are always driven, independent of OE.
function _evaluateShiftReg8BitUnivClrTri_fn(comp, gate) {
  const bits = this._readGateInputs(comp, gate.inputs);
  const [s0,s1,sr,sl,oe1n,oe2n,clrn,clk,
         a_i,b_i,c_i,d_i,e_i,f_i,g_i,h_i] = bits;
  if (!comp.state) comp.state = { reg: 0, prevClk: clk };
  let changed = false;
  const mode = (s1 << 1) | s0;

  if (clrn === 0) {
    comp.state.reg = 0;                       // direct overriding clear
  } else if (comp.state.prevClk === 0 && clk === 1) {
    const cur = comp.state.reg;
    switch (mode) {
      case 0: break;                                                  // hold
      case 1: comp.state.reg = ((cur << 1) | sr) & 0xFF; break;       // shift right, SR→QA
      case 2: comp.state.reg = ((cur >> 1) | (sl << 7)) & 0xFF; break;// shift left, SL→QH
      case 3: comp.state.reg = (a_i|(b_i<<1)|(c_i<<2)|(d_i<<3)|       // parallel load
                                (e_i<<4)|(f_i<<5)|(g_i<<6)|(h_i<<7)) & 0xFF; break;
    }
  }
  comp.state.prevClk = clk;

  const reg = comp.state.reg;

  // Dedicated cascade outputs QA' (bit 0) and QH' (bit 7) are always driven.
  if (this._drivePinBit(comp, gate.outputs[8], reg & 1)) changed = true;
  if (this._drivePinBit(comp, gate.outputs[9], (reg >> 7) & 1)) changed = true;

  // I/O ports: released in load mode, else driven when both enables are low.
  const driveIO = (mode !== 3) && (oe1n === 0) && (oe2n === 0);
  for (let i = 0; i < 8; i++) {
    if (driveIO) {
      if (this._drivePinBit(comp, gate.outputs[i], (reg >> i) & 1)) changed = true;
    } else {
      if (this._drivePinHighZ(comp, gate.outputs[i])) changed = true;
    }
  }
  return changed;
}
chipEvaluators._evaluateShiftReg8BitUnivClrTri = _evaluateShiftReg8BitUnivClrTri_fn;

function _evaluateSerialParallelMult784_fn(comp, gate) {
  // 74F784: 8-bit serial/parallel multiplier with a final-stage adder/subtracter.
  // inputs:  [CP, PLn, M, ASn, Y, K, Bn, Bn1, X0, X1, X2, X3, X4, X5, X6, X7]
  // outputs: [SP, SPB]   (SP = serial X*Y product; SPB = serial X*Y +/- B)
  //
  // What the part does (Signetics datasheet, see Source below): the 8-bit
  // multiplicand X (X0=LSB..X7=MSB) is parallel-loaded into latches; the
  // multiplier Y is clocked in serially, LSB first, one bit per clock; the
  // product X*Y leaves SP serially, LSB first. A serial add/subtract stage adds
  // or subtracts a second serial operand B (Bn) to the product, giving X*Y +/- B
  // on SPB with A/S(bar) choosing add (HIGH) or subtract (LOW). PL(bar) LOW on a
  // clock edge loads X and clears the arithmetic cells to start a new multiply,
  // and (per the datasheet) that same edge also takes the first Y bit.
  //
  // Model: a running serial multiplier. Each clock incorporates the current Y bit
  //   y_t at bit position t: acc += y_t * X, product bit_t = acc & 1, then
  //   acc >>= 1 (the carry into higher product bits is retained). Because a Y bit
  //   of weight 2^j only affects product bits >= j, product bit t is final once
  //   y_t has been seen -- this reproduces the LSB-first serial product exactly
  //   for the UNSIGNED case. The SPB path is a bit-serial add/subtract of the Bn
  //   stream to that product bit, carrying (add) or borrowing (subtract) across
  //   clocks. Outputs update only on the rising CP edge and hold between edges.
  //
  // Deliberate simplifications (see issues.md): (1) M (Two's Complement vs
  //   unsigned multiplicand) is read but does not alter the datapath -- correct
  //   signed operation needs the end-of-word sign-bit correction and the exact
  //   clock sequencing the real array performs, which the digital engine can't
  //   drive faithfully, so only unsigned multiply is modeled. (2) K (cascade in
  //   from a more-significant chip) and (3) the real pipeline latency (the chip
  //   emits no valid SP on the load clock) are omitted -- this model has zero
  //   latency, giving the true product bit immediately. Bn1 (the one-clock-early
  //   B input the chip uses to align B with the load clock) is accepted but the
  //   Bn stream is used as the serial B operand.
  //
  // Source: Signetics, "FAST 74F784 -- 8-Bit Serial/Parallel Multiplier (With
  //   Adder/Subtracter)", Preliminary Specification, June 1987, in *1987
  //   Signetics FAST Data Manual*, pp. 6-767..6-770. [Online]. Available:
  //   http://www.bitsavers.org/components/signetics/_dataBooks/1987_Signetics_FAST_Data_Manual.pdf.
  //   Verified: PIN CONFIGURATION, pin-function table and DESCRIPTION, read as a
  //   300-dpi rendering of PDF page 832 (issues.md C4). DIP-20 terminals:
  //   Bn-1=1, PL(bar)=2, X3=3, X2=4, X1=5, X0=6, SP=7, S+/-B=8, CP=9, GND=10,
  //   M=11, K=12, A/S(bar)=13, Bn=14, X7=15, X6=16, X5=17, X4=18, Y=19, Vcc=20.
  //   Not cloned from a sibling (issues.md C2): the pre-existing stub pinout
  //   (CLK/A_Bn/OVF/S0..S7/B1..B7) was hand-entered and wrong; replaced from the
  //   datasheet page image.
  const [cpN, plN, /*M*/, asN, yN, /*K*/, bnN, /*Bn1*/,
         x0N, x1N, x2N, x3N, x4N, x5N, x6N, x7N] = gate.inputs;
  const [spN, spbN] = gate.outputs;
  const state = this._getSeqState(comp, spN,
    { xreg: 0, acc: 0, bcarry: 0, prevClk: 0, sp: 0, spb: 0 });

  const cp = this._readPinBit(comp, cpN);
  if (state.prevClk === 0 && cp === 1) {
    // Rising clock edge.
    if (this._readPinBit(comp, plN) === 0) {
      // Parallel load: latch X, clear the arithmetic cells, start a new multiply.
      state.xreg =
        this._readPinBit(comp, x0N)        | (this._readPinBit(comp, x1N) << 1) |
        (this._readPinBit(comp, x2N) << 2) | (this._readPinBit(comp, x3N) << 3) |
        (this._readPinBit(comp, x4N) << 4) | (this._readPinBit(comp, x5N) << 5) |
        (this._readPinBit(comp, x6N) << 6) | (this._readPinBit(comp, x7N) << 7);
      state.acc = 0;
      state.bcarry = 0;
    }
    const y = this._readPinBit(comp, yN);
    state.acc += y * state.xreg;
    const spBit = state.acc & 1;
    state.acc = Math.floor(state.acc / 2);

    // Serial add/subtract of the B stream onto the product bit.
    const b = this._readPinBit(comp, bnN);
    let spbBit;
    if (this._readPinBit(comp, asN) === 1) {          // A/S(bar) HIGH = add
      const s = spBit + b + state.bcarry;
      spbBit = s & 1;
      state.bcarry = s >> 1;
    } else {                                          // LOW = subtract
      const d = spBit - b - state.bcarry;
      spbBit = d & 1;
      state.bcarry = d < 0 ? 1 : 0;
    }
    state.sp = spBit;
    state.spb = spbBit;
  }
  state.prevClk = cp;

  let changed = this._drivePinBit(comp, spN, state.sp);
  if (this._drivePinBit(comp, spbN, state.spb)) changed = true;
  return changed;
}
chipEvaluators._evaluateSerialParallelMult784 = _evaluateSerialParallelMult784_fn;

function _evaluateBusXcvr9BitDualOE_fn(comp, gate) {
  // 74x863 (non-inverting) / 74x864 (inverting): 9-bit bidirectional bus
  // transceiver with dual (NOR-ed) output enables per direction. No DIR pin.
  //
  // gate.inputs:  [A0..A8 (0-8), B0..B8 (9-17), OEAB0 (18), OEAB1 (19),
  //                OEBA0 (20), OEBA1 (21)]
  // gate.outputs: [A0..A8 (0-8), B0..B8 (9-17)]  (same bidir pins as inputs)
  // gate.invert:  true => B side carries /A and A side carries /B (the '864).
  //
  // Function table (see Source on the chip entry): each direction has two
  // active-LOW enables that are NOR-ed, so a direction turns on only when BOTH
  // of its enables are LOW.
  //   OEAB0=L AND OEAB1=L, other pair not both L -> A->B (read A, drive B; A Hi-Z)
  //   OEBA0=L AND OEBA1=L, other pair not both L -> B->A (read B, drive A; B Hi-Z)
  //   all four HIGH (neither pair enabled)       -> Isolation (all Hi-Z)
  //   all four LOW  (both pairs enabled)          -> "Latch A and B": both drivers
  //     active, holding the last word that crossed. For the non-inverting '863
  //     A = B; for the inverting '864 the held B side is the complement of A.
  // The latch value tracked here is always the A-side logic word. `xf` maps a
  // word between the A and B domains (identity for '863, bit-invert for '864);
  // it is its own inverse, so the same map serves both transfer directions.
  const inv = !!gate.invert;
  const xf = (b) => inv ? (b ^ 1) : b;
  const enAB = this._readPinBit(comp, gate.inputs[18]) === 0 &&
               this._readPinBit(comp, gate.inputs[19]) === 0;
  const enBA = this._readPinBit(comp, gate.inputs[20]) === 0 &&
               this._readPinBit(comp, gate.inputs[21]) === 0;
  const aOut = gate.outputs.slice(0, 9);
  const bOut = gate.outputs.slice(9, 18);
  const state = this._getSeqState(comp, gate.outputs[0] + '_xcvr864',
    { latched: new Array(9).fill(0) });
  let changed = false;
  if (enAB && !enBA) {
    // A -> B: release A, drive B from A. Latch stores the A-side word.
    if (this._drivePinsHighZ(comp, aOut)) changed = true;
    const a = [];
    for (let i = 0; i < 9; i++) a.push(this._readPinBit(comp, gate.inputs[i]));
    state.latched = a.slice();
    if (this._drivePinBits(comp, bOut, a.map(xf))) changed = true;
  } else if (enBA && !enAB) {
    // B -> A: release B, drive A from B. A-side word (what the latch stores) is
    // the transformed B word.
    if (this._drivePinsHighZ(comp, bOut)) changed = true;
    const aWord = [];
    for (let i = 0; i < 9; i++) aWord.push(xf(this._readPinBit(comp, gate.inputs[9 + i])));
    state.latched = aWord.slice();
    if (this._drivePinBits(comp, aOut, aWord)) changed = true;
  } else if (enAB && enBA) {
    // Latch: hold the last word. A gets the stored A-side word, B its xf image.
    if (this._drivePinBits(comp, aOut, state.latched)) changed = true;
    if (this._drivePinBits(comp, bOut, state.latched.map(xf))) changed = true;
  } else {
    // Isolation.
    if (this._drivePinsHighZ(comp, gate.outputs)) changed = true;
  }
  return changed;
}
chipEvaluators._evaluateBusXcvr9BitDualOE = _evaluateBusXcvr9BitDualOE_fn;

function _evaluateShiftRegDualRank963_fn(comp, gate) {
  // SN74ALS963 dual-rank 8-bit shift register (datasheet citation in the chip-def
  // header comment). Two 8-bit registers with independent clocks:
  //   Reg1 = parallel I/O register  -> drives the bidirectional A/OA..H/OH pins
  //          through the OE 3-state buffer; loads from those pins on CLK1.
  //   Reg2 = shift register         -> SERIN in, SEROUT out; shifts on CLK2.
  // Bit order index 0 = A (MSB) ... 7 = H (LSB). Shift is toward A (verified from
  // the datasheet "typical sequence" waveform, p.2-790: 0011 0011 with SERIN=0
  // becomes 0110 0110): new[i]=old[i+1], new[7]=SERIN, MSB (index 0) at SEROUT.
  // Active-LOW gates: OE, GIN, G21 (Reg2->Reg1), G12 (Reg1->Reg2), GSH (shift).
  // SCLR is active-HIGH synchronous clear. Full 'ALS963 function table (p.2-786):
  // Reg1 updates on CLK1 rising, Reg2 on CLK2 rising; both edges read the pre-edge
  // contents so a simultaneous exchange/copy uses old values.
  //   CLK1: SCLR=1 -> Reg1 cleared, unless GIN=0 (I/O load wins);
  //         else GIN=0 & G21=0 -> Reg1 = Reg2 OR I/O; GIN=0 -> Reg1 = I/O;
  //         G21=0 -> Reg1 = Reg2; otherwise hold.
  //   CLK2: SCLR=1 -> Reg2 cleared; else G12=0 -> Reg2 = Reg1; GSH=0 -> shift;
  //         otherwise hold.
  // inputs:  [OE, SERIN, GIN, G21, SCLR, G12, GSH, CLK2, CLK1, IOA..IOH (9..16)]
  // outputs: [SEROUT, IOA..IOH (1..8)]
  const [oeN, serinN, ginN, g21N, sclrN, g12N, gshN, clk2N, clk1N] = gate.inputs;
  const ioInNames = gate.inputs.slice(9, 17);

  const state = this._getSeqState(comp, gate.outputs[0] + '_963',
    { reg1: new Array(8).fill(0), reg2: new Array(8).fill(0),
      prevClk1: 0, prevClk2: 0 });

  const gin   = this._readPinBit(comp, ginN);
  const g21   = this._readPinBit(comp, g21N);
  const g12   = this._readPinBit(comp, g12N);
  const gsh   = this._readPinBit(comp, gshN);
  const sclr  = this._readPinBit(comp, sclrN);
  const serin = this._readPinBit(comp, serinN);
  const clk1  = this._readPinBit(comp, clk1N);
  const clk2  = this._readPinBit(comp, clk2N);
  const io    = ioInNames.map((n) => this._readPinBit(comp, n));

  // Snapshot pre-edge contents; the two clocks are independent, so both edges in
  // one evaluation see the old registers (needed for exchange/copy correctness).
  const oldR1 = state.reg1.slice();
  const oldR2 = state.reg2.slice();

  // CLK1 rising -> Reg1 (I/O register)
  if (state.prevClk1 === 0 && clk1 === 1) {
    if (sclr === 1) {
      state.reg1 = (gin === 0) ? io.slice() : new Array(8).fill(0);
    } else {
      const fromIO = (gin === 0), fromR2 = (g21 === 0);
      if (fromIO && fromR2)  state.reg1 = oldR2.map((b, i) => b | io[i]);
      else if (fromIO)       state.reg1 = io.slice();
      else if (fromR2)       state.reg1 = oldR2.slice();
      // else hold
    }
  }
  state.prevClk1 = clk1;

  // CLK2 rising -> Reg2 (shift register)
  if (state.prevClk2 === 0 && clk2 === 1) {
    if (sclr === 1)        state.reg2 = new Array(8).fill(0);
    else if (g12 === 0)    state.reg2 = oldR1.slice();               // copy Reg1 -> Reg2
    else if (gsh === 0)    state.reg2 = [...oldR2.slice(1), serin];  // shift toward A
    // else hold
  }
  state.prevClk2 = clk2;

  let changed = this._drivePinBit(comp, gate.outputs[0], state.reg2[0]); // SEROUT = MSB
  const oe = this._readPinBit(comp, oeN);
  if (oe === 0) {
    if (this._drivePinBits(comp, gate.outputs.slice(1, 9), state.reg1.slice())) changed = true;
  } else {
    if (this._drivePinsHighZ(comp, gate.outputs.slice(1, 9))) changed = true;
  }
  return changed;
}
chipEvaluators._evaluateShiftRegDualRank963 = _evaluateShiftRegDualRank963_fn;

export { chipEvaluators };
