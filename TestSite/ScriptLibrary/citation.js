// Citation and Cross-reference code.
// Consists of two sections -- first bibliographic, second images

// some settings:
var zoomBanner = !window.location.toString().indexOf("nobanner")>-1;
var rmargin = window.location.toString().indexOf("rmargin")>-1;
var bibliographyPage = window.location.toString().indexOf("Bibliography")>-1;
var prevParent, zoomParent;
//////////////////////////////
//
// Bibliographical citation

var BibliographyPath = $('script[src*=citation]').attr('src').replace("citation.js", "../Tinctoris/Bibliography/index.html");
//var BibliographyEntries = [];
var FullBibliography = false;
var currentCitation = false;
var citations = [];
var references = [];
var prevReferences = [];

function refPositionForElement(){
}

function getReferences(){
  // Fetches all the useful cross-references. In a bibliography, this
  // includes local cross-reference, but not other links
  if(bibliographyPage){
    references = $(".contentbox a").filter('[href^=#]');
    for(var i=0; i<references.length; i++){
      $(references[i]).data("refposition", i);
    }
  } else {
    // Bibliographic first
    references = $(".contentbox a").filter('[href*="Bibliography"]');
    for(var i=0; i<references.length; i++){
      $(references[i]).data("refposition", i);
    }
    // then images
    prevReferences = $(".contentbox a").filter('[href*="Images"]');
    for(i=0; i<prevReferences.length; i++){
      $(prevReferences[i]).data("refposition", i);
    }
  }
}

function getBibEntries(){
  if(bibliographyPage){
    FullBibliography = document;
  } else {
    $.ajax({
      url: BibliographyPath,
      success: function(data){
        FullBibliography = data;
        //      BibliographyEntries = $("p", data);
      },
      dataType: "html"
    });
  }
}

function indexCmpFun(a1, a2){
  return a1[0] - a2[0];
}

function adjustAllDivTops(){
  // FIXME: this sort is crazy if done lots on large data. But hey,
  // who cares, right?
  var collection = [];
  for(var i=0; i<citations.length; i++){
    var cit = citations[i];
    var n = Number(cit.id.substring(cit.id.lastIndexOf("-")+1));
    var ref = references[n];
    collection.push([n, cit, ref]);
  }
  collection.sort(indexCmpFun);
  for(i=0; i<collection.length; i++){
    collection[i][1].style.top = $(collection[i][2]).offset().top + "px";
    repositionCitation(collection[i][1]);
  }
  // Now images
  collection = [];
  for(var i=0; i<previews.length; i++){
    var preview = previews[i];
    var n = Number(cit.id.substring(cit.id.lastIndexOf("-")+1));
    var ref = prevReferences[n];
    collection.push([n, preview, ref]);
  }
  collection.sort(indexCmpFun);
  for(i=0; i<collection.length; i++){
    collection[i][1].style.top = $(collection[i][2]).offset().top;
    repositionMarginal(collection[i][1], previews, [], 0);
  }
}

getBibEntries();

function repositionMarginal(div, list, clashes, stuckCount){
  // Given a column of marginal divs in LIST, find a place for DIV,
  // optionally based on N, the position of its reference. This
  // function is called recursively, keeping track of CLASHES, and
  // checking to see if it's stuck in a loop (i.e. the same clash is
  // met with in two recursion stages). As the stuckCount increases,
  // we become increasingly desperate to hop away and use larger
  // displacements.

  /// FIXME: heavily suboptimal solution;
  var testrect, targetT, targetB, queryT, queryB, n1, n2, stuck, jumpBy, margin;
  margin = 5; // Space left between divs
  jumpby = 5;//5;
  n1 = Number(div.id.substring(div.id.lastIndexOf("-")+1));
  queryT =  $(div).offset().top;
  queryB = queryT + div.clientHeight;
  for(var i=0; i<list.length; i++){
    targetT = $(list[i]).offset().top;
    targetB = targetT+list[i].clientHeight;
    if(queryT<targetB+5 && queryB>targetT-5){
      // Clash. Reposition.
      var n2 = Number(list[i].id.substring(list[i].id.lastIndexOf("-")+1));
      if(n1==n2){
        // sanity check
        continue;
      }
      var stuck = clashes.indexOf(i)>-1;
      if(!stuck){
        clashes.push(i);
      } else {
        stuckCount++;
        jumpby = 15*stuckCount;
      }
      console.log(jumpby);
        // Try to keep cardinal order based on id numeral
      console.log("pre");
      if(n1<=n2){
        div.style.top = (targetT-jumpby - div.clientHeight)+"px";
      } else {
        div.style.top = (targetB+jumpby)+"px";
      }
      repositionMarginal(div, list, clashes, stuckCount, n1);
    }
  }
}

function repositionCitation(div){
  console.log(div.id);
  repositionMarginal(div, citations, [], 0);
}

function repositionCitation2(div, from, stuckCount){
  // We test for existing citations that occupy the DIVs space and
  // then move to avoid. Only vertical position matters here.
  //
  // This would be `faster' using an index of some sort, but n is so
  // small here, that it probably wouldn't actually be faster
  var testrect, testT, testB;
  if(!from) from = [];
  if(!stuckCount) stuckCount = 0;
  var newTop = $(div).offset().top;
  var newBot = newTop + div.clientHeight;
  // var rect = div.getBoundingClientRect();
  for(var i=0; i<citations.length; i++){
    // testrect = citations[i].getBoundingClientRect();
    // if(rect.top < testrect.bottom + 5 &&
    //    rect.bottom > testrect.top - 5){
    testT = $(citations[i]).offset().top;
    testB = testT+citations[i].clientHeight;
    if(newTop < testB+5 && newBot > testT-5){
      // There's a clash. Reposition then try again.
      var n1 = Number(div.id.substring(div.id.indexOf("---")+3));
      var n2 = Number(citations[i].id.substring(citations[i].id.indexOf("---")+3));
      var stuck = from.indexOf(i)>-1;
      console.log([n1, n2, stuck]);
      if(!stuck){
        from.push(i);
      } else {
        stuckCount++;
      }
      var jumpby = stuck ? 50*stuckCount : 5;
      if(n1 < n2){
        // Reference precedes already placed one, so put above
        div.style.top = (testT-jumpby-div.clientHeight)+"px";
      } else if (n1 > n2) {
        div.style.top = (testB+jumpby)+"px";
      } else {
        // Shouldn't happen -- they're the same;
        console.log("Same div twice");
      }
      repositionCitation(div, from, stuckCount);
    }
  }
}

function killAllCitations(){
  for(var i=0; i<citations.length; i++){
    $(citations[i]).remove();
  }
  citations = [];
  console.log(currentCitation);
  $(currentCitation).remove();
  currentCitation = false;
}

function pinCitation(e){
  if(currentCitation){
    // repositionCitation(currentCitation);
    citations.push(currentCitation);
    $(currentCitation).click(function(e){
      if(e.altKey){
        return killAllCitations();
      }
      var i = citations.indexOf(this);
      citations.splice(i, 1);
      $(this).remove();
    });
    currentCitation=false;
  }
  e.preventDefault();
  return false;
}

function bibliographyButton(parentdiv, id){
  var a = DOMAnchor("biblButton", false, false, 
                    bibliographyPage ? "#"+id 
                    : BibliographyPath+"#"+id);
                    // : "../Bibliography/#"+id);
  var div = DOMDiv("bibliographyButton", false, a);
  parentdiv.appendChild(div);
  a.title = "Show entry in bibliography";
  if(!bibliographyPage) {
    a.target = "Bibliography";
  }
//   $(div).click(function(e){
// //    $(this).children("a.biblButton").click();
//     window.location = $(this).children("a.biblButton")[0].href;
//     return false;
//   });
}

function fixLinks(n, citation){
  // A bibliographical entry can easily cite a containing object,
  // usually a book. The containing object needs a bibliography box
  // too, but lacks an index number. Here, we try using the child
  // entry's index. This function finds links in the full reference
  // and works on each. Multiple links are unlikely but, I guess,
  // possible. 0 links will be the most common situation.
  var links = $(citation).find("a[href^=#]").not(".biblButton");
  links.hoverIntent(citationHoverIn, nullHoverOut);
  links.click(pinCitation);
  links.data("refposition", n+0.5);
}

function removeStart(node){
  // This is mostly important to remove the anchor at the beginning of
  // bibliographic references, since otherwise, we'd have a duplicate
  // ID. I'm also using it here, though, to remove the shorthand form
  // of entries
  var el2, el = node.firstChild;
  while(el.tagName!="BR"){
    el2 = el.nextSibling;
    $(el).remove();
    el=el2;
  }
  $(el).remove();
}

function makeCitation(id, n){
  // var entry = BibliographyEntries.filter("has(#"+id+")");
  var entry = $("#"+id, FullBibliography).parents("div").children("p");
  if(entry.length){
    var newNode = entry[0].cloneNode(true);
    currentCitation = DOMDiv("marginalCitation", "mcit-"+id+"---"+n, newNode);
    bibliographyButton(currentCitation, id);
    $(".sidebar2")[0].appendChild(currentCitation);
    fixLinks(n, currentCitation);
//    removeStart(newNode);
//    $(newNode.firstChild).remove();
    $(currentCitation).click(function(e){
      if(e.altKey){
        return killAllCitations();
      }
      currentCitation = false;
      $(this).remove();
    });
    // $(prevdiv).hide();
    return currentCitation;
  }
  return false;
}

function putCitation(id, n){
  $(currentCitation).remove();
  // $(prevdiv).hide();
  return makeCitation(id, n);
}

function positionCitation(event){
  var targetY = $(event.target).offset().top;
  currentCitation.style.top = targetY+"px";
  repositionCitation(currentCitation);
}

function getRef(anchor){
  return anchor.hash.substring(1);
}

function bSearchForPos(pos, a, max, min){
  // Using wikipedia code
  if(max<min){
    console.log([a, max, min]);
    return 0; // something wrong
  } else {
    var mid = Math.floor(max+min/2);
    var midpos = a[mid].getBoundingClientRect().top;
    if(midpos > pos){
      return bSearchForPos(pos, a, mid-1, min)
    } else if (midpos < pos){
      // Value in top part. Check whether this is the last reference
      // before pos first
      if(mid<a.length-1 && a[mid+1].getBoundingClientRect().top >pos){
        return mid+0.5;
      } else {
        return bSearchForPos(pos, a, max, mid+1);
      }
    } else {
      return mid;
    }
  }
}

function posForAnchor(anchor){
  // Some references generated dynamically don't have positions
  // precalculated, so we work out the ordinal position by finding the
  // references immediately before and after ANCHOR.
  return bSearchForPos(anchor.getBoundingClientRect().top, 
                       references, references.length-1, 0);
}

function getN(anchor){
  return $(anchor).data("refposition") || posForAnchor(anchor);
}

function citationHoverIn(e){
  var ref = e.target.href;
  if(ref.indexOf("Images")>-1){
    return imageCitationHoverIn(e);
  }
  var id = getRef(e.target);
  var n = getN(e.target);
  // var id = ref.substring(ref.indexOf("#")+1);
  // var n = $(e.target).data("refposition");
  if (document.getElementById("mcit-"+id+"---"+n)){
    return;
  } else if(!currentCitation){
    makeCitation(id, n);
  } else {
    putCitation(id, n);
  }
  positionCitation(e);
  e.preventDefault();
}
function nullHoverOut(){
  return false;
}
$(function(){
  getReferences();
  if(bibliographyPage){
    $(".contentbox a").filter('[href^=#]').hoverIntent(citationHoverIn, nullHoverOut);
    $(".contentbox a").filter('[href^=#]').click(pinCitation);
  } else {
    $(".contentbox a").filter('[href*="Bibliography"]').hoverIntent(citationHoverIn, nullHoverOut);
    $(".contentbox a").filter('[href*="Bibliography"]').click(pinCitation);
    $(".contentbox a").filter('[href*="Images"]').hoverIntent(previewHoverIn, nullHoverOut);
    $(".contentbox a").filter('[href*="Images"]').click(pinPreview);
  }
  window.onresize = adjustAllDivTops;
});

//////////////////////////////
//
// Image reference
//
var prevdiv, previmg, zoomdiv, pageimg, imgcanvas, imgcontext, prevcan, prevcanimg, prevcontext;
var previews = [];
var z=0;

function zoomFunction(e){
  console.log(++z);
  var thumb = this;
  var canvas = $(this).data("canvas");
  var img = $(this).data("img");
  var prevx = $(thumb).offset().left;
  var prevy = $(canvas).offset().top;
  var prevh = canvas.height;
  var prevw = canvas.width;
  var pw = 600;
  var ph = 300;
  $(zoomdiv).show();
  if(zoomBanner){
    pw = zoomParent.clientWidth - 5;
    if(($(thumb).offset().top-window.scrollY)<ph){
      zoomdiv.style.top = (window.innerHeight-ph)+"px";
    } else {
      zoomdiv.style.top = "0px";
    }
    zoomdiv.style.left = "1px";
  } else {
    zoomdiv.style.left = false;
    if(($(thumb).offset().bottom-window.scrollY)<ph){
      zoomdiv.style.top = $(thumb).offset().top + "px";
    } else {
      zoomdiv.style.top = ($(thumb).offset().top+thumb.clientHeight-ph)+"px";
    }
    pw = zoomParent.clientWidth -10;
  }
  // Now find pointer pos relative to preview
  var posx = (e.pageX-prevx)/prevw;
  var posy = (e.pageY-prevy)/prevh;
  posx *= img.width;
  posy *= img.height;
  console.log([posx, posy, pw, ph]);
  zoomdiv.style.height = ph+"px";
  zoomdiv.style.width = pw+"px";
  imgcanvas.height = ph;
  imgcanvas.width = pw;
  imgcontext.fillStyle = "#999";
  imgcontext.fillRect(0, 0, pw, ph);
  imgcontext.drawImage(prevcanimg, pw/2-posx, ph/2-posy);

}

function killAllPreviews(){
  for(var i=0; i<previews.length; i++){
    $(previews[i]).remove();
  }
  previews = [];
  $(prevdiv).remove();
  prevdiv = false;
}

function pinPreview(e){
  if(prevdiv){
    previews.push(prevdiv);
    prevdiv = false;
  }
  e.preventDefault();
}

function makePreview(path, n, y){
  prevcan = DOMEl("canvas", "thumbcanvas", false);
  prevdiv = DOMDiv("preview marginalCitation", "prev-"+n, prevcan);
  prevcontext = prevcan.getContext("2d");
  prevParent.appendChild(prevdiv);
  prevcanimg = new Image();
  $(prevdiv).data({n: n, path: path, img: prevcanimg, canvas: prevcan, context: prevcontext});
  // prevdiv.style.top = y+"px";
  prevcanimg.onload = function(){
    var w = Math.min(prevParent.clientWidth - 20, this.width);
    var scaleFactor =  w / this.width;
    console.log([w, scaleFactor]);
    prevdiv.style.width = w+"px";
    prevcan.width = w;
    prevcan.height = this.height * scaleFactor;
    console.log([prevdiv.clientHeight, scaleFactor]);
    prevcontext.drawImage(prevcanimg, 0, 0, prevcan.width, prevcan.height);
    if(scaleFactor < 1){
//      var zfun = zoomfunction(prevcanimg);
      $(prevdiv).removeClass("nozoom");
//      prevdiv.onmouseover = showzoom;
      prevdiv.onmouseover = zoomFunction;
//      prevdiv.addEventListener("onmouseover", zfun);
      prevdiv.addEventListener("touchstart", showzoom);
      prevdiv.addEventListener("touchzoom", zoomFunction);
      $(prevdiv).mousemove(zoomFunction);
//      prevdiv.addEventListener("onmousemove", zoomfunction);
      prevdiv.onmouseout = hidezoom;
      prevdiv.onmouseup = hidezoom;
      prevdiv.addEventListener("touchend", hidezoom);
      prevdiv.addEventListener("touchend", hidezoom);
      $(prevdiv).click(function(e){
        if(e.altKey){
          return killAllPreviews();
        }
        prevdiv = false;
        $(this).remove();
      });
    } else {
      $(prevdiv).addClass("nozoom");
      $(prevdiv).unbind();
    }
  };
  prevcanimg.src = path;
}

function putPreview(id, n){
  $(prevdiv).remove();
  return makePreview(id, n);
}

function positionPreview(e){
  var targetY = $(e.target).offset().top;
  prevdiv.style.top = targetY+"px";
  repositionMarginal(prevdiv, previews, [], 0);
}

function previewHoverIn(e){
  var ref = e.target.href;
  n = $(e.target).data("refposition");
  if(document.getElementById("prev-"+n)){
    return;
  } else if(!prevdiv){
    makePreview(ref, n);
  } else {
    putPreview(ref, n);
  }
  positionPreview(e);
  e.preventDefault();
}

$(function(){
  // initialising
  prevParent = rmargin ? $(".sidebar2")[0] : $(".sidebar1")[0];
  zoomParent = zoomBanner ? 
    document.body :
    (rmargin ? $(".sidebar1")[0] : $(".sidebar2")[0]);
  // prevcan = DOMEl("canvas", "thumbcanvas", false);
  // prevdiv = DOMDiv("preview marginalCitation", false, prevcan);
  // prevcontext = prevcan.getContext("2d");
  imgcanvas = DOMEl("canvas", "zoomcan", false);
  zoomdiv = DOMDiv("zoomed", false, imgcanvas);
  if(zoomBanner) {
    zoomdiv.style.position="fixed";
  } else {
    zoomdiv.style.position="absolute";
  }
  imgcontext = imgcanvas.getContext("2d");
  // prevParent.appendChild(prevdiv);
  zoomParent.appendChild(zoomdiv);
  $(zoomdiv).hide();
//  $(prevdiv).hide();
});

function hidezoom(){
  $(zoomdiv).hide();
}
function showzoom(){
  $(zoomdiv).show();
}

// function zoomfunction(img){
//   return function(e){
//     previmg = img;
//     showZoom(e);
//   }
// }

function showpreview(e){
  var prevx = $(prevcan).offset().left;
  var prevy = $(prevcan).offset().top;
  var prevh = prevcan.height;
  var prevw = prevcan.width;
  var pw = 600;
  var ph = 300;
  $(zoomdiv).show();
  if(zoomBanner){
    pw = zoomParent.clientWidth - 5;
    if(($(prevdiv).offset().top-window.scrollY)<ph){
      zoomdiv.style.top = (window.innerHeight-ph)+"px";
//      zoomdiv.style.bottom = "0px";
    } else {
      zoomdiv.style.top = "0px";
    }
    zoomdiv.style.left = "1px";
  } else {
    // zoomdiv.style.position="absolute";
    zoomdiv.style.left = false;
    if(($(prevdiv).offset().bottom-window.scrollY)<ph){
      zoomdiv.style.top = $(prevdiv).offset().top + "px";
    } else {
      zoomdiv.style.top = ($(prevdiv).offset().top+prevdiv.clientHeight-ph)+"px";
    }
    pw = zoomParent.clientWidth -10;
  }
  // Now find pointer pos relative to preview
  var posx = (e.pageX-prevx)/prevw;
  var posy = (e.pageY-prevy)/prevh;
  posx *= prevcanimg.width;
  posy *= prevcanimg.height;
  zoomdiv.style.height = ph+"px";
  zoomdiv.style.width = pw+"px";
  imgcanvas.height = ph;
  imgcanvas.width = pw;
  imgcontext.fillStyle = "#999";
  imgcontext.fillRect(0, 0, pw, ph);
  imgcontext.drawImage(prevcanimg, pw/2-posx, ph/2-posy);
}

function previewImage(path, y){
//  $(currentCitation).remove();
  $(prevdiv).show();
  prevdiv.style.top = y+"px";
  prevcanimg = new Image();
  prevcanimg.onload = function(){
    var w = Math.min(prevParent.clientWidth - 20, this.width);
    var scaleFactor =  w / this.width;
    console.log([w, scaleFactor]);
    prevdiv.style.width = w+"px";
    prevcan.width = w;
    prevcan.height = this.height * scaleFactor;
    prevcontext.drawImage(prevcanimg, 0, 0, prevcan.width, prevcan.height);
    if(scaleFactor < 1){
      var zfun = zoomfunction(prevcanimg);
      $(prevdiv).removeClass("nozoom");
//      prevdiv.onmouseover = showzoom;
      prevdiv.onmouseover = showpreview;
      prevdiv.addEventListener("touchstart", showzoom);
      prevdiv.addEventListener("touchzoom", zfun);
      $(prevdiv).mousemove(zfun);
      prevdiv.onmouseout = hidezoom;
      prevdiv.onmouseup = hidezoom;
      prevdiv.addEventListener("touchend", hidezoom);
      prevdiv.addEventListener("touchend", hidezoom);
    } else {
      $(prevdiv).addClass("nozoom");
      $(prevdiv).unbind();
    }
  };
  prevcanimg.src = path;
}

function imageCitationHoverIn(e){
  var ref = e.target.href;
  if(ref.indexOf("Images")==-1){
    return;
  }
  previewImage(ref, $(e.target).offset().top);
  e.preventDefault();
}
