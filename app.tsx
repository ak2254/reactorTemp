def normalize_last_first(name: str) -> str:
    # Expected format: "Last, First Middle"
    if ',' in name:
        last, rest = name.split(',', 1)
        first = rest.strip().split()[0]  # Get only the first name
        return f"{last.strip().lower()}, {first.lower()}"
    return name.strip().lower()

normalized_names = {normalize_last_first(name) for name in ALL_names}
name_placeholder = ", ".join(f"'{name}'" for name in normalized_names)
