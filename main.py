import json
import threading
from time import sleep
from flask import Flask, render_template, request
from libs.scrape import scrape_news_from_source, scrape_suggested_news
from libs.generate import generate_news
from libs.document import create_document

app = Flask(__name__)

settings = {}
suggested_news_sources = []
news_sources = []

selected_news = []  # List untuk menyimpan berita yang dipilih
generated_news = []  # List untuk menyimpan berita yang dihasilkan
news_id_counter = 0  # Counter untuk memberikan ID unik pada berita


def init_data():
    global settings
    global suggested_news_sources
    global news_sources

    with open("settings.json", mode="r") as file:
        settings = json.load(file)

    suggested_news_sources = settings["suggestedNewsSources"]
    news_sources = settings["newsSources"]


def generate_news_thread(data):
    generated_news_data = generate_news(data["body"], settings["groqModel"])

    news = {
        "id": data["id"],
        "title": generated_news_data.get("title", ""),
        "category": data["category"],
        "paragraphs": generated_news_data.get("paragraphs", []),
        "date": data["date"],
        "image": data["image"],
        "url": data["url"],
        "prefix": data["prefix"],
    }

    generated_news.append(news)  # Simpan berita yang dihasilkan ke dalam list


@app.route("/")
def index_page():
    return render_template("index.html", request=request)


@app.route("/get-suggested-news-categories")
def get_suggested_news_categories():
    return settings["suggestedNewsCategory"]


@app.route("/get-suggested-news")
def get_suggested_news():
    category = request.args.get("category")

    news = scrape_suggested_news(
        sources=suggested_news_sources, headers=settings["headers"], category=category
    )

    return json.dumps(news)


@app.route("/add-news", methods=["POST"])
def add_news():
    req = request.json
    news_url = req.get("url")

    for news in selected_news:
        if news["url"] == news_url:
            return {"msg": "News already exist"}

    global news_id_counter

    data = None

    while data == None:
        data = scrape_news_from_source(
            news_id_counter, news_url, settings["headers"], news_sources
        )

    if str(data).startswith("No scraping rules"):
        return {"msg": data}

    news_id_counter += 1
    selected_news.append(data)  # Select news from the first source

    threading.Thread(
        target=generate_news_thread, args=(data,)
    ).start()  # Generate news in a separate thread

    return {"msg": "News has been added"}


@app.route("/get-selected-news")
def get_selected_news():
    return json.dumps(selected_news)


@app.route("/selected")
def selected_page():
    return render_template("selected.html", news=selected_news)


@app.route("/get-generated-news")
def get_generated_news():
    requested_id = request.args.get("id")

    if requested_id is not None:
        news = None

        while (
            news is None
        ):  # Loop until the generated news with the requested ID is found
            news = next(
                (n for n in generated_news if n["id"] == int(requested_id)), None
            )

        return json.dumps(news)


@app.route("/save-news-data", methods=["POST"])
def save_news_data():
    news = request.form

    for n in generated_news:
        if n["id"] == int(news["id"]):
            n["title"] = news["title"]
            n["image"] = news["image"]
            n["paragraphs"] = news["body"].split("\n\n")

    return "News data saved successfuly"


@app.route("/delete-news", methods=["DELETE"])
def delete_news():
    req = request.json
    news_id = int(req.get("id"))

    global selected_news
    global generated_news

    selected_news = list(filter(lambda item: item.id != news_id, selected_news))
    generated_news = list(filter(lambda item: item.id != news_id, generated_news))

    return "News deleted"


@app.route("/generate-document", methods=["POST"])
def generate_document():
    document_format = settings["documentFormat"]

    while len(generated_news) != len(selected_news):
        sleep(0.1)

    create_document(generated_news, document_format, settings["headers"])

    return "Document created"


@app.route("/settings")
def settings_page():
    return render_template("settings.html")


@app.route("/get-settings")
def get_settings():
    return json.dumps(settings)


@app.route("/set-settings", methods=["POST"])
def set_settings():
    req = request.json
    data = json.dumps(req, indent=2)

    try:
        with open("settings.json", "w") as file:
            file.write(data)
        print("Success")
        init_data()
        return "Set settings success"
    except:
        print("Failed")
        return "Set settings failed"


init_data()

if __name__ == "__main__":
    app.run(debug=True)
