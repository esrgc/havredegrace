// initialize map when page ready
var map;
var gg = new OpenLayers.Projection("EPSG:4326");
var sm = new OpenLayers.Projection("EPSG:900913");

var init = function (onSelectFeatureFunction) {

    var vector = new OpenLayers.Layer.Vector("Vector Layer", {});	
	
	var redLayer=new ColorVector("red");
    redLayer.getColorLayer().addFeatures(redLayer.getVec());
	
	var blueLayer=new ColorVector("blue");
    blueLayer.getColorLayer().addFeatures(blueLayer.getVec());
	
	var greenLayer=new ColorVector("green");
    greenLayer.getColorLayer().addFeatures(greenLayer.getVec());
	
    var geolocate = new OpenLayers.Control.Geolocate({
        id: 'locate-control',
        geolocationOptions: {
            enableHighAccuracy: false,
            maximumAge: 0,
            timeout: 7000
        }
    });
	var selectControl = new OpenLayers.Control.SelectFeature(
		[redLayer.getColorLayer(), blueLayer.getColorLayer(), greenLayer.getColorLayer()],
		{
			clickout: true, toggle: false,
			multiple: false, hover: false,
			toggleKey: "ctrlKey", // ctrl key removes from selection
			multipleKey: "shiftKey" // shift key adds to selection
		}
    );
			
			
    // create map
    map = new OpenLayers.Map({
        div: "map",
        theme: null,
        projection: sm,
        numZoomLevels: 18,
        controls: [
            new OpenLayers.Control.Attribution(),
            new OpenLayers.Control.TouchNavigation({
                dragPanOptions: {
                    enableKinetic: true
                }
            }),
            geolocate,
            selectControl
        ],
        layers: [
            new OpenLayers.Layer.OSM("OpenStreetMap",[
            		"http://otile1.mqcdn.com/tiles/1.0.0/osm/${z}/${x}/${y}.jpg",
			   		"http://otile2.mqcdn.com/tiles/1.0.0/osm/${z}/${x}/${y}.jpg",
			   		"http://otile3.mqcdn.com/tiles/1.0.0/osm/${z}/${x}/${y}.jpg",
			   		"http://otile4.mqcdn.com/tiles/1.0.0/osm/${z}/${x}/${y}.jpg"
			   	], 
			   	{
                	transitionEffect: 'resize'
            	}
            ),
            vector,
			blueLayer.getColorLayer(),
            redLayer.getColorLayer(),
			greenLayer.getColorLayer()
        ]
    });
	
	 map.addControl(selectControl);
    selectControl.activate();
	var proj = new OpenLayers.Projection("EPSG:4326");
	var point = new OpenLayers.LonLat(-76.0908, 39.549);
	map.setCenter(point.transform(proj, map.getProjectionObject()), 15);

    var style = {
        fillOpacity: 0.1,
        fillColor: '#000',
        strokeColor: '#f00',
        strokeOpacity: 0.6
    };
	
    geolocate.events.register("locationupdated", this, function(e) {
        vector.removeAllFeatures();
        vector.addFeatures([
            new OpenLayers.Feature.Vector(
                e.point,
                {},
                {
                    graphicName: 'cross',
                    strokeColor: '#f00',
                    strokeWidth: 2,
                    fillOpacity: 0,
                    pointRadius: 10
                }
            ),
            new OpenLayers.Feature.Vector(
                OpenLayers.Geometry.Polygon.createRegularPolygon(
                    new OpenLayers.Geometry.Point(e.point.x, e.point.y),
                    e.position.coords.accuracy / 2,
                    50,
                    0
                ),
                {},
                style
            )
        ]);
        map.zoomToExtent(vector.getDataExtent());
    });

        popupIntro();


	var mobileBaseFeatures;
	function getFeatures(cat) {
		mobileBaseFeatures=features;
		var reader = new OpenLayers.Format.GeoJSON({
			'internalProjection': new OpenLayers.Projection("EPSG:900913"),
			'externalProjection': new OpenLayers.Projection("EPSG:4326")
		});
		var jsonVector=reader.read(mobileBaseFeatures);
		var i=jsonVector.length-1;
		for(i; i>=0; i--){
			jsonVector[i].fid=i;
			if(features.features[i].properties.Category!=cat){
				if(cat!="blue"){
					jsonVector.splice(i, 1);
				}
			}
		}
		return jsonVector;
	}
	
	function popup(id){
		var index=id;

		if(index == 24){
			index = 25;
		}

		var indexString = (index+1).toString();
		if(index == 23){
			indexString = "24 & 25";
		}

		var name="<h2 class=\"popup-text\">#"+indexString+ " - " +features.features[index].properties.Name+"</h2>";
		var address="<h3 class=\"popup-text\">"+features.features[index].properties.Address+"</h3>";
		var date="<h3 class=\"popup-text\">"+ features.features[index].properties.Date + "</h3>";

		var photo;
		if(features.features[index].properties.Photo == null){
			photo="";
		}
		else{
			photo = "<img src=\"media/locations/" + features.features[index].properties.Photo + "\" class='image' alt=''>";
		}

		var description="<h3 class=\"popup-text\">"+features.features[index].properties.Description+"</h3>";
		var footnote="<h4 style=\"font-style:italic;\" class=\"popup-text\">"+features.features[index].properties.Footnote+"</h4>";

		$("#popupBasic").html("<a class=\"ui-btn-right ui-btn ui-shadow ui-btn-corner-all ui-btn-icon-notext ui-btn-up-a\" data-iconpos=\"notext\" data-icon=\"delete\" data-theme=\"a\" data-role=\"button\" data-rel=\"back\" href=\"#\" data-corners=\"true\" data-shadow=\"true\" data-iconshadow=\"true\" data-wrapperels=\"span\" title=\"Close\"><span class=\"ui-btn-inner ui-btn-corner-all\"><span class=\"ui-btn-text\">Close</span><span class=\"ui-icon ui-icon-delete ui-icon-shadow\"> </span></span></a><center><div class='ui-grid-a'><div class='ui-block-a'><button id='previous'>Previous</button></div><div class='ui-block-b'><button id='next'>Next</button></div></div><br>"+name+"</div>"+date+address+"</center><br><center>"+photo+"</center>"+description+footnote);

		$('#next').click(function(){
			popup(index+1);
		});

		$('#previous').click(function(){
			if(index != 25){
				popup(index-1);
			}
			else{
				popup(index-2);
			}
		});

		$( "#popupBasic" ).popup("open", {x:0, y:0, tolerance:"30,15,500,15"});

		$('#next').button().button('refresh');
		$('#previous').button().button('refresh');

	}

	function popupIntro(){

		$("#popupBasic").html("<a class=\"ui-btn-right ui-btn ui-shadow ui-btn-corner-all ui-btn-icon-notext ui-btn-up-a\" data-iconpos=\"notext\" data-icon=\"delete\" data-theme=\"a\" data-role=\"button\" data-rel=\"back\" href=\"#\" data-corners=\"true\" data-shadow=\"true\" data-iconshadow=\"true\" data-wrapperels=\"span\" title=\"Close\"><span class=\"ui-btn-inner ui-btn-corner-all\"><span class=\"ui-btn-text\">Close</span><span class=\"ui-icon ui-icon-delete ui-icon-shadow\"> </span></span></a><h4>Tap on a balloon anywhere on the map to see that property. You may wish to start at the first property, The Lock House, which is denoted by a blue balloon. Press the \'Previous\' and \'Next\' buttons to scroll through the properties. To return to the map, close the property by pressing the X in the upper right corner.</h4>");

		$( "#popupBasic" ).popup("open", {x:0, y:0, tolerance:"30,15,500,15"});
	}
	
	
	function getFeature(id){
		var featureObject = {
			index:id, 

		};
	}	
	
	function ColorVector(color){
		this.colorLayer=new OpenLayers.Layer.Vector(color, {
			styleMap: new OpenLayers.StyleMap({
				externalGraphic: "media/" + color+".png",
				graphicOpacity: 1.0,
				graphicWidth: 30,
				graphicHeight: 30,
				graphicYOffset: -30
			})
		});
		
		this.vec=getFeatures(color);
		
		this.colorLayer.events.on({
			"featureselected": function(e){
				popup(e.feature.fid);
			}
		});
		
		ColorVector.prototype.getColorLayer=function(){
			return this.colorLayer;
		}
		
		ColorVector.prototype.getVec=function(){
			return this.vec;
		}
	}

};