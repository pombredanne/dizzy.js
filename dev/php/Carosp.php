<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
  "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
<meta http-equiv="Content-type" content="text/html; charset=utf-8" />
<style type="text/css" media="screen">

	body { font: 1em "Trebuchet MS", verdana, arial, sans-serif; font-size: 100%; }
	input, textarea { font-family: Arial; font-size: 125%; padding: 7px; }
	label { display: block; } 

	.infiniteCarousel {
	  width: 100%;
	  height:100%;
	  position: absolute;
	  top: 0;
	  overflow:hidden;
	  margin: 40px 60px;
	  margin: 17px 0;
	}

	.infiniteCarousel .wrapper {
	  /*width: 90%;  .infiniteCarousel width - (.wrapper margin-left + .wrapper margin-right) */
	  overflow: auto;
	  min-height: 10em;
	  margin: 0 40px;
	  position: absolute;
	  text-align: center;
	}

	.infiniteCarousel ul a img {
	  border: 2px solid #000;
	  -moz-border-radius: 2px;
	  -webkit-border-radius: 2px;
	}

	.infiniteCarousel .wrapper ul {
	  width: 9999px;
	  list-style-image:none;
	  list-style-position:outside;
	  list-style-type:none;
	  margin:0;
	  padding:0;
	  position: absolute;
	  top: 0;
	}

	.infiniteCarousel ul li {
	  display:block;
	  float:left;
	  padding: 2px;
	  height: 102px;
	  width: 150px;
	  margin: 0 5px;
	}

	.infiniteCarousel ul li a img {
	  display:block;
	}

	.infiniteCarousel .arrow {
	  display: block;
	  height: 20px;
	  width: 14px;
	  text-indent: -999px;
	  position: absolute;
	  top: 37px;
	  cursor: pointer;
	}

	.infiniteCarousel .forward {
	  background-position: 0 0;
	  background: url(next.png) no-repeat 0 0;
	  right: 0;
	}

	.infiniteCarousel .back {
	  background-position: 0 -72px;
	  background: url(prev.png) no-repeat 0 0;
	  left: 0;
	}
	
	#preview{
		position:absolute;
		border:1px solid #ccc;
		background:#333;
		padding:3px;
		display:none;
		color:#fff;
	}

</style>

<script src="http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js"></script>
<script src="preview.js"></script>
<script type="text/javascript">
		
$.fn.infiniteCarousel = function () {
	
	//adatta le dimensioni del wrapper alle dimensioni della pagina
	//-80 serve per fargli considerare i due bordi laterali di 40px l'uno
	$("#wrapper").width($(".infiniteCarousel").innerWidth()-80);
	
	$(window).resize(function(){
	
		$("#wrapper").width($(".infiniteCarousel").innerWidth()-80);
	});
	
    function repeat(str, num) {
        return new Array( num + 1 ).join( str );
    }
  
    return this.each(function () {
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

$(document).ready(function () {
  $('.infiniteCarousel').infiniteCarousel();
});
</script>
</head>
<body>    
    <div class="infiniteCarousel">
      <div class="wrapper" id="wrapper">
        <ul id="ulid">
		  <!--<li><a href="images/thumbs/t9.jpg"><img width="75" height="75" class="image27" alt="img27" title="A title for image 27" src="images/thumbs/t9.jpg"></a></li>
          <li><a href="images/6.jpg" title="Tall Glow"><img src="images/6.jpg" height="75" width="75" alt="Tall Glow" /></a></li>
          <li><a href="images/7.jpg" title="Wet Cab"><img src="images/7.jpg" height="75" width="75" alt="Wet Cab" /></a></li>
          <li><a href="images/8.jpg" title="Rockefella"><img src="images/8.jpg" height="75" width="75" alt="Rockefella" /></a></li>
          <li><a href="images/9.jpg" title="Chrysler Reflect"><img src="images/9.jpg" height="75" width="75" alt="Chrysler Reflect" /></a></li>
          <li><a href="http://www.flickr.com/photos/remysharp/3047871624/" title="Chrysler Up"><img src="http://farm4.static.flickr.com/3164/3047871624_2cacca4684_s.jpg" height="75" width="75" alt="Chrysler Up" /></a></li>
          <li><a href="http://www.flickr.com/photos/remysharp/3047034661/" title="Time Square Awe"><img src="http://farm4.static.flickr.com/3212/3047034661_f96548965e_s.jpg" height="75" width="75" alt="Time Square Awe" /></a></li>
          <li><a href="http://www.flickr.com/photos/remysharp/3047034531/" title="Wonky Buildings"><img src="http://farm4.static.flickr.com/3022/3047034531_9c74359401_s.jpg" height="75" width="75" alt="Wonky Buildings" /></a></li>
          <li><a href="http://www.flickr.com/photos/remysharp/3047034451/" title="Leaves of Fall"><img src="http://farm4.static.flickr.com/3199/3047034451_121c93386f_s.jpg" height="75" width="75" alt="Leaves of Fall" /></a></li>
        -->
		<?php 

			// Recupera le immagini da una cartella e il primo livello di sottocartelle
			// e ne restituisce (come tag <li><a><img/></a></li>) i link
			
			$dir = "alessandroOutline/";
			$indice = 0;
			// Apre una directory nota
			if (is_dir($dir)) {
				if ($dh = opendir($dir)) {
					// Finché nella cartella c'è qualcosa
					while (($file = readdir($dh)) !== false) {
						// Se è una cartella ne ispezioniamo il contenuto
						if(strcmp(filetype($dir . $file), "dir")==0){
						if(strcmp($file, "..")!=0 && strcmp($file, ".")!=0){
							
							$dir2= $dir.$file.'/';
							if (is_dir($dir2)) {
								if ($dh2 = opendir($dir2)) {
									// E stampiamo i path delle immagini ivi contenute
									while (($file2 = readdir($dh2)) !== false) {
										if(strcmp(filetype($dir2 . $file2), "file")==0)
										if(strcmp($file2,"Thumbs.db")!=0){
											$valore = "$dir2$file2";
											echo "<li><a class=\"preview\" href=\"".$valore."\" title=\"".($indice+1)."\"><img width=\"150\" height=\"102\" src=\"".$valore."\" alt=\"img".$indice."\" draggable=\"true\" class=\"image".$indice."\"/></a></li>";
											$indice++;
										}
									}
									closedir($dh2);
								}
						
							}
						}}
						/*//Se è un file nella cartella origine ne stampiamo il path
						else {
							if(strcmp(filetype($dir . $file), "file")==0)
							if(strcmp($file,"Thumbs.db")!=0){
								$valore = "$dir$file??";
								echo "<li><a href=\"".$valore."\"><img width=\"75\" height=\"75\" src=\"".$valore."\" title=\"A title for image ".$indice."\" alt=\"img".$indice."\" class=\"image".$indice."\"/></a></li>";
											$indice++;
							}
						}*/
					}
					closedir($dh);
				}
			}
		?>
		
		</ul>        
      </div>
    </div>
</body>
</html>