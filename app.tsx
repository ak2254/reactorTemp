
import csv

# Set your input and output filenames
input_file = "alarms.msgs"   # <- Your .msgs file
output_file = "structured_alarms.csv"

structured_data = []

# Read each line from the .msgs file
with open(input_file, 'r') as file:
    for line in file:
        line = line.strip()
        
        # Only process lines with "ALARM"
        if "ALARM" in line.upper():
            parts = line.split()
            
            # Ensure we have enough parts to extract fields
            if len(parts) >= 8:
                letterpage = parts[0]
                type_field = parts[1] + " " + parts[2]
                timestamp = parts[3] + " " + parts[4]
                unit = parts[5]
                asset = parts[6]
                tag = parts[7]
                
                structured_data.append({
                    "Letterpage": letterpage,
                    "Type": type_field,
                    "Timestamp": timestamp,
                    "Unit": unit,
                    "Asset": asset,
                    "Tag": tag
                })

# Write the structured data to a CSV file
if structured_data:
    with open(output_file, mode='w', newline='') as csvfile:
        fieldnames = ["Letterpage", "Type", "Timestamp", "Unit", "Asset", "Tag"]
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

        writer.writeheader()
        writer.writerows(structured_data)

    print(f"✅ Extracted {len(structured_data)} alarm entries to: {output_file}")
else:
    print("⚠️ No ALARM lines found in the file.")
