// Store API endpoint as a url
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Use D3 to get to get data from API and log it to console
d3.json(queryUrl).then(function (data) {

    createFeatures(data.features);
    console.log(data.features);
});

function createFeatures(earthquakeData) {
    // Give each feature a popup that describes the place and time of the earthquake.
    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p><p><b>Magnitude:</b> ${feature.properties.mag}; <b>Depth:</b> ${feature.geometry.coordinates[2]} Km</p>`);
    }
    // Creating a GeoJSON layer that contains the features array on the earthquakeData object.
    let earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: function(feature, latlng) {
            color = markerColor(feature.geometry.coordinates[2]);

            var geoJSONmarkers = {
                radius: markerSize(feature.properties.mag),
                fillColor: color,
                color: "black",
                weight: 1,
                opacity: 1,
                fillOpacity: 1
            };
            return L.circleMarker(latlng, geoJSONmarkers);
        }
    });
    // Sending earthquakes layer to the createMap function
    createMap(earthquakes);
}
// A function to determine the marker size based on the magnitude of earthquake
function markerSize(magnitude) {
    return magnitude * 2;
}
// A function to determine the marker color based on the depth of earthquake  
function markerColor(depth) {
    if (depth <= 10) {
        color = "#BFFF00"
    }
    else if (depth <= 30) {
        color = "#FFFF00"
    }
    else if (depth <= 50) {
        color = "#FFBF00"
    }
    else if (depth <= 70) {
        color = "#FF8000"
    }
    else if (depth <= 90) {
        color = "#FF4000"
    }
    else {
        color = "#FF0000";
    }
    return color;
    }
    //createMap function
    function createMap(earthquakes) {
        // Creating the base layers.
        let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        });
        // Creating layer groups:for earthquake markers.
        let earthquake = L.layerGroup(earthquakes);
        // Creating a baseMaps object.
        let baseMaps = {
            "Street Map": street
        };
        // Creating an overlay object.
        let overlayMaps = {
            Earthquakes: earthquakes
        };
        // Defining a map object.
        let myMap = L.map('map', {
            center: [37.09, -95.71],
            zoom: 5,
            layers: [street, earthquakes]
        });
        // Set up the legend.
        let legend = L.control({position: "bottomright"});
        legend.onAdd = function() {
            let div = L.DomUtil.create("div", "info legend")
            let depth = [-10, 10, 30, 50, 70, 90];
            let labels = [];

            div.innerHTML += "<h3 style='text-align: center'>Depth</h3>"
            // loop through our density intervals and generate a label with a colored square for each interval
            for (var i = 0; i < depth.length; i++) {
                div.innerHTML +=
                    '<i style="background-color:' + markerColor(depth[i]+1) + '">&nbsp&nbsp&nbsp&nbsp</i> ' +
                    depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] + '<br>' : '+');
            }

            return div;
        };

        legend.addTo(myMap);
        // Add the layer control to the map.
        L.control.layers(baseMaps, overlayMaps, {
            collapsed: false
        }).addTo(myMap);
    }