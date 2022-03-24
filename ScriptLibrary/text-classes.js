// Classes for textual content
//
//  These are:
//    * Book
//    * BookEnd
//    * Index
//    * Table
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
//  Classes and methods for diagrams:
//
function Book(){
  this.objType = "Book";
  this.code = "<book>";
  this.book = ++prevBook;
  this.next = false;
  this.previous = false;
  this.n = this.book;
  book = this.book;
  chapter = 0;
  section = 0;
  paragraph = 0;
  sentence = 0;
  this.DOMObj = DOMAnchor('book', false, false, false);
  this.toText = function(){
    return this.code;
  };
  this.toTEI = addSubdivision;
  this.toHTML = function(){
    return this.DOMObj;
  };
}
function BookEnd(){
  this.objType = "BookEnd";
  this.code = "</book>";
  this.next = false;
  this.previous = false;
  book=false;
  this.toText = function(){
    return this.code;
  };
  this.toHTML = function(){
    return false;
  };
}
function Index(){
  this.objType = "Index";
  this.code = "<index>";
  this.special = false;
  this.chapter = "Index";
  this.next = false;
  this.previous = false;
  this.n = "Index";
  chapter = "Index";
  paragraph = 0;
  section = 0;
  sentence = 0;
  exampleno = 0;
  inIndex = true;
  this.toText = function(){ return this.code; };
  this.toTEI = addSubdivision;
  this.toHTML = function(){
    inIndex = true;
    return DOMAnchor('chapter', false, false, "ch-Index");
  };
}

function Table(){
  this.objType = "Table";
  this.classes = [];
  this.rows = [];
  this.columns = false;
  this.code = false;
  this.book = book;
  this.chapter = chapter;
  this.section = section;
  this.paragraph = paragraph;
  this.textnodes = [];
  this.sentence = sentence;
  this.hang = false;
  this.rowCount = function(){
    return this.rows.length;
  };
  this.columnCount = function(){
    var cols = 1;
    for(var i=0; i<this.rows.length; i++){
      if(this.rows[i].objType ==="TableRow"){
        cols = Math.max(cols, this.rows[i].cells.length);
      } 
    }
    return cols;
  };
  this.toText = function(){
    var text = "\n"+this.classesToText();
    for(var i=0; i<this.rows.length; i++){
      text += typeof(this.rows[i])=="string" ? this.rows[i] : (this.rows[i].toText ? this.rows[i].toText() : "");
    }
    return text;
  };
  this.classesToText = function (){
    var text = "";
    for(var i=0; i<this.rows.length; i++){
      if(i>0) text += 0;
      text += "**"+this.rows[i]+"**";
    }
    return text;
  };
  this.columnClass = function(coli){
    if(this.columns && this.columns.length>coli && this.columns[coli]){
      return this.columns[coli];
    }
    return "";
  };
  this.toTEI = makeTEITable;
  this.toHTML = function(){
    this.DOMObj = DOMDiv('tabular'+" at-"+this.book+"-"
                         +this.chapter+"-"+this.section+"-"+this.paragraph+" sentencefrom-"
                         +this.sentence, false, false);
//    this.DOMObjs = [document.createElement('p')];
    // Paragraphs always begin with capitals unsuppressed. Probably.
    uncapitalise = false;
    capitalise = false;
    currentTable = this;
    var i=0;
    var obj;
//    var str = (this.hang ? "hang" : "");
    var className = "";
    if(this.classes.length>0){
      for(i=0; i<this.classes.length; i++){
        if(i>0){
          // str+= " ";
        }
        className+= this.classes[i];
      }
    }
    for(i=0; i<this.rows.length; i++){
      currenttextparent = this;
      pari = i;
      if(typeof(this.rows[i]) == 'string'){
        // NEVER HAPPENS (anymore)
        // this.textnodes.push([i, document.createTextNode(this.rows[i])]);
//        row.appendChild(this.textnodes[this.textnodes.length-1][1]);
        console.log("Well, a string cropped up in a table");
      } else if (this.rows[i].objType == "Column/Page" || 
                 (typeof(this.rows[i].content) != "undefined" && 
                  typeof(this.rows[i].content) == "Span" && 
                  this.rows[i].content[0].objType == "Column/Page")) {
//        this.DOMObj.appendChild(DOMTextEl('p', 'colend', false, false));
        if(obj) obj.className += " colend";
        var breakCaption = this.rows[i].toHTML();
//        this.DOMObjs.push(breakCaption);
        this.DOMObj.appendChild(breakCaption);
      } else if (this.rows[i].objType == "MusicExample"){
        // Never happens... or does it?
        console.log("Music example in table!");
      } else if (this.rows[i].objType==="Choice"){
        if(!showvariants){
          if(this.rows[i].nonDefault()){
            // Accepted version has no row here
            continue;
          } else {
            obj = this.rows[i].content[0].content[0].toHTML();
            this.DOMObj.appendChild(obj);
            obj.className += className;
            continue;
          }
        } else {
          var el;
          var ins = this.rows[i].nonDefault();
          if(ins){
            el = DOMSpan(ins ? "choice ins variants" : "variants", false, "‸");
          } else {
            el = this.rows[i].content[0].content[0].toHTML();
            el.className+=" choice variantReadingText";
          }
          addAnnotation(el, this.rows[i], "Choice");
          this.DOMObj.appendChild(el);
          el.className += className;
        }
      } else {
        // TableRow
        obj = this.rows[i].toHTML();
        this.DOMObj.appendChild(obj);
        obj.className += className;
      }
    }
    currentTable = false;
    return this.DOMObj;
  };
  // Table
}

function TableRow(){
  this.cells = [];
  this.isContinuation = false;
  this.toTEI = function (doc, parent){
    var row = doc.element("row");
    parent.appendChild(row);
    for(var i=0; i<this.cells.length; i++){
      var cell = doc.element("cell");
      row.appendChild(cell);
      if(this.cells[i].toTEI){
        this.cells[i].toTEI(doc, cell);
      }
    }
  };
  this.toHTML = function (){
    var row = DOMDiv("TabularRow"+(this.isContinuation ? " continued" : ""), 
                     false, false);
    var cell = DOMDiv("TabularCell", false, false);
    var table = currentTable;
    for(var i=0; i<this.cells.length; i++){
      cell.className += " "+table.columnClass(i);
      cell.appendChild(this.cells[i].toHTML());
      row.appendChild(cell);
      cell = DOMDiv("TabularCell", false, false);
    }
    return row;
  };
}

function TabularIndex(){
  this.objType = "TabularIndex";
  this.classes = [];
  this.rows = [];
  this.columns = ["l", "r"];
  this.code = false;
  this.book = false;
  this.chapter = "Index";
  this.previous = false;
  chapter = 0;
  section = 0;
  paragraph = 0;
  exampleno=0;
  sentence = 0;
  this.textnodes = [];
  this.hang = false;
  this.toText = function(){
    var text = "\n"+this.classesToText();
    return text;
  };
  this.rowCount = function(){
    return this.rows.length;
  };
  this.columnCount = function(){ return 2; };
  this.toTEI = makeTEITable; // ? enclose within a <div type='index'>?
  this.classesToText = function (){
    var text = "";
    for(var i=0; i<this.classes.length; i++){
      if(i>0) text += 0;
      text += "**"+this.classes[i]+"**";
    }
    return text;
  };
  this.columnClass = function(coli){
    if(this.columns && this.columns.length>coli && this.columns[coli]){
      return this.columns[coli];
    }
    return "";
  };
  this.toHTML = function(){
    inIndex = true;
    currentTable = this;
    this.DOMObj = DOMDiv('tabular index'+" at-"+this.book+"-"
                         +this.chapter+"-"+this.section+"-"+this.paragraph+" sentencefrom-"
                         +this.sentence, false, false);
    this.DOMObj.appendChild(DOMAnchor('chapter', false, false, "ch-Index"));
    // Paragraphs always begin with capitals unsuppressed. Probably.
    uncapitalise = false;
    var i=0;
    var obj;
//    var str = (this.hang ? "hang" : "");
    var className = "";
    if(this.classes.length>0){
      for(i=0; i<this.classes.length; i++){
        if(i>0){
          // str+= " ";
        }
        className+= this.classes[i];
      }
    }
    for(i=0; i<this.rows.length; i++){
      currenttextparent = this;
      pari = i;
      if(typeof(this.rows[i]) == 'string'){
        // NEVER HAPPENS (anymore)
        console.log("Well, a string cropped up in a table");
      } else if (this.rows[i].objType == "Column/Page" || 
                 (typeof(this.rows[i].content) != "undefined" && 
                  typeof(this.rows[i].content) == "Span" && 
                  this.rows[i].content[0].objType == "Column/Page")) {
        if(obj) obj.className += " colend";
        var breakCaption = this.rows[i].toHTML();
        this.DOMObj.appendChild(breakCaption);
      } else if (this.rows[i].objType == "MusicExample"){
        // Never happens... or does it?
        console.log("Music example in table!");
      } else {
        // TableRow
        obj = this.rows[i].toHTML();
        this.DOMObj.appendChild(obj);
        obj.className += className;
      }
    }
    inIndex = false;
    currentTable = false;
    return this.DOMObj;
  };
  // Table
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
  this.n = "prologue";
  this.DOMObj = DOMAnchor('chapter', false, false, "ch-prologue");
  this.toTEI = addSubdivision;
  this.toText = function(){
    return this.code;
  }
  this.toHTML = function(){
    return this.DOMObj;
  }
}
function Conclusion(){
  this.objType = "Conclusion";
  this.code = "<conclusion>";
  this.special = false;
  this.chapter = "c";
  this.next = false;
  this.previous = false;
  this.n = "conclusion";
  chapter = "c";
  paragraph = 0;
  section = 0;
  sentence = 0;
  exampleno = 0;
  this.toTEI = addSubdivision;
  this.DOMObj = DOMAnchor('chapter', false, false, "ch-conclusion");
  this.toText = function(){
    return this.code;
  };
  this.toHTML = function(){
    return this.DOMObj;
  };
}
function Explicit(){
  this.objType = "Explicit";
  this.code = "<explicit>";
  this.special = false;
  this.chapter = "e";
  this.next = false;
  this.previous = false;
  this.n = "explicit";
  chapter = "e";
  paragraph = 0;
  section = 0;
  sentence = 0;
  exampleno = 0;
  this.toTEI = addSubdivision;
  this.DOMObj = DOMAnchor('chapter', false, false, "ch-explicit");
  this.toText = function(){
    return this.code;
  };
  this.toHTML = function(){
    return this.DOMObj;
  };
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
  this.n = this.chapter;
  this.DOMObj = false;
  this.toText = function(){
    return this.code;
  };
  this.toTEI = addSubdivision;
  this.toHTML = function(){
    return this.DOMObj = DOMAnchor('chapter', false, false, "ch-"+this.chapter);
  };
}
function ChapEnd(){
  this.objType = "ChapEnd";
  this.code = "</chapter>";
  this.next = false;
  this.previous = false;
  inIndex = false;
  this.toText = function(){
    return this.code;
  };
  this.toHTML = function(){
    inIndex = false;
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
  this.toTEI = addSubdivision;
  this.n = this.section;
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
  this.toTEI = function(doc, parent){
//    console.log("head");
    el = document.createElement("head");
    if(!parent) parent = doc.currentParent;
    doc.prevParent = doc.currentParent;
    parent.appendChild(el);
    doc.currentParent = el;
    console.log("heading");
    return el;
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
  this.toTEI = function(doc, parent){
    el = doc.currentParent;
    if(doc.prevParent){
      doc.currentParent = doc.prevParent;
    };
    return el;
  };
  this.toHTML = function(){
    return false;
  };
}

function Column(){
  this.objType = "Column/Page";
  this.code = false;
  this.location = false;
  this.DOMObj = DOMDiv('col breaker', false, false);
  this.next = false;
  this.previous = false;
  this.doc = false;
  this.top = false;
  this.height = false;
  this.startPos = false;
  this.endPos = false;
  this.nextStart = false;
  this.catchWord = curCatchword;
  curCatchword = false;
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
  this.side = function(){
    return /^[A-Z]*[0-9]*[rv]?/.exec(this.location)[0];
  };
  this.xProp = breakerxProp;
  this.margins = breakerMargins;
  this.twoCols = breakerTwoCols;
  this.toTEI = function (doc, parent){
    if(!parent) parent = doc.currentParent;
    var el;
    if(/^[A-Z]?[0-9]*(([rv][b-z])|[b-qs-uw-z])$/.exec(this.location)) {
      // This is a column break without a page break
      el = doc.element("cb");
      el.setAttribute("n", this.location[this.location.length-1]);
      parent.appendChild(el);
    } else if(/^[A-Z]?[0-9]*[rv]?a$/.exec(this.location)){
      // This is a page break in a multi-column
      // layout. http://menota.org says both <pb> & <cb> are needed
      el = doc.element("pb");
      el.setAttribute("n", this.location.substring(0, this.location.length-1));
      parent.appendChild(el);
      el = doc.element("cb");
      el.setAttribute("n", "a");
      parent.appendChild(el);      
    } else {
      // This is a page break in a single-column source
      el = doc.element("pb");
      el.setAttribute("n", this.location);
      parent.appendChild(el);
    }
  };
  this.imageFilename = imageFilenameForBreaker;
  this.thumbFilename = thumbFilenameForBreaker;
  this.toHTML = function(){
    this.doc = curDoc;
    if(this.location) {
      curDoc.breaks.push(this);
      this.DOMObj = DOMDiv('col breaker', false, false);
//      $(this.DOMObj).empty();
      this.DOMObj.id = "col"+this.location;
      //this.locationHTML();
      // describeBreak(this.DOMObj, this.location);
      // var anchor = DOMAnchor('column', 'cola'+this.location, false, false);
      // this.DOMObj.appendChild(DOMAnchor('column', 'cola'+this.location, false, false));
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
  this.toTEI = function (doc, parent){
    if(!parent) parent = doc.currentParent;
    var el = doc.element("lb");
    parent.appendChild(el);
  };
  this.toHTML = function(){
    return document.createElement("br");
  };
}

function Paragraph(suppressNodeNumbers){
  this.objType = "Paragraph";
  this.classes = [];
  this.content = [];
  this.code = false;
  this.book = book;
  this.chapter = chapter;
  this.section = section;
  this.paragraph = paragraph++;
  this.numberNodes = !suppressNodeNumbers;
  this.n = suppressNodeNumbers ? nodeNo : nodeNo++;
  this.textnodes = [];
  this.sentence = sentence;
  this.hang = false;
  if (!suppressNodeNumbers) nodes[this.n] = this;
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
        substructure = this.content[i].textualStructures();
        if(substructure && substructure.length) structures = structures.concat(substructure);
      } 
    }
    return structures;
  };
  this.toTEI = function(doc, parent, headless){
    var tp = this.content.filter(textualContentp);
    var el;
    if(!parent) parent=(doc.currentParent || doc.body);
    if(tp.length===0){
      // There's no text here. Possibly music example.
      for(var i=0; i<this.content.length; i++){
        if(this.content[i].toTEI) {
          // FIXME!!
          //this.content[i].toTEI(doc, parent);
          return this.content[i].toTEI(doc, parent);
        }
      }      
    } else
       if(headless ||
              (tp.length===1 
               && tp[0].objType==="Span"
               && (tp[0].type==="heading" 
                   || tp[0].type==="treatiseTitle"))){
      // Title, so no p
      return this.content[0].toTEI(doc, parent);
    }  else if ((tp.length===1 
                 && tp[0].objType==="Span"
                 && (tp[0].type==="incipit"
                     || tp[0].type==="explicit"))
                || doc.hasParaParent(parent)){
        el = doc.element("seg");
        el.setAttribute("type", tp[0].type);
        parent.appendChild(el);
        tp[0].toTEI(doc, el);
        return el;
    } else {
      if(this.content.length===1 && this.content[0].objType==="Span" 
         && this.content[0].type==="verse"){
        el = this.content[0].toTEI(doc, el);
      } else {
        el = doc.element("p");
        var elo = el;
        if(!parent) console.log(doc, parent);
        parent.appendChild(el);
        for(var i=0; i<this.content.length; i++){
          if(this.content[i].toTEI) this.content[i].toTEI(doc, el);
          if(el!==elo) console.log(el, elo, this.content[i]);
        }
      }
      el.setAttribute("n", this.paragraph);
      return el;
    }
  };
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
                         this.numberNodes ? 'node-'+this.n : false, false);
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
    if(inIndex) str += " IndexLine";
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
        if(this.content.length===1) para.className += " columnPara";
        var breakCaption = this.content[i].toHTML();
        this.DOMObjs.push(breakCaption);
        this.DOMObj.appendChild(breakCaption);
        if(i<this.content.length - 1){
          para = document.createElement('p');
          para.className = cn;
          this.DOMObjs.push(para);
          this.DOMObj.appendChild(para);
        }
      } else if (this.content[i].objType==="MusicExample"){
        if(i && this.content[i-1].objType==="Marginal"){
          $(this.content[i-1].domObj).children(".marginalContent").addClass("premusical");
        }
        var standalone = standalonep(this.content[i], this.content);
        var div = DOMDiv('musicexample dc'+desperatecounter
//                         +(this.content.length == 1 ? " standalone" 
                         +(standalone ? " standalone" : " inline")+" "+this.content[i].atClass,
                         false, false);
        if(margin) this.content[i].marginSpace = true;
        this.content[i].reset();
				if(MEILinks && standalone){
					try {
						var anchor = DOMAnchor('MEI', 'link-ex'+this.counter, 'MEI', URL.createObjectURL(this.content[i].toMEI().blobify()));
						anchor.setAttributeNS(null, 'download', (curDoc.shortTitle || curDoc.title).replace(/\s+/, '-') + '--' + roman(this.book).toUpperCase()+'-'+roman(this.chapter)+'-'+'ex'+(this.content[i].exampleno+1)+'.mei');
						para.appendChild(anchor);
					}
					catch(e){
						console.log(e);
					}
				}
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
               || this.content[i+1].objType==="Span"
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
      } else if(this.content[i].objType==="SVGTable") {
        var obj = svg(1000,1000);
        para.appendChild(obj);
        this.content[i].toHTML(obj);
      } else {
        var obj = this.content[i].toHTML();
        if(obj) para.appendChild(obj);
      }
    }
    if(inIndex) this.DOMObj.className = this.DOMObj.className+" indexLine";
    return this.DOMObj;
  };
  // Paragraph
}

function NoCount(){
  this.objType = "Non Counting";
  noCount = this;
  this.chapter = chapter;
  this.book = book;
  this.section = section;
  this.sentence = sentence;
  this.toText = function(){ return "<nocount>";};
  this.toHTML = function(){
    noCount = this;
    return false;
  };
}
function EndNoCount(){
  this.objType = "Non Counting - ends";
  this.noCount = noCount;
  chapter = this.noCount.chapter;
  book = this.noCount.book;
  section = this.noCount.section;
  sentence = this.noCount.sentence;
  noCount = false;
  this.toText = function(){ return "<nocount>";};
  this.toHTML = function(){
    noCount = false;
    return false;
  };
}

function Annotation(){
  // N.B. classes.js adds methods to this prototype for musical annotations
  this.objType = "Annotation";
  this.code = false;
//  this.domObj = DOMSpan("annotation", false, "‸");//*"
  this.domObj = DOMSpan("annotation", false, "*");
  this.contents = [];
  this.next = false;
  this.previous = false;
  this.startY = false;
  this.startX = false;
  this.classList = (currentExample && currentExample.classes) ? currentExample.classes.classes.slice(0) : [];
  this.toText = function(){
    return "**"+this.code+"**";
  };
  this.toTEI = function(doc, parent){
    if(!parent) parent = (doc.parentNode || doc.body);
    var el = doc.element("note");
    el.setAttribute("type", "editorial");
    el.setAttribute("resp", "#ed");
    parent.appendChild(el);
    el.appendChild(doc.text(this.code));
  };
  this.footnote = function(){
    var obj = DOMSpan(false, false, false);
    for (var i=0; i<this.contents.length; i++){
      obj.appendChild(this.contents[i].toHTML());
    }
    return obj;
  };
  this.toHTML = function(){
    //addAnnotation(this.domObj, this.code, "Annotation");
    var ouc = uncapitalise;
    var oc = capitalise;
    uncapitalise = false;
    capitalise = false;
    addAnnotation(this.domObj, this, "Annotation");
    uncapitalise=ouc;
    capitalise = oc;
    return this.domObj;
    // this.domObj.title = this.code;
    // $(this.domObj).mouseover(function(text) {
    //   return function(e){
    //     var tip = Tooltip(text);
    //     this.title = "";
    //     tip.style.position = "fixed";
    //     tip.style.top = $(this).offset().top+10+"px";
    //     tip.style.left = $(this).offset().left+10+"px";
    //     tip.style.width = 200;
    //   };
    // }(this.code));
    // $(this.domObj).mouseout(this.removeTooltip(this.code));
    // return this.domObj;
  };
  this.removeTooltip = function(txt){
    return function(){
      removeTooltip();
      this.title = txt;
    };
  };
}

function RightStop(){
  this.objType = "Right Tab Stop";
  this.code = false;
  this.content = false;
  this.domObj = DOMSpan("right-stop", false, false);
  this.next = false;
  this.previous = false;
  this.toText = function(){
    return "\t"+this.content.toText();
  };
  this.toHTML = function(){
    var span = DOMSpan("right-aligned", false, false);
    var p = $($(this.content.toHTML()).children()[0]).contents();
    for(var i=0; i<p.length; i++){
      span.appendChild(p[i]);
    }
    this.domObj.appendChild(span);
    return this.domObj;    
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
  this.locObject = function(parent){
    parent.appendChild(document.createTextNode("["+this.margin
                                               +(this.side ? "" : "]")));
    if(this.side){
      parent.appendChild(document.createElement("wbr"));
      parent.appendChild(document.createTextNode("("+this.side+")"+"]"));
    }
    return parent;
  };
  this.locString = function(){
    var descString = "";
    if(this.margin){
      descString += this.margin.replace(" ", " ");
      if(this.side){
        descString += " ("+this.side+")";
      }
    }
    return descString;
  };
  this.toTEI = function(doc, parent){
    // Closest I can see is <note place="margin">
    if(!parent) parent = (doc.parentNode || doc.body);
    var el = doc.element("note");
    el.setAttribute("place", "margin");
    parent.appendChild(el);
    var el2 = doc.element("desc"); // Is this right?
    el2.appendChild(doc.text(this.locString()));
    el.appendChild(el2);
    if(this.content.toTEI) this.content.toTEI(doc, el, true);
    return el;
  };
  this.toHTML =function(){
    $(curDoc.drawTo).addClass("marginalia");
    var span = DOMSpan("marginalContent", false, false);
    $(currenttextparent.DOMObj.lastElementChild).addClass("addTopSpaceForMarginal");
//    span.appendChild(this.locObject(DOMSpan("marginLoc", false, "")));
    span.appendChild(DOMSpan("marginLoc", false, "["+this.locString()+"]"));
//    this.domObj.style.title = this.locString();
    var p = $($(this.content.toHTML()).children()[0]).contents();
    for(var i=0; i<p.length; i++){
      span.appendChild(p[i]);
    }
    // span.appendChild(DOMSpan("marginLoc", false, " ["+this.locString()+"] "));
    this.domObj.appendChild(span);
    curDoc.marginals.push([this, span]);
    return this.domObj;
  };
}

function Catchword(){
  this.objType = "Catchword";
  this.tag = "catchword";
  this.code = false;
  this.content = false;
  this.position = false;
  this.domObj = DOMDiv("catchword marginal", false, false);
  this.next = false;
  this.previous = false;
  this.yOffset = false;
  this.example = false;
  curCatchword = this;
  margins = true;
  this.toText = function(){
    // FIXME:
    return "";
  };
  this.footnote = function(){
    return DOMSpan("catchwordpos", false, this.position);
  };
  this.width = function(){ return 0;}; // Just for music example
  this.toTEI = function(doc, parent){
    // Closest I can see is <note place="margin">
    if(!parent) parent = (doc.parentNode || doc.body);
    var el = doc.element("note");
    el.setAttribute("place", "margin");
    el.setAttribute("type", this.tag);
    parent.appendChild(el);
    var el2 = doc.element("desc"); // Is this right?
    el2.appendChild(doc.text(this.position));
    el.appendChild(el2);
    if(this.content.toTEI) this.content.toTEI(doc, el);
    return el;
  };  
  this.toHTML =function(){
    $(curDoc.drawTo).addClass("marginalia");
    var span = DOMSpan("marginalContent catchword", false, false);
    if(this.example) $(span).addClass("musical");
//    this.domObj.style.title = this.locString();
    var p = $($(this.content.toHTML()).children()[0]).contents();
    for(var i=0; i<p.length; i++){
      span.appendChild(p[i]);
    }
    span.appendChild(DOMSpan(this.tag+" marginLoc", false, " ["+this.tag+"] "));
//    addAnnotation(span, this, "catchword");
    $(this.domObj).empty();
    this.domObj.appendChild(span);
    $(span).mouseover(function(text) {
      return function(e){
        var tip = Tooltip(text);
        this.title = "";
        tip.style.position = "fixed";
        tip.style.top = $(this).offset().top+15+"px";
        tip.style.left = this.getBoundingClientRect().right-100+"px";
        tip.style.maxWidth = 300 +"px";
      };
    }(this.position));
    $(span).mouseout(this.removeTooltip(this.code));
    return this.domObj;
  };
  this.removeTooltip = function(txt){
    return function(){
      removeTooltip();
      this.title = txt;
    };
  };
  this.draw = function(){
    // This is for a catchword in a music example
    this.example = currentExample;
    this.yOffset = cury;
    currentExample.catchwords.push(this);
  };
}

function textualContentp(element){
  switch(element.objType){
    case "Book":
    case "BookEnd":
    case "Prologue":
    case "Index":
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
//    case "Hand":
    case "SentenceBreak":
    case "MusicExample":
    case "Blank Lines":
      return false;
    case "Text":
      return element.code.length && /\S/.test(element.code);
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
  if(example.parameters && 
     (example.parameters.spec === "full measure"||
      example.parameters.spec === "column measure")) {
    return true;
  } else if (example.parameters && example.parameters.spec === "in-line") {
    return false;
  } else {
    return array.filter(textualContentp).length <=1 || exampleFollowsCol(example, array);
  }
}

function maybeNewSentenceCheck(contentSoFar){
  // If there is an inline music example, followed by whitespace or
  // nothing, following text is a new sentence iff the text (or the
  // editorially favoured reading of it) begins
  // with a capital.
  // This function simply checks contentSoFar to see if it ends with
  // an inline music example and (optionally) whitespace.
  for(var i=contentSoFar.length-1; i>=0; i--){
    if(contentSoFar[i].objType==="MusicExample" 
       && contentSoFar[i].parameters.spec==="in-line"){
      return true;
    } else if(contentSoFar[i].objType==="text" && /^\s*$/.exec(contentSoFar[i].content)){
      continue;
    } else {
      return false;
    }
  }
  return false;
}

function exampleFollowsCol(example, array){
  // If there is no text between column/page break and example, this
  // should be treated as standalone
  var pos = array.indexOf(example);
  for(var i=pos-1; i>=0; i--){
    if(textualContentp(array[i])) return false;
    if(array[i].objType==="Column") {
      return true;
    }
  }
  return false;
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
        newContainer = document.createElement(container.nodeName);
        newContainer.className = cn;
        if(block.DOMObjs) block.DOMObjs.push(newContainer);
        container.appendChild(newContainer);
//        container = newContainer;
      }
    } else if (content[i].objType == "MusicExample"){
      if(i && content[i-1].objType==="Marginal"){
        $(content[i-1].domObj).children(".marginalContent").addClass("premusical");
      }
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
  this.endsWithPilcrow = false;
  this.realNext = function(){
    return this.content.length ? this.content[0] : this.next;
  };
  this.realPrevious = function(){
    return this.content.length ? this.content[this.content.length-1] : this.previous;
  };
  this.punctuation = function(){
    var str = /^\s*[,.:¶?!]/.exec(this.content);
    return str ? true : false;
  };
  this.textualStructures = function(){
    var structures = [];
    var substructure = false;
    for(var i=0; i<this.content.length; i++){
      if(simpleTextualContentp(this.content[i])){
        structures.push(this.content[i]);
      } else if (containsTextualContentp(this.content[i])) {
        substructure = this.content[i].textualStructures();
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
  };
  this.toTEI = function(doc, parent){
    if(!parent) parent=(doc.currentParent || doc.body);
    var el;
    switch (this.type){
      case "heading":
      case "treatiseTitle":
        el = doc.element("head");
        el.setAttribute("type", this.type);
        break;
      case "twoline":
      case "threeline":
      case "fourline":
      case "fiveline":
      case "sixline":
      case "sevenline":
        el = doc.element("hi");
        el.setAttribute("rend", "Drop-caps("
                        +this.type+")");
        break;
      case "polychrome":
      case "redline":
      case "blueline":
      case "yellowline":
      case "underscore":
        el = doc.element("hi");
        el.setAttribute("rend", "Highlight("+this.type+")");
        break;
      case "red":
      case "blue":
      case "violet":
      case "gold":
        el = doc.element("hi");
        el.setAttribute("rend", "Ink("+this.type+")");
        break;
      case "citation":
        el = doc.element("ref");
        break;
      case "subheading":
        // Is there really no more sensible way to indicate a
        // non-structural heading? If I make this structural (using
        // div), then the parent structure has to be fully divided --
        // I can't put a mixture of p's and div's in.
        el = doc.element("hi");
        el.setAttribute("rend", "Subheading");
        break;
      case "verse":
        // Very special case -- lines have to be enclosed
//        el = doc.element("div");
        el = doc.element("lg");
        el.setAttribute("type", "verse");
        parent.appendChild(el);
        var el2 = doc.element("l");
        var count = this.content.length;
        el.appendChild(el2);
        for(var i=0; i<count; i++){
          if(this.content[i].objType==="Newline"){
            if(i<count-1){
              // Only make a new line if this isn't the last
              el2 = doc.element("l");
              el.appendChild(el2);
            }
          } else {
            if(this.content[i].toTEI) this.content[i].toTEI(doc, el2);
          }
        }
        return el;
      case "incipit":
      case "explicit":
        // I think...
        if(doc.hasParaParent(parent)){
          el = doc.element("seg");
          el.setAttribute("type", this.type);
        } else {
          el = doc.element("p");
        }
        break;
      default:
        el = doc.element("seg");
        el.setAttribute("type", this.type);
    }
    if(el!==parent) parent.appendChild(el);
    for(var i=0; i<this.content.length; i++){
      if(this.content[i].toTEI) this.content[i].toTEI(doc, el);
    }
    return el;
  };
  this.toHTML = function(){
    var span = document.createElement('span');
    span.className = this.type + this.extraClasses();
    this.DOMObj = textBlockToHTML(span, this.content, this);
    var tp = this.content.filter(textualContentp);
    if(tp.length && tp[tp.length-1].endsWithPilcrow) this.endsWithPilcrow = true;
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
  this.toTEI = function(doc, parent){
    if(!parent) parent = (doc.parentNode || doc.body);
    var el = doc.element("add");
    parent.appendChild(el);
    el.setAttribute("hand", "#"+this.id);
    for(var i=0; i<this.content.length; i++){
      if(this.content[i].toTEI) this.content[i].toTEI(doc, el);
    }
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
  // this.DOMObj = DOMSpan('space', false, " ");
  this.DOMObj = DOMSpan('space', false, " ");
  this.toText = function(){
    return this.code;
  };
  this.toTEI = function(doc, parent){
    if(!parent) parent=(doc.currentParent || doc.body);
    var lc = parent.lastElementChild;
    if(lc && (lc.tagName==="space" || lc.tagName==="SPACE")
       && lc.getAttribute("dim")==="horizontal"){
      var q = lc.getAttribute("quantity");
      if(q) {
        lc.setAttribute("quantity", (12+parseInt(q, 10)));
      } else console.log("Quantity missing from TEI <space>");
    } else {
      lc = doc.element("space");
      parent.appendChild(lc);
      lc.setAttribute("quantity", "12");
      lc.setAttribute("dim", "horizontal");
      lc.setAttribute("unit", "chars");
    }
    return lc;
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
  this.toTEI = function(doc, parent){
    if(!parent) parent=(doc.currentParent || doc.body);
    var lc = parent.lastElementChild;
    if(lc && (lc.tagName==="space" || lc.tagName==="SPACE")
       && lc.getAttribute("dim")==="horizontal"){
      var q = lc.getAttribute("quantity");
      if(q) {
        lc.setAttribute("quantity", 4+parseInt(q, 10));
      } else console.log("Quantity missing from TEI <space>");
    } else {
      lc = doc.element("space");
      parent.appendChild(lc);
      lc.setAttribute("quantity", "4"); // FIXME: check proportion
      lc.setAttribute("dim", "horizontal");
      lc.setAttribute("unit", "chars");
    }
    return lc;
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
  };
  this.toTEI = function(doc, parent){
    if(!parent) parent=(doc.currentParent || doc.body);
    var size = parseInt(this.code, 10);
    var el = doc.element("space");
    parent.appendChild(el);
    el.setAttribute("quantity", isNaN(size) ? 1 : size);
    el.setAttribute("dim", "vertical");
    el.setAttribute("unit", "lines");    
  };
  this.toHTML = function(){
    return DOMSpan('add blank', false, document.createTextNode("["+this.code+"]"));
  };
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
  this.toTEI = function(doc, parent){
    if(!parent) parent=(doc.currentParent || doc.body);
    var el = doc.element("add");
    el.setAttribute("resp", "#ed");//FIXME: wrong, wrong, wrong
    parent.appendChild(el);
    for(var i=0; i<this.content.length; i++){
      if(this.content[i].toTEI) this.content[i].toTEI(doc, el);
    }
    return el; 
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
  this.endsWithPilcrow = false;
  this.punctuation = function(){
    var str = /^\s*[,.:¶?!]/.exec(this.content);
    return str ? true : false;
  };
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
  this.toTEI = function(doc, parent){
    if(!parent) parent = (doc.parentNode || doc.body);
    var el = this.textNode(doc.doc);
    parent.appendChild(el);
    return el;
  };
  this.textNode = function(doc){
    var closingSpaces = /\s*$/.exec(this.code)[0].length;
    var spaceAfterPunc = /[,.:¶?!]\s+$/.exec(this.code);
    var lastIsStop = /[.?!]\s*$/.exec(this.code);
    var capitalisable = /^\s[a-z]/.exec(this.code) && punctuationStyle==="modern";
    var textNode = false;
    curtextitem = this;
    if(closingSpaces && trimPreInsSpaces(spaceAfterPunc)) {
      this.code = this.code.slice(0, 0-closingSpaces);
    }
    if(/^\s/.test(this.code)){
      if(trimPostInsSpaces(this)){
        this.code = this.code.slice(1);
      } else if(this.previous && this.previous.endsWithPilcrow){
        // If we're following a pilcrow, use non-breaking space
        this.code = "\u00a0"+this.code.slice(1);
      }
    }
    if(this.removepunct) this.code = this.code.substring(/^\s*[,.:¶?!]/.exec(this.content)[0].length);
    if(uncapitalise && !this.overrideCapitalize){
      var firstPos = this.code.search(/\S/);
      if(firstPos<0){
        textNode = doc.createTextNode(" ");
      } else {
        textNode = doc.createTextNode((this.code.substring(0, firstPos+1).toLowerCase() + this.code.substring(firstPos+1)).replace("¶ ", "¶\u00a0"));
      }
    } else if (capitalise && capitalisable && allowCapitalisation){
      var firstPos = this.code.search(/\S/);
      if(firstPos<0){
        textNode = doc.createTextNode(" ");
      } else {
        textNode = doc.createTextNode((this.code.substring(0, firstPos+1).toUpperCase() + this.code.substring(firstPos+1)).replace("¶ ", "¶\u00a0"));
      }      
    } else {
      textNode = doc.createTextNode(this.code.replace("¶ ", "¶\u00a0"));
    }
    if(/¶$/.test(this.code)) this.endsWithPilcrow = true;
    capitalise = lastIsStop;
    return textNode;
  };
  this.toHTML = function(){
    var textNode = this.textNode(document);
    this.DOMObj = DOMSpan('sentence-'+(inVerse ? inVerse : this.sentence), false, textNode);
//    if(!typeof(roman)=="undefined") $(this.DOMObj).hover(function(){displayReference(this, false);});
    if(!inTip && !noCount // && !editorMode
      ) {
      if(inIndex){
        $(this.DOMObj).hover(function(){thisisanindex(this);});
      } else if (!inCommentary){
        $(this.DOMObj).hover(function(e){displayStatusBarReference(this, e);});
      }
    }
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
  };
}

function RemovedPunctuation(symbol){
  this.objType="RemovedFullStop";
  this.symbol = symbol;
  this.toText = function(){
    return "{-"+this.symbol+"}";
  };
  this.toHTML = function(){
    return DOMSpan("correction removedPunctuation", false, this.symbol);
  };
}

function InsertedPunctuation(symbol){
  this.objType="InsertedFullStop";
  this.symbol = symbol;
  if(/[?!.]/.test(symbol)) sentence++;
  this.toText = function(){
    return "{+"+this.symbol+"}";
  };
  this.toHTML = function(){
    return DOMSpan("correction insertedPunctuation", false, this.symbol);
  };
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
  };
  this.getDOMObj = function(){
    // Caching is an issue. FIXME: for now, disable it
    var refresh = true;
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
        if(this.MS==="¶"){
          var span = DOMSpan("noitalic pilcrow", false, this.MS);
          span.appendChild(document.createElement("wbr"));
          return span;
        } else if (this.MS===" "){
          return false;
        } else {
          return document.createTextNode(this.MS);
        }
        // return this.MSDOM = this.MS=== " " ? false : 
        //   (this.MS==="¶" ? DOMSpan("noitalic pilcrow", false, this.MS) : document.createTextNode(this.MS));
      }
;
    }
    return punctuationStyle=="modern" ? this.modernDOM : this.MSDOM;
  };
  this.toText = function(){
    return "{"+this.MS+this.modern+"}";
  };
  this.toTEI = function(doc, parent){
    var choice = doc.element("choice");
    var reg;
    if(!parent) parent = (doc.parentNode || doc.body);
    if(this.modern){
      reg = doc.element("reg");
      reg.setAttribute("type", "punctuation");
      reg.setAttribute("subtype", "modern");
      reg.appendChild(doc.text(this.modern));
      choice.appendChild(reg);
    }
    if(this.MS){
      reg = doc.element("reg");
      reg.setAttribute("type", "punctuation");
      reg.setAttribute("subtype", "manuscript");
      reg.appendChild(doc.text(this.MS));
      choice.appendChild(reg);
    }
    parent.appendChild(choice);
  };
  this.toHTML = function(){
    if(this.suppressDraw) return false;
    capitalise = false;
    if(punctuationStyle == "modern" && ".?!¶".indexOf(this.modern)==-1 && this.MS!="¶") {
      uncapitalise = this.modern;
    } else {
      if(punctuationStyle==="modern" && ".?!".indexOf(this.modern)>-1){
        capitalise = true;
      }
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
  this.toTEI = function(doc, parent){
    var choice = doc.element("choice");
    if(!parent) parent = (doc.parentNode || doc.body);
    var reg = doc.element("reg");
    reg.setAttribute("type", "punctuation");
    reg.setAttribute("subtype", "manuscript");
    reg.appendChild(doc.text(" "));
    choice.appendChild(reg);
    parent.appendChild(choice);
    return choice;
  };
	this.draw = function(styles){
		console.log("ysy");
		if(punctuationStyle=="modern"){
			return false;
		} else {
			return svgSpan(SVG, 'punct '+(styles.length ? textClasses(styles) :"MSpace")
                     , false, " ");
		}
	}
  this.toHTML = function(){
    if(punctuationStyle=="modern"){
      return false;
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
  };
}
function WordSplit(){
  this.objType="Word Split";
  this.toText = function(){ return "{|}";};
  this.toHTML = function(){
    // return DOMSpan("wordsplit", false, "|");
    var span= DOMSpan("wordsplit", false, "|");
    span.appendChild(document.createElement("wbr"));
    return span;
  };
}
function WordJoin(){
  this.objType="Word Join";
  this.toText = function(){ return "{_}";};
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
  this.addOmission = function(witnesses, type, extraDescription){
    this.content.push(new Omission(witnesses, type, extraDescription));
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
  this.toTEI = function(doc, parent){
    var el;
    if(!parent) parent=(doc.currentParent || doc.body);
    el = doc.element('app');
    parent.appendChild(el);
    for(var i=0; i<this.content.length; i++){
      if(this.content[i].toTEI) {
        this.content[i].toTEI(doc, el, !(i || this.nonDefault()));
      }
    };
    return el;
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
      if(!this.content.length) console.log(this, "dying");
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


function QualifiedWitness(witness, corrected, sup){
  this.objType = "Qualified Witness";
  this.witness = witness;
  this.corrected = corrected;
  this.index = (sup==="i");
  this.sup = sup;
  this.toHTML = function(){
    var list = DOMSpan("variantWitness", false, this.witness);
    list.appendChild(DOMSpan("correctionem", false, DOMTextEl("sup", false, false, (this.corrected ? "c" : (this.index ? "i" : "*")))));
    return list;
  };
  this.toSVG = function(parent){
    var span = svgSpan(parent, "variantWitness", false, this.witness);
//    var text = this.corrected ? "c" : (this.index ? "i" : "*");
    var text = this.corrected ? "c" : (this.index ? "i" : this.sup);
    var c = svgSpan(span, "correctionem", false, text);
    c.setAttribute("dy", -rastralSize / 2);
    var corr = svgSpan(span, false, false, " ");
    corr.setAttribute("dy", rastralSize / 2);
    return span;
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
  };
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
  this.toTEI = function(doc, parent, isDefault){
    var el;
    if(!parent){
      console.log("TEI error in Choice: no parent", this);
      return false;
    }
    if(this.witnesses[0]==="emend."){
      el = doc.element("corr");
      el.setAttribute("resp", "#ed");//FIXME: wrong, wrong, wrong
    } else {
      el = doc.element(isDefault ? "lem" : "rdg");
      if(TEIWitnesses) {
        TEIWitnesses(this, el);
//        el.setAttribute("wit", TEIWitnesses(this.witnesses));
      }
    }
    parent.appendChild(el);
    for(var i=0; i<this.content.length; i++){
      if(this.content[i].toTEI) this.content[i].toTEI(doc, el);
    }
    return el;
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

function Omission(witnesses, type, rDescription){
  this.objType = "Omission";
  this.witnesses = witnesses;
  this.lDescription = type;
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
                       DOMSpan("readingDesc", false, this.lDescription+" "
                              +(this.rDescription ? this.rDescription+" " : "")));
    span.appendChild(DOMSpan("variantWitnesses", false, witnessList(this)));
    return span;
  };
}

function Source(id, details){
  this.objType = "SourceSpec";
  //FIXME: stupid
  this.id = id;
	this.ascription = false;
	if(/\t/.exec(details)){
		var info = details.split(/\t/);
		this.details = trimString(info[0]);
		this.ascription = trimString(info[1]);
	} else {
		this.details = details;
	}
  this.next = false;
  this.previous = false;
  this.toText = function(){
    var str = this.id+"\t"+this.details;
		if(this.ascription) str += "\t"+this.ascription;
		return str+"\n";
  };
  this.toHTML = function(){
    var div = DOMDiv("sourcedescription", false, false);
    div.appendChild(DOMSpan("sourceidentifier", false, this.id));
    div.appendChild(DOMSpan("sourcedetails", false, this.details));
		if(this.ascription) div.appendChild(DOMSpan("sourceascription", false, this.ascription));
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
  this.book = book;
  this.chapter = chapter;
  this.section = section;
  this.exampleno = exampleno;
  this.commentary = false;
  exampleno++;
  this.atClass = "at-"+this.book+"-"+this.chapter+"-"+this.section+"-"+this.exampleno;
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
//      this.DOMObj.className += " "+this.musicExample.atClass;
      this.DOMObj.className += " "+this.atClass;
//      div.appendChild(newSVG);
      examples.push([this.musicExample, newSVG]);
    } else {
      this.DOMObj.innerHTML = '';
      this.DOMObj.appendChild(DOMSpan("red", false, "This example will be added later"));
    }
    return this.DOMObj;
  };
}

function CommentarySet(){
  this.objType="CommentarySet";
  this.commentaries = [];
  this.doc = false;
  this.table = function(n){
    if(this.commentaries[n] && !this.commentaries[n].className){
      // There's one commentary table per entry
      return this.commentaries[n];
    } else {
      for(var i=0; i<this.commentaries.length; i++){
        var no = Number(this.commentaries[i].className);
        if(no && no===n){
          return this.commentaries[i];
        } else if (no && no > n){
          return false;
        }
      }
      console.log("Commentary miss: ", n);
      return false;
    }
  };
  this.populate = function(doc, url){
    this.doc = doc;
    $.ajax({
        async: true,
        url: url,
        datatype: 'html',
        failure: function(){
          console.log("Commentary data not loaded");
        },
        success: function(data){
          var html = $.parseHTML(data);
          var tables = [];
          for (var i=0; i<html.length; i++){
            if(html[i].tagName==="TABLE") {
              tables.push(html[i]);
            } else {
              var t = $(html[i]).find("table");
              for(var j=0; j<t.length; j++){
                tables.push(t[j]);
              }
            }
          }
          // console.log(html);
          // var tables = $(html).find("table");
          doc.commentaries.commentaries = tables.map(DOMCopyTable);
          $(doc.cog).removeClass("greyed");
          doc.refreshCommentary();
        }
    });
  };
}

function CommentaryTable(){
  this.objectType = "CommentaryTable";
  this.n = false;
  this.domObj = false;
  this.comment = function(){
    if(!curDoc.commentaries) return false;
    return curDoc.commentaries.table(this.n+1);
  };
  this.toText = function() { return false; };
  this.toTEI = function(doc, parent) { return false;};
  this.fillContainer = function(){
    var com = this.comment();
    if(curDoc.showcommentary && com){
      com = com.cloneNode(true);
      var tableDiv = DOMDiv("ten-line-table", false, com);
      $(this.domObj).show();
      // minimise button
      var button = DOMSpan("ui-icon my-ui-icon-minus", false, false);
      this.domObj.appendChild(button);
      $(button).click(function(){
          $(this.nextSibling.nextSibling.nextSibling).show();
          $(this).hide();
          $(this.nextSibling).hide();
          $(this.nextSibling.nextSibling).hide();
          $(this.parentNode).toggleClass("small");
      });
      // then image
      var img = DOMDiv("two-sys", false, 
        DOMImage(false, false, "commentary-"+(this.n+1)+".png"));
      this.domObj.appendChild(img);
      $(img).hide();
      // and now the commentary
      this.domObj.appendChild(tableDiv);
      // hide the commentary and the button, shrink the container
      $(tableDiv).hide();
      $(button).hide();
      $(this.domObj).toggleClass("small");
      // maximise button
      button = DOMSpan("ui-icon my-ui-icon-plus", false, false);
      this.domObj.appendChild(button);
      $(button).click(function(){
          $(this.previousSibling).show();
          $(this.previousSibling.previousSibling).show(); 
          $(this.previousSibling.previousSibling.previousSibling).show(); 
          $(this).hide();
          $(this.parentNode).toggleClass("small");
      });
      return this.domObj;     
    } else {
//      console.log("fail", this.n);
      $(this.domObj).hide();
      return false;
    }
  };
  this.toHTML = function(){
    if(this.domObj) return this.domObj;
    this.domObj = DOMDiv("Commentary", false, false);
    /*$(this.domObj).hide();*/
    return this.domObj;
  };
}

function Commentary(){
  this.objType = "Commentary";
  this.code = false;
  this.content = false;
  this.info = false;
  this.domObj = DOMDiv("Commentary", false, false);
  this.next = false;
  this.previous = false;
  this.toText = function(){
    var text = "<commentary";
    if(this.info){
      text += ":";
      text += " "+this.info;
    }
    text += ">";
    text += this.content.toText().substring(1);
    return text+"</commentary>";
  };
  this.toTEI = function(doc, parent){
    return false; // at least for now
  };
  this.toHTML =function(){
    $(curDoc.cog).removeClass("greyed");
    if(showcommentary && this.content){
      inCommentary = true;
      this.domObj = DOMDiv("Commentary", false, false);
      var p = $(this.content.toHTML()).children()[0];
      this.domObj.appendChild(p);
      $(p).hide();
      $(this.domObj).toggleClass("small");
      var button = DOMSpan("ui-icon my-ui-icon-plus", false, false);
      this.domObj.appendChild(button);
      $(button).click(function(){
          $(this.previousSibling).show();
          $(this).hide();
          $(this.parentNode).toggleClass("small");
      });
      button = DOMSpan("ui-icon my-ui-icon-minus", false, false);
      p.insertBefore(button, p.firstChild);
      $(button).click(function(){
          $(this.parentNode.nextSibling).show();
          $(this.parentNode).hide();
          $(this.parentNode.parentNode).toggleClass("small");
      });      
      inCommentary = false;
      return this.domObj;
    } else return false;
  };
}
function RawHTML(){
  this.objType = "Raw HTML";
  this.code = false;
  this.domObj = false;
  this.next = false;
  this.previous = false;
  this.toText = function(){
    return this.domObj.outerHTML;
  };
  this.toTEI = function(doc, parent){
    return false; // at least for now (see commentary)
  };
  this.toHTML =function(){
    return this.domObj;
  };
}
////////////////////////////////////////
///
// Diagrams
//
function DiagramTable(){
  this.objType = "SVGTable";
  this.svg = false;
  this.domObj = false;
  this.rows = [];
  this.height = 0;
  this.leftWidth = 0;
  this.rightWidth = 0;
  this.padding = 3;
  this.draw = drawTable;
  this.toHTML = this.draw;
  this.setRows = setRows;//function(rows) {this.rows=rows;}
}
function DiagramCell(table){
  this.objType = "SingleCell";
  this.content = [];
  this.table = table;
  this.height = cellHeight;
  this.width = 0;
  this.domObj = false;
  this.attachmentPoints = simpleCellAttachmentPoints;
  this.draw = drawCell;
  this.adjust = adjustCell;
}
function DiagramMultiCell(table){
  this.objType = "MultiCell";
  this.content = [];
  this.domObj = false;
  this.table = table;
  this.height = cellHeight;
  this.width = 0;
  this.attachmentPoints = multiCellAttachmentPoints;
  this.draw = drawMultiCell;
  this.adjust = adjustMultiCell;
}
function DiagramRow(table){
  this.objType = "Right Diagram Row";
  this.RContent = false;
  this.LContent = false;
  this.RCell = false;
  this.LCell = false;
  this.domObj = false;
  this.table = table;
  this.padding = false;
  this.x = false;
  this.y = false;
  this.lWidth = 0;
  this.rWidth = 0;
  this.connectionType = "Line";
  this.draw = drawRDiagramRow;
  this.width = twoColumnWidth;
  this.height = rowHeight;
  this.join = drawJoin;
  this.joinLine = joinLine;
  this.adjustCells = adjustCells;
}
function drawJoin(){
  if(this.connectionType==="Line"){
    this.joinLine(this.domObj, this.LContent, this.RContent);
  }
}
function simpleCellAttachmentPoints(side){
  var br = this.domObj.getBoundingClientRect();
  if(side==="L"){
    return [{x:this.x+this.width+(this.table.padding/2), y:br.top}];
  } else if (side==="R"){
    return [{x:this.x-(this.table.padding/2), y:br.top}];
  }
  console.log("Join line broken");
    return [{x:br.right, y:br.top+(br.height/2)}];
}
function multiCellAttachmentPoints(side){
  var points = [];
  for(var i=0; i<this.content.length; i++){
    points.push(this.content[i].attachmentPoints(side)[0]);
  }
  return points;
}
function joinLine(svgEl, cellL, cellR){
  var attachLeft = cellL.attachmentPoints("L");
  var attachRight = cellR.attachmentPoints("R");
  for(var i=0; i<attachLeft.length; i++){
    for(var j=0; j<attachRight.length; j++){
      svgLine(svgEl, attachLeft[i].x, attachLeft[i].y,
             attachRight[j].x, attachRight[j].y, "tableJoinLine", false);
    }
  }
}
function drawCell(svgEl, x, y){
  this.domObj = svgText(svgEl, x, y, 'table-cell single', false, false);
  this.y = y;
  this.x = x;
  for(var i=0; i<this.content.length; i++){
    if(typeof(this.content[i])==="string"){
      svgSpan(this.domObj, false, false, this.content[i]);
    } else {
      this.content[i].toSVG(this.domObj, y);
    }
  }
  this.domObj.setAttributeNS(null, 'y', y);
  this.domObj.setAttributeNS(null, 'x', x);
  var bc = this.domObj.getBoundingClientRect();
//  this.height = bc.height;
  this.width = bc.width;
  this.bottom = bc.bottom;
  return this.domObj;
}
function cellHeight(){
  if(this.bc && this.bc.height!==0) return this.bc.height;
  this.bc = this.domObj.getBoundingClientRect();
  console.log(this.bc);
  return this.bc.height;
}
function drawMultiCell(svgEl, x, y){
  //var y=svgEl.getBoundingClientRect().bottom + this.padding;//??wtf??
  this.y = y;
  this.x = x;
  this.domObj = svgEl;
  for(var i=0; i<this.content.length; i++){
    this.content[i].draw(svgEl, x, y);
    y+=this.content[i].height();
    this.width = Math.max(this.width, this.content[i].domObj.getBoundingClientRect().width);
  }
  //this.height = y - this.y;
}
function drawRDiagramRow(svgEl, y){
  this.domObj = svgGroup(svgEl, "classification row rightwards");
  this.y = y;
  this.LCell = svgGroup(this.domObj, "parent cell");
  this.LContent.domObj = this.LCell;
  this.LContent.draw(this.LCell, 0, y);
  this.lWidth = this.LContent.width;
  this.RCell = svgGroup(this.domObj, "parent cell");
  this.RContent.draw(this.RCell, this.lWidth, y);
  this.rWidth = this.RContent.width;
}
function adjustCells(leftWidth){
  this.LContent.adjust(false, this.RContent);
  this.RContent.adjust(leftWidth, this.LContent);
  this.join(this.svg, this.LContent, this.RContent);
}
function adjustCell(x, otherContent){
  var nodes = this.domObj.childNodes;
  if(x || x===0){
    this.x = x;
    //nodes[0].setAttributeNS(null, "x", x);
    if(nodes.length) {
      nodes[0].setAttributeNS(null, "x", x);
    } else {
      this.domObj.setAttributeNS(null, "x", x);
    }
  }
  if(otherContent && otherContent.objType==="MultiCell") {
    this.y = otherContent.y + (otherContent.height()/2) - (this.height()/2);
    if(nodes.length) {
      nodes[0].setAttributeNS(null, "y", this.y);
    } else {
      this.domObj.setAttributeNS(null, "y", this.y);
    }
//    nodes[0].setAttributeNS(null, "y", this.y);
  }
}
function adjustMultiCell(x, otherContent){
  this.x = x;
  for(var i=0; i<this.content.length; i++){
    this.content[i].adjust(x, false);
  }
}
function twoColumnWidth(){
  return this.RCell.x+this.rWidth+this.padding;
}
function rowHeight(){
  return Math.max(this.RContent.height(), this.LContent.height());
}
function drawTable(svgObj){
  this.svg = svgObj;
  this.domObj = svgGroup(svgObj, "table", false);
  var y = 10;
  for(var i=0; i<this.rows.length; i++){
    this.rows[i].draw(this.domObj, y);
    this.leftWidth = Math.max(this.leftWidth, this.rows[i].lWidth);
    this.rightWidth = Math.max(this.rightWidth, this.rows[i].rWidth);
    y += this.rows[i].height();
  }
  this.height = y;
  for(i=0; i<this.rows.length; i++){
    this.rows[i].adjustCells(this.leftWidth + (this.padding * 3));
  }
  return this.svg;
}
function makeCell(data, table){
  var cell, subcell;
  if(typeof(data)==="string"){
    cell = new DiagramCell(table);
    cell.content.push(data);
  } else {
    cell = new DiagramMultiCell(table);
    for(var i=0; i<data.length; i++){
      subcell = new DiagramCell(table);
      subcell.content.push(data[i]);
      cell.content.push(subcell);
    }
  }
  return cell;
}
function setRows(rows){
  var prevRow = false;
  var cell;
  for(var i=0; i<rows.length; i++){
    // only interested in two-column layout for now
    var LContent = rows[i].cells.length && rows[i].cells[0].content.length 
                     ? rows[i].cells[0].content : false;
    var RContent = rows[i].cells.length > 1 && rows[i].cells[1].content.length 
                     ? rows[i].cells[1].content : false;
    if(LContent && RContent || ((LContent || RContent) && !prevRow)){
      var newRow = new DiagramRow(this);
      prevRow = newRow;
      this.rows.push(newRow);
      cell = new DiagramCell(this);
      newRow.LContent = cell;
      if(LContent) cell.content = LContent;
      cell = new DiagramCell(this);
      newRow.RContent = cell;
      if(RContent) cell.content = RContent;
    } else if(LContent){
      cell = new DiagramCell(this);
      cell.content = LContent;
      if(prevRow.LContent.objType==="MultiCell"){
        prevRow.LContent.content.push(cell);
      } else {
        var newCell = new DiagramMultiCell(this);
        newCell.content.push(prevRow.LContent);
        newCell.content.push(cell);
        prevRow.LContent = newCell;
      }
    } else if(RContent){
      cell = new DiagramCell(this);
      cell.content = RContent;
      if(prevRow.RContent.objType==="MultiCell"){
        prevRow.RContent.content.push(cell);
      } else {
        var newCell = new DiagramMultiCell(this);
        newCell.content.push(prevRow.RContent);
        newCell.content.push(cell);
        prevRow.RContent = newCell;
      }
    }
  }
}
function makeTable(tArray){
  var table = new DiagramTable();
  var row, mcell, scell;
  for(var i=0; i<tArray.length; i++){
    row = new DiagramRow(table);
    row.LContent = makeCell(tArray[i][0], table);
    row.RContent = makeCell(tArray[i][1], table);
    table.rows.push(row);
  }
  return table;
}
var table;
function initTest(){
  var data = [[["a", "b", "c"], "abc"], [["d", "efg"], "defg"], 
    ["foo", ["f", "o", "o"]]];
  table = makeTable(data);
  var svgObj = svg(800, 800);
  document.body.appendChild(svgObj);
  table.draw(svgObj);
}
function textBlockToSVG(container, content, block){
  // SVG analogue of the ToHTML version
  console.log("yo", content);
  for(var i=0; i<content.length; i++){
    if(content[i].objType =="Column/Page"|| 
      (typeof(content[i].content) != "undefined" && 
       typeof(content[i].content) == "Span" && 
       content[i].content[0].objType == "Column/Page")) {
      // I think this is either a break or a variant with a break
      var cn = container.className;
      container.className += " colend";
      // var breakCaption = content[i].toSVG(); // FIXME: doesn't exist
      // if(block.DOMObjs) block.DOMObjs.push(breakCaption);
      // container.appendChild(breakCaption);
    } else if(content[i].toSVG){
      var obj = content[i].toSVG();
      if(obj) {
        container.appendChild(obj);
      }
      console.log(container);
    } else if (typeof(content[i])==="string"){
      svgSpan(container, false, false, content[i]);
    } else {
      console.log("No appropriate method for", content[i]);
    }
  }
  return container;
}
Span.prototype.toSVG = function(parent){
  var span = svgSpan(parent);
  span.className = this.type+this.extraClasses();
  console.log(span);
  this.DOMObj = textBlockToSVG(span, this.content, this);
  return this.DOMObj;
};
Text.prototype.toSVG = function(parent){
  this.DOMObj = svgSpan(parent, false, false, this.code);
  return this.DOMObj;
};
Add.prototype.toSVG = function(parent){
  var newContent = ["["];
  newContent.concat(this.content);
  newContent.push("]");
  this.DOMObj = svgSpan(parent, "add");
  this.DOMObj = textBlockToSVG(this.DOMObj, newContent, this);
  return this.DOMObj;
};
