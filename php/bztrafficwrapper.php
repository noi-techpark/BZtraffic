<?
class BZTrafficWrapper{
    const URL='http://ipchannels.integreen-life.bz.it/LinkFrontEnd/rest';

    function get_stations(){
        return file_get_contents( (self::URL)."/get-stations" );
    }

    function get_data_types($id){
        return file_get_contents( (self::URL)."/get-data-types?station=$id" );
    }

    function get_station_details($id=0){
        if($id>0){
            $url="/get-station-details?station=$id";
        }else{
            //$url="/get-station-details";
            $url="/get-available-stations";
        }
        return file_get_contents( (self::URL).$url );
    }

    function get_records($id, $data_type, $seconds = 3600){
        return file_get_contents( (self::URL)."/get-records?station=$id&name=$data_type&seconds=$seconds" );
    }

    function get_records_in_timeframe($id, $data_type, $start_date, $end_date){
        return file_get_contents( (self::URL)."/get-records-in-timeframe?station=$id&name=$data_type&from=$start_date&to=$end_date" );
    }

    function get_date_of_last_record($id){
        return file_get_contents( (self::URL)."/get-date-of-last-record?station=$id" );
    }
}
?>
