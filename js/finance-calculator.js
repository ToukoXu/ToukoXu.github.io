(() => {
  // 移除文章容器的 ID 以避免样式冲突
  const articleContainer = document.getElementById('article-container');
  articleContainer.id = '';

  // 元素引用
  const tabs = document.querySelectorAll('#fc-container .project-tab');
  const contents = document.querySelectorAll('#fc-container .project-tab-content');
  // Tab1
  const principal1 = document.getElementById('fc-principal1'); // 本金
  const days1 = document.getElementById('fc-days1'); // 投资天数
  const startDate1 = document.getElementById('fc-start-date1'); // 起始日期
  const endDate1 = document.getElementById('fc-end-date1'); // 终止日期
  const interest1 = document.getElementById('fc-interest1'); // 利息
  const calculate1 = document.getElementById('fc-calculate1'); // 计算按钮
  const reset1 = document.getElementById('fc-reset1'); // 清空按钮
  const result1 = document.getElementById('fc-result1'); // 结果容器
  const resultValue1 = document.getElementById('fc-result-value1'); // 收益率结果
  const evaluation1 = document.getElementById('fc-evaluation1'); // 收益率评价
  // Tab2
  const startDate2 = document.getElementById('fc-start-date2'); //  起始日期
  const startValue2 = document.getElementById('fc-start-value2'); // 起始净值
  const endDate2 = document.getElementById('fc-end-date2'); // 终止日期
  const endValue2 = document.getElementById('fc-end-value2'); // 终止净值
  const calculate2 = document.getElementById('fc-calculate2'); // 计算按钮
  const reset2 = document.getElementById('fc-reset2'); // 清空按钮
  const result2 = document.getElementById('fc-result2'); // 结果容器
  const resultValue2 = document.getElementById('fc-result-value2'); // 收益率结果
  const evaluation2 = document.getElementById('fc-evaluation2'); // 收益率评价
  // Tab3
  const principal3 = document.getElementById('fc-principal3'); // 本金
  const period3 = document.getElementById('fc-period3'); // 期限
  const rate3 = document.getElementById('fc-rate3'); // 年利率
  const calculate3 = document.getElementById('fc-calculate3'); // 计算按钮
  const reset3 = document.getElementById('fc-reset3'); // 清空按钮
  const result3 = document.getElementById('fc-result3'); // 结果容器
  const resultValue3 = document.getElementById('fc-result-value3'); // 利息结果
  const resultDesc3 = document.getElementById('fc-result-desc3'); // 利息结果描述

  // 选项卡切换
  tabs.forEach((tab) => {
    tab.addEventListener('click', function () {
      const tabId = tab.getAttribute('data-tab');

      // 更新活动选项卡
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      // 更新活动内容
      contents.forEach((content) => {
        content.classList.remove('active');
        if (content.id === tabId) {
          content.classList.add('active');
        }
      });
    });
  });

  // 键盘：允许数字、退格、删除、Tab、方向键等
  function numberKeydown(e) {
    if (
      (e.key >= '0' && e.key <= '9') ||
      e.key === 'Backspace' ||
      e.key === 'Delete' ||
      e.key === 'Tab' ||
      e.key === 'ArrowLeft' ||
      e.key === 'ArrowRight' ||
      e.key === 'Home' ||
      e.key === 'End'
    ) {
      return true;
    }

    // 阻止其他按键
    e.preventDefault();
    return false;
  }

  // 粘贴：防止粘贴非数字内容
  function numberPaste(e) {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData('text');
    const numbers = text.replace(/[^0-9]/g, '');
    document.execCommand('insertText', false, numbers);
  }

  // Tab1: 天数只保留数字字符
  days1.onkeydown = numberKeydown;
  days1.onpaste = numberPaste;

  // Tab1: 天数变化时清空日期
  days1.onchange = resetDateInputs1;
  function resetDateInputs1() {
    startDate1.value = '';
    endDate1.value = '';
    startDate1.type = 'text';
    endDate1.type = 'text';
  }

  // Tab1: 日期变化时计算天数
  startDate1.onchange = calculateDays1;
  endDate1.onchange = calculateDays1;
  function calculateDays1() {
    const startDate = new Date(startDate1.value);
    const endDate = new Date(endDate1.value);

    if (startDate && endDate && startDate <= endDate) {
      const timeDiff = endDate.getTime() - startDate.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      days1.value = daysDiff;
    }
  }

  // Tab1: 计算年化收益率
  calculate1.onclick = (e) => {
    e.preventDefault();
    const principal = parseFloat(principal1.value);
    const days = parseFloat(days1.value);
    const interest = parseFloat(interest1.value);

    if (!principal || principal <= 0) {
      alert('本金必须大于零');
      return;
    }

    if (!days || days <= 0) {
      alert('投资天数必须大于零');
      return;
    }

    if (isNaN(interest)) {
      alert('请输入利息');
      return;
    }

    // 计算年化收益率
    const annualizedReturn = (interest / principal) * (365 / days) * 100;

    // 显示结果
    resultValue1.textContent = annualizedReturn.toFixed(2) + '%';
    result1.style.display = 'block';

    // 评价收益率
    evaluateReturn(annualizedReturn, evaluation1);
  };

  // Tab2: 计算年化收益率
  calculate2.onclick = (e) => {
    e.preventDefault();
    const startDate = new Date(startDate2.value);
    const startDateTime = startDate.getTime();
    const endDate = new Date(endDate2.value);
    const endDateTime = endDate.getTime();
    const startValue = parseFloat(startValue2.value);
    const endValue = parseFloat(endValue2.value);

    if (isNaN(startDateTime)) {
      alert('请输入有效的起始日期');
      return;
    }

    if (isNaN(startValue) || startValue <= 0) {
      alert('起始净值必须大于零');
      return;
    }

    if (isNaN(endDateTime)) {
      alert('请输入有效的终止日期');
      return;
    }

    if (isNaN(endValue) || endValue < 0) {
      alert('终止净值必须大于或等于零');
      return;
    }

    if (startDateTime >= endDateTime) {
      alert('终止日期必须晚于起始日期');
      return;
    }

    // 计算天数
    const timeDiff = endDateTime - startDateTime;
    const days = Math.ceil(timeDiff / (1000 * 3600 * 24));

    // 计算年化收益率
    const totalReturn = (endValue - startValue) / startValue;
    const annualizedReturn = (Math.pow(1 + totalReturn, 365 / days) - 1) * 100;

    // 显示结果
    resultValue2.textContent = annualizedReturn.toFixed(2) + '%';
    result2.style.display = 'block';

    // 评价收益率
    evaluateReturn(annualizedReturn, evaluation2);
  };

  // Tab3: 投资期限只保留数字字符
  period3.onkeydown = numberKeydown;
  period3.onpaste = numberPaste;

  // Tab3: 计算利息
  calculate3.onclick = (e) => {
    e.preventDefault();
    const principal = parseFloat(principal3.value);
    const period = parseFloat(period3.value);
    const rate = parseFloat(rate3.value);
    const unit = document.querySelector('input[name="period-unit"]:checked').value || 'day';

    if (!principal || principal <= 0) {
      alert('本金必须大于零');
      return;
    }

    if (!period || period <= 0) {
      alert('投资期限必须大于零');
      return;
    }

    if (isNaN(rate)) {
      alert('请输入年化收益率');
      return;
    }

    // 转换为天数
    let days;
    switch (unit) {
      case 'day':
        days = period;
        break;
      case 'month':
        days = period * 30; // 近似值
        break;
      case 'year':
        days = period * 365; // 近似值
        break;
    }

    // 计算利息
    const interest = principal * (rate / 100) * (days / 365);

    // 显示结果
    resultValue3.textContent = interest.toFixed(2);
    resultDesc3.textContent = `基于 ${days} 天投资期限计算`;
    result3.style.display = 'block';
  };

  // 收益率评价函数
  function evaluateReturn(returnRate, element) {
    let evaluation = '';
    let className = '';

    if (returnRate >= 30) {
      evaluation = '🚀 超凡表现！您的投资回报远超市场平均水平，堪称投资大师！';
      className = 'excellent';
    } else if (returnRate >= 20) {
      evaluation = '🎉 非常出色！您的投资回报远高于市场平均水平，表现卓越！';
      className = 'excellent';
    } else if (returnRate >= 15) {
      evaluation = '🌟 优秀！您的投资回报显著高于市场平均水平，投资眼光独到！';
      className = 'excellent';
    } else if (returnRate >= 12) {
      evaluation = '👍 良好！您的投资回报高于市场平均水平，投资策略有效！';
      className = 'good';
    } else if (returnRate >= 8) {
      evaluation = '✅ 不错！您的投资回报与市场平均水平相当，表现稳定！';
      className = 'good';
    } else if (returnRate >= 5) {
      evaluation = '📊 尚可！您的投资回报略低于市场平均水平，有提升空间！';
      className = 'average';
    } else if (returnRate >= 2) {
      evaluation = '😐 一般！您的投资回报较低，建议优化投资组合！';
      className = 'average';
    } else if (returnRate >= 0) {
      evaluation = '📉 较低！您的投资回报不理想，需要重新评估投资策略！';
      className = 'poor';
    } else if (returnRate >= -5) {
      evaluation = '⚠️ 亏损！您的投资出现小幅亏损，建议及时调整！';
      className = 'poor';
    } else if (returnRate >= -10) {
      evaluation = '💸 明显亏损！您的投资出现较大亏损，需要认真分析原因！';
      className = 'poor';
    } else {
      evaluation = '🔥 严重亏损！您的投资出现重大亏损，建议寻求专业帮助！';
      className = 'poor';
    }

    if (element) {
      element.textContent = evaluation;
      element.className = 'fc-evaluation ' + className;
    }

    return { evaluation, className };
  }

  // 重置功能
  reset1.onclick = (e) => {
    e.preventDefault();
    principal1.value = '';
    days1.value = '';
    resetDateInputs1();
    interest1.value = '';
    result1.style.display = 'none';
  };

  reset2.onclick = (e) => {
    e.preventDefault();
    startDate2.value = '';
    endDate2.value = '';
    startDate2.type = 'text';
    endDate2.type = 'text';
    startValue2.value = '';
    endValue2.value = '';
    result2.style.display = 'none';
  };

  reset3.onclick = (e) => {
    e.preventDefault();
    principal3.value = '';
    period3.value = '';
    rate3.value = '';
    result3.style.display = 'none';
  };
})();
