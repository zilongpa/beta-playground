import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BlueprintProvider } from "@blueprintjs/core";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BlueprintProvider>
      <App />
    </BlueprintProvider>
  </React.StrictMode>
);
