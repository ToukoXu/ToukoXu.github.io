var posts=["archives/async+await/","archives/closure/","archives/event/","archives/iterator/","archives/message-channel/","archives/generator/","archives/prototype-chain/","archives/proxy/","archives/reflect/","archives/scope-chain/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };