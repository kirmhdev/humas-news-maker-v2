from flask import Flask, render_template, request
import requests
from bs4 import BeautifulSoup

app = Flask(__name__)

# Headers agar request kita terlihat seperti browser asli, bukan bot
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
}


def scrape_kompas():
    news_list = []
    try:
        url = "https://indeks.kompas.com/terpopuler?site=news"
        response = requests.get(url, headers=HEADERS, timeout=5)
        soup = BeautifulSoup(response.text, "html.parser")

        # Mencari elemen artikel (Struktur HTML Kompas bisa berubah sewaktu-waktu)
        article_list = soup.find_all(
            "div", class_="articleItem", recursive=True, limit=4
        )  # Ambil 5 berita saja agar cepat

        for article in article_list:
            title_tag = article.find("h2", class_="articleTitle")
            subtitle_tag = article.find("div", class_="articlePost-subtitle")
            link_tag = article.find("a", class_="article-link")
            date_tag = article.find("div", class_="articlePost-date")
            img_tag = article.find("img")

            news_list.append(
                {
                    "title": title_tag.text,
                    "source": "kompas.com",
                    "category": subtitle_tag.text,  # Kategori default jika sulit di-scrape di halaman depan
                    "date": date_tag.text,  # Menggunakan tanggal hari ini untuk simpelnya
                    "image": img_tag.get("src"),
                    "url": link_tag.get("href"),
                }
            )
    except Exception as e:
        print(f"Error scraping Kompas: {e}")

    return news_list


@app.route("/")
def index():
    all_news = scrape_kompas()

    return render_template("index.html", news=all_news, request=request)


if __name__ == "__main__":
    app.run(debug=True)
