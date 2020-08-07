/**
 * @fileoverview Load the music editions from text files and render them in the main div
 * @namespace getMusic
 */

 /** @global stores current music */
var musicMap = new Map();
/** suppress editor functions */
editable = false;

/** @class */
class MusicDocContainer {
    constructor(id) {
        this.id = id;
        this._text;
        this._music;
        //this.musicDoc = new MusicHolder(this.text, document.getElementById("content"));
    }
    set text(text) {
        this._text = text;
    }
    get text() {
        return this._text;
    }
    set musicDoc(text) {
        this._music = new MusicHolder(text, document.getElementById("content"));
    }
    get musicDoc() {
        return this._music;
    }
    draw() {
        this.musicDoc.draw();
    }
}


/** @memberof getMusic */
function grabFromFile(fileUri, musicContainer)
{
    var client = new XMLHttpRequest();
    
    client.onload = function() {
        if (this.status >= 200 && this.status < 300)
        {
            console.log(client.responseText);
            musicContainer.text = client.responseText;
            musicContainer.musicDoc = client.responseText;
        }
        
    };
    client.open('GET', fileUri);
    client.send();
}

$(document).ready(function() {

    var ids = [];
    var items = document.getElementsByClassName("load");
    for(let i = 0; i < items.length; i++)
    {
        ids.push(items[i].getAttribute("id"));
    }
    for(let i = 0; i < ids.length; i++)
    {
        var container = new MusicDocContainer(ids[i]);
        grabFromFile(ids[i], container);
        musicMap.set(ids[i], container);
        
    }
    console.log("loaded data");

    $(".load").click(function() {
        let id = this.getAttribute("id");
        musicMap.get(id).draw();
    });

    $(".text").click(function() {
        let id = this.getAttribute("id");
        $("#content").text(musicMap.get(id).text);
    });

    $("#clean").click(function() {
        $("#content").empty();
    });
});

