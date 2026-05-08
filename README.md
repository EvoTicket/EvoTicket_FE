This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 🎨 Design Tokens & Variables Configuration

Dự án này sử dụng tự động hoá biến thiết kế (Design Tokens) từ **Figma** để cấp nguồn mã màu động cho hệ thống **Tailwind CSS v4**. Thay vì khai báo mã màu thủ công, toàn bộ giao diện (bao gồm tính năng đổi Light / Dark Mode mượt mà không cần re-render) được xuất trực tiếp định dạng từ thiết kế.

### Luồng Cập Nhật Variables (Quy trình)

Mỗi khi mã màu hay biến trên Figma thay đổi, hãy thực hiện theo 2 bước sau:

**1. Xuất file JSON từ Figma**
Sử dụng Plugin xuất Variables của Figma để tải các file JSON chứa biến về. Bạn cần đặt (hoặc ghi đè) chúng vào thư mục `asset/` tại gốc của dự án:
- `asset/raw.json`
- `asset/semantic-light.json`
- `asset/component.json`
*(Lưu ý: Bạn chỉ cần 1 file `component.json` dùng chung cho cả Component Tokens, hệ thống sẽ tự động map đúng bí danh (alias) giữa 2 mode Light/Dark cho bạn).*

**2. Khởi chạy Token Compiler**
Biên dịch các file JSON vừa xuất thành mã CSS thực thi. Tại Terminal, chạy lệnh:
```bash
node scripts/build-tokens.mjs
```

Sau khi chạy xong, compiler sẽ tự động dò tìm cú pháp rác, thêm tiền tố `--color-` cho các biến màu sắc và thay thế vào file gốc tại:
👉 `src/app/figma-tokens.css`

Tất cả các className Tailwind (vd: `bg-badge-neutral-bg`, `text-text-primary`) sẽ tự động được cập nhật màu ngay lập tức trên hệ thống giao diện Next.js mà không cần sửa đổi React code nào.
