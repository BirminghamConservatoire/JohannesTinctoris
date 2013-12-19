// Classes for textual content
//
//  These are:
//    * Book
//    * BookEnd
//    * Prologue
//    * Conclusion
//    * Chapter
//    * ChapEnd
//    * Section
//    * Heading
//    * HeadingEnd
//    * Column
//    * Newline
//    * Paragraph
//    * Annotation
//    * Marginal
//    * Span
//    * Hand
//    * Space
//    * BlankLines
//    * Add
//    * Text
//    * ExampleComments
//    * Punctuation
//    * OptionalSpace
//    * CorrectedM
//    * WordSplit
//    * WordJoin
//    * Choice
//    * Source
//
function Book(){
  this.objType = "Book";
  this.code = "<book>";
  this.book = book++;
  this.next = false;
  this.previous = false;
  chapter = 0;
  section = 0;
  paragraph = 0;
  sentence = 0;
  this.DOMObj = DOMAnchor('book', false, false, false);
  this.toText = function(){
    return this.code;
  };
  this.toHTML = function(){
    return this.DOMObj;
  };
}
function BookEnd(){
  this.objType = "BookEnd";
  this.code = "</book>";
  this.next = false;
  this.previous = false;
  this.toText = function(){
    return this.code;
  };
  this.toHTML = function(){
    return false;
  };
}
function Prologue(){
  this.objType = "Prologue";
  this.code = "<prologue>";
  this.special = false;
  this.chapter = "p";
  this.next = false;
  this.previous = false;
  chapter = "p";
  paragraph = 0;
  section = 0;
  sentence = 0;
  exampleno = 0;
  this.DOMObj = DOMAnchor('chapter', false, false, "ch-prologue");
  this.toText = function(){
    return this.code;
  }
  this.toHTML = function(){
    return this.DOMObj;
  }
}
function Conclusion(){
  this.objType = "Conclusion";
  this.code = "</conclusion>";
  this.special = false;
  this.chapter = "c";
  this.next = false;
  this.previous = false;
  chapter = "c";
  paragraph = 0;
  section = 0;
  sentence = 0;
  exampleno = 0;
  this.DOMObj = DOMAnchor('chapter', false, false, "ch-conclusion");
  this.toText = function(){
    return this.code;
  }
  this.toHTML = function(){
    return this.DOMObj;
  }
}

function Chapter(){
  this.objType = "Chapter";
  this.code = "<chapter>";
  this.special = false;
  this.chapter = (chapter==="p" || chapter==="c" ? (chapter=1) : chapter++);
  this.next = false;
  this.previous = false;
  paragraph = 0;
  section = 0;
  sentence = 0;
  exampleno = 0;
  this.DOMObj = false;
  this.toText = function(){
    return this.code;
  };
  this.toHTML = function(){
    return this.DOMObj = DOMAnchor('chapter', false, false, "ch-"+this.chapter);
  };
}
function ChapEnd(){
  this.objType = "ChapEnd";
  this.code = "</chapter>";
  this.next = false;
  this.previous = false;
  this.toText = function(){
    return this.code;
  };
  this.toHTML = function(){
    return false;
  };
}

function Section(){
  this.objType = "Section";
  this.code = "</section>";
  this.section = section++;
  paragraph = 0;
  sentence = 0;
  this.DOMObj = DOMAnchor('section', false, false, false);
  this.next = false;
  this.previous = false;
  this.toText = function(){
    return this.code;
  };
  this.toHTML = function(){
    return DOMAnchor('section', false, false, false);
  };
}
function Heading(){
  this.objType = "Heading";
  this.code = "<heading>";
  this.chapter = chapter ==="p" || chapter==="c" ? (chapter = 0) : chapter++;
  // fixme
  this.DOMObj = false;
  this.next = false;
  this.previous = false;
  this.toText = function(){
    return this.code;
  };
  this.toHTML = function(){
    // FIXME;
    return false;
  };
}
function HeadEnd(){
  this.objType = "HeadingEnd";
  this.code = "</heading>";
  this.next = false;
  this.previous = false;
  // No matter what the header, a heading is only one sentence
  sentence = 1;
  this.toText = function(){
    return this.code;
  };
  this.toHTML = function(){
    return false;
  };
}

function Column(){
  this.objType = "Column/Page";
  this.code = false;
  this.location = false;
  this.DOMObj = DOMDiv('col', false, false);
  this.next = false;
  this.previous = false;
  this.toText = function(){
    return "[-"+this.location+"-]";
  };
  this.locationHTML = function(){
    // FIXME: not good for all situations 
    var page, folio, column;
    if(/.*[rv]/.test(this.location)){
      // There is foliation (rather than page numbers)
      var folLoc = this.location.search(/[rv]/);
      this.DOMObj.appendChild(DOMSpan("pag", false, this.location.substring(0, folLoc)));
      this.DOMObj.appendChild(DOMSpan("fol", false, this.location.substring(folLoc, folLoc+1)));
      if(folLoc<this.location.length - 1) {
        this.DOMObj.appendChild(DOMSpan("colspec", false, this.location.substring(folLoc+1)));
      }
    } else {
      if(/[a-z]/.test(this.location)){
        var colLoc = this.location.search(/[a-z]/);
        this.DOMObj.appendChild(DOMSpan("pag", false, this.location.substring(0, colLoc)));
        this.DOMObj.appendChild(DOMSpan("colspec", false, this.location.substring(colLoc)));
      } else {
        this.DOMObj.appendChild(DOMSpan("pag", false, this.location));
      }
    }
    return this.DOMObj;
  };
  this.toHTML = function(){
    if (this.location) {
      $(this.DOMObj).empty();
      this.DOMObj.id = "col"+this.location;
      this.locationHTML();
      this.DOMObj.appendChild(DOMAnchor('column', 'cola'+this.location, false, false));
    }
    return this.DOMObj;
  };
}

function Newline(){
  this.objType="Newline";
  this.classes = [];
  this.next = false;
  this.previous = false;
  inVerse++;
  this.toHTML = function(){
    return document.createElement("br");
  }
}

function Paragraph(){
  this.objType = "Paragraph";
  this.classes = [];
  this.content = [];
  this.code = false;
  this.book = book;
  this.chapter = chapter;
  this.section = section;
  this.paragraph = paragraph++;
  this.n = nodeNo++;
  this.textnodes = [];
  this.sentence = sentence;
  this.hang = false;
  nodes[this.n] = this;
  this.DOMObj = DOMDiv('para', 'node-'+this.n, false);
  this.DOMObjs = [document.createElement('p')];
  this.musicOnly = function(){
    var found = false;
    for(var i=0; i<this.content.length; i++){
      if(textualContentp(this.content[i])){
        return false;
      } else if(this.content[i].objType==="MusicExample"){
        found = true;
      }
    }
    return found;
  };
  this.realNext = function(){
    return this.content.length ? this.content[0] 
      : ((curDoc.contents.length>this.n+2) ? curDoc.contents[this.n+1] : false);
  };
  this.realPrevious = function(){
    return this.content.length ? this.content[this.content.length-1] 
      : (this.n===0 ? false : curDoc.contents[this.n-1]);
  };
  this.textualStructures = function(){
    var structures = [];
    var substructure = false;
    for(var i=0; i<this.content.length; i++){
      if(simpleTextualContentp(this.content[i])){
        structures.push(this.content[i]);
      } else if (containsTextualContentp(this.content[i])) {
        var substructure = this.content[i].textualStructures();
        if(substructure && substructure.length) structures = structures.concat(substructure);
      } 
    }
    return structures;
  }
  this.toText = function(){
    var text = "\n"+this.classesToText();
    for(var i=0; i<this.content.length; i++){
      text += typeof(this.content[i])=="string" ? this.content[i] : (this.content[i].toText ? this.content[i].toText() : "");
    }
    return text;
  };
  this.classesToText = function (){
    var text = "";
    for(var i=0; i<this.classes.length; i++){
      if(i>0) text += 0;
      text += "**"+this.classes[i]+"**";
    }
    return text;
  };
  this.toHTML = function(){
    this.DOMObj = DOMDiv('para'+" at-"+this.book+"-"
                         +this.chapter+"-"+this.section+"-"+this.paragraph+" sentencefrom-"
                         +this.sentence,
                         'node-'+this.n, false);
    this.DOMObjs = [document.createElement('p')];
    var para = this.DOMObjs[0];
    // Paragraphs always begin with capitals unsuppressed. Probably.
    uncapitalise = false;
    var i=0;
    var str = (this.hang ? "hang" : "");
    if(this.classes.length>0){
      for(i=0; i<this.classes.length; i++){
        if(i>0){
          // str+= " ";
        }
        str+= this.classes[i];
      }
    }
    para.className = str;
    this.DOMObj.appendChild(para);
    for(i=0; i<this.content.length; i++){
      currenttextparent = this;
      pari = i;
      if(typeof(this.content[i]) == 'string'){
        // NEVER HAPPENS (anymore)
        this.textnodes.push([i, document.createTextNode(this.content[i])]);
        para.appendChild(this.textnodes[this.textnodes.length-1][1]);
      } else if (this.content[i].objType == "Column/Page" || 
                 (typeof(this.content[i].content) != "undefined" && 
                  typeof(this.content[i].content) == "Span" && 
                  this.content[i].content[0].objType == "Column/Page")) {
        var cn = para.className;
        para.className += " colend";
        var breakCaption = this.content[i].toHTML();
        this.DOMObjs.push(breakCaption);
        this.DOMObj.appendChild(breakCaption);
        if(i<this.content.length - 1){
          para = document.createElement('p');
          para.className = cn;
          this.DOMObjs.push(para);
          this.DOMObj.appendChild(para);
        }
      } else if (this.content[i].objType == "MusicExample"){
        var standalone = standalonep(this.content[i], this.content)
        var div = DOMDiv('musicexample dc'+desperatecounter
//                         +(this.content.length == 1 ? " standalone" 
                         +(standalone ? " standalone" : " inline")+" "+this.content[i].atClass,
                         false, false);
        if(margin) this.content[i].marginSpace = true;
        this.content[i].reset();
        if(this.content[i].SVG && false){
          var newSVG = this.content[i].SVG;
        } else {
          var newSVG = svg(this.content[i].width(), this.content[i].height());
          newSVG.className += " musicexample dc"+desperatecounter;
          this.content[i].SVG = newSVG;
        }
        this.content[i].counter = desperatecounter;
        desperatecounter++;
        if(i+1<this.content.length 
           && (this.content[i+1].objType==="text"
               || this.content[i+1].objType==="Punctuation")
           && punctuationp(this.content[i+1])){
          // Don't want line break here
          var span = DOMSpan("nobreak", false, div);
          para.appendChild(span);
          span.appendChild(this.content[i+1].separatePunctuation());
        } else {
          para.appendChild(div);
        }
        div.appendChild(newSVG);
        examples.push([this.content[i], newSVG]);
        if(this.content.length===1) para.className+=" justMusic";
      } else {
        var obj = this.content[i].toHTML();
        if(obj) para.appendChild(obj);
      }
    }
    return this.DOMObj;
  };
  // Paragraph
}

function Annotation(){
  this.objType = "Annotation";
  this.code = false;
//  this.domObj = DOMSpan("annotation", false, "‸");//*"
  this.domObj = DOMSpan("annotation", false, "*");
  this.next = false;
  this.previous = false;
  this.toText = function(){
    return "**"+this.code+"**";
  };
  this.toHTML = function(){
    this.domObj.title = this.code;
    $(this.domObj).mouseover(function(text) {
      return function(e){
        var tip = Tooltip(text);
        this.title = "";
        tip.style.position = "fixed";
        tip.style.top = $(this).offset().top+10+"px";
        tip.style.left = $(this).offset().left+10+"px";
        tip.style.width = 200;
      };
    }(this.code));
    $(this.domObj).mouseout(this.removeTooltip(this.code));
    return this.domObj;
  };
  this.removeTooltip = function(txt){
    return function(){
      removeTooltip();
      this.title = txt;
    };
  };
}

function Marginal(){
  this.objType = "Marginal";
  this.code = false;
  this.content = false;
  this.margin = false;
  this.side = false;
  // this.domObj = DOMSpan("marginal", false, DOMSpan("marginalStar", false, "* "));
  this.domObj = DOMDiv("marginal", false, false);
  this.next = false;
  this.previous = false;
  margins = true;
  this.toText = function(){
    var text = "<marg";
    if(this.margin || this.side){
      text += ":";
      if(this.margin) text += " "+this.margin;
      if(this.side) text += " ("+this.side+")";
    }
    text += ">";
    // for(var i=0; i<this.content.length; i++){
    //   text += " "+typeof(this.content[i])=="string" ? this.content[i] : this.content[i].toText();
    // }
    text += this.content.toText().substring(1);
    return text+"</marg>";
  };
  this.locString = function(){
    var descString = "";
    if(this.margin){
      descString += this.margin;
      if(this.side){
        descString += " ("+this.side+")";
      }
    }
    return descString;
  };
  this.toHTML =function(){
    $(curDoc.drawTo).addClass("marginalia");
    var span = DOMSpan("marginalContent", false, false);
//    this.domObj.style.title = this.locString();
    var p = $($(this.content.toHTML()).children()[0]).contents();
    for(var i=0; i<p.length; i++){
      span.appendChild(p[i]);
    }
    span.appendChild(DOMSpan("marginLoc", false, " ["+this.locString()+"] "));
    this.domObj.appendChild(span);
    return this.domObj;
  };
}

function textualContentp(element){
  switch(element.objType){
    case "Book":
    case "BookEnd":
    case "Prologue":
    case "Conclusion":
    case "Chapter":
    case "ChapEnd":
    case "Section":
    case "Heading":
    case "HeadingEnd":
    case "Column":
    case "Newline":
    case "ExampleComments":
    case "Annotation":
    case "Marginal":
    case "Hand":
    case "SentenceBreak":
    case "MusicExample":
      return false;
    default:
      return true;
  }
}

function simpleTextualContentp(element){
  switch(element.objType){
    case "text":
    case "Punctuation":
      return true;
    default:
      return false;
  }
}
function simpleTextOrContainerp(element){
  return element && (simpleTextualContentp(element) || containsTextualContentp(element));
}
function containsTextualContentp(element){
  switch(element.objType){
    case "Paragraph":
    case "Span":
      return element.contents.some(simpleTextOrContainerp);
    case "Choice":
      return !element.nonDefault && element.content[0].content.some(simpleTextorContainerp);
    default:
      return false;
  }
}

function standalonep(example, array){
  if(example.parameters && example.parameters.spec === "full measure") {
    return true;
  } else if (example.parameters && example.parameters.spec === "in-line") {
    return false;
  } else {
    return array.filter(textualContentp).length <=1;
  }
}

function textBlockToHTML(container, content, block){
  // FIXME: revisit this -- I'm abstracting so that spans, etc can
  // house more complex things, like music examples
  for(var i=0; i<content.length; i++){
    currenttextparent = block;
    pari = i;
    //FIXME: this is nonsense, what is it supposed to do?
    if (content[i].objType == "Column/Page" || 
        (typeof(content[i].content) != "undefined" && 
         typeof(content[i].content) == "Span" && 
         content[i].content[0].objType == "Column/Page")) {
      var cn = container.className;
      container.className += " colend";
      var breakCaption = content[i].toHTML();
      if(block.DOMObjs) block.DOMObjs.push(breakCaption);
      container.appendChild(breakCaption);
      if(i<content.length - 1){
        container = document.createElement('p');
        container.className = cn;
        if(block.DOMObjs) block.DOMObjs.push(para);
        container.appendChild(para);
      }
    } else if (content[i].objType == "MusicExample"){
      var div = DOMDiv('musicexample dc'+desperatecounter
//                         +(content.length == 1 ? " standalone" 
                         +(standalonep(content[i], content) ? " standalone" 
                           : " inline")+" "+content[i].atClass,
          false, false);
      content[i].reset();
      if(content[i].SVG && false){
        var newSVG = content[i].SVG;
      } else {
        var newSVG = svg(content[i].width(), content[i].height());
        newSVG.className += " musicexample dc"+desperatecounter;
        content[i].SVG = newSVG;
      }
      content[i].counter = desperatecounter;
      desperatecounter++;
      if(i+1<content.length 
         && (content[i+1].objType==="text"
             || content[i+1].objType==="Punctuation")
         && punctuationp(content[i+1])){
        // Don't want line break here
        var span = DOMSpan("nobreak", false, div);
        container.appendChild(span);
        span.appendChild(content[i+1].separatePunctuation());
      } else {
        container.appendChild(div);
      }
      if(content.length===1) container.className+=" justMusic";
      div.appendChild(newSVG);
        examples.push([content[i], newSVG]);
    } else {
      var obj = content[i].toHTML();
      if(obj) {
        container.appendChild(obj);
      }
    }
  }
  return container;
}

function Span(){
  this.objType = "Span";
  this.type = false;
  this.code = false;
  this.DOMObj = false;
  this.content = [];
  this.extra = false;
  this.next = false;
  this.previous = false;
  this.realNext = function(){
    return this.content.length ? this.content[0] : this.next;
  };
  this.realPrevious = function(){
    return this.content.length ? this.content[this.content.length-1] : this.previous;
  };
  this.textualStructures = function(){
    var structures = [];
    var substructure = false;
    for(var i=0; i<this.content.length; i++){
      if(simpleTextualContentp(this.content[i])){
        structures.push(this.content[i]);
      } else if (containsTextualContentp(this.content[i])) {
        var substructure = this.content[i].textualStructures();
        if(substructure && substructure.length) structures = structures.concat(substructure);
      } 
    }
    return structures;
  };
  this.toText = function(){
    var text = this.typeToText("open");
    for(var i=0; i<this.content.length; i++){
      // FIXME:
      text += " "+typeof(this.content[i])=="string" ? this.content[i] : (this.content[i].toText ? this.content[i].toText() : "");
    }
    text += this.typeToText("close");
    return text;
  };
  this.typeToText = function(role){
    var text = role=="close" ? "</" : "<";
    text += typeof(reverseSpans[this.type]) == "undefined" ? this.type : reverseSpans[this.type];
    return text + ">";
  };
  this.extraClasses = function(){
    return this.extra ? " span"+this.extra: "";
  }
  this.toHTML = function(){
    var span = document.createElement('span');
    span.className = this.type + this.extraClasses();
    this.DOMObj = textBlockToHTML(span, this.content, this);
    return this.DOMObj;
  };
}

function Hand(){
  this.objType = "Hand";
  this.content = [];
  this.id = false;
  this.DOMObj = DOMSpan("hand", false, false);
  this.next = false;
  this.previous = false;
  this.toText = function(){
    var text = "<newhand";
    if(this.id) {
      text+= ": ";
      if(newhand(this.id)){
        text += hands[this.id] + "hereafter "+this.id;
      } else {
        text += this.id;
      }
    }
    text += ">";
    for(var i=0; i<this.content; i++){
      text += " "+typeof(this.content[i])=="string" ? this.content[i] : this.content[i].toText();
    }
    return text + "</newhand>";
  };
  this.toHTML = function(){
    this.DOMObj.title = this.id + ": " + hands[this.id];
    for(var i=0; i<this.content.length; i++){
      if(typeof(this.content[i] == 'string') && this.content[i].length > 0){
        this.DOMObj.appendChild(document.createTextNode(this.content[i]));
      } else if(this.content[i]) {
        this.DOMObj.appendChild(this.content[i].toHTML());
      }
    }
    return this.DOMObj;
  };
}

function Space(){
  this.objType = "Space";
  this.code = "[-]";
  this.DOMObj = DOMSpan('space', false, " ");
  this.toText = function(){
    return this.code;
  };
  this.toHTML = function(){
    return this.DOMObj;
  };
}
function MicroSpace(){
  this.objType = "MicroSpace";
  this.code = "[.]";
  this.DOMObj = DOMSpan('space micro', false, " ");
  this.toText = function(){
    return this.code;
  };
  this.toHTML = function(){
    return this.DOMObj;
  };
}

function BlankLines(code){
  this.objType = "Blank Lines";
  this.code = code;
  this.next = false;
  this.previous = false;
  this.toText = function(){
    return "["+this.code+"]";
  }
  this.toHTML = function(){
    return DOMSpan('add blank', false, document.createTextNode("["+this.code+"]"));
  }
}

function Add(){
  this.objType = "Add";
  this.code = "";
  this.content = [];
  this.next = false;
  this.previous = false;
  this.DOMObj = DOMSpan('add', false, false);
  this.toText = function(){
    return "["+this.code+"]";
  };
  this.toHTML = function(){
    this.DOMObj.innerHTML = '';
    this.DOMObj.appendChild(document.createTextNode('['));
    for(var i=0; i<this.content.length; i++){
      if(typeof(this.content[i] == 'string') && this.content[i].length > 0){
        this.DOMObj.appendChild(document.createTextNode(this.content[i]));
      } else if(this.content[i]) {
        this.DOMObj.appendChild(this.content[i].toHTML());
      }
    }
    this.DOMObj.appendChild(document.createTextNode(']'));
    return this.DOMObj;
  };
}

function Text(text){
  this.objType = "text";
  this.content = text;
  this.code = text;
  this.DOMObj = false;
  this.overrideCapitalize = false;
  this.removepunct = false;
  this.sentence = (inHeading ? 0 : (inVerse ? inVerse : sentence));
  this.next = false;
  this.previous = false;
  this.punctuation = function(){
    var str = /^\s*[,.:¶?!]/.exec(this.content);
    return str ? true : false;
  }
  this.separatePunctuation = function(){
    this.removepunct = true;
    return document.createTextNode(/^\s*[,.:¶?!]/.exec(this.content)[0].slice(-1));
  };
  this.addChar = function(c){
    this.code += c;
    this.content += c;
  };
  this.toText = function(){
    return this.code;
  };
  this.toHTML = function(){
    var closingSpaces = /\s*$/.exec(this.code)[0].length;
    var spaceAfterPunc = /[,.:¶?!]\s+$/.exec(this.code);
    var textNode = false;
    curtextitem = this;
    if(closingSpaces && trimPreInsSpaces(spaceAfterPunc)) {
      this.code = this.code.slice(0, 0-closingSpaces);
    }
    if(/^\s/.test(this.code) && trimPostInsSpaces(this)){
      this.code = this.code.slice(1);
    }
    if(this.removepunct) this.code = this.code.substring(/^\s*[,.:¶?!]/.exec(this.content)[0].length);
    if(uncapitalise && !this.overrideCapitalize){
      var firstPos = this.code.search(/\S/);
      if(firstPos<0){
        this.DOMObj = document.createTextNode(" ");
        if(!inTip // && !editorMode
          ){
          $(this.DOMObj).hover(function(){displayStatusBarReference(this);});
        }
        return this.DOMObj; // don't reset uncapitalize;
      } else {
        textNode = document.createTextNode(this.code.substring(0, firstPos+1).toLowerCase() + this.code.substring(firstPos+1));
      }
    } else {
      textNode = document.createTextNode(this.code);
    }
    // this.DOMObj = DOMSpan('sentence-'+this.sentence, false, textNode);
    this.DOMObj = DOMSpan('sentence-'+(inVerse ? inVerse : this.sentence), false, textNode);
//    if(!typeof(roman)=="undefined") $(this.DOMObj).hover(function(){displayReference(this, false);});
    if(!inTip // && !editorMode
      ) $(this.DOMObj).hover(function(){displayStatusBarReference(this, false);});
    uncapitalise = false;
    return this.DOMObj;
  };
}

function ExampleComments(comments){
  this.objType = "exampleComments";
  this.comments = comments;
  this.DOMObj = DOMDiv('examplecomments', false, false);
  this.toText = function(){
    return "**"+this.comments+"**";
  };
  this.toHTML = function(){
    for(var i=0; i<this.comments.length; i++){
      this.DOMObj.appendChild(DOMDiv('examplecomment', false, (i+1) +". "+ this.comments[i].content));
    }
    return this.DOMObj;
  };
}

function SentenceBreak(){
  this.objType="SentenceBreak";
  sentence++;
  this.punctuation = function(){
    return true;
  };
  this.toText = function(){
    return "{.}";
  };
  this.toHTML = function(){
    return false;
  }
}

function Punctuation(options){
  this.objType = "Punctuation";
  this.suppressDraw = false;
  this.punctuation = function(o){
    return punctuationStyle==="modern" ? (this.modern ? true : false) : (this.MS ? true : false);};
  this.MS = options.charAt(0);
  this.modern = options.charAt(1);
  this.next = false;
  this.previous = false;
  this.MSDOM = this.MS=== " " ? false : 
    (this.MS==="¶" ? DOMSpan("noitalic pilcrow", false, this.MS) : document.createTextNode(this.MS));
  this.modernDOM = this.modern == " " ? false : document.createTextNode(this.modern);
//  addSentences(options.charAt(1));
  if(/[.?!]/.test(this.modern)) sentence++;
  this.separatePunctuation = function(){
    this.suppressDraw = false;
    var DOMObj = this.toHTML();
    this.suppressDraw = true;
    return DOMObj;
  }
  this.getDOMObj = function(){
    // Caching is an issue. FIXME: for now, disable it
    var refresh = true
    if(refresh){
      if(punctuationStyle==="modern") {
        switch(this.modern){
          case " ":
            this.modernDOM = false;
            break;
          case "¶":
            this.modernDOM = DOMSpan("break", false, DOMEl("br", false, false));
            break;
          default:
            this.modernDOM = document.createTextNode(this.modern);
        }
        return this.modernDOM;
      } else {
        return this.MSDOM = this.MS=== " " ? false : 
          (this.MS==="¶" ? DOMSpan("noitalic pilcrow", false, this.MS) : document.createTextNode(this.MS));
      }
;
    }
    return punctuationStyle=="modern" ? this.modernDOM : this.MSDOM;
  }
  this.toText = function(){
    return "{"+this.MS+this.modern+"}";
  };
  this.toHTML = function(){
    if(this.suppressDraw) return;
    if(punctuationStyle == "modern" && ".?!¶".indexOf(this.modern)==-1 && this.MS!="¶") {
      uncapitalise = this.modern;
    } else {
      uncapitalise = false;
    }
    if(punctuationStyle=="both"){
      var span = DOMSpan("punct", false, DOMSpan("punctbothms", false, this.MS));
      span.appendChild(DOMSpan("punctbothmod", false, this.modern));
      return span;
    }
    return this.getDOMObj();
  };
}
function OptionalSpace(){
  this.objType="Optional Space";
  this.toText = function(){
    return "{ }";
  };
  this.toHTML = function(){
    if(punctuationStyle=="modern"){
      return;
    } else {
      return DOMSpan("punct MSSpace", false, " ");
    }
  };
}
function CorrectedM(){
  this.objType="Corrected M";
  this.toText = function(){
    return "{m}";
  };
  this.toHTML = function(){
    var mbit=DOMSpan("overwritten m", false, "m");
    var parent = DOMSpan("correction m-to-n", false, mbit);
    parent.appendChild(DOMSpan("correct n", false, "n"));
    return parent;
  }
}
function WordSplit(){
  this.objType="Word Split";
  this.toText = function(){ return "{|}"};
  this.toHTML = function(){
    return DOMSpan("wordsplit", false, "|");
  };
}
function WordJoin(){
  this.objType="Word Join";
  this.toText = function(){ return "{_}"};
  this.toHTML = function(){
    return DOMSpan("wordjoin", false, "_");
  };
}
function Choice(){
  this.objType = "Choice";
  this.content = [];
  this.next = false;
  this.previous = false;
  this.addReading = function(witnesses, content, description, extraDescription){
    this.content.push(new Reading(witnesses, content, description, extraDescription));
  };
  this.addOmission = function(witnesses, extraDescription){
    this.content.push(new Omission(witnesses, extraDescription));
  };
  this.addNilReading = function(witnesses){
    this.content.push(new NilReading(witnesses));
  };
  this.nonDefault = function(){
    return this.content.length &&
      (this.content[0].description == "ins." 
       || this.content[0].description == "ins. & del.");
  };
  this.punctuation = function(){
    if(this.nonDefault) {
      return false;
    } else {
      return(this.content[0].content[0].punctuation());
    }
  };
  this.toText = function(){
    var string = "{var=";
    for(var i=0; i<this.content.length; i++){
      if(i>0) string+= " : ";
      string+= this.content[i].toText();
    }
    return string + "}";
  };
  this.textualStructures = function(){
    if(this.nonDefault()){
      return false;
    } else {
      return this.content[0].textualStructures();
    }
  };
  this.toHTML = function(){
    if(!showvariants) {
      if(this.nonDefault()){
        return false;
      } else {
        return this.content[0].contentToHTML();
      }
    }
    var span = DOMSpan("choice", false, false);
    var el;
    var i = 0;
    var ins = this.nonDefault();
    if(!ins) {
      el = this.content[0].contentToHTML();
      if(el){
        span.appendChild(el);
      }
    }
    el = DOMSpan(ins ? "ins variants" : "variants", false, "‸");//*
    span.appendChild(el);
    // if(showvariants)  // Necessary?
    addAnnotation(span, this, "Choice");
    return span;
  };
  this.footnote = function(){
    inTip = true;
    var span = DOMSpan("variantNote", false, "");
    for(var i=0; i<this.content.length-1; i++){
      span.appendChild(this.content[i].footnote());
      span.appendChild(document.createTextNode(" : "));
    }
    span.appendChild(this.content[i].footnote());
    inTip = false;
    return span;
  };
}

function QualifiedWitness(witness, corrected){
  this.objType = "Qualified Witness";
  this.witness = witness;
  this.corrected = corrected;
  this.toHTML = function(){
    var list = DOMSpan("variantWitness", false, this.witness);
    list.appendChild(DOMSpan("correctionem", false, DOMTextEl("sup", false, false, this.corrected ? "c" : "*")));
    return list;
  };
}

function WitnessDescription(information){
  // FIXME: This class is for comments to be appended to
  // witnesses. It's pretty disastrous to have them, since they're
  // semantically pretty meaningless, but we do have them, and, at
  // least for now, their role and scope is fantastically ill
  // defined. Once someone actually defines them and their scope, I
  // can focus this better, but for now, they're basically just
  // strings with a class 
  this.objType = "WitnessDescription";
  this.information = information;
  this.toHTML = function(){
    return DOMSpan("witnessdescription", false, this.information);
  };
}

function Reading(witnesses, content, description, extraDescription){
  this.objType = "Reading";
  this.witnesses = witnesses;
  this.description = description;
  this.extraDescription = extraDescription ? extraDescription : false;
  this.content = content;
  this.next = false;
  this.previous = false;
  this.textualStructures = function(){
    var structures = [];
    var substructure = false;
    for(var i=0; i<this.content.length; i++){
      if(simpleTextualContentp(this.content[i])){
        structures.push(this.content[i]);
      } else if (containsTextualContentp(this.content[i])) {
        var substructure = this.content[i].textualStructures();
        if(substructure && substructure.length) structures = structures.concat(substructure);
      } 
    }
    return structures;
  }
  this.toText = function(){
    var text = "";
    if(this.description) text += "("+this.description+")";
    if(this.content.length) {
      text += '"';
      for(var i=0; i<this.content.length; i++){
        if(typeof(this.content[i])=='string' && this.content[i].length>0){
          text+=this.content[i];
        }else{
          text += this.content[i].toText();
        }
      }
      text += '" ';
    }
    text+= this.witnesses.join(" ");
    return text;
  };
  this.contentToHTML = function(){
    var span = DOMSpan("variantReadingText", false, false);
    for(var i=0; i<this.content.length; i++){
      if(typeof(this.content[i] == 'string') && this.content[i].length > 0){
        span.appendChild(document.createTextNode(this.content[i]));
      } else if(this.content[i]) {
        var obj = this.content[i].toHTML();
        // obj is false if the content[i] shouldn't generate html,
        // i.e. the object is invisible in current view.
        if(obj) span.appendChild(obj);
      }
    }
    return span;
  };
  this.footnote = function(){
    var span = DOMSpan("variantReading", false, 
                       this.description ? 
                       DOMSpan("readingDesc", false, this.description +" ") 
                       : false);
    span.appendChild(this.contentToHTML());
    if(this.extraDescription) {
      span.appendChild(DOMSpan("editorialDescription", false, " "+this.extraDescription));
    }
    if(this.witnesses[0] == "MSS" || this.witnesses[0] == "emend."){
      span.appendChild(DOMSpan("variantWitnessesSpecial", false, witnessList(this)));
    } else {
      span.appendChild(DOMSpan("variantWitnesses", false, witnessList(this)));
    }
    return span;
  };
}

function NilReading(witnesses, lDescription, rDescription){
  this.objType = "NilReading";
  this.witnesses = witnesses;
  this.lDescription = lDescription;
  this.rDescription = rDescription;
  this.next = false;
  this.previous = false;
  this.toText = function(){
    var text = "(nil)";
    text+= this.witnesses.join(" ");
    return text;
  };
  this.textualStructures = function(){
    return false;
  };
  this.ContentToHTML = function() {
    return false;
  };
  this.footnote = function(){
    var span = DOMSpan("variantReading", false, DOMSpan("readingDesc", false, "nil "));
    span.appendChild(DOMSpan("variantWitnesses", false, witnessList(this)));
    return span;
  };
}

function Omission(witnesses, lDescription, rDescription){
  this.objType = "Omission";
  this.witnesses = witnesses;
  this.lDescription = lDescription;
  this.rDescription = rDescription;
  this.textualStructures = function(){
    return false;
  };
  this.toText = function(){
    var text = "("+this.ldescription+")";
    text+= this.witnesses.join(" ");
    return text;
  };
  this.ContentToHTML = function() {
    return false;
  };
  this.footnote = function(){
    var span = DOMSpan("variantReading", false, 
                       DOMSpan("readingDesc", false, this.lDescription+" "));
    span.appendChild(DOMSpan("variantWitnesses", false, witnessList(this)));
    return span;
  };
}

function Source(id, details){
  this.objType = "SourceSpec";
  //FIXME: stupid
  this.id = id;
  this.details = details;
  this.next = false;
  this.previous = false;
  this.toText = function(){
    return this.id+"\t"+this.details+"\n";
  };
  this.toHTML = function(){
    var div = DOMDiv("sourcedescription", false, false);
    div.appendChild(DOMSpan("sourceidentifier", false, this.id));
    div.appendChild(DOMSpan("sourcedetails", false, this.details));
    return div;
  };
}

function BlankExample(){
  this.objType = "Blank Example";
  this.index = false;
  this.musicExample = false;
  this.latinTreatise = false;
  this.next = false;
  this.previous = false;
  this.DOMObj = DOMDiv('musicexample', false, false);
  this.toText = function(){
    return "{example}";
  };
  this.toHTML = function(){
    if(this.musicExample){
      var newSVG;
      this.DOMObj.innerHTML = '';
      // var div = document.createElement('span');
      // div.className = "musicexample";
      if(this.musicExample.SVG){
        newSVG = this.musicExample.SVG;
      } else {
        newSVG = svg(this.musicExample.width(), this.musicExample.height());
        newSVG.className += " musicexample ";
        this.musicExample.SVG = newSVG;
      }
      this.DOMObj.appendChild(newSVG);
      this.DOMObj.className += " "+this.musicExample.atClass;
//      div.appendChild(newSVG);
      examples.push([this.musicExample, newSVG]);
    } else {
      this.DOMObj.innerHTML = '';
      this.DOMObj.appendChild(DOMSpan("red", false, "This example will be added later"));
    }
    return this.DOMObj;
  };
}
