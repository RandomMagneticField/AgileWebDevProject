const OPTION_SELECTOR = ".quiz-mcq-box";
const PANEL_SELECTOR = ".quiz-mcq-panel";
const SELECTED_CLASS = "quiz-option-selected";
const MCQ_CONTAINER_ID = "quiz-mcq-container";
const QUESTION_LIST_ID = "quiz-question-list";
const QUESTION_ITEM_SELECTOR = ".quiz-question-item";
const SUBMIT_BUTTON_ID = "btn-submit";
const SUBMIT_INCOMPLETE_CLASS = "quiz-submit-btn-unsaved";
const IS_RESULTS_MODE = Boolean(window.__QUIZ_RESULTS_MODE__);

function getQuestionResultState(question) {
	if (!IS_RESULTS_MODE) {
		return null;
	}

	return question.selected === question.correct ? "correct" : "incorrect";
}

function getOptionClasses(question, optionIndex) {
	const classes = ["quiz-mcq-box"];

	if (IS_RESULTS_MODE && question.selected === optionIndex) {
		classes.push("quiz-option-selected");
		classes.push(`quiz-option-result-${getQuestionResultState(question)}`);
	}

	return classes.join(" ");
}

function getLetterClasses(question, optionIndex) {
	const classes = ["quiz-option-letter"];

	if (IS_RESULTS_MODE && question.selected !== question.correct && optionIndex === question.correct) {
		classes.push("quiz-option-letter-correct-indicator");
	}

	return classes.join(" ");
}

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
				<div class="${getOptionClasses(question, 0)}" data-option="A">
				<div class="${getLetterClasses(question, 0)}">A</div>
				<div class="note-card-body quiz-option-text">${escapeHtml(question.option_A)}</div>
			</div>
			<div class="${getOptionClasses(question, 1)}" data-option="B">
				<div class="${getLetterClasses(question, 1)}">B</div>
				<div class="note-card-body quiz-option-text">${escapeHtml(question.option_B)}</div>
			</div>
			<div class="${getOptionClasses(question, 2)}" data-option="C">
				<div class="${getLetterClasses(question, 2)}">C</div>
				<div class="note-card-body quiz-option-text">${escapeHtml(question.option_C)}</div>
			</div>
			<div class="${getOptionClasses(question, 3)}" data-option="D">
				<div class="${getLetterClasses(question, 3)}">D</div>
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

function createQuestionListItemForResult(question, questionNumber) {
	const resultState = getQuestionResultState(question);
	return `
		<a class="quiz-question-item is-result-${resultState}" href="#question-${questionNumber}" data-question-number="${questionNumber}">Question ${questionNumber}</a>
	`;
}

function renderQuestionList() {
	const container = document.getElementById(QUESTION_LIST_ID);
	if (!container) {
		return;
	}

	container.innerHTML = quizData
		.map((question, index) => {
			if (IS_RESULTS_MODE) {
				return createQuestionListItemForResult(question, index + 1);
			}

			return createQuestionListItem(index + 1);
		})
		.join("");
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
	if (IS_RESULTS_MODE) {
		return;
	}

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
	if (IS_RESULTS_MODE) {
		return;
	}

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
	if (IS_RESULTS_MODE) {
		return;
	}

	document.querySelectorAll(OPTION_SELECTOR).forEach((option) => {
		option.setAttribute("role", "button");
		option.setAttribute("tabindex", "0");
		option.setAttribute(
			"aria-pressed",
			option.classList.contains(SELECTED_CLASS) ? "true" : "false"
		);
	});
}

	if (!IS_RESULTS_MODE) {
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
	}

renderQuestions(); // render dummy data
renderQuestionList();
initializeOptions();
updateSubmitState();
