var posts=["archives/async+await/","archives/event/","archives/closure/","archives/generator/","archives/message-channel/","archives/prototype-chain/","archives/reflect/","archives/iterator/","archives/proxy/","archives/scope-chain/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };