import React from 'react';
import styled from 'styled-components';
import { Container } from '../../globalStyles';

const SupportSec = styled.div`
  padding: 120px 0 80px 0;
  background: #101522;
  color: #fff;
  min-height: 100vh;
`;

const SupportCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 50px;
  backdrop-filter: blur(15px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);

  @media screen and (max-width: 768px) {
    padding: 30px 20px;
  }
`;

const MainTitle = styled.h1`
  font-size: 36px;
  margin-bottom: 10px;
  font-weight: 700;
  color: #FDB913; /* Golden accent color */
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 1.5px;
`;

const LastUpdated = styled.p`
  font-size: 14px;
  color: #a9b3c1;
  text-align: center;
  margin-bottom: 40px;
  font-style: italic;
`;

const Section = styled.div`
  margin-bottom: 35px;
`;

const SectionTitle = styled.h2`
  font-size: 22px;
  color: #FDB913;
  margin-bottom: 15px;
  border-left: 4px solid #FDB913;
  padding-left: 12px;
  font-weight: 600;
`;

const Text = styled.p`
  font-size: 16px;
  line-height: 1.6;
  color: #d1d9e6;
  margin-bottom: 15px;
  text-align: justify;
`;

const ContactInfoBox = styled.div`
  background: rgba(253, 185, 19, 0.05);
  border: 1px solid rgba(253, 185, 19, 0.2);
  border-radius: 10px;
  padding: 20px;
  margin: 20px 0;
`;

const ContactDetail = styled.div`
  font-size: 16px;
  margin-bottom: 10px;
  color: #d1d9e6;
  
  strong {
    color: #fff;
  }
`;

const QuestionBlock = styled.div`
  margin-bottom: 20px;
`;

const Question = styled.h3`
  font-size: 18px;
  color: #fff;
  margin-bottom: 8px;
  font-weight: 600;
`;

const Answer = styled.p`
  font-size: 15px;
  line-height: 1.6;
  color: #a9b3c1;
`;

function Support() {
  return (
    <SupportSec>
      <Container>
        <SupportCard>
          <MainTitle>Hỗ Trợ Khách Hàng (Support)</MainTitle>
          <LastUpdated>Cập nhật lần cuối: Ngày 7 tháng 6 năm 2026</LastUpdated>

          <Section>
            <Text>
              Chào mừng bạn đến với trang Hỗ trợ Khách hàng của ứng dụng <strong>Huyền Cơ</strong> (phát triển bởi <strong>CalnovaAI</strong>). Chúng tôi luôn sẵn sàng hỗ trợ, giải đáp mọi thắc mắc và tiếp nhận ý kiến đóng góp của bạn để không ngừng hoàn thiện trải nghiệm dịch vụ.
            </Text>
          </Section>

          <Section>
            <SectionTitle>1. Thông tin liên hệ trực tiếp</SectionTitle>
            <Text>
              Nếu bạn gặp bất kỳ vấn đề gì liên quan đến kỹ thuật, tài khoản hoặc thanh toán, vui lòng liên hệ với bộ phận hỗ trợ của chúng tôi qua các kênh sau:
            </Text>
            <ContactInfoBox>
              <ContactDetail>
                <strong>Email hỗ trợ:</strong> jikeynguyentn@gmail.com
              </ContactDetail>
              <ContactDetail>
                <strong>Thời gian phản hồi dự kiến:</strong> Trong vòng 24 - 48 giờ làm việc.
              </ContactDetail>
              <ContactDetail>
                <strong>Đơn vị chủ quản:</strong> CalnovaAI
              </ContactDetail>
            </ContactInfoBox>
          </Section>

          <Section>
            <SectionTitle>2. Câu hỏi thường gặp (FAQs)</SectionTitle>
            
            <QuestionBlock>
              <Question>Làm thế nào để sử dụng tính năng Quét tướng diện (Face Scan)?</Question>
              <Answer>
                Mở ứng dụng Huyền Cơ, chọn tính năng "Quét Tướng Diện" ở màn hình chính. Cấp quyền truy cập máy ảnh cho ứng dụng khi được yêu cầu, căn chỉnh khuôn mặt của bạn khớp vào khung elip hướng dẫn trên màn hình và bấm chụp. Hệ thống AI sẽ tự động phân tích các đường nét khuôn mặt của bạn trong vài giây để đưa ra luận giải.
              </Answer>
            </QuestionBlock>

            <QuestionBlock>
              <Question>Tại sao tôi không thể chụp ảnh hoặc ảnh chụp bị lệch?</Question>
              <Answer>
                Hãy chắc chắn rằng bạn đã cho phép ứng dụng truy cập Camera trong cài đặt của điện thoại. Để đạt kết quả căn chỉnh tốt nhất, vui lòng giữ điện thoại thẳng đứng, hướng thẳng khuôn mặt vào camera và đảm bảo khu vực xung quanh đủ ánh sáng.
              </Answer>
            </QuestionBlock>

            <QuestionBlock>
              <Question>Làm thế nào để yêu cầu xóa tài khoản và dữ liệu cá nhân?</Question>
              <Answer>
                Bạn có thể tự xóa tài khoản của mình bằng cách vào mục <strong>Cài đặt (Settings)</strong> ngay trong ứng dụng Huyền Cơ và nhấn nút <strong>"Xóa tài khoản" (Delete Account)</strong>. Hệ thống sẽ ngay lập tức vô hiệu hóa tài khoản của bạn. Ngoài ra, bạn có thể gửi một email yêu cầu đến địa chỉ <strong>jikeynguyentn@gmail.com</strong> với tiêu đề "Yêu Cầu Xóa Tài Khoản". Chúng tôi sẽ tiến hành xóa toàn bộ thông tin cá nhân của bạn trên hệ thống máy chủ trong vòng 30 ngày.
              </Answer>
            </QuestionBlock>
          </Section>

          <Section>
            <SectionTitle>3. Cam kết bảo mật thông tin hỗ trợ</SectionTitle>
            <Text>
              Tất cả các thông tin bạn cung cấp khi liên hệ hỗ trợ (bao gồm họ tên, email, mô tả lỗi) chỉ được sử dụng cho mục đích duy nhất là xử lý sự cố bạn gặp phải. Chúng tôi cam kết không chia sẻ hay cung cấp thông tin liên hệ này cho bất kỳ bên thứ ba nào.
            </Text>
          </Section>

          <Section>
            <Text style={{ fontStyle: 'italic', color: '#a9b3c1', marginTop: '30px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
              English Version Summary:
            </Text>
            <Text style={{ fontSize: '15px' }}>
              For support inquiries regarding the <strong>Huyền Cơ</strong> app, please email us directly at <strong>jikeynguyentn@gmail.com</strong>. We aim to respond to all inquiries within 24-48 business hours. To request account and data deletion, you can tap the "Delete Account" button in the app's settings screen, or email us with the subject line "Account Deletion Request".
            </Text>
          </Section>
        </SupportCard>
      </Container>
    </SupportSec>
  );
}

export default Support;
