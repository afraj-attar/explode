import React from 'react';
import ReactDOM from 'react-dom/client';
import { Viewer } from './viewer';
import "./index.css";

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Viewer canvasId={"viewer"} />
  </React.StrictMode>
);