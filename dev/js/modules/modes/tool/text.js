/*
 * The text mode allow to create text-groups on the canvas, by opening a textbox on click.
 */
define(['sandbox'],  function(sandbox){

    // components that are needed for text editing:
    var canvas;
    var textBox;
    var textOverlay;
    var clickOpensTextbox = false;
    var selectedTextGroup;
    var textAnchor='';
    var textX;
        
    /*
     * Subscribtions
     */
    sandbox.subscribe('dizzy.presentation.loaded', function (c) {
      canvas = c.canvas;
    });
    
    // if canvas was panned, don't open up a textbox
    sandbox.subscribe('dizzy.presentation.transform.do', function (data, name) {
      //if( name.indexOf('.end') < 0 ){
      clickOpensTextbox = false;
      //}
    });
    
    sandbox.subscribe('dizzy.io.mouse.wheel', hideTextbox);
    //sandbox.subscribe('dizzy.canvas.io.mouse.click', hideTextbox);
    //sandbox.subscribe('dizzy.canvas.io.mouse.down', hideTextbox);
    sandbox.subscribe('dizzy.presentation.transform.tracker.go', hideTextbox);
    
    sandbox.subscribe('dizzy.ui.toolbar.color.fill.changed', function(d){
	  if(selectedTextGroup)
	  selectedTextGroup.dom().children().first().attr('fill', d.color);
	});
  
	sandbox.subscribe('dizzy.ui.toolbar.color.stroke.changed', function(d){
	  if (selectedTextGroup)
	  selectedTextGroup.dom().children().first().attr('stroke', d.color);
	});

    var textMode = {
      depends: ['zoom', 'pan'],

      start: function () {
        if( canvas ){
          clickOpensTextbox = true;
          assignEventHandler();
          $(canvas.svg.root()).addClass('editing textmode');
        }
      },

      stop: function () {
        if( canvas ){
          removeEventHandler();
          hideTextbox();
          $(canvas.svg.root()).removeClass('editing textmode');
        }
      }
    };
    
    var screenCoordsForText = function(text){
		var Coords = {};
		var matrix  = text.getScreenCTM();
		var svg = document.getElementsByTagName('svg')[0];
		var pt = svg.createSVGPoint();
		
		bbox = text.getBBox();
		pt.x = bbox.x;
		pt.y = bbox.y;
		Coords.nw = pt.matrixTransform(matrix);
		pt.x += bbox.width;
		Coords.ne = pt.matrixTransform(matrix);
		pt.y += bbox.height;
		Coords.se = pt.matrixTransform(matrix);
		pt.x -= bbox.width;
		Coords.sw = pt.matrixTransform(matrix);
		
		return Coords;
	};

    function assignEventHandler(){		
      // edit text
      $(canvas.svg.root()).delegate('.group', 'click.dizzy.mode.text.edit', function (e) {
        e.stopImmediatePropagation();
        var text = $(this).children('text');
        if (text.size() > 0) {
          e.stopPropagation();
          if (clickOpensTextbox) {
            var group = canvas.getGroup(this);
            
            canvas.centerGroup(group, {
              duration: 100,
              complete: function () {
				var viewportCoordinates = updateSizeForText(text);
				
				selectedTextGroup = group;
				showTextbox(group, viewportCoordinates);
              }
            });
            
          } else {
            hideTextbox();
          }
        } else {
			newText(e);
		} 
        return false;
      });
      
      // new text
      $(canvas.svg.root()).bind('click.dizzy.mode.text.new', function (e) {
        newText(e);
      });
    }
    
    function newText(e){
		if (clickOpensTextbox) {
          e.stopPropagation();

          var clickCoordinates = {
            x: e.pageX,
            y: e.pageY
          };
          
          var newGroup = canvas.createGroup();
          var newGroupDom = newGroup.dom();

          var newText = $(canvas.svg.other(newGroupDom, 'text'));
          var newTextSpan = $(canvas.svg.other(newText, 'tspan'));
		  newText.attr('text-anchor', textAnchor);
          var svgOffset = canvas.toViewboxCoordinates(clickCoordinates);
		  var fontSize = 200; 
          newText.attr({
			'font-family' : 'serif',
			'font-size': fontSize+'px',
            x: svgOffset.x,
            y: svgOffset.y,
            stroke: canvas.getStrokeColor(),
            fill: canvas.getFillColor()
          });
          newText.append(newTextSpan);
          
          newGroupDom.append(newText);
          
          selectedTextGroup = newGroup;

          showTextbox(newGroup, {
            x: e.pageX,
            y: e.pageY-45 //textBox height for 200px text
          });
          
          sandbox.publish('dizzy.canvas.group.created.text', {
			group: newGroup
		  });
        } else {
          hideTextbox();
        }
	}

    function removeEventHandler() {
		//for some reason the commented unbind didn't work
	  $(canvas.svg.root()).unbind();
      //$(canvas.svg.root()).unbind('click.dizzy.mode.text.new');
      //$('.group').unbind('click.dizzy.mode.text.edit');
      $(canvas.svg.root()).undelegate('g.group');
      //$(canvas.svg.root()).undelegate('g.group', 'click.dizzy.mode.text.edit');
    }
    
    /* Update the size (and position) of the TextBox for the text 'text' and returns the north-west corner screen coordinates */
    function updateSizeForText(text){
		
		if(text == undefined) return;
		
		/*text.attr('id', 'tempTextId');
		var textjs = document.getElementById('tempTextId'); //this method is not avaiable for the jquery object
		text.removeAttr('id');*/
		
		var bboxCoords = screenCoordsForText(text[0]);
				
		var screenCoordinates = {x: bboxCoords.nw.x, y: bboxCoords.nw.y};
		
		if (screenCoordinates.x || screenCoordinates.y){
				
			var bbWidth = (bboxCoords.ne.x-bboxCoords.nw.x);
			var bbHeight = (bboxCoords.sw.y-bboxCoords.nw.y);
			textBox.width(bbWidth);
			textBox.height(bbHeight);
			
			textOverlay.css({
			top: screenCoordinates.y,
			left: screenCoordinates.x
			})
		}
		return screenCoordinates;
	}
    
    function keyPressed(ev, node){
		ev.preventDefault();
		var text = node;
		node = node.children().last();
		var oldText = node.text();
		if( ev.which !== 0 && ev.which !== 8 ){ // backspace
			node.text(oldText+String.fromCharCode(ev.which));
		}
		updateSizeForText(text);
		return true;
	}
	
	function keyDown(ev, node){
		//ev.preventDefault();
		if( node.size() !== 0 ){
			if(ev.which === 13 ){ // enter (multiline text)
				var textSpan = $(canvas.svg.other(node, 'tspan'));
				var precSpan = textSpan.closest();
				textSpan.attr('x', node.attr('x')).attr('dy', window.getComputedStyle(textSpan[0], null).getPropertyValue('font-size'));
				return false;
				
			}else if(ev.which === 46 || (ev.which === 0 && ev.keyCode === 46) ){ // delete key -> remove group
				return false;
				
			}else if( ev.which === 8 ){ // backspace
				var spanNode = node.children('tspan').last();
				
				//var group = node;
				var oldText = spanNode.text();
				
				if( oldText.length !== 0 ){ // delete last char
					spanNode.text(oldText.substr(0, oldText.length-1));
					updateSizeForText(node);
				}
				if( oldText.length === 0){ // remove tspan
					if(node.children('tspan').length > 1)
					spanNode.remove();
				}
				/*if( node.children().size() === 0 ){ // remove group
					canvas.remove(node);
				}*/
				
				return false;
			}
		}
		return true;
	}


    function showTextbox(group, viewportCoordinates) {
      var groupDom = group.dom();

      var text = groupDom.find('text');
      var spans = text.children('tspan');
      
      $(document).bind('keypress.dizzy.editor', function(event){ return keyPressed(event, text); });
      $(document).bind('keydown.dizzy.editor',  function(event){ return keyDown(event, text); });
      
      $('#tool-textMode-bigger').bind('click', function(){
		  //console.log(text);
		  var fontSize = text.attr('font-size');
		  fontSize = parseFloat(fontSize.substring(0, fontSize.length-2));
		  if (fontSize > 100)
			  fontSize += fontSize/20;
		  else if (fontSize > 30)
			  fontSize += 3;
		  else fontSize += 1;
		  
		  text.attr('font-size', fontSize+'px');		  
		  text.children('tspan').not(':first-child').attr('dy', fontSize+'px');
		  updateSizeForText(text);
	  });
	  
	  $('#tool-textMode-smaller').bind('click', function(){
		  var fontSize = text.attr('font-size');
		  fontSize = parseFloat(fontSize.substring(0, fontSize.length-2));
		  if (fontSize > 100)
			  fontSize -= fontSize/20;
		  else if (fontSize > 30)
			  fontSize -= 3;
		  else fontSize -= 1;
		  
		  text.attr('font-size', fontSize+"px");
		  text.children('tspan').not(':first-child').attr('dy', fontSize+'px');
		  updateSizeForText(text);
	  });
	  
	  $('#tool-textMode-family').bind('change', function(){
		  var fontFam = $("#tool-textMode-family option:selected").val();
		  text.attr('font-family', fontFam);
		  updateSizeForText(text);
	  });
	  
	  $('#tool-textMode-italic').bind('click', function(){
		  var fontStyle = text.attr('font-style');
		  if(fontStyle == 'italic'){
			  text.removeAttr('font-style');
		  }
		  else {
			  text.attr('font-style', 'italic');
		  }
		  updateSizeForText(text);
	  });
	  
	  $('#tool-textMode-bold').bind('click', function(){
		  var fontStyle = text.attr('font-weight');
		  if(fontStyle == 'bold'){
			  text.removeAttr('font-weight');
		  }
		  else {
			  text.attr('font-weight', 'bold');
		  }
		  updateSizeForText(text);
	  });
	  
	  $('#tool-textMode-underline').bind('click', function(){
		  var fontStyle = text.attr('text-decoration');
		  if(fontStyle == 'underline'){
			  text.removeAttr('text-decoration');
		  }
		  else {
			  text.attr('text-decoration', 'underline');
		  }
		  updateSizeForText(text);
	  });
	  
	  $('#tool-textMode-center').bind('click', function(){
			var anchor = text.attr('text-anchor');
			var diff = parseInt(text.attr('x'));
			var firstSpanLength = text.children().first()[0].getComputedTextLength();
			console.log(firstSpanLength);
			if (anchor == 'middle'){
				text.removeAttr('text-anchor');
				textAnchor = '';
			}
			else{
				text.attr('text-anchor', 'middle');
				text.children().attr('x', diff+firstSpanLength/2)
				textAnchor = 'middle';
			}
			updateSizeForText(text);
	  });

      textOverlay.show();
      textOverlay.css({
        top: viewportCoordinates.y,
        left: viewportCoordinates.x
      });
      textBox.trigger('input');
      textBox.trigger('focus');
      clickOpensTextbox = false;
    }

    function hideTextbox() {
		if(selectedTextGroup){
			//console.log('hiding textbox');
			var text = selectedTextGroup.dom().children().first();
			//console.log(text.children('tspan').length);
			var spans = text.children('tspan');
			if(spans.length == 1){
				var cont = spans.text();
				var regexp = /^[ ]+$/; //remove empty texts or space only texts
				if (cont == '' || regexp.test(cont))
				canvas.removeGroup(selectedTextGroup);
			} else if(spans.length == 0) canvas.removeGroup(selectedTextGroup);
			selectedTextGroup = undefined;
		}
		
	  $(document).unbind('keypress.dizzy.editor');
      $(document).unbind('keydown.dizzy.editor');
		
      //textBox.change();
      $('.invisible').removeClass('invisible');
      //textBox.unbind();
      textOverlay.hide();
      $('#tool-textMode-bigger').unbind();
      $('#tool-textMode-smaller').unbind();
      $('#tool-textMode-family').unbind();
      $('#tool-textMode-italic').unbind();
      $('#tool-textMode-bold').unbind();
      $('#tool-textMode-underline').unbind();
      $('#tool-textMode-center').unbind();
      
      textBox.width(271);
	  textBox.height(65.43600463867188);

      clickOpensTextbox = true;
    }

    return {
      init: function () {
        var jqxhr = $.get('html/textBBox.html').success(function (d) {
          textOverlay = $(d);
          textOverlay.css({
			  'MozUserSelect' : 'none'
			}).bind('selectstart select', function() {
			  return false;
			});
          textBox = textOverlay.find('#text-wrapper');
          textOverlay.hide();

          $('#container').append(textOverlay);

          sandbox.publish('dizzy.ui.textbox.loaded');
          
        }).error(function (e) {
          console.error("Could not load textbox: " + e);
        }).complete(function () {
          sandbox.publish('dizzy.modes.register', {
            name: 'tool-text',
            instance: textMode
          });
        });
      },

      destroy: function () {
        if (textOverlay) {
          textOverlay.remove();
        }
      }

    };
  });
