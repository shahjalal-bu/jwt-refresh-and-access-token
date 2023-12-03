const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
dotenv.config({
  path: "./config.env",
});

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
const port = process.env.PORT;

app.get("/hi", async (req, res) => {
  res.send({ mes: "Hi there you" });
});

app.post("/api/login", async (req, res) => {
  const user = {
    email: "one@gmail.com",
    password: "1234",
    name: "Sheikh farid",
  };
  const { email, password } = req.body;

  if (email === user.email && password === user.password) {
    const accessToken = await jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "1m",
    });

    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: "1d",
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.status(200).json({ refreshToken, accessToken });
  } else {
    return res.status(406).json({
      message: "Invalid credentials",
    });
  }
});

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ error: "Unauthorized - No token provided" });
  }
  try {
    const accessToken = token.split("Bearer ")[1];
    const user = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: "Unauthorized - Invalid token" });
  }
};

app.post("/test-request", authMiddleware, async (req, res) => {
  try {
    return res.status(200).json({ " user": req.user });
  } catch (error) {
    console.log("expire access token");
    return res.status(401).json({ error: "Unauthorized" });
  }
});

app.post("/refresh-token", async (req, res) => {
  const user = {
    email: "one@gmail.com",
    password: "1234",
  };
  const { refreshToken } = req.cookies;
  if (refreshToken !== undefined) {
    try {
      const userData = await jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
      // data get database / email = userData.email
      const accessToken = await jwt.sign(
        user,
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: "1m",
        }
      );

      const refreshTokenGenerate = jwt.sign(
        user,
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "1d" }
      );
      res.cookie("refreshToken", refreshTokenGenerate, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      });
      res.status(200).json({ refreshToken: refreshTokenGenerate, accessToken });
    } catch (error) {
      return res
        .status(404)
        .json({ error: "Expire refresh token login please" });
    }
  } else {
    return res
      .status(404)
      .json({ error: "Refresh token not found , login please" });
  }
});
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
