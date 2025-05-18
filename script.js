document.addEventListener("DOMContentLoaded", function () {
  const playerNameEl = document.getElementById("playerName");
  const balanceEl = document.getElementById("balance");
  const betInput = document.getElementById("betAmount");
  const startBtn = document.getElementById("startBtn");
  const cashoutBtn = document.getElementById("cashoutBtn");
  const multiplierEl = document.getElementById("multiplier");
  const resultEl = document.getElementById("result");
  const crashHistoryEl = document.getElementById("crashHistory");
  const scoreListEl = document.getElementById("scoreList");
  const countdownEl = document.getElementById("countdown");

  const logoutBtn = document.getElementById("logoutBtn");
  const resetBtn = document.getElementById("resetBtn");
  const withdrawBtn = document.getElementById("withdrawBtn");

  let balance = parseFloat(localStorage.getItem("balance")) || 1000;
  let betAmount = 0;
  let multiplier = 1;
  let gameInterval = null;
  let gameInProgress = false;
  let crashPoint = 0;
  let scoreBoard = [];

  const username = localStorage.getItem("username") || "Guest";
  playerNameEl.textContent = username;
  balanceEl.textContent = balance.toFixed(2);

  function saveBalance() {
    localStorage.setItem("balance", balance.toFixed(2));
  }

  function updateScoreboard() {
    scoreListEl.innerHTML = "";
    scoreBoard.slice(-5).reverse().forEach((score) => {
      const li = document.createElement("li");
      li.textContent = `$${score.bet} ×${score.multiplier.toFixed(2)} = $${(score.bet * score.multiplier).toFixed(2)}`;
      scoreListEl.appendChild(li);
    });
  }

  function updateCrashHistory(value) {
    const span = document.createElement("span");
    span.textContent = value.toFixed(2) + "x";
    span.classList.add("crash-value");
    crashHistoryEl.appendChild(span);
    if (crashHistoryEl.children.length > 10) {
      crashHistoryEl.removeChild(crashHistoryEl.firstChild);
    }
  }

  function animateMultiplier(target) {
    let current = parseFloat(multiplierEl.textContent) || 1;
    const step = () => {
      if (current < target) {
        current += (target - current) * 0.15;
        if (current > target) current = target;
        multiplierEl.textContent = current.toFixed(2);
        requestAnimationFrame(step);
      } else {
        multiplierEl.textContent = target.toFixed(2);
      }
    };
    step();
  }

  function startCountdown(seconds, callback) {
    let timeLeft = seconds;
    countdownEl.textContent = `Starting in ${timeLeft}...`;

    const countdownInterval = setInterval(() => {
      timeLeft--;
      if (timeLeft > 0) {
        countdownEl.textContent = `Starting in ${timeLeft}...`;
      } else {
        clearInterval(countdownInterval);
        countdownEl.textContent = "";
        callback();
      }
    }, 1000);
  }

  function startGame() {
    betAmount = parseFloat(betInput.value);
    if (isNaN(betAmount) || betAmount <= 0) {
      alert("Place a valid bet first!");
      gameInProgress = false;
      return;
    }
    if (betAmount > balance) {
      alert("Insufficient balance!");
      gameInProgress = false;
      return;
    }

    balance -= betAmount;
    saveBalance();
    balanceEl.textContent = balance.toFixed(2);
    gameInProgress = true;
    startBtn.disabled = true;
    cashoutBtn.disabled = false;
    resultEl.textContent = "";
    multiplier = 1;
    animateMultiplier(multiplier);

    crashPoint = +(Math.random() * 8.5 + 1.5).toFixed(2);

    gameInterval = setInterval(() => {
      multiplier += 0.01;
      multiplier = +multiplier.toFixed(2);
      animateMultiplier(multiplier);

      if (multiplier >= crashPoint) {
        clearInterval(gameInterval);
        gameInProgress = false;
        startBtn.disabled = false;
        cashoutBtn.disabled = true;
        resultEl.textContent = "CRASH! You lost your bet.";
        updateCrashHistory(multiplier);
      }
    }, 50);
  }

  startBtn.addEventListener("click", () => {
    if (gameInProgress) return alert("Game already running!");
    startCountdown(3, () => {
      startGame();
    });
  });

  cashoutBtn.addEventListener("click", () => {
    if (!gameInProgress) return;

    clearInterval(gameInterval);
    const payout = betAmount * multiplier;
    balance += payout;
    saveBalance();
    balanceEl.textContent = balance.toFixed(2);
    resultEl.textContent = `You cashed out at ${multiplier.toFixed(2)}x! Won $${payout.toFixed(2)}.`;
    scoreBoard.push({ bet: betAmount, multiplier });
    updateScoreboard();
    updateCrashHistory(multiplier);
    gameInProgress = false;
    startBtn.disabled = false;
    cashoutBtn.disabled = true;
  });

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("username");
    location.href = "login.html";
  });

  resetBtn.addEventListener("click", () => {
    if (confirm("Reset balance to $1000?")) {
      balance = 1000;
      saveBalance();
      balanceEl.textContent = balance.toFixed(2);
      alert("Balance reset!");
    }
  });

  withdrawBtn.addEventListener("click", () => {
    if (balance < 10) {
      alert("Minimum $10 required to withdraw.");
      return;
    }
    const confirmWithdraw = confirm(`Withdraw $${balance.toFixed(2)}?`);
    if (confirmWithdraw) {
      alert("Withdrawal request sent!");
      balance = 0;
      saveBalance();
      balanceEl.textContent = balance.toFixed(2);
    }
  });
});