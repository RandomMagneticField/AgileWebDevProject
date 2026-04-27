const OPTION_SELECTOR = ".quiz-mcq-box";
const PANEL_SELECTOR = ".quiz-mcq-panel";
const SELECTED_CLASS = "quiz-option-selected";
const MCQ_CONTAINER_ID = "quiz-mcq-container";
const QUESTION_LIST_ID = "quiz-question-list";
const QUESTION_ITEM_SELECTOR = ".quiz-question-item";
const SUBMIT_BUTTON_ID = "btn-submit";
const SUBMIT_INCOMPLETE_CLASS = "quiz-submit-btn-unsaved";

// ── Dummy data ──
const quizData = [
	{
		description: 'What is the derivative of 6e^3x ?',
		option_A: '6e^3x',
		option_B: '18xe^3x',
		option_C: '18e^3x',
		option_D: '18e^3',
		correct: 2
	},
	{
		description: 'What is NOT a difference between the Internet and the WWW (World Wide Web)?',
		option_A: 'The Internet is the global network infrastructure, while the WWW is a service that runs on top of it',
		option_B: 'The WWW uses HTTP/HTTPS, while the Internet includes many different protocols',
		option_C: 'The Internet is a subset of the WWW used only for websites',
		option_D: 'The WWW consists of web pages and browsers, while the Internet includes physical connections and routing',
		correct: 2
	},
	{
		description: 'Which layer in the TCP/IP model uses MAC addresses?',
		option_A: 'Application layer',
		option_B: 'Transport layer',
		option_C: 'Internet layer',
		option_D: 'Network Access layer',
		correct: 3
	},
	{
		description: 'A car starts from rest and accelerates uniformly at 2 m/s^2 for 10 seconds along a straight road. It then continues at constant velocity for another 5 seconds. What is the total distance travelled by the car over the entire 15 seconds?',
		option_A: '100 m',
		option_B: '200 m',
		option_C: '250 m',
		option_D: '300 m',
		correct: 2
	},
	{
		description: 'Which of these best describes the difference between dynamic and static analyzers?',
		option_A: 'Static analyzers examine source code without executing it, identifying potential issues like syntax errors or unsafe patterns. Dynamic analyzers run the program and observe its behaviour during execution to detect runtime issues such as memory leaks or crashes.',
		option_B: 'Dynamic analyzers only check code formatting and style rules, while static analyzers simulate execution in real time and detect runtime bugs by executing compiled binaries.',
		option_C: 'Static analyzers require compiled binaries and monitor memory usage during execution, while dynamic analyzers only read source files and provide compile-time warnings.',
		option_D: 'There is no meaningful difference; both static and dynamic analyzers perform identical checks on code at compile time without execution.',
		correct: 0
	},
	{
		description: 'Which of these are a correct listing of the main pillars of cybersecurity?',
		option_A: 'Authentication, Authorization, Accounting',
		option_B: 'Confidentiality, Integrity, Availability',
		option_C: 'Encryption, Decryption, Hashing',
		option_D: 'Prevention, Detection, Response',
		correct: 1
	},
	{
		description: 'Which of these best describes the difference between pure ALOHA and slotted ALOHA?',
		option_A: 'Pure ALOHA allows transmission at any time, which leads to higher collision probability. Slotted ALOHA restricts transmissions to discrete time slots, reducing collisions and improving efficiency.',
		option_B: 'Slotted ALOHA allows devices to transmit at any time, increasing throughput, while pure ALOHA forces devices to wait for fixed time intervals before sending data.',
		option_C: 'Pure ALOHA eliminates collisions entirely by using acknowledgements, while slotted ALOHA introduces random transmission delays to reduce efficiency.',
		option_D: 'There is no difference between pure and slotted ALOHA; both operate identically with continuous transmission and equal collision probability.',
		correct: 0
	},
	{
		description: 'Which of these HTML code correctly forms a link to an element with id of \'MyTitle\'?',
		option_A: '<a href="MyTitle">Go to title</a>',
		option_B: '<a href="#MyTitle">Go to title</a>',
		option_C: '<link href="#MyTitle">Go to title</link>',
		option_D: '<a link="#MyTitle">Go to title</a>',
		correct: 1
	}
];

function escapeHtml(value) {
	return String(value)
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/\"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

function createQuestionPanel(question, index) {
	const questionNumber = index + 1;
	const questionId = `question-${questionNumber}`;

	return `
		<div
			class="quiz-mcq-panel"
			id="${questionId}"
			data-question-number="${questionNumber}"
			data-question-id="${questionId}"
		>
			<div class="quiz-question-title">Question ${questionNumber}</div>
			<div class="quiz-question-prompt">${escapeHtml(question.description)}</div>
			<div class="quiz-mcq-stack">
				<div class="quiz-mcq-box" data-option="A">
					<div class="quiz-option-letter">A</div>
					<div class="note-card-body quiz-option-text">${escapeHtml(question.option_A)}</div>
				</div>
				<div class="quiz-mcq-box" data-option="B">
					<div class="quiz-option-letter">B</div>
					<div class="note-card-body quiz-option-text">${escapeHtml(question.option_B)}</div>
				</div>
				<div class="quiz-mcq-box" data-option="C">
					<div class="quiz-option-letter">C</div>
					<div class="note-card-body quiz-option-text">${escapeHtml(question.option_C)}</div>
				</div>
				<div class="quiz-mcq-box" data-option="D">
					<div class="quiz-option-letter">D</div>
					<div class="note-card-body quiz-option-text">${escapeHtml(question.option_D)}</div>
				</div>
			</div>
		</div>
	`;
}

function renderQuestions() {
	const container = document.getElementById(MCQ_CONTAINER_ID);
	if (!container) {
		return;
	}

	container.innerHTML = quizData.map(createQuestionPanel).join("");
}

function createQuestionListItem(questionNumber) {
	return `
		<a class="quiz-question-item" href="#question-${questionNumber}" data-question-number="${questionNumber}">Question ${questionNumber}</a>
	`;
}

function renderQuestionList() {
	const container = document.getElementById(QUESTION_LIST_ID);
	if (!container) {
		return;
	}

	container.innerHTML = quizData.map((_, index) => createQuestionListItem(index + 1)).join("");
}

function setQuestionListItemCompleted(questionId, isCompleted) {
	if (!questionId) {
		return;
	}

	const item = document.querySelector(`${QUESTION_ITEM_SELECTOR}[href="#${questionId}"]`);
	if (!item) {
		return;
	}

	item.classList.toggle("is-completed", isCompleted);
}

function updateSubmitState() {
	const submitButton = document.getElementById(SUBMIT_BUTTON_ID);
	if (!submitButton) {
		return;
	}

	const panels = document.querySelectorAll(PANEL_SELECTOR);
	const answeredCount = document.querySelectorAll(`${PANEL_SELECTOR} ${OPTION_SELECTOR}.${SELECTED_CLASS}`).length;
	const allAnswered = panels.length > 0 && answeredCount === panels.length;

	submitButton.classList.toggle(SUBMIT_INCOMPLETE_CLASS, !allAnswered);
}

function setSelectedOption(option) {
	const panel = option.closest(PANEL_SELECTOR);
	if (!panel) {
		return;
	}

	const questionId = panel.dataset.questionId;

	const selected = panel.querySelector(`${OPTION_SELECTOR}.${SELECTED_CLASS}`);

	if (selected === option) {
		option.classList.remove(SELECTED_CLASS);
		option.setAttribute("aria-pressed", "false");
		setQuestionListItemCompleted(questionId, false);
		updateSubmitState();
		return;
	}

	if (selected) {
		selected.classList.remove(SELECTED_CLASS);
		selected.setAttribute("aria-pressed", "false");
	}

	option.classList.add(SELECTED_CLASS);
	option.setAttribute("aria-pressed", "true");
	setQuestionListItemCompleted(questionId, true);
	updateSubmitState();
}

function initializeOptions() {
	document.querySelectorAll(OPTION_SELECTOR).forEach((option) => {
		option.setAttribute("role", "button");
		option.setAttribute("tabindex", "0");
		option.setAttribute(
			"aria-pressed",
			option.classList.contains(SELECTED_CLASS) ? "true" : "false"
		);
	});
}

document.addEventListener("click", (event) => {
	const option = event.target.closest(OPTION_SELECTOR);
	if (!option) {
		return;
	}

	setSelectedOption(option);
});

document.addEventListener("keydown", (event) => {
	if (event.key !== "Enter" && event.key !== " ") {
		return;
	}

	const option = event.target.closest(OPTION_SELECTOR);
	if (!option) {
		return;
	}

	event.preventDefault();
	setSelectedOption(option);
});

renderQuestions(); // render dummy data
renderQuestionList();
initializeOptions();
updateSubmitState();
