<!DOCYPE html>
<html>
<head>
    <title></title>
</head>
<body>

<?php
include_once 'DBH.php';  

mysqli_set_charset($conn,"utf8"); // Set the charset to utf8 設定編碼爲utf8
$url = "https://cloud.culture.tw/frontsite/trans/SearchShowAction.do?method=doFindTypeJ&category=6&fbclid=IwAR29Q4ujUKkHv6HY9ew_OIECUQqcyxylyXROLRO7Hi31AXGNtUB6gs1-rCc";
$url_len = strlen($url);

$c = strpos($url,"category");
$url_a = substr($url, 0, $c+9);
$url_b = substr($url, $c+10,$url_len-$c+10);

for($h=1; $h<19;$h++){
	$k = (string)$h;
	$url_combine =$url_a.$k.$url_b;
	$data =file_get_contents($url_combine);

	$tag=array("UID\"","title\"","category\"","time\"","location\"","locationName\"","onSales\"","price\"","latitude\"","longitude\"","endTime\"","showUnit\"","discountInfo\"","descriptionFilterHtml\"","imageUrl\"","masterUnit\"","comment\"","editModifyDate\"","sourceWebName\"","startDate\"","endDate\"");
	$new_data=array();

	$data_len =  strlen($data);
	$tag_len = count($tag);
	

	for($i=0; $i<$tag_len;$i++){
		$start=0;
		$var_ = array();
		while($start<=$data_len){
			$start = strpos($data,$tag[$i],$start);
			if($start == 0){ 
				break;
			};
			$len = strlen($tag[$i]);
			$start = $start+$len+1;
			$start = strpos($data,"\"",$start);
			$end = strpos($data,"\"",$start+1);
			$var_sep = substr($data,$start+1, $end-$start-1);
			array_push($var_,$var_sep );
		};
		array_push($new_data,$var_);
	}
	//for($i=0; $i<$tag_len  ;$i++){
	//print_r($new_data[$i]);
	//}
	
	$new_data2 = $new_data;
	$activity_len = count($new_data[0]);
	echo $activity_len."<br>";
	for($i=0; $i< $activity_len ;$i++){
		for($j=0; $j<$tag_len  ;$j++){
			$new_data[$j]= $new_data2[$j][$i];
		}
		
		   $query = 'INSERT INTO activity ( UID,title , category, time, location, locationName, onSales, price, 
		latitude, longitude, endTime, showUnit, discountInfo, descriptionFilterHtml, imageUrl, masterUnit,  
		comment, editModifyDate, sourceWebName, startDate, endDate)
	VALUES ("' . $new_data[0] . '", "' . $new_data[1] . '", "' . $new_data[2].'", "' . $new_data[3] . '", "' . $new_data[4] . '", "' . $new_data[5] . '", "' . $new_data[6] . '", "' . $new_data[7] . '"
		  , "' . $new_data[8] . '", "' . $new_data[9] . '", "' . $new_data[10] . '", "' . $new_data[11] . '", "' . $new_data[12] . '", "' . $new_data[13] . '", "' . $new_data[14] . '", "' . $new_data[15] . '"
		  , "' . $new_data[16] . '", "' . $new_data[17] . '", "' . $new_data[18] . '", "' . $new_data[19] . '", "' . $new_data[20] . '");';
		
		$result = mysqli_query($conn, $query);

		if ($result == false)
		{
			/*echo 'Error description <br/>' . mysqli_error($conn);*/
		}
	}
}
?>
</body>
</html>
