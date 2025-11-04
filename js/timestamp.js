(() => {
  // 更新当前时间信息
  function updateCurrentTime() {
    const now = new Date();
    const seconds = Math.floor(now.getTime() / 1000);
    const milliseconds = now.getTime();

    document.getElementById('ts-current-seconds').textContent = seconds;
    document.getElementById('ts-current-milliseconds').textContent = milliseconds;
    document.getElementById('ts-current-local').textContent = now.toLocaleString();
    document.getElementById('ts-current-utc').textContent = now.toUTCString();
  }

  // 初始更新
  updateCurrentTime();

  // 每秒更新一次当前时间
  setInterval(updateCurrentTime, 1000);

  // Tab切换功能
  document.querySelectorAll('.ts-tab').forEach((tab) => {
    tab.addEventListener('click', function () {
      const tabId = this.getAttribute('data-tab');

      // 更新活动选项卡
      document.querySelectorAll('.ts-tab').forEach((t) => t.classList.remove('active'));
      this.classList.add('active');

      // 更新活动内容
      document.querySelectorAll('.ts-tab-content').forEach((content) => {
        content.classList.remove('active');
        if (content.id === tabId) {
          content.classList.add('active');
        }
      });
    });
  });

  // 单位选择
  document.querySelectorAll('.ts-unit-option').forEach((option) => {
    option.addEventListener('click', function () {
      const parent = this.parentElement;
      parent.querySelectorAll('.ts-unit-option').forEach((opt) => {
        opt.classList.remove('active');
      });
      this.classList.add('active');
    });
  });

  // 格式化时间为指定时区
  function formatDateInTimezone(date, timezone) {
    if (timezone === 'UTC') {
      return date.toUTCString().replace('GMT', 'UTC');
    } else if (timezone === 'local') {
      return date.toLocaleString();
    } else {
      try {
        return date.toLocaleString('zh-CN', { timeZone: timezone, timeZoneName: 'short' });
      } catch (e) {
        // 如果时区无效，回退到本地时间
        return date.toLocaleString() + ' (时区可能无效)';
      }
    }
  }

  // Tab1: 时间戳转日期
  document.getElementById('ts-to-date-btn').addEventListener('click', function () {
    const timestampInput = document.getElementById('ts-timestamp-input').value;
    const unit = document
      .querySelector('#ts-tab1 .ts-unit-option.active')
      .getAttribute('data-unit');
    const timezone = document.getElementById('ts-timezone-select1').value;

    if (!timestampInput) {
      alert('请输入时间戳');
      return;
    }

    let timestamp = parseInt(timestampInput);
    if (isNaN(timestamp)) {
      alert('请输入有效的时间戳');
      return;
    }

    // 根据单位调整时间戳
    if (unit === 'seconds') {
      timestamp *= 1000;
    }

    const date = new Date(timestamp);

    if (isNaN(date.getTime())) {
      alert('时间戳无效');
      return;
    }

    // 显示结果
    document.getElementById('ts-timezone-time').textContent = formatDateInTimezone(date, timezone);
    document.getElementById('ts-local-time').textContent = date.toLocaleString();
    document.getElementById('ts-utc-time').textContent = date.toUTCString().replace('GMT', 'UTC');
    document.getElementById('ts-iso-time').textContent = date.toISOString();

    // 计算相对时间
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    let relativeTime = '';
    if (Math.abs(diffSec) < 60) {
      relativeTime = diffSec >= 0 ? `${diffSec}秒前` : `${Math.abs(diffSec)}秒后`;
    } else if (Math.abs(diffMin) < 60) {
      relativeTime = diffMin >= 0 ? `${diffMin}分钟前` : `${Math.abs(diffMin)}分钟后`;
    } else if (Math.abs(diffHour) < 24) {
      relativeTime = diffHour >= 0 ? `${diffHour}小时前` : `${Math.abs(diffHour)}小时后`;
    } else if (Math.abs(diffDay) < 30) {
      relativeTime = diffDay >= 0 ? `${diffDay}天前` : `${Math.abs(diffDay)}天后`;
    } else {
      relativeTime = date.toLocaleDateString();
    }

    document.getElementById('ts-relative-time').textContent = relativeTime;
    document.getElementById('ts-to-date-result').style.display = 'block';
  });

  // Tab1: 当前时间戳
  document.getElementById('ts-now-btn').addEventListener('click', function () {
    const unit = document
      .querySelector('#ts-tab1 .ts-unit-option.active')
      .getAttribute('data-unit');
    const now = new Date();

    if (unit === 'seconds') {
      document.getElementById('ts-timestamp-input').value = Math.floor(now.getTime() / 1000);
    } else {
      document.getElementById('ts-timestamp-input').value = now.getTime();
    }
  });

  // Tab2: 日期转时间戳
  document.getElementById('ts-to-timestamp-btn').addEventListener('click', function () {
    const datetimeInput = document.getElementById('ts-datetime-input').value;
    const timezone = document.getElementById('ts-timezone-select2').value;

    if (!datetimeInput) {
      alert('请选择日期时间');
      return;
    }

    let date;
    if (timezone === 'UTC') {
      // 将本地时间转换为UTC时间
      const localDate = new Date(datetimeInput);
      date = new Date(localDate.getTime() + localDate.getTimezoneOffset() * 60000);
    } else if (timezone === 'local') {
      date = new Date(datetimeInput);
    } else {
      // 对于其他时区，我们使用本地时间并调整时区偏移
      // 注意：这是一个简化的实现，实际时区转换更复杂
      date = new Date(datetimeInput);
      try {
        // 获取指定时区的当前时间偏移
        const nowInTimezone = new Date().toLocaleString('zh-CN', { timeZone: timezone });
        // 这是一个简化的实现，实际应用中可能需要更精确的时区处理
      } catch (e) {
        // 如果时区无效，使用本地时间
        console.error('时区无效:', e);
      }
    }

    if (isNaN(date.getTime())) {
      alert('日期时间无效');
      return;
    }

    const seconds = Math.floor(date.getTime() / 1000);
    const milliseconds = date.getTime();

    // 显示结果
    document.getElementById('ts-seconds-timestamp').textContent = seconds;
    document.getElementById('ts-milliseconds-timestamp').textContent = milliseconds;
    document.getElementById('ts-to-timestamp-result').style.display = 'block';
  });

  // Tab2: 当前时间
  document.getElementById('ts-now-datetime-btn').addEventListener('click', function () {
    const now = new Date();
    // 转换为datetime-local需要的格式
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    document.getElementById(
      'ts-datetime-input'
    ).value = `${year}-${month}-${day}T${hours}:${minutes}`;
  });

  // 复制功能
  document.addEventListener('click', function (e) {
    if (e.target.classList.contains('ts-copy-btn')) {
      const targetId = e.target.getAttribute('data-target');
      const textToCopy = document.getElementById(targetId).textContent;

      navigator.clipboard
        .writeText(textToCopy)
        .then(() => {
          // 显示复制成功反馈
          const originalText = e.target.textContent;
          e.target.textContent = '✓';

          setTimeout(() => {
            e.target.textContent = originalText;
          }, 2000);
        })
        .catch((err) => {
          console.error('复制失败:', err);
          alert('复制到剪贴板失败');
        });
    }
  });
})();
