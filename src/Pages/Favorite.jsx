import React, { useEffect, useState } from 'react';
import Loader from '../components/Loader';
import { collection, getDocs, query, where, doc, updateDoc, getDoc, deleteField, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { FaRegHeart, FaHeart, FaCartArrowDown } from 'react-icons/fa';
import { MdImageSearch } from 'react-icons/md';
import CryptoJS from "crypto-js";
import { useNavigate } from 'react-router-dom';

const Favorite = ({ searchID, setSearchID, cardArray }) => {
  const [likedProducts, setLikedProducts] = useState({});
  const [likedProductsArray, setLikedProductsArray] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const SECRET_KEY = "your-secret-key";
  
  const decryptData = (ciphertext) => {
    try {
      const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (err) {
      return null;
    }
  };

  const userId = localStorage.getItem('nickname');
  const userID = decryptData(userId);

  useEffect(() => {
    const fetchData = async () => {
      if (!userID) return;
      setLoading(true);
      try {
        const productRef = collection(db, "product");
        
        // Получаем все товары, лайкнутые пользователем
        const q = query(productRef, where(`liked_by.${userID}`, "==", userID));
        const querySnapshot = await getDocs(q);

        let products = [];
        let likedState = {};

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          products.push(data);

          if (data.liked_by?.[userID]) {
            likedState[data.search_id] = true;
          }
        });

        // Загружаем лайки из bookmarks
        const bookmarkDocRef = doc(db, "bookmarks", userID);
        const bookmarkSnap = await getDoc(bookmarkDocRef);

        if (bookmarkSnap.exists()) {
          const bookmarkedData = bookmarkSnap.data().liked || {};
          for (const key in bookmarkedData) {
            if (bookmarkedData[key].liked_by === userID && bookmarkedData[key].liked) {
              likedState[key] = true;
            }
          }
        }

        // Сортировка продуктов по времени лайка (liked_date)
        products = products.sort((a, b) => {
          const aLikedDate = a.liked_date?.[userID];
          const bLikedDate = b.liked_date?.[userID];
          
          // Если дата лайка есть, то сортируем по убыванию (последние лайки сверху)
          if (aLikedDate && bLikedDate) {
            return new Date(bLikedDate) - new Date(aLikedDate);
          }
          return 0;
        });

        setLikedProducts(likedState);
        setLikedProductsArray(products);
      } catch (err) {
        console.error("Ошибка загрузки данных:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userID]);

  const toggleLike = async (searchId, productData) => {
    if (!userID) {
      alert("Вы должны быть авторизованы для того, чтобы ставить лайки.");
      return;
    }

    if (likedProducts[searchId] === "loading") return;

    setLikedProducts((prevState) => ({
      ...prevState,
      [searchId]: prevState[searchId] ? false : true,
    }));

    try {
      const productQuery = query(collection(db, "product"), where("search_id", "==", searchId));
      const querySnapshot = await getDocs(productQuery);

      if (querySnapshot.empty) {
        console.error("Продукт с таким search_id не найден");
        return;
      }

      const productDoc = querySnapshot.docs[0];
      const productDocRef = doc(db, "product", productDoc.id);

      const newLikeState = !likedProducts[searchId];

      await updateDoc(productDocRef, {
        [`liked_by.${userID}`]: newLikeState ? userID : deleteField(),
        [`liked_date.${userID}`]: newLikeState ? new Date().toISOString() : deleteField()
      });

      const bookmarkDocRef = doc(db, "bookmarks", userID);

      if (newLikeState) {
        await setDoc(bookmarkDocRef, {
          liked: {
            [searchId]: {
              search_id: searchId,
              liked_by: userID,
              liked: true,
              liked_date: new Date().toISOString() // Сохраняем дату лайка в bookmarks
            }
          }
        }, { merge: true });
      } else {
        await updateDoc(bookmarkDocRef, {
          [`liked.${searchId}`]: deleteField(),
        });
      }
    } catch (err) {
      console.error("Ошибка при обновлении данных в Firestore: ", err);
      setLikedProducts((prevState) => ({
        ...prevState,
        [searchId]: !prevState[searchId],
      }));
    }
  };

  const handleNavigate = (id, item) => {
    navigate(`/product/${id}`, { state: { product: item } });
    cardArray.push(item);
  };

  const Test = (id) => {
    setSearchID(id);
  };

  return loading ? (
    <Loader />
  ) : (
    <div className='cards1'>
      {likedProductsArray.length ? (
        <div className="cards-main1">
          {likedProductsArray.map((item, index) => (
            <div className="card1" key={index}>
              <div className="nav-card1">
                <div className="in-stock1">
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
              <div className="image1">
                <img src={item.image} alt={item.type_name} />
                <div className="information1">
                  <button onClick={() => handleNavigate(item.search_id, item)}>
                    <MdImageSearch />
                  </button>
                  <button>
                    <FaCartArrowDown onClick={() => Test(item.search_id)} />
                  </button>
                </div>
              </div>
              <div className="infors1">
                <div className="name1">
                  <h5>{item.name}</h5>
                </div>
                <div className="option1">
                  <h5>{item.current_price} so'm</h5>
                  <p>{item.price} so'm</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className='dont-have1'>
          <h1>Siz hech qanday <br /> maxsulotni saqlamagansiz</h1>
        </div>
      )}
    </div>
  );
};

export default Favorite;
