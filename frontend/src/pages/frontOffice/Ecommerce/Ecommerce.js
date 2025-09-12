import React, { useEffect, useState, useContext } from "react";
import { Context } from "../../../common/Context";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";

import Swal from "sweetalert2";
import * as signalR from "@microsoft/signalr";

import "./Ecommerce.css";

//#region SVG'S Imports
import { ReactComponent as NoProductSvg } from "../../../assets/svgs/noproducts.svg";
import { ReactComponent as Close } from "../../../assets/svgs/closebtn.svg";
import { ReactComponent as Filter } from "../../../assets/svgs/filter.svg";
import { ReactComponent as Lupa } from "../../../assets/svgs/lupa.svg";
import { ReactComponent as Promocion } from "../../../assets/svgs/promocion.svg";
import { ReactComponent as Destacado } from "../../../assets/svgs/destacado.svg";
//#endregion

//#region Imports de componentes
import Loader from "../../../components/Loaders/LoaderCircle";
import Modal from "../../../components/Modal/Modal";
//#endregion

//#region Imports de servicios
import { GetProductsEcommerce } from "../../../services/ProductService";
import { GetCategories } from "../../../services/CategoryService";
import { GetSubcategoriesByCategory } from "../../../services/SubcategoryService";
//#endregion

function Ecommerce() {
  //#region Constantes
  const {
    aviso,
    modalCerrado,
    categoria,
    subcategoria,
    promocion,
    destacado,
    setCategoria,
    setSubcategoria,
    setPromocion,
    setDestacado,
  } = useContext(Context);

  const [products, setProducts] = useState([]);
  const [originalProductsList, setOriginalProductsList] = useState(products);

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  const [title, setTitle] = useState(["Productos"]);

  const [categorySign, setCategorySign] = useState("+");
  const [subcategorySigns, setSubcategorySigns] = useState({});
  const [openSubcategory, setOpenSubcategory] = useState(null);
  const [isOpen, setIsOpen] = useState({});

  const [openCategories, setOpenCategories] = useState([]);

  const [filterName, setFilterName] = useState("");

  const [searchValue, setSearchValue] = useState("");
  const [query, setQuery] = useState("");

  const [enPromocion, setEnPromocion] = useState(false);
  const [enDestacado, setEnDestacado] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingQuery, setIsLoadingQuery] = useState(false);

  // bandera para saber si el 'collapse' de bootstrap se esta mostrando o esta escondido
  const [isCollapsed, setIsCollapsed] = useState(false);
  //#endregion

  //#region Constantes de la paginacion
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 30;
  const lastIndex = currentPage * productsPerPage;
  const firstIndex = lastIndex - productsPerPage;
  const productsTable = products.slice(firstIndex, lastIndex);
  const npage = Math.ceil(products.length / productsPerPage);
  const numbers = [...Array(npage + 1).keys()].slice(1);

  const [maxPageNumbersToShow] = useState(1);
  const minPageNumbersToShow = 0;
  //#endregion

  //#region Funcion lo que carga apenas se renderiza el componente y en cada renderizacion
  useEffect(() => {
    (async () => {
      setIsLoading(true);

      try {
        const resultProducts = await GetProductsEcommerce();
        setProducts(resultProducts);
        setOriginalProductsList(resultProducts);

        await GetCategories(setCategories);

        handleResize();
        window.addEventListener("resize", handleResize);
      } catch (error) {
        console.error(error);
      } finally {
        // Esto se ejecutará siempre, sin importar si hubo un error o no
        setIsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        if (categoria !== null) {
          filterProducts("category", categoria);
        }

        if (subcategoria !== null) {
          filterProducts("subcategory", subcategoria);
        }

        if (promocion !== null) {
          filterProducts("promocion", "Promociones");
          setEnPromocion(true);
        }

        if (destacado !== null) {
          filterProducts("destacado", "Destacados");
          setEnDestacado(true);
        }
      } catch (error) {
        console.error(error);
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
        if (searchValue !== "") {
          const products = await GetProductsEcommerce(searchValue);
          setProducts(products);
        } else {
          try {
            setIsLoading(true);
            const productsOriginal = await GetProductsEcommerce();
            setOriginalProductsList(productsOriginal);

            if (
              categoria === null &&
              subcategoria === null &&
              promocion === null &&
              destacado === null
            ) {
              setProducts(productsOriginal);
            }

            if (categoria !== null) {
              filterProducts("category", categoria);
            }

            if (subcategoria !== null) {
              filterProducts("subcategory", subcategoria);
            }

            if (promocion !== null) {
              filterProducts("promocion", "Promociones");
              setEnPromocion(true);
            }

            if (destacado !== null) {
              filterProducts("destacado", "Destacados");
              setEnDestacado(true);
            }
          } catch (error) {
            console.log("Error al obtener productos: " + error);
          } finally {
            setIsLoading(false);
          }
        }
      } finally {
        GetCategories(setCategories); // Llamada única a GetCategories
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
          await RetrieveCategorySubcategories(category.idCategoria);
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
    // }, [openCategories, openSubcategories, query]);
  }, [categoria, subcategoria, destacado, promocion, query, openCategories]);
  //#endregion

  //#region Funciones para la paginacion
  function prePage() {
    if (currentPage !== 1) {
      setCurrentPage(currentPage - 1);
    }
  }

  function nextPage() {
    if (currentPage !== npage) {
      setCurrentPage(currentPage + 1);
    }
  }

  function changeCPage(id) {
    setCurrentPage(id);
  }
  //#endregion

  //#region Funciones para mostrar '+' o '-' cuando se toca en el 'collapse' de cada filtro de categoria
  const handleCategoryClick = () => {
    setCategorySign(categorySign === "+" ? "-" : "+");
  };
  //#endregion

  //#region Función para mostrar '+' o '-' cuando se toca en el 'collapse' del filtro de subcategoría
  const handleSubcategoryClick = (subcategoryName) => {
    setSubcategorySigns((prevSigns) => ({
      ...prevSigns,
      [subcategoryName]: prevSigns[subcategoryName] === "-" ? "+" : "-",
    }));

    // Actualiza el estado de la subcategoría actualmente abierta
    setOpenSubcategory(subcategoryName);

    // Actualiza el estado isOpen de cada subcategoría
    setIsOpen((prevState) => ({
      ...prevState,
      [subcategoryName]: !prevState[subcategoryName],
    }));

    if (openSubcategory === subcategoryName) {
      setOpenSubcategory(null);
      setSubcategorySigns((prevSigns) => ({
        ...prevSigns,
        [subcategoryName]: "+",
      }));
    } else {
      // Cierra cualquier otro collapse abierto
      setOpenSubcategory(subcategoryName);
      // Cambia el signo de la subcategoría actualmente abierta, si hay alguna
      if (openSubcategory) {
        setSubcategorySigns((prevSigns) => ({
          ...prevSigns,
          [openSubcategory]: "+",
          [subcategoryName]: "-",
        }));
      } else {
        setSubcategorySigns((prevSigns) => ({
          ...prevSigns,
          [subcategoryName]: "-",
        }));
      }
    }
  };
  //#endregion

  //#region Función para obtener las subcategorías de una categoría
  const RetrieveCategorySubcategories = async (idCategoria) => {
    const result = await GetSubcategoriesByCategory(idCategoria, 3);
    setSubcategories(result);
  };
  //#endregion

  //#region Funcion para borrar negrita al filtro (item) seleccionado anteriormente (aplica al filtro de: categoria y subcategoria)
  const ClearBold = () => {
    const items = document.getElementsByClassName("items-collapse"); // identificamos el boton con el nombre de la categoria
    for (let i = 0; i < items.length; i++) {
      //recorremos los botones con las opciones de categorías
      if (items[i].classList.contains("active")) {
        // reconoce la categoria clickeada
        items[i].classList.remove("active"); // le remueve la clase 'active' a la categoria que se clickeo anterioremnte para filtrar y asi luego de limpiar el filtro ya no tiene mas la clase 'active'
        break;
      }
    }

    setCategories((prevCategories) =>
      (prevCategories || []).map((category) => ({
        ...category,
        isActive: false,
      }))
    );

    setSubcategories((prevSubcategories) =>
      prevSubcategories.map((subcategory) => ({
        ...subcategory,
        isActive: false,
      }))
    );

    if (enPromocion === true) {
      setEnPromocion(false);
    }

    if (enDestacado === true) {
      setEnDestacado(false);
    }
  };
  //#endregion

  //#region Funcion para resetear el scroll y volver a la primera pagina
  const resetScrollAndPage = () => {
    setCurrentPage(1);
    window.scrollTo(0, 0);
  };
  //#endregion

  //#region Funcion para borrar cualquier filtro
  const ClearFilter = () => {
    setProducts(originalProductsList); // trae la lista de productos original, sin ningun filtro
    setSearchValue("");
    setQuery("");

    setTitle("Productos");

    document.getElementById("clear-filter").style.display = "none"; // esconde del DOM el boton de limpiar filtros
    ClearBold();
    resetScrollAndPage();
  };
  //#endregion

  //#region Funcion para filtrar los productos por categoria/subcategoria/en promocion/destacados
  const filterProducts = async (filterType, filterValue) => {
    ClearBold();
    resetScrollAndPage();

    if (filterValue) {
      setIsLoading(true);

      try {
        const products = await GetProductsEcommerce(
          "",
          filterType === "category" ||
            filterType === "promocion" ||
            filterType === "destacado"
            ? filterValue
            : "",
          filterType === "subcategory" ? filterValue : ""
        );

        setProducts(products);
        setFilterName(filterValue);
        setTitle(
          `Productos ${
            filterType === "category"
              ? `de ${filterValue}`
              : filterType === "subcategory"
              ? `de ${filterValue}`
              : filterType === "promocion"
              ? "en promoción"
              : "destacados"
          }`
        );
        setQuery("");
        document.getElementById("clear-filter").style.display = "flex";
        document.getElementById("clear-filter2").style.display = "flex";
      } catch (error) {
        console.error(error);
        setIsLoading(false);
      } finally {
        setIsLoading(false);
      }
    } else {
      ClearFilter();
    }
  };
  //#endregion

  //#region Funcion para filtrar producto mediante una consulta personalizada
  const search = async (value) => {
    ClearBold();
    setTitle(`Productos con: "${value}"`);
    document.getElementById("clear-filter").style.display = "flex";
    setFilterName(value);
    window.scrollTo(0, 0);
    setCurrentPage(1);
    if (value === "") {
      document.getElementById("clear-filter").style.display = "none";
      setTitle("Productos");
      window.scrollTo(0, 0);
    }

    if (value === "") {
      ClearFilter();
      // Swal.fire({
      //   icon: "warning",
      //   title: "Consulta vacía",
      //   text: "Ingrese un término de búsqueda.",
      //   confirmButtonText: "Aceptar",
      //   showCancelButton: false,
      //   confirmButtonColor: "#f8bb86",
      // });
      ClearFilter();
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
        const products = await GetProductsEcommerce(value);

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

  //#region Funcion para que cuando el ancho de la pantalla sea menor a 640px marcar una bandera (IsCollapsed) que condiciona el useEffect
  const handleResize = () => {
    const windowWidth = window.innerWidth;
    if (windowWidth < 640) {
      setIsCollapsed(true);
    } else {
      setIsCollapsed(false);
    }
  };
  //#endregion

  //#region Lo que retorna el componente
  return (
    <>
      {aviso && aviso !== "" && modalCerrado === false && <Modal />}
      <div>
        <Helmet>
          <title>La Gran Feria | Ecommerce </title>
        </Helmet>
        <section id="products" className="products-container">
          <div className="products-content">
            <div className={`filter-products-container`}>
              <div className="filters-left">
                <div className="filter-container2">
                  <div
                    className="filter-btn-title-container"
                    id="filter-btn-title-container"
                    data-bs-toggle="collapse"
                    href="#collapseFilters"
                    role="button"
                    aria-expanded="false"
                    aria-controls="collapseFilters"
                  >
                    <p className="filter-btn">
                      <Filter className="filter-svg" />
                    </p>
                    <p className="filter-title">Filtros</p>
                  </div>

                  <button
                    id="clear-filter"
                    className="clear-filter"
                    onClick={ClearFilter}
                  >
                    <Close className="close-svg" />
                    <p className="clear-filter-p">{filterName}</p>
                  </button>

                  <div
                    className={`collapse ${isCollapsed ? "" : "show"}`}
                    id="collapseFilters"
                  >
                    <div className="card-collapse">
                      <p className="filter-separator"></p>

                      <div
                        className="filter-btn-container"
                        onClick={handleCategoryClick}
                        data-bs-toggle="collapse"
                        href="#collapseCategory"
                        role="button"
                        aria-expanded="false"
                        aria-controls="collapseCategory"
                      >
                        <p className="filter-btn-name">CATEGORÍAS</p>
                        <p className="filter-btn">{categorySign}</p>
                      </div>
                      <div className="collapse" id="collapseCategory">
                        <div className="card-collapse">
                          {(categories || [])
                            .filter(
                              (category) =>
                                category.nombre !== "Promociones" &&
                                category.nombre !== "Destacados"
                            )
                            .map((category, index) => {
                              const handleClick = () => {
                                setCategoria(category.nombre);
                                setSubcategoria(null);
                                setPromocion(null);
                                setDestacado(null);

                                const itemsSubcategory =
                                  document.getElementsByClassName(
                                    "items-collapse2"
                                  ); // identificamos el boton con el nombre de la categoria
                                for (
                                  let i = 0;
                                  i < itemsSubcategory.length;
                                  i++
                                ) {
                                  //recorremos los botones con las opciones de subcategorías
                                  if (
                                    itemsSubcategory[i].classList.contains(
                                      "active"
                                    )
                                  ) {
                                    // reconoce la subcategoria clickeada
                                    itemsSubcategory[i].classList.remove(
                                      "active"
                                    ); // le remueve la clase 'active' a la categoria que se clickeo anterioremnte para filtrar y asi luego de limpiar el filtro ya no tiene mas la clase 'active'
                                    break;
                                  }
                                }

                                if (!category.isActive) {
                                  filterProducts("category", category.nombre);
                                  setCategories((prevState) =>
                                    prevState.map((cat) =>
                                      cat.nombre === category.nombre
                                        ? { ...cat, isActive: true }
                                        : { ...cat, isActive: false }
                                    )
                                  );
                                }
                              };

                              return (
                                <div className="subcategory-collapse">
                                  <p
                                    key={index}
                                    id="items-collapse"
                                    className={`filter-btn-name-subcategory items-collapse ${
                                      category.isActive ? "active" : ""
                                    }`}
                                    onClick={handleClick}
                                    style={{
                                      cursor: category.isActive
                                        ? "not-allowed"
                                        : "pointer",
                                    }}
                                  >
                                    {category.nombre}
                                  </p>

                                  {category.nombre !== "Promociones" &&
                                    category.nombre !== "Destacados" &&
                                    category.tieneSubcategorias === true && (
                                      <div
                                        className="filter-btn-container"
                                        onClick={() => {
                                          handleSubcategoryClick(
                                            category.nombre
                                          );
                                          RetrieveCategorySubcategories(
                                            category.idCategoria
                                          );

                                          setOpenCategories(
                                            (prevOpenCategories) => {
                                              const categoryIndex =
                                                prevOpenCategories.indexOf(
                                                  category.nombre
                                                );
                                              if (categoryIndex > -1) {
                                                // Si la categoría ya está en openCategories, la removemos (cerrando la categoría)
                                                return prevOpenCategories.filter(
                                                  (openCategory) =>
                                                    openCategory !==
                                                    category.nombre
                                                );
                                              } else {
                                                // Si la categoría no está en openCategories, la agregamos (abriendo la categoría)
                                                // Solo mantenemos la nueva categoría abierta
                                                return [category.nombre];
                                              }
                                            }
                                          );
                                        }}
                                        data-bs-toggle="collapse"
                                        href={`#collapseSubcategory-${category.nombre}`}
                                        role="button"
                                        aria-expanded="false"
                                        aria-controls={`collapseSubcategory-${category.nombre}`}
                                      >
                                        <p className="filter-btn-subcategory">
                                          {subcategorySigns[category.nombre] ||
                                            "+"}
                                        </p>
                                      </div>
                                    )}

                                  {category.nombre !== "Promociones" &&
                                    category.nombre !== "Destacados" && (
                                      <div
                                        className={`collapse ${
                                          openSubcategory === category.nombre
                                            ? "show"
                                            : ""
                                        }`}
                                        id={`collapseSubcategory-${category.nombre}`}
                                      >
                                        <div className="card-collapse">
                                          {subcategories.map(
                                            (subcategory, index) => {
                                              const handleClickSubcategory =
                                                () => {
                                                  setCategoria(null);
                                                  setSubcategoria(
                                                    subcategory.nombre
                                                  );
                                                  setPromocion(null);
                                                  setDestacado(null);

                                                  if (!subcategory.isActive) {
                                                    filterProducts(
                                                      "subcategory",
                                                      subcategory.nombre
                                                    );
                                                    setSubcategories(
                                                      (prevState) =>
                                                        prevState.map(
                                                          (subcat) =>
                                                            subcat.nombre ===
                                                            subcategory.nombre
                                                              ? {
                                                                  ...subcat,
                                                                  isActive: true,
                                                                }
                                                              : {
                                                                  ...subcat,
                                                                  isActive: false,
                                                                }
                                                        )
                                                    );

                                                    const items =
                                                      document.getElementsByClassName(
                                                        "items-collapse"
                                                      ); // identificamos el boton con el nombre de la categoria
                                                    for (
                                                      let i = 0;
                                                      i < items.length;
                                                      i++
                                                    ) {
                                                      //recorremos los botones con las opciones de categorías
                                                      if (
                                                        items[
                                                          i
                                                        ].classList.contains(
                                                          "active"
                                                        )
                                                      ) {
                                                        // reconoce la categoria clickeada
                                                        items[
                                                          i
                                                        ].classList.remove(
                                                          "active"
                                                        ); // le remueve la clase 'active' a la categoria que se clickeo anterioremnte para filtrar y asi luego de limpiar el filtro ya no tiene mas la clase 'active'
                                                        break;
                                                      }
                                                    }
                                                  }
                                                };

                                              return (
                                                <p
                                                  key={index}
                                                  id="items-collapse"
                                                  className={`items-collapse2 ${
                                                    subcategory.isActive
                                                      ? "active"
                                                      : ""
                                                  }`}
                                                  onClick={
                                                    handleClickSubcategory
                                                  }
                                                  style={{
                                                    cursor: subcategory.isActive
                                                      ? "not-allowed"
                                                      : "pointer",
                                                  }}
                                                >
                                                  {subcategory.nombre}
                                                </p>
                                              );
                                            }
                                          )}
                                        </div>
                                      </div>
                                    )}
                                </div>
                              );
                            })}
                        </div>
                      </div>

                      <p className="filter-separator"></p>

                      <div className="filter-btn-container">
                        <p className="filter-btn-name">EN PROMOCIÓN</p>
                        <p className="filter-btn">
                          <input
                            type="checkbox"
                            className="form-check-input tick"
                            id="enPromocion"
                            checked={enPromocion}
                            onChange={() => {
                              setEnPromocion(!enPromocion);
                              if (!enPromocion === true) {
                                filterProducts("promocion", "Promociones");
                              } else {
                                ClearFilter();
                              }
                              setCategoria(null);
                              setSubcategoria(null);
                              setPromocion(!enPromocion);
                              setDestacado(null);
                            }}
                          />
                          <label
                            htmlFor="enPromocion"
                            className="lbl-switch"
                          ></label>
                        </p>
                      </div>

                      <p className="filter-separator"></p>

                      <div className="filter-btn-container">
                        <p className="filter-btn-name">DESTACADO</p>
                        <p className="filter-btn">
                          <input
                            type="checkbox"
                            className="form-check-input tick"
                            id="enDestacado"
                            checked={enDestacado}
                            onChange={() => {
                              setEnDestacado(!enDestacado);
                              if (!enDestacado === true) {
                                filterProducts("destacado", "Destacados");
                              } else {
                                ClearFilter();
                              }
                              setCategoria(null);
                              setSubcategoria(null);
                              setPromocion(null);
                              setDestacado(!enDestacado);
                            }}
                          />
                          <label
                            htmlFor="enDestacado"
                            className="lbl-switch"
                          ></label>
                        </p>
                      </div>

                      <p className="filter-separator"></p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="products-content-list">
                <div className="search-title">
                  <div className="search-container">
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
                        {searchValue && (
                          <span className="input-clearsearch">
                            <Close
                              className="input-group-svg"
                              onClick={ClearFilter}
                              style={{ cursor: "pointer" }}
                            />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="title-lenght">
                    <h2 className="products-title-botton">{title}</h2>
                    {isLoading === false && (
                      <>
                        {products.length > 1 || products.length === 0 ? (
                          <p className="total">
                            Hay {products.length} productos.
                          </p>
                        ) : (
                          <p className="total">
                            Hay {products.length} producto.
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {products.length > 0 ? (
                  <div className="products-list">
                    {productsTable?.map((product, index) => {
                      return (
                        <Link
                          to={`/producto/${product.idProducto}`}
                          className="card"
                          key={index}
                          onClick={() => {
                            setCategoria(null);
                            setSubcategoria(null);
                            setPromocion(null);
                            setDestacado(null);
                          }}
                        >
                          <figure>
                            {product.enDestacado && (
                              <Destacado className="destacado-opcional" />
                            )}
                            {product.enPromocion && (
                              <Promocion
                                className={`promocion-opcional ${
                                  !product.enDestacado ? "solo-promocion" : ""
                                }`}
                              />
                            )}
                            <img
                              className="card-img-top"
                              src={
                                product.urlImagen ||
                                "https://yourfiles.cloud/uploads/98310f0d0f14ff456c3886d644d438b6/vacio.jpg"
                              }
                              alt="Producto"
                            />
                          </figure>
                          <div className="card-body">
                            <p className="card-title">{product.nombre}</p>
                          </div>
                        </Link>
                      );
                    })}

                    {isLoading === false && (
                      <div className="pagination-count-container2">
                        <div className="pagination-count">
                          {products.length > 0 ? (
                            products.length === 1 ? (
                              <p className="total">
                                Producto {firstIndex + 1} de {products.length}
                              </p>
                            ) : (
                              <p className="total">
                                Productos {firstIndex + 1} a{" "}
                                {productsTable.length + firstIndex} de{" "}
                                {products.length}
                              </p>
                            )
                          ) : (
                            <></>
                          )}
                        </div>

                        {products.length > 0 ? (
                          <ul className="pagination-manager">
                            <li className="page-item">
                              <div className="page-link" onClick={prePage}>
                                {"<"}
                              </div>
                            </li>

                            <li className="numbers">
                              {numbers.map((n, i) => {
                                if (n === currentPage) {
                                  // Render the current page number without a link
                                  return (
                                    <ul className="page-item-container" key={i}>
                                      <li className="page-item active" key={i}>
                                        <div className="page-link">{n}</div>
                                      </li>
                                    </ul>
                                  );
                                } else if (
                                  n === 1 ||
                                  n === npage ||
                                  (n >= currentPage - maxPageNumbersToShow &&
                                    n <= currentPage + maxPageNumbersToShow)
                                ) {
                                  // Render the first and last page numbers, or the page numbers within the range around the current page
                                  return (
                                    <li className="page-item" key={i}>
                                      <div
                                        className="page-link"
                                        onClick={() => changeCPage(n)}
                                      >
                                        {n}
                                      </div>
                                    </li>
                                  );
                                } else if (
                                  (n ===
                                    currentPage - maxPageNumbersToShow - 1 &&
                                    currentPage - maxPageNumbersToShow >
                                      minPageNumbersToShow) ||
                                  (n ===
                                    currentPage + maxPageNumbersToShow + 1 &&
                                    currentPage + maxPageNumbersToShow <
                                      npage - minPageNumbersToShow)
                                ) {
                                  // Render the dots to show a break in the page numbers
                                  return (
                                    <li className="page-item" key={i}>
                                      <div className="page-link">...</div>
                                    </li>
                                  );
                                } else {
                                  // Hide the page number if it's not within the range to show
                                  return null;
                                }
                              })}
                            </li>

                            <li className="page-item">
                              <div className="page-link" onClick={nextPage}>
                                {">"}
                              </div>
                            </li>
                          </ul>
                        ) : (
                          <></>
                        )}

                        <div className="pagination-count2">
                          {products.length > 0 ? (
                            products.length === 1 ? (
                              <p className="total">
                                Producto {firstIndex + 1} de {products.length}
                              </p>
                            ) : (
                              <p className="total">
                                Productos {firstIndex + 1} a{" "}
                                {productsTable.length + firstIndex} de{" "}
                                {products.length}
                              </p>
                            )
                          ) : (
                            <></>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : isLoading === true ? (
                  <div className="loading-product">
                    <Loader />
                    <p>Cargando {title}...</p>
                  </div>
                ) : (
                  <div className="notfound-product">
                    <div className="product-svg">
                      <NoProductSvg />
                    </div>
                    <h2 className="title-no">
                      No se han encontrado {title.toString().toLowerCase()}{" "}
                      disponibles en este momento.
                    </h2>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
  //#endregion
}

export default Ecommerce;
