# Hướng Dẫn Cấu Hình EmailJS

## Bước 1: Tạo Tài Khoản EmailJS

1. Truy cập: https://www.emailjs.com/
2. Click "Sign Up" để tạo tài khoản miễn phí
3. Xác nhận email của bạn

## Bước 2: Thêm Email Service

1. Đăng nhập vào EmailJS Dashboard
2. Vào mục **"Email Services"**
3. Click **"Add New Service"**
4. Chọn **Gmail** (hoặc email provider bạn đang dùng)
5. Đăng nhập với tài khoản Gmail: **calnovaai2025@gmail.com**
6. Cho phép EmailJS truy cập
7. Lưu **Service ID** (ví dụ: service_abc123)

## Bước 3: Tạo Email Template

1. Vào mục **"Email Templates"**
2. Click **"Create New Template"**
3. Thiết lập template như sau:

### Template Settings:
- **Template Name**: Contact Form CalnovaAI
- **To Email**: calnovaai2025@gmail.com (Điền email nhận ở đây!)
- **Subject**: Liên hệ mới từ {{from_name}} - CalnovaAI Website

### Template Content:
```
Bạn có một liên hệ mới từ website CalnovaAI:

Thông tin người liên hệ:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Họ và tên: {{from_name}}
Email: {{from_email}}
Số điện thoại: {{phone}}
Công ty: {{company}}

Nội dung tin nhắn:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{{message}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Email này được gửi tự động từ form liên hệ trên website CalnovaAI.
```

4. **QUAN TRỌNG:** Ở phần **"To email"** của template, điền: **calnovaai2025@gmail.com**
5. Click **"Save"**
6. Lưu **Template ID** (ví dụ: template_xyz789)

## Bước 4: Lấy Public Key

1. Vào mục **"Account"** → **"General"**
2. Tìm **"Public Key"** (ví dụ: abc123XYZ456)
3. Copy Public Key này

## Bước 5: Cập Nhật Code

Mở file: `src/components/ContactForm/ContactForm.js`

Tìm và thay thế các giá trị sau (ở dòng 75-77):

```javascript
const serviceId = 'YOUR_SERVICE_ID';      // Thay bằng Service ID
const templateId = 'YOUR_TEMPLATE_ID';    // Thay bằng Template ID
const publicKey = 'YOUR_PUBLIC_KEY';      // Thay bằng Public Key
```

### Ví dụ:
```javascript
const serviceId = 'service_abc123';
const templateId = 'template_xyz789';
const publicKey = 'abc123XYZ456';
```

## Bước 6: Test Form

1. Chạy lại ứng dụng: `npm start`
2. Truy cập trang Liên Hệ: http://localhost:3000/sign-up
3. Điền form và gửi thử
4. Kiểm tra email calnovaai2025@gmail.com

## Giới Hạn Free Plan

EmailJS Free plan cho phép:
- ✅ 200 emails/tháng
- ✅ 2 email services
- ✅ 3 email templates
- ✅ Không cần credit card

Nếu cần nhiều hơn, có thể nâng cấp lên paid plan.

## Lưu Ý Bảo Mật

**QUAN TRỌNG:** Để bảo mật tốt hơn, nên tạo file `.env` để lưu các keys:

1. Tạo file `.env` ở root project:
```
REACT_APP_EMAILJS_SERVICE_ID=your_service_id
REACT_APP_EMAILJS_TEMPLATE_ID=your_template_id
REACT_APP_EMAILJS_PUBLIC_KEY=your_public_key
```

2. Cập nhật code trong `ContactForm.js`:
```javascript
const serviceId = process.env.REACT_APP_EMAILJS_SERVICE_ID;
const templateId = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
const publicKey = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;
```

3. Thêm `.env` vào `.gitignore` để không commit keys lên GitHub

## Troubleshooting

### Lỗi "Failed to send email"
- Kiểm tra lại Service ID, Template ID, Public Key
- Đảm bảo đã kích hoạt email service trong EmailJS
- Kiểm tra console log để xem lỗi chi tiết

### Email không nhận được
- Kiểm tra thư mục Spam/Junk
- Đợi vài phút (có thể bị delay)
- Kiểm tra lại template variables có đúng không

### Lỗi CORS
- EmailJS đã xử lý CORS, không cần config thêm
- Nếu vẫn lỗi, thử clear cache browser

## Hỗ Trợ

Nếu cần trợ giúp thêm:
- EmailJS Documentation: https://www.emailjs.com/docs/
- EmailJS Support: support@emailjs.com
