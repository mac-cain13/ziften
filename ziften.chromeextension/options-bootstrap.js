$(function() {
	$('.menu a').click(function(ev) {
		ev.preventDefault();
		var selected = 'selected';

		$('.mainview > *').removeClass(selected);
		$('.menu li').removeClass(selected);
		setTimeout(function() {
			$('.mainview > *:not(.selected)').css('display', 'none');
		}, 100);

		$(ev.currentTarget).parent().addClass(selected);
		var currentView = $($(ev.currentTarget).attr('href'));
		currentView.css('display', 'block');
		setTimeout(function() {
			currentView.addClass(selected);
		}, 0);

		setTimeout(function() {
			$('body')[0].scrollTop = 0;
		}, 200);
	});

	$('#launch_modal').click(function(ev) {
		ev.preventDefault();
		var modal = $('.overlay').clone();
		$(modal).removeAttr('style');
		$(modal).find('button').click(function() {
			$(modal).addClass('transparent');
			setTimeout(function() {
				$(modal).remove();
			}, 1000);
		});

		$(modal).click(function() {
			$(modal).find('.page').addClass('pulse');
			$(modal).find('.page').on('webkitAnimationEnd', function() {
				$(this).removeClass('pulse');
			});
		});
		$('body').append(modal);
	});

	$('.mainview > *:not(.selected)').css('display', 'none');

	/** Ziften settings load and save logic **/
	$('input').change(function(event) {
		// Save the settings
		localStorage.othersIssues = ($('#othersIssues').prop('checked')) ? $('#othersIssues').val() : 0;
		localStorage.hotkeys = $('input[name=hotkeys]:checked').val();
		localStorage.mentionIssues = $('input[name=mentionIssues]:checked').val();
		localStorage.selectIssueNumberOnClick = $('input[name=selectIssueNumberOnClick]:checked').val();

		localStorage.searchfieldJumpToIssue = ($('#searchfieldJumpToIssue').prop('checked')) ? $('#searchfieldJumpToIssue').val() : 0;
		localStorage.searchfieldJumpToProject = ($('#searchfieldJumpToProject').prop('checked')) ? $('#searchfieldJumpToProject').val() : 0;
	});

	// Initialize settings if needed
	if (true !== localStorage.ziftenInitialized) {
		localStorage.othersIssues = localStorage.searchfieldJumpToIssue = localStorage.searchfieldJumpToProject = localStorage.selectIssueNumberOnClick = 1;
		localStorage.hotkeys = localStorage.mentionIssues = 2;
		localStorage.ziftenInitialized = true;
	}

	// Load settings
	$('#othersIssues').prop('checked', (1 == localStorage.othersIssues) );
	$('input[name=hotkeys][value=' + localStorage.hotkeys + ']').prop('checked', true);
	$('input[name=mentionIssues][value=' + localStorage.mentionIssues + ']').prop('checked', true);
	$('input[name=selectIssueNumberOnClick][value=' + localStorage.selectIssueNumberOnClick + ']').prop('checked', true);

	$('#searchfieldJumpToIssue').prop('checked', (1 == localStorage.searchfieldJumpToIssue) );
	$('#searchfieldJumpToProject').prop('checked', (1 == localStorage.searchfieldJumpToProject) );
});