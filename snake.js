const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const gameOverElement = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');
const restartButton = document.getElementById('restartButton');
const startScreen = document.getElementById('startScreen');
const startButton = document.getElementById('startButton');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [
    {x: 10, y: 10}
];
let food = {};
let dx = 0;
let dy = 0;
let score = 0;
let gameRunning = false;
let gameStarted = false;
let countdown = 3;
let showingCountdown = false;

// Yemi rastgele konuma yerleştir
function generateFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
    
    // Yemi yılanın üzerine koyma
    for (let segment of snake) {
        if (segment.x === food.x && segment.y === food.y) {
            generateFood();
            return;
        }
    }
}

// Geriye sayım göster
function showCountdown() {
    showingCountdown = true;
    const countdownElement = document.createElement('div');
    countdownElement.id = 'countdown';
    countdownElement.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 100px;
        color: #fff;
        text-shadow: 0 0 20px #ff0000;
        z-index: 1002;
        font-weight: bold;
    `;
    document.body.appendChild(countdownElement);
    
    const countdownInterval = setInterval(() => {
        countdownElement.textContent = countdown;
        countdown--;
        
        if (countdown < 0) {
            clearInterval(countdownInterval);
            document.body.removeChild(countdownElement);
            showingCountdown = false;
            startActualGame();
        }
    }, 1000);
}

// Gerçek oyunu başlat
function startActualGame() {
    gameRunning = true;
    gameStarted = true;
    generateFood();
    gameLoop();
}

// Oyunu çiz
function draw() {
    // Arka planı temizle
    ctx.fillStyle = '#ecf0f1';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Yılanı çiz
    ctx.fillStyle = '#27ae60';
    for (let segment of snake) {
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
    }
    
    // Yılanın başını farklı renkte çiz
    ctx.fillStyle = '#2ecc71';
    ctx.fillRect(snake[0].x * gridSize, snake[0].y * gridSize, gridSize - 2, gridSize - 2);
    
    // Yemi çiz
    ctx.fillStyle = '#f1c40f';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
}

// Yılanı hareket ettir
function moveSnake() {
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    
    // Duvar çarpışması kontrolü
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver();
        return;
    }
    
    // Kendine çarpma kontrolü
    for (let segment of snake) {
        if (head.x === segment.x && head.y === segment.y) {
            gameOver();
            return;
        }
    }
    
    snake.unshift(head);
    
    // Yem yeme kontrolü
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = `Skor: ${score}`;
        generateFood();
    } else {
        snake.pop();
    }
}

// Oyun döngüsü
function gameLoop() {
    if (!gameRunning) return;
    
    moveSnake();
    draw();
    
    setTimeout(gameLoop, 150);
}

// Oyunu başlat
function startGame() {
    startScreen.style.display = 'none';
    countdown = 3;
    showCountdown();
}

// Oyun bitişi
function gameOver() {
    gameRunning = false;
    finalScoreElement.textContent = `Skor: ${score}`;
    gameOverElement.style.display = 'block';
}

// Oyunu yeniden başlat
function restartGame() {
    snake = [{x: 10, y: 10}];
    dx = 0;
    dy = 0;
    score = 0;
    gameRunning = false;
    gameStarted = false;
    scoreElement.textContent = `Skor: ${score}`;
    gameOverElement.style.display = 'none';
    startScreen.style.display = 'flex';
}

// Klavye kontrolleri
document.addEventListener('keydown', (event) => {
    if (!gameRunning || showingCountdown) return;
    
    switch(event.key) {
        case 'ArrowUp':
            if (dy !== 1) { // Aşağı gidiyorsa yukarı dönemez
                dx = 0;
                dy = -1;
            }
            break;
        case 'ArrowDown':
            if (dy !== -1) { // Yukarı gidiyorsa aşağı dönemez
                dx = 0;
                dy = 1;
            }
            break;
        case 'ArrowLeft':
            if (dx !== 1) { // Sağa gidiyorsa sola dönemez
                dx = -1;
                dy = 0;
            }
            break;
        case 'ArrowRight':
            if (dx !== -1) { // Sola gidiyorsa sağa dönemez
                dx = 1;
                dy = 0;
            }
            break;
    }
});

// Başla butonu
startButton.addEventListener('click', startGame);

// Yeniden başlat butonu
restartButton.addEventListener('click', restartGame);

// İlk çizim
draw(); 