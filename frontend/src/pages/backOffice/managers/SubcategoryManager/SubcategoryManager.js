import Swal from "sweetalert2";
import { ReactComponent as Filter } from "../../../../assets/svgs/filter.svg";
import $ from "jquery";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet";

import "./SubcategoryManager.css";

//#region SVG'S Imports
import { ReactComponent as Edit } from "../../../../assets/svgs/edit.svg";
import { ReactComponent as Delete } from "../../../../assets/svgs/delete.svg";
import { ReactComponent as Add } from "../../../../assets/svgs/add.svg";
import { ReactComponent as Save } from "../../../../assets/svgs/save.svg";
import { ReactComponent as Update } from "../../../../assets/svgs/update.svg";
import { ReactComponent as Close } from "../../../../assets/svgs/closebtn.svg";
import { ReactComponent as Back } from "../../../../assets/svgs/back.svg";
import { ReactComponent as ImageInput } from "../../../../assets/svgs/imageinput.svg";
import { ReactComponent as Upload } from "../../../../assets/svgs/upload.svg";

import { ReactComponent as SubcategoryInput } from "../../../../assets/svgs/subcategory.svg";
//#endregion

import Loader from "../../../../components/Loaders/LoaderCircle";

import {
  GetSubcategoriesByCategoryManage,
  SaveSubcategories,
  UpdateSubcategories,
  DeleteSubcategories,
} from "../../../../services/SubcategoryService";

import { GetCategoryById } from "../../../../services/CategoryService";

function SubcategoryManager() {
  //#region Constantes
  const { id } = useParams();

  const [category, setCategory] = useState({});

  const [isLoading, setIsLoading] = useState(false);

  const [idSubcategoria, setIdSubcategoria] = useState("");

  const [nombre, setNombre] = useState("");
  const [prevNombre, setPrevNombre] = useState("");

  const [urlImagen, setUrlImagen] = useState("");
  const [prevUrlImagen, setPrevUrlImagen] = useState("");

  const [ocultar, setOcultar] = useState("");
  const [prevOcultar, setPrevOcultar] = useState("");

  const [modalTitle, setModalTitle] = useState("");

  const [subcategories, setSubcategories] = useState([]);

  const [originalCategoriesList, setOriginalSubcategoriesList] =
    useState(subcategories);

  const [title, setTitle] = useState("Detalles de Subcategorías");

  const [filterName, setFilterName] = useState("");

  const [filterType, setFilterType] = useState("");

  const [hidden, setHidden] = useState(false);

  const token = localStorage.getItem("token"); // Obtener el token del localStorage
  const headers = {
    Authorization: `Bearer ${token}`, // Agregar el encabezado Authorization con el valor del token
  };

  //#region Constantes de la paginacion
  const [currentPage, setCurrentPage] = useState(1);
  const [categoriesPerPage, setCategoriesPerPage] = useState(20);
  const lastIndex = currentPage * categoriesPerPage;
  const firstIndex = lastIndex - categoriesPerPage;
  const categoriesTable = subcategories.slice(firstIndex, lastIndex);
  const npage = Math.ceil(subcategories.length / categoriesPerPage);
  const numbers = [...Array(npage + 1).keys()].slice(1);

  const [maxPageNumbersToShow, setMaxPageNumbersToShow] = useState(9);
  const minPageNumbersToShow = 0;
  //#endregion
  //#endregion

  //#region UseEffect
  useEffect(() => {
    (async () => {
      setIsLoading(true);

      try {
        const result = await GetSubcategoriesByCategoryManage(id);
        setSubcategories(result);
        setOriginalSubcategoriesList(result);

        const categoryData = await GetCategoryById(id);
        setCategory(categoryData);

        setIsLoading(false);
      } catch (error) {
        // Manejar errores aquí si es necesario
        setIsLoading(false);
      }
    })();

    if (window.matchMedia("(max-width: 500px)").matches) {
      setCategoriesPerPage(1);
      setMaxPageNumbersToShow(1);
    } else if (window.matchMedia("(max-width: 600px)").matches) {
      setCategoriesPerPage(2);
      setMaxPageNumbersToShow(1);
    } else if (window.matchMedia("(max-width: 700px)").matches) {
      setCategoriesPerPage(3);
      setMaxPageNumbersToShow(1);
    } else if (window.matchMedia("(max-width: 800px)").matches) {
      setCategoriesPerPage(4);
      setMaxPageNumbersToShow(1);
    } else if (window.matchMedia("(max-width: 900px)").matches) {
      setCategoriesPerPage(5);
      setMaxPageNumbersToShow(1);
    } else if (window.matchMedia("(max-width: 1000px)").matches) {
      setCategoriesPerPage(6);
      setMaxPageNumbersToShow(1);
    } else if (window.matchMedia("(max-width: 1140px)").matches) {
      setCategoriesPerPage(7);
      setMaxPageNumbersToShow(1);
    } else {
      setCategoriesPerPage(10);
      setMaxPageNumbersToShow(9);
    }
  }, [id]);
  //#endregion

  //#region Función para borrar cualquier filtro
  const ClearFilter = () => {
    setSubcategories(originalCategoriesList); // trae la lista de subcategorías original, sin ningun filtro
    setFilterName("");
    setFilterType("");
    setTitle("Detalles de Subcategorías");

    const clearFilter = document.getElementById("clear-filter");
    const clearFilter2 = document.getElementById("clear-filter2");

    if (clearFilter) {
      clearFilter.style.display = "none";
    } else {
      console.log("clear-filter element not found");
    }

    if (clearFilter2) {
      clearFilter2.style.display = "none";
    } else {
      console.log("clear-filter2 element not found");
    }

    setCurrentPage(1);
    if (hidden === true) {
      setHidden(false);
    }
    window.scrollTo(0, 0);
  };
  //#endregion

  //#region Función para filtrar por ocultas
  const filterResultHidden = (hidden) => {
    if (hidden === false) {
      setSubcategories(originalCategoriesList);
      const result = originalCategoriesList.filter((originalCategoriesList) => {
        return originalCategoriesList.ocultar === true;
      });
      setTitle("Detalles de Subcategorías ocultas");
      setSubcategories(result);
      document.getElementById("clear-filter").style.display = "flex";
      document.getElementById("clear-filter2").style.display = "flex";
      setFilterName("Oculta");
      setFilterType("hidden");
      setCurrentPage(1);
      window.scrollTo(0, 0);
    } else {
      ClearFilter();
    }
  };
  //#endregion

  //#region Funciónes para la paginacion
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

  //#region Función para limpiar todos los valores de los inputs del formulario
  function ClearCategoryInputs() {
    setIdSubcategoria("");

    setNombre("");
    setOcultar("");
    setUrlImagen("");
  }
  //#endregion

  //#region Función para obtener los valores almacenados de una Subcategoría y cargar cada uno de ellos en su input correspondiente
  function RetrieveCategoryInputs(category) {
    setIdSubcategoria(category.idSubcategoria);
    setNombre(category.nombre);
    setOcultar(category.ocultar);
    setUrlImagen(category.urlImagen);

    setPrevNombre(category.nombre);
    setPrevOcultar(category.ocultar);
    setPrevUrlImagen(category.urlImagen);
  }
  //#endregion

  //#region Función para volver el formulario a su estado inicial, borrando los valores de los inputs, cargando los selects y refrezcando la lista de subcategorías
  async function InitialState() {
    ClearCategoryInputs();

    const result = await GetSubcategoriesByCategoryManage(id);
    setSubcategories(result);
    setOriginalSubcategoriesList(result);
  }
  //#endregion

  //#region Función para cerrar el modal manualmente mediante el codigo
  function CloseModal() {
    $(document).ready(function () {
      $("#btn-close-modal").click();
    });
  }
  //#endregion

  //#region Función para cerrar el modal de filtros manualmente mediante el codigo
  function CloseFilterModal() {
    $(document).ready(function () {
      $("#btn-close-modal-filters").click();
    });
  }
  //#endregion

  //#region Función para mostrar el boton de Guardar de manera normal
  function ShowSaveButton() {
    const btnSave = document.getElementById("btn-save");
    const divBtnSave = document.getElementById("div-btn-save");
    btnSave.style.pointerEvents = "all";
    btnSave.style.opacity = "1";
    divBtnSave.style.cursor = "default";
  }
  //#endregion

  //#region Función para verificar si los valores ingresados a traves de los inputs son correctos
  function IsValid() {
    if (nombre === "") {
      Swal.fire({
        icon: "error",
        title: "El nombre no puede estar vacío",
        text: "Complete el campo",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#f27474",
      }).then(function () {
        setTimeout(function () {
          $("#nombre").focus();
        }, 500);
      });
      if (modalTitle === "Registrar Subcategoría") {
        ShowSaveButton();
      }
      return false;
    } else if (ocultar === "") {
      Swal.fire({
        icon: "error",
        title: "Debe indicar si se encuentra oculta",
        text: "Clickeé el botón en caso de que la misma se encuentre oculta",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#f27474",
      });
      if (modalTitle === "Registrar Subcategoría") {
        ShowSaveButton();
      }
      return false;
    }
    return true;
  }
  //#endregion

  //#region Función para verificar si el valor "nombre" ingresado a traves del input no esta repetido
  function IsRepeated() {
    for (let i = 0; i < subcategories.length; i++) {
      if (
        nombre.toLowerCase() === subcategories[i].nombre.toLowerCase() &&
        nombre !== prevNombre
      ) {
        Swal.fire({
          icon: "error",
          title: "El nombre ingresado ya se encuentra registrado",
          text: "Modifique el campo",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#f27474",
        }).then(function () {
          setTimeout(function () {
            $("#nombre").focus();
          }, 500);
        });

        if (modalTitle === "Registrar Subcategoría") {
          ShowSaveButton();
        }

        return true;
      }
    }
    return false;
  }
  //#endregion

  //#region Función para verificar si los valores de los inputs estan vacios
  function IsEmpty() {
    if (nombre !== "") {
      return false;
    } else if (ocultar !== false) {
      return false;
    }
    return true;
  }
  //#endregion

  //#region Función para verificar si se actualizo al menos un valor de los inputs
  function IsUpdated() {
    if (
      prevNombre.toLowerCase() !== nombre.toLocaleLowerCase() ||
      prevOcultar !== ocultar ||
      prevUrlImagen !== urlImagen
    ) {
      return true;
    }
    return false;
  }
  //#endregion

  //#region Función para insertar una subcategoría
  async function SaveSubcategory(event) {
    event.preventDefault();

    const btnSave = document.getElementById("btn-save");
    const divBtnSave = document.getElementById("div-btn-save");
    btnSave.style.pointerEvents = "none";
    btnSave.style.opacity = "0.5";
    divBtnSave.style.cursor = "wait";

    const isValid = IsValid();
    const isRepeated = IsRepeated();

    if (isValid && !isRepeated) {
      try {
        await SaveSubcategories(
          {
            nombre: `${nombre.charAt(0).toUpperCase() + nombre.slice(1)}`,
            ocultar: ocultar,
            urlImagen: urlImagen,
            idCategoria: id,
          },
          headers
        );
        Swal.fire({
          icon: "success",
          title: "Subcategoría registrada exitosamente!",
          showConfirmButton: false,
          timer: 2000,
        });

        CloseModal();
        ShowSaveButton();
        InitialState();
        ClearFilter();
      } catch (err) {
        Swal.fire({
          title: err,
          icon: "error",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#f27474",
        });
      }
    }
  }
  //#endregion

  //#region Función para actualizar una subcategoría ya existente
  async function UpdateSubcategory(event) {
    event.preventDefault();
    if (IsUpdated() === false) {
      Swal.fire({
        icon: "error",
        title: "No puede actualizar la subcategoría sin modificar ningun campo",
        text: "Modifique al menos un campo para poder actualizarla",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#F27474",
      });
    } else if (
      IsValid() === true &&
      IsUpdated() === true &&
      IsRepeated() === false
    ) {
      try {
        await UpdateSubcategories(
          subcategories.find((u) => u.idSubcategoria === idSubcategoria)
            .idSubcategoria || idSubcategoria,
          {
            idSubcategoria: idSubcategoria,
            nombre: `${nombre.charAt(0).toUpperCase() + nombre.slice(1)}`,
            ocultar: ocultar,
            urlImagen: urlImagen,
            idCategoria: id,
          },
          headers
        );
        Swal.fire({
          icon: "success",
          title: "Subcategoría actualizada exitosamente!",
          showConfirmButton: false,
          timer: 2000,
        });
        CloseModal();

        // InitialState();
        ClearCategoryInputs();

        const result = await GetSubcategoriesByCategoryManage(id);
        setSubcategories(result);

        setSubcategories((prevCategories) => {
          setOriginalSubcategoriesList(prevCategories);

          if (filterType === "hidden") {
            const result = prevCategories.filter((category) => {
              return category.ocultar === true;
            });
            setTitle("Detalles de Subcategorías ocultas");
            setSubcategories(result);
            document.getElementById("clear-filter").style.display = "flex";
            document.getElementById("clear-filter2").style.display = "flex";
            setFilterName("Oculta");
            setFilterType("hidden");
            setCurrentPage(1);
          }
          if (filterType === "other") {
            setSubcategories(prevCategories);
          } else {
            return prevCategories;
          }
        });
      } catch (err) {
        Swal.fire({
          title: err,
          icon: "error",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#f27474",
        });
      }
    }
  }
  //#endregion

  //#region Función para eliminar una subcategoría existente
  async function DeleteSubcategory(id) {
    try {
      let resultado = await DeleteSubcategories(id, headers);

      if (resultado.data.statusCode === 400) {
        Swal.fire({
          icon: "error",
          title:
            "No puede eliminar esta subcategoría ya que la misma se encuentra seleccionada dentro de uno o mas productos",
          text: "Primero debera eliminar el/los productos que contienen la subcategoría que desea eliminar o cambiarle/s su subcategoría",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#f27474",
        });
      } else {
        Swal.fire({
          icon: "success",
          title: "Subcategoría eliminada exitosamente!",
          showConfirmButton: false,
          timer: 2000,
        });
        InitialState();
        ClearFilter();
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: error,
        text: error.message,
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#f27474",
      });
    }
  }
  //#endregion

  //#region Return
  return (
    <div>
      <Helmet>
        <title>La Gran Feria | Gestionar Subcategorías</title>
      </Helmet>

      <section className="general-container">
        <div className="general-content">
          <div className="general-title">
            <div className="title-header">
              <Link
                to="/gestionar-categorias"
                className="btn btn-info btn-back"
              >
                <div className="btn-back-content">
                  <Back className="back" />
                  <p className="p-back">Regresar</p>
                </div>
              </Link>

              <h2 className="title title-general">{title}</h2>

              {isLoading === false && (
                <button
                  type="button"
                  className="btn btn-success btn-add"
                  data-bs-toggle="modal"
                  data-bs-target="#modal"
                  onClick={() => {
                    ClearCategoryInputs();
                    setModalTitle("Registrar Subcategoría");
                    setTimeout(function () {
                      $("#nombre").focus();
                    }, 500);
                    setOcultar(false);
                  }}
                >
                  <div className="btn-add-content">
                    <Add className="add" />
                    <p className="p-add">Añadir</p>
                  </div>
                </button>
              )}
            </div>

            {isLoading === false &&
              (subcategories.length > 1 || subcategories.length === 0 ? (
                <p className="total">
                  Hay {subcategories.length} subcategorías.
                </p>
              ) : (
                <p className="total">
                  Hay {subcategories.length} subcategoría.
                </p>
              ))}
          </div>

          {/* modal con el formulario para registrar/actualizar una subcategoría */}
          <div
            className="modal fade"
            id="modal"
            data-bs-backdrop="static"
            data-bs-keyboard="false"
            tabIndex="-1"
            aria-labelledby="staticBackdropLabel"
            aria-hidden="true"
          >
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h1 className="modal-title" id="exampleModalLabel">
                    {modalTitle}
                  </h1>
                </div>
                <div className="modal-body">
                  <div className="container mt-4">
                    <form>
                      <div className="form-group">
                        <input
                          type="text"
                          className="input"
                          id="idSubcategoria"
                          hidden
                          value={idSubcategoria}
                          onChange={(event) => {
                            setIdSubcategoria(event.target.value);
                          }}
                        />

                        <label className="label">Nombre:</label>
                        <div className="form-group-input">
                          <span className="input-group-text">
                            <SubcategoryInput className="input-group-svg" />
                          </span>
                          <input
                            type="text"
                            className="input"
                            id="nombre"
                            value={nombre}
                            onChange={(event) => {
                              setNombre(event.target.value);
                            }}
                          />
                        </div>
                      </div>

                      <div className="form-group ocultar2">
                        <label className="label">Ocultar</label>
                        <input
                          type="checkbox"
                          className="form-check-input tick"
                          id="ocultar"
                          checked={ocultar}
                          onChange={(e) => {
                            setOcultar(e.target.checked);
                          }}
                        />
                        <label htmlFor="ocultar" className="lbl-switch"></label>
                      </div>

                      <div className="form-group">
                        <label id="urlImagenLabel" className="label">
                          URL Imagen:
                        </label>
                        <div
                          id="urlImagen"
                          className="form-group-input-upload-image"
                        >
                          <span className="input-group-text">
                            <ImageInput className="input-group-svg" />
                          </span>
                          <input
                            type="text"
                            className="input-uploadimage"
                            id="urlImagenInput"
                            value={urlImagen}
                            onChange={(event) => {
                              setUrlImagen(event.target.value);
                            }}
                          />
                          <a
                            href="https://yourfiles.cloud/"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Upload className="upload-btn" />
                          </a>
                        </div>
                      </div>

                      <div>
                        {modalTitle === "Registrar Subcategoría" ? (
                          <div id="div-btn-save">
                            <button
                              className="btn btn-success btnadd"
                              id="btn-save"
                              onClick={SaveSubcategory}
                            >
                              <div className="btn-save-update-close">
                                <Save className="save-btn" />
                                <p className="p-save-update-close">Guardar</p>
                              </div>
                            </button>
                          </div>
                        ) : (
                          <div id="div-btn-update">
                            <button
                              className="btn btn-warning btn-edit-color"
                              id="btn-update"
                              onClick={UpdateSubcategory}
                            >
                              <div className="btn-save-update-close">
                                <Update className="update-btn" />
                                <p className="p-save-update-close">
                                  Actualizar
                                </p>
                              </div>
                            </button>
                          </div>
                        )}
                      </div>
                    </form>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      if (modalTitle === "Registrar Subcategoría") {
                        if (IsEmpty() === true) {
                          ClearCategoryInputs();
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
                              ClearCategoryInputs();
                              CloseModal();
                            }
                          });
                        }
                      } else if (modalTitle === "Actualizar Subcategoría") {
                        if (IsUpdated() === false) {
                          ClearCategoryInputs();
                          CloseModal();
                        } else {
                          Swal.fire({
                            icon: "warning",
                            title:
                              "¿Está seguro de que desea cerrar el formulario?",
                            text: "Se perderán todos los datos modificados",
                            confirmButtonText: "Aceptar",
                            showCancelButton: true,
                            cancelButtonText: "Cancelar",
                            confirmButtonColor: "#f8bb86",
                            cancelButtonColor: "#6c757d",
                          }).then((result) => {
                            if (result.isConfirmed) {
                              ClearCategoryInputs();
                              CloseModal();
                            }
                          });
                        }
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

          <br />

          {/* modal con filtro */}
          <div
            className="modal fade"
            id="modal-filters"
            data-bs-backdrop="static"
            data-bs-keyboard="false"
            tabIndex="-1"
            aria-labelledby="staticBackdropLabel"
            aria-hidden="true"
          >
            <div className="modal-dialog modal-dialog2">
              <div className="modal-content">
                <div className="modal-header2">
                  <h1 className="modal-title2" id="exampleModalLabel">
                    Filtro
                  </h1>
                  <button
                    id="clear-filter2"
                    className="clear-filter2"
                    onClick={ClearFilter}
                  >
                    <Close className="close-svg2" />
                    <p className="clear-filter-p">{filterName}</p>
                  </button>
                </div>
                <div className="modal-body">
                  <div className="container">
                    <p className="filter-separator separator-margin"></p>

                    <div className="filter-btn-container">
                      <p className="filter-btn-name">OCULTA</p>
                      <p className="filter-btn">
                        <input
                          type="checkbox"
                          className="form-check-input tick"
                          id="hidden"
                          checked={hidden}
                          onChange={() => {
                            setHidden(!hidden);
                            filterResultHidden(hidden);
                          }}
                        />
                        <label htmlFor="hidden" className="lbl-switch"></label>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={CloseFilterModal}
                  >
                    <div className="btn-save-update-close">
                      <Close className="close-btn" />
                      <p className="p-save-update-close">Cerrar</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    className="btn-close-modal"
                    id="btn-close-modal-filters"
                    data-bs-dismiss="modal"
                  ></button>
                </div>
              </div>
            </div>
          </div>

          {isLoading === false && (
            <div className="filters-left2">
              <div className="info-container subcategory-image-text">
                <img
                  src={
                    category.urlImagen ||
                    "https://yourfiles.cloud/uploads/98310f0d0f14ff456c3886d644d438b6/vacio.jpg"
                  }
                  onClick={() =>
                    Swal.fire({
                      title: category.nombre,
                      imageUrl: `${
                        category.urlImagen ||
                        "https://yourfiles.cloud/uploads/98310f0d0f14ff456c3886d644d438b6/vacio.jpg"
                      }`,
                      imageWidth: 600,
                      imageHeight: 200,
                      imageAlt: "Vista Categoría",
                      confirmButtonColor: "#6c757d",
                      confirmButtonText: "Cerrar",
                      focusConfirm: true,
                    })
                  }
                  className="list-img-category"
                  alt="Categoría"
                />
                <b className="bold">{category.nombre}</b>
              </div>

              {(subcategories.length > 0 ||
                (subcategories.length === 0 && hidden === true)) && (
                <div className="pagination-count-filter">
                  <button
                    className="btn btn-secondary btn-filters"
                    data-bs-toggle="modal"
                    data-bs-target="#modal-filters"
                  >
                    <div
                      className="filter-btn-title-container-2"
                      id="filter-btn-title-container"
                    >
                      <p className="filter-btn">
                        <Filter className="filter-svg2" />
                      </p>
                      <p className="filter-title2">Filtro</p>
                    </div>
                  </button>

                  <button
                    id="clear-filter"
                    className="clear-filter2"
                    onClick={ClearFilter}
                  >
                    <Close className="close-svg2" />
                    <p className="clear-filter-p">{filterName}</p>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* tabla de subcategorías */}
          {isLoading ? (
            <div className="loading-generaltable-div">
              <Loader />
              <p className="bold-loading">Cargando subcategorías...</p>
            </div>
          ) : (
            <table
              className="table table-dark table-bordered table-hover table-list"
              align="center"
            >
              <thead>
                <tr className="table-header">
                  <th className="table-title" scope="col">
                    #
                  </th>
                  <th className="table-title" scope="col">
                    Nombre
                  </th>
                  <th className="table-title" scope="col">
                    Oculta
                  </th>
                  <th className="table-title" scope="col">
                    Imagen
                  </th>
                  <th className="table-title" scope="col">
                    Acciones
                  </th>
                </tr>
              </thead>

              {subcategories.length > 0 ? (
                categoriesTable.map(function fn(category, index) {
                  return (
                    <tbody key={1 + category.idSubcategoria}>
                      <tr>
                        <th scope="row" className="table-name">
                          {index + 1}
                        </th>
                        <td className="table-name">{category.nombre}</td>

                        {category.ocultar ? (
                          <td className="table-name">
                            <div className="status-btns">
                              <div className="circulo-pendiente"></div>
                              <p className="status-name">Si</p>
                            </div>
                          </td>
                        ) : (
                          <td className="table-name">
                            <div className="status-btns">
                              <div className="circulo-verificado"></div>
                              <p className="status-name">No</p>
                            </div>
                          </td>
                        )}

                        <td className="table-name">
                          <img
                            src={
                              category.urlImagen ||
                              "https://yourfiles.cloud/uploads/98310f0d0f14ff456c3886d644d438b6/vacio.jpg"
                            }
                            onClick={() =>
                              Swal.fire({
                                title: category.nombre,
                                imageUrl: `${
                                  category.urlImagen ||
                                  "https://yourfiles.cloud/uploads/98310f0d0f14ff456c3886d644d438b6/vacio.jpg"
                                }`,
                                imageWidth: 600,
                                imageHeight: 200,
                                imageAlt: "Vista Subcategoría",
                                confirmButtonColor: "#6c757d",
                                confirmButtonText: "Cerrar",
                                focusConfirm: true,
                              })
                            }
                            className="list-img-category-manage"
                            alt="Subcategoría"
                          />
                        </td>

                        <td className="table-name">
                          <button
                            type="button"
                            className="btn btn-warning btn-edit"
                            aria-label="Modificar"
                            data-bs-toggle="modal"
                            data-bs-target="#modal"
                            onClick={() => {
                              RetrieveCategoryInputs(category);
                              setModalTitle("Actualizar Subcategoría");
                            }}
                          >
                            <Edit className="edit" />
                          </button>

                          <button
                            type="button"
                            className="btn btn-danger btn-delete"
                            aria-label="Eliminar"
                            onClick={() =>
                              Swal.fire({
                                title:
                                  "Esta seguro de que desea eliminar la siguiente subcategoría: " +
                                  category.nombre +
                                  "?",
                                text: "Una vez eliminada, no se podra recuperar",
                                icon: "warning",
                                showCancelButton: true,
                                confirmButtonColor: "#F8BB86",
                                cancelButtonColor: "#6c757d",
                                confirmButtonText: "Aceptar",
                                cancelButtonText: "Cancelar",
                                focusCancel: true,
                              }).then((result) => {
                                if (result.isConfirmed) {
                                  DeleteSubcategory(category.idSubcategoria);
                                }
                              })
                            }
                          >
                            <Delete className="delete" />
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  );
                })
              ) : (
                <tbody>
                  <tr className="tr-name1">
                    <td className="table-name table-name1" colSpan={13}>
                      Sin registros
                    </td>
                  </tr>
                </tbody>
              )}
            </table>
          )}

          <div className="pagination-count-container2">
            <div className="pagination-count">
              {subcategories.length > 0 ? (
                subcategories.length === 1 ? (
                  <p className="total">
                    Subcategoría {firstIndex + 1} de {subcategories.length}
                  </p>
                ) : (
                  <p className="total">
                    Subcategorías {firstIndex + 1} a{" "}
                    {categoriesTable.length + firstIndex} de{" "}
                    {subcategories.length}
                  </p>
                )
              ) : (
                <></>
              )}
            </div>

            {subcategories.length > 0 ? (
              <ul className="pagination-manager">
                <li className="page-item">
                  <div className="page-link" onClick={prePage}>
                    {"<"}
                  </div>
                </li>

                <li className="numbers">
                  {numbers.map((n, i) => {
                    if (n === currentPage) {
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
                      return (
                        <ul className="page-item-container" key={i}>
                          <li className="page-item" key={i}>
                            <div
                              className="page-link"
                              onClick={() => changeCPage(n)}
                            >
                              {n}
                            </div>
                          </li>
                        </ul>
                      );
                    } else if (
                      (n === currentPage - maxPageNumbersToShow - 1 &&
                        currentPage - maxPageNumbersToShow >
                          minPageNumbersToShow) ||
                      (n === currentPage + maxPageNumbersToShow + 1 &&
                        currentPage + maxPageNumbersToShow <
                          npage - minPageNumbersToShow)
                    ) {
                      return (
                        <ul className="page-item-container" key={i}>
                          <li className="page-item" key={i}>
                            <div className="page-link">...</div>
                          </li>
                        </ul>
                      );
                    } else {
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

            <div className="pagination-count"></div>
          </div>
        </div>
      </section>
    </div>
  );
  //#endregion
}

export default SubcategoryManager;
