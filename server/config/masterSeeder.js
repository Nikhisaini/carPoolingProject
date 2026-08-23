import "dotenv/config";
import connectDb from "./db.js";

import FuelType from "../model/fuelType.js";
import LicenceCategory from "../model/licenceCategory.js";
import Role from "../model/role.js";

const seedMasterData = async () => {
  try {
    await connectDb();

    console.log("Database Connected");

    // Seed Fuel Types
    const fuelTypes = ["Petrol", "Diesel", "CNG", "Electric"];
    for (const name of fuelTypes) {
      await FuelType.findOneAndUpdate(
        { name },
        { name, isActive: true },
        { upsert: true, new: true },
      );
    }

    // Seed Licence Categories
    const categories = [
      { type: "LMV", name: "Car", isActive: true },
      { type: "MCWG", name: "Bike/Scooter", isActive: true },
      { type: "HMV", name: "Bus", isActive: true },
    ];
    for (const cat of categories) {
      await LicenceCategory.findOneAndUpdate({ type: cat.type }, cat, {
        upsert: true,
        new: true,
      });
    }

    // Seed Roles
    await Role.findOneAndUpdate(
      { name: "User" },
      {
        name: "User",
        isActive: true,
      },
      {
        upsert: true,
        new: true,
      },
    );

    await Role.findOneAndUpdate(
      { name: "Admin" },
      {
        name: "Admin",
        isActive: true,
      },
      {
        upsert: true,
        new: true,
      },
    );

    console.log("Master Data Seeded Successfully");

    process.exit(0);
  } catch (error) {
    console.log("Seeder Error:", error);
    process.exit(1);
  }
};

seedMasterData();
