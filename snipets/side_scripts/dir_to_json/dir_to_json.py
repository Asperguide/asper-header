import os
import json

final_list = []
key1: str = "fileName"
key2: str = "fileContent"
key3: str = "fileType"
for i in os.listdir():
    final_list.append({})
    final_list[-1][key1] = i
    if os.path.isdir(i):
        final_list[-1][key2] = ""
        final_list[-1][key3] = "dir"
    elif os.path.isfile(i):
        with open(i, "r", encoding="utf-8", newline="\n") as f:
            final_list[-1][key2] = f.read().split("\n")
        final_list[-1][key3] = "file"
    else:
        final_list[-1][key2] = ""
        final_list[-1][key3] = "Unknown"


with open("files.json", "w", encoding="utf-8", newline="\n") as f:
    f.write(
        json.dumps(
            final_list,
            skipkeys=False,
            ensure_ascii=True,
            check_circular=True,
            indent=4,
            separators=(" ,", ": "),
            sort_keys=True
        )
    )

with open("files.min.json", "w", encoding="utf-8", newline="\n") as f:
    f.write(
        json.dumps(
            final_list,
            skipkeys=False,
            ensure_ascii=True,
            check_circular=True,
            indent=None,
            separators=(",", ":"),
            sort_keys=True
        )
    )
