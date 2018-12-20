// First file to load. Contains:
//  1. Dictionaries for finding glyphs
//  2. Global variables
//  3. Utility functions

/////////////////////
// `Dictionaries' -- These are where symbol codes are converted to
// characters from RW's fonts, y offsets and width guidance.
// 
// For notes, mostly
showagain=false;
var prop=0.7;
var noteEn = 1.8 * prop;
var ya = 50.5;
//var ya = 63;
var yb = 6;
var rhythms = {M: "maxima", L: "longa", B: "brevis",
               S: "semibrevis", m: "minima", s: "semiminima",
               f: "fusa"};
var neumeForms = {p: "punctus", v: "virga"};
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
   full: {M: ["a", ya, 2.8],
          L: ["s", ya, noteEn], 
          B: ["d", yb, noteEn],
          S: ["f", yb, noteEn],
          m: ["g", yb, noteEn],
          s: ["h", yb, noteEn],
          f: ["k", yb, noteEn],
          c: ["~", yb, noteEn]},
   lhalf: {M: ["å", ya, 2.8],
          L: ["ß", ya, noteEn], 
          B: ["∂", yb, noteEn],
          S: ["f", yb, noteEn],
          m: ["g", yb, noteEn],
          s: ["h", yb, noteEn],
          f: ["k", yb, noteEn],
          c: ["~", yb, noteEn]},
   rhalf: {M: ["a", ya, 2.8],
          L: ["s", ya, noteEn], 
          B: ["d", yb, noteEn],
          S: ["f", yb, noteEn],
          m: ["g", yb, noteEn],
          s: ["h", yb, noteEn],
          f: ["k", yb, noteEn],
          c: ["~", yb, noteEn]},
   square: {c: ["~", yb, 2.5]},
   hufnagel: {c: ["~", yb, 2.5]}};
// For completely void/black note shapes //FIXME: what?
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
   lhalf: {M: ["å", ya, 2.8],
          L: ["ß", ya, noteEn], 
          B: ["∂", yb, noteEn],
          S: ["f", yb, noteEn],
          m: ["g", yb, noteEn],
          s: ["h", yb, noteEn],
          f: ["k", yb, noteEn],
          c: ["~", yb, noteEn]},
   rhalf: {M: ["a", ya, 2.8],
          L: ["s", ya, noteEn], 
          B: ["d", yb, noteEn],
          S: ["f", yb, noteEn],
          m: ["g", yb, noteEn],
          s: ["h", yb, noteEn],
          f: ["k", yb, noteEn],
   square: {c: ["~", yb, 2.5]},
   hufnagel: {c: ["~", yb, 2.5]}}};
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
           f: ["J", ya, noteEn]},
   lhalf: {M: ["Å", ya, 2.8],
          L: ["Í", ya, noteEn], 
          B: ["Î", yb, noteEn],
          S: ["Ï", yb, noteEn],
          m: ["g", yb, noteEn],
          s: ["h", yb, noteEn],
          f: ["k", yb, noteEn],
          c: ["~", yb, noteEn]},
   rhalf: {M: ["A", ya, 2.8],
          L: ["S", ya, noteEn], 
          B: ["D", yb, noteEn],
          S: ["F", yb, noteEn],
          m: ["g", yb, noteEn],
          s: ["h", yb, noteEn],
          f: ["k", yb, noteEn]}};
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
           f: ["Ô", ya, noteEn]},
   lhalf: {M: ["Å", ya, 2.8],
          L: ["Í", ya, noteEn], 
          B: ["Î", yb, noteEn],
          S: ["Ï", yb, noteEn],
          m: ["g", yb, noteEn],
          s: ["h", yb, noteEn],
          f: ["k", yb, noteEn],
          c: ["~", yb, noteEn]},
   rhalf: {M: ["A", ya, 2.8],
          L: ["S", ya, noteEn], 
          B: ["D", yb, noteEn],
          S: ["F", yb, noteEn],
          m: ["g", yb, noteEn],
          s: ["h", yb, noteEn],
          f: ["k", yb, noteEn]}};

var restDictionary = 
  {B: ["∂", yb, 1.3],
   S: ["ƒ", yb, 1.3],
   m: ["©", yb, 1.3],
   s: ["˙", yb, 1.3],
   f: ["˚", yb, 1.5]};
var clefDictionary = 
  {
    C: [":", 28.5, 1.3],
    F: ["L", 43.5, 3],
    G: ["Ý", 28.5, 2.5]
  };
var mensDictionary = 
   {
     O: ["o", 10, 2, false],
     C: ["c", 10, 2, false],
     Ø: ["ø", 10, 2, false],
     Ç: ["ç", 10, 2, false],
     c: ["C", 10, 2, false],
     ø: ["O", 10, 2, false]
   };
// var mensDictionary = 
//   {
//     O: ["X", 35, 2.75, false],
//     C: ["C", 35, 2.75, false],
//     // Ø: ["X", 35, 2.75, "<"],
//     // Ç: ["C", 35, 2.75, "<"],
//     Ø: ["X", 35, 2.75, "\u003c"],
//     Ç: ["C", 35, 2.75, "\u003c"],
//     c: ["C", 35, 2.75, "?"],
//     ø: ["X", 35, 2.75, "/"]
//   };
var solmDictionary = 
  {
    b: ["b",4, 2.5*prop],
    h: ["µ",4, 2.5*prop],
    x: ["M",4, 2.5*prop]
  };
var dotData = [">", 36, 1*prop];
var fermataData = ["Z", 36, prop];
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
var texts = {};
var allTexts = {};
//var editable = true;
var editable = false;
var nocache = false;
var titleBar = false;
var showtitle = true;
var margins = false;
var safari = /Safari/.test(navigator.userAgent);
var webkit = /WebKit/.test(navigator.userAgent);
var vertical;
var leading = 20;
var debug=false;
// var topMargin = 40;
//var topMargin = 25;
var topMargin = 0;
//var lmargin = 10;
var lmargin = 3;
//var rastralSize = 15;
//var rastralSize = 12;
var rastralSize = 10;
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
var editorMode=false;
var singlePaneMode = true;
var showvariants = true;
var showfacsimile = false;
var showcommentary = true;
var showtranslationnotes = true;
var showtranscriptionnotes = true;
var punctuationStyle="modern";
var editorDisplay = "show";
var dateDisplay = "show";
var copyTextDisplay = "show";
var sourceDisplay = "show";
var extraInfoDisplay = "show";
var infoDisplay = "hide";
var infoButtons = false;
var exampleSource = false;
var docMap = false;

// Current variable values (for context)
//var tooltip = false;
var timeouts = [];
var scrollLock = false;
var paneWidths = false;
var maxWidth = 650;
var minWidth = 350;
var sources = [];
var commentary = false;
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
var prevBook = 0;
var section = 0;
var paragraph = 0;
var sentence = 0;
var exampleno = 0;
var string;
var hackedString;
var SVG = false;
var canvas = false;
var context = false;
var currentExample = false;
var currentReading = false;
var curDoc = false;
var curCatchword = false;
var currentTextParent = false;
var inHeading = false;
var inTip = false;
var inVerse = false;
var inIndex = false;
var inCommentary = false;
var noCount = false;
var hang = false;
var lastIsSentenceBreak = false;
var lastIsHeading = false;
var lastIsVerse = false;
var oneOff=false;
var handsmet = [];
var examplei = false;
var eventi = false;
var texti = false;
var curx = 0;
var cury = 20;
var noBreaks = false;
var systemLines = false;
var staffGroup = false;
var currentLinecount = 5;
var currentStaffColour = "";
var currentSystem = false;
var currentSystems = [];
var currentInfo = false;
var currentChoice = false;
var suppressBreak = true;
//var wrapWidth = 460;
var wrapWidth = false;
var currentClef = false;
var currentRedline = false;
var currentSolm = false;
var uncapitalise = false;
var capitalise = false;
var allowCapitalisation = false;
var initialStaffStar = false;
var drawingWidth;
var currentType = "mensural";
var currentSubType = "void";
var dotPos = false;
var dotNudge = true;
var redline = false;
var examples = [];
var commentaryTables = [];
var k1 = Math.cos(Math.PI/3) ;//0.866;
var k2 = Math.sin(Math.PI/3);//0.5;
var textScale = 0.8;
// var textScale = 0.6;
var commentStyle = "#00F";
var comments = false;
var hands = [];
var range = false;
var desperatecounter = 0;
var underlays = [];
var currenttextparent = false;
var currentTable = false;
var curtextitem = false;
var pari = false;
var systemContainsPageOrColumnBreak = false;
var lowPoint = false;
//offset for editorial square bracket character
var braceOff = 7.5;
function musicStyle(){
  return "font-size : "+(3*rastralSize*prop)+"pt";
}
function mensStyle(){
  return "font-size : "+(1.6*rastralSize*prop)+"pt";
}
function restStyle(){
  return "font-size: "+(3 * rastralSize) +"pt";
}
function braceStyle(){
  return "font-size: "+(2*rastralSize*prop)+"pt";
}
function etcStyle(){
  return "font-size: "+(0.7*rastralSize) +"pt";
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
    vThickness: rastralSize / 6 * prop,
    hThickness: rastralSize / 3.5 * prop,
    stemLength: rastralSize * 3.3 * prop,
    // hOffset:    rastralSize / 3 * prop,
    hOffset:    rastralSize / 2.5 * prop,
    oblOffset: rastralSize / 3 * prop,
    chantThickness: rastralSize /2,
    chantPenA: rastralSize / 7,
    chantPenB: rastralSize / 4,
    widthUnit: rastralSize * prop
    // chantPenA: rastralSize / 3,
    // chantPenB: rastralSize / 10
  };
}

function zerofunction (){
  return 0;
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
function staffPosition(obj){
  if(obj.pitch){
    return staffPosFromPitchString(obj.pitch);
  } else if(obj.staffPos || obj.staffPos===0){
    return obj.staffPos;
  } else {
    return false;
  }
}
function yPos(y, staffPos){
  if(staffPos || staffPos===0){
    return y-((rastralSize*(staffPos-2))/2);
  } else {
    console.log(["Position error", pitch, examplei]);
    return y;
  }
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
  if(currentClef){
    return notes.indexOf(pitchString)-6 + currentClef.pitchOffset();
  } else {
    return false;
  }
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
  if("ABCDEF".indexOf(string.charAt(0))>-1) return getStaffPos2();
  var pos = consumeIf(/[0-9]+/);
  return pos ? Number(pos) : false;
}

function getStaffPos2(){
  var pos = "0123456789ABCDEFGHIJ".indexOf(string.charAt(0));
  if(pos != -1){
    string = string.substring(1);
    return pos;
  } else {
    return false;
  }
}

function staffPosFromString(tempstring){
  var val = /^[0-9]+/.exec(tempstring);
  if(val){
    return [Number(val[0]), val[0].length];
  } else if("ABCDEF".indexOf(tempstring.charAt(0))>-1){
    return ["ABCDEF".indexOf(tempstring.charAt(0))+10, 1];
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

function consumeStyleTags(){
  // Some tags are too fundamental to parse explicitly in the main
  // parser. These should be dealt with in the consume function. I
  // think.
  var oneoff=false;
  var end = false;
  var found = false;
  if(!currentExample) return;
  if(string.charAt(0)=="<" && (string.indexOf(">")!==-1)){
    oneoff = false;
    end = string.indexOf(">");
  } else if(string.charAt(0)=="{" && (string.indexOf("}")!==-1)){
    oneoff = true;
    end = string.indexOf("}");
  } else {
    return;
  }
  switch(string.substring(1, end)){
    case "red":
      found = new RedOpen();
      found.oneOff = oneoff;
      break;
    case "/red":
      found = new RedClose();
      break;
    case "blue":
      found = new BlueOpen();
      found.oneOff = oneoff;
      break;
    case "/blue":
      found = new BlueClose();
      break;
    case "strikethrough":
      found = new StrikethroughOpen();
      found.oneOff = oneoff;
      break;
    case "/strikethrough":        
      found = new StrikethroughClose();
      break;
    case "redline":
      found = new RedlineOpen();
      found.oneOff = oneoff;
      break;
    case "/redline":        
      found = new RedlineClose();
      break;
    case "void":
      found = new VoidOpen();
      found.oneOff = oneoff;
      break;
    case "/void":
      found = new VoidClose();
      break;
    case "full":
      found = new FullOpen();
      found.oneOff = oneoff;
      break;
    case "/full":
      found = new FullClose();
      break;
    case "1halffull":
      found = new HalfFullOpen();
      found.oneOff = oneoff;
      found.side = 1;
      break;
    case "/1halffull":
      found = new HalfFullClose();
      break;
    case "2halffull":
      found = new HalfFullOpen();
      found.oneOff = oneoff;
      break;
    case "/2halffull":
      found = new HalfFullClose();
      break;
    default:
      if(string.substring(1, 3)==="ll"){
        found = new LedgerLineChange();
        if(string.charAt(3)==":"){
          found.readComponents(string);
        }
        found.oneOff = oneoff;
      } else if (string.substring(1, 4)==="/ll"){
        found = new LedgerLineChange();
        found.count = 0;
        found.oneOff = true;
      } 
  }
  if(found) {
    currentExample.classes.addClass(found);
    string = string.substring(end+1);
    pointer += end;
  }
  return;
}

function clearOneOffTags(){
  if(currentExample) currentExample.classes.removeOneOffClasses();
}

function consume(n){
  if(string.length < n){
    pointer += string.length;
    string = "";
  } else {
    string = string.substring(n);
    pointer += n;
  }
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

function consumeSpace(spacesOnly){
  // Remove space from string global variable. Return true if space is
  // removed
  var p = pointer;
  clearOneOffTags();
  consumeSpace2(spacesOnly);
  // return
  var slen = 0;
  while(string.length !==slen){
    slen = string.length;
    consumeStyleTags();
    consumeSpace2(spacesOnly);
  }
  return p===pointer ? false : true;
}

function consumeSpace2(spacesOnly){
  var regex = (spacesOnly ? /[^ ]/ : /\S/);
  var nextNonSpace = string.search(regex);
  if(nextNonSpace == -1){
    pointer += string.length;
    string = "";
  } else {
    pointer += nextNonSpace;
    // string = string.substring(string.search(regex));
    string = string.substring(nextNonSpace);
  }
}

function unRead(value){
  // We've pulled too much off of the string and it and the pointer
  // need to be reset
  string = value + string;
  pointer -= value.length;
}

function setDotPos(staffPos, down, nudge){
  dotNudge = nudge ? true : false;
  if(down){
    dotPos = (2 * Math.floor(staffPos/2)) - 1;
  }  else {
    dotPos = (2 * Math.floor(staffPos/2)) + 1;
  }
}

// b. Generic drawing

// b. i) lines

function drawSystem(linecount, y, x1, x2, colour, lcanvas){
  y+=0.5;
  if(colour==="0") colour = "No";
  for(var i=0; i<linecount; i++){
    svgLine(SVG, x1, y, x2, y, colour+"SVGLine", false);
    y += rastralSize;
  }
  return group;
}

function drawSystemLines(sysgroup, linecount, y, x1, x2, colour){
   // y+=0.5;
  if(colour==="0") colour = "No";
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

function drawPartialBarline(x, y, start, end, extras){
  svgLine(SVG, x, y-yoffset(start), x, y-yoffset(end), 
    "barline"+(extras ? extras : ""), false);
}

function drawBarline(x, y, extras){
  svgLine(SVG, x+0.5, y-rastralSize, x+0.5, y-(rastralSize * currentLinecount), 
    "barline"+(extras ? extras : ""), false);
}

function drawSmallBarline(start, end, thickness, extras){
  var starty = cury - yoffset(start);
  var endy = cury - yoffset(end);
  svgLine(SVG, curx+0.5, starty, curx+0.5, endy, "barline"+(extras ? extras : ""), false);
}

function drawLedgerLine(x, y, x2, extraClasses) {
  // FIXME: line end is wrong
  if(!extraClasses) extraClasses = "";
  if(x2){
    return svgLine(SVG, x, y, x2, y, "ledgerline"+extraClasses, false);
  } else{
    return svgLine(SVG, x, y, x+rastralSize, y, "ledgerline"+extraClasses, false);
  }
}

function squareBracket(x, y, open, extraClasses){
  return svgText(SVG, x, y+(rastralSize/15/prop), "editorial bracket"+extraClasses, 
                 false, braceStyle(), open ? "[" : "]");
}

// b. ii) Ligature components (boxes)

function drawBox(note, staffPos, width, lStem, rStem, sup, full, extras){
  var m = metrics();
  var group = svgGroup(SVG, "ligatureBox"+(editable ? " clickable" : "")
                       +(extras ? extras : ""), false);
  var pos = staffPosition(note);
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
  // Two lines if void, box if full
  if(full){
    // svgRect(group, curx, cury-poffset-m.hOffset, 
    //   width, 2*m.hOffset, "ligatureSquare", false);
    svgRect(group, curx, cury-poffset-(m.halfHeight-m.chantPenA),
      width, 2*(m.halfHeight-m.chantPenA), "ligatureSquare", false);
  } else {
    svgLine(group, curx, cury - poffset+m.hOffset, curx+width, cury-poffset+m.hOffset,
      "ligatureHorizontal", false);
    svgLine(group, curx, cury - poffset-m.hOffset, curx+width, cury-poffset-m.hOffset,
      "ligatureHorizontal", false);
  }
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

function drawObliqueStart(sp1, sp2, full, extras){
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
  var path;
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
  if(full) {
    // Filled oblique is just points 4-7 here
    path = svgPath(SVG,
             svgPolyPath([x1a, y1a+DV+ThV, x1, y1+DV+ThV-ThD,
                   x1, y1-DV-ThV-ThD, x1a, y1a-DV-ThV], true),
             "ligatureOblique start"+(extras ? extras : ""), false);
  } else {
    path = svgPath(SVG,
      svgPolyPath([x1+ThH, y1-DV, x1+ThH, y1+DV, 
                   x1a, y1a+DV, x1a, y1a+DV+ThV, x1, y1+DV+ThV-ThD,
                   x1, y1-DV-ThV-ThD, x1a, y1a-DV-ThV, x1a, y1a-DV], true), 
      "ligatureOblique start"+(extras ? extras : ""), false);
  }
  return path;
}

function drawObliqueEnd(sp2, sp1, full, extras){
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
  var path;
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
   if(full) {
    // Filled oblique is just points 1 & 6-8 here
    path = svgPath(SVG,
                svgPolyPath([x1a, y1a-DV-ThV,
                  x1a, y1a+DV+ThV, x2, y2+DV+ThV+ThD, x2, y2-DV-ThV+ThD], true),
                "ligatureOblique end"+(extras ? extras :""), false);
   } else {
     path = svgPath(SVG,
                  svgPolyPath([x1a, y1a-DV-ThV, x1a, y1a-DV,
                      x2-ThH, y2-DV, x2-ThH, y2+DV, x1a, y1a+DV,
                      x1a, y1a+DV+ThV, x2, y2+DV+ThV+ThD, x2, y2-DV-ThV+ThD], true),
                  "ligatureOblique end"+(extras ? extras :""), false);
   }
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

function drawOblique (sp1, sp2, staffPos, width, lStem, rStem, extras){
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
            "ligatureVertical"+(extras ? extras : ""), false);
  }
  if(staffPos && Math.abs(staffPos-sp1)>1){
    var joinTop = Math.max(yoffset(staffPos), yoffset(sp1)) + offset;
    var joinBottom = Math.min(yoffset(staffPos), yoffset(sp1)) - offset;
    svgLine(SVG, curx, cury-joinBottom, curx, cury-joinTop, "ligatureVertical", false);
  }
  curx += width- m.vThickness;
}

function drawRhombus(x, y, colour, ltail, rtail, extras){
  var m = metrics();
  var a = m.chantPenA;
  var b = m.chantPenB;
  var group = svgGroup(SVG, "rhombus", false);
  var classExtra = " ";
  if(colour){
    classExtra = colour;
  }
  if(ltail){
    svgLine(group, x-k1*a-k2*b-1, y+k2*a-k1*b, x-k1*a-k2*b-1, y+k2*a-k1*b+rastralSize,
            "rhombusTail" + classExtra+(extras ? extras : ""), false);
  }
  if(rtail){
    svgLine(group, x+k1*a+k2*b+1, y-k2*a+k1*b, x+k1*a+k2*b+1, y-k2*a+k1*b+rastralSize, 
            "rhombusTail" + classExtra+(extras ? extras : ""), false);
  }
  svgPolygon(group, [x-k1*a+k2*b, y+k2*a+k1*b,x+k1*a+k2*b, y-k2*a+k1*b,
                     x+k1*a-k2*b, y-k2*a-k1*b, x-k1*a-k2*b, y+k2*a-k1*b],
             "rhombus" + classExtra+(extras ? extras : ""), false);
}

// b. ii) Chant components

function drawNeumeJoin(x, y, p1, p2, colour, sup, extras){
  var m = metrics();
  var a = m.chantPenA;
  var b = m.chantPenB;
  return svgLine(SVG, x-neumeStep(p1, p2)+k1*a+k2*b-0.5, y-yoffset(p1)-k2*a+k1*b,
                 x-k1*a-k2*b+0.5,y-yoffset(p2)+k2*a-k1*b,
                 "neumeJoin " + (colour ? colour : "")+(extras ? extras : ""));
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
    svgLine(SVG, x+(ct/2)-(rastralSize*0.7/15), y-(ct/2)+nudge, x+(ct/2)-(rastralSize*0.7/15), y+rastralSize,
            "chantTail"+(colour ? " "+colour: ""), false);
  }
  if(ltail!=false){
    svgLine(SVG, x-(ct/2)+0.5, y-(ct/2)+nudge, x-(ct/2)+0.5, y+rastralSize, 
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
//  cury += rastralSize * 5 + 5;
  cury += rastralSize * (systemContainsPageOrColumnBreak ? 4 : 3);
  curx += rastralSize / 2;
  cury += currentLinecount * rastralSize;
  lowPoint = cury+(rastralSize*2);
  sysNo++;
  systemContainsPageOrColumnBreak = false;
}

function sysBreak2(lastp){
  currentExample.w2.push([curx, cury-(currentLinecount*rastralSize), 
    currentLinecount, currentStaffColour]);
  if(typeof(lastp) == "undefined" || !lastp){
    currentSystems.push(svgGroup(SVG, "Stafflines", false));
  }
  localWidth = Math.min(curx+2, localWidth);
  currentExample.SVG.setAttribute('width', localWidth);
  underlays = [];
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

////////////////////////////
//
// Annotation tracking
// 

var Annotations = [];
function resetAnnotations(){
  Annotations = [];
}

function addAnnotation(domObject, object, type){
  // Rather cryptically, domObject is the in-text object (referrer),
  // whilst object is the thing to show in any footnote or pop
  // up. type is free text
  var doc = curDoc;
  var oldcurx = curx;
  var oldcury = cury;
  $(domObject).data("object", object);
  // Makes it highlight on hover
  if(typeof(domObject.className)==="string"){
    $(domObject).addClass("hoverable");
  } else {
    domObject.setAttributeNS(null, "class", domObject.className.baseVal+" hoverable");
  }
  // 
  if(doc) docMap.addPopup(object, domObject, "annotation", doc);
  domObject.setAttributeNS(null, "onmouseover", "top.showAnnotation(this);");
  domObject.setAttributeNS(null, "onmouseout", "top.untip(true);");
  // domObject.setAttributeNS(null, "onmouseout", "top.removeTooltip(true);");
  domObject.setAttributeNS(null, "onclick", "top.showAnnotation(this, true);");
  curx = oldcurx;
  cury = oldcury;
}
function untip(hovered){
  removeTooltip(hovered);
  $(".glow").removeClass("glow");
  $(".refglow").each(function (i, e){
    if(e){
      if(typeof(e.className.baseVal)==="undefined"){
        $(e).removeClass("refglow");
      } else {
        e.className.baseVal = e.className.baseVal.split(" refglow").join("");
      }
    }
  });
  $(".popup").not(".clicked").hide();  
}

function englow(pop, ref){
  $(pop).addClass("glow");
  if(typeof(ref.className.baseVal)==="undefined"){
    // Not an SVG
     $(ref).addClass("refglow");
  } else {
    var oldClass = ref.className.baseVal;
    if(oldClass.indexOf("refglow")===-1) ref.className.baseVal = oldClass+" refglow";
  }
}
function unglow(pop, ref){
  $(pop).removeClass("glow");
  if(typeof(ref.className.baseVal)==="undefined"){
    $(ref).removeClass("refglow");
  } else {
    ref.className.baseVal = ref.className.baseVal.split(" refglow").join("");
  }
}
function popGlow(e){
  var pop = e.delegateTarget;
  var ref = $(pop).data("ref");
  englow(pop, ref);
}
function popUnglow(e){
  var pop = e.delegateTarget;
  var ref = $(pop).data("ref");
  unglow(pop, ref);
}
function fnGlow(e){
  var ref = e.delegateTarget;
  var pop = $(ref).data("fn");
  englow(pop, ref);
}
function fnUnglow(e){
  var ref = e.delegateTarget;
  var pop = $(ref).data("fn");
  unglow(pop, ref);
}

function closeAllPopups(){
  var pops = $(".popup");
  $(".TBCloseButton.closepopup").remove();
  pops.removeClass("clicked");
  pops.hide();
 }

function popupCloseButtonClicked(e){
  if(e.altKey) {
    closeAllPopups();
  } else {
    var thisPop = $(e.delegateTarget.parentNode);
    $(e.delegateTarget).remove();
    thisPop.removeClass("clicked");
    thisPop.hide();
  }
}
function popupCloseButton(pop){
  var button = DOMDiv("TBCloseButton closepopup", false, DOMDiv("closeX", false, false));
//  var button = DOMDiv("TBCloseButton closepopup", false, DOMDiv("closeX", false, "×"));
  pop.appendChild(button);
  $(button).click(popupCloseButtonClicked);
}

function isInTip(obj){
  return $(obj).parents(".popup").length ? true : false;
}

function subvariant(obj){
  if($(obj).parents("svg").length){
    console.log("testing subvariant for "+obj.className);
    var parents=$(obj).parents();
    var par, parcl;
    for(var i=0; i<parents.length; i++){
      par = parents[i];
      if(typeof(par.className.baseVal)==="undefined") {
        // No longer in SVG territory, but still no variantgroup
        return false;
      }
      parcl = par.className.baseVal;
      if(parcl.indexOf("variantGroup")>-1){
        return true;
      }
    }
  } else {
    if($(obj).parents(".variantReadingText").length) return true;
  }
  return false;
}

function showAnnotation(obj, clicked){
  var fndiv = $(obj).data("fn");
//  if(obj.tagName==="SPAN" && subvariant(obj) && !isInTip(obj)) return;
  if($(fndiv).filter(":hidden").length>0){
    $(fndiv).show();
    fndiv.style.position = "fixed";
    fndiv.style.left = obj.getBoundingClientRect().left+"px";
    if(obj.tagName==="SPAN" || (obj.tagName==="DIV" && $(obj).hasClass("TabularRow"))){
      if(subvariant(obj)){
        if(isInTip(obj)){
          fndiv.style.top = $(obj).parents(".popup")[0].getBoundingClientRect().bottom+5+"px";
        } else {
          fndiv.style.top = obj.getBoundingClientRect().bottom+
            fndiv.getBoundingClientRect().height+5+"px";
        }
      } else {
        fndiv.style.top = obj.getBoundingClientRect().bottom+"px";
      }
    } else if(subvariant(obj)){
      fndiv.style.top = ($(obj).parents("SVG")[0].getBoundingClientRect().bottom
                         +fndiv.getBoundingClientRect().height)+"px";
    } else {
      var candidateBox = $(obj).parents("SVG")[0].getBoundingClientRect();
      var drawTo = $(obj).parents(".drawTo")[0];
      if(drawTo && candidateBox.bottom < (drawTo.scrollHeight - drawTo.scrollTop -100)){
        fndiv.style.top = candidateBox.bottom+"px";
      } else {
        fndiv.style.top = (candidateBox.top-fndiv.getBoundingClientRect().height)+"px";
      }
    }
  }
  englow(fndiv, obj);
  if(clicked && !$(fndiv).hasClass("clicked")){
    $(fndiv).draggable();
    $(fndiv).addClass("clicked");
    popupCloseButton(fndiv);
  }
  return false;
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
      alert("unclosed"+string);
      return string.length;
    }
  }
  alert("unclosed (b)"+string);
  return string.length;
}

function valueText(value){
  if(typeof(value)=="string" || typeof(value)=="number"){
    return value;
  } else if(typeof(value.objType)!="undefined" && value.objType == "ValueChoice"){
    return value.toText();
  } else {
    alert("bad val"+value);
    return value;
  }
};

var ignorables = ["TextUnderlay", "Comment", "Part"];
function ignorable(object){
  // return true if the presence of this object shouldn't ban using
  // later symbols in prefatory information
  if(typeof(object.objType) != "undefined" && ignorables.indexOf(object.objType)>-1){
    return true;
  } else if(typeof(object.objType) != "undefined" && object.objType == "MusicalChoice"){
    return object.ignorable();
  }
  return false;
}
// For now, not mens...
var infos = ["SolmizationSignature", "Clef", "Staff"];
function infop(object){
  if(!object) return false;
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
  return el.objType == "Note"|| el.objType == "LigatureNote"? staffPosition(el) :
    staffPosition(el.content[0].content[0]);
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
  var div = DOMDiv('infoshowhide '+abbr, false, DOMDiv(false, false, abbr));
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
  //FIXME: lame
  var parent = div.parentNode.parentNode;
  var show = $(div).hasClass("showing");
  var heightChange = 0;
  for(var i=0; i<fields.length; i++){
    var infos = $(parent).find(".info."+fields[i]);
    for(var j=0; j<infos.length; j++){
      if(show){
        $(infos[j]).show();
        heightChange += infos[j].getBoundingClientRect().height;
      } else {
        heightChange -= infos[j].getBoundingClientRect().height;
        $(infos[j]).hide();
      }
    }
//    if(show) {
//    $(parent).find(".info."+fields[i]).show();
//  } else {
//    $(parent).find(".info."+fields[i]).hide();
//  }
  }
  if(heightChange){
    $(parent).find(".floatingBreak").each(function(){
      var top = parseFloat(this.style.top);
      this.style.top=top+heightChange+"px";
    });
  }
}

var cssloc = ".";
function cssPath(filename){
  return cssloc +"/"+ filename;
}

function docMapping(){
  this.docs = [];
  this.treatises = {};
  this.panes = [];
  this.treatisePos = {};
  this.hold = false;
  this.popups = [];
  this.unhold = function(){
    this.hold = false;
    wrapWidth = this.paneWidth();
    for(var i=0; i<docMap.docs.length; i++){
      if(docMap.docs[i].prevWidth != wrapWidth){
        docMap.docs[i].forceredraw = true;
        docMap.docs[i].draw();
      }
    }
    fixHeight(true);
    this.fixButtons();
  };
  this.prepScrolls = function(){
    for(var i=0; i<docMap.docs.length; i++){
      docMap.docs[i].scrollFromURL();
    }
  };
  this.fixButtons = function(){
    // Disable + button if there's no space for an extra pane
    // FIXME: convenient, but misplaced bit:
    var addButtons = $(".TBaddPaneButton");
    $("#test").remove();
    var check = DOMDiv("test", "test", "Maximum: "+window.screen.availWidth+"px, Current: "+ this.clientWidth()+"px, Projected: "+(this.clientWidth()+maxWidth) +"px");
    document.body.appendChild(check);
    check.style.right=5+"px";
    check.style.top=0;
    check.style.position="fixed";
    check.style.backgroundColor="rgba(255, 255, 255, 0.8)";
    if(window.screen.availWidth < this.clientWidth()+maxWidth){
      // not enough space
      addButtons.menu("collapseAll", null, true);
      addButtons.menu("disable");
      addButtons.attr("title", "Your screen is not wide enough to add another view.");
    } else {
      addButtons.menu("enable");
      $(".ui-icon-plus").removeClass("inactive");
      addButtons.attr("title", "");
    }
  };
  this.paneWidth = function(){
    return Math.max(minWidth, Math.min(maxWidth, ($(window).width()-40) / this.panes.length))-30;
  };
  this.clientWidth = function(){
    var maxr = 0;
    for(var p=0; p<this.panes.length; p++){
      maxr = Math.max(maxr, this.panes[p][1].getBoundingClientRect().right);
    }
    return maxr;
  };
  this.fixWidths = function(pos){
    if(this.hold) return false;
    var width = this.paneWidth();
    //if(width===wrapWidth) {
    //  this.fixButtons();
    //  return false;
    //}
    for(var ti=0; ti<timeouts.length; ti++){
      window.clearTimeout(timeouts[ti]);
    }
    timeouts = [];
    wrapWidth = width;
//    document.getElementById("tempdebug").innerHTML = wrapWidth;
    timeouts.push(setTimeout(function(args){
      var totalW = 0;
      for(var i=0; i<docMap.docs.length; i++){
        if(!docMap.docs[i].prevWidth 
           || (docMap.docs[i].prevWidth > wrapWidth && docMap.docs[i].docType==="Transcription")
          ){
          // Commented line would shuffle things to make room. Not doing that now. FIXME: revisit
          docMap.docs[i].forceredraw = true;
          docMap.docs[i].draw();
        }
        if(args[0]) {
          retryScroll([args[0], docMap.docs[i].drawTo]);
        }
        totalW+=docMap.docs[i].actualWidth+5;
      }
      var contentDiv = document.getElementById("content");
      var currentW = parseInt(contentDiv.style.width, 10);
      if(!currentW || isNaN(currentW) || totalW>currentW || totalW<currentW-30){
        // container either too big or far too small
        console.log("resizing", currentW, totalW+12);
        contentDiv.style.width = (totalW+12)+"px";
      } 
      fixHeight(true);
      docMap.fixButtons();
    }, 30, [pos]));
    return true;
  };
  this.addTreatise = function(doc){
    if(typeof(this.treatises[doc.group])==="undefined"){
      this.treatises[doc.group] = [];
    }
    this.treatises[doc.group].push(doc);
  };
  this.treatiseViewEntry = function(string, extraClass){
    if(extraClass && extraClass.length) {
      extraClass = " "+extraClass;
    } else {
      extraClass="";
    }
    var anchor = DOMAnchor("viewOptionAnchor"+extraClass, false, string, false);
    return DOMListItem("viewOption", false, anchor);
  };
  this.switchView = function(DOMObj){
    var pane = $(DOMObj).parents(".contentpane")[0];
    var prevDoc = this.docForPane(pane);
    var treatise = prevDoc.group;
    var replacement, sname;
    if($(DOMObj).hasClass("edited")){
      $(pane).empty();
      applyEditedText(treatise, pane, []);
    } else if($(DOMObj).hasClass("translation")){
      $(pane).empty();
      applyTranslatedText(treatise, pane, false, []);
    } else {
      sname = /SS\S*SS/.exec(DOMObj.className)[0];
      s = prevDoc.showfacs ? [["showfacs", "true"]] : [];
      $(pane).empty();
      applySourceText(sname.substring(2, sname.length-2), treatise, pane, s);
    }
    this.removeDoc(prevDoc);
    this.updatePanes();
  };
  this.updatePageSettings = function(){
    var panedoc;
    var panes = $(".contentpane");
    for(var i=0; i<panes.length; i++){
      panedoc = this.docForPane(panes[i]);
      pageSettings.updateSetting("pane"+i, panedoc.docType);
      if(panedoc.docType==="Transcription") {
        pageSettings.updateSetting("source"+i, panedoc.shortSource);
        if(panedoc.showfacs) pageSettings.updateSetting("showfacs"+i, panedoc.showfacs);
      } else if (pageSettings.settings["source"+i]){
        pageSettings.removeSetting("source"+i);
      }
      if(panedoc.group!=currentTreatise())
        pageSettings.updateSetting("treatise"+i, panedoc.group);
      if(panedoc.showvars!==showvariants)
        pageSettings.updateSetting("showvars"+i, panedoc.showvars);
      if(panedoc.showfacs!==pageSettings.settings["showfacs"+i])
        pageSettings.updateSetting("showfacs"+i, panedoc.showfacs);
      if(panedoc.showcommentary!==pageSettings.settings["showcommentary"+i])
        pageSettings.updateSetting("showcommentary"+i, panedoc.showcommentary);
      if(panedoc.MSPunctuation!==(punctuationStyle==="MS"))
        pageSettings.updateSetting("MSPunctuation"+i, panedoc.MSPunctuation);
    }
    while(pageSettings.settings["pane"+i]){
      var fields = ["pane", "source", "treatise", "showvars", "MSPunctuation", "showfacs", "showcommentary"];
      for(var j=0; j<fields.length; j++){
        if(pageSettings.settings[fields[j]+i]){
          pageSettings.removeSetting(fields[j]+i);
        }
      }
      i++;
    }
  };
  this.addViewRight = function(DOMObj){
    var oldpane = $(DOMObj).parents(".contentpane")[0];
    var pane = DOMDiv("pane contentpane", false, false);
    // ?
    var pos = currentPosition($(oldpane).find(".drawTo")[0]);
    var prevDoc = this.docForPane(pane);
    console.log("We've got", DOMObj, prevDoc, pos);
    var treatise = prevDoc.group;
    oldpane.parentNode.insertBefore(pane, oldpane.nextSibling);
    if($(DOMObj).hasClass("edited")){
      applyEditedText(treatise, pane, []);
    } else if($(DOMObj).hasClass("translation")){
      applyTranslatedText(treatise, pane, false, []);
    } else if($(DOMObj).hasClass("facsimile")){
      applyFacsimile(treatise, pane, false, []);
    } else {
      sname = /SS\S*SS/.exec(DOMObj.className)[0];
      applySourceText(sname.substring(2, sname.length-2), treatise, pane, []);
    }
    this.updatePanes();
    this.updatePageSettings();
    var scrolled = this.fixWidths(pos);
    fixHeight(true);
    this.fixButtons();
    if(!scrolled){
      for(var i=0; i<this.docs.length; i++){
        pos.simpleScroll(this.docs[i].drawTo);
      }
    }
  };
  this.setTreatisePos = function(treatise, book, chapter, section, paragraph, offset){
    if(!this.treatisePos[treatise]) this.treatisePos[treatise] = {};
    var tp = this.treatisePos[treatise];
    if(tp.book!==book || tp.chapter!==chapter || tp.section!==section||tp.paragraph!==paragraph){
      tp.book=book;
      tp.chapter=chapter;
      tp.section=section;
      tp.paragraph=paragraph;
//      this.treatises[treatise]
    }
  };
  this.treatiseViews = function(ul, doc){
    var entry;
    var docString = doc.describe();
    var options = texts[doc.group].sources;
    ul.appendChild(this.treatiseViewEntry("Edited Latin", 
      "edited"+ (docString=="Edited Latin" ? " selected" : "")));
    if(texts[doc.group].translation){
      ul.appendChild(this.treatiseViewEntry("English Translation", 
        "translation "+doc.language+(docString=="Translation" ? " selected" : "")));
    }
    for(var i=0; i<options.length; i++){
      ul.appendChild(this.treatiseViewEntry(options[i][1] +" ("+options[i][0]+")", 
        "transcription SS"+options[i][0]+"SS"
          +(docString=="Transcription: "+options[i] ? " selected" : "")));
    }
    return ul;
  };
  this.docForPane = function(pane){
    for(var i=0; i<this.docs.length; i++){
      if(this.docs[i].out===pane){
        return this.docs[i];
      }
    }
    return false;
  };
  this.updatePanes = function(){
    this.panes = [];
    for(var i=0; i<this.docs.length; i++){
      this.panes.push([this.docs[i].out, this.docs[i].drawTo, this.docs[i]]);
    }
    // FIXME: this is a problem when adding panes initially. Check why
    // and when it's needed
//    this.updatePageSettings();
  };
  this.deleteAllBut = function(doc){
    var pos = this.docs.indexOf(doc);
    var killdocs;
    if(pos){
      killdocs = this.docs.slice(0, pos).concat(this.docs.slice(pos+1));
    } else {
      killdocs = this.docs.slice(1);
    }
    for(var i=0; i<killdocs.length; i++){
      $(killdocs[i].out).remove();
      this.removeDoc(doc);
    }
  };
  this.removeDoc = function(doc){
    this.treatises[doc.group].splice(this.treatises[doc.group].indexOf(doc), 1);
    this.docs.splice(this.docs.indexOf(doc), 1);
    this.updatePanes();
    this.fixWidths();
    this.updatePageSettings();
  };
  this.addDoc = function (doc){
    this.docs.push(doc);
    this.addTreatise(doc);
    this.updatePanes();
    if(this.hold) return;
    if(!this.fixWidths()) {
      doc.draw();
    }
  };
  this.scrollTreatise = function(treatise, book, chapter, section, paragraph, offset, exclude){
    var tGroup = this.treatises[treatise];
    $(".drawTo").unbind('scroll');
    for(i=0; i<tGroup.length; i++){
      if(exclude && exclude === tGroup[i]){
        tGroup[i].setScrollPos(book, chapter, section, paragraph, offset, false);
      } else if (!exclude || exclude != tGroup[i]){
        //tGroup[i].setScrollPos(book, chapter, section, paragraph, offset, false);
      }
    }
    timeouts.push(window.setTimeout(function(){$(".drawTo").scroll(scroller120);}, 20));
  };
  this.updateFromScroll = function(childPane){
    // FIXME: not called?
    if(childPane=="Scrolling")return;
    var pane = $(childPane).parents(".contentpane")[0];
    var tDoc = this.docForPane(pane);
    var treatiseGroup = this.treatises[tDoc.group];
    if(!treatiseGroup){
      return;
    }
    if(treatiseGroup.length>1){
      var paras = $(childPane).children(".para");
      var currentPara = paras[firstVisible(paras, $(childPane).offset().top)];
      var offset = $(currentPara).offset().top - $(childPane).offset().top;
      var pclass = /at-\S*/.exec(currentPara.className)[0].substring(3);
      var loc = pclass.indexOf("-");
      var book = Number(pclass.substring(0,loc));
      pclass = pclass.substring(loc+1);
      loc = pclass.indexOf("-");
//      var chapter = Number(pclass.substring(0, loc));
      var chapter = pclass.substring(0, loc);
      pclass = pclass.substring(loc+1);
      loc = pclass.indexOf("-");
      var section = Number(pclass.substring(0, loc));
      var paragraph = Number(pclass.substring(loc+1));
      for(var i=0; i<treatiseGroup.length; i++){
        if(treatiseGroup[i] !== tDoc && treatiseGroup[i].drawTo!==childPane){
          simpleScrollTo(treatiseGroup[i].drawTo, 
            offset, 
            //0,
            book, chapter, section, paragraph);
        }
        $(treatiseGroup[i].out).find(".loctext").html(romanReference(book, chapter, section));
      }
    }
  };
  this.scrollTo = function(book, chapter){
    // FIXME: mock-up
    for(var i=0; i<this.docs.length; i++){
      $(this.docs[i].out).scrollTo($(this.docs[i].locus(book, chapter)), 500);
    }
  };
  this.docCode = function(tDoc){
    var pane = tDoc.out;
    var index = $(".contentpane").index(pane);
    if(!index || index===-1) return "a";
    return String.fromCharCode(97+index);
  };
  this.popPosition = function(obj, fn){
    var pane = $(obj).parents(".pane")[0];
    var doc = this.docForPane(pane);
    if(doc){
      fn.style.top = $(obj).offset().top+"px";
      fn.style.left = (this.docCode(doc)==="a" ? pane.getBoundingClientRect().right : 10)+"px";
    }
  };
}
docMapping.prototype.addPopup = function(info, referrer, ptype, tDoc){
    var fn = tDoc.footnotes;
    var code = this.docCode(tDoc);
    var fndiv = DOMDiv('popup '+ptype+" stream-"+code, id, false);
    fn.push(fndiv);
    var no = fn.length;
    var id = "popup-"+code+"-"+no;
    var olditem = document.getElementById(id);
    if(olditem) $(olditem).remove();
    document.getElementById("footnotes").appendChild(fndiv);
    if(typeof(info) == "string"){
      fndiv.appendChild(document.createTextNode(info));
    } else if (info.objType==="Choice"){ 
      fndiv.appendChild(info.footnote());
    } else if (info.objType==="Annotation" || info.objType.indexOf("Comment")>-1){
      fndiv.appendChild(info.footnote());
    } else if (info){
      var frame = svg(100, 100);
      fndiv.appendChild(frame);
      fndiv.appendChild(document.createTextNode(" "));
      info.tip(frame);
      fndiv.style.width = frame.getBBox().width+26+"px";
      fndiv.style.height = frame.getBBox().height+26+"px";
      frame.name = code+no;
      frame.setAttribute("data-ref", code+no);
      frame.title = code+no;
    }
    fndiv.name = code+no;
    $(fndiv).data("ref", referrer);
    $(fndiv).mouseenter(popGlow);
    $(fndiv).mouseleave(popUnglow);
    $(referrer).data("fn", fndiv);
    $(fndiv).hide();
};
function scroller120(e){
  var pane = e.delegateTarget;
  var paras = $(pane).children(".para");
  var currentPara = paras[firstVisible(paras, $(pane).offset().top+50)];
//  var location = /at-\S*/.exec(currentPara.className)[0].split("-").slice(1).map(Number);
  var location = /at-\S*/.exec(currentPara.className)[0].split("-").slice(1);
  var doc = docMap.docForPane(this.parentNode);
  var treatise = doc.group;
  docMap.scrollTreatise(treatise, location[0], location[1], location[2], location[3], 
    $(currentPara).offset().top - $(this).offset().top, doc);
}
function checkScroll(){
  var scrollDiv = scrollLock;
  docMap.updateFromScroll(scrollDiv);
  scrollLock = "Scrolling";
  timeouts.push(window.setTimeout(function(){scrollLock=false;}, 1000));
}

docMap = new docMapping();

function getSources (){
  // FIXME: clearly wrong
  if(docMap && docMap.docs.length){
    return docMap.docs[0].sources;
  } else if(doc){
    return doc.sources;
  } else if(sources){
    return sources;
  } else {
    return false;
  }
}
function present(tag, clist){
  for(var i=0; i<clist.length; i++){
    if(clist[i].objType===tag) return i;
  }
  return false;
}
function voidRule(el){
  var pos = present("VoidOpen", el.classList);
  return pos===0 || pos ? true : false;
}
function fullRule(el){
  var pos = present("FullOpen", el.classList);
  return pos===0 || pos ? true : false;
}
function halfFullRule(el){
  var pos = present("HalfFullOpen", el.classList);
  return pos===0 || pos ? el.classList[pos].side : false;
}
function voidnotesp(el){
  if(el.classList){
    if(voidnotes){// || currentSubType==="void"){
      var pos = present("FullOpen", el.classList);
      if(pos || pos ===0){
        return false;
      } else {
        return true;
      }
    } else {
      var pos = present("VoidOpen", el.classList);
      if(pos || pos ===0){
        return true;
      } else {
        return false;
      }
    }
  } else {
    return voidnotes;
  }
}

function firstOccurrence(needle, index, array){
  var pos;
  if(this.index || this.index===0) {
    pos = string.indexOf(needle[this.index], this.start);
  } else {
    pos= string.indexOf(needle, this.start);
  }
  if(pos===-1) pos = string.length+1;
  if(this.min && pos < this.min) {
    this.min = pos;
    this.mini = index;
  }
  return pos;
}

function findClose(closeChar, starti, parentheses){
  if(!starti && starti!=0) starti = 0;
  if(!parentheses) parentheses = [['"', '"'], ['{', '}'], ['(', ')']];
  var first = string.indexOf(closeChar, starti);
  var positions = {start: starti, index: 0, min: string.length, mini: false};
  parentheses.forEach(firstOccurrence, positions);
  if((!positions.mini && positions.mini!==0) || positions.min >= first) {
    return first; // no parentheses
  }
  return findClose(closeChar, findClose(parentheses[positions.mini][1], 
    positions.min+1, parentheses)+1, parentheses);
}

function consumeTillClose(closeChar, starti, parentheses){
  if(!starti && starti!=0) starti = 0;
  if(!parentheses) parentheses = [['"', '"'], ['{', '}'], ['(', ')']];
  var close = findClose(closeChar, starti, parentheses);
  if(close===-1){
    // No match
    return false;
  } else {
    return consumeN(close+1);
  }
}

function consumeTillOption(closeChars, starti, parentheses){
  if(!starti && starti!=0) starti = 0;
  if(!parentheses) parentheses = [['"', '"'], ['{', '}'], ['(', ')']];
  var best;
  for(var i=0; i<closeChars.length; i++){
    var close = findClose(closeChars[i], starti, parentheses);
    if(close!=-1 && (!best || close<best)) best = close;
  }
  if(best) {
    return consumeN(best+1);
  } else {
    return false;
  }
}

function consumeN(n){
  var match = string.substring(0, n);
  string = string.substring(n);
  pointer+=n;
  return match;
}

function specialTogglePunct(select){
  var pos = $(doc.drawTo).offset();
  var val = select.childNodes[select.selectedIndex].value;
  doc.MSPunctuation = val==="MS";
  punctuationStyle = val;
  doc.forceredraw = true;
  doc.draw();
  $(doc.drawTo).offset(pos);
}

function relativeRight(element, parent){
 return element.getBoundingClientRect().right - parent.getBoundingClientRect().left;
  console.log(currentExample.exampleno, currentExample.book, currentExample.chapter, 
              (element.getBoundingClientRect().right - parent.getBoundingClientRect().left)-
             (element.getBBox().x+element.getBBox().width-parent.getBBox().x));
  return element.getBBox().x+element.getBBox().width-parent.getBBox().x;
}

function underlayRight(position, show){
  if(underlays.length){
    // var spaceWidth = 1.4 * rastralSize * prop;
    var spaceWidth = 0.1 * rastralSize * prop;
    var topy = cury-((Number(/-?[0-9]*/.exec(position), 10))*rastralSize/2 +1);
    var bottomy = topy+rastralSize;
    for(var i=underlays.length-1; i>=0; i--){
      upos = underlays[i].getBBox().y+(rastralSize/2); // Why the last bit?
      if(upos>topy && upos<bottomy){
        return relativeRight(underlays[i], SVG)+spaceWidth;
      }
    }
//    return relativeRight(underlays[underlays.length-1], SVG)+spaceWidth;
  } 
  return 0;
}

function punctuationp(obj){
  if(typeof(obj.punctuation)==="undefined"){
    return false;
  } else {
    return obj.punctuation();
  }
}

function trimPreInsSpaces(endsinpunct){
  /// The logic is:
  //   * Is there anything after the ins?
  // 
  //   * Is the ins an ins (i.e. a non-default choice)?
  //
  //     * Does this end in punctuation? 
  //         OR
  //     * Does the the thing after the ins start with punctuation 
  var content = currenttextparent.content;
  // if(content.length>pari+2
  //   && content[pari+1].objType==="Choice" && content[pari+1].nonDefault()) {
  // }
  var curt = curtextitem;
  var n1 = curt.next;
  var n2 = (n1 && n1.objType==="Choice") ? nextTextItem(n1, true) : false;
  // var res1 = content.length>pari+2
  //   && content[pari+1].objType==="Choice"
  //   && content[pari+1].nonDefault()
  //   && (punctuationp(content[pari+2]) || endsinpunct);
  var res2 = n2 && n1.nonDefault() && (endsinpunct || punctuationp(n2));
  // if(res1!==res2) console.log("difference", n1, n2, res1, res2);
  // if(curt.content==="ut hic vides ") console.log(">>", curt, n1, n2, res1, res2, punctuationp(n2));
  return res2;
  // return content.length>pari+2
  //   && content[pari+1].objType==="Choice"
  //   && content[pari+1].nonDefault()
  //   && (punctuationp(content[pari+2]) || endsinpunct);
}

function trimPostInsSpaces(baseText){
  var tellall = false;
  if(nextTextItem(baseText).content==="Prologus"){
    tellall = true;
  }
  var prev = baseText.previous;
  if(!prev) return false;
  if(prev.objType==="Choice" && prev.nonDefault()) {
    var pt = prevTextItem(prev, true);
    if(!pt) return true;
    if(pt.objType==="Punctuation"){
      var ptstring = punctuationStyle==="modern" ? pt.modern : pt.MS;
      if(/\S/.test(ptstring)){
        // needs space
        return false;
      } else {
        return true;
      }
    } else if ((/^\s*$/.test(pt.content))){
      pr = prevTextItem(pt, true);
      if(!pr) return true;
      if(pr.objType==="Punctuation"){
        var prstring = punctuationStyle==="modern" ? pr.modern : pr.MS;
        if(/\S/.test(prstring)){
          // needs space
          return false;
        } else {
          return true;
        }
      }
    }
  }
  return false;
}

function newPart(item){
  var prev = item.previous;
//  if(prev.objType==="Part") console.log("Weird part-related error", item, prev, exampleno);
  while(prev){
    if(prev.objType==="Part"){
      return true;
    } else if(infop(prev)){
      return false;
    }
    prev = prev.previous;
  }
  return true;
}

function followedBySolm(item){
  var next = item.next;
  while(next){
    if(next.objType==="SolmizationSignature"){
      return true;
    } else if(!ignorable(next)){
      return false;
    } 
    next = next.next;
  }
  return false;
}

function readingElements(e, i, a){
  return e.content;
}
function elementSets(container){
  if(container.objType==="Choice" || container.objType==="MusicalChoice"){
    return container.content.map(readingElements, container);
  } else if(typeof(container.content)!="undefined"){
    return [container.content];
  } else if(Array.isArray(container)){
    return [container];
  } else {
    return [];
  }
}
function correctContainer(container){
  // Ensure that container .next and .previous point where they should
  if(container.objType==="Span"){
    if(container.content.length){
      container.next = container.content[0];
      container.previous = last(container.content);
    }
  } else if(container.objType ==="Choice" || container.objType ==="MusicalChoice"){
    if(!container.nonDefault()){
      if(container.content[0].content.length){
        container.next = container.content[0].content[0];
        container.previous = last(container.content[0].content);
      }
    }
  }
}

function correctNexts(container){
  var elements;
  var elSets = elementSets(container);
  for(var j=0; j<elSets.length; j++){
    elements = elSets[j];
    if(!elements) continue;
    for(var i=0; i<elements.length; i++){
      if(i===0 && typeof(container.previous) !== "undefined"){
        elements[i].previous = container.previous;
      }
      if(i===elements.length-1 && typeof(container.next) !== "undefined"){
        elements[i].next = container.next;
      }
      if(elements[i].objType==="Span" || elements[i].objType==="Choice" || elements[i].objType==="MusicalChoice"){
        correctNexts(elements[i]);
      }
    }
  }
  correctContainer(container);
}

function nextTextItem(item, withinPara, parStart){
  // Return the next textual item after ITEM. If WITHINPARA is true,
  // then return false if ITEM is the last one in its container,
  // otherwise, treat the entire document as a continuous list of
  // objects.
  var cand = item.next;
  var parpart = parStart ? parStart : pari;
  while(!cand){
    if(withinPara || (parpart+1>=curDoc.contents.length)) return false;
    parpart++;
    cand = curDoc.contents[parpart].content[0];
  }
  if(simpleTextualContentp(cand)){
    return cand;
  }
  return nextTextItem(cand, withinPara, parpart);
}

function prevTextItem(item, withinPara){
  // Return the previous textual item after ITEM. If WITHINPARA is true,
  // then return false if ITEM is the last one in its container,
  // otherwise, treat the entire document as a continuous list of
  // objects.
  var cand = item.previous;
  if(!cand){
    if(withinPara || pari) return false;
    cand = last(curDoc.contents[pari-1].content);
  }
  if(simpleTextualContentp(cand)){
    return cand;
  }
  return prevTextItem(cand);
}


function repeatDotArray(start, end){
  var result = [];
  for(var i=Math.min(start, end); i<=Math.max(start, end); i++){
    if(i%2===1){
      result.push(i);
    }
  }
  return result;
}

function thisisanindex(obj){
  var pane = $(obj).parents("div.pane")[0];
  if(!pane) {
    console.log("Error finding note parent for", obj);
    return;
  }
  var out = $(pane).find(".cursorLocator")[0];
  out.innerHTML = "Index";
  $(out).show();
}

function showZoomForHover(event){
  var curBreak = false;
  var parentOffsetObj = event.currentTarget;
  // FIXME: this is most likely to be the same as last time, so why not cache?
  if(document.elementFromPoint(event.clientX, event.clientY)===parentOffsetObj){
    return;
  }
  var doc = docMap.docForPane(parentOffsetObj.parentNode);
  if(!doc.showfacs) return;
  if(doc && doc.shortSource){
    var pointerY = event.clientY - doc.drawToTop+parentOffsetObj.scrollTop;
    // FIXME: finding a number by walking rather than binary search is stupid
    // FIXME: doc.breaks is text then music, so it isn't in a useful order
    for(var i=0; i<doc.breaks.length; i++){
      if(doc.breaks[i].top<=pointerY && 
         doc.breaks[i].top+doc.breaks[i].height>=pointerY){
        curBreak = doc.breaks[i];
        break;
      }
    }
    if(curBreak){
      // we know what column we're in and where we are in it
      var proportion = (pointerY - curBreak.top) / curBreak.height;
      if(zoomer) {
        $(zoomer.div).show();
        if(zoomer.prevDoc!==doc){
          zoomer.doc = doc;
          zoomer.prevDoc = doc;
          zoomer.image = false;
        } 
      } else {
        initialiseZoomDiv();
      }
      reposition(doc);
      zoomerMoveFromText(event, curBreak, curBreak.xProp(), 
                         proportion, false, curBreak.margins());
    } 
  } 
};

function displayStatusBarReference(refobj, event){
  var meg = $(refobj).parents("div.musicexample");
  if(meg && meg.length) {
    displayStatusBarReferenceME(refobj, meg[0], event, meg);
  } else {
    var para = $(refobj).parents("div.para")[0];
    if(!para) return;
    var pclass = /at-\S*/.exec(para.className)[0].substring(3);
    var loc = pclass.replace("_", " ").split("-");
    var sclass = /sentence-\S*/.exec(refobj.className)[0].substring(9);
    var book = roman(Number(loc[0])).toUpperCase();;
    var chapter = isNaN(Number(loc[1])) ? loc[1] : roman(Number(loc[1]));
    var pane = $(para).parents("div.pane")[0];
    var out = $(pane).find(".cursorLocator")[0];
    $(out).show();
    var outstring = book ? book+"." : "";
    outstring += (chapter==="p" ? "Prol" 
                  : (chapter==="c" ? "Conc" 
                     : (chapter==="e" ? "Expl" 
                        : chapter)));
    out.innerHTML = outstring+"."+(Number(sclass)+1);
  }
}

function exampleNumberParse(string){
  var exx = string.split("/");
  return exx.length===1 
    ? "ex"+(Number(exx[0], 10)+1) 
    : "exx"+(Number(exx[0])+1)+"–"+(Number(exx[exx.length-1])+1);
}

function displayStatusBarReferenceME(refobj, musicex, event, test){
  var para = $(refobj).parents("div.para")[0];
  var pclass = /at-\S*/.exec(musicex.className)[0].substring(3);
  var loc = pclass.replace("_", " ").split("-");
  var book = roman(Number(loc[0])).toUpperCase();
  var chapter = isNaN(Number(loc[1])) ? loc[1] : roman(Number(loc[1]));
  var exno = loc.length>3 ? exampleNumberParse(loc[3]) : "0";
  var pane = $(para).parents("div.pane")[0];
  var out = $(pane).find(".cursorLocator")[0];
  $(out).show();
  var outstring = book ? book+"." : "";
  outstring += (chapter==="p" ? "Prol" : chapter);
  out.innerHTML = outstring+"."+exno;  
}

function displayReference(refobj, out){
  var para = $(refobj).parents("div.para")[0];
  var pclass = /at-\S*/.exec(para.className)[0].substring(3);
  var loc = pclass.split("-");
  var sclass = /sentence-\S*/.exec(refobj.className)[0].substring(9);
  var book = roman(Number(loc[0])).toUpperCase();;
  var chapter = isNaN(Number(loc[1])) ? loc[1] : roman(Number(loc[1]));
  var jump = $(para).parents("div.pane").find("a.jump-"+book+"_"+chapter);
  jump = jump && jump.length ? jump[0].innerHTML : 
    (chapter == "p" ? "Prol. " 
     : (chapter == "c" ? "Conc." 
        : (chapter == "e" ? "Expl." 
           : book+"."+chapter)));
  if(!out){
    out = document.getElementById("cursorLocator");
    if(!out) {
      out = DOMDiv(false, "cursorLocator", false);
      document.body.appendChild(out);
      out.style.position = "fixed";
      out.style.backgroundColor = "#EEE";
      out.style.padding = "3px";
      out.style.opacity = "0.7";
      out.style.border = "1px solid #F3D88D";
    }
  }
  var drawnPane = $(para).parents(".drawTo");
  if(drawnPane.length){
    rect = drawnPane[0].getBoundingClientRect();
    out.style.top = (rect.top-1)+"px";
    out.style.left = (rect.right-100)+"px";
    // out.style.top = (rect.bottom-30)+"px";
    // out.style.left = (rect.right-100)+"px";
    out.style.width = "80px";
    // out.style.bottom = "0px";
    // out.style.right = "0px";
    // out.style.width = "20ex";
  }
//  out.innerHTML = jump+""+(Number(sclass)+1);
  var outstring = book ? book+"." : "";
  outstring += (chapter==="p" ? "Prol"
                : (chapter==="c" ? "Conc." 
                   : (chapter==="e" ? "Expl." : chapter)));
  out.innerHTML = outstring+"."+(Number(sclass)+1);
}

function ColBreakWidth(a, width){
  // Reposition objects in a based on example width. a[0] is the line,
  // and a[1] is the text
  a[0].setAttribute('x2', width+20);
  a[1].setAttribute('x', width+20);
}

function witnessAppliesTo(object, witness){
  // check whether things in *object* apply to *witness*
  if(object.appliesTo){
    if(object.appliesTo.indexOf("MSS")>-1 
       || (witness==="MSS" && object.appliesTo.indexOf("ed")===-1)){
      return true;
    }
    var item = false;
    for (var i=0; i<object.appliesTo.length; i++){
      item = object.appliesTo[i];
      if(typeof(item)==="string" && typeof(witness)==="string") {
        if(witness===item) return true;
      } else if (typeof(witness)==="object"
                 && witness.objType==="Qualified Witness") {
        if(typeof(item)==="string"){
          if(witness.witness===item) return true;
        } else if(item.objType==="Qualified Witness") {
          if(witness.witness===item.witness 
             && item.corrected===witness.corrected){
            if(foo==="please") console.log("qual");
            console.log(true, 2);
            return true;
          }
        }
      } else {
        // witness is string, object is qualified
        if(item.witness===witness && item.corrected) return true;
      }
    }
    return false;
  } else {
    // Applies universally
    return true;
  }
}

function staffDetailsForWitnesses(witnesses){
  var sofar = currentExample.staves;
  var solm, clef, staff, witness;
  var results = [];
  var result, obj;
  for(var j=0; j<witnesses.length; j++){
    result = [];
    for(var i=sofar.length-1; i>=0; i--){
      obj = sofar[i][1];
      if(witnessAppliesTo(obj, witnesses[j])){
        switch(obj.objType){
        case "Clef":
          if(!clef){
            clef = obj;
          } 
          break;
        case "SolmizationSignature":
          if(!solm){
            solm = obj;
          } 
          break;
        case "Staff":
          if(!staff){
            staff = obj;
          }
          break;
        }
        if(staff && clef && solm){
          break;
        }
      }
    }
    results.push([witnesses[j], clef, solm, staff]);
    clef = false;
    solm = false;
    staff = false;
  }
  return results;
}

function stavesAgreeOld(staffing){
  // FIXME: redundant thanks to changes to how we split variants
  // The results of staffDetailsForWitnesses are of the form [wit,
  // clef, solm, staff]*. Here, we check if they're all the equivalent
  return (staffing && staffing.length) ? staffing.reduce(staffPairAgrees, true) : false;
}
function erroneousClefP(s){
  // It's possible for there to be no clef. FIXME: Goodness knows what
  // we do in that case
  return s[1] && s[1].erroneousClef;
}

function stavesAgree(staffing){
  // The results of staffDetailsForWitnesses are of the form [wit,
  // clef, solm, staff]*. Here, we check if they're all the equivalent
  if (staffing && staffing.length) {
    return !staffing.some(erroneousClefP);
  } else return false;
}

function matchStaves(staffing){
  var newS = [staffing[0].slice(1)];
  var witnesses = [[staffing[0][0]]];
  var found = false;
  for(var i=1; i<staffing.length; i++){
    found = false;
    for(var j=0; j<newS.length; j++){
      if(staffPairAgrees2(staffing[i], newS[j])){
        witnesses[j].push(staffing[i][0]);
        found = true;
        break;
      }
    }
    if(!found) {
      witnesses.push([staffing[i][0]]);
      newS.push(staffing[i].slice(1));
    }
  }
  return [witnesses, newS];
}
function defaultPresent(staffing){
  for(var i=0; i<staffing.length; i++){
    if(isDefaultStaffing(staffing[i])) return true;
  }
  return false;
  var dP = staffing.some(isDefaultStaffing);
  return dP;
}

function isDefaultStaffing(s){
  return clefEqual(s[1], currentClef)
    && solmEqual(s[2], currentSolm)
    && s[3].varLines(s[0]) === currentLinecount
    && (s[3].varColour(s[0]) === currentStaffColour ||
        ([false, "", "red"].indexOf(s[3].varColour(s[0])) >-1 
         && [false, "", "red"].indexOf(currentStaffColour) >-1));
}
function staffPairAgrees(s1, s2){
  if(s1===true){
    return s2;
  } else if(!s1) {
    return false;
  } else if (clefEqual(s1[1], s2[1])
             && solmEqual(s1[2], s2[2])
             && staffEqual2(s1[3], s2[3], s1[0], s2[0])){
    return s2;
  } else {
    return false;
  }
}
function staffPairAgrees2(s1, s2){
  // Same function, different circumstances. N.B. Here, an array with
  // witness information (s1) is compared with one without (s2)
  return clefEqual(s1[1], s2[0])
    && solmEqual(s1[2], s2[1])
    && staffEqual2(s1[3], s2[2], s1[0]);
}
function clefEqual(c1, c2){
  // if(!c1) console.log("c1 missing "+book+"."+chapter+"."+sentence);
  // if(!c2) console.log("c2 missing "+book+"."+chapter+"."+sentence);
  if(!c1 && !c2) return true;
  if(!c1) return false; // FIXME: check why
  if(!c2) return false;
  // ---
  // Editorial clefs are problematic -- do we consider clefs equal if
  // they are effectively the same, but look different given an error?

  // Yes:
  // if(c1.erroneousClef) c1 = c1.erroneousClef;
  // if(c2.erroneousClef) c2 = c2.erroneousClef;

  // No:
  if(c1.erroneousClef || c2.erroneousClef){
    if(c1.erroneousClef && c2.erroneousClef){
      return c1.staffPos===c2.staffPos 
        && c1.type===c2.type
        && c1.erroneousClef.staffPos===c2.erroneousClef.staffPos 
        && c1.erroneousClef.type===c2.erroneousClef.type;
    } else return false;
  }
  // ---
  return c1.staffPos===c2.staffPos 
    && c1.type===c2.type;
}
function solmEqual(s1, s2){
  return (!s1 && !s2)
    || (s1 && s2 && s1.members.length===s2.members.length);
}
function staffEqual(s1, s2){
  return s1.trueLines()===s2.trueLines()
    && (s1.trueColour() === s2.trueColour() ||
        ((s2.trueColour()=== false || s2.trueColour()==="" || s2.trueColour() == "red")
         && 
         (s1.trueColour()=== false || s1.trueColour()==="" || s1.trueColour() == "red")));
}
function staffEqual2(s1, s2, w1, w2){
  var l1 = s1.varLines(w1);
  var c1 = s1.varColour(w1);
  var l2 = s2.varLines(w2);
  var c2 = s2.varColour(w2);
  var neutral = [false, "", "red"];
  return l1===l2 && (c1===c2 || 
                     (neutral.indexOf(c1)>-1 
                      && neutral.indexOf(c2)>-1));
}
function witnessList(reading){
  var span = DOMSpan("variantWitnessList", false, false);
  for(var i=0; i<reading.witnesses.length; i++){
//    if(i){
      span.appendChild(DOMSpace());
//    }
    if(typeof(reading.witnesses[i])==="string"){
      span.appendChild(DOMSpan("variantWitness", false, reading.witnesses[i]));
    } else if(reading.witnesses[i].objType==="WitnessDescription" || 
              reading.witnesses[i].objType==="Qualified Witness"){
      span.appendChild(reading.witnesses[i].toHTML());
    }
  }
  return span;
}
function fromRoman(numeral) {
  // read roman numeral (based on rosetta code example)
  var codes = [['M', 1000], ['CM', 900], ['D',  500], ['CD', 400], 
               ['C',  100], ['XC',  90], ['L',  50],  ['XL',  40],  
               ['X',   10], ['IX',   9], ['V',   5],  ['IV',   4],   
               ['I',    1]]; 
  var total = 0
  for (var i=0; i<codes.length; ++i) {
    while(numeral.substring(0, codes[i][0].length)===code[i][0]){
      total += codes[i][1];
      numeral = numeral.substring(codes[i][0].length);
    }
  }
  return total;
}
function openingString(loc){
  var simpleFoliation = /^[0-9]+[rv][a-z]?[A-E]?$/.test(loc);
  var gathering = /^[A-Z]+[0-9]+[rv][a-z]?$/.text(loc);
  var romanFoliation = /^[IVXLCDM]+[rv][a-z]?$/.test(loc);
  var isVerso = loc.indexOf('v')!=-1;
  if(simpleFoliation){
    var pageNo = parseInt(loc, 10);
    if(isVerso){
      return pageNo+"v-"+(pageNo+1)+"r";
    } else {
      return (pageNo-1)+"v-"+pageNo+"r";
    }
  } else if(romanFoliation){
    var numeral = /[IVXLCDM]/.exec(loc)[0];
    var pageNo = fromRoman(numeral);
    if(isVerso){
      return numeral+"v-"+roman(pageNo+1).toUpper()+"r";
    } else {
      return roman(pageNo-1).toUpper()+"v-"+numeral+"r";
    }
  }
  // FIXME: other cases not yet present, so not an issue. Guessing the
  // next folio in a gathering is not easy, whilst page numbers are
  // unlikely to come up for now.
}
function describeBreak(DOMObj, location){
    // FIXME: not good for all situations 
    var page, folio, column;
    if(/.*[rv]/.test(location)){
      // There is foliation (rather than page numbers)
      var folLoc = location.search(/[rv]/);
      DOMObj.appendChild(DOMSpan("pag", false, location.substring(0, folLoc)));
      DOMObj.appendChild(DOMSpan("fol", false, location.substring(folLoc, folLoc+1)));
      if(folLoc<location.length - 1) {
        DOMObj.appendChild(DOMSpan("colspec", false, location.substring(folLoc+1)));
      }
    } else {
      if(/[a-z]/.test(location)){
        var colLoc = location.search(/[a-z]/);
        DOMObj.appendChild(DOMSpan("pag", false, location.substring(0, colLoc)));
        DOMObj.appendChild(DOMSpan("colspec", false, location.substring(colLoc)));
      } else {
        DOMObj.appendChild(DOMSpan("pag", false, location));
      }
    }
  DOMObj.appendChild(DOMAnchor('column', 'cola'+location, false, false));
  return DOMObj;
}

function allBreaks(){
  var treatises = (docMap && docMap.docs.length) ? docMap.docs : [doc];
  return treatises.reduce(function(p, el) 
                          {return p.concat(el.breaks);}, []); 
}

function breakTop(breaker){
  if(breaker.objType==="Column/Page") {
    var parent =  $(breaker.DOMObj).offsetParent()[0];
    var offset = $(breaker.DOMObj).parents('.tabular').length ? 0 : -4;
    if(!$(parent).hasClass('drawTo')){
      // FIXME: only one level of correction
      offset+=$(parent).position().top;
    }
    var scrollPos = parent.scrollTop;
    return Math.max(0, $(breaker.DOMObj).position().top +offset+scrollPos);
  } else {
    var div = $(breaker.line).parents('.musicexample')[0];
    var divRelTop = $(div).position().top;
    var divAbsTop = div.getBoundingClientRect().top;
    var parent =  $(div).offsetParent()[0];
    var scrollPos = parent.scrollTop;    
    var breakerAbsTop = breaker.line.getBoundingClientRect().top;
    var top = breakerAbsTop-divAbsTop+divRelTop;
    return top-4+scrollPos;
  }
}
function breakDrawTo(breaker){
  if(breaker.objType==="Column/Page") return $(breaker.DOMObj).parents('.drawTo')[0];
  else return $(breaker.line).parents('.drawTo')[0];
}
function setBreakTop(br){
  br.top = breakTop(br);
}
function breakTopHigher(br1, br2){
  return br1.top-br2.top;
}
function replaceBreakersForTreatise(doc){
  if(!doc.breaks.length) return;
  var breakers = doc.breaks.slice();
  breakers.forEach(setBreakTop);
  breakers = breakers.sort(breakTopHigher);
  var breakObjects = [];
  var box, y, parent;
  breakers[breakers.length-1].height = doc.drawTo.scrollHeight 
    - breakers[breakers.length-1].top;
  for(var i=0; i<breakers.length; i++){
    if(i){
      breakers[i-1].height = breakers[i].top-breakers[i-1].top;
      breakers[i-1].nextStart = breakers[i];
    }
    drawTo = breakDrawTo(breakers[i]);
    breakDiv = DOMDiv('floatingBreak col', false, false);
    drawTo.appendChild(breakDiv);
    breakDiv.style.top = breakers[i].top+"px";
    describeBreak(breakDiv, breakers[i].location);
    if(breakers[i].catchWord){
      var catchDiv = breakers[i].catchWord.toHTML();
      breakDiv.appendChild(catchDiv);
      catchDiv.style.bottom = (10+catchDiv.getBoundingClientRect().height)+"px";
    }
    $(breakDiv).data("breaker", breakers[i]);
    // breakDiv.addEventListener("click", function(event){
    //   var div = event.currentTarget;
    //   var breaker = $(div).data("breaker");
    //   if(breaker.doc.thumb.currentBreaker===breaker && $(breaker.doc.thumb.div).filter(":visible").length){
    //     $(breaker.doc.thumb.div).hide();
    //     return;
    //   } 
    //   $(breaker.doc.thumb.div).show();
    //   breaker.doc.thumb.currentBreaker = breaker;
    //   if(!breaker.thumbImage) {
    //     breaker.thumbImage = new Image;
    //     breaker.thumbImage.onload = function(b){
    //       return function(){
    //         b.doc.thumb.draw(b.thumbImage, 0, 0,
    //                          b.thumbImage.width, b.thumbImage.height);
    //         b.doc.thumb.setHoverFunctions();
    //       }
    //     }(breaker);
    //     breaker.thumbImage.src = breaker.thumbFilename();
    //     return;
    //   }
    //   breaker.doc.thumb.draw(breaker.thumbImage, 0, 0, 
    //                          breaker.thumbImage.width, breaker.thumbImage.height);
    //   breaker.doc.thumb.setHoverFunctions();
    // });
  }  
};
function replaceBreakers(){
  var treatises = (docMap && docMap.docs.length) ? docMap.docs : [doc];
  for(var i=0; i<treatises.length; i++){
    replaceBreakersForTreatise(treatises[i]);
  }
  /*
//  var breakers = $('.breaker');
  var breakers = allBreaks();
  var breakObjects = [];
  var box, y, parent;
  for(var i=0; i<breakers.length; i++){
    // y = $(breakers[i]).position().top;
    y = breakTop(breakers[i]);
    // drawTo = $(breakers[i]).parents('.drawTo')[0];
    breakers[i].top = y;
    if(i){
      breakers[i-1].height = y-breakers[i-1].top;
      breakers[i-1].nextStart = breakers[i];
    }
    drawTo = breakDrawTo(breakers[i]);
    breakDiv = DOMDiv('floatingBreak col', false, false);
    drawTo.appendChild(breakDiv);
    breakDiv.style.top = y+"px";
    describeBreak(breakDiv, breakers[i].location);
    if(breakers[i].catchWord){
      var catchDiv = breakers[i].catchWord.toHTML();
      breakDiv.appendChild(catchDiv);
      catchDiv.style.bottom = (10+catchDiv.getBoundingClientRect().height)+"px";
    }
    $(breakDiv).data("breaker", breakers[i]);
    breakDiv.addEventListener("click", function(event){
      var div = event.currentTarget;
      var breaker = $(div).data("breaker");
      if(breaker.doc.thumb.currentBreaker===breaker && $(breaker.doc.thumb.div).filter(":visible").length){
        $(breaker.doc.thumb.div).hide();
        return;
      } 
      $(breaker.doc.thumb.div).show();
      breaker.doc.thumb.currentBreaker = breaker;
      if(!breaker.thumbImage) {
        breaker.thumbImage = new Image;
        breaker.thumbImage.onload = function(b){
          return function(){
            b.doc.thumb.draw(b.thumbImage, 0, 0,
                             b.thumbImage.width, b.thumbImage.height);
            b.doc.thumb.setHoverFunctions();
          }
        }(breaker);
        breaker.thumbImage.src = breaker.thumbFilename();
        return;
      }
      breaker.doc.thumb.draw(breaker.thumbImage, 0, 0, 
                             breaker.thumbImage.width, breaker.thumbImage.height);
      breaker.doc.thumb.setHoverFunctions();
    });
  }*/
}
function WitnessHashName(wit){
  if(wit.objType==="WitnessDescription"){
    return "";
  } else {
    // FIXME: N.B. This is wrong (see below)
    return "#"+(typeof(wit)==="string") ? wit : 
      (wit.witness +(wit.witness.corrected ? "c" : "*"));
  }
}
function TEIWitnesses(rdg, el){
  var wits = "";
  var rend = el.getAttribute("rend") || "";
  var rends = [];
  if(rdg.witnesses.length && rdg.witnesses[0]!=="MSS"){
    for(var i=0; i<rdg.witnesses.length; i++){
      if(i){
        wits+=" ";
      }
      if(typeof(rdg.witnesses[i])==="string"){
        wits+= "#"+rdg.witnesses[i];
      } else if(rdg.witnesses[i].objType==="WitnessDescription"){
        if(i){
          // if(rend.length) rend+=" ";
          // rend += WitnessHashName(rdg.witnesses[i-1])+":"
          //   + rdg.witnesses[i].information;
          rends.push(WitnessHashName(rdg.witnesses[i-1])+":"
                    + rdg.witnesses[i].information);
        }
      } else if(rdg.witnesses[i].objType==="Qualified Witness"){
        // FIXME: no, this should be add, ins, del or whatnot
        wits+= "#"+rdg.witnesses[i].witness+(rdg.witnesses[i].corrected ? "c" : "*");
      }
    }
    if(rend.length){
      el.setAttribute("rend", rend+rends.join("; "));
    }
    el.setAttribute("wit", wits);
  } else if (rdg.extraDescription==="ed." || rdg.description==="ed.") {
    el.setAttribute("resp", "#ed");
  } else if (rdg.witnesses[0]==="MSS") {
    el.setAttribute("wit", "#MSS");
  }
  return el;  
}

function MEIAddPosition(obj, MEIObj){
  // Adds pitch to MEI element, if available, and otherwise adds staff
  // position
  if(obj.pitch){
    MEIObj.setAttribute("pname", obj.pitch.charAt(0).loLowerCase());
    MEIObj.setAttribute("oct", 3+(Math.floor(notes.indexOf(obj.pitch) / 7)));
  } else if(obj.staffPos){
    MEIObj.setAttribute("loc", obj.staffPos-4);
  }
  return obj;
}
function breakerxProp(){
  // proportion of thumbnail's width to discard from left of image
  if(/^[A-Z]?[0-9]*[rv]?a$/.exec(this.location)){
    // Multicolumn spec, but first column
    return 0;
  } else if (/^[A-Z]?[0-9]*[rv]?b$/.exec(this.location)){
    // second column of something. FIXME: For now, assume 2 column
    return 0.5;
  } else {
    // fixme: Stupid
    return 0;
  }
};
function breakerTwoCols(){
  if(/^[A-Z]?[0-9]*[rv]?[ab]$/.exec(this.location)){
    // multicolumn. FIXME: assume two column
    return true;
  } else {
    return false;
  }
}

function breakerMargins(){
  if(/^[A-Z]*[0-9]*r[ab]?/.exec(this.location)){
    return texts[this.doc.shortSource].margins.recto ? 
      texts[this.doc.shortSource].margins.recto : false;
  } else if (/^[A-Z]*[0-9]*v[ab]?/.exec(this.location)){
    return texts[this.doc.shortSource].margins.verso ? 
      texts[this.doc.shortSource].margins.verso : false;
  }
}
function sizeReaderFn(i, j){
  return function(){
    zoomer.image.widths[i] = this.width;
    zoomer.image.heights[j] = this.height;
    zoomer.image.drawNow(i, j);
  };
};
function getSize(image, i, j){
  var fakeImage = new Image();
  fakeImage.src = $(image).attr("src");
  // Add a reference to the original.
  // Get accurate measurements from that.
  $(fakeImage).load(function(){
    if(this.width) zoomer.image.widths[i] = this.width;
    if(this.height) zoomer.image.heights[j] = this.height;
    console.log("getSize", i, j);
    zoomer.image.drawNow(i, j);
  });
}
