var issues = [].concat(page1, page2, page3);

var chartState = {
  init: function () {
    this.chart = null;
    this.categories = this.getCategories();
    this.columns = this.getColumns();
    this.colors = this.getColors();

    this.draw();
  },
  getCategories: function () {
    return ["Open issues", "Closed issues"];
  },

  getColumns: function () {
    var columnOpen = ["Open issues", 0];
    var columnClosed = ["Closed issues", 0];

    issues.forEach(function (issue) {
      issue.state === 'closed' && columnClosed[1]++;
      issue.state === 'open' && columnOpen[1]++;
    });

    return [columnOpen, columnClosed];
  },
  getColors: function () {
    return {
      'Open issues': "#d62728",
      'Closed issues': '#2ca02c'
    };
  },
  draw: function () {
    var self = this;

    this.chart = c3.generate({
      bindto: '.chart-state',
      data: {
        type: 'pie',
        columns: self.columns,
        colors: self.colors
      }
    });
  }
};

var chartLabels = {
  init: function () {
    this.chart = {};
    this.categories = this.getCategories();
    this.columns = this.getColumns();
  },
  getCategories: function () {
    var categories = [];
    issues.map(function (issue) {
      categories = categories.concat(
        issue.labels.map(function (label) {
          return label.name;
        })
      );
    });
    return $.unique(categories);
  },
  getColumns: function () {
    var column = [];

    this.categories.map(function (category, index) {
      issues.map(function (issue) {
        issue.labels.map(function (label) {
          if (category === label.name) {
            if (column[index]) {
              column[index]++;
            } else {
              column[index] = 1;
            }
          }
        });
      });
    });

    column.unshift('count');

    return [column];
  },

  draw: function () {
    var self = this;
    return {
      bar: function () {
        self.init();

        self.chart.bar = c3.generate({
          bindto: '.chart-labels-bar',
          data: {
            type: 'bar',
            columns: self.columns
          },
          axis: {
            x: {
              type: 'category',
              categories: self.categories,
              tick: {
                rotate: -30,
                multiline: false
              },
              height: 100
            }
          },
          legend: {
            show: false
          }
        });
      },
      pie: function () {
        self.chart.pie = c3.generate({
          bindto: '.chart-labels-pie',
          data: {
            type: 'pie',
            columns: (function () {
              var columns = [];
              var data = [];
              data = data.concat(self.columns[0]);
              data.splice(0, 1);

              self.categories.map(function (category, index) {
                columns.push([category, data[index]]);
              });
              return columns;
            }())
          }
        });
      }
    };
  }
};


// TODO:
// 1. Refactor
// 2. Axis ticks
var chartTime = {
  init: function () {
    this.chart = {};
  },

  issues: function() {
    var issuesCreated = issues.sort(function (a, b) {
      var da = +(new Date(a.created_at));
      var db = +(new Date(b.created_at));
      return da - db;
    });
    var issuesClosed = issues.filter(function (issue) {
      return issue.closed_at;
    }).sort(function (a, b) {
      var da = +(new Date(a.closed_at));
      var db = +(new Date(b.closed_at));
      return da - db;
    });

    var created = [];
    var closed = [];
    var x = [];
    var date;
    var count;
    var p;
    var tempCreated = {};
    var tempClosed = {};
    var dateFormatter = d3.time.format('%Y-%m-%d');

    issuesCreated.map(function (issue) {
      date = dateFormatter(new Date(issue.created_at));
      tempCreated[date] ?
        tempCreated[date].count++ :
        tempCreated[date] = {
          time: date,
          count: 0
        };
    });

    issuesClosed.map(function (issue) {
      date = dateFormatter(new Date(issue.closed_at));
      tempClosed[date] ?
        tempClosed[date].count++ :
        tempClosed[date] = {
          time: date,
          count: 0
        };
    });

    for (p in tempCreated) {
      if (tempCreated.hasOwnProperty(p)) {
        count = tempCreated[p].count;
        if (count > 0) {
          x.push(p);
          created.push(tempCreated[p].count);
        }
      }
    }

    for (p in tempClosed) {
      if (tempClosed.hasOwnProperty(p)) {
        count = tempClosed[p].count;
        if (count > 0) {
          x.push(p);
          closed.push(tempClosed[p].count);
        }
      }
    }

    return {
      created: created,
      closed: closed,
      duration: x
    };
  },

  ticks: function () {
    var y = [].concat(this.issues().created);

    y = $.grep(y, function (tick, index) {
      return $.inArray(tick, y) === index;
    }).sort();

    return {
      x: null,
      y: y
    };
  },

  draw: function () {
    var self = this;

    return {
      bar: function () {
        self.init();

        self.chart.bar = c3.generate({
          bindto: '.chart-time-bar',
          data: {
            x: 'x',
            columns: [
              ['x'].concat(self.issues().duration),
              ['created'].concat(self.issues().created),
              ['closed'].concat(self.issues().closed)
            ]
          },
          axis: {
            x: {
              type: 'timeseries'
            },
            y: {
              min: 1,
              tick: {
                values: self.ticks().y
              }
            }
          }
        });
      },
      area: function () {
        self.init();
        self.chart.area = c3.generate({
          bindto: '.chart-time-area',
          data: {
            x: 'x',
            columns: [
              ['x'].concat(self.issues().duration),
              ['create'].concat(self.issues().created),
              ['closed'].concat(self.issues().closed)
            ],
            type: 'area'
          },
          axis: {
            x: {
              type: 'timeseries'
            },
            y: {
              min: 1,
              tick: {
                values: self.ticks().y
              }
            }
          }
        });
      }
    };
  }
};

chartState.init();
chartLabels.draw().bar();
chartLabels.draw().pie();
chartTime.draw().bar();
chartTime.draw().area();
