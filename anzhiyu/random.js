var posts=["2021/04/03/closure/","2024/07/13/generator/","2022/02/01/event/","2024/06/23/messageChannel/","2024/07/13/async&await/","2024/08/15/proxy/","2024/08/14/reflect/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };