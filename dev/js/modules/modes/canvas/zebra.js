/*
 *  Opens a zebra on click on a group and binds event handlers to the zebra control.
 */
define(['sandbox'], function (sandbox) {
  var zebraNode;
  var canvas;

  var zebraMode = {

    start: function () {
      this.assignEventHandlers();
    },

/*
		<div id="zebra">
			<div id="zebra-rotate">
				<div id="zebra-scale">
					<div id="zebra-translate"></div>
				</div>
			</div>
   
			<div id="zebra-expand-button">&rsaquo;</div>
			<div id="zebra-toolbar" class="hidden">
				<div class="zebra-toolbar-row">
					<div class="toolbutton" id="zebra-toolbar-up" title="Raise group one level"><img src="./img/zebra_tool_up.png" alt="arrow up icon" /></div>
					<div class="toolbutton" id="zebra-toolbar-down" title="Lower group one level"><img src="./img/zebra_tool_down.png" alt="arrow down icon" /></div>
				</div>
			</div>
		</div>
*/
    assignEventHandlers: function () {
      var that = this;
      
      if (canvas) {
		  
		zebraNode.children('div').not('div input').disableTextSelect();
		
        var groupTranslate = function (node, e) {
            return that.translateStart(node, e);
          };
        var groups = jQuery(canvas.svg.root()).delegate('g.group', 'mousedown.dizzy.zebra.scale', function (e) {
          return groupTranslate(this, e);
        });
		var rotate = zebraNode.find('#zebra-rotate');
        rotate.bind('mousedown.dizzy.zebra.rotate', function (e) {
          return that.rotateStart(rotate, e);
        });
        var scale = zebraNode.find('#zebra-scale');
        scale.bind('mousedown.dizzy.zebra.scale', function (e) {
          return that.scaleStart(scale, e);
        });
        zebraNode.find('#zebra-translate').bind('mousedown.dizzy.zebra.translate', function (e) {
          return groupTranslate(selectedGroup.dom(), e);
        });
        
        /* Bind the expand-menu-button to open the zebra-menu */
        zebraNode.find("#zebra-expand-button").bind('click.dizzy.zebra.expand', function() {
			$('#zebra-toolbar').toggleClass('hidden');
			$(this).toggleClass('mirrored');
		});
		
		/* Levels management */
		zebraNode.find('#zebra-toolbar-up').bind('click.dizzy.zebra.toolbar.up', that.raiseLayer);
		zebraNode.find('#zebra-toolbar-down').bind('click.dizzy.zebra.toolbar.down', that.lowerLayer);
		zebraNode.find('#zebra-toolbar-downest').bind('click.dizzy.zebra.toolbar.downest', that.lowerLayerMax);
		zebraNode.find('#zebra-toolbar-uppest').bind('click.dizzy.zebra.toolbar.uppest', that.raiseLayerMax);
		
		/* Border weight management */
		zebraNode.find('#zebra-toolbar-border-weight-up').bind('click.dizzy.zebra.toolbar.strokeWidth.up', that.raiseStrokeWidth);
		zebraNode.find('#zebra-toolbar-border-weight-down').bind('click.dizzy.zebra.toolbar.strokeWidth.down', that.lowerStrokeWidth);
		
		/* Rect proportions management */
		zebraNode.find('#zebra-toolbar-43').bind('click.dizzy.zebra.toolbar.43', function(){
				return that.fitRectTo(4,3);
		});
		zebraNode.find('#zebra-toolbar-169').bind('click.dizzy.zebra.toolbar.169', function(){
				return that.fitRectTo(16,9);
		});
		zebraNode.find('#zebra-toolbar-1610').bind('click.dizzy.zebra.toolbar.1610', function(){
				return that.fitRectTo(16,10);
		});
		
		/* Fill opacity management */
		zebraNode.find('#zebra-toolbar-fill').bind('click.dizzy.zebra.toolbar.fill', function(){
				return that.raiseFillOpacity(0.2);
		});
		zebraNode.find('#zebra-toolbar-nofill').bind('click.dizzy.zebra.toolbar.nofill', function(){
				return that.raiseFillOpacity(-0.2);
		});
		
		/* Round corners */
		zebraNode.find('#zebra-toolbar-border-round').bind('click.dizzy.zebra.toolbar.round', that.roundCorners);
      }
    },

    removeEventHandlers: function () {
      var that = this;
      if (canvas) {
        var groups = jQuery(canvas.svg.root()).undelegate('g.group', 'mousedown.dizzy.zebra.scale');
      }
      zebraNode.find('#zebra-rotate').unbind('mousedown.dizzy.zebra.rotate');
      zebraNode.find('#zebra-scale').unbind('mousedown.dizzy.zebra.scale');
      zebraNode.find('#zebra-translate').unbind('mousedown.dizzy.zebra.translate');
      zebraNode.find("#zebra-expand-button").unbind('click.dizzy.zebra.expand');
      zebraNode.find('#zebra-toolbar-up').unbind('click.dizzy.zebra.toolbar.up');
      zebraNode.find('#zebra-toolbar-down').unbind('click.dizzy.zebra.toolbar.down');
      zebraNode.find('#zebra-toolbar-uppest').unbind('click.dizzy.zebra.toolbar.uppest');
      zebraNode.find('#zebra-toolbar-downest').unbind('click.dizzy.zebra.toolbar.downest');
      zebraNode.find('#zebra-toolbar-border-weight-up').unbind('click.dizzy.zebra.toolbar.strokeWidth.up');
      zebraNode.find('#zebra-toolbar-border-weight-down').unbind('click.dizzy.zebra.toolbar.strokeWidth.down');
      zebraNode.find('#zebra-toolbar-43').unbind('click.dizzy.zebra.toolbar.43');
      zebraNode.find('#zebra-toolbar-169').unbind('click.dizzy.zebra.toolbar.169');
      zebraNode.find('#zebra-toolbar-1610').unbind('click.dizzy.zebra.toolbar.1610');
      zebraNode.find('#zebra-toolbar-fill').unbind('click.dizzy.zebra.toolbar.fill');
      zebraNode.find('#zebra-toolbar-nofill').unbind('click.dizzy.zebra.toolbar.nofill');
      zebraNode.find('#zebra-toolbar-border-round').unbind('click.dizzy.zebra.toolbar.round');
    },

    /*
     * Rotate clicked on zebra
     */
    rotateStart: function (r, e) {
      e.preventDefault();
      if (selectedGroup !== undefined) {
		/* .offset() (JQuery): Get the current coordinates of the first element in the set of matched elements, relative to the document */
        var zebraOffset = zebraNode.offset();

        var zebraOrigin = {
          x: zebraOffset.left + zebraNode.outerWidth() / 2,
          y: zebraOffset.top + zebraNode.outerHeight() / 2
        };
        var clickedVector = {
          x: e.pageX - zebraOrigin.x,
          y: e.pageY - zebraOrigin.y
        };

        var info = {
          origin: zebraOrigin,
          lastVector: clickedVector
        };
        // sum of all rotations in one go. SVG transform does not need this, but CSS transform does.
        var rotationAngleSum = info.lastRotationAngle;

        var nodeTransform = selectedGroup.transformation();

        $(document).bind('mousemove.dizzy.zebra.rotate', function (e) {
          e.preventDefault();
          // vector from center of rotate circle to clicked point
          var newVector = {
            x: e.pageX - info.origin.x,
            y: e.pageY - info.origin.y
          };
          // get rotation angle since last mousemove
          var angle = 180 / Math.PI * (Math.atan2(newVector.y, newVector.x) - Math.atan2(info.lastVector.y, info.lastVector.x));

          // quantify, so this does only a certain number of degrees..
          angle = Math.floor(angle * 360) / 360;

          info.lastVector = newVector;


          // rotate around
          //var svgOffset =  canvas.vectorTranslate( info.origin, {ignoreCanvas:false, inverseMatrix: false} ); // { x : canvas.WIDTH/2, y : canvas.HEIGHT/2 }; // 
          var svgOffset = canvas.toCanvasCoordinates(info.origin); // { x : canvas.WIDTH/2, y : canvas.HEIGHT/2 }; // 
          var matrix = nodeTransform.matrix();

          nodeTransform = nodeTransform.multiply(matrix.inverse()).rotate(angle, svgOffset.x, svgOffset.y).multiply(matrix);

          rotationAngleSum = (angle + rotationAngleSum) % 360;

          var vendorprefixes = ['', '-o-', '-webkit-', '-moz-', '-ms-'];
          for (var i = 0; i < vendorprefixes.length; ++i) {
            r.css(vendorprefixes[i] + 'transform', 'rotate(' + rotationAngleSum + 'deg)');
          }
          canvas.transform(selectedGroup, nodeTransform, {
            duration: 0
          });
          sandbox.publish('dizzy.ui.zebra.start.rotate');
        });
        $(document).bind('mouseup.dizzy.zebra.rotate mouseleave.dizzy.zebra.rotate', function (e) {
          $(document).unbind('mousemove.dizzy.zebra.rotate');
          //$(document).unbind('mouseup.dizzy.zebra.rotate mouseleave.dizzy.zebra.rotate');
          //sandbox.publish('dizzy.ui.zebra.stop.rotate');
        });

      }
      return false;
    },

    /*
     * Scale clicked on zebra
     */
    scaleStart: function (s, e) {
      e.preventDefault();
      e.stopPropagation();
      if (selectedGroup !== undefined) {
        var zebraOffset = zebraNode.offset();
        var info = {
          origin: {
            x: zebraOffset.left + zebraNode.outerWidth() / 2,
            y: zebraOffset.top + zebraNode.outerHeight() / 2
          }
        };
        var nodeTransform = selectedGroup.transformation();
        var firstVector = {
          x: info.origin.x - e.pageX,
          y: info.origin.y - e.pageY
        };
        var firstVectorLength = Math.sqrt(firstVector.x * firstVector.x + firstVector.y * firstVector.y);
        var lastVectorLength = 1;
        $(document).bind('mousemove.dizzy.zebra.scale', function (e) {
          e.preventDefault();
          var cVector = {
            x: info.origin.x - e.pageX,
            y: info.origin.y - e.pageY
          };
          var cVectorLength = Math.sqrt(cVector.x * cVector.x + cVector.y * cVector.y) / firstVectorLength; // 
          var scaleFactor = (cVectorLength - lastVectorLength);

          lastVectorLength = cVectorLength;
          //var svgOffset =  canvas.vectorTranslate( info.origin, {ignoreCanvas:false, inverseMatrix: false} );
          var svgOffset = canvas.toCanvasCoordinates(info.origin);

          var matrix = nodeTransform.matrix();

          nodeTransform = nodeTransform.multiply(matrix.inverse())
          // translation is used to scale group around center
          .translate(-svgOffset.x * (scaleFactor), -svgOffset.y * (scaleFactor)).scale(scaleFactor + 1).multiply(matrix);
          
          
          
          //this should be removed if scale and rotate are started by the same div
          canvas.transform( selectedGroup, nodeTransform, { duration : 0 } );
          sandbox.publish('dizzy.ui.zebra.start.scale');
        });
        $(document).bind('mouseup.dizzy.zebra.scale mouseleave.dizzy.zebra.scale', function (e) {
          $(document).unbind('mousemove.dizzy.zebra.scale');
          $(document).unbind('mouseup.dizzy.zebra.scale mouseleave.dizzy.zebra.scale');
          //sandbox.publish('dizzy.ui.zebra.stop.scale');
        });
      }
      return false;
    },

    /*
     * Group clicked (or.. "mousedowned").
     * Enables dragging the group.
     */
    translateStart: function (node, e) {
      if (node.jquery && node.size() > 0) { // jquery node passed
        node = node[0];
      }
      e.preventDefault();
      
      var group = canvas.findGroup(node);
      sandbox.publish('dizzy.presentation.group.selected', {
        event: e,
        group: group
      });
      var translate = function (o) {
          return canvas.vectorTranslate(o, {
            ignoreCanvas: false,
            targetNode: node
          });
        };
      var lastPosition = {
        x: e.pageX,
        y: e.pageY
      };
      lastPosition = translate(lastPosition);
      var nodeTransform = group.transformation();
      
      $(document).bind('mousemove.dizzy.zebra.translate', function (e) {
        e.preventDefault();
        var eventVector = {
          x: e.pageX,
          y: e.pageY
        };
        eventVector = translate(eventVector);
        var xtransl = eventVector.x - lastPosition.x;
        var ytransl = eventVector.y - lastPosition.y;
        nodeTransform = nodeTransform.translate(xtransl, ytransl);
        
        //lastPosition = eventVector;
        canvas.transform(group, nodeTransform, {
          duration: 0
        });
        zebraNode.css({
          top: e.pageY - zebraNode.height() / 2,
          left: e.pageX - zebraNode.width() / 2
        });
        sandbox.publish('dizzy.ui.zebra.start.translate');
      });
      $(document).bind('mouseup.dizzy.zebra.translate mouseleave.dizzy.zebra.translate', function (e) {
        $(document).unbind('mousemove.dizzy.zebra.translate');
        $(document).unbind('mouseup.dizzy.zebra.translate mouseleave.dizzy.zebra.translate');
        //sandbox.publish('dizzy.ui.zebra.stop.translate');
      });
      return false;
    },
    
    stop: function () {
      this.removeEventHandlers();
      zebraNode.hide();
    },
    
    lowerLayer : function(){
      var node = $('.selected', canvas.svg.root());
      if( !node.hasClass('group') ){
         node = node.parents('g.group').first();
      }
      node.insertBefore(node.prev('g.group'));
    },
      
    raiseLayer : function(){
      var node = $('.selected', canvas.svg.root());
      if( !node.hasClass('group') ){
         node = node.parents('g.group').first();
      }
      node.insertAfter(node.next('g.group'));
    },
    
    lowerLayerMax: function(){
		var node = $('.selected', canvas.svg.root());
		if(!node.hasClass('group')){
		 node = node.parents('g.group').first();
		}
		node.prependTo('#canvas');
	},
	
	raiseLayerMax: function(){
		var node = $('.selected', canvas.svg.root());
		if( !node.hasClass('group') ){
		 node = node.parents('g.group').first();
		}
		node.appendTo('#canvas');
    },
    
    //TODO: use a function to raise the width proportionally to the current size (eg. if it's 15 should grow by 3)
    lowerStrokeWidth: function(){
		var node = $('.selected', canvas.svg.root());
		//if( !node.hasClass('group') ) node = node.parents('g.group').first();
		
		$children = node.children();
		if ($children.length == 1) node = $children.first();
		var wid = node.attr('stroke-width');
		if (isNaN(wid)){ sw = 3; }
		else { var sw = parseFloat(wid); }
		if(sw > 0)
			if (sw > 1) node.attr('stroke-width', sw-2);
			else node.attr('stroke-width', Math.round((sw*10)-1)/10);
	},
	
	raiseStrokeWidth: function(){
		var node = $('.selected', canvas.svg.root());
		//if( !node.hasClass('group') ) node = node.parents('g.group').first();
		
		$children = node.children();
		if ($children.length == 1) node = $children.first();
		var wid = node.attr('stroke-width');
		if (isNaN(wid)){ sw = 3; }
		else { var sw = parseFloat(wid); }
		if(sw >= 1)  node.attr('stroke-width', sw+2);
		else node.attr('stroke-width', Math.round((sw*10)+1)/10);
	},
	
	/* Change proportions of the rect to fit the specified ones (eg. 4:3, 16:9) */
	fitRectTo: function(width, height){
		var node = $('.selected', canvas.svg.root());
		$children = node.children();
		if ($children.length == 1) node = $children.first();
		
		var w1 = node.attr('width');
		var h1 = node.attr('height');
		
		var prop = w1/h1;
		var desProp = width/height;
		
		if(prop > desProp){
			var h2 = w1/width*height;
			node.attr('height', h2);
			var y = node.attr('y');
			node.attr('y', y-(h2-h1)/2);
		}
		else if(prop < desProp){
			var w2 = h1/height*width;
			node.attr('width', w2);
			var x = node.attr('x');
			node.attr('x', x-(w2-w1)/2);
		}
	},
	
	raiseFillOpacity: function(val){
		var node = $('.selected', canvas.svg.root());
		$children = node.children();
		if ($children.length == 1) node = $children.first();
		
		var fillOpacity = parseFloat(node.attr('fill-opacity'));
		//console.log(fillOpacity);
		if (isNaN(fillOpacity)) fillOpacity = 1;
		fillOpacity += val;
		if (fillOpacity < 0) fillOpacity = 0;
		else if (fillOpacity > 1) fillOpacity = 1;
		//console.log(fillOpacity);
		node.attr('fill-opacity', Math.round((fillOpacity*10))/10);
	},
    
    /* Round rect corners */
    roundCorners: function(){
		var node = $('.selected', canvas.svg.root());
		$children = node.children();
		if ($children.length == 1) node = $children.first();
		var rxv = node.attr('rx');
		var rxv1 = Math.round(Math.min(node.attr('width'), node.attr('height'))/10);
		
		if (!rxv || isNaN(rxv) || rxv==0){
			rxv = rxv1;
		}
		else {
			if (rxv == rxv1)
				rxv = Math.round(Math.min(node.attr('width'), node.attr('height'))/4);
			else
				rxv=0;
		}
		node.attr('rx', rxv);
	}
	
  }; //zebraMode ends here <-------
  
  sandbox.subscribe('dizzy.presentation.loaded', function (c) {
    canvas = c.canvas;
  });
  
  function hideZebra(d) {
    if (zebraNode) {
      zebraNode.hide();
      zebraNode.find('#zebra-toolbar').addClass('hidden');
	  zebraNode.find('#zebra-expand-button').removeClass('mirrored');
    }
  }
  
  sandbox.subscribe('dizzy.presentation.transform', hideZebra);
  sandbox.subscribe('dizzy.ui.resizer.start', hideZebra);

  var selectedGroup;
  sandbox.subscribe('dizzy.presentation.group.selected', function (d) {
    if (zebraNode) {
      var event = d.event;
      selectedGroup = d.group;
      zebraNode.css({
        top: event.pageY - zebraNode.height() / 2,
        left: event.pageX - zebraNode.width()  / 2
      });
      zebraNode.hide();
      zebraNode.show();
      
      zebraNode.find('.toolbutton').removeClass('hidden');
      groupType = selectedGroup.dom().children().first().prop('localName');
			
		if(groupType && groupType != 'rect'){
			zebraNode.find('#zebra-toolbar-43').addClass('hidden');
			zebraNode.find('#zebra-toolbar-169').addClass('hidden');
			zebraNode.find('#zebra-toolbar-1610').addClass('hidden');
			zebraNode.find('#zebra-toolbar-border-round').addClass('hidden');
			
			if(groupType == 'image'){
				zebraNode.find('#zebra-toolbar-border-weight-up').addClass('hidden');
				zebraNode.find('#zebra-toolbar-border-weight-down').addClass('hidden');
			}
		}
    }
  });
  
  return {
    init: function () {
      var that = this;

      // create a container for dizzy svg file
      var body = $('#container');

      var jqxhr = $.get('html/zebra.html').success(function (d) {
        zebraNode = $(d);
        body.prepend(zebraNode);
        zebraNode.hide();

        sandbox.publish('dizzy.ui.zebra.loaded');
        
      }).error(function (e) {
        console.error("Could not load zebra control: " + e);
      }).complete(function () {
        sandbox.publish('dizzy.modes.register', {
          name: 'zebra',
          instance: zebraMode
        });
      });

    },
    destroy: function () {
      if (zebraNode) {
        zebraNode.remove();
      }
    }
  };
});
