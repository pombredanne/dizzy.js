/*
 * The capture-view mode allow to create a frame that wraps the current user view
 */
define(['sandbox'], function (sandbox) {
	
	var canvas;
	var line;
	var x, y;
	
	/*
	 * Mode to register
	 */
	var lineMode = {
		depends: ['zoom'],
		
		start: function () {
			if(canvas){
				captureView();
				sandbox.publish('dizzy.ui.toolbar.clicked.mode.tool-default', {button: 'tool-default'});
			}
		},
	
		stop: function () {
		}
	};
	
	sandbox.subscribe('dizzy.presentation.loaded', function (c) {
      canvas = c.canvas;
    });
	
	function captureView() {
        var newGroup = canvas.createGroup();
        var newGroupDom = newGroup.dom();
        
		newGroupDom.prependTo(newGroupDom.parent());
		
		var docW = $(document).width();
		var docH = $(document).height();
		
		var svgWidth = $(document).width();
		var svgHeight = $(document).height();			
		var viewBox = $('svg').attr('viewBox');
		var viewBoxParams = viewBox.split(" ", 4);
		var viewWidth = viewBoxParams[2];
		var viewHeight = viewBoxParams[3];
		
		var wpixels, hpixels;
		var ratio = svgWidth/svgHeight;
		if(ratio >= 4/3) {
			hpixels = viewHeight;
			wpixels = (viewHeight/svgHeight)*svgWidth;
		} else {
			wpixels = viewWidth;
			hpixels = (viewWidth/svgWidth)*svgHeight;
		}
        
        line = $(canvas.svg.rect('0', '0', wpixels, hpixels, {strokeWidth : 3, stroke: 'black', 'fill-opacity': 0, 'stroke-opacity':0}));
        line.addClass("invisibleRect");
        
        newGroupDom.append(line);
        newGroupDom.prependTo(newGroupDom.parent());
        
        sandbox.publish('dizzy.canvas.group.created.invrect', {
		  group: newGroup
		});
    }

	return {
		init: function () {
			sandbox.publish('dizzy.modes.register', {
				name: 'tool-captview',
				instance: lineMode
			});
		},
		
		destroy: function () {}
	};
	
});
