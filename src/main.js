class Inventory {
  constructor(scene) {
    this.scene = scene;
    // simple inventory with 3 types of blocks
    this.blocks = [0, 1, 2];
    this.current = 0;
  }
  next() {
    this.current = (this.current + 1) % this.blocks.length;
  }
  get type() {
    return this.blocks[this.current];
  }
}

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  preload() {
    // placeholder colors for blocks
  }

  create() {
    this.inventory = new Inventory(this);
    this.blockSize = 32;
    this.gridWidth = 20;
    this.gridHeight = 15;
    this.grid = [];
    for (let y = 0; y < this.gridHeight; y++) {
      this.grid[y] = [];
      for (let x = 0; x < this.gridWidth; x++) {
        this.grid[y][x] = -1; // empty
      }
    }
    this.graphics = this.add.graphics();
    this.input.on('pointerdown', this.placeBlock, this);
    this.input.keyboard.on('keydown-Q', () => this.inventory.next());
  }

  placeBlock(pointer) {
    const x = Math.floor(pointer.worldX / this.blockSize);
    const y = Math.floor(pointer.worldY / this.blockSize);
    if (x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight) {
      this.grid[y][x] = this.inventory.type;
    }
  }

  drawGrid() {
    this.graphics.clear();
    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        const block = this.grid[y][x];
        const colors = [0x8B4513, 0x00FF00, 0xAAAAAA];
        if (block >= 0) {
          this.graphics.fillStyle(colors[block], 1);
          this.graphics.fillRect(x * this.blockSize, y * this.blockSize, this.blockSize, this.blockSize);
        }
        this.graphics.lineStyle(1, 0x333333, 0.5);
        this.graphics.strokeRect(x * this.blockSize, y * this.blockSize, this.blockSize, this.blockSize);
      }
    }
    const text = `Selected block: ${this.inventory.current}`;
    if (!this.uiText) {
      this.uiText = this.add.text(10, 10, text, { font: '16px Arial', fill: '#ffffff' });
      this.uiText.setDepth(1);
    } else {
      this.uiText.setText(text);
    }
  }

  update() {
    this.drawGrid();
  }
}

const config = {
  type: Phaser.AUTO,
  width: 640,
  height: 480,
  backgroundColor: '#000',
  physics: {
    default: 'arcade'
  },
  scene: [GameScene]
};

new Phaser.Game(config);
