import React from 'react';
import styled from 'styled-components';
import { Container } from '../../globalStyles';

const PrivacySec = styled.div`
  padding: 120px 0 80px 0;
  background: #101522;
  color: #fff;
  min-height: 100vh;
`;

const PolicyCard = styled.div`
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
  margin-bottom: 30px;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
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

const BulletList = styled.ul`
  margin-left: 20px;
  margin-bottom: 20px;
  color: #d1d9e6;
`;

const BulletItem = styled.li`
  font-size: 15px;
  line-height: 1.6;
  margin-bottom: 8px;
`;

function PrivacyPolicy() {
  return (
    <PrivacySec>
      <Container>
        <PolicyCard>
          <MainTitle>Chính Sách Bảo Mật</MainTitle>
          <LastUpdated>Cập nhật lần cuối: Ngày 6 tháng 6 năm 2026</LastUpdated>

          <Section>
            <Text>
              Chào mừng bạn đến với ứng dụng di động <strong>Huyền Cơ</strong> (sau đây gọi tắt là "Ứng dụng"), được phát triển và vận hành bởi <strong>CalnovaAI</strong> (sau đây gọi là "chúng tôi"). Chúng tôi cam kết bảo vệ quyền riêng tư và thông tin cá nhân của người dùng.
            </Text>
            <Text>
              Chính sách bảo mật này giải thích cách chúng tôi thu thập, sử dụng, tiết lộ và bảo vệ dữ liệu cá nhân của bạn khi bạn sử dụng Ứng dụng của chúng tôi, tuân thủ theo các quy định và chính sách của Google Play Store.
            </Text>
          </Section>

          <Section>
            <SectionTitle>1. Thu thập Thông tin và Dữ liệu nhạy cảm</SectionTitle>
            <Text>
              Ứng dụng Huyền Cơ cung cấp các dịch vụ liên quan đến phân tích tướng diện (nhận diện khuôn mặt) và xem chỉ tay (phân tích chỉ tay) dựa trên công nghệ Trí tuệ Nhân tạo (AI). Để thực hiện các chức năng này, chúng tôi cần thu thập một số dữ liệu nhạy cảm như sau:
            </Text>
            <BulletList>
              <BulletItem>
                <strong>Quyền truy cập Camera và Hình ảnh:</strong> Ứng dụng yêu cầu quyền sử dụng máy ảnh của thiết bị để chụp ảnh khuôn mặt hoặc bàn tay của bạn. Hình ảnh này chỉ được sử dụng cho mục đích phân tích tướng học.
              </BulletItem>
              <BulletItem>
                <strong>Dữ liệu sinh trắc học không định danh:</strong> Các bức ảnh chụp khuôn mặt hoặc bàn tay được chúng tôi xử lý thông qua mô hình học sâu (Deep Learning) để trích xuất các điểm mốc (keypoints). Chúng tôi không lưu trữ hoặc sử dụng các thông tin này để định danh hoặc xác thực danh tính cá nhân ngoài mục đích đưa ra các luận giải phong thủy/tử vi.
              </BulletItem>
              <BulletItem>
                <strong>Thông tin hồ sơ cá nhân:</strong> Họ tên, giới tính, ngày tháng năm sinh do bạn tự nguyện cung cấp để hệ thống thiết lập lá số tử vi và cá nhân hóa kết quả phân tích.
              </BulletItem>
            </BulletList>
          </Section>

          <Section>
            <SectionTitle>2. Cách thức Xử lý và Truyền tải Dữ liệu</SectionTitle>
            <Text>
              Chúng tôi hiểu rằng hình ảnh cá nhân là dữ liệu vô cùng nhạy cảm. Vì vậy, quy trình xử lý dữ liệu của chúng tôi được thiết lập như sau:
            </Text>
            <BulletList>
              <BulletItem>
                Mọi hình ảnh khi gửi lên hệ thống phân tích AI đều được mã hóa bằng giao thức bảo mật <strong>HTTPS (SSL/TLS)</strong> an toàn.
              </BulletItem>
              <BulletItem>
                Chúng tôi sử dụng dịch vụ lưu trữ đám mây bảo mật để xử lý phân tích tạm thời. Sau khi quá trình phân tích hoàn tất và kết quả được gửi về thiết bị của bạn, dữ liệu hình ảnh gốc sẽ được xóa tự động khỏi máy chủ xử lý tạm thời của chúng tôi theo chính sách dọn dẹp dữ liệu định kỳ để đảm bảo quyền riêng tư.
              </BulletItem>
            </BulletList>
          </Section>

          <Section>
            <SectionTitle>3. Lưu trữ và Bảo mật Thông tin</SectionTitle>
            <BulletList>
              <BulletItem>
                <strong>Thông tin tài khoản:</strong> Mọi token đăng nhập và khóa xác thực được lưu trữ an toàn trong vùng nhớ mã hóa của thiết bị di động (sử dụng <em>Expo SecureStore</em> trên thiết bị của bạn) để ngăn chặn các truy cập trái phép.
              </BulletItem>
              <BulletItem>
                Chúng tôi áp dụng các biện pháp kỹ thuật và tổ chức phù hợp để bảo vệ dữ liệu cá nhân khỏi bị mất mát, lạm dụng hoặc truy cập trái phép. Tuy nhiên, xin lưu ý rằng không có phương thức truyền tải qua Internet hoặc lưu trữ điện tử nào là bảo mật 100%.
              </BulletItem>
            </BulletList>
          </Section>

          <Section>
            <SectionTitle>4. Quyền của Người dùng đối với Dữ liệu cá nhân (User Rights & Data Control)</SectionTitle>
            <Text>
              Bạn có toàn quyền kiểm soát thông tin cá nhân của mình. Cụ thể:
            </Text>
            <BulletList>
              <BulletItem>
                Bạn có thể cập nhật, chỉnh sửa thông tin hồ sơ (Họ tên, ngày sinh, giới tính) bất kỳ lúc nào ngay trong phần cài đặt của Ứng dụng.
              </BulletItem>
            </BulletList>
          </Section>

          <Section id="delete-account">
            <SectionTitle>5. Yêu Cầu Xóa Tài Khoản và Dữ Liệu (Account & Data Deletion Request)</SectionTitle>
            <Text>
              Người dùng ứng dụng <strong>Huyền Cơ</strong> có quyền yêu cầu xóa tài khoản và mọi dữ liệu liên quan bất kỳ lúc nào.
            </Text>
            <Text>
              Để gửi yêu cầu xóa tài khoản, bạn có thể thực hiện theo một trong các cách sau:
            </Text>
            <BulletList>
              <BulletItem>
                Sử dụng nút <strong>"Xóa tài khoản" (Delete Account)</strong> trong phần Cài đặt (Settings) của ứng dụng.
              </BulletItem>
              <BulletItem>
                Gửi email yêu cầu đến địa chỉ hỗ trợ của chúng tôi: <strong>jikeynguyentn@gmail.com</strong> với tiêu đề "Yêu Cầu Xóa Tài Khoản" (Account Deletion Request).
              </BulletItem>
            </BulletList>
            <Text style={{ fontStyle: 'italic', color: '#a9b3c1', marginTop: '10px' }}>
              English Version:
            </Text>
            <Text>
              Users of the <strong>Huyền Cơ</strong> app can request to delete their account and associated data at any time. To request account deletion, you can either use the "Delete Account" button inside the app's settings, or send an email to <strong>jikeynguyentn@gmail.com</strong> with the subject "Account Deletion Request". All associated personal data (including profile info, face scanning history, and chat logs) will be completely and permanently wiped from our servers within 30 days.
            </Text>
          </Section>

          <Section>
            <SectionTitle>6. Chia sẻ Thông tin với Bên thứ ba</SectionTitle>
            <Text>
              Chúng tôi cam kết <strong>KHÔNG</strong> bán, trao đổi hoặc cho thuê dữ liệu cá nhân hay hình ảnh của bạn cho bất kỳ bên thứ ba nào vì mục đích thương mại hoặc quảng cáo. Dữ liệu chỉ được truyền tải đến các nhà cung cấp dịch vụ máy chủ đám mây đáng tin cậy của chúng tôi nhằm mục đích xử lý tính toán AI cho ứng dụng.
            </Text>
          </Section>

          <Section>
            <SectionTitle>7. Thay đổi đối với Chính sách Bảo mật này</SectionTitle>
            <Text>
              Chúng tôi có thể cập nhật Chính sách Bảo mật này theo thời gian để phù hợp với những thay đổi về dịch vụ hoặc yêu cầu pháp lý của Google Play Store. Khi có thay đổi, chúng tôi sẽ cập nhật ngày "Cập nhật lần cuối" ở đầu trang này. Chúng tôi khuyến khích bạn xem lại chính sách này định kỳ để luôn nắm rõ quyền lợi của mình.
            </Text>
          </Section>

          <Section>
            <SectionTitle>8. Thông tin Liên hệ</SectionTitle>
            <Text>
              Nếu bạn có bất kỳ câu hỏi, thắc mắc hoặc yêu cầu nào liên quan đến Chính sách Bảo mật này hoặc cách xử lý dữ liệu của Huyền Cơ, vui lòng liên hệ với chúng tôi tại:
            </Text>
            <Text style={{ fontWeight: '600' }}>
              Email hỗ trợ: jikeynguyentn@gmail.com<br />
              Đơn vị phát triển: CalnovaAI
            </Text>
          </Section>
        </PolicyCard>
      </Container>
    </PrivacySec>
  );
}

export default PrivacyPolicy;
