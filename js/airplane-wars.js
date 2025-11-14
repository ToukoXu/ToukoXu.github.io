(() => {
  // 移除文章容器的 ID 以避免样式冲突
  const articleContainer = document.getElementById('article-container');
  articleContainer.id = '';

  // 获取Canvas和上下文
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const startScreen = document.getElementById('startScreen');
  const startBtn = document.getElementById('startBtn');
  const scoreElement = document.getElementById('score');
  const livesElement = document.getElementById('lives');
  const enemiesDefeatedElement = document.getElementById('enemiesDefeated');
  const skillChargeElement = document.getElementById('skillCharge');
  const trackingCountElement = document.getElementById('trackingCount');

  // 设置Canvas大小
  canvas.width = 800;
  canvas.height = 600;

  // 游戏状态
  let gameActive = false;
  let gamePaused = false;
  let score = 0;
  let lives = 3;
  let enemiesDefeated = 0;
  let playerFireRate = 3;
  let playerFireCooldown = 0;
  let skillCharge = 0;
  let trackingBulletCount = 0; // 追踪子弹
  let enemySpawnRate = 0.5;
  let gameTime = 0;
  let enemySpawnTimer = 0;
  let skillEffect = null;

  // 玩家飞机
  const player = {
    x: canvas.width / 2 - 15,
    y: canvas.height - 60,
    width: 30,
    height: 40,
    speed: 5,
    color: '#0ff',
  };

  // 游戏对象数组
  let playerBullets = [];
  let enemyBullets = [];
  let trackingBullets = [];
  let enemies = [];
  let eliteEnemies = [];
  let powerUps = [];
  let hitEffects = [];

  // 键盘状态
  const keys = {
    ArrowLeft: false,
    ArrowRight: false,
    ArrowUp: false,
    ArrowDown: false,
    KeyA: false,
    KeyD: false,
    KeyW: false,
    KeyS: false,
    KeyZ: false,
    KeyP: false,
  };

  // 事件监听
  document.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.code)) {
      keys[e.code] = true;

      if (e.code === 'KeyZ' && skillCharge > 0 && gameActive && !gamePaused) {
        releaseSkill();
      }

      // 暂停功能 - 修复：只在游戏激活时处理暂停
      if (e.code === 'KeyP' && gameActive) {
        gamePaused = !gamePaused;
        // 如果取消暂停，继续游戏循环
        if (!gamePaused) {
          gameLoop();
        }
      }
    }
  });

  document.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.code)) {
      keys[e.code] = false;
    }
  });

  startBtn.addEventListener('click', startGame);

  // 开始游戏
  function startGame() {
    startScreen.style.display = 'none';
    gameActive = true;
    gamePaused = false;
    score = 0;
    lives = 3;
    enemiesDefeated = 0;
    skillCharge = 0;
    trackingBulletCount = 0;
    enemySpawnRate = 0.5;
    gameTime = 0;
    enemySpawnTimer = 0;
    skillEffect = null;

    // 清空所有游戏对象
    clearAllGameObjects();

    // 初始化玩家位置
    player.x = canvas.width / 2 - player.width / 2;
    player.y = canvas.height - player.height - 20;

    updateUI();
    gameLoop();
  }

  // 清空所有游戏对象
  function clearAllGameObjects() {
    playerBullets.length = 0;
    enemyBullets.length = 0;
    trackingBullets.length = 0;
    enemies.length = 0;
    eliteEnemies.length = 0;
    powerUps.length = 0;
    hitEffects.length = 0;
  }

  // 更新UI
  function updateUI() {
    scoreElement.textContent = score;
    livesElement.textContent = lives;
    enemiesDefeatedElement.textContent = enemiesDefeated;
    skillChargeElement.textContent = skillCharge;
    trackingCountElement.textContent = trackingBulletCount;
  }

  // 绘制玩家飞机 - 传统战斗机造型
  function drawPlayer() {
    const x = player.x;
    const y = player.y;
    const width = player.width;
    const height = player.height;

    ctx.save();
    ctx.translate(x + width / 2, y + height / 2);

    // 机头（红色尖端）
    ctx.beginPath();
    ctx.moveTo(0, -height * 0.4);
    ctx.lineTo(-width * 0.1, -height * 0.2);
    ctx.lineTo(width * 0.1, -height * 0.2);
    ctx.closePath();
    ctx.fillStyle = '#E74C3C';
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 机身主体（白色+黄蓝装饰）
    // 上半部分
    ctx.beginPath();
    ctx.moveTo(-width * 0.2, -height * 0.2);
    ctx.lineTo(-width * 0.1, 0);
    ctx.lineTo(width * 0.1, 0);
    ctx.lineTo(width * 0.2, -height * 0.2);
    ctx.closePath();
    ctx.fillStyle = '#FFF';
    ctx.fill();
    ctx.stroke();
    // 中间黄色装饰
    ctx.beginPath();
    ctx.moveTo(-width * 0.15, 0);
    ctx.lineTo(-width * 0.05, height * 0.2);
    ctx.lineTo(width * 0.05, height * 0.2);
    ctx.lineTo(width * 0.15, 0);
    ctx.closePath();
    ctx.fillStyle = '#F1C40F';
    ctx.fill();
    ctx.stroke();
    // 下半部分蓝色装饰
    ctx.beginPath();
    ctx.moveTo(-width * 0.1, 0);
    ctx.lineTo(-width * 0.2, height * 0.3);
    ctx.lineTo(width * 0.2, height * 0.3);
    ctx.lineTo(width * 0.1, 0);
    ctx.closePath();
    ctx.fillStyle = '#3498DB';
    ctx.fill();
    ctx.stroke();

    // 机翼（蓝色）
    // 左机翼
    ctx.beginPath();
    ctx.moveTo(-width * 0.2, height * 0.1);
    ctx.lineTo(-width * 0.5, height * 0.3);
    ctx.lineTo(-width * 0.4, height * 0.5);
    ctx.lineTo(-width * 0.2, height * 0.3);
    ctx.closePath();
    ctx.fillStyle = '#3498DB';
    ctx.fill();
    ctx.stroke();
    // 右机翼
    ctx.beginPath();
    ctx.moveTo(width * 0.2, height * 0.1);
    ctx.lineTo(width * 0.5, height * 0.3);
    ctx.lineTo(width * 0.4, height * 0.5);
    ctx.lineTo(width * 0.2, height * 0.3);
    ctx.closePath();
    ctx.fillStyle = '#3498DB';
    ctx.fill();
    ctx.stroke();

    // 导弹（白色+红色尖端）
    // 左导弹1
    ctx.beginPath();
    ctx.moveTo(-width * 0.5, height * 0.3);
    ctx.lineTo(-width * 0.6, height * 0.4);
    ctx.lineTo(-width * 0.5, height * 0.5);
    ctx.lineTo(-width * 0.4, height * 0.4);
    ctx.closePath();
    ctx.fillStyle = '#FFF';
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-width * 0.6, height * 0.4);
    ctx.lineTo(-width * 0.7, height * 0.4);
    ctx.lineTo(-width * 0.6, height * 0.3);
    ctx.closePath();
    ctx.fillStyle = '#E74C3C';
    ctx.fill();
    ctx.stroke();
    // 左导弹2
    ctx.beginPath();
    ctx.moveTo(-width * 0.4, height * 0.5);
    ctx.lineTo(-width * 0.5, height * 0.6);
    ctx.lineTo(-width * 0.4, height * 0.7);
    ctx.lineTo(-width * 0.3, height * 0.6);
    ctx.closePath();
    ctx.fillStyle = '#FFF';
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-width * 0.5, height * 0.6);
    ctx.lineTo(-width * 0.6, height * 0.6);
    ctx.lineTo(-width * 0.5, height * 0.5);
    ctx.closePath();
    ctx.fillStyle = '#E74C3C';
    ctx.fill();
    ctx.stroke();
    // 右导弹1
    ctx.beginPath();
    ctx.moveTo(width * 0.5, height * 0.3);
    ctx.lineTo(width * 0.6, height * 0.4);
    ctx.lineTo(width * 0.5, height * 0.5);
    ctx.lineTo(width * 0.4, height * 0.4);
    ctx.closePath();
    ctx.fillStyle = '#FFF';
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(width * 0.6, height * 0.4);
    ctx.lineTo(width * 0.7, height * 0.4);
    ctx.lineTo(width * 0.6, height * 0.3);
    ctx.closePath();
    ctx.fillStyle = '#E74C3C';
    ctx.fill();
    ctx.stroke();
    // 右导弹2
    ctx.beginPath();
    ctx.moveTo(width * 0.4, height * 0.5);
    ctx.lineTo(width * 0.5, height * 0.6);
    ctx.lineTo(width * 0.4, height * 0.7);
    ctx.lineTo(width * 0.3, height * 0.6);
    ctx.closePath();
    ctx.fillStyle = '#FFF';
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(width * 0.5, height * 0.6);
    ctx.lineTo(width * 0.6, height * 0.6);
    ctx.lineTo(width * 0.5, height * 0.5);
    ctx.closePath();
    ctx.fillStyle = '#E74C3C';
    ctx.fill();
    ctx.stroke();

    // 尾焰（橙红）
    ctx.beginPath();
    ctx.moveTo(-width * 0.1, height * 0.3);
    ctx.lineTo(0, height * 0.8);
    ctx.lineTo(width * 0.1, height * 0.3);
    ctx.closePath();
    ctx.fillStyle = '#F39C12';
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-width * 0.08, height * 0.4);
    ctx.lineTo(-width * 0.02, height * 0.7);
    ctx.strokeStyle = '#E74C3C';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(width * 0.08, height * 0.4);
    ctx.lineTo(width * 0.02, height * 0.7);
    ctx.stroke();

    ctx.restore();
  }

  // 绘制玩家子弹
  function drawPlayerBullets() {
    playerBullets.forEach((bullet) => {
      ctx.save();

      // 子弹光晕效果
      const gradient = ctx.createRadialGradient(
        bullet.x,
        bullet.y,
        0,
        bullet.x,
        bullet.y,
        bullet.radius * 2,
      );
      gradient.addColorStop(0, '#ffff00');
      gradient.addColorStop(0.7, '#ffaa00');
      gradient.addColorStop(1, 'transparent');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, bullet.radius * 2, 0, Math.PI * 2);
      ctx.fill();

      // 子弹核心
      ctx.fillStyle = '#ffff00';
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });
  }

  // 绘制追踪子弹
  function drawTrackingBullets() {
    trackingBullets.forEach((bullet) => {
      ctx.save();

      // 添加光晕效果 - 与普通子弹类似但使用绿色系
      const gradient = ctx.createRadialGradient(
        bullet.x,
        bullet.y,
        0,
        bullet.x,
        bullet.y,
        bullet.radius * 2,
      );
      gradient.addColorStop(0, '#00ff00'); // 中心亮绿色
      gradient.addColorStop(0.7, '#00aa00'); // 中间暗绿色
      gradient.addColorStop(1, 'transparent'); // 外圈透明

      // 绘制光晕
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, bullet.radius * 2, 0, Math.PI * 2);
      ctx.fill();

      // 子弹核心
      ctx.fillStyle = '#00ff00';
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });
  }

  // 绘制敌机子弹
  function drawEnemyBullets() {
    enemyBullets.forEach((bullet) => {
      // 根据子弹类型设置颜色和效果
      let gradient;
      if (bullet.color === '#f0f') {
        // 精英敌机子弹 - 紫色光晕
        gradient = ctx.createRadialGradient(
          bullet.x,
          bullet.y,
          0,
          bullet.x,
          bullet.y,
          bullet.radius * 2,
        );
        gradient.addColorStop(0, '#f0f');
        gradient.addColorStop(0.7, '#a0a');
        gradient.addColorStop(1, 'transparent');
      } else {
        // 普通敌机子弹 - 红色光晕
        gradient = ctx.createRadialGradient(
          bullet.x,
          bullet.y,
          0,
          bullet.x,
          bullet.y,
          bullet.radius * 2,
        );
        gradient.addColorStop(0, '#f00');
        gradient.addColorStop(0.7, '#a00');
        gradient.addColorStop(1, 'transparent');
      }

      ctx.save();
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, bullet.radius * 2, 0, Math.PI * 2);
      ctx.fill();

      // 子弹核心
      ctx.fillStyle = bullet.color || '#f00';
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });
  }

  // 绘制普通敌机 - 翻转的传统战斗机造型
  function drawEnemies() {
    enemies.forEach((enemy) => {
      ctx.save();
      ctx.translate(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
      ctx.scale(1, -1);

      // 机头（红色尖端）
      ctx.beginPath();
      ctx.moveTo(0, -enemy.height * 0.4);
      ctx.lineTo(-enemy.width * 0.1, -enemy.height * 0.2);
      ctx.lineTo(enemy.width * 0.1, -enemy.height * 0.2);
      ctx.closePath();
      ctx.fillStyle = '#E74C3C';
      ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 机身主体（灰色系）
      // 上半部分
      ctx.beginPath();
      ctx.moveTo(-enemy.width * 0.2, -enemy.height * 0.2);
      ctx.lineTo(-enemy.width * 0.1, 0);
      ctx.lineTo(enemy.width * 0.1, 0);
      ctx.lineTo(enemy.width * 0.2, -enemy.height * 0.2);
      ctx.closePath();
      ctx.fillStyle = '#95A5A6';
      ctx.fill();
      ctx.stroke();
      // 中间装饰
      ctx.beginPath();
      ctx.moveTo(-enemy.width * 0.15, 0);
      ctx.lineTo(-enemy.width * 0.05, enemy.height * 0.2);
      ctx.lineTo(enemy.width * 0.05, enemy.height * 0.2);
      ctx.lineTo(enemy.width * 0.15, 0);
      ctx.closePath();
      ctx.fillStyle = '#7F8C8D';
      ctx.fill();
      ctx.stroke();
      // 下半部分装饰
      ctx.beginPath();
      ctx.moveTo(-enemy.width * 0.1, 0);
      ctx.lineTo(-enemy.width * 0.2, enemy.height * 0.3);
      ctx.lineTo(enemy.width * 0.2, enemy.height * 0.3);
      ctx.lineTo(enemy.width * 0.1, 0);
      ctx.closePath();
      ctx.fillStyle = '#7F8C8D';
      ctx.fill();
      ctx.stroke();

      // 机翼（深灰色）
      // 左机翼
      ctx.beginPath();
      ctx.moveTo(-enemy.width * 0.2, enemy.height * 0.1);
      ctx.lineTo(-enemy.width * 0.5, enemy.height * 0.3);
      ctx.lineTo(-enemy.width * 0.4, enemy.height * 0.5);
      ctx.lineTo(-enemy.width * 0.2, enemy.height * 0.3);
      ctx.closePath();
      ctx.fillStyle = '#7F8C8D';
      ctx.fill();
      ctx.stroke();
      // 右机翼
      ctx.beginPath();
      ctx.moveTo(enemy.width * 0.2, enemy.height * 0.1);
      ctx.lineTo(enemy.width * 0.5, enemy.height * 0.3);
      ctx.lineTo(enemy.width * 0.4, enemy.height * 0.5);
      ctx.lineTo(enemy.width * 0.2, enemy.height * 0.3);
      ctx.closePath();
      ctx.fillStyle = '#7F8C8D';
      ctx.fill();
      ctx.stroke();

      // 导弹（灰色+红色尖端）
      // 左导弹1
      ctx.beginPath();
      ctx.moveTo(-enemy.width * 0.5, enemy.height * 0.3);
      ctx.lineTo(-enemy.width * 0.6, enemy.height * 0.4);
      ctx.lineTo(-enemy.width * 0.5, enemy.height * 0.5);
      ctx.lineTo(-enemy.width * 0.4, enemy.height * 0.4);
      ctx.closePath();
      ctx.fillStyle = '#95A5A6';
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-enemy.width * 0.6, enemy.height * 0.4);
      ctx.lineTo(-enemy.width * 0.7, enemy.height * 0.4);
      ctx.lineTo(-enemy.width * 0.6, enemy.height * 0.3);
      ctx.closePath();
      ctx.fillStyle = '#E74C3C';
      ctx.fill();
      ctx.stroke();
      // 左导弹2
      ctx.beginPath();
      ctx.moveTo(-enemy.width * 0.4, enemy.height * 0.5);
      ctx.lineTo(-enemy.width * 0.5, enemy.height * 0.6);
      ctx.lineTo(-enemy.width * 0.4, enemy.height * 0.7);
      ctx.lineTo(-enemy.width * 0.3, enemy.height * 0.6);
      ctx.closePath();
      ctx.fillStyle = '#95A5A6';
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-enemy.width * 0.5, enemy.height * 0.6);
      ctx.lineTo(-enemy.width * 0.6, enemy.height * 0.6);
      ctx.lineTo(-enemy.width * 0.5, enemy.height * 0.5);
      ctx.closePath();
      ctx.fillStyle = '#E74C3C';
      ctx.fill();
      ctx.stroke();
      // 右导弹1
      ctx.beginPath();
      ctx.moveTo(enemy.width * 0.5, enemy.height * 0.3);
      ctx.lineTo(enemy.width * 0.6, enemy.height * 0.4);
      ctx.lineTo(enemy.width * 0.5, enemy.height * 0.5);
      ctx.lineTo(enemy.width * 0.4, enemy.height * 0.4);
      ctx.closePath();
      ctx.fillStyle = '#95A5A6';
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(enemy.width * 0.6, enemy.height * 0.4);
      ctx.lineTo(enemy.width * 0.7, enemy.height * 0.4);
      ctx.lineTo(enemy.width * 0.6, enemy.height * 0.3);
      ctx.closePath();
      ctx.fillStyle = '#E74C3C';
      ctx.fill();
      ctx.stroke();
      // 右导弹2
      ctx.beginPath();
      ctx.moveTo(enemy.width * 0.4, enemy.height * 0.5);
      ctx.lineTo(enemy.width * 0.5, enemy.height * 0.6);
      ctx.lineTo(enemy.width * 0.4, enemy.height * 0.7);
      ctx.lineTo(enemy.width * 0.3, enemy.height * 0.6);
      ctx.closePath();
      ctx.fillStyle = '#95A5A6';
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(enemy.width * 0.5, enemy.height * 0.6);
      ctx.lineTo(enemy.width * 0.6, enemy.height * 0.6);
      ctx.lineTo(enemy.width * 0.5, enemy.height * 0.5);
      ctx.closePath();
      ctx.fillStyle = '#E74C3C';
      ctx.fill();
      ctx.stroke();

      // 尾焰（暗红）
      ctx.beginPath();
      ctx.moveTo(-enemy.width * 0.1, enemy.height * 0.3);
      ctx.lineTo(0, enemy.height * 0.8);
      ctx.lineTo(enemy.width * 0.1, enemy.height * 0.3);
      ctx.closePath();
      ctx.fillStyle = '#C0392B';
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-enemy.width * 0.08, enemy.height * 0.4);
      ctx.lineTo(-enemy.width * 0.02, enemy.height * 0.7);
      ctx.strokeStyle = '#A93226';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(enemy.width * 0.08, enemy.height * 0.4);
      ctx.lineTo(enemy.width * 0.02, enemy.height * 0.7);
      ctx.stroke();

      ctx.restore();

      // 生命值条
      ctx.save();
      ctx.fillStyle = '#E74C3C';
      ctx.fillRect(enemy.x, enemy.y - 10, enemy.width * (enemy.health / enemy.maxHealth), 5);
      ctx.strokeStyle = '#E74C3C';
      ctx.lineWidth = 1;
      ctx.strokeRect(enemy.x, enemy.y - 10, enemy.width, 5);
      ctx.restore();
    });
  }

  // 绘制精英敌机 - 带特效的传统战斗机造型
  function drawEliteEnemies() {
    eliteEnemies.forEach((enemy) => {
      ctx.save();
      ctx.translate(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);

      // 精英特效 - 能量光环
      ctx.save();
      const radius = enemy.width / 2 + 15;
      const alpha = 0.4 + Math.sin(Date.now() / 300) * 0.2;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(147, 112, 219, ${alpha})`;
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.restore();

      // 翻转精英敌机
      ctx.scale(1, -1);

      // 绘制精英敌机主体（紫色系）
      // 机头（红色尖端）
      ctx.beginPath();
      ctx.moveTo(0, -enemy.height * 0.4);
      ctx.lineTo(-enemy.width * 0.1, -enemy.height * 0.2);
      ctx.lineTo(enemy.width * 0.1, -enemy.height * 0.2);
      ctx.closePath();
      ctx.fillStyle = '#E74C3C';
      ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 机身主体（紫色+金紫装饰）
      // 上半部分
      ctx.beginPath();
      ctx.moveTo(-enemy.width * 0.2, -enemy.height * 0.2);
      ctx.lineTo(-enemy.width * 0.1, 0);
      ctx.lineTo(enemy.width * 0.1, 0);
      ctx.lineTo(enemy.width * 0.2, -enemy.height * 0.2);
      ctx.closePath();
      ctx.fillStyle = '#9B59B6';
      ctx.fill();
      ctx.stroke();
      // 中间金色装饰
      ctx.beginPath();
      ctx.moveTo(-enemy.width * 0.15, 0);
      ctx.lineTo(-enemy.width * 0.05, enemy.height * 0.2);
      ctx.lineTo(enemy.width * 0.05, enemy.height * 0.2);
      ctx.lineTo(enemy.width * 0.15, 0);
      ctx.closePath();
      ctx.fillStyle = '#F1C40F';
      ctx.fill();
      ctx.stroke();
      // 下半部分深紫装饰
      ctx.beginPath();
      ctx.moveTo(-enemy.width * 0.1, 0);
      ctx.lineTo(-enemy.width * 0.2, enemy.height * 0.3);
      ctx.lineTo(enemy.width * 0.2, enemy.height * 0.3);
      ctx.lineTo(enemy.width * 0.1, 0);
      ctx.closePath();
      ctx.fillStyle = '#8E44AD';
      ctx.fill();
      ctx.stroke();

      // 机翼（紫色）
      // 左机翼
      ctx.beginPath();
      ctx.moveTo(-enemy.width * 0.2, enemy.height * 0.1);
      ctx.lineTo(-enemy.width * 0.5, enemy.height * 0.3);
      ctx.lineTo(-enemy.width * 0.4, enemy.height * 0.5);
      ctx.lineTo(-enemy.width * 0.2, enemy.height * 0.3);
      ctx.closePath();
      ctx.fillStyle = '#9B59B6';
      ctx.fill();
      ctx.stroke();
      // 右机翼
      ctx.beginPath();
      ctx.moveTo(enemy.width * 0.2, enemy.height * 0.1);
      ctx.lineTo(enemy.width * 0.5, enemy.height * 0.3);
      ctx.lineTo(enemy.width * 0.4, enemy.height * 0.5);
      ctx.lineTo(enemy.width * 0.2, enemy.height * 0.3);
      ctx.closePath();
      ctx.fillStyle = '#9B59B6';
      ctx.fill();
      ctx.stroke();

      // 导弹（紫色+红色尖端）
      // 左导弹1
      ctx.beginPath();
      ctx.moveTo(-enemy.width * 0.5, enemy.height * 0.3);
      ctx.lineTo(-enemy.width * 0.6, enemy.height * 0.4);
      ctx.lineTo(-enemy.width * 0.5, enemy.height * 0.5);
      ctx.lineTo(-enemy.width * 0.4, enemy.height * 0.4);
      ctx.closePath();
      ctx.fillStyle = '#9B59B6';
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-enemy.width * 0.6, enemy.height * 0.4);
      ctx.lineTo(-enemy.width * 0.7, enemy.height * 0.4);
      ctx.lineTo(-enemy.width * 0.6, enemy.height * 0.3);
      ctx.closePath();
      ctx.fillStyle = '#E74C3C';
      ctx.fill();
      ctx.stroke();
      // 左导弹2
      ctx.beginPath();
      ctx.moveTo(-enemy.width * 0.4, enemy.height * 0.5);
      ctx.lineTo(-enemy.width * 0.5, enemy.height * 0.6);
      ctx.lineTo(-enemy.width * 0.4, enemy.height * 0.7);
      ctx.lineTo(-enemy.width * 0.3, enemy.height * 0.6);
      ctx.closePath();
      ctx.fillStyle = '#9B59B6';
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-enemy.width * 0.5, enemy.height * 0.6);
      ctx.lineTo(-enemy.width * 0.6, enemy.height * 0.6);
      ctx.lineTo(-enemy.width * 0.5, enemy.height * 0.5);
      ctx.closePath();
      ctx.fillStyle = '#E74C3C';
      ctx.fill();
      ctx.stroke();
      // 右导弹1
      ctx.beginPath();
      ctx.moveTo(enemy.width * 0.5, enemy.height * 0.3);
      ctx.lineTo(enemy.width * 0.6, enemy.height * 0.4);
      ctx.lineTo(enemy.width * 0.5, enemy.height * 0.5);
      ctx.lineTo(enemy.width * 0.4, enemy.height * 0.4);
      ctx.closePath();
      ctx.fillStyle = '#9B59B6';
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(enemy.width * 0.6, enemy.height * 0.4);
      ctx.lineTo(enemy.width * 0.7, enemy.height * 0.4);
      ctx.lineTo(enemy.width * 0.6, enemy.height * 0.3);
      ctx.closePath();
      ctx.fillStyle = '#E74C3C';
      ctx.fill();
      ctx.stroke();
      // 右导弹2
      ctx.beginPath();
      ctx.moveTo(enemy.width * 0.4, enemy.height * 0.5);
      ctx.lineTo(enemy.width * 0.5, enemy.height * 0.6);
      ctx.lineTo(enemy.width * 0.4, enemy.height * 0.7);
      ctx.lineTo(enemy.width * 0.3, enemy.height * 0.6);
      ctx.closePath();
      ctx.fillStyle = '#9B59B6';
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(enemy.width * 0.5, enemy.height * 0.6);
      ctx.lineTo(enemy.width * 0.6, enemy.height * 0.6);
      ctx.lineTo(enemy.width * 0.5, enemy.height * 0.5);
      ctx.closePath();
      ctx.fillStyle = '#E74C3C';
      ctx.fill();
      ctx.stroke();

      // 尾焰（橙红+发光特效）
      ctx.beginPath();
      ctx.moveTo(-enemy.width * 0.1, enemy.height * 0.3);
      ctx.lineTo(0, enemy.height * 0.8);
      ctx.lineTo(enemy.width * 0.1, enemy.height * 0.3);
      ctx.closePath();
      ctx.fillStyle = '#F39C12';
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-enemy.width * 0.08, enemy.height * 0.4);
      ctx.lineTo(-enemy.width * 0.02, enemy.height * 0.7);
      ctx.strokeStyle = '#FF5733';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(enemy.width * 0.08, enemy.height * 0.4);
      ctx.lineTo(enemy.width * 0.02, enemy.height * 0.7);
      ctx.stroke();

      ctx.restore();

      // 生命值条
      ctx.save();
      ctx.fillStyle = '#E74C3C';
      ctx.fillRect(enemy.x, enemy.y - 10, enemy.width * (enemy.health / enemy.maxHealth), 5);
      ctx.strokeStyle = '#E74C3C';
      ctx.lineWidth = 1;
      ctx.strokeRect(enemy.x, enemy.y - 10, enemy.width, 5);
      ctx.restore();
    });
  }

  function drawPowerUps() {
    powerUps.forEach((powerUp) => {
      let color;
      switch (powerUp.type) {
        case 'skill':
          color = '#f0f';
          break;
        case 'health':
          color = '#f00';
          break;
      }

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(powerUp.x, powerUp.y, powerUp.radius, 0, Math.PI * 2);
      ctx.fill();

      // 绘制内部效果
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(powerUp.x, powerUp.y, powerUp.radius / 2, 0, Math.PI * 2);
      ctx.fill();

      // 绘制类型标识
      ctx.fillStyle = '#000';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      let text = powerUp.type === 'skill' ? 'Z' : 'H';
      ctx.fillText(text, powerUp.x, powerUp.y);
    });
  }

  // 绘制击中效果
  function drawHitEffects() {
    hitEffects.forEach((effect) => {
      ctx.save();
      ctx.globalAlpha = effect.life;
      ctx.fillStyle = effect.color;
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
      ctx.fill();

      // 添加外圈光晕
      ctx.strokeStyle = effect.color;
      ctx.lineWidth = 2;
      ctx.globalAlpha = effect.life * 0.5;
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, effect.radius + 3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    });
  }

  // 绘制技能效果
  function drawSkillEffect() {
    if (skillEffect && skillEffect.radius < skillEffect.maxRadius) {
      skillEffect.radius += 20;

      ctx.save();
      ctx.strokeStyle = skillEffect.color;
      ctx.lineWidth = skillEffect.lineWidth;
      ctx.globalAlpha = 1 - skillEffect.radius / skillEffect.maxRadius;
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, skillEffect.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // 如果动画完成，清除技能效果
      if (skillEffect.radius >= skillEffect.maxRadius) {
        skillEffect = null;
      }
    }
  }

  // 玩家自动射击
  function playerShoot() {
    playerFireCooldown -= 1 / 60;
    if (playerFireCooldown <= 0) {
      // 发射普通子弹
      playerBullets.push({
        x: player.x + player.width / 2,
        y: player.y,
        radius: 3,
        speed: 7,
        damage: 1,
      });

      // 发射追踪子弹
      for (let i = 0; i < trackingBulletCount; i++) {
        trackingBullets.push({
          x: player.x + player.width / 2,
          y: player.y,
          radius: 3,
          speed: 5,
          damage: 0.5,
          vx: 0,
          vy: -1,
        });
      }

      playerFireCooldown = 1 / playerFireRate;
    }
  }

  // 敌机射击
  function enemyShoot() {
    const currentTime = Date.now();

    // 普通敌机射击
    enemies.forEach((enemy) => {
      if (!enemy.lastShotTime || currentTime - enemy.lastShotTime >= 2000) {
        enemyBullets.push({
          x: enemy.x + enemy.width / 2,
          y: enemy.y + enemy.height,
          radius: 3,
          speed: 3,
          color: '#f00',
        });
        enemy.lastShotTime = currentTime;
      }
    });

    // 精英敌机射击
    eliteEnemies.forEach((enemy) => {
      if (!enemy.lastShotTime || currentTime - enemy.lastShotTime >= 1500) {
        // 精英敌机发射三颗子弹
        enemyBullets.push({
          x: enemy.x + enemy.width / 2 - 10,
          y: enemy.y + enemy.height,
          radius: 4,
          speed: 3,
          color: '#f0f',
        });
        enemyBullets.push({
          x: enemy.x + enemy.width / 2,
          y: enemy.y + enemy.height,
          radius: 4,
          speed: 3,
          color: '#f0f',
        });
        enemyBullets.push({
          x: enemy.x + enemy.width / 2 + 10,
          y: enemy.y + enemy.height,
          radius: 4,
          speed: 3,
          color: '#f0f',
        });
        enemy.lastShotTime = currentTime;
      }
    });
  }

  // 生成普通敌机
  function spawnEnemy() {
    const width = 30;
    const height = 40;

    let bestX = 0;
    let bestScore = -1;

    // 尝试多个候选位置，选择最优的
    for (let attempt = 0; attempt < 5; attempt++) {
      const candidateX = Math.random() * (canvas.width - width);
      let minDistance = Infinity;

      // 计算与所有现有敌机的最小距离
      for (let enemy of enemies) {
        const distance = Math.abs(candidateX - (enemy.x + enemy.width / 2));
        minDistance = Math.min(minDistance, distance);
      }

      // 选择距离最远的位置
      if (minDistance > bestScore) {
        bestScore = minDistance;
        bestX = candidateX;
      }
    }

    const stopY = Math.random() * (canvas.height / 2 - 100) + 50;

    enemies.push({
      x: bestX,
      y: -height,
      width: width,
      height: height,
      speed: (2 + Math.random() * 2) * 0.5,
      health: 2,
      maxHealth: 2,
      stopY: stopY,
      moving: false,
      direction: Math.random() > 0.5 ? 1 : -1,
    });
  }

  // 生成精英敌机
  function spawnEliteEnemy() {
    const width = 40;
    const height = 50;
    const x = Math.random() * (canvas.width - width);

    eliteEnemies.push({
      x: x,
      y: 50,
      width: width,
      height: height,
      speed: 2,
      health: 6,
      maxHealth: 6,
      direction: Math.random() > 0.5 ? 1 : -1,
    });
  }

  // 生成奖励物
  function spawnPowerUp() {
    const radius = 12;
    const x = Math.random() * (canvas.width - radius * 2) + radius;

    const types = ['skill', 'health'];
    const type = types[Math.floor(Math.random() * types.length)];

    powerUps.push({
      x: x,
      y: -radius,
      radius: radius,
      speed: 3,
      type: type,
    });
  }

  // 更新玩家子弹位置
  function updatePlayerBullets() {
    for (let i = playerBullets.length - 1; i >= 0; i--) {
      playerBullets[i].y -= playerBullets[i].speed;

      if (playerBullets[i].y < 0) {
        playerBullets.splice(i, 1);
      }
    }
  }

  // 更新追踪子弹位置
  function updateTrackingBullets() {
    for (let i = trackingBullets.length - 1; i >= 0; i--) {
      const bullet = trackingBullets[i];

      // 寻找最近的敌机
      let nearestEnemy = null;
      let minDistance = Infinity;

      // 合并检查普通和精英敌机
      const allEnemies = [...enemies, ...eliteEnemies];
      allEnemies.forEach((enemy) => {
        const dx = enemy.x + enemy.width / 2 - bullet.x;
        const dy = enemy.y + enemy.height / 2 - bullet.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < minDistance) {
          minDistance = distance;
          nearestEnemy = enemy;
        }
      });

      // 如果有敌机，追踪它
      if (nearestEnemy) {
        const dx = nearestEnemy.x + nearestEnemy.width / 2 - bullet.x;
        const dy = nearestEnemy.y + nearestEnemy.height / 2 - bullet.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        bullet.vx = dx / distance;
        bullet.vy = dy / distance;
      }

      // 更新子弹位置
      bullet.x += bullet.vx * bullet.speed;
      bullet.y += bullet.vy * bullet.speed;

      // 移除超出屏幕的子弹
      if (bullet.y < 0 || bullet.y > canvas.height || bullet.x < 0 || bullet.x > canvas.width) {
        trackingBullets.splice(i, 1);
      }
    }
  }

  // 更新敌机子弹位置
  function updateEnemyBullets() {
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
      enemyBullets[i].y += enemyBullets[i].speed;

      if (enemyBullets[i].y > canvas.height) {
        enemyBullets.splice(i, 1);
      }
    }
  }

  // 更新普通敌机位置
  function updateEnemies() {
    for (let i = enemies.length - 1; i >= 0; i--) {
      const enemy = enemies[i];

      // 添加浮动动画
      if (enemy.moving) {
        enemy.y += Math.sin(gameTime * 2 + i) * 0.3;
      }

      if (!enemy.moving && enemy.y < enemy.stopY) {
        enemy.y += enemy.speed;
      } else {
        enemy.moving = true;
        enemy.x += enemy.speed * enemy.direction;

        if (enemy.x <= 0 || enemy.x + enemy.width >= canvas.width) {
          enemy.direction *= -1;
        }
      }

      if (enemy.y > canvas.height) {
        enemies.splice(i, 1);
      }
    }
  }

  // 更新精英敌机位置
  function updateEliteEnemies() {
    for (let i = eliteEnemies.length - 1; i >= 0; i--) {
      const enemy = eliteEnemies[i];

      enemy.x += enemy.speed * enemy.direction;

      if (enemy.x <= 0 || enemy.x + enemy.width >= canvas.width) {
        enemy.direction *= -1;
      }
    }
  }

  // 更新奖励物位置
  function updatePowerUps() {
    for (let i = powerUps.length - 1; i >= 0; i--) {
      powerUps[i].y += powerUps[i].speed;

      if (powerUps[i].y > canvas.height) {
        powerUps.splice(i, 1);
      }
    }
  }

  // 更新击中效果
  function updateHitEffects() {
    for (let i = hitEffects.length - 1; i >= 0; i--) {
      const effect = hitEffects[i];
      effect.life -= 0.05;
      effect.radius += 0.5;

      if (effect.life <= 0) {
        hitEffects.splice(i, 1);
      }
    }
  }

  // 添加击中效果
  function addHitEffect(x, y, color = '#ffff00', size = 8) {
    hitEffects.push({
      x: x,
      y: y,
      radius: size,
      maxRadius: size * 2,
      color: color,
      life: 1.0,
      active: true,
    });
  }

  // 添加玩家被击中特效
  function addPlayerHitEffect() {
    // 创建多个击中效果围绕玩家飞机
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const distance = player.width / 2;
      const x = player.x + player.width / 2 + Math.cos(angle) * distance;
      const y = player.y + player.height / 2 + Math.sin(angle) * distance;
      addHitEffect(x, y, '#ff0000', 6);
    }
  }

  // 检测碰撞
  function checkCollisions() {
    // 检测子弹与敌机碰撞
    checkBulletEnemyCollisions();

    // 检测敌机子弹与玩家碰撞
    checkEnemyBulletPlayerCollisions();

    // 检测玩家与敌机碰撞
    checkPlayerEnemyCollisions();

    // 检测玩家与奖励物碰撞
    checkPlayerPowerUpCollisions();
  }

  // 检测子弹与敌机碰撞
  function checkBulletEnemyCollisions() {
    // 检测玩家子弹与敌机碰撞
    for (let i = playerBullets.length - 1; i >= 0; i--) {
      const bullet = playerBullets[i];

      for (let j = enemies.length - 1; j >= 0; j--) {
        const enemy = enemies[j];

        if (isColliding(bullet, enemy)) {
          // 添加击中效果
          for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            const distance = enemy.width / 2;
            const x = enemy.x + enemy.width / 2 + Math.cos(angle) * distance;
            const y = enemy.y + enemy.height / 2 + Math.sin(angle) * distance;
            addHitEffect(x, y, '#ffff00', 6); // 使用黄色特效，大小6
          }

          // 移除子弹
          playerBullets.splice(i, 1);

          // 减少敌机生命值
          enemy.health -= bullet.damage;

          if (enemy.health <= 0) {
            enemies.splice(j, 1);
            score += 10;
            enemiesDefeated++;

            // 每击败15个敌机刷新一个精英敌机
            if (enemiesDefeated % 15 === 0 && eliteEnemies.length === 0) {
              spawnEliteEnemy();
            }
          }
          break;
        }
      }

      // 检测玩家子弹与精英敌机碰撞
      for (let j = eliteEnemies.length - 1; j >= 0; j--) {
        const enemy = eliteEnemies[j];

        if (isColliding(bullet, enemy)) {
          // 添加击中效果
          for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            const distance = enemy.width / 2;
            const x = enemy.x + enemy.width / 2 + Math.cos(angle) * distance;
            const y = enemy.y + enemy.height / 2 + Math.sin(angle) * distance;
            addHitEffect(x, y, '#ffff00', 8); // 使用黄色特效，稍大一点
          }

          // 移除子弹
          playerBullets.splice(i, 1);

          // 减少敌机生命值
          enemy.health -= bullet.damage;

          if (enemy.health <= 0) {
            eliteEnemies.splice(j, 1);
            score += 100;
            enemiesDefeated++;

            // 击败精英敌机获得追踪子弹
            if (trackingBulletCount < 2) {
              trackingBulletCount++;
            }
          }
          break;
        }
      }
    }

    // 检测追踪子弹与敌机碰撞
    for (let i = trackingBullets.length - 1; i >= 0; i--) {
      const bullet = trackingBullets[i];

      for (let j = enemies.length - 1; j >= 0; j--) {
        const enemy = enemies[j];

        if (isColliding(bullet, enemy)) {
          // 添加击中效果
          for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            const distance = enemy.width / 2;
            const x = enemy.x + enemy.width / 2 + Math.cos(angle) * distance;
            const y = enemy.y + enemy.height / 2 + Math.sin(angle) * distance;
            addHitEffect(x, y, '#00ff00', 6); // 使用绿色特效，与追踪子弹颜色匹配
          }

          // 移除子弹
          trackingBullets.splice(i, 1);

          // 减少敌机生命值
          enemy.health -= bullet.damage;

          if (enemy.health <= 0) {
            enemies.splice(j, 1);
            score += 10;
            enemiesDefeated++;

            // 每击败15个敌机刷新一个精英敌机
            if (enemiesDefeated % 15 === 0 && eliteEnemies.length === 0) {
              spawnEliteEnemy();
            }
          }
          break;
        }
      }

      // 检测追踪子弹与精英敌机碰撞
      for (let j = eliteEnemies.length - 1; j >= 0; j--) {
        const enemy = eliteEnemies[j];

        if (isColliding(bullet, enemy)) {
          // 添加击中效果
          for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            const distance = enemy.width / 2;
            const x = enemy.x + enemy.width / 2 + Math.cos(angle) * distance;
            const y = enemy.y + enemy.height / 2 + Math.sin(angle) * distance;
            addHitEffect(x, y, '#00ff00', 8); // 使用绿色特效，稍大一点
          }

          // 移除子弹
          trackingBullets.splice(i, 1);

          // 减少敌机生命值
          enemy.health -= bullet.damage;

          if (enemy.health <= 0) {
            eliteEnemies.splice(j, 1);
            score += 100;
            enemiesDefeated++;

            // 击败精英敌机获得追踪子弹
            if (trackingBulletCount < 2) {
              trackingBulletCount++;
            }
          }
          break;
        }
      }
    }
  }

  // 检测敌机子弹与玩家碰撞
  function checkEnemyBulletPlayerCollisions() {
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
      const bullet = enemyBullets[i];

      if (isColliding(bullet, player)) {
        // 添加玩家被击中特效
        addPlayerHitEffect();

        enemyBullets.splice(i, 1);
        lives--;

        if (lives <= 0) {
          gameOver();
        }
        break;
      }
    }
  }

  // 检测玩家与敌机碰撞
  function checkPlayerEnemyCollisions() {
    for (let i = enemies.length - 1; i >= 0; i--) {
      const enemy = enemies[i];

      if (isColliding(player, enemy)) {
        // 添加玩家被击中特效
        addPlayerHitEffect();

        enemies.splice(i, 1);
        lives--;

        if (lives <= 0) {
          gameOver();
        }
        break;
      }
    }

    for (let i = eliteEnemies.length - 1; i >= 0; i--) {
      const enemy = eliteEnemies[i];

      if (isColliding(player, enemy)) {
        // 添加玩家被击中特效
        addPlayerHitEffect();

        eliteEnemies.splice(i, 1);
        lives--;

        if (lives <= 0) {
          gameOver();
        }
        break;
      }
    }
  }

  // 检测玩家与奖励物碰撞
  function checkPlayerPowerUpCollisions() {
    for (let i = powerUps.length - 1; i >= 0; i--) {
      const powerUp = powerUps[i];
      const dx = player.x + player.width / 2 - powerUp.x;
      const dy = player.y + player.height / 2 - powerUp.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < player.width / 2 + powerUp.radius) {
        powerUps.splice(i, 1);

        if (powerUp.type === 'skill') {
          addSkillCharge();
        } else if (powerUp.type === 'health') {
          addHealth();
        }
        break;
      }
    }
  }

  // 碰撞检测辅助函数
  function isColliding(obj1, obj2) {
    // 对于圆形物体（子弹）与矩形物体（飞机）的碰撞
    if (obj1.radius && obj2.width) {
      // 子弹与矩形敌机碰撞
      const closestX = Math.max(obj2.x, Math.min(obj1.x, obj2.x + obj2.width));
      const closestY = Math.max(obj2.y, Math.min(obj1.y, obj2.y + obj2.height));
      const distanceX = obj1.x - closestX;
      const distanceY = obj1.y - closestY;
      return distanceX * distanceX + distanceY * distanceY < obj1.radius * obj1.radius;
    }

    // 对于矩形物体（玩家与敌机）的碰撞
    if (obj1.width && obj2.width) {
      return (
        obj1.x < obj2.x + obj2.width &&
        obj1.x + obj1.width > obj2.x &&
        obj1.y < obj2.y + obj2.height &&
        obj1.y + obj1.height > obj2.y
      );
    }

    return false;
  }

  // 添加技能充能
  function addSkillCharge() {
    if (skillCharge < 2) {
      skillCharge++;
    }
  }

  // 添加生命值
  function addHealth() {
    if (lives < 5) {
      lives++;
    }
  }

  // 释放技能
  function releaseSkill() {
    if (skillCharge <= 0) return;

    skillCharge--;

    // 创建技能效果
    skillEffect = {
      active: true,
      radius: 0,
      maxRadius: Math.max(canvas.width, canvas.height) * 0.8,
      color: '#ff00ff',
      lineWidth: 10,
    };

    // 全屏敌机受到2点伤害
    for (let i = enemies.length - 1; i >= 0; i--) {
      enemies[i].health -= 2;
      if (enemies[i].health <= 0) {
        enemies.splice(i, 1);
        score += 10;
        enemiesDefeated++;
      }
    }

    for (let i = eliteEnemies.length - 1; i >= 0; i--) {
      eliteEnemies[i].health -= 2;
      if (eliteEnemies[i].health <= 0) {
        eliteEnemies.splice(i, 1);
        score += 100;
        enemiesDefeated++;

        if (trackingBulletCount < 2) {
          trackingBulletCount++;
        }
      }
    }

    // 清除所有敌机子弹
    enemyBullets.length = 0;
  }

  // 游戏结束
  function gameOver() {
    gameActive = false;
    startScreen.style.display = 'flex';
    startScreen.innerHTML = `
      <h1>游戏结束</h1>
      <p>你的得分: ${score}</p>
      <p>击败敌机: ${enemiesDefeated}</p>
      <button class="aw-btn" id="restartBtn">重新开始</button>
    `;
    document.getElementById('restartBtn').addEventListener('click', startGame);
  }

  // 绘制背景
  function drawBackground() {
    ctx.fillStyle = 'rgba(0, 10, 30, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 动态星星
    ctx.fillStyle = 'white';
    for (let i = 0; i < 50; i++) {
      const x = (Math.random() * canvas.width + gameTime * 10) % canvas.width;
      const y = (Math.random() * canvas.height + gameTime * 5) % canvas.height;
      const size = Math.random() * 2;
      const alpha = 0.5 + Math.random() * 0.5;
      ctx.globalAlpha = alpha;
      ctx.fillRect(x, y, size, size);
    }
    ctx.globalAlpha = 1;
  }

  // 处理玩家输入
  function handlePlayerInput() {
    if ((keys.ArrowLeft || keys.KeyA) && player.x > 0) {
      player.x -= player.speed;
    }
    if ((keys.ArrowRight || keys.KeyD) && player.x < canvas.width - player.width) {
      player.x += player.speed;
    }
    if ((keys.ArrowUp || keys.KeyW) && player.y > 0) {
      player.y -= player.speed;
    }
    if ((keys.ArrowDown || keys.KeyS) && player.y < canvas.height - player.height) {
      player.y += player.speed;
    }
  }

  // 处理生成逻辑
  function handleSpawning() {
    enemySpawnTimer += 1 / 60;
    if (enemySpawnTimer >= 1 / enemySpawnRate) {
      spawnEnemy();
      enemySpawnTimer = 0;
    }

    if (Math.random() < 0.0005) {
      spawnPowerUp();
    }
  }

  // 更新游戏对象
  function updateGameObjects() {
    updatePlayerBullets();
    updateTrackingBullets();
    updateEnemyBullets();
    updateEnemies();
    updateEliteEnemies();
    updatePowerUps();
    updateHitEffects();
  }

  // 绘制游戏对象
  function drawGameObjects() {
    drawEnemies();
    drawEliteEnemies();
    drawPlayerBullets();
    drawTrackingBullets();
    drawEnemyBullets();
    drawPowerUps();
    drawHitEffects();
    drawSkillEffect();
    drawPlayer();
  }

  // 绘制暂停画面
  function drawPauseScreen() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'white';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('游戏暂停', canvas.width / 2, canvas.height / 2 - 40);

    ctx.font = '24px Arial';
    ctx.fillText('按 P 键继续游戏', canvas.width / 2, canvas.height / 2 + 20);

    ctx.font = '18px Arial';
    ctx.fillStyle = '#0ff';
    ctx.fillText('使用方向键或WASD移动飞机', canvas.width / 2, canvas.height / 2 + 60);
    ctx.fillText('按Z键释放技能', canvas.width / 2, canvas.height / 2 + 90);
  }

  // 更新游戏难度
  function updateGameDifficulty() {
    const baseSpawnRate = 0.5;
    const scoreFactor = Math.min(score * 0.0001, 2);
    const timeFactor = Math.min(gameTime * 0.001, 3);

    enemySpawnRate = baseSpawnRate + scoreFactor + timeFactor;
  }

  // 游戏主循环
  function gameLoop() {
    if (!gameActive) return;

    // 如果游戏暂停，只绘制暂停画面
    if (gamePaused) {
      // 清空画布
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 绘制背景
      drawBackground();

      // 绘制游戏对象（静止状态）
      drawGameObjects();

      // 绘制暂停画面
      drawPauseScreen();

      return;
    }

    // 更新游戏时间
    gameTime += 1 / 60;

    // 更新游戏难度
    updateGameDifficulty();

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制背景
    drawBackground();

    // 处理玩家输入
    handlePlayerInput();

    // 射击逻辑
    playerShoot();
    enemyShoot();

    // 生成逻辑
    handleSpawning();

    // 更新游戏对象
    updateGameObjects();

    // 检测碰撞
    checkCollisions();

    // 更新UI
    updateUI();

    // 绘制游戏对象
    drawGameObjects();

    // 继续游戏循环
    requestAnimationFrame(gameLoop);
  }
})();
