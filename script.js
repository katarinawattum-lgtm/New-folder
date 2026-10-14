
const HOUSE_COST = 25;
const HOUSE_UPGRADE_COST = 100;
const STARTING_WORKER_COST = 10;
const SAVE_KEY = "clickerKingdom";

let gold = 0;
let workers = 0;
let workerCost = STARTING_WORKER_COST;
let houseLevels = [];

const goldText = document.getElementById("gold");
const goldButton = document.getElementById("goldButton");

const workerButton = document.getElementById("workerButton");
const workersText = document.getElementById("workers");
const housingStatusText = document.getElementById("housingStatus");

const houseButton = document.getElementById("houseButton");
const housesText = document.getElementById("houses");
const capacityText = document.getElementById("capacity");
const availableSpacesText = document.getElementById("availableSpaces");

const houseList = document.getElementById("houseList");
const noHousesText = document.getElementById("noHouses");

function getHousingCapacity() {
    return houseLevels.reduce(function(total, level) {
        return total + (level >= 2 ? 3 : 1);
    }, 0);
}

function getAvailableSpaces() {
    return Math.max(0, getHousingCapacity() - workers);
}

function saveGame() {
    const data = {
        gold: gold,
        workers: workers,
        workerCost: workerCost,
        houseLevels: houseLevels
    };

    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
}

function loadGame() {
    const savedGame = localStorage.getItem(SAVE_KEY);

    if (!savedGame) {
        return;
    }

    try {
        const data = JSON.parse(savedGame);

        if (
            Number.isSafeInteger(data.gold) &&
            data.gold >= 0
        ) {
            gold = data.gold;
        }

        if (
            Number.isSafeInteger(data.workers) &&
            data.workers >= 0
        ) {
            workers = data.workers;
        }

        if (
            Number.isSafeInteger(data.workerCost) &&
            data.workerCost >= STARTING_WORKER_COST
        ) {
            workerCost = data.workerCost;
        }

        if (Array.isArray(data.houseLevels)) {
            houseLevels = data.houseLevels.filter(function(level) {
                return level === 1 || level === 2;
            });
        } else {
            // Give existing workers houses when loading an older save.
            houseLevels = Array.from(
                { length: Math.min(workers, 500) },
                function() {
                    return 1;
                }
            );
        }

        // Make sure every saved worker has a place to live.
        while (
            getHousingCapacity() < workers &&
            houseLevels.length < 500
        ) {
            houseLevels.push(1);
        }

    } catch (error) {
        console.log("Could not read the saved progress.");
    }
}

function renderHouses() {
    houseList.replaceChildren();
    noHousesText.hidden = houseLevels.length > 0;

    houseLevels.forEach(function(level, index) {
        const card = document.createElement("article");
        card.className = "house-card";

        const icon = document.createElement("p");
        icon.className = "house-icon";
        icon.textContent = level === 1 ? "🏠" : "🏡";

        const title = document.createElement("h3");
        title.textContent = "House " + (index + 1);

        const levelText = document.createElement("p");
        levelText.textContent = "House Level: " + level;

        const capacity = level === 1 ? 1 : 3;

        const capacityText = document.createElement("p");
        capacityText.textContent =
            "Capacity: " + capacity + " worker families";

        card.appendChild(icon);
        card.appendChild(title);
        card.appendChild(levelText);
        card.appendChild(capacityText);

        if (level === 1) {
            const upgradeButton = document.createElement("button");

            upgradeButton.textContent =
                "Upgrade House (" + HOUSE_UPGRADE_COST + " gold)";

            upgradeButton.addEventListener("click", function() {
                if (gold < HOUSE_UPGRADE_COST) {
                    alert(
                        "You need " +
                        HOUSE_UPGRADE_COST +
                        " gold to upgrade this house!"
                    );
                    return;
                }

                gold -= HOUSE_UPGRADE_COST;
                houseLevels[index] = 2;

                updateGame();
            });

            card.appendChild(upgradeButton);
        } else {
            const upgradedText = document.createElement("p");
            upgradedText.className = "hint";
            upgradedText.textContent = "Fully upgraded!";

            card.appendChild(upgradedText);
        }

        houseList.appendChild(card);
    });
}

function updateGame() {
    const capacity = getHousingCapacity();
    const available = getAvailableSpaces();

    goldText.textContent = gold;
    workersText.textContent = workers;

    workerButton.textContent =
        "Buy Worker (" + workerCost + " gold)";

    housingStatusText.textContent =
        workers + " / " + capacity;

    housesText.textContent = houseLevels.length;
    capacityText.textContent = capacity;
    availableSpacesText.textContent = available;

    houseButton.textContent =
        "Buy House (" + HOUSE_COST + " gold)";

    renderHouses();
    saveGame();
}

goldButton.addEventListener("click", function() {
    gold += 1;
    updateGame();
});

houseButton.addEventListener("click", function() {
    if (gold < HOUSE_COST) {
        alert("You need " + HOUSE_COST + " gold to buy a house!");
        return;
    }

    gold -= HOUSE_COST;
    houseLevels.push(1);

    updateGame();
});

workerButton.addEventListener("click", function() {
    if (getAvailableSpaces() < 1) {
        alert(
            "No available housing! Buy a house or upgrade one " +
            "before hiring another worker."
        );
        return;
    }

    if (gold < workerCost) {
        alert("You need " + workerCost + " gold to buy a worker!");
        return;
    }

    gold -= workerCost;
    workers += 1;
    workerCost = Math.floor(workerCost * 1.5);

    updateGame();
});

setInterval(function() {
    gold += workers;
    updateGame();
}, 1000);

loadGame();
updateGame();
