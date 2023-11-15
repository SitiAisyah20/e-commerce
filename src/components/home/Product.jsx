import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setProducts, setLoading } from "../../store/reducers/product";
import { product } from "../../utils/constants";
import axios from "axios";
import { FaCartPlus, FaStar } from "react-icons/fa";
import { formatPrice } from "../../utils/price";
import { toast } from "react-toastify";
import { addToCart } from "../../store/reducers/cart";

function Product() {
  const dispatch = useDispatch();
  const data = useSelector((state) => state.product.products);
  const { isLoggedIn } = useSelector((state) => state.auth);
  const [filteredData, setFilteredData] = useState(data);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch(setLoading(true));
        const response = await axios.get(`${product}`);
        const data = response.data;
        const localData = JSON.parse(localStorage.getItem("allProducts"));
        if (data) {
          dispatch(setProducts(localData || data));
          setFilteredData(localData || data);
        } else {
          dispatch(setProducts([]));
          setFilteredData([]);
        }
        dispatch(setLoading(false));
      } catch (error) {
        toast.error("Error fetching products:", error);
        dispatch(setLoading(false));
      }
    };

    fetchData();
  }, [dispatch]);

  const filterProduct = (category) => {
    if (category === "All") {
      setFilteredData(data);
    } else {
      const updateList = data.filter((x) => x.category === category);
      setFilteredData(updateList);
    }
    setSelectedCategory(category);
  };

  const handleAddToCart = (product) => {
    if (isLoggedIn) {
      if (product.stock >= 1) {
        const cartItem = { ...product, quantity: 1 };
        dispatch(addToCart(cartItem, product.stock - 1));
        const updatedProducts = filteredData.map((p) => {
          if (p.id === product.id) {
            return { ...p, stock: p.stock - 1 };
          }
          return p;
        });
        setFilteredData(updatedProducts);
        localStorage.setItem("allProducts", JSON.stringify(updatedProducts));
      } else {
        toast.error("Product stock is insufficient.");
      }
    } else {
      toast.warn("Please Login Now!");
      window.location.href = "/login";
    }
  };

  const ShowProducts = () => {
    if (!Array.isArray(filteredData)) {
      return <div>Loading...</div>;
    }
    return (
      <>
        <div className="col-md-3 my-3">
          <div className="position-sticky" style={{ top: "100px" }}>
            <button
              className={`btn btn-sm m-1 ${
                selectedCategory === "All" ? "btn-dark" : "btn-outline-dark"
              }`}
              onClick={() => filterProduct("All")}
            >
              All
            </button>
            <button
              className={`btn btn-sm m-1 ${
                selectedCategory === "women's clothing"
                  ? "btn-dark"
                  : "btn-outline-dark"
              }`}
              onClick={() => filterProduct("women's clothing")}
            >
              Women's Clothing
            </button>
            <button
              className={`btn btn-sm m-1 ${
                selectedCategory === "men's clothing"
                  ? "btn-dark"
                  : "btn-outline-dark"
              }`}
              onClick={() => filterProduct("men's clothing")}
            >
              Men's Clothing
            </button>
            <button
              className={`btn btn-sm m-1 ${
                selectedCategory === "jewelery"
                  ? "btn-dark"
                  : "btn-outline-dark"
              }`}
              onClick={() => filterProduct("jewelery")}
            >
              Jewelery
            </button>
            <button
              className={`btn btn-sm m-1 ${
                selectedCategory === "electronics"
                  ? "btn-dark"
                  : "btn-outline-dark"
              }`}
              onClick={() => filterProduct("electronics")}
            >
              Electronics
            </button>
          </div>
        </div>

        <div className="col-md-9 py-md-3">
          <div className="row">
            {filteredData &&
              filteredData.map((product) => {
                const starRate = (product.rating.rate / 5) * 5;
                return (
                  <div
                    className="col-6 col-md-6 col-lg-4 mb-3"
                    key={product.id}
                  >
                    <Link
                      to={`/product/${product.id}`}
                      style={{ textDecoration: "none" }}
                    >
                      <div className="card h-100">
                        <img
                          src={product.image}
                          className="m-3"
                          style={{
                            height: "300px",
                            width: "auto",
                            objectFit: "contain",
                          }}
                          alt={product.title}
                        />
                        <div className="m-3 mb-0">
                          <div>
                            <p className="fw-bold"> Stock : {product.stock}</p>
                          </div>
                          <h5 className="card-title">
                            {product.title.substring(0, 20)}...
                          </h5>
                        </div>
                        <div style={{ marginTop: "auto" }}>
                          <div
                            className="d-flex mt-2"
                            style={{ marginLeft: "10px" }}
                          >
                            {Array(Math.round(starRate))
                              .fill()
                              .map((_, index) => (
                                <FaStar key={index} color="gold" size={18} />
                              ))}
                            <small>{`${product.rating.count} reviews`}</small>
                          </div>
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="m-3">
                              <b>{formatPrice(product.price)}</b>
                            </div>
                            <Link
                              className="btn btn-sm m-3"
                              onClick={() => handleAddToCart(product)}
                            >
                              <FaCartPlus size={25} />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="container">
      <div className="row">{<ShowProducts />}</div>
    </div>
  );
}

export default Product;
