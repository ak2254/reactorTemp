SELECT 
  *, 
  CAST(assigned_to_lastname AS VARCHAR) || ', ' || SPLIT_PART(CAST(assigned_to_first_name AS VARCHAR), ' ', 1) AS assigned_to
FROM capa
WHERE LOWER(
    CAST(assigned_to_lastname AS VARCHAR) || ', ' || SPLIT_PART(CAST(assigned_to_first_name AS VARCHAR), ' ', 1)
) IN ({name_placeholder});
