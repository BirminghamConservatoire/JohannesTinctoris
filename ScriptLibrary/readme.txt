This file contains documentation that doesn't fit anywhere else
(i.e. it's about application logic not just lower-level function
documentation).

1. The drawing/refresh process:

  * docMapping.updatePanes
     puts panes in list from the list of Treatises (does nothing else)

  * fixHeight

  * fixWidths 
    
     - calculate a fresh target width using docMapping.paneWidth
         [Calculation is the window width minus 60 divided by the number of
         panes (if > minimum value) minus a constant 30px]

     - If the width of already-drawn panes is the same as the proposed
     wrap width, no redraw is needed, return false

     - run fixButtons to (?) ensure that location information is
       correct and that buttons available are appropriate to doc type

     - set fresh timeouts for each pane to set the new width
        + modification refuses to change an existing pane
