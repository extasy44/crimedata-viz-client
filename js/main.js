const apiUrl =
  'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';
const vicSurburbs =
  'https://data.gov.au/geoserver/vic-local-government-areas-psma-administrative-boundaries/wfs?request=GetFeature&typeName=ckan_bdf92691_c6fe_42b9_a0e2_a4cd716fa811&outputFormat=json';

function getColour(value) {
  const color_pallette = {
    0: '#FFEDA0',
    1: '#FED976',
    2: '#FEB24C',
    3: '#FD8D3C',
    4: '#FC4E2A',
    5: '#E31A1C',
    6: '#BD0026',
    7: '#800026',
    8: '#753d34',
    9: '#582a2a',
  };

  const val = Math.floor(value);
  if (color_pallette[val]) return color_pallette[val];
  else return '#582a2a';
}

function createMap(LGAData) {
  const vic_lga = L.geoJSON(LGAData, {
    style: style,
    onEachFeature: onEachFeature,
  });

  const grayscaleMap = L.tileLayer(
    'https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}',
    {
      attribution:
        'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox.outdoors',
      accessToken: API_KEY,
    }
  );

  const satelliteMap = L.tileLayer(
    'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}',
    {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox.satellite',
      accessToken: API_KEY,
    }
  );

  const outdoorsMap = L.tileLayer(
    'https://api.mapbox.com/styles/v1/mapbox/outdoors-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}',
    {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox.light',
      accessToken: API_KEY,
    }
  );

  const baseMaps = {
    'Grayscale Map': grayscaleMap,
    'Outdoor Map': outdoorsMap,
    'Satellite Map': satelliteMap,
  };

  const overlayMaps = {
    VIC_LGA: vic_lga,
  };

  const myMap = L.map('map', {
    center: [-37.8136, 144.9631],
    zoom: 7,
    layers: [grayscaleMap, vic_lga],
  });

  L.control
    .layers(baseMaps, overlayMaps, {
      collapsed: true,
    })
    .addTo(myMap);

  const legend = L.control({ position: 'bottomright' });

  legend.onAdd = function () {
    const div = L.DomUtil.create('div', 'legend');
    const legends = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

    legends.forEach((legend, i) => {
      const next = legends[i + 1] ? '&ndash; ' + legends[i + 1] + '<br>' : '+';
      div.innerHTML += `<div class="legend-range" style="background: ${getColour(
        legend
      )}">${legends[i]} ${next}</div>`;
    });

    return div;
  };

  legend.addTo(myMap);

  const info = L.control();

  info.onAdd = function () {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
  };

  // method that we will use to update the control based on feature properties passed
  info.update = function (props) {
    this._div.innerHTML =
      '<h4>Victoria Crime Rate by LGA</h4>' +
      (props
        ? '<b>' +
          props.lga_pid +
          ' ' +
          props.lg_ply_pid +
          '</b><br />' +
          props.vic_lga__3 +
          ' incidents'
        : 'Hover over a LGA');
  };

  info.addTo(myMap);

  function highlightFeature(e) {
    const layer = e.target;
    const {
      feature: {
        properties: { lga_pid, vic_lga__3 },
      },
    } = e.target;
    console.log(lga_pid, vic_lga__3);
    layer.setStyle({
      weight: 2,
      color: '#BD0026',
      dashArray: '',
      fillOpacity: 0.4,
    });

    info.update(layer.feature.properties);

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
      layer.bringToFront();
    }
  }

  function resetHighlight(e) {
    vic_lga.resetStyle(e.target);
    info.update();
  }

  function zoomToFeature(e) {
    myMap.fitBounds(e.target.getBounds());
  }

  function onEachFeature(feature, layer) {
    layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight,
      click: zoomToFeature,
    });
  }

  function style(feature) {
    return {
      fillColor: getColour(feature.properties.lg_ply_pid / 100),
      weight: 1,
      opacity: 1,
      color: 'white',
      dashArray: '5',
      fillOpacity: 0.6,
    };
  }
}

const app = async () => {
  const vicLgaData = await d3.json(vicSurburbs);

  console.log(vicLgaData);
  createMap(vicLgaData);
};

app();
