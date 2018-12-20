function ensureTEI(){
  var treatise;
  for(var i=0; i<texts.treatises.length; i++){
    if(texts[texts.treatises[i]]){
      if(!texts[texts.treatises[i]].TEI){
        // FIXME: only edited for now.
        treatise = new TreatiseDoc(texts[texts.treatises[i].edited], false);
        texts[texts.treatises[i]].TEI = treatise.toTEI();
      }
    }
  }
};
