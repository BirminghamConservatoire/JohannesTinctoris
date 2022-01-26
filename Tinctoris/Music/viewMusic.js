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
function fillSubMenu(item)
{
    /** 
     * <li class="nav-item">
     *    <a class="nav-link active" href="#">item.label</a>
     * </li>
    */

    let menuItem = findSubMenuParent(item.id,menu);

    let linkUrl = new URL(currentUrl.toString());
    let linkParams = new URLSearchParams(currentParams.toString());

    for(let entry of menuItem["parts"])
    {
        linkParams.set("item", entry["id"]);
        linkUrl.search = linkParams.toString();
        let entryHref = linkUrl.toString();
        $("#submenu").append("<li class='nav-item'><a id='"
            +entry["id"]+
            "' class='nav-link' href='"
            +entryHref+"'>"
            +entry["label"]+"</a></li>");
        if(entry["id"]===item["id"])
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

/**
 * For drawing the parts submenu, the parent menu object needs to be retrieved.
 * Works like @link findMenuItem() but retrieves the parent of a part object.
 * @param {string} itemID 
 * @param {Object} itemList 
 * @returns {Object}
 */
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

/**
 * Retrieves layout options from URL params and window size.
 * Adjusts layout and draws music example.
 */
function setWindowAndDraw()
{
    let drawWidth = $(document).width()*0.97;
    let rowCols = 1;
    let choirbook = false;
    let pagination = false;
    let toggleParts = false;
    if(currentParams.get("layout") == "book")
    {
        rowCols = 2;
        wrapWidth = drawWidth/2;
        choirbook = true;
        pagination = true;
        toggleParts = false;
    }
    else if(currentParams.get("layout") == "pageparts")
    {
        wrapWidth = drawWidth;
        pagination = true;
        choirbook = false;
        rowCols = 1;
        toggleParts = true;
    }
    else
    {
        wrapWidth = drawWidth;
        pagination = false;
        choirbook = false;
        rowCols = 1;
        toggleParts = true;
    }

    currentMusic.showvars = currentParams.get("showvars") === "true" ? true : false;
    currentMusic.draw(rowCols, choirbook, pagination);

    if(pagination === true)
    {
        addPagination();
        let currentPage = currentParams.get("page") != null ? currentParams.get("page") : 1;
        setPage(currentPage);
    }
    else
    {
        removePagination();
    }

    addToggleParts(toggleParts);
}

/**
 * Adds the pagination menu to the bottom of the page.
 */
function addPagination()
{
    // delete old page buttons
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
    $("#pageNav").prop("hidden",false);

    // set margins based on current layout
    let layout = currentParams.get("layout");
    if(layout === "book")
    {
        $("#pageNav").addClass("mx-auto");
        $("#pageNav").removeClass("ml-auto");
    }
    else
    {
        $("#pageNav").addClass("ml-auto");
        $("#pageNav").removeClass("mx-auto");
    }

    $("#pageNav").append("<li class='nav-item pageMenu'><a id='pageBack' href='#' class='nav-link'>&laquo;</a></li>");
    
    for(let i = 1; i <= maxParsCount; i++)
    {
        /* <!--li class="nav-item pagnination">
            <a class="nav-link active" href="#">1</a>
        </li>-->*/
        let pageButton = `<li class='nav-item pageMenu'><a  class='nav-link pageNum' href='#' id='page${i}'>${i}</a></li>`;
        $("#pageNav").append(pageButton);
    }
    $("#pageNav").append("<li class='nav-item pageMenu'><a id='pageForward' href='#' class='nav-link'>&raquo;</a></li>");


    parsCount = maxParsCount;

    $("#pageBack").click(function(){
        setPage(parseInt(currentParams.get("page"))-1);
    });
    $(".pageNum").click(function(){
        setPage(parseInt(this.text));
    });
    $("#pageForward").click(function(){
        setPage(parseInt(currentParams.get("page"))+1);
    });
}

/**
 * Removes pagination menu and url param.
 */
function removePagination()
{
    $("#pageNav").prop("hidden",true);
    currentParams.delete("page");
    window.history.replaceState({}, '', baseUrl + '?' + currentParams);
}

/**
 * Paging is done by showing and hiding <pars>-divs accoding to their pagenum (stored as class, e.g. ".3").
 * URL param and paging menu is adjusted as well.
 * @param {integer} pageNum 
 */
function setPage(pageNum)
{
    if(pageNum >= 1 || pageNum <= parsCount)
    {
        // set URL
        currentParams.set("page",pageNum);
        window.history.replaceState({}, '', baseUrl + '?' + currentParams);
        // adjust content visibility
        $(".musicPars").prop("hidden", true);
        $("."+pageNum).prop("hidden", false);

        // adjust menu state
        $(".pageNum").removeClass("active");
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

/**
 * Adds menu to switch parts on/off
 * @param {boolean} toggleParts 
 */
function addToggleParts(toggleParts)
{
    $("#partsForm").empty();
    if(toggleParts===true)
    {
        $("#toggleParts").prop("hidden", false);

        let partIDs = []; 
        for(let musicPart of $(".musicPart"))
        {
            partIDs.push($(musicPart).attr("id"));
        }

        for(let partID of partIDs)
        {
            let partSwitchID = "switch" + partID;
            let partLabel = $("#" + partID).attr("title");
            let partSwitch = `<div class='form-check py-1'><input type='checkbox' class='form-check-input partSwitch' id='${partSwitchID}' checked><label class='form-check-label' for='${partSwitchID}'>${partLabel}</label></div>`;

            $("#partsForm").append(partSwitch);
            addSwitchToggleEvent(partSwitchID);
        }

        $("#switchAllParts").click(function(){
            showAllParts();
        });
    }
    else
    {
        $("#toggleParts").prop("hidden", true);
    }
}

/**
 * Adds toggle events to switch
 * @param {string} switchID checkBox id to bind event
 */
function addSwitchToggleEvent(switchID)
{
    $("#" + switchID).click(function(){
        let partID = this.id.replace("switch","");
        showPart(partID);
    });
    $("#" + switchID + ":checked").click(function(){
        let partID = this.id.replace("switch","");
        hidePart(partID);
    });
}

/**
 * Make all parts visible again
 */
function showAllParts()
{
    $("#switchAllParts").addClass("disabled");
    $(".partSwitch").prop("checked", true);
    $(".musicPart").prop("hidden", false);
}

/**
 * Make a hidden part visible
 * @param {string} partID 
 */
function showPart(partID)
{
    $("#" + partID).prop("hidden", false);
}

/**
 * Hide a part
 * @param {string} partID 
 */
function hidePart(partID)
{
    $("#" + partID).prop("hidden", true);
    $("#switchAllParts").removeClass("disabled");
}

/**
 * Toggles layout options and sets url param.
 * @param {string} layout 
 */
function setLayout(layout)
{
    currentParams.set("layout",layout);
    window.history.replaceState({}, '', baseUrl + '?' + currentParams);
    setWindowAndDraw()
}

/**
 * Toggles showvars option and updates url param.
 * @param {boolean} showvars 
 */
function setShowVars(showvars)
{
    if(showvars===true)
    {
        $("#showvariants").prop("hidden",true);
        $("#hidevariants").prop("hidden",false);
    }
    else
    {
        $("#showvariants").prop("hidden",false);
        $("#hidevariants").prop("hidden",true);
    }
    currentParams.set("showvars",showvars);
    window.history.replaceState({}, '', baseUrl + '?' + currentParams);
    setWindowAndDraw();
}

$(document).ready(function() {
    // Load submenu from uri parameter
    var currentItemID = currentParams.get("item");

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

    // Enable bootstrap tooltips
    $(function () {
        $('[data-toggle="tooltip"]').tooltip()
    })

    $("#layoutBook").click(function(){
        setLayout("book");
    });

    $("#layoutPageParts").click(function(){
        setLayout("pageparts");
    });

    $("#layoutParts").click(function(){
        setLayout("parts");
    });

    $("#showvariants").click(function(){
        setShowVars(true);
    });

    $("#hidevariants").click(function(){
        setShowVars(false);
    });

    $(window).resize(function() {
        setWindowAndDraw();
    })
});
