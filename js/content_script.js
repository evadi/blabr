//No need to wrap in a window.onload as nothing fires when the page is loaded
//but we do need to be ready to recieve requests straight away

//Defines the actions that can be performed
var actions = Object.freeze({
   RELOAD: "reload",
   FORCERELOAD: "force"
});

//Defines the ways in which data can be displayed to the user
var display = Object.freeze({
   CONSOLE: function (data) {
      console.log(data, "Showing hidden fields");
   },
   PAGE: function (data) {
      
   }
});

//Cached version of the UI builder we are using
var uiBuilder;

//Only when the page has loaded can elements be added to the DOM
window.onload = function() {
   uiBuilder = new UIBuilder();
   uiBuilder.showReloadOption();
   uiBuilder.showReloadOption();
};

//Used to perform various operations on the page
var pageManager = {
  
   //sets the default for displaying data
   displayTarget: display.CONSOLE,
   
   //main function used to display data to correct display target
   displayData: function(displayType) {
      if (displayType !== undefined) {
         this.displayTarget = display[displayType];
      }
      var data = this.gatherData();
      this.displayTarget(data);
   },
   
   //scrapes the page gathering information about hidden fields and returns
   gatherData: function () {
      return new dataReader().getHiddenFields();
   },
  
   //A method that can be initiated by any UI element which forces a reload
   forceReload: function () {
      chrome.extension.sendRequest({ action:actions.FORCERELOAD });
   }
   
};


//Used to read various parts of the associated page
var dataReader = function() {
   
   this.getHiddenFields = function () {
      return { name: "David" };
   };
   
};

//Used to generate various UI elements for the current page
var UIBuilder = function() {
   this._reloadOptionCreated = false;
   
   //display the reload button used to regenerate data
   this.showReloadOption = function () {
      if (this._reloadOptionCreated === false) {
         var btn = document.createElement("BUTTON");
         var t = document.createTextNode("R");
         btn.appendChild(t);
         btn.style.position = "fixed";
         btn.style.bottom = 0;
         btn.style.right = 0;
         //Appending to DOM
         document.body.appendChild(btn);
         
         btn.onclick = pageManager.forceReload;
      }
      this._reloadOptionCreated = true;
   };
   
   this.showDataOverlay = function () {
      
   };
   
};


/* Chrome API's */

//Listen for messages from the controller
chrome.runtime.onMessage.addListener(function(request, sender, response) {
   if (request.action == actions.RELOAD) {
      pageManager.displayData(request.target);
   }
});