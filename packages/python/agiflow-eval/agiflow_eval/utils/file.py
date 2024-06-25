import os


def delete_file_if_exists(file_path):
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
    except Exception as e:
        print(f"An error occurred: {e}")
