class Car {
    constructor(x, y, color, isPlayer = false, model = 'default') {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 70;
        this.color = color;
        this.speed = 0;
        this.maxSpeed = 5;
        this.acceleration = 0.1;
        this.deceleration = 0.05;
        this.angle = 0;
        this.rotationSpeed = 0.03;
        this.isPlayer = isPlayer;
        this.checkpoint = 0;
        this.model = model;
        this.driftFactor = 0.95;
        this.trail = [];
        this.maxTrailLength = 20;
        this.lap = 0;
    }

    update() {
        if (this.isPlayer) {
            if (keys.ArrowUp) this.speed = Math.min(this.speed + this.acceleration, this.maxSpeed);
            if (keys.ArrowDown) this.speed = Math.max(this.speed - this.acceleration, -this.maxSpeed/2);
            if (keys.ArrowLeft) this.angle -= this.rotationSpeed * (this.speed / this.maxSpeed);
            if (keys.ArrowRight) this.angle += this.rotationSpeed * (this.speed / this.maxSpeed);
        } else {
            this.followTrack();
        }

        const oldX = this.x;
        const oldY = this.y;
        
        this.x += Math.sin(this.angle) * this.speed;
        this.y -= Math.cos(this.angle) * this.speed;

        if (Math.abs(this.speed) > this.maxSpeed * 0.7) {
            this.trail.push({x: oldX, y: oldY});
            if (this.trail.length > this.maxTrailLength) {
                this.trail.shift();
            }
        } else {
            this.trail = [];
        }

        if (!keys.ArrowUp && !keys.ArrowDown) {
            this.speed *= (1 - this.deceleration);
        }

        const nextCheckpoint = track.checkpoints[this.checkpoint];
        const dx = nextCheckpoint.x - this.x;
        const dy = nextCheckpoint.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 50) {
            this.checkpoint = (this.checkpoint + 1) % track.checkpoints.length;
            if (this.checkpoint === 0) {
                this.lap++;
            }
        }
    }

    followTrack() {
        const nextCheckpoint = track.checkpoints[this.checkpoint];
        const dx = nextCheckpoint.x - this.x;
        const dy = nextCheckpoint.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        const targetAngle = Math.atan2(dx, -dy);
        let angleDiff = targetAngle - this.angle;
        if (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        if (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        
        this.angle += Math.sign(angleDiff) * this.rotationSpeed * 0.3;
        this.speed = this.maxSpeed * 0.6;
    }

    draw(ctx) {
        if (this.trail.length > 1) {
            ctx.beginPath();
            ctx.strokeStyle = this.color + '80';
            ctx.lineWidth = 3;
            ctx.moveTo(this.trail[0].x, this.trail[0].y);
            for (let i = 1; i < this.trail.length; i++) {
                ctx.lineTo(this.trail[i].x, this.trail[i].y);
            }
            ctx.stroke();
        }

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        // Araba gövdesi
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
        
        // Araba detayları
        ctx.fillStyle = '#000';
        ctx.fillRect(-this.width/2 + 5, -this.height/2 + 5, this.width - 10, 10);
        ctx.fillRect(-this.width/2 + 5, this.height/2 - 15, this.width - 10, 10);
        
        // Farlar
        ctx.fillStyle = '#fff';
        ctx.fillRect(-this.width/2 + 5, -this.height/2, 5, 5);
        ctx.fillRect(this.width/2 - 10, -this.height/2, 5, 5);
        
        ctx.restore();
    }
}

class Track {
    constructor() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.checkpoints = this.generateTrack();
        this.visibilityRadius = 200;
        this.trackWidth = 100;
        this.roadMarkingWidth = 4;
    }

    generateTrack() {
        const points = [];
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const radius = Math.min(this.width, this.height) * 0.3;
        
        // Daha karmaşık bir pist oluştur
        points.push({x: centerX - radius, y: centerY}); // Başlangıç
        points.push({x: centerX - radius/2, y: centerY - radius/2}); // Sol üst köşe
        points.push({x: centerX, y: centerY - radius}); // Üst orta
        points.push({x: centerX + radius/2, y: centerY - radius/2}); // Sağ üst köşe
        points.push({x: centerX + radius, y: centerY}); // Sağ orta
        points.push({x: centerX + radius/2, y: centerY + radius/2}); // Sağ alt köşe
        points.push({x: centerX, y: centerY + radius}); // Alt orta
        points.push({x: centerX - radius/2, y: centerY + radius/2}); // Sol alt köşe
        points.push({x: centerX - radius, y: centerY}); // Bitiş
        
        return points;
    }

    draw(ctx, camera) {
        // Pist zemini
        ctx.fillStyle = '#444';
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Görüş alanı dışını karart
        ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
        ctx.beginPath();
        ctx.arc(canvas.width/2, canvas.height/2, this.visibilityRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Pist çizimi
        ctx.strokeStyle = '#666';
        ctx.lineWidth = this.trackWidth;
        ctx.beginPath();
        ctx.moveTo(this.checkpoints[0].x - camera.x, this.checkpoints[0].y - camera.y);
        for (let i = 1; i < this.checkpoints.length; i++) {
            ctx.lineTo(this.checkpoints[i].x - camera.x, this.checkpoints[i].y - camera.y);
        }
        ctx.closePath();
        ctx.stroke();

        // Yol çizgileri
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = this.roadMarkingWidth;
        ctx.setLineDash([20, 20]);
        ctx.beginPath();
        ctx.moveTo(this.checkpoints[0].x - camera.x, this.checkpoints[0].y - camera.y);
        for (let i = 1; i < this.checkpoints.length; i++) {
            ctx.lineTo(this.checkpoints[i].x - camera.x, this.checkpoints[i].y - camera.y);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.setLineDash([]);

        // Kenar çizgileri
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(this.checkpoints[0].x - camera.x, this.checkpoints[0].y - camera.y);
        for (let i = 1; i < this.checkpoints.length; i++) {
            ctx.lineTo(this.checkpoints[i].x - camera.x, this.checkpoints[i].y - camera.y);
        }
        ctx.closePath();
        ctx.stroke();

        // Bitiş çizgisi
        const finishLine = this.checkpoints[this.checkpoints.length - 1];
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 5;
        ctx.setLineDash([10, 10]);
        ctx.beginPath();
        ctx.moveTo(finishLine.x - camera.x, finishLine.y - camera.y - 50);
        ctx.lineTo(finishLine.x - camera.x, finishLine.y - camera.y + 50);
        ctx.stroke();
        ctx.setLineDash([]);

        // Checkpoint işaretleri
        this.checkpoints.forEach((checkpoint, index) => {
            const dx = checkpoint.x - (camera.x + canvas.width/2);
            const dy = checkpoint.y - (camera.y + canvas.height/2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.visibilityRadius) {
                ctx.fillStyle = '#00ff00';
                ctx.beginPath();
                ctx.arc(checkpoint.x - camera.x, checkpoint.y - camera.y, 10, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#fff';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(index + 1, checkpoint.x - camera.x, checkpoint.y - camera.y + 4);
            }
        });
    }
}

// Oyun değişkenleri
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const miniMapCanvas = document.getElementById('miniMapCanvas');
const miniMapCtx = miniMapCanvas.getContext('2d');
const countdownElement = document.getElementById('countdown');
const carOptions = document.getElementById('carOptions');

// Canvas boyutlarını ayarla
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    miniMapCanvas.width = 200;
    miniMapCanvas.height = 150;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const track = new Track();
let playerCar = null;
let gameStarted = false;
let countdown = 3;
let camera = { x: 0, y: 0 };

const carModels = [
    {
        name: 'Kırmızı Araba',
        color: '#ff0000',
        maxSpeed: 5,
        acceleration: 0.1,
        handling: 0.03
    }
];

const keys = {};

// Araba seçim menüsü
carModels.forEach((model) => {
    const carOption = document.createElement('div');
    carOption.className = 'car-option';
    carOption.innerHTML = `
        <div class="car-preview" style="background-color: ${model.color}"></div>
        <div class="car-info">
            <div class="car-name">${model.name}</div>
        </div>
    `;
    carOption.onclick = () => selectCar(model);
    carOptions.appendChild(carOption);
});

function selectCar(model) {
    document.getElementById('carSelection').style.display = 'none';
    
    playerCar = new Car(track.width/2, track.height/2, model.color, true, model.name);
    playerCar.maxSpeed = model.maxSpeed;
    playerCar.acceleration = model.acceleration;
    playerCar.rotationSpeed = model.handling;
    startCountdown();
}

function startCountdown() {
    countdown = 3;
    countdownElement.style.display = 'block';
    countdownElement.textContent = countdown;
    
    const countdownInterval = setInterval(() => {
        countdown--;
        countdownElement.textContent = countdown;
        
        if (countdown <= 0) {
            clearInterval(countdownInterval);
            countdownElement.style.display = 'none';
            startGame();
        }
    }, 1000);
}

function startGame() {
    gameStarted = true;
    gameLoop();
}

function gameLoop() {
    if (!gameStarted) return;
    
    if (playerCar) {
        camera.x = playerCar.x - canvas.width / 2;
        camera.y = playerCar.y - canvas.height / 2;
    }
    
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    track.draw(ctx, camera);
    
    if (playerCar) {
        playerCar.update();
        ctx.save();
        ctx.translate(-camera.x, -camera.y);
        playerCar.draw(ctx);
        ctx.restore();
    }
    
    updateMiniMap();
    checkCollisions();
    
    requestAnimationFrame(gameLoop);
}

function updateMiniMap() {
    miniMapCtx.fillStyle = '#333';
    miniMapCtx.fillRect(0, 0, miniMapCanvas.width, miniMapCanvas.height);
    
    miniMapCtx.strokeStyle = '#fff';
    miniMapCtx.lineWidth = 2;
    miniMapCtx.beginPath();
    miniMapCtx.moveTo(track.checkpoints[0].x * 0.2, track.checkpoints[0].y * 0.2);
    for (let i = 1; i < track.checkpoints.length; i++) {
        miniMapCtx.lineTo(track.checkpoints[i].x * 0.2, track.checkpoints[i].y * 0.2);
    }
    miniMapCtx.closePath();
    miniMapCtx.stroke();
    
    if (playerCar) {
        miniMapCtx.fillStyle = playerCar.color;
        miniMapCtx.fillRect(playerCar.x * 0.2 - 2, playerCar.y * 0.2 - 2, 4, 4);
    }
}

function checkIfOnTrack(x, y) {
    const trackWidth = 50;
    let minDistance = Infinity;
    
    for (let i = 0; i < track.checkpoints.length; i++) {
        const p1 = track.checkpoints[i];
        const p2 = track.checkpoints[(i + 1) % track.checkpoints.length];
        
        const distance = distanceToLineSegment(x, y, p1.x, p1.y, p2.x, p2.y);
        
        if (distance < minDistance) {
            minDistance = distance;
        }
    }
    
    return minDistance <= trackWidth;
}

function distanceToLineSegment(x, y, x1, y1, x2, y2) {
    const A = x - x1;
    const B = y - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    let param = -1;

    if (len_sq !== 0) {
        param = dot / len_sq;
    }

    let xx, yy;

    if (param < 0) {
        xx = x1;
        yy = y1;
    } else if (param > 1) {
        xx = x2;
        yy = y2;
    } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }

    const dx = x - xx;
    const dy = y - yy;

    return Math.sqrt(dx * dx + dy * dy);
}

function checkCollisions() {
    if (!playerCar) return;
    
    const isOnTrack = checkIfOnTrack(playerCar.x, playerCar.y);
    if (!isOnTrack) {
        resetPlayerPosition();
    }
}

function resetPlayerPosition() {
    if (playerCar) {
        playerCar.x = track.width/2;
        playerCar.y = track.height/2;
        playerCar.speed = 0;
        playerCar.angle = 0;
        playerCar.trail = [];
    }
}

document.getElementById('restartButton').addEventListener('click', () => {
    document.getElementById('gameOver').style.display = 'none';
    document.getElementById('carSelection').style.display = 'flex';
    playerCar = null;
    gameStarted = false;
});

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
}); 