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
/*
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
*/
function replaceSiglum(sigla, i, siglum){
	console.log(sigla, i, siglum);
	var siglumCode = siglum.innerHTML;
	if(siglumCode in sigla) {
		siglum.innerHTML = '<span onclick="toggleDetails(this)" class="siglumInfo"><span class="code" tabindex="0">'+sigla[siglumCode].siglum
			+'</span><span  tabindex="0" class="details">'+sigla[siglumCode].fullName+'</span></span>';
	}
}
function replaceSigla(sigla){
	console.log(sigla)
	var rS = replaceSiglum.bind(null, sigla);
	$(".siglum").each(rS);
	$(".siglum .details").hide();
}


$(function() {
	$.get('/Tinctoris/Articles/Johannes-Tinctoris-And-Music-Theory/Sigla/sigla.json', replaceSigla, 'json')
});
