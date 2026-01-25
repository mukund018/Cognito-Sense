import express from "express";
import cors from "cors";
import questionnaireRoute from "./routes/questionnaire";
import gameRoutes from "./routes/game";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/questionnaire", questionnaireRoute);
app.use("/api/game", gameRoutes);

const PORT = 4000;
app.listen(4000, "0.0.0.0", () => {
  console.log("✅ Backend running on:");
  console.log("➡ http://localhost:4000");
  console.log("➡ http://192.168.1.4:4000");
});

