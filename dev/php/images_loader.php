<?php 
	// Recupera le immagini da una cartella e il primo livello di sottocartelle
	// e ne restituisce (come tag <li><a><img/></a></li>) i link
	
	$dir = "../../../alessandroOutline/";
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
