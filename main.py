import json, threading, os, queue
from time import sleep
from flask import Flask, render_template, request
from core.scrape import scrape_news_from_source, scrape_suggested_news
from core.generate import generate_news
from core.document import create_document, save_news_to_json

app = Flask(__name__)

settings = {}
settings_path = "instance/settings.json"
suggested_news_sources = []
news_sources = []

selected_news = []
generated_news = []
news_id_counter = 0
news_queue = queue.Queue()


def init_data():
    global settings
    global suggested_news_sources
    global news_sources

    if not os.path.exists(settings_path):
        reset_settings()

    with open(settings_path, mode="r") as file:
        settings = json.load(file)

    suggested_news_sources = settings["suggestedNewsSources"]
    news_sources = settings["newsSources"]


def generate_news_worker(data):
    if data == None:
        return

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

    generated_news.append(news)


def scrape_news_worker(thread_queue, delay):
    while True:
        news_url = thread_queue.get("url")

        for news in selected_news:
            if news["url"] == news_url:
                return {"msg": "News already exist"}

        global news_id_counter

        data = scrape_news_from_source(
            news_id_counter, news_url, settings["headers"], news_sources
        )

        if str(data).startswith("No scraping rules"):
            return {"msg": data}

        news_id_counter += 1
        selected_news.append(data)

        threading.Thread(target=generate_news_worker, args=(data,)).start()

        sleep(delay)
        thread_queue.task_done()


@app.route("/")
def index_page():
    return render_template("index.html", request=request)


@app.route("/selected")
def selected_page():
    return render_template("selected.html", news=selected_news)


@app.route("/settings")
def settings_page():
    return render_template("settings.html")


@app.route("/api/get-suggested-news-categories")
def get_suggested_news_categories():
    return settings["suggestedNewsCategory"]


@app.route("/api/get-suggested-news")
def get_suggested_news():
    category = request.args.get("category")

    news = scrape_suggested_news(
        sources=suggested_news_sources, headers=settings["headers"], category=category
    )

    return json.dumps(news)


@app.route("/api/add-news", methods=["POST"])
def add_news():
    req = request.json
    news_url = req.get("url")

    news_queue.put(news_url)

    news = None

    cur_id = news_id_counter

    while news is None:
        news = next((n for n in generated_news if n["id"] == cur_id), None)

    return {"msg": "News has been added"}


@app.route("/api/regenerate-news", methods=["POST"])
def regenerate_news():
    id = request.json.get("id")

    global generated_news

    generated_news = list(filter(lambda x: x["id"] != id, generated_news))

    data = next((item for item in selected_news if item["id"] == id), None)

    threading.Thread(target=generate_news_worker, args=(data,)).start()

    return "Regenerate data success"


@app.route("/api/get-selected-news")
def get_selected_news():
    return json.dumps(selected_news)


@app.route("/api/get-generated-news")
def get_generated_news():
    requested_id = request.args.get("id")

    if requested_id is not None:
        news = None

        while news is None:
            news = next(
                (n for n in generated_news if n["id"] == int(requested_id)), None
            )

        return json.dumps(news)


@app.route("/api/save-news-data", methods=["POST"])
def save_news_data():
    news = request.form

    for n in generated_news:
        if n["id"] == int(news["id"]):
            n["title"] = news["title"]
            n["image"] = news["image"]
            n["paragraphs"] = news["body"].split("\n\n")

    return "News data saved successfuly"


@app.route("/api/save-news", methods=["POST"])
def save_news():
    data = {"selectedNews": selected_news, "generatedNews": generated_news}

    save_news_to_json(data, "OUT")

    return "News saved successfuly"


@app.route("/api/load-news", methods=["POST"])
def load_news():
    data = request.json

    global selected_news
    global generated_news

    try:
        selected_news = data["selectedNews"]
        generated_news = data["generatedNews"]

        return "News loaded successfuly"
    except:
        return "Error when loading news"


@app.route("/api/delete-news", methods=["DELETE"])
def delete_news():
    req = request.json
    news_id = int(req.get("id"))

    global selected_news
    global generated_news

    selected_news = list(filter(lambda item: item["id"] != news_id, selected_news))
    generated_news = list(filter(lambda item: item["id"] != news_id, generated_news))

    return "News deleted"


@app.route("/api/clear-news", methods=["DELETE"])
def clear_news():
    global selected_news
    global generated_news

    selected_news = []
    generated_news = []

    return "All news cleared"


@app.route("/api/generate-document", methods=["POST"])
def generate_document():
    document_format = settings["documentFormat"]

    while len(generated_news) != len(selected_news):
        sleep(0.1)

    save_news()

    create_document(
        generated_news,
        document_format,
        settings["headers"],
        "OUT",
        settings["classementSources"],
    )

    return "Document created"


@app.route("/api/get-settings")
def get_settings():
    return json.dumps(settings)


@app.route("/api/set-settings", methods=["POST"])
def set_settings():
    req = request.json
    data = json.dumps(req, indent=2)

    try:
        with open(settings_path, "w") as file:
            file.write(data)
        init_data()
        return "Set settings success"
    except:
        print("Failed")
        return "Set settings failed"


@app.route("/api/reset-settings", methods=["POST"])
def reset_settings():
    default_file = os.path.join("config", "default.json")
    user_file = os.path.join("instance", "settings.json")

    try:
        with open(default_file, "r") as file:
            data_default = json.load(file)

        with open(user_file, "w") as file:
            json.dump(data_default, file, indent=4)

        init_data()

        return "Reset success"
    except Exception as e:
        print(e)
        return "Reset failed"


init_data()

if __name__ == "__main__":
    news_thread = threading.Thread(target=scrape_news_worker, args=(news_queue, 1))
    news_thread.daemon = True
    news_thread.start()
    app.run(debug=True)
