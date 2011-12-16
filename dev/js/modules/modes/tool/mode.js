/*
 * The ... mode allow to ... on the canvas
 */
define(['sandbox'], function (sandbox) {
	
	/*
	 * Mode to register
	 */
	var nameMode = {
		start: function () {
			//what to do to start the mode
		},
	
		stop: function () {
			//what to do to stop the mode
		}
	};
	
	
	return {
		init: function () {
			sandbox.publish('dizzy.modes.register', {
				name: 'name-to-identify-tool-registered',
				instance: nameMode
			});
		},
		
		destroy: function () {}
	};
	
});
