WRRRP_Count :=
from prefect import flow, task
import pandas as pd
import sqlalchemy

# Replace with your actual DB URL
DB_URL = "mssql+pyodbc://username:password@dsn_name"

@task
def fetch_task_data():
    engine = sqlalchemy.create_engine(DB_URL)

    query = """
    SELECT
        task.id AS task_id,
        main.id AS main_id,
        main.title AS main_title,
        main.sub_category,
        txt.description_of_change,
        main.created_date,
        main.change_type,
        main.change_category,
        task.title AS task_title
    FROM task
    JOIN main ON task.parent_id = main.id
    JOIN txt ON txt.id = main.id
    WHERE
        task.is_closed = 'No'
        AND task.assigned_to_first_name = 'Anj'
        AND task.assigned_to_last_name = 'kaur'
    """

    with engine.connect() as conn:
        df = pd.read_sql(query, conn)

    return df
