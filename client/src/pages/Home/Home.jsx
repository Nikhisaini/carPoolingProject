import LocationAutocomplete from "@/components/maps/LocationAutocomplete";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRight,
  BriefcaseBusiness,
  ChevronRight,
  Minus,
  Plus,
  Search,
  ShieldCheck,
  Users,
  WalletCards,
} from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();
  const [departureLocation, setDepartureLocation] = useState(null);
  const [destinationLocation, setDestinationlocation] = useState(null);
  const [travelDate, setTravelDate] = useState("");
  const [seats, setSeats] = useState(1);
  const [showPassengerMenu, setShowPassengerMenu] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleDepartureChange = (location) => {
    setDepartureLocation(location);
    setErrorMessage("");
  };
  const handleDestinationChange = (location) => {
    setDestinationlocation(location);
    setErrorMessage("");
  };

  const increaseSeats = () => {
    setSeats((current) => current + 1);
  };
  const decreaseSeats = () => {
    setSeats((current) => Math.max(current - 1, 1));
  };

  const validateSearch = () => {
    if (!departureLocation) {
      setErrorMessage("Please select your departure location");
      return false;
    }
    if (!destinationLocation) {
      setErrorMessage("Please select your destination location");
      return false;
    }
    if (
      departureLocation.city?.toLowerCase() ===
      destinationLocation.city?.toLowerCase()
    ) {
      setErrorMessage("Departure and destination cities cannot be the same");
      return false;
    }
    if (!travelDate) {
      setErrorMessage("Please select yout travel date");
      return false;
    }
    if (!Number.isInteger(seats) || seats < 1) {
      setErrorMessage("Please select at least one seat");
      return false;
    }
    return true;
  };

  const handleSearch = () => {
    setErrorMessage("");
    if (!validateSearch()) {
      return;
    }
    navigate("/ride/results", {
      state: {
        departureLocation,
        destinationLocation,
        travelDate,
        seats,
      },
    });
  };
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-[#f5f7fb]">
        <div className="mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 lg:px-8 lg:pb-16 lg:pt-10">
          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
            <div className="max-w-2xl">
              <p className="mb-4 text-sm font-semibold text-blue-600">
                Find your next ride
              </p>

              <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight text-[#071d49] sm:text-5xl lg:text-[54px]">
                Travel anywhere
                <br />
                together. Spend smarter.
              </h1>

              <p className="mt-5 max-w-xl text-base leading-7 text-gray-600 sm:text-lg">
                Find affordable rides, connect with fellow travelers, and get
                where you need to go comfortably.
              </p>
            </div>

            <div className="overflow-hidden rounded-3xl">
              <img
                src="src/assets/carpool-hero.jpg"
                alt="People traveling together by car"
                className="h-[260px] w-full object-cover sm:h-[340px] lg:h-[360px]"
              />
            </div>
          </div>

          <div className="relative z-20 mt-8">
            {errorMessage && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm font-medium text-red-700">
                  {errorMessage}
                </p>
              </div>
            )}

            <Card className="overflow-visible rounded-[24px] border-2 border-[#2878ff] bg-white py-0 shadow-[0_6px_20px_rgba(37,99,235,0.12)]">
              <CardContent className="p-0">
                <div className="flex min-h-[72px] flex-col lg:h-[80px] lg:flex-row lg:items-stretch">
                  <div className="min-w-0 flex-1 border-b border-gray-200 px-4 py-3 lg:border-b-0 lg:border-r">
                    <label className="block text-xs font-semibold leading-4 text-gray-500">
                      From
                    </label>

                    <LocationAutocomplete
                      onPlaceSelect={handleDepartureChange}
                      placeholder="City or place"
                    />
                  </div>

                  <div className="min-w-0 flex-1 border-b border-gray-200 px-4 py-3 lg:border-b-0 lg:border-r">
                    <label className="block text-xs font-semibold leading-4 text-gray-500">
                      To
                    </label>

                    <LocationAutocomplete
                      onPlaceSelect={handleDestinationChange}
                      placeholder="City or place"
                    />
                  </div>

                  <div className="border-b border-gray-200 px-4 py-3 lg:w-[190px] lg:border-b-0 lg:border-r">
                    <label
                      htmlFor="travelDate"
                      className="block text-xs font-semibold leading-4 text-gray-500"
                    >
                      Departure
                    </label>

                    <input
                      id="travelDate"
                      type="date"
                      value={travelDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(event) => {
                        setTravelDate(event.target.value);
                        setErrorMessage("");
                      }}
                      className="mt-0.5 h-6 w-full cursor-pointer border-0 bg-transparent p-0 text-sm font-semibold text-gray-900 outline-none focus:ring-0"
                    />
                  </div>

                  <div className="relative border-b border-gray-200 px-4 py-3 lg:w-[200px] lg:border-b-0 lg:border-r">
                    <button
                      type="button"
                      onClick={() => setShowPassengerMenu((prev) => !prev)}
                      className="block w-full text-left"
                    >
                      <span className="block text-xs font-semibold leading-4 text-gray-500">
                        Passengers
                      </span>

                      <span className="mt-0.5 block text-sm font-semibold leading-6 text-gray-900">
                        {seats} {seats === 1 ? "passenger" : "passengers"}
                      </span>
                    </button>

                    {showPassengerMenu && (
                      <div className="absolute right-0 top-[calc(100%+5px)] z-50 w-[375px] max-w-[calc(100vw-32px)] rounded-2xl bg-white px-5 py-4 shadow-xl ring-1 ring-black/5">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-[#071d49]">
                            Passenger
                          </span>

                          <div className="flex items-center gap-5">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              disabled={seats <= 1}
                              onClick={(event) => {
                                event.stopPropagation();
                                decreaseSeats();
                              }}
                              className="h-5 w-5 rounded-full border-gray-300 p-0 text-gray-500 hover:border-blue-500 hover:text-blue-600"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>

                            <span className="min-w-[12px] text-center text-base font-semibold text-gray-900">
                              {seats}
                            </span>

                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={(event) => {
                                event.stopPropagation();
                                increaseSeats();
                              }}
                              className="h-5 w-5 rounded-full border-blue-500 p-0 text-blue-600 hover:bg-blue-50"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex self-stretch lg:w-[190px] lg:shrink-0">
                    <Button
                      type="button"
                      onClick={handleSearch}
                      className="h-full w-full rounded-none rounded-r-[22px] bg-[#2161f5] px-8 text-[16px] font-semibold text-white shadow-none hover:bg-[#185bea]"
                    >
                      Search
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
