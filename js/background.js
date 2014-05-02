/* Extensions that are used in this script */

if (typeof String.prototype.startsWith != 'function') {
   
  String.prototype.startsWith = function (str){
    return this.slice(0, str.length) == str;
  };
  
}


//Defines the actions that can be used
var actions = Object.freeze({
   RELOAD: "reload",
   FORCERELOAD: "force"
});

//Allows different display targets to be used via constants
var displayTypes = Object.freeze({
   CONSOLE: "CONSOLE",
   PAGE: "PAGE"
});

//controls the operation of the extension
var Controller = (function () {
   
   //constructor
   function Controller () {
      
      //Tab we are currently controlling
      this.activeTargetId = 0;
      
      //Where is the data being displayed
      this.displayTarget = displayTypes.CONSOLE;
      
      //load the users settings
      this.loadSettings();
   }
   
   //send request to regenerate field data
   Controller.prototype.update = function () {
      if (this.activeTargetId !== 0) {
         chrome.tabs.sendMessage(this.activeTargetId, { action: actions.RELOAD, target: this.displayTarget });
      }
   };
   
   //checks that a given url is in the approved list managed by the user
   Controller.prototype.isApprovedUrl = function (urlToApprove) {
      return (urlToApprove.startsWith("http://") || urlToApprove.startsWith("https://"));
   };
   
   //clears the active tab
   Controller.prototype.clearActiveTab = function () {
      this.activeTargetId = 0;
   };
   
   //reads the latest settings
   Controller.prototype.updateSettings = function (newSettings) {
      if (newSettings) {
         this.displayTarget = newSettings.display;
         console.log(this.displayTarget);
      }
   };
   
   //load user settings and apply them
   Controller.prototype.loadSettings = function () {
      var _this = this;
      evadi.blabr.data.getSettings(function (settings) {
         _this.updateSettings(settings);
      });
   };
   
   return Controller;
   
})();

//create the main controller instance
var controller = new Controller();


/* Chrome API's */

//Capture requests from other areas of the extension
chrome.extension.onMessage.addListener(function (request, sender, sendRequest) {
   
   if (request.action == actions.FORCERELOAD) {
      controller.activeTargetId = sender.tab.id;
      controller.update();
   }
   
});

//when a tab is updated, and only when it is complete then check it's url
//if it matches the approved list then hold on to it's id
chrome.tabs.onUpdated.addListener(function (tabId, change, tab) {
   
   if (change.status == "complete") {
      
      //check it's url to see if it is in the approved list
      if(controller.isApprovedUrl(tab.url)) {
         //make this the currently active tab
         controller.activeTargetId = tabId;
         console.log("target tab changed ", controller.activeTargetId);
      }
      
    }
    
});

//when a tab becomes active, then check it's url
//if it matches the approved list then hold onto it's id
chrome.tabs.onActivated.addListener(function (activeInfo) {

   //get information about this tab
   chrome.tabs.query({ active: true, status: "complete" }, function (tabs) {
      
      //we may have more than one result if the tab has dev tools open
      tabs.forEach(function (tab) {
         
         //now check the tabs url
         if (controller.isApprovedUrl(tab.url)) {
            //make this the currently active tab
            controller.activeTargetId = tab.id;
            console.log("target tab changed ", controller.activeTargetId);
         }
         
      });
      
   });
   
});

//Listen for keyboard shortcut presses
chrome.commands.onCommand.addListener(function (command) {
   
   if (command === "refresh_data") {
      controller.update();
   }
   
});