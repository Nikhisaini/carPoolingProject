import { useEffect, useRef, useState } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { MapPin } from "lucide-react";

const normalizeCity = (value) => {
  return (
    value?.trim().toLowerCase().replace(/\s+/g, " ").replace(/[.,]/g, "") || ""
  );
};

const getComponent = (components, types) => {
  for (const type of types) {
    const component = components.find((item) => item.types?.includes(type));

    if (component?.longText) {
      return component.longText.trim();
    }
  }

  return "";
};

const getCityFromPlace = (components, displayName) => {
  const locality = getComponent(components, [
    "locality",
    "postal_town",
    "sublocality_level_1",
    "sublocality",
  ]);

  if (locality) {
    return locality;
  }

  const administrativeArea = getComponent(components, [
    "administrative_area_level_2",
  ]);

  if (administrativeArea) {
    return administrativeArea
      .replace(/\s+Division$/i, "")
      .replace(/\s+District$/i, "")
      .trim();
  }

  const fallback = displayName?.trim() || "";

  return fallback;
};

function LocationAutocomplete({
  label,
  placeholder = "Search location",
  onPlaceSelect,
}) {
  const places = useMapsLibrary("places");

  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [sessionToken, setSessionToken] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const containerRef = useRef(null);
  const selectedPlaceRef = useRef(false);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!places) {
      return;
    }

    setSessionToken(new places.AutocompleteSessionToken());
  }, [places]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setSuggestions([]);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    if (selectedPlaceRef.current) {
      selectedPlaceRef.current = false;
      return;
    }

    if (!places || !inputValue.trim() || !sessionToken) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    if (inputValue.trim().length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    let cancelled = false;
    const currentRequestId = ++requestIdRef.current;

    const getSuggestions = async () => {
      try {
        setIsLoading(true);

        const request = {
          input: inputValue.trim(),
          includedRegionCodes: ["in"],
          sessionToken,
        };

        const { suggestions } =
          await places.AutocompleteSuggestion.fetchAutocompleteSuggestions(
            request,
          );

        if (cancelled || currentRequestId !== requestIdRef.current) {
          return;
        }

        const validSuggestions = (suggestions || []).filter(
          (suggestion) => suggestion.placePrediction,
        );

        setSuggestions(validSuggestions);
        setIsOpen(validSuggestions.length > 0);
      } catch (error) {
        if (!cancelled) {
          console.error("Google Places Autocomplete Error:", error);
          setSuggestions([]);
          setIsOpen(false);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    const timeoutId = setTimeout(getSuggestions, 250);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [places, inputValue, sessionToken]);

  const handleInputChange = (event) => {
    const newValue = event.target.value;

    selectedPlaceRef.current = false;
    setInputValue(newValue);

    if (!newValue.trim()) {
      setSuggestions([]);
      setIsOpen(false);
    }
  };

  const handleSelect = async (suggestion) => {
    try {
      const placePrediction = suggestion?.placePrediction;

      if (!placePrediction) {
        return;
      }

      setIsOpen(false);
      setSuggestions([]);
      requestIdRef.current += 1;
      setIsLoading(true);

      const place = placePrediction.toPlace();

      await place.fetchFields({
        fields: [
          "id",
          "displayName",
          "formattedAddress",
          "location",
          "addressComponents",
        ],
      });

      const location = place.location;

      if (!location) {
        console.error("Selected place has no location");
        return;
      }

      const addressComponents = place.addressComponents || [];

      const city = getCityFromPlace(
        addressComponents,
        place.displayName || place.formattedAddress,
      );

      const state = getComponent(addressComponents, [
        "administrative_area_level_1",
      ]);

      const country = getComponent(addressComponents, ["country"]) || "India";

      const cityNormalized = normalizeCity(city);

      if (!cityNormalized) {
        console.error("Unable to determine city for selected place");
        return;
      }

      const selectedLocation = {
        placeId: place.id || "",
        placeName: place.displayName || "",
        address: place.formattedAddress || "",
        city,
        cityNormalized,
        state,
        country,
        latitude: location.lat(),
        longitude: location.lng(),
      };

      selectedPlaceRef.current = true;

      setInputValue(selectedLocation.placeName || selectedLocation.address);

      onPlaceSelect?.(selectedLocation);

      setSessionToken(new places.AutocompleteSessionToken());
    } catch (error) {
      console.error("Place Selection Error:", error);
      setIsOpen(false);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="mb-2 block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <MapPin className="h-4 w-4 text-slate-400" />
        </div>

        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => {
            if (suggestions.length > 0 && !selectedPlaceRef.current) {
              setIsOpen(true);
            }
          }}
          placeholder={placeholder}
          autoComplete="off"
          className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
        />

        {isLoading && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-4">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
          </div>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          <div className="max-h-72 overflow-y-auto p-1.5">
            {suggestions.map((suggestion) => {
              const prediction = suggestion.placePrediction;

              if (!prediction) {
                return null;
              }

              return (
                <button
                  key={prediction.placeId}
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault();
                  }}
                  onClick={() => handleSelect(suggestion)}
                  className="flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition hover:bg-slate-50 active:bg-slate-100"
                >
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100">
                    <MapPin className="h-4 w-4 text-slate-500" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {prediction.mainText?.text || ""}
                    </p>

                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {prediction.secondaryText?.text || ""}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="border-t border-slate-100 px-3 py-2 text-right text-[10px] text-slate-400">
            Powered by Google
          </div>
        </div>
      )}
    </div>
  );
}

export default LocationAutocomplete;
