"use strict";

/** @var {URL} currentUrl current url */
var currentUrl = new URL(window.location.href);
/** @var baseUrl current base url */
var baseUrl = currentUrl.origin + currentUrl.pathname;
/** @var currentParams parameters of current url */
var currentParams = currentUrl.searchParams;

/** @var {string} currentFile contains the content of the currently loaded file */
var currentFile;
/** @var {MusicHolder} currentMusic currently displayed MusicHolder */
var currentMusic;

/**
 * Fetches a JT:CPW text file from the given URL and draws it.
 * @param {string} fileUrl 
 */
function fetchMusic(fileUrl)
{
    if(fileUrl)
    {
        fetch(fileUrl)
        .then(function(response) {
            return response.text();
        })
        .then(function(text) {
            currentFile = text;
            currentMusic = new MusicHolder(text, document.getElementById("content"));
            setWindowAndDraw();
        });
    }
}

/**
 * Fills the submenu below the navbar with sections or pieces to navigate.
 * @param {Object} item 
 * @param {string} activeID 
 */
function fillSubMenu(item, activeID)
{
    /** 
     * <li class="nav-item">
     *    <a class="nav-link active" href="#">item.label</a>
     * </li>
    */

    for(let entry of item["parts"])
    {
        currentParams.set("file", entry["file"]);
        currentParams.set("item", entry["id"]);
        currentUrl.search = currentParams.toString();
        let entryHref = currentUrl.toString();
        $("#submenu").append("<li class='nav-item'><a id='"
            +entry["id"]+
            "' class='nav-link' href='"
            +entryHref+"'>"
            +entry["label"]+"</a></li>");
        if(entry["id"]===activeID)
        {
            $("#"+entry["id"]).addClass("active");
        }
    }
}

/**
 * Retrieves the item from the menu object by the item id.
 * @param {string} itemID 
 * @param {Object} itemList 
 * @returns {Object}
 */
function findMenuItem(itemID, itemList)
{
    var menuItem;

    for(let item of itemList)
    {
        if(item["id"]===itemID)
        {
            menuItem = item;
            break;
        }
        else if(item["items"]!=null)
        {
            menuItem = findMenuItem(itemID, item["items"]);
            if(menuItem!=null)
            {
                break;
            }
        }
        else if(item["parts"]!=null)
        {
            let partItem = findMenuItem(itemID, item["parts"]);
            if(partItem!=null)
            {
                menuItem = item;
                break;
            }
        }
    }

    return menuItem;
}

function setWindowAndDraw()
{
    let drawWidth = $(document).width()*0.97;
    let rowCols = 1;
    let choirbook = false;
    let divHeight;
    if(currentParams.get("layout") == "book")
    {
        rowCols = 2;
        wrapWidth = drawWidth/2;
        choirbook = true;
        divHeight = $(window).height()/2.7;
    }
    else
    {
        wrapWidth = drawWidth;
    }

    currentMusic.draw(rowCols, choirbook, divHeight);
}

function setLayout(layout)
{
    currentParams.set("layout",layout);
    window.history.replaceState({}, '', baseUrl + '?' + currentParams);
}

$(document).ready(function() {
    // Load submenu from uri parameter
    var fileUrl = currentParams.get("file");
    var currentItemID = currentParams.get("item");

    /*if(!currentLayout)
    {
        setLayout("parts");
    }*/

    var currentMenuItem = findMenuItem(currentItemID, menu);

    if(currentMenuItem && currentMenuItem["parts"])
    {
        fillSubMenu(currentMenuItem, currentItemID);
    }

    fetchMusic(fileUrl);

    $("#layoutBook").click(function(){
        setLayout("book");
        setWindowAndDraw();
    });

    $("#layoutParts").click(function(){
        setLayout("parts");
        setWindowAndDraw();
    });

    $(window).resize(function() {
        setWindowAndDraw();
    })
});