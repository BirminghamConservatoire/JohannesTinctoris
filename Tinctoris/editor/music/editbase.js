/**
 * @fileoverview Contains functions dedicated to the Workinput
 * @namespace editor/music/editbase
 */

editorMode = true;
standaloneEditor = true;
wrapWidth = 690;
//exWidth = 660;

/** @function 
 * @memberof editor/music/editbase
 * @summary return function for changing pitch of [object] by [d] steps */
function pitchOrHeightShift(object, d){
  // return function for changing pitch of [object] by [d] steps
  var t = object;
  return function (e){
    if(typeof(t.pitch) != "undefined" && t.pitch){
      t.pitch = notes[notes.indexOf(t.pitch)+d];
      t.staffPos = staffPosFromPitchString(t.pitch);
    } else {
      t.staffPos += d;
    }
    var code = document.getElementById("code");
    var scroll = $(code).scrollTop();
    code.value = doc.toText();
    $(code).scrollTo(scroll);
    t.example.draw(t.example.SVG, true);
    $(".updown").remove();
  };
}

/** @function 
 * @memberof editor/music/editbase
 * @summary edit object */
function editObject (object){
  return function(e){
    object.edit(e);
  };
}

/** @function 
 * @memberof editor/music/editbase
 * @summary shiftHoverToShift */
function shiftHoverToShift (object, d){
  if(typeof(d)=="undefined" || !d) d=1;
  var t = object;
  return function (e){
    if(e.shiftKey){
      UpDown(t, d, e);
    }
  };
}
/** @function 
 * @memberof editor/music/editbase
 * @summary hoverOutShiftChecked */
function hoverOutShiftChecked (){
  return function(e){
    if(e.shiftKey){
      $(document).keyup(function(e){
          if(!e.shiftKey) {
            $(".updown").remove();
            $(document).unbind(e);
          }
      });
    } else {
      $(".updown").remove();
    }
  };
}

/** @function 
 * @memberof editor/music/editbase
 * @summary Provide height shifting buttons for [object] near mouse pointer */
function UpDown(object, d, event){
  // Provide height shifting buttons for [object] near mouse pointer
  $(".updown").remove();
  var buttonarea = DOMDiv("updownbg updown buttoncircle", false, false);
  var uparrow = DOMDiv("updown up miscbutton", "uparrow", DOMSpan(false, false, "↑"));
  var downarrow = DOMDiv("updown down miscbutton", "downarrow", DOMSpan(false, false, "↓"));
  document.getElementById("rendered").appendChild(buttonarea);
  buttonarea.appendChild(uparrow);
  buttonarea.appendChild(downarrow);
  // document.body.appendChild(uparrow);
  // document.body.appendChild(downarrow);
  var l = $(object.domObj).offset().left;
  var t = $(object.domObj).offset().top;
  var ow = object.domObj.getBBox().width;
  var oh = object.domObj.getBBox().height;
  var w = $(buttonarea).width();
  var h = $(buttonarea).height();
//  alert([l, t, ow, oh]);
  // centre circle on item's centre;
  buttonarea.style.left = l+(ow/2)-(w/2);
  buttonarea.style.top = t+(oh/2)-(h/2);
  // uparrow.style.top = Math.max(event.pageY-10, 0);
  // downarrow.style.top = Math.min(event.pageY+10, window.innerHeight);
  // uparrow.style.left = event.pageX+2;
  // downarrow.style.left = event.pageX+2;
  $(uparrow).click(pitchOrHeightShift(object, d));
  $(downarrow).click(pitchOrHeightShift(object, -d));
}

var domobj = [];

/** @function 
 * @memberof editor/music/editbase
 * @summary grabs DOM objects, currently content div */
function grabdomobjects(){
  domobj['Content'] = document.getElementById("content");
}
