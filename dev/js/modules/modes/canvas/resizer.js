define(['sandbox'], function (sandbox) {
	
	var canvas;
	var dot;
	var svg;
	var pt;
	var dotDiv;
	
	var resizerMode = {
		start: function(){
			$(dotDiv).bind('mousedown.dizzy.resizer', function(e){ resizeStart(e); });
		},
		
		stop: function(){
			$(dotDiv).unbind('mousedown.dizzy.resizer');
			$(document).unbind('mouseup.dizzy.resizer mouseleave.dizzy.resizer');
		}
	};
	sandbox.subscribe('dizzy.ui.zebra.start', hideResizer);
	/*
	sandbox.subscribe('dizzy.ui.zebra.stop', function(){
		var rect = document.getElementsByClassName('selected')[0].children[0];
		if(rect && rect.localName == 'rect'){
			moveResizerToRect(rect);
			showResizer();
		}
	});*/
	
	sandbox.subscribe('dizzy.presentation.transform', hideResizer);
	
	function hideResizer(){
		if (dotDiv) {
			$(dotDiv).hide();
		}
	}
	
	function showResizer(){
		if (dotDiv) {
			$(dotDiv).show();
		}
	}

	var resizeStart = function(e){
		e.stopPropagation(); e.preventDefault();
		var rect = document.getElementsByClassName('selected')[0].children[0];

		var mouseStart = { x:e.pageX, y:e.pageY };
		
		$(document).bind('mousemove.dizzy.resizer', function(ev){
			ev.preventDefault();

			var current = { x:ev.pageX, y:ev.pageY };
			var xchange = parseFloat(current.x - mouseStart.x);
			var ychange = parseFloat(current.y - mouseStart.y);
			
			var rectXY = dotFromScreenToRect(rect,current.x,current.y);
			
			var w = Math.max( rectXY.x-rect.x.animVal.value, 1 );
			var h = Math.max( rectXY.y-rect.y.animVal.value, 1 );
			if(rect.localName != 'image'){
				rect.setAttribute('width', w);
				rect.setAttribute('height',h);
			} else {
				rect.setAttribute('width', w);
				rect.setAttribute('height',h);
			}
			moveResizerToRect(rect);
		});
		
		$(document).bind('mouseup.dizzy.resizer mouseleave.dizzy.resizer', function (e) {
			$(document).unbind('mousemove.dizzy.resizer');
		});
	};
	
	sandbox.subscribe('dizzy.presentation.loaded', function (c) {
		canvas = c.canvas;
		svg = document.getElementsByTagName('svg')[0];
		pt  = svg.createSVGPoint();
	});
	
	sandbox.subscribe('dizzy.presentation.group.selected', function (d) {
		var event = d.event;
		selectedGroup = d.group;
		
		var $rect = selectedGroup.dom().children().first();
		$rect.addClass('tempClassRect');
		var rect = document.getElementsByClassName('tempClassRect')[0];
		$rect.removeClass('tempClassRect');
		
		if (rect.localName == 'rect'){		
			moveResizerToRect(rect);
			showResizer();
		} else hideResizer();
	});
	
	/* Gets the screen coord for the south-east corner of the 'rect' */
	var screenCoordsForRect = function(rect){
		var dotCoord;
		var matrix  = rect.getScreenCTM();
		pt.x = rect.x.animVal.value;
		pt.y = rect.y.animVal.value;
		pt.x += rect.width.animVal.value;
		pt.y += rect.height.animVal.value;
		dotCoord = pt.matrixTransform(matrix);
		
		return dotCoord;
	};
	
	/* Gets the transformed-rect coord from a point of the screen */
	var dotFromScreenToRect = function(rect, x, y){
		var matrix = rect.getScreenCTM();
		pt.x = x;
		pt.y = y;
		
		return pt.matrixTransform(matrix.inverse());
	};
	
	/* Move the resizer to the south-east corner of the 'rect' */ 
	var moveResizerToRect = function(rect){
		var dotCoord = screenCoordsForRect(rect);
		dotDiv.style.left = dotCoord.x-20+'px';
		dotDiv.style.top = dotCoord.y-20+'px';
	};
	
	return {
		
		init: function () {
			var body = $('#container');
			dot = $('<div id="resizer"></div>');
			body.prepend(dot);
			dotDiv = document.getElementById('resizer');
			hideResizer();
			
			sandbox.publish('dizzy.modes.register', {
			  name: 'resizer',
			  instance: resizerMode
			});
		},
		destroy: function () {}
	};
  
});
