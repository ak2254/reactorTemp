# Read the CSV file as a text file
with open('your_csv_file.csv', 'r') as file:
    csv_text = file.read()

# Split the text into lines
lines = csv_text.split('\n')

# Initialize variables to keep track of rows and columns
num_columns = 50
current_row = 0
current_column = 0

# Create a list to store the organized data
organized_data = []

# Iterate through the lines of the CSV text
for line in lines:
    # Split the line into columns based on commas
    columns = line.split(',')

    # Iterate through the columns
    for column in columns:
        # Add the current column to the current row
        if current_row < len(organized_data):
            organized_data[current_row].append(column)
        else:
            # If the current row doesn't exist yet, create it
            organized_data.append([column])

        # Move to the next column
        current_column += 1

        # If we've reached the desired number of columns, move to the next row
        if current_column == num_columns:
            current_row += 1
            current_column = 0

# Print the organized data (you can also write it to a new CSV file)
for row in organized_data:
    print(','.join(row))
