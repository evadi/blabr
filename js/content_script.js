
//No need to wrap in a window.onload as nothing fires when the page is loaded
//but we do need to be ready to recieve requests straight away

var actions = Object.freeze({
   RELOAD: "reload",
   FORCERELOAD: "force"
});

//
var display = Object.freeze({
   CONSOLE: function (data) {
      console.log(data, "Showing hidden fields");
   },
   PAGE: function (data) {
      
   }
});

window.onload = function() {
   var btn = document.createElement("BUTTON")
   var t = document.createTextNode("CLICK ME");
   btn.appendChild(t);
   //Appending to DOM
   document.body.appendChild(btn);
   
   btn.onclick = forceReload;
};


function showFields (displayTarget) {
   var data = gatherData();
   display[displayTarget](data);
}

function gatherData () {
   return { name: "David" };
}

function injectScript(func) {
   var actualCode = '(' + func + ')();'
   var script = document.createElement('script');
   script.textContent = actualCode;
   (document.head||document.documentElement).appendChild(script);
   script.parentNode.removeChild(script);
}

//A method that can be initiated by any UI element which forces a reload
function forceReload () {
   chrome.extension.sendRequest({ action:actions.FORCERELOAD });
}


/* Chrome API's */

//Listen for messages from the controller
chrome.runtime.onMessage.addListener(function(request, sender, response) {
   if (request.action == actions.RELOAD) {
      showFields(request.target);
   }
});