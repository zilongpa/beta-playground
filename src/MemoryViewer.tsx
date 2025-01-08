import { memo } from "react";
import { HexEditor } from "hex-editor-react";

interface MemoryViewerProps {
  buffer: ArrayBuffer;
}

function MemoryViewer({ buffer }: MemoryViewerProps) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "white",
      }}
    >
      <HexEditor
        height="100%"
        width="calc(100%)"
        data={buffer}
        showFooter={false}
        readonly={false}
      />
    </div>
  );
}

export default memo(MemoryViewer);
