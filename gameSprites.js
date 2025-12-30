const unitSize = 25;

export const snakeSprite = {
    sprite: (() => {
        const img = new Image();
        img.src = "./images/snake-sprite.png";
        return img;
    })(),
    segment: [
        { x: 3 * unitSize, y: 0 },
        { x: 2 * unitSize, y: 0 },
        { x: 1 * unitSize, y: 0 },
        { x: 0 * unitSize, y: 0 },
    ],
    head: {
        left: { x: 0, y: 0, width: unitSize, height: unitSize },
        top: { x: 25, y: 0, width: unitSize, height: unitSize },
        right: { x: 50, y: 0, width: unitSize, height: unitSize },
        down: { x: 75, y: 0, width: unitSize, height: unitSize },
    },
    body: {
        horizontal: { x: 100, y: 0, width: unitSize, height: unitSize },
        vertical: { x: 150, y: 0, width: unitSize, height: unitSize },
        horizontalFill: { x: 125, y: 0, width: unitSize, height: unitSize },
        verticalFill: { x: 175, y: 0, width: unitSize, height: unitSize },
    },
    tail: {
        top: { x: 0, y: 25, width: unitSize, height: unitSize },
        topFill: { x: 25, y: 25, width: unitSize, height: unitSize },
        right: { x: 50, y: 25, width: unitSize, height: unitSize },
        rightFill: { x: 75, y: 25, width: unitSize, height: unitSize },
        down: { x: 100, y: 25, width: unitSize, height: unitSize },
        downFill: { x: 125, y: 25, width: unitSize, height: unitSize },
        left: { x: 150, y: 25, width: unitSize, height: unitSize },
        leftFill: { x: 175, y: 25, width: unitSize, height: unitSize },
    },
    corner: {
        bottomLeft: { x: 0, y: 50, width: unitSize, height: unitSize },
        bottomLeftFill: { x: 25, y: 50, width: unitSize, height: unitSize },
        topLeft: { x: 50, y: 50, width: unitSize, height: unitSize },
        topLeftFill: { x: 75, y: 50, width: unitSize, height: unitSize },
        topRight: { x: 100, y: 50, width: unitSize, height: unitSize },
        topRightFill: { x: 125, y: 50, width: unitSize, height: unitSize },
        bottomRight: { x: 150, y: 50, width: unitSize, height: unitSize },
        bottomRightFill: { x: 175, y: 50, width: unitSize, height: unitSize },
    },
};

export const foodSprite = {
    apple: {
        sprite: (() => {
            const img = new Image();
            img.src = "./images/apple-sprite.png";
            return img;
        })(),
        frames: [{ x: 0, y: 0 }],
        frameSize: 25,
        animation: {
            frame: 0,
            fps: 0,
            accumulator: 0,
        },
    },
    carrot: {
        sprite: (() => {
            const img = new Image();
            img.src = "./images/carrot-sprite-anim.png";
            return img;
        })(),
        icon: (() => {
            const img = new Image();
            img.src = "./images/carrot-icon.png";
            return img;
        })(),
        frames: [
            { x: 0, y: 0 },
            { x: 25, y: 0 },
        ],
        frameSize: 25,
        animation: {
            frame: 0,
            fps: 10,
            accumulator: 0,
        },
    },
    banana: {
        sprite: (() => {
            const img = new Image();
            img.src = "./images/banana-icon.png";
            return img;
        })(),
        icon: (() => {
            const img = new Image();
            img.src = "./images/banana-icon.png";
            return img;
        })(),
        frames: [{ x: 0, y: 0 }],
        frameSize: 25,
        animation: {
            frame: 0,
            fps: 0,
            accumulator: 0,
        },
    },
};
