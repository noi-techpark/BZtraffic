var map, linksSource, linksLayer, extentDefault, view, clickCoordinate, popup, geolocation, trafficValue, machine_mv;
var features = [];
//var machine_mv = 8;     // (m/s) velocita' media macchina [ ~ 30 km/h ]
var bicycle_mv = 5;     // (m/s) velocita' media bicicletta [ 18 km/h ]

// Imposto gli stili per le linee
var styles = {
    'Default': [ new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: '#6D6C81',
            //color: '#999999',
            opacity: 0.6,
            width: 3
        }),
        zIndex: 1
    })],
    'NoData': [ new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: '#777777',
            width: 4
        }),
        zIndex: 999
    })],
    'Red': [ new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'brown',
            width: 4
        }),
        zIndex: 999
    })],
    'Green': [ new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'green',
            width: 4
        }),
        zIndex: 999
    })],
    'Orange': [ new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'orange',
            width: 4
        }),
        zIndex: 999
    })]
};


$(document).ready(function() {

    // Riempio l'array features con i dati relativi ai links
    $.ajax({
        dataType: "json",
        //url: 'http://ipchannels.integreen-life.bz.it/LinkFrontEnd/rest/get-station-details',
        url: '/php/service_get_features.php',
        async: false,
        success: function(data) {
            $.each( data, function( key, val) {
                var coordinates = [];
                $.each(val.coordinates, function(i, c) {
                    coordinates.push([c.lon, c.lat]);
                });
                var feature = {
                    'type': 'Feature',
                    'id': val.id,
                    'geometry': { 'type': 'LineString', 'coordinates': coordinates },
                    'properties': { 'name': val.name, 'origin': val.origin, 'destination': val.destination, 'length': val.length, 'street_ids_ref': val.street_ids_ref }
                };
                setFeatures(feature);
            });
        }
    }); // end - ajax


    // Riempio linksSource con tutti i dati delle stazioni (links)
    // secondo lo standard GeoJSON
    linksSource = new ol.source.GeoJSON({
                projection: 'EPSG:3857',
                object: {
                    'type': 'FeatureCollection',
                    'features': features
                }
    });


    // Creo il layer per la mappa con i tracciati dei links
    // (linksSource) e gli applico lo stile di default
    linksLayer = new ol.layer.Vector({
                source: linksSource,
                style: styles['Default']
    });

    extentDefault = linksSource.getExtent();

    // Creo la mappa e gli carico il livello con i tracciati 
    // dei links (linksLayer)
    map = new ol.Map({
                ol3Logo: false,
                target: 'map',
                renderer: 'canvas',
                interactions: ol.interaction.defaults({mouseWheelZoom:false}),
                controls: [],
                layers: [
                    new ol.layer.Tile({
                        source: new ol.source.MapQuest({layer: 'osm'})
                    }),
                    linksLayer
                ],
                view: new ol.View({
                    //center: ol.proj.transform([11.336, 46.491], 'EPSG:4326', 'EPSG:3857'),
                    center: ol.extent.getCenter( extentDefault ),
                    //maxZoom: 15,
                    minZoom: 11,
                    zoom: 14
                })
    /*}).on('click', function(evt) {
        clickCoordinate = evt.coordinate;
        console.info(clickCoordinate);*/
    });


    // Creo l'evento onclick sulla mappa
    map.on('click', function(evt) {
        var pixel = evt.pixel;
        var feature;

        clickCoordinate = evt.coordinate;   // Recupero le coordinate del punto in cui ho cliccato

        // Se clicco sulla mappa ed il popup e' aperto,
        // questo si chiude e porto l'estensione della mappa
        // come da default
        // disattivato per volere di Paolo
        /*if( $('#popup-pane > div').length > 0 ) {
            set_extent_view();
        }*/

        set_default_style();

        // Recupero la feature sulla quale ho cliccato
        feature = map.forEachFeatureAtPixel(pixel, function(feature, layer) {
            return feature;
        });

        // Imposto il colore della linea in base al valore del traffico
        if(typeof feature != 'undefined') {
            get_traffic_value( feature );
            //console.log('station_id: '+feature.getId());
        }
    });

    view = map.getView();

    geolocation = new ol.Geolocation({
        projection: view.getProjection()
    });

    // Colore tutti i link al primo caricamento della pagina
    $.each(features, function(index, feature) {
        //console.log(feature.id);
        var feature_id= feature.id;
        get_traffic_value2( feature_id );
    });


    /** New controller **/
    // Geolocation
    /*$('#locate').on('click', function(e) {
        e.preventDefault();
        console.log('geoLoc: '+geolocation.getAccuracy());
    });*/

    // Reload
    $('.update').click(function(e) {
        e.preventDefault();
        location.reload();
    });

    // Zoom
    $('.leaflet-control-zoom a').click(function(e) {
        var zoom = view.getZoom();
        var zoomType = $(this).attr('id');

        e.preventDefault();

        if(zoomType == 'control-zoom-in') {
            newZoom = zoom + 1;
        }else{
            newZoom = zoom - 1;
        }

        view.setZoom(newZoom);
    });

    // Modifico il cursore se il mouse va sopra una linea
    map.on("pointermove", function(evt) {
        var hit= this.forEachFeatureAtPixel(evt.pixel, 
            function(feature, layer) {
                return true;
            });

        if(hit) {
            $('#map').css('cursor', 'pointer');
        }else{
            $('#map').css('cursor', '');
        }
    });

});

// Riempio features[] con i dati relativi ai links
function setFeatures(feature) {
    features.push( feature );
    //console.log(feature);
}


function set_extent_view() {
    view.fitExtent(extentDefault, map.getSize());
}


function show_feature_selected( feature ) {
    var html;
    var id = feature.getId();
    var extent = feature.getGeometry().getExtent()                      // Coordinate della massima estensione della stazione selezionata
    var firstCoord = feature.getGeometry().getFirstCoordinate();        // Coordinate del primo punto
    var lastCoord = feature.getGeometry().getLastCoordinate();          // Coordinate dell'ultimo punto
    var details = get_station_details( feature );                       // Recupero i dettagli della stazione selezionata
    var linkLength = feature.get('length');                             // Recupero la lunghezza del tracciato (link)
    var machineValue = get_machine_value( linkLength );                 // Recupero i tempi di percorrenza della macchina
    var bicTime = get_bicycle_time( linkLength );                       // Recupero i tempi di percorrenza della bicicletta
    var oppositeStationId = get_opposite_station( feature );            // Recupero l'id della stazione opposta
    var popupContent;

    // Modifico la view sulla base delle coordinate (extent) della linea selezionata
    view.setCenter( extent );
    view.fitExtent( extent, map.getSize() );
    view.setZoom(15);

    $(".markers").parent().remove();
    var mA = "<div id='marker_a' class='markers'><img src='images/img-pin/pin-A.png' /></div>";
    $("#map").append(mA);
    var mB = "<div id='marker_b' class='markers'><img src='images/img-pin/pin-B.png' /></div>";
    $("#map").append(mB);

    /** Markers **/
    // Inserisco il marker "a" in prossimita' della prima coordinata (firstCoord)
    map.addOverlay(new ol.Overlay({
        element: document.getElementById('marker_a'),
        offset: [-15, -54],
        position: firstCoord
    }));
    //console.log('firstCoord :'+ol.proj.transform(firstCoord, 'EPSG:3857', 'EPSG:4326'));

    // Inserisco il marker "b" in prossimita' dell'ultima coordinata (lastCoord)
    map.addOverlay(new ol.Overlay({
        element: document.getElementById('marker_b'),
        offset: [-15, -54],
        position: lastCoord
    }));
    //console.log('lastCoord :'+ol.proj.transform(lastCoord, 'EPSG:3857', 'EPSG:4326'));
    /** end - Markers **/

    set_link_color( feature, machineValue.link_value );

    // Creo il popup e lo posiziono in corrispondenza delle coordinate 
    // del click del mouse (clickCoordinate)
    popup = new ol.Overlay({
        element: document.getElementById('popup-pane'),
        //position: ol.extent.getCenter( feature.getGeometry().getExtent() ),
        position: clickCoordinate,
        offset: [-210, -237]
    });
    map.addOverlay( popup );

    //console.log('data_type: '+machineValue.ttype);
    //console.log('time: '+machineValue.time+' min');

    // Riempio il popup
    popupContent = "<div class='leaflet-popup leaflet-zoom-animated' style='opacity: 1;'>";
    popupContent += "<a class='leaflet-popup-close-button' href='#close' onclick='closePopup(event);'>×</a>";
    popupContent += "<div class='leaflet-popup-content-wrapper'>";
    popupContent += "<div class='leaflet-popup-content'>";
    popupContent += "<h2>"+details.name+"</h2>";
    popupContent += "<span class='direction'><span tkey='direzione'>Direzione</span>: <span class='from'>A</span><span class='arrow'></span><span class='to'>B</span>";

    if(oppositeStationId != false) {
        popupContent += "<span class='reverse' onclick='show_opposite_station("+oppositeStationId+");'>(<span tkey='inverti-direzione'>inverti direzione</span>)</span>";
    }

    popupContent += "</span>";
    popupContent += "<div class='slots-container'>";
    popupContent += "<strong class='available-slots "+machineValue.style+"'><span class='number'>"+machineValue.time+"</span> min";

    if(machineValue.ttype == 'deduced') {
        popupContent += " * ";
    }
    popupContent += "<span>"+machineValue.text+"</span><span class='transport car'>con macchina</span></strong>";
    popupContent += "<strong class='available-slots available last'><span class='number'>"+bicTime+"</span> min <span tkey='scelta-green'>scelta green</span><span class='transport bicycle'>con bicicletta</span></strong>";
    popupContent += "</div>";
    popupContent += "<div class='trend'>";

    if(machineValue.ttype == 'deduced') {
        popupContent += "<h4 id='note_deduced'>* <span tkey='velocita-calcolata'>velocità calcolata sulla base del numero dei veicoli passanti</span></h4>";
    }else{
        popupContent += "<h3 class='open' onclick='handle_graph("+id+","+linkLength+");'><lang tkey='vedi-grafico'>Vedi grafico</lang> <strong>trend</strong></h3>";
        popupContent += "<div class='graph'>";
        popupContent += "<div class='input'>";
        popupContent += "<label for='today' class='today' tkey='tempo-medio-oggi'>Tempo medio di oggi</label>";
        popupContent += "</div>";
        popupContent += "<div id='trend-graph' style='width: 368px; height: 148px;'></div>";
        popupContent += "</div>";
    }

    popupContent += "</div>";
    popupContent += "</div>";
    popupContent += "</div>";
    popupContent += "<div class='leaflet-popup-tip-container'><div class='leaflet-popup-tip'></div></div></div>";

    // Visualizzo il popup
    $("#popup-pane").html(popupContent).css('display','block');

    // Imposto la traduzione
    setTranslate();
}

function show_opposite_station( id ) {
    var feature = linksSource.getFeatureById(id);

    set_default_style();
    get_traffic_value(feature);
}

function get_opposite_station( feature ) {
    var origin = feature.get('origin');
    var destination = feature.get('destination');
    var res = false;

    linksSource.forEachFeature( function(f) {
        var o = f.get('origin');
        var d = f.get('destination');
        if(origin == d && destination == o) {
            res = f.getId();
        }
    });
    return res;
}

function get_station_details( feature ) {
    var details = [];
    var links = '';
    var station = feature.get('name');

    details['id'] = feature.getId();

    if(station.indexOf('->') > 0) {
        if( station.indexOf('(') > 0 ) {
            var index1 = station.indexOf('(')
            var index2 = station.indexOf(')');
            details['name'] = station.substring(0, index1).trim();
            links = station.substring(index1+1, index2);
        }else{
            details['name'] = station;
            links = station;
        }
        links = links.split('->');
        details['pA'] = links[0].trim();
        details['pB'] = links[1].trim();
    }else{
        details['name'] = station;
        details['pA'] = 'n.d.';
        details['pB'] = 'n.d.';
    }

    details['origin'] = feature.get('origin');
    details['destination'] = feature.get('destination');

    return details;
}

function set_default_style() {
    linksSource.forEachFeature(function(f) {
        f.setStyle(styles['Default'])
    });

    $('#popup-pane > div').remove();
    $(".markers").parent().remove();
}

function get_traffic_value( feature ) {
    var id = feature.getId()
    //console.log('station_id: '+id);

    $.ajax({
        url: '/php/service_get_traffic.php',
        beforeSend: set_loading_animation('on'),
        type: "GET",
        data: { id: id },
        //async: false,
        success: function(data) {
            //console.log('traffic: '+data);
            set_traffic_value( data );
            set_loading_animation('off');

            get_machine_velocity(id);
            show_feature_selected( feature );
        }
    });
}

function get_traffic_value2( feature_id ) {
    $.ajax({
        url: '/php/service_get_traffic.php',
        type: "GET",
        data: { id: feature_id },
        //async: false,
        success: function(data) {
            var value= data;
            //console.log(feature_id+'=> traffic: '+value);
            var velocity= get_machine_velocity2( feature_id );
            //console.log(feature_id+'=> velocity: '+velocity);
            var feature= linksSource.getFeatureById(feature_id);

            if(velocity > 0) {
                if( velocity <= 15 ) {
                    value= 3;
                }else if( velocity <= 35 ){
                    value= 2;
                }else{
                    value= 1;
                }
            }

            if(value == 1) feature.setStyle(styles['Green']);
            else if(value == 2) feature.setStyle(styles['Orange']);
            else if(value == 3) feature.setStyle(styles['Red']);
            else feature.setStyle(styles['NoData']);
        }
    });
}

function set_link_color( feature, linkValue ) {
    if(linkValue == 1) feature.setStyle(styles['Green']);
    else if(linkValue == 2) feature.setStyle(styles['Orange']);
    else if(linkValue == 3) feature.setStyle(styles['Red']);
    else feature.setStyle(styles['NoData']);
}

function set_traffic_value( value ) {
    trafficValue = value;
}

function get_machine_velocity( id ) {
    $.ajax({
        data: { id: id },
        url: '/php/service_get_last_velocity.php',
        async: false,
        success: function(data) {
            set_machine_velocity(data);
        }
    });
}

function get_machine_velocity2( id ) {
    var velocity;
    $.ajax({
        data: { id: id },
        url: '/php/service_get_last_velocity.php',
        async: false,
        success: function(data) {
            velocity= data;
        }
    });
    return velocity;
}

function set_machine_velocity( value ) {
    machine_mv = value;
}

function get_machine_value( linkLength ) {
    var tV = parseInt(trafficValue);
    var mV, ts, tm;
    var res= [];
    machine_mv = parseInt(machine_mv);

    // se ho i dati realistici della velocita'
    // confronto questi per determinare il traffico
    // altrimenti utilizzo il valore di trafficValue
    if( machine_mv > 0 ) {
        res['ttype'] = 'realistic';
        mV = machine_mv;
    }else{
        res['ttype'] = 'deduced';
        if(tV <= 1) {
            mV = 40;
        }else if(tV == 2) {
            mV = 30;
        }else if(tV == 3) {
            mV = 20;
        }else{
            mV = 0;
        }
    }

    if(mV > 0) {
        if( mV <= 15 ) {
            //console.log('situation: traffico');
            res['style'] = 'full';
            res['text'] = "<lang tkey='traffico'>traffico</lang>";
            res['link_value'] = 3;
        }else if(mV <= 35 ) {
            //console.log('situation: rallentamenti');
            res['style'] = 'almost-full';
            res['text'] = "<lang tkey='rallentamenti'>rallentamenti</lang>";
            res['link_value'] = 2;
        }else{
            //console.log('situation: libero');
            res['style'] = 'available';
            res['text'] = "<lang tkey='libero'>libero</lang>";
            res['link_value'] = 1;
        }

        //mV = Math.round( mV / 3.6 );
        mV = mV / 3.6;
        ts = (linkLength / mV);          // calcolo i tempi di percorrenza in secondi
        tm = Math.round( ts / 60 );      // trasformo i tempi di percorrenza da secondi a minuti
        res['time'] = tm;
    }else{
        res['style'] = '';
        res['text'] = 'n.d.';
        res['time'] = '-';
    }

    return res;
}

function get_bicycle_time( linkLength ) {
    var ts = linkLength / bicycle_mv;
    var tm = ts/60;
    tm = Math.round(tm);
    return tm;
}

function set_loading_animation( status ) {
    if(status == 'on') {
        $('#load-wrapper').css('display', 'block');
    }else{
        $('#load-wrapper').css('display', 'none');
    }
}


// Close popup
function closePopup(e) {
    e.preventDefault();
    set_default_style();
    // Disattivato per volere di Paolo
    //set_extent_view();
}


function handle_graph( id, linkLength ) {
    $('.trend h3').toggleClass('open').next().slideToggle('fast');
    if(!$('.trend h3').hasClass('open')) {
        $(this).html('Chiudi');
        popup.setOffset( [-210, -400] );
        get_graph( id, linkLength );
    }else{
        $(this).html('Vedi grafico <strong>trend</strong>');
        popup.setOffset( [-210, -237] );
    }
}


function get_graph( id, linkLength ) {
    var yA= Math.round( ( linkLength / ( 35/3.6 ) ) / 60 );
    var yB= Math.round( ( linkLength / ( 15/3.6 ) ) / 60 );

    var date= new Date();
    var d= date.getDate();
    var m= date.getMonth();
    var y= date.getFullYear();
    var h= date.getHours();
    var minD= new Date(y, m, d, 5, 30, 0).getTime();
    var maxD= new Date(y, m, d, h+1, 0, 0).getTime();

    var val = get_graph_data( id, linkLength );
    //var d1 = [ [6.00, 1], [8.00, 3], [10.00, 2], [14.00, 3], [16.00, 4], [18.00, 7] ];

    var data = [{ 
                color: '#009cdd', 
                data: val,
                lines: {show: true}, 
                points: {show: true, fill: true, fillColor: '#ffffff'}
    }];
    var options = {
                grid: {
                    show: true,
                    color: '#ffffff',
                    backgroundColor: '#ffffff',
                    markings: [
                        { yaxis: { from: 0, to: yA }, color: '#eaf3e2' }, 
                        { yaxis: { from: yA, to: yB }, color: '#fdecd2' }, 
                        { yaxis: { from: yB }, color: '#ffddde' } 
                    ]
                    //hoverable: true
                },
                xaxes: [ {min: minD} ],
                yaxes: [ {min: 0} ],
                xaxis: { mode:"time", timezone: "browser", minTickSize: [2, "hour"], min: minD, max: maxD },
                yaxis: { axisLabel: 'min' } // Utilizza la libreria jquery.flot.axislabels.js
                //zoom: { interactive: true }
                //pan: { interactive: true },
    };

    $.plot("#trend-graph", data, options);
    /*$("#trend-graph").bind("plothover", function(event, pos, item) {
        //var m= item.datapoint[1];
        if(item) {
            console.log( item.datapoint[1] );
            console.log( pos.x );
        }
    });*/
}

function get_velocities( id ) {
    var res;
    $.ajax({
        dataType: "json",
        url: '/php/service_get_velocities.php',
        type: "GET",
        data: { id: id },
        async: false,
        success: function(data) {
            res = data;
        }
    });
    return res;
}

function get_graph_data(id, linkLength) {
    var j= get_velocities(id);
    var res= [];

    // v(m/s)= v(km/h) / 3.6
    // t(s)= l / v(m/s)
    // t(m)= t(s) / 60

    for(var i= 0; i< j.length; i++) {
        //console.log(i+': '+j[i][0]);
        var t, v, m;
        t= j[i][0];
        v= j[i][1] / 3.6;
        m= Math.round( (linkLength/v)/60 );
        res[i]= [t, m];
        //console.log( new Date(t) );
    }

    return res;
}
