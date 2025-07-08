import React, { useState, useEffect, useContext, useRef } from "react";
import { Helmet } from "react-helmet";
import $ from "jquery";
import Swal from "sweetalert2";
import { Context } from "../../../common/Context";

import Modal from "../../../components/Modal/Modal";
import Mantenimiento from "../../../components/Mantenimiento/Mantenimiento";

import * as signalR from "@microsoft/signalr";

import {
  GetCategoriesMinorista,
  GetCategoriesMayorista,
} from "../../../services/CategoryService";
import { GetFormasEntrega } from "../../../services/ShipmentService";
import { GetUsersSellers } from "../../../services/UserService";
import { SaveOrders } from "../../../services/OrderService";
import { GetPaymentTypes } from "../../../services/PaymentTypeService";
import {
  GetProductsByCategory,
  GetProductsByQuery,
  GetProductsBySubcategory,
  GetProductById,
} from "../../../services/ProductService";
import { GetSubcategoriesByCategory } from "../../../services/SubcategoryService";
import { PayWithMercadoPago } from "../../../services/PaymentService";
import { GetOrderIdByPaymentId } from "../../../services/OrderService";

import { initMercadoPago, Wallet } from "@mercadopago/sdk-react";

//#region Imports de los SVG'S
import { ReactComponent as Zoom } from "../../../assets/svgs/zoom.svg";
import { ReactComponent as Cart } from "../../../assets/svgs/cart.svg";
import { ReactComponent as Back } from "../../../assets/svgs/cartBack.svg";
import { ReactComponent as Delete } from "../../../assets/svgs/delete.svg";
import { ReactComponent as Whatsapplogo } from "../../../assets/svgs/whatsapp.svg";
import { ReactComponent as Close } from "../../../assets/svgs/closebtn.svg";
import { ReactComponent as Save } from "../../../assets/svgs/save.svg";
import { ReactComponent as Lupa } from "../../../assets/svgs/lupa.svg";
import { ReactComponent as Location } from "../../../assets/svgs/location.svg";
import { ReactComponent as Mercadopagologo } from "../../../assets/svgs/mercadopago.svg";
import { ReactComponent as Up } from "../../../assets/svgs/up.svg";
import { ReactComponent as Down } from "../../../assets/svgs/down.svg";
import Loader from "../../../components/Loaders/LoaderCircle";
//#endregion

import "../CatalogueCart/CatalogueCart.css";

const CatalogueCart = () => {
  //#region Constantes
  const { aviso, modalCerrado, mantenimiento, mantenimientoZeide} = useContext(Context);

  const [codigoExcento, setCodigoExcento] = useState(false);

  const [pedidoAprobado, setPedidoAprobado] = useState(false);

  const [showWallet, setShowWallet] = useState(false);
  const [preferenceId, setPreferenceId] = useState(null);
  const [showWalletLoader, setShowWalletLoader] = useState(false);

  const pathname = window.location.pathname.toLowerCase();
  const [clientType, setClientType] = useState("");

  const [click, setClick] = useState(false);
  const handleClick = () => setClick(!click);
  const [isVisible, setIsVisible] = useState(true);
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

  const [productQuantities, setProductQuantities] = useState({});
  const [productNotes, setProductNotes] = useState({});
  const [cart, setCart] = useState({});
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [showButton, setShowButton] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingQuery, setIsLoadingQuery] = useState(false);
  const [isLoadingProductByCategory, setIsLoadingProductByCategory] = useState(
    {}
  );
  const [isLoadingProductBySubcategory, setIsLoadingProductBySubcategory] =
    useState({});
  const [isLoadingSubcategories, setIsLoadingSubcategories] = useState({});

  const [listaNombresVendedores, setListaNombresVendedores] = useState([]);
  const [listaNombresAbonos, setListaNombresAbonos] = useState([]);
  const [listaFormasEntrega, setListaFormasEntrega] = useState([]);

  //#region Constantes para el formulario del cliente
  const [nombre, setNombre] = useState("");
  const [dni, setDni] = useState("");
  const [direccion, setDireccion] = useState("");
  const [newsletter, setNewsletter] = useState(null);

  const { direccionAuto } = useContext(Context);
  const { urlDireccionAuto } = useContext(Context);

  const { horariosAtencion } = useContext(Context);

  const { telefonoEmpresa } = useContext(Context);
  const { whatsapp } = useContext(Context);

  const { cbu } = useContext(Context);
  const { alias } = useContext(Context);

  const { montoMayorista } = useContext(Context);
  const { codigo } = useContext(Context);

  const [costoEnvioDomicilio, setCostoEnvioDomicilio] = useState(0);
  const [nombreEnvio, setNombreEnvio] = useState("");
  const [nombreAbono, setNombreAbono] = useState("");
  const [aclaracionEnvio, setAclaracionEnvio] = useState("");

  const [calles, setCalles] = useState("");
  const [abono, setAbono] = useState("");

  const [telefono, setTelefono] = useState("");

  const [vendedor, setVendedor] = useState("");
  const [envio, setEnvio] = useState("");

  const envioRef = useRef(envio);
  const abonoRef = useRef(abono);
  const vendedorRef = useRef(vendedor);
  //#endregion

  const swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      cancelButton: "custom-cancel-button-class",
    },
    buttonsStyling: true,
  });

  //#region Constantes necesarias para el filtro por busqueda
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [searchValue, setSearchValue] = useState("");
  //#endregion
  //#endregion

  //#region UseEffect
  useEffect(() => {
    initMercadoPago(`${process.env.REACT_APP_MERCADOPAGO_PUBLIC_KEY}`, {
      locale: "es-AR",
    });
  }, []);

  useEffect(() => {
    setCodigoExcento(false);
  }, [codigo]);

  useEffect(() => {
    envioRef.current = envio;
  }, [envio]);

  useEffect(() => {
    vendedorRef.current = vendedor;
  }, [vendedor]);

  useEffect(() => {
    abonoRef.current = abono;
  }, [abono]);

  useEffect(() => {
    // Funciónes asincronas
    (async () => {
      try {
        const response = await GetFormasEntrega();
        setListaFormasEntrega(response.envios);

        await GetUsersSellers(setListaNombresVendedores);

        const responseAbonos = await GetPaymentTypes();
        const abonosHabilitados = responseAbonos.filter(
          (abono) => abono.habilitado
        );
        setListaNombresAbonos(abonosHabilitados);
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
        if (pathname.includes("mayorista")) {
          GetCategoriesMayorista(setCategories);
        } else if (pathname.includes("minorista")) {
          GetCategoriesMinorista(setCategories);
        }
      } catch (error) {
        console.error("Error al obtener las categorias: " + error);
      }
    });

    connection.on("MensajeCrudProducto", async () => {
      try {
        if (query !== "") {
          const products = await GetProductsByQuery(
            query,
            pathname.includes("minorista") ? 1 : 2
          );
          setProducts(products);

          if (pathname.includes("mayorista")) {
            GetCategoriesMayorista(setCategories);
          } else if (pathname.includes("minorista")) {
            GetCategoriesMinorista(setCategories);
          }
        } else {
          // Iterar sobre las categorías abiertas en openCategories
          if (pathname.includes("mayorista")) {
            GetCategoriesMayorista(setCategories);
          } else if (pathname.includes("minorista")) {
            GetCategoriesMinorista(setCategories);
          }

          for (const category of openCategories) {
            let products;

            try {
              setIsLoadingProductByCategory(true);
              products = await GetProductsByCategory(
                category,
                pathname.includes("minorista") ? 1 : 2
              );
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
                    pathname.includes("minorista") ? 1 : 2
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

        const isMayorista = pathname.includes("mayorista");
        const isMinorista = pathname.includes("minorista");

        if (isMayorista) {
          setClientType("Mayorista");
          await GetCategoriesMayorista(setCategories);
        } else if (isMinorista) {
          setClientType("Minorista");
          await GetCategoriesMinorista(setCategories);
        }

        const storedCartKey = isMayorista
          ? "shoppingCartMayorista"
          : "shoppingCartMinorista";
        const storedCart = localStorage.getItem(storedCartKey);

        let newTotalQuantity = 0;

        // Actualizar el carrito con los datos más recientes
        if (storedCart) {
          const parsedCart = JSON.parse(storedCart);
          const updatedCart = {};
          const updatedProductQuantities = {};

          for (const productId in parsedCart) {
            const product = await GetProductById(
              productId,
              pathname.includes("minorista") ? 1 : 2
            );
            if (product) {
              if (product.ocultar === true) {
                // Eliminar el producto del carrito
                updatedProductQuantities[productId] = 0;

                // Mostrar mensaje de eliminación con SweetAlert
                Swal.fire({
                  icon: "warning",
                  title: "Producto No Disponible",
                  imageUrl:
                    product.urlImagen ||
                    "https://yourfiles.cloud/uploads/98310f0d0f14ff456c3886d644d438b6/vacio.jpg",
                  imageWidth: 150,
                  imageHeight: 150,
                  imageAlt: "Producto no disponible",
                  text: `El producto "${product.nombre}" ha sido eliminado del carrito porque no está disponible actualmente.`,
                  confirmButtonText: "Aceptar",
                  confirmButtonColor: "#f8bb86",
                  allowOutsideClick: false,
                });

                continue; // Saltar al siguiente producto en el carrito
              }

              // Verificar si el producto tiene stock transitorio mayor que cero
              else if (product.stockTransitorio > 0) {
                let updatedQuantity = parsedCart[productId].cantidad;

                // Verificar si la cantidad en el carrito es mayor que la cantidad disponible
                if (updatedQuantity > product.stockTransitorio) {
                  // Ajustar la cantidad en el carrito al stock transitorio disponible
                  updatedQuantity = product.stockTransitorio;

                  // Mostrar mensaje de eliminación con SweetAlert
                  const quantityToRemove =
                    parsedCart[productId].cantidad - updatedQuantity;
                  Swal.fire({
                    icon: "warning",
                    title: "Cantidad Ajustada",
                    imageUrl:
                      product.urlImagen ||
                      "https://yourfiles.cloud/uploads/98310f0d0f14ff456c3886d644d438b6/vacio.jpg",
                    imageWidth: 150,
                    imageHeight: 150,
                    imageAlt: "Producto ajustado",
                    text: `Se ha${
                      quantityToRemove > 1 ? "n" : ""
                    } eliminado ${quantityToRemove} unidad${
                      quantityToRemove > 1 ? "es" : ""
                    } del producto "${
                      product.nombre
                    }" del carrito debido a falta de stock.`,
                    confirmButtonText: "Aceptar",
                    confirmButtonColor: "#f8bb86",
                    allowOutsideClick: false,
                  });
                }

                updatedCart[productId] = {
                  ...product,
                  cantidad: updatedQuantity,
                  aclaraciones: parsedCart[productId].aclaraciones,
                };
                updatedProductQuantities[productId] = updatedQuantity;

                // Actualizar el totalQuantity sumando la cantidad actualizada de este producto en el carrito
                newTotalQuantity += updatedQuantity;
              } else {
                // Mostrar mensaje de eliminación con SweetAlert
                Swal.fire({
                  icon: "warning",
                  title: "Producto Agotado",
                  imageUrl:
                    product.urlImagen ||
                    "https://yourfiles.cloud/uploads/98310f0d0f14ff456c3886d644d438b6/vacio.jpg",
                  imageWidth: 150,
                  imageHeight: 150,
                  imageAlt: "Producto agotado",
                  text: `El producto "${product.nombre}" ha sido eliminado del carrito debido a falta de stock.`,
                  confirmButtonText: "Aceptar",
                  confirmButtonColor: "#f8bb86",
                  allowOutsideClick: false,
                });
                updatedProductQuantities[productId] = 0;
              }
            }
          }

          // Actualizar el carrito y el local storage con los productos actualizados
          setCart(updatedCart);
          updateLocalStorage(updatedCart);

          // Actualizar el totalQuantity en el estado
          setTotalQuantity(newTotalQuantity);
          setProductQuantities(updatedProductQuantities);
        }

        // Actualizar las categorías después de actualizar productos
        if (pathname.includes("mayorista")) {
          GetCategoriesMayorista(setCategories);
        } else if (pathname.includes("minorista")) {
          GetCategoriesMinorista(setCategories);
        }
      } catch (error) {
        console.error("Error al obtener los productos: " + error);
      }
    });

    connection.on("MensajeCreatePedido", async () => {
      try {
        if (query !== "") {
          const products = await GetProductsByQuery(
            query,
            pathname.includes("minorista") ? 1 : 2
          );
          setProducts(products);

          if (pathname.includes("mayorista")) {
            GetCategoriesMayorista(setCategories);
          } else if (pathname.includes("minorista")) {
            GetCategoriesMinorista(setCategories);
          }
        } else {
          // Iterar sobre las categorías abiertas en openCategories
          if (pathname.includes("mayorista")) {
            GetCategoriesMayorista(setCategories);
          } else if (pathname.includes("minorista")) {
            GetCategoriesMinorista(setCategories);
          }

          for (const category of openCategories) {
            let products;

            try {
              setIsLoadingProductByCategory(true);
              products = await GetProductsByCategory(
                category,
                pathname.includes("minorista") ? 1 : 2
              );
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
                    pathname.includes("minorista") ? 1 : 2
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
        const isMayorista = pathname.includes("mayorista");
        const isMinorista = pathname.includes("minorista");

        if (isMayorista) {
          setClientType("Mayorista");
          await GetCategoriesMayorista(setCategories);
        } else if (isMinorista) {
          setClientType("Minorista");
          await GetCategoriesMinorista(setCategories);
        }

        const storedCartKey = isMayorista
          ? "shoppingCartMayorista"
          : "shoppingCartMinorista";
        const storedCart = localStorage.getItem(storedCartKey);

        let newTotalQuantity = 0;

        // Actualizar el carrito con los datos más recientes
        if (storedCart) {
          const parsedCart = JSON.parse(storedCart);
          const updatedCart = {};
          const updatedProductQuantities = {};

          for (const productId in parsedCart) {
            const product = await GetProductById(
              productId,
              pathname.includes("minorista") ? 1 : 2
            );
            if (product) {
              if (product.stockTransitorio > 0) {
                let updatedQuantity = parsedCart[productId].cantidad;

                if (updatedQuantity > product.stockTransitorio) {
                  updatedQuantity = product.stockTransitorio;

                  const quantityToRemove =
                    parsedCart[productId].cantidad - updatedQuantity;
                  Swal.fire({
                    icon: "warning",
                    title: "Cantidad Ajustada",
                    imageUrl:
                      product.urlImagen ||
                      "https://yourfiles.cloud/uploads/98310f0d0f14ff456c3886d644d438b6/vacio.jpg",
                    imageWidth: 150,
                    imageHeight: 150,
                    imageAlt: "Producto ajustado",
                    text: `Se ha${
                      quantityToRemove > 1 ? "n" : ""
                    } eliminado ${quantityToRemove} unidad${
                      quantityToRemove > 1 ? "es" : ""
                    } del producto "${
                      product.nombre
                    }" del carrito debido a falta de stock.`,
                    confirmButtonText: "Aceptar",
                    confirmButtonColor: "#f8bb86",
                    allowOutsideClick: false,
                  });
                }

                updatedCart[productId] = {
                  ...product,
                  cantidad: updatedQuantity,
                  aclaraciones: parsedCart[productId].aclaraciones,
                };
                updatedProductQuantities[productId] = updatedQuantity;

                newTotalQuantity += updatedQuantity;
              } else {
                Swal.fire({
                  icon: "warning",
                  title: "Producto Agotado",
                  imageUrl:
                    product.urlImagen ||
                    "https://yourfiles.cloud/uploads/98310f0d0f14ff456c3886d644d438b6/vacio.jpg",
                  imageWidth: 150,
                  imageHeight: 150,
                  imageAlt: "Producto agotado",
                  text: `El producto "${product.nombre}" ha sido eliminado del carrito debido a falta de stock.`,
                  confirmButtonText: "Aceptar",
                  confirmButtonColor: "#f8bb86",
                  allowOutsideClick: false,
                });
                updatedProductQuantities[productId] = 0;
              }
            }
          }

          setCart(updatedCart);
          updateLocalStorage(updatedCart);
          setTotalQuantity(newTotalQuantity);
          setProductQuantities(updatedProductQuantities);
        }

        if (pathname.includes("mayorista")) {
          GetCategoriesMayorista(setCategories);
        } else if (pathname.includes("minorista")) {
          GetCategoriesMinorista(setCategories);
        }
      } catch (error) {
        console.error("Error al obtener los productos: " + error);
      }
    });

    connection.on("MensajeUpdateDeletePedido", async () => {
      try {
        if (query !== "") {
          const products = await GetProductsByQuery(
            query,
            pathname.includes("minorista") ? 1 : 2
          );
          setProducts(products);

          if (pathname.includes("mayorista")) {
            GetCategoriesMayorista(setCategories);
          } else if (pathname.includes("minorista")) {
            GetCategoriesMinorista(setCategories);
          }
        } else {
          // Iterar sobre las categorías abiertas en openCategories
          if (pathname.includes("mayorista")) {
            GetCategoriesMayorista(setCategories);
          } else if (pathname.includes("minorista")) {
            GetCategoriesMinorista(setCategories);
          }

          for (const category of openCategories) {
            let products;

            try {
              setIsLoadingProductByCategory(true);
              products = await GetProductsByCategory(
                category,
                pathname.includes("minorista") ? 1 : 2
              );
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
                    pathname.includes("minorista") ? 1 : 2
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
        if (pathname.includes("mayorista")) {
          GetCategoriesMayorista(setCategories);
        } else if (pathname.includes("minorista")) {
          GetCategoriesMinorista(setCategories);
        }
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

    connection.on("MensajeUpdateCotizacion", async () => {
      try {
        if (query !== "") {
          const products = await GetProductsByQuery(
            query,
            pathname.includes("minorista") ? 1 : 2
          );
          setProducts(products);

          if (pathname.includes("mayorista")) {
            GetCategoriesMayorista(setCategories);
          } else if (pathname.includes("minorista")) {
            GetCategoriesMinorista(setCategories);
          }
        } else {
          // Iterar sobre las categorías abiertas en openCategories
          if (pathname.includes("mayorista")) {
            GetCategoriesMayorista(setCategories);
          } else if (pathname.includes("minorista")) {
            GetCategoriesMinorista(setCategories);
          }

          for (const category of openCategories) {
            let products;

            try {
              setIsLoadingProductByCategory(true);
              products = await GetProductsByCategory(
                category,
                pathname.includes("minorista") ? 1 : 2
              );
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
                    pathname.includes("minorista") ? 1 : 2
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

        const isMayorista = pathname.includes("mayorista");
        const isMinorista = pathname.includes("minorista");

        if (isMayorista) {
          setClientType("Mayorista");
          await GetCategoriesMayorista(setCategories);
        } else if (isMinorista) {
          setClientType("Minorista");
          await GetCategoriesMinorista(setCategories);
        }

        const storedCartKey = isMayorista
          ? "shoppingCartMayorista"
          : "shoppingCartMinorista";
        const storedCart = localStorage.getItem(storedCartKey);

        let newTotalQuantity = 0;

        // Actualizar el carrito con los datos más recientes
        if (storedCart) {
          const parsedCart = JSON.parse(storedCart);
          const updatedCart = {};
          const updatedProductQuantities = {};

          for (const productId in parsedCart) {
            const product = await GetProductById(
              productId,
              pathname.includes("minorista") ? 1 : 2
            );
            if (product) {
              // Verificar si el producto tiene stock transitorio mayor que cero
              let updatedQuantity = parsedCart[productId].cantidad;

              updatedCart[productId] = {
                ...product,
                cantidad: updatedQuantity,
                aclaraciones: parsedCart[productId].aclaraciones,
              };
              updatedProductQuantities[productId] = updatedQuantity;

              // Actualizar el totalQuantity sumando la cantidad actualizada de este producto en el carrito
              newTotalQuantity += updatedQuantity;
            }
          }

          // Actualizar el carrito y el local storage con los productos actualizados
          setCart(updatedCart);
          updateLocalStorage(updatedCart);

          // Actualizar el totalQuantity en el estado
          setTotalQuantity(newTotalQuantity);
          setProductQuantities(updatedProductQuantities);
        }

        // Actualizar las categorías después de actualizar productos
        if (pathname.includes("mayorista")) {
          GetCategoriesMayorista(setCategories);
        } else if (pathname.includes("minorista")) {
          GetCategoriesMinorista(setCategories);
        }
      } catch (error) {
        console.error("Error al obtener los productos: " + error);
      }
    });

    connection.on("MensajeCrudEntrega", async () => {
      try {
        const response = await GetFormasEntrega();
        setListaFormasEntrega(response.envios);

        const currentEnvio = envioRef.current;

        if (currentEnvio !== "") {
          const selectedEnvio = response.envios.find(
            (opt) => opt.idEnvio == currentEnvio
          );
          if (selectedEnvio) {
            setCostoEnvioDomicilio(Number(selectedEnvio.costo));
          } else {
            setEnvio("");
            setCostoEnvioDomicilio(0);
            setNombreEnvio("");
          }
        }
      } catch (error) {
        console.error("Error al obtener el costo de envío: " + error);
      }
    });

    connection.on("MensajeCrudVendedor", async () => {
      try {
        await GetUsersSellers(setListaNombresVendedores);

        const currentVendedor = vendedorRef.current;

        if (currentVendedor !== "") {
          const selectedVendedor = listaNombresVendedores.find(
            (opt) => opt.idUsuario == currentVendedor
          );
          if (!selectedVendedor) {
            setVendedor("");
          }
        }
      } catch (error) {
        console.error("Error al obtener los vendedores: " + error);
      }
    });

    connection.on("MensajeCrudMetodoPago", async () => {
      try {
        const responseAbonos = await GetPaymentTypes();
        const abonosHabilitados = responseAbonos.filter(
          (abono) => abono.habilitado
        );
        setListaNombresAbonos(abonosHabilitados);

        const currentAbono = abonoRef.current;

        if (currentAbono !== "") {
          const selectedAbono = listaNombresAbonos.find(
            (opt) => opt.idMetodoPago == currentAbono
          );
          if (!selectedAbono) {
            setAbono("");
            setNombreAbono("");
          }
        }
      } catch (error) {
        console.error("Error al obtener los medios de pago: " + error);
      }
    });

    return () => {
      connection.stop();
    };
  }, [openCategories, openSubcategories, query]);

  useEffect(() => {
    calculateTotal();
  }, [
    totalQuantity,
    envio,
    modalAbierto,
    costoEnvioDomicilio,
    listaFormasEntrega,
  ]);

  useEffect(() => {
    // Mostrar u ocultar el botón de WhatsApp en función de totalQuantity (Si es mayor o igual a 1 se mostrara, por lo contrario se escondera)
    if (totalQuantity >= 1 && modalAbierto === false) {
      setShowButton(true);
    } else {
      setShowButton(false);
    }
  }, [totalQuantity, modalAbierto]);

  useEffect(() => {
    const fetchData = async () => {
      const isMayorista = pathname.includes("mayorista");
      const isMinorista = pathname.includes("minorista");

      if (isMayorista) {
        setClientType("Mayorista");
        await GetCategoriesMayorista(setCategories);
      } else if (isMinorista) {
        setClientType("Minorista");
        await GetCategoriesMinorista(setCategories);
      }

      const storedCartKey = isMayorista
        ? "shoppingCartMayorista"
        : "shoppingCartMinorista";
      const storedCart = localStorage.getItem(storedCartKey);

      const urlParams = new URLSearchParams(window.location.search);
      const paymentId = urlParams.get("payment_id");
      const collectionStatus = urlParams.get("collection_status");

      if (!paymentId) {
        const storedFormData = localStorage.getItem("userData");

        if (storedFormData && storedFormData !== "{}") {
          const parsedFormData = JSON.parse(storedFormData);

          setNombre(parsedFormData.nombre || "");
          setDni(parsedFormData.dni || "");
          setDireccion(parsedFormData.direccion || "");
          setCalles(parsedFormData.calles || "");
          setTelefono(parsedFormData.telefono || "");
          setAbono(parsedFormData.abono || "");
          setNombreAbono(parsedFormData.nombreAbono || "");
          setVendedor(parsedFormData.vendedor || "");
          setEnvio(parsedFormData.envio || "");
          setNombreEnvio(parsedFormData.nombreEnvio || "");
          setAclaracionEnvio(parsedFormData.aclaracionEnvio || "");
          setCostoEnvioDomicilio(parsedFormData.costoEnvioDomicilio || "");
        }

        if (storedCart && storedCart !== "{}") {
          const parsedCart = JSON.parse(storedCart);
          setCart(parsedCart);

          const productQuantities = Object.values(parsedCart).reduce(
            (quantities, product) => {
              quantities[product.idProducto] = product.cantidad;
              return quantities;
            },
            {}
          );

          setProductQuantities(productQuantities);

          const totalQuantitySum = Object.values(productQuantities).reduce(
            (sum, quantity) => sum + quantity,
            0
          );
          setTotalQuantity(totalQuantitySum);

          setModalAbierto(true);

          Swal.fire({
            title: "Carrito encontrado!",
            text: "¿Quieres continuar comprando o vaciar el carrito?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Continuar Comprando",
            cancelButtonText: "Vaciar Carrito",
            allowOutsideClick: false,
            confirmButtonColor: "#87adbd",
            cancelButtonColor: "#dc3545",
          }).then((result) => {
            if (result.isConfirmed) {
              setModalAbierto(false);
              // No hacer nada, continuar comprando
            } else if (result.isDismissed) {
              Swal.fire({
                title: "¿Estás seguro de vaciar el carrito?",
                text: "Al hacer esto, no podrás recuperar los productos de este carrito.",
                icon: "warning",
                showCancelButton: true,
                allowOutsideClick: false,
                confirmButtonText: "Sí, vaciar carrito",
                cancelButtonText: "Cancelar",
                confirmButtonColor: "#f8bb86",
              }).then((confirmationResult) => {
                if (confirmationResult.isConfirmed) {
                  clearCart();
                  setModalAbierto(false);
                }
              });
            }
          });
        }
      } else if (paymentId === "null" || collectionStatus === "rejected") {
        setModalAbierto(true);
        Swal.fire({
          title: "Pago rechazado",
          text: "inténtelo de nuevo o cambie el método de pago.",
          icon: "error",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#dc3545",
          allowOutsideClick: false,
        }).then((confirmationResult) => {
          if (confirmationResult.isConfirmed) {
            setModalAbierto(false);
          }
        });

        const storedFormData = localStorage.getItem("userData");

        if (storedFormData) {
          const parsedFormData = JSON.parse(storedFormData);

          setNombre(parsedFormData.nombre || "");
          setDni(parsedFormData.dni || "");
          setDireccion(parsedFormData.direccion || "");
          setCalles(parsedFormData.calles || "");
          setTelefono(parsedFormData.telefono || "");
          setAbono(parsedFormData.abono || "");
          setNombreAbono(parsedFormData.nombreAbono || "");
          setVendedor(parsedFormData.vendedor || "");
          setEnvio(parsedFormData.envio || "");
          setNombreEnvio(parsedFormData.nombreEnvio || "");
          setAclaracionEnvio(parsedFormData.aclaracionEnvio || "");
          setCostoEnvioDomicilio(parsedFormData.costoEnvioDomicilio || "");
        }

        if (storedCart && storedCart !== "{}") {
          const parsedCart = JSON.parse(storedCart);
          setCart(parsedCart);

          const productQuantities = Object.values(parsedCart).reduce(
            (quantities, product) => {
              quantities[product.idProducto] = product.cantidad;
              return quantities;
            },
            {}
          );

          setProductQuantities(productQuantities);

          const totalQuantitySum = Object.values(productQuantities).reduce(
            (sum, quantity) => sum + quantity,
            0
          );
          setTotalQuantity(totalQuantitySum);
        }
      } else if (paymentId && collectionStatus === "approved") {
        await GetUsersSellers(setListaNombresVendedores);

        const storedFormData = localStorage.getItem("userData");

        if (storedFormData) {
          const parsedFormData = JSON.parse(storedFormData);

          setNombre(parsedFormData.nombre || "");
          setDni(parsedFormData.dni || "");
          setDireccion(parsedFormData.direccion || "");
          setCalles(parsedFormData.calles || "");
          setTelefono(parsedFormData.telefono || "");
          setAbono(parsedFormData.abono || "");
          setNombreAbono(parsedFormData.nombreAbono || "");
          setVendedor(parsedFormData.vendedor || "");
          setEnvio(parsedFormData.envio || "");
          setNombreEnvio(parsedFormData.nombreEnvio || "");
          setAclaracionEnvio(parsedFormData.aclaracionEnvio || "");
          setCostoEnvioDomicilio(parsedFormData.costoEnvioDomicilio || "");
        }

        if (storedCart && storedCart !== "{}") {
          const parsedCart = JSON.parse(storedCart);
          setCart(parsedCart);

          const productQuantities = Object.values(parsedCart).reduce(
            (quantities, product) => {
              quantities[product.idProducto] = product.cantidad;
              return quantities;
            },
            {}
          );

          setProductQuantities(productQuantities);
        }

        setPedidoAprobado(true);
      }
    };

    fetchData();
    // The dependency array is kept minimal to avoid multiple triggers
    // It's assumed that pathname will change when clientType changes, thus avoiding direct dependency on clientType
  }, [pathname, pedidoAprobado]);

  useEffect(() => {
    const isMayorista = pathname.includes("mayorista");

    const storedCartKey = isMayorista
      ? "shoppingCartMayorista"
      : "shoppingCartMinorista";
    const storedCart = localStorage.getItem(storedCartKey);

    if (pedidoAprobado && storedCart) {
      Swal.fire({
        title: "Pago aprobado",
        text: "Su pago ha sido procesado correctamente.",
        icon: "success",
        confirmButtonText: "Aceptar y enviar pedido por WhatsApp",
        confirmButtonColor: "#a5dc86",
        allowOutsideClick: false,
      }).then((result) => {
        if (result.isConfirmed) {
          handleSubmitPedidoAprobado();
        }
      });
    } else if (pedidoAprobado === true && !storedCart) {
      Swal.fire({
        title: "Pago aprobado",
        text: "Su pago ha sido procesado correctamente.",
        icon: "success",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#a5dc86",
        allowOutsideClick: false,
      });
    }
  }, [pedidoAprobado]);
  //#endregion

  const handleNewsletterChange = (event) => {
    const isChecked = event.target.checked;
    setNewsletter(isChecked ? true : null);
  };

  const calculateTotalAhorro = () => {
    let totalAhorro = 0;

    Object.values(cart).forEach((product) => {
      const cantidad = productQuantities[product.idProducto] || 0;
      const precioBase = product.precioPesos;
      let precioAplicado = precioBase;

      if (
        product.precioPesos3 > 0 &&
        product.cantidadMayorista3 > 0 &&
        cantidad >= product.cantidadMayorista3
      ) {
        precioAplicado = product.precioPesos3;
      } else if (
        product.precioPesos2 > 0 &&
        product.cantidadMayorista2 > 0 &&
        cantidad >= product.cantidadMayorista2
      ) {
        precioAplicado = product.precioPesos2;
      }

      const ahorroUnitario = Math.max(0, precioBase - precioAplicado);
      totalAhorro += ahorroUnitario * cantidad;
    });

    return totalAhorro;
  };

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

  //#region Función para formatear el stock disponible para mostrar
  function formatStock(stock) {
    if (stock <= 10) {
      return stock;
    } else {
      const tens = Math.floor(stock / 10);
      const increase = tens * 10;
      return `+${increase}`;
    }
  }
  //#endregion

  const handleOnReady = () => {
    setShowWalletLoader(false);
  };

  //#region Función para filtrar los productos por query
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
        const products = await GetProductsByQuery(
          value,
          pathname.includes("minorista") ? 1 : 2
        );

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

  //#region Función para abrir el "+" o "-" de cada categoría
  const handleCategoryClick = async (index) => {
    setCategorySign((prevSigns) => ({
      ...prevSigns,
      [index]: prevSigns[index] === "-" ? "+" : "-",
    }));

    const category = categories[index].nombre;
    const idCategory = categories[index].idCategoria;
    const hasSubcategories = categories[index].tieneSubcategorias;

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

    if (hasSubcategories) {
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
      products = await GetProductsByCategory(
        category,
        pathname.includes("minorista") ? 1 : 2
      );
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
      products = await GetProductsBySubcategory(
        idCategory,
        idSubcategory,
        pathname.includes("minorista") ? 1 : 2
      );
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

  //#region Función para agregar productos al carrito
  const handleAdd = (product) => {
    const availableStock = product.stockTransitorio;
    const currentQuantity = productQuantities[product.idProducto] || 0;

    if (currentQuantity < availableStock) {
      setProductQuantities((prevQuantities) => ({
        ...prevQuantities,
        [product.idProducto]: (prevQuantities[product.idProducto] || 0) + 1,
      }));

      setCart((prevCart) => {
        const updatedCart = { ...prevCart };
        const quantity = updatedCart[product.idProducto]?.cantidad || 0;
        const aclaraciones =
          updatedCart[product.idProducto]?.aclaraciones || "";
        updatedCart[product.idProducto] = {
          ...product,
          cantidad: quantity + 1,
          aclaraciones,
        };

        // Actualizar el localStorage con el nuevo carrito
        updateLocalStorage(updatedCart);

        return updatedCart;
      });

      setProductNotes((prevNotes) => ({
        ...prevNotes,
        [product.idProducto]: prevNotes[product.idProducto] || "",
      }));

      setTotalQuantity((prevQuantity) => prevQuantity + 1);
    } else {
      Swal.fire({
        icon: "warning",
        title: "No hay más unidades de stock para agregar",
        text: `Lo sentimos, solo hay ${availableStock} unidad${
          availableStock > 1 ? "es" : ""
        } disponible${availableStock > 1 ? "s" : ""} en este momento.`,
        confirmButtonText: "Aceptar",
        showCancelButton: false,
        confirmButtonColor: "#f8bb86",
      });
    }
  };
  //#endregion

  //#region Función para actualizar la cantidad total de productos
  const updateTotalQuantity = () => {
    let total = 0;
    for (const productId in productQuantities) {
      total += productQuantities[productId];
    }
    setTotalQuantity(total);
  };
  //#endregion

  //#region Función para quitar productos del carrito
  const handleSubtract = (product) => {
    const quantity = productQuantities[product.idProducto] || 0;

    if (quantity > 0) {
      setProductQuantities((prevQuantities) => ({
        ...prevQuantities,
        [product.idProducto]: Math.max(0, quantity - 1),
      }));

      setCart((prevCart) => {
        const updatedCart = { ...prevCart };
        const updatedQuantity = updatedCart[product.idProducto]?.cantidad || 0;

        if (updatedQuantity > 1) {
          updatedCart[product.idProducto] = {
            ...product,
            cantidad: updatedQuantity - 1,
            aclaraciones: prevCart[product.idProducto]?.aclaraciones || "",
          };
        } else {
          delete updatedCart[product.idProducto];
          delete productNotes[product.idProducto];
        }

        // Actualizar el localStorage con el nuevo carrito
        updateLocalStorage(updatedCart);

        return updatedCart;
      });

      setTotalQuantity((prevQuantity) => prevQuantity - 1);
    }
  };
  //#endregion

  //#region Función para manejar la cantidad de productos ingresados por input
  const handleQuantityChange = (event, product) => {
    const value = parseInt(event.target.value);
    const maxStock = product.stockTransitorio;

    // Verificar que la cantidad no supere el stock transitorio
    if (value > maxStock) {
      Swal.fire({
        icon: "warning",
        title: "La cantidad de unidades ingresada no está disponible",
        text: `Lo sentimos, solo hay ${maxStock} unidades disponibles en este momento.`,
        confirmButtonText: "Aceptar",
        showCancelButton: false,
        confirmButtonColor: "#f8bb86",
      });
      // Restaurar la cantidad a la máxima permitida
      event.target.value = maxStock;
      return; // Salir de la función para evitar continuar con la actualización
    }

    setProductQuantities((prevQuantities) => ({
      ...prevQuantities,
      [product.idProducto]: isNaN(value) ? 0 : value,
    }));

    setCart((prevCart) => {
      const updatedCart = { ...prevCart };
      const updatedQuantity = isNaN(value) ? 0 : value;

      if (updatedQuantity > 0) {
        updatedCart[product.idProducto] = {
          ...product,
          cantidad: updatedQuantity,
          aclaraciones: prevCart[product.idProducto]?.aclaraciones || "",
        };
      } else {
        delete updatedCart[product.idProducto];
        delete productNotes[product.idProducto];
      }

      // Calcula la cantidad total sumando las cantidades de todos los productos en el carrito
      let total = 0;
      for (const productId in updatedCart) {
        total += updatedCart[productId].cantidad;
      }
      setTotalQuantity(total);

      // Actualizar el localStorage con el nuevo carrito
      updateLocalStorage(updatedCart);

      return updatedCart;
    });

    setProductNotes((prevNotes) => ({
      ...prevNotes,
      [product.idProducto]: prevNotes[product.idProducto] || "",
    }));
  };
  //#endregion

  //#region Función para manejar las aclaraciones de cada producto
  const handleAclaracionesChange = (event, product) => {
    const value = event.target.value;

    setCart((prevCart) => {
      const updatedCart = { ...prevCart };
      updatedCart[product.idProducto] = {
        ...product,
        cantidad: prevCart[product.idProducto]?.cantidad || 0,
        aclaraciones: value,
      };

      // Actualizar el localStorage con el nuevo carrito
      updateLocalStorage(updatedCart);

      return updatedCart;
    });

    setProductNotes((prevNotes) => ({
      ...prevNotes,
      [product.idProducto]: value,
    }));
  };
  //#endregion

  //#region Función para calcular los subtotales de cada producto
  const calculateSubtotal = (product) => {
    const quantity = productQuantities[product.idProducto] || 0;

    // Verificar si se cumple la condición para precios mayoristas
    if (product.precioPesos3 > 0 && quantity >= product.cantidadMayorista3) {
      return product.precioPesos3 * quantity;
    } else if (
      product.precioPesos2 > 0 &&
      quantity >= product.cantidadMayorista2
    ) {
      return product.precioPesos2 * quantity;
    } else {
      return product.precioPesos * quantity;
    }
  };
  //#endregion

  //#region Función para calcular el monto total del pedido
  const calculateTotal = () => {
    let total = 0;
    for (const productId in cart) {
      const product = cart[productId];
      total += calculateSubtotal(product);
    }

    // Agregar el costo de envío si corresponde
    if (costoEnvioDomicilio > 0) {
      total += costoEnvioDomicilio;
    }

    return total;
  };
  //#endregion

  //#region Función para los datos del cliente del formulario
  const ClearFormData = () => {
    localStorage.removeItem("userData");
  };
  //#endregion

  //#region Función para borrar el carrito entero
  const clearCart = () => {
    setCart({});
    // Actualizar el localStorage con el nuevo carrito
    // updateLocalStorage({});

    if (pathname.includes("mayorista")) {
      localStorage.removeItem("shoppingCartMayorista");
    } else if (pathname.includes("minorista")) {
      localStorage.removeItem("shoppingCartMinorista");
    }
    setProductQuantities({});
    setProductNotes({});
    setTotalQuantity(0);
  };
  //#endregion

  //#region Función para eliminar productos del carrito
  const handleDelete = (product) => {
    setTotalQuantity((prevQuantity) => prevQuantity - product.cantidad);

    setCart((prevCart) => {
      const updatedCart = { ...prevCart };
      delete updatedCart[product.idProducto];
      delete productQuantities[product.idProducto];
      delete productNotes[product.idProducto];

      // Actualizar el localStorage con el nuevo carrito
      updateLocalStorage(updatedCart);

      return updatedCart;
    });
  };
  //#endregion

  //#region Función para guardar carrito en el local storage
  const updateLocalStorage = (cart) => {
    localStorage.setItem(
      clientType === "Mayorista"
        ? "shoppingCartMayorista"
        : "shoppingCartMinorista",
      JSON.stringify(cart)
    );
  };
  //#endregion

  //#region Función para crear el pedido y luego enviarlo por Mercado Pago
  const handleSubmitPedidoMercadoPago = async (e) => {
    e.preventDefault();

    setShowWalletLoader(true);

    if (IsValid() === true) {
      try {
        e.preventDefault();

        const productosMp = Object.values(cart).map((producto) => {
          const quantity = productQuantities[producto.idProducto] || 0;
          let precio;

          if (
            producto.precioPesos3 > 0 &&
            quantity >= producto.cantidadMayorista3
          ) {
            precio = producto.precioPesos3;
          } else if (
            producto.precioPesos2 > 0 &&
            quantity >= producto.cantidadMayorista2
          ) {
            precio = producto.precioPesos2;
          } else {
            precio = producto.precioPesos;
          }

          return {
            IdProducto: producto.idProducto.toString(),
            Nombre: producto.nombre,
            Cantidad: producto.cantidad,
            Precio: precio,
            Aclaracion: producto.aclaraciones,
          };
        });

        const clienteMp = {
          nombreCompleto: nombre, // Reemplaza con el nombre real del cliente
          dni: dni.toString(), // Reemplaza con el DNI real del cliente
          telefono: telefono.toString(), // Reemplaza con el teléfono real del cliente
          tipoCliente: clientType === "Minorista" ? 1 : 2, // 1 para minorista, 2 para mayorista
          direccion: nombreEnvio.toLowerCase().includes("domicilio")
            ? direccion
            : "",
          entreCalles: nombreEnvio.toLowerCase().includes("domicilio")
            ? calles
            : "",
          idVendedor: pathname.includes("redes") ? "-1" : vendedor,
        };

        const response = await PayWithMercadoPago({
          url: `https://lagranferia:3000/catalogo-${
            clientType === "Mayorista" ? "mayorista" : "minorista"
          }`,
          productos: productosMp, // Enviar la lista de productos al backend
          cliente: clienteMp,
          costoEnvio: costoEnvioDomicilio > 0 ? costoEnvioDomicilio : 0,
        });

        if (response.preferenceId !== null) {
          setPreferenceId(response.preferenceId);
          setShowWallet(true);

          // Create an object with the values you want to store
          const userData = {
            nombre,
            dni,
            direccion,
            calles,
            telefono,
            abono,
            nombreAbono,
            vendedor,
            envio,
            nombreEnvio,
            aclaracionEnvio,
            costoEnvioDomicilio,
          };

          // Convert the object to a JSON string and store it in localStorage
          localStorage.setItem("userData", JSON.stringify(userData));
        }
      } catch (error) {
        console.error("Error durante PayWithMercadoPago:", error);
        // Manejar el error apropiadamente (e.g., mostrar un mensaje al usuario)
      }
    }
  };
  //#endregion

  const handleSubmitPedidoAprobado = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const paymentId = urlParams.get("payment_id");

      const orderByPaymentId = await GetOrderIdByPaymentId(paymentId);
      const orderId = orderByPaymentId.idPedido;

      // Crear el mensaje con la información del pedido para Whatsapp
      if (paymentId) {
        let mensaje = "```Datos del cliente:```\n\n";

        mensaje += `*Nombre completo*:\n_${nombre}_\n\n`;

        mensaje += `*DNI*:\n_${dni}_\n\n`;

        mensaje += `*Entrega*:\n_${nombreEnvio} ($${
          costoEnvioDomicilio || costoEnvioDomicilio === 0
            ? costoEnvioDomicilio
            : 0
        })${aclaracionEnvio ? ` - ${aclaracionEnvio}` : ""}_\n\n`;

        if (nombreEnvio.toLowerCase().includes("domicilio")) {
          mensaje += `*Dirección*:\n_${direccion}_\n\n`;
          mensaje += `*Entre calles*:\n_${calles}_\n\n`;
        }

        mensaje += `*Número de teléfono*:\n_${telefono}_\n\n`;

        mensaje += `*Abona con*:\n_${nombreAbono}_\n\n`;

        if (clientType === "Mayorista" && newsletter === true) {
          mensaje +=
            "`Quiero suscribirme a la lista de difusión de WhatsApp 📢`\n\n";
        }

        mensaje += `*----------------------------------*\n\n`;
        if (
          (nombreEnvio.toLowerCase().includes("local") &&
            ((direccionAuto !== null && direccionAuto !== "") ||
              (horariosAtencion !== null && horariosAtencion !== ""))) ||
          (telefonoEmpresa !== null && telefonoEmpresa !== "") ||
          (nombreAbono.toLowerCase() === "transferencia" &&
            ((cbu !== null && cbu !== "") ||
              (alias !== null && alias !== ""))) ||
          (!pathname.includes("redes") && vendedor !== "-1")
        ) {
          mensaje += "```Datos de la empresa:```\n\n";

          if (nombreEnvio.toLowerCase().includes("local")) {
            if (direccionAuto !== null && direccionAuto !== "") {
              mensaje += `*Dirección*:\n_${direccionAuto}_\n\n`;
            }
            if (horariosAtencion !== null && horariosAtencion !== "") {
              mensaje += `*Horarios de atención:*\n_${horariosAtencion}_\n\n`;
            }
          }

          if (telefonoEmpresa !== null && telefonoEmpresa !== "") {
            mensaje += `*Número de teléfono*:\n_${telefonoEmpresa}_\n\n`;
          }

          if (nombreAbono.toLowerCase() == "transferencia") {
            if (cbu !== null && cbu !== "") {
              mensaje += `*CBU*:\n_${cbu}_\n\n`;
            }
            if (alias !== null && alias !== "") {
              mensaje += `*ALIAS*:\n_${alias}_\n\n`;
            }
          }

          if (!pathname.includes("redes")) {
            if (vendedor != "-1") {
              mensaje += `*Vendedor*:\n_${getNombreVendedor(vendedor)}_\n\n`;
            }
          }

          mensaje += `*----------------------------------*\n\n`;
        }

        mensaje +=
          clientType === "Mayorista"
            ? "```Pedido Mayorista:```\n\n"
            : "```Pedido Minorista:```\n\n";

        mensaje += `*Número de pedido*: ${orderId}\n\n`;
        for (const productId in cart) {
          const product = cart[productId];
          const quantity = productQuantities[product.idProducto];
          mensaje += `*${quantity}* x *${product.nombre}*\n`;

          if (productNotes[product.idProducto]) {
            mensaje += `*Aclaración: ${productNotes[product.idProducto]}*\n`;
          }

          mensaje += `_Subtotal = $${calculateSubtotal(product)
            .toLocaleString("es-ES", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            })
            .replace(",", ".")
            .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}_\n\n`;
        }

        if (costoEnvioDomicilio > 0) {
          mensaje += `*SUBTOTAL: $${(calculateTotal() - costoEnvioDomicilio)
            .toLocaleString("es-ES", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            })
            .replace(",", ".")
            .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}*\n`;
          mensaje += `*Costo de envío: $${costoEnvioDomicilio}*\n`;
        }
        mensaje += `*TOTAL: $${calculateTotal()
          .toLocaleString("es-ES", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          })
          .replace(",", ".")
          .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}*`;

        // Crear el enlace para abrir WhatsApp con el mensaje
        const encodedMensaje = encodeURIComponent(mensaje);
        const whatsappURL = `https://api.whatsapp.com/send?phone=${whatsapp}&text=${encodedMensaje}`;

        // Redirigir directamente a la URL de WhatsApp
        window.location.href = whatsappURL;

        // Restablecer el formulario y ocultarlo
        ClearClientInputs();
        CloseModal();

        clearCart();
        ClearFormData();
      }
    } catch (error) {
      console.error("Ocurrió un error:", error);
    }
  };

  //#region Función para crear el pedido y luego enviarlo por Whatsapp
  const handleSubmitPedido = async (e) => {
    e.preventDefault();

    if (whatsapp && whatsapp !== "0") {
      if (IsValid() === true) {
        // Iterar sobre los elementos del carrito y crear los detalles
        const detalles = Object.values(cart).map((producto) => {
          const quantity = productQuantities[producto.idProducto] || 0;

          let precioUnitario;
          if (
            producto.precioPesos3 > 0 &&
            quantity >= producto.cantidadMayorista3
          ) {
            precioUnitario = producto.precioPesos3;
          } else if (
            producto.precioPesos2 > 0 &&
            quantity >= producto.cantidadMayorista2
          ) {
            precioUnitario = producto.precioPesos2;
          } else {
            precioUnitario = producto.precioPesos;
          }

          return {
            idProducto: producto.idProducto,
            cantidad: quantity,
            aclaracion: producto.aclaraciones,
            precioUnitario: precioUnitario,
          };
        });

        await SaveOrders({
          nombreCompleto: `${nombre.charAt(0).toUpperCase() + nombre.slice(1)}`,
          dni: dni,
          telefono: telefono,
          direccion: `${
            direccion.charAt(0).toUpperCase() + direccion.slice(1)
          }`,
          entreCalles: `${calles.charAt(0).toUpperCase() + calles.slice(1)}`,
          costoEnvio: costoEnvioDomicilio > 0 ? costoEnvioDomicilio : 0,
          idTipoPedido: 1, // (Tipo 1 es para LGF)
          idVendedor: pathname.includes("redes") ? "-1" : vendedor,
          idMetodoPago: abono,
          idMetodoEntrega: envio,
          detalles: detalles, // Aquí se incluyen los detalles de los productos
          newsletter: newsletter,
        })
          .then((response) => {
            // Crear el mensaje con la información del pedido para Whatsapp
            let mensaje = "```Datos del cliente:```\n\n";

            mensaje += `*Nombre completo*:\n_${nombre}_\n\n`;

            mensaje += `*DNI*:\n_${dni}_\n\n`;

            mensaje += `*Entrega*:\n_${nombreEnvio} ($${costoEnvioDomicilio})${
              aclaracionEnvio ? ` - ${aclaracionEnvio}` : ""
            }_\n\n`;

            if (nombreEnvio.toLowerCase().includes("domicilio")) {
              mensaje += `*Dirección*:\n_${direccion}_\n\n`;
              mensaje += `*Entre calles*:\n_${calles}_\n\n`;
            }

            mensaje += `*Número de teléfono*:\n_${telefono}_\n\n`;

            mensaje += `*Abona con*:\n_${nombreAbono}_\n\n`;

            if (clientType === "Mayorista" && newsletter === true) {
              mensaje +=
                "`Quiero suscribirme a la lista de difusión de WhatsApp 📢`\n\n";
            }

            mensaje += `*----------------------------------*\n\n`;

            if (
              (nombreEnvio.toLowerCase().includes("local") &&
                ((direccionAuto !== null && direccionAuto !== "") ||
                  (horariosAtencion !== null && horariosAtencion !== ""))) ||
              (telefonoEmpresa !== null && telefonoEmpresa !== "") ||
              (nombreAbono.toLowerCase() === "transferencia" &&
                ((cbu !== null && cbu !== "") ||
                  (alias !== null && alias !== ""))) ||
              (!pathname.includes("redes") && vendedor !== "-1")
            ) {
              mensaje += "```Datos de la empresa:```\n\n";

              if (nombreEnvio.toLowerCase().includes("local")) {
                if (direccionAuto !== null && direccionAuto !== "") {
                  mensaje += `*Dirección*:\n_${direccionAuto}_\n\n`;
                }
                if (horariosAtencion !== null && horariosAtencion !== "") {
                  mensaje += `*Horarios de atención:*\n_${horariosAtencion}_\n\n`;
                }
              }

              if (telefonoEmpresa !== null && telefonoEmpresa !== "") {
                mensaje += `*Número de teléfono*:\n_${telefonoEmpresa}_\n\n`;
              }

              if (nombreAbono.toLowerCase() == "transferencia") {
                if (cbu !== null && cbu !== "") {
                  mensaje += `*CBU*:\n_${cbu}_\n\n`;
                }
                if (alias !== null && alias !== "") {
                  mensaje += `*ALIAS*:\n_${alias}_\n\n`;
                }
              }

              if (!pathname.includes("redes")) {
                if (vendedor != "-1") {
                  mensaje += `*Vendedor*:\n_${getNombreVendedor(
                    vendedor
                  )}_\n\n`;
                }
              }

              mensaje += `*----------------------------------*\n\n`;
            }

            mensaje +=
              clientType === "Mayorista"
                ? "```Pedido Mayorista:```\n\n"
                : "```Pedido Minorista:```\n\n";

            mensaje += `*Número de pedido*: ${response.data.idPedido}\n\n`;
            for (const productId in cart) {
              const product = cart[productId];
              const quantity = productQuantities[product.idProducto];
              mensaje += `*${quantity}* x *${product.nombre}*\n`;

              if (productNotes[product.idProducto]) {
                mensaje += `*Aclaración: ${
                  productNotes[product.idProducto]
                }*\n`;
              }

              mensaje += `_Subtotal = $${calculateSubtotal(product)
                .toLocaleString("es-ES", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                })
                .replace(",", ".")
                .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}_\n\n`;
            }

            if (costoEnvioDomicilio > 0) {
              mensaje += `*SUBTOTAL: $${(calculateTotal() - costoEnvioDomicilio)
                .toLocaleString("es-ES", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                })
                .replace(",", ".")
                .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}*\n`;
              mensaje += `*Costo de envío: $${costoEnvioDomicilio}*\n`;
            }
            mensaje += `*TOTAL: $${calculateTotal()
              .toLocaleString("es-ES", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
              })
              .replace(",", ".")
              .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}*`;

            // El POST se realizó exitosamente, ahora redirigir a WhatsApp

            // Crear el enlace para abrir WhatsApp con el mensaje
            const encodedMensaje = encodeURIComponent(mensaje);
            const whatsappURL = `https://api.whatsapp.com/send?phone=${whatsapp}&text=${encodedMensaje}`;

            // Redirigir directamente a la URL de WhatsApp
            window.location.href = whatsappURL;

            // Restablecer el formulario y ocultarlo
            ClearClientInputs();
            CloseModal();

            clearCart();
            ClearFormData();
          })
          .catch((error) => {
            // Manejar el error si algo sale mal en el POST
            console.error("Error al guardar el pedido:", error);
          });
      }
    }
  };
  //#endregion

  //#region Función para limpiar todos los valores de los inputs del formulario
  function ClearClientInputs() {
    setNombre("");
    setDni("");
    setDireccion("");
    setCalles("");
    setTelefono("");
    setAbono("");
    setNombreAbono("");
    setVendedor("");
    setEnvio("");
    setNombreEnvio("");
    setAclaracionEnvio("");
    setCostoEnvioDomicilio(0);
  }
  //#endregion

  //#region Función para verificar si el valor de algun input del cliente esta vacio
  function IsEmpty() {
    if (nombre !== "") {
      return false;
    } else if (dni !== "") {
      return false;
    } else if (telefono !== "") {
      return false;
    } else if (direccion !== "") {
      return false;
    } else if (calles !== "") {
      return false;
    } else if (abono !== "") {
      return false;
    } else if (vendedor !== "") {
      return false;
    } else if (envio !== "") {
      return false;
    }
    return true;
  }
  //#endregion

  //#region Funcíon para validar el número de documento
  // Expresión regular para validar DNI argentino con o sin puntos
  const dniRegex = /^(?=.*\d)\d{7,8}$|^\d{1,2}\.\d{3}\.\d{3}$/;

  function validarDNI(dni) {
    return dniRegex.test(dni);
  }
  //#endregion

  //#region Función para verificar si los valores ingresados a traves de los input son correctos
  function IsValid() {
    if (nombre === "") {
      Swal.fire({
        icon: "error",
        title: "Debe ingresar su nombre completo",
        text: "Complete el campo",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#f27474",
      }).then(function () {
        setTimeout(function () {
          $("#nombre").focus();
        }, 500);
      });
      return false;
    } else if (dni === "") {
      Swal.fire({
        icon: "error",
        title: "Debe ingresar su número de documento",
        text: "Complete el campo",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#f27474",
      }).then(function () {
        setTimeout(function () {
          $("#dni").focus();
        }, 500);
      });
      return false;
    } else if (!validarDNI(dni)) {
      Swal.fire({
        icon: "error",
        title: "Número de documento inválido",
        text: "Ingrese un DNI válido",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#f27474",
      }).then(function () {
        setTimeout(function () {
          $("#dni").focus();
        }, 500);
      });
      return false;
    } else if (telefono === "") {
      Swal.fire({
        icon: "error",
        title: "Debe indicar su número de teléfono",
        text: "Complete el campo",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#f27474",
      }).then(function () {
        setTimeout(function () {
          $("#telefono").focus();
        }, 500);
      });
      return false;
    } else if (envio === "") {
      Swal.fire({
        icon: "error",
        title: "Debe indicar la forma de entrega",
        text: "Seleccione una opción",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#f27474",
      });
      return false;
    } else if (
      direccion === "" &&
      nombreEnvio.toLowerCase().includes("domicilio")
    ) {
      Swal.fire({
        icon: "error",
        title: "Debe indicar su dirección",
        text: "Complete el campo",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#f27474",
      }).then(function () {
        setTimeout(function () {
          $("#direccion").focus();
        }, 500);
      });
      return false;
    } else if (
      calles === "" &&
      nombreEnvio.toLowerCase().includes("domicilio")
    ) {
      Swal.fire({
        icon: "error",
        title: "Debe indicar entre que calles se encuentra la dirección",
        text: "Complete el campo",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#f27474",
      }).then(function () {
        setTimeout(function () {
          $("#calles").focus();
        }, 500);
      });
      return false;
    } else if (abono === "") {
      Swal.fire({
        icon: "error",
        title: "Debe indicar de que forma abonara el pedido",
        text: "Seleccione una opción",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#f27474",
      });
      return false;
    } else if (vendedor === "" && !pathname.includes("redes")) {
      Swal.fire({
        icon: "error",
        title: "Debe indicar el vendedor",
        text: "Seleccione un vendedor",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#f27474",
      });
      return false;
    }
    return true;
  }
  //#endregion

  //#region Función para cerrar el modal manualmente mediante el codigo
  function CloseModal() {
    $(document).ready(function () {
      $("#btn-close-modal").click();
    });
  }
  //#endregion

  //#region Función para borrar la busqueda por query
  const handleClearSearch = () => {
    // Función para limpiar la búsqueda (setear query a vacío)
    setQuery("");
    setSearchValue("");
  };
  //#endregion

  //#region Función para cuando selecciono un abono
  const handleAbonoClick = (e) => {
    const selectedIndex = e.target.selectedIndex;
    const selectedOption = e.target.options[selectedIndex];

    setAbono(e.target.value);
    setNombreAbono(selectedOption.getAttribute("data-nombre"));
  };
  //#endregion

  //#region Función para cuando selecciono un envio
  const handleEnvioClick = (e) => {
    const selectedOption = e.target.selectedOptions[0];

    // Establecer el estado
    const value = e.target.value;
    const nombre = selectedOption?.getAttribute("data-nombre") || "";
    const aclaracion = selectedOption?.getAttribute("data-aclaracion") || "";
    const costo = Number(selectedOption?.getAttribute("data-costo")) || 0;
    const urlImagen = selectedOption?.getAttribute("data-imagen"); // Asumiendo que 'data-imagen' es el atributo para la URL de la imagen

    setEnvio(value);
    setNombreEnvio(nombre);
    setAclaracionEnvio(aclaracion);
    setCostoEnvioDomicilio(costo);

    // Mostrar Swal si urlImagen no está vacío o nulo
    if (urlImagen) {
      Swal.fire({
        title: nombre,
        text: aclaracion ? `(${aclaracion})` : "",
        imageUrl: urlImagen,
        imageAlt: "Imagen de entrega",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#3085d6",
        allowOutsideClick: false,
      });
    }
  };
  //#endregion

  //#region Función para borrar que se eliga primero el tipo de entrega antes del abono
  const handleAbonoClickVerify = (event) => {
    event.preventDefault();

    if (envio === "") {
      Swal.fire({
        icon: "warning",
        title: "Primero debe indicar la forma de entrega",
        text: "Seleccione una opción",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#f8bb86",
      });
    }
  };
  //#endregion

  //#region Función para obtener el nombre del vendedor
  const getNombreVendedor = (idVendedor) => {
    const vendedor = listaNombresVendedores.find(
      (v) => v.idUsuario == idVendedor
    );
    return vendedor ? vendedor.nombre : "-";
  };
  //#endregion

  //#region Return
  return (
    <>
      {aviso && aviso !== "" && modalCerrado === false && <Modal />}
      {mantenimiento || mantenimientoZeide ? (
        <Mantenimiento />
      ) : (
        <>
          {aviso && aviso !== "" && modalCerrado === false && <Modal />}
          <div>
            <Helmet>
              <title>
                La Gran Feria | Catálogo{" "}
                {clientType === "Mayorista" ? "Mayorista" : "Minorista"}
              </title>
            </Helmet>

            <div
              className={color ? "header-nav2 header-nav-bg2" : "header-nav2"}
            >
              <div className={click ? "header-menu2 active" : "header-menu2"}>
                <ul
                  className={
                    color
                      ? "header-menu2-container header-menu2-container-bg"
                      : "header-menu2-container"
                  }
                >
                  <div className="cart-tit-del">
                    <h1 className="title carrito-title">Carrito</h1>
                    {Object.values(cart).some(
                      (product) => product.cantidad > 0
                    ) && (
                      <button
                        type="button"
                        className="btn btn-danger btn-delete btn-carrito"
                        onClick={() =>
                          Swal.fire({
                            title:
                              "¿Está seguro de que desea vaciar el carrito?",
                            text: "Una vez vaciado, no se podrá recuperar",
                            icon: "warning",
                            showCancelButton: true,
                            confirmButtonColor: "#F8BB86",
                            cancelButtonColor: "#6c757d",
                            confirmButtonText: "Aceptar",
                            cancelButtonText: "Cancelar",
                            focusCancel: true,
                          }).then((result) => {
                            if (result.isConfirmed) {
                              clearCart();
                            }
                          })
                        }
                      >
                        <Delete className="delete" />
                      </button>
                    )}
                  </div>

                  {/* Renderizar los productos agregados al carrito */}
                  {Object.values(cart).map((product) => {
                    if (product.cantidad > 0) {
                      const quantity =
                        productQuantities[product.idProducto] || 0;
                      return (
                        <div className="home-5" key={product.idProducto}>
                          <div
                            className="contenedor-producto"
                            key={product.idProducto}
                          >
                            <div className="product">
                              <div className="product-1-col">
                                <figure className="figure">
                                  <div className="zoom-container">
                                    <Zoom
                                      className="zoom"
                                      onClick={() =>
                                        Swal.fire({
                                          title: product.nombre,
                                          imageUrl: `${
                                            product.urlImagen ||
                                            "https://yourfiles.cloud/uploads/98310f0d0f14ff456c3886d644d438b6/vacio.jpg"
                                          }`,
                                          imageWidth: 400,
                                          imageHeight: 400,
                                          imageAlt: "Vista Producto",
                                          confirmButtonColor: "#6c757d",
                                          confirmButtonText: "Cerrar",
                                          focusConfirm: true,
                                        })
                                      }
                                    ></Zoom>
                                  </div>
                                  <img
                                    className="product-img"
                                    src={
                                      product.urlImagen ||
                                      "https://yourfiles.cloud/uploads/98310f0d0f14ff456c3886d644d438b6/vacio.jpg"
                                    }
                                    alt="Producto"
                                  />
                                </figure>
                              </div>

                              <div className="product-2-col">
                                <h3 className="product-title">
                                  {product.nombre}
                                </h3>
                                <h3 className="product-desc">
                                  <pre className="pre">
                                    {product.descripcion}
                                  </pre>
                                </h3>
                              </div>

                              <div className="product-3-col2">
                                <div className="precios-mayoristas">
                                  <div className="boton-borrar-producto">
                                    <button
                                      type="button"
                                      className="btn btn-danger btn-delete2 btn-carrito"
                                      onClick={() =>
                                        Swal.fire({
                                          title: `¿Está seguro de que quitar todas las unidades de ${product.nombre}?`,
                                          text: "Una vez quitado, no se podrá recuperar",
                                          icon: "warning",
                                          showCancelButton: true,
                                          confirmButtonColor: "#F8BB86",
                                          cancelButtonColor: "#6c757d",
                                          confirmButtonText: "Aceptar",
                                          cancelButtonText: "Cancelar",
                                          focusCancel: true,
                                        }).then((result) => {
                                          if (result.isConfirmed) {
                                            handleDelete(product);
                                          }
                                        })
                                      }
                                    >
                                      <Delete className="delete2" />
                                    </button>
                                  </div>
                                  <div
                                    className={`div-unidadesmayoristas ${
                                      (product.cantidadMayorista2 > 0 &&
                                        product.precioPesos2 > 0 &&
                                        quantity > 0 &&
                                        (product.cantidadMayorista2 === null ||
                                          quantity <
                                            product.cantidadMayorista2)) || // Nueva condición añadida
                                      (product.cantidadMayorista3 > 0 &&
                                        product.precioPesos3 > 0 &&
                                        quantity > 0 &&
                                        (product.cantidadMayorista2 === null ||
                                          quantity <
                                            product.cantidadMayorista2) && // Nueva condición añadida
                                        quantity < product.cantidadMayorista3)
                                        ? "dark-highlight"
                                        : ""
                                    }`}
                                  >
                                    {(product.precioPesos2 > 0 ||
                                      product.precioPesos3 > 0) && (
                                      <p
                                        className={`p-unidadesmayoristas ${
                                          (product.cantidadMayorista2 > 0 &&
                                            product.precioPesos2 > 0 &&
                                            quantity > 0 &&
                                            (product.cantidadMayorista2 ===
                                              null ||
                                              quantity <
                                                product.cantidadMayorista2)) || // Nueva condición añadida
                                          (product.cantidadMayorista3 > 0 &&
                                            product.precioPesos3 > 0 &&
                                            quantity > 0 &&
                                            (product.cantidadMayorista2 ===
                                              null ||
                                              quantity <
                                                product.cantidadMayorista2) && // Nueva condición añadida
                                            quantity <
                                              product.cantidadMayorista3)
                                            ? "p-seleccionado"
                                            : ""
                                        }`}
                                      >
                                        1 x
                                      </p>
                                    )}
                                    <p className="product-price">
                                      $
                                      {Math.ceil(product.precioPesos)
                                        .toLocaleString("es-ES", {
                                          minimumFractionDigits: 0,
                                          maximumFractionDigits: 2,
                                        })
                                        .replace(",", ".")
                                        .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                                    </p>
                                  </div>

                                  {product.precioPesos2 > 0 && (
                                    <div
                                      className={`div-unidadesmayoristas ${
                                        quantity >=
                                          product.cantidadMayorista2 &&
                                        (product.cantidadMayorista3 == null ||
                                          quantity < product.cantidadMayorista3)
                                          ? "dark-highlight"
                                          : ""
                                      }`}
                                    >
                                      <p
                                        className={`p-unidadesmayoristas ${
                                          quantity >=
                                            product.cantidadMayorista2 &&
                                          (product.cantidadMayorista3 == null ||
                                            quantity <
                                              product.cantidadMayorista3)
                                            ? "p-seleccionado"
                                            : ""
                                        }`}
                                      >
                                        {product.cantidadMayorista2} x
                                      </p>
                                      <p className="product-price">
                                        $
                                        {Math.ceil(product.precioPesos2)
                                          .toLocaleString("es-ES", {
                                            minimumFractionDigits: 0,
                                            maximumFractionDigits: 2,
                                          })
                                          .replace(",", ".")
                                          .replace(
                                            /\B(?=(\d{3})+(?!\d))/g,
                                            "."
                                          )}
                                      </p>
                                      <p className="product-desc">(c/u)</p>
                                    </div>
                                  )}

                                  {product.precioPesos3 > 0 && (
                                    <div
                                      className={`div-unidadesmayoristas ${
                                        quantity >= product.cantidadMayorista3
                                          ? "dark-highlight"
                                          : ""
                                      }`}
                                    >
                                      <p
                                        className={`p-unidadesmayoristas ${
                                          quantity >= product.cantidadMayorista3
                                            ? "p-seleccionado"
                                            : ""
                                        }`}
                                      >
                                        {product.cantidadMayorista3} x
                                      </p>
                                      <p className="product-price">
                                        $
                                        {Math.ceil(product.precioPesos3)
                                          .toLocaleString("es-ES", {
                                            minimumFractionDigits: 0,
                                            maximumFractionDigits: 2,
                                          })
                                          .replace(",", ".")
                                          .replace(
                                            /\B(?=(\d{3})+(?!\d))/g,
                                            "."
                                          )}
                                      </p>
                                      <p className="product-desc">(c/u)</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="product-2">
                              <div className="product-subtotal2">
                                <p className="product-desc">
                                  Cantidad:{" "}
                                  <b className="product-price">
                                    {productQuantities[product.idProducto]}
                                  </b>
                                </p>
                                <p className="product-desc">
                                  Subtotal:{" "}
                                  <b className="product-price">
                                    $
                                    {calculateSubtotal(product)
                                      .toLocaleString("es-ES", {
                                        minimumFractionDigits: 0,
                                        maximumFractionDigits: 2,
                                      })
                                      .replace(",", ".")
                                      .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                                  </b>
                                </p>
                                {(() => {
                                  const cantidad =
                                    productQuantities[product.idProducto] || 0;
                                  const precioBase = product.precioPesos;
                                  let precioAplicado = precioBase;

                                  if (
                                    product.precioPesos3 > 0 &&
                                    product.cantidadMayorista3 > 0 &&
                                    cantidad >= product.cantidadMayorista3
                                  ) {
                                    precioAplicado = product.precioPesos3;
                                  } else if (
                                    product.precioPesos2 > 0 &&
                                    product.cantidadMayorista2 > 0 &&
                                    cantidad >= product.cantidadMayorista2
                                  ) {
                                    precioAplicado = product.precioPesos2;
                                  }

                                  const ahorroUnitario = Math.max(
                                    0,
                                    precioBase - precioAplicado
                                  );
                                  const ahorroTotal = ahorroUnitario * cantidad;

                                  return ahorroTotal > 0 ? (
                                    <p className="product-desc ahorro">
                                      Ahorraste{" "}
                                      <b className="product-price ahorro">
                                        $
                                        {Math.ceil(ahorroTotal)
                                          .toLocaleString("es-ES", {
                                            minimumFractionDigits: 0,
                                            maximumFractionDigits: 2,
                                          })
                                          .replace(",", ".")
                                          .replace(
                                            /\B(?=(\d{3})+(?!\d))/g,
                                            "."
                                          )}
                                      </b>
                                    </p>
                                  ) : null;
                                })()}
                              </div>

                              <div className="quant-stock-container">
                                {(product.cantidadMayorista2 > 0 &&
                                  product.precioPesos2 > 0) ||
                                (product.cantidadMayorista3 > 0 &&
                                  product.precioPesos3 > 0)
                                  ? (() => {
                                      const unidadesFaltantes2 =
                                        product.cantidadMayorista2 > 0 &&
                                        product.precioPesos2 > 0
                                          ? product.cantidadMayorista2 -
                                            quantity
                                          : null;
                                      const unidadesFaltantes3 =
                                        product.cantidadMayorista3 > 0 &&
                                        product.precioPesos3 > 0
                                          ? product.cantidadMayorista3 -
                                            quantity
                                          : null;

                                      const getMensaje = (
                                        unidadesFaltantes
                                      ) => {
                                        return (
                                          <p className="p-tentacion">
                                            Agregue {unidadesFaltantes}{" "}
                                            {unidadesFaltantes === 1
                                              ? "unidad"
                                              : "unidades"}{" "}
                                            para obtener descuento
                                          </p>
                                        );
                                      };

                                      if (unidadesFaltantes2 > 0) {
                                        return getMensaje(unidadesFaltantes2);
                                      } else if (unidadesFaltantes3 > 0) {
                                        return getMensaje(unidadesFaltantes3);
                                      } else {
                                        return null;
                                      }
                                    })()
                                  : null}

                                <div className="product-quantity">
                                  <button
                                    className="quantity-btn btnminus"
                                    onClick={() => handleSubtract(product)}
                                  >
                                    -
                                  </button>
                                  <input
                                    type="number"
                                    min="0"
                                    value={
                                      productQuantities[product.idProducto]
                                    }
                                    onChange={(event) =>
                                      handleQuantityChange(event, product)
                                    }
                                    onBlur={() => updateTotalQuantity()}
                                    className="quantity-input"
                                  />
                                  <button
                                    className="quantity-btn btnplus"
                                    onClick={() => handleAdd(product)}
                                  >
                                    +
                                  </button>
                                </div>
                                <p className="product-desc">
                                  ({formatStock(product.stockTransitorio)}{" "}
                                  {product.stockTransitorio === 1
                                    ? "disponible"
                                    : "disponibles"}
                                  )
                                </p>
                              </div>
                            </div>

                            <div className="product-notes">
                              <textarea
                                className="textarea"
                                placeholder="Agregar aclaraciones..."
                                value={product.aclaraciones}
                                onChange={(event) =>
                                  handleAclaracionesChange(event, product)
                                }
                              ></textarea>
                            </div>
                          </div>
                        </div>
                      );
                    } else {
                      return null;
                    }
                  })}

                  {/* Mostrar el total solo si hay productos en el carrito */}
                  {Object.values(cart).some(
                    (product) => product.cantidad > 0
                  ) ? (
                    <div className="home-6">
                      <div className="totales-wpp-container">
                        <div className="totales">
                          <p className="product-desc cant-total">
                            Cantidad total de productos:{" "}
                            <b className="product-price">{totalQuantity}</b>
                          </p>
                          <p className="product-desc">
                            Total:{" "}
                            <b className="product-price">
                              $
                              {calculateTotal()
                                .toLocaleString("es-ES", {
                                  minimumFractionDigits: 0,
                                  maximumFractionDigits: 2,
                                })
                                .replace(",", ".")
                                .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                            </b>
                          </p>
                        </div>

                        <div className="wpp-btn-container">
                          <button
                            type="button"
                            className="btn-wpp-cart"
                            //  data-bs-toggle="modal"
                            //  data-bs-target="#exampleModal"
                            onClick={() => {
                              // Agregar verificación antes de abrir el modal
                              if (
                                clientType === "Mayorista" &&
                                calculateTotal() < montoMayorista &&
                                codigoExcento === false
                              ) {
                                const faltaImporte =
                                  montoMayorista - calculateTotal();

                                swalWithBootstrapButtons
                                  .fire({
                                    icon: "warning",
                                    title: `Falta $${faltaImporte
                                      .toLocaleString("es-ES", {
                                        minimumFractionDigits: 0,
                                        maximumFractionDigits: 2,
                                      })
                                      .replace(",", ".")
                                      .replace(
                                        /\B(?=(\d{3})+(?!\d))/g,
                                        "."
                                      )} para que puedas hacer tu pedido mayorista`,
                                    text: `Debes agregar al menos $${montoMayorista
                                      .toLocaleString("es-ES", {
                                        minimumFractionDigits: 0,
                                        maximumFractionDigits: 2,
                                      })
                                      .replace(",", ".")
                                      .replace(
                                        /\B(?=(\d{3})+(?!\d))/g,
                                        "."
                                      )} en productos al carrito para enviar el pedido.`,
                                    confirmButtonText: "Aceptar",
                                    cancelButtonText: "i",
                                    showCancelButton: codigo && codigo !== "",
                                    confirmButtonColor: "#f8bb86",
                                    allowOutsideClick: false,
                                  })
                                  .then((result) => {
                                    if (result.isDismissed) {
                                      Swal.fire({
                                        title: "Ingrese el código",
                                        input: "text",
                                        inputAttributes: {
                                          autocapitalize: "off",
                                        },
                                        showCancelButton: true,
                                        confirmButtonText: "Verificar",
                                        confirmButtonColor: "#40b142",
                                        cancelButtonText: "Cancelar",
                                        showLoaderOnConfirm: true,
                                        allowOutsideClick: false,
                                        preConfirm: (login) => {
                                          return new Promise(
                                            (resolve, reject) => {
                                              if (login === codigo) {
                                                resolve(); // Resolviendo la promesa para indicar que la validación fue exitosa
                                              } else if (login === "") {
                                                reject("Código vacio");
                                              } else {
                                                reject("Código incorrecto"); // Rechazando la promesa para indicar que la validación falló
                                              }
                                            }
                                          ).catch((error) => {
                                            Swal.showValidationMessage(error);
                                          });
                                        },
                                      }).then((result) => {
                                        if (result.isConfirmed) {
                                          Swal.fire({
                                            title:
                                              "Código aplicado exitosamente",
                                            icon: "success",
                                            confirmButtonText: "Aceptar",
                                            confirmButtonColor: "#a5dc86",
                                            allowOutsideClick: true,
                                          });

                                          setCodigoExcento(true);
                                        }
                                      });
                                    }
                                  });

                                return; // Detener el proceso si no hay suficientes productos
                              }

                              // Lógica adicional después de la verificación (si es necesario)
                              // ClearClientInputs();
                              setTimeout(function () {
                                $("#nombre").focus();
                              }, 500);

                              // Abre el modal solo si hay suficientes productos
                              document
                                .getElementById("hiddenModalButton")
                                .click();
                            }}
                          >
                            <Whatsapplogo className="svg-wpp2" />
                            Enviar pedido por WhatsApp
                          </button>

                          <button
                            id="hiddenModalButton"
                            className="hidden"
                            data-bs-toggle="modal"
                            data-bs-target="#exampleModal"
                          >
                            .
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="home-6">
                      <div className="vacio">
                        <p className="product-desc">
                          Aún no hay productos cargados en el carrito.
                        </p>
                      </div>
                    </div>
                  )}
                </ul>
              </div>

              <div
                className="header-burger-menu-container"
                onClick={() => {
                  handleClick();
                  setIsVisible(!isVisible);
                }}
              >
                {click ? (
                  <Back
                    className={
                      color
                        ? "header-close-menu header-close-menu-bg"
                        : "header-close-menu"
                    }
                  />
                ) : (
                  <div className="cart-icon-container">
                    <Cart
                      className={
                        color
                          ? "header-burger-menu header-burger-menu-bg"
                          : "header-burger-menu"
                      }
                    />
                    {totalQuantity > 0 && (
                      <span
                        className={
                          color
                            ? "cart-item-count cart-item-count-bg"
                            : "cart-item-count"
                        }
                      >
                        {totalQuantity}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <section id="home" className="home-container">
              <div className="home-content">
                <div className="home-4">
                  <div className="title-search">
                    <h1 className="title categories-title title-nomarg">
                      {clientType === "Mayorista"
                        ? "Catálogo Mayorista"
                        : "Catálogo Minorista"}
                    </h1>

                    {isVisible && (
                      <div
                        id="search-container"
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
                    )}
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
                            <div
                              className="filter-btn-container2"
                              role="button"
                            >
                              <p className="filter-btn-name2">{`Productos con: "${query}"`}</p>
                            </div>

                            <div className="collapse show" id="collapseQuery">
                              <div className="product-container">
                                {products?.length === 0 ? (
                                  <div className="vacio2">
                                    <p className="product-desc no-p">
                                      No hay productos que contengan:{" "}
                                      <b className="category-name">"{query}"</b>
                                      .
                                    </p>
                                  </div>
                                ) : (
                                  products?.map((product, index) => {
                                    const quantity =
                                      productQuantities[product.idProducto] ||
                                      0;
                                    const subtotal = calculateSubtotal(product);

                                    if (product.precioPesos === 0) {
                                      return <></>; // No renderizar el producto
                                    }

                                    return (
                                      <div
                                        className={`contenedor-producto ${
                                          product.stockTransitorio === 0
                                            ? "sin-stock"
                                            : ""
                                        }`}
                                        key={index}
                                      >
                                        <div className="product">
                                          <div className="product-1-col">
                                            <figure className="figure">
                                              <Zoom
                                                className="zoom"
                                                onClick={() =>
                                                  Swal.fire({
                                                    title: product.nombre,
                                                    imageUrl: `${
                                                      product.urlImagen ||
                                                      "https://yourfiles.cloud/uploads/98310f0d0f14ff456c3886d644d438b6/vacio.jpg"
                                                    }`,
                                                    imageWidth: 400,
                                                    imageHeight: 400,
                                                    imageAlt: "Vista Producto",
                                                    confirmButtonColor:
                                                      "#6c757d",
                                                    confirmButtonText: "Cerrar",
                                                    focusConfirm: true,
                                                  })
                                                }
                                              ></Zoom>
                                              <img
                                                src={
                                                  product.urlImagen ||
                                                  "https://yourfiles.cloud/uploads/98310f0d0f14ff456c3886d644d438b6/vacio.jpg"
                                                }
                                                className="product-img"
                                                alt="Producto"
                                              />
                                            </figure>
                                          </div>
                                          <div className="product-2-col">
                                            <h3 className="product-title">
                                              {product.nombre}
                                            </h3>
                                            <h3 className="product-desc">
                                              <pre className="pre">
                                                {product.descripcion}
                                              </pre>
                                            </h3>
                                            {product.stockTransitorio === 0 && (
                                              <h3 className="product-title sin-stock-h">
                                                SIN STOCK
                                              </h3>
                                            )}
                                          </div>
                                          <div className="product-3-col">
                                            <div className="precios-mayoristas">
                                              <div
                                                className={`div-unidadesmayoristas ${
                                                  (product.cantidadMayorista2 >
                                                    0 &&
                                                    product.precioPesos2 > 0 &&
                                                    quantity > 0 &&
                                                    (product.cantidadMayorista2 ===
                                                      null ||
                                                      quantity <
                                                        product.cantidadMayorista2)) || // Nueva condición añadida
                                                  (product.cantidadMayorista3 >
                                                    0 &&
                                                    product.precioPesos3 > 0 &&
                                                    quantity > 0 &&
                                                    (product.cantidadMayorista2 ===
                                                      null ||
                                                      quantity <
                                                        product.cantidadMayorista2) && // Nueva condición añadida
                                                    quantity <
                                                      product.cantidadMayorista3)
                                                    ? "dark-highlight"
                                                    : ""
                                                }`}
                                              >
                                                {(product.precioPesos2 > 0 ||
                                                  product.precioPesos3 > 0) && (
                                                  <p
                                                    className={`p-unidadesmayoristas ${
                                                      (product.cantidadMayorista2 >
                                                        0 &&
                                                        product.precioPesos2 >
                                                          0 &&
                                                        quantity > 0 &&
                                                        (product.cantidadMayorista2 ===
                                                          null ||
                                                          quantity <
                                                            product.cantidadMayorista2)) || // Nueva condición añadida
                                                      (product.cantidadMayorista3 >
                                                        0 &&
                                                        product.precioPesos3 >
                                                          0 &&
                                                        quantity > 0 &&
                                                        (product.cantidadMayorista2 ===
                                                          null ||
                                                          quantity <
                                                            product.cantidadMayorista2) && // Nueva condición añadida
                                                        quantity <
                                                          product.cantidadMayorista3)
                                                        ? "p-seleccionado"
                                                        : ""
                                                    }`}
                                                  >
                                                    1 x
                                                  </p>
                                                )}
                                                <p className="product-price">
                                                  $
                                                  {Math.ceil(
                                                    product.precioPesos
                                                  )
                                                    .toLocaleString("es-ES", {
                                                      minimumFractionDigits: 0,
                                                      maximumFractionDigits: 2,
                                                    })
                                                    .replace(",", ".")
                                                    .replace(
                                                      /\B(?=(\d{3})+(?!\d))/g,
                                                      "."
                                                    )}
                                                </p>
                                              </div>

                                              {product.precioPesos2 > 0 && (
                                                <div
                                                  className={`div-unidadesmayoristas ${
                                                    quantity >=
                                                      product.cantidadMayorista2 &&
                                                    (product.cantidadMayorista3 ==
                                                      null ||
                                                      quantity <
                                                        product.cantidadMayorista3)
                                                      ? "dark-highlight"
                                                      : ""
                                                  }`}
                                                >
                                                  <p
                                                    className={`p-unidadesmayoristas ${
                                                      quantity >=
                                                        product.cantidadMayorista2 &&
                                                      (product.cantidadMayorista3 ==
                                                        null ||
                                                        quantity <
                                                          product.cantidadMayorista3)
                                                        ? "p-seleccionado"
                                                        : ""
                                                    }`}
                                                  >
                                                    {product.cantidadMayorista2}{" "}
                                                    x
                                                  </p>
                                                  <p className="product-price">
                                                    $
                                                    {Math.ceil(
                                                      product.precioPesos2
                                                    )
                                                      .toLocaleString("es-ES", {
                                                        minimumFractionDigits: 0,
                                                        maximumFractionDigits: 2,
                                                      })
                                                      .replace(",", ".")
                                                      .replace(
                                                        /\B(?=(\d{3})+(?!\d))/g,
                                                        "."
                                                      )}
                                                  </p>
                                                  <p className="product-desc">
                                                    (c/u)
                                                  </p>
                                                </div>
                                              )}

                                              {product.precioPesos3 > 0 && (
                                                <div
                                                  className={`div-unidadesmayoristas ${
                                                    quantity >=
                                                    product.cantidadMayorista3
                                                      ? "dark-highlight"
                                                      : ""
                                                  }`}
                                                >
                                                  <p
                                                    className={`p-unidadesmayoristas ${
                                                      quantity >=
                                                      product.cantidadMayorista3
                                                        ? "p-seleccionado"
                                                        : ""
                                                    }`}
                                                  >
                                                    {product.cantidadMayorista3}{" "}
                                                    x
                                                  </p>
                                                  <p className="product-price">
                                                    $
                                                    {Math.ceil(
                                                      product.precioPesos3
                                                    )
                                                      .toLocaleString("es-ES", {
                                                        minimumFractionDigits: 0,
                                                        maximumFractionDigits: 2,
                                                      })
                                                      .replace(",", ".")
                                                      .replace(
                                                        /\B(?=(\d{3})+(?!\d))/g,
                                                        "."
                                                      )}
                                                  </p>
                                                  <p className="product-desc">
                                                    (c/u)
                                                  </p>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </div>

                                        {product.stockTransitorio !== 0 && (
                                          <div className="product-2">
                                            <div className="product-subtotal2">
                                              <p className="product-desc">
                                                Cantidad:{" "}
                                                <b className="product-price">
                                                  {quantity !== null &&
                                                  quantity !== undefined
                                                    ? quantity
                                                    : 0}
                                                </b>
                                              </p>
                                              <p className="product-desc">
                                                Subtotal:{" "}
                                                <b className="product-price">
                                                  $
                                                  {subtotal
                                                    .toLocaleString("es-ES", {
                                                      minimumFractionDigits: 0,
                                                      maximumFractionDigits: 2,
                                                    })
                                                    .replace(",", ".")
                                                    .replace(
                                                      /\B(?=(\d{3})+(?!\d))/g,
                                                      "."
                                                    )}
                                                </b>
                                              </p>
                                              {(() => {
                                                const cantidad =
                                                  productQuantities[
                                                    product.idProducto
                                                  ] || 0;
                                                const precioBase =
                                                  product.precioPesos;
                                                let precioAplicado = precioBase;

                                                if (
                                                  product.precioPesos3 > 0 &&
                                                  product.cantidadMayorista3 >
                                                    0 &&
                                                  cantidad >=
                                                    product.cantidadMayorista3
                                                ) {
                                                  precioAplicado =
                                                    product.precioPesos3;
                                                } else if (
                                                  product.precioPesos2 > 0 &&
                                                  product.cantidadMayorista2 >
                                                    0 &&
                                                  cantidad >=
                                                    product.cantidadMayorista2
                                                ) {
                                                  precioAplicado =
                                                    product.precioPesos2;
                                                }

                                                const ahorroUnitario = Math.max(
                                                  0,
                                                  precioBase - precioAplicado
                                                );
                                                const ahorroTotal =
                                                  ahorroUnitario * cantidad;

                                                return ahorroTotal > 0 ? (
                                                  <p className="product-desc ahorro">
                                                    Ahorraste{" "}
                                                    <b className="product-price ahorro">
                                                      $
                                                      {Math.ceil(ahorroTotal)
                                                        .toLocaleString(
                                                          "es-ES",
                                                          {
                                                            minimumFractionDigits: 0,
                                                            maximumFractionDigits: 2,
                                                          }
                                                        )
                                                        .replace(",", ".")
                                                        .replace(
                                                          /\B(?=(\d{3})+(?!\d))/g,
                                                          "."
                                                        )}
                                                    </b>
                                                  </p>
                                                ) : null;
                                              })()}
                                            </div>
                                            <div className="quant-stock-container">
                                              {(product.cantidadMayorista2 >
                                                0 &&
                                                product.precioPesos2 > 0) ||
                                              (product.cantidadMayorista3 > 0 &&
                                                product.precioPesos3 > 0)
                                                ? (() => {
                                                    const unidadesFaltantes2 =
                                                      product.cantidadMayorista2 >
                                                        0 &&
                                                      product.precioPesos2 > 0
                                                        ? product.cantidadMayorista2 -
                                                          quantity
                                                        : null;
                                                    const unidadesFaltantes3 =
                                                      product.cantidadMayorista3 >
                                                        0 &&
                                                      product.precioPesos3 > 0
                                                        ? product.cantidadMayorista3 -
                                                          quantity
                                                        : null;

                                                    const getMensaje = (
                                                      unidadesFaltantes
                                                    ) => {
                                                      return (
                                                        <p className="p-tentacion">
                                                          Agregue{" "}
                                                          {unidadesFaltantes}{" "}
                                                          {unidadesFaltantes ===
                                                          1
                                                            ? "unidad"
                                                            : "unidades"}{" "}
                                                          para obtener descuento
                                                        </p>
                                                      );
                                                    };

                                                    if (
                                                      unidadesFaltantes2 > 0
                                                    ) {
                                                      return getMensaje(
                                                        unidadesFaltantes2
                                                      );
                                                    } else if (
                                                      unidadesFaltantes3 > 0
                                                    ) {
                                                      return getMensaje(
                                                        unidadesFaltantes3
                                                      );
                                                    } else {
                                                      return null;
                                                    }
                                                  })()
                                                : null}
                                              <div className="product-quantity">
                                                <button
                                                  className="quantity-btn btnminus"
                                                  onClick={() =>
                                                    handleSubtract(product)
                                                  }
                                                >
                                                  -
                                                </button>
                                                <input
                                                  type="number"
                                                  min="0"
                                                  value={quantity}
                                                  onChange={(event) =>
                                                    handleQuantityChange(
                                                      event,
                                                      product
                                                    )
                                                  }
                                                  onBlur={() =>
                                                    updateTotalQuantity()
                                                  }
                                                  className="quantity-input"
                                                />
                                                <button
                                                  className="quantity-btn btnplus"
                                                  onClick={() =>
                                                    handleAdd(product)
                                                  }
                                                >
                                                  +
                                                </button>
                                              </div>
                                              <p className="product-desc">
                                                (
                                                {formatStock(
                                                  product.stockTransitorio
                                                )}{" "}
                                                {product.stockTransitorio === 1
                                                  ? "disponible"
                                                  : "disponibles"}
                                                )
                                              </p>
                                            </div>
                                          </div>
                                        )}

                                        {product.stockTransitorio !== 0 && (
                                          <div className="product-notes">
                                            <textarea
                                              className="textarea"
                                              placeholder="Agregar aclaraciones..."
                                              value={
                                                productNotes[
                                                  product.idProducto
                                                ] || ""
                                              }
                                              onChange={(event) =>
                                                handleAclaracionesChange(
                                                  event,
                                                  product
                                                )
                                              }
                                            ></textarea>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })
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
                                                      ]?.[
                                                        subcategory.nombre
                                                      ] === "-" ? (
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
                                                        subcategory
                                                          .idSubcategoria
                                                      ] === true ? (
                                                        <div>
                                                          <Loader />
                                                          <p className="bold-loading">
                                                            Cargando productos
                                                            pertenecientes a la
                                                            subcategoría "
                                                            {subcategory.nombre}
                                                            "...
                                                          </p>
                                                        </div>
                                                      ) : (
                                                        subcategoryProducts[
                                                          subcategory.nombre
                                                        ]?.map(
                                                          (product, index) => {
                                                            const quantity =
                                                              productQuantities[
                                                                product
                                                                  .idProducto
                                                              ] || 0;
                                                            const subtotal =
                                                              calculateSubtotal(
                                                                product
                                                              );

                                                            if (
                                                              product.precioPesos ===
                                                              0
                                                            ) {
                                                              return <></>; // No renderizar el producto
                                                            }

                                                            return (
                                                              <div
                                                                className={`contenedor-producto ${
                                                                  product.stockTransitorio ===
                                                                  0
                                                                    ? "sin-stock"
                                                                    : ""
                                                                }`}
                                                                key={index}
                                                              >
                                                                <div className="product">
                                                                  <div className="product-1-col">
                                                                    <figure className="figure">
                                                                      <Zoom
                                                                        className="zoom"
                                                                        onClick={() =>
                                                                          Swal.fire(
                                                                            {
                                                                              title:
                                                                                product.nombre,
                                                                              imageUrl: `${
                                                                                product.urlImagen ||
                                                                                "https://yourfiles.cloud/uploads/98310f0d0f14ff456c3886d644d438b6/vacio.jpg"
                                                                              }`,
                                                                              imageWidth: 400,
                                                                              imageHeight: 400,
                                                                              imageAlt:
                                                                                "Vista Producto",
                                                                              confirmButtonColor:
                                                                                "#6c757d",
                                                                              confirmButtonText:
                                                                                "Cerrar",
                                                                              focusConfirm: true,
                                                                            }
                                                                          )
                                                                        }
                                                                      ></Zoom>
                                                                      <img
                                                                        src={
                                                                          product.urlImagen ||
                                                                          "https://yourfiles.cloud/uploads/98310f0d0f14ff456c3886d644d438b6/vacio.jpg"
                                                                        }
                                                                        className="product-img"
                                                                        alt="Producto"
                                                                      />
                                                                    </figure>
                                                                  </div>
                                                                  <div className="product-2-col">
                                                                    <h3 className="product-title">
                                                                      {
                                                                        product.nombre
                                                                      }
                                                                    </h3>
                                                                    <h3 className="product-desc">
                                                                      <pre className="pre">
                                                                        {
                                                                          product.descripcion
                                                                        }
                                                                      </pre>
                                                                    </h3>
                                                                    {product.stockTransitorio ===
                                                                      0 && (
                                                                      <h3 className="product-title sin-stock-h">
                                                                        SIN
                                                                        STOCK
                                                                      </h3>
                                                                    )}
                                                                  </div>
                                                                  <div className="product-3-col">
                                                                    <div className="precios-mayoristas">
                                                                      <div
                                                                        className={`div-unidadesmayoristas ${
                                                                          (product.cantidadMayorista2 >
                                                                            0 &&
                                                                            product.precioPesos2 >
                                                                              0 &&
                                                                            quantity >
                                                                              0 &&
                                                                            (product.cantidadMayorista2 ===
                                                                              null ||
                                                                              quantity <
                                                                                product.cantidadMayorista2)) || // Nueva condición añadida
                                                                          (product.cantidadMayorista3 >
                                                                            0 &&
                                                                            product.precioPesos3 >
                                                                              0 &&
                                                                            quantity >
                                                                              0 &&
                                                                            (product.cantidadMayorista2 ===
                                                                              null ||
                                                                              quantity <
                                                                                product.cantidadMayorista2) && // Nueva condición añadida
                                                                            quantity <
                                                                              product.cantidadMayorista3)
                                                                            ? "dark-highlight"
                                                                            : ""
                                                                        }`}
                                                                      >
                                                                        {(product.precioPesos2 >
                                                                          0 ||
                                                                          product.precioPesos3 >
                                                                            0) && (
                                                                          <p
                                                                            className={`p-unidadesmayoristas ${
                                                                              (product.cantidadMayorista2 >
                                                                                0 &&
                                                                                product.precioPesos2 >
                                                                                  0 &&
                                                                                quantity >
                                                                                  0 &&
                                                                                (product.cantidadMayorista2 ===
                                                                                  null ||
                                                                                  quantity <
                                                                                    product.cantidadMayorista2)) || // Nueva condición añadida
                                                                              (product.cantidadMayorista3 >
                                                                                0 &&
                                                                                product.precioPesos3 >
                                                                                  0 &&
                                                                                quantity >
                                                                                  0 &&
                                                                                (product.cantidadMayorista2 ===
                                                                                  null ||
                                                                                  quantity <
                                                                                    product.cantidadMayorista2) && // Nueva condición añadida
                                                                                quantity <
                                                                                  product.cantidadMayorista3)
                                                                                ? "p-seleccionado"
                                                                                : ""
                                                                            }`}
                                                                          >
                                                                            1 x
                                                                          </p>
                                                                        )}
                                                                        <p className="product-price">
                                                                          $
                                                                          {Math.ceil(
                                                                            product.precioPesos
                                                                          )
                                                                            .toLocaleString(
                                                                              "es-ES",
                                                                              {
                                                                                minimumFractionDigits: 0,
                                                                                maximumFractionDigits: 2,
                                                                              }
                                                                            )
                                                                            .replace(
                                                                              ",",
                                                                              "."
                                                                            )
                                                                            .replace(
                                                                              /\B(?=(\d{3})+(?!\d))/g,
                                                                              "."
                                                                            )}
                                                                        </p>
                                                                      </div>

                                                                      {product.precioPesos2 >
                                                                        0 && (
                                                                        <div
                                                                          className={`div-unidadesmayoristas ${
                                                                            quantity >=
                                                                              product.cantidadMayorista2 &&
                                                                            (product.cantidadMayorista3 ==
                                                                              null ||
                                                                              quantity <
                                                                                product.cantidadMayorista3)
                                                                              ? "dark-highlight"
                                                                              : ""
                                                                          }`}
                                                                        >
                                                                          <p
                                                                            className={`p-unidadesmayoristas ${
                                                                              quantity >=
                                                                                product.cantidadMayorista2 &&
                                                                              (product.cantidadMayorista3 ==
                                                                                null ||
                                                                                quantity <
                                                                                  product.cantidadMayorista3)
                                                                                ? "p-seleccionado"
                                                                                : ""
                                                                            }`}
                                                                          >
                                                                            {
                                                                              product.cantidadMayorista2
                                                                            }{" "}
                                                                            x
                                                                          </p>
                                                                          <p className="product-price">
                                                                            $
                                                                            {Math.ceil(
                                                                              product.precioPesos2
                                                                            )
                                                                              .toLocaleString(
                                                                                "es-ES",
                                                                                {
                                                                                  minimumFractionDigits: 0,
                                                                                  maximumFractionDigits: 2,
                                                                                }
                                                                              )
                                                                              .replace(
                                                                                ",",
                                                                                "."
                                                                              )
                                                                              .replace(
                                                                                /\B(?=(\d{3})+(?!\d))/g,
                                                                                "."
                                                                              )}
                                                                          </p>
                                                                          <p className="product-desc">
                                                                            (c/u)
                                                                          </p>
                                                                        </div>
                                                                      )}

                                                                      {product.precioPesos3 >
                                                                        0 && (
                                                                        <div
                                                                          className={`div-unidadesmayoristas ${
                                                                            quantity >=
                                                                            product.cantidadMayorista3
                                                                              ? "dark-highlight"
                                                                              : ""
                                                                          }`}
                                                                        >
                                                                          <p
                                                                            className={`p-unidadesmayoristas ${
                                                                              quantity >=
                                                                              product.cantidadMayorista3
                                                                                ? "p-seleccionado"
                                                                                : ""
                                                                            }`}
                                                                          >
                                                                            {
                                                                              product.cantidadMayorista3
                                                                            }{" "}
                                                                            x
                                                                          </p>
                                                                          <p className="product-price">
                                                                            $
                                                                            {Math.ceil(
                                                                              product.precioPesos3
                                                                            )
                                                                              .toLocaleString(
                                                                                "es-ES",
                                                                                {
                                                                                  minimumFractionDigits: 0,
                                                                                  maximumFractionDigits: 2,
                                                                                }
                                                                              )
                                                                              .replace(
                                                                                ",",
                                                                                "."
                                                                              )
                                                                              .replace(
                                                                                /\B(?=(\d{3})+(?!\d))/g,
                                                                                "."
                                                                              )}
                                                                          </p>
                                                                          <p className="product-desc">
                                                                            (c/u)
                                                                          </p>
                                                                        </div>
                                                                      )}
                                                                    </div>
                                                                  </div>
                                                                </div>

                                                                {product.stockTransitorio !==
                                                                  0 && (
                                                                  <div className="product-2">
                                                                    <div className="product-subtotal2">
                                                                      <p className="product-desc">
                                                                        Cantidad:{" "}
                                                                        <b className="product-price">
                                                                          {quantity !==
                                                                            null &&
                                                                          quantity !==
                                                                            undefined
                                                                            ? quantity
                                                                            : 0}
                                                                        </b>
                                                                      </p>
                                                                      <p className="product-desc">
                                                                        Subtotal:{" "}
                                                                        <b className="product-price">
                                                                          $
                                                                          {subtotal
                                                                            .toLocaleString(
                                                                              "es-ES",
                                                                              {
                                                                                minimumFractionDigits: 0,
                                                                                maximumFractionDigits: 2,
                                                                              }
                                                                            )
                                                                            .replace(
                                                                              ",",
                                                                              "."
                                                                            )
                                                                            .replace(
                                                                              /\B(?=(\d{3})+(?!\d))/g,
                                                                              "."
                                                                            )}
                                                                        </b>
                                                                      </p>
                                                                      {(() => {
                                                                        const cantidad =
                                                                          productQuantities[
                                                                            product
                                                                              .idProducto
                                                                          ] ||
                                                                          0;
                                                                        const precioBase =
                                                                          product.precioPesos;
                                                                        let precioAplicado =
                                                                          precioBase;

                                                                        if (
                                                                          product.precioPesos3 >
                                                                            0 &&
                                                                          product.cantidadMayorista3 >
                                                                            0 &&
                                                                          cantidad >=
                                                                            product.cantidadMayorista3
                                                                        ) {
                                                                          precioAplicado =
                                                                            product.precioPesos3;
                                                                        } else if (
                                                                          product.precioPesos2 >
                                                                            0 &&
                                                                          product.cantidadMayorista2 >
                                                                            0 &&
                                                                          cantidad >=
                                                                            product.cantidadMayorista2
                                                                        ) {
                                                                          precioAplicado =
                                                                            product.precioPesos2;
                                                                        }

                                                                        const ahorroUnitario =
                                                                          Math.max(
                                                                            0,
                                                                            precioBase -
                                                                              precioAplicado
                                                                          );
                                                                        const ahorroTotal =
                                                                          ahorroUnitario *
                                                                          cantidad;

                                                                        return ahorroTotal >
                                                                          0 ? (
                                                                          <p className="product-desc ahorro">
                                                                            Ahorraste{" "}
                                                                            <b className="product-price ahorro">
                                                                              $
                                                                              {Math.ceil(
                                                                                ahorroTotal
                                                                              )
                                                                                .toLocaleString(
                                                                                  "es-ES",
                                                                                  {
                                                                                    minimumFractionDigits: 0,
                                                                                    maximumFractionDigits: 2,
                                                                                  }
                                                                                )
                                                                                .replace(
                                                                                  ",",
                                                                                  "."
                                                                                )
                                                                                .replace(
                                                                                  /\B(?=(\d{3})+(?!\d))/g,
                                                                                  "."
                                                                                )}
                                                                            </b>
                                                                          </p>
                                                                        ) : null;
                                                                      })()}
                                                                    </div>
                                                                    <div className="quant-stock-container">
                                                                      {(product.cantidadMayorista2 >
                                                                        0 &&
                                                                        product.precioPesos2 >
                                                                          0) ||
                                                                      (product.cantidadMayorista3 >
                                                                        0 &&
                                                                        product.precioPesos3 >
                                                                          0)
                                                                        ? (() => {
                                                                            const unidadesFaltantes2 =
                                                                              product.cantidadMayorista2 >
                                                                                0 &&
                                                                              product.precioPesos2 >
                                                                                0
                                                                                ? product.cantidadMayorista2 -
                                                                                  quantity
                                                                                : null;
                                                                            const unidadesFaltantes3 =
                                                                              product.cantidadMayorista3 >
                                                                                0 &&
                                                                              product.precioPesos3 >
                                                                                0
                                                                                ? product.cantidadMayorista3 -
                                                                                  quantity
                                                                                : null;

                                                                            const getMensaje =
                                                                              (
                                                                                unidadesFaltantes
                                                                              ) => {
                                                                                return (
                                                                                  <p className="p-tentacion">
                                                                                    Agregue{" "}
                                                                                    {
                                                                                      unidadesFaltantes
                                                                                    }{" "}
                                                                                    {unidadesFaltantes ===
                                                                                    1
                                                                                      ? "unidad"
                                                                                      : "unidades"}{" "}
                                                                                    para
                                                                                    obtener
                                                                                    descuento
                                                                                  </p>
                                                                                );
                                                                              };

                                                                            if (
                                                                              unidadesFaltantes2 >
                                                                              0
                                                                            ) {
                                                                              return getMensaje(
                                                                                unidadesFaltantes2
                                                                              );
                                                                            } else if (
                                                                              unidadesFaltantes3 >
                                                                              0
                                                                            ) {
                                                                              return getMensaje(
                                                                                unidadesFaltantes3
                                                                              );
                                                                            } else {
                                                                              return null;
                                                                            }
                                                                          })()
                                                                        : null}
                                                                      <div className="product-quantity">
                                                                        <button
                                                                          className="quantity-btn btnminus"
                                                                          onClick={() =>
                                                                            handleSubtract(
                                                                              product
                                                                            )
                                                                          }
                                                                        >
                                                                          -
                                                                        </button>
                                                                        <input
                                                                          type="number"
                                                                          min="0"
                                                                          value={
                                                                            quantity
                                                                          }
                                                                          onChange={(
                                                                            event
                                                                          ) =>
                                                                            handleQuantityChange(
                                                                              event,
                                                                              product
                                                                            )
                                                                          }
                                                                          onBlur={() =>
                                                                            updateTotalQuantity()
                                                                          }
                                                                          className="quantity-input"
                                                                        />
                                                                        <button
                                                                          className="quantity-btn btnplus"
                                                                          onClick={() =>
                                                                            handleAdd(
                                                                              product
                                                                            )
                                                                          }
                                                                        >
                                                                          +
                                                                        </button>
                                                                      </div>
                                                                      <p className="product-desc">
                                                                        (
                                                                        {formatStock(
                                                                          product.stockTransitorio
                                                                        )}{" "}
                                                                        {product.stockTransitorio ===
                                                                        1
                                                                          ? "disponible"
                                                                          : "disponibles"}
                                                                        )
                                                                      </p>
                                                                    </div>
                                                                  </div>
                                                                )}

                                                                {product.stockTransitorio !==
                                                                  0 && (
                                                                  <div className="product-notes">
                                                                    <textarea
                                                                      className="textarea"
                                                                      placeholder="Agregar aclaraciones..."
                                                                      value={
                                                                        productNotes[
                                                                          product
                                                                            .idProducto
                                                                        ] || ""
                                                                      }
                                                                      onChange={(
                                                                        event
                                                                      ) =>
                                                                        handleAclaracionesChange(
                                                                          event,
                                                                          product
                                                                        )
                                                                      }
                                                                    ></textarea>
                                                                  </div>
                                                                )}
                                                              </div>
                                                            );
                                                          }
                                                        )
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
                                      (product, index) => {
                                        const quantity =
                                          productQuantities[
                                            product.idProducto
                                          ] || 0;
                                        const subtotal =
                                          calculateSubtotal(product);

                                        if (product.precioPesos === 0) {
                                          return <></>; // No renderizar el producto
                                        }

                                        return (
                                          <div
                                            className={`contenedor-producto oscuro ${
                                              product.stockTransitorio === 0
                                                ? "sin-stock"
                                                : ""
                                            }`}
                                            key={index}
                                          >
                                            <div className="product">
                                              <div className="product-1-col">
                                                <figure className="figure">
                                                  <Zoom
                                                    className="zoom"
                                                    onClick={() =>
                                                      Swal.fire({
                                                        title: product.nombre,
                                                        imageUrl: `${
                                                          product.urlImagen ||
                                                          "https://yourfiles.cloud/uploads/98310f0d0f14ff456c3886d644d438b6/vacio.jpg"
                                                        }`,
                                                        imageWidth: 400,
                                                        imageHeight: 400,
                                                        imageAlt:
                                                          "Vista Producto",
                                                        confirmButtonColor:
                                                          "#6c757d",
                                                        confirmButtonText:
                                                          "Cerrar",
                                                        focusConfirm: true,
                                                      })
                                                    }
                                                  ></Zoom>
                                                  <img
                                                    src={
                                                      product.urlImagen ||
                                                      "https://yourfiles.cloud/uploads/98310f0d0f14ff456c3886d644d438b6/vacio.jpg"
                                                    }
                                                    className="product-img"
                                                    alt="Producto"
                                                  />
                                                </figure>
                                              </div>
                                              <div className="product-2-col">
                                                <h3 className="product-title">
                                                  {product.nombre}
                                                </h3>
                                                <h3 className="product-desc">
                                                  <pre className="pre">
                                                    {product.descripcion}
                                                  </pre>
                                                </h3>
                                                {product.stockTransitorio ===
                                                  0 && (
                                                  <h3 className="product-title sin-stock-h">
                                                    SIN STOCK
                                                  </h3>
                                                )}
                                              </div>
                                              <div className="product-3-col">
                                                <div className="precios-mayoristas">
                                                  <div
                                                    className={`div-unidadesmayoristas ${
                                                      (product.cantidadMayorista2 >
                                                        0 &&
                                                        product.precioPesos2 >
                                                          0 &&
                                                        quantity > 0 &&
                                                        (product.cantidadMayorista2 ===
                                                          null ||
                                                          quantity <
                                                            product.cantidadMayorista2)) || // Nueva condición añadida
                                                      (product.cantidadMayorista3 >
                                                        0 &&
                                                        product.precioPesos3 >
                                                          0 &&
                                                        quantity > 0 &&
                                                        (product.cantidadMayorista2 ===
                                                          null ||
                                                          quantity <
                                                            product.cantidadMayorista2) && // Nueva condición añadida
                                                        quantity <
                                                          product.cantidadMayorista3)
                                                        ? "dark-highlight"
                                                        : ""
                                                    }`}
                                                  >
                                                    {(product.precioPesos2 >
                                                      0 ||
                                                      product.precioPesos3 >
                                                        0) && (
                                                      <p
                                                        className={`p-unidadesmayoristas ${
                                                          (product.cantidadMayorista2 >
                                                            0 &&
                                                            product.precioPesos2 >
                                                              0 &&
                                                            quantity > 0 &&
                                                            (product.cantidadMayorista2 ===
                                                              null ||
                                                              quantity <
                                                                product.cantidadMayorista2)) || // Nueva condición añadida
                                                          (product.cantidadMayorista3 >
                                                            0 &&
                                                            product.precioPesos3 >
                                                              0 &&
                                                            quantity > 0 &&
                                                            (product.cantidadMayorista2 ===
                                                              null ||
                                                              quantity <
                                                                product.cantidadMayorista2) && // Nueva condición añadida
                                                            quantity <
                                                              product.cantidadMayorista3)
                                                            ? "p-seleccionado"
                                                            : ""
                                                        }`}
                                                      >
                                                        1 x
                                                      </p>
                                                    )}
                                                    <p className="product-price">
                                                      $
                                                      {Math.ceil(
                                                        product.precioPesos
                                                      )
                                                        .toLocaleString(
                                                          "es-ES",
                                                          {
                                                            minimumFractionDigits: 0,
                                                            maximumFractionDigits: 2,
                                                          }
                                                        )
                                                        .replace(",", ".")
                                                        .replace(
                                                          /\B(?=(\d{3})+(?!\d))/g,
                                                          "."
                                                        )}
                                                    </p>
                                                  </div>

                                                  {product.precioPesos2 > 0 && (
                                                    <div
                                                      className={`div-unidadesmayoristas ${
                                                        quantity >=
                                                          product.cantidadMayorista2 &&
                                                        (product.cantidadMayorista3 ==
                                                          null ||
                                                          quantity <
                                                            product.cantidadMayorista3)
                                                          ? "dark-highlight"
                                                          : ""
                                                      }`}
                                                    >
                                                      <p
                                                        className={`p-unidadesmayoristas ${
                                                          quantity >=
                                                            product.cantidadMayorista2 &&
                                                          (product.cantidadMayorista3 ==
                                                            null ||
                                                            quantity <
                                                              product.cantidadMayorista3)
                                                            ? "p-seleccionado"
                                                            : ""
                                                        }`}
                                                      >
                                                        {
                                                          product.cantidadMayorista2
                                                        }{" "}
                                                        x
                                                      </p>
                                                      <p className="product-price">
                                                        $
                                                        {Math.ceil(
                                                          product.precioPesos2
                                                        )
                                                          .toLocaleString(
                                                            "es-ES",
                                                            {
                                                              minimumFractionDigits: 0,
                                                              maximumFractionDigits: 2,
                                                            }
                                                          )
                                                          .replace(",", ".")
                                                          .replace(
                                                            /\B(?=(\d{3})+(?!\d))/g,
                                                            "."
                                                          )}
                                                      </p>
                                                      <p className="product-desc">
                                                        (c/u)
                                                      </p>
                                                    </div>
                                                  )}

                                                  {product.precioPesos3 > 0 && (
                                                    <div
                                                      className={`div-unidadesmayoristas ${
                                                        quantity >=
                                                        product.cantidadMayorista3
                                                          ? "dark-highlight"
                                                          : ""
                                                      }`}
                                                    >
                                                      <p
                                                        className={`p-unidadesmayoristas ${
                                                          quantity >=
                                                          product.cantidadMayorista3
                                                            ? "p-seleccionado"
                                                            : ""
                                                        }`}
                                                      >
                                                        {
                                                          product.cantidadMayorista3
                                                        }{" "}
                                                        x
                                                      </p>
                                                      <p className="product-price">
                                                        $
                                                        {Math.ceil(
                                                          product.precioPesos3
                                                        )
                                                          .toLocaleString(
                                                            "es-ES",
                                                            {
                                                              minimumFractionDigits: 0,
                                                              maximumFractionDigits: 2,
                                                            }
                                                          )
                                                          .replace(",", ".")
                                                          .replace(
                                                            /\B(?=(\d{3})+(?!\d))/g,
                                                            "."
                                                          )}
                                                      </p>
                                                      <p className="product-desc">
                                                        (c/u)
                                                      </p>
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            </div>

                                            {product.stockTransitorio !== 0 && (
                                              <div className="product-2">
                                                <div className="product-subtotal2">
                                                  <p className="product-desc">
                                                    Cantidad:{" "}
                                                    <b className="product-price">
                                                      {quantity !== null &&
                                                      quantity !== undefined
                                                        ? quantity
                                                        : 0}
                                                    </b>
                                                  </p>
                                                  <p className="product-desc">
                                                    Subtotal:{" "}
                                                    <b className="product-price">
                                                      $
                                                      {subtotal
                                                        .toLocaleString(
                                                          "es-ES",
                                                          {
                                                            minimumFractionDigits: 0,
                                                            maximumFractionDigits: 2,
                                                          }
                                                        )
                                                        .replace(",", ".")
                                                        .replace(
                                                          /\B(?=(\d{3})+(?!\d))/g,
                                                          "."
                                                        )}
                                                    </b>
                                                  </p>
                                                  {(() => {
                                                    const cantidad =
                                                      productQuantities[
                                                        product.idProducto
                                                      ] || 0;
                                                    const precioBase =
                                                      product.precioPesos;
                                                    let precioAplicado =
                                                      precioBase;

                                                    if (
                                                      product.precioPesos3 >
                                                        0 &&
                                                      product.cantidadMayorista3 >
                                                        0 &&
                                                      cantidad >=
                                                        product.cantidadMayorista3
                                                    ) {
                                                      precioAplicado =
                                                        product.precioPesos3;
                                                    } else if (
                                                      product.precioPesos2 >
                                                        0 &&
                                                      product.cantidadMayorista2 >
                                                        0 &&
                                                      cantidad >=
                                                        product.cantidadMayorista2
                                                    ) {
                                                      precioAplicado =
                                                        product.precioPesos2;
                                                    }

                                                    const ahorroUnitario =
                                                      Math.max(
                                                        0,
                                                        precioBase -
                                                          precioAplicado
                                                      );
                                                    const ahorroTotal =
                                                      ahorroUnitario * cantidad;

                                                    return ahorroTotal > 0 ? (
                                                      <p className="product-desc ahorro">
                                                        Ahorraste{" "}
                                                        <b className="product-price ahorro">
                                                          $
                                                          {Math.ceil(
                                                            ahorroTotal
                                                          )
                                                            .toLocaleString(
                                                              "es-ES",
                                                              {
                                                                minimumFractionDigits: 0,
                                                                maximumFractionDigits: 2,
                                                              }
                                                            )
                                                            .replace(",", ".")
                                                            .replace(
                                                              /\B(?=(\d{3})+(?!\d))/g,
                                                              "."
                                                            )}
                                                        </b>
                                                      </p>
                                                    ) : null;
                                                  })()}
                                                </div>
                                                <div className="quant-stock-container">
                                                  {(product.cantidadMayorista2 >
                                                    0 &&
                                                    product.precioPesos2 > 0) ||
                                                  (product.cantidadMayorista3 >
                                                    0 &&
                                                    product.precioPesos3 > 0)
                                                    ? (() => {
                                                        const unidadesFaltantes2 =
                                                          product.cantidadMayorista2 >
                                                            0 &&
                                                          product.precioPesos2 >
                                                            0
                                                            ? product.cantidadMayorista2 -
                                                              quantity
                                                            : null;
                                                        const unidadesFaltantes3 =
                                                          product.cantidadMayorista3 >
                                                            0 &&
                                                          product.precioPesos3 >
                                                            0
                                                            ? product.cantidadMayorista3 -
                                                              quantity
                                                            : null;

                                                        const getMensaje = (
                                                          unidadesFaltantes
                                                        ) => {
                                                          return (
                                                            <p className="p-tentacion">
                                                              Agregue{" "}
                                                              {
                                                                unidadesFaltantes
                                                              }{" "}
                                                              {unidadesFaltantes ===
                                                              1
                                                                ? "unidad"
                                                                : "unidades"}{" "}
                                                              para obtener
                                                              descuento
                                                            </p>
                                                          );
                                                        };

                                                        if (
                                                          unidadesFaltantes2 > 0
                                                        ) {
                                                          return getMensaje(
                                                            unidadesFaltantes2
                                                          );
                                                        } else if (
                                                          unidadesFaltantes3 > 0
                                                        ) {
                                                          return getMensaje(
                                                            unidadesFaltantes3
                                                          );
                                                        } else {
                                                          return null;
                                                        }
                                                      })()
                                                    : null}

                                                  <div className="product-quantity">
                                                    <button
                                                      className="quantity-btn btnminus oscuro"
                                                      onClick={() =>
                                                        handleSubtract(product)
                                                      }
                                                    >
                                                      -
                                                    </button>
                                                    <input
                                                      type="number"
                                                      min="0"
                                                      value={quantity}
                                                      onChange={(event) =>
                                                        handleQuantityChange(
                                                          event,
                                                          product
                                                        )
                                                      }
                                                      onBlur={() =>
                                                        updateTotalQuantity()
                                                      }
                                                      className="quantity-input"
                                                    />
                                                    <button
                                                      className="quantity-btn btnplus oscuro"
                                                      onClick={() =>
                                                        handleAdd(product)
                                                      }
                                                    >
                                                      +
                                                    </button>
                                                  </div>
                                                  <p className="product-desc">
                                                    (
                                                    {formatStock(
                                                      product.stockTransitorio
                                                    )}{" "}
                                                    {product.stockTransitorio ===
                                                    1
                                                      ? "disponible"
                                                      : "disponibles"}
                                                    )
                                                  </p>
                                                </div>
                                              </div>
                                            )}

                                            {product.stockTransitorio !== 0 && (
                                              <div className="product-notes">
                                                <textarea
                                                  className="textarea"
                                                  placeholder="Agregar aclaraciones..."
                                                  value={
                                                    productNotes[
                                                      product.idProducto
                                                    ] || ""
                                                  }
                                                  onChange={(event) =>
                                                    handleAclaracionesChange(
                                                      event,
                                                      product
                                                    )
                                                  }
                                                ></textarea>
                                              </div>
                                            )}
                                          </div>
                                        );
                                      }
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

                  {/* Botón "Enviar pedido por WhatsApp" con animación "shake" */}
                  {showButton && (
                    <div className="btn-whatsapp-container">
                      <button
                        type="button"
                        className={`btn-whatsapp-shake ${
                          showButton ? "visible" : ""
                        }`}
                        // data-bs-toggle="modal"
                        // data-bs-target="#exampleModal"
                        onClick={() => {
                          // Agregar verificación antes de abrir el modal
                          if (
                            clientType === "Mayorista" &&
                            calculateTotal() < montoMayorista &&
                            codigoExcento === false
                          ) {
                            const faltaImporte =
                              montoMayorista - calculateTotal();

                            swalWithBootstrapButtons
                              .fire({
                                icon: "warning",
                                title: `Falta $${faltaImporte
                                  .toLocaleString("es-ES", {
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 2,
                                  })
                                  .replace(",", ".")
                                  .replace(
                                    /\B(?=(\d{3})+(?!\d))/g,
                                    "."
                                  )} para que puedas hacer tu pedido mayorista`,
                                text: `Debes agregar al menos $${montoMayorista
                                  .toLocaleString("es-ES", {
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 2,
                                  })
                                  .replace(",", ".")
                                  .replace(
                                    /\B(?=(\d{3})+(?!\d))/g,
                                    "."
                                  )} en productos al carrito para enviar el pedido.`,
                                confirmButtonText: "Aceptar",
                                cancelButtonText: "i",
                                showCancelButton: codigo && codigo !== "",
                                confirmButtonColor: "#f8bb86",
                                allowOutsideClick: false,
                              })
                              .then((result) => {
                                if (result.isDismissed) {
                                  Swal.fire({
                                    title: "Ingrese el código",
                                    input: "text",
                                    inputAttributes: {
                                      autocapitalize: "off",
                                    },
                                    showCancelButton: true,
                                    confirmButtonText: "Verificar",
                                    confirmButtonColor: "#40b142",
                                    cancelButtonText: "Cancelar",
                                    showLoaderOnConfirm: true,
                                    allowOutsideClick: false,
                                    preConfirm: (login) => {
                                      return new Promise((resolve, reject) => {
                                        if (login === codigo) {
                                          resolve(); // Resolviendo la promesa para indicar que la validación fue exitosa
                                        } else if (login === "") {
                                          reject("Código vacio");
                                        } else {
                                          reject("Código incorrecto"); // Rechazando la promesa para indicar que la validación falló
                                        }
                                      }).catch((error) => {
                                        Swal.showValidationMessage(error);
                                      });
                                    },
                                  }).then((result) => {
                                    if (result.isConfirmed) {
                                      Swal.fire({
                                        title: "Código aplicado exitosamente",
                                        icon: "success",
                                        confirmButtonText: "Aceptar",
                                        confirmButtonColor: "#a5dc86",
                                        allowOutsideClick: true,
                                      });

                                      setCodigoExcento(true);
                                    }
                                  });
                                }
                              });

                            return; // Detener el proceso si no hay suficientes productos
                          }

                          // Lógica adicional después de la verificación (si es necesario)
                          // ClearClientInputs();
                          setTimeout(function () {
                            $("#nombre").focus();
                          }, 500);

                          // Abre el modal solo si hay suficientes productos
                          document.getElementById("hiddenModalButton").click();
                        }}
                      >
                        <Whatsapplogo className="svg-wpp2 wpp-shake" />
                        Enviar pedido por WhatsApp{" "}
                        <b>
                          $
                          {calculateTotal()
                            .toLocaleString("es-ES", {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 2,
                            })
                            .replace(",", ".")
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                        </b>
                      </button>

                      <button
                        id="hiddenModalButton"
                        className="hidden"
                        data-bs-toggle="modal"
                        data-bs-target="#exampleModal"
                      >
                        .
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </section>

            <div
              className="modal fade"
              id="exampleModal"
              data-bs-backdrop="static"
              data-bs-keyboard="false"
              tabIndex="-1"
              aria-labelledby="staticBackdropLabel"
              aria-hidden="true"
            >
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <h1 className="title-form-login" id="exampleModalLabel">
                      COMPLETA EL SIGUIENTE FORMULARIO PARA QUE PREPAREMOS TU
                      PEDIDO
                    </h1>
                  </div>
                  <div className="modal-body modal-body-client">
                    <div className="container mt-4">
                      <form>
                        <div className="form-group">
                          <label className="label">Nombre completo:</label>
                          <div className="form-group-input nombre-input">
                            <input
                              type="text"
                              className="input2"
                              id="nombre"
                              value={nombre}
                              onChange={(event) => {
                                setNombre(event.target.value);
                              }}
                            />
                          </div>

                          <label className="label">DNI:</label>
                          <div className="form-group-input nombre-input">
                            <input
                              type="number"
                              className="input2"
                              id="dni"
                              value={dni}
                              onChange={(event) => {
                                setDni(event.target.value);
                              }}
                            />
                          </div>

                          <label className="label">Número de teléfono:</label>
                          <div className="form-group-input desc-input">
                            <input
                              type="number"
                              className="input2"
                              id="telefono"
                              value={telefono}
                              onChange={(event) => {
                                setTelefono(event.target.value);
                              }}
                            />
                          </div>

                          <label className="label selects" htmlFor="envio">
                            Entrega:
                          </label>
                          <div className="form-group-input nombre-input">
                            <select
                              className="input2"
                              style={{ cursor: "pointer" }}
                              name="envio"
                              id="envio"
                              value={envio}
                              onChange={handleEnvioClick}
                            >
                              <option hidden key={0} value="0">
                                Seleccione una forma de entrega
                              </option>
                              {listaFormasEntrega &&
                                Array.from(listaFormasEntrega).map(
                                  (opts, i) => {
                                    const shouldShowCatalogo = [1, 3].includes(opts.disponibilidadCatalogo);

                                    return shouldShowCatalogo ? (
                                      <option
                                        className="btn-option"
                                        key={i}
                                        value={opts.idEnvio}
                                        data-nombre={opts.nombre}
                                        data-aclaracion={opts.aclaracion}
                                        data-costo={opts.costo}
                                        data-imagen={opts.urlImagen}
                                      >
                                        {opts.nombre} (${opts.costo})
                                        {opts.aclaracion
                                          ? ` - ${opts.aclaracion}`
                                          : ""}
                                      </option>
                                    ) : null;
                                  }
                                )}
                            </select>
                          </div>

                          {/* Renderizar los campos de dirección y entre calles solo si la forma de entrega es con envio a domicilio */}
                          {nombreEnvio.toLowerCase().includes("domicilio") && (
                            <>
                              <label className="label">Dirección:</label>
                              <div className="form-group-input desc-input">
                                <input
                                  type="text"
                                  className="input2"
                                  id="direccion"
                                  value={direccion}
                                  onChange={(event) => {
                                    setDireccion(event.target.value);
                                  }}
                                />
                              </div>

                              <label className="label">Entre que calles:</label>
                              <div className="form-group-input desc-input">
                                <input
                                  type="text"
                                  className="input2"
                                  id="calles"
                                  value={calles}
                                  onChange={(event) => {
                                    setCalles(event.target.value);
                                  }}
                                />
                              </div>
                            </>
                          )}

                          {nombreEnvio.toLowerCase().includes("local") &&
                            direccionAuto &&
                            direccionAuto !== "" && (
                              <>
                                <label className="label">Dirección:</label>
                                <div className="form-group-input desc-input">
                                  <input
                                    type="text"
                                    className="input2"
                                    id="direccionAuto"
                                    value={direccionAuto}
                                    style={{
                                      backgroundColor: "#d3d3d3",
                                      cursor: "default",
                                    }}
                                    readOnly
                                  />

                                  {urlDireccionAuto &&
                                    urlDireccionAuto !== "" && (
                                      <a
                                        href={
                                          urlDireccionAuto
                                            ? urlDireccionAuto
                                            : "#"
                                        }
                                        target={
                                          urlDireccionAuto ? "_blank" : ""
                                        }
                                        rel={
                                          urlDireccionAuto
                                            ? "noopener noreferrer"
                                            : ""
                                        }
                                      >
                                        <Location className="location-btn" />
                                      </a>
                                    )}
                                </div>
                              </>
                            )}

                          {nombreEnvio.toLowerCase().includes("local") &&
                            horariosAtencion &&
                            horariosAtencion !== "" && (
                              <>
                                <label className="label">
                                  Horarios de atención:
                                </label>
                                <div className="form-group-input desc-input">
                                  <input
                                    type="text"
                                    className="input2"
                                    id="horariosDeAtencion"
                                    value={horariosAtencion}
                                    style={{
                                      backgroundColor: "#d3d3d3",
                                      cursor: "default",
                                    }}
                                    readOnly
                                  />
                                </div>
                              </>
                            )}

                          <label className="label selects" htmlFor="abono">
                            Medio de pago:
                          </label>
                          <div className="form-group-input nombre-input">
                            <select
                              className="input2"
                              onClick={handleAbonoClickVerify}
                              style={{ cursor: "pointer" }}
                              name="abono"
                              id="abono"
                              value={abono}
                              onChange={handleAbonoClick}
                            >
                              <option hidden key={0} value="0">
                                Seleccione un medio de pago
                              </option>
                              {listaNombresAbonos &&
                                Array.from(listaNombresAbonos).map(
                                  (opts, i) => {
                                    const shouldShowEnvio =
                                      (nombreEnvio
                                        .toLowerCase()
                                        .includes("local") &&
                                        opts.disponibilidad !== 2) ||
                                      (nombreEnvio
                                        .toLowerCase()
                                        .includes("domicilio") &&
                                        opts.disponibilidad !== 1) ||
                                      opts.disponibilidad === 3;

                                    const shouldShowCatalogo = [1, 3].includes(opts.disponibilidadCatalogo);

                                    const shouldShow =
                                      shouldShowEnvio && shouldShowCatalogo;

                                    return shouldShow ? (
                                      <option
                                        className="btn-option"
                                        key={i}
                                        data-nombre={opts.nombre}
                                        value={opts.idMetodoPago}
                                      >
                                        {opts.nombre}
                                      </option>
                                    ) : null;
                                  }
                                )}
                            </select>
                          </div>

                          {nombreAbono.toLowerCase() == "transferencia" &&
                            cbu &&
                            cbu !== "" && (
                              <>
                                <label className="label">CBU:</label>
                                <div className="form-group-input desc-input">
                                  <input
                                    type="text"
                                    className="input2"
                                    id="cbu"
                                    value={cbu}
                                    style={{
                                      backgroundColor: "#d3d3d3",
                                      cursor: "default",
                                    }}
                                    readOnly
                                  />
                                </div>
                              </>
                            )}

                          {nombreAbono.toLowerCase() == "transferencia" &&
                            alias &&
                            alias !== "" && (
                              <>
                                <label className="label">ALIAS:</label>
                                <div className="form-group-input desc-input">
                                  <input
                                    type="text"
                                    className="input2"
                                    id="alias"
                                    value={alias}
                                    style={{
                                      backgroundColor: "#d3d3d3",
                                      cursor: "default",
                                    }}
                                    readOnly
                                  />
                                </div>
                              </>
                            )}

                          {!pathname.includes("redes") && (
                            <>
                              <label
                                className="label selects"
                                htmlFor="vendedor"
                              >
                                Vendedor:
                              </label>
                              <div className="form-group-input nombre-input">
                                <select
                                  className="input2"
                                  style={{ cursor: "pointer" }}
                                  name="vendedor"
                                  id="vendedor"
                                  value={vendedor}
                                  onChange={(e) => setVendedor(e.target.value)}
                                >
                                  <option hidden key={0} value="0">
                                    Seleccione un vendedor
                                  </option>
                                  {listaNombresVendedores &&
                                    Array.from(listaNombresVendedores).map(
                                      (opts, i) => {
                                        const shouldShowCatalogo = [
                                          1, 3,
                                        ].includes(opts.disponibilidadCatalogo);

                                        return shouldShowCatalogo ? (
                                          <option
                                            className="btn-option"
                                            key={i}
                                            value={opts.idUsuario}
                                          >
                                            {opts.nombre}
                                          </option>
                                        ) : null;
                                      }
                                    )}
                                  <option className="no-vendedor" value="-1">
                                    No recibí atención
                                  </option>
                                </select>
                              </div>
                            </>
                          )}

                          {pathname.includes("mayorista") && (
                            <>
                              <label
                                className="label selects"
                                htmlFor="newsletter"
                              >
                                Suscribirse a la lista de difusión de WhatsApp:
                              </label>

                              <div className="checkbox-group nombre-input">
                                <div className="checkbox-cont">
                                  <input
                                    className="checkbox-input"
                                    type="checkbox"
                                    id="newsletter"
                                    name="newsletter"
                                    checked={newsletter === true}
                                    onChange={handleNewsletterChange}
                                  />
                                </div>
                              </div>

                              <b className="iva">LOS PRECIOS NO INCLUYEN IVA</b>
                            </>
                          )}

                          <b>Cantidad total de productos: {totalQuantity}</b>

                          {/* Mostrar el costo de envío solo si la opción es "Envío a domicilio" */}
                          {costoEnvioDomicilio > 0 && (
                            <>
                              <b>
                                Subtotal: $
                                {(calculateTotal() - costoEnvioDomicilio)
                                  .toLocaleString("es-ES", {
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 2,
                                  })
                                  .replace(",", ".")
                                  .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                              </b>

                              <b className="costo-envio">
                                Costo de envío: ${costoEnvioDomicilio}
                              </b>
                            </>
                          )}

                          <b>
                            Total: $
                            {calculateTotal()
                              .toLocaleString("es-ES", {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 2,
                              })
                              .replace(",", ".")
                              .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                          </b>

                          {calculateTotalAhorro() > 0 && (
                            <b className="ahorro2">
                              Ahorraste{" "}
                                $
                                {Math.ceil(calculateTotalAhorro())
                                  .toLocaleString("es-ES", {
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 2,
                                  })
                                  .replace(",", ".")
                                  .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                            </b>
                          )}
                        </div>
                      </form>

                      {nombreAbono.toLowerCase() == "mercado pago" ? (
                        <div>
                          {showWallet ? (
                            <>
                              {showWalletLoader == true && (
                                <div className="loading-mercadopago-div">
                                  <Loader />
                                </div>
                              )}
                              <Wallet
                                initialization={{ preferenceId: preferenceId }}
                                onReady={handleOnReady}
                              />
                            </>
                          ) : (
                            // Display "Pagar y enviar pedido" button
                            <div id="div-btn-save">
                              <button
                                className="btnmeli"
                                id="btn-save"
                                onClick={handleSubmitPedidoMercadoPago}
                              >
                                <div className="btn-save-update-close">
                                  <Mercadopagologo className="meli-btn" />
                                  <p className="p-save-update-close">
                                    Pagar y enviar pedido
                                  </p>
                                </div>
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div id="div-btn-save">
                          <button
                            className={`btnadd2 ${
                              !whatsapp || whatsapp === "0"
                                ? "btnadd2-disabled"
                                : ""
                            }`}
                            id="btn-save"
                            onClick={handleSubmitPedido}
                          >
                            <div className="btn-save-update-close">
                              <Whatsapplogo
                                className={`save-btn ${
                                  !whatsapp || whatsapp === "0"
                                    ? "save-btn-disabled"
                                    : ""
                                }`}
                              />
                              <p
                                className={`p-save-update-close ${
                                  !whatsapp || whatsapp === "0"
                                    ? "p-save-update-close-disabled"
                                    : ""
                                }`}
                              >
                                {!whatsapp || whatsapp === "0"
                                  ? "WhatsApp no disponible"
                                  : "Enviar Pedido"}
                              </p>
                            </div>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-success"
                      onClick={() => {
                        CloseModal();

                        const userData = {
                          nombre,
                          dni,
                          direccion,
                          calles,
                          telefono,
                          abono,
                          nombreAbono,
                          vendedor,
                          envio,
                          nombreEnvio,
                          aclaracionEnvio,
                          costoEnvioDomicilio,
                        };

                        // Convert the object to a JSON string and store it in localStorage
                        localStorage.setItem(
                          "userData",
                          JSON.stringify(userData)
                        );
                      }}
                    >
                      <div className="btn-save-update-close">
                        <Save className="close-btn" />
                        <p className="p-save-update-close">Cerrar y guardar</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        if (IsEmpty() === true) {
                          ClearClientInputs();
                          CloseModal();
                        } else {
                          Swal.fire({
                            icon: "warning",
                            title:
                              "¿Está seguro de que desea cerrar el formulario?",
                            text: "Se perderán todos los datos cargados",
                            confirmButtonText: "Aceptar",
                            showCancelButton: true,
                            cancelButtonText: "Cancelar",
                            confirmButtonColor: "#f8bb86",
                            cancelButtonColor: "#6c757d",
                          }).then((result) => {
                            if (result.isConfirmed) {
                              ClearClientInputs();
                              CloseModal();
                              ClearFormData();
                            }
                          });
                        }
                      }}
                    >
                      <div className="btn-save-update-close">
                        <Close className="close-btn" />
                        <p className="p-save-update-close">Cerrar</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      className="btn-close-modal"
                      id="btn-close-modal"
                      data-bs-dismiss="modal"
                    ></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
  //#endregion
};

export default CatalogueCart;
