/*
 * The rightClick mode allows to switch to the default mode just clicking the right mouse button
 */
define(['sandbox'], function (sandbox) {
	
	/*
	 * Mode to register
	 */
	var rightMode = {
		start: function () {
			$(document).bind('contextmenu', function (e) {
				e.preventDefault();
				e.stopPropagation();
				sandbox.publish('dizzy.ui.toolbar.clicked.mode.tool-default', {button: 'tool-default'});
			});
		},
	
		stop: function () {
			$(document).unbind('contextmenu');
		}
	};
	
	
	return {
		init: function () {
			sandbox.publish('dizzy.modes.register', {
				name: 'rightClick',
				instance: rightMode
			});
		},
		
		destroy: function () {}
	};
	
});
