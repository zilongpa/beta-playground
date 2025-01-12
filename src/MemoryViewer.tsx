import { memo } from "react";
import { HexEditor } from "hex-editor-react";
import "hex-editor-react/dist/hex-editor.css";

interface MemoryViewerProps {
  buffer: ArrayBuffer;
}

function MemoryViewer({ buffer }: MemoryViewerProps) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      <HexEditor
        height="100%"
        width="calc(100%)"
        data={buffer}
        showFooter={false}
        readonly={false}
        dataBase={2}
        bytesPerLine={2}
      />
    </div>
  );
}

export default memo(MemoryViewer);
