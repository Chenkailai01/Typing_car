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
            <p>Currency: $${gameState.currency.toLocaleString()}</p>
        </div>
        <button class="menu-button" onclick="changePage('race')">Race Now</button>
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
        <div id="race-info">
            <p>WPM: <span id="current-wpm">${gameState.wpm}</span></p>
            <p>Time: <span id="time-elapsed">${formatTime(gameState.timeElapsed)}</span></p>
            <p>Target Word: <span id="target-word">${gameState.targetWord}</span></p>
        </div>
        <div id="word-display">
            <p id="words-to-type"></p>
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
    const wordsToTypeElement = document.getElementById('words-to-type');
    wordsToTypeElement.innerHTML = gameState.currentRaceWords.map((word, i) => 
        `<span class="${i === gameState.wordIndex ? 'current-word' : ''}">${word}</span>`
    ).join(' ');
    
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
        checkAchievement('first_car_purchased'); // Uncommented this line
    } else {
        alert("Not enough currency!");
    }
}

function checkAchievement(achievementId) {
    const achievement = gameState.achievements.find(a => a.id === achievementId);
    if (achievement && !achievement.earned) {
        achievement.earned = true;
        // Optionally, show a notification
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
    if (gameState.raceInProgress) return;

    gameState.raceInProgress = true;
    gameState.wordIndex = 0;
    gameState.charactersTyped = 0;
    gameState.timeElapsed = 0;
    gameState.currentRaceInput = '';
    gameState.currentRaceWords = generateRaceWords(); // Generate words for the race
    gameState.totalRaceCharacters = gameState.currentRaceWords.join(' ').length; // Calculate total chars once

    document.getElementById('race-input').value = '';
    document.getElementById('race-input').focus();
    
    // Check for achievement: First Race Completed
    checkAchievement('first_race_completed');

    // Update target word
    gameState.targetWord = gameState.currentRaceWords[gameState.wordIndex];

    updateDOM(); // Renders the race view (and gets element references)

    gameState.raceInterval = setInterval(() => {
        gameState.timeElapsed++;
        gameState.wpm = calculateWPM();
        updateRaceInfo();
        if (gameState.timeElapsed >= 60) { // Race duration of 1 minute
            endRace();
        }
    }, 1000);
}

function generateRaceWords() {
    // Simple word generation for now, can be expanded
    const words = [
        "programming", "javascript", "developer", "keyboard", "terminal",
        "openai", "gemini", "typescript", "frontend", "backend",
        "algorithm", "function", "variable", "computer", "science",
        "challenge", "creative", "project", "testing", "debugging",
        "application", "interface", "software", "engineering", "learning"
    ];
    // Pick a number of words for the race, e.g., 30-50 words
    const numberOfWords = 40;
    let raceWords = [];
    for (let i = 0; i < numberOfWords; i++) {
        raceWords.push(words[Math.floor(Math.random() * words.length)]);
    }
    return raceWords;
}

function handleRaceInput(event) {
    const input = event.target.value;
    const wordsToType = gameState.currentRaceWords;
    const targetWord = wordsToType[gameState.wordIndex];

    // Check if the input matches the beginning of the target word
    if (input.startsWith(targetWord.substring(0, input.length))) {
        gameState.currentRaceInput = input;
        
        // Update charactersTyped based on current input length for smoother animation
        let totalCorrectCharsSoFar = 0;
        for(let i = 0; i < gameState.wordIndex; i++) {
            totalCorrectCharsSoFar += gameState.currentRaceWords[i].length;
        }
        gameState.charactersTyped = totalCorrectCharsSoFar + input.length;
        
        // Check if a word is completed
        if (input === targetWord) {
            gameState.wordIndex++;
            if (gameState.wordIndex < wordsToType.length) {
                gameState.targetWord = wordsToType[gameState.wordIndex];
                document.getElementById('race-input').value = ''; // Clear input for next word
                gameState.currentRaceInput = '';
                highlightWord(gameState.wordIndex); // Highlight next word
            } else {
                // Race finished (all words typed)
                endRace(true); // True indicates completion by typing all words
            }
        }
    } else {
        // Incorrect input, reset current word input but keep overall progress
        // Do not reset charactersTyped, only the input field and currentRaceInput for this word
        event.target.value = '';
        gameState.currentRaceInput = '';
    }
    
    gameState.wpm = calculateWPM(); // Recalculate WPM on each input change
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
    // Re-render with spans for easier highlighting
    wordsToTypeElement.innerHTML = gameState.currentRaceWords.map((word, i) => 
        `<span class="${i === index ? 'current-word' : ''}">${word}</span>`
    ).join(' ');
}

function endRace(completedByTyping = false) {
    clearInterval(gameState.raceInterval);
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
