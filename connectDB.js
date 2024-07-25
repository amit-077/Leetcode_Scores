import mongoose from "mongoose";

export const connectDB = async () => {
  const data = await mongoose.connect(process.env.MONGO_URI);
  if (data) {
    console.log("Database connected successfully");
  }
};
