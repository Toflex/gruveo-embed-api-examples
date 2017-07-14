const express = require('express');
const crypto = require('crypto');
const https = require('https');
const fs = require('fs');
const base64 = require('base64-stream');

const clientId = 'demo';
const secret = 'W62wB9JjW3tFyUMtF5QhRSbk';

const basedir = `${__dirname}/..`;

const app = express();
app.set('view engine', 'ejs');
app.set('views', `${basedir}/views`);

app.get('/', function(req, res) {
  const generated = Math.floor(Date.now() / 1000);
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(generated.toString());

  res.render('index', {
    clientId: JSON.stringify(clientId),
    generated: JSON.stringify(generated),
    signature: JSON.stringify(hmac.digest('base64'))
  });
});

app.post('/signer', function (req, res) {
  req
    .pipe(crypto.createHmac('sha256', secret))
    .pipe(base64.encode())
    .pipe(res.set('Content-Type', 'text/plain'));
});

app.use(express.static(`${basedir}/static`));

const options = {
  key: fs.readFileSync(`${basedir}/ssl/server.key`, 'utf8'),
  cert: fs.readFileSync(`${basedir}/ssl/server.crt`, 'utf8')
};

const httpsServer = https.createServer(options, app);

const port = process.env.PORT || '8443';

httpsServer.listen(parseInt(port), function () {
  console.log(`Server is listening on https://localhost:${port}.`);
});
