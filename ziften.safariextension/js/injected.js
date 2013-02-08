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
					$('.switcher .menu a').each(function(index, element) {
						var object = $(this);
						projectlist.push({ label: object.text(), href: object.attr('href') });
					});

					// Save projectslist to the storage
					localStorage.projectlist = JSON.stringify(projectlist);
				}
				// If there is a list in the storage
				else if (localStorage.projectlist && localStorage.projectlist.length > 0) {
					// Unserialize it
					projectlist = JSON.parse(localStorage.projectlist);
				}

				return projectlist;
			},

			/**
			 * Get all known user IDs
			 *
			 * @param gatherFromPage boolean if we should gather and add al user IDs found on the current page
			 * @returns array of user IDs
			 */
			getUserIds: function(gatherFromPage) {
				var userIDs = [];

				// Local all IDs from storage
				if (localStorage.userids && localStorage.userids.length > 0) {
					// Unserialize it
					userIDs = JSON.parse(localStorage.userids);
				}

				// Gather and add all user IDs found on page if requested
				if (gatherFromPage) {
					// Get the user IDs from the current querystring
					var userIdsInQuerystring = local.getQueryStringParam('a').split('-');
					for (var i in userIdsInQuerystring) {
						if (userIdsInQuerystring[i] !== '' && userIdsInQuerystring[i] !== '0' && userIDs.indexOf(userIdsInQuerystring[i]) == -1) {
							userIDs.push(userIdsInQuerystring[i]);
						}
					}

					// Loop through all sidebar navigation links
					$('.secondary .module.navigation.local a').each(function(index, element) {
						var href = $(this).attr('href'),
							userIdsInQuerystring = local.getQueryStringParam('a', href.slice(href.indexOf('?'))).split('-');
						for (var i in userIdsInQuerystring) {
							if (userIdsInQuerystring[i] !== '' && userIdsInQuerystring[i] !== '0' && userIDs.indexOf(userIdsInQuerystring[i]) == -1) {
								userIDs.push(userIdsInQuerystring[i]);
							}
						}
					});

					// Save user IDs to the storage
					localStorage.userids = JSON.stringify(userIDs);
				}

				return userIDs;
			},

			/**
			 * Get the ID of the user that's logged in
			 *
			 * @returns string user ID of the current user
			 */
			getCurrentUserId: function() {
				var href = $('.nav .issues .menu table tr:first-child td:first-child a').attr('href');
				return local.getQueryStringParam('a', href.slice(href.indexOf('?')));
			},

			/**
			 * Get a parameter from the querystring
			 *  Heavily based on: https://developer.mozilla.org/en-US/docs/DOM/window.location
			 *
			 * @param string name of the parameter to get from the querystring
			 * @param string optional the querystring to get the params from
			 * @return string value of the parameter
			 */
			getQueryStringParam: function(parameter, querystring) {
				if (!querystring) {
					querystring = window.location.search;
				}
				return unescape(querystring.replace(new RegExp("^(?:.*[&\\?]" + escape(parameter).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
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
			 * Jump directly to a project from the searchfield
			 *  with the assistance of autocomplete
			 */
			searchfieldJumpToProject: function() {
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
			seachfieldJumpToIssue: function() {
				$('.query').parent('form').submit(function(event) {
					// Look if the search is for an issuenumber
					var issuenumber = $('.query').val().match(/^#(\d+)$/);
					if (issuenumber) {
						// It is, prevent default search and go to issue page
						event.preventDefault();
						window.location.href = '/issues/' + issuenumber[1];
					}
				});
			},

			/**
			 * Assign various hotkeys
			 */
			hotkeys: function() {
				// Focus searchbar
				key('s', function(event, handler) {
					event.preventDefault();
					tweaks.searchfieldAutofocus();
				});

				// Create new issue
				key('n', function(event, handler) {
					var newIssueUrl = $('.new-issue a').attr('href');
					if (newIssueUrl) {
						window.location.href = newIssueUrl;
					}
				});
			},

			/**
			 * Add "Others" to the issue menu
			 */
			othersIssues: function() {
				// Gather all user IDs, the "our" user ID and the current project ID
				var userIDs = local.getUserIds(true),
					currentUserIdIndex = userIDs.indexOf(local.getCurrentUserId()),
					path = $('.nav .issues .menu table tr:first-child td:first-child a').attr('href');

				// Create string of all user IDs of the other users
				userIDs.splice(currentUserIdIndex, 1);
				otherUserIdsString = userIDs.join('-');

				// Correct base path to base our URLs on
				path = path.slice(0, path.indexOf('?'));

				// Inject a row into the menu
				$('.nav .issues .menu table').append(
					'<tr>' +
						'<td class="count open"> <a href="' + path + '?a=' + otherUserIdsString + '&amp;s=1-2">?</a> </td>' +
						'<td class="count resolved"> <a href="' + path + '?a=' + otherUserIdsString + '&amp;s=3">?</a> </td>' +
						'<td class="group"> <a href="' + path + '?a=' + otherUserIdsString + '&amp;s=1-2-3">Others</a> </td>' +
					'</tr>');
			}
		};

	// Inject jQuery UI stylesheet as last item in the head so it overrules other styles
	$('head').append('<link href="' + safari.extension.baseURI + 'css/jquery-ui.css" media="screen" rel="stylesheet" type="text/css">');

	// Enable tweaks
	tweaks.searchfieldJumpToProject();
	tweaks.seachfieldJumpToIssue();
	tweaks.searchfieldAutofocus(); // Autofocus makes the hotkey tweak less usefull, default off?!
	tweaks.hotkeys();
	tweaks.othersIssues();
})();