var settings = {language: "Latin",
	variants: false,
	MSPunctuation: false,
	transcribe: false,
	translationNotes: false,
	transcriptionNotes: false};

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

function loadSettings(){
	var qs = new Querystring(null);
	if(qs){
		settings.language = qs.get("language", settings.language);
		settings.variants = qs.get("showvars", Number(settings.variants));
		settings.MSPunctuation = qs.get("MSPunctuation", Number(settings.MSPunctuation));
		settings.transcribe = qs.get("transcribeexx", Number(settings.transcribe));
		settings.translationNotes = qs.get("translationNotes", Number(settings.translationNotes));
		settings.transcriptionNotes = qs.get("transcriptionNotes", Number(settings.transcriptionNotes));
	}
  editable = false;
  showvariants = Number(settings.variants);
  if(showvariants) $(".textVariants").addClass("checked");
  if(showvariants) {
    $(".vars.tickoptions.yes").addClass("checked");
    $(".showhidevariants").addClass("checked");
  } else {
    $(".vars.tickoptions.no").addClass("checked");
  }
  showtranslationnotes = Number(settings.translationNotes);
  showtranscriptionnotes = Number(settings.transcriptionNotes);
  punctuationStyle = Number(settings.MSPunctuation) ? "MS" : "modern";
  $(".punctuation."+punctuationStyle).addClass("checked");
  if(punctuationStyle == "MS") $(".switchpunctuation").addClass("checked");
	$("#"+settings.language).addClass("checked");
}

function settingsToQueryString(s){
	var qs = "";
	qs+= "language="+s.language;
	if(s.variants) qs += "&showvars=1";
	if(s.MSPunctuation) qs += "&MSPunctuation=1";
	if(s.transcribe) qs += "&transcribeexx=1";
	if(s.translationNotes) qs += "&translationNotes=1";
	if(s.transcriptionNotes) qs += "&transcriptionNotes=1";
	return qs;
}

function updateSettingsWithVariables(variables){
	if(variables){
		if(variables.variants) settings.variants = variables.variants;
		if(variables.language) settings.language = variables.language;
	}
}
function refreshMenus(variables){
	updateSettingsWithVariables(variables);
	$("a").each(function(index, el) {
		var newsrc = el.href;
		if(newsrc){
			var fragpos = newsrc.indexOf('#');
			var frag = fragpos>-1 ? newsrc.substring(fragpos) : "";
	    if(newsrc.indexOf('?')>-1){
				newsrc = newsrc.substring(0, newsrc.indexOf('?'));
			} else if (frag.length) {
				newsrc = newsrc.substring(0, fragpos);
			}
			newsrc += "?"+settingsToQueryString(settings)+frag;
			el.href = newsrc;
		}
  });
}
function setlocation (name, val){
  var locsearch = location.search;
  var varset = locsearch.indexOf(name);
  if(varset>-1){
    var start = locsearch.indexOf("=", varset);
    var end = locsearch.indexOf("&", varset);
    if(end ==-1) end = locsearch.length;
    window.location.search = locsearch.substring(0, start)+"="+val+locsearch.substring(end);
  } else {
    window.location.search = locsearch+(locsearch.length>1 ? "&" : "")+name+"="+val;
  }
}

$(document).ready(function(){
	var MenuBar1 = new Spry.Widget.MenuBar("MenuBar1", {imgDown:"SpryAssets/SpryMenuBarDownHover.gif", imgRight:"SpryAssets/SpryMenuBarRightHover.gif"});
	loadSettings();
	refreshMenus();
	$(".options a").click(function(e){
		$(".options a").removeClass("checked");
		$(this).addClass("checked");
		settings.language = this.id;
		refreshMenus(false);
//		e.stopImmediatePropagation();
		$(this).mouseout(function(e){
			$(this).removeClass("MenuBarItemHover");
			e.stopImmediatePropagation();
		});
	});
  $(".tickoptions").click(function(){
     if(!$(this).hasClass("checked")){
       $(this).addClass("checked");
       if($(this).hasClass("vars")){
         showvariants = $(this).hasClass("yes");
         $(".tickoptions.vars."+(showvariants?"no":"yes")).removeClass("checked");
         refreshMenus({variants: showvariants});
         setlocation("showvars", showvariants ? 1 : 0);
       } else if($(this).hasClass("punctuation")){
         punctuationStyle = $(this).hasClass("MS") ? "MS" : "modern";
         $(".tickoptions.punct."+punctuationStyle).removeClass("checked");
         refreshMenus({MSPunctuation: punctuationStyle});
         setlocation("MSPunctuation", punctuationStyle=="MS" ? 1 : 0);
       }
      doc = new TreatiseDoc(doc.text);
      navSelect(doc);
      refreshMenus();
     }
  });
  $(".showhidevariants").click(function(){
    $(this).toggleClass("checked");
    showvariants = $(this).hasClass("checked");
    refreshMenus({variants: showvariants});
    doc = new TreatiseDoc(doc.text);
    navSelect(doc);
    refreshMenus();
    setlocation("showvars", showvariants ? 1 : 0);
  });
  $(".switchpunctuation").click(function(){
    $(this).toggleClass("checked");
    punctuationStyle = $(this).hasClass("checked") ? "MS" : "modern";
    refreshMenus({MSPunctuation: punctuationStyle});
    doc = new TreatiseDoc(doc.text);
    navSelect(doc);
    refreshMenus();
    setlocation("MSPunctuation", punctuationStyle=="MS" ? 1 : 0);
  });
	$(".toggle").click(function(e){
		$(this).toggleClass("checked");
    if($(this).hasClass("textVariants")){
      var varp = $(this).hasClass("checked");
      refreshMenus({variants: varp});
      showvariants = varp;
      doc = new TreatiseDoc(doc.text);
      navSelect(doc);
      refreshMenus();
      setlocation("showvars", varp ? 1 : 0);
    } else if ($(this).hasClass("punctuat")){
      var puncp = $(this).hasClass("checked");
      refreshMenus({MSPunctuation: varp});
      punctuationStyle = varp ? "modern" : "MS";
      doc = new TreatiseDoc(doc.text);
      navSelect(doc);
      setlocation("MSPunctuation", puncp ? 1 : 0);
      refreshMenus();
    }
	});
});
