<?php
include_once 'bztrafficwrapper.php';
$bzwrapper= new BZTrafficWrapper();
$DAYS=31;
date_default_timezone_set("Europe/Rome");

// get_traffic 
// @param $id ( station id )
// ( in romanesco stretto )
// @return 0: no data, 1: low traffic, 2: se po' vive, 3: statte a casa 
function get_traffic($id){
   global $bzwrapper;
   $res= 0;
   $x= $bzwrapper->get_date_of_last_record($id);
   $json= $bzwrapper->get_records_in_timeframe($id, 'Bluetooth%20Count%20match', $x, $x );
   $avalue= json_decode($json, true);
   $hval= $avalue[0];
   $value= $hval['value'];
   if($value > 0 ){
        $limits= get_limits($id);
        if( $value <=  $limits['max-low'] ){
            $res= 1;
        }elseif( $value<= $limits['max-medium'] ){
            $res= 2;
        }else{
            $res= 3;
        }
   }
   return $res;
}

function get_range($id,$nday=1){
    global $bzwrapper;
    $res= array();
    // to
    $res[0]= $bzwrapper->get_date_of_last_record($id);
    // from   secOra * 1000 *24= 86400000
    $res[1]= $res[0]-(86400000*$nday);
    return $res;
}

function get_limits($id){
    global $bzwrapper, $DAYS;
    $res= array();
    $arange= get_range( $id, $DAYS );
    $json= $bzwrapper->get_records_in_timeframe($id, 'Bluetooth%20Count%20match', $arange[1], $arange[0]);
    $avalue= json_decode($json, true);
    $ares= array();
    $xmax= 0;
    $xsum= 0;
    $xcount=0;
    // ciclo i valori json per ottenere
    // la somma totale dei mezzi($xsum)
    // il massimo nr dei mezzi su quella strada ($xmax)
    // il conteggio dei rilevamenti ($xcount)
    // e carico $ares array per il calcolo della moda
    for($i=0; $xcount<count($avalue); $i++ ){
        $xcount+=1;
        $a= $avalue[$i];
        $value= $a['value'];
        if(!isset($ares[$value])) {
            $ares[$value]= 0;
        }
        $ares[$value]+=1;
        $xsum+= $value;
        if( $value>$xmax ){
            $xmax= $value;
        }
    }
    //calcolo la moda
    $xmode= 0;
    $vmax=0;
    foreach($ares as $key => $value ){
      if($value>$vmax){
        $vmax= $value;
        $xmode= $key;
      }
    }
    // linea verde fino alla media
    $res['max-low']=$xsum/$xcount;
    $res['max-medium']=($xmode+$xmax)/2;
    $res['min-high']=$res['max-medium']+1;
    return $res;
}

function get_last_velocity($id) {
    global $bzwrapper;
    $i= 0;
    $res= array();
    $json= $bzwrapper->get_records($id, "velocita'");
    $avalue= json_decode($json, true);
    if(count($avalue) > 1) {
        $i= count($avalue) -1;
        $res= $avalue[$i]['value'];
    }else{
        $res = 0;
    }
    
    return $res;
}

function get_velocities($id) {
    global $bzwrapper;
    $res= 0;
    $jres= array();
    $tsp_one = mktime(6, 00, 00, date('n'), date('j'), date('y')).'000';
    $tsp_two = mktime(date('G'), date('i'), 00, date('n'), date('j'), date('y')).'000';
    $json= $bzwrapper->get_records_in_timeframe($id, "velocita'", $tsp_one, $tsp_two);
    $avalue= json_decode($json, true);
    foreach($avalue as $key => $value ) {
        $timestamp= $value['timestamp'];
        $velocity= round($value['value']);
        $jres[]= array($timestamp, $velocity);
    }
    $res= json_encode($jres);
    return $res;
}

function get_trend_velocities($id) {
    global $bzwrapper;
    $DAYS= 31;
    $res= 0;
    $jres= array();
    $ares= array();

    for($i=1; $i<=$DAYS; $i++) {
        $tsp_one = mktime(6, 00, 00, date('n'), date('j')-$i, date('y')).'000';
        $tsp_two = mktime(22, 00, 00, date('n'), date('j')-$i, date('y')).'000';
        $json= $bzwrapper->get_records_in_timeframe($id, "velocita'", $tsp_one, $tsp_two);
        $avalue= json_decode($json, true);

        for($y=0; $y<count($avalue); $y++) {
            $tsec= $avalue[$y][timestamp] / 1000;
            $time= date('H:i', $tsec);
            $value= $avalue[$y]['value'];
            if(!isset($ares[$time][0])) {
                $ares[$time][0]= $value;
                $ares[$time][1]= 1;
            }else{
                $ares[$time][0]+= $value;
                $ares[$time][1]+= 1;
            }
        }
    }
    ksort($ares);
    foreach($ares as $key => $value) {
        $vaverage= $value[0] / $value[1];
        $time= explode(':', $key);
        $timestamp= mktime($time[0], $time[1], 0, date("n"), date("j"), date("Y"));
        $timestamp.= '000';
        //echo "$timestamp | $vaverage<br />";
        $jres[]= array($timestamp, $vaverage);
    }
    $res= json_encode($jres);
    return $res;
}
?>
