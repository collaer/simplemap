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


var ISO_A3_list = [];
var ISO_A3_27_LIST = [ 'ARG', 'BHS', 'BRB', 'BLZ', 'BOL', 'BRA', 'CHL', 'COL', 'CRI', 'DOM', 'ECU', 
'SLV', 'GTM', 'GUY', 'HTI', 'HND', 'JAM', 'MEX', 'NIC', 'PAN', 'PRY', 'PER', 'REG', 'SUR', 'TTO', 'URY', 'VEN'];
var ISO_A3_26_LIST = [ 'ARG', 'BHS', 'BRB', 'BLZ', 'BOL', 'BRA', 'CHL', 'COL', 'CRI', 'DOM', 'ECU', 
'SLV', 'GTM', 'GUY', 'HTI', 'HND', 'JAM', 'MEX', 'NIC', 'PAN', 'PRY', 'PER', 'SUR', 'TTO', 'URY', 'VEN'];

var countriesLayer;

var Markers = L.markerClusterGroup({
	chunkedLoading: true,
	spiderfyOnMaxZoom: false,
	showCoverageOnHover: false,
	zoomToBoundsOnClick: false
});

var mydatatablejson;
var markerOfOneIcon= new L.DivIcon({ html: '<div><span>1</span></div>', className: 'marker-cluster marker-cluster-small', iconSize: new L.Point(40, 40) });

var DATA_JSON = (window.location.href.indexOf("file:")==-1 ?
"./data/data.json"
:
"https://collaer.github.io/simplemap/data/data.json");


var COUTRIES_GEOJSON = (window.location.href.indexOf("file:")==-1 || true ?
"https://collaer.github.io/simplemap/data/LAC-countries.geojson"
:
"./DATA/countries2.geojson");

var jsonData;


$.getJSON(DATA_JSON).done(function(data) {
		
		data.features.forEach(function(f,i) { 
			//console.log(f);
		});
		
		jsonData = data;
		
		loadCountryList(jsonData);
		loadCountriesLayer();
		
		Markers.on('clusterclick', function(clut) {
			map.removeLayer(Markers);

			var getted = map.getLayerAt(map.latLngToContainerPoint(clut.latlng));
			
			if (getted)
				getted.openPopup();
			
			//Tasty
			setTimeout(function(){
				map.addLayer(Markers);
			},50);
		});
		
        countriesLayer.addTo(map);
        map.addLayer(Markers);
		L.control.layers(null, {'Numbers':Markers, 'Paises':countriesLayer}).addTo(map);	

	});


function loadCountryList(jsonData) {
	$.each(jsonData.features, function( key, operation ) {
		if (!ISO_A3_list.includes(operation.ISO_A3)) {
			ISO_A3_list.push(operation.ISO_A3);
		}
	});
};

function loadCountriesLayer(){
	countriesLayer = new L.GeoJSON.AJAX(COUTRIES_GEOJSON,{
		filter: function(feature, layer) {
			return ISO_A3_26_LIST.includes(feature.properties.ISO_A3);
		}
		,style: function(feature){
			var fillColor = (ISO_A3_list.includes(feature.properties.ISO_A3) ? "#41ab5d" : "#c7e9c0");
			return { color: "#999", weight: 1, fillColor: fillColor, fillOpacity: .69 };
		}
	}).on('data:loaded', function() {
		joinData();
	});
};

var ISO_A3_FILTER;
function countryFilter(feature, layer) {
  if (feature.ISO_A3 === ISO_A3_FILTER) return true;
};

var FilteredData;

function sortByCountry(a,b) {
	if (a.ISO_A3 === null) a.ISO_A3 = "";
	if (b.ISO_A3 === null) b.ISO_A3 = "";
    return (a.ISO_A3.toUpperCase() < b.ISO_A3.toUpperCase()) ? -1 : ((a.ISO_A3.toUpperCase() > b.ISO_A3.toUpperCase()) ? 1 : 0);
};

function getFilteredData() {
	/*var FilteredData = {
		"type": "FeatureCollection",
		"name": "Operations filtered",
		"features": []
	};
	$.each(operations.features, function(key, operation ) {
		if (Filters.check(operation.properties) )
		{
			operation.key = key;
			FilteredData.features.push(operation);
		}
	});
	
	FilteredData.features = FilteredData.features.sort(sortByCountry);
	*/
	
	return jsonData.features.sort(sortByCountry);
};


function joinData() {
	
	//**CLEANING STUFFF***
	mydatatablejson=[];
	Markers.clearLayers();
	
	FilteredData = getFilteredData();
	
	mydatatablejson = jsonData.features;
	var totalCounter = 0;
	countriesLayer.eachLayer(function(feature){
		
		ISO_A3_FILTER = feature.feature.properties.ISO_A3;
		
		var countriesOperationsFeatures = FilteredData.filter(countryFilter);
		var counter = 0;
		
		var popupTableContent = '';
		
		$.each(countriesOperationsFeatures, function(key, data ) {

			var title = data.title;

			var marker = L.marker(new L.LatLng(feature.getBounds().getCenter().lat, feature.getBounds().getCenter().lng), 
			  { title: title, icon: markerOfOneIcon });

			Markers.addLayer(marker);

			//********************************POPUP TABLE CONTENT********************
			counter++;
			styleFocus = '';
			
			popupTableContent += '\n'+
			'<tr>\n'+
			'<th scope="row">' + data.title + '</th>\n'+
			'<td>' + data.description + '</td>\n'+
			'<td>' + data.p1 + '</td>\n'+
			'<td>' + data.p2 + '</td>\n'+
			'<td>' + data.p3 + '</td>\n'+
			'<td>' + data.p4 + '</td>\n'+
			'</tr>';

		});

		popupTableContent = '<div>' + feature.feature.properties.ADMIN + ' : total ' + counter +'</div>\n'+
          '<table class="table table-striped table-dark table-popup" id="custom-table-id">\n'+
            '<thead>\n'+
              '<tr>\n'+
                '<th scope="col">title</th>\n'+
                '<th scope="col">info</th>\n'+
                '<th scope="col">p1</th>\n'+
                '<th scope="col">p1</th>\n'+
                '<th scope="col">p2</th>\n'+
                '<th scope="col">p3</th>\n'+
                '<th scope="col">p4</th>\n'+
              '</tr>\n'+
            '</thead>\n'+
            '<tbody>\n'+
        
		popupTableContent + '\n</tbody>\n</table>';
		
		feature.bindPopup(popupTableContent);
		
		totalCounter =+ counter;

	});
	
	//**CLOSING STUFFF***
	$('#loadedAlert').show();
	
	$('#loadedMsg')[0].innerHTML = "A total of " + totalCounter + " IDB Lab operations were loaded.";
	
	setTimeout(function(){
			$('#loadedAlert').fadeOut();
	}, 3500);
	
	if (Markers.getLayers().length > 0)
		map.flyToBounds(Markers.getBounds(), {maxZoom:6});
	
};