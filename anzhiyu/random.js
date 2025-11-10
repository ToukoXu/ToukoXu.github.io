var posts=["archives/async+await/","archives/closure/","archives/event/","archives/generator/","archives/iterator/","archives/message-channel/","archives/prototype-chain/","archives/reflect/","archives/proxy/","archives/scope-chain/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };