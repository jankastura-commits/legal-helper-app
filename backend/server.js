const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post('/process', async (req, res) => {
  try {
    const { text, email } = req.body;

    if (!text || !email) {
      return res.status(400).json({ message: 'Chybí text nebo e-mail.' });
    }

    const icoMatch = text.match(/\b\d{8}\b/);
    let ico = icoMatch ? icoMatch[0] : null;

    let companyInfo = '';
    if (ico) {
      // pokusíme se stáhnout info o firmě
      try {
        const icoData = await axios.get(`https://aresapi.com/api/ico/${ico}`);
        companyInfo = `Název firmy: ${icoData.data.name}\nIČO: ${ico}`;
      } catch (e) {
        console.warn(`Nepodařilo se získat data pro IČO ${ico}:`, e.message);
        companyInfo = `IČO: ${ico} (detail se nepodařilo získat)`;
      }
    } else {
      companyInfo = 'IČO nebylo zadáno. Smlouva bude vytvořena bez konkrétní firmy.';
    }

    // vytvoření textu smlouvy
    const smlouva = `
Návrh kupní smlouvy

${companyInfo}

Text zadání: ${text}

(smlouva bude doplněna právníkem)
`;

    // odeslání e-mailu
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: email,
      subject: 'Návrh smlouvy',
      text: smlouva,
    });

    res.json({
      message: ico ? 'Smlouva byla vytvořena a odeslána.' : 'Smlouva byla vytvořena bez IČO a odeslána.',
      status: 'ok',
    });
  } catch (err) {
    console.error('Chyba při zpracování:', err.message);
    res.status(500).json({ message: 'Došlo k chybě při zpracování požadavku.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server běží na portu ${PORT}`);
});
