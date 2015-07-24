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
    this.chart = null;
    this.categories = this.getCategories();
    this.columns = this.getColumns();

    console.log('categories', this.categories);
    console.log('columns', this.columns);

    this.draw();
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
    this.chart = c3.generate({
      bindto: '.chart-labels',
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
  }
};

chartState.init();
chartLabels.init();
