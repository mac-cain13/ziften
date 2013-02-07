var ziften = (function() {
	// Private methods
	var local = {
			/**
			 * Get list of Sifter projects
			 *
			 * @param updateIfPossible boolean if we should try to update the projectlist
			 * @returns array of objects with label as projectname and href as url
			 */
			getProjectlist: function(updateIfPossible) {
				var projectlist = [];

				// If update is requested and we're on a projects page
				if (updateIfPossible && $('.switcher .menu').length == 1) {
					// Go over all projects and add them to the projects list
					$('.switcher .menu a').each(function() {
						projectlist.push({ label: $(this).text(), href: local.stripQueryStringAndHashFromURL($(this).attr('href')) });
					});

					// Save projectslist to the storage
					localStorage.projectlist = JSON.stringify(projectlist);
				}
				// If there is a list in the storage
				else if (localStorage.projectlist.length > 0) {
					// Unserialize it
					projectlist = JSON.parse(localStorage.projectlist);
				}

				return projectlist;
			},

			/**
			 * Strip querystring and hash from URL
			 *  Before: /something?parameter#hastag
			 *  After: /something
			 *
			 * @param URL to strip
			 * @returns String of stripped URL
			 */
			stripQueryStringAndHashFromURL: function(url) {
				return url.split('?')[0].split('#')[0];
			}
		},
	// Tweaks and optimizations divided by methods to easily enabled just some of them
	tweaks = {
			/**
			 * Focus on the searchfield
			 *
			 * @returns Boolean, true when the field is focussed, false when the field isn't found
			 */
			searchfieldAutofocus: function() {
				// Focus and check if anything was focussed
				return ($('.query').focus().length > 0);
			},

			/**
			 * Enable autocompletion on the seachfield for:
			 *  - Projects
			 */
			searchfieldAutocomplete: function() {
				// Enable autcompletion
				$('.query').autocomplete({
					source: local.getProjectlist(true), // Get the source items to search thru
					delay: 0, // Do not wait to show results
					autoFocus: true, // Focus the first result automaticly
					select: function(event, ui) {
						// When an result is choosen jump directly to that page
						event.preventDefault();
						window.location.href = ui.item.href;
					}
				});
			},

			/**
			 * Jump directly to an issue from the searchfield
			 *  the search string should be like: #1234
			 */
			seachfieldJumpToIssue : function() {
				$('.query').parent('form').submit(function(event) {
					// Look if the search is for an issuenumber
					var issuenumber = $('.query').val().match(/^#(\d+)$/);
					if (issuenumber) {
						// It is, prevent default search and go to issue page
						event.preventDefault();
						window.location.href = '/issues/' + issuenumber[1];
					}
				});
			}
		};

	// Inject jQuery UI stylesheet as last item in the head so it overrules other styles
	$('head').append('<link href="' + safari.extension.baseURI + 'css/jquery-ui.css" media="screen" rel="stylesheet" type="text/css">');

	// Enable tweaks
	tweaks.searchfieldAutocomplete();
	tweaks.searchfieldAutofocus();
	tweaks.seachfieldJumpToIssue();
})();