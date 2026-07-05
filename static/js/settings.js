var categories = []

function renderCategories() {
  const container = document.getElementById("categoryTagsContainer")
  container.innerHTML = ""
  categories.forEach((cat, index) => {
    const tag = document.createElement("div")
    tag.className = "tag"
    tag.innerHTML = `${cat} <button type="button" onclick="removeCategoryTag(${index})">&times;</button>`
    container.appendChild(tag)
  })
}

function addCategoryTag() {
  const input = document.getElementById("newCategoryInput")
  const val = input.value.trim()
  if (val && !categories.includes(val)) {
    categories.push(val)
    renderCategories()
    input.value = ""
  }
}

function removeCategoryTag(index) {
  categories.splice(index, 1)
  renderCategories()
}

function addSuggestedSourceElement(data = {}) {
  const container = document.getElementById("suggestedSourcesContainer")
  const div = document.createElement("div")
  div.className = "dynamic-item suggested-source-item"
  div.innerHTML = `
            <button type="button" class="btn btn-danger remove-btn" onclick="this.parentElement.remove()">Hapus</button>
            <div class="form-row">
                <div class="form-group">
                    <label>Prefix / Domain</label>
                    <input type="text" class="src-prefix" value="${data.prefix || ""}" placeholder="example.xyz">
                </div>
                <div class="form-group">
                    <label>Base URL</label>
                    <input type="text" class="src-url" value="${data.url || ""}" placeholder="https://example.url/...">
                </div>
                <div class="form-group">
                    <label>Kategori</label>
                    <input type="text" class="src-category" value="${data.category || ""}" placeholder="Kategori...">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Article Query (Wrapper)</label>
                    <input type="text" class="src-article-query" value="${data.articleQuery || ""}" placeholder="element.class#id">
                </div>
                <div class="form-group">
                    <label>Title Query</label>
                    <input type="text" class="src-title-query" value="${data.titleQuery || ""}" placeholder="element.class#id">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Category Query</label>
                    <input type="text" class="src-category-query" value="${data.categoryQuery || ""}" placeholder="element.class#id">
                </div>
                <div class="form-group">
                    <label>Link Query</label>
                    <input type="text" class="src-link-query" value="${data.linkQuery || ""}" placeholder="element.class#id">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Date Query</label>
                    <input type="text" class="src-date-query" value="${data.dateQuery || ""}" placeholder="element.class#id">
                </div>
                <div class="form-group">
                    <label>Image Query</label>
                    <input type="text" class="src-image-query" value="${data.imageQuery || ""}" placeholder="element.class#id">
                </div>
            </div>
        `
  container.appendChild(div)
}

function addNewsSourceElement(data = {}) {
  const container = document.getElementById("newsSourcesContainer")
  const div = document.createElement("div")
  div.className = "dynamic-item news-source-item"
  div.innerHTML = `
            <button type="button" class="btn btn-danger remove-btn" onclick="this.parentElement.remove()">Hapus</button>
            <div class="form-row">
                <div class="form-group">
                    <label>Prefix / Domain</label>
                    <input type="text" class="ns-prefix" value="${data.prefix || ""}" placeholder="example.xyz">
                </div>
                <div class="form-group">
                    <label>Title Query (Detail)</label>
                    <input type="text" class="ns-title-query" value="${data.titleQuery || ""}" placeholder="element.class#id">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Paragraph Query</label>
                    <input type="text" class="ns-paragraph-query" value="${data.paragraphQuery || ""}" placeholder="element.class#id">
                </div>
                <div class="form-group">
                    <label>Category Query</label>
                    <input type="text" class="ns-category-query" value="${data.categoryQuery || ""}" placeholder="element.class#id">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Date Query</label>
                    <input type="text" class="ns-date-query" value="${data.dateQuery || ""}" placeholder="element.class#id">
                </div>
                <div class="form-group">
                    <label>Image Query</label>
                    <input type="text" class="ns-image-query" value="${data.imageQuery || ""}" placeholder="element.class#id">
                </div>
            </div>
        `
  container.appendChild(div)
}

function addClassementSourceElement(data = { width: 1, height: 1 }) {
  const container = document.getElementById("classementSourcesContainer")
  const div = document.createElement("div")
  div.className = "dynamic-item classement-source-item"
  div.innerHTML = `
            <button type="button" class="btn btn-danger remove-btn" onclick="this.parentElement.remove()">Hapus</button>
            <div class="form-row">
                <div class="form-group">
                    <label>URL</label>
                    <input type="text" class="ns-url" value="${data.url || ""}" placeholder="https://example.xyz/...">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Table Query</label>
                    <input type="text" class="ns-table-query" value="${data.tableQuery || ""}" placeholder="element.class#id">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Width</label>
                    <input type="number" class="ns-width" value="${data.width || ""}" min="1">
                </div>
                <div class="form-group">
                    <label>Height</label>
                    <input type="number" class="ns-height" value="${data.height || ""}" min="1">
                </div>
            </div>
        `
  container.appendChild(div)
}

function initFormValues(initialSettings) {
  categories = [...initialSettings.suggestedNewsCategory]

  renderCategories()

  initialSettings.suggestedNewsSources.forEach((src) =>
    addSuggestedSourceElement(src),
  )

  initialSettings.newsSources.forEach((src) => addNewsSourceElement(src))
  initialSettings.classementSources.forEach((src) =>
    addClassementSourceElement(src),
  )

  document.getElementById("groqModel").value = initialSettings.groqModel
  document.getElementById("groqAPIKey").value = initialSettings.groqAPIKey
  document.getElementById("groqSystemPrompt").value =
    initialSettings.groqSystemPrompt || ""
  document.getElementById("userAgent").value =
    initialSettings.headers["User-Agent"]

  const docFmt = initialSettings.documentFormat
  document.getElementById("titleFont").value = docFmt.titleFont
  document.getElementById("titleSize").value = docFmt.titleSize
  document.getElementById("titleBold").checked = docFmt.titleBold
  document.getElementById("paragraphFont").value = docFmt.paragraphFont
  document.getElementById("paragraphSize").value = docFmt.paragraphSize
  document.getElementById("imageHeight").value = docFmt.imageHeight
  document.getElementById("pageWidth").value = docFmt.pageWidth
  document.getElementById("pageHeight").value = docFmt.pageHeight
  document.getElementById("pageMtop").value = docFmt.pageMtop
  document.getElementById("pageMbot").value = docFmt.pageMbot
  document.getElementById("pageMlef").value = docFmt.pageMlef
  document.getElementById("pageMrig").value = docFmt.pageMrig
}

document
  .getElementById("settingsForm")
  .addEventListener("submit", function (e) {
    e.preventDefault()

    const suggestedNewsSources = []
    document.querySelectorAll(".suggested-source-item").forEach((item) => {
      suggestedNewsSources.push({
        prefix: item.querySelector(".src-prefix").value,
        url: item.querySelector(".src-url").value,
        category: item.querySelector(".src-category").value,
        articleQuery: item.querySelector(".src-article-query").value,
        titleQuery: item.querySelector(".src-title-query").value,
        categoryQuery: item.querySelector(".src-category-query").value,
        linkQuery: item.querySelector(".src-link-query").value,
        dateQuery: item.querySelector(".src-date-query").value,
        imageQuery: item.querySelector(".src-image-query").value,
      })
    })

    const newsSources = []
    document.querySelectorAll(".news-source-item").forEach((item) => {
      newsSources.push({
        prefix: item.querySelector(".ns-prefix").value,
        titleQuery: item.querySelector(".ns-title-query").value,
        paragraphQuery: item.querySelector(".ns-paragraph-query").value,
        categoryQuery: item.querySelector(".ns-category-query").value,
        dateQuery: item.querySelector(".ns-date-query").value,
        imageQuery: item.querySelector(".ns-image-query").value,
      })
    })

    const classementSources = []
    document.querySelectorAll(".classement-source-item").forEach((item) => {
      classementSources.push({
        url: item.querySelector(".ns-url").value,
        tableQuery: item.querySelector(".ns-table-query").value,
        width: item.querySelector(".ns-width").value,
        height: item.querySelector(".ns-height").value,
      })
    })

    const updatedSettings = {
      suggestedNewsCategory: categories,
      suggestedNewsSources: suggestedNewsSources,
      newsSources: newsSources,
      classementSources: classementSources,
      groqModel: document.getElementById("groqModel").value,
      groqAPIKey: document.getElementById("groqAPIKey").value,
      groqSystemPrompt: document.getElementById("groqSystemPrompt").value,
      headers: {
        "User-Agent": document.getElementById("userAgent").value,
      },
      documentFormat: {
        titleFont: document.getElementById("titleFont").value,
        titleSize: parseInt(document.getElementById("titleSize").value) || 0,
        titleBold: document.getElementById("titleBold").checked,
        imageHeight:
          parseFloat(document.getElementById("imageHeight").value) || 0,
        paragraphFont: document.getElementById("paragraphFont").value,
        paragraphSize:
          parseInt(document.getElementById("paragraphSize").value) || 0,
        pageWidth: parseFloat(document.getElementById("pageWidth").value) || 0,
        pageHeight:
          parseFloat(document.getElementById("pageHeight").value) || 0,
        pageMtop: parseFloat(document.getElementById("pageMtop").value) || 0,
        pageMbot: parseFloat(document.getElementById("pageMbot").value) || 0,
        pageMlef: parseFloat(document.getElementById("pageMlef").value) || 0,
        pageMrig: parseFloat(document.getElementById("pageMrig").value) || 0,
      },
    }

    console.log("Payload yang dikirim:", updatedSettings)

    fetch("/set-settings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedSettings),
    })
      .then((response) => {
        if (response.ok) {
          alert("Pengaturan berhasil disimpan!")
        } else {
          alert("Gagal menyimpan pengaturan, periksa server Anda.")
        }
      })
      .catch((err) => {
        console.error("Error:", err)
        alert("Terjadi kesalahan jaringan.")
      })
  })

fetch("/get-settings", {
  headers: {
    "Content-Type": "application/json",
  },
})
  .then((res) => res.json())
  .then((data) => {
    console.log(data)
    initFormValues(data)
  })
