var IDBLabHQ = {lat: 38.89943694195807, lng: -77.03052163124086};

var map = L.map('map',{
  zoomControl: false
}).setView(IDBLabHQ,10);
		
var mapLink =
	'<a href="http://openstreetmap.org">OSM</a> | <a href="https://bidlab.org/en">IDB Lab</a> | <a href="https://github.com/collaer">code</a>';
var baseMap = L.tileLayer(
	'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	attribution: '&copy; ' + mapLink + ' ',
	maxZoom: 18,
	});
		
baseMap.addTo(map);
		

//FROM https://leafletjs.com/examples/extending/extending-3-controls.html
L.Control.Watermark = L.Control.extend({
	onAdd: function(map) {
		var img = L.DomUtil.create('img');
		img.src = 'https://bidlab.org/sites/default/files/inline-images/animacion-IDB-Lab.gif';
		img.style.width = '200px';
		img.id = "idblab-logo";

		return img;
	},

	onRemove: function(map) {
		// Nothing to do here
	}
});

L.control.watermark = function(opts) {
	return new L.Control.Watermark(opts);
};


L.control.watermark({ position: 'bottomleft' }).addTo(map);
	  

$.urlParam = function(name){
	var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
	return (results ? (results[1] || 0) : 0);
};


$(document).ready(function () {
	$('#loadedAlert').hide();
	
	/*
	setTimeout(function(){
		$('#welcomeAlert').fadeOut();
	}, 2500);
	*/		


    $('#sidebarCollapse').on('click', function () {
        $('#sidebar, #content').toggleClass('active');
		setTimeout(function(){ map.invalidateSize()}, 400);
    });
	

	$(function () {
	  $('[data-toggle="popover"]').popover();
	});
	
	$(function () {
		$('[data-toggle="tooltip"]').tooltip()
	});
	
	$('#exampleModalCenter').on('show.bs.modal', function (e) {

		$('#datatable').bootstrapTable(
			'load', mydatatablejson
		);

	});
	
	
	$('.alert .close').on('click', function(e) {
		$(this).parent().hide();
	});
	

});


var DATA_JSON = (window.location.href.indexOf("file:")==-1 ?
"./data/data.json"
:
"https://collaer.github.io/simplemap/data/data.json");


var COUTRIES_GEOJSON = (window.location.href.indexOf("file:")==-1 || true ?
"https://collaer.github.io/simplemap/data/LAC-countries.geojson"
:
"./DATA/countries2.geojson");

var operations;

$.getJSON(DATA_JSON).done(function(data) {
		
		console.log('done');
		
		data.features.forEach(function(f,i) { 
			console.log(f);
		});
		
		operations = data;
		
		loadCountryList(operations);
		loadCountriesLayer();
		/*
		operationsMarkers.on('clusterclick', function(clut) {

			map.removeLayer(operationsMarkers);

			var getted = map.getLayerAt(map.latLngToContainerPoint(clut.latlng));
			
			//console.log(getted);
			if (getted)
				getted.openPopup();
			
			//Mhhhhh
			setTimeout(function(){
				map.addLayer(operationsMarkers);
			},50);

		});*/
		
        countriesLayer.addTo(map);
        //map.addLayer(operationsMarkers);
		//L.control.layers(null, {'Numbers':operationsMarkers, 'Paises':countriesLayer}).addTo(map);	
		//$('.custom-select').trigger('change');
	});


var ISO_A3_list = [];
var countriesLayer;

function loadCountryList(operations) {
	$.each(operations.features, function( key, operation ) {
		if (!ISO_A3_list.includes(operation.ISO_A3)) {
			ISO_A3_list.push(operation.ISO_A3);
		}
	});
};

function loadCountriesLayer(){
	countriesLayer = new L.GeoJSON.AJAX(COUTRIES_GEOJSON
	,{
		filter: function(feature, layer) {
			return ISO_A3_list.includes(feature.properties.ISO_A3);
		}
		/*,style: function(feature){
			var counter = 0;
			var fillColor;

			$.each(operations.features, function( key, operation ) {
				if (operation.ISO_A3 == feature.ISO_A3 && Filters.check(operation)) {
					counter++;
				};
			});
			
			if ( counter - choroplethScaler.base >= 55*choroplethScaler.ratio ) fillColor = "#00441b";
			else if ( counter - choroplethScaler.base >= 34*choroplethScaler.ratio ) fillColor = "#006d2c";
			else if ( counter - choroplethScaler.base >= 21*choroplethScaler.ratio ) fillColor = "#238b45";
			else if ( counter - choroplethScaler.base >= 13*choroplethScaler.ratio ) fillColor = "#41ab5d";
			else if ( counter - choroplethScaler.base >= 8*choroplethScaler.ratio ) fillColor = "#74c476";
			else if ( counter - choroplethScaler.base >= 5*choroplethScaler.ratio ) fillColor = "#a1d99b";
			else if ( counter - choroplethScaler.base >= 3*choroplethScaler.ratio ) fillColor = "#c7e9c0";
			else if ( counter - choroplethScaler.base >= 2*choroplethScaler.ratio ) fillColor = "#e5f5e0";
			else if ( counter - choroplethScaler.base >= 1*choroplethScaler.ratio ) fillColor = "#f7fcf5";
			else fillColor = "#f7f7f7";  // no data

			return { color: "#999", weight: 1, fillColor: fillColor, fillOpacity: .79 };
		}*/
	}).on('data:loaded', function() {
		//joinData();
	});
};

/*
function countryFilter(feature, layer) {
  if (feature.ISO_A3 === ISO_A3_FILTER) return true;
};*/