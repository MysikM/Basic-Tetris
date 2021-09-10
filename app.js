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
    let tetrominosNextRandom = [];
    tetrominosNextRandom[0] = 0;
    tetrominosNextRandom[1] = 0;
    let tetrominosRandomColor = [];
    tetrominosRandomColor[0] = Math.round(Math.random()* (colors.length - 1));
    tetrominosRandomColor[1] = Math.round(Math.random()* (colors.length - 1));
    let timerId;
    let score = 0;
    let speed = 2100;

    let currentPosition = 4;
    let currentRotation = 0;
    

    //music in game
    let music = document.createElement('audio');
    music.src = "music/music_for_tetris.mp3";
    music.loop = -1;
     music.volume = 0.5;
    document.body.appendChild(music);

     //music game over
    let musicFail = document.createElement('audio');
    musicFail.src = "music/fail.mp3";
    musicFail.volume = 0.5;
    document.body.appendChild(musicFail);

    let musicAddScore = document.createElement('audio');
    musicAddScore.src = "music/add_score.mp3";
    musicAddScore.volume = 0.5;
    document.body.appendChild(musicAddScore);


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
    speedReduce10Btn.addEventListener("click", ()=>{speedChange(10, false)});
    speedReduce100Btn.addEventListener("click", ()=>{speedChange(100, false)});
    speedIncrease10Btn.addEventListener("click", ()=>{speedChange(10, true)});
    speedIncrease100Btn.addEventListener("click",()=>{ speedChange(100, true)});
    
    //draw playground
   for(let i =0; i < 210; i++){
      let div = document.createElement("div");
          if(i >= 200){
               div.classList.add("taken");
            }
       grid.append(div);
   }

   let squares = Array.from(document.querySelectorAll('.grid div'));


   // popup
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
        
        tetrominoNextGenerator();

        currentPosition = 4;
        current = theTetrominoes[random][currentRotation];
        
        undraw();
        displayShape();
        addScore();
        gameOver();
        draw();
      }
    }
  
    function tetrominoNextGenerator(){
      randomColor = tetrominosRandomColor[0];
      tetrominosRandomColor[0] = tetrominosRandomColor[1];
      tetrominosRandomColor[1] = Math.round(Math.random()* (colors.length - 1));

      random = tetrominosNextRandom[0];
      tetrominosNextRandom[0] = tetrominosNextRandom[1];
      tetrominosNextRandom[1] = Math.floor(Math.random() * theTetrominoes.length);
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
    let displayIndex = 0;
    let secondDisplayIndex = 16;
  
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
      displayShapeRemove();

      for(let i = 0; i< tetrominosNextRandom.length; i++){
        upNextTetrominoes[tetrominosNextRandom[i]].forEach( index => {
          displaySquares[displayIndex + index].classList.add('tetromino');
          displaySquares[displayIndex + index].style.backgroundColor = colors[tetrominosRandomColor[i]];      
        })
        displayIndex += secondDisplayIndex;
      }
      displayIndex = 0;
      
    }

    function displayShapeRemove(){
        displaySquares.forEach(square => {
        square.classList.remove('tetromino');
        square.style.backgroundColor = '';
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
        document.getElementById("speed").textContent = `Speed: ${-((speed/1000) - 3.1).toFixed(2)}s`;

        tetrominosNextRandom[0] = Math.floor(Math.random()*theTetrominoes.length);
        displayShape();
        music.play();
      }

      function gamePlayGridClean(){
        squares.forEach(i => {
          i.removeAttribute("style");
          i.classList.contains('tetromino') && i.classList.contains('taken') ? i.classList.remove('tetromino', 'taken') :  i.classList.remove('tetromino');
          scoreDisplay.textContent = 0;
          })

          displayShapeRemove();
      }
      
      function musicVolume(){
       if( musicBtn.textContent === "music on"){
         music.volume = 0.5;
         musicFail.volume = 0.5;
         musicAddScore.volume = 0.5;

         musicBtn.textContent = "music off" 
        } 
        else{
        music.volume = 0;
        musicFail.volume = 0;
        musicAddScore.volume = 0;

        musicBtn.textContent = "music on" 
        } 
      }

    function speedChange(speedChange, isIncrease){
      if(isIncrease){
        speed -= speedChange;
        speed <= 100 ? speed = 100 : speed;
      }else{
        speed >= 2900 ? speed = 2900: speed;
        speed += speedChange;
      }
      document.getElementById("speed").textContent = `Speed: ${-((speed/1000) - 3.1).toFixed(2)}s`;
    }
  
    //add score
    function addScore() {
      for (let i = 0; i < 199; i +=width) {
        const row = [i, i+1, i+2, i+3, i+4, i+5, i+6, i+7, i+8, i+9];
  
        if(row.every(index => squares[index].classList.contains('taken'))) {
          score +=Math.round(1000/speed)
          musicAddScore.play();
          if(speed > 100){
            speed -= 10
            clearInterval(timerId);
            timerId = null
            timerId = setInterval(moveDown, speed)
            document.getElementById("speed").textContent = `Speed: ${-((speed/1000) - 3.1).toFixed(2)}s`;
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
      
      clearInterval(timerId)
      timerId = null
        
      music.pause();
      
      alert(`You click restart game, your score in last game ${score}`);

      speed = 2100;
      document.getElementById("speed").textContent = `Speed: ${-((speed/1000) - 3.1).toFixed(2)}s`;


      pauseBtn.textContent = "Pause";

      pauseBtn.setAttribute("disabled", false);
      startBtn.removeAttribute("disabled");
      speedBtns.forEach(i =>{
        i.removeAttribute('disabled');
      })
      
      currentRotation = 0;
      currentPosition = 4;

      gamePlayGridClean();

      score = 0;
      scoreDisplay.textContent = score;
    }
    
    function gameOver() {
      if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {

        clearInterval(timerId);
        timerId = null;

        music.pause();

        speed = 2100;
        document.getElementById("speed").textContent = `Speed: ${-((speed/1000) - 3.1).toFixed(2)}s`;

        
        document.removeEventListener('keydown', control);

        startBtn.removeAttribute("disabled");

        pauseBtn.setAttribute("disabled", false);
        restartBtn.setAttribute("disabled", false);
        speedBtns.forEach(i =>{
          i.removeAttribute('disabled');
        })
        
        musicFail.play();

        alert(`You lose, your score ${score}`);

      }
    }

    function gameFullscreen(){
      document.fullscreenElement == null ? document.documentElement.requestFullscreen() : document.exitFullscreen();
    }
  
  })