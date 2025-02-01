import React from 'react';
import { useNavigate } from 'react-router-dom';

const Popup = ({ active_popup, setActive_popup }) => {
    const navigate = useNavigate();

    const closePopup = () => {
        setActive_popup(false);
    };

    return (
        <div 
            className='popup' 
            style={{ display: active_popup ? 'flex' : 'none' }} 
            onClick={closePopup}
        >
            <div 
                className="login-popup" 
                onClick={(e) => e.stopPropagation()}
            >
                <h1>Yana bir qadam ⚡ <br /> Maxsulotlarni saqlash uchun ro'yxattan o'ting</h1>
                <p>Pastdagi tugmani bosing va ro'yxattan o'ting</p>
                <div className="btns">
                    <button onClick={closePopup}>Chiqish</button>
                    <button onClick={() => {navigate('/login'); closePopup();}}>Kirish</button>
                </div>
            </div>
        </div>
    );
};

export default Popup;