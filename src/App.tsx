import {
  Navbar,
  Alignment,
  Button,
  ButtonGroup,
  OverlayToaster,
  Intent,
  BlueprintProvider,
} from "@blueprintjs/core";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";

import { Mosaic, MosaicWindow } from "react-mosaic-component";
import "react-mosaic-component/react-mosaic-component.css";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import "./App.css";

import { assemble, simulate } from "./emulator";
import BetaVisualization from "./BetaVisualization";
import AssemblyEditor from "./AssemblyEditor";
import MemoryViewer from "./MemoryViewer";
import Registers from "./Registers";
import Timeline from "./Timeline";
import { EmulatorContext } from "./emulatorContext";

localStorage.setItem("version", "0.0.0");

const DEFAULT_ASSEMBLY_CODE = 
`// This is just a poc version of the program so some error may occur
// Open an issue on Github if you find any bug

LD(R31, 0x0000,R10)
ADDC(R31, 11, R1)
SUBC(R1, 1, R2)
MULC(R2, 2, R3)
DIVC(R3, 4, R4)
CMPEQC(R4, 5, R5)
CMPLTC(R4, 10, R6)
CMPLEC(R4, 5, R7)
LDR(R9, 0x0000, R8)
ST(R1, 0x0002, R31)
ADDC(R31, 0x0010, R11)
ADDC(R31, 01, R12)
JMP(R11, R12)
SUBC(R5, 1, R5)
BEQ(R5, 0x0020, R13)
ADDC(R31, 0x0030, R14)
BNE(R5, 0x0040, R14)
ADD(R1, R2, R15)
SUB(R1, R2, R16)
MUL(R2, R4, R17)
DIV(R17, R2, R18)
CMPEQ(R1, R2, R19)
CMPLT(R1, R2, R20)
CMPLE(R1, R2, R21)
AND(R1, R2, R22)
OR(R1, R2, R23)
XOR(R1, R2, R24)
SHL(R1, R2, R25)
SHR(R1, R2, R26)
SRA(R1, R2, R27)
ANDC(R1, 0x000F, R28)
ORC(R2, 0x000F, R29)
XORC(R2, 0x000F, R30)
SHLC(R1, 2, R1)
SHRC(R1, 1, R2)
SRAC(R1, 1, R3)
ADDC(R31, 0x1, R9)
JMP(R9, R31)

HALT() | exit
`;

const DEFAULT_FRAME = {
  offsetOfInstruction: -1, // 目前正在运行的这条指令本身的位置
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


const getItem = (key: string, defaultValue: any = null): any => {
  const value = localStorage.getItem(key);
  if (value === null && defaultValue !== null) {
    return defaultValue;
  }
  return value !== null ? value : defaultValue;
};

const setItem = (key: string, value: string): void => {
  if (value === "") {
    localStorage.removeItem(key);
  } else {
    localStorage.setItem(key, value);
  }
};

export type ViewId =
  | "processor"
  | "assembly"
  | "registers"
  | "memory"
  | "timeline"
  | "new";

const TITLE_MAP: Record<ViewId, string> = {
  processor: "Processor",
  assembly: "Assembly Editor",
  registers: "Registers",
  memory: "Memory",
  timeline: "Timeline",
  new: "Empty Window",
};

function App() {
  const assemblyCodeRef = useRef<string>(
    getItem("assemblyCode", DEFAULT_ASSEMBLY_CODE)
  );
  if (assemblyCodeRef.current === "") {
    assemblyCodeRef.current = DEFAULT_ASSEMBLY_CODE;
  }
  const [frames, setFrames] = useState<any>([DEFAULT_FRAME]);
  const [currentFrame, setCurrentFrame] = useState<number>(0);
  const [keyFrames, setKeyFrames] = useState<Array<number>>([]);

  const COMPONENT_MAP = {
    processor: () => (
      <div style={{ width: "100%", height: "100%" }}>
        <BetaVisualization
        />
      </div>
    ),
    assembly: () => (
      <AssemblyEditor
        defaultValue={getItem("assemblyCode", DEFAULT_ASSEMBLY_CODE)}
        onChange={useCallback((val, viewUpdate) => {
          if (assemblyCodeRef.current !== val) {
            assemblyCodeRef.current = val;
            setItem("assemblyCode", val);
          }
        }, [])}
      />
    ),
    registers: () => (
      <Registers />
    ),
    memory: () => (
      <MemoryViewer />
    ),
    timeline: () => <Timeline />,
    new: () => <h1>I am an empty window.</h1>,
  };

  return (
    <BlueprintProvider>
      <EmulatorContext.Provider
        value={{ frames, currentFrame, setFrames, setCurrentFrame }}
      >
        <div id="app">
          <Navbar>
            <Navbar.Group align={Alignment.LEFT}>
              <Navbar.Heading>Beta Playground</Navbar.Heading>
              <Navbar.Divider />
              <ButtonGroup large={false}>
                <Button
                  icon="manually-entered-data"
                  intent="primary"
                  onClick={useCallback(async () => {
                    try {
                      let assembled = assemble(assemblyCodeRef.current);
                      console.log(assemblyCodeRef.current);
                      let simulation = simulate(assembled);
                      (
                        await OverlayToaster.createAsync({
                          position: "bottom",
                        })
                      ).show({
                        message: "Successfully assembled the code",
                        icon: "tick",
                        intent: Intent.SUCCESS,
                      });
                      setFrames(simulation);
                      setCurrentFrame(0);

                      let arr = [0];
                      simulation.forEach((item: any, index: number) => {
                        if (
                          index > 0 &&
                          item.offsetOfInstruction !=
                          simulation[index - 1].offsetOfInstruction
                        ) {
                          arr.push(index);
                        }
                      });
                      setKeyFrames(arr);
                    } catch (error: any) {
                      console.log(error);
                      (
                        await OverlayToaster.createAsync({
                          position: "bottom",
                        })
                      ).show({
                        message: `An error occurred during the assembly process: ${error.message}`,
                        icon: "warning-sign",
                        intent: Intent.DANGER,
                      });
                    }
                  }, [assemblyCodeRef, setFrames, setCurrentFrame, setKeyFrames])}
                >
                  Write ASM to RAM
                </Button>
                <Button
                  icon="fast-backward"
                  intent="warning"
                  disabled={
                    frames.length === 0 ||
                    frames === null ||
                    currentFrame === 0 ||
                    [...keyFrames].reverse().find((kf) => kf < currentFrame) ===
                    undefined
                  }
                  onClick={useCallback(() => {
                    const previousKeyFrame = [...keyFrames]
                      .reverse()
                      .find((kf) => kf < currentFrame);
                    if (previousKeyFrame !== undefined) {
                      setCurrentFrame(previousKeyFrame);
                    }
                  }, [currentFrame, keyFrames])}
                >
                  Previous Instruction
                </Button>
                <Button
                  icon="step-backward"
                  intent="warning"
                  disabled={
                    frames.length === 0 || frames === null || currentFrame === 0
                  }
                  onClick={useCallback(
                    () => setCurrentFrame(currentFrame - 1),
                    [currentFrame]
                  )}
                >
                  Previous Step
                </Button>
                <Button
                  icon="play"
                  intent="success"
                  disabled={
                    frames.length === 0 ||
                    frames === null ||
                    currentFrame === frames.length - 1
                  }
                  onClick={useCallback(
                    () => setCurrentFrame(currentFrame + 1),
                    [currentFrame, frames]
                  )}
                >
                  Next Step
                </Button>
                <Button
                  icon="fast-forward"
                  intent="success"
                  disabled={
                    frames.length === 0 ||
                    frames === null ||
                    currentFrame === frames.length - 1 ||
                    keyFrames.find((kf) => kf > currentFrame) === undefined
                  }
                  onClick={useCallback(() => {
                    const nextKeyFrame = keyFrames.find(
                      (kf) => kf > currentFrame
                    );
                    if (nextKeyFrame !== undefined) {
                      setCurrentFrame(nextKeyFrame);
                    }
                  }, [currentFrame, keyFrames])}
                >
                  Next Instruction
                </Button>
                <Button
                  icon="reset"
                  intent="danger"
                  onClick={useCallback(() => {
                    setCurrentFrame(0);
                    setFrames([DEFAULT_FRAME]);
                    setKeyFrames([]);
                  }, [])}
                >
                  Reset
                </Button>
                <Button icon="cog" disabled={true}></Button>
              </ButtonGroup>
            </Navbar.Group>
          </Navbar>
          <Mosaic<ViewId>
            renderTile={useCallback(
              (id, path) => {
                const Component = COMPONENT_MAP[id];
                return (
                  <MosaicWindow<ViewId>
                    path={path}
                    createNode={() => "new"}
                    title={TITLE_MAP[id]}
                    toolbarControls={[]}
                  >
                    <Component key={id} />
                  </MosaicWindow>
                );
              },
              []
            )}
            initialValue={useMemo(
              () =>
                JSON.parse(
                  getItem(
                    "mosaicLayout",
                    JSON.stringify({
                      direction: "row",
                      first: {
                        direction: "column",
                        first: "processor",
                        second: {
                          direction: "row",
                          first: "memory",
                          second: "registers",
                          splitPercentage: 50,
                        },
                        splitPercentage: 70,
                      },
                      second: {
                        direction: "column",
                        first: "assembly",
                        second: "timeline",
                        splitPercentage: 50,
                      },
                      splitPercentage: 60,
                    })
                  )
                ),
              []
            )}
            onChange={useCallback(
              (newNode: any) => setItem("mosaicLayout", JSON.stringify(newNode)),
              []
            )}
            blueprintNamespace="bp5"
          />
        </div>
      </EmulatorContext.Provider>
    </BlueprintProvider>
  );
}

export default App;
