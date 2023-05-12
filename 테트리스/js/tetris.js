//패치 1.1.3
import BLOCKS from "./blocks.js"



//DOM
const playground = document.querySelector(".playground > ul");
const gameText = document.querySelector(".game-text");
const scoreDisplat = document.querySelector(".score");
const restartButton = document.querySelector(".game-text > button");
//srtting
const GAME_ROWS = 25;
const GAME_COLS = 13;

//variables
let score = 0;         //점수
let duration = 500;    //블록 떨어지는 시간
let downInterval;      
let tempMovingItem;    //movingItem을 실행전 잠시 담아두는 용도



const movingItem = {   //블록의 타입과 값을 가지는 변수
  type: "",
  direction: 3,   //화살표 방향을 눌렀을떼 움직이는것을 도움
  top: 0,         //어디까지 내려갈건지
  left:0,         //좌우값 표시
};


init()

// functions
function init() {
  tempMovingItem = {...movingItem};   //{...}은 저 값을 복사를 해서 가져옴
  for (let i = 0; i < GAME_ROWS; i++){
    prependNewLine()          
  }
  generateNewBlock()
}


 
function prependNewLine() {    
  const li = document.createElement("li");
  const ul = document.createElement("ul");
  for (let j = 0; j < GAME_COLS; j++){
    const matrix = document.createElement("li");
    ul.prepend(matrix);
  }
  li.prepend(ul)
  playground.prepend(li)
}

function renderBlocks(moveType = "") {
  const { type, direction, top, left } = tempMovingItem;
  const movingBlocks = document.querySelectorAll(".moving"); //블록이 움직일때 이동후 원래자리에 있던 색칠된 부분을 지워줌
  movingBlocks.forEach(moving => {
    moving.classList.remove(type, "moving");
  })
  BLOCKS[type][direction].some(block => {
    const x = block[0] + left;
    const y = block[1] + top;
    const target = playground.childNodes[y] ? playground.childNodes[y].childNodes[0].childNodes[x] : null;
    const isAvailable = checkEmpty(target);
    if (isAvailable) {      //빈공간이 있으면 블록의 좌표를 다시 원상태로 옮기고 다시 renderBlocks()함수를 불러라
      target.classList.add(type, "moving")
    } else {
      
      tempMovingItem = { ...movingItem }
      if (moveType === 'retry') {
        clearInterval(downInterval)
        showGameoverText()
      }
      setTimeout(() => {
        renderBlocks('retry')
        if (moveType === "top"){
          seizeBlock();
        }
      },0)
      return true;
    }
  })
  movingItem.left = left;
  movingItem.top = top;
  movingItem.direction = direction;
}

function seizeBlock(){
  const movingBlocks = document.querySelectorAll(".moving"); 
  movingBlocks.forEach(moving => {
    moving.classList.remove("moving");
    moving.classList.add("seized");
  })
  checkMatch()
}
//1줄 완성시 그 블록 줄이 삭제되고 맨위에 1줄이 새롭게 생성
//없어지면서 위에 
function checkMatch() {
  let score_ex = 0;
  const childNodes = playground.childNodes;
  childNodes.forEach(child=>{
    let matched = true;
    child.children[0].childNodes.forEach(li=>{
      if (!li.classList.contains("seized")) {
        matched = false;
      }
    })
    if (matched) {
      child.remove();
      prependNewLine()
      score_ex++;
      
      // scoreDisplat.innerText = score;
    }
  })
  //점수계산
  if (score_ex == 1) {
  } else if (score_ex == 2) {
    score_ex *= 2
  } else if (score_ex == 3) {
    score_ex *= 3
  } else if (score_ex == 4) {
    score_ex *= 4
  }
  score = score_ex + score;
  scoreDisplat.innerText = score;
  //const scoreDisplat = document.querySelector(".score-up");
  generateNewBlock()
}

function generateNewBlock() {
  clearInterval(downInterval);
  downInterval = setInterval(() => {
    moveBlock('top', 1)
  },duration)
//랜덤하게 블록의 모양을 가져옴
  const blockArray = Object.entries(BLOCKS);
  const randomIndex = Math.floor(Math.random() * blockArray.length)
  
  movingItem.type = blockArray[randomIndex][0]
  movingItem.top = 0;
  movingItem.left = 3;
  movingItem.direction = 0;
  tempMovingItem = { ...movingItem }
  renderBlocks();
}

function checkEmpty(target) {
  if (!target || target.classList.contains("seized")) {
    return false;
  }
  return true;
}

//블럭 이동 식
function moveBlock(moveType, amount) {
  tempMovingItem[moveType] += amount; 
  renderBlocks(moveType)
} 
function chageDirection() {
  const direction = tempMovingItem.direction;
  direction === 3 ? tempMovingItem.direction = 0 : tempMovingItem.direction += 1;
  renderBlocks()
}

function dropBlock() {
  clearInterval(downInterval);
  downInterval = setInterval(() => {
    moveBlock("top",1)
  },10)
}
//게임 오버시 텍스트 출력 밑 점수 초기화
function showGameoverText() {
  gameText.style.display = "flex"
  score = 0;
  scoreDisplat.innerText = score;
  
}

//event handling
document.addEventListener("keydown", e => {
  switch (e.keyCode) {
    case 39:    //오른쪽 방향키 keycode 39
      moveBlock("left", 1);
      break;
    case 37:    //왼쪽 방향키 keycode 37
      moveBlock("left", -1);
      break;
    case 40:    //아래 방향키 keycode 40
      moveBlock("top", 1);
      break;
    case 38:    //윗 방향키 블럭 모양 바꾸기
      chageDirection();
      break;
    case 32:    //스페이스바 블럭 떨어뜨리기
      dropBlock();
      break;
    default:
      break;
  }
})

restartButton.addEventListener("click", () => {
  playground.innerHTML = "";
  gameText.style.display = "none"
  init()
})