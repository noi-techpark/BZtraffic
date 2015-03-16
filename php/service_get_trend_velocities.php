<?php
include_once 'bztraffic.php';
$id= $_GET['id'];
if(isset( $id )) {
    echo get_trend_velocities($id);
}
?>
