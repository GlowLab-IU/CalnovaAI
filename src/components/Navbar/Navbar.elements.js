import styled from 'styled-components';
import { Container } from '../../globalStyles'
import { FaMagento } from 'react-icons/fa'
import { Link } from 'react-router-dom'

export const Nav = styled.nav`
    background: #101522;
    height: 80px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.2rem;
    position: sticky;
    top: 0;
    z-index: 999;
`

export const NavbarContainer = styled(Container)`
    display: flex;
    justify-content: space-between;
    height: 80px;

    ${Container}
`

export const NavLogo = styled(Link)`
    color: #fff;
    justify-self: flex-start;
    cursor: pointer;
    text-decoration: none;
    font-size: 2rem;
    display: flex;
    align-items: center;
    font-weight: bold;
`

export const NavLogoImg = styled.img`
    height: 250px;
    width: auto;
    
    @media screen and (max-width: 960px) {
        height: 55px;
    }
`

export const NavIcon = styled(FaMagento)`
    margin-right: 0.5rem;

`

export const HamburgerIcon = styled.div`
    display: none;

    @media screen and (max-width: 960px) {
        display: block;
        position: absolute;
        top: 0;
        right: 0;
        transform: translate(-100%, 60%);
        font-size: 1.8rem;
        cursor: pointer;   
    }
`

export const NavMenu = styled.ul`
    display: flex;
    align-items: center;
    list-style: none;
    text-align: center;
    
  
    @media screen and (max-width: 960px) {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 90vh;
        position: absolute;
        top: 80px;
        opacity: 1;
        transition: all 0.5s ease;
        background-color: #101522;
        left: ${({ click }) => (click ? 0 : '-100%')};
    }
`
export const NavItem = styled.li`
    height: 80px;
    border-bottom: 2px solid transparent;
    border-radius: 2px;
    position: relative;

    &:hover {
        border-bottom: 4px solid #00A3E0;
    }

    @media screen and (max-width: 960px) {
        width: 100%;

        &:hover {
            border-bottom: none;
        }
    }

`

export const NavLinks = styled(Link)`
    color: #fff;
    display: flex;
    align-items: center;
    text-decoration: none;
    padding: 0.5rem 1rem;
    height: 100%;
    

    @media screen and (max-width: 960px) {
        text-align: center;
        padding: 2rem;
        width: 100%;
        display: table;

        &:hover {
            color: #00A3E0;
            transition: all 0.3s ease;
        }
    }
`

export const NavLinksDropdown = styled.span`
    color: #fff;
    display: flex;
    align-items: center;
    text-decoration: none;
    padding: 0.5rem 1rem;
    height: 100%;
    cursor: pointer;
    

    @media screen and (max-width: 960px) {
        text-align: center;
        padding: 2rem;
        width: 100%;
        display: table;

        &:hover {
            color: #00A3E0;
            transition: all 0.3s ease;
        }
    }
`

export const DropdownMenu = styled.div`
    display: none;
    position: absolute;
    top: 80px;
    left: 0;
    background: #101522;
    min-width: 220px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    z-index: 1000;

    ${NavItem}:hover & {
        display: block;
    }

    @media screen and (max-width: 960px) {
        position: relative;
        top: 0;
        width: 100%;
        box-shadow: none;
        display: ${({ isOpen }) => (isOpen ? 'block' : 'none')};
    }
`

export const DropdownLink = styled(Link)`
    color: #fff;
    padding: 12px 16px;
    text-decoration: none;
    display: block;
    transition: all 0.3s ease;

    &:hover {
        background: #00A3E0;
        color: #fff;
    }

    @media screen and (max-width: 960px) {
        text-align: center;
        padding: 1.5rem;
    }
`

export const NavItemBtn = styled.li`
  @media screen and (max-width: 960px) {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 120px;
  }
`;

export const NavBtnLink = styled(Link)`
  display: flex;
  justify-content: center;
  align-items: center;
  text-decoration: none;
  padding: 8px 16px;
  height: 100%;
  width: 100%;
  border: none;
  outline: none;
`;