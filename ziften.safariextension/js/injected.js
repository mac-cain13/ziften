var ziften = (function() {
	// Private methods
	var local = {
			// All settings we want to get on initialization
			settingKeys: ['hotkeys', 'othersIssues', 'mentionIssues', 'searchfieldJumpToIssue', 'searchfieldJumpToProject', 'selectIssueNumberOnClick'],

			/**
			 * Hande received messages from global/background pages
			 *
			 * @param messageEvent Safari or Chrome message
			 */
			handleMessage: function(messageEvent) {
				// Received response on our getSettingsRequest-message
				if (messageEvent.name === "getSettingsResponse") {
					local.enableTweaks(messageEvent.message);
				}
			},

			/**
			 * Enable Sifter tweaks based on the given settings dictionary
			 *
			 * @param tweakSettings object with keys and values indication that tweaks to start
			 */
			enableTweaks: function(tweakSettings) {
				if (1 == tweakSettings.searchfieldJumpToProject) {
					tweaks.searchfieldJumpToProject();
				}

				if (1 == tweakSettings.searchfieldJumpToIssue) {
					tweaks.seachfieldJumpToIssue();
				}

				if (2 == tweakSettings.hotkeys) {
					tweaks.hotkeys();
				} else if (1 == tweakSettings.hotkeys) {
					tweaks.searchfieldAutofocus();
				}

				if (1 == tweakSettings.othersIssues) {
					tweaks.othersIssues();
				}

				if (1 <= tweakSettings.mentionIssues) {
					tweaks.issueMentioningWithHash( (2 == tweakSettings.mentionIssues) );
				}

				if (1 == tweakSettings.selectIssueNumberOnClick) {
					tweaks.selectIssueNumberOnClick();
				}
			},

			/**
			 * Get list of Sifter projects
			 *
			 * @param updateIfPossible boolean if we should try to update the projectlist
			 * @returns array of objects with label as projectname and href as url
			 */
			getProjectlist: function(updateIfPossible) {
				var projectlist = [];

				// If update is requested and we're on a projects page
				if (updateIfPossible && $('.project-list').length > 0) {
					// Go over all projects and add them to the projects list
					$('.project-list a').each(function(index, element) {
						var object = $(this);
						projectlist.push({ label: object.text(), href: object.attr('href') });
					});

					// Sort the projectlist
					projectlist.sort(function(a, b) {
						return a.label.toLowerCase().localeCompare(b.label.toLowerCase());
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
					$('#content-secondary .module.navigation.local a').each(function(index, element) {
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
				// Try to get current User ID from Issues menu
				var href = $('.nav-primary .table-issue-counts:first-child .open a').attr('href');

				// Check if we found the link
				if (href) {
					// Save current user ID into the local storage
					localStorage.ziftenCurrentUserId = local.getQueryStringParam('a', href.slice(href.indexOf('?')));
				}

				// Return the current known current user ID
				return localStorage.ziftenCurrentUserId;
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
				// Action: Focus searchbar
				// Works on: Every page with the searchbar
				key('s', function(event, handler) {
					event.preventDefault();
					tweaks.searchfieldAutofocus();
				});

				// Action: Create new issue
				// Works on: Any page with the "New issue"-button
				key('n', function(event, handler) {
					var newIssueUrl = $('.nav-primary a.text-create').attr('href');
					if (newIssueUrl) {
						window.location.href = newIssueUrl;
					}
				});

				// Action: Assign issue to "me"
				// Works on: Issue page
				key('a,m', function(event, handler) {
					// Check if we reassign, if so ask confirmation
					var currentAssignee = $('#comment_assignee_id').val(),
						currentAssigneeName = 'someone',
						currentUser = local.getCurrentUserId();
					if (currentAssignee > 0 && currentUser != currentAssignee) {
						currentAssigneeName = $('#comment_assignee_id option:selected').text();
						if (!confirm('This issue is already assigned to ' + currentAssigneeName + ', you will now reassign it to yourself.')) {
							return;
						}
					}

					// Assign to ourself
					$('#comment_assignee_id').val(currentUser).parents('form').submit();
				});

				// Action: Resolve issue
				// Works on: Issue page
				key('r', function(event, handler) {
					// Check if the resolved option is available
					var resolvedRadio = $('#comment_status_id_3');
					if (resolvedRadio.length > 0) {
						resolvedRadio.prop('checked', true).parents('form').submit();
					} else {
						console.log('[Ziften] Resolving this issue is not an option.');
					}
				});

				// Action: Close issue
				// Works on: Issue page
				key('c', function(event, handler) {
					// Check if the issue is resolved, if not ask confirmation
					var resolvedRadio = $('#comment_status_id_3');
					if (!$('#comment_status_id_4').prop('checked') && resolvedRadio.length > 0 && !resolvedRadio.prop('checked')) {
						if (!confirm('This issue is not yet resolved, you will now immediatly close it.')) {
							return;
						}
					}

					$('#comment_status_id_4').prop('checked', true).parents('form').submit();
				});

				// Action: Reopen issue
				// Works on: Issue page
				key('o', function(event, handler) {
					// Check if the reopen option is available
					var reopenRadio = $('#comment_status_id_2');
					if (reopenRadio.length > 0) {
						reopenRadio.prop('checked', true).parents('form').submit();
					} else {
						console.log('[Ziften] Reopening this issue is not an option.');
					}
				});

				// Add hotkey hints to make clear when to use what hotkey
				$('#new_comment .button-supplement').prepend('<p><b>Need some hotkeys?</b> Press <b>a</b> to assign this issue to yourself, <b>r</b> to resolve, <b>c</b> to close or <b>o</b> to reopen the issue.<br /><em>Note that hotkeys don\'t work while typing text, click on an empty spot to re-enable them.</em></p>');
			},

			/**
			 * Add "Others" to the issue menu
			 */
			othersIssues: function() {
				// Gather all user IDs, the "our" user ID and the current project ID
				var userIDs = local.getUserIds(true),
					currentUserIdIndex = userIDs.indexOf(local.getCurrentUserId()),
					path = $('.nav-primary .table-issue-counts .open a').attr('href'),
					issuesMenu = $('.nav-primary .table-issue-counts');

				// Check if the issues menu is available
				if (issuesMenu.length > 0) {
					// Create string of all user IDs of the other users
					userIDs.splice(currentUserIdIndex, 1);
					otherUserIdsString = userIDs.join('-');

					// Correct base path to base our URLs on
					path = path.slice(0, path.indexOf('?'));

					// Calculate the open/resolved issue count of "others"
					//  others = (everyone's - unassigned - mine)
					var othersOpened = issuesMenu.find('.count.open:eq(2) a').text() - issuesMenu.find('.count.open:eq(1) a').text() - issuesMenu.find('.count.open:eq(0) a').text(),
						othersResolved = issuesMenu.find('.count.resolved:eq(2) a').text() - issuesMenu.find('.count.resolved:eq(1) a').text() - issuesMenu.find('.count.resolved:eq(0) a').text();

					// Inject a row into the menu
					issuesMenu.append(
						'<tr>' +
							'<td class="count open' + ((othersOpened === 0) ? ' empty' : '') + '"> <a href="' + path + '?a=' + otherUserIdsString + '&amp;s=1-2">' + othersOpened + '</a> </td>' +
							'<td class="count resolved' + ((othersResolved === 0) ? ' empty' : '') + '"> <a href="' + path + '?a=' + otherUserIdsString + '&amp;s=3">' + othersResolved + '</a> </td>' +
							'<td class="group" scope="row"> <a href="' + path + '?a=' + otherUserIdsString + '&amp;s=1-2-3">Others</a> </td>' +
						'</tr>');
				}
			},

			/**
			 * Automaticly replace #1234 with i1234 to enable issue mentioning
			 */
			issueMentioningWithHash: function(alsoBelowThousand) {
				var regExp = (alsoBelowThousand) ? new RegExp(/( |^)#(\d+)/) : new RegExp(/( |^)#(\d{4,})/);

				$('#issue_body, #comment_body').keyup(function(event) {
					var obj = $(this);
					obj.val(obj.val().replace(regExp, '$1i$2'));
				});
			},

			/**
			 * Select the whole issuenumber when you click on it
			 */
			selectIssueNumberOnClick: function() {
				$(document).on('click', '.number, .subheader-status h2 i', function() {
					var range = document.createRange(),
						selection = window.getSelection();
					range.selectNodeContents(this);
					selection.removeAllRanges();
					selection.addRange(range);
				});
			}
		};

	// Trigger initialization based on the browser we're in
	if (window.safari) {
		// Install Safari message handler and request settings from the global page
		safari.self.addEventListener("message", local.handleMessage, false);
		safari.self.tab.dispatchMessage("getSettingsRequest", local.settingKeys);
	} else if (window.chrome) {
		// Send getSettingsRequest-message to Chrome background page
		chrome.extension.sendMessage({ name: "getSettingsRequest", message: local.settingKeys }, local.handleMessage);
	} else {
		console.error("[Ziften] Unable to detect browser, initialization failed!");
	}
})();