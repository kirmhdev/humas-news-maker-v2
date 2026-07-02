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


class SelectedNews:
    def __init__(self, id, title, prefix, category, date, image, url, body):
        self.id = id
        self.title = title
        self.prefix = prefix
        self.category = category
        self.date = date
        self.image = image
        self.body = body
        self.url = url

    def __dict__(self):
        return {
            "id": self.id,
            "title": self.title,
            "prefix": self.prefix,
            "category": self.category,
            "date": self.date,
            "image": self.image,
            "body": self.body,
            "url": self.url,
        }


class GeneratedNews:
    def __init__(self, id, title, prefix, category, date, image, url, paragraphs):
        self.id = id
        self.title = title
        self.prefix = prefix
        self.category = category
        self.date = date
        self.image = image
        self.paragraphs = paragraphs
        self.url = url

    def __dict__(self):
        return {
            "id": self.id,
            "title": self.title,
            "prefix": self.prefix,
            "category": self.category,
            "date": self.date,
            "image": self.image,
            "paragraphs": self.paragraphs,
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

    def __dict__(self):
        return {
            "title": self.title,
            "prefix": self.prefix,
            "category": self.category,
            "date": self.date,
            "image": self.image,
            "url": self.url,
        }
