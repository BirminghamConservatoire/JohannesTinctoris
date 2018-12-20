function ClassificationTable(){
  this.objType = "SVGTable";
  this.svg = false;
  this.domObj = false;
  this.rows = [];
  this.height = 0;
  this.leftWidth = 0;
  this.rightWidth = 0;
  this.padding = 3;
  this.draw = drawTable;
}
function ClassificationCell(table){
  this.objType = "SingleCell";
  this.content = [];
  this.table = table;
  this.height = 0;
  this.width = 0;
  this.domObj = false;
  this.attachmentPoints = simpleCellAttachmentPoints;
  this.draw = drawCell;
  this.adjust = adjustCell;
}
function ClassificationMultiCell(table){
  this.objType = "MultiCell";
  this.content = [];
  this.domObj = false;
  this.table = table;
  this.height = 0;
  this.width = 0;
  this.attachmentPoints = multiCellAttachmentPoints;
  this.draw = drawMultiCell;
  this.adjust = adjustMultiCell;
}
function ClassificationRow(table){
  this.objType = "Right Classification Row";
  this.RContent = false;
  this.LContent = false;
  this.RCell = false;
  this.LCell = false;
  this.domObj = false;
  this.table = table;
  this.padding = false;
  this.x = false;
  this.y = false;
  this.lWidth = 0;
  this.rWidth = 0;
  this.connectionType = "Line";
  this.draw = drawRClassificationRow;
  this.width = twoColumnWidth;
  this.height = rowHeight;
  this.join = drawJoin;
  this.joinLine = joinLine;
  this.adjustCells = adjustCells;
}
function drawJoin(){
  if(this.connectionType==="Line"){
    this.joinLine(this.domObj, this.LContent, this.RContent);
  }
}
function simpleCellAttachmentPoints(side){
  var br = this.domObj.getBoundingClientRect();
  if(side==="L"){
    return [{x:this.x+this.width+(this.table.padding/2), y:br.top}];
  } else if (side==="R"){
    return [{x:this.x-(this.table.padding/2), y:br.top}];
  }
  console.log("Join line broken");
    return [{x:br.right, y:br.top+(br.height/2)}];
}
function multiCellAttachmentPoints(side){
  var points = [];
  for(var i=0; i<this.content.length; i++){
    points.push(this.content[i].attachmentPoints(side)[0]);
  }
  return points;
}
function joinLine(svgEl, cellL, cellR){
  var attachLeft = cellL.attachmentPoints("L");
  var attachRight = cellR.attachmentPoints("R");
  for(var i=0; i<attachLeft.length; i++){
    for(var j=0; j<attachRight.length; j++){
      svgLine(svgEl, attachLeft[i].x, attachLeft[i].y,
             attachRight[j].x, attachRight[j].y, "tableJoinLine", false);
    }
  }
}
function drawCell(svgEl, x, y){
  this.domObj = svgText(svgEl, x, y, 'table-cell single', false, false);
  this.y = y;
  this.x = x;
  for(var i=0; i<this.content.length; i++){
    if(typeof(this.content[i])==="string"){
      svgSpan(this.domObj, false, false, this.content[i]);
    } else {
      this.content[i].draw(this.domObj, y);
    }
  }
  this.domObj.setAttributeNS(null, 'y', y);
  this.domObj.setAttributeNS(null, 'x', x);
  var bc = this.domObj.getBoundingClientRect();
  this.height = bc.height;
  this.width = bc.width;
  this.bottom = bc.bottom;
  return this.domObj;
}
function drawMultiCell(svgEl, x, y){
  //var y=svgEl.getBoundingClientRect().bottom + this.padding;//??wtf??
  this.y = y;
  this.x = x;
  this.domObj = svgEl;
  for(var i=0; i<this.content.length; i++){
    this.content[i].draw(svgEl, x, y);
    y+=this.content[i].height;
    this.width = Math.max(this.width, this.content[i].domObj.getBoundingClientRect().width);
  }
  this.height = y - this.y;
}
function drawRClassificationRow(svgEl, y){
  this.domObj = svgGroup(svgEl, "classification row rightwards");
  this.y = y;
  this.LCell = svgGroup(this.domObj, "parent cell");
  this.LContent.domObj = this.LCell;
  this.LContent.draw(this.LCell, 0, y);
  this.lWidth = this.LContent.width;
  this.RCell = svgGroup(this.domObj, "parent cell");
  this.RContent.draw(this.RCell, this.lWidth, y);
  this.rWidth = this.RContent.width;
}
function adjustCells(leftWidth){
  this.LContent.adjust(false, this.RContent);
  this.RContent.adjust(leftWidth, this.LContent);
  this.join(this.svg, this.LContent, this.RContent);
}
function adjustCell(x, otherContent){
  var nodes = this.domObj.childNodes;
  if(x || x===0){
    this.x = x;
    nodes[0].setAttributeNS(null, "x", x);
  }
  if(otherContent && otherContent.objType==="MultiCell") {
    this.y = otherContent.y + (otherContent.height/2) - (this.height/2);
    nodes[0].setAttributeNS(null, "y", this.y);
  }
}
function adjustMultiCell(x, otherContent){
  this.x = x;
  for(var i=0; i<this.content.length; i++){
    this.content[i].adjust(x, false);
  }
}
function twoColumnWidth(){
  return this.RCell.x+this.rWidth+this.padding;
}
function rowHeight(){
  return Math.max(this.RContent.height, this.LContent.height);
}
function drawTable(svgObj){
  this.svg = svgObj;
  this.domObj = svgGroup(svgObj, "table", false);
  var y = 10;
  for(var i=0; i<this.rows.length; i++){
    this.rows[i].draw(this.domObj, y);
    this.leftWidth = Math.max(this.leftWidth, this.rows[i].lWidth);
    this.rightWidth = Math.max(this.rightWidth, this.rows[i].rWidth);
    y += this.rows[i].height();
  }
  this.height = y;
  for(i=0; i<this.rows.length; i++){
    this.rows[i].adjustCells(this.leftWidth + (this.padding * 3));
  }
}
function makeCell(data, table){
  var cell, subcell;
  if(typeof(data)==="string"){
    cell = new ClassificationCell(table);
    cell.content.push(data);
  } else {
    cell = new ClassificationMultiCell(table);
    for(var i=0; i<data.length; i++){
      subcell = new ClassificationCell(table);
      subcell.content.push(data[i]);
      cell.content.push(subcell);
    }
  }
  return cell;
}
function makeTable(tArray){
  var table = new ClassificationTable();
  var row, mcell, scell;
  for(var i=0; i<tArray.length; i++){
    row = new ClassificationRow(table);
    row.LContent = makeCell(tArray[i][0], table);
    row.RContent = makeCell(tArray[i][1], table);
    table.rows.push(row);
  }
  return table;
}
var table;
function initTest(){
  var data = [[["a", "b", "c"], "abc"], [["d", "efg"], "defg"], 
    ["foo", ["f", "o", "o"]]];
  table = makeTable(data);
  var svgObj = svg(800, 800);
  document.body.appendChild(svgObj);
  table.draw(svgObj);
}
function textBlockToSVG(container, content, block){
  // SVG analogue of the ToHTML version
  for(var i=0; i<content.length; i++){
    if(content[i].objType =="Column/Page"|| 
      (typeof(content[i].content) != "undefined" && 
       typeof(content[i].content) == "Span" && 
       content[i].content[0].objType == "Column/Page")) {
      // I think this is either a break or a variant with a break
      var cn = container.className;
      container.className += " colend";
      // var breakCaption = content[i].toSVG(); // FIXME: doesn't exist
      // if(block.DOMObjs) block.DOMObjs.push(breakCaption);
      // container.appendChild(breakCaption);
    } else if(content[i].toSVG){
      var obj = content[i].toSVG();
      if(obj) {
        container.appendChild(obj);
      }
    } else if (typeof(content[i])==="string"){
      svgSpan(container, false, false, content[i]);
    } else {
      console.log("No appropriate method for", content[i]);
    }
  }
  return container;
}
Span.prototype.toSVG = function(){
  var span = svgSpan();
  span.className = this.type+this.extraClasses();
  this.DOMObj = textBlockToSVG(span, this.content, this);
  return this.DOMObj;
};
Text.prototype.toSVG = function(){
  this.DOMObj = svgSpan(false, false, this.code);
  return this.DOMObj;
};