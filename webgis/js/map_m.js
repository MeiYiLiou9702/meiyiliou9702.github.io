proj4.defs('EPSG:3826', "+title=二度分帶：TWD97 TM2 台灣 +proj=tmerc  +lat_0=0 +lon_0=121 +k=0.9999 +x_0=250000 +y_0=0 +ellps=GRS80 +units=公尺 +no_defs");
proj4.defs('urn:ogc:def:crs:OGC:1.3:CRS:84',  proj4.defs('EPSG:4326'));
proj4.defs('urn:ogc:def:crs:EPSG::3826',      proj4.defs('EPSG:3826'));
ol.proj.proj4.register(proj4);

var init_lat=23.62;   //23.750815, 121.027538
var init_lng=120.5;
var zoom=8;
var user_location=null;
var view = new ol.View({
  center: ol.proj.transform([init_lng, init_lat], 'EPSG:4326', 'EPSG:3857'),
  zoom: zoom,
  minZoom: 8,
  maxZoom: 14,
  extent: ol.proj.transformExtent([119.8, 21,122.07, 25.3], 'EPSG:4326', 'EPSG:3857')/**/
});
var map = new ol.Map({
  layers: [],
  target: 'map',
  view: view,
  interactions: ol.interaction.defaults({ doubleClickZoom: false }),
});

//for Geolocation
var geolocation = new ol.Geolocation({
  tracking: true,
  projection: map.getView().getProjection()
});
geolocation.on('change:position', function() {
  if(user_location==null){
    user_location= geolocation.getPosition();  
    map.getView().setCenter(user_location);
    map.getView().setZoom(14);    
    var q=ol.proj.transform([parseFloat(user_location[0]), parseFloat(user_location[1])],'EPSG:3857','EPSG:4326');
    console.log(user_location,q);
  }  
});


//setting for tile services
var projection = ol.proj.get('EPSG:3857');              //projection
var projectionExtent = projection.getExtent();          //projectionExtent
var size = ol.extent.getWidth(projectionExtent) / 256;  //size
var resolutions = new Array(20);                        //resolutions
var matrixIds = new Array(20);                          //matrixIds
for (var z = 0; z < 20; ++z) {   
    resolutions[z] = size / Math.pow(2, z);
    matrixIds[z] = z;
}

function loadJsonSourceWithAjax(url){
  var source=new ol.source.Vector({});  
  $.ajax({
    url: url,
    dataType: "json",
    success: function(geojson){
      var options={};
      if(
        typeof(geojson.crs                )!='undefined' && 
        typeof(geojson.crs.properties     )!='undefined' && 
        typeof(geojson.crs.properties.name)!='undefined' 
      ){
        options={
          dataProjection: ol.proj.get(geojson.crs.properties.name),    //'EPSG:3826','EPSG:4326'
          featureProjection: ol.proj.get('EPSG:3857'),
        };
      }
      var features = (new ol.format.GeoJSON()).readFeatures(geojson,options);
      source.addFeatures(features);
      
      console.log(features.length);
    }
  });  
  return source;
}

//POPup
var popup=undefined;
                map.on('singleclick', function(evt) {  //triger singleclick, get evt,
                  var feature = map.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {  //get feature and layer by evt.pixel
                    return feature;
                  });
                  if(typeof(popup)!=undefined){
                    $("#infom").children().remove();
                  }
                  if (feature) {
                    if(feature.get('UID')!=undefined){
                        /*remove*/
                        popup = 0;
                        $("#infom").append( 
                        $("<div />").addClass('info').append(   //put a table to element parameter
                          $("<table />").addClass('table table-bordered').append(
                            $("<thead />").addClass('thead-light').append(
                              $("<tr />").append(
                                $("<th />").html("key")
                              ).append(
                                $("<th />").html("value")
                              )
                            )
                          ).append(
                            $("<tbody />").append(
                              $("<tr />").append(
                                $("<td />").html("名稱")
                              ).append(
                                $("<td />").html(feature.get('title'))
                              )
                            ).append(
                              $("<tr />").append(
                                $("<td />").html("lat")
                              ).append(
                                $("<td />").html(feature.get('latitude'))
                              )
                            ).append(
                              $("<tr />").append(
                                $("<td />").html("lng")
                              ).append(
                                $("<td />").html(feature.get('longitude'))
                              )
                            ).append(
                              $("<tr />").append(
                                $("<td />").html("Location")
                              ).append(
                                $("<td />").html(feature.get('locationName'))
                              )
                            ).append(
							$("<tr />").append(
                                $("<td />").html("簡介")
                              ).append(
                                $("<td />").html(feature.get('discountInfo'))
                              )
							)
                          )
                        )
                      )[0]
                    }
                  }
                });


var layers = {
    'OSM': { 
        'title': 'OpenStreetMap(開放街圖)', 
        'type': 'base', 
        'layer': new ol.layer.Tile({ 
            visible:false,
            source: new ol.source.OSM()  
            }) 
        },
    'Google Maps': { 
        'title': 'Google Maps', 
        'type': 'base', 
        'layer': new ol.layer.Tile({ 
            visible:false,
            source: new ol.source.XYZ({
                crossOrigin: 'anonymous',
                url: 'https://mt{0-3}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
            })
        })
    },
    'EMAP': {
        'title': '通用電子地圖(門牌)',
        'type': 'base',
        'layer': new ol.layer.Tile({
            visible:false,
            extent: projectionExtent,
            source: new ol.source.WMTS({
                url: 'http://maps.nlsc.gov.tw/S_Maps/wmts?',
                layer: 'EMAP',
                matrixSet: 'GoogleMapsCompatible',
                format: 'image/jpeg',
                projection: projection,
                tileGrid: new ol.tilegrid.WMTS({
                    origin: ol.extent.getTopLeft(projectionExtent),
                    resolutions: resolutions,
                    matrixIds: matrixIds
                }),
                extent: projectionExtent,
                style: 'default'
            })
        })
    },
    'activity': {
        'title': '展覽活動',
        'type': 'overlay',
        'layer': new ol.layer.Vector({
            visible:false,
            source: loadJsonSourceWithAjax("./data/Taiact.geojson")   
       })
    },
	'metroline': {
        'title': '捷運線',
        'type': 'overlay',
        'layer': new ol.layer.Vector({
            visible:false,
            source: new ol.source.Vector({
              format: new ol.format.GeoJSON(),
              url: './data/metroline.geojson',
            })
        })
    },
}

var setLayer=function(key){     //function setLayer(idx)
  for (i = 0; i < Object.keys(layers).length; i++) {
    var tlayer = layers[Object.keys(layers)[i]];
    if (tlayer.type == 'base') 
      layers[Object.keys(layers)[i]].layer.setVisible(Object.keys(layers)[i]==key);    
  }
}

var styles = {
	'activity': [new ol.style.Style({
                        image: new ol.style.Icon(({
                          anchor: [4,32],
                          anchorXUnits: 'pixels',
                          anchorYUnits: 'pixels',
                          opacity: 1.00,
                          crossOrigin: 'anonymous',
                          src: './maps-and-flags_2.png',
                        }))
                      }),],
	'metroline': [new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'rgba(100, 100, 255, 0.9)',
            width: 5,
            lineDash: [4,8]   //line dash pattern [line, space]
        })
    })],
};

function initLayers() {
  //console.log("layers:",layers[Object.keys(layers)[0]].layer);
  //console.log("layers:",Object.keys(layers)[0].layer);
  for (i = 0; i < Object.keys(layers).length; i++) {
    var tlayer = layers[Object.keys(layers)[i]];
    if (tlayer.type == 'base') {
      $('<div class="radio"><label><input type="radio" class="basecontrol" name="baselayer" id=' + Object.keys(layers)[i] + ' value="' + Object.keys(layers)[i] +'"'+ (i==2?' checked':'')   +' >' + tlayer.title + '</label></div>').appendTo("#baselayerlist");
      //console.log(layers[Object.keys(layers)[i]].title);
      map.addLayer(tlayer.layer);           
    }else if(tlayer.type == 'overlay') {
      $('<a class="dropdown-item" href="#"> <label><input type="checkbox" class="overlaycontrol" name="overlayer" value="' + Object.keys(layers)[i] + '">' + tlayer.title + '</label></a>').appendTo("#activity_catagory");
      map.addLayer(tlayer.layer);
      tlayer.layer.setZIndex(10000-i);
      tlayer.layer.setStyle(styleFunction(Object.keys(layers)[i]));
    }
  }
 
}


function styleFunction(stylename) {
  return styles[stylename];
};

initLayers();


$(function() {
  //baseLayer control
  console.log(map.getView().calculateExtent(map.getSize()));
  setLayer('Google Maps');
  $("input.basecontrol").change(function() {
    if($(this).is(':checked'))
      setLayer($(this).attr('value'));    
  });
  
  //overlayLayer control
  $("input.overlaycontrol").change(function() {
    if($(this).is(':checked')){
      layers[$(this).val()].layer.setVisible(true);
      
      console.log($(this).val());
      if($(this).val()=='bus'){
        layers[$(this).val()].layer.setSource(loadJsonSourceWithAjax("./data/bus.php"));
      }
      //
    }
    else
      layers[$(this).val()].layer.setVisible(false);
  });


});
