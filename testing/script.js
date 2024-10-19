function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

class Player
{
    constructor()
    {
        this.x = 10;
        this.y = 10;
        this.speed = 10;
    }
}


let canvas = document.getElementById("gameWindow");
let ctx = canvas.getContext("2d");

let player;

class CollisionUtils
{
    static checkUp = () =>
    {
        return player.y - player.speed >= 0;
    }

    static checkDown = () =>
    {
        return player.y + player.speed < canvas.height;
    }

    static checkLeft = () =>
    {
        return player.x - player.speed >= 0;
    }

    static checkRight = () =>
    {
        return player.x + player.speed < canvas.height;
    }
}

class CharacterController2d
{
    constructor()
    {
        this.directions =
        {
            up : false,
            down : false,
            left : false,
            right : false,
        }

        document.addEventListener("keydown", this.keyDownEvent);
        document.addEventListener("keyup", this.keyUpEvent);
    }

    keyUpEvent = e =>
    {
        if (e.key === "w")
        {
            this.directions.up = false;
        }
        if (e.key === "s")
        {
            this.directions.down = false;
        }
        if (e.key === "a")
        {
            this.directions.left = false;
        }
        if (e.key === "d")
        {
            this.directions.right = false;
        }
    }

    keyDownEvent = e =>
    {
        if (e.key === "w")
        {
            this.directions.up = true;
        }
        if (e.key === "s")
        {
            this.directions.down = true;
        }
        if (e.key === "a")
        {
            this.directions.left = true;
        }
        if (e.key === "d")
        {
            this.directions.right = true;
        }
    }

    framestep = () =>
    {
        if (this.directions.up && CollisionUtils.checkUp())
        {
            player.y -= player.speed;
        }
        if (this.directions.down && CollisionUtils.checkDown())
        {
            player.y += player.speed;
        }
        if (this.directions.left && CollisionUtils.checkLeft())
        {
            player.x -= player.speed;
        }
        if (this.directions.right && CollisionUtils.checkRight())
        {
            player.x += player.speed;
        }
    }
}

class Renderer2d
{
    #drawBackground = () =>
    {
        ctx.fillStyle = "hsl(0, 0%, 20%)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    #drawPlayer = () =>
    {
        ctx.fillStyle = "rgb(255, 0, 0)";
        ctx.fillRect(player.x, player.y, 10, 10);
    }

    draw = () =>
    {
        this.#drawBackground();
        this.#drawPlayer();
    }
}

class GameHandler
{
    #startGameLoop = async () =>
    {
        while (true)
        {
            await new Promise(r => setTimeout(r, 100));
            this.characterController.framestep();
            this.renderer.draw();
        }
    }

    init = () =>
    {
        player = new Player()

        this.renderer = new Renderer2d();
        this.characterController = new CharacterController2d();

        this.#startGameLoop();
    }
}

let handler = new GameHandler();
handler.init();
console.log("test")
