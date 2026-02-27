import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import Admin from "../models/Admin.model.js";

dotenv.config();

const seedSuperAdmin = async () => {
  try {
    console.log("⏳ Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URL);
    console.log("✅ MongoDB Connected!");

    const adminEmail = "prathameshingle72@gmail.com"; // Change this to your actual email

    // Check if we already seeded the admin
    const existingAdmin = await Admin.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log("⚠️ Super Admin already exists in the database. Aborting.");
      process.exit(0);
    }

    // Encrypt the God-Mode password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("AdminPayNidhi@123", salt); // Change this password!

    await Admin.create({
      name: "Sanket Bochare", // Or "PayNidhi Super Admin"
      email: adminEmail,
      password: hashedPassword,
      role: "superadmin"
    });

    console.log("🎉 Success! God-Mode Admin locked into the database.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding Error:", error);
    process.exit(1);
  }
};

seedSuperAdmin();