function dialogueBoxFloat() {
  if(document.getElementById('buttonbox')){
    $('#buttonbox').empty();
    return document.getElementById('buttonbox');
  } else {
    var div = DOMDiv('dialoguebox', 'buttonbox', false);
    document.body.appendChild(div);
    return div;
  }
}

function imageButton(id, callback, src, selected){
  var button = DOMDiv(selected ? "uibutton selected" : "uibutton", false,
                      DOMDiv(false, false, src));
  button.onclick = callback;
  return button;
}

function textButton(id, cname, callback, text, selected){
  var button = DOMDiv(selected ? "uibutton selected" : "uibutton", false,
                      DOMSpan(cname, false, text));
  button.onclick = callback;
  return button;
}

function SVGButton(callback, svg, selected){
  var button = DOMDiv(selected ? "uibutton selected" : "uibutton", false, svg);
  button.onclick = callback;
  return button;  
}

function cancelButton(){
  return textButton("cancelButton", "textbutton", clearButtons, 
    "Cancel", false);
}

function clearButtons(){
  $('#buttonbox').remove();
}

function boxHeight(n){
  // Given a a grid with n members, what width and height gives the
  // nicest arrangement of members?
  // For now at least, my assumption is that we want to
  // minimise travel, but will accept more horizontal than vertical
  // movement (partly because I'm allowing movement left, right and
  // down, but not up). So, assume
  //   width = 2 * height AND width x height = n
  return Math.round(Math.sqrt(n/2));
}

function buttonBox(buttons, x, y, extras){
  var box = dialogueBoxFloat();
  var height = boxHeight(buttons.length);
  var width = Math.ceil(buttons.length/height);
  var row,cell;
  var i=0;
  for(var rowi=0; rowi<height; rowi++){
    row = DOMDiv("buttonrow", false, false);
    box.appendChild(row);
    for(var coli=0; coli<width; coli++){
      cell=DOMDiv("buttoncell", false, false);
      row.appendChild(cell);
      cell.appendChild(buttons[i]);
      i++;
      if(i>buttons.length) break;
    }
  }
  row = DOMDiv("buttonrow extrarow", false, false);
  box.appendChild(row);
  for(i=0; i<extras.length; i++){
    cell=DOMDiv("buttoncell", false, false);
    row.appendChild(cell);
    cell.appendChild(extras[i]);
  }
  cell=DOMDiv("buttoncell", false, false);
  row.appendChild(cell);
  cell.appendChild(cancelButton());
  box.style.top = Math.min(y, window.innerHeight - box.offsetHeight);
  box.style.left = Math.max(0, x - (box.offsetWidth/2));
  return box;
}

///////////////////
// Specifics

function durationSet(replaces){
  var buttons = [];
  var button, value;
  var durations = ["M", "L", "B", "S", "m", "s", "f"];//, "p", "v"];
  for(var i=0; i<durations.length; i++){
    value = durations[i];
    if(replaces.rhythm==value && !replaces.flipped){
      button = textButton(false, "symbolbutton duration "+value+" "+currentSubType, clearButtons,
                        baseDictionary[currentSubType][value][0], true);
    } else {
      button = textButton(false, 
        "symbolbutton duration "+value+" "+currentSubType, 
        function(v) {
          return function(e){
            replaces.rhythm = v;
            replaces.flipped = false;
            var code = document.getElementById("code");
            var scroll = $(code).scrollTop();
            code.value = doc.toText();
            $(code).scrollTo(scroll);
//            replaces.draw();
            replaces.example.draw(replaces.example.SVG, true);
            clearButtons();
          };
        }(value),
        baseDictionary[currentSubType][value][0], false);
    }
    $(button).data("duration", value);
    $(button).data("note", replaces);
    buttons.push(button);
    // ... and flipped
    if(value!="B" && value!="S"){
      if(replaces.rhythm==value && replaces.flipped){
        button = textButton(false, "symbolbutton duration -"+value+" "+currentSubType, clearButtons,
          flippedDictionary[currentSubType][value][0], true);
      } else {
        button = textButton(false, 
          "symbolbutton duration -"+value+" "+currentSubType, 
          function(v) { 
            return function(e){
              replaces.rhythm = v;
              replaces.flipped = true;
              var code = document.getElementById("code");
              var scroll = $(code).scrollTop();
              code.value = doc.toText();
              $(code).scrollTo(scroll);
//            replaces.draw();
            replaces.example.draw(replaces.example.SVG, true);
              clearButtons();
            };}(value),
            flippedDictionary[currentSubType][value][0], false);
      }
      $(button).data("duration", "-"+value);
      $(button).data("note", replaces);
      buttons.push(button);
    }
  }
  return buttons;
}

function durationSelector(note, x, y){
  return buttonBox(durationSet(note), x, y, false); 
}

// Chant shapes

function chantShapeCallback(value, note){
  if(note.rhythm == value){
    return clearButtons;
  } else {
    return function (n, v){
      return function(e){
        note.rhythm = v;
            var code = document.getElementById("code");
            var scroll = $(code).scrollTop();
            code.value = doc.toText();
            $(code).scrollTo(scroll);
            note.example.draw(note.example.SVG, true);
            clearButtons();
      };
    }(note, value);
  }
}

function chantShapeSet(note){
  var buttons = [];
  var orastral = rastralSize;
//  foo = true;
  rastralSize = 30;
  // l first
  SVG = svg(30, 30);
  drawRhombus(10,15,false, false, false);
  buttons.push(SVGButton(chantShapeCallback("l", note), SVG, note.rhythm=="l"));
  // now p
  SVG = svg(30, 30);
  drawChantBox(10,15,false, false, false, false, 0);
  buttons.push(SVGButton(chantShapeCallback("p", note), SVG, note.rhythm=="p"));
  // and v
  SVG = svg(30,30);
  drawChantBox(10,15,false, true, false, false, 0);
  buttons.push(SVGButton(chantShapeCallback("v", note), SVG, note.rhythm=="v"));
  rastralSize = orastral;
  return buttons;
}

function chantShapeSelector(note, x, y){
  return buttonBox(chantShapeSet(note), x, y, false); 
}
