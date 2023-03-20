// Get the necessary HTML elements
const startButton = document.getElementById('start-btn');
const questionElement = document.getElementById('question');
const answerButtonsElement = document.getElementById('answer-buttons');
const correctWrongElement = document.getElementById('correctWrong');
const timeRemainingElement = document.getElementById('time-remaining');
const highScoreButton = document.getElementById('highScore-button');
const quizContainer = document.getElementById('question-container');
const startContainer = document.getElementById('Start');

// Initialize variables
let shuffledQuestions, currentQuestionIndex;
let timeRemaining = 60;
let timerId;
let score = 0;

// Hide the quiz question initially
questionElement.classList.add('hide');

// Add event listener to start button
startButton.addEventListener('click', startQuiz);

// Add event listener to high score button
highScoreButton.addEventListener('click', viewHighScores);

function startQuiz() {
  hideStartButton();
  // Reset the questions
  shuffledQuestions = questions;
  currentQuestionIndex = 0;
  
  // Shuffle the questions
  shuffledQuestions.sort(() => Math.random() - 0.5);

  // Reset the timer
  timeRemaining = 60;
  clearInterval(timerId);
  showTimeRemaining();

  // Show the quiz container
  quizContainer.classList.remove('hide');
  // Hide the start container
  startContainer.classList.add('hide');
  // Show the quiz question and answer choices
  questionElement.classList.remove('hide');
  answerButtonsElement.classList.remove('hide');

  // Show the first question
  showQuestion();
  // Start the timer
  startTimer();

}

function hideStartButton() {
  const startButton = document.getElementById('start-btn');
  startButton.classList.add('hide'); 
}
// Function to show the question
function showQuestion() {
  resetState();
  const question = shuffledQuestions[currentQuestionIndex];
  questionElement.innerText = question.question;
  questionElement.classList.remove('hide');
  question.answers.forEach(answer => {
    const button = document.createElement('button');
    button.innerText = answer.text;
    button.classList.add('btn');
    button.classList.add('answer-btn'); 
    if (answer.correct) {
      button.dataset.correct = answer.correct;
    }
    button.addEventListener('click', selectAnswer);
    answerButtonsElement.appendChild(button);
  });
}

// Function to reset the state
function resetState() {

  answerButtonsElement.classList.remove('answered');
  correctWrongElement.classList.remove('correct');
  correctWrongElement.classList.remove('wrong');
  correctWrongElement.classList.add('hide');
  // Clear the answer buttons
  while (answerButtonsElement.firstChild) {
    answerButtonsElement.removeChild(answerButtonsElement.firstChild);
  }
}

// Function to select an answer
function selectAnswer(e) {

  answerButtonsElement.classList.add('answered');

  const selectedButton = e.target;
  const isCorrect = selectedButton.dataset.correct;

  const allButtons = answerButtonsElement.querySelectorAll(".btn");
  allButtons.forEach(button => {
    button.setAttribute("disabled", true);
  });


  if (isCorrect) {
    correctWrongElement.innerText = 'Correct!';
    correctWrongElement.classList.add('correct');
    selectedButton.classList.add('correct-answer'); 
    score++;
  } else {
    correctWrongElement.innerText = 'Wrong';
    correctWrongElement.classList.add('wrong');
    selectedButton.classList.add('wrong-answer'); 
    timeRemaining -= 10;
    showTimeRemaining();
  }
  correctWrongElement.classList.remove('hide');

  setTimeout(() => {
    correctWrongElement.classList.add('hide');
    const currentQuestion = shuffledQuestions[currentQuestionIndex];
    const correctAnswerButton = answerButtonsElement.querySelector(`[data-correct='true']`);
    correctAnswerButton.classList.add('correct');
    selectedButton.classList.remove('correct-answer', 'wrong-answer'); 
    currentQuestionIndex++;

    if (currentQuestionIndex < shuffledQuestions.length) {
      showQuestion();
    } else {
      endQuiz();
    }
  }, 2000);
}

function startTimer() {
  timerId = setInterval(() => {
    timeRemaining--;
    showTimeRemaining();

    if (timeRemaining <= 0) {
      clearInterval(timerId);
      endQuiz();
    }
  }, 1000);
}

function showTimeRemaining() {
  timeRemainingElement.textContent = `Time: ${timeRemaining}`;
}

function endQuiz() {
  // Stop the timer
  clearInterval(timerId);
  // Hide the quiz question and answer choices
  questionElement.classList.add('hide');
  answerButtonsElement.classList.add('hide');
  // Calculate the score
  const finalScore = Math.round((score / shuffledQuestions.length) * 100);
  // Display the quiz results
  const resultsContainer = document.createElement('div');
  resultsContainer.innerHTML = `
    <h2 style="font-size: 40px;">All done!</h2>
    <p>Your final score is ${finalScore.toFixed(2)}%.</p>
    <label for="initials">Enter initials: </label>
    <input type="text" id="initials" maxlength="3" />
    <button id="submit-btn" class="btn">Submit</button>
  `;
  quizContainer.appendChild(resultsContainer);

  // Add event listener to submit button
  const submitButton = document.getElementById('submit-btn');
  submitButton.addEventListener('click', saveHighScore);
}

function saveHighScore() {
  // Get the user's initials and score
  const initialsInput = document.getElementById('initials');
  const initials = initialsInput.value.toUpperCase();
  const finalScore = Math.round((score / shuffledQuestions.length) * 100);

  // Save the high score and initials
  const highScores = JSON.parse(localStorage.getItem('highScores')) || [];
  highScores.push({ initials, score: finalScore });
  localStorage.setItem('highScores', JSON.stringify(highScores));

  // Clear the results container and display the high scores
  viewHighScores();
}

function viewHighScores() {
  // Clear the quiz container
  quizContainer.innerHTML = '';

  startContainer.classList.add('hide');
  startButton.classList.add('hide');

  // Sort and display the high scores
  const highScores = JSON.parse(localStorage.getItem("highScores")) || [];
  if (highScores.length === 0){
    const noscoresEl = document.createElement("h5")
    noscoresEl.textContent = "No high scores yet available";
    quizContainer.appendChild(noscoresEl)
  }
  const sortedHighScores = highScores.sort((a, b) => b.score - a.score); 
  const highScoresList = document.createElement("ul");
  highScoresList.id = "high-scores-list";
  sortedHighScores.forEach((scoreItem, index) => {
    const listItem = document.createElement("li");
    listItem.className = "high-score-item"; 

    listItem.textContent = `${index + 1}. ${scoreItem.initials} - ${scoreItem.score}%`; 
    highScoresList.appendChild(listItem);
  });
  quizContainer.appendChild(highScoresList);

  // Display the 'Go Back' and 'Clear High Scores' buttons
  const buttonsContainer = document.createElement('div');
  buttonsContainer.innerHTML = `
    <button id="go-back-btn" class="btn">Go Back</button>
    <button id="clear-high-scores-btn" class="btn">Clear High Scores</button>
  `;
  quizContainer.appendChild(buttonsContainer);

  // Add event listeners to the buttons
  const goBackButton = document.getElementById('go-back-btn');
  goBackButton.addEventListener('click', () => {
    location.href = "/"
  });

  const clearHighScoresButton = document.getElementById('clear-high-scores-btn');
  clearHighScoresButton.addEventListener('click', () => {
    // Clear the high scores
    localStorage.removeItem("highScores");
    viewHighScores();
  });
  highScoreButton.classList.add('hide');
  quizContainer.classList.remove('hide');
}

function resetQuiz() {
  
  // Reset variables
  shuffledQuestions = null;
  currentQuestionIndex = 0;
  timeRemaining = 60;
  clearInterval(timerId);

  // Reset HTML elements
  questionElement.classList.add('hide');
  answerButtonsElement.classList.add('hide');
  correctWrongElement.classList.add('hide');
  while (answerButtonsElement.firstChild) {
    answerButtonsElement.removeChild(answerButtonsElement.firstChild);
  }
  while (quizContainer.firstChild) {
    quizContainer.removeChild(quizContainer.firstChild);
  }
  highScoreButton.classList.remove('hide');
  startContainer.classList.remove('hide');

  // Clear the initials input field
  const initialsInput = document.getElementById('initials');
  initialsInput.value = '';
  
}

// Quiz questions
const questions = [
  {
  question: 'What does HTML stand for?',
  answers: [
  { text: 'A. Hyperlink and Text Markup Language', correct: false },
  { text: 'B. Hypertext Markup Language', correct: true },
  { text: 'C. Hyper Tool Markup Language', correct: false },
  { text: 'D. Hyper Text Message Language', correct: false }
  ]
  },
  {
  question: 'Whats the best coding language ?',
  answers: [
  { text: 'A. CSS', correct: false },
  { text: 'B. Java Script', correct: true },
  { text: 'C. RPG', correct: false },
  { text: 'D. Java', correct: false }
  ]
  },
  {
  question: 'What is the DOM (Document Object Model)?',
  answers: [
  { text: 'A. A markup language for web documents', correct: false },
  { text: 'B. A programming language used for server-side scripting', correct: false },
  { text: 'C. A programming interface for web browsers', correct: true },
  { text: 'D. A software application for web development', correct: false }
  ]
  }
  ];