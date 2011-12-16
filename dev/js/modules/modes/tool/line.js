/*
 * The line mode allow to create lines on the canvas
 */
define(['sandbox'], function (sandbox) {
	
	var canvas;
	
	/*
	 * Mode to register
	 */
	var lineMode = {
		depends: ['zoom'],
		
		start: function () {
			if(canvas){
			
			
			
			}
		},
	
		stop: function () {
			if(canvas){
			
			
			
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
        $(this.dizzy.svg.root()).bind('mousemove.dizzy.editor.line', function(e){ return that.editorLineDrag(e); });
         
        var group = $(this.dizzy.svg.other($('#canvas'), 'g'));
        group.attr('class','group');
        var matrix = this.dizzy.getTransformationMatrix(this.dizzy.canvas).inverse();

        group.attr( 'transform', this.dizzy.transformationMatrixToString(matrix) );
         

        this.line = this.dizzy.svg.line(group, ev.pageX, ev.pageY, ev.pageX, ev.pageY, {stroke: this.dizzy.color.stroke, fill : this.dizzy.color.fill, strokeWidth : 5});
        return false;
    }
    
    function editorLineDrag(evt) {
		evt.stopPropagation();
		evt.preventDefault();
         
        this.line.setAttribute('y2', evt.pageY);
        this.line.setAttribute('x2', evt.pageX);
         
        return false;
    }
    
    function editorLineEnd(ev) {
        $(this.dizzy.svg.root()).unbind('mousemove.dizzy.editor.line');
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
