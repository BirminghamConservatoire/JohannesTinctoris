# Project files for a digital edition of the Complete Theoretical Works of Johannes Tinctoris

There are two modules included:

* JT-editor: an online form and renderer for editors to input mixed music and text (and work-input for music only)
* JohannesTinctoris: a draft version of the website to be mounted

Both modules are in the early alpha stages of development, and consist
of messy research code. Please contact project members for more information.

## Prerequesites

Setup requires various components:

* JQuery and JQuery UI (already included)
* Ruby 2.6 and Jekyll 3.9.0 to run the website
* Node.JS and Docdash to delpoy code documentation (JsDoc configuration in `doc-conf.json`)

## Directory overview

* `Tinctoris` contains all the parts of the site related to Johannes Tinctoris
* `Tinctoris\texts` contains Johannes Tinctoris Complete Theoretical Works (JT:CTW)
* `editor` containt the online editors to input music treatises or music only
* `ScriptLibrary` contains the various modules for parsing and rendering the content
* `doc` contains the code documentation
* `doc_md` contains files that are part of the code documentation
* `_includes` contains reusable website parts to be included via [Liquid](https://jekyllrb.com/docs/liquid/)
* `_layouts` contains standard layouts for webpages to be built by Jekyll

For more details, see code documentation.
