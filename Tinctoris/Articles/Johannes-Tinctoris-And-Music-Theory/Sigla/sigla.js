var loadedSigla;

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
function replaceSiglum(sigla, i, siglum){
	// Given a siglum (in a <span>) in plain text in an article,
	// replace with an active link from sigla
	var siglumCode = siglum.innerHTML;
	var siglumMatch = sigla.find(sigObj => sigObj.id == siglumCode);
	if(siglumMatch) {
		siglum.innerHTML = '<span onclick="toggleDetails(this)" class="siglumInfo"><span class="code" tabindex="0">'+siglumMatch.siglum
			+'</span><span  tabindex="0" class="details">'+siglumMatch.fullName+' ' + siglumMatch.url
			+'</span></span>';
	}
}
function replaceSigla(sigla){
	// Replace all sigla spans in article with
	// expandable links
	if(!loadedSigla) loadedSigla = sigla;
	var rS = replaceSiglum.bind(null, sigla);
	$(".siglum").each(rS);
	$(".siglum .details").hide();
}
function docChanged(){
	if(!loadedSigla) return;
	replaceSigla(loadedSigla);
}
function startObserving(){
	var article = document.getElementsByClassName("contentbox")[0];
	var observer = new MutationObserver(docChanged);
	observer.observe(article, {subtree:true, childList: true});
}
$(function() {
	$.get('/Tinctoris/Articles/Johannes-Tinctoris-And-Music-Theory/Sigla/sigla.json', replaceSigla, 'json');
	startObserving();
});
