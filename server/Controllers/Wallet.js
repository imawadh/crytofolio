const express = require("express");
const mongoose = require("mongoose");
const Transaction = require("../models/Transactions"); //we select the table
const Wallet = require("../models/Wallet"); //we select the table
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;

const getwalletAmount = async (req, res) => {
  try {
    const authToken = req.body.login;
    if (!authToken) return res.status(401).send("No token");

    let userdata;
    try {
      userdata = jwt.verify(authToken, jwtSecret);
    } catch (err) {
      return res.status(401).send("Invalid Token");
    }

    const data = await Wallet.find({ UserId: userdata.user.id });
    res.send(data);
  } catch (error) {
    console.error("Error in getwalletAmount:", error);
    res.status(500).send("ERROR");
  }
};

const getallTransaction = async (req, res) => {
  try {
    const authToken = req.body.login;
    if (!authToken) return res.status(401).send("No token");

    let userdata;
    try {
      userdata = jwt.verify(authToken, jwtSecret);
    } catch (err) {
      return res.status(401).send("Invalid Token");
    }

    const data = await Transaction.find({ UserId: userdata.user.id });
    if (data.length !== 0) {
      res.send(data[0].Transaction);
    } else {
      res.send([]);
    }
  } catch (error) {
    console.error("Error in getallTransaction:", error);
    res.status(500).send("ERROR");
  }
};

module.exports = { getwalletAmount, getallTransaction };
