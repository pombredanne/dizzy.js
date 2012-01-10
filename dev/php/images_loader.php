<?php
	/*
	session_start();
	if (isset($_SESSION['user_id']) && isset($_SESSION['user_project'])){
		$id = $_SESSION['user_id'];
		$project = $_SESSION['user_project'];
	} else {
		$id = 'sessionVariables';
		$project = 'AreNotSet';
	}*/
	
	//$dir = '../../../slide/'.$id.$project.'/';
	$dir = '../../../alessandroOutline/';
	
	$dlist = getDirs($dir);
	for ($i=0, $indice=0; $i<count($dlist); $i++){
		$flist = getFiles($dlist[$i]);
		for ($j=0; $j<count($flist); $j++){
			echo "<li><a class=\"preview\" href=\"".$flist[$j]."\" title=\"".($indice+1)."\"><img width=\"150\" height=\"102\" src=\"".$flist[$j]."\" alt=\"img".$indice."\" draggable=\"true\" class=\"image".$indice."\"/></a></li>";
			$indice++;
		}
	}
	
	/* @return: all the subdirectories paths of $dir */
	function getDirs($dir){
		if(!is_dir($dir))
			return 'Directory not found: '.$dir;
		else {
			$dh = opendir($dir);
			
			while (false !== ($file = readdir($dh))){
				if ($file != '.' && $file != '..'){
					if(is_dir($dir.$file))
						$dlist[] = $dir.$file;
					/*else
						$flist[] = $dir.$file; */
				}
			}
			
			if (is_array($dlist)) sort($dlist);
			
			return ($dlist);
		}
	}
	
	/* @return: all the file paths of $dir */
	function getFiles($dir){
		$dir = $dir.'/';
		if(!is_dir($dir))
			return 'Directory not found: '.$dir;
		else {
			$dh = opendir($dir);
			
			while (false !== ($file = readdir($dh))){
				if ($file != '.' && $file != '..'){
					/*if(is_dir($dir.$file))
						$dlist[] = $dir.$file;
					else */
					if(strcmp($file,"Thumbs.db")!=0)
						$flist[] = $dir.$file;
				}
			}
			
			if (is_array($flist)) sort($flist);
			
			return ($flist);
		}
		
	}
?>
