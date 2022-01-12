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

var parsCount;

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
        //currentParams.set("file", entry["file"]);
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
            let pieceItem = findMenuItem(itemID, item["items"], false);
            if(pieceItem!=null)
            {
                menuItem = pieceItem;
                break;
            }
        }
        else if(item["parts"]!=null)
        {
            let partItem = findMenuItem(itemID, item["parts"], false);
            if(partItem!=null)
            {
                menuItem = partItem;
                break;
            }
        }
    }

    return menuItem;
}

function findSubMenuParent(itemID, itemList)
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
            menuItem = findSubMenuParent(itemID, item["items"]);
            if(menuItem!=null)
            {
                break;
            }
        }
        else if(item["parts"]!=null)
        {
            let partItem = findSubMenuParent(itemID, item["parts"]);
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
    let pagination = false;
    if(currentParams.get("layout") == "book")
    {
        rowCols = 2;
        wrapWidth = drawWidth/2;
        choirbook = true;
        pagination = true;
        $("#pageNavbar").prop("hidden", false);
    }
    else if(currentParams.get("layout") == "pageparts")
    {
        wrapWidth = drawWidth;
        pagination = true;
        choirbook = false;
        rowCols = 1;
        $("#pageNavbar").prop("hidden", false);
    }
    else
    {
        wrapWidth = drawWidth;
        pagination = false;
        choirbook = false;
        rowCols = 1;
        $("#pageNavbar").prop("hidden", true);
    }

    currentMusic.draw(rowCols, choirbook, pagination);

    if(pagination === true)
    {
        addPagination();
        let currentPage = currentParams.get("page") != null ? currentParams.get("page") : 1;
        setPage(currentPage);
    }
}

function addPagination()
{
    $(".pageMenu").remove();
    // count max pars per parts by selecting children of .musicPart
    let maxParsCount = 0;
    while(maxParsCount >= 0)
    {
        if($(".musicPars").hasClass(maxParsCount.toString()) || maxParsCount === 0)
        {
            maxParsCount++;
        }
        else
        {
            maxParsCount--;
            break;
        }
    }

    $("#pageNav").append("<li class='nav-item pageMenu'><a id='pageBack' class='nav-link'>&laquo;</a></li>");
    for(let i = 1; i <= maxParsCount; i++)
    {
        /* <!--li class="nav-item pagnination">
            <a class="nav-link active" href="#">1</a>
        </li>-->*/
        let pageButton = `<li class='nav-item pageMenu'><a  class='nav-link pageNum' id='page${i}'>${i}</a></li>`;
        $("#pageNav").append(pageButton);
    }
    $("#pageNav").append("<li class='nav-item pageMenu'><a id='pageForward' class='nav-link'>&raquo;</a></li>");


    parsCount = maxParsCount;
}

function setPage(pageNum)
{
    if(pageNum >= 1 || pageNum <= parsCount)
    {
        currentParams.set("page",pageNum);
        window.history.replaceState({}, '', baseUrl + '?' + currentParams);
        $(".musicPars").prop("hidden", true);
        $("."+pageNum).prop("hidden", false);
        $("#page"+pageNum.toString()).addClass("active");

        if(pageNum==1)
        {
            $("#pageBack").addClass("disabled");
        }
        else
        {
            $("#pageBack").removeClass("disabled");
        }

        if(pageNum==parsCount)
        {
            $("#pageForward").addClass("disabled");
        }
        else
        {
            $("#pageForward").removeClass("disabled");
        }
    }
}

function setLayout(layout)
{
    currentParams.set("layout",layout);
    window.history.replaceState({}, '', baseUrl + '?' + currentParams);
}

$(document).ready(function() {
    // Load submenu from uri parameter
    //var fileUrl = currentParams.get("file");
    var currentItemID = currentParams.get("item");

    /*if(!currentLayout)
    {
        setLayout("parts");
    }*/

    var currentMenuItem = findMenuItem(currentItemID, menu);
    var fileUrl;

    if(currentMenuItem)
    {
        fileUrl = currentMenuItem["file"];
        fillSubMenu(currentMenuItem);
    }

    if(fileUrl)
    {
        fetchMusic(fileUrl);
    }

    $("#layoutBook").click(function(){
        setLayout("book");
        setWindowAndDraw();
    });

    $("#layoutPageParts").click(function(){
        setLayout("pageparts");
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
