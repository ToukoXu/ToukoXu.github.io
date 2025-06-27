var posts=["2021/04/03/closure/","2024/07/13/generator/","2013/07/13/hello-world/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };