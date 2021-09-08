document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.grid')

    const scoreDisplay = document.querySelector('#score')
    const startBtn = document.querySelector('#start-button');
    const pauseBtn = document.querySelector('#pause-button');
    const musicBtn = document.querySelector("#music");
    const popupButtonOpen = document.querySelector("#rules");
    const popupButtonClose = document.querySelector("#popup-close");
    const speedReduce10Btn = document.querySelector("#speedSlow10");
    const speedReduce100Btn = document.querySelector("#speedSlow100");
    const speedIncrease10Btn = document.querySelector("#speedIncrease10");
    const speedIncrease100Btn = document.querySelector("#speedIncrease100");

    const width = 10
    let nextRandom = 0
    let nextRandomColor = 0
    let timerId
    let score = 0
    let colors = ["#e63946","#f1faee","#a8dadc","#457b9d", "#1d3557"]

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
  
    const theTetrominoes = [lTetromino, zTetromino, tTetromino, oTetromino, iTetromino]
  
    let currentPosition = 4
    let currentRotation = 0
    
    //randomly select a Tetromino and its first rotation
    let random = Math.floor(Math.random()*theTetrominoes.length)
    let current = theTetrominoes[random][currentRotation]
    let randomColor = Math.round(Math.random()* (colors.length - 1));

    //popup rules
    popupButtonOpen.addEventListener("click", function(){
      document.querySelector(".popup_show").classList.remove("popup_hidden");
      clearInterval(timerId)
      timerId = null

    })
    popupButtonClose.addEventListener("click", function(){
      document.querySelector(".popup_show").classList.add("popup_hidden");
    })


    //draw playground

        for(let i =0; i < 210; i++){
            let div = document.createElement("div");
                if(i >= 200){
                    div.classList.add("taken");
                }
            grid.append(div);
        }        
  
    
    //draw the Tetromino
    function draw() {
      current.forEach(index => {
        squares[currentPosition + index].classList.add('tetromino')
        squares[currentPosition + index].style.backgroundColor = colors[randomColor]
        
      })
    }
    let squares = Array.from(document.querySelectorAll('.grid div'))
    //undraw the Tetromino
    function undraw() {
      current.forEach(index => {
        squares[currentPosition + index].classList.remove('tetromino')
        squares[currentPosition + index].style.backgroundColor = ''
  
      })
    }
  
    //assign functions to keyCodes
    function control(e) {
      if(e.keyCode === 37) {
        moveLeft()
      } else if (e.keyCode === 38) {
        rotate()
      } else if (e.keyCode === 39) {
        moveRight()
      } else if (e.keyCode === 40) {
        moveDown()
      }
    }
    document.addEventListener('keydown', control)

    
  
    //move down function
    function moveDown() {
      undraw()
      currentPosition += width
      draw()
      freeze()
    }
  
    //freeze function
    function freeze() {
      if(current.some(index => squares[currentPosition + index + width].classList.contains('taken'))) {
        current.forEach(index => squares[currentPosition + index].classList.add('taken'))
        //start a new tetromino falling
        randomColor = nextRandomColor
        nextRandomColor = Math.round(Math.random()* (colors.length - 1));
        random = nextRandom
        nextRandom = Math.floor(Math.random() * theTetrominoes.length)
        current = theTetrominoes[random][currentRotation]
        currentPosition = 4
        draw()
        displayShape()
        addScore()
        gameOver()
      }
    }
  
    //move the tetromino left, unless is at the edge or there is a blockage
    function moveLeft() {
      undraw()
      const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0)
      if(!isAtLeftEdge) currentPosition -=1
      if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
        currentPosition +=1
      }
      draw()
    }
  
    //move the tetromino right, unless is at the edge or there is a blockage
    function moveRight() {
      undraw()
      const isAtRightEdge = current.some(index => (currentPosition + index) % width === width -1)
      if(!isAtRightEdge) currentPosition +=1
      if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
        currentPosition -=1
      }
      draw()
    }
  
    
    ///FIX ROTATION OF TETROMINOS A THE EDGE 
    function isAtRight() {
      return current.some(index=> (currentPosition + index + 1) % width === 0)  
    }
    
    function isAtLeft() {
      return current.some(index=> (currentPosition + index) % width === 0)
    }
    
    function checkRotatedPosition(P){
      P = P || currentPosition       //get current position.  Then, check if the piece is near the left side.
      if ((P+1) % width < 4) {         //add 1 because the position index can be 1 less than where the piece is (with how they are indexed).     
        if (isAtRight()){            //use actual position to check if it's flipped over to right side
          currentPosition += 1    //if so, add one to wrap it back around
          checkRotatedPosition(P) //check again.  Pass position from start, since long block might need to move more.
          }
      }
      else if (P % width > 5) {
        if (isAtLeft()){
          currentPosition -= 1
        checkRotatedPosition(P)
        }
      }
    }
    
    //rotate the tetromino
    function rotate() {
      undraw()
      currentRotation ++
      if(currentRotation === current.length) { //if the current rotation gets to 4, make it go back to 0
        currentRotation = 0
      }
      current = theTetrominoes[random][currentRotation]
      checkRotatedPosition()
      draw()
    }
    /////////
  
    let miniGrid = document.querySelector(".mini-grid")
    for(let i = 0; i< 16; i++){
        let div =  document.createElement("div");
        miniGrid.append(div)

    }
    //show up-next tetromino in mini-grid display
    const displaySquares = document.querySelectorAll('.mini-grid div')
    const displayWidth = 4
    const displayIndex = 0
  
  
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
        square.classList.remove('tetromino')
        square.style.backgroundColor = ''
      })
      upNextTetrominoes[nextRandom].forEach( index => {
        displaySquares[displayIndex + index].classList.add('tetromino')
        displaySquares[displayIndex + index].style.backgroundColor = colors[nextRandomColor]
        
      })
    }
    let speed = 500;

    

  
    let music = document.createElement('audio');
    music.src = "music/music_for_tetris.mp3";
    music.loop = -1;
    music.volume = 0.5;
    document.body.appendChild(music);
    //add functionality to the button
    startBtn.addEventListener('click', gameStart);
    pauseBtn.addEventListener('click', gamePause);
    musicBtn.addEventListener('click', musicVolume);
    function gameStart(){
        draw()
        timerId = setInterval(moveDown, speed)
        document.getElementById("speed").textContent = `Current speed: ${speed/1000}`
        nextRandom = Math.floor(Math.random()*theTetrominoes.length)
        displayShape();
        startBtn.setAttribute('disabled', false);
        pauseBtn.removeAttribute('disabled');
        music.play();
    }

    function gamePause(){
        if(timerId){
          clearInterval(timerId)
          timerId = null
          music.pause();
          pauseBtn.textContent = "On Pause"
        } 
        else{
          draw()
          timerId = setInterval(moveDown, speed)
          document.getElementById("speed").textContent = `Current speed: ${speed/1000}`
          nextRandom = Math.floor(Math.random()*theTetrominoes.length)
          displayShape()
          pauseBtn.textContent = "Pause";
          music.play();

        }
      }
      function musicVolume(){
       if( musicBtn.textContent === "music on"){
         music.volume = .5;
         musicBtn.textContent = "music off" 
        } 
        else{
        music.volume = 0;
        musicBtn.textContent = "music on" 
        } 
      }

     speedReduce10Btn.addEventListener("click", ()=>{speedChange(10, true)});
     speedReduce100Btn.addEventListener("click", ()=>{speedChange(100, true)});
     speedIncrease10Btn.addEventListener("click", ()=>{speedChange(10, false)});
     speedIncrease100Btn.addEventListener("click",()=>{ speedChange(100, false)});

    function speedChange(speedChange, isIncrease){
      if(isIncrease){
        speed -= speedChange;
      }else{
        speed += speedChange;
      }
      clearInterval(timerId)
      timerId = null
      timerId = setInterval(moveDown, speed);
      document.getElementById("speed").textContent = `Current speed: ${speed/1000}`;
      console.log(speed);
    }


  
    //add score
    function addScore() {
      for (let i = 0; i < 199; i +=width) {
        const row = [i, i+1, i+2, i+3, i+4, i+5, i+6, i+7, i+8, i+9]
  
        if(row.every(index => squares[index].classList.contains('taken'))) {
          score +=Math.round(1000/speed)
          if(speed > 100){
            speed -= 10
            clearInterval(timerId);
            timerId = null
            timerId = setInterval(moveDown, speed)
            document.getElementById("speed").textContent = `Current speed: ${speed/1000}`
          }
          scoreDisplay.innerHTML = score
          row.forEach(index => {
            squares[index].classList.remove('taken')
            squares[index].classList.remove('tetromino')
            squares[index].style.backgroundColor = ''
          })
          const squaresRemoved = squares.splice(i, width)
          squares = squaresRemoved.concat(squares)
          squares.forEach(cell => grid.appendChild(cell))
        }
      }
    }
    let failMusic = document.createElement('audio');
    failMusic.src = "music/fail.mp3";
    failMusic.volume = 0.5;
    document.body.appendChild(failMusic);
    //game over
    function gameOver() {
      if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
        scoreDisplay.innerHTML = 'end'
        clearInterval(timerId)
        music.pause();
        failMusic.play();
      }
    }
  
  })