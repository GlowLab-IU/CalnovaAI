import styled, { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap');

* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    font-family: 'Outfit', 'Inter', sans-serif;
}
body {
    background: #0A0D14;
    overflow-x: hidden;
}
* {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 163, 224, 0.5) transparent;
}
*::-webkit-scrollbar {
  width: 6px;
}
*::-webkit-scrollbar-track {
  background: transparent;
}
*::-webkit-scrollbar-thumb {
  background: rgba(0, 163, 224, 0.3);
  border-radius: 20px;
  border: transparent;
  &:hover {
    background: rgba(0, 163, 224, 0.5);
  }
}
`;


export const Container = styled.div`
  z-index: 1;
  width: 100%;
  max-width: 1300px;
  margin-right: auto;
  margin-left: auto;
  padding-right: 50px;
  padding-left: 50px;
  @media screen and (max-width: 991px) {
    padding-right: 30px;
    padding-left: 30px;
  }
`;

export const Button = styled.button`
  border-radius: 50px;
  background: ${({ primary, buttonColor }) => {
    if (buttonColor) return buttonColor;
    return primary ? 'linear-gradient(135deg, #00A3E0 0%, #0077B6 100%)' : 'linear-gradient(135deg, #FDB913 0%, #E09F00 100%)';
  }};
  white-space: nowrap;
  padding: ${({ big }) => (big ? '16px 48px' : '10px 24px')};
  color: #fff;
  font-weight: 600;
  font-size: ${({ fontBig }) => (fontBig ? '18px' : '15px')};
  outline: none;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 15px ${({ primary }) => (primary ? 'rgba(0, 163, 224, 0.3)' : 'rgba(253, 185, 19, 0.3)')};
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px ${({ primary }) => (primary ? 'rgba(0, 163, 224, 0.4)' : 'rgba(253, 185, 19, 0.4)')};
    filter: brightness(1.1);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 10px ${({ primary }) => (primary ? 'rgba(0, 163, 224, 0.2)' : 'rgba(253, 185, 19, 0.2)')};
  }

  @media screen and (max-width: 960px) {
    width: 100%;
  }
`;


export default  GlobalStyles;   