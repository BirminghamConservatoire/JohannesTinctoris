var MEINS = "http://www.music-encoding.org/ns/mei";

///////////
// Attributes

function pitchToMEIPitch(pitch){
  return pitch.charAt(0).toLowerCase;  
}
function pitchToMEIOct(pitch){
  /// ?? FIXME: Check this makes sense
  return pitch == pitchToMEIPitch(pitch) ? pitch.length+3: 4-pitch.length;
}
function pitchFromMEIPitch(name, octave){
  if(octave>3){
    return new Array(octave-1).join(name);
  } else {
    return new Array(3-octave).join(name.toUpperCase();
  }
}
function rhythmFromMEIDuration(dur){
  // FIXME: stupid;
  var rhythm_keys = ["M", "L", "B", "S", "m", "s", "f"];
  for(var i=0; i<rhythm_keys.length; i++){
    if(dur===rhythms[rhythm_keys[i]]){
      return rhythm_keys[i];
    }
  }
}
function MEIMensStringToMensSig(sign, slash){
  switch(sign){
    case "C":
      if(slash=="1"){
        return "C/";
      } else {
        return "C";
      }
  }
}
function lineToStaffPos(line){
  return (Number(line)*2)+2;
}

///////////////
// Note

function PitchedMEINote(pitchstring, rhythm, properties){
  var note = document.createElementNS(MEINS, "note");
  note.setAttributeNS("pname", pitchToMEIPitch(pitchstring));
  if(rhythm) note.setAttributeNS("dur", rhythms[rhythm]);
  note.setAttributeNS("oct", pitchToMEIOct(pitchstring));
  //FIXME: dots
  return note;
}
function MEINoteToObject(note){
  var obj = new Note();
  obj.pitch = pitchFromMEIPitch(note.getAttributeNS(false, "pname"), note.getAttributeNS(false, "oct"));
  obj.rhythm = rhythmFromMEIDuration(note.getAttributeNS(false, "dur"));
}

function PitchedMEINeume(pitchstring, sign, properties){
  var neume = document.createElementNS(MEINS, "uneume");
  // FIXME: I don't think MEI yet has a punctum inclinatum??
  neume.setAttributeNS("name", sign=="p" || sign=="l" ? "punctum" : "virga");
  neume.appendChild(pitchedMEINote(pitchstring, false, false));
  return neume;
}
function MEINeumeToObject(neume){
  // FIXME: ??
  var obj;
  var notes = neume.children();
  if(notes.length == 1){
    obj = new ChantNote();
    obj.rhythm = neume.getAttributeNS(MEINS, "name")==="punctum" ? "p" : "v";
    obj.pitch = notes[0].pitchFromMEIPitch(note.getAttributeNS(MEINS, "pname"), 
                                           note.getAttributeNS(MEINS, "oct"));
  }
  return obj;
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

function MEIClef(line, shape){
  var clef = document.createElementNS(MEINS, "clefchange");
  clef.setAttributeNS("line", line);
  clef.setAttributeNS("shape", shape);
}
function MEIClefToObject(clef){
  var obj = new Clef();
  obj.staffPos = lineToStaffPos(clef.getAttributeNS(MEINS, "line"));
  obj.type = clef.getAttributeNS(MEINS, "shape");
  return obj;
}

function MEIMensur(){
}
function MEIMensurToObject(mensur){
  var obj = new MensuralSignature();
  obj.signature = MEIMensStringToMensSig(mensur.getAttributeNS(MEINS, "sign"), 
                                        mensur.getAttributeNS(MEINS, "slash"));
// Does this happen?  obj.staffPos = (Number(clef.getAttributeNS(MEINS, "line"))*2)+2;
  return obj;
}
function MEIAccid(){
}
function MEIAccidToObject(accid){
}
function MEILigature(){
}
function MEILigatureToObject(lig){
  var obj = new Ligature();
  var note, ligNote;
  var notes = ligature.children();//FIXME:????
  for(var i=0; i<notes.length; i++){
    note = pitchedMEINote(notes[i]);
    ligNote = new LigatureNote();
    ligNote.pitch = note.pitch;
    ligNote.rhythm = note.rhythm;
    ligNote.staffPos = note.staffPos;
  }
  return obj;
}
