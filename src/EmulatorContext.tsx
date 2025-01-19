import { createContext, Dispatch, SetStateAction } from "react";

const DEFAULT_ASSEMBLY_CODE = `ADDC(R31, 6, R1)
SUBC(R31, 18, R2)
ADD(R1, R2, R3) | write R1+R2 to R3
HALT() | exit

// This is just a poc version of the program so it's not optimized
// We will fix this after finishing up the transfer applications :(
`;

const DEFAULT_FRAME = {
  offsetOfInstruction: 0x00, // 目前正在运行的这条指令本身的位置
  titleOfInstruction: "Reset",
  descriptionOfInstruction: "initial state of processor",
  iconOfInstruction: "cog", // 暂时都用cog就行
  titleOfStep: "Press ASM to RAM to assemble your code",
  descriptionOfStep:
    "Reminder: This version of processer is still in development, some bugs or issues may occur.",
  iconOfStep: "reset", // 花里胡哨的图标，从https://blueprintjs.com/docs/#icons/icons-list 里面找你觉得能对应上的
  exception: false, // 这一步是否运行出错，error handle不会exception，只有没找到对应的instruction或者除以0的时候这个会变成true
  exitingDueToException: false, // 是不是在进行error handle的部分
  flags: {
    z: {
      value: 0,
      dirty: true,
      description:
        "Z is used for comparison instruction and it would be on if all digits are zero.",
      focus: false,
    },
  },
  registers: Array(32).fill(0),
  buffer: new ArrayBuffer(128),
  programCounter: 0, // 当前的PC，在没有jump和error handle的情况下应该和offsetOfInstruction相同
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
      description: "xxxxxxx",
      focus: false,
    },
    pcsel: {
      value: 0,
      dirty: true,
      description: "xxxxxxx",
      focus: false,
    },
    xp: {
      value: 0,
      dirty: false,
      description: "xxxxxxx",
      focus: false,
    },
    jt: {
      value: 0,
      dirty: true,
      description: "xxxxxxx",
      focus: false,
    },
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
    "pcsel-to-reset": {
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
    },
    "register-file-to-asel": {
      value: 0,
      dirty: true,
      description: null,
      focus: false,
    },
    "instruction-memory-to-wasel": {
      value: 0,
      dirty: true,
      description: null,
      focus: false,
    },
    "instruction-memory-to-bsel": {
      value: 0,
      dirty: true,
      description: null,
      focus: false,
    },
    "plus-four-to-pcsel": {
      value: 0,
      dirty: true,
      description: null,
      focus: false,
    },
    "plus-to-pcsel": {
      value: 0,
      dirty: true,
      description: null,
      focus: false,
    },
    "instruction-memory-to-ra2sel-as-rc": {
      value: 0,
      dirty: true,
      description: null,
      focus: false,
    },
    "instruction-memory-to-ra2sel-as-rb": {
      value: 0,
      dirty: true,
      description: null,
      focus: false,
    },
    "instruction-memory-to-register-file": {
      value: 0,
      dirty: true,
      description: null,
      focus: false,
    },
    "plus-to-asel": {
      value: 0,
      dirty: true,
      description: null,
      focus: false,
    },
  },
};

export interface EmulatorContextType {
  frames: any[];
  currentFrame: number;
  setFrames: Dispatch<SetStateAction<any[]>>;
  setCurrentFrame: Dispatch<SetStateAction<number>>;
}

export const EmulatorContext = createContext<EmulatorContextType>({
  frames: [DEFAULT_FRAME],
  currentFrame: 0,
  setFrames: () => {},
  setCurrentFrame: () => {},
});
