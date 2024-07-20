const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let timeRemaining = 0; // Başlangıçta 0
let initialTime = 600; // 10 dakika
let lastDecreasedAt = Date.now();
let canDecrease = true;
let timerPaused = false;
let startTime = null;
let pauseTime = null;
let totalPausedTime = 0;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/guest', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'guest.html'));
});

wss.on('connection', ws => {
    ws.send(JSON.stringify({ timeRemaining, initialTime, totalPausedTime }));

    ws.on('message', message => {
        const data = JSON.parse(message);
        if (data.action === 'start') {
            startTime = Date.now();
            timeRemaining = initialTime;
            totalPausedTime = 0;
            canDecrease = true;
            timerPaused = false;
            broadcast({ timeRemaining, initialTime, totalPausedTime });
        } else if (data.action === 'pause') {
            if (!timerPaused) {
                pauseTime = Date.now();
                timerPaused = true;
            }
        } else if (data.action === 'resume') {
            if (timerPaused) {
                totalPausedTime += (Date.now() - pauseTime) / 1000;
                timerPaused = false;
                pauseTime = null;
                broadcast({ timeRemaining, initialTime, totalPausedTime });
            }
        } else if (data.action === 'end') {
            timeRemaining = 0;
            broadcast({ timeRemaining, initialTime, totalPausedTime });
        } else if (data.action === 'penalty' && canDecrease && Date.now() - lastDecreasedAt > 10000) {
            timeRemaining = Math.max(0, timeRemaining - 10);
            canDecrease = false;
            lastDecreasedAt = Date.now();
            broadcast({ timeRemaining, initialTime, totalPausedTime });
        }
    });
});

function broadcast(data) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

setInterval(() => {
    if (timeRemaining > 0 && !timerPaused) {
        timeRemaining--;
        broadcast({ timeRemaining, initialTime, totalPausedTime });
    }
}, 1000);

server.listen(8080, () => {
    console.log('Server is running on http://0.0.0.0:8080');
});
