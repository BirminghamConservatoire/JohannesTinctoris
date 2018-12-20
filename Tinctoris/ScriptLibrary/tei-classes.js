var hierarchy = {"book": 1, "conclusion": 2, "prologue": 2, 
                 "index": 2, "chapter": 2, "section": 3};

function TEIDoc(){
//  var doc = document.implementation.createDocument(null, "xml");
  var doc = document.implementation.createDocument("http://www.tei-c.org/ns/1.0", "", null);
//  this.tree = document.createElement("TEI");
  this.tree = doc.createElementNS("http://www.tei-c.org/ns/1.0", "TEI");
  // "http://www.w3.org/1999/xhtml", "TEI");
  this.tree.setAttribute("version", "5.0");
  this.tree.setAttribute("xmlns:mei", "http://www.music-encoding.org/ns/mei");
  this.tree.setAttribute("xmlns", "http://www.tei-c.org/ns/1.0");
//  this.head = doc.createElement("teiHeader");
  this.head = doc.createElementNS("http://www.tei-c.org/ns/1.0", "teiHeader");
  this.text = doc.createElementNS("http://www.tei-c.org/ns/1.0", "text");
  this.body = doc.createElementNS("http://www.tei-c.org/ns/1.0", "body");
  this.treatise = doc.createElementNS("http://www.tei-c.org/ns/1.0", "div");
  this.treatise.setAttribute("type", "treatise");
  var piElem = doc.createProcessingInstruction("xml", "version='1.0' encoding='UTF-8'");
  doc.appendChild(this.tree);
  doc.insertBefore(piElem, this.tree);
  this.prevParent = false;
  this.currentParent = this.treatise;
  this.doc = doc;
  this.latestID = 0; // FIXME: suboptimal way of assigning IDs
  this.tree.appendChild(this.head);
  this.tree.appendChild(this.text);
  this.text.appendChild(this.body);
  this.body.appendChild(this.treatise);
  this.IDGen = function(tag){
    // FIXME: suboptimal way of assigning IDs
    return "id."+this.latestID++;
  };
  this.element = function(tag){
    if(tag.indexOf(":")>-1){
      var el = this.doc.createElement(tag);
    } else {
      var el = this.doc.createElementNS("http://www.tei-c.org/ns/1.0", tag);
    }
    el.setAttribute("xml:id", this.IDGen(tag));
    return el;
  };
  this.hasParaParent = function(element){
    if(element.nodeName==="p" || element.nodeName==="P"){
      return true;
    } else if (!element.parentNode) {
      return false;
    } else {
      return this.hasParaParent(element.parentNode);
    }
  };
  this.serialize = function(){
    var serializer = new XMLSerializer();
    return serializer.serializeToString(this.doc);
  };
  this.blobify = function(){
    var content = [this.serialize()];
    return new Blob([this.serialize()], {type: "application/xml"});
  };
  this.text = function(text){
    return this.doc.createTextNode(text);
  };
  this.headers = function(treatise){
    var el, el2, el3;
    var fileDesc = this.element("fileDesc");
    var titleSt = this.element("titleStmt");
    el = this.element("title");
    this.head.appendChild(fileDesc);
    fileDesc.appendChild(titleSt);
    titleSt.appendChild(el);
    el.appendChild(document.createTextNode(treatise.title));
    // FIXME: hard-wired
    el = this.element("author");
    el.appendChild(document.createTextNode("Johannes Tinctoris"));
    el.setAttribute("ref", "http://viaf.org/viaf/100214007/");
    titleSt.appendChild(el);
    if(treatise.editor){
      el = this.element("editor");
      el.appendChild(document.createTextNode(treatise.editor));
      // FIXME: this needs to be a proper cross-ref
      // el.setAttribute("xml:id", "ed");//For now -- bug in Safari
//      el.setAttributeNS("http://www.w3.org/XML/1998/namespace", "id", "ed");
      titleSt.appendChild(el);
    } else if (treatise.entered){
      el = this.element("respStmt");
      el2 = this.element("resp");
      el2.appendChild(document.createTextNode("transcriber"));
      el.appendChild(el2);
      el2 = this.element("name");
      el2.appendChild(document.createTextNode(treatise.entered));
      el.appendChild(el2);
      titleSt.appendChild(el);
    }
    var pubSt = this.element("publicationStmt");
    fileDesc.appendChild(pubSt);
    el = this.element("publisher");
    el.appendChild(document.createTextNode("Early Music Theory, Birmingham Conservatoire, Birmingham City University"));
    pubSt.appendChild(el);
    el = this.element("availability");
    el2 = this.element("p");
    pubSt.appendChild(el);
    el.appendChild(el2);
    el2.appendChild(document.createTextNode("This document is made available under CC BY-NC-ND"));
    var sourceDesc = this.element("sourceDesc");
    fileDesc.appendChild(sourceDesc);
    // var seriesStatement = this.element("seriesStmt");
    // var sTitle = this.element("p");
    // sTitle.appendChild(document.createTextNode("Johannes Tinctoris: Complete Theoretical Works"));
    // seriesStatement.appendChild(sTitle);
    // fileDesc.appendChild(seriesStatement);
    if(treatise.sources.length){
      el = this.element("listWit");
      // el.setAttributeNS("http://www.w3.org/XML/1998/namespace", "id", "MSS");
      el.setAttribute("xml:id", "MSS"); // FIXME: This is here because Safari sucks
      sourceDesc.appendChild(el);
      for(var i=0; i<treatise.sources.length; i++){
        el2 = this.element("witness");
        // el2.setAttribute("xml:id", treatise.sources[i].id);
        // el2.setAttributeNS("http://www.w3.org/XML/1998/namespace", "id", 
        //                    treatise.sources[i].id);
        el2.setAttribute("xml:id", treatise.sources[i].id); // FIXME: This is here because Safari sucks
        el2.appendChild(document.createTextNode(treatise.sources[i].details));
        el.appendChild(el2);
      }
    } else if (treatise.docType==="Translation") {
      var ptr  = this.element("ptr");
      var bibl = this.element("bibl");
      ptr.setAttributeNS(null, 'target', 'http://earlymusictheory.org/texts/'+treatise.group+'/');
      bibl.appendChild(ptr);
      sourceDesc.appendChild(bibl);
    }
    if(treatise.script){
      var msDesc = this.element('msDesc');
      var physDesc = this.element('physDesc');
      var handDesc = this.element('handDesc');
      var handNote = this.element('handNote');
      var found = false;
      var msIdent = this.element('msIdentifier');
      var msidno = this.element('idno');
      msDesc.appendChild(msIdent);
      msIdent.appendChild(msidno);
      msidno.appendChild(this.text(treatise.source));
      physDesc.appendChild(handDesc);
      msDesc.appendChild(physDesc);
      sourceDesc.appendChild(msDesc);
      handDesc.appendChild(handNote);
      handNote.appendChild(this.text(treatise.script));
      handNote.setAttribute("scope", "sole");
      for (var id in treatise.hands) {
        if (treatise.hands.hasOwnProperty(id)) {
          if(!found){
            handNote.setAttribute("scope", "major");
            found = true;
          }
          handNote = this.element('handNote');
          handNote.setAttribute("xml:id", id); //fixme: stupid Safari
          handNote.setAttribute("scope", "minor");
          handNote.appendChild(this.text(treatise.hands[id]));
          handDesc.appendChild(handNote);
        }
      }
    };
    return this.head;
  };
  this.addSubdivision = function(obj){
    var par = this.currentParent;
    var newdiv = this.element("div");
    var level = hierarchy[obj.objType.toLowerCase()];
    newdiv.setAttribute("type", obj.objType.toLowerCase());
    newdiv.setAttribute("n", obj.n);
    while(par && par.tagName!=="BODY" && par.tagName!=="body" 
          && hierarchy[par.getAttribute("type")]>level){
      par = this.currentParent.parentNode;
    }
    if(!par){
      this.body.appendChild(newdiv);
    } else if(par.tagName==="BODY" || par.tagName==="body"){
      par.appendChild(newdiv);
    } else if(hierarchy[par.getAttribute("type")]<level) {
      // no div at this level yet in the current larger-scale unit
      par.appendChild(newdiv);
    } else {
      if(!par.parentNode) {
        console.log("no parent", par, newdiv);
      } else {
        par.parentNode.appendChild(newdiv);
      }
    }
    this.currentParent = newdiv;
    return newdiv;
  };
}
function addSubdivision(TEI){
  TEI.addSubdivision(this);
}

function makeTEITable(doc, parent){
  var el = doc.element("table");
  if(!parent) parent = doc.currentParent;
  parent.appendChild(el);
  el.setAttribute("rows", this.rowCount());
  el.setAttribute("cols", this.columnCount());
  for(var i=0; i<this.rows.length; i++){
    if(this.rows[i].toTEI){
      this.rows[i].toTEI(doc, el);
    }
  }
  return el;
};

function MEIDoc(title){
	this.doc = document.implementation.createDocument("http://www.music-encoding.org/ns/mei", "", null);
	this.tree = this.doc.createElementNS("http://www.music-encoding.org/ns/mei","MEI");
	this.doc.appendChild(this.tree);
	this.tree.setAttribute("meiversion", "3.0.0");
	this.head = this.doc.createElementNS("http://www.music-encoding.org/ns/mei", "meiHead");
	var titleel = this.doc.createElementNS("http://www.music-encoding.org/ns/mei", "title");
	if(title){
		console.log(title);
		var t = this.doc.createTextNode(title ? title : "");
		titleel.appendChild(t);
	}
	var titlestmt = this.doc.createElementNS("http://www.music-encoding.org/ns/mei", "titleStmt");
	var filedesc = this.doc.createElementNS("http://www.music-encoding.org/ns/mei", "fieldesc");
	titlestmt.appendChild(titleel);
	this.head.appendChild(filedesc);
	filedesc.appendChild(titlestmt);
	this.tree.appendChild(this.head);
	var pubstmt =  this.doc.createElementNS("http://www.music-encoding.org/ns/mei", "pubStmt");
	filedesc.appendChild(pubstmt);
	this.serialize = function(){
    var serializer = new XMLSerializer();
    return serializer.serializeToString(this.doc);
  };
  this.blobify = function(){
    var content = [this.serialize()];
    return new Blob([this.serialize()], {type: "application/xml"});
  };
}
