import React from 'react'
import { useLocation } from 'react-router-dom'

const Loader = () => {

  const location = useLocation()

  return (
    <div className="container" style={location.pathname.includes('/product/') ? {height: '100dvh'} : {height: '60dvh'}}>
        <span className='loader'></span>
    </div>
  )
}

export default Loader