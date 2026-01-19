const rollDie = () => Math.floor(Math.random() * 6) + 1;

Page({
  data: {
    diceCount: null,
    lastRoll: null,
    diceCountDisplay: "-",
    lastRollDisplay: "-",
    totalScore: 0,
    diceValues: [],
    logs: [],
    isRolling: false,
    buttonsDisabled: false
  },
  onUnload() {
    if (this.rollTimeout) {
      clearTimeout(this.rollTimeout);
    }
  },
  appendLog(title, detail) {
    const nextLogs = [{ title, detail }, ...this.data.logs];
    this.setData({ logs: nextLogs });
  },
  updateStatus(nextState = {}) {
    const diceCount = nextState.diceCount ?? this.data.diceCount;
    const lastRoll = nextState.lastRoll ?? this.data.lastRoll;
    const totalScore = nextState.totalScore ?? this.data.totalScore;
    this.setData({
      diceCount,
      lastRoll,
      totalScore,
      diceCountDisplay: diceCount ?? "-",
      lastRollDisplay: lastRoll ?? "-"
    });
  },
  renderDice(values, isRolling = false) {
    this.setData({ diceValues: values, isRolling });
  },
  animateRoll(count, finalValues, onFinish) {
    const preview = Array.from({ length: count }, rollDie);
    this.renderDice(preview, true);
    if (this.rollTimeout) {
      clearTimeout(this.rollTimeout);
    }
    this.rollTimeout = setTimeout(() => {
      this.renderDice(finalValues, false);
      if (onFinish) onFinish();
    }, 700);
  },
  scoreWithBonuses(rolls) {
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
  },
  rollInfiniteCombo(initialCount) {
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
  },
  setButtonsDisabled(isDisabled) {
    this.setData({ buttonsDisabled: isDisabled });
  },
  rollN() {
    this.setButtonsDisabled(true);
    const nextRoll = rollDie();
    this.animateRoll(1, [nextRoll], () => {
      this.updateStatus({ diceCount: nextRoll, lastRoll: nextRoll, totalScore: 0 });
      this.appendLog("Roll N", `掷出 ${nextRoll}，获得 ${nextRoll} 颗骰子`);
      this.setButtonsDisabled(false);
    });
  },
  score() {
    const diceCount = this.data.diceCount;
    if (!diceCount) return;

    this.setButtonsDisabled(true);

    let rolls = [];
    let bonusText = "无";
    let totalScore = 0;

    if (diceCount < 3) {
      rolls = this.rollInfiniteCombo(diceCount);
      totalScore = rolls.reduce((acc, value) => acc + value, 0);
      bonusText = rolls.includes(6) ? "无限连击" : "无";
    } else if (diceCount > 3) {
      rolls = Array.from({ length: diceCount }, rollDie);
      const result = this.scoreWithBonuses(rolls);
      totalScore = result.score;
      bonusText = result.bonus;
    } else {
      rolls = Array.from({ length: diceCount }, rollDie);
      totalScore = rolls.reduce((acc, value) => acc + value, 0);
    }

    this.animateRoll(diceCount, rolls, () => {
      this.appendLog(
        "Score",
        `骰子: ${rolls.join(" ")} | ${bonusText} | 总分 ${totalScore}`
      );
      this.updateStatus({ totalScore });
      this.setButtonsDisabled(false);
    });
  },
  reset() {
    if (this.rollTimeout) {
      clearTimeout(this.rollTimeout);
    }
    this.setButtonsDisabled(false);
    this.setData({
      diceCount: null,
      lastRoll: null,
      diceCountDisplay: "-",
      lastRollDisplay: "-",
      totalScore: 0,
      diceValues: [],
      logs: [],
      isRolling: false
    });
  }
});
