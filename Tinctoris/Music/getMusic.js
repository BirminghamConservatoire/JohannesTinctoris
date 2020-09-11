/**
 * @fileoverview Load the music editions from text files and render them in the main div
 * @namespace getMusic
 */

 /** @global 
  * @type {Map} 
  * @summary stores current music as [Filename -- MusicHolder]
  * */
var musicMap = new Map();
var currentID = "";
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
    // First clear content and submenu
    $("#content").empty();
    $(".sidebar1").empty();

    // Build menu structure
    var htmlMenu = buildMenu(menu, htmlMenu);
    
    // Render sidebar menu
    $(".sidebar1").append(htmlMenu).on("click", "li", function() 
        {
            let id = this.getAttribute("id");
            if(this.className == "text")
            {
                $("#content").text(musicMap.get(id).text);
            }
            else if (this.className == "load")
            {
                wrapWidth = $(".content").width();
                musicMap.get(id).draw();
                currentID = id;
            }
            else if (this.className == "none")
            {
                $("#content").empty();
            }
            else
            {
                $("#content").text("Oooops!");
            }
        }
    );
    loadData();
}

function buildMenu(menu, htmlMenu)
{
    htmlMenu = $("<ul></ul>");
    htmlMenu.attr("class", "musicMenu");
    for (item in menu)
    {
        var itemEl = $("<li></li>").attr({"class": menu[item].class, "id": menu[item].id});
        itemEl.text(menu[item].name);
        htmlMenu.append(itemEl);

        // deal with nested menus for parts
        if (menu[item].parts)
        {
            var submenu = buildMenu(menu[item].parts, submenu);
            htmlMenu.append(submenu);
        }
    }
    return htmlMenu;
}

/**
 * @memberof getMusic
 * @summary Reads the part of the url after an "?"
 * @returns Parameter after "?"
 */
function getParam()
{
    var url = window.location.href
    var param = url.match(/\?\w*/);
    param = param[0].substring(1,param[0].length);

    return param;
}

$(document).ready(function() {
    // Load submenu from uri parameter
    var param = getParam();
    if(param.length>0)
    {
        loadSubMenu(musicMenu[param]);
    }

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

    $(window).resize(function() {
        wrapWidth = $(".content").width();
        musicMap.get(currentID).draw();
    })
});

