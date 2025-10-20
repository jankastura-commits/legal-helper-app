const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post("/api/generate", async (req, res) => {
  const {
    party1_type,
    party1_name,
    party1_address,
    party1_ico,
    party1_representative,
    party1_role,
    party2_type,
    party2_name,
    party2_address,
    party2_ico,
    party2_representative,
    party2_role,
    situation,
    email,
  } = req.body;

  // ✅ Validace základních polí
  if (!party1_name || !party1_address || !party2_name || !party2_address || !situation || !email) {
    return res.status(400).json({ error: "Chybí povinné údaje ve formuláři." });
  }

  // ✅ Fallback: pokud není IČO, vytvoří se obecná identifikace
  const party1_id = party1_ico ? `IČO: ${party1_ico}` : `(bez IČO)`;
  const party2_id = party2_ico ? `IČO: ${party2_ico}` : `(bez IČO)`;

  // ✅ Pokud je společnost zastoupena osobou
  const party1_rep = party1_representative
    ? `, zastoupená ${party1_representative}${party1_role ? ` (${party1_role})` : ""}`
    : "";
  const party2_rep = party2_representative
    ? `, zastoupená ${party2_representative}${party2_role ? ` (${party2_role})` : ""}`
    : "";

  // 🧾 Text smlouvy
  const contract = `
SMLUVNÍ STRANY:

1️⃣ ${party1_name}, ${party1_address}, ${party1_id}${party1_rep}
2️⃣ ${party2_name}, ${party2_address}, ${party2_id}${party2_rep}

PŘEDMĚT SMLOUVY:
${situation}

Tato smlouva byla automaticky vygenerována nástrojem Legal Helper.
`;

  // ✅ Odeslání e-mailu se smlouvou
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: email,
      subject: "Návrh smlouvy – Legal Helper",
      text: contract,
    });

    res.json({ message: "Smlouva byla úspěšně vytvořena a odeslána e-mailem." });
  } catch (error) {
    console.error("❌ Chyba při odesílání e-mailu:", error);
    res.status(500).json({ error: "Nepodařilo se odeslat e-mail." });
  }
});

// ✅ Testovací endpoint
app.get("/", (req, res) => {
  res.send("✅ Legal Helper backend běží správně.");
});

// ✅ Spuštění serveru
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server běží na portu ${PORT}`);
});
