var pathtotexts ="../Collated texts/";
var textname = "De notis et pausis";
var variants = ["BU", "G", "Br1", "V"];
editable = false;
singlePaneMode = editorMode;
nocache = true;
//infoButtons = !editorMode;
infoButtons = true;
showtitle = false;
copyTextDisplay = false;
editorDisplay = "hide";
// editorDisplay = false;
dateDisplay = "hide";
extraInfoDisplay = "hide";
sourceDisplay = "hide";
cssloc = "../../../GUIEditor";
rastralSize = 10;
titleBar = !editorMode;

function curChapter(){
  return pageSettings.settings.chapter || 0;
}
function curBook(){
  return pageSettings.settings.book || 0;
}
function curSection(){
  return pageSettings.settings.section || 0;
}
function curPara(){
  return pageSettings.settings.paragraph || 0;
}

// Fixes a bug in firefox: http://stackoverflow.com/a/633031
$.ajaxSetup({'beforeSend': function(xhr){
    if (xhr.overrideMimeType)
        xhr.overrideMimeType("text/plain");
    }
});

function grabText(object){
  var flip = punctuationStyle==="MS";
  punctuationStyle = "modern";
  var domobj = object.toHTML();
  if(flip) punctuationStyle = "MS";
  return domobj ? domobj.textContent : "";
}

function nchars(rchar, n){
  return new Array(n+1).join(rchar);
}

function roman(n){
  var rom = "";
  while(n>0){
    if(n>=1000){
      rom += "m";
      n -= 1000;
    } else if (n>=900){
      rom += "cm";
      n -= 900;
    } else if (n>=500){
      rom += "d";
      n -= 500;
    } else if (n>=100 && n<400){
      rom += "c";
      n -= 100;
    } else if (n>=400){
      rom += "cd";
      n -= 400;
    } else if (n>=90){
      rom += "xc";
      n -= 90;
    } else if (n>=50){
      rom += "l";
      n -= 50;
    } else if (n>=10 && n<40){
      rom += "x";
      n -= 10;
    } else if (n>=40){
      rom += "xl";
      n -= 40;
    } else if (n==9){
      return rom + "ix";
    } else if (n>=5){
      rom+="v";
      n-=5;
    } else if (n==4){
      return rom+"iv";
    } else if (n<4){
      rom += "i";
      n -= 1;
    } 
  }
  return rom;
}

function romanReference(a, b, c){
  if(b==="p") {
    return "Prol.";
  } else if (b==="c"){
    return "Conc.";
  } else if (!isFinite(b)){
    console.log(b);
    return b;
  }
  var ref = [];
  if(a && a!=="0") ref.push(roman(Number(a)).toUpperCase());
  if(b && b!=="0") ref.push(roman(Number(b)));
  if(c && c!=="0") ref.push(c);
  if(!ref.length){
    return "Section...";
  } else {
    return ref.join(".");
  }
}
function getSelected(select){
  return $(select).children(":selected")[0];
}

function jqNavSelect(tDoc, nav){
  var structures = navPoints(tDoc)[3];
  var book = 0;
  var chapter = 0;
  var section = 0;
  var options = [];
  var content, reference, sbreak, option;
  var heading = [];
  if (!nav) nav = document.getElementById("nav");
  var currentp = false;
  option = DOMAnchor("jump-to-start", false, 
                     DOMTextEl("b", false, false, tDoc.shortTitle ? tDoc.shortTitle : tDoc.title));
  var li = DOMListItem("navitem ui-menu-item", false, option);
  nav.appendChild(li);
  option.role = "menuitem";
  $(option).data("obj", false);
  $(option).data("ref", false);
  $(option).data("treatise", tDoc.group);
  $(option).data("tdoc", tDoc);
  var closure = function(e){
    pageSettings.updateSettings([["book", false], ["chapter", false], 
                                 ["section", false]]);
    $($(this).data("tdoc").drawTo).scrollTo(0);
  };
  $(option).focus(closure);
  $(option).click(closure);
  for(var i=0; i<structures.length; i++){
    sbreak = structures[i];
    if(sbreak.length){
      for(var b=0; b<sbreak.length; b++){
        switch (sbreak[b].tag.objType){
          case "Book":
            book+=1;
            chapter=0;
            break;
          case "Prologue":
            chapter = "p";
            break;
          case "Index":
            chapter = "Index";
            break;
          case "Conclusion":
            chapter = "c";
            break;
          case "Chapter":
            if(typeof(chapter)==="string"){
              // chapter = 0;
              chapter = 1;
            } else if(isFinite(sbreak[b].tag.chapter)){
              chapter+=1;
            } else {
              chapter = sbreak[b].tag.chapter;
            }
            break;
          case "Section":
            section+=1;
            break;
        }
      }
      if(sbreak[0].tag.code==="<prologue>"){
        heading = sbreak[0].head 
          ? (sbreak[0].head.length > 52 ? sbreak[0].head.substring(0, 50)+"…" : sbreak[0].head)
          : (tDoc.language ==="English" ? "Prologue" : "Prologus") ;
        reference = "Prol.";
      } else if (sbreak[0].tag.code==="<conclusion>"){
        heading = sbreak[0].head 
          ? (sbreak[0].head.length > 52 ? sbreak[0].head.substring(0, 50)+"…" : sbreak[0].head)
          : (tDoc.language ==="English" ? "Conclusion" : "Conclusio") ;
        reference = "Conc.";
      } else if (sbreak[0].tag.code==="<index>"){
        heading = sbreak[0].head 
          ? (sbreak[0].head.length > 52 ? sbreak[0].head.substring(0, 50)+"…" : sbreak[0].head)
          : (tDoc.language ==="English" ? "Index" : "Index") ;
        reference = "Index";
      } else {
        heading = sbreak[0].head.length > 52 ? sbreak[0].head.substring(0, 50)+"…" : sbreak[0].head;
        reference = romanReference(book, chapter, section);
      }
      content = sbreak[0].tag;
      currentp = pageSettings && book == pageSettings.settings.book-1
        && chapter == pageSettings.settings.chapter -1
        && (!section || section == pageSettings.settings.section);
      if(tDoc.scrollpos.book && tDoc.scrollpos.book==book 
         && tDoc.scrollpos.chapter==chapter && tDoc.scrollpos.section==section){
        currentp = true;
      }
      tDoc.scrollpos.book = book;
      tDoc.scrollpos.chapter = chapter;
      tDoc.scrollpos.section = section;
      // tDoc.scrollpos.chapter = book;
      // tDoc.scrollpos.section = book;
      var richref = DOMSpan(false, false, DOMTextEl("b", false, false, reference+"  "));
      if(heading) richref.appendChild(document.createTextNode(heading));
      if(reference==="Prol."||reference==="Conc."){
        option = DOMAnchor("jump-"+book+"_"+reference.charAt(0).toLowerCase()+(currentp ? " selected" : ""),
                           false, richref);
      } else {
        option = DOMAnchor("jump-"+reference.replace(".", "_")+(currentp ? " selected" : ""),
                           false, richref);
      }
      options.push(option);
      var li = DOMListItem("navitem ui-menu-item", false, option);
      nav.appendChild(li);
      option.role = "menuitem";
      $(option).data("obj", content);
      $(option).data("ref", (section ? [book, chapter, section] : [book, chapter]).join("."));
      $(option).data("treatise", tDoc.group);
      $(option).data("tdoc", tDoc);
      $(option).focus(function(e){
//        window.location.hash = "#"+$(this).data("ref");
        if(false && ($(this).data("ref")==="Prol." ||
                     $(this).data("ref")==="Conc.")){
          pageSettings.updateSettings([["book", false], ["chapter", $(this).data("ref")], 
                                       ["section", false]]);
          if(docMap && docMap.docs.length){
            for(var i=0; i<docMap.docs.length; i++){
              scrollToSpecial(docMap.docs[i], $(this).data("ref"));
            }
          } else {
            $("#content").scrollTo($(this).data("obj").DOMObj, 500);
          }
        } else {
          var s = $(this).data("ref").split(".");
          pageSettings.updateSettings([["book", s[0]], ["chapter", s[1]], ["section", s[2]]]);
          if(docMap && docMap.docs.length){
            for(var i=0; i<docMap.docs.length; i++){
              scrollToStructure(docMap.docs[i], s[0], s[1], s.length>2 ? s[2] : 0);
            }
          } else {
            $("#content").scrollTo($(this).data("obj").DOMObj, 500);
          }
        }
      });
      $(option).click(function(e){
//        window.location.hash = "#"+$(this).data("ref");
        var s = $(this).data("ref").split(".");
        $(this).data("tdoc").setScrollPos(s[0], s[1], s[2], 0, 0, true);
        
      });
    }
  }
  $(nav).change(function(e){
    var sel = getSelected(this);
//    window.location.hash = "#"+$(sel).data("ref");
    var s = $(this).data("ref").split(".");
    pageSettings.updateSettings([["book", s[0]], ["chapter", s[1]], ["section", s[2]]]);
    if(docMap && docMap.docs.length){
//      var s = $(sel).data("ref").split(".");
      for(var i=0; i<docMap.docs.length; i++){
        scrollToStructure(docMap.docs[i], s[0], s[1], s.length>2 ? s[2] : 0);
      }
    } else {
      $("#content").scrollTo($(sel).data("obj").DOMObj, 500);
    }
  });
//  $("#MenuBar1").menubar({menuIcon: true, buttons: true, autoExpand: true});
  return structures;
}

function scrollToStructure(tDoc, book, chapter, section){
  simpleScrollTo(tDoc.drawTo, $(tDoc.drawTo).offset().top, book, chapter, section, 0);
  return;
  if(tDoc.structures){
    var booki=0;
    var chapteri=0;
    var sectioni=0;
    var s = tDoc.structures;
    var sb = false;
    for(var i=0; i<s.length; i++){
      sb = s[i];
      if(sb.length){
        for(var si=0; si<sb.length; si++){
          switch(sb[si].tag.objType){
            case "Book":
              booki+=1;
              chapteri=0;
              break;
            case "Chapter":
              chapteri+=1;
              break;
            case "Section":
              sectioni+=1;
              break;
          }
        }
        if(booki== book){
          if(chapteri==chapter){
            if(sectioni==section){
              $(tDoc.out).scrollTo(sb[0].tag.DOMObj);
              return;
            } 
          } else if(chapteri > chapter){
            $(tDoc.out).scrollTo(s[Math.max(0, i-1)][0].tag.DOMObj);
            return;
          }
        } else if(booki>book){
          $(tDoc.out).scrollTo(s[Math.max(0, i-1)][0].tag.DOMObj);
          return;
        }
      }
    }
  }
}
function scrollToFragment(){
  if(docMap && docMap.docs.length){
    for(var i=0; i<docMap.docs.length; i++){
      simpleScrollTo(docMap.docs[i].out, $("#content").offset().top, // broken
        curBook() , curChapter(), curSection(), curPara());
    }
  }
}
function scrollFromHash(hash){
  hash = hash ? hash : window.location.hash;
  if(hash.length > 1){
    var pos = hash.substring(1).split(".").map(Number);
    if(docMap && docMap.docs.length){
      for(var i=0; i<docMap.docs.length; i++){
        simpleScrollTo(docMap.docs[i].out, pos[0], 
          pos.length>1 ? pos[1] : 0, 
          pos.length>2 ? pos[2] : 0,
          pos.length>3 ? pos[3] : 0);
//        scrollToStructure(docMap.docs[i], pos[0], pos[1], pos.length>2 ? pos[2] : 0);
      }
    } else {
      scrollToStructure(doc, pos[0], pos[1], pos[2]);
    }
  }
}

function navPoints(tDoc){
  var books = [];
  var chapters = [];
  var sections = [];
  var allstructures = [];
  var active = false;
  var actives = [];
  allstructures.push(actives);
  var para = false;
  var oldshowvariants = showvariants;
  var oldpunctuation = punctuationStyle;
  showvariants = false;
  punctuationstyle = "modern";
  for(var p=0; p<tDoc.contents.length; p++){
    para = tDoc.contents[p];
    for(var i=0; i<para.content.length; i++){
      switch(para.content[i].objType){
        case "Book":
          active = {para: p, index: i, tag: para.content[i], head: false};
          actives.push(active);
          books.push(active);
//          allstructures.push(active);
          break;
        case "Index":
          active = {para: p, index: i, tag: para.content[i], head: false};
          actives.push(active);
          chapters.push(active);
//          allstructures.push(active);
          break;
        case "Prologue":
          active = {para: p, index: i, tag: para.content[i], head: false};
          actives.push(active);
          chapters.push(active);
//          allstructures.push(active);
          break;
        case "Conclusion":
          active = {para: p, index: i, tag: para.content[i], head: false};
          actives.push(active);
          chapters.push(active);
//          allstructures.push(active);
          break;
        case "Chapter":
          active = {para: p, index: i, tag: para.content[i], head: false};
          actives.push(active);
          chapters.push(active);
//          allstructures.push(active);
          break;
        case "Section":
          active = {para: p, index: i, tag: para.content[i], head: false};
          actives.push(active);
          sections.push(active);
//          allstructures.push(active);
          break;
        case "Span":
          if(para.content[i].type == "heading"){
            head = grabText(para.content[i]);
            actives.forEach(function(e){ e.head = head; });
          }
        default:
          if(active){
            actives = [];
            active=false;
            allstructures.push(actives);
          }
      }
    }
  }
  showvariants = oldshowvariants;
  punctuationstyle = oldpunctuation;
  tDoc.structures = allstructures;
  return([books, chapters, sections, allstructures]);
}

function getTranscribedText(i){
  if(typeof(i)!="number" || !i){
    i=0;
  }
  $.ajax({
      async: true,
      url: variants[i],
      datatype: 'text/plain',
      failure: function(){
        alert("no");
      },
      success: function(data){
        doc = new TreatiseDoc(data);
        doc.docType= "Transcription";
        doc.language = "Latin";
        docmap.addDoc(doc);
      }
  });
}

function activateOptionsBlock(optionClass){
  $(".optionsBlock."+optionClass).addClass("active");
  $(".optionsBlock."+optionClass).removeClass("inactive");
}
function deactivateOptionsBlock(optionClass){
  $(".optionsBlock."+optionClass).addClass("inactive");
  $(".optionsBlock."+optionClass).removeClass("active");
}
function changeOptionsBlock(optionClass, bool){
  if(bool){
    activateOptionsBlock(optionClass);
  } else {
    deactivateOptionsBlock(optionClass);
  }
}
function optionFocus(edited, translated, source){
  changeOptionsBlock("editedText", edited);
  changeOptionsBlock("translatedText", translated);
  changeOptionsBlock("sourceText", source);
}

function currentTreatise() {
  var pos = window.location.pathname.indexOf("/texts/")+7;
  var end = window.location.pathname.indexOf("/", pos+1);
  if(end==-1) end = window.location.pathname.length;
  return window.location.pathname.substring(pos, end);
}
function makeRightPane(){
  var div = DOMDiv("rightcontentpane contentpane", "rightcontentpane", false);
  domobj['Content'].appendChild(div);
  return div;
}
function getEditedText2(treatise, pane){
  // wrapWidth = 460; // FIXME: flexible
  optionFocus(true, false, false); // FIXME: no
  getEditedText3(treatise, pane);
}
function getEditedText3(treatise, pane){
  if(!pane) {
    var parent = document.getElementById("content");
    pane = DOMDiv("leftcontentpane contentpane", "leftcontentpane", false);
    parent.innerHTML = '';
    parent.appendChild(pane);
  }
  loadEditedText(treatise ? treatise : currentTreatise(), pane);
}

function findEditedText(treatise, pane){
  for(var i=0; i<docMap.docs.length; i++){
    if(docMap.docs[i].docType == "Edited") {
      // FIXME: NO
      docMap.docs[i].out = pane;
      docMap.docs[i].draw();
      return docMap.docs[i];
    }
  }
}
function findEnglishText(treatise, pane){
  for(var i=0; i<docMap.docs.length; i++){
    if(docMap.docs[i].docType == "Translation") {
      // FIXME: NO
      docMap.docs[i].out = pane;
      docMap.docs[i].draw();
      return docMap.docs[i];
    }
  }
}

function refreshWidths(){
  var count = $(domobj['Content']).children.length;
  var currentWidth = 0;
  for(var i=0; i<docMap.docs.length; i++){
    currentWidth += parseInt(docMap.docs[i].out.style.width) + 15;
  }
  domobj['Content'].style.width = currentWidth+20+"px";
}

function findOrGetEditedText(treatise, pane){
  findEditedText(treatise, pane) || loadEditedText(treatise ? treatise : currentTreatise(), pane);
}
function findOrGetEnglishText(treatise, pane){
  findEnglishText(treatise, pane) || loadEnglishText(treatise ? treatise : currentTreatise(), pane);
}

function applyEditedText(treatise, pane, settings){
  // wrapWidth = wrapWidth || 460;
  if(!treatise) treatise = currentTreatise();
  if(!pane) {
    pane = DOMDiv("pane contentpane");
    document.getElementById("content").appendChild(pane);
  }
  var text = texts[treatise].edited || loadText(treatise, "edited");
  var doc = new TreatiseDoc(text, pane);
  doc.language = "Latin";
  doc.docType = "Edited";
  doc.group = treatise;
  for(var s=0; s<settings.length; s++){
    doc[settings[s][0]] = settings[s][1];
  }
  docMap.addDoc(doc);
}

function applyTranslatedText(treatise, pane, language, settings){
  // wrapWidth = wrapWidth || 460;
  if(!treatise) treatise = currentTreatise();
  if(!pane) {
    pane = DOMDiv("pane contentpane");
    document.getElementById("content").appendChild(pane);
  }
  if(!language) language="english";
  var text = texts[treatise].translation[language] || loadText(treatise, language);
  var doc = new TreatiseDoc(text, pane);
  doc.language = language.charAt(0).toUpperCase()+language.substring(1);
  doc.docType = "Translation";
  doc.group = treatise;
  for(var s=0; s<settings.length; s++){
    doc[settings[s][0]] = settings[s][1];
  }
  doc.exampleSource = texts[treatise].edited || loadText(treatise, "edited");
  docMap.addDoc(doc);
}

function applySourceText(source, treatise, pane, settings){
  // wrapWidth = wrapWidth || 460;
  if(!treatise) treatise = currentTreatise();
  if(!pane) {
    pane = DOMDiv("pane contentpane");
    document.getElementById("content").appendChild(pane);
  }
  if(!source) source = texts[treatise].sources[0][0];
  var text = texts[treatise][source] || loadText(treatise, source);
  if(text){
    var doc = new TreatiseDoc(text, pane);
    doc.language = "Latin";
    doc.docType = "Transcription";
    doc.shortSource = source;
    doc.group = treatise;
    // var oldShowVars = showvariants;
    // showvariants=true;
    for(var s=0; s<settings.length; s++){
      if(!/pane|source|group|language/.test(settings[s]))
        doc[settings[s][0]] = settings[s][1];
    }
  } else {
    applyEditedText(treatise, pane, settings);
    return;
  }
  docMap.addDoc(doc);
  // showvariants = oldShowVars;
}

function getEditedText(){
//  wrapWidth = false;
  // wrapWidth = 460;
  optionFocus(true, false, false);
  $.ajax({
      async: false,
      url: 'edited.txt',
      datatype: 'text/plain',
      failure: function(){
        alert("no");
      },
      success: function(data){
        var parent = document.getElementById("content");
        var leftpane = DOMDiv("pane contentpane", false, false);
        // var leftpane = DOMDiv("leftcontentpane pane contentpane", "leftcontentpane", false);
        parent.innerHTML = '';
        parent.appendChild(leftpane);
        doc = new TreatiseDoc(data, leftpane);
        doc.language = "Latin";
        doc.docType = "Edited";
        docMap.addDoc(doc);
        jqNavSelect(doc);
        scrollToFragment();
//        scrollFromHash();
        fixHeight();
        // document.getElementById("content").style.height = ($(window).height() 

        //                                                     - $("#content").offset().top
        //                                                    -20)+"px";
        // document.getElementById("content").style.width = 
        //   parseInt(doc.out.style.width)+15+"px";
        
      }
  });
}
function getEnglishText(){
//  wrapWidth = false;
  // wrapWidth = 460;
  optionFocus(false, true, false);
  $.ajax({
      async: false,
      url: 'edited.txt',
      datatype: 'text/plain',
      failure: function(){
        alert("no");
      },
      success: function(data){
        exampleSource = data;
      }
  });
  $.ajax({
      async: false,
      url: 'english.txt',
      datatype: 'text/plain',
      failure: function(){
        alert("no");
      },
      success: function(data){
        var parent = document.getElementById("content");
        var leftpane = DOMDiv("leftcontentpane pane contentpane", "leftcontentpane", false);
        parent.innerHTML = '';
        parent.appendChild(leftpane);
        doc = new TreatiseDoc(data, leftpane);
        doc.language = "English";
        doc.docType = "Translation";
//        doc.out = document.getElementById("content");
        jqNavSelect(doc);
        scrollToFragment();
//        scrollFromHash();
        fixHeight();
        // document.getElementById("content").style.height = ($(window).height() 
        //                                                     - $("#content").offset().top
        //                                                    -20)+"px";
        // document.getElementById("content").style.width = 
        //   parseInt(doc.out.style.width)+15+"px";
      }
  });
}
function getParallelText(){
//  wrapWidth = false;
  // wrapWidth = 460;
  var parent = document.getElementById("content");
  var leftpane = DOMDiv("leftcontentpane pane contentpane", "leftcontentpane", false);
  var rightpane = DOMDiv("rightcontentpane pane contentpane", "rightcontentpane", false);  
  parent.style.width = "1200px";
  leftpane.style.width = "470px";
  rightpane.style.width = "500px";
  parent.innerHTML = "";
  parent.appendChild(leftpane);
  parent.appendChild(rightpane);
  $.ajax({
      async: false,
      url: 'edited.txt',
      datatype: 'text/plain',
      failure: function(){
        alert("no");
      },
      success: function(data){
        var newdoc = new TreatiseDoc(data, document.getElementById("leftcontentpane"));
        exampleSource = data;
        newdoc.docType = "Edited";
        newdoc.language = "Latin";
        docMap.addDoc(newdoc);
        jqNavSelect(newdoc);
//        scrollFromHash();
      }
  });
  $.ajax({
      async: false,
      url: 'english.txt',
      datatype: 'text/plain',
      failure: function(){
        alert("no");
      },
      success: function(data){
        var newdoc = new TreatiseDoc(data, document.getElementById("rightcontentpane"));
        newdoc.docType = "Translation";
        newdoc.language = "English";
        newdoc.exampleSource = exampleSource;
        docMap.addDoc(newdoc);
        navPoints(newdoc);
        scrollToFragment();
//        scrollFromHash();
      }
  });
  optionFocus(true, true, false);
  parent.style.width = parseInt(leftpane.style.width, 10)+parseInt(rightpane.style.width, 10)+20+"px";
  fixHeight();
  // document.getElementById("content").style.height = ($(window).height() 
  //                                                    - $("#content").offset().top
  //                                                    -20)+"px";
  $("div.para").dblclick(alignVersions);
}

function getText(){
  var panes = pageSettings.paneCount();
  var val, pane, treatise, extras;
  docMap.hold = true;
  if(panes){
    for(var i=0; i<panes; i++){
      treatise = pageSettings.settings["treatise"+i] ? pageSettings.settings["treatise"+i] : false;
      extras = pageSettings.paneSettings(i);
      switch (pageSettings.settings["pane"+i]){
        case "Edited":
          applyEditedText(treatise, false, extras);
          break;
        case "Translation":
          applyTranslatedText(treatise, false, false, extras);
          break;
        case "Transcription":
          applySourceText(pageSettings.settings["source"+i], treatise, false, extras);
      }
    }
  } else {
    getTextDefault();
  }
  docMap.unhold();
  fixHeight(true);
}

function getTextDefault(){
  if(!pageSettings.settings.language || pageSettings.settings.language === "Latin"){
    applyEditedText(false, false, []);
  } else if (pageSettings.settings.language === "Parallel") {
    applyEditedText(false, false, []);
    applyTranslatedText(false, false, false, []);
  } else {
    applyTranslatedText(false, false, false, []);
  }
}

// function getText2(){
//   if(!pageSettings.settings.language || pageSettings.settings.language === "Latin"){
//     getEditedText();
//   } else if (pageSettings.settings.language === "Parallel") {
//     if(!window.innerWidth || window.innerWidth>1350){
//       getParallelText();
//     } else {
//       getEditedText();
//     }
//   } else {
//     getEnglishText();
//   }
// }
function updateMenuSettings(){
  // This looks stupid, but toggleClass requires pure boolean objects
  // $("#showVariants").toggleClass("checked", pageSettings.settings.showvars ? true : false);
  // $("#hideVariants").toggleClass("checked", pageSettings.settings.showvars ? false : true);
  $("#displayvars").toggleClass("checked", pageSettings.settings.showvars ? true : false);
  $("#hidevars").toggleClass("checked", pageSettings.settings.showvars ? false : true);
  $("#MSPunct").toggleClass("checked", pageSettings.settings.MSPunctuation ? true : false);
  $("#modernPunct").toggleClass("checked", pageSettings.settings.MSPunctuation ? false : true);
  // $("#MSPunctuation").toggleClass("checked", pageSettings.settings.MSPunctuation ? true : false);
  // $("#modernPunctuation").toggleClass("checked", pageSettings.settings.MSPunctuation ? false : true);
  $("#Latin").toggleClass("checked", 
    (!pageSettings.settings.language || pageSettings.settings.language==="Latin") ? true: false);
  $("#Translation").toggleClass("checked", 
    (pageSettings.settings.language && pageSettings.settings.language==="Translation") ? true: false);
  $("#Parallel").toggleClass("checked", 
    (pageSettings.settings.language && pageSettings.settings.language==="Parallel") ? true: false);
}

function fixHeight(ignorewidth){
  if(window.matchMedia("print").matches){
    // $(".mainBody")[0].style.height = "100%";
    domobj['Content'].style.height = "100%";
    var drawTos = $(domobj['Content']).find(".drawTo");
    for(var i=0; i<drawTos.length; i++){
      drawTos[i].style.height = "100%";
    }
  // } else if($("#menudiv:visible").length && window.matchMedia("screen").matches){
  } else if($(".mainBody").length && window.matchMedia("screen").matches){
    // i.e. not print
    var topheight = $(".header").height() + $(".nav").height();
    var total = $(window).height();
    var space = $(".mainBody").height();
    $(".mainBody")[0].style.height=(total-topheight-2)+"px";
//    var space = $(window).height() - $(domobj['Content']).offset().top; 
    domobj['Content'].style.height = (space-20)+"px";
    var bars = $(domobj['Content']).find(".titleBar");
    var barHeight = bars.length ? bars[0].offsetHeight : 0;
    var drawTos = $(domobj['Content']).find(".drawTo");
    var parents = drawTos.parent();
    for(var i=0; i<drawTos.length; i++){
      // drawTos[i].style.height = (space - barHeight-28)+"px";  
      drawTos[i].style.height = (space - barHeight-20)+"px";  
      parents[i].style.height = space-18+"px";
    }
    if(!ignorewidth){
      docMap.fixWidths();
    }
    window.matchMedia("screen").addListener(fixHeight);
  } else {
    
  }
}

function predrawInit(){
  showvariants = pageSettings.settings.showvars;
  punctuationStyle = pageSettings.settings.MSPunctuation ? "MS" : "modern";
  updateMenuSettings();
  fixHeight(true);
  $(window).resize(fixHeight);
}

function domChapterp(obj){
  return $(obj).has(".chapter").length;
}
function domBookp(obj){
  return $(obj).has(".book").length;
}
function domSectionp(obj){
  return $(obj).has(".section").length;
}
function locationInTreatise(obj){
  var prevs = $(obj).parent().children(".para");
  var book=0, chap=0, sect=0, para=0;
  var pos = prevs.index(obj);
  for(var i=pos; i>=0; i--){
    if(!book){
      if(!chap){
        if(!sect) para++;
        if(domSectionp(prevs[i])) sect++;
      }
      if(domChapterp(prevs[i])) {
        chap++;
      }
    } 
    if(domBookp(prevs[i])) book++;
  }
  return [book, chap, sect, para];
}
function retryScroll(args){
  args[0].simpleScroll(args[1]);
}
function Position(book, chapter, section, paragraph, offset){
  this.offset = offset;
  this.paragraph = paragraph;
  this.section = section;
  this.chapter = chapter;
  this.book = book;
  this.atClass = function(){
    return ".para.at-"+this.book+"-"+this.chapter+"-"
      +(this.section ? this.section : 0)+"-"+this.paragraph;
  };
  this.simpleScroll = function(div){
    var par = $(div).find(this.atClass());
    var pane = div.parentNode;
    if(par.length && Number(this.book)){
      var ref = romanReference(this.book, this.chapter, this.section).replace(".", "_");
      $(div).scrollTo(par[0], {axis: "y", offset: {left: 0, top: -offset}});
      // now update location
      $(pane).find(".loctext").html(ref);
      $(pane).find(".navitem a").removeClass("selected");
      $(pane).find(".jump-"+ref).addClass("selected");
    } else {
      setTimeout(retryScroll, 200, [this, div]);
    }
  };
}
function currentPosition(div){
  // To find the current position, first find a visible paragraph then
  // get its offset on the page and its chapter/book location
  var paras = $(div).children(".para");
  var offset = $(div).offset().top;
  var para = paras[firstVisible(paras, offset)];
  var loc = /at-\S*/.exec(para.className)[0].split("-").slice(1);
  // var loc = /at-\S*/.exec(para.className)[0].split("-").slice(1).map(Number);
  var pos = $(para).offset().top;
  return new Position(loc[0], loc[1], loc[2], loc[3], pos-offset);
}

function simpleScrollTo(div, offset, book, chap, sect, para){
  var shortcut = $(div).children(".para.at-"+book+"-"+chap+"-"+(sect ? sect : 0)+"-"+para);
  if(shortcut.length){
    var ref = romanReference(book, chap, sect);
    $(div).scrollTo(shortcut, {axis: "y", offset: {left: 0, top: -offset}});
    $(div.parentNode).find(".loctext").html(ref);
    $(div.parentNode).find(".navitem a").removeClass("selected");
    $(div.parentNode).find(".jump-"+ref.replace(".", "_")).addClass("selected");
    return;
  }
  var bits = $(div).children(".para");
  for(var i=0; i<bits.length; i++){
    book = Math.max(book, 0);
    sect = Math.max(sect, 0);
    chap = Math.max(chap, 0);
    para = Math.max(para, 0);
    if(domBookp(bits[i])) book--;
    if(!book){
      if(domChapterp(bits[i])) chap--;
      if(!chap) {
        if (domSectionp(bits[i])) sect--;
        if(!sect) {
          para--;
          if(!para) {
            $(div).scrollTo(Math.max(0, bits[i].offsetTop - div.offsetTop-offset), 300, {axis: "y"});
          }
        }
      }
    }
  }
}
function alignVersions(e){
  if(e.altKey){
    var loc2=locationInTreatise(e.delegateTarget);
    var loc = /at-\S*/.exec(e.delegateTarget.className)[0].split("-").slice(1).map(Number);
    var div = e.delegateTarget.parentNode;
    var offset = $(e.delegateTarget).offset().top - $(div).offset().top;
    var treatise = docMap.docForPane(div.parentNode).group;
    var docs = docMap.treatises[treatise];
    for(var i=0; i<docs.length; i++){
      if(docs[i].drawTo != div){
        simpleScrollTo(docs[i].drawTo, offset, loc[0], loc[1], loc[2], loc[3]);
        docs[i].scrollpos.book = loc[0];
        docs[i].scrollpos.chapter = loc[1];
        docs[i].scrollpos.section = loc[2];
      }
    }
  }
}
