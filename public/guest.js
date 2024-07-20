const socket = new WebSocket('ws://localhost:8080');

socket.onmessage = function(event) {
    const data = JSON.parse(event.data);
    updateTimer(data.timeRemaining);
    updateActualTime(data.initialTime, data.totalPausedTime);
};

document.getElementById('penaltyButton').addEventListener('click', () => {
    socket.send(JSON.stringify({ action: 'penalty' }));
    document.getElementById('penaltyButton').disabled = true;
});

function updateTimer(time) {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    document.getElementById('time').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function updateActualTime(initialTime, totalPausedTime) {
    const actualTime = initialTime - totalPausedTime;
    const minutes = Math.floor(actualTime / 60);
    const seconds = actualTime % 60;
    document.getElementById('actualTime').textContent = `Actual Time: ${minutes}:${seconds.toString().padStart(2, '0')}`;
}
