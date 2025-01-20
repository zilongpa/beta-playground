import { Tooltip } from "@blueprintjs/core";
import { memo, useContext, useMemo } from "react";
import { EmulatorContext } from "./emulatorContext";

function Registers() {
  const { frames, currentFrame } = useContext(EmulatorContext);
  const rows = [];
  let values = frames[currentFrame].registers;
  for (let i = 0; i <= 31; i++) {
    const u16 = values[i] & 0xffff;
    const i16 = u16 > 0x7fff ? u16 - 0x10000 : u16;
    rows.push(
      <div
        key={i}
        style={{
          display: "flex",
          justifyContent: "space-between",
          margin: "0.2em 1em",
          width: "8em",
          overflowX: "hidden",
        }}
      >
        <b>{`R${i}: `}</b>
        <Tooltip content={`${i16.toString()} (0b${values[i].toString(2).padStart(16, "0")})`}>
          
          <span>{`0x${values[i].toString(16).padStart(4, "0")}`}</span>
        </Tooltip>
      </div>
    );
  }

  return (
    <div
      style={{
        maxHeight: "100%",
        width: "100%",
        overflowY: "auto",
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
      }}
    >
      {rows}
    </div>
  );
}

export default Registers;
