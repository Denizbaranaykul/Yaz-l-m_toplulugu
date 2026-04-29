$replacements = @{
    # CSS in HTML
    "stiller/components/styles.css" = "stiller/main/ana-stil.css"
    "stiller/auth.css" = "stiller/giris-stili.css"
    "stiller/basvuru.css" = "stiller/basvuru-stili.css"
    "stiller/egitim/egitim.css" = "stiller/egitim/egitim-stili.css"
    "stiller/admin/admin.css" = "stiller/admin/yonetici-stili.css"
    "stiller/egitim.css" = "stiller/egitim/egitim-stili.css"
    "stiller/admin.css" = "stiller/admin/yonetici-stili.css"
    
    # JS imports (relative)
    "./script.js" = "./ana-sayfa.js"
    "./firebase-config.js" = "./veritabani-ayarlari.js"
    "./ui-interactions.js" = "./gorsel-efektler.js"
    "./home-projects.js" = "./projeler.js"
    "./home-blog.js" = "./blog-gosterimi.js"
    "./contact-form.js" = "./iletisim.js"
    "./chatbot.js" = "./yapay-zeka.js"
    "../main/firebase-config.js" = "../main/veritabani-ayarlari.js"

    "./admin.js" = "./yonetici-paneli.js"
    "./admin-ui.js" = "./yonetici-arayuzu.js"
    "./admin-forms.js" = "./yonetici-formlari.js"
    "./admin-lists.js" = "./yonetici-listeleri.js"
    "./admin-submissions.js" = "./yonetici-odevler.js"

    "./egitim.js" = "./egitim-sayfasi.js"
    "./egitim-state.js" = "./egitim-durumu.js"
    "./egitim-ui.js" = "./egitim-arayuzu.js"
    "./egitim-data.js" = "./egitim-icerikleri.js"
    "./egitim-actions.js" = "./egitim-islemleri.js"

    # HTML script tags
    "js/login.js" = "js/giris-yap.js"
    "js/blog.js" = "js/blog-sayfasi.js"
    "js/basvuru.js" = "js/basvuru-sayfasi.js"
    "js/main/script.js" = "js/main/ana-sayfa.js"
    "js/admin/admin.js" = "js/admin/yonetici-paneli.js"
    "js/egitim/egitim.js" = "js/egitim/egitim-sayfasi.js"
}

# Fix paths with ../
$moreReplacements = @{}
foreach ($key in $replacements.Keys) {
    if (!$key.StartsWith(".") -and !$key.StartsWith("../")) {
        $moreReplacements["../$key"] = "../" + $replacements[$key]
    }
}
foreach ($key in $moreReplacements.Keys) {
    $replacements[$key] = $moreReplacements[$key]
}


$files = Get-ChildItem -Path "c:\codes\Yaz-l-m_toplulugu" -Include *.html,*.js -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $changed = $false
    foreach ($key in $replacements.Keys) {
        if ($content -match [regex]::Escape($key)) {
            $content = $content -replace [regex]::Escape($key), $replacements[$key]
            $changed = $true
        }
    }
    if ($changed) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
    }
}
