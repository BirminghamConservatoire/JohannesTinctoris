var printHTMLHeaders= '\
	<meta charset="UTF-8">\n\
	<title>Early Music Theory — The Theoretical Works of Johannes Tinctoris — De notis et pausis</title>\n\
  <link rel="icon" \n\
        type="image/png" \n\
        href="../../jt.png">\n\
  <script src="../../../GUIEditor/jquery-1.8.2.min.js"></script>\n\
  <script src="../../../GUIEditor/jquery-ui-1.9.0.custom.min.js"></script>\n\
  <script src="../../jquery.ui.menubar.js"></script>\n\
  <script src="../../../GUIEditor/jquery.scrollTo-1.4.2.js"></script>\n\
	<script src="../../../GUIEditor/debugger.js"></script>\n\
	<script src="../../../GUIEditor/dom.js"></script>\n\
  <script src="../..//path.js"></script>\n\
	<script src="../../../GUIEditor/meidom.js"></script>\n\
	<script src="../../../GUIEditor/base.js"></script>\n\
	<script src="../../../GUIEditor/buttons.js"></script>\n\
	<script src="../../../GUIEditor/classes.js"></script>\n\
	<script src="../../../GUIEditor/text-classes.js"></script>\n\
	<script src="../../../GUIEditor/music-parser.js"></script>\n\
	<script src="../../../GUIEditor/parser.js"></script>\n\
  <script src="../../../GUIEditor/print.js"></script>\n\
	<script src="../../jt1.js"></script>\n\
  <script src="../../viewer.js"></script>\n\
  <script src="combined.js"></script>\n\
	<link href="../../smoothness/jquery-ui-1.9.0.custom.css" rel="stylesheet">\n\
	<link href="../../jquery.ui.menubar.css" rel="stylesheet" type="text/css">\n\
	<link href="../../jt1.css" rel="stylesheet" type="text/css">\n\
	<link type="text/css" rel="stylesheet" href="../../../GUIEditor/jt-editor-v.css" />\n\
	<link type="text/css" rel="stylesheet" href="../edited.css" />\n';
var printHTMLFooters = '</div></body></html>';


function printThis(divs){
  var WinPrint = window.open('print.html', '', 'left=0,top=0,width=800,height=900');//,toolbar=0,scrollbars=0,status=0');
  $(WinPrint).load(
    function(divs) {
      return function(){
        WinPrint.document.head.innerHTML = printHTMLHeaders;
        var mydiv=false;
        var div1 = DOMDiv(false, 'mainBody');
        var div2 = DOMDiv('content', 'pane1');
        WinPrint.document.body.appendChild(div1);
        div1.appendChild(div2);
        for(var i=0; i<divs.length; i++){
          mydiv = DOMDiv(false, 'pane contentpane contentcontainer');
          mydiv.innerHTML =divs[i].innerHTML;
          div2.appendChild(mydiv);
        }
        WinPrint.focus();
      };
    }(divs));
//  div.innerHTML = string;
//    WinPrint.document.write(divs[i].innerHTML);
//    WinPrint.document.close();
//  WinPrint.print();
//  WinPrint.close();
}
function foo(){
//  $(window).load(function(){window.print();};);
}
