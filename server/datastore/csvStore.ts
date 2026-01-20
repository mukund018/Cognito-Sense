import fs from "fs";
import path from "path";

const CSV_PATH = path.join(__dirname, "../../data/cognito_sense_master.csv");

const HEADERS = [
  "user_id",
  "email",
  "questionnaire_response",
  "q_total_score",
  "target_risk_class",
  "q_completed_at",
  "created_at",
  "last_updated",
];

function ensureCSV() {
  if (!fs.existsSync(CSV_PATH)) {
    fs.mkdirSync(path.dirname(CSV_PATH), { recursive: true });
    fs.writeFileSync(CSV_PATH, HEADERS.join(",") + "\n");
  }
}

function readRows(): string[][] {
  ensureCSV();
  const lines = fs.readFileSync(CSV_PATH, "utf-8").trim().split("\n");
  return lines.slice(1).map((l) => l.split(","));
}

function writeRows(rows: string[][]) {
  const content =
    HEADERS.join(",") + "\n" + rows.map((r) => r.join(",")).join("\n") + "\n";
  fs.writeFileSync(CSV_PATH, content);
}

export function saveQuestionnaire(data: {
  userId: string;
  email: string;
  questionnaireResponse: any;
  totalScore: number;
  targetClass: number;
}) {
  console.log("📝 Saving questionnaire for user:", data.userId);

  const rows = readRows();
  console.log("📄 Rows before:", rows.length);

  const now = new Date().toISOString();
  const idx = rows.findIndex((r) => r[0] === data.userId);

  const escapedJSON = `"${JSON.stringify(data.questionnaireResponse).replace(/"/g, '""')}"`;

  if (idx === -1) {
    console.log("➕ Creating new row");
    const row = HEADERS.map(() => "");
    row[0] = data.userId;
    row[1] = data.email;
    row[2] = escapedJSON;
    row[3] = String(data.totalScore);
    row[4] = String(data.targetClass);
    row[5] = now;
    row[6] = now;
    row[7] = now;
    rows.push(row);
  } else {
    console.log("✏️ Updating existing row");
    rows[idx][2] = escapedJSON;
    rows[idx][3] = String(data.totalScore);
    rows[idx][4] = String(data.targetClass);
    rows[idx][5] = now;
    rows[idx][7] = now;
  }

  writeRows(rows);
  console.log("✅ CSV write complete");
}
