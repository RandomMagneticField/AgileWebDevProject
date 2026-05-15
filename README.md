# AgileWebDevProject
Repository for the Agile Web Development project.

## Group Members
| UWA ID | Name | Github Username |
|---|---|---|
| 24578417 | Chen Foong Lim | chenfoonglim |
| 24374107 | Zoelene Velinsky | zoevelin |
| 24412669 | Gabriel Masbate | RandomMagneticField |

## Project Description
Notella is a student-focused study platform that brings notes, flashcards, and AI-generated quizzes into one workspace. Users can create Markdown notes with a formatting toolbar, live preview, headings, lists, code blocks, tables, tags, and public/private visibility controls. Flashcard decks can also be created for self-paced study sessions, where users flip through cards, mark answers as right or wrong, and receive a results summary to help identify what to review next.

The app also includes an AI quiz feature that generates multiple-choice questions directly from saved notes, allowing students to retake quizzes and track saved quiz results. Through the Discover page, users can browse public notes and flashcard decks shared by other students, filter resources by tags, preview content, and copy useful materials into their own personal library for editing and study.

## Launch instructions
1. Clone the repository
    ```bash
    git clone https://github.com/RandomMagneticField/AgileWebDevProject
    cd AgileWebDevProject
    ```

2. Create/activate Python virtual environment
    ```bash
    python3 -m venv venv
    source venv/bin/activate  # Mac/Linux
    venv\Scripts\activate     # Windows
    ```

3. Install dependencies
    ```bash
    pip install -r requirements.txt
    ```

4. Set up environment variables
    Create a `.env` file in the root directory with the following:
    ```
    SECRET_KEY=your-secret-key-here
    DATABASE_URL=sqlite:///notella.db
    OPENAI_API_KEY=your-openai-key-here  # Required for AI quiz feature
    ```

5. Set up the database
    ```bash
    flask --app run.py db upgrade
    ```

6. (Optional) Seed the database with sample data
    ```bash
    python seed.py
    ```

    This creates 3 sample users (alice, bob, charlie) with password `password123`

7. Run the app
    ```bash
    flask --app run.py run 
    ```

## Test insturctions
To run function unit tests, run:
```bash
python -m unittest test/unitTests.py
```

To run Selenium server tests, run:
```bash
python -m unittest test/systemTests.py
```
