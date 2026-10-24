const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("high-score");
const restartBtn = document.getElementById("restartBtn");

// 1. Nạp các ảnh: đầu (ban.png), thân (cuoi.png), mục tiêu (dancer.png)
const friendHeadImg = new Image();
friendHeadImg.src = "ban.png";

const laughImg = new Image();
laughImg.src = "cuoi.png"; // Ảnh mặt cười nhe răng

const dancerImg = new Image();
dancerImg.src = "dancer.png";

// Nạp ảnh khi khóc / thua cuộc
const cryImg = new Image();
cryImg.src = "khoc.png";

// Kích thước ô lưới
const gridSize = 30
; 
const tileCount = canvas.width / gridSize; // 450 / 30 = 15 ô

// Trạng thái game
let snake = [];
let target = { x: 0, y: 0 };
let dx = 1;
let dy = 0;
let score = 0;
let highScore = localStorage.getItem("pursuitLaughScore") || 0;
highScoreEl.innerText = highScore;

// Nạp nhạc nền
const bgMusic = new Audio("nhac.mp3");
bgMusic.loop = true;   // Bật tính năng tự lặp lại bài hát khi hết
bgMusic.volume = 0.5;  // Âm lượng 50% vừa nghe

// Biến lưu số lượng đốt cần mọc thêm khi ăn
let growCount = 0;

let gameInterval = null;
let isGameOver = false;

// Khởi tạo trò chơi
function initGame() {
  snake = [
    { x: 5, y: 5 }, // Đầu ban.png
    { x: 4, y: 5 }, // Thân cuoi.png
    { x: 3, y: 5 }  // Đuôi cuoi.png
  ];
  dx = 1;
  dy = 0;
  score = 0;
  growCount = 0;
  isGameOver = false;
  scoreEl.innerText = score;
  spawnTarget();
  
  if (gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(gameLoop, 180);
}

// Sinh vị trí ngẫu nhiên cho mục tiêu dancer.png
function spawnTarget() {
  let valid = false;
  while (!valid) {
    target.x = Math.floor(Math.random() * tileCount);
    target.y = Math.floor(Math.random() * tileCount);
    valid = !snake.some(segment => segment.x === target.x && segment.y === target.y);
  }
}

function gameLoop() {
  update();
  draw();
}

function update() {
  if (isGameOver) return;

  const head = { x: snake[0].x + dx, y: snake[0].y + dy };

  // 1. Kiểm tra đâm vào tường
  if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
    gameOver();
    return;
  }

  // 2. Kiểm tra cắn trúng thân (duyệt từ đốt thứ 1 trở đi)
  for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      gameOver();
      return;
    }
  }

  // Thêm đầu mới
  snake.unshift(head);

  // 3. Kiểm tra ăn được dancer.png
  if (head.x === target.x && head.y === target.y) {
    score += 10;
    scoreEl.innerText = score;
    if (score > highScore) {
      highScore = score;
      highScoreEl.innerText = highScore;
      localStorage.setItem("pursuitLaughScore", highScore);
    }

    // ĂN 1 CON MỌC THÊM 2 ĐỐT (muốn dài nhanh hơn có thể đổi thành 3 hoặc 4)
    growCount += 2;

    spawnTarget();
  }

  // Nếu còn lượt mọc thêm thì không pop (thân dài ra), ngược lại thì pop đuôi
  if (growCount > 0) {
    growCount--;
  } else {
    snake.pop();
  }
}

function draw() {
  // Sân chơi nền hồng
  ctx.fillStyle = "#ffeef2";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Trang trí 4 góc sân bằng hoa và tim
  ctx.font = "14px sans-serif";
  ctx.fillText("🌸", 15, 15);
  ctx.fillText("💖", canvas.width - 15, 15);
  ctx.fillText("🌷", 15, canvas.height - 15);
  ctx.fillText("💕", canvas.width - 15, canvas.height - 15);

for (let x = 0; x <= canvas.width; x += gridSize) for (let y = 0; y <= canvas.height; y += gridSize) ctx.strokeStyle = "rgba(249, 120, 163, 0.1)", ctx.strokeRect(x, y, gridSize, gridSize);

  // 1. VẼ MỤC TIÊU DANCER.PNG
  const targetX = target.x * gridSize;
  const targetY = target.y * gridSize;

  if (dancerImg.complete && dancerImg.naturalWidth !== 0) {
    ctx.drawImage(dancerImg, targetX - 0, targetY - 0, gridSize - 0.5, gridSize - 0.5);
    ctx.font = "10px sans-serif";
    ctx.fillText("✨", targetX + gridSize, targetY);
  } else {
    ctx.font = "20px sans-serif";
    ctx.fillText("💃", targetX + gridSize / 0, targetY + gridSize / 0);
  }

  // 2. VẼ ĐẦU BAN.PNG VÀ THÂN MẶT CƯỜI CUOI.PNG
  snake.forEach((segment, index) => {
    const centerX = segment.x * gridSize + gridSize / 1.75;
    const centerY = segment.y * gridSize + gridSize / 1.75;
    const radius = gridSize / 1.85;

    if (index === 0) {
      // Đầu là ảnh ban.png bo tròn viền hồng
      if (friendHeadImg.complete && friendHeadImg.naturalWidth !== 0) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius - 1, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(
          friendHeadImg, 
          segment.x *  gridSize , 
          segment.y * gridSize, 
          gridSize + 7, 
          gridSize + 7
        );
        ctx.restore();

        // Viền hồng quanh đầu
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius - 1, 0, Math.PI * 2);
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = "#ff4081";
        ctx.stroke();
        ctx.restore();
      } else {
        ctx.font = "22px sans-serif";
        ctx.fillText("🐶", centerX, centerY);
      }
    } else {
      // Thân là ảnh mặt cười cuoi.png
      if (laughImg.complete && laughImg.naturalWidth !== 0) {
        // Cho kích thước ảnh 27x27 (nhỉnh hơn ô 25x25 một xíu) để các mặt cười chạm sát rạt nhau
        ctx.drawImage(
          laughImg, 
          segment.x * gridSize - 1, 
          segment.y * gridSize - 1, 
          gridSize + 2, 
          gridSize + 2
        );
      } else {
        ctx.font = "22px sans-serif";
        ctx.fillText("😄", centerX, centerY);
      }
    }
  });

  // Màn hình Game Over
// MÀN HÌNH GAME OVER (CHỨA ẢNH KHÓC)
  if (isGameOver) {
    ctx.fillStyle = "rgba(173, 20, 87, 0.85)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Vẽ ảnh khóc (kích thước 90x90px)
    if (cryImg.complete && cryImg.naturalWidth !== 0) {
      ctx.drawImage(cryImg, 0, 0, canvas.width, canvas.height);
      ctx.restore();

      // Phủ một lớp màu tối mờ 35% để chữ phía trên nổi bật và dễ đọc
      ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Viền trắng quanh ảnh khóc
      const imgSize = 80;
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY - 845, imgSize / 2, 0, Math.PI * 2);
      ctx.lineWidth = 0;
      ctx.strokeStyle = "#ffffff";
      ctx.stroke();
      ctx.restore();
    } else {
      ctx.font = "60px sans-serif";
      ctx.fillText("😭", centerX, centerY - 45);
    }

    // Chữ thông báo
// Dòng chữ HỒI CHIỀU TRỜI MƯA
    ctx.font = "900 32px sans-serif";
    ctx.strokeStyle = "#000000"; // Viền chữ đen dày
    ctx.lineWidth = 5;
    ctx.strokeText("HỒI CHIỀU TRỜI MƯA!", centerX, centerY - 0);

    ctx.fillStyle = "#e10b0b";   // Màu chữ vàng rực rỡ
    ctx.fillText("HỒI CHIỀU TRỜI MƯA!", centerX, centerY - 0);
  }


 window.addEventListener("keydown", (e) => {
  // Tự động phát nhạc ở lần bấm phím đầu tiên nếu nhạc chưa chạy
  if (bgMusic.paused) {
    bgMusic.play().catch(() => {});
  }

  const key = e.key;
  if ((key === "ArrowUp" || key === "w" || key === "W") && dy === 0) {
    dx = 0;
    dy = -1;
  } else if ((key === "ArrowDown" || key === "s" || key === "S") && dy === 0) {
    dx = 0;
    dy = 1;
  } else if ((key === "ArrowLeft" || key === "a" || key === "A") && dx === 0) {
    dx = -1;
    dy = 0;
  } else if ((key === "ArrowRight" || key === "d" || key === "D") && dx === 0) {
    dx = 1;
    dy = 0;
  }
});
}

function initGame() {
  snake = [
    { x: 5, y: 5 },
    { x: 4, y: 5 },
    { x: 3, y: 5 }
  ];
  dx = 1;
  dy = 0;
  score = 0;
  growCount = 0;
  isGameOver = false;
  scoreEl.innerText = score;
  spawnTarget();

  // Bật nhạc (hoặc tiếp tục phát nếu đang tạm dừng)
  bgMusic.play().catch(() => {});
  
  if (gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(gameLoop, 180);
}
function gameOver() {
  isGameOver = true;
  clearInterval(gameInterval);
  
  // Tạm dừng nhạc khi thua
  bgMusic.pause();
  
  draw();
}

// Bắt phím điều khiển
window.addEventListener("keydown", (e) => {
  const key = e.key;
  if ((key === "ArrowUp" || key === "w" || key === "W") && dy === 0) {
    dx = 0;
    dy = -1;
  } else if ((key === "ArrowDown" || key === "s" || key === "S") && dy === 0) {
    dx = 0;
    dy = 1;
  } else if ((key === "ArrowLeft" || key === "a" || key === "A") && dx === 0) {
    dx = -1;
    dy = 0;
  } else if ((key === "ArrowRight" || key === "d" || key === "D") && dx === 0) {
    dx = 1;
    dy = 0;
  }
});

restartBtn.addEventListener("click", initGame);

initGame();
