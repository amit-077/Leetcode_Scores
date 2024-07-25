import axios from "axios";
import express from "express";
import { User } from "./models/User.js";
import { connectDB } from "./connectDB.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();
connectDB();

const getUser = async (name, username) => {
  let { data } = await axios.get(
    `https://alfa-leetcode-api.onrender.com/${username}/solved`
  );

  let userData = {
    name: name,
    username: username,
    all: data.solvedProblem,
    easy: data.easySolved,
    medium: data.mediumSolved,
    hard: data.hardSolved,
  };

  return userData;
};

const getAllUsersData = async () => {
  let allUsers = await User.find({}, { _id: false, __v: false })
    .select("username")
    .select("name");

  let userData = [];

  for (let i = 0; i < allUsers.length; i++) {
    console.log("Getting score for : " + allUsers[i].name);
    let data = await getUser(allUsers[i].name, allUsers[i].username);
    userData.push(data);
  }

  userData.sort((a, b) => b.all - a.all);
  console.log("Score Calculation Status : Done!!");
  return userData;
};

app.get("/getScores", async (req, res) => {
  try {
    let data = await getAllUsersData();
    res.send(data);
  } catch (e) {
    console.log(e);
  }
});

app.get("/postUser/:name/:username", async (req, res) => {
  try {
    let { username, name } = req.params;
    let userExists = await User.findOne({
      username,
    });
    if (userExists) {
      res.send("User exists");
      return;
    }
    const data = await User.create({
      username,
      name,
    });
    if (data) {
      res.send("User added successfully");
    }
  } catch (e) {
    console.log(e);
  }
});

app.get("/getAllUsers", async (req, res) => {
  let data = await User.find();
  res.send(data);
});

app.listen(5000, () => {
  console.log("Listening on port 5000");
});
