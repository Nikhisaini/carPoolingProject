const validateRideSearch = ({
  from,
  to,
  date,
  seats,
  page = 1,
  limit = 10,
}) => {
  if (!from || typeof from !== "string" || !from.trim()) {
    return {
      success: false,
      message: "Departure city is required",
    };
  }

  if (!to || typeof to !== "string" || !to.trim()) {
    return {
      success: false,
      message: "Destination city is required",
    };
  }

  const departureCity = from.trim();
  const destinationCity = to.trim();

  if (departureCity.toLowerCase() === destinationCity.toLowerCase()) {
    return {
      success: false,
      message: "Departure and destination cities cannot be the same",
    };
  }

  if (!date || typeof date !== "string" || !date.trim()) {
    return {
      success: false,
      message: "Travel date is required",
    };
  }

  const dateValue = date.trim();
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;

  if (!datePattern.test(dateValue)) {
    return {
      success: false,
      message: "Travel date must be in YYYY-MM-DD format",
    };
  }

  const [year, month, day] = dateValue.split("-").map(Number);
  const travelDate = new Date(Date.UTC(year, month - 1, day));

  if (
    travelDate.getUTCFullYear() !== year ||
    travelDate.getUTCMonth() !== month - 1 ||
    travelDate.getUTCDate() !== day
  ) {
    return {
      success: false,
      message: "Invalid travel date",
    };
  }

  const today = new Date();

  const todayUTC = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
  );

  if (travelDate < todayUTC) {
    return {
      success: false,
      message: "Travel date cannot be in the past",
    };
  }

  const seatsNumber = Number(seats);

  if (!Number.isInteger(seatsNumber) || seatsNumber < 1) {
    return {
      success: false,
      message: "Seats must be a positive whole number",
    };
  }

  const pageNumber = Number(page);

  if (!Number.isInteger(pageNumber) || pageNumber < 1) {
    return {
      success: false,
      message: "Page must be a positive whole number",
    };
  }

  const limitNumber = Number(limit);

  if (!Number.isInteger(limitNumber) || limitNumber < 1) {
    return {
      success: false,
      message: "Limit must be a positive whole number",
    };
  }

  if (limitNumber > 50) {
    return {
      success: false,
      message: "Limit cannot be greater than 50",
    };
  }

  return {
    success: true,
    data: {
      departureCity,
      destinationCity,
      travelDate,
      seats: seatsNumber,
      page: pageNumber,
      limit: limitNumber,
    },
  };
};

export default validateRideSearch;
