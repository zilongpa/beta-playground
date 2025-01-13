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
          <span>{` 0x${[...crypto.getRandomValues(new Uint8Array(4))]
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("")}`}</span>
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
