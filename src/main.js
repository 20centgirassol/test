class Inventory {
  constructor(scene) {
    this.scene = scene;
    this.blocks = [0, 1, 2];
    this.current = 0;
    this.modal = document.getElementById('inventoryModal');
    this.modal.querySelectorAll('.item').forEach(item => {
      item.addEventListener('click', () => {
        this.current = parseInt(item.dataset.type, 10);
        this.hide();
      });
    });
    this.hide();
  }
  show() { this.modal.style.display = 'block'; }
  hide() { this.modal.style.display = 'none'; }
  toggle() { this.modal.style.display === 'none' ? this.show() : this.hide(); }
  get type() { return this.blocks[this.current]; }
}

class Player {
  constructor(scene, x, y) {
    this.scene = scene;
    this.blockSize = scene.blockSize;
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.onGround = false;
    this.rect = scene.add.rectangle(x, y, this.blockSize, this.blockSize, 0xffff00);
  }

  update(cursors) {
    const dt = this.scene.game.loop.delta / 1000;
    const speed = 200;
    if (cursors.left.isDown) {
      this.vx = -speed;
    } else if (cursors.right.isDown) {
      this.vx = speed;
    } else {
      this.vx = 0;
    }

    if (cursors.up.isDown && this.onGround) {
      this.vy = -400;
      this.onGround = false;
    }

    this.vy += 800 * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    const tileX = Math.floor(this.x / this.blockSize);
    const groundHeight = this.scene.getGroundHeight(tileX);
    const groundY = (this.scene.gridHeight - groundHeight - 1) * this.blockSize;
    if (this.y > groundY) {
      this.y = groundY;
      this.vy = 0;
      this.onGround = true;
    }

    this.rect.x = this.x;
    this.rect.y = this.y;
  }
}

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  preload() {}

  create() {
    this.blockSize = 32;
    this.gridHeight = 15;
    this.inventory = new Inventory(this);
    this.colors = [0x8B4513, 0x00FF00, 0xAAAAAA];
    this.userBlocks = {};

    this.player = new Player(this, 100, 100);
    this.cameras.main.startFollow(this.player.rect, true, 0.1, 0.1);

    this.cursors = this.input.keyboard.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      up: Phaser.Input.Keyboard.KeyCodes.SPACE,
      inv: Phaser.Input.Keyboard.KeyCodes.I
    });
    this.cursors.inv.on('down', () => this.inventory.toggle());

    this.graphics = this.add.graphics();
    this.input.on('pointerdown', this.placeBlock, this);
  }

  getGroundHeight(x) {
    const base = 4;
    return base + Math.floor((Math.sin(x / 5) + 1) * 2);
  }

  placeBlock(pointer) {
    if (this.inventory.modal.style.display !== 'none') return;
    const tileX = Math.floor(pointer.worldX / this.blockSize);
    const tileY = Math.floor(pointer.worldY / this.blockSize);
    const key = `${tileX},${tileY}`;
    this.userBlocks[key] = this.inventory.type;
  }

  drawWorld() {
    const startX = Math.floor(this.cameras.main.scrollX / this.blockSize) - 1;
    const endX = startX + Math.ceil(this.cameras.main.width / this.blockSize) + 2;
    this.graphics.clear();
    for (let x = startX; x < endX; x++) {
      const ground = this.getGroundHeight(x);
      for (let y = 0; y < this.gridHeight; y++) {
        const key = `${x},${y}`;
        let block = this.userBlocks[key];
        if (block === undefined && y >= this.gridHeight - ground) {
          block = 0;
        }
        if (block !== undefined) {
          this.graphics.fillStyle(this.colors[block], 1);
          this.graphics.fillRect(x * this.blockSize, y * this.blockSize, this.blockSize, this.blockSize);
        }
        this.graphics.lineStyle(1, 0x333333, 0.3);
        this.graphics.strokeRect(x * this.blockSize, y * this.blockSize, this.blockSize, this.blockSize);
      }
    }
    if (!this.uiText) {
      this.uiText = this.add.text(10, 10, '', { font: '16px Arial', fill: '#ffffff' });
      this.uiText.setScrollFactor(0);
    }
    this.uiText.setText(`Bloco selecionado: ${this.inventory.current}`);
  }

  update() {
    this.player.update(this.cursors);
    this.drawWorld();
  }
}

const config = {
  type: Phaser.AUTO,
  width: 640,
  height: 480,
  backgroundColor: '#000',
  physics: { default: 'arcade' },
  scene: [GameScene]
};

new Phaser.Game(config);
