function MEIObject(){
	this.DOM = false;
	this.mappings = false;

	this.initializeFromString = function(MEIString){
		var parser = new DOMParser();
		this.DOM = parser.parseFromString(MEIString, "application/xml");
	};
	this.initializeFromObj = function(MyMEI){
		this.DOM = MyMEI;
	}
	
}

function nsResolver(prefix){
  var ns = {
    mei: "http://www.music-encoding.org/ns/mei"
  }
  return ns[prefix] || null;
}
function hasNoSections(x){
  return x.childElementCount!==0 && this.evaluate('count(mei:section)', x, nsResolver).numberValue===0;
}

function getAtomicSections(MEIDoc){
	let doc = MEIDoc.doc;
	let sections = doc.getElementsByTagName('section');
	return Array.from(sections).filter(hasNoSections, doc);
}

function getEventsByMensurationForSection(section, doc){
	var ni = doc.createNodeIterator(section, NodeFilter.SHOW_ALL);
	var foo = [];
	var block = {mens: false, events: foo};
	var blocks = [block];
	var next = ni.nextNode();
	while(next){
		switch(next.tagName){
			case 'mensur':
				if(foo.length){
					foo = [];
					block = {mens:next, events: foo};
					blocks.push(block);
				} else {
					block.mens = next;
				}
				// Assumed defaults (changed if evidence to the contrary)
				if(!next.getAttributeNS(null, 'modusmaior')) block.mens.setAttributeNS(null, 'modusmaior', 2);
				if(!next.getAttributeNS(null, 'modusminor')) block.mens.setAttributeNS(null, 'modusminor', 2);
				break
			case 'rest':
				if(block.mens){
					if(next.getAttributeNS(null, 'dur')==='maxima'){
						if(next.getAttributeNS(null, 'maximaIsPerfect')==='true') block.mens.setAttributeNS(null, 'modusmaior', 3);
						if(next.getAttributeNS(null, 'longaIsPerfect')==='true') block.mens.setAttributeNS(null, 'modusminor', 3);
					} else if (next.getAttributeNS(null, 'dur')==='longa' && next.getAttributeNS(null, 'quality')=="p"){
						block.mens.setAttributeNS(null, 'modusminor', 3);
					}
				}
			case 'note':
			case 'dot':
				foo.push(next);
		}
		next = ni.nextNode();
	}
	return blocks	
}
function noteIntFromDur(dur){
	return ['semifusa', 'fusa', 'semiminima', 'minima', 'semibrevis', 'brevis', 'longa', 'maxima'].indexOf(dur);
}

function noteInt(el){
	return noteIntFromDur(el.getAttributeNS(null, 'dur'));
}
function regularlyPerfect(element, mensur){
	var val = noteInt(element);
	if(val>3){
		if(mensur.getAttributeNS(null, 'prolatio')==="2"){
			if(val>4){
				if(mensur.getAttributeNS(null, 'tempus')==="2"){
					if(val>5){
						if(!mensur.getAttributeNS(null, 'modusminor')
							 || mensur.getAttributeNS(null, 'modusminor')==="2"){
							if(val>6){
								if(!mensur.getAttributeNS(null, 'modusmaior')
									 || mensur.getAttributeNS(null, 'modusmaior')==="2"){
									return false;
								} else return true;
							} else return false
						} else return true;
					} else return false;
				} else return true;
			} else return false;
		} else return true;
	} else {
		return false;
	}
}

function mensurSummary(mensur){
	return [mensur.getAttributeNS(null, 'prolatio'), mensur.getAttributeNS(null, 'tempus'), mensur.getAttributeNS(null, 'modusminor'), mensur.getAttributeNS(null, 'modusmaior')].map(x=>x?parseInt(x, 10) : false);
}

function simpleMinims(el, mensur, levelAdjust){
	var level = noteInt(el) - 3;
	if(levelAdjust) level+= levelAdjust;
	if(level<1) return Math.pow(2, level);
	var minims = 1;
	var exponents = mensurSummary(mensur);
	for(var i=0; i<level; i++){
		if(exponents[i]) {
			minims = minims * exponents[i];
		} else {
			console.log('missing info for', el, i, 'using', mensur, 'stupidly assuming 2');
			minims = minims * 2;
		}
	}
	return minims;
}
/*
function markRegularPerfectionAndDoEasyBits(element, mensur, index, sequence){
	var last = index+1==sequence.length;
	var next = !last ? sequence[index+1] : false;
	var nextLevel = next ? noteInt(next) : false;
	var level = noteInt(element)
	var nextIsDot = next && next.tagName==="dot" ? next : false;
	var anteSim = next && nextLevel===level;
	var nextIsLonger = next && nextLevel > level;
	var dotType = nextIsDot ? nextIsDot.getAttributeNS(null, 'form') : false;
	if(noteInt(element)<=3){
		// Short enough that mensuration, perfection and imperfection can't effect the note
		if(dotType && dotType=='aug'){
			element.setAttributeNS(null, 'dur.ges', simpleMinims(element, mensur)*1.5+'b');
		} else {
			element.setAttributeNS(null, 'dur.ges', simpleMinims(element, mensur)+'b');
		}
	} else {
		var perf = regularlyPerfect(element, mensur);
		if(element.tagName==='rest'){
			var base = simpleMinims(element, mensur);
			if(element.getAttributeNS(null, 'dur')==="longa" && element.getAttributeNS(null, 'quality')==="i" && mensur.getAttributeNS(null, 'modusminor')==='3'){
				base = base / 3 * 2;
			} else if (element.getAttributeNS(null, 'dur')==="maxima" && element.getAttributeNS(null, 'maximaIsPerfect')==="false" && mensur.getAttributeNS(null, 'modusmaior')==='3'){
				base = base / 3 * 2;
			}
			element.setAttributeNS(null, 'dur.ges', base+'b');
		}
		if(perf===true){
			element.setAttributeNS(null, 'type', 'regularlyPerfect');
			if (element.getAttributeNS(null, 'coloration')){
				// Rule I.1
				// FIXME: No check for sesquialtera
				element.setAttributeNS(null, 'rule', 'I.1');
        element.setAttributeNS(null, 'quality', 'i');
			  element.setAttributeNS(null, 'dur.ges', simpleMinims(element, mensur)/3*2+'b');
      } else if ((nextIsDot && dotType=='aug') || anteSim || element.tagName==="rest") {
				// I.2.a, b and c
				// Rests, dotted notes and notes before notes of the same
				// length are never imperfect
				element.setAttributeNS(null, 'rule', 'I.2');
				element.setAttributeNS(null, 'quality', 'p');
				element.setAttributeNS(null, 'dur.ges', simpleMinims(element, mensur)+'b');
			} else if(beatOfDur(element, mensur, 0)==0 && nextIsLonger){
				element.setAttributeNS(null, 'rule', 'I.3');
				element.setAttributeNS(null, 'quality', 'p');
				element.setAttributeNS(null, 'dur.ges', simpleMinims(element, mensur)+'b');
			} else if(beatOfDur(element, mensur, 0)==0 && imperfectionFromBag(element, imperfectionHorizon(element, index, sequence, mensur), mensur)){
				element.setAttributeNS(null, 'rule', 'I.4');
				element.setAttributeNS(null, 'quality', 'i');
				element.setAttributeNS(null, 'dur.ges', simpleMinims(element, mensur) - imperfectionFromBag(element, imperfectionHorizon(element, index, sequence, mensur), mensur) +'b');
			} else if(beatOfDur(element, mensur, 0)==1 && imperfectionFromAhead(element, imperfectionFromAheadHorizon(element, index, sequence, mensur), mensur)){
				element.setAttributeNS(null, 'rule', 'I.8');
				element.setAttributeNS(null, 'quality', 'i');
				element.setAttributeNS(null, 'dur.ges', (simpleMinims(element, mensur) * 2 / 3) +'b');
			}
		} else if (perf===false){
			if(nextIsDot && dotType==='aug'){
				element.setAttributeNS(null, 'dur.ges', simpleMinims(element, mensur)*1.5+'b');
			} else if(!isAlterable(element, mensur) || nextLevel!= level+1) {
				// Can't be imperfected, can't be altered – either is not an
				// alterable note or is not followed by the next larger note
				element.setAttributeNS(null, 'dur.ges', simpleMinims(element, mensur)+'b');
			} else if(standardAlterationPattern(element, index, sequence, mensur)){
				element.setAttributeNS(null, 'rule', 'A.2');
				element.setAttributeNS(null, 'quality', 'a');
				element.setAttributeNS(null, 'dur.ges', simpleMinims(element, mensur)*2+'b');				
			} else if (beatOfDur(element, mensur, 0)!==1){
				// Can't be imperfected, can't be altered
				element.setAttributeNS(null, 'dur.ges', simpleMinims(element, mensur)+'b');
			} else if(nextLevel && nextLevel===level+1){
				element.setAttributeNS(null, 'rule', 'A.1');
				element.setAttributeNS(null, 'quality', 'a');
				element.setAttributeNS(null, 'dur.ges', simpleMinims(element, mensur)*2+'b');
			} 
		}
	}
}*/
function standardAlterationPattern(element, index, sequence, mensur){
	var level = noteInt(element);
	var minims = simpleMinims(element, mensur);
	if(index>0 && noteInt(sequence[index-1])<=level){
		// Not preceded by larger note
		return false;
	}
	var shorterSpan = 0;
	// FIXME: breaks for internal imperfection/alteration patterns
	for(var i=index+1; i<sequence.length; i++){
		var nextLevel = noteInt(sequence[i]);
		if(nextLevel>=level){
			if(nextLevel===level+1 && shorterSpan===minims){
				return true;
			} else return false;
		}
		shorterSpan+=simpleMinims(sequence[i], mensur);
	}
}

function addTime(el, current){
	if(el.getAttributeNS(null, 'dur.ges') && (current || current===0)) {
		var durString = el.getAttributeNS(null, 'dur.ges');
		var dur = new Number(durString.substring(0, durString.length-1));
		return current+dur;
	} else return false;
}
function beatOfUnit(minimsInUnit, minimsInParentUnit, startMinims){
	var rem1 = startMinims % minimsInParentUnit;
	var rem2 = rem1 % minimsInUnit;
	var beat = Math.floor(rem1 / minimsInUnit);
	return {beat: beat, remainder:rem2}; 
}
function beatOfDur(el, mensur, levelAdjust){
	if(!levelAdjust) levelAdjust = 0;
	if(el.getAttributeNS(null, 'mensurBlockStartsAt')){
		var minimsInUnit = simpleMinims(el, mensur, levelAdjust-1);
		var minimsInParentUnit = simpleMinims(el, mensur, levelAdjust);
		if(noteInt(el)+levelAdjust>=7) minimsInParentUnit=minimsInUnit;
		el.setAttributeNS(null, 'miu', minimsInUnit);
		el.setAttributeNS(null, 'mipu', minimsInParentUnig);
		return beatOfUnit(minimsInUnit, minimsInParentUnit, Number(el.getAttributeNS(null, 'mensurBlockStartsAt'))).beat;
	} else return false;
}
function isAlterable(el, mensur){
	var m = mensurSummary(mensur);
	var durPos = noteInt(el) - 3;
	if(durPos<0 || durPos>3 || (m[durPos]===2 || m[durPos]===false)){
		return false;
	} else return true;
}
function minimStructures(mensurSummary, maxLevel){
	var counts = [];
	var minims = 1;
	for(var i=0; i < (maxLevel ? maxLevel : 3); i++){
		minims = minims*(mensurSummary[i] ? mensurSummary[i] : 2);
		counts.push(minims);
	}
	return counts;
}
function imperfectingLevels(element, mensur){
	// A note can be imperfected by any value that is less than the note's
	// highest perfect component
	var mensum = mensurSummary(mens);
	var elLevel = noteInt(element) - 4;
	var perf = false;
	for(var i=elLevel; i>=0; i--){
		if(mensum[i]===3) {
			perf = i;
			break;
		}
	}
	return perf ? minimStructures(mensum, perf) : [];
}
/*function imperfectingLevels(element, mensur){
	var mensum = mensurSummary(mensur);
	var elLevel = noteInt(element) - 3;
	var minimLevels = minimStructures(mensum, elLevel);
	return minimLevels.filter((x, i)=>(mensum[i]===3));
}*/
function imperfectionFromAhead(element, sequence, mensur){
	return imperfectionFromBag(element, sequence, mensur);
}
function imperfectionFromBag(element, sequence, mensur){
	// Simplest imperfection
	var mensum = mensurSummary(mensur);
	var possibleLevels = imperfectingLevels(element, mensur);
	var bagDuration = sequence.map(x=>simpleMinims(x, mensur)).reduce((x, t)=>x+t, 0);
	var imperfectionLevels = possibleLevels.filter(x=>x<=bagDuration);
	if(imperfectionLevels.length){
		return imperfectionLevels[imperfectionLevels.length-1];
	} else return false;
}

function imperfectorInBag(element, sequence, mensur){
	// Simplest imperfection
	var mensum = mensurSummary(mensur);
	var elLevel = noteInt(element) - 3;
	var candidateLevels = [];
	for(var i=elLevel; i>=0; i--){
		if(mensum[i]===3) candidateLevels.push(i);
	}
	var possibles = sequence.filter((x)=>candidateLevels.indexOf(noteInt(x)-3)>-1);
	if(possibles.length) return possibles[0];
	return false;
}

function imperfectionHorizon(element, index, sequence){
	var bag = [];
	var elLevel = noteInt(element);
	for(var j=index+1; j<sequence.length; j++){
		if(sequence[j].tagName==="dot"){
			if(sequence[j].getAttributeNS(null, 'form')==="aug"){
				bag.push(sequence[j]);
			} else return bag;
		} else if (noteInt(sequence[j])>=elLevel){
			return bag;
		} else {
			bag.push(sequence[j]);
		}
	}
	return bag;
}
function imperfectionFromAheadHorizon(element, index, sequence, mensur){
	var bag=[];
	var elLevel = noteInt(element);
	for(var j=index-1; j>=0; j++){
		if(sequence[j].tagname==="dot"){
			if(sequence[j].getAttributeNS(null, 'form'==="aug")){
				bag.push(sequence[j]);
			} else return bag;
		} else if(noteInt(sequence[j])>=elLevel){
			return bag;
		} else {
			bag.push(sequence[j]);
		}
	}
	return bag;
}

function firstPerfectLevel(mensuration){
	var firstPerf = mensurSummary(mensuration).indexOf(3);
	if(firstPerf===-1){
		return 20;
	} else {
		return firstPerf+3;
	}
}
function labelEasyDurationsAndStartTimes(sectionBlocks){
	var nextStart = 0;
	var giveUp = false;
	for(var b=0; b<sectionBlocks.length; b++){
		var onsets = [];
  	var events = sectionBlocks[b].events;
		var mens = sectionBlocks[b].mens;
		var mensSummary = mensurSummary(mens);
		var firstPerfect = firstPerfectLevel(mens);
		var firstAlterable = firstPerfect - 1;
		var mensurStart = nextStart;
  	for(var j=0; j<events.length; j++){
			var event = events[j];
			var eventDur = event.getAttributeNS(null, 'dur');
			var last = j+1===events.length;
			var nextEvent = last ? false : events[j+1];
			var nextEventDur = last ? false : nextEvent.getAttributeNS(null, 'dur');
			var beatOfParent = false;
	 		if(event.tagName==="note" || event.tagName==="rest"){
				event.setAttributeNS(null, 'level', noteInt(event));
				event.setAttributeNS(null, 'mensur', mensurSummary(mens).join(','));
				if(nextStart || nextStart===0) {
					event.setAttributeNS(null, 'startsAt', nextStart);
					event.setAttributeNS(null, 'mensurBlockStartsAt', nextStart-mensurStart);
					onsets.push(nextStart);
						beatOfParent = beatOfDur(event, mens, 0);
				}
				var anteSim = nextEvent && nextEventDur===eventDur;
				var nextIsDot = nextEvent && nextEvent.tagName==="dot" ? nextEvent : false;
				var nextIsAugmentation = nextIsDot && nextEvent.getAttributeNS(null, 'form')==='aug';
				var level = noteInt(event);
				var alterableLevel = mensSummary[level-3]===3;
				var regPerf = regularlyPerfect(event, mens);
				if(level < firstAlterable || (!alterableLevel && !regPerf)){
					// can't be imperfected
					event.setAttributeNS(null, 'dur.ges',
															 (simpleMinims(event, mens)*(nextIsAugmentation ? 1.5 : 1))+'b');
				} else if (alterableLevel){
					if(nextEvent && noteInt(nextEvent)===level+1){
						// Alteration is possible
						if(beatOfParent && beatOfParent===1 && noteInt(nextEvent)===firstPerfect){
							// A.1
							event.setAttributeNS(null, 'rule', 'A.1');
							event.setAttributeNS(null, 'quality', 'a');
							event.setAttributeNS(null, 'dur.ges', simpleMinims(event, mens)*2+'b');
						} else {
							if(nextStart && onsets.indexOf(nextStart - (simpleMinims(event, mens)))>-1){
								var prevOfUnit = onsets.indexOf(nextStart - (simpleMinims(event, mens)))>-1;
								var beforeUnit = prefOfUnit===0 ? false : events[prevOfUnit-1];
								if(!beforeUnit || noteIn(beforeUnit)>level){
									// A.2
									event.setAttributeNS(null, 'rule', 'A.2');
									event.setAttributeNS(null, 'quality', 'a');
									event.setAttributeNS(null, 'dur.ges', simpleMinims(event, mens)*2+'b');
								}
							}
						}
					} else {
						event.setAttributeNS(null, 'rule', 'A.xx');
						event.setAttributeNS(null, 'dur.ges', simpleMinims(event, mens)+'b');
					}
				} else if(event.tagName==='rest') {
					event.setAttributeNS(null, 'dur.ges',
																 (simpleMinims(event, mens)*(nextIsAugmentation ? 1.5 : 1))+'b');
				} else if(regPerf){
					if (event.getAttributeNS(null, 'coloration')){
						// Rule I.1
						// FIXME: No check for sesquialtera
						event.setAttributeNS(null, 'rule', 'I.1');
						event.setAttributeNS(null, 'quality', 'i');
						event.setAttributeNS(null, 'dur.ges', simpleMinims(event, mens)/3*2+'b');
					} else if (nextIsAugmentation || anteSim) {
						// I.2.a, b and c
						// Rests, dotted notes and notes before notes of the same
						// length are never imperfect
						event.setAttributeNS(null, 'rule', 'I.2');
						event.setAttributeNS(null, 'quality', 'p');
						event.setAttributeNS(null, 'dur.ges', simpleMinims(event, mens)+'b');
					} else {
						event.setAttributeNS(null, 'type', 'regularlyPerfect');
					}
				}
				//				  markRegularPerfectionAndDoEasyBits(events[j], sectionBlocks[b].mens, j, events);
				nextStart = addTime(events[j], nextStart);
			}
		}
	}
	return sectionBlocks;
}

function indexOfNextSameOrLongerOrDot(level, index, seq){
	for(var i=index+1; i<seq.length; i++){
		if((seq[i].tagName==='dot' && seq[i].getAttributeNS(null, 'form')!=='aug')
			 || (noteInt(seq[i])>=level)){
			return i;
		}
	}
	return false;
}

function calculateDuration(events, mens){
	findImperfections(events, mens);
	return events.reduce((acc, event)=>
											 (event.tagName==="note" || event.tagName==="note") ?
											 addTime(event, acc) : acc, 0);
}
function minimumDuration(event, mens){
	return events.reduce((acc, event)=>
											 ((event.tagName==="note" || event.tagName==="note") && event.getAttributeNS(null, 'dur.ges')) ?
											 addTime(event, acc) : acc, 0);
}

function findImperfections(events, mens){
  for(var j=0; j<events.length; j++){
		var event = events[j];
		var eventDur = event.getAttributeNS(null, 'dur');
		var eventStart = (event.getAttributeNS(null, 'startsAt')) ?
				parseInt(event.getAttributeNS(null, 'startsAt'), 10) :
				false;
		if(event.getAttributeNS(null, 'dur.ges')) {
			continue;
		}
		var last = j+1===events.length;
		var nextEvent = last ? false : events[j+1];
		var nextEventDur = last ? false : nextEvent.getAttributeNS(null, 'dur');
		var beatOfParent = false;
	 	if(event.tagName==="note"){
			var anteSim = nextEvent && nextEventDur===eventDur;
			var nextIsDot = nextEvent && nextEvent.tagName==="dot" ? nextEvent : false;
			var nextIsAugmentation = nextIsDot && nextEvent.getAttributeNS(null, 'form')==='aug';
			var level = noteInt(event);
			if(regularlyPerfect(event, mens)){
				var nextMarker = indexOfNextSameOrLongerOrDot(level, j, events);
				var rightWindow = nextMarker ? events.slice(j+1, nextMarker) : events.slice(j+1);
				event.setAttributeNS(null, 'bod', beatOfDur(event, mens, 0));
				switch(beatOfDur(event, mens, 0)){
					case 0:
						if(!rightWindow.length){
							// Followed by same note, longer note or dot
							// N.B. Same note would already have been treated under ante sim rule
							event.setAttributeNS(null, 'rule', 'I.3');
							event.setAttributeNS(null, 'quality', 'p');
							event.setAttributeNS(null, 'dur.ges', simpleMinims(event, mens)+'b');
						} else {
							var imperfectionPossibilities = imperfectingLevels(event, mens);
							var mdur = minimumDuration(rightWindow, mens);
							var recursiveDuration = mdur > 3 * imperfectionPossibilities[imperfectionPossibilities.length-1] ?
									mdur :
									calculateDuration(rightWindow, mens);
    				  event.setAttributeNS(null, 'durationOfWindow', recursiveDuration);
    				  event.setAttributeNS(null, 'minimum', mdur);
		    		  event.setAttributeNS(null, 'possibilities', imperfectionPossibilities.join(', '));
							while(!event.getAttributeNS(null, 'dur.ges') && imperfectionPossibilities.length){
								var nextToTry = imperfectionPossibilities.pop();
								var imperfectingUnits = recursiveDuration / nextToTry;
								if(imperfectingUnits===1){
									element.setAttributeNS(null, 'rule', 'I.4a');
									element.setAttributeNS(null, 'quality', 'i');
									element.setAttributeNS(null, 'dur.ges',
																				 (simpleMinims(element, mens) - imperfectingUnits)+"b");
								} else if (imperfectingUnits===2){
									event.setAttributeNS(null, 'rule', 'I.5');
									event.setAttributeNS(null, 'quality', 'p');
									event.setAttributeNS(null, 'dur.ges', simpleMinims(event, mens)+'b');
									event.setAttributeNS(null, 'comment', 'trusting in alteration');
								} else if (imperfectingUnits===3 || imperfectingUnits===6 || imperfectingUnits===9){
									event.setAttributeNS(null, 'rule', 'I.6');
									event.setAttributeNS(null, 'quality', 'p');
									event.setAttributeNS(null, 'dur.ges', simpleMinims(event, mens)+'b');
								} else if (imperfectingUnits>3){
									event.setAttributeNS(null, 'rule', 'I.4b');
									event.setAttributeNS(null, 'quality', 'i');
									event.setAttributeNS(null, 'defaultminims', simpleMinims(event, mens));
									event.setAttributeNS(null, 'imperfectedBy', nextToTry);
									event.setAttributeNS(null, 'dur.ges',
																				 (simpleMinims(event, mens) - nextToTry)+"b");
								}
							}
							if(!event.getAttributeNS(null, 'dur.ges'))event.setAttributeNS(null, 'comment', 'missed on 1');
						}
						break;
					case 1:
						break;
					case 2:
						break;
					default:
				}
			}
			if(event.getAttributeNS(null, 'dur.ges')){
				// New duration means we have start times to propagate through the piece
				var prevEvent = event;
				for(var i=j+1; i<events.length; i++){
					if(events[i].tagName=='rest' || events[i].tagName=='note'){
						eventStart = addTime(prevEvent, eventStart);
					 	events[i].setAttributeNS(null, 'startsAt', eventStart);
						if(!events[i].getAttributeNS(null, 'dur.ges')){
							// No more start times to add
							break;
						} else {
							prevEvent = events[i];
						}
					}
				}
			}
		}
	}
}

function blockEnds(sectionBlock){
	for(var i=sectionBlock.events.length-1; i>=0; i++){
		if(sectionBlock.events[i].tagName==='rest' ||sectionBlock.events[i].tagName==='note'){
			if(sectionBlock.events[i].getAttributeNS(null, 'dur.ges') &&
				 sectionBlock.events[i].getAttributeNS(null, 'startsAt')){
				return addTime(sectionBlock.events[i], 
											 parseInt(sectionBlock.events[i].getAttributeNS(null, 'startsAt'), 10));
			} else return false;
				
		}
			 
	}
}
function secondPassForImperfections(sectionBlocks){
	var prevStart = 0;
	for(var b=0; b<sectionBlocks.length; b++){
		var onsets = [];
  	var events = sectionBlocks[b].events;
		if(prevStart || prevStart===0) events.forEach(x => x.setAttributeNS(null, 'mensurBlockStartsAt', prevStart));
		mens = sectionBlocks[b].mens;
		findImperfections(events, mens, prevStart);
		prevStart = blockEnds(sectionBlocks[b]);
	}
}

function doStuff(MEIDoc){
	var doc = MEIDoc.doc;
	var sections = getAtomicSections(MEIDoc);
	for(var i=0; i<sections.length; i++){
		var sectionBlocks = getEventsByMensurationForSection(sections[i], doc);
		labelEasyDurationsAndStartTimes(sectionBlocks);
		secondPassForImperfections(sectionBlocks);
	}
	return MEIDoc;
}


var MyMEI =  curDoc.example.toMEI();
doStuff(MyMEI)
var result = {
  exist: MyMEI.doc.evaluate('count(//mei:note)', MyMEI.tree, nsResolver).numberValue+MyMEI.doc.evaluate('count(//mei:rest)', MyMEI.doc, nsResolver).numberValue,
	decided: MyMEI.doc.evaluate('count(//*[@dur.ges])', MyMEI.doc, nsResolver).numberValue,
	music: MyMEI.doc.evaluate('//section', MyMEI.doc, nsResolver),
	doc: MyMEI,
	orig: curDoc
};
result;
