const absBaseURI = 'https://www.linkedmusic.org/EarlyMusicTheory/Tinctoris/';

function drawFunction(i, j, ImageSet){
  return function(){
    // ImageSet.getTile(i, j).className="Loaded";
    //setTimeout(delayedDrawFunction(ImageSet, i, j, 20));
    if(ImageSet.heights[j] && ImageSet.widths[i]){
      ImageSet.drawNow(i, j);
    } else {
      getSize(ImageSet.fetchTile(i, j), i, j);
    }
  };
}
function drawToZoomer(){
  if(zoomer && zoomer.image){
    zoomer.image.drawToZoomer();
  };
}
function delayedDrawFunction(imageset, i, j){
  return function(){
    imageset.drawTile(i, j);
  };
}
function drawAll(){
  zoomer.image.drawTiles();
}
function drawNowFunction(i, j, ImageSet, n){
  return function(){
    ImageSet.drawNow(i, j, n);
  };
}
// function delayedCaption(){
//   zoomer.addCaption(zoomer.breaker, zoomer.breaker.doc);
// }
function fractionFloor(n, div){
  // Behaves like lisp FLOOR, returning quotiont AND divisor.
  // N.B. Beware floating points. Here, I'm going to assume 4dp is
  // enough.
  var biggerN = n*10000;
  var biggerDiv = div*10000;
  var quotient = Math.floor(biggerN / biggerDiv);
  var remainder = biggerN - (quotient * biggerDiv);
  return {quotient: quotient, remainder: remainder/1000};
}

function TileSet(breaker){
  this.breaker = breaker;
  this.filename = breaker.imageFilename();
  // this.rows = texts[breaker.doc.shortSource].tiles.y;
  // this.cols = texts[breaker.doc.shortSource].tiles.x;
  this.tile = texts[breaker.doc.shortSource].tile;
  this.basePath = texts[breaker.doc.shortSource].basePath;
  this.matrix = new Array(this.tile.rows*this.tile.cols);
  this.margins = false;
  this.canvasSet = false;
  this.firstRowVisible = false;
  this.firstColVisible = false;
  this.xOffset = false;
  this.yOffset = false;
  this.xOffsetProp = false;
  this.yOffsetProp = false;
  this.xProp = false;
  this.yProp = false;
  this.width = this.tile.cols * this.tile.width;//texts[breaker.doc.shortSource].minWidth;
  this.height = this.tile.rows * this.tile.height;//texts[breaker.doc.shortSource].minHeight;
  this.context = false;
  this.canvas = false;
  this.scale = 1;
  this.offscreenCanvas = DOMEl("canvas", false, false);
  this.offscreenContext = this.offscreenCanvas.getContext("2d");
  this.offscreenCanvas.height = this.height;
  this.offscreenCanvas.width = this.width;
  this.fetchTile = function(i, j){
    return this.matrix[i+j*this.tile.cols] || false;
  };
  this.putTile = function(i, j, image){
    this.matrix[i+j*this.tile.cols] = image;
  };
  this.drawNow = function(i, j){
    var image = this.fetchTile(i, j);
    var imagex = i*this.tile.width;
    var imagey = j*this.tile.height;
    var xStart, yStart, dx, dy, dw, dh, sx, sy, sw, sh;
    if(imagex<this.xOffset){
      // first column -- may be partially offscreen
      sx = this.xOffset-imagex;
      sw = this.tile.width-sx;
      dx = 0;
      dw = sw*this.scale;
      if(sw<=0) {
        //image edge
//        console.log(imagex, this.xOffset, this.tile.width, sx, sw, i, j, this.scale);
        return;
      }
    } else {
      sx = 0;
      sw = this.tile.width;
      dx = (imagex-this.xOffset)*this.scale;
      dw = this.tile.width*this.scale;
      if (dw+dx>this.canvasSet.canvas.width){
        //Last of its column
        dw = this.canvasSet.canvas.width-dx;
        sw = dw/this.scale;
      }
    }
    if(imagey<this.yOffset){
      // first column -- may be partially offscreen
      sy = this.yOffset-imagey;
      sh = this.tile.height-sy;
      dy = 0;
      dh = sh*this.scale;
      if(dh+dy>this.canvasSet.canvas.height){
        // Last of its row (FIXME: take this out of the parent if clause)
        dh = this.canvasSet.canvas.height-dy;
        sh = dh/this.scale;
      }
    } else {
      sy = 0;
      sh = this.tile.height;
      dy = (imagey-this.yOffset)*this.scale;
      dh = this.tile.height*this.scale;
      if (dh+dy>this.canvasSet.canvas.height){
        //Last of its row
        dh = this.canvasSet.canvas.height-dy;
        sh = dh/this.scale;
      }
    }
    if(sw>this.tile.width || sh>this.tile.height || dw+dx>this.canvasSet.canvas.width
       || dh+dy>this.canvasSet.canvas.height || sw<0 || sh<0 || sx===this.tile.width 
       || sy===this.tile.height) {
      console.log("darn", sx, sy, sw, sh, dx, dy, dw, dh);
      if(sw>this.tile.width){
        console.log("source width", sw, this.tile.width);
      } else if(sh>this.tile.height){
        console.log("source height", sh, this.tile.height);
      } else if(dw+dx>this.canvasSet.canvas.width) {
        console.log("width miscalculation", dw, dx, this.canvasSet.canvas.width);      
      } else if(dh+dy>this.canvasSet.canvas.height) {
        console.log("height miscalculation", dh, dy, this.canvasSet.canvas.height, sh, sy, this.scale);
      } else if(sx===this.tile.width || sy === this.tile.height) {
        console.log("hit tile border", sx, this.tile.width, sy, this.tile.height);
      }
    } else {
      try{
        this.canvasSet.context.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
      } catch(e){
        console.log(e);
        console.log(sx, sy, sw, sh, dx, dy, dw, dh);
      }
      
    }
    zoomer.addCaption(zoomer.breaker, zoomer.breaker.doc);
  };
  this.drawABlank = function(i, j){
    this.canvasSet.context.save();
    this.canvasSet.context.fillStyle = '#999';
    var x = (i*this.tile.width-this.xOffset)*this.scale;
    var y = (j*this.tile.height-this.yOffset)*this.scale;
    var width = i >= this.tile.cols ? this.canvasSet.canvas.width - x
        : this.tile.width*this.scale;
    var height = j >= this.tile.rows ? this.canvasSet.canvas.height - y
        : this.tile.height*this.scale;
    // this.canvasSet.context.fillRect(i*this.tile.width, j*this.tile.height,
    //                                 i*this.tile.width-this.xOffset, 
    //                                 j*this.tile.height-this.yOffset);
    this.canvasSet.context.fillRect(x, y, width, height);
    this.canvasSet.context.restore();
    zoomer.addCaption(zoomer.breaker, zoomer.breaker.doc);
  };
  this.drawTile = function(i, j, preload){
    if(i>=this.tile.cols || j>=this.tile.rows){
      this.drawABlank(i, j);
      return;
    }
    var image = this.fetchTile(i, j);
    if(image){
//      if(!preload) this.drawNow(i, j, image);
      if(!preload) this.drawNow(i, j);
    } else {
//      image = new Image();
      image = new Image(this.tile.width, this.tile.height);
      this.putTile(i, j, image);
      if(!preload) image.onload = drawNowFunction(i, j, this);
      image.src = this.basePath+getFilename(this.filename.fname, i+j*this.tile.cols);
    }
  };
  this.drawTiles = function(){
    starti = Math.floor(this.xOffset/this.tile.width);
    startj = Math.floor(this.yOffset/this.tile.height);
    // var x = (starti*this.tile.width - this.xOffset)*this.scale;
    // var y = (startj*this.tile.height - this.yOffset)*this.scale;
    var x=0;
    var y=0;
    var drawHere;
    var rowPhase = false;
    var colPhase = false;
    var tileWidth = this.tile.width*this.scale;
    var tileHeight = this.tile.height*this.scale;
    for(var j=0; j<=this.tile.rows; j++){
      if(colPhase=="Found"){
        if(y>=(this.yOffset*this.scale+this.canvasSet.canvas.height)){
          colPhase="Passed";
        }
      } else if(!colPhase){
        if(y+tileHeight>this.yOffset*this.scale){
          colPhase = "Found";
        }
      }
      for(var i=0; i<this.tile.cols; i++){
        if(!rowPhase){
          if(colPhase && x+tileWidth>this.xOffset*this.scale){
            rowPhase="Found";
          }
        } else if (rowPhase=="Found"){
          if(x>=(this.xOffset*this.scale+this.canvasSet.canvas.width)){
            rowPhase="Passed";
          }
        }
        if(j<this.tile.rows){
          drawHere = (colPhase=="Found" && rowPhase=="Found");
          this.drawTile(i, j, !drawHere);
        }
//        x+=this.tile.width;
        if(rowPhase!=="Passed") x+=tileWidth;
      }
      rowPhase = false;
      x=0;
//      y+=this.tile.height;
      if(colPhase!=="Passed") y+= tileHeight;
    }
    // for(var j=startj; j<this.tile.rows; j++){
    //   if(y>this.canvasSet.canvas.height) break;
    //   for(var i=starti; i<this.tile.cols; i++){
    //     if(x>this.canvasSet.canvas.width) break;
    //     this.drawTile(i, j);
    //     x+=this.tile.width*this.scale;
    //   }
    //   x=(starti*this.tile.width - this.xOffset)*this.scale;
    //   y+=this.tile.height*this.scale;;
    // }
  };
  this.drawToZoomer = function(minWidth, margins){
    var h = this.canvasSet.canvas.height;
    var w = this.canvasSet.canvas.width;
    var idealWidth = (this.breaker.twoCols() ? 0.55 : 1) * this.width;
    var rescaleFactor = this.margins ? (1-this.margins.right-this.margins.left) : 1;
    idealWidth = idealWidth * rescaleFactor;
    var scale = 1;
    if(w<idealWidth) scale = w/idealWidth;
    // console.log(scale, idealWidth, w);
    var topMargin = this.margins ? this.margins.top*this.height : 0;
    var bottomMargin = this.margins ? this.margins.bottom*this.height : 0;
    var nonMargin = this.height-topMargin-bottomMargin;
    var preText = nonMargin*(this.breaker.startPos ? this.breaker.startPos.charCodeAt(0)-65 : 0)/5;
    var postText = nonMargin*(5- (this.breaker.endPos ? this.breaker.endPos.charCodeAt(0)-64 : 5))/5;
    var main = nonMargin-preText-postText;
    var finalY = topMargin+preText+(main*this.yProp);
//     var xStart = Math.max(0, (this.margins ? 
//                               (this.xProp * (1-this.margins.right-this.margins.left))+this.margins.left
//                               : this.xProp))*scale*this.width;
    var xStart = Math.max(0, Math.floor((this.margins ? 
                               (this.xProp * (1-this.margins.right-this.margins.left))+this.margins.left
                               : this.xProp) * this.width));
    var yStart = Math.max(0, finalY - scale*h/2);
    var firstRowVisible = Math.floor(yStart/this.tile.height);
    var firstColVisible = Math.floor(xStart/this.tile.width);
    if(Math.abs(this.xOffset-xStart)<1 && Math.abs(this.yOffset-yStart)<1 && this.scale===scale){
      return;
    }
    this.xOffset = xStart;
    this.yOffset = yStart;
    this.scale = scale;
    requestAnimationFrame(drawAll);
  };
}

// function ImageSet(breaker){
//   this.breaker = breaker;
//   this.filename = breaker.imageFilename();
//   this.rows = texts[breaker.doc.shortSource].tiles.y;
//   this.cols = texts[breaker.doc.shortSource].tiles.x;
//   this.basePath = texts[breaker.doc.shortSource].basePath;
//   this.matrix = new Array(this.rows * this.cols);
//   this.gridX = new Array(this.cols+1);
//   this.gridY = new Array(this.rows+1);
//   this.widths = new Array(this.cols);
//   this.heights = new Array(this.cols);
//   this.margins = false;
//   this.canvasSet = false;
//   this.firstRow = false;
//   this.firstCol = false;
//   this.xOffset = false;
//   this.yOffset = false;
//   this.xOffsetProp = false;
//   this.yOffsetProp = false;
//   this.xProp = false;
//   this.yProp = false;
//   this.minWidth = false;
//   this.maxWidth = false;
//   this.maxHeight = false;
//   this.guessHeight = false;
//   this.guessWidth = false;
//   this.context = false;
//   this.scale = false;
//   this.isNew = true;
//   this.fakeCanvas = DOMEl("canvas", false, false);
//   this.fakeContext = this.fakeCanvas.getContext("2d");
//   this.fakeCanvas.width = 200;
//   this.fakeCanvas.height = 200;
//   this.fetchTile = function(i, j){
//     return this.matrix[i+j*this.cols] || false;
//   };
//   this.putTile = function(i, j, image){
//     this.matrix[i+j*this.cols]=image;
//   };
//   this.resetCoords = function(){
//     this.gridX = new Array(this.cols+1);
//     this.gridY = new Array(this.rows+1);
//     this.xOffset = false;
//     this.yOffset = false;
//     this.xOffsetProp = false;
//     this.yOffsetProp = false;
//   }
//   this.drawNow = function(i, j){
//     var image = this.fetchTile(i, j);
//     var guessedDims = false;
//     var last = true;
//     var h=image.naturalHeight;
//     var w=image.naturalWidth;
//     if(!h || !w) {
//       // We can't know image dimensions without drawing it (!), so we
//       // gave two options: use a drawn image in a different part of
//       // the grid or draw somewhere invisible
//       if(this.widths[i] && this.heights[j]){
//         h = this.heights[j];
//         w = this.widths[i];
//       } else if(this.gridX[i] !== undefined && i+1<this.gridX.length && this.gridX[i+1] !== undefined
//          && this.gridY[j] !== undefined && j+1<this.gridY.length && this.gridY[j+1] !== undefined){
//         //console.log("grid");
//         // We've got relevant sizes
//         h = this.gridY[j+1]-this.gridY[j];
//         w = this.gridX[i+1]-this.gridX[i];
//       } else {
//         // this.fakeContext.drawImage(image, 0, 0);
//         // h=image.naturalHeight;
//         // w=image.naturalWidth;
//         if(h===0){
//           // I'm at a loss how to do this. For now, just guess (this
//           // will be awful quite a lot of the time)
//           // console.log(i, j, "again");
//           // window.setTimeout(delayedDrawFunction(this, i, j), 20);
//           // return;
//           //console.log("get desperate", i, j, h, w);
//           if(this.gridX[i] !== undefined && i+1<this.gridX.length && this.gridX[i+1] !== undefined
//              && this.gridX[i+1]-this.gridX[i]){
//             // We can at least use the x value from previous squares
//             w = this.gridX[i+1]-this.gridX[i];
//           }
//           if(this.gridY[j] !== undefined && j+1<this.gridY.length && this.gridY[j+1] !== undefined
//              && this.gridY[j+1]-this.gridY[j]){
//             h = this.gridY[j+1]-this.gridY[j];
//           }
//           if(!this.guessHeight) {
//             h=(h ? h : Math.round(this.maxHeight/this.rows));
//             w=(w ? w : Math.round(this.maxHeight/this.cols))
//           } else {
//             h=(h ? h : this.guessHeight);
//             w=(w ? w : this.guessWidth);
//           }
//           guessedDims = true;
//         }
//       }
//     }
//     if(!guessedDims) {
//       this.guessHeight = h;
//       this.guessWidth = w;
//     }
//     var canvas = this.canvasSet.canvas;
//     var cw = canvas.width;
//     var ch = canvas.height-zoomer.captionHeight;
//     if(!this.xOffset && this.xOffset!==0){
//       // This is our first thing to draw. We have a few things to work
//       // out.
//       //FIXME: include minWidth this.scaleFactor=<<SOMETHING>>
//       this.xOffset = Math.floor(this.xOffsetProp*this.scale*w);
//       this.yOffset = Math.floor(this.yOffsetProp*this.scale*h);
//       this.gridX[i]= -this.xOffset;
//       this.gridY[j]= -this.yOffset;
//     }
//     // Set the next start position
//     this.gridX[1+i] = this.gridX[i]+(this.scale*w);
//     this.gridY[1+j] = this.gridY[j]+(this.scale*h);
// //    if(this.gridY[j]===this.gridY[j+1]) console.log("broken: ", w, h, i, j);
//     // this.gridX[1+i] = this.gridX[i]+w;
//     // this.gridY[1+j] = this.gridY[j]+h;
//     // The way we draw multiple tiles is start in the top left
//     // corner. Each draw command triggers one tile to the right (if
//     // there's space) and the first tile in each row starts a new row
//     // (if there's space). That ensures full coverage without sending
//     // duplicate commands
//     if(this.gridX[i+1]<cw) {
//       // window.setTimeout(delayedDrawFunction(this, i+1, j), 3);
//       this.drawTile(i+1, j);
//       last = false;
//     }
//     if(i===this.firstCol && this.gridY[j+1]<ch) {
//       // window.setTimeout(delayedDrawFunction(this, i, j+1), 3);
//       this.drawTile(i, j+1);
//       last = false;
//     }
//     // Now draw
//     var dx = Math.max(this.gridX[i], 0);
//     var dy = Math.max(this.gridY[j], 0);
//     var sx = i===this.firstCol ? this.xOffset : 0;
//     var sy = j===this.firstRow ? this.yOffset : 0;
//     var finalw = w-sx;
//     var finalh = h-sy;
//     this.context.drawImage(image, sx, sy, finalw, finalh, 
//                            dx, dy, this.scale * finalw, this.scale*finalh);
//     // if(this.firstCol){
//     //   var finalw = w-this.xOffset;
//     //   var finalh = h-this.yOffset;
//     //   // console.log(this.xOffset, this.yOffset, w-this.xOffset, h-this.yOffset, finalw, finalh,
//     //   //                                  dx, dy);
//     //   this.canvasSet.context.drawImage(image, this.xOffset, this.yOffset, finalw, finalh, 
//     //                                    dx, dy, finalw, finalh);
//     // } else {
//     //   // console.log(dx, dy);
//     //   this.canvasSet.context.drawImage(image, dx, dy);
//     // }
//     // if(last && this.isNew) {
//     //   // Lazy extra redraw, now that everything has (hopefully) loaded
//     //   this.drawTile(this.firstCol, this.firstRow);
//     //   this.isNew = false;
//     // }
//     if(last){
//       window.setTimeout(delayedCaption, 100);
//     }
//   };
//   this.drawABlank = function(i, j){
//     this.context.fillRect(this.gridX[i], this.gridY[j], 
//                           this.canvasSet.canvas.width-this.gridX[i],
//                           this.canvasSet.canvas.height-this.gridY[j]);
//   }
//   this.drawTile = function(i, j){
//     if(i>=this.cols || j>=this.rows) {
//       this.drawABlank(i, j);
//       return;
//     };
//     var image = this.fetchTile(i, j);
//     if(image){
//       // if(image.className.indexOf("Loaded")>-1){
//         this.drawNow(i, j);
//       // }
//     } else {
//       var image = new Image();
//       this.putTile(i,j,image);
//       image.onload = drawFunction(i, j, this);
//       image.src = this.basePath+getFilename(this.filename.fname, i+j*this.cols);
//     }
//   };
//   this.drawToZoomer = function (minWidth, margins){
//     // Rather than a thumbnail (see below), we have a proportion
//     // through text. This is for hovering over the transcription to
//     // get the image. xProp should be something like 0 for the first
//     // column and 0.5 for the second (in a two-column layout where the
//     // images are individual pages -- this will need revision for
//     // openings). yprop is proportion throught the textual
//     // content. minWidth is an optional specification of minimum
//     // proportion of the total width to include. If it's unspecified,
//     // the image isn't scaled, if it is, the image will be scaled
//     // where the width zoomer width < minWidth*image width. margins is
//     // an object with .top, .bottom, .left and .right values in
//     // pixels.
//     // this.canvasSet = canvasSet;
//     var h = this.canvasSet.canvas.height;
//     var w = this.canvasSet.canvas.width;
//     var twoCols = this.breaker.twoCols();
//     var idealWidth = (twoCols ? 0.55 : 1)*this.maxWidth;
//     if(zoomer.canvas.width<idealWidth){
//       this.scale = zoomer.canvas.width / idealWidth;
//     } else {
//       this.scale = 1;
//     }
//     var topMarginProp = this.margins ? this.margins.top : 0;
//     var bottomMarginProp = this.margins ? this.margins.bottom : 0;
//     var nonMarginProp = 1 - topMarginProp - bottomMarginProp;
//     var preProp = nonMarginProp*(this.breaker.startPos ? this.breaker.startPos.charCodeAt(0)-65 : 0)/5;
//     var postProp = nonMarginProp*(5-(this.breaker.startPos ? this.breaker.startPos.charCodeAt(0)-64 : 5))/5;
//     var mainProp = nonMarginProp - preProp - postProp;
//     var fullyProp = this.yProp * mainProp;
//     var finalY = topMarginProp+preProp+fullyProp;
//     var topOffset = this.breaker.startPos ? this.breaker.startPos.charCodeAt(0)-65 : 0;
//     var canvasHeightProportion = h/this.maxHeight;
//     var heightScaleFactor = (this.breaker.endPos ? 
//                              this.breaker.endPos.charCodeAt(0)-64 : 5) - topOffset;
//     var xStart = Math.max(0, (this.xProp * (this.margins ? 1 - this.margins.right - this.margins.left : 1)) 
//       + (this.margins ? this.margins.left : 0));
//     // var yStart = Math.max(0, 
//     //                       (this.yProp * heightScaleFactor/5) 
//     //                       + (this.margins ? this.margins.top : 0) 
//     //                       + topOffset/5
//     //                       - (this.yProp * canvasHeightProportion));
//     var yStart = Math.max(0, finalY - canvasHeightProportion/2);
//     var queue = [];
//     var startCol = fractionFloor(xStart, 1/this.cols);
//     var startRow = fractionFloor(yStart, 1/this.rows);
//     // console.log("Canvas is ", h, "by", w, "starts ", topOffset, "from the top", 
//     //              "Two columns?", twoCols, this.xProp, this.margins.left, xStart,
//     //              "Y stuff", this.yProp, this.margins.top, yStart);
//     // var startRow = fractionFloor(this.yProp, 1/this.rows);
//     // var startCol = fractionFloor(this.xProp, 1/this.cols);
//     if(this.firstRow===startRow.quotient && this.firstCol===startCol.quotient
//        && this.xOffsetProp===startRow.remainder 
//        && this.yOffsetProp===startCol.remainder) return;
//     this.resetCoords();
//     this.firstRow = startRow.quotient;
//     this.firstCol = startCol.quotient;
//     this.xOffsetProp = startCol.remainder;
//     this.yOffsetProp = startRow.remainder;
//     zoomer.captionHeight = zoomer.addCaption(zoomer.breaker, zoomer.breaker.doc);
//     requestAnimationFrame(delayedDrawFunction(this, this.firstCol, this.firstRow));
//     // requestAnimationFrame(drawFunction(this.firstCol, this.firstRow, this));
// //    this.drawTile(this.firstCol, this.firstRow);
//     
//   };
// }

function getFilename(file, part){
  fname = "";
  for(var i=0; i<5; i++){
    fname+=file.charAt(i);
    fname+=dtol(Number(sd(part, i)));
  }
  return fname+file.slice(5)+".png";
}

function sd(n, pos) {
  s = ('00000'+n);
  if(s.length>pos){
    return s[s.length-pos-1];
  } else {
    return 0;
  }
}

function dtol(d){
  return String.fromCharCode(75+d);
}

function hashFnv32a(str, asString, seed) {
  // Make filenames harder to read. We can't easily stop people
  // downloading images, but we can limit those who do to people who
  // can read code.

  // If you're reading this in the interests of downloading files,
  // please note that *all* images that we have allowed as much access
  // as we possibly can. For any facsimile where we could persuade the
  // image rights holders to make images available for download, we
  // have done so. 

  // If that option is unavailable, we have asked for release of as
  // high quality images as possible, with as much access to them as
  // the libraries would grant. If you download those images without
  // permission, you compromise our future chances of making other
  // images available and of getting the existing libraries to reduce
  // their restrictions.

  // So please don't do it.
  var i, l,
  hval = (seed === undefined) ? 0x811c9dc5 : seed;
  for (i = 0, l = str.length; i < l; i++) {
    hval ^= str.charCodeAt(i);
    hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
  }
  if( asString ){
    // Convert to 8 digit hex string
    return ("0000000" + (hval >>> 0).toString(16)).substr(-8);
  }
  return hval >>> 0;
}
var zoomer = false;
function drawCanvasSet(image, x, y, width, height){
  this.div.style.width = width+"px";
  this.canvas.width = width;
  this.canvas.height = height;
  this.div.style.height = height+"px";
  this.context.drawImage(image, x, y, width, height);
}
function moveZoomBox(left, right){
  var changed = false;
  if(this.canvas.width != Math.floor(right -left)){
    this.div.style.width = (right-left)+"px";
    this.canvas.width = right-left;
    changed = true;
  }
  if(this.div.style.left===left+"px") return changed;
  this.div.style.left = left+"px";
  return true;
}
function canvasPointer(event){
  var x = event.clientX;
  var y = event.clientY;
  var box = event.currentTarget.getBoundingClientRect();
  return {x: (x-box.left)/box.width, y: (y-box.top)/box.height};
}
function refreshZoomer(t){
  console.log("deprecated function 'refreshZoomer'");
  if(zoomer){
    if(zoomer.hidden){
      zoomer.context.drawImage(zoomer.hidden.canvas, 0, 0);
    } else {
      zoomer.context.drawImage(zoomer.image, zoomer.x, zoomer.y);
    }
    if(zoomer.breaker.doc){
      if(texts[zoomer.breaker.doc.shortSource].caption){
      zoomer.addCaption(zoomer.breaker, zoomer.breaker.doc);
      }
    } else{
      console.log("breaker failure:", zoomer.breaker);
    }
  }
}

var count=0;
var started=false;
function drawZoomedImageByProportions(event, breaker, xProp, yProp, minWidth, margins){
  // Rather than a thumbnail (see below), we have a proportion through
  // text. This is for hovering over the transcription to get the
  // image. xProp should be something like 0 for the first column and
  // 0.5 for the second (in a two-column layout where the images are
  // individual pages -- this will need revision for openings). yprop
  // is proportion throught the textual content. minWidth is an
  // optional specification of minimum proportion of the total width
  // to include. If unspecified, the image isn't scaled, if it is, the
  // image will be scaled where the width zoomer width <
  // minWidth*image width. margins is an object with .top, .bottom,
  // .left and .right values in pixels.
  if(!this.image || !this.image.height){
    // no image yet
    return;
  }
  if(count===0){
    started = $.now();
  }
  count++;
  if(count===100) {
    var stopped = $.now();
  }
  var pageTop = (margins ? margins.top : 0) * this.image.height;
  var pageBottom = (margins ? 1-margins.bottom : 1) * this.image.height - (this.canvas.height/2);
  // If the content doesn't fill the full height...
  var topOffset = (breaker.startPos ? breaker.startPos.charCodeAt(0)-65 : 0);
  var heightScaleFactor = (breaker.endPos ? 
                           breaker.endPos.charCodeAt(0)-64 : 5) - topOffset;
  var pageHeight = pageBottom-pageTop;
  var pageLeft = (margins ? margins.left : 0) * this.image.width;
  var pageRight = (margins ? 1-margins.right : 1) * this.image.width;
  var pageWidth = pageRight-pageLeft;
  var twoCols = breaker.twoCols();
  var xStart = Math.round(pageLeft+(xProp*pageWidth));
  var yStart = Math.round(pageTop + (topOffset/5*pageHeight)
                          +(yProp * (pageHeight*heightScaleFactor/5)));
  var idealWidth = (twoCols ? pageWidth * 0.55 : pageWidth * 1);
  if(zoomer.canvas.width<idealWidth){
    zoomer.scale = zoomer.canvas.width / idealWidth;
  } else {
    zoomer.scale = 1;
  }
  if(zoomer.x && zoomer.y && zoomer.x===xStart && zoomer.y===yStart){
    return;
  } else {
    zoomer.x = Math.max(-xStart, this.canvas.width-this.image.width);
    zoomer.y = Math.max(-yStart, -this.image.height);
  }
  if(zoomer.hidden){
    zoomer.hidden.canvas.height = zoomer.canvas.height;
    zoomer.hidden.canvas.width = zoomer.canvas.width;
    if(zoomer.scale==1){
      zoomer.hidden.context.drawImage(zoomer.image, zoomer.x, zoomer.y);
    } else {
      zoomer.hidden.context.drawImage(zoomer.image, -zoomer.x, -zoomer.y, 
                                      Math.floor(zoomer.canvas.width / zoomer.scale), 
                                      Math.floor(zoomer.canvas.height / zoomer.scale),
                                      0, 0,
                                      zoomer.canvas.width, zoomer.canvas.height);
    }
  }
  window.requestAnimationFrame(refreshZoomer);
  return;
}
function zoomerMoveFromText(event, breaker, xProp, yProp){
  // Hacky modification of the existing thumbnail-based image zooming
  // (q.v.) for hovering over text. The text DOM object has fewer
  // useful slots, so more info is needed.

  if(texts[breaker.doc.shortSource].tile){
    if(!zoomer.image || zoomer.breaker !== breaker) {
      zoomer.changeImage(breaker);
      // zoomer.image = new TileSet(breaker);
      // zoomer.breaker = breaker;
      // zoomer.image.breaker = breaker;
      // zoomer.image.margins = breaker.margins();
      // zoomer.image.canvasSet = zoomer;
    } else if (zoomer.image.xProp===xProp &&
               zoomer.image.yProp===yProp){
      return;
    } 
    zoomer.image.xProp = xProp;
    zoomer.image.yProp = yProp;
    window.requestAnimationFrame(drawToZoomer);
  } else if(texts[breaker.doc.shortSource].tiles){
    if(!zoomer.image || zoomer.breaker !== breaker) {
      zoomer.image = new ImageSet(breaker);
      zoomer.breaker = breaker;
      zoomer.image.breaker = breaker;
    } else if (zoomer.image.xProp===xProp &&
               zoomer.image.yProp===yProp){
      return;
    }
    zoomer.image.xProp = xProp;
    zoomer.image.yProp = yProp;
    zoomer.image.margins = breaker.margins();
    zoomer.image.canvasSet = zoomer;
    zoomer.image.context = zoomer.context;
    zoomer.image.maxWidth = texts[breaker.doc.shortSource].maxWidth;
    zoomer.image.maxHeight = texts[breaker.doc.shortSource].maxHeight;
    window.requestAnimationFrame(drawToZoomer);
    // zoomer.image.drawToZoomer(zoomer, xProp, yProp, false, breaker.margins);
  } else if(zoomer.image && zoomer.breaker === breaker){
    var coords = zoomer.drawFromTextHover(event, breaker, xProp, yProp, false, breaker.margins());
  } else {
    var image = new Image();
    zoomer.image = image;
    zoomer.breaker = breaker;
    image.onload = function(){
      zoomerMoveFromText(event, breaker, xProp, yProp, false, breaker.margins());
    };
    image.src = breaker.imageFilename();
  }
}
function addCaption(breaker, doc){
  if(texts[doc.shortSource].caption){
    this.context.font = "15px sans-serif";
    // var caption = breaker.location+". "
    //   +texts[doc.shortSource].caption;
    var caption = texts[doc.shortSource].caption.replace("<fff>", breaker.location+". ");
    // Find necessary line breaks
    var captionWords = caption.split(" ");
    var lines = [];
    var currentLine = ""
    for(var w=0; w<captionWords.length; w++){
      var lineCandidate = currentLine.length ? currentLine+" "+captionWords[w]
        : captionWords[w];
      if(this.context.measureText(lineCandidate).width<this.canvas.width){
        currentLine = lineCandidate;
      } else {
        lines.push(currentLine);
        currentLine = captionWords[w];
      }
    }
    if(currentLine.length) lines.push(currentLine);
    this.context.fillStyle = "rgba(127, 127, 127, 0.5)";
    // this.context.fillRect(0, 0, this.canvas.width, 5+(15 * lines.length));
    this.context.fillRect(0, this.canvas.height-(5+(15*lines.length)), this.canvas.width, 5+(15 * lines.length));
    this.context.fillStyle = "#FFFFFF";
    this.context.font = "15px sans-serif";
    var i = 0;
    for(var l=lines.length; l>0; l--){
      // this.context.fillText(lines[i], 15, 15*(1+i));
      this.context.fillText(lines[i], 15, this.canvas.height-5-(15*(l-1)));
      i++;
    }
    return (lines.length * 15) +5;
  }
}
drawZoomedImage = false;
// function drawZoomedImage(event){
//   // We've got a mouse hovering over a thumbnail, and we've got a
//   // loaded image. Find the right subsection of that image to show in
//   // the zoom box, remove anything that won't be redrawn, draw new
//   // preview.
//   var thumb = $(event.currentTarget).data("canvasSet");
//   if(!thumb){
//     return;
//   }
//   var thumbWidth = thumb.canvas.width;
//   var thumbHeight = thumb.canvas.height;
//   var thumbPointer = canvasPointer(event);
// //  var scale = this.image.height / thumb.canvas.height;
//   var scale = this.image.height / thumb.canvas.height;
//   var xoff = thumbPointer.x*this.image.width;//scale;
//   var yoff = thumbPointer.y*this.image.height;// scale;
//   if(xoff+(this.canvas.width/2)>this.image.width 
//      || yoff+(this.canvas.height/2)>this.image.height){
//     // Not all the canvas will be redrawn, so we need to blank it
//     this.context.fillStyle = "transparent";
//     this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
//   }
//   var xStart = Math.max(0, xoff-(this.canvas.width/2));
//   var yStart = Math.max(0, yoff-(this.canvas.height/2));
//   var xLimit = this.image.width-this.canvas.width;
//   var yLimit = this.image.height-this.canvas.height;
//   this.context.drawImage(this.image, -Math.min(xStart, xLimit),
//                          -Math.min(yStart, yLimit));
//   if(texts[thumb.currentBreaker.doc.shortSource].caption){
//     this.context.fillStyle = "rgba(127, 127, 127, 0.5)";
//     this.context.fillRect(0, 0, this.canvas.width, 20);
//     this.context.fillStyle = "#FFFFFF";
//     this.context.font = "15px sans-serif";
//     var caption = thumb.currentBreaker.location+". "
//       +texts[thumb.currentBreaker.doc.shortSource].caption;
//     this.context.fillText(caption, 15, 15);
//   }
// }
function zoomImageChanger(breaker){
  this.context.save();
  this.context.fillStyle = '#999';
  this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
  this.context.restore();
  this.image = new TileSet(breaker);
  this.breaker = breaker;
  this.image.breaker = breaker;
  this.image.margins = breaker.margins();
  this.image.canvasSet = this;
}
function ZoomCanvasSet(){
  // object gathering all we need to make zoomed images
  this.canvas = DOMEl("canvas", "zoomedImageCanvas", false);
  this.div = DOMDiv(false, "zoomedImageDiv", this.canvas);
  this.context = this.canvas.getContext("2d");
  this.image = false;
  this.doc = false;
  this.scale = false;
  this.x = false;
  this.y=false;
  this.captionHeight = false;
  document.body.appendChild(this.div);
  this.canvas.height = Math.max(250, curDoc.drawTo.parentNode.getBoundingClientRect().height/2);
  this.drawFromEvent = drawZoomedImage;
  this.drawFromTextHover = drawZoomedImageByProportions;
  this.addCaption = addCaption;
  this.draw = drawCanvasSet;
  this.reposition = moveZoomBox;
  this.changeImage = zoomImageChanger;
};
function initialiseZoomDiv(){
  zoomer = new ZoomCanvasSet();
  zoomer.hidden = {canvas: DOMEl("canvas", "zoomedImageFull", false),
                   context: false};
  zoomer.hidden.context = zoomer.hidden.canvas.getContext("2d");
}
function reposition(doc){
  // position the thingy to avoid the whatsit
  var docBox = doc.drawTo.getBoundingClientRect();
  var total = window.innerWidth - 10;
  var leftWidth = docBox.left;
  var rightWidth = total - docBox.right;
  if(leftWidth>rightWidth){
    zoomer.reposition(0, leftWidth-5);
  } else if(rightWidth>300){
    zoomer.reposition(docBox.right+5, total);
  } else {
    zoomer.reposition(5, total-10);
  }
}
function zoomerIn(event){
  var thumbCS = $(event.currentTarget).data("canvasSet");
  var doc = thumbCS.doc;
  if(zoomer){
    $(zoomer.div).show();
    if(zoomer.prevDoc!==doc){
      zoomer.doc = doc;
      zoomer.image = false;
    }
  } else {
    initialiseZoomDiv();
  }
  reposition(doc);
}
function zoomerOut(e){
  /// From quirksmode (/js/events_mouse.html) ensure that we're really leaving
  if (!e) var e = window.event;
	var tg = (window.event) ? e.srcElement : e.target;
  tg = e.currentTarget;
	if (tg.nodeName != 'DIV') return;
	var reltg = (e.relatedTarget) ? e.relatedTarget : e.toElement;
	while (reltg && reltg != tg && reltg.nodeName != 'BODY') {
		reltg= reltg.parentNode;
  }
	if (reltg== tg) return;
  /////////////// 
  $(zoomer.div).hide();
}
function zoomerMove(event){
  if(zoomer.image){
    var coords = zoomer.drawFromEvent(event);
  } else {
    var thumbCS = $(event.currentTarget).data("canvasSet");
    var breaker = thumbCS.currentBreaker;
    var image = new Image();
    if(zoomer.canvas.width/breaker.thumbImage.width >
       zoomer.canvas.height/breaker.thumbImage.height) {
      zoomer.context.drawImage(breaker.thumbImage, 0, 0, 
                       zoomer.canvas.height/breaker.thumbImage.height * breaker.thumbImage.width, 
                       zoomer.canvas.height);
    } else {
      zoomer.drawImage(breaker.thumbImage, 0, 0, breaker.thumbImage.width,
                       zoomer.canvas.width/breaker.thumbImage.width *  
                       zoomer.canvas.height);
    }
    zoomer.context.fillText("Loading", zoomer.canvas.width/2, zoomer.canvas.height/2);
    zoomer.image = image;
    image.onload = function(){
      zoomerMove(event);
    };
    image.src = breaker.imageFilename();
  }
}
function setThumbnailHover(div){
  this.div.addEventListener("mouseover", zoomerIn);
  this.div.addEventListener("mousemove", zoomerMove);
  this.div.addEventListener("touchstart", zoomerIn);
  this.div.addEventListener("touchzoom", zoomerMove);
  this.div.addEventListener("touchend", zoomerOut);
  this.div.addEventListener("touchmouseout", zoomerOut);
  this.div.addEventListener("touchmouseup", zoomerOut);
  this.div.addEventListener("mouseout", zoomerOut);
}
function attachThumbToPage(div){
  div.appendChild(this.div);
  $(this.div).data("canvasSet", this);
  this.div.addEventListener("click", function(){
    $(this).hide();
  });
}
function ThumbCanvasSet(doc){
  this.canvas = DOMEl("canvas", "thumb", false);
  this.doc = doc;
  this.div = DOMDiv("thumbdiv", false, this.canvas);
  this.context = this.canvas.getContext("2d");
  this.draw = drawCanvasSet;
  this.currentBreaker = false;
  this.setHoverFunctions = setThumbnailHover;
  this.attach = attachThumbToPage;
}
function createThumbForDoc(){
  this.thumb = new ThumbCanvasSet(this);
  this.thumb.attach(this.drawTo.parentNode);
}
function imageLookUp (location){
  // For source info
  return this[location];
}
function sideLookUp (breaker){
  return absBaseURI+"Images/Thumbs/"+breaker.doc.shortSource+"/"+this["f"+breaker.side()]+".png";
}
function probeImage(filename, doc){
  $.ajax({ 
    type: 'HEAD', 
    url: filename,
    async: false,
    datatype: 'json',
    complete: function (e,d) { 
      if (e.status===404) {
        doc.fullImages = false;
      } else {
        doc.fullImages = true;
      };
    }});
  return doc.fullImages;
}
function obfuscateSide(breaker){
  if(texts[breaker.doc.shortSource].tiles){
    return {path: absBaseURI+"Images/Full-images/"+breaker.doc.shortSource+"/",
            fname: this["f"+breaker.side()],
            extension: ".png"};
  }
  if(probeImage(absBaseURI+"Images/Full-images/"+breaker.doc.shortSource+"/"+this["f"+breaker.side()]+".png", breaker.doc)){
    return absBaseURI+"Images/Full-images/"+breaker.doc.shortSource+"/"+this["f"+breaker.side()]+".png";
  } else {    
    return absBaseURI+"Images/Mock-images/"+breaker.doc.shortSource+"/"+this["f"+breaker.side()]+".jpg";
  }
}
function thumbFilenameForBreaker(){
  return this.doc.thumbFile(this);
}
function imageFilenameForBreaker(){
  return this.doc.imageFile(this);
}
function Thumb (){
  this.canvasSet = false;
  this.breakObject = false;
  this.image = false;
  this.zoomSet = false;
  this.drawAsThumb = function(breakObject, thumb){
    var w = Math.min(this.canvasSet.div.parentNode.clientWidth - 2, breakObject.image.width);
    var scaleFactor = w / breakObject.image.width;
    var h = this.height*scaleFactor;
    this.image = breakObject.image;
    this.canvasSet.draw(this.image, 0, 0, w, h);
    this.canvasSet.setHoverFunctions(showThumbZoom, hideThumbZoom);
  };
};
function initThumbImage (){
  var thumb = $(this).data("thumb");
  thumb.thumb.canvas.draw(this, thumb);
};

function ThumbState (zoomSet){
  this.thumb = new Thumb();
  this.zoom = zoomSet ? zoomSet : new canvasSet();
  this.thumb.zoomSet = this.zoom;
  this.doc = false;
  this.thumbs = {};
  this.initialise = function(doc){
    doc.thumb = this;
    this.doc = doc;
    this.thumb.canvas = DOMEl("canvas", "thumbcanvas", false);
    this.thumb.div = DOMDiv("thumbnail page", "doc-"+docMap.docCode(doc), this.thumb.canvas);
    this.thumb.context = this.thumb.canvas.getContext("2d");
    $(this.thumb.div).data({thumb: this});
  };
  this.addThumb = function(breakObject){
    this.thumbs[breakObject.location] = breakObject;
    breakObject.loadThumb();
  };
  this.showThumb = function(breakObject){
    this.thumb.drawAsThumb(breakObject, this);
  };
}
function loadThumb(){
  this.image = new Image();
  this.image.src = this.thumbnailPath;
}
function makeFacsThumb(doc){
  doc.thumb = new ThumbState();
  doc.thumb.doc = doc;  
}
