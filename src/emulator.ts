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
    description: "Halts the processor",
  },
  LD: {
    opcode: 24,
    af: 19,
    mf: 52,
    ALUFN: "A+B",
    PCSEL: 0,
    RA2SEL: 0,
    WASEL: 0,
    ASEL: 0,
    BSEL: 1,
    WDSEL: 2,
    MWR: 0,
    MOE: 1,
    WERF: 1,
    description: "Loads a value from memory into a register",
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
    description: "Stores the value from a register into memory at the specified address",
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
    description: "Sets the program counter to the specified address for an unconditional jump",
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
    description: "Branches to the specified address if the values in the two registers are equal.",
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
    description: "Branches to the specified address if the values in the two registers are not equal",
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
    description: "Loads a value from memory at the address specified by the base register plus an offset into the destination register",
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
    description: "write {Ra} + {Rb} to {Rc}",
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
    description: "write {Ra} - {Rb} to {Rc}",
  },
  MUL: {
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
    description: "write {Ra} * {Rb} to {Rc}"
  },
  DIV: {
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
    description: "write {Ra} / {Rb} to {Rc}"
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
    description: "Write 1 to {Rc} if {Ra} is equal to {Rb}, otherwise write 0 to {Rc}"
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
    description: "Write 1 to {Rc} if {Ra} is less than {Rb}, otherwise write 0 to {Rc}",
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
    description: "Write 1 to {Rc} if {Ra} is less than or equal to {Rb}, otherwise write 0 to {Rc}",
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
    description: "Write the bitwise AND of {Ra} and {Rb} to {Rc}",
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
    description: "Write the bitwise OR of {Ra} and {Rb} to {Rc}",
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
    description: "Write the bitwise XOR of {Ra} and {Rb} to {Rc}",
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
    description: "Shift {Ra} left by the number of bits specified in {Rb} and write to {Rc}",
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
    description: "Shift {Ra} right logically by the number of bits specified in {Rb} and write to {Rc}",
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
    description: "Shift {Ra} right arithmetically by the number of bits specified in {Rb} and write to {Rc}",
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
    description: "Write {Ra} + {literal} to {Rc}"
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
    description: "Write {Ra} - {literal} to {Rc}"
  },
  MULC: {
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
    description: "Write {Ra} * {literal} to {Rc}"
  },
  DIVC: {
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
    description: "Write {Ra} / {literal} to {Rc}"
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
    description: "Write 1 to {Rc} if {Ra} is equal to {literal}, otherwise write 0 to {Rc}"
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
    description: "Write 1 to {Rc} if {Ra} is less than {literal}, otherwise write 0 to {Rc}"
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
    description: "Write 1 to {Rc} if {Ra} is less than or equal to {literal}, otherwise write 0 to {Rc}",
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
    description: "Write the bitwise AND of {Ra} and {literal} to {Rc}"
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
    description: "Write the bitwise OR of {Ra} and {literal} to {Rc}"
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
    description: "Write the bitwise XOR of {Ra} and {literal} to {Rc}",
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
    description: "Shift {Ra} left by the number of bits specified in {literal} and write to {Rc}"
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
    description: "Shift {Ra} right logically by the number of bits specified in {literal} and write to {Rc}",
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
    description: "Shift {Ra} right arithmetically by the number of bits specified in {literal} and write to {Rc}",
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

function evaluate(expression: any): any {
  return expression;
  console.log(expression);
  if (Array.isArray(expression)) {
    return expression.map(evaluate);
  }
  switch (expression.type) {
    case "Literal":
      return expression.value;
    case "UnaryExpression":
      if (expression.operator === "-" && expression.prefix) {
        return -evaluate(expression.argument);
      }
      return evaluate(expression.argument);
    case "Compound":
      return expression.body.map(evaluate);
    case "CallExpression":
      return {
        ...expression,
        arguments: expression.arguments.map(evaluate),
      };
    default:
      return expression;
  }
}

export function assemble(
  assemblyCode: string,
  buffer: ArrayBuffer = new ArrayBuffer(128),
  offset: number = 0,
  ensureHaltAtEnd: boolean = true,
  littleEndian: boolean = false
) {
  function canBeUint16(number: number): boolean {
    return number >= -32768 && number <= 32767 && Number.isInteger(number);
  }

  if (offset < 0 || offset >= buffer.byteLength) {
    throw new Error("Offset is out of the ArrayBuffer bounds");
  }

  let parsedAsm = evaluate(jsep(assemblyCode));
  console.log(parsedAsm)
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
    case "A*B": {
      const result = (A * B) | 0;
      if (A !== 0 && B !== 0 && (result / A !== B)) { 
        console.log("Arithmetic overflow in multiplication");
      }
      return result;
    }
    case "A/B": {
      if (B === 0) {
        console.log("Division by zero is an error."); // todo: 到这一步才应该把WASEl设置为1
        return 0;
      }
      const result = (A / B) | 0; 
      return result;
    }
    case "A&B": {
      const result = A & B;
      return result;
    }
    case "A|B": {
      const result = A | B;
      return result;
    }
    case "A^B": {
      return A ^ B;
    }
    case "A": {
      return A; // 直接返回 A
    }
    case "A<<B": { // Logical Shift Left
      return (A << B) | 0;
    }
    case "A>>B": { // Logical Shift Right
      return (A >>> B) | 0;
    }
    case "A>>>B": { // Arithmetic Shift Right
      return (A >> B) | 0;
    }
    case "A==B": {
      return A === B ? 1 : 0;
    }
    case "A<B": {
      return A < B ? 1 : 0;
    }
    case "A<=B": {
      return A <= B ? 1 : 0;
    }
    default:
      throw new Error(`Unknown ALUFN: ${alufn}`);
  }
}

export function simulate(
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

  function ensureTwoComplement(aluOutput: number): number {
    // 限制为 32 位范围
    const maskedOutput = aluOutput & 0xFFFF;
  
    // 如果最高位为 1，表示负数，转换为 two's complement
    if (maskedOutput & 0x8000) {
      return maskedOutput; // 处理负数
    }
  
    return maskedOutput; // 正数直接返回
  }
  

  const memory = new DataView(buffer);
  // const result: string[] = [];

  let pcpf = 0;
  let RA2SEL = 0;
  let RD1 = 0;
  let RD2 = 0;
  let A = 0;
  let B = 0;
  let ALUFN = "";
  let aluo = 0;
  let JT = 0;

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
  let XP = 0;

  let frames = [{
    offsetOfInstruction: -2, // 目前正在运行的这条指令本身的位置
    titleOfInstruction: "Reset",
    descriptionOfInstruction: "initial state of processor",
    iconOfInstruction: "reset", // 暂时都用cog就行
    titleOfStep: "The system is reset. All registers and values are set to zero.",
    descriptionOfStep:
      "Reminder: This version of processer is still in development, some bugs or issues may occur.",
    iconOfStep: "reset", // 花里胡哨的图标，从https://blueprintjs.com/docs/#icons/icons-list 里面找你觉得能对应上的
    exception: false, // 这一步是否运行出错，error handle不会exception，只有没找到对应的instruction或者除以0的时候这个会变成true
    exitingDueToException: false, // 是不是在进行error handle的部分
    flags: {
      z: {
        value: 0,
        dirty: true,
        description: null,
        focus: false,
      }
    },
    registers: Array(32).fill(0),
    buffer: buffer,
    programCounter: 0, // 当前的PC，在没有jump和error handle的情况下应该和offsetOfInstruction相同
    mux: {
      pcsel: {
        value: 0,
        dirty: true,
        description: "Usually PCSEL is set to 0, selecting PC + 4, unless a branch or jump occurs.",
        focus: false,
      },
      wdsel: {
        value: 0,
        dirty: true,
        description: "Usually WDSEL is set to 0 or N/A, unless an exception or special instruction requires writing to PC.",
        focus: false,
      },
      wasel: {
        value: 0,
        dirty: true,
        description: "Usually WASEL is set to 0 or N/A, unless an exception occurs",
        focus: false,
      },
      asel: {
        value: 0,
        dirty: true,
        description: "Usually ASEL is set to 0, selecting RD1 as the source for A, unless a branch/jump requires using PC + 4 + 4 * SXT(C).",
        focus: false,
      },
      ra2sel: {
        value: 0,
        dirty: true,
        description: "Usually RA2SEL is set to 0 or 1, unless an exception occurs",
        focus: false,
      },
      bsel: {
        value: 0,
        dirty: true,
        description: "Usually BSEL is set to 0, selecting RD2 as the source for B, unless an immediate value is required (in which case BSEL = 1).",
        focus: false,
      },
      reset: {
        value: 0,
        dirty: true,
        description: "Usually reset is set to 0, with no reset behavior, unless a reset signal is triggered by an external event.",
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
          description:
            "Usually ALUFN is set to N/A, unless a specific ALU operation (ADD, SUB, etc.) is required by the instruction.",
          focus: false,
        },
        ra2sel: {
          value: 0,
          dirty: true,
          description:
            "Usually RA2SEL is set to 0 or 1, unless an exception occurs",
          focus: false,
        },
        asel: {
          value: 0,
          dirty: true,
          description:
            "Usually ASEL is set to 0, selecting RD1 as the source for A, unless a branch/jump requires using PC + 4 + 4 * SXT(C).",
          focus: false,
        },
        bsel: {
          value: 0,
          dirty: true,
          description:
            "Usually BSEL is set to 0, selecting RD2 as the source for B, unless an immediate value is required.",
          focus: false,
        },
        wdsel: {
          value: 0,
          dirty: true,
          description:
            "Usually WDSEL is set to 0 or N/A, unless an exception or special instruction requires writing to PC.",
          focus: false,
        },
        mwr: {
          value: 0,
          dirty: true,
          description:
            "Usually MWR is set to 0, meaning no memory write occurs, unless the instruction specifies writing data to memory.",
          focus: false,
        },
        moe: {
          value: 0,
          dirty: true,
          description:
            "Usually MOE is set to 0, meaning no memory read occurs, unless the instruction requires reading from memory.",
          focus: false,
        },
        werf: {
          value: 0,
          dirty: true,
          description:
            "Usually WERF is set to 0, meaning no register write occurs, unless the instruction specifies writing data to a register.",
          focus: false,
        },
        wasel: {
          value: 0,
          dirty: true,
          description: "Usually WASEL is set to 0 or N/A, unless an exception occurs.",
          focus: false,
        },
        pcsel: {
          value: 0,
          dirty: true,
          description: "Usually PCSEL is set to 0, selecting PC + 4, unless a branch or jump occurs.",
          focus: false,
        },
        xp: {
          value: 0,
          dirty: true,
          description: "Usually XP is set to 0, meaning no exception processing occurs. XP is only set to 1 when the processor encounters an exception that requires special handling.",
          focus: false,
        },
        jt: {
          value: 0,
          dirty: true,
          description:  "Usually JT is set to 0, meaning the processor does not jump to a target address. JT is set to 1 when the instruction specifies a jump to a specific memory address.",
          focus: false,
        }
      },
      path: {
        "alu-to-data-memory": {
          value: 0,
          dirty: true,
          description: "",
          focus: false,
        },
        "alu-to-wdsel": {
          value: 0,
          dirty: true,
          description: "",
          focus: false,
        },
        "asel-to-alu": {
          value: 0,
          dirty: true,
          description: "",
          focus: false,
        },
        "bsel-to-alu": {
          value: 0,
          dirty: true,
          description: "",
          focus: false,
        },
        "data-memory-to-wdsel": {
          value: 0,
          dirty: true,
          description: "",
          focus: false,
        },
        "instruction-memory-to-control-logic": {
          value: 0,
          dirty: true,
          description: "The instruction fetched from memory is passed to the control logic for decoding.",
          focus: false,
        },
        "pc-to-instruction-memory": {
          value: 0,
          dirty: true,
          description: "",
          focus: false,
        },
        "pc-to-plus-four": {
          value: 0,
          dirty: true,
          description: "",
          focus: false,
        },
        "plus-four-to-wdsel": {
          value: 0,
          dirty: true,
          description: "The value of PC + 4 is passed to the wdsel signal, typically used to update the PC.",
          focus: false,
        },
        "ra2sel-to-register-file": {
          value: 0,
          dirty: true,
          description: "RA2SEL selects the second operand from the register file during decoding.",
          focus: false,
        },
        "register-file-to-bsel": {
          value: 0,
          dirty: true,
          description: "The second operand (RD2) is read from the register file.",
          focus: false,
        },
        "register-file-to-data-memory": {
          value: 0,
          dirty: true,
          description: "",
          focus: false,
        },
        "pcsel-to-reset": {
          value: 0,
          dirty: true,
          description: "PCSEL determines whether the program counter is reset or updated.",
          focus: false,
        },
        "reset-to-pc": {
          value: 0,
          dirty: true,
          description: "",
          focus: false,
        },
        "wasel-to-register-file": {
          value: 0,
          dirty: true,
          description: "",
          focus: false,
        },
        "wdsel-to-register-file": {
          value: 0,
          dirty: true,
          description: "",
          focus: false,
        },
        "register-file-to-asel": {
          value: 0,
          dirty: true,
          description: "",
          focus: false,
        },
        "instruction-memory-to-wasel": {
          value: 0,
          dirty: true,
          description: "",
          focus: false,
        },
        "instruction-memory-to-bsel": {
          value: 0,
          dirty: true,
          description: "The instruction determines whether BSEL selects an immediate value or RD2.",
          focus: false,
        },
        "plus-four-to-pcsel": {
          value: 0,
          dirty: true,
          description: "",
          focus: false,
        },"plus-to-pcsel": {
          value: 0,
          dirty: true,
          description: "",
          focus: false,
        },"instruction-memory-to-ra2sel-as-rc": {
          value: 0,
          dirty: true,
          description: "RA2SEL is set based on the instruction, selecting the target register Rc.",
          focus: false,
        },"instruction-memory-to-ra2sel-as-rb": {
          value: 0,
          dirty: true,
          description: "RA2SEL is set based on the instruction, selecting the source register Rb.",
          focus: false,
        },
        "instruction-memory-to-register-file": {
          value: 0,
          dirty: true,
          description: "The instruction specifies which register to read or write.",
          focus: false,
        },"plus-to-asel": {
          value: 0,
          dirty: true,
          description: "",
          focus: false,
        },
    },
  }];

  // frames.pop()

  function resetFocus(previousFrame: Record<string, any>): void {
  // reset上一帧的focus 在每一个mux这种前面使用一次
    if (!previousFrame) return;

    for (const Key in previousFrame.mux) {
        if (previousFrame.mux[Key]) {
            previousFrame.mux[Key].focus = false;
        }
    }
    for (const Key in previousFrame.cl) {
        if (previousFrame.cl[Key]) {
            previousFrame.cl[Key].focus = false;
        }
    }
    for (const Key in previousFrame.flags) {
      if (previousFrame.flags[Key]) {
        previousFrame.flags[Key].focus = false;
      }
    }
    for (const Key in previousFrame.path) {
      if (previousFrame.path[Key]) {
        previousFrame.path[Key].focus = false;
      }
    }
  }


  // const initialFrame = frames[0];
  for (let step = 0; step <= maximumStep; step += 1) {
    // Fetch
    console.log("\n#Fetch#");
    const newFrame = structuredClone(frames[0]);

    if (frames.length > 0) {
      newFrame.registers = structuredClone(frames[frames.length - 1].registers);
    }
    newFrame.buffer = structuredClone(buffer);
    
    if (frames.length > 0) {
      resetFocus(frames[frames.length - 1]);
    }
    newFrame.offsetOfInstruction = programCounter;

    newFrame.mux.pcsel.focus = true;
    newFrame.titleOfStep = "Fetch: Read instruction from memory";
    newFrame.descriptionOfStep = "Read the instruction from the memory at the address specified by the program counter.";
    newFrame.iconOfStep = "archive"
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
    let instructionDetails = Object.values(instructionSet).find(
      (inst) => inst.opcode === opcode
    );

    if (instructionDetails) {
      switch (instructionDetails.opcode) {
        case 24: // LD
        newFrame.titleOfInstruction = "LD(Ra, offset)";
        newFrame.iconOfInstruction = "cog";
        break;
      case 25: // ST
        newFrame.titleOfInstruction = "ST(Ra, offset)";
        newFrame.iconOfInstruction = "cog";
        break;
      case 27: // JMP
        newFrame.titleOfInstruction = "JMP(address)";
        newFrame.iconOfInstruction = "cog";
        break;
      case 29: // BEQ
        newFrame.titleOfInstruction = "BEQ(Ra, Rb, address)";
        newFrame.iconOfInstruction = "cog";
        break;
      case 30: // BNE
        newFrame.titleOfInstruction = "BNE(Ra, Rb, address)";
        newFrame.iconOfInstruction = "cog";
        break;
      case 31: // LDR
        newFrame.titleOfInstruction = "LDR(Ra, Rb, offset)";
        newFrame.iconOfInstruction = "cog";
        break;
      case 32: // ADD
        newFrame.titleOfInstruction = "ADD(Ra, Rb, Rc)";
        newFrame.iconOfInstruction = "cog";
        break;
      case 33: // SUB
        newFrame.titleOfInstruction = "SUB(Ra, Rb, Rc)";
        newFrame.iconOfInstruction = "cog";
        break;
      case 34: // MUL
        newFrame.titleOfInstruction = "MUL(Ra, Rb, Rc)";
        newFrame.iconOfInstruction = "cog";
        break;
      case 35: // DIV
        newFrame.titleOfInstruction = "DIV(Ra, Rb, Rc)";
        newFrame.iconOfInstruction = "cog";
        break;
      case 36: // CMPEQ
        newFrame.titleOfInstruction = "CMPEQ(Ra, Rb, Rc)";
        newFrame.iconOfInstruction = "cog";
        break;
      case 37: // CMPLT
        newFrame.titleOfInstruction = "CMPLT(Ra, Rb, Rc)";
        newFrame.iconOfInstruction = "cog";
        break;
      case 38: // CMPLE
        newFrame.titleOfInstruction = "CMPLE(Ra, Rb, Rc)";
        newFrame.iconOfInstruction = "cog";
        break;
      case 40: // AND
        newFrame.titleOfInstruction = "AND(Ra, Rb, Rc)";
        newFrame.iconOfInstruction = "cog";
        break;
      case 41: // OR
        newFrame.titleOfInstruction = "OR(Ra, Rb, Rc)";
        newFrame.iconOfInstruction = "cog";
        break;
      case 42: // XOR
        newFrame.titleOfInstruction = "XOR(Ra, Rb, Rc)";
        newFrame.iconOfInstruction = "cog";
        break;
      case 44: // SHL
        newFrame.titleOfInstruction = "SHL(Ra, Rb, Rc)";
        newFrame.iconOfInstruction = "cog";
        break;
      case 45: // SHR
        newFrame.titleOfInstruction = "SHR(Ra, Rb, Rc)";
        newFrame.iconOfInstruction = "cog";
        break;
      case 46: // SRA
        newFrame.titleOfInstruction = "SRA(Ra, Rb, Rc)";
        newFrame.iconOfInstruction = "cog";
        break;
      case 48: // ADDC
        newFrame.titleOfInstruction = "ADDC(Ra, literal, Rc)";
        newFrame.iconOfInstruction = "cog";
        break;
      case 49: // SUBC
        newFrame.titleOfInstruction = "SUBC(Ra, literal, Rc)";
        newFrame.iconOfInstruction = "cog";
        break;
      case 50: // MULC
        newFrame.titleOfInstruction = "MULC(Ra, literal, Rc)";
        newFrame.iconOfInstruction = "cog";
        break;
      case 51: // DIVC
        newFrame.titleOfInstruction = "DIVC(Ra, literal, Rc)";
        newFrame.iconOfInstruction = "cog";
        break;
      case 52: // CMPEQC
        newFrame.titleOfInstruction = "CMPEQC(Ra, literal, Rc)";
        newFrame.iconOfInstruction = "cog";
        break;
      case 53: // CMPLTC
        newFrame.titleOfInstruction = "CMPLTC(Ra, literal, Rc)";
        newFrame.iconOfInstruction = "cog";
        break;
      case 54: // CMPLEC
        newFrame.titleOfInstruction = "CMPLEC(Ra, literal, Rc)";
        newFrame.iconOfInstruction = "cog";
        break;
      case 56: // ANDC
        newFrame.titleOfInstruction = "ANDC(Ra, literal, Rc)";
        newFrame.iconOfInstruction = "cog";
        break;
      case 57: // ORC
        newFrame.titleOfInstruction = "ORC(Ra, literal, Rc)";
        newFrame.iconOfInstruction = "cog";
        break;
      case 58: // XORC
        newFrame.titleOfInstruction = "XORC(Ra, literal, Rc)";
        newFrame.iconOfInstruction = "cog";
        break;
      case 60: // SHLC
        newFrame.titleOfInstruction = "SHLC(Ra, literal, Rc)";
        newFrame.iconOfInstruction = "cog";
        break;
      case 61: // SHRC
        newFrame.titleOfInstruction = "SHRC(Ra, literal, Rc)";
        newFrame.iconOfInstruction = "cog";
        break;
      case 62: // SRAC
        newFrame.titleOfInstruction = "SRAC(Ra, literal, Rc)";
        newFrame.iconOfInstruction = "cog";
        break;
      }
      newFrame.descriptionOfInstruction = instructionDetails.description;
    } 
    console.log("Opcode:", opcode.toString(2).padStart(6, "0"));

    let pcselDescription = "PCSEL default value is 0 (PC + 4)."
    let instructionFound = false;

    function clearPathStates(frame) {
      // 清理 path
      for (const key in frame.path) {
        frame.path[key].value = 0; // 黑色
        frame.path[key].dirty = false;
        frame.path[key].focus = false; // 非高亮状态
      }
    
      // 清理 cl 信号
      for (const key in frame.cl) {
        frame.cl[key].value = 0; // 重置控制信号的值
        frame.cl[key].dirty = false;
        frame.cl[key].focus = false;
      }
    
      // 清理 mux 信号
      for (const key in frame.mux) {
        frame.mux[key].value = 0; // 重置多路复用器的值
        frame.mux[key].dirty = false;
        frame.mux[key].focus = false;
      }
    }

    function updatePathsBasedOnInstruction(frame, instructionDetails, phase) {
      for (const pathKey in frame.path) {
        switch (phase) {
          case "fetch":
            switch (pathKey) {
              case "pc-to-instruction-memory":
                frame.path["pc-to-instruction-memory"].value = 1;
                frame.path["pc-to-instruction-memory"].dirty = false;
                frame.path["pc-to-instruction-memory"].focus = true;
                break;
              case "pc-to-plus-four":
                frame.path["pc-to-plus-four"].value = 1;
                frame.path["pc-to-plus-four"].dirty = false;
                frame.path["pc-to-plus-four"].focus = true;
                break;
              case "plus-four-to-wdsel":
                frame.path["plus-four-to-wdsel"].value = 1;
                frame.path["plus-four-to-wdsel"].dirty = false; // 逻辑参与但不确定
                frame.path["plus-four-to-wdsel"].focus = true;
                break;
              case "pcsel-to-reset":
                  frame.path["pcsel-to-reset"].value = 1;
                  frame.path["pcsel-to-reset"].dirty = false;
                
                frame.path["pcsel-to-reset"].focus = true;
                break;
              case "reset-to-pc":
                frame.path["reset-to-pc"].value = 1;
                frame.path["reset-to-pc"].dirty = false;
                frame.path["reset-to-pc"].focus = true;
                break;
              case "plus-four-to-pcsel":
                if (instructionDetails && instructionDetails.PCSEL !== null) {
                if (instructionDetails.PCSEL === 0) {
                  frame.path["plus-four-to-pcsel"].value = 1;
                  frame.path["plus-four-to-pcsel"].dirty = false;
                }
              }
                frame.path["plus-four-to-pcsel"].focus = true;
                break;
            }
            break;
    
          case "decode":
            switch (pathKey) {
              case "instruction-memory-to-control-logic":
                frame.path["instruction-memory-to-control-logic"].value = 1;
                frame.path["instruction-memory-to-control-logic"].dirty = false;
                frame.path["instruction-memory-to-control-logic"].focus = true;
                break;
              case "wasel-to-register-file":
                frame.path["wasel-to-register-file"].value = 1;
                frame.path["wasel-to-register-file"].dirty = false;
                frame.path["wasel-to-register-file"].focus = true;
                break;
              case "ra2sel-to-register-file":
                if (instructionDetails.RA2SEL != null) {
                  frame.path["ra2sel-to-register-file"].value = 1;
                  frame.path["ra2sel-to-register-file"].dirty = false;
              } 
                frame.path["ra2sel-to-register-file"].focus = true;
                break;
              case "instruction-memory-to-ra2sel-as-rc":
                if (instructionDetails.MWR === 1) {
                  frame.path["instruction-memory-to-ra2sel-as-rc"].value = 1;
                  frame.path["instruction-memory-to-ra2sel-as-rc"].dirty = false;
                } 
                frame.path["instruction-memory-to-ra2sel-as-rc"].focus = true;
                break;
              case "register-file-to-asel":
                if (instructionDetails.ASEL === 0) {
                  frame.path["register-file-to-asel"].value = 1;
                  frame.path["register-file-to-asel"].dirty = false;
                }
                frame.path["register-file-to-asel"].focus = true;
                break;
              case "instruction-memory-to-ra2sel-as-rb":
                if (instructionDetails.MWR !== 1) {
                  frame.path["instruction-memory-to-ra2sel-as-rb"].value = 1;
                  frame.path["instruction-memory-to-ra2sel-as-rb"].dirty = false;
                } 
                frame.path["instruction-memory-to-ra2sel-as-rb"].focus = true;
                break;
              case "register-file-to-bsel":
                if (instructionDetails.bsel === 0) {
                  frame.path["register-file-to-bsel"].value = 1;
                  frame.path["register-file-to-bsel"].dirty = false;
              } 
                frame.path["register-file-to-bsel"].focus = true;
                break;
              case "register-file-to-data-memory":
                if (instructionDetails.MWR === 1) {
                  frame.path["register-file-to-data-memory"].value = 1;
                  frame.path["register-file-to-data-memory"].dirty = false;
                }
                frame.path["register-file-to-data-memory"].focus = true;
                break;
              case "instruction-memory-to-bsel":
                if (instructionDetails.bsel === 1) {
                  frame.path["instruction-memory-to-bsel"].value = 1;
                  frame.path["instruction-memory-to-bsel"].dirty = false;
              } 
                frame.path["instruction-memory-to-bsel"].focus = true;
                break;
            }
            break;
    
          case "execute":
            switch (pathKey) {
              case "asel-to-alu":
                if (instructionDetails.ALUFN != null) {
                  frame.path["asel-to-alu"].value = 1;
                  frame.path["asel-to-alu"].dirty = false;
              } 
                frame.path["asel-to-alu"].focus = true;
                break;
              case "bsel-to-alu":
                if (instructionDetails.ALUFN != null) {
                    frame.path["bsel-to-alu"].value = 1;
                    frame.path["bsel-to-alu"].dirty = false;
                } 
                  frame.path["bsel-to-alu"].focus = true;
                  break;
              default:
                frame.path["bsel-to-alu"].focus = false;
                break;
            }
            break;
    
          case "memory":
            switch (pathKey) {
              case "alu-to-data-memory":
                if (instructionDetails.MWR === 1) {
                  frame.path["alu-to-data-memory"].value = 1;
                  frame.path["alu-to-data-memory"].dirty = false;
                } 
                  frame.path["alu-to-data-memory"].focus = true;
                break;
              case "data-memory-to-wdsel":
                if (instructionDetails.MOE === 1) {
                  frame.path["data-memory-to-wdsel"].value = 1;
                  frame.path["data-memory-to-wdsel"].dirty = false;
                }
                  frame.path["data-memory-to-wdsel"].focus = true;
                break;
            }
            break;
    
          case "writeBack":
            switch (pathKey) {
              case "wdsel-to-register-file":
                if (instructionDetails.MWR !== 1) {
                  frame.path["wdsel-to-register-file"].value = 1;
                  frame.path["wdsel-to-register-file"].dirty = false;

                }
                frame.path["wdsel-to-register-file"].focus = true;
            }
          break;
        }
      }
    }
    for (const [key, value] of Object.entries(instructionSet)) {
      
      clearPathStates(newFrame);
      if (value.opcode === opcode) {
        newFrame.titleOfInstruction = `${key}`;
        newFrame.descriptionOfInstruction = value.description;
        instructionFound = true;
        break;
      }
      if (value.PCSEL === null) {
        PCSEL = 0;
        newFrame.mux.pcsel.value = 0;
      } else if (Array.isArray(value.PCSEL)) {
        const condition = RD1 === RD2;
        newFrame.mux.pcsel.value = condition ? value.PCSEL[1] : value.PCSEL[0];
        PCSEL = condition ? value.PCSEL[1] : value.PCSEL[0];
        pcselDescription = `PCSEL is set to ${newFrame.mux.pcsel.value}, selecting ${condition ? "branch target" : "PC + 4 + SXT"}`;
        //branch if equal to 1
      } else {
        newFrame.mux.pcsel.value = value.PCSEL;
        switch (value.PCSEL) {
          case 0:
            PCSEL = 0;
            pcselDescription = "PCSEL is set to 0 to select PC + 4 as the next program counter value. This is the default behavior, where the program continues to the next instruction";
            break;
          case 1:
            PCSEL = 1;
            pcselDescription = "PCSEL is set to 1 to select the branch target address. This is used for BEQ/BNE instructions. When a branch instruction is executed, the PC is changed to a calculated branch target, using the offset provided by the instruction."
            break;
          case 2:
            PCSEL = 2;
            pcselDescription = "PCSEL is set to 2 to select the jump target address. This is used in unconditional jump instructions. When a jump is executed, PCSEL switches to 2 to select the jump target, overriding the normal PC + 4.";
            break;
          default:
            pcselDescription = `PCSEL is set to an unknown value (${value.PCSEL}).`;
            break;
        }
      }
    }

    if (!instructionFound) {
      newFrame.titleOfInstruction = "Unknown Instruction";
      newFrame.descriptionOfInstruction = "No description available for this instruction.";
      newFrame.exception = true; // error
      XP = programCounter;

      newFrame.cl.xp.value = 1;
      newFrame.cl.xp.dirty = false;
      newFrame.cl.xp.description = `Exception triggered. Stored current PC (0x${programCounter.toString(16)}) as Exception Program Counter.`;
      
      // pcsel = 3 (XP)
      PCSEL = 3;
      newFrame.cl.pcsel.value = 1;
      newFrame.cl.pcsel.dirty = false;
      newFrame.cl.pcsel.description = "PCSEL is set to 3, redirecting to exception handler.";
  
      // WASEL = 1 处理xp
      WASEL = 1;
      newFrame.cl.wasel.value = 1;
      newFrame.cl.wasel.dirty = false;
      newFrame.cl.wasel.description = "WASEL is set to 1, selecting exception address for XP.";
  
      console.log("Unknown instruction detected. Exception triggered. XP set to:", XP);
    }

    if (opcode === HALT_OPCODE) {
      console.log("Halt opcode detected, stopping simulation");
      break;
    }
    newFrame.cl.pcsel.value = 1; //default 0
    newFrame.cl.pcsel.dirty = false; 
    newFrame.cl.pcsel.description = pcselDescription;
    newFrame.cl.pcsel.focus = true;
    newFrame.mux.pcsel.dirty = false;

    updatePathsBasedOnInstruction(newFrame, instructionDetails, "fetch");
    frames.push(newFrame);
    programCounter = pcpf;

    // Decode
    console.log("\n#Decode#");
    for (const [key, value] of Object.entries(instructionSet)) {
      if (value.opcode === opcode) {
        instructionDetails = value; // 找到匹配的指令
        console.log(
          "Instruction found for opcode " + opcode.toString(2) + ":",
          key
        );

        const newFrame_dec = structuredClone(frames[frames.length - 1]); 
        resetFocus(frames[frames.length - 1]);
        if (frames.length > 0) {
          newFrame_dec.registers = structuredClone(frames[frames.length - 1].registers);
        }
        newFrame_dec.buffer = newFrame_dec.buffer.slice(0);

        newFrame_dec.titleOfStep = "Decode: Decode the instruction";
        newFrame_dec.iconOfStep = "unlock"

        newFrame_dec.cl.ra2sel.value = 1;
        newFrame_dec.cl.ra2sel.dirty = false;
        newFrame_dec.cl.ra2sel.description = "RA2SEL is active, selecting the second operand from the register.";
        newFrame_dec.cl.ra2sel.focus = true;

        let params = [0, 0, 0, 0]; // [literal, Ra, Rb, Rc]
        let decodeDescription = `Decoding instruction ${key}:\n`;
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
                decodeDescription += `Parameter ${index} Literal: ${params[0]}\n`;
                console.log("Parameter", index, "Literal:", params[0]);
              } else {
              if (parseInt(bit) !== 0) { // 避免覆盖 params[0]
                params[parseInt(bit)] = (instruction >>> (cursor -= 5)) & 0b11111;
            }
              if (parseInt(bit) === 31) {
                console.log(`Parameter ${index} (R${parseInt(bit)}) is R31 (always 0). Skipping this instruction.`);
                decodeDescription += `Parameter ${index} (R${parseInt(bit)}) is 0. Set the value as 0.\n`;
                params[parseInt(bit)] = 0; 
              }
                switch (bit) {
                  case "1":
                    decodeDescription += `Parameter ${index} Ra: R${params[parseInt(bit)]}\n`;
                    console.log(
                      "Parameter",
                      index,
                      "Ra:",
                      "R" + params[parseInt(bit)]
                    );
                    break;
                  case "2":
                    decodeDescription += `Parameter ${index} Rb: R${params[parseInt(bit)]}\n`;
                    console.log(
                      "Parameter",
                      index,
                      "Rb:",
                      "R" + params[parseInt(bit)]
                    );
                    break;
                  case "3":
                    decodeDescription += `Parameter ${index} Rc: R${params[parseInt(bit)]}\n`;
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

        console.log(params[0]);
        RD1 = getRegisterValue(params[1]);
        RD2 = getRegisterValue(params[2]);
        console.log(
          "[MUX]",
          "RD1=Ra=R" + params[1],
          "with current value",
          getRegisterValue(params[1]),
          "RD2=Rb=R" + params[2],
          "with current value",
          getRegisterValue(params[2])
        );
        console.log("[CU signal]", "RA2SEL:", RA2SEL);
        let ra2selDescription = "";
        const ra2selValue = value.RA2SEL !== null ? value.RA2SEL : 0;
        switch (ra2selValue) {
          case 0:
            RA2SEL = 0;
            RD2 = getRegisterValue(params[2]);
            ra2selDescription = `RA2SEL = 0: Select Rb as the second operand (RD2 = R${params[2]}), selecting the second operand from register RD2`;
            decodeDescription += ra2selDescription + "\n";
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
            ra2selDescription = `RA2SEL is set to 1: Select Rc as the second operand (RD2 = R${params[3]}), selecting an immediate value (literal) for the second operand.`;
            decodeDescription += ra2selDescription + "\n";
            console.log(
              "[MUX]",
              "RD2=Rc=R" + params[3],
              "with current value",
              getRegisterValue(params[3])
            );
            break;
          default:
            ra2selDescription = `RA2SEL has an unknown value: ${value.RA2SEL}. Using dirty value from the previous instruction.`;
            decodeDescription += ra2selDescription + "\n";
            console.log(
              "[MUX]",
              "RD2 not selected, use dirty value",
              RD2,
              "from previous instruction"
            );
            break;
        }
        if (value.WASEL === 1) {
          newFrame_dec.cl.wasel.value = 1;
          newFrame_dec.cl.wasel.dirty = false;
          newFrame_dec.mux.wasel.dirty = false;
          newFrame_dec.mux.wasel.value = 1
          newFrame_dec.cl.wasel.description = "WASEL is set to 1 because the operation has triggered an Exception. The PC is stored in XP.";
          newFrame_dec.cl.wasel.focus = true;
          newFrame_dec.mux.wasel.description = "WASEL is set to 1 because the operation has triggered an Exception. Normally, WASEL is 0 to write the result to Rc, but when an Exception occurs, WASEL is switched to 1 to store the Program Counter (PC) to the XP register."
          console.log("WASEL is set to 1, storing PC to XP due to Exception.");
          decodeDescription += `WASEL = 1: Store Program Counter (PC) to XP due to an exception.\n`;
        } else {
          newFrame_dec.cl.wasel.value = 0;
          newFrame_dec.cl.wasel.description = "WASEL is set to 0: The result is written to the target register Rc.";
          newFrame_dec.cl.wasel.focus = false;
          newFrame_dec.mux.wasel.description = "WASEL is set to 0 to write the result to the target register Rc. The result of the ALU or memory operation is written to a specific register."
          decodeDescription += `WASEL = 0: Write the result to the target register Rc.\n`;
        }
        

        newFrame_dec.descriptionOfStep = decodeDescription.trim();

        newFrame_dec.mux.ra2sel.value = RA2SEL;
        newFrame_dec.mux.ra2sel.dirty = false;
        newFrame_dec.mux.ra2sel.focus = true;
        newFrame_dec.mux.ra2sel.description = ra2selDescription;
        updatePathsBasedOnInstruction(newFrame_dec, instructionDetails, "decode");
        frames.push(newFrame_dec);

        // Execute
        console.log("\n#Execute#");
        const newFrame_exe = structuredClone(frames[frames.length - 1]); 
        resetFocus(frames[frames.length - 1]); 
        if (frames.length > 0) {
          newFrame_exe.registers = structuredClone(frames[frames.length - 1].registers);
        }

        newFrame_exe.titleOfStep = "Execute: Perform the operation";
        newFrame_exe.iconOfStep = "social-media";
        newFrame_exe.descriptionOfStep = "";

        console.log("[CU signal]", "ASEL:", value.ASEL);
        let aselDescription = "";
        if (value.ASEL != null) {
        const aselValue = value.ASEL !== null ? value.ASEL : 0; 
        switch (aselValue) {
          case 0:
            A = RD1;
            aselDescription = "ASEL is set to 0 to select the first operand from the register file RD1. This is common for most arithmetic or logic operations.";
            console.log("[MUX]", "A=RD1=" + A);
            break;
          case 1:
            A = pcpf + params[0] * 4;
            aselDescription = "ASEL is set to 1 to select the Program Counter (PC) + 4 + 4 * SXT(C) as the first operand. This occurs in branch and jump instructions, used for calculate the target address for the jump or branch.";
            console.log("[MUX]", "A=(PC+4)+4*SXT(C)" + A);
            break;
          default:
            aselDescription = "ASEL not selected, using dirty value for A.";
            console.log(
              "[MUX]",
              "A not selected, use dirty value",
              A,
              "from previous instruction"
            );
            break;
        }
        newFrame_exe.mux.asel.value = A;
        newFrame_exe.mux.asel.dirty = false;
        newFrame_exe.mux.asel.description = aselDescription;
        newFrame_exe.mux.asel.focus = true;
        newFrame_exe.descriptionOfStep += `${aselDescription}\n`;

      }
      console.log("[CU signal]", "BSEL:", value.BSEL);
      let bselDescription = "";
      if (value.BSEL != null) {
        const bselValue = value.BSEL !== null ? value.BSEL : 0;
        switch (bselValue) {
          case 0:
            B = RD2;
            bselDescription = "BSEL is set to 0 to select the second operand from the register file RD2. This is default for most arithmetic and logical instructions";
            console.log("[MUX]", "B=RD2=" + B);
            break;
          case 1:
            B = params[0];
            bselDescription = "BSEL is set to 1 to select an immediate value (literal) as the second operand. This occurs in instructions like OPC, where one operand is from a register and the second operand is a constant value provided by the instruction.";
            console.log("[MUX]", "B=Literal=" + B);
            break;
          default:
            bselDescription = "BSEL not selected, using dirty value for B.";
            console.log(
              "[MUX]",
              "B not selected, use dirty value",
              B,
              "from previous instruction"
            );
            break;
        }
        newFrame_exe.mux.bsel.value = B;
        newFrame_exe.mux.bsel.dirty = false;
        newFrame_exe.mux.bsel.description = bselDescription;
        newFrame_exe.mux.bsel.focus = true;
        newFrame_exe.descriptionOfStep += `${bselDescription}\n`;
      }
        let alufnDescription = "ALUFN default value is null.";
        
        if (value.ALUFN != null) {
          ALUFN = value.ALUFN;
          aluo = executeALUFN(A, B, ALUFN); //todo: ensure the output is two complement
          alufnDescription = `ALUFN is set to ${ALUFN}, performing ALU operation.`;
          console.log("ALU Operation:", ALUFN, "ALU Output:", aluo);
          newFrame_exe.cl.asel.value = 1;
          newFrame_exe.cl.asel.dirty = false;
          newFrame_exe.cl.asel.description = aselDescription;
          newFrame_exe.cl.asel.focus = true;
  
          newFrame_exe.cl.bsel.value = 1;
          newFrame_exe.cl.bsel.dirty = false;
          newFrame_exe.cl.bsel.description = bselDescription;
          newFrame_exe.cl.bsel.focus = true;
  
          // Update ALUFN
          newFrame_exe.cl.alufn.value = 1; 
          newFrame_exe.cl.alufn.dirty = false;
          newFrame_exe.cl.alufn.description = alufnDescription;
          newFrame_exe.cl.alufn.focus = true;
  
        } else {
          alufnDescription = "ALUFN not selected, using dirty value for ALU operation.";
          console.log(
            "[MUX]",
            "ALUFN not selected, use dirty value",
            ALUFN,
            "from previous instruction"
          );
        }
        
        newFrame_exe.descriptionOfStep += `${alufnDescription}\n`;
        newFrame_exe.descriptionOfStep += `ALU output: ${aluo}\n`;

        if (opcode === 27) {
            // 计算跳转目标地址
            JT = pcpf + params[0] * 4;
            let jtDescription = `Jump Target (JT) is set to address 0x${JT.toString(16)}.`;
            if (instructionDetails.WERF === 1 && params[3] !== 31) {
              newFrame_exe.registers[params[3]] = JT;
            }
        
            // 更新 cl.jt
            newFrame_exe.cl.jt.value = JT;
            newFrame_exe.cl.jt.dirty = false;
            newFrame_exe.cl.jt.description = jtDescription;
            newFrame_exe.cl.jt.focus = true;
        
            newFrame_exe.descriptionOfStep += `${jtDescription}\n`;
            programCounter = JT;
            //pcsel == 2
        } else if (opcode === 0x28 || opcode === 0x29) {
          JT = pcpf + params[0] * 4;
          if ((opcode === 0x28 && RD1 === RD2) || (opcode === 0x29 && RD1 !== RD2)) {
            programCounter = JT; 
            if (instructionDetails.WERF === 1 && params[3] !== 31) {
            newFrame_exe.registers[params[3]] = JT;
            }
            newFrame_exe.descriptionOfStep += `Branch taken to address 0x${JT.toString(16)}.\n`;

            newFrame_exe.cl.jt.value = JT;
            newFrame_exe.cl.jt.dirty = false;
            newFrame_exe.cl.jt.description = `Branch taken to address 0x${JT.toString(16)}.\n`;
            newFrame_exe.cl.jt.focus = true;
        } else {
            programCounter = pcpf; // 条件不满足，继续执行下一条指令
        }
      }

        console.log("ALU output:", aluo);
        updatePathsBasedOnInstruction(newFrame_exe, instructionDetails, "execute");
        frames.push(newFrame_exe);

        //Memory
        console.log("\n#Memory#");
        const newFrame_mem = structuredClone(frames[frames.length - 1]); 
        resetFocus(frames[frames.length - 1]);

        newFrame_mem.titleOfStep = "Memory: Access memory";
        newFrame_mem.descriptionOfStep = "Access memory for load/store instructions.";
        newFrame_mem.iconOfStep = "box"
        let memoryDescription = "";
        let mwrDescription = "";
        const mwrValue = value.MWR !== null ? value.MWR : 0; 
        mWD = RD2;
        Adr = aluo;

        switch (mwrValue) {
          case 0:
            MWR = 0;
            mwrDescription = "MWR is set to 0 to disable memory write. This is the default behavior that do not involve memory operations, ensuring no data is written to memory.";
            console.log("MWR==0, no memory write");
            break;
          case 1:
            MWR = 1;
            mwrDescription = "MWR is set to 1 to enable memory write. This occurs in store instructions, such as ST. The result of the operation needs to be written to a specific address in memory.";
            console.log("MWR==1, memory write");
            break;
          default:
            mwrDescription = "MWR not selected, using dirty value for memory write.";
            console.log(
              "MWR not selected, use dirty value",
              MWR,
              "from previous instruction"
            );
            break;
        }
        memoryDescription += `${mwrDescription}\n`;
        
        if (MWR == 1) {
          console.log("Write data", mWD, " to memory address:", Adr);
          memory.setUint16(Adr, mWD, littleEndian);  
        }

        let moeDescription = "MOE default value is 0 (no memory read).";
        const moeValue = value.MOE !== null ? value.MOE : 0;
        switch (moeValue) {
          case 0:
            MOE = 0;
            moeDescription = "MOE is set to 0, no memory read. This indicates the instruction do not require reading from memory, ensuring that memory is not accessed unless necessary.";
            console.log("MOE==0, no memory read");
            break;
          case 1:
            MOE = 1;
            moeDescription = "MOE is set to 1, memory read enabled. This occurs in load instructions, Like LD. Data from memory needs to be read and loaded into a register.";
            console.log("MOE==1, memory read");
            break;
          default:
            moeDescription = "MOE not selected, using dirty value for memory read.";
            console.log(
              "MOE not selected, use dirty value",
              MOE,
              "from previous instruction"
            );
            break;
        }
        newFrame_exe.cl.moe.value = moeValue;
        newFrame_exe.cl.moe.dirty = false;
        newFrame_exe.cl.moe.description = moeDescription;
        newFrame_mem.cl.moe.focus = true;

        newFrame_exe.cl.mwr.value = mwrValue;
        newFrame_exe.cl.mwr.dirty = false;
        newFrame_exe.cl.mwr.description = mwrDescription;
        newFrame_mem.cl.mwr.focus = true;
        memoryDescription += `${moeDescription}\n`;

        if (MOE == 1) {
          RD = uint16ToTwosComplement(memory.getUint32(Adr, littleEndian));
          console.log("Read data", RD, " from memory address:", Adr);
          if (instructionDetails.WERF === 1 && params[3] !== 31) {
            newFrame_mem.registers[params[3]] = RD;
            memoryDescription += `Register R${params[3]} is updated with value 0x${RD.toString(16)} from memory.\n`;
          }
        }

        newFrame_mem.descriptionOfStep = memoryDescription.trim();
        updatePathsBasedOnInstruction(newFrame_mem, instructionDetails, "memory");
        frames.push(newFrame_mem)

        //Write Back
        console.log("\n#Write Back#");
        const newFrame_wb = structuredClone(frames[frames.length - 1]); 
        resetFocus(frames[frames.length - 1]);

        newFrame_wb.titleOfStep = "Write Back: Write results to register";
        newFrame_wb.descriptionOfStep = "Write the results of the operation back to the register.";
        newFrame_wb.iconOfStep = "unarchive"
        
        console.log("[CU signal]", "WDSEL:", value.WDSEL);
        let wdselDescription = "";
        if (value.WDSEL != null) {
          WDSEL = value.WDSEL;
          console.log("[MUX]", "WDSEL=" + WDSEL);
        } else {
          WDSEL = 0;
          wdselDescription = "WDSEL is null, defaulting to the value of 0."
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
            wdselDescription = "WDSEL is set to 0 to select (PC + 4) as the data to write back to the register file. This is typically used when the program counter is written back to the register file after executing a jump or return instruction.";
            console.log("[MUX]", "rWD=(PC+4)=" + rWD);
            break;
          case 1:
            rWD = ensureTwoComplement(aluo);
            wdselDescription = "WDSEL is set to 1 to select the ALU output as the data to write back to the register file. This is the default in most arithmetic or logical instructions.";
            console.log("[MUX]", "rWD=ALU output=" + rWD);
            break;
          case 2:
            rWD = RD;
            wdselDescription = "WDSEL is set to 2 to select the data read from memory as the value to write back to the register file. This solely happens in LD instructions, where data from memory is written back to a register.";
            console.log("[MUX]", "rWD=RD(memory read)=" + rWD);
            break;
          default:
            wdselDescription = "WDSEL not selected, using dirty value for write data.";
            console.log(
              "[MUX]",
              "rWD not selected, use dirty value",
              rWD,
              "from previous instruction"
            );
            break;
        }
        newFrame_wb.mux.wdsel.value = WDSEL;
        newFrame_wb.mux.wdsel.dirty = false;
        newFrame_wb.mux.wdsel.description = wdselDescription;
        newFrame_wb.mux.wdsel.focus = true;
        newFrame_wb.descriptionOfStep += `${wdselDescription}\n`;

        newFrame_wb.cl.wdsel.value = 1;
        newFrame_wb.cl.wdsel.dirty = false;
        newFrame_wb.cl.wdsel.description = wdselDescription;
        newFrame_wb.cl.wdsel.focus = true;

        let werfDescription = "";

        if (value.WERF != null) {
            WERF = value.WERF;
            console.log("WERF=" + WERF);
          } else {
            WERF = 0;
            werfDescription = "WERF is null, select default value of 0."
            console.log(
              "WERF not selected, use dirty value",
              WERF,
              "from previous instruction"
            );
          }
          switch (WERF) {
            case 0:
              console.log("No register write back");
              werfDescription = "WERF is set to 0, no register write back. This is the instructions that do not write data back to a register, such as memory load instructions or conditional branch instructions.";
              break;
            case 1:
            // Currently, ignore XP
            console.log("Write value",rWD,"to register","R"+params[3]);
            setRegisterValue(params[3], rWD);
            newFrame_wb.registers = registers.slice(0);
            werfDescription = "WERF is set to 1, writing back to register. This occurs when an instruction requires the result to be written back into a register, such as in arithmetic, logical instructions.";
            break;

            default:
              werfDescription = "WERF not selected, using dirty value for register write.";
              console.log(
                "WERF not selected, use dirty value",
                WERF,
                "from previous instruction"
              );
              break;
          }
          console.log("\n\n");
          newFrame_wb.cl.werf.value = 1;
          newFrame_wb.cl.werf.dirty = false;
          newFrame_wb.cl.werf.description = werfDescription;
          newFrame_wb.cl.werf.focus = true;
          newFrame_wb.descriptionOfStep += `${werfDescription}\n`;

          updatePathsBasedOnInstruction(newFrame_wb, instructionDetails, "writeBack");
          frames.push(newFrame_wb);
        programCounter = pcpf;
        break;
      } else {
        console.log("No instruction found for opcode " + opcode.toString(2));
        XP=programCounter;
        // PCSEL=3;
      }
    }
  }
  console.log(frames);
  return frames;
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
