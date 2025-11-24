var posts=["archives/async+await/","archives/generator/","archives/closure/","archives/event/","archives/message-channel/","archives/iterator/","archives/proxy/","archives/reflect/","archives/prototype-chain/","archives/scope-chain/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };