document.addEventListener('DOMContentLoaded', function () {
  // 元素引用
  const baseSizeInput = document.getElementById('pr-base-size');
  const pxInput = document.getElementById('pr-px-input');
  const remInput = document.getElementById('pr-rem-input');

  // PX转REM
  function convertToREM() {
    const baseSize = parseFloat(baseSizeInput.value) || 16;

    // 如果PX输入框有值，计算REM
    if (pxInput.value !== '') {
      const pxValue = parseFloat(pxInput.value);
      if (!isNaN(pxValue)) {
        const remValue = pxValue / baseSize;
        remInput.value = remValue.toFixed(4);
        pxInput.style.color = '#000000';
        remInput.style.color = 'var(--anzhiyu-theme)';
      }
    }
  }

  // REM转PX
  function convertToPX() {
    const baseSize = parseFloat(baseSizeInput.value) || 16;

    // 如果REM输入框有值，计算PX
    if (remInput.value !== '') {
      const remValue = parseFloat(remInput.value);
      if (!isNaN(remValue)) {
        const pxValue = remValue * baseSize;
        pxInput.value = Math.round(pxValue * 100) / 100;
        pxInput.style.color = 'var(--anzhiyu-theme)';
        remInput.style.color = '#000000';
      }
    }
  }

  // 实时转换
  pxInput.oninput = convertToREM;
  remInput.oninput = convertToPX;

  // 基准字体大小变化时重新计算
  baseSizeInput.oninput = () => {
    if (pxInput.value !== '') convertToREM();
    else if (remInput.value !== '') convertToPX;
  };
});
