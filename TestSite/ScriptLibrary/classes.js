// Musical classes
// 1. Notes, ligatures & neumes

function Note(){
  // Note is the basic class for sounding items. It's also used for
  // ligature components (why?)
  this.objType = "Note";
  this.text = false;
  this.staffPos = false;
  this.pitch = false;
  this.rhythm = false;
  this.sup = false;
  this.flipped = false;
  this.startX = false;
  this.startY = false;
  this.domObj = false;
  this.click = false;
  this.voidnotes = false;
  this.subType = false;
  this.example = false;
  this.dot = false; 
  this.forceTail = false; // This is only for ligatures, but the parser will put it here
  // Copy current classes
  this.classList = [];
  if(currentExample.classes && currentExample.classes.classes.length){
    this.classList = currentExample.classes.classes.slice(0);
  }
  this.width = function(){
    var width = 0;
    if(this.rhythm){
        width += baseDictionary[currentSubType][this.rhythm][2]*rastralSize;
    }
    return width;
  };
  this.toText = function(){
    var text = "";
    if(this.sup) text+= "^";
    if(this.flipped) text += "-";
    if(this.rhythm) text += this.rhythm;
    text += this.pitch ? this.pitch : this.staffPos.toString(16).toUpperCase();
    return text;
  };
  this.MEINode = function(parentDoc){
    if(this.pitch){
      return PitchedMEINote(this.pitch, this.rhythm, false);
    }
    return false;
  };
  this.edit = function(event) {
    return durationSelector(this, event.pageX, event.pageY);
  };
  // Note
  this.draw = function(){
    var myglyph = false;
    var spos = staffPosition(this);
    var oldx = curx;
    if(this.sup){
      curx = currentExample.events[eventi-1].startX;
    } else if(this.text && underlays.length){
      // Check for text issues
      curx = Math.max(curx, underlayRight());
    }
    // put context into object to avoid trouble when drawing out of
    // order (first draw is always in order)
    this.startX = curx;
    this.startY = cury;
    this.subType = currentSubType;
    this.voidnotes = voidRule(this);//voidnotesp(this);
    this.fullnotes = fullRule(this);
    var half = halfFullRule(this);
    if(half && (!this.rhythm || !/[M|L|B]/.exec(this.rhythm))) half = false;
    this.example = currentExample;
    var extraClasses = "";
    // Now check for styles
    if(this.classList.length){
      extraClasses = classString(this.classList);
      drawClasses(this.classList, this);
    }
    if(this.fullnotes) extraClasses += " full";
    // Draw any underlaid text
    if(this.text){
      this.text.draw();
    } 
    if(spos && this.rhythm) {
      var subType = half ? (half === 1 ? "lhalf" : "rhalf") : this.subType;
      this.domObj = svgGroup(SVG, "notegroup"+extraClasses+(editable ? " clickable" : "")
                             +(half ? " halffull"+half : ""), 
                             false);
      var obj;
      if(getNoteGlyph(voidGlyphMap, this.rhythm, this.flipped, subType, this.voidnotes, this.fullnotes)){
        myglyph = getNoteGlyph(voidGlyphMap, this.rhythm, this.flipped, subType, this.voidnotes, this.fullnotes);
        var oldSVG = SVG;
        SVG = this.domObj;
        obj = myglyph.draw(curx, yPos(cury, spos), rastralSize, 
                         "mensural " + this.rhythm+(this.pitch ? this.pitch : this.staffPos));
        SVG = oldSVG;
        curx+= myglyph.advanceWidth(rastralSize);
      } 
      if(this.flipped){
        var charData = this.voidnotes ?
                         voidFlippedDictionary[subType][this.rhythm] :
                         flippedDictionary[subType][this.rhythm];
      } else {
        var charData = this.voidnotes ?
                         voidBaseDictionary[subType][this.rhythm] :
                         baseDictionary[subType][this.rhythm];
      }
      if(editable) {
        $(this.domObj).click(domClickfun(this.domObj, editObject(this), false, false, false));
        $(this.domObj).hover(shiftHoverToShift(this, 1), hoverOutShiftChecked());
      }
      if(!myglyph){
        obj = svgText(this.domObj, curx, texty(charData[1]*prop, spos),
             "mensural " + this.rhythm+(this.pitch ? this.pitch : spos), false,
             musicStyle(), charData[0]);
        curx += charData[2] * rastralSize;
      }
      setDotPos(spos);
    }
    if(this.dot) this.dot.draw();
    curx = Math.max(oldx, curx);
    return this.domObj;
  };
  // Note
}

function ChantNote(){
  this.objType = "ChantNote";
  this.text = false;
  this.staffPos = false;
  this.pitch = false;
  this.rhythm = false; // Misnamed
  this.startX = false;
  this.domObj = false;
  this.example = currentExample;
  // Copy current classes
  this.classList = currentExample.classes ? currentExample.classes.classes.slice(0) : [];
  this.width = function(){
    return rastralSize;
  };
  this.toText = function(){
    var text = "";
    if(this.rhythm) text += this.rhythm;
    text += this.pitch ? this.pitch : this.staffPos.toString(16).toUpperCase();
    return text;
  };
  this.edit = function(event){
    return chantShapeSelector(this, event.pageX, event.pageY);
  };
  this.MEINode = function(parentDoc){
    if(this.pitch){
      return PitchedMEINeume(this.pitch, this.rhythm, false);
    }
    return false;
  };
  // ChantNote
  this.draw = function(){
    var extraClasses = "";
    var spos = staffPosition(this);
    // Check for text issues
    if(this.text){
      curx-=rastralSize*0.6*prop;
      if(underlays.length){
        curx = Math.max(curx, underlayRight());
      }
      this.text.draw();
      curx+=rastralSize*0.6*prop;
    }
    this.startX = curx;
    if(this.classList.length){
      extraClasses = classString(this.classList);
      drawClasses(this.classList, this);
    }
    this.domObj = svgGroup(SVG, 'chantnote ' + (editable ? 'clickable ' : '')
                           +extraClasses, false);
    var prevSVG = SVG;
    SVG = this.domObj;
    if(spos && this.rhythm){
      if (currentSubType.toLowerCase() == "hufnagel"){
        drawRhombus(curx, yPos(cury, spos), false, false, this.rhythm=="v");
      } else if(this.rhythm=="l"){
        drawRhombus(curx, yPos(cury, spos), false, false, false);
      } else {
        drawChantBox(curx, yPos(cury, spos), false,
          (this.rhythm=="p" ? false : true), false, false, 0);
      }
    }
    SVG = prevSVG;
    setDotPos(spos);
    if(editable){
      $(this.domObj).click(editObject(this));
      $(this.domObj).hover(shiftHoverToShift(this, 1), hoverOutShiftChecked());
    }
    curx += rastralSize;
    return this.domObj;
  };
  // ChantNote
}

function Dot(){
  this.objType = "Dot";
// If pitched
//  this.pitch = false;
  this.augments = false;
  this.staffPos = false;
  this.startX = false;
  this.text = false;
  this.domObj = false;
  this.example = currentExample;
  // Copy current classes
  this.classList = currentExample.classes ? currentExample.classes.classes.slice(0) : [];
  this.width = function(){
    // return dotData[2]*rastralSize * prop;
    return this.augments ? rastralSize/2 : rastralSize;
  };
  this.toText = function(){
    return this.staffPos ? "."+this.staffPos.toString(16).toUpperCase() : ".";
  };
  this.MEINode = function(parentDoc){
    return MEIDot();
  };
  this.draw = function(){
    var extraClasses = "";
    // curx -= this.augments ? 0.6 * prop * rastralSize : 0.4 * prop * rastralSize;
    if(!this.augments) {
      curx += rastralSize/6;
    } else {
      curx -= rastralSize/12
    }
    if(this.text && underlays.length){
      // Check for text issues
      curx = Math.max(curx, underlayRight());
    }
    this.startX = curx;
    if(this.classList.length){
      extraClasses = classString(this.classList);
      drawClasses(this.classList, this);
    }
    var pos = staffPosition(this) || dotPos || Math.floor(currentLinecount/4)*2+1;
    this.domObj = svgCircle(SVG, curx, yPos(cury,pos), rastralSize * 0.12, "drawndot mensural"+extraClasses);
    if(this.text){
      this.text.draw();
    }  
    curx += rastralSize /3;
    if(editable){
      $(this.domObj).hover(shiftHoverToShift(this, 2), hoverOutShiftChecked());
    }
    return this.domObj;
  };
  // Dot
}
function SignumCongruentiae(){
  this.objType = "SignumCongruentiae";
  this.effects = false;
  this.staffPos = false;
  this.startX = false;
  this.text = false;
  this.domObj = false;
  this.flipped = false;
  this.example = currentExample;
  this.classList = currentExample.classes ? currentExample.classes.classes.slice(0) : [];
  this.width = function(){
    return 0;
  };
  this.toText = function(){
    // FIXME: fake
    return "?"+this.staffPos ? this.staffPos : "";
  };
  this.draw = function(){
    var extraClasses = "";
    var oldx = 0;
    var pos = this.staffPos;
    if(!pos){
      if(this.flipped){
        pos = this.staffPos || (dotPos-3) || (Math.floor(currentLinecount/4)*2-3);
      } else {
        pos = this.staffPos || (2+dotPos) || (Math.floor(currentLinecount/4)*2+3);
      }
    }
    if(this.effects){
      oldx = curx;
      curx = this.effects.startX;
    }
    this.startX = curx;
    if(this.classList.length){
      extraClasses = classString(this.classList);
      drawClasses(this.classList, this);
    }
    if(this.flipped){
      this.domObj = arsNovaVoid.sigCongUp.draw(curx, cury-yoffset(pos), rastralSize, "mensural sigcongruent"+extraClasses);
    } else {
      this.domObj = arsNovaVoid.sigCong.draw(curx, cury-yoffset(pos), rastralSize, "mensural sigcongruent"+extraClasses);
    }
    curx += fermataGlyph.advanceWidth(rastralSize);
    curx = Math.max(oldx, curx);
    return this.domObj;    
  };
  // Signum Congruentiae
}

function Fermata(){
  this.objType = "Fermata";
  this.lengthens = false;
  this.staffPos = false;
  this.startX = false;
  this.text = false;
  this.domObj = false;
  this.example = currentExample;
    this.classList = currentExample.classes ? currentExample.classes.classes.slice(0) : [];
  this.width = function(){
    return dotData[2]*rastralSize * prop;
  };
  this.toText = function(){
    return this.staffPos ? "."+this.staffPos.toString(16).toUpperCase() : ".";
  };
  this.draw = function(){
    var extraClasses = "";
    var oldx = 0;
    var pos = staffPosition(this) || (2+dotPos) || (Math.floor(currentLinecount/4)*2+3);
    if(this.lengthens) {
      oldx = curx;
      curx = this.lengthens.startX;
    }
    this.startX = curx;
    if(this.classList.length){
      extraClasses = classString(this.classList);
      drawClasses(this.classList, this);
    }
    this.domObj = fermataGlyph.draw(curx, yPos(cury,pos), rastralSize, "mensural fermata"+extraClasses);
    curx += fermataGlyph.advanceWidth(rastralSize);
    curx = Math.max(oldx, curx);
    return this.domObj;
  }
  // Fermata
}

function Custos(){
  // Self explanatory. Generally behaves like a note.
  this.objType = "Custos";
  this.text = false;
  this.staffPos = false;
  this.staffPosGuessed = false;
  this.pitch = false;
  this.startX = false;
  this.domObj = false;
  this.example = currentExample;
  // Copy current classes
  this.classList = currentExample.classes ? currentExample.classes.classes.slice(0) : [];
  this.width = function(){
    return 2.5*rastralSize;
  };
  this.toText = function(){
    return "c"+this.staffPosGuessed ? "" : this.staffPos.toString(16).toUpperCase();
  };
  this.MEINode = function(parentDoc){
    if(this.pitch){
      return PitchedMEICustos(this.pitch, this.rhythm, false);
    }
    return false;
  };
  this.draw = function() {
    var spos = staffPosition(this);
    if(this.classList.length){
      extraClasses = classString(this.classList);
      drawClasses(this.classList, this);
    }
    this.startX = curx;
    // Draw any underlaid text
    if(this.text){
      this.text.draw();
    }
    if(!spos){
      var guess = nextPitch();
      if(!guess) return false;
      this.pitch = guess[0];
      if(!this.pitch){
        this.staffPos = guess[1];
        spos = this.staffPos;
      } else {
        spos = staffPosFromPitchString(guess[0]);
      }
      this.staffPosGuessed = true;
    }
    if(spos) {
      this.domObj = arsNovaVoid.custos.draw(curx, yPos(cury, spos), rastralSize, "mensural custos");
      curx += arsNovaVoid.custos.advanceWidth(rastralSize);
      setDotPos(spos);
    }
    if(editable){
      $(this.domObj).hover(shiftHoverToShift(this, 1), hoverOutShiftChecked());
    }
    return this.domObj;
  };
  // Custos
}

function compoundNotep(obj){
  return obj.objType != "TextUnderlay" && obj.objType != "Comment";
}
function LigatureNote(note){
  this.objType = "LigatureNote";
  this.text = note.text;
  this.staffPos = note.staffPos;
  this.pitch = note.pitch;
  this.rhythm = note.rhythm;
  this.sup = note.sup;
  this.forceTail = note.forceTail;
  this.startX = false;
  this.startY = false;
  this.domObj = false;
  this.dot = false;
  this.voidnotes = note.voidnotes;
  this.subType = note.subType;
  this.example = note.example;
  this.ligature = false;
  this.index = false;
  this.prevEventObj = false;
  this.nextEventObj = false;
  // Copy current classes
  this.classList = currentExample.classes ? currentExample.classes.classes.slice(0) : [];
  this.forwardEvent = function(variant){return this;};
  this.backwardEvent = function(variant){return this;};
  this.prevEvent = function(variant){
    return this.prevEventObj ? this.prevEventObj.backwardEvent(variant) : false;
  };
  this.nextEvent = function(variant){
    return this.nextEventObj ? this.nextEventObj.forwardEvent(variant) : false;
  };
  this.width = function(){
    return this.rhythm == "M" ? 19/10*rastralSize : rastralSize;
  };
  this.varStartStaffPos = function(variant){ 
    return staffPosition(this);
//    return this.staffPos;
  };
  this.varEndStaffPos = function(variant){ 
    return staffPosition(this);
  };
  // Ligature Note
  this.lstem = function(variant){
    // First check for forcing by editor
    switch(this.forceTail){
      case "++":
        return 1;
      case "+-":
        return -1;
    }
    // Now check for semibreve stem
    if(this.rhythm == "S"){
      if(this.prevEvent(variant).rhythm == "S" && this.prevEvent(variant).lstem(variant)){
        return false;
      } else {
        return 1;
      }
    } else if (this.rhythm == "B" &&
               (!this.prevEvent(variant) && this.nextEvent(variant)
                 && this.nextEvent(variant).varStartStaffPos(variant) < staffPosition(this))){
      return -1;
    } else {
      return false;
    }
  };
  this.rstem = function(variant){
    // First check for forcing by editor
    switch(this.forceTail){
      case "+":
        return true;
    }
    if(!this.sup && (this.rhythm == "L" || this.rhythm == "M")){
      // *might* be a stem
      if(!this.prevEvent(variant)){
        if(this.nextEvent(variant) && this.nextEvent(variant).varStartStaffPos(variant) > staffPosition(this))
          return true;
      } else if(!this.nextEvent(variant)){
        if(this.prevEvent(variant).varEndStaffPos(variant) < staffPosition(this))
          return true;
      } else {
        // Middle long or maxima always has tail
        return true;
      }
    } 
    return false;
  };
  this.toText = function(){
    var text = "";
    if(this.sup) text+= "^";
    if(this.rhythm) text += this.rhythm;
    text += this.pitch ? this.pitch : this.staffPos.toString(16).toUpperCase();
    return text;
  };
  // Ligature Note
  this.drawVar = function(variant){
    var extraClasses = "", oldx, obj;
    // ?? Sup????
    if(this.classList.length){
      extraClasses = classString(this.classList);
      drawClasses(this.classList, this);
    }
    this.startX = curx;
    obj = drawBox(this, this.prevEvent(variant) && 
      this.prevEvent(variant).varEndStaffPos(variant), 
      this.width(variant), this.lstem(variant), this.rstem(variant), 
      this.sup, (currentSubType==="black" || fullRule(this)), extraClasses);
    setDotPos(staffPosition(this));
    if(this.dot){
      oldx = curx;
      curx+=rastralSize/3;
      this.dot.draw();
      curx = oldx;
    }
    return obj;
  };
  this.draw = function(){
    var extraClasses = "", oldx, obj;
    if(this.classList.length){
      extraClasses = classString(this.classList);
      drawClasses(this.classList, this);
    }
    this.startX = curx;
    obj = drawBox(this, this.prevEvent() && this.prevEvent().varEndStaffPos(), 
      this.width(), this.lstem(), this.rstem(), this.sup, 
      (currentSubType==="black" || fullRule(this)), extraClasses);
    setDotPos(staffPosition(this));
    if(this.dot){
      oldx = curx;
      curx+=rastralSize/3;
      this.dot.draw();
      curx = oldx;
    }
    return obj;
  };
  // Ligature Note
}

function LigatureComment(comment){
  this.objType = "LigatureComment";
  this.content = comment.content;
  this.width = function() {return 0;};
  this.startX = false;
  this.commentStyle = commentStyle;
  this.endX = false;
  this.startY = false;
  this.endY = false;
  this.ligature = false;
  // Copy current classes
  this.classList = currentExample.classes ? currentExample.classes.classes.slice(0) : [];
  this.toText = function(){
    return "**"+this.content+"**";
  };
  this.updateStyles = function(styles){
    // FIXME: WTF??
    return styles;
  };
  this.drawVar = function(variant){
    return this.draw();
  };
  this.draw = function(){
    // FIXME: Check this -- it's nonsense to me at the moment
    if(!showtranslationnotes || !showtranscriptionnotes) {
      // WHICH??? One of these is relevant, but can't tell
      return false;
    }
    var drawnx = curx;
    this.startY = cury - rastralSize * currentLinecount;
    this.startX = drawnx;
    this.endY = this.startY - Math.floor(rastralSize * textScale * 2);
    var star = svgText(SVG, drawnx, this.startY, "annotation musical", false, false, "*");
    var j = currentExample.comments.indexOf(this);
    if(j===-1){
      console.log(["Note Error: "+examplei,currentExample]);
    } else {
      star.setAttributeNS(null, "onmouseover", "top.tooltipForComment("+examplei+","+j+", "+(this.startX+10)+","+(10+this.startY)+");");
      star.setAttributeNS(null, "onmouseout", "top.removeTooltip()");
    }
    return star;
  };
  // Ligature Comment
}

function Ligature(){
  // Container object for Note and Oblique objects in ligature.
  this.objType = "Ligature";
  this.str = false;
  this.members = [];
  this.startX = false;
  this.fake = false;
  this.firstEventObj = false;
  this.lastEventObj = false;
  // Copy current classes
  this.classList = currentExample.classes ? currentExample.classes.classes.slice(0) : [];
  this.enrichEvent = function(event, eventlist){
    if(event.objType == "Note"){
      event = new LigatureNote(event);
    }
    event.ligature = this;
    if(eventlist.length) {
      event.prevEventObj = eventlist[eventlist.length-1];
      eventlist[eventlist.length-1].nextEventObj = event.prevEventObj;
    }
    return event;
  };
  this.toText = function(){
    var text = "<lig>";
    for(var i=0; i<this.members.length; i++){
      if(i>0) text += " ";
      text += this.members[i].toText();
    }
    return text+"</lig>";
  };
  this.lastNoteIndexp = function(index){
    return !this.nextNote(index);
  };
  this.firstNoteIndexp = function(index){
    return !this.prevNote(index);
  };
  this.nextNote = function(index){
    for(var i=index+1; i<this.members.length; i++){
//      if(this.members[i].objType != "TextUnderlay"){
      if(compoundNotep(this.members[i])){
        return this.members[i];
      }
    }
    return false;
  };
  this.prevNote = function(index){
    for(var i=index-1; i>=0; i--){
      if(compoundNotep(this.members[i])){
        return this.members[i];
      }
    }
    return false;
  };
  // Ligature
  this.nthNote = function(n){
    var i=0;
    var ith=0;
    while(i<this.members.length){
      if(compoundNotep(this.members[i])){
        if(ith==n){
          return this.members[i];
        }
        ith++;
      }
      i++;
    }
    return false;
  };
  this.prevPos = function(index){
    var note = this.prevNote(index);
    if(note){
      return note.objType == "Oblique" ? staffPosition(note.members[1]) : oblElementStaffPos(note);
    } else return false;
  };
  this.nextPos = function(index){
    var note = this.nextNote(index);
    if(note){
      return note.objType == "Oblique" ? staffPosition(note.members[0]) : oblElementStaffPos(note);
    } else return false;
  };
  this.width = function(){
    // FIXME: clearly wrong
    return this.members.reduce(function(p, e, i, a){
                                 if(e.sup){
                                   return p;
                                 }
                                 switch(e.objType){
                                   case "Note":
                                     return p+(e.rhythm=="M" ? prop * 2.5* rastralSize
                                               : prop * rastralSize);
                                   case "Oblique":
                                     return p+ e.width();
                                 } return p;}, 0) + rastralSize;
  };
  this.firstEvent = function(variant){
    return this.firstEventObj.forwardEvent(variant);
  };
  // Ligature
  this.leftOverhang = function(variant){
    var e = this.firstEvent(variant);
    if(!e || e.objType == "ObliqueNote" || e.rhythm == "M") return 0;
    e = e.nextEvent(variant);
    if(!e) return 0;
    if (e.rhythm == "M"){
      if(e.sup) return 3/2*rastralSize;
      return 0;
    }
    if(e.objType == "Note") alert(this.str+" err-02");
    e = e.nextEvent(variant);
    if (e & e.rhythm == "M" && e.sup) return rastralSize;
    return 0; 
  };
  this.addEvent = function(event){
    if(this.lastEventObj){
      this.lastEventObj.nextEventObj = event;
      event.prevEventObj = this.lastEventObj;
    } else{
      this.firstEventObj = event;
    }
    this.lastEventObj = event;
    event.ligature = this;
    this.members.push(event);
    return event;
  };
  this.addChoice = function(event){
    if(this.lastEventObj){
      this.lastEventObj.nextEventObj = event;
      event.prevEventObj = this.lastEventObj;
      for(var c=0; c<event.content.length; c++){
        event.content[c].content[0].prevEventObj = this.lastEventObj;
      }
    } else{
      this.firstEventObj = event;
    }
    this.lastEventObj = event;
    event.ligature = this;
    this.members.push(event);
    return event;
  };
  this.addElement = function(el){
    switch(el.objType){
      case "LigatureNote":
      case "Oblique":
        return this.addEvent(el);
      case "ObliqueNote Choice":
      case "Ligature Choice":
        return this.addChoice(el);
      default:
        el.ligature = this;
        this.members.push(el);
        return el;
    };
  };
  // Ligature
  this.addNote = function(note){
    note = new LigatureNote(note);
    this.addEvent(note);
  };
  this.addOblique = function(oblique){
    this.addEvent(oblique);
  };
  this.drawVar = function(variant){
    // Check for text issues
    if(this.members[0].text && underlays.length){
      curx = Math.max(curx, underlayRight());
    }
    curx += this.leftOverhang(variant) + 0.5 * prop * rastralSize;
    for(var i=0; i<this.members.length; i++){
      this.members[i].drawVar(variant);
    }
    curx+=rastralSize/2;
  };
  this.draw = function(){
    curx += this.leftOverhang(false) + 0.5 * prop * rastralSize;
    var tempSVG = SVG;
    var group = svgGroup(SVG, "CompleteLigatureGroup", false);
    SVG = group;
    var extraClasses = "";
    // Now check for styles
    if(this.classList.length){
      extraClasses = classString(this.classList);
      drawClasses(this.classList, this);
    }
    for(var i=0; i<this.members.length; i++){
      this.members[i].draw();
    }
    SVG = tempSVG;
    curx+=this.members[this.members.length-1].dot ? rastralSize : rastralSize/2;
    return group;
  };
  // Ligature
}

function Oblique(){
  // Oblique symbols in ligatures have only two members to worry
  // about. See below for the equivalent structure in neumes.
  this.objType = "Oblique";
  this.members = [];
  this.texts = [false, false];
  this.comments = [false, false]; //why two?
  this.before = false;
  this.startX = false;//curx;
  this.ligature = false;
  this.prevEventObj = false;
  this.nextEventObj = false;
  // Copy current classes
  this.classList = currentExample.classes ? currentExample.classes.classes.slice(0) : [];
  this.forwardEvent = function(variant){
    return this.members[0] ? this.members[0].forwardEvent(variant) : this.nextEvent(variant);
  };
  this.backwardEvent = function(variant){
    return this.members[1] ? this.members[1].backwardEvent(variant) :
      (this.members[0] ? this.members[0].backwardEvent(variant) :
       this.membersthis.prevEvent(variant));
  };
  this.prevEvent = function(variant){
    return this.prevEventObj ? this.prevEventObj.backwardEvent(variant) : false;
  };
  this.nextEvent = function(variant){
    return this.nextEventObj ? this.nextEventObj.forwardEvent(variant) : false;
  };
  this.enrichEvent = function(event, eventlist){
    if(event.objType == "Note"){
      event = new ObliqueNote(event);
      event.oblique = this;
      if(this.ligature) event.ligature = this.ligature;
    } 
    if(eventlist.length) {
      event.prevEventObj = eventlist[eventlist.length-1];
      eventlist[eventlist.length-1].nextEventObj = event.prevEventObj;
    }
    return event;
  };
  // Oblique
  this.extendMembers = function(event){
    if(event.objType=="ObliqueNote") {
      event.index = this.members.length;
    }
    if(this.members.length){
      event.prevEventObj = this.members[0]; //this.members[0].backwardEvent();
      event.forwardEvent().prevEventObj = this.members[0]; //this.members[0].backwardEvent();
      event.prevEventObj.nextEventObj = event;
      if(this.members[0].objType !=="ObliqueNote") {
        this.members[0].nextEventObj = event;
        for(var i=0; i<this.members[0].content.length; i++){
          this.members[0].content[i].content[0].nextEventObj = event;
        }
      }
    }
    if(event.objType==="ObliqueNote Choice"){
      for(var i=0; i<event.content.length; i++){
        if(event.content[i].content.length == 2){
          event.content[i].content[0].index = 0;
          event.content[i].content[1].index = 1;
          event.content[i].content[0].nextEventObj = event.content[i].content[1];
          event.content[i].content[1].prevEventObj = event.content[i].content[0];
        } else {
          event.content[i].content[0].index = this.members.length;
        }
      }
    }
    
    this.members.push(event);
  };
  this.toText = function(){
    var text = "<obl>";
    for(var i=0; i<this.members.length; i++){
      if(i>0) text += " ";
      text += this.members[i].toText();
      if(this.texts[i]) text += this.texts[i].toText();
      if(this.comments[i]) text += this.comments[i].toText();
    }
    return text + "</obl>";
  };
  this.width = function(){
    return oWidth(this.member(0, false).staffPos, this.member(1, false).staffPos);
//        rastralSize * prop + rastralSize * prop * Math.abs(this.members[1].staffPos - this.members[0].staffPos) / 4;
  };
  // Oblique
  this.drawTexts = function(){
    if(this.texts[0]){
      this.texts[0].draw();
    }
    if(this.texts[1]){
      curx += rastralSize;
      this.texts[1].draw();
      curx -= rastralSize;
    }
  };
  this.drawComments = function(){
    if(this.comments[0]){
      this.comments[0].draw();
    }
    if(this.comments[1]){
      curx += rastralSize;
      this.comments[1].draw();
      curx -= rastralSize;
    }
  };
  this.lstem = function(variant){
    // check forceTail
    switch(this.member(0, variant).forceTail){
      case "++":
        return 1;
      case "+-":
        return -1;      
    }
    if(this.member(0, variant).rhythm == "S"){
      foo = this.prevEvent(variant);
      if(this.prevEvent(variant) && this.prevEvent(variant).lstem(variant) == 1){
        return false;
      } else {
        return 1;
      }
    } else if (!this.prevEvent(variant) && this.member(0, variant).rhythm == "B"){
      return -1;
    }
    return false;
  };
  this.rstem = function(variant){
    return this.member(1, variant).rhythm=="L" || this.member(1, variant).forceTail == "+";
  };
  // Oblique
  this.member = function(i, variant){
    // var e = this.forwardEvent(variant);
    // for(var j=0; j<i; j++){
    //   e = e.nextEvent(variant);
    // }
    // return e;
    if(i==0){
      return this.forwardEvent(variant);
    } else {
      return this.backwardEvent(variant);
    }
  };
  this.width = function(variant){
    return oWidth(this.member(0, variant).staffPos, this.member(1, variant).staffPos);
  };
  this.drawVar = function(variant){
    this.startX = curx;
    this.drawTexts(variant);
    this.drawComments(variant);
    var m0 = this.member(0, variant);
    var m1 = this.member(1, variant);
    // Draw oblique bit
    if(!(m0&&m1)) return false;
    if(this.members[0].objType == "ObliqueNote Choice"){
      if(this.members[0].content[0].content.length == 1){
        if(variant){
          this.members[0].drawVar(variant);
        } else {
          this.members[0].draw();
        }
        if(this.members.length == 2){
          if(variant){
            this.members[1].drawVar(variant);
          } else {
            this.members[1].draw();
          }
        }
      } else {
        // The Choice is the full Oblique
        if(variant || !showvariants){
          m0.drawVar(variant);
          m1.drawVar(variant);
        } else {
          var click = m0.drawVar(false);
          click.id = "gii";
          click.style.fill = "#060";
          var tempSVG = SVG;
          if(!variant) addAnnotation(click, this.members[0], "Oblique MusicalChoice");
          SVG = tempSVG;
          click = m1.draw(m0);
          click.id = "wii";
          click.style.fill = "#060";
          if(!variant) addAnnotation(click, this.members[0], "Oblique MusicalChoice");
          SVG = tempSVG;
        }
      }
    } else {
      if(variant){
        this.members[0].drawVar(variant);
        this.members[1].drawVar(variant);          
      } else{
        this.members[0].draw();
        this.members[1].draw();
      }
    }
    //then left stem
    var ls = this.lstem(variant);
    if(ls){
      m0.drawLStem(ls);
    }
    var ppos = this.prevEvent(variant).staffPos;
    // Join
    if(ppos && Math.abs(ppos-m0.staffPos)>1){
      var met = metrics();
      var offset = currentSubType == "void" ? 
                     met.oblOffset+met.vThickness :
                     met.hThickness / 2;
      var joinTop = Math.max(yoffset(ppos), yoffset(m0.staffPos))+offset;
      var joinBottom = Math.min(yoffset(ppos), yoffset(m0.staffPos))-offset;
      
      svgLine(SVG, curx+met.vThickness, cury-joinBottom, curx+met.vThickness, cury-joinTop, "ligatureVertical join", false);
    }
    // FIXME: WHERE'S RSTEM?!?
    setDotPos(this.member(0, variant).staffPos);
    curx += oWidth(m0.staffPos, m1.staffPos);
    if(this.member(0, variant).dot){
      var oldx = curx;
      curx-= oWidth(m0.staffPos, m1.staffPos)/1.8;
      this.member(0, variant).dot.draw();
      curx = oldx;
    }
    setDotPos(this.member(1, variant).staffPos);
    if(this.member(1, variant).dot){
      var oldx = curx;
      curx+=rastralSize/2.5;
      this.member(1, variant).dot.draw();
      curx = oldx;
    }
    return false;
  };
  this.draw = function(prevPos, semi){
    this.drawVar(false);
  };
  // Oblique
}
function ObliqueNote(note, index, oblique){
  // Takes a normal note and generates more specialised object
  this.objType = "ObliqueNote";
  this.text = note.text;
  this.staffPos = note.staffPos;
  this.before = false;
  this.pitch = note.pitch;
  this.rhythm = note.rhythm;
  this.startX = false;
  this.startY = false;
  this.domObj = false;
  this.voidnotes = note.voidnotes;
  this.subType = note.subType;
  this.dot = false;
  this.example = note.example;
  this.forceTail = note.forceTail;
  this.oblique = false;
  this.ligature = false;
  this.index = false;
  this.prevEventObj = false;
  this.nextEventObj = false;
  // Copy current classes
  this.classList = currentExample.classes ? currentExample.classes.classes.slice(0) : [];
  this.forwardEvent = function(variant){return this;};
  this.backwardEvent = function(variant){return this;};
  this.prevEvent = function(variant){
    return this.prevEventObj ? this.prevEventObj.backwardEvent(variant) : false;
  };
  this.nextEvent = function(variant){
    return this.nextEventObj ? this.nextEventObj.forwardEvent(variant) : false;
  };
  //  ?? Necessary?
  this.varStartStaffPos = function(variant){ 
    return staffPosition(this);
  };
  this.varEndStaffPos = function(variant){ 
    return staffPosition(this);
  };
  this.toText = function(){
    var text = "";
    if(this.rhythm) text += this.rhythm;
    text += this.pitch ? this.pitch : this.staffPos.toString(16).toUpperCase();
    return text;  
  };
  this.drawLStem = function(l){
    var m = metrics();
    var stemLength = this.voidnotes || currentSubType=="void" 
      ? m.stemLength : m.stemLength/4;
    var offset = this.voidnotes  || currentSubType=="void" 
      ?  m.oblOffset+m.vThickness : m.hThickness/2;
    var extraClasses = "";
    var y = yPos(cury, staffPosition(this));
    if(this.classList.length){
      extraClasses = classString(this.classList);
    }
    svgLine(SVG, curx + m.vThickness, y-(l*stemLength), 
        curx+m.vThickness, y+(l*offset), 
        "ligatureVertical stem left"+extraClasses, false);
  };
  // Oblique Note
  this.drawRStem = function(){
    //??FIXME: Not called, but this is a guess
    var m = metrics();
    var stemLength = this.voidnotes ? m.stemLength : m.stemLength/4;
    var offset = this.voidnotes ?  m.objOffset*0.8+m.vThickness : m.hThickness/2;
    var extraClasses = "";
    var y = yPos(cury, staffPosition(this));
    if(this.classList.length){
      extraClasses = classString(this.classList);
    }
    svgLine(SVG, curx, y+stemLength, 
        curx, y-offset, 
        "ligatureVertical stem right"+extraClasses, false);
  };
  this.drawVar = function(variant){
    var extraClasses = "";
    if(this.classList.length){
      extraClasses = classString(this.classList);
      drawClasses(this.classList, this);
    }
    if(this.index === 0){
      return drawObliqueStart(staffPosition(this), 
        staffPosition(this.nextEvent(variant)), 
        (currentSubType==="black" || fullRule(this)), extraClasses);
    } else {
      return drawObliqueEnd(staffPosition(this), 
        staffPosition(this.prevEvent(variant)), 
        (currentSubType==="black" || fullRule(this)), extraClasses);
    }
  };
  this.draw = function(other){
    // It's easier if I know the other note in the oblique (in
    // previous times, this was unneccessary, since drawing was per
    // oblique, not per note.
    var extraClasses = "";
    if(this.classList.length){
      extraClasses = classString(this.classList);
      drawClasses(this.classList, this);
    }
    if(this.index === 0){
      return drawObliqueStart(staffPosition(this), other ? staffPosition(other)
                                                  : staffPosition(this.nextEvent(false)), 
                              (currentSubType==="black" || fullRule(this)), extraClasses);   
    } else {
      return drawObliqueEnd(staffPosition(this), other ? staffPosition(other)
                                                 : staffPosition(this.prevEvent(false)),
                              (currentSubType==="black" || fullRule(this)), extraClasses);
    }
  };
  // Oblique Note
}

function Neume(){
  this.objType = "Neume";
  this.startX = false;
  this.members = [];
  this.before = false;
  this.toText= function(){
    var text = "<neume>";
    for(var i=0; i<this.members.length; i++){
      if(i>0) text +=" ";
      text += this.members[i].toText();
    }
    return text + "</neume>";
  };
  this.width = function(){
    return (this.members.length+3/2)*rastralSize /2;
  };
  this.nextNote = function(index){
    for(var i=index+1; i<this.members.length; i++){
      if(compoundNotep(this.members[i])){
//      if(this.members[i].objType != "TextUnderlay"){
        return this.members[i];
      }
    }
    return false;
  };
  this.prevNote = function(index){
    for(var i=index-1; i>=0; i--){
      if(compoundNotep(this.members[i])){
//      if(this.members[i].objType != "TextUnderlay"){
        return this.members[i];
      }
    }
    return false;
  };
  this.prevPos = function(index){
    var note = this.prevNote(index);
    return note.objType == "ObliqueNeume" ? note.members[1].staffPos : note.staffPos;
  };
  this.nextPos = function(index){
    var note = this.nextNote(index);
    return note.objType == "ObliqueNeume" ? note.members[0].staffPos : note.staffPos;
  };
  this.draw = function(){
    this.startX = curx;
    if(currentSubType.toLowerCase() == "hufnagel"){
      this.drawHufnagel();
    } else {
      this.drawSquare();
    }
  };
  // Neume
  this.drawHufnagel = function(){
    var item, extraClasses = "";
    for(var i=0; i<this.members.length; i++){
      item = this.members[i];
      if(item.objType=="TextUnderlay" || item.objType=="Comment"){
        curx -=rastralSize*0.6*prop;
        if(i===0 && underlays.length){
          curx = Math.max(curx, underlayRight());            
        }
        item.draw();
        curx +=rastralSize*0.6*prop;
      } else {
        if(item.text) {
          curx -=rastralSize*0.6*prop;
          if(i===0 && underlays.length){
            curx = Math.max(curx, underlayRight());            
          }
          item.text.draw();
          curx +=rastralSize*0.6*prop;
        }
        if(i>0){
          curx += neumeStep(prev, item.staffPos);
          // FIXME: when is this coloured?
          drawNeumeJoin(curx, cury, this.prevPos(i), item.staffPos, false, false, extraClasses);
        }
        if(item.objType == "NeumeItem") {
          if(item.classList.length){
            extraClasses = classString(this.classList);
            drawClasses(this.classList, this);
          }
          drawRhombus(curx, cury - yoffset(item.staffPos), false, 
            item.ltail, item.rtail, extraClasses);
          prev = item.staffPos;
        } else {
          prev = item.draw(this.prevPos(i), false);
        }
      }
    }
    curx += rastralSize;
  };
  // Neume
  this.drawSquare = function(){
    var m = metrics();
    var item;
    var step = m.chantThickness - 1;
//    var hstep = m.chantThickness /2;
    var hstep = m.chantThickness /2;
    var prevStep = 0;
    var prev = false;
    var extraClasses = "";
    curx += step;
    var nudge = 0;
    // Can only really adject position of first note for text spacing
    if(this.members[0].text && underlays.length){
      curx = Math.max(curx, underlayRight());
    }
    for(var i=0; i<this.members.length; i++){
      item = this.members[i];
      if(item.objType=="TextUnderlay" || item.objType == "Comment"){
        var oldx = curx;
        curx -= prevStep;
        item.draw();
        curx = oldx;
      } else if (item.objType == "NeumeItem"){
        if(item.text) {
          curx -=step*0.8;
          if(i===0 && underlays.length){
            curx = Math.max(curx, underlayRight());
          }
          item.text.draw();
          curx +=step*0.8;
        }
        if(item.sup) {
          if(item.staffPos-prev == 1){
            nudge = -2;
          } else if (item.staffPos-prev == -1){
            nudge = 2;
          }
        } else {
          nudge=0;
        }
        if(i>0) {
          if(item.staffPos == prev){
            curx += hstep;
          } else {
            var top = Math.max(yoffset(prev), yoffset(item.staffPos)-nudge);
            var bottom = Math.min(yoffset(prev), yoffset(item.staffPos)-nudge);
            var thisx = curx+0.5-hstep;
//            var thisx = curx+0.5-hstep;
            // There was an if(item.sup) here, but it did nothing
            // svgLine(SVG, thisx, cury-top-hstep, thisx, cury-bottom+hstep, 
            //   "neumeLine"+extraClasses, false);
            svgLine(SVG, thisx, cury-top-hstep, 
                    thisx, cury-bottom+hstep, 
                    "neumeLine"+extraClasses, false);
          }
        }
        if(item.classList.length){
          extraClasses = classString(item.classList);
          drawClasses(item.classList, this);
        }
        drawChantBox(curx, cury - yoffset(item.staffPos), item.ltail, item.rtail,
                     false, item.sup, nudge);
        nudge = 0;
        prev = item.staffPos;
        curx += item.sup ? 0 : step;
        prevStep = item.sup ? 0 : step;
      } else {
        curx -= hstep - 1;
//        curx -= step + 2;
        prev = item.draw(prev, false);
        curx += hstep;//+2;
        prevStep = 0; //step-1;
      }
    }
    curx += step;
//    curx += rastralSize;
    setDotPos(this.members[1].staffPos);
    suppressBreak = false;
  };
  // Neume
}

function NeumeItem(){
  this.objType = "NeumeItem";
  this.text = false;
//  this.startX = false;
  this.before = false;
  this.pitch = false;
  this.staffPos = false;
  this.ltail = false;
  this.rtail = false;
  this.sup = false;
  // Copy current classes
  this.classList = currentExample.classes ? currentExample.classes.classes.slice(0) : [];
  this.toText = function(){
    var text = this.sup ? "^" : "";
    if(this.ltail) text += "t";
    text += this.pitch || this.staffPos.toString(16).toUpperCase();
    if(this.rtail) text += "t";
    return text;
  };
  // Neume Item
}

function ObliqueNeume(){
  this.objType = "ObliqueNeume";
  this.startX = false;
  this.members = [];
  this.before = false;
  this.texts = [false,false];
  this.comments = [false, false];
  // Copy current classes
  this.classList = currentExample.classes ? currentExample.classes.classes.slice(0) : [];
  this.toText = function(){
    var text = "<obl>";
    for(var i=0; i<2; i++){
      if(i>0) text += " ";
      text += this.members[i].toText();
      if(this.texts[i]) text += " "+this.texts[i].toText();
      if(this.comments[i]) text += " "+this.comments[i].toText();
    }
    return text + "</obl>";
  };
  this.drawTexts = function(){
    if(this.texts[0]){
      this.texts[0].draw();
    }
    if(this.texts[1]){
      curx += rastralSize;
      this.texts[1].draw();
      curx -= rastralSize;
    }
  };
  this.drawComments = function(){
    if(this.comments[0]){
      this.comments[0].draw();
    }
    if(this.comments[1]){
      curx += rastralSize;
      this.comments[1].draw();
      curx -= rastralSize;
    }
  };
  this.draw = function(prevPos, tail){
    // FIXME: make like ligature oblique
    extraClasses = "";
    this.startX = curx;
    this.drawTexts();
    this.drawComments();
    if(this.classList.length){
      extraClasses = classString(this.classList);
      drawClasses(this.classList, this);
    }
    drawOblique(this.members[0].staffPos, this.members[1].staffPos, prevPos,
       rastralSize, this.members[0].ltail ? -1 : false, 
       this.members[1].rtail, extraClasses);
    setDotPos(this.members[1].staffPos);
    return this.members[1].staffPos;
  };
  // Oblique Neume
}

///////
// 1b. Rests
//

function Rest(){
  this.objType = "Rest";
  this.rhythm = false;
  this.staffPos = false;
//  this.pitch = false;
  this.startX = false;
  this.before = false;
  this.domObj = false;
  this.example = currentExample;
  this.index = eventi;
  // Copy current classes
  this.classList = currentExample.classes ? currentExample.classes.classes.slice(0) : [];
  this.toText = function(){
    var text = "P";
    if(this.rhythm) text += this.rhythm;
    if(this.staffPos) text += this.staffPos.toString(16).toUpperCase();
    return text;
  };
  this.width = function(){
    var width = 0;
    if(this.rhythm){
      width += restDictionary[this.rhythm][2]*rastralSize * prop;
    }
    return width;
  };
  this.draw = function(){
    var extraClasses = "";
    var spos = staffPosition(this);
    this.startX = curx;
    if(this.classList.length){
      extraClasses = classString(this.classList);
      drawClasses(this.classList, this);
    }
    //curx -= rastralSize /2;
    curx -= rastralSize /3;
    if(spos && this.rhythm) {
      this.domObj = svgGroup(SVG, 
        "restGroup"+extraClasses+(editable ? " clickable" : ""), false);
      // if(this.staffPos <= 2){
      //   drawLedgerLine(curx, cury);
      // }
      if(this.staffPos % 2 == 0){
        this.staffPos += 1;
      }
      if(getRestGlyph(voidGlyphMap, this.rhythm)){
        myglyph = getRestGlyph(voidGlyphMap, this.rhythm);
        var oldSVG = SVG;
        SVG = this.domObj;
        obj = myglyph.draw(curx, yPos(cury, spos), rastralSize, 
                         "mensural rest " + this.rhythm+(this.pitch ? this.pitch : this.staffPos));
        SVG = oldSVG;
        curx+= myglyph.advanceWidth(rastralSize);
      } else {
        var charData = restDictionary[this.rhythm];
        svgText(this.domObj, curx, texty(charData[1], spos), 
                "mensural rest "+this.rhythm, false, restStyle(), 
                charData[0]);
        curx += charData[2] * rastralSize;
      }
      setDotPos(spos);
    }
    if(editable){
      $(this.domObj).hover(shiftHoverToShift(this, 2), hoverOutShiftChecked());
    }
  };
  // Rest
}

function LongRest() {
  this.objType = "LongRest";
  this.start = false;
  this.end = false;
  this.startX = false;
  this.domObj = false;
  // Copy current classes
  this.classList = currentExample.classes ? currentExample.classes.classes.slice(0) : [];
  this.toText = function(){
    var text = "PL";
    if(this.start) {
      text += this.start;
      if(this.end) text += "-"+this.end;
    }
    return text;
  };
  this.width = function(){
    return 3*rastralSize / 2;
  };
  this.draw = function(){
    var extraClasses = "";
    this.startX = curx;
    curx+=(rastralSize+1.5) / 2.5;;
    var start = this.start ? this.start : 2; // silly defaults
    var end = this.end ? this.end : 8; // silly defaults
    if(start%2!=0){
      start--;
    }
    if(end%2!=0){
      end++;
    }
    if(this.classList.length){
      extraClasses = classString(this.classList);
      drawClasses(this.classList, this);
    }
    this.domObj = svgGroup(SVG, "longRest", false);
    var oldSVG = SVG;
    SVG = this.domObj;
    switch(end - start){
      default:
        drawSmallBarline(start, end, 2);
    }
    SVG = oldSVG;
//    curx += 3 * rastralSize / 2;
    curx += (rastralSize+1) / 2;
    return this.domObj;
    // Dot pos?
  };
  // Long Rest
}

function MaxRest() {
  this.objType = "MaxRest";
  this.start = false;
  this.end = false;
  this.multiple = 2;
  this.startX = false;
  this.domObj = false;
  // Copy current classes
  this.classList = currentExample.classes ? currentExample.classes.classes.slice(0) : [];
  this.toText = function(){
    var text = "PL";
    if(this.start) {
      text += this.start;
      if(this.end) text += "-"+this.end;
      return text + "x"+ this.multiple;
    }
    return text;
  };
  this.width = function() {
    return rastralSize * 2;
  };
  this.draw = function(){
    this.domObj = svgGroup(SVG, "maxRestGroup", false);
    var extraClasses = "";
    this.startX = curx;
    curx += rastralSize/6;
    var start = this.start || 5; // silly defaults
    var end = this.end || 9; // silly defaults
    if(start%2!=0){
      start--;
    }
    if(end%2!=0){
      end++;
    }
    if(this.classList.length){
      extraClasses = classString(this.classList);
      drawClasses(this.classList, this);
    }
    var classString = "mensural rest M"+extraClasses;
    switch(end - start){
      default:
        // FIXME: Make group?
        for(var i=0; i<this.multiple; i++) {
          var oldSVG = SVG;
          SVG = this.domObj;
          drawSmallBarline(start, end, 2, classString);
          SVG = oldSVG;
          curx += rastralSize /2;
        }
    }
//    curx += rastralSize * 2;
    curx += rastralSize/6;
    return this.domObj;
  };
  // Max Rest
}

////////////////////////////////////////
// 2. Clefs and Signatures

function Notation(){
  this.objType = "Notation";
  this.type = false;
  this.startX = false;
  this.subtype = false;
  this.toText = function(){
    return "{"+this.type+": "+this.subtype+"}";
  };
  this.width = function(){return 0;};
  this.draw = function(){
    this.startX = curx;
    currentType = this.type;
    currentSubType = this.subtype;
  };
  // Notation
}

function MensuralSignature(){
  this.objType = "MensuralSignature";
  this.startX = false;
  this.signature = false;
  this.staffPos = false;
  this.domObj = false;
  this.sup = false;
  this.example = currentExample;
  this.editorial = false;
  this.classList = currentExample.classes ? currentExample.classes.classes.slice(0) : [];
  this.toText = function(){
    var text = "{mens: ";
    if(this.signature) text += this.signature;
    if(this.staffPos) text += ", "+this.staffPos.toString(16).toUpperCase();
    return text + "}";
  };
  this.width = function(){
    if(this.signature && mensDictionary[this.signature]){
      return mensDictionary[this.signature][2] * rastralSize * prop - 2/3*rastralSize
        + (this.editorial ? 2*rastralSize : 0);
    } else return 0;
  };
  this.draw = function(){
    var extraClasses = this.editorial ? " editorial" : "";
    if(this.sup && eventi>0){
      var oldcurx=curx;
      curx = currentExample.events[eventi-1].startX;
      // FIXME: do something smarter
      if(!curx) curx = oldcurx;
    }
    this.startX = curx;
    if(this.text){
      this.text.draw();
    }
    if(this.classList.length){
      extraClasses = classString(this.classList);
      drawClasses(this.classList, this);
    }
    if(this.signature && this.staffPos && this.signature.length){
      // FIXME: HACK!!! (for kerning -- RW's glyphs have leading space)
//      curx -= 2*rastralSize/3;
      var charData;
      this.domObj = svgGroup(SVG, "Mensuralgroup", false);
      var oldSVG = SVG;
      var obj;
      SVG = this.domObj;
      if(this.editorial) {
        var sb = squareBracket(curx, texty(braceOff, this.staffPos), true, extraClasses);
        curx+=sb.getBoundingClientRect().width;
      }
      if((obj = arsNovaVoid[this.signature+"Mens"])){
        obj.draw(curx, cury-yoffset(this.staffPos), rastralSize, 
                 "mensural menssign "+this.signature+this.staffPos+extraClasses);
        curx += obj.advanceWidth(rastralSize);
      } else {
        charData = mensDictionary[this.signature];
        svgText(SVG, curx, texty(charData[1]*prop, this.staffPos),
                "mensural menssign "+this.signature+extraClasses, false, mensStyle(), charData[0]);
        if(charData[3]){
          svgText(this.domObj, curx, texty(charData[1]*prop, this.staffPos),
                  "mensural menssign slash"+extraClasses, false, musicStyle(), charData[3]);
        };
        curx += charData[2] * rastralSize * prop;
      }
      if(this.editorial) {
        var sb = squareBracket(curx, texty(braceOff, this.staffPos), false, extraClasses);
        curx+=sb.getBoundingClientRect().width;
      }
      if(editable){
        $(SVG).hover(shiftHoverToShift(this, 2), hoverOutShiftChecked());
      }    
      SVG = oldSVG;
      return this.domObj;
    }
    return false;
  };
  // Mensural Signature
}

function SolmizationSignature() {
  this.objType = "SolmizationSignature";
  this.members = [];
  this.startX = false;
  this.text = false;
  this.example = currentExample;
  currentExample.staves.push([currentExample.events.length, this]);
  this.domObj = false;
  this.params = false;
  this.appliesTo = false;
  currentSolm = this;
  // Copy current classes
  this.classList = currentExample.classes ? currentExample.classes.classes.slice(0) : [];
  this.toText = function(){
    var text = "{solm: ";
    if(this.members.length) {
      for(var i=0; i<this.members.length; i++){
        if(i>0) text += " ";
        text += this.members[i].toText();
      }
      if(this.text) text += this.text.toText();
    } else text += "0";
    return text + "}";
  };
  this.width = function(){
    return this.members.reduce(function(p,e,i,a){return Math.max(p, e.width());}, 0);
  };
  this.draw = function(){
//    breakIfNecessary();
    this.startX = curx;
    currentSolm = this;
    if(!this.members.length) return;
    var obj = svgGroup(SVG, "solmizationSignature", false);
    var oldsvg = SVG;
    SVG = obj;
    if(this.text){
      this.text.draw();
    }
    var lastx = curx;
    for(var i=0;i< this.members.length; i++){
      this.members[i].draw();
      // Remember the widest glyph
      lastx = Math.max(lastx, curx);
      if(i<this.members.length - 1 && this.members[i+1].sup) curx = this.members[i].startX;
    }
    // Use the widest spacing
    curx = lastx;
    SVG = oldsvg;
    return obj;
  };
  // Solmization Signature
}

function SolmizationSign(){
  this.objType = "SolmizationSign";
  this.symbol = false;
  this.staffPos = false;
  this.pitch = false;
  this.sup = false;
  this.example = currentExample;
  this.domObj = false;
  this.startX = false;
  // Copy current classes
  this.classList = currentExample.classes ? currentExample.classes.classes.slice(0) : [];
  this.toText = function(){
    return this.symbol + (this.pitch || this.staffPos.toString(16).toUpperCase());
  };
  this.width = function(){
    if(this.symbol && solmDictionary[this.symbol]){
      return solmDictionary[this.symbol][2] * rastralSize;
    } else return 0;
  };
  this.draw = function(){
    var extraClasses = "";
    var pos = this.staffPos || (this.pitch && staffPosFromPitchString(this.pitch));
    this.startX = curx;
    if(this.classList.length){
      extraClasses = classString(this.classList);
      drawClasses(this.classList, this);
    }
    if(this.symbol && pos){
      if(this.domObj = arsNovaVoid[this.symbol+"Solm"]){
        this.domObj.draw(curx, cury-yoffset(pos), rastralSize,
                         "mensural solmisation "+this.symbol+extraClasses);
        curx += this.domObj.advanceWidth(rastralSize);
      } else {
        var chardata = solmDictionary[this.symbol];
        this.domObj = svgText(SVG, curx, texty(chardata[1], pos), 
                              "mensural solmisation "+this.symbol+extraClasses,
                              false, musicStyle(), chardata[0]);
        curx+=chardata[2]*rastralSize;
      }
    }
  };
  // Solmization sign
}

function Clef() {
  this.objType = "Clef";
  this.startX = false;
  this.type = false;
  this.staffPos = false;
  this.example = currentExample;
  this.domObj = false;
  this.params = false;
  this.editorial = false;
  this.appliesTo = false;
  this.erroneousClef = false;
  currentExample.staves.push([currentExample.events.length, this]);
  // Copy current classes
  this.classList = currentExample.classes ? currentExample.classes.classes.slice(0) : [];
  currentClef = this;
  this.toText = function(){
    //FIXME: variants
    var text = "{clef: ";
    if(this.editorial) text+="[";
    if(this.type) text += this.type;
    if(this.staffPos) text += this.staffPos.toString(16).toUpperCase();
    if(this.editorial) text+="]";
    return text + "}";
  };
  this.pitchOffset = function(){
    return this.staffPos - clefOffsets[this.type];
  };
  this.width = function(){
    if(this.type && clefDictionary[this.type]){
      return clefDictionary[this.type][2] * rastralSize - rastralSize / 2 * prop
        + (this.editorial ? 2*rastralSize : 0);
    } else return 0;
  };
  // Clef
  this.draw = function(){
    var oldSVG = SVG;
    var oldX = this.startX;
    this.domObj = svgGroup(SVG, "mensgroup", false);
    SVG = this.domObj;
    var extraClasses = "";
    currentClef = this;
    this.startX = curx;
    if(this.classList.length){
      extraClasses = classString(this.classList);
      drawClasses(this.classList, this);
    }
    if(this.editorial) {
      var sb = squareBracket(curx, texty(braceOff, this.staffPos), true, extraClasses);
      curx+=sb.getBoundingClientRect().width;
    }
    if(this.type && this.staffPos){
      curx -= rastralSize / 2 * prop;
      if (currentType== "mensural" && currentSubType == "void"){
        arsNovaVoid[this.type+"Clef"]
          .draw(curx, cury-yoffset(this.staffPos), rastralSize, 
                "mensural clef " +this.type+this.staffPos+(this.editorial ? " editorial" : "")
                  +extraClasses);
        curx+=arsNovaVoid[this.type+"Clef"].advanceWidth(rastralSize);
      } else if(currentType == "plainchant"){
        if(this.type == "F"){
          curx += rastralSize / 2 * prop;
        }
        arsNovaVoid[this.type+"ClefChant"]
          .draw(curx, cury-yoffset(this.staffPos), rastralSize, 
                "plainchant clef " +this.type+this.staffPos+(this.editorial ? " editorial" : "")
                +extraClasses);
        curx+=arsNovaVoid[this.type+"ClefChant"].advanceWidth(rastralSize);
      }
    }
    if(this.editorial) {
      var sb = squareBracket(curx, texty(braceOff, this.staffPos), false, extraClasses);
      curx += sb.getBoundingClientRect().width;
    }
    if(editable){
      $(this.domObj).hover(shiftHoverToShift(this, 2), hoverOutShiftChecked());
    }
    curx+=rastralSize/2;
    if(this.erroneousClef){
      this.erroneousClef.draw();
      currentClef = this;
    }
    SVG = oldSVG;
    if(oldX) this.startX = oldX;
    return this.domObj;
  };
  // Clef
}

function Staff() {
  this.objType = "Staff";
  this.lines = false;
  this.colour = false;
  this.extras = [];
  this.appliesTo = false;
  // Copy current classes
  this.classList = currentExample.classes ? currentExample.classes.classes.slice(0) : [];
  currentSystem = this;
  currentExample.staves.push([currentExample.events.length, this]);
  this.toText = function(){
    // FIXME: for edited version
    return "{staf: "+valueText(this.lines)+", "+valueText(this.colour)+"}";
  };
  this.varLines = function(wit){
    switch (typeof(this.lines)){
      case "string":
      case "number":
        return this.lines;
      case "undefined":
        return 1;
      default:
        if(wit){
          return witnessReading(wit, this.lines).value;
        } else {
          return this.trueLines();
        }
    }
  };
  this.varColour = function(wit){
    return ((typeof(this.colour)==="string" || !wit) 
            ? this.colour
            : witnessReading(wit, this.colour).value);
  }
  this.width = function(){return 0;};
  this.trueLines = function(){
    switch (typeof(this.lines)){
      case "string":
      case "number":
        return this.lines;
      case "undefined":
        return 1;
      default:
        if(typeof(this.lines.content) == "undefined"){
          return 1;
        } else {
          return this.lines.content[0].value;
        }
    }
  };
  this.trueColour = function(){
    return typeof(this.colour) == "string" ? this.colour :
      (!this.colour ? "red" : this.colour.content[0].value);
  };
  // Staff
  this.draw = function(){
    var olc = noBreaks ? currentLinecount : this.trueLines();
    var osc = noBreaks ? currentStaffColour : this.trueColour();
    if(noBreaks) {
      drawSystemLines(systemLines[0], systemLines[1], 
                      systemLines[4]-rastralSize*systemLines[1],
                      Math.max(systemLines[3]-10, 0), curx-10,
                      systemLines[2]);
    } else {
      sysBreak2();
    }
    currentLinecount = this.trueLines();
    currentStaffColour = this.trueColour();
    if(noBreaks) {
      systemLines = [systemLines[0], currentLinecount, 
                     currentStaffColour, curx, cury];
    } else {
      sysBreak();
    }
    var clef = findClef(this.extras);
    var solm = findSolm(this.extras);
    if(clef) clef.draw();
    if(solm) solm.draw();
  };
  // Staff
}

function Part(){
  this.objType = "Part";
  this.id = false;
  this.toText = function(){
    return "<part: "+this.id+">";
  }
  this.width = function(){return 0;};
  this.draw = function(){
    return false;
  }
}

////////////////////////////////////////
// 3. Misc Breaks

function Barline(){
  this.objType = "Barline";
  this.start = false;
  this.end = false;
  this.multiple = 1;
  this.startX = false;
  // Copy current classes
  this.classList = currentExample.classes ? currentExample.classes.classes.slice(0) : [];
  this.toText = function(){
    var text = "|";
    for(var i=1; i<this.multiple; i++){
      text += "|";
    }
    if(this.start) text += this.start.toString(16).toUpperCase();
    if(this.end) text += "-"+this.end.toString(16).toUpperCase();
    return text;
  };
  this.width = function(){return rastralSize*this.multiple / 3;};
  this.draw = function() {
    var extraClasses = currentType ==="plainchant" ? " chantbar " : "";
    this.startX = curx;
    if(this.classList.length){
      extraClasses = classString(this.classList);
      drawClasses(this.classList, this);
    }
    if(currentRedline){
      this.drawFlash();
    } else {
//      this.startX = curx;
      for(var i=0; i<this.multiple; i++){
        if((this.start || this.start==0) && this.end){
          drawPartialBarline(curx, cury, this.start, this.end, extraClasses);
        } else {
          drawBarline(curx, cury, extraClasses);
        }
        curx += rastralSize / 3;
      }
      curx += rastralSize * 1 / 3;
    }
  };
  this.drawFlash = function(){
    // FIXME!!
    var start = (this.start || this.start===0) ? cury-yoffset(this.start) : cury-rastralSize;
    var end = (this.end || this.end===0) ? cury-yoffset(this.end)
                : cury-(rastralSize*currentLinecount);
    svgLine(SVG, curx, start, curx, end, "barlineComponent", false);
    curx += rastralSize / 6;
    svgLine(SVG, curx, start, curx, end, "barlineComponent red", false);
    curx += rastralSize / 6;
    for(var i=0; i<this.multiple-1; i++){
      svgLine(SVG, curx, start, curx, end, "barlineComponent");
      curx += rastralSize / 6;
    }
    drawScallopedBarline(curx, start, end, false);
  };
  // Barline
}

function Repeat(){
  this.objType = "Repeat";
  this.start = false;
  this.end = false;
  this.multiple = false;
  this.ldots = false;
  this.rdots = false;
  this.domObj = false;
  this.classList = currentExample.classes ? currentExample.classes.classes.slice(0) : [];
  this.toText = function(){ 
    //FIXME:
    return "";
  };
  this.width = function(){
    return (2+this.multiple) * rastralSize/2;
  };
  this.draw = function(){
    var start = this.start;
    var end = this.end;
    var ldots = this.ldots ? this.ldots : this.ldots = repeatDotArray(start, end);
    var rdots = this.rdots ? this.rdots : this.rdots = repeatDotArray(start, end);
    var extraClasses = "";
    var oldSVG = SVG;
    this.domObj = svgGroup(SVG, "repeatGroup", false);
    SVG = this.domObj;
    this.startX = curx;
    curx+=rastralSize/6;
    var step = rastralSize/3;
    var radius = rastralSize*0.12;
    if(start%2!=0){
      start--;
    }
    if(end%2!=0){
      end++;
    }
    if(this.classList.length){
      extraClasses = classString(this.classList);
      drawClasses(this.classList, this);
    }
    var classString = "mensural repeat"+extraClasses;
    for(var i=0; i<this.ldots.length; i++){
      svgCircle(SVG, curx, cury-yoffset(this.ldots[i]), radius, 
                "repeatdot mensural"+extraClasses);
    }
    curx += step;
    for(var i=0; i<this.multiple; i++) {
      drawSmallBarline(start, end, 2, classString);
      curx += step;
    }
    for(var i=0; i<this.rdots.length; i++){
      svgCircle(SVG, curx, cury-yoffset(this.rdots[i]), radius, 
                "repeatdot mensural"+extraClasses);
    }
    SVG = oldSVG;
    curx+=rastralSize/2;
    return this.domObj;
  };
  // Repeat
}

function Comment(){
  this.objType = "Comment";
  this.content = false;
  this.width = function() {return 0;};
  this.startX = false;
  this.commentStyle = commentStyle;
  this.endX = false;
  this.startY = false;
  this.endY = false;
  // Copy current classes
  this.classList = currentExample.classes ? currentExample.classes.classes.slice(0) : [];
  this.toText = function(){
    return "**"+this.content+"**";
  };
  this.updateStyles = function(styles){
    return styles;
  };
  this.draw = function(){
    var drawnx = curx;
    this.startY = cury;
    if(eventi==-1){
        drawnx = 0;
        this.startY -= rastralSize * currentLinecount / 2 - 11;
    } else if(this == currentExample.events[eventi]) {
      // We're not in a compound form (e.g. a ligature), and so this
      // comment applies to the *previous* element
      if(eventi==0){
        drawnx = lmargin + rastralSize;
      } else {
        drawnx = currentExample.events[eventi-1].startX;// - (rastralSize*prop);//why?
        if(typeof(currentExample.events[eventi-1].domObj)!="undefined" &&
           currentExample.events[eventi-1].domObj && false){
          // FIXME: round to a space
          this.startY = Math.max(25, currentExample.events[eventi-1].domObj.getBoundingClientRect().top + 15);
          this.startX = currentExample.events[eventi-1].domObj.getBoundingClientRect().left +3;
        } else if(staffPosition(currentExample.events[eventi-1])){
          this.startY -= yoffset(staffPosition(currentExample.events[eventi-1])+2)-11;
        } else {
          this.startY -=  rastralSize * currentLinecount -11;
        }
      }
    } else {
      // Compound form, so x position is taken care of. FIXME: For now, fudge height
      if(currentExample.events[eventi].objType=="TextUnderlay"){
        this.startY += rastralSize *2.5;
      } else {
        this.startY -= rastralSize * currentLinecount;
      }
    }
    this.startX = drawnx;
    this.endY = this.startY - Math.floor(rastralSize * textScale * 2);
    var star = svgText(SVG, drawnx, this.startY, "annotation musical", false, false, "*");
    if(!star) alert("oo");
    var j = currentExample.comments.indexOf(this);
    if(j===-1){
      console.log(["Comment error", currentExample]);
    } else {
      star.setAttributeNS(null, "onmouseover", "top.tooltipForComment("+examplei+","+j+", "+(this.startX+10)+","+(10+this.startY)+");");
      star.setAttributeNS(null, "onmouseout", "top.removeTooltip()");
    }
  };
  // Comment
}

function tooltipForComment(i, j, x, y){
  var svgel = examples[i][1];
  var offset = $(svgel).offset();
  var tip = Tooltip(examples[i][0].comments[j].content);
  tip.style.position = "fixed";
  tip.style.top = offset.top+y+"px";
  tip.style.left = offset.left+x+"px";
  resize();
}

function ColumnStart(){
  this.objType = "ColumnStart";
  this.id = false;
  this.startX = false;
  this.toText = function() {
    return "[-"+this.id+"-]";
  };
  this.width = function() {return 0;};
  this.draw = function() {
    // this setting just so the slot is filled. Not sure what it means in this context
    this.startX = curx;
    var l = svgLine(SVG, 0, cury+(rastralSize*2), exWidth, cury+(rastralSize*2), "colend", false);
    var t = svgText(SVG, exWidth-70, cury+rastralSize*3, "col", false, false, this.id);
    currentExample.colbreaks.push([l,t]);
  };
}

////////////////////////////////////////
// 4. Underlay text and text tags

// For now, captions and lyrics are regarded as the same. No spacing
// is allocated for them.

function TextUnderlay(){
  this.objType = "TextUnderlay";
  this.type = "text";
  this.position = 0;
  this.components = [];
  this.startX = false;
  this.classList = currentExample.classes ? currentExample.classes.classes.slice(0) : [];
  this.width = function() {return 0;};
  this.updateStyles = function(styles){
    // FIXME: WTF??
    return styles;
  };
  this.toText = function(){
    var text = "<text>";
    for(var i=0;i<this.components.length; i++){
      if(typeof(this.components[i]) == "string"){
        text += this.components[i];
      } else {
        text += this.components[i].toText();
      }
    }
    return text + "</text>";
  };
  this.draw = function(){
    this.startX = curx;
    if(this == currentExample.events[eventi]){
      // If we're not in a compound form, we need to be positioned
      // beneath *previous* glyph
      if(eventi == 0){
        curx = rastralSize;
      } else if (currentExample.events[eventi-1].objType != "TextUnderlay"){
        if(!currentExample.events[eventi-1].startX){
          // FIXME: This seems to happen for texts with musical choice in them
          currentExample.events[eventi-1].startX = curx; // for now
        }
        curx = currentExample.events[eventi-1].startX;
      }
      if(curx < lmargin){
        curx = lmargin;
      }
    } else {
      curx = Math.max(curx, underlayRight());
    }
    var textBlock = SVG.nodeName.toUpperCase()==="TEXT" ? SVG 
      : svgText(SVG, curx, cury+rastralSize, "textblock", false, false, false);
    var oldSVG = SVG;
    SVG = textBlock;
    var styles = new Array();
    for(var i=0; i<this.components.length; i++){
      if(typeof(this.components[i]) == "string"){
        if(this.components[i].length>0 && /\S+/.test(this.components)){
          var txt = svgSpan(SVG, (styles.length ? textClasses(styles) :"text"), false,
            this.components[i]);
          // FIXME: Unneccessary now?
          // var dx = txt.getBBox().width;
          // curx += dx;
        }
      } else {
        if(this.components[i].objType == "MusicalChoice") {
          this.components[i].textBlock = textBlock;
          this.components[i].styles = styles;
        }
        this.components[i].draw();
        styles = this.components[i].updateStyles(styles);
      }
    }
    SVG = oldSVG;
    curx = this.startX;
    if($(SVG).parent("#content")) underlays.push(textBlock);
    return textBlock;
  };
  // Text Underlay
}

function RedOpen(){
  this.objType = "RedOpen";
  this.classString = "red";
  this.closes = false;
  this.startX = false;
  this.oneOff = false;
  this.toText = function() {
    return "<red>";
  };
  this.width = function() {return 0;};
  this.draw = function(){
    currentExample.classes.addClass(this);
    this.startX = curx;
  };
  this.updateStyles = function(styles){
    styles.push('red');
    return styles;
  };
  this.checkClose = function(){
    return string.indexOf("</red>")>-1;
  };
}

function RedClose(){
  this.objType = "RedClose";
  this.closes = "RedOpen";
  this.startX = false;
  this.toText = function() {
    return "</red>";
  };
  this.width = function() {return 0;};
  this.updateStyles = function(styles){
    // remove styles until the red one is found. This may not be ideal
    // behaviour, but it will be correct if there tags are legal
    // XML-oid ones
    while(styles.pop()!= 'red' && styles.length);
    return styles;
  };
  this.draw = function(){
    currentExample.classes.addClass(this);
    this.startX = curx;
  };
}

function BlueOpen(){
  this.objType = "BlueOpen";
  this.classString = "blue";
  this.closes = false;
  this.startX = false;
  this.oneOff = false;
  this.toText = function() {
    return "<blue>";
  };
  this.width = function() {return 0;};
  this.draw = function(){
    currentExample.classes.addClass(this);
    this.startX = curx;
  };
  this.updateStyles = function(styles){
    styles.push('blue');
    return styles;
  };
  this.checkClose = function(){
    return string.indexOf("</blue>")>-1;
  };
}

function BlueClose(){
  this.objType = "BlueClose";
  this.closes = "BlueOpen";
  this.startX = false;
  this.toText = function() {
    return "</blue>";
  };
  this.width = function() {return 0;};
  this.updateStyles = function(styles){
    // remove styles until the red one is found. This may not be ideal
    // behaviour, but it will be correct if there tags are legal
    // XML-oid ones
    while(styles.pop()!= 'blue' && styles.length);
    return styles;
  };
  this.draw = function(){
    currentExample.classes.addClass(this);
    this.startX = curx;
  };
}

function RedlineOpen(){
  this.objType = "RedlineOpen";
  this.startX = false;
  this.oneOff = false;
  this.toText = function() {
    return "<redline>";
  };
  this.width = function() {return 0;};
  this.draw = function(){
    currentExample.classes.addClass(this);
    currentRedline = true;
    this.startX = curx;
  };
  this.updateStyles = function(styles){
    styles.push('redline');
    return styles;
  };
  this.checkClose = function(){
    // currentExample.classes.addClass(this);
    return string.indexOf("</redline>")>-1;
  };
}

function RedlineClose(){
  this.objType = "RedlineClose";
  this.closes = "RedlineOpen";
  this.startX = false;
  this.toText = function() {
    return "</redline>";
  };
  this.width = function() {return 0;};
  this.updateStyles = function(styles){
    // remove styles until the red one is found. This may not be ideal
    // behaviour, but it will be correct if there tags are legal
    // XML-oid ones
    while(styles.pop()!= 'redline' && styles.length);
    return styles;
  };
  this.draw = function(){
    currentRedline = false;
    this.startX = curx;
  };
}

function StrikethroughOpen(){
  this.objType = "StrikeThroughOpen";
  this.startX = false;
  this.oneOff = false;
  this.toText = function() {
    return "<strikethrough>";
  };
  this.width = function() { return 0;};
  this.checkClose = function(){
    return string.indexOf("</strikethrough>")>-1;
  };
  this.updateStyles = function(styles){
    styles.push('strikethrough');
    return styles;
  };
  this.draw = function(){
    currentExample.classes.addClass(this);
    this.startX = curx;
    strikeStarts = curx;
  };
}

function StrikethroughClose(){
  this.objType = "StrikeThroughClose";
  this.startX = false;
  this.toText = function() {
    return "</strikethrough>";
  };
  this.width = function() { return 0;};
  this.updateStyles = function(styles){
    // remove styles until the red one is found. This may not be ideal
    // behaviour, but it will be correct if there tags are legal
    // XML-oid ones
    while(styles.pop()!= 'strikethrough' && styles.length);
    return styles;
  };
  this.draw = function(){
    currentExample.classes.addClass(this);
    this.startX = curx;
    // FIXME: check that this works!
  };
}


////////////////////////////////////////
// 5. Misc typesetting

function NegativeSpace(){
  this.objType = "NegativeSpace";
  this.startX = false;
  this.classList = [];
  if(currentExample.classes && currentExample.classes.classes.length){
    this.classList = currentExample.classes.classes.slice(0);
  }
  this.toText = function(){
    return "_";
  };
  this.width = function() {return 0-rastralSize/2;};
  this.draw = function(){
    var extraClasses = "";
    // Now check for styles
    if(this.classList.length){
      extraClasses = classString(this.classList);
      drawClasses(this.classList, this);
    }
    this.startX = curx;
    curx -= rastralSize/2;
  };
}

function PositiveSpace(){
  this.objType = "PositiveSpace";
  this.startX = false;
  this.classList = [];
  if(currentExample.classes && currentExample.classes.classes.length){
    this.classList = currentExample.classes.classes.slice(0);
  }
  this.toText = function() {
    return "[-]";
  };
  this.width = function() {
    // return 2*rastralSize;
    return rastralSize;
  };
  this.draw = function(){
    var extraClasses = "";
    // Now check for styles
    if(this.classList.length){
      extraClasses = classString(this.classList);
      drawClasses(this.classList, this);
    }
    this.startX = curx;
    curx += rastralSize;
  };
}

function etc(){
  this.objType = "&c.";
  this.staffPos = false;
  this.pitch = false;
  this.startX = false;
  this.domObj = false;
  this.classList = [];
  if(currentExample.classes && currentExample.classes.classes.length){
    this.classList = currentExample.classes.classes.slice(0);
  }
  this.toText = function(){
    return "{&c.}"+this.pitch ? this.pitch : this.staffPos.toString(16).toUpperCase();
  };
  this.width = function(){
    return 4*rastralSize;
  };
  this.draw = function(){
    this.startX = curx;
    var extraClasses = "";
    // Now check for styles
    if(this.classList.length){
      extraClasses = classString(this.classList);
      drawClasses(this.classList, this);
    }
    this.domObj = svgText(SVG, this.startX, texty(rastralSize/3, staffPosition(this)), 
                          "etc "+extraClasses, false, etcStyle(), "&c.");
    curx += this.domObj.getBoundingClientRect().width;
    return this.domObj;
  };
}


function VoidOpen(){
  this.objType = "VoidOpen";
  this.startX = false;
  this.oneOff = false;
  this.toText = function() {
    return "<void>";
  };
  this.width = function() {return 0;};
  this.checkClose = function(){
    return string.indexOf("</void>")>-1;
  };
  this.draw = function(){
    currentExample.classes.addClass(this);
    this.startX = curx;
//    voidnotes = true;
  };
}

function VoidClose(){
  this.objType = "VoidClose";
  this.startX = false;
  this.closes = "VoidOpen";
  this.oneOff = false;
  this.toText = function() {
    return "</void>";
  };
  this.width = function() {return 0;};
  this.draw = function(){
    currentExample.classes.addClass(this);
    this.startX = curx;
//    voidnotes = false;
  };
}

function FullOpen(){
  this.objType = "FullOpen";
  this.startX = false;
  this.oneOff = false;
  this.toText = function() {
    return "<full>";
  };
  this.width = function() {return 0;};
  this.checkClose = function(){
    return string.indexOf("</full>")>-1;
  };
  this.draw = function(){
    currentExample.classes.addClass(this);
    this.startX = curx;
    fullnotes = true;
  };
}

function FullClose(){
  this.objType = "FullClose";
  this.startX = false;
  this.closes = "FullOpen";
  this.oneOff = false;
  this.toText = function() {
    return "</full>";
  };
  this.width = function() {return 0;};
  this.draw = function(){
    currentExample.classes.addClass(this);
    this.startX = curx;
    fullnotes = false;
  };
}

function HalfFullOpen(){
  this.objType = "HalfFullOpen";
  this.startX = false;
  this.oneOff = false;
  this.side = 2;
  this.toText = function() {
    return "<"+this.side+"halffull>";
  };
  this.width = function() {return 0;};
  this.checkClose = function(){
    return string.indexOf("</"+this.side+"halffull>")>-1;
  };
  this.draw = function(){
    currentExample.classes.addClass(this);
    this.startX = curx;
  };
}

function HalfFullClose(){
  this.objType = "HalfFullClose";
  this.startX = false;
  this.closes = "HalfFullOpen";
  this.oneOff = false;
  this.toText = function() {
    return "</full>";
  };
  this.width = function() {return 0;};
  this.draw = function(){
    currentExample.classes.addClass(this);
    this.startX = curx;
  };
}

function LedgerLineChange(){
  this.objType = "LedgerLineChange";
  this.count = 0;
  this.colour = false;
  this.startX = false;
  this.endX = false;
  this.startY = false;
  this.previous = false;
  this.domObj = false;
  this.specialCombiningRules = true; // And how!
  this.oneOff = false;
  // Copy current classes
  this.classList = [];
  if(currentExample.classes && currentExample.classes.classes.length){
    this.classList = currentExample.classes.classes.slice(0);
  }
  this.readComponents = function(string){
    var end = string.indexOf(">");
    var comma = string.indexOf(",");
    if(end===-1) return; // Unfinished tag;
    var num = parseInt(string.substring(4));
    if(num) {
      this.count = num;
      if(comma>-1 && comma<end){
        this.colour = string.substring(comma+1, end).trim();
      }
    }
  };
  this.addThisToClasses = function(c){
    var prev = c.present("LedgerLineChange");
    if(prev || prev === 0){
      this.previous = c.classes[prev];
      c.classes.splice(prev, 1, this);
    } else {
      c.classes.push(this);
    }
  };
  this.toText = function(){
    return "<ll>"; // FIXME
  };
  this.width = function() {return 0;//  ld/2;//FIXME
                          };
  // Ledger Line Change
  this.finishLines = function(){
    if(this.domObj){
      for(var i=0; i<this.domObj.length; i++){
        this.domObj[i].setAttributeNS(null, "x2", this.endX || curx);
      }
    }
    if(this.previous && this.previous.count!=0) this.previous.finishLines();
  };
  this.makeLines = function(){
    var pos = this.count < 0 ? 2*(0-this.count)
      : 2*(currentLinecount+2);
    this.domObj = [];
    colour = this.colour || currentStaffColour;
    for(var i=0; i<Math.abs(this.count); i++){
      this.domObj.push(drawLedgerLine(this.startX, this.startY - yoffset(pos), this.startX+5, " "+colour));
      pos += 2;
    }
  };
  this.draw = function(){
    if(!this.startX) this.startX = curx;
    if(!this.startY) this.startY = cury;
    // First, draw this, but with 0 width
    // Don't draw this, draw previous
    if(this.previous && this.previous.count!=0){
      if(!this.previous.endX) this.previous.endX = this.startX;
    // Don't draw anything till we reach the end
      if(this.count===0 && this.startX===curx){
        this.previous.finishLines();
      }
    }
    if(!this.previous && curx===this.startX){
      this.makeLines();
      // This is the beginning of the ledger line. Give it some room
 //     curx += ld/2;
    }
  };
  // Ledger Line Change
}

////////////////////////////////////////
// 6. Parameters (One-off class for use in MusicExample class

function Parameters(){
  this.objType = "Parameters";
  this.treatise = false;
  this.staff = false;
  this.spec = "";
  this.SVG = SVG;
  this.specComment = false;
  this.notation = false;
  this.notationSubtype = false;
  this.clef = false;
  this.mensuralSignature = false;
  this.solmization = false;
  this.startX = 0;
  this.startY = cury;
  this.extras = [];
  this.note = false;
  this.noMatch = true;
  this.width = function(){
    var w = 0;
    if(this.clef){
      w += this.clef.width();
    }
    if(this.solmization){
      w += this.solmization.width();
    }
    if(this.mensuralSignature){
      w+= this.mensuralSignature.width();
    }
    return w;
  };
  this.toText = function(){
    var text = "<example: {" + valueText(this.spec) + "}";
    if(this.notation) {
      text += ", {"+valueText(this.notation)+": "+valueText(this.notationSubtype)+"}";
    }
    if(this.staff) {
      text += ", "+this.staff.toText();
    }
    // FIXME: Mensuration, etc.
    return text +">";
  };
  this.getClef = function(){
    return this.clef || findClef(this.extras);
  };
  this.getDefaultClef = function(){
    var clef = this.getClef();
    if(clef.objType == "Clef"){
      return clef;
    } else if (clef){
      return clef.content[0];
    } else {
      return false;
    }
  };
  // Parameters
  this.getSolmization = function(){
    return this.solmization || findSolm(this.extras);
  };
  this.getDefaultSolmization = function(){
    var solm = this.getSolmization();
    if(solm.objType == "SolmizationSignature"){
      return solm;
    } else if (solm){
      return solm.content[0];
    } else {
      return false;
    }
  };
  this.hasChoice = function(){
    var c = this.getClef();
    var s = this.getSolmization();
    return !((!c || c.objType == "Clef") && (!s || s.objType == "SolmizationSignature")
      && typeof(this.staff.lines) == "number" && typeof(this.staff.colour) =="string");
  };
  this.annotations = function(){
    var c = this.getClef();
    var s = this.getSolmization();
    if((!c || c.objType == "Clef") && (!s || s.objType == "SolmizationSignature")
      && typeof(this.staff.lines) == "number" && typeof(this.staff.colour) =="string"){
      // No annotation needed (because there's no variant or there is
      // a variant attached to clef)
      return;
    } else if (c || s){
      // handle this in another way
      return;
    } else {
      initialStaffStar = [svgText(SVG, 0, Math.max(0, cury - rastralSize * this.staff.trueLines() ),
                         "variants musical", false, false, "*"), this.staff, currentExample];
      var tmpSVG = SVG;
      if(showvariants) addAnnotation(initialStaffStar[0], this, "staff");
      SVG = tmpSVG;
    }
  };
  // Parameters
  this.draw = function(){
    this.SVG = SVG;
    eventi=-1;
    if(showvariants){
      this.annotations();
      if(this.specComment.content!=="full measure" && this.specComment.content!=="in-line") {
        this.specComment.draw();
      }
    }
    var oldSVG = SVG;
    SVG = svgGroup(SVG, "prefGroup", false);
    var thisclef;
    var thissolm;
    if(thisclef = this.getClef()){
//      var thisclef = this.getClef();
      if(thisclef.objType !== "Clef"){
        thisclef.params = this;
      }
      thisclef.draw();
    }
    if(thissolm = this.getSolmization()){
      if(!(thissolm.clefp && thissolm.clefp())) {
        thissolm.draw();
      } else {
        console.log(["Solm error?", thissolm]);
      }
    }
    if(showvariants && this.hasChoice()){
      SVG.style.fill = "#060";
      addAnnotation(SVG, this, "staff");
      SVG = this.SVG;
    }
    SVG = oldSVG;
    if(this.mensuralSignature){
      this.mensuralSignature.draw();
    }
    curx = Math.round(curx)+1;
  };
  // Parameters
  this.getWitOptions = function(wit){
    var params = [];
    var clef = this.getClef();
    var solm = this.getSolmization();
    var sources = getSources();
    if(typeof(this.staff.lines) == "number"){
      params.push(this.staff.lines);
    } else {
      params.push(witnessReading(wit, this.staff.lines).value);
    }
    if(typeof(this.staff.colour) == "string"){
      params.push(this.staff.colour);
    } else if(!this.staff.colour){
      params.push("red");
    } else {
      params.push(witnessReading(wit, this.staff.colour).value);
    }
    if(clef){
      if(clef.objType == "Clef"){
        params.push(clef);
      } else {
        params.push(witnessReading(wit, clef));
      }
    }
    if(solm){
      if(solm.objType == "SolmizationSignature"){
        params.push(solm);
      } else {
        params.push(witnessReading(wit, solm));
      }
    }
    return params;
  };
  this.varSortFunction = function(){
    var clef = this.getDefaultClef();
    var solm = this.getDefaultSolmization();
    var lines = this.staff.trueLines();
    var colour = this.staff.trueColour();
    var p = this;
    return function (v1, v2){
      if(v1[0][0] == lines && v1[0][1]==colour
         && v1[0][2] == clef && v1[0][3]==solm){
        p.noMatch = false;
        return -1;
      } else if (v2[0][0] == lines && v2[0][1]==colour
         && v2[0][2] == clef && v2[0][3]==solm){
        p.noMatch = false;
        return 1;
      } else {
        return 0;
      }
    };
  };
  // Parameters
  this.variantList = function(){
    var pars;
    var vars = [];
    var found;
    var sources = getSources();
    for (var i=0; i<sources.length; i++){
      pars = this.getWitOptions(sources[i].id);
      found = false;
      for(var j=0; j<vars.length; j++){
        if(listeq(pars, vars[j][0])){
          found = true;
          vars[j][1].push(sources[i].id);
          break;
        }
      }
      if(!found){
        vars.push([pars, [sources[i].id]]);
      }
    }
    vars.sort(this.varSortFunction()) ;
    return vars;
  };
  this.tip = function(tipSVG){
    var oldSVG = SVG;
    SVG = tipSVG; //svg(false, false);
    svgCSS(SVG, "jt-editor-v.css");
    this.note = SVG;
//    tooltip.appendChild(SVG);
    var vars = this.variantList();
    var d = 40;
    // curx = 7;
    // cury = rastralSize * 7;
    curx = 0;
    cury = rastralSize*9;
    var bottom = 0;
    if(this.noMatch){
      this.addTip(this.staff.trueLines(), this.staff.trueColour(), ["(ed.)"], 
                  this.getDefaultClef(), this.getDefaultSolmization());
      if(i>0) svgLine(SVG, curx, cury, curx, 10, "divider", false);
      curx += d;
      bottom = Math.max(bottom, this.staff.trueLines());
    }
//    tempx = curx+d;
    for(var i=0; i<vars.length; i++){
      if(i>0) svgLine(SVG, curx, cury, curx, 10, "divider", false);
      this.addTip(vars[i][0][0], vars[i][0][1], vars[i][1], vars[i][0][2], vars[i][0][3]);
      bottom = Math.max(bottom, vars[i][0][0]);
//      curx = tempx;
//      tempx = curx+d;
      curx += d;
    }
    SVG.width.baseVal.value = curx;
    SVG.height.baseVal.value = cury;
    SVG = oldSVG;
    return tipSVG;
  };
  // Parameters
  this.addTip = function(lines, colour, witnesses, clef, solm) {
    var staff = svgGroup(SVG, "Stafflines", false);
    drawSystemLines(staff, lines, cury -lines*rastralSize, curx+10, curx+55, colour);
    var description = svgText(SVG, curx + 5, 20, //10,
      "variantReading", false, false, false);
    if(witnesses[0] == "MSS" || witnesses[0] == "emend." || witnesses[0]=="ed."){
      svgSpan(description, "variantWitnessesSpecial", false, witnesses.join(" "));
    } else {
      svgSpan(description, "variantWitnesses", false, witnesses.join(" "));
    }
//    oldSVG = SVG;
//    SVG = staff;
    curx += 15;
    var c = currentClef;
    if(clef) {
      clef.draw();
    }
    if(solm && solm!=clef) solm.draw();
//    SVG = oldSVG;
    currentClef = c;
  };
  this.getWitnesses = function(){
    var witnesses = [];
    var wit, i, j;
    if(typeof(this.staff.lines) != "number"){
      for(i=0; i<this.staff.lines.content.length; i++){
        for(j=0; j<this.staff.lines.content[i].witnesses.length; j++){
          wit = this.staff.lines.content[i].witnesses[j];
          if(wit != "MSS" && wit != "emend.") {
            witnesses.push(wit);
          }
        }
      }
    }
    if(typeof(this.staff.colour) != "string"){
      for(i=0; i<this.staff.colour.content.length; i++){
        for(j=0; j<this.staff.colour.content[i].witnesses.length; j++){
          wit = this.staff.colour.content[i].witnesses[j];
          if(wit != "MSS" && wit != "emend." && witnesses.indexOf(wit) == -1) {
            witnesses.push(wit);
          }
        }
      }
    }
    if(this.clef && this.clef.objType != "Clef"){
      for(i=0; i<this.clef.content.length; i++){
        for(j=0; j<this.clef.content[i].witnesses.length; j++){
          wit = this.clef.content[i].witnesses[j];
          if(wit != "MSS" && wit != "emend." && witnesses.indexOf(wit) == -1) {
            witnesses.push(wit);
          }
        }
      }
    }
    return witnesses;
  };
  // Parameters
}

//////////////////////////////////////////
//
// 7. Choice and Readings (c.f. text-classes)
//
//
// Generally, these work as for text, but there are some issues worth
// mentioning.
//
// *** Clefs, stafflines and solmization signatures ***
//
// Each source will have its own combinatio of clef, staff line count
// and colour, and solmization signature, and these may be relevant
// for considering variants. On the other hand, they may conceal
// points of similarity between sources if, say, a rhythmic variant is
// shown with each variation in clef for each source in which it
// occurs.
// 
// We use set of display rules defined by Jeffrey Dean in an e-mail of
// 29 May, 2013:
//
//  * If only the note value of a single note is varied *and* one or
//     more witnesses has the accepted staff/clef combination, then
//     the default is shown.
//  * In all other cases, variants are separated by combination
//
// This issue is rarer in print editions because of the use of textual
// variant lists rather than notated ones.

function MChoice(){
  this.objType = "MusicalChoice";
  this.startX = false;
  this.startY = false;
  this.staffPos = false;
  this.lines = currentLinecount;
  this.staffColour = currentStaffColour.length ? currentStaffColour : "red";
  this.clef = currentClef;
  this.solm = currentSolm && currentSolm.members.length ? currentSolm : false;
  this.params = false;
  this.domObj = false;
  this.textBlock = false;
  this.SVG = false;
  this.styles = false;
  this.content = [];
  this.note = false;
  this.classList = [];
  if(currentExample.classes && currentExample.classes.classes.length){
    this.classList = currentExample.classes.classes.slice(0);
  }
  this.addReading = function(witnesses, string, description, description2, staffing){
    var agreement = stavesAgree(staffing);
    var isntdefault = this.content.length || description ==="ins." || 
        description==="ins. & del.";
    var oldClef = currentClef;
    var oldSolm = currentSolm;
    var oldLines = currentLinecount;
    var oldColour = currentStaffColour;
    if(!isntdefault){
      // Simplest case. Accepted reading is always standardised
      this.content.push(new MReading(witnesses, string?nextMusic():[], description, 
                                     description2, false));
    } else if (witnesses.length <=1 || agreement){
      // Easiest case: either all definitions are the same (AGREEMENT) or there's only one
      // Do staff stuff: 
      currentClef = staffing[0][1];
      // Then add reading
      this.content.push(new MReading(witnesses, string?nextMusic():[], description, description2, 
                                     staffing));
    } else {
      // Question 1: Is the variant insignificant
      var ostr = string;
      var obj = nextMusic();
      if(obj.length===1 && this.content[0].content.length===1
         && obj[0].pitch === this.content[0].content[0].pitch && defaultPresent(staffing)){
          // this is an insignificant variant, so don't worry about it
        this.content.push(new MReading(witnesses, obj, description, false, false));
      } else {
        var split = matchStaves(staffing);
        var wits = split[0]
        var staffings = split[1];
        for(var i=0; i<wits.length; i++){
          currentClef = staffings[i][0];
          string = ostr;
          hackedString = ostr; // Why do I need this?! string disappears otherwise!!!
          obj = nextMusic();
          var st = [];
          for(var j=0; j<wits[i].length; j++){
            st.push([wits[i][j]].concat(staffings[i]));
          }
          this.content.push(new MReading(wits[i], obj, description, description2, st));
          string = ostr;
        }
      }
    }
    currentclef = oldClef;
  };
  // MChoice
  this.addTextReading = function(witnesses, string, description, description2){
    this.content.push(new MReading(witnesses, string?getSubText():[], description, description2));
  };
  this.addOmission = function(witnesses){
    this.content.push(new MOmission(witnesses));
  };
  this.addNilReading = function(witnesses){
    this.content.push(new MNilReading(witnesses));
  };
  this.width = function(){
    return this.content.length && this.content[0] ? this.content[0].width() : 0;
  };
  this.infop = function(){
    // Find out if this contains useful prefatory info
    if(this.content[0].applies(false)){
      return infop(this.content[0].content[0]);
    }
    return false;
  };
  this.ignorable = function(){
    // Find out if this contains useful prefatory info
    if(this.content[0].applies(false)){
      return ignorable(this.content[0].content[0]);
    }
    return true;
  };
  this.clefp = function(variant){
    if(variant){
      for(var i=0; i<this.content.length; i++){
        if(this.content[i].applies(variant)){
          // Default object
          return this.content[i].clefp();
        }
      }
    } else {
      return this.content[0].clefp();
    }
    return false;
  };
  this.solmp = function(variant){
    if(variant){
      for(var i=0; i<variant? this.content.length : 1; i++){
        if(this.content[i].applies(variant)){
          // Default object
          return this.content[i].solmp();
        }
      }
    } else {
      return this.content[0].solmp();
    }
    return false;
  };
  this.toText = function(){
    // FIXME:!!
    var string = "{var=";
    for(var i=0; i<this.content.length; i++){
      if(i>0) string+= " : ";
      string+= this.content[i].toText();
    }
    return string + "}";    
  };
  // MChoice
  this.tip = function(tipSVG){
    var oldClef = currentClef;
    var prevSVG = SVG;
    var oldUnderlays = underlays;
    noBreaks = true;
    underlays = [];
    SVG = tipSVG;//svg(false, false);
    svgCSS(SVG, "jt-editor-v.css");
    this.note = SVG;
    // console.log(currentExample.staves);
    var allText = this.content.every(function(el){
      return !el.content || el.content.every(function(el2){
        return el2.objType==="TextUnderlay" || el2.objType==="Text";
      });
    });
//    tooltip.appendChild(SVG);
    if(this.textBlock || allText){
      var x = 0;
      curx = 0;
      var y = 20;
      for(var i=0; i<this.content.length; i++){
        var block = this.content[i].footnoteText(x,y, i+1==this.content.length);
        var size = block.getBoundingClientRect();
        var size2 = block.getBBox();
        y += size.height + 2;
        curx = Math.max(curx, size2.x+size2.width);
      }
      cury = y;
      SVG.height.baseVal.value = cury;
    } else {
      curx = 10;
      cury = rastralSize * 10;
      var start = curx;
      var staff = svgGroup(SVG, "Stafflines", false);
      if(this.clef && !this.clefp() && !(this.content[0].needsChange())) {
        var clef = this.clef.draw();
        var cclass = clef.getAttributeNS(null, "class");
        clef.setAttributeNS(null, "class", cclass+" indicative");
      }
      if(this.solm &&!this.solmp() && !(this.content[0].needsChange())) {
        if(!(this.solm.clefp && this.solm.clefp())){
          // Looks crazy, but true if it's an MChoice
          var solm = this.solm.draw();
          if(solm) {
            var sclass = solm.getAttributeNS(null, "class");
            solm.setAttributeNS(null, "class", sclass+" indicative");
          } else {
            console.log(["Solmization signature error:", this.solm]);
          }
        }
      }
      var prevx = curx;
      var olc, osc;
      staffGroup = staff;
      drawSystemLines(staff, currentLinecount, cury-rastralSize*currentLinecount, 0, curx-10, currentStaffColour);
      systemLines = [staffGroup, currentLinecount, currentStaffColour, curx-10, cury];
      for(var i=0; i<this.content.length; i++){
        if(i>0) svgLine(SVG, curx - 10, cury, curx - 10, 0, "divider", false);
        olc = currentLinecount;
        osc = currentStaffColour;
        var block = this.content[i].footnote(curx,20);
        var size = webkit ? block.getBBox() : block.getBoundingClientRect();
        curx = Math.max(curx+10, prevx+size.width+10);
        // drawSystemLines(staff, currentLinecount, cury-(rastralSize*currentLinecount), 
        //                 i ? prevx-10 : 0, curx-10, 
        //                 currentStaffColour, SVG);
        currentLinecount = olc;
        currentStaffColour = osc;
        prevx  = curx;
      }
      SVG.height.baseVal.value = cury;
      // cury -= this.lines * rastralSize;
      // drawSystemLines(staff, this.lines, cury, 0, curx, this.staffColour, SVG);
    }
    underlays = oldUnderlays;
    SVG.width.baseVal.value = curx;
    SVG.height.baseVal.value = SVG.getBBox().height+Math.max(SVG.getBBox().y, 0)+1;
    currentClef = oldClef;
    SVG = prevSVG
    noBreaks = false;
    return tipSVG;
  };
  // MChoice
  this.nonDefault = function(){
    return this.content.length &&
      (this.content[0].description == "ins." 
       || this.content[0].description == "ins. & del.");
  };
  this.draw = function(){
    //FIXME
    this.startX = curx;
    this.startY = cury;
    this.SVG = SVG;
    var click;
    if(this.content.length){
      if(this.nonDefault()){
        if(showvariants){
          if(this.textBlock){
            click = svgSpan(this.textBlock, "musical ins variants", false, "‸");
          } else {
            curx -= rastralSize/3;
            click = svgText(SVG, curx, cury-(currentLinecount*rastralSize), "musical variants text", false, false, "ˇ");//*
            curx += rastralSize / 3;
//            curx += rastralSize / 2;
          }
        } else return;
      } else if(this.textBlock){
        if(showvariants) this.styles.push('choice');
        click = this.content[0].draw(this.textBlock, this.styles);
        this.styles.pop();
      } else {
        click = this.content[0].draw(false, false);
        if(showvariants) {
          click.style.fill = "#060";
        }
      }
      var oc = currentClef;
      if(showvariants && !this.params) {
//        debugger;
        addAnnotation(click, this, "MusicalChoice");
        SVG = this.SVG;
      }
      currentClef = oc;
    }
    // this.SVG.width = this.SVG.getBBox().width;
    this.SVG.width = webkit ? 
      this.SVG.getBBox().width
      : this.SVG.getBoundingClientRect().width;
    SVG = this.SVG;
  };
  this.updateStyles = function(styles) { return styles;};
  // MChoice
}

function LigChoice(){
  // FIXME: lots of this will need to change
  this.objType = "Ligature Choice";
  this.ligature = false;
  this.startX = false;
  this.startY = false;
  this.staffPos = false; // ?!?
  this.lines = currentLinecount;
  this.staffColour = currentStaffColour.length ? currentStaffColour : "red";
  this.clef = currentClef;
  this.solm = currentSolm && currentSolm.members.length ? currentSolm : false;
  this.domObj = false;
  this.textBlock = false;
  this.SVG = false;
  this.styles = false;
  this.content = [];
  this.prevEventObj = false;
  this.nextEventObj = false;
  this.note = false;
  this.nonDefault = function(){
    return this.content.length &&
      (this.content[0].description == "ins." 
       || this.content[0].description == "ins. & del.");
  };
  this.applicableReading = function(variant){
    for(var i=0; i<this.content.length; i++){
      if(this.content[i].applies(variant)) return this.content[i];
    }
    return false;
  };
  this.forwardEvent = function(variant){
    var rdg = this.applicableReading(variant);
    var next = false;
    if(rdg){
      next = rdg.forwardEvent(variant);
    }
    return next ? next : this.nextEvent(variant);
  };
  this.backwardEvent = function(variant){
    var rdg = this.applicableReading(variant);
    var next = false;
    if(rdg){
      next = rdg.backwardEvent(variant);
    }
    return next ? next : this.prevEvent(variant);
  };
  this.prevEvent = function(variant){ 
    return this.prevEventObj ? this.prevEventObj.backwardEvent(variant) : false;
  };
  this.nextEvent = function(variant){
    return this.nextEventObj ? this.nextEventObj.forwardEvent(variant) : false;
  };
  // LigChoice
  this.addReading = function(witnesses, string, description, description2, staffing){
    // First, we need to look at the staffing to work out 1) what clef
    // we need and 2) whether this reading should become several
    // readings
    var agreement = stavesAgree(staffing);
    var isntdefault = this.content.length || description==="ins." || description==="ins. & del.";
    var oldClef = currentClef;
    var oldSolm = currentSolm;
    var oldLines = currentLinecount;
    var oldColour = currentStaffColour;
    if(witnesses.length<=1 || agreement || !isntdefault){
      // Easy case: either there's no conflict betwen definitions,
      // only one definition, or this is the main reading. In the last
      // case, using a different clef to the main one would
      // (currently) affect main display as well as the pop ups.
      currentClef = isntdefault ? staffing[0][1] : oldClef;
      this.content.push(new MReading(witnesses, (string?nextMusic(this.ligature):[]), 
                                     description, description2, staffing));
    } else {
      // Now... If the variant is only of the form of a single note,
      // without changing its pitch, it is not considered significant,
      // and, if one definition matches, they all do. To test this, we
      // first need to parse the string.
      var ostr = string;
      var obj = nextMusic(this.ligature);
      if(obj.length===1 && this.content[0].content.length===1
         && obj[0].pitch===this.content[0].pitch && defaultPresent(staffing)){
        this.content.push(new MReading(witnesses, (string ? nextMusic(this.ligature) : []),
                                       description, description2, false));
      } else {
        console.log(["Need to do something", matchStaves(staffing)]);
        currentClef = staffing[0][1];
        this.content.push(new MReading(witnesses, (string ? nextMusic(this.ligature) : []),
                                       description, false, staffing));
      }
    }
    currentClef = oldClef;
    currentSolm = oldSolm;
    currentLinecount = oldLines;
    currentStaffColour = oldColour;
  };
  this.addTextReading = function(witnesses, string, description, description2){
    this.content.push(new MReading(witnesses, string?getSubText():[], description, description2));
  };
  this.addOmission = function(witnesses){
    this.content.push(new MOmission(witnesses));
  };
  this.addNilReading = function(witnesses){
    this.content.push(new MNilReading(witnesses));
  };
  this.width = function(){
    // FIXME
    return this.content.length ? this.content[0].width() : 0;
  };
  this.toText = function(){
    // FIXME:!!
    var string = "{var=";
    for(var i=0; i<this.content.length; i++){
      if(i>0) string+= " : ";
      string+= this.content[i].toText();
    }
    return string + "}";    
  };
  // LigChoice
  this.tip = function(tipSVG){
    // FIXME: aaaah!
    SVG = tipSVG;//svg(false, false);
    svgCSS(SVG, "jt-editor-v.css");
    this.note = SVG;
//    tooltip.appendChild(SVG);
    curx = 10;
    cury = rastralSize * 10;
    var start = curx;
    var staff = svgGroup(SVG, "Stafflines", false);
    if(this.clef && !(this.content[0].needsChange() || this.nonDefault())) {
      var clef = this.clef.draw();
      var cclass = clef.getAttributeNS(null, "class");
      clef.setAttributeNS(null, "class", cclass+" indicative");
    }
    if(this.solm && !(this.content[0].needsChange())) {
      if(!(this.solm.clefp && this.solm.clefp())){
        // Looks crazy, but true if it's an MChoice
        var solm = this.solm.draw();
        if(solm) {
          var sclass = solm.getAttributeNS(null, "class");
          solm.setAttributeNS(null, "class", sclass+" indicative");
        } else {
          console.log(["Solmization signature error:", this.solm]);
        }
      }
    }
    console.log([staff, this.lines, cury, 0, curx, this.staffColour]);
    tempy = cury;
    cury -= this.lines * rastralSize;
    drawSystemLines(staff, this.lines, cury, 0, curx, this.staffColour);
    cury = tempy;
    var prevx = curx;
    for(var i=0; i<this.content.length; i++){
      if(i>0) svgLine(SVG, curx - 10, cury, curx-10, 0, "divider", false);
      var block = this.content[i].footnote(curx, 20, this.ligature);
      var size = webkit ? block.getBBox() : block.getBoundingClientRect();
//      curx += size.width;
      curx = Math.max(curx+10, prevx+size.width+10);
      prevx  = curx;
    }
    SVG.height.baseVal.value = cury;
    // cury -= this.lines * rastralSize;
//    drawSystemLines(staff, this.lines, cury, 0, curx, this.staffColour);
    SVG.width.baseVal.value = curx;
    return SVG;
  };
  // LigChoice
  this.drawVar = function(variant){
    // FIXME: ?needed
    return this.applicableReading(variant).draw();
  };
  this.draw = function(){
    // What is default behaviour? this depends on the first variant
    this.startX = curx;
    this.startY = cury;
    this.SVG = SVG;
    var click;
    if(!this.content.length) return false;
    if(this.nonDefault()){
      // An insertion means that the default version has *nothing*
      if(!showvariants) return false;
      // If we are showing variants, we need a marker
      click = svgText(SVG, curx, cury-(currentLinecount*rastralSize), "musical variants text", false, false, "ˇ");//ˇ
      curx += rastralSize;
    } else {
      click = this.content[0].draw(false, false); // ?!
      if(showvariants) {
        click.style.fill = "#060";
      }
    }
    if(showvariants) {
      addAnnotation(click, this, "Ligature MusicalChoice");
      SVG = this.SVG;
    }
    return click;
  };
  // LigChoice
}

function ObliqueNoteChoice(){
  // FIXME: lots of this will need to change
  this.objType = "ObliqueNote Choice";
  this.ligature = false;
  this.oblique = false;
  this.before = false;
  this.SVG = false;
  this.startX = false;
  this.startY = false;
  this.staffPos = false; // ?!?
  this.lines = currentLinecount;
  this.staffColour = currentStaffColour.length ? currentStaffColour : "red";
  this.clef = currentClef;
  this.domObj = false;
  this.textBlock = false;
  this.SVG = false;
  this.styles = false;
  this.content = [];
  this.prevEventObj = false;
  this.nextEventObj = false;
  this.note = false;
  this.nonDefault = function(){
    return this.content.length &&
      (this.content[0].description == "ins." 
       || this.content[0].description == "ins. & del.");
  };
  this.applicableReading = function(variant){
    for(var i=0; i<this.content.length; i++){
      if(this.content[i].applies(variant)) return this.content[i];
    }
    return false;
  };
  this.forwardEvent = function(variant){
    var rdg = this.applicableReading(variant);
    var next = false;
    if(rdg){
      next = rdg.forwardEvent(variant);
    }
    return next ? next : this.nextEvent(variant);
  };
  this.backwardEvent = function(variant){
    var rdg = this.applicableReading(variant);
    var next = false;
    if(rdg){
      next = rdg.backwardEvent(variant);
    }
    return next ? next : this.prevEvent(variant);
  };
  this.prevEvent = function(variant){ 
    return this.prevEventObj ? this.prevEventObj.backwardEvent(variant) : false;
  };
  this.nextEvent = function(variant){
    return this.nextEventObj ? this.nextEventObj.forwardEvent(variant) : false;
  };
  this.addReading = function(witnesses, string, description, description2, staffing){
    // FIXME: Make this method an external function, since it's a
    // duplicate, more or less of other choice methods
    var agreement = stavesAgree(staffing);
    var isntdefault = this.content.length || description === "ins." || 
        description==="ins. & del.";
    var oldClef = currentClef;
    var oldSolm = currentSolm;
    var oldLines = currentLinecount;
    var oldColour = currentStaffColour;
    if(!isntdefault){
      // Simplest case. Accepted reading is always standardised
      this.content.push(new MReading(witnesses, string?nextMusic(this.oblique):[], description, 
                                     description2, false));
    } else if (witnesses.length <=1 || agreement){
      // Easiest case: either all definitions are the same (AGREEMENT) or there's only one
      // Do staff stuff: 
      currentClef = staffing[0][1];
      // Then add reading
      this.content.push(new MReading(witnesses, string?nextMusic(this.oblique):[], description, description2, 
                                     staffing));
    } else {
      // Question 1: Is the variant insignificant
      var ostr = string;
      var obj = nextMusic(this.oblique);
      if(obj.length===1 && this.content[0].content.length===1
         && obj[0].pitch === this.content[0].content[0].pitch && defaultPresent(staffing)){
          // this is an insignificant variant, so don't worry about it
        this.content.push(new MReading(witnesses, obj, description, false, false));
      } else {
        var split = matchStaves(staffing);
        var wits = split[0]
        var staffings = split[1];
        for(var i=0; i<wits.length; i++){
          currentClef = staffings[i][0];
          string = ostr;
          hackedString = ostr; // Why do I need this?! string disappears otherwise!!!
          obj = nextMusic();
          var st = [];
          for(var j=0; j<wits[i].length; j++){
            st.push([wits[i][j]].concat(staffings[i]));
          }
          this.content.push(new MReading(wits[i], obj, description, description2, st));
          string = ostr;
        }
      }
    }
    currentclef = oldClef;
  };
  // this.addReading2 = function(witnesses, string, description){
  //   var rdg = new MReading(witnesses, string?nextMusic(this.oblique):[], description);
  //   this.content.push(rdg);
  // };
  // ObliqueNoteChoice
  this.addOmission = function(witnesses){
    this.content.push(new MOmission(witnesses));
  };
  this.addNilReading = function(witnesses){
    this.content.push(new MNilReading(witnesses));
  };
  this.width = function(){
    // FIXME
    return this.content.length ? this.content[0].width() : 0;
  };
  this.toText = function(){
    // FIXME:!!
    var string = "{var=";
    for(var i=0; i<this.content.length; i++){
      if(i>0) string+= " : ";
      string+= this.content[i].toText();
    }
    return string + "}";    
  };
  this.tip = function(tipSVG){
    // FIXME: aaaah!
    SVG = tipSVG;//svg(false, false);
    svgCSS(SVG, "jt-editor-v.css");
    this.note = SVG;
//    tooltip.appendChild(SVG);
    curx = 10;
    cury = rastralSize * 10;
    var start = curx;
    var staff = svgGroup(SVG, "Stafflines", false);
    if(this.clef) {
        var clef = this.clef.draw();
        var cclass = clef.getAttributeNS(null, "class");
        clef.setAttributeNS(null, "class", cclass+" indicative");
    }
    var tempy = cury;
    cury -= this.lines * rastralSize;
    drawSystemLines(staff, this.lines, cury, 0, curx, this.staffColour);
    cury = tempy;
    var prevx = curx;
    for(var i=0; i<this.content.length; i++){
      if(i>0) {
        svgLine(SVG, curx - 10, cury, curx-10, 10, "divider", false);
      }
      var block = this.content[i].footnote(curx, 20);
      var size = webkit ? block.getBBox() : block.getBoundingClientRect();
//      curx += size.width;
      curx = Math.max(curx+10, prevx+size.width+10);
      prevx  = curx;
//      curx  += 20;
    }
    SVG.height.baseVal.value = cury;
    // cury -= this.lines * rastralSize;
    // drawSystemLines(staff, this.lines, cury, 0, curx, this.staffColour);
    SVG.width.baseVal.value = curx;
    return SVG;
  };
  this.drawVar = function(variant){
    // FIXME: ?needed
    if(!this.SVG) this.SVG = this.ligature.SVG;
    var rdg = this.applicableReading(variant);
    var obj;
    if(this.prevEventObj){
      rdg.content[0].prevEventObj = this.prevEventObj;
    }
    for(var i=0; i<rdg.content.length; i++){
      obj = rdg.content[i].drawVar(variant);
      obj.style.fill = "#704";
    }
//    return this.applicableReading(variant).sketch(SVG, true);
  };
  // ObliqueNoteChoice
  this.draw = function(){
    // What is default behaviour? this depends on the first variant
    this.startX = curx;
    this.startY = cury;
    this.SVG = SVG;
    var click;
    if(!this.content.length) return false;
    if(this.nonDefault()){
      // An insertion means that the default version has *nothing*
      if(!showvariants) return false;
      // If we are showing variants, we need a marker
      click = svgText(SVG, curx, cury-(currentLinecount*rastralSize), "musical variants text", false, false, "ˇ");//ˇ
      curx += rastralSize;
    } else {
      click = this.content[0].draw(); // ?!
      if(showvariants) click.style.fill = "#060";
    }
    if(showvariants) {
      addAnnotation(click, this, "Oblique MusicalChoice");
      SVG = this.SVG;
    }
    return click;
  };
  // ObliqueNoteChoice
}

function MReading(witnesses, content, description, description2, staves){
  this.objType = "MusicalReading";
  this.witnesses = witnesses;
  this.content = content;
  this.description = description;
  this.description2 = description2;
  this.staves = staves;
  this.ligReading = false;
  // we need to pull out staff, clef and solm information
  for(var i=content.length-1; i>=0; i--){
    if(content[i].objType == "Staff" ||
       content[i].objType == "Clef" ||
       content[i].objType == "SolmizationSignature"){
      content[i].appliesTo = witnesses;
      // currentExample.staves.push([currentExample.events.length, 
      //                             content[i], this]);
      break;
    }
  }
  ///
  this.updateStyles = function(styles){
    // FIXME: WTF??
    return styles;
  };
  this.width = function (){
    var width = 0;
    for (var i=0; i<this.content.length; i++){
      if(this.content[i]) width += this.content[i].width();
    }
    return width;
  };
  this.nonDefault = function(){
    return this.description == "ins." || this.description == "ins. & del.";
  };
  this.applies = function(variant){
    if(variant){
      return this.witnesses.indexOf(variant)>-1 || this.witnesses[0] =="MSS";
    } else {
      return !this.nonDefault();
    }
  };
  this.clefp = function(){
    // FIXME: Doesn't feel right -- what if there're notes first?
    for(var i=0; i<this.content.length; i++){
      if(this.content[i].objType == "Clef"){
        return this.content[i];
      } else if(!(infop(this.content[i]) || ignorable(this.content[i]))){
        return false;
      }
    }
    return false;
  };
  this.solmp = function(){
    // FIXME: Doesn't feel right -- what if there're notes first?
    for(var i=0; i<this.content.length; i++){
      if(this.content[i].objType == "SolmizationSignature"){
        return this.content[i];
      }
    }
    return false;
  };
  // MReading
  this.forwardEvent = function(variant){ return this.content[0];};
  this.backwardEvent = function(variant){ return this.content[this.content.length-1];};
  this.toText = function(){
    var text = "";
    if(this.description) text += "("+this.description+")";
    if(this.content.length) {
      text += '"';
      for(var i=0; i<this.content.length; i++){
        if(typeof(this.content[i])=='string' && this.content[i].length>0){
          // This probably never exists?
          text+=this.content[i];
        }else if (content[i]){
          // more likely
          text+=this.content[i].toText();
        }
        text += " ";
      }
      text += '" ';
    }
    text+= this.witnesses.join(" ");
    return text;
  };
  this.sketchText = function(styles){
    var obj = [];
    var span;
    for (var i=0; i<this.content.length; i++){
      if(typeof(this.content[i])=="string"){
        // .content is almost always an array containing just a single string
        span = svgSpan(false, styles.length ? textClasses(styles) :"text", false,
                         this.content[i]);
        obj.push(span);
        SVG.appendChild(span);
      } else if(this.content[i]){
        this.content[i].draw(false, styles); // FIXME: Watch this!!!
        styles = this.content[i].updateStyles(styles);
      }
    }
    return obj;
  };
  // MReading
  this.footnoteText = function(x,y, lastTime){
    var block = svgText(SVG, x, y, "variantReading", false, false, false);
    var OLDSVG = SVG;
    if(this.description) svgSpan(block, "readingDesc", false, this.description+" ");
    SVG = block;
    var text = this.sketchText(["variantReading"]);
    SVG = OLDSVG;
    for(var i=0; i<text.length; i++){
//      block.appendChild(text[i]);
    }
    if(this.description2) svgSpan(block, "descriptionFinal", false, " "+this.description2);
    if(this.witnesses[0] == "MSS" || this.witnesses[0] == "emend."){
      svgSpan(block, "variantWitnessesSpecial variantWitness", false, " "+this.witnesses.join(" "));
    } else {
      svgSpan(block, "variantWitnesses variantWitness", false, " "+this.witnesses.join(" "));
    }
    if(!lastTime) svgSpan(block, false, false, " : ");
    return block;
  };
  this.needsChange = function(){
    return this.staves && !defaultPresent(this.staves);
  }
  this.sketch = function(svgEl, fn){
    currentReading=this;
    var obj = [];
    var oldSVG = SVG;
    SVG = svgEl;
    var ligs = [];
    for (var i=0; i<this.content.length; i++){
      if(typeof(this.content[i].ligature) != "undefined" && this.content[i].ligature && fn){
        if(ligs.indexOf(this.content[i].ligature)==-1){
          obj.push(this.content[i].ligature.drawVar(this.witnesses[0]));
          ligs.push(this.content[i].ligature);
        }
      } else if(this.content[i]){
        if(typeof(this.content[i]) == "string") {
          obj.push(svgSpan(svgEl, 'text', false, this.content[i]));
        } else if (this.content[i].objType ==="MusicalChoice"){
          var backup = SVG;
          obj.push(this.content[i].draw());
          SVG = backup;
        } else if (this.clefp || this.solmp){
          obj.push(this.content[i].draw());
        } else {
          obj.push(this.content[i].draw());
        }
      }
    }
    SVG = oldSVG;
    return obj;
  };
  // MReading
  this.footnote = function(x, y){
    currentReading=this;
    var oldstaff = staffGroup;
    var oldSL = systemLines;
    var drawPrep = false
    staffGroup = svgGroup(SVG, "Stafflines", false);
    var lc = currentLinecount;
    var sc = currentStaffColour;
    var oc = currentClef;
    var os = currentSolm;
    var oldSVG = SVG
    if(this.staves && !defaultPresent(this.staves) && !this.clefp()){
      currentClef = this.staves[0][1];
      currentSolm = this.staves[0][2];
      currentLinecount = this.staves[0][3].varLines(this.witnesses[0]);
      currentStaffColour = this.staves[0][3].varColour(this.witnesses[0]);
      // currentLinecount = this.staves[0][3].trueLines();
      // currentStaffColour = this.staves[0][3].trueColour();
      drawPrep = true;
    }
    systemLines = [staffGroup, currentLinecount, currentStaffColour, curx, cury];
    var block = svgGroup(SVG, "VariantReading music", false);
    if(drawPrep){
      var clef = currentClef.draw();
      var cclass = clef.getAttributeNS(null, "class");
      clef.setAttributeNS(null, "class", cclass+" indicative");
      if(currentSolm && currentSolm.members.length){
        var solm = currentSolm.draw();
        if(solm) {
          var sclass = solm.getAttributeNS(null, "class");
          solm.setAttributeNS(null, "class", sclass+" indicative");
        } else {
          console.log("Solmization signature error");
        }
      }
    }
    var content = this.sketch(block, true);
    var description = svgText(block, x-3, y+5, "variantReading", false, false, false);
    if(this.description) svgSpan(description, "readingDesc", false, this.description +" ");
    if(this.description2) svgSpan(description, "readingDesc final", false, " "+this.description2+" ");
    if(this.witnesses[0] == "MSS" || this.witnesses[0] == "emend."){
      svgSpan(description, "variantWitnessesSpecial variantWitness", false, this.witnesses.join(" "));
    } else {
      svgSpan(description, "variantWitnesses variantWitness", false, this.witnesses.join(" "));
    }
    drawSystemLines(systemLines[0], systemLines[1], 
                    systemLines[4]-rastralSize*systemLines[1],
                    Math.max(systemLines[3]-10, 0), curx,
                    systemLines[2]);
    systemLines = oldSL;
    SVG = oldSVG;
    currentLinecount = lc;
    currentStaffColour = sc;
    currentClef = oc;
    currentSolm = os;
    staffGroup = oldstaff;
    return block;
  };
  // MReading
  this.draw = function(txtBlock, styles){
    currentReading=this;
    var obj;
    if(typeof(txtBlock) == "undefined" || !txtBlock) {
      obj = svgGroup(SVG, showvariants ? 'variantGroup' : 'invisibleVariantGroup', false);
      this.sketch(obj, false);
      // for(var i=0; i<stuff.length; i++){
      //   if(stuff[i]){
      //     obj.appendChild(stuff[i]);
      //   }
      // }
    } else {
      obj = svgSpan(txtBlock, showvariants ? 'variantGroup' : 'invisibleVariantGroup', false);
      var stuff = this.sketchText(styles);
      for(var i=0; i<stuff.length; i++){
        obj.appendChild(stuff[i]);
      }
    }
    return obj;
//     return SVG;
  };
  this.updateStyles = function(styles){
    //FIXME:
    return styles;
  };
  // MReading
}

function MNilReading(witnesses){
  this.objType = "MusicalNilReading";
  this.witnesses = witnesses;
  this.toText = function(){
    var text = "(nil)";
    text+= this.witnesses.join(" ");
    return text;
  };
  this.width = function(){return 0;};
  this.draw = function(){};
}
function MOmission(witnesses){
  this.objType = "MusicalOmission";
  this.witnesses = witnesses;
  this.toText = function(){
    var text = "(om.)";
    text+= this.witnesses.join(" ");
    return text;
  };
  this.width = function(){return 0;};
  this.footnote = function(x,y){
    var block = svgGroup(SVG, "VariantReading music", false);
    var description = svgText(block, x, y, "variantReading", false, false, false);
    svgSpan(description, "readingDesc", false, 'om. ');
    if(this.witnesses[0] == "MSS" || this.witnesses[0] == "emend."){
      svgSpan(description, "variantWitnessesSpecial variantWitness", false, this.witnesses.join(" "));
    } else {
      svgSpan(description, "variantWitnesses variantWitness", false, this.witnesses.join(" "));
    }
    return block;    
  };
  this.draw = function(){};
}

function ValueChoice(){
  // Choice structures for object attributes rather than for object
  // collections
  this.objType = "ValueChoice";
  this.content = [];
  this.addReading = function(witnesses, string, description){
    this.content.push(new ValueReading(witnesses, string, description));
  };
  this.addOmission = function(witnesses){
    this.content.push(new MOmission(witnesses, false, "om. "));
  };
  this.addNil = function(witnesses){
    this.content.push(new MNilReading(witnesses));
  };
  this.toText = function(){
    var string = "{var=";
    for(var i=0; i<this.content.length; i++){
      if(i>0) string+= " : ";
      string+= this.content[i].toText();
    }
    return string + "}";    
  };
}

function ValueReading(witnesses, value, description){
  this.objType = "ValueReading";
  this.witnesses = witnesses;
  this.value = value;
  this.description = description;
  this.toText = function(){
    var text = "";
    if(this.description) text += "("+this.description+") ";
    if(this.value) text += '"'+this.value+'" ';
    text+= this.witnesses.join(" ");
    return text;
  };
}

function witnessReading(witness, choice){
  for(var i=0;i<choice.content.length; i++){
    if(choice.content[i].witnesses.indexOf(witness) != -1
       || choice.content[i].witnesses.indexOf("MSS") != -1 ) {
      return choice.content[i];
    }
  }
  return false;
}

///////////////////////
//
// Misc
//

function Classes(){
  this.classes = [];
  this.render = function(){
    return this.classes.length;
  };
  this.present = function(tag){
    for(var i=0; i<this.classes.length; i++){
      if(this.classes[i].objType===tag){
        return i;
      }
    }
    return false;
  };
  this.removeOneOffClasses = function(){
    this.classes = this.classes.filter(function(el){return !el.oneOff;});
  };
  this.addClass = function(newclass){
    if(newclass.specialCombiningRules){
      newclass.addThisToClasses(this);
      return;
    }
    var closes = newclass.closes;
    var pos = closes ? this.present(closes) : this.present(newclass.objType);
    if(pos || pos===0){
      if(closes){
        this.classes.splice(pos,1);
      }
    } else if (!closes){
      this.classes.push(newclass);
    }
  };
  this.classString = function(){
    var s = this.classes.reduce(
      function(str, el){
        return str+" "
          + (typeof(el.classString) == "undefined" ? el.objType : el.classString);}, "");
    return s;
  };
}

function classString (classes){
  return classes.reduce(
    function(str, el){
      return str
        + (typeof(el.classString) == "undefined" ? "" : " " +el.classString);},
    "");
}

function drawClasses (classes){
  for(var c=0; c<classes.length; c++){
    if(classes[c].draw) classes[c].draw();
  }
}
