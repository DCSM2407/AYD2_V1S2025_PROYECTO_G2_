from config import config
import mysql.connector

db_config = config['database']()

def dbConnection():
    try:
        mydb = mysql.connector.connect(
            host=db_config.host,
            user=db_config.user,
            password=db_config.password,
            database=db_config.database
        )
        return mydb, None
    except Exception as ex:
        return None, ex
