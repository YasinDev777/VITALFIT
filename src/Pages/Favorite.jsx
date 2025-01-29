import React, { useEffect, useState } from 'react';
import Loader from '../components/Loader';
import { collection, getDocs, query, where, doc, updateDoc, orderBy, arrayRemove, arrayUnion, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { FaRegHeart, FaHeart, FaCartArrowDown } from 'react-icons/fa';
import { MdImageSearch } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

const Favorite = ({ searchID, setSearchID, cardArray, nickname }) => {
  const [likedProducts, setLikedProducts] = useState({});
  const [likedProductsArray, setLikedProductsArray] = useState([]);
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true);
    const fetchFavorites = async () => {
      try {
        const userId = nickname || localStorage.getItem('nickname');
        const productRef = collection(db, "product");
        const q = query(
          productRef,
          where("liked_by", "array-contains", userId),
          orderBy("liked_date", "desc")
        );
  
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const products = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setLikedProductsArray(products);
          setLikedProducts(
            products.reduce((acc, product) => {
              acc[product.search_id] = product.liked_by.includes(userId);
              return acc;
            }, {})
          );
          setLoading(false);
        });
  
        return unsubscribe;
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
  
    fetchFavorites();
  }, [nickname]);
  

  const toggleLike = async (searchId) => {
    const userId = nickname || localStorage.getItem('nickname');
    if (!userId) {
      alert("Вы должны быть авторизованы для того, чтобы ставить лайки.");
      return;
    }

    try {
      const productQuery = query(collection(db, "product"), where("search_id", "==", searchId));
      const querySnapshot = await getDocs(productQuery);

      if (querySnapshot.empty) {
        console.error("Продукт с таким search_id не найден");
        return;
      }

      const productDoc = querySnapshot.docs[0];
      const productDocRef = doc(db, "product", productDoc.id);

      // Проверяем, лайкнул ли текущий пользователь
      const isLiked = likedProducts[searchId];

      // Обновляем Firestore
      if (isLiked) {
        await updateDoc(collection(db, 'bookmarks'), {
          liked_by: userId,
          liked: false
        });
      } else {
        await updateDoc(db, 'bookmarks', {
          liked_by: userId,
          liked: true,
        });
      }
      

      // Состояние обновится через onSnapshot
    } catch (err) {
      console.error("Ошибка при обновлении данных в Firestore: ", err);
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
                        onClick={() => toggleLike(item.search_id)}
                      />
                    ) : (
                      <FaRegHeart
                        style={{ color: "var(--any-text-color)" }}
                        onClick={() => toggleLike(item.search_id)}
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