import styled from 'styled-components';


export const InfoSec = styled.div`
    color: #fff;
    padding: 160px 0;
    background: ${({lightBg, primary, useButtonBg}) => {
        // Nếu useButtonBg được set, dùng màu của button làm background
        if (useButtonBg) {
            return primary ? '#00A3E0' : '#00A3E0';
        }
        
        if (primary) {
            // Nếu có màu primary, trả về màu nhạt của nó cho lightBg hoặc màu tối cho dark
            if (lightBg) {
                // Tạo màu nền nhạt dựa trên primary color
                if (primary === '#FDB913') return '#FFF9E6'; // Vàng nhạt
                if (primary === '#4A90E2') return '#E3F2FD'; // Xanh dương nhạt
                if (primary === '#FF69B4') return '#FFE4F0'; // Hồng nhạt
                return '#fff';
            } else {
                return '#101522';
            }
        }
        return lightBg ? '#fff' : '#101522';
    }};
`

export const InfoRow = styled.div`
  display: flex;
  margin: 0 -15px -15px -15px;
  flex-wrap: wrap;
  align-items: center;
  flex-direction: ${({ imgStart }) => (imgStart ? 'row-reverse' : 'row')};
`;

export const InfoColumn = styled.div`
  margin-bottom: 15px;
  padding-right: 15px;
  padding-left: 15px;
  flex: 1;
  max-width: 50%;
  flex-basis: 50%;

  @media (min-width: 480px) and (max-width: 1200px) {
    max-width: 100%;
    flex-basis: 100%;
    display: flex;
    justify-content: center;
  }

  @media (min-width: 320px) and (max-width: 480px) {
    max-width: 100%;
    flex-basis: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
`;

export const TextWrapper = styled.div`
  max-width: 540px;
  padding-top: 0;
  padding-bottom: 60px;

  @media (min-width: 480px) and (max-width: 1200px) {
    padding-bottom: 65px;
  }

  @media (min-width: 320px) and (max-width: 480px) {
    padding-bottom: 65px;  
  }
`;

export const ImgWrapper = styled.div`
  max-width: 555px;
  display: flex;
  justify-content: ${({ start }) => (start ? 'flex-start' : 'flex-end')};
`;

export const TopLine = styled.div`
  color: ${({ lightTopLine, primary }) => {
    if (primary) return primary;
    return lightTopLine ? '#a9b3c1' : '#00A3E0';
  }};
  font-size: 18px;
  line-height: 16px;
  font-weight: 700;
  letter-spacing: 1.4px;
  margin-bottom: 16px;
`;

export const Img = styled.img`
  padding-right: 0;
  border: 0;
  max-width: 100%;
  vertical-align: middle;
  display: inline-block;
  max-height: 500px;
`;

export const Heading = styled.h1`
  margin-bottom: 24px;
  font-size: 48px;
  line-height: 1.1;
  font-weight: 600;
  color: ${({ lightText }) => (lightText ? '#f7f8fa' : '#1c2237')};
`;

export const Subtitle = styled.p`
  max-width: 440px;
  margin-bottom: 35px;
  font-size: 18px;
  line-height: 24px;
  color: ${({ lightTextDesc }) => (lightTextDesc ? '#a9b3c1' : '#1c2237')};
  white-space: pre-line;
`;

export const QRCodeWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 30px 0;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  backdrop-filter: blur(10px);
`;

export const QRCodeImage = styled.img`
  width: 250px;
  height: 250px;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  margin-bottom: 15px;
  background: white;
  padding: 10px;
`;

export const QRCodeLabel = styled.p`
  font-size: 16px;
  font-weight: 600;
  color: ${({ lightText }) => (lightText ? '#f7f8fa' : '#1c2237')};
  margin: 10px 0 5px 0;
`;

export const AppStoreButtons = styled.div`
  display: flex;
  gap: 15px;
  margin: 20px 0;
  flex-wrap: wrap;
  
  @media screen and (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

export const StoreButton = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  background: ${({ platform }) => (platform === 'android' ? '#3DDC84' : '#000')};
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  }

  svg {
    margin-right: 8px;
    font-size: 24px;
  }
`;

export const VideoWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 100%;
  height: 100vh;
  min-height: 800px;
  margin: 20px auto;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  
  @media screen and (max-width: 768px) {
    height: 80vh;
    min-height: 600px;
  }
`;

export const VideoIframe = styled.iframe`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
`;

export const PhoneEmulatorWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 500px;
  height: 750px;
  margin: 20px auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  
  @media screen and (max-width: 768px) {
    height: 650px;
    max-width: 100%;
  }
`;

export const PhoneEmulatorIframe = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
`;

export const AppLinkButton = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 14px 32px;
  background: ${({ primary }) => primary || '#FDB913'};
  color: white;
  text-decoration: none;
  border-radius: 50px;
  font-weight: 700;
  font-size: 16px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  white-space: nowrap;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 25px rgba(0, 0, 0, 0.3);
    filter: brightness(1.1);
  }

  svg {
    margin-right: 10px;
    font-size: 20px;
  }
  
  @media screen and (max-width: 768px) {
    padding: 12px 24px;
    font-size: 14px;
    
    svg {
      font-size: 18px;
    }
  }
`;