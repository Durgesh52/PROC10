var p5Inst = new p5(null, 'sketch');

window.preload = function () {
  initMobileControls(p5Inst);

  p5Inst._predefinedSpriteAnimations = {};
  p5Inst._pauseSpriteAnimationsByDefault = false;
  var animationListJSON = {"orderedKeys":["26b6790a-3997-48d6-bb2d-047d24e9f8be","e1eabc65-3f57-4493-93da-1fe6f87f4769","02ef3b0e-da99-4cc2-a51d-23721541f879"],"propsByKey":{"26b6790a-3997-48d6-bb2d-047d24e9f8be":{"name":"snake","sourceUrl":"assets/api/v1/animation-library/cqSKJcNy226Aisl3Jt3nFansw25H8kmK/category_animals/snake.png","frameSize":{"x":256,"y":291},"frameCount":1,"looping":true,"frameDelay":2,"version":"cqSKJcNy226Aisl3Jt3nFansw25H8kmK","loadedFromSource":true,"saved":true,"sourceSize":{"x":256,"y":291},"rootRelativePath":"assets/api/v1/animation-library/cqSKJcNy226Aisl3Jt3nFansw25H8kmK/category_animals/snake.png"},"e1eabc65-3f57-4493-93da-1fe6f87f4769":{"name":"color1","sourceUrl":null,"frameSize":{"x":48,"y":23},"frameCount":1,"looping":true,"frameDelay":12,"version":"qINZGFF_uSF1hrjF00Tww3hPk0tfmnyn","loadedFromSource":true,"saved":true,"sourceSize":{"x":48,"y":23},"rootRelativePath":"assets/e1eabc65-3f57-4493-93da-1fe6f87f4769.png"},"02ef3b0e-da99-4cc2-a51d-23721541f879":{"name":"paddle","sourceUrl":null,"frameSize":{"x":128,"y":128},"frameCount":1,"looping":true,"frameDelay":12,"version":"cS_Y9kunfSUM3_Y_1qgZEnQu8Cr3IAsN","loadedFromSource":true,"saved":true,"sourceSize":{"x":128,"y":128},"rootRelativePath":"assets/02ef3b0e-da99-4cc2-a51d-23721541f879.png"}}};
  var orderedKeys = animationListJSON.orderedKeys;
  var allAnimationsSingleFrame = false;
  orderedKeys.forEach(function (key) {
    var props = animationListJSON.propsByKey[key];
    var frameCount = allAnimationsSingleFrame ? 1 : props.frameCount;
    var image = loadImage(props.rootRelativePath, function () {
      var spriteSheet = loadSpriteSheet(
          image,
          props.frameSize.x,
          props.frameSize.y,
          frameCount
      );
      p5Inst._predefinedSpriteAnimations[props.name] = loadAnimation(spriteSheet);
      p5Inst._predefinedSpriteAnimations[props.name].looping = props.looping;
      p5Inst._predefinedSpriteAnimations[props.name].frameDelay = props.frameDelay;
    });
  });

  function wrappedExportedCode(stage) {
    if (stage === 'preload') {
      if (setup !== window.setup) {
        window.setup = setup;
      } else {
        return;
      }
    }
// -----

// constants to control game play
var NUMBER_OF_LIVES = 2;

// create 3 sides so that the ball bounces off T, R, L, but not B
createEdgeSprites();
edges.remove(bottomEdge);

// Game control variables:
var score;                          // current score, displayed on screen
var lives = NUMBER_OF_LIVES;        // number of lives
var flagGameOn;                     // if true, game is in motion
var flagGameOver;                   // if true, game has been lost

// create sprite for paddle
var paddle = createSprite(200,425);
paddle.scale = 0.75;
paddle.setAnimation("paddle");
paddle.setCollider("circle");       // setting as a circle allows angle change 

// create sprite for the ball
var ball = createSprite();
ball.setAnimation("snake");
ball.scale = 0.15;
ball.setCollider("circle");

// create blocks at top of screen
var blocks = createGroup();
var columnCount = 8;
var rowCount = 5;
var blockCount = 0;

initNewGame();

function draw() {
  background("lightblue");
  
  if (flagGameOver == false){
    
    if (flagGameOn){          // if game is in motion
      ball.bounceOff(edges);
      paddleHit();
      blockHit();
      bottomHit();
    } else if (keyWentDown("space")) {  // if space pressed, start it up
      startGame();
    }
    
    drawSprites();
    
  }
  keyPressed();
  updateHUD();
}

/* Get ready for a complete restart of the game */
function initNewGame(){
  flagGameOn = false;
  flagGameOver = false;
  score = 0;
  lives = NUMBER_OF_LIVES;
  resetBallStartingLocation();
  createBlocks();
}

/* put ball in the center of the screen ready to drop */
function resetBallStartingLocation(){
  ball.x = 200;
  ball.y = 250;
}

/* start the ball falling, set flags appropriately */
function startGame() {
  ball.velocityX = randomNumber(-3, 3);
  ball.velocityY = randomNumber(4, 7);
  flagGameOn = true;
  flagGameOver = false;
}

// Create a grid of blocks towards the top of the screen
function createBlocks(){
  blocks.destroyEach();
  for (var j=0; j<rowCount; j++){
    for (var i=0; i<columnCount; i++){
      var newBlock = createSprite(); 
      newBlock.x = i*50 + 25;
      newBlock.y = j*25 + 80;
      newBlock.width = 48;
      newBlock.height = 23;
      newBlock.shapeColor = rgb(randomNumber(0,255), randomNumber(0,255), randomNumber(0,255), 1);
      
      // add the new block to the group
      blocks.add(newBlock);
    }  
  }
  blockCount = rowCount * columnCount;  // how many blocks are there
}

/* does the ball hit the paddle at the bottom? 
    If screen is clear of blocks, reload it with blocks */
function paddleHit(){
  if (ball.isTouching(paddle)) {
    ball.bounceOff(paddle);
    if (blockCount == 0) createBlocks();  // if no blocks exist, create a new grid of blocks
  }
}


// determine which block was hit, destroy it, and update the score
function blockHit(){
  
  for (var i=0; i<blockCount; i++){
    var block = blocks.get(i);
    if (block.isTouching(ball)){
      ball.bounceOff(block);
      block.destroy();
      blockCount --;
      score ++;
      
      // don't let the ball go too horizontal
      if (abs(ball.velocityY) < 0.5) {
        ball.velocityY = ball.velocityY * 2;
      }
    }
  }
}

/* Process all key strokes here */
function keyPressed(){
  var moveDistance = 6;     // how far does the paddle move with L/R keys?
  
  // if game is not over, move the paddle as appropriate
  if (flagGameOver == false){
    if (keyDown("s")) moveDistance = moveDistance * 2;
    if (keyDown("left"))  paddle.x = paddle.x - moveDistance;
    if (keyDown("right")) paddle.x = paddle.x + moveDistance;
    if (keyWentDown("s")) {
      score = score - 2;
      if (score<0) score = 0;
    }
  
  // if game is over, reset entire game when <r> is pressed
  } else if (keyWentDown("r")) {
    initNewGame();
  }
}

// the ball went off the bottom
// lose a life, and perhaps end game if no lives left
function bottomHit(){
  if (ball.isTouching(bottomEdge)) {
    lives = lives - 1;
    if (lives <= 0) {
      lives = 0;
      flagGameOver = true;
    }
    resetBallStartingLocation();
    ball.velocityX = 0;
    ball.velocityY = 0;
    flagGameOn = false;
  }
}

/* Display score, lives, instructions, other messages */
function updateHUD(){
  fill("black");
  textSize(16);
  text("Score: ",10,20);
  text(score,70,20);
  text("Lives: ",10,40);
  text(lives,70,40);
  text("hold <s> for speed (-2 pts)",200,20);
  
  if (flagGameOn == false){
    text("tap <SPACE> to start",200,40);
  }
  if (flagGameOver == true){
    textSize(48);
    textAlign("center");
    text("Game Over",200,200);
    textSize(24);
    text("Tap <r> to restart",200,300);
  }
}
// -----
    try { window.draw = draw; } catch (e) {}
    switch (stage) {
      case 'preload':
        if (preload !== window.preload) { preload(); }
        break;
      case 'setup':
        if (setup !== window.setup) { setup(); }
        break;
    }
  }
  window.wrappedExportedCode = wrappedExportedCode;
  wrappedExportedCode('preload');
};

window.setup = function () {
  window.wrappedExportedCode('setup');
};
