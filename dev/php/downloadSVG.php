<?php
	if (isset($_POST['svg'])){
	
		$svg = $_POST['svg'];
		
		$nome = "presentation";
		/*
		$write_file = fopen($nome.".svg","w");
		fwrite($write_file,$svg);

		fclose($write_file);
		*/
		$zip = new ZipArchive();
		$file = $nome.".zip";
		
		$svg = preg_replace('/NS1:/', '', $svg, 1); //fixes Opera Namespace
		
		if ($zip->open($file, ZIPARCHIVE::CREATE)===TRUE) {
			$zip->addFromString("presentation.svg", $svg);
			//$zip->addFromString("aggiornato.txt", "oK");
			//$zip->addFile('fileName.txt', 'fileNameInTheArchive.txt');
			$zip->close();
		}else echo "Errore nella creazione del'archivio";
		
		echo $file;
	}
?>
