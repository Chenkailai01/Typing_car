# Typing Car Game - Project Context

## Project Overview

Typing Car is an interactive web-based racing game where players accelerate their cars by typing words accurately and quickly. The faster and more accurately you type, the faster your car moves. The game features a main menu with three options: Shop, Achievements, and Race Now.

### Key Features:
- **Race Mechanics**: Players race by typing words; typing speed determines car speed
- **Multiplayer Support**: Race against other players (up to 5 at a time) or against AI
- **Economy System**: Earn currency based on performance ($2300 for 1st place, decreasing by $100 for each position)
- **Car Shop**: Purchase different car models (Ford Mustang, Porsche, Ferrari, McLaren, Lamborghini, Bugatti, F1 Race Car)
- **Achievements**: Unlock achievements like beating high scores (WPM - Words Per Minute)
- **Progress Tracking**: Monitor WPM, high scores, and currency

### Game Flow:
1. **Main Menu**: Access Race Now, Shop, or Achievements
2. **Race Mode**: Type words to move your car forward, with progress visualized on screen
3. **Shop**: Purchase new cars with earned currency
4. **Achievements**: Track and unlock various milestones

## Technology Stack

- **Frontend**: Pure HTML, CSS, and JavaScript (no external frameworks)
- **Deployment**: Designed for GitHub Pages static hosting
- **Files**:
  - `index.html`: Main application structure
  - `script.js`: Game logic and state management
  - `style.css`: Visual styling and UI components
  - Image assets: Car images (Ford_mustang.png, porsche_911.webp, etc.)

## Game Architecture

### State Management
The game uses a global `gameState` object that manages:
- Current page/view (mainMenu, shop, race, achievements)
- Player statistics (WPM, high score, currency)
- Owned cars and their status
- Achievements
- Race-specific data (words, timing, progress)

### Core Components
- **Main Menu**: Entry point with navigation to other game sections
- **Race System**: Real-time typing feedback with visual car movement
- **Shop System**: Currency-based car purchasing with different price tiers
- **Achievement System**: Milestone tracking with rewards

## Building and Running

This is a static web application that can be run directly in any modern browser:

### Local Development:
1. Open `index.html` in a web browser
2. No build process required - pure HTML/CSS/JS

### Deployment:
- Designed for GitHub Pages deployment to `Chenkailai01.github.io/Typing_car/`
- Deploy the repository's main branch as GitHub Pages source
- All files are static and compatible with GitHub Pages hosting

## Development Conventions

### Code Structure:
- Single-page application with dynamic DOM updates
- Modular functions for different game sections (renderMainMenu, renderShop, etc.)
- Centralized state management through gameState object
- Event-driven architecture with DOM listeners

### UI/UX Patterns:
- Consistent button styling with hover effects
- Color-coded feedback for correct/incorrect typing
- Visual progress indicators (progress bar, car movement)
- Responsive layout with centered game container

### Game Logic:
- WPM calculation based on characters typed over time
- Character-based progress tracking for race completion
- Currency rewards tied to performance metrics
- Achievement unlocking with immediate feedback

## File Descriptions

- `index.html`: Application shell with game container
- `script.js`: Contains all game logic, state management, and UI rendering functions
- `style.css`: Complete styling for all game views and interactive elements
- `README.md`: Project overview and feature descriptions
- `GEMINI.md`: Additional project documentation
- Image assets: Car images used in the race view

## Key JavaScript Functions

- `startRace()`: Initializes a new race with word generation and timing
- `handleRaceInput()`: Processes player typing input and updates game state
- `calculateWPM()`: Computes words per minute based on typing performance
- `updateRaceInfo()`: Updates UI elements during race (WPM, progress, car position)
- `purchaseCar()`: Handles car purchases with currency validation
- `checkAchievement()`: Manages achievement unlocking and rewards

## Game Balance & Progression

- **Currency System**: Earned through racing performance, spent on car purchases
- **Car Tiers**: Range from free (Mustang) to expensive (F1 Race Car at $2M)
- **Achievement Rewards**: Significant rewards like $500K for milestone achievements
- **Progressive Difficulty**: Higher WPM targets for advanced achievements