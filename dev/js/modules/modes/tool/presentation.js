/*
 * The Presentation mode
 */
 
define(['sandbox'], function (sandbox) {
	
	var cancas;
	
	/*
	 * Mode to register
	 */
	var presentMode = {
		depends: ['zoom', 'pan'],
		start: function () {
			$(canvas.svg.root()).removeClass('editing');
			//buttons are binded in toolbar.control
		},
	
		stop: function () {
			
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
