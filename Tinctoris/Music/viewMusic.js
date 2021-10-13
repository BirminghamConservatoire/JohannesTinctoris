"use strict";

/** @var {URL} currentUrl current url */
var currentUrl = new URL(window.location.href);
/** @var baseUrl current base url */
var baseUrl = currentUrl.origin + currentUrl.pathname;
/** @var currentParams parameters of current url */
var currentParams = currentUrl.searchParams;

var currentMusic;

function fetchMusic(fileUrl)
{
    if(fileUrl)
    {
        fetch(fileUrl)
        .then(function(response) {
            return response.text();
        })
        .then(function(text) {
            currentMusic = new MusicHolder(text, document.getElementById("content"));
        });
    }
}

function fillSubMenu(itemID)
{
    
}

$(document).ready(function() {
    // Load submenu from uri parameter
    var fileUrl = currentParams.get("file");
    var currentItemID = currentParams.get("item");


    $(window).resize(function() {
        wrapWidth = $(".content").width();
        currentMusic.draw();
    })
});
