import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import ResearchApp from "./ResearchApp";
import reportWebVitals from "./reportWebVitals";
import WebApp from "./WebApp";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

function getContentByPath(): React.ReactNode {
  const path = window.location.pathname;
  switch (path) {
    case "/tg/insights":
      return <WebApp mode="insights"/>;
    case "/tg/assess":
      return <WebApp mode="assess"/>;
    default:
      return <ResearchApp />;
  }
}
root.render(<React.StrictMode>{getContentByPath()}</React.StrictMode>);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
