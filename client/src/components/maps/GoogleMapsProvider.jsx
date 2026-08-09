import { APIProvider } from "@vis.gl/react-google-maps";

function GoogleMapsProvider({ children }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  return <APIProvider apiKey={apiKey}>{children}</APIProvider>;
}

export default GoogleMapsProvider;
