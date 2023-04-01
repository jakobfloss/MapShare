// import { readdirSync } from 'node:fs';

// create the Map
var map = L.map('map').setView([40.044438, 6.767578], 4);

// create different layers to choose from
const basemaps = {
    OSM: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',   {attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map),
    'TOPO-WMS': L.tileLayer.wms('http://ows.mundialis.de/services/service?',   {layers: 'TOPO-WMS'}),
    Places: L.tileLayer.wms('http://ows.mundialis.de/services/service?', {layers: 'OSM-Overlay-WMS'})
};

// create layer control
L.control.layers(basemaps).addTo(map);

// define picture icon
var camIcon = L.icon({
    iconUrl: './Icons/camIcon.png',

    iconSize:     [35, 35], // size of the icon
    iconAnchor:   [17.5, 35], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, -20] // point from which the popup should open relative to the iconAnchor
});

var startIcon = L.icon({
    iconUrl: './Icons/startIcon.png',

    iconSize:     [20, 20], // size of the icon
    iconAnchor:   [10, 20], // point of the icon which will correspond to marker's location
});

var finishIcon = L.icon({
    iconUrl: './Icons/finishIcon.png',

    iconSize:     [20, 20], // size of the icon
    iconAnchor:   [18, 18], // point of the icon which will correspond to marker's location
});

function drawImages(allImages){
    console.log(allImages)
    imageNames = allImages.split("\n")
    imageNames.forEach(imageName => {
        console.log(imageName)
        if (imageName == "") return;
        console.log("drawing " + imageName)
        lonlat = imageName.split("_")[0].replace("(", "").replace(")", "").split(",")
        L.marker(lonlat, {icon: camIcon}).addTo(map)
            // .bindPopup('<a href="images/' + imageName +'"><img src="images/' + imageName +'" height=150, width=200></a>')
            .bindPopup('<a class="example-image-link" href="data/images/located/'+imageName+'" data-lightbox="all_fotos">\
            <img class="example-image" src="data/images/located/'+imageName+'" height=150, width=200/></a>')
    });
}

function handleGPXs(allGPXs){
    gpxNames = allGPXs.split('\n')
    gpxNames.forEach(gpxFile => {
        if (gpxFile == "") return;
        console.log("drawing " + gpxFile)
        fetch("./data/gpx_files/" + gpxFile).then((response) => {response.text().then(text => drawGPX(text, gpxFile))})
    })
}

function convert(gpx_points){
    var points = []
    gpx_points.forEach(p => {
        points.push([p.lat, p.lon])
    })
    return points
}

function addDescription(layer, name, gpxFile){
    console.log(gpxFile)
    var description = gpxFile.split("_")[0] + '.txt'
    fetch("./data/descriptions/" + description).then((response) => {response.text().then(text => layer.bindPopup(name + '<br>' + text))})
}

function drawAlternating(){
    var cnt = 0
    function drawNew(gpxStr, gpxFile){
        let gpx = new gpxParser();
        gpx.parse(gpxStr)
        let name = gpx.tracks[0].name
        points = convert(gpx.tracks[0].points)
        color = 'purple'
        if (cnt%5 == 1) color = "red"
        if (cnt%5 == 2) color = "green"
        if (cnt%5 == 3) color = "orange"
        if (cnt%5 == 4) color = "blue"
        
        // L.marker(points[0], {icon: startIcon}).addTo(map)

        polyline = new L.Polyline(points, {
            color: color,
            weight: 3,
            opacity: 0.8,
            name: name
        })
            .addTo(map)
            .on('mouseover', function(e){
                var layer = e.target;
                layer.setStyle({
                    opacity: 1,
                    weight: 5
                });
            })
            .on('mouseout', function(e){
                var layer = e.target;
            
                layer.setStyle({
                    opacity: 0.8,
                    weight: 3
                });
            });
        addDescription(polyline, name, gpxFile)

        // L.marker(points[points.length-1], {icon: finishIcon}).addTo(map)

        cnt += 1
    }
    return drawNew
}

drawGPX = drawAlternating()


// look for all images listet in loc_img_list
fetch("./data/loc_img_list").then((response) => {response.text().then(text => drawImages(text))})
fetch("./data/gpx_list").then((response) => {response.text().then(text => handleGPXs(text))})

var popup = L.popup();

// function onMapClick(e) {
//     popup
//         .setLatLng(e.latlng)
//         .setContent("You clicked the map at " + e.latlng.toString())
//         .openOn(map);
// }

// map.on('click', onMapClick);