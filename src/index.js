import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import './styles.css';
import { LanguageProvider } from './LanguageContext';

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <LanguageProvider>
    <App />
  </LanguageProvider>
);