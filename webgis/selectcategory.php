<?php
include_once 'DBH.php';  
mysqli_set_charset($conn,"utf8");

if (mysqli_connect_errno())
  {
  echo "Failed to connect to MySQL: " . mysqli_connect_error();
  }

$sql = "SELECT * FROM activity WHERE category = 1 ";

if ($result = mysqli_query($conn,$sql))
  { $j = 0;//$music列的計數器(活動數目)
	 while ($row = mysqli_fetch_row($result))
    {
		
		for($i=0; $i<21 /*TAG數量暫定*/ ;$i++){
            //print_r($row[$i]);
			$music[$j][$i] = $row[$i];
		}
		//print_r($music[$j]);
		$j++;

		

    } 
  }
/*---------------------------------------------
 $query = 'INSERT INTO activity ( UID 0,title 1, category 2, time 3, location 4, locationName 5, onSales 6, price 7, 
		latitude 8, longitude 9, endTime 10, showUnit 11, discountInfo 12, descriptionFilterHtml 13, imageUrl 14 , masterUnit 15,  
		comment 16, editModifyDate 17, sourceWebName 18, startDate 19, endDate 20)
		--------------------------------------------------------------------------*/
# Build GeoJSON feature collection array
$geojson = array(
   'type'      => 'FeatureCollection',
   'features'  => array()
);		
		$activity_len = $j;
	 $tag_len = count($music[0]);	
for($i=0; $i< $activity_len ;$i++){
		for($k=0; $k<$tag_len  ;$k++){
         $row[$k]= $music[$i][$k];
		}
		 $feature = array(
        'id' => $row[0],
        'type' => 'Feature', 
        'geometry' => array(
            'type' => 'Point',
            # Pass Longitude and Latitude Columns here
            'coordinates' => array($row[9], $row[8])     
        ),
        # Pass other attribute columns here
        'properties' => array(
            'name' => $row[1],
            'category' => $row[2],
            'time' => $row[3],
            'location' => $row[4],
            'locationName' => $row[5],
            'onSales' => $row[6],
            'price' => $row[7],
            'endTime' => $row[10],
            'showUnit' => $row[11],
            'discountInfo' => $row[12],
			'descriptionFilterHtml' => $row[13],
			'imageUrl' => $row[14],
			'masterUnit' => $row[15],
			'comment' => $row[16],
			'editModifyDate' => $row[17],
			'sourceWebName' => $row[18],
			'startDate' => $row[19],
			'endDate' => $row[20]
            )
        );
    # Add feature arrays to feature collection array
	
    array_push($geojson['features'], $feature);
   }		 
	print_r( $geojson);
	
	$fp = fopen('music.geojson', 'w');
fwrite($fp, json_encode($geojson,JSON_UNESCAPED_UNICODE));
fclose($fp);
	 
//header('Content-type: application/json');
//echo json_encode($geojson, JSON_NUMERIC_CHECK);
//$conn = NULL; 
?>


		
