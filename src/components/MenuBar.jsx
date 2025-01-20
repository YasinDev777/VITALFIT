import React, { useState, useEffect, useRef } from 'react';
import { FaCheck } from "react-icons/fa";
import { LuFilterX } from "react-icons/lu";
import { FaChevronRight } from "react-icons/fa6";

const MenuBar = ({
  productsArray,
  setFilterData,
  searchText,
  likeSearch,
  setCurrentPage
}) => {
  const [activeStates, setActiveStates] = useState(Array(9).fill(false)); // массив для всех категорий
  const [activeStates1, setActiveStates1] = useState(Array(4).fill(false)); // массив для использования
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null); // создаем реф для menu-bar1

  const Product_names = [
    "Iso Protein",
    "Whey Protein",
    "Creatine", 
    "Gainer",
    "Aminokislot", 
    "BCAA",
    "I Carnitine",
    "Citrulline",
    "Arginin"
  ];

  const Product_use = [
    "Energiya uchun",
    "Vitamin",
    "Ves olish",
    "Trenirovka",
  ];

  const FilterData = () => {
    const filteredByText = productsArray.filter(item => 
      item.type_name.toLowerCase().includes(searchText.toLowerCase()) || 
      item.name.toLowerCase().includes(searchText.toLowerCase())
    );
    const activeCategories = Product_names.filter((item, index) => activeStates[index]);
    const activeUseCategories = Product_use.filter((item, index) => activeStates1[index]);

    const filtered = filteredByText.filter(item => {
      const matchesCategory = activeCategories.length === 0 || activeCategories.includes(item.type_name);
      const matchesUse = activeUseCategories.length === 0 || activeUseCategories.includes(item.using_type);
      return matchesCategory && matchesUse;
    });

    setFilterData(filtered);
  };

  useEffect(() => {
    FilterData();
  }, [activeStates, activeStates1, productsArray, searchText, likeSearch]);

  const toggleRadio = (index) => {
    setActiveStates(prevState => {
      const newStates = [...prevState];
      newStates[index] = !newStates[index];
      return newStates;
    });
    setCurrentPage(1);
  };

  const toggleRadio1 = (index) => {
    setActiveStates1(prevState => {
      const newStates1 = [...prevState];
      newStates1[index] = !newStates1[index];
      return newStates1;
    });
    setCurrentPage(1);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div ref={menuRef} className={`menu-bar1 ${open === true ? 'active-menu1' : ''}`}>
      <div className="menu-bar">
        <div className={`open-bar ${open === true ? 'open-activeBar' : ''}`} onClick={() => setOpen(!open)}>
          <FaChevronRight className={open === false ? 'open-icon' : 'active-openIcon'} />
        </div>
        <div className="radio-info">
          <div className="name-svg">
            <h3>Mahsulot turi</h3>
            <LuFilterX onClick={() => setActiveStates(Array(4).fill(false))} />
          </div>
          <div className="radios">
            {Product_names.map((item, index) => (
              <div key={index} className="div-radio">
                <div 
                  className={`radio ${activeStates[index] ? "active-radio" : ""}`}  
                  onClick={() => toggleRadio(index)}
                >
                  {activeStates[index] ? <FaCheck /> : null}
                </div>
                <p onClick={() => toggleRadio(index)}>{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="radio-info">
          <div className="name-svg">
            <h3>Nima uchun </h3>
            <LuFilterX onClick={() => setActiveStates1(Array(4).fill(false))} />
          </div>
          <div className="radios">
            {Product_use.map((item, index) => (
              <div key={index} className="div-radio">
                <div
                  className={`radio ${activeStates1[index] ? "active-radio" : ""}`}
                  onClick={() => toggleRadio1(index)}
                >
                  {activeStates1[index] ? <FaCheck /> : null}
                </div>
                <p onClick={() => toggleRadio(index)}>{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuBar;
