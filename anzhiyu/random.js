var posts=["2013/07/13/hello-world/","2024/07/13/generator/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };