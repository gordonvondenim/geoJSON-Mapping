// Selectable backgrounds of our map - tile layers:
// grayscale background.
var lightMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?" +
  "access_token=pk.eyJ1IjoiajByZGFud2hpdG5leSIsImEiOiJjangxMzJhNmswNWtmNDNxcDBscW4zMHl6In0.MW-TKxKAfr9o5Jgi01yzIw");

// satellite background.
var satelliteMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/256/{z}/{x}/{y}?" +
  "access_token=pk.eyJ1IjoiajByZGFud2hpdG5leSIsImEiOiJjangxMzJhNmswNWtmNDNxcDBscW4zMHl6In0.MW-TKxKAfr9o5Jgi01yzIw");

// outdoors background.
var outdoorsMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v9/tiles/256/{z}/{x}/{y}?" +
  "access_token=pk.eyJ1IjoiajByZGFud2hpdG5leSIsImEiOiJjangxMzJhNmswNWtmNDNxcDBscW4zMHl6In0.MW-TKxKAfr9o5Jgi01yzIw");

// map object to an array of layers we created.
var map = L.map("map", {
  center: [37.09, -95.71],
  zoom: 5,
  layers: [lightMap, satelliteMap, outdoorsMap]
});

// adding one 'grayMap' tile layer to the map.
lightMap.addTo(map);

// layers for two different sets of data, earthquakes and tectonic plates.
var tectonicplates = new L.LayerGroup();
var earthquakes = new L.LayerGroup();

// base layers
var baseMaps = {
  Grayscale: lightMap,
  Outdoors: outdoorsMap,
  Satellite: satelliteMap,
};

// overlays 
var overlayMaps = {
  "Fault Lines": tectonicplates,
  "Earthquakes": earthquakes
};

// control which layers are visible.
L
  .control
  .layers(baseMaps, overlayMaps)
  .addTo(map);

// retrieve earthquake geoJSON data.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson", function(data) {


  function styleInfo(feature) {
    return {
      opacity: 1,
      fillOpacity: 1,
      fillColor: getColor(feature.properties.mag),
      color: "#000000",
      radius: getRadius(feature.properties.mag),
      stroke: true,
      weight: 0.5
    };
  }

  // Define the color of the marker based on the magnitude of the earthquake.
  function getColor(magnitude) {
    switch (true) {
      case magnitude > 5:
        return "#ea2c2c";
      case magnitude > 4:
        return "#ea822c";
      case magnitude > 3:
        return "#ee9c00";
      case magnitude > 2:
        return "#eecc00";
      case magnitude > 1:
        return "#d4ee00";
      default:
        return "#98ee00";
    }
  }

  // define the radius of the earthquake marker based on its magnitude.

  function getRadius(magnitude) {
    if (magnitude === 0) {
      return 1;
    }

    return magnitude * 4;
  }

  // add GeoJSON layer to the map
  L.geoJson(data, {
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng);
    },
    style: styleInfo,
    onEachFeature: function(feature, layer) {
      layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place);
    }

  }).addTo(earthquakes);

  earthquakes.addTo(map);


  var legend = L.control({
    position: "bottomright"
  });


  legend.onAdd = function() {
    var div = L
      .DomUtil
      .create("div", "info legend");

    var grades = [0, 1, 2, 3, 4, 5];
    var colors = [
      "#98ee00",
      "#d4ee00",
      "#eecc00",
      "#ee9c00",
      "#ea822c",
      "#ea2c2c"
    ];


    for (var i = 0; i < grades.length; i++) {
      div.innerHTML += "<i style='background: " + colors[i] + "'></i> " +
        grades[i] + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
    }
    return div;
  };


  legend.addTo(map);

  // retrive Tectonic Plate geoJSON data.
  d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json",
    function(platedata) {
 
      L.geoJson(platedata, {
        color: "orange",
        weight: 2
      })
      .addTo(tectonicplates);

      // add the tectonicplates layer to the map.
      tectonicplates.addTo(map);
    });
});