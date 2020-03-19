(function () {
    'use strict';

    /* DOM elements */

    var simulationContainer = document.getElementById('simulation');
    var parametersContainer = document.getElementById('parameters');
    var borderBtnsContainer = document.getElementById('borders-btns');
    var simulationEndBtnsContainer = document.getElementById('simulation-end-btns');

    var simulation = {
        'canvas': document.getElementById('simulation-canvas'),
        'dimensions': document.getElementById('simulation-dimensions')
    };
    var chart = {
        'canvas': document.getElementById('chart-canvas'),
        'dimensions': document.getElementById('chart-dimensions')
    };
    var btns = {
        'start': document.getElementById('start'),
        'adjust': document.getElementById('adjust'),
        'restart': document.getElementById('restart')
    };
    var borderBtns = {
        'left': document.getElementById('left-border'),
        'right': document.getElementById('right-border')
    };
    var sliders = {
        'population': [
            document.getElementById('population-slider'),
            document.getElementById('population-number')
        ],
        'sick': [
            document.getElementById('sick-slider'),
            document.getElementById('sick-percent')
        ],
        'distancing': [
            document.getElementById('distancing-slider'),
            document.getElementById('distancing-percent')
        ],
        'infection': [
            document.getElementById('infection-slider'),
            document.getElementById('infection-percent')
        ],
        'death': [
            document.getElementById('death-slider'),
            document.getElementById('death-percent')
        ]
    };
    var stats = {
        'healthy': document.getElementById('healthy-number'),
        'sick': document.getElementById('sick-number'),
        'recovered': document.getElementById('recovered-number'),
        'dead': document.getElementById('dead-number')
    };

    /* Helper functions */

    function hide(element) {
        element.style.display = 'none';
    }
    function show(element) {
        element.style.display = 'block';
    }
    function simulationEnd() {
        hide(borderBtnsContainer);
        show(simulationEndBtnsContainer);
    }
    function simulationStats(data) {
        Object.keys(stats).forEach(function(key) {
            stats[key].innerHTML = data[key];
        });
    }
    function resetBorderBtnsText() {
        Object.keys(borderBtns).forEach(function(key) {
            borderBtns[key].value = 'Close ' + key + ' border';
        });
    }
    function addSliderEventListener(event, key) {
        sliders[key][0].addEventListener(event, function() {
            sliders[key][1].innerHTML = sliders[key][0].value;
        });
    }

    /* Attach event listeners */

    btns.start.addEventListener('click', function(){
        show(borderBtnsContainer);
        hide(simulationEndBtnsContainer);

        hide(parametersContainer);
        show(simulationContainer);

        resetBorderBtnsText();

        // start simulation
        var slidersValues = {};
        Object.keys(sliders).forEach(function(key) {
            slidersValues[key] = parseInt(sliders[key][0].value);
        });
        window.Simulation.init(simulation, chart, simulationStats, simulationEnd, {
            'totalPopulation': slidersValues.population,
            'sickPopulation': parseInt(slidersValues.population * slidersValues.sick / 100),
            'socialDistancingPopulation': parseInt(slidersValues.population * slidersValues.distancing / 100),
            'infectionRate': slidersValues.infection / 100,
            'deathRate': slidersValues.death / 100
        });
    });
    btns.adjust.addEventListener('click', function(){
        show(parametersContainer);
        hide(simulationContainer);
        // end simulation
        window.Simulation.clear();
    });
    btns.restart.addEventListener('click', function(){
        show(borderBtnsContainer);
        hide(simulationEndBtnsContainer);

        resetBorderBtnsText();

        // restart simulation
        window.Simulation.restart();
    });
    Object.keys(borderBtns).forEach(function(key) {
        borderBtns[key].addEventListener('click', function(){
            borderBtns[key].value = (window.Simulation.border(key) ? 'Open' : 'Close') + ' ' + key + ' border';
        });
    });
    Object.keys(sliders).forEach(function(key) {
        addSliderEventListener('change', key);   // for Internet Explorer
        addSliderEventListener('input', key);    // for the rest browsers
    });

}());