@task
def sync_sql_to_sharepoint(new_data: List[Dict], sharepoint_data: List[Dict]):
    sp_lookup = {row["task_id"]: row for row in sharepoint_data}

    for new_row in new_data:
        task_id = new_row["task_id"]
        new_checksum = new_row["checksum"]

        if task_id in sp_lookup:
            sp_row = sp_lookup[task_id]
            if sp_row.get("checksum") != new_checksum:
                # Need to update
                update_fields = {k: new_row[k] for k in new_row if k != "checksum"}  # or however you want
                update_fields["checksum"] = new_checksum  # update checksum too
                update_sharepoint_row(sp_row["ID"], update_fields)
        else:
            # Add new row
            add_sharepoint_row(new_row)

