import { Tooltip } from "@blueprintjs/core";
import { memo, useMemo } from "react";

interface RegistersProps {
  values: Array<number>;
}

function Registers({ values }: RegistersProps) {
  const rows = useMemo(() => {
    const rowsArray = [];
    for (let i = 0; i <= 31; i++) {
      rowsArray.push(
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
          <Tooltip content={`${values[i].toString()} (0b${values[i].toString(2).padStart(16, "0")})`}>
          <span>{`0x${values[i].toString(16).padStart(4, "0")}`}</span>
          </Tooltip>
        </div>
      );
    }
    return rowsArray;
  }, [values]);

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

export default memo(Registers);
