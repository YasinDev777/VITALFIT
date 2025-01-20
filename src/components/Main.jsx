  import React, { useEffect, useState } from 'react';
  import Loader from './Loader';
  import { collection, getDocs, query, where, doc, updateDoc, orderBy } from 'firebase/firestore';
  import { db } from "../firebase";
  import { FaRegHeart, FaHeart, FaCartArrowDown } from "react-icons/fa";
  import { MdImageSearch } from "react-icons/md";
  import { GrFormNext, GrFormPrevious } from "react-icons/gr";
  import { useNavigate } from 'react-router-dom';

  const Main = ({ setProductsArray, filterData, searchID, setSearchID, currentPage, setCurrentPage, cardArray }) => {
    const [likedProducts, setLikedProducts] = useState({});
    const [loading, setLoading] = useState(true)
    const [currentPerPage] = useState(9)
    const lastIndexPage = currentPage * currentPerPage
    const firstIndexPage = lastIndexPage - currentPerPage
    const currentProducts = filterData.slice(firstIndexPage, lastIndexPage)
    const totalPages = filterData.length
    const numbers = []
    const navigate = useNavigate()

    for(let i = 1; i <= Math.ceil(totalPages / currentPerPage); i++){
      numbers.push(i)
    }

    const paginate = pageNumber => setCurrentPage(pageNumber)

    const handleScroll = () => window.scrollTo({top: 0, behavior: 'smooth'})

    const next = () => {
      if (currentPage !== Math.ceil(totalPages / currentPerPage)) {
        setCurrentPage(currentPage + 1)
        setTimeout(() => {
          handleScroll()
        }, 50)
      }
    }

    const prev = () => {
      if (currentPage !== 1) {
        setCurrentPage(currentPage - 1)
        setTimeout(() => {
          handleScroll()
        }, 50)
      }
    }

    const handleNavigate = (id, item) => {
      navigate(`/product/${id}`, { state: { product: { ...item, liked: likedProducts[id] } } });
    };
    
    useEffect(() => {
      const fetchs = async () => {
        setLoading(true)
        try {
          const product = collection(db, "product");
          const q = query(product, where("In_stock", "==", true), orderBy("date", "desc"));
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

          setProductsArray(productsGetMain);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false)
        }
      };
      fetchs();
    }, []);


    const toggleLike = async (searchId, currentState) => {
      const newLikeState = !currentState;
      const likedDate = new Date().toISOString();

      setLikedProducts((prevState) => ({
        ...prevState,
        [searchId]: newLikeState,
      }));

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

        const productDocRef = doc(db, "product", querySnapshot.docs[0].id);
        await updateDoc(productDocRef, {
          liked: newLikeState,
          liked_date: newLikeState ? likedDate : null,
        });
      } catch (err) {
        console.error("Ошибка при обновлении данных в Firestore: ", err);
      }
    };

    const Test = (id) => {
      setSearchID(id)
    }

    return (
      loading ? (
        <Loader />
      ) : (
        <div className='cards'>
          {filterData.length ? (
            <>          
            <div className="cards-main">
              {
                currentProducts.map((item, index) => (
                  <div className="card" key={index}>
                    <div className="nav-card">
                      <div className="in-stock">
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
                    <div className="image">
                      <img src={item.image} alt={item.type_name} />
                      <div className="information">
                        <button onClick={() => {handleNavigate(item.search_id, item);}}>
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
                ))
              }
            </div>
            <div className="pages">
              <div className={`prev ${currentPage === 1 ? 'disabled-btn' : ''}`} onClick={prev}>
                <GrFormPrevious />
              </div>
              {
                numbers.map((item, index) =>(
                  <button 
                  className={currentPage === item ? 'active' : ''}
                  onClick={() =>{
                    paginate(item); 
                    handleScroll()
                  }} 
                  
                  key={index}
                  >{item}</button>
                ))
              }
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
      )
    );
  };

  export default Main;
