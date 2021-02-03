window.onload = () => {
    // variables

    function setup()
    {
        setupScreens();
        setupMenus();
        setupInputWidgets();
    }

    function setupScreens()
    {
        let screens = document.getElementById("screens");
        setupWrapper(screens, ["mainmenu", "game", "options", "gameover", "scoreboard", "moregames"]);
    }

    function setupMenus()
    {
        let mainmenu = document.getElementById("mainMenuButtonsWrapper");
        setupWrapper(mainmenu, ["mainmenu", "play", "custom"]);

        setupTransition(document.getElementById("playbtn"), mainmenu, "play");
        setupTransition(document.getElementById("playbackbtn"), mainmenu, "mainmenu");
        setupTransition(document.getElementById("custombtn"), mainmenu, "custom");
        setupTransition(document.getElementById("custombackbtn"), mainmenu, "play");
    }

    function setupWrapper(elem, names){
        elem.selected = elem.children[0];
        elem.names = names;

        elem.transition = (name) => {
            let subelem;
            if(typeof(name) == 'number') subelem = elem.children[number];
            else subelem = elem.children[elem.names.indexOf(name)];
            subelem.classList.toggle('selected');
            elem.selected.classList.toggle('selected');
            elem.selected = subelem;
        }
    }

    function setupTransition(elem, wrapper, destination){
        elem.addEventListener('click', () => {
            wrapper.transition(destination);
        });
    }

    function setupInputWidgets()
    {
        setupSliders();
        setupAdjNumberInputs();   
    }

    function setupAdjNumberInputs()
    {
        let adjNumberInputs = document.querySelectorAll('.adjNumberInput');
        adjNumberInputs.forEach(input => {
            let decrease = input.children[0];
            let typeinput = input.children[1];
            let increase = input.children[2];

            input.setOptions = (options) => {
                input.max = options.max || Number.NEGATIVE_INFINITY;
                input.min = options.min || Number.POSITIVE_INFINITY;
                input.increment = options.increment || 1;
                setValue(options.default || 0);
            }

            function setValue(amount)
            {
                amount = Math.round(amount/input.increment) * input.increment;
                if(amount > input.max) amount = input.max;
                if(amount < input.min) amount = input.min;
                input.value = amount;
                typeinput.value = amount;
            }

            function increment(sign)
            {
                let value = input.value;
                if(typeinput == document.activeElement) input.value = parseInt(typeinput.value);
                if(sign == '+') value = input.value + input.increment;
                else if(sign == '-') value = input.value - input.increment;
                value = Math.round(value/input.increment) * input.increment;
                if(value > input.max) value = input.max;
                if(value < input.min) value = input.min;
                input.value = value;
                typeinput.value = value;
            }

            decrease.addEventListener('mousedown', () => increment('-'));
            increase.addEventListener('mousedown', () => increment('+'));
            typeinput.addEventListener('blur', () => setValue(typeinput.value));
        });

        document.getElementById('timelimit').setOptions({default: 300, increment: 5, max: 9999, min: 5});
    }

    function setupSliders()
    {
        let sliders = document.querySelectorAll('.slider');
        sliders.forEach(slider => {
            let trolley = slider.firstElementChild;
            let icon = trolley.firstElementChild;
            slider.notches = [];
            slider.percent = 0;
            slider.pressed = false;
            slider.round = true;
            slider.changebuffer = 0.5;
            
            slider.addEventListener('mousedown', (e) => {
                slider.pressed = true;
                slider.x = trolley.getBoundingClientRect().x;
                slider.width = trolley.getBoundingClientRect().width;
                slider.changepercent(100*(e.clientX - slider.x)/slider.width);
            });
            window.addEventListener('mousemove', (e) => {
                if(slider.pressed) slider.changepercent(100*(e.clientX - slider.x)/slider.width);
            });

            slider.changepercent = function(percent)
            {
                percent = notch(percent);
                if(slider.round) percent = Math.round(percent);
                if(percent < 0) percent = 0;
                if(percent > 100) percent = 100;
                if(Math.abs(slider.percent - percent) > slider.changebuffer)
                {
                    icon.style.left = "calc(" + percent + "% - 7.5px)";
                    slider.percent = percent;
                    slider.changed();
                }
            }

            window.addEventListener('mouseup', () => {
                slider.pressed = false;
            });
            document.body.addEventListener('mouseleave', () => {
                slider.pressed = false;
            });

            function notch(per){
                let offset = 100;
                let notch = per;
                for(let i = 0; i < slider.notches.length; i++)
                {
                    let attempt = Math.abs(per-slider.notches[i]);
                    if(attempt < offset) 
                    {
                        notch = slider.notches[i];
                        offset = attempt;
                    }
                }
                return notch;
            }

            //array of functions
            slider.events = [];
            slider.spareindexes = [];

            slider.changed = function (){
                slider.events.forEach(fn => fn.func(slider.percent));
                if(slider.labelelem) slider.labelelem.textContent = slider.label;
            }

            slider.addevent = function(fn){
                let index = (slider.spareindexes.length == 0) ? slider.events.length : slider.spareindexes.pop();
                slider.events.push({index: index, func:fn});
                return index;
            }

            slider.removeevent = function (index){
                let temp = [];
                for(let i = 0; i < slider.events.length; i++)
                {
                    if(slider.events[i].index != index) temp.push(slider.events[i]);
                }
                slider.events = temp;
            }

            slider.labels = function(labels)
            {
                if(labels.length < 2) console.log('not enough labels for slider');
                else
                {
                    let notches = []
                    for(let i = 0; i < labels.length; i++)
                    {
                        notches.push(Math.round((100/(labels.length - 1))*i));
                    }
                    console.log(notches);
                    slider.notches = notches;
                    slider.addevent((percent) => {
                        slider.label = labels[slider.notches.indexOf(percent)];
                    })
                }
            }
        });

        let test = document.getElementById('wordsizeslider');
        test.labels([3,4,5,6,7,8,9]);
        test.labelelem = document.getElementById('wordsizelabel');
        test.changepercent(50);
    }

    setup();

}