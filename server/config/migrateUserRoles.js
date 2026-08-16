import dotenv from "dotenv";

dotenv.config({
  path: "./server/.env",
});

console.log("DB_URI:", process.env.DB_URI);

import connectDb from "./db.js";
import User from "../model/user.js";
import Role from "../model/role.js";

const migrateUserRoles = async () => {
  try {
    await connectDb();

    console.log("Database Connected");

    const userRole = await Role.findOne({ name: "User" });
    const adminRole = await Role.findOne({ name: "Admin" });

    if (!userRole || !adminRole) {
      throw new Error("User or Admin role not found");
    }

    const userResult = await User.updateMany(
      {
        role: "User",
        roleId: { $exists: false },
      },
      {
        $set: {
          roleId: userRole._id,
        },
      },
    );

    const adminResult = await User.updateMany(
      {
        role: "Admin",
        roleId: { $exists: false },
      },
      {
        $set: {
          roleId: adminRole._id,
        },
      },
    );

    console.log(`Users migrated: ${userResult.modifiedCount}`);

    console.log(`Admins migrated: ${adminResult.modifiedCount}`);

    console.log("User role migration completed successfully");

    process.exit(0);
  } catch (error) {
    console.error("Migration Error:", error);
    process.exit(1);
  }
};

migrateUserRoles();
