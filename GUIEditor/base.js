// First file to load. Contains:
//  1. Dictionaries for finding glyphs
//  2. Global variables
//  3. Utility functions

/////////////////////
// `Dictionaries' -- These are where symbol codes are converted to
// characters from RW's fonts, y offsets and width guidance.
// 
// For notes, mostly

var prop=0.7;
var noteEn = 1.8 * prop;
var ya = 50.5;
//var ya = 63;
var yb = 6;
var rhythms = {M: "maxima", L: "longa", B: "brevis",
               S: "semibrevis", m: "minima", s: "semiminima",
               f: "fusa"};
var baseDictionary = 
  {void: {M: ["a", ya, 2.8*prop],//50.5, 2.8],
          L: ["s", ya, noteEn], 
          B: ["d", yb, noteEn],
          S: ["f", yb, noteEn],
          m: ["g", yb, noteEn],
          s: ["h", yb, noteEn],
          f: ["k", yb, noteEn],
          c: ["~", yb, noteEn]},
   black: {M: ["a", ya, 2.8],
          L: ["s", ya, noteEn], 
          B: ["d", yb, noteEn],
          S: ["f", yb, noteEn],
          m: ["g", yb, noteEn],
          s: ["h", yb, noteEn],
          f: ["k", yb, noteEn],
          c: ["~", yb, noteEn]},
   square: {c: ["~", yb, 2.5]},
   hufnagel: {c: ["~", yb, 2.5]}};
// For completely void/black note shapes
var voidBaseDictionary = 
  {void: {M: ["a", ya, 2.8],
          L: ["s", ya, noteEn], 
          B: ["d", yb, noteEn],
          S: ["f", yb, noteEn],
          m: ["g", yb, noteEn],
          s: ["j", yb, noteEn],
          f: ["∆", yb, noteEn],
          c: ["~", yb, noteEn]},
   black: {M: ["a", ya, 2.8],
          L: ["s", ya, noteEn], 
          B: ["d", yb, noteEn],
          S: ["f", yb, noteEn],
          m: ["g", yb, noteEn],
          s: ["j", yb, noteEn],
          f: ["∆", yb, noteEn],
          c: ["~", yb, noteEn]},
   square: {c: ["~", yb, 2.5]},
   hufnagel: {c: ["~", yb, 2.5]}};
// For inverted notes (some of these stay the same)
var flippedDictionary = 
  {void: {M: ["A", yb, 2.8], 
          L: ["S", yb, noteEn], 
          B: ["d", yb, noteEn],
          S: ["f", yb, noteEn],
          m: ["G", ya, noteEn],
          s: ["H", ya, noteEn],
          f: ["J", ya, noteEn]},
   black: {M: ["A", yb, 2.8], 
           L: ["S", yb, noteEn], 
           B: ["d", yb, noteEn],
           S: ["f", yb, noteEn],
           m: ["G", ya, noteEn],
           s: ["H", ya, noteEn],
           f: ["J", ya, noteEn]}};
var voidFlippedDictionary = 
  {void: {M: ["A", yb, 2.8], 
          L: ["S", yb, noteEn], 
          B: ["d", yb, noteEn],
          S: ["f", yb, noteEn],
          m: ["G", ya, noteEn],
          s: ["J", ya, noteEn],
          f: ["Ô", ya, noteEn]},
   black: {M: ["A", yb, 2.8], 
           L: ["S", yb, noteEn], 
           B: ["d", yb, noteEn],
           S: ["f", yb, noteEn],
           m: ["G", ya, noteEn],
           s: ["J", ya, noteEn],
           f: ["Ô", ya, noteEn]}};

var restDictionary = 
  {B: ["∂", yb, 1.3],
   S: ["ƒ", yb, 1.3],
   m: ["©", yb, 1.3],
   s: ["˙", yb, 1.3],
   f: ["˚", yb, 1.5]};
var clefDictionary = 
  {
    C: [":", 28.5, 2],
    F: ["L", 43.5, 3],
    G: ["Ý", 28.5, 2.5]
  };
var mensDictionary = 
  {
    O: ["X", 35, 2.75, false],
    C: ["C", 35, 2.75, false],
    Ø: ["X", 35, 2.75, "<"],
    Ç: ["C", 35, 2.75, "<"]
  };
var solmDictionary = 
  {
    b: ["b",4, 2.5*prop],
    h: ["µ",35, 2.5*prop],
    x: ["M",35, 2.5*prop]
  };
var dotData = [">", 36, 1];
// No longer needed -- I'm drawing these.
// var obliqueDictionary = 
//   {
//     void: ["W", "∑", "w", "Œ", "Q", "œ", "q", "", "r", "®", "R", "Â", "t", "†", "T"]
//   };
// var ligStemDictionary = ["¡", "€", "#", "¢", "∞", "§", "¶", "•"];


///////////////////////////////////////
// Global variables
//
// Constants
var foo=false;
var editable = true;
var nocache = false;
var vertical;
var leading = 20;
// var topMargin = 40;
var topMargin = 25;
var lmargin = 10;
var rastralSize = 15;
var exWidth = 690;
var localWidth = exWidth;
var colours = {red: "#F00", black: "#000", blind: "#AAA"};
var clefOffsets = {Gamma: 0, F: 6, C: 10, G: 14, E: 19};
var notes = ["AA", "BB", "CC", "DD", "EE", "FF", "GG", 
  "A", "B", "C", "D", "E", "F", "G",
  "a", "b", "c", "d", "e", "f", "g",
  "aa", "bb", "cc", "dd", "ee", "ff", "gg",
  "aaa", "bbb", "ccc", "ddd", "eee", "fff", "ggg"];

// UI-set variables
var showvariants = true;
var showtranslationnotes = true;
var showtranscriptionnotes = true;
var punctuationStyle="modern";
var editorDisplay = "show";
var dateDisplay = "show";
var copyTextDisplay = "show";
var sourceDisplay = "show";
var infoButtons = false;

// Current variable values (for context)
//var tooltip = false;
var sources = [];
var nodeNo = 0;
var nodes = [];
var textnodes = [];
var sysWidths = false;
var sysNo = 0;
var pointer = 0;
var strikeStarts = false;
var voidnotes = false;
var doc = false;
var complaint = [];
var chapter = 0;
var book = 0;
var string;
var SVG = false;
var canvas = false;
var context = false;
var currentExample = false;
var handsmet = [];
var examplei = false;
var eventi = false;
var curx = 0;
var cury = 20;
var currentLinecount = 5;
var currentStaffColour = "";
var currentSystem = false;
var currentSystems = [];
var currentInfo = false;
var suppressBreak = true;
var currentClef = false;
var currentRedline = false;
var uncapitalise = false;
var initialStaffStar = false;
var drawingWidth;
var currentType = "mensural";
var currentSubType = "void";
var dotPos = false;
var redline = false;
var examples = [];
var k1 = Math.cos(Math.PI/3) ;//0.866;
var k2 = Math.sin(Math.PI/3);//0.5;
var textScale = 0.8;
var commentStyle = "#00F";
var comments = false;
var hands = [];
var range = false;

function musicStyle(){
  return "font-size : "+(3*rastralSize*prop)+"pt";
}
function restStyle(){
  return "font-size: "+(3 * rastralSize) +"pt";
}

function textClasses(cstyles){
  // This is effectively "text"+styles.join(" "), but I don't want to
  // anticipate future use
  var textstyle = "text ";
  for(var i=0; i<cstyles.length; i++){
    textstyle += cstyles[i] + " ";
  }
  return textstyle;
}

function textFont(){
//  var font = "normal " + Math.floor(rastralSize * 0.8) + "pt serif";
  var font = Math.floor(rastralSize * textScale) + "pt georgia";
  return font;
}
function musicFont(){
  return Math.round(3 * rastralSize * prop) +"pt ArsNovaBlackRegular";
}
function restFont(){
  return Math.round(3 * rastralSize) +"pt ArsNovaBlackRegular";
}
function sansFont(){
  return "bold "+Math.floor(rastralSize * textScale) + "pt sans-serif";
}
function starFont(){
  return "bold "+Math.floor(rastralSize * textScale * 2) + "pt sans-serif";
}

function metrics(){
  return {
    halfHeight: rastralSize * 2/3 * prop,
    vThickness: rastralSize / 7.5 * prop,
    hThickness: rastralSize / 3 * prop,
    stemLength: rastralSize * 3.3 * prop,
    hOffset:    rastralSize / 3 * prop,
    oblOffset: rastralSize / 3 * prop,
    chantThickness: rastralSize /2,
    chantPenA: rastralSize / 7,
    chantPenB: rastralSize / 4,
    widthUnit: rastralSize * prop
    // chantPenA: rastralSize / 3,
    // chantPenB: rastralSize / 10
  };
}

//////////////////////////////////////////////////
//
// Utility functions:

// a. pitch/vertical positioning

function fontCharData (rhythm){
  // basic form for getting glyph
  return baseDictionary[currentSubType][rhythm];
}

function HexChar(staffpos){
  // convert hex staffPos to integer
  return (Number("0x"+staffpos));
}

// FIXME: Obsolete
function pitchgt(note1, note2){
  // compare relative height based on staffPos
  if(note1.objType == "Oblique"){
    note1 = note1.members[1].staffPos;
  }
  if(note2.objType == "Oblique"){
    note2 = note2.members[0].staffPos;
  }
  return HexChar(note1.staffPos) > HexChar(note2.staffPos);
}

function yoffset(staffpos){
  // Convert staffPos to coordinate offset
  // FIXME: get rid of this IF/ELSE
  if(typeof(staffpos) == 'string'){
    return (rastralSize * (HexChar(staffpos) - 2)) / 2;
  } else {
    return (rastralSize * (staffpos - 2)) / 2;
  }
}

function texty(offset, staffPos){
  return cury+(offset*rastralSize/15) - yoffset(staffPos);
}

function staffPosFromPitchString(pitchString){
  return notes.indexOf(pitchString)-6 + currentClef.pitchOffset();
}

function isStaffPos(posChar){
  posChar.match(/[0123456789ABCDEF]/);
}

function getvPos(o){
  // Finds pitch or staff pos for events that can have either
  if(currentClef){
    // Must be pitch
    var loc = string.search(/([A-g])\1{0,2}/);
    if(loc == -1 || loc >0){
      return false;
    } else {
      var match = string.match(/([A-g])\1{0,2}/)[0];
      string = string.substring(match.length);
      return [match, staffPosFromPitchString(match)];
    }
  } else {
    // Must be staffPos
    return [false, getStaffPos()];
  }
}

function getAndSetPitch(object){
  var pitch = getvPos(object);
  if(pitch) {
    object.pitch = pitch[0];
    object.staffPos = pitch[1];
  }
  return object;
}

function getStaffPos(){
  var pos = "0123456789ABCDEF".indexOf(string.charAt(0));
  if(pos != -1){
    string = string.substring(1);
    return pos;
  } else {
    return false;
  }
}

function getRhythm(){
  var rhythm = string.charAt(0).match(/[MLBSmsfpv]/);
  if(rhythm){
    string = string.substring(1);
    return rhythm;
  } else {
    return false;
  }
}

function consume(n){
  string = string.substring(n);
  pointer += n;
}

function consumeIf(search){
  var result = typeof(search)=='string' ? string.indexOf(search) : string.search(search);
  if(result == 0){
    var match = typeof(search)=='string' ? search : string.match(search)[0];
    string = string.substring(match.length);
    pointer += match.length;
    return match;
  } else {
    return false;
  }
}

function consumeSpace(){
  var nextNonSpace = string.search(/\S/);
  pointer += nextNonSpace;
  string = string.substring(string.search(/\S/));
}

function unRead(value){
  // We've pulled too much off of the string and it and the pointer
  // need to be reset
  string = value + string;
  pointer -= value.length;
}

function setDotPos(staffPos){
  dotPos = (2 * Math.floor(staffPos/2)) + 1;
}

// b. Generic drawing

// b. i) lines

function drawSystem(linecount, y, x1, x2, colour, lcanvas){
   y+=0.5;
   for(var i=0; i<linecount; i++){
     svgLine(SVG, x1, y, x2, y, colour+"SVGLine", false);
    y += rastralSize;
  }
  return group;
}

function drawSystemLines(sysgroup, linecount, y, x1, x2, colour, lcanvas){
   y+=0.5;
   for(var i=0; i<linecount; i++){
     svgLine(sysgroup, x1, y, x2, y, colour+"SVGLine", false);
    y += rastralSize;
  }
  return sysgroup;
}


function drawVerticalLine(x, y1, y2, classes){
  return svgLine(SVG, x, y1, x, y2, classes, false);
}

function drawRedBarline(x, top, bottom){
  svgLine(SVG, x, top, x,  bottom, "barline red", false);
}
function drawScallopedBarline(x, top, bottom, colour){
  var count = Math.floor(1.6 * (top - bottom) / rastralSize);
  var step = (top - bottom) / count;
  var halfStep = step / 2;
  var r = halfStep * 0.9;
  var path = [];
  for(var y=bottom; y<=top-step; y+=step){
    path.push(svgArc(x+r*1.25, y, x+r*1.25, y+step, r));
  }
  curx+=rastralSize;
  return svgPath(SVG, path, "scallopedBarline"+(colour? " "+colour: ""), false);
}

function drawPartialBarline(x, y, start, end){
  svgLine(SVG, x, y-yoffset(start), x, y-yoffset(end), "barline", false);
}

function drawBarline(x, y){
  svgLine(SVG, x+0.5, y-rastralSize, x+0.5, y-(rastralSize * currentLinecount), "barline", false);
}

function drawSmallBarline(start, end, thickness){
  var starty = cury - yoffset(start);
  var endy = cury - yoffset(end);
  svgLine(SVG, curx+0.5, starty, curx+0.5, endy, "barline", false);
}

function drawLedgerLine(x, y, x2) {
  // FIXME: line end is wrong
  if(x2){
    svgLine(SVG, x, y, x2, y, "ledgerline", false);
  } else{
    svgLine(SVG, x, y, x+rastralSize, y, "ledgerline", false);
  }
}

// b. ii) Ligature components (boxes)

function drawBox(note, staffPos, width, lStem, rStem, sup){
  var m = metrics();
  var group = svgGroup(SVG, "ligatureBox"+(editable ? " clickable" : ""), false);
  var pos = note.staffPos;
  var poffset = yoffset(pos);
  width = width * prop;
  if(sup){
    width = -width;
    var tstem = lStem;
    lStem = rStem ? -1 : false;
  }
  // LEFT BAR
  if(staffPos){
    var joinTop = Math.max(yoffset(staffPos), poffset) + m.halfHeight;
    var joinBottom = Math.min(yoffset(staffPos), poffset) - m.halfHeight;
    svgLine(group, curx, cury-joinTop, curx, cury-joinBottom, "ligatureVertical", false);
  } else {
    svgLine(group, curx, cury - poffset - m.halfHeight, curx,
            cury - poffset + m.halfHeight, "ligatureVertical", false);
  }
  if(lStem ==-1){
    svgLine(group, curx, cury - poffset + m.halfHeight, curx,
            cury - poffset + m.stemLength, "ligatureStem", false);
  } else if (lStem == 1){
    svgLine(group, curx, cury - poffset - m.halfHeight, curx,
            cury - poffset - m.stemLength, "ligatureStem", false);    
  }
  // MIDDLE
  svgLine(group, curx, cury - poffset+m.hOffset, curx+width, cury-poffset+m.hOffset,
         "ligatureHorizontal", false);
  svgLine(group, curx, cury - poffset-m.hOffset, curx+width, cury-poffset-m.hOffset,
         "ligatureHorizontal", false);
  curx+=width;
  // RIGHT
  svgLine(group, curx, cury - poffset-m.halfHeight, curx, 
    cury-poffset+(rStem ? m.stemLength : m.halfHeight), "ligatureVertical", false);
  if(sup){
    curx -= width;
  }
  if(editable){
    note.example = currentExample;
    $(group).click(editObject(note));
    $(group).hover(shiftHoverToShift(note, 1), hoverOutShiftChecked());
  }
  return group;
}

function drawOblique2 (sp1, sp2, staffPos, width, lstem, rstem){
  var m = metrics();
  // I'm confused here. I named vThickness as the size of vertical
  // strokes, but the thickness affects horizontal values, so renaming
  var ThV = m.hThickness * 1.2;
  var ThH = m.vThickness;
  var DV = m.oblOffset*0.8*0.8;
  curx -= ThH/2;
  var nudge = 0;//sp1>sp2 ? rastralSize*prop/6 : rastralSize*prop/-6;
  var y1 = cury - yoffset(sp1) + Math.ceil((sp2-sp1) / 4);
  var y2 = cury - yoffset(sp2) +1;
  var x1 = curx;
  var x2 = curx + width;
  var gradient = (y2 - y1) / (x2 - x1 - (2 * ThH));
  // var path = svgPath(SVG,
  //         svgPolyPath([x1, y1-DV-ThV-(ThH*gradient), x2, y2-DV-ThV+(ThH*gradient),
  //           x2, y2+DV+ThV+(ThH*gradient), x1, y1+DV+ThV-(ThH*gradient)], true).concat(
  //         svgPolyPath([x1+ThH, y1-DV, x1+ThH, y1+DV, x2-ThH, y2+DV, x2-ThH, y2-DV], true)),
  //        'ligatureOblique', false);
  var x1a = curx+(width/2);
  var y1a = (y1+y2)/2;
  var ThD = ThH*gradient;
  var path = svgPath(SVG,
                    svgPolyPath([x1+ThH, y1-DV, x1+ThH, y1+DV, 
                      x1a, y1a+DV, x1a, y1a+DV+ThV, x1, y1+DV+ThV-ThD,
                      x1, y1-DV-ThV-ThD, x1a, y1a-DV-ThV, x1a, y1a-DV], true), 
                      "ligatureOblique start", false);
  var path2 = svgPath(SVG,
                svgPolyPath([x1a, y1a-DV-ThV, x1a, y1a-DV,
                  x2-ThH, y2-DV, x2-ThH, y2+DV, x1a, y1a+DV,
                  x1a, y1a+DV+ThV, x2, y2+DV+ThV+ThD, x2, y2-DV-ThV+ThD], true),
                      "ligatureOblique end", false);
  // var group = svgGroup(SVG, "ligatureOblique", false);
  // svgPolygon(group, [x1, y1-DV-ThV-(ThH*gradient),
  //                    x2, y2-DV-ThV+(ThH*gradient),
  //                    x2, y2+DV+ThV+(ThH*gradient),
  //                    x1, y1+DV+ThV-(ThH*gradient)],
  //            'obliqueOuter', false);
  //  svgPolygon(group, [x1+ThH, y1-DV, x1+ThH, y1+DV, x2-ThH, y2+DV, x2-ThH, y2-DV],
  //             'obliqueInner', false);
  return path;
}

function drawObliqueStart(sp1, sp2){
  var m = metrics();
  // I'm confused here. I named vThickness as the size of vertical
  // strokes, but the thickness affects horizontal values, so renaming
  var ThV = m.hThickness * 1.2;
  var ThH = m.vThickness;
  var DV = m.oblOffset*0.8*0.8;
  curx -= ThH/2;
  var nudge = 0;//sp1>sp2 ? rastralSize*prop/6 : rastralSize*prop/-6;
  var y1 = cury - yoffset(sp1) + Math.ceil((sp2-sp1) / 4);
  var y2 = cury - yoffset(sp2) +1;
  var x1 = curx;
  var width = oWidth(sp1, sp2);
  var x2 = curx + width;
  var gradient = (y2 - y1) / (x2 - x1 - (2 * ThH));
  var x1a = curx+(width/2);
  var y1a = (y1+y2)/2;
  var ThD = ThH*gradient;
  // 6***
  // *******
  // **1*******
  // ***   ******7
  // ***      ****
  // ***         8
  // ***
  // **2
  // 5******
  //    *******
  //       ******3
  //          ****
  //             4
  var path = svgPath(SVG,
                    svgPolyPath([x1+ThH, y1-DV, x1+ThH, y1+DV, 
                      x1a, y1a+DV, x1a, y1a+DV+ThV, x1, y1+DV+ThV-ThD,
                      x1, y1-DV-ThV-ThD, x1a, y1a-DV-ThV, x1a, y1a-DV], true), 
                      "ligatureOblique start", false);
  return path;
}

function drawObliqueEnd(sp2, sp1){
  var m = metrics();
  // I'm confused here. I named vThickness as the size of vertical
  // strokes, but the thickness affects horizontal values, so renaming
  var ThV = m.hThickness * 1.2;
  var ThH = m.vThickness;
  var DV = m.oblOffset*0.8*0.8;
  var nudge = 0;//sp1>sp2 ? rastralSize*prop/6 : rastralSize*prop/-6;
  var y1 = cury - yoffset(sp1) + Math.ceil((sp2-sp1) / 4);
  var y2 = cury - yoffset(sp2) +1;
  var x1 = curx;
  var width = oWidth(sp1, sp2);
  var x2 = curx + width;
  var gradient = (y2 - y1) / (x2 - x1 - (2 * ThH));
  var x1a = curx+(width/2);
  var y1a = (y1+y2)/2;
  var ThD = ThH*gradient;
  // 1
  // ****
  // 2******
  //    *******
  //       ******8
  //          ****
  // 5         3**
  // **        ***
  // 6****     ***
  //    *****  ***
  //       ****4**
  //          ****
  //             7
  var path = svgPath(SVG,
                svgPolyPath([x1a, y1a-DV-ThV, x1a, y1a-DV,
                  x2-ThH, y2-DV, x2-ThH, y2+DV, x1a, y1a+DV,
                  x1a, y1a+DV+ThV, x2, y2+DV+ThV+ThD, x2, y2-DV-ThV+ThD], true),
                      "ligatureOblique end", false);
  // FIXME: Why?
  curx -= ThH/2;
  return path;  
}

function drawObliqueNeume(sp1, sp2, staffPos, width, lstem, rstem) {
  var m = metrics();
  curx -= m.vThickness/2;
  var y1 = cury - yoffset(sp1);
  var y2 = cury - yoffset(sp2);
  var x1 = curx;
  var x2 = curx + width;
  var DV = m.chantThickness / 2;
  svgPolygon(SVG, [x1, y1-DV, x1, y1+DV, x2, y2+DV, x2, y2-DV],'obliqueOuter', false);
}

function oWidth(p1, p2){
  var k=0.8;
  var a=0.8;
  return prop * rastralSize * (k + a * Math.abs(p2-p1));
}

function drawOblique (sp1, sp2, staffPos, width, lStem, rStem){
  width = oWidth(sp1, sp2);
  var m = metrics();
  if(currentSubType == "void"){
    var offset = m.oblOffset*0.8+m.vThickness;
    var stemLength = m.stemLength;
  } else {
    var offset = m.hThickness / 2;
    var stemLength = m.stemLength / 4;
  }
  // MIDDLE (first!)
  if(currentSubType == "void"){
    drawOblique2(sp1, sp2, staffPos, width, lStem, rStem);
  } else {
    drawObliqueNeume(sp1, sp2, staffPos, width, lStem, rStem);
  }
  // LEFT BAR
  curx+=(m.vThickness/2);
  if(lStem){
    svgLine(SVG, curx, cury-yoffset(sp1)-(lStem*stemLength), curx, cury-yoffset(sp1)+(lStem*offset),
            "ligatureVertical", false);
  }
  if(staffPos && Math.abs(staffPos-sp1)>1){
    var joinTop = Math.max(yoffset(staffPos), yoffset(sp1)) + offset;
    var joinBottom = Math.min(yoffset(staffPos), yoffset(sp1)) - offset;
    svgLine(SVG, curx, cury-joinBottom, curx, cury-joinTop, "ligatureVertical", false);
  }
  curx += width- m.vThickness;
}

function drawRhombus(x, y, colour, ltail, rtail){
  var m = metrics();
  var a = m.chantPenA;
  var b = m.chantPenB;
  if (foo) alert([a, b]);
  var group = svgGroup(SVG, "rhombus", false);
  var classExtra = " ";
  if(colour){
    classExtra = colour;
  }
  if(ltail){
    svgLine(group, x-k1*a-k2*b-1, y+k2*a-k1*b, x-k1*a-k2*b-1, y+k2*a-k1*b+rastralSize,
            "rhombusTail" + classExtra, false);
  }
  if(rtail){
    svgLine(group, x+k1*a+k2*b+1, y-k2*a+k1*b, x+k1*a+k2*b+1, y-k2*a+k1*b+rastralSize, 
            "rhombusTail" + classExtra, false);
  }
  svgPolygon(group, [x-k1*a+k2*b, y+k2*a+k1*b,x+k1*a+k2*b, y-k2*a+k1*b,
                     x+k1*a-k2*b, y-k2*a-k1*b, x-k1*a-k2*b, y+k2*a-k1*b],
             "rhombus" + classExtra, false);
}

// b. ii) Chant components

function drawNeumeJoin(x, y, p1, p2, colour, sup){
  var m = metrics();
  var a = m.chantPenA;
  var b = m.chantPenB;
  return svgLine(SVG, x-neumeStep(p1, p2)+k1*a+k2*b, y-yoffset(p1)-k2*a+k1*b,
                 x-k1*a-k2*b,y-yoffset(p2)+k2*a-k1*b, "neumeJoin " + (colour ? colour : ""));
}

function neumeStep(p1, p2){
  if(typeof(p1)=="object"){
    return 0;
  } else {
    return rastralSize*0.7;
//    return Math.pow(Math.abs(p2-p1),0.2) * (rastralSize * 0.6);
  }
}

function drawChantBox(x, y, ltail, rtail, colour, sup, nudge){
  var m = metrics();
  var ct = m.chantThickness;
  nudge = nudge ? nudge : 0;
  svgLine(SVG, sup == true ? x - ct + 1 : x, y - (ct / 2) + nudge, 
          sup == true ? x - ct + 1 : x, y + (ct/2) + nudge, 
          "chantSquare"+(colour ? " "+colour: ""), false);
  if(rtail!=false){
    svgLine(SVG, x+(ct/2)-(rastralSize*0.7/15), y+(ct/2), x+(ct/2)-(rastralSize*0.7/15), y+rastralSize,
            "chantTail"+(colour ? " "+colour: ""), false);
  }
  if(ltail!=false){
    svgLine(SVG, x-(ct/2)+0.5, y+(ct/2), x-(ct/2)+0.5, y+rastralSize, 
            "chantTail"+(colour ? " "+colour: ""), false);
  }
}

// c. Parsing aids

function bracedParam(str){
  var loc = str.indexOf("{");
  var locend = str.indexOf("}");
  var locmid = str.indexOf(":");
  var data = [];
  if(loc != -1 && locend > locmid && locmid > loc) {
    str = str.substring(1);
    loc = str.search(/\S/);
    while(locmid != -1 && locmid<locend){
      data.push(str.substring(loc, locmid));
      str = str.substring(locmid+1);
      loc = str.search(/\S/);
      locmid = str.indexOf(",");
      locend = str.indexOf("}");
    }
    if(loc<locend){
      data.push(str.substring(loc, locend));
    }
    return [data, str.substring(locend+1)];
  }
  return false;
}

// d. System break management

function sysBreak(){
  var width = sysWidths[sysNo];
  curx = lmargin;
  cury += rastralSize * 5 + 5;
  curx += rastralSize / 2;
  cury += currentLinecount * rastralSize;
  sysNo++;
}

function sysBreak2(lastp){
  currentExample.w2.push([curx, cury-(currentLinecount*rastralSize), 
    currentLinecount, currentStaffColour]);
  if(typeof(lastp) == "undefined" || !lastp){
    currentSystems.push(svgGroup(SVG, "Stafflines", false));
  }
//  if(isNaN($(currentExample.staffSVG).innerWidth())) alert([currentExample, $(currentExample.staffSVG)]);
  localWidth = Math.max(curx+2, localWidth);
  currentExample.staffSVG.setAttribute('width', localWidth);
}

// e. custos assistance
function nextPitch(){
  var events = currentExample.events;
  var event;
  var components;
  for(var i=eventi+1; i< events.length; i++){
    event = events[i];
    if(event.objType == "Note") {
      return pitchAndPos(event);
    } else if (event.objType == "ChantNote"){
//      alert(pitchAndPos(event));
      return pitchAndPos(event);
    } else if (event.objType == "Ligature"){
      // FIXME: not robust to clef changes
//      var e = event.nextNote(-1);
      var e = event.nthNote(0);
      if(e.objType == "Oblique"){
        e = e.members[0];
      }
      if(e) return pitchAndPos(e);
    } else if (event.objType == "Neume"){
      // FIXME: not robust to clef changes
      var e = event.nextNote(-1);
      if(e.objType == "ObliqueNeume"){
        e = e.members[0];
      }
      if(e) return pitchAndPos(e);
    }
  }
}

function pitchAndPos(event){
  if(event.pitch && !event.staffPos){
    event.staffPos = staffPosFromPitchString(event.pitch);
  }
  if(event.pitch){
    return [event.pitch, event.staffPos];
  } else {
    return [false, event.staffPos];
  }
}

// f. misc

function last(list){
  if(!list.length){
    return false;
  }
  return list[list.length-1];
}

// function mySVGBBox(svgEl, depth){
//   if(depth>20) return [0,0,0,0];
//   var kids = svgEl.getAttributeNS(SVGNS, "childNodes");
//   if(typeof(kids)=='undefined') kids = [];
//   var left = 1000;
//   var top = 1000;
//   var right = 0;
//   var bottom = 0;
//   var bbox;
//   var l, r, t, b;
//   alert(kids.length);
//   alert(svgEl.getAttributeNS(SVGNS, "childNodes"));
//   for(var i=0; i<kids.length; i++){
//     if(kids && kids[i].getAttributeNS(SVGNS, "childNodes").length){
//       bbox = mySVGBBox(kids[i], depth+1);
//       if(left>bbox[0]) left = bbox[0];
//       if(top>bbox[1]) top = bbox[1];
//       if(right<bbox[2]) right = bbox[2];
//       if(bottom<bbox[3]) bottom = bbox[3];
//     } else {
//       if(typeof(kids[i].getBBox)=="function"){
//         bbox = kids[i].getBBox();
//         r = bbox.x+bbox.width;
//         b = bbox.y+bbox.height;
//         if(left>bbox.x) left = bbox.x;
//         if(top>bbox.y) top = bbox.y;
//         if(right<r) right = r;
//         if(bottom<b) bottom = b;
//       }
//     }
//   }
//   return [left, top, right, bottom];
// }

////////////////////////////
//
// Annotation tracking
// 

function AnnotationSet(){
  this.domObj = false;
  this.object = false;
  this.AType = false;
  this.svgEl = false;
  this.tip = function(){
    var tip = Tooltip(false);
    var t1 = this.object.tip(tip);
    var s1 = t1.getBBox();
    var s2 = t1.getBoundingClientRect();
    if(s2.width) {
      tip.style.width = Math.max(s2.width + 10, 80)+"px";// + t1.getBBox().x;
      t1.style.width = Math.max(s2.width + 10, 80)+"px";
    }
    if(s2.height) {
      tip.style.height = Math.max(80, s2.height + 10)+"px";// + t1.getBBox().y +15;
      t1.style.height = Math.max(80, s2.height)+"px";//s2.height+10;
    }
    tip.style.position = "fixed";
    tip.style.top = this.object.startY+15+$(this.svgEl).offset().top+"px";
    tip.style.left = this.object.startX+15+$(this.svgEl).offset().left+"px";
  };
}

var Annotations = [];
function resetAnnotations(){
  Annotations = [];
}

function addAnnotation(domObject, object, type){
  var annotation = new AnnotationSet();
  annotation.AType = type;
  annotation.domObj = domObject;
  annotation.object = object;
  annotation.svgEl = SVG;
  annotation.domObj.setAttributeNS(null, "onmouseover", "top.Annotations["+Annotations.length+"].tip();");
  annotation.domObj.setAttributeNS(null, "onmouseout", "top.removeTooltip();");
  Annotations.push(annotation);
  return Annotations.length -1;
}

function mergeKeys(list1, list2){
  // Takes the cartesian join of two lists of keys;
  var list3 = [];
  for(var i1 in list1) {
    for (i2 in linst2) {
      list3.push(typeof(list1[i1])=="array" 
                 ? list1[i1].concat(list2[i2])
                 : [list1[i1], list2[i2]]);
    }
  }
  return list3;
}

function pitchOrHeightShift(object, d){
  // return function for changing pitch of [object] by [d] steps
  var t = object;
  return function (e){
    if(typeof(t.pitch) != "undefined" && t.pitch){
      t.pitch = notes[notes.indexOf(t.pitch)+d];
      t.staffPos = staffPosFromPitchString(t.pitch);
    } else {
      t.staffPos += d;
    }
    var code = document.getElementById("code");
    var scroll = $(code).scrollTop();
    code.value = doc.toText();
    $(code).scrollTo(scroll);
    t.example.draw(t.example.SVG, true);
    $(".updown").remove();
  };
}

function editObject (object){
  return function(e){
    object.edit(e);
  };
}
function shiftHoverToShift (object, d){
  if(typeof(d)=="undefined" || !d) d=1;
  var t = object;
  return function (e){
    if(e.shiftKey){
      UpDown(t, d, e);
    }
  };
}
function hoverOutShiftChecked (){
  return function(e){
    if(e.shiftKey){
      $(document).keyup(function(e){
          if(!e.shiftKey) {
            $(".updown").remove();
            $(document).unbind(e);
          }
      });
    } else {
      $(".updown").remove();
    }
  };
}

function UpDown(object, d, event){
  // Provide height shifting buttons for [object] near mouse pointer
  $(".updown").remove();
  var buttonarea = DOMDiv("updownbg updown buttoncircle", false, false);
  var uparrow = DOMDiv("updown up miscbutton", "uparrow", DOMSpan(false, false, "↑"));
  var downarrow = DOMDiv("updown down miscbutton", "downarrow", DOMSpan(false, false, "↓"));
  document.getElementById("rendered").appendChild(buttonarea);
  buttonarea.appendChild(uparrow);
  buttonarea.appendChild(downarrow);
  // document.body.appendChild(uparrow);
  // document.body.appendChild(downarrow);
  var l = $(object.domObj).offset().left;
  var t = $(object.domObj).offset().top;
  var ow = object.domObj.getBBox().width;
  var oh = object.domObj.getBBox().height;
  var w = $(buttonarea).width();
  var h = $(buttonarea).height();
//  alert([l, t, ow, oh]);
  // centre circle on item's centre;
  buttonarea.style.left = l+(ow/2)-(w/2);
  buttonarea.style.top = t+(oh/2)-(h/2);
  // uparrow.style.top = Math.max(event.pageY-10, 0);
  // downarrow.style.top = Math.min(event.pageY+10, window.innerHeight);
  // uparrow.style.left = event.pageX+2;
  // downarrow.style.left = event.pageX+2;
  $(uparrow).click(pitchOrHeightShift(object, d));
  $(downarrow).click(pitchOrHeightShift(object, -d));
}

function domClickfun(domObject, clickfun, shiftfun, altfun, ctrlfun){
  return function(e){
    if(e.shiftKey && shiftfun) {
      shiftfun.call(domObject, e);
    } else if (e.altKey && altfun) {
      altfun.call(domObject, e);
    } else if (e.ctrlKey && ctrlfun) {
      ctrlfun.call(domObject, e);
    } else {
      clickfun.call(domObject, e);
    }
  };
}

function nodeFromDomObj(DO){
  // DO is probably a text node, so no ID
  if(DO.nodeType == 3){
    DO = DO.parentNode;
  }
  if(DO.id.substring(0,4)!="node"){
    return nodeFromDomObj(DO);
  }
  return nodes[Number(DO.id.substring(5))];
}

function nodeInsertAt(newnode, domObj, offset, node){
  for(var i=0; i<node.content.length; i++){
    if(typeof(node[i])=="string" && node[i]==domObj.nodeValue){
      node.content.splice(i, 1, node.content[i].substring(0, offset), 
        newnode, node.content[i].substring(offset));
      return;
    }
  }
}

function addSpanTags(opentag, closetag){
  var range = window.getSelection().getRangeAt(0);
  if(range.collapsed){
    return;
  }
  var startNode = nodeFromDomObj(range.startContainer);
  var endNode = nodeFromDomObj(range.endContainer);
  // FIXME: should keep track of text elements (always put in spans?)
  nodeInsertAt(opentag, range.startContainer, range.startOffset, startNode);
  nodeInsertAt(closetag, range.endContainer, range.endOffset, endNode);
}

function toSpan(type){
  // FIXME: This is disastrous, unless we enforce single hierarchy, which
  // is probably wrong. To fix this problem, we need a different
  // structure to the text-classes (modelled on the music classes,
  // where all tags are just start and end tags, and states are
  // tracked so that they can be closed and re-opened for legal HTML
  // and XML...
//  var range = window.getSelection().getRangeAt(0);
  if(range.collapsed){
    return;
  }
  var startPara = $(range.startContainer).parents("p")[0];
  var endPara = $(range.endContainer).parents("p")[0];
  var startNo = Number(startPara.parentNode.id.substring(5));
  var endNo = Number(endPara.parentNode.id.substring(5));
  var startNode = nodes[startNo];
  var endNode = nodes[endNo];
  // var st = range.startContainer;
  // alert([st.data, st.parentNode, $(st).index()]);
  // $(st.parentNode).contents().each(function(i, e){if(e==st) alert(e.data);});
  var startIndices = getIndices(range.startContainer);
  var endIndices = getIndices(range.endContainer);
  if(startNo || startNo == 0) {
    for(var i=startNo; i<=endNo; i++){
      if(i !=startNo && i != endNo){
        var newNode = new Span;
        newNode.type = type;
        newNode.content = nodes[i].content;
        nodes[i].content = newNode;
      } else {
        spliceIn(nodes[i], range, type, i==startNo ? startIndices : false,
          i==endNo ? endIndices : false);
      }
    }
  }
}

function nodeIndex(node, DOMIndex){
  // Different numbers of objects in DOM and treatisedoc mean that an
  // adjustment must be made for conversion
  for(var i=0; i<node.content.length; i++){
    if(node.content[i].objType!="Column/Page"){
      if(DOMIndex == 0) {
        return i;
      }
      DOMIndex -= 1;
    }
  }
  alert([node, DOMIndex, "Not in paragraph"]);
  return false;
}

function spliceIn(node, range, type, starts, ends){
  // FIXME: urgh! Messy, messy, messy!
  var newNode = new Span;
  var sIndex = starts ? nodeIndex(node, starts[0]) : false;
  var eIndex = ends ? nodeIndex(node, ends[0]) : false;
  var sNode = starts ? node.content[sIndex] :  false;
  var eNode = ends ? node.content[eIndex] :  false;
  newNode.type = type;
  if(node.objType=="Span"){
    if(node.type == type) {
      return; // Nothing to do
    }
  }
  if(node.objType == "Column/Page"){
    return;
  }
  if(starts && starts.length && ends && ends.length){
    var content = node.content.slice(0, sIndex);
    var content2 = eIndex+1<node.content.length ? node.content.slice(eIndex+1) : false;
    if(sNode.objType == "text") {
      content.push(new Text(sNode.content.substring(0, range.startOffset)));
      if(sIndex == eIndex){
        newNode.content.push(new Text(sNode.content.substring(range.startOffset, range.endOffset)));
        content.push(newNode);
        content.push(new Text(sNode.content.substring(range.endOffset)));
        if(content2) content = content.concat(content2);
      } else {
        newNode.content.push(new Text(sNode.content.substring(range.startOffset)));
        newNode.content = newNode.content.concat(node.content.slice(sIndex+1, eIndex));
        content.push(newNode);
        if(eNode.objType == "text"){
          if(range.endOffset > 0) 
            newNode.content.push(new Text(eNode.content.substring(0, range.endOffset)));
          if(range.endOffset < eNode.content.length)
            content.push(new Text(eNode.content.substring(range.endOffset)));
          content = content.concat(content2);
        } else {
          content.push(newNode);
          content.push(eNode);
          content = content.concat(content2);
          spliceIn(node.content[eIndex, range, type, false, ends.slice(1)]);
        }
      }
    } else {
      if(range.startOffset) content.push(new Text(sNode.content.substring(0, range.startOffset)));
      if(sIndex == eIndex){
        // We don't need to do anything at this level
        content = node.content;
        spliceIn(sNode, range, type, starts.slice(1), ends.slice(1));
      } else {
        spliceIn(sNode, range, type, starts.slice(1), false);
        newNode.content = newNode.content.concat(node.content.slice(sIndex, eIndex));
        content.push(newNode);
        if(eNode.objType == "text"){
          if(range.endOffset > 0) 
            newNode.content.push(new Text(eNode.content.substring(0, range.endOffset)));
          if(range.endOffset < eNode.content.length)
            content.push(new Text(eNode.content.substring(range.endOffset)));
          content = content.concat(content2);
        } else {
          content.push(newNode);
          content.push(eNode);
          content = content.concat(content2);
          spliceIn(node.content[eIndex, range, type, false, ends.slice(1)]);
        }
      }
    }
    node.content = content;
  } else if (starts && starts.length){
    var content = node.content.slice(0, sIndex);
    if(sNode.objType == "text"){
      content.push(new Text(sNode.content.substring(0, range.startOffset)));
      content.push(newNode);
      newNode.content.push(new Text(sNode.content.substring(range.startOffset)));
      if(sIndex < node.content.length - 1)
        newNode.content = newNode.content.concat(node.content.slice(sIndex+1));
    } else {
      content.push(sNode);
      if(sIndex+1<node.content.length) newNode.content = node.content.slice(sIndex+1);
      content.push(newNode);
      spliceIn(sNode, range, type, starts.slice(1), ends);
    }
    node.content = content;
  } else if (ends && ends.length) {
    newNode.content = node.content.slice(0, eIndex);
    var content = [];
    content.push(newNode);
    if(eNode.objType == "text"){
      // we've hit the bottom
      newNode.content.push(new Text(eNode.content.substring(0, range.endOffset)));
      content.push(new Text(eNode.content.substring(range.endOffset)));
      if(eIndex < node.content.length -1) content = content.concat(node.content.slice(eIndex+1));
    } else {
      content = content.concat(node.content.slice(eIndex));
      spliceIn(eNode, range, type, starts, ends.slice(1));
    }
    node.content = content;
  } else {
    //??
    newNode.content = node.content;
    node.content = newNode;
  }
}

function getIndices(container) {
  var indices = [];
  var index = false;
  // indices.push($(container).index());
  // container = container.parentNode;
  while(container.tagName!="P"){
    index = $.makeArray($(container.parentNode).contents()).indexOf(container);
    indices.push(index);
    container = container.parentNode;
  }
  indices.reverse();
  return indices;
}

function endTagPos(tag){
  var tagDepth = 1;
  var from = tag.length+2;
  var locClose = string.indexOf("</"+tag+">", from);
  var locOpen = string.indexOf("<"+tag+">", from);
  if(locOpen == -1) return locClose; // Simple -- no open tags left
  if(locClose == -1) return string.length; // Simple -- no open tags left
  while(locOpen > -1){
    if(locOpen < locClose){
      from = locOpen + tag.length+2;
      tagDepth++;
    } else {
      from = locClose + tag.length+3;
      tagDepth--;
    }
    if(tagDepth==0){
      return locClose;
    }
    locClose = string.indexOf("</"+tag+">", from);
    locOpen = string.indexOf("<"+tag+">", from);
    if(locClose == -1) {
      alert(string);
      return string.length;
    }
  }
  alert(string);
  return string.length;
}

function valueText(value){
  if(typeof(value)=="string" || typeof(value)=="number"){
    return value;
  } else if(typeof(value.objType)!="undefined" && value.objType == "ValueChoice"){
    return value.toText();
  } else {
    alert(value);
    return value;
  }
};

// For now, not mens...
var infos = ["SolmizationSignature", "Clef", "Staff"];
function infop(object){
  if(typeof(object.objType) != "undefined" && infos.indexOf(object.objType)>-1){
    return true;
  } else if(typeof(object.objType) != "undefined" && object.objType == "MusicalChoice"){
    return object.infop();
  }
  return false;
}
function clefp(object, variant){
  return typeof(object.objType)!="undefined" 
    && (object.objType == "Clef" 
        || (object.objType == "MusicalChoice" && object.clefp(variant)));
}
function solmp(object, variant){
  return typeof(object.objType)!="undefined" 
    && (object.objType == "SolmizationSignature" 
        || (object.objType == "MusicalChoice" && object.solmp(variant)));
}
function findClef(extras){
  for(var i=0; i<extras.length; i++){
    if(clefp(extras[i])) return extras[i];
  }
  return false;
}
function findSolm(extras){
  for(var i=0; i<extras.length; i++){
    if(solmp(extras[i])) return extras[i];
  }
  return false;
}

function oblElementStaffPos(el){
  return el.objType == "Note"|| el.objType == "LigatureNote"? el.staffPos :
    el.content[0].content[0].staffPos;
}
function oblElementRhythm(el){
  return el.objType == "Note" || el.objType == "LigatureNote"? el.rhythm :
    el.content[0].content[0].rhythm;
}

function mainElementType(el){
  return el.objType == "MChoice" ? el.content[0].content[0].objType : el.objType;
}

function mainObj(el){
  return el.objType == "MChoice" ? el.content[0].content : el;
}
function ligItemSequence(Ligature, path){
  var items = Ligature.members;
  var is = [];
  for(var i=0; i<items.length; i++){
    switch(items[i].objType){
      case "TextUnderlay":
      case "Comment":
    }
  }
}
function ligatureForDrawing(){
  // Overhang if an early sup ligature item
  this.overhang = 0;
  this.items = [];
  this.events = [];
  this.objSeq = [];
  this.eventCount = 0;
  this.prevPos = false;
  this.prevSemi = false;
  this.noExtraOverhang = false;
  this.firstMaxima = false;
  this.checkOverhang = function(item){
    if (item.objType == "Note"){
      if(!this.noExtraOverhang && item.rhythm == "M" && this.eventCount<2){
        // We may have an overhang before the ligature because of a
        // left-facing .sup. This can only happen with a maxima .sup
        // with no preceding maxima
        if(this.eventCount == 0){
          this.noExtraOverhang = true;
        } else {
          if(item.sup){
            this.overhang = this.eventCount == 1 ? 3/2*rastralSize : rastralSize;
          }
          this.noExtraOverhang = true;
        } 
      }
    }
  };
  this.addItem = function(item){
    this.items.push(item);
    if(item.objType == "TextUnderlay" || item.objType == "Comment"){
      this.objSeq.push({objType: item.objType, ligItem: item, draw: item.draw});
    } else if(item.objType == "Oblique"){
      this.eventCount+=1;
      this.event.push(item);
      this.objSeq.push({objType: item.objType, ligItem: item, draw: item.draw, 
        prevPos: this.prevPos, prevSemi: this.prevSemi});
      this.prevSemi = false;
      this.prevPos = item.lastPos();
    } else if (item.objType == "Note"){
      this.checkOverhang(item);
      this.eventCount+=1;
      var newobj = {objType: "Note", ligItem: item, draw: item.draw,
        prevPos: this.prevPos, prevSemi: this.prevSemi, sup: item.sup, 
        prev: this.eventCount>1 ? this.events[this.eventCount-2] : false,
        rhythm: item.rhythm};
      var lstem = false;
      var rstem = false;

      this.events.push(item);
      this.prevSemi = item.rhythm =="S" && !this.prevSemi;
      this.prevPos = item.staffPos;
    }
  };
}
// function list: leftOverhang, ligPrevPos, prevsemi, ligitem, objtype, ligSup,
// prevligitem, lignote, prevpos, ligRhythm, ligLstem, ligRstem
function ligatureDrawingKit(ligarray){
  curx += leftOverhang(ligarray);
  var svgobj = false;
  var prevx = false;
  var item;
  for (var i=0; i<ligarray.length; i++){
    item = ligarray[i];
    switch(objType(item)){
      case "TextUnderlay":
      case "Comment":
        var oldx = curx;
        curx = prevx;
        item.draw();
        curx = oldx;        
        break;
      case "Oblique":
        ligItem(item).draw(ligPrevPos(item), prevsemi(item));
        break;
      case "Note":
        ligItem(item).startX = ligSup(item) ? curx : prevLigItem(i, ligarray).startX;
        prevx = curx;
        svgobj = drawBox(ligNote(item), ligPrevPos(item), ligRhythm(item), 
          ligLstem(item), ligRstem(item), ligSup(item));
        if(svgobj && choice(item)){
          // FIXME
          $(svgobj).addClass("choice");
        }
        break;
    }
  }
}

function listeq(l1, l2){
  // returns true if every item in l1 is == every item in l2
  return l1.every(function(el, i, a){return el==l2[i];});
}

function infoButton(abbr, fields, parent, on, togglevar){
  var div = DOMDiv('infoshowhide '+abbr, false, abbr);
  parent.appendChild(div);
  if(on) $(div).addClass("showing");
  $(div).data("fields", fields);
  $(div).data("togglevar", togglevar);
  div.onclick = function(){infoToggle(this);};
  return div;
}

function infoToggle(div){
  var fields = $(div).data("fields");
  var togglevar = $(div).data("togglevar");
  togglevar = togglevar=="show" ? "hide" : "show";
  $(div).toggleClass("showing");
  var show = $(div).hasClass("showing");
  for(var i=0; i<fields.length; i++){
    if(show) {
      $(".info."+fields[i]).show();
    } else {
      $(".info."+fields[i]).hide();
    }
  }
}
