import { SCENE, FONT_SIZE, FONT_FAMILY, BLOCK_SIZE, PLATFORM_HEIGHT_IN_BLOCKS } from '../config.js';
import { Player } from '../player.js';
import { Stage } from '../stage.js';
import { ScaffoldBlock } from '../scaffold.js';
import { InputHandler } from '../input_handler.js';

const SCAFFOLD_KEYS = ['J', 'K', 'L'];
const SCAFFOLD_KEY_MAP = {
    'KeyJ': 'ACTION_J',
    'KeyK': 'ACTION_K',
    'KeyL': 'ACTION_L',
};

export class GameScene {
    constructor(game) {
        this.game = game;
        this.selectedInstrument = null;
        this.player2Input = new InputHandler(SCAFFOLD_KEY_MAP);
    }

    init(data) {
        this.startTime = Date.now();
        this.score = 0;
        this.selectedInstrument = data.instrument || 'なし';

        this.player = new Player(this.game);
        this.stage = new Stage(this.game);
        this.scaffolds = [];

        this.player.init();
        this.stage.init();
        this.player2Input.init();
    }

    requestScaffold(holeX, holeWidth) {
        const key = SCAFFOLD_KEYS[Math.floor(Math.random() * SCAFFOLD_KEYS.length)];
        const scaffoldWidthInBlocks = 7;
        const scaffoldHeightInBlocks = 1;
        const x = holeX + (holeWidth - (scaffoldWidthInBlocks * BLOCK_SIZE)) / 2;
        const y = this.game.canvas.height - (PLATFORM_HEIGHT_IN_BLOCKS * BLOCK_SIZE) - (scaffoldHeightInBlocks * BLOCK_SIZE) * 3;
        
        this.scaffolds.push(new ScaffoldBlock(x, y, scaffoldWidthInBlocks, scaffoldHeightInBlocks, key));
    }

    update() {
        this.score = Math.floor((Date.now() - this.startTime) / 1000);

        this.stage.update();
        this.scaffolds.forEach(s => s.update());

        // ★★★ 足場入力ロジックの修正 ★★★
        // 1. 画面内でアクティブな足場候補をすべて見つける
        const activeScaffoldsOnScreen = this.scaffolds.filter(s => 
            s.state === 'ACTIVE' &&
            s.x < this.stage.cameraX + this.game.canvas.width &&
            s.x + s.width > this.stage.cameraX
        );

        // 2. 候補の中から一番手前（x座標が最小）のものをターゲットとして選ぶ
        let targetScaffold = null;
        if (activeScaffoldsOnScreen.length > 0) {
            targetScaffold = activeScaffoldsOnScreen.reduce((prev, curr) => 
                prev.x < curr.x ? prev : curr
            );
        }

        // 3. ターゲットが存在する場合のみ、入力処理を行う
        if (targetScaffold) {
            const action = `ACTION_${targetScaffold.key}`;
            if (this.player2Input.isActionPressed(action)) {
                targetScaffold.solidify();
            }
        }
        // ★★★ ここまで ★★★

        const solidScaffolds = this.scaffolds.filter(s => s.state === 'SOLID');
        const allPlatforms = [...this.stage.platforms, ...solidScaffolds];
        this.player.update(allPlatforms);

        this.scaffolds = this.scaffolds.filter(s => s.state !== 'EXPIRED' && s.x + s.width > this.stage.cameraX);

        this.checkGameOver();
        this.player2Input.clearPressedActions();
    }

    checkGameOver() {
        if (this.player.y > this.game.canvas.height) {
            this.gameOver();
        }
        if (this.player.x < this.stage.cameraX) {
            this.gameOver();
        }
    }

    gameOver() {
        this.player.destroy();
        this.player2Input.destroy();
        this.game.changeScene(SCENE.GAME_OVER, { score: this.score, instrument: this.selectedInstrument });
    }

    draw() {
        const ctx = this.game.ctx;
        const { width, height } = this.game.canvas;

        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#d0d0d0';
        ctx.fillRect(0, 0, width, height);

        ctx.save();
        ctx.translate(-this.stage.cameraX, 0);

        this.stage.draw(ctx);
        this.player.draw(ctx);
        this.scaffolds.forEach(s => s.draw(ctx));

        ctx.restore();

        ctx.fillStyle = 'black';
        ctx.textAlign = 'left';
        ctx.font = `${FONT_SIZE.SMALL}px ${FONT_FAMILY}`;
        ctx.fillText(`スコア: ${this.score}`, 20, 50);
        ctx.fillText(`楽器: ${this.selectedInstrument}`, 20, 100);
    }
}
