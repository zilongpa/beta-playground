import { memo, useContext } from "react";
import { HexEditor } from "hex-editor-react";
import "hex-editor-react/dist/hex-editor.css";
import { EmulatorContext } from "./emulatorContext";

function MemoryViewer() {
  const { frames, currentFrame } = useContext(EmulatorContext);
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      {frames[currentFrame].buffer.length}
      <HexEditor
        height="100%"
        width="calc(100%)"
        data={frames[currentFrame].buffer}
        showFooter={false}
        readonly={false}
        dataBase={2}
        bytesPerLine={2}
      />
    </div>
  );
}

export default MemoryViewer;
