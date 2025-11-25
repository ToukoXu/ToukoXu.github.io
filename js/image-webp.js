(() => {
  // 移除文章容器的 ID 以避免样式冲突
  const articleContainer = document.getElementById('article-container');
  articleContainer.id = '';

  // 元素引用
  const fileInput = document.getElementById('iw-file-input');
  const uploadContainer = document.getElementById('iw-upload-container');
  const convertBtn = document.getElementById('iw-convert-btn');
  const clearBtn = document.getElementById('iw-clear-btn');
  const downloadAllBtn = document.getElementById('iw-download-all-btn');
  const progressFill = document.getElementById('iw-progress-fill');
  const progressText = document.getElementById('iw-progress-text');
  const emptyState = document.getElementById('iw-empty-state');
  const imagesContainer = document.getElementById('iw-images-container');
  const imageCardTemplate = document.getElementById('iw-image-card-template');
  const addPrefixCheckbox = document.getElementById('iw-add-prefix-checkbox');
  const prefixInput = document.getElementById('iw-prefix-text');

  // 状态变量
  let images = [];
  let isProcessing = false;
  const CONCURRENT_CONVERSIONS = 8; // 同时转换的数量

  // 点击上传区域触发文件上传
  uploadContainer.addEventListener('click', () => {
    fileInput.click();
  });

  // 文件拖放功能
  uploadContainer.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadContainer.style.borderColor = 'var(--anzhiyu-theme)';
    uploadContainer.style.backgroundColor = '#f8faff';
  });
  uploadContainer.addEventListener('dragleave', () => {
    uploadContainer.style.borderColor = '#c3cfe2';
    uploadContainer.style.backgroundColor = 'transparent';
  });
  uploadContainer.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadContainer.style.borderColor = '#c3cfe2';
    uploadContainer.style.backgroundColor = 'transparent';

    if (e.dataTransfer.files.length) {
      handleImageFiles(e.dataTransfer.files);
    }
  });

  // 文件选择处理
  fileInput.addEventListener('change', () => {
    if (fileInput.files.length) {
      handleImageFiles(fileInput.files);
    }
  });

  // 处理图片文件
  async function handleImageFiles(files) {
    const validFiles = Array.from(files).filter((file) => file.type.match('image.*'));

    if (validFiles.length === 0) {
      alert('请选择图片文件！');
      return;
    }

    // 隐藏空状态
    emptyState.style.display = 'none';

    // 添加图片对象，生成图片卡片预览
    validFiles.forEach((file, index) => {
      const image = {
        id: `placeholder-${Date.now()}-${index}`,
        name: file.name,
        type: file.type,
        originalSize: file.size,
        file: file, // 保存原始文件对象
        objectURL: URL.createObjectURL(file), // 使用ObjectURL而不是base64来预览图片
        webpBlob: null,
        webpObjectURL: null,
        webpSize: 0,
        status: 'waiting',
        error: null,
      };

      images.push(image);
      addImageCard(image);
    });

    updateButtonStates();
  }

  // 添加图片卡片
  function addImageCard(image) {
    // 使用图片卡片模板克隆节点
    const clone = imageCardTemplate.content.cloneNode(true);
    const card = clone.querySelector('.iw-image-card');
    card.id = `card-${image.id}`;

    handleImageCardInfo(card, image);

    // 设置图片预览
    const imgPreview = card.querySelector('.iw-image-preview');
    imgPreview.src = image.objectURL;
    imgPreview.alt = image.name;

    // 设置图片名称
    const nameElement = card.querySelector('.iw-image-name');
    nameElement.textContent = image.name;
    nameElement.title = image.name;

    // 设置图片大小信息
    const originalSizeElement = card.querySelector('.iw-image-original-size');
    originalSizeElement.textContent = formatFileSize(image.originalSize);

    // 设置按钮的data-id属性
    const downloadBtn = card.querySelector('.iw-download-btn');
    const retryBtn = card.querySelector('.iw-retry-btn');
    const removeBtn = card.querySelector('.iw-remove-btn');
    downloadBtn.dataset.id = image.id;
    retryBtn.dataset.id = image.id;
    removeBtn.dataset.id = image.id;

    imagesContainer.appendChild(card);
  }

  // 更新图片卡片
  function updateImageCard(image) {
    const card = document.getElementById(`card-${image.id}`);
    if (!card) return;

    handleImageCardInfo(card, image);
  }

  // 处理图片卡片的可变信息
  function handleImageCardInfo(card, image) {
    // 设置转换后大小信息
    const convertedSizeElement = card.querySelector('.iw-image-converted-size');
    convertedSizeElement.textContent =
      image.status === 'completed' ? formatFileSize(image.webpSize) : '尚未转换';

    // 设置状态信息
    let statusIcon, statusText;
    switch (image.status) {
      case 'waiting':
        statusIcon = '⏰';
        statusText = '等待中';
        break;
      case 'processing':
        statusIcon = '⚡';
        statusText = '转换中';
        break;
      case 'completed':
        const reduction = Math.round((1 - image.webpSize / image.originalSize) * 100);
        statusIcon = '✅';
        statusText = '已完成' + (reduction > 0 ? `（节省 ${reduction}%）` : '');
        break;
      case 'error':
        statusIcon = '❌';
        statusText = `失败: ${image.error}`;
        break;
    }
    const statusElement = card.querySelector('.iw-image-status');
    const statusIconElement = card.querySelector('.iw-status-icon');
    const statusTextElement = card.querySelector('.iw-status-text');
    statusElement.className = `iw-image-status iw-status-${image.status}`;
    statusIconElement.textContent = statusIcon;
    statusTextElement.textContent = statusText;

    // 设置按钮显示/隐藏
    const downloadBtn = card.querySelector('.iw-download-btn');
    const retryBtn = card.querySelector('.iw-retry-btn');
    downloadBtn.style.display = image.status === 'completed' ? '' : 'none';
    retryBtn.style.display = image.status === 'error' ? '' : 'none';
  }

  // 更新按钮状态
  function updateButtonStates() {
    convertBtn.disabled =
      images.length === 0 ||
      isProcessing ||
      !images.some((img) => img.status === 'waiting' || img.status === 'error');
    clearBtn.disabled = images.length === 0 || isProcessing;
    downloadAllBtn.disabled =
      images.length === 0 || !images.some((img) => img.status === 'completed');
  }

  // 更新进度条
  function updateProgress() {
    const completed = images.filter(
      (img) => img.status === 'completed' || img.status === 'error',
    ).length;
    const total = images.length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;

    progressFill.style.width = `${percentage}%`;
    progressText.textContent = `${completed}/${total}`;
  }

  // 格式化文件大小
  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
    else return (bytes / 1048576).toFixed(2) + ' MB';
  }

  // 开始转换 - 并行处理
  convertBtn.addEventListener('click', async () => {
    isProcessing = true;
    updateButtonStates();

    // 获取所有等待转换的图片
    const imagesToConvert = images.filter((img) => img.status === 'waiting');

    // 使用Promise.all并行处理多个转换任务
    const batches = [];
    for (let i = 0; i < imagesToConvert.length; i += CONCURRENT_CONVERSIONS) {
      const batch = imagesToConvert.slice(i, i + CONCURRENT_CONVERSIONS);
      batches.push(batch);
    }

    for (const batch of batches) {
      await Promise.all(batch.map((image) => convertToWebP(image)));
      updateButtonStates();
      updateProgress();
    }

    isProcessing = false;
    updateButtonStates();
  });

  // 转换为WebP格式
  function convertToWebP(image) {
    return new Promise((resolve) => {
      // 更新状态
      image.status = 'processing';
      updateImageCard(image);

      // 使用FileReader读取文件
      const reader = new FileReader();
      reader.onload = function (e) {
        // 使用canvas转换图片
        const img = new Image();
        img.onload = function () {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // 计算新尺寸（保持宽高比）
          let width = img.width;
          let height = img.height;
          const maxDimension = 1200; // 最大尺寸限制

          if (width > height && width > maxDimension) {
            height = (height * maxDimension) / width;
            width = maxDimension;
          } else if (height > maxDimension) {
            width = (width * maxDimension) / height;
            height = maxDimension;
          }

          canvas.width = width;
          canvas.height = height;

          try {
            // 绘制图片到canvas
            ctx.drawImage(img, 0, 0, width, height);

            // 转换为WebP格式
            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  image.status = 'error';
                  image.error = '转换失败';
                  updateImageCard(image);
                  resolve();
                  return;
                }

                let webpBlob = blob;
                let webpObjectURL = URL.createObjectURL(blob);
                let webpSize = blob.size;
                // 检查转换后是否比原始文件大，如果转换后更大，使用原始文件
                if (blob.size >= image.originalSize) {
                  webpBlob = e.target.result;
                  webpObjectURL = image.objectURL;
                  webpSize = image.originalSize;
                }

                image.webpBlob = webpBlob;
                image.webpObjectURL = webpObjectURL;
                image.webpSize = webpSize;
                image.status = 'completed';
                updateImageCard(image);
                resolve();
              },
              'image/webp',
              0.8, // 压缩质量
            );
          } catch (error) {
            console.error('转换错误:', error);
            image.status = 'error';
            image.error = error.message;
            updateImageCard(image);
            resolve();
          }
        };
        img.onerror = function () {
          image.status = 'error';
          image.error = '图片加载失败';
          updateImageCard(image);
          resolve();
        };
        img.src = e.target.result; // 这里使用FileReader读取的结果
      };
      reader.onerror = function () {
        image.status = 'error';
        image.error = '文件读取失败';
        updateImageCard(image);
        resolve();
      };
      reader.readAsDataURL(image.file);
    });
  }

  // 单个图片的事件委托 - 为整个图片容器绑定一个事件监听器
  imagesContainer.addEventListener('click', function (e) {
    // 检查点击的是否是下载按钮
    const downloadBtn = e.target.closest('.iw-download-btn');
    if (downloadBtn) {
      e.preventDefault();
      const id = downloadBtn.dataset.id;
      downloadImage(id);
      return;
    }

    // 检查点击的是否是重试按钮
    const retryBtn = e.target.closest('.iw-retry-btn');
    if (retryBtn) {
      e.preventDefault();
      const id = retryBtn.dataset.id;
      retryImage(id);
      return;
    }

    // 检查点击的是否是移除按钮
    const removeBtn = e.target.closest('.iw-remove-btn');
    if (removeBtn) {
      e.preventDefault();
      const id = removeBtn.dataset.id;
      removeImage(id);
      return;
    }
  });

  // 下载单张图片
  function downloadImage(id) {
    const image = images.find((img) => img.id === id);
    if (!image || !image.webpObjectURL) return;

    const link = document.createElement('a');
    link.href = image.webpObjectURL;
    link.download = generateFileName(image.name);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // 重试单张图片
  function retryImage(id) {
    const image = images.find((img) => img.id === id);
    if (!image) return;

    image.status = 'waiting';
    updateImageCard(image);

    if (!isProcessing) {
      convertToWebP(image);
    }
  }

  // 移除单张图片
  function removeImage(id) {
    const imageIndex = images.findIndex((img) => img.id === id);
    if (imageIndex === -1) return;

    // 重置文件输入框以允许重新上传相同文件
    fileInput.value = '';

    // 释放objectURL
    URL.revokeObjectURL(images[imageIndex].objectURL);
    URL.revokeObjectURL(images[imageIndex].webpObjectURL);

    // 移除图片
    images.splice(imageIndex, 1);
    if (images.length === 0) emptyState.style.display = 'block';

    // 移除对应的卡片
    const card = document.getElementById(`card-${id}`);
    if (card) {
      card.remove();
    }

    updateButtonStates();
    updateProgress();
  }

  // 移除所有图片
  clearBtn.addEventListener('click', () => {
    // 重置文件输入框以允许重新上传相同文件
    fileInput.value = '';

    // 释放所有objectURL
    images.forEach((image) => {
      URL.revokeObjectURL(image.objectURL);
      URL.revokeObjectURL(image.webpObjectURL);
    });

    images = [];
    emptyState.style.display = 'block';

    // 移除图片卡片
    imagesContainer.innerHTML = '';

    updateButtonStates();
    updateProgress();
  });

  // 前缀选项事件监听
  addPrefixCheckbox.addEventListener('change', function () {
    prefixInput.disabled = !this.checked;
    if (!this.checked) {
      prefixInput.value = 'webp_'; // 重置为默认值
    }
  });

  // 下载所有图片
  downloadAllBtn.addEventListener('click', () => {
    // 使用JSZip创建ZIP文件
    if (typeof JSZip === 'undefined') {
      alert('请等待Zip库加载完成');
      return;
    }

    const zip = new JSZip();

    // 添加所有已完成的图片到ZIP
    images.forEach((image) => {
      if (image.status === 'completed' && image.webpBlob) {
        const fileName = generateFileName(image.name);
        zip.file(fileName, image.webpBlob);
      }
    });

    // 生成ZIP文件并下载
    zip.generateAsync({ type: 'blob' }).then(function (content) {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = 'webp_images.zip';
      link.click();
    });
  });

  // 生成文件名（考虑前缀选项）
  function generateFileName(originalName) {
    const usePrefix = addPrefixCheckbox.checked;
    const prefix = usePrefix ? prefixInput.value : '';

    // 替换文件扩展名为webp
    const baseName = originalName.replace(/\.[^/.]+$/, '');
    return prefix + baseName + '.webp';
  }
})();
