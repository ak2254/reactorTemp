{
    f"{calendar.month_abbr[m]} 2025": round((monthly_counts.get(f"{calendar.month_abbr[m]} 2025", 0) / target) * 100, 1)
    if target else 0
    for m in range(1, 13)
}
