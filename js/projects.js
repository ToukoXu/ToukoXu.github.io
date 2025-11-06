(() => {
  const projects = [
    {
      label: '图片工具',
      icon: 'https://cdn.jsdelivr.net/gh/toukoxu/picstore@main/images/gif/picture.gif',
      items: [
        {
          title: '图片与Base64转换工具',
          subtitle: '轻松实现图片与Base64编码之间的相互转换',
          link: 'image-base64',
          icon: 'https://cdn.jsdelivr.net/gh/toukoxu/picstore@main/images/site/base64.svg',
        },
        {
          title: '图片批量转WebP格式工具',
          subtitle: '快速将图片转换为现代WebP格式，减小文件大小',
          link: 'image-webp',
          icon: 'https://cdn.jsdelivr.net/gh/toukoxu/picstore@main/images/site/webp.svg',
        },
        {
          title: '图片批量压缩工具',
          subtitle: '快速压缩多张图片，减小图片大小',
          link: 'image-compress',
          icon: 'https://cdn.jsdelivr.net/gh/toukoxu/picstore@main/images/site/images.svg',
        },
      ],
    },
    {
      label: '开发工具',
      icon: 'https://cdn.jsdelivr.net/gh/toukoxu/picstore@main/images/gif/code.gif',
      items: [
        {
          title: '多语言格式化与文本对比工具',
          subtitle: '支持多种编程语言和格式化功能，实时比较文本差异',
          link: 'text-diff',
          icon: 'https://cdn.jsdelivr.net/gh/toukoxu/picstore@main/images/site/diff.svg',
        },
        {
          title: 'PX与REM转换工具',
          subtitle: '轻松在像素(px)和相对单位(rem)之间进行转换',
          link: 'px-rem',
          icon: 'https://cdn.jsdelivr.net/gh/toukoxu/picstore@main/images/site/ruler.svg',
        },
        {
          title: '时间戳转换工具',
          subtitle: '轻松在时间戳和多种日期时间格式之间转换',
          link: 'timestamp',
          icon: 'https://cdn.jsdelivr.net/gh/toukoxu/picstore@main/images/site/time.svg',
        },
      ],
    },
    {
      label: '金融工具',
      icon: 'https://cdn.jsdelivr.net/gh/toukoxu/picstore@main/images/gif/star.gif',
      items: [
        {
          title: '金融计算器',
          subtitle: '多种收益计算功能，轻松分析投资回报',
          link: 'finance-calculator',
          icon: 'https://cdn.jsdelivr.net/gh/toukoxu/picstore@main/images/site/calculator.svg',
        },
      ],
    },
  ];

  const projectsContainer = document.getElementById('projects-container');
  const projectTypeTemplate = document.getElementById('project-type-template');
  const projectItemTemplate = document.getElementById('project-item-template');

  // 添加项目类型
  function addProjectType(project) {
    const projectTypeClone = projectTypeTemplate.content.cloneNode(true);
    const projectTypeItem = projectTypeClone.querySelector('.project-type-item');
    const projectItem = projectTypeClone.querySelector('.project-item');

    // 设置图标和标签
    const icon = projectTypeItem.querySelector('.project-type-icon');
    icon.src = project.icon;
    icon.alt = project.label;

    const label = projectTypeItem.querySelector('.project-type-label');
    label.textContent = project.label;

    // 添加项目
    project.items?.forEach((item) => {
      const projectItemClone = projectItemTemplate.content.cloneNode(true);
      const linkElement = projectItemClone.querySelector('.tag-Link');
      linkElement.href = item.link;
      projectItemClone.querySelector('.tag-link-left').style.backgroundImage = `url(${item.icon})`;
      projectItemClone.querySelector('.tag-link-title').textContent = item.title;
      projectItemClone.querySelector('.tag-link-sitename').textContent = item.subtitle;

      projectItem.appendChild(projectItemClone);
    });

    projectsContainer.appendChild(projectTypeClone);
  }

  // 初始化项目类型列表
  projects.forEach((project) => {
    addProjectType(project);
  });
})();
