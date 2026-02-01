// Emoji expressions based on distance from Yes button
const emojiExpressions = ['😭', '😢', '😟', '😕', '🙂', '😊', '😄', '😃', '🤩'];

// Open envelope when clicked
document.addEventListener('DOMContentLoaded', function() {
    const envelopes = document.querySelectorAll('.envelope');
    
    envelopes.forEach((envelope, index) => {
        envelope.addEventListener('click', function() {
            this.classList.add('open');
        });
    });
    
    // Setup no button evasion for all no buttons
    setupNoButtonEvasion('no-btn-1', 'emoji-1');
    setupNoButtonEvasion('no-btn-2', 'emoji-2');
    setupNoButtonEvasion('no-btn-3', 'emoji-3');
    setupNoButtonEvasion('no-btn-4', 'emoji-4');
});

// Function to make "No" button run away
function setupNoButtonEvasion(buttonId, emojiId) {
    const noBtn = document.getElementById(buttonId);
    const emoji = document.getElementById(emojiId);
    
    if (!noBtn) return;
    
    // Track mouse movement to move button away AND update emoji
    let mouseMoveHandler = function(e) {
        const activeScreen = document.querySelector('.question-screen.active');
        if (!activeScreen || !activeScreen.querySelector(`#${buttonId}`)) return;
        
        const rect = noBtn.getBoundingClientRect();
        const buttonCenterX = rect.left + rect.width / 2;
        const buttonCenterY = rect.top + rect.height / 2;
        
        const distance = Math.sqrt(
            Math.pow(e.clientX - buttonCenterX, 2) + 
            Math.pow(e.clientY - buttonCenterY, 2)
        );
        
        // Move button when mouse gets within 100px (runs away before cursor gets close)
        if (distance < 50) {
            moveButton(noBtn);
        }
        
        // Update emoji expression
        if (emoji) {
            updateEmojiExpression(e, buttonId, emojiId);
        }
    };
    
    document.addEventListener('mousemove', mouseMoveHandler);
    
    noBtn.addEventListener('mouseenter', function() {
        moveButton(this);
    });
    
    noBtn.addEventListener('click', function(e) {
        e.preventDefault();
        moveButton(this);
    });
}

function moveButton(button) {
    const btnWidth = button.offsetWidth;
    const btnHeight = button.offsetHeight;
    
    // 1. Get exact current position
    const rect = button.getBoundingClientRect();
    
    // 2. Define move distance
    const distance = 80; 

    // 3. THE KEY: Create a random angle in radians (0 to 360 degrees)
    // This is much more "random" than just X/Y math
    const angle = Math.random() * 2 * Math.PI;
    
    // Convert angle to X and Y coordinates
    // Math.cos and Math.sin naturally return values between -1 and 1
    const moveX = Math.cos(angle) * distance;
    const moveY = Math.sin(angle) * distance;

    // 4. Calculate proposed new position
    let newX = rect.left + moveX;
    let newY = rect.top + moveY;

    // 5. SCREEN BOUNDARIES (Safety Guard)
    const margin = 50;
    const screenWidth = window.innerWidth - btnWidth - margin;
    const screenHeight = window.innerHeight - btnHeight - margin;

    // If the button is about to go OFF-SCREEN, 
    // we don't just clamp it, we teleport it to the OPPOSITE side
    // to break the "stuck in the corner" loop
    if (newX < margin) newX = rect.left + distance;
    if (newX > screenWidth) newX = rect.left - distance;
    if (newY < margin) newY = rect.top + distance;
    if (newY > screenHeight) newY = rect.top - distance;

    // 6. Apply Styles 
    button.style.position = 'fixed';
    button.style.left = Math.round(newX) + 'px';
    button.style.top = Math.round(newY) + 'px';
    
    // Reset CSS that might be "pulling" the button back to the center
    button.style.right = 'auto';
    button.style.bottom = 'auto';
    button.style.margin = '0';
    button.style.transform = 'none'; // CRITICAL: This stops CSS animations from overriding JS
    
    button.style.transition = 'all 0.15s ease-out';
}

// Store last mouse position globally
if (!window.mouseTrackerInitialized) {
    window.mouseTrackerInitialized = true;
    window.addEventListener('mousemove', function(e) {
        window.lastMouseX = e.clientX;
        window.lastMouseY = e.clientY;
    });
}

// Update emoji expression based on mouse distance from Yes button
function updateEmojiExpression(event, noBtnId, emojiId) {
    const activeScreen = document.querySelector('.question-screen.active');
    if (!activeScreen) return;
    
    const yesBtn = activeScreen.querySelector('.yes-btn');
    const emoji = document.getElementById(emojiId);
    
    if (!yesBtn || !emoji) return;
    
    // Get Yes button position
    const yesBtnRect = yesBtn.getBoundingClientRect();
    const yesBtnCenterX = yesBtnRect.left + yesBtnRect.width / 2;
    const yesBtnCenterY = yesBtnRect.top + yesBtnRect.height / 2;
    
    // Calculate distance from mouse to Yes button center
    const mouseX = event.clientX;
    const mouseY = event.clientY;
    const distance = Math.sqrt(
        Math.pow(mouseX - yesBtnCenterX, 2) + 
        Math.pow(mouseY - yesBtnCenterY, 2)
    );
    
    // Map distance to emoji expression (closer = happier)
    // Max distance we care about is ~500px
    const maxDistance = 500;
    const normalizedDistance = Math.min(distance / maxDistance, 1);
    
    // Invert so closer = higher value = happier
    const happinessLevel = 1 - normalizedDistance;
    
    // Map to emoji array index (0 = saddest, 8 = happiest)
    const emojiIndex = Math.floor(happinessLevel * (emojiExpressions.length - 1));
    emoji.textContent = emojiExpressions[emojiIndex];
}

// Add shake animation to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
`;
document.head.appendChild(style);

// Move to next question
function nextQuestion(questionNumber) {
    // Hide current question
    const currentScreen = document.querySelector('.question-screen.active');
    currentScreen.classList.remove('active');
    
    // Show next question
    const nextScreen = document.getElementById('question' + questionNumber);
    nextScreen.classList.add('active');
    
    // Reset envelope state
    const nextEnvelope = nextScreen.querySelector('.envelope');
    nextEnvelope.classList.remove('open');
    
    // Open envelope after a short delay
    setTimeout(() => {
        nextEnvelope.classList.add('open');
    }, 500);
}

// Show final message with flower and letter
function showFinalMessage() {
    // Hide current question
    const currentScreen = document.querySelector('.question-screen.active');
    currentScreen.classList.remove('active');
    
    // Show final screen
    const finalScreen = document.getElementById('final-screen');
    finalScreen.classList.add('active');
    
    // Add sparkle effect
    createSparkles();
}

// Create sparkle effect
function createSparkles() {
    const container = document.querySelector('.container');
    
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';
            sparkle.style.cssText = `
                position: absolute;
                width: 5px;
                height: 5px;
                background: white;
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: sparkle 1.5s ease-out forwards;
                pointer-events: none;
                box-shadow: 0 0 10px white;
            `;
            container.appendChild(sparkle);
            
            setTimeout(() => {
                sparkle.remove();
            }, 1500);
        }, i * 50);
    }
    
    // Add sparkle animation
    const sparkleStyle = document.createElement('style');
    sparkleStyle.textContent = `
        @keyframes sparkle {
            0% {
                transform: scale(0) rotate(0deg);
                opacity: 1;
            }
            100% {
                transform: scale(3) rotate(360deg);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(sparkleStyle);
}

// Prevent scrolling on body
document.body.style.overflow = 'hidden';