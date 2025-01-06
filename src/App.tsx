// import { invoke } from "@tauri-apps/api/core";
import {
  Navbar,
  Alignment,
  Button,
  ButtonGroup,
  HTMLTable,
  Tree,
  Icon,
  HotkeysProvider,
} from "@blueprintjs/core";
import { Mosaic, MosaicWindow } from "react-mosaic-component";
import "react-mosaic-component/react-mosaic-component.css";
import debounce from 'lodash/debounce';
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
  const [nonce, setNonce] = useState(0);
  // The callback facilitates updates to the source data.
  const handleSetValue = useCallback(
    (offset: number, value: number) => {
      data[offset] = value;
      setNonce((v) => v + 1);
    },
    [data]
  );

  function handleEditorWillMount(monaco: any) {
    // here is the monaco instance
    // do something before editor is mounted
    monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
  }

  function handleEditorDidMount(editor: any, monaco: any) {
    // here is another way to get monaco instance
    // you can also store it in `useRef` for further usage
    var decorations = editor.createDecorationsCollection([
      {
        range: new monaco.Range(3, 1, 3, 1),
        options: {
          isWholeLine: true,
          className: "editorContentClassPC",
          glyphMarginClassName: "editorGlyphMarginClassPC",
        },
      },
    ]);

    monacoRef.current = monaco;
  }

  const monacoRef = useRef(null);
  // const mosaicRef = useRef(null);
  // const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const elementRef = useRef(null); // 创建 ref
  const [size, setSize] = useState({ width: 0, height: 0 });
  // useEffect(() => {
  //   if (elementRef.current) {
  //     const rect = elementRef.current.getBoundingClientRect();
  //     setSize({ width: rect.width, height: rect.height });
  //   }
  // }, []); 
  // useEffect(() => {
  //   // 创建 ResizeObserver
  //   const observer = new ResizeObserver((entries) => {
  //     if (entries[0]) {
  //       const { width, height } = entries[0].contentRect;
  //       setDimensions({ width, height });
  //       alert(`Mosaic size changed: ${width} x ${height}`); // 尺寸变化时弹出提示
  //     }
  //   });

  //   if (mosaicRef.current) {
  //     observer.observe(mosaicRef.current); // 监听 Mosaic 的 DOM 元素
  //   }

  //   return () => {
  //     observer.disconnect(); // 组件卸载时清除监听器
  //   };
  // }, []);
  // useEffect(() => {
  //   const updateSize = () => {
  //     if (mosaicRef.current) {
  //       const { offsetWidth: width, offsetHeight: height } = mosaicRef.current;
  //       setDimensions({ width, height });
  //     }
  //   };

  //   updateSize(); // 初始化时获取尺寸

  //   // 监听窗口大小变化
  //   window.addEventListener('resize', updateSize);
  //   return () => window.removeEventListener('resize', updateSize);
  // }, []);

  const handleLayoutChange = useCallback((newLayout: any) => {
    // Handle layout changes here if needed
    console.log('Layout changed:', newLayout);
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
  <div style={{ width: '100%', height: '100%' }}>
    <BetaVisualization/>
        </div>
    ),
    c: () => <ScrollableTable />,
    d: () => <HexEditor />,
    e: () => <MyTree />,
    b: () => (
      // <div style={{ zIndex: 1000 }}>
      <Editor
        height="100vh"
        options={{
          // fixedOverflowWidgets: true,
          contextmenu: true,
          glyphMargin: true,
          useShadowDOM: false,
        }}
        beforeMount={handleEditorWillMount}
        onMount={handleEditorDidMount}
        defaultLanguage="javascript"
        defaultValue="LD(R1,0x0,R3)
ADD(R1,R2,R3)
JMP(R2,0x3)
XORC(R1,R2,0b10101010)"
      />
      // </div>
    ),
    new: () => <h1>New</h1>,
  };

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
            <Button icon="manually-entered-data" intent="primary">
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
