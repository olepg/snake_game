import { resetLoop } from "./main.js";
import { gameState, foodState, modeState } from "./gameState.js";
import {
    gameUI,
    resetGameOverlay,
    changeGameModeBackground,
    drawFood,
    addDeathScreen,
    drawSnake,
    createHighscore,
    createStarDescription,
    updateUI,
    createPerks,
    isStarUnlocked,
} from "./gameUI.js";
import { snakeSprite } from "./gameSprites.js";
import { sign, getRandomSpawnTimer, getTilesAvailable, getFreeMapPosition } from "./gameUtil.js";

export function setSnakeDirection(event) {
    const up = { x: 0, y: -1 };
    const left = { x: -1, y: 0 };
    const right = { x: 1, y: 0 };
    const down = { x: 0, y: 1 };

    const keyMap = {
        ArrowUp: up,
        KeyW: up,
        ArrowLeft: left,
        KeyA: left,
        ArrowRight: right,
        KeyD: right,
        ArrowDown: down,
        KeyS: down,
    };

    const tmp = keyMap[event.code];
    const currentDir = gameState.direction;

    if (!tmp) return;
    if (tmp.x === -currentDir.x && tmp.y === -currentDir.y) return;

    gameState.nextDirection = tmp;
}

export function moveSnake() {
    gameState.direction = gameState.nextDirection;

    const seg = snakeSprite.segment;
    const tail = seg[seg.length - 1];

    const dX = gameState.direction.x;
    const dY = gameState.direction.y;

    gameState.lastTailPosition = { x: tail.x, y: tail.y };

    for (let i = seg.length - 1; i > 0; i--) {
        seg[i].x = seg[i - 1].x;
        seg[i].y = seg[i - 1].y;
    }

    seg[0].x += dX * gameState.unitSize;
    seg[0].y += dY * gameState.unitSize;
}

export function getEatPositions() {
    if (foodState.eatenFoodPositions.length === 0) return;

    const firstFood = foodState.eatenFoodPositions[0];
    const digest = snakeSprite.segment.some(
        (seg) => firstFood.x === seg.x && firstFood.y === seg.y
    );
    if (!digest) foodState.eatenFoodPositions.shift();
}

export function getSnakeHead(dX, dY) {
    const head = {
        "1,0": snakeSprite.head.right,
        "-1,0": snakeSprite.head.left,
        "0,1": snakeSprite.head.down,
        "0,-1": snakeSprite.head.top,
    };
    return head[`${dX},${dY}`] || snakeSprite.head.right;
}

export function getSnakeTail(arr, i) {
    const segment = arr[i];
    const prev = arr[i - 1];

    const isFilled = foodState.eatenFoodPositions.some(
        (f) => f.x === segment.x && f.y === segment.y
    );

    if (!prev) return snakeSprite.tail.right;

    const dX = sign(segment.x - prev.x); //0 == 0 || 25 = 1 || -25 = -1 (sign)
    const dY = sign(segment.y - prev.y);

    const tail = {
        "1,0": snakeSprite.tail.right,
        "-1,0": snakeSprite.tail.left,
        "0,1": snakeSprite.tail.down,
        "0,-1": snakeSprite.tail.top,
    };

    const tailFilled = {
        "1,0": snakeSprite.tail.rightFill,
        "-1,0": snakeSprite.tail.leftFill,
        "0,1": snakeSprite.tail.downFill,
        "0,-1": snakeSprite.tail.topFill,
    };

    const map = isFilled ? tailFilled : tail;
    return map[`${dX},${dY}`] || snakeSprite.tail.right;
}

export function getSnakeBody(arr, i) {
    const segment = arr[i];
    let prev = arr[i - 1];
    let next = arr[i + 1];

    const prevX = sign(segment.x - prev.x); //0 == 0 || 25 = 1 || -25 = -1 (sign)
    const prevY = sign(segment.y - prev.y);
    const nextX = sign(next.x - segment.x);
    const nextY = sign(next.y - segment.y);

    const isFilled = foodState.eatenFoodPositions.some(
        (f) => f.x === segment.x && f.y === segment.y
    );

    const straight = {
        "0,1,0,1": snakeSprite.body.vertical,
        "0,-1,0,-1": snakeSprite.body.vertical,
        "1,0,1,0": snakeSprite.body.horizontal,
        "-1,0,-1,0": snakeSprite.body.horizontal,
    };

    const straightFilled = {
        "0,1,0,1": snakeSprite.body.verticalFill,
        "0,-1,0,-1": snakeSprite.body.verticalFill,
        "1,0,1,0": snakeSprite.body.horizontalFill,
        "-1,0,-1,0": snakeSprite.body.horizontalFill,
    };

    const corner = {
        "1,0,0,-1": snakeSprite.corner.topLeft,
        "0,-1,1,0": snakeSprite.corner.bottomRight,
        "-1,0,0,-1": snakeSprite.corner.topRight,
        "0,-1,-1,0": snakeSprite.corner.bottomLeft,
        "1,0,0,1": snakeSprite.corner.bottomLeft,
        "0,1,1,0": snakeSprite.corner.topRight,
        "-1,0,0,1": snakeSprite.corner.bottomRight,
        "0,1,-1,0": snakeSprite.corner.topLeft,
    };

    const cornerFilled = {
        "1,0,0,-1": snakeSprite.corner.topLeftFill,
        "0,-1,1,0": snakeSprite.corner.bottomRightFill,
        "-1,0,0,-1": snakeSprite.corner.topRightFill,
        "0,-1,-1,0": snakeSprite.corner.bottomLeftFill,
        "1,0,0,1": snakeSprite.corner.bottomLeftFill,
        "0,1,1,0": snakeSprite.corner.topRightFill,
        "-1,0,0,1": snakeSprite.corner.bottomRightFill,
        "0,1,-1,0": snakeSprite.corner.topLeftFill,
    };

    const map = `${prevX},${prevY},${nextX},${nextY}`;

    return (
        (isFilled ? straightFilled[map] : straight[map]) ||
        (isFilled ? cornerFilled[map] : corner[map])
    );
}

export function isWallCollision() {
    const snakeHead = snakeSprite.segment[0];

    if (gameState.wallCollision) {
        return (
            snakeHead.x < 0 ||
            snakeHead.y < 0 ||
            snakeHead.x > gameUI.canvasWidth - gameState.unitSize ||
            snakeHead.y > gameUI.canvasHeight - gameState.unitSize
        );
    } else {
        //REMOVE WALL COLLISION LATER?
        return false;
    }
}

export function isSnakeCollision() {
    const head = snakeSprite.segment[0];

    return snakeSprite.segment.slice(3).some((seg) => head.x === seg.x && head.y === seg.y);
}

export function isGameOver() {
    if (isWallCollision() || isSnakeCollision()) {
        gameState.isRunning = false;

        addDeathScreen();
        drawSnake();
        createHighscore();
        createStarDescription();
        isStarUnlocked();
        updateUI();
        createPerks();

        setTimeout(() => {
            document.addEventListener("keydown", resetGame, { once: true });
        }, 1000);
    }
}

function resetGameStats() {
    gameState.isRunning = true;
    gameState.direction = { x: 1, y: 0 };
    gameState.nextDirection = { x: 1, y: 0 };
    gameState.score = 0;

    snakeSprite.segment = [
        { x: 3 * gameState.unitSize, y: 0 },
        { x: 2 * gameState.unitSize, y: 0 },
        { x: 1 * gameState.unitSize, y: 0 },
        { x: 0 * gameState.unitSize, y: 0 },
    ];

    foodState.currentSpecialFood = null;
    foodState.specialFoodSpawnTimer = 3000;

    foodState.foods.forEach((food) => (food.position = null));
}

export function resetGame() {
    resetGameStats();
    resetGameOverlay();
    resetLoop();
}

export function startGameMode(e) {
    const mode = e.currentTarget.dataset.mode;

    if (!modeState[mode] || gameState.isRunning) return;

    modeState.modeSelected = mode;
    setModeSpeed(mode);
    changeGameModeBackground();
    createStarDescription();
}

export function setModeSpeed(mode) {
    const speed = {
        normal: 1000 / 10,
        hard: 1000 / 15,
        expert: 1000 / 22,
        master: 1000 / 30,
        inferno: 1000 / 40,
    };
    gameState.gameSpeed = speed[mode];
}

function createFood() {
    if (!gameState.isRunning) return;
    const tilesLeft = getTilesAvailable();
    const apple = foodState.foods.find((f) => f.id === "apple");
    const snake = snakeSprite.segment;

    const specialFood = foodState.currentSpecialFood;

    if (!apple.position && tilesLeft > 1) {
        apple.position = getFreeMapPosition({ snake, apple, specialFood });
    }

    if (foodState.specialFoodSpawnTimer <= 0 && !foodState.currentSpecialFood && tilesLeft > 2) {
        createSpecialFood();
        foodState.specialFoodSpawnTimer = null; //LOCKING TIMER
    }
}

export function createSpecialFood() {
    if (foodState.currentSpecialFood) return;

    const roll = Math.floor(Math.random() * 100) + 1;
    const snake = snakeSprite.segment;
    const apple = foodState.foods.find((f) => f.id === "apple");

    const candidates = foodState.foods.filter((f) => f.isSpecial && !f.locked);

    for (let i = candidates.length - 1; i >= 0; i--) {
        const food = candidates[i];

        if (roll <= food.spawnChance) {
            food.visible = true;

            foodState.currentSpecialFood = food;

            food.position = getFreeMapPosition({ snake, apple });
            food.timeLeft = food.timer;
            return;
        }
    }
}

export function createFoodTimer(delta) {
    const food = foodState.currentSpecialFood;

    if (!food) {
        if (foodState.specialFoodSpawnTimer !== null) {
            foodState.specialFoodSpawnTimer -= delta;
        }
        return;
    }

    food.timeLeft -= delta;

    if (food.timeLeft <= 0) {
        food.visible = false;
        food.position = null;
        foodState.currentSpecialFood = null;
        foodState.specialFoodSpawnTimer = getRandomSpawnTimer();
    }
}

function onFoodHit() {
    const snakeHead = snakeSprite.segment[0];

    const food = foodState.foods.find(
        (food) =>
            food.position &&
            snakeHead.x === food.position.x &&
            snakeHead.y === food.position.y &&
            (!food.isSpecial || food.visible)
    );

    if (!food) return;
    onFoodEat(food, food.position);

    if (food.isSpecial) {
        food.visible = false;
        foodState.currentSpecialFood = null;
        foodState.specialFoodSpawnTimer = getRandomSpawnTimer(); //RESETTING SINCE EAT
    } else {
        food.position = null;
    }
}

function onFoodEat(food, position) {
    const tail = snakeSprite.segment[snakeSprite.segment.length - 1];
    const points = food.points[modeState.modeSelected];

    gameState.score += points;
    food.totalCollected++;

    snakeSprite.segment.push({ x: tail.x, y: tail.y });
    foodState.eatenFoodPositions.push({ x: position.x, y: position.y });
}

export function renderFood(delta) {
    onFoodHit();
    createFood();
    createFoodTimer(delta);

    for (const food of foodState.foods) {
        drawFood(food, delta);
    }
}
