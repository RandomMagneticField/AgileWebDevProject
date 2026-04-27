const OPTION_SELECTOR = ".quiz-mcq-box";
const PANEL_SELECTOR = ".quiz-mcq-panel";
const SELECTED_CLASS = "quiz-option-selected";
const MCQ_CONTAINER_ID = "quiz-mcq-container";
const QUESTION_LIST_ID = "quiz-question-list";
const QUESTION_ITEM_SELECTOR = ".quiz-question-item";
const SUBMIT_BUTTON_ID = "btn-submit";
const SUBMIT_INCOMPLETE_CLASS = "quiz-submit-btn-unsaved";

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
