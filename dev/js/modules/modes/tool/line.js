/*
 * The line mode allow to create lines on the canvas
 */
define(['sandbox'], function (sandbox) {
	
	var canvas;
	var line;
	
	/*
	 * Mode to register
	 */
	var lineMode = {
		depends: ['zoom'],
		
		start: function () {
			if(canvas){
				$(canvas.svg.root()).bind('mousedown.dizzy.mode.line', function(e){ return editorLineStart(e); });
				$(canvas.svg.root()).bind('mouseup.dizzy.mode.line', function(e){ return editorLineEnd(e); });
				$(canvas.svg.root()).addClass('editing drawing');
			}
		},
	
		stop: function () {
			$(canvas.svg.root()).unbind('mousedown.dizzy.mode.line');
			$(canvas.svg.root()).unbind('mouseup.dizzy.mode.line');
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
        
        newGroupDom.attr('name','cacca');
        
        var color = canvas.getStrokeColor();
        
        // !!! Set color management
        line = $(canvas.svg.line(svgOffset.x, svgOffset.y, svgOffset.x, svgOffset.y, {stroke: canvas.getStrokeColor(), strokeWidth : 3}));
        
        newGroupDom.append(line);
        
        sandbox.publish('dizzy.canvas.group.created.line', {
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
        
        line.attr({
			y2: svgOffset.y,
			x2: svgOffset.x
		});
    }
    
    function editorLineEnd(ev) {
        $(canvas.svg.root()).unbind('mousemove.dizzy.mode.line');
    }
	
	return {
		init: function () {
			sandbox.publish('dizzy.modes.register', {
				name: 'tool-line',
				instance: lineMode
			});
		},
		
		destroy: function () {}
	};
	
});
