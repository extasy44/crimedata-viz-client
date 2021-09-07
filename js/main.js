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
      collapsed: false,
    })
    .addTo(myMap);

  const legend = L.control({ position: 'bottomright' });

  legend.onAdd = function () {
    const div = L.DomUtil.create('div', 'legend');
    const legends = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

    legends.forEach((legend, i) => {
      const next = legends[i + 1]
        ? '&ndash; ' + legends[i + 1] * 1000 + '<br>'
        : '+';
      div.innerHTML += `<div class="legend-range" style="background: ${getColour(
        legend
      )}">${legends[i] * 1000} ${next}</div>`;
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
    this._div.innerHTML = props
      ? '<b>' +
        props.lga_pid +
        ' ' +
        props.lg_ply_pid +
        '</b><br />' +
        props.vic_lga__3
      : 'Hover over a LGA';
  };

  info.addTo(myMap);

  function highlightFeature(e) {
    const layer = e.target;
    const {
      feature: {
        properties: { lga_pid, vic_lga__3 },
      },
    } = e.target;

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
    createStats(e.target.feature);
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
      dashArray: '3',
      fillOpacity: 0.6,
    };
  }
}

function createStats(feature) {
  const {
    properties: { lga_pid, vic_lga__3, vic_lga__5, vic_lga_sh },
  } = feature;
  const statDiv = document.querySelector('.stat-bar');

  const statText = `
  <ul><li>ID : ${lga_pid}</li><li>Name : ${vic_lga__3}</li><li>Level : ${vic_lga__5}</li><li>ID : ${lga_pid}</li><li>Name : ${vic_lga__3}</li><li>Level : ${vic_lga__5}</li></ul>
  `;

  statDiv.innerHTML = statText;
  statDiv.classList.remove('highlighting');
  void statDiv.offsetWidth;
  statDiv.classList.add('highlighting');
}

async function onYearChange() {
  const year = document.querySelector('#year-select').value;
  showLoader();
  setTimeout(function () {
    console.log(year);
    hideLoader();
  }, 2000);
}

const app = async () => {
  showLoader();
  const vicLgaData = await d3.json(vicSurburbs);
  const initialStats = {
    properties: {
      lga_pid: 100,
      vic_lga__3: 'Victoria',
      vic_lga__5: '3',
      vic_lga_sh: '2015-09-21',
    },
  };

  console.log(vicLgaData);
  createMap(vicLgaData);
  createStats(initialStats);
  hideLoader();
};

app();
