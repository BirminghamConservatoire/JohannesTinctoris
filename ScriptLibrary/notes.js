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

function getParagraphs(){
	var paragraphs = $(".contentbox p .para-no");
//	console.log(paragraphs.length, paragraphs);
	paragraphs.map(function(i, x) { var foo=DOMAnchor('paragraph', "para-"+x.innerHTML.match(/\d+/)[0], false);  x.appendChild(foo) });
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

function getNote(anchor){
	// Get the relevant footnote. If it's a multi-paragraph footnote,
	// grab all the paragraphs, and put them in a div
	var note = $(anchor).parents("p")[0];
	var nextParaIsNextNote = $(note.nextElementSibling).has("a[id]").length>0;
	console.log('test', nextParaIsNextNote, note.nextElementSibling);
	if(nextParaIsNextNote){
		return note.cloneNode(true);
	} else {
		var bigNote = DOMDiv("longnote", false);
		bigNote.appendChild(note.cloneNode(true));
		console.log("o", note.parentNode,
								$(note.nextElementSibling).has("a[id]").size()==0);
		while(note.nextElementSibling && $(note.nextElementSibling).has("a[id]").size()==0){
			note = note.nextElementSibling;
			console.log(bigNote, note);
			// FIXME: hack
			bigNote.appendChild(note);
		}
		return bigNote;
	}
}

function showFootnoteNote(e){
	e.preventDefault();
	var id = e.target.href;
	var indexSearch = /.*#note-(?<index>[0-9]*)/
	var match = indexSearch.exec(id);
	var index = match.groups.index;
	var origFn = $("#footnote-ref-"+index)[0];
	$([document.documentElement, document.body])
		.animate({
			scrollTop: $(origFn).offset().top
		}, 500);
	showNote2(index, "note-"+index, "footnote-"+index, origFn);
}
function showNote(e){
  e.preventDefault();
  var index = 1+$(this).data("index");
  var id = "note-"+index;
	var ref = $(this).data("ref");
	console.log(this);
	showNote2(index, id, ref, this);
}
function showNote2(index, id, ref, thisObj){
  if(document.getElementById(id)) return $(document.getElementById(id)).remove();
  var note = $("#"+ref, notesPage);
	console.log(notesPage, ref);
  // var anchor = DOMAnchor("{"+$(this).data("ref")+"}", false, false, false);
  // anchor.name = "{"+$(this).data("ref")+"}";
  if(note && note.length) {
		//    note = $(note[0]).parents("p")[0].cloneNode(true);
		note = getNote(note[0]);
    $(note).addClass("note");
    if(!id) console.log("note id error");
    note.id=id;
    note.insertBefore(DOMSpan("fn", false, index+""), note.firstChild);
    thisObj.parentNode.insertBefore(note, thisObj.nextSibling);
  } else {
		console.log("aaargh", $(thisObj).data("ref"), ref, id, note);
//    alert($(thisObj).data("ref"));
  }
	var noteNotes = $(note).find('[href*="#note"]');
	noteNotes.click(showFootnoteNote);
  var cites = $(note).find('[href*="Bibliography"]');
  var base = false;
  for(var i=0; i<cites.length; i++){
    if(!base) base=Math.floor(posForAnchor(cites[i]));
    $(cites[i]).data("refposition", base+(i/100));
    $(cites[i]).hoverIntent(citationHoverIn, nullHoverOut);
    $(cites[i]).click(pinCitation);
  }
  $(note).dblclick(maybeHideNote);
  // $(note).find('[href*="Bibliography"]').hoverIntent(citationHoverIn, nullHoverOut);
  // $(note).find('[href*="Bibliography"]').click(pinCitation);
  updateXRefs();
//  e.preventDefault();
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

function openLargerInNewTab(e){
  var url= this.src.replace("/Inline/", "/Larger/");
  window.open(url, this.alt);
}

function clickToZooms(){
  $("img.clickToZoom").click(openLargerInNewTab);
}

function toggleImage(e){
  if(this.src.indexOf("a.png")>-1){
    this.src = this.src.replace("a.png", "b.png");
  } else {
    this.src = this.src.replace("b.png", "a.png");
  }
}
function imageToggles(){
  $("img.toggle").dblclick(toggleImage);
}

$(function(){
  getNotes();
	getParagraphs();
  getFigures();
  inlineNotes();
  updateXRefs();
  clickToZooms();
  imageToggles();
  // $(".contentbox a").filter('[href^="notes.html"]').hoverIntent(citationHoverIn, nullHoverOut);
  $(".contentbox a").filter('[href^="notes.html"]').click(showNote);
});
