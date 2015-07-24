var HTTP_CODES = [
  '200', '201', '202', '203', '204', '205', '206',
  '300', '301', '302', '303', '304', '305', '306', '307',
  '400', '401', '402', '403', '404', '405', '406', '407', '408', '409',
  '410', '411', '412', '413', '414', '415', '416', '417',
  '500', '501', '502', '503', '504', '505'
];

var chart = {
  init: function (options) {
    this.chart = null;
    this.columns = [];

    var defaults = {
      // d3.scale.category20()
      colors: [
        '#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a',
        '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94',
        '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d',
        '#17becf', '#9edae5'
      ],
      categoryAll: [
        'user', 'authorizations', 'search', 'emails', 'events', 'feeds',
        'issues', 'notifications', 'teams'
      ],
      categorySize: 5,
      dimensionAll: HTTP_CODES,
      dimensionSize: 5,
      bindto: '.chart'
    };

    this.settings = $.extend({}, defaults, options);
    this.categories = this.getCategories();
    this.dimensions = this.getDimensions();
    this.columns = this.getColumns();
    this.colors = this.getColors();

    this.stackLegend();
    this.draw();
  },

  getColors: function () {
    var colors = {};
    var availableColors = this.settings.colors;

    this.categories.map(function (category) {
      colors[category] = availableColors[helpers.random(0, availableColors.length)];
    });

    return colors;
  },

  getCategories: function () {
    var settings = this.settings;
    return d3.range(settings.categorySize).map(function () {
      return settings.categoryAll[
        helpers.random(0, settings.categoryAll.length)
      ];
    }).sort();
  },

  getColumns: function () {
    var self = this;
    var MAX_VALUE = 1e3;
    var columns = [];
    var column;

    this.dimensions.map(function (dimension) {
      column = [dimension];
      column = column.concat(self.categories.map(function () {
        return helpers.random(1, MAX_VALUE);
      }));
      columns.push(column);
    });

    return columns;
  },

  getDimensions: function () {
    var settings = this.settings;
    return d3.range(settings.dimensionSize).map(function () {
      return settings.dimensionAll[
        helpers.random(0, settings.dimensionAll.length)
      ];
    });
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
      bindto: self.settings.bindto,
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
          categories: self.categories
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
