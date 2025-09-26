import os
from PIL import Image
from typing import List

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


def image_to_ascii(image_path, new_width=100, invert=False):
    try:
        image = Image.open(image_path)
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
        ascii_str[i:i+img_width]for i in range(0, len(ascii_str), img_width)
    )

    return ascii_img


# Example usage
if __name__ == "__main__":
    def get_final_name(filename: str) -> str:
        final_filename: str = ".".join(
            os.path.basename(filename).split(".")[:-1]
        )
        final_filename += ".txt"
        return str(final_filename)

    # Get the images in the source folder
    src_dir: str = os.path.join("input", "ditf")
    dest_dir: str = os.path.join("output", "ditf")
    src_dir_content: List[str] = os.listdir(src_dir)
    os.makedirs(dest_dir, exist_ok=True)
    for index, image_path in enumerate(src_dir_content):
        final_name = os.path.join(dest_dir, get_final_name(image_path))
        print(f"Final file name: {final_name}")
        full_path: str = os.path.join(src_dir, image_path)
        ascii_art = image_to_ascii(full_path, new_width=60, invert=True)
        if ascii_art:
            print(ascii_art)
            with open(final_name, "w", encoding="utf-8", newline="\n") as f:
                f.write(ascii_art)
    # Get the images in the source folder
    src_dir: str = os.path.join("input", "es")
    dest_dir: str = os.path.join("output", "es")
    src_dir_content: List[str] = os.listdir(src_dir)
    os.makedirs(dest_dir, exist_ok=True)
    for index, image_path in enumerate(src_dir_content):
        final_name = os.path.join(dest_dir, get_final_name(image_path))
        print(f"Final file name: {final_name}")
        full_path: str = os.path.join(src_dir, image_path)
        ascii_art = image_to_ascii(full_path, new_width=60, invert=True)
        if ascii_art:
            print(ascii_art)
            with open(final_name, "w", encoding="utf-8", newline="\n") as f:
                f.write(ascii_art)
