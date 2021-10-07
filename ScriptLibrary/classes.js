/** @fileoverview Musical classes
* Classes have some methods in common:
*   * .width for width estimation (before drawing)
*   * .negativeSpace In some cases inserted negative spaces
*       (indicating tightly packed glyphs) are too tight or too
*       loose. This method allows the default spaces to be
*       overridden. It is called on the preceding glyph with the
*       following glyph as an argument.
*   * .toText Experimental (=faulty) attempt to make parsing JJD's
*       input language two way, allowing export. This is necessary
*       for graphical editing.
*   * .toMEI Experimental (=incomplete) attempt to output to relevant
*       MEI object. As with analogous .toMEI, this takes the TEI/MEI
*       document and the parent element and appends the object to
*       that parent. It's for the calling method to make sure that
*       such behaviour is appropriate. The new element is (usually,
*       unnecessarily) returned.
*   * .draw Draws the object to the SVG object referred to by the
*       global variable <SVG>. The drawn object is returned.
* @namespace classes
*/

/// util functions
function keepStyles(styles){ return styles;};
function zeroWidth(){ return 0;};

///// Classes
// 1. Notes, ligatures & neumes
//

/** @class 
 * @classdesc Note is the basic class for sounding items. It's also used for ligature components (why?)
 * @memberof classes
 */
function Note(){
  // Note is the basic class for sounding items. It's also used for
  // ligature components (why?)
  /** @property {?} */
  this.objType = "Note";
  /** @property {?} */
  this.text = false;
  /** @property {?} */
  this.staffPos = false;
  /** @property {?} */
  this.pitch = false;
  /** @property {?} */
  this.rhythm = false;
  /** @property {?} */
  this.sup = false;
  /** @property {?} */
  this.flipped = false;
  /** @property {?} */
  this.startX = false;
  /** @property {?} */
  this.startY = false;
  /** @property {?} */
  this.domObj = false;
  /** @property {?} */
  this.click = false;
  /** @property {?} */
  this.voidnotes = false;
  /** @property {?} */
  this.subType = false;
  /** @property {?} */
  this.example = false;
  /** @property {?} */
  this.dot = false;
  /** @property {?} */
  this.MEIObj = false;
  /** @property {?} */
  this.glyph = false;
  /** @property {?} */
  this.UUID = "ID"+uuid()
  /** @property {?} */
  this.forceTail = false; // This is only for ligatures, but the parser will put it here
  /** @property {?} */
  // Copy current classes
  this.classList = [];
  if(currentExample.classes && currentExample.classes.classes.length){
    this.classList = currentExample.classes.classes.slice(0);
  }
  /** width */
  this.width = function(){
    var width = 0;
    if(this.rhythm){
      width += baseDictionary[currentSubType][this.rhythm][2]*rastralSize;
    }
    return width;
  };
  /** 
   * These positions may seem oddly left-tilted, but the coordinate
   * is to the left of the comment *, not the centre
  */
  this.commentPos = function(){
    // These positions may seem oddly left-tilted, but the coordinate
    // is to the left of the comment *, not the centre
    if("LBS".indexOf(this.rhythm)>-1){
      return [this.startX + rastralSize/5, yPos(cury, staffPosition(this))];
    } else if (this.rhythm==="M"){
      return [this.startX + rastralSize/2, yPos(cury, staffPosition(this))];
    } else {
      // Tail up, so place on the same height, but right of the tail
      return [this.startX + (2*rastralSize/3), yPos(cury, staffPosition(this))];
    }
  };
  /** negativeSpace */
  this.negativeSpace = function(){
    if("MLB".indexOf(this.rhythm)>-1){
      return rastralSize/6;
    } else {
      return rastralSize/2;
    }
  };
  /** Writes note tot text */
  this.toText = function(){
    var text = "";
    if(this.sup) text+= "^";
    if(this.flipped) text += "-";
    if(this.rhythm) text += this.rhythm;
    text += this.pitch ? this.pitch : this.staffPos.toString(16).toUpperCase();
    return text;
  };
  /** Writes Note as MEI element */
  this.toMEI = function (doc, parent){
    if(!parent) parent = doc.currentParent;
    var el = doc.createElementNS("http://www.music-encoding.org/ns/mei", "note");
		addUUIDs(this, el, curDoc);
    el.setAttribute("dur", rhythms[this.rhythm]);
    if(this.dot) this.dot.toMEI(doc, el);
    MEIAddPosition(this, el);
		if(this.rhythm==="s"){
		}
    if((voidRule(this) && currentSubType==="full") 
       || (fullRule(this) && currentSubType==="void")){
      el.setAttribute("colored", "true");
    }
    // sup outside of ligatures (within ligatures we have LigatureNote objects) is used for divisio. Put notes into chord
    // sup can follow as well accidentals, make sure that previous is a note
    if(this.sup && this.previous.objType==="Note")
    {
      var prevElement = parent.lastElementChild;
      var chord;
      // check for previous chord
      if(prevElement.localName === "chord")
      {
        chord = prevElement;
        chord.appendChild(el);
      }
      // or create new chord if note
      else if(prevElement.localName === "note")
      {
        chord = doc.createElementNS("http://www.music-encoding.org/ns/mei", "chord");
        chord.setAttribute("xml:id", "ID"+uuid());
        // put previous non-sup note into chord and current note
        chord.appendChild(prevElement);
        chord.appendChild(el);
        parent.appendChild(chord);
      }
      else
      {
        // unlikely fallback just in case
        parent.appendChild(el);
      }

      // check for coloration: this is not semantic coloration if not every note is coloured
      if(doc.evaluate("count(./*[@colored])<=count(./*)", chord, nsResolver, 3).booleanValue)
      {
        let coloredNotes = doc.evaluate("./*[@colored]", chord, nsResolver, 6);
        
        for(let i = 0; i < coloredNotes.snapshotLength; i++)
        {
          coloredNotes.snapshotItem(i).setAttribute("head.fill", "solid");
          coloredNotes.snapshotItem(i).removeAttribute("colored");
        }
      }
    }
    else
    {
      parent.appendChild(el);
    }
    
		if(this.text) this.text.toMEI(doc, el, this);
    this.MEIObj = el;
    return el;
  };
  /** edit Note */
  this.edit = function(event) {
    return durationSelector(this, event.pageX, event.pageY);
  };
  /** Draw Note to SVG */
  this.draw = function(){
    var myglyph = false;
    var spos = staffPosition(this);
    var oldx = curx;
    if(this.sup){
      if(currentReading){
        // This is a Choice element, and so we have to look in the choice
        curx = currentReading.eventi ? currentReading.content[currentReading.eventi-1].startX : (SVG.className.baseVal.indexOf("VariantReading")>-1 ? curx : currentExample.events[eventi-1].startX);
      } else if (currentExample.events[eventi-1].objType==="MusicalChoice"){
        // This means that the note stacks with *something* assume,
        // for sanity's sake that it stacks with the notes in the
        // choice *and* the preceding note (otherwise, it's seriously
        // confusing -- that said, FIXME, this assumption probably
        // isn't justified)
        //        curx = currentExample.events[eventi-2].startX;
        // assumption2 -- it's the same as the beginning of the variant
        curx = currentExample.events[eventi-1].startX;
      } else {
        curx = currentExample.events[eventi-1].startX;
      }
    } else if(this.text && underlays.length){
      // Check for text issues
      curx = Math.max(curx, underlayRight(this.text.position));
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
    if((spos || spos===0) && this.rhythm) {
      var subType = half ? (half === 1 ? "lhalf" : "rhalf") : this.subType;
      this.domObj = svgGroup(SVG, "notegroup"+extraClasses+(editable ? " clickable" : "")
                             +(half ? " halffull"+half : ""), 
                             this.UUID);
      var obj;
      if(getNoteGlyph(currentSubType, this.rhythm, this.flipped, subType, 
                      this.voidnotes, this.fullnotes)){
        myglyph = getNoteGlyph(currentSubType, this.rhythm, this.flipped, subType, this.voidnotes, this.fullnotes);
        this.glyph = myglyph;
        var oldSVG = SVG;
        SVG = this.domObj;
        obj = myglyph.draw(curx, yPos(cury, spos), rastralSize, 
                         "mensural " + this.rhythm+(this.pitch ? this.pitch : this.staffPos));
        SVG = oldSVG;
        curx+= myglyph.advanceWidth(rastralSize);
      } 
      if(editable) {
        $(this.domObj).click(domClickfun(this.domObj, editObject(this), false, false, false));
        $(this.domObj).hover(shiftHoverToShift(this, 1), hoverOutShiftChecked());
      }
      if(!myglyph){
        if(this.flipped){
          var charData = this.voidnotes ?
            voidFlippedDictionary[subType][this.rhythm] :
            flippedDictionary[subType][this.rhythm];
        } else {
          var charData = this.voidnotes ?
            voidBaseDictionary[subType][this.rhythm] :
            baseDictionary[subType][this.rhythm];
        }
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

/** @class 
 * @memberof classes */
function ChantNote(){
  /** @property {?} */
  this.objType = "ChantNote";
  /** @property {?} */
  this.text = false;
  /** @property {?} */
  this.staffPos = false;
  /** @property {?} */
  this.pitch = false;
  /** @property {?} */
  this.rhythm = false; // Misnamed
  /** @property {?} */
  this.startX = false;
  /** @property {?} */
  this.domObj = false;
  /** @property {?} */
  this.example = currentExample;
  /** @property {?} */
  this.MEIObj = false;
  /** @property {?} */
  // Copy current classes
  this.classList = currentExample.classes ? currentExample.classes.classes.slice(0) : [];
  /** width */
  this.width = function(){
    return rastralSize;
  };
  /** Writes ChantNote to text */
  this.toText = function(){
    var text = "";
    if(this.rhythm) text += this.rhythm;
    text += this.pitch ? this.pitch : this.staffPos.toString(16).toUpperCase();
    return text;
  };
  /** Edits ChantNote */
  this.edit = function(event){
    return chantShapeSelector(this, event.pageX, event.pageY);
  };
  /** Writes ChantNote to MEI element */
  this.toMEI = function (doc, parent){
    if(!parent) parent = doc.currentParent;
    var el = doc.createElementNS("http://www.music-encoding.org/ns/mei", "uneume");
    var note = doc.createElementNS("http://www.music-encoding.org/ns/mei", "note");
		addUUIDs(this, el, curDoc);
    el.setAttribute("name", neumeForms[this.rhythm]);
    MEIAddPosition(this, el);
    el.appendChild(note);
    parent.appendChild(el);
    this.MEIObj = el;
    return el;
  };
  /** Draws ChantNote to SVG */
  this.draw = function(){
    var extraClasses = "";
    var spos = staffPosition(this);
    // Check for text issues
    if(this.text){
      curx-=rastralSize*0.6*prop;
      if(underlays.length){
        curx = Math.max(curx, underlayRight(this.text.position));
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

/** @class 
 * @memberof classes */
function Dot(){
  /** @property {?} */
  this.objType = "Dot";
// If pitched
//  this.pitch = false;
  /** @property {?} */
  this.augments = false;
  /** @property {?} */
  this.staffPos = false;
  /** @property {?} */
  this.startX = false;
  /** @property {?} */
  this.text = false;
  /** @property {?} */
  this.domObj = false;
  /** @property {?} */
  this.MEIObj = false;
  /** @property {?} */
  this.example = currentExample;
  /** @property {?} */
  // Copy current classes
  this.classList = currentExample.classes ? currentExample.classes.classes.slice(0) : [];
  /** width */
  this.width = function(){
    // return dotData[2]*rastralSize * prop;
    return this.augments ? rastralSize/2 : rastralSize;
  };
  /** negativeSpace */
  this.negativeSpace = function(next){
    if(next && (next.objType=="Note" || next.objType.indexOf("Rest")>-1)){
      return next.negativeSpace();
    } else {
      return rastralSize/2;
    }
  };
  /** Writes Dot to text */
  this.toText = function(){
    return this.staffPos ? "."+this.staffPos.toString(16).toUpperCase() : ".";
  };
  /** reallyAugments
   * The augments slot just means that the dot follows a
   * note. There's no easy, guaranteed way to know it's an
   * augmentation, but our editorial practice is to show vertical
   * displacement for perfection dots.
   */
	this.reallyAugments = function(){
		// The augments slot just means that the dot follows a
		// note. There's no easy, guaranteed way to know it's an
		// augmentation, but our editorial practice is to show vertical
		// displacement for perfection dots.
		return this.augments && (!this.staffPos  || this.staffPos===this.augments.staffPos
														 || (this.augments.staffPos % 2 === 0 && Math.abs(this.staffPos-this.augments.staffPos<2)));
  };
  /** Writes Dot as MEI element */
  this.toMEI = function(doc, parent){
    if(!parent) parent = doc.currentParent;
    var el = doc.createElementNS("http://www.music-encoding.org/ns/mei", "dot");
		addUUIDs(this, el, curDoc);
    MEIAddPosition(this, el);
    // ? form?
    if(parent.tagName==="note" || this.reallyAugments()) el.setAttribute("form", "aug");
    // dot as a child of note or rest is not allowed in MEI mensural
    if (parent.tagName==="note" || parent.tagName==="rest")
    {
      parent.after(el)
    }
    else
    {
      parent.appendChild(el);
    }
    this.MEIObj = el;
    return el;
  };
  /** Draws dot to SVG */
  this.draw = function(){
    var extraClasses = "";
    // curx -= this.augments ? 0.6 * prop * rastralSize : 0.4 * prop * rastralSize;
    if(!this.augments) {
      curx += rastralSize/6;
    } else {
      curx -= rastralSize/12;
    }
    if(this.text && underlays.length){
      // Check for text issues
      curx = Math.max(curx, underlayRight(this.text.position));
    }
    this.startX = curx;
    if(this.classList.length){
      extraClasses = classString(this.classList);
      drawClasses(this.classList, this);
    }
    var pos = staffPosition(this) || dotPos || Math.floor(currentLinecount/4)*2+1;
    if(dotNudge) pos -= 0.4;
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

/** @class 
 * @memberof classes */
function SignumCongruentiae(){
  /** @property {?} */
  this.objType = "SignumCongruentiae";
  /** @property {?} */
  this.effects = false;
  /** @property {?} */
  this.staffPos = false;
  /** @property {?} */
  this.startX = false;
  /** @property {?} */
  this.text = false;
  /** @property {?} */
  this.domObj = false;
  /** @property {?} */
  this.flipped = false;
  /** @property {?} */
  this.example = currentExample;
  /** @property {?} */
  this.classList = currentExample.classes ? currentExample.classes.classes.slice(0) : [];
  /** @property {?} */
  this.MEIObj = false;
  /** @property {?} */
  this.prevEventObj = false;
  /** @property {?} */
  this.nextEventObj = false;
  /** method */
  this.forwardEvent = function(variant){return this;};
  /** method */
  this.backwardEvent = function(variant){return this;};
  /** method */
  this.prevEvent = function(variant){
    return this.prevEventObj ? this.prevEventObj.backwardEvent(variant) : false;
  };
  /** method */
  this.nextEvent = function(variant){
    return this.nextEventObj ? this.nextEventObj.forwardEvent(variant) : false;
  };
  /** method */
  this.varStartStaffPos = function(variant){ 
    // FIXME: This is needed rarely, but the logic is not quite right
    var n = this.nextEvent(variant);
    if(n){
      return n.varStartStaffPos(variant);
    } else {
      return false;
    }
  };
  /** method */
  this.varEndStaffPos = function(variant){ 
    // FIXME: This is needed rarely, but the logic is not quite
    // right. Caller doesn't expect false at this point, for example
    var p = this.prevEvent(variant);
    console.log("path g", this, p);
    if(p){
      return p.varEndStaffPos(variant);
    } else {
      return false;
    }
  };
  /** @property {?} */
  this.width = zeroWidth;
  /** Writes signum congruentiae to text */
  this.toText = function(){
    // FIXME: fake
    return "?"+this.staffPos ? this.staffPos : "";
  };
  /** Draws Signum Congruentiae to SVG */
  this.draw = function(variant){
    var extraClasses = "";
    var oldx = 0;
    var pos = this.staffPos;
		console.log("drawing sc", curx);
    if(!pos){
      if(this.flipped){
//        pos = this.staffPos || (dotPos-3) || (Math.floor(currentLinecount/4)*2-3);
        pos = this.staffPos || (dotPos-1) || (Math.floor(currentLinecount/4)*2-3);
//        console.log("Flipped s.c. at", pos, this.staffPos, dotPos, currentLinecount);
      } else {
        pos = this.staffPos || (2+dotPos) || (Math.floor(currentLinecount/4)*2+3);
//        console.log("s.c. at", pos, this.staffPos, dotPos, currentLinecount);
      }
    }
    if(this.effects && !variant){ //&& $(SVG).parents("#content").length){
			console.log("step1", this.effects.subType, this.effects.objType);
      oldx = curx;
      if(this.effects.objType==="MusicalChoice"){
        if(currentReading){
					console.log(curx);
          var opos = currentReading.content.indexOf(this);
          if(opos===0){
            if($(SVG).parents("#content").length){
              curx = currentExample.events[eventi-1].startX;
            }
          } 
          else if(opos>-1){
            curx = currentReading.content[opos-1].startX;
          }
        }
        else if($(SVG).parents("#content").length){
          curx = currentExample.events[eventi-1].startX;
        }
      } 
      else if(this.effects.objType==="Ligature Choice"){
        if(this.effects.subType==="SignumCongruentiae"){
          var memi = this.effects.ligature.members.indexOf(this.effects);
          var reallyEffects = this.effects.ligature.members[memi-1];
          curx = reallyEffects.startX;
        }
        else if(currentReading){
          var opos = currentReading.content.indexOf(this);
          if(opos>0){
            curx = currentReading.content[opos-1].startX;
          }
        }
        else{
          curx = currentExample.events[eventi-1].startX;
        }
        /*if(currentReading && !$(SVG).parents("#content").length){
          var opos = currentReading.content.indexOf(this);
          if(opos===0){
            curx = currentExample.events[eventi-1].startX;
          } 
          else if(opos>-1){
            curx = currentReading.content[opos-1].startX;
          }
        } 
        else {
					if(this.effects.subType==="SignumCongruentiae"){
						var memi = this.effects.ligature.members.indexOf(this.effects);
						var reallyEffects = this.effects.ligature.members[memi-1];
						curx = reallyEffects.startX;
					}
				}*/
      }
      else if(this.effects.objType==="ObliqueNote" && this.effects.index === 0 && this.flipped){
        curx = this.effects.startX - rastralSize/2;
      }
      else {
				curx = this.effects.startX;
      }
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
    curx = this.effects.objType==="Ligature Choice" ? oldx : Math.max(oldx, curx);
    return this.domObj;    
  };
	this.drawVar = function(variant){
		d = this.draw(variant);
		return d;
	}
  // Signum Congruentiae
}

/** @class 
 * @memberof classes */
function Fermata(){
  /** @property {string} */
  this.objType = "Fermata";
  /** @property {?} */
  this.lengthens = false;
  /** @property {?} */
  this.staffPos = false;
  /** @property {?} */
  this.startX = false;
  /** @property {?} */
  this.text = false;
  /** @property {?} */
  this.domObj = false;
  /** @property {?} */
  this.flipped = false;
  /** @property {?} */
  this.example = currentExample;
  /** @property {?} */
  this.classList = currentExample.classes ? currentExample.classes.classes.slice(0) : [];
  /** width */
  this.width = function(){
    return dotData[2]*rastralSize * prop;
  };
  /** Writes Fermata to text */
  this.toText = function(){
    return this.staffPos ? "."+this.staffPos.toString(16).toUpperCase() : ".";
  };
  /** Writes fermata as MEI element */
  this.toMEI = function(doc, parent){
    if(!parent) parent = doc.currentParent;
    // Fermata element is not allowed in MEI Mensural, only @fermata
    /*var el = doc.createElementNS("http://www.music-encoding.org/ns/mei", "fermata");
		addUUIDs(this, el, curDoc);
    MEIAddPosition(this, el);
    if(this.lengthens && this.lengthens.MEIObj 
       && this.lengthens.MEIObj.getAttribute("xml:id")){
      el.setAttribute("startid", this.lengthens.MEIObj.getAttribute("xml:id"));
    }
    parent.appendChild(el);
    return el;*/
    if(this.lengthens && this.lengthens.MEIObj)
    {
      if(this.flipped)
      {
        this.lengthens.MEIObj.setAttribute("fermata", "below");
      }
      else
      {
        this.lengthens.MEIObj.setAttribute("fermata", "above");
      }
    }
  };
  /** Draws Fermata to SVG */
  this.draw = function(){
    var extraClasses = "";
    var oldx = 0;
    var pos;
    if(this.flipped){
      pos = staffPosition(this) || (dotPos-2) || (Math.floor(currentLinecount/4)*2-3);
      // adjust pos for notes with downward stem in cases without manual positioning
      if (this.lengthens.rhythm[0].match(/[m|s|f]/) && !staffPosition(this) && this.lengthens.flipped){
        pos = pos - 3;
      }
    } else {
      pos = staffPosition(this) || (dotPos+2) || (Math.floor(currentLinecount/4)*2+3);
      // adjust pos for notes with upward stem in cases without manual positioning
      if (this.lengthens.rhythm[0].match(/[m|s|f]/) && !staffPosition(this) && !this.lengthens.flipped){
        pos = pos + 4;
      }
    }
    if(!$(SVG).parents("#content").length && $(this.lengthens.domObj).parents("#content").length){
//      console.log(SVG!=$(this.lengthens.domObj).parents("SVG")[0]);
      this.lengthens.draw();
    }
    if(this.lengthens) {
      oldx = curx;
      curx = this.lengthens.startX;
      if(this.lengthens.objType==="ObliqueNote" && this.lengthens.index === 0 && this.flipped){
        curx -= rastralSize/2;
      }
    }
    this.startX = curx;
    if(this.classList.length){
      extraClasses = classString(this.classList);
      drawClasses(this.classList, this);
    }
    if(this.flipped){
      this.domObj = invertedFermataGlyph.draw(curx, yPos(cury,pos), rastralSize, "mensural fermata"+extraClasses);
    } else {
      this.domObj = fermataGlyph.draw(curx, yPos(cury,pos), rastralSize, "mensural fermata"+extraClasses);
    }
    curx += fermataGlyph.advanceWidth(rastralSize);
    curx = Math.max(oldx, curx);
    return this.domObj;
  };
  // Fermata
}

/** @class 
 * @memberof classes */
function Custos(){
  // Self explanatory. Generally behaves like a note.
  /** @property {?} */
  this.objType = "Custos";
  /** @property {?} */
  this.text = false;
  /** @property {?} */
  this.staffPos = false;
  /** @property {?} */
  this.staffPosGuessed = false;
  /** @property {?} */
  this.pitch = false;
  /** @property {?} */
  this.startX = false;
  /** @property {?} */
  this.domObj = false;
  /** @property {?} */
  this.sup = false;
  /** @property {?} */
  this.example = currentExample;
  // Copy current classes
  /** @property {?} */
  this.classList = currentExample.classes ? currentExample.classes.classes.slice(0) : [];
  /** width */
  this.width = function(){
    return 2.5*rastralSize;
  };
  /** writes custos to text
   * @returns {string} text
   */
  this.toText = function(){
    return "c"+this.staffPosGuessed ? "" : this.staffPos.toString(16).toUpperCase();
  };
  /** @returns pitched MEI custos */
  this.MEINode = function(parentDoc){
    if(this.pitch){
      return PitchedMEICustos(this.pitch, this.rhythm, false);
    }
    return false;
  };
  /** Writes custos to MEI element
   *  @returns element
   */
  this.toMEI = function (doc, parent){
    if(!parent) parent = doc.currentParent;
    var el = doc.createElementNS("http://www.music-encoding.org/ns/mei", "custos");
		addUUIDs(this, el, curDoc);
    MEIAddPosition(this, el);
    parent.appendChild(el);
    this.MEIObj = el;
    return el;
  };
  /** draws custos to SVG */
  this.draw = function() {
    var spos = staffPosition(this);
    if(this.classList.length){
      extraClasses = classString(this.classList);
      drawClasses(this.classList, this);
    }
    if(this.sup){
      curx = currentExample.events[eventi-1].startX;
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

/** @function compoundNotep
 * @summary Checks if object is not TextUnderlay and not Comment
 * @param {?} object
 * @returns {boolean} 
 */
function compoundNotep(obj){
  return obj.objType != "TextUnderlay" && obj.objType != "Comment";
}

/** @class 
 * @memberof classes */
function LigatureNote(note){
  /** @property {?} */
  this.objType = "LigatureNote";
  /** @property {?} */
  this.text = note.text;
  /** @property {number} staffPos staff position matching clef */
  this.staffPos = note.staffPos;
  /** @property {string} pitch pitch name as encoded */
  this.pitch = note.pitch;
  /** @property {Array} */
  this.rhythm = note.rhythm;
  /** @property {?} */
  this.sup = note.sup;
  /** @property {?} */
  this.forceTail = note.forceTail;
  /** @property {?} */
  this.startX = false;
  /** @property {?} */
  this.startY = false;
  /** @property {?} */
  this.domObj = false;
  /** @property {Dot} dot dot related to note */
  this.dot = false;
  /** @property {?} */
  this.MEIObj = false;
  /** @property {SignumCongruentiae} signum signum related to note */
  this.signum=false;
  /** @property {Fermata} fermata fermata related to note */
  this.fermata = false;
  /** @property {?} */
  this.voidnotes = note.voidnotes;
  /** @property {?} */
  this.subType = note.subType;
  /** @property {MusicExample} example ancestor music example */
  this.example = note.example;
  /** @property {Ligature} ligature parent ligature */
  this.ligature = false;
  /** @property {?} */
  this.index = false;
  /** @property {*} prevEventObj preceeding event object */
  this.prevEventObj = false;
  /** @property {*} nextEventObj following event object */
  this.nextEventObj = false;
  /** @property {?} */
  // Copy current classes
  this.classList = currentExample.classes ? currentExample.classes.classes.slice(0) : [];
  /** forwardEvent */
  this.forwardEvent = function(variant){return this;};
  /** backward Event */
  this.backwardEvent = function(variant){return this;};
  /** previous event */
  this.prevEvent = function(variant){
    return this.prevEventObj ? this.prevEventObj.backwardEvent(variant) : false;
  };
  /** next event */
  this.nextEvent = function(variant){
    return this.nextEventObj ? this.nextEventObj.forwardEvent(variant) : false;
  };
  /** width */
  this.width = function(){
    return this.rhythm == "M" ? 19/10*rastralSize : rastralSize;
  };
  /** variant start staff position
   * @param variant
   */
  this.varStartStaffPos = function(variant){ 
    return staffPosition(this);
//    return this.staffPos;
  };
  /** variant end staff position
   * @param variant
   */
  this.varEndStaffPos = function(variant){ 
    return staffPosition(this);
  };
  /** lstem
   * @param variant
   */
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
  /** rstem
   * @param variant
   */
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
//        console.log("path c", this, this.prevEvent(variant));
        if(this.prevEvent(variant).varEndStaffPos(variant) < staffPosition(this))
          return true;
      } else {
        // Middle long or maxima always has tail
        return true;
      }
    } 
    return false;
  };
  /** Writes LigatureNote to text */
  this.toText = function(){
    var text = "";
    if(this.sup) text+= "^";
    if(this.rhythm) text += this.rhythm;
    text += this.pitch ? this.pitch : this.staffPos.toString(16).toUpperCase();
    return text;
  };
  // Ligature Note
  /** Writes LigatureNote as MEI element */
  this.toMEI = function(doc, parent){
    if(!parent) parent = doc.currentParent;
    var el = doc.createElementNS("http://www.music-encoding.org/ns/mei", "note");
    // FIXME: SUP?
    el.setAttribute("dur", rhythms[this.rhythm]);
		addUUIDs(this, el, curDoc);
    MEIAddPosition(this, el);
    if((voidRule(this) && currentSubType==="full") 
       || (fullRule(this) && currentSubType==="void")){
      el.setAttribute("coloration", "true");
    }
		this.MEIObj = el;
    parent.appendChild(el);
    if(this.dot) this.dot.toMEI(doc, el);
  };
  // Ligature Note
  /** draw variant
   * @param variant
   */
  this.drawVar = function(variant){
    var extraClasses = "", oldx, obj;
    // ?? Sup????
    if(this.classList.length){
      extraClasses = classString(this.classList);
      drawClasses(this.classList, this);
    }
    this.startX = curx;
    if(this.signum){
      this.signum.draw();
    }
    if(this.fermata){
      this.fermata.draw();
    }
    curx = this.startX;
//    console.log(this, this.prevEvent(variant), variant);
    obj = drawBox(this, this.prevEvent(variant) && 
      this.prevEvent(variant).varEndStaffPos(variant), 
      this.width(variant), this.lstem(variant), this.rstem(variant), 
      this.sup, (currentSubType==="black" || currentSubType==="full" || fullRule(this)), extraClasses);
    if(this.nextEvent(variant) 
       && (staffPosition(this.nextEvent(variant)) - staffPosition(this)) > -1){
      // If the notes are close, any dots may need to shift
      if(staffPosition(this)%2){
        // We're in a space. Only shift if they're one step apart
        if((staffPosition(this.nextEvent(variant)) - staffPosition(this)) < 2){
          setDotPos(staffPosition(this), false, true);
        } else {
          setDotPos(staffPosition(this));
        }
      } else {
        // We're on a line. Move dots to below, rather than above, the
        // line, if the gap is too small
        if((staffPosition(this.nextEvent(variant)) - staffPosition(this)) < 2){
          setDotPos(staffPosition(this), true);
        } else {
          setDotPos(staffPosition(this), false, true);
        }
      }
    } else {
      setDotPos(staffPosition(this));
    }
    // setDotPos(staffPosition(this));
    if(this.dot){
      oldx = curx;
      curx+=rastralSize/3;
      this.dot.draw();
      curx = oldx;
    }
    return obj;
  };
  /** draw LigatureNote to SVG */
  this.draw = function(){
    var extraClasses = "", oldx, obj;
    if(this.classList.length){
      extraClasses = classString(this.classList);
      drawClasses(this.classList, this);
    }
    this.startX = curx;
		//    curx = this.startX;
		if(this.text){
      this.text.draw();
    } 
    if(this.nextEvent() 
       && (staffPosition(this.nextEvent()) - staffPosition(this)) > -1){
      // If the notes are close, any dots may need to shift
      if(staffPosition(this)%2){
        // We're in a space. Only shift if they're one step apart
        if((staffPosition(this.nextEvent()) - staffPosition(this)) < 2){
          setDotPos(staffPosition(this), false, true);
        } else {
          setDotPos(staffPosition(this));
        }
      } else {
        // We're on a line. Move dots to below, rather than above, the
        // line, if the gap is too small
        if((staffPosition(this.nextEvent()) - staffPosition(this)) < 2){
          setDotPos(staffPosition(this), true);
        } else {
          setDotPos(staffPosition(this), false, true);
        }
      }
    } else {
      setDotPos(staffPosition(this));
    }
    if(this.signum){
      this.signum.draw();
    }
    if(this.fermata){
      this.fermata.draw();
    }
    curx = this.startX;
    obj = drawBox(this, this.prevEvent() && this.prevEvent().varEndStaffPos(), 
      this.width(), this.lstem(), this.rstem(), this.sup, 
      (currentSubType==="black" || currentSubType==="full" || fullRule(this)), extraClasses);
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

/** @class 
 * @memberof classes */
function LigatureComment(comment){
  /** @property {?} */
  this.objType = "LigatureComment";
  /** @property {?} */
  this.content = comment.content;
  /** @property {?} */
  this.width = zeroWidth;
  /** @property {?} */
  this.startX = false;
  /** @property {?} */
  this.commentStyle = commentStyle;
  /** @property {?} */
  this.endX = false;
  /** @property {?} */
  this.startY = false;
  /** @property {?} */
  this.endY = false;
  /** @property {?} */
  this.ligature = false;
  /** @property {?} */
  // Copy current classes
  this.classList = currentExample.classes ? currentExample.classes.classes.slice(0) : [];
  /** to text */
  this.toText = function(){
    return "**"+this.content+"**";
  };
  /** @property {?} */
  this.updateStyles = keepStyles;
  /** draw variant
   * @param variant
   */
  this.drawVar = function(variant){
    return this.draw();
  };
  /** to mei */
  this.toMEI = function(doc, parent){		
    if(!parent) parent = doc.currentParent;
    var el = doc.createElementNS("http://www.music-encoding.org/ns/mei", "annot");
    el.appendChild(doc.text(this.content)); //FIXME: UPDATE FROM GENERIC COMMENTS (missing rich text)
		addUUIDs(this, el, curDoc);
    // FIXME: what does this apply to ("plist" attribute)
    return el;
  };/** footnote */
  this.footnote = function(){
    return DOMSpan(false, false, this.content);
  };
  /** draw to SVG */
  this.draw = function(){
    // FIXME: Check this -- it's nonsense to me at the moment
    if(!showtranslationnotes || !showtranscriptionnotes) {
      // WHICH??? One of these is relevant, but can't tell
      return false;
    }
    var drawnx = curx - rastralSize/2;
    // var drawnx = curx;
    // this.startY = cury - rastralSize * currentLinecount;
    // var prev = prevNote;
    // var drawnx = (prev && prev.startX) || curx;
    var drawny = yPos(cury, dotPos+2);
    this.startX = drawnx;
    this.startY = drawny;
    this.endY = this.startY - Math.floor(rastralSize * textScale * 2);
    var star = svgText(SVG, drawnx, this.startY, "annotation musical", false, false, "*");
    var j = currentExample.comments.indexOf(this);
    if(j===-1){
      console.log(["Note Error: "+examplei,currentExample]);
    } else {
      addAnnotation(star, this, "Annotation");
//      star.setAttributeNS(null, "onmouseover", "top.tooltipForComment("+examplei+","+j+", "+(this.startX+10)+","+(10+this.startY)+");");
//      star.setAttributeNS(null, "onmouseout", "top.removeTooltip()");
    }
    return star;
  };
  // Ligature Comment
}

/** @class
 * @classdesc Container object for Note and Oblique objects in ligature.
 * @memberof classes
 */
function Ligature(){
  // Container object for Note and Oblique objects in ligature.
  /** @property {?} */
  this.objType = "Ligature";
  /** @property {?} */
  this.str = false;
  /** @property {Array} */
  this.members = [];
  /** @property {?} */
  this.startX = false;
  /** @property {?} */
  this.fake = false;
  /** @property {?} */
  this.firstEventObj = false;
  /** @property {?} */
  this.lastEventObj = false;
  /** @property {?} */
  // Copy current classes
  this.classList = currentExample.classes ? currentExample.classes.classes.slice(0) : [];
  /** enrich event
   * @param event
   * @param eventlist
   */
  this.enrichEvent = function(event, eventlist){
    if(event.objType == "Note"){
      event = new LigatureNote(event);
    }
    if(event.objType === "SignumCongruentiae"){
      event.ligature = this;
      var parNote = eventlist.length ? eventlist[eventlist.length-1] : false;
      if(parNote) {
        // FIXME
        parNote.signum = event;
        return false;
      } else {
        return event;
      }
    } else {
      event.ligature = this;
      if(eventlist.length) {
        event.prevEventObj = eventlist[eventlist.length-1];
        eventlist[eventlist.length-1].nextEventObj = event.prevEventObj;
      }
      return event;
    }
  };
  /** to text */
  this.toText = function(){
    var text = "<lig>";
    for(var i=0; i<this.members.length; i++){
      if(i>0) text += " ";
      text += this.members[i].toText();
    }
    return text+"</lig>";
  };
  /** last note index p */
  this.lastNoteIndexp = function(index){
    return !this.nextNote(index);
  };
  /** first note index p */
  this.firstNoteIndexp = function(index){
    return !this.prevNote(index);
  };
  /** next note */
  this.nextNote = function(index){
    for(var i=index+1; i<this.members.length; i++){
//      if(this.members[i].objType != "TextUnderlay"){
      if(compoundNotep(this.members[i])){
        return this.members[i];
      }
    }
    return false;
  };
  /** previous note */
  this.prevNote = function(index){
    for(var i=index-1; i>=0; i--){
      if(compoundNotep(this.members[i])){
        return this.members[i];
      }
    }
    return false;
  };
  // Ligature
  /** nth note */
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
  /** previous position */
  this.prevPos = function(index){
    var note = this.prevNote(index);
    if(note){
      return note.objType == "Oblique" ? staffPosition(note.members[1]) : oblElementStaffPos(note);
    } else return false;
  };
  /** next position */
  this.nextPos = function(index){
    var note = this.nextNote(index);
    if(note){
      return note.objType == "Oblique" ? staffPosition(note.members[0]) : oblElementStaffPos(note);
    } else return false;
  };
  /** width */
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
  /** first event
   * @param variant
   */
  this.firstEvent = function(variant){
    return this.firstEventObj.forwardEvent(variant);
  };
  // Ligature
  /** left overhang
   * @param variant
   */
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
  /** add event
   * @param event
   */
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
  /** add choice
   * @param event
   */
  this.addChoice = function(event){
    if(this.lastEventObj){
      this.lastEventObj.nextEventObj = event;
      event.prevEventObj = this.lastEventObj;
      for(var c=0; c<event.content.length; c++){
        if(event.content[c].objType!=="MusicalOmission"){
          event.content[c].content[0].prevEventObj = this.lastEventObj;
        }
      }
    } else{
      this.firstEventObj = event;
    }
    this.lastEventObj = event;
    event.ligature = this;
    this.members.push(event);
    return event;
  };
  /** add element
   * @param el
   */
  this.addElement = function(el){
    switch(el.objType){
      case "LigatureNote":
      case "Oblique":
        return this.addEvent(el);
      case "ObliqueNote Choice":
      case "Ligature Choice":
        return this.addChoice(el);
			case "TextUnderlay":
				for(var i=this.members.length-1; i>=0; i--){
					if(this.members[i].objType=="LigatureNote"){
						el.ligature = this;
						this.members[i].text = el;
						return el;
					}
				}
      default:
        el.ligature = this;
        this.members.push(el);
        return el;
    };
  };
  // Ligature
  /** add note
   * @param {Note} note
   */
  this.addNote = function(note){
    note = new LigatureNote(note);
    this.addEvent(note);
  };
  /** add Oblique
   * @param {Oblique} oblique
   */
  this.addOblique = function(oblique){
    this.addEvent(oblique);
  };
  /** oblique
   * @summary Are the only notes here in obliques? This matters for MEI
   */
  this.oblique = function(){
    // Are the only notes here in obliques? This matters for MEI
    for(var i=0; i<this.members.length; i++){
      if(this.members[i].objType==="LigatureNote") return false;
    }
    return true;
  };
  /** variant end staff position
   * @param variant
   */
  this.varEndStaffPos = function(variant){
    return this.members[this.members.length-1].varEndStaffPos(variant);
  };
  /** to MEI */
  this.toMEI = function(doc, parent){
    if(!parent) parent = doc.currentParent;
    var el = doc.createElementNS("http://www.music-encoding.org/ns/mei", "ligature");
    el.setAttribute("form", (this.oblique() ? "obliqua" : "recta"));
		addUUIDs(this, el, curDoc);
    for(var i=0; i<this.members.length; i++){
      if(this.members[i].toMEI) this.members[i].toMEI(doc, el);
    }
    parent.appendChild(el);
    return el;
  };
  /** draw variant */
  this.drawVar = function(variant){
    // Check for text issues
    if(this.members[0].text && underlays.length){
      curx = Math.max(curx, underlayRight(this.members[0].text.position));
    }
    curx += this.leftOverhang(variant) + 0.5 * prop * rastralSize;
    for(var i=0; i<this.members.length; i++){
      if(this.members[i].drawVar) {
        this.members[i].drawVar(variant);
      }  else {
        this.members[i].draw();
      }
    }
    curx+=rastralSize/2;
  };
  /** negative space */
  this.negativeSpace = function(){
    return rastralSize/6;
  };
  /** draw to SVG */
  this.draw = function(){
    curx += this.leftOverhang(false) + 0.5 * prop * rastralSize;
    var tempSVG = SVG;
    var group = svgGroup(SVG, "CompleteLigatureGroup", false);
		this.domObj = group;
    SVG = group;
    var extraClasses = "";
    // Now check for styles
    if(this.classList.length){
      extraClasses = classString(this.classList);
      drawClasses(this.classList, this);
    }
    for(var i=0; i<this.members.length; i++){
//			console.log("lig", i, curx);
      this.members[i].draw();
    }
    SVG = tempSVG;
    curx+=this.members[this.members.length-1].dot ? rastralSize : rastralSize/2;
    return group;
  };
  // Ligature
}

/** @class 
 * @memberof classes
 * @classdesc Oblique symbols in ligatures have only two members to worry
 * about. See below for the equivalent structure in neumes.
*/
function Oblique(){
  // Oblique symbols in ligatures have only two members to worry
  // about. See below for the equivalent structure in neumes.
  /** @property {?} */
  this.objType = "Oblique";
  /** @property {?} */
  this.members = [];
  /** @property {?} */
  this.texts = [false, false];
  /** @property {?} */
  this.comments = [false, false]; //why two?
  /** @property {?} */
  this.before = false;
  /** @property {?} */
  this.startX = false;//curx;
  /** @property {?} */
  this.ligature = false;
  /** @property {?} */
  this.prevEventObj = false;
  /** @property {?} */
  this.nextEventObj = false;
  /** @property {?} */
  // Copy current classes
  this.classList = currentExample.classes ? currentExample.classes.classes.slice(0) : [];
  /** forward Event
   * @param variant
   */
  this.forwardEvent = function(variant){
    return this.members[0] ? this.members[0].forwardEvent(variant) : this.nextEvent(variant);
  };
  /** backward event
   * @param variant
   */
  this.backwardEvent = function(variant){
    return this.members[1] ? this.members[1].backwardEvent(variant) :
      (this.members[0] ? this.members[0].backwardEvent(variant) :
       this.membersthis.prevEvent(variant));
  };
  /** previous event
   * @param variant
   */
  this.prevEvent = function(variant){
    return this.prevEventObj ? this.prevEventObj.backwardEvent(variant) : false;
  };
  /** next event
   * @param variant
   */
  this.nextEvent = function(variant){
    return this.nextEventObj ? this.nextEventObj.forwardEvent(variant) : false;
  };
  /** enrich event
   * @param event
   * @param eventlist
   */
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
  /** extend members
   * @param event
   */
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
        if(event.content[i].objType==="MusicalOmission"){
					// Lord knows
				} else if (event.content[i].content.length == 2){
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
	this.toMEI = function(doc, parent){
    if(!parent) parent = doc.currentParent;
    // currently, ObliqueNoteChoice.toMEI() is not implemeted,
    // just retrieve default reading instead
    // change defaultRdg back to this.members...
    var defaultRdg = this.flattenedMembers(false);
		for(var i=0; i<defaultRdg.length; i++){
			if(defaultRdg[i].toMEI){
				defaultRdg[i].toMEI(doc, parent);
			}
		}
  }
  /** width */
  this.width = function(){
    return oWidth(this.member(0, false).staffPos, this.member(1, false).staffPos);
//        rastralSize * prop + rastralSize * prop * Math.abs(this.members[1].staffPos - this.members[0].staffPos) / 4;
  };
  // Oblique
  /** draws text */
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
  /** draw comments */
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
  /** lstem
   * @param variant
   */
  this.lstem = function(variant){
    // check forceTail
    switch(this.member(0, variant).forceTail){
      case "++":
        return 1;
      case "+-":
        return -1;      
    }
    if(this.member(0, variant).rhythm == "S"){
      var prev = this.prevEvent(variant);
      if(prev && prev.lstem(variant) == 1){
        return false;
      } else {
        return 1;
      }
    } else if (!this.prevEvent(variant) && this.member(0, variant).rhythm == "B"){
      return -1;
    }
    return false;
  };
  /** rstem 
   * @param variant
  */
  this.rstem = function(variant){
    return this.member(1, variant).rhythm=="L" || this.member(1, variant).forceTail == "+";
  };
  /** flattened members
   * @summary Not as harmful as it sounds. Support function for this.member –
   * create a list of all member notes and the variants they apply to.
   * @param variant
   */
	this.flattenedMembers = function(variant){
		// Not as harmful as it sounds. Support function for this.member –
		// create a list of all member notes and the variants they apply to.
		var m = [];
    for(var i=0; i<this.members.length; i++)
    {
			var member = this.members[i];
			if(member.objType==="ObliqueNote") 
      {
				m.push(member);
			} 
      else if (member.objType==="ObliqueNote Choice")
      {
				for(var j=0; j<member.content.length; j++)
        {
					var reading = member.content[j];

          if(reading.content && (!variant || reading.applies(variant)))
          {
						for(var k=0; k<reading.content.length; k++)
            {
              if(reading.content[k].objType==="ObliqueNote" || reading.content[k].objType==="Note")
              {
								m.push(reading.content[k]);
							}
						}
					}
          if(!variant) break;
				}
			}
		}
		return m;
	};
  // Oblique
  /** member
   * @param i
   * @param variant
   */
  this.member = function(i, variant){
    // var e = this.forwardEvent(variant);
    // for(var j=0; j<i; j++){
    //   e = e.nextEvent(variant);
    // }
    // return e;
		// Trying out a simpler, but (hopefully more powerful) version:
		return this.flattenedMembers(variant)[i];
		/*
    if(i==0){
      return this.forwardEvent(variant);
    } else {
      return this.backwardEvent(variant);
    }
		*/
  };
  /** width
   * @param variant
   */
  this.width = function(variant){
    return oWidth(this.member(0, variant).staffPos, this.member(1, variant).staffPos);
  };
  /** draw variant
   * @param variant
   */
  this.drawVar = function(variant){
    this.startX = curx;
    this.drawTexts(variant);
    this.drawComments(variant);
    var m0 = this.member(0, variant);
    m0.startX = this.startX;
    var m1 = this.member(1, variant);
    m1.startX = this.startX + oWidth(m0.staffPos, m1.staffPos)/1.8;
    // Draw oblique bit
    if(!(m0&&m1)) return false;
    if(m0.choice)
    {
      if(variant || !showvariants)
      {
        m0.choice.drawVar(variant);
      }
      else
      {
        let click = m0.choice.drawVar(false);
        click.style.fill = "#0B0";
        let tempSVG = SVG;
        addAnnotation(click, this.members[0], "Oblique MusicalChoice");
        SVG = tempSVG;
      }
    }
    else
    {
      if(variant)
      {
        m0.drawVar(variant);
      }
      else
      {
        m0.draw();
      }
    }
    if(m1.choice)
    {
      if(variant || !showvariants)
      {
        m1.choice.drawVar(variant);
      }
      else
      {
        let click = m1.choice.drawVar(false);
        click.style.fill = "#0B0";
        let tempSVG = SVG;
        addAnnotation(click, this.members[1], "Oblique MusicalChoice");
        SVG = tempSVG;
      }
    }
    else
    {
      if(variant)
      {
        m1.drawVar(variant);
      }
      else
      {
        m1.draw();
      }
    }
    //then left stem
    var ls = this.lstem(variant);
    if(ls){
      m0.drawLStem(ls);
    }
    // var ppos = this.prevEvent(variant).staffPos;
    var ppos = staffPosition(this.prevEvent(variant));
    // Join
    if(ppos && Math.abs(ppos-m0.staffPos)>1){
      var met = metrics();
      var offset = currentSubType == "void" ? 
                     met.oblOffset+met.vThickness :
                     met.hThickness / 2;
      var joinTop = Math.max(yoffset(ppos), yoffset(m0.staffPos))+offset;
      var joinBottom = Math.min(yoffset(ppos), yoffset(m0.staffPos))-offset;
      
      svgLine(SVG, curx+met.vThickness, cury-joinBottom, curx+met.vThickness, cury-joinTop, "ligatureVertical join from-"+ppos+" to-"+m0.staffPos, false);
    }
    // FIXME: WHERE'S RSTEM?!?
    //setDotPos(this.member(0, variant).staffPos);
    setDotPos(staffPosFromPitchString(this.member(0, variant).pitch));
    curx += oWidth(m0.staffPos, m1.staffPos);
    // handling dots in obliques
    if(this.member(0, variant).dot){
      var oldx = curx;
      curx-= oWidth(m0.staffPos, m1.staffPos)/1.8;
      this.member(0, variant).dot.draw();
      curx = oldx;
    }
    setDotPos(staffPosFromPitchString(this.member(1, variant).pitch));
    if(this.member(1, variant).dot){
      var oldx = curx;
      curx+=rastralSize/2.5;
      this.member(1, variant).dot.draw();
      if(this.nextEvent()) curx = oldx;
    }

    // handling signum congruentiae
    if(this.member(0, variant).signum){
      var oldx = curx;
      this.member(0, variant).signum.draw();
      curx = oldx;
    }
    if(this.member(1, variant).signum){
      var oldx = curx;
      this.member(1, variant).signum.draw();
      if(this.nextEvent()) curx = oldx;
    }

    // handling fermatas
    if(this.member(0, variant).fermata){
      var oldx = curx;
      this.member(0, variant).fermata.draw();
      curx = oldx;
    }
    if(this.member(1, variant).fermata){
      var oldx = curx;
      this.member(1, variant).fermata.draw();
      if(this.nextEvent()) curx = oldx;
    }

    return false;
  };
  /** draw to SVG
   * @param prevPos
   * @param semi
   */
  this.draw = function(prevPos, semi){
    this.drawVar(false);
  };
  // Oblique
}

/** @class
 * @classdesc Takes a normal note and generates more specialised object
 * @memberof classes
 * @param {Note} note
 * @param {number} index
 * @param {Oblique} oblique
 */
function ObliqueNote(note, index, oblique){
  // Takes a normal note and generates more specialised object
  /** @property {?} */
  this.objType = "ObliqueNote";
  /** @property {?} */
  this.text = note.text;
  /** @property {?} */
  this.staffPos = note.staffPos;
  /** @property {?} */
  this.before = false;
  /** @property {?} */
  this.pitch = note.pitch;
  /** @property {?} */
  this.rhythm = note.rhythm;
  /** @property {?} */
  this.startX = false;
  /** @property {?} */
  this.startY = false;
  /** @property {?} */
  this.domObj = false;
  /** @property {?} */
  this.voidnotes = note.voidnotes;
  /** @property {?} */
  this.subType = note.subType;
  /** @property {Dot} */
  this.dot = false;
  /** @property {SignumCongruentiae} */
  this.signum = false;
  /** @property {Fermata} */
  this.fermata = false;
  /** @property {?} */
  this.example = note.example;
  /** @property {?} */
  this.forceTail = note.forceTail;
  /** @property {?} */
  this.oblique = oblique;
  /** @property {?} */
  this.ligature = false;
  /** @property {?} */
  this.index = false;
  /** @property {?} */
  this.otherBits = [];
  /** @property {?} */
  this.prevEventObj = false;
  /** @property {?} */
  this.nextEventObj = false;
  /** @property {?} */
  this.MEIObj = false;
  /** @property {?} */
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
	this.toMEI = function(doc, parent){
		if(!parent) parent = doc.currentParent;
    var el = doc.createElementNS("http://www.music-encoding.org/ns/mei", "note");
		el.setAttributeNS(null, "lig", "obliqua");
		addUUIDs(this, el, curDoc);
    // FIXME: SUP?
    el.setAttributeNS(null, "dur", rhythms[this.rhythm]);
    if(this.dot) this.dot.toMEI(doc, el);
    MEIAddPosition(this, el);
    if((voidRule(this) && currentSubType==="full") 
       || (fullRule(this) && currentSubType==="void")){
      el.setAttribute("coloration", "true");
    }
		this.MEIObj = el;
    parent.appendChild(el);

	};
  this.drawLStem = function(l){
    var m = metrics();
    var stemLength = this.voidnotes || currentSubType=="void" || currentSubType=="full" 
      ? m.stemLength : m.stemLength/4;
    // var offset = this.voidnotes  || currentSubType=="void" 
    //   ?  m.oblOffset+m.vThickness : m.hThickness/2;
    var offset = this.voidnotes  || currentSubType=="void"  || currentSubType=="full" 
      ?  m.oblOffset*0.64 : m.hThickness/2;
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
		var notes = this.oblique.flattenedMembers(variant);
		var otherPos = staffPosition(notes[this.index===0 ? 1 : 0]);
    if(this.classList.length){
      extraClasses = classString(this.classList);
      drawClasses(this.classList, this);
    }
		var ocx = curx;
		for(var i=0; i<this.otherBits.length; i++){
			if(variant) {
				this.otherBits[i].drawVar(variant);
			} else {
				this.otherBits[i].draw();
			}
		}
		curx = ocx;
    if(this.index === 0){
      return drawObliqueStart(staffPosition(this), otherPos, 
        (currentSubType==="black" || currentSubType==="full" || fullRule(this)), extraClasses);
    } else {
      return drawObliqueEnd(staffPosition(this), otherPos,
//        staffPosition(this.prevEvent(variant)), 
        (currentSubType==="black" || currentSubType==="full" || fullRule(this)), extraClasses);
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
		for(var i=0; i<this.otherBits.length; i++){
			var ocx = curx;
			this.otherBits[i].draw();
			curx = ocx;
    }

    if(this.index === 0){
      return drawObliqueStart(staffPosition(this), other ? staffPosition(other)
                                                  : staffPosition(this.nextEvent(false)), 
                              (currentSubType==="black" || currentSubType==="full" || 
                               fullRule(this)), extraClasses);   
    } else {
      return drawObliqueEnd(staffPosition(this), other ? staffPosition(other)
                                                 : staffPosition(this.prevEvent(false)),
                              (currentSubType==="black" || currentSubType==="full" || 
                               fullRule(this)), extraClasses);
    }
  };
  // Oblique Note
}

/** @class 
 * @memberof classes */
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
          curx = Math.max(curx, underlayRight(item.position));            
        }
        item.draw();
        curx +=rastralSize*0.6*prop;
      } else {
        if(item.text) {
          curx -=rastralSize*0.6*prop;
          if(i===0 && underlays.length){
            curx = Math.max(curx, underlayRight(item.position));
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
      curx = Math.max(curx, underlayRight(this.members[0].text.position));
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
            curx = Math.max(curx, underlayRight(item.text.position));
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

/** @class 
 * @memberof classes */
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

/** @class 
 * @memberof classes */
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

/** @class 
 * @memberof classes */
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
	this.UUID = "ID"+uuid();
  this.MEIObj = false;
  // Copy current classes
  this.classList = currentExample.classes ? currentExample.classes.classes.slice(0) : [];
  this.toText = function(){
    var text = "P";
    if(this.rhythm) text += this.rhythm;
    if(this.staffPos) text += this.staffPos.toString(16).toUpperCase();
    return text;
  };
  this.toMEI = function(doc, parent){
    if(!parent) parent = doc.currentParent;
    var el = doc.createElementNS("http://www.music-encoding.org/ns/mei", "rest");
		addUUIDs(this, el, curDoc);
    el.setAttribute("dur", rhythms[this.rhythm]);
    MEIAddPosition(this, el);
    // make sure that the location of a rest is never a space but the line below (because of false rendering)
    if (parseInt(el.getAttributeNS("","loc"))%2>0)
    {
      let loc = parseInt(el.getAttributeNS("","loc"));
      loc = loc-1;
      el.setAttributeNS("","loc",loc);
    }
    parent.appendChild(el);
    if(this.dot) this.dot.toTEI(doc, parent);
    this.MEIObj = el;
    return el;
  };
  this.width = function(){
    var width = 0;
    if(this.rhythm){
      width += restDictionary[this.rhythm][2]*rastralSize * prop;
    }
    return width;
  };
  this.negativeSpace = function(){
    return rastralSize/5;
  };
  this.draw = function(){
    var extraClasses = "";
    var spos = staffPosition(this);
    this.startX = curx;
    this.startY = cury;
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
													 "mensural rest " + this.rhythm+(this.pitch ? this.pitch : this.staffPos), this.UUID);
        SVG = oldSVG;
        curx+= myglyph.advanceWidth(rastralSize);
      } else {
        var charData = restDictionary[this.rhythm];
        svgText(this.domObj, curx, texty(charData[1], spos), 
                "mensural rest "+this.rhythm, this.UUID, restStyle(), 
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

/** @class 
 * @memberof classes */
function LongRest() {
  this.objType = "LongRest";
  this.start = false;
  this.end = false;
  this.startX = false;
  this.startY = false;
  this.domObj = false;
	this.MEIObj = false;
	this.UUID = "ID"+uuid();
  // Copy current classes
  this.classList = currentExample.classes ? currentExample.classes.classes.slice(0) : [];
  this.commentPos = function(){
    return [this.startX+(rastralSize/3), yPos(cury, this.end)];
  };
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
  this.negativeSpace = function(obj){
    if(obj.objType.indexOf('Rest')>-1){
      return rastralSize/2;
    } else {
      return rastralSize/8;
    }
  };
  this.toMEI = function(doc, parent){
    if(!parent) parent = doc.currentParent;
    var el = doc.createElementNS("http://www.music-encoding.org/ns/mei", "rest");
    //el.setAttribute("dur", "longa");
		//el.setAttribute("quality", this.end-this.start==2 ? "i" : "p");
    if(this.end-this.start==2)
    {
      el.setAttribute("dur", "2B");
    }
    else
    {
      el.setAttribute("dur", "3B");
    }
		addUUIDs(this, el, curDoc);
    if(this.dot) this.dot.toTEI(doc, el);
    // FIXME: How does position work?
//    MEIAddPosition(this, el);
    parent.appendChild(el);
    this.MEIObj = el;
    return el;
  };
  this.draw = function(){
    var extraClasses = "";
    this.startX = curx;
		this.startY = cury;
    curx+=(rastralSize+1.5) / 2.5;
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
    this.domObj = svgGroup(SVG, "longRest", this.UUID);
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

/** @class 
 * @memberof classes */
function MaxRest() {
  this.objType = "MaxRest";
  this.start = false;
  this.end = false;
  this.multiple = 2;
  this.startX = false;
	this.startY = false;
  this.domObj = false;
	this.UUID = "ID"+uuid();
  // Copy current classes
  this.classList = currentExample.classes ? currentExample.classes.classes.slice(0) : [];
  this.commentPos = function(){
    return [this.startX +rastralSize/6, yPos(cury, this.end+1)];
  };
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
  this.negativeSpace = function(){
    return rastralSize/5;
  };
  this.toMEI = function(doc, parent){
    if(!parent) parent = doc.currentParent;
    var rests = [];
    for(let i = 1; i<=this.multiple;i++)
    {
      var el = doc.createElementNS("http://www.music-encoding.org/ns/mei", "rest");
      if(this.end-this.start==2)
      {
        el.setAttribute("dur", "2B");
      }
      else
      {
        el.setAttribute("dur", "3B");
      }
      if(i===1)
      {
        addUUIDs(this, el, curDoc);
      }
      else
      {
        el.setAttribute("xml:id", "ID"+uuid());
      }
      MEIAddPosition(this, el);
      parent.appendChild(el);
      if(this.dot) this.dot.toMEI(doc, parent);
      this.MEIObj = el;
    }
    
    return el;
  };
  this.draw = function(){
    this.domObj = svgGroup(SVG, "maxRestGroup", this.UUID);
    var extraClasses = "";
    this.startX = curx;
    this.startY = cury;
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
    var className = "mensural rest M"+extraClasses;
    switch(end - start){
      default:
        // FIXME: Make group?
        for(var i=0; i<this.multiple; i++) {
          var oldSVG = SVG;
          SVG = this.domObj;
          drawSmallBarline(start, end, 2, className);
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

/** @class 
 * @memberof classes */
function Notation(){
  this.objType = "Notation";
  this.type = false;
  this.startX = false;
  this.subtype = false;
  this.toText = function(){
    return "{"+this.type+": "+this.subtype+"}";
  };
  this.width = zeroWidth;
  this.draw = function(){
    this.startX = curx;
    currentType = this.type;
    currentSubType = this.subtype;
  };
  // Notation
}

/** @class 
 * @memberof classes */
function MensuralSignature(){
  this.objType = "MensuralSignature";
  this.startX = false;
  this.signature = false;
  this.staffPos = false;
  this.domObj = false;
  this.sup = false;
  this.example = currentExample;
  this.editorial = false;
	this.invisible = false;
	this.MEIObj = false;
  this.classList = currentExample.classes ? currentExample.classes.classes.slice(0) : [];
  this.toText = function(){
    var text = "{mens: ";
    if(this.signature) text += this.signature;
    if(this.staffPos) text += ", "+this.staffPos.toString(16).toUpperCase();
    return text + "}";
  };
  this.width = function(){
		if(this.invisible) return 0;
		if(this.signature.length > 1) return noteEn * this.signature.length;
    if(this.signature && mensDictionary[this.signature]){
      return mensDictionary[this.signature][2] * rastralSize * prop - 2/3*rastralSize
        + (this.editorial ? 2*rastralSize : 0);
    } else return 0;
  };
	this.toMEI = function(doc, parent){
		// N.B. This ignores proportion ratios (FIXME)
		if(!parent) parent = doc.currentParent;
		var el = doc.createElementNS("http://www.music-encoding.org/ns/mei", "mensur");
		if(this.invisible){
			var newEl = doc.createElementNS("http://www.music-encoding.org/ns/mei", "supplied");
			newEl.appendChild(el);
			el = newEl;
			this.MEIObj = newEl;
			addUUIDs(this, newEl, curDoc);
			parent.appendChild(newEl);
		} else {
			this.MEIObj = el;
			addUUIDs(this, el, curDoc);
			parent.appendChild(el);
		}
		if("cCçÇqQœŒ".indexOf(this.signature[0])>=0){
			el.setAttributeNS(null, "sign", "C");
			el.setAttributeNS(null, "tempus", "2");
			if("çÇŒ".indexOf(this.signature[0])>-1) {
				el.setAttributeNS(null, "dot", "true");
				el.setAttributeNS(null, "prolatio", "3");
			} else {
				el.setAttributeNS(null, "prolatio", "2");
			}
			if("qQœŒ".indexOf(this.signature[0])>=0){
				el.setAttributeNS(null, "orient", "reversed");
			}
		} else if("oOøØ".indexOf(this.signature[0])>=0){
			el.setAttributeNS(null, "sign", "O");
			el.setAttributeNS(null, "tempus", "3");
			if("øØ".indexOf(this.signature[0])>=0) {
				el.setAttributeNS(null, "dot", "true");
				el.setAttributeNS(null, "prolatio", "3");
			} else {
				el.setAttributeNS(null, "prolatio", "2");
			}
		}
		if("cçqœoø".indexOf(this.signature[0])>=0){
			el.setAttributeNS(null, "slash", "1");
		}
		return newEl ? newEl : el;
	}
  this.draw = function(){
    var extraClasses = this.editorial ? " editorial" : "";
		if(this.invisible){
			// Don't draw this. Wonder what I need to do for it not to
			// break...
			if(this.classList.length){
				extraClasses = classString(this.classList);
				drawClasses(this.classList, this);
			}
			return false;
		}
    if(this.sup && eventi>0 && !this.sup.objType){
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
      } else if(mensDictionary[this.signature]){
        charData = mensDictionary[this.signature];
        svgText(SVG, curx, texty(charData[1]*prop, this.staffPos),
                "mensural menssign "+this.signature+extraClasses, false, mensStyle(), charData[0]);
        if(charData[3]){
          svgText(this.domObj, curx, texty(charData[1]*prop, this.staffPos),
                  "mensural menssign slash"+extraClasses, false, musicStyle(), charData[3]);
        };
        curx += charData[2] * rastralSize * prop;
      } else {
				for(var i=0; i<this.signature.length; i++){
					if(arsNovaVoid[this.signature[i]+"Mens"]){
						arsNovaVoid[this.signature[i]+"Mens"].draw(curx, cury-yoffset(this.staffPos), rastralSize, 
																											 "mensural menssign "+this.signature+this.staffPos+extraClasses);
						if(i==this.signature.length-1){
							curx += arsNovaVoid[this.signature[i]+"Mens"].advanceWidth(rastralSize);
						} else {
							curx += rastralSize;
						}
					}
				}
			}
      if(this.editorial) {
        var sb = squareBracket(curx, texty(braceOff, this.staffPos), false, extraClasses);
        curx+=sb.getBoundingClientRect().width;
      }
      if(editable){
        $(SVG).hover(shiftHoverToShift(this, 2), hoverOutShiftChecked());
      }
      if(this.sup && this.sup.objType){
        this.sup.draw();
      }
      SVG = oldSVG;
      return this.domObj;
    }
    return false;
  };
  // Mensural Signature
}

/** @class 
 * @memberof classes */
function ProportionSign(){
  this.objType = "ProportionSign";
  this.startX = false;
  this.sign = false;
  this.staffPos = false;
	this.prevProportion = currentProp;
	this.proportionChangesTo = false;
  this.text = false;
  this.domObj = false;
  this.example = currentExample;
  this.classList = currentExample.classes ? currentExample.classes.classes.slice(0) : [];
	this.UUID = "ID"+uuid()
	this.MEIObj = false;
	this.changesProportion = function(){
		this.proportionChangesTo = currentProp * Number(this.sign);
		return this.proportionChangesTo;
	}
  this.toText = function(){
    return "{prop: "+this.sign+", "+this.staffPos.toString(16).toUpperCase()+"}"; };
  this.width = function(){
    if(this.sign && mensDictionary[this.signature]){
      return mensDictionary[this.sign][2] * rastralSize * prop - 2/3*rastralSize;
    } else return rastralSize;
  };
	this.toMEI = function(doc, parent){
		if(!parent) parent = doc.currentParent;
		var el = doc.createElementNS("http://www.music-encoding.org/ns/mei", "proport");
		parent.appendChild(el);
		el.setAttributeNS(null, 'num', this.sign);
		console.log("--", this.proportionChangesTo);
		// multiplier is not schema conform
    //el.setAttributeNS(null, 'multiplier', this.proportionChangesTo);
		addUUIDs(this, el, curDoc);
		this.MEIObj = el;
	}
  this.draw = function(){
    if(this.text && underlays.length){
      // Check for text issues
      curx = Math.max(curx, underlayRight(this.text.position));
    }
    var extraClasses="";
    this.startX = curx;
    if(this.text){
      this.text.draw();
    }
    if(this.classList.length){
      extraClasses = classString(this.classList);
      drawClasses(this.classList, this);
    }
    if(this.sign && this.staffPos && this.sign.length) {
      var charData;
      var oldSVG = SVG;
      var obj;
      this.domObj = svgGroup(SVG, "Proportiongroup", this.UUID);
      SVG = this.domObj;
      if(this.sign.length===2){
        // We want this approximately centred with single digit
        // versions. 3-digit signs won't happen
        curx -= rastralSize/2;
      }
      for(var i=0; i<this.sign.length; i++){
        if((obj = arsNovaVoid[this.sign.charAt(i)+"Mens"])){
          obj.draw(curx, cury-yoffset(this.staffPos), rastralSize, 
            "proportion mensural propsign "+this.sign.charAt(i)+ extraClasses);
          curx += obj.advanceWidth(rastralSize);
        } else {console.log("Missing proportion: ", this.sign.charAt(i));}
      }
      if(this.text){
        this.text.draw();
      }
      SVG = oldSVG;
      return this.domObj;
    } else return false;
  };
}

/** @class 
 * @memberof classes */
function StackedProportionSigns(){
  this.objType = "StackedProportionSigns";
	this.prevProportion = currentProp;
	this.proportionChangesTo = false;
  this.startX = false;
  this.signs = [];
  this.domObj = false;
  this.example = currentExample;
  this.text = false;
	this.UUID = "ID"+uuid()
	this.MEIObj = false;
  this.classList = currentExample.classes ? currentExample.classes.classes.slice(0) : [];
	this.changesProportion = function(){
		this.numerator = this.signs[0].objType==='ProportionSign' ?
			Number(this.signs[0].sign) : 1;
		this.denominator = this.signs[1].objType==='ProportionSign' ?
			Number(this.signs[1].sign) : 1;
		this.proportionChangesTo = this.prevProportion*(this.numerator / this.denominator);
		return this.proportionChangesTo;
	};
  this.toText = function(){
    var text = "{prop: ";
    var textTail = ",";
    for(var i=0; i<this.signs.length; i++){
      if(i){
        text +="/";
        textTail+="-";
      }
      text += this.signs[i].sign;
      textTail += this.signs[i].staffPos.toString(16).toUpperCase();
    }
    return text+textTail+"}";
  };
  this.width = function(){
    var max = 0;
    for(var i=0; i<this.signs.length; i++){
      max = Math.max(this.signs[i].width(), max);
    }
    return max;
  };
	this.toMEI = function(doc, parent){
		if(!parent) parent = doc.currentParent;
		var el = doc.createElementNS("http://www.music-encoding.org/ns/mei", "proport");
		parent.appendChild(el);
		if(this.signs[0] && this.signs[0].objType==='ProportionSign') el.setAttributeNS(null, 'num', this.signs[0].sign);
		if(this.signs[1] && this.signs[1].objType==='ProportionSign') el.setAttributeNS(null, 'numbase', this.signs[1].sign);
		// multiplier is not schema conform
    //el.setAttributeNS(null, 'multiplier', this.proportionChangesTo);		
		addUUIDs(this, el, curDoc);
		this.MEIObj = el;
	}
  this.draw = function(){
    if(this.text && underlays.length){
      // Check for text issues
      curx = Math.max(curx, underlayRight(this.text.position));
    }
    var oldSVG = SVG;
    this.startX = curx;
    var nextX = curx;
    this.domObj = svgGroup(SVG, "ProportionStackGroup", this.UUID);
    SVG = this.domObj;
    for(var i=0; i<this.signs.length; i++){
      this.signs[i].draw();
      if(curx>nextX) nextX = curx;
      curx = this.startX;
    }
    SVG = oldSVG;
    if(this.text){
      this.text.draw();
    }
    curx = nextX;
    return this.domObj;
  };
}

/** @class 
 * @memberof classes */
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
  this.varEndStaffPos = function(variant){
    return (this.previous 
            ? this.previous.varEndStaffPos(variant)
            : this.prevEventObj.varEndStaffPos(variant));
  };
  this.width = function(){
    return this.members.reduce(function(p,e,i,a){return Math.max(p, e.width());}, 0);
  };
	this.toMEI = function(doc, parent){
    if(!parent) parent = doc.currentParent;
    var el = doc.createElementNS("http://www.music-encoding.org/ns/mei", "keySig");
		addUUIDs(this, el, curDoc);
		parent.appendChild(el);
		for(var i=0; i<this.members.length; i++){
			this.members[i].toMEI(doc, el);
		}
		return el;
	};
  this.draw = function(){
//    breakIfNecessary();
    this.startX = curx;
    currentSolm = this;
    if(!this.members.length) return false;
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

/** @class 
 * @memberof classes */
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
	this.toMEI = function(doc, parent) {
		if(!parent) parent = doc.currentParent;
    var el = doc.createElementNS("http://www.music-encoding.org/ns/mei", "keyAccid");
		addUUIDs(this, el, curDoc);
		parent.appendChild(el);
		MEIAddPosition(this, el);
		return el;
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
      if((this.domObj = arsNovaVoid[this.symbol+"Solm"])){
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

/** @class 
 * @memberof classes */
function Clef() {
  this.objType = "Clef";
  this.startX = false;
  this.type = false;
  this.staffPos = false;
  this.example = currentExample;
	this.literal = false;
	this.invisible = false;
  this.domObj = false;
  this.params = false;
  this.solm = false;
  this.editorial = false;
  this.appliesTo = false;
  this.erroneousClef = false;
  this.stackedClef = false;// Redundant
  this.stackedClefs = [];
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
	this.toMEI = function(doc, parent){
		if(!parent) parent = doc.currentParent;
    var el = doc.createElementNS("http://www.music-encoding.org/ns/mei", "clef");
		if(this.invisible){
			var newEl = doc.createElementNS("http://www.music-encoding.org/ns/mei", "supplied");
			newEl.appendChild(el);
			el = newEl;
			this.MEIObj = newEl;
			addUUIDs(this, newEl, curDoc);
			parent.appendChild(newEl);
		} else {
			this.MEIObj = el;
			addUUIDs(this, el, curDoc);
			parent.appendChild(el);
		}
		el.setAttribute('shape', this.type);
		el.setAttribute('line', (this.staffPos-2)/2);
		return newEl ? newEl : el;
	}
  this.pitchOffset = function(){
    return this.staffPos - clefOffsets[this.type];
  };
  this.width = function(){
    if(!this.invisible && this.type && clefDictionary[this.type]){
      return clefDictionary[this.type][2] * rastralSize - rastralSize / 2 * prop
        + (this.editorial ? 2*rastralSize : 0);
    } else return 0;
  };
  this.varEndStaffPos = function(variant){
    return this.prevEventObj.varEndStaffPos(variant);
  };
  // Clef
  this.draw = function(prepsolm){
    var oldSVG = SVG;
    var oldX = this.startX;
    var solm = false;
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
//      curx -= rastralSize / 2 * prop;
      curx += rastralSize / 1.2 * prop;
      var sb = squareBracket(curx, texty(braceOff, this.staffPos), true, extraClasses);
      curx+=sb.getBoundingClientRect().width;
    }
    if(this.type && this.staffPos){
      curx -= rastralSize / 2 * prop;
      if(currentType==="mensural"){
        var myChar;
        if(currentSubType==="void"){
          myChar = arsNovaVoid[this.type+"Clef"];
        } else if (currentSubType==="full"){
          myChar = arsNovaVoid[this.type+"Full"+"Clef"];
          if(!myChar) myChar = arsNovaVoid[this.type+"Clef"];
        }
        myChar.draw(curx, cury-yoffset(this.staffPos), rastralSize, 
                    "mensural clef " +this.type+this.staffPos+(this.editorial ? " editorial" : "")
										+(this.invisible ? " invisible" : "")
                    +extraClasses);
        curx+=myChar.advanceWidth(rastralSize);
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
    // if(this.editorial) {
    //   var sb = squareBracket(curx, texty(braceOff, this.staffPos), false, extraClasses);
    //   curx += sb.getBoundingClientRect().width;
    // } else {
    //   curx+=rastralSize/2;
    // }
    curx+=rastralSize/2*prop;
    if(editable){
      $(this.domObj).hover(shiftHoverToShift(this, 2), hoverOutShiftChecked());
    }
    if(!this.params && currentSolm && currentSolm.members.length 
       && !this.solm && currentReading && !followedBySolm(this)) {
      solm = currentSolm.draw();
    } else if(prepsolm && ((prepsolm.objType==="SolmizationSignature"&& prepsolm.members.length)
                           || (prepsolm.objType==="MusicalReading"))){
      // Happens in reading. Has to precede erroneous clef (if
      // present), so has to be here.
      solm = prepsolm.draw(); 
    }
    if(solm) {
      var sclass = solm.getAttributeNS(null, "class");
      solm.setAttributeNS(null, "class", sclass+" indicative sm1");
      $(solm).addClass("editorial");
      curx -= (2 * rastralSize * prop) /3;
    } 
    if(this.editorial) {
//      curx -= rastralSize * prop;
      var sb = squareBracket(curx, texty(braceOff, this.staffPos), false, extraClasses);
      curx += sb.getBoundingClientRect().width;
    } else {
      // curx+=rastralSize/2;
    }
    if(this.erroneousClef){
      curx -= rastralSize*prop;
      this.erroneousClef.draw();
      currentClef = this;
    }
    if(this.stackedClefs.length){
      // Clef above clef. For now, left aligned, with spacing based on
      // the widest
      var finalx = curx;
      for(var i=0; i<this.stackedClefs.length; i++){
        curx = this.startX;
        this.stackedClefs[i].draw();
        curx = Math.max(finalx, curx);
        // Lowest clef counts
      }
      currentClef = this;
    }
    SVG = oldSVG;
    if(oldX) this.startX = oldX;
    return this.domObj;
  };
  // Clef
}

/** @class 
 * @memberof classes */
function Staff() {
  this.objType = "Staff";
  this.lines = false;
  this.colour = false;
  this.extras = [];
  this.params = false;
  this.appliesTo = false;
	this.part = false;
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
        if(wit && wit!=="MSS"){
          var wr = witnessReading(wit, this.lines).value;
          if(wr) return wr;
          for(var i=0; i<this.lines.content.length; i++){
            if(this.lines.content[i].witnesses.indexOf("MSS")>-1){
              return this.lines.content[i].value;
            }
          }
          console.log("Witness missing");
          return 4;
        } else {
          return this.trueLines();
        }
    }
  };
  this.varColour = function(wit){
    if(typeof(this.colour)==="string" || !wit){
      return this.colour;
    } else if (!this.colour){
      // The staff doesn't change colour
      var pos = currentExample.staves.indexOf(this);
      for(var i=pos-1; i>=0; i--){
        if(currentExample.staves[i].objType==="Staff"
           && witnessAppliesTo(currentExample.staves[i], wit)
           && currentExample.staves[i].colour){
          return currentExample.staves[i].colour;
        }
      }
      if(currentExample.parameters.staff && currentExample.parameters.staff.colour){
        if(typeof(currentExample.parameters.staff.colour)==="string"){
          return currentExample.parameters.staff.colour;
        } else {
          return witnessReading(wit, currentExample.parameters.staff.colour);
        }
      }
      return defaultColour;
    } else {
      return witnessReading(wit, this.colour).value;
    }
    // return ((typeof(this.colour)==="string" || !wit) 
    //         ? this.colour
    //         : witnessReading(wit, this.colour).value);
  };
  this.width = zeroWidth;
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
  this.hasChoice = function(){
    var c = findClef(this.extras);
    var s = findSolm(this.extras);
    return !((!c || c.objType == "Clef") && (!s || s.objType == "SolmizationSignature")
      && typeof(this.lines) == "number" && (!this.colour || 
                                            typeof(this.colour) =="string"));
  };
  // this.variantList = function (){
  //   // FIXME:
  //   return false;
  // };
  // this.noMatch = false // FIXME!!
  // this.getDefaultClef = function(){};// !!!
  // this.getDefaultSolmization();// !!!
  // this.tip = function(tipSVG){
  //   var oldSVG = SVG;
  //   SVG = tipSVG;
  //   svgCSS(SVG, "jt-editor-v.css");
  //   this.note = SVG;
  //   var vars = this.variantList();
  //   var d = 40; // ?
  //   curx = 0;
  //   cury = rastralSize*9;
  //   var bottom =0;
  //   if(this.noMatch){
  //     this.addTip(this.trueLines(), this.trueColour(), ["(ed.)"], 
  //                 this.getDefaultClef(), this.getDefaultSolmization());
  //     if(i>0) svgLine(SVG, curx, cury, curx, 10, "divider", false);
  //     curx+=d;
      
  //   }
  // };
  this.trueColour = function(){
    return typeof(this.colour) == "string" ? this.colour :
      (!this.colour ? (currentStaffColour ? currentStaffColour : defaultColour) : this.colour.content[0].value);
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
      sysBreak(this.part, leaveSpace);
    }
    if(this.classList.length){
//      extraClasses = classString(this.classList);
      drawClasses(this.classList, this);
    }
    var oldSVG = SVG;
    SVG = svgGroup(SVG, "prefGroup", false);
    var clef = findClef(this.extras);
    var solm = findSolm(this.extras);
    if(clef) {
      clef.draw();
    } 
    if(solm) solm.draw();
    if(showvariants && this.hasChoice()){
      // odd, but the easiest way to get params-like tip is to build a params object
      if(!this.params){
        this.params = new Parameters();
        this.params.staff = this;
        this.params.SVG = SVG;
        this.params.clef = clef;
        this.params.solmization = solm;
        this.params.extras = this.extras;
      }
      addAnnotation(SVG, this.params, "staff");
      SVG.style.fill = "#060";
    //   addAnnotation(SVG, this, "staff");
    }
    SVG = oldSVG;
		if(this.part) this.part.draw();
  };
  // Staff
}

/** @class 
 * @memberof classes
 * @classdesc This was probably for voice parts, but I've now extended it for
 * sections, qualified by a 'type'. So far, that might be part,
 * pars, section.
*/
function Part(){
	// This was probably for voice parts, but I've now extended it for
	// sections, qualified by a 'type'. So far, that might be part,
	// pars, section.
  this.objType = "Part";
	this.staff = false;
  this.id = false;
	this.closes = false;
	this.type = "part";
	this.position = 0;
	this.orientation = false;
	this.style = "";
	this.wordNo = false;
	this.endEl = false;
	this.startEl = false;
	this.contains = [];
	this.parent = false;
	this.domObj = false;
  this.classList = currentExample.classes ? currentExample.classes.classes.slice(0) : [];
  //currentExample.parts.push(this);
  this.toText = function(){
		if(this.closes){
			return "</"+this.level+">";
		} else if(this.id){
			return "<"+this.level+": "+this.id+">";
		} else {
			return "<"+this.level+">";
		}
  };
	this.defaultName = function(){
		if(!this.id){
			return false;
		} else if (typeof(this.id)=="string"){
			return this.id;
		} else {
			let label="";
			for(eli=0; eli<this.id.length; eli++){
				let el = this.id[eli];
				if(typeof(el)=="string"){
					if(eli==0){
						if(this.id.length>1){
							label += el.trimStart();
						} else {
							label += el.trim()
						}
					} else {
						if(eli == this.id.length-1){
							label += el.trimEnd();
						} else {
							label += el;
						}
					}
				} else if(el.objType==="Comment"){
					// do nothing
				} else {
					// This is a text-critical thing. If there is a default
					// reading, grab the first bit of its contents (so far there
					// are no cases where there are more bits than one)
					if(!el.nonDefault()){
						label += el.content[0].content[0];
					}
				}
			}
			return label;
		}
	};
  this.width = zeroWidth;
  this.applicableStaff = function(){
    var staff = false;
    var nextObj = this;
    while((nextObj=nextObj.next)){
      if(nextObj.objType==="Staff"){
        return nextObj;
      // } else if (! infop(next)){
      } else if (! infop(nextObj)){
        break;
      }
    }
    // If we're here, there's no fresh staff for this. What's the current staff
    nextObj = this;
    while((nextObj=nextObj.previous)){
      if(nextObj.objType==="Staff"){
        return nextObj;
      }
    }
//		console.log(currentExample, currentExample ? currentExample.parameters : false);
    return currentExample.parameters.staff;
  };
  this.draw = function(){
		var newText, textBlock;
		var styles = [];
    if(this.classList.length){
      drawClasses(this.classList, this);
    }
		if(this.type=="part" && this.id && ((typeof(this.id)==="string" && !/^\s*\d+\s*/.test(this.id)) || typeof(this.id)!="string")){
			// This is a part with a part name. Show it.
			// If this is a tooltip, display it lower to avoid clash with
			// witnesses list
			if(this.orientation){
				var vpos = this.position * rastralSize / 2 + 1;
				var clock = this.orientation==="90c";
//				console.log(this.orientation, clock);
				// textBlock = svgText(SVG, clock ? lmargin-10 : lmargin, cury+rastralSize-vpos,
				// 										"part textblock r"+this.orientation, false, false, false);
				textBlock = svgText(SVG, lmargin-10, cury+rastralSize-vpos,
														"part textblock r"+this.orientation, false, false, false);
				this.domObj = textBlock;
				if(typeof(this.id)==="string"){
					newText = svgSpan(textBlock, "text"+ this.style,false, this.id);
				} else {
					for(var i=0; i<this.id.length; i++){
						if(typeof(this.id[i])==="string"){
							newText = svgSpan(textBlock, "text", this.style, this.id);
						} else {
							if(this.id[i].objType == "MusicalChoice") {
								this.id[i].textBlock = textBlock;
								this.id[i].styles = styles;
							}
							this.id[i].draw(styles);
							if(this.id[i].dy) dy = this.components[i].dy()*-1;
							styles = this.id[i].updateStyles(styles);
						}
					}
				}
				/*
				if(clock){
					var box = textBlock.getBBox();
					console.log("yo", box);
					textBlock.setAttributeNS(null, "transform", "rotate(90, "+(lmargin-10)+", "+(cury+rastralSize-vpos)+") translate(0, -"+box.height+")");
					// 									 +(vpos * rastralSize / 2)+") rotate(90, "
					// 									 +curx+", "+(cury+rastralSize)+") ");
				} else if(this.orientation==="90a"){
					textBlock.setAttributeNS(null, "transform", "rotate(-90, "+lmargin+", "+(cury+rastralSize-vpos)+")");
//														 +curx+", "+ypos+rastralSize-vpos+") translate("
//														 +(vpos * rastralSize / 2)+", "+rastralSize+")");
        } else {
					console.log("Unsupported rotation: ". this.orientation);
				}*/
				return textBlock;
			} else {
				ypos = !$(SVG).parents("#content").length ? cury-(6*rastralSize) : cury-(8*rastralSize) ;
				textBlock = svgText(SVG, curx, ypos, "part textblock",
														false, false, false);
				this.domObj = textBlock;
				if(typeof(this.id)==="string"){
					newText = svgSpan(textBlock, "text", this.style, this.id);
				} else {
					var styles = new Array();
					for(var i=0; i<this.id.length; i++){
						if(typeof(this.id[i])==="string"){
							newText = svgSpan(textBlock, "text", this.style, this.id[i]);
						} else {
							if(this.id[i].objType == "MusicalChoice") {
								this.id[i].textBlock = textBlock;
								this.id[i].styles = styles;
							}
							this.id[i].draw(styles);
							if(this.id[i].dy) dy = this.components[i].dy()*-1;
							styles = this.id[i].updateStyles(styles);
						}
					}
				}
				return textBlock;
			}
		}
    return false;
  };
}

////////////////////////////////////////
// 3. Misc Breaks

/** @class 
 * @memberof classes */
function Barline(){
  this.objType = "Barline";
  this.start = false;
  this.end = false;
  this.multiple = 1;
  this.startX = false;
	this.domObj = false;
	this.UUID = "ID"+uuid()
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
		this.domObj = svgGroup(SVG, "barline", this.UUID);
		var oldSVG = SVG;
		SVG = this.domObj;
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
		SVG = oldSVG;
  };
  this.drawFlash = function(){
    // FIXME!!
    var start = (this.start || this.start===0) ? cury-yoffset(this.start) : cury-yoffset(4);
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

/** @class 
 * @memberof classes */
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
    var className = "mensural repeat"+extraClasses;
    for(var i=0; i<this.ldots.length; i++){
      svgCircle(SVG, curx, cury-yoffset(this.ldots[i]), radius, 
                "repeatdot mensural"+extraClasses);
    }
    curx += step;
    for(var i=0; i<this.multiple; i++) {
      drawSmallBarline(start, end, 2, className);
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
Annotation.prototype.width = zeroWidth;
Annotation.prototype.updateStyles = keepStyles;
Annotation.prototype.ligature = false;
Annotation.prototype.draw = function(){
  var star;
  if(SVG.nodeName.toUpperCase()==="TEXT"){
    star = svgSpan(SVG, "annotation musical underlay", false, "*");
  } else {
    var drawnx = curx;
    this.startY = cury;
    if(eventi==-1){
      drawnx = 0;
      this.startY -= rastralSize * currentLinecount / 2 - 11;
    } else if(this===currentExample.events[eventi]) {
      // We're not in a compound form (e.g. a ligature), and so this
      // comment applies to the *previous* element
      if(eventi==0){
        drawnx = lmargin + rastralSize;
      } else if(currentExample.events[eventi-1].objType==="Part"
								&&
								((typeof(currentExample.events[eventi-1].id)==="string"
									&& !/^\s*\d+\s*/.test(this.id))
								 || (currentExample.events[eventi-1].id && typeof(currentExample.events[eventi-1].id)!="string"))){
				console.log(currentExample.events[eventi-1]);
				var prevBox = currentExample.events[eventi-1].domObj.getBBox();
				this.startX = prevBox.x +prevBox.width;
				this.startY = prevBox.y +prevBox.height;
				drawnx = this.startX;
			} else {
        drawnx = currentExample.events[eventi-1].startX;// - (rastralSize*prop);//why?
        this.startX = drawnx;
        if(typeof(currentExample.events[eventi-1].domObj)!="undefined" &&
           currentExample.events[eventi-1].domObj && false){
          // removed because it's slow
          // FIXME: round to a space
          var rect = currentExample.events[eventi-1].domObj.getBoundingClientRect();
          this.startY = Math.max(25, rect.top + rastralSize);
          //  this.startX = rect.left +3;
          this.startX = rect.left +(rect.width/3);
        } else if (currentExample.events[eventi-1].commentPos) {
          var coords = currentExample.events[eventi-1].commentPos();
          this.startX = coords[0];
          this.startY = coords[1];
          //            this.startY -= yoffset()-(rastralSize/2);
        } else if(staffPosition(currentExample.events[eventi-1])){
          this.startY -= yoffset(staffPosition(currentExample.events[eventi-1])+2)-11;
        } else {
          this.startY -=  rastralSize * currentLinecount;
//          this.startY -=  rastralSize * currentLinecount -11;
        }
      }
    } else if (this.ligature) {
      drawnx = curx - rastralSize/2;
      this.startX = drawnx;
      var drawny = yPos(cury, dotPos+2);
      this.startY = drawny;
    } else {
      // Compound form, so x position is taken care of. FIXME: For now, fudge height
      // FIXME: does this happen, or is LigatureComment always used?
    if(currentExample.events[eventi].objType=="TextUnderlay"){
      this.startY += rastralSize *2.5;
      } else {
        this.startY -= rastralSize * currentLinecount;
      }
    }
//      this.startX = drawnx;
    drawnx = this.startX;
    this.endY = this.startY - Math.floor(rastralSize * textScale * 2);
    star = svgText(SVG, drawnx, this.startY, "annotation musical", false, false, "*");
  }
  if(!star) alert("oo");
  var j = currentExample.comments.indexOf(this);
  if(j===-1){
    console.log(["Comment error", currentExample]);
  } else {
    addAnnotation(star, this, "Annotation");
//      star.setAttributeNS(null, "onmouseover", "top.tooltipForComment("+examplei+","+j+", "+(this.startX+10)+","+(10+this.startY)+");");
//      star.setAttributeNS(null, "onmouseout", "top.removeTooltip()");
  }
};
Annotation.prototype.drawVar = Annotation.prototype.draw;

/** @class 
 * @memberof classes */
function Comment(){
  this.objType = "Comment";
  this.content = false;
  this.width = zeroWidth;
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
  this.footnote = function(){
    return DOMSpan(false, false, this.content);
  };
  this.draw = function(){
    var star;
//		console.log(this, eventi, currentExample.events);
    if(SVG.nodeName.toUpperCase()==="TEXT"){
      star = svgSpan(SVG, "annotation musical underlay", false, "*");
    } else {
      var drawnx = curx;
      this.startY = cury;
      if(eventi==-1){
        drawnx = 0;
        this.startY -= rastralSize * currentLinecount / 2 - 11;
      } else if(this===currentExample.events[eventi]) {
        // We're not in a compound form (e.g. a ligature), and so this
        // comment applies to the *previous* element
        if(eventi==0){
          drawnx = lmargin + rastralSize;
        } else if(currentExample.events[eventi-1].objType==="Part"
									&&
									((typeof(currentExample.events[eventi-1].id)==="string"
									  && !/^\s*\d+\s*/.test(this.id))
									 || (this.id && typeof(this.id)!="string"))){
					prevObj = currentExample.events[eventi-1].domObj.getBBox();
					this.startX = prevObj.x +prevObj.width+rastralSize;
					this.startY = prevObj.y;
					drawnx = this.startX;
				} else {
          drawnx = currentExample.events[eventi-1].startX;// - (rastralSize*prop);//why?
          if(typeof(currentExample.events[eventi-1].domObj)!="undefined" &&
             currentExample.events[eventi-1].domObj && false){
            // removed because it's slow
            // FIXME: round to a space
            var rect = currentExample.events[eventi-1].domObj.getBoundingClientRect();
            this.startY = Math.max(25, rect.top + rastralSize);
//            this.startX = rect.left +3;
            this.startX = rect.left +(rect.width/3);
          } else if (currentExample.events[eventi-1].commentPos) {
            var coords = currentExample.events[eventi-1].commentPos();
            this.startX = coords[0];
            this.startY = coords[1];
//            this.startY -= yoffset()-(rastralSize/2);
          } else if(staffPosition(currentExample.events[eventi-1])){
            this.startY -= yoffset(staffPosition(currentExample.events[eventi-1])+2)-11;
          } else {
            this.startY -=  rastralSize * currentLinecount -11;
          }
        }
      } else {
        // Compound form, so x position is taken care of. FIXME: For now, fudge height
        // FIXME: does this happen, or is LigatureComment always used?
        if(currentExample.events[eventi].objType=="TextUnderlay"){
          this.startY += rastralSize *2.5;
        } else {
          this.startY -= rastralSize * currentLinecount;
        }
      }
//      this.startX = drawnx;
      drawnx = this.startX;
      this.endY = this.startY - Math.floor(rastralSize * textScale * 2);
      star = svgText(SVG, drawnx, this.startY, "annotation musical", false, false, "*");
    }
    if(!star) alert("oo");
    var j = currentExample.comments.indexOf(this);
    if(j===-1){
      console.log(["Comment error", currentExample]);
    } else {
      addAnnotation(star, this, "Annotation");
//      star.setAttributeNS(null, "onmouseover", "top.tooltipForComment("+examplei+","+j+", "+(this.startX+10)+","+(10+this.startY)+");");
//      star.setAttributeNS(null, "onmouseout", "top.removeTooltip()");
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

/** @class  
 * @memberof classes*/
function ColumnStart(){
  this.objType = "ColumnStart";
  this.id = false;
  this.location = false;
  this.line= false;
  this.tag = false;
  this.startX = false;
  this.startY = false;
  this.startPos = false;
  this.endPos = false;
  this.doc = false;
  this.top = false;
  this.height = false;
  this.nextStart = false;
  this.catchWord = curCatchword;
  curCatchword = false;
  this.xProp = breakerxProp;
  this.toText = function() {
    return "[-"+this.id+"-]";
  };
  this.imageFilename = imageFilenameForBreaker;
  this.thumbFilename = thumbFilenameForBreaker;
  this.width = zerofunction;
  this.margins = breakerMargins;
  this.twoCols = breakerTwoCols;
  this.side = function(){
    return /^[A-Z]*[0-9]*[rv]?/.exec(this.location)[0];
  };
  this.draw = function() {
    this.doc = curDoc;
    this.location = this.id;
    curDoc.breaks.push(this);
    // this setting just so the slot is filled. Not sure what it means in this context
    this.startX = curx;
    this.startY = cury+(rastralSize*2);
    // Tell the system breaker to leave extra space
    systemContainsPageOrColumnBreak = true;
    // this.line = svgLine(SVG, 0, cury+(rastralSize*2), 1, cury+(rastralSize*2), "colend inv", false
    this.line = svgLine(SVG, 0, lowPoint, 1, lowPoint, "colend inv", false); // Purely for later position use
    // this.tag = svgText(SVG, exWidth-70, cury+rastralSize*3, "col", false, false, this.id);
//    currentExample.colbreaks.push([this.line,this.tag]);
  };
}

/** @class  
 * @memberof classes*/
function ExampleBreak(){
  this.objType = "Example break";
  this.id = false;
  this.exampleno = false;
  this.startX = false;
  this.startY = false;
  this.width = zerofunction;
  this.draw = function(){
    this.startX = curx;
    this.startY = cury;
  };
}

////////////////////////////////////////
// 4. Underlay text and text tags

// For now, captions and lyrics are regarded as the same. No spacing
// is allocated for them.

/** @class  
 * @memberof classes*/
function TextUnderlay(){
  this.objType = "TextUnderlay";
	this.prevProportion = currentProp;
	this.proportionChangesTo = false;
  this.type = "text";
  this.position = 0;
  this.staffPos = false;
  this.orientation = false;
  this.components = [];
  this.startX = false;
	this.prevCurX = false;
  this.marginal = currentInfo ? "l" : false;
  this.classList = currentExample.classes ? currentExample.classes.classes.slice(0) : [];
  this.width = function(){
    let textLength = this.justGiveMeText().length;
    let estCharWidth = 6;
    return textLength * estCharWidth;
  }
  this.updateStyles = selfFun;
  this.MEIObj = false;
  this.changesProportion = function(){
		if(this.type==="label" && typeof(this.components[0])=="string"
				&& this.components[0].toLowerCase()=="crescit in duplum"){
			this.proportionChangesTo = this.prevProportion / 2;
			return this.proportionChangesTo;
		} else {
			return false;
		}
	}
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
	this.justGiveMeText = function(){
		// Just grabbing all the text strings. Usually the wrong answer.
		var text = "";
    for(var i=0;i<this.components.length; i++){
      if(typeof(this.components[i]) == "string"){
        text += this.components[i];
      } else if(this.components[i].justGiveMeText){
        text += this.components[i].justGiveMeText();
      }
      else if(this.components[i].objType==="MusicalChoice" && !this.components[i].nonDefault()){
        // yes, there are variants inside text, we want the default reading
        text += this.components[i].content[0].content[0];
      }
    }
    return text;
	};
	this.toMEI = function(doc, parent, lyricParent){
    if(!parent) parent = doc.currentParent;
		if(lyricParent){
			var el = doc.createElementNS("http://www.music-encoding.org/ns/mei", "verse");
      var elSyl = doc.createElementNS("http://www.music-encoding.org/ns/mei", "syl");
			addUUIDs(this, el, curDoc);
      parent.appendChild(el);
      el.appendChild(elSyl);
			this.MEIObj = el;
      // put syl inside verse to be schema conform
			elSyl.appendChild(doc.createTextNode(this.justGiveMeText()));
      // question: what to do with multiple lines??? (hope this never happens)
			return el;
		} else {
      var el = doc.createElementNS("http://www.music-encoding.org/ns/mei", "dir");
			addUUIDs(this, el, curDoc);
      // append dir only if there is any text to contain
      if (this.justGiveMeText().length > 0) 
      {
        // since MEI 4, <dir> will be put into staff in mensural notation
        // we need to make sure, to put <dir> there
        //parent.afterChild(el);
        let staff = doc.evaluate("./ancestor::mei:staff", parent, nsResolver, 9).singleNodeValue;
        staff.appendChild(el);
      }
			this.MEIObj = el;
      // dir needs @startid, get uuid from parent element, last element in layer or do a fallback
      if(parent && parent.localName!=="layer") {
        el.setAttributeNS(null, 'startid', '#' + parent.getAttribute('xml:id'));
      }
      else if (parent && parent.localName==='layer' && parent.childNodes.length>0) {
        el.setAttributeNS(null, 'startid', '#' + parent.childNodes[parent.childNodes.length-1].getAttribute('xml:id'));
      }
      else {
        // this is a nasty fallback to keep the MEI valid even though tstamp in mensural is nonsense
        el.setAttributeNS(null, 'tstamp', '0');
      }
      el.appendChild(doc.createTextNode(this.justGiveMeText()));
			if(this.type==="label" && typeof(this.components[0])=="string"
				 && this.components[0].toLowerCase()=="crescit in duplum"){
				var el2 = doc.createElementNS("http://www.music-encoding.org/ns/mei", "proport");
				parent.appendChild(el2);
				el2.setAttributeNS(null, 'numbase', '2');
				el2.setAttributeNS(null, 'multiplier', this.proportionChangesTo);
			}
			return el;
		}
	}
  this.referenceGlyph = function(){
    if(this=== currentExample.events[eventi]){
      // referenceGlyph is previous one
      if(eventi===0) {
        return false;
      } else if (currentExample.events[eventi-1].objType != "TextUnderlay"){
        return currentExample.events[eventi-1];
      } else {
        return false;
      }
    } else {
      return currentExample.events[eventi];
    }
  };
  this.negativeSpace = function(next){
    var rg = this.referenceGlyph();
    if(rg && rg.negativeSpace) {
      return rg.negativeSpace(next);
    } else return false;
  };
  this.draw = function(){
    this.startX = curx;
    this.prevCurX = curx;
    if(this.classList.length){
      extraClasses = classString(this.classList);
      drawClasses(this.classList, this);
    }
    if(this == currentExample.events[eventi]){
      // If we're not in a compound form, we need to be positioned
      // beneath *previous* glyph
      if(eventi == 0){
        curx = rastralSize;
      } 
      else if (currentExample.events[eventi-1].objType != "TextUnderlay"){
        if(!currentExample.events[eventi-1].startX){
          // FIXME: This seems to happen for texts with musical choice in them
          currentExample.events[eventi-1].startX = curx; // for now
        }
        curx = currentExample.events[eventi-1].startX;
      }
      if(curx < lmargin){
        curx = lmargin;
      }
    } 
    else {
      if(!this.orientation){
        curx = Math.max(curx, underlayRight(this.position));
      }
    }
    var ynudge = 0;
    var pos = this.position;
    var hpos = /[lrc]/.exec(this.position);
    if(hpos) hpos = hpos[0];
    var vpos = /-?[0-9]*/.exec(this.position);
    if(vpos) vpos = Number(vpos[0]);
    if(vpos){
      //      ynudge = vpos*rastralSize/4;
      if(this.orientation){
        ynudge = vpos*rastralSize/2;
      } else {
        ynudge = vpos*rastralSize/2 +1;
      }
      if(vpos<-6) leaveSpace = true;
    }
    // lowPoint is a global
    lowPoint = Math.max(lowPoint, cury+(2*rastralSize)-ynudge);

    // store basic x & y axis positions -- they'll be used to create a new textblock
    var blockX = curx;
    var blockY = cury+rastralSize-ynudge;

    // creates adds a new textblock
    var textBlock = false;
    var orientClass = this.orientation ? " r"+this.orientation : "";
    textBlock = svgText(SVG, blockX, blockY, "textblock"+orientClass, 
      false, false, false);
    drawRichText(textBlock, this.components);

    // Let's hope that there is no text within text... in case of emergency, try to make sense of this:
    /*var textBlock = SVG.nodeName.toUpperCase()==="TEXT" ? SVG 
      : svgText(SVG, blockX, blockY, "textblock"+(this.orientation ? " r"+this.orientation : ""), 
                false, false, false);*/

    //var oldSVG = SVG;
    //SVG = textBlock;


    // after the textblock has been created, try to find its position, then fill it afterwards (below)
    
    // now, the x and y coordinates has to be determined again because of crazy orientation stuff
    // we're trying to determine if blockX and blockY updates and then set it once and for all...
    switch(hpos){
      case "l":
        blockX = lmargin;
        break;
      case "r":
        blockX = currentExample.width()-textBlock.getBoundingClientRect().width-rastralSize;
        break;
      case "c":
        blockX = (currentExample.width()-textBlock.getBoundingClientRect().width)/2;
    }

    var width = textBlock.getBBox().width;
    var height = textBlock.getBBox().height;

    if(this.orientation){
      if(this.orientation==="90c"){
        if(this.marginal==="l") {
          this.startX = lmargin-rastralSize;
          blockX = this.startX;
        }
        if(this.marginal==="r") {
          this.startX = curx+rastralSize*2; // currentExample.width();
          blockX = this.startX;
        }
      } 
      else if(this.orientation==="90a"){
        var actualx = curx;
        if(this.marginal==="l") {
          this.startX = lmargin-(3*rastralSize/2);
          actualx = this.startX;
          blockX = this.startX;
        }
        if(this.marginal==="r") {
          this.startX = curx+rastralSize*2; // currentExample.width();
          actualx = this.startX;
          blockX = this.startX;
        }
        var actualy = cury+rastralSize-ynudge;
        // SVG.setAttributeNS(null, "transform", "rotate(-90, "
        //                    +actualx+", "+actualy+") translate("
        //                    +(this.staffPos * rastralSize / 2)+", "+rastralSize+")");
      } 
      else if(this.orientation==="180") {
        this.startX = curx + width;
        if(typeof(last(this.components))=="string" && /[,.¶:;()–\-\—!?‘’]/.test(last(last(this.components)))) this.startX -= 0.55*rastralSize;
        if(this.marginal==="l") {
          this.startX = lmargin;
        }
        if(this.marginal==="r") {
          this.startX = curx+rastralSize*2; // currentExample.width();
        }
        var actualx = this.startX;
        blockX = this.startX;
        blockY = cury-ynudge+(rastralSize*-0.25);
        //        var actualy = cury+rastralSize-ynudge;
        var actualy = cury-ynudge;
        textBlock.setAttributeNS(null, "transform", "rotate(180, "
                          +actualx+", "+actualy+")" );
      }
    }
    //set x and y once and for all and for multiple blocks if necessary
    if(textBlock.querySelectorAll("*").length > 1) 
    {
      let textParts = textBlock.querySelectorAll("*");
      textParts[0].setAttributeNS(null, "x", blockX);
      textParts[0].setAttributeNS(null, "y", blockY);
      for(let i=1; i < textParts.length; i++)
      {
        if(textParts[i].classList.contains("newline"))
        {
          switch(this.orientation){
            case "90c":
              blockX -= width;
              break;
            case "90a":
              blockX += width;
              break;
            default:
              blockY += height;
          }
          textParts[i].setAttributeNS(null, "x", blockX);
          textParts[i].setAttributeNS(null, "y", blockY);
        }
      }
    }
    else
    {
      textBlock.setAttributeNS(null, "x", blockX);
      textBlock.setAttributeNS(null, "y", blockY);
    }
    
    //try adding the text after figuring out where the block is positioned
    //drawRichText(textBlock, this.components);

    //SVG = oldSVG;
    if(!this.orientation && !this.marginal) curx = this.startX;
  //    if(this.orientation) curx+=rastralSize*2;
    if($(SVG).parent("#content")) underlays.push(textBlock);
    // experimental:
    if(eventi>0 && (currentExample.events[eventi-1].objType==="TextUnderlay")){
      curx = currentExample.events[eventi-1].prevCurX;
    }
    
    //try setting curx back to start after it has been set back
    curx = this.prevCurX;

    return textBlock;
  };
  // Text Underlay
}

function textwidth(thing){
	if(typeof(thing)==="string"){
		return thing.length * rastralSize;
	} else {
//		console.log("Estimating width of ", thing);
		return thing.width();
	}
}

/** @class  
 * @memberof classes
 * @classdesc A special sort of text that takes up space on an empty staff
*/
function Tacet(){
	// A special sort of text that takes up space on an empty staff
	this.objType = "Tacet";
	this.content = ["Tacet"];
	this.startX = false;
	this.domObj = false;
	this.classList = currentExample.classes ? currentExample.classes.classes.slice(0) : [];
	this.width = function() {
		var width = 0;
		for(var l=0; l<this.content.length; l++){
			var line = this.content[l];
			width = Math.max(width, 2 + line.reduce((l, x) => l + textwidth(x), 0));
		}
		return width;
	}
	this.updateStyles = selfFun;
	this.toText = function() {
		if(this.content==="Tacet") return "<tacet/>";
		else return "<tacet>"+this.content.join("<l/>")+"</tacet>";
	};
	this.draw = function(){
		this.startX = curx;
		var extraClasses = "";
		if(this.classList.length){
      extraClasses = classString(this.classList);
      drawClasses(this.classList, this);
    }
		var ynudge =  (6 * rastralSize / 2 + 1)
		var y = cury - ynudge;
		this.domObj = svgGroup(SVG, 'tacet '+extraClasses, false);
		for (var i=0; i<this.content.length; i++){
			var newText = svgText(this.domObj, this.startX, y, "textblock tacet", false, false, false);
			drawRichText(newText, this.content[i]);
			curx = Math.max(curx, newText.getBBox().x + newText.getBBox().width + rastralSize);
			y += 2 * rastralSize;
		}
		return this.domObj;
	}
}
	

/** @class  
 * @memberof classes*/
function MESuper(){
  this.objType = "MusicExampleSuperscript";
  this.type = "text";
  this.position = 0;
  this.text = "";
  this.startX = false;
  this.width = zeroWidth;
  this.updateStyles = function (styles){return styles;};
  this.dy = function (){return -rastralSize/2;};
  this.draw = function(styles){
    var txt = svgSpan(SVG, 
                      "tspanSup "+(styles.length ? textClasses(styles) :"text"), false, this.text);
    txt.setAttributeNS(null, "dy", this.dy()+"px");
    return txt;
  };
}

/** @class  
 * @memberof classes*/
function RedOpen(){
  this.objType = "RedOpen";
  this.classString = "red";
  this.closes = false;
  this.startX = false;
  this.oneOff = false;
  this.toText = function() {
    return "<red>";
  };
  this.width = zeroWidth;
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

/** @class  
 * @memberof classes*/
function RedClose(){
  this.objType = "RedClose";
  this.closes = "RedOpen";
  this.startX = false;
  this.toText = function() {
    return "</red>";
  };
  this.width = zeroWidth
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

/** @class  
 * @memberof classes*/
function LargeOpen(){
  this.objType = "LargeOpen";
  this.classString = "large";
  this.closes = false;
  this.startX = false;
  this.oneOff = false;
  this.toText = function(){
    return "<large>";
  };
  this.width = zeroWidth
  this.draw = function(){
    currentExample.classes.addClass(this);
    this.startX = curx;
  };
  this.updateStyles = function(styles){
    styles.push('large');
    return styles;
  };
  this.checkClose = function(){
    return string.indexOf("</large>")>-1;
  };
}

/** @class  
 * @memberof classes*/
function LargeClose(){
  this.objType = "LargeClose";
  this.closes = "LargeOpen";
  this.startX = false;
  this.toText = function() {
    return "</large>";
  };
  this.width = zeroWidth;
  this.updateStyles = function(styles){
    while(styles.pop()!= 'large' && styles.length);
    return styles;
  };
  this.draw = function(){
    currentExample.classes.addClass(this);
    this.startX = curx;
  };
}

/** @class  
 * @memberof classes*/
function BlueOpen(){
  this.objType = "BlueOpen";
  this.classString = "blue";
  this.closes = false;
  this.startX = false;
  this.oneOff = false;
  this.toText = function() {
    return "<blue>";
  };
  this.width = zeroWidth;
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

/** @class  
 * @memberof classes*/
function BlueClose(){
  this.objType = "BlueClose";
  this.closes = "BlueOpen";
  this.startX = false;
  this.toText = function() {
    return "</blue>";
  };
  this.width = zeroWidth;
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

/** @class  
 * @memberof classes*/
function RedlineOpen(){
  this.objType = "RedlineOpen";
  this.startX = false;
  this.oneOff = false;
  this.toText = function() {
    return "<redline>";
  };
  this.width = zeroWidth;
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

/** @class  
 * @memberof classes*/
function RedlineClose(){
  this.objType = "RedlineClose";
  this.closes = "RedlineOpen";
  this.startX = false;
  this.toText = function() {
    return "</redline>";
  };
  this.width = zeroWidth;
  this.updateStyles = function(styles){
    // remove styles until the red one is found. This may not be ideal
    // behaviour, but it will be correct if there tags are legal
    // XML-oid ones
    while(styles.pop()!= 'redline' && styles.length);
    return styles;
  };
  this.draw = function(){
    currentExample.classes.addClass(this);
    currentRedline = false;
    this.startX = curx;
  };
}

/**@class
 * @memberof classes
 * @summary Class that marks line breaks in TextUnderlay
 */
function Linebreak(){
  this.objType = "Linebreak";
  this.startX = false;
  this.oneOff = true;
  this.tag = "l/";
  this.toText = function(){
    return "<"+this.tag+">";
  }
  this.width = zeroWidth;
  this.updateStyles = function(styles){
    //styles.push("newLine");
    return styles;
  };
  this.draw = function(){
    currentExample.classes.addClass(this);
    this.startX = curx;
  };
}

/** @class  
 * @memberof classes*/
function GenericOpen(){
  this.objType = "GenericOpen";
  this.startX = false;
  this.oneOff = false;
  this.tag = false;
  this.toText = function() {
    return "<"+tag+">";
  };
  this.width = zeroWidth;
  this.checkClose = function(){
    return string.indexOf("</"+this.tag+">")>-1;
  };
  this.updateStyles = function(styles){
    styles.push(this.tag);
    return styles;
  };
  this.draw = function(){
    currentExample.classes.addClass(this);
    this.startX = curx;
  };
}

/** @class  
 * @memberof classes*/
function GenericClose(){
  this.objType = "GenericOpen";  
  this.startX = false;
  this.tag = false;
  this.toText = function() {
    return "</"+this.tag+">";
  };
  this.width = zeroWidth;
  this.updateStyles = function(styles){
    // remove styles until the red one is found. This may not be ideal
    // behaviour, but it will be correct if there tags are legal
    // XML-oid ones
    while(styles.pop()!= this.tag && styles.length);
    return styles;
  };
  this.draw = function(){
    currentExample.classes.addClass(this);
    this.startX = curx;
    // FIXME: check that this works!
  };
}

/** @class  
 * @memberof classes*/
function StrikethroughOpen(){
  this.objType = "StrikeThroughOpen";
  this.startX = false;
  this.oneOff = false;
  this.toText = function() {
    return "<strikethrough>";
  };
  this.width = zeroWidth;
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

/** @class  
 * @memberof classes*/
function StrikethroughClose(){
  this.objType = "StrikeThroughClose";
  this.startX = false;
  this.toText = function() {
    return "</strikethrough>";
  };
  this.width = zeroWidth;
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

/** @class  
 * @memberof classes*/
function upsideDownOpen(){
	this.objType = "UpsideDownOpen";
	this.startX = false;
	this.toText = function(){
		return "<rot180>";
	}
	this.width = zeroWidth;
	this.updateStyles = keepStyles;
	this.draw = identity;
}

/** @class  
 * @memberof classes*/
function upsideDownClose(){
	this.objType = "UpsideDownClose";
	this.startX = false;
	this.toText = function(){
		return "</rot180>";
	}
	this.width = zeroWidth;
	this.updateStyles = keepStyles;
	this.draw = identity;	
}


////////////////////////////////////////
// 5. Misc typesetting

/** @class  
 * @memberof classes*/
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
    if(eventi && currentExample.events[eventi-1] && currentExample.events[eventi-1].negativeSpace){
      var next = currentExample.events.length>eventi+1 ? currentExample.events[eventi+1] : false;
      curx -= currentExample.events[eventi-1].negativeSpace(next);
    } else {
      curx -= rastralSize/2;
    }
  };
}

/** @class  
 * @memberof classes*/
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

/** @class  
 * @memberof classes*/
function MusicWordSplit(){
  this.objType = "Word Split (music)";
  this.startX = false;
  this.toText = function() {
    return "{|}";
  };
  this.updateStyles = function (styles){return styles;};
  this.width = function() {
    return 0;
  };
  this.draw = function(styles){
    var txt = svgSpan(SVG, 'wordsplit '+(styles.length ? textClasses(styles) :"text")
                      , false, "|");
    return txt;
  };
}

/** @class  
 * @memberof classes*/
function MusicWordJoin(){
  this.objType = "Word join (music)";
  this.startX = false;
  this.toText = function() {
    return "{|}";
  };
  this.width = zerofunction;
  this.updateStyles = keepStyles;
  this.draw = function(styles){
    var txt = svgSpan(SVG, 'wordjoin '+(styles.length ? textClasses(styles) :"text")
                      , false, "_");
    return txt;
  };  
}

/** @class  
 * @memberof classes*/
function MusicOptionalSpace(){
  this.objType="Optional Space (music)";
	this.styles;
  this.startX = false;
  this.toText = function() { return "{ }"; };
  this.width = zerofunction;
  this.updateStyles = keepStyles;
  this.draw = function(styles){
    if(punctuationStyle==="modern"){
      return svgSpan(SVG, 'punct MSSpace '+(styles.length ? textClasses(styles) :"text")
                      , false, "");;
    } else {
      return svgSpan(SVG, 'punct MSSpace '+(styles.length ? textClasses(styles) :"text")
                      , false, " ");
    }
  };
}

/** @class  
 * @memberof classes*/
function MusicPunctuation(options){
  this.objType = "Punctuation (music)";
  this.startX = false;
  // this.punctuation = function(o){
  //   return punctuationStyle==="modern" ? (this.modern ? true : false) : (this.MS ? true : false);};
  this.MS = options.charAt(0);
  this.modern = options.charAt(1);
  this.toText = function() { return "{"+this.MS+this.modern+"}"; };
  this.width = zerofunction;
  this.updateStyles = keepStyles;
  this.draw = function (styles){
    if(punctuationStyle==="modern"){
      return svgSpan(SVG, 'punct '+(styles.length ? textClasses(styles) :"text")
                      , false, this.modern);
    } else {
      return svgSpan(SVG, 'punct '+(styles.length ? textClasses(styles) :"text")
                      , false, this.MS);
    }
  };
}

/** @class  
 * @memberof classes*/
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

/** @class  
 * @memberof classes*/
function VoidOpen(){
  this.objType = "VoidOpen";
  this.startX = false;
  this.oneOff = false;
  this.toText = function() {
    return "<void>";
  };
  this.width = function() {return 0;};
  this.updateStyles = function(styles){
    styles.push('void');
    return styles;
  };
  this.checkClose = function(){
    return string.indexOf("</void>")>-1;
  };
  this.draw = function(){
    currentExample.classes.addClass(this);
    this.startX = curx;
//    voidnotes = true;
  };
}

/** @class  
 * @memberof classes*/
function VoidClose(){
  this.objType = "VoidClose";
  this.startX = false;
  this.closes = "VoidOpen";
  this.oneOff = false;
  this.toText = function() {
    return "</void>";
  };
  this.width = function() {return 0;};
  this.updateStyles = function(styles){
    // remove styles until the red one is found. This may not be ideal
    // behaviour, but it will be correct if there tags are legal
    // XML-oid ones
    while(styles.pop()!= 'void' && styles.length);
    return styles;
  };
  this.draw = function(){
    currentExample.classes.addClass(this);
    this.startX = curx;
//    voidnotes = false;
  };
}

/** @class  
 * @memberof classes*/
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

/** @class  
 * @memberof classes*/
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

/** @class  
 * @memberof classes*/
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

/** @class  
 * @memberof classes*/
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

/** @class  
 * @memberof classes
 * @classdesc Ledger lines are slighely odd in this world. They aren't inserted
 * as events. Instead, they are kept as extras that are linked to by
 * all notes in their range.
*/
function LedgerLineChange(){
	// Ledger lines are slighely odd in this world. They aren't inserted
	// as events. Instead, they are kept as extras that are linked to by
	// all notes in their range.
  this.objType = "LedgerLineChange";
  this.count = 0;
  this.colour = false;
  this.startX = false;
	this.coordinates = [];
  this.endX = false;
  this.maxX = -10;
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
    var end2 = string.indexOf("}");
    var comma = string.indexOf(",");
    if(end===-1) {
      if(end2===-1) return;
      end = end2;
    } else if (end2>-1){
      end = Math.min(end, end2);
    }
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
    var e2 = currentExample.events[eventi-1];
		//var e2box = e2.domObj.getBBox();
    //var end2 = ((e2 && e2.domObj) ? e2box.width + e2box.x : this.maxX);
    // in the case on a ligature with text underlay, end2 exceeds curx
    // Question: is it wise to always use the maximum? 
    // Maybe trying without end2 isn't too bad... hopefully
    var end = Math.max((this.endX || curx), this.maxX); //add end2 again if stupid


//    if(this.maxX && end<this.maxX) end=this.maxX;
    // if(this.domObj){
    //   for(var i=0; i<this.domObj.length; i++){
    //     this.domObj[i].setAttributeNS(null, "x2", end);
    //   }
    // }
		/// Testing
		/*for(var j=0; j<this.coordinates.length; j+=2){
			var l = this.coordinates[j][0];
			var r = (this.coordinates.length===j+1) ? end2 : this.coordinates[j+1];
			var y = this.coordinates[j][1];
			var pos = this.count<0 ? 4-2*Math.abs(this.count) : 2*(currentLinecount + 2);
			var colour = this.colour || currentStaffColour;
			var bag = [];
			for(var i=0; i<Math.abs(this.count); i++){
				bag.push(drawLedgerLine(l, y-yoffset(pos), r + 1, " "+colour));
				pos+=2;
			}
		}*/
    /// End testing
    
    // I don't know what has been tested here, but here is the line drawn now:
    var colour = this.colour || currentStaffColour;
    var pos = this.count<0 ? 4-2*Math.abs(this.count) : 2*(currentLinecount + 2);   
    // setting the end a little bit back to get a small margin
    this.domObj = drawLedgerLine(this.startX, this.startY - yoffset(pos), end - rastralSize/4, " "+colour);

		if(this.previous && this.previous.count!=0) this.previous.finishLines();
  };
  this.makeLines = function(){
    // var pos = this.count < 0 ? 2*(0-this.count)
    //   : 2*(currentLinecount+2);
    var pos = this.count<0 ? 4-2*Math.abs(this.count) : 2*(currentLinecount+2);
    this.domObj = [];
    colour = this.colour || currentStaffColour;
    for(var i=0; i<Math.abs(this.count); i++){
      this.domObj.push(drawLedgerLine(this.startX, this.startY - yoffset(pos), this.startX+5, " "+colour));
      pos += 2;
    }
  };
  this.draw = function(){
		// N.B. There is a problem with this implementation - it will fail
		// badly in text-critical tips, because it's co-ordinate based.
		// The correct solution is probably to maintain an array of
		// position/contexts or track coordinates at a higher level
		// (outside of the object, as for things like clef, which are
		// reset around tips) but that's complicated, so I'm not doing
		// that...
		var tip = !$(SVG).parents("#content").length;
    if(!this.startX) {
			this.startX = curx;
			if(!tip) this.coordinates.push([curx-rastralSize/4, cury]);
		}
    // set startY only at the beginning of a line, since a ledger lines must be evenly horizontal
    if(this.startY===false) this.startY = cury;
		if(this.maxX && this.maxX>curx){
			// we've changed system
//			this.coordinates.push(this.maxX);
			if(!tip) this.coordinates.push([curx, cury]);
			this.maxX = curx;
		}
    this.maxX = Math.max(this.maxX, curx);
    // Don't draw this, draw previous
    if(this.previous && this.previous.count!=0){
      if(!this.previous.endX) this.previous.endX = this.startX;
    // Don't draw anything till we reach the end
      if(this.count===0 && this.startX===curx){
        this.previous.finishLines();
      }
    }
    if(!this.previous && curx===this.startX){
      if(eventi>-1 && eventi<currentExample.events.length 
         && ["Ligature", "Neume"].indexOf(currentExample.events[eventi].objType)>-1){
        this.startX -= rastralSize/4;
//        this.makeLines();
      } else {
//        this.makeLines();
//        curx += rastralSize/2;
      }
      // // This is the beginning of the ledger line. Give it some room, 
      // curx += rastralSize/2;
    }
  };
  // Ledger Line Change
}

////////////////////////////////////////
// 6. Parameters (One-off class for use in MusicExample class

/** @class  
 * @memberof classes*/
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
		if(standaloneEditor) {
			var text = "<piece: ";
		} else {
			var text = "<example: {" + valueText(this.spec) + "}";
		}
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
      && typeof(this.staff.lines) == "number" && (typeof(this.staff.colour) =="string" || this.staff.colour==false));
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
			//			console.log(this, eventi);
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
    }
    if(this.specComment && this.specComment.content!=="full measure"
			 && this.specComment.content!=="in-line") {
      this.specComment.draw();
    }
    var oldSVG = SVG;
    SVG = svgGroup(SVG, "prefGroup", false);
    var thisclef;
    var thissolm;
    if((thisclef = this.getClef())){
      if(thisclef.objType !== "Clef"){
        thisclef.params = this;
      }
      thisclef.draw();
    }
    if((thissolm = this.getSolmization())){
      if(!(thissolm.clefp && thissolm.clefp())) {
				//				console.log("0>", thissolm);
        thissolm.draw();
      } else {
        console.log(["Solm error?", thissolm]);
      }
    }
    if(showvariants && this.hasChoice()){
      //SVG.style.fill = "#060";
      addAnnotation(SVG, this, "staff");
      SVG = this.SVG;
    }
    SVG = oldSVG;
    if(this.mensuralSignature){
			console.log(this.mensuralSignature);
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
      params.push(witnessReading(wit, this.staff.lines, true, true, false, false).value);
    }
    if(typeof(this.staff.colour) == "string"){
      params.push(this.staff.colour);
    } else if(!this.staff.colour){
      params.push(defaultColour);
    } else {
      params.push(witnessReading(wit, this.staff.colour, true, true).value);
    }
    if(clef){
      if(clef.objType == "Clef"){
        params.push(clef);
      } else {
        params.push(witnessReading(wit, clef, true, true, false, false));
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
		var infoPresent = [false, false, false, false];
    for (var i=0; i<sources.length; i++){
      pars = this.getWitOptions(sources[i].id);
			infoPresent = pars.map((x, i) => infoPresent[i] || x);
      if(typeof(pars[0])==="undefined") {
        continue;
      }
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
		//TEST
		vars = vars.filter((x) => (!infoPresent[0] || x[0][0]) && (!infoPresent[1] || x[0][1]) && (!infoPresent[2] || x[0][2]) && (!infoPresent[3] || x[0][3]));
		//
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
    // var d = 40;
    var d = 10;
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
    var oldx = curx;
    var width = 55;
    var staff = svgGroup(SVG, "Stafflines", false);
    var description = svgText(SVG, curx + 5, 20, //10,
															"variantReading", false, false, false);
//		console.log(witnesses[0]);
    if(witnesses[0] == "MSS" || witnesses[0] == "emend." || witnesses[0]=="ed."){
			//      svgSpan(description, "variantWitnessesSpecial", false, witnesses.join(" "));
			description.appendChild(SVGWitnessList({witnesses: witnesses}));
    } else {
			//      svgSpan(description, "variantWitnesses", false, witnesses.join(" "));
			description.appendChild(SVGWitnessList({witnesses: witnesses}));
    }
    width = Math.max(width, description.getBoundingClientRect().width);
//    oldSVG = SVG;
//    SVG = staff;
    curx += 15;
    var c = currentClef;
    if(clef) {
      if(solm && solm!=clef
//				 && ((solm.objType==="MusicalReading" && solm.content[0].members.length)
//             || (solm.objType==="SolmizationSignature" && solm.members.length))){
				 && (solm.objType==="MusicalReading"
             || solm.objType==="SolmizationSignature" && solm.members.length)){
        if(clef.objType==="MusicalReading"){
          clef.draw(false, false, solm);
        } else {
          clef.draw(solm);
        }
      } else {
//				if(eventi<0) console.log(clef, solm, witnesses);
        clef.draw();
      }
    }
//    if(solm && solm!=clef) solm.draw();
//    SVG = oldSVG;
    curx = Math.max(curx, oldx+width);
    drawSystemLines(staff, lines, cury -lines*rastralSize, oldx+10, curx, colour);
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

/** @class  
 * @memberof classes*/
function MChoice(){
  this.objType = "MusicalChoice";
	this.subType = false;
  this.startX = false;
  this.startY = false;
  this.staffPos = false;
  this.lines = currentLinecount;
  this.staffColour = currentStaffColour.length ? currentStaffColour : defaultColour;
//  this.clef = currentClef;
  // this.solm = currentSolm && currentSolm.members.length ? currentSolm : false;
  this.clef = currentClefForVar(false);
  this.solm = currentThingForVar(false, "SolmizationSignature");
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
  /** A single reading may be split into several in cases where we
   * want the clef/sig/staff information to be displayed
   * separately. The exact rules for deciding this have changed at
   * least twice so far, so the code for this function should be
   * considered volatile. */
  this.addReading = function(witnesses, string, description, description2, staffing){
    var agreement = stavesAgree(staffing);
    var isntdefault = this.content.length || description ==="ins." || 
        description==="ins. & del.";
    var oldClef = currentClef;
    var oldSolm = currentSolm;
    var oldLines = currentLinecount;
    var oldColour = currentStaffColour;
    var oldstring = string;
    var reading;
    if(!isntdefault){
      // Simplest case. Accepted reading is always standardised
      reading = new MReading(witnesses, [], description, 
        description2, false, this);
      if(staffing.length > 0 && currentClef != staffing[0][1]) currentClef = staffing[0][1];
      reading.clef = currentClef;
      reading.solm = currentSolm;
      let content = string?nextMusic():[];
      reading.content = content;
      reading.isDefault = true;
      this.content.push(reading);
      string = oldstring;
    } else if (witnesses.length <=1 || agreement){
      // Easiest case: either all definitions are the same (AGREEMENT) or there's only one
      // Do staff stuff: 
      currentClef = staffing[0][1];
      reading = new MReading(witnesses, [], description, 
        description2, staffing, this);
      reading.clef = currentClef;
      reading.solm = currentSolm;
      let content = string?nextMusic():[];
      reading.content = content;
      this.content.push(reading);
      string = oldstring;
    } else {
      // Question 1: Is the variant insignificant
      var ostr = string;
      var obj = nextMusic();
      if(obj.length===1 && this.content[0].content.length===1
         && obj[0].pitch === this.content[0].content[0].pitch && defaultPresent(staffing)){
          // this is an insignificant variant, so don't worry about it
        this.content.push(new MReading(witnesses, obj, description, false, false, this));
      } else {
        var split = matchStaves(staffing);
        var wits = split[0];
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
          this.content.push(new MReading(wits[i], obj, description, description2, st, this));
          string = ostr;
        }
      }
    }
    currentReading = reading;
    if (isntdefault) currentClef = oldClef;
  };
  // MChoice
  /** addTextReading */
  this.addTextReading = function(witnesses, string, description, description2){
    this.content.push(new MReading(witnesses, string?getSubText():[], description, description2));
  };
  /** addOmission */
  this.addOmission = function(witnesses, description, description2, staffing){
    var agreement = stavesAgree(staffing);
    var oldClef = currentClef;
    var oldSolm = currentSolm;
    var oldLines = currentLinecount;
    var oldColour = currentStaffColour;
    if(witnesses.length<=1 || agreement){
      currentClef = staffing[0][1];
      this.content.push(new MOmission(witnesses, description, description2, staffing));
    } else {
      this.content.push(new MOmission(witnesses, description, description2, false));
    }
    currentClef=oldClef;
  };
  /** addNilReading */
  this.addNilReading = function(witnesses){
    this.content.push(new MNilReading(witnesses));
  };
  /** determines width */
  this.width = function(){
    return this.content.length && this.content[0] ? this.content[0].width() : 0;
  };
  /** infop */
  this.infop = function(){
    // Find out if this contains useful prefatory info
    if(this.content[0].applies(false)){
      return infop(this.content[0].content[0]);
    }
    return false;
  };
  /** applicableReading */
  this.applicableReading = function(variant){
    for(var i=0; i<this.content.length; i++){
      if(typeof(this.content[i].applies)=="undefined") debugger;
      if(this.content[i].applies(variant)) return this.content[i];
    }
    return false;
  };
  /** addParams */
  this.addParams = function(params){
    for(var i=0; i<this.content.length; i++){
      if(infop(this.content[i].content[0])){
        this.content[i].content[0].params = params;
      }
    }
  };
  /** ignorable */
  this.ignorable = function(){
    // Find out if this contains useful prefatory info
    if(this.content[0].applies(false)){
      return ignorable(this.content[0].content[0]);
    }
    return true;
  };
  /** varEndStaffPos */
  this.varEndStaffPos = function(variant){
    return false;
  };
  /** clefp */
  this.clefp = function(variant){
    if(variant){
      for(var i=0; i<this.content.length; i++){
        if(!this.content[i].applies) debugger;
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
  /** solmp */
  this.solmp = function(variant){
    if(variant){
      for(var i=0; i< (variant? this.content.length : 1); i++){
        if(!this.content[i].applies) debugger;
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
  /** overPrevious??? */
	this.overPrevious = function(){
		var op = false;
		for(var i=0; i<this.content.length; i++){
			if(this.content[i].objType==="MusicalReading"){
				for(var j=0; j<this.content[i].content.length; j++){
					op = true;
					if(this.content[i].content[j].objType !== "SignumCongruentiae"
						 && this.content[i].content[j].objType !== "Fermata") {
						return false;
					}
				}
			}
		}
		return op;
  };
  /** toText */
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
  /** Draw the popup box for variants
   * First we need to prep some variable and check what the current
   * accepted clef/solm/mens are. */
  this.tip = function(tipSVG){
    var oldSystem = systemLines;
    var oldClef = currentClef;
    var prevSVG = SVG;
    var oldUnderlays = underlays;
    noBreaks = true;
    underlays = [];
    SVG = tipSVG;//svg(false, false);
    svgCSS(SVG, "jt-editor-v.css");
    this.note = SVG;
		// It's possible that this is a text variant – that all its
		// contents are textual in nature, at which point, there's no
		// point in drawing staves.
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
			// If it isn't all text, then we do have to draw things.
			// First, stafflines and clef, etc.
      curx = 10;
      cury = rastralSize * 10;
      var start = curx;
      var staff = svgGroup(SVG, "Stafflines", false);
      if(this.clef && !this.clefp() && !(this.content[0].needsChange())) {
        var pc = false;//currentClefForVar(false);
        var clef = pc ? pc.draw() : this.clef.draw();
        var cclass = clef.getAttributeNS(null, "class");
        if(!typeof(cclass)==="string"){
          cclass = cclass.baseVal;
        }
        clef.setAttributeNS(null, "class", cclass+" indicative");
      }
      if(this.solm && this.solm.members.length &&!this.solmp() && !(this.content[0].needsChange()) && !newPart(this.content[0].content[0])) {
        if(!(this.solm.clefp && this.solm.clefp())){
          // Looks crazy, but true if it's an MChoice
          var solm = this.solm.draw();
          if(solm) {
            var sclass = solm.getAttributeNS(null, "class");
            if(!typeof(cclass)==="string"){
              cclass = cclass.baseVal;
            }
            solm.setAttributeNS(null, "class", sclass+" indicative sm2");
          } else {
            console.log(["Solmization signature error:", this.solm]);
          }
        }
      }
      // <<MChoice.tip() continued>>
      var prevx = curx;
      var olc, osc;
      staffGroup = staff;
      drawSystemLines(staff, currentLinecount, cury-rastralSize*currentLinecount, 0, curx-10, "a "+currentStaffColour);
      systemLines = [staffGroup, currentLinecount, currentStaffColour, curx-10, cury];
			// Now we can loop through the variants and draw them.
      for(var i=0; i<this.content.length; i++){
        if(i>0) svgLine(SVG, curx - 10, cury, curx - 10, 0, "divider", false);
        olc = currentLinecount;
        osc = currentStaffColour;
        var block = this.content[i].footnote(curx,20);
        var size = block.getBoundingClientRect();
        curx = Math.max(curx+10, prevx+size.width+10);
        currentLinecount = olc;
        currentStaffColour = osc;
        prevx  = curx;
      }
      SVG.height.baseVal.value =  cury;
    }
    underlays = oldUnderlays;
    SVG.width.baseVal.value = curx;
    SVG.height.baseVal.value = SVG.getBBox().height+Math.max(SVG.getBBox().y, 0)+1;
    currentClef = oldClef;
    systemLines = oldSystem;
    SVG = prevSVG;
    noBreaks = false;
    return tipSVG;
  };
  // MChoice
  /** nonDefault */
  this.nonDefault = function(){
    return this.content.length &&
      (this.content[0].description == "ins." 
       || this.content[0].description == "ins. & del.");
  };
  /** hasPart */
	this.hasPart = function(){
		// Does this have new voice information for MEI export?
		if(this.nonDefault()) return false;
		if(this.content.length){
			for(var i=0; i<this.content[0].content.length; i++){
				if(this.content[0].content[i].objType==="Part"){
					return this.content[0].content[i];
				}
			}
		}
		return false;
  };
  /** toMEI */
	this.toMEI = function(doc, parent){
		if(!parent) parent = doc.currentParent;
		if(flattenOnExport){
			if(!this.nonDefault()){
				if(this.content[0] && this.content[0].toMEI) {
					return this.content[0].toMEI(doc, parent);
				}
			}
			return false;
		} else {
			var choiceel = doc.createElementNS("http://www.music-encoding.org/ns/mei", "choice");
			var readingel = false;
			for(var i=0; i<this.content.length; i++){
				if(this.content[i].objType!=="MusicalOmission"){
					if(this.nonDefault() || i ){
						readingel = doc.createElementNS("http://www.music-encoding.org/ns/mei", "rdg");
					} else {
						readingel = doc.createElementNS("http://www.music-encoding.org/ns/mei", "lem");
					}
					if(this.content[i].toMEI)
						this.content[i].toMEI(doc, readingel);
				}
				choiceel.appendChild(readingel);
			}
			parent.appendChild(choiceel);
			return choiceel;
		}
  }
  /** draws the variant */
  this.draw = function(prepsolm){
    //FIXME
		this.startX = curx;
    this.startY = cury;
    this.SVG = SVG;
    var click;
    var backtrack;
    var extraClasses = "";
    // Now check for styles
    if(this.classList.length){
      extraClasses = classString(this.classList);
      drawClasses(this.classList, this);
    }
    if(this.content.length){
      if(this.nonDefault()){
        if(showvariants){
          if(this.textBlock){
            click = svgSpan(this.textBlock, "musical ins variants", false, "‸");
          } else {
						if(this.overPrevious()){
              backtrack = curx -this.previous.startX;
						} else {
							backtrack = rastralSize/3;
						}
            curx -= backtrack;
						this.startX = curx;
            click = svgText(SVG, curx, cury-(currentLinecount*rastralSize), "musical variants text", false, false, "ˇ");//*
            curx += backtrack;
            //curx += rastralSize / 2;
          }
        } else return;
      } else if(this.textBlock){
        if(showvariants) this.styles.push('choice');
        click = this.content[0].draw(this.textBlock, this.styles);
        this.styles.pop();
      } else {
        click = this.content[0].draw(false, false, prepsolm || false);
        if(showvariants) {
          click.style.fill = "#060";
        }
      }
      var oc = currentClef;
      var os = currentSolm;
      if(showvariants && !this.params) {
        addAnnotation(click, this, "MusicalChoice");
        SVG = this.SVG;
      }
      currentSolm = os;
      currentClef = oc;
    }
    // this.SVG.width = this.SVG.getBBox().width;
    this.SVG.width = webkit ? 
      this.SVG.getBBox().width
      : this.SVG.getBoundingClientRect().width;
    SVG = this.SVG;
  };
  /** updateStyles */
  this.updateStyles = function(styles) { return styles;};
  // MChoice
}

/** @class  
 * @memberof classes*/
function LigChoice(){
  // FIXME: lots of this will need to change
  this.objType = "Ligature Choice";
  this.ligature = false;
  this.startX = false;
  this.startY = false;
  this.staffPos = false; // ?!?
  this.lines = currentLinecount;
  this.staffColour = currentStaffColour.length ? currentStaffColour : defaultColour;
  //this.clef = currentClef;
  //this.solm = currentSolm && currentSolm.members.length ? currentSolm : false;
  this.clef = currentClefForVar(false);
  this.solm = currentThingForVar(false, "SolmizationSignature");
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
      if(!this.content[i].applies) debugger;
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
//        console.log(["Need to do something", matchStaves(staffing)]);
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
  this.addOmission = function(witnesses, description, description2, staffing){
    this.content.push(new MOmission(witnesses, 'om.', false, staffing));
//    this.content.push(new MOmission(witnesses, 'om.', false, staffDetailsForWitnesses(witnesses)));
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
    var tempy = cury;
    cury -= this.lines * rastralSize;
    drawSystemLines(staff, this.lines, cury, 0, curx, this.staffColour);
    cury = tempy;
    var prevx = curx;
    for(var i=0; i<this.content.length; i++){
			// draw a divider before content if not first reading
      if(i>0) svgLine(SVG, curx - 10, cury, curx-10, 0, "divider", false);
      var block = this.content[i].footnote(curx, 20, this.ligature);
      var size = webkit ? block.getBBox() : block.getBoundingClientRect();
//      curx += size.width;
      curx = Math.max(curx+10, prevx+size.width+10);
      prevx  = curx;
    }
//    SVG.height.baseVal.value = cury;
    SVG.height.baseVal.value = SVG.getBBox().height+Math.max(SVG.getBBox().y, 0)+1;
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
      // Don't change curx after an insertion inside a ligature!!!
      //curx += rastralSize;
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

/** @class  
 * @memberof classes*/
function ObliqueNoteChoice(){
  // FIXME: lots of this will need to change
  this.objType = "ObliqueNote Choice";
	this.subType = false;
  this.ligature = false;
  this.oblique = false;
  this.before = false;
  this.SVG = false;
  this.startX = false;
  this.startY = false;
  this.staffPos = false; // ?!?
  this.lines = currentLinecount;
  this.staffColour = currentStaffColour.length ? currentStaffColour : defaultColour;
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
      if(!this.content[i].applies) debugger;
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
                                     description2, false, this));
    } else if (witnesses.length <=1 || agreement){
      // Easiest case: either all definitions are the same (AGREEMENT) or there's only one
      // Do staff stuff: 
      currentClef = staffing[0][1];
      // Then add reading
      this.content.push(new MReading(witnesses, string?nextMusic(this.oblique):[], description, description2, 
                                     staffing, this));
    } else {
      // Question 1: Is the variant insignificant
      var ostr = string;
      var obj = nextMusic(this.oblique);
      if(obj.length===1 && this.content[0].content.length===1
         && obj[0].pitch === this.content[0].content[0].pitch && defaultPresent(staffing)){
          // this is an insignificant variant, so don't worry about it
        this.content.push(new MReading(witnesses, obj, description, false, false, this));
      } else {
        var split = matchStaves(staffing);
        var wits = split[0];
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
          this.content.push(new MReading(wits[i], obj, description, description2, st, this));
          string = ostr;
        }
      }
    }
    currentClef = oldClef;
		currentSolm = oldSolm;
    currentLinecount = oldLines;
    currentStaffColour = oldColour;

  };
  // this.addReading2 = function(witnesses, string, description){
  //   var rdg = new MReading(witnesses, string?nextMusic(this.oblique):[], description);
  //   this.content.push(rdg);
  // };
  // ObliqueNoteChoice
  this.addOmission = function(witnesses, description, description2, staffing){
    this.content.push(new MOmission(witnesses, description, description2, staffing));
  };
  this.addNilReading = function(witnesses){
    this.content.push(new MNilReading(witnesses));
  };
  this.solmp = function(variant){
    // Not sure this is possible, so for now:
    return false;
    // FIXME: Think this through!
    if(variant){
      for(var i=0; i<variant? this.content.length : 1; i++){
        if(!this.content[i].applies) debugger;
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
    curx = 10;
    cury = rastralSize * 10;
    var start = curx;
    var staff = svgGroup(SVG, "Stafflines", false);
    if(this.clef && !(this.content[0].needsChange() || this.nonDefault())) {		
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
    var tempy = cury;
    cury -= this.lines * rastralSize;
    drawSystemLines(staff, this.lines, cury, 0, curx, this.staffColour);
    cury = tempy;
    var prevx = curx;
    for(var i=0; i<this.content.length; i++){
			// draw a divider before content if not first reading
      if(i>0) svgLine(SVG, curx - 10, cury, curx-10, 10, "divider", false);
      var block = this.content[i].footnote(curx, 20, this.ligature);
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
      //obj.style.fill = "#704";
    }
    return obj;
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

/** @class  
 * @param witnesses
 * @param content content of the reading
 * @param description description of the reading
 * @param description2 another description?
 * @param {Array} staves stave, clef and solm information
 * @param {MChoice} choice parent choice of the reading
 * @memberof classes*/
function MReading(witnesses, content, description, description2, staves, choice){
  this.objType = "MusicalReading";
  this.witnesses = witnesses;
  this.content = content;
  this.description = description;
  this.description2 = description2;
  this.staves = staves;
  this.choice = choice;
  this.classes = new Classes();
  this.prev = (choice && choice.content.length) ? choice.content[choice.content.length-1]
    : false;
	//  this.ligReading = false;// not used
  this.eventi = false;
  this.drawPrep = false;
  // here, every object that is inside the reading gets a reference to the parent choice obj
  for(var i=content.length-1; i>=0; i--){
    content[i].choice = choice;
    // we need to pull out staff, clef and solm information
    if(content[i].objType == "Staff" ||
       content[i].objType == "Clef" ||
       content[i].objType == "SolmizationSignature"){
      content[i].appliesTo = witnesses;
      // currentExample.staves.push([currentExample.events.length, 
      //                             content[i], this]);
//      break;
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
      if(this.content[i]){
				if(this.content[i]==="string"){
					width += this.content[i].length*rastralSize;
				} else if(this.content[i].width){
					width += this.content[i].width();
				} 
			}
    }
    return width;
  };
  this.nonDefault = function(){
    return this.description == "ins." || this.description == "ins. & del.";
  };
  this.applies = function(variant){
    if(variant){
//      return this.witnesses.indexOf(variant)>-1 || this.witnesses[0] =="MSS";
      if(this.witnesses[0]==="MSS"){
        // True for all witnesses
        return true;
      } else {
        return witnessAppliesTo(this, variant);
        for(var i=0; i<this.witnesses.length; i++){
          if(witnessAppliesTo(this.witnesses[i], variant)) return true;
        }
        return false;
      }
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
    var newline;
    for (var i=0; i<this.content.length; i++)
    {
      if(typeof(this.content[i])=="string")
      {
        // .content is almost always an array containing just a single string
        // not in the case of line breaks
        span = svgSpan(false, styles.length ? textClasses(styles) :"text", false,
                         this.content[i]);
        // newline is only applied once
        if(newline)
        {
          styles.pop();
          newline = false;
        }
        obj.push(span);
        SVG.appendChild(span);
      } 
      else if(this.content[i])
      {
        this.content[i].draw(false, styles); // FIXME: Watch this!!!
        styles = this.content[i].updateStyles(styles);

        // handle linebreaks
        if(this.content[i].objType==="Linebreak")
        {
          newline = true;
          styles.push("newline");
        }
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
			//      svgSpan(block, "variantWitnessesSpecial variantWitness", false, " "+this.witnesses.join(" "));
			block.appendChild(SVGWitnessList(this));
    } else {
//      svgSpan(block, "variantWitnesses variantWitness", false, " "+this.witnesses.join(" "));
			block.appendChild(SVGWitnessList(this));
    }
    if(!lastTime) svgSpan(block, false, false, " : ");
    return block;
  };
  this.needsChange = function(){
    return this.staves && !defaultPresent(this.staves);
  };
	this.toMEI = function(doc, parent){
		for(var i=0; i<this.content.length; i++){
			if(this.content[i].toMEI){
				this.content[i].toMEI(doc, parent);
			}
		}
		return parent;
	};
  this.sketch = function(svgEl, fn, prepsolm, ligature){
		// draw the reading without extras (called from within draw (and footnote),
		// which does all that)
    currentReading=this;
    var obj = [];
    var oldSVG = SVG;
    SVG = svgEl;
    var ligs = [];
    for (var i=0; i<this.content.length; i++){
      this.eventi = i;
      if((typeof(this.content[i].ligature) != "undefined" && this.content[i].ligature && fn)){
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
        } else if (this.clefp() || this.solmp()){
          if(this.content[i].objType==="Clef" && prepsolm){
            obj.push(this.content[i].draw(prepsolm));
          } else {
            obj.push(this.content[i].draw());
          }
        } else {
          obj.push(this.content[i].draw());
        }
      }
    }
    SVG = oldSVG;
    currentReading = false;
    return obj;
  };
  // MReading
  this.footnote = function(x, y, ligature){
    currentReading=this;
    var oldstaff = staffGroup;
    var oldSL = systemLines;
    staffGroup = svgGroup(SVG, "Stafflines", false);
    var lc = currentLinecount;
    var sc = currentStaffColour;
    var oc = currentClef;
    var os = currentSolm;
    currentSolm = this.solm ? this.solm : currentSolm;
    currentClef = this.clef ? this.clef : currentClef;
    var oldSVG = SVG;
    if(this.staves && !defaultPresent(this.staves)){// && !this.clefp()){
      currentLinecount = false;
      for(var i=0; i<this.witnesses.length; i++){
        // linecount should be as close to accepted reading as possible
        var vl = this.staves[0][3].varLines(this.witnesses[i]);
        if(!currentLinecount || (Math.abs(lc-currentLinecount) > Math.abs(lc-vl))){
          currentLinecount = vl;
        }
      }
      if(!this.clefp()){
        currentClef = this.staves[0][1];
        currentSolm = this.solmp() ? null : this.staves[0][2];
//      currentLinecount = this.staves[0][3].varLines(this.witnesses[0]);
        currentStaffColour = this.staves[0][3].varColour(this.witnesses[0]);
      // currentLinecount = this.staves[0][3].trueLines();
      // currentStaffColour = this.staves[0][3].trueColour();
        this.drawPrep = true;
      }
    }
    systemLines = [staffGroup, currentLinecount, currentStaffColour, curx, cury];
    var block = svgGroup(SVG, "VariantReading music", false);
    SVG = block;
    // Check that it isn't just a description [e.g. (om.) ? ]
    if(this.content.length){
      if(this.drawPrep || (this.prev && this.prev.drawPrep)){
        var ccfv = (this.witnesses && this.witnesses.length) 
          ? currentClefForVar(this.witnesses[0])
						: currentClefForVar(false);
				clef = false;
        if(ccfv) {
          clef = ccfv.draw(currentSolm);
        } else if(currentClef) clef = currentClef.draw(currentSolm);
				if(clef) {
					var cclass = clef.getAttributeNS(null, "class");
					clef.setAttributeNS(null, "class", cclass+" indicative");
				}
        // if(currentSolm && currentSolm.members.length){
        //   var solm = currentSolm.draw();
        //   if(solm) {
        //     var sclass = solm.getAttributeNS(null, "class");
        //     solm.setAttributeNS(null, "class", sclass+" indicative sm3");
        //   } else {
        //     console.log("Solmization signature error");
        //   }
        // }
      }
      if(this.content[0].objType=="Staff") curx+=rastralSize;
      if(!systemLines[1]) console.log(this.staves, this.witnesses, currentExample.book, currentExample.chapter);
      var content = this.sketch(block, true, undefined, ligature);
    }
    var description = svgText(block, x-3, y+5, "variantReading", false, false, false);
    if(this.description) svgSpan(description, "readingDesc", false, this.description +" ");
    if(this.description2) svgSpan(description, "readingDesc final", false, " "+this.description2+" ");
		var span = SVGWitnessList(this,description);
															/*
    var span = svgSpan(description, "variantWitness variantWitnesses"
                         +((this.witnesses[0]==="MSS" || this.witnesses[0]==="emend.") 
                           ? "Special" 
                           : ""),
                       false, "");
    for(var w=0; w<this.witnesses.length; w++){
      if(w) span.appendChild(document.createTextNode(" "));
      if(typeof(this.witnesses[w])==="string"){
        span.appendChild(document.createTextNode(this.witnesses[w]));
      } else {
        this.witnesses[w].toSVG(span);
      }
    }*/
    // if(this.witnesses[0] == "MSS" || this.witnesses[0] == "emend."){
    //   svgSpan(description, "variantWitnessesSpecial variantWitness", false, this.witnesses.join(" "));
    // } else {
    //   svgSpan(description, "variantWitnesses variantWitness", false, this.witnesses.join(" "));
    // }
    curx = Math.max(curx, x-3+description.getBoundingClientRect().width);
    drawSystemLines(systemLines[0], systemLines[1], 
                    systemLines[4]-rastralSize*systemLines[1],
                    Math.max(systemLines[3]-10, 0), curx,
                    "o "+systemLines[2]);
    systemLines = oldSL;
    SVG = oldSVG;
    currentLinecount = lc;
    currentStaffColour = sc;
    currentClef = oc;
    currentSolm = os;
    staffGroup = oldstaff;
    currentReading=false;
    return block;
  };
  // MReading
  this.draw = function(txtBlock, styles, prepsolm){
    currentReading=this;
    var obj;
    if(typeof(txtBlock) == "undefined" || !txtBlock) {
      obj = svgGroup(SVG, showvariants ? 'variantGroup' : 'invisibleVariantGroup', false);
      this.sketch(obj, false, prepsolm);
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
    currentReading = false;
    return obj;
//     return SVG;
  };
  // apparently duplicate
  /*this.updateStyles = function(styles){
    //FIXME:
    return styles;
  };*/
  // MReading
}

/** @class  
 * @memberof classes*/
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

/** @class
 * @memberof classes
 */
function MOmission(witnesses, description, description2, staves, choice){
  this.objType = "MusicalOmission";
  this.witnesses = witnesses;
  this.description = description;
  this.description2 = description2;
  this.staves = staves;
	this.choice = choice;
  this.toText = function(){
    var text = "("+description+")";
    text+= this.witnesses.join(" ");
    return text;
  };
  this.clefp = function(){
    return false;
  };
  this.solmp = function(){
    return false;
  };
  this.applies = function(variant){
    if(variant){
//      return this.witnesses.indexOf(variant)>-1 || this.witnesses[0] =="MSS";
      if(this.witnesses[0]==="MSS"){
        // True for all witnesses
        return true;
      } else {
        return witnessAppliesTo(this, variant);
        for(var i=0; i<this.witnesses.length; i++){
          if(witnessAppliesTo(this.witnesses[i], variant)) return true;
        }
        return false;
      }
    } else {
      return !this.nonDefault();
    }
  };
  this.width = function(){return 0;};
  this.footnoteText = function(x, y, lastTime){
    var block = svgText(SVG, x, y, "variantReading", false, false, false);
    if(this.description) svgSpan(block, "readingDesc", false, this.description+" ");
    if(this.description2) svgSpan(block, "descriptionFinal", false, " "+this.description2);
    if(this.witnesses[0] == "MSS" || this.witnesses[0] == "emend."){
//      svgSpan(block, "variantWitnessesSpecial variantWitness", false, " "+this.witnesses.join(" "));
			block.appendChild(SVGWitnessList(this));
    } else {
//      svgSpan(block, "variantWitnesses variantWitness", false, " "+this.witnesses.join(" "));
			block.appendChild(SVGWitnessList(this));
    }
    if(!lastTime) svgSpan(block, false, false, " : ");
    return block;    
  };
  this.footnote = function(x,y){
    // FIXME: abstract this away -- it happens too often
    currentReading=this;
    var oldstaff = staffGroup;
    var oldSL = systemLines;
    var drawPrep = false;
    staffGroup = svgGroup(SVG, "Stafflines", false);
    var lc = currentLinecount;
    var sc = currentStaffColour;
    var oc = currentClef;
    var os = currentSolm;
    if(!currentClef) debugger;
    var oldSVG = SVG;
    if(this.staves && !defaultPresent(this.staves) && !this.clefp()){
      currentClef = this.staves[0][1];
      currentSolm = this.staves[0][2];
      currentLinecount = this.staves[0][3].varLines(this.witnesses[0]);
      currentStaffColour = this.staves[0][3].varColour(this.witnesses[0]);
      drawPrep = true;
    }
    var block = svgGroup(SVG, "VariantReading music", false);
    if(drawPrep){
      if(currentClef) {
        var clef = currentClef.draw();
        var cclass = clef.getAttributeNS(null, "class");
        clef.setAttributeNS(null, "class", cclass+" indicative");
      }
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
    systemLines = [staffGroup, currentLinecount, currentStaffColour, curx, cury];
    var description = svgText(block, x, y+5, "variantReading", false, false, false);
    svgSpan(description, "readingDesc", false, this.description+' ');
		SVGWitnessList(this, description);/*
    if(this.witnesses[0] == "MSS" || this.witnesses[0] == "emend."){
      svgSpan(description, "variantWitnessesSpecial variantWitness", false, this.witnesses.join(" "));
    } else {
      svgSpan(description, "variantWitnesses variantWitness", false, this.witnesses.join(" "));
    }*/
    drawSystemLines(systemLines[0], systemLines[1], 
                    systemLines[4]-rastralSize*systemLines[1],
                    Math.max(systemLines[3]-10, 0), curx+10,
                    systemLines[2]);
    systemLines = oldSL;
    SVG = oldSVG;
    currentLinecount = lc;
    currentStaffColour = sc;
    currentClef = oc;
    currentSolm = os;
    staffGroup = oldstaff;
    currentReading = false;
    return block;    
  };
  this.draw = function(){
    return false;
  };
}

/** @class  
 * @memberof classes
 * @summary Choice structures for object attributes rather than for object collections */
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

/** @class  
 * @memberof classes*/
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

/** @memberof classes */
function witnessReading(witness, choice, MSSToAll, allToMSS, edToAll, allToEd){
  var ws;
  for(var i=0;i<choice.content.length; i++){
    ws = choice.content[i].witnesses;
    for(var w=0; w<ws.length; w++){
      if(witness===ws[w] || (witness==="MSS" && MSSToAll) || (ws[w]==="MSS" && allToMSS)
         || (witness==="ed" && edToAll) || (ws[w]==="ed" && allToEd)
         || (witness.objType==="Qualified Witness" && typeof(ws[w])==="string" && witness.witness===ws[w])
         || (witness.objType==="Qualified Witness" && ws[w].objType==="Qualified Witness" 
             && witness.witness===ws[w].witness && witness.corrected===ws[w].corrected)){
        return choice.content[i];
      }
    }
    // if(choice.content[i].witnesses.indexOf(witness) != -1
    //    || choice.content[i].witnesses.indexOf("MSS") != -1 ) {
    //   return choice.content[i];
    // }
  }
	return false;
}

///////////////////////
//
// Misc
//

/** @class  
 * @memberof classes*/
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
    // this.classes = this.classes.filter(function(el){return !el.oneOff;});
    var tempClasses = [];
    for(var i=0; i<this.classes.length; i++){
      if(this.classes[i].oneOff){
        if(this.classes[i].objType && this.classes[i].objType==="LedgerLineChange" 
           && this.classes[i].count!==0) {
          var close = new LedgerLineChange();
          close.count = 0;
          close.oneOff = true;
          close.previous = this.classes[i];
          tempClasses.push(close);
        } else if(this.classes[i].objType && this.classes[i].objType==="RedlineOpen"){
          currentRedline = false;
        }
      } else {
        tempClasses.push(this.classes[i]);
      }
    }
    this.classes = tempClasses;
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

/** @memberof classes */
function classString (classes){
  return classes.reduce(
    function(str, el){
      return str
        + (typeof(el.classString) == "undefined" ? "" : " " +el.classString);},
    "");
}

/** @memberof classes */
function drawClasses (classes){
  for(var c=0; c<classes.length; c++){
    if(classes[c].draw) classes[c].draw();
  }
}

/** @memberof classes */
function removeRedlineBefore (classlist){
  // This hack is necessary for reasons I don't understand, to remove
  // a state variable whose reason for persisting is unclear.
  for(var i=0; i<classlist.length; i++){
    if(classlist[i].objType==="RedlineOpen"){
      return false;
    }
  }
  return true;
}

/** @memberof classes */
function isResolved(ligel){
	switch(ligel.objType){
		case 'LigatureNote':
		case 'ObliqueNote':
			if(ligel.MEIObj && ligel.MEIObj.getAttributeNS(null, 'dur.ges')){
				return true;
			}
			break;
		case 'Oblique':
			return ligel.members.every(isResolved);
		default:
			console.log('missed: ', ligel.objType);
			return true;
	}
	return false;
}

