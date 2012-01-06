/*
 * The circle mode allow to draw circles on the canvas
 */
define(['sandbox'], function (sandbox) {
	
	var canvas;
	var ellipse;
	var cx, cy;
	
	sandbox.subscribe('dizzy.presentation.loaded', function (c) {
      canvas = c.canvas;
    });
	
	/*
	 * Mode to register
	 */
	var ellipseMode = {
		depends: ['zoom'],
		start: function () {
			if(canvas){
				$(canvas.svg.root()).bind('mousedown.dizzy.mode.ellipse', function(e){ return editorStart(e); });
				$(canvas.svg.root()).bind('mouseup.dizzy.mode.ellipse', function(e){ return editorEnd(e); });
				$(canvas.svg.root()).addClass('editing drawing');
			}
		},
	
		stop: function () {
			$(canvas.svg.root()).unbind('mousedown.dizzy.mode.ellipse');
			$(canvas.svg.root()).unbind('mouseup.dizzy.mode.ellipse');
			$(canvas.svg.root()).removeClass('editing drawing');
		}
	};
	
	function editorStart(ev) {
        var that = this;
        ev.stopPropagation();
		ev.preventDefault();
		
        $(canvas.svg.root()).bind('mousemove.dizzy.mode.ellipse', function(e){ return editorDrag(e); });
        
        var svgOffset = canvas.toViewboxCoordinates({
            x: ev.pageX,
            y: ev.pageY
        });
        
        var newGroup = canvas.createGroup();
        var newGroupDom = newGroup.dom();
        
        // !!! Set color and opacity management
        ellipse = $(canvas.svg.ellipse(svgOffset.x, svgOffset.y, 0, 0, {stroke: canvas.getStrokeColor(), fill: canvas.getFillColor() , strokeWidth : 3, fillOpacity:0}));
        cx=svgOffset.x;
        cy=svgOffset.y;
        
        newGroupDom.append(ellipse);
        
        sandbox.publish('dizzy.canvas.group.created.ellipse', {
		  group: newGroup
		});
    }
    
    function editorDrag(evt) {
		evt.stopPropagation();
		evt.preventDefault();
		
        var svgOffset = canvas.toViewboxCoordinates({
			x: evt.pageX,
			y: evt.pageY
		});
		
		var w = Math.abs(svgOffset.x-cx);
		var h = Math.abs(svgOffset.y-cy);
		
		ellipse.attr({
			rx: w,
			ry: h
		});
		
    }
    
    function editorEnd(ev) {
        $(canvas.svg.root()).unbind('mousemove.dizzy.mode.ellipse');
    }
	
	
	return {
		init: function () {
			sandbox.publish('dizzy.modes.register', {
				name: 'tool-circle',
				instance: ellipseMode
			});
		},
		
		destroy: function () {}
	};
	
});
