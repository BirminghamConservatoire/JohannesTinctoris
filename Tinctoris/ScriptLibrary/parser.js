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
  "highlight": "yellowline",
  "strikethrough": "strikethrough",
  "insertabove": "insertabove",
  "large": "large",
  "underscore": "underscore",
  "2line": "twoline",
  "3line": "threeline",
  "4line": "fourline",
  "5line": "fiveline",
  "6line": "sixline",
  "7line": "sevenline",
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
  "yellowline": "highlight",
  "strikethrough": "strikethrough",
  "insertabove": "insertabove",
  "large": "large",
  "underscore": "underscore",
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
  // div.appendChild(DOMSpan("datum", false, lazyParse(datum)));
  div.appendChild(lazyParse(datum, "datum"));
  return div;
}
function lazyParse(text, spanClass){
  var inner = text.replace(/\<([^/][^>]*)>/g, "<span class='$1'>").replace(/<[^>]*>/g, "</span>");
  var span = DOMSpan(spanClass, false, false);
  span.innerHTML = inner;
  return span;
}

function TreatiseDoc(text, outdiv){
  this.text = text;
  this.language = false;
  this.MSPunctuation = punctuationStyle=="MS" || false;
  this.prevWidth = false;
  this.forceredraw = true;
  this.showvars = showvariants || false;
  this.footnotes = [];
  this.shortSource = false;
  this.contents = [];
  this.exampleSource = false;
  this.examples = [];
  this.leaves = [];
  this.structures = false;
  this.out = outdiv ? outdiv : document.getElementById('content');
  this.drawTo = this.out;
  this.docType = false;
  this.title = false;
  this.shortTitle = false;
  this.scrollpos = {};
  this.entered = false;
  this.checked = false;
  this.approved = false;
  this.translator = false;
  this.copy = false;
  this.source = false;
  this.established = false;
  this.basefile = false;
  this.sources = [];
  this.running = false;
  this.scriptSpec = false;
  this.script = false;
  this.editor = false;
  this.columns = false;
  this.hands = [];
  this.maxWidth = 0;
  this.marg = false;
  this.edition = function(){
    return this.language!=="Latin" || this.source.length;
  }
  this.setScrollPos = function(book, chapter, section, paragraph, offset, scroll){
    if(this.scrollpos.book===book && this.scrollpos.chapter===chapter
       && this.scrollpos.section===section && this.scrollpos.paragraph===paragraph){
      return;
    }
    this.scrollpos.book=book;
    this.scrollpos.chapter=chapter;
    this.scrollpos.section=section;
    this.scrollpos.paragraph=paragraph;
    $(this.out).find(".locText").html(romanReference(book, chapter, section));
    if(scroll){
      simpleScrollTo(this.drawTo, offset, book, chapter, section, paragraph);
    }
  };
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
  this.clearFootnotes = function(){
    this.footnotes = [];
    $(".stream-"+docMap.docCode(this)).remove();
  };
  this.init = function(){
    if(editable){
      this.setUpInteraction();
    }
    nodeNo=0;
    nodes = [];
    chapter = 0;
    book = 0;
    section = 0;
    paragraph = 0;
    hands = [];
    this.clearFootnotes();
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
    text += "<treatise>";
    for(var i=0; i<this.contents.length; i++){
      text += this.contents[i].toText();
    }
    return text + "</treatise>";
  };
  this.infoButton = function(){
    // this.infoButtons (qv) presents several buttons for different bits of
    // info. Let's try a less complex approach -- just one button
    var ib = this.drawTo.appendChild(DOMDiv('infoButtons'), false, false);
    infoButton("i", ["editor", "checkedby", "enteredby", "approvedby","dateestablished",
                     "source", "sources", "translator", "copytext","script", "columns", "running"], 
               ib, infoDisplay == "show", "infoDisplay");
  }
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
  this.describe = function(){
    switch(this.docType+this.language){
      case "EditedLatin":
        return "Edited Latin";
      case "TranslationEnglish":
        return "Translation";
      default:
        return "Source transcription: "+(this.shortSource || this.source);
    }
  };
  this.titleBar = function(){
    if($(this.out).children(".titleBar")){
      $(this.out).children(".titleBar").remove();
    }
    var bar = DOMDiv("titleBar", false, false);
    // FIXME: only if there are other panes?
    this.closeButton(bar);
    // Maximise button
    // this.maximiseButton(bar);
    // Title (FIXME: Add treatise navigation)
    var displayTitle = DOMDiv("titlebarheader", false, 
      DOMSpan("titlebartitle", false, (this.shortTitle ? this.shortTitle : this.title)+" "));
    // displayTitle.appendChild(document.createElement("br"));
    var menu = DOMTextEl("ul", "titlebarmenubar MenuBarH", false, false);
    displayTitle.appendChild(menu);
    // View/language
    var ul = DOMTextEl("ul", "titlebarmenu view", false, false);
    var li = DOMListItem("titlebartext view", false, 
                         DOMAnchor(false, false, 
                                   DOMSpan('viewText', false, this.describe()+" ")));
    li.appendChild(ul);
    docMap.treatiseViews(ul, this);
    menu.appendChild(li);
    $(ul).find("a").click(function(e){
      if($(this).hasClass("selected")) return;
      docMap.switchView(this);
    });
    // FIXME: loc
    ul = DOMTextEl("ul", "titlebarmenu location", false, false);
    li = DOMListItem("titlebartext location titlebarlocdetail", false, 
      DOMAnchor(false, false, DOMSpan("locText", false, 
        //romanReference(1,1,1)));
        this.scrollpos.book
            ? romanReference(this.scrollpos.book, this.scrollpos.chapter, this.scrollpos.section)
            : "Section...")));
    li.appendChild(ul);
    menu.appendChild(li);
    jqNavSelect(this, ul);
    bar.appendChild(displayTitle);
    ul = DOMTextEl("ul", "titlebarmenu add r", false, false);
    li = DOMListItem("addpanebutton r", false, 
                     DOMSpan("ui-icon my-icon my-ui-icon-plus",
                             false, false));
    li.appendChild(ul);
    docMap.treatiseViews(ul, this);
    ul2 = DOMTextEl("ul", "TBaddPaneButton r TBbutton", false, li);
    bar.appendChild(ul2);
    $(ul2).menu();
    $(ul).find("a").click(function(e){
      docMap.addViewRight(this);
    });
    // Cog
    ul = DOMTextEl("ul", "titlebarmenu cog settings", false, false);
    li = DOMListItem("settingsbutton", false,  DOMSpan("ui-icon my-icon my-ui-icon-gear", false, false));
    li.appendChild(ul);
    ul2 = DOMTextEl("ul", "TBsettingsbutton TBbutton", false, li);
    bar.appendChild(ul2);
    this.settingsMenu(ul);
    $(ul2).menu({icons: {submenu: "gear"}});
    if(this.docType!=="Edited") {
      $(ul2).addClass("greyed");
    }
    $(this.out).addClass("contentcontainer");
    this.out.appendChild(bar);
    this.drawTo = DOMDiv("drawTo", false, false);
    this.out.appendChild(this.drawTo);
    $(menu).menubar({menuIcon: true, buttons: true});
    // location
    var l = DOMDiv("cursorLocator", false, false);
    bar.appendChild(l);
    $(l).hide();
    $(this.out).mouseleave(function(e){$(this).find(".cursorLocator").hide()});
  };
  this.settingsMenu = function(ul){
    var item;
    if(this.docType == "Edited"){
      //Show variants;
      item = DOMListItem(false, false, 
        DOMAnchor("settingsmenuoption variantoptions showvariants"+(this.showvars ? " checked" : ""), 
          false, "Show variants"));
      ul.appendChild(item);
      $(item).data("doc", this);
      $(item).click(function(e){
        if($(this).hasClass("checked")) return;
        var doc = $(this).data("doc");
        var pos = currentPosition(doc.drawTo);
        $(this).children("a").addClass("checked");
        $(this.parentNode).find(".hidevariants").removeClass("checked");
        doc.showvars = true;
        doc.forceredraw = true;
        docMap.updatePageSettings();
        doc.draw();
        fixHeight(true);
        pos.simpleScroll(doc.drawTo);
      });
      // Hide variants
      item = DOMListItem(false, false, 
        DOMAnchor("settingsmenuoption variantoptions hidevariants"+(this.showvars ? "" :" checked"), 
          false, "Hide variants"));
      ul.appendChild(item);
      $(item).data("doc", this);
      $(item).click(function(e){
        if($(this).hasClass("checked")) return;
        var doc = $(this).data("doc");
        var pos = currentPosition(doc.drawTo);
        $(this).addClass("checked");
        $(this.parentNode).find(".showvariants").removeClass("checked");
        closeAllPopups();
        doc.showvars = false;
        doc.forceredraw = true;
        docMap.updatePageSettings();
        doc.draw();
        fixHeight(true);
        pos.simpleScroll(doc.drawTo);
      });
      item = DOMListItem(false, false, 
        DOMAnchor("settingsmenuoption punctuationoptions MS"+(this.MSPunctuation ? " checked" : ""),
          false, "Manuscript punctuation"));
      $(item).data("doc", this);
      $(item).click(function(e){
        if($(this).hasClass("checked")) return;
        var doc = $(this).data("doc");
        var pos = currentPosition(doc.drawTo);
        $(this).addClass("checked");
        $(this.parentNode).find(".punctuationoptions.modern").removeClass("checked");
        doc.MSPunctuation = true;
        docMap.updatePageSettings();
        doc.forceredraw = true;
        doc.draw();
        fixHeight(true);
        pos.simpleScroll(doc.drawTo);
      });
      ul.appendChild(item);
      item = DOMListItem(false, false, 
        DOMAnchor("settingsmenuoption punctuationoptions modern"+(this.MSPunctuation ? "" :" checked"), 
          false, "Modern punctuation"));
      ul.appendChild(item);
      $(item).data("doc", this);
      $(item).click(function(e){
        if($(this).hasClass("checked")) return;
        var doc = $(this).data("doc");
        var pos = currentPosition(doc.drawTo);
        $(this).addClass("checked");
        $(this.parentNode).find(".punctuationoptions.MS").removeClass("checked");
        doc.MSPunctuation = false;
        docMap.updatePageSettings();
        doc.forceredraw = true;
        doc.draw();
        fixHeight(true);
        pos.simpleScroll(doc.drawTo);
      });
    } else {
      // FIXME: why doesn't it work?
      ul.appendChild(DOMListItem(false, false, "no options"));  
    }
  };
  this.maximiseButton = function(bar){
    var maxButton = DOMDiv("TBMaximiseButton", false, false);
    bar.appendChild(maxButton);
    $(maxButton).data("doc", this);
    $(maxButton).click(function(e){
      if(docMap.panes.length===1) return;
      var doc = $(this).data("doc");
      docMap.deleteAllBut(doc);
    });
  };
  this.closeButton = function(bar){
    // Close button
    var closeButton = DOMDiv("TBCloseButton", false, false);
    bar.appendChild(closeButton);
    $(closeButton).data("doc", this);
    $(closeButton).click(function(e){
      if(e.altKey){
        printThis([$(this).data("doc").drawTo]);
        return;
      }
      if(docMap.panes.length===1) return;
      var doc = $(this).data("doc");
      $(doc.out).remove();
      $("#cursorLocator").remove();
      docMap.removeDoc(doc);
    });
  };
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
    margin = false;
    var tS = [];
    while(string!=""){
      try{
        var para = readPara();
        if(para){
          para.hang = hang;
          hang = false;
          this.contents.push(para);
          if(para.musicOnly()) sentence--;
          // this.textualStructures.push(para.textualStructures());
        }
      } catch (x) {
        var para = new Comment();
        para.contents.push(new Text("Error"));
        this.contents.push(para);
      }
    }
    if(margin) this.marg = true;
    margin = false;
    this.hands = hands;
  };
  this.draw = function(){
    curDoc = this;
    margin = this.marg;
    this.showvar = this.showvars || this.source;
    if(!this.forceredraw && $(this.out.childNodes.length)) {
      return;
    }
    if(this.source) {
      $(this.drawTo).addClass("nowrap");
    } else {
      $(this.drawTo).removeClass("nowrap");
    }
    var oldshowvariants = showvariants;
    var oldpunctuationStyle = punctuationStyle;
    examples = this.examples;
    // FIXME: why was this here?
    // if(this.docType !== "Edited"){
    //   showvariants = false;
    // } else {
      showvariants = this.showvars;
      //FIXME: broken
      punctuationStyle = punctuationStyle=="both" ? "both" : (this.MSPunctuation ? "MS" : "modern");
    // }
    $(this.out).empty();
    if(titleBar) {
      this.titleBar();
    } else {
      $(this.out).addClass("drawTo");
    }
    this.writeHeaders();
    if(this.exampleSource) matchExamples(this, this.exampleSource);
    currenttextparent = this;
    for(texti=0; texti<this.contents.length; texti++){
      pari = texti;
      var domEl = this.contents[texti].toHTML();
      if(domEl){
        this.drawTo.appendChild(domEl);
      }
    }
    if(this.columns==2){
      $(this.out).find("p").removeClass("onecolumn");
      $(this.out).find("p").addClass("twocolumn");
    } else {
      $(this.out).find("p").removeClass("twocolumn");
      $(this.out).find("p").addClass("onecolumn");
    }
    if(!singlePaneMode) $(this.drawTo).scroll(scroller120);
//    $("div.para").dblclick(alignVersions);
    this.maxWidth = refreshExamples(this.examples);
    if(wrapWidth){
      var marg = 2;
      this.prevWidth = Math.max(this.maxWidth+15, wrapWidth);
      this.drawTo.style.width = this.prevWidth+"px";
      this.out.style.width = (this.prevWidth+marg)+"px";
    } else {
//      this.drawTo.style.width = this.out.getBoundingClientRect().width-8+"px";
      //    this.out.style.width = Math.max(this.maxWidth+5, 450)+"px";
    }
    for(var comp=0; comp<complaint.length; comp++){
      writeToDebugger("<p>"+complaint[comp]+"</p>");
    }
    if(docMap && docMap.docs && docMap.docs.length){
      $("div.para").dblclick(alignVersions);
    }
    this.forceredraw = false;
    showvariants = oldshowvariants;
    punctuationStyle = oldpunctuationStyle;
      $(".punctuationswitch").click(function(){
        var pos = $(doc.drawTo).offset();
        switch(punctuationStyle){
          case "modern":
            punctuationStyle="MS";
            this.innerHTML = "Showing MS punctuation";
            doc.MSPunctuation = true;
            break;
          case "MS":
            punctuationStyle="both";
            this.innerHTML = "Showing all punctuation";
            doc.MSPunctuation = false;
            break;
          case "Both":
            punctuationStyle="modern";
            this.innerHTML = "Showing modern punctuation";
            doc.MSPunctuation = false;
            break;              
        }
        doc.forceredraw = true;
        doc.draw();
        $(doc.drawTo).offset(pos);
      });
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
//  this.draw();
}

function refreshExamples(examples){
  var mw = 0, failed=[], thisSVG, thisDiv, nowrap;
  var oldWrap = wrapWidth;
  for(var i=0; i<examples.length; i++){
    examplei = i;
    thisSVG = examples[i][0].SVG;
    thisDiv = thisSVG.parentNode;
    if($(thisDiv).parents(".nowrap").length) {
      wrapWidth = false;
    }
    if(thisDiv){
      examples[i][0].draw(examples[i][1], nocache);
      if($(thisDiv).hasClass("standalone")){
        // thisDiv.style.height = examples[i][1].height.baseVal.value+15+"px";
        // thisDiv.style.height = thisDiv.getBoundingClientRect().height+5+"px";
        if(webkit){
          thisDiv.style.height = thisSVG.height.baseVal.value+"px";
        } else {
          thisDiv.style.height = thisSVG.getBoundingClientRect().height
            +Math.abs(thisSVG.getBoundingClientRect().top - thisDiv.getBoundingClientRect().top)+"px";
        }
      } else {
        // thisDiv.style.height = examples[i][1].height.baseVal.value+10+"px";
        // thisDiv.style.height = thisDiv.getBoundingClientRect().height+5+"px";
        thisDiv.style.width = thisSVG.getBBox().width+2+"px";
        if(webkit){
          thisDiv.style.height = thisSVG.height.baseVal.value+"px";
        } else {
          thisDiv.style.height = thisSVG.height.baseVal.value+
            Math.abs(thisSVG.getBoundingClientRect().top - thisDiv.getBoundingClientRect().top)+"px";
          // thisDiv.style.height = thisSVG.getBoundingClientRect().height
          //   +(thisSVG.getBoundingClientRect().top - thisDiv.getBoundingClientRect().top)+"px";
        }
      }
      //        if($.browser.mozilla) thisSVG.style.height= "100%";
      $(thisSVG).data("eg", examples[i][0]);
      mw = Math.max(mw, examples[i][1].width.baseVal.value);
    } else {
      failed.push([i]);
      }
  }
  wrapWidth = oldWrap;
  for(i=0; i<failed.length; i++){
    examples.splice(i, 1);
  }
  return mw + 16;
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
  correctNexts(para);
  para.book = book;
  para.chapter = chapter;
  para.section = section;
  para.paragraph = paragraph;
  indent = false;
  centre = false;
  return para;
}

function readString(){
  // FIXME: revisit and put newobj = true and single next/previous block
  var content = new Array();
  var fresh = false;
  var latest = false;
  var prevsize = string.length;
  var sb=lastIsSentenceBreak;
  while(string.length > 0){
    latest = last(content);
    switch(string.charAt(0)){
      case "<":
        fresh = readTag();
        if(fresh){
          if(latest){
            fresh.previous = latest;
            latest.next = fresh;
          }
          content.push(fresh);
          // if(fresh.objType == "MusicExample" && fresh.comments.length){
          //   content.push(fresh.commentsDiv());
          // }
        }
        if(oneOff) return content;
        break;
      case "*":
        var comment = consumeIf(/\*\*[^*]*\*\*/);
        if(!comment){
          // treat as normal character
          if(latest && latest.objType == 'text'){
            content[content.length -1].addChar(string.charAt(0));
          } else {
            content.push(new Text(string.charAt(0)));
            if(latest) {
              latest.next = content[content.length-1];
              latest.next.previous = latest;
            }
          }
          consume(1);
        } else if(comment.toLowerCase() == "**indent**"){
          indent = true;
        } else if(comment.toLowerCase() == "**centre**"){
          centre = true;
        } else {
          var ann = new Annotation();
          ann.code=comment.slice(2, -2);
          if(latest) {
            ann.previous = latest;
            latest.next = ann;
          }
          content.push(ann);
        }
        break;
      case "\n":
      case "\r":
      case "\f":
        consume(1);
      //FIXME: -1 for musicexample
        if(!lastIsSentenceBreak || lastIsHeading || lastIsVerse) {
          // Sentence breaks in headings don't count
          sentence++;
        }
        lastIsHeading=false
        lastIsVerse=false
        sb=false;
        return content;
      case "[":
        fresh = readLocation();
        if(fresh){
          if(latest) {
            fresh.previous = latest;
            latest.next = fresh;
          }
          content.push(fresh);
        }
        break;
      case "{":
        // heavily used code -- could be punctuation of some sort or
        // comment or music example spacer or single-character tag
        var punc = string.substring(1,3).match(/[,.¶:;()–-—!?\ ‘’]+/);
        if(punc && punc[0] && punc[0].length>1){
          content.push(new Punctuation(punc[0]));
          if(latest){
            latest.next = content[content.length-1];
            latest.next.previous = latest;
          }
          consumeIf(/\{[,.¶:;()–-—!?\ ‘’]+\}/);
        } else if (punc && string.substring(0,3) ==="{ }"){
          content.push(new OptionalSpace());
          consume(3);
          consumeSpace();
        } else if (punc && string.substring(0,3) ==="{.}"){
          content.push(new SentenceBreak());
          consume(3);
          consumeSpace();
          sb=false;
        } else if (string.substring(0,3)==="{m}"){
          content.push(new CorrectedM());
          consume(3);
          consumeSpace();
        } else if (string.substring(0,3)==="{|}"){
          content.push(new WordSplit());
          consume(3);
          consumeSpace();
        } else if (string.substring(0,3)==="{_}"){
          content.push(new WordJoin());
          consume(3);
          consumeSpace();
        } else if(consumeIf("{example}")){
          content.push(new BlankExample());
          if(latest){
            latest.next = content[content.length-1];
            latest.next.previous = latest;
          }
        } else if(consumeIf("{hang}")){
          hang=true;
        } else if(knownTag()) {
          content.push(readOneOffTag());
        } else {
          content.push(readChoice());
          if(latest){
            latest.next = content[content.length-1];
            latest.next.previous = latest;
          }
        }
        if(oneOff) return content;
        break;
      case ".":
      case "!":
      case "?":
        // if(string.length>1 && !/[\n\r\f]/.test(string.charAt(1))) sentence++;
        if(string.length>1) sentence++;
      default:
        sb=/["'”’‘“]/.test(string.charAt(0)) ? sb : /[?!.]/.test(string.charAt(0));
        if(latest && latest.objType == 'text' && !/[?!.]/.test(latest.content)){
          content[content.length -1].addChar(string.charAt(0));
        } else {
          if(/^\s*[_]/.exec(string)){
            consumeSpace();
            var newtext = new Text(" ");
            newtext.overrideCapitalize = true;
            content.push(newtext);
            if(latest){
              latest.next = content[content.length-1];
              latest.next.previous = latest;
            }
          } else {
            content.push(new Text(string.charAt(0)));
            if(latest){
              latest.next = content[content.length-1];
              latest.next.previous = latest;
            }
          }
        }
        consume(1);
        break;
    }
    lastIsSentenceBreak = sb;
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
function knownTag(){
  var tagends = string.indexOf("}");
  if(tagends>-1){
    var tag = string.substring(1, tagends);
    if(typeof(spans[tag])!=="undefined"){
      return true;
    }
  }
  return false;
}

function readOneOffTag(){
  var tagends = string.indexOf("}");
  if(tagends>-1){
    var tag = string.substring(1, tagends);
    if(typeof(spans[tag])!=="undefined"){
      var span = new Span();
      span.type = spans[tag];
      consume(tagends+1);
      consumeSpace();
      if(/[<{]/.test(string.charAt(0))){
        oneOff=true;
        span.content = readString();
        oneOff=false;
      } else {
        span.content.push(new Text(string.charAt(0)));
        consume(1);
      }
      return span;
    }
  } else{
    return false;
  }
}

function readTag(){
  var loc = string.indexOf(">");
  if(loc > 0){
    if(string.substring(1,3)==="l/"){
      consume(4);
      return new Newline();
    } else if(string.substring(1,9) == "treatise"){
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
      return new Prologue();
      //var chap = new Chapter();
      //chap.code = "<prologue>";
      //chap.special = "Prol."
      // chap.chapter -=1;
      // chapter -= 1;
      //return chap;
    } else if (string.substring(1, 11)=="conclusion") {
      consume(loc+1);
      return new Conclusion();
      // var chap = new Chapter();
      // chap.code = "<conclusion>";
      // chap.special = "Conc.";
      // chap.chapter -=1;
      // chapter -= 1;
      // return chap;
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
      var extra = false;
      if(tag.indexOf(":")>-1){
        extra = trimString(tag.substring(tag.indexOf(":")+1));
        tag = trimString(tag.substring(0,tag.indexOf(":")));
      }
//      var locend = string.indexOf("</"+tag+">");
      if(tag.charAt(0)=="/") return false;
      var locend = endTagPos(tag);
      var fake = locend == string.length; // Only true if no close
      if(locend>1){
        var content = string.substring(loc+1, locend);
        var startSentence = sentence;
        var span = new Span();
        if(tag==="heading") inHeading =true;
        if(tag==="verse") inVerse=sentence;
        if (spans[tag]){
          span.type = spans[tag];
        } else {
          span.type = tag;
        }
        if(extra) span.extra = extra;
        var oldstring = string;
        op = pointer;
        string = content;
        span.code = string;
        span.content = readString();
        string = oldstring.substring(fake ? string.length : locend+(tag.length+3));
        pointer = op+locend+(fake ? 0 : tag.length+3);
        if(tag==="heading") {
          lastIsHeading = true;
          sentence = 0;
        }
        if(tag==="verse"){
          lastIsVerse = true;
        }
        inHeading = false;
        if(inVerse) sentence = inVerse;
        inVerse = false;
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
//    consumeSpace();
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
    } else if(locstring==="."){
      return new MicroSpace();
    } else if (/^\s*[0-9]*\s*blank\s+lines? *$/.test(locstring)){
      // blank line indicator
      return new BlankLines(locstring);
    } else {
      // Must be editorial
      var add = new Add();
      add.code = locstring;
      var oldstring = string;
      var op = pointer;
      string = locstring;
//      add.content.push(locstring);
      add.content = readString();
      string = oldstring;
      pointer = op;
      return add;
    }
  } else {
    consume(1);
    return false;
  }
}
function consumeDescription(){
  // Remove the next description thing (if it exists)
  var desc = false;
  if(string.charAt(0)==="("){
    desc = consumeTillClose(")", 1).slice(1, -1);
  }
  consumeSpace();
  return desc;
}
function consumeReadingString(){
  var reading = false;
  if(string.charAt(0)==='"'){
    reading = consumeTillClose('"', 1).slice(1, -1);  
  }
  consumeSpace();
  return reading;
}
function consumeWitnesses(){
  var witnesses = [];
  var curWit = false;
  var cur = string.charAt(0);
  var prevlength = string.length;
  var orig = string;
  var i = 0;
  consume(1);
  while(cur!==":" && cur!=="}"){
    if(prevlength===string.length) {
      console.log(["iteration number "+i+" of consumeWitnesses reported no witnesses at char `"+cur+"`", 
                   string, i, orig, cur, witnesses]);
      return witnesses;
    }
    i++;
    prevlength = string.length;
    if(cur==="("){
      var description = "";
      cur = string.charAt(0);
      consume(1);
      while(cur!==")" && cur!=="}" && cur!==":"){
        description += cur;
        var cur = string.charAt(0);
        consume(1);
      }
      if(description.length){
        witnesses.push(new WitnessDescription(description));
      }
    } else if (/\s/.test(cur)){
      if(curWit) witnesses.push(curWit);
      curWit = false;
    } else if(cur==="^"){
      cur = string.charAt(0);
      consume(1);
      curWit = new QualifiedWitness(curWit, cur==="c");
      witnesses.push(curWit);
      curWit = false;
    } else {
      if(!curWit) {
        curWit = cur;
      } else {
        curWit += cur;
      }
    }
    if(string.length){
      cur = string.charAt(0);
      consume(1);
    } else {
      if(curWit) witnesses.push(curWit);
      return witnesses;
    }
  }
  if(curWit) witnesses.push(curWit);
  consumeSpace();
  return witnesses;
}

function readChoice(){
  var locend = findClose("}", 1);
  var finalString = string.substring(locend+1);
  var finalPos = pointer+locend+1;
  var choice = new Choice();
  var prevLength = string.length;
  var showme = false;
  var stringTemp = false;
  string = string.substring(5, locend);
  consumeSpace();
  while(string.length && prevLength != string.length){
    prevLength = string.length;
    var lDescription = consumeDescription();
    var readingString = consumeReadingString();
    var rDescription = consumeDescription();
    var description = lDescription || rDescription; // FIXME: Check this
    var witnesses = consumeWitnesses();
    stringTemp = string;
    string = readingString;
    switch(description){
      case "nil":
        choice.addNilReading(witnesses, lDescription, rDescription);
        break;
      case "ins.":
        // Now what?
        choice.addReading(witnesses, string ? readString() : [], lDescription, rDescription);
        break;
      case "om.":
      case "transp.":
      case "transp. and expanded":
        choice.addOmission(witnesses, lDescription, rDescription);
        break;
      default:
        choice.addReading(witnesses, string ? readString() : [], lDescription, rDescription);
        break;
    }
    string = stringTemp;
  }
  string = finalString;
  pointer = finalPos;
  return choice;
}

var foobar;
function readChoice2(){
//  var locend = string.indexOf("}");
  var locend = findClose("}", 1);
  foobar = string.substring(0);
  var finalString = string.substring(locend+1);
  var finalPos = pointer+locend+1;
  var readingString, reading, witnesses, quoteloc, braceloc, description, stringTemp, extraDescription;
  var choice = new Choice();
  var prevLength = string.length; // Obviously wrong, but that's
                                  // deliberate -- we want the loop to
                                  // run at least once
  string = string.substring(5,locend); // 5 beacause "{var="
  while(string.length && prevLength != string.length){
    prevLength = string.length;
    quoteloc = string.indexOf('"');
    colonloc = string.indexOf(':');
    braceloc = string.indexOf('(');
    if(braceloc != -1 && (braceloc < quoteloc || quoteloc==-1)){
      string = string.substring(braceloc);
      // this clause begins with an editorial comment
      // description = consumeIf(/\(.*?\)/).slice(1, -1);
      consumeSpace();
      description = consumeTillClose(")", 1).slice(1, -1);
    } else {
      description = false;
    }
    consumeSpace();
    if(quoteloc != -1 && (colonloc===-1 || quoteloc<colonloc)){
      string = string.substring(string.indexOf('"'));
//      readingString = consumeIf(/\".*?\"/).slice(1,-1);
      readingString = consumeTillClose('"', 1).slice(1, -1);
    } else {
      readingString = false;
    }
    consumeSpace();
    braceloc = string.indexOf('(');
//    if(!description && braceloc===0){
    if(braceloc===0){
      string = string.substring(braceloc);
      // this clause ends with an editorial comment
      // description = consumeIf(/\(.*?\)/).slice(1, -1);
      consumeSpace();
      if(description){
        extraDescription = consumeTillClose(")", 1).slice(1, -1);
      } else {
        description = consumeTillClose(")", 1).slice(1, -1);
      }
    }
    consumeSpace();
//    witnesses = trimString(consumeIf(/[^:}]*/)).split(/\s+/);
    witnesses = consumeTillClose(':', 0);
    if(witnesses) {
      witnesses = witnesses.slice(0, -1);
    } else {
      // This is the bit before the }
      witnesses = consumeN(string.length);
    }
    consumeSpace();
    witnesses = witnesses.split(/\s+/);
    stringTemp = string;
    string = readingString;
    switch(description){
      case "nil":
        choice.addNilReading(witnesses);
        break;
      case "ins.":
        // Now what?
        choice.addReading(witnesses, string ? readString() : [], description, extraDescription);
        break;
      case "om.":
        choice.addOmission(witnesses, extraDescription);
        break;
      default:
        choice.addReading(witnesses, string ? readString() : [], description, extraDescription);
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
  if(document.getElementById("code")){
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
  }
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
//  rastralSize = 15;
  rastralSize = 12;
  for(var i=0; i<examples.length; i++){
    examples[i][0].draw(examples[i][1], true);
  }
}

function addSentences(string){
  var result = /[.?!]/.exec(string);
  if(result){
    sentence += result.length;
  } 
}

function locationString(){
  var selection = window.getSelection();
  var node1 = selection.anchorNode;
  var node2 = selection.focusNode;
  var o1 = selection.anchorOffset;
  var o2 = selection.focusOffset;
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

function grabExamples(obj, count, sourceArray){
  // Given a treatise text child object, an ex number and the list of
  // all music example strings, link blanks with music examples.
  if(!count) count=0;
  if(obj.objType==="Blank Example"){
    // This is blank number *count*. Match with example string and
    // parse
    obj.index = count;
    if(sourceArray.length>count){
      // FIXME: If sourceArray is too short, then something is badly
      // wrong. Should probably throw an alert. Could save doing this
      // by not checking length, but I want the web app to run
      // smoothly even when there's brokenness.
      string = sourceArray[count].substring(9, sourceArray[count].length - 10);
      obj.musicExample = new MusicExample();
    }
    count++;
  } else if(Array.isArray(obj.content)){
    // If it's an array, then it'll be something like Paragraph or
    // Span. N.B. It should never be Choice because we're only running
    // this on translated texts. If we introduce branching in
    // translations, we'll neeed to revisit.
    for(var i=0; i<obj.content.length; i++){
      count = grabExamples(obj.content[i], count, sourceArray);
    }
  }
  return count;
}

function matchExamples(treatise, text){
  // Given a treatise with `placeholder' blank music examples and the
  // text of a treatise containing the missing examples, match the
  // relevant blank with its example.
  // First, find all examples in the text
  var fullExamples = text.match(/<example.*?<\/example>/gm);
  var count = 0;
  for(var i=0; i<treatise.contents.length; i++){
    // Music examples can be buried in the hierarchy, so we need
    // recursion
    count = grabExamples(treatise.contents[i], count, fullExamples);
  }
}
