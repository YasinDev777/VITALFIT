import React, { useState } from 'react'
import Navbar from './components/Navbar'
import Main from './components/Main'
import MenuBar from './components/MenuBar'
import About from './Pages/About'
import Contact from './Pages/Contact'
import Favorite from './Pages/Favorite'
import Card from './Pages/Card'
import "./styles/App.scss"
import { Routes, Route, useLocation } from 'react-router-dom';
import Login from './Pages/Login'

const App = () => {
    const [productsArray, setProductsArray] = useState([])
    const [filterData, setFilterData] = useState(productsArray)
    const [searchText, setSearchText] = useState("")
    const [likeSearch, setLikeSearch] = useState("")
    const [searchID, setSearchID] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [isLogedIn, setIsLogedIn] = useState(false)
    const [cardArray] = useState([])
    const location = useLocation()
    const [nickname, setNickname] = useState('');
    console.log(nickname);
    
  return (
    <div className='app'>
            {location.pathname.includes('/product/') 
            || location.pathname.includes('/login') ? 
            null :
            <Navbar 
            setSearchText={setSearchText}
            searchText={searchText}
            likeSearch={likeSearch}
            setLikeSearch={setLikeSearch}
            setCurrentPage={setCurrentPage}
            />}
            <div className="main" style={location.pathname.includes('/product/') || location.pathname.includes('/login') ? {display: 'none'} : {display: 'flex'}}>
                <Routes>
                    <Route path='/' element={
                        <>
                            <MenuBar 
                            productsArray={productsArray}
                            setFilterData={setFilterData}
                            searchText={searchText}
                            likeSearch={likeSearch}
                            searchID={searchID}
                            setCurrentPage={setCurrentPage}
                            />
                            <Main 
                            setProductsArray={setProductsArray} 
                            filterData={filterData}
                            searchID={searchID}
                            setSearchID={setSearchID}
                            currentPage={currentPage}
                            setCurrentPage={setCurrentPage}
                            cardArray={cardArray}
                            nickname={nickname} 
                            setNickname={setNickname}
                            />
                        </>
                    } />
                    <Route path='/about' element={<About />} />
                    <Route path='/contact' element={<Contact />} />
                    <Route path='/bookmarks' element={<Favorite nickname={nickname} searchID={searchID} setSearchID={setSearchID} cardArray={cardArray} />}/>
                </Routes>
            </div>
            <Routes>
                <Route path="/product/:id" element={<Card cardArray={cardArray} />} />
                <Route path="/login" element={<Login nickname={nickname} setNickname={setNickname} />} />
            </Routes>
    </div>
  )
}

export default App