import React, { useState } from 'react';
import { IoArrowBackCircleSharp } from 'react-icons/io5';
import { Link, useNavigate } from 'react-router-dom';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const Login = ({ nickname, setNickname }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (nickname.length > 17) {
      setError('Имя не может быть длиннее 17 символов');
      return;
    }
  
    try {
      const q = query(collection(db, 'users'), where('nickname', '==', nickname));
      const existingUser = await getDocs(q);
  
      if (!existingUser.empty) {
        setError('Пользователь с таким именем уже существует');
        return;
      }
  
      await addDoc(collection(db, 'users'), {
        nickname,
        password,
        createdAt: new Date().toISOString(),
      });
  
      // Сохраняем nickname в localStorage
      localStorage.getItem('nickname')
      localStorage.setItem('nickname', nickname);
      setNickname(nickname);  // Устанавливаем в состояние
      navigate('/');
    } catch (err) {
      setError('Ошибка регистрации, попробуйте снова');
      console.error(err);
    }
  };
  
  
  return (
    <div className='login'>
      <div className="login-wrapper">
        <div className="login-div">
          <div className="diiv">
            <div className="backing">
              <Link to='/'>
                <IoArrowBackCircleSharp />
              </Link>
            </div>
            <h1>KIRISH</h1>
          </div>
          <div className="inputs">
            <input
              type="text"
              placeholder="Nickname kiriting"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
            <input
              type="password"
              placeholder="Parolni kiriting"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleRegister}>Tasdiqlash</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
