# -----------------------------
# 🧩 NPIR Sync Logic
# -----------------------------
@task
def process_npir_data(npir_sm_data: list[dict], npir_project_data: list[dict]) -> list[dict]:
    """Sync NPIR project data into NPIR SM data with status updates."""
    today = datetime.now().strftime("%Y-%m-%d")
    updated_sm_data = npir_sm_data.copy()
    sm_lookup = {item["description"]: item for item in npir_sm_data}

    for project in npir_project_data:
        description = (
            f"{project['npia document number']}"
            f"{project['project code']}"
            f"{project['project name']}"
            f"{project['n (new)/ R(re-intro)']}"
        )

        all_true = (
            project.get("2-solutions list")
            and project.get("3-var list")
            and project.get("4-equipment eval")
        )

        status = "Closed" if all_true else "Open"
        closed_date = today if all_true else None
        due_date = project.get("npir approval date")
        suite_area = project.get("project code")

        if description in sm_lookup:
            sm_entry = sm_lookup[description]
            sm_entry.update({
                "status": status,
                "Due date": due_date,
                "suite/area": suite_area,
                "closed date": closed_date,
            })
        else:
            new_record = {
                "description": description,
                "request type": "NPIR",
                "suite/area": suite_area,
                "status": status,
                "Due date": due_date,
                "closed date": closed_date,
                "Assigned To": None,
                "Thaw/Botling date": None,
                "m-185 required": None,
            }
            updated_sm_data.append(new_record)
            sm_lookup[description] = new_record

    return updated_sm_data


# -----------------------------
# ⚙️ Combined Flow
# -----------------------------
@flow
def sync_all_sm_flow(
    nipa_sm_data: list[dict],
    nipa_project_data: list[dict],
    npir_sm_data: list[dict],
    npir_project_data: list[dict]
) -> list[dict]:
    """Run both NIPA and NPIR syncs, then combine into one big list."""
    nipa_updated = process_nipa_data(nipa_sm_data, nipa_project_data)
    npir_updated = process_npir_data(npir_sm_data, npir_project_data)

    # Combine both into one master list
    all_sm_data = nipa_updated + npir_updated
    return all_sm_data
