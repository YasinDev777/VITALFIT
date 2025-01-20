import React, { useEffect, useState } from 'react';
import Loader from '../components/Loader';
import { collection, getDocs, query, where, doc, updateDoc, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { FaRegHeart, FaHeart, FaCartArrowDown } from 'react-icons/fa';
import { MdImageSearch } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

const Favorite = ({ searchID, setSearchID, cardArray }) => {
  const [likedProducts, setLikedProducts] = useState({});
  const [likedProductsArray, setLikedProductsArray] = useState([]);
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchs = async () => {
      setLoading(true)
      try {
        const product = collection(db, "product");
        const q = query(product, where("liked", "==", true), orderBy("liked_date", "desc"));
        const products = await getDocs(q);

        const productsGetMain = [];
        products.forEach((docs) => {
          const data = docs.data();
          productsGetMain.push(data);
          setLikedProducts((prevState) => ({
            ...prevState,
            [data.search_id]: data.liked || false,
          }));
        });

        setLikedProductsArray(productsGetMain);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false)
      }
    };

    fetchs();
  }, []);

  const toggleLike = async (searchId, currentState) => {
    const newLikeState = !currentState; // Переключаем состояние лайка
    const likedDate = new Date().toISOString(); // Создаём текущую метку времени в формате ISO (год, месяц, день, часы, минуты, секунды)

    setLikedProducts((prevState) => ({
      ...prevState,
      [searchId]: newLikeState, // Обновляем локальное состояние
    }));

    // Выполняем запрос для поиска документа по search_id
    const productQuery = query(
      collection(db, "product"),
      where("search_id", "==", searchId)
    );

    try {
      const querySnapshot = await getDocs(productQuery);

      if (querySnapshot.empty) {
        console.error("Продукт с таким search_id не найден");
        return;
      }

      // Берем первый документ из результата запроса
      const productDocRef = doc(db, "product", querySnapshot.docs[0].id);

      // Обновляем поля "liked" и "liked_date" в найденном документе
      await updateDoc(productDocRef, {
        liked: newLikeState,
        liked_date: newLikeState ? likedDate : null, // Устанавливаем время только если лайк поставлен
      });
    } catch (err) {
      console.error("Ошибка при обновлении данных в Firestore: ", err);
    }
  };

  const handleNavigate = (id, item) =>{
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
                        onClick={() => toggleLike(item.search_id, likedProducts[item.search_id])}
                      />
                    ) : (
                      <FaRegHeart
                        style={{ color: "var(--any-text-color)" }}
                        onClick={() => toggleLike(item.search_id, likedProducts[item.search_id])}
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