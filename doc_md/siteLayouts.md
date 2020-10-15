# Page variables

* layout
* title
* rel_url
* menu_base
* menu
* header

## Layouts

### *article_overview*

Currently used for the overview page of Essays & Studies. A static site template with JT:E&S header, JT:E&S menu and empty sidebars.

### article

Used for articles. Contains inclusions of footnote and bibliography functionality. Can be used for articles in the Tinctoris section or Essays & Studies. The used page header and menu is set by page variables:

```yaml
---
layout: article
[...]
menu: tinctoris_menubar.html
header: tinctoris_header.html
---
```

If no header is defined, `tinctoris_header.html` will be used. A menu needs to be defined.

### cpw_static

A template for static sites with CPW header and menu.

### cpw_works

A template with CPW header and included functionality to load and display music content from text files.

### ctw_static

A template for static sites with CTW header and menu.

### ctw_texts

Template for editions of theoretical works.

### default

Default template for static sites. Is used by all other static site templates. Does not contain any header, menu or page layout!

### emt

Template for static websites that only contain the EMT logo in the header.

### tinctoris

Template for static pages about Johannes Tinctoris, that don't belong to CTW, CPW or E&S.

## Includes

## Headers

* article_header.html
* cpw_header.html
* ctw-short_header.html
* ctw-static_header.html
* tinctoris_header.html

