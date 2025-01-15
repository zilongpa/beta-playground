import { TransformWrapper, TransformComponent, getCenterPosition } from "react-zoom-pan-pinch";
import { motion } from "framer-motion";

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

interface BetaVisualizationProps {
  frame: any
  previousFrame: any
}

const BetaVisualization = ({ frame, previousFrame }: BetaVisualizationProps) => {
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
      <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }}><!-- INSERT_SVG_HERE --></TransformComponent>
    </TransformWrapper>
  );
};

export default BetaVisualization;
