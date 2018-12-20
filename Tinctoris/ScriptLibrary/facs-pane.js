function TreatiseImage(filename, outdiv){
  this.filename = filename;
  this.image = new Image();
  this.image.onload = function(obj) { return function(){
    obj.loaded=true;
    obj.draw();
  }}(obj);
  this.image.src = this.filename;
  this.width = false;
  this.group = false;
  this.treatise = false;
  this.docType = "Facsimile";
  this.source = false;
  this.out = outdiv ? outdiv : document.getElementById('content');
  this.drawTo = this.out;
  this.canvas = DOMEl("canvas", "FacsPane", false);
  this.context = this.canvas.getContext("2d");
  this.resize = false;
  this.structure = false;
  this.loaded = false;
  this.out.addEventListener("contextMenu", function(){ return false; });
  this.setScrollPos = function(){
    // FIXME
    return false;
  };
  this.draw = function(){
    if(!this.loaded) return;
    $(this.out).empty();
    this.out.appendChild(this.canvas);
    this.out.style.width = this.image.width+"px";
    this.canvas.width = this.image.width;
    this.canvas.height = this.image.height;
    this.context.drawImage(0, 0, this.image.height, this.image.width);
  };
}

function TreatiseImages(source, imagebits, outdiv){
  this.filename = filename;
  this.images = [];
  this.canvases = [];
  this.group = false;
  this.treatise = false;
  this.source = source;
  this.imagenames = imagebits;
  this.docType = "Facsimiles";
  this.out = outdiv ? outdiv : document.getElementById('content');
  this.drawTo = this.out;
  this.canvas = DOMEl("canvas", "FacsPane", false);
  this.context = this.canvas.getContext("2d");
  this.width = 0;
  this.resize = false;
  this.structure = false;
  this.loaded = false;
  this.current = false;
  this.out.addEventListener("contextMenu", function(){ return false; });
  this.setScrollPos = function(){
    return false;
  };
  this.drawThisAndLoadNext = function(e){
    var w = this.images[this.current].width;
    this.canvases[this.current] = DOMEl("canvas", "FacsColumn", false);
    var context = this.canvases[this.current].getContext("2d");
    if(w>this.width){
      this.out.style.width = (w+5)+"px";
      this.width = w;
    }
    this.canvases[this.current].width = w;
    this.canvases[this.current].height = this.images[this.current].height;
    this.context.drawImage(0, 0, this.images[this.current].height, w);
    this.current++;
    if(this.current<this.imageNames.length){
      this.images.push(new Image);
      this.images[this.current].onload = this.drawThisAndLoadNext;
      this.images[this.current].src = this.imageNames[this.current];
    } else {
      this.images = false;
      this.imageNames = false;
    }
  };
  this.prep = function(){
    this.images = [];
    this.ypos = 0;
    this.next = 0;
    this.images.push(new Image);
    this.images[0].onload = this.drawThisAndLoadNext;
    this.images[0].src = this.imagenames[0];
  };
  this.prep();
  this.draw = function(){
    
  };
}

function applyFacsimile(treatise, pane, settings, filename, witness){
  if(!treatise) treatise = currentTreatise();
  if(!pane){
    pane = DOMDiv("pane contentpane facsimilepane");
    document.getElementById("content").appendChild(pane);
  }
  if(witness && texts[treatise][witness] 
     && texts[treatise][witness].columns
     && texts[treatise][witness].columns.length){
  } else {
    var doc = new TreatiseImage(filename, pane);
    doc.group = treatise;
    for(var s=0; s<settings.length; s++){
      doc[settings[s][0]] = settings[s][1];
    }
    docMap.addDoc(doc); 
  }
}
