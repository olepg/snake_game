import { gameUI } from "./gameUI.js";
import { gameState } from "./gameState.js";
import { snakeSprite } from "./gameSprites.js";

export function getCurrentTime() {
    let now = new Date();

    let day = String(now.getDate()).padStart(2, "0");
    let month = String(now.getMonth() + 1).padStart(2, "0");
    let year = String(now.getFullYear());
    let hour = String(now.getHours()).padStart(2, "0");
    let minute = String(now.getMinutes()).padStart(2, "0");

    return `${day}.${month}.${year} - ${hour}:${minute}`;
}

export function sign(n) {
    return n === 0 ? 0 : n > 0 ? 1 : -1;
}

function getRandomMapPosition() {
    let x =
        Math.floor(Math.random() * (gameUI.canvasWidth / gameState.unitSize)) * gameState.unitSize;
    let y =
        Math.floor(Math.random() * (gameUI.canvasHeight / gameState.unitSize)) * gameState.unitSize;
    return { x, y };
}

export function getRandomSpawnTimer() {
    // 1 sec + 0-2 sec
    return Math.floor(1000 + Math.random() * 2000);
}

export function getTilesAvailable() {
    const width = gameUI.canvasWidth;
    const height = gameUI.canvasHeight
    const snake = snakeSprite.segment.length

    const tilesLeft = (width / 25) * (height / 25) - snake
    return tilesLeft;
}

//prettier-ignore
export function getFreeMapPosition({ snake, apple = null, specialFood = null }) {
    let position

    do {
        position = getRandomMapPosition();
    } while (
            snake.some((segment) => 
                position.x === segment.x &&
                position.y === segment.y) ||
            (
                apple?.position &&
                position.x === apple.position.x &&
                position.y === apple.position.y
            ) ||
            (
                specialFood?.position &&
                position.x === specialFood.position.x &&
                position.y === specialFood.position.y)
        )
       return position
}