(() => {
  // 游戏配置 - 根据难度动态设置
  const difficultySettings = {
    easy: {
      rows: 8,
      cols: 10,
      tileTypes: 20,
      timeLimit: 300, // 5分钟
    },
    medium: {
      rows: 10,
      cols: 14,
      tileTypes: 28,
      timeLimit: 480, // 8分钟
    },
    hard: {
      rows: 12,
      cols: 18,
      tileTypes: 36,
      timeLimit: 600, // 10分钟
    },
  };

  // 难度顺序
  const difficultyOrder = Object.keys(difficultySettings);

  // 默认配置
  let config = { ...difficultySettings.easy };

  // 游戏状态
  let gameState = {
    board: [],
    selectedTile: null,
    score: 0,
    timeLeft: config.timeLimit,
    timer: null,
    isGameOver: false,
    removedCount: 0,
    currentDifficulty: difficultyOrder[0], // 当前难度
    isPaused: false, // 暂停状态
  };

  // DOM 元素
  const llContainer = document.getElementById('ll-container');
  const difficultySelect = document.getElementById('ll-difficulty');
  const timerDisplay = document.getElementById('ll-timer');
  const scoreDisplay = document.getElementById('ll-score');
  const remainingDisplay = document.getElementById('ll-remaining');
  const gameBoard = document.getElementById('ll-game-board');
  const restartBtn = document.getElementById('ll-restart-btn');
  const pauseBtn = document.getElementById('ll-pause-btn');
  const hintBtn = document.getElementById('ll-hint-btn');
  const reshuffleBtn = document.getElementById('ll-reshuffle-btn');
  const gameOverDialog = document.getElementById('ll-game-over-dialog');
  const gameOverTitle = document.getElementById('ll-game-over-title');
  const gameOverText = document.getElementById('ll-game-over-text');
  const gameOverConfirmBtn = document.getElementById('ll-game-over-confirm-btn');
  const gamePauseDialog = document.getElementById('ll-game-pause-dialog');
  const resumeBtn = document.getElementById('ll-resume-btn');

  // 难度选择事件
  difficultySelect.onchange = () => {
    const difficulty = this.value;
    config = { ...difficultySettings[difficulty] };
    gameState.currentDifficulty = difficulty; // 更新当前难度

    // 重新开始游戏
    initGame();
  };

  // 初始化游戏
  function initGame() {
    // 清除游戏状态
    clearInterval(gameState.timer);
    gameState = {
      board: [],
      selectedTile: null,
      score: 0,
      timeLeft: config.timeLimit,
      timer: null,
      isGameOver: false,
      removedCount: 0,
      currentDifficulty: difficultySelect.value, // 使用当前选择的难度
      isPaused: false, // 重置暂停状态
    };

    // 根据难度调整方块尺寸
    adjustTileSize();

    // 更新显示
    updateDisplay();

    // 创建游戏板
    createBoard();

    // 开始计时
    startTimer();
  }

  // 根据难度调整方块尺寸
  function adjustTileSize() {
    const tiles = document.querySelectorAll('.ll-tile');
    const baseSize = 80;
    const baseRows = 8;
    const baseCols = 10;

    // 根据行列数计算缩放比例
    const rowScale = baseRows / config.rows;
    const colScale = baseCols / config.cols;
    const scale = Math.min(rowScale, colScale);

    const tileSize = Math.max(60, Math.floor(baseSize * scale)); // 最小60px

    // 更新CSS变量或直接设置样式
    document.documentElement.style.setProperty('--ll-tile-size', `${tileSize}px`);

    // 如果已经有方块，更新它们的尺寸
    if (tiles.length > 0) {
      tiles.forEach((tile) => {
        tile.style.width = `${tileSize}px`;
        tile.style.height = `${tileSize}px`;
      });
    }
  }

  // 更新显示
  function updateDisplay() {
    // 更新时间显示
    const minutes = Math.floor(gameState.timeLeft / 60);
    const seconds = gameState.timeLeft % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    // 更新分数显示
    scoreDisplay.textContent = gameState.score;

    // 更新剩余方块显示
    const remainingTiles = config.rows * config.cols - gameState.removedCount;
    remainingDisplay.textContent = remainingTiles;
  }

  // 创建游戏板
  function createBoard() {
    gameBoard.innerHTML = '';
    gameBoard.style.gridTemplateColumns = `repeat(${config.cols}, 1fr)`;

    // 创建图案数组（每个图案出现偶数次）
    let tiles = [];
    const totalTiles = config.rows * config.cols;
    const pairs = totalTiles / 2;

    for (let i = 0; i < pairs; i++) {
      const type = i % config.tileTypes;
      tiles.push(type, type);
    }

    // 随机打乱图案
    shuffleArray(tiles);

    // 创建游戏板数据结构和DOM元素
    for (let row = 0; row < config.rows; row++) {
      gameState.board[row] = [];
      for (let col = 0; col < config.cols; col++) {
        const tileType = tiles[row * config.cols + col];
        gameState.board[row][col] = {
          type: tileType,
          removed: false,
        };

        const tile = document.createElement('div');
        tile.className = 'll-tile';
        tile.dataset.row = row;
        tile.dataset.col = col;
        tile.textContent = getTileSymbol(tileType);
        tile.style.backgroundColor = getTileColor(tileType);

        tile.addEventListener('click', () => handleTileClick(row, col));

        gameBoard.appendChild(tile);
      }
    }
  }

  // 开始计时器
  function startTimer() {
    // 清除可能存在的旧计时器
    if (gameState.timer) {
      clearInterval(gameState.timer);
    }

    gameState.timer = setInterval(() => {
      // 只在非暂停状态下计时
      if (!gameState.isPaused) {
        gameState.timeLeft--;
        updateDisplay();

        if (gameState.timeLeft <= 0) {
          clearInterval(gameState.timer);
          gameState.isGameOver = true;

          // 显示游戏结束消息
          gameOverTitle.textContent = '⏰时间到，游戏结束';
          gameOverText.textContent = `最终得分：${gameState.score}`;
          gameOverDialog.style.display = 'block';
          llContainer.classList.add('project-mask');
        }
      }
    }, 1000);
  }

  // 处理方块点击
  function handleTileClick(row, col) {
    if (gameState.isGameOver) return;

    const tile = document.querySelector(`.ll-tile[data-row="${row}"][data-col="${col}"]`);

    // 如果点击的是已消除的方块，忽略
    if (gameState.board[row][col].removed) return;

    // 如果没有选中的方块，选中当前方块
    if (!gameState.selectedTile) {
      gameState.selectedTile = { row, col };
      tile.classList.add('selected');
      return;
    }

    // 如果点击的是已选中的方块，取消选中
    if (gameState.selectedTile.row === row && gameState.selectedTile.col === col) {
      gameState.selectedTile = null;
      tile.classList.remove('selected');
      return;
    }

    // 检查是否可以消除
    const firstTile = gameState.selectedTile;
    const secondTile = { row, col };

    // 检查两个方块是否是相同类型
    if (
      gameState.board[firstTile.row][firstTile.col].type !==
      gameState.board[secondTile.row][secondTile.col].type
    ) {
      // 类型不同，取消选中第一个，选中第二个
      document
        .querySelector(`.ll-tile[data-row="${firstTile.row}"][data-col="${firstTile.col}"]`)
        .classList.remove('selected');
      gameState.selectedTile = { row, col };
      tile.classList.add('selected');
      return;
    }

    // 检查是否可以连接
    const path = findConnectionPath(firstTile, secondTile);
    if (path) {
      // 可以连接，消除这两个方块
      removeTiles(firstTile, secondTile, path);
      gameState.score += 10;
      updateDisplay();

      // 检查游戏是否结束
      checkGameOver();
    } else {
      // 不能连接，取消选中第一个，选中第二个
      document
        .querySelector(`.ll-tile[data-row="${firstTile.row}"][data-col="${firstTile.col}"]`)
        .classList.remove('selected');
      gameState.selectedTile = { row, col };
      tile.classList.add('selected');
    }
  }

  // 查找连接路径
  function findConnectionPath(first, second) {
    // 检查直接连接（0个拐角）
    if (canConnectDirectly(first, second)) {
      return [first, second];
    }

    // 检查一个拐角连接
    const oneCornerPath = findOneCornerPath(first, second);
    if (oneCornerPath) {
      return oneCornerPath;
    }

    // 检查两个拐角连接
    const twoCornerPath = findTwoCornerPath(first, second);
    if (twoCornerPath) {
      return twoCornerPath;
    }

    return null;
  }

  // 检查直接连接
  function canConnectDirectly(first, second) {
    // 同一行
    if (first.row === second.row) {
      const minCol = Math.min(first.col, second.col);
      const maxCol = Math.max(first.col, second.col);

      for (let col = minCol + 1; col < maxCol; col++) {
        if (!gameState.board[first.row][col].removed) {
          return false;
        }
      }
      return true;
    }

    // 同一列
    if (first.col === second.col) {
      const minRow = Math.min(first.row, second.row);
      const maxRow = Math.max(first.row, second.row);

      for (let row = minRow + 1; row < maxRow; row++) {
        if (!gameState.board[row][first.col].removed) {
          return false;
        }
      }
      return true;
    }

    return false;
  }

  // 查找一个拐角路径
  function findOneCornerPath(first, second) {
    // 检查可能的拐点
    const corner1 = { row: first.row, col: second.col };
    const corner2 = { row: second.row, col: first.col };

    // 检查拐点1
    if (isPositionValid(corner1) && gameState.board[corner1.row][corner1.col].removed) {
      if (canConnectDirectly(first, corner1) && canConnectDirectly(corner1, second)) {
        return [first, corner1, second];
      }
    }

    // 检查拐点2
    if (isPositionValid(corner2) && gameState.board[corner2.row][corner2.col].removed) {
      if (canConnectDirectly(first, corner2) && canConnectDirectly(corner2, second)) {
        return [first, corner2, second];
      }
    }

    return null;
  }

  // 查找两个拐角路径
  function findTwoCornerPath(first, second) {
    // 检查水平方向的两个拐角
    for (let col = 0; col < config.cols; col++) {
      if (col === first.col || col === second.col) continue;

      const corner1 = { row: first.row, col: col };
      const corner2 = { row: second.row, col: col };

      if (
        isPositionValid(corner1) &&
        isPositionValid(corner2) &&
        gameState.board[corner1.row][corner1.col].removed &&
        gameState.board[corner2.row][corner2.col].removed &&
        canConnectDirectly(first, corner1) &&
        canConnectDirectly(corner1, corner2) &&
        canConnectDirectly(corner2, second)
      ) {
        return [first, corner1, corner2, second];
      }
    }

    // 检查垂直方向的两个拐角
    for (let row = 0; row < config.rows; row++) {
      if (row === first.row || row === second.row) continue;

      const corner1 = { row: row, col: first.col };
      const corner2 = { row: row, col: second.col };

      if (
        isPositionValid(corner1) &&
        isPositionValid(corner2) &&
        gameState.board[corner1.row][corner1.col].removed &&
        gameState.board[corner2.row][corner2.col].removed &&
        canConnectDirectly(first, corner1) &&
        canConnectDirectly(corner1, corner2) &&
        canConnectDirectly(corner2, second)
      ) {
        return [first, corner1, corner2, second];
      }
    }

    return null;
  }

  // 检查位置是否有效
  function isPositionValid(pos) {
    return pos.row >= 0 && pos.row < config.rows && pos.col >= 0 && pos.col < config.cols;
  }

  // 消除方块
  function removeTiles(first, second, path) {
    const firstTile = document.querySelector(
      `.ll-tile[data-row="${first.row}"][data-col="${first.col}"]`,
    );
    const secondTile = document.querySelector(
      `.ll-tile[data-row="${second.row}"][data-col="${second.col}"]`,
    );

    // 标记为已消除
    firstTile.classList.add('removed');
    secondTile.classList.add('removed');
    gameState.board[first.row][first.col].removed = true;
    gameState.board[second.row][second.col].removed = true;
    gameState.removedCount += 2;

    // 重置选中状态
    gameState.selectedTile = null;

    // 检查是否还有可消除的方块对
    setTimeout(() => {
      if (!hasValidMove() && gameState.removedCount < config.rows * config.cols) {
        // 如果没有可消除的方块对且游戏尚未结束，自动重排
        reshuffleBoard();
      }
    }, 100); // 延迟一小段时间，确保DOM更新完成
  }

  // 检查游戏是否结束
  function checkGameOver() {
    if (gameState.removedCount >= config.rows * config.cols) {
      gameState.isGameOver = true;
      clearInterval(gameState.timer);

      // 检查是否是最高难度
      const currentIndex = difficultyOrder.indexOf(gameState.currentDifficulty);
      const isHighestDifficulty = currentIndex === difficultyOrder.length - 1;

      // 格式化用时
      const elapsedTime = config.timeLimit - gameState.timeLeft;
      const minutes = Math.floor(elapsedTime / 60);
      const seconds = elapsedTime % 60;
      const timeString = `${minutes}分${seconds}秒`;

      if (isHighestDifficulty) {
        // 最高难度 - 提示再来一局
        gameOverTitle.textContent = '🎉恭喜你完成了最高难度！';
        gameOverText.textContent = `得分：${gameState.score}，用时：${timeString}`;
        gameOverConfirmBtn.textContent = '再来一局';
      } else {
        // 不是最高难度 - 提示挑战下一难度
        const nextDifficulty = difficultyOrder[currentIndex + 1];
        gameOverTitle.textContent = `🎉恭喜你完成了${getDifficultyName(gameState.currentDifficulty)}难度！`;
        gameOverText.textContent = `得分：${gameState.score}，用时：${timeString}`;
        gameOverConfirmBtn.textContent = `挑战${getDifficultyName(nextDifficulty)}难度`;
      }

      gameOverDialog.style.display = 'block';
      llContainer.classList.add('project-mask');
    }
  }

  // 获取难度名称
  function getDifficultyName(difficulty) {
    const names = {
      easy: '简单',
      medium: '中等',
      hard: '困难',
    };
    return names[difficulty];
  }

  // 工具函数：打乱数组
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // 获取方块符号
  function getTileSymbol(type) {
    const symbols = [
      '🍎',
      '🍌',
      '🍒',
      '🍇',
      '🍊',
      '🍓',
      '🍑',
      '🍍',
      '🥭',
      '🍐',
      '🥝',
      '🍋',
      '🍉',
      '🥥',
      '🍈',
      '🍏',
      '🐶',
      '🐱',
      '🐭',
      '🐹',
      '🐰',
      '🦊',
      '🐻',
      '🐼',
      '🐨',
      '🐯',
      '🦁',
      '🐮',
      '🐷',
      '🐸',
      '🐵',
      '🐔',
      '🐧',
      '🐦',
      '🐤',
      '🦆',
    ];
    return symbols[type % symbols.length];
  }

  // 获取方块颜色
  function getTileColor(type) {
    const lightColors = [
      '#FFCDD2', // 🍎 浅红色
      '#FFF9C4', // 🍌 浅黄色
      '#F8BBD0', // 🍒 浅粉色
      '#E1BEE7', // 🍇 浅紫色
      '#FFE0B2', // 🍊 浅橙色
      '#FFCCBC', // 🍓 浅珊瑚色
      '#FFECB3', // 🍑 浅桃色
      '#F0F4C3', // 🍍 浅黄绿色
      '#C8E6C9', // 🥭 浅绿色
      '#DCEDC8', // 🍐 浅青绿色
      '#B2EBF2', // 🥝 浅青色
      '#FFECB3', // 🍋 浅柠檬黄
      '#B3E5FC', // 🍉 浅蓝色
      '#D7CCC8', // 🥥 浅棕色
      '#C5CAE9', // 🍈 浅靛蓝色
      '#E8F5E8', // 🍏 浅苹果绿
      '#FFEBEE', // 🐶 浅粉色
      '#FFF3E0', // 🐱 浅橙色
      '#F5F5F5', // 🐭 浅灰色
      '#FFF9C4', // 🐹 浅黄色
      '#E8F5E9', // 🐰 浅绿色
      '#FFF3E0', // 🦊 浅橙色
      '#F5F5F5', // 🐻 浅灰色
      '#E0F2F1', // 🐼 浅青色
      '#FFFDE7', // 🐨 浅黄色
      '#FFF3E0', // 🐯 浅橙色
      '#FFF9C4', // 🦁 浅黄色
      '#F5F5F5', // 🐮 浅灰色
      '#FFEBEE', // 🐷 浅粉色
      '#E8F5E9', // 🐸 浅绿色
      '#FFF3E0', // 🐵 浅橙色
      '#FFF9C4', // 🐔 浅黄色
      '#E0F2F1', // 🐧 浅青色
      '#E3F2FD', // 🐦 浅蓝色
      '#FFF9C4', // 🐤 浅黄色
      '#E0F2F1', // 🦆 浅青色
    ];
    return lightColors[type % lightColors.length];
  }

  // 提示功能
  hintBtn.addEventListener('click', function () {
    if (gameState.isGameOver) return;

    const pair = findValidPairs(false);
    if (pair) {
      // 高亮显示这对方块
      const tile1 = document.querySelector(
        `.ll-tile[data-row="${pair.first.row}"][data-col="${pair.first.col}"]`,
      );
      const tile2 = document.querySelector(
        `.ll-tile[data-row="${pair.second.row}"][data-col="${pair.second.col}"]`,
      );

      // 添加闪烁光晕效果
      tile1.classList.add('hint-glow');
      tile2.classList.add('hint-glow');

      setTimeout(() => {
        tile1.classList.remove('hint-glow');
        tile2.classList.remove('hint-glow');
      }, 3000);
    } else {
      // 如果没有找到可消除的方块对，自动重排
      reshuffleBoard();
    }
  });

  // 检查是否有可消除的方块对
  function hasValidMove() {
    return findValidPairs(false) !== null;
  }

  // 查找可消除的方块对
  function findValidPairs(findAll = false) {
    const validPairs = [];

    for (let i = 0; i < config.rows; i++) {
      for (let j = 0; j < config.cols; j++) {
        if (gameState.board[i][j].removed) continue;

        for (let k = i; k < config.rows; k++) {
          let lStart = k === i ? j + 1 : 0;
          for (let l = lStart; l < config.cols; l++) {
            if (gameState.board[k][l].removed) continue;

            if (gameState.board[i][j].type === gameState.board[k][l].type) {
              const first = { row: i, col: j };
              const second = { row: k, col: l };
              const path = findConnectionPath(first, second);

              if (path) {
                if (!findAll) {
                  // 如果只需要找到第一对，直接返回
                  return { first, second };
                } else {
                  // 如果需要找到所有对，添加到数组
                  validPairs.push({ first, second });
                }
              }
            }
          }
        }
      }
    }

    return findAll ? validPairs : null;
  }

  // 重排
  function reshuffleBoard() {
    if (gameState.isGameOver) return;

    // 收集所有未被消除的方块
    let remainingTiles = [];
    for (let row = 0; row < config.rows; row++) {
      for (let col = 0; col < config.cols; col++) {
        if (!gameState.board[row][col].removed) {
          remainingTiles.push(gameState.board[row][col].type);
        }
      }
    }

    // 随机打乱剩余方块
    shuffleArray(remainingTiles);

    // 重新分配方块到棋盘
    let index = 0;
    for (let row = 0; row < config.rows; row++) {
      for (let col = 0; col < config.cols; col++) {
        if (!gameState.board[row][col].removed) {
          gameState.board[row][col].type = remainingTiles[index];
          const tile = document.querySelector(`.ll-tile[data-row="${row}"][data-col="${col}"]`);
          tile.textContent = getTileSymbol(remainingTiles[index]);
          tile.style.backgroundColor = getTileColor(remainingTiles[index]);
          index++;
        }
      }
    }

    // 检查是否还有可消除的方块对
    if (!hasValidMove()) {
      // 如果重排后仍然没有可消除的方块，再次重排
      reshuffleBoard();
    }
  }

  // 暂停功能
  pauseBtn.addEventListener('click', function () {
    if (gameState.isGameOver) return;

    // 暂停游戏
    gameState.isPaused = true;
    clearInterval(gameState.timer);

    // 显示暂停消息
    gamePauseDialog.style.display = 'block';
    llContainer.classList.add('project-mask');
  });

  // 继续按钮事件
  resumeBtn.addEventListener('click', function () {
    gameState.isPaused = false;
    gamePauseDialog.style.display = 'none';
    llContainer.classList.remove('project-mask');
    startTimer();
  });

  // 重排按钮事件监听
  reshuffleBtn.addEventListener('click', reshuffleBoard);

  // 重新开始游戏
  restartBtn.addEventListener('click', initGame);

  // 开始新游戏按钮事件监听
  gameOverConfirmBtn.addEventListener('click', function () {
    gameOverDialog.style.display = 'none';
    llContainer.classList.remove('project-mask');

    // 检查是否是游戏完成的消息
    if (gameState.removedCount >= config.rows * config.cols) {
      const currentIndex = difficultyOrder.indexOf(gameState.currentDifficulty);
      const isHighestDifficulty = currentIndex === difficultyOrder.length - 1;

      if (isHighestDifficulty) {
        // 最高难度 - 重新开始当前难度
        initGame();
      } else {
        // 不是最高难度 - 切换到下一难度
        const nextDifficulty = difficultyOrder[currentIndex + 1];
        gameState.currentDifficulty = nextDifficulty;
        config = { ...difficultySettings[nextDifficulty] };
        difficultySelect.value = nextDifficulty;
        difficultySelect.dispatchEvent(new Event('change'));
        initGame();
      }
    }
  });

  // 初始化游戏
  initGame();
})();
