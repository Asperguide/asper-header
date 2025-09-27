import os
import json
from typing import List, Dict, Any


class GenerateJsonMetaData:
    def __init__(self) -> None:
        self.final_list: List[Dict[str, Any]] = []
        self.key1: str = "fileName"
        self.key2: str = "fileContent"
        self.key3: str = "fileType"
        self.key4: str = "fileParentDirectory"
        self.json_name: str = "files.json"
        self.minified_json_name: str = "files.min.json"

    def __call__(self, cwd: str, *args: Any, **kwds: Any) -> Any:
        self.final_list = []
        current_cwd: str = os.getcwd()
        os.chdir(cwd)
        try:
            self.gather_content(cwd)
            print("Content gathered")
            self.dump_json()
            print("Content written")
            self.dump_minified_json()
            print("Minified content written")
        except Exception as e:
            print(f"An unknown error occurred: {e}")
        finally:
            os.chdir(current_cwd)

    def gather_content(self, cwd: str):
        for i in os.listdir():
            if i in (self.json_name, self.minified_json_name):
                continue
            self.final_list.append({})
            self.final_list[-1][self.key1] = i
            self.final_list[-1][self.key4] = os.path.basename(cwd)
            if os.path.isdir(i):
                self.final_list[-1][self.key2] = ""
                self.final_list[-1][self.key3] = "dir"
            elif os.path.isfile(i):
                if i.endswith(".txt"):
                    with open(i, "r", encoding="utf-8", newline="\n") as f:
                        self.final_list[-1][self.key2] = f.read().split("\n")
                    self.final_list[-1][self.key3] = "file"
                elif i.endswith(".json") or i.endswith(".jsonc"):
                    try:
                        self.final_list[-1][self.key2] = json.loads(
                            os.path.join(cwd, i)
                        )
                        self.final_list[-1][self.key3] = "json"
                    except Exception:
                        self.final_list[-1][self.key2] = os.path.join(
                            os.path.basename(cwd), i
                        )
                        self.final_list[-1][self.key3] = "path"
                else:
                    self.final_list[-1][self.key2] = os.path.join(
                        os.path.basename(cwd), i)
                    self.final_list[-1][self.key3] = "path"

            else:
                self.final_list[-1][self.key2] = ""
                self.final_list[-1][self.key3] = "Unknown"

    def dump_json(self) -> None:
        with open(self.json_name, "w", encoding="utf-8", newline="\n") as f:
            f.write(
                json.dumps(
                    self.final_list,
                    skipkeys=False,
                    ensure_ascii=True,
                    check_circular=True,
                    indent=4,
                    separators=(" ,", ": "),
                    sort_keys=True
                )
            )

    def dump_minified_json(self) -> None:
        with open(self.minified_json_name, "w", encoding="utf-8", newline="\n") as f:
            f.write(
                json.dumps(
                    self.final_list,
                    skipkeys=False,
                    ensure_ascii=True,
                    check_circular=True,
                    indent=None,
                    separators=(",", ":"),
                    sort_keys=True
                )
            )


if __name__ == "__main__":
    GenerateJsonMetaData()(os.getcwd())
