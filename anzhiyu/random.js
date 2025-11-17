var posts=["archives/event/","archives/async+await/","archives/closure/","archives/generator/","archives/iterator/","archives/message-channel/","archives/prototype-chain/","archives/proxy/","archives/reflect/","archives/scope-chain/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };