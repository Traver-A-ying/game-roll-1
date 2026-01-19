const rollButton = document.getElementById("roll-n");
const scoreButton = document.getElementById("score");
const resetButton = document.getElementById("reset");
const diceCountEl = document.getElementById("dice-count");
const lastRollEl = document.getElementById("last-roll");
const totalScoreEl = document.getElementById("total-score");
const logEl = document.getElementById("log");
const diceVisualEl = document.getElementById("dice-visual");

let diceCount = null;
let lastRoll = null;
let totalScore = 0;
let rollingTimeout = null;

const rollDie = () => Math.floor(Math.random() * 6) + 1;

const appendLog = (title, detail) => {
  const entry = document.createElement("div");
  entry.className = "log-entry";
  entry.innerHTML = `<span>${title}</span><span>${detail}</span>`;
  logEl.prepend(entry);
};

const updateStatus = () => {
  diceCountEl.textContent = diceCount ?? "-";
  lastRollEl.textContent = lastRoll ?? "-";
  totalScoreEl.textContent = totalScore.toString();
};

const setButtonsDisabled = (isDisabled) => {
  rollButton.disabled = isDisabled;
  scoreButton.disabled = isDisabled || !diceCount;
  resetButton.disabled = isDisabled;
};

const renderDice = (values, isRolling = false) => {
  diceVisualEl.innerHTML = "";
  values.forEach((value) => {
    const die = document.createElement("div");
    die.className = `die${isRolling ? " rolling" : ""}`;
    die.textContent = value;
    diceVisualEl.appendChild(die);
  });
};

const animateRoll = (count, finalValues, onFinish) => {
  const preview = Array.from({ length: count }, rollDie);
  renderDice(preview, true);
  if (rollingTimeout) {
    clearTimeout(rollingTimeout);
  }
  rollingTimeout = setTimeout(() => {
    renderDice(finalValues, false);
    if (onFinish) onFinish();
  }, 700);
};

const scoreWithBonuses = (rolls) => {
  const sum = rolls.reduce((acc, value) => acc + value, 0);
  const allSame = rolls.every((value) => value === rolls[0]);
  const allOdd = rolls.every((value) => value % 2 === 1);
  const allEven = rolls.every((value) => value % 2 === 0);

  const sorted = [...rolls].sort((a, b) => a - b);
  const straight = sorted.every((value, index) =>
    index === 0 ? true : value === sorted[index - 1] + 1
  );

  if (allSame && (rolls[0] === 1 || rolls[0] === 6)) {
    return { score: 520, bonus: "天选 520" };
  }

  if (allSame) {
    return { score: sum * 5, bonus: "豹子 ×5" };
  }

  if (straight) {
    return { score: sum * 4, bonus: "顺子 ×4" };
  }

  if (allOdd || allEven) {
    return { score: sum * 2, bonus: "纯净 ×2" };
  }

  return { score: sum, bonus: "无" };
};

const rollInfiniteCombo = (initialCount) => {
  const rolls = [];
  let pending = initialCount;

  while (pending > 0) {
    const roll = rollDie();
    rolls.push(roll);
    if (roll === 6) {
      pending += 1;
    }
    pending -= 1;
  }

  return rolls;
};

rollButton.addEventListener("click", () => {
  setButtonsDisabled(true);
  const nextRoll = rollDie();
  animateRoll(1, [nextRoll], () => {
    lastRoll = nextRoll;
    diceCount = lastRoll;
    totalScore = 0;
    appendLog("Roll N", `掷出 ${lastRoll}，获得 ${diceCount} 颗骰子`);
    updateStatus();
    setButtonsDisabled(false);
  });
});

scoreButton.addEventListener("click", () => {
  if (!diceCount) return;

  setButtonsDisabled(true);

  let rolls = [];
  let bonusText = "无";

  if (diceCount < 3) {
    rolls = rollInfiniteCombo(diceCount);
    totalScore = rolls.reduce((acc, value) => acc + value, 0);
    bonusText = rolls.includes(6) ? "无限连击" : "无";
  } else if (diceCount > 3) {
    rolls = Array.from({ length: diceCount }, rollDie);
    const result = scoreWithBonuses(rolls);
    totalScore = result.score;
    bonusText = result.bonus;
  } else {
    rolls = Array.from({ length: diceCount }, rollDie);
    totalScore = rolls.reduce((acc, value) => acc + value, 0);
  }

  animateRoll(diceCount, rolls, () => {
    appendLog("Score", `骰子: ${rolls.join(" ")} | ${bonusText} | 总分 ${totalScore}`);
    updateStatus();
    setButtonsDisabled(false);
  });
});

resetButton.addEventListener("click", () => {
  diceCount = null;
  lastRoll = null;
  totalScore = 0;
  if (rollingTimeout) {
    clearTimeout(rollingTimeout);
  }
  setButtonsDisabled(false);
  logEl.innerHTML = "";
  diceVisualEl.innerHTML = "";
  updateStatus();
});

updateStatus();
