const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { getFirmData } = require('./ares');
const { generateDoc } = require('./doc-generator');
const { sendEmail } = require('./emailer');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post('/process', async (req, res) => {
    const { text, email } = req.body;
    const ic = text.match(/IČO\s?(\d{8})/);
    if (!ic) return res.json({ message: "IČO nebylo nalezeno." });

    const firmData = await getFirmData(ic[1]);
    const docPath = await generateDoc(text, firmData);
    await sendEmail(email, docPath);

    res.json({ message: "Dokument byl vygenerován a odeslán e-mailem." });
});

app.listen(3000, () => console.log("Server běží na http://localhost:3000"));