import cors from "cors";
import express from "express";

import eyeTrackingRoute from "./routes/eyeTracking";
import gameRoutes from "./routes/game";
import questionnaireRoute from "./routes/questionnaire";

const app = express();

app.use(cors());
app.use(express.json());

// ✅ Routes
app.use("/api/questionnaire", questionnaireRoute);
app.use("/api/game", gameRoutes);
app.use("/api/eye-tracking", eyeTrackingRoute);

// ✅ Health check (optional but useful)
app.get("/", (req, res) => {
  res.send("✅ CognitoSense Backend is Running");
});

const PORT = parseInt(process.env.PORT || "4000", 10);

app.listen(PORT, "0.0.0.0", () => {
  console.log("✅ Backend running on:");
  console.log(`➡ http://localhost:${PORT}`);
  console.log(`➡ http://10.248.232.224:${PORT}`);
});
