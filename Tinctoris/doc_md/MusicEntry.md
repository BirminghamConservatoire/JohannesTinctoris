# Tinctoris Music Entry

## Document header

```
[Standard title of composition]
[Composer]
Editor:
Checked by:
Date established:
Base transcription: [source used to begin with, ‘best’ if there is one]
Sources:
[Siglum [tab] MS identifier], fols. [(modern numeration) if so] [tab] [composer ascription; ‘—’ if anon. in source]
```
Sources: repeat sigla as necessary; sources in chronological order as in List of works to be edited.

Document header is non-mandatory for rendering in the editor.

## Enclosing tags

Enclosing tags work like XML elements:  
`<tag: qualifier, qualifier> ... </tag>`

### Structural tags
* `<piece: {mensural: [void|full]}, {staf: 5, [black|red]}>... </piece>`
* `<section: [Kyrie|Gloria|etc.|Aleph|Beth|etc.]>...</section>`
* `<pars>...</pars>`
* `<part: [Supremum|Contratenor|Tenor|Bassus (in [] if necessary)]>... </part>`  
 [new part on a new paragraph for convenience]

### Text tags
* `<label: [rot90c|rot90a if rotated], [vertical position of start if rotated, of baseline if not rotated and not = 0]>...</label>`  
 [colon should be omitted if no qualifiers]
* `<text: [vertical position of baseline if not = 0]>...</text>`  
 [colon should be omitted if no qualifier]

### Feature tags
* `<red>...</red>`  
[or other colour as called for]
* `<full>...</full>`   
[or void if called for (e.g. semiminims in major prolation)]
* `<lig>...</lig>`  [for ligatures]
* `<obl>...</obl>` [obliquity in a ligature]
* `<ll: [-1 = one leger line below the staff; 2 = two above, etc.][, colour if other than that of staff]>...</ll>` [ledger line]
* `**...**` [pop-up comments]

If it makes for easier reading, the enclosing tags can be spaced around their contents:   
`<tag> ... </tag>.`

## Non-enclosing tags

* `{staf: [number of lines]}` [can be repeated internally if forced new staff required]
* `{clef: [Gamma|F|C|G|D][numerical vertical position]}` (e.g. {clef: F10})
* `{solm: [0|b[pitch]]}`   
(e.g. {solm: 0}, {solm: bb}) [must always be specified as 0 if there are no flats in the signature]
[Clef and solmization signature (including 0) must be restated if new staff declared.]
* `{mens: [O[= o]|o[= O]|C[= c]|c[= C]|Ø[= ø]|Ç[= ç]] [Q[= v]] [q[= V]] [œ[= ◊]] [Œ[= √]][numerical vertical position]}`
* `{prop: [numerator]/[denominator], [numerical vertical position of lower space]-[position of higher space]}`  
 [proportions (e.g. {prop: 3/2, 7-9})]

### Variants 

 `{var="[accepted reading]" [source sigla for reading] : "[1st rejected reading]" [source sigla] [: "[next rejected reading]" [source sigla]]}`     
[NB: straight double quotation marks only; curly or single will not work!] 
* [(om.) = omitted in the sources given] 
* {var=(ins.) "[rejected insertion]" [source sigla]}
[Variants within {staf}, {clef}, {solm}, {mens}, or {prop} are expressed as above, omitting the {var= prefix (e.g. {clef: "C8" X Y : "C10" Z}). Variants can occur within <label> and <text>.]
{[full|void|red|etc.]} [applies to next item only]


### Pitch

extended Guidonian: 
* AA–GG (GG = Gamma ut), 
* G–A, 
* g–a (c = middle C), 
* gg–aa, etc.

#### Pitched items

**M** = maxima  
**L** = longa  
**B** = breve  
**S** = semibreve  
**m** = minim [upward stem; for downward stems (deprecated) prefix -m, -s, etc.]  
**s** = semiminim  
**f** = fusa  

**b** = flat [NB: all accidentals should be located as in sources, not as in modern usage]  
**h** = natural  
**x** = sharp  
**c** = custos  

All pitched items should be identified by note value followed immediately by pitch (e.g. Bg).


### Vertical position of unpitched items

0 = 2nd leger line below staff  
2 = 1st leger line below staff  
4 = 1st staff line, etc.  
odd numbers = spaces  

#### Dots

An unambiguous dot of augmentation or perfection should follow immediately after the note affected: e.g. **`Bg.`**   
If it is not in the conventional space (i.e. the same space as a note on a space, or the space just above a note on a line), its numerical vertical position should be indicated.   
Dots of division or ambiguous dots should be spaced away from notes on either side and their vertical position indicated: e.g. **`Ba Sg .7 Sf Bg`**

#### Other unpitched items

##### Rests

Rest   
**P[note value, breve or less][numerical vertical position of space]**   
(e.g. `PS7`)  

(Group) of longa rest(s)   
**PL[numerical vertical position of lowest space]-[position of highest space][x[2|3] if called for]**
(e.g. `PL5-7`, `PL7-11x2`)

##### Fermata
* **`*`** = fermata above note   
[+ numerical vertical position if not the next space]  
* **`-*`** = fermata below note [ditto] 

##### Signum congruentiae
* **`?`** = signum congruentiae above note [ditto]  
* **`-?`** = signum congruentiae below note [ditto]

##### Barlines  
* **|** = barline
* **||** = double barline, etc.  

By default, barlines extend across the entire staff; if they are shorter or longer, the numerical vertical position of the bottom and top must be specified, e.g.: **`||2-14`**

**[number of barlines in repeat sign]:[numerical vertical position of lowest space]-[position of highest space]**   
e.g. `2:5-7`


### Miscellaneous

* ^ = (in music) superimposed on preceding item; useful for podatus-style ligatures (e.g. `<lig>Ba ^Lc</lig>`) or ‘double stops’ (e.g. `Ba ^{full}Bc`), etc.
* ^ = (in text) superscript (`^...^` if necessary);   
* in variants, `[source siglum]^*` = original reading, `[siglum]^c` = corrected reading
