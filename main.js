//this code runs on the server
var HOST = location.origin.replace(/^http/, 'ws')
var ws = new WebSocket(HOST);
var el = document.getElementById('twit-text');

var twitData = [];


ws.onmessage = function (event) {
    //   el.innerHTML = el.innerHTML + '<br>' + decodeURIComponent(event.data);
    el.innerHTML = el.innerHTML + '<br>' + event.data;
    let obj = JSON.parse(event.data);
    twitData.push({
      x: moment(obj.date),
      y: obj.count
    })

};

function onRefresh(chart) {
  // var newData =  {
  //   x: Date.now(),
  //   y: Math.random()
  // };
  // config.data.datasets.forEach(function (dataset) {
  //   dataset.data.push(newData);
  // });
  // config.data.datasets = twitData;
}
var config = {
    type: 'line',
    data: {
      datasets: [{
        data: twitData
      }
      // , {
      //   data: []
      // }
    ]
    },
    options: {
      scales: {
        xAxes: [{
          type: 'realtime'
        }]
      },
      plugins: {
        streaming: {
          delay: 2000,
          onRefresh: onRefresh
        }
      }
    }
};
window.onload = function () {
  var ctx = document.getElementById('myChart').getContext('2d');
  var chart1 = new Chart(ctx, config);
};