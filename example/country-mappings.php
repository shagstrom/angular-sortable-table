<?php
	header('Content-Type: application/json');
	include('country-mappings.inc');
	echo json_encode($country_mappings);
?>