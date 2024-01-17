const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dns = require("dns");

const app = express();
const port = process.env.PORT || 3000;

const urlDatabase = {};
let counter = 1;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", (req, res) => res.sendFile(`${process.cwd()}/views/index.html`));

app.post("/api/shorturl", (req, res) => {
  let url = req.body.url;
  const urlRegex =
    /^https?:\/\/(www\.)?[a-z0-9]+(\.[a-z0-9]+)*\.[a-z]{2,}(\/[a-z0-9]+(\.[a-z0-9]+)*)*$/i;

  if (urlRegex.test(url)) {
    dns.lookup(url.replace(/^https?:\/\//i, ""), (err) => {
      if (err) {
        res.json({ error: "invalid url" });
      } else {
        const shortUrl = counter++;
        urlDatabase[shortUrl] = url;
        res.json({ original_url: url, short_url: shortUrl });
      }
    });
  } else {
    res.json({ error: "invalid url" });
  }
});

app.get("/api/shorturl/:shorturl", (req, res) => {
  const shortUrl = req.params.shorturl;
  const url = urlDatabase[shortUrl];

  if (url) {
    res.redirect(url);
  } else {
    res.json({ error: "No short URL found for the given input" });
  }
});

app.listen(port, () => console.log(`Listening on port ${port}`));
