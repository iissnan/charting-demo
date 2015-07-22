var HTTP_CODES = [
  '200', '201', '202', '203', '204', '205', '206',
  '300', '301', '302', '303', '304', '305', '306', '307',
  '400', '401', '402', '403', '404', '405', '406', '407', '408', '409',
  '410', '411', '412', '413', '414', '415', '416', '417',
  '500', '501', '502', '503', '504', '505'
];
var API_ENDPOINTS = [
  'user', 'authorizations', 'search', 'emails', 'events', 'feeds',
  'issues', 'notifications', 'teams'
];

var chart = {
  init: function () {
    this.chart = null;
    this.data();
    this.stackLegend();
    this.draw();
  },

  colors: (function () {
    var colors = {};
    var CODE_COLORS = {
      200: '#31a354',
      300: '#3182bd',
      400: '#fd8d3c',
      500: '#e6550d'
    };

    HTTP_CODES.forEach(function (code) {
      var series = code.substring(0, 1) + '00';
      var baseColor = CODE_COLORS[series];

      colors[code] = d3.rgb(baseColor).darker( (code - series)/5 ).toString();
    });

    return colors;
  }()),

  data: function () {
    var codeSize = HTTP_CODES.length;
    var row;
    var MAX_VALUE = 1e3;
    this.columns = [];

    for (var i = 0; i < 5; i++) {
      row = [];
      row.push(HTTP_CODES[helpers.random(0, codeSize)]);
      for (var j = 0; j < this.category.size; j++) {
        row.push(helpers.random(1, MAX_VALUE));
      }
      this.columns.push(row);
    }
  },

  category: {
    data: API_ENDPOINTS,
    size: API_ENDPOINTS.length
  },

  stack: function () {
    if (this.stacked) {
      this.chart.groups(this.stacked);
      return;
    }

    var stacked = [
      ['200'],
      ['300'],
      ['400'],
      ['500']
    ];
    var code;

    for (var p in this.columns) {
      if (this.columns.hasOwnProperty(p)) {
        code = this.columns[p][0];
        switch (code.substring(0, 1)) {
          case '2':
            stacked[0].push(code); break;
          case '3':
            stacked[1].push(code); break;
          case '4':
            stacked[2].push(code); break;
          case '5':
            stacked[3].push(code); break;
        }
      }
    }
    this.stacked = stacked;
    this.chart.groups(this.stacked);
  },

  unstack: function () {
    this.chart.groups([]);
  },

  stackLegend: function () {
    var self = this;
    var INITIAL_STATUS = 'unstack';

    d3.select('.wrap').insert('div', '.chart').attr('class', 'stack-legend').selectAll('span')
      .data(['stack', 'unstack'])
      .enter().append('span')
      .attr('class', function (id) {
        return 'stack-legend-item stack-legend-' + id + ' ' + (INITIAL_STATUS === id ? 'active' : '');
      })
      .html(function (id) {
        return '<i></i>' + id;
      })
      .on('click', function (id) {
        $('.stack-legend-item').removeClass('active');
        self[id]();
        $('.stack-legend-' + id).addClass('active');
      });
  },

  draw: function () {
    var self = this;

    this.chart = c3.generate({
      bindto: '.chart',
      size: {
        height: 600
      },
      data: {
        columns: self.columns,
        type: 'bar',
        colors: self.colors
      },
      axis: {
        rotated: true,
        x: {
          type: 'category',
          label: {
            text: 'API Endpoint',
            position: 'outer-top'
          },
          categories: self.category.data
        },
        y: {
          label: {
            text: 'Request count',
            position: 'outer-right'
          }
        }
      },
      grid: {
        y: {
          show: true
        }
      }
    });
  }
};

chart.init();
