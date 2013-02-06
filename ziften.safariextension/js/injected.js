var ziften = (function() {
	// Inject jquery ui CSS as last stylesheet so it overrules other styles
	$('head').append('<link href="' + safari.extension.baseURI + 'css/jquery-ui.css" media="screen" rel="stylesheet" type="text/css">');

	// Aggregate project autocomplete data
	var projectlist = [];
	$('.group .name a').each(function() {
		projectlist.push({ label: $(this).text(), href: $(this).attr('href') });
	});

	// Searchfield tweaks
	$('.query').autocomplete({
		source: projectlist,
		delay: 0,
		autoFocus: true,
		select: function(event, ui) {
			event.preventDefault();
			window.location.href = ui.item.href;
		}
	}).focus();
})();