/*
 * The big-rectangle mode allow to create rectangle big as the $(document)
 * It's not a good way to implement full width presentation,
 * because resizing window or changing monitor will break it all
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
				$(canvas.svg.root()).bind('click.dizzy.mode.line', function(e){ return editorLineStart(e); });
				$(canvas.svg.root()).addClass('editing drawing');
			}
		},
	
		stop: function () {
			$(canvas.svg.root()).unbind('click.dizzy.mode.line');
			$(canvas.svg.root()).removeClass('editing drawing');
		}
	};
	
	sandbox.subscribe('dizzy.presentation.loaded', function (c) {
      canvas = c.canvas;
    });
	
	function editorLineStart(ev) {
        var that = this;
        ev.stopPropagation();
		ev.preventDefault();
		
        var newGroup = canvas.createGroup();
        var newGroupDom = newGroup.dom();
        
        var svgOffset = canvas.toViewboxCoordinates({
			x: ev.pageX,
			y: ev.pageY
		});
		
		var docW = $(document).width();
		var docH = $(document).height();
		
		
        
        line = $(canvas.svg.rect(svgOffset.x-docW/2, svgOffset.y-docH/2, docW, docH, {stroke: canvas.getStrokeColor(), fill: canvas.getFillColor() , strokeWidth : 10}));
        
        newGroupDom.append(line);
    }

	return {
		init: function () {
			sandbox.publish('dizzy.modes.register', {
				name: 'tool-rect',
				instance: lineMode
			});
		},
		
		destroy: function () {}
	};
	
});
