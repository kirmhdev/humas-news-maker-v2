import os, tldextract, requests
from io import BytesIO
from bs4 import BeautifulSoup
from html2image import Html2Image


def scrape_suggested_news(source, headers):
    news_list = []
    try:
        url = source["url"]
        response = requests.get(url, headers=headers, timeout=5)
        soup = BeautifulSoup(response.text, "html.parser")

        article_list = soup.select(source["articleQuery"])

        for article in article_list:
            title_tag = article.select_one(source["titleQuery"])

            if title_tag is not None:
                link_tag = (
                    article.select_one(source["linkQuery"])
                    if source["linkQuery"]
                    else None
                )
                date_tag = (
                    article.select_one(source["dateQuery"])
                    if source["dateQuery"]
                    else None
                )
                img_tag = (
                    article.select_one(source["imageQuery"])
                    if source["imageQuery"]
                    else None
                )

                news_list.append(
                    {
                        "title": (
                            title_tag.text.replace("\n", " ").strip()
                            if title_tag
                            else ""
                        ),
                        "prefix": source["prefix"],
                        "date": (
                            date_tag.text.replace("\n", " ").strip() if date_tag else ""
                        ),
                        "image": (
                            img_tag.get("src") or img_tag.get("data-src")
                            if img_tag
                            else article.get("i-img")
                        ),
                        "url": (
                            link_tag.get("href") if link_tag else article.get("href")
                        ),
                    }
                )
    except Exception as e:
        print(f"Error scraping news: {e}")

    return news_list


def scrape_news_from_source(id, url, headers, sources):
    prefix = tldextract.extract(url).domain + "." + tldextract.extract(url).suffix
    source = next((s for s in sources if s["prefix"] == prefix), None)
    if not source:
        return f"No scraping rules defined for {prefix}"

    news = {}
    try:
        response = requests.get(url, headers=headers, timeout=5)
        soup = BeautifulSoup(response.text, "html.parser")

        title_tag = soup.select_one(source["titleQuery"])
        date_tag = soup.select_one(source["dateQuery"])
        img_tag = soup.select_one(source["imageQuery"])
        paragraph_tag = soup.select(source["paragraphQuery"])
        body = ""

        for p in paragraph_tag:
            if p.name == "p":
                p_text = p.get_text(strip=True)
                if p_text and not p_text.lower().startswith("baca juga:"):
                    body += p_text + " "

        news = {
            "id": id,
            "url": url,
            "title": (
                title_tag.text.replace("\n", " ").strip()
                if title_tag is not None
                else ""
            ),
            "prefix": source["prefix"],
            "date": (
                date_tag.text.replace("\n", " ").strip() if date_tag is not None else ""
            ),
            "image": img_tag.get("src") or img_tag.get("data-src"),
            "body": body.strip(),
        }

    except Exception as e:
        print(f"Error scraping {source["prefix"]}: {e}")

    return news


def scrape_image_to_bytes(url, headers):
    res = requests.get(url=url, headers=headers)
    img_stream = BytesIO(res.content)
    return img_stream


def get_classements(source):
    response = requests.get(source["url"])
    element = BeautifulSoup(response.content, "html.parser")

    cache_dir = ".cache/"
    os.makedirs(cache_dir, exist_ok=True)

    hti = Html2Image()
    hti.output_path = cache_dir
    styles = "".join(
        map(lambda x: str(x), element.find_all("link", {"rel": "stylesheet"}))
    )
    table = element.find("div", {"class": source["tableQuery"]})
    final_table = f"{styles}{table}"

    hti.screenshot(
        html_str=final_table,
        size=(int(source["width"]), int(source["height"])),
    )
