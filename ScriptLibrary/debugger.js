// Debugger

var debugging = true;

function resetDebugger(){
  if(debugging && document.getElementById('debug')){
    document.getElementById('debug').innerHTML = '';
  }
}

function writeToDebugger(data){
  if(debugging && document.getElementById('debug')){
    document.getElementById('debug').innerHTML += data;
  }
}