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
				if (updateIfPossible && $('.switcher .menu, .group .name').length > 0) {
					// Go over all projects and add them to the projects list
					$('.switcher .menu a, .group .name a').each(function(index, element) {
						var object = $(this);
						projectlist.push({ label: object.text(), href: object.attr('href') });
					});

					// Save projectslist to the storage
					localStorage.ziftenProjectlist = JSON.stringify(projectlist);
				}
				// If there is a list in the storage
				else if (localStorage.ziftenProjectlist && localStorage.ziftenProjectlist.length > 0) {
					// Unserialize it
					projectlist = JSON.parse(localStorage.ziftenProjectlist);
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
				if (localStorage.ziftenUserids && localStorage.ziftenUserids.length > 0) {
					// Unserialize it
					userIDs = JSON.parse(localStorage.ziftenUserids);
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
					localStorage.ziftenUserids = JSON.stringify(userIDs);
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
					},
					create: function(event, ui) {
						// Uses Sifters mentions styling for the autocomplete
						$('.ui-autocomplete').addClass('mentions');
					},
					messages: {
						// Suppress the accessability message "X results found..."
						noResults: '',
						results: function() {}
					}
				})
				.attr('placeholder', 'Issue #, Projectname or Keyword')
				.width('222px');
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
					path = $('.nav .issues .menu table tr:first-child td:first-child a').attr('href'),
					issuesMenu = $('.nav .issues .menu table');

				// Create string of all user IDs of the other users
				userIDs.splice(currentUserIdIndex, 1);
				otherUserIdsString = userIDs.join('-');

				// Correct base path to base our URLs on
				path = path.slice(0, path.indexOf('?'));

				// Calculate the open/resolved issue count of "others"
				//  others = (everyone's - unassigned - mine)
				var othersOpened = issuesMenu.find('tr:eq(2) .open a').text() - issuesMenu.find('tr:eq(1) .open a').text() - issuesMenu.find('tr:first-child .open a').text(),
					othersResolved = issuesMenu.find('tr:eq(2) .resolved a').text() - issuesMenu.find('tr:eq(1) .resolved a').text() - issuesMenu.find('tr:first-child .resolved a').text();

				// Inject a row into the menu
				issuesMenu.append(
					'<tr>' +
						'<td class="count open' + ((othersOpened === 0) ? ' empty' : '') + '"> <a href="' + path + '?a=' + otherUserIdsString + '&amp;s=1-2">' + othersOpened + '</a> </td>' +
						'<td class="count resolved' + ((othersResolved === 0) ? ' empty' : '') + '"> <a href="' + path + '?a=' + otherUserIdsString + '&amp;s=3">' + othersResolved + '</a> </td>' +
						'<td class="group"> <a href="' + path + '?a=' + otherUserIdsString + '&amp;s=1-2-3">Others</a> </td>' +
					'</tr>');
			}
		};

	// Make sure we're not on the home- or statuspage (especially for Chrome)
	if (!window.location.hostname.match(/^(www\.|status\.)?sifterapp\.com$/))
	{
		// Enable tweaks if not on the homepage
		tweaks.searchfieldJumpToProject();
		tweaks.seachfieldJumpToIssue();
		//tweaks.searchfieldAutofocus(); // Autofocus makes the hotkey tweak less usefull, default off?!
		tweaks.hotkeys();
		tweaks.othersIssues();
	}
})();