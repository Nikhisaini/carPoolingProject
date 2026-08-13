import "./App.css";
import AppRoutes from "./routes/AppRoutes";
import "@fontsource/montserrat";
import "@fontsource/montserrat/700.css";
import "@fontsource/rubik";
import "@fontsource/rubik/700.css";
import { Toaster } from "./components/ui/sonner";

function App() {
  return (
    <>
      <AppRoutes />
      <Toaster />
    </>
  );
}

export default App;
