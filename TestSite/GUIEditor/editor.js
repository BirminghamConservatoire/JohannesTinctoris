function adjustWidth(){
  // arbitrary extra width on rendered ensures a nice background.
  document.getElementById("rendered").style.width = (Number(wrapWidth)+100)+"px";
  try {
    doc = new TreatiseDoc(document.getElementById("code").value, document.getElementById("content"));
    doc.draw();
//    document.getElementById("content").style.width = (Number(wrapWidth)+65)+"px";
  } catch (x) {
    // Do nothing if it breaks
    //        alert(x+" -- unneccesary error message 2");
  }
}

function togglewrapping(box){
  var ws = $("#wrapspan");
  if(box.checked){
    ws.show();
    wrapWidth = 600;
    adjustWidth();
  } else {
    wrapWidth = false;
    ws.hide();
  }
}
function setSpacing(value){
  var content = document.getElementById("content");
  $(content).toggleClass("oneandahalfspacing", value==1.5);
  $(content).toggleClass("doublespacing", value==2);
}

$(document).ready(function(){
//  $("#code").keyup(function(){
  function refreshFromCode(){
    var code = document.getElementById("code").value;
    if(!doc || code.value!==doc.text){
      try {
        doc = new TreatiseDoc(code, document.getElementById("content"));
        doc.draw();
      } catch (x) {
        // Do nothing if it breaks
//        alert(x+" -- unneccesary error message 2");
      }
    }
  }
  $("#wrapspan").hide();
  
  $("#reparse").click(refreshFromCode);
  $("#code").keypress(function(e){
//  $("#code").keydown(function(e){
    if(e.metaKey && !e.shiftKey && e.which===61){
      refreshFromCode();
      return false;
    }
    return true;
  });
});
