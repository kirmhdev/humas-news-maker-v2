let newsData = [] // Variable to store the fetched news data

const selectedNewsCounter = document.querySelector(".selected-news-counter")
const getSelectedNewsCount = () => {
  fetch("/get-selected-news-count")
    .then((response) => response.json())
    .then((data) => {
      selectedNewsCounter.textContent = data.count
    })
    .catch((error) => {
      console.error(
        "Terjadi kesalahan saat memuat jumlah berita yang dipilih:",
        error,
      )
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
    data.forEach((item, index) => {
      const card = `
            <div class="col">
              <div class="card h-100 news-card shadow-sm position-relative">
                <span class="badge bg-danger source-badge">${item.prefix}</span>
                <img src="${item.image}" class="card-img-top" alt="${item.title}" onclick="addNewsHandler(${index})" style="cursor: pointer;">
                <div class="card-body d-flex flex-column">
                  <span class="text-primary fw-bold" style="font-size: 0.8rem;">${item.category}</span>
                  <h5 class="card-title mt-2">${item.title}</h5>
                  <div class="mt-auto">
                    <small class="text-muted d-block mb-3">${item.date}</small>
                    <a href="${item.url}" class="btn btn-outline-dark btn-sm w-100" target="_blank">Baca Selengkapnya</a>
                  </div>
                </div>
              </div>
            </div>
          `
      document.querySelector(".row").innerHTML += card
      newsData.push(item) // Store the news item in the array
    })
  })
  .catch((error) => {
    console.error("Terjadi kesalahan saat memuat berita:", error)
  })

getSelectedNewsCount() // Call the function to update the selected news count on page load

function addNewsHandler(newsItem) {
  fetch("/add-news", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newsData[newsItem]),
  })
    .then((res) => {
      if (res.ok) {
        alert("Berita berhasil ditambahkan.")
        getSelectedNewsCount() // Update the selected news count after adding
      } else {
        alert("Gagal menambahkan berita.")
      }
    })
    .catch((error) => {
      console.error("Terjadi kesalahan saat menambahkan berita:", error)
      alert("Terjadi kesalahan saat menambahkan berita.")
    })
}
