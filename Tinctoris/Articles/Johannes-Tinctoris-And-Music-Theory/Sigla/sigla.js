const sigla = {
	EVAu835: ["<em>E-VAu</em> 835", 'Valencia, Universitat de València, Biblioteca Histórica, MS 835 [<em>olim</em> 844]	<a href="http://weblioteca.uv.es/cgi/view.pl?source=uv_ms_0835">http://weblioteca.uv.es/cgi/view.pl?source=uv_ms_0835</a>']
}

function showCode(el){
	var sig = el.parentNode;
	$(sig).children(".code").show();
	$(sig).children(".details").hide();
}
function showDetails(el){
	var sig = el.parentNode;
	$(sig).children(".code").hide();
	$(sig).children(".details").show();
}
function toggleDetails(el){
	$(el).children(".details").toggle();
}
function replaceSiglum(i, siglum){
	var siglumCode = siglum.innerHTML;
	if(siglumCode in sigla) {
		console.log(Object.keys(sigla));
		siglum.innerHTML = '<span onclick="toggleDetails(this)" class="siglumInfo"><span class="code" tabindex="0">'+sigla[siglumCode][0]
			+'</span><span  tabindex="0" class="details">'+sigla[siglumCode][1]+'</span></span>';
	}
}
function replaceSigla(){
	$(".siglum").each(replaceSiglum);
	$(".siglum .details").hide();
}

$(function() {
  replaceSigla(); 
});
/*
function Siglum(library, msID, msShort, msFull, msURI){
	this.library = library;
	this.id = msCode;
	this.shortHTML = msShort;
	this.longHTML = msLong;
	this.URI = msURI;
	this.exchangeMainText = function(obj){
		obj.replaceWith(this.linkElement());
	}
	this.linkElement = function(){
		var el =  this.shortHTML.cloneNode(true);
		$(el).data("siglum", this);
		return el;
	}
}
function Library(siglum, place, name){
	this.siglum = siglum;
	this.place = place;
	this.name = name;
}
const libraryData = [
	["A-Wn", "Vienna", "Österreichische Nationalbibliothek"],
	["B-Br", "Brussels", "Bibliothèque Royale"],
	["B-Gu", "Ghent", "Universiteitsbibliotheek"],
	["D-Eu", "Eichstätt", "Universitätsbibliothek Eichstätt-Ingolstadt"]
]
const MSSData = [
	["A-Wn", "2.H.15", "2.H.15", "http://data.onb.ac.at/dtl/5207039"]
]
const libraries = {}
libraryData.forEach(x=>libraries[x[0]] = new Library(...x));
*/
