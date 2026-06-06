import styled, { keyframes } from 'styled-components';

const floatAnim = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

export const InfoSec = styled.div`
    color: #fff;
    padding: 140px 0;
    position: relative;
    overflow: hidden;
    background: ${({lightBg, primary, useButtonBg}) => {
        if (useButtonBg) {
            return 'linear-gradient(180deg, #0A0D14 0%, #111625 100%)';
        }
        
        return lightBg 
            ? 'linear-gradient(180deg, #F8FAFC 0%, #EEF2F6 100%)' 
            : 'linear-gradient(180deg, #0A0D14 0%, #111625 100%)';
    }};

    &::before {
        content: '';
        position: absolute;
        width: 400px;
        height: 400px;
        background: ${({primary}) => primary === '#FDB913' ? 'rgba(253, 185, 19, 0.03)' : 'rgba(0, 163, 224, 0.03)'};
        border-radius: 50%;
        filter: blur(120px);
        top: 20%;
        left: ${({ imgStart }) => (imgStart ? '60%' : '10%')};
        pointer-events: none;
    }
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
  padding-bottom: 20px;

  @media (min-width: 480px) and (max-width: 1200px) {
    padding-bottom: 40px;
  }

  @media (min-width: 320px) and (max-width: 480px) {
    padding-bottom: 40px;  
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
    return lightTopLine ? '#94A3B8' : '#00A3E0';
  }};
  font-size: 14px;
  line-height: 16px;
  font-weight: 800;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 16px;
`;

export const Img = styled.img`
  padding-right: 0;
  border: 0;
  max-width: 100%;
  vertical-align: middle;
  display: inline-block;
  max-height: 480px;
  filter: drop-shadow(0 15px 30px rgba(0, 0, 0, 0.3));
  animation: ${floatAnim} 6s ease-in-out infinite;
`;

export const Heading = styled.h1`
  margin-bottom: 24px;
  font-size: 42px;
  line-height: 1.2;
  font-weight: 800;
  letter-spacing: -1px;
  color: ${({ lightText }) => (lightText ? '#F8FAFC' : '#0F172A')};
  
  @media screen and (max-width: 768px) {
    font-size: 32px;
  }
`;

export const Subtitle = styled.p`
  max-width: 460px;
  margin-bottom: 35px;
  font-size: 17px;
  line-height: 1.6;
  color: ${({ lightTextDesc }) => (lightTextDesc ? '#94A3B8' : '#475569')};
  white-space: pre-line;
`;

export const QRCodeWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 30px 0;
  padding: 30px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
`;

export const QRCodeImage = styled.img`
  width: 220px;
  height: 220px;
  border-radius: 16px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  margin-bottom: 20px;
  background: white;
  padding: 12px;
`;

export const QRCodeLabel = styled.p`
  font-size: 15px;
  font-weight: 600;
  color: ${({ lightText }) => (lightText ? '#E2E8F0' : '#1E293B')};
  margin: 5px 0;
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