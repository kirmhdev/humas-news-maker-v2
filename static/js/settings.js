const settingsForm = document.getElementById("settings-form")
const resetBtn = document.getElementById("reset-btn")

var categories = []

const initData = () => {
  fetch("/api/get-settings", {
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data)
      initFormValues(data)
    })
}

const renderCategories = () => {
  const container = document.getElementById("category-tags-container")
  container.innerHTML = ""
  categories.forEach((cat, index) => {
    const tag = document.createElement("div")
    tag.className = "tag"
    tag.innerHTML = `${cat} <button type="button" onclick="removeCategoryTag(${index})">&times;</button>`
    container.appendChild(tag)
  })
}

const addCategoryTag = () => {
  const input = document.getElementById("new-category-input")
  const val = input.value.trim()
  if (val && !categories.includes(val)) {
    categories.push(val)
    renderCategories()
    input.value = ""
  }
}

const removeCategoryTag = (index) => {
  categories.splice(index, 1)
  renderCategories()
}

const addSuggestedSourceElement = (data = {}) => {
  const container = document.getElementById("suggested-sources-container")
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

const addNewsSourceElement = (data = {}) => {
  const container = document.getElementById("news-sources-container")
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

const addClassementSourceElement = (data = { width: 1, height: 1 }) => {
  const container = document.getElementById("classement-sources-container")
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

const initFormValues = (initialSettings) => {
  categories = [...initialSettings.suggestedNewsCategory]

  renderCategories()

  initialSettings.suggestedNewsSources.forEach((src) =>
    addSuggestedSourceElement(src),
  )

  initialSettings.newsSources.forEach((src) => addNewsSourceElement(src))
  initialSettings.classementSources.forEach((src) =>
    addClassementSourceElement(src),
  )

  document.getElementById("groq-model").value = initialSettings.groqModel
  document.getElementById("groq-api-key").value = initialSettings.groqAPIKey
  document.getElementById("groq-system-prompt").value =
    initialSettings.groqSystemPrompt || ""
  document.getElementById("user-agent").value =
    initialSettings.headers["User-Agent"]

  const docFmt = initialSettings.documentFormat
  document.getElementById("title-font").value = docFmt.titleFont
  document.getElementById("title-size").value = docFmt.titleSize
  document.getElementById("title-bold").checked = docFmt.titleBold
  document.getElementById("paragraph-font").value = docFmt.paragraphFont
  document.getElementById("paragraph-size").value = docFmt.paragraphSize
  document.getElementById("image-height").value = docFmt.imageHeight
  document.getElementById("page-width").value = docFmt.pageWidth
  document.getElementById("page-height").value = docFmt.pageHeight
  document.getElementById("page-mtop").value = docFmt.pageMtop
  document.getElementById("page-mbot").value = docFmt.pageMbot
  document.getElementById("page-mlef").value = docFmt.pageMlef
  document.getElementById("page-mrig").value = docFmt.pageMrig
}

settingsForm.addEventListener("submit", function (e) {
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
    groqModel: document.getElementById("groq-model").value,
    groqAPIKey: document.getElementById("groq-api-key").value,
    groqSystemPrompt: document.getElementById("groq-system-prompt").value,
    headers: {
      "User-Agent": document.getElementById("user-agent").value,
    },
    documentFormat: {
      titleFont: document.getElementById("title-font").value,
      titleSize: parseInt(document.getElementById("title-size").value) || 0,
      titleBold: document.getElementById("title-bold").checked,
      imageHeight:
        parseFloat(document.getElementById("image-height").value) || 0,
      paragraphFont: document.getElementById("paragraph-font").value,
      paragraphSize:
        parseInt(document.getElementById("paragraph-size").value) || 0,
      pageWidth: parseFloat(document.getElementById("page-width").value) || 0,
      pageHeight: parseFloat(document.getElementById("page-height").value) || 0,
      pageMtop: parseFloat(document.getElementById("page-mtop").value) || 0,
      pageMbot: parseFloat(document.getElementById("page-mbot").value) || 0,
      pageMlef: parseFloat(document.getElementById("page-mlef").value) || 0,
      pageMrig: parseFloat(document.getElementById("page-mrig").value) || 0,
    },
  }

  fetch("/api/set-settings", {
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

resetBtn.addEventListener("click", (e) => {
  e.preventDefault()

  if (confirm("Semua setelan akan direset ke setelan pabrik"))
    fetch("/api/reset-settings", { method: "POST" })
      .then(() => initData())
      .catch((e) => alert("Gagal mereset setelan"))
})

initData()
