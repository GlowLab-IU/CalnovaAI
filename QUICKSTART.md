# 🚀 HƯỚNG DẪN KÍCH HOẠT FORM LIÊN HỆ - 5 PHÚT

## ✅ Tình trạng hiện tại:
- Website đang chạy: http://localhost:3000
- Form liên hệ đã được tạo tại: http://localhost:3000/sign-up
- **Cần setup EmailJS để form hoạt động**

---

## 📧 SETUP EMAILJS - 4 BƯỚC ĐỞN GIẢN

### **Bước 1: Tạo tài khoản EmailJS (1 phút)**

1. Truy cập: **https://www.emailjs.com/**
2. Click nút **"Sign Up"** (góc trên bên phải)
3. Điền thông tin:
   - Email: (email của bạn)
   - Password: (tạo mật khẩu)
4. Click **"Sign Up"**
5. Xác nhận email (check hộp thư)

---

### **Bước 2: Thêm Gmail Service (2 phút)**

1. Sau khi đăng nhập, vào **"Email Services"** (menu bên trái)
2. Click **"Add New Service"**
3. Chọn **"Gmail"**
4. Đăng nhập bằng Gmail: **calnovaai2025@gmail.com**
5. Click **"Allow"** để cho phép EmailJS gửi email
6. **LƯU LẠI** Service ID (vd: `service_abc123`)

---

### **Bước 3: Tạo Email Template (2 phút)**

1. Vào **"Email Templates"** (menu bên trái)
2. Click **"Create New Template"**
3. Điền thông tin:

**Subject:** (Tiêu đề email)
```
Liên hệ mới từ {{from_name}} - CalnovaAI
```

**Content:** (Nội dung email)
```
Bạn nhận được liên hệ mới từ website CalnovaAI:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
THÔNG TIN KHÁCH HÀNG:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Họ và tên: {{from_name}}
Email: {{from_email}}
Số điện thoại: {{phone}}
Công ty: {{company}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NỘI DUNG TIN NHẮN:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{{message}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Email tự động từ CalnovaAI Contact Form
```

4. **QUAN TRỌNG:** Ở trường **"To email"** (Email nhận), điền: **calnovaai2025@gmail.com**
5. Click **"Save"**
6. **LƯU LẠI** Template ID (vd: `template_xyz789`)

---

### **Bước 4: Lấy Public Key**

1. Click vào **"Account"** (menu bên trái)
2. Chọn tab **"General"**
3. Tìm phần **"Public Key"**
4. **LƯU LẠI** Public Key (vd: `abc123XYZ`)

---

## ⚙️ CẤU HÌNH VÀO PROJECT

### **Mở file `.env`** (ở thư mục gốc project)

Thay thế 3 giá trị:

```env
REACT_APP_EMAILJS_SERVICE_ID=service_abc123      # ← Thay bằng Service ID của bạn
REACT_APP_EMAILJS_TEMPLATE_ID=template_xyz789    # ← Thay bằng Template ID của bạn
REACT_APP_EMAILJS_PUBLIC_KEY=abc123XYZ           # ← Thay bằng Public Key của bạn
```

**Lưu file** (Ctrl + S)

---

## 🎯 KHỞI ĐỘNG LẠI SERVER

```bash
# Stop server hiện tại (Ctrl + C trong terminal)
# Sau đó chạy lại:
npm start
```

Truy cập: **http://localhost:3000/sign-up**

---

## ✨ TEST FORM

1. Vào trang: http://localhost:3000/sign-up
2. Điền đầy đủ thông tin:
   - Họ và tên
   - Số điện thoại
   - Email
   - Công ty (không bắt buộc)
   - Nội dung
3. Click **"Gửi Thông Tin"**
4. Kiểm tra email: **calnovaai2025@gmail.com**

---

## 📊 MIỄN PHÍ

EmailJS Free Plan:
- ✅ 200 emails/tháng
- ✅ Không cần credit card
- ✅ Đủ cho hầu hết website

---

## ❓ GẶP VẤN ĐỀ?

### **Lỗi: "Đã có lỗi xảy ra khi gửi email"**
- ✓ Kiểm tra lại 3 keys trong file `.env`
- ✓ Đảm bảo đã lưu file `.env`
- ✓ Chạy lại `npm start`

### **Email không nhận được**
- ✓ Kiểm tra thư mục Spam
- ✓ Đợi 1-2 phút
- ✓ Kiểm tra Template có đúng variables không

### **Lỗi khác**
- Xem chi tiết trong Console (F12 trong browser)
- Đọc file `EMAILJS_SETUP.md` để biết thêm chi tiết

---

## 📱 LIÊN HỆ

Nếu cần hỗ trợ thêm:
- EmailJS Docs: https://www.emailjs.com/docs/
- EmailJS Support: support@emailjs.com

---

**🎊 Chúc bạn setup thành công!**
