var indent = false;
var centre = false;
var firstTime = true;
var spans = {
  "red": "red",
  "blue": "blue",
  "violet": "violet",
  "gold": "gold",
  "polychrome": "polychrome",
  "redline": "redline",
  "blueline": "blueline",
  "strikethrough": "strikethrough",
  "insertabove": "insertabove",
  "2line": "twoline",
  "3line": "threeline",
  "4line": "fourline",
  "5line": "fiveline",
  "6line": "sixline",
  "title": "treatiseTitle",
  "heading": "heading",
  "subheading": "subheading"};
var reverseSpans = {
  "red": "red",
  "blue": "blue",
  "violet": "violet",
  "gold": "gold",
  "polychrome": "polychrome",
  "redline": "redline",
  "blueline": "blueline",
  "strikethrough": "strikethrough",
  "insertabove": "insertabove",
  "twoline": "2line",
  "threeline": "3line",
  "fourline": "4line",
  "fiveline": "5line",
  "sixline": "6line",
  "treatiseTitle": "title",
  "heading": "heading",
  "subheading": "subheading"};

function findExample(){
  for(var i=0;i<examples.length; i++){
    if(examples[i][0].code == string){
      return examples[i][0];
    }
  }
  return false;
}

function trimString (str){
  if(!str) {
    return false;
  }
  str = str.match(/\S+(?:\s+\S+)*/);
  return str ? str[0] : false;
}
function fieldDatumPair(field, datum){
  var div = DOMDiv('info '+field.toLowerCase().replace(' ', ''), false, false);
  div.appendChild(DOMSpan("fieldname", false, field + ": "));
  div.appendChild(DOMSpan("datum", false, datum));
  return div;
}

function TreatiseDoc(text, outdiv){
  this.text = text;
  this.contents = [];
  this.examples = [];
  this.structures = false;
  this.out = false;
  this.div = outdiv ? outdiv : document.getElementById('content');
  this.title = false;
  this.entered = false;
  this.checked = false;
  this.approved = false;
  this.translator = false;
  this.copy = false;
  this.source = false;
  this.established = false;
  this.sources = [];
  this.running = false;
  this.scriptSpec = false;
  this.script = false;
  this.editor = false;
  this.columns = false;
  this.hands = [];
  this.maxWidth = 0;
  this.setUpInteraction = function(){
    // When we click on a button we lose the selection, so this
    // click-button needs to store the selection information as the
    // pointer approaches it
    $("#buttonbar").mouseenter(function(e){
        range = window.getSelection().getRangeAt(0).cloneRange();
    });
    $(".spanpicker").click(function(e){
      if($(this).hasClass("red")){
        toSpan("red");
      } else if ($(this).hasClass("redline")){
        toSpan("redline");
      } else if ($(this).hasClass("blue")){
        toSpan("blue");
      }
      var code = document.getElementById("code");
      var codeold = code.value;
      var scroll = $(code).scrollTop();
      code.value = doc.toText();
      $(code).scrollTo(scroll);
      // FIXME:
      doc = new TreatiseDoc(code.value);
    });
  };
  this.init = function(){
    if(editable){
      this.setUpInteraction();
    }
    nodeNo=0;
    nodes = [];
    chapter = 0;
    book = 0;
    hands = [];
  };
  this.parseHeaders = function(){
    //FIXME:
    this.title = trimString(consumeIf(/[^\r\n]*[\r\n]/));
    var nextfield=consumeIf(/[^:]*:/);
    while(nextfield){
      switch (nextfield){
        case "Data entry:":
          this.entered = trimString(consumeIf(/[^\r\n]*[\r\n]*/));
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
          this.copy = trimString(consumeIf(/[^\r\n]*[\r\n]*/));
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
          while(string.substring(0,10)!="<treatise>" && string.length){
            id = consumeIf(/\S*/);
            consumeSpace();
            details = trimString(consumeIf(/[^\n\r]*/));
            this.sources.push(new Source(id, details));
            consumeSpace();
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
  this.headerText = function(){
    var text = (this.title ? this.title : "")+"\n";
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
    text += "<treatise>";
    for(var i=0; i<this.contents.length; i++){
      text += this.contents[i].toText();
    }
    return text + "</treatise>";
  };
  this.infoButtons = function(){
    var ib = this.div.appendChild(DOMDiv('infoButtons'), false, false);
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
  };
  this.writeHeaders = function(){
    if(this.title){
      this.div.appendChild(DOMTextEl("h2", "title", false, this.title));
    }
    if(infoButtons){
      this.infoButtons();
    }
    if(this.translator){
      this.div.appendChild(fieldDatumPair("Translator", this.translator));
      if(editorDisplay == "hide" || !editorDisplay) $(".info.translator").hide();
    }
    if(this.editor){
      this.div.appendChild(fieldDatumPair("Editor", this.editor));
      if(editorDisplay == "hide" || !editorDisplay) $(".info.editor").hide();
    }
    if(this.entered){
      this.div.appendChild(fieldDatumPair("Entered by", this.entered));
      if(editorDisplay == "hide" || !editorDisplay) $(".info.enteredby").hide();
    }
    if(this.checked){
      this.div.appendChild(fieldDatumPair("Checked by", this.checked));
      if(editorDisplay == "hide" || !editorDisplay) $(".info.checkedby").hide();
    }
    if(this.established){
      this.div.appendChild(fieldDatumPair("Date established", this.established));
      if(dateDisplay == "hide" || !dateDisplay) $(".info.dateestablished").hide();
    }
    if(this.approved){
      this.div.appendChild(fieldDatumPair("Approved by", this.approved));
      if(editorDisplay == "hide" || !editorDisplay) $(".info.approvedby").hide();
    }
    if(this.copy){
      this.div.appendChild(fieldDatumPair("Copy text", this.copy));
      if(copyTextDisplay == "hide" || !copyTextDisplay) $(".info.copytext").hide();
    }
    if(this.source){
      this.div.appendChild(fieldDatumPair("Source", this.source));
      if(sourceDisplay == "hide" || !sourceDisplay) $(".info.source").hide();
    }
    if(this.script){
      this.div.appendChild(fieldDatumPair("Script", this.script));
    }
    if(this.columns){
      this.div.appendChild(fieldDatumPair("Columns", this.script));
    }
    if(this.running){
      this.div.appendChild(fieldDatumPair("running", this.running));
    }
    if(this.sources.length){
      var div = DOMDiv('info sources', false, false);
      div.appendChild(DOMSpan('fieldname', false, "Sources: "));
      for (var i=0; i<this.sources.length; i++){
        div.appendChild(this.sources[i].toHTML());
      }
      this.div.appendChild(div);
      if(sourceDisplay == "hide" || !sourceDisplay) $(".info.sources").hide();
    }
  };
  this.parse = function (){
    this.init();
    resetAnnotations();
    resetDebugger();
    sources = this.sources;
    complaint = [];
    pointer = 0;
    string = text;
    try {
      this.parseHeaders();
    } catch (x) {
      
    }
    while(string!=""){
      try{
        var para = readPara();
        if(para) this.contents.push(para);      
      } catch (x) {
        var para = new Comment();
        para.contents.push(new Text("Error"));
        this.contents.push(para);
      }
    }
    this.hands = hands;
  };
  this.draw = function(){
    this.div.innerHTML = "";
    this.writeHeaders();
    if(exampleSource) matchExamples(this, exampleSource);
    for(var i=0; i<this.contents.length; i++){
      var domEl = this.contents[i].toHTML();
      if(domEl){
        this.div.appendChild(domEl);
      }
    }
    if(this.columns==2){
      $("p").removeClass("onecolumn");
      $("p").addClass("twocolumn");
    } else {
      $("p").removeClass("twocolumn");
      $("p").addClass("onecolumn");
    }
    this.maxWidth = refreshExamples();
    if(wrapWidth){
      this.div.style.width = Math.max(this.maxWidth+5, wrapWidth)+"px";
    } else {
      //    this.div.style.width = Math.max(this.maxWidth+5, 450)+"px";
    }
    for(var comp=0; comp<complaint.length; comp++){
      writeToDebugger("<p>"+complaint[comp]+"</p>");
    }
    if(editable) {
      $("p").attr("contenteditable", "true");
      $("p").keyup(function(e){
        var anode = window.getSelection().anchorNode;
        var tnode = nodes[Number(this.parentNode.id.substring(5))];
        for(var ci in tnode.content){
          if(tnode.content[ci].DOMObj == anode){
            tnode.content[ci].code = anode.data;
            var code = document.getElementById("code");
            var scroll = $(code).scrollTop();
            code.value = doc.toText();
            $(code).scrollTo(scroll);
            // FIXME:
            doc = new TreatiseDoc(code.value);
          }
        }
      });
    }
  };
  this.parse();
  this.draw();
}

function refreshExamples(){
  var mw = 0;
  for(var i=0; i<examples.length; i++){
    examplei = i;
    try{
      examples[i][0].draw(examples[i][1], nocache);
      mw = Math.max(mw, examples[i][1].width.baseVal.value);
    } catch (x) {
      // FIXME: Log somewhere
    }
  }
  if(firstTime && false){
    window.setTimeout(refreshExamples, 300);
  }
  firstTime = false;
  return mw + 20;
}

function readPara(){
  var para = new Paragraph();
  consumeSpace();
  // FIXME: HACK!!! Broken by anything with an enclosed linebreak
  var end = string.search(/[\n\r\f]/);
  if(end==-1) end = string.length;
  if(end==0) {
    consumeSpace();
    return false;
  }
  var code = string.substring(0, end);
  para.code = code;
  ///////
  para.content = readString();
  if(indent){
    para.classes.push("indent");
  }
  if(centre){
    para.classes.push("centre");
  }
  indent = false;
  centre = false;
  return para;
}

function readString(){
  var content = new Array();
  var fresh = false;
  var latest = false;
  var prevsize = string.length;
  while(string.length > 0){
    latest = last(content);
    switch(string.charAt(0)){
      case "<":
        fresh = readTag();
        if(fresh){
          content.push(fresh);
          // if(fresh.objType == "MusicExample" && fresh.comments.length){
          //   content.push(fresh.commentsDiv());
          // }
        }
        break;
      case "*":
        var comment = consumeIf(/\*\*[^*]*\*\*/);
        if(!comment){
          // treat as normal character
          if(latest && latest.objType == 'text'){
            content[content.length -1].addChar(string.charAt(0));
          } else {
            content.push(new Text(string.charAt(0)));
          }
          consume(1);
        } else if(comment.toLowerCase() == "**indent**"){
          indent = true;
        } else if(comment.toLowerCase() == "**centre**"){
          centre = true;
        } else {
          var ann = new Annotation();
          ann.code=comment.slice(2, -2);
          content.push(ann);
        }
        break;
      case "\n":
      case "\r":
      case "\f":
        consume(1);
        return content;
        break;
      case "[":
        fresh = readLocation();
        if(fresh){
          content.push(fresh);
        }
        break;
      case "{":
        var punc = string.substring(1,3).match(/[,.¶:;\ ]+/);
        if(punc && punc[0] && punc[0].length>1){
          content.push(new Punctuation(punc[0]));
          consumeIf(/\{[,.¶:;\ ]+\}/);
        } else if(consumeIf("{example}")){
          content.push(new BlankExample());
        } else {
          content.push(readChoice());
        }
        break;
      default:
        if(latest && latest.objType == 'text'){
          content[content.length -1].addChar(string.charAt(0));
        } else {
          content.push(new Text(string.charAt(0)));
        }
        consume(1);
        break;
    }
    if(string.length == prevsize){
      if(latest && latest.objType == 'string'){
        content[content.length -1].addChar(string.charAt(0));
      } else {
        content.push(new Text(string.charAt(0)));
      }
      consume(1);
    }
    prevsize = string.length;
  }
  return content;
}  

function readTag(){
  var loc = string.indexOf(">");
  if(loc > 0){
    if(string.substring(1,9) == "treatise"){
      consume(10);
//      FIXME: For now, this is meaningless to me
      return false;
    } else if(string.substring(1,10) == "/treatise"){
      consume(11);
      return false;
    } else if(string.substring(1, 8)=="chapter"){
      // Close tag is meaningless here -- we are always in a chapter
      consume(9);
      return new Chapter();
    }
    // else if(string.substring(1, 8)=="heading"){
    //   consume(9);
    //   return new Heading();
    // } 
    else if (string.substring(1, 5)=="book") {
      // Close tag is meaningless here -- we are always in a book
      consume(6);
      return new Book();
    } else if (string.substring(1, 9)=="prologue") {
      consume(loc+1);
      var chap = new Chapter();
      chap.code = "<prologue>";
      chap.chapter -=1;
      chapter -= 1;
      return chap;
    } else if (string.substring(1, 11)=="conclusion") {
      consume(loc+1);
      var chap = new Chapter();
      chap.code = "<conclusion>";
      chap.chapter -=1;
      chapter -= 1;
      return chap;
    } else if (string.substring(1, 9)=="/chapter") {
      consume(loc+1);
      return new ChapEnd();
    } 
    //   else if (string.substring(1, 9)=="/heading") {
    //   consume(loc+1);
    //   return new HeadEnd();
    // } 
        else if (string.substring(1, 10)=="/prologue") {
      consume(loc+1);
      var chap = new ChapEnd();
      chap.code = "</prologue>";
      return chap;
    } else if (string.substring(1, 12)=="/conclusion") {
      consume(loc+1);
      var chap = new ChapEnd();
      chap.code = "</conclusion>";
      return chap;
    } else if (string.substring(1, 6)=="/book"){
      consume(loc+1);
      return new BookEnd();
    } else if(string.substring(1, 8)=="example"){
      var locend = string.indexOf("</example>");
      if(locend > 0){
        var savedString = string.substring(locend+10);
        var savedPointer = pointer+locend+10;
        string = string.substring(9, locend);
        var me = findExample();
        if(!me){
          try{
            me = new MusicExample();
          } catch (x) {
            return false;
          }
        }
        string = savedString;
        pointer = savedPointer;
        return me;
      } 
    } else if(string.substring(1, 5)=="marg"){
      var end = string.indexOf("</marg>");
      if(end>5){
        var m = new Marginal();
        var tagend = string.indexOf(">");
        var os = string.substring(end+7);
        var op = pointer+end+7;
        if(tagend>5) {
          // we have some useful information
          var colon = string.indexOf(":");
          var lbracket = string.indexOf("(");
          if(lbracket>-1 && lbracket<tagend){
            var rbracket = string.indexOf(")");
            if(rbracket>-1 && rbracket<tagend){
              m.margin = trimString(string.substring(colon+1, lbracket));
              m.side = trimString(string.substring(lbracket+1,rbracket));
            }
          } else {
            m.side = trimstring(string.substring(colon+1, tagend));
          }
        }
        string = string.substring(tagend+1, end);
        m.code = string;
        m.content = readPara();
        string = os;
        pointer = op;
        return m;
      }
      return false;
    } else if(string.substring(1, 8)=="newhand") {
      var end = string.indexOf("</newhand>");
      if(end>-1){
        var id;
        if(string.indexOf("hereafter")>-1 && string.indexOf("hereafter")<loc){
          // This is the first time we've met this hand
          id = trimString(string.substring(string.indexOf("hereafter")+9, loc));
          var description = trimString(string.substring(10,string.indexOf(",")));
          hands[id] = description;
        } else {
          id = trimString(string.substring(10, loc));
        }
        var span = new Hand;
        span.id = id;
        var os = string.substring(end+10);
        var op = pointer +end+10;
        string = string.substring(loc+1, end);
        span.content = readString();
        string = os;
        pointer = op;
        return span;
      } else {
          alert(string);
      }
    } else {
      var tag = string.substring(1, loc);
//      var locend = string.indexOf("</"+tag+">");
      if(tag.charAt(0)=="/") return false;
      var locend = endTagPos(tag);
      var fake = locend == string.length; // Only true if no close
      if(locend>1){
        var content = string.substring(loc+1, locend);
        var span = new Span();
        if (spans[tag]){
          span.type = spans[tag];
        } else {
          span.type = tag;
        }
        var oldstring = string;
        op = pointer;
        string = content;
        span.code = string;
        span.content = readString();
        string = oldstring.substring(fake ? string.length : locend+(tag.length+3));
        pointer = op+locend+(fake ? 0 : tag.length+3);
        return span;
      }
    }
  }
  string = string.substring(1);
  return false;
}

function readLocation(){
  var locend = string.indexOf(']');
  if(locend >1){
    var locstring = string.substring(1, locend);
    consume(locend+1);
    consumeSpace();
    if(chapterp(locstring)){
      return new Chapter();
    } else if(sectionp(locstring)){
      return new Section();
    } else if(columnp(locstring)){
      var chap = new Column();
      chap.location = locstring.substring(1, locstring.length -1);
      return chap;
    } else if(locstring == "-"){
      return new Space();
    } else {
      // Must be editorial
      var add = new Add();
      add.code = locstring;
      add.content.push(locstring);
      return add;
    }
  } else {
    consume(1);
    return false;
  }
}

function readChoice(){
  var locend = string.indexOf("}");
  var finalString = string.substring(locend+1);
  var finalPos = pointer+locend+1;
  var readingString, reading, witnesses, quoteloc, braceloc, description, stringTemp;
  var choice = new Choice();
  var prevLength = string.length; // Obviously wrong, but that's
                                  // deliberate -- we want the loop to
                                  // run at least once
  string = string.substring(5,locend); // 5 beacause "{var="
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
        choice.addReading(witnesses, string ? readString() : [], description);
        break;
      case "om.":
        choice.addOmission(witnesses);
        break;
      default:
        choice.addReading(witnesses, string ? readString() : [], description);
        break;
    }
    string = stringTemp;
  }
  string = finalString;
  pointer = finalPos;
  return choice;
}

function sectionp(tag){
  return false;
//  return tag.match(/\*\*/);
}

function chapterp(tag){
  return false;
  // return tag == "*";
}

function columnp(tag){
  return tag.match(/-[^\[\]]*-/);
}

function resize() {
  if(document.getElementById("vertical")){
    var width = $(document.body).innerWidth();
    var height = $(document.body).innerHeight();
    document.getElementById("code").style.default = "Type (or Paste) code here:";
    document.getElementById("code").style.width = width - exWidth - 100;
    document.getElementById("code").style.height = height - 50;
  }
}
$(function(){
  resize();
  $(window).resize(resize);
  $("#code").dblclick(findLocation);
  $("#rplus").click(function() {resizeEgs(1);});
  $("#rreset").click(resetEgSize);
  $("#rminus").click(egShrink);
  $("#mustextplus").click(function() {resizeEgText(0.2);});
  $("#mustextreset").click(resetEgText);
  $("#mustextminus").click(textShrink);
  $("#musplus").click(function() {resizeEgNotes(20/19);});
  $("#musreset").click(resetEgNotes);
  $("#musminus").click(function() {resizeEgNotes(19/20);});
});

function textShrink(){
  if(textScale>0.2){
    resizeEgText(-0.2);
  }
}

function egShrink(){
  if(rastralSize>1){
    resizeEgs(-1);
  }
}

function resizeEgNotes(d){
  prop = prop * d;
  for(var i=0; i<examples.length; i++){
    examples[i][0].draw(examples[i][1], true);
  }
}
function resetEgNotes(){
  prop = 0.7;
  for(var i=0; i<examples.length; i++){
    examples[i][0].draw(examples[i][1], true);
  }
}

function resizeEgText(d){
  textScale += d;
  for(var i=0; i<examples.length; i++){
    examples[i][0].draw(examples[i][1], true);
  }
}
function resetEgText(){
  textScale = 0.8;
  for(var i=0; i<examples.length; i++){
    examples[i][0].draw(examples[i][1], true);
  }
}

function resizeEgs(d){
  rastralSize += d;
  for(var i=0; i<examples.length; i++){
    examples[i][0].draw(examples[i][1], true);
  }
}

function resetEgSize(){
  rastralSize = 15;
  for(var i=0; i<examples.length; i++){
    examples[i][0].draw(examples[i][1], true);
  }
}

function findLocation(e){
  if (e.altKey){
    var code = document.getElementById('code');
    var loc = document.getElementById('code').selectionStart;
    var modcode = code.value.substring(0, loc);
    var chaps = modcode.match(/(<chapter>|<prologue>|<conclusion>)/g);
    var chap = modcode.lastIndexOf(chaps[chaps.length-1]);
    var pars = modcode.substring(chap).match(/[\r\n]+/g);
    if(pars){
      $("#content").scrollTo($($("#content a.chapter")[chaps.length-1]).parent().parent().nextAll()[pars.length -1], 500);
    } else {
      $("#content").scrollTo($("#content a.chapter")[chaps.length-1], 500);
    }
    $("#content").scrollTo("-=80px", 500);
  }
}

function matchExamples(treatise, text){
  // Search for all references to musicExamples and replace them with real ones
  var examples = 0, eg=false;
  var reg = /<example.*?<\/example>/g;
  var oldstring = string; // Probably unnecessary
  for(var i=0; i<treatise.contents.length; i++){
    if(treatise.contents[i].objType==="Paragraph"){
      // FIXME: This should probably be a properly recursive walk
      for(var j=0; j<treatise.contents[i].content.length; j++){
        if(treatise.contents[i].content[j].objType==="Blank Example"){
          treatise.contents[i].content[j].index = examples;
          examples++;
          eg = reg.exec(text);
          if(eg!==null){
            string = eg[0].substring(9, eg[0].length - 10);
            treatise.contents[i].content[j].musicExample = new MusicExample();
          }
        }
      }
    } else if(treatise.contents[i].objType==="Blank Example"){
      treatise.contents[i].index = examples;
      examples++;
      eg = reg.exec(text);
      if(reg!==null){
        string = eg[0].substring(9, eg[0].length - 10);
        treatise.content[i].musicExample = new MusicExample();
      }
    }
  }
}