import React, { useState, useEffect, useContext } from "react";
import { Context } from "../../../common/Context";
import { Helmet } from "react-helmet";

import Swal from "sweetalert2";
import * as signalR from "@microsoft/signalr";

//#region Imports de componentes
import Modal from "../../../components/Modal/Modal";
import ProductCard from "../../../components/ProductCard/ProductCard";
//#endregion

//#region Imports de servicios
import { GetCategories } from "../../../services/CategoryService";
import {
  GetProductsByCategory,
  GetProductsByQuery,
  GetProductsBySubcategory,
} from "../../../services/ProductService";
import { GetSubcategoriesByCategory } from "../../../services/SubcategoryService";
//#endregion

//#region Imports de los SVG'S
import { ReactComponent as Close } from "../../../assets/svgs/closebtn.svg";
import { ReactComponent as Lupa } from "../../../assets/svgs/lupa.svg";
import { ReactComponent as Up } from "../../../assets/svgs/up.svg";
import { ReactComponent as Down } from "../../../assets/svgs/down.svg";
import Loader from "../../../components/Loaders/LoaderCircle";
//#endregion

import "./Catalogue.css";

const Catalogue = () => {
  //#region Constantes
  const { aviso, modalCerrado } = useContext(Context);

  const [color, setColor] = useState(false);
  const changeColor = () => {
    if (window.scrollY >= 100) {
      setColor(true);
    } else {
      setColor(false);
    }
  };
  window.addEventListener("scroll", changeColor);

  const [categories, setCategories] = useState([]);
  const [categorySign, setCategorySign] = useState({});
  const [categoryProducts, setCategoryProducts] = useState({});
  const [openCategories, setOpenCategories] = useState([]);

  const [categorySubcategories, setCategorySubcategories] = useState({});
  const [subcategorySigns, setSubcategorySigns] = useState({});
  const [subcategoryProducts, setSubcategoryProducts] = useState({});
  const [openSubcategories, setOpenSubcategories] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingQuery, setIsLoadingQuery] = useState(false);

  const [isLoadingProductByCategory, setIsLoadingProductByCategory] = useState(
    {}
  );
  const [isLoadingProductBySubcategory, setIsLoadingProductBySubcategory] =
    useState({});
  const [isLoadingSubcategories, setIsLoadingSubcategories] = useState({});

  //#region Constantes necesarias para el filtro por busqueda
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [searchValue, setSearchValue] = useState("");
  //#endregion
  //#endregion

  //#region UseEffect
  useEffect(() => {
    // Funciones asincronas para obtener las categorias
    (async () => {
      try {
        await GetCategories(setCategories);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl("https://elzeide.somee.com/generalHub")
      .configureLogging(signalR.LogLevel.Information)
      .build();

    connection
      .start()
      .then(() => {
        // console.log("Conexión establecida con el servidor SignalR");
      })
      .catch((err) => console.error(err.toString()));

    connection.on("MensajeCrudCategoria", async () => {
      try {
        GetCategories(setCategories);
      } catch (error) {
        console.error("Error al obtener las categorias: " + error);
      }
    });

    connection.on("MensajeCrudProducto", async () => {
      try {
        if (query !== "") {
          const products = await GetProductsByQuery(query, 3);
          setProducts(products);
          GetCategories(setCategories);
        } else {
          // Iterar sobre las categorías abiertas en openCategories
          for (const category of openCategories) {
            let products;

            try {
              setIsLoadingProductByCategory(true);
              products = await GetProductsByCategory(category, 3);
            } catch (error) {
              console.log(
                "Error al obtener productos para la categoría",
                category,
                error
              );
            } finally {
              setIsLoadingProductByCategory(false);
            }

            // Actualizar los productos para la categoría en categoryProducts
            setCategoryProducts((prevProducts) => ({
              ...prevProducts,
              [category]: products,
            }));

            // Obtener las subcategorías para la categoría
            const subcategories = categorySubcategories[category] || [];
            for (const subcategory of subcategories) {
              if (openSubcategories.includes(subcategory.nombre)) {
                let subcategoryProducts;

                try {
                  subcategoryProducts = await GetProductsBySubcategory(
                    subcategory.idCategoria,
                    subcategory.idSubcategoria,
                    3
                  );
                } catch (error) {
                  console.log(
                    "Error al obtener productos para la subcategoría",
                    subcategory.nombre,
                    error
                  );
                }

                // Actualizar los productos para la subcategoría en subcategoryProducts
                setSubcategoryProducts((prevProducts) => ({
                  ...prevProducts,
                  [subcategory.nombre]: subcategoryProducts,
                }));
              }
            }
          }
        }

        // Actualizar las categorías después de actualizar productos
        GetCategories(setCategories);
      } catch (error) {
        console.error("Error al obtener los productos: " + error);
      }
    });

    connection.on("MensajeCrudSubcategoria", async () => {
      try {
        // Obtener las categorías abiertas con sus IDs
        const openedCategoriesWithIds = openCategories.map((categoryName) => {
          const category = categories.find(
            (cat) => cat.nombre === categoryName
          );
          return { idCategoria: category.idCategoria, nombre: categoryName };
        });

        // Iterar sobre las categorías abiertas
        for (const category of openedCategoriesWithIds) {
          // Obtener las subcategorías actualizadas para cada categoría abierta
          const updatedSubcategories = await GetSubcategoriesByCategory(
            category.idCategoria
          );

          // Actualizar el estado de las subcategorías para esa categoría
          setCategorySubcategories((prevSubcategories) => ({
            ...prevSubcategories,
            [category.nombre]: updatedSubcategories,
          }));
        }
      } catch (error) {
        console.error(
          "Error al obtener las subcategorías actualizadas: " + error
        );
      }
    });

    return () => {
      connection.stop();
    };
  }, [openCategories, openSubcategories, query]);
  //#endregion

  //#region Función para quitar los signos "-" de las categorías y subcategorías que quedaron abiertas cuando se ejecuta la función de search()
  const closeAllCategories = () => {
    const updatedCategorySigns = {};
    const updatedSubcategorySigns = {}; // Nuevo objeto para los signos de subcategorías

    // Recorrer el estado actual de las categorías
    for (const index in categorySign) {
      updatedCategorySigns[index] = "+"; // Cerrar todas las categorías
    }

    // Recorrer el estado actual de las subcategorías
    for (const category in subcategorySigns) {
      updatedSubcategorySigns[category] = {}; // Crear un objeto vacío para cada categoría
      for (const subcategory in subcategorySigns[category]) {
        updatedSubcategorySigns[category][subcategory] = "+"; // Cerrar todas las subcategorías de cada categoría
      }
    }

    // Actualizar los estados de las categorías y subcategorías
    setCategorySign(updatedCategorySigns);
    setOpenCategories([]);
    setSubcategorySigns(updatedSubcategorySigns); // Actualizar el estado de las subcategorías
  };
  //#endregion

  //#region Funcion para filtrar los productos por query
  const search = async (value) => {
    closeAllCategories();

    if (value === "") {
      handleClearSearch();
      // Swal.fire({
      //   icon: "warning",
      //   title: "Consulta vacía",
      //   text: "Ingrese un término de búsqueda.",
      //   confirmButtonText: "Aceptar",
      //   showCancelButton: false,
      //   confirmButtonColor: "#f8bb86",
      // });
    } else if (value === query) {
      Swal.fire({
        icon: "warning",
        title: "Término de búsqueda no cambiado",
        text: "El término de búsqueda es el mismo que la última consulta. Intente con un término diferente.",
        confirmButtonText: "Aceptar",
        showCancelButton: false,
        confirmButtonColor: "#f8bb86",
      });
    } else {
      setQuery(value);

      try {
        setIsLoadingQuery(true);

        const products = await GetProductsByQuery(value, 3);

        setProducts(products);
        window.scrollTo(0, 0);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoadingQuery(false);
      }

      if (value === "") {
        window.scrollTo(0, 0);
      }
    }
  };
  //#endregion

  //#region Funcion para abrir el "+" o "-" de cada categoría
  const handleCategoryClick = async (index) => {
    setCategorySign((prevSigns) => ({
      ...prevSigns,
      [index]: prevSigns[index] === "-" ? "+" : "-",
    }));

    const category = categories[index].nombre;
    const idCategory = categories[index].idCategoria;

    if (categorySign[index] === "-") {
      // La categoría se está cerrando, cerrar todas las subcategorías asociadas
      const subcategoriesToClose = categorySubcategories[category] || [];
      subcategoriesToClose.forEach((subcategory) => {
        if (openSubcategories.includes(subcategory.nombre)) {
          // Si la subcategoría está abierta, cerrarla
          handleSubcategoryClick(subcategory, categories[index]);
        }
      });

      setOpenCategories((prevOpenCategories) =>
        prevOpenCategories.filter((cat) => cat !== category)
      );
      setIsLoadingProductByCategory((prevLoadingState) => ({
        ...prevLoadingState,
        [idCategory]: false,
      }));
      return;
    }

    setOpenCategories((prevOpenCategories) => [
      ...prevOpenCategories,
      category,
    ]);

    let products;

    // Verificar si la categoría tiene subcategorías antes de intentar cargarlas
    if (categories[index].tieneSubcategorias) {
      try {
        setIsLoadingSubcategories((prevLoadingState) => ({
          ...prevLoadingState,
          [category]: true,
        }));
        const subcategories = await GetSubcategoriesByCategory(idCategory);
        setCategorySubcategories((prevSubcategories) => ({
          ...prevSubcategories,
          [category]: subcategories,
        }));
      } catch (error) {
        console.log("Error al obtener subcategorías:", error);
      } finally {
        setIsLoadingSubcategories((prevLoadingState) => ({
          ...prevLoadingState,
          [category]: false,
        }));
      }
    }

    try {
      setIsLoadingProductByCategory((prevLoadingState) => ({
        ...prevLoadingState,
        [idCategory]: true,
      }));
      products = await GetProductsByCategory(category, 3);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoadingProductByCategory((prevLoadingState) => ({
        ...prevLoadingState,
        [idCategory]: false,
      }));
    }

    setCategoryProducts((prevProducts) => ({
      ...prevProducts,
      [category]: products,
    }));
  };
  //#endregion

  //#region Funcion para abrir el "+" o "-" de cada subcategoría
  const handleSubcategoryClick = async (subcategory, category) => {
    const subcategoryName = subcategory.nombre;
    const categoryName = category.nombre;

    // Actualizar el estado de los signos de subcategorías por categoría
    setSubcategorySigns((prevSigns) => ({
      ...prevSigns,
      [categoryName]: {
        ...prevSigns[categoryName],
        [subcategoryName]:
          prevSigns[categoryName]?.[subcategoryName] === "-" ? "+" : "-",
      },
    }));

    const idCategory = subcategory.idCategoria;
    const idSubcategory = subcategory.idSubcategoria;

    // Verificar si la subcategoría está abierta
    if (subcategorySigns[categoryName]?.[subcategoryName] === "-") {
      // La subcategoría está cerrada, la eliminamos de openSubcategories
      setOpenSubcategories((prevOpenSubcategories) =>
        prevOpenSubcategories.filter((subcat) => subcat !== subcategoryName)
      );
      setIsLoadingProductBySubcategory((prevLoadingState) => ({
        ...prevLoadingState,
        [idSubcategory]: false,
      }));
      return; // No hacer la petición de productos
    }

    // La subcategoría está abierta, la agregamos a openSubcategories
    setOpenSubcategories((prevOpenSubcategories) => [
      ...prevOpenSubcategories,
      subcategoryName,
    ]);

    let products;

    try {
      setIsLoadingProductBySubcategory((prevLoadingState) => ({
        ...prevLoadingState,
        [idSubcategory]: true,
      }));
      products = await GetProductsBySubcategory(idCategory, idSubcategory, 3);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoadingProductBySubcategory((prevLoadingState) => ({
        ...prevLoadingState,
        [idSubcategory]: false,
      }));
    }

    // Actualizar el estado de productos de subcategorías
    setSubcategoryProducts((prevProducts) => ({
      ...prevProducts,
      [subcategoryName]: products,
    }));
  };
  //#endregion

  //#region Funcion para borrar la busqueda por query
  const handleClearSearch = () => {
    // Función para limpiar la búsqueda (setear query a vacío)
    setQuery("");
    setSearchValue("");
  };
  //#endregion

  //#region Return
  return (
    <>
      {aviso && aviso !== "" && modalCerrado === false && <Modal />}
      <div>
        <Helmet>
          <title>La Gran Feria | Catálogo</title>
        </Helmet>

        <section id="home" className="home-container">
          <div className="home-content">
            <div className="home-4">
              <div className="title-search">
                <h1 className="title categories-title title-nomarg">
                  Catálogo
                </h1>

                <div
                  className={
                    color
                      ? "pagination-count3 pagination-count3-fixed"
                      : "pagination-count3"
                  }
                >
                  <div className="search-container">
                    <div className="form-group-input-search2">
                      <span className="input-group-text2">
                        <Lupa className="input-group-svg" />
                      </span>
                      <input
                        className="search-input3"
                        type="text"
                        value={searchValue}
                        onChange={(e) => {
                          setSearchValue(e.target.value);
                          search(e.target.value);
                        }}
                        placeholder="Buscar..."
                      />

                      {/* Agregamos la cruz (icono de borrar) para limpiar la búsqueda */}
                      {query && (
                        <span className="input-clearsearch">
                          <Close
                            className="input-group-svg"
                            onClick={handleClearSearch}
                            style={{ cursor: "pointer" }}
                          />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Renderizar la lista de productos filtrados */}
              {isLoadingQuery === true ? (
                <div>
                  <Loader />
                  <p className="bold-loading">
                    Cargando productos con: "{query}"...
                  </p>
                </div>
              ) : query !== "" ? (
                <div className="categorias-container">
                  <div className="productos-filtrados">
                    <div className="filters-left" key={1}>
                      <div className="filter-container">
                        <div className="filter-btn-container2" role="button">
                          <p className="filter-btn-name2">{`Productos con: "${query}"`}</p>
                        </div>

                        <div className="collapse show" id="collapseQuery">
                          <div className="product-container">
                            {products?.length === 0 ? (
                              <div className="vacio2">
                                <p className="product-desc no-p">
                                  No hay productos que contengan:{" "}
                                  <b className="category-name">"{query}"</b>.
                                </p>
                              </div>
                            ) : (
                              products?.map((product, index) => (
                                <ProductCard
                                  key={index}
                                  product={product}
                                  dark={false}
                                />
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="categorias-container">
                  {isLoading === true ? (
                    <div>
                      <Loader />
                      <p className="bold-loading">Cargando categorías...</p>
                    </div>
                  ) : categories === null ? (
                    <div className="filter-container">
                      <div className="vacio">
                        <p className="product-desc">
                          No hay categorías disponibles en este momento.
                        </p>
                      </div>
                    </div>
                  ) : (
                    categories.map((category, index) => (
                      <div className="filters-left" key={index}>
                        <div className="filter-container">
                          <div
                            className="filter-btn-container2"
                            style={{
                              backgroundImage: `linear-gradient(#ffffffa6,#ffffffa6), url(${category.urlImagen})`,
                            }}
                            onClick={() => handleCategoryClick(index)}
                            data-bs-toggle="collapse"
                            href={`#collapseCategory${index}`}
                            role="button"
                            aria-expanded="false"
                            aria-controls={`collapseCategory${index}`}
                          >
                            <p className="filter-btn-name2">
                              {category.nombre}
                            </p>
                            <p className="filter-btn2">
                              {categorySign[index] || "+"}
                            </p>
                          </div>
                          <div
                            className="collapse"
                            id={`collapseCategory${index}`}
                          >
                            <div className="product-container">
                              <div>
                                {isLoadingSubcategories[category.nombre] ===
                                  true &&
                                category.nombre !== "Promociones" &&
                                category.nombre !== "Destacados" ? (
                                  <div>
                                    <Loader />
                                    <p className="bold-loading">
                                      Cargando subcategorías de{" "}
                                      {category.nombre}
                                    </p>
                                  </div>
                                ) : (
                                  <div>
                                    {categorySubcategories[category.nombre]
                                      ?.length > 0 && (
                                      <div className="subcategorias-container">
                                        {categorySubcategories[
                                          category.nombre
                                        ].map((subcategory) => (
                                          <div
                                            className="filters-left"
                                            key={subcategory.idSubcategoria}
                                          >
                                            <div className="filter-container">
                                              <div
                                                className="subcategory-btn-container"
                                                style={{
                                                  backgroundImage: `linear-gradient(#ffffffa6,#ffffffa6), url(${subcategory.urlImagen})`,
                                                }}
                                                onClick={() =>
                                                  handleSubcategoryClick(
                                                    subcategory,
                                                    category
                                                  )
                                                }
                                                data-bs-toggle="collapse"
                                                href={`#collapseSubcategory${subcategory.idSubcategoria}`}
                                                role="button"
                                                aria-expanded="false"
                                                aria-controls={`collapseSubcategory${subcategory.idSubcategoria}`}
                                              >
                                                <p className="filter-btn-name2">
                                                  {subcategory.nombre}
                                                </p>
                                                <p className="filter-btn2">
                                                  {subcategorySigns[
                                                    category.nombre
                                                  ]?.[subcategory.nombre] ===
                                                  "-" ? (
                                                    <Up className="updown"></Up>
                                                  ) : (
                                                    <Down className="updown"></Down>
                                                  )}
                                                </p>
                                              </div>
                                              <div
                                                className="collapse"
                                                id={`collapseSubcategory${subcategory.idSubcategoria}`}
                                              >
                                                <div className="product-container">
                                                  {isLoadingProductBySubcategory[
                                                    subcategory.idSubcategoria
                                                  ] === true ? (
                                                    <div>
                                                      <Loader />
                                                      <p className="bold-loading">
                                                        Cargando productos
                                                        pertenecientes a la
                                                        subcategoría "
                                                        {subcategory.nombre}"...
                                                      </p>
                                                    </div>
                                                  ) : (
                                                    subcategoryProducts[
                                                      subcategory.nombre
                                                    ]?.map((product, index) => (
                                                      <ProductCard
                                                        key={index}
                                                        product={product}
                                                        dark={false}
                                                      />
                                                    ))
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>

                              {isLoadingProductByCategory[
                                category.idCategoria
                              ] === true ? (
                                <div>
                                  <Loader />
                                  <p className="bold-loading">
                                    Cargando productos pertenecientes a la
                                    categoría "{category.nombre}"...
                                  </p>
                                </div>
                              ) : (
                                categoryProducts[category.nombre]?.map(
                                  (product, index) => (
                                    <ProductCard
                                      key={index}
                                      product={product}
                                      dark={true}
                                    />
                                  )
                                )
                              )}
                            </div>
                          </div>
                          <p className="filter-separator2"></p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
  //#endregion
};

export default Catalogue;
