function SVGTable(){
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
function SVGCell(table){
  this.objType = "SingleCell";
  this.content = [];
  this.table = table;
  this.height = 0;
  this.width = 0;
  this.domObj = false;
  this.attachmentPoints = simpleCellAttachmentPoints;
  this.draw = drawCell;
}
function SVGMultiCell(table){
  this.objType = "MultiCell";
  this.content = [];
  this.domObj = false;
  this.table = table;
  this.height = 0;
  this.width = 0;
  this.attachmentPoints = multiCellAttachmentPoints;
  this.draw = drawMultiCell;
}
function RClassificationRow(table){
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
  console.log("joining", attachLeft, attachRight);
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
  this.LContent.draw(this.LCell, 0, y);
  this.lWidth = this.LContent.width;
  this.RCell = svgGroup(this.domObj, "parent cell");
  this.RContent.draw(this.RCell, this.lWidth, y);
  this.rWidth = this.RCell.getBoundingClientRect().width;
}
function adjustCells(leftWidth){
  this.RCell.setAttributeNS(null, "x", leftWidth);
  this.RContent.x = leftWidth;
  this.RContent.y = this.LContent.y+(this.LContent.height/2)-(this.RContent.height/2);
  var nodes = this.RCell.childNodes;
  for(var i=0; i<nodes.length; i++){
    // There's only one (!)
    nodes[i].setAttributeNS(null, "x", leftWidth);
    nodes[i].setAttributeNS(null, "y", this.RContent.y);
  }
  this.RCell.setAttributeNS(null, "y", this.RContent.y);
  this.join(this.svg, this.LContent, this.RContent);
}
function twoColumnWidth(){
  return this.RCell.x+this.rWidth+this.padding;
}
function rowHeight(){
  console.log("heightCheck", this.RContent.height, this.LContent.height);
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
function makeTable(tArray){
  var table = new SVGTable();
  var row, mcell, scell;
  for(var i=0; i<tArray.length; i++){
    row = new RClassificationRow(table);
    mcell = new SVGMultiCell(table);
    for(var j=0; j<tArray[i][0].length; j++){
      scell = new SVGCell(table);
      scell.content.push(tArray[i][0][j]);
      mcell.content.push(scell);
    }
    row.LContent = mcell;
    scell = new SVGCell(table);
    scell.content.push(tArray[i][1]);
    row.RContent = scell;
    table.rows.push(row);
  }
  return table;
}
var table;
function initTest(){
  var data = [[["a", "b", "c"], "abc"], [["d", "efg"], "defg"]];
  table = makeTable(data);
  var svgObj = svg(800, 800);
  document.body.appendChild(svgObj);
  table.draw(svgObj);
}
