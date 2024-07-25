import axios from "axios";
import express from "express";
import { User } from "./models/User.js";
import { connectDB } from "./connectDB.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();
connectDB();

// Function to fetch user data
const getUser = async (name, username) => {
  try {
    const { data } = await axios.get(
      `https://alfa-leetcode-api.onrender.com/${username}/solved`
    );

    return {
      name,
      username,
      all: data.solvedProblem,
      easy: data.easySolved,
      medium: data.mediumSolved,
      hard: data.hardSolved,
    };
  } catch (error) {
    console.error(`Error fetching data for ${username}:`, error.message);
    return null;
  }
};

// Function to fetch all users' data in parallel
const getAllUsersData = async () => {
  try {
    const allUsers = await User.find({}, { _id: false, __v: false })
      .select("username")
      .select("name");

    // Fetch all users' data in parallel
    const userDataPromises = allUsers.map((user) =>
      getUser(user.name, user.username)
    );

    // Resolve all promises
    const userDataResults = await Promise.all(userDataPromises);

    // Filter out any null results from failed requests
    const userData = userDataResults.filter((data) => data !== null);

    // Sort user data by the total number of solved problems
    userData.sort((a, b) => b.all - a.all);

    console.log("Score Calculation Status: Done!");
    return userData;
  } catch (error) {
    console.error("Error fetching all users' data:", error.message);
    throw error;
  }
};

// Express route to get scores
app.get("/getScores", async (req, res) => {
  try {
    const data = await getAllUsersData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Error fetching scores" });
  }
});

// Express route to add a new user
app.get("/postUser/:name/:username", async (req, res) => {
  try {
    const { username, name } = req.params;
    const userExists = await User.findOne({ username });

    if (userExists) {
      return res.status(400).send("User exists");
    }

    const data = await User.create({ username, name });

    if (data) {
      res.send("User added successfully");
    }
  } catch (error) {
    res.status(500).json({ error: "Error adding user" });
  }
});

// Express route to get all users
app.get("/getAllUsers", async (req, res) => {
  try {
    const data = await User.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Error fetching users" });
  }
});

// Root route
app.get("/", (req, res) => {
  res.send("Working");
});

// Start server
app.listen(5000, () => {
  console.log("Listening on port 5000");
});
