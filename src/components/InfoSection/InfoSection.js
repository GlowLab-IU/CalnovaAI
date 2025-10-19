import React from 'react'
import {
    InfoSec, 
    InfoRow, 
    InfoColumn, 
    TextWrapper, 
    TopLine, 
    Heading, 
    Subtitle, 
    ImgWrapper, 
    Img,
    QRCodeWrapper,
    QRCodeImage,
    QRCodeLabel,
    AppStoreButtons,
    StoreButton,
    VideoWrapper,
    VideoIframe
} from './InfoSection.elements'
import { Container, Button } from '../../globalStyles'
import { Link } from 'react-router-dom'
import { FaGooglePlay, FaAppStoreIos } from 'react-icons/fa'

 const InfoSection = ({ 
    
    primary,
    lightBg,
    topLine,
    lightTopLine,
    lightText,
    lightTextDesc,
    headline,
    description,
    buttonLabel,
    img,
    alt,
    imgStart,
    start,
    buttonLink,
    useButtonBg,
    buttonColor,
    expoQR,
    androidLink,
    iosLink,
    demoVideo
}) => {
    return (
        <>
            <InfoSec lightBg={lightBg} primary={primary} useButtonBg={useButtonBg}>
                <Container>
                    <InfoRow imgStart={imgStart}>
                        <InfoColumn>
                            <TextWrapper>
                            <TopLine lightTopLine={lightTopLine} primary={primary}>{topLine}</TopLine>
                            <Heading lightText={lightText}>{headline}</Heading>
                            <Subtitle lightTextDesc={lightTextDesc}>{description}</Subtitle>
                            
                            {/* Hiển thị nút tải Expo Go nếu có links */}
                            {(androidLink || iosLink) && (
                                <AppStoreButtons>
                                    {androidLink && (
                                        <StoreButton 
                                            href={androidLink} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            platform="android"
                                        >
                                            <FaGooglePlay />
                                            <span>Tải trên Google Play</span>
                                        </StoreButton>
                                    )}
                                    {iosLink && (
                                        <StoreButton 
                                            href={iosLink} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            platform="ios"
                                        >
                                            <FaAppStoreIos />
                                            <span>Tải trên App Store</span>
                                        </StoreButton>
                                    )}
                                </AppStoreButtons>
                            )}
                            
                            {buttonLabel && !expoQR && !demoVideo && (
                            <Link to={buttonLink || '/sign-up'}>
                            <Button big fontBig primary={primary} buttonColor={buttonColor}>
                                {buttonLabel}
                            </Button>
                            </Link>
                            )}
                            </TextWrapper>
                        </InfoColumn>
                        <InfoColumn>
                            {/* Hiển thị QR code nếu có */}
                            {expoQR ? (
                                <QRCodeWrapper>
                                    <QRCodeLabel lightText={lightText}>Quét mã QR để mở ứng dụng</QRCodeLabel>
                                    <QRCodeImage src={expoQR} alt="QR Code" />
                                    <QRCodeLabel lightText={lightText}>Dùng ứng dụng Expo Go để quét</QRCodeLabel>
                                </QRCodeWrapper>
                            ) : demoVideo ? (
                                /* Hiển thị video demo nếu có */
                                <VideoWrapper>
                                    <VideoIframe
                                        src={demoVideo}
                                        title="Demo Video"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </VideoWrapper>
                            ) : (
                                /* Hiển thị hình ảnh mặc định */
                                <ImgWrapper start={start}>
                                    <Img src={img} alt={alt} />
                                </ImgWrapper>
                            )}
                        </InfoColumn>
                    </InfoRow>
                </Container>
            </InfoSec>
        </>
    )
}

export default InfoSection;