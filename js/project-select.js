class CustomSelect {
  constructor(selectElement) {
    this.selectElement = selectElement; // 原生select元素

    this.renderProjectSelect();
    this.bindEvents();

    // 初始更新显示
    this.updateDisplay();
  }

  // 渲染自定义选择器
  renderProjectSelect() {
    // 创建自定义选择器容器
    this.projectSelect = document.createElement('div');
    this.projectSelect.className = 'project-select';
    // 创建触发器
    this.projectSelectTrigger = document.createElement('div');
    this.projectSelectTrigger.className = 'project-select-trigger';
    // 创建占位符
    this.projectSelectPlaceholder = document.createElement('span');
    this.projectSelectPlaceholder.className = 'project-select-placeholder';
    this.projectSelectPlaceholder.textContent =
      this.selectElement.querySelector('option[disabled][selected]')?.textContent || '';
    // 创建选中值
    this.projectSelectValue = document.createElement('span');
    this.projectSelectValue.className = 'project-select-value';
    // 创建下拉箭头
    this.projectSelectArrow = document.createElement('span');
    this.projectSelectArrow.className = 'project-select-arrow';
    this.projectSelectArrow.innerHTML = '<i class="toukofont touko-icon-chevron-down"></i>';
    // 创建选项容器
    this.projectSelectOptions = document.createElement('div');
    this.projectSelectOptions.className = 'project-select-options';
    this.renderOptions();

    // 组装DOM结构
    this.projectSelectTrigger.appendChild(this.projectSelectPlaceholder);
    this.projectSelectTrigger.appendChild(this.projectSelectValue);
    this.projectSelectTrigger.appendChild(this.projectSelectArrow);
    this.projectSelect.appendChild(this.projectSelectTrigger);
    this.projectSelect.appendChild(this.projectSelectOptions);

    // 将自定义选择器插入到页面中
    insertAfter(this.selectElement, this.projectSelect);
  }

  // 渲染选项
  renderOptions() {
    // 为每个选项创建自定义元素
    Array.from(this.selectElement.options).forEach((option, index) => {
      if (option.value === '') return; // 跳过占位符选项

      const optionElement = document.createElement('div');
      optionElement.className = 'project-select-option';
      optionElement.setAttribute('data-value', option.value); // 存储选项值
      optionElement.setAttribute('tabindex', '0'); // 使选项可聚焦

      const label = document.createElement('span');
      label.className = 'project-select-option-label';
      label.textContent = option.text;

      const description = document.createElement('span');
      description.className = 'project-select-option-description';
      description.textContent = option.getAttribute('data-description') || '';

      optionElement.appendChild(label);
      optionElement.appendChild(description);

      this.projectSelectOptions.appendChild(optionElement);
    });
  }

  // 事件绑定
  bindEvents() {
    // 触发器点击事件
    this.projectSelectTrigger.onclick = () => {
      this.toggleOptions();
    };
    // 外部点击关闭事件
    document.addEventListener('click', (e) => {
      if (!this.projectSelect.contains(e.target)) {
        this.closeOptions();
      }
    });
    // 键盘导航事件
    this.projectSelect.onkeydown = (e) => {
      this.handleKeydown(e);
    };
    // 监听原生select的变化（例如通过JS设置值）
    this.selectElement.onchange = () => {
      this.updateDisplay();
    };
    // 选项点击事件
    this.projectSelectOptions.onclick = (e) => {
      const option = e.target.closest('.project-select-option');
      if (option) {
        this.selectOption(option.getAttribute('data-value'));
      }
    };
  }

  // 切换下拉菜单的开闭状态
  toggleOptions() {
    this.projectSelect.classList.toggle('open'); // 切换打开/关闭状态

    if (this.projectSelect.classList.contains('open')) {
      // 设置焦点到第一个选项
      const firstOption = this.projectSelectOptions.querySelector('.project-select-option');
      if (firstOption) firstOption.focus();
    }
  }

  // 关闭下拉菜单
  closeOptions() {
    this.projectSelect.classList.remove('open');
  }

  // 选择一个选项
  selectOption(value) {
    // 更新原生select的值
    this.selectElement.value = value;

    // 更新自定义选择器显示
    this.updateDisplay();

    // 关闭下拉菜单
    this.closeOptions();

    // 触发change事件
    this.selectElement.dispatchEvent(new Event('change'));
  }

  // 处理键盘导航
  handleKeydown(e) {
    if (!this.projectSelect.classList.contains('open')) return;

    const options = Array.from(
      this.projectSelectOptions.querySelectorAll('.project-select-option'),
    );
    const currentIndex = options.findIndex((option) => option === document.activeElement);
    let nextIndex = -1;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        nextIndex = (currentIndex + 1) % options.length;
        break;
      case 'ArrowUp':
        e.preventDefault();
        nextIndex = currentIndex <= 0 ? options.length - 1 : currentIndex - 1;
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (currentIndex >= 0) {
          this.selectOption(options[currentIndex].getAttribute('data-value'));
        }
        return;
      case 'Escape':
        this.closeOptions();
        this.projectSelectTrigger.focus();
        return;
      default:
        return;
    }

    if (nextIndex >= 0) {
      options[nextIndex].focus();
    }
  }

  // 更新显示内容
  updateDisplay() {
    const selectedOption = this.selectElement.options[this.selectElement.selectedIndex];

    // 更新显示文本
    if (this.selectElement.value) {
      this.projectSelectValue.style.display = 'inline';
      this.projectSelectPlaceholder.style.display = 'none';
      this.projectSelectValue.textContent = selectedOption.text;
    } else {
      this.projectSelectValue.style.display = 'none';
      this.projectSelectPlaceholder.style.display = 'inline';
    }

    // 更新选项状态
    this.projectSelectOptions.querySelectorAll('.project-select-option').forEach((option) => {
      option.classList.remove('selected');
      if (option.getAttribute('data-value') === this.selectElement.value) {
        option.classList.add('selected');
      }
    });
  }
}

// 辅助函数：在某个节点后插入新节点
function insertAfter(referenceNode, newNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

// 初始化函数
function initCustomSelect(selectElement) {
  return new CustomSelect(selectElement);
}

// 页面加载完成后初始化所有自定义选择器
(() => {
  const projectSelects = document.querySelectorAll('.project-select-wrapper');

  projectSelects.forEach((wrapper) => {
    const selectElement = wrapper.querySelector('select');
    initCustomSelect(selectElement);
  });
})();
