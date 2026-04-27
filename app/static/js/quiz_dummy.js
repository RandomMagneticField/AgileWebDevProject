// ── Dummy data ──
const quizData = [
	{
		description: 'What is the derivative of 6e^3x ?',
		option_A: '6e^3x',
		option_B: '18xe^3x',
		option_C: '18e^3x',
		option_D: '18e^3',
		selected: 2,
		correct: 2
	},
	{
		description: 'What is NOT a difference between the Internet and the WWW (World Wide Web)?',
		option_A: 'The Internet is the global network infrastructure, while the WWW is a service that runs on top of it',
		option_B: 'The WWW uses HTTP/HTTPS, while the Internet includes many different protocols',
		option_C: 'The Internet is a subset of the WWW used only for websites',
		option_D: 'The WWW consists of web pages and browsers, while the Internet includes physical connections and routing',
		selected: 2,
		correct: 2
	},
	{
		description: 'Which layer in the TCP/IP model uses MAC addresses?',
		option_A: 'Application layer',
		option_B: 'Transport layer',
		option_C: 'Internet layer',
		option_D: 'Network Access layer',
		selected: 3,
		correct: 3
	},
	{
		description: 'A car starts from rest and accelerates uniformly at 2 m/s^2 for 10 seconds along a straight road. It then continues at constant velocity for another 5 seconds. What is the total distance travelled by the car over the entire 15 seconds?',
		option_A: '100 m',
		option_B: '200 m',
		option_C: '250 m',
		option_D: '300 m',
		selected: 2,
		correct: 1
	},
	{
		description: 'Which of these best describes the difference between dynamic and static analyzers?',
		option_A: 'Static analyzers examine source code without executing it, identifying potential issues like syntax errors or unsafe patterns. Dynamic analyzers run the program and observe its behaviour during execution to detect runtime issues such as memory leaks or crashes.',
		option_B: 'Dynamic analyzers only check code formatting and style rules, while static analyzers simulate execution in real time and detect runtime bugs by executing compiled binaries.',
		option_C: 'Static analyzers require compiled binaries and monitor memory usage during execution, while dynamic analyzers only read source files and provide compile-time warnings.',
		option_D: 'There is no meaningful difference; both static and dynamic analyzers perform identical checks on code at compile time without execution.',
		selected: 0,
		correct: 0
	},
	{
		description: 'Which of these are a correct listing of the main pillars of cybersecurity?',
		option_A: 'Authentication, Authorization, Accounting',
		option_B: 'Confidentiality, Integrity, Availability',
		option_C: 'Encryption, Decryption, Hashing',
		option_D: 'Prevention, Detection, Response',
		selected: 1,
		correct: 1
	},
	{
		description: 'Which of these best describes the difference between pure ALOHA and slotted ALOHA?',
		option_A: 'Pure ALOHA allows transmission at any time, which leads to higher collision probability. Slotted ALOHA restricts transmissions to discrete time slots, reducing collisions and improving efficiency.',
		option_B: 'Slotted ALOHA allows devices to transmit at any time, increasing throughput, while pure ALOHA forces devices to wait for fixed time intervals before sending data.',
		option_C: 'Pure ALOHA eliminates collisions entirely by using acknowledgements, while slotted ALOHA introduces random transmission delays to reduce efficiency.',
		option_D: 'There is no difference between pure and slotted ALOHA; both operate identically with continuous transmission and equal collision probability.',
		selected: 0,
		correct: 1
	},
	{
		description: 'Which of these HTML code correctly forms a link to an element with id of \'MyTitle\'?',
		option_A: '<a href="MyTitle">Go to title</a>',
		option_B: '<a href="#MyTitle">Go to title</a>',
		option_C: '<link href="#MyTitle">Go to title</link>',
		option_D: '<a link="#MyTitle">Go to title</a>',
		selected: 3,
		correct: 3
	}
];