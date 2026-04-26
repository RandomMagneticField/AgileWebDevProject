(() => {
	const OPTION_SELECTOR = ".quiz-mcq-box";
	const PANEL_SELECTOR = ".quiz-mcq-panel";
	const SELECTED_CLASS = "quiz-option-selected";

	function setSelectedOption(option) {
		const panel = option.closest(PANEL_SELECTOR);
		if (!panel) {
			return;
		}

		const selected = panel.querySelector(`${OPTION_SELECTOR}.${SELECTED_CLASS}`);

		if (selected === option) {
			option.classList.remove(SELECTED_CLASS);
			option.setAttribute("aria-pressed", "false");
			return;
		}

		if (selected) {
			selected.classList.remove(SELECTED_CLASS);
			selected.setAttribute("aria-pressed", "false");
		}

		option.classList.add(SELECTED_CLASS);
		option.setAttribute("aria-pressed", "true");
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

	initializeOptions();
})();
