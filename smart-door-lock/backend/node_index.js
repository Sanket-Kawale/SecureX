const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running...");
});

const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

/* ---------- Test Route ---------- */

app.get("/", (req, res) => {
  res.send("Smart Door Lock Backend Running");
});

/* ---------- Register Member ---------- */

app.post("/register-member", async (req, res) => {

  const { name, phone, type, faceData } = req.body;

  try {

    await pool.query(
      "INSERT INTO members (name, phone, type, face_data) VALUES ($1,$2,$3,$4)",
      [name, phone, type, faceData]
    );

    res.json({ message: "Member registered successfully" });

  } catch (err) {

    console.log(err);
    res.status(500).send("Database error");

  }

});

/* ---------- Get Members ---------- */

app.get("/members", async (req, res) => {

  try {

    const result = await pool.query("SELECT * FROM members");

    res.json(result.rows);

  } catch (err) {

    console.log(err);
    res.status(500).send("Database error");

  }

});

/* ---------- Generate OTP ---------- */

app.get("/generate-otp", (req, res) => {

  const otp = Math.floor(100000 + Math.random() * 900000);

  res.json({ otp });

});

/* ---------- Start Server ---------- */

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
