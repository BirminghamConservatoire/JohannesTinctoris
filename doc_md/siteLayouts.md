# Page variables

Page variables are set within a header at the beginning of eacht file, called [front matter](https://jekyllrb.com/docs/front-matter/). This YAML block causes the processing of a page.
The front matter is enclosed with triple-dashed lines:

```yaml
---
layout: default
title: Hello World!
---
```

The page related variables used in front matters are:

* layout: Defines the used page layout
* title: Page title as read in the browser window (**Don't use colons, they'll break the processing** Escape with `&#58;`.)
* rel_url: Relative url - contains the relative url to the repository root (for proper linking of scripts and stylesheets)
* menu_base: Menu base - contains the relative url to the part of the website that is the menu bar for (for proper linking in the menu)
* menu: Only for article template. Defines the used menu.
* header: Only for article template. Defines the used header.

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

### Headers

* article_header.html (Essays & Studies)
* cpw_header.html (CPW header)
* ctw-short_header.html (CTW short header for editions, reduced logos)
* ctw-static_header.html (CTW header for static sites, with full logo)
* tinctoris_header.html (Tinctoris Website)

### Menus

* article_menu.html (Essays & Studies)
* cpw_menu.html (Complete Practical Works)
* ctw_menu.html (Complete Theoretical Works)
* tinctoris_menubar.html (Tinctoris Website)

### Other parts

* footer.html (currently empty footer element)
* twitter.html (left sidebar with twitter timeline)
* tinctoris_right-sidebar.html (right sidebar with portrait of JT)
