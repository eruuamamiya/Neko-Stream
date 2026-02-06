/* CONFIG.JS - Konfigurasi Utama
   File ini mengatur ke mana website akan mencari data (API).
*/

// --- PILIHAN 1: JIKA MENJALANKAN LOKAL (STB & HP di Wifi Sama) ---
// Gunakan IP STB kamu, contoh: "http://192.168.1.5:3000"
// var API_BASE_URL = "http://localhost:3000"; 


// --- PILIHAN 2: JIKA ONLINE (Vercel / Akses Jarak Jauh) ---
// Ganti URL di bawah ini dengan Link Cloudflare Tunnel kamu yang aktif.
// Contoh: "https://nama-tunnel-kamu.trycloudflare.com"

var API_BASE_URL = "https://api.nekostream.online/otakudesu"; 

// (Biarkan baris ini, untuk mencegah error jika variabel belum ada)
if (typeof API_BASE_URL === 'undefined') {
    console.warn('API_BASE_URL belum diatur di config.js');
}







