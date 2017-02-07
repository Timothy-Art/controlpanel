$(document).ready(function(){
  $("body").on("click", ".side-panel > div > i", function(e){
    ele = e.currentTarget.parentNode.parentNode.id;
    console.log(ele);
    $("#"+ele).toggleClass("side-panel-active");

  })
});
