var theThesis;
var addBit = function(bit){
  this.bits.push(bit);
  if(bit.level && bit.level==="section") bit.chapter = this;
};
var headerText = function(){
  return this.header ? this.header.textContent : false;
};
var major = function(){
  var links = $(this.header).children('a');
  if(!links.length) return false;
  var id = links[0].name;
  var parts = id.split('.');
  var major = parseInt(parts[0]);
  return major ? major : false;
};
var minor = function(){
  var links = $(this.header).children('a');
  if(!links.length) return false;
  var id = links[0].name;
  var parts = id.split('.');
  if(parts.length<2) return false;
  var major = parseInt(parts[1]);
  return major ? major : false;
};
var getThesisStructure = function(thesis){
  var structure = [];
  var content = $('.contentbox > div');
  var chunk=0;
  var prevh1=false;
  var prevh2=false;
  var chap, sect;
  chap = new Chapter(false, thesis);
  sect = new Section(false, thesis);
  chap.addBit(sect);
  structure.push(chap);
  for(var i=0; i<content.length; i++){
//    chunk = parseInt(content[i].className.substring(7), 10);
    chunk = content[i];
    var els = content[i].children;
    for(var j=0; j<els.length; j++){
      if(els[j].tagName==="h1" || els[j].tagName==="H1") {
        prevh1 = els[j];
        sect = new Section(false, thesis);
        prevh2 = false;
        chap = new Chapter(els[j], thesis);
        chap.chunk = content[i];
        chap.addBit(sect);
        structure.push(chap);
      } else if(els[j].tagName==="h2" || els[j].tagName==="H2") {
        prevh2 = els[j];
        sect = new Section(els[j], thesis);
        chap.addBit(sect);
      } else {
        if(sect){
          sect.addBit(els[j]);
        } else if (chap) {
          chap.addBit(els[j]);
        } else {
          structure.push(els[j]);
        }
      }
    }
  }
  return structure;
};
var hideStructure = function(){
  $(this.header).hide();
  for(var i=0; i<this.bits.length; i++){
    if(this.bits[i].level){
      this.bits[i].hide();
    } else {
      $(this.bits[i]).hide();
    }
  };
};
var showStructure = function(){
  $(this.header).show();
  var something = false;
  for(var i=0; i<this.bits.length; i++){
    if(this.bits[i].level){
      if(this.level==='chapter' && this.bits[i].header && something) {
        console.log(i);
        return;
      }
      if(this.bits[i].bits.length){
        this.bits[i].show();
        something = true;
      }
    } else {
      something = true;
      $(this.bits[i]).show();
    }
  };
};
var Section = function(header, thesis){
  this.level = 'section';
  this.header = header;
  this.thesis = thesis;
  this.htext = false;
  this.bits = [];
  this.chapter = false;
  this.minor = minor;
  this.major = function(){ return this.chapter.major(); };
  this.addBit = addBit;
  this.headerText = headerText;
  this.htext = this.headerText();
  this.hide = hideStructure;
  this.show = showStructure;
};
var Chapter = function(header, thesis){
  this.level = 'chapter';
  this.header = header;
  this.thesis = thesis;
  this.tocElement = false;
  this.chunk = false;
  this.htext = false;
  this.bits = [];
  this.major = major;
  this.addBit = addBit;
  this.headerText = headerText;
  this.htext = this.headerText();
  this.ch = this.major;
//  this.hide = function(){$(this.chunk).hide();};
  this.hide = hideStructure;
  this.show = showStructure;
};
function elementCopyMutate(element, newElementType){
  var el = document.createElement(newElementType);
  for(var i=0; i<element.childNodes.length; i++){
    el.appendChild(element.childNodes[i].cloneNode(true));
  }
  return el;
}
function killLinks(element){
  var links = $(element).children('a');
  for(var i=0; i<links.length; i++){
    var parent = links[i].parentNode;
    parent.replaceChild(elementCopyMutate(links[i], 'span'), links[i]);
  }
}
function tocElement(element, tocclass){
  var div = elementCopyMutate(element, 'div');
  div.className = tocclass;
  killLinks(div);
  return div;
};
function showSection(e){
  var obj = $($(e.target).parents('div')[0]).data('unit');
  obj.thesis.exposeSection(obj);
  return false;
};
function showTOCSection(e){
  var obj = $($(e.target).parents('div')[0]).data('unit');
  if(!obj) obj = $(e.target).data('unit');
  TOCRedraw(obj);
  obj.thesis.exposeSection(obj);
  return false;
};
function makeSectionContents(chapter, div){
  for(var i=0;i<chapter.bits.length; i++){
    var bit = chapter.bits[i];
    if(bit.level && bit.header){
      // This is actually a heading rather than just text
      var li = DOMListItem();
      div.appendChild(li);
      var sectDiv = tocElement(bit.header, 'toc2');
      li.appendChild(sectDiv);
      $(sectDiv).data('unit', bit);
      $(sectDiv).click(showSection);
    }
  }
}
function makeContents(parent){
  var div = DOMDiv('toc');
  parent.appendChild(div);
  var list = document.createElement('ul');
  div.appendChild(list);
  var chap, li;
  var sect;
  var chapdiv;
  for(var i=0; i<this.chapters.length; i++){
    li = DOMListItem();
    list.appendChild(li);
    chap = this.chapters[i];
    chap.tocElement = li;
    if(chap.header){
      chapdiv = tocElement(chap.header, 'toc1');
      li.appendChild(chapdiv);
    } else {
      if(chap.bits[0].level){
        if(chap.bits[0].header){
          chapdiv = tocElement(chap.bits[0].header, 'toc1');
        } else {
          chapdiv = tocElement(chap.bits[0].bits[0], 'toc1');          
        }
      } else {
        chapdiv = tocElement(chap.bits[0], 'toc1');
      }
      li.appendChild(chapdiv);
    }
    $(chapdiv).find("br").remove();
    $(chapdiv).data('unit', chap);
//    $(chapdiv).click(showSection);
    $(chapdiv).click(showTOCSection);
    var newList = document.createElement('ul');
    li.appendChild(newList);
    makeSectionContents(chap, newList);
    if(newList.children.length===0) {
      li.removeChild(newList);
    } else if(chapdiv) {
      $(newList).hide();
    }
  }
};
function exposeSection(section){
  this.current = section;
  if(this.first(section)) disablePrev();
  if(this.last(section)) disableNext();
  var targetChapter = (section.level==='chapter' ? section : section.chapter);
  for(var i=0; i<this.chapters.length; i++){
    if(this.chapters[i]===targetChapter){
      if(targetChapter===section){
        this.chapters[i].show();
      } else {
        for(var j=0; j<targetChapter.bits.length; j++){
          if(targetChapter.bits[j]===section){
            section.show();
          } else {
            targetChapter.bits[j].hide();
          }
        }
      }
    } else {
      this.chapters[i].hide();
    }
  }
};
function TOCRedraw(chapter){
  var chapters = chapter.thesis.chapters;
  for(var i=0; i<chapters.length; i++){
    if(chapters[i]===chapter){
      $(chapter.tocElement).children('ul').show();
      $(chapter.tocElement).children('div').addClass('current');
    } else {
      $(chapters[i].tocElement).children('div').removeClass('current');
      $(chapters[i].tocElement).children('ul').hide();
    }
  }
};
function initialiseThesis(){
  $(".contentbox > div").css("display", "block");
  this.chapters[0].show();
  for(var i=1; i<this.chapters.length; i++){
    this.chapters[i].hide();
  }
};
var next = function(section){
  var pos;
  if(section.level==="chapter"){
    for(var i=0; i<section.bits.length; i++){
      if(section.bits[i].level){
        return section.bits[i];
      }
    }
    pos = this.chapters.indexOf(section)+1;
    if(pos===this.chapters.length) return section;
    return this.chapters[pos];
  } else {
    for(var i=section.chapter.bits.indexOf(section)+1; i<section.chapter.bits.length; i++){
      if(section.chapter.bits[i].level) return section.chapter.bits[i];
    }
    pos = this.chapters.indexOf(section.chapter)+1;
    if(pos===this.chapters.length) return section;
    return this.chapters[pos];
  }
};
var prev = function(section){
  var pos;
  if(section.level==="chapter"){
    pos=this.chapters.indexOf(section);
    if(pos) {
      return this.chapters[pos-1];
    } else return section;
  } else {
    pos = section.chapter.bits.indexOf(section);
    if(!pos) return this.prev(section.chapter);
    for(var i=pos-1; i>=0; i--){
      if(section.chapter.bits[i].level) return section.chapter.bits[i];
    }
    return this.prev(section.chapter);
  }
};
var last = function(section){
  return this.next(section)===section;
};
var first = function(section){
  return this.prev(section)===section;
};
var Thesis = function(){
  this.chapters = getThesisStructure(this);
  this.sections = [];
  this.current = false;
  this.makeContents = makeContents;
  this.exposeSection = exposeSection;
  this.initialise = initialiseThesis;
  this.next = next;
  this.prev = prev;
  this.last = last;
  this.first = first;
  this.initialise();
};

$().ready(function(){ 
  theThesis = new Thesis; theThesis.makeContents($('.sidebar1 div.contentbox')[0]);
});
