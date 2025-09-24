import os
import sys
import json
from typing import List, Union, Dict, Any

ERROR = 1
SUCCESS = 0
VERSION = "1.0.0"


def check_file(file_path: str) -> str:
    """Function in charge of checking that a file can be read by the computer.

    Returns:
        str: Return the file path if the file is legible, an empty string otherwise.
    """
    if os.path.isfile(file_path) and (os.access(file_path, os.O_RDONLY) or os.access(file_path, os.O_RDWR)):
        return file_path
    return ""


def get_output_sorted_file_name(source_file: str) -> str:
    """Function in charge of generating the name for the output file of the sorted data.

    Args:
        source_file (str): The source filename from which we can generate the destination file name.

    Returns:
        str: The destination file name.
    """
    connector: str = ""
    file_path: List[str] = []
    file_name: str = ""
    file_format: List[str] = []
    final: str = ""
    if '/' in source_file:
        connector: str = "/"
        file_path: List[str] = source_file.split("/")
    elif '\\' in source_file:
        connector: str = "\\"
        file_path: List[str] = source_file.split("\\")
    if '.' in file_path[-1]:
        file_name: str = file_path[-1].split(".")[0]
        file_format: List[str] = file_path[-1].split(".")
        file_format.pop(0)
    else:
        file_name: str = file_path[-1]
    file_path.pop(-1)
    if connector != "":
        final += connector.join(file_path)
        final += connector
        final += file_name
        final += "_reorganised"
    if file_name != "":
        final += "."
        final += ".".join(file_format)
    return final


def get_output_min_file_name(source_file: str) -> str:
    """Function in charge of generating the name for the output file or the minified content.

    Args:
        source_file (str): The source filename from which we can generate the destination file name.

    Returns:
        str: The destination file name.
    """
    connector: str = ""
    file_path: List[str] = []
    file_name: str = ""
    file_format: List[str] = []
    final: str = ""
    if '/' in source_file:
        connector: str = "/"
        file_path: List[str] = source_file.split("/")
    elif '\\' in source_file:
        connector: str = "\\"
        file_path: List[str] = source_file.split("\\")
    if '.' in file_path[-1]:
        file_name: str = file_path[-1].split(".")[0]
        file_format: List[str] = file_path[-1].split(".")
        file_format.pop(0)
    else:
        file_name: str = file_path[-1]
    file_path.pop(-1)
    if connector != "":
        final += connector.join(file_path)
        final += connector
        final += file_name
        final += ".min"
    if file_name != "":
        final += "."
        final += ".".join(file_format)
    return final


def get_output_min_sorted_file_name(source_file: str) -> str:
    """Function in charge of generating the name for the output file of the minified and sorted content.

    Args:
        source_file (str): The source filename from which we can generate the destination file name.

    Returns:
        str: The destination file name.
    """
    connector: str = ""
    file_path: List[str] = []
    file_name: str = ""
    file_format: List[str] = []
    final: str = ""
    if '/' in source_file:
        connector: str = "/"
        file_path: List[str] = source_file.split("/")
    elif '\\' in source_file:
        connector: str = "\\"
        file_path: List[str] = source_file.split("\\")
    if '.' in file_path[-1]:
        file_name: str = file_path[-1].split(".")[0]
        file_format: List[str] = file_path[-1].split(".")
        file_format.pop(0)
    else:
        file_name: str = file_path[-1]
    file_path.pop(-1)
    if connector != "":
        final += connector.join(file_path)
        final += connector
        final += file_name
        final += "_reorganised.min"
    if file_name != "":
        final += "."
        final += ".".join(file_format)
    return final


def load_json_file(source_json: str) -> Union[Dict[str, Any], None]:
    """Function in charge of loading the content from the provided json file.

    Args:
        source_json (str): The source path for the json file.

    Returns:
        Union[Dict[str, Any], None]: The json content (or None if the read failed)
    """
    try:
        with open(source_json, "r", encoding="utf-8", newline="\n") as f:
            data = json.load(f)
    except Exception as e:
        print(f"Failed to load the json, error: {e}")
        return None
    return data


def main(src_file: str) -> int:
    """Function in charge of running the core section of the program

    Returns:
        int: The status of the execution
    """
    src_file = check_file(src_file)
    if src_file == "":
        print("The source path that you provided is not a file that can be read.")
        return ERROR
    destination_sorted_file: str = get_output_sorted_file_name(src_file)
    destination_min_file: str = get_output_min_file_name(src_file)
    destination_min_sorted_file: str = get_output_min_sorted_file_name(
        src_file
    )
    print(
        f"Source file: {src_file}, Destination file: {destination_sorted_file}, destination_min_file: {destination_min_file}, destination_min_sorted_file: {destination_min_sorted_file}")
    json_file: Union[Dict[str, Any], None] = load_json_file(src_file)
    if json_file is None:
        print("Failed to load the json file.")
        return ERROR
    print(f"Loaded data: {json_file}")
    print("Dumping minified version")
    try:
        with open(destination_min_file, "w", encoding="utf-8", newline="\n") as f:
            json.dump(
                json_file,
                f,
                indent=None,
                separators=(",", ":"),
                sort_keys=False
            )
    except Exception as e:
        print(f"Failed to dump the minified json, error: {e}")
        return ERROR
    print("Dumping reorganised version")
    try:
        with open(destination_sorted_file, "w", encoding="utf-8", newline="\n") as f:
            json.dump(
                json_file,
                f,
                indent=4,
                separators=(",", ": "),
                sort_keys=True
            )
    except Exception as e:
        print(f"Failed to dump the minified and reorganised json, error: {e}")
        return ERROR
    print("Dumping minified and reorganised version")
    try:
        with open(destination_min_sorted_file, "w", encoding="utf-8", newline="\n") as f:
            json.dump(
                json_file,
                f,
                indent=None,
                separators=(",", ":"),
                sort_keys=True
            )
    except Exception as e:
        print(f"Failed to dump the minified and reorganised json, error: {e}")
        return ERROR
    return SUCCESS


if __name__ == "__main__":
    argc: int = len(sys.argv)
    src_file: str = ""
    if argc == 1:
        print("Please provide the json file to process")
        sys.exit(ERROR)
    elif argc == 2 and (sys.argv[1].lower() in ("-h", "--h", "/h", "-help", "--help", "/help", "-?", "--?", "/?")):
        print("USAGE:")
        print(f"\t{sys.executable} {sys.argv[0]} [-h | <json_file_path>]")
        print("\t-h          Display this help and exit.")
        print("\t<json_file> The path to the json file to process.")
        print("")
        print(f"VERSION: {VERSION}")
        print("This program will take a json file and output the same file but sorted alphabetically.")
    elif argc == 2:
        src_file = sys.argv[1]
        if src_file == "":
            print("The argument you provided is not a file that can be read.")
            sys.exit(ERROR)
    status = main(src_file)
    print(f"The program is exiting with a status of : {status}")
    sys.exit(status)
