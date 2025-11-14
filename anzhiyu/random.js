var posts=["archives/async+await/","archives/closure/","archives/generator/","archives/message-channel/","archives/iterator/","archives/event/","archives/proxy/","archives/prototype-chain/","archives/reflect/","archives/scope-chain/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };