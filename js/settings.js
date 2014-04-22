window.onload = function () {
   
   var page = new settingsPage(false);
   page.initialise();
   
};

//used to manage the settings page
var settingsPage = (function () {
   
   //constructor
   function settingsPage (shouldClear) {
      
      //testing only
      if (shouldClear) {
         chrome.storage.sync.clear();
      }
      
      //interfaces with chrome storage API
      this.provider = new storageProvider();
      
      //user setting for display target
      this.display = ko.observable("CONSOLE");
      
      //handles the read and write of display binding
      this.display.forEdit = ko.computed({
         read: function () {
            return this.display();
         },
         write: function (newValue) {
            this.display(newValue);
         },
         owner: this
      });
      ko.applyBindings(this);
      
   }
   
   //initialise the settings page
   settingsPage.prototype.initialise = function () {
      //read user settings and apply them
      var _this = this;
      var settings = this.provider.getSettings(function (settings) {
         _this.applySettings(settings);
      });
   };
   
   //takes the raw settings object retrieved from storage and applies the values
   settingsPage.prototype.applySettings = function (settings) {
      //read the values from the settings object and assign it to this class
      if (settings !== undefined) {
         var parsedSettings = JSON.parse(settings);
         
         this.display(parsedSettings["display"]);
      }
      else {
         console.log("no settings file found");
      }
   };
   
   //handles the UI element for saving settings - passes on the storage provider
   settingsPage.prototype.saveSettings = function () {
      //read state of the page and save the settings
      this.provider.saveSettings(ko.toJSON(this));
   };
   
   return settingsPage;
   
})();


//used to read write from user storage
var storageProvider = (function () {
  
   //constructor
   function storageProvider () {
   }
  
   //retrieve the users settings
   storageProvider.prototype.getSettings = function (callback) {
      chrome.storage.sync.get("settings", function (result) {
         callback(result.settings);
      });
   };
   
   //take a settings object and save it to the user's settings
   storageProvider.prototype.saveSettings = function (settings, callback) {
      var data = {};
      data["settings"] = settings;
      
      chrome.storage.sync.set(data, function () {
         callback();
      });
   };
   
   return storageProvider;
   
})();