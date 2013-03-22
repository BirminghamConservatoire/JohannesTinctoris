function MusicExample(){
  this.objType = "MusicExample";
  this.code = string;
  this.SVG = false;
  this.counter = false;
  this.context = false;
  this.events = [];
  this.comments = [];
  this.textObjects = [];
  this.drawCount = 0;
  this.starts = pointer;
  this.swidth = false;
  this.classes = false;
  this.marginSpace = false;
  this.parameters = false;
  this.bbox = false;
  this.parse = function(){
    var augmented = false;
    this.classes = new Classes();
    string = this.code;
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
          } else if(!ignorable(next)){
            currentInfo = false;
          }
        } else if(next.objType == "Staff"){
          currentInfo = next;
        }
        if(next.objType=="Dot"){
          next.augments = augmented;
        } else if(next.objType=="Fermata"){
          next.lengthens = augmented;
        } else if (next.objType==="Comment" && this.events.length && 
                   this.events[this.events.length-1].objType==="Ligature"){
          this.events[this.events.length-1].members.push(new LigatureComment(next));
        } 
        if(next.objType==="TextUnderlay" && this.events.length
           && typeof(this.events[this.events.length-1].text) !=="undefined"
           && !this.events[this.events.length-1].text) {
          this.events[this.events.length-1].text=next;
        } else {
          this.events.push(next);
        }
      } else if(length == string.length){
        // We're stuck in a loop. Try to escape
        string = string.substring(1);
      }
      // if there's no whitespace, following dot is of augmentation
      augmented= consumeSpace() ? false : next;
    }
  };
  this.reset = function(){
    this.swidth = false;
    this.drawCount = 0;
    this.w2 = [];
    this.events = [];
    this.comments = [];
    this.parse();
  };
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
    // for(var i=0; i<this.events.length; i++){
    //   if(this.events[i].objType == "Staff"){
    //     height += rastralSize * 9 + 5;
    //   }
    //}
    this.setSysWidths();
    height = sysWidths.length * height + 15;
    return height;
  };
  this.targetWidth = function(){
    return (wrapWidth 
            ? (wrapWidth - (rastralSize * 3) - (lmargin+10) - (this.marginSpace ? 100 : 0))
            : false);
  };
  this.setSysWidths = function(){
    sysWidths = [rastralSize + this.parameters.width()];
    this.swidth = 0;
  //    var x = lmargin +rastralSize/2;
    for(eventi=0; eventi<this.events.length; eventi++){
      if(this.events[eventi].objType == "Staff" 
         || (wrapWidth && sysWidths[sysWidths.length-1] >= this.targetWidth())){
//             (wrapWidth - rastralSize*3 - lmargin-10)){
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
//    if(exampleSVG != this.SVG) alert("ok");
    // FIXME: 14/10/12 If this shows no alerts, remove this and all
    // svg passing
    // if(this.drawCount>1 && !force){
    //   alert("oh really?");
    //   return;
    // }
    // 22/01/12 This showed up for redrawing punctuation. FIXME: find
    // out what's happening
    underlays = [];
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
    SVG = this.SVG;//exampleSVG;
    // this.SVG = SVG; // ??
    clearSVG(SVG);
    svgCSS(SVG, cssPath("jt-editor-v.css"));
//    svgCSS(SVG, cssPath("print.css"));
    this.w2 = [];
    currentSystems = [];
    var fontstring = Math.round(3 * rastralSize * prop) +"pt ArsNovaVoidRegular";
    context.font = fontstring;
//    this.setSysWidths();
    localWidth = exWidth;
    sysNo = 1;
    curx += rastralSize / 2;
//    cury += currentLinecount * rastralSize;
    var texted = false;
    var maxx = false;
    var remain = this.events.length;    
    currentSystems.push(svgGroup(SVG, "Stafflines", false));
    this.parameters.draw();
    for(eventi = 0; eventi<this.events.length; eventi++){
      remain--;
      if(wrapWidth && (curx>=this.targetWidth()-rastralSize ||
                       (remain<3 && 
                        curx>=this.targetWidth()-((this.events.length-eventi)*2*rastralSize)) ||
                       (remain>1 && this.events[eventi+1].augments 
                        && curx+this.events[eventi].width>=this.targetWidth()-rastralSize))){
         // wrapWidth-32){
        // The custos has to know the next (=current) note, so rewind
        // the pointer, briefly
        eventi-=1;
        var custos = new Custos();
        custos.draw();
        eventi+=1;
        sysBreak2();
        sysBreak();
        currentClef.draw();
        this.SVG.height.baseVal.value = this.SVG.height.baseVal.value 
          + (rastralSize*5)+5+(currentLinecount*rastralSize);
      }
      if(this.events[eventi].objType && !this.events[eventi].params) {
        try {
          this.events[eventi].draw(curx, cury);
        } catch (x) {
          // alert(x+" -- unnecessary error message 1");
        }
        if(this.events[eventi].objType == "TextUnderlay"
           || this.events[eventi].text){
          texted = true;
        }
      }
    }
    if(this.classes.classes.length) drawClasses(this.classes.classes, false);
    sysBreak2(true);
    for(var w=0; w<this.w2.length; w++){
      drawSystemLines(currentSystems[w], this.w2[w][2], this.w2[w][1], lmargin, 
        this.w2[w][0], this.w2[w][3], this.SVG);
      maxx = Math.max(this.w2[w][0], maxx);
    }
    var box = this.SVG.getBoundingClientRect();
    if(!box.height) {
      //      alert("Rectangle error"+this.code);
      // FIXME: Certainly still causes brokenness
//      this.SVG.height.baseVal.value = 64;
      var max= false, min=false, b;
      for(var n=0; n<SVG.childNodes.length; n++){
        b=SVG.childNodes[n].getBoundingClientRect();
        if(b.top && (!min || b.top<min)) min = b.top;
        if(b.bottom && (!max || b.bottom>max)) max = b.bottom;
      }
      this.SVG.height.baseVal.value = Math.max(64, max-min + (texted ? 30 : 0));
    } else {
//      if($.browser.webkit){
        var bbox = this.SVG.getBBox();
        this.bbox = bbox;
        var top = bbox.y < 0 ? bbox.y -1 : 0;
        var bottom = bbox.y+bbox.height+1;
        var height = bottom - top;
        if(top) {
//          console.log(top); //-13=>4 -32=>10 -18=>-4 -32=>10
//          this.SVG.parentNode.style.marginTop = top+5+"px";
          var nudge = rastralSize*-2.4;
          if($(this.SVG.parentNode).hasClass("inline")) {
            this.SVG.parentNode.style.marginTop = "-35px";
            if(this.w2[0][2]==3){
              nudge -= rastralSize/2;
            }
          }
          this.SVG.parentNode.style.verticalAlign = nudge-top+"px";
        } 
        this.SVG.setAttribute('height', height);
        this.SVG.height.baseVal.value = height;
        this.SVG.style.height = height+"px";
        this.SVG.setAttribute('viewBox', bbox.x+" "+top+" "+bbox.width+" "+height);//bbox.height);
        this.SVG.width.baseVal.value = bbox.width+bbox.x;
      // } else {
      //   this.SVG.height.baseVal.value = Number(box.height); //+ (texted ? 35 : 5);
      // }
//      this.SVG.height.baseVal.value = Number(SVG.getBoundingClientRect().height) + (texted ? 35 : 5);
//      this.SVG.style.height = (Number(SVG.getBoundingClientRect().height) + (texted ? 35 : 5)+10)+"px";
    }
//     if(!$.browser.webkit){
// //      this.SVG.width.baseVal.value = maxx + (texted ? 25 : 5);
//       this.SVG.width.baseVal.value = this.SVG.getBBox().
//     }
    // this.SVG.parentNode.style.width = maxx+(texted ? 25 : 5)+8+"px";
    currentExample = false;
  };
  this.parse();
  currentExample = false;
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
      } 
    // if(string.substring(0,5) == "{&c.}"){
      //   var obj = new etc();
      //   string = string.substring(5);
      //   getAndSetPitch(obj);
      //   return obj;
      // } 
      else {
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
      if(string.charAt(1)==="*"){
        return nextComment();
      } else {
        return nextFermata();
      }
    case "2":
    case "3":
      return nextRepeat();
    case "&":
      var obj = new etc();
      string = string.substring(1);
      getAndSetPitch(obj);
      return obj;
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
    string = string.substring(pitch[0].length);
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

function nextRepeat(){
  var obj = new Repeat();
  obj.multiple = Number(string.charAt(0));
  if(string.charAt(1) !=":") return false;
  consume(2);
  obj.start = getStaffPos();
  if(obj.start && consumeIf("-")){
    obj.end = getStaffPos();
    while(string.charAt(0)==="-" || string.charAt(0)==="+"){
      var pos;
      if(!obj.ldots){
        obj.ldots = repeatDotArray(obj.start, obj.end);
        obj.rdots = repeatDotArray(obj.start, obj.end);
      }
      if(string.charAt(0)==="-"){
        consume(1);
        pos = getStaffPos();
        obj.ldots.splice(obj.ldots.indexOf(pos),1);
        obj.rdots.splice(obj.rdots.indexOf(pos),1);
      } else {
        consume(1);
        pos = getStaffPos();
        obj.ldots = obj.ldots.push(pos);
        obj.rdots = obj.ldots.push(pos);
      }
    }
    return obj;
  }
  return false;
}

function nextNote(){
  var sup = consumeIf(/\^/);
  var obj = new Note;
  obj.rhythm = getRhythm();
  obj.sup = sup;
  obj = getAndSetPitch(obj);
  var tails = consumeIf(/[/]?[+-]*/);
  if(tails){
    obj.forceTail = tails;
  }
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

function nextFermata(){
  var obj = new Fermata();
  string = string.substring(1);
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
    case "full":
      return new FullOpen();
    case "/full":
      return new FullClose();
    case "text":
    case "label":
      var thingy = nextText();
      if(thingy){
        thingy.type = tag;
        return thingy;
      }
    default:
      if(tag.substring(0, 4)=="text" || tag.substring(0, 5)=="label"){
        // text with position
        var thing = nextText();
        if(tag.substring(0, 5)=="label") thing.type = "label";
        if(thing){
          return thing;
        }
      } else if (tag.substring(0, 4)=="part"){
        var thing = new Part();
        thing.id = parseInt(tag.substring(5));
        return thing;
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
//    } else if(string.substring(0, 6)=="<text>"){
    } else if(consumeIf(/<(text|label):?.*?>/)){
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
      if(next.objType==="TextUnderlay" && neume.members.length
         && typeof(neume.members[neume.members.length-1].text) !==undefined
         && !neume.members[neume.members.length-1].text){
        neume.members[neume.members.length-1].text = next;
      } else {
        neume.members.push(next);
      }
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
    if(consumeIf(/<(text|label):?.*?>/)){
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
    if(consumeIf(/<(text|label):?.*?>/)){
      //FIXME ignores meaning
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
      if(string.charAt(0)=="."){
        next.dot = nextDot();
      }
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
    if(consumeIf(/<(text|label):?.*?>/)){
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
        if(string.charAt(0)=="."){
          next.dot = nextDot();
        }
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
  var t = string.indexOf("</text>");
  var l = string.indexOf("</label>");
  // This looks complicated, but we want -1 if both are -1, otherwise,
  // we want the one that isn't -1 or the lower of the two otherwise
  var end = ((t >-1 && t<l) || l===-1) ? t : l;
  var taglength = ((t >-1 && t<l) || l===-1) ? 7 : 8;
  if(end === -1){
    return false;
  }
  var text = new TextUnderlay();
  var returnString = string.substring(end+taglength);
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

function parseMens(spec){
  var obj = new MensuralSignature();
  var pointer = 0;
  if(!spec || !spec.length) return obj;
  if(spec.charAt(0) == "[") {
    obj.editorial=true;
    pointer++;
  }
  if(spec.charAt(spec.length-1)=="]") spec = spec.substring(0, spec.length-1);
  if(spec.charAt(pointer)==="^"){
    obj.sup = true;
    pointer++;
  }
  if(spec.charAt(pointer)) {
    obj.signature = spec.charAt(pointer);
  } else return obj;
  pointer++;
  if(spec.charAt(pointer)) obj.staffPos = "0123456789ABCDEF".indexOf(spec.charAt(pointer));
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
  if(fields[0] === "(om.)"){
    mens = new MensuralSignature();
  } else if(fields[0].length>1){
    mens = parseMens(fields[0].substring(1, fields[0].length-1));
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
  var solm=false, closed, signs=[], start, finish, last, from, descr="", field;
  for(var i=0; i<fields.length; i++){
    field = fields[i];
    if(field.charAt(0)==='"'){
      // Starting a solm sig
      if(from && (solm || i-from)){
        return [fields.slice(i), 
                new MReading(fields.slice(from, i), solm ? [solm] : [], descr)];
      } else {
        if(field.charAt(field.length-1)==='"'){
          solm = parseSolm([field.substring(1, field.length-1)]);
          closed = true;
          from = i+1;
        } else {
          signs.push(field.substring(1));
          from = i+1;
        }
      }
    } else if (fields[i].charAt(0)==='('){
      // starting a descr
      if(from && ((solm && i-from) || descr.length)){
        return [fields.slice(i),
                new MReading(fields.slice(from, i), solm ? [solm] : [], descr)];
      } else {
        // relevant description
        finish = field.lastIndexOf(')');
        descr = field.substring(1, finish > -1 ? finish : field.length);
        from = i+1;
      }
    } else if (!closed){
      finish = field.lastIndexOf('"');
      if(finish>-1){
        signs.push(field.substring(0, finish));
        closed = true;
        solm = parseSolm(signs);
        from = i+1;
      } else {
        signs.push(field);
        from = i+1;
      }
    } else {
      // Witnesses. Do nothing
    }
  }
  return [false, new MReading(fields.slice(from), solm ? [solm] : [], descr)];
}

// function parseSolmReading(fields){
//   var solm = false, signs = [], start, finish, last, sigged, descr="";
//   for(var i=0; i<fields.length; i++){
//     if(sigged || sigged === 0){
//       if(fields[i].charAt(0) =='"'){
//         return [fields.slice(i), 
//                 new MReading(fields.slice(sigged, i), solm ? [solm] :[], descr)];
//       }
//     } else if(fields[i].charAt(0)==='('){
//       // Could be a variety of things.
//       if(sigged || sigged===0){
//         // This is either a post-sig description or a new sig
//         if(descr.length || i-sigged >1){
//           // Definitely new sig
//           return [fields.slice(i), 
//                   new MReading(fields.slice(sigged, i), solm ? [solm] : [], descr)];
//         } else {
//           // Description for existing sig
//           finish = fields[i].lastIndexOf(')');
//           descr = fields[i].substring(1, finish > -1 ? finish : fields.length);
//           sigged = i+1;
//         }
//       } else {
//         // No sig yet
//         finish = fields[i].lastIndexOf(')');
//         descr = fields[i].substring(1, finish > -1 ? finish : fields.length);
//       }
//     } else {
//       start = i==0 ? 1 : 0;
//       finish = fields[i].length;
//       if(fields[i].lastIndexOf('"')>0){
//         finish = fields[i].lastIndexOf('"');
//         last = true;
//       }
//       signs.push(fields[i].substring(start, finish));
//       if(last){ 
//         solm = parseSolm(signs);
//         signs = [];
//         sigged = i+1;
//       }
//     }
//   }
//   return [false, new MReading(fields.slice(sigged, fields.length), solm ? [solm] : [], descr)];
// }
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
  var clef = false, descr="", from=false, finish;
  for(var i=0; i<fields.length; i++){
    if(fields[i].charAt(0) =='"'){
      if(from && (clef || i-from)){
        // either we've got a clef for this reading, or there is none
        // (and so there has been at least one witness listed)
        return [fields.slice(i), new MReading(fields.slice(from, i), clef ? [clef] : [], descr)];
      } else {
        // Clef for this reading
        finish = fields[i].lastIndexOf('"');
        clef = parseClef(fields[i].substring(1, finish > -1 ? finish : fields[i].length));
        from = i+1;
      }
    } else if(fields[i].charAt(0)==='('){
      if(from && ((clef && i-from) || descr.length)) {
        // this either doesn't apply to the clef or there's already a
        // description
        return [fields.slice(i), new MReading(fields.slice(from, i), clef ? [clef] : [], descr)];
      } else {
        // relevant description
        finish = fields[i].lastIndexOf(')');
        descr = fields[i].substring(1, finish > -1 ? finish : fields[i].length);
        from = i+1;
      }
    }
  }
  return [false, new MReading(fields.slice(from, fields.length), clef ? [clef] : [], descr)];
}

// function parseClefReading(fields){
//   var clef = parseClef(fields[0].substring(1, fields[0].length-1));
//   for(var i=1; i<fields.length; i++){
//     if(fields[i].charAt(0) =='"'){
//       return [fields.slice(i), new MReading(fields.slice(1, i), [clef], "")];
//     }
//   }
//   return [false, new MReading(fields.slice(1, fields.length), [clef], "")];
// }
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
  if(spec.charAt(0)=="[") {
    obj.editorial=true;
    spec = spec.substring(1);
  }
  if(spec.charAt(spec.length-1)=="]") spec = spec.substring(0, spec.length-1);
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
  return string.match(/(black|red|blind|0)/) ? string.match(/(black|red|blind|0)/)[0] : false;
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
  //var locend = string.indexOf("}");
  var locend = findClose("}", 1);
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
//      description = consumeIf(/\(.*?\)/).slice(1, -1);
      description = consumeTillClose(")", 1).slice(1, -1);
    } else {
      description = false;
    }
    consumeSpace();
    if(quoteloc != -1){
      string = string.substring(string.indexOf('"'));
      // readingString = consumeIf(/\".*?\"/).slice(1,-1);
      readingString = consumeTillClose('"', 1).slice(1, -1);
    } else {
      readingString = false;
    }
    consumeSpace();
    witnesses = consumeTillOption([':', '}'], 0);
    // But the brace at the end may already have been removed, so
    if(witnesses) {
      witnesses = witnesses.slice(0, -1);
    } else {
      // This is the bit before the }
      witnesses = consumeN(string.length);
    }
    witnesses = trimString(witnesses);
    witnesses = witnesses.split(/\s+/);
    consumeSpace();
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
