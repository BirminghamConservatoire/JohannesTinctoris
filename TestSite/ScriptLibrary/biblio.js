function highlightHashedRef(){
  var cited = $(".contentbox "+window.location.hash).parents("p");
  if(cited && cited.length){
    $(cited[0]).addClass("cited");
    window.scrollByLines(-8)
  }
}

$(function(){
  highlightHashedRef();
  window.onhashchange = highlightHashedRef;
});
