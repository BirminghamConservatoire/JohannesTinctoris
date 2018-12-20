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
function getLayers(section){
	let sections = section.getElementsByTagName('layer');
	return Array.from(sections);
}

function getEventsByMensurationForSection(section, doc, prevMens){
	var ni = doc.createNodeIterator(section, NodeFilter.SHOW_ALL);
	var foo = [];
	var block = {mens: prevMens, events: foo};
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
			case 'proport':
				if(foo.length){
					foo = [];
					block = {mens:block.mens, prop:next, events: foo};
					blocks.push(block);
				} else {
					block.prop = next;
				}
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

function gcd(a,b) {
	// Find the highest common factor (for tidy num/numbase values)
	// This is recursive, so prob unwise in the general case, but fine here
	// Taken from rosettaCode
  return b ? gcd(b, a % b) : Math.abs(a);
}
function writeDur(num, el, dot){
	if(dot) el.setAttributeNS(null, 'dur.ges', (1.5*num)+'b');
	else el.setAttributeNS(null, 'dur.ges', num+'b');
}
function writeSimpleImperfection(el, mens, rule){
	el.setAttributeNS(null, 'dur.ges', (2 * simpleMinims(el, mens) / 3) + 'b');
	el.setAttributeNS(null, 'num', 2);
	el.setAttributeNS(null, 'numbase', 3);
	el.setAttributeNS(null, 'dur.quality', 'imperfectio');
	el.setAttributeNS(null, 'quality', 'i');
	el.setAttributeNS(null, 'rule', rule);
}
function writeImperfection(el, reduceBy, mens, rule){
	var defaultDur = simpleMinims(el, mens);
	var factor = gcd(defaultDur, reduceBy);
	var finalDur = defaultDur - reduceBy
	writeDur(finalDur, el, false);
	el.setAttributeNS(null, 'num', finalDur / factor);
	el.setAttributeNS(null, 'numbase', defaultDur / factor);
	el.setAttributeNS(null, 'dur.quality', 'imperfectio');
	el.setAttributeNS(null, 'quality', 'i');
	el.setAttributeNS(null, 'rule', rule);	
}
function writeAlteration(el, mens, rule){
	el.setAttributeNS(null, 'dur.ges', (2 * simpleMinims(el, mens)) + 'b');
	el.setAttributeNS(null, 'num', 2);
	el.setAttributeNS(null, 'numbase', 1);
	el.setAttributeNS(null, 'dur.quality', 'alteratio');
	el.setAttributeNS(null, 'quality', 'a');
	el.setAttributeNS(null, 'rule', rule);
}
function readDur(el){
	var str = el.getAttributeNS(null, 'dur.ges');
	if(str){
		return Number(str.substring(0, str.length-1));
	} else return false;
}

function addTime(el, current){
	var dur = readDur(el);
	if(dur && (current || current===0)) {
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
		var blockPos = Number(el.getAttributeNS(null, 'mensurBlockStartsAt'));
		var elPos = Number(el.getAttributeNS(null, 'startsAt'));
		var relPos = elPos - blockPos;
		el.setAttributeNS(null, 'relPos', relPos);
		el.setAttributeNS(null, 'beatPos', beatUnitStructure(blockPos, mensur).join(', '));
		var minimsInUnit = simpleMinims(el, mensur, levelAdjust-1);
		var minimsInParentUnit = simpleMinims(el, mensur, levelAdjust);
		if((noteInt(el)+levelAdjust)>=7) minimsInParentUnit=minimsInUnit;
		el.setAttributeNS(null, 'miu', minimsInUnit);
		el.setAttributeNS(null, 'mipu', minimsInParentUnit);
		return beatOfUnit(minimsInUnit, minimsInParentUnit, relPos).beat;
	} else return false;
}
function beatUnitStructure(startMinims, mens){
	var rem = startMinims;
  var levels = minimStructures(mensurSummary(mens));
	var units = [0, 0, 0, 0, 0, 0];
	var leveln = levels.length
	for(var i=0; i<leveln; i++){
		var minims = levels[leveln-1-i];
		var beats = Math.floor(rem / minims);
		rem = rem % minims;
		units[5-i] = beats;
	}
	units[1] = Math.floor(rem);
	units[0] = rem%1;
	return units;
}

function isAlterable(el, mensur){
	var m = mensurSummary(mensur);
	var durPos = noteInt(el) - 3;
	if(durPos<0 || durPos>3 || (m[durPos]===2 || m[durPos]===false) || el.tagName==="rest"){
		return false;
	} else return true;
}
function minimStructures(mensurSummary, maxLevel){
	var counts = [];
	var minims = 1;
	for(var i=0; i < (maxLevel ? maxLevel : 4); i++){
		minims = minims*(mensurSummary[i] ? mensurSummary[i] : 2);
		counts.push(minims);
	}
	return counts;
}

function imperfectingLevels(element, mensur){
	// A note can be imperfected by any value that is less than the note's
	// highest perfect component
	var mensum = mensurSummary(mensur);
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
function canImperfect(shortLevel, longLevel, menssum){
	// can something at shortlevel imperfect a note at longlevel, given
	// mensum?
	
	// FIXME assumes statement in imperfectingLevels comment is correct
	// (and I'm not sure it is)
	for(var i=shortLevel-3; i<longLevel-3; i++){
		if(menssum[i]===3) return true;
	}
	return false;
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
function labelRests(sectionBlocks){
	for(var b=0; b<sectionBlocks.length; b++){
		var mens = sectionBlocks[b].mens;
		for(var e=0; e<sectionBlocks[b].events.length; e++){
			var event = sectionBlocks[b].events[e];
			if(event.tagName==='rest'){
				var augmentedDot = e+1<sectionBlocks[b].events.length
						&& sectionBlocks[b].events[e+1].tagName==="dot"
						&& sectionBlocks[b].events[e+1].getAttributeNS(null, 'form')==='aug';
				writeDur(simpleMinims(event, mens, 0), event, augmentedDot);
				event.setAttributeNS(null, 'rule', 'rest');
			}
		}
	}
}
function augDot(event){
	return event.tagName==='dot' && event.getAttributeNS(null, 'form')==='aug';
}
function notePerfectAsWhole(note, mens){
	if(note.tagName='note'){
		var level = noteInt(note);
		var msum = mensurSummary(mens);
		return ([false, false, false, false].concat(msum))[level] === 3;
	} return false;
}
function alterableLevels(mens){
	var ms = mensSummary(mens);
	var als = [];
	for(var i=0; i<4; i++){
		if(ms[i]===3){
			als.push(i+3);
		}
	}
	return als;
}
function regPerfectLevels(mens){
	var ms = mensSummary(mens);
	var rp = [];
	for(var i=1; i<5; i++){
		if(rp.length || ms[i-1]===3){
			rp.push(i+3);
		}
	}
	return rp;	
}
function perfectLevelsAsWhole(mens){
	var ms = mensSummary(mens);
	var pl = [];
	for(var i=1; i<5; i++){
		if(ms[i-1]===3){
			pl.push(i+3);
		}
	}
	return pl;	
}
function simpleAlterations(sectionBlocks){
	for(var b=0; b<sectionBlocks.length; b++){
		var mens = sectionBlocks[b].mens;
		var als = alterableLevels(mens);
		var pls = regPerfectLevels(mens);
		for(var e=0; e<ssectionBlocks[b].events.length; e++){
			var event = sectionBlocks[b].events[e];
			if(!event.getAttributeNS(null, 'dur.ges') && event.tagName==="note"){
				// Note without duration decision
				var level = noteInt(event);
				if(als.indexOf(level)>-1){
					// This is a note on a level that might make it alterable
					if(e+1<sectionBlocks[b].events.length){
						var nextEvent = sectionBlocks[b].events[e+1];
						var nextLevel = nextEvent && noteInt(sectionBlocks[b].events[e+1]);
						if(nextEvent && nextLevel===level+1){
							// Alteration is possible
							
						} else {
							// Alteration is not possible
							writeDur(simpleMinims(event, mens), event,
											 (nextEvent && nextEvent.tagName==="dot"
												&& nextEvent.getAttributeNS(null, 'form')==='aug'));
						}
					}
				} else if (pls.indexOf(level)===-1){
					// Not alterable, but duple (which means we know its length
					writeDur(simpleMinims(event, mens), event, ((e+1)<sectionBlocks[b].length
																											&& sectionBlocks[b].events[e+1].tagName==="dot"
																											&& sectionBlocks[b].events[e+1].getAttributeNS(null, 'form')==='aug'));
				}
			}
		}
	}
}

function labelShortNotes(sectionBlocks){
	for(var b=0; b<sectionBlocks.length; b++){
		var mens = sectionBlocks[b].mens;
		var firstPerfect = firstPerfectLevel(mens);
		var firstAlterable = firstPerfect - 1;
		for(var e=0; e<sectionBlocks[b].events.length; e++){
			var event = sectionBlocks[b].events[e];
			if(event.tagName==="note" && noteInt(event)<firstAlterable){
				writeDur(simpleMinims(event, mens), event, ((e+1)<sectionBlocks[b].length
																										&& sectionBlocks[b].events[e+1].tagName==="dot"
																										&& sectionBlocks[b].events[e+1].getAttributeNS(null, 'form')==='aug'));
			}
		}
	}
}

function leveleq(e1, e2){
	return e1.getAttributeNS(null, 'dur')===e2.getAttributeNS(null, 'dur');
}

function anteSim(sectionBlocks){
	for(var b=0; b<sectionBlocks.length; b++){
		var mens = sectionBlocks[b].mens;
		for(var e=0; e<sectionBlocks[b].events.length; e++){
			var event = sectionBlocks[b].events[e];
			if(event.tagName==="note" && !event.getAttributeNS(null, 'dur.ges')
				 && regularlyPerfect(event, mens)
				 && (e+1)<sectionBlocks[b].events.length
				 // && (sectionBlocks[b].events[e+1].tagName==='note')// Surely note or rest?
				 && (sectionBlocks[b].events[e+1].tagName==='note' || sectionBlocks[b].events[e+1].tagName==='rest')
				 && leveleq(sectionBlocks[b].events[e+1], event)){
				writeDur(simpleMinims(event, mens), event);
				event.setAttributeNS(null, 'rule', 'I.2.b.antesim');
			}
		}
	}
}
function actOnDots(sectionBlocks){
	for(var b=0; b<sectionBlocks.length; b++){
		var mens = sectionBlocks[b].mens;
		for(var e=0; e<sectionBlocks[b].events.length; e++){
			var event = sectionBlocks[b].events[e];
			if(augDot(event) && e){
				prev = sectionBlocks[b].events[e-1];
				if(e && !prev.getAttributeNS(null, 'dur.ges'))
					if(notePerfectAsWhole(prev, mens)){
						writeDur(simpleMinims(prev, mens), prev);
						prev.setAttributeNS(null, 'quality', 'p');
						prev.setAttributeNS(null, 'rule', 'I.2.a.PerfDot');
					} else {
						writeDur(simpleMinims(prev, mens), prev, true);
						prev.setAttributeNS(null, 'rule', 'simpleDot');
					}
			}
		}
	}
}
function actOnColoration(sectionBlocks){
	for(var b=0; b<sectionBlocks.length; b++){
		var mens = sectionBlocks[b].mens;
		for(var e=0; e<sectionBlocks[b].events.length; e++){
			var event = sectionBlocks[b].events[e];
			if(event.tagName==='note' && event.getAttributeNS(null, 'coloration')){
				var augmentedDot = e+1<sectionBlocks[b].events.length
						&& sectionBlocks[b].events[e+1].tagName==="dot"
						&& sectionBlocks[b].events[e+1].getAttributeNS(null, 'form')==='aug';
				writeDur(simpleMinims(event, mens) * 2/3, event, augmentedDot);
				event.setAttributeNS(null, 'rule', 'coloration');
//				prev.setAttributeNS(null, 'dur.ges', 1.5 * simpleMinims(prev, mens, 0));
			}
		}
	}
}

function allUnalterableImperfectLevels(sectionBlocks){
	// Anything imperfect and with an imperfect next longer note is trivial
	for(var b=0; b<sectionBlocks.length; b++){
		var mens = sectionBlocks[b].mens;
		var menssum = mensurSummary(mens);
		var alterableLevels = [2, 2, 2].concat(menssum).concat([2]);
		var firstPerf = firstPerfectLevel(mens);
		for(var e=0; e<sectionBlocks[b].events.length; e++){
			var event = sectionBlocks[b].events[e];
			if(event.tagName==='note' && !(event.getAttributeNS(null, 'dur.ges'))){
				var level = noteInt(event);
				if(level < firstPerf && alterableLevels[level]===2){
					// Assume that actOnDots has already been run on all dotted notes
					writeDur(simpleMinims(event, mens), event);
				}
			}
		}
	}
}

function simplestAlterations(sectionBlocks){
	// Rule A.1 requires us to know the mensural position of the note,
	// so we can't resolve that yet, but we can rule out things that
	// won't work, and we can apply rule A.2:
	//   An alterable note that is preceded by a larger note followed by
	//   the equivalent of its own regular value and followed by a note
	//   or rest of the perfect unit next larger is altered.
	for(var b=0; b<sectionBlocks.length; b++){
		var events = sectionBlocks[b].events;
		var mens = sectionBlocks[b].mens;
		var menssum = mensurSummary(mens);
		var alterableLevels = [2, 2, 2].concat(menssum).concat([2]);
		var perfectLevels = [2, 2, 2, 2].concat(menssum);
		for(var e=0; e<events.length; e++){
			var event = events[e];
			if(event.tagName==='note' && !(event.getAttributeNS(null, 'dur.ges'))){
				var level = noteInt(event);
				if(alterableLevels[level]===3){
					// The level is alterable.
					// The next note must be the next level up
					if(e<events.length-1 && noteInt(events[e+1])==level+1){
						// These are the only things that can be altered all.
						///For A.2 to be true, we need to count backwards by one
						// unit (assuming we have all the necessary dur.ges values;
						var target = simpleMinims(event, mens);
						if((e==0 || noteInt(events[e-1])>level) && perfectLevels[level]===2){
							// highly unlikely to be an alteration (would require
							// syncopation), not possible to be imperfected
							var augmentedDot = e+1<sectionBlocks[b].events.length
									&& sectionBlocks[b].events[e+1].tagName==="dot"
									&& sectionBlocks[b].events[e+1].getAttributeNS(null, 'form')==='aug';
							writeDur(simpleMinims(event, mens), event, augmentedDot);
						}
						for(i=e-1; i>=0; i--){
							if(!events[i].getAttributeNS(null, 'dur.ges')){
								break;
							}
							target = readDur(events[i]);
							if(target===0){
								if(i===0 || noteInt(events[i-1])>level
									 || (events[i-1].tagName=='dot' && events[i-1].getAttributeNS('form')!=='aug')){
									// Yay, it's an alteration
									writeDur(2 * simpleMinims(event, mens), event);
									event.setAttributeNS(null, 'quality', 'a');
									event.setAttributeNS(null, 'rule', 'A.2');
								}
								break;
							} else if(target<0){
								// A.2 doesn't apply
								break;
							} 
						}
					} else if(perfectLevels[level]===2){
						// Now we can resolve this rhythm
						var augmentedDot = e+1<sectionBlocks[b].events.length
								&& sectionBlocks[b].events[e+1].tagName==="dot"
								&& sectionBlocks[b].events[e+1].getAttributeNS(null, 'form')==='aug';
						writeDur(simpleMinims(event, mens), event, augmentedDot);
					}
				}
			}
		}
	}
}

function addStartTimesForBlock(block){
	var blockFrom = 0;
	var mens = block.mens;
	var events = block.events;
	for(var e=0; e<events.length; e++){
		var event = events[e];
		if(event.tagName==='rest' || event.tagName==='note'){
			event.setAttributeNS(null, 'mensurBlockStartsAt', blockFrom);
			var dur = readDur(event);
			if(dur){
				blockFrom += dur;
			} else return;
		}
	}
}

function addBreveBoundariesForBlock(block){
	var blockFrom = 0;
	var mens = block.mens;
	var events = block.events;
	var prevBeatStructure = false;
	for(var e=0; e<events.length; e++){
		var event = events[e];
		if(noteOrRest(event)){
			var tpos = event.getAttributeNS(null, 'mensurBlockStartsAt');
			if(tpos){
				var beatStructure = beatUnitStructure(tpos, mens);
				event.setAttributeNS(null, 'beatPos', beatStructure.join(', '));
				if(beatStructure[0]===0 && beatStructure[1]===0 && beatStructure[2]===0){
					event.setAttributeNS(null, 'onTheBreveBeat', beatStructure[3]);
				} else if(!(beatStructure[5]===prevBeatStructure[5]
										&& beatStructure[4]===prevBeatStructure[4]
										&& beatStructure[3]===prevBeatStructure[3])){
					event.setAttributeNS(null, 'crossedABreveBeat', breveDifference(beatStructure, prevBeatStructure, mens));
				}
				prevBeatStructure = beatStructure;
			} else {
				return;
			}
		}
	}
}

function afterTheEasyBits(sectionBlocks){
	// Now we know many durations and starting points, but not all,
	// iterate through, looking for more context-dependent resolutions.
	var unresolved = 0;
	for(var b=0; b<sectionBlocks.length; b++){
		var events = sectionBlocks[b].events;
		var mens = sectionBlocks[b].mens;
		var menssum = mensurSummary(mens);
		var alterableLevels = [2, 2, 2].concat(menssum).concat([2]);
		var firstPerfect = firstPerfectLevel(mens);
		for(var e=0; e<events.length; e++){
			var event = events[e];
			if(event.tagName==='note' && !event.getAttributeNS(null, 'dur.ges')){
				// duration needs to be resolved
				if(event.getAttributeNS(null, 'mensurBlockStartsAt')){
					// Most cases that are resolvable need beat numbers
					var level = noteInt(event);
					var blockFrom = Number(event.getAttributeNS(null, 'mensurBlockStartsAt'));
					var beatStructure = beatUnitStructure(blockFrom, mens);
					var beatOfUnit = beatStructure[level-3];
					if(e && divisionDot(events[e-1])){
						// Division dot
						beatOfUnit = 0;
					}
					if(level>firstPerfect){
						// Potentially imperfectable
						switch (beatOfUnit) {
							case 0:
								firstBeatImperfection(event, e, events, mens);
								break;
							case 1:
								secondBeatImperfection(event, e, events, mens);
								break;
							case 2:
								thirdBeatImperfection(event, e, events, mens);
								break;
							default:
								midBeatImperfection(event, e, events, mens);
						}
					}
					if(!event.getAttributeNS(null, 'dur.ges') && isAlterable(event, mens)) {
						// Alterable? If not, why is this still here?
						switch (beatStructure[level-2]) {
							case 0:
								firstBeatAlteration(event, e, events, mens);
								break;
							case 1:
								secondBeatAlteration(event, e, events, mens);
								break;
							case 2:
								thirdBeatAlteration(event, e, events, mens);
								break;
							default:
								midBeatAlteration(event, e, events, mens);
						}
					}
					//
					if(event.getAttributeNS(null, 'dur.ges')) {
						// We've got a new duration, so need to update start times
						addStartTimesForBlock(sectionBlocks[b]);
					}
				} else {
					// We may be able to do *something*
					if(events[e-1].tagname==='note' && noteInt(events[e-1])>level){
						// An note after a longer note is likely to
						// start on the first beat of its unit. We can put
						// exception logic in here, but for now
						if(level>=firstPerfect){
							firstBeatImperfection(event, e, events, mens);
						} else if(menssum[level-3]===3){
							// alterable
							firstBeatAlteration(event, e, events, mens);
						} else {
							// Why are we here?
							console.log("Warning: Found an event that isn't alterable or imperfectable:", event);
						}
					}
				}
				if(!event.getAttributeNS(null, 'dur.ges')) {
					// We've got a new duration, so need to update start times
					unresolved += 1;
				}
			}
		}
		addBreveBoundariesForBlock(sectionBlocks[b]);
	}
	return unresolved;
}

function noteOrRest(event){
	return event.tagName==='rest' || event.tagName==='note';
}

function divisionDot(event){
	return event.tagName==='dot' && event.getAttributeNS(null, 'form')!=='aug';
}

function divisionLikeRests(maxLevel, rest1, rest2, direction){
	return ((!direction && noteInt(rest1)<maxLevel && noteInt(rest2)<maxLevel)
					|| (direction==="left" && noteInt(rest1)<maxLevel)
					|| (direction==="right" && noteInt(rest2)<maxLevel))
		&& rest1.tagName==='rest' && rest2.tagName==='rest'
		&& rest1.getAttributeNS(null, 'loc') !== rest2.getAttributeNS(null, 'loc');
}


function firstBeatImperfection(event, index, events, mens){
	var level = noteInt(event);
 	var nextMarker = indexOfNextSameOrLongerOrDot(level, index, events);
	var rightWindow = nextMarker ? events.slice(index+1, nextMarker) : events.slice(index+1);
	var menssum = mensurSummary(mens);
	if(rightWindow.length==0){
		// I.3 => perfect
		writeDur(simpleMinims(event, mens), event);
		event.setAttributeNS(null, 'quality', 'p');
		event.setAttributeNS(null, 'rule', 'I.3-726');
		return event;
	} else if (index<events.length-2
						 && (divisionDot(events[index+2])
								 || (noteOrRest(events[index+2]) && noteInt(events[index+2])>=level))
						 && noteOrRest(events[index+1]) && canImperfect(noteInt(events[index+1]), level, menssum)){
		// I.4 a) - a simplified case where there's an obvious
		// single note
		writeSimpleImperfection(event, mens, 'I.4a');
		return event;
	} else if (((index<events.length-3 && (divisionDot(events[index+3]) || divisionLikeRests(firstPerfectLevel(mens)+1, events[index+2], events[index+3], "left")))
							|| index==events.length-3)
						 && noteInt(events[index+1]) == noteInt(events[index+2])
						 && canImperfect(noteInt(events[index+1]), level, menssum)) {
		// very special case (generalise this later)
		writeImperfection(event, 2*simpleMinims(events[index+1], mens), mens, 'I.4a');
		/*
		event.setAttributeNS(null, 'rule', 'I.4a');
		event.setAttributeNS(null, 'quality', 'i');
		event.setAttributeNS(null, 'dur.ges',
												 (simpleMinims(event, mens) - 2 * simpleMinims(events[index+1], mens))+"b");
		*/
		return true;

	} else {
		return firstBeatImperfectionCheck(event, rightWindow, mens);
	}
}

function secondBeatImperfection(event, index, events, mens){
	// Let's pretend this is easy, and apply I.8 as if we *knew* that
	// something earlier can imperfect this
	writeSimpleImperfection(event, mens, 'I.8');/*
	writeDur(2 * simpleMinims(event, mens) / 3, event);
	event.setAttributeNS(null, 'quality', 'i');
	event.setAttributeNS(null, 'rule', 'I.8');*/
	return event;	
}
function thirdBeatImperfection(event, index, events, mens){
	// More complex
	var imperfectionPossibilities = imperfectingLevels(event, mens);
	var nextDotPos = indexOfNextDot(index, events);
	// Simplest imperfection
	if(nextDotPos && nextDotPos - index < 6 && imperfectionPossibilities.indexOf(windowDuration(events.slice(index+1, nextDotPos), mens).approximation)>-1){
		// There's a simple explanation, that is imperfection from behind
		writeImperfection(event, windowDuration(events.slice(index+1, nextDotPos), mens).approximation,
											mens, 'I.9b');/*
		event.setAttributeNS(null, 'rule', 'I.9b');
		event.setAttributeNS(null, 'quality', 'i');
		writeDur(simpleMinims(event, mens)-windowDuration(events.slice(index+1, nextDotPos), mens).approximation,
						 event);*/
	} else {
		// imperfection from ahead (by how much?)
		writeImperfection(event, imperfectionPossibilities[imperfectionPossibilities.length-1],
											mens, 'I.9a');/*
		event.setAttributeNS(null, 'rule', 'I.9a');
		event.setAttributeNS(null, 'quality', 'i');
		writeDur(simpleMinims(event, mens)-imperfectionPossibilities[imperfectionPossibilities.length-1],
						 event);*/
	}
	return event;
}
function checkForGeneralAlteration(event, index, events, mens){
	var level = noteInt(event);
	var starts = indexOfPrevLongerOrDot(level, index, events);
	var leftWindow = events.slice(starts+1, index);
	var durations = windowDuration(leftWindow, mens);
	if(durations.definite || durations.bareMinimum == 0){
		if(durations.definite==simpleMinims(event, mens)){
			writeAlteration(event, mens, 'A.2');
		} else {
			event.setAttributeNS(null, 'rule', 'A.xx');
			event.setAttributeNS(null, 'dur.ges', simpleMinims(event, mens)+'b');			
		}
	} else if(durations.bareMinimum > simpleMinims(event, mens)){
		// not altered
		event.setAttributeNS(null, 'rule', 'A.xx');
		event.setAttributeNS(null, 'dur.ges', simpleMinims(event, mens)+'b');			
	}
	return event;
}
function firstBeatAlteration(event, index, events, mens){
	return checkForGeneralAlteration(event, index, events, mens);
}
function secondBeatAlteration(event, index, events, mens){
	// second beat is special...
	event.setAttributeNS(null, 'rule', 'A.1');
	event.setAttributeNS(null, 'quality', 'a');
	event.setAttributeNS(null, 'dur.ges', simpleMinims(event, mens)*2+'b');
	return event;
}

function thirdBeatAlteration(event, index, events, mens){
	return checkForGeneralAlteration(event, index, events, mens);
}
function midBeatImperfection(event, index, events, mens){
	// More complex
	return event;
}
function midBeatAlteration(event, index, events, mens){
	return event;
}


function resolveForKnownStartingPoints(sectionBlocks){
	var unresolved = 0;
	for(var b=0; b<sectionBlocks.length; b++){
		var events = sectionBlocks[b].events;
		var mens = sectionBlocks[b].mens;
		var menssum = mensurSummary(mens);
		var alterableLevels = [2, 2, 2].concat(menssum).concat([2]);
		var firstPerf = firstPerfectLevel(mens);
		for(var e=0; e<events.length; e++){
			var event = events[e];
			if(event.tagName==='note' && !event.getAttributeNS(null, 'dur.ges')){
				var level = noteInt(event);
				var nextMarker = indexOfNextSameOrLongerOrDot(level, e, events);
				var rightWindow = nextMarker ? events.slice(e+1, nextMarker) : events.slice(e+1);
				if(event.getAttributeNS(null, 'mensurBlockStartsAt')){
					var blockFrom = Number(event.getAttributeNS(null, 'mensurBlockStartsAt'));
					var beatStructure = beatUnitStructure(blockFrom, mens);
					var beatOfUnit = beatStructure[level-3];
					if(e && events[e-1].tagName==='dot'
						 && events[e-1].getAttributeNS('form')!=='aug'){
						console.log('division dot');
						beatOfUnit = 0;
					}
					var nextNote = e<events.length-1 && events[e+1];
					event.setAttributeNS(null, 'bod', beatOfUnit);
					if(beatOfUnit===0 && level>=firstPerf){
						// Check for imperfections
						if(!rightWindow.length){
							// I.3 => perfect
							writeDur(simpleMinims(event, mens), event);
							event.setAttributeNS(null, 'quality', 'p');
							event.setAttributeNS(null, 'rule', 'I.3');
						} else if (e<events.length-2 && noteInt(events[e+2])>=level
											 && canImperfect(noteInt(events[e+1]), level, menssum)){
							// I.4 a) - a simplified case where there's an obvious
							// single note
							writeDur(2 * simpleMinims(event, mens) / 3, event);
							event.setAttributeNS(null, 'quality', 'i');
							event.setAttributeNS(null, 'rule', 'I.3-846');
						} else {
							if(firstBeatImperfectionCheck(event, rightWindow, mens)) addAllStartTimes(sectionBlocks);//overkill
						}
					}
				} else if (events[e-1].tagname==='note' && noteInt(events[e-1])>level
									 && level>=firstPerfect){
					// this note is perfectable and almost certainly on the
					// first beat of its own unit, even if we don't know it for sure.
					if(!rightWindow.length){
						// I.3 => perfect
						writeDur(simpleMinims(event, mens), event);
												event.setAttributeNS(null, 'quality', 'p');
						event.setAttributeNS(null, 'rule', 'I.3-859');
					} else if (e<events.length-2 && events[e+2].level>=level
											 && events[e+1] < imperfectingLevels(event, mens)){
						// I.4 a) - a simplified case where there's an obvious
						// single note
						writeDur(2 * simpleMinims(event, mens) / 3, event);
						event.setAttributeNS(null, 'quality', 'i');
						event.setAttributeNS(null, 'rule', 'I.3-866');
					} else {
						if(firstBeatImperfectionCheck(event, rightWindow, mens)) addAllStartTimes(sectionBlocks);//overkill
					}
				}
				if(!event.getAttributeNS(null, 'dur.ges')) unresolved += 1;
			}
		}
	}
	return unresolved;
}

function firstBeatImperfectionCheck(event, window, mens){
	var level = noteInt(event);
	var duration = windowDuration(window, mens);
//	if(level==5) console.log(event, duration);
	var imperfectionPossibilities = imperfectingLevels(event, mens);
	if(duration.definite){
		while(imperfectionPossibilities.length){
			var nextToTry = imperfectionPossibilities.pop();
			var imperfectingUnits = duration.definite / nextToTry;
			if(imperfectingUnits===1){
				writeImperfection(event, nextToTry, mens, 'I.4a');/*
				event.setAttributeNS(null, 'rule', 'I.4a');
				event.setAttributeNS(null, 'quality', 'i');
				event.setAttributeNS(null, 'dur.ges',
														 (simpleMinims(event, mens) - imperfectingUnits)+"b");*/
				return true;
			} else if (imperfectingUnits===2){
				if(isAlterable(window[window.length-1], mens)){
					event.setAttributeNS(null, 'rule', 'I.5');
					event.setAttributeNS(null, 'quality', 'p');
					event.setAttributeNS(null, 'dur.ges', simpleMinims(event, mens)+'b');
					event.setAttributeNS(null, 'comment', 'trusting in alteration');
				} else {
					writeImperfection(event, nextToTry, mens, 'I.5-add');/*
					event.setAttributeNS(null, 'rule', 'I.5-add');
					event.setAttributeNS(null, 'quality', 'i');
					event.setAttributeNS(null, 'dur.ges', (simpleMinims(event, mens)-nextToTry)+'b');*/
					event.setAttributeNS(null, 'comment', 'Alteration is impossible');
				}
				///WTF!!!!!?!
				return false;
			} else if (imperfectingUnits===3 || imperfectingUnits===6 || imperfectingUnits===9){
				event.setAttributeNS(null, 'rule', 'I.6');
				event.setAttributeNS(null, 'quality', 'p');
				event.setAttributeNS(null, 'dur.ges', simpleMinims(event, mens)+'b');
				return false;
			} else if (imperfectingUnits>3){
					writeImperfection(event, nextToTry, mens, 'I.4b');/*
				event.setAttributeNS(null, 'rule', 'I.4b');
				event.setAttributeNS(null, 'quality', 'i');
				event.setAttributeNS(null, 'defaultminims', simpleMinims(event, mens));
				event.setAttributeNS(null, 'imperfectedBy', nextToTry);
				writeDur(simpleMinims(event, mens) - nextToTry, event);*/
				return true;
			}
		}
	} else if (solidBlock(duration.approximation, imperfectionPossibilities)){
		// Obvious blocks of perfect units aren't going to be altered
		event.setAttributeNS(null, 'rule', 'I.5-literalunits');
		event.setAttributeNS(null, 'quality', 'p');
		event.setAttributeNS(null, 'defaultminims', simpleMinims(event, mens));
		writeDur(simpleMinims(event, mens), event);
		return true;
	} else if(duration.approximation/simpleMinims(event, mens, -1) === 2 && mensurSummary(mens)[level-4]===3
						&& noteInt(window[window.length-1])===level-1 && isAlterable(window[window.length-1], mens)){
		// This is a window with the equivalent of two units, one of which is alterable
		// The last note of the window will be altered
		event.setAttributeNS(null, 'rule', 'I.6-literalunits');
		event.setAttributeNS(null, 'quality', 'p');
		event.setAttributeNS(null, 'defaultminims', simpleMinims(event, mens));
		writeDur(simpleMinims(event, mens), event);
		event.setAttributeNS(null, 'comment', 'trusting in alteration');		
	} else if(duration.bareMinimum > 3 * imperfectionPossibilities[imperfectionPossibilities.length-1]){
		var imperfector = imperfectionPossibilities[imperfectionPossibilities.length-1];
		writeImperfection(event, imperfector, mens, 'I.4b');/*
		event.setAttributeNS(null, 'rule', 'I.4b');
		event.setAttributeNS(null, 'quality', 'i');
		writeDur(simpleMinims(event, mens) - imperfector, event);*/
		event.setAttributeNS(null, 'defaultminims', simpleMinims(event, mens));
		event.setAttributeNS(null, 'imperfectedBy', imperfector);
		return true;		
	} else if(duration.approximateMinimum > 3 * imperfectionPossibilities[imperfectionPossibilities.length-1]){
		var imperfector = imperfectionPossibilities[imperfectionPossibilities.length-1];
		writeImperfection(event, imperfector, mens, 'I.4b');/*
		event.setAttributeNS(null, 'rule', 'I.4b-riskier');
		event.setAttributeNS(null, 'quality', 'i');
		event.setAttributeNS(null, 'dur.ges',
												 (simpleMinims(event, mens) - imperfector)+"b");*/
		event.setAttributeNS(null, 'defaultminims', simpleMinims(event, mens));
		event.setAttributeNS(null, 'imperfectedBy', imperfector);
		return true;		
	}
}

function breveDifference(struct2, struct1, mens){
	var minims = minimStructures(mensurSummary(mens));
	var breves = 0;
	var minims = 0;
	var MiB = minims[3];
	for(var i=3; i<struct2.length; i++){
		if(struct1[i]>struct2[i]){
			minims += minims[i]*(struct1[i] - struct2[i]) - minims[i+1];
		} else if (struct2[i]>struct1[i]){
			minims += minims[i]*(struct2[i] - struct1[i]);
		}
	}
	return minims/MiB;
}

function startsABreve(object){
	return object.getAttributeNS(null, 'onTheBreveBeat')
		|| object.getAttributeNS(null, 'crossedABreveBeat')
		|| parseInt(object.getAttributeNS(null, 'onTheBreveBeat'), 10)===0;
}
function addAllStartTimes(sectionBlocks){
	var nextStart = 0;
	var prevDur = false;
	var prevBeatStructure = false;
	for(var b=0; b<sectionBlocks.length; b++){
		var blockFrom = 0;
		var blockStart = (nextStart || nextStart===0) ? nextStart : false;
		var mens = sectionBlocks[b].mens;
		for(var e=0; e<sectionBlocks[b].events.length; e++){
			var event = sectionBlocks[b].events[e];
			if(event.tagName==='rest' || event.tagName==='note'){
				if(nextStart || nextStart===0) event.setAttributeNS(null, 'startsAt', nextStart);
				var beatStructure = beatUnitStructure(blockFrom, mens);
				event.setAttributeNS(null, 'beatPos', beatStructure.join(', '));
				if(beatStructure[0]===0 && beatStructure[1]===0 && beatStructure[2]===0){
					event.setAttributeNS(null, 'onTheBreveBeat', beatStructure[3]);
				} else if(!(beatStructure[5]===prevBeatStructure[5]
										&& beatStructure[4]===prevBeatStructure[4]
										&& beatStructure[3]===prevBeatStructure[3])){
					event.setAttributeNS(null, 'crossedABreveBeat', breveDifference(beatStructure, prevBeatStructure, mens));
				}
				prevBeatStructure = beatStructure;
				event.setAttributeNS(null, 'mensurBlockStartsAt', blockFrom);
				var dur = readDur(event);
				if(dur){
					prevDur = dur;
					if(nextStart || nextStart==0) nextStart +=prevDur;
					blockFrom += prevDur;
				} else break;
			}
		}
	}
}
function stuff(sectionBlocks){
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
					event.setAttributeNS(null, 'mensurPosition', mensurStart);
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
				} else if (!regPerf && nextIsAugmentation) {
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
								var beforeUnit = prevOfUnit===0 ? false : events[prevOfUnit-1];
								if(!beforeUnit || noteInt(beforeUnit)>level){
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
					event.setAttributeNS(null, 'mensurPosition', mensurStart);
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
				} else if (!regPerf && nextIsAugmentation) {
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
								var beforeUnit = prevOfUnit===0 ? false : events[prevOfUnit-1];
								if(!beforeUnit || noteInt(beforeUnit)>level){
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
function indexOfNextDot(index, seq){
	for(var i=index+1; i<seq.length; i++){
		if(seq[i].tagName==='dot' && seq[i].getAttributeNS(null, 'form')!=='aug'){
			return i;
		}
	}
	return false;
}
function indexOfPrevLongerOrDot(level, index, seq){
	for(var i=index-1; i>=0; i--){
		if((seq[i].tagName==='dot' && seq[i].getAttributeNS(null, 'form')!=='aug')
			 || noteInt(seq[i])>level){
			return i;
		}
	}
	return -1;
}

function calculateDuration(events, mens){
	findImperfections(events, mens);
	return events.reduce((acc, event)=>
											 (event.tagName==="note" || event.tagName==="rest") ?
											 addTime(event, acc) : acc, 0);
}
function minimumDuration(events, mens){
	return events.reduce((acc, event)=>
											 ((event.tagName==="note" || event.tagName==="rest") && event.getAttributeNS(null, 'dur.ges')) ?
											 addTime(event, acc) : acc + (simpleMinims(event)/3), 0);
}
function windowDuration(events, mens){
	var duration = {definite: 0, bareMinimum: 0, approximateMinimum: 0, approximation: 0};
	var definite = true;
	for(var i=0; i<events.length; i++){
		var event = events[i];
		if(event.tagName==="note"||event.tagName==="rest"){
			if(event.getAttributeNS(null, 'dur.ges')) {
				var durString = event.getAttributeNS(null, 'dur.ges');
				var dur = new Number(durString.substring(0, durString.length-1));
				if(definite) duration.definite += dur;
				duration.bareMinimum += dur;
				duration.approximateMinimum += dur;
				duration.approximation += dur;
			} else {
				definite = false;
				duration.definite = false;
				var mins = simpleMinims(event, mens);
				duration.approximateMinimum += mins / 3;
				duration.approximation += mins;
			}
		}
	}
	return duration;
}
function solidBlock(minimCount, possibleDivisors){
	// If a block of notes looks like it is made up of a small number of
	// whole, coherent mensural units, it probably is. Given its
	// notational length, check for 3, 6, or 9 of the possible perfect
	// units.
	if(minimCount % 3 !== 0) return false;
	for(var i=possibleDivisors.length-1; i>=0; i--){
		var units = minimCount / possibleDivisors[i];
		if(units == 3 || units==6 || units==9){
			return possibleDivisors[i];
		}
	}
	return false;
}
function findImperfection(event, events, index, mens){
	var start = event.getAttributeNS(null, 'mensurBlockStartsAt');
	if(!start) return false;
	start = Number(start);
	var pos = beatUnitStructure(start, mens);
	var levels = mensurSummary(mens);
	var level = noteInt(event);
	// Look for imperfection from earlier
	for(var i=0; i<level-2; i++){
		if(levels[i]===3 && pos[i+1]>0){
			// This is a candidate level for imperfection
			event.setAttributeNS(null, 'stamped', i+', '+pos[i+1]);
		}
	}
}


function findImperfections(events, mens){
	var blockPos = Number(events[0].getAttributeNS(null, 'mensurPosition'));
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
				findImperfection(event, events, j, mens);
				var nextMarker = indexOfNextSameOrLongerOrDot(level, j, events);
				var rightWindow = nextMarker ? events.slice(j+1, nextMarker) : events.slice(j+1);
				event.setAttributeNS(null, 'bod', beatOfDur(event, mens, -1));
				switch(beatOfDur(event, mens, 0)){
					case 0:
						if(!rightWindow.length){
							// Followed by same note, longer note or dot
							// N.B. Same note would already have been treated under ante sim rule
							event.setAttributeNS(null, 'rule', 'I.3-1288');
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
									event.setAttributeNS(null, 'rule', 'I.4a');
									event.setAttributeNS(null, 'quality', 'i');
									event.setAttributeNS(null, 'dur.ges',
																				 (simpleMinims(event, mens) - imperfectingUnits)+"b");
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
						events[i].setAttributeNS(null, 'mensurPosition', blockPos);
						events[i].setAttributeNS(null, 'mensurBlockStartsAt', eventStart - blockPos);
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
//		if(prevStart || prevStart===0) events.forEach(x => x.setAttributeNS(null, 'mensurBlockStartsAt', prevStart));
		mens = sectionBlocks[b].mens;
		findImperfections(events, mens, prevStart);
		prevStart = blockEnds(sectionBlocks[b]);
	}
}

function doStuff(MEIDoc){
	var doc = MEIDoc.doc;
	var sections = getAtomicSections(MEIDoc);
	for(var i=0; i<sections.length; i++){
		var layers = getLayers(sections[i]);
		for(var layi=0; layi<layers.length; layi++){
  		var sectionBlocks = getEventsByMensurationForSection(layers[layi], doc);
			labelRests(sectionBlocks);
			actOnColoration(sectionBlocks);
			actOnDots(sectionBlocks);
	 	  labelEasyDurationsAndStartTimes(sectionBlocks);
	 	  secondPassForImperfections(sectionBlocks);
		}
	}
	return MEIDoc;
}

/*
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
*/

/*
Exception: SyntaxError: missing ) after argument list
@Scratchpad/1:164
*/
/*
Exception: SyntaxError: unexpected token: ')'
@Scratchpad/1:164
*/
/*
Exception: ReferenceError: curDoc is not defined
@Scratchpad/1:545:5
*/
