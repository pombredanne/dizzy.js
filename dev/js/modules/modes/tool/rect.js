/*
 * The rect mode allow to create rectangles on the canvas
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
				$(canvas.svg.root()).bind('mousedown.dizzy.mode.line', function(e){ return editorLineStart(e); });
				$(canvas.svg.root()).bind('mouseup.dizzy.mode.line mouseleave.dizzy.mode.line', function(e){ return editorLineEnd(e); });
				$(canvas.svg.root()).addClass('editing drawing');
			}
		},
	
		stop: function () {
			$(canvas.svg.root()).unbind('mousedown.dizzy.mode.line');
			$(canvas.svg.root()).unbind('mouseup.dizzy.mode.line mouseleave.dizzy.mode.line');
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
		
        $(canvas.svg.root()).bind('mousemove.dizzy.mode.line', function(e){ return editorLineDrag(e); });
        
        var svgOffset = canvas.toViewboxCoordinates({
            x: ev.pageX,
            y: ev.pageY
        });
        
        var newGroup = canvas.createGroup();
        var newGroupDom = newGroup.dom();
        
        var color = canvas.getStrokeColor();
        
        // !!! Set color and opacity management
        line = $(canvas.svg.rect(svgOffset.x, svgOffset.y, 0, 0, {stroke: canvas.getStrokeColor(), fill: canvas.getFillColor() , strokeWidth : 3, fillOpacity:0}));
        x=svgOffset.x;
        y=svgOffset.y;
        
        newGroupDom.append(line);
        
        sandbox.publish('dizzy.canvas.group.created.rect', {
		  group: newGroup
		});
    }
    
    function editorLineDrag(evt) {
		evt.stopPropagation();
		evt.preventDefault();
		
        var svgOffset = canvas.toViewboxCoordinates({
			x: evt.pageX,
			y: evt.pageY
		});
		
		var w = Math.abs(svgOffset.x-x);
		var h = Math.abs(svgOffset.y-y);
        
        /* If it grows to the left */
        if(svgOffset.x-x<0)
			line.attr({
				x: x-w
			});
			
		line.attr({
			width: w
		});
		
		/* If it grows upwards */
		if(svgOffset.y-y<0)
			line.attr({
				y: y-h
			});
		line.attr({
			height: h
		});
		
    }
    
    function editorLineEnd(ev) {
        $(canvas.svg.root()).unbind('mousemove.dizzy.mode.line');
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
