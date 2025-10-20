const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { getFirmData } = require('./ares');
const { generateDoc } = require('./doc-generator');
const { sendEmail } = require('./emailer');

const app = express();

// ✅ CORS konfigurace pro Netlify frontend
app.use(cors({
  origin: 'https://legal-helper-app.netlify.app', // změň pokud máš jinou doménu
  methods: ['POST'],
}));

app.use(bodyParser.json());

app.post('/process', async (req, res) => {
  try {
    const { text, email } = req.body;

    // ✅ Vytažení IČO ze zadaného textu
    const ic = text.match(/IČO\s?(\d{8})/);
    if (!ic) {
      return res.status(400).json({ message: "IČO nebylo nalezeno v textu." });
    }

    const ico = ic[1];

    // ✅ Načtení dat z ARES
    const firmData = await getFirmData(ico);

    // ✅ Vygenerování dokumentu
    const docPath = await generateDoc(text, firmData);

    // ✅ Odeslání e-mailem
    await sendEmail(email, docPath);

    res.json({ message: "Dokument byl vygenerován a odeslán e-mailem." });
  } catch (error) {
    console.error('Chyba při zpracování:', error);
    res.status(500).json({ message: "Nastala chyba při zpracování požadavku." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server běží na http://localhost:${PORT}`);
});
