docMap.fixButtons = function(){
  // Disable + button if there's no space for an extra pane
  // FIXME: convenient, but misplaced bit:
  var addButtons = $(".TBaddPaneButton");
  $("#test").remove();
  var check = DOMDiv("test", "test", "Maximum: "+window.screen.availWidth
                     +"px, Current: "+ this.clientWidth()+"px, Projected: "
                     +(this.clientWidth()+maxWidth) +"px");
  document.body.appendChild(check);
  check.style.right=5+"px";
  check.style.top=0;
  check.style.position="fixed";
  check.style.backgroundColor="rgba(255, 255, 255, 0.8)";
  if(window.screen.availWidth < this.clientWidth()+maxWidth){
    // not enough space
    addButtons.menu("collapseAll", null, true);
    addButtons.menu("disable");
    addButtons.attr("title", "Your screen is not wide enough to add another view.");
  } else {
    addButtons.menu("enable");
    $(".ui-icon-plus").removeClass("inactive");
    addButtons.attr("title", "");
  }
};
docMap.clientWidth = function(){
  var maxr = 0;
  for(var p=0; p<this.panes.length; p++){
    maxr = Math.max(maxr, this.panes[p][1].getBoundingClientRect().right);
  }
  return maxr;
};
//docMap = new docMapping();