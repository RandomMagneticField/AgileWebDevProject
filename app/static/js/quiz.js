const OPTION_SELECTOR = ".quiz-mcq-box";
const PANEL_SELECTOR = ".quiz-mcq-panel";
const SELECTED_CLASS = "quiz-option-selected";
const QUESTION_ITEM_SELECTOR = ".quiz-question-item";
const SUBMIT_BUTTON_ID = "btn-submit";
const SUBMIT_INCOMPLETE_CLASS = "quiz-submit-btn-unsaved";

function setQuestionListItemCompleted(questionId, isCompleted) {
	if (!questionId) return;
	const item = document.querySelector(`${QUESTION_ITEM_SELECTOR}[href="#${questionId}"]`);
	if (!item) return;
	item.classList.toggle("is-completed", isCompleted);
}

function updateSubmitState() {
	const submitButton = document.getElementById(SUBMIT_BUTTON_ID);
	if (!submitButton) return;

	const panels = document.querySelectorAll(PANEL_SELECTOR);
	const answeredCount = Array.from(panels).filter(p => p.querySelector(`${OPTION_SELECTOR}.${SELECTED_CLASS}`)).length;
	const allAnswered = panels.length > 0 && answeredCount === panels.length;

	submitButton.classList.toggle(SUBMIT_INCOMPLETE_CLASS, !allAnswered);
}

function setSelectedOption(option) {
	if (!option) return;
	const panel = option.closest(PANEL_SELECTOR);
	if (!panel) return;

	const questionId = panel.id || panel.dataset.questionId;

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
		option.setAttribute("aria-pressed", option.classList.contains(SELECTED_CLASS) ? "true" : "false");
	});
}

// Event handlers: handle clicks and keyboard activation for existing DOM elements
document.addEventListener("click", (event) => {
	const option = event.target.closest(OPTION_SELECTOR);
	if (!option) return;
	setSelectedOption(option);
});

document.addEventListener("keydown", (event) => {
	if (event.key !== "Enter" && event.key !== " ") return;
	const option = event.target.closest(OPTION_SELECTOR);
	if (!option) return;
	event.preventDefault();
	setSelectedOption(option);
});

// Initialize state on load
document.addEventListener("DOMContentLoaded", () => {
	initializeOptions();
	updateSubmitState();
});
