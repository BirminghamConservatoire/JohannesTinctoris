/**
 *  Analyse Mensural rhythms purely using MEI
 * 
 * 
 *  @fileOverview This code takes mensural MEI and attempts to turn
 *  implicit duration into explicit duration, encoded
 *  as @dur.ges, @num, @numbase and @dur.quality. Input is assumed to
 *  have positions correct, dots classified and implicit mensuration
 *  resolved (although the system will attempt to guess major and
 *  minor modus from rests).
 */

/////////////////////////////
//
// Utility functions I
//
// Simple functions

/**
 * Find highest common factor (for tidy @num/@numbase use). May be
 * less useful, depending how these attributes actually work.
 * @param {Integer} a
 * @param {Integer} a
 * @return {Integer}
 */
function gcd(a,b) {
	// Find the highest common factor (for tidy num/numbase values)
	// This is recursive, so prob unwise in the general case, but fine here
	// Taken from rosettaCode
  return b ? gcd(b, a % b) : Math.abs(a);
}

/** 
 * Name space manager function. Takes a prefix and returns the URL for
 * that name space. In this case, though, pretty much hard-wired.
 * @param {String} prefix The namespace prefix to retrieve as a URL
 */
function nsResolver(prefix){
  var ns = {
    mei: "http://www.music-encoding.org/ns/mei"
  }
  return ns[prefix] || null;
}

/////////////////////////////
//
// Utility functions II
//
// Functions for working with XML DOMObjects and extracting structures
// from MEI

/** 
 * Name space manager function. Takes a prefix and returns the URL for
 * that name space. In this case, though, pretty much hard-wired.
 * @param {String} prefix The namespace prefix to retrieve as a URL
 */
function nsResolver(prefix){
  var ns = {
    mei: "http://www.music-encoding.org/ns/mei"
  }
  return ns[prefix] || null;
}

/**
 * Return true if x (an XML DOM object, normally MEI) contains *no*
 * mei:sections. this needs to be set as a DOM document object.
 * @param {DOMObject} x the part of the tree.  
 * @return {Boolean} 
 */
function hasNoSections(x){
	if(this.evaluate){
		return x.childElementCount!==0 && this.evaluate('count(mei:section)', x, nsResolver).numberValue===0;
	} else {
		return x.childElementCount!==0 && !x.getElementsByTagName('section').length;
	}
}

/**
 * Return all the sections that themselves contain no sections (we
 * have a hierarchical tree structure for parts, so this only chooses
 * the lowest level structural unit.
 * @param {DOMObject} MEIDoc 
 * @return {Array} Array of mei:section elements
 */ 
function getAtomicSections(MEIDoc){
	let doc = MEIDoc.doc;
	let sections = doc.getElementsByTagName('section');
	return Array.from(sections).filter(hasNoSections, doc);
}
/**
 * Return all layers for a section
 * @param {DOMObject} section 
 * @return {Array} Array of mei:layer elements 
 */
function getLayers(section){
	let sections = section.getElementsByTagName('layer');
	return Array.from(sections);
}

var idDictionary = {};
/**
 * Creates an array of mensurally coherent blocks, each an object with
 * mensuration and events attributes.
 * @param {DOMObject} section The section to process
 * @param {DOMObject} doc The parent MEI doc
 * @param {Object} prevMens The last mensuration of the previous block
 * (this is the default for the first section of hte new block in some
 * cases, if none is specified).
 */
function getEventsByMensurationForSection(section, doc, prevMens){
	if(doc.createNodeIterator){
		var ni = doc.createNodeIterator(section, NodeFilter.SHOW_ALL);
		var next = ni.nextNode();
	} else {
		var bucket = section.getElementsByTagName('*');
		var pointer = 0;
		var next = bucket[pointer];
	}
	var foo = [];
	var block = {mens: prevMens, events: foo, prevPropMultiplier: 1};
	var blocks = [block];
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
				idDictionary[next.getAttributeNS(null, "id")] = block;
		}
		if(ni){
			next = ni.nextNode();
		} else {
			pointer++;
			next = pointer < bucket.length ? bucket[pointer]: false;
		}
	}
	return blocks	
}

/**
 * Given an element, find its applicable 'block' (mensurally-coherent
 * section) and, if there is a proportion that should apply, returns
 * the factor. Uses the idDictionary global.
 * @param {DOMObject} el mei:note or mei:rest
 * @returns {Number} 
 */
function proportionMultiplier(el){
	var block = idDictionary[el.getAttributeNS(null, 'id')];
	// if(block.prop) console.log("so", blockProportionMultiplier(block));
	// return blockProportionMultiplier(block);
	if(block.prop){
		if(block.prop.getAttributeNS(null, 'multiplier')){
			return Number(block.prop.getAttributeNS(null, 'multiplier'));
		} else {
			return propProportionMultiplier(block.prop);
		}
	} else return 1;
}
/**
 * Given a proportion-specifying element, give its implied multiplier
 */
function propProportionMultiplier(el){
	var num = el.getAttributeNS(null, 'num') || 1;
	var div = el.getAttributeNS(null, 'numbase') || 1;
	return Number(num) / Number(div);
}
/**
 * Give proportion multiplier for a block given the current and
 * previous proportion state.
 * @param {} block
 * @returns {} 
 */
function blockProportionMultiplier(block){
	var newFactor = block.prop ? propProportionMultiplier(block.prop) : 1;
	var oldFactor = block.prevPropMultiplier || 1;
	if(block.prop) console.log("and we have ", block, newFactor, oldFactor);
	return newFactor * oldFactor;
}

/////////////////////////////
//
// Utility functions III
// 
// Functions for reading and writing durations for events

/**
 * Given a count of beats, writes dur.ges to an element (appends 'b'
 * and, if there's a dot of augmentation, multiplies by 1.5)
 * @param  {Integer} num Core duration in minims
 * @param {DOMElement} el mei:note
 * @param {Boolean} dot Is there a dot of augmentation?
 */
function writeDur(num, el, dot){
/*	if(dot) el.setAttributeNS(null, 'dur.ges', (1.5*num)+'b');
		else el.setAttributeNS(null, 'dur.ges', num+'b');*/
	var scaledNum = num * proportionMultiplier(el);
	if(dot) {
		// looks like num and numbase, in Verovio at least, excludes dots,
		// and duration calculations exclude separate elemnt dots
		//		num *= 1.5;
		el.setAttributeNS(null, 'dots', 1);
		el.setAttributeNS(null, 'dur.intermediate', (num*1.5)+'b');
		el.setAttributeNS(null, 'dur.ges', (scaledNum*1.5)+'b');
	} else {
		el.setAttributeNS(null, 'dur.ges', scaledNum+'b');
		el.setAttributeNS(null, 'dur.intermediate', num+'b');
	}
	// This is for Verovio. Needs fixing.
	var defaultLength = dupleMinimCountFromElement(el);
	if(defaultLength){
		if(Math.floor(num)!= num){
			// FIXME: use lcd
			num *= 12;
			defaultLength *= 12;
		}
		el.setAttributeNS(null, 'num', defaultLength);
		el.setAttributeNS(null, 'numbase', num);
	} 
}

/**
 * True if e1 and e2 are notes or rests at the same mensural level
 * (e.g. minima or semibrevis)
 * @param {DOMObject} e1 mei:note or mei:rest
 * @param {DOMObject} e2 mei:note or mei:rest
 * @returns {Boolean} 
 */
function leveleq(e1, e2){
	return e1.getAttributeNS(null, 'dur')===e2.getAttributeNS(null, 'dur');
}

/**
 * Write duration information for a note that we've decided should be
 * the simplest form of imperfection (subtract a third). For other
 * imperfection, use {@link writeImperfection}
 * @param {DOMElement} el mei:note
 * @param {Integer} reduceBy Time (in minims) to subtract
 * @param {DOMElement} mens mei:mensur
 * @param {String} rule Reference for rule used to decide this
 * (written to element as @rule)
 *
 */
function writeSimpleImperfection(el, mens, rule){
	//	el.setAttributeNS(null, 'dur.ges', (2 * simpleMinims(el, mens) / 3) + 'b');
	writeDur((2 * simpleMinims(el, mens) / 3), el, false);
//	el.setAttributeNS(null, 'num', 2);
//	el.setAttributeNS(null, 'numbase', 3);
	el.setAttributeNS(null, 'dur.quality', 'imperfectio');
	el.setAttributeNS(null, 'quality', 'i');
	el.setAttributeNS(null, 'rule', rule);
}

/**
 * Write duration information for a note that we've decided should be
 * imperfected
 * @param {DOMElement} el mei:note
 * @param {Integer} reduceBy Time (in minims) to subtract
 * @param {DOMElement} mens mei:mensur
 * @param {String} rule Reference for rule used to decide this
 * (written to element as @rule)
 */
function writeImperfection(el, reduceBy, mens, rule){
	var defaultDur = simpleMinims(el, mens);
	var factor = gcd(defaultDur, reduceBy);
	var finalDur = defaultDur - reduceBy
	writeDur(finalDur, el, false);
//	el.setAttributeNS(null, 'num', finalDur / factor);
//	el.setAttributeNS(null, 'numbase', defaultDur / factor);
	el.setAttributeNS(null, 'dur.quality', 'imperfectio');
	el.setAttributeNS(null, 'quality', 'i');
	el.setAttributeNS(null, 'rule', rule);	
}

/**
 * Write duration information for a note that we've decided should be
 * altered
 * @param {DOMElement} el mei:note
 * @param {DOMElement} mens mei:mensur
 * @param {String} rule Reference for rule used to decide this
 * (written to element as @rule)
 */
function writeAlteration(el, mens, rule){
	//	el.setAttributeNS(null, 'dur.ges', (2 * simpleMinims(el, mens)) + 'b');
	writeDur((2 * simpleMinims(el, mens)), el, false);
//	el.setAttributeNS(null, 'num', 2);
//	el.setAttributeNS(null, 'numbase', 1);
	el.setAttributeNS(null, 'dur.quality', 'alteratio');
	el.setAttributeNS(null, 'quality', 'a');
	el.setAttributeNS(null, 'rule', rule);
}

/**
 * Given an event with dur.ges of the form [0-9]*b, return the integer
 * part
 * @param {DOMElement} mei:note or mei:rest
 * @return {Integer}
 */
function readDur(el){
	var str = el.getAttributeNS(null, 'dur.intermediate');
	return str ? Number(str.substring(0, str.length-1)) : false;
}

/////////////////////////////
//
// Utility functions IV
// 
// Simple rhythm functions

/**
 * Convert mei:@dur to an integer (semifusa=0, semibrevis=4, maxima=7)
 * @param {String} dur @dur string
 * @return {Integer}
 */
function noteIntFromDur(dur){
	return ['semifusa', 'fusa', 'semiminima', 'minima', 'semibrevis', 'brevis', 'longa', 'maxima'].indexOf(dur);
}

/**
 * @num and @numbase seem to be relative to a purely imperfect
 * interpretation of note division. This function takes an element and
 * returns the number of minims it would consist of if all notes
 * divided into two parts. For notes shorter than a minim, it returns false
 * @param {DOMElement} el An mei:note or mei:rest
 * @returns {Integer | Boolean} 
 */
function dupleMinimCountFromElement(el){
	var level = noteInt(el);
	if(level<3) return false;
	return Math.pow(2, level-3);
}

/**
 * Return the duration level of a note or rest as an integer (semifusa=0, semibrevis=4, maxima=7)
 * @param {DOMObject} el mei:note or mei:rest (or other object with mei:@dur
 * @return {Integer}
 */
function noteInt(el){
	return noteIntFromDur(el.getAttributeNS(null, 'dur'));
}
/**
 * A note or rest is regularly perfect if it or any parts of it are
 * are ternary according to the mensuration sign. 
 * @param {DOMObject} element
 * @mensur {DOMObject} mei:mensur element
 * @return {Boolean}
 */
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

/**
 * Given the output of {@link mensurSummary}, return an array of minim
 * counts for each level.
 * @param {Array} mensurSummary Mensural structure (2 for
 * duple/imperfect and 3 for triple/perfect for each level)
 * @param {Integer} [maxLevel=4] Stopping point
 * @return {Array}
 */
function minimStructures(mensurSummary, maxLevel){
	var counts = [];
	var minims = 1;
	for(var i=0; i < (maxLevel ? maxLevel : 4); i++){
		minims = minims*(mensurSummary[i] ? mensurSummary[i] : 2);
		counts.push(minims);
	}
	return counts;
}

/**
 * Calculate the number of breves between two times, specified as
 * the number of mensural units into the current section (so [subminims,
 * minims, semibreves, breves, longs, maximas])
 * @param {Array} struct2 Timepoint
 * @param {Array} struct2 Timepoint
 * @param {DOMObject} mens mei:mens element
 * @return {Number} Number of breve beats separating the notes
 */
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

/**
 * Return the number of unit beats since the beginning of the larger
 * unit (e.g. semibreve 2 of its breve)
 * @param {Integer} minimsInUnit Duration of unit (in minims)
 * @param {Integer} minimsInParentUnit
 * @param {Integer} startMinims Number of minims since start of piece
 * or section
 * @return {Object} Object with attributes for beat and remainder
 */
function beatOfUnit(minimsInUnit, minimsInParentUnit, startMinims){
	var rem1 = startMinims % minimsInParentUnit;
	var rem2 = rem1 % minimsInUnit;
	var beat = Math.floor(rem1 / minimsInUnit);
	return {beat: beat, remainder:rem2}; 
}

/**
 * Return true if event is a dot of augmentation. Assumes that this is
 * indicated using @mei:form=aug. In the longer term, this might be
 * the place to put more sophisticated reasoning in (or it might be
 * better as a pre-processing step).
 * @param {DOMObject} event Probably an mei:dot
 * @returns {Boolean} 
 */
function augDot(event){
	return event.tagName==='dot' && event.getAttributeNS(null, 'form')==='aug';
}
/**
 * Return true if event is a note or rest
 * @param {DOMObject} event Event from MEI
 * @returns {Boolean} 
 */
function noteOrRest(event){
	return event.tagName==='rest' || event.tagName==='note';
}

/**
 * Return true if event is a dot of division. Assumes that this is
 * indicated using @mei:form!=aug. In the longer term, this might be
 * the place to put more sophisticated reasoning in (or it might be
 * better as a pre-processing step).
 * @param {DOMObject} event Probably an mei:dot
 * @returns {Boolean} 
 */
function divisionDot(event){
	return event.tagName==='dot' && event.getAttributeNS(null, 'form')!=='aug';
}

/////////////////////////////
//
// Utility functions V
// Functions that know something about mensuration

/**
 * Reads the attributes of a mei:mensur element and returns a
 * four-element array of 2s or 3s for the perfection of each level
 * from prolation to major modus
 * @param {DOMElement} mensur mei:mensur element
 * @return {Array} Four-element array
 */ 
function mensurSummary(mensur){
	return [mensur.getAttributeNS(null, 'prolatio'), mensur.getAttributeNS(null, 'tempus'), mensur.getAttributeNS(null, 'modusminor'), mensur.getAttributeNS(null, 'modusmaior')].map(x=>x?parseInt(x, 10) : false);
}

/**
 * Return the number of minims that a given note would be expected to
 * have, given the prevailing mensuration.
 * @param {DOMElement} el mei:note
 * @param {DOMElement} mens mei:mensur
 * @param {Integer} levelAdjust Displaces the note level (so, if el is
 * a minim, 1 for levelAdjust will treat it as a semibreve)
 * @param {integer} Minim count
 */
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

/**
 * Return the beat number of an element within its parent metrical
 * unit (e.g. second semibreve in its breve). 
 * @param {DOMObject} el mei:note or mei:rest
 * @param {DOMObject} mensur mei:mensur
 * @param {Integer} levelAdjust Find the beat number for a different
 * mensural level (1 for the next longer level, -1 for the next
 * shorter, etc.)
 * @return {Integer}
 */
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
/**
 * Return an array of an event's position with respect to all mensural
 * levels.
 * @param {Number} startMinims Minim steps since the start of the
 * counting period
 * @parm {DOMObject} mens mei:mensur
 */
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

/**
 * True if the supplied element is a note contained in a ternary unit
 * @param {DOMObject} el
 * @param {DOMObject} mensur
 * @returns {Boolean} 
 */
function isAlterable(el, mensur){
	var m = mensurSummary(mensur);
	var durPos = noteInt(el) - 3;
	if(durPos<0 || durPos>3 || (m[durPos]===2 || m[durPos]===false) || el.tagName==="rest"){
		return false;
	} else return true;
}

/**
 * Lists all levels that can be affected by alteration. Uses
 * 0=semifusa, 1=fusa, 2=minima, etc (n.b. Nothing below a minim can
 * be altered anyway).
 * @param {} mens
 * @returns {} 
 */
function alterableLevels(mens){
	var ms = mensurSummary(mens);
	var als = [];
	for(var i=0; i<4; i++){
		if(ms[i]===3){
			als.push(i+3);
		}
	}
	return als;
}

/**
 * True if the level in the first argument can imperfect the level in
 * the second, given the prevailing mensuration.
 * @param {Integer} shortLevel Level (semifusa=0, fusa=1,...maxima=7) of shorter note
 * @param {Integer} longLevel Level (semifusa=0, fusa=1,...maxima=7) of longer note
 * @param {Array} menssum Summary of mensuration (as returned by {@link mensurSummary}
 * @returns {Boolean} 
 */
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

/**
 * Is note perfect as a whole, i.e. is it divisible into 3 direct
 * parts (for example, a breve is regularly perfect in perfect tempus,
 * minor prolation and in imperfect tempus, major prolation, but only
 * in the former case is it perfect as a whole)
 * @param {} note
 * @param {} mens
 * @returns {} 
 */
function notePerfectAsWhole(note, mens){
	if(note.tagName='note'){
		var level = noteInt(note);
		var msum = mensurSummary(mens);
		return ([false, false, false, false].concat(msum))[level] === 3;
	} return false;
}

/**
 * Returns the minim counts for all levels that can imperfect elemnt
 * @param {DOMObject} element
 * @param {DOMObject} mensur
 * @returns {Array} 
 */
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
//	console.log(mensum, elLevel, perf, minimStructures(mensum));
	if(perf || perf===0){
		var possibilities = [1].concat(minimStructures(mensum, perf));
		return possibilities;
	}
	return [];
}

/**
 * Return an integer (semifusa=0, fusa=1,...maxima=7) of the first
 * (shortest) level that is divisible into 3 parts.
 * @param {DOMObject} mensuration mei:mensur
 * @returns {Integer} Mensural level
 */
function firstPerfectLevel(mensuration){
	var firstPerf = mensurSummary(mensuration).indexOf(3);
	if(firstPerf===-1){
		return 20;
	} else {
		return firstPerf+3;
	}
}

/////////////////////////////
//
// Functions to support windowing or for finding the extent to look ahead or back

/**
 * Forward window support – find the next note that's at least as
 * long, or find a dot of division
 * @param {integer} level Level of the note
 * @param {integer} index Index of the current event (start point for the search)
 * @param {Array} seq Array of events
 * @return {(integer|boolean)} Position if found (false if not)
 */
function indexOfNextSameOrLongerOrDot(level, index, seq){
	for(var i=index+1; i<seq.length; i++){
		if((seq[i].tagName==='dot' && seq[i].getAttributeNS(null, 'form')!=='aug')
			 || (noteInt(seq[i])>=level)){
			return i;
		}
	}
	return false;
}

/**
 * Forward window support – find the next dot of division
 * @param {Integer} index Index of the current event (start point for the seach
 * @param {Array} seq Array of events
 * @return {Integer} Position if found (false if not)
 */
function indexOfNextDot(index, seq){
	for(var i=index+1; i<seq.length; i++){
		if(seq[i].tagName==='dot' && seq[i].getAttributeNS(null, 'form')!=='aug'){
			return i;
		}
	}
	return false;
}

/**
 * Backward window support – find the previous note that's at least as
 * long, or find a dot of division
 * @param {Integer} level Level of the note
 * @param {Integer} index Index of the current event (end point for the search)
 * @param {Array} seq Array of events
 * @return {Integer} Position if found (false if not)
 */
function indexOfPrevLongerOrDot(level, index, seq){
	for(var i=index-1; i>=0; i--){
		if((seq[i].tagName==='dot' && seq[i].getAttributeNS(null, 'form')!=='aug')
			 || noteInt(seq[i])>level){
			return i;
		}
	}
	return -1;
}

/**
 * Get exact, estimated and minimum durations for a window, naively
 * calculated. The returned object has attibutes for definite,
 * bareMinimum (including possible extremes of imperfection),
 * approximateMinimum (less extreme) and approximation ('most likely')
 * 
 */
function windowDuration(events, mens){
	var duration = {definite: 0, bareMinimum: 0, approximateMinimum: 0, approximation: 0};
	var definite = true;
	for(var i=0; i<events.length; i++){
		var event = events[i];
		if(event.tagName==="note"||event.tagName==="rest"){
			if(event.getAttributeNS(null, 'dur.intermediate')) {
				var durString = event.getAttributeNS(null, 'dur.intermediate');
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

/**
 * Often, rests are grouped vertically to indicate coherent mensural
 * units – in effect, the vertical displacement acting as a dot of
 * division. check whether two (implicitly adjacent) rests behave like
 * that.
 * @param {Integer} maxLevel Highest mensural level that we're
 * interested in (expressed as 0=semifusa, 1=fusa, etc.)
 * @param {DOMObject} rest1 mei:rest
 * @param {DOMObject} rest2 mei:rest
 * @param {String} direction "left" | "right"
 * @returns {Boolean} 
 */
function divisionLikeRests(maxLevel, rest1, rest2, direction){
	return ((!direction && noteInt(rest1)<maxLevel && noteInt(rest2)<maxLevel)
					|| (direction==="left" && noteInt(rest1)<maxLevel)
					|| (direction==="right" && noteInt(rest2)<maxLevel))
		&& rest1.tagName==='rest' && rest2.tagName==='rest'
		&& rest1.getAttributeNS(null, 'loc') !== rest2.getAttributeNS(null, 'loc');
}

/**
 * Returns true if a duration (in minims) is 3, 6 or 9 times the
 * length of any of a list of candidate values, otherwise returns
 * false. This is for durations of windows of notes, to see whether
 * they represent a coherent block of whole mensural units (which is
 * likely to imply that they fall on the beat and that they don't
 * imperfect their neighbours).
 * @param {Integer} minimCount
 * @param {Array} possibleDivisors
 * @returns {} 
 */
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

/////////////////////////////
//
// Functions for adding duration where no start position is known

/**
 * Since rests can't be altered or imperfected, all rests can be
 * resolved immediately
 * @param {Array} sectionBlocks Array of all the coherent areas of
 * mensurations in a section
 */
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
/**
 * Colored notation is assumed to be simple duple and labelled accordingly
 * @param {Array} sectionBlocks Array of all the coherent areas of
 * mensurations in a section
 */
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
			}
		}
	}
}
/**
 * Simple processing of dots of augmentation (other dots ignored
 * @param {Array} sectionBlocks Array of all the coherent areas of
 * mensurations in a section
 */
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
/**
 * Resolves durations for any note that is not regularly perfect and
 * that is not a direct part of a ternary note (so isn't alterable).
 * @param {Array} sectionBlocks Array of all the coherent areas of
 * mensurations in a section
 */
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
/**
 * Resolves any alterations that can be treated as simple local note
 * patterns
 * @param {Array} sectionBlocks Array of all the coherent areas of
 * mensurations in a section
 *
 */ 
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
									event.setAttributeNS(null, 'rule', 'A.2b');
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

/**
 * If a note is followed immediately by a note or rest at the same
 * level (see {@link leveleq}), the former cannot be imperfected. Such
 * notes can have duration labelled immediately.
 * @param {Array} sectionBlocks Array of all the coherent areas of
 * mensurations in a section
 */
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

/**
 * Check an event for evidence of alteration. Alters event if it falls
 * after a longer note followed by its own duration. Where there is
 * uncertainty about the intervening duration, rule out alteration if
 * the minimum interpretation of that duration is too long. We assume
 * that the calling function has established that the ensuing durations 
 * are suitable.
 * @param {DOMObject} event mei:note (rests can't be altered)
 * @param {Integer} index The note's position in events
 * @param {Array} events Sequence of events in this section for this voice 
 * @param {DOMObject} mens mei:mensur
 * @returns {DOMObject} This function returns the altered event (why?) 
 */
function checkForGeneralAlteration(event, index, events, mens){
	var level = noteInt(event);
	var starts = indexOfPrevLongerOrDot(level, index, events);
	var leftWindow = events.slice(starts+1, index);
	var durations = windowDuration(leftWindow, mens);
	//	var defaultLength = proportionMultiplier(event) * simpleMinims(event, mens);
	var defaultLength = simpleMinims(event, mens);
	if(durations.definite || durations.bareMinimum == 0){
		if(durations.definite==defaultLength){
			writeAlteration(event, mens, 'A.2');
		} else {
			if(event.getAttributeNS(null, 'mensurBlockStartsAt')==="20") console.log("x", leftWindow, durations);
			event.setAttributeNS(null, 'rule', 'A.xxx');
//			event.setAttributeNS(null, 'dur.ges', simpleMinims(event, mens)+'b');
			writeDur(simpleMinims(event, mens), event, false);
		}
	} else if(durations.bareMinimum > defaultLength){
		// not altered
		if(event.getAttributeNS(null, 'mensurBlockStartsAt')==="20") console.log("z", durations);
		event.setAttributeNS(null, 'rule', 'A.xxz');
//		event.setAttributeNS(null, 'dur.ges', simpleMinims(event, mens)+'b');			
		writeDur(simpleMinims(event, mens), event, false);
	}
	return event;
}


////////////////////////////
//
// Given a beat position, what can we work out?

// 1. Check imperfection rules:

/**
 * Having sifted the trivial cases out, attempts to resolve cases that
 * rely on context, particularly the shorter notes that follow this one.
 * @param {DOMObject} event mei:note (rest would have been resolved already)
 * @param {Array} window List of following events (until the next
 * division dot or equivalent, or the next event of similar or greater
 * length).
 * @param {DOMObject} mens mei:mensur
 * @returns {DOMObject} This function returns the modified event (why?)
 */
function firstBeatImperfectionCheck(event, window, mens){
	var level = noteInt(event);
	var duration = windowDuration(window, mens);
//	if(level==5) console.log(event, duration);
	var imperfectionPossibilities = imperfectingLevels(event, mens);
//	console.log(imperfectionPossibilities);
	if(duration.definite){
		while(imperfectionPossibilities.length){
			var nextToTry = imperfectionPossibilities.pop();
			var imperfectingUnits = duration.definite / nextToTry;
			if(imperfectingUnits===1){
				writeImperfection(event, nextToTry, mens, 'I.4a');
				return true;
			} else if (imperfectingUnits===2){
				if(isAlterable(window[window.length-1], mens)){
					event.setAttributeNS(null, 'rule', 'I.5');
					event.setAttributeNS(null, 'quality', 'p');
//					event.setAttributeNS(null, 'dur.ges', simpleMinims(event, mens)+'b');
					writeDur(simpleMinims(event, mens), event, false);
					event.setAttributeNS(null, 'comment', 'trusting in alteration');
				} else {
					writeImperfection(event, nextToTry, mens, 'I.5-add');
					event.setAttributeNS(null, 'comment', 'Alteration is impossible');
				}
				///WTF!!!!!?!
				return false;
			} else if (imperfectingUnits===3 || imperfectingUnits===6 || imperfectingUnits===9){
				event.setAttributeNS(null, 'rule', 'I.6');
				event.setAttributeNS(null, 'quality', 'p');
//				event.setAttributeNS(null, 'dur.ges', simpleMinims(event, mens)+'b');
				writeDur(simpleMinims(event, mens), event, false);
				return false;
			} else if (imperfectingUnits>3){
				writeImperfection(event, nextToTry, mens, 'I.4b');
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
		writeImperfection(event, imperfector, mens, 'I.4bi');
		event.setAttributeNS(null, 'defaultminims', simpleMinims(event, mens));
		event.setAttributeNS(null, 'imperfectedBy', imperfector);
		return true;		
	} else if(duration.approximateMinimum > 3 * imperfectionPossibilities[imperfectionPossibilities.length-1]){
		var imperfector = imperfectionPossibilities[imperfectionPossibilities.length-1];
		writeImperfection(event, imperfector, mens, 'I.4bii');
		event.setAttributeNS(null, 'defaultminims', simpleMinims(event, mens));
		event.setAttributeNS(null, 'imperfectedBy', imperfector);
		return true;		
	} else {
		console.log('failed to resolve', event, mens, duration);
	}
}

/**
 * Given an event on the first beat, if we can tell if it's perfect,
 * label the duration. Checks simpler rules (I.3 and I.4 from the
 * rulelist). If the note remains unresolved, calls {@link
 * firstBeatAlterationCheck} with a context window of events that
 * might affect the decision.
 * @param {DOMObject} event mei:note (rest would have been resolved already)
 * @param {Integer} index The note's position in events
 * @param {Array} events Sequence of events in this section for this voice 
 * @param {DOMObject} mens mei:mensur
 * @returns {DOMObject} This function returns the modified event (why?)
 */
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
		return true;

	} else {
		return firstBeatImperfectionCheck(event, rightWindow, mens);
	}
}

/**
 * Given an event on the second beat, if we can tell if it's perfect,
 * label the duration. Checks rule I.8 from the rulelist
 * @param {DOMObject} event mei:note (rest would have been resolved already)
 * @param {Integer} index The note's position in events
 * @param {Array} events Sequence of events in this section for this voice 
 * @param {DOMObject} mens mei:mensur
 * @returns {DOMObject} This function returns the modified event (why?)
 */
function secondBeatImperfection(event, index, events, mens){
	// Let's pretend this is easy, and apply I.8 as if we *knew* that
	// something earlier can imperfect this
	writeSimpleImperfection(event, mens, 'I.8');
	return event;	
}

/**
 * Given an event on the third beat, if we can tell if it's perfect,
 * label the duration. Checks rule I.9 from the rulelist
 * @param {DOMObject} event mei:note (rest would have been resolved already)
 * @param {Integer} index The note's position in events
 * @param {Array} events Sequence of events in this section for this voice 
 * @param {DOMObject} mens mei:mensur
 * @returns {DOMObject} This function returns the modified event (why?)
 */
function thirdBeatImperfection(event, index, events, mens){
	// More complex
	var imperfectionPossibilities = imperfectingLevels(event, mens);
	var nextDotPos = indexOfNextDot(index, events);
	// Simplest imperfection
	if(nextDotPos && nextDotPos - index < 6 && imperfectionPossibilities.indexOf(windowDuration(events.slice(index+1, nextDotPos), mens).approximation)>-1){
		// There's a simple explanation, that is imperfection from behind
		writeImperfection(event, windowDuration(events.slice(index+1, nextDotPos), mens).approximation,
											mens, 'I.9b');
	} else {
		// imperfection from ahead (by how much?)
		writeImperfection(event, imperfectionPossibilities[imperfectionPossibilities.length-1],
											mens, 'I.9a');
	}
	return event;
}

/**
 * Currently a placeholder for deciding the imperfection status of a
 * note that isn't on beats 1, 2 or 3
 * @param {DOMObject} event mei:note (rest would have been resolved already)
 * @param {Integer} index The note's position in events
 * @param {Array} events Sequence of events in this section for this voice 
 * @param {DOMObject} mens mei:mensur
 * @returns {DOMObject} This function returns the altered event (why?)
 * @returns {DOMObject} Returns the event (unmodified at the moment)
 */
function midBeatImperfection(event, index, events, mens){
	// More complex
	return event;
}

// 1. Check alteration rules:

/**
 * Given an event on the first beat, if we can tell if it's altered,
 * label the duration. 
 * @param {DOMObject} event mei:note (rest would have been resolved already)
 * @param {Integer} index The note's position in events
 * @param {Array} events Sequence of events in this section for this voice 
 * @param {DOMObject} mens mei:mensur
 * @returns {DOMObject} This function returns the modified event (why?)
 */
function firstBeatAlteration(event, index, events, mens){
	return checkForGeneralAlteration(event, index, events, mens);
}

/**
 * Given an event on the second beat, if we can tell if it's altered,
 * label the duration. Currently, absolutely assumes alteration is appropriate.
 * @param {DOMObject} event mei:note (rest would have been resolved already)
 * @param {Integer} index The note's position in events
 * @param {Array} events Sequence of events in this section for this voice 
 * @param {DOMObject} mens mei:mensur
 * @returns {DOMObject} This function returns the modified event (why?)
 */
function secondBeatAlteration(event, index, events, mens){
	// second beat is special...
	event.setAttributeNS(null, 'rule', 'A.1');
	event.setAttributeNS(null, 'quality', 'a');
	writeDur(2*simpleMinims(event, mens), event, false);
//	event.setAttributeNS(null, 'dur.ges', simpleMinims(event, mens)*2+'b');
	return event;
}

/**
 * Given an event on the third beat, if we can tell if it's altered,
 * label the duration.
 * @param {DOMObject} event mei:note (rest would have been resolved already)
 * @param {Integer} index The note's position in events
 * @param {Array} events Sequence of events in this section for this voice 
 * @param {DOMObject} mens mei:mensur
 * @returns {DOMObject} This function returns the modified event (why?)
 */
function thirdBeatAlteration(event, index, events, mens){
	return checkForGeneralAlteration(event, index, events, mens);
}


/**
 * Currently a placeholder for deciding the alteration status of a
 * note that isn't on beats 1, 2 or 3
 * @param {DOMObject} event mei:note (rest would have been resolved already)
 * @param {Integer} index The note's position in events
 * @param {Array} events Sequence of events in this section for this voice 
 * @param {DOMObject} mens mei:mensur
 * @returns {DOMObject} This function returns the altered event (why?)
 * @returns {DOMObject} Returns the event (unmodified at the moment)
 */
function midBeatAlteration(event, index, events, mens){
	return event;
}



///////////////////////////
/*
 * If event[n] has both a duration assigned to it and a start time,
 * adds a start time for event[n+1]
 * @param {Array} sectionBlocks Array of all the coherent areas of
 * mensurations in a section
 */
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
/**
 * Add start times for all events in block for which that's possible
 * (i.e. where the start and duration of the previous note is known).
 * @param {Object} block Object with attributes for events and
 * mensuration sign
 */
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


/**
 * Indicates where an event falls in larger-scale mensural structures,
 * also singling out which breve beat an event falls on and whether it
 * crosses one (adds @beatPos, @onTheBreveBeat and @crossedABreveBeat)
 * @param {Object} block 
 */ 
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



////////////////////
//
// Calling the analysis functions
/**
 * Runs resolution steps that aren't dependant on any rhythms or beat
 * positions already having been solved. These are: rests (which can't
 * be altered or imperfected anyway); coloration; dots of
 * augmentation; notes below the first perfect/alterable level;
 * trivial alterations (based on pattern, not beat position); ante
 * simile.
 *
 * @param {Array} sectionBlocks Array of all the coherent areas of
 * mensurations in a section
 */
function beatIndependentDurations(sectionBlocks){
	labelRests(sectionBlocks);
	actOnColoration(sectionBlocks);
	actOnDots(sectionBlocks);
	allUnalterableImperfectLevels(sectionBlocks);
	simplestAlterations(sectionBlocks);
	anteSim(sectionBlocks);
}

/**
 * More complex stages, for where knowledge is partial and patchy
 * @param {Array} sectionBlocks Array of all the coherent areas of
 * mensurations in a section
 *
 */
var propNum = false;
var propDiv = false;
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

/////////////////////////////
//
// Features for machine learning
//
// MEI walk

function makeFeatureSequencesForML(MEIDoc, noHeaders=false, featureset=SIMPLEFEATURESET){
	// First, get sections that do not themselves contain sections (so
	// are leaf nodes in terms of document structure
	var sections = getAtomicSections(MEIDoc);
	var features = [];
	var layerMens = [];
	var standardHeader = noHeaders ? [] : makeARFFHeader(featureset);
	var defaultMens = getStaffDefMens(MEIDoc);
	for (var seci=0; seci<sections.length; seci++){
		var layers = getLayers(sections[seci]);
		if(!layerMens.length) layerMens = layers.map(l=>getMatchingStaffDef(l, defaultMens));
//		var sectionFeatures = [];
//		features.push(sectionFeatures);
		for(var layi=0; layi<layers.length; layi++){
			var layer = layers[layi];
			// var layerFeatures = [];
			// sectionFeatures.push(layerFeatures);
			var blocks = getEventsByMensurationForSection(layer, MEIDoc.doc, layerMens.length > layi? layerMens[layi] : false);
			layerMens[layi] = blocks[blocks.length-1].mens;
			for(var blocki=0; blocki<blocks.length; blocki++){
				var block = blocks[blocki];
				// var blockFeatures = [];
				// var blockFeatureObj = {arr: blockFeatures, str: standardHeader};
				// layerFeatures.push(blockFeatureObj);
				// I'm taking a block (musical unit with a single mensuration as a separate thing
				for(var eventi=0; eventi<block.events.length; eventi++){
					var event = block.events[eventi];
					if(event.tagName==="note"){
//						var eventFeatures = [event.getAttribute("xml:id")];
						var eventFeatures = [];
						features.push(eventFeatures);
						for(var featurei=0; featurei<featureset.length; featurei++){
//							console.log(eventFeatures.length, block, "<-------");
							featureset[featurei].calculate(event, eventi, block, eventFeatures);
						}
						standardHeader.push(eventFeatures.join(","));
					}
				}
			}
		}
	}
	return standardHeader.join("\n") + "\n";
}
exports.makeFeatureSequencesForML = makeFeatureSequencesForML;

function getStaffDefMens(doc){
	// Staffdef has all the appropriate attributes to pretend to be a mensur
	// N.B. Assumes one per staff (i.e. no changes)
	sds = doc.doc.documentElement.getElementsByTagName('staffDef');
	mens = [];
	Array.prototype.forEach.call(sds, sd=>{
		mens[Number(sd.getAttributeNS(null, 'n'))] = sd;
	});
	return mens;
}
function getMatchingStaffDef(layer, staffDefs){
	return staffDefs[getStaffNo(layer)];
}
function getStaffNo(element){
	var parent = element.parentNode;
	while(parent){
		if(parent.tagname!=='staff') return Number(parent.getAttributeNS(null, 'n'));
		parent = parent.parentNode;
	}
}
function addFeatureDatum(event, index, block, features){
	features.push(this.test(event, index, block, features));
}
function attributeEq(obj, key, value){
	return obj.getAttributeNS(null, key) && obj.getAttributeNS(null, key)==value;
}
function attributeTestFun(key, value){
	return function(obj){return attributeEq(obj, key, value) ? '1' : '0'};
}
function attributeValueFun(key){
	return function(obj) {
		if(obj.getAttributeNS(null, key))
			return obj.getAttributeNS(null, key);
		else
			return "-";
	}
}
function simAnteSim(e1, e2){
	return ((e1.tagName==="note" || e1.tagName=="rest")
					&& (e1.tagName==="note" || e1.tagName=="rest")
					&& e1.getAttributeNS(null, 'dur')===e2.getAttributeNS(null, 'dur')) ? "1" : "0"
}
function eventLevel(){
	if(this.tagName==='note' || this.tagName==='rest') return noteInt(this);
	return '-';
}
function displacedSuccessiveEventsFun(fun, displacement, def){
	return function(e, i, b){
		return (i+displacement>0 && i+displacement+1<b.events.length
						? fun.apply(null, [b.events[i+displacement], b.events[i+1+displacement]])
						: (def ? def : '-'));
	}
}
function displacedEventFun(fun, displacement){
	return function(e, i, b) {
		return (i+displacement>0 && i+displacement<b.events.length) ? fun.apply(b.events[i+displacement], [b.events[i+displacement],e,i,b]) : '-'};
}
function displacedBooleanEventFun(fun, displacement){
	return function(e, i, b) {
		return (i+displacement>0 && i+displacement<b.events.length) ? (fun.apply(b.events[i+displacement], [b.events[i+displacement],e,i,b]) ? '1' : '0') : '0'};
}
function displacedEventFunGenerator(fun){
	return function(displacement){
		return function(e, i, b) {
			return (i+displacement>0 && i+displacement<b.events.length) ? fun.apply(b.events[i+displacement], [b.events[i+displacement],e,i,b]) : '-';
		}
	}
}
function displacedBooleanEventFunGenerator(fun){
	return function(displacement) {
		return function(e, i, b) {
			return (i+displacement>0 && i+displacement<b.events.length) ? (fun.apply(b.events[i+displacement], [b.events[i+displacement],e,i,b]) ? '1' : '0') : '0';
		}
	}
}
function comparisonBooleanFunGenerator(fun){
	return function(displacement){
		return function(e, i, b){
			return (i+displacement>0 && i+displacement<b.events.length)
				? (fun.apply(null, [b.events[i+displacement], e, i, b]) ? '1' : '0')
				: '0';
		}
	}
}
function comparisonFunGenerator(fun){
	return function(displacement){
		return function(e, i, b){
			return (i+displacement>0 && i+displacement<b.events.length)
				? fun.apply(null, [b.events[i+displacement], e, i, b])
				: '-';
		}
	}
}
function last(arr){
	return arr[arr.length-1];
}
function durationBefore(event, index, block){
	var events = block.events;
	var level = noteInt(event);
	var starts = indexOfPrevLongerOrDot(level, index, events);
	var leftWindow = events.slice(starts+1, index);
	if(leftWindow.length===0) return 0;
	var durations = windowDuration(leftWindow, block.mens);
	var dur = durations.definite ? durations.definite
			: (durations.approximation ? durations.approximation
				 : durations.minimum ? durations.minimum : false);
	if(!dur && dur!==0) return '-';
	var baseDur = last(imperfectingLevels(event, block.mens));
	var units  = dur / baseDur;
	if([0, 1, 2, 3, 6, 9].indexOf(units)>-1) return units;
	if(units>3) return 'long';
	else return 'odd';
}
function durationAfter(event, index, block){
	var events = block.events;
	var level = noteInt(event);
	var ends = indexOfNextSameOrLongerOrDot(level, index, events);
	var rightWindow = ends ? events.slice(index+1, ends) : events.slice(index+1);
	if(rightWindow.length===0) return 0;
	var durations = windowDuration(rightWindow, block.mens);
	var dur = durations.definite ? durations.definite
			: (durations.approximation ? durations.approximation
				 : durations.minimum ? durations.minimum : false);
	if(!dur && dur!==0) return '-';
	var baseDur = last(imperfectingLevels(event, block.mens));
	var units  = dur / baseDur;
	if([0, 1, 2, 3, 6, 9].indexOf(units)>-1) return units;
	if(units>3) return 'long';
	else return 'odd';
}

function canImperfectCurrent(shorter, longer, i, block){
	var shortLevel = noteInt(shorter);
	var longLevel = noteInt(longer);
	if(shortLevel < longLevel){
		return canImperfect(noteInt(shorter), noteInt(longer), mensurSummary(block.mens));
	} else return false;
}
function levelDifference(a, b){
	return (noteOrRest(a) && noteOrRest(b)) ?  noteInt(b) - noteInt(a) : '-';
}
function levelTestFun(levelAdjust){
	return function(event, index, block){
		var eventLevel = noteInt(event)+levelAdjust;
		if(eventLevel < 4) return '0';
		return mensurSummary(block.mens)[eventLevel-4]=='3' ? '1' : '0';
	}
}

function Feature(name, type, mainfun, testfun){
	this.name = name;
	this.type = type;
	this.ARFFType = function(){
		switch(this.type){
			case "boolean":
				return "{1,0}";
			case "numeric":
				return "NUMERIC";
			default:
				return this.type;
		}
	}
	this.test = testfun;
	this.calculate = mainfun;
}

const ID = new Feature("ID", "string", addFeatureDatum, attributeValueFun("xml:id"));
const QUALITY = new Feature("Quality", "{-,a,p,i}", addFeatureDatum, attributeValueFun("quality"));
const SIMPLER_QUALITY = new Feature("Quality", "{-,a,i}", addFeatureDatum, (e)=>(e.getAttributeNS(null, 'quality') && e.getAttributeNS(null, 'quality')!=='p') ? e.getAttributeNS(null, 'quality') : '-');
const COLORATION = new Feature("Colored", "boolean", addFeatureDatum,
															 attributeTestFun("coloration", "true"));
const REG_PERFECT = new Feature("RegularlyPerfect", "boolean", addFeatureDatum,
																function(e, i, b, f){ return regularlyPerfect(e, b.mens) ? 1 : 0});
const ALTERABLE = new Feature("Alterable", "boolean", addFeatureDatum, (e, i, b)=>isAlterable(e, b.mens) ? "1" : "0");
const TRIPLE_LEVEL = new Feature("Triple", "boolean", addFeatureDatum, levelTestFun(0));
const TRIPLE_LEVELS_DOWN_3 = new Feature("TripleLevelsDown3", "boolean", addFeatureDatum, levelTestFun(-3));
const TRIPLE_LEVELS_DOWN_2 = new Feature("TripleLevelsDown2", "boolean", addFeatureDatum, levelTestFun(-2));
const TRIPLE_LEVELS_DOWN_1 = new Feature("TripleLevelsDown1", "boolean", addFeatureDatum, levelTestFun(-1));
const TRIPLE_LEVELS_UP_1 = new Feature("TripleLevelsUp1", "boolean", addFeatureDatum, levelTestFun(1));
const TRIPLE_LEVELS_UP_2 = new Feature("TripleLevelsUp2", "boolean", addFeatureDatum, levelTestFun(2));
const TRIPLE_LEVELS_UP_3 = new Feature("TripleLevelsUp3", "boolean", addFeatureDatum, levelTestFun(3));
const NOTE_LEVEL = new Feature("NoteLevel", "{0,1,2,3,4,5,6,7}", addFeatureDatum, noteInt);
const DURATION_AFTER = new Feature("DurationAfter", "{-,0,1,2,3,6,9,long,odd}", addFeatureDatum, durationAfter);
const DURATION_BEFORE = new Feature("DurationBefore", "{-,0,1,2,3,6,9,long,odd}", addFeatureDatum, durationBefore);

function makeFeatures(name, mainfun, range="{1,0}", windowSize=7, include0=false, ffun=addFeatureDatum){
	var fset = [];
	for(var i=-windowSize; i<=windowSize; i++){
		if(include0 || i){
			fset.push(new Feature(name+"_"+i, range, ffun, mainfun(i)));
		}
	}
	return fset;	
}

var NOTE_LEVELS = makeFeatures("NoteLevel", displacedEventFunGenerator(eventLevel), "{-,0,1,2,3,4,5,6,7}");
var DIV_DOTS = makeFeatures("DivDots", displacedBooleanEventFunGenerator(divisionDot));
var AUG_DOTS = makeFeatures("AugDots", displacedBooleanEventFunGenerator(augDot));
var ANTE_SIM = makeFeatures("AnteSim", displacedBooleanEventFunGenerator(simAnteSim),"{0,1}", 7,true);
var CAN_IMPERFECT = makeFeatures("CanImperfect", comparisonBooleanFunGenerator(canImperfectCurrent));
var NOTE_LEVEL_DIFF = makeFeatures("RelativeNoteLevel", comparisonFunGenerator(levelDifference), "{-,-7,-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,6,7}");
/*
var windowSize = 7;
for(var i=-windowSize; i<=windowSize; i++){
	if(i){
		NOTE_LEVELS.push(new Feature("NoteLevel_"+i, "{-,0,1,2,3,4,5,6,7}", addFeatureDatum, displacedEventFun(eventLevel, i)));
		DIV_DOTS.push(new Feature("DivDots_"+i, "{0,1}", addFeatureDatum, displacedBooleanEventFun(divisionDot, i)));
		AUG_DOTS.push(new Feature("AugDots_"+i, "{0,1}", addFeatureDatum, displacedBooleanEventFun(augDot, i)));
	}
	ANTE_SIM.push(new Feature("AnteSim_"+i, "{0,1}", addFeatureDatum, displacedSuccessiveEventsFun(simAnteSim, i, '0')));
}*/
var SIMPLEFEATURESET = [ID, ALTERABLE, COLORATION, REG_PERFECT, TRIPLE_LEVEL, TRIPLE_LEVELS_DOWN_3, TRIPLE_LEVELS_DOWN_2, TRIPLE_LEVELS_DOWN_1, TRIPLE_LEVELS_UP_1, TRIPLE_LEVELS_UP_2, TRIPLE_LEVELS_UP_3, ...NOTE_LEVELS, ...DIV_DOTS, ...AUG_DOTS,...ANTE_SIM, ...CAN_IMPERFECT, ...NOTE_LEVEL_DIFF, DURATION_BEFORE, DURATION_AFTER, SIMPLER_QUALITY];
/*
for(i=0; i<NOTE_LEVELS.length; i++){
	SIMPLEFEATURESET.push(NOTE_LEVELS[i]);
}
SIMPLEFEATURESET.push(QUALITY);
*/
function makeARFFHeader(featureset){
	var out = ["% 1. Mensuration data", "%", "% 2. Code: David Lewis", "%   Editions, various, including Jeffrey J. Dean, Christian Goursaud, Ronald Woodley, Martha Thomae", "@RELATION Mensuration", ""];
	out = out.concat(featureset.map(x=>"@ATTRIBUTE "+x.name+" "+x.ARFFType()));
	out.push("");
	out.push("@DATA");
	return out;
}
