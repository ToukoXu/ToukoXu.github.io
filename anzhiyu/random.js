var posts=["archives/async+await/","archives/closure/","archives/generator/","archives/event/","archives/message-channel/","archives/iterator/","archives/prototype-chain/","archives/proxy/","archives/reflect/","archives/scope-chain/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };