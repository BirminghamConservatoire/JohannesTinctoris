/**
 * @fileoverview Load the music editions from text files and render them in the main div
 * @namespace getMusic
 */

 /** @global 
  * @type {Map} 
  * @summary stores current music as [Filename -- MusicHolder]
  * */
var musicMap = new Map();
/** suppress editor functions */
editable = false;
/** use info buttons and have every info hidden */
infoButtons = true;
editorDisplay = "hide";
dateDisplay = "hide";
copyTextDisplay = "hide";
sourceDisplay = "hide";
extraInfoDisplay = "hide";


/** @memberof getMusic
 * @summary Grabs a text file from the provided fileUri and adds it to the musicMap
 * @param {string} fileUri URI of the text file, that should be opened
 */
function grabFromFile(fileUri)
{
    var client = new XMLHttpRequest();
    
    client.onload = function() {
        if (this.status >= 200 && this.status < 300)
        {
            console.log(client.responseText);
            var musicContainer = new MusicHolder(client.responseText, document.getElementById("content"));
            musicMap.set(fileUri, musicContainer);
        }
        
    };
    client.open('GET', fileUri);
    client.send();
}

/** @memberof getMusic
 * @summary Re-loads the musicMap according to the current menu structure
 */
function loadData() {
    musicMap.clear();
    var ids = [];
    var items = document.getElementsByClassName("load");
    for(let i = 0; i < items.length; i++)
    {
        ids.push(items[i].getAttribute("id"));
    }
    for(let i = 0; i < ids.length; i++)
    {
        grabFromFile(ids[i]);
    }
}

/** @memberof getMusic
 * @summary Builds the sub menu
 * @param {string} menu HTML code for side menu
 */
function loadSubMenu(menu){
    $("#content").empty();
        $(".sidebar1").html(menu).on("click", "a", function() {
                let id = this.getAttribute("id");
                if(this.className == "text")
                {
                    $("#content").text(musicMap.get(id).text);
                }
                else if (this.className == "load")
                {
                    musicMap.get(id).draw();
                }
                else
                {
                    $("#content").text("Oooops!");
                }
            }
        );
        loadData();
}

$(document).ready(function() {
    $(".MenuBarItem").click(function() {
        $("#content").empty();
    });

    $("#home").click(function() {
        $(".sidebar1").empty();
    })

    $("#tinctoris").click(function() {
        var newMenu = "<ul>\n\
        <li><a class='text' id='music/minimal.txt'>Load Text</a></li>\n\
        <li><a class='load' id='music/minimal.txt'>Show Music</a></li>\n\
        </ul>"
        loadSubMenu(newMenu);
    });

    $("#dufay").click(function() {
        var newMenu = "<ul>\n\
        <li><a class='text' id='music/second.txt'>Second Text</a></li>\n\
        <li><a class='load' id='music/second.txt'>Second Music</a></li>\n\
        </ul>"
        loadSubMenu(newMenu);
    });

    $("#busnois").click(function() {
        var newMenu = "<ul>\n\
        <li><a class='text' id='music/variantIssues.txt'>Third Text</a></li>\n\
        <li><a class='load' id='music/variantIssues.txt'>Third Music</a></li>\n\
        </ul>"
        loadSubMenu(newMenu);
    });
});

