<?php
$data = file_get_contents('C:/Users/HP/AndroidStudioProjects/appnhathuoc/backend/firebase_data.json');
$url = 'https://appnhathuoc-6ba94-default-rtdb.asia-southeast1.firebasedatabase.app/.json';

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PUT");
curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_TIMEOUT, 15);

$response = curl_exec($ch);
curl_close($ch);
echo "OK: " . strlen($response);
?>