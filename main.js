//this code runs on the server
var HOST = location.origin.replace(/^http/, 'ws')
var ws = new WebSocket(HOST);
var el = document.getElementById('twit-text');

var twitCount = [];
var twitAvg = [];



ws.onmessage = function (event) {
  setTimeout(function () {
    el.innerHTML = decodeURIComponent(event.data) + '<br>' + el.innerHTML;
  }, 3000)
  // el.innerHTML = decodeURIComponent(event.data) + '<br>'  +el.innerHTML;
  let obj = JSON.parse(event.data);
  twitCount.push({
    x: moment(obj.date).format(),
    y: obj.count
  });
  twitAvg.push({
    x: moment(obj.date).format(),
    y: obj.avg
  })
};


var config = {
  type: 'line',
  data: {
    datasets: [{
      data: twitCount,
      label: 'Count',
      borderColor: 'rgb(54, 162, 235)',
      backgroundColor: 'rgba(54, 162, 235, 0.5)'
    }, {
      data: twitAvg,
      label: 'Average',
      borderColor: 'rgb(255, 99, 132)',
      backgroundColor: 'rgba(255, 99, 132, 0.5)'
    }]
  },
  options: {
    scales: {
      xAxes: [{
        type: 'realtime'
      }]
    },
    plugins: {
      streaming: {
        delay: 2000
      }
    }
  }
};
window.onload = function () {
  var ctx = document.getElementById('myChart').getContext('2d');
  var chart1 = new Chart(ctx, config);
};