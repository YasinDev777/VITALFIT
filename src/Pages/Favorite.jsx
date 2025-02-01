import React, { useEffect, useState } from 'react';
import Loader from '../components/Loader';
import { collection, getDocs, query, where, doc, updateDoc, getDoc, deleteField, setDoc, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { FaRegHeart, FaHeart, FaCartArrowDown } from 'react-icons/fa';
import { MdImageSearch } from 'react-icons/md';
import CryptoJS from "crypto-js";
import { useNavigate } from 'react-router-dom';

const Favorite = ({ searchID, setSearchID, cardArray, nickname }) => {
  const [likedProducts, setLikedProducts] = useState({});
  const [likedProductsArray, setLikedProductsArray] = useState([]);
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const SECRET_KEY = "your-secret-key";
  const decryptData = (ciphertext) => {
    try {
      const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (err) {
      return null; // В случае ошибки возвращаем null
    }
  };

  const userId = localStorage.getItem('nickname')
  const userID = decryptData(userId)

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const productRef = collection(db, "product");
        const q = query(productRef, where(`liked_by.${userId}`, "==", userId), orderBy(`liked_date.${userID}`, 'desc'));
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
        setLikedProductsArray(products);
      } catch (err) {
        console.error("Ошибка при загрузке данных:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [nickname]);

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
  }, [nickname]);


  const toggleLike = async (searchId, productData) => {
    if (!userId) {
      alert("Вы должны быть авторизованы для того, чтобы ставить лайки.");
      return;
    }

    // Проверяем, не идёт ли уже запрос, чтобы избежать спама
    if (likedProducts[searchId] === "loading") return;

    // Предварительное обновление UI (оптимистичное обновление)
    setLikedProducts((prevState) => ({
      ...prevState,
      [searchId]: prevState[searchId] === true ? false : true, // Инвертируем лайк
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

      const isLiked = productData.liked_by && productData.liked_by[userId] === userId;
      const newLikeState = !isLiked;

      await updateDoc(productDocRef, {
        [`liked_by.${userId}`]: newLikeState ? userId : deleteField(),
      });

      const bookmarkDocRef = doc(db, "bookmarks", userId);

      if (newLikeState) {
        await setDoc(bookmarkDocRef, {
          liked: {
            [searchId]: {
              search_id: searchId,
              liked_by: userID,
              liked: true
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

      // Откатываем лайк в случае ошибки
      setLikedProducts((prevState) => ({
        ...prevState,
        [searchId]: !prevState[searchId],
      }));
    }
  };
  const handleNavigate = (id, item) => {
    navigate(`/product/${id}`, { state: { product: item } });
    cardArray.push(item)
  }

  const Test = (id) => {
    setSearchID(id)
  }

  return (
    loading ? (
      <Loader />
    ) : (
      <div className='cards1'>
        {likedProductsArray.length ? (
          <div className="cards-main1">
            {
              likedProductsArray.map((item, index) => (
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
              ))
            }
          </div>
        ) : (
          <div className='dont-have1'>
            <h1>Siz hech qanday <br /> maxsulotni saqlamagansiz</h1>
          </div>
        )
        }
      </div>
    )
  );
};

export default Favorite;