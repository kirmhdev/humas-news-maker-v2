from flask import Flask, render_template, request
import requests
from bs4 import BeautifulSoup
import json
import tldextract


class SuggestedNewsSource:
    def __init__(
        self,
        prefix,
        url,
        article_query,
        title_query,
        category_query,
        link_query,
        date_query,
        image_query,
    ):
        self.prefix = prefix
        self.url = url
        self.article_query = article_query
        self.title_query = title_query
        self.category_query = category_query
        self.link_query = link_query
        self.date_query = date_query
        self.image_query = image_query


class NewsSource:
    def __init__(
        self,
        prefix,
        title_query,
        paragraph_query,
        category_query,
        date_query,
        image_query,
    ):
        self.prefix = prefix
        self.title_query = title_query
        self.paragraph_query = paragraph_query
        self.category_query = category_query
        self.date_query = date_query
        self.image_query = image_query


class News:
    def __init__(self, title, prefix, category, date, image, url, paragraph):
        self.title = title
        self.prefix = prefix
        self.category = category
        self.date = date
        self.image = image
        self.paragraph = paragraph
        self.url = url

    def __dict__(self):
        return {
            "title": self.title,
            "prefix": self.prefix,
            "category": self.category,
            "date": self.date,
            "image": self.image,
            "paragraph": self.paragraph,
            "url": self.url,
        }


class SuggestedNews:
    def __init__(self, title, prefix, category, date, image, url):
        self.title = title
        self.prefix = prefix
        self.category = category
        self.date = date
        self.image = image
        self.url = url


app = Flask(__name__)

# Headers agar request kita terlihat seperti browser asli, bukan bot
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
}

suggested_news_sources = [
    SuggestedNewsSource(
        prefix="kompas.com",
        url="https://kompas.com/",
        article_query="div.wSpec-item",
        title_query="h4.wSpec-title",
        category_query="p.wSpec-subtitle",
        link_query="a",
        date_query="p.wSpec-subtitle > span",
        image_query="img",
    )
]

news_sources = [
    NewsSource(
        prefix="kompas.com",
        title_query="h1.read__title",
        paragraph_query="div.clearfix > p",
        category_query="ul.breadcrumb__wrap > li:nth-child(2) > a",
        date_query="div.read__time",
        image_query="div.photo__wrap > img",
    )
]

selected_news = []  # List untuk menyimpan berita yang dipilih


def scrape_suggested_news(data):
    news_list = []
    try:
        url = data.url
        response = requests.get(url, headers=HEADERS, timeout=5)
        soup = BeautifulSoup(response.text, "html.parser")

        # Mencari elemen artikel (Struktur HTML Kompas bisa berubah sewaktu-waktu)
        article_list = soup.select(data.article_query)

        for article in article_list:
            title_tag = article.select_one(data.title_query)
            category_tag = article.select_one(data.category_query)
            link_tag = article.select_one(data.link_query)
            date_tag = article.select_one(data.date_query)
            img_tag = article.select_one(data.image_query)

            news_list.append(
                SuggestedNews(
                    title=(
                        title_tag.text.replace("\n", " ").strip()
                        if title_tag is not None
                        else ""
                    ),
                    prefix=data.prefix,
                    category=(
                        category_tag.text.replace("\n", " ").strip()
                        if category_tag is not None
                        else ""
                    ),  # Kategori default jika sulit di-scrape di halaman depan
                    date=(
                        date_tag.text.replace("\n", " ").strip()
                        if date_tag is not None
                        else ""
                    ),  # Menggunakan tanggal hari ini untuk simpelnya
                    image=img_tag.get("src") or img_tag.get("data-src"),
                    url=link_tag.get("href"),
                )
            )
    except Exception as e:
        print(f"Error scraping Kompas: {e}")

    return news_list


def scrape_news_from_source(url):
    prefix = tldextract.extract(url).domain + "." + tldextract.extract(url).suffix
    source = next((s for s in news_sources if s.prefix == prefix), None)
    if not source:
        print(f"No scraping rules defined for {prefix}")
        return None

    print(f"Scraping news from {prefix}...")
    print(f"Scraping news from {url}...")

    news = {}
    try:
        response = requests.get(url, headers=HEADERS, timeout=5)
        soup = BeautifulSoup(response.text, "html.parser")

        title_tag = soup.select_one(source.title_query)
        category_tag = soup.select_one(source.category_query)
        date_tag = soup.select_one(source.date_query)
        img_tag = soup.select_one(source.image_query)
        paragraph_tag = soup.select(source.paragraph_query)
        paragraph = []

        for p in paragraph_tag:
            if p.name == "p":
                p_text = p.get_text(strip=True)
                if p_text:
                    paragraph.append(p_text)

        news = News(
            url=url,
            title=(
                title_tag.text.replace("\n", " ").strip()
                if title_tag is not None
                else ""
            ),
            prefix=source.prefix,
            category=(
                category_tag.text.replace("\n", " ").strip()
                if category_tag is not None
                else ""
            ),
            date=(
                date_tag.text.replace("\n", " ").strip() if date_tag is not None else ""
            ),
            image=img_tag.get("src") or img_tag.get("data-src"),
            paragraph=(paragraph if paragraph else []),
        )

    except Exception as e:
        print(f"Error scraping {source.prefix}: {e}")

    return news


@app.route("/")
def index():
    return render_template("index.html", request=request)


@app.route("/api/get-selected-news-count")
def get_selected_news_count():
    return json.dumps({"count": len(selected_news)})


@app.route("/api/news")
def api_news():
    news = []

    for source in suggested_news_sources:
        news.extend(scrape_suggested_news(source))

    return json.dumps(
        [
            {
                "title": news.title,
                "prefix": news.prefix,
                "category": news.category,
                "date": news.date,
                "image": news.image,
                "url": news.url,
            }
            for news in news
        ]
    )


@app.route("/add-news", methods=["POST"])
def add_news():
    res = request.json

    data = scrape_news_from_source(res.get("url"))

    selected_news.append(data)  # Select news from the first source
    return "News added successfully"


@app.route("/api/get-selected-news")
def get_selected_news():
    return json.dumps([news.__dict__() for news in selected_news])


@app.route("/selected")
def selected():
    return render_template("selected.html", news=selected_news)


if __name__ == "__main__":
    app.run(debug=True)
