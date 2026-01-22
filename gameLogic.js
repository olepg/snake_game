import { gameState, modeState, foodState } from "./gameState.js";
import { stars, perks } from "./achievements.js";
import {
    gameUI,
    resetGameOverlay,
    changeGameModeBackground,
    drawFood,
    startDoubleReward,
    drawDoubleReward,
    addDeathScreen,
    drawSnake,
    createHighscore,
    createStarDescription,
    updateUI,
    createPerks,
} from "./gameUI.js";
import { snakeSprite } from "./gameSprites.js";
import {
    sign,
    getRandomSpawnTimer,
    getTilesAvailable,
    getFreeMapPosition,
    encodeBase64,
    decodeBase64,
} from "./gameUtil.js";

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

    const newDir = keyMap[event.code];
    if (!newDir) return;

    // Get the last queued direction, or current direction if buffer is empty
    const lastDir = gameState.inputBuffer.length > 0
        ? gameState.inputBuffer[gameState.inputBuffer.length - 1]
        : gameState.nextDirection;

    // Prevent 180-degree turns
    if (newDir.x === -lastDir.x && newDir.y === -lastDir.y) return;
    
    // Don't add duplicate directions
    if (newDir.x === lastDir.x && newDir.y === lastDir.y) return;

    // Add to buffer if not full
    if (gameState.inputBuffer.length < gameState.maxInputBuffer) {
        gameState.inputBuffer.push(newDir);
    }
}

export function moveSnake() {
    // Consume from input buffer if available
    if (gameState.inputBuffer.length > 0) {
        gameState.nextDirection = gameState.inputBuffer.shift();
    }
    gameState.direction = gameState.nextDirection;

    const seg = snakeSprite.segment;
    const tail = seg[seg.length - 1];
    const head = seg[0];

    gameState.lastTailPosition = { x: tail.x, y: tail.y };

    for (let i = seg.length - 1; i > 0; i--) {
        seg[i].x = seg[i - 1].x;
        seg[i].y = seg[i - 1].y;
    }

    head.x += gameState.direction.x * gameState.unitSize;
    head.y += gameState.direction.y * gameState.unitSize;

    if (!gameState.wallCollision) {
        if (head.x < 0) head.x = gameUI.canvasWidth - gameState.unitSize;
        else if (head.x >= gameUI.canvasWidth) head.x = 0;

        if (head.y < 0) seg[0].y = gameUI.canvasHeight - gameState.unitSize;
        else if (head.y >= gameUI.canvasHeight) seg[0].y = 0;
    }
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

function getSnakeDirections(prev, current, boardWidth, boardHeight) {
    let dx = current.x - prev.x;
    let dy = current.y - prev.y;

    if (dx > boardWidth / 2) dx -= boardWidth;
    if (dx < -boardWidth / 2) dx += boardWidth;

    if (dy > boardHeight / 2) dy -= boardHeight;
    if (dy < -boardHeight / 2) dy += boardHeight;

    return { x: sign(dx), y: sign(dy) };
}

export function getSnakeTail(arr, i) {
    const segment = arr[i];
    const prev = arr[i - 1];

    const isFilled = foodState.eatenFoodPositions.some(
        (f) => f.x === segment.x && f.y === segment.y
    );

    if (!prev) return snakeSprite.tail.right;

    const dir = getSnakeDirections(prev, segment, gameUI.canvasWidth, gameUI.canvasHeight);

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
    return map[`${dir.x},${dir.y}`] || snakeSprite.tail.right;
}

export function getSnakeBody(arr, i) {
    const segment = arr[i];
    let prev = arr[i - 1];
    let next = arr[i + 1];

    const dirPrev = getSnakeDirections(prev, segment, gameUI.canvasWidth, gameUI.canvasHeight);
    const dirNext = getSnakeDirections(segment, next, gameUI.canvasWidth, gameUI.canvasHeight);

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

    const map = `${dirPrev.x},${dirPrev.y},${dirNext.x},${dirNext.y}`;

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
    }
}

export function isSnakeCollision() {
    const head = snakeSprite.segment[0];

    return snakeSprite.segment.slice(3).some((seg) => head.x === seg.x && head.y === seg.y);
}

export function isGameOver() {
    if (isWallCollision() || isSnakeCollision()) {
        if (gameState.isWaitingForReset) return;
        
        gameState.isRunning = false;
        gameState.isWaitingForReset = true;

        addDeathScreen();
        drawSnake();
        createHighscore();
        
        
        updateUI();
        getSpawnChance();

        setTimeout(() => {
            document.addEventListener("keydown", resetGame, { once: true });
        }, 1000);
    }
}

function resetGameStats() {
    gameState.isRunning = true;
    gameState.isWaitingForReset = false;
    gameState.direction = { x: 1, y: 0 };
    gameState.nextDirection = { x: 1, y: 0 };
    gameState.inputBuffer = [];
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
    gameState.lastTime = 0;
    gameState.accumulator = 0;
}

export function startGameMode(e) {
    const mode = e.currentTarget.dataset.mode;

    if (!modeState.modes[mode].unlocked || gameState.isRunning) return;

    modeState.modeSelected = mode;
    setModeSpeed(mode);
    changeGameModeBackground();
    createStarDescription();
}

export function setModeSpeed(mode) {
    const speed = {
        normal: 1000 / 10,
        hard: 1000 / 15,
        expert: 1000 / 20,
        master: 1000 / 25,
        inferno: 1000 / 35,
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

    const candidates = foodState.foods.filter((f) => f.isSpecial && f.unlocked);

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
        foodState.specialFoodSpawnTimer = getRandomSpawnTimer();
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

    const roll = Math.floor(Math.random() * 100) + 1;
    const findPerk = perks[food.id].find((f) => f.unlocked);

    if (!findPerk) return;
    if (findPerk.reward >= roll) {
        gameState.score += points;
        startDoubleReward();
        drawDoubleReward();
    }
}

export function renderFood(delta) {
    onFoodHit();
    createFood();
    createFoodTimer(delta);

    for (const food of foodState.foods) {
        drawFood(food, delta);
    }
}

export function isStarUnlocked(mode) {
    stars[mode].forEach((star) => {
        if (!star.unlocked && gameState.score >= star.requiredPoints) {
            star.unlocked = true;
            setStarEffect(star);
        }
    });
}

function setStarEffect(star) {
    (star.effect ?? []).forEach((effect) => {
        const [type, target, value] = effect.split(",");

        switch (type) {
            case "unlockFood":
                foodState.foods.find((f) => f.id === target).unlocked = true;
                break;
            case "unlockMode":
                modeState.modes[target].unlocked = true;
                break;
            case "unlockPerk":
                gameState.perksUnlocked = true;
                break;
            case "addSpawnTime":
                foodState.foods.find((f) => target === f.id).timer += Number(value);
                break;
            case "spawnChance":
                increaseSpawnChance(target, Number(value));
                break;
            case "wallCollision":
                gameState.wallCollision = false;
        }
    });
}

function increaseSpawnChance(food, value) {
    const order = foodState.foods.map((f) => f.id);
    const position = order.indexOf(food);

    for (let i = position; i >= 0; i--) {
        const food = foodState.foods[i];
        food.spawnChance += value;
        if (food.spawnChance > 100) food.spawnChance = 100;
    }
}

export function saveGame() {
    const saveState = {
        gameState: {
            wallCollision: gameState.wallCollision,
            perksUnlocked: gameState.perksUnlocked,
            gameSpeed: gameState.gameSpeed
        },
        modeState,
        foodState: {
            foods: foodState.foods.map((f) => ({
                id: f.id,
                unlocked: f.unlocked,
                spawnChance: f.spawnChance,
                totalCollected: f.totalCollected,
            })),
        },
        stars: (() => {
            const save = {};
            for (const mode in stars) {
                save[mode] = stars[mode].map((star) => ({ unlocked: star.unlocked }));
            }
            return save;
        })(),
        perks: (() => {
            const save = {}
            for (const mode in perks) {
                save[mode] = perks[mode].map((perk) => ({unlocked: perk.unlocked}))
            }
            return save
        })(),
        savedAt: Date.now(),
        version: 1,
    };

    const encoded = encodeBase64(saveState);
    localStorage.setItem("snakeSave", encoded);
}

export function loadGame() {
    const encoded = localStorage.getItem("snakeSave");
    if (!encoded) return false;

    const saveState = decodeBase64(encoded);

    // Restore gameState
    if (saveState.gameState) {
        gameState.wallCollision = saveState.gameState.wallCollision ?? gameState.wallCollision;
        gameState.perksUnlocked = saveState.gameState.perksUnlocked ?? gameState.perksUnlocked;
        gameState.gameSpeed = saveState.gameState.gameSpeed ?? gameState.gameSpeed;
    }

    // Restore modes
    if (saveState.modeState) {
        modeState.modeSelected = saveState.modeState.modeSelected ?? modeState.modeSelected
        for (const mode in saveState.modeState.modes) {
            if (modeState.modes[mode]) {
                modeState.modes[mode].unlocked = saveState.modeState.modes[mode].unlocked
            }
        }
    }
  
    // Restore foods
    for (const f of saveState.foodState.foods ?? []) {
        const target = foodState.foods.find((food) => food.id === f.id);
        if (target) {
            target.unlocked = f.unlocked;
            target.spawnChance = f.spawnChance
            target.totalCollected = f.totalCollected;
        }
    }

    // Restore stars
   for (const mode in saveState.stars) {
       if (!stars[mode]) continue;
       saveState.stars[mode].forEach((savedStar, i) => {
           if (stars[mode][i]) {
               stars[mode][i].unlocked = savedStar.unlocked;
           }
       });
   }

    // Restore perks
    for (const food in saveState.perks) {
        if (!perks[food]) continue
        saveState.perks[food].forEach((savedPerk, i) => {
            if (perks[food][i]) {
                perks[food][i].unlocked = savedPerk.unlocked;
            }
        })
    }
}

function getSpawnChance() {
    const food = foodState.foods.forEach((food)=> {
        console.log(`${food.id}: ${food.spawnChance}`)
    })
}