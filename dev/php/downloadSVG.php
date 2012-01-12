<?php

	$svg = $_POST['svg'];
	
	$nome = "download";
	$write_file = fopen($nome.".svg","w");
	fwrite($write_file,$svg);

	fclose($write_file);

	echo $nome.".svg";

?>
