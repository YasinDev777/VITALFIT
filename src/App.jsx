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

const App = () => {
    const [productsArray, setProductsArray] = useState([])
    const [filterData, setFilterData] = useState(productsArray)
    const [searchText, setSearchText] = useState("")
    const [likeSearch, setLikeSearch] = useState("")
    const [searchID, setSearchID] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [cardArray] = useState([])
    const location = useLocation()

  return (
    <div className='app'>
            {location.pathname.includes('/product/') ? 
            null :
            <Navbar 
            setSearchText={setSearchText}
            searchText={searchText}
            likeSearch={likeSearch}
            setLikeSearch={setLikeSearch}
            setCurrentPage={setCurrentPage}
            />}
            <div className="main" style={location.pathname.includes('/product/') ? {display: 'none'} : {display: 'flex'}}>
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
                            />
                        </>
                    } />
                    <Route path='/about' element={<About />} />
                    <Route path='/contact' element={<Contact />} />
                    <Route path='/bookmarks' element={<Favorite searchID={searchID} setSearchID={setSearchID} cardArray={cardArray} />}/>
                </Routes>
            </div>
            <Routes>
                <Route path="/product/:id" element={<Card cardArray={cardArray} />} />
            </Routes>
    </div>
  )
}

export default App