function DOMEl(tag, cname, id){
  var el = document.createElement(tag);
  if(cname) el.className = cname;
  if(id) el.id = id;
  return el;
}
function DOMTextEl(tag, cname, id, content){
  var el = DOMEl(tag, cname, id);
  if (content) {
    if(typeof(content)=="string"){
      el.appendChild(document.createTextNode(content));
    } else {
      el.appendChild(content);
    }
  }
  return el;  
}
function DOMSpace(){
  return document.createTextNode(" ");
}
function DOMTable(cname, id){
  return DOMEl('table', cname, id);  
}
function DOMRow(cname, id){
  return DOMEl('tr', cname, id);
}
function DOMCell(cname, id, content){
  return DOMTextEl('td', cname, id, content);
}
function DOMCopyTable(table){
  var copy = DOMTable();
  if(table.className){
    copy.className = table.className;
  }
  var rows = $(table).find("tr");
  for(var i=0; i<rows.length; i++){
    var rowCopy = DOMRow();
    copy.appendChild(rowCopy);
    var cells = $(rows[i]).find("td");
    for(var j=0; j<cells.length; j++){
      var cellCopy = DOMCell();
      rowCopy.appendChild(cellCopy);
      var cn = cells[j].childNodes;
      for(var mm=0; mm<cn.length; mm++){
        cellCopy.appendChild(cn[mm].cloneNode(true));
      }
    }
  }
  return copy;
}
function DOMDiv(cname, id, content){
  return DOMTextEl('div', cname, id, content);  
}
function DOMSpan(cname, id, content){
  return DOMTextEl('span', cname, id, content);  
}
function DOMTextInput(cname, id, value){
  var el = DOMEl("input", cname, id);
  el.value = value;
  el.type = "text";
  return el;
}
function DOMTextArea(cname, id){
  var el = DOMEl("textarea", cname, id);
  return el;
}
function DOMButton(cname, id, label, callback) {
  var el = DOMEl('button', cname, id);
  el.value = label;
  el.name = label;
  el.innerHTML = label;
  el.onclick = callback;
//  $(el).click = callback;
  return el;
}
function DOMRadio(cname, name, id, value, caption, checked){
  var el = DOMEl('input', cname, id);
  el.name = name;
  el.type = "radio";
  el.value = value;
  el.innerHTML = caption;
  el.checked = checked;
  return el;
}
function DOMSelect(name, cname, id, multiple, options){
  var el = DOMEl('select', cname, id);
  el.name = name;
  el.multiple = multiple;
  for(var i=0; i<options.length; i++){
    el.appendChild(options[i]);
  }
  return el;
}
function DOMOption(value, label, text, selected){
  var el = DOMTextEl('option', false, false, text);
  if(value) el.value = value;
  if(label) el.label = label;
  if(selected) el.selected = true;
  return el;
}
function DOMAnchor(cname, id, content, href){
  var el = DOMTextEl('a', cname, id, content);
  if(href) el.href = href;
  return el;
}
function DOMImage(cname, id, src){
  var img = document.createElement('img');
  if(src) img.src = src;
  if(cname) img.className = cname;
  if(id) img.id = id;
  return img;
}
function DOMListItem(cname, id, content){
  return DOMTextEl("li", cname, id, content);
}
function DOMList(type, cname, id, array){
  var list = document.createElement(type);
  var el;
  if(cname) list.className = cname;
  if(id) list.id = id;
  if(array){
    for(var i=0; i<array.length; i++){
      el = array[i];
      if(Array.isArray(el)){
        el = DOMList(type, false, false, el);
      } else if(el.tagName!="li"){
        el = DOMListItem(false, false, el);
      }
      list.appendChild(el);
    }
  }
  return list;
}
function DOMAddToList(list, el){
  if(Array.isArray(el)){
    el = DOMList("ul", false, false, el);
  } else if(el.tagName!="li"){
    el = DOMListItem(false, false, el);
  }
  list.appendChild(el);
  return list;
}

///////////////////

var tooltip = false;
function Tooltip(info){
  if(!tooltip){
    tooltip = DOMDiv('tooltip', 'tooltip', info);
    document.body.appendChild(tooltip);
  } else {//if(tooltip.innerHTML!=info){
    $(tooltip).empty();
    $(tooltip).removeClass("clicked");
    if(typeof(info) == "string"){
      tooltip.appendChild(document.createTextNode(info));
    } else if (info){
      tooltip.appendChild(info);
    }
  }
  return tooltip;
}
function removeTooltip(hovered){
  if(tooltip && (!hovered || !$(tooltip).hasClass("clicked"))){
    $("#tooltip").remove();
    $(".highlight").removeClass("highlight");
    tooltip = false;
  }
}
//////////////////////////////////////////
//
// SVG
//

var SVGNS = "http://www.w3.org/2000/svg";

function svg (w,h){
  var svg=document.createElementNS(SVGNS,"svg");
  if(w) svg.setAttribute('width', w);
  if(h) svg.setAttribute('height', h);
  return svg;
}

function clearSVG(svgEl){
//  $(svgEl).children().detach().remove();
  $(svgEl).empty();
  // while(svgEl.firstChild){
  //   svgEl.removeChild(svgEl.firstChild);
  // }
}
function svgCSS(element, css){
  var link = document.createElementNS(SVGNS, "link");
  link.setAttributeNS(null, "href", css);
  link.setAttributeNS(null, "type", "text/css");
  link.setAttributeNS(null, "rel", "stylesheet");
  element.appendChild(link);
  return element;
}
function svgText(svgEl, x, y, cname, id, style, content){
  var el = document.createElementNS(SVGNS, "text");
  if(content) var textNode = document.createTextNode(content);
  if(cname) el.setAttributeNS(null, "class", cname);
  if(id) el.id = id;
  if(x) el.setAttributeNS(null, "x", x);
  if(y) el.setAttributeNS(null, "y", y);
  if(style) el.setAttributeNS(null, "style", style);
  if(content) el.appendChild(textNode);
  if(svgEl) svgEl.appendChild(el);
  return el;
}
function svgSpan(svgEl, cname, id, content){
  var el = document.createElementNS(SVGNS, "tspan");
  if(content) var textNode = document.createTextNode(content);
  if(cname) el.setAttributeNS(null, "class", cname);
  if(id) el.id = id;
  if(content) el.appendChild(textNode);
  if(svgEl)  svgEl.appendChild(el);
  return el;
}
function svgGroup(svgEl, cname, id){
  var el = document.createElementNS(SVGNS, "g");
  if(cname) el.setAttributeNS(null, "class", cname);
  if(id) el.id = id;
  if(svgEl) svgEl.appendChild(el);
  return el;
}
function svgLine(svgEl, x1, y1, x2, y2, cname, id){
  var el = document.createElementNS(SVGNS, "line");
  if(cname) el.setAttributeNS(null, "class", cname);
  if(id) el.setAttributeNS(null, "id", id);
  el.setAttributeNS(null, "x1", x1);
  el.setAttributeNS(null, "y1", y1);
  el.setAttributeNS(null, "x2", x2);
  el.setAttributeNS(null, "y2", y2);
  if(svgEl) svgEl.appendChild(el);
  return el;
}
function svgCircle(svgEl, x, y, r, cname, id){
  var el = document.createElementNS(SVGNS, "circle");
  if(cname) el.setAttributeNS(null, "class", cname);
  if(id) el.setAttributeNS(null, "id", id);
  el.setAttributeNS(null, "cx", x);
  el.setAttributeNS(null, "cy", y);
  el.setAttributeNS(null, "r", r);
  if(svgEl) svgEl.appendChild(el);
  return el;
}
function svgRect(svgEl, x, y, w, h, cname, id, rx, ry){
  var el = document.createElementNS(SVGNS, "rect");
  if(cname) el.setAttributeNS(null, "class", cname);
  if(id) el.setAttributeNS(null, "id", id);
  el.setAttributeNS(null, "x", x);
  el.setAttributeNS(null, "y", y);
  el.setAttributeNS(null, "width", w);
  el.setAttributeNS(null, "height", h);
  // rx and ry are for rounded corners
  if(rx) el.setAttributeNS(null, "rx", rx);
  if(ry) el.setAttributeNS(null, "ry", ry);
  if(svgEl) svgEl.appendChild(el);
  return el;
}
function svgPolygon(svgEl, points, cname, id){
  var el = document.createElementNS(SVGNS, "polygon");
  if(cname) el.setAttributeNS(null, "class", cname);
  if(id) el.setAttributeNS(null, "id", id);
  // FIXME: ugly, but is neater code, and spec-compatible
  el.setAttributeNS(null, "points", points.join(" "));
  if(svgEl) svgEl.appendChild(el);
  return el;
}
function svgPath(svgEl, commands, cname, id){
  var el = document.createElementNS(SVGNS, "path");
  if(cname) el.setAttributeNS(null, "class", cname);
  if(id) el.setAttributeNS(null, "id", id);
  el.setAttributeNS(null, "d", commands.join(" "));
  if(svgEl) svgEl.appendChild(el);
  return el;
}
function svgArc(x1, y1, x2, y2, radius) {
  return "M "+x1+" "+y1+" A "+radius+" "+radius+", 0, 1, 0, "+x2+" "+y2;
}
function svgPolyPath(points, close) {
  points = points.reverse();
  var firstPoints = points.pop()+" "+points.pop()+" ";
  var commands = ["M "+firstPoints];
  var start = typeof(close) != undefined && close ? "L "+firstPoints : false;
  while(points.length){
    commands.push("L "+points.pop()+" "+points.pop()+" ");
  }
  if(start) commands.push(start);
  return commands;
}
