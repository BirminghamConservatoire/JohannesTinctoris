/**
 * @fileoverview Contains functions dedicated to the Workinput
 * @namespace editor/music/editbase
 */

editorMode = true;
standaloneEditor = true;
wrapWidth = 600;

/** @class
 * @memberof Workinput/editbase
 */
function MusicHolder(text, outdiv){
  /** @property {MusicHolder} */
  this.text = text;
  /** @property {MusicHolder} */
  this.prevWidth = false;
  /** @property {MusicHolder} */
  this.forceredraw = true;
  /** @property {MusicHolder} */
  this.footnotes = [];
  /** @property {MusicHolder} */
  this.example = false;
  /** @property {MusicHolder} */
  this.out = outdiv ? outdiv : document.getElementById('content');
  /** @property {MusicHolder} */
  this.drawTo = this.out;
  /** @property {MusicHolder} */
  this.drawTo.classList.add("drawTo");
  /** @property {MusicHolder} */
  this.entered = false;
  /** @property {MusicHolder} */
  this.shortTitle = false;
  /** @property {MusicHolder} */
  this.checked = false;
  /** @property {MusicHolder} */
  this.approved = false;
  /** @property {MusicHolder} */
  this.translator = false;
  /** @property {MusicHolder} */
  this.contents = [];
  /** @property {MusicHolder} */
  this.copy = false;
  /** @property {MusicHolder} */
  this.source = false;
  /** @property {MusicHolder} */
  this.established = false;
  /** @property {MusicHolder} */
  this.basefile = false;
  /** @property {MusicHolder} */
  this.basefiles = false;
  /** @property {MusicHolder} */
  this.source = false;
  /** @property {MusicHolder} */
  this.title = false;
  /** @property {MusicHolder} */
  this.attribution = false;
  /** @property {MusicHolder} */
  this.sources = [];
  /** @property {MusicHolder} */
  this.running = false;
  /** @property {MusicHolder} */
  this.scriptSpec = false;
  /** @property {MusicHolder} */
  this.script = false;
  /** @property {MusicHolder} */
  this.editor = false;
  /** @property {MusicHolder} */
  this.columns = false;
  /** @property {MusicHolder} */
  this.hands = [];
  /** @property {MusicHolder} */
  this.UUIDs = {};
  /** infoButton
   * @summary infoButtons (qv) presents several buttons for different bits of info.
   */
	this.infoButton = function(){
    // this.infoButtons (qv) presents several buttons for different bits of
    // info. Let's try a less complex approach -- just one button
    var ib = this.drawTo.appendChild(DOMDiv('infoButtons'), false, false);
    infoButton("i", ["editor", "checkedby", "enteredby", "approvedby","dateestablished",
                     "source", "sources", "translator", "copytext","script", "columns", "running"], 
               ib, infoDisplay == "show", "infoDisplay");
  };
  /** infoButton */
  this.infoButtons = function(){
    var ib = this.drawTo.appendChild(DOMDiv('infoButtons'), false, false);
    if(this.editor || this.entered || this.checked || this.approved){
      if(editorDisplay == "show" || editorDisplay == "hide"){
        infoButton("e", ["editor", "checkedby", "enteredby", "approvedby"], ib,
          editorDisplay == "show", "editorDisplay");
      }
    }
    if(this.established){
      if(dateDisplay == "show" || dateDisplay == "hide"){
        infoButton("d", ["dateestablished"], ib,
          dateDisplay == "show", "dateDisplay");
      }
    }
    if(this.source || this.sources.length){
      if(sourceDisplay == "show" || sourceDisplay == "hide"){
        infoButton("s", ["source", "sources"], ib,
          sourceDisplay == "show", "sourceDisplay");
      }
    }
    if(this.copy){
      if(copyTextDisplay == "show" || copyTextDisplay == "hide"){
        infoButton("c", ["copytext"], ib,
        copyTextDisplay == "show", "copyTextDisplay");
      }
    }
    if(this.running){
      if(extraInfoDisplay == "show" || extraInfoDisplay == "hide"){
        infoButton("+", ["script", "columns", "running"], ib,
        copyTextDisplay == "show", "extraInfoDisplay");
      }
    }
  };
  /** writeHeaders to content */
  this.writeHeaders = function(){
    if(this.title && showtitle){
      this.drawTo.appendChild(DOMTextEl("h2", "title", false, this.title));
    }
    if(infoButtons){
      // this.infoButtons();
      this.infoButton();
    }
    if(this.translator){
      this.drawTo.appendChild(fieldDatumPair("Translator", this.translator));
      if(editorDisplay == "hide" || !editorDisplay) $(".info.translator").hide();
    }
    if(this.editor){
      this.drawTo.appendChild(fieldDatumPair("Editor", this.editor));
      if(editorDisplay == "hide" || !editorDisplay) $(".info.editor").hide();
    }
    if(this.entered){
      this.drawTo.appendChild(fieldDatumPair("Entered by", this.entered));
      if(editorDisplay == "hide" || !editorDisplay) $(".info.enteredby").hide();
    }
    if(this.checked){
      this.drawTo.appendChild(fieldDatumPair("Checked by", this.checked));
      if(editorDisplay == "hide" || !editorDisplay) $(".info.checkedby").hide();
    }
    if(this.established){
      this.drawTo.appendChild(fieldDatumPair("Date established", this.established));
      if(dateDisplay == "hide" || !dateDisplay) $(".info.dateestablished").hide();
    }
    if(this.approved){
      this.drawTo.appendChild(fieldDatumPair("Approved by", this.approved));
      if(editorDisplay == "hide" || !editorDisplay) $(".info.approvedby").hide();
    }
    if(this.copy){
      this.drawTo.appendChild(fieldDatumPair("Copy text", this.copy));
      if(copyTextDisplay == "hide" || !copyTextDisplay) $(".info.copytext").hide();
    }
    if(this.source){
      this.drawTo.appendChild(fieldDatumPair("Source", this.source));
      if(sourceDisplay == "hide" || !sourceDisplay) $(".info.source").hide();
    }
    if(this.script){
      this.drawTo.appendChild(fieldDatumPair("Script", this.script));
      if(extraInfoDisplay == "hide" || !extraInfoDisplay) $(".info.script").hide();
    }
    if(this.columns){
      this.drawTo.appendChild(fieldDatumPair("Columns", ""+this.columns));
      if(extraInfoDisplay == "hide" || !extraInfoDisplay) $(".info.columns").hide();
    }
    if(this.running){
      this.drawTo.appendChild(fieldDatumPair("Running", this.running));
      if(extraInfoDisplay == "hide" || !extraInfoDisplay) $(".info.running").hide();
    }
    if(this.sources.length){
      var div = DOMDiv('info sources', false, false);
      div.appendChild(DOMSpan('fieldname', false, "Sources: "));
      for (var i=0; i<this.sources.length; i++){
        div.appendChild(this.sources[i].toHTML());
      }
      this.drawTo.appendChild(div);
      if(sourceDisplay == "hide" || !sourceDisplay) $(".info.sources").hide();
    }
  };
  /** parseHeaders from codeDiv(?) */
  this.parseHeaders = function(){
		// Check if there's either just one line or no textual content
		// before a <piece pseudo-element
    if(!/[\r\n][^\r\n]+/.exec(string) || /^[^a-zA-Z]*<piece/.exec(string)) {
      // Just one line. Assume it's content
			console.log("No header found in ", string);
      return;
    }
		// FIXME: will this be a problem for titles with Colons?
		var title = consumeIf(/[^\r\n:]*[\r\n]/)
    if(title) {
			this.title = trimString(title);
			var attribution = consumeIf(/[^\r\n:]*[\r\n]/)
			if(attribution) this.attribution = trimString(attribution);
		}
    var nextfield=consumeIf(/[^:]*:/);
    while(nextfield){
      switch (nextfield){
        case "Data entry:":
          this.entered = trimString(consumeIf(/[^\r\n]*[\r\n]*/));
          break;
        case "Short-title:":
          this.shortTitle = trimString(consumeIf(/[^\r\n]*[\r\n]*/));
          break;
        case "Checked by:":
          this.checked = trimString(consumeIf(/[^\r\n]*[\r\n]*/));
          break;
        case "Approved by:":
          this.approved = trimString(consumeIf(/[^\r\n]*[\r\n]*/));
          break;
        case "Translator:":
          this.translator = trimString(consumeIf(/[^\r\n]*[\r\n]*/));
          break;
        case "Copy-text:":
          this.basefile = trimString(consumeIf(/[^\r\n]*[\r\n]*/));
          break;
        case "Base file:":
          this.basefile = trimString(consumeIf(/[^\r\n]*[\r\n]*/));
          break;
        case "Base transcription:":
          this.basefile = trimString(consumeIf(/[^\r\n]*[\r\n]*/));
          break;
        case "Base files:":
          this.basefiles = trimString(consumeIf(/[^\r\n]*[\r\n]*/)).split(", ");
          break;
        case "Editor:":
          this.editor = trimString(consumeIf(/[^\r\n]*[\r\n]*/));
          break;
        case "Source:":
          this.source = trimString(consumeIf(/[^\r\n]*[\r\n]*/));
          break;
        case "Script:":
          this.scriptSpec = trimString(consumeIf(/[^\r\n]*[\r\n]*/));
          var colon = this.scriptSpec.indexOf(":");
          var comma = this.scriptSpec.indexOf(",");
          if(comma){
            // We have a column spec
            var columnbit = trimString(this.scriptSpec.substring(comma+1));
            this.script = trimString(this.scriptSpec.substring(colon+1, comma));
            if(columnbit.length){
              this.columns = Number(columnbit.split(/\s+/)[0]);
            }
          } else {
            this.script = trimString(this.scriptSpec.substring(colon+1));
          }
          break;
        case "Running heads:":
          this.running = trimString(consumeIf(/[^\r\n]*[\r\n]*/));
          if(this.running == "[none]"){
            this.running = false;
          }
          break;
        case "Date established:":
          this.established = trimString(consumeIf(/[^\r\n]*[\r\n]*/));
          break;
        case "Sources:":
          consumeSpace();
          var id, details;
          while(string.substring(0,10)!="<treatise>" && string.length
								&& !/^\n\n/.exec(string) && string.substring(0, 6)!="<piece"){
            id = consumeIf(/\S*/);
            consumeSpace();
            details = trimString(consumeIf(/[^\n\r]*/));
            this.sources.push(new Source(id, details));
            if(!/^\n\n/.exec(string)) consumeSpace();
          }
          break;
        default:
          // We've over-reached
          unRead(nextfield);
          return;
      }
      nextfield = consumeIf(/[^:\r\n]*:/);
    }
  };
  /** parse from codediv */
	this.parse = function(){
		// FIXME: Check what these do:
		resetAnnotations();
    resetDebugger();
		string = text;
		this.parseHeaders();
		// This is basically just a holder for a single piece, so let's find it
		var start = string.indexOf("<piece")+7;
		var end = string.indexOf("</piece>");
		if(end<-1) end = this.text.length;
		string = string.substring(start, end);
		try{
			this.example = new MusicExample();
		} catch(x){
			console.log(x.stack);
			console.log("error parsing example", currentExample);
			this.example = currentExample
			return false;
		}
		this.contents = [this.example];
  };
  /** Gets converted MEI and provides MEI links */
	this.toMEI = function(){
		var docObj = this.example.toMEI();
		var old = document.getElementById('MEILink');
		if(old) old.parentNode.removeChild(old);
		this.UUIDs = {};
		var MEIcoded = btoa(docObj.serialize());
		this.example.MEIcoded = MEIcoded;
		var anchor = DOMAnchor('MEI', 'MEILink', 'MEI', "data:application/xml;base64,"+MEIcoded);
		var anchor2 = DOMAnchor('MEI2', 'MEILink', 'verovio', 'viewer.html?mei='+encodeURI(MEIcoded));
		this.example.MEILink = anchor;
		this.example.VerovioLink = anchor2;
		anchor.setAttribute('download', 'editor.mei');
		anchor2.setAttribute('target', 'viewer');
		document.body.appendChild(anchor);
		document.body.appendChild(anchor2);
		return docObj.serialize();
  };
  /** appendStaffDefs */
	this.appendStaffDefs = function(doc, el){
    var group = doc.createElementNS("http://www.music-encoding.org/ns/mei", "staffGrp");
    el.appendChild(group);
    if(this.example.parts && this.example.parts.length){
      for(var i=0; i<this.example.parts.length; i++){
				if(!this.example.parts[i].closes && this.example.parts[i].type==="part") {
					group.appendChild(this.staffDefForPart(this.example.parts[i], i+1, doc));
				}
      }
    } else {
			sd = doc.createElementNS("http://www.music-encoding.org/ns/mei", "staffDef");
			var p = this.example.parameters;
			var c = p.getClef();
			sd.setAttributeNS(null, "n", 1);
			sd.setAttributeNS(null, "lines", (p.staff.lines || 15));
			if(c){
				sd.setAttributeNS(null, "clef.line", (c.staffPos/2) - 1);
				sd.setAttributeNS(null, "clef.shape", (c.type || "C"));
			}
			group.appendChild(sd);
		}
  };
  /** staffDeff for Parts */
  this.staffDefForPart = function(part, n, doc){
    var sd = doc.createElementNS("http://www.music-encoding.org/ns/mei", "staffDef");
    var relevantStaff = part.applicableStaff();
    sd.setAttributeNS(null, "n", n);
    sd.setAttributeNS(null, "lines", relevantStaff.trueLines());
    return sd;
  };
  /** draw */
	this.draw = function(){
		state = "Starting to draw";
		curDoc = this;
		editable=true;
		this.footnotes = [];
		if(!this.forceredraw && this.out.childNodes.length){
			return;
		}
		state = "emptying drawTo (.draw())";
		$(this.drawTo).empty();
		this.drawTo.style.width = wrapWidth+"px";
		this.writeHeaders();
		state = "creating new svg – requires width and height";
		var newSVG = svg(this.example.width(), this.example.height());
		state = "adding SVG to drawTo";
		$(this.drawTo).removeClass("nowrap");
		this.drawTo.appendChild(newSVG);
    newSVG.className += " musicexample dc1";
		this.example.SVG = newSVG;
		state = "drawing";
		this.example.draw(newSVG, true);
		console.log(this.toMEI());
  };
  /** header text */
  this.headerText = function(){
    var text = (this.title ? this.title : "")+"\n";
    if(this.shortTitle) text += "Short-title: "+this.shortTitle+"\n";
    if(this.editor) text += "Editor: "+this.editor+"\n";
    if(this.translator) text += "Translator: "+this.translator+"\n";
    if(this.entered) text += "Data entry: "+this.entered+"\n";
    if(this.checked) text += "Checked by: "+this.checked+"\n";
    if(this.established) text += "Date established: "+this.established+"\n";
    if(this.approved) text += "Approved by: "+this.approved+"\n";
    if(this.copy) text += "Copy-text: "+this.copy+"\n";
    if(this.source) text += "Source: "+this.source+"\n";
    if(this.script || this.columns){
      text += "Script: ";
      if(this.script) text += this.script;
      if(this.columns) text += ", "+this.columns+" column"+(this.columns>1 ? "s" : "") + " per page";
      text += "\n";
    }
    if(this.running) {
      text += "Running heads: "+this.running+"\n";
    } else if(this.source){
      // this isn't a multiple-source edition
      text += "Running heads: [none]\n";
    }
    if(this.sources.length) {
      text += "Sources:\n";
      for(var i=0; i<this.sources.length; i++){
        text += this.sources[i].toText();
      }
    }
    return text;
  };
	this.toText = function(){
		var text = "";
		text += this.headerText();
		return text + this.example.toText();
	};
	this.parse();
}

/** @function 
 * @memberof Workinput/editbase
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
 * @memberof Workinput/editbase
 * @summary edit object */
function editObject (object){
  return function(e){
    object.edit(e);
  };
}

/** @function 
 * @memberof Workinput/editbase
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
 * @memberof Workinput/editbase
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
 * @memberof Workinput/editbase
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
 * @memberof Workinput/editbase
 * @summary grabs DOM objects, currently content div */
function grabdomobjects(){
  domobj['Content'] = document.getElementById("content");
}
