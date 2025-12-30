
//prettier-ignore
export const stars = {
    normal: [
        { requiredPoints: 5, unlocked: false, description: `Unlocks Carrot` },
        { requiredPoints: 10, unlocked: false, description: `Unlocks Perks` },
        { requiredPoints: 250, unlocked: false, description: `Unlocks Hard Mode` },
        { requiredPoints: 150, unlocked: false, description: `Adds 2 seconds to Carrot spawns` },
        { requiredPoints: 150, unlocked: false, description: `...` },
    ],
    hard: [
        { requiredPoints: 150, unlocked: false, description: `Unlocks Banana` },
        { requiredPoints: 225, unlocked: false, description: `...` },
        { requiredPoints: 300, unlocked: false, description: `Unlocks Expert Mode` },
        { requiredPoints: 350, unlocked: false, description: `...` },
        { requiredPoints: 400, unlocked: false, description: `...` },
    ],
    expert: [
        { requiredPoints: 300, unlocked: false, description: `Unlocks Apricot` },
        { requiredPoints: 350, unlocked: false, description: `...` },
        { requiredPoints: 400, unlocked: false, description: `Unlocks Master Mode` },
        { requiredPoints: 150, unlocked: false, description: `Increases spawn chance of Apricot by 10%` },
        { requiredPoints: 150, unlocked: false, description: `...` },
    ],
    master: [
        { requiredPoints: 100, unlocked: false, description: `Unlocks Watermelon` },
        { requiredPoints: 150, unlocked: false, description: `...` },
        { requiredPoints: 250, unlocked: false, description: `Unlocks Inferno Mode` },
        { requiredPoints: 150, unlocked: false, description: `....` },
        { requiredPoints: 150, unlocked: false, description: `...` },
    ],
    inferno: [
        { requiredPoints: 100, unlocked: false, description: `Unlocks Avocado` },
        { requiredPoints: 150, unlocked: false, description: `...` },
        { requiredPoints: 250, unlocked: false, description: `Removes wall collision` },
        { requiredPoints: 150, unlocked: false, description: `Adds 5 seconds to Avocado spawns` },
        { requiredPoints: 150, unlocked: false, description: `You win the game` },
    ],
};

//prettier-ignore
export const perks = {
    apple: [
        { level: 1, collectRequired: 10, reward: 2, unlocked: false },
        { level: 2, collectRequired: 20, reward: 4, unlocked: false },
        { level: 3, collectRequired: 40, reward: 6, unlocked: false },
        { level: 4, collectRequired: 50, reward: 8, unlocked: false },
        { level: 5, collectRequired: 60, reward: 10, unlocked: false },
    ],
    banana: [
        { level: 1, collectRequired: 50, reward: 2, unlocked: false },
        { level: 2, collectRequired: 720, reward: 4, unlocked: false },
        { level: 3, collectRequired: 140, reward: 6, unlocked: false },
        { level: 4, collectRequired: 150, reward: 8, unlocked: false },
        { level: 5, collectRequired: 360, reward: 10, unlocked: false },
    ],
    apricot: [
        { level: 1, collectRequired: 10, reward: 2, unlocked: false },
        { level: 2, collectRequired: 20, reward: 4, unlocked: false },
        { level: 3, collectRequired: 40, reward: 6, unlocked: false },
        { level: 4, collectRequired: 50, reward: 8, unlocked: false },
        { level: 5, collectRequired: 60, reward: 10, unlocked: false },
    ],
    watermelon: [
        { level: 1, collectRequired: 10, reward: 2, unlocked: false },
        { level: 2, collectRequired: 20, reward: 4, unlocked: false },
        { level: 3, collectRequired: 40, reward: 6, unlocked: false },
        { level: 4, collectRequired: 50, reward: 8, unlocked: false },
        { level: 5, collectRequired: 60, reward: 10, unlocked: false },
    ],
    avocado: [
        { level: 1, collectRequired: 10, reward: 2, unlocked: false },
        { level: 2, collectRequired: 20, reward: 4, unlocked: false },
        { level: 3, collectRequired: 40, reward: 6, unlocked: false },
        { level: 4, collectRequired: 50, reward: 8, unlocked: false },
        { level: 5, collectRequired: 60, reward: 10, unlocked: false },
    ],
};
