import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Loader from '../components/Loader';
import { IoArrowBackCircleSharp } from "react-icons/io5";
import { FaRegHeart, FaHeart } from "react-icons/fa";

const Card = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      const productQuery = query(
        collection(db, 'product'),
        where('search_id', '==', id)
      );

      const querySnapshot = await getDocs(productQuery);
      if (!querySnapshot.empty) {
        const productData = querySnapshot.docs[0].data();
        setProduct(productData);
        setLiked(productData.liked);
      }
    };

    fetchProduct();
  }, [id]);

  const toggleLike = async () => {
    if (!product) return;

    const newLikeState = !liked;
    const likedDate = newLikeState ? new Date().toISOString() : null;

    try {
      setLiked(newLikeState);
      const productQuery = query(
        collection(db, 'product'),
        where('search_id', '==', id)
      );

      const querySnapshot = await getDocs(productQuery);
      if (querySnapshot.empty) {
        console.error("Продукт с таким search_id не найден");
        return;
      }

      const productDocRef = doc(db, 'product', querySnapshot.docs[0].id);
      await updateDoc(productDocRef, {
        liked: newLikeState,
        liked_date: likedDate,
      });

      setProduct((prev) => ({
        ...prev,
        liked: newLikeState,
        liked_date: likedDate,
      }));
    } catch (error) {
      console.error("Ошибка при обновлении данных в Firestore:", error);
    }
  };

  if (!product) {
    return <Loader />;
  }

  return (
    <div className='product-main'>
      <div className="product">
        <div className="exit-nav">
          <Link to='/'>
            <IoArrowBackCircleSharp />
          </Link>
        </div>
        <div className="prod-div">
          <div className="ava">
            <div className="card-nav">
              <div className="prod-id">
                <p>ID: {product.search_id}</p>
              </div>
              {liked ? (
                <FaHeart
                  style={{ color: "var(--main-color)" }}
                  onClick={toggleLike}
                />
              ) : (
                <FaRegHeart
                  style={{ color: "var(--any-text-color)" }}
                  onClick={toggleLike}
                />
              )}
            </div>
            <img src={product.image} alt="" />
          </div>
          <div className="prod-info">
            <h1>{product.name}</h1>
            <div className="prod-infors">
              <div className="description">
                <p>{product.description}</p>
              </div>
              <div className="specs">
                <div className="spec">
                  <div className="spec-name">Narxi</div>
                  <div className="dots"></div>
                  <div className="id"><p>{product.current_price}</p> <p>so'm</p></div>
                </div>
                <div className="spec">
                  <div className="spec-name">Belok</div>
                  <div className="dots"></div>
                  <div className="id"><p>{product.belok}</p> <p>g</p></div>
                </div>
                <div className="spec">
                  <div className="spec-name">BCAA</div>
                  <div className="dots"></div>
                  <div className="id"><p>{product.bcaa}</p> <p>g</p></div>
                </div>
                <div className="spec">
                  <div className="spec-name">Shakar</div>
                  <div className="dots"></div>
                  <div className="id"><p>{product.shugar}</p> <p>g</p></div>
                </div>
              </div>
            </div>
            <div className="des">
              <p>Xarid qilish uchun <Link to='https://t.me/azimxon004' target='blank'>Admin</Link> bilan bog'laning</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;
