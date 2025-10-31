document.addEventListener('DOMContentLoaded', function () {
  // 移除文章容器的 ID 以避免样式冲突
  const articleContainer = document.getElementById('article-container');
  articleContainer.id = '';

  // 元素引用
  const tabs = document.querySelectorAll('.project-tab');
  const contents = document.querySelectorAll('.project-tab-content');
  const fileInput = document.getElementById('ib-file-input');
  const uploadContainer = document.getElementById('upload-container');
  const base64Output = document.getElementById('base64-output');
  const copyBase64Btn = document.getElementById('copy-base64');
  const imagePreview = document.getElementById('image-preview');
  const base64Input = document.getElementById('base64-input');
  const convertToImageBtn = document.getElementById('convert-to-image');
  const convertedImage = document.getElementById('converted-image');
  const downloadImageBtn = document.getElementById('download-image');

  // 选项卡切换
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
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

  // 点击上传区域触发文件输入
  uploadContainer.addEventListener('click', () => {
    fileInput.click();
  });

  // 拖放功能
  uploadContainer.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadContainer.style.borderColor = 'var(--anzhiyu-theme)';
    uploadContainer.style.background = '#f8faff';
  });

  uploadContainer.addEventListener('dragleave', () => {
    uploadContainer.style.borderColor = '#c3cfe2';
    uploadContainer.style.background = 'transparent';
  });

  uploadContainer.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadContainer.style.borderColor = '#c3cfe2';
    uploadContainer.style.background = 'transparent';

    if (e.dataTransfer.files.length) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  });

  // 文件选择处理
  fileInput.addEventListener('change', () => {
    if (fileInput.files.length) {
      handleImageFile(fileInput.files[0]);
    }
  });

  // 处理图片文件
  function handleImageFile(file) {
    if (!file.type.match('image.*')) {
      alert('请选择图片文件！');
      return;
    }

    const reader = new FileReader();

    reader.onload = function (e) {
      // 显示图片预览
      imagePreview.src = e.target.result;

      // 转换为Base64
      base64Output.value = e.target.result;
    };

    reader.readAsDataURL(file);
  }

  // 复制Base64到剪贴板
  copyBase64Btn.addEventListener('click', () => {
    if (!base64Output.value) {
      alert('请先上传图片！');
      return;
    }

    base64Output.select();
    document.execCommand('copy');

    // 显示复制成功反馈
    const originalText = copyBase64Btn.innerHTML;
    copyBase64Btn.innerHTML = '<span class="project-icon" role="img">✓</span> 已复制！';

    setTimeout(() => {
      copyBase64Btn.innerHTML = originalText;
    }, 2000);
  });

  // Base64转换为图片
  convertToImageBtn.addEventListener('click', () => {
    const base64Data = base64Input.value.trim();

    if (!base64Data || !isBase64(base64Data)) {
      alert('请输入Base64编码！');
      return;
    }

    try {
      // 尝试设置图片源
      convertedImage.src = base64Data;
      downloadImageBtn.style.display = 'flex';
    } catch (e) {
      alert('Base64编码无效，请检查后重试！');
      console.error(e);
    }
  });

  function isBase64(str) {
    // 检查格式和填充
    const strictBase64Regex = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

    // 移除可能的 Data URL 前缀
    const cleanStr = str.replace(/^data:[^;]+;base64,/, '');

    // 检查长度是否为4的倍数
    if (cleanStr.length % 4 !== 0) {
      return false;
    }

    // 检查字符是否合法
    return strictBase64Regex.test(cleanStr);
  }

  // 下载图片
  downloadImageBtn.addEventListener('click', () => {
    if (!convertedImage.src) {
      alert('没有可下载的图片！');
      return;
    }

    const link = document.createElement('a');
    link.href = convertedImage.src;

    // 尝试从Base64数据中检测文件类型
    let extension = 'png';
    const matches = convertedImage.src.match(/^data:image\/([a-zA-Z+]+);base64,/);
    if (matches && matches.length > 1) {
      extension = matches[1];
    }

    link.download = `converted-image.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
});
