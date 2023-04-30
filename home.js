const listenPort = 6202;
const privateKeyPath = `/home/sslkeys/instantchatbot.net.key`;
const fullchainPath = `/home/sslkeys/instantchatbot.net.pem`;

require('dotenv').config();

const express = require('express');
const https = require('https');
const cors = require('cors');
const fs = require('fs');
const fsPromise = require('fs/promises');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.static('public'));
app.use(express.json({limit: '500mb'})); 
app.use(cors());


const addBot = (req, res) => {
    return new Promise(async (resolve, reject) => {
        const { botToken, botId, serverSeries, secretKey } = req.body;

        if (!botToken || !serverSeries || !serverSeries || !secretKey) {
            res.status(400).json('bad request');
            resolve('error');
            return;
        }

        if (secretKey !== process.env.SECRET_KEY) {
            res.status(401).json('unauthorized');
            resolve('error');
            return;
        }

        try {
            await fsPromise.mkdir(`/var/www/instantchatbot.net/bots/${botId}`, {recursive: true});
            let js = await fsPromise.readFile('./instantchatbot.js');
            js = `const instantChatbotToken="${botToken}";\nconst instantChatbotHos="https://app-${serverSeries}.instantchatbot.net";\n\n` + js;
            await fsPromise.writeFile(`/var/www/instantchatbot.net/bots/${botId}/instantchatbot.js`, js);
            js = '';
            
            let css = await fsPromise.readFile('./instantchatbot.css');
            await fsPromise.writeFile(`/var/www/instantchatbot.net/bots/${botId}/instantchatbot.css`, css);
            css = '';
            res.status(200).json('ok');
        } catch (err) {
            console.error(err);
            res.status(500).json(err);
            resolve('error');
        }
        resolve('ok');
    })
}

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.post('/addBot', (req, res) => addBot(req, res));

const httpsServer = https.createServer({
    key: fs.readFileSync(privateKeyPath),
    cert: fs.readFileSync(fullchainPath),
  }, app);
  

  httpsServer.listen(listenPort, '0.0.0.0', () => {
    console.log(`HTTPS Server running on port ${listenPort}`);
});
