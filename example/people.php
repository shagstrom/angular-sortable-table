<?php
	header('Content-Type: application/json');
	include('country-mappings.inc');
	include('mergesort.inc');
	$people = array(
		array( "name" => "Amelia", "age" => 56, "countryCode" => "BY" ),
		array( "name" => "Isabella", "age" => 58, "countryCode" => "BY" ),
		array( "name" => "Bailey", "age" => 58, "countryCode" => "BY" ),
		array( "name" => "Abbey", "age" => 57, "countryCode" => "AT" ),
		array( "name" => "Harper", "age" => 78, "countryCode" => "AT" ),
		array( "name" => "Grace", "age" => 78, "countryCode" => "AT" ),
		array( "name" => "Alice", "age" => 77, "countryCode" => "TH" ),
		array( "name" => "Dennis", "age" => 67, "countryCode" => "UA" ),
		array( "name" => "Ella", "age" => 45, "countryCode" => "UA" ),
		array( "name" => "Philip", "age" => 43, "countryCode" => "UA" ),
		array( "name" => "Tom", "age" => 20, "countryCode" => "UG" ),
		array( "name" => "Tom", "age" => 54, "countryCode" => "TO" ),
		array( "name" => "Bernie", "age" => 54, "countryCode" => "SZ" ),
		array( "name" => "Betty", "age" => 56, "countryCode" => "SZ" ),
		array( "name" => "Patrick", "age" => 84, "countryCode" => "TW" ),
		array( "name" => "John", "age" => 34, "countryCode" => "GQ" ),
		array( "name" => "Sahra", "age" => 36, "countryCode" => "GH" ),
		array( "name" => "Desmond", "age" => 19, "countryCode" => "GR" ),
		array( "name" => "Carole", "age" => 25, "countryCode" => "GH" ),
		array( "name" => "Annie", "age" => 25, "countryCode" => "GQ" )
	);
	foreach (explode(",", $_GET['sort']) as $sortItem) {
		$parts = explode(":", $sortItem);
		$name = $parts[0];
		$dir = $parts[1];
		mergesort($people, function ($arrA, $arrB) use ($country_mappings, $name, $dir){
			$a = $arrA[$name];
			$b = $arrB[$name];
			if ($name == "countryCode") {
				$compare_value = strcmp($country_mappings[$a], $country_mappings[$b]);
			} elseif (is_numeric($a)) {
				$compare_value = $a - $b;
			} else {
				$compare_value = strcmp($a, $b);
			}
			return $dir == "asc" ? $compare_value : -$compare_value;
		});
	}
	$offset = intval($_GET['offset']);
	$limit = intval($_GET['limit']);
	if ($limit == 0) {
		$limit = 100;
	}
	echo json_encode(array_slice($people, $offset, $limit));
?>