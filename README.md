# 🐱 NekoStream

![NekoStream Banner](https://via.placeholder.com/1000x400?text=Preview+NekoStream+App)
**NekoStream** adalah platform streaming anime berbasis web yang ringan, cepat, dan responsif. Dibangun menggunakan **Vanilla JavaScript** dan **Tailwind CSS**, website ini dirancang untuk memberikan pengalaman menonton yang mulus di perangkat mobile maupun desktop tanpa iklan yang mengganggu.

Website ini bertindak sebagai Frontend yang mengambil data dari Unofficial Otakudesu API (Self-hosted).

## 🚀 Fitur Utama

* **🎬 Streaming Lancar:** Pemutar video responsif dengan dukungan berbagai resolusi (360p, 480p, 720p).
* **📦 Download Batch:** Fitur unduh anime satu season penuh (ZIP) dengan berbagai pilihan server (Google Drive, Mega, dll).
* **📡 Multi-Server:** Pilihan server mirror jika server utama bermasalah.
* **📅 Jadwal & Ongoing:** Update anime yang sedang tayang (On-Going) dan jadwal rilis harian.
* **📂 Genre & Search:** Navigasi mudah berdasarkan kategori dan pencarian judul.
* **📱 Mobile First:** Tampilan UI/UX yang dimaksimalkan untuk pengguna Smartphone.
* **⚡ Ringan:** Tanpa framework berat, hanya HTML, JS murni, dan Tailwind CSS (CDN).

## 🛠️ Teknologi

* **Frontend:** HTML5, CSS3, JavaScript (ES6+).
* **Styling:** [Tailwind CSS](https://tailwindcss.com/).
* **Icon:** Emoji & Text-based icons.
* **Data Source:** Custom API (Otakudesu Scraper).

## ⚙️ Cara Instalasi & Menjalankan

Project ini adalah **Static Web**, jadi sangat mudah dijalankan.

1.  **Clone Repository**
    ```bash
    git clone [https://github.com/eruuamamiya/Neko-Stream.git](https://github.com/eruuamamiya/Neko-Stream.git)
    cd Neko-Stream
    ```

2.  **Konfigurasi API**
    Agar website bisa memuat data anime, kamu perlu menghubungkannya ke API Server kamu.
    * Buka file `config.js`.
    * Ubah variabel `API_BASE_URL` sesuai alamat server API kamu (misal: Cloudflare Tunnel, VPS, atau Localhost).

    ```javascript
    // config.js
    const API_BASE_URL = "[https://domain-api-kamu.trycloudflare.com](https://domain-api-kamu.trycloudflare.com)";
    ```

3.  **Jalankan**
    * Buka file `index.html` langsung di browser.
    * Atau gunakan ekstensi **Live Server** di VS Code.
    * Atau deploy langsung ke **Vercel / Netlify / GitHub Pages**.

## 📂 Struktur Folder

```text
Neko-Stream/
├── index.html        # Halaman Utama (Home)
├── ongoing.html      # Halaman Anime Ongoing
├── jadwal.html       # Halaman Jadwal Rilis
├── list-anime.html   # Daftar Anime (A-Z & Search)
├── genre.html        # Daftar Genre
├── genre-result.html # Hasil Filter Genre
├── detail.html       # Halaman Detail Anime
├── watch.html        # Halaman Nonton (Streaming)
├── batch.html        # Halaman Download Batch
├── config.js         # File Konfigurasi API (PENTING)
└── README.md         # Dokumentasi
