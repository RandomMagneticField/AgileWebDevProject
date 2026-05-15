# AgileWebDevProject
Repo for the agile web dev project

## Project Description
Text

## Group Members
| UWA ID | Name | Github Username |
|---|---|---|
| 24578417 | Chen Foong Lim | chenfoonglim |
| 24374107 | Zoelene Velinsky | zoevelin |
| 24412669 | Gabriel Masbate | RandomMagneticField |

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
**NOTE:** This version of our server tests was designed to be ran on windows/mac

For a version of our server tests with a setup more akin to the suggested setup on linux, run:
```bash
python -m unittest test/systemTests_linux.py
```