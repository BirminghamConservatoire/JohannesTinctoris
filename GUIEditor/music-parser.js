function MusicExample(){
  this.objType = "MusicExample";
  this.code = string;
  this.SVG = false;
  this.context = false;
  this.events = [];
  this.comments = [];
  this.drawCount = 0;
  this.starts = pointer;
  this.swidth = false;
  this.classes = false;
  currentExample = this;
  initialStaffStar = false;
  var next;
  var length;
  currentClef = false;
  consumeSpace();
  this.parameters = getParameters();
  currentInfo = this.parameters;
  this.w2 = [];
  consumeSpace();
  while(string.length >0){
    length = string.length;
    next = nextEvent();
    if(next){
      if(currentInfo){
        if(infop(next)){
          currentInfo.extras.push(next);
          next.params = currentInfo;
        } else {
          currentInfo = false;
        }
      } else if(next.objType == "Staff"){
        currentInfo = next;
      }
      this.events.push(next);
    } else if(length == string.length){
      // We're stuck in a loop. Try to escape
      string = string.substring(1);
    }
    consumeSpace();
  }
  this.width = function(){
    if(this.swidth) {
      return this.swidth;
    } else {
      this.setSysWidths();
      return this.swidth;
      var w = 0;
      for(var e=0;e<this.events.length; e++){
        var w2 = this.events[e].startX ? this.events[e].startX : 0;
        w2 += typeof(this.events[e].width) != "undefined" ? this.events[e].width() : 0;
        w = Math.max(w, w2);
      }
      this.swidth = w;
      return w;
    }
  };
  this.commentsDiv = function(){
    return new ExampleComments(this.comments);
  };
  this.commentsTip = function(x, y){
    for(var i=0; i<this.comments.length; i++){
      if(x>=this.comments[i].startX && x<=this.comments[i].endX
         && y>=this.comments[i].endY && y<=this.comments[i].startY){
        return Tooltip(this.comments[i].content);
      } 
    }
    removeTooltip();
    return false;
  };
  this.height = function(){
    // FIXME: clearly stupid
    var height = rastralSize * 
      (typeof(this.parameters.staff) == "undefined" ? 1 : (this.parameters.staff.trueLines() + 4));
    for(var i=0; i<this.events.length; i++){
      if(this.events[i].objType == "Staff"){
        height += rastralSize * 9 + 5;
        }
    }
    return height;
  };
  this.setSysWidths = function(){
    sysWidths = [rastralSize + this.parameters.width()];
    this.swidth = 0;
//    var x = lmargin +rastralSize/2;
    for(eventi=0; eventi<this.events.length; eventi++){
      if(this.events[eventi].objType == "Staff" 
         || (wrapWidth && sysWidths[sysWidths.length-1] >= wrapWidth - rastralSize * 2 - lmargin)){
        sysWidths[sysWidths.length-1] += rastralSize * 2;
        if(sysWidths[sysWidths.length-1]+lmargin>SVG.width){
          sysWidths[sysWidths.length-1] = SVG.width - lmargin;
        }
        this.swidth = Math.max(this.swidth, sysWidths[sysWidths.length-1]);
        sysWidths.push(rastralSize);
      } else {
        if(isNaN(this.events[eventi].width())){
          alert("Width estimation failed: "+ this.events[eventi].objType
               + " gives: " + this.events[eventi].width());
        }
        // x+=this.events[eventi].width();
        // drawVerticalLine(x+0.5, 0, 250, 2, "#1F6");
        sysWidths[sysWidths.length -1] +=this.events[eventi].width();
      }
    }
    this.swidth = Math.max(this.swidth, sysWidths[sysWidths.length-1]);
  };
  this.toText = function(){
    var text = this.parameters.toText();
    for(var i=0; i<this.events.length; i++){
      if(i>0) text += " ";
      if(typeof(this.events[i].toText) == "undefined") 
        alert("error - "+JSON.stringify(this.events[i]));
      text += this.events[i].toText();
    }
    text += "</example>";
    return text;
  };
  this.draw = function(exampleSVG, force){
//    alert(JSON.stringify(this));
    if(exampleSVG != this.SVG) alert("ok");
    // FIXME: 14/10/12 If this shows no alerts, remove this and all
    // svg passing
    if(this.drawCount>1 && !force){
      return;
    }
    this.drawCount++;
    currentClef = false;
    currentExample = this;
    var st = this.parameters.staff;
    currentLinecount = st ? st.trueLines() : 1;
    currentStaffColour = st ? st.trueColour() : "black";
    curx = lmargin;
    cury = topMargin;
    currentType = this.parameters.notation;
    currentSubType = this.parameters.notationSubtype;
    currentRedline = false;
    SVG = exampleSVG;
    this.SVG = SVG; // ??
//FIXME:    context = SVG.getContext("2d");
    clearSVG(SVG);
    svgCSS(SVG, cssPath("jt-editor-v.css"));
    svgCSS(SVG, cssPath("print.css"));
    this.w2 = [];
    currentSystems = [];
    var fontstring = Math.round(3 * rastralSize * prop) +"pt ArsNovaVoidRegular";
    context.font = fontstring;
//    this.setSysWidths();
    localWidth = exWidth;
    sysNo = 1;
    curx += rastralSize / 2;
    cury += currentLinecount * rastralSize;
    var svgold = false;
    var texted = false;
    var maxx = false;
    currentSystems.push(svgGroup(SVG, "Stafflines", false));
    this.parameters.draw();
    this.classes = new Classes();
    for(eventi = 0; eventi<this.events.length; eventi++){
      if(wrapWidth && curx>=wrapWidth){
        sysBreak2();
        sysBreak();
        currentClef.draw();
        this.SVG.height.baseVal.value = this.SVG.height.baseVal.value 
          + (rastralSize*5)+5+(currentLinecount*rastralSize);
      }
      if(this.events[eventi].objType && !this.events[eventi].params) {
        try {
          if(this.classes.render()){
            svgold = SVG;
            SVG = svgGroup(SVG, this.classes.classString(), false);
          }
          this.events[eventi].draw(curx, cury);          
          if(svgold) SVG = svgold;
          svgold = false;
        } catch (x) {
        }
        if(this.events[eventi].objType == "TextUnderlay"){
          texted = true;
        }
      }
    }
    sysBreak2(true);
    for(var w=0; w<this.w2.length; w++){
      drawSystemLines(currentSystems[w], this.w2[w][2], this.w2[w][1], lmargin, 
        this.w2[w][0], this.w2[w][3], this.SVG);
        maxx = Math.max(this.w2[w][0], maxx);
    }
    SVG.height.baseVal.value = SVG.getBoundingClientRect().height + (texted ? 25 : 5);
    SVG.width.baseVal.value = maxx + (texted ? 25 : 5);
  };
}

function nextEvent() {
  switch(string.charAt(0)){
    case "_":
      string = string.substring(1);
      return new NegativeSpace();
    case "[":
      return nextColRef();
    case "|":
      return nextBarline();
    case "<":
      return nextTaglike();
    case "{":
      if(string.substring(0,5) == "{var="){
        return nextChoice();
      } else {
        return nextInfo();
      }
    case "b":
    case "h":
    case "x":
      return nextSolmSign();
    case "P":
      return nextRest();
    case "-":
      string = string.substring(1);
      var note = nextNote();
      note.flipped = true;
      return note;
    case ".":
      return nextDot();
    case "M":
    case "L":
    case "B":
    case "S":
    case "m":
    case "s":
    case "f":
    case "F":
    case "^":
      return nextNote();
    case "p":
    case "v":
    case "l":
      return nextChantNote();
    case "c":
      return nextCustos();
    case "*":
      return nextComment();
  }
  return false;
}

function nextColRef(){
  var col = new ColumnStart();
  var startLength = string.match(/\[\-*/).length;
  var loc = string.search(/\-*\]/);
  var endLength = loc > -1 ? string.match(/\-*\]/).length : 1;
  if(loc == -1){
    return false;
  } else if (loc == 1) {
    string = string.substring(loc+endLength);
    // This means that we have [-]
    return new PositiveSpace();
  } else {
    col.id = string.substring(startLength+1, loc);
    string = string.substring(loc+endLength);
    return col;
  }
}

function nextComment(){
  var comment = new Comment();
  var end = string.indexOf("**", 2);
  if(end < 2){
    complaint.push("Unclosed comment"+string.substring(0, 10));
  }
  comment.content = string.substring(2, end);
  string = string.substring(end+2);
  currentExample.comments.push(comment);
  return comment;
}


function nextBarline(){
  var bar = new Barline();
  string = string.substring(1);
  while(string.charAt(0)=="|"){
    bar.multiple++;
    string = string.substring(1);
  }
  var staffPos = getStaffPos();
  if(staffPos || staffPos==0){
    bar.start = staffPos;
    if(string.charAt(0)=="-"){
      string = string.substring(1);
      staffPos = getStaffPos();
      bar.end = staffPos;
    }
  }
  return bar;
}

function nextSolmSign(){
  var solm = new SolmizationSign();
  var nextChar = 0;
  if(string.charAt(nextChar) === "^"){
    solm.sup = true;
    nextChar++;
  }
  solm.symbol = string.charAt(nextChar);
  string = string.substring(nextChar+1);
  // solm.staffPos = getStaffPos();
  var pitch = /^([A-g])\1{0,2}/.exec(string);
  if(pitch){
    solm.pitch = pitch[0];
    string = string.substring(pitch.length);
  } else {
    solm.staffPos = getStaffPos();
  }
  return solm;
}

function nextRest(){
  string = string.substring(1);
  var rhythm = getRhythm();
  if(rhythm == "L"){
    return nextLongRest();
  } else if(rhythm == "M"){
    // Not legal. Push it back onto string and reparse
    string = "M"+string;
    return false;
  } else if(rhythm){
    var rest = new Rest();
    rest.rhythm =rhythm;
    rest.staffPos = getStaffPos();
    return rest;
  } else {
    return false;
  }
}

function nextLongRest(){
  var start = getStaffPos();
  var rest = false;
  if(start && consumeIf("-")){
    var end = getStaffPos();
    if(end){
      if(consumeIf("x")){
        rest = new MaxRest();
        rest.multiple = consumeIf(/[0-9]/) || 2;
      } else {
        rest = new LongRest();
      }
      rest.start = start;
      rest.end = end;
    }
  }
  return rest;
}

function nextNote(){
  var sup = consumeIf(/\^/);
  var obj = new Note;
  obj.rhythm = getRhythm();
  obj.sup = sup;
  obj = getAndSetPitch(obj);
  return obj;
}

function nextChantNote(){
  var obj = new ChantNote;
  obj.rhythm = consumeIf(/^[npvl]/);
  obj = getAndSetPitch(obj);
  return obj;
}

function nextCustos(){
  var obj = new Custos();
  string = string.substring(1);
  return getAndSetPitch(obj);
}

function nextDot(){
  var obj = new Dot();
  string = string.substring(1);
  // If pitched
  // return getAndSetPitch(obj);
  // Otherwise
  obj.staffPos = getStaffPos();
  return obj;
}

function nextTaglike(){
  var tagend = string.indexOf(">");
  if(tagend == -1){
    return false;
  }
  var tag = string.substring(1, tagend);
  string = string.substring(tagend+1);
  switch(tag){
    case "neume":
      return nextNeume();
    case "lig":
      return nextLigature();
    case "red":
      if(string.indexOf("</red>")==-1){
        complaint.push("Missing close tag for <red> around "+string);
      }
      return new RedOpen();
    case "/red":
      return new RedClose();
    case "blue":
      if(string.indexOf("</blue>")==-1){
        complaint.push("Missing close tag for <blue> around "+string);
      }
      return new BlueOpen();
    case "/blue":
      return new BlueClose();
    case "redline":
      if(string.indexOf("</redline>")==-1){
        complaint.push("Missing close tag for <red> around "+string);
      }
      return new RedlineOpen();
    case "/redline":
      return new RedlineClose();
    case "void":
      return new VoidOpen();
    case "/void":
      return new VoidClose();
    case "text":
      var thingy = nextText();
      if(thingy){
        return thingy;
      } 
  }
  return false;
}

function nextNeume(){
  var end = string.indexOf("</neume>");
  if(end == -1){
    complaint.push("Unclosed neume at: " + string);
    return false;
  }
  var returnString = string.substring(end+8);
  var neume = new Neume();
  var pitch = false;
  var staffPos = false;
  var strsize = 0;
  var next = false;
  string = string.substring(0,end);
  consumeSpace();
  while(string.length != 0){
    strsize = string.length;
    if(consumeIf("<obl>")){
      next = nextObliqueNeume();
    } else if(string.substring(0, 6)=="<text>"){
      next = nextText();
    } else if (string.substring(0,2)=="**"){
      next = nextComment();
    } else {
      next = new NeumeItem();
      next.sup = consumeIf("^") ? true : false;
      next.ltail = consumeIf("t") ? true : false;
      next = getAndSetPitch(next);
      next.rtail = consumeIf("t") ? true : false;
    }
    if(next){
      neume.members.push(next);
      next = false;
    }
    consumeSpace();
    if(string.length == strsize){
      // stuck in a loop. Break out somehow
      complaint.push("Broken at '"+string.substring(0, 10)
                      +" in neume processing.</br>");
      string = string.substring(1);
    }
  }
  string = returnString;
  return neume;
}

function nextObliqueNeume(){
  var end = string.indexOf("</obl>");
  if(end == -1){
    complaint.push("Please repair unmatched <obl> somewhere near: "+string);
    string = "";
    return false;
  }
  var oblique = new ObliqueNeume();
  var returnString = string.substring(end+6);
  var ni = false;
  var strsize = string.length;
  string = string.substring(0, end);
  consumeSpace();
  while(string.length != 0) {
    if(consumeIf("<text>")){
      oblique.texts[oblique.members.length-1] = nextText();
    } else if(string.substring(0,2) == "**"){
      oblique.comments[oblique.members.length-1] = nextComment();
    } else if(string.substring(0,1) == "{"){
      // FIXME: do stuff
    } else {
      ni = new NeumeItem();
      ni.ltail = consumeIf("t") ? true : false;
      ni = getAndSetPitch(ni);
      ni.rtail = consumeIf("t") ? true : false;
      oblique.members.push(ni);
    }
    consumeSpace();
    if(string.length == strsize){
      // stuck in a loop. Break out somehow
      complaint.push("Broken at '"+string.substring(0, 10)
                      +" in neume processing.</br>");
      string = string.substring(1);
    }
      strsize = string.length;
  }
  string = returnString;
  return oblique;
}

function nextLigature(){
  var end = string.indexOf("</lig>");
  if(end == -1){
    complaint.push("Please repair somewhere near: "+string);
    string = "";
    return false;
  }
  var brokentest1 = string.search(/<lig>/);
  if(brokentest1!=-1 && brokentest1<end){
    complaint.push("Please repair somewhere near: "+string);
    return false;
  }
  var ligature = new Ligature();
  var returnString = string.substring(end+6);
  string = string.substring(0, end);
  ligature.str = string;
  consumeSpace();
  var strsize = string.length;
  var next = false;
  var prevevent = false;
  while(strsize!=0){
    if(consumeIf("<text>")){
      next = nextText();
    } else if(consumeIf("<obl>")){
      next = nextOblique(ligature);
    } else if(string.substring(0,2) == "**"){
      next = nextComment();
      next = new LigatureComment(next);
    } else if(string.charAt(0)=="<") {
      complaint.push("Unexpected item in the tagging area: "+string);
      return false;
    } else if(string.substring(0,5)=="{var="){
      next = nextLigChoice(ligature);
    } else {
      next = nextNote();
      next = new LigatureNote(next);
    }
    if(next){
//      ligature.members.push(next);
      ligature.addElement(next);
    }
    consumeSpace();
    if(string.length == strsize){
      // stuck in a loop. Break out somehow
      complaint.push("Broken at '"+string.substring(0, 10)
                      +" in ligature processing.</br>");
      string = string.substring(1);
    }
    strsize = string.length;
  }
  string = returnString;
  return ligature;
}

function nextOblique(ligature){
  var end = string.indexOf("</obl>");
  if(end == -1){
    complaint.push("Please repair unmatched <obl> somewhere near: "+string);
    string = "";
    return false;
  }
  var oblique = new Oblique();
  oblique.ligature = ligature;
  var returnString = string.substring(end+6);
  string = string.substring(0, end);
  consumeSpace();
  var strsize = string.length;
  var next = false;
  while(strsize!=0){
    if(consumeIf("<text>")){
      oblique.texts[oblique.members.length-1] = nextText();
    } else if(string.substring(0,2) == "**"){
      oblique.comments[oblique.members.length-1] = nextComment();
    } else if(string.substring(0,1) == "{"){
      // FIXME: do stuff
      next = nextObliqueNoteChoice(oblique);
      oblique.extendMembers(next);
    } else {
      next = nextNote();
      if(next){
        next = new ObliqueNote(next, oblique.members.length, oblique);
        oblique.extendMembers(next);
      }
    }
    consumeSpace();
    if(string.length == strsize){
      string = string.substring(1);
    }
    strsize = string.length;
  }
  string = returnString;
  return oblique;
}

function nextText (){
  var end = string.indexOf("</text>");
  if(end == -1){
    return false;
  }
  var text = new TextUnderlay();
  var returnString = string.substring(end+7);
  string = string.substring(0, end);
  text.components = getSubText();
  string = returnString;
  return text;
}

function getSubText (){
  // parse contents of a <text></text> block or equivalently-syntaxed
  // thing (e.g. a variant)
  var components = [];
  var strsize = string.length;
  var next = false;
  var tagpos = string.indexOf("<");
  var commentpos = string.indexOf("**");
  var varpos = string.indexOf("{");
  while(strsize != 0){
    if(varpos!=-1 && (commentpos == -1 || varpos<commentpos) 
       && (tagpos ==-1 || varpos < tagpos)) {
      if(varpos) components.push(string.substring(0,varpos));
      string = string.substring(varpos);
      // FIXME: A variant inside a variant would spell madness, but
      // lets assume sanity for now
      components.push(nextTextChoice());
      // A variant can invalidate more or less anything that follows, so...
      varpos = string.indexOf("{");
      tagpos = string.indexOf("<"); // just to check it wasn't in the comment;
      commentpos = string.indexOf("**");
    } else {
      if(commentpos != -1 && (commentpos < tagpos || tagpos == -1)){
        components.push(string.substring(0,commentpos));
        string = string.substring(commentpos);
        components.push(nextComment());
        tagpos = string.indexOf("<"); // just to check it wasn't in the comment;
        commentpos = string.indexOf("**");
      }
      if(tagpos > 0){
        components.push(string.substring(0,tagpos));
        string = string.substring(tagpos);
      } else if (tagpos == -1) {
        components.push(string);
        return components;
      }
      next = getTag(consumeIf(/<[^>]*>/));
      if(next){
        if(next.objType.indexOf("Open") != -1
           // Open tag
           && !next.checkClose()){
          complaint.push("Missing close tag for "+next.objType+" around "+string);
        }
        components.push(next);
      }
      tagpos = string.indexOf("<");
    }
  }
  return components;
}

function getTag (tag){
  switch(tag){
    case "<red>":
      return new RedOpen();
    case "</red>":
      return new RedClose();
    case "<blue>":
      return new BlueOpen();
    case "</blue>":
      return new BlueClose();
    case "<redline>":
      return new RedlineOpen();
    case "</redline>":
      return new RedlineClose();
    case "<strikethrough>":
      return new StrikethroughOpen();
    case "</strikethrough>":
      return new StrikethroughClose();
    default:
      return false;
  }
}

function consumeParenthesis(){
  var openchar = string.charAt(0);
  //FIXME: assuming sanity
  var closechar = openchar == "{" 
                    ? "}" 
                    : openchar == "(" 
                        ? ")" 
                        : openchar == "<" ? ">" :
                            openchar == "[" ? "]" : false;
  if(!closechar) return false;
  var score = 1;
  for(var i=1; i<string.length; i++){
    if(string.charAt(i) == openchar) {
      score++;
    } else if(string.charAt(i) == closechar){
      score--;
      if(score == 0){
        var paren = string.substring(0, i+1);
        string = string.substring(i+1);
        return paren;
      }
    }
  }
  return false;
}

function parseMens(string){
  var obj = new MensuralSignature();
  if(!string || !string.length) return obj;
  var pointer = 0;
  if(string.charAt(0)==="^"){
    obj.sup = true;
    pointer++;
  }
  if(string.charAt(pointer)) {
    obj.signature = string.charAt(pointer);
  } else return obj;
  pointer++;
  if(string.charAt(pointer)) obj.staffPos = "0123456789ABCDEF".indexOf(string.charAt(pointer));
  return obj;
}

function parseMensOld(sig, pos){
  var obj = new MensuralSignature();
  if(!sig || sig === "0") return obj;
  obj.signature = sig.charAt(0);
  obj.staffPos = "0123456789ABCDEF".indexOf(pos);
  return obj;
}
function parseMensReading(fields){
  var mens;
  var signature = false;
  if(fields[0] !== "(om.)"){
    mens = new MensuralSignature();
  } else if(fields[0].length>1){
    mens = parseMens(fields[0]);
  } else{
    // This is an error. See if a blank works as a recovery strategy
    mens = new MensuralSignature();
  }
  for(var i=1; i<fields.length; i++){
    if(fields[i].charAt(0) === '"' || fields[i].substring(0, 3) === '(om'){
      return [fields.slice(i), new MReading(fields.slice(1, i), [mens], "")];
    }
  }
  return [false, new MReading(fields.slice(1, fields.length), [mens], "")];
}
function parseMensVar(fields){
  var obj = new MChoice();
  var nextM = parseMensReading(fields);
  fields = nextM[0];
  while(fields){
    obj.content.push(nextM[1]);
    nextM = parseMensReading(fields);
    fields = nextM[0];
  }
  obj.content.push(nextM[1]);
  return obj;
}

function parseSolm(signs){
  var solm, pitch, nextChar;
  var obj = new SolmizationSignature();
  if(!signs[0] || signs[0] === "0" || signs[0] === '"0"') return obj;
  for(var i=0; i<signs.length; i++){
    nextChar = 0;
    solm = new SolmizationSign();
    if(signs[i].charAt(0) == "^") {
      solm.sup = true;
      nextChar++;
    }
    solm.symbol = signs[i].charAt(nextChar);
    nextChar++;
    pitch = signs[i].substring(nextChar);
    if(/([A-g])\1{0,2}/.exec(pitch)){
      // This really is a pitch
      solm.pitch = pitch;
    } else {
      // staffpos
      solm.staffPos = "0123456789ABCDEF".indexOf(signs[i].charAt(nextChar));
    }
    if(solm.pitch || solm.staffPos != -1){
      obj.members.push(solm);
    }
  }
  return obj;
}
function parseSolmReading(fields){
  var solm = false, signs = [], start, finish, last, sigged;
  for(var i=0; i<fields.length; i++){
    if(sigged || sigged === 0){
      if(fields[i].charAt(0) =='"'){
        return [fields.slice(i), new MReading(fields.slice(sigged, i), [solm], "")];
      }
    } else {
      start = i==0 ? 1 : 0;
      finish = fields[i].length;
      if(fields[i].lastIndexOf('"')>0){
        finish = fields[i].lastIndexOf('"');
        last = true;
      }
      signs.push(fields[i].substring(start, finish));
      if(last){ 
        solm = parseSolm(signs);
        signs = [];
        sigged = i+1;
      }
    }
  }
  return [false, new MReading(fields.slice(sigged, fields.length), [solm], "")];
}
function parseSolmVar(fields){
  var next = false;
  var obj = new MChoice();
  var nextS = parseSolmReading(fields);
  fields = nextS[0];
  while(fields){
    obj.content.push(nextS[1]);
    nextS = parseSolmReading(fields);
    fields = nextS[0];
  }
  obj.content.push(nextS[1]);
  return obj;
}


function parseClefReading(fields){
  var clef = parseClef(fields[0].substring(1, fields[0].length-1));
  for(var i=1; i<fields.length; i++){
    if(fields[i].charAt(0) =='"'){
      return [fields.slice(i), new MReading(fields.slice(1, i), [clef], "")];
    }
  }
  return [false, new MReading(fields.slice(1, fields.length), [clef], "")];
}
function parseClefVar(fields){
  var obj = new MChoice();
  var nextC = parseClefReading(fields);
  fields = nextC[0];
  while(fields){
    obj.content.push(nextC[1]);
    nextC = parseClefReading(fields);
    fields = nextC[0];
  }
  obj.content.push(nextC[1]);
  currentClef = obj.content[0].content[0];
  return obj;
}
function parseClef(spec){
  if(!spec || spec === "0") return false;
  // FIXME: Why??
  var old = currentClef;
  var obj = new Clef();
  obj.type = spec.substring(0, spec.length - 1);
  obj.staffPos = "0123456789ABCDEF".indexOf(spec.charAt(spec.length - 1));
  if(obj.staffPos != -1 && obj.type.match(/(Gamma|C|F|G|E)/)){
    return obj;
  }
  currentClef = old;
  return false;
}

function parseStaff(spec){
  var staff = new Staff;
  var pointer = 0;
  var wit = [];
  var val;
  // First: lines
  if(spec[0].charAt(0)=='"'){
    staff.lines = new ValueChoice();
    while(pointer< spec.length && !colourp(spec[pointer])){
      val = linesp(spec[pointer]);
      pointer++;
      while(pointer< spec.length && !linesp(spec[pointer]) && !colourp(spec[pointer])){
        wit.push(spec[pointer]);
        pointer++;
      }
      staff.lines.addReading(wit, val, false);
      wit = [];
    }
  } else {
    // No variant
    staff.lines = linesp(spec[0]);
    pointer++;
  }
  // now colour
  if(spec[pointer].charAt(0)=='"'){
    staff.colour = new ValueChoice();
    while(pointer < spec.length){
      val = colourp(spec[pointer]);
      pointer++;
      while(!colourp(spec[pointer])){
        wit.push(spec[pointer]);
        pointer++;
      }
      staff.colour.addReading(wit, val, false);
      wit = [];
    }    
  } else {
    // No variant
    staff.colour = colourp(spec[pointer]);
  }
  return staff;
}
function linesp(string){
  return (!isNaN(parseInt(string)) && parseInt(string))
    || 
    (!isNaN(parseInt(string.substring(1, string.length-1)))
      && parseInt(string.substring(1, string.length-1)));
}
function colourp(string){
  return string.match(/(black|red|blind)/) ? string.match(/(black|red|blind)/)[0] : false;
}


function nextInfo(){
  var info = consumeParenthesis();
  var obj = false;
  if(info){
    var fields = info.match(/[^{}, :=]+/g);
    switch(fields[0]){
      case "mens":
        if(fields[1] && fields[2] && 
           (fields[1].charAt(0)==='"' || fields[2].charAt(0)==='"' ||
            fields[1].substring(0, 2)==='(o')){
          return parseMensVar(fields.slice(1));
        } else if(fields[1].length==2){
          // new format
          return parseMens(fields[1]);
        } else if(fields.length>1){
          return parseMens(fields[1], fields[2]);
        } else {
          return false;
        }
      case "solm":
        if(fields[1].charAt(0)=='"'){
          return parseSolmVar(fields.slice(1));
        } else return parseSolm(fields.slice(1));
      case "clef":
        if(fields.length>2){
          if(fields[1]=="var") {
            return parseClefVar(fields.slice(2));
          } else if (fields[1].charAt(0) == '"'){
            return parseClefVar(fields.slice(1));
          }
          return parseClef("C8");
        }
        return parseClef(fields[1]);
      case "staf":
        return parseStaff(fields.slice(fields[1]=="var" ? 2 : 1));
        obj = new Staff();
        var value, description;
        var witnesses = [];
        for(var j=1; j<fields.length; j++){
          if(!obj.colour && j == fields.length -1){
            if(witnesses.length){
              obj.lines.addReading(witnesses, value, description);
            }
            obj.colour = fields[j];
          } else {
            switch(fields[j].charAt(0)){
              case '"':
                if(witnesses.length) { // we've got another reading and need
                                // to store the previous one
                  if(obj.colour){
                    obj.colour.addReading(witnesses, value, description);
                  } else {
                    obj.lines.addReading(witnesses, value, description);
                  }
                  witnesses = [];
                  description = false;
                }
                value = obj.colour ? fields[j].slice(1, -1) : parseInt(fields[j].slice(1, -1));
                break;
              case '(':
                if(witnesses.length) { // we've got another reading
                                       // and need to store the
                                       // previous one
                  if(obj.colour){
                    obj.colour.addReading(witnesses, value, description);
                  } else {
                    obj.lines.addReading(witnesses, value, description);
                  }
                  value = false;
                  witnesses = [];
                }
                description = fields[j];
                break;
              case 'v':
                // we're introducing variants for staff colour now
                if(obj.lines) {
                  if(witnesses.length){
                    if(obj.colour){
                      obj.colour.addReading(witnesses, value, description);
                    } else {
                      obj.lines.addReading(witnesses, value, description);
                    }
                    value = false;
                    witnesses = [];
                    description = false;
                  }
                  obj.colour = new ValueChoice();
                } else {
                  obj.lines = new ValueChoice();
                }
                break;
              default:
                if(!obj.lines){
                  // This isn't a {var} situation
                  obj.lines = parseInt(fields[j]);
                } else {
                  witnesses.push(fields[j]);
                }
              }
          }
        }
        return obj;
      case "mensural":
      case "plainchant":
        obj = new Notation();
        obj.type = fields[0];
        obj.subtype = fields[1];
        return obj;
    }
  }
  return false;
}    

function nextChoice(){
  return nextChoiceLikeThing(new MChoice(), false);
}

function nextTextChoice(){
  return nextChoiceLikeThing(new MChoice(), true);
}

function nextLigChoice(parent){
  var choice = new LigChoice();
  choice.ligature = parent;
  return nextChoiceLikeThing(choice, false);
}

function nextObliqueNoteChoice(parent){
  var choice = new ObliqueNoteChoice();
  choice.ligature = parent.ligature;
  choice.oblique = parent;
  return nextChoiceLikeThing(choice, false);
}

function nextChoiceLikeThing(choice, textp){
  // Based on readChoice in parser.js
  var locend = string.indexOf("}");
  var finalString = string.substring(locend+1);
  var readingString, reading, witnesses, quoteloc, braceloc, description, stringTemp;
  var prevLength = false;
  string = string.substring(5, locend); // 5 because of "{var="
  while(string.length && prevLength != string.length){
    prevLength = string.length;
    quoteloc = string.indexOf('"');
    braceloc = string.indexOf('(');
        if(braceloc != -1 && (braceloc < quoteloc || quoteloc==-1)){
      string = string.substring(braceloc);
      // this clause begins with an editorial comment
      description = consumeIf(/\(.*?\)/).slice(1, -1);
    } else {
      description = false;
    }
    consumeSpace();
    if(quoteloc != -1){
      string = string.substring(string.indexOf('"'));
      readingString = consumeIf(/\".*?\"/).slice(1,-1);
    } else {
      readingString = false;
    }
    consumeSpace();
    witnesses = trimString(consumeIf(/[^:}]*/)).split(/\s+/);
    stringTemp = string;
    string = readingString;
    switch(description){
      case "nil":
        choice.addNilReading(witnesses);
        break;
      case "ins.":
        // Now what?
        if(textp){
          choice.addTextReading(witnesses, string, description);
        } else {
          choice.addReading(witnesses, string, description);
        }
        break;
      case "om.":
        choice.addOmission(witnesses);
        break;
      default:
        if(textp){
          choice.addTextReading(witnesses, string, description);
        } else {
          choice.addReading(witnesses, string, description);
        }
        break;
    }
    string = stringTemp;
  }
  string = finalString;
  return choice;
}


function nextMusic(parent){
  var results = [];
  var length = false;
  var next;
  consumeSpace();
  while(string.length >0){
    length = string.length;
    next = nextEvent();
    if(next){
      if(parent){
        next = parent.enrichEvent(next, results);
      }
      results.push(next);
    } else if(length == string.length){
      // We're stuck in a loop. Try to escape
      string = string.substring(1);
    }
    consumeSpace();
  }
  return results;
}

function getParameters(){
  var param = new Parameters();
  if(string.indexOf(">") != -1){
    // FIXME: DOOM!
    param.spec = consumeIf(/\s*{[^}]*}\s*/);
    if(!param.spec){ // old format without braces
      param.spec = consumeIf(/[^,]*/);      
    } else {
      param.spec = param.spec.slice(1, -1);
    }
    param.specComment = new Comment();
    param.specComment.content = param.spec;
//    param.specComment.commentStyle = "#A6F";
    currentExample.comments.push(param.specComment);
    consumeIf(/\s*,\s*/);
    var next = nextInfo();
    while(next){
      if(Array.isArray(next)){
        param.notation = next[0];
        param.notationSubtype = next[1];
      } else {
        switch(next.objType){
          case "Notation":
            param.notation = next.type;
            param.notationSubtype = next.subtype;
            break;
          case "MensuralSignature":
            param.mensuralSignature = next;
            break;
          case "SolmizationSignature":
            param.solmization = next;
            break;
          case "Clef":
            param.clef = next;
            break;
          case "Staff":
            param.staff = next;
            break;
        }
      }
      consumeIf(/\s*,\s*/);
      next = nextInfo();
    }
  }
  string = string.substring(string.indexOf(">")+1);
  return param;
}