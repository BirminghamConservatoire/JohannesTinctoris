/**
 * @fileoverview Contains container classes for music, like MusicHolder and MusicExample
 * @namespace music-container
 */

 /** @class
 * @memberof music-container
 */
function MusicHolder(text, outdiv){
    /** @property {MusicHolder} */
    this.text = text;
    /** @property {MusicHolder} */
    this.prevWidth = false;
    /** @property {MusicHolder} */
    this.forceredraw = true;
    /** @property {MusicHolder} */
    this.footnotes = [];
    /** @property {MusicHolder} */
    this.example = false;
    /** @property {MusicHolder} */
    this.out = outdiv ? outdiv : document.getElementById('content');
    /** @property {MusicHolder} */
    this.drawTo = this.out;
    /** @property {MusicHolder} */
    this.drawTo.classList.add("drawTo");
    /** @property {MusicHolder} */
    this.entered = false;
    /** @property {MusicHolder} */
    this.shortTitle = false;
    /** @property {MusicHolder} */
    this.checked = false;
    /** @property {MusicHolder} */
    this.approved = false;
    /** @property {MusicHolder} */
    this.translator = false;
    /** @property {MusicHolder} */
    this.contents = [];
    /** @property {MusicHolder} */
    this.copy = false;
    /** @property {MusicHolder} */
    this.source = false;
    /** @property {MusicHolder} */
    this.established = false;
    /** @property {MusicHolder} */
    this.basefile = false;
    /** @property {MusicHolder} */
    this.basefiles = false;
    /** @property {MusicHolder} */
    this.source = false;
    /** @property {MusicHolder} */
    this.title = false;
    /** @property {MusicHolder} */
    this.attribution = false;
    /** @property {MusicHolder} */
    this.sources = [];
    /** @property {MusicHolder} */
    this.running = false;
    /** @property {MusicHolder} */
    this.scriptSpec = false;
    /** @property {MusicHolder} */
    this.script = false;
    /** @property {MusicHolder} */
    this.editor = false;
    /** @property {MusicHolder} */
    this.columns = false;
    /** @property {MusicHolder} */
    this.hands = [];
    /** @property {MusicHolder} */
    this.UUIDs = {};
    /** @property {MusicHolder} toggle if variants should be displayed */
    this.showvars = false;
    /** infoButton
     * @summary infoButtons (qv) presents several buttons for different bits of info.
    */
    this.infoButton = function(){
      // this.infoButtons (qv) presents several buttons for different bits of
      // info. Let's try a less complex approach -- just one button
      var ib = this.drawTo.appendChild(DOMDiv('infoButtons'), false, false);
      infoButton("i", ["editor", "checkedby", "enteredby", "approvedby","dateestablished",
                       "source", "sources", "translator", "copytext", "basefile","script", "columns", "running"], 
                 ib, infoDisplay == "show", "infoDisplay");
    };
    /** infoButton */
    this.infoButtons = function(){
      var ib = this.drawTo.appendChild(DOMDiv('infoButtons'), false, false);
      if(this.editor || this.entered || this.checked || this.approved){
        if(editorDisplay == "show" || editorDisplay == "hide"){
          infoButton("e", ["editor", "checkedby", "enteredby", "approvedby"], ib,
            editorDisplay == "show", "editorDisplay");
        }
      }
      if(this.established){
        if(dateDisplay == "show" || dateDisplay == "hide"){
          infoButton("d", ["dateestablished"], ib,
            dateDisplay == "show", "dateDisplay");
        }
      }
      if(this.source || this.sources.length){
        if(sourceDisplay == "show" || sourceDisplay == "hide"){
          infoButton("s", ["source", "sources"], ib,
            sourceDisplay == "show", "sourceDisplay");
        }
      }
      if(this.copy){
        if(copyTextDisplay == "show" || copyTextDisplay == "hide"){
          infoButton("c", ["copytext"], ib,
          copyTextDisplay == "show", "copyTextDisplay");
        }
      }
      if(this.basefile){
        if(baseFileDisplay == "show" || baseFileDisplay == "hide"){
          infoButton("c", ["basefile"], ib,
          baseFileDisplay == "show", "baseFileDisplay");
        }
      }
      if(this.running){
        if(extraInfoDisplay == "show" || extraInfoDisplay == "hide"){
          infoButton("+", ["script", "columns", "running"], ib,
          copyTextDisplay == "show", "extraInfoDisplay");
        }
      }
    };
    /** writeHeaders to content */
    this.writeHeaders = function(){
      var headerdiv = DOMDiv("musicHeader", "musicHeader","");
      var detailDiv = DOMDiv("infoDetails", "infoDetails","");
      this.drawTo.appendChild(headerdiv);
      if(this.title && showtitle){
        headerdiv.appendChild(DOMTextEl("h2", "title", false, this.title));
      }
      if(this.attribution && showtitle)
      {
        headerdiv.appendChild(DOMTextEl("hi", "attribution", false, this.attribution));
      }
      if(infoButtons){
        // this.infoButtons();
        this.infoButton();
      }
      if(cpw)
      {
        $(detailDiv).addClass("collapse");
        var dummySpan = DOMSpan("d-block", "infoSpan", "");
        var infoButton = DOMAnchor("btn btn-outline-dark btn-sm", "infoButton", "", "#infoDetails");
        $(infoButton).attr({
          "data-toggle": "collapse"
        });
        $(infoButton).append("<i class='bi bi-info-lg'></i>");
        dummySpan.appendChild(infoButton);
        headerdiv.appendChild(dummySpan);
      }
      headerdiv.appendChild(detailDiv);
      if(this.translator){
        detailDiv.appendChild(fieldDatumPair("Translator", this.translator));
        if(editorDisplay == "hide" || !editorDisplay) $(".info.translator").hide();
      }
      if(this.editor){
        detailDiv.appendChild(fieldDatumPair("Editor", this.editor));
        if(editorDisplay == "hide" || !editorDisplay) $(".info.editor").hide();
      }
      if(this.entered){
        detailDiv.appendChild(fieldDatumPair("Entered by", this.entered));
        if(editorDisplay == "hide" || !editorDisplay) $(".info.enteredby").hide();
      }
      if(this.checked){
        detailDiv.appendChild(fieldDatumPair("Checked by", this.checked));
        if(editorDisplay == "hide" || !editorDisplay) $(".info.checkedby").hide();
      }
      if(this.established){
        detailDiv.appendChild(fieldDatumPair("Date established", this.established));
        if(dateDisplay == "hide" || !dateDisplay) $(".info.dateestablished").hide();
      }
      if(this.approved){
        detailDiv.appendChild(fieldDatumPair("Approved by", this.approved));
        if(editorDisplay == "hide" || !editorDisplay) $(".info.approvedby").hide();
      }
      if(this.copy){
        detailDiv.appendChild(fieldDatumPair("Copy text", this.copy));
        if(copyTextDisplay == "hide" || !copyTextDisplay) $(".info.copytext").hide();
      }
      if(this.basefile){
        detailDiv.appendChild(fieldDatumPair("Base transcription", this.basefile));
        if(baseFileDisplay == "hide" || !baseFileDisplay) $(".info.basefile").hide();
      }
      if(this.source){
        detailDiv.appendChild(fieldDatumPair("Source", this.source));
        if(sourceDisplay == "hide" || !sourceDisplay) $(".info.source").hide();
      }
      if(this.script){
        detailDiv.appendChild(fieldDatumPair("Script", this.script));
        if(extraInfoDisplay == "hide" || !extraInfoDisplay) $(".info.script").hide();
      }
      if(this.columns){
        detailDiv.appendChild(fieldDatumPair("Columns", ""+this.columns));
        if(extraInfoDisplay == "hide" || !extraInfoDisplay) $(".info.columns").hide();
      }
      if(this.running){
        detailDiv.appendChild(fieldDatumPair("Running", this.running));
        if(extraInfoDisplay == "hide" || !extraInfoDisplay) $(".info.running").hide();
      }
      if(this.sources.length){
        var div = DOMDiv('info sources', false, false);
        div.appendChild(DOMSpan('fieldname', false, "Sources: "));
        for (var i=0; i<this.sources.length; i++){
          div.appendChild(this.sources[i].toHTML());
        }
        detailDiv.appendChild(div);
        if(sourceDisplay == "hide" || !sourceDisplay) $(".info.sources").hide();
      }
    };
    /** parseHeaders from codeDiv(?) */
    this.parseHeaders = function(){
          // Check if there's either just one line or no textual content
          // before a <piece pseudo-element
      if(!/[\r\n][^\r\n]+/.exec(string) || /^[^a-zA-Z]*<piece/.exec(string)) {
        // Just one line. Assume it's content
              console.log("No header found in ", string);
        return;
      }
          // FIXME: will this be a problem for titles with Colons?
          consumeSpace();
          var title = consumeIf(/[^\r\n:]*[\r\n]/)
      if(title) {
              this.title = trimString(title);
              consumeSpace();
              var attribution = consumeIf(/[^\r\n:]*[\r\n]/)
              if(attribution) this.attribution = trimString(attribution);
          }
      consumeSpace();
      var nextfield=consumeIf(/[^:]*:/);
      while(nextfield){
        switch (nextfield){
          case "Data entry:":
            this.entered = trimString(consumeIf(/[^\r\n]*[\r\n]*/));
            break;
          case "Short-title:":
            this.shortTitle = trimString(consumeIf(/[^\r\n]*[\r\n]*/));
            break;
          case "Checked by:":
            this.checked = trimString(consumeIf(/[^\r\n]*[\r\n]*/));
            break;
          case "Approved by:":
            this.approved = trimString(consumeIf(/[^\r\n]*[\r\n]*/));
            break;
          case "Translator:":
            this.translator = trimString(consumeIf(/[^\r\n]*[\r\n]*/));
            break;
          case "Copy-text:":
            this.basefile = trimString(consumeIf(/[^\r\n]*[\r\n]*/));
            break;
          case "Base file:":
            this.basefile = trimString(consumeIf(/[^\r\n]*[\r\n]*/));
            break;
          case "Base transcription:":
            this.basefile = trimString(consumeIf(/[^\r\n]*[\r\n]*/));
            break;
          case "Base files:":
            this.basefiles = trimString(consumeIf(/[^\r\n]*[\r\n]*/)).split(", ");
            break;
          case "Editor:":
            this.editor = trimString(consumeIf(/[^\r\n]*[\r\n]*/));
            break;
          case "Source:":
            this.source = trimString(consumeIf(/[^\r\n]*[\r\n]*/));
            break;
          case "Script:":
            this.scriptSpec = trimString(consumeIf(/[^\r\n]*[\r\n]*/));
            var colon = this.scriptSpec.indexOf(":");
            var comma = this.scriptSpec.indexOf(",");
            if(comma){
              // We have a column spec
              var columnbit = trimString(this.scriptSpec.substring(comma+1));
              this.script = trimString(this.scriptSpec.substring(colon+1, comma));
              if(columnbit.length){
                this.columns = Number(columnbit.split(/\s+/)[0]);
              }
            } else {
              this.script = trimString(this.scriptSpec.substring(colon+1));
            }
            break;
          case "Running heads:":
            this.running = trimString(consumeIf(/[^\r\n]*[\r\n]*/));
            if(this.running == "[none]"){
              this.running = false;
            }
            break;
          case "Date established:":
            this.established = trimString(consumeIf(/[^\r\n]*[\r\n]*/));
            break;
          case "Sources:":
            consumeSpace();
            var id, details;
            while(string.substring(0,10)!="<treatise>" && string.length
                                  && !/^\n\n/.exec(string) && string.substring(0, 6)!="<piece"){
              id = consumeIf(/\S*/);
              consumeSpace();
              details = trimString(consumeIf(/[^\n\r]*/));
              this.sources.push(new Source(id, details));
              if(!/^\n\n/.exec(string)) consumeSpace();
            }
            break;
          default:
            // We've over-reached
            unRead(nextfield);
            return;
        }
        nextfield = consumeIf(/[^:\r\n]*:/);
      }
    };
    /** parse from codediv */
      this.parse = function(){
          // FIXME: Check what these do:
          resetAnnotations();
      resetDebugger();
          string = text;
          this.parseHeaders();
          // This is basically just a holder for a single piece, so let's find it
          var start = string.indexOf("<piece")+7;
          var end = string.indexOf("</piece>");
          if(end<-1) end = this.text.length;
          string = string.substring(start, end);
          try{
              this.example = new MusicExample();
          } catch(x){
              console.log(x.stack);
              console.log("error parsing example", currentExample);
              this.example = currentExample
              return false;
          }
          this.contents = [this.example];
    };
    /** Gets converted MEI and provides MEI links */
      this.toMEI = function(){
          var docObj = this.example.toMEI();
          var oldLink = document.getElementById('MEILink');
          if(oldLink) oldLink.parentNode.removeChild(oldLink);
          var oldDownload = document.getElementById('MEIdownload');
          if (oldDownload) oldDownload.parentNode.removeChild(oldDownload);
          this.UUIDs = {};
          //var MEIcoded = btoa(docObj.serialize());
          var MEIcoded = docObj.blobify();
          this.example.MEIcoded = MEIcoded;
          var anchor = DOMAnchor('MEI', 'MEILink', 'MEI', URL.createObjectURL(MEIcoded));
          var anchor2 = DOMAnchor('MEI', 'MEIdownload', ' download', URL.createObjectURL(MEIcoded));
          this.example.MEILink = anchor;
          //this.example.VerovioLink = anchor2;
          anchor2.setAttribute('download', 'editor.mei');
          //anchor2.setAttribute('target', 'viewer');
          anchor.setAttribute('target', '_blank');
          //document.body.appendChild(anchor);
          if(!document.getElementById("MEILink"))
          {
            if(this.drawTo)
            {
              this.drawTo.prepend(anchor);
            }
            else
            {
              document.body.appendChild(anchor);
            }
          } 
          if(!document.getElementById("MEIdownload"))
          {
            if(this.drawTo)
            {
              this.drawTo.prepend(anchor2);
            }
            else
            {
              document.body.appendChild(anchor2);
            }
          } 
          return docObj.serialize();
    };
    /** appendStaffDefs */
      this.appendStaffDefs = function(doc, el){
      var group = doc.createElementNS("http://www.music-encoding.org/ns/mei", "staffGrp");
      el.appendChild(group);
      if(this.example.parts && this.example.parts.length){
        for(var i=0; i<this.example.parts.length; i++){
                  if(!this.example.parts[i].closes && this.example.parts[i].type==="part") {
                      group.appendChild(this.staffDefForPart(this.example.parts[i], i+1, doc));
                  }
        }
      } else {
              sd = doc.createElementNS("http://www.music-encoding.org/ns/mei", "staffDef");
              var p = this.example.parameters;
              var c = p.getClef();
              sd.setAttributeNS(null, "n", 1);
              sd.setAttributeNS(null, "lines", (p.staff.lines || 15));
              if(c){
                  sd.setAttributeNS(null, "clef.line", (c.staffPos/2) - 1);
                  sd.setAttributeNS(null, "clef.shape", (c.type || "C"));
              }
              group.appendChild(sd);
          }
    };
    /** staffDeff for Parts */
    this.staffDefForPart = function(part, n, doc){
      var sd = doc.createElementNS("http://www.music-encoding.org/ns/mei", "staffDef");
      var relevantStaff = part.applicableStaff();
      sd.setAttributeNS(null, "n", n);
      sd.setAttributeNS(null, "lines", relevantStaff.trueLines());
      return sd;
    };
    /** draw */
    this.draw = function(rowCols, choirbook, pagination){
      state = "Starting to draw";
      curDoc = this;
      //editable=true;
      this.footnotes = [];
      if(!this.forceredraw && this.out.childNodes.length){
          return;
      }
      state = "emptying drawTo (.draw())";
      $(this.drawTo).empty();
      // width of content div depends on editor or viewer
      if(standaloneEditor)
      {
        this.drawTo.style.width = (wrapWidth+20)+"px";
        this.showvars = showvariants;
      }
      /*else
      {
        this.drawTo.style.width = wrapWidth+"px";
      }*/
      // writing header info
      this.writeHeaders();

      var oldshowvariants = showvariants;
      showvariants = this.showvars;

      // start drawing music
      var musicDiv = DOMDiv("music row row-cols-" + rowCols, "music");
      this.drawTo.appendChild(musicDiv);
      // split every part of this.example into a single music example
      // every part will be rendered into a separate div
      // if partwise MEI export is needed, make partExamples a property of MusicHolder
      var partExamples = this.splitParts();
      // choirbook toggles whether splitting at <pars> should happen, pagination in choir book format?
      $(this.drawTo).removeClass("nowrap");
      for(let i=0;i<partExamples.length;i++)
      {
        let partPair = partExamples[i];
        let partDiv = DOMDiv("musicPart col mb-3");
        let partDivID;
        let partDivTitle;

        if(partPair[0].includes("2"))
        {
          let lastPartDiv = document.getElementById(partExamples[i-1][0]);
          partDivTitle = partPair[0];
          partDivID = partDivTitle.replace(" ", "");
          //partDiv.setAttribute("title", partDivTitle);
          partDiv.id = partDivID;
          let combinedDiv = DOMDiv("musicPanel col mb-3 p-0", lastPartDiv.id + "1+2");
          musicDiv.appendChild(combinedDiv);
          combinedDiv.appendChild(lastPartDiv);
          combinedDiv.appendChild(partDiv);
          $(lastPartDiv).removeClass("musicPanel");
          //$(partDiv).removeClass("mb-3");
        }
        else 
        {
          musicDiv.appendChild(partDiv);
          partDivTitle = partPair[0];
          partDivID = partDivTitle.replace(" ", "");
          //partDiv.setAttribute("title", partDivTitle);
          partDiv.id = partDivID;
          partDiv.className += " musicPanel";
        }

        // check for pagination
        if(pagination===true)
        {
          let partPartes = splitPars(partPair[1]);

          for(let parsPair of partPartes)
          {
            let parsDiv = DOMDiv("musicPars "+parsPair[0], partDivID + parsPair[0]);
            partDiv.appendChild(parsDiv);

            state = "creating new svg – requires width and height";
            var parsSVG = svg(parsPair[1].width(), parsPair[1].height());
            state = "adding SVG to drawTo";
            parsDiv.appendChild(parsSVG);
            parsSVG.className += " musicexample dc1";
            parsPair[1].SVG = parsSVG;
            state = "drawing";
            parsPair[1].draw(parsSVG, true);
          }
        }
        else
        {
          state = "creating new svg – requires width and height";
          var partSVG = svg(partPair[1].width(), partPair[1].height());
          state = "adding SVG to drawTo";
          partDiv.appendChild(partSVG);
          partSVG.className += " musicexample dc1";
          partPair[1].SVG = partSVG;
          state = "drawing";
          partPair[1].draw(partSVG, true);
        }
        

        if(choirbook)
        {
          // Adjust ordering of the parts in choirbook format
          if(partDivID.includes("Tenor"))
          {
            let partDiv = document.getElementById(partDivID);
            $(partDiv).addClass("order-2");
          }
          else if(partDivID.includes("Bassus"))
          {
            let partDiv = document.getElementById(partDivID);
            $(partDiv).addClass("order-last");
          }
        }
      }
      // I don't know why, but without putting it into console.log(), no MEI will be created...
      console.log(this.toMEI());
      showvariants = oldshowvariants;
    };
    /** header text */
    this.headerText = function(){
      var text = (this.title ? this.title : "")+"\n";
      if(this.shortTitle) text += "Short-title: "+this.shortTitle+"\n";
      if(this.editor) text += "Editor: "+this.editor+"\n";
      if(this.translator) text += "Translator: "+this.translator+"\n";
      if(this.entered) text += "Data entry: "+this.entered+"\n";
      if(this.checked) text += "Checked by: "+this.checked+"\n";
      if(this.established) text += "Date established: "+this.established+"\n";
      if(this.approved) text += "Approved by: "+this.approved+"\n";
      if(this.copy) text += "Copy-text: "+this.copy+"\n";
      if(this.source) text += "Source: "+this.source+"\n";
      if(this.basefile) text += "Base transcription: "+this.basefile+"\n";
      if(this.script || this.columns){
        text += "Script: ";
        if(this.script) text += this.script;
        if(this.columns) text += ", "+this.columns+" column"+(this.columns>1 ? "s" : "") + " per page";
        text += "\n";
      }
      if(this.running) {
        text += "Running heads: "+this.running+"\n";
      } else if(this.source){
        // this isn't a multiple-source edition
        text += "Running heads: [none]\n";
      }
      if(this.sources.length) {
        text += "Sources:\n";
        for(var i=0; i<this.sources.length; i++){
          text += this.sources[i].toText();
        }
      }
      return text;
    };
    this.toText = function(){
        var text = "";
        text += this.headerText();
        return text + this.example.toText();
    };
    /** splits MusicHolder.example into a single example per part to render it in single divs */
    this.splitParts = function(){
      var exampleParts = [];
      var partCounter = 0;
      var fullExampleCode = this.example.code;
      var pieceEnd = fullExampleCode.indexOf(">")+1;
      var pieceString = fullExampleCode.substring(0,pieceEnd);
      let partNames = [];
      // MusicExamples need to be parsed properly to work
      // Splitting a MusicExample into its parts needs to be stupid string manipulation...
      for(let i = 0; i < this.example.parts.length; i=i+2)
      {
        let part = this.example.parts[i];
        partCounter++;
        let partStart = fullExampleCode.indexOf("<part: ");
        let partEnd = fullExampleCode.indexOf("</part>")+7;
        let partString = pieceString + fullExampleCode.substring(partStart,partEnd);
        string = partString;
        let partExample;
        try{
          partExample = new MusicExample();
        } catch(x){
            console.log(x.stack);
            console.log("error parsing example");
            return false;
        }

        // partName will become the div id, try to make it unique
        // Something like Tenor2 is not elaborate but will hopefully work for all realistic cases
        let partName = partNames.indexOf(part.defaultName()) >= 0 ? 
                      part.defaultName() + "2" : part.defaultName();
        partNames.push(partName);
        exampleParts.push([partName, partExample]);
        // cut part from example
        fullExampleCode = fullExampleCode.slice(partEnd);
        fullExampleCode = fullExampleCode.trim();
        if(fullExampleCode.startsWith("{staf:"))
        {
          let firstCloseCurly = fullExampleCode.indexOf("}")+1;
          let staffSubString = fullExampleCode.substring(0,firstCloseCurly);
          let lineNumPos = staffSubString.match(/\d/).index;
          let lineNum = staffSubString[lineNumPos];
          let currentPieceLinesNum =pieceString.match(/\d/).index;
          let currentPieceLines = pieceString[currentPieceLinesNum];

          if(lineNum != currentPieceLines)
          {
            pieceString = pieceString.replace(currentPieceLines,lineNum);
          }

          fullExampleCode.slice(firstCloseCurly);
        }
        fullExampleCode = pieceString + fullExampleCode;
        console.log("sliced part no. " + partCounter);
      }

      return exampleParts;
    };
      this.parse();
  }

  function splitPars(part)
  {
    var partParses = [];
    var parses = part.events.filter(event => event.objType==="Part" && event.type==="pars" && event.closes===false);
    var parscounter = 1;
    var fullPartCode = part.code;

    var firstParsStart = fullPartCode.indexOf("<pars")+1;
    // having the partname in every pars shows it at every page
    var partString = fullPartCode.substring(0,firstParsStart-1);

    var currentClefString;
    var currentSolmString;

    // MusicExamples need to be parsed properly to work
    // Splitting a MusicExample into its parses needs to be stupid string manipulation...
    // see MusicExample.splitParts()
    for(parscounter; parscounter <= parses.length; parscounter++)
    {
      let parsStart = fullPartCode.indexOf("<pars");
      let parsEnd = fullPartCode.indexOf("</pars>")+7;
      let parsString = fullPartCode.substring(parsStart,parsEnd);

      // we need to take clef and solm from last pars if there is none
      // make sure, that only a clef and a solm at the start of a pars is found
      // we're looking for the first string because we hope this isn't inside a variant
      // unfortunately, we're not able to deal with clefs in variants, or even determine the default reading without parsing
      // this solution is definitely errorneuous, but it likely won't break at least...

      let firstSolmPos = parsString.indexOf("{solm:");
      if(firstSolmPos != -1)
      {
        let foundSolmString = parsString.substring(firstSolmPos, parsString.indexOf("}", firstSolmPos)+1);
        // if there is already a solm, use that
        if(currentSolmString!=null)
        {
          parsString = parsString.slice(0,6) + currentSolmString + parsString.slice(6);
        }
        currentSolmString = foundSolmString;
      }
      else
      {
        parsString = parsString.slice(0,6) + currentSolmString + parsString.slice(6);
      }

      let firstClefPos = parsString.indexOf("{clef:");  
      if(firstClefPos != -1)
      {
        let foundClefString = parsString.substring(firstClefPos, parsString.indexOf("}",firstClefPos)+1);
        // if there is already a clef, use that
        if(currentClefString!=null)
        {
          parsString = parsString.slice(0,6) + currentClefString + parsString.slice(6);
        }
        currentClefString = foundClefString;
      }
      else
      {
        parsString = parsString.slice(0,6) + currentClefString + parsString.slice(6);
      }

      // add part tag to have the part name in every pars
      parsString = partString + parsString;

      // add part closing tag here to ensure proper parsing without disturbing string slicing
      string = parsString + "</part>";
      let parsExample;
      
      try{
        parsExample = new MusicExample();
      } catch(x){
          console.log(x.stack);
          console.log("error parsing example");
          return false;
      }

      // parsNumber will become the div id, try to make it unique
      partParses.push([parscounter, parsExample]);
      fullPartCode = partString + fullPartCode.slice(parsEnd);
      console.log("sliced pars no. " + parscounter);
    }

    return partParses;
  }

// end of MusicHolder
//-------------------------------------------------------------------------------//  

 /**
  * @class
  * @classdesc Create Music example object.
  * @memberof music-container
  */
function MusicExample(){
    /** @property {string} objType
     * @summary string with object type
     */
    this.objType = "MusicExample";
    /** @property {string} code
     * @summary String with code in JT text format
     */
    this.code = string;
    /** @property {DOMElement} SVG
     * @summary rendered SVG
     */
    this.SVG = false;
    /** @property counter */
    this.counter = false;
    /** @property context */
    this.context = false;
    /** @property {Array} events
     * @summary Contains all the musical events
     */
    this.events = [];
    /** @property {Array} comments
     * @summary Array with all comments
     */
    this.comments = [];
    /** @property {Array} textObjects */
    this.textObjects = [];
    /** @property {number} drawCount */
    this.drawCount = 0;
    /** @property starts */
    this.starts = pointer;
    /** @property swidth */
    this.swidth = false;
    /** @property classes */
    this.classes = false;
    /** @property marginSpace */
    this.marginSpace = false;
    /** @property {Array}  marginalia*/
    this.marginalia = [];
    /** @property {Array} catchwords */
    this.catchwords = [];
    /** @property curCatchword */
    this.curCatchword = curCatchword;
    /** @property {Parameters} parameters */
    this.parameters = false;
    /** @property bbox */
    this.bbox = false;
    /** @property {Array} colbreaks */
    this.colbreaks = [];
    /** @property book */
    this.book = book;
    /** @property chapter */
    this.chapter = chapter;
    /** @property section */
    this.section = section;
    /** @property exampleno */
    this.exampleno = exampleno;
    /** @property {Array} exampleBreaks */
    this.exampleBreaks = [];
    /** @property {Array} staves */
    this.staves = [];
    /** @property {Array} parts */
    this.parts = [];
    /** @property {Array} done */
    this.done = [];
    /** @property {Object} UUIDs */
    this.UUIDs = {};
    /** @property MEI */
    this.MEI = false;
    /** @property {DOMElement} MEILink
     * @summary Link element to MEI doc
     */
    this.MEILink = false;
    /** @property MEIcoded */
    this.MEIcoded = false;
    /** @property {DOMElement} VerovioLink
     * @summary Link element to Verovio
     */
    this.VerovioLink = false;
    exampleno++;
    /** @property atClass */
    this.atClass = "at-"+this.book+"-"+this.chapter+"-"+this.section+"-"+this.exampleno;
    /**
     * Parses a MusicExample from string on top level. 
     * Parsing of lower levels is done by nextMusic()
     * @see nextMusic
     */
    this.parse = function(){
      this.staves = [];
      this.parts = [];
      var augmented = false;
      this.classes = new Classes();
      string = this.code;
      // Hacky fix for the problem of double asterisks in **
      // annotations: \** is converted to (the hopefully meaningless)
      // @@@@, and then back later
      string = string.replace(/\\\*\*/g, "@@@@");
      currentExample = this;
      initialStaffStar = false;
      var next;
      var length, prev;
          var openParts =[];
      currentClef = false;
      currentSolm = false;
          currentProp = 1;
      consumeSpace();
      this.parameters = getParameters();
      currentInfo = this.parameters;
      this.w2 = [];
      consumeSpace();
      while(string.length >0)
      {
        length = string.length;
        next = nextEvent();
        if(next)
        {
          if(prev) 
          {
            prev.next = next;
            next.previous = prev;
          }
          if(next.objType==="Part") 
          {
                      currentProp = 1;
                      next.wordNo = this.events.length;
            if(next.closes)
            {
                          let lastEl = openParts.pop();
                          if(next.type=="part")
                          {
                            currentClef = false;
                            currentSolm = false;
                          }
              if(lastEl)
              {
                              next.startEl = lastEl;
                              next.startEl.endEl = next;
              } 
              else 
              {
                              console.log("missed", this.events.slice(this.events.length -10));
                          }
            } 
            else 
            {
              if(openParts.length)
              {
                              let lowestOpen = openParts[openParts.length-1];
                              lowestOpen.contains.push(next);
                              next.parent = lowestOpen;
              } 
              else 
              {
                              console.log(next.type);
                          }
                          openParts.push(next);
                      }
                  }
                  if(next.changesProportion && next.changesProportion()) currentProp = next.proportionChangesTo;
                  if(next.objType==="Part" && next.type==="part") this.parts.push(next);
                  if(next.objType==="MusicalChoice" && next.hasPart()) this.parts.push(next.hasPart());
          if(currentInfo)
          {
            if(infop(next))
            {
              currentInfo.extras.push(next);
              next.params = currentInfo;
              if(next.objType=="MusicalChoice") next.addParams(currentInfo);
            } 
            else if(!ignorable(next))
            {
              currentInfo = false;
            }
          } 
          else if(next.objType==="Staff")
          {
            if(prev.objType="Part" || prev.subType=="part")
            {
                          prev.staff = next;
                          next.part = prev;
                      }
            currentInfo = next;
            for (var i=this.events.length-1; i>0; i--)
            {
              if(this.events[i].objType==="TextUnderlay")
              {
                this.events[i].marginal="r";
                break;
              } 
              else if(this.events[i].objType!="NegativeSpace")
              {
                break;
              }
            }
          }
          if(next.objType==="SolmizationSignature" 
             && this.events.length && this.events[this.events.length-1].objType==="Clef")
              {
                this.events[this.events.length-1].solm = next;
              }
          if(next.objType=="Dot")
          {
            next.augments = augmented;
          } 
          else if(next.objType=="Fermata")
          {
            next.lengthens = augmented;
          } 
          else if(next.objType==="SignumCongruentiae")
          {
            // console.log(currentChoice, this.events[this.events.length-1]);
            if(currentChoice)
            {
              console.log("it happened");
              next.effects = currentChoice;
            } 
            else 
            {
              next.effects = this.events[this.events.length-1];
            }
          } 
          else if (next.objType==="Comment" && this.events.length && 
                     this.events[this.events.length-1].objType==="Ligature")
            {
              var c = new LigatureComment(next);
              currentExample.comments.push(c);
              this.events[this.events.length-1].members.push(c);
              // I think this is necessary because otherwise we get two
              // comments -- a ligature comment and a normal comment
              next = c;
              prev = next;
              continue;
            } 
          else if(next.objType=="MusicalChoice" && augmented 
                    && next.content.length //&& !next.content[0].nonDefault()
                    && next.content[0].content.length && next.content[0].content[0].objType==="Fermata")
            {
              next.content[0].content[0].lengthens = augmented;
            }
          if(next.objType==="TextUnderlay" && this.events.length
             && typeof(this.events[this.events.length-1].text) !=="undefined"
             && !this.events[this.events.length-1].text) 
            {
              if(this.events[this.events.length-1].objType !== "SignumCongruentiae")
              {
                // FIXME: This is a painful hack. sig cong is treated by
                // the system as an event in its own right, that happens
                // to take its position from the note before. That would
                // be fine, even if we add text, but not if the text
                // should alter the position of the note that the sig cong
                // attaches to. In that case, we'd draw it before adjusting the position.
                if(last(this.events).objType==="Dot" && last(this.events).augments)
                  {
                                  // If a dot follows a note, put the text under the note
                                  last(this.events).augments.text=next;
                  }
                else if (last(this.events).objType==="Fermata" && last(this.events).lengthens)
                {
                                // If a fermata follows a note, put the text under the note
                  last(this.events).lengthens.text=next;
                } 
              else 
              {
                              this.events[this.events.length-1].text=next;
                          }
            } 
            else if (this.events.length>1)
            {
              this.events[this.events.length-2].text=next;
            }
          } 
          else 
          {
            this.events.push(next);
          }
          prev = next;
        } 
        else if(length == string.length)
        {
          // We're stuck in a loop. Try to escape
          string = string.substring(1);
        }
        // if there's no whitespace, following dot is of augmentation
        augmented= consumeSpace() ? false : next;
      }
      correctNexts(this.events);
    };
    /** Reset MusicExample
     */
    this.reset = function(){
      this.swidth = false;
      this.drawCount = 0;
      this.w2 = [];
      this.events = [];
      this.comments = [];
      curCatchword = this.curCatchword;
      this.parse();
    };
    /** width 
     * @returns {number} width */
    this.width = function(){
          state = "finding width";
      if(this.swidth) {
        return this.swidth;
      } else {
        this.setSysWidths();
        return this.swidth;
        var w = 0;
        for(var e=0;e<this.events.length; e++){
          var w2 = this.events[e].startX ? this.events[e].startX : 0;
          w2 += typeof(this.events[e].width) != "undefined" ? this.events[e].width() : 0;
          w = Math.max(w, w2);
        }
        this.swidth = w;
        return w;
      }
    };
    /** commentsDiv 
     * @returns {ExampleComments} new Comment to the current example or false */
    this.commentsDiv = function(){
      return new ExampleComments(this.comments);
    };
    /** commentsTip provides comments tip 
     * @param x
     * @param y */
    this.commentsTip = function(x, y){
      for(var i=0; i<this.comments.length; i++){
        if(x>=this.comments[i].startX && x<=this.comments[i].endX
           && y>=this.comments[i].endY && y<=this.comments[i].startY){
          return Tooltip(this.comments[i].content);
        } 
      }
      removeTooltip();
      return false;
    };
    /** height
     * @returns height
     */
    this.height = function(){
      // FIXME: clearly stupid
          state = "finding height";
      var height = rastralSize * 
        (!this.parameters.staff || typeof(this.parameters.staff) == "undefined" ? 
         1 : (this.parameters.staff.trueLines() + 4));
      // for(var i=0; i<this.events.length; i++){
      //   if(this.events[i].objType == "Staff"){
      //     height += rastralSize * 9 + 5;
      //   }
      //}
      this.setSysWidths();
      height = sysWidths.length * height + 15;
      return height;
    };
    /** targetWidth
     * @returns width of target
     */
    this.targetWidth = function(){
      return (wrapWidth 
              ? (wrapWidth - (rastralSize * 3) - (lmargin+10) - (this.marginSpace ? 100 : 0))
              : false);
    };
    /** sets system width */
    this.setSysWidths = function(){
      sysWidths = [rastralSize + this.parameters.width()];
      this.swidth = 0;
    //    var x = lmargin +rastralSize/2;
      for(eventi=0; eventi<this.events.length; eventi++){
        if(this.events[eventi].objType == "Staff" 
  //         || (wrapWidth && sysWidths[sysWidths.length-1] >= this.targetWidth())){
           || (wrapWidth && sysWidths[sysWidths.length-1] >= this.targetWidth())){
  //             (wrapWidth - rastralSize*3 - lmargin-10)){
          sysWidths[sysWidths.length-1] += rastralSize * 2;
          if(sysWidths[sysWidths.length-1]+lmargin>SVG.width){
            sysWidths[sysWidths.length-1] = SVG.width - lmargin;
          }
          this.swidth = Math.max(this.swidth, sysWidths[sysWidths.length-1]);
          sysWidths.push(rastralSize);
        } else {
          if(isNaN(this.events[eventi].width())){
            alert("Width estimation failed: "+ this.events[eventi].objType
                 + " gives: " + this.events[eventi].width());
          }
          // x+=this.events[eventi].width();
          // drawVerticalLine(x+0.5, 0, 250, 2, "#1F6");
          sysWidths[sysWidths.length -1] +=this.events[eventi].width();
        }
      }
      this.swidth = Math.max(this.swidth, sysWidths[sysWidths.length-1]);
    };
    /** Saves the MusicExample back to its text form
     * @returns text
     */
    this.toText = function(){
      var text = this.parameters.toText();
      for(var i=0; i<this.events.length; i++){
        if(i>0) text += " ";
        if(typeof(this.events[i].toText) == "undefined") 
          alert("error - "+JSON.stringify(this.events[i]));
        text += this.events[i].toText();
      }
          if(standaloneEditor){
              text += "</piece>";
          } else {
              text += "</example>";
          }
      return text;
    };
    /** Writes MusicExample to MEI
     * @returns {MEIDoc} MEI document object
     */
      this.toMEI = function(){
          this.UUIDs = {};
          var docObj = new MEIDoc();
          var doc = docObj.doc;
          var music = doc.createElementNS("http://www.music-encoding.org/ns/mei", "music");
          var body =  doc.createElementNS("http://www.music-encoding.org/ns/mei", "body");
          var mdiv = doc.createElementNS("http://www.music-encoding.org/ns/mei", "mdiv");
          var mscore = doc.createElementNS("http://www.music-encoding.org/ns/mei", "score");
          var msection = doc.createElementNS("http://www.music-encoding.org/ns/mei", "section");
          var mscoredef = doc.createElementNS("http://www.music-encoding.org/ns/mei", "scoreDef");
          var staffn = 1;
          this.done = [];
          docObj.tree.appendChild(music);
          music.appendChild(body);
          body.appendChild(mdiv);
          mdiv.appendChild(mscore);
          mscore.appendChild(mscoredef);
          var msectionIsNew = true;
    //		mscore.appendChild(msection);
    //		msection.appendChild(mstaff);
    //		mstaff.appendChild(mlayer);
          currentExample = this;
          if(this.parameters && this.parameters.toMEI) {this.parameters.toMEI(doc, msection);}
          this.appendStaffDefs(doc, mscoredef);
          var started = false;
          var extras = [];
          var inExtra = false;
          console.log("making MEI");
          var currentPartes = [];
          var currentParsi = 0;
          var parti=0;
          var sic = false;
          var n=0;
          var mstaff = doc.createElementNS("http://www.music-encoding.org/ns/mei", "staff");
          mstaff.setAttribute('n', 1);
          // If there is no part, there won't be any output without this [AP 07/21]
          // I don't know why this isn't happening later, but adding this unbreaks things [DL 05/20]
          var mlayer = doc.createElementNS("http://www.music-encoding.org/ns/mei", "layer");
          // more
          for(var i=0; i<this.events.length; i++){
              var prevLength = currentPartes.length;
              if(this.events[i].objType==="Part"
                   && this.events[i].type==="part"
                   && !this.events[i].closes){
                  parti++;
                  n = Object.keys(this.voiceParts).indexOf(this.events[i].defaultName())+1;
                  currentParsi=0;
                  mstaff = doc.createElementNS("http://www.music-encoding.org/ns/mei", "staff");
                  mlayer = doc.createElementNS("http://www.music-encoding.org/ns/mei", "layer");
                  mstaff.setAttribute('n', n > -1 ? n : parti);
                  mstaff.appendChild(mlayer);
                  if(this.events[i].id){
                      mstaff.setAttribute('label', this.events[i].id);
                  }
              } // else if (this.events[i].objType==="Part"
              // 					 && this.events[i].type==="pars"
              // 					 && !this.events[i].closes
              // 					 && this.events[i].id==="sic") {
              // 	var extraStaff = doc.createElementNS("http://www.music-encoding.org/ns/mei", "staff");
              // 	mlayer = doc.createElementNS("http://www.music-encoding.org/ns/mei", "layer");
              // 	extraStaff.setAttributeNS(null, 'n', parti);
              // 	extraStaff.setAttributeNS(null, 'extra', 'true');
              // 	extraStaff.appendChild(mlayer);
              // 	extras.push([extraStaff, currentPartes.length]);
              // 	inExtra = true;
              // } 
              else if (this.events[i].objType==="Part"
                                   && this.events[i].type==="pars"
                                   && !this.events[i].closes) {
                  // These partes are presented in sequence within a voice
                  sic = this.events[i].id==="sic" ? true : false;
                  if(parti===1) {
                      var msubsection = doc.createElementNS("http://www.music-encoding.org/ns/mei", "section");
                      currentPartes.push(msubsection);
                  } else {
                      msubsection = currentPartes[currentParsi];
                      if(!sic) currentParsi++;
                  }
                  mstaff = doc.createElementNS("http://www.music-encoding.org/ns/mei", "staff");
                  mlayer = doc.createElementNS("http://www.music-encoding.org/ns/mei", "layer");
                  mstaff.setAttribute('n', sic ? parti+10 : (n>-1 ? n : parti));
                  mstaff.appendChild(mlayer);
                  if(this.events[i].id){
                      mstaff.setAttribute('label', this.events[i].id);
                  }
                  inExtra = false;
              } else if (this.events[i].objType==="Part"
                                   && this.events[i].type==="section"
                                   && !this.events[i].closes) {
                  currentParsi=0;
                  staffn = 0;
                  parti = 0;
                  msection = doc.createElementNS("http://www.music-encoding.org/ns/mei", "section");
                  msectionIsNew = true;
                  currentPartes = [];
                  if(this.events[i].id) msection.setAttribute('label', this.events[i].id);
                  inExtra = false;
              } else if(this.events[i].toMEI && this.done.indexOf(this.events[i])===-1){
                  if(msection && msectionIsNew) mscore.appendChild(msection);
                  if(msubsection) {
                      msection.appendChild(msubsection);
                      if(mstaff) msubsection.appendChild(mstaff);
                  } else if(!inExtra){
                    if(mstaff) 
                    {
                      msection.appendChild(mstaff);
                      if(mlayer) mstaff.appendChild(mlayer);
                    }
                  }
                  msectionIsNew = false;
                  mstaff = false;
                  msubsection = false;
                  if(!mlayer) console.log(this.events[i]);
                  this.events[i].toMEI(doc, mlayer);
                  started = true;
              }
          }
          return docObj;
    };
    /** @summary easyRhythms starts trivial beat analysis 
     * @see getAtomicSections
     * @see getEventsByMensurationForSection
     * @see beatIndependentDurations
     * @see addAllStartTimes
     * @returns {MEIDoc} MEI document with resolved rhythm */
      this.easyRhythms = function(){
          var MEIDoc = this.toMEI();
          var layerMens = [];
          this.MEI = MEIDoc;
          var sections = getAtomicSections(MEIDoc);
          for(var i=0; i<sections.length; i++){
              var layers = getLayers(sections[i]);
              for(var layi=0; layi<layers.length; layi++){
                var sectionBlocks = getEventsByMensurationForSection(layers[layi], MEIDoc.doc,
                                                                                                                           layerMens.length>layi ? layerMens[layi] : false);
                  layerMens[layi] = sectionBlocks[sectionBlocks.length-1].mens;
                  beatIndependentDurations(sectionBlocks);
                  //	 			labelEasyDurationsAndStartTimes(sectionBlocks);
                  addAllStartTimes(sectionBlocks);
                  //var remaining = resolveForKnownStartingPoints(sectionBlocks);
                  //addAllStartTimes(sectionBlocks);
                  //simplestAlterations(sectionBlocks);
                  //addAllStartTimes(sectionBlocks);
                  var remaining = 1000000000;
                  var nextRemaining = afterTheEasyBits(sectionBlocks);
                  while(nextRemaining != 0 && remaining!=nextRemaining){
                      // Rerun this for as long as it makes a difference
                      // (i.e. resolves unsolved durations/start times)
                      console.log("unresolved count", remaining, nextRemaining);
                      remaining=nextRemaining;
                      nextRemaining = afterTheEasyBits(sectionBlocks);
                  }
                  console.log(remaining);
                  this.stupidVerovioStretch();
                  this.mensurStrich();
                  this.markResolved();
                  this.regenerateMEILinks();
              }
          }
          return MEIDoc;
    };
    /** regenerateMEILinks
      */
      this.regenerateMEILinks = function(){
          this.MEIcoded = this.MEI.blobify();
          this.MEILink.setAttributeNS(null, 'href', URL.createObjectURL(this.MEIcoded));
          //this.VerovioLink.setAttributeNS(null, 'href', 'viewer.html?mei='+encodeURI(this.MEIcoded));
    };
    /** Deals with the unability of Verovio to do proportions
     */
      this.stupidVerovioStretch = function(){
          // Verovio can't do proportions
          for(var e=0; e< this.events.length; e++){
              if(this.events[e].objType==="Note" || this.events[e].objType==="Rest"){
                  var object = this.events[e].MEIObj;
                  if(object.getAttributeNS(null, 'dur.intermediate')
                       && object.getAttributeNS(null, 'dur.intermediate')
                       != object.getAttributeNS(null, 'dur.ges')
                       && !object.getAttributeNS(null, 'stretched')){
                      // A proportion has been applied
                      var realised = object.getAttributeNS(null, 'dur.ges');
                      var implied = object.getAttributeNS(null, 'dur.intermediate');
                      var realno = Number(realised.substring(0, realised.length-1));
                      var implno = readDur(object);
                      var proportion = realno / implno;
                      var numb = Number(object.getAttributeNS(null, 'numbase'));
                      if(numb){
                          object.setAttributeNS(null, 'numbase', numb*proportion );
                          object.setAttributeNS(null, 'stretched', 'true');
                      } else {
                          object.setAttributeNS(null, 'numbase', proportion );
                          object.setAttributeNS(null, 'num', '1' );
                          object.setAttributeNS(null, 'stretched', 'true');						
                      }
                  }
              }
                       
          }
    };
    /** Removes old mensurStrich elements and draws barLines
     */
      this.mensurStrich = function(){
          var old = Array.from(document.getElementsByClassName('mensurStrich'));
          if(old) old.forEach(x => x.remove());
          for(var e=0; e<this.events.length; e++){
              if(this.events[e].objType==="Note" || this.events[e].objType==="Rest"){
                  var object = this.events[e].MEIObj;
                  if(object.getAttributeNS(null, 'onTheBreveBeat')
                       || object.getAttributeNS(null, 'crossedABreveBeat')
                       || parseInt(object.getAttributeNS(null, 'onTheBreveBeat'), 10)===0){
                      // We've crossed a breve beat
                      drawMensurStrich(this.events[e]);
                      if(object.getAttributeNS(null, 'onTheBreveBeat')
                           && object.previousSibling && object.previousSibling.tagName!="barLine"){
                          let line = object.ownerDocument.createElementNS("http://www.music-encoding.org/ns/mei", "barLine");
                          line.setAttributeNS(null, "visible", "false");
                        object.parentNode.insertBefore(line, object);
                      }
                  }
              }
          }
    };
    /** markedResolved */
      this.markResolved = function(){
          for(var e=0; e<this.events.length; e++){
              if(this.events[e].objType==="Note" || this.events[e].objType==="Rest"
                   || this.events[e].objType==="MaxRest"  || this.events[e].objType==="LongRest"){
                  var MEIObj = this.events[e].MEIObj;
                  if(MEIObj.getAttributeNS(null, 'dur.ges')){
                      var DOMObj = this.events[e].domObj;
                      if(!DOMObj){
                          console.log("problem with", e, this.events[e]);
                          continue;
                      }
                      DOMObj.classList.add('resolved');
                      if(MEIObj.getAttributeNS(null, 'quality')){
                          DOMObj.classList.add(MEIObj.getAttributeNS(null, 'quality'));
                      }
                      if(MEIObj.getAttributeNS(null, 'rule')){
                          DOMObj.classList.add(MEIObj.getAttributeNS(null, 'rule'));
                      }
                  }
              } else if(this.events[e].objType==="Ligature"){
                  if(this.events[e].members.every(isResolved)){
                      this.events[e].domObj.classList.add('resolved');
                  }
              }
          }
    };
    /**
     * exports MusicExample to TEI
     * @todo Old code, propably not valid MEI or TEI
     * @param doc
     * @param parent
     */
    this.toTEI = function(doc, parent){
          // FIXME: Old code, probably not valid MEI or TEI
      if(!parent) parent=(doc.currentParent || doc.body);
      var musicel = doc.element("notatedMusic");
      var mdiv = doc.element("mei:mdiv");
      var mscore = doc.element("mei:score");
      var msection = doc.element("mei:section");
      currentExample = this;
      parent.appendChild(musicel);
      musicel.appendChild(mdiv);
      mdiv.appendChild(mscore);
  //    mscore.appendChild(msection);
      if(this.parameters && this.parameters.toMEI) this.parameters.toMEI(doc, msection);
      // more
      //this.appendStaffDefs(doc, mscore);
    };
    /** gatherStaffs
     * @param parts
     * @returns {Object} voices
     */
      this.gatherStaffs = function(parts){
          var voices = {};
          var voiceParts = this.parts.filter(x=>x.type=="part"&&!x.startEl);
          for(var i=0; i<voiceParts.length; i++){
              let name = voiceParts[i].defaultName();
              if(voices[name]){
                  voices[name].push(voiceParts[i]);
              } else {
                  voices[name] = [voiceParts[i]];
              }
          }
          return voices;
    };
    /** appendStaffDefs
     * @param doc
     * @param el Element
     */
    this.appendStaffDefs = function(doc, el){
      var group = doc.createElementNS("http://www.music-encoding.org/ns/mei", "staffGrp");
          var counter = 1;
          this.voiceParts = this.gatherStaffs(this.parts);
          var voiceTypes = Object.keys(this.voiceParts);
          var  sd;
      el.appendChild(group);
          if(voiceTypes.length){
              for(var i=0; i<voiceTypes.length; i++){
                  group.appendChild(this.staffDefForPart(this.voiceParts[voiceTypes[i]][0], i+1, doc));
              }
          } else if(this.parts && this.parts.length){
        for(var i=0; i<this.parts.length; i++){
                  if(!this.parts[i].closes && this.parts[i].type==="part") {
                      group.appendChild(this.staffDefForPart(this.parts[i], counter++, doc));
                  }
        }
      } else {
              sd = doc.createElementNS("http://www.music-encoding.org/ns/mei", "staffDef");
              var p = this.parameters;
              var c = p.getClef();
              sd.setAttributeNS(null, "n", 1);
              console.log(p);
              sd.setAttributeNS(null, "lines", (p.staff.trueLines() || 15));
              if(c){
                  if(c.objType==="MusicalChoice"){
                      if(!c.nonDefault()){
                          this.done.push(c);
                          var clefs = c.content[0].content.filter(e => e.objType==='Clef');
                          if(clefs.length){
                              c = clefs[0]
                              sd.setAttributeNS(null, "clef.line", (c.staffPos/2) - 1);
                              sd.setAttributeNS(null, "clef.shape", (c.type || "C"));
                          }
                      }
                  } else {
                      sd.setAttributeNS(null, "clef.line", (c.staffPos/2) - 1);
                      sd.setAttributeNS(null, "clef.shape", (c.type || "C"));
                  }
              }
              group.appendChild(sd);
          }
    };
    /** staffDefForPart
     * @param part
     * @param n
     * @param doc
     * @returns {Element} MEI staff def
     */
    this.staffDefForPart = function(part, n, doc){
      var sd = doc.createElementNS("http://www.music-encoding.org/ns/mei", "staffDef");
      var relevantStaff = part.applicableStaff();
      sd.setAttributeNS(null, "n", n);
      sd.setAttributeNS(null, "notationtype", "mensural");
      sd.setAttributeNS(null, "lines", relevantStaff.trueLines());
          if(part.id) {
              sd.setAttributeNS(null, "label", part.defaultName());
          }
      return sd;
    };
    /** startingStaffForPart
     * @todo not implemented!
     * @param part
     * @param pos
     */
    this.startingStaffForPart = function(part, pos){
      
    };
    this.currentSolm = function(variant){
      // We're not really keeping track of staves properly for cases
      // where line breaks are automatic (because automatic system
      // breaks came later). This method looks back to find an
      // applicable solmisation signature. N.B. variant allows other
      // uses to be made of this, but would normally just be false.
      for(var j=eventi-1; j>=0; j--){
        if(this.events[j].objType==="SolmizationSignature" 
           && (!this.events[j].appliesTo
               || (variant && this.events[j].appliesTo.indexOf(variant)>-1))){
          // Easy – this is a normal signature and applies here
          return this.events[j];
        } else if(this.events[j].objType==="MusicalChoice" && !this.events[j].nonDefault()){
          // Complicated – applicable signatures might be buried (probably not, though)
          for(var k=this.events[j].content[0].content.length-1; k>=0; k--){
            var obj = this.events[j].content[0].content[k];
            if(obj.objType==="SolmizationSignature"){
  //            && (!obj.appliesTo
  //                || (variant || obj.appliesTo.indexOf(variant)>-1))){
              return obj;
            } else if(obj.objType==="MusicalChoice" && !obj.nonDefault()){
              // Choice in a choice. If I defined this functionality
              // sensibly (recursively), I could handle any depth of
              // choices, but it's probably better to discourage using
              // that in practice, and only implementing it if
              // necessary. Plus, this patch is overdue...
              for(var l=obj.content[0].content.length-1; l>=0; l--){
                if(obj.content[0].content[l].objType==="SolmizationSignature"){
  //                 && (!obj.content[0].content[l].appliesTo
  //                    || (variant && obj.content[0].content[l].appliesTo.indexOf(variant)>-1))){
                  return obj.content[0].content[l];
                }
              }
            }
          }
        }
      }
      console.log("missed");
      return false;
    };
    this.draw = function(exampleSVG, force){
  //    if(exampleSVG != this.SVG) alert("ok");
      // FIXME: 14/10/12 If this shows no alerts, remove this and all
      // svg passing
      // if(this.drawCount>1 && !force){
      //   alert("oh really?");
      //   return;
      // }
      // 22/01/12 This showed up for redrawing punctuation. FIXME: find
      // out what's happening
      underlays = [];
      this.drawCount++;
  //    this.catchwords = [];
      currentClef = false;
      currentSolm = false;
          leaveSpace = false;
      currentExample = this;
      var st = this.parameters.staff;
      currentLinecount = st ? st.trueLines() : 1;
      currentStaffColour = st ? st.trueColour() : "black";
      curx = lmargin;
      cury = topMargin;
      lowPoint = cury+(rastralSize*2);
      currentType = this.parameters.notation;
      currentSubType = this.parameters.notationSubtype;
      currentRedline = false;
      SVG = this.SVG;//exampleSVG;
      // this.SVG = SVG; // ??
      clearSVG(SVG);
      svgCSS(SVG, cssPath("jt-editor-v.css"));
  //    svgCSS(SVG, cssPath("print.css"));
      this.w2 = [];
      currentSystems = [];
      var fontstring = Math.round(3 * rastralSize * prop) +"pt ArsNovaVoidRegular";
      context.font = fontstring;
  //    this.setSysWidths();
      localWidth = exWidth;
      sysNo = 1;
      curx += rastralSize / 2;
      var mw = curx;
      var texted = false;
      var maxx = false;
      var remain = this.events.length;    
      var nextBreak = this.indexOfStaffBreak();
          var preRot;
      currentSystems.push(svgGroup(SVG, "Stafflines", false));
      this.parameters.draw();
      var broken=false;
      // some helpers for better system breaks
      var sysbreakWidth = this.targetWidth()-(3*rastralSize);
      var remainingEvents = this.events;
      for(eventi = 0; eventi<this.events.length; eventi++){
        if(!broken && currentSolm && currentSolm.members.length && eventi>0) {
          broken=true;
        }
        // console.log(this.events[eventi], curx);
        remain--;
        if(eventi>nextBreak) nextBreak = this.indexOfStaffBreak(1+nextBreak);
        //reset currentClef and currentSolm at the end of a part (and ONLY A PART, NOT A PARS!!!!)
        if(this.events[eventi].objType==="Part" && this.events[eventi].closes && this.events[eventi].type=="part")
        {
          currentClef = false;
          currentSolm = false;
        }
        // determine automatic system breaks in case of wrapWidth... are we near the end of space?
        // Make sure to prevent a crash if nextBreak is false... (Why is this possible?!)
        if(wrapWidth && 
          determineSysBreak(remainingEvents, sysbreakWidth, 
            (nextBreak!=false ? nextBreak - eventi: remain), remain))
        {
          // The custos has to know the next (=current) note, so rewind
          // the pointer, briefly
          eventi-=1;
          // if the event before the system break is already a custos, we don't need another one
          if(this.events[eventi].objType!=="Custos")
          {
            var custos = new Custos();
            custos.draw();
          }

                  if(this.events[eventi].classList){
                      // ledger lines
                      for(var l=0; l<this.events[eventi].classList.length; l++){
                          if(this.events[eventi].classList[l].objType==="LedgerLineChange"){
                              this.events[eventi].classList[l].coordinates.push(curx);
                          }
                      }
                  }
          eventi+=1;
          sysBreak2();
          sysBreak(false, leaveSpace);
          // draw Clef & Solm only if the next object is no clef
          //if(this.events[eventi+1] && this.events[eventi+1].objType!=="Clef")
          if(this.events[eventi].objType!=="Clef")
          {
            if(currentClef) currentClef.draw();
            //console.log(currentClef.appliesTo);
            var realSolm = this.currentSolm(false);
            if(realSolm) realSolm.draw();
          }
          
          this.SVG.height.baseVal.value = this.SVG.height.baseVal.value 
            + (rastralSize*5)+5+(currentLinecount*rastralSize);
        }
        if(this.events[eventi].objType && (!this.events[eventi].params || this.events[eventi].objType==="Staff")) {
          try {
            if(currentRedline && removeRedlineBefore(this.events[eventi].classList)) currentRedline = false;
            if(this.events[eventi].objType==="Part" && this.events[eventi].staff) {
                //console.log("Part will be displayed on new system");
              } 
            else if (this.events[eventi].objType==="UpsideDownOpen"){
                preRot = SVG;
                SVG = svgGroup(preRot, 'flippin', false);
              } 
            else if (this.events[eventi].objType==="UpsideDownClose"){
                var box = SVG.getBBox();
                var halfwayX = box.x + (box.width / 2);
                var halfwayY = cury - (3*rastralSize);
                SVG.setAttributeNS(null, "transform", "rotate(180, "+halfwayX+", "+halfwayY+")");
                SVG = preRot;
              } 
            else {
                this.events[eventi].draw();
              }
            // this.events[eventi].draw(curx, cury); // obsolete
          } catch (x) {
            console.log(x, this.events[eventi]);
          }
          if(this.events[eventi].objType == "TextUnderlay"
             || this.events[eventi].text){
            texted = true;
          }
        }
        mw = Math.max(curx, mw);
        remainingEvents = remainingEvents.slice(1);
      } // end of for loop
      if(this.classes.classes.length) drawClasses(this.classes.classes, false);
      sysBreak2(true);
      for(var w=0; w<this.w2.length; w++){
        drawSystemLines(currentSystems[w], this.w2[w][2], this.w2[w][1], lmargin, 
          this.w2[w][0], this.w2[w][3]);
        maxx = Math.max(this.w2[w][0], maxx);
      }
      for(var coli=0; coli<this.colbreaks.length; coli++){
        ColBreakWidth(this.colbreaks[coli], mw);
      }
      var box = this.SVG.getBoundingClientRect();
      if(!box.height) {
        //      alert("Rectangle error"+this.code);
        // FIXME: Certainly still causes brokenness
  //      this.SVG.height.baseVal.value = 64;
        var max= false, min=false, b;
        for(var n=0; n<SVG.childNodes.length; n++){
          b=SVG.childNodes[n].getBoundingClientRect();
          if(b.top && (!min || b.top<min)) min = b.top;
          if(b.bottom && (!max || b.bottom>max)) max = b.bottom;
        }
        this.SVG.height.baseVal.value = Math.max(64, max-min + (texted ? 30 : 0));
      } else {
          var bbox = this.SVG.getBBox();
          this.bbox = bbox;
          var top = bbox.y < 0 ? bbox.y -1 : 0;
          var bottom = bbox.y+bbox.height+1;
          var height = bottom - top;
          if(top) {
            var nudge = rastralSize*-2.55;
            if($(this.SVG.parentNode).hasClass("inline")) {
              // this.SVG.parentNode.style.marginTop = "-35px";
              this.SVG.parentNode.style.marginTop = (-2*rastralSize)+"px";
              if(this.w2[0][2]===3){
                nudge -= rastralSize/2;
                // nudge -= rastralSize;
              }
            }
            if(safari) this.w2[0][2]===3 ? nudge+=2 : nudge+=4;
            this.SVG.parentNode.style.verticalAlign = nudge-top+"px";
          } 
          this.SVG.setAttribute('height', height);
          this.SVG.height.baseVal.value = height;
          this.SVG.style.height = height+"px";
          this.SVG.setAttribute('viewBox', bbox.x+" "+top+" "+bbox.width+" "+height);//bbox.height);
          this.SVG.width.baseVal.value = bbox.width+bbox.x;
        // } else {
        //   this.SVG.height.baseVal.value = Number(box.height); //+ (texted ? 35 : 5);
        // }
  //      this.SVG.height.baseVal.value = Number(SVG.getBoundingClientRect().height) + (texted ? 35 : 5);
  //      this.SVG.style.height = (Number(SVG.getBoundingClientRect().height) + (texted ? 35 : 5)+10)+"px";
      }
  //     if(!$.browser.webkit){
  // //      this.SVG.width.baseVal.value = maxx + (texted ? 25 : 5);
  //       this.SVG.width.baseVal.value = this.SVG.getBBox().
  //     }
      // this.SVG.parentNode.style.width = maxx+(texted ? 25 : 5)+8+"px";
      if(!inTip // && !editorMode
        ){
        $(this.SVG).hover(function(e){displayStatusBarReference(this, e);});
      }
      currentExample = false;
      eventi = false;
    };
    this.indexOfStaffBreak = function(start){
      for(var si=0; si<this.staves.length; si++){
        if((!start || this.staves[si][0]>=start) && this.staves[si][1].objType==="Staff") {
          return this.staves[si][0];
        }
      }
      return false;
    };
    this.parse();
    currentExample = false;
  }
  // end of MusicExample
  
  /**
   * @memberof music-container
   * Checks if an automatic system break is necessary.
   * This is done in a separate function for better traceability.
   * @param {Array} remainingEvents 
   * @param {int} sysbreakWidth 
   * @param {int} toNextBreak 
   * @param {int} remain 
   * @returns {boolean} advise break
   */
  function determineSysBreak(remainingEvents, sysbreakWidth, toNextBreak, remain)
  {
    var breakSys = false;
    var currentEvent = remainingEvents[0];
    var curText = getDefaultText(currentEvent);
    var curWidth = curText ? curText.width() : currentEvent.width();

    // We need to check for things that should not be broken at!
    var dontBreak = needToPreventBreak(currentEvent);
    // Result is applied at the end, because it cancels the break

    // Advise an earlier break because of the following events:
    if (!dontBreak)
    {
      let fiveGram = remainingEvents.slice(0,5);
      let fiveGramWidth = getGroupWidth(fiveGram);
      // if the next 3 events won't fit, determine if an earlier break is desired
      if(curx + fiveGramWidth > sysbreakWidth)
      {
        breakSys = dontSplitGram(fiveGram);
      }
    }
    
    // Break if: (yep, the code is redundant, but it's easier to debug if cases are properly separated)
    // X + width of current event would reach beyond recommended system width
    if(curx + curWidth >= sysbreakWidth)
    {
      breakSys = true;
    }
    // no break seems to be necessary because of remaining space
    // check if we would like to break earlier because of future stuff
    else if(remain < 5)
    {
      // break earlier near the end because the rest won't fit?
      let restWidth = getGroupWidth(remainingEvents);
      
      if(curx + restWidth > sysbreakWidth)
      {
        breakSys = true;
      }

    }
    else if(toNextBreak > 0 && toNextBreak < 8 && toNextBreak != remain)
    {
      // we're near a break, check whether it's a default break
      // then check if we would like to break early
      let breakEvent = remainingEvents[toNextBreak];
      
      if(breakEvent.objType!=="MusicalChoice" || !breakEvent.nonDefault())
      {
        let toBreakWidth = getGroupWidth(remainingEvents.slice(0,toNextBreak+1));

        if(curx + toBreakWidth > sysbreakWidth)
        {
          breakSys = true;
        }
      }
    }

    // prevent a break
    if(dontBreak===true)
    {
      breakSys = false;
    }

    return breakSys;
  }

  /**
   * @memberof music-container
   * Determines the estimated width of a group of events
   * @param {Array} eventGroup Group of events
   * @returns {int} total width of group
   */
  function getGroupWidth(eventGroup)
  {
    var grpWidth = 0;
    for(let i = 0; i < eventGroup.length; i++)
    {
      let thisItemWidth = eventGroup[i].text ?
        getDefaultText(eventGroup[i]).width() : eventGroup[i].width();
      grpWidth = grpWidth + thisItemWidth;
    }

    return grpWidth;
  }

  /**
   * @memberof music-container
   * Checks whether an event should not be put in a new system.
   * Usually, the object type contradicts a break.
   * @param {*} event 
   * @returns {boolean} Don't break!
   */
  function needToPreventBreak(event) 
  {
    var dontBreak = false;

    if(event)
    {
      switch(event.objType)
      {
        case "TextUnderlay":
        case "Part":
        case "Staff":
        case "Barline":
        case "Custos":
          dontBreak = true;
          break;
        case "MusicalChoice":
          //In case of a choice, look at first event in default Reading
          let defaultRdg = getDefaultReading(event);
          dontBreak = needToPreventBreak(Array.isArray(defaultRdg) ? defaultRdg[0] : defaultRdg);
          break;
        default:
          dontBreak = false;
          break;
      }
    }

    return dontBreak;
  }

  /**
   * @memberof music-container
   * Checks for following events that shouldn't be split and advises a split just before
   * @param {Array} nGram 
   * @returns {boolean} advise split now
   */
  function dontSplitGram(nGram)
  {
    var splitNow = false;

    /**
     * We have various reasons to split:
     * --- Because of first event (in case of choices, check only first item of default reading)
     * - First is a clef
     * - Don't split accidental from note
     * - Don't split after Mensuration Sign
     * - Don't split after Proportion sign
     * --- Because of second event 
     *     (since the connection between 1st & 2nd is important, check only first item in choices)
     * - Don't split a fermata from its note
     * - Don't split a dot of augmentation from its note
     * 
     * But we need to get these items recursively for dealing with nested variants
     */

    var first = getFirstDefaultNonChoice(nGram[0]);
    var second = getFirstDefaultNonChoice(nGram[1]);

    if(first)
    {
      switch(first.objType)
      {
        case "Clef":
        case "SolmizationSign":
        case "StackedProportionSigns":
        case "ProportionSign":
          splitNow = true;
          break;
        case "MensuralSignature":
          splitNow = true;
          break;
        default:
          splitNow = false;
          break;
      }
    }

    if(second)
    {
      switch(second.objType)
      {
        case "Dot":
          // check if augments
          if(second.augments)
          {
            splitNow = true;
          }
          break;
        case "Fermata":
          // check if lengthens
          if(second.lengthens)
          {
            splitNow = true;
          }
          break;
        case "SignumCongruentiae":
          // check if effects
          if(second.effects)
          {
            splitNow = true;
          }
          break;
        default:
          // don't do anything you stupid!
          //splitNow = false;
          break;
      }
    }

    return splitNow;
  }

  /**
   * @memberof music-container
   * Gets the first non-choice default event inside a choice
   * @param {*} event Musical event
   * @returns {*} Musical event
   */
  function getFirstDefaultNonChoice(event)
  {
    do{
      event = getDefaultReading(event);
      if(Array.isArray(event))
      {
        event = event[0];
      }
    }
    while(event && event.objType==="MusicalChoice");

    return event;
  }