var posts=["2021/04/03/closure/","2024/07/11/generator/","2022/02/01/event/","2024/07/13/async&await/","2024/08/15/proxy/","2024/08/14/reflect/","2024/06/14/iterator/","2021/03/16/scope-chain/","2024/06/23/message-channel/","2021/05/02/prototype-chain/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };