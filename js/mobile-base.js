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
            new OpenLayers.Layer.OSM("OpenStreetMap", null, {
                transitionEffect: 'resize'
            }),
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
	map.setCenter(point.transform(proj, map.getProjectionObject()), 16);

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
		var name="<h1>#"+(index+1)+ " - " +features.features[index].properties.Name+"</h1>";
		var address="<h2>Address - "+features.features[index].properties.Address+"</h2>";
		var date="<h2>Built in - "+ features.features[index].properties.Date + "</h2>";

		var photo;
		if(features.features[index].properties.Photo == null){
			photo="";
		}
		else{
			photo = "<img src=\"media/locations/" + features.features[index].properties.Photo + "\" class='image' alt=''>";
		}

		var description="<h2>"+features.features[index].properties.Description+"</h2>";
		var footnote="<h3 style=\"font-style:italic;\">"+features.features[index].properties.Footnote+"</h3>";

		$("#popupBasic").html("<a class=\"ui-btn-right ui-btn ui-shadow ui-btn-corner-all ui-btn-icon-notext ui-btn-up-a\" data-iconpos=\"notext\" data-icon=\"delete\" data-theme=\"a\" data-role=\"button\" data-rel=\"back\" href=\"#\" data-corners=\"true\" data-shadow=\"true\" data-iconshadow=\"true\" data-wrapperels=\"span\" title=\"Close\"><span class=\"ui-btn-inner ui-btn-corner-all\"><span class=\"ui-btn-text\">Close</span><span class=\"ui-icon ui-icon-delete ui-icon-shadow\"> </span></span></a><center><button id='previous'>Previous</button>"+name+"<button id='next'>Next</button></div>"+address+"</center><center>"+date+"</center><center>"+photo+"</center>"+description+footnote);

		$('#next').click(function(){
			console.log("here in next");
			popup(index+1);
		});

		$('#previous').click(function(){
			console.log("here in previous");
			popup(index-1);
		});

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