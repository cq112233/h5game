import * as Phaser from 'phaser';

export default class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' });
    this.gridSize = 60; // Size of each cell in pixels
    this.cols = 8;
    this.rows = 6;
    this.offsetX = 20;
    this.offsetY = 20;
    
    // Game state
    this.startPos = { x: 3, y: 3 };
    this.targets = [
      { x: 6, y: 1, icon: '🏰', name: '瘦西湖' },
      { x: 1, y: 1, icon: '⛩️', name: '大明寺' },
      { x: 6, y: 4, icon: '🏛️', name: '文昌阁' },
      { x: 1, y: 4, icon: '🏮', name: '东关街' }
    ];
    this.playerPos = { x: 3, y: 3 };
    
    // References to sprites
    this.playerSprite = null;
    
    this.isAnimating = false;
  }

  preload() {
    // We will use graphics and text for simplicity instead of loading external images for now.
  }

  applyPositions(positions) {
    this.startPos = positions[0];
    this.targets[0].x = positions[1].x;
    this.targets[0].y = positions[1].y;
    this.targets[1].x = positions[2].x;
    this.targets[1].y = positions[2].y;
    this.targets[2].x = positions[3].x;
    this.targets[2].y = positions[3].y;
    this.targets[3].x = positions[4].x;
    this.targets[3].y = positions[4].y;
  }

  randomizePositions() {
    const positions = [];
    while (positions.length < 5) {
      const pos = {
        x: Phaser.Math.Between(0, this.cols - 1),
        y: Phaser.Math.Between(0, this.rows - 1)
      };
      const exists = positions.some(p => p.x === pos.x && p.y === pos.y);
      if (!exists) {
        positions.push(pos);
      }
    }
    this.applyPositions(positions);
  }

  create() {
    this.randomizePositions();
    
    // Draw the grid
    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0x5d9cec, 1);
    
    const boardWidth = this.cols * this.gridSize;
    const boardHeight = this.rows * this.gridSize;
    
    // Draw background
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(this.offsetX, this.offsetY, boardWidth, boardHeight);
    
    for (let i = 0; i <= this.cols; i++) {
      graphics.moveTo(this.offsetX + i * this.gridSize, this.offsetY);
      graphics.lineTo(this.offsetX + i * this.gridSize, this.offsetY + boardHeight);
    }
    for (let i = 0; i <= this.rows; i++) {
      graphics.moveTo(this.offsetX, this.offsetY + i * this.gridSize);
      graphics.lineTo(this.offsetX + boardWidth, this.offsetY + i * this.gridSize);
    }
    graphics.strokePath();

    // Draw Targets
    this.targetSprites = [];
    this.targets.forEach(target => {
      const targetReal = this.getRealPosition(target.x, target.y);
      const sprite = this.add.text(targetReal.x, targetReal.y, target.icon, { fontSize: '32px' }).setOrigin(0.5);
      this.targetSprites.push(sprite);
    });

    // Draw Start Marker (faded)
    const startReal = this.getRealPosition(this.startPos.x, this.startPos.y);
    this.startSprite = this.add.text(startReal.x, startReal.y, '🏠', { fontSize: '32px', alpha: 0.3 }).setOrigin(0.5);

    // Draw Player
    this.playerSprite = this.add.text(startReal.x, startReal.y, '👧', { fontSize: '32px' }).setOrigin(0.5);
    this.playerPos = { ...this.startPos };
    
    // Expose scene to vue component through events or direct method
    this.events.emit('scene-ready');
  }

  generateNewBoard(positions) {
    if (positions) {
      this.applyPositions(positions);
    } else {
      this.randomizePositions();
    }
    
    if (this.startSprite) {
      const startReal = this.getRealPosition(this.startPos.x, this.startPos.y);
      this.startSprite.setPosition(startReal.x, startReal.y);
    }
    if (this.targetSprites && this.targetSprites.length === 4) {
      for (let i = 0; i < 4; i++) {
        const targetReal = this.getRealPosition(this.targets[i].x, this.targets[i].y);
        this.targetSprites[i].setPosition(targetReal.x, targetReal.y);
      }
    }
    
    this.resetGame();
  }
  
  getRealPosition(gridX, gridY) {
    return {
      x: this.offsetX + gridX * this.gridSize + this.gridSize / 2,
      y: this.offsetY + gridY * this.gridSize + this.gridSize / 2
    };
  }

  // Method to execute instructions from Vue
  async executeInstructions(instructions, onComplete) {
    if (this.isAnimating) return;
    this.isAnimating = true;
    
    let currentX = this.playerPos.x;
    let currentY = this.playerPos.y;
    
    const steps = [];
    
    for (let i = 0; i < instructions.length; i++) {
      const dir = instructions[i];
      let dx = 0;
      let dy = 0;
      
      switch (dir) {
        case 'up': dy = -1; break;
        case 'down': dy = 1; break;
        case 'left': dx = -1; break;
        case 'right': dx = 1; break;
      }
      
      let nextX = currentX + dx;
      let nextY = currentY + dy;
      
      // Check bounds
      if (nextX >= 0 && nextX < this.cols && nextY >= 0 && nextY < this.rows) {
        currentX = nextX;
        currentY = nextY;
        
        const realPos = this.getRealPosition(currentX, currentY);
        steps.push({ x: realPos.x, y: realPos.y });
      }
    }
    
    if (steps.length === 0) {
      this.isAnimating = false;
      if (onComplete) onComplete(false);
      return;
    }
    
    const playNextStep = (index) => {
      if (index >= steps.length) {
        this.playerPos.x = currentX;
        this.playerPos.y = currentY;
        this.isAnimating = false;
        
        // Check win
        const reachedTarget = this.targets.find(t => t.x === this.playerPos.x && t.y === this.playerPos.y);
        if (onComplete) onComplete(reachedTarget);
        return;
      }
      
      const targetPos = steps[index];
      
      this.tweens.add({
        targets: this.playerSprite,
        x: targetPos.x,
        y: targetPos.y,
        duration: 400,
        ease: 'Sine.easeInOut',
        onComplete: () => {
          playNextStep(index + 1);
        }
      });
    };
    
    // Start playing the sequence
    playNextStep(0);
  }
  
  resetGame() {
    if (this.isAnimating) {
      this.tweens.killAll();
      this.isAnimating = false;
    }
    
    this.playerPos = { ...this.startPos };
    const realPos = this.getRealPosition(this.playerPos.x, this.playerPos.y);
    this.playerSprite.setPosition(realPos.x, realPos.y);
  }
}
