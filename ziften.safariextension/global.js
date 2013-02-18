var ziftenGlobal = (function() {
	var local = {
		handleMessage: function(messageEvent) {
			// Inspect what kind of message this is
			if (messageEvent.name === "getSettingsRequest") {
				var settings = {};

				// Get all settings
				for (var key in messageEvent.message) {
					var settingsKey = messageEvent.message[key];
					settings[settingsKey] = safari.extension.settings[settingsKey];
				}

				// Respond to the injexted script with the requested settings
				messageEvent.target.page.dispatchMessage("getSettingsResponse", settings);
			}
		}
	};

	// Install message handler
	safari.application.addEventListener("message", local.handleMessage, false);
})();