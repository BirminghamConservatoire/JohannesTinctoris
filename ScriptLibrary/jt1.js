var settings = {language: "Latin",
	variants: false,
	facs: false,
	MSPunctuation: false,
	transcribe: false,
	translationNotes: false,
	transcriptionNotes: false};
// Useful DOM objects
var domobj = [];
var baseDir = "TestSite";

var foo=false;
/* Client-side access to querystring name=value pairs
Version 1.3 28 May 2008
License (Simplified BSD): http://adamv.com/dev/javascript/qslicense.txt
*/
function Querystring(qs) { // optionally pass a querystring to parse
  this.params = {};
  if (qs == null) qs = location.search.substring(1, location.search.length);
  if (qs.length > 0) {
	  // Turn <plus> back to <space>
  	// See: http://www.w3.org/TR/REC-html40/interact/forms.html#h-17.13.4.1
  	qs = qs.replace(/\+/g, ' ');
  	var args = qs.split('&'); // parse out name/value pairs separated via &
  	// split out each name=value pair
  	for (var i = 0; i < args.length; i++) {
  	  var pair = args[i].split('=');
  	  var name = decodeURIComponent(pair[0]);
  	  var value = (pair.length==2)
  	    ? decodeURIComponent(pair[1])
  	    : name;
  	  this.params[name] = value;
  	}
	}
  this.get = function(key, default_) {
  	var value = this.params[key];
  	return (value != null) ? value : default_;
	};
	this.contains = function(key) {
  	var value = this.params[key];
  	return (value != null);
	};
}
//////////

function refreshMenus(variables){
	updateSettingsWithVariables(variables);
  // fixme: Broken now
	// $("a").each(function(index, el) {
	// 	var newsrc = el.href;
	// 	if(newsrc){
	// 		var fragpos = newsrc.indexOf('#');
	// 		var frag = fragpos>-1 ? newsrc.substring(fragpos) : "";
	//     if(newsrc.indexOf('?')>-1){
	// 			newsrc = newsrc.substring(0, newsrc.indexOf('?'));
	// 		} else if (frag.length) {
	// 			newsrc = newsrc.substring(0, fragpos);
	// 		}
	// 		newsrc += "?"+settingsToQueryString(settings)+frag;
	// 		el.href = newsrc;
	// 	}
  // });
}

function firstVisible(divs, val){
  var low = 0, high = divs.length - 1, mid, top1, top2;
  while (low <= high){
    mid = (low + high) >>1;
    top1 = $(divs[mid]).offset().top;
    top2 = mid>0 && $(divs[mid-1]).offset().top;
    if(top1<val){
      low = mid+1;
    } else if (top1>val && top2 && top2>val){
      high = mid-1;
    } else {
      return Math.max(mid-1, 0);
      return mid;
    }
  }
  return 0;
}

function grabdomobjects(){
  domobj['showV'] = document.getElementById("displayvars");
  domobj['hideV'] = document.getElementById("hidevars");
  domobj['showF'] = document.getElementById("showfacs");
  domobj['hideF'] = document.getElementById("hidefacs");
  domobj['MS'] = document.getElementById("MSPunct");
  domobj['Modern'] = document.getElementById("ModernPunct");
  domobj['Edited'] = document.getElementById("edited");
  domobj['English'] = document.getElementById("translated");
  domobj['LatL'] = document.getElementById("latinL");
  domobj['LatR'] = document.getElementById("latinR");
  domobj['EngL'] = document.getElementById("translatedL");
  domobj['EngR'] = document.getElementById("translatedR");
  domobj['Content'] = document.getElementById("content");
}

function redraw(){
  updateMenuSettings();
  if(docMap.docs.length){
    for(var i=0; i<docMap.docs.length; i++){
      if(docMap.docs[i].docType=="Edited"){
        var top = docMap.docs[i].out.scrollTop;
        docMap.docs[i].draw();
        docMap.docs[i].out.scrollTop = top;
      }
    }
    jqNavSelect(docMap.docs[0]);
    var parent = document.getElementById("content");
    var lpane = document.getElementById("leftcontentpane");
    var rpane = document.getElementById("rightcontentpane");
    parent.style.width = parseInt(lpane.style.width, 10)+parseInt(rpane.style.width, 10)+30+"px";
  } else {
    doc.draw();
    jqNavSelect(doc);
  }
  $("div.para").dblclick(alignVersions);
}
function followHash(){
  if(pageSettings.settings.hashlink){
    var link = document.getElementById(pageSettings.settings.hashlink);
    if(!link){
      alert("oops: "+pageSettings.settings.hashlink);
      return;
    }
    $(".scroller").scrollTo(link);
  }
}
function hashChange(){
  pageSettings = new pathSettings(["transcribeexx", "translationNotes", "transcriptionNotes"],
    ["MSPunctuation", "showvars", "showfacs", "pane", "source", "language", "book", "chapter", 
     "section", "paragraph", "treatise", "hashlink"],
                               5);
  followHash();
}
$(document).ready(function(){
	var MenuBar1 = new Spry.Widget.MenuBar("MenuBar1", {imgDown:"../../SpryAssets/SpryMenuBarDownHover.gif", imgRight:"../../SpryAssets/SpryMenuBarRightHover.gif"});
	var Accordion1 = new Spry.Widget.Accordion("Accordion1");
  grabdomobjects();
  // loadSettings();
  followHash();
  $("a").click(function(e){
    if(this.href.indexOf("hashlink")>-1){
      window.location = this.href;
      pageSettings.loadSettingsFromString(window.location.hash);
      followHash();
      return false;
    }
    return true;
  });
//  window.onhashchange = hashChange();
  pageSettings.updateMenus();
  if(window.location.toString().indexOf("/texts/")>-1){
    predrawInit();
    getText();
  }
});
$(window).load(function(){
  var news = document.getElementById("news");
  if(news){
    $(news).rssfeed('http://feeds.bbci.co.uk/news/rss.xml?edition=uk',{ limit: 1});
  }
});
