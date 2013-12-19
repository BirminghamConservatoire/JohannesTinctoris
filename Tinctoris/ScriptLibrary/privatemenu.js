function extendMenu(){
  if(document.location.hostname==="localhost" 
     || document.location.hostname==="127.0.0.1"){
    // FIXME: stupid
    var li, a;
    var ul = document.getElementById("textMenu");
li=document.createElement('li');
a = document.createElement('a');
a.href='texts/deinventionemusice';
a.appendChild(document.createTextNode('deinventionemusice'));
li.appendChild(a);
ul.appendChild(li);
}}
