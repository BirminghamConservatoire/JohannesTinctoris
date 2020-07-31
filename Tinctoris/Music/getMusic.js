/**
 * @fileoverview Load the music editions from text files and render them in the main div
 * @namespace getMusic
 */

var musicCode;
editable = false;

$(document).ready(function() {
    $("#load").click(function() {
        grabFromFile(this.getAttribute("load"));
        if(musicCode)
        {
            makeMusicDoc();
        }
    });

    $("#clean").click(function() {
        $("#content").empty();
    });
});

function grabMusic(text) 
{
    if(text)
    {
        musicCode = text;
        console.log(text);
        return text;
    }
}

function grabFromFile(fileUri)
{
    var resp = "";
    var client = new XMLHttpRequest();
    client.onreadystatechange = function() {
        grabMusic(client.responseText);
    };
    
    client.open('GET', fileUri);
    client.send();
}

function makeMusicDoc()
{
    doc = new MusicHolder(musicCode, document.getElementById("content"));
    doc.draw();
}


