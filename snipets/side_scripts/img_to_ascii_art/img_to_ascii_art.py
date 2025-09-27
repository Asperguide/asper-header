import io
import os
import re
import json
from typing import List, Dict, Any

from PIL import Image
try:
    import cairosvg
except ImportError:
    print("Cairo svg is not installed, please install it before continuing")
    cairosvg = None

# Default characters from dark to light
ASCII_CHARS = ["@", "#", "S", "%", "?", "*", "+", ";", ":", ",", "."]


def resize_image(image, new_width=100):
    """Resize image maintaining aspect ratio"""
    width, height = image.size
    aspect_ratio = height / width
    # 0.55 compensates font height
    new_height = int(new_width * aspect_ratio * 0.55)
    return image.resize((new_width, new_height))


def grayify(image):
    """Convert image to grayscale"""
    return image.convert("L")


def pixels_to_ascii(image, invert=False):
    """Map pixels to ASCII chars"""
    chars = ASCII_CHARS[::-1] if invert else ASCII_CHARS
    pixels = image.getdata()
    ascii_str = "".join(chars[pixel // 25] for pixel in pixels)
    return ascii_str


def load_image(image_path: str) -> Image.Image:
    """Load image, handling SVG if necessary"""
    ext = os.path.splitext(image_path)[1].lower()

    if ext == ".svg":
        if not cairosvg:
            raise RuntimeError(
                "SVG support requires CairoSVG. Run `pip install cairosvg`."
            )
        # Convert SVG to PNG in memory
        with open(image_path, "rb") as f:
            svg_data = f.read()
        png_bytes = cairosvg.svg2png(bytestring=svg_data)
        if isinstance(png_bytes, bytes):
            return Image.open(io.BytesIO(png_bytes)).convert("RGBA")
        raise RuntimeError(f"Couldn't convert file {image_path}")
    else:
        return Image.open(image_path).convert("RGBA")


def image_to_ascii(image_path, new_width=100, invert=False):
    try:
        image = load_image(image_path)
    except Exception as e:
        print(f"Unable to open image: {e}")
        return

    # Process image
    image = resize_image(image, new_width)
    image = grayify(image)

    # Convert to ASCII
    ascii_str = pixels_to_ascii(image, invert=invert)
    img_width = image.width
    ascii_img = "\n".join(
        ascii_str[i:i + img_width] for i in range(0, len(ascii_str), img_width)
    )
    return ascii_img


global_list: List[Dict[str, Any]] = []


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
            self.dump_json()
            self.dump_minified_json()
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


# Example usage
if __name__ == "__main__":
    def get_final_name(filename: str) -> str:
        final_filename: str = ".".join(
            os.path.basename(filename).split(".")[:-1]
        )
        final_filename += ".txt"
        return str(final_filename)

    GJMI: GenerateJsonMetaData = GenerateJsonMetaData()

    # Get the images in the source folder
    src_dir: str = os.path.join("input", "androidSystems")
    dest_dir: str = os.path.join("output", "androidSystems")
    src_dir_content: List[str] = os.listdir(src_dir)
    os.makedirs(dest_dir, exist_ok=True)
    for index, image_path in enumerate(src_dir_content):
        print(f"Processing file: {os.path.join(src_dir, image_path)}")
        final_name = os.path.join(dest_dir, get_final_name(image_path))
        full_path: str = os.path.join(src_dir, image_path)
        ascii_art = image_to_ascii(full_path, new_width=60, invert=True)
        if ascii_art:
            print(ascii_art)
            with open(final_name, "w", encoding="utf-8", newline="\n") as f:
                f.write(ascii_art)
        print(f"Final file name: {final_name}")
    GJMI(dest_dir)
    global_list.extend(GJMI.final_list)
    # Get the images in the source folder
    src_dir: str = os.path.join("input", "appleEvents")
    dest_dir: str = os.path.join("output", "appleEvents")
    src_dir_content: List[str] = os.listdir(src_dir)
    os.makedirs(dest_dir, exist_ok=True)
    for index, image_path in enumerate(src_dir_content):
        print(f"Processing file: {os.path.join(src_dir, image_path)}")
        final_name = os.path.join(dest_dir, get_final_name(image_path))
        full_path: str = os.path.join(src_dir, image_path)
        ascii_art = image_to_ascii(full_path, new_width=60, invert=True)
        if ascii_art:
            print(ascii_art)
            with open(final_name, "w", encoding="utf-8", newline="\n") as f:
                f.write(ascii_art)
        print(f"Final file name: {final_name}")
    # GJMI(dest_dir) # ignoring output because resulting file is too big (~ 200MB)
    # global_list.extend(GJMI.final_list) # ignoring output because resulting file is too big (~ 200MB)
    # Get the images in the source folder
    src_dir: str = os.path.join("input", "appleSystems")
    dest_dir: str = os.path.join("output", "appleSystems")
    src_dir_content: List[str] = os.listdir(src_dir)
    os.makedirs(dest_dir, exist_ok=True)
    for index, image_path in enumerate(src_dir_content):
        print(f"Processing file: {os.path.join(src_dir, image_path)}")
        final_name = os.path.join(dest_dir, get_final_name(image_path))
        full_path: str = os.path.join(src_dir, image_path)
        ascii_art = image_to_ascii(full_path, new_width=60, invert=True)
        if ascii_art:
            print(ascii_art)
            with open(final_name, "w", encoding="utf-8", newline="\n") as f:
                f.write(ascii_art)
        print(f"Final file name: {final_name}")
    GJMI(dest_dir)
    global_list.extend(GJMI.final_list)
    # Get the images in the source folder
    src_dir: str = os.path.join("input", "ditf")
    dest_dir: str = os.path.join("output", "ditf")
    src_dir_content: List[str] = os.listdir(src_dir)
    os.makedirs(dest_dir, exist_ok=True)
    for index, image_path in enumerate(src_dir_content):
        print(f"Processing file: {os.path.join(src_dir, image_path)}")
        final_name = os.path.join(dest_dir, get_final_name(image_path))
        full_path: str = os.path.join(src_dir, image_path)
        ascii_art = image_to_ascii(full_path, new_width=60, invert=True)
        if ascii_art:
            print(ascii_art)
            with open(final_name, "w", encoding="utf-8", newline="\n") as f:
                f.write(ascii_art)
        print(f"Final file name: {final_name}")
    GJMI(dest_dir)
    global_list.extend(GJMI.final_list)
    # Get the images in the source folder
    src_dir: str = os.path.join("input", "es")
    dest_dir: str = os.path.join("output", "es")
    src_dir_content: List[str] = os.listdir(src_dir)
    os.makedirs(dest_dir, exist_ok=True)
    for index, image_path in enumerate(src_dir_content):
        print(f"Processing file: {os.path.join(src_dir, image_path)}")
        final_name = os.path.join(dest_dir, get_final_name(image_path))
        full_path: str = os.path.join(src_dir, image_path)
        ascii_art = image_to_ascii(full_path, new_width=60, invert=True)
        if ascii_art:
            print(ascii_art)
            with open(final_name, "w", encoding="utf-8", newline="\n") as f:
                f.write(ascii_art)
        print(f"Final file name: {final_name}")
    GJMI(dest_dir)
    global_list.extend(GJMI.final_list)
    # Get the images in the source folder
    src_dir: str = os.path.join("input", "iosSystems")
    dest_dir: str = os.path.join("output", "iosSystems")
    src_dir_content: List[str] = os.listdir(src_dir)
    os.makedirs(dest_dir, exist_ok=True)
    for index, image_path in enumerate(src_dir_content):
        print(f"Processing file: {os.path.join(src_dir, image_path)}")
        final_name = os.path.join(dest_dir, get_final_name(image_path))
        full_path: str = os.path.join(src_dir, image_path)
        ascii_art = image_to_ascii(full_path, new_width=60, invert=True)
        if ascii_art:
            print(ascii_art)
            with open(final_name, "w", encoding="utf-8", newline="\n") as f:
                f.write(ascii_art)
        print(f"Final file name: {final_name}")
    GJMI(dest_dir)
    global_list.extend(GJMI.final_list)
    # Get the images in the source folder
    src_dir: str = os.path.join("input", "linuxSystems")
    dest_dir: str = os.path.join("output", "linuxSystems")
    src_dir_content: List[str] = os.listdir(src_dir)
    os.makedirs(dest_dir, exist_ok=True)
    for index, image_path in enumerate(src_dir_content):
        print(f"Processing file: {os.path.join(src_dir, image_path)}")
        final_name = os.path.join(dest_dir, get_final_name(image_path))
        full_path: str = os.path.join(src_dir, image_path)
        ascii_art = image_to_ascii(full_path, new_width=60, invert=True)
        if ascii_art:
            print(ascii_art)
            with open(final_name, "w", encoding="utf-8", newline="\n") as f:
                f.write(ascii_art)
        print(f"Final file name: {final_name}")
    GJMI(dest_dir)
    global_list.extend(GJMI.final_list)
    # Get the images in the source folder
    src_dir: str = os.path.join("input", "windowsSystem")
    dest_dir: str = os.path.join("output", "windowsSystem")
    src_dir_content: List[str] = os.listdir(src_dir)
    os.makedirs(dest_dir, exist_ok=True)
    for index, image_path in enumerate(src_dir_content):
        print(f"Processing file: {os.path.join(src_dir, image_path)}")
        final_name = os.path.join(
            dest_dir, f"inverted_{get_final_name(image_path)}"
        )
        full_path: str = os.path.join(src_dir, image_path)
        ascii_art = image_to_ascii(full_path, new_width=60, invert=True)
        if ascii_art:
            print(ascii_art)
            with open(final_name, "w", encoding="utf-8", newline="\n") as f:
                f.write(ascii_art)
        print(f"Final file name: {final_name}")
    # GJMI(dest_dir) #Commented because resulting file is too big
    # global_list.extend(GJMI.final_list) #Commented because resulting file is too big
    # Get the images in the source folder
    src_dir: str = os.path.join("input", "windowsSystem")
    dest_dir: str = os.path.join("output", "windowsSystem")
    src_dir_content: List[str] = os.listdir(src_dir)
    os.makedirs(dest_dir, exist_ok=True)
    for index, image_path in enumerate(src_dir_content):
        print(f"Processing file: {os.path.join(src_dir, image_path)}")
        final_name = os.path.join(dest_dir, get_final_name(image_path))
        full_path: str = os.path.join(src_dir, image_path)
        ascii_art = image_to_ascii(full_path, new_width=60, invert=False)
        if ascii_art:
            print(ascii_art)
            with open(final_name, "w", encoding="utf-8", newline="\n") as f:
                f.write(ascii_art)
        print(f"Final file name: {final_name}")
    # GJMI(dest_dir) # ignored because file is too big (6.3 G)
    # global_list.extend(GJMI.final_list) #ignored because resulting file is to big (6.3 G)
    GJMI.final_list = global_list
    GJMI.json_name = "allImages.json"
    GJMI.dump_json()
    GJMI.minified_json_name = "allImages.min.json"
    GJMI.dump_minified_json()
