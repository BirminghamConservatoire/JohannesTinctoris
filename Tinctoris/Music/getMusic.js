/**
 * @fileoverview Load the music editions from text files and render them in the main div
 * @namespace getMusic
 */

var musicCode;
editable = false;

$(document).ready(function() {
    
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
        var client = new XMLHttpRequest();
        client.onreadystatechange = function() {
            grabMusic(client.responseText);
        };
        
        client.open('GET', fileUri);
        client.send();
    }

    function makeMusicDoc()
    {
        doc.draw();
    }


    $(".load").click(function() {
        if(musicCode)
        {
            doc = new MusicHolder(musicCode, document.getElementById("content"));
            makeMusicDoc();
        }
        else
        {
            grabFromFile(this.getAttribute("id"));
            musicCode = "";
        }
    });

    $(".text").click(function() {
        if(musicCode)
        {
            $("#content").text(musicCode);
            musicCode = "";
        }
        else
        {
            grabFromFile(this.getAttribute("id"));
        }
    });

    $("#clean").click(function() {
        $("#content").empty();
    });
});


