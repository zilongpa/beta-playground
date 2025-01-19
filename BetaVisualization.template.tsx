import {
  TransformWrapper,
  TransformComponent,
  getCenterPosition,
} from "react-zoom-pan-pinch";
import { motion } from "framer-motion";
import { useContext } from "react";
import { EmulatorContext } from "./emulatorContext";

const getItem = (key: string, defaultValue: any = null): any => {
  const value = localStorage.getItem(key);
  if (value === null && defaultValue !== null) {
    return defaultValue;
  }
  return value !== null ? value : defaultValue;
};

const setItem = (key: string, value: string): void => {
  if (value === "") {
    localStorage.removeItem(key);
  } else {
    localStorage.setItem(key, value);
  }
};

const BetaVisualization = () => {
  const { frames, currentFrame } = useContext(EmulatorContext);
  const DEFAULT_FRAME = {}; // Define a default frame object as needed
  let frame = frames.length > 0 ? frames[currentFrame] : DEFAULT_FRAME;
  let previousFrame =
    frames.length === 0 || currentFrame === 0
      ? frames[0]
      : frames[currentFrame - 1];
  console.log(frame, previousFrame);
  return (
    <TransformWrapper
      limitToBounds={true}
      initialPositionX={parseInt(getItem("positionX", 2.5))}
      initialPositionY={parseInt(getItem("positionY", 17.5))}
      initialScale={parseInt(getItem("scale", 2))}
      minScale={2}
      maxScale={10}
      wheel={{ smoothStep: 0.005 }}
      onTransformed={(ref) => {
        setItem("scale", ref.state.scale.toString());
        setItem("positionX", ref.state.positionX.toString());
        setItem("positionY", ref.state.positionY.toString());
      }}
    >
      <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }}>
        <!-- INSERT_SVG_HERE -->
      </TransformComponent>
    </TransformWrapper>
  );
};

export default BetaVisualization;
