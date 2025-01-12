import { memo, useCallback, useRef, useState } from "react";
import CodeMirror, { ReactCodeMirrorRef, ViewUpdate } from "@uiw/react-codemirror";
import {EditorView} from "@codemirror/view";
import { javascript } from "@codemirror/lang-javascript"; // todo: replace with custom lang support

interface AssemblyEditorProps {
  defaultValue: string;
  onChange: (val: string, viewUpdate: any) => void;
}

function AssemblyEditor({ defaultValue, onChange }: AssemblyEditorProps) {
  const editorRef = useRef<ReactCodeMirrorRef>(null);
  const [value, setValue] = useState(defaultValue);
  const handleEditorChange = useCallback((val: string, viewUpdate: ViewUpdate) => {
    setValue(val);
    onChange(val, viewUpdate);
  }, []);
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
      }}
    >
      <CodeMirror
        ref={editorRef}
        value={value}
        height="100%"
        width="100%"
        extensions={[javascript({ jsx: true }), EditorView.lineWrapping]}
        onChange={handleEditorChange}
        style={{ flex: 1 }}
      />
    </div>
  );
}
export default AssemblyEditor;
