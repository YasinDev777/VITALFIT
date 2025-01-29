import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FaPhoneAlt, FaSearch, FaRegHeart } from "react-icons/fa";
import { HiMenuAlt2 } from "react-icons/hi";
import { IoCloseSharp, IoArrowBackCircleSharp, IoArrowForwardCircle } from "react-icons/io5";

const Navbar = ({
    setSearchText,
    searchText,
    setCurrentPage
}) => {
    const location = useLocation()    
    const navigate = useNavigate()
    const [open, setOpen] = useState(false)

    useEffect(() =>{
        let body = document.querySelector('body')
        if(open === true) body.style.overflow = 'hidden'
        else body.style.overflow = 'auto'
    }, [open])

  return (
    <div className='navbar'>
        <div className="nav-top">
            <div className="nav">
                <div className="logo-info">
                    <div className="logo">
                        <img src="/logo.jpg" alt="logo" />
                        <p>VITAL<span>FIT</span></p>
                    </div>
                    <div className="logo-tex">
                        <p>yuqori sifat,</p>
                        <p>kuchli tanaga oson yo'l</p>
                    </div>
                </div>
                <div className="contact-info">
                    <div className="contact-tex">
                        <p>
                        Telegram: <span>
                                <Link to="https://t.me/azimxon004" target="_blank">
                                    @azimxon004
                                </ Link>
                            </span>
                        </p>
                        <p>Telefon raqam: <span> +998 93 104-00-04</span></p>
                    </div>
                    <div className="contact-logo">
                        <FaPhoneAlt />
                    </div>
                </div>
            </div>
        </div>
        <div className="nav-bottom">
            <div className="burger-div">
                <IoArrowBackCircleSharp className='back' style={window.innerWidth < 700 && open === false && location.pathname !== '/' ? {display: 'block'} : {display: 'none'}} onClick={() => navigate('/')} />
                <div className="burger" onClick={() => setOpen(!open)}>
                    {
                        open === false ? <HiMenuAlt2 /> : <IoCloseSharp />
                    }
                </div>
            </div>
            <div className={`links ${open === true ? 'active-links' : ''}`}>
                <Link to="/" className={location.pathname === "/" ? `active-link` : ""} onClick={() => setOpen(false)}>Bosh Sahifa</Link>
                <Link to="/about" className={location.pathname === "/about" ? `active-link` : ""} onClick={() => setOpen(false)}>Biz Haqimizda</Link>
                <Link to="/contact" className={location.pathname === "/contact" ? `active-link` : ""} onClick={() => setOpen(false)}>Aloqa</Link>
            </div>
            <div className="related-filter">
                <div className="input-div">
                   <input 
                    type="text"
                    value={searchText}
                    onChange={(e)=>{
                    setCurrentPage(1)
                    setSearchText(e.target.value)
                    navigate("/", {replace: true})
                }}
                    /> 
                    <FaSearch />
                </div>
                <Link to="bookmarks">
                    <FaRegHeart className={location.pathname === "/bookmarks" ? "active-svg" : ""} />
                </Link>
                <Link to="login">
                    <button><p>Kirish</p> <IoArrowForwardCircle /></button>
                </Link>
            </div>
        </div>
    </div>
  )
}

export default Navbar