window.onload = function()
{
    var wordlist = [];
    var words = [];
    var sevenwords = [];
    var mainword = "";
    var answers = [];
    var tiles = [];
    var currentword = "";
    var currenttiles = [];
    var lastword = "";
    var points = 0;

    var scoreboardelement = document.createElement('div');
    
    /*var numletters = 7;
    var forrandom = ""
    for(let i = 0; i < numletters; i++)
    {
        forrandom+=i;
    }*/
    var placeholders = document.querySelectorAll(".tilePlaceholder");
    var ytop = 0;
    var ybot = 0;
    var xpos = [];

    function findAlignment()
    {
        ytop = placeholders[0].getBoundingClientRect().y;
        ybot = placeholders[placeholders.length-1].getBoundingClientRect().y;
        xpos = [];
        for(let i = 0; i < (placeholders.length/2); i++)
        {
            xpos.push(placeholders[i].getBoundingClientRect().x);
        }
    }
    findAlignment();

    var tilesorigin = document.getElementById('tilesOrigin');

    function animate(elem, endx, endy, time)
    {
        if(elem.timer != 0) clearInterval(elem.timer);
        elem.timer = 0;
        let fps = 120;
        let steps = time*fps;
        let counter = 0;
        let chunky = (endy - elem.y)/steps;
        let chunkx = (endx - elem.x)/steps;
        let timer = setInterval(function(){
            if(counter>=steps)
            {
                clearInterval(timer);
                elem.timer = 0;
            }
            else
            {
                counter++;
                elem.y = elem.y + chunky;
                elem.x = elem.x + chunkx;
            }
        }, 1000/fps);
        elem.timer = timer;
    }

    var input = document.getElementById('input');
    input.addEventListener("change", handleFiles, false);

    function handleFiles() {
        if (this.files && this.files[0])
        {
            var myFile = this.files[0];
            var reader = new FileReader();
            reader.addEventListener('load', function (e) {
              wordlist = e.target.result.split("\n");
              console.log(wordlist.length);
              removeWords();
              ready();
            });
            reader.readAsBinaryString(myFile);
        }
    }

    function removeWords()
    {
        for(let i = 0; i < wordlist.length; i++)
        {
            let word = wordlist[i].trim();
            if(word.length <= 7  && word.length >= 3)
            {
                words.push(word);
                if(word.length == 7)
                {
                    sevenwords.push(word);
                }
            }
        }
        console.log(words.length);
    }

    function validate()
    {
        let ind = answers.findIndex(item => item.value == currentword);
        if(ind != -1)
        {
            answers[ind].show()
            answers.splice(ind, 1);
            if(answers.length == 0) alert("yay");
            lastword = currentword;
            scoreboardelement.addWord(currentword);
            refreshTiles();
        }
    }
    
    function handleBackspace()
    {
        if(!currenttiles.length == 0)
        {
            let t = currenttiles[currenttiles.length-1];
            t.isSelected = false;
            currentword = currentword.substr(0,currenttiles.length-1);
            currenttiles.pop();
            animate(t, xpos[t.id], ybot, 0.2)
        }
    }

    function handleSpace()
    {
        tiles.shuffle();
        for(let i = 0; i < tiles.length; i++)
        {
            let t = tiles[i];
            t.id = i;
            if(!t.isSelected) animate(t, xpos[i], ybot, 0.2);
        }

    }

    function handleReuseWord()
    {
        if(currentword != lastword)
        {
            refreshTiles();
            for(let i = 0; i < lastword.length; i++)
            {
                handleKey(lastword[i]);
            }
        }
    }

    function handleKey(key)
    {
        key = key.toLowerCase();
        if(mainword.includes(key))
        {
            for(let i = 0; i < tiles.length; i++)
            {
                let t = tiles[i];
                if(!t.isSelected && t.innerText.toLowerCase() == key)
                {
                    currentword += key;
                    currenttiles.push(t);
                    t.isSelected = true;
                    animate(t, xpos[currenttiles.length-1], ytop, 0.2);
                    break;
                }
            }
        }
    }

    function refreshTiles()
    {
        for(let i = 0; i < currenttiles.length; i++)
        {
            let t = currenttiles[i];
            t.isSelected = false;
            animate(t, xpos[t.id], ybot, 0.2);
        }
        currenttiles = [];
        currentword = "";
    }

    function createTiles(word)
    {
        //in case i want option to delete tiles
        /*if(tiles.length != 0)
        {
            for(let i = 0; i < tiles.length; i++)
            {
                tiles[i].parentNode.removeChild(tiles[i]);
            }
            tiles = []
        }*/
        for(let i = 0; i < word.length; i++)
        {
            tiles.push(createTile(i, word[i]));
        }
    }

    function createTile(id, letter)
    {
        var tile = document.createElement('div');
        tile.className = "tile";
        tilesorigin.appendChild(tile);
        Object.defineProperty(tile, 'x', 
        {
            get(){return this._x},
            set(val){
                this._x = val;
                this.style.left = val + 'px';
            }
        });
        Object.defineProperty(tile, 'y', 
        {
            get(){return this._y},
            set(val){
                this._y = val;
                this.style.top = val + 'px';
            }
        });
        tile.y = ybot;
        tile.x = xpos[id];
        tile.id = id;
        tile.innerText = letter;
        tile.isSelected = false;
        tile.timer = 0;
        return tile;
    }

    function createAnswerTiles()
    {
        var answerarea = document.getElementById("answers");
        var wordareas = [];
        for(let i = 2; i < mainword.length; i++)
        {
            let words = document.createElement('div');
            words.className = "words";
            answerarea.appendChild(words)
            wordareas.push(words);
        }
        answers.sort();
        for(let i = 0; i < answers.length; i++)
        {
            let word = answers[i];
            let wordarea = document.createElement('div');
            wordarea.className = "word";
            let tiles = [];
            for(let j = 0; j < word.length; j++)
            {
                let tile = document.createElement('div');
                tile.className = "tile";
                tile.letter = word[j];
                wordarea.appendChild(tile);
                tiles.push(tile);
            }
            answers[i] = 
            {
                value: word,
                tiles: tiles, 
                show: function()
                {
                    for(let j = 0; j < this.tiles.length; j++)
                    {
                        this.tiles[j].innerText = this.tiles[j].letter;
                    }
                },
                showOver: function()
                {
                    for(let j = 0; j < this.tiles.length; j++)
                    {
                        this.tiles[j].style.backgroundColor = "blue";
                        this.tiles[j].innerText = this.tiles[j].letter;
                    }
                } 
            };
            wordareas[mainword.length - word.length].appendChild(wordarea);
        }
    }

    function ready()
    {
        console.log("lets play");
        console.log(sevenwords.length);
        mainword = sevenwords[Math.floor(Math.random() * sevenwords.length)];
        console.log(mainword);

        window.addEventListener('keydown', function(e){
            if(e.key == "Enter")
            {
                e.preventDefault();
                if(currentword.length == 0) handleReuseWord();
                else if(currentword == lastword) refreshTiles();
                else validate()
            }
            else if(e.key == "Backspace")
            {
                handleBackspace();
            }
            else if(e.key == " ")
            {
                e.preventDefault();
                handleSpace();
            }
            else if(e.key == "ArrowUp")
            {
                e.preventDefault();
                handleReuseWord();
            }
            else if(e.key == "ArrowDown")
            {
                e.preventDefault();
                refreshTiles();
            }
            else
            {
                handleKey(e.key);
            }
        });

        function getAnswers(word)
        {
            if(word.length == 2)
            {
                if(word[0] == word[1]) return [word];
                else return [word, word[1] + word[0]];
            }
            else
            {
                let out = [];
                for(let i = 0; i < word.length; i++)
                {
                    //let [head, ...tail] = word;
                    let head = word[0];
                    let tail = word.substr(1);
                    let arr = getAnswers(tail);
                    for(let j = 0; j < arr.length; j++)
                    {
                        let ans = head + arr[j];
                        if(!out.includes(ans)) out.push(ans);
                        if(!answers.includes(ans) && words.includes(ans)) answers.push(ans);
                    }
                    word = tail + head;
                }
                return out;
            }
        }
        getAnswers(mainword);

        String.prototype.shuffle = function () {
            var a = this.split(""),
                n = a.length;
        
            for(var i = n - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var tmp = a[i];
                a[i] = a[j];
                a[j] = tmp;
            }
            return a.join("");
        }

        Array.prototype.shuffle = function () {
            var n = this.length;
        
            for(var i = n - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var tmp = this[i];
                this[i] = this[j];
                this[j] = tmp;
            }
            return this;
        }

        createTiles(mainword.shuffle());

        createAnswerTiles();
        
        function align()
        {
            findAlignment();
            for(let i = 0; i < tiles.length; i++)
            {
                tiles[i].x = xpos[tiles[i].id];
            }
        }

        align();
        window.addEventListener('resize', align);

        function isPlural(str)
        {
            if(str[str.length-1] == "s") return true;
            else return false;
        }

        var timer = 0;
        var timerelement = document.createElement('div');

        function formatTime(seconds)
        {
            let secs = seconds%60;
            let mins = (seconds-secs)/60;
            if(secs < 10) secs = "0"+secs;
            else secs+="";
            return mins + ":" + secs;
        }

        function setUpTimer()
        {
            timerelement.className = "timer";
            document.body.appendChild(timerelement);
            Object.defineProperty(timerelement, 'time', 
            {
                get(){return this._time},
                set(val){
                    this._time = val;
                    this.innerText = formatTime(this._time);
                }
            });
            
            function workoutTime(arr)
            {
                let time = 0;
                let timeFactor = 1.5;
                for(let i = 0; i < arr.length; i++)
                {
                    let word = arr[i].value;
                    let val = word.length * timeFactor;
                    if(isPlural(word)) val*=0.5;
                    time+=val;
                }
                return Math.floor(time);
            }

            timerelement.time = workoutTime(answers);

            function myTimer() 
            {
                if(timerelement.time == 0)
                {
                    clearInterval(timer);
                    gameOver();
                }
                else
                {
                    timerelement.time -= 1;
                }
                
            }
            timer = setInterval(myTimer, 1000);
        }
        setUpTimer();

        function setUpScoreboard()
        {
            scoreboardelement.className = "scoreboard";
            document.body.appendChild(scoreboardelement);
            Object.defineProperty(scoreboardelement, 'score', 
            {
                get(){return this._score},
                set(val){
                    this._score = val;
                    this.innerText = this._score;
                }
            });
            scoreboardelement.score = 0;

            scoreboardelement.addWord = function(str)
            {
                let scoreFactor = 100;
                let val = str.length*scoreFactor;
                if(isPlural(str)) val*=0.5;
                this.score += val;
            }
        }
        setUpScoreboard();

        function gameOver()
        {
            for(let i = 0; i < answers.length; i++)
            {
                answers[i].showOver();
            }
        }
    }
}