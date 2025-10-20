const express = require("express");
const cors = require("cors");
const axios = require("axios");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("✅ Legal Helper backend běží správně.");
});

// Endpoint pro získání údajů z OpenCorporates na základě IČO
app.get("/api/ares", async (req, res) => {
  const ico = req.query.ico?.trim();
  if (!ico || ico.length !== 8) {
    return res.status(400).json({ error: "Neplatné IČO" });
  }

  const token = process.env.OPENCORP_API_TOKEN || "f3e38dad06f6411e8ef0b351205af317";

  try {
    const response = await axios.get(`https://api.opencorporates.com/v0.4/companies/cz/${ico}`, {
      headers: {
        Authorization: `Token token=${token}`,
      },
    });

    const data = response.data?.results?.company;
    if (!data) {
      return res.status(404).json({ error: "Firma nebyla nalezena" });
    }

    const name = data.name;
    const address = data.registered_address_in_full || "neuvedeno";

    const officers = data.officers || [];
    const representative = officers.length > 0 ? officers[0].officer?.name : null;
    const role = officers.length > 0 ? officers[0].position : null;

    res.json({
      name,
      address,
      representative: representative || "neuvedeno",
      role: role || "neuvedeno",
    });
  } catch (err) {
    console.error("Chyba při volání OpenCorporates:", err.message);
    res.status(500).json({ error: "Chyba při načítání údajů z OpenCorporates" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server běží na portu ${PORT}`);
});
