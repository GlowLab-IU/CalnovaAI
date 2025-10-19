# ContactForm Component - Quick Start Guide

## 🚀 Tích hợp EmailJS đã hoàn tất!

Form liên hệ đã được tạo và sẵn sàng để gửi email tự động đến **calnovaai2025@gmail.com**.

## 📋 Các bước để kích hoạt:

### 1. Đọc hướng dẫn chi tiết
Mở file `EMAILJS_SETUP.md` ở root project để xem hướng dẫn từng bước.

### 2. Setup nhanh (5 phút)
1. Tạo tài khoản tại: https://www.emailjs.com/
2. Thêm Gmail service với email: calnovaai2025@gmail.com
3. Tạo email template (copy nội dung từ EMAILJS_SETUP.md)
4. Lấy 3 keys: Service ID, Template ID, Public Key

### 3. Cấu hình keys
**Option A: Sử dụng file .env (Khuyến nghị)**
```bash
# Copy file .env.example thành .env
cp .env.example .env

# Mở .env và điền keys của bạn
REACT_APP_EMAILJS_SERVICE_ID=service_xxx
REACT_APP_EMAILJS_TEMPLATE_ID=template_xxx
REACT_APP_EMAILJS_PUBLIC_KEY=your_public_key
```

**Option B: Sửa trực tiếp trong code**
- Mở: `src/components/ContactForm/ContactForm.js`
- Tìm dòng 75-77 và thay thế YOUR_SERVICE_ID, YOUR_TEMPLATE_ID, YOUR_PUBLIC_KEY

### 4. Test form
```bash
npm start
```
Truy cập: http://localhost:3000/sign-up

## ✨ Tính năng form:

✅ **Các trường nhập liệu:**
- Họ và tên (required)
- Số điện thoại (required, validate 10-11 số)
- Email (required, validate format)
- Công ty (optional)
- Nội dung (required)

✅ **Tính năng:**
- Validation dữ liệu đầu vào
- Gửi email tự động qua EmailJS
- Loading state khi đang gửi
- Thông báo thành công/lỗi
- Auto reset form sau khi gửi
- Responsive design
- Beautiful UI với animations

## 📧 Email sẽ gửi đến:
**calnovaai2025@gmail.com**

## 🆓 Free plan:
- 200 emails/tháng
- Không cần credit card
- Đủ cho hầu hết các website nhỏ

## 🔒 Bảo mật:
- Keys được lưu trong `.env` (không commit lên Git)
- `.env` đã được thêm vào `.gitignore`
- Sử dụng `.env.example` làm template

## 📞 Nếu cần hỗ trợ:
Liên hệ hoặc xem thêm tại:
- https://www.emailjs.com/docs/
- File EMAILJS_SETUP.md trong project

---
**Lưu ý:** Form sẽ chỉ hoạt động sau khi bạn setup EmailJS và điền đúng keys!
