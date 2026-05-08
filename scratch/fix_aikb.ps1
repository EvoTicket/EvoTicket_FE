$path = "e:\BK\hk252\thesis\my-next-app\src\app\[locale]\admin\ai-kb\page.tsx"
$content = Get-Content -LiteralPath $path -Raw -Encoding utf8

$content = $content -replace '"{selectedItem\.summary \|\| .*?}"', '"{selectedItem.summary || t(\"aikb_sub.no_summary\")}"'
$content = $content -replace 'placeholder="Ghi chú nội bộ hoặc lý do thay đổi.*?"', 'placeholder={t("aikb_sub.internal_note_placeholder")}'
$content = $content -replace '>Chọn một knowledge item để xem chi tiết<', ">{t(\"aikb_sub.select_to_view\")}<"

$content | Set-Content -LiteralPath $path -Encoding utf8
