var ziftenGlobal = (function() {
	var local = {
		handleMessage: function(event) {
			if (event.name === "getSettingsRequest") {
				var settings = {};

				// Get all settings
				for (var key in event.message) {
					var settingsKey = event.message[key];
					settings[settingsKey] = safari.extension.settings[settingsKey];
				}

				event.target.page.dispatchMessage("getSettingsResponse", settings);
			}
		}
	};

	safari.application.addEventListener("message", local.handleMessage, false);
})();