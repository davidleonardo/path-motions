# 📚 Panduan Lengkap Instalasi & Implementasi Agent Skills (Matt Pocock & Custom Skills)

Dokumen ini berisi rangkuman teknis tentang cara instalasi, sintaks/command PowerShell, struktur file, dan cara menggunakan serta membuat **Agent Skills** untuk project **PathMotion** dan project-project berikutnya.

---

## 1. Apa Itu Agent Skills?

**Skill** adalah direktori modul instruksi cerdas yang memperluas kemampuan AI Coding Assistant (seperti Antigravity, Gemini CLI, Claude Code, Cursor, dll).

Setiap skill memiliki:
1. `SKILL.md` (Wajib): File instruksi dengan frontmatter YAML (`name`, `description`).
2. `scripts/` (Opsional): Skrip otomasi untuk tooling.
3. `examples/` atau `references/` (Opsional): Referensi arsitektur, kode, atau aturan spesifik.

AI Agent akan **secara otomatis mendeteksi dan membaca instruksi skill** ketika task yang sedang dikerjakan relevan dengan deskripsi pada skill tersebut.

---

## 2. Lokasi Direktori Skills

Terdapat dua level penempatan skill:

| Level | Lokasi Path | Cakupan / Scope |
| :--- | :--- | :--- |
| **Global Skills** | `C:\Users\david\.gemini\config\skills\<nama-skill>\` | Aktif di **seluruh project/workspace** |
| **Project Skills** | `<project-dir>\.gemini\skills\<nama-skill>\` | Khusus aktif di **project saat ini** |

---

## 3. Sintaks & Perintah Instalasi (PowerShell)

Berikut adalah perintah lengkap yang digunakan untuk meng-clone dan memasang skill dari repositori [mattpocock/skills](https://github.com/mattpocock/skills):

```powershell
# ----------------------------------------------------
# 1. Tentukan path Global & Project
# ----------------------------------------------------
$globalSkills = "C:\Users\david\.gemini\config\skills"
$projectSkills = "D:\99. Me\path-motions\.gemini\skills"

# Buat folder jika belum ada
if (-not (Test-Path $globalSkills)) { New-Item -ItemType Directory -Path $globalSkills -Force }
if (-not (Test-Path $projectSkills)) { New-Item -ItemType Directory -Path $projectSkills -Force }

# ----------------------------------------------------
# 2. Clone repository Matt Pocock ke folder Temp
# ----------------------------------------------------
$tempDir = "$env:TEMP\mattpocock-skills"
if (Test-Path $tempDir) { Remove-Item -Recurse -Force $tempDir }
git clone https://github.com/mattpocock/skills.git $tempDir

# ----------------------------------------------------
# 3. Cari semua folder yang memiliki SKILL.md dan salin
# ----------------------------------------------------
$skillDirs = Get-ChildItem -Path "$tempDir\skills" -Recurse -Filter "SKILL.md" | ForEach-Object { $_.Directory }

foreach ($dir in $skillDirs) {
    $destGlobal = Join-Path $globalSkills $dir.Name
    $destProject = Join-Path $projectSkills $dir.Name
    
    # Salin ke Global
    Copy-Item -Path $dir.FullName -Destination $destGlobal -Recurse -Force
    # Salin ke Project
    Copy-Item -Path $dir.FullName -Destination $destProject -Recurse -Force
    
    Write-Host "✅ Berhasil install skill: $($dir.Name)" -ForegroundColor Green
}

# ----------------------------------------------------
# 4. Bersihkan folder temporary
# ----------------------------------------------------
Remove-Item -Recurse -Force $tempDir
Write-Host "🚀 Seluruh skill Matt Pocock berhasil dipasang!" -ForegroundColor Cyan
```

---

## 4. Daftar Skill Matt Pocock yang Telah Terpasang

Berikut skill yang telah aktif dan siap digunakan:

### 🛠️ Engineering
- `ask-matt`: Konsultasi pertanyaan teknis TypeScript/JavaScript tingkat lanjut.
- `code-review`: Review kode dan best practice.
- `codebase-design`: Mendesain arsitektur dan pola modular codebase.
- `diagnosing-bugs`: Pendekatan sistematis debugging dan root cause analysis.
- `domain-modeling`: Pemodelan entitas domain, type safety, dan data contracts.
- `implement`: Eksekusi implementasi fitur langkah demi langkah.
- `improve-codebase-architecture`: Refactoring dan perbaikan arsitektur.
- `prototype`: Membangun prototipe fungsional dengan cepat.
- `research`: Riset teknologi atau pustaka pendukung.
- `resolving-merge-conflicts`: Panduan resolusi konflik git.
- `setup-matt-pocock-skills`: Setup dan sinkronisasi skill Matt Pocock.
- `tdd`: Test-Driven Development (menulis unit test sebelum/bersamaan dengan kode).
- `to-spec`: Mengubah ide/PRD menjadi spesifikasi teknis terperinci.
- `to-tickets`: Memecah spesifikasi menjadi task/tiket kecil.
- `triage`: Klasifikasi dan prioritas isu.
- `wayfinder`: Navigasi file dan modul dalam codebase besar.
- `wizard`: Panduan wizard interaktif.

### ⚡ Productivity & Lainnya
- `grill-me` / `grilling`: Melakukan interview teknis interaktif untuk memvalidasi rencana arsitektur.
- `handoff` / `claude-handoff`: Dokumentasi status pekerjaan saat pergantian sesi.
- `teach`: Menjelaskan konsep teknis secara edukatif.
- `writing-for-agents`: Format prompt dan konteks optimal untuk LLM.

---

## 5. Cara Membuat Custom Skill Sendiri (Untuk Project Masa Depan)

Untuk membuat skill custom untuk project baru:

1. Buat folder: `.gemini/skills/<nama-skill-anda>/`
2. Buat file: `.gemini/skills/<nama-skill-anda>/SKILL.md`
3. Tulis dengan format frontmatter YAML di bagian atas:

```markdown
---
name: motion-graphics-engine
description: Best practices dan formula matematika untuk interpolasi Bezier curve, Catmull-Rom spline, dan rendering canvas 60fps. Gunakan saat mengoding engine animasi rute.
---

# Motion Graphics Engine Skill

## Prinsip Utama
1. Selalu pisahkan Raw Geometry (koordinat asli) dengan Visual Geometry (koordinat render yang di-smooth).
2. Gunakan requestAnimationFrame dengan delta time agar animasi tidak terikat pada refresh rate monitor.
3. Hindari alokasi objek baru di dalam render loop.

## Contoh Formula Easing
...
```

---

## 6. Cara Menggunakan Skill Saat Bekerja dengan AI

1. **Otomatis (Implicit)**: AI akan membaca deskripsi seluruh skill yang tersedia, dan mengaktifkan skill yang relevan secara otomatis sesuai instruksi Anda.
2. **Manual (Explicit)**: Anda dapat menyebutkan langsung di prompt, contoh:
   > *"Gunakan skill `codebase-design` dan `domain-modeling` untuk merancang struktur folder dan tipe data PathMotion."*
