window.alert = function (txt) {
  const bodyWrap = document.querySelector('#body-wrap');
  bodyWrap?.classList?.add('project-mask');
  document.documentElement.style.overflowY = 'hidden';

  const alertFram = document.createElement('div');
  alertFram.id = 'alertFram';
  alertFram.className = 'project-dialog';
  alertFram.style.display = 'block';

  const p = document.createElement('p');
  p.textContent = txt;
  alertFram.appendChild(p);

  const btn = document.createElement('button');
  btn.className = 'project-primary-btn round';
  btn.textContent = '确定';
  alertFram.appendChild(btn);

  document.body.appendChild(alertFram);

  setTimeout(function () {
    alertFram.style.opacity = '1';
    alertFram.style.transform = 'translate(-50%, -50%) scale(1)';
  }, 10);

  // 确定按钮点击事件
  btn.onclick = function () {
    alertFram.style.opacity = '0';
    alertFram.style.transform = 'translate(-50%, -50%) scale(0.8)';

    setTimeout(function () {
      bodyWrap?.classList?.remove('project-mask');
      document.documentElement.style.overflowY = 'auto';
      document.body.removeChild(alertFram);
    }, 100);
  };

  // 阻止文本选择
  document.body.onselectstart = function () {
    return false;
  };
};
