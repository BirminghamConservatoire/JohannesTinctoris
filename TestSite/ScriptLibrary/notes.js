// Footnotes code

// Some settings
var locpath = window.location.toString();
var inline = locpath.indexOf("inline")>-1;
var sf =  locpath.indexOf("scale")>-1 ? 
  parseFloat(locpath.substring(locpath.indexOf("scale")+6)) : 0.3;
var notePath = "notes.html";
var notesPage = false;
var imageScalingFactor=sf;
var allNotes = [];

function noteClickFun(id){
  return function(){
    $(document.getElementById(id).parentNode).click();
  };
}

function updateXRefs(){
  var noterefs;
  for(var i=0; i<allNotes.length; i++){
    noterefs = $("a.noteref[href='"+allNotes[i]+"']");
    for(var j=0; j<noterefs.length; j++){
      noterefs[j].innerHTML = "n."+(1+i);
      noterefs[j].href="#note-"+(1+i);
      $(noterefs[j]).click(noteClickFun("fnref-"+(i+1)));
    }
  }
}

function getNoteEntries(){
  // Fetch notes page and store it in notesPage
  $.ajax({
    url: notePath,
    success: function(data){
      notesPage = data;
    },
    dataType: "html"
  });
}

function getNotes(){
  // Fetch all references to notes, store them in allNotes and add
  // footnote numbers for reference
  notes = $(".contentbox a[href^=notes]");
  for(var i=0; i<notes.length; i++){
    var el = DOMSpan("fn", "fnref-"+(1+i), (1+i)+"");
    $(notes[i]).empty();
    notes[i].appendChild(el);
    $(notes[i]).addClass("noteanchor");
    $(notes[i]).data("index", i);
    $(notes[i]).data("ref", notes[i].hash.substring(1));
    allNotes.push(notes[i].hash.substring(1));
  }
}

function maybeHideNote(e){
//  if(e.altKey){
    e.preventDefault();
    $(this).remove();
    return false;
//  }
}

function showNote(e){
  e.preventDefault();
  var index = 1+$(this).data("index");
  var id = "note-"+index;
  if(document.getElementById(id)) return $(document.getElementById(id)).remove();
  var note = $("#"+$(this).data("ref"), notesPage);
  // var anchor = DOMAnchor("{"+$(this).data("ref")+"}", false, false, false);
  // anchor.name = "{"+$(this).data("ref")+"}";
  if(note && note.length) {
    note = $(note[0]).parents("p")[0].cloneNode(true);
    $(note).addClass("note");
    note.id=id
    note.insertBefore(DOMSpan("fn", false, index+""), note.firstChild);
    // note.insertBefore(anchor, note.firstChild);
    this.parentNode.insertBefore(note, this.nextSibling);
  } else {
    alert($(this).data("ref"));
  }
  $(note).dblclick(maybeHideNote);
  $(note).find('[href*="Bibliography"]').hoverIntent(citationHoverIn, nullHoverOut);
  $(note).find('[href*="Bibliography"]').click(pinCitation);
  updateXRefs();
  e.preventDefault();
  return false;
}
function showInlineNote(e){
  e.preventDefault();
  var i = 1+$(this).data("index");
  if(document.getElementById("note-"+i)) {
    return $(document.getElementById("note-"+i)).detach();
  }
  note = allNotes[i-1];
  $(note).addClass("note");
  note.id="note-"+i;
  if(!$(note).hasClass("numbered")) note.insertBefore(DOMSpan("fn", false, i+""), note.firstChild);
  $(note).addClass("numbered");
  this.parentNode.parentNode.insertBefore(note, this.parentNode.nextSibling);
}
function inlineNotes(){
  var start = allNotes.length;
  var inlines = $(".contentbox span.note");
  for(i=0; i<inlines.length;i++){
    var fnref = DOMSpan("fn", false, (start+i+1)+"");
    var link = DOMAnchor(false, false, fnref, false);
    $(fnref).data("index", i+start);
    // inlines[i].parentNode.insertBefore(fnref, inlines[i]);
    inlines[i].parentNode.insertBefore(link, inlines[i]);
    $(inlines[i]).detach();
    allNotes.push(inlines[i]);
    $(fnref).click(showInlineNote);
  }
}
function fixedResize(e){
  this.width = Math.min(this.naturalWidth * imageScalingFactor, this.parentNode.clientWidth);
}

function showFigure(e){
  var str = this.innerHTML;
  var figspec = str.indexOf("&lt;Figure");
// FIXME:  var figspecmult = str.indexOf("&lt;Figures");
  var figspecnumber = parseInt(str.substring(figspec+11));
  var figsubspec = /[a-z]/.test(str.charAt(11+((""+figspecnumber).length)))
    ? str.charAt(11+((""+figspecnumber).length)) : "";
  var pad = figspecnumber<10 ? "0" : "";
  showFigure2(pad, figspecnumber, figsubspec, this);
}
function showFigureSpan(e){
  var str = this.innerHTML;
  var figspec = str.indexOf("Figure");
  var figspecnumber = parseInt(str.substring(figspec+7));
  var figsubspec = /[a-z]/.test(str.charAt(figspec+7+((""+figspecnumber).length)))
    ? str.charAt(figspec+7+((""+figspecnumber).length)) : "";
  var pad = figspecnumber<10 ? "0" : "";
  showFigure2(pad, figspecnumber, figsubspec, this);
}
function showFigure2(pad, figspecnumber, figsubspec, obj){
  if(document.getElementById("image-"+figspecnumber+figsubspec)){
    $(document.getElementById("image-"+figspecnumber+figsubspec)).remove();
  } else {
    var img = DOMImage("figure", "image-"+figspecnumber+figsubspec, "Figures/Figure_"+pad+figspecnumber+figsubspec+".png");
    // alert("Figures/Figure_"+pad+figspecnumber+figsubspec+".png");
//    img.width = this.getBoundingClientRect().width-10;
    var div = DOMDiv("figurediv", "figure-"+figspecnumber+figsubspec, img);
    obj.parentNode.insertBefore(div, obj);
    $(img).load(fixedResize);
    $(div).click(function(e){$(obj).remove();});
  }
}

function getFigures(){
  $(".contentbox p:contains('<Figure')").click(showFigure);
  $(".contentbox span.figure").click(showFigureSpan);
}

getNoteEntries();

$(function(){
  getNotes();
  getFigures();
  inlineNotes();
  updateXRefs();
  // $(".contentbox a").filter('[href^="notes.html"]').hoverIntent(citationHoverIn, nullHoverOut);
  $(".contentbox a").filter('[href^="notes.html"]').click(showNote);
});
