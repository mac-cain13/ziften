var ziftenGlobal = (function() {
	var local = {
		handleMessage: function(request, sender, sendResponse) {
			// Inspect what kind of message this is
			if (request.name === "getSettingsRequest") {
				var settings = {};

				// Get all settings
				for (var key in request.message) {
					var settingsKey = request.message[key];
					settings[settingsKey] = 1;// localStorage[settingsKey];
				}

				// Respond to the injexted script with the requested settings
				sendResponse({ name: "getSettingsResponse", message: settings });
			}
		}
	};

	// Install message handler
	chrome.extension.onMessage.addListener(local.handleMessage);
})();