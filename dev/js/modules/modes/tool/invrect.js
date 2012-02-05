/*
 * The line mode allow to create lines on the canvas
 */
define(['sandbox'], function (sandbox) {
	
	var canvas;
	var line;
	var x, y;
	
	/*
	 * Mode to register
	 */
	var lineMode = {
		depends: ['zoom', 'rightClick'],
		
		start: function () {
			if(canvas){
				$(canvas.svg.root()).bind('mousedown.dizzy.mode.line', function(e){ return editorLineStart(e); });
				$(canvas.svg.root()).bind('mouseup.dizzy.mode.line', function(e){ return editorLineEnd(e); });
				$(canvas.svg.root()).addClass('editing drawing');
			}
		},
	
		stop: function () {
			if(canvas){
				$(canvas.svg.root()).unbind('mousedown.dizzy.mode.line');
				$(canvas.svg.root()).unbind('mouseup.dizzy.mode.line');
				$(canvas.svg.root()).removeClass('editing drawing');
			}
		}
	};
	
	sandbox.subscribe('dizzy.presentation.loaded', function (c) {
      canvas = c.canvas;
    });
	
	function editorLineStart(ev) {
        var that = this;
        ev.stopPropagation();
		ev.preventDefault();
		if(ev.which != 1) return false; // if right or middle click do nothing
        $(canvas.svg.root()).bind('mousemove.dizzy.mode.line', function(e){ return editorLineDrag(e); });
        
        var svgOffset = canvas.toViewboxCoordinates({
            x: ev.pageX,
            y: ev.pageY
        });
        
        var newGroup = canvas.createGroup();
        var newGroupDom = newGroup.dom();
        
        var color = canvas.getStrokeColor();
        
        line = $(canvas.svg.rect(svgOffset.x, svgOffset.y, 0, 0, {width: 20, height: 20, strokeWidth : 3, stroke: 'black', 'fill-opacity': 0, 'stroke-opacity':0}));
        line.addClass("invisibleRect");
        x=svgOffset.x;
        y=svgOffset.y;
        
        newGroupDom.append(line);
        
        sandbox.publish('dizzy.canvas.group.created.invrect', {
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
		
		var w = Math.max(20, Math.abs(svgOffset.x-x));
		var h = Math.max(20, Math.abs(svgOffset.y-y));
        
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
				name: 'tool-invrect',
				instance: lineMode
			});
		},
		
		destroy: function () {}
	};
	
});
