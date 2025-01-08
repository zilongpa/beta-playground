import jsep from "jsep";
import {
  type IPlugin,
  type Compound,
  type CallExpression,
  type Identifier,
} from "jsep";
import jsepNumbers from "@jsep-plugin/numbers";
import jsepAssignment from "@jsep-plugin/assignment";
// import instructions from "assets/instruction.json";

const instructionSet = {
  HALT: {
    opcode: 16,
    af: null,
    mf: null,
    ALUFN: null,
    PCSEL: null,
    RA2SEL: null,
    ASEL: null,
    BSEL: null,
    WDSEL: null,
    MWR: null,
    MOE: null,
    WERF: null,
  },
  LD: {
    opcode: 24,
    af: 19,
    mf: 52,
    ALUFN: "A+B",
    PCSEL: 0,
    RA2SEL: 0,
    ASEL: 0,
    BSEL: 1,
    WDSEL: 2,
    MWR: 0,
    MOE: 1,
    WERF: 1,
  },
  ST: {
    opcode: 25,
    af: 49,
    mf: 52,
    ALUFN: "A+B",
    PCSEL: 0,
    RA2SEL: 1,
    ASEL: 0,
    BSEL: 1,
    WDSEL: null,
    MWR: 1,
    MOE: 0,
    WERF: 0,
  },
  JMP: {
    opcode: 27,
    af: 7,
    mf: 52,
    ALUFN: null,
    PCSEL: 2,
    RA2SEL: null,
    ASEL: null,
    BSEL: null,
    WDSEL: 0,
    MWR: 0,
    MOE: null,
    WERF: 1,
  },
  BEQ: {
    opcode: 29,
    af: 19,
    mf: 52,
    ALUFN: null,
    PCSEL: [0, 1],
    RA2SEL: null,
    ASEL: null,
    BSEL: null,
    WDSEL: 0,
    MWR: 0,
    MOE: null,
    WERF: 1,
  },
  BNE: {
    opcode: 30,
    af: 19,
    mf: 52,
    ALUFN: null,
    PCSEL: [0, 1],
    RA2SEL: null,
    ASEL: null,
    BSEL: null,
    WDSEL: 0,
    MWR: 0,
    MOE: null,
    WERF: 1,
  },
  LDR: {
    opcode: 31,
    af: 19,
    mf: 52,
    ALUFN: "A",
    PCSEL: 0,
    RA2SEL: null,
    ASEL: 1,
    BSEL: null,
    WDSEL: 2,
    MWR: 0,
    MOE: 1,
    WERF: 1,
  },
  ADD: {
    opcode: 32,
    af: 27,
    mf: 54,
    ALUFN: "A+B",
    PCSEL: 0,
    RA2SEL: 0,
    ASEL: 0,
    BSEL: 0,
    WDSEL: 1,
    MWR: 0,
    MOE: null,
    WERF: 1,
  },
  SUB: {
    opcode: 33,
    af: 27,
    mf: 54,
    ALUFN: "A-B",
    PCSEL: 0,
    RA2SEL: 0,
    ASEL: 0,
    BSEL: 0,
    WDSEL: 1,
    MWR: 0,
    MOE: null,
    WERF: 1,
  },
  "MUL*": {
    opcode: 34,
    af: 27,
    mf: 54,
    ALUFN: "A*B",
    PCSEL: 0,
    RA2SEL: 0,
    ASEL: 0,
    BSEL: 0,
    WDSEL: 1,
    MWR: 0,
    MOE: null,
    WERF: 1,
  },
  "DIV*": {
    opcode: 35,
    af: 27,
    mf: 54,
    ALUFN: "A/B",
    PCSEL: 0,
    RA2SEL: 0,
    ASEL: 0,
    BSEL: 0,
    WDSEL: 1,
    MWR: 0,
    MOE: null,
    WERF: 1,
  },
  CMPEQ: {
    opcode: 36,
    af: 27,
    mf: 54,
    ALUFN: "A==B",
    PCSEL: 0,
    RA2SEL: 0,
    ASEL: 0,
    BSEL: 0,
    WDSEL: 1,
    MWR: 0,
    MOE: null,
    WERF: 1,
  },
  CMPLT: {
    opcode: 37,
    af: 27,
    mf: 54,
    ALUFN: "A<B",
    PCSEL: 0,
    RA2SEL: 0,
    ASEL: 0,
    BSEL: 0,
    WDSEL: 1,
    MWR: 0,
    MOE: null,
    WERF: 1,
  },
  CMPLE: {
    opcode: 38,
    af: 27,
    mf: 54,
    ALUFN: "A<=B",
    PCSEL: 0,
    RA2SEL: 0,
    ASEL: 0,
    BSEL: 0,
    WDSEL: 1,
    MWR: 0,
    MOE: null,
    WERF: 1,
  },
  AND: {
    opcode: 40,
    af: 27,
    mf: 54,
    ALUFN: "A&B",
    PCSEL: 0,
    RA2SEL: 0,
    ASEL: 0,
    BSEL: 0,
    WDSEL: 1,
    MWR: 0,
    MOE: null,
    WERF: 1,
  },
  OR: {
    opcode: 41,
    af: 27,
    mf: 54,
    ALUFN: "A|B",
    PCSEL: 0,
    RA2SEL: 0,
    ASEL: 0,
    BSEL: 0,
    WDSEL: 1,
    MWR: 0,
    MOE: null,
    WERF: 1,
  },
  XOR: {
    opcode: 42,
    af: 27,
    mf: 54,
    ALUFN: "A^B",
    PCSEL: 0,
    RA2SEL: 0,
    ASEL: 0,
    BSEL: 0,
    WDSEL: 1,
    MWR: 0,
    MOE: null,
    WERF: 1,
  },
  SHL: {
    opcode: 44,
    af: 27,
    mf: 54,
    ALUFN: "A<<B",
    PCSEL: 0,
    RA2SEL: 0,
    ASEL: 0,
    BSEL: 0,
    WDSEL: 1,
    MWR: 0,
    MOE: null,
    WERF: 1,
  },
  SHR: {
    opcode: 45,
    af: 27,
    mf: 54,
    ALUFN: "A>>B",
    PCSEL: 0,
    RA2SEL: 0,
    ASEL: 0,
    BSEL: 0,
    WDSEL: 1,
    MWR: 0,
    MOE: null,
    WERF: 1,
  },
  SRA: {
    opcode: 46,
    af: 27,
    mf: 54,
    ALUFN: "A>>>B",
    PCSEL: 0,
    RA2SEL: 0,
    ASEL: 0,
    BSEL: 0,
    WDSEL: 1,
    MWR: 0,
    MOE: null,
    WERF: 1,
  },
  ADDC: {
    opcode: 48,
    af: 19,
    mf: 52,
    ALUFN: "A+B",
    PCSEL: 0,
    RA2SEL: null,
    ASEL: 0,
    BSEL: 1,
    WDSEL: 1,
    MWR: 0,
    MOE: null,
    WERF: 1,
  },
  SUBC: {
    opcode: 49,
    af: 19,
    mf: 52,
    ALUFN: "A-B",
    PCSEL: 0,
    RA2SEL: null,
    ASEL: 0,
    BSEL: 1,
    WDSEL: 1,
    MWR: 0,
    MOE: null,
    WERF: 1,
  },
  "MULC*": {
    opcode: 50,
    af: 19,
    mf: 52,
    ALUFN: "A*B",
    PCSEL: 0,
    RA2SEL: null,
    ASEL: 0,
    BSEL: 1,
    WDSEL: 1,
    MWR: 0,
    MOE: null,
    WERF: 1,
  },
  "DIVC*": {
    opcode: 51,
    af: 19,
    mf: 52,
    ALUFN: "A/B",
    PCSEL: 0,
    RA2SEL: null,
    ASEL: 0,
    BSEL: 1,
    WDSEL: 1,
    MWR: 0,
    MOE: null,
    WERF: 1,
  },
  CMPEQC: {
    opcode: 52,
    af: 19,
    mf: 52,
    ALUFN: "A==B",
    PCSEL: 0,
    RA2SEL: null,
    ASEL: 0,
    BSEL: 1,
    WDSEL: 1,
    MWR: 0,
    MOE: null,
    WERF: 1,
  },
  CMPLTC: {
    opcode: 53,
    af: 19,
    mf: 52,
    ALUFN: "A<B",
    PCSEL: 0,
    RA2SEL: null,
    ASEL: 0,
    BSEL: 1,
    WDSEL: 1,
    MWR: 0,
    MOE: null,
    WERF: 1,
  },
  CMPLEC: {
    opcode: 54,
    af: 19,
    mf: 52,
    ALUFN: "A<=B",
    PCSEL: 0,
    RA2SEL: null,
    ASEL: 0,
    BSEL: 1,
    WDSEL: 1,
    MWR: 0,
    MOE: null,
    WERF: 1,
  },
  ANDC: {
    opcode: 56,
    af: 19,
    mf: 52,
    ALUFN: "A&B",
    PCSEL: 0,
    RA2SEL: null,
    ASEL: 0,
    BSEL: 1,
    WDSEL: 1,
    MWR: 0,
    MOE: null,
    WERF: 1,
  },
  ORC: {
    opcode: 57,
    af: 19,
    mf: 52,
    ALUFN: "A|B",
    PCSEL: 0,
    RA2SEL: null,
    ASEL: 0,
    BSEL: 1,
    WDSEL: 1,
    MWR: 0,
    MOE: null,
    WERF: 1,
  },
  XORC: {
    opcode: 58,
    af: 19,
    mf: 52,
    ALUFN: "A^B",
    PCSEL: 0,
    RA2SEL: null,
    ASEL: 0,
    BSEL: 1,
    WDSEL: 1,
    MWR: 0,
    MOE: null,
    WERF: 1,
  },
  SHLC: {
    opcode: 60,
    af: 19,
    mf: 52,
    ALUFN: "A<<B",
    PCSEL: 0,
    RA2SEL: null,
    ASEL: 0,
    BSEL: 1,
    WDSEL: 1,
    MWR: 0,
    MOE: null,
    WERF: 1,
  },
  SHRC: {
    opcode: 61,
    af: 19,
    mf: 52,
    ALUFN: "A>>B",
    PCSEL: 0,
    RA2SEL: null,
    ASEL: 0,
    BSEL: 1,
    WDSEL: 1,
    MWR: 0,
    MOE: null,
    WERF: 1,
  },
  SRAC: {
    opcode: 62,
    af: 19,
    mf: 52,
    ALUFN: "A>>>B",
    PCSEL: 0,
    RA2SEL: null,
    ASEL: 0,
    BSEL: 1,
    WDSEL: 1,
    MWR: 0,
    MOE: null,
    WERF: 1,
  },
};

const registerSymbols = [];
for (let i = 0; i <= 31; i++) {
  const symbol = Symbol(`R${i}`);
  registerSymbols.push(symbol);
  jsep.addLiteral(`R${i}`, symbol);
}
jsep.addLiteral("BP", registerSymbols[27]);
jsep.addLiteral("LP", registerSymbols[28]);
jsep.addLiteral("SP", registerSymbols[29]);
jsep.addLiteral("XP", registerSymbols[30]);

const FSLSH_CODE = 47; // /
const ASTSK_CODE = 42; // *
const PIPE_CODE = 124; // |
const LF_CODE = 10;
const jsep_plugin: IPlugin = {
  name: "beta-asm-extra",
  init() {
    jsep.hooks.add("gobble-spaces", function gobbleComment() {
      if (this.code === FSLSH_CODE) {
        let ch = this.expr.charCodeAt(this.index + 1);
        if (ch === FSLSH_CODE) {
          // '//': read to end of line/input
          this.index += 1;
          while (ch !== LF_CODE && !isNaN(ch)) {
            ch = this.expr.charCodeAt(++this.index);
          }
          this.gobbleSpaces();
        } else if (ch === ASTSK_CODE) {
          // read to */ or end of input
          this.index += 2;
          while (!isNaN(ch)) {
            ch = this.expr.charCodeAt(this.index++);
            if (ch === ASTSK_CODE) {
              ch = this.expr.charCodeAt(this.index++);
              if (ch === FSLSH_CODE) {
                this.gobbleSpaces();
                return;
              }
            }
          }

          // missing closing */
          this.throwError("Missing closing comment, */");
        }
      } else if (this.code === PIPE_CODE) {
        // '|': read to end of line/input
        let ch = this.expr.charCodeAt(this.index + 1);
        this.index += 1;
        while (ch !== LF_CODE && !isNaN(ch)) {
          ch = this.expr.charCodeAt(++this.index);
        }
        this.gobbleSpaces();
      }
    });
  },
};

`
LD(R31, n, R1)
LD(R31, r, R2) 

check_while:: CMPLT(R31, R1, R0)	| compute whether n > 0
BNE(R0, while_true, R31) | if R0 != 0, go to while_true
ST(R2, r, R31)			 | store the result to location 'r'
HALT()

while_true: MUL(R1, R2, R2) | r = r*n
SUBC(R1, 1, R1) 			| n = n-1
BEQ(R31, check_while, R31) 	| always go back to check_whiles
`;

`
todo: parsed object evaluation, dirty value, snap
`

jsep.plugins.register(jsepNumbers);
jsep.plugins.register(jsepAssignment);
jsep.plugins.register(jsep_plugin);
jsep.addIdentifierChar(":");

const HALT_OPCODE = instructionSet.HALT.opcode;

export function assemble(
  assemblyCode: string,
  buffer: ArrayBuffer = new ArrayBuffer(128),
  offset: number = 0,
  ensureHaltAtEnd: boolean = true,
  littleEndian: boolean = false
) {
  console.log("Assembling code...", assemblyCode);
  function canBeUint16(number: number): boolean {
    return number >= -32768 && number <= 32767 && Number.isInteger(number);
  }

  if (offset < 0 || offset >= buffer.byteLength) {
    throw new Error("Offset is out of the ArrayBuffer bounds");
  }

  let parsedAsm = jsep(assemblyCode);
  if (parsedAsm.type !== "Compound") {
    parsedAsm = {
      type: "Compound",
      body: [parsedAsm],
    };
  }

  const instructionArray: number[] = [];
  for (const statement of (parsedAsm as Compound).body) {
    if (statement.type === "CallExpression") {
      if ((statement as CallExpression).callee.type === "Identifier") {
        const callee = (
          (statement as CallExpression).callee.name as string
        ).toUpperCase();
        if (instructionSet.hasOwnProperty(callee)) {
          let instruction = 0;
          let params = [0, 0, 0, 0];
          instruction =
            instructionSet[callee as keyof typeof instructionSet].opcode << 26;
          let args = (statement as CallExpression).arguments;
          if (
            instructionSet[callee as keyof typeof instructionSet].af !== null
          ) {
            instructionSet[callee as keyof typeof instructionSet].af
              ?.toString(4)
              .split("")
              .forEach((bit, index) => {
                if (args.length <= index) {
                  throw new Error(
                    `Not enough arguments for instruction ${callee}`
                  );
                }
                if (args[index].type === "Literal") {
                  switch (typeof args[index].value) {
                    case "number":
                      if (bit === "0") {
                        if (canBeUint16(args[index].value as number)) {
                          //   instruction |=
                          //     (args[index].value as number) << (cursor -= 16);
                          params[0] = args[index].value as number;
                        } else {
                          throw new Error(
                            `Argument ${index} must be a 16-bit two complement integer for instruction ${callee}`
                          );
                        }
                      } else {
                        throw new Error(
                          `Argument ${index} must be a register for instruction ${callee}`
                        );
                      }
                      break;
                    case "symbol":
                      if (bit === "0") {
                        throw new Error(
                          `Argument ${index} must be a literal for instruction ${callee}`
                        );
                      } else {
                        params[parseInt(bit)] = parseInt(
                          (
                            (args[index].value as symbol).description as string
                          ).split("R")[1]
                        );
                      }
                      break;
                    default:
                      throw new Error(
                        `Argument ${index} must be a literal or register`
                      );
                  }
                } else {
                  throw new Error(`Argument ${index} must be a jsep Literal`);
                }
              });
          }
          let cursor = 26;
          instructionSet[callee as keyof typeof instructionSet].mf
            ?.toString(4)
            .split("")
            .forEach((bit) => {
              if (cursor < 0) {
                throw new Error(
                  `Too many arguments for instruction ${callee} (This could also be an interal error)`
                );
              }
              if (bit === "0") {
                instruction |= params[0] << (cursor -= 16);
              } else {
                instruction |= params[parseInt(bit)] << (cursor -= 5);
              }
            });
          instructionArray.push(instruction);
        } else {
          throw new Error(
            `Unknown instruction: ${(statement as CallExpression).callee.name}`
          );
        }
      } else {
        throw new Error(
          `Only Identifier is accepted, but ${statement.type} was provided`
        );
      }
    } else {
      throw new Error(
        `Only CallExpression is accepted, but ${statement.type} was provided`
      );
    }
  }

  if (instructionArray[instructionArray.length - 1] !== HALT_OPCODE << 26) {
    if (ensureHaltAtEnd) {
      instructionArray.push(HALT_OPCODE << 26);
    } else {
      throw new Error(
        "Last instruction must be HALT or otherwise would cause emulator to run indefinitely"
      );
    }
  }

  if (buffer.byteLength < offset + instructionArray.length * 4) {
    throw new Error("Memory is too small to hold all instructions");
  } else {
    const instructionData = new DataView(buffer);
    for (let i = 0; i < instructionArray.length; i++) {
      instructionData.setUint32(
        offset + i * 4,
        instructionArray[i],
        littleEndian
      );
    }
  }
  return buffer;
}

function executeALUFN(A: number, B: number, alufn: string): number {
  switch (alufn) {
    case "A+B": {
      const result = (A + B) | 0;
      if ((A > 0 && B > 0 && result < 0) || (A < 0 && B < 0 && result >= 0)) {
        console.log("Arithmetic overflow in addition");
      }
      return result;
    }
    case "A-B": {
      const result = (A - B) | 0;
      if ((A >= 0 && B < 0 && result < 0) || (A < 0 && B > 0 && result > 0)) {
        console.log("Arithmetic overflow in subtraction");
      }
      return result;
    }
    default:
      throw new Error(`Unknown ALUFN: ${alufn}`);
  }
}

function simulate(
  buffer: ArrayBuffer,
  programCounter: number = 0,
  registers: number[] = new Array(32).fill(0),
  maximumStep: number = 1000,
  littleEndian: boolean = false
) {
  function setRegisterValue(index: number, value: number): void {
    if (index < 0 || index > 31) {
      throw new Error("Register index out of bounds");
    }
    if (index != 31) {
      registers[index] = value;
    }
  }
  function getRegisterValue(index: number): number {
    if (index < 0 || index > 31) {
      throw new Error("Register index out of bounds");
    }
    if (index == 31) {
      return 0;
    }
    return registers[index];
  }

  if (registers.length !== 32) {
    throw new Error("Registers must have a length of 32");
  }

  function uint16ToTwosComplement(uint16: number): number {
    if (uint16 < 0 || uint16 > 0xffff) {
      throw new RangeError("Input is not a valid 16-bit unsigned integer");
    }
    if (uint16 & 0x8000) {
      return uint16 - 0x10000;
    }
    return uint16;
  }

  const memory = new DataView(buffer);
  const result: string[] = [];

  let pcpf = 0;
  let RA2SEL = 0;
  let RD1 = 0;
  let RD2 = 0;
  let A = 0;
  let B = 0;
  let ALUFN = "";
  let aluo = 0;

  let MWR = 0;
  let MOE = 0;
  let mWD = 0;
  let Adr = 0;
  let RD = 0;

  let rWD = 0;
  let WDSEL = 0;

  let WERF = 0;
  let WASEL = 0;

  let PCSEL = 0;
  let XP=null;

  let frames = [{
    flags: {
      z: {
        value: 0,
        dirty: true,
        description: null,
        focus: false,
      }
    },
    registers: Array(32).fill(0),
    buffer: new ArrayBuffer(128),
    mux: {
      pcsel: {
        value: 0,
        dirty: true,
        description: "PCSEL is set to 0 before the first instruction",
        focus: false,
      },
      wdsel: {
        value: 0,
        dirty: true,
        description: null,
        focus: false,
      },
      wasel: {
        value: 0,
        dirty: true,
        description: "Usually WASEl is set to 0 or N/A, unless an exception occurs",
        focus: false,
      },
      asel: {
        value: 0,
        dirty: true,
        description: null,
        focus: false,
      },
      ra2sel: {
        value: 0,
        dirty: true,
        description: null,
        focus: false,
      },
      bsel: {
        value: 0,
        dirty: true,
        description: null,
        focus: false,
      },
      reset: {
        value: 0,
        dirty: true,
        description: null,
        focus: false,
      }
    },
    gate: {
      nor: {
        value: 0,
        dirty: true,
        description: null,
        focus: false,
      },
    },
    cl: {
      alufn: {
        value: null,
        dirty: true,
        description: null,
        focus: false,
      },
      ra2sel: {
        value: 0,
        dirty: true,
        description: null,
        focus: false,
      },
      asel: {
        value: 0,
        dirty: true,
        description: null,
        focus: false,
      },
      bsel: {
        value: 0,
        dirty: true,
        description: null,
        focus: false,
      },
      wdsel: {
        value: 0,
        dirty: true,
        description: null,
        focus: false,
      },
      mwr: {
        value: 0,
        dirty: true,
        description: null,
        focus: false,
      },
      moe: {
        value: 0,
        dirty: true,
        description: null,
        focus: false,
      },
      werf: {
        value: 0,
        dirty: true,
        description: null,
        focus: false,
      }
    },
    path: {
      "alu-to-data-memory": {
        value: 0,
        dirty: true,
        description: null,
        focus: false,
      },
      "alu-to-wdsel": {
        value: 0,
        dirty: true,
        description: null,
        focus: false,
      },
      "asel-to-alu": {
        value: 0,
        dirty: true,
        description: null,
        focus: false,
      },
      "bsel-to-alu": {
        value: 0,
        dirty: true,
        description: null,
        focus: false,
      },
      "data-memory-to-wdsel": {
        value: 0,
        dirty: true,
        description: null,
        focus: false,
      },
      "instruction-memory-to-control-logic": {
        value: 0,
        dirty: true,
        description: null,
        focus: false,
      },
      "pc-to-instruction-memory": {
        value: 0,
        dirty: true,
        description: null,
        focus: false,
      },
      "pc-to-plus-four": {
        value: 0,
        dirty: true,
        description: null,
        focus: false,
      },
      "plus-four-to-wdsel": {
        value: 0,
        dirty: true,
        description: null,
        focus: false,
      },
      "ra2sel-to-register-file": {
        value: 0,
        dirty: true,
        description: null,
        focus: false,
      },
      "register-file-to-bsel": {
        value: 0,
        dirty: true,
        description: null,
        focus: false,
      },
      "register-file-to-data-memory": {
        value: 0,
        dirty: true,
        description: null,
        focus: false,
      },
      "reset-to-pc": {
        value: 0,
        dirty: true,
        description: null,
        focus: false,
      },
      "wasel-to-register-file": {
        value: 0,
        dirty: true,
        description: null,
        focus: false,
      },
      "wdsel-to-register-file": {
        value: 0,
        dirty: true,
        description: null,
        focus: false,
      }
    }
  }];

  frames[0].path["register-file-to-bsel"]

  for (let step = 0; step <= maximumStep; step += 1) {
    // Fetch
    console.log("\n#Fetch#");
    console.log(
      "Program Counter:",
      "0x" + programCounter.toString(16),
      programCounter
    );
    pcpf = programCounter + 4;
    console.log("PC+4:", "0x" + pcpf.toString(16), pcpf);
    const instruction = memory.getUint32(programCounter, littleEndian);
    console.log("Raw instruction in decimal:", instruction);
    console.log(
      "Raw instruction in binary:",
      instruction.toString(2).padStart(32, "0")
    );
    const opcode = instruction >>> 26;
    console.log("Opcode:", opcode.toString(2).padStart(6, "0"));
    if (opcode === HALT_OPCODE) {
      console.log("Halt opcode detected, stopping simulation");
      break;
    }
    // Decode
    console.log("\n#Decode#");
    for (const [key, value] of Object.entries(instructionSet)) {
      if (value.opcode === opcode) {
        console.log(
          "Instruction found for opcode " + opcode.toString(2) + ":",
          key
        );

        let params = [0, 0, 0, 0]; // [literal, Ra, Rb, Rc]
        if (value.mf != null) {
          let cursor = 26;
          value.mf
            ?.toString(4)
            .split("")
            .forEach((bit, index) => {
              if (cursor < 0) {
                throw new Error(
                  `Too many arguments for instruction ${key} (This could also be an interal error)`
                );
              }
              if (bit === "0") {
                params[0] = uint16ToTwosComplement(
                  (instruction >>> (cursor -= 16)) & 0xffff
                );
                console.log("Parameter", index, "Literal:", params[0]);
              } else {
                params[parseInt(bit)] =
                  (instruction >>> (cursor -= 5)) & 0b11111;
                switch (bit) {
                  case "1":
                    console.log(
                      "Parameter",
                      index,
                      "Ra:",
                      "R" + params[parseInt(bit)]
                    );
                    break;
                  case "2":
                    console.log(
                      "Parameter",
                      index,
                      "Rb:",
                      "R" + params[parseInt(bit)]
                    );
                    break;
                  case "3":
                    console.log(
                      "Parameter",
                      index,
                      "Rc:",
                      "R" + params[parseInt(bit)]
                    );
                    break;

                  default:
                    break;
                }
              }
            });
        }

        RD1 = getRegisterValue(params[1]);
        console.log(
          "[MUX]",
          "RD1=Ra=R" + params[1],
          "with current value",
          getRegisterValue(params[1])
        );
        console.log("[CU signal]", "RA2SEL:", RA2SEL);
        switch (value.RA2SEL) {
          case 0:
            RA2SEL = 0;
            RD2 = getRegisterValue(params[2]);
            console.log(
              "[MUX]",
              "RD2=Rb=R" + params[2],
              "with current value",
              getRegisterValue(params[2])
            );
            break;
          case 1:
            RA2SEL = 1;
            RD2 = getRegisterValue(params[3]);
            console.log(
              "[MUX]",
              "RD2=Rc=R" + params[3],
              "with current value",
              getRegisterValue(params[3])
            );
            break;
          default:
            console.log(
              "[MUX]",
              "RD2 not selected, use dirty value",
              RD2,
              "from previous instruction"
            );
            break;
        }

        // Execute
        console.log("\n#Execute#");
        console.log("[CU signal]", "ASEL:", value.ASEL);
        switch (value.ASEL) {
          case 0:
            A = RD1;
            console.log("[MUX]", "A=RD1=" + A);
            break;
          case 1:
            A = pcpf + params[0] * 4;
            console.log("[MUX]", "A=(PC+4)+4*SXT(C)" + A);
            break;
          default:
            console.log(
              "[MUX]",
              "A not selected, use dirty value",
              A,
              "from previous instruction"
            );
            break;
        }

        console.log("[CU signal]", "BSEL:", value.BSEL);
        switch (value.BSEL) {
          case 0:
            B = RD2;
            console.log("[MUX]", "B=RD2=" + B);
            break;
          case 1:
            B = params[0];
            console.log("[MUX]", "B=Literal=" + B);
            break;
          default:
            console.log(
              "[MUX]",
              "B not selected, use dirty value",
              B,
              "from previous instruction"
            );
            break;
        }

        if (value.ALUFN != null) {
          ALUFN = value.ALUFN;
          console.log("Excute ALUFN:", ALUFN);
        } else {
          console.log(
            "[MUX]",
            "ALUFN not selected, use dirty value",
            ALUFN,
            "from previous instruction"
          );
        }

        aluo = executeALUFN(A, B, ALUFN); //todo: ensure the output is two complement
        console.log("ALU output:", aluo);

        console.log("\n#Memory#");
        mWD = RD2;
        Adr = aluo;
        switch (value.MWR) {
          case 0:
            MWR = 0;
            console.log("MWR==0, no memory write");
            break;
          case 1:
            MWR = 1;
            console.log("MWR==1, memory write");
            break;
          default:
            console.log(
              "MWR not selected, use dirty value",
              MWR,
              "from previous instruction"
            );
            break;
        }

        if (MWR == 1) {
          console.log("Write data", mWD, " to memory address:", Adr);
          memory.setUint32(Adr, mWD, littleEndian); // todo: ensure the output is two complement
        }

        switch (value.MOE) {
          case 0:
            MOE = 0;
            console.log("MWR==0, no memory read");
            break;
          case 1:
            MOE = 1;
            console.log("MWR==1, memory read");
            break;
          default:
            console.log(
              "MOE not selected, use dirty value",
              MOE,
              "from previous instruction"
            );
            break;
        }

        if (MOE == 1) {
          RD = uint16ToTwosComplement(memory.getUint32(Adr, littleEndian));
          console.log("Read data", RD, " from memory address:", Adr);
        }

        console.log("\n#Write Back#");
        console.log("[CU signal]", "WDSEL:", value.WDSEL);
        if (value.WDSEL != null) {
          WDSEL = value.WDSEL;
          console.log("[MUX]", "WDSEL=" + WDSEL);
        } else {
          console.log(
            "[MUX]",
            "WDSEL not selected, use dirty value",
            WDSEL,
            "from previous instruction"
          );
        }
        switch (WDSEL) {
          case 0:
            rWD = pcpf;
            console.log("[MUX]", "rWD=(PC+4)=" + rWD);
            break;
          case 1:
            rWD = aluo;
            console.log("[MUX]", "rWD=ALU output=" + rWD);
            break;
          case 2:
            rWD = RD;
            console.log("[MUX]", "rWD=RD(memory read)=" + rWD);
            break;
          default:
            console.log(
              "[MUX]",
              "rWD not selected, use dirty value",
              rWD,
              "from previous instruction"
            );
            break;
        }



        if (value.WERF != null) {
            WERF = value.WERF;
            console.log("WERF=" + WERF);
          } else {
            console.log(
              "WERF not selected, use dirty value",
              WERF,
              "from previous instruction"
            );
          }
          switch (WERF) {
            case 0:
              console.log("No register write back");
              break;
            case 1:
            // Currently, ignore XP
              console.log("Write value",rWD,"to register","R"+params[3]);
              setRegisterValue(params[3], rWD);
              break;

            default:
              console.log(
                "WERF not selected, use dirty value",
                WERF,
                "from previous instruction"
              );
              break;
          }
          console.log("\n\n");



        programCounter = pcpf;
        break;
      } else {
        console.log("No instruction found for opcode " + opcode.toString(2));
        XP=programCounter;
        // PCSEL=3;
      }
    }
  }
  return result;
  // todo: XP, Z, WASEL after the exam :(
}

// let asm = `
// ADDC(R31, 6, R1) | 6
// SUBC(R31, 18, R2) | -18
// ADD(R1, R2, R3) | write R1+R2 to R3
// HALT()
// `;

// let asmed = assemble(asm);
// console.log(asmed);
// console.log(simulate(asmed, 0));
