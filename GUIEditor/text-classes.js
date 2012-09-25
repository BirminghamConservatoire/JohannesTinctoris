// Classes for textual content

function Book(){
  this.objType = "Book";
  this.code = "<book>";
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
  this.toText = function(){
    return this.code;
  };
  this.toHTML = function(){
    return false;
  };
}
function Chapter(){
  this.objType = "Chapter";
  this.code = "<chapter>";
  this.chapter = chapter++;
  this.DOMObj = DOMAnchor('chapter', false, false, "ch-"+this.chapter);
  this.toText = function(){
    return this.code;
  };
  this.toHTML = function(){
    return this.DOMObj;
  };
}
function ChapEnd(){
  this.objType = "ChapEnd";
  this.code = "</chapter>";
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
  this.DOMObj = DOMAnchor('section', false, false, false);
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
  this.chapter = chapter++;
  // fixme
  this.DOMObj = false;
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
      this.DOMObj.id = "col"+this.location;
      this.locationHTML();
      this.DOMObj.appendChild(DOMAnchor('column', 'cola'+this.location, false, false));
    }
    return this.DOMObj;
  };
}

function Paragraph(){
  this.objType = "Paragraph";
  this.classes = [];
  this.content = [];
  this.code = false;
  this.n = nodeNo++;
  this.textnodes = [];
  nodes[this.n] = this;
  this.DOMObj = DOMDiv('para', 'node-'+this.n, false);
  this.DOMObjs = [document.createElement('p')];
  this.toText = function(){
    var text = "\n"+this.classesToText();
    for(var i=0; i<this.content.length; i++){
      text += " "+typeof(this.content[i])=="string" ? this.content[i] : (this.content[i].toText ? this.content[i].toText() : "");
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
    var para = this.DOMObjs[0];
    if(this.classes.length>0){
      var str = "";
      for(var i=0; i<this.classes.length; i++){
        if(i>0){
          str+= " ";
        }
        str+= this.classes[i];
      }
      para.className = str;
    } 
    this.DOMObj.appendChild(para);
    for(var i=0; i<this.content.length; i++){
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
        var div = document.createElement('span');
        div.className = "musicexample";
        if(this.content[i].SVG){
          var newSVG = this.content[i].SVG;
          var staffSVG = this.content[i].staffSVG;
        } else {
//          var newSVG = svg(exWidth, this.content[i].height());
          var newSVG = svg(this.content[i].width(), this.content[i].height());
          newSVG.className += " musicexample";
          var staffSVG = newSVG;
          this.content[i].SVG = newSVG;
          this.content[i].staffSVG = staffSVG;
        }
//        div.style.width = exWidth;
        div.style.width = this.content[i].width();
//        div.height = this.content[i].height();
//        newSVG.setAttribute('width', exWidth);
        // alert(newSVG.width.baseVal);
        // newSVG.width = this.content[i].parameters.width();
        // alert(newSVG.width);        
        para.appendChild(div);
        div.appendChild(newSVG);
        div.appendChild(staffSVG);
//        staffSVG.style.position="relative";
//        newSVG.style.position="relative";
//        staffSVG.style.top = 0 - this.content[i].height();
        staffSVG.style.height = this.content[i].height();
//        staffSVG.style.marginBottom = 0 - this.content[i].height();
        examples.push([this.content[i], newSVG]);
      } else {
        var obj = this.content[i].toHTML();
        if(obj) para.appendChild(obj);
      }
    }
    return this.DOMObj;
  };
}

function Annotation(){
  this.objType = "Annotation";
  this.code = false;
  this.domObj = DOMSpan("annotation", false, "‸");//*"
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
  this.toText = function(){
    var text = "<marg";
    if(this.margin || this.side){
      text += ":";
      if(this.margin) text += " "+this.margin;
      if(this.side) text += " ("+this.side+")";
    }
    text += ">";
    // alert(this.content);
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

function Span(){
  this.objType = "Span";
  this.type = false;
  this.code = false;
  this.content = [];
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
  this.toHTML = function(){
    var span = document.createElement('span');
    span.className = this.type;
    for(var i=0; i<this.content.length; i++){
      if(typeof(this.content[i] == 'string') && this.content[i].length > 0){
        span.appendChild(document.createTextNode(this.content[i]));
      } else if(this.content[i]) {
        var dobj = this.content[i].toHTML();
        if(dobj) {
          span.appendChild(dobj);
        }
      }
    }
    return span;
  };
}

function Hand(){
  this.objType = "Hand";
  this.content = [];
  this.id = false;
  this.DOMObj = DOMSpan("hand", false, false);
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

function Add(){
  this.objType = "Add";
  this.code = "";
  this.content = [];
  this.DOMObj = DOMSpan('add', false, false);
  this.toText = function(){
    return "["+this.code+"]";
  };
  this.toHTML = function(){
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
  this.addChar = function(c){
    this.code += c;
    this.content += c;
  };
  this.toText = function(){
    return this.code;
  };
  this.toHTML = function(){
    if(uncapitalise){
      var firstPos = this.code.search(/\S/);
      if(firstPos<0){
        this.DOMObj = document.createTextNode(" ");
        return this.DOMObj; // don't reset uncapitalize;
      } else {
        this.DOMObj = document.createTextNode(this.code.substring(0, firstPos+1).toLowerCase() + this.code.substring(firstPos+1));
      }
    } else {
      this.DOMObj = document.createTextNode(this.code);
    }
    uncapitalize = false;
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

function Punctuation(options){
  this.objType = "Punctuation";
  this.MS = options.charAt(0);
  this.modern = options.charAt(1);
  this.MSDOM = this.MS == " " ? false : document.createTextNode(this.MS);
  this.modernDOM = this.modern == " " ? false : document.createTextNode(this.modern);
  this.toText = function(){
    return "{"+this.MS+this.modern+"}";
  };
  this.toHTML = function(){
    if(punctuationStyle == "modern" && ".?!".indexOf(this.modern)==-1 && this.MS!="¶") {
      uncapitalise = this.modern;
    } else {
      uncapitalise = false;
    }
    return punctuationStyle=="modern" ? this.modernDOM : this.MSDOM;
  };
}

function Choice(){
  this.objType = "Choice";
  this.content = [];
  this.addReading = function(witnesses, content, description){
    this.content.push(new Reading(witnesses, content, description));
  };
  this.addOmission = function(witnesses){
    this.content.push(new Omission(witnesses));
  };
  this.addNilReading = function(witnesses){
    this.content.push(new NilReading(witnesses));
  };
  this.toText = function(){
    var string = "{var=";
    for(var i=0; i<this.content.length; i++){
      if(i>0) string+= " : ";
      string+= this.content[i].toText();
    }
    return string + "}";
  };
  this.toHTML = function(){
    if(!showvariants) {
      if(this.content.length && this.content[0].description != "ins."){
        return this.content[0].contentToHTML();
      } else {
        return false;
      }
    }
    var span = DOMSpan("choice", false, false);
    var el;
    var i = 0;
    var ins = this.content[0].description == "ins.";
    if(!ins) {
      el = this.content[0].contentToHTML();
      if(el){
        span.appendChild(el);
      }
    }
    el = DOMSpan(ins ? "ins variants" : "variants", false, "‸");//*
    span.appendChild(el);
    // $(el).mouseover(function(text){
    //     return function(e){
    //       var tip = Tooltip(text);
    //       tip.style.position = "fixed";
    //       tip.style.top = $(this).offset().top+25;
    //       tip.style.left = $(this).offset().left+10;
    //       tip.style.width = 200;
    //       $(this).parent().addClass("highlight");
    //     };
    //   }(this.footnote(i)));
    // $(el).mouseout(removeTooltip);
    $(span).mouseover(function(text, insertion){
        return function(e){
          var tip = Tooltip(text);
          tip.style.position = "fixed";
          tip.style.top = $(this).offset().top+25+"px";
          tip.style.left = $(this).offset().left+10+"px";
          tip.style.maxWidth = "200px";
          if(!insertion) $(this).addClass("highlight");
        };
      }(this.footnote(i), ins));
    $(span).mouseout(removeTooltip);
    return span;
  };
  this.footnote = function(){
    var span = DOMSpan("variantNote", false, "");
    for(var i=0; i<this.content.length-1; i++){
      span.appendChild(this.content[i].footnote());
      span.appendChild(document.createTextNode(" : "));
    }
    span.appendChild(this.content[i].footnote());
    return span;
  };
}

function Reading(witnesses, content, description){
  this.objType = "Reading";
  this.witnesses = witnesses;
  this.description = description;
  this.content = content;
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
    var span = DOMSpan("variantReading", false, false);
    for(var i=0; i<this.content.length; i++){
      if(typeof(this.content[i] == 'string') && this.content[i].length > 0){
        span.appendChild(document.createTextNode(this.content[i]));
      } else if(this.content[i]) {
        span.appendChild(this.content[i].toHTML());
      }
    }
    return span;
  };
  this.footnote = function(){
    var span = DOMSpan("variantReading", false, this.description ? "("+this.description+") " : false);
    span.appendChild(this.contentToHTML());
    if(this.witnesses[0] == "MSS" || this.witnesses[0] == "emend."){
      span.appendChild(DOMSpan("variantWitnessesSpecial", false, this.witnesses.join(" ")));
    } else {
      span.appendChild(DOMSpan("variantWitnesses", false, this.witnesses.join(" ")));
    }
    return span;
  };
}

function NilReading(witnesses){
  this.objType = "NilReading";
  this.witnesses = witnesses;
  this.toText = function(){
    var text = "(nil)";
    text+= this.witnesses.join(" ");
    return text;
  };
  this.ContentToHTML = function() {
    return false;
  };
  this.footnote = function(){
    var span = DOMSpan("variantReading", false, "(nil) ");
    span.appendChild(DOMSpan("variantWitnesses", false, this.witnesses.join(" ")));
    return span;
  };
}

function Omission(witnesses){
  this.objType = "Omission";
  this.witnesses = witnesses;
  this.toText = function(){
    var text = "(om.)";
    text+= this.witnesses.join(" ");
    return text;
  };
  this.ContentToHTML = function() {
    return false;
  };
  this.footnote = function(){
    var span = DOMSpan("variantReading", false, "(om.) ");
    span.appendChild(DOMSpan("variantWitnesses", false, this.witnesses.join(" ")));
    return span;
  };
}

function Source(id, details){
  this.objType = "SourceSpec";
  //FIXME: stupid
  this.id = id;
  this.details = details;
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

