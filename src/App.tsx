import {
  Navbar,
  Alignment,
  Button,
  ButtonGroup,
  HTMLTable,
  Tree,
  Icon,
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

const DEFAULT_ASSEMBLY_CODE = `ADDC(R31, 6, R1)
SUBC(R31, 18, R2)
ADD(R1, R2, R3) | write R1+R2 to R3
HALT() | exit

// This is just a poc version of the program so it's not optimized
// We will fix this after finishing up the transfer applications :(
`;

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
  const assemblyCodeRef = useRef<string>(DEFAULT_ASSEMBLY_CODE);
  const [frames, setFrames] = useState<any>([]);
  const [currentFrame, setCurrentFrame] = useState<number>(0);
  const [keyFrames, setKeyFrames] = useState<Array<number>>([]);

  const COMPONENT_MAP = {
    processor: () => (
      <div style={{ width: "100%", height: "100%" }}>
        {/* <textarea
          style={{ width: "100%", height: "100%" }}
          value={
            frames.length > 0
              ? JSON.stringify(frames[currentFrame], null, 2)
              : "点那个蓝色按钮开始模拟,之后用Previous Step和Next Step来切换frame"
          }
          readOnly={true}
        /> */}
        <BetaVisualization />
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
          frames.length > 0 ? frames[currentFrame].registers : Array(32).fill(0)
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
                      position: "top",
                    })
                  ).show({
                    message: "Successfully assembled the code",
                    icon: "tick",
                    intent: Intent.SUCCESS,
                  });
                  setFrames(simulation);
                  setCurrentFrame(0);

                  let arr = [0];
                  simulation.forEach((item, index) => {
                    if (
                      index > 0 &&
                      item.offsetOfInstruction !=
                        simulation[index - 1].offsetOfInstruction
                    ) {
                      arr.push(index);
                    }
                  });
                  setKeyFrames(arr);
                  // console.log(simulation);
                } catch (error: any) {
                  console.log(error);
                  (
                    await OverlayToaster.createAsync({
                      position: "top",
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
                frames.length === 0 || frames === null || currentFrame === 0 || [...keyFrames].reverse().find((kf) => kf < currentFrame) === undefined
              }
              onClick={() => {
                const previousKeyFrame = [...keyFrames].reverse().find((kf) => kf < currentFrame);
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
              currentFrame === frames.length - 1 || keyFrames.find((kf) => kf > currentFrame) === undefined
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
            <Button icon="reset" intent="danger" onClick={
              () => {
                setCurrentFrame(0);
                setFrames([]);
                setKeyFrames([]);
            }}>
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
