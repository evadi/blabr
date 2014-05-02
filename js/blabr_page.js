
//Defines the actions that can be performed
var actions = Object.freeze({
   RELOAD: "reload",
   FORCERELOAD: "force"
});

//Defines the ways in which data can be displayed to the user
var display = Object.freeze({
   CONSOLE: function (data) {
      console.log(data, "Blabr output");
   },
   PAGE: function (data) {
      manager.uiBuilder.toggleOverlay(data, true);
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

//Builds various elements to be rendered onto a page
var UIBuilder = (function() {
   
   //constructor
   function UIBuilder () {
      this.overlayId = "blabrOverlay";
   }
   
   //checks to see if overlay exists, if not it creates one
   UIBuilder.prototype.buildOverlay = function () {
      
      var overlay = this.overlay;
      
      if (!this.overlay) {
         
         overlay = document.createElement("div");
         overlay.id = this.overlayId;
         overlay.style.background = "#fff";
         overlay.style.position = "fixed";
         overlay.style.bottom = "0"
         overlay.style.left = "0";
         overlay.style.right = "0";
         overlay.style.top = "100%";
         overlay.style.overflowY = "scroll";
         overlay.style.boxShadow = "0 -5px 10px #999";
         overlay.style.zIndex = "900000";
         overlay.style.fontFamily = "Arial";
         overlay.style.fontSize = "11px";
         overlay.style.color = "#333";
         
         document.body.appendChild(overlay);
      
      }
      
      this.overlay = overlay;
   };
   
   //builds the data elements
   UIBuilder.prototype.buildData = function (overlay, data) {
      
      //first clear the overlay
      overlay.innerHTML = "";
      
      var list = document.createElement("ul");
      list.style.listStyle = "none";
      list.style.listStyleType = "none";
      list.style.margin = "0";
      list.style.padding = "0";
      
      data.forEach(function (item, index) {
         
         var isLeft = (index % 2);
         
         var listItem = document.createElement("li");
         listItem.style.float = isLeft ? "left" : "right";
         listItem.style.width = "50%";
         
         var field = document.createElement("div");
         field.style.background = "#ddd";
         field.style.fontFamily = "Arial";
         field.style.fontSize = "12px";
         field.style.color = "#333";
         field.style.padding = "8px";
         field.style.margin = "20px";
         field.style.overflow = "hidden";
         field.style.textOverflow = "ellipsis";
         field.style.whiteSpace = "nowrap";
         field.innerHTML = item.name ? item.name : "not available";
         
         listItem.appendChild(field);
         list.appendChild(listItem);
         
      });
      
      overlay.appendChild(list);
      
   };
   
   //build the overlay used to display field data
   UIBuilder.prototype.toggleOverlay = function (data) {
      this.buildOverlay();
      var isActive = (this.overlay.style.top === "50%");
      
      this.buildData(this.overlay, data);
      //now toggle the overlay
      if (isActive) {
         this.overlay.style.top = "100%";
      } else {
         this.overlay.style.top = "50%";
      }
   };
   
   //shows the overlay to the user
   UIBuilder.prototype.showOverlay = function () {
      
   };
   
   return UIBuilder;
   
})();


var manager = new pageManager(); //main cache of the page manager


/* Chrome API's */

//Listen for messages from the controller
chrome.runtime.onMessage.addListener(function(request, sender, response) {
   if (request.action == actions.RELOAD) {
      manager.displayData(request.target);
   }
});