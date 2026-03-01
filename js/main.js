/**
 * 진입점: 캔버스 세팅, SceneManager, 게임 루프, 입력
 */

import { CANVAS_FONT_FAMILY } from './theme.js';
import { TitleScene } from './scenes/title.js';
import { IntroScene } from './scenes/intro.js';
import { GameScene } from './scenes/game.js';
import { ResultScene } from './scenes/result.js';

const canvas = document.getElementById('game-canvas');
const container = document.getElementById('game-container');
const skipBtn = document.getElementById('skip-btn');
const restartBtn = document.getElementById('restart-btn');

const DEFAULT_WIDTH = 900;
const DEFAULT_HEIGHT = 600;

const imageCache = new Map();
function loadImage(path) {
  if (imageCache.has(path)) return Promise.resolve(imageCache.get(path));
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      imageCache.set(path, img);
      resolve(img);
    };
    img.onerror = () => reject(new Error(`Failed to load: ${path}`));
    img.src = path;
  });
}

class SceneManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
    this.scenes = new Map();
    this.currentName = null;
    this.currentScene = null;
    this.state = { selectedParts: {}, partsRoundIndex: 0, hasSeenTitle: false };
    this.onShowSkip = null;
    this.onShowRestart = null;
    this.loadImage = loadImage;
  }

  setShowSkip(fn) {
    this.onShowSkip = fn;
  }

  setShowRestart(fn) {
    this.onShowRestart = fn;
  }

  register(name, scene) {
    scene.manager = this;
    this.scenes.set(name, scene);
  }

  switchScene(name) {
    const next = this.scenes.get(name);
    if (!next) return;
    this.currentScene?.onExit?.();
    this.currentName = name;
    this.currentScene = next;
    this.currentScene.onEnter?.();
  }

  update(deltaTime) {
    this.currentScene?.update?.(deltaTime);
  }

  draw() {
    this.currentScene?.draw?.();
  }

  handleClick(mx, my) {
    this.currentScene?.handleClick?.(mx, my);
  }

  handleMouseMove(mx, my) {
    this.currentScene?.handleMouseMove?.(mx, my);
  }

  handleMouseDown(mx, my) {
    this.currentScene?.handleMouseDown?.(mx, my);
  }

  handleMouseUp(mx, my) {
    this.currentScene?.handleMouseUp?.(mx, my);
  }

  resize(w, h) {
    this.width = w;
    this.height = h;
  }

  showSkipButton(show) {
    this.onShowSkip?.(show);
  }

  showRestartButton(show) {
    this.onShowRestart?.(show);
  }
}

const manager = new SceneManager(canvas);
manager.setShowSkip((show) => {
  if (show) skipBtn.classList.remove('hidden');
  else skipBtn.classList.add('hidden');
});
manager.setShowRestart((show) => {
  if (show) restartBtn?.classList.remove('hidden');
  else restartBtn?.classList.add('hidden');
});

manager.register('title', new TitleScene());
manager.register('intro', new IntroScene());
manager.register('game', new GameScene());
manager.register('result', new ResultScene());

function resize() {
  const w = Math.min(DEFAULT_WIDTH, container?.clientWidth || window.innerWidth);
  const h = Math.min(DEFAULT_HEIGHT, container?.clientHeight || window.innerHeight);
  const dpr = window.devicePixelRatio || 1;
  const bufferW = Math.round(w * dpr);
  const bufferH = Math.round(h * dpr);
  canvas.width = bufferW;
  canvas.height = bufferH;
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  manager.resize(w, h);
  const ctx = manager.ctx;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
}

skipBtn?.addEventListener('click', () => manager.handleClick(-1, -1));
restartBtn?.addEventListener('click', () => manager.handleClick(-2, -2));

function getLogicalCoords(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = manager.width / rect.width;
  const scaleY = manager.height / rect.height;
  return {
    mx: (e.clientX - rect.left) * scaleX,
    my: (e.clientY - rect.top) * scaleY,
  };
}

canvas.addEventListener('click', (e) => {
  const { mx, my } = getLogicalCoords(e);
  manager.handleClick(mx, my);
});

canvas.addEventListener('mousemove', (e) => {
  const { mx, my } = getLogicalCoords(e);
  manager.handleMouseMove(mx, my);
});

canvas.addEventListener('mousedown', (e) => {
  const { mx, my } = getLogicalCoords(e);
  manager.handleMouseDown(mx, my);
});

canvas.addEventListener('mouseup', (e) => {
  const { mx, my } = getLogicalCoords(e);
  manager.handleMouseUp(mx, my);
});

window.addEventListener('mouseup', () => {
  manager.handleMouseUp(-1, -1);
});

window.addEventListener('resize', resize);

let lastTime = performance.now();
function loop(now) {
  const delta = Math.min(now - lastTime, 100);
  lastTime = now;
  manager.update(delta);
  manager.draw();
  requestAnimationFrame(loop);
}

/** 커스텀 폰트 로딩 완료 후 씬 전환 및 게임 루프 시작 (canvas draw는 이 후에만 실행) */
function startAfterFontReady() {
  resize();
  manager.switchScene(manager.state.hasSeenTitle ? 'intro' : 'title');
  requestAnimationFrame(loop);
}

if (document.fonts && document.fonts.load) {
  document.fonts.load(`16px "${CANVAS_FONT_FAMILY}"`).then(() => {
    return document.fonts.ready;
  }).then(startAfterFontReady).catch(startAfterFontReady);
} else {
  startAfterFontReady();
}
