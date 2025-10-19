import React from 'react';
import {
  FaFacebook,
  FaInstagram,
  FaYoutube,
  FaTwitter,
  FaLinkedin
} from 'react-icons/fa';
import {
  FooterContainer,
  FooterLinksContainer,
  FooterLinksWrapper,
  FooterLinkItems,
  FooterLinkTitle,
  FooterLink,
  SocialMedia,
  SocialMediaWrap,
  SocialLogo,
  SocialLogoImg,
  WebsiteRights,
  SocialIcons,
  SocialIconLink
} from './Footer.elements';
import logo from '../../images/calnovaAI.png';

function Footer() {

  const date = new Date();

  return (
    <FooterContainer>
      <FooterLinksContainer>
        <FooterLinksWrapper>
          <FooterLinkItems>
            <FooterLinkTitle>Sản Phẩm</FooterLinkTitle>
            <FooterLink to='/ai-tuong-so'>AI Tướng Số</FooterLink>
            <FooterLink to='/ai-baby-cry'>AI Baby Cry</FooterLink>
            <FooterLink to='/ai-acne'>AI Nhận Diện Mụn</FooterLink>
            <FooterLink to='/products'>Tất cả sản phẩm</FooterLink>
          </FooterLinkItems>
        </FooterLinksWrapper>
        <FooterLinksWrapper>
          <FooterLinkItems>
            <FooterLinkTitle>Hỗ Trợ</FooterLinkTitle>
            <FooterLink to='/sign-up'>Liên hệ</FooterLink>
            <FooterLink to='/sign-up'>Hỗ trợ kỹ thuật</FooterLink>
            <FooterLink to='/services'>FAQ</FooterLink>
            <FooterLink to='/services'>Điều khoản dịch vụ</FooterLink>
          </FooterLinkItems>
          <FooterLinkItems>
            <FooterLinkTitle>Mạng Xã Hội</FooterLinkTitle>
            <FooterLink to='/'>Facebook</FooterLink>
            <FooterLink to='/'>LinkedIn</FooterLink>
            <FooterLink to='/'>Youtube</FooterLink>
            <FooterLink to='/'>Twitter</FooterLink>
          </FooterLinkItems>
        </FooterLinksWrapper>
      </FooterLinksContainer>
      <SocialMedia>
        <SocialMediaWrap>
          <SocialLogo to='/'>
            <SocialLogoImg src={logo} alt="CalnovaAI Logo" />
          </SocialLogo>
          <WebsiteRights>CalnovaAI © {date.getFullYear()} - Công nghệ AI tiên phong</WebsiteRights>
          <SocialIcons>
            <SocialIconLink href='/' target='_blank' aria-label='Facebook'>
              <FaFacebook />
            </SocialIconLink>
            <SocialIconLink href='/' target='_blank' aria-label='Instagram'>
              <FaInstagram />
            </SocialIconLink>
            <SocialIconLink href='/' target='_blank' aria-label='YouTube' >
              <FaYoutube />
            </SocialIconLink>
            <SocialIconLink href='/' target='_blank' aria-label='Twitter'>
              <FaTwitter />
            </SocialIconLink>
            <SocialIconLink href='/' target='_blank' aria-label='LinkedIn'>
              <FaLinkedin />
            </SocialIconLink>
          </SocialIcons>
        </SocialMediaWrap>
      </SocialMedia>
    </FooterContainer>
  );
}

export default Footer;