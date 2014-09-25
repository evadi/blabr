//boiler plate for inheritance support
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};


//Defines the actions that can be performed
var actions = Object.freeze({
   RELOAD: "reload",
   FORCERELOAD: "force"
});

//Used to read various parts of the associated page
var PageReader = (function() {

  function PageReader() {

  }

   //read all hidden fields from the page
   PageReader.getHiddenFields = function () {

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

   PageReader.getMaxLengthFields = function () {
     var targets = [];

      //query all inputs in the DOM
      var inputs = document.getElementsByTagName('input');
     // var areas = document.getElementsByTagName('textarea');

      //filter inputs by text only
      for(var i=0; i < inputs.length; i++) {
         if(inputs[i].type=="text") {
            targets.push(new targetElement(inputs[i]));
         }
      }

      //add textareas to the targets array
      // for(var i=0; i < areas.length; i++) {
      //   targets.push(new targetElement(areas[i]));
      // }

      return targets;
   };

   return PageReader;

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
      this.attributes = this.element.attributes;
      this.html = this.element.outerHTML;
      this.displayLabel = function () {
        if (!this.name)
          if (this.id)
            return "Id";

        return "Name";
      };
      this.displayName = function () {
        var name;
        if (this.name) {
          name = this.name;
        }
        else {
          if (this.id) {
            name = this.id;
          }
          else {
            name = "not assigned";
          }
        }
        return name;
      }
   };

   return targetElement;

})();

//Builds various elements to be rendered onto a page
var UIBuilder = (function() {

  function UIBuilder(id) {
    this.overlayId = id;
  }

   //create a standard label element for data
   UIBuilder.prototype.createLabelElement = function (label) {

      var labelField = document.createElement("span");
      labelField.style.fontWeight = "bold";
      labelField.style.margin = "0 10px 0 0";
      labelField.style.width = "40px";
      labelField.style.display = "inline-block";
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
         overlay.style.height = "0px";
         overlay.style.overflowY = "auto";
         overlay.style.boxShadow = "0 -5px 10px #999";
         overlay.style.zIndex = "900000";
         overlay.style.fontFamily = "Arial";
         overlay.style.fontSize = "11px";
         overlay.style.color = "#333";
         overlay.style.transition = "height 0.4s";

         document.body.appendChild(overlay);

         this.overlay = overlay;

      }

   };

   //build the overlay used to display field data
   UIBuilder.prototype.toggleOverlay = function (data) {
      this.buildOverlay();
      var isActive = (this.overlay.style.height === "400px");

      this.buildData(this.overlay, data);

      var body = document.getElementsByTagName("body")[0];

      //now toggle the overlay
      if (isActive) {
        body.style.padding = null;
        this.overlay.style.height = "0px";
      } else {
        body.style.padding = "0px 0px 400px 0px";
        this.overlay.style.height = "400px";
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

var UIHiddenFieldsBuilder = (function (_super) {
    __extends(UIHiddenFieldsBuilder, _super);

    function UIHiddenFieldsBuilder() {
      _super.apply(this, arguments);
    }

    //builds the data elements
    UIHiddenFieldsBuilder.prototype.buildData = function (overlay, data) {

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

         var nameLabelField = _this.createLabelElement(item.displayLabel() + ": ");
         var nameValueField = _this.createValueElement(item.displayName());

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

  return UIHiddenFieldsBuilder;
})(UIBuilder);

var UIMaxLengthBuilder = (function (_super) {
    __extends(UIMaxLengthBuilder, _super);

    function UIMaxLengthBuilder() {
      _super.apply(this, arguments);
    }

    //loop attributes on specific element and check for max length validation
    //attribute
    UIMaxLengthBuilder.prototype.validationAttribute = function (attributes) {
      for(var i = 0; i < attributes.length; i++){
        if (attributes[i].name === "data-val-length-max"){
          return attributes[i];
        }
      }

      return undefined;
    };

    //loop attributes on specific element and check for standard max length
    //attribute
    UIMaxLengthBuilder.prototype.standardAttribute = function (attributes) {
      for(var i = 0; i < attributes.length; i++){
        if (attributes[i].name === "maxlength"){
          return attributes[i];
        }
      }

      return undefined;
    };

    //gets the max length value or returns -1 if they do not match
    UIMaxLengthBuilder.prototype.value = function (standard, validation) {
      if (standard !== undefined && validation !== undefined)
      {
        if (standard.value !== validation.value)
          return -1;

        return standard.value;
      }

      return -1;
    };

    //builds the data elements
    UIMaxLengthBuilder.prototype.buildData = function (overlay, data) {

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

         var nameLabelField = _this.createLabelElement(item.displayLabel() + ": ");
         var nameValueField = _this.createValueElement(item.displayName());

         var status = 2; //0 = failed; 1 = partial; 2 = success;
         var value = "";
         var valAttr = _this.validationAttribute(item.attributes);
         if (valAttr === undefined) {
          value = "No validation rule set";
          status = 0;
         }

         var standardAttr = _this.standardAttribute(item.attributes);
         if (standardAttr === undefined) {
          value = "No character limit restriction set";
          status = 0;
         }
         
         if (valAttr === undefined && standardAttr === undefined)
          value = "No character limit restriction or validation rule set";

         if (status == 2) {
          var maxLengthVal = _this.value(valAttr, standardAttr);
          if (maxLengthVal != -1) {
            value = maxLengthVal;
          }
          else {
            value = "Character limit and validation rule do not match";
            status = 1;
          }
         }

         var valueLabelField = _this.createLabelElement("Value: ");
         var valueField = _this.createValueElement(value);

         field.appendChild(nameLabelField);
         field.appendChild(nameValueField);
         field.appendChild(document.createElement("br"));
         field.appendChild(valueLabelField);
         field.appendChild(valueField);

         switch (status) {
           case 0: //failed
            field.style.backgroundColor = "red";
            field.style.color = "white";
            break;

          case 1: //partial
            field.style.backgroundColor = "yellow";
            break;

          case 2: //success
            field.style.backgroundColor = "green";
            field.style.color = "white";
            break;
         }


         field.onmouseover = function () {
            //style the element with a glowing border
            this.style.boxShadow = "0 0 8px rgba(102,175,233,.8)";
            this.style.border = "1px solid #66afe9";

            item.element.style.backgroundColor = "#DAE8F7";
         };

         field.onmouseout = function () {
            //remove the border style
            this.style.boxShadow = "";
            this.style.border = "1px solid #DAE8F7";

            item.element.style.backgroundColor = "";
         };

         listItem.appendChild(field);
         list.appendChild(listItem);

      });

      overlay.appendChild(list);

   };

  return UIMaxLengthBuilder;
})(UIBuilder);

//Used to perform various operations on the page
var pageManager = (function() {

   //constructor
   function pageManager () {
      //cache this
      var _this = this;

      //output method interface
      this.display = Object.freeze({
         CONSOLE: {
            output: function (builder, data) {
               console.log(data, "Blabr output");
            },
            clear: function (builder) {
               //no implementation for this output method
            }
         },
         PAGE: {
            output: function (builder, data) {
               builder.toggleOverlay(data, true);
            },
            clear: function (builder) {
               builder.removeOverlay();
            }
         }
      });

      this.command = Object.freeze({
        hidden_fields: {
          builder: new UIHiddenFieldsBuilder("blabrHfo"),
          show: function (output) {
            var data = PageReader.getHiddenFields();
            output(this.builder, data);
          }
        },
        max_lengths: {
          builder: new UIMaxLengthBuilder("blabrMlf"),
          show: function (output) {
            var data = PageReader.getMaxLengthFields();
            output(this.builder, data);
          }
        }
      });

      //sets the default output
      this.displayTarget = this.display.PAGE;

      //key used to get the correct display interface
      this.displayTargetKey = "PAGE";
   }

   //main function used to display data to correct display target
   pageManager.prototype.displayData = function (userCommand, displayType) {
      if (userCommand === undefined)
        throw "No command specified";

      var command = this.command[userCommand];
      if (command === undefined)
        throw "Command not found";


      if (displayType !== undefined) {
         if (displayType !== this.displayTargetKey)
            this.displayTarget.clear(command);

         this.displayTarget = this.display[displayType];
         this.displayTargetKey = displayType;
      }

      //gather and display data based on the command and output chosen by the user
      command.show(this.displayTarget.output);
   };

   //A method that can be initiated by any UI element which forces a reload
   pageManager.prototype.forceReload = function () {
      chrome.extension.sendRequest({ action:actions.FORCERELOAD });
   };

   return pageManager;

})();

var manager = new pageManager(); //main cache of the page manager


/* Chrome API's */

//Listen for messages from the controller
chrome.runtime.onMessage.addListener(function(request, sender, response) {
   if (request.action == actions.RELOAD) {
      manager.displayData(request.command, request.target);
   }
});