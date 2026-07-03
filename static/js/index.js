let newsData = [] // Variable to store the fetched news data

const Card = (news) => `
            <div class="col">
              <div class="card h-100 news-card shadow-sm position-relative">
                <span class="badge bg-danger source-badge">${news.prefix}</span>
                <img src="${news.image}" id="${news.url}" class="card-img-top card-image" alt="${news.title}" onclick="addNewsHandler('${news.url}')">
                <div class="card-body d-flex flex-column">
                  <span class="text-primary fw-bold" style="font-size: 0.8rem;">${news.category}</span>
                  <h5 class="card-title mt-2">${news.title}</h5>
                  <div class="mt-auto">
                    <small class="text-muted d-block mb-3">${news.date}</small>
                    <a href="${news.url}" class="btn btn-outline-dark btn-sm w-100" target="_blank">Baca Selengkapnya</a>
                  </div>
                </div>
                </div>
                </div>
                `

const selectedNewsCounter = document.querySelector(".selected-news-counter")
const getSelectedNews = () => {
  fetch("/get-selected-news")
    .then((response) => response.json())
    .then((data) => {
      data.forEach((val, i) => {
        const cardImage = document.getElementById(val.url)
        if (cardImage) {
          cardImage.className = "card-image-selected"
          cardImage.onclick = () => {}
        }
      })

      selectedNewsCounter.textContent = data.length
    })
    .catch((error) => {
      console.error(
        "Terjadi kesalahan saat memuat jumlah berita yang dipilih:",
        error,
      )
    })
}

function addNewsHandler(newsUrl) {
  fetch("/add-news", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url: newsUrl }),
  })
    .then((res) => {
      if (res.ok) {
        alert("Berita berhasil ditambahkan.")
        getSelectedNews() // Update the selected news count after adding
      } else {
        alert("Gagal menambahkan berita.")
      }
    })
    .catch((error) => {
      console.error("Terjadi kesalahan saat menambahkan berita:", error)
      alert("Terjadi kesalahan saat menambahkan berita.")
    })
}

// Load news
fetch("/get-suggested-news")
  .then((response) => response.json())
  .then((data) => {
    if (!data || data.length === 0) {
      document.querySelector(".row").innerHTML =
        '<p class="text-center">Tidak ada berita yang tersedia.</p>'
      return
    }
    data.forEach((item) => {
      const card = Card(item)
      document.querySelector(".row").innerHTML += card
      newsData.push(item) // Store the news item in the array
    })
  })
  .catch((error) => {
    console.error("Terjadi kesalahan saat memuat berita:", error)
  })
  .finally(() => {
    getSelectedNews() // Call the function to update the selected news count on page load
  })
