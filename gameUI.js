import { gameState, modeState, foodState } from "./gameState.js";
import { snakeSprite, foodSprite } from "./gameSprites.js";
import { getSnakeHead, getSnakeTail, getSnakeBody } from "./gameLogic.js";
import { getCurrentTime } from "./gameUtil.js";
import { stars, perks } from "./achievements.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const gameOverBackground = document.querySelector(".game-over-background");
const gameOverText = document.querySelector("#game-over-text");

const specialTimerContainer = document.getElementById("special-timer");
const countdownIcon = document.getElementById("special-Icon");
const countdownNumber = document.getElementById("special-countdown");

const pressAnyKeyMessage = document.getElementById("press-any-key");
const modeButtons = document.querySelectorAll(".game-mode");

const starTitle = document.getElementById("star-title");
const starDescription = document.getElementById("star-description");

const perkContainer = document.getElementById("perk-container");
const bottomContainer = document.getElementById("bottom-container");

const highscoreContainer = document.getElementById("highscore-container");

export const gameUI = {
    canvasWidth: canvas.width,
    canvasHeight: canvas.height,
    canvasColor: "aliceblue",
    ctx: ctx,
};

export function clearBoard() {
    gameUI.ctx.fillStyle = gameUI.canvasColor;
    gameUI.ctx.fillRect(0, 0, canvas.width, canvas.height);
}

export function updateScore() {
    const scoreText = document.getElementById("score");
    scoreText.textContent = `${gameState.score.toString().padStart(4, "0")}`;
}

export function startFoodTimer() {
    const food = foodState.currentSpecialFood;

    if (!food) {
        specialTimerContainer.style.opacity = 0;
        return;
    }

    specialTimerContainer.style.opacity = 1;

    countdownIcon.src = foodSprite[food.id].icon.src;
    countdownNumber.textContent = Math.floor(food.timeLeft / 1000)
        .toString()
        .padStart(2, "0");
}

export function drawSnake() {
    snakeSprite.segment.forEach((segment, index) => {
        let sprite;

        if (index === 0) sprite = getSnakeHead(gameState.direction.x, gameState.direction.y);
        else if (index === snakeSprite.segment.length - 1)
            sprite = getSnakeTail(snakeSprite.segment, index);
        else sprite = getSnakeBody(snakeSprite.segment, index);

        gameUI.ctx.drawImage(
            snakeSprite.sprite,
            sprite.x,
            sprite.y,
            sprite.width,
            sprite.height,
            segment.x,
            segment.y,
            gameState.unitSize,
            gameState.unitSize
        );
    });
}

export function drawFood(food, delta) {
    if (!food || !food.position || (!food.visible && food.isSpecial)) return;

    const spriteData = foodSprite[food.id];
    if (!spriteData) return;

    const { sprite, frames, animation, frameSize } = spriteData;

    let { x, y } = food.position;

    if (animation.fps > 0) {
        animation.accumulator += delta;
    }

    if (animation.accumulator >= 1000 / animation.fps) {
        animation.accumulator = 0;
        animation.frame = (animation.frame + 1) % frames.length;
    }

    let frame = frames[animation.frame];

    gameUI.ctx.drawImage(
        sprite,
        frame.x,
        frame.y,
        frameSize,
        frameSize,
        x,
        y,
        gameState.unitSize,
        gameState.unitSize
    );
}

export function addDeathScreen() {
    ctx.filter = "grayscale(100%)";
    gameOverBackground.classList.add("show");
    gameOverText.classList.add("show");
    countdownNumber.textContent = "";
    countdownIcon.src = "";

    setTimeout(() => {
        pressAnyKeyMessage.style.opacity = 1;
    }, 1000);
}

export function resetGameOverlay() {
    ctx.filter = "none";
    pressAnyKeyMessage.style.opacity = 0;
    gameOverBackground.style.transition = "none";
    gameOverText.style.transition = "none";
    gameOverBackground.classList.remove("show");
    gameOverText.classList.remove("show");

    void gameOverBackground.offsetWidth;

    gameOverBackground.style.transition = "opacity 0.5s ease-in";
    gameOverText.style.transition = "opacity 1s ease-in 0.6s";
}

export function changeGameModeBackground() {
    modeButtons.forEach((btn) => {
        btn.textContent = "";

        const mode = btn.dataset.mode;
        const backgrounds = {
            selected: "url('./images/game_mode_background_selected.png')",
            normal: "url('./images/game_mode_background.png')",
            locked: "url('./images/game_mode_background_locked.png')",
        };

        if (mode === modeState.modeSelected) btn.style.backgroundImage = backgrounds.selected;
        else if (modeState[mode]) btn.style.backgroundImage = backgrounds.normal;
        else btn.style.backgroundImage = backgrounds.locked;

        if (modeState[mode]) {
            const container = document.createElement("div");
            container.classList.add("game-mode-inner");

            const modeTitle = document.createElement("div");
            modeTitle.textContent = mode.toUpperCase();
            container.appendChild(modeTitle);

            const starContainer = document.createElement("div");
            starContainer.classList.add("star-container");
            container.appendChild(starContainer);

            Object.values(stars[mode]).forEach((star) => {
                const div = document.createElement("div");
                div.textContent = "★";
                div.style.color = star.unlocked ? "green" : "black";
                starContainer.appendChild(div);
            });

            btn.appendChild(container);
        } else {
            btn.textContent = "LOCKED";
        }
    });
}

export function createStarDescription() {
    starTitle.textContent = `STARS OF ${modeState.modeSelected.toUpperCase()} MODE`;

    starDescription.textContent = "";

    stars[modeState.modeSelected].forEach((star, i) => {
        const row = document.createElement("div");
        row.classList.add("star-line");

        const requiredText = document.createElement("div");
        requiredText.classList.add("star-requiredtext");
        requiredText.textContent = `Achieve ${star.requiredPoints} points during a single run`;

        const starAmount = document.createElement("span");
        starAmount.classList.add("star-amounttext");
        starAmount.textContent = "★".repeat(i + 1);

        const rewardText = document.createElement("div");
        rewardText.classList.add("star-rewardtext");
        rewardText.textContent = star.description;

        row.append(requiredText, starAmount, rewardText);

        if (star.unlocked) {
            requiredText.style.color = "green";
            starAmount.style.color = "green";
            rewardText.style.color = "green";
        }
        starDescription.appendChild(row);
    });
}

export function setBackgrounds() {
    
    bottomContainer.style.backgroundImage = "url(./images/game_perk_background.png)";
}

export function createHighscore() {
    const scoreRow = document.querySelectorAll(".score-row");
    const highscore = JSON.parse(localStorage.getItem("Snake-Highscore") || "[]");
    const mode = modeState.modeSelected;

    scoreRow.forEach((item) => item.remove());

    if (gameState.score > 0) {
        highscore.push({
            score: gameState.score,
            date: getCurrentTime(),
            difficulty: mode[0].toUpperCase() + mode.slice(1),
        });
    }

    const trimmed = highscore.sort((a, b) => b.score - a.score).slice(0, 5);
    localStorage.setItem("Snake-Highscore", JSON.stringify(trimmed));

    for (let i = 0; i < 5; i++) {
        const div = document.createElement("div");
        const dateSpan = document.createElement("span");
        const scoreSpan = document.createElement("span");

        div.classList.add("score-row");
        dateSpan.classList.add("date-col");
        scoreSpan.classList.add("score-col");

        if (highscore[i]) {
            dateSpan.textContent = highscore[i].date;
            scoreSpan.textContent = `${highscore[i].score} (${highscore[i].difficulty})`;
        } else {
            dateSpan.textContent = "---";
            scoreSpan.textContent = "---";
        }

        div.appendChild(dateSpan);
        div.appendChild(scoreSpan);

        highscoreContainer.appendChild(div);
    }
}

export function isStarUnlocked() {
    stars[modeState.modeSelected].forEach((star) => {
        if (!star.unlocked && gameState.score >= star.requiredPoints) {
            star.unlocked = true;
        }
    });
}

export function updateUI() {
    changeGameModeBackground();
    
    setBackgrounds();
}

export function createPerks() {
    const overlay = document.getElementById("perk-locked-overlay");
    if (!stars.normal[1].unlocked) {
        overlay.style.opacity = 1;
        perkContainer.style.backgroundImage = "url(./images/game_perk_background_locked.png)";
        console.log("lock");
    } else {
        overlay.style.opacity = 0;
        perkContainer.style.backgroundImage = "url(./images/game_perk_background.png)";
        console.log("unlocked")
        // const apple = perks.apple;

        // const container = document.createElement("div");
        // const collected = document.createElement("div");
        // collected.textContent = `${foodState.foods.apple.totalCollected} / 100`;

        // const reward = document.createElement("div");
        // reward.textContent = `0% / ${apple[1].reward}% / ${apple[2].reward}% / ${apple[3].reward}% /
        // ${apple[4].reward}% / ${apple[5].reward}% chance of double points when collecting an apple`;
    }

    
}
