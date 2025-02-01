import React, { useEffect, useState } from 'react';
import Loader from './Loader';
import { collection, getDocs, query, where, doc, updateDoc, orderBy, deleteField, setDoc, getDoc } from 'firebase/firestore';
import { db } from "../firebase";
import { FaRegHeart, FaHeart, FaCartArrowDown } from "react-icons/fa";
import { MdImageSearch } from "react-icons/md";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import { useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js';

const Main = ({ setProductsArray, filterData, searchID, setSearchID, currentPage, setCurrentPage, cardArray, nickname }) => {
  const [likedProducts, setLikedProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentPerPage] = useState(9);
  const lastIndexPage = currentPage * currentPerPage;
  const firstIndexPage = lastIndexPage - currentPerPage;
  const currentProducts = filterData.slice(firstIndexPage, lastIndexPage);
  const totalPages = filterData.length;
  const numbers = [];
  const navigate = useNavigate();
  const SECRET_KEY = "your-secret-key";
  const decryptData = (ciphertext) => {
    try {
      const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (err) {
      return null; // В случае ошибки возвращаем null
    }
  };
  const userId = decryptData(localStorage.getItem('nickname'));

  // Заполняем страницы
  for (let i = 1; i <= Math.ceil(totalPages / currentPerPage); i++) {
    numbers.push(i);
  }

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleScroll = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const next = () => {
    if (currentPage !== Math.ceil(totalPages / currentPerPage)) {
      setCurrentPage(currentPage + 1);
      setTimeout(() => {
        handleScroll();
      }, 50);
    }
  };

  const prev = () => {
    if (currentPage !== 1) {
      setCurrentPage(currentPage - 1);
      setTimeout(() => {
        handleScroll();
      }, 50);
    }
  };

  const handleNavigate = (id, item) => {
    navigate(`/product/${id}`, { state: { product: { ...item, liked: likedProducts[id] } } });
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const productRef = collection(db, "product");
        const q = query(productRef, where("In_stock", "==", true), orderBy("date", "desc"));
        const querySnapshot = await getDocs(q);

        const products = [];
        const likedState = {};

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          products.push(data);
          // Устанавливаем состояние лайка для текущего пользователя
          const currentUserLikeState = data.liked_by?.[nickname];
          likedState[data.search_id] = currentUserLikeState;
        });

        setLikedProducts(likedState); // Обновляем состояние лайков
        setProductsArray(products);
      } catch (err) {
        console.error("Ошибка при загрузке данных:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [nickname, setProductsArray]); // Запрос и обновление данных при изменении nickname

  useEffect(() => {
    const fetchBookmarks = async () => {
      if (!userId) return;
  
      try {
        const bookmarkDocRef = doc(db, "bookmarks", userId);
        const bookmarkSnap = await getDoc(bookmarkDocRef);
  
        if (bookmarkSnap.exists()) {
          const bookmarkedData = bookmarkSnap.data().liked || {};
          const likedState = {};
  
          // Заполняем состояние likedProducts
          for (const key in bookmarkedData) {
            if (bookmarkedData[key].liked_by === userId && bookmarkedData[key].liked) {
              likedState[key] = true;
            }
          }
  
          setLikedProducts(likedState);
        }
      } catch (error) {
        console.error("Ошибка загрузки лайков из bookmarks:", error);
      }
    };
  
    fetchBookmarks();
  }, [nickname]); // Загружаем лайки при изменении пользователя
  
  const toggleLike = async (searchId) => {
    if (!userId) {
      alert("Вы должны быть авторизованы для того, чтобы ставить лайки.");
      return;
    }
  
    if (likedProducts[searchId] === "loading") return;
  
    setLikedProducts((prevState) => ({
      ...prevState,
      [searchId]: prevState[searchId] === true ? false : true,
    }));
  
    try {
      // Получаем продукт с нужным search_id
      const productQuery = query(collection(db, "product"), where("search_id", "==", searchId));
      const querySnapshot = await getDocs(productQuery);
  
      if (querySnapshot.empty) {
        console.error("Продукт с таким search_id не найден");
        return;
      }
  
      const productDoc = querySnapshot.docs[0];
      const productDocRef = doc(db, "product", productDoc.id);
  
      // Загружаем текущие данные продукта
      const productSnap = await getDoc(productDocRef);
      if (!productSnap.exists()) {
        console.error("Документ продукта не найден");
        return;
      }
      const productData = productSnap.data();
  
      const isLiked = productData.liked_by?.[userId] === userId;
      const newLikeState = !isLiked;
      const current_date = new Date().toISOString();
  
      // Обновляем Firestore
      await updateDoc(productDocRef, {
        [`liked_by.${userId}`]: newLikeState ? userId : deleteField(),
        [`liked_date.${userId}`]: newLikeState ? current_date : deleteField(),
      });
  
      // Обновляем закладки (bookmarks)
      const bookmarkDocRef = doc(db, "bookmarks", userId);
      if (newLikeState) {
        await setDoc(bookmarkDocRef, {
          liked: {
            [searchId]: {
              search_id: searchId,
              liked_by: userId,
              liked: true,
            },
          },
        }, { merge: true });
      } else {
        await updateDoc(bookmarkDocRef, {
          [`liked.${searchId}`]: deleteField(),
        });
      }
  
    } catch (err) {
      console.error("Ошибка при обновлении данных в Firestore:", err);
      setLikedProducts((prevState) => ({
        ...prevState,
        [searchId]: !prevState[searchId],
      }));
    }
  };
  

  const Test = (id) => {
    setSearchID(id);
  };
  console.log(userId);

  return loading ? (
    <Loader />
  ) : (
    <div className='cards'>
      {filterData.length ? (
        <>
          <div className="cards-main">
            {currentProducts.map((item, index) => (
              <div className="card" key={index}>
                <div className="nav-card">
                  <div className="in-stock">
                    <p>ID: {item.search_id}</p>
                  </div>
                  {likedProducts[item.search_id] ? (
                    <FaHeart
                      style={{ color: "var(--main-color)" }}
                      onClick={() => toggleLike(item.search_id, item)}
                    />
                  ) : (
                    <FaRegHeart
                      style={{ color: "var(--any-text-color)" }}
                      onClick={() => toggleLike(item.search_id, item)}
                    />
                  )}
                </div>

                <div className="image">
                  <img src={item.image} alt={item.type_name} />
                  <div className="information">
                    <button onClick={() => handleNavigate(item.search_id, item)}>
                      <MdImageSearch />
                    </button>
                    <button>
                      <FaCartArrowDown onClick={() => Test(item.search_id)} />
                    </button>
                  </div>
                </div>
                <div className="infors">
                  <div className="name">
                    <h5>{item.name}</h5>
                  </div>
                  <div className="option">
                    <h5>{item.current_price} so'm</h5>
                    <p>{item.price} so'm</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="pages">
            <div className={`prev ${currentPage === 1 ? 'disabled-btn' : ''}`} onClick={prev}>
              <GrFormPrevious />
            </div>
            {numbers.map((item, index) => (
              <button
                className={currentPage === item ? 'active' : ''}
                onClick={() => {
                  paginate(item);
                  handleScroll();
                }}
                key={index}
              >
                {item}
              </button>
            ))}
            <div className={`prev ${currentPage === 1 ? 'disabled-btn' : ''}`} onClick={next}>
              <GrFormNext />
            </div>
          </div>
        </>
      ) : (
        <div className='dont-have'>
          <h1>Bunday maxsulot<br /> hozircha qushilmagan</h1>
        </div>
      )}
    </div>
  );
};

export default Main;
