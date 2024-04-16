/**
 * @namespace parser
 */

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
  "expunction": "expunction",
  "erasure": "erasure",
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
  "italic": "italic",
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
  "expunction": "expunction",
  "erasure": "erasure",
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
  "italic": "italic",
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
  this.showfacs = showfacsimile || false;
  this.showcommentary = showcommentary || false;
  this.footnotes = [];
  this.shortSource = false;
  this.contents = [];
  this.exampleSource = false;
  this.commentary = false;
  this.commentaries = false;
  this.commentaryTables = [];
  this.examples = [];
  this.leaves = [];
  this.breaks = [];
  this.structures = false;
  this.out = outdiv ? outdiv : document.getElementById('content');
  this.drawTo = this.out;
  this.cog = false;
  this.drawToTop = false;
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
  this.fullImages = false;
  this.established = false;
  this.basefile = false;
  this.basefiles = false;
  this.sources = [];
  this.running = false;
  this.scriptSpec = false;
  this.script = false;
  this.editor = false;
  this.columns = false;
  this.hands = [];
  this.maxWidth = 0;
  this.marg = false;
  this.curCatchword = false;
  this.blobURL = false;
  this.lowestMarginal = false;
  this.marginals = [];
  this.actualWidth = false;
	this.UUIDs = {};
  this.marginalCheck = function(div){
    // NOT USED
    var rect = div.getBoundingClientRect();
    if(this.lowestMarginal &&
       this.lowestMarginal > rect.top){
      // -29 because the default margin-top is -31
      div.style.marginTop = (this.lowestMarginal-rect.top-29)+"px"; 
    }
    this.lowestMarginal = rect.bottom;
  };
  this.fixMarginalia = function(){
    var prev, rect;
    for(var i=0; i<this.marginals.length; i++){
      rect = this.marginals[i][1].getBoundingClientRect();
      if(prev && prev.bottom>=rect.top-4){
        this.marginals[i][0].domObj.style.marginTop = (prev.bottom-rect.top+4)+"px";
        rect = this.marginals[i][1].getBoundingClientRect();
      }
      prev = rect;
    }
  };
  this.edition = function(){
    return this.language!=="Latin" || this.source.length;
  };
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
    prevBook = 0;
    section = 0;
    paragraph = 0;
    hands = [];
    this.clearFootnotes();
  };
  this.parseHeaders = function(){
    //FIXME:
    if(!/[\r\n][^\r\n]+/.exec(string)) {
      // Just one line. Assume it's content
      return;
    }
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
  this.hasImages = function(){
    return this.shortSource && texts[this.shortSource]
      && texts[this.shortSource].thumbFile;
  };
  this.thumbFile = function(breaker){
    return texts[this.shortSource].thumbFile(breaker);
  };
  this.createThumb = createThumbForDoc;
  this.imageFile = function(breaker){
    return texts[this.shortSource].zoomFile(breaker);
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
  };
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
    // Title (FIXME: Add treatise navigation)
    var displayTitle = DOMDiv("titlebarheader", false, 
      DOMSpan("titlebartitle", false, (this.shortTitle ? this.shortTitle : this.title)+" "));
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
    this.cog = ul2;
    if(this.docType!=="Edited" && !(this.shortSource && texts[this.shortSource] && texts[this.shortSource].zoomFile)) {
      $(ul2).addClass("greyed");
    }
    $(this.out).addClass("contentcontainer");
    this.out.appendChild(bar);
    this.drawTo = DOMDiv("drawTo", false, false);
    this.out.appendChild(this.drawTo);
    this.drawTo.addEventListener("mousemove", showZoomForHover);
    this.drawTo.addEventListener("mouseout", zoomerOut);
    // this.drawTo.addEventListener("scroll", showZoomForHover);
	  this.drawTo.addEventListener("mousewheel", showZoomForHover, false);
	  // Firefox
	  this.drawTo.addEventListener("DOMMouseScroll", showZoomForHover, false);

    $(menu).menubar({menuIcon: true, buttons: true});
    // location
    var l = DOMDiv("cursorLocator", false, false);
    bar.appendChild(l);
    $(l).hide();
    $(this.out).mouseleave(function(e){$(this).find(".cursorLocator").hide();});
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
    } else if(this.shortSource && texts[this.shortSource] && texts[this.shortSource].zoomFile){
      // Transcript with facsimile images
      // showfacs
      item = DOMListItem(false, false, 
                         DOMAnchor("settingsmenuoption facsoptions showfacs"+
                                   (this.showfacs ? " checked" : ""),
                                   false, "Show facsimile"));
      ul.appendChild(item);
      $(item).data("doc", this);
      $(item).click(function (e){
        var anchor = $(this).find("a");
        if(anchor.hasClass("checked")) return;
        anchor.addClass("checked");
        $(this.parentNode).find(".hidefacs").removeClass("checked");
        var doc = $(this).data("doc");
        doc.showfacs = true;
        showfacsimile=true;
        docMap.updatePageSettings();
      });
      // hidefacs
      item = DOMListItem(false, false, DOMAnchor("settingsmenuoption facsoptions hidefacs"+
                                                 (this.showfacs ? "" : " checked"),
                                                 false, "Hide facsimile"));
      ul.appendChild(item);
      $(item).data("doc", this);
      $(item).click(function (e){
        var anchor = $(this).find("a");
        if(anchor.hasClass("checked")) return;
        var doc = $(this).data("doc");
        anchor.addClass("checked");
        $(this.parentNode).find(".showfacs").removeClass("checked");
        doc.showfacs = false;
        showfacsimile=false;
        docMap.updatePageSettings();
      });
    } else if(this.docType=="Translation"){
      item = DOMListItem(false, false, 
                         DOMAnchor("settingsmenuoption commentoptions showcommentary"+
                                   (this.showcommentary ? " checked" : ""),
                                   false, "Show commentary"));
      ul.appendChild(item);
      $(item).data("doc", this);
      $(item).click(function (e){
        var anchor = $(this).find("a");
        if(anchor.hasClass("checked")) return;
        var doc = $(this).data("doc");
        var pos = currentPosition(doc.drawTo);
        anchor.addClass("checked");
        $(this.parentNode).find(".hidecommentary").removeClass("checked");
        doc.showcommentary = true;
        doc.forceredraw = true;
        showcommentary=true;
        docMap.updatePageSettings();
        doc.draw();
        fixHeight(true);
        pos.simpleScroll(doc.drawTo);
      });      
      item = DOMListItem(false, false, DOMAnchor("settingsmenuoption commentoptions hidecommentary"+
                                                 (this.showcommentary ? "" : " checked"),
                                                 false, "Hide commentary"));
      ul.appendChild(item);
      $(item).data("doc", this);
      $(item).click(function (e){
        var anchor = $(this).find("a");
        if(anchor.hasClass("checked")) return;
        var doc = $(this).data("doc");
        var pos = currentPosition(doc.drawTo);
        anchor.addClass("checked");
        $(this.parentNode).find(".showcommentary").removeClass("checked");
        doc.showcommentary = false;
        doc.forceredraw = true;
        showcommentary=false;
        docMap.updatePageSettings();
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
      doc.clearFootnotes();
      $(doc.out).remove();
      $("#cursorLocator").remove();
      docMap.removeDoc(doc);
    });
  };
  this.refreshCommentary = function(){
    if(!(this.commentaryTables && this.commentaries && this.commentaries.commentaries)) {
    }
    for(var i=0; i<this.commentaryTables.length; i++){
      this.commentaryTables[i].fillContainer();
    }
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
    commentary = this.commentaries;
    commentaryTables = [];
    complaint = [];
    pointer = 0;
    string = text;
    try {
      this.parseHeaders();
    } catch (x) {
      console.log("hmm...");
    }
    margin = false;
    var tS = [];
    while(string!=""){
        var para = readPara();
        if(para){
          para.hang = hang;
          hang = false;
          this.contents.push(para);
          paragraph+=(para.code.match(/¶¶/g)||[]).length;
          if(para.musicOnly()) sentence--;
        }
/*      try{
        var para = readPara();
        if(para){
          para.hang = hang;
          hang = false;
          this.contents.push(para);
          paragraph+=(para.code.match(/¶¶/g)||[]).length;
//          console.log(para.book, para.chapter, para.paragraph, (para.code.match(/¶¶/g)||[]).length);
          if(para.musicOnly()) sentence--;
          // this.textualStructures.push(para.textualStructures());
        }
      } catch (x) {
        console.log(x);
        var para = new Paragraph(true);
        para.contents.push(new Text("Error"));
        this.contents.push(para);
      }*/
    }
    if(margin) this.marg = true;
    margin = false;
    this.commentaryTables = commentaryTables;
    this.refreshCommentary();
    this.hands = hands;
  };
  this.scrollFromURL = function(){
    if(pageSettings.settings.book || pageSettings.settings.chapter){
      this.setScrollPos(pageSettings.settings.book ? Math.max(pageSettings.settings.book, 1) : 0,
                        pageSettings.settings.chapter ? pageSettings.settings.chapter : 0, 0, 
                        pageSettings.settings.para ? pageSettings.settings.para : 0, 0, true);
    }
  };
  this.toTEI = function(){
    var ocd = curDoc;
    curDoc = this;
    var doc = new TEIDoc();
    doc.headers(this);
    for(var i=0; i<this.contents.length; i++){
      this.contents[i].toTEI(doc);
    }
    curDoc = ocd;
    return doc;
  };
  this.draw = function(){
    curDoc = this;
    margin = this.marg;
		inVerse = false;
    this.showvar = this.showvars || this.source;
    this.breaks = [];
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
    if((this.docType==="Edited" || !this.docType) && punctuationStyle ==="modern"){
      allowCapitalisation = true;
    } else{
      allowCapitalisation = false;
    }
    $(this.out).empty();
    if(titleBar) {
      this.titleBar();
    } else {
      $(this.out).addClass("drawTo");
    }
    this.drawToTop = $(this.drawTo).offset().top;
    this.writeHeaders();
    if(this.exampleSource) matchExamples(this, this.exampleSource);
    currenttextparent = this;
    for(texti=0; texti<this.contents.length; texti++){
      pari = texti;
      var domEl = this.contents[texti].toHTML();
      if(domEl){
        this.drawTo.appendChild(domEl);
        //domEl.addEventListener("mousemove", showZoomForHover);
      }
    }
    this.fixMarginalia();
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
      this.actualWidth = this.prevWidth+marg;
      refreshWidths();
    } else {
//      this.drawTo.style.width = this.out.getBoundingClientRect().width-8+"px";
      //    this.out.style.width = Math.max(this.maxWidth+5, 450)+"px";
      this.actualWidth = this.drawTo.getBoundingClientRect().width;
      this.out.style.width = (this.prevWidth+marg)+"px";
      refreshWidths();
    }
    for(var comp=0; comp<complaint.length; comp++){
      writeToDebugger("<p>"+complaint[comp]+"</p>");
    }
    if(docMap && docMap.docs && docMap.docs.length){
      $("div.para").dblclick(alignVersions);
    }
    this.forceredraw = false;
    //if(pageSettings.settings.book || pageSettings.settings.chapter){
    //   this.setScrollPos(pageSettings.settings.book ? Math.max(pageSettings.settings.book, 1) - 1 : 0,
    //                     pageSettings.settings.chapter ? pageSettings.settings.chapter : 0, 0, 0, 0, true);
    // }
    showvariants = oldshowvariants;
    punctuationStyle = oldpunctuationStyle;
    if(this.hasImages() && false) this.createThumb();
    $(".marginal").css("width", (this.drawTo.getBoundingClientRect().width-20)+"px");
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
    replaceBreakers();
    this.refreshCommentary();
    ///////////////////
    if(!editorMode
//       && false
      ){
      var TEIDoc = this.toTEI();
    // /*
//     var serializer = new XMLSerializer();
// //    var fileContent = [TEIDoc.tree.outerHTML];
//     var fileContent = [serializer.serializeToString(TEIDoc.doc)];
    // var blob = new Blob(fileContent, {type: "application/xml"});
      var blob = TEIDoc.blobify();
      var url = window.URL || window.webkitURL; // get rid of this when suffix removed in releases
      if(this.blobURL) url.revokeObjectURL(this.blobURL);
      this.blobURL = url.createObjectURL(blob);
      var link = DOMAnchor('TEI', false, "TEI", this.blobURL);
      var infobuttons = $(this.drawTo).find('.infoButtons')[0];
      infobuttons.appendChild(link);
      var img = DOMImage(false, false, "https://i.creativecommons.org/l/by-nc/4.0/80x15.png");
      var license = DOMAnchor('license', false, img, "http://creativecommons.org/licenses/by-nc/4.0/");
      img.setAttribute("alt", "All text in this edition is licensed under a Creative Commons Attribution-NonCommercial 4.0 International License");
      license.setAttribute("title","All text in this edition is licensed under a Creative Commons Attribution-NonCommercial 4.0 International License");
      infobuttons.appendChild(license);
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
      $(thisDiv).find(".catch").remove();
      var catches  = DOMDiv('catch', false, false);
      thisDiv.insertBefore(catches, thisSVG);
      examples[i][0].draw(examples[i][1], nocache);
      // for(var catchi=0; catchi<examples[i][0].catchwords.length; catchi++){
      //   var eg = examples[i][0];
      //   var c = eg.catchwords[catchi].toHTML();
      //   catches.appendChild(c);
      //   if(eg.catchwords[catchi].yOffset){
      //     var span = $(c).find(".catchword")[0];
      //     span.style.top = (eg.catchwords[catchi].yOffset-(eg.bbox.y < 0 ? eg.bbox.y -1 : 0))+"px";
      //   }
      // }
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
        if($(thisDiv).is(":visible")){
          // console.log(this.SVG.getBBox().width, this.SVG.getBoundingClientRect().width, i);
          thisDiv.style.width = thisSVG.getBBox().width+2+"px";
        } else {
          console.log("interesting", i);
        }
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

function readPara(suppressNodeNumbers){
  var ob = book;
  var oldChap = chapter;
  var para = new Paragraph(suppressNodeNumbers);
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
  currentTextParent=para; 
  ///////
  para.content = readString();
  if(indent){
    para.classes.push("indent");
  }
  if(centre){
    para.classes.push("centre");
  }
  correctNexts(para);
  para.book = book || ob;
  para.chapter = chapter || oldChap;
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
        sb = lastIsSentenceBreak;
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
      case "^":
        fresh = readSup();
        if(fresh){
          if(latest){
            fresh.previous = latest;
            latest.next = fresh;
          }
          content.push(fresh);
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
          var olds = sentence;
          var ann = new Annotation();
          ann.code=comment.slice(2, -2);
          if(latest) {
            ann.previous = latest;
            latest.next = ann;
          }
          var os = string;
          var op = pointer;
          var octp = currentTextParent;  
          currentTextParent=ann;
          string = ann.code;
          ann.contents = readString();
          string = os;
          pointer = op;
          sentence = olds;
          currentTextParent=octp;
          content.push(ann);
        }
        break;
      case "\t":
        // At the moment, there's only one meaning -- a right align
        // tab stop in an index. Expect more
        if(inIndex){
          var end = string.indexOf("\n");
          var end2 = string.indexOf("</index>");
          if(end===-1) end = string.length;
          if(end2>-1 && end2 < end) end = end2;
          var futureString = string.substring(end);
          var futurePointer = pointer+end;
          var r = new RightStop();
          string = string.substring(1, end);
          r.code = string;
          r.content = readPara(true);
          string = futureString;
          pointer = futurePointer;
          content.push(r);
        } // if not, don't know what it means
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
        lastIsHeading=false;
        lastIsVerse=false;
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
        var punc = string.substring(1,3).match(/[,.¶:;()–\-\—!?\ ‘’]+/);
        if (string.substring(0,2) ==="{-"){
          var close = string.indexOf("}");
          content.push(new RemovedPunctuation(string.substring(2,close)));
          consume(1+close);
        } else if (string.substring(0,2) ==="{+"){
          var close = string.indexOf("}");
          content.push(new InsertedPunctuation(string.substring(2,close)));
          consume(1+close);
        } else if(punc && punc[0] && punc[0].length>1){
//					console.log(string.substring(0,4), punc, latest);
          content.push(new Punctuation(punc[0]));
          if(latest){
            latest.next = content[content.length-1];
            latest.next.previous = latest;
          }
          consumeIf(/\{[,.¶:;()–\-\—!?\ ‘’]+\}/);
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
          var ex = new BlankExample();
          content.push(ex);
          if(latest){
            latest.next = content[content.length-1];
            latest.next.previous = latest;
          }
          var nex = new CommentaryTable();
          nex.n = ex.exampleno;
          content.push(nex);
          commentaryTables.push(nex);
          ex.next = nex;
          nex.previous = ex;
        } else if(consumeIf("{hang}")){
          hang=true;
        } else if(knownTag()) {
          content.push(readOneOffTag());
        } else {
          content.push(readChoice(maybeNewSentenceCheck(content)));
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
        if(string.length>1 || currentTextParent.objType==="Span") sentence++;
      default:
        sb=/["'”’‘“]/.test(string.charAt(0)) ? sb : /[?!.]/.test(string.charAt(0));
        if(latest && latest.objType == 'text' && !/[?!.]/.test(latest.content)){
          content[content.length -1].addChar(string.charAt(0));
        } else {
          if(maybeNewSentenceCheck(content) && /^\s*[A-Z]/.exec(string)){
              sentence++;
          }
          if(/^\s*[_]/.exec(string)){
            var newtext = /^\s/.exec(string) ? new Text(" ") : new Text("");
            consumeSpace();
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
      var octp=currentTextParent;
      currentTextParent=span;
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
      currentTextParent=octp;
      return span;
    }
  } else{
    return false;
  }
}

function readSup(){
  var el = new Span();
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
      return false;
    }
  } else {
    newString = string.substring(end+1);
    newPointer = pointer+end;
    string = string.substring(0,end);
  }
  el.type = "sup";
  var octp = currentTextParent;  
  currentTextParent=el;
  el.content = readString();
  string = newString;
  pointer = newPointer;
  currentTextParent=octp;  
  return el;
}

function readTag(){
  var loc = string.indexOf(">");
  if(loc > 0){
    if(string.substring(1,3)==="l/"){
      consume(4);
      return new Newline();
    } else if (string.substring(1,8) === "nocount"){
      // introduces non-counting content
      consume(9);
      return new NoCount();
    } else if (string.substring(1,9) === "/nocount"){
      // ends non-counting content
      consume(10);
      return new EndNoCount();
    } else if(string.substring(1,9) == "treatise"){
      consume(10);
//      FIXME: For now, this is meaningless to me
      return false;
    } else if(string.substring(1,10) == "/treatise"){
      consume(11);
      return false;
    } else if(string.substring(1, 8)=="chapter"){
      // Close tag is meaningless here -- we are always in a chapter
      var chap = new Chapter();
      if(string.charAt(8)===":"){
        consume(9);
        consumeSpace();
        loc = string.indexOf(">");
        chap.chapter = string.substring(0,loc);
        chapter = chap.chapter;
        consume(loc+1);
      } else {
        consume(9);
      }
      return chap;
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
    } else if (string.substring(1, 6)=="index") {
      return readTabularIndex();
      // consume(loc+1);
      // return new Index();
    } else if (string.substring(1, 7)=="/index") {
      consume(loc+1);
      return new ChapEnd();
    } else if (string.substring(1, 15)=="tabularDiagram") {
      return readTabularDiagram();
    } else if (string.substring(1, 11)=="conclusion") {
      consume(loc+1);
      return new Conclusion();
      // var chap = new Chapter();
      // chap.code = "<conclusion>";
      // chap.special = "Conc.";
      // chap.chapter -=1;
      // chapter -= 1;
      // return chap;
    } else if (string.substring(1, 9)==="explicit"){
      consume(loc+1);
      return new Explicit();
    } else if (string.substring(1, 10)=="/explicit") {
      consume(loc+1);
      return new ChapEnd();
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
          var lbracket = -1; //;string.indexOf("(");
          if(lbracket>-1 && lbracket<tagend){
            var rbracket = string.indexOf(")");
            if(rbracket>-1 && rbracket<tagend){
              m.margin = trimString(string.substring(colon+1, lbracket));
              m.side = trimString(string.substring(lbracket+1,rbracket));
            }
          } else {
            m.margin = trimString(string.substring(colon+1, tagend));
          }
        }
        string = string.substring(tagend+1, end);
        m.code = string;
        m.content = readPara();
        string = os;
        pointer = op;
        consumeSpace(true);
        return m;
      }
      return false;
    } else if(string.substring(1, 4)=="img"){
      var end = string.indexOf("</img>");
      var end2 = string.indexOf("/>");
      if(end2>-1 && end2<end) end=end2;
      if(end>4){
        var o = new RawHTML();
        o.code = string.substring(0, end+6);
        string = string.substring(end+6);
        var parent = DOMDiv('Raw', false, $.parseHTML(o.code)[0]);
        o.domObj = parent;
        pointer = pointer + end + 6;
        return o;
      }
      return false;
    }else if (string.substring(1, 11)==="commentary"){
      var end = string.indexOf("</commentary>");
      if(end>11){
        var c = new Commentary();
        var tagend = string.indexOf(">");
        var os = string.substring(end+13);
        var op = pointer+end+13;
        var och = chapter;
        var ob = book;
        var osc = section;
        var ost = sentence;
        if(tagend>5) {
          // we have some useful information
          var colon = string.indexOf(":");
          c.info = string.substring(colon+1, tagend);
        }
        string = string.substring(tagend+1, end);
        c.code = string;
        c.content = readPara();
        string = os;
        pointer = op;
        chapter = och;
        book = ob;
        section = osc;
        sentence = ost;
        consumeSpace(true);
        return c;
      }
      return false;
    } else if(string.substring(1, 10)=="catchword" || string.substring(1,10)=="signature"){
      var margType = string.substring(1, 10);
      var end = string.indexOf("</"+margType+">");
      if(end>10){
        var c = new Catchword();
        c.tag = margType;
        var tagend = string.indexOf(">");
        var os = string.substring(end+12);
        var op = pointer+end+12;
        if(tagend>10) {
          // we have some useful information
          var colon = string.indexOf(":");
          if(colon>-1 && colon<tagend){
            c.position = trimString(string.substring(colon+1, tagend));
          }
        }
        string = string.substring(tagend+1, end);
        c.code = string;
        c.content = readPara();
        string = os;
        pointer = op;
//        curCatchword = c;
        return c;
      }
      return false;
    } else if (string.substring(1, 6)==="table"){
      return readTable();
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
        var octp = currentTextParent;  
        currentTextParent=span;
        span.content = readString();
        currentTextParent = octp;  
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
        var octp = currentTextParent;
        currentTextParent=span;
        op = pointer;
        string = content;
        span.code = string;
        span.content = readString();
        string = oldstring.substring(fake ? string.length : locend+(tag.length+3));
        pointer = op+locend+(fake ? 0 : tag.length+3);
        if(tag==="heading") {
          inHeading=false;
          lastIsHeading = true;
          sentence = 0;
        }
        if(tag==="verse"){
          lastIsVerse = true;
        }
        if(inVerse) sentence = inVerse;
        inVerse = false;
        currentTextParent = octp;
        return span;
      }
    }
  }
  string = string.substring(1);
  return false;
}
function parseCols(columnString){
  return columnString.split(/[ ,]+/);
}
function readTabularDiagram(){
  var diag = new DiagramTable();
  var colon = string.indexOf(":");
  var bracket = string.indexOf(">");
  if(bracket==-1) return false;
  if(colon>-1 && colon<bracket){
    var extras = string.substring(colon+1, bracket);
    // FIXME: do something with this
  }
  consume(bracket+1);
  var close = string.indexOf("</tabularDiagram>");
  var finalString = close===-1 ? "" : string.substring(close+8);
  string = close===-1 ? string : string.substring(0, close);
  consumeSpace();
  diag.setRows(readTableLikeContent());
  string = finalString;
  return diag;
}
function readTabularIndex(){
  var index = new TabularIndex();
  var bracket = string.indexOf(">");
  if(bracket==-1) return false;
  consume(bracket+1);
  var close = string.indexOf("</index>");
  var finalString = close===-1 ? "" : string.substring(close+8);
  string = close===-1 ? string : string.substring(0, close);
  consumeSpace();
  index.rows = readTableLikeContent();
  string=finalString;
  return index;
}
function readTable(){
  var table = new Table();
  var colon = string.indexOf(":");
  var bracket = string.indexOf(">");
  if(colon>-1 && colon<bracket){
    var cols = string.substring(colon+1, bracket);
    table.columns = parseCols(trimString(cols));
  }
  consume(bracket+1);
  var close = string.indexOf("</table>");
  var finalstring = close===-1 ? "" : string.substring(close+8);
  string = close===-1 ? string : string.substring(0, close);
  consumeSpace();
  table.rows = readTableLikeContent();
  string = finalstring;
  return table;
}
function readRowCells(row, rowstring, outrows){
  var cells = rowstring.split(/\t/);
  for(var j=0; j<cells.length; j++){
    string = cells[j];
    var cellContent = new Span();
    var octp = currentTextParent;  
    currentTextParent=cellContent;
    var content = readString();
    currentTextParent = octp;
    cellContent.type = "CellContents";
    for(var celli=0; celli<content.length; celli++){
      if(content[celli].objType ==="Column/Page"){
        // A break in the middle of a cell has wider effects
        // FIXME: what about in paragraph/span?
        var bp = row.cells.length;
        row.cells.push(cellContent);
        // new row is column break
        if(outrows) outrows.push(content[celli]);
        // now we start a new (continuation) row
        row = new TableRow();
        row.isContinuation = true;
        if(outrows) outrows.push(row);
        for(var cellj=0; cellj<bp; cellj++){
          // Make empty cells
          cellContent = new Span();
          cellContent.type = "CellContents";
          row.cells.push(cellContent);
        }
        cellContent = new Span();
        cellContent.type = "CellContents";
      } else {
        cellContent.content.push(content[celli]);
      }
      // cellContent.content = readString();
      //   row.cells.push(cellContent);
    }
    row.cells.push(cellContent);
  }
  if(outrows) {
    return outrows;
  } else return row;
}

function readRowVariant(row, str, outrows){
  // Whole-row variants in tables are troublesome because of the
  // complexity of handling multiple cells. In an ideal world,
  // variants spanning parts of cells on multiple rows, or overflowing
  // the table would be allowable, but for now, it'll just be whole
  // individual rows.
  var os = string;
  string = str;
  var starts = string.indexOf("{var");
  var locend = findClose("}", starts+1);
  var choice = new Choice();
  outrows.push(choice);
  var prevLength = string.length;
  var stringTemp;
  string = string.substring(starts+5, locend);
  while(string.length && prevLength!=string.length){
    prevLength = string.length;
    var lDescription = consumeDescription();
    var readingString = consumeReadingString();
    var rDescription = consumeDescription();
    var description = lDescription || rDescription; // FIXME: Check this
    var witnesses = consumeWitnesses();
    var row;
    stringTemp = string;
    string = readingString;
    switch(description){
      case "nil":
        choice.addNilReading(witnesses, lDescription, rDescription);
        break;
      case "ins.":
        // Now what?
        row = new TableRow();
        choice.addReading(witnesses, string ? [readRowCells(row, string)] : [], lDescription, rDescription);
        break;
      case "om.":
      case "transp.":
      case "transp. and expanded":
        choice.addOmission(witnesses, lDescription, rDescription);
        break;
      default:
        row = new TableRow();
        choice.addReading(witnesses, string ? [readRowCells(row, string)] : [], lDescription, rDescription);
        break;
    }
    string = stringTemp;
  }
  string = os;
  return outrows;
}

function rowVariant(str){
  // Returns true if string is a single variant
  var os = string;
  string = str;
  var varstarts = string.indexOf("{var");
  if(varstarts===-1) {
    string = os;
    return false;
  }
  var close = findClose("}", varstarts+1);
  if(/\S/.test(string.substring(close+1))
     || /\S/.test(string.substring(0, varstarts))) {
    string = os;
    return false;
  }
  string = os;
  if(debug) console.log("variant spotted in ", str);
  return true;
}
function readTableLikeContent(){
  // for table and index, split into rows and then cells
  var rows = string.split(/[\u0085\u2028\u2029\r\n]+/);
  var row;
  var outrows = [];
  for(var i=0; i<rows.length; i++){
    if(/\S/.test(rows[i])){
      row = new TableRow();
      if(/^\[-.*-\]/.exec(rows[i])) {
        string = rows[i];
        outrows.push(readLocation());
        rows[i] = string;
      }
      outrows.push(row);
      if(rowVariant(rows[i])){
        outrows = readRowVariant(row, rows[i], outrows);
      } else {
        outrows = readRowCells(row, rows[i], outrows);
      }
    }
  }
  return outrows;
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
      var col = new Column();
      // chap.location = locstring.substring(1, locstring.length -1);
      parseColumn(locstring.substring(1, locstring.length -1), col);
      consumeSpace();
      return col;
    } else if(locstring == "-"){
      consumeSpace();
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
      var octp = currentTextParent;  
      currentTextParent=add;
      string = locstring;
//      add.content.push(locstring);
      add.content = readString();
      currentTextParent = octp;  
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
      if(debug) console.log(["iteration number "+i+" of consumeWitnesses reported no witnesses at char `"+cur+"`", 
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
        cur = string.charAt(0);
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
      curWit = new QualifiedWitness(curWit, cur==="c", cur);
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

function readChoice(maybeNewSentence){
  var locend = findClose("}", 1);
  var finalString = string.substring(locend+1);
  var finalPos = pointer+locend+1;
  var choice = new Choice();
  var prevLength = string.length;
  var showme = false;
  var stringTemp = false;
  var octp = currentTextParent;
  currentTextParent=choice;
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
        if(maybeNewSentence && string && /\s*[A-Z]/.exec(string)) sentence++;
        choice.addReading(witnesses, string ? readString() : [], lDescription, rDescription);
        break;
    }
    string = stringTemp;
    maybeNewSentence = false;
  }
  currentTextParent = octp;
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
  var octp = currentTextParent;
  currentTextParent=choice;
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
  currentTextParent = octp;
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
  // check for - ... - explicitly at the beginning and end of tag to make sure it's a columnp (AP 16.04.2024)
  return tag.match(/^-[^\[\]]*-$/);
}

function parseColumn (colSpec, col){
  var colHeightPos = colSpec.search(/[A-Z]*$/);
  if(colHeightPos===-1){
    // Normal case
  } else {
    //column height is specified
    col.startPos = colSpec.charAt(colHeightPos);
    if(colSpec.length> colHeightPos+1){
      col.endPos = colSpec.charAt(colHeightPos+1);
    }
    col.location = colSpec.substring(0, colHeightPos);
    col.id = col.location;
  }
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
    var chaps = modcode.match(/(<chapter[^>]*>|<prologue>|<index>|<conclusion>)/g);
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

/** @memberof parser
 * Given a treatise text child object, an ex number and the list of
 * all music example strings, link blanks with music examples.
 * @param obj treatise text child object
 * @param {int} count counter of examples
 * @param {Array} sourceArray array for all examples
 */
function grabExamples(obj, count, sourceArray){
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

/** @memberof parser
 * Given a treatise with `placeholder' blank music examples and the
 * text of a treatise containing the missing examples, match the
 * relevant blank with its example.
 * First, find all examples in the text
 * @param {TreatiseDoc} treatise Treatise object
 * @param {string} text edited text of treatise
 */
function matchExamples(treatise, text){
  var fullExamples = text.match(/<example(.|\n|\r)*?<\/example>/gm);
  var count = 0;
  for(var i=0; i<treatise.contents.length; i++){
    // Music examples can be buried in the hierarchy, so we need
    // recursion
    count = grabExamples(treatise.contents[i], count, fullExamples);
  }
}
function HTMLParser(aHTMLString){
  var html = document.implementation.createDocument("http://www.w3.org/1999/xhtml", "html", null),
    body = document.createElementNS("http://www.w3.org/1999/xhtml", "body");
  html.documentElement.appendChild(body);

  body.appendChild(Components.classes["@mozilla.org/feed-unescapehtml;1"]
    .getService(Components.interfaces.nsIScriptableUnescapeHTML)
    .parseFragment(aHTMLString, false, null, body));

  return body;
}
