// import { invoke } from "@tauri-apps/api/core";
import { assemble } from "./emulator";

import {
  Navbar,
  Alignment,
  Button,
  ButtonGroup,
  HTMLTable,
  Tree,
  Icon,
  HotkeysProvider,
  Toaster,
  OverlayToaster,
  Intent,
} from "@blueprintjs/core";
import { Mosaic, MosaicWindow } from "react-mosaic-component";
import "react-mosaic-component/react-mosaic-component.css";
import debounce from "lodash/debounce";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import Editor from "@monaco-editor/react";
// import HexEditor from 'react-hex-editor';
// import oneDarkPro from 'react-hex-editor/themes/index';
import { HexEditor } from "hex-editor-react";
import "hex-editor-react/dist/hex-editor.css";
import Beta from "./BetaVisualization";
// draggle

import "./App.css"; // Must be the last css import
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Table2, Column } from "@blueprintjs/table";
import BetaVisualization from "./BetaVisualization";
import AssemblyEditor from "./AssemblyEditor";

const data = ((length) => {
  var array = new Uint8Array(length);
  window.crypto.getRandomValues(array);
  return array;
})(100);

const MyTree = () => {
  return (
    <div style={{ maxHeight: "100%", width: "100%", overflowY: "auto" }}>
      <Tree
        contents={[
          {
            id: "reset",
            label: "Reset",
            icon: "reset",
            isExpanded: false,
            secondaryLabel: <Icon icon="small-tick" intent="success" />,
            childNodes: [],
          },
          {
            id: "ld",
            label: "LD(R1,0x0,R3)",
            icon: "cog",
            isExpanded: true,
            secondaryLabel: <Icon icon="hand-left" intent="primary" />,
            childNodes: [
              {
                id: "fetch",
                label: "Fetch",
                icon: "compressed",
                isExpanded: true,
                childNodes: [
                  {
                    id: "read-instruction",
                    label: "Read instruction from memory",
                    icon: "archive",
                    childNodes: [],
                  },
                  {
                    id: "update-pc",
                    label: "Update the Program Counter",
                    icon: "automatic-updates",
                    childNodes: [],
                  },
                ],
              },
              {
                id: "decode",
                label: "Decode",
                icon: "binary-number",
                isExpanded: true,
                childNodes: [
                  {
                    id: "decode-instruction",
                    label: "Decode the instruction",
                    icon: "git-branch",
                    childNodes: [],
                  },
                  {
                    id: "identify-datapaths",
                    label: "Identify registers and data paths",
                    icon: "switch",
                    childNodes: [],
                  },
                  {
                    id: "extract-value",
                    label: "Extract immediate values or memory addresses",
                    icon: "tag-refresh",
                    childNodes: [],
                  },
                ],
              },
            ],
          },
        ]}
        onNodeClick={(node) => console.log(node)}
        className="bp5-tree bp5-elevation-0"
      />
    </div>
  );
};

const ScrollableTable = () => {
  const rows = [];
  for (let i = 0; i <= 31; i++) {
    rows.push(
      <tr key={i}>
        <td>{`R${i}`}</td>
        <td>
          <div className="bp5-input-group" style={{ width: "200px" }}>
            <span>{`0x${[...crypto.getRandomValues(new Uint8Array(4))]
              .map((b) => b.toString(16).padStart(2, "0"))
              .join("")}`}</span>{" "}
          </div>
        </td>
      </tr>
    );
  }

  return (
    <div style={{ maxHeight: "100%", width: "100%", overflowY: "auto" }}>
      <HTMLTable compact={true} bordered={true} striped={true} width={"10%"}>
        <thead>
          <tr>
            <th>Register</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </HTMLTable>
    </div>
  );
};

export type ViewId = "a" | "b" | "c" | "d" | "e" | "new";

const TITLE_MAP: Record<ViewId, string> = {
  a: "Processor",
  b: "Assembly Editor",
  c: "Registers",
  d: "Memory",
  e: "Timeline",
  new: "New Window",
};

function App() {
  let assemblyCode = `ADDC(R31, 6, R1) | 6
SUBC(R31, 18, R2) | -18
ADD(R1, R2, R3) | write R1+R2 to R3
HALT()`;
  const [buffer, setBuffer] = useState<ArrayBuffer>(new ArrayBuffer(1024));

  const [nonce, setNonce] = useState(0);
  // The callback facilitates updates to the source data.
  const handleSetValue = useCallback(
    (offset: number, value: number) => {
      data[offset] = value;
      setNonce((v) => v + 1);
    },
    [data]
  );

  const handleLayoutChange = useCallback((newLayout: any) => {
    // Handle layout changes here if needed
    console.log("Layout changed:", newLayout);
    //     if (elementRef.current) {
    //   const rect = elementRef.current.getBoundingClientRect();
    //   setSize({ width: rect.width, height: rect.height });
    // }
  }, []);

  // const [greetMsg, setGreetMsg] = useState("");
  // const [name, setName] = useState("");

  // async function greet() {
  //   // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
  //   setGreetMsg(await invoke("greet", { name }));

  const COMPONENT_MAP = {
    a: () => (
      <div style={{ width: "100%", height: "100%" }}>
        <BetaVisualization />
      </div>
    ),
    c: () => <ScrollableTable />,
    d: () => {
      return (
        <div
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: "white",
            overflowX: "auto",
            flex: 1,
            justifyContent: "center",
          }}
        >
          <HexEditor
            height="100%"
            width="calc(100%);"
            data={buffer}
            showFooter={false}
          />
        </div>
      );
    },
    e: () => <MyTree />,
    b: () => (
      <AssemblyEditor
        defaultValue={assemblyCode}
        onChange={(val, viewUpdate) => {
          console.log("val:", val);
          assemblyCode = val;
        }}
      />
    ),
    new: () => <h1>New</h1>,
  };
  //   return <AssemblyEditor
  //   defaultValue={assemblyCode}
  //   onChange={(val, viewUpdate) => {
  //     console.log("val:", val);
  //     assemblyCode = val;
  //   }}
  // />;

  return (
    <div id="app">
      <Navbar>
        <Navbar.Group align={Alignment.LEFT}>
          <Navbar.Heading>Beta Playground</Navbar.Heading>
          <Navbar.Divider />
          <Button className="bp5-minimal" icon="home" text="New" />
          <Button className="bp5-minimal" icon="document-open" text="Open" />
          <Button className="bp5-minimal" icon="floppy-disk" text="Save" />
          <Navbar.Divider />
          <ButtonGroup large={false}>
            <Button
              icon="manually-entered-data"
              intent="primary"
              onClick={async () => {
                try {
                  setBuffer(assemble(assemblyCode));
                  setNonce((v) => v + 1); // Trigger re-render of HexEditor
                  (
                    await OverlayToaster.createAsync({
                      position: "top",
                    })
                  ).show({
                    message: "Successfully assembled the code",
                    icon: "tick",
                    intent: Intent.SUCCESS,
                  });
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
              }}
            >
              Write ASM to RAM
            </Button>
            <Button icon="fast-backward" intent="warning">
              Rewind
            </Button>
            <Button icon="play" intent="success">
              Play
            </Button>
            <Button icon="fast-forward" intent="success">
              Forward
            </Button>
            <Button icon="reset" intent="danger">
              Reset
            </Button>
            <Button icon="cog"></Button>
          </ButtonGroup>
        </Navbar.Group>
      </Navbar>
      <Mosaic<ViewId>
        renderTile={(id, path) => {
          const Component =
            COMPONENT_MAP[id] || (() => <div>Unknown Component</div>);
          return (
            <MosaicWindow<ViewId>
              path={path}
              createNode={() => "new"}
              title={TITLE_MAP[id]}
            >
              <Component />
            </MosaicWindow>
          );
        }}
        initialValue={{
          direction: "row",
          first: {
            direction: "column",
            first: "a",
            second: {
              direction: "row",
              first: "c",
              second: "d",
              splitPercentage: 30,
            },
            splitPercentage: 70,
          },
          second: {
            direction: "column",
            first: "b",
            second: "e",
            splitPercentage: 60,
          },
          splitPercentage: 60,
        }}
        blueprintNamespace="bp5"
        onChange={handleLayoutChange}
      />
    </div>
  );
}

export default App;
