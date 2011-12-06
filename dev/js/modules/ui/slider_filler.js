/*
 * Fills the slider div (loader) with the real slider and images
 */
define(['sandbox'], function (sandbox) {
  var canvas;
  var slider;

  //when Presentation is loaded -> get the canvas
  sandbox.subscribe('dizzy.presentation.loaded', function (c) {
    canvas = c.canvas;
  });

  //when slider is loaded:
  sandbox.subscribe('dizzy.ui.slider.loaded', function (data) {
    slider = data.slider; // get the slider
    
    //loads the divs needed by this slider
	slider.find("#loader").append('<div class="infiniteCarousel"><div class="wrapper" id="wrapper"><ul id="ulid"></ul></div></div>');
    //loads the images
    slider.find("#ulid").load("php/images_loader.php", function(){
		infiniteCarousel();
	});
  });
  
   var infiniteCarousel = function () {
	//adatta le dimensioni del wrapper alle dimensioni della pagina
	//-80 serve per fargli considerare i due bordi laterali di 40px l'uno
	$("#wrapper").width($(".infiniteCarousel").innerWidth()-80);
	
	$(window).resize(function(){
		$("#wrapper").width($(".infiniteCarousel").innerWidth()-80);
	});
	
    function repeat(str, num) {
        return new Array( num + 1 ).join( str );
    }
    
    //alert("ci sono ancora");
  
    return $('.infiniteCarousel').each(function () {
		
		//var $wrapper = $("#wrapper").css('overflow', 'hidden'),
        var $wrapper = $('> div', this).css('overflow', 'hidden'),
            $slider = $wrapper.find('> ul'),
            $items = $slider.find('> li'),
            $single = $items.filter(':first'),
			
			//innerWidth() returns the width of the element,
			//including left and right padding(but not borders and margins), in pixels.
			
			//outerWidth() Returns the width of the element,
			//along with left and right padding, border, and optionally margin if(true), in pixels.
			
			//Math.ceil arrotonda sempre per eccesso
			
            singleWidth = $single.outerWidth(true), 
            //di quante foto avanzare quando si clicca su la freccia avanti
			visible = Math.ceil(($wrapper.innerWidth()-singleWidth) / singleWidth), // note: doesn't include padding or border
            currentPage = 1,
            pages = Math.ceil($items.length / visible);            

			//alert("Ci sono "+$items.length+" immagini");

        // 1. Pad so that 'visible' number will always be seen, otherwise create empty items
        if (($items.length % visible) != 0) {
            $slider.append(repeat('<li class="empty" />', visible - ($items.length % visible)));
            $items = $slider.find('> li');
        }
		
			//alert("1");
        // 2. Top and tail the list with 'visible' number of items, top has the last section, and tail has the first
        $items.filter(':first').before($items.slice(- visible).clone().addClass('cloned'));
        $items.filter(':last').after($items.slice(0, visible).clone().addClass('cloned'));
        $items = $slider.find('> li'); // reselect
			
			//alert("2");
        // 3. Set the left position to the first 'real' item
        $wrapper.scrollLeft(singleWidth * visible);
			
			//alert("3");
        // 4. paging function
        function gotoPage(page) {
            var dir = page < currentPage ? -1 : 1,
                n = Math.abs(currentPage - page),
                left = singleWidth * dir * visible * n;
            
            $wrapper.filter(':not(:animated)').animate({
                scrollLeft : '+=' + left
            }, 1000, function () {
                if (page == 0) {
                    $wrapper.scrollLeft(singleWidth * visible * pages);
                    page = pages;
                } else if (page > pages) {
                    $wrapper.scrollLeft(singleWidth * visible);
                    // reset back to start position
                    page = 1;
                } 

                currentPage = page;
            });                
            
            return false;
        }
        //alert("4");
        $wrapper.after('<a class="arrow back"></a><a class="arrow forward"></a>');
        
        // 5. Bind to the forward and back buttons
        /*$(document).delegate('a.back', 'click', function () {
            return gotoPage(currentPage - 1);                
        });
        $(document).delegate('a.forward', 'click', function () {
            return gotoPage(currentPage + 1);                
        });*/
        
        $('a.back', this).click(function () {
            return gotoPage(currentPage - 1);                
        });
        
        $('a.forward', this).click(function () {
            return gotoPage(currentPage + 1);
        });
        //alert("5");
        // create a public interface to move to a specific page
        $(this).bind('goto', function (event, page) {
            gotoPage(page);
        });
    });  
};
  
  return {
    init: function () {},
    destroy: function () {}
  };

});
