import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import GoogleMapsProvider from "./components/maps/GoogleMapsProvider";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <GoogleMapsProvider>
          <App />
        </GoogleMapsProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
);
