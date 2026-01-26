import cors from "cors";
import express from "express";

import eyeTrackingRoute from "./routes/eyeTracking.js";
import gameRoutes from "./routes/game.js";
import questionnaireRoute from "./routes/questionnaire.js";

const app = express();

/* ===============================
   MIDDLEWARE
================================ */

// Allow requests from anywhere (Netlify, localhost, etc.)
app.use(cors());

// Allow JSON body parsing
app.use(express.json());

/* ===============================
   ROUTES
================================ */

app.use("/api/questionnaire", questionnaireRoute);
app.use("/api/game", gameRoutes);
app.use("/api/eye-tracking", eyeTrackingRoute);

// Health check (VERY IMPORTANT for Render)
app.get("/", (req, res) => {
  res.status(200).send("✅ CognitoSense Backend is Running");
});

/* ===============================
   SERVER START
================================ */

// Render provides PORT automatically
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
