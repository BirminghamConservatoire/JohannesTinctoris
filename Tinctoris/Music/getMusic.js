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
        var container = new MusicDocContainer(ids[i]);
        grabFromFile(ids[i], container);
        musicMap.set(ids[i], container);
    }
}

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
});

