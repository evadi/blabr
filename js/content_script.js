
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

//Used to perform various operations on the page
var pageManager = (function() {
  
   //constructor
   function pageManager () {
      this.displayTarget = display.CONSOLE; //sets the default for displaying data
      this.uiBuilder = new UIBuilder();
      this.pageReader = new pageReader();
   }
   
   //builds any UI elements that are necessary based on user settings
   pageManager.prototype.buildPage = function () {
      this.uiBuilder.showReloadOption();
   };
   
   //main function used to display data to correct display target
   pageManager.prototype.displayData = function (displayType) {
      if (displayType !== undefined) {
         this.displayTarget = display[displayType];
      }
      var data = this.gatherData();
      this.displayTarget(data);
   };
   
   //scrapes the page gathering information about hidden fields and returns
   pageManager.prototype.gatherData = function () {
      return this.pageReader.getHiddenFields();
   };
   
   //A method that can be initiated by any UI element which forces a reload
   pageManager.prototype.forceReload = function () {
      chrome.extension.sendRequest({ action:actions.FORCERELOAD });
   };
   
   return pageManager;
   
})();


//Used to read various parts of the associated page
var pageReader = (function() {
   
   //constructor
   function pageReader () {
      
   }
   
   //read all hidden fields from the page
   pageReader.prototype.getHiddenFields = function () {
      
      var targets = [];
      
      //query all inputs in the DOM
      var inputs = document.getElementsByTagName('input');

      //filter inputs by hidden only
      for(var i=0; i < inputs.length; i++) {
         if(inputs[i].type=="hidden") {
            targets.push(new targetElement(inputs[i]));
         }
      }
      
      return targets;
   };
   
   return pageReader;
   
})();

//used to represent a hidden field that has been found on the page
var targetElement = (function () {
   
   //constructor
   function targetElement (element) {
      if (element) {
         this.element = element; //UI element
         this.populate();
      } else {
         throw "UI element must be specified";
      }
   }
   
   //populates properties based on the element used to construct this class
   targetElement.prototype.populate = function () {
      this.value = this.element.value;
      this.name = this.element.name;
      this.id = this.element.id;
      this.classes = this.element.className;
      this.html = this.element.outerHTML;
   };
   
   return targetElement;
   
})();

//Used to generate various UI elements for the current page
var UIBuilder = (function() {
   
   //constructor
   function UIBuilder () {
      this.reloadOptionCreated = false; //ensures no duplicate reload buttons
   }
   
   //display the reload button used to regenerate data
   UIBuilder.prototype.showReloadOption = function () {
      if (this.reloadOptionCreated === false) {
         var btn = document.createElement("BUTTON");
         var t = document.createTextNode("R");
         btn.appendChild(t);
         btn.style.position = "fixed";
         btn.style.bottom = 0;
         btn.style.right = 0;
         //Appending to DOM
         document.body.appendChild(btn);
         
         btn.onclick = manager.forceReload;
      }
      this.reloadOptionCreated = true;
   };
   
   //build the overlay used to display field data
   UIBuilder.prototype.showDataOverlay = function () {
      
   };
   
   return UIBuilder;
   
})();


var manager = new pageManager(); //main cache of the page manager
manager.buildPage(); //add any necessary UI elements to page


/* Chrome API's */

//Listen for messages from the controller
chrome.runtime.onMessage.addListener(function(request, sender, response) {
   if (request.action == actions.RELOAD) {
      manager.displayData(request.target);
   }
});