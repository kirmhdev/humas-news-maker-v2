import re
from time import sleep
from groq import Groq
import os
import json

system_prompt = """Kamu adalah asisten AI yang ahli dalam membaca, menganalisis, dan membuat berita.
Tugasmu adalah membuat berita dari teks yang diberikan oleh pengguna ke dalam satu judul utama dan beberapa paragraf isi.

**ATURAN MUTLAK:**
1. Kamu WAJIB merespon HANYA menggunakan format JSON yang valid.
2. DILARANG KERAS menambahkan teks pembuka, penutup, basa-basi, atau penjelasan apa pun di luar JSON.
3. DILARANG menggunakan format markdown code block (seperti `json ... `). Langsung berikan JSON mentahnya saja.
4. Gunakan struktur JSON berikut ini:

{
  "title": "Tulis judul berita yang menarik di sini",
  "paragraphs": [
    "Tulis paragraf berita pertama di sini...",
    "Tulis paragraf berita kedua di sini...",
    ...
  ]
}"""


def clean_text(text):
    text = re.sub(r"http\S+|www\.\S+", "", text)
    text = re.sub(r"<.*?>", " ", text)
    text = re.sub(r"[^\w\s\.,!?\-]", " ", text)
    text = re.sub(r"\s+", " ", text)
    text = text.strip()

    return text


def generate_news(text, model, apiKey):
    client = Groq(api_key=apiKey)
    cleaned_text = clean_text(text)
    while True:
        try:
            response = client.chat.completions.create(
                model=model,
                messages=[
                    {
                        "role": "system",
                        "content": system_prompt,
                    },
                    {
                        "role": "user",
                        "content": f"Ini adalah teks panjang yang ingin dibuat menjadi berita: {cleaned_text}",
                    },
                ],
                temperature=0.5,
                response_format={
                    "type": "json_schema",
                    "json_schema": {
                        "name": "berita",
                        "schema": {
                            "type": "object",
                            "strict": True,
                            "properties": {
                                "title": {
                                    "type": "string",
                                    "description": "Judul berita",
                                },
                                "paragraphs": {
                                    "type": "array",
                                    "items": {
                                        "type": "string",
                                        "description": "Paragraf berita",
                                    },
                                },
                            },
                            "required": ["title", "paragraphs"],
                            "additionalProperties": False,
                        },
                    },
                },
            )

            break
        except:
            print("AI limit reached")
            sleep(5)

    return json.loads(response.choices[0].message.content)
