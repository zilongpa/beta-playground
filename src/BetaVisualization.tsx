import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import betaSVG from "./assets/beta.svg";

const BetaVisualization = () => {
  return (
    <TransformWrapper limitToBounds={true} centerOnInit={true} initialScale={0.2} minScale={0.2} maxScale={2.0}>
      <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }}>
        <img src={betaSVG} className="betaSVG" alt="beta processor" />
      </TransformComponent>
    </TransformWrapper>
  );
};

export default BetaVisualization;
