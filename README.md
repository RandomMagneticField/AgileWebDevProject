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
    pip install flask flask-sqlalchemy flask-migrate flask-wtf email-validator python-dotenv
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
    flask db upgrade
    ```

6. (Optional) Seed the database with sample data
    ```bash
    python seed.py
    ```

    This creates 3 sample users (alice, bob, charlie) with password `password123`

7. Run the app
    ```bash
    flask run 
    ```

## Test insturctions
Text
