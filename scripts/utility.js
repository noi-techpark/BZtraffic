function initTooltip(){
	// Remove TEL link on desktop
    var width = $(window).width();
    if( width >= 768) {
        $('.phone a').each(function(){
            var tel = $(this).html();
            $(this).replaceWith('<span>'+tel+'</span>');
        });
    }

    // Handle graph
    /*$('.trend h3').on('click',function(){
        $(this).toggleClass('open').next().slideToggle('fast');
        if(!$(this).hasClass('open')){
            $(this).html('Chiudi');
        }else{
            $(this).html('Vedi grafico <strong>trend</strong>');
        }
    });*/
};

function overlayDropdown (e){
	$('.overlay-dropdown').on('click',function(){
		e.click();
		$('.overlay-dropdown').remove();
	});	
};

function setGodown() {
	$(window).scroll(function(){
		if($(document).scrollTop() > 60){
			$('#go-down').fadeOut();
		}else{
			$('#go-down').fadeIn();
		}
	});
	$('#go-down').click(function(){
		$.scrollTo($('#aside'),500,{
			offset: {top:0},
			axis: 'y'
		});
	});
}

function setMapHeight() {
    mapHeight = $(window).outerHeight() - 79;
    $('#map').height(mapHeight);
}

$(document).ready(function() {

	/*// create a map in the "map" div, set the view to a given place and zoom
	var map = L.map('map', {
	    center: [46.4975863, 11.3558955],
	    zoom: 15,
	    scrollWheelZoom: false
	});
	
	// add an OpenStreetMap tile layer
	L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
	    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(map);*/
	
	// add a marker in the given location, attach some popup content to it and open the popup
	/*L.marker([46.4975863, 11.3558955]).addTo(map)
	    .bindPopup('Bolzano città. <br> Tooltip.')
	    .openPopup();*/


    /*// Test GeoJSON
    var geojsonFeature = {
        "type": "Feature",
        "properties": {
            "name": "station1",
            "origin": "via Druso",
            "destination": "Ponte Resia"
        },
        "geometry": {
            "type": "LineString",
            "coordinates": [ [11.3238, 46.4813], [11.3225, 46.4822], [11.3210, 46.4833], [11.3206, 46.4838] ]
        }
    };
    
    var styles = {
        "fillColor": "white",
        "color": "brown",
        "weight": 5,
        "opacity": 0.65,
        "className": "lineClass"
    };

    //L.geoJson(geojsonFeature).addTo(map);
    L.geoJson(geojsonFeature, {style: styles}).addTo(map);*/


	$('.actions .time span,.carpark-selector span,.lang span').on('click',function(){
		if(!$(this).hasClass('open')){
			var docHeight = $(document).height();
			$('<div class="overlay-dropdown" style="width:100%;height:'+docHeight+'px;position:absolute;top:0;left:0;bottom:0;right:0;z-index:120"></div>').appendTo('body');
			overlayDropdown(this);
		} else {$('.overlay-dropdown').remove();}
		$(this).toggleClass('open').next().fadeToggle('fast');
	});

	initTooltip();




	panelScrollElement = Array();
	
	device = detectDevice();
 	
	//if(device[0] == 'desktop'){
	if(device[0] == 'smartphone'){
		$('#main').append('<span id="go-down" />');
		setGodown();
		setMapHeight();
	}

	//----------------------
	//on orientation change
	//----------------------
	
	function onOrientationChange(){
		setTimeout(function(){
			//init(true);
			if(device[0] == 'smartphone'){
				setMapHeight();
			}
			setGodown();
		},20);
	}
	
	//android don't support orientationchange but resize
	var supportsOrientationChange = "onorientationchange" in window,
    orientationEvent = supportsOrientationChange ? "orientationchange" : "resize";

	$(window).bind(orientationEvent, function(){
		onOrientationChange();
	});


    // Cambio lingua - gp
    setLangMenu();

    $('.lang li a').on('click', function(e) {
        e.preventDefault();
        var lang= $(this).text();
        // Imposto il cookie 'lang' con la lingua selezionata
        document.cookie= "lang="+lang;
        // Chiudo il menu
        $('.lang span').toggleClass('open').next().fadeToggle('fast');
        // Modifico il menu delle lingue
        setLangMenu();
        // Imposto la traduzione
        setTranslate();
    });

    function setLangMenu() {
        var langActive;
        var co= document.cookie;
        var indx= co.indexOf("lang=");
        if(indx > -1) {
            langActive= co.substring(indx+5,indx+7);
        }else{
            langActive = navigator.language.substr (0, 2);
            langActive= langActive.toUpperCase();
        }
        $('.lang span').text(langActive);
        $('.lang li').show();
        $('.lang li a:contains("'+langActive+'")').parent().hide();
    }

	// ---- Link esterno ----------------------------------------------------------------------------------------------------------
	$("a[href*='http://']:not([href*='"+location.hostname+"']),[href*='https://']:not([href*='"+location.hostname+"'])").attr("target","_blank");
});
