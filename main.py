from flask import Flask, render_template, request
import json
from libs.scrape import scrape_news_from_source, scrape_suggested_news
from libs.types import GeneratedNews, SuggestedNewsSource, NewsSource
import threading
from libs.generate import generate_news

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
generated_news = []  # List untuk menyimpan berita yang dihasilkan
news_id_counter = 0  # Counter untuk memberikan ID unik pada berita


def generate_news_thread(data):
    generated_news_data = generate_news(data.body)

    news = GeneratedNews(
        id=data.id,
        title=generated_news_data.get("title", ""),
        category=data.category,
        paragraphs=generated_news_data.get("paragraphs", []),
        date=data.date,
        image=data.image,
        url=data.url,
        prefix=data.prefix,
    )

    generated_news.append(
        news.__dict__()
    )  # Simpan berita yang dihasilkan ke dalam list


@app.route("/")
def index():
    return render_template("index.html", request=request)


@app.route("/get-selected-news-count")
def get_selected_news_count():
    return json.dumps({"count": len(selected_news)})


@app.route("/get-suggested-news")
def api_news():
    news = scrape_suggested_news(suggested_news_sources, HEADERS)

    return json.dumps([news.__dict__() for news in news])


@app.route("/add-news", methods=["POST"])
def add_news():
    print(request)
    req = request.json

    global news_id_counter

    data = scrape_news_from_source(
        news_id_counter, req.get("url"), HEADERS, news_sources
    )

    news_id_counter += 1
    selected_news.append(data)  # Select news from the first source

    threading.Thread(
        target=generate_news_thread, args=(data,)
    ).start()  # Generate news in a separate thread

    return "News added successfully"


@app.route("/get-selected-news")
def get_selected_news():
    return json.dumps([news.__dict__() for news in selected_news])


@app.route("/selected")
def selected():
    return render_template("selected.html", news=selected_news)


@app.route("/get-generated-news")
def get_generated_news():
    requested_id = request.args.get("id")

    print(f"Requested ID: {requested_id}")  # Debugging line

    if requested_id is not None:
        news = None

        while (
            news is None
        ):  # Loop until the generated news with the requested ID is found
            news = next(
                (n for n in generated_news if n["id"] == int(requested_id)), None
            )

        return json.dumps(news or {})


@app.route("/save-news-data", methods=["POST"])
def save_news_data():
    news = request.form

    for n in generated_news:
        if n["id"] == int(news["id"]):
            n["title"] = news["title"]
            n["image"] = news["image"]
            n["paragraphs"] = news["body"].split("\n\n")

    return "News data saved"


if __name__ == "__main__":
    app.run(debug=True)
