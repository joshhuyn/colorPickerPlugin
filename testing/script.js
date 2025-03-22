function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let walls = [];

class Wall
{
    constructor(startX, startY, endX, endY)
    {
        this.startX = startX;
        this.startY = startY;
        this.endX = endX;
        this.endY = endY;

        walls.push(this);
    }
}

class Player
{
    constructor()
    {
        this.x = 500;
        this.y = 400;
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
        let posPrediction = player.y - player.speed;

        let boundsCheck = posPrediction >= 0;

        let wallCheck = false;

        return boundsCheck && wallCheck;
    }

    static checkDown = () =>
    {
        let posPrediction = player.y + player.speed;

        let boundsCheck = posPrediction < canvas.height;
        return boundsCheck;
    }

    static checkLeft = () =>
    {
        let posPrediction = player.x - player.speed;

        let boundsCheck = posPrediction >= 0;
        return boundsCheck;
    }

    static checkRight = () =>
    {
        let posPrediction = player.x + player.speed;

        let boundsCheck = posPrediction < canvas.height;
        return boundsCheck;
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

    #drawWalls = () =>
    {
        for (let wall of walls)
        {
            ctx.fillStyle = "hsl(0, 0%, 100%)";
            ctx.fillRect(wall.startX, wall.startY, wall.endX - wall.startX, wall.endY - wall.startY);
        }
    }

    #drawPlayer = () =>
    {
        ctx.fillStyle = "rgb(0, 200, 255)";
        ctx.fillRect(player.x, player.y, 10, 10);
    }

    draw = () =>
    {
        this.#drawBackground();
        this.#drawWalls();
        this.#drawPlayer();
    }
}

class Renderer3d
{
    #drawBackground = () =>
    {
        ctx.fillStyle = "hsl(0, 0%, 20%)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    #drawWalls = async () =>
    {
        for (const wall of walls)   
        {
            for (let ray = 0; ray < 180; ray++)
            {
                const angleToPlayer = (ray * Math.PI) / 180
                let inBounds = false

                //console.log(angleToPlayer);
                await new Promise(r => setTimeout(r, 1));

                for (let i = 0; i < 300; i++)
                {
                    ctx.fillStyle = "rgb(0, 255, 0)";
                    ctx.fillRect(player.x + i * Math.cos(angleToPlayer), player.y + i * Math.sin(angleToPlayer), 1, 1)
                    console.log(Math.cos(angleToPlayer));
                }
            }
        }
    }

    draw = () =>
    {
        this.#drawBackground();
        this.#drawWalls();

        ctx.fillStyle = "#741d2d";
        ctx.fillRect(player.x, player.y, 10, 10);

        for (let wall of walls)
        {
            ctx.fillStyle = "hsl(10, 0%, 100%)";
            ctx.fillRect(wall.startX, wall.startY, wall.endX - wall.startX, wall.endY - wall.startY);
        }
    }
}

class GameHandler
{
    #startGameLoop = async () =>
    {
        //while (true)
        //{
            await new Promise(r => setTimeout(r, 100));
            this.characterController.framestep();
            this.renderer.draw();
        //}
    }

    init = () =>
    {
        player = new Player()

        this.renderer = new Renderer3d();
        this.characterController = new CharacterController2d();

        new Wall(600, 600, 610, 610);
        new Wall(610, 600, 620, 610);
        new Wall(620, 600, 630, 610);
        new Wall(630, 600, 640, 610);
        new Wall(640, 600, 650, 610);
        new Wall(650, 600, 660, 610);
        new Wall(660, 600, 670, 610);
        new Wall(670, 600, 680, 610);
        new Wall(680, 600, 690, 610);
        new Wall(690, 600, 700, 610);

        //new Wall(600, 600, 610, 1000);
        //new Wall(600, 600, 1000, 610);

        this.#startGameLoop();
    }
}

let handler = new GameHandler();
handler.init();
console.log("test")
