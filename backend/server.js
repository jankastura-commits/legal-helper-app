const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// ✅ Hlavní endpoint
app.post("/process", async (req, res) => {
  try {
    const { text, email } = req.body;

    if (!text || !email) {
      return res.status(400).json({ message: "Chybí text nebo e-mail." });
    }

    // ✅ Vyhledání IČO v textu
    const icoMatch = text.match(/\b\d{8}\b/);
    let ico = icoMatch ? icoMatch[0] : null;
    let companyInfo = "";

    if (ico) {
      try {
        const icoData = await axios.get(`https://aresapi.com/api/ico/${ico}`);
        companyInfo = `Název firmy: ${icoData.data.name}\nIČO: ${ico}`;
      } catch (e) {
        console.warn(`⚠️ Nepodařilo se získat data pro IČO ${ico}:`, e.message);
        companyInfo = `IČO: ${ico} (detail se nepodařilo získat)`;
      }
    } else {
      companyInfo = "IČO nebylo zadáno. Smlouva bude vytvořena bez konkrétní firmy.";
    }

    // ✅ Generování textu smlouvy (zatím staticky, můžeš nahradit GPT)
    const smlouva = `
📄 Návrh kupní smlouvy

${companyInfo}

Zadání: ${text}

Tento návrh je vytvořen automaticky a měl by být zkontrolován právníkem.
`;

    // ✅ Odeslání e-mailu
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.MAIL_USER,
        to: email,
        subject: "Návrh kupní smlouvy",
        text: smlouva,
      });

      console.log(`📨 E-mail odeslán na ${email}`);
    } catch (mailError) {
      console.error("❌ Chyba při odesílání e-mailu:", mailError);
      return res
        .status(500)
        .json({ message: "Smlouva byla vytvořena, ale e-mail se nepodařilo odeslat." });
    }

    // ✅ Úspěšná odpověď
    res.json({
      message: ico
        ? "Smlouva byla vytvořena a odeslána."
        : "Smlouva byla vytvořena bez IČO a odeslána.",
      status: "ok",
    });
  } catch (err) {
    console.error("❌ Chyba při zpracování požadavku:", err);
    res.status(500).json({ message: "Došlo k chybě při zpracování požadavku." });
  }
});

// ✅ Testovací endpoint
app.get("/", (req, res) => {
  res.send("✅ Legal Helper backend běží správně.");
});

// ✅ Spuštění serveru
app.listen(PORT, () => {
  console.log(`🚀 Server běží na portu ${PORT}`);
});
