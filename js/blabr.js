var evadi;

(function (evadi) { //root namespace
   
    (function (blabr) { //namespace for this application
       
        (function (data) { //namespace for data handling for this application
           
            //retrieve the users settings
            data.getSettings = function (callback) {
               if(callback) {
                  chrome.storage.sync.get("settings", function (result) {
                     var settings;
                     if (result) {
                        if (result.settings) {
                           settings = JSON.parse(result.settings);
                        }
                     }
                     callback(settings);
                  });
               }
            };
            
            //take a settings object and save it to the user's settings
            data.saveSettings = function (settings, callback) {
               chrome.storage.sync.set({ "settings": settings }, function () {
                  callback();
               });
            };
            
            //clears all settings for this application
            data.clearSettings = function () {
              chrome.storage.sync.clear();
            };
            
        })(evadi.blabr.data || (evadi.blabr.data = {}));
        var data = evadi.blabr.data;
        
    })(evadi.blabr || (evadi.blabr = {}));
    var blabr = evadi.blabr;
    
})(evadi || (evadi = {}));