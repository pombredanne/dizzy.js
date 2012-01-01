/*
 * The canvas module does load a SVG object and provides access to methods on Dizzy.Canvas
 */
define(['sandbox', 'dizzy/canvas'], function (sandbox, Canvas) {
  var canvas;
  var containerId = 'dizzy';
  var dizzyContainer;


  /*
   * Subcriptions:
   */
  /*
   * Loads a requested presentation.
   */
  sandbox.subscribe('dizzy.presentation.load', function (d) {
    if (canvas !== undefined && dizzyContainer !== undefined) {
      dizzyContainer.addClass('loading');
      var file = d.file;
      canvas.load(file, {
        success: function () {
          canvas.gotoGroup(0);
          sandbox.publish('dizzy.presentation.loaded', {
            canvas: canvas
          });

          $(window).bind('resize', function () {
            var $svg = $(canvas.svg.root());
            $svg.width($(document).width());
            $svg.height($(document).height());
          });
          $(window).resize();

          //canvas.gotoGroup(0);
          dizzyContainer.removeClass('loading');
          //alert("no problem!");
        }
      });
    }
  });
  
  sandbox.subscribe('dizzy.presentation.loadSVG', function (d){
	  
	  var svgDoc = d.svgDoc;
	  
	  dizzyContainer.remove();
	  
	  // create a container for dizzy svg file
      var body = $('#container');
      dizzyContainer = $('<div id="' + containerId + '" class="loading" />');
      body.append(dizzyContainer);
      dizzyContainer.disableTextSelect();

      canvas = new Canvas('#' + containerId);

      sandbox.publish('dizzy.presentation.load', {
        file : svgDoc
      });
	  
	  var $svg = $(canvas.svg.root());
		$svg.width($(document).width());
		$svg.height($(document).height());
            
      dizzyContainer.bind('mousedown', function (e) {
        sandbox.publish('dizzy.canvas.io.mouse.down', e);
      });
      dizzyContainer.bind('mouseup', function (e) {
        sandbox.publish('dizzy.canvas.io.mouse.up', e);
      });
      dizzyContainer.bind('click', function (e) {
        sandbox.publish('dizzy.canvas.io.mouse.click', e);
      });
      
      sandbox.publish('dizzy.ui.toolbar.clicked.mode.tool-default', {button: 'tool-default'});
  });

  return {

    init: function () {

      // create a container for dizzy svg file
      var body = $('#container');
      dizzyContainer = $('<div id="' + containerId + '" class="loading" />');
      body.append(dizzyContainer);
      dizzyContainer.disableTextSelect(); //it is already in js/dizzy/canvas.js !!! maybe useless now
      //disable text selection (e.g holding left click of mouse)
      /* On Chrome and Opera left-to-right mouse selecting works anyway
       * if starting outside the disabled div (really annoying sometimes) (tocheck) =[ */

      canvas = new Canvas('#' + containerId);

      sandbox.publish('dizzy.presentation.load', {
        file: './svg/blank.svg'
        //file : '<svg version="1.1" viewBox="0 0 2000 1500" preserveAspectRatio="xMinYMin" xml:space="preserve" width="1600" height="440" style="width: 1600px; height: 440px;" class="editing" xmlns="http://www.w3.org/2000/svg"> <style type="text/css" id="dizzy-internal-style"> <![CDATA[ text tspan{ font-size: 200px; } ]]> </style> <g id="canvas" transform="matrix(1, 0, 0, 1, 0, 0)"> <g class="group group_1 group_5" name="primo" id="g0.9572833816441317" transform="matrix(1, 0, 0, 1, 0, 0)"> <rect x="-905.681884765625" y="337.5" width="1022.727294921875" height="770.45458984375" stroke="#000000" fill="#FFFFFF" stroke-width="3" fill-opacity="0"/></g> <g class="group group_2" id="g0.15852712416076375" transform="matrix(1, 0.904941, -0.904941, 1, 437.511, -1718.38)"> <rect x="1572.7271728515625" y="429.54547119140625" width="1049.9998779296875" height="709.0908813476562" stroke="#000000" fill="#FFFFFF" stroke-width="3" fill-opacity="0"/></g> <g class="group group_3" id="g0.5869978368764752" transform="matrix(1, 0, 0, 1, 0, 0)"> <rect x="3248.86376953125" y="163.63636779785156" width="842.04541015625" height="521.5909271240234" stroke="#000000" fill="#FFFFFF" stroke-width="3" fill-opacity="0"/></g> <g class="group group_4" id="g0.2694999103049499" transform="matrix(1.47761, -0.00501459, 0.00501459, 1.47761, -2410.11, -316.661)"><rect x="4660.2275390625" y="548.8636474609375" width="559.0908203125" height="501.1363525390625" stroke="#000000" fill="#FFFFFF" stroke-width="3" fill-opacity="0"/></g></g> </svg>'
      });

      dizzyContainer.bind('mousedown', function (e) {
        sandbox.publish('dizzy.canvas.io.mouse.down', e);
      });
      dizzyContainer.bind('mouseup', function (e) {
        sandbox.publish('dizzy.canvas.io.mouse.up', e);
      });
      dizzyContainer.bind('click', function (e) {
        sandbox.publish('dizzy.canvas.io.mouse.click', e);
      });
    },

    destroy: function () {
      $(containerId).remove();
    }

  };

});
