SELECT *
FROM capa
WHERE LOWER(CONCAT(SUBSTRING_INDEX(capa.assigned_to_first_name, ' ', 1), ' ', capa.assigned_to_lastname))
      IN ('anjali smith', 'brian lee', 'sophie brown');
