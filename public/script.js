const socket = new WebSocket('ws://localhost:8080');

socket.onmessage = function(event) {
    const data = JSON.parse(event.data);
    updateTimer(data.timeRemaining);
};

function updateTimer(time) {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    document.getElementById('time').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

document.getElementById('penaltyButton').addEventListener('click', () => {
    socket.send(JSON.stringify({ action: 'penalty' }));
});
