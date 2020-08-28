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
 * @summary Builds the sub menu from the structure in menu.js and loads music content according to menu
 * @param {Object} menu stucture of submenu as object
 */
function loadSubMenu(menu){
    // First clear the content
    $("#content").empty();

    // Build menu structure
    var htmlMenu = "<ul>";
    for (item in menu)
    {
        htmlMenu = htmlMenu + "<li class='" + menu[item].class + "' id='" + menu[item].id + "'>" + menu[item].name + "</li>";
    }
    htmlMenu = htmlMenu + "</ul>";
    
    // Render sidebar menu
    $(".sidebar1").html(htmlMenu).on("click", "li", function() 
        {
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
        if($(this).is("#home"))
        {
            $(".sidebar1").empty();
        }
        else
        {
            let id = $(this).attr("id");
            loadSubMenu(musicMenu[id]);
        }
    });
});

