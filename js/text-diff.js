document.addEventListener('DOMContentLoaded', function () {
  // 移除文章容器的 ID 以避免样式冲突
  const articleContainer = document.getElementById('article-container');
  articleContainer.id = '';

  // 元素引用
  const formatBtn = document.getElementById('td-format-btn');
  const clearBtn = document.getElementById('td-clear-btn');
  const exampleBtn = document.getElementById('td-example-btn');
  const languageSelect = document.getElementById('td-language-select');
  const languageTip = document.getElementById('td-language-tip');
  const diffContainer = document.getElementById('td-diff-container');

  // Monaco Editor 实例
  let diffEditor = null;
  let originalEditor = null;
  let modifiedEditor = null;
  let supportedLanguages = [];

  // 初始化 Monaco Editor
  require.config({
    paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs' },
  });
  require(['vs/editor/editor.main'], function () {
    // 动态填充语言选项
    supportedLanguages = monaco.languages.getLanguages();
    supportedLanguages.forEach((lang) => {
      const option = document.createElement('option');
      option.value = lang.id;
      option.textContent = lang.aliases ? lang.aliases[0] : lang.id;
      languageSelect.appendChild(option);
    });

    // 创建差异对比编辑器
    diffEditor = monaco.editor.createDiffEditor(diffContainer, {
      theme: 'vs-light',
      originalEditable: true,
      enableSplitViewResizing: true,
      renderSideBySide: true,
      automaticLayout: true,
      //   minimap: { enabled: true },
    });

    // 获取编辑器实例
    originalEditor = diffEditor.getOriginalEditor();
    modifiedEditor = diffEditor.getModifiedEditor();

    // 设置初始模型
    const originalModel = monaco.editor.createModel('', 'plaintext');
    const modifiedModel = monaco.editor.createModel('', 'plaintext');
    diffEditor.setModel({
      original: originalModel,
      modified: modifiedModel,
    });

    // 监听内容变化，实时自动检测语言
    originalModel.onDidChangeContent(debounce(autoDetectLanguage), 300);
    modifiedModel.onDidChangeContent(debounce(autoDetectLanguage), 300);

    // 监听语言选择变化
    languageSelect.addEventListener('change', function () {
      if (this.value === 'auto') {
        languageTip.style.display = 'block';
        autoDetectLanguage();
      } else {
        languageTip.style.display = 'none';
        setLanguage(this.value);
      }
    });
  });

  // 自动检测语言
  function autoDetectLanguage() {
    if (languageSelect.value !== 'auto') return;

    const originalValue = originalEditor.getValue();
    const modifiedValue = modifiedEditor.getValue();

    // 优先使用修改后的文本来检测语言
    const textToDetect = modifiedValue || originalValue;

    let lang = 'plaintext';
    let alias = 'Plain Text';
    if (textToDetect) {
      const detectedLang = hljs.highlightAuto(textToDetect).language;
      supportedLanguages.find((supportedLanguage) => {
        if (supportedLanguage.id === detectedLang) {
          lang = detectedLang;
          alias = supportedLanguage.aliases ? supportedLanguage.aliases[0] : supportedLanguage.id;
          return;
        }
      });
    }

    setLanguage(lang);
    languageSelect.firstElementChild.textContent = `自动检测 （${alias}）`;
  }

  // 设置语言
  function setLanguage(lang) {
    monaco.editor.setModelLanguage(originalEditor.getModel(), lang);
    monaco.editor.setModelLanguage(modifiedEditor.getModel(), lang);
  }

  // 格式化文本
  formatBtn.addEventListener('click', function () {
    originalEditor.getAction('editor.action.formatDocument')?.run();
    modifiedEditor.getAction('editor.action.formatDocument')?.run();
  });

  // 清除所有
  clearBtn.addEventListener('click', function () {
    const originalModel = originalEditor.getModel();
    const modifiedModel = modifiedEditor.getModel();

    originalModel.setValue('');
    modifiedModel.setValue('');

    // 重置语言检测
    setLanguage('plaintext');
    languageSelect.value = 'auto';
  });

  // 加载示例
  exampleBtn.addEventListener('click', function () {
    const exampleOriginal = `function greet(name) {
    return "Hello, " + name + "!";
}

console.log(greet("World"));
`;

    const exampleModified = `function greet(name, punctuation = "!") {
    return \`Hello, \${name}\${punctuation}\`;
}

console.log(greet("World"));
console.log(greet("User", "?"));
`;

    const originalModel = originalEditor.getModel();
    const modifiedModel = modifiedEditor.getModel();

    originalModel.setValue(exampleOriginal);
    modifiedModel.setValue(exampleModified);

    autoDetectLanguage();
  });

  function debounce(func, delay) {
    let timer;
    return function () {
      let context = this;
      let args = arguments;

      timer ? clearTimeout(timer) : null;
      timer = setTimeout(() => {
        func.apply(context, args);
      }, delay);
    };
  }
});
