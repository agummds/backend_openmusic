# Open Music API || Back-End Side
## Deskripsi Singkat
Proyek ini merupakan pengembangan API backend untuk aplikasi pemutar musik open-source OpenMusic. API ini menyediakan layanan untuk mengelola data musik, playlist, dan fitur-fitur lainnya.

## Teknologi yang Digunakan
| Teknologi | Fungsi | Versi | Catatan |
|---|---|---|---|
| **Hapi.js** | Framework backend yang ringan dan fleksibel untuk membangun aplikasi Node.js. | Semua versi | - |
| **PostgreSQL** | Database relasional yang kuat dan andal untuk menyimpan data terstruktur. | Semua versi | - |
| **JWT** | Standar industri untuk otentikasi token yang aman dan ringkas. | Versi 2+ | Digunakan untuk melindungi akses ke API dan mengelola sesi pengguna. |
| **Redis** | In-memory data store yang sangat cepat untuk caching, sesi, dan data real-time. | Versi 3 | Meningkatkan kinerja aplikasi dengan mengurangi beban pada database. |
| **Amazon S3** | Layanan penyimpanan objek yang scalable dan tahan lama untuk menyimpan dan mengambil data apa pun. | Versi 3 | Digunakan untuk menyimpan file gambar album dan aset statis lainnya. |

## Fitur

| Versi | Fitur Utama | Deskripsi Singkat |
|---|---|---|
| 1 | CRUD Album dan Lagu | Menyediakan dasar untuk pengelolaan data musik. |
| 2 | Playlist Pribadi, Otentikasi JWT | Memperkaya pengalaman pengguna dengan fitur playlist dan meningkatkan keamanan data. |
| 3 | Caching, Ekspor Playlist, Upload Gambar Album | Meningkatkan kinerja dan fleksibilitas aplikasi. |
