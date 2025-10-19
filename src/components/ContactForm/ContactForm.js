import React, { useState } from 'react';
import emailjs from '@emailjs/browser';
import {
  ContactContainer,
  ContactWrapper,
  ContactHeading,
  ContactSubtitle,
  FormWrapper,
  Form,
  FormGroup,
  FormLabel,
  FormInput,
  FormTextarea,
  FormButton,
  SuccessMessage,
  ErrorMessage,
  RequiredStar
} from './ContactForm.elements';

function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    message: ''
  });

  const [status, setStatus] = useState({
    submitting: false,
    success: false,
    error: false,
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ submitting: true, success: false, error: false, message: '' });

    // Validation
    if (!formData.name || !formData.phone || !formData.email || !formData.message) {
      setStatus({
        submitting: false,
        success: false,
        error: true,
        message: 'Vui lòng điền đầy đủ các trường bắt buộc!'
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setStatus({
        submitting: false,
        success: false,
        error: true,
        message: 'Email không hợp lệ!'
      });
      return;
    }

    // Phone validation (Vietnamese phone number)
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      setStatus({
        submitting: false,
        success: false,
        error: true,
        message: 'Số điện thoại không hợp lệ!'
      });
      return;
    }

    try {
      // EmailJS configuration
      // Để setup EmailJS, xem hướng dẫn trong file EMAILJS_SETUP.md
      const serviceId = process.env.REACT_APP_EMAILJS_SERVICE_ID || 'YOUR_SERVICE_ID';
      const templateId = process.env.REACT_APP_EMAILJS_TEMPLATE_ID || 'YOUR_TEMPLATE_ID';
      const publicKey = process.env.REACT_APP_EMAILJS_PUBLIC_KEY || 'YOUR_PUBLIC_KEY';

      // Prepare template parameters
      const templateParams = {
        from_name: formData.name,
        from_email: formData.email,
        phone: formData.phone,
        company: formData.company || 'Không cung cấp',
        message: formData.message
      };

      // Send email using EmailJS
      await emailjs.send(serviceId, templateId, templateParams, publicKey);

      setStatus({
        submitting: false,
        success: true,
        error: false,
        message: 'Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong thời gian sớm nhất.'
      });

      // Reset form
      setFormData({
        name: '',
        phone: '',
        email: '',
        company: '',
        message: ''
      });

      // Clear success message after 5 seconds
      setTimeout(() => {
        setStatus({ submitting: false, success: false, error: false, message: '' });
      }, 5000);

    } catch (error) {
      console.error('EmailJS Error:', error);
      setStatus({
        submitting: false,
        success: false,
        error: true,
        message: 'Đã có lỗi xảy ra khi gửi email. Vui lòng thử lại sau!'
      });
    }
  };

  return (
    <ContactContainer>
      <ContactWrapper>
        <ContactHeading>Liên Hệ Với Chúng Tôi</ContactHeading>
        <ContactSubtitle>
          Điền thông tin bên dưới và chúng tôi sẽ liên hệ lại với bạn trong thời gian sớm nhất
        </ContactSubtitle>
        
        <FormWrapper>
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <FormLabel>
                Họ và tên<RequiredStar>*</RequiredStar>
              </FormLabel>
              <FormInput
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nguyễn Văn A"
                required
              />
            </FormGroup>

            <FormGroup>
              <FormLabel>
                Số điện thoại<RequiredStar>*</RequiredStar>
              </FormLabel>
              <FormInput
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="0912345678"
                required
              />
            </FormGroup>

            <FormGroup>
              <FormLabel>
                Email<RequiredStar>*</RequiredStar>
              </FormLabel>
              <FormInput
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@email.com"
                required
              />
            </FormGroup>

            <FormGroup>
              <FormLabel>Công ty</FormLabel>
              <FormInput
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="Tên công ty của bạn"
              />
            </FormGroup>

            <FormGroup>
              <FormLabel>
                Nội dung<RequiredStar>*</RequiredStar>
              </FormLabel>
              <FormTextarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Vui lòng mô tả chi tiết nhu cầu của bạn..."
                required
              />
            </FormGroup>

            <FormButton type="submit" disabled={status.submitting}>
              {status.submitting ? 'Đang gửi...' : 'Gửi Thông Tin'}
            </FormButton>
          </Form>

          {status.success && (
            <SuccessMessage>{status.message}</SuccessMessage>
          )}

          {status.error && (
            <ErrorMessage>{status.message}</ErrorMessage>
          )}
        </FormWrapper>
      </ContactWrapper>
    </ContactContainer>
  );
}

export default ContactForm;
