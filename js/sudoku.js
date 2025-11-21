(() => {
  // 移除文章容器的 ID 以避免样式冲突
  const articleContainer = document.getElementById('article-container');
  articleContainer.id = '';

  // 难度顺序
  const difficultyOrder = ['easy', 'medium', 'hard', 'expert'];

  // 游戏状态
  let gameState = {
    board: [], // { given, value, correctValue, candidates, error }
    selectedIndex: null,
    currentDifficulty: difficultyOrder[0],
    history: [], // 存储历史状态
    currentStep: -1, // 当前所在的历史步骤索引
  };

  // DOM 元素
  const difficultySelectBtns = document.querySelectorAll('#sudoku-difficulty .project-select-btn');
  const sudokuContainer = document.getElementById('sudoku-container');
  const sudokuBoard = document.getElementById('sudoku-board');
  const mainNumbers = document.getElementById('sudoku-main-numbers');
  const candidateNumbers = document.getElementById('sudoku-candidate-numbers');
  const newGameBtn = document.getElementById('sudoku-new-game-btn');
  const gameOverDialog = document.getElementById('sudoku-game-over-dialog');
  const gameOverTitle = document.getElementById('sudoku-game-over-title');
  const gameOverConfirmBtn = document.getElementById('sudoku-game-over-confirm-btn');
  const undoBtn = document.getElementById('sudoku-undo-btn');
  const redoBtn = document.getElementById('sudoku-redo-btn');
  const deleteBtn = document.getElementById('sudoku-delete-btn');
  const resetBtn = document.getElementById('sudoku-reset-btn');
  const resetDialog = document.getElementById('sudoku-reset-dialog');
  const resetConfirmBtn = document.getElementById('sudoku-reset-confirm-btn');
  const resetCancelBtn = document.getElementById('sudoku-reset-cancel-btn');

  // 难度选择事件
  difficultySelectBtns.forEach((btn) => {
    btn.addEventListener('click', function () {
      difficultySelectBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      gameState.currentDifficulty = btn.getAttribute('data-difficulty'); // 更新当前难度

      // 生成新游戏
      generateNewGame();
    });
  });

  // 新游戏按钮点击事件
  newGameBtn.addEventListener('click', generateNewGame);

  // 撤销/重做按钮点击事件
  undoBtn.addEventListener('click', undo);
  redoBtn.addEventListener('click', redo);

  // 删除按钮点击事件
  deleteBtn.addEventListener('click', deleteCell);

  // 重置按钮点击事件
  resetBtn.addEventListener('click', openResetGameDialog);
  // 确定重置按钮点击事件
  resetConfirmBtn.addEventListener('click', resetGame);
  // 取消重置按钮点击事件
  resetCancelBtn.addEventListener('click', closeResetGameDialog);

  // 删除格子的元素
  function deleteCell() {
    if (gameState.selectedIndex === null) return;

    const selectedCell = document.querySelector(
      `.sudoku-cell[data-index="${gameState.selectedIndex}"]`,
    );

    // 如果选中的格子是预设的，则不能删除
    if (gameState.board[gameState.selectedIndex].given) return;

    // 清空主数字和候选数字
    gameState.board[gameState.selectedIndex].value = '';
    gameState.board[gameState.selectedIndex].candidates = [];
    selectedCell.dataset.value = '';
    selectedCell.innerHTML = '';

    // 获取相关格子索引
    const { sameRowIndices, sameColIndices, sameBoxIndices } = getRelatedIndices(
      gameState.selectedIndex,
      true,
    );

    // 检查错误状态
    checkError(sameRowIndices);
    checkError(sameColIndices);
    checkError(sameBoxIndices);

    // 保存状态
    saveState();
  }

  // 打开重置弹窗
  function openResetGameDialog() {
    resetDialog.style.display = 'block';
    sudokuContainer.classList.add('project-mask');
  }

  // 重置游戏
  function resetGame() {
    const currentState = gameState.history[gameState.currentStep];
    const initState = gameState.history[0];
    gameState.history = [JSON.parse(JSON.stringify(initState))]; // 深拷贝初始状态
    gameState.currentStep = 0;
    // 恢复棋盘状态
    restoreBoardState(currentState, initState);
    // 关闭重置弹窗
    closeResetGameDialog();
  }

  // 关闭重置弹窗
  function closeResetGameDialog() {
    resetDialog.style.display = 'none';
    sudokuContainer.classList.remove('project-mask');
  }

  // 初始化游戏
  function initGame() {
    // 创建数独棋盘
    createSudokuBoard();

    // 生成新游戏
    generateNewGame();
  }

  // 创建数独棋盘
  function createSudokuBoard() {
    sudokuBoard.innerHTML = '';

    let index = 0;
    for (let row = 1; row <= 9; row++) {
      for (let col = 1; col <= 9; col++) {
        const cell = document.createElement('div');
        cell.className = 'sudoku-cell';
        cell.dataset.index = index;

        // 添加粗边框
        if (col === 3 || col === 6) {
          cell.classList.add('sudoku-border-right-thick');
        }
        if (row === 3 || row === 6) {
          cell.classList.add('sudoku-border-bottom-thick');
        }

        sudokuBoard.appendChild(cell);
        index++;
      }
    }
  }

  // 生成新游戏
  function generateNewGame() {
    // 清除高亮
    clearHighlights();

    // 根据难度生成数独
    const currentDifficulty = gameState.currentDifficulty;
    const sudoku = getSudoku(currentDifficulty);
    const puzzle = sudoku.puzzle;
    const solution = sudoku.solution;

    let board = [];
    for (let index = 0; index < puzzle.length; index++) {
      // 生成新的面板数据
      const value = puzzle.charAt(index);
      const given = value !== '-';
      board[index] = {
        given,
        value: given ? value : '',
        correctValue: solution[index],
        candidates: [],
        error: false,
      };

      // 更新格子UI
      const cell = document.querySelector(`.sudoku-cell[data-index="${index}"]`);
      cell.dataset.value = board[index].value;
      cell.textContent = board[index].value;
      cell.classList.toggle('given', given);
    }

    // 更新游戏状态
    gameState = {
      board,
      selectedIndex: null,
      currentDifficulty,
      history: [],
      currentStep: -1,
    };

    // 保存初始状态到历史
    saveState();
  }

  // 处理格子点击事件
  sudokuBoard.addEventListener('click', (e) => {
    const cell = e.target?.closest('.sudoku-cell');
    if (cell) {
      // 如果点击的是已选中的格子，忽略
      if (gameState.selectedIndex == Number(cell.dataset.index)) return;

      // 清除之前的高亮，保留错误状态
      clearHighlights(false, true);

      // 设置游戏状态
      if (!gameState.board[Number(cell.dataset.index)].given) {
        // 非预设格子
        gameState.selectedIndex = Number(cell.dataset.index);
      } else {
        gameState.selectedIndex = null;
      }

      // 根据游戏状态更新UI
      updateUIByGameState();
    }
  });

  // 清除高亮
  function clearHighlights(keepSelected, keepError) {
    const cells = document.querySelectorAll('.sudoku-cell');
    cells.forEach((cell) => {
      if (!keepSelected) cell.classList.remove('selected');
      if (!keepError) cell.classList.remove('error');
      cell.classList.remove('highlighted');
    });
    const candidateCells = document.querySelectorAll('.sudoku-candidate-cell');
    candidateCells.forEach((cell) => cell.classList.remove('highlighted'));
  }

  // 高亮相同数字的格子
  function highlightSameValues(value) {
    const sameValueCells = document.querySelectorAll(`.sudoku-cell[data-value="${value}"]`);
    sameValueCells.forEach((cell) => cell.classList.add('highlighted'));
    const sameValueCandidateCells = document.querySelectorAll(
      `.sudoku-candidate-cell[data-value="${value}"]`,
    );
    sameValueCandidateCells.forEach((cell) => cell.classList.add('highlighted'));
  }

  // 获取相关的index（同一行、同一列、同一3x3区域）
  function getRelatedIndices(index, isFull) {
    const row = Math.floor(index / 9);
    const col = index % 9;

    // 相同行的格子
    const sameRowIndices = [];
    for (let i = 0; i < 9; i++) {
      sameRowIndices.push(row * 9 + i);
    }

    // 相同列的格子
    const sameColIndices = [];
    for (let i = 0; i < 9; i++) {
      sameColIndices.push(i * 9 + col);
    }

    // 相同 3x3 区域的格子
    const boxRowStart = Math.floor(row / 3) * 3;
    const boxColStart = Math.floor(col / 3) * 3;
    const sameBoxIndices = [];
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        sameBoxIndices.push((boxRowStart + i) * 9 + (boxColStart + j));
      }
    }

    if (isFull) return { sameRowIndices, sameColIndices, sameBoxIndices };
    return Array.from(new Set([...sameRowIndices, ...sameColIndices, ...sameBoxIndices]));
  }

  // 高亮相关的格子（同一行、同一列、同一3x3区域）
  function highlightRelatedValues(relatedIndices) {
    relatedIndices.forEach((index) => {
      const cell = document.querySelector(`.sudoku-cell[data-index="${index}"]`);
      cell.classList.add('highlighted');
    });
  }

  // 查找某个格子不可能是什么值
  function getImpossibleValues(relatedIndices) {
    const relatedValues = [];
    relatedIndices.forEach((i) => {
      if (gameState.board[i].value) {
        relatedValues.push(gameState.board[i].value);
      }
    });

    return Array.from(new Set(relatedValues));
  }

  // 更新数字按钮的UI
  function updateNumberBtnsUI(impossibleValues) {
    const numberBtns = document.querySelectorAll('[data-number]');
    numberBtns.forEach((btn) => {
      btn.classList.toggle('opacity', impossibleValues.includes(btn.dataset.number));
    });
  }

  // 主数字按钮点击事件
  mainNumbers.addEventListener('click', (e) => {
    const numberBtn = e.target?.closest('[data-number]');
    if (numberBtn) {
      handleNumberClick(numberBtn.dataset.number, 'main');
    }
  });

  // 候选数字按钮点击事件
  candidateNumbers.addEventListener('click', (e) => {
    const numberBtn = e.target?.closest('[data-number]');
    if (numberBtn) {
      handleNumberClick(numberBtn.dataset.number, 'candidate');
    }
  });

  // 处理数字点击
  function handleNumberClick(number, type) {
    if (gameState.selectedIndex === null) {
      // 清除高亮，保留选中状态
      clearHighlights(true, true);
      // 如果没有选中的格子，或选中的是预设的格子，高亮相同数字的格子
      highlightSameValues(number);
      return;
    }

    const selectedCell = document.querySelector(
      `.sudoku-cell[data-index="${gameState.selectedIndex}"]`,
    );

    // 获取相关格子
    const { sameRowIndices, sameColIndices, sameBoxIndices } = getRelatedIndices(
      gameState.selectedIndex,
      true,
    );
    const relatedIndices = Array.from(
      new Set([...sameRowIndices, ...sameColIndices, ...sameBoxIndices]),
    );

    if (type === 'main') {
      // 清除高亮，保留选中状态
      clearHighlights(true, true);

      // 清空选中格子的候选数字
      gameState.board[gameState.selectedIndex].candidates = [];

      // 填入主数字
      gameState.board[gameState.selectedIndex].value = number;
      selectedCell.textContent = number;
      selectedCell.dataset.value = number;

      // 检查游戏完成状态
      if (
        gameState.board.filter((item) => item.value).length === 81 &&
        gameState.board.filter((item) => item.error).length === 0
      ) {
        // 检查是否是最高难度
        const currentIndex = difficultyOrder.indexOf(gameState.currentDifficulty);
        const isHighestDifficulty = currentIndex === difficultyOrder.length - 1;

        if (isHighestDifficulty) {
          // 最高难度 - 提示再来一局
          gameOverTitle.textContent = '🎉恭喜你完成了最高难度！';
          gameOverConfirmBtn.textContent = '再来一局';
        } else {
          // 不是最高难度 - 提示挑战下一难度
          const nextDifficulty = difficultyOrder[currentIndex + 1];
          gameOverTitle.textContent = `🎉恭喜你完成了${getDifficultyName(gameState.currentDifficulty)}难度！`;
          gameOverConfirmBtn.textContent = `挑战${getDifficultyName(nextDifficulty)}难度`;
        }

        gameOverDialog.style.display = 'block';
        sudokuContainer.classList.add('project-mask');
        return;
      }

      // 清除相关格子的重复候选数字
      relatedIndices.forEach((index) => {
        if (gameState.board[index].given) return;
        // 修改候选数字UI
        const cell = document.querySelector(`.sudoku-cell[data-index="${index}"]`);
        const oldCandidates = gameState.board[index].candidates;
        gameState.board[index].candidates = oldCandidates.filter((item) => item != number);
        if (oldCandidates.length !== gameState.board[index].candidates.length) {
          // 更新候选数字的显示
          updateCandidatesDisplay(cell, gameState.board[index].candidates);
        }
      });
    } else {
      // 清空选中格子的主数字
      gameState.board[gameState.selectedIndex].value = '';
      selectedCell.dataset.value = '';

      // 添加/移除候选数字
      const index = gameState.board[gameState.selectedIndex].candidates.indexOf(number);
      if (index === -1) {
        // 添加候选数字
        gameState.board[gameState.selectedIndex].candidates.push(number);
        gameState.board[gameState.selectedIndex].candidates.sort((a, b) => a - b);
      } else {
        // 移除候选数字
        gameState.board[gameState.selectedIndex].candidates.splice(index, 1);
      }
      // 更新候选数字显示
      updateCandidatesDisplay(selectedCell, gameState.board[gameState.selectedIndex].candidates);
    }

    // 检查相关格子的错误
    checkError(sameRowIndices);
    checkError(sameColIndices);
    checkError(sameBoxIndices);

    // 保存游戏状态
    saveState();
  }

  // 检查错误
  function checkError(relatedIndices) {
    const valueCount = {};

    // 统计每个值出现的次数
    relatedIndices.forEach((index) => {
      const value = gameState.board[index].value;
      if (value) {
        valueCount[value] = (valueCount[value] || 0) + 1;
      }
    });

    // 标记错误
    relatedIndices.forEach((index) => {
      const value = gameState.board[index].value;
      if (value && valueCount[value] > 1) {
        gameState.board[index].error = true;
      } else {
        gameState.board[index].error = false;
      }
    });
  }

  // 更新格子的错误状态
  function updateErrorUI() {
    const cells = document.querySelectorAll('.sudoku-cell');
    cells.forEach((cell) => {
      if (gameState.board[Number(cell.dataset.index)].error) {
        cell.classList.add('error');
      } else {
        cell.classList.remove('error');
      }
    });
  }

  // 更新候选数字显示
  function updateCandidatesDisplay(cell, candidates) {
    cell.innerHTML = '';

    // 创建1-9的候选数字
    for (let i = 1; i <= 9; i++) {
      const candidate = document.createElement('div');
      candidate.className = 'sudoku-candidate-cell';
      if (candidates.includes(i.toString())) {
        candidate.textContent = i;
        candidate.dataset.value = i;
      }
      cell.appendChild(candidate);
    }
  }

  // 开始新游戏按钮事件监听
  gameOverConfirmBtn.addEventListener('click', function () {
    gameOverDialog.style.display = 'none';
    sudokuContainer.classList.remove('project-mask');

    const currentIndex = difficultyOrder.indexOf(gameState.currentDifficulty);
    const isHighestDifficulty = currentIndex === difficultyOrder.length - 1;

    if (isHighestDifficulty) {
      // 最高难度 - 重新开始当前难度
      generateNewGame();
    } else {
      // 不是最高难度 - 切换到下一难度
      const nextDifficulty = difficultyOrder[currentIndex + 1];
      setDifficulty(nextDifficulty);
    }
  });

  // 手动设置难度函数
  function setDifficulty(difficulty) {
    // 更新按钮激活状态
    difficultySelectBtns.forEach((btn) => {
      if (btn.getAttribute('data-difficulty') === difficulty) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // 更新游戏状态
    gameState.currentDifficulty = difficulty;

    // 重新开始游戏
    generateNewGame();
  }

  // 获取难度名称
  function getDifficultyName(difficulty) {
    const names = {
      easy: '简单',
      medium: '中等',
      hard: '困难',
      expert: '专家',
    };
    return names[difficulty];
  }

  // 保存当前状态到历史记录
  function saveState() {
    // 如果当前不是最新状态，删除后面的历史
    if (gameState.currentStep < gameState.history.length) {
      gameState.history = gameState.history.slice(0, gameState.currentStep + 1);
    }

    // 保存当前状态
    gameState.history.push({
      board: JSON.parse(JSON.stringify(gameState.board)),
      selectedIndex: gameState.selectedIndex,
    });
    gameState.currentStep++;

    // 更新按钮状态
    updateUIByGameState();
  }

  // 撤销操作
  function undo() {
    if (gameState.currentStep > 0) {
      const currentState = gameState.history[gameState.currentStep];
      gameState.currentStep--;
      const previousState = gameState.history[gameState.currentStep];
      restoreBoardState(currentState, previousState);
    }
  }

  // 重做操作
  function redo() {
    if (gameState.currentStep < gameState.history.length - 1) {
      const currentState = gameState.history[gameState.currentStep];
      gameState.currentStep++;
      const nextState = gameState.history[gameState.currentStep];
      restoreBoardState(currentState, nextState);
    }
  }

  // 恢复棋盘状态
  function restoreBoardState(currentState, state) {
    clearHighlights();

    // 更新游戏状态
    gameState.board = JSON.parse(JSON.stringify(state.board));
    gameState.selectedIndex = state.selectedIndex;

    currentState.board.forEach((b, index) => {
      const boardCellData = gameState.board[index];
      if (JSON.stringify(b) !== JSON.stringify(boardCellData)) {
        const cell = document.querySelector(`.sudoku-cell[data-index="${index}"]`);

        // 更新格子DOM
        if (boardCellData.value) {
          // 有主数字
          cell.dataset.value = boardCellData.value;
          cell.textContent = boardCellData.value;
        } else if (boardCellData.candidates.length > 0) {
          // 有候选数字
          cell.dataset.value = '';
          updateCandidatesDisplay(cell, boardCellData.candidates);
        } else {
          // 空格子
          cell.dataset.value = '';
          cell.innerHTML = '';
        }
      }
    });

    // 根据游戏状态更新UI
    updateUIByGameState();
  }

  // 根据游戏状态更新UI
  function updateUIByGameState() {
    // 有选中的格子且不是预设的格子
    if (gameState.selectedIndex !== null) {
      // 更新选中状态
      const cell = document.querySelector(`.sudoku-cell[data-index="${gameState.selectedIndex}"]`);
      cell.classList.add('selected');

      // 更新数独区域的高亮
      if (gameState.board[gameState.selectedIndex].value) {
        // 如果选中的格子有值，高亮相同数字的格子
        highlightSameValues(gameState.board[gameState.selectedIndex].value);
      } else {
        // 如果选中的格子没有值，高亮相关的格子
        highlightRelatedValues(getRelatedIndices(gameState.selectedIndex));
      }
    }

    // 更新格子的错误状态
    updateErrorUI();

    // 更新数字按钮的UI
    let impossibleValues =
      gameState.selectedIndex !== null
        ? getImpossibleValues(getRelatedIndices(gameState.selectedIndex))
        : [];
    updateNumberBtnsUI(impossibleValues);

    // 更新撤销/重做按钮状态
    updateUndoRedoButtonsUI();

    // 更新删除按钮状态
    updateDeleteButtonsUI();
  }

  // 更新撤销/重做按钮状态
  function updateUndoRedoButtonsUI() {
    // 更新撤销按钮状态
    undoBtn.disabled = gameState.currentStep <= 0;

    // 更新重做按钮状态
    redoBtn.disabled = gameState.currentStep >= gameState.history.length - 1;
  }

  // 更新删除按钮状态
  function updateDeleteButtonsUI() {
    deleteBtn.disabled =
      gameState.selectedIndex === null ||
      (!gameState.board[gameState.selectedIndex].value &&
        gameState.board[gameState.selectedIndex].candidates.length === 0);
  }

  // 初始化游戏
  initGame();
})();
