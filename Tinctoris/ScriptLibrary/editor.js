/**
 * @fileoverview Contains code for GUIEditor and Workinput
 * @namespace editor
 */

 /** @function adjustWidth
  * @memberof editor
  */
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

/** @function toggleWrapping
 * @memberof editor
 */
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

/** @function setSpacing
 * @memberof editor
 */
function setSpacing(value){
  var content = document.getElementById("content");
  $(content).toggleClass("oneandahalfspacing", value==1.5);
  $(content).toggleClass("doublespacing", value==2);
}

$(document).ready(function(){
//  $("#code").keyup(function(){
  /** @function refreshFromCode
   * @summary Parses the text from the editor pane and draws the content into the view pane
   * @memberof editor
   */
  function refreshFromCode(){
    grabdomobjects();
    var code = document.getElementById("code").value;
    if(!doc || code.value!==doc.text){
      try {
        var content = document.getElementById("content");
        var tp = content.scrollTop;
				if(standaloneEditor){
					try {
						doc = new MusicHolder(code, document.getElementById("content"));
					}
					catch(e){
						console.log(e.stack, "error parsing", doc);
					}
					try {
						doc.draw();
					}
					catch(e){
						console.log(e.stack);
						console.log("error drawing",state, eventi, doc.example);
					}
				} else {
					doc = new TreatiseDoc(code, document.getElementById("content"));
					doc.draw();
				}
        content.scrollTop = tp;
      } catch (x) {
        // Do nothing if it breaks
        console.log(x.stack, "error message 2");
//        alert(x+" -- unneccesary error message 2");
      }
    }
  }
  $("#wrapspan").hide();
  
  /** @memberof editor */
  $("#reparse").click(refreshFromCode);
  /** @see easyRhythms */
	$("#trivial").click(() => curDoc.example.easyRhythms());
  $("#code").keypress(function(e){
//  $("#code").keydown(function(e){
    if(e.metaKey && !e.shiftKey && e.which===61){
      refreshFromCode();
      return false;
    }
    return true;
  });
});
