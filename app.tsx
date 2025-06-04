SELECT 
  *, 
  LOWER(CONCAT(SUBSTRING_INDEX(capa.assigned_to_first_name, ' ', 1), ' ', capa.assigned_to_lastname)) AS assigned_to
FROM capa
WHERE LOWER(CONCAT(SUBSTRING_INDEX(capa.assigned_to_first_name, ' ', 1), ' ', capa.assigned_to_lastname))
      IN ({name_placeholder});




def normalize_name(name: str) -> str:
    parts = name.strip().split()
    if len(parts) >= 2:
        return f"{parts[0].lower()} {parts[-1].lower()}"
    return name.lower()
