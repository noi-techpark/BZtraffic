<?php
class BZTrafficWrapper{

    protected $cStation= NULL;
    protected $cDataType= array();
    protected $cStationDetail= NULL;
    protected $cRecord= array();
    protected $cRecordInTimeFrame= array();
    protected $cDateOfLastRecord= array();

    
    const URL='http://ipchannels.integreen-life.bz.it/LinkFrontEnd/rest';

    function get_stations(){
        if( $this->cStation == NULL ){
            $this->cStation = file_get_contents( (self::URL)."/get-stations" );
        }
        return $this->cStation;
    }

    function get_data_types($id){
        if( !isset($this->cDataType[$id]) ){
            $this->cDataType[$id] = file_get_contents( (self::URL)."/get-data-types?station=$id" );
        }
        return $this->cDataType[$id];
    }

    function get_station_details(){
        if( $this->cStationDetail == NULL ) {
            $this->cStationDetail= file_get_contents( (self::URL)."/get-available-stations" );
        }
        return $this->cStationDetail;
    }

    function get_records($id, $data_type, $seconds = 3600){
        $key= "/get-records?station=$id&name=$data_type&seconds=$seconds";
        if( !isset($this->cRecord[$key]) ){
            $this->cRecord[$key] = file_get_contents( (self::URL).$key );
        }
        return $this->cRecord[$key];
    }

    function get_records_in_timeframe($id, $data_type, $start_date, $end_date){
        $key= "/get-records-in-timeframe?station=$id&name=$data_type&from=$start_date&to=$end_date";
        if( !isset($this->cRecordInTimeFrame[$key]) ) {
            $this->cRecordInTimeFrame[$key]= file_get_contents( (self::URL).$key );
        }
        return $this->cRecordInTimeFrame[$key];
    }

    function get_date_of_last_record($id) {
        if( !isset($this->cDateOfLastRecord[$id]) ) {
            $this->cDateOfLastRecord[$id]= file_get_contents( (self::URL)."/get-date-of-last-record?station=$id" );
        }
        return $this->cDateOfLastRecord[$id];
    }
}
?>
