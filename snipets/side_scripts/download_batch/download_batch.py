import re
import os
import requests
from urllib.parse import unquote


def clean_filename(url: str) -> str:
    file_name_inner = url.split("/")[-1]
    file_name_inner = unquote(file_name_inner)
    file_name_inner = re.sub(r"[^A-Za-z0-9.\-]", "_", file_name_inner)
    return file_name_inner


# Example list of URLs
urls = {
    "ditf": [
        "https://static.wikia.nocookie.net/darling-in-the-franxx/images/0/03/001.png",
        "https://static.wikia.nocookie.net/darling-in-the-franxx/images/b/b0/New_nana.png",
        "https://static.wikia.nocookie.net/darling-in-the-franxx/images/b/bc/081.png",
        "https://static.wikia.nocookie.net/darling-in-the-franxx/images/2/2d/090.png",
        "https://static.wikia.nocookie.net/darling-in-the-franxx/images/f/f9/Plan26.png",
        "https://static.wikia.nocookie.net/darling-in-the-franxx/images/6/62/9%27s_Model_Franxx.png",
        "https://static.wikia.nocookie.net/darling-in-the-franxx/images/6/6c/9a_stand.png",
        "https://static.wikia.nocookie.net/darling-in-the-franxx/images/7/73/9b_stand.png",
        "https://static.wikia.nocookie.net/darling-in-the-franxx/images/0/08/9y_stand.png",
        "https://static.wikia.nocookie.net/darling-in-the-franxx/images/6/6e/9o_stand.png",
        "https://static.wikia.nocookie.net/darling-in-the-franxx/images/1/1b/9idk_stand.png",
        "https://static.wikia.nocookie.net/darling-in-the-franxx/images/6/6d/9something_stand.png",
        "https://static.wikia.nocookie.net/darling-in-the-franxx/images/4/4d/Ai.png",
        "https://static.wikia.nocookie.net/darling-in-the-franxx/images/8/81/Argentea.png",
        "https://static.wikia.nocookie.net/darling-in-the-franxx/images/c/c5/WiseMan6.png",
        "https://static.wikia.nocookie.net/darling-in-the-franxx/images/c/c7/Chlorophytum.png",
        "https://static.wikia.nocookie.net/darling-in-the-franxx/images/2/2e/Delphinium.png",
        "https://static.wikia.nocookie.net/darling-in-the-franxx/images/b/be/Dr_FRANXX_infobox.png",
        "https://static.wikia.nocookie.net/darling-in-the-franxx/images/4/46/Futoshi_infobox.png",
        "https://static.wikia.nocookie.net/darling-in-the-franxx/images/f/fc/Futoshi%27s_daughter.PNG",
        "https://static.wikia.nocookie.net/darling-in-the-franxx/images/0/0d/Futoshi%27s_son.PNG",
        "https://static.wikia.nocookie.net/darling-in-the-franxx/images/5/56/Genista.png",
        "https://static.wikia.nocookie.net/darling-in-the-franxx/images/a/a4/WiseMan1.png",
        "https://static.wikia.nocookie.net/darling-in-the-franxx/images/7/7b/Goro_infobox.png",
        "https://static.wikia.nocookie.net/darling-in-the-franxx/images/4/48/Hachi_infobox.png",
        "https://static.wikia.nocookie.net/darling-in-the-franxx/images/a/a5/Hiro_infobox.png",
        "https://static.wikia.nocookie.net/darling-in-the-franxx/images/d/d4/Ichigo_infobox.png",
        "https://static.wikia.nocookie.net/darling-in-the-franxx/images/1/1e/Ikuno_infobox.png",
        "https://static.wikia.nocookie.net/darling-in-the-franxx/images/0/07/Karina_stand.png",
        "https://static.wikia.nocookie.net/darling-in-the-franxx/images/f/f5/Vlcsnap-2018-03-03-18h47m02s435.png",
        "https://static.wikia.nocookie.net/darling-in-the-franxx/images/4/44/Kokoro_infobox.png",
        "https://static.wikia.nocookie.net/darling-in-the-franxx/images/f/fe/DITF_MitsuKoko%27s_Second_Daughter.PNG",
        "https://static.wikia.nocookie.net/darling-in-the-franxx/images/5/5c/WiseMan5.png",
        "https://static.wikia.nocookie.net/darling-in-the-franxx/images/9/98/WiseMan2.png",
        "https://static.wikia.nocookie.net/darling-in-the-franxx/images/c/c0/Miku_infobox.png",
        "https://static.wikia.nocookie.net/darling-in-the-franxx/images/b/be/Mitsuru_infobox.png",
        "https://static.wikia.nocookie.net/darling-in-the-franxx/images/3/30/Nana_infobox.png",
        "https://static.wikia.nocookie.net/darling-in-the-franxx/images/3/39/Naomi.png",
        "https://static.wikia.nocookie.net/darling-in-the-franxx/images/6/61/PrincessCave.png",
        "https://static.wikia.nocookie.net/darling-in-the-franxx/images/d/d9/Old_woman.png",
        "https://static.wikia.nocookie.net/darling-in-the-franxx/images/1/19/Papa-close.png",
        "https://static.wikia.nocookie.net/darling-in-the-franxx/images/e/ea/ShuffleShiyou.png",
        "https://static.wikia.nocookie.net/darling-in-the-franxx/images/f/f9/Plan26.png",
        "https://static.wikia.nocookie.net/darling-in-the-franxx/images/9/93/Mecha_masspro.png",
        "https://static.wikia.nocookie.net/darling-in-the-franxx/images/9/93/Strelizia.png",
        "https://static.wikia.nocookie.net/darling-in-the-franxx/images/7/74/WiseMan7.png",
        "https://static.wikia.nocookie.net/darling-in-the-franxx/images/6/63/WiseMan3.png",
        "https://static.wikia.nocookie.net/darling-in-the-franxx/images/8/88/Zero_Two_infobox.png",
        "https://static.wikia.nocookie.net/darling-in-the-franxx/images/d/d5/Zorome_infobox.png",
    ],
    "es": [
        "https://static.wikia.nocookie.net/86-eighty-six/images/6/61/Slider_Light_Novel.jpg",
        "https://static.wikia.nocookie.net/86-eighty-six/images/7/72/Lena_2nd_cour.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/d/de/Annette_Anime.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/9/9e/Dustin_anime.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/6/60/Lev_Aldrecht.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/1/1a/Karlstahl_Anime.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/4/43/Josef.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/9/9e/Valep4.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/b/b6/Margarete.PNG",
        "https://static.wikia.nocookie.net/86-eighty-six/images/e/eb/Reverend_icon.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/6/68/LenaAid1.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/7/7b/Maleofficerpic1.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/6/64/Ltcol1.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/7/7c/5thhandlerofspearheadsquadron.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/1/17/Femnewscasterep12.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/b/bd/Giadian_Empire_emblem.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/4/41/San_Magnolia_Emblem.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/9/93/United_Kingdom_of_Roa_Gracia_emblem.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/e/e3/Regicide_emblem.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/9/9d/Alliance_of_Wald_emblem.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/0/05/Noiryanaruse_emblem.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/3/37/Gachatoku_Illustration.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/3/3b/Ep16_101.jpg",
        "https://static.wikia.nocookie.net/86-eighty-six/images/0/00/Sexymp-pfp.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/d/d2/Instructorpic6.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/1/14/FemalecadetpfpV2.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/a/a0/FemalecadetEP2.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/e/e9/Sandersanimeeps12pfp2.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/8/8d/TomPfp.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/a/ac/Fatasspfp2.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/3/3b/Shin_Full_Body.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/6/63/Raiden_Full_Body.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/4/47/Anju_Full_Body.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/8/8a/Kurena_Full_Body.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/b/b5/Theo_Full_Body.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/2/22/Haruto_anime.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/1/18/Daiya_Irma_Anime.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/1/16/Kaie_Tanya_Anime.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/e/e9/Kujo_Nico_Anime.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/5/51/Shiden_2nd_cour.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/f/f6/Shana_anime.jpg",
        "https://static.wikia.nocookie.net/86-eighty-six/images/4/41/Michihi2.jpg",
        "https://static.wikia.nocookie.net/86-eighty-six/images/c/cf/Rito_Oriya.jpg",
        "https://static.wikia.nocookie.net/86-eighty-six/images/4/4b/Claude_Icon.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/d/d1/Tohru_Icon.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/5/56/Yuuto_Icon.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/e/ee/Chitori_Icon.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/b/b8/Shourei_anime.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/a/a8/Alice.jpg",
        "https://static.wikia.nocookie.net/86-eighty-six/images/6/6a/Eijyu.jpg",
        "https://static.wikia.nocookie.net/86-eighty-six/images/9/90/Guren.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/e/e8/Isuka.jpg",
        "https://static.wikia.nocookie.net/86-eighty-six/images/0/02/Saiki.jpg",
        "https://static.wikia.nocookie.net/86-eighty-six/images/8/89/Touka.jpg",
        "https://static.wikia.nocookie.net/86-eighty-six/images/2/2c/Fido.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/6/6c/Thermopylae_Anime.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/5/56/Kino_anime.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/1/13/Touma_anime.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/1/15/Chise_anime.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/2/2b/Maina_anime.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/b/b6/Mikuri_anime.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/6/68/Touzan_anime.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/3/37/Lecca_anime.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/1/12/Kuroto_anime.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/8/85/Matthew_anime.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/5/59/Mina_anime.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/e/e1/Hariz_anime.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/8/8e/Kariya_anime.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/f/fa/Shuri_anime.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/6/64/Ochi_anime.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/1/1d/Io_anime.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/2/20/Grethe_anime.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/0/0f/Marcel_anime.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/0/09/Frederica_Vol_12.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/6/67/Frederica_2nd_cour.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/b/be/Bernholdt_anime.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/3/3e/Eugene_anime.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/4/45/Nina_2nd_cour.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/3/30/Teresa_anime.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/4/4b/Ernst_2nd_cour.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/c/cc/Richard_anime.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/d/de/Willem_anime.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/f/f6/Kiriya_Nouzen.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/a/ad/Pizzagirl1.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/2/2c/Svenia_icon.jpg",
        "https://static.wikia.nocookie.net/86-eighty-six/images/c/c2/Volume_5_Illustration_1.jpg",
        "https://static.wikia.nocookie.net/86-eighty-six/images/c/cc/Lerche.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/3/36/86_6_6.jpg",
        "https://static.wikia.nocookie.net/86-eighty-six/images/1/15/King_Idinarohk_Icon.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/0/03/Zafar_icon.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/3/36/Olivier_Aegis.jpg",
        "https://static.wikia.nocookie.net/86-eighty-six/images/c/cb/Bel_icon.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/f/f0/Ishmael.jpg",
        "https://static.wikia.nocookie.net/86-eighty-six/images/c/c6/Volume_9_Illustration_8.jpg",
        "https://static.wikia.nocookie.net/86-eighty-six/images/c/ce/Spearhead.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/a/a4/Brisingamen.jpg",
        "https://static.wikia.nocookie.net/86-eighty-six/images/1/1a/Falx_Squadron.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/3/35/Nordlicht.png",
        "https://static.wikia.nocookie.net/86-eighty-six/images/9/99/Strike_Package_Illustration_Shirabii.jpg",
        "https://static.wikia.nocookie.net/86-eighty-six/images/8/8a/Juggernaut.jpg"
    ]}


for key, value in urls.items():
    # Folder where files will be saved
    output_dir = f"images/{key}"
    os.makedirs(output_dir, exist_ok=True)

    for url in value:
        try:
            # Extract the file name from the URL
            file_name = clean_filename(url.split("/")[-1])
            file_path = os.path.join(output_dir, file_name)

            print(f"⬇️ Downloading {file_name} from {url} ...")

            # Send request
            response = requests.get(url, timeout=10)
            response.raise_for_status()  # Raise error if download failed

            # Save file
            with open(file_path, "wb") as f:
                f.write(response.content)

            print(f"✅ Saved to {file_path}")

        except requests.exceptions.RequestException as e:
            print(f"❌ Failed to download {url}: {e}")
