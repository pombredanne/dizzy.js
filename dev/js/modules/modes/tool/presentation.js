/*
 * The Presentation mode
 */
 
define(['sandbox'], function (sandbox) {
	
	var canvas;
	var mMove;
	
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
			
			//make toolbar and tracker invisible while presenting
			$('#toolbar, #tracker').addClass('invisible');			
			$(document).bind('mousemove.dizzy.presentation', function(){
				if (mMove) clearTimeout(mMove);
				$('#toolbar, #tracker').removeClass('invisible');
				mMove = setTimeout(function(){$('#toolbar, #tracker').addClass('invisible');}, 1000);
			});
			
			// right click does nothing
			$(document).bind('contextmenu', function (e) {
				e.preventDefault();
				e.stopPropagation();
				return false;
			});
		},
	
		stop: function () {
			if (mMove) clearTimeout(mMove);
			$(document).unbind('keydown.dizzy.presentation');
			$(document).unbind('mousemove.dizzy.presentation');
			$(document).unbind('contextmenu');
		}
	};
	
	sandbox.subscribe('dizzy.presentation.loaded', function (c) {
		canvas = c.canvas;
	});
	
	function checkMouseMove(){
      if( mouseMoved === true ){
         mouseMoved = false;
         $('#toolbar').removeClass('invisible');
      }else{
         $('#toolbar').addClass('invisible');
      }
      mouseMovedTimeout = setTimeout( checkMouseMove, mouseInterval );
   }
	
	
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
