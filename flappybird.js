let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

//bird
let birdWidth = 34;
let birdHeight = 24;
let birdX = boardWidth/8;
let birdY = boardHeight/2;
let birdimg;

let bird = {
    x : birdX,
    y : birdY,
    width : birdWidth,
    height : birdHeight
}
//pipe
let pipeArray = [];
let pipeWidth = 64;
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeimg;
let bottomPipeimg;

//physics
let veloctyX = -2; //pipes moving left screen
let velocityY = 0;//bird jump speed
let gravity = 0.4;
let gameOver = false;

let score = 0;

window.onload = function()
{
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    //draw floppy bird
    // context.fiilStyle = 'green';
    // context.fillRect(bird.x, bird.y, bird.width, bird.height );

    birdimg = new Image();
    birdimg.src = "./flappybird.png";
    birdimg.onload = function(){

        context.drawImage(birdimg, bird.x, bird.y, bird.width, bird.height); 
    }

    topPipeimg = new Image();
    topPipeimg.src = "./toppipe.png";

    bottomPipeimg = new Image();
    bottomPipeimg.src = "./bottompipe.png";
    requestAnimationFrame(update);

    setInterval(placePipes, 1500);
    document.addEventListener("keydown", moveBird);
}

async function update()
{

    requestAnimationFrame(update);
    if(gameOver)
    {


        return;
    }
    context.clearRect(0, 0, boardWidth, boardHeight);

    // bird
    velocityY += gravity;
    // bird.y += velocityY;
    bird.y = Math.max(bird.y + velocityY, 0);//apply gravity to current bird.y, limit the bird.y to top of the canvas 
    context.drawImage(birdimg, bird.x, bird.y, bird.width, bird.height);

    if(bird.y > board.height)
    {
        gameOver = true;
    }
    //pipes
    for(let i = 0; i<pipeArray.length; i++)
    {
        let pipe = pipeArray[i];
        pipe.x += veloctyX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);
        
        if(!pipe.passed && bird.x > pipe.x + pipe.width)
        {
            score += 0.5;//because the pipes are in pair and thats why if we want to increase value by 1 for each pair we have to update by 0.5 for each pipe
            pipe.passed = true;
        }
        if(detectCollision(bird, pipe))
        {
            gameOver = true;
        }
    }
    // clear pipes
    while(pipeArray.length > 0 && pipeArray[0].x < -pipeWidth)
    {
        pipeArray.shift();//removes first element from the array
    }
    //score
    context.fillStyle = 'white';
    context.font = '45px sans-serif';
    context.fillText("Score: "+score, 5, 45);
    if(gameOver)
    {
        const gameName = "flappybird";
        const token = localStorage.getItem('token');

        const response = await fetch('/highscore', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ score, token, gameName })
        });

        context.fillText("Game over :(", 5, 90);
    }
}

function placePipes()
{       
    if(gameOver)
    {
        return;
    }
    //(0-1) * pipeHeight/2,
    //0 -> -128 (pipeHeight/4);
    //1 -> -128 - 256 (pipeHeight/4 - pipeHeight/2) = -3/4 pipeHeight
    let randomPipeY = pipeY - pipeHeight/4 - Math.random()*(pipeHeight/2);
    let openingSpace = board.height/4;
    let toppipe = {
        img : topPipeimg,
        x : pipeX,
        y : randomPipeY,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }

    pipeArray.push(toppipe);

    let bottomPipe = {
        img : bottomPipeimg,
        x : pipeX,
        y : randomPipeY + pipeHeight + openingSpace,
        width : pipeWidth,
        height : pipeHeight,
        passed : false

    }
    pipeArray.push(bottomPipe);
    


}
function moveBird(e)
{
    if(e.code == "Space"||e.code == "ArrowUp" || e.code == "KeyX")
    {
        //jump
        velocityY = -6;

        //reset game
        if(gameOver)
        {
           bird.y = birdY;
           pipeArray = [];
           score = 0;
           gameOver = false;
        }
    }
}
function detectCollision(a,b)
{
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}