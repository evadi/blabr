
//Defines the actions that can be performed
var actions = Object.freeze({
   RELOAD: "reload",
   FORCERELOAD: "force"
});

//Used to perform various operations on the page
var pageManager = (function() {
  
   //constructor
   function pageManager () {
      //cache this
      var _this = this;
      
      //output method interface
      this.display = Object.freeze({
         CONSOLE: {
            output: function (data) {
               console.log(data, "Blabr output");
            },
            clear: function () {
               //no implementation for this output method
            }
         },
         PAGE: {
            output: function (data) {
               _this.uiBuilder.toggleOverlay(data, true);
            },
            clear: function () {
               _this.uiBuilder.removeOverlay();
            }
         }
      });

      //sets the default output
      this.displayTarget = this.display.CONSOLE;
      
      //key used to get the correct display interface
      this.displayTargetKey = "CONSOLE";
      
      //object used to build ui elements
      this.uiBuilder = new UIBuilder();
      
      //object used to read information from the page
      this.pageReader = new pageReader();
   }
   
   //main function used to display data to correct display target
   pageManager.prototype.displayData = function (displayType) {
      if (displayType !== undefined) {
         if (displayType !== this.displayTargetKey)
            this.displayTarget.clear();
   
         this.displayTarget = this.display[displayType];
         this.displayTargetKey = displayType;
      }
      var data = this.gatherData();
      this.displayTarget.output(data);
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
   
   //create a standard label element for data
   UIBuilder.prototype.createLabelElement = function (label) {
      
      var labelField = document.createElement("span");
      labelField.style.fontWeight = "bold";
      labelField.style.margin = "0 10px 0 0";
      labelField.innerHTML = label;
      
      return labelField;
      
   };
   
   //create a standard value element for data
   UIBuilder.prototype.createValueElement = function (value) {
      
      var valueField = document.createElement("span");
      valueField.innerHTML = value;
      
      return valueField;
      
   };
   
   //checks to see if overlay exists, if not it creates one
   UIBuilder.prototype.buildOverlay = function () {
      
      var overlay = this.overlay;
      
      if (!overlay) {
         
         overlay = document.createElement("div");
         overlay.id = this.overlayId;
         overlay.style.background = "#fff";
         overlay.style.position = "fixed";
         overlay.style.bottom = "0"
         overlay.style.left = "0";
         overlay.style.right = "0";
         overlay.style.top = "100%";
         overlay.style.overflowY = "auto";
         overlay.style.boxShadow = "0 -5px 10px #999";
         overlay.style.zIndex = "900000";
         overlay.style.fontFamily = "Arial";
         overlay.style.fontSize = "11px";
         overlay.style.color = "#333";
         overlay.style.transition = "top 0.4s";
         
         document.body.appendChild(overlay);
         
         this.overlay = overlay;
         
      }
      
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
      
      var _this = this;
      data.forEach(function (item, index) {
         
         var isOdd = (index % 2);
         
         var listItem = document.createElement("li");
         listItem.style.float = isOdd ? "right" : "left";
         listItem.style.width = "50%";
         listItem.style.textAlign = "left";
         listItem.style.lineHeight = "15px";
         
         var field = document.createElement("div");
         field.style.background = "#DAE8F7";
         field.style.fontFamily = "Arial";
         field.style.fontSize = "11px";
         field.style.color = "#333";
         field.style.padding = "8px";
         field.style.margin = "15px";
         field.style.overflow = "hidden";
         field.style.textOverflow = "ellipsis";
         field.style.whiteSpace = "nowrap";
         field.style.cursor = "pointer";
         field.style.border = "1px solid #DAE8F7";
         field.title = item.html;
         
         var nameLabelField = _this.createLabelElement("Name: ");
         var nameValueField = _this.createValueElement(item.name ? item.name : "not assigned");
         
         var valueLabelField = _this.createLabelElement("Value: ");
         var valueField = _this.createValueElement(item.value);
         
         field.appendChild(nameLabelField);
         field.appendChild(nameValueField);
         field.appendChild(document.createElement("br"));
         field.appendChild(valueLabelField);
         field.appendChild(valueField);
         
         
         field.onmouseover = function () {
            //style the element with a glowing border
            this.style.boxShadow = "0 0 8px rgba(102,175,233,.8)";
            this.style.border = "1px solid #66afe9";
         };
         
         field.onmouseout = function () {
            //remove the border style
            this.style.boxShadow = "";
            this.style.border = "1px solid #DAE8F7";
         };
         
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
   
   //removes the overlay from the DOM
   UIBuilder.prototype.removeOverlay = function () {
      if (this.overlay) {
         document.body.removeChild(this.overlay);
         this.overlay = undefined;
      }
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