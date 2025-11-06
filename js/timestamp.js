(() => {
  // 移除文章容器的 ID 以避免样式冲突
  const articleContainer = document.getElementById('article-container');
  articleContainer.id = '';

  // 元素引用
  const tabs = document.querySelectorAll('#ts-container .project-tab');
  const contents = document.querySelectorAll('#ts-container .project-tab-content');
  // Tab1
  const timestampInput = document.getElementById('ts-timestamp-input'); // 时间戳输入
  const nowBtn = document.getElementById('ts-now-btn'); // 当前时间戳按钮
  const timezoneSelect1 = document.getElementById('ts-timezone-select1'); // 时区选择
  const toDateBtn = document.getElementById('ts-to-date-btn'); // 转换为日期按钮
  const toDateResult = document.getElementById('ts-to-date-result'); // 转换结果容器
  const timezoneTime = document.getElementById('ts-timezone-time'); // 指定时区时间
  const localTime = document.getElementById('ts-local-time'); // 本地时间
  const utcTime = document.getElementById('ts-utc-time'); // UTC时间
  const isoTime = document.getElementById('ts-iso-time'); // ISO时间
  const relativeTime = document.getElementById('ts-relative-time'); // 相对时间
  // Tab2
  const inputMethodRadios = document.querySelectorAll('input[name="input-method"]'); // 输入方式单选按钮
  const textInput = document.getElementById('ts-text-input'); // 日期时间文字输入容器
  const datetimeText = document.getElementById('ts-datetime-text'); // 日期时间文字输入
  const nowTextBtn = document.getElementById('ts-now-text-btn'); // 当前日期时间按钮（文字输入）
  const pickerInput = document.getElementById('ts-picker-input'); // 日期时间选择器
  const pickerSelect = document.getElementById('ts-picker-select'); // 时区选择器
  const datetimeInput = document.getElementById('ts-datetime-input'); // 日期时间选择器输入
  const nowDatetimeBtn = document.getElementById('ts-now-datetime-btn'); // 当前日期时间按钮
  const timezoneSelect2 = document.getElementById('ts-timezone-select2'); // 时区选择
  const toTimestampBtn = document.getElementById('ts-to-timestamp-btn'); // 转换为时间戳按钮
  const toTimestampResult = document.getElementById('ts-to-timestamp-result'); // 转换结果容器
  const secondsTimestamp = document.getElementById('ts-seconds-timestamp'); // 秒时间戳
  const millisecondsTimestamp = document.getElementById('ts-milliseconds-timestamp'); // 毫秒时间戳
  // 当前时间显示
  const currentSeconds = document.getElementById('ts-current-seconds'); // 当前秒时间戳
  const currentMilliseconds = document.getElementById('ts-current-milliseconds'); // 当前毫秒时间戳
  const currentLocal = document.getElementById('ts-current-local'); // 当前本地时间
  const currentUtc = document.getElementById('ts-current-utc'); // 当前UTC时间

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

  // 更新当前时间信息
  function updateCurrentTime() {
    const now = new Date();
    const seconds = Math.floor(now.getTime() / 1000);
    const milliseconds = now.getTime();

    currentSeconds.textContent = seconds;
    currentMilliseconds.textContent = milliseconds;
    currentLocal.textContent = now.toLocaleString();
    currentUtc.textContent = now.toUTCString();
  }

  // 初始更新当前时间信息
  updateCurrentTime();

  // 每秒更新一次当前时间
  setInterval(updateCurrentTime, 1000);

  // Tab1: 获取当前时间戳
  nowBtn.onclick = (e) => {
    e.preventDefault();
    const unit = document.querySelector('input[name="timestamp-unit"]:checked').value || 'seconds';
    const now = new Date();

    if (unit === 'seconds') {
      timestampInput.value = Math.floor(now.getTime() / 1000);
    } else {
      timestampInput.value = now.getTime();
    }
  };

  // Tab1: 时间戳转日期时间
  toDateBtn.onclick = (e) => {
    e.preventDefault();

    if (!timestampInput.value) {
      alert('请输入时间戳');
      return;
    }

    let timestamp = parseInt(timestampInput.value);
    if (isNaN(timestamp)) {
      alert('请输入有效的时间戳');
      return;
    }

    // 根据单位调整时间戳
    const unit = document.querySelector('input[name="timestamp-unit"]:checked').value || 'seconds';
    if (unit === 'seconds') {
      timestamp *= 1000;
    }

    const date = new Date(timestamp);

    if (isNaN(date.getTime())) {
      alert('时间戳无效');
      return;
    }

    // 显示结果
    localTime.textContent = date.toLocaleString();
    utcTime.textContent = date.toUTCString();
    isoTime.textContent = date.toISOString();
    timezoneTime.textContent = formatDateInTimezone(date, timezoneSelect1.value);
    relativeTime.textContent = relativeTimeFromDate(date);

    // 显示结果容器
    toDateResult.style.display = 'block';
  };

  // 格式化时间为指定时区
  function formatDateInTimezone(date, timezone) {
    const timeZone =
      timezone === 'local' ? Intl.DateTimeFormat().resolvedOptions().timeZone : timezone;
    try {
      return date.toLocaleString(navigator.language, {
        timeZone,
        timeZoneName: 'short',
      });
    } catch (e) {
      // 如果时区无效，回退到本地时间
      return date.toLocaleString() + ' （时区可能无效，显示为本地时间）';
    }
  }

  // 计算相对时间字符串
  function relativeTimeFromDate(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    let relativeTimeText = '';

    if (Math.abs(diffSec) < 60) {
      relativeTimeText = diffSec >= 0 ? `${diffSec}秒前` : `${Math.abs(diffSec)}秒后`;
    } else if (Math.abs(diffMin) < 60) {
      relativeTimeText = diffMin >= 0 ? `${diffMin}分钟前` : `${Math.abs(diffMin)}分钟后`;
    } else if (Math.abs(diffHour) < 24) {
      relativeTimeText = diffHour >= 0 ? `${diffHour}小时前` : `${Math.abs(diffHour)}小时后`;
    } else if (Math.abs(diffDay) < 30) {
      relativeTimeText = diffDay >= 0 ? `${diffDay}天前` : `${Math.abs(diffDay)}天后`;
    } else {
      const diffMonth = Math.floor(diffDay / 30);
      if (Math.abs(diffMonth) < 12) {
        relativeTimeText = diffMonth >= 0 ? `${diffMonth}个月前` : `${Math.abs(diffMonth)}个月后`;
      } else {
        const diffYear = Math.floor(diffMonth / 12);
        relativeTimeText = diffYear >= 0 ? `${diffYear}年前` : `${Math.abs(diffYear)}年后`;
      }
    }
    return relativeTimeText;
  }

  // Tab2: 输入方式切换
  inputMethodRadios.forEach((radio) => {
    radio.addEventListener('change', function () {
      if (this.value === 'picker') {
        pickerInput.style.display = 'block';
        pickerSelect.style.display = 'block';
        textInput.style.display = 'none';
      } else {
        pickerInput.style.display = 'none';
        pickerSelect.style.display = 'none';
        textInput.style.display = 'block';
      }
    });
  });

  // Tab2: 获取当前日期时间
  nowTextBtn.onclick = (e) => {
    e.preventDefault();
    datetimeText.value = new Date().toString();
  };

  // Tab2: 日期时间转时间戳
  toTimestampBtn.onclick = (e) => {
    e.preventDefault();
    const timezone = timezoneSelect2.value;
    const inputMethod = document.querySelector('input[name="input-method"]:checked').value;

    let inputValue;
    let result;
    if (inputMethod === 'picker') {
      inputValue = datetimeInput.value;
      if (!inputValue) {
        alert('请选择日期时间');
        return;
      }

      // 使用 Luxon 处理时区转换
      result = luxon.DateTime.fromISO(inputValue, { zone: timezone }).ts;
    } else {
      inputValue = datetimeText.value.trim();
      if (!inputValue) {
        alert('请输入日期时间文本');
        return;
      }
      result = Date.parse(inputValue);
    }
    if (isNaN(result)) {
      alert('请输入有效的日期时间文本');
      return;
    }

    const seconds = Math.floor(result / 1000);
    const milliseconds = result;

    // 显示结果
    secondsTimestamp.textContent = seconds;
    millisecondsTimestamp.textContent = milliseconds;
    toTimestampResult.style.display = 'block';
  };

  // Tab2: 当前日期时间
  nowDatetimeBtn.onclick = (e) => {
    e.preventDefault();
    const now = new Date();
    // 转换为datetime-local需要的格式
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    datetimeInput.value = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  };

  // 复制功能
  document.addEventListener('click', function (e) {
    const copyBtn = e.target.closest('.ts-copy-btn');
    if (copyBtn) {
      const targetId = copyBtn.getAttribute('data-target');
      const textToCopy = document.getElementById(targetId)?.textContent;

      navigator.clipboard
        .writeText(textToCopy)
        .then(() => {
          // 显示复制成功反馈
          const originalInnerHTML = copyBtn.innerHTML;
          copyBtn.style.pointerEvents = 'none';
          copyBtn.innerHTML = '<i class="toukofont touko-icon-check"></i>';

          setTimeout(() => {
            copyBtn.style.pointerEvents = 'auto';
            copyBtn.innerHTML = originalInnerHTML;
          }, 2000);
        })
        .catch((err) => {
          console.error('复制失败:', err);
          alert('复制到剪贴板失败');
        });
    }
  });
})();
