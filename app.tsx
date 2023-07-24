# Convert the "prep_date" column to the desired "yymm" format
df['yymm'] = df['prep_date'].apply(lambda x: f'{str(x.year)[-2:]}{x.strftime("%d")}')
