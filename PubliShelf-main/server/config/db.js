import { connect } from "mongoose";

const connectDB = async (DATABASE_URL) => {
  try {
    await connect(DATABASE_URL);
    console.log("Database connected..");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

export default connectDB;
