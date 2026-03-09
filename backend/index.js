const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const { authRouter } = require("./routes/auth.router");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.use("/api/v1/auth", authRouter);

const PORT = process.env.PORT || 4000;

mongoose.connect(process.env.MONGODB_URL)
.then(() => console.log("DB Connected"))
.catch((err) => console.log("Failed to connect DB", err))

app.listen(PORT, () => console.log("Server running at", PORT));