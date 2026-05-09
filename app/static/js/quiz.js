const OPTION_SELECTOR = ".quiz-mcq-box";
const PANEL_SELECTOR = ".quiz-mcq-panel";
const SELECTED_CLASS = "quiz-option-selected";
const QUESTION_ITEM_SELECTOR = ".quiz-question-item";
const SUBMIT_BUTTON_ID = "btn-submit";
const SUBMIT_INCOMPLETE_CLASS = "quiz-submit-btn-unsaved";
const QUIZ_FORM_ID = "quiz-form";
const CONFIRM_MODAL_ID = "quiz-submit-modal";
const CONFIRM_MODAL_BACKDROP_ID = "quiz-submit-modal-backdrop";
const CONFIRM_MODAL_CANCEL_ID = "quiz-submit-modal-cancel";
const CONFIRM_MODAL_SUBMIT_ID = "quiz-submit-modal-submit";

let allowSubmit = false;

function setQuestionListItemCompleted(questionId, isCompleted) {
	if (!questionId) return;
	const item = document.querySelector(`${QUESTION_ITEM_SELECTOR}[href="#${questionId}"]`);
	if (!item) return;
	item.classList.toggle("is-completed", isCompleted);
}

function setHiddenAnswerValue(panel, value) {
	if (!panel) return;
	const hiddenInput = panel.querySelector('input[type="hidden"]');
	if (!hiddenInput) return;
	hiddenInput.value = value || "";
}

function updateSubmitState() {
	const submitButton = document.getElementById(SUBMIT_BUTTON_ID);
	if (!submitButton) return;

	const panels = document.querySelectorAll(PANEL_SELECTOR);
	const answeredCount = Array.from(panels).filter(p => p.querySelector(`${OPTION_SELECTOR}.${SELECTED_CLASS}`)).length;
	const allAnswered = panels.length > 0 && answeredCount === panels.length;

	submitButton.classList.toggle(SUBMIT_INCOMPLETE_CLASS, !allAnswered);
}

function getQuizPanels() {
	return Array.from(document.querySelectorAll(PANEL_SELECTOR));
}

function hasUnansweredQuestions() {
	const panels = getQuizPanels();
	if (panels.length === 0) return false;
	return panels.some(p => !p.querySelector(`${OPTION_SELECTOR}.${SELECTED_CLASS}`));
}

function openSubmitModal() {
	const modal = document.getElementById(CONFIRM_MODAL_ID);
	const backdrop = document.getElementById(CONFIRM_MODAL_BACKDROP_ID);
	if (!modal || !backdrop) return;
	modal.hidden = false;
	backdrop.hidden = false;
	const cancelButton = document.getElementById(CONFIRM_MODAL_CANCEL_ID);
	if (cancelButton) cancelButton.focus();
}

function closeSubmitModal() {
	const modal = document.getElementById(CONFIRM_MODAL_ID);
	const backdrop = document.getElementById(CONFIRM_MODAL_BACKDROP_ID);
	if (modal) modal.hidden = true;
	if (backdrop) backdrop.hidden = true;
}

function submitQuizForm() {
	const form = document.getElementById(QUIZ_FORM_ID);
	if (!form) return;
	allowSubmit = true;
	form.requestSubmit ? form.requestSubmit() : form.submit();
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
		setHiddenAnswerValue(panel, "");
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
	setHiddenAnswerValue(panel, option.dataset.option ? option.dataset.option.toLowerCase() : "");
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

function initializePreselectedAnswers() {
	// Mark question list items as completed for any pre-selected answers
	document.querySelectorAll(PANEL_SELECTOR).forEach((panel) => {
		const questionId = panel.id || panel.dataset.questionId;
		const hasSelected = panel.querySelector(`${OPTION_SELECTOR}.${SELECTED_CLASS}`);
		if (hasSelected) {
			setQuestionListItemCompleted(questionId, true);
		}
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
	initializePreselectedAnswers();
	updateSubmitState();

	const form = document.getElementById(QUIZ_FORM_ID);
	const cancelButton = document.getElementById(CONFIRM_MODAL_CANCEL_ID);
	const submitButton = document.getElementById(CONFIRM_MODAL_SUBMIT_ID);
	const backdrop = document.getElementById(CONFIRM_MODAL_BACKDROP_ID);

	if (form) {
		form.addEventListener("submit", (event) => {
			if (allowSubmit) {
				allowSubmit = false;
				return;
			}

			if (hasUnansweredQuestions()) {
				event.preventDefault();
				openSubmitModal();
			}
		});
	}

	if (cancelButton) {
		cancelButton.addEventListener("click", () => {
			closeSubmitModal();
		});
	}

	if (submitButton) {
		submitButton.addEventListener("click", () => {
			closeSubmitModal();
			submitQuizForm();
		});
	}

	if (backdrop) {
		backdrop.addEventListener("click", () => {
			closeSubmitModal();
		});
	}
});
