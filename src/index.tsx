import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import App from "./components/App";
import "./index.css";
import { store } from "./store";

const root = createRoot(document.getElementById("root")!);
root.render(
  // <React.StrictMode>
  <Provider store={store}>
    <App />
  </Provider>
  // </React.StrictMode>
);
