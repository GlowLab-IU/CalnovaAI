import React, {useState, useEffect} from 'react'
import { Nav, 
    NavbarContainer, 
    NavLogo, 
    NavLogoImg,
    HamburgerIcon,
    NavMenu,
    NavItem,
    NavLinks,
    NavLinksDropdown,
    DropdownMenu,
    DropdownLink,
    NavItemBtn,
    NavBtnLink
 } from './Navbar.elements'
import { FaTimes, FaBars, FaChevronDown } from 'react-icons/fa';
import { IconContext } from 'react-icons/lib'
import { Button } from '../../globalStyles';
import logo from '../../images/calnovaAI.png';


function Navbar() {

    const [click, setClick] = useState(false);
    const [button, setButton] = useState(true);
    const [dropdown, setDropdown] = useState(false);

    // eslint-disable-next-line
    const [homeClick, setHomeClick] = useState(false);
    // eslint-disable-next-line
    const [productsClick, setProductsClick] = useState(false);

    const handleHomeClick = () => {
        setHomeClick(true);
        setProductsClick(false);
    }
    
    const handleProductsClick = () => {
        setHomeClick(false);
        setProductsClick(true);
    }

    const handleClick = () =>  setClick(!click);
    
    const closeMobileMenu = () => {
        setClick(false);
        setDropdown(false);
    }

    const toggleDropdown = () => {
        setDropdown(!dropdown);
    }

    const showButton = () => {
        // so if the screensize is <= 960px then set button state to false
        if(window.innerwidth <= 960) {
            setButton(false)
        } else {
            setButton(true)
        }
    }

    useEffect(() => {
        showButton();
    }, [])

    window.addEventListener('resize', showButton);

    return (
        <>
        <IconContext.Provider value={{ color: '#fff' }}>
            <Nav>
                <NavbarContainer>
                    <NavLogo to='/'> 
                        <NavLogoImg src={logo} alt="CalnovaAI Logo" />
                    </NavLogo>
                    <HamburgerIcon onClick={handleClick}>
                        {click ? <FaTimes /> : <FaBars />}
                    </HamburgerIcon>
                    <NavMenu onClick={handleClick} click={click} >
                        <NavItem onClick={handleHomeClick} homeClick={homeClick}>
                            <NavLinks to='/' onClick={closeMobileMenu}>
                                Trang Chủ
                            </NavLinks>
                        </NavItem>
                    
                    
                    
                        <NavItem onClick={handleProductsClick} productsClick={productsClick}>
                            <NavLinksDropdown onClick={window.innerWidth <= 960 ? toggleDropdown : null}>
                                Ứng Dụng {window.innerWidth <= 960 && <FaChevronDown style={{marginLeft: '5px', fontSize: '12px'}} />}
                            </NavLinksDropdown>
                            <DropdownMenu isOpen={dropdown}>
                                <DropdownLink to='/products' onClick={closeMobileMenu}>
                                    Tất Cả 
                                </DropdownLink>
                                <DropdownLink to='/ai-tuong-so' onClick={closeMobileMenu}>
                                    AI Tướng Số
                                </DropdownLink>
                                <DropdownLink to='/ai-baby-cry' onClick={closeMobileMenu}>
                                    AI Baby Cry
                                </DropdownLink>
                                {/* <DropdownLink to='/ai-acne' onClick={closeMobileMenu}>
                                    AI Nhận Diện Mụn
                                </DropdownLink> */}
                            </DropdownMenu>
                        </NavItem>

                        <NavItemBtn >
                            {button ? (
                                <NavBtnLink to='/sign-up'>
                                    <Button primary>Liên Hệ</Button>
                                </NavBtnLink>
                            ) : (
                                <NavBtnLink to='/sign-up'>
                                    <Button onClick={closeMobileMenu} fontBig primary>SIGN UP</Button>
                                </NavBtnLink>
                            )}
                            
                        </NavItemBtn>
                    </NavMenu>
                </NavbarContainer>
            </Nav>
        </IconContext.Provider>    
        </>
    )
}

export default Navbar
