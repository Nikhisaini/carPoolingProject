import "dotenv/config";
import connectDb from "./db.js";

import VehicleType from "../model/vehicleType.js";
import FuelType from "../model/fuelType.js";
import LicenceCategory from "../model/licenceCategory.js";
import VehicleLicenceMapping from "../model/vehicleLicenceMapping.js";

const seedMasterData = async () => {
  try {
    await connectDb();

    console.log("Database Connected");

    await VehicleType.deleteMany({});
    await FuelType.deleteMany({});
    await LicenceCategory.deleteMany({});
    await VehicleLicenceMapping.deleteMany({});

    const vehicleTypes = await VehicleType.insertMany([
      { name: "Car" },
      { name: "Bike" },
      { name: "Scooter" },
      { name: "SUV" },
      { name: "Van" },
      { name: "Bus" },
    ]);

    await FuelType.insertMany([
      { name: "Petrol" },
      { name: "Diesel" },
      { name: "CNG" },
      { name: "Electric" },
    ]);

    const car = vehicleTypes.find((v) => v.name === "Car");
    const bike = vehicleTypes.find((v) => v.name === "Bike");
    const scooter = vehicleTypes.find((v) => v.name === "Scooter");
    const suv = vehicleTypes.find((v) => v.name === "SUV");
    const van = vehicleTypes.find((v) => v.name === "Van");
    const bus = vehicleTypes.find((v) => v.name === "Bus");

    const licenceCategories = await LicenceCategory.insertMany([
      {
        name: "LMV",
        isActive: true,
      },
      {
        name: "MCWG",
        isActive: true,
      },
      {
        name: "HMV",
        isActive: true,
      },
    ]);

    const lmv = licenceCategories.find((c) => c.name === "LMV");
    const mcwg = licenceCategories.find((c) => c.name === "MCWG");
    const hmv = licenceCategories.find((c) => c.name === "HMV");

    await VehicleLicenceMapping.insertMany([
      {
        vehicleTypeId: car._id,
        licenceCategoryId: lmv._id,
      },
      {
        vehicleTypeId: suv._id,
        licenceCategoryId: lmv._id,
      },
      {
        vehicleTypeId: van._id,
        licenceCategoryId: lmv._id,
      },

      {
        vehicleTypeId: bike._id,
        licenceCategoryId: mcwg._id,
      },
      {
        vehicleTypeId: scooter._id,
        licenceCategoryId: mcwg._id,
      },

      {
        vehicleTypeId: bus._id,
        licenceCategoryId: hmv._id,
      },
    ]);

    console.log("Master Data Seeded Successfully");

    process.exit(0);
  } catch (error) {
    console.log("Seeder Error:", error);
    process.exit(1);
  }
};

seedMasterData();
