(() => {
  const projects = [
    {
      label: '益智类',
      icon: 'https://cdn.jsdelivr.net/gh/toukoxu/picstore@main/images/gif/bulb.gif',
      items: [
        {
          title: '连连看',
          subtitle: '图案配对的消除游戏',
          link: 'link-link',
          icon: 'https://cdn.jsdelivr.net/gh/toukoxu/picstore@main/images/site/watermelon.svg',
        },
        {
          title: '数独',
          subtitle: '经典的逻辑数字游戏',
          link: 'sudoku',
          icon: 'https://cdn.jsdelivr.net/gh/toukoxu/picstore@main/images/site/grid.svg',
        },
      ],
    },
    {
      label: '动作类',
      icon: 'https://cdn.jsdelivr.net/gh/toukoxu/picstore@main/images/gif/rocket.gif',
      items: [
        {
          title: '飞机大战',
          subtitle: '飞行射击游戏',
          link: 'airplane-wars',
          icon: 'https://cdn.jsdelivr.net/gh/toukoxu/picstore@main/images/site/airplane.svg',
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
