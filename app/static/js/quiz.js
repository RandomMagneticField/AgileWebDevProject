const OPTION_SELECTOR = ".quiz-mcq-box";
const PANEL_SELECTOR = ".quiz-mcq-panel";
const SELECTED_CLASS = "quiz-option-selected";
const MCQ_CONTAINER_ID = "quiz-mcq-container";
const QUESTION_LIST_ID = "quiz-question-list";
const QUESTION_ITEM_SELECTOR = ".quiz-question-item";
const SUBMIT_BUTTON_ID = "btn-submit";
const SUBMIT_INCOMPLETE_CLASS = "quiz-submit-btn-unsaved";
const OPTION_KEYS = ["A", "B", "C", "D"];
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

 

function getOptionIconHtml(question, optionIndex) {
	if (!IS_RESULTS_MODE) {
		return "";
	}

	const isSelected = question.selected === optionIndex;
	const selectionWasCorrect = question.selected === question.correct;

	if (isSelected) {
		if (selectionWasCorrect) {
			return `<i class="bi bi-check-circle-fill quiz-option-icon quiz-option-icon-correct"></i>`;
		} else {
			return `<i class="bi bi-x-circle-fill quiz-option-icon quiz-option-icon-incorrect"></i>`;
		}
	}

	return "";
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
	const correctLetter = OPTION_KEYS[question.correct] || "";

	return `
		<div
			class="quiz-mcq-panel"
			id="${questionId}"
			data-question-number="${questionNumber}"
			data-question-id="${questionId}"
		>
			<div class="quiz-question-title">Question ${questionNumber}</div>
			<div class="quiz-question-prompt">${escapeHtml(question.description)}</div>
			${IS_RESULTS_MODE ? `<div class="quiz-correct-answer">Correct answer: ${escapeHtml(correctLetter)}</div>` : ``}
			<div class="quiz-mcq-stack">
				<div class="${getOptionClasses(question, 0)}" data-option="A">
				<div class="quiz-option-letter">A</div>
				<div class="note-card-body quiz-option-text">${escapeHtml(question.option_A)}</div>
				${getOptionIconHtml(question, 0)}
			</div>
			<div class="${getOptionClasses(question, 1)}" data-option="B">
				<div class="quiz-option-letter">B</div>
				<div class="note-card-body quiz-option-text">${escapeHtml(question.option_B)}</div>
				${getOptionIconHtml(question, 1)}
			</div>
			<div class="${getOptionClasses(question, 2)}" data-option="C">
				<div class="quiz-option-letter">C</div>
				<div class="note-card-body quiz-option-text">${escapeHtml(question.option_C)}</div>
				${getOptionIconHtml(question, 2)}
			</div>
			<div class="${getOptionClasses(question, 3)}" data-option="D">
				<div class="quiz-option-letter">D</div>
				<div class="note-card-body quiz-option-text">${escapeHtml(question.option_D)}</div>
				${getOptionIconHtml(question, 3)}
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

function createQuestionListItem(question, questionNumber) {
	if (IS_RESULTS_MODE) {
		const resultState = getQuestionResultState(quizData[questionNumber - 1]);
		const iconHtml = resultState === "correct"
			? `<i class="bi bi-check-circle-fill" style="color: var(--btn-green-color);"></i>`
			: `<i class="bi bi-x-circle-fill" style="color: var(--btn-danger-color);"></i>`;

		return `
			<a class="quiz-question-item is-result-${resultState}" href="#question-${questionNumber}" data-question-number="${questionNumber}">
				<span>${iconHtml} Question ${questionNumber}</span>
			</a>
		`;
	}

	return `
		<a class="quiz-question-item" href="#question-${questionNumber}" data-question-number="${questionNumber}">
			<span class="quiz-question-item-full">Question ${questionNumber}</span>
			<span class="quiz-question-item-short">${questionNumber}</span>
		</a>
	`;
}

function renderQuestionList() {
	const container = document.getElementById(QUESTION_LIST_ID);
	if (!container) {
		return;
	}

	container.innerHTML = quizData
		.map((question, index) => createQuestionListItem(question, index + 1))
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
