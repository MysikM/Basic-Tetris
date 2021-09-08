document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.grid');

    const scoreDisplay = document.querySelector('#score')
    const startBtn = document.querySelector('#start-button');
    const pauseBtn = document.querySelector('#pause-button');
    const musicBtn = document.querySelector("#music");
    const restartBtn = document.querySelector("#restart-button");
    const fullscreenBtn = document.querySelector("#fullscreen");
    const popupButtonOpen = document.querySelector("#rules");
    const popupButtonClose = document.querySelector("#popup-close");
    const speedReduce10Btn = document.querySelector("#speedSlow10");
    const speedReduce100Btn = document.querySelector("#speedSlow100");
    const speedIncrease10Btn = document.querySelector("#speedIncrease10");
    const speedIncrease100Btn = document.querySelector("#speedIncrease100");
    const speedBtns = [speedReduce10Btn, speedReduce100Btn, speedIncrease10Btn, speedIncrease100Btn];
    const width = 10;

    let colors = ["#e63946","#f1faee","#a8dadc","#457b9d", "#1d3557"];
    let nextRandom = 0;
    let secondNextRandom = 0;
    let nextRandomColor = Math.round(Math.random()* (colors.length - 1));
    let secondRandomColor = Math.round(Math.random()* (colors.length - 1));
    let timerId;
    let score = 0;
    let speed = 500;

    let currentPosition = 4;
    let currentRotation = 0;
    

    //music in game
    let music = document.createElement('audio');
    music.src = "music/music_for_tetris.mp3";
    music.loop = -1;
     music.volume = 0.5;
    document.body.appendChild(music);

     //music game over
    let failMusic = document.createElement('audio');
    failMusic.src = "music/fail.mp3";
    failMusic.volume = 0.5;
    document.body.appendChild(failMusic);


    //The Tetrominoes
    const lTetromino = [
      [1, width+1, width*2+1, 2],
      [width, width+1, width+2, width*2+2],
      [1, width+1, width*2+1, width*2],
      [width, width*2, width*2+1, width*2+2]
    ]
  
    const zTetromino = [
      [0,width,width+1,width*2+1],
      [width+1, width+2,width*2,width*2+1],
      [0,width,width+1,width*2+1],
      [width+1, width+2,width*2,width*2+1]
    ]
  
    const tTetromino = [
      [1,width,width+1,width+2],
      [1,width+1,width+2,width*2+1],
      [width,width+1,width+2,width*2+1],
      [1,width,width+1,width*2+1]
    ]
  
    const oTetromino = [
      [0,1,width,width+1],
      [0,1,width,width+1],
      [0,1,width,width+1],
      [0,1,width,width+1]
    ]
  
    const iTetromino = [
      [1,width+1,width*2+1,width*3+1],
      [width,width+1,width+2,width+3],
      [1,width+1,width*2+1,width*3+1],
      [width,width+1,width+2,width+3]
    ]
  
    const theTetrominoes = [lTetromino, zTetromino, tTetromino, oTetromino, iTetromino];
  
        //randomly select a Tetromino and its first rotation
    let random = Math.floor(Math.random()*theTetrominoes.length);
    let current = theTetrominoes[random][currentRotation];
    let randomColor = Math.round(Math.random()* (colors.length - 1));

    //popup rules
    popupButtonOpen.addEventListener("click", gameRulesSwitchOn);
    popupButtonClose.addEventListener("click", gameRulesSwitchOff);
    window.addEventListener('keyup', controlMenu);
    startBtn.addEventListener('click', gameStart);
    pauseBtn.addEventListener('click', gamePause);
    musicBtn.addEventListener('click', musicVolume);
    restartBtn.addEventListener('click', gameRestart);
    fullscreenBtn.addEventListener('click', gameFullscreen);
    speedReduce10Btn.addEventListener("click", ()=>{speedChange(10, true)});
    speedReduce100Btn.addEventListener("click", ()=>{speedChange(100, true)});
    speedIncrease10Btn.addEventListener("click", ()=>{speedChange(10, false)});
    speedIncrease100Btn.addEventListener("click",()=>{ speedChange(100, false)});
    
    //draw playground
   for(let i =0; i < 210; i++){
      let div = document.createElement("div");
          if(i >= 200){
               div.classList.add("taken");
            }
       grid.append(div);
   }        

   function gameRulesSwitchOn(){
    document.querySelector(".popup_show").classList.remove("popup_hidden");
    if(timerId) {
      pauseBtn.textContent = "Play";
    } 
    clearInterval(timerId)
    timerId = null; 
    music.pause(); 
   }

   function gameRulesSwitchOff(){
    document.querySelector(".popup_show").classList.add("popup_hidden");
  }
    //draw the Tetromino
    function draw() {
      current.forEach(index => {
        squares[currentPosition + index].classList.add('tetromino');
        squares[currentPosition + index].style.backgroundColor = colors[randomColor];
        
      })
    }
    let squares = Array.from(document.querySelectorAll('.grid div'));
    
    //undraw the Tetromino
    function undraw() {
      current.forEach(index => {
        squares[currentPosition + index].classList.remove('tetromino');
        squares[currentPosition + index].style.backgroundColor = '';
  
      })
    }

    function control(e) {
      e.preventDefault();
      if(e.keyCode === 37) {
        moveLeft();
      } else if (e.keyCode === 38) {
        rotate();
      } else if (e.keyCode === 39) {
        moveRight();
      } else if (e.keyCode === 40) {
        moveDown();
      }
    }

    function controlMenu(e){
      e.preventDefault();
      if(e.key === "Escape"){
        gameRulesSwitchOff();
      }
      if(e.keyCode === 73)
        gameRulesSwitchOn();
    }

    //move down function
    function moveDown() {
      undraw();
      currentPosition += width;
      draw();
      freeze();
    }
  
    //freeze function
    function freeze() {
      if(current.some(index => squares[currentPosition + index + width].classList.contains('taken'))) {
        current.forEach(index => squares[currentPosition + index].classList.add('taken'));
        //start a new tetromino falling
        randomColor = nextRandomColor;
        nextRandomColor = secondRandomColor;
        secondRandomColor = Math.round(Math.random()* (colors.length - 1));

        random = nextRandom;
        nextRandom = secondNextRandom;
        secondNextRandom = Math.floor(Math.random() * theTetrominoes.length);

        currentPosition = 4;
        current = theTetrominoes[random][currentRotation];

        displayShape();
        addScore();
        gameOver();
      }
    }
  
    //move the tetromino left, unless is at the edge or there is a blockage
    function moveLeft() {
      undraw();
      const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0);
      if(!isAtLeftEdge) currentPosition -=1;
      if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
        currentPosition +=1;
      }
      draw();
    }
  
    //move the tetromino right, unless is at the edge or there is a blockage
    function moveRight() {
      undraw()
      const isAtRightEdge = current.some(index => (currentPosition + index) % width === width -1)
      if(!isAtRightEdge) currentPosition +=1;
      if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
        currentPosition -=1;
      }
      draw();
    }
  
    
    ///FIX ROTATION OF TETROMINOS A THE EDGE 
    function isAtRight() {
      return current.some(index=> (currentPosition + index + 1) % width === 0);  
    }
    
    function isAtLeft() {
      return current.some(index=> (currentPosition + index) % width === 0);
    }
    
    function checkRotatedPosition(P){
      P = P || currentPosition;       //get current position.  Then, check if the piece is near the left side.
      if ((P+1) % width < 4) {         //add 1 because the position index can be 1 less than where the piece is (with how they are indexed).     
        if (isAtRight()){            //use actual position to check if it's flipped over to right side
          currentPosition += 1;    //if so, add one to wrap it back around
          checkRotatedPosition(P); //check again.  Pass position from start, since long block might need to move more.
          }
      }
      else if (P % width > 5) {
        if (isAtLeft()){
          currentPosition -= 1;
        checkRotatedPosition(P);
        }
      }
    }
    
    //rotate the tetromino
    function rotate() {
      undraw();
      currentRotation ++;
      if(currentRotation === current.length) { //if the current rotation gets to 4, make it go back to 0
        currentRotation = 0;
      }
      current = theTetrominoes[random][currentRotation];
      checkRotatedPosition();
      draw();
    }
    /////////
  
    // mini-grid create
    let miniGrids = document.querySelectorAll(".mini-grid-container .mini-grid")
    
    miniGrids.forEach(block =>{
      for(let i = 0; i< 16; i++){
        let div =  document.createElement("div");
        block.append(div);
      }
    })
    //show up-next tetromino in mini-grid display
    const displaySquares = document.querySelectorAll('.mini-grid div');
    const displayWidth = 4;
    const displayIndex = 0;
    const secondDisplayIndex = 16;
  
    //the Tetrominos without rotations
    const upNextTetrominoes = [
      [1, displayWidth+1, displayWidth*2+1, 2], //lTetromino
      [0, displayWidth, displayWidth+1, displayWidth*2+1], //zTetromino
      [1, displayWidth, displayWidth+1, displayWidth+2], //tTetromino
      [0, 1, displayWidth, displayWidth+1], //oTetromino
      [1, displayWidth+1, displayWidth*2+1, displayWidth*3+1] //iTetromino
    ]
  
    //display the shape in the mini-grid display
    function displayShape() {
      //remove any trace of a tetromino form the entire grid
      displaySquares.forEach(square => {
        square.classList.remove('tetromino');
        square.style.backgroundColor = '';
      })

      upNextTetrominoes[nextRandom].forEach( index => {
        displaySquares[displayIndex + index].classList.add('tetromino');
        displaySquares[displayIndex + index].style.backgroundColor = colors[nextRandomColor];      
      })

      upNextTetrominoes[secondNextRandom].forEach( index => {
        displaySquares[secondDisplayIndex + index].classList.add('tetromino');
        displaySquares[secondDisplayIndex + index].style.backgroundColor = colors[secondRandomColor];     
      })
    }

    //add functionality to the button
    function gameStart(){
      if(startBtn.textContent == "Again"){
        gamePlayGridClean();
      }
        gamePlay();

        restartBtn.removeAttribute("disabled");
        startBtn.setAttribute('disabled', false);
        pauseBtn.removeAttribute('disabled');
        startBtn.textContent = "Again";
        speedBtns.forEach(btn =>{
          btn.setAttribute('disabled', false);
        })
    }

    function gamePause(){
        if(timerId){
          clearInterval(timerId);
          timerId = null;
          music.pause();
          pauseBtn.textContent = "Play";
          document.removeEventListener('keydown', control);
        } 
        else{
          gamePlay();
          pauseBtn.textContent = "Pause";
        }
      }

      function gamePlay(){
        document.addEventListener('keydown', control);
        draw();
        timerId = setInterval(moveDown, speed);
        document.getElementById("speed").textContent = `Current speed: ${speed/1000}`;
        nextRandom = Math.floor(Math.random()*theTetrominoes.length);
        displayShape();
        music.play();
      }

      function gamePlayGridClean(){
        squares.forEach(i => {
          i.removeAttribute("style");
          i.classList.contains('tetromino') && i.classList.contains('taken') ? i.classList.remove('tetromino', 'taken') :  i.classList.remove('tetromino');
          scoreDisplay.textContent = 0;
          })
      }
      
      function musicVolume(){
       if( musicBtn.textContent === "music on"){
         music.volume = 0.5;
         musicBtn.textContent = "music off" 
        } 
        else{
        music.volume = 0;
        musicBtn.textContent = "music on" 
        } 
      }

    function speedChange(speedChange, isIncrease){
      if(isIncrease){
        speed -= speedChange;
        speed <= 100 ? speed = 100 : speed;
      }else{
        speed += speedChange;
      }
      document.getElementById("speed").textContent = `Current speed: ${speed/1000}`;
    }
  
    //add score
    function addScore() {
      for (let i = 0; i < 199; i +=width) {
        const row = [i, i+1, i+2, i+3, i+4, i+5, i+6, i+7, i+8, i+9];
  
        if(row.every(index => squares[index].classList.contains('taken'))) {
          score +=Math.round(1000/speed)
          if(speed > 100){
            speed -= 10
            clearInterval(timerId);
            timerId = null
            timerId = setInterval(moveDown, speed)
            document.getElementById("speed").textContent = `Current speed: ${speed/1000}`
          }

          scoreDisplay.innerHTML = score;

          row.forEach(index => {
            squares[index].classList.remove('taken');
            squares[index].classList.remove('tetromino');
            squares[index].style.backgroundColor = '';
          })

          const squaresRemoved = squares.splice(i, width);
          squares = squaresRemoved.concat(squares);
          squares.forEach(cell => grid.appendChild(cell));

          undraw();
          draw();
          
        }
      }
    }

    function gameRestart(){
      if(timerId){
        clearInterval(timerId)
        timerId = null
        music.pause();
      } 

      pauseBtn.textContent = "Pause";
      speed = 500;
      document.getElementById("speed").textContent = `Current speed: ${speed/1000}`;
      score = 0;
      scoreDisplay.textContent = score;

      random = nextRandom;
      nextRandom = secondNextRandom;
      secondNextRandom = Math.floor(Math.random() * theTetrominoes.length);
      current = theTetrominoes[random][currentRotation];

      currentRotation = 0;
      currentPosition = 4;

      gamePlayGridClean();
      gamePlay();

    }
    
    //game over
    function gameOver() {
      if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
        scoreDisplay.innerHTML = 'end';
        document.getElementById("speed").textContent = `Current speed: ${speed/1000}`;


        clearInterval(timerId);
        timerId = null;
        music.pause();

        failMusic.play();

        startBtn.removeAttribute("disabled");
        document.removeEventListener('keydown', control);
        pauseBtn.setAttribute("disabled", false);
        restartBtn.setAttribute("disabled", false);
        speedBtns.forEach(i =>{
          i.removeAttribute('disabled');
        })
      }
    }

    function gameFullscreen(){
      document.fullscreenElement == null ? document.documentElement.requestFullscreen() : document.exitFullscreen();
    }
  
  })