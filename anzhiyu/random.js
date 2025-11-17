var posts=["archives/async+await/","archives/closure/","archives/event/","archives/generator/","archives/message-channel/","archives/prototype-chain/","archives/iterator/","archives/proxy/","archives/reflect/","archives/scope-chain/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };