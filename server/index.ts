import express from "express";
import cors from "cors";
import questionnaireRoute from "./routes/questionnaire";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/questionnaire", questionnaireRoute);

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
