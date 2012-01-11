/*
 * The Presentation mode
 */
 
define(['sandbox'], function (sandbox) {
	
	var canvas;
	
	/*
	 * Mode to register
	 */
	var presentMode = {
		depends: ['zoom', 'pan'],
		start: function () {
			$(document).bind('keydown.dizzy.presentation', function (e) {
				var keycode =  e.keyCode ? e.keyCode : e.which;
				if (keycode == 39 || keycode == 38) sandbox.publish('dizzy.ui.toolbar.clicked.tool-next');
				else if (keycode == 37 || keycode == 40) sandbox.publish('dizzy.ui.toolbar.clicked.tool-previous');
			});
			
			$(canvas.svg.root()).removeClass('editing');
			//buttons are binded in toolbar.control
			
			canvas.activeGroupNumber=0;
		},
	
		stop: function () {
			$(document).unbind('keydown.dizzy.presentation');
		}
	};
	
	sandbox.subscribe('dizzy.presentation.loaded', function (c) {
		canvas = c.canvas;
	});
	
	
	return {
		init: function () {
			sandbox.publish('dizzy.modes.register', {
				name: 'present-toggle-button',
				instance: presentMode
			});
		},
		
		destroy: function () {}
	};
	
});
