from bs4 import BeautifulSoup
import requests
import tldextract

from libs.types import SelectedNews, SuggestedNews
from libs.generate import generate_news


def scrape_suggested_news(sources, headers):
    news_list = []
    try:
        for source in sources:
            url = source.url
            response = requests.get(url, headers=headers, timeout=5)
            soup = BeautifulSoup(response.text, "html.parser")

        # Mencari elemen artikel (Struktur HTML Kompas bisa berubah sewaktu-waktu)
        article_list = soup.select(source.article_query)

        for article in article_list:
            title_tag = article.select_one(source.title_query)
            category_tag = article.select_one(source.category_query)
            link_tag = article.select_one(source.link_query)
            date_tag = article.select_one(source.date_query)
            img_tag = article.select_one(source.image_query)

            news_list.append(
                SuggestedNews(
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


def scrape_news_from_source(id, url, headers, sources):
    prefix = tldextract.extract(url).domain + "." + tldextract.extract(url).suffix
    source = next((s for s in sources if s.prefix == prefix), None)
    if not source:
        print(f"No scraping rules defined for {prefix}")
        return None

    news = {}
    try:
        response = requests.get(url, headers=headers, timeout=5)
        soup = BeautifulSoup(response.text, "html.parser")

        title_tag = soup.select_one(source.title_query)
        category_tag = soup.select_one(source.category_query)
        date_tag = soup.select_one(source.date_query)
        img_tag = soup.select_one(source.image_query)
        paragraph_tag = soup.select(source.paragraph_query)
        body = ""

        for p in paragraph_tag:
            if p.name == "p":
                p_text = p.get_text(strip=True)
                if p_text and not p_text.lower().startswith("baca juga:"):
                    body += p_text + " "

        news = SelectedNews(
            id=id,
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
            body=body.strip(),
        )

    except Exception as e:
        print(f"Error scraping {source.prefix}: {e}")

    return news
