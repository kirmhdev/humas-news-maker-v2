const urlInputForm = document.querySelector("#url-input-form")
const urlInput = document.querySelector("#url-input")
const urlInputSubmit = document.querySelector("#url-input-submit")
const btnClear = document.querySelector("#btn-clear")
const btnSave = document.querySelector("#btn-save")
const btnGenerate = document.querySelector("#btn-generate")
const jsonInput = document.querySelector("#json-input")

const Card = (news, id) => {
  return `
            <div id="popover-${id}" popover>
              <h3 style="margin-top: 0">Edit</h3>

              <form id="form-${id}" class="popover-form">
                <input type="hidden" id="id-${id}" name="id" />

                <div>
                  <label>Judul:</label><br />
                  <input
                    type="text"
                    id="title-${id}"
                    name="title"
                    class="form-control"
                    placeholder="Masukkan judul..."
                    required
                  />
                </div>

                <div>
                  <label>URL Gambar:</label><br />
                  <input
                    type="url"
                    id="image-${id}"
                    name="image"
                    class="form-control"
                    placeholder="https://..."
                    required
                  />
                </div>

                <div>
                  <label>Isi</label><br />
                  <textarea id="body-${id}" name="body" class="body-input"></textarea>
                </div>

                <button type="submit" class="save-btn" id="save-btn-${id}">Simpan</button>
              </form>
            </div>
            <div id="card-${id}" class="card-horizontal-pending">
              <div class="left-section">
                <img src="${news.image}" alt="Gambar Berita" class="card-image">
                <div class="card-body">
                  <span class="card-category">${news.category}</span>
                  <h3 id="card-title-${id}" class="card-title">${news.title}</h3>
                </div>
              </div>
              <div class="right-section">
                <button popovertarget="popover-${id}" class="action-btn" id="edit-btn-${id}" disabled><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#3498db"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h357l-80 80H200v560h560v-278l80-80v358q0 33-23.5 56.5T760-120H200Zm280-360ZM360-360v-170l367-367q12-12 27-18t30-6q16 0 30.5 6t26.5 18l56 57q11 12 17 26.5t6 29.5q0 15-5.5 29.5T897-728L530-360H360Z"/></svg></button>
                <button class="action-btn" id="delete-btn-${id}" disabled><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e74c3c"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg></button>
              </div>
            </div>
          `
}

const news = []

const getGeneratedNews = (id) => {
  fetch("/get-generated-news?id=" + id, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      const card = document.querySelector(`#card-${id}`)
      const titleElement = document.querySelector(`#card-title-${id}`)
      const editBtn = document.querySelector(`#edit-btn-${id}`)
      const deleteBtn = document.querySelector(`#delete-btn-${id}`)

      const popover = document.querySelector(`#popover-${id}`)
      const form = document.querySelector(`#form-${id}`)
      const idInput = document.querySelector(`#id-${id}`)
      const titleInput = document.querySelector(`#title-${id}`)
      const imageInput = document.querySelector(`#image-${id}`)
      const bodyInput = document.querySelector(`#body-${id}`)
      const saveBtn = document.querySelector(`#save-btn-${id}`)

      card.className = "card-horizontal" // Mengubah kelas menjadi card-horizontal
      titleElement.textContent = data.title // Mengubah judul berita
      editBtn.disabled = false // Mengaktifkan tombol edit
      deleteBtn.disabled = false

      idInput.value = id
      titleInput.value = data.title
      imageInput.value = data.image
      bodyInput.innerHTML = data.paragraphs.join("\n\n")

      deleteBtn.addEventListener("click", (e) => {
        e.preventDefault()

        if (confirm(`Hapus ${data.title}?`))
          fetch(`/delete-news`, {
            method: "DELETE",
            body: JSON.stringify({ id }),
            headers: {
              "Content-Type": "application/json",
            },
          })
            .then(() => console.log(`Berita ${data.title} telah dihapus`))
            .catch(() => alert("Hapus berita gagal"))
      })

      popover.addEventListener("toggle", (e) => {
        if (e.newState == "closed") getGeneratedNews(id)
      })

      form.addEventListener("submit", (e) => {
        e.preventDefault()

        saveBtn.disabled = true
        saveBtn.innerHTML = "Menyimpan..."

        const formData = new FormData(form)

        fetch("/save-news-data", {
          method: "POST",
          body: formData,
        }).then((res) => {
          saveBtn.disabled = false
          saveBtn.innerHTML = "Simpan"
          popover.hidePopover()
        })
      })
    })
    .catch((error) => {
      console.error(
        "Terjadi kesalahan saat memuat berita yang dihasilkan:",
        error,
      )
    })
}

const updateData = () => {
  fetch("/get-selected-news")
    .then((response) => response.json())
    .then((data) => {
      const newsListContainer = document.querySelector(".news-list")
      if (data.length === 0) {
        newsListContainer.innerHTML = "Tidak ada berita yang dipilih."
        return
      }

      newsListContainer.innerHTML = "" // Kosongkan kontainer sebelum menambahkan berita

      data.forEach((news) => {
        getGeneratedNews(news.id) // Memanggil fungsi untuk mendapatkan berita yang dihasilkan
        const card = Card(news, news.id)
        newsListContainer.innerHTML += card
      })

      news.push(...data) // Menyimpan data berita ke dalam array news
    })
    .catch((error) => {
      console.error("Terjadi kesalahan saat memuat berita yang dipilih:", error)
    })
}

urlInputForm.addEventListener("submit", (e) => {
  e.preventDefault()

  urlInputSubmit.disabled = true

  const formData = new FormData(urlInputForm)

  let object = {}

  formData.forEach((val, key) => (object[key] = val))

  fetch("/add-news", {
    method: "POST",
    body: JSON.stringify(object),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.json())
    .then((res) => {
      urlInput.value = ""
      urlInputSubmit.disabled = false
      if (res.msg.startsWith("No scraping rules"))
        return alert("Sumber ini tidak terdaftar")
      if (res.msg == "News already exist")
        return alert("Berita sudah ditambahkan")
      updateData()
    })
})

btnClear.addEventListener("click", (e) => {
  e.preventDefault()

  if (confirm("Hapus semua berita?"))
    fetch("/clear-news", {
      method: "DELETE",
    })
      .then((res) => {
        updateData()
      })
      .catch((e) => {
        console.log(e)
        alert(`Menghapus berita gagal`)
      })
})

btnSave.addEventListener("click", (e) => {
  e.preventDefault()

  if (confirm("Simpan berita?"))
    fetch("/save-news", {
      method: "POST",
    })
      .then((res) => {
        alert("Menyimpan berita berhasil")
      })
      .catch((e) => {
        console.log(e)
        alert(`Menyimpan berita gagal`)
      })
})

btnGenerate.addEventListener("click", (e) => {
  e.preventDefault()

  fetch("/generate-document", {
    method: "POST",
  })
    .then(() => {
      alert("Berita berhasil dibuat")
    })
    .catch((e) => {
      alert("Berita gagal dibuat")
    })
})

jsonInput.addEventListener("change", async (e) => {
  e.preventDefault()

  const reader = new FileReader()

  reader.onload = function (event) {
    var jsonObj = JSON.parse(event.target.result)
    fetch("/load-news", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(jsonObj),
    })
      .then((res) => {
        updateData()
      })
      .catch((e) => console.log(`News can't be loaded: ${e}`))
  }

  reader.readAsText(event.target.files[0])
})

updateData() // Memanggil fungsi untuk memuat berita yang dipilih saat halaman dimuat
