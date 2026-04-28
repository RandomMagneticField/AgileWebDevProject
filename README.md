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
    pip install flask flask-sqlalchemy flask-migrate flask-wtf email-validator
    ```

4. Set up the database
    ```bash
    flask db upgrade
    ```

5. Run the app
    ```bash
    flask run 
    ```

## Test insturctions
Text
