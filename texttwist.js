window.onload = () => {
    // variables

    function setup()
    {
        setupScreens();
    }

    function setupScreens()
    {
        let screens = document.getElementById("screens");
        screens.selected = screens.children[0];
        screens.names = ["mainmenu", "game", "options", "gameover", "scoreboard"];

        screens.transition = (name) => {
            let screen = screens.children[screen.names.indexOf(name)];
            screen.classList.toggle('selected');
            screens.selected.classList.toggle('selected');
            screens.selected = screen;
        }
    }

    setup();
}