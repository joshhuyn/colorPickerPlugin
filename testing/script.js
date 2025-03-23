function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let walls = [];

let debug = true;

class Wall
{
    constructor(startX, startY, endX, endY, color)
    {
        this.startX = startX;
        this.startY = startY;
        this.endX = endX;
        this.endY = endY;

        this.color = color;

        walls.push(this);
    }
}

class Player
{
    constructor()
    {
        this.x = 500;
        this.y = 400;
        this.angle = 0;
        this.speed = 5;
        this.turningSpeed = 5;
    }
}


let canvas = document.getElementById("gameWindow");
let ctx = canvas.getContext("2d");

let player;

class MathUtils
{
    static degreeToRadian = (degree) =>
    {
        return degree * (Math.PI / 180);
    }

    static getPixelX(distance, degree)
    {
        return distance * Math.cos(MathUtils.degreeToRadian(degree));
    }

    static getPixelY(distance, degree)
    {
        return distance * Math.sin(MathUtils.degreeToRadian(degree));
    }
}

class CollisionUtils
{
    static checkCollision(x, y)
    {
        return CollisionUtils.isInBounds(x, y) && !CollisionUtils.isInWall(x, y)
    }

    static isInBounds(x, y)
    {
        if (x > canvas.width || x < 0)
        {
            return false;
        }

        if (y > canvas.height || y < 0)
        {
            return false;
        }
        
        return true;
    }

    static isInWall(x, y)
    {
        return CollisionUtils.getCollidingWall(x, y) != undefined;
    }

    static getCollidingWall(x, y)
    {
        for (const wall of walls)
        {
            let xIsValid = x >= wall.startX && x <= wall.endX;
            let yIsValid = y >= wall.startY && y <= wall.endY

            if (xIsValid && yIsValid)
            {
                return wall;
            }
        }


        return undefined;
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

            rotate_clockwise : false,
            rotate_counter_clockwise : false,
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

        if (e.key === "i")
        {
            this.directions.rotate_clockwise = false;
        }
        if (e.key === "u")
        {
            this.directions.rotate_counter_clockwise = false;
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

        if (e.key === "i")
        {
            this.directions.rotate_clockwise = true;
        }
        if (e.key === "u")
        {
            this.directions.rotate_counter_clockwise = true;
        }
    }

    framestep = () =>
    {

        if (this.directions.up)
        {
            const xPrediction = player.x + MathUtils.getPixelX(player.speed, player.angle)
            const yPrediction = player.y + MathUtils.getPixelY(player.speed, player.angle)

            if (CollisionUtils.checkCollision(xPrediction, yPrediction))
            {
                player.x = xPrediction;
                player.y = yPrediction;
            }
        }
        if (this.directions.down)
        {
            const xPrediction = player.x - MathUtils.getPixelX(player.speed, player.angle)
            const yPrediction = player.y - MathUtils.getPixelY(player.speed, player.angle)

            if (CollisionUtils.checkCollision(xPrediction, yPrediction))
            {
                player.x = xPrediction;
                player.y = yPrediction;
            }
        }
        if (this.directions.left)
        {
            const xPrediction = player.x - MathUtils.getPixelX(player.speed, player.angle + 90)
            const yPrediction = player.y - MathUtils.getPixelY(player.speed, player.angle + 90)

            if (CollisionUtils.checkCollision(xPrediction, yPrediction))
            {
                player.x = xPrediction;
                player.y = yPrediction;
            }
        }
        if (this.directions.right)
        {
            const xPrediction = player.x + MathUtils.getPixelX(player.speed, player.angle + 90)
            const yPrediction = player.y + MathUtils.getPixelY(player.speed, player.angle + 90)

            if (CollisionUtils.checkCollision(xPrediction, yPrediction))
            {
                player.x = xPrediction;
                player.y = yPrediction;
            }
        }

        if (this.directions.rotate_clockwise)
        {
            player.angle += player.turningSpeed;
        }
        if (this.directions.rotate_counter_clockwise)
        {
            player.angle -= player.turningSpeed;

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
            const fov = 90;
            const fovHalf = Math.floor(fov / 2);
            for (let ray = -1 * (fovHalf); ray <= fovHalf; ray++)
            {
                let distance = 1;
                let inBounds = true;

                let wall = undefined;

                //await new Promise(r => setTimeout(r, 1));

                while (inBounds)
                {
                    distance += 10;

                    let currentX = player.x + MathUtils.getPixelX(distance, player.angle + ray);
                    let currentY = player.y + MathUtils.getPixelY(distance, player.angle + ray);


                    if (currentX < 0 || currentY < 0 || (Math.floor(Math.abs(currentX)) >= canvas.width || currentY >= canvas.height))
                    {
                        inBounds = false;
                    }

                    wall = CollisionUtils.getCollidingWall(Math.floor(currentX), Math.floor(currentY));

                    if (wall != undefined)
                    {
                        inBounds = false;
                        let step = canvas.width / fov;
                        let distanceInMeters = distance;

                        ctx.fillStyle = wall.color;
                        ctx.fillRect(step*(ray + fovHalf), distanceInMeters / 2, step, canvas.height - distanceInMeters)
                    }

                    if (debug)
                    {
                        ctx.fillStyle = "rgb(0, 255, 0)";
                        ctx.fillRect(currentX, currentY, 1, 1)
                    }
                }
            }
        }
    }

    draw = () =>
    {
        this.#drawBackground();
        this.#drawWalls();


        if (debug)
        {
            ctx.fillStyle = "#741d2d";
            ctx.fillRect(player.x, player.y, 10, 10);
            for (let wall of walls)
            {
                ctx.fillStyle = "hsl(10, 0%, 100%)";
                ctx.fillRect(wall.startX, wall.startY, wall.endX - wall.startX, wall.endY - wall.startY);
            }
        }
    }
}

class GameHandler
{
    #startGameLoop = async () =>
    {
        while (true)
        {
            await new Promise(r => setTimeout(r, 10));
            this.characterController.framestep();
            this.renderer.draw();
        }
    }

    init = () =>
    {
        player = new Player()

        this.renderer = new Renderer3d();
        this.characterController = new CharacterController2d();

        new Wall(600, 600, 610, 610, "rgb(0, 0, 0)");
        //new Wall(610, 600, 620, 610, "rgb(255, 255, 255)");
        //new Wall(620, 600, 630, 610, "rgb(255, 255, 255)");
        //new Wall(630, 600, 640, 610, "rgb(255, 255, 255)");
        //new Wall(640, 600, 650, 610, "rgb(255, 255, 255)");
        //new Wall(650, 600, 660, 610, "rgb(255, 255, 255)");
        //new Wall(660, 600, 670, 610, "rgb(255, 255, 255)");
        //new Wall(670, 600, 680, 610, "rgb(255, 255, 255)");
        //new Wall(680, 600, 690, 610, "rgb(255, 255, 255)");
        //new Wall(690, 600, 700, 610, "rgb(0, 0, 0)");

        new Wall(600, 600, 610, 1000, "rgb(255, 255, 255)");
        new Wall(600, 600, 1000, 610, "rgb(255, 255, 255)");

        this.#startGameLoop();
    }
}

let handler = new GameHandler();
handler.init();
console.log("test")
