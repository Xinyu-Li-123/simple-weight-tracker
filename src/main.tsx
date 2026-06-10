import React from "react";
import ReactDOM from "react-dom/client";
import "@/i18n";
import { App } from "@/app/App";
import "@/styles/index.css";
import { ToastProvider } from "@/toast/ToastProvider";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </React.StrictMode>,
);
