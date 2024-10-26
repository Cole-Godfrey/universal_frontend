const canvas = document.getElementById('plinkoCanvas');
const ctx = canvas.getContext('2d');

// Update canvas size
canvas.width = 1200;  // Keep the same width
canvas.height = 600;  // Reduced from 700

// Game constants
const PEG_RADIUS = 4;  // Reduced from 8 to 4
const CHIP_RADIUS = 10;
const ROWS = 11;  // Reduced from 15 to 11 rows
const COLS = 17;   // Increased to match number of multipliers
const BASE_COLS = 17;  // Match COLS
const SLOT_WIDTH = canvas.width / COLS;
const VERTICAL_SPACING = canvas.height / (ROWS + 2);
const CHIP_COST = 50;
const SLOT_REWARDS = [50, 25, 10, 5, 2, 1, 0.5, 0.25, 0, 0.25, 0.5, 1, 2, 5, 10, 25, 50].map(x => x * CHIP_COST);
let balance = parseInt(localStorage.getItem('balance')) || 1000;  // Changed from 10000000 to 1000

// Game state
let chips = [];
const pegs = [];
let animationId;

// Add these with the other game state variables
let resultMessage = null;
let messageTimer = null;

// Add this with the other game constants
const PEG_SPACING = 50;  // Reduced from 55
const PEGS_PER_ROW = 25;  // Increased from 23 to maintain coverage with reduced spacing

// Add these variables for the cannon
let cannonAngle = -Math.PI/2;  // Start pointing straight up
const CANNON_LENGTH = 40;
const CANNON_WIDTH = 20;
const INITIAL_VELOCITY = 12;  // Reduced from 15
let mouseX = canvas.width/2;
let mouseY = 0;

// Add mouse move listener
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    
    // Calculate angle between cannon and mouse
    const dx = mouseX - canvas.width/2;
    const dy = mouseY - 50;  // Cannon Y position
    cannonAngle = Math.atan2(dy, dx);
    
    // Limit the angle between 0 and 180 degrees (pointing downward only)
    cannonAngle = Math.max(Math.min(cannonAngle, Math.PI - 0.175), 0.175);
});

// Update the peg initialization with a lower starting position
pegs.length = 0;
for (let row = 0; row < ROWS; row++) {
    // Calculate how many pegs in this row
    const pegsInRow = PEGS_PER_ROW;
    
    // Calculate starting X position to center the row
    const startX = (canvas.width - (pegsInRow - 1) * PEG_SPACING) / 2;
    
    // Add offset for alternating rows
    const offsetX = row % 2 === 0 ? 0 : PEG_SPACING / 2;
    
    // Calculate Y position - adjust for taller canvas
    const yPos = 180 + row * (PEG_SPACING * 0.65);  // Increased from 130 to 180
    
    for (let col = 0; col < pegsInRow; col++) {
        pegs.push({
            x: startX + col * PEG_SPACING + offsetX,
            y: yPos
        });
    }
}

// Add this constant with the other game constants
const DIVIDER_HEIGHT = 30;

// Update these constants for more realistic physics
const GRAVITY = 0.3;  // Increased from 0.1
const BOUNCE_DAMPING = 0.7;  // Changed from 0.6 - less energy loss
const AIR_RESISTANCE = 0.99;  // New constant for air resistance
const COLLISION_ELASTICITY = 0.8;  // New constant for collision elasticity
const FRICTION = 0.98;  // New constant for horizontal friction
const SPIN_FACTOR = 0.15;  // New constant for spin effect
const MAX_VELOCITY = 20;  // New constant to prevent excessive speeds

// Add these constants at the top with other game constants
const DIVIDER_WIDTH = 4;  // Width of divider in pixels
const DIVIDER_ELASTICITY = 0.7;  // How bouncy the dividers are
const DIVIDER_FRICTION = 0.95;  // Friction when hitting dividers

// Chip class
class Chip {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.velocity = {
            x: Math.cos(cannonAngle) * INITIAL_VELOCITY,
            y: Math.sin(cannonAngle) * INITIAL_VELOCITY
        };
        this.angularVelocity = 0;
        this.rotation = 0;
        this.landed = false;
        this.slotIndex = -1;
        this.totalCost = currentWager;  // Changed from calculateTotalCost() to just currentWager
        this.spin = 0;
    }

    update() {
        if (this.landed) {
            // Remove this chip from the array
            const index = chips.indexOf(this);
            if (index > -1) {
                chips.splice(index, 1);
            }
            return;
        }

        // Apply gravity
        this.velocity.y += GRAVITY;

        // Apply air resistance
        this.velocity.x *= AIR_RESISTANCE;
        this.velocity.y *= AIR_RESISTANCE;

        // Apply horizontal friction
        this.velocity.x *= FRICTION;

        // Apply spin effect
        this.velocity.x += this.spin * SPIN_FACTOR;

        // Limit maximum velocity
        const speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
        if (speed > MAX_VELOCITY) {
            const ratio = MAX_VELOCITY / speed;
            this.velocity.x *= ratio;
            this.velocity.y *= ratio;
        }

        // Update position
        this.x += this.velocity.x;
        this.y += this.velocity.y;

        // Update rotation based on horizontal velocity
        this.rotation += this.velocity.x * 0.1;
        this.angularVelocity *= AIR_RESISTANCE;
        this.rotation += this.angularVelocity;

        // Check collisions with pegs
        pegs.forEach(peg => {
            const dx = this.x - peg.x;
            const dy = this.y - peg.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < CHIP_RADIUS + PEG_RADIUS) {
                // Collision response with improved physics
                const angle = Math.atan2(dy, dx);
                const relativeVelocityX = this.velocity.x;
                const relativeVelocityY = this.velocity.y;
                
                // Calculate collision normal
                const normalX = dx / distance;
                const normalY = dy / distance;
                
                // Calculate relative velocity along normal
                const normalVelocity = relativeVelocityX * normalX + relativeVelocityY * normalY;
                
                // Only bounce if moving towards the peg
                if (normalVelocity < 0) {
                    // Calculate impulse
                    const impulse = -(1 + COLLISION_ELASTICITY) * normalVelocity;
                    
                    // Apply impulse
                    this.velocity.x += impulse * normalX;
                    this.velocity.y += impulse * normalY;
                    
                    // Add spin based on collision point
                    const tangentialVelocity = -relativeVelocityX * normalY + relativeVelocityY * normalX;
                    this.spin = tangentialVelocity * SPIN_FACTOR;
                    
                    // Update angular velocity
                    this.angularVelocity += this.spin;
                    
                    // Position correction to prevent sticking
                    const overlap = (CHIP_RADIUS + PEG_RADIUS) - distance;
                    this.x += overlap * normalX;
                    this.y += overlap * normalY;
                    
                    // Add slight randomness to prevent predictable paths
                    const randomFactor = 0.1;
                    this.velocity.x += (Math.random() - 0.5) * randomFactor;
                    this.velocity.y += (Math.random() - 0.5) * randomFactor;
                }
            }
        });

        // Wall collisions with improved physics
        if (this.x < CHIP_RADIUS) {
            this.x = CHIP_RADIUS;
            this.velocity.x = Math.abs(this.velocity.x) * BOUNCE_DAMPING;
            this.spin *= -0.5;  // Reverse and reduce spin on wall collision
        } else if (this.x > canvas.width - CHIP_RADIUS) {
            this.x = canvas.width - CHIP_RADIUS;
            this.velocity.x = -Math.abs(this.velocity.x) * BOUNCE_DAMPING;
            this.spin *= -0.5;  // Reverse and reduce spin on wall collision
        }

        // Check collisions with dividers
        const bottomY = canvas.height - DIVIDER_HEIGHT;
        if (this.y + CHIP_RADIUS > bottomY) {
            // Calculate nearest divider positions
            const slotWidth = canvas.width / COLS;
            const currentSlot = Math.floor(this.x / slotWidth);
            const leftDividerX = currentSlot * slotWidth;
            const rightDividerX = (currentSlot + 1) * slotWidth;
            
            // Check collision with left divider
            if (Math.abs(this.x - leftDividerX) < DIVIDER_WIDTH + CHIP_RADIUS) {
                // Calculate collision point and normal
                const dx = this.x - leftDividerX;
                const dy = this.y - (canvas.height - DIVIDER_HEIGHT / 2);
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < CHIP_RADIUS + DIVIDER_WIDTH / 2) {
                    // Normalize collision vector
                    const normalX = dx / distance;
                    const normalY = dy / distance;
                    
                    // Calculate relative velocity
                    const relativeVelocity = this.velocity.x * normalX + this.velocity.y * normalY;
                    
                    // Only bounce if moving towards the divider
                    if (relativeVelocity < 0) {
                        // Calculate impulse
                        const impulse = -(1 + DIVIDER_ELASTICITY) * relativeVelocity;
                        
                        // Apply impulse
                        this.velocity.x += impulse * normalX;
                        this.velocity.y += impulse * normalY;
                        
                        // Apply friction
                        this.velocity.x *= DIVIDER_FRICTION;
                        
                        // Add spin effect
                        this.spin = -this.velocity.x * 0.1;
                        
                        // Position correction
                        const overlap = (CHIP_RADIUS + DIVIDER_WIDTH / 2) - distance;
                        this.x += overlap * normalX;
                        this.y += overlap * normalY;
                        
                        // Add slight randomness
                        const randomFactor = 0.05;
                        this.velocity.x += (Math.random() - 0.5) * randomFactor;
                        this.velocity.y += (Math.random() - 0.5) * randomFactor;
                    }
                }
            }
            
            // Check collision with right divider
            if (Math.abs(this.x - rightDividerX) < DIVIDER_WIDTH + CHIP_RADIUS) {
                // Calculate collision point and normal
                const dx = this.x - rightDividerX;
                const dy = this.y - (canvas.height - DIVIDER_HEIGHT / 2);
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < CHIP_RADIUS + DIVIDER_WIDTH / 2) {
                    // Normalize collision vector
                    const normalX = dx / distance;
                    const normalY = dy / distance;
                    
                    // Calculate relative velocity
                    const relativeVelocity = this.velocity.x * normalX + this.velocity.y * normalY;
                    
                    // Only bounce if moving towards the divider
                    if (relativeVelocity < 0) {
                        // Calculate impulse
                        const impulse = -(1 + DIVIDER_ELASTICITY) * relativeVelocity;
                        
                        // Apply impulse
                        this.velocity.x += impulse * normalX;
                        this.velocity.y += impulse * normalY;
                        
                        // Apply friction
                        this.velocity.x *= DIVIDER_FRICTION;
                        
                        // Add spin effect
                        this.spin = -this.velocity.x * 0.1;
                        
                        // Position correction
                        const overlap = (CHIP_RADIUS + DIVIDER_WIDTH / 2) - distance;
                        this.x += overlap * normalX;
                        this.y += overlap * normalY;
                        
                        // Add slight randomness
                        const randomFactor = 0.05;
                        this.velocity.x += (Math.random() - 0.5) * randomFactor;
                        this.velocity.y += (Math.random() - 0.5) * randomFactor;
                    }
                }
            }
        }

        // Bottom collision and slot landing
        if (this.y > canvas.height - CHIP_RADIUS) {
            const slotIndex = Math.floor(this.x / SLOT_WIDTH);
            const slotCenter = (slotIndex * SLOT_WIDTH) + (SLOT_WIDTH / 2);
            
            // Guide chip to center of slot
            this.velocity.x = (slotCenter - this.x) * 0.1;
                
            // end the round regardless of vertical velocity
            this.x = slotCenter;
            this.y = canvas.height - CHIP_RADIUS;
            this.landed = true;
            this.slotIndex = slotIndex;
                    
            // Handle win/loss logic
            const multiplier = SLOT_REWARDS[this.slotIndex] / CHIP_COST;
            const prize = currentWager * multiplier;
            const netResult = prize - this.totalCost;
                    
            updatePlayerBalance(netResult);
                    
            if (netResult > this.totalCost * 10) {
                    showResultMessage(`MASSIVE WIN: $${netResult}!`, '#ffd700', true);
            } else if (netResult > 0) {
                    showResultMessage(`Won $${netResult}`, '#4CAF50');
            } else if (netResult < 0) {
                    showResultMessage(`Lost $${Math.abs(netResult)}`, '#ff4444');
            } else {
                    showResultMessage('Break Even', '#ffffff');
            }
        }
    }

    draw() {
        ctx.save();
        
        // Update rotation based on movement
        this.rotation += this.velocity.x * 0.1;
        
        // Draw outer glow
        const glowGradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, CHIP_RADIUS * 2
        );
        glowGradient.addColorStop(0, 'rgba(0, 255, 128, 0.3)');  // Neon green to match pegs
        glowGradient.addColorStop(1, 'rgba(0, 255, 128, 0)');
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, CHIP_RADIUS * 2, 0, Math.PI * 2);
        ctx.fillStyle = glowGradient;
        ctx.fill();

        // Draw main chip with gradient
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        const chipGradient = ctx.createLinearGradient(-CHIP_RADIUS, -CHIP_RADIUS, CHIP_RADIUS, CHIP_RADIUS);
        chipGradient.addColorStop(0, 'rgba(0, 255, 128, 0.9)');  // Bright neon green
        chipGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.9)');  // White center
        chipGradient.addColorStop(1, 'rgba(0, 255, 128, 0.9)');  // Bright neon green
        
        ctx.beginPath();
        ctx.arc(0, 0, CHIP_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = chipGradient;
        ctx.fill();

        // Add energy ring
        ctx.beginPath();
        ctx.arc(0, 0, CHIP_RADIUS * 0.7, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Add energy particles
        const particleCount = 4;
        for(let i = 0; i < particleCount; i++) {
            const angle = (this.rotation * 2 + i * Math.PI * 2 / particleCount);
            const x = Math.cos(angle) * (CHIP_RADIUS * 0.5);
            const y = Math.sin(angle) * (CHIP_RADIUS * 0.5);
            
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fill();
        }

        ctx.restore();
    }
}

// Add these variables for the animation
let animationTime = 0;
const ANIMATION_SPEED = 0.05;

// Add these variables at the top with other game constants
let currentWager = 50;  // Starting wager
const MIN_WAGER = 1;   // Changed from 10 to 1
const MAX_WAGER = balance; // Changed from 1000 to balance
const WAGER_STEP = 10;  // Amount to increase/decrease by

// Add these variables for wager input handling
let isEditingWager = false;
let wagerInputValue = "50";
let wagerInputPosition = { x: canvas.width - 100, y: 55 };

// Add these variables for warning message
let warningMessage = null;
const WARNING_DURATION = 2000; // 2 seconds

// Update the canvas click handler
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    // Check if click is in wager input area
    if (clickX > wagerInputPosition.x - 50 && clickX < wagerInputPosition.x + 50 &&
        clickY > wagerInputPosition.y - 12 && clickY < wagerInputPosition.y + 12) {
        isEditingWager = true;
        wagerInputValue = '';
    } else {
        // Handle chip shooting with warning messages
        if (!isEditingWager) {
            if (balance < currentWager) {  // Only check balance
                showWarningMessage("Insufficient balance!");
            } else if (currentWager < MIN_WAGER) {
                showWarningMessage(`Minimum wager is $${MIN_WAGER}!`);
            } else if (currentWager > balance) {
                showWarningMessage(`Maximum wager is $${balance}!`);
            } else {
                // Valid shot - proceed with chip creation
                balance -= currentWager;
                const cannonTipX = canvas.width/2 + Math.cos(cannonAngle) * CANNON_LENGTH;
                const cannonTipY = 50 + Math.sin(cannonAngle) * CANNON_LENGTH;
                const chip = new Chip(cannonTipX, cannonTipY);
                chips.push(chip);
            }
        }
        isEditingWager = false;
    }
});

// Update the keydown handler for wager input
document.addEventListener('keydown', (e) => {
    if (!isEditingWager) return;
    
    if (e.key === 'Enter') {
        let value = parseInt(wagerInputValue);
        if (value < MIN_WAGER) value = MIN_WAGER;
        if (value > balance) value = balance; // Changed from MAX_WAGER to balance
        currentWager = value;
        isEditingWager = false;
    } else if (e.key === 'Escape') {
        isEditingWager = false;
    } else if (e.key === 'Backspace') {
        wagerInputValue = wagerInputValue.slice(0, -1);
        if (wagerInputValue === '') wagerInputValue = '0';
    } else if (/^\d$/.test(e.key) && wagerInputValue.length < 10) { // Increased max length to handle larger numbers
        // Clear the input value when starting to type
        if (!isEditingWager || wagerInputValue === currentWager.toString()) {
            wagerInputValue = e.key;
        } else {
            wagerInputValue += e.key;
        }
    }
});

// Update the slot rewards to be based on current wager
function calculateSlotRewards() {
    return [50, 25, 10, 5, 2, 1, 0.5, 0.25, 0, 0.25, 0.5, 1, 2, 5, 10, 25, 50].map(x => x * currentWager);
}

// Add this function to calculate trajectory points
function calculateTrajectoryPoints(startX, startY, velocityX, velocityY, points = 20) {
    const trajectoryPoints = [];
    let simX = startX;
    let simY = startY;
    let simVelX = velocityX;
    let simVelY = velocityY;
    const timeStep = 0.5; // Smaller time step for smoother curve
    
    for (let i = 0; i < points; i++) {
        trajectoryPoints.push({ x: simX, y: simY });
        
        // Apply simplified physics (just gravity and air resistance)
        simVelY += GRAVITY * timeStep;
        simVelX *= AIR_RESISTANCE;
        simVelY *= AIR_RESISTANCE;
        
        simX += simVelX * timeStep;
        simY += simVelY * timeStep;
        
        // Stop if trajectory hits bottom or sides
        if (simY > canvas.height || simX < 0 || simX > canvas.width) {
            break;
        }
    }
    
    return trajectoryPoints;
}

// Update these constants near the top of the file
const CANNON_Y = 100;  // Changed from 50 to 100

// Update the draw function's cannon and wager positioning
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Calculate initial velocity components
    const initialVelX = Math.cos(cannonAngle) * INITIAL_VELOCITY;
    const initialVelY = Math.sin(cannonAngle) * INITIAL_VELOCITY;
    
    // Calculate trajectory points
    const cannonTipX = canvas.width/2 + Math.cos(cannonAngle) * CANNON_LENGTH;
    const cannonTipY = CANNON_Y + Math.sin(cannonAngle) * CANNON_LENGTH;
    const trajectoryPoints = calculateTrajectoryPoints(cannonTipX, cannonTipY, initialVelX, initialVelY);
    
    // Draw trajectory line
    ctx.beginPath();
    ctx.moveTo(trajectoryPoints[0].x, trajectoryPoints[0].y);
    
    // Draw curved line through trajectory points
    for (let i = 1; i < trajectoryPoints.length; i++) {
        const gradient = ctx.createLinearGradient(
            trajectoryPoints[i-1].x, trajectoryPoints[i-1].y,
            trajectoryPoints[i].x, trajectoryPoints[i].y
        );
        const alpha = 1 - (i / trajectoryPoints.length);
        gradient.addColorStop(0, `rgba(138, 43, 226, ${alpha * 0.4})`);
        gradient.addColorStop(1, `rgba(138, 43, 226, ${alpha * 0.2})`);
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2 * (1 - i / trajectoryPoints.length);
        
        ctx.beginPath();
        ctx.moveTo(trajectoryPoints[i-1].x, trajectoryPoints[i-1].y);
        ctx.lineTo(trajectoryPoints[i].x, trajectoryPoints[i].y);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(trajectoryPoints[i].x, trajectoryPoints[i].y, 1 * (1 - i / trajectoryPoints.length), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(138, 43, 226, ${alpha * 0.5})`;
        ctx.fill();
    }
    
    // Draw cannon with space theme
    ctx.save();
    ctx.translate(canvas.width/2, CANNON_Y);  // Changed from 50 to CANNON_Y
    ctx.rotate(cannonAngle);
    
    // Draw energy core glow
    const coreGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, CANNON_WIDTH);
    coreGradient.addColorStop(0, 'rgba(138, 43, 226, 0.8)');
    coreGradient.addColorStop(0.5, 'rgba(138, 43, 226, 0.3)');
    coreGradient.addColorStop(1, 'rgba(138, 43, 226, 0)');
    ctx.fillStyle = coreGradient;
    ctx.beginPath();
    ctx.arc(0, 0, CANNON_WIDTH * 1.2, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw main cannon barrel with gradient
    const barrelGradient = ctx.createLinearGradient(0, -CANNON_WIDTH/2, 0, CANNON_WIDTH/2);
    barrelGradient.addColorStop(0, '#2a1a4a');
    barrelGradient.addColorStop(0.5, '#4a2a8a');
    barrelGradient.addColorStop(1, '#2a1a4a');
    ctx.fillStyle = barrelGradient;
    ctx.fillRect(0, -CANNON_WIDTH/2, CANNON_LENGTH, CANNON_WIDTH);
    
    // Draw energy lines on barrel
    const time = animationTime;
    ctx.strokeStyle = 'rgba(138, 43, 226, 0.5)';
    ctx.lineWidth = 1;
    for(let i = 0; i < 3; i++) {
        const yOffset = (i - 1) * (CANNON_WIDTH/3);
        ctx.beginPath();
        ctx.moveTo(0, yOffset);
        for(let x = 0; x < CANNON_LENGTH; x += 2) {
            ctx.lineTo(x, yOffset + Math.sin(x * 0.1 + time + i) * 2);
        }
        ctx.stroke();
    }
    
    // Draw barrel rim with glow
    ctx.beginPath();
    ctx.arc(CANNON_LENGTH, 0, CANNON_WIDTH/2, 0, Math.PI * 2);
    const rimGradient = ctx.createRadialGradient(
        CANNON_LENGTH, 0, CANNON_WIDTH/3,
        CANNON_LENGTH, 0, CANNON_WIDTH/2
    );
    rimGradient.addColorStop(0, '#4a2a8a');
    rimGradient.addColorStop(1, '#2a1a4a');
    ctx.fillStyle = rimGradient;
    ctx.fill();
    
    // Add glowing rim effect
    ctx.beginPath();
    ctx.arc(CANNON_LENGTH, 0, CANNON_WIDTH/2, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(138, 43, 226, ${0.3 + Math.sin(time * 2) * 0.2})`;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw base with energy core
    ctx.beginPath();
    ctx.arc(0, 0, CANNON_WIDTH, 0, Math.PI * 2);
    const baseGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, CANNON_WIDTH);
    baseGradient.addColorStop(0, '#4a2a8a');
    baseGradient.addColorStop(0.7, '#2a1a4a');
    baseGradient.addColorStop(1, '#1a0a3a');
    ctx.fillStyle = baseGradient;
    ctx.fill();
    
    // Add pulsing energy effect to base
    ctx.beginPath();
    ctx.arc(0, 0, CANNON_WIDTH * 0.8, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(138, 43, 226, ${0.5 + Math.sin(time * 3) * 0.3})`;
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Add energy particles
    for(let i = 0; i < 5; i++) {
        const angle = time * 2 + (i * Math.PI * 2 / 5);
        const radius = CANNON_WIDTH * 0.6 + Math.sin(time * 4 + i) * 3;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(138, 43, 226, ${0.7 + Math.sin(time * 3 + i) * 0.3})`;
        ctx.fill();
    }
    
    ctx.restore();
    
    // Draw balance at top left
    ctx.save();
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'left';
    
    // Add glow effect for balance
    const balanceGlow = Math.sin(animationTime * 2) * 0.2 + 0.8;
    ctx.shadowColor = 'rgba(0, 255, 128, 0.8)';
    ctx.shadowBlur = 10 * balanceGlow;
    ctx.fillStyle = '#fff';
    ctx.fillText('Balance:', 20, 30);
    
    ctx.fillStyle = 'rgba(0, 255, 128, 0.9)';
    ctx.shadowColor = 'rgba(0, 255, 128, 0.8)';
    ctx.shadowBlur = 15 * balanceGlow;
    ctx.fillText(` $${balance}`, 100, 30);
    ctx.restore();
    
    // Draw wager above cannon
    ctx.save();
    ctx.textAlign = 'center';
    
    // Add glow effect for wager label
    ctx.shadowColor = 'rgba(138, 43, 226, 0.8)';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px Arial';
    ctx.fillText('Wager:', canvas.width/2, CANNON_Y - 40);  // Adjusted relative to new CANNON_Y
    
    // Draw wager input box with animated border
    const borderGlow = Math.sin(animationTime * 3) * 0.2 + 0.8;
    ctx.fillStyle = isEditingWager ? 'rgba(138, 43, 226, 0.3)' : 'rgba(0, 0, 0, 0.5)';
    wagerInputPosition = { x: canvas.width/2, y: CANNON_Y - 25 };  // Adjusted relative to new CANNON_Y
    ctx.fillRect(wagerInputPosition.x - 50, wagerInputPosition.y - 12, 100, 24);
    
    // Draw wager input border with glow
    ctx.strokeStyle = `rgba(138, 43, 226, ${borderGlow})`;
    ctx.lineWidth = 1;
    ctx.strokeRect(wagerInputPosition.x - 50, wagerInputPosition.y - 12, 100, 24);
    
    // Draw wager value with glow
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(138, 43, 226, 0.8)';
    ctx.shadowBlur = 10 * borderGlow;
    ctx.font = 'bold 16px Arial';
    ctx.fillText(`$${isEditingWager ? wagerInputValue : currentWager}`, wagerInputPosition.x, wagerInputPosition.y + 6);
    
    ctx.restore();

    // Draw pegs with neon green theme
    pegs.forEach(peg => {
        // Draw outer glow
        const gradient = ctx.createRadialGradient(
            peg.x, peg.y, 0,
            peg.x, peg.y, PEG_RADIUS * 2.5
        );
        gradient.addColorStop(0, 'rgba(0, 255, 128, 0.4)');  // Bright neon green
        gradient.addColorStop(0.5, 'rgba(0, 255, 128, 0.2)');
        gradient.addColorStop(1, 'rgba(0, 255, 128, 0)');
        
        ctx.beginPath();
        ctx.arc(peg.x, peg.y, PEG_RADIUS * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw inner peg with bright neon effect
        const innerGradient = ctx.createRadialGradient(
            peg.x, peg.y, 0,
            peg.x, peg.y, PEG_RADIUS
        );
        innerGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');  // Pure white center
        innerGradient.addColorStop(0.4, 'rgba(128, 255, 128, 0.9)');  // Light neon green
        innerGradient.addColorStop(1, 'rgba(0, 255, 0, 0.8)');  // Bright green

        ctx.beginPath();
        ctx.arc(peg.x, peg.y, PEG_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = innerGradient;
        ctx.fill();

        // Add enhanced pulsing effect
        const pulseSize = Math.sin(animationTime * 2 + peg.x + peg.y) * 0.2 + 0.8;
        const pulseGradient = ctx.createRadialGradient(
            peg.x, peg.y, 0,
            peg.x, peg.y, PEG_RADIUS * pulseSize
        );
        pulseGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');  // Bright center
        pulseGradient.addColorStop(0.5, 'rgba(0, 255, 128, 0.6)');  // Neon green
        pulseGradient.addColorStop(1, 'rgba(0, 255, 0, 0)');

        ctx.beginPath();
        ctx.arc(peg.x, peg.y, PEG_RADIUS * pulseSize, 0, Math.PI * 2);
        ctx.fillStyle = pulseGradient;
        ctx.fill();

        // Add a bright outline
        ctx.beginPath();
        ctx.arc(peg.x, peg.y, PEG_RADIUS, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0, 255, 128, 0.6)';
        ctx.lineWidth = 1;
        ctx.stroke();
    });

    // Draw chips
    chips.forEach(chip => {
        chip.update();
        chip.draw();
    });

    // Update animation time
    animationTime += ANIMATION_SPEED;

    // Draw slots with rewards
    for (let i = 0; i < COLS; i++) {
        const dividerX = i * SLOT_WIDTH;
        const multiplier = SLOT_REWARDS[i] / CHIP_COST;
        
        // Unique background colors for each multiplier
        let bgColor;
        switch(multiplier) {
            case 50: bgColor = '#660000'; break;  // Dark red
            case 25: bgColor = '#663300'; break;  // Dark orange
            case 10: bgColor = '#666600'; break;  // Dark yellow
            case 5: bgColor = '#006600'; break;   // Dark green
            case 2: bgColor = '#006633'; break;   // Dark teal
            case 1: bgColor = '#006666'; break;   // Dark cyan
            case 0.5: bgColor = '#000066'; break; // Dark blue
            case 0.25: bgColor = '#330066'; break;// Dark purple
            case 0: bgColor = '#333333'; break;   // Dark gray
            default: bgColor = '#000000'; break;
        }
        
        // Draw background
        if (multiplier === 50) {
            // Fire/plasma effect for 50x background
            const time = animationTime * 0.4;
            const gradient = ctx.createLinearGradient(dividerX, canvas.height - DIVIDER_HEIGHT, 
                                                    dividerX + SLOT_WIDTH, canvas.height);
            
            // Intense fire colors
            const intensity = Math.sin(time) * 0.2 + 0.8;
            gradient.addColorStop(0, 'hsla(' + (20 + Math.sin(time) * 20) + ', 100%, ' + (50 * intensity) + '%, 1)');
            gradient.addColorStop(0.3, 'hsla(30, 100%, ' + (60 * intensity) + '%, 1)');
            gradient.addColorStop(0.6, 'hsla(40, 100%, ' + (40 * intensity) + '%, 1)');
            gradient.addColorStop(1, 'hsla(10, 100%, ' + (30 * intensity) + '%, 1)');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(dividerX, canvas.height - DIVIDER_HEIGHT, SLOT_WIDTH, DIVIDER_HEIGHT);
            
            // Add plasma/fire particles
            ctx.save();
            const particleCount = 8;
            for(let i = 0; i < particleCount; i++) {
                const particleTime = time + i;
                const x = dividerX + SLOT_WIDTH/2 + Math.sin(particleTime * 2 + i) * (SLOT_WIDTH * 0.4);
                const y = canvas.height - DIVIDER_HEIGHT * (0.2 + 0.8 * Math.abs(Math.sin(particleTime + i)));
                const size = (Math.sin(particleTime) * 0.5 + 1.5) * 2;
                
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                const particleIntensity = Math.sin(particleTime) * 0.5 + 0.5;
                ctx.fillStyle = `hsla(${30 + Math.sin(particleTime) * 20}, 100%, 70%, ${particleIntensity})`;
                ctx.fill();
            }
            
            // Add glow overlay
            ctx.globalAlpha = Math.abs(Math.sin(time)) * 0.3 + 0.2;
            ctx.fillStyle = `hsla(30, 100%, 50%, 0.3)`;
            ctx.fillRect(dividerX, canvas.height - DIVIDER_HEIGHT, SLOT_WIDTH, DIVIDER_HEIGHT);
            ctx.restore();
        } else if (multiplier === 25) {
            // New animation for 25x background - electric/plasma effect
            const gradient = ctx.createLinearGradient(dividerX, canvas.height - DIVIDER_HEIGHT, 
                                                    dividerX + SLOT_WIDTH, canvas.height);
            
            // Electric blue theme
            const time = animationTime * 0.5;
            const brightness = Math.sin(time) * 10 + 20;  // Pulsing brightness
            gradient.addColorStop(0, 'hsla(220, 100%, ' + brightness + '%, 1)');
            gradient.addColorStop(0.5, 'hsla(200, 100%, ' + (brightness + 5) + '%, 1)');
            gradient.addColorStop(1, 'hsla(240, 100%, ' + brightness + '%, 1)');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(dividerX, canvas.height - DIVIDER_HEIGHT, SLOT_WIDTH, DIVIDER_HEIGHT);
            
            // Add electric glow effect
            ctx.save();
            ctx.globalAlpha = Math.abs(Math.sin(time * 2)) * 0.3 + 0.1;
            ctx.fillStyle = `hsla(210, 100%, 50%, 0.3)`;
            ctx.fillRect(dividerX, canvas.height - DIVIDER_HEIGHT, SLOT_WIDTH, DIVIDER_HEIGHT);
            
            // Add some "sparks"
            const sparkCount = 3;
            ctx.globalAlpha = Math.abs(Math.sin(time * 3)) * 0.5 + 0.5;
            for(let i = 0; i < sparkCount; i++) {
                const sparkX = dividerX + (Math.sin(time * (i + 1)) + 1) * SLOT_WIDTH/2;
                const sparkY = canvas.height - DIVIDER_HEIGHT * (Math.cos(time * (i + 2)) + 1) / 2;
                ctx.beginPath();
                ctx.arc(sparkX, sparkY, 1, 0, Math.PI * 2);
                ctx.fillStyle = 'white';
                ctx.fill();
            }
            ctx.restore();
        } else {
            // Normal background for other multipliers
            ctx.fillStyle = bgColor;
            ctx.fillRect(dividerX, canvas.height - DIVIDER_HEIGHT, SLOT_WIDTH, DIVIDER_HEIGHT);
        }
        
        // Draw dividers
        ctx.fillStyle = '#666';
        ctx.fillRect(dividerX - 2, canvas.height - DIVIDER_HEIGHT, 4, DIVIDER_HEIGHT);
        
        // Draw multiplier text with unique colors and animation for edges
        let textColor;
        switch(multiplier) {
            case 50: textColor = '#ff0000'; break;  // Bright red
            case 25: textColor = '#ffa500'; break;  // Orange
            case 10: textColor = '#ffff00'; break;  // Yellow
            case 5: textColor = '#00ff00'; break;   // Green
            case 2: textColor = '#00ff99'; break;   // Bright teal
            case 1: textColor = '#00ffff'; break;   // Cyan
            case 0.5: textColor = '#0099ff'; break; // Light blue
            case 0.25: textColor = '#9933ff'; break;// Purple
            case 0: textColor = '#ffffff'; break;   // White
            default: textColor = '#ffffff'; break;
        }
        
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        const rewardX = dividerX + (SLOT_WIDTH / 2);
        
        // Animate edge multipliers (50x)
        if (multiplier === 50) {
            const time = animationTime * 0.8;
            const scale = 1 + Math.sin(time) * 0.15;
            
            ctx.save();
            ctx.translate(rewardX, canvas.height - 15);
            ctx.scale(scale, scale);
            
            // Multiple layers of text for intense effect
            for(let i = 0; i < 3; i++) {
                const layerOffset = i * 2;
                const hue = 30 + Math.sin(time * 2) * 20;
                const alpha = (3 - i) / 3;
                
                ctx.shadowColor = `hsla(${hue}, 100%, 50%, ${alpha})`;
                ctx.shadowBlur = (15 - layerOffset) * (Math.sin(time * 2) * 0.5 + 1);
                ctx.fillStyle = `hsla(${hue}, 100%, ${60 + layerOffset * 10}%, ${alpha})`;
                ctx.fillText(`${multiplier}x`, 0, 10);
            }
            
            // Add orbiting fire particles
            const orbitCount = 5;
            for(let i = 0; i < orbitCount; i++) {
                const orbitAngle = (time * 3 + i * (Math.PI * 2 / orbitCount)) % (Math.PI * 2);
                const orbitRadius = 15 + Math.sin(time * 2) * 3;
                const particleX = Math.cos(orbitAngle) * orbitRadius;
                const particleY = Math.sin(orbitAngle) * orbitRadius;
                
                ctx.beginPath();
                const particleSize = 1.5 + Math.sin(time * 3 + i) * 0.5;
                ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${30 + Math.sin(time + i) * 30}, 100%, 70%, ${0.8})`;
                ctx.fill();
            }
            
            ctx.restore();
        } else if (multiplier === 25) {
            // Electric text effect for 25x
            const time = animationTime * 0.8;
            const scale = 1 + Math.sin(time * 2) * 0.05;  // Subtle pulse
            
            ctx.save();
            ctx.translate(rewardX, canvas.height - 15);
            ctx.scale(scale, scale);
            
            // Electric blue color scheme
            const baseColor = `hsla(210, 100%, 70%, ${Math.abs(Math.sin(time)) * 0.5 + 0.5})`;
            const glowColor = `hsla(210, 100%, 50%, ${Math.abs(Math.sin(time * 2)) * 0.8 + 0.2})`;
            
            // Multiple layers of text for electric effect
            ctx.shadowColor = glowColor;
            ctx.shadowBlur = 15;
            ctx.fillStyle = baseColor;
            ctx.fillText(`${multiplier}x`, 0, 10);
            
            // Add extra glow layers
            ctx.shadowBlur = 8;
            ctx.shadowColor = 'white';
            ctx.fillText(`${multiplier}x`, 0, 10);
            
            // Add "electric" dots around text
            const radius = 12;
            const dotCount = 3;
            for(let i = 0; i < dotCount; i++) {
                const angle = (time * 2 + i * Math.PI * 2 / dotCount) % (Math.PI * 2);
                const dotX = Math.cos(angle) * radius;
                const dotY = Math.sin(angle) * radius;
                ctx.beginPath();
                ctx.arc(dotX, dotY, 1, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(135, 206, 250, 0.8)';  // Light blue
                ctx.fill();
            }
            
            ctx.restore();
        } else {
            // Normal text for other multipliers
            ctx.fillStyle = textColor;
            ctx.fillText(multiplier + 'x', rewardX, canvas.height - 5);
        }
    }

    // Draw final divider on the right
    ctx.fillStyle = '#666';
    ctx.fillRect(canvas.width - 2, canvas.height - DIVIDER_HEIGHT, 4, DIVIDER_HEIGHT);

    // Draw result message if exists
    if (resultMessage) {
        ctx.save();
        ctx.fillStyle = resultMessage.color;
        ctx.globalAlpha = resultMessage.opacity;
        
        // Special styling for big wins
        if (resultMessage.isSpecial) {
            ctx.font = 'bold 32px Arial';  // Bigger font
            ctx.shadowColor = '#ffd700';
            ctx.shadowBlur = 20;
            
            // Add glow effect
            const glowIntensity = Math.abs(Math.sin(animationTime * 3)) * 0.5 + 0.5;
            ctx.shadowColor = `rgba(255, 215, 0, ${glowIntensity})`;
        } else {
            ctx.font = 'bold 24px Arial';
        }
        
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(resultMessage.text, canvas.width / 2, resultMessage.y);
        ctx.restore();

        // Slower fade out
        resultMessage.y -= 0.3;
        resultMessage.opacity -= 0.004;

        if (resultMessage.opacity <= 0) {
            resultMessage = null;
        }
    }

    // Draw warning message if exists
    if (warningMessage) {
        ctx.save();
        ctx.fillStyle = `rgba(255, 50, 50, ${warningMessage.opacity})`;
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(warningMessage.text, canvas.width / 2, 100);  // Position under cannon
        ctx.restore();
        
        // Fade out warning
        warningMessage.opacity -= 0.02;
        if (warningMessage.opacity <= 0) {
            clearTimeout(warningMessage.timer);
            warningMessage = null;
        }
    }

    animationId = requestAnimationFrame(draw);
}

// Add a function for winning feedback (optional)
function showResultMessage(text, color, isSpecial = false) {
    resultMessage = {
        text: text,
        color: color,
        opacity: 1,
        y: canvas.height / 2,
        isSpecial: isSpecial
    };
    
    if (messageTimer) clearTimeout(messageTimer);
    messageTimer = null;
}

// Add this at the very end of the script
// Start the game
draw();

// Add this function to generate rainbow colors
function getRainbowColor(time) {
    const frequency = 0.3;
    const r = Math.sin(frequency * time + 0) * 127 + 128;
    const g = Math.sin(frequency * time + 2) * 127 + 128;
    const b = Math.sin(frequency * time + 4) * 127 + 128;
    return 'rgb(' + r + ', ' + g + ', ' + b + ')';
}

// Add this function to generate a gradient background color
function getGradientBackground(ctx, x, width, height, time) {
    const gradient = ctx.createLinearGradient(x, canvas.height - height, x + width, canvas.height);
    const hue1 = (time * 50) % 360;
    const hue2 = (hue1 + 180) % 360;
    
    gradient.addColorStop(0, 'hsla(' + hue1 + ', 100%, 20%, 1)');
    gradient.addColorStop(0.5, 'hsla(' + ((hue1 + hue2)/2) + ', 100%, 25%, 1)');
    gradient.addColorStop(1, 'hsla(' + hue2 + ', 100%, 20%, 1)');
    
    return gradient;
}

// Add warning message function
function showWarningMessage(text) {
    warningMessage = {
        text: text,
        opacity: 1,
        timer: setTimeout(() => {
            warningMessage = null;
        }, WARNING_DURATION)
    };
}

// Add click handler for shop button
document.querySelector('.menu-button:nth-child(2)').addEventListener('click', () => {
    window.location.href = 'shop.html';
});

// Add this line after any place where balance is modified
localStorage.setItem('balance', balance);

// Add click handler for inventory button
document.querySelector('.menu-button:nth-child(1)').addEventListener('click', () => {
    window.location.href = 'inventory.html';
});

// Update the updatePlayerBalance function
async function updatePlayerBalance(amount) {
    const playerName = localStorage.getItem('playerName');
    if (!playerName) {
        console.error('Player name not found in localStorage');
        window.location.href = 'signup.html';
        return;
    }

    try {
        if (!window.config) {
            throw new Error('Config not loaded');
        }

        // Get current balance from server - use window.config.API_URL
        const userResponse = await fetch(`${window.config.API_URL}/api/user/${playerName}`);
        if (!userResponse.ok) {
            throw new Error('Failed to fetch current balance');
        }
        const userData = await userResponse.json();
        
        // Calculate new balance
        const newBalance = userData.balance + amount;

        // Update server - use window.config.API_URL
        const updateResponse = await fetch(`${window.config.API_URL}/api/update-balance`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: playerName,
                balance: newBalance
            })
        });

        if (!updateResponse.ok) {
            throw new Error('Failed to update balance on server');
        }

        const result = await updateResponse.json();
        console.log('Balance updated successfully:', result);
        
        // Update local display
        balance = result.balance;
        localStorage.setItem('balance', balance);
        
        // Update leaderboard
        updateLeaderboard(playerName, balance);

    } catch (error) {
        console.error('Error updating balance:', error);
        // Instead of continuing with local balance, redirect to signup
        localStorage.clear();
        window.location.href = 'signup.html';
    }
}

// Update the initialization code
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded, checking config:', window.config);
    
    const playerName = localStorage.getItem('playerName');
    if (!playerName) {
        window.location.href = 'signup.html';
        return;
    }

    try {
        if (!window.config) {
            throw new Error('Config not loaded');
        }

        // Get user data from server
        const response = await fetch(`${window.config.API_URL}/api/user/${playerName}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const userData = await response.json();
        console.log('User data loaded:', userData);
        
        // Update local balance with server value
        balance = userData.balance;
        localStorage.setItem('balance', balance);

    } catch (error) {
        console.error('Error loading user data:', error);
        // Instead of using local balance, redirect to signup
        localStorage.clear();
        window.location.href = 'signup.html';
    }
});

