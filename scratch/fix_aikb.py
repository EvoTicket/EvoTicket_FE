import io
import os

path = r'e:/BK/hk252/thesis/my-next-app/src/app/[locale]/admin/ai-kb/page.tsx'
if not os.path.exists(path):
    print(f"File not found: {path}")
    exit(1)

with io.open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace using parts of the strings to be safe
content = content.replace('selectedItem.summary || "Bản tóm tắt chưa được cập nhật cho hạng mục này."', 'selectedItem.summary || t("aikb_sub.no_summary")')
content = content.replace('placeholder="Ghi chú nội bộ hoặc lý do thay đổi..."', 'placeholder={t("aikb_sub.internal_note_placeholder")}')
content = content.replace('>Chọn một knowledge item để xem chi tiết<', '>{t("aikb_sub.select_to_view")}<')

with io.open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement successful")
