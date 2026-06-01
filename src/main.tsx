import React from "react";
import ReactDOM from "react-dom/client";
import Framework7 from "framework7/lite-bundle";
import Framework7React from "framework7-react";
import "framework7/css/bundle";
import "framework7-icons/css/framework7-icons.css";
import "material-icons/iconfont/material-icons.css";
import { App } from "./app/App";
import "./styles.css";

const registerFramework7Plugin = Framework7.use.bind(Framework7);
registerFramework7Plugin(Framework7React);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
