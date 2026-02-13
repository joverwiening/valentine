// Game Configuration
const TILE_SIZE = 100; // Side length of square
const USE_IMAGES = false; // Set to true to use images, false for color/text
const COLORS = {
    background: '#e6e8e3',
    tileBase: '#9caf88',
    tileHighlight: '#b0c499',
    hearth: '#d18c8c',
    text: '#ffffff'
};

// Data & State
const photos = [
    // Placeholder for image paths and captions
    // { src: 'img/photo1.jpg', caption: 'Our first trip' }
];

const tileDefinitions = [
    { type: 'living_room', label: 'Living Room', color: '#decbb7', count: 1, category: 'indoor' },
    { type: 'kitchen', label: 'Kitchen', color: '#f7d08a', count: 1, category: 'indoor' },
    { type: 'bedroom', label: 'Bedroom', color: '#e3d5ca', count: 1, category: 'indoor' },
    { type: 'children_room', label: 'Children Room?', color: '#e3d5ca', count: 2, category: 'indoor' },
    { type: 'reading_room', label: 'Reading Room', color: '#8d7b68', count: 1, category: 'indoor' },
    { type: 'library', label: 'Library', color: '#5e503f', count: 1, category: 'indoor' },
    { type: 'office', label: 'Office', color: '#aab3ab', count: 1, category: 'indoor' },
    { type: 'guest_room', label: 'Guest Room', color: '#d6cfcb', count: 1, category: 'indoor' },
    { type: 'music_room', label: 'Music Room', color: '#b08968', count: 1, category: 'indoor' },
    { type: 'storage', label: 'Storage', color: '#7f5539', count: 1, category: 'indoor' },
    { type: 'food_storage', label: 'Pantry', color: '#ddb892', count: 1, category: 'indoor' },
    { type: 'art_room', label: 'Art Room', color: '#e6ccb2', count: 1, category: 'indoor' },
    { type: 'pottery_room', label: 'Pottery Room', color: '#c4a484', count: 1, category: 'indoor' },
    // Outdoor
    { type: 'tree', label: 'Tree', color: '#588157', count: 10, category: 'outdoor' },
    { type: 'playground', label: 'Playground', color: '#a3b18a', count: 1, category: 'outdoor' },
    { type: 'swing', label: 'Swing', color: '#a3b18a', count: 1, category: 'outdoor' },
    { type: 'tree_cabin', label: 'Tree Cabin', color: '#3a5a40', count: 1, category: 'outdoor' },
    { type: 'pond', label: 'Pond', color: '#457b9d', count: 2, category: 'outdoor' },
    { type: 'grass_bees', label: 'Bees', color: '#ffea00', count: 2, category: 'outdoor' },
    { type: 'flower_field', label: 'Flowers', color: '#ffb5a7', count: 2, category: 'outdoor' },
    { type: 'veg_garden', label: 'Veg Garden', color: '#fcd5ce', count: 1, category: 'outdoor' },
    { type: 'herb_garden', label: 'Herbs', color: '#99d98c', count: 1, category: 'outdoor' }
];

let state = {
    placedTiles: [], // Map of grid coordinates to tile data
    availableTiles: [], // Deck
    tilesPlacedCount: 0,
    camera: { x: 0, y: 0, zoom: 1 },
    isDragging: false,
    dragStart: { x: 0, y: 0 },
    draggedTile: null, // The tile data currently being dragged
    draggedElement: null, // The DOM element being dragged (for removal)
    hoveredGridPos: null // Grid coordinate under mouse
};

// Canvas Setup
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
let canvasRect = canvas.getBoundingClientRect();

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvasRect = canvas.getBoundingClientRect();
    state.camera.x = canvas.width / 2;
    state.camera.y = canvas.height / 2;
    draw();
}
window.addEventListener('resize', resize);

// Grid System (Cartesian)
function gridToPixel(x, y) {
    return { 
        x: x * TILE_SIZE + state.camera.x, 
        y: y * TILE_SIZE + state.camera.y 
    };
}

function pixelToGrid(pixelX, pixelY) {
    const localX = pixelX - state.camera.x;
    const localY = pixelY - state.camera.y;
    const x = Math.round(localX / TILE_SIZE);
    const y = Math.round(localY / TILE_SIZE);
    return { x, y };
}

function getNeighbors(x, y) {
    return [
        { x: x + 1, y: y }, // Right
        { x: x - 1, y: y }, // Left
        { x: x, y: y + 1 }, // Down
        { x: x, y: y - 1 }  // Up
    ];
}

// Rendering
const loadedImages = {};

function onImageLoad(type, img) {
    loadedImages[type] = img;
    console.log(`Loaded image for ${type}`);
    draw(); // Redraw when image is ready
}

function onImageError(type) {
    console.warn(`Failed to load image for ${type}`);
}

// Preload images
tileDefinitions.forEach(def => {
    const img = new Image();
    img.src = `assets/tiles/${def.type}.png`;
    img.onload = () => onImageLoad(def.type, img);
    img.onerror = () => onImageError(def.type);
});
// Also load start tile
const startImg = new Image();
startImg.src = 'assets/tiles/start.png';
startImg.onload = () => onImageLoad('start', startImg);
startImg.onerror = () => onImageError('start');


function drawTile(x, y, color, label, type, isGhost = false, category = 'outdoor') {
    const center = gridToPixel(x, y);
    const half = TILE_SIZE / 2;
    
    // Draw Image if available
    let drawn = false;
    if (USE_IMAGES && type && loadedImages[type]) {
        try {
            const size = TILE_SIZE + 1; // Slight overlap to prevent cracks
            ctx.save();
            if (isGhost) ctx.globalAlpha = 0.5;
            
            // Draw image centered
            ctx.drawImage(loadedImages[type], center.x - half, center.y - half, size, size);
            
            ctx.globalAlpha = 1.0;
            ctx.restore();
            drawn = true;
        } catch(e) {
            console.warn("Failed to draw image for", type);
        }
    }

    // Fallback: Geometric Shape & Color
    if (!drawn) {
        ctx.beginPath();
        ctx.rect(center.x - half, center.y - half, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = color;
        if (isGhost) ctx.globalAlpha = 0.5;
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }
    
    // Note: Borders are now drawn separately in drawBorders()
    // But for ghosts, we should still draw a simple stroke
    if (isGhost) {
        ctx.beginPath();
        ctx.rect(center.x - half, center.y - half, TILE_SIZE, TILE_SIZE);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    // Text Label (Only show if no image)
    if (!drawn && label) {
        ctx.fillStyle = COLORS.text;
        ctx.font = '14px Gaegu';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, center.x, center.y);
    }
}

function drawBorders() {
    // Check 4 Edges for each tile
    // Directions: Right (x+1), Left (x-1), Down (y+1), Up (y-1)
    const dirs = [
        { dx: 1, dy: 0, edge: 'right' },
        { dx: -1, dy: 0, edge: 'left' },
        { dx: 0, dy: 1, edge: 'down' },
        { dx: 0, dy: -1, edge: 'up' }
    ];

    state.placedTiles.forEach(tile => {
        const center = gridToPixel(tile.x, tile.y);
        const half = TILE_SIZE / 2; // Slightly larger to cover gaps

        dirs.forEach(d => {
            const neighbor = state.placedTiles.find(t => t.x === tile.x + d.dx && t.y === tile.y + d.dy);
            
            const isMeIndoor = tile.category === 'indoor';
            const isNeighborIndoor = neighbor && neighbor.category === 'indoor';
            
            let strokeColor = null;
            let lineWidth = 0;

            if (isMeIndoor) {
                if (!isNeighborIndoor) {
                    // Indoor edge touching Outdoor or Empty -> Brown Wall
                    strokeColor = '#5c4033'; // Dark Wood
                    lineWidth = 6;
                } else {
                    // Indoor <-> Indoor -> No Border (Seamless)
                    strokeColor = null;
                }
            } else {
                // Outdoor Tile
                // No border for outdoor tiles as per request
                strokeColor = null;
            }

            if (strokeColor) {
                ctx.beginPath();
                // Determine Line Coords
                if(d.edge === 'right') {
                    ctx.moveTo(center.x + half, center.y - half);
                    ctx.lineTo(center.x + half, center.y + half);
                } else if(d.edge === 'left') {
                    ctx.moveTo(center.x - half, center.y - half);
                    ctx.lineTo(center.x - half, center.y + half);
                } else if(d.edge === 'down') {
                    ctx.moveTo(center.x - half, center.y + half);
                    ctx.lineTo(center.x + half, center.y + half);
                } else if(d.edge === 'up') {
                    ctx.moveTo(center.x - half, center.y - half);
                    ctx.lineTo(center.x + half, center.y - half);
                }

                ctx.strokeStyle = strokeColor;
                ctx.lineWidth = lineWidth;
                ctx.lineCap = 'square'; // Extend line cap to cover corners
                ctx.stroke();
            }
        });
    });
}

function draw() {
    // Clear
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw placed tiles (Content)
    state.placedTiles.forEach(tile => {
        drawTile(tile.x, tile.y, tile.color, tile.label, tile.type, false, tile.category);
    });
    
    // Draw Borders on top
    drawBorders();

    // Draw ghost tile if dragging and valid position
    if (state.draggedTile && state.hoveredGridPos) {
        if (isValidPlacement(state.hoveredGridPos.x, state.hoveredGridPos.y)) {
             drawTile(state.hoveredGridPos.x, state.hoveredGridPos.y, state.draggedTile.color, state.draggedTile.label, state.draggedTile.type, true, state.draggedTile.category);
        }
    }
}

// Game Logic
function initGame() {
    // Generate Deck
    state.availableTiles = [];
    tileDefinitions.forEach(def => {
        for(let i=0; i<def.count; i++) {
            state.availableTiles.push({ ...def });
        }
    });
    // Shuffle Deck
    for (let i = state.availableTiles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [state.availableTiles[i], state.availableTiles[j]] = [state.availableTiles[j], state.availableTiles[i]];
    }

    // Initial Center Tile (Generic Start)
    placeTile(0, 0, { type: 'start', label: 'Hearth', color: '#d18c8c', category: 'indoor' });

    // Initial Hand (Draw 3 tiles if possible)
    drawFromDeck();
    drawFromDeck();
    drawFromDeck();

    resize();
    updateUI();
}

function drawFromDeck() {
    if (state.availableTiles.length > 0) {
        const tile = state.availableTiles.pop();
        addTileToTray(tile);
    }
}

function placeTile(x, y, tileData) {
    state.placedTiles.push({ x, y, ...tileData });
    state.tilesPlacedCount++;
    
    // Check milestones
    // Moved checkProgression call to drop handler to await DOM update
    draw();
    updateUI();
}

function isValidPlacement(x, y) {
    // Check if already occupied
    const occupied = state.placedTiles.some(t => t.x === x && t.y === y);
    if (occupied) return false;

    // Check if neighbor to existing
    const neighbors = getNeighbors(x, y);
    const hasNeighbor = neighbors.some(n => 
        state.placedTiles.some(t => t.x === n.x && t.y === n.y)
    );
    return hasNeighbor;
}

function checkProgression() {
    // Draw new tile from deck to refill hand
    drawFromDeck();

    // Check if Game Over (Deck empty AND Tray empty)
    // tray usage is tracked by DOM elements currently.
    const trayCount = document.getElementById('tiles-container').childElementCount;
    
    if (state.availableTiles.length === 0 && trayCount === 0) {
        triggerFinale();
    }
}

// UI & Interaction
const tilesContainer = document.getElementById('tiles-container');

function addTileToTray(tileData) {
    const el = document.createElement('div');
    el.className = 'tile-ui';
    el.innerText = tileData.label;
    el.style.backgroundColor = tileData.color;
    el.draggable = true;

    // We attach the data to the element itself to find it later if needed, 
    // but dataTransfer is the standard way.
    
    el.addEventListener('dragstart', (e) => {
        state.draggedTile = tileData;
        el.classList.add('dragging');
        e.dataTransfer.setData('text/plain', JSON.stringify(tileData));
        e.dataTransfer.effectAllowed = 'move';
    });

    el.addEventListener('dragend', (e) => {
        state.draggedTile = null;
        el.classList.remove('dragging');
        draw(); // Clear ghost
    });

    // Touch Support for Mobile Drag & Drop
    el.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Prevent scrolling
        state.draggedTile = tileData;
        state.draggedElement = el; // Store reference
        el.classList.add('dragging');
    }, {passive: false});

    // Remove local touchend to avoid race condition with global handler
    // el.addEventListener('touchend', ...); 

    tilesContainer.appendChild(el);
}

function updateUI() {
    // placed-count is likely in the HTML, straightforward update
    const countEl = document.getElementById('placed-count');
    if(countEl) countEl.innerText = state.tilesPlacedCount;
}


// Canvas Interaction for Snapping
function handleMove(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;

    state.hoveredGridPos = pixelToGrid(mouseX, mouseY);
    draw();
}

canvas.addEventListener('dragover', (e) => {
    e.preventDefault(); // Allow dropping
    e.dataTransfer.dropEffect = 'move';
    handleMove(e.clientX, e.clientY);
});

// Global Touch Handlers (Combined for Dragging & Panning)
window.addEventListener('touchmove', (e) => {
    // 1. Handling Tile Dragging
    if (state.draggedTile) {
        e.preventDefault(); // Prevent scrolling while dragging tile
        const touch = e.touches[0];
        handleMove(touch.clientX, touch.clientY);
        return;
    }

    // 2. Handling Canvas Panning (if started)
    if (isPanning && e.touches.length === 1) {
        e.preventDefault();
        const touch = e.touches[0];
        const dx = touch.clientX - panStart.x;
        const dy = touch.clientY - panStart.y;
        state.camera.x += dx;
        state.camera.y += dy;
        panStart = { x: touch.clientX, y: touch.clientY };
        draw();
    }
}, {passive: false});

window.addEventListener('touchend', (e) => {
    if (state.draggedTile && state.hoveredGridPos) {
        const { x, y } = state.hoveredGridPos;
        
        if (x !== undefined && y !== undefined && isValidPlacement(x, y)) {
            placeTile(x, y, state.draggedTile);
            
            // Remove the actual element from tray
            // Since we stored the specific element in state, use that
            if (state.draggedElement) {
                state.draggedElement.remove();
            } else {
                // Fallback
                const draggedEl = document.querySelector('.tile-ui.dragging');
                if (draggedEl) draggedEl.remove();
            }
            
            checkProgression();
        }
    }
    
    // Cleanup
    if (state.draggedTile) {
        if (state.draggedElement) {
             state.draggedElement.classList.remove('dragging');
        } else {
             const draggedEl = document.querySelector('.tile-ui.dragging');
             if (draggedEl) draggedEl.classList.remove('dragging');
        }
        
        state.draggedTile = null;
        state.draggedElement = null;
        state.hoveredGridPos = null;
        draw();
    }
});

canvas.addEventListener('drop', (e) => {
    e.preventDefault();
    // Retrieve data
    let tileData;
    try {
        tileData = JSON.parse(e.dataTransfer.getData('text/plain'));
    } catch(err) {
        console.error("Drop data error", err);
        return;
    }

    const { x, y } = state.hoveredGridPos || {};

    if (x !== undefined && y !== undefined && isValidPlacement(x, y)) {
        // Place tile
        placeTile(x, y, tileData);
        
        // Remove from UI (the element that is currently being dragged)
        const draggedEl = document.querySelector('.tile-ui.dragging');
        if (draggedEl) {
            draggedEl.remove();
        }

        checkProgression();
    }
    
    state.hoveredGridPos = null;
    draw();
});

// Canvas Panning (Mouse Drag on background)
// Track mouse state for panning
let isPanning = false;
let panStart = { x: 0, y: 0 };

canvas.addEventListener('mousedown', (e) => {
    // Only pan if we are not clicking on a UI element (which is above canvas usually)
    isPanning = true;
    panStart = { x: e.clientX, y: e.clientY };
});

window.addEventListener('mousemove', (e) => {
    if (isPanning) {
        const dx = e.clientX - panStart.x;
        const dy = e.clientY - panStart.y;
        state.camera.x += dx;
        state.camera.y += dy;
        panStart = { x: e.clientX, y: e.clientY };
        draw();
    }
});

window.addEventListener('mouseup', () => {
    isPanning = false;
});

// Touch Panning
canvas.addEventListener('touchstart', (e) => {
    if (!state.draggedTile && e.touches.length === 1) {
        isPanning = true;
        panStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
}, {passive: false});

// Note: touchmove is handled in window listener above to support dragging tiles outside canvas,
// but we need to handle panning here if NOT dragging tile
// Modify global touchmove slightly:

/* 
   We already have window.touchmove above. Let's consolidate them or modify that one.
   Since I can't restart tool calls mid-flight easily, I will edit the existing window listener via replacement.
*/


// Finale Logic
function triggerFinale() {
    const modal = document.getElementById('valentine-modal');
    modal.classList.remove('hidden');

    const noBtn = document.getElementById('no-btn');
    const yesBtn = document.getElementById('yes-btn');

    // Make "No" button flee
    noBtn.addEventListener('mouseover', () => {
        const x = Math.random() * (window.innerWidth - 100);
        const y = Math.random() * (window.innerHeight - 50);
        noBtn.style.position = 'fixed';
        noBtn.style.left = x + 'px';
        noBtn.style.top = y + 'px';
    });

    yesBtn.addEventListener('click', () => {
        // Clear modal content and show finale
        const content = modal.querySelector('.modal-content');
        content.innerHTML = `
            <h2>Yay! ❤️</h2>
            <img src="assets/finale.jpg" style="max-width: 100%; max-height: 60vh; border-radius: 10px; margin: 20px 0;" alt="Us">
            <p style="font-size: 1.5rem; color: #d18c8c;">I love you</p>
        `;
    });
}

// Start
initGame();
