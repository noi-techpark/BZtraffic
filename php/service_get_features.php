<?
include_once 'bztrafficwrapper.php';
$bzwrapper= new BZTrafficWrapper();
echo $bzwrapper->get_station_details();
?>
