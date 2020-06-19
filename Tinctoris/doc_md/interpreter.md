# Logical units

## utils

Utility functions I: Simple functions
Useful stuff like gcd.

## MEI interaction layer

_Utility functions II: Functions for working with XML DOMObjects and extracting structures from MEI_

* idDictionary: global Member

Things that do stuff with MEI
* nsResolver
* hasNoSections

Read from MEI:
* getAtomicSections (external)
* getLayers
* getEventsbyMensurationForSection (external)

Proportion multiplier stuff:
* proportionMultiplier
* propProportionMultiplier
* blockProportionMultiplier

_Utility functions III: Functions for reading and writing durations for events_

* writeDur
* leveleq
* writeSimpleImperfection
* writeImperfection
* writeAlteration
* readDur

_Utility functions V: Functions that know something about mensuration_
* mensurSummary
* simpleMinims
* beatOfDur
* beatUnitStructure
* isAlterable
* alterableLevels
* canImperfect
* notePerfectAsWhole
* imperfectingLevels
* firstPerfectLevel

## Input analysis layer

There are functions, that analyze the input...

Basis analysis of single elements:
* noteOrRest
* augDot
* divisionDot

Compare two events:
* leveleq

_Functions to support windowing or for finding the extent to look ahead or back_
* indexOfNextSameOrLongerOrDot
* indexOfNextDot
* indexOfPrevLongerOrDot
* windowDuration
* divisionLikeRests
* solidBlock

## Analysis functions

### Controller

Functions that run the analysis funtions

Run easy analysis: **beatIndependentDurations** (external)

Run complex analysis: **afterTheEasyBits**

### Simple reslutions steps

Steps that aren't dependant on any rhythms or beat positions.
These are: rests (which can't be altered or imperfected anyway); coloration; dots of augmentation; notes below the first perfect/alterable level; trivial alterations (based on pattern, not beat position); ante simile.

_Functions for adding duration where no start position is known_

* labelRests
* actOnColoration
* actOnDots
* allUnalterableImperfectionLevels
* simplestAlterations
* anteSim

### Imperfection

* firstBeatImperfectionCheck
* firstBeatImperfection
* secondBeatImperfection
* thirdBeatImperfection
* midBeatImperfection

### Alteration

* firstBeatAlteration
* secondBeatAlteration
* thirdBeatAlteration
* midBeatAlteration

### Other analytical functions

* addAllStartTimes... external
* addStartTimesForBlock (writes `@mensurBlockStartsAt`)
* addBreveBoundariesForBlock

## Features for machine learning

MEI Walk
* makeFeatureSequencesForML

What are those small functions at the end?
* getStaffDefMens
* getMatchingStaffDef
* getStaffNo
* addFeatureDatum
* attributeEq
* attributeTestFun
* attributeValueFun
* simAnteSim
* eventLevel
* displacedSuccessiveEventsFun
* displacedEventFun
* displacedBooleanEventFun
* displacedEventFunGenerator
* displacedBooleanEventFunGenerator
* comparisonBooleanFunGenerator
* comparisonFunGenerator
* last
* durationBefore
* durationAfter
* canImperfectCurrent
* levelDifference
* levelTestFun
* Feature
* makeARFFHeader