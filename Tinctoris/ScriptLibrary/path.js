function makeVarString(obj, varNames, prefix){
  var v = [];
  for(var i=0; i<varNames.length; i++){
    if(obj[varNames[i]]){
      v.push(varNames[i]+"="+obj[varNames[i]]);
    }
    for(var j=0; j<6; j++){
      if(obj[varNames[i]+j]){
        v.push(varNames[i]+j+"="+obj[varNames[i]+j]);
      }
    }
  }
  return v.length ? prefix + v.join("&") : "";
}

function pathSettings(search, fragment, localOnlyIndex){
  this.settings = false;
  this.search = search;
  this.fragment = fragment;
  this.local = localOnlyIndex;
  this.searchString = false;
  this.fragmentString = false;
  this.date = function(){
    if(this.settings.date){
      var bits = this.settings.date.split("-");
      if(!bits) return false;
      bits.reverse();
      if(bits.length===1) bits.push("12");
      if(bits.length===2) bits.push("31");
      if(bits[2].length===1) bits[2] = "0"+bits[2];
      if(bits[1].length===1) bits[1] = "0"+bits[1];
      var dateString = bits.join("-")+"T23:59:59";
      console.log(dateString);
      return Date.parse(dateString);
    } else {
      return false;
    }
  };
  this.getSearchString = function(refresh){
    if(refresh || !this.searchString) 
      this.searchString = makeVarString(this.settings, this.search, "?");
    return this.searchString;
  };
  this.paneCount = function(){
    var i=0;
    while(this.settings["pane"+i]){
      i++;
    }
    return i;
  };
  this.paneSettings = function(n){
    var settings = [];
    for(var key in this.settings){
      if(Number(key.substring(key.length-1))==n){
        settings.push([key.substring(0, key.length-1), this.settings[key]]);
      }
    }
    return settings;
  };
  this.getFragmentString = function(refresh, global){
    if(global) return makeVarString(this.settings, this.fragment.slice(0, this.local), "#");
    if(refresh || !this.fragmentString)
      this.fragmentString = makeVarString(this.settings, this.fragment, "#");
    return this.fragmentString;
  };
  this.parteq = function (parta, partb, prefix){
    if(!parta || parta==="" || parta===prefix){
      return !partb || partb==="" || partb===prefix;
    } else return parta===partb;
  };
  this.fragmentChanged = function(refresh, global){
    return !this.parteq(this.getFragmentString(refresh, global), document.location.hash, "#");
  };
  this.searchChanged = function(refresh){
    return !this.parteq(this.getSearchString(refresh), document.location.search, "?");
  };
  this.resyncLocation = function(){
    if(this.fragmentChanged(true)){
      document.location.hash = this.getFragmentString(false);
    }
    if(this.searchChanged(true)){
      document.location.search = this.getSearchString(false);
    }
    this.updateMenus();
  };
  this.loadSettingsFromString = function(string){
    if(!this.settings) this.settings = {};
    if (string.length > 1) {
      // From mdn location article
      for (var aItKey, val, nKeyId = 0, aCouples = string.substr(1).split("&"); nKeyId < aCouples.length; nKeyId++) {
        aItKey = aCouples[nKeyId].split("=");
        val = aItKey.length > 1 ? unescape(aItKey[1]) : "";
        // Guess at data type. May have to maintain a list...
        if(Number(val) && (parseInt(val) || parseInt(val)===0)) val = parseInt(val);
        if(val==="true") val = true;
        if(val==="false") val = false;
        this.settings[unescape(aItKey[0])] = val;
      }
    }
  };
  this.loadSettings = function(){
    var qs = location.search;
    var hs = location.hash;
    this.loadSettingsFromString(qs);
    this.loadSettingsFromString(hs);
    this.updateMenus();
  };
  this.updateMenus = function(){
    $("a").not("MenuBarItemSubmenu").each(function(index, el){
      var frag;
      el.search = pageSettings.getSearchString(false);
      if(el.hash && el.hash.indexOf("=")===-1){
        frag = el.hash.substring(1);
      }
      el.hash = pageSettings.getFragmentString(false, true);
      if(frag){
        if(el.hash.length>1) el.hash+="&";
        el.hash+="hashlink="+frag;
      }
    });
  };
  this.updateSetting = function(key, value){
    this.settings[key] = value;
    this.resyncLocation();
  };
  this.removeSetting = function(key){
    delete this.settings[key];
    this.resyncLocation();
  };
  this.updateSettings = function(keyValuePairs){
    for(var i=0; i<keyValuePairs.length; i++){
      this.settings[keyValuePairs[i][0]] = keyValuePairs[i][1];
    }
    this.resyncLocation();
  };
  // Initialise
  this.loadSettings();
}

var pageSettings = new pathSettings(["transcribeexx", "translationNotes", "transcriptionNotes"],
    ["MSPunctuation", "showvars", "showfacs", "showcommentary", "pane", "source", "language", "date", "book", "chapter", 
     "section", "paragraph", "treatise", "hashlink"],
                               8);
function rootpath(){
  var string = window.location.pathname;
  var pos = string.indexOf("/texts/") == -1 
    ? (string.indexOf("/sources/") == -1 ? string.length : string.indexOf("/sources/")+1)
    : string.indexOf("/texts/")+1;
  return string.substring(0, pos);
}
function loadText(treatise, filename){
  $.ajax({
      async: false,
      url: rootpath()+"texts/"+treatise+"/"+filename+".txt",
      datatype: 'text/plain',
      failure: function(){ alert("Treatise file failed to load. Please contact project staff.");},
      error: function(){
        exampleSource = false;
      },
      success: function(data){
        exampleSource = data;
      }
  });
  return exampleSource;
}
function loadTreatise(treatise, filename, docType, language, pane, othervars){
  var path = rootpath();
  $.ajax({
      async: true,
      url: rootpath()+"texts/"+treatise+"/"+filename+".txt",
      datatype: 'text/plain',
      failure: function(){ alert("Treatise file failed to load. Please contact project staff.");},
      success: function(data){
        var newdoc = new TreatiseDoc(data, pane);
        newdoc.docType = docType;
        newdoc.language = language;
        newdoc.group = treatise;
        if(othervars){
          for(var i=0; i<othervars.length; i++){
            newdoc[othervars[i][0]] = othervars[i][1];
          }
        }
        docMap.addDoc(newdoc);
        refreshWidths();
      }
  });
}
function loadTranscribedText(treatise, variant, pane){
  loadTreatise(treatise, variant, "Transcription", "Latin", pane);
}
function loadEditedText(treatise, pane){
  loadTreatise(treatise, "edited", "Edited", "Latin", pane);
}
function loadEnglishText(treatise, pane){
  loadTreatise(treatise, "english", "Translation", "English", pane, 
    [["exampleSource", loadText(treatise, "edited")]]);
}
