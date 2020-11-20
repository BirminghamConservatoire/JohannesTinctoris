/**
 * Music parser
 * 
 * @fileoverview Contains the parser for the music examples and pieces
 * @namespace music-parser
 */

/**
 * takes a char and looks what kind of event do we have
 * @returns {*} object according to char
 * @memberof music-parser
 */
function nextEvent() {
  var obj;
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
      if(string.charAt(0)==="?") {
        obj = nextSignumCongruentiae(); 
      } else if (string.charAt(0)==="*"){
        obj = nextFermata();
      } else {
        obj = nextNote();
      }
      obj.flipped = true;
      return obj;
    case "?":
      return nextSignumCongruentiae();
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
      return nextNote();
    case "^":
      if (string.charAt(1)==="c"){
        consume(1);
        var custos = nextCustos();
        custos.sup = true;
        return custos;
      } else {
        return nextNote();
      }
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
    case "4":
    case "5":
    case "6":
    case "7":
    case "8":
    case "9":
      return nextRepeat();
    case "&":
      obj = new etc();
      string = string.substring(1);
      getAndSetPitch(obj);
      return obj;
  }
  return false;
}

/**
 * @function nextColRef
 * @returns {(ColumnStart|PositiveSpace|boolean)} column, a new PositiveSpace object or false
 * @memberof music-parser
 */
function nextColRef(){
  var col = new ColumnStart();
  var startLength = string.match(/\[\-*/).length;
  var loc = string.search(/\-*\]/);
  var endLength = loc > -1 ? string.match(/\-*\]/).length : 1;
  if(loc == -1){
    console.log("non-col-ref:"+string);
    return false;
  } else if (loc == 1) {
    string = string.substring(loc+endLength);
    // This means that we have [-]
    return new PositiveSpace();
  } else {
    col.id = string.substring(startLength+1, loc);
    parseColumn(col.id, col);
    string = string.substring(loc+endLength);
    return col;
  }
}

/**
 * @function nextComment 
 * @returns {Annotation} ann
 * @memberof music-parser
 */
function nextComment(){
  // Use text version
  var os = string;
  var op = pointer;
  var octp = currentTextParent;
  var end = string.indexOf("**", 2);
  if(end < 2){
    complaint.push("Unclosed comment"+string.substring(0, 10));
    string = string.substring(2);
    return false;
  }
  var ann = new Annotation();
  // var ann = new Comment();
  string = string.substring(2, end);
  string = string.replace("@@@@", "**");
  currentTextParent = ann;
  ann.code = string;
  ann.contents = readString();
  string = os.substring(end+2);
  pointer = op;
  currentTextParent = octp;
  currentExample.comments.push(ann);
  return ann;
}
/*
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
*/

/**
 * @function nextBarline
 * @returns {Barline} barline
 * @memberof music-parser
 */
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
      consume(1);
      staffPos = getStaffPos();
      bar.end = staffPos;
    }
  }
  return bar;
}

/**
 * @function nextSolmSign
 * @returns {SolmizationSign} solimization sign
 * @memberof music-parser
 */
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

/**
 * @function nextRest
 * @returns {(LongRest|Rest|boolean)} Rest or false
 * @memberof music-parser
 */
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

/** @function nextLongRest
 * @returns {(LongRest|MaxRest|boolean)} Longa rest, maxima rest or false
 * @memberof music-parser
 */
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

/**
 * @function nextRepeat
 * @returns {Repeat|boolean} repeat or false
 * @memberof music-parser
 */
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

/** @function nextNote
 * @returns {Note} note
 * @memberof music-parser
 */
function nextNote(){
  var sup = consumeIf(/\^/);
  var obj = new Note;
  obj.rhythm = getRhythm();
  obj.sup = sup;
  obj = getAndSetPitch(obj);
  if(string.length===1 || string.charAt(1)===" "){
    var tails = consumeIf(/[\/]?[+-]*/);
    if(tails){
      obj.forceTail = tails;
    }
  }
  return obj;
}

/** @function nextChantNote
 * @returns {ChantNote} chant note
 * @memberof music-parser
 */
function nextChantNote(){
  var obj = new ChantNote;
  obj.rhythm = consumeIf(/^[npvl]/);
  obj = getAndSetPitch(obj);
  return obj;
}

/** @function nextCustos
 * @returns {Custos} custos with pitch
 * @memberof music-parser
 */
function nextCustos(){
  var obj = new Custos();
  consume(1);
  return getAndSetPitch(obj);
}

/** @function nextDot
 * @returns {Dot} dot with staff position
 * @memberof music-parser */
function nextDot(){
  var obj = new Dot();
  string = string.substring(1);
  // If pitched
  // return getAndSetPitch(obj);
  // Otherwise
  obj.staffPos = getStaffPos();
  return obj;
}

/** @function nextSignumCongruentiae
 * @returns {SignumCongruentiae} signum congruentiae with staff position
 * @memberof music-parser
 */
function nextSignumCongruentiae(){
  var obj = new SignumCongruentiae;
  string = string.substring(1);
  obj.staffPos = getStaffPos();
  if(currentChoice) obj.effects =currentChoice;
  return obj;
}

/** @function nextFermata
 * @returns {Fermata} fermata with staff position
 * @memberof music-parser
 */
function nextFermata(){
  var obj = new Fermata();
  string = string.substring(1);
  obj.staffPos = getStaffPos();
  return obj;
}

/** @function nextTaglike
 * @summary handles taglike elements of music examples
 * @memberof music-parser
 */
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
		case "rot180":
			return new upsideDownOpen();
		case "/rot180":
			return new upsideDownClose();
    case "red":
      if(string.indexOf("</red>")==-1){
        complaint.push("Missing close tag for <red> around "+string);
      }
      return new RedOpen();
    case "/red":
      return new RedClose();
    case "large":
      if(string.indexOf("</large>")==-1){
        complaint.push("Missing close tag for <large> around "+string);
      }
      return new LargeOpen();
    case "/large":
      return new LargeClose();
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
		case "tacet":
			var endPos = string.indexOf("</tacet>");
			if(endPos===-1) {
				complaint.push("missing close tag for tacet");
				return false;
			} else { 
				return nextTacet(endPos);
			}
		case "tacet/":
			return new Tacet();
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
        if(thing){
          enrichText(tag, thing);
          return thing;
        }
      } else if (tag.substring(0, 4)=="part"){
				var thing = nextPart("part", false, tag.substring(5));
        return thing;
      } else if (tag.substring(0, 5)=="/part"){
				return nextPart("part", true, false);
      } else if (tag.substring(0, 4)=="pars"){
				return nextPart("pars", false, tag.substring(5));
      } else if (tag.substring(0, 5)=="/pars"){
				return nextPart("pars", true, false);
      } else if (tag.substring(0, 7)=="section"){
				return nextPart("section", false, tag.substring(8));
      } else if (tag.substring(0, 8)=="/section"){
				return nextPart("section", true, false);
      } else if (tag.substring(0, 9)=="catchword" || tag.substring(0, 9)=="signature"){
        var margType = tag.substring(0, 9);
        var end = string.indexOf("</"+margType+">");
        if(end>-1){
          var os = string.substring(end+12);
          var c = new Catchword();
          c.tag = margType;
          var colon = tag.indexOf(":");
          if(colon>-1) c.position = trimString(tag.substring(colon+1, tagend));
          string = string.substring(0,end);
          c.code = string;
          c.content = readPara();
          string = os;
          return c;
        }
      }
  }
  return false;
}

/** @function nextNeume
 * @returns {Neume} neume
 * @memberof music-parser
 */
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

/** @function nextObliqueNeume
 * @returns {ObliqueNeume} oblique neume
 * @memberof music-parser
 */
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

/** @function nextLigature
 * @summary Parses <lig>-Tag into Ligature objects
 * @returns {Ligature} ligature with notes
 * @memberof music-parser
 */
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
  var tag;
  while(strsize!=0){
//		console.log(string);
    if((tag=consumeIf(/<(text|label):?.*?>/))){
      //FIXME ignores meaning
      next = nextText();
      enrichText(tag, next);
    } 
    else if(consumeIf("<obl>")){
      next = nextOblique(ligature);
    } 
    else if(string.substring(0,2) == "**"){
      next = nextComment();
//      next = new LigatureComment(next);
      currentExample.comments.push(next);
    } 
    else if(string.charAt(0)=="<") {
      complaint.push("Unexpected item in the tagging area: "+string);
      return false;
    } 
    else if(string.substring(0,5)=="{var="){
      next = nextLigChoice(ligature);
    }       
    else if(string.charAt(0) in rhythms || 
      (string.charAt(0) == "^" && string.charAt(1) in rhythms)){
      // check actively if next object is really a note (remember sup. starting with ^)
      next = nextNote();
      next = new LigatureNote(next);
      consumeSpace();
      if(string.charAt(0)=="."){
        next.dot = nextDot();
      }
      if((string.charAt(0)==="-" && string.charAt(1)==="?") || string.charAt(0)==="?"){
        var flipped = consumeIf("-");
        next.signum = nextSignumCongruentiae();
        next.signum.effects = next;
        next.signum.flipped = flipped;
      }
      if((string.charAt(0)==="-" && string.charAt(1)==="*") || string.charAt(0)==="*"){
        var flipped = consumeIf("-");
        next.fermata = nextFermata();
        next.fermata.lengthens = next;
        next.fermata.flipped = flipped;
      }
    }
    if(string.charAt(0)=="."){
      next.dot = nextDot();
    }
    if(next){
//      ligature.members.push(next);
      ligature.addElement(next);
      // clear next after pushing, just to be sure
      next = false;
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

/** @function nextOblique
 * @summary Parses <obl> tag
 * @param {Ligature} ligature
 * @returns {Oblique} oblique object with content
 * @memberof music-parser
 */
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
  var tag;
	var prevNote = false;
  while(strsize!=0){
    if((tag=consumeIf(/<(text|label):?.*?>/))){
      oblique.texts[oblique.members.length-1] = nextText();
      enrichText(tag, oblique.texts[oblique.members.length-1]);
    } 
    else if(string.substring(0,2) == "**"){
      var obj = nextComment();
      obj.ligature = oblique.ligature;
      oblique.comments[oblique.members.length-1] = obj;
    } 
    else if(string.substring(0,1) == "{"){
      // FIXME: do stuff
      next = nextObliqueNoteChoice(oblique);
			if(next.subType==="no notes"){
				if(prevNote){
					prevNote.otherBits.push(next);
				} else {
					console.log("broken Ligature", oblique);
				}
			} else {
				oblique.extendMembers(next);
			}
    } 
    else {
      next = nextNote();
      if(next){
        next = new ObliqueNote(next, oblique.members.length, oblique);
        consumeSpace();
        if(string.charAt(0)=="."){
          next.dot = nextDot();
        }
				if((string.charAt(0)==="-" && string.charAt(1)==="?") || string.charAt(0)==="?"){
					var flipped = consumeIf("-");
					next.signum = nextSignumCongruentiae();
					next.signum.effects = next;
					next.signum.flipped = flipped;
        }
        if((string.charAt(0)==="-" && string.charAt(1)==="*") || string.charAt(0)==="*"){
					var flipped = consumeIf("-");
					next.fermata = nextFermata();
					next.fermata.lengthens = next;
					next.fermata.flipped = flipped;
				}
        oblique.extendMembers(next);
				prevNote = next;
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

/** @function enrichText
 * @summary Add info to textlike element based on the element tag
 * @param tag element tag
 * @param obj textline element
 * @memberof music-parser
 */
function enrichText(tag, obj){
	// Add info to textlike element based on the element tag
  obj.type = tag.substring(0, 5)==="label" ? "label" : "text";
  var colon = tag.indexOf(":");
  if(colon>-1){
    var tagPart = tag.substring(colon+1).trim();
    if(tagPart.substring(0,3)==="rot"){
      var tagBits = tagPart.substring(3).split(",");
      obj.orientation = tagBits[0].trim();
      obj.position = (tagBits.length>1 ? Number(tagBits[1].trim()) : 
                      (obj.orientation==="90c" ? 12 : 4));
    } else {
      obj.position = tagPart;
    }
  }
}

/**
 * @function nextTacet
 * @summary nice and simple. Tacet is a type of text, but is treated differently because it takes up horizontal space.
 * @param {*} endPos 
 * @returns {Tacet} tacet object
 * @memberof music-parser
 */
function nextTacet(endPos){
	// nice and simple. Tacet is a type of text, but is treated
	// differently because it takes up horizontal space.
	var tacet = new Tacet();
	tacet.content = [];
	var content = string.substring(0, endPos);
	var finalString = string.substring(endPos+8);
	var linebreak;
	while ((linebreak = content.indexOf("<l/>"))>-1){
		extendTacet(content.substring(0, linebreak), tacet);
		content = content.substring(linebreak+4);
	}
	extendTacet(content, tacet)
	string = finalString;
	return tacet;
}

/**
 * @function extendTacet
 * @param {string} content 
 * @param {Tacet} tacet tacet object
 * @returns {Tacet} tacet object
 * @memberof music-parser
 */
function extendTacet(content, tacet){
	var os = string;
	string = content;
	if(/[<{*]/.test(string)){
		var parts = getString();
		if(parts){
			tacet.content.push(parts);
		}
	} else {
		tacet.content.push([string]);
	}
	string = os;
	return tacet;
}

/**
 * @function nextText
 * @returns {TextUnderlay} text
 * @memberof music-parser
 */
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
//  text.components = getSubText();
  text.components = getString();
  string = returnString;
  return text;
}

/** @function getSubText
 * @summary parse contents of a <text></text> block or equivalently-syntaxed thing (e.g. a variant)
 * @returns {Array} components
 * @memberof music-parser
 */
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
      end = string.indexOf("}");
      if(typeof(spans[string.substring(1, end)])!=="undefined"){
        components.push(getTag("<"+string.substring(1, end)+">"));
        components.push(string.substring(end+1, end+2));
        components.push(getTag("</"+string.substring(1, end)+">"));
        string = string.substring(end+2);
      } else {
//        console.log("fail");
        // FIXME: A variant inside a variant would spell madness, but
        // lets assume sanity for now
        components.push(nextTextChoice());
      }
      // A variant can invalidate more or less anything that follows, so...
      varpos = string.indexOf("{");
      tagpos = string.indexOf("<"); // just to check it wasn't in the comment;
      commentpos = string.indexOf("**");
    } else if(commentpos != -1 && (commentpos < tagpos || tagpos == -1)){
        components.push(string.substring(0,commentpos));
        string = string.substring(commentpos);
        components.push(nextComment());
        varpos = string.indexOf("{");
        tagpos = string.indexOf("<"); // just to check it wasn't in the comment;
        commentpos = string.indexOf("**");
    } else {
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
      varpos = string.indexOf("{");
      tagpos = string.indexOf("<"); // just to check it wasn't in the comment;
      commentpos = string.indexOf("**");
    }
  }
  return components;
}

/**
 * @function getString
 * @summary Parse contents of <text></text> or equivalently-syntaxed thing (e.g. a variant). 
 * This is a version of what was previously getSubText, a faster, but much less flexible function
 * @returns {Array} content
 * @memberof music-parser
 */
function getString (){
  // Parse contents of <text></text> or equivalently-syntaxed thing
  // (e.g. a variant). This is a version of what was previously
  // getSubText, a faster, but much less flexible function
  var content = [];
  var size = string.length;
  var prev = false;
  var next = false;
  var braceEnd = false;
  var currentCloses = false;
  while(string.length >0){
    prev = last(content);
    if(currentCloses && prev!=currentCloses[currentCloses.length-1][0]){
      // we have a self closing tag and a new thing after it
      // FIXME: should probably check what's been added
      for(var i=0; i<currentCloses.length; i++){
        content.push(currentCloses[i][1]);
      }
      currentCloses = false;
      prev = last(content);
    }
    switch(string.charAt(0)){
      case "<":
        next = getTag(consumeIf(/<[^<]*>/));
        content.push(next);
        break;
      case "{":
        var closePos = Math.min(string.indexOf("}"), string.length);
        var tag = string.substring(1, closePos);
        if (tag==="|"){
          content.push(new MusicWordSplit());
          consume(closePos+1);
        } else if (tag==="_"){
          content.push(new MusicWordJoin());
          consume(closePos+1);
        } else if (tag===" "){
          content.push(new MusicOptionalSpace());
          consume(closePos+1);
        } else if(tag.length===2 && /[,.¶:;()–\-\—!?\ ‘’]+/.test(tag)){
          content.push(new MusicPunctuation(tag));
          consume(closePos+1);
        } else if(typeof(spans[tag])!=="undefined"){
          next = getTag("<"+tag+">");
          content.push(next);
          if(!currentCloses) currentCloses = [];
          currentCloses.push([next, getTag("</"+tag+">")]);
          consume(closePos+1);
        } else if (string.substring(1, 4)==="var") {
          content.push(nextTextChoice());
        } 
        break;
      case "^":
        content.push(getMusicTextSup());
        break;
      case "*":
        var commentBlock = consumeIf(/\*\*[^*]*\*\*/);
        if(commentBlock){
          next = new Comment();
          next.content = commentBlock.substring(2, commentBlock.length-2);
          currentExample.comments.push(next);
          content.push(next);
          continue;
        }
        // If it isn't a comment, it's part of a string, so continue
      default:
        if(prev && typeof(prev)==="string"){
          content[content.length-1] = prev + string.charAt(0);
        } else {
          content.push(string.charAt(0));
        }
        consume(1);
        break;
    };
    if(string.length === size){
      console.log("Stuck: ", string);
      if(prev && typeof(prev)==="string"){
        content[content.length-1] = prev + string.charAt(0);
      } else {
        content.push(string.charAt(0));
      }
      consume(1);
    }
    size = string.length;
  }
  return content;
}

/**
 * @function getMusicTextSup
 * @returns {MESuper} element
 * @memberof music-parser
 */
function getMusicTextSup(){
  var el = new MESuper()
  consume(1);
  var end = string.indexOf("^");
  var end2 = string.indexOf(" ");
  var newString, newPointer;
  if(end2!==-1 && (end===-1 || end2<end) && end2<8){
    newString = string.substring(end2);
    newPointer = pointer+end2;
    string = string.substring(0, end2);
  } else if(end===-1 || end>8){
    // no "^" or " " or "^" is far removed
    if(string.length){
      newString = string.substring(1);
      newPointer = pointer+1;
      string = string.substring(0, 1);
    } else {
      return;
    }
  } else {
    newString = string.substring(end+1);
    newPointer = pointer+end;
    string = string.substring(0,end);
  }
  el.text = string;
  string = newString;
  pointer = newPointer;
  return el;
}

/** @function getTag
 * @param {string} tag
 * @returns {*} object according to tag name
 * @memberof music-parser
 */
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
    case "<large>":
      return new LargeOpen();
    case "</large>": 
      return new LargeClose();
    case "<l/>":
        return new Linebreak();
    default:
      if(tag.charAt(1)==="/"){
        var obj = new GenericClose();
        obj.tag = tag.substring(2, tag.length-1);
      } else {
        var obj = new GenericOpen();
        obj.tag = tag.substring(1, tag.length-1);
      }
      return obj;
  }
}

/** @function consumeParenthesis
 * @summary Checks for closing parenthesis
 * @returns {?} paren
 * @memberof music-parser
 */
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

/** @function parseMens
 * @summary parses mensural signature
 * @param {} spec
 * @returns {MensuralSignature} mensural signature
 * @memberof music-parser
 */
function parseMens(spec){
  var obj = new MensuralSignature();
  var pointer = 0;
  if(!spec || !spec.length) return obj;
	if(spec.charAt(0) == "(") {
		obj.invisible=true;
		pointer++;
	}
  if(spec.charAt(0) == "[") {
    obj.editorial=true;
    pointer++;
  }
  if(spec.charAt(spec.length-1)=="]" || spec.charAt(spec.length-1)==")") spec = spec.substring(0, spec.length-1);
  if(spec.charAt(pointer)==="^"){
    obj.sup = true;
    pointer++;
  }
  if(spec.charAt(pointer)) {
		var tempspec = spec.substring(pointer+1);
		if(/^[2-9][0-9]/.test(tempspec)) {
			obj.signature = spec.substring(pointer, pointer+2);
			pointer++;
		} else {
			obj.signature = spec.charAt(pointer);
		}
  } else return obj;
  pointer++;
  if(spec.charAt(pointer)) {
    obj.staffPos = staffPosFromString(spec.substring(pointer))[0];
  }
  return obj;
}

/** @function parseMensReading
 * @summary parses readings of mensuration signs?
 * @param {*} fields 
 * @memberof music-parser
 */
function parseMensReading(fields){
  var mens, wits;
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
			wits = fields.slice(1, i);
      return [fields.slice(i), new MReading(wits, [mens], "", false, staffDetailsForWitnesses(wits), false)];
    } 
  }
  wits = fields.slice(1, fields.length);
  if(fields[0]==="(om.)"){
    return [false, new MOmission(wits, "om.", false, staffDetailsForWitnesses(wits))];
  } else {
    return [false, new MReading(wits, [mens], false,
                               false, staffDetailsForWitnesses(wits))];
  }
}

/** @function parseMensReading
 * @summary handles variants in mensuration
 * @param {?} fields 
 * @returns {MChoice} variant object
 * @memberof music-parser
 */
function parseMensVar(fields){
  var obj = new MChoice();
  var nextM = parseMensReading(fields);
	nextM.choice = obj;
  fields = nextM[0];
  while(fields){
    obj.content.push(nextM[1]);
    nextM = parseMensReading(fields);
		nextM.choice = obj;
    fields = nextM[0];
  }
  obj.content.push(nextM[1]);
  return obj;
}

/** @function parseProp
 * @summary parses proportion signs
 * @param {?} propSpec 
 * @param {?} posSpec 
 * @returns {ProportionSign|StackedProportionSigns} proportion sign
 * @memberof music-parser
 */
function parseProp(propSpec, posSpec){
  var propStrings = propSpec.split('/');
  var propPositions = posSpec.split('-');
  var obj, child;
  if(propStrings.length===1){
    obj = new ProportionSign();
    obj.sign = propStrings[0];
    obj.staffPos = staffPosFromString(propPositions[0])[0];
  } else {
    if (propStrings.length>2 || propStrings.length===0){
      console.log("Stack of "+propStrings.length+" proportion signs!!", propSpec);
    }
    obj = new StackedProportionSigns();
    for(var i=0; i<propStrings.length; i++){
      child = new ProportionSign();
      child.sign = propStrings[i];
      child.staffPos = staffPosFromString(propPositions[propStrings.length-1-i])[0];
      obj.signs.push(child);
    }
  } 
  return obj;
}

/** @function parseSolm
 * @summary parses solmization signature
 * @param {?} signs 
 * @returns {SolmizationSignature} solmization signature with solmization signs
 * @memberof music-parser
 */
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
      // solm.staffPos = "0123456789ABCDEF".indexOf(signs[i].charAt(nextChar));
      solm.staffPos = staffPosFromSTring(signs[i].substring(nextChar))[0];
    }
    if(solm.pitch || solm.staffPos != -1){
      obj.members.push(solm);
    }
  }
  return obj;
}

/** @function parseSolmReading
 * @summary parses reading of solmization signature
 * @param {?} fields 
 * @returns {Array} 
 * @memberof music-parser
 */
function parseSolmReading(fields){
  var solm=false, closed, signs=[], start, finish, last, from, descr="", field;
  for(var i=0; i<fields.length; i++){
    field = fields[i];
    if(field.charAt(0)==='"'){
      // Starting a solm sig
      if(from && (solm || i-from)){
				var wits = fields.slice(from, i);
        var staffing = staffDetailsForWitnesses(wits);
        return [fields.slice(i), 
                new MReading(fields.slice(from, i), solm ? [solm] : [], descr, false, staffing)];
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
				var wits = fields.slice(from, i);
        var staffing = staffDetailsForWitnesses(wits);
        return [fields.slice(i),
                new MReading(fields.slice(from, i), solm ? [solm] : [], descr, false, staffing)];
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
	var wits = fields.slice(from, i);
  var staffing = staffDetailsForWitnesses(wits);
  return [false, new MReading(fields.slice(from), solm ? [solm] : [], descr, false, staffing)];
}

/** @function parseSolmVar
 * @summary parses solmization variant
 * @param {?} fields 
 * @returns {MChoice} variant
 * @memberof music-parser
 */
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

/** @function parseClefReading
 * @summary parses a clef reading
 * @param {?} fields 
 * @returns {Array} reading
 * @memberof music-parser
 */
function parseClefReading(fields){
  var clef = false, descr="", from=false, finish;
  for(var i=0; i<fields.length; i++){
    if(fields[i].charAt(0) =='"'){
      if(from && (clef || i-from)){
        // either we've got a clef for this reading, or there is none
        // (and so there has been at least one witness listed)
        var wits = fields.slice(from, i);
        var staffing = staffDetailsForWitnesses(wits);
        // console.log(staffing);
        return [fields.slice(i), new MReading(fields.slice(from, i), clef ? [clef] : [], descr, false, staffing)];
      } else {
        // Clef for this reading
        finish = fields[i].lastIndexOf('"');
        if(!finish && (fields[i+1].charAt(0)=="[" || fields[i+1].charAt(0)=="^")){
          // Erroneous clef, specified in form "C6 [C8]"
          
          finish = fields[i+1].lastIndexOf('"');
          clef = parseClef(fields[i].substring(1)+" "
                           + (finish>-1 ? fields[i+1].substring(0,finish) : fields[i+1]));
          from = i+2;
        } else {
          clef = parseClef(fields[i].substring(1, finish ? finish : fields[i].length));
          from = i+1;
        }
      }
    } else if(fields[i].charAt(0)==='('){
      if(from && ((clef && i-from) || descr.length)) {
        // this either doesn't apply to the clef or there's already a
        // description
        var wits = fields.slice(from, i);
        var staffing = staffDetailsForWitnesses(wits);
        // console.log(wits);
        return [fields.slice(i), new MReading(fields.slice(from, i), clef ? [clef] : [], descr, false, staffing)];
      } else {
        // relevant description
        finish = fields[i].lastIndexOf(')');
        descr = fields[i].substring(1, finish > -1 ? finish : fields[i].length);
        from = i+1;
      }
    }
  }
  var wits = fields.slice(from, fields.length);
  var staffing = staffDetailsForWitnesses(wits);
  // console.log(wits);
  return [false, new MReading(fields.slice(from, fields.length), clef ? [clef] : [], descr, false, staffing)];
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

/** @function parseClefVar
 * @summary parses clef variants
 * @param {?} fields 
 * @returns {MChoice} variant
 * @memberof music-parser
 */
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

/** @function parseClef
 * @summary parses a clef
 * @param {?} spec 
 * @param {?} sub 
 * @returns {Clef} clef
 * @memberof music-parser
 */
function parseClef(spec, sub){
  if(!spec || spec === "0") return false;
  // FIXME: Why??
  var old = currentClef;
  var obj = new Clef();
  currentClef = old; //Just in case isn't valid
  var clefs = /^(Gamma|C|F|G|E)/;
  var r;
  if(spec.charAt(0)=="(") {
		obj.invisible = true;
		spec = spec.substring(1);
		if(spec.charAt(spec.length-1)===")") spec = spec.substring(0, spec.length-1);
	}
  if(spec.charAt(0)=="[") {
    obj.editorial=true;
    spec = spec.substring(1);
  } else {
    // Re-enabled 12/14. Not sure what effect commenting this'll have
    // if(sub) return false;
  }
  if(spec.charAt(spec.length-1)=="]") spec = spec.substring(0, spec.length-1);
	if(spec.charAt(0)=="l") {
		obj.literal=true;
		spec = spec.substring(1);
	}
  r = clefs.exec(spec);
  if(!r) return false;
  obj.type = r[0];
  if(!obj.type) return false;
  spec = spec.substring(obj.type.length);
  if(!spec.length) return false;
//  obj.type = spec.substring(0, spec.length - 1);
//  obj.staffPos = "0123456789ABCDEF".indexOf(spec.charAt(spec.length - 1));
  // obj.staffPos = "0123456789ABCDEF".indexOf(spec.charAt(0));
  // if(obj.staffPos===-1) return false;
  // spec = spec.substring(1);
  var pos = staffPosFromString(spec);
  if(!pos) return false;
  spec = spec.substring(pos[1]);
  obj.staffPos = pos[0];
  var p = obj.staffPos;
  var anotherBit = spec.search(/\S/);
  if(anotherBit>-1){
//    console.log("clef has extra '"+spec+"'", anotherBit, spec.substring(anotherBit));
    if(spec.charAt(anotherBit)==="^"){
      obj.stackedClefs.push(parseClef(spec.substring(anotherBit+1), true));
    } else { 
      // Is an erroneous (and corrected) clef)
      obj.erroneousClef=parseClef(spec.substring(anotherBit), true);
      // HACK: new Clef adds a spurious clef to MusicExample.staves, so let's undo that
      currentExample.staves.pop();
    }
  }
  currentClef = obj;
  return obj;
}

/** @function parseStaff
 * @summary parses a staff
 * @param {?} spec 
 * @returns {Staff} staff
 * @memberof music-parser
 */
function parseStaff(spec){
  var staff = new Staff;
  currentExample.staves.push([currentExample.events.length, staff]);
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
        var os = string;
        string = spec[pointer];
        wit.push(consumeWitnesses()[0]);
        string = os;
        // wit.push(spec[pointer]);
        pointer++;
      }
      staff.lines.addReading(wit, val, false);
      wit = [];
    }
  } else if(!isNaN(parseInt(spec[0],10))){
    // No variant
    staff.lines = linesp(spec[0]);
    pointer++;
  }
  // now colour
  if(pointer>=spec.length){
//    staff.colour = defaultColour;
  } else if (spec[pointer].charAt(0)=='"'){
    staff.colour = new ValueChoice();
    while(pointer < spec.length){
      val = colourp(spec[pointer]);
      pointer++;
      while(!colourp(spec[pointer])){
        var os = string;
        string = spec[pointer];
        wit.push(consumeWitnesses()[0]);
        string = os;
        // wit.push(spec[pointer]);
        pointer++;
      }
      staff.colour.addReading(wit, val, false);
      wit = [];
    }    
  } else {
    // No variant
    staff.colour = colourp(spec[pointer]);
  }
//  console.log(staff);
  return staff;
}

/** @function linesp
 * @todo Obviously, it checks if some string or its particle is a number
 * @param {string} string 
 * @returns {boolean}
 * @memberof music-parser
 */
function linesp(string){
  return (!isNaN(parseInt(string)) && parseInt(string))
    || 
    (!isNaN(parseInt(string.substring(1, string.length-1)))
      && parseInt(string.substring(1, string.length-1)));
}

/** @function colourp
 * @todo this checks for colors?
 * @param {string} string 
 * @returns {string|boolean} 
 * @memberof music-parser
 */
function colourp(string){
  return string.match(/(black|red|blind|0)/) ? string.match(/(black|red|blind|0)/)[0] : false;
}

/** @function nextPart
 * @summary This covers Part, pars and other boundaries in the flow. N.B. The
 * <Part> object represents the tag, not the element (i.e. there is
 * an open at the beginning and a close at the end, and nothing is
 * 'contained')
 * @param {?} partType 
 * @param {?} closes 
 * @param {?} extra 
 * @returns {Part} part
 * @memberof music-parser
 */
function nextPart(partType, closes, extra){
	// This covers Part, pars and other boundaries in the flow. N.B. The
	// <Part> object represents the tag, not the element (i.e. there is
	// an open at the beginning and a close at the end, and nothing is
	// 'contained')
	var thing = new Part();
	//	if(partType!="part")
	thing.type = partType;
	if(closes) {
		// A close tag can't have any other information
		thing.closes=true;
		return thing;
	}
	var oldString = string;
	string = extra;
	// Format information for the text can be added, but only makes
	// sense for single-source transcriptions. If we change our mind
	// about this, and want to allow this info in variants, then the
	// block that follows will need to be wrapped in the one after that.
	var info = consumeIf(/\s*\{[^}v]*\}\s*/);
	if(info) {
		innerInfo = /{([^}]*)}/.exec(info)[1];
		bits = /([^,\s]*)[,\s]*([^,\s]*)[,\s]*(.*)/.exec(innerInfo);
		for(var i=1; i<4; i++){
			if(bits[i].length){
				if(!isNaN(parseInt(bits[i]))){
					// This is positional info (goes with rotation component)
					thing.position = parseInt(bits[i]);
				} else if(bits[i].substring(0,3)==="rot"){
					// The label is rotated
					thing.orientation = bits[i].substring(3);
					if(!thing.position) thing.position = thing.orientation==="90c" ? 12 : 4;
				} else {
					// colour or other presentational material
					thing.style += " "+bits[i];
				}
			}
		}
	}
	extra = string;
	string = oldString;
	// Part names/numbers can be per-source (i.e. for variants), so
	// there may be need for a 'choice' structure
	if(extra){
		if(/{+/.test(extra) || /\*\*/.test(extra)){
			// this is serious - we have full-blown critical apparatus stuff here
			oldString = string;
			string = extra;
			thing.id = getString();
			string = oldString;
		} else if(/\s*"/.test(extra) || extra.indexOf("(om")>-1){
			// variants are present
			var obj = new MChoice();
			obj.subType = "part";
			var bits = extra.match(/[^{} :=]+/g);
			var nextPart = nextPartnameReading(bits, partType, closes, obj);
			bits = nextPart[0];
			while(bits){
				obj.content.push(nextPart[1]);
				nextPart = nextPartnameReading(bits, partType, closes, obj);
				bits = nextPart[0];
			}
			obj.content.push(nextPart[1]);
			return obj;
//			thing.id = extra;
		} else {
			thing.id = extra.trim();
		}
	}
	return thing;
}

/** @function nextPartnameReading
 * 
 * @param {Array} fields 
 * @param {?} partType
 * @param {?} closes 
 * @param {?} choice 
 * @returns {Array} array with reading
 * @memberof music-parser
 */
function nextPartnameReading(fields, partType, closes, choice){
	var part = new Part();
	var om = true;
	part.type = partType;
	if(fields[0].length>1 && fields[0] !== "(om.)"){
		om = false;
	} 
	if(closes) part.closes=true;
	for(var i=1; i<fields.length; i++){
    if(fields[i].charAt(0) === '"' || fields[i].substring(0, 3) === '(om'){
			if(om) {
				return [fields.slice(i), new MOmission(fields.slice(1, i), "om",
																							 false, staffDetailsForWitnesses(fields.slice(1, i)), choice)];
			} else {
				var value = fields[0].match(/[^"]+/)[0];
				part.id = value;
				return [fields.slice(i), new MReading(fields.slice(1, i), [part],
																							false, false, staffDetailsForWitnesses(fields.slice(1, i)), choice)];
			}
		}
	}
	if(om){
		return [false, new MOmission(fields.slice(1), "om",
																 false, false, staffDetailsForWitnesses(fields.slice(1)), choice)];
	} else {
		part.id = fields[0].match(/[^"]+/)[0];
		return [false, new MReading(fields.slice(1), [part],
																false, false, staffDetailsForWitnesses(fields.slice(1)), choice)];
	}
}

/** @function nextInfo
 * @summary handles next info -> things in {}
 * @returns {*}
 * @memberof music-parser
 */
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
        var mens = parseMens(fields[1]);
        if(fields.length>2 && fields[2].charAt(0)==="^") mens.sup = parseMens(fields[2]);
        return mens;
      } else if(fields.length>1){
        return parseMens(fields[1], fields[2]);
      } else {
        return false;
      }
    case "prop":
      if(fields[1] && fields[2] && 
         (fields[1].charAt(0)==='"' || fields[2].charAt(0)==='"' ||
          fields[1].substring(0, 2)==='(o')){
        return parsePropVar(fields.slice(1));
      } else if(fields[1].length==2){
        var prop = parseProp(fields[1], fields[2]);
        return prop;
      } else if(fields.length>1){
        return parseProp(fields[1], fields[2]);
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
        } else if (fields[2].charAt(0)=== '^'){
          //stacked clefs
          var clef = parseClef(fields[1]);
          for(var i=2; i<fields.length; i++){
            clef.stackedClefs.push(parseClef(fields[i].substring(1)));
          }
          return clef;
        } else if(fields[2].charAt(0)==='['){
          var clef = parseClef(fields[1]);
          clef.erroneousClef = parseClef(fields[2]);
          currentExample.staves.pop();
          currentClef = clef;
          return clef;
        }
        return parseClef("C8");
      }
      return parseClef(fields[1]);
    case "staf":
      return parseStaff(fields.slice(fields[1]=="var" ? 2 : 1));
    case "mensural":
    case "plainchant":
      obj = new Notation();
      obj.type = fields[0];
      obj.subtype = fields[1];
      return obj;
    case "newexample":
      obj = new ExampleBreak();
      currentExample.exampleBreaks.push(obj);
      obj.exampleno = exampleno++;
      currentExample.atClass += "/"+obj.exampleno;
      return obj;
    }
  }
  return false;
}    

/** @function nextChoice
 * @summary handles choices
 * @returns {MChoice} choice
 * @memberof music-parser
 */
function nextChoice(){
  return nextChoiceLikeThing(new MChoice(), false);
}

/** @function nextTextChoice
 * @summary handles text choices
 * @returns {MChoice} choice
 * @memberof music-parser
 */
function nextTextChoice(){
  return nextChoiceLikeThing(new MChoice(), true);
}

/** @function nextLigChoice
 * @summary handles choices in ligatures?
 * @param {?} parent 
 * @returns {LigChoice} ligature choice
 * @memberof music-parser
 */
function nextLigChoice(parent){
  var choice = new LigChoice();
  choice.ligature = parent;
  nextChoiceLikeThing(choice, false);
	if(choice.content.length && choice.content[0] && choice.content[0].content && choice.content[0].content.length===1 && choice.content[0].content[0].objType==="SignumCongruentiae"){
		choice.subType = "SignumCongruentiae";
	}
	return choice;
}

/** @function nextObliqueNoteChoice
 * @summary handles choices in oblique notes
 * @param {?} parent 
 * @returns {ObliqueNoteChoice} choice
 * @memberof music-parser
 */
function nextObliqueNoteChoice(parent){
  var choice = new ObliqueNoteChoice();
  choice.ligature = parent.ligature;
  choice.oblique = parent;
	//  return nextChoiceLikeThing(choice, false);
	nextChoiceLikeThing(choice, false);
	var justNotes = true;
	var anyNotes = false;
	var newPrevNote = false;
	for(var i=0; i<choice.content.length; i++){
		newPrevNote = false;
		if(!choice.content[i].content) continue;
		for(var j=0; j<choice.content[i].content.length; j++){
			if(choice.content[i].content[j].objType==="ObliqueNote"){
				anyNotes = true;
				newPrevNote = choice.content[i].content[j]
			} else {
				justNotes = false;
				if(choice.content[i].content[j].objType==="SignumCongruentiae"){
					// console.log("s.c. in a variant in an oblique");
          choice.content[i].content[j].ligature = parent.ligature;
          choice.content[i].content[j].effects = parent.members[parent.members.length-1];
				} else {
					console.log("Unexpected item in oblique ligature area:", choice, choice.content[i].content[j]);
				}
			} 
		}
	}
	if(justNotes) {
		choice.subType = "notes only";
	} else if (!anyNotes){
		choice.subType = "no notes";
	}
	return choice;
}

/** @function nextChoiceLikeThing
 * @summary handles ChoiceLikes
 * @see readChoice in parser.js
 * @param {?} choice 
 * @param {?} textp 
 * @returns {?} choice
 * @memberof music-parser
 */
function nextChoiceLikeThing(choice, textp){
  // cf readChoice in parser.js
  var lDescription, readingString, rDescription, description;
  var witnesses, staffing, agreedVersion, stringTemp;
  var locend = findClose("}", 1);
  var finalString = string.substring(locend+1);
  var clef = currentClef;
  var prevLength = false;
  string = string.substring(5, locend); // 5 because of "{var="
  consumeSpace();
  currentChoice = choice;
  while(string.length && prevLength != string.length){
    if(string.length>15 && book===1&&chapter===3) debug1 = false;
    prevLength = string.length;
    lDescription = consumeDescription();
    readingString = consumeReadingString();
    rDescription = consumeDescription();
    description = lDescription || rDescription;
    witnesses = consumeWitnesses();
    staffing = staffDetailsForWitnesses(witnesses);
    agreedVersion = stavesAgree(staffing);
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
          choice.addReading(witnesses, string, lDescription, rDescription, staffing);
        }
        currentClef = clef;
        break;
      case "om.":
      case "transp.":
      case "transp. and expanded":
        choice.addOmission(witnesses, lDescription, rDescription, staffing);
        break;
      default:
        if(textp){
          choice.addTextReading(witnesses, string, description);
        } else {
          choice.addReading(witnesses, string, lDescription, rDescription, staffing);
          if(currentReading.isDefault) clef = currentClef;
          if(!currentReading.isDefault && currentClef != clef) currentClef = clef;
        }
        currentReading = false;
        break;
    }
    string = stringTemp;
  }
  //currentClef = clef;
  string = finalString;
  currentChoice = false;
  return choice;
}

/** @function nextChoiceLikeThing2
 * @summary based on @see readChoice in parser.js
 * @param {?} choice 
 * @param {?} textp 
 * @returns {?} choice
 * @memberof music-parser
 */
function nextChoiceLikeThing2(choice, textp){
  // Based on readChoice in parser.js
  //var locend = string.indexOf("}");
  var locend = findClose("}", 1);
  var finalString = string.substring(locend+1);
  var readingString, reading, witnesses, quoteloc, braceloc, description, description1, description2, stringTemp, nd, extras;
  var clef = currentClef;
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
    description1 = description;
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
    var staffing = staffDetailsForWitnesses(witnesses);
    var agreedVersion = stavesAgree(staffing);
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
          choice.addReading(witnesses, string, description, false, staffing);
        }
        currentClef = clef;
        break;
      case "om.":
        choice.addOmission(witnesses, description, false, staffing);
        break;
      default:
        if(textp){
          choice.addTextReading(witnesses, string, description);
        } else {
          choice.addReading(witnesses, string, description, false, staffing);
        }
        currentClef = clef;
        break;
    }
    string = stringTemp;
  }
  currentClef = clef;
  string = finalString;
  return choice;
}

/** @function nextMusic
 * Iterates through the string and parses musical events or enriches other events
 * @param {*} parent like reading, ligature, choice
 * @returns {Array} results
 * @memberof music-parser
 */
function nextMusic(parent){
  var results = [];
  var length = false;
  var next, prev, augmented;
  //console.log(parent);
  if(!string.length && hackedString) {
    // This hack counteracts a weird disappearing string in .addReading
    string = hackedString;
  }
  consumeSpace();
  while(string.length >0)
  {
    length = string.length;
    next = nextEvent();
    if(next)
    {
      if(prev)
      {
        prev.next = next;
        next.previous = prev;
      }
      if(next.objType==="SolmizationSignature"
         && results.length && results[results.length-1].objType==="Clef")
      {
        results[results.length-1].solm = next;
      }
      if(parent)
      {
        next = parent.enrichEvent(next, results);
      }
      if(next) 
      {
        if(next.objType=="Dot")
        {
          next.augments = augmented;
        } 
        else if(next.objType=="Fermata")
        {
          next.lengthens = augmented;
        } 
        else if(next.objType==="SignumCongruentiae")
        {
          // console.log(currentChoice, this.events[this.events.length-1]);
          if(currentChoice)
          {
            next.effects = currentChoice;
          } else 
          {
            next.effects = this.events[this.events.length-1];
          }
        } 
        else if (next.objType==="Comment" && this.events.length && 
                   this.events[this.events.length-1].objType==="Ligature")
        {
          var c = new LigatureComment(next);
          currentExample.comments.push(c);
          this.events[this.events.length-1].members.push(c);
          // I think this is necessary because otherwise we get two
          // comments -- a ligature comment and a normal comment
          next = c;
          // prev = next; --- Why was this only in here?! I put 
          // this line down below where next is pushed
          continue;
          //
        } 
        else if(next.objType=="MusicalChoice" && augmented 
                  && next.content.length //&& !next.content[0].nonDefault()
                  && next.content[0].content.length && next.content[0].content[0].objType==="Fermata")
          {
            next.content[0].content[0].lengthens = augmented;
          }
        results.push(next);
        prev = next;
      }
    } 
    else if(length == string.length)
    {
      // We're stuck in a loop. Try to escape
      string = string.substring(1);
    }
    augmented = consumeSpace() ? false : next;
  }
  return results;
}

/** @function getParameters
 * @summary gets the parameters like notation type, mensural signature, solmization, clef and staff
 * @returns {Parameters} parameters to MusicExample
 * @memberof music-parser
 */
function getParameters(){
  var param = new Parameters();
  if(string.indexOf(">") != -1){
    // FIXME: DOOM!
		if(!standaloneEditor){
      // Spec comments are e.g. <example: {full measure}
      // Since there aren't any within <piece>, I'll try to avoid them by excluding colons
      param.spec = consumeIf(/\s*{[^}:]*}\s*/);
      // Let's just hope there aren't any old formats to catch
			/*if(!param.spec){ // old format without braces
				param.spec = consumeIf(/[^,]*);      
			} else {
				param.spec = param.spec.slice(1, -1);
      }*/
      if(param.spec)
      { 
        param.spec = param.spec.slice(1, -1);
        param.specComment = new Comment();
        param.specComment.content = param.spec;
        //    param.specComment.commentStyle = "#A6F";
        currentExample.comments.push(param.specComment);
        consumeIf(/\s*,\s*/); 
      }
      else
      {
        param.specComment = false;
      }
		} else {
			param.specComment = false;
		}
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
