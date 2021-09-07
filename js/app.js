function init() {
  d3.json('samples.json')
    .then(({ names }) => {
      const initialSample = names[0];
      createCharts(initialSample);
    })
    .catch((error) => console.log(error));
}

init();

function optionChanged(id) {
  createCharts(id);
}

function createCharts(sample) {
  d3.json('samples.json').then(function ({ samples, metadata }) {
    const data = samples.filter((obj) => obj.id == sample)[0];

    const barChart = {
      otuIds: data.otu_ids.map((row) => `OTU ${row}`),
      values: data.sample_values.slice(0, 10),
      labels: data.otu_labels
        .slice(0, 10)
        .map((label) => label.replaceAll(';', ', ')),
    };

    const bubbleChart = {
      otuIds: data.otu_ids,
      values: data.sample_values,
      labels: data.otu_labels.map((label) => label.replaceAll(';', ', ')),
    };

    const data1 = [
      {
        x: barChart.values,
        y: barChart.otuIds,
        type: 'bar',
        orientation: 'h',
        text: barChart.labels,
        hoverinfo: 'text',
      },
    ];

    const data2 = [
      {
        x: bubbleChart.otuIds,
        y: bubbleChart.values,
        mode: 'markers',
        text: bubbleChart.labels,
        marker: {
          size: bubbleChart.values,
          color: bubbleChart.otuIds,
        },
      },
    ];

    const layout1 = {
      margin: {
        t: 40,
        l: 150,
      },
      title: {
        text: 'Top 10 Bacterial Cultures Found',
      },
    };

    // layout for bubble chart
    const layout2 = {
      xaxis: { title: 'OTU ID' },
      title: {
        text: 'Bacteria Cultures Per Sample',
      },
    };

    Plotly.newPlot('bar', data1, layout1, { responsive: true });
    Plotly.newPlot('bubble', data2, layout2, { responsive: true });
  });
}
