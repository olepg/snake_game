import { gameState, modeState } from "./gameState.js";
import {
    drawSnake,
    clearBoard,
    updateScore,
    startFoodTimer,
    drawDoubleReward,
    updateUI,
    createStarDescription,
    createHighscore,
    createPerks,
    changeGameModeBackground
} from "./gameUI.js";
import {
    setSnakeDirection,
    moveSnake,
    isGameOver,
    startGameMode,
    renderFood,
    getEatPositions,
    isStarUnlocked,
    loadGame,
    saveGame,
} from "./gameLogic.js";


loadGame();
updateUI();
createStarDescription();
createHighscore();
isStarUnlocked(modeState.modeSelected);

function gameLoop(timestamp) {
    if (!gameState.isRunning) {
        requestAnimationFrame(gameLoop);
        return;
    }

    const last = gameState.lastTime || timestamp;
    const delta = timestamp - last;

    gameState.lastTime = timestamp;
    gameState.accumulator += delta;

    while (gameState.accumulator >= gameState.gameSpeed && gameState.isRunning) {
        gameState.accumulator -= gameState.gameSpeed;

        clearBoard();
        moveSnake();
        drawSnake();
        renderFood(gameState.gameSpeed);
        getEatPositions();
        updateScore();
        startFoodTimer();
        createPerks();
        isGameOver();
        isStarUnlocked(modeState.modeSelected);
        createStarDescription();
        changeGameModeBackground();
    
    }
    saveGame();
    drawDoubleReward(delta);
    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);

document.addEventListener("keydown", setSnakeDirection);
document
    .querySelectorAll(".game-mode")
    .forEach((btn) => btn.addEventListener("click", startGameMode));

