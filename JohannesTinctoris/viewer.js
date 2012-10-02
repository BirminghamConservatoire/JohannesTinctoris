var pathtotexts ="../Collated texts/";
var textname = "De notis et pausis";
var variants = ["BU", "G", "Br1", "V"];
editable = false;
nocache = true;
infoButtons = true;
copyTextDisplay = false;
editorDisplay = "hide";
dateDisplay = "hide";
sourceDisplay = "hide";
cssloc = "../../../GUIEditor";
function url (variant){
  return pathtotexts+textname+" ("+variant+").txt";
}

// Fixes a bug in firefox: http://stackoverflow.com/a/633031
$.ajaxSetup({'beforeSend': function(xhr){
    if (xhr.overrideMimeType)
        xhr.overrideMimeType("text/plain");
    }
});

function grabText(object){
  var domobj = object.toHTML();
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
    } else if (n>=600 || (n>=100 && n<400)){
      rom += "c";
      n -= 100;
    } else if (n>=500){
      rom += "d";
      n -= 500;
    } else if (n>=400){
      rom += "cd";
      n -= 400;
    } else if (n>=90){
      rom += "xc";
      n -= 90;
    } else if (n>=60 || (n>=10 && n<40)){
      rom += "x";
      n -= 10;
    } else if (n>=50){
      rom += "l";
      n -= 50;
    } else if (n>=40){
      rom += "xl";
      n -= 40;
    } else if (n==9){
      return rom + "ix";
    } else if (n>=6 || n<4){
      rom += "i";
      n -= 1;
    } else if (n==5){
      return rom+"v";
    } else if (n==4){
      return rom+"iv";
    }
  }
  return rom;
}

function romanReference(a, b, c){
  var ref = [];
  if(a) ref.push(roman(a).toUpperCase());
  if(b) ref.push(roman(b));
  if(c) ref.push(c);
  return ref.join(".");
}
function getSelected(select){
  return $(select).children(":selected")[0];
}
function navSelect(tDoc){
  var structures = navPoints(tDoc)[3];
  var book = 0;
  var chapter = 0;
  var section = 0;
  var options = [];
  var content, reference, sbreak, option;
  var heading = [];
  var hash = window.location.hash.substring(1);
  hash = hash.length ? hash.split(".").map(Number) : false;
  var currentp = false;
  var nav = DOMSelect("Navigation", "navselect", "navselect1", false, []);
  $(document.getElementById('navbox')).empty();
  document.getElementById('navbox').appendChild(nav);
  for(var i=0; i<structures.length; i++){
    sbreak = structures[i];
    if(sbreak.length){
      for(var b=0; b<sbreak.length; b++){
        switch (sbreak[b].tag.objType){
          case "Book":
            book+=1;
            chapter=0;
            break;
          case "Chapter":
            chapter+=1;
            break;
          case "Section":
            section+=1;
            break;
        }
      }
      heading = sbreak[0].head.length > 25 ? sbreak[0].head.substring(0, 24)+"…" : sbreak[0].head;
      content = sbreak[0].tag;
      reference = romanReference(book, chapter, section);
      currentp = hash && book == hash[0] && chapter == hash[1] && (!hash[2] || hash[2] == section);
      option = DOMOption("jump-"+reference, "Jump to "+reference, reference+": "+heading, currentp);
      nav.appendChild(option);
      $(option).data("obj", content);
      $(option).data("ref", (section ? [book, chapter, section] : [book, chapter]).join("."));
      $(option).focus(function(e){
        window.location.hash = "#"+$(this).data("ref");
        $("#content").scrollTo($(this).data("obj").DOMObj, 500);
      });
      $(option).click(function(e){
        window.location.hash = "#"+$(this).data("ref");
        $("#content").scrollTo($(this).data("obj").DOMObj, 500);
      });
    }
  }
  $(nav).change(function(e){
    var sel = getSelected(this);
    window.location.hash = "#"+$(sel).data("ref");
    $("#content").scrollTo($(sel).data("obj").DOMObj, 500);
  });
  return structures;
}
function scrollToStructure(tDoc, book, chapter, section){
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
              $(doc.out).scrollTo(sb[0].tag.DOMObj);
              return;
            } 
          } else if(chapteri > chapter){
            $(doc.out).scrollTo(s[Math.max(0, i-1)][0].tag.DOMObj);
            return;
          }
        } else if(booki>book){
          $(doc.out).scrollTo(s[Math.max(0, i-1)][0].tag.DOMObj);
          return;
        }
      }
    }
  }
}
function scrollFromHash(hash){
  hash = hash ? hash : window.location.hash;
  if(hash.length > 1){
    var pos = hash.substring(1).split(".").map(Number);
    scrollToStructure(doc, pos[0], pos[1], pos[2]);
  }
}

function navPoints(tDoc){
  var books = [];
  var chapters = [];
  var sections = [];
  var allstructures = [];
  var active = false;
  var actives = [];
  var para = false;
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
            actives.forEach(function(e, i, a){ e.head = head; });
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
  tDoc.structures = allstructures;
  return([books, chapters, sections, allstructures]);
}

function getTranscribedText(i){
  if(typeof(i)!="number" || !i){
    i=0;
  }
  $.ajax({
      async: true,
      url: url(variants[i]),
      datatype: 'text/plain',
      failure: function(){
        alert("no");
      },
      success: function(data){
        doc = new TreatiseDoc(data);
      }
  });
}

function getEditedText(i){
  $.ajax({
      async: true,
      url: 'edited.txt',
      datatype: 'text/plain',
      failure: function(){
        alert("no");
      },
      success: function(data){
        doc = new TreatiseDoc(data);
        doc.out = document.getElementById("content");
        navSelect(doc);
        scrollFromHash();
      }
  });
}

$(document).ready(function(){
  document.getElementById("content").style.height = ($(window).height() 
                      - $("#content").offset().top
                      -20)+"px";
  if(window.location.toString().indexOf("/texts/")>-1){
    getEditedText();
  } else if (window.location.toString().indexOf("/sources/")>-1){
    getTranscribedText(); 
  }
});