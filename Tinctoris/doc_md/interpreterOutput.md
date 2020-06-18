# Notes & rests

```xml
<note xml:id="ID4bd4fd8d-8836-4cea-859f-2264547ef6af"
    dur="minima" pname="f" oct="4" dots="1" 
    dur.intermediate="1.5b" 
    dur.ges="3b"
    num="1" numbase="1" 
    rule="simpleDot" 
    startsAt="3"
    beatPos="0, 1, 1, 0, 0, 0" 
    mensurBlockStartsAt="3"/>
```

Before processing, the note only contains:
* xml:id 
* dur 
* pname 
* oct
* lig
* coloration

**Available attributes after interpretation:**
* dots
* dur.ges
* dur.intermediate
* dur.quality
* mensurBlockStartsAt (see {@link addStartTimesForBlock})
* num / numbase
* quality
* rule
* startsAt
* stretched

Added by {@link addBreveBoundariesForBlock} or {@link addAllStartTimes}:
* beatPos 
* onTheBreveBeat 
* crossedABreveBeat

## rule

Rule that has been applied in the specific case: 

Simple rules
* simpleDot  -- actOnDots
* coloration   
* rest

Imperfection

* I.2.b.antesim  
* I.2.a.PerfDot -- actOnDots
* I.3-726  
* I.4a  
* I.4b   
* I.5
* I.5-add
* I.5-literalunits
* I.6
* I.6-literalunits
* I.8 (see {@link secondBeatImperfection})
* I.9 (see {@link thirdBeatImperfection})

Alteration
* A.1
* A.2b
* A.xxx
* A.xxz

## dur.ges & dur.intermediate

See {@link writeDur}

_unclear!_
Seems to contain duration in minims, like `@dur.ges='3b'`.   

**What does `@dur.intermediate`?**
Is written by {@link writeDur}... read by {@link readDur}.

## dur.quality

Written by writeSimpleImperfection, writeImperfection, writeAlteration

## mensurBlockStartsAt

Gives starting position of note/rest in minim values.  
Starting with `@mensurBlockStarstAt='0'`  
Mensuration / proportion signs reset to 0.

## startsAt

_unclear!_

Gives starting position of note/rest in minim values.  
Starting with `@startsAt='0'`  
**Is not resetted by mensuration or proportion signs.**

# Dots

```xml
<dot form="aug"/>
```

Dots lead to an added `@dots="1"` at the preceeding note.

_Question: Are there only dots of augmentation?_

# Mensur

`@modusmaior` and `@modusminor` is added during beat analysis:
```xml
 <mensur symbol="O" tempus="3" prolatio="2" 
    modusmaior="2" modusminor="2"/>
```

# Proportions

```xml
<proport num="2" multiplier="2" />
```

Nothing is changed during processing.

# Barline

`<barLine visible="false"/>` is added as markers for breve units, compare rendered output.