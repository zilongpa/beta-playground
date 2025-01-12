import { Tree, Icon } from "@blueprintjs/core";
import { memo, useMemo, useCallback, useRef, useState } from "react";
import { Mosaic, MosaicWindow } from "react-mosaic-component";

const MosaicContainer = memo(() => {
  // Use a memoized default layout so it's not recreated on every parent re-render
  const defaultLayout = useMemo(() => {
    const initial = JSON.stringify({
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
      splitPercentage: 65,
    });
    return JSON.parse(localStorage.getItem("mosaicLayout") || initial);
  }, []);

  // Avoid re-renders by using a callback that doesn't change on each render
  const handleChange = useCallback((newNode) => {
    localStorage.setItem("mosaicLayout", JSON.stringify(newNode));
  }, []);

  // Example component map, use stable references for components to avoid extra re-renders
  const COMPONENT_MAP = useMemo(() => ({
    processor: () => <div>Processor</div>,
    assembly: () => <div>Assembly Editor</div>,
    registers: () => <div>Registers</div>,
    memory: () => <div>Memory</div>,
    timeline: () => <div>Timeline</div>,
    new: () => <div>Empty Window</div>,
  }), []);

  // Render
  return (
    <Mosaic
      renderTile={(id, path) => {
        const Component = COMPONENT_MAP[id];
        return (
          <MosaicWindow path={path} createNode={() => "new"} title={id}>
            <Component />
          </MosaicWindow>
        );
      }}
      initialValue={defaultLayout}
      onChange={handleChange}
      blueprintNamespace="bp5"
    />
  );
});

export default function App() {
  const [frames, setFrames] = useState([]);

  // Only the MosaicContainer is memoized, so changing frames won't re-render it
  return (
    <div id="app">
      {/* ... other UI ... */}
      <MosaicContainer />
    </div>
  );
}
