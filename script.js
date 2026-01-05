// Game state and variables
let gameState = {
    currentPage: 'mainMenu',
    wpm: 0,
    highScoreWPM: 0,
    currency: 0,
    cars: [
        { id: 'mustang', name: 'Ford Mustang', price: 0, owned: true, selected: true },
        { id: 'porsche', name: 'Porsche 911', price: 560000, owned: false, selected: false },
        { id: 'ferrari', name: 'Ferrari F8', price: 850000, owned: false, selected: false },
        { id: 'mclaren', name: 'McLaren 720S', price: 1000000, owned: false, selected: false },
        { id: 'lamborghini', name: 'Lamborghini Aventador', price: 1400000, owned: false, selected: false },
        { id: 'bugatti', name: 'Bugatti Chiron', price: 1600000, owned: false, selected: false },
        { id: 'f1', name: 'F1 Race Car', price: 2000000, owned: false, selected: false }
    ],
    achievements: [
        { id: 'wpm_100', name: '100 WPM Master', description: 'Achieve 100 WPM in a race.', earned: false },
        { id: 'first_race_completed', name: 'First Race Completed', description: 'Complete your first race.', earned: false },
        { id: 'first_car_purchased', name: 'First Car!', description: 'Purchase your first car.', earned: false },
        { id: 'rich_one_million', name: 'Millionaire', description: 'Accumulate $1,000,000 in currency.', earned: false }
    ],
    currentRaceWords: [],
    currentRaceInput: '',
    raceInProgress: false,
    raceInterval: null,
    wordIndex: 0,
    charactersTyped: 0,
    timeElapsed: 0,
    targetWord: '',
    wordStatus: [],
    totalRaceCharacters: 0 // Total characters for calculating progress
};

// --- DOM Elements ---
const gameContainer = document.getElementById('game-container');
let playerCarElement = null; // To store reference to the car element
let raceTrackElement = null; // To store reference to the race track element
let progressBarElement = null; // To store reference to the progress bar element

// --- Utility Functions ---
function updateDOM() {
    gameContainer.innerHTML = ''; // Clear previous content
    switch (gameState.currentPage) {
        case 'mainMenu':
            renderMainMenu();
            break;
        case 'shop':
            renderShop();
            break;
        case 'race':
            renderRace();
            break;
        case 'achievements':
            renderAchievements();
            break;
        // Add other pages as needed
    }
}

function renderMainMenu() {
    gameContainer.innerHTML = `
        <h1>Typing Car</h1>
        <div id="stats-display">
            <p>WPM: ${gameState.wpm} | High Score: ${gameState.highScoreWPM} WPM</p>
            <div class="currency-display"> <!-- Added div for currency display bar -->
                <p>Currency: $${gameState.currency.toLocaleString()}</p>
            </div>
        </div>
        <button class="menu-button" onclick="startRace()">Race Now</button>
        <button class="menu-button" onclick="changePage('shop')">Shop</button>
        <button class="menu-button" onclick="changePage('achievements')">Achievements</button>
    `;
}

function renderShop() {
    let shopHTML = `<h1>Car Shop</h1>`;
    shopHTML += `<p>Your Currency: $${gameState.currency.toLocaleString()}</p>`;

    const ownedCars = gameState.cars.filter(car => car.owned);
    const availableCars = gameState.cars.filter(car => !car.owned);

    shopHTML += `<h2>Your Cars</h2>`;
    if (ownedCars.length > 0) {
        ownedCars.forEach(car => {
            shopHTML += `
                <div class="car-item ${car.selected ? 'selected-car' : ''}">
                    <span>${car.name}</span>
                    <span>$${car.price.toLocaleString()}</span>
                    ${car.selected ? '<span>(Selected)</span>' : `<button class="menu-button" onclick="selectCar('${car.id}')">Select</button>`}
                </div>
            `;
        });
    } else {
        shopHTML += `<p>You don't own any cars yet. Get your first car in the shop!</p>`;
    }

    shopHTML += `<h2>Available Cars</h2>`;
    if (availableCars.length > 0) {
        availableCars.forEach(car => {
            shopHTML += `
                <div class="car-item">
                    <span>${car.name}</span>
                    <span>$${car.price.toLocaleString()}</span>
                    <button class="menu-button" onclick="purchaseCar('${car.id}')" ${gameState.currency < car.price ? 'disabled' : ''}>Purchase</button>
                </div>
            `;
        });
    } else {
        shopHTML += `<p>All cars are yours!</p>`;
    }

    shopHTML += `<button class="menu-button" onclick="changePage('mainMenu')">Back to Menu</button>`;
    gameContainer.innerHTML = shopHTML;
}

function renderAchievements() {
    let achievementsHTML = `<h1>Achievements</h1>`;
    gameState.achievements.forEach(achievement => {
        achievementsHTML += `
            <div class="achievement-item ${achievement.earned ? 'earned' : 'not-earned'}">
                <h3>${achievement.name}</h3>
                <p>${achievement.description}</p>
                ${achievement.earned ? '<span>Earned!</span>' : '<span>Not Earned</span>'}
            </div>
        `;
    });
    achievementsHTML += `<button class="menu-button" onclick="changePage('mainMenu')">Back to Menu</button>`;
    gameContainer.innerHTML = achievementsHTML;
}

function renderRace() {
    const selectedCar = gameState.cars.find(car => car.selected);
    let raceHTML = `<h1>Race!</h1>`;
    raceHTML += `
        <div id="race-track">
            <div id="car-container">
                <div id="player-car" class="car ${selectedCar ? selectedCar.id : 'mustang'}"></div>
                <!-- Other cars or AI opponents can be added here -->
            </div>
            <div id="progress-bar-container">
                 <div id="progress-bar"></div>
            </div>
        </div>
        <div id="word-display"> <!-- Moved word display higher -->
            <p id="words-to-type"></p>
        </div>
        <div id="race-info">
            <p>WPM: <span id="current-wpm">${gameState.wpm}</span></p>
            <p>Time: <span id="time-elapsed">${formatTime(gameState.timeElapsed)}</span></p>
            <p>Target Word: <span id="target-word">${gameState.targetWord}</span></p>
        </div>
        <input type="text" id="race-input" placeholder="Type here to race..." autocomplete="off">
        <button class="menu-button" onclick="endRace()">Quit Race</button>
    `;
    gameContainer.innerHTML = raceHTML;

    // Get references to dynamic elements after rendering
    playerCarElement = document.getElementById('player-car');
    raceTrackElement = document.getElementById('race-track');
    progressBarElement = document.getElementById('progress-bar');

    // Populate the words to type and highlight the first word
    // Ensure words are generated before highlighting
    if (gameState.currentRaceWords.length === 0) {
        gameState.currentRaceWords = generateRaceWords();
        gameState.targetWord = gameState.currentRaceWords[gameState.wordIndex];
        gameState.totalRaceCharacters = gameState.currentRaceWords.join(' ').length;
    }
    highlightWord(gameState.wordIndex);

    // Attach input event listener for race
    document.getElementById('race-input').addEventListener('input', handleRaceInput);
    document.getElementById('race-input').focus();

    // Reset car position and progress bar at the start of race render
    if (playerCarElement) {
        playerCarElement.style.transform = 'translateX(0px)';
    }
    if (progressBarElement) {
        progressBarElement.style.width = '0%';
    }
}

function changePage(page) {
    gameState.currentPage = page;
    updateDOM();
}

function selectCar(carId) {
    gameState.cars.forEach(car => {
        car.selected = (car.id === carId);
    });
    updateDOM(); // Re-render shop to show selected status
}

function purchaseCar(carId) {
    const car = gameState.cars.find(c => c.id === carId);
    if (car && gameState.currency >= car.price) {
        gameState.currency -= car.price;
        car.owned = true;
        car.selected = true; // Automatically select the newly purchased car
        // Unselect previously selected car
        gameState.cars.forEach(c => {
            if (c.id !== carId && c.selected) {
                c.selected = false;
            }
        });
        updateDOM();
        checkAchievement('first_car_purchased');
    } else {
        alert("Not enough currency!");
    }
}

function checkAchievement(achievementId) {
    const achievement = gameState.achievements.find(a => a.id === achievementId);
    if (achievement && !achievement.earned) {
        achievement.earned = true;
        alert(`Achievement Unlocked: ${achievement.name}!`);
        // Update currency if achievement provides one
        if (achievementId === 'first_race_completed') gameState.currency += 500000; // Example reward
        updateDOM(); // Update achievements page if visible
    }
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

// --- Race Logic ---
function startRace() {
    // Clear any existing interval to prevent multiple intervals running
    if (gameState.raceInterval) {
        clearInterval(gameState.raceInterval);
        gameState.raceInterval = null;
    }

    if (gameState.raceInProgress) {
        // If there's a race in progress, try to end it properly first
        if (gameState.raceInterval) {
            clearInterval(gameState.raceInterval);
            gameState.raceInterval = null;
        }
        gameState.raceInProgress = false;
    }

    gameState.currentPage = 'race'; // Set the current page

    gameState.raceInProgress = true;
    gameState.wordIndex = 0;
    gameState.charactersTyped = 0;
    gameState.timeElapsed = 0;
    gameState.currentRaceInput = '';
    gameState.currentRaceWords = generateRaceWords(); // Generate words for the race
    gameState.wordStatus = new Array(gameState.currentRaceWords.length).fill('untyped'); // initialize word status
    gameState.totalRaceCharacters = gameState.currentRaceWords.join(' ').length; // Calculate total chars once

    // Make sure the race input element exists before trying to access it
    const raceInput = document.getElementById('race-input');
    if (raceInput) {
        raceInput.value = '';
        raceInput.focus();
    }

    // Check for achievement: First Race Completed
    checkAchievement('first_race_completed');

    // Update target word
    gameState.targetWord = gameState.currentRaceWords[gameState.wordIndex];

    updateDOM(); // Renders the race view (and gets element references)

    gameState.raceInterval = setInterval(() => {
        // Safety check in case something went wrong
        if (!gameState.raceInProgress) {
            clearInterval(gameState.raceInterval);
            gameState.raceInterval = null;
            return;
        }

        gameState.timeElapsed++;
        gameState.wpm = calculateWPM();
        updateRaceInfo();
        // Removed the 60-second time limit - race continues until all words are typed correctly
    }, 1000);
}

function generateRaceWords() {
    const paragraph = "Technology has revolutionized how we live and work in the modern world. The internet connects billions of people globally, enabling instant communication and access to vast amounts of information. Smartphones have become indispensable tools combining communication, entertainment, and productivity. Artificial intelligence and machine learning are transforming industries, making processes more efficient. Cloud computing allows businesses to store and access data remotely. Social media platforms have changed how we interact and consume news. E-commerce has transformed shopping, allowing purchases from anywhere. Automation and robotics are streamlining manufacturing, reducing human error. The Internet of Things connects everyday devices, creating smart homes. Cybersecurity has become increasingly important as digital threats evolve. Renewable energy technologies help combat climate change. Electric vehicles are becoming more popular, contributing to cleaner transportation. Virtual and augmented reality create immersive experiences for gaming and education. Biotechnology advances are improving medical treatments. Space exploration expands our understanding of the universe. Quantum computing promises to solve complex problems. 5G networks provide faster internet speeds. Digital currencies are changing financial systems. Educational technology has made learning more accessible. Remote work technologies enable flexible arrangements. Health monitoring devices help track fitness goals. Streaming services have revolutionized entertainment consumption. Digital photography tools have democratized content creation. Online platforms enable new business models. The gig economy creates flexible employment options. Digital marketing transforms how businesses reach customers. These technological advances continue shaping our society today.";
    return paragraph.split(' ');
}

function handleRaceInput(event) {
    const input = event.target.value;
    const wordsToType = gameState.currentRaceWords;
    const targetWord = wordsToType[gameState.wordIndex];

    // Check for spacebar press to move to the next word
    if (input.endsWith(' ')) {
        const typedWord = input.slice(0, -1);
        if (typedWord === targetWord) {
            gameState.wordStatus[gameState.wordIndex] = 'correct';
            gameState.wordIndex++;
            if (gameState.wordIndex < wordsToType.length) {
                gameState.targetWord = wordsToType[gameState.wordIndex];
                document.getElementById('race-input').value = '';
                gameState.currentRaceInput = '';
                highlightWord(gameState.wordIndex);
            } else {
                endRace(true);
            }
        } else {
            gameState.wordStatus[gameState.wordIndex] = 'incorrect';
            highlightWord(gameState.wordIndex);
        }
        return;
    }

    gameState.currentRaceInput = input;

    let totalCorrectCharsSoFar = 0;
    for (let i = 0; i < gameState.wordIndex; i++) {
        totalCorrectCharsSoFar += gameState.currentRaceWords[i].length + 1; // +1 for space
    }
    gameState.charactersTyped = totalCorrectCharsSoFar + input.length;

    gameState.wpm = calculateWPM();
    updateRaceInfo();
}

function calculateWPM() {
    if (gameState.timeElapsed === 0) return 0;
    // WPM = (Number of characters typed / 5) / (Time in minutes)
    // Assuming average word length is 5 characters
    const minutes = gameState.timeElapsed / 60;
    return Math.round((gameState.charactersTyped / 5) / minutes);
}

function updateRaceInfo() {
    document.getElementById('current-wpm').textContent = gameState.wpm;
    document.getElementById('time-elapsed').textContent = formatTime(gameState.timeElapsed);
    document.getElementById('target-word').textContent = gameState.targetWord;
    
    // Update progress bar
    if (progressBarElement) {
        const totalWords = gameState.currentRaceWords.length;
        const progressPercentage = (gameState.wordIndex / totalWords) * 100;
        progressBarElement.style.width = `${progressPercentage}%`;
    }

    // Animate player car movement
    if (playerCarElement && raceTrackElement) {
        const trackWidth = raceTrackElement.offsetWidth;
        const carWidth = playerCarElement.offsetWidth;
        
        // Ensure we have total characters and track/car dimensions
        if (gameState.totalRaceCharacters > 0 && trackWidth > 0 && carWidth > 0) {
            // Calculate progress percentage based on characters typed
            const completionPercentage = gameState.charactersTyped / gameState.totalRaceCharacters;
            
            // Calculate the maximum distance the car can travel (track width minus car width)
            const trackUsableWidth = trackWidth - carWidth; // The distance the car's front can travel
            const translateX = completionPercentage * trackUsableWidth;

            // Apply the transform
            playerCarElement.style.transform = `translateX(${translateX}px)`;
        } else {
            // If no total chars or dimensions, reset car position
            playerCarElement.style.transform = `translateX(0px)`;
        }
    }
}

function highlightWord(index) {
    const wordsToTypeElement = document.getElementById('words-to-type');
    wordsToTypeElement.innerHTML = gameState.currentRaceWords.map((word, i) => {
        let wordClass = '';
        if (gameState.wordStatus[i] === 'correct') {
            wordClass = 'word-correct';
        } else if (gameState.wordStatus[i] === 'incorrect') {
            wordClass = 'word-incorrect';
        }

        if (i === index) {
            wordClass += ' current-word';
        }
        return `<span class="${wordClass}">${word}</span>`;
    }).join(' ');
}

function endRace(completedByTyping = false) {
    clearInterval(gameState.raceInterval);
    gameState.raceInterval = null; // Reset interval reference
    gameState.raceInProgress = false;

    let finalWPM = calculateWPM();
    let raceResult = `Race Ended! Your final WPM: ${finalWPM}`;

    if (completedByTyping) {
        raceResult += "\nCongratulations, you typed all words!";
        // Award currency based on WPM
        const currencyReward = finalWPM * 100; // Example: 100 currency per WPM
        gameState.currency += currencyReward;
        raceResult += ` You earned $${currencyReward.toLocaleString()}!`;
    } else {
        raceResult += "\nYou quit the race.";
    }

    // Update high score
    if (finalWPM > gameState.highScoreWPM) {
        gameState.highScoreWPM = finalWPM;
        raceResult += "\nNew High Score!";
        // Check for achievement: 100 WPM Master
        if (finalWPM >= 100) {
            checkAchievement('wpm_100');
        }
    }

    alert(raceResult);

    // Check for currency achievement AFTER currency might have been updated
    checkAchievement('rich_one_million'); // Check for millionaire achievement

    // Reset race-specific state, but keep high score and currency
    gameState.currentRaceWords = [];
    gameState.targetWord = '';
    gameState.wordIndex = 0;
    gameState.charactersTyped = 0;
    gameState.timeElapsed = 0;
    gameState.currentRaceInput = '';
    gameState.totalRaceCharacters = 0; // Reset total characters

    changePage('mainMenu'); // Return to main menu
}


// --- Initialization ---
function initGame() {
    // Load saved state if any (e.g., from localStorage)
    // For now, assume fresh start

    // Check and grant 'first_race_completed' achievement if user has raced before and it wasn't earned
    // (This logic would be more complex if persistence was implemented)

    updateDOM(); // Render the initial page (main menu)
}

// --- Event Listeners and Initial Call ---
document.addEventListener('DOMContentLoaded', initGame);
