;(function() {

    var passphrase = 'yutest--';
    var i = 0;
    var data = window.testPanelData || {};
    var test_scenarios_source_id = data.sourceId || '1h-S3x9R_iOGbrMwDwvYS6qAYDEhXrEa5HLEWlUu6ocs';
    var test_scenarios_sheet_id = data.sheetId || 'od6'; // default to od6
    /**
     * How to find sheet_id
     * Go to the https://spreadsheets.google.com/feeds/worksheets/1h-S3x9R_iOGbrMwDwvYS6qAYDEhXrEa5HLEWlUu6ocs/private/full
     * Replace "1h-S3x9R_iOGbrMwDwvYS6qAYDEhXrEa5HLEWlUu6ocs" on your own source_id
     * Default sheet refers to od6
     * Find your sheet and detect sheet_id
     */

    try {
        var window_params = JSON.parse(window.name);
        group = window_params.group;
        step  = window_params.step;
        side  = window_params.side;
    } catch(e) {
    }

    if(window_params && window_params._type == 'test') {
        render_panel();
    }

    document.documentElement.addEventListener('keypress', function fq(e) {
        e = e || window.event;

        if(passphrase[i] == String.fromCharCode(e.which || e.keyCode)) {
            i++
        } else {
            i = 0;
        }

        if(!passphrase[i]) {
            i = 0;
            if(!panel) {
                render_panel();
            } else {
                panel.parentNode.removeChild(panel);
                panel = null;
                window.name = ''
            }
        }
    });

    function write_window_name() {
        window.name = JSON.stringify({_type: 'test', group: group, step: step, side: side});
    }

    var panel, group, step, side;

    function render_panel() {
        var script = document.createElement('script');
        script.src = "https://spreadsheets.google.com/feeds/cells/" + test_scenarios_source_id + "/" + test_scenarios_sheet_id + "/public/values?alt=json-in-script&callback=y00940r";
        document.documentElement.appendChild(script);

        var panelCss = '.test-panel__part-switcher { display: inline; }' +
                       '.test-panel__part-switcher_active { font-weight: bold; }',
            head = document.head || document.getElementsByTagName('head')[0],
            style = document.createElement('style');

        style.type = 'text/css';
        if (style.styleSheet){
          style.styleSheet.cssText = panelCss;
        } else {
          style.appendChild(document.createTextNode(panelCss));
        }

        head.appendChild(style);

        var partSwitcherActive = document.getElementsByClassName("test-panel__part-switcher_active");
        document.addEventListener('click', function(e) {
          var t = e.target;
          if (t.classList.contains("test-panel__part-switcher")) {
            for (var i = 0; i < partSwitcherActive.length; i++) {
              partSwitcherActive[i].classList.remove("test-panel__part-switcher_active");
            }
            t.classList.toggle("test-panel__part-switcher_active");
          }
        });

        window.y00940r = function(data) {

            var table = [];
            data.feed.entry.map(function(cell) {
                var col = parseInt(cell.gs$cell.col) - 1;
                var row = parseInt(cell.gs$cell.row) - 1;
                var content = cell.gs$cell.$t;
                if(!table[row]) {
                    table[row] = [];
                }
                table[row][col] = content;
            });

            var head = table.shift();
            head = head.map(function(it) { return (it.match(/#([a-z_]+)/) || [])[1] });

            data = table.map(function(it) {
                var row = {};
                head.map(function(column, i) {
                    if(column) {
                        row[column] = it[i];
                    }
                });
                return row;
            });

            delete window.y00940r;
            panel = document.createElement('div');
            function place() {
                panel.style.cssText = 'position: fixed; z-index:10000;%left%:0; %top%: 0; padding: 10px; border: solid 1px gray; background-color: rgba(255,255,255,0.9); box-shadow: 0px 0px 5px 0px rgba(0,0,0,0.75);'
                    .replace("%top%" , ['br', 'bl', 'tl', 'tr'][side || 0].match(/t/) ? 'top'  : 'bottom')
                    .replace("%left%", ['br', 'bl', 'tl', 'tr'][side || 0].match(/l/) ? 'left' : 'right')
                ;
            }
            place();
            panel.innerHTML =
                '<div>' +
                '  <div style="margin-bottom: 0.5rem; font-size: 12px;"><b>Test panel</b>' +
                '    <a style="margin-bottom: 0.5rem; font-size: 10px;" href="https://docs.google.com/spreadsheets/d/' + test_scenarios_source_id + '/edit#gid=0" target="_blank">edit</a>' +
                '  </div>' +
                '  <select id="__test_group"></select>' +
                '  <button id="__test_place">&gt;&lt;</button>'+
                '  <div id="__test_steps"></div>'+
                '  <select id="__test_state"></select>' +
                '</div>'
            ;
            document.documentElement.appendChild(panel);
            document.querySelector('#__test_place').onclick = function() {side = ((side || 0) + 1) % 4; write_window_name(); place();};
            document.querySelector('#__test_steps').style.cssText = 'margin: 0.5rem 0; overflow: auto; width: 200px; font-size: 10px; font-family: arial;';
            var test_group = document.querySelector('#__test_group');
            test_group.onchange = function() {
                group = this.value;
                write_window_name();
                document.querySelector('#__test_steps').innerHTML = "";
                document.querySelector('#__test_steps').appendChild(formatSteps(data.filter(function(it) {return it.id == group;})[0].steps));
                fill_states();
            };
            data.map(function(it) {
                var opt = document.createElement('option');
                opt.value = it.id;
                opt.innerText = it.id;
                if(group == it.id) {
                    opt.selected = true;
                }
                test_group.appendChild(opt);
            });
            test_group.onchange();

            function fill_states() {
                var test_state = document.querySelector('#__test_state');
                test_state.innerHTML = '<option>Set state...</option>';
                (data.filter(function(it) {return it.id == group;})[0].states || '').split(/[^a-z_.-/]+/i).filter(function(it) { return it; }).map(function(it) {
                    var opt = document.createElement('option');
                    opt.value = it;
                    opt.innerText = it;
                    test_state.appendChild(opt);
                });
                test_state.onchange = function() {
                    var script = document.createElement('script'), select = this;
                    script.src = '/e2e-tests/states/' + select.value + '.js';
                    script.onerror = function() {
                        location.href = '/e2e-tests/states/' + select.value + '.html';
                    };
                    document.documentElement.appendChild(script);
                }
            }

            function formatSteps(steps) {
              var steps = steps || "";
              if (!steps) {
                console.error("Steps value is empty");
              }

              var stepsRegExp = /(\.{3}\s*|\.\s*|,\s*)/;
              var parts = steps.split(stepsRegExp).reduce(function(acc, item, index) {
                console.log(index);
                if (index % 2 === 0) {
                  acc.push(item);
                } else {
                  acc[acc.length - 1] = acc[acc.length - 1] + item;
                }

                return acc;
              }, []);

              var htmlParts = parts.reduce(function(acc, item) {
                if (item) {
                  var span = document.createElement('span');
                  span.classList.add("test-panel__part-switcher");
                  span.innerHTML = item;
                  acc.appendChild(span);
                }

                return acc;
              }, document.createElement('div'));

              return htmlParts;
            }
        };
    }
})();
