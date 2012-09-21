var MEINS = "http://www.music-encoding.org/ns/mei";

function pitchToMEIPitch(pitch){
  return pitch.charAt(0).toLowerCase;  
}

function pitchToMEIOct(pitch){
  return pitch == pitchToMEIPitch(pitch) ? pitch.length+3: 4-pitch.length;
}

function PitchedMEINote(pitchstring, rhythm, properties){
  var note = document.createElementNS(MEINS, "note");
  note.setAttributeNS("pname", pitchToMEIPitch(pitchstring));
  if(rhythm) note.setAttributeNS("dur", rhythms[rhythm]);
  note.setAttributeNS("oct", pitchToMEIOct(pitchstring));
  //FIXME: dots
  return note;
}

function PitchedMEINeume(pitchstring, sign, properties){
  var neume = document.createElementNS(MEINS, "uneume");
  // FIXME: I don't think MEI yet has a punctum inclinatum??
  neume.setAttributeNS("name", sign=="p" || sign=="l" ? "punctum" : "virga");
  neume.appendChild(pitchedMEINote(pitchstring, false, false));
  return neume;
}

function PitchedMEICustos(pitchstring, properties){
  var custos = document.createElementNS(MEINS, "custos");
  custos.setAttributeNS("pname", pitchToMEIPitch(pitchstring));
  custos.setAttributeNS("oct", pitchToMEIOct(pitchstring));
  //FIXME: dots
  return custos;
}

function MEIDot(properties){
  // Position?!
  return document.createElementNS(MEINS, "dot");
}

