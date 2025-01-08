import React, { useRef } from 'react';
import CodeMirror, { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript'; // todo: replace with custom lang support

function AssemblyEditor() {
  const editorRef = useRef(null);
  const [value, setValue] = React.useState("console.log('hello world!');");
  const onChange = React.useCallback((val: React.SetStateAction<string>, viewUpdate: any) => {
    console.log('val:', val);
    if (editorRef.current) {
      (editorRef.current as ReactCodeMirrorRef)
    }
    setValue(val);
  }, []);
  return (
    <div style={{
      width: "100%",
      height: "100%",
      backgroundColor: "grey",
      display: "flex",
      // flexDirection: "column",
    }}>
      <CodeMirror ref={editorRef} value={value} height="100%" width='100% !important' minWidth='0' extensions={[javascript({ jsx: true })]} onChange={onChange} style={{ flex: 1 }} />
    </div>
  );
}1
export default AssemblyEditor;