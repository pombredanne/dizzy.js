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
		  
		zebraNode.disableTextSelect();
		
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
        var translate = zebraNode.find('#zebra-translate');
        translate.bind('mousedown.dizzy.zebra.translate', function (e) {
          return groupTranslate(selectedGroup.dom(), e);
        });
        
        /* Bind the expand-menu-button to open the zebra-menu */
        var expand = zebraNode.find("#zebra-expand-button");
        expand.bind('click.dizzy.zebra.expand', function() {
			$('#zebra-toolbar').toggleClass('hidden');
			$(this).toggleClass('mirrored');
		});
		
		/* Levels management */
		var up = zebraNode.find('#zebra-toolbar-up');
		up.bind('click.dizzy.zebra.toolbar.up', function(){
			return that.raiseLayer();
		});
		var down = zebraNode.find('#zebra-toolbar-down');
		down.bind('click.dizzy.zebra.toolbar.down', function(){
			return that.lowerLayer();
		});
		
		/* Border weight management */
		var strokeWidthUp = zebraNode.find('#zebra-toolbar-border-weight-up');
		strokeWidthUp.bind('click.dizzy.zebra.toolbar.strokeWidth.up', function(){
			return that.raiseStrokeWidth();
		});
		var strokeWidthDown = zebraNode.find('#zebra-toolbar-border-weight-down');
		strokeWidthDown.bind('click.dizzy.zebra.toolbar.strokeWidth.down', function(){
			return that.lowerStrokeWidth();
		});
      }
    },


    removeEventHandlers: function () {
      var that = this;
      if (canvas) {
        var groups = jQuery(canvas.svg.root()).undelegate('g.group', 'mousedown.dizzy.zebra.scale');
      }
      var rotate = zebraNode.find('#zebra-rotate');
      rotate.unbind('mousedown.dizzy.zebra.rotate');
      var scale = zebraNode.find('#zebra-scale');
      scale.unbind('mousedown.dizzy.zebra.scale');
      var translate = zebraNode.find('#zebra-translate');
      translate.unbind('mousedown.dizzy.zebra.translate');
      var expand = zebraNode.find("#zebra-expand-button");
      expand.unbind('click.dizzy.zebra.expand');
      zebraNode.find('#zebra-toolbar-up').unbind('click.dizzy.zebra.toolbar.up');
      zebraNode.find('#zebra-toolbar-down').unbind('click.dizzy.zebra.toolbar.down');
      zebraNode.find('#zebra-toolbar-border-weight-up').unbind('click.dizzy.zebra.toolbar.strokeWidth.up');
      zebraNode.find('#zebra-toolbar-border-weight-down').unbind('click.dizzy.zebra.toolbar.strokeWidth.down');
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
        });
        $(document).bind('mouseup.dizzy.zebra.rotate mouseleave.dizzy.zebra.rotate', function (e) {
          $(document).unbind('mousemove.dizzy.zebra.rotate');
          $(document).unbind('mouseup.dizzy.zebra.rotate mouseleave.dizzy.zebra.rotate');
        });

      }
      return false;
    },

    /*
     * Scale clicked on zebra
     */
    scaleStart: function (s, e) {
      e.preventDefault();
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

          //canvas.transform( selectedGroup, nodeTransform, { duration : 0 } );
        });
        $(document).bind('mouseup.dizzy.zebra.scale mouseleave.dizzy.zebra.scale', function (e) {
          $(document).unbind('mousemove.dizzy.zebra.scale');
          $(document).unbind('mouseup.dizzy.zebra.scale mouseleave.dizzy.zebra.scale');
        });
      }
      return true;
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
        nodeTransform = nodeTransform.translate(eventVector.x - lastPosition.x, eventVector.y - lastPosition.y);
        //lastPosition = eventVector;
        canvas.transform(group, nodeTransform, {
          duration: 0
        });
        zebraNode.css({
          top: e.pageY - zebraNode.width() / 2,
          left: e.pageX - zebraNode.height() / 2
        });
      });
      $(document).bind('mouseup.dizzy.zebra.translate mouseleave.dizzy.zebra.translate', function (e) {
        $(document).unbind('mousemove.dizzy.zebra.translate');
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
    
    //TODO: use a function to raise the width proportionally to the current size (eg. if it's 15 should grow by 3)
    lowerStrokeWidth: function(){
		var node = $('.selected', canvas.svg.root());
		//if( !node.hasClass('group') ) node = node.parents('g.group').first();
		
		$children = node.children();
		if ($children.length == 1) node = $children.first();
		var sw = parseFloat(node.attr('stroke-width'));
		if(sw > 0)
			if (sw > 1) node.attr('stroke-width', sw-1);
			else node.attr('stroke-width', Math.round((sw*10)-1)/10);
	},
	
	raiseStrokeWidth: function(){
		var node = $('.selected', canvas.svg.root());
		//if( !node.hasClass('group') ) node = node.parents('g.group').first();
		
		$children = node.children();
		if ($children.length == 1) node = $children.first();
		var sw = parseFloat(node.attr('stroke-width'));
		if(sw >= 1)  node.attr('stroke-width', sw+1);
		else node.attr('stroke-width', Math.round((sw*10)+1)/10);
	}
  }; //zebraMode ends here <-------
  
  sandbox.subscribe('dizzy.presentation.loaded', function (c) {
    canvas = c.canvas;
  });
  
  function hideZebra(d) {
    if (zebraNode) {
      zebraNode.hide();
      $('#zebra-toolbar').addClass('hidden');
	  $('#zebra-expand-button').removeClass('mirrored');
    }
  }
  
  sandbox.subscribe('dizzy.presentation.transform', hideZebra);

  var selectedGroup;
  sandbox.subscribe('dizzy.presentation.group.selected', function (d) {
    if (zebraNode) {
      var event = d.event;
      selectedGroup = d.group;
      zebraNode.css({ //check if width() and height() should be exchanged
        top: event.pageY - zebraNode.width() / 2,
        left: event.pageX - zebraNode.height() / 2
      });
      zebraNode.show();
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
