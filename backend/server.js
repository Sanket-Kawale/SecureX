const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();

// CRITICAL: You must use CORS so your frontend on port 5500 can talk to backend on port 3000
app.use(cors()); 
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

/* ---------- Test Route ---------- */
app.get("/", (req, res) => {
  res.send("SecureX Backend Running");
});

/* ---------- Register Member ---------- */
app.post("/register-member", async (req, res) => {
  const { name, phone, type, faceData, descriptor } = req.body;

  try {
    await pool.query(
      "INSERT INTO members (name, phone, type, face_data, face_descriptor) VALUES ($1,$2,$3,$4,$5)",
      [name, phone, type, faceData, JSON.stringify(descriptor)] // Save math array as text
    );
    res.json({ message: "Entity registered successfully in SecureX Database" });
  } catch (err) {
    console.error("DB Insert Error:", err);
    res.status(500).send("Database error");
  }
});

/* ---------- Get Members ---------- */
app.get("/members", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM members");
    res.json(result.rows);
  } catch (err) {
    console.error("DB Fetch Error:", err);
    res.status(500).send("Database error");
  }
});

/* ---------- Purge Database (For Exhibition Reset) ---------- */
app.delete("/members", async (req, res) => {
  try {
    await pool.query("TRUNCATE TABLE members RESTART IDENTITY");
    res.json({ message: "Database completely wiped." });
  } catch (err) {
    console.error("DB Purge Error:", err);
    res.status(500).send("Database error");
  }
});

/* ---------- PHYSICAL DOOR CONTROL ---------- */
let doorState = "LOCKED";

// 1. Frontend calls this to open the door (We already added this fetch to your HTML!)
app.post("/unlock", (req, res) => {
  doorState = "UNLOCKED";
  console.log("🟢 SYSTEM OVERRIDE: DOOR UNLOCKED!");
  
  // Auto-lock the door after 5 seconds
  setTimeout(() => {
    doorState = "LOCKED";
    console.log("🔴 AUTO-LOCK ENGAGED: DOOR SECURED.");
  }, 5000);
  
  res.json({ success: true, message: "Relay triggered" });
});

// 2. ESP32 constantly reads this to check if it should open
app.get("/door-status", (req, res) => {
  res.send(doorState); // Sends plain text: "LOCKED" or "UNLOCKED"
});

/* ---------- Start Server ---------- */
app.listen(3000, () => {
  console.log("SecureX Mainframe active on Port 3000");
});