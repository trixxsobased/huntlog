# DESIGN PLAN: Huntlog UI/UX Polish

## 1. Login (`/login`)
### Masalah yang teridentifikasi:
- Terlalu banyak ruang kosong (padding) di antara judul, form, dan tombol.
- Label input masih standar, kurang ada *hacker terminal aesthetic*.
- Tombol Sign In ungu (`#7c3aed`) terlalu terang dan mencuri fokus berlebihan dibanding keseluruhan dark theme.
- Input box dan fieldset-nya terasa lebar dan boxy.

### Rencana perubahan:
- **Spacing/Density**: Perkecil margin di form container (gunakan `space-y-4` menjadi `space-y-3`). 
- **Typography & Label**: Pastikan elemen label bertipe `text-[10px] uppercase tracking-wide font-mono text-muted-foreground/70`. 
- **Buttons**: Redupkan sedikit opacity button ungu atau ganti ke state solid yang lebih *matte* (`bg-violet-600` default, tapi dengan border halus atasnya).
- **Separator**: Garis buatan "Or continue with" dibuat lebih subtle, opacity 10%.

### Yang TIDAK boleh diubah:
- Integrasi Supabase Auth logic (`signInWithPassword`, `signInWithOAuth`).
- Fungsionalitas error handling (`toast` atau label merah).

---

## 2. Register (`/register`)
### Masalah yang teridentifikasi:
- Issue layouting sama dengan Login (border, input styles, margin).
- Teks success message (setelah email dikirim) agak generik.

### Rencana perubahan:
- **Form UI**: Implementasi perbaikan spacing, border `border-[#1f1f1f]`, dan `bg-[#0a0a0a]` yang identik dengan login.
- **Typography**: Header dan subheader diperkecil sedikit agar lebih presisi.
- **Success State**: Berikan sentuhan font `monospace` untuk email user di state success, border container dibikin dashboard-styled.

### Yang TIDAK boleh diubah:
- Validasi password (harus match & panjang).
- Integrasi Supabase `signUp`.

---

## 3. Dashboard (`/dashboard`)
### Masalah yang teridentifikasi:
- Konten card stat dan list bugs border-nya sedikit tebal/kurang nyatu dengan background (contrast issues).
- Tabel Recent Reports terlalu lebar jarak antar elemennya, kurang *compact*.
- Teks judul card "Recent Reports" masih terlalu generik.
- "View all →" link masih terlalu basic dan warnanya kurang 'pop' dibandingkan accent utama.

### Rencana perubahan:
- **Stat Cards**: Ubah border default shadow menjadi lebih seamless (`border-[#1f1f1f] bg-[#0a0a0a]`). Buat background stat card sedikit elevate (contoh `bg-[#0e0e0e]`) agar terpisah tegas dengan main bg `#050505`.
- **Typography Density**: Kurangi padding pada baris Recent Bugs dari `py-2.5` menjadi `py-1.5` atau `py-2` untuk kepadatan ekstra bergaya hacker tool.
- **Warna Status**: Tweak warna `emerald-400` dan `red-400` pada badge menjadi soft/desaturated glow.
- **Hover States**: Tambahkan background highlight (`hover:bg-[#111]`) yang lebih subtle di row bugs.

### Yang TIDAK boleh diubah:
- Layout grid stats (tetap 2 kolom mobile, 4 kolom desktop).
- Monospace font styling pada angka statistik.

---

## 4. Bug List (/dashboard/bugs)
### Masalah yang teridentifikasi:
- Dropdown select "All Severity" dan "All Status" terlalu besar (`h-7`) dan bordernya kurang nyatu. Text dropdown tidak monospace.
- Spacing antar row bug report terlalu renggang.
- Tidak ada indikator pemisah kolom visual yang solid.

### Rencana perubahan:
- **Filters**: Update class SelectTrigger menjadi extra compact (`h-6 h-7 text-[10px] font-mono border-[#1f1f1f] bg-transparent`).
- **List Density**: Hapus pembatas solid antar baris, ganti dengan hover state murni atau divider transparan `border-white/5`.
- **Button "New Bug"**: Pastikan radius tetap konsisten `rounded-sm`, opacity shadow/border pada button solid.

### Yang TIDAK boleh diubah:
- Logic routing URL parameter saat filter (masih SSR query).
- Data minimal tiap baris bug.

---

## 5. Bug Detail (/dashboard/bugs/[id])
### Masalah yang teridentifikasi:
- Container "Details" di sidebar kanan (berisi Bug ID, dsb) elemen metadata-nya jarak renggang.
- Font styling Collapsible Section title standard.
- Panel MarkdownEditor dan Attachments telalu mencolok borders-nya.

### Rencana perubahan:
- **Right Sidebar (Metadata)**: Padding diperkecil `p-3`, vertical spacing `.space-y-1.5`. Kiri label gunakan `text-[10px] uppercase font-mono`.
- **Collapsible Section**: Pada `summary`, set title `text-[10px] uppercase tracking-widest font-mono text-[#a1a1aa]`. Border bottom muncul hanya di state `open`.
- **Button Actions**: Duplicate & Edit ganti menjadi ghost button `.border-transparent.hover:bg-white/5` berbalut monospace.
- **CVSS Box**: Compact-kan area skor dan font-weight.

### Yang TIDAK boleh diubah:
- Render MarkdownViewer.
- Fungsi fungsional H1 Copy.

---

## 6. Create/Edit Form (/dashboard/bugs/new)
### Masalah yang teridentifikasi:
- Styling tinggi (height) element Input Text dan Select tidak sama rata (ada beda sekian piksel).
- Area Background Markdown Editor contrast warnanya bertabrakan dengan dark theme native Shadcn.
- Label standard dan area kosong Kanan-Kiri tak seimbang.

### Rencana perubahan:
- **Input Fields**: Override global input tailwind styles `bg-[#0a0a0a] border-[#1f1f1f] rounded-sm text-[12px] font-mono focus-visible:ring-1 focus-visible:ring-violet-500/50`.
- **Labels**: Seragamkan `text-[10px] uppercase tracking-wider font-mono text-muted-foreground/70`.
- **Editor Theme**: Ubah BG color container MDEditor.
- **Layout Buttons**: Pindahkan Submit button stack rapat di ujung kiri bawah dengan cancel ghost button disebelahnya.

### Yang TIDAK boleh diubah:
- Skema CVSS Calculator state metrics.
- Fitur Clipboard Image paste handler.

---

## 7. Programs (/dashboard/programs)
### Masalah yang teridentifikasi:
- Card Program *chunky* (padding longgar, border terang).
- Empty state "No Program" icon dan border telalu dominan putih.

### Rencana perubahan:
- **Card**: Border redupkan `border-white/5 hover:border-violet-500/30`. Padding `p-3`. BG `#0a0a0a`.
- **Empty State**: Borders `border-dashed border-white/5`, teks `text-[#a1a1aa]`.
- **Actions Text**: Edit/Delete pastikan link-nya `text-[10px] uppercase font-mono hover:text-white`.

### Yang TIDAK boleh diubah:
- Implementasi dialog open/close management data.

---

## 8. Sidebar & Navigasi Global
### Masalah yang teridentifikasi:
- Header "HUNTLOG" dan Icon "V" belum terasa sebagai brand logomark yang solid.
- Warna background Sidebar (desktop) identik persis 100% dengan main content layout `#0a0a0a` yang mengaburkan batas hirarki.
- Active states `bg-violet-500/10` terlalu terang.

### Rencana perubahan:
- **Brand Name**: Beri jarak letter tracking `tracking-[0.25em]` di kata HUNTLOG, ukuran text `.text-xs`.
- **Sidebar Background**: Set BG color ke true dark `#000000` atau `#030303` (sedangkan main content wrapper `#0a0a0a` / `#09090b`).
- **Nav Items**: Active state diredupkan border kiri saja atau teks pure `text-violet-400`. Font menu `text-[11px] font-mono tracking-wide uppercase`.
- **User Block**: Bottom user card diperkecil text metadata-nya.

### Yang TIDAK boleh diubah:
- Fixed Width `w-[220px]`.
- Logic Logout dan Mobile navigasi bottom bar.

---

## FAVICON & METADATA
### Rencana perubahan:
- **Metadata**: 
  - Title: dari "Huntlog — Bug Report Tracker" menjadi lebih sleek `Huntlog | Tracker` (dan setup dinamis per route: `Bug #HL-0012 | Huntlog`).
  - Description: Ubah ke `Minimalist bug hunting lifecycle tracker.`
- **Favicon**:
  - Hapus icon global Vercel. Ganti ke icon SVG monospace *H* atau crosshair ungu `#7c3aed`. Letakkan di `app/favicon.ico` dan `app/icon.svg`.
