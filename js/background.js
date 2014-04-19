/* SPEC
   - When a tab is updated and url matches an approved url then reload the data
   - Currently we only write the data to the console
   - Expose a javascript method to be able to reload the data
*/

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
var controller = {
   
   //Tab we are currently controlling
   activeTargetId: 0,
   
   //Where is the data being displayed
   displayTarget: displayTypes.CONSOLE,
   
   //send request to regenerate field data
   update: function () {
      if (this.activeTargetId !== 0) {
         chrome.tabs.sendMessage(this.activeTargetId, { action: actions.RELOAD, target: this.displayTarget });
      }
   }
};



/* Chrome API's */

//Capture requests from other areas of the extension
chrome.extension.onRequest.addListener(function (request, sender, sendRequest) {
   if (request.action == actions.FORCERELOAD) {
      controller.activeTargetId = sender.tab.id;
      controller.update();
   }
});

//when a tab is updated, and only when it is complete then check it's url
//if it matches the approved list then write out the data to the chosen display method
chrome.tabs.onUpdated.addListener(function (tabId, change, tab) {
   if (change.status == "complete") {
      if (tabId != controller.activeTargetId) {
        controller.activeTargetId = tabId;
        controller.update();
      }
    }
});