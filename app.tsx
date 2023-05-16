import random
import string
import csv

def generate_csv_file(num_rows):
    file_path = "data.csv"  # Specify the file name or path here
    with open(file_path, "w", newline="") as file:
        writer = csv.writer(file)
        writer.writerow(["random_num", "random_str"])

        for _ in range(num_rows):
            random_num = random.randint(1, 100)
            random_str = ''.join(random.choices(string.ascii_letters, k=10))
            writer.writerow([random_num, random_str])

    return file_path

def read_csv_file(file_path):
    sum_random_num = 0
    word_count = {}

    with open(file_path, "r") as file:
        reader = csv.DictReader(file)
        for row in reader:
            random_num = int(row["random_num"])
            sum_random_num += random_num

            random_str = row["random_str"]
            if random_str in word_count:
                word_count[random_str] += 1
            else:
                word_count[random_str] = 1

    most_used_word = max(word_count, key=word_count.get)
    count_most_used_word = word_count[most_used_word]

    return sum_random_num, most_used_word, count_most_used_word

# Usage example
num_rows = 1000
csv_file_path = generate_csv_file(num_rows)
sum_random_num, most_used_word, count_most_used_word = read_csv_file(csv_file_path)

print(f"Sum of random_num column: {sum_random_num}")
print(f"Most used word in random_str column: {most_used_word} (Count: {count_most_used_word})")

