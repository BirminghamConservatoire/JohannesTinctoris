var pathtotexts ="../Collated texts/";
var textname = "De notis et pausis";
var variants = ["BU", "G", "Br1", "V"];
function url (variant){
  return pathtotexts+textname+" ("+variant+").txt";
}

// Fixes a bug in firefox: http://stackoverflow.com/a/633031
$.ajaxSetup({'beforeSend': function(xhr){
    if (xhr.overrideMimeType)
        xhr.overrideMimeType("text/plain");
    }
});

function getTranscribedText(i){
  if(typeof(i)!="number" || !i){
    i=0;
  }
  $.ajax({
      async: true,
      url: url(variants[i]),
      datatype: 'text/plain',
      failure: function(){
        alert("no");
      },
      success: function(data){
        doc = new TreatiseDoc(data);
      }
  });
}

function getEditedText(i){
  $.ajax({
      async: true,
      url: '../Edited texts/'+textname+'.txt',
      datatype: 'text/plain',
      failure: function(){
        alert("no");
      },
      success: function(data){
        doc = new TreatiseDoc(data);
      }
  });
}