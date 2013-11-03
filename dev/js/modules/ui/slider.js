/*
 * The  module loads a slider div upon the canvas
 * 
 * Note: this module (and slider.filler.js) are thought for a specific use of mine.
 * You may adapt it (I will post a how-to sooner or later) to your needs or just remove:
 * 	js/modules/ui/slider.js
 *  js/modules/ui/slider.filler.js
 * 	php/images_loader.php
 * 	php/testPhp.php
 * 
 * and delete the corresponding element in the list in js/modules.js
 * anyway it won't do anything bad even if you decide to let it stay here.
 */
define(['sandbox'],  function (sandbox) {
  var canvas;
  var containerId = 'dizzy';
  var slider;

  sandbox.subscribe('dizzy.ui.slider.closed', function () {
    reopen.show("slow");
  });
  
  sandbox.subscribe('dizzy.ui.slider.close', function(){
		slider.hide("slow");
        console.log('slider closed.');
        sandbox.publish('dizzy.ui.slider.closed.', {
          slider: slider
        });
  });

  return {

    init: function () {
      var that = this;
      
      // create a container for dizzy svg file
      var body = $('#container');
      //alert(document.referrer);
      
      $.get('php/testPhp.php', function(data){
		  console.log('Referrer:'+document.referrer+':');
		  if((data.substring(0,5))=="<?php"){
			console.warn('PHP is not enabled on this server -> slider can\'t be loaded');
		  }
		  // open slider only if dizzy is called by CloudBeamer
		  else if(document.referrer == 'http://172.16.15.73/home.php'){
			  var jqxhr = $.get('html/slider.html').success(function (d) {
				body.prepend(d);
				slider = body.find('#anteprime');
				reopen = body.find('#apriAnteprime');
				
				sandbox.publish('dizzy.ui.slider.loaded', {
				  slider: slider
				});
				
				//shows slider images preview
				$(document).delegate('a[class="preview"] > img, #preview', "click", function(e){
				  e.preventDefault();
				  
				  if($("#preview").length > 0) $("#preview").remove();
				  else {
					  $("#preview").remove();
					  
					  xOffset = 10;
					  yOffset = 30;
					  wi=500;
					  he=400;
					  
					  this.t = this.title;
						this.title = "";	
						var c = (this.t != "") ? "<br/>" + this.t : "";
						$("body").append("<p id='preview'><img src='"+ $(this).parent().attr('href') +"' WIDTH=\""+wi+"\" HEIGHT=\""+he+"\" alt='Image preview' />"+ c +"</p>");								 
						
						$("#preview").css("top",(e.pageY - xOffset-he) + "px"); //con -he la preview va 'sopra' il cursore e non sotto.
						if((e.pageX + yOffset + wi) > $(window).width())
							$("#preview").css("left",(e.pageX - wi - yOffset) + "px");
						else
							$("#preview").css("left",(e.pageX + yOffset) + "px");
						$("#preview").fadeIn(0);
					}
				  });
			  }).error(function (e) {
				// TODO
			  }).complete(function () {
				that.assignEventHandlers();
				console.log('slider loaded.');
			  });
		  }
	  });	  
    },

    assignEventHandlers: function () {
		
      slider.delegate('#x', 'click', function (e) {
        slider.hide("slow");
        console.log('slider closed.');
        sandbox.publish('dizzy.ui.slider.closed.', {
          slider: slider
        });
      });
      
      reopen.bind('click', function(e){
		  slider.show("slow");
		  reopen.hide("slow");
		  console.log('slider opened');
		  sandbox.publish('dizzy.ui.slider.opened.', {
			  slider: slider
		  });
	  });
    },

    destroy: function () {
      $('#slider').remove();
    }

  };

});
