import {
  Navbar,
  Alignment,
  Button,
  ButtonGroup,
  OverlayToaster,
  Intent,
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

const DEFAULT_ASSEMBLY_CODE = 
`ADDC(R31, 6, R1)
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
      description: "Z is used for comparison instruction and it would be on if all digits are zero.",
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

localStorage.setItem("version", "0.0.0");

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
  const assemblyCodeRef = useRef<string>(getItem("assemblyCode", DEFAULT_ASSEMBLY_CODE));
  if (assemblyCodeRef.current === "") {
    assemblyCodeRef.current = DEFAULT_ASSEMBLY_CODE
  }
  const [frames, setFrames] = useState<any>([]);
  const [currentFrame, setCurrentFrame] = useState<number>(0);
  const [keyFrames, setKeyFrames] = useState<Array<number>>([]);

  const COMPONENT_MAP = {
    processor: () => (
      <div style={{ width: "100%", height: "100%" }}>
        <BetaVisualization
          frame={frames.length > 0 ? frames[currentFrame] : DEFAULT_FRAME} previousFrame={frames.length == 0 || currentFrame==0 ? DEFAULT_FRAME : frames[currentFrame - 1]}
        />
      </div>
    ),
    assembly: () => (
      <AssemblyEditor
        defaultValue={getItem("assemblyCode", DEFAULT_ASSEMBLY_CODE)}
        onChange={(val, viewUpdate) => {
          assemblyCodeRef.current = val;
          setItem("assemblyCode", val);
        }}
      />
    ),
    registers: () => (
      <Registers
        values={
          frames.length > 0
            ? frames[currentFrame].registers
            : Array(32).fill(15)
        }
      />
    ),
    memory: () => (
      <MemoryViewer
        buffer={
          frames.length > 0 ? frames[currentFrame].buffer : new ArrayBuffer(16)
        }
      />
    ),
    timeline: () => <Timeline frames={frames} currentFrame={currentFrame} />,
    new: () => <h1>I am an empty window.</h1>,
  };

  return (
    <div id="app">
      <Navbar>
        <Navbar.Group align={Alignment.LEFT}>
          <Navbar.Heading>Beta Playground</Navbar.Heading>
          <Navbar.Divider />
          {/* <Button className="bp5-minimal" icon="home" text="New" />
        <Button className="bp5-minimal" icon="document-open" text="Open" />
        <Button className="bp5-minimal" icon="floppy-disk" text="Save" />
        <Navbar.Divider /> */}
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
              }, [assemblyCodeRef, setFrames, setCurrentFrame])}
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
              onClick={() => {
                const previousKeyFrame = [...keyFrames]
                  .reverse()
                  .find((kf) => kf < currentFrame);
                if (previousKeyFrame !== undefined) {
                  setCurrentFrame(previousKeyFrame);
                }
              }}
            >
              Previous Instruction
            </Button>
            <Button
              icon="step-backward"
              intent="warning"
              disabled={
                frames.length === 0 || frames === null || currentFrame === 0
              }
              onClick={() => setCurrentFrame(currentFrame - 1)}
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
              onClick={() => setCurrentFrame(currentFrame + 1)}
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
              onClick={() => {
                const nextKeyFrame = keyFrames.find((kf) => kf > currentFrame);
                if (nextKeyFrame !== undefined) {
                  setCurrentFrame(nextKeyFrame);
                }
              }}
            >
              Next Instruction
            </Button>
            <Button
              icon="reset"
              intent="danger"
              onClick={() => {
                setCurrentFrame(0);
                setFrames([]);
                setKeyFrames([]);
              }}
            >
              Reset
            </Button>
            <Button icon="cog" disabled={true}></Button>
          </ButtonGroup>
        </Navbar.Group>
      </Navbar>
      <Mosaic<ViewId>
        renderTile={(id, path) => {
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
        }}
        initialValue={JSON.parse(
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
        )}
        onChange={(newNode) => setItem("mosaicLayout", JSON.stringify(newNode))}
        blueprintNamespace="bp5"
      />
    </div>
  );
}

export default App;
