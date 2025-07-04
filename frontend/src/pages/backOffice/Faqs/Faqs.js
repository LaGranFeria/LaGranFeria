import React, { useState } from "react";
import { Helmet } from "react-helmet";
import "./Faqs.css";
import { Link } from "react-router-dom";
import { ReactComponent as Back } from "../../../assets/svgs/back.svg";

import Candado from "../../../assets/images/candado.png";
import ActualizarContraseña from "../../../assets/images/actualizarContraseña.png";
import Excel from "../../../assets/images/excel.png";
import WhatsApp from "../../../assets/images/pedidoWhatsapp.png";
import Pedidos from "../../../assets/images/pedidos.png";
import Categorias from "../../../assets/images/categorias.png";
import Dolar from "../../../assets/images/dolar.png";
import Productos from "../../../assets/images/productos.png";
import Envio from "../../../assets/images/envio.png";
import Abonos from "../../../assets/images/abonos.png";
import Usuarios from "../../../assets/images/usuarios.png";
import Estadisticas from "../../../assets/images/estadisticas.png";
import Buscador from "../../../assets/images/buscadorPedido.png";
import BuscadorConPedido from "../../../assets/images/buscadorPedidoEspecifico.png";
import PedidoVerificado from "../../../assets/images/pedidoVerificado.png";
import Login from "../../../assets/images/login.png";
import Email from "../../../assets/images/recuperar.png";
import Codigo from "../../../assets/images/codigo.png";
import Contraseña from "../../../assets/images/contraseña.png";

function Faqs() {
  const [expanded, setExpanded] = useState(Array(5).fill(false)); // Inicialmente, ninguna pregunta está expandida

  // Función para manejar el clic en el botón de cada pregunta
  const toggleExpansion = (index) => {
    setExpanded((prevExpanded) => {
      const newExpanded = [...prevExpanded];
      newExpanded[index] = !newExpanded[index]; // Cambiar el estado de la pregunta
      return newExpanded;
    });
  };

  return (
    <div>
      <Helmet>
        <title>La Gran Feria | Preguntas frecuentes</title>
      </Helmet>
      <section className="general-container">
        <div className="general-content">
          <div className="title-header mb">
            <Link to="/panel" className="btn btn-info btn-back">
              <div className="btn-back-content">
                <Back className="back" />
                <p className="p-back">Regresar</p>
              </div>
            </Link>

            <h2 className="title title-general">Preguntas frecuentes</h2>
          </div>
          <div className="faqs-content">
            <div className="one-faq">
              <div className="question-container">
                <h3 className="question">
                  ¿A qué dirección de correo electrónico me puedo contactar para
                  hacer una sugerencia o reclamo?
                </h3>
                <button
                  className="toggle-button"
                  onClick={() => toggleExpansion(0)}
                >
                  {expanded[0] ? "-" : "+"}
                </button>
              </div>
              {expanded[0] && (
                <p className="answer">
                  Puedes contactarnos a través de la dirección de correo
                  electrónico{" "}
                  <a href="mailto:matias.lokman@gmail.com" className="ref">
                    matias.lokman@gmail.com
                  </a>{" "}
                  para hacer cualquier sugerencia o reclamo relacionado con
                  nuestros servicios.
                </p>
              )}
            </div>

            <div className="one-faq">
              <div className="question-container">
                <h3 className="question">¿Cómo funciona WhatsCart?</h3>
                <button
                  className="toggle-button"
                  onClick={() => toggleExpansion(1)}
                >
                  {expanded[1] ? "-" : "+"}
                </button>
              </div>
              {expanded[1] && (
                <div className="answer">
                  <p>
                    WhatsCart es una plataforma diseñada para facilitar la
                    gestión de tu negocio al permitir que tus clientes generen
                    pedidos y que tú puedas administrarlos de manera más
                    sencilla. Para comenzar a utilizar WhatsCart de manera
                    efectiva, es recomendable seguir estos pasos:
                  </p>
                  <ol className="order-list">
                    <li>
                      <span className="ref-nohover">Crear Categorías</span>:
                      Establece categorías que luego se asociarán a productos
                      específicos. Esto ayuda a organizar tu inventario de
                      manera estructurada. Además, puedes crear subcategorías
                      dentro de cada categoría principal, permitiendo segmentar
                      los productos de forma más específica y detallada.
                    </li>
                    <img
                      className="img"
                      width={150}
                      src={Categorias}
                      alt="Gestion de categorias"
                    />
                    <li>
                      <span className="ref-nohover">
                        Establecer Cotización de Moneda Extranjera
                      </span>
                      : Si planeas listar productos con costos en dólares, es
                      importante establecer una cotización actualizada para
                      garantizar una precisión en los precios.
                    </li>
                    <img
                      className="img"
                      width={150}
                      src={Dolar}
                      alt="Gestion de moneda extranjera"
                    />
                    <li>
                      <span className="ref-nohover">Listar Productos</span>:
                      Agrega tus productos al sistema junto con su stock y
                      costos en pesos o en moneda extranjera. Esto facilita la
                      visualización y gestión de tu catálogo.
                    </li>
                    <img
                      className="img"
                      width={150}
                      src={Productos}
                      alt="Gestion de productos"
                    />
                    <li>
                      <span className="ref-nohover">
                        Crea y modifica distintas formas de entrega
                      </span>
                      : Especifica los costos y aclara los detalles de cada
                      forma de entrega. Si alguna opción tiene costo, este se
                      reflejará claramente en el total de los pedidos de tus
                      clientes.
                    </li>
                    <img
                      className="img"
                      width={150}
                      src={Envio}
                      alt="Gestion de envios"
                    />

                    <li>
                      <span className="ref-nohover">Crear Medios de Pago</span>:
                      Establece los medios de pago que los futuros clientes
                      podrán seleccionar durante el proceso de compra. Esta
                      configuración te permite ofrecer una variedad de opciones
                      de pago, incluyendo la posibilidad de crear nuevos medios
                      según sea necesario.
                    </li>
                    <img
                      className="img"
                      width={150}
                      src={Abonos}
                      alt="Gestion de medios de pago"
                    />

                    <li>
                      <span className="ref-nohover">
                        Crear Usuarios de tipo Vendedor
                      </span>
                      : Si deseas que tus clientes puedan elegir quién les
                      vendió, puedes crear usuarios de tipo vendedor. Además,
                      WhatsCart te permite crear más usuarios internos con
                      distintos roles y niveles de acceso según tus necesidades.
                    </li>
                    <img
                      className="img"
                      width={150}
                      src={Usuarios}
                      alt="Gestion de usuarios"
                    />

                    <li>
                      <span className="ref-nohover">Gestión de Pedidos</span>:
                      Cuando un cliente genera un pedido, WhatsCart actualiza
                      automáticamente el stock de los productos ordenados y
                      registra los detalles del pedido en la sección
                      correspondiente. Desde allí, puedes confirmar, cancelar o
                      eliminar pedidos según sea necesario.
                    </li>
                    <img
                      className="img"
                      width={150}
                      src={Pedidos}
                      alt="Gestion de pedidos"
                    />
                    <li>
                      <span className="ref-nohover">
                        Obtener Gráficos y Reportes
                      </span>
                      : WhatsCart ofrece la posibilidad de obtener estadísticas
                      detalladas de los pedidos en forma de reportes o gráficos,
                      lo que te permite analizar distintas variables y tomar
                      decisiones estrategicas e informadas para optimizar tu
                      negocio.
                    </li>
                    <img
                      className="img"
                      width={350}
                      src={Estadisticas}
                      alt="Gestion de estaditicas"
                    />
                  </ol>
                </div>
              )}
            </div>

            <div className="one-faq">
              <div className="question-container">
                <h3 className="question">
                  ¿Qué debo hacer si olvido mi contraseña para acceder al panel?
                </h3>
                <button
                  className="toggle-button"
                  onClick={() => toggleExpansion(2)}
                >
                  {expanded[2] ? "-" : "+"}
                </button>
              </div>
              {expanded[2] && (
                <div className="answer">
                  <p>
                    Para recuperar la contraseña en caso de olvidarla, sigue
                    estos pasos:
                  </p>
                  <ol className="order-list">
                    <li>
                      Ve a la página de inicio de sesión y haz clic en "¿Has
                      olvidado la contraseña?" en la parte inferior izquierda.
                    </li>
                    <img className="img" width={250} src={Login} alt="Login" />
                    <li>
                      Ingresa tu correo electrónico o usuario de tu cuenta y haz
                      clic en el botón "Buscar" para recibir un código de
                      verificación por correo electrónico.
                    </li>
                    <img className="img" width={300} src={Email} alt="Email" />
                    <li>
                      Introduce el código de 6 dígitos enviado a tu correo
                      electrónico. Si no lo recibes después de un minuto, puedes
                      hacer clic en "Reenviar código" para solicitar otro.
                    </li>
                    <img
                      className="img"
                      width={350}
                      src={Codigo}
                      alt="Codigo"
                    />
                    <li>
                      Si el código es válido, se te pedirá que ingreses tu nueva
                      contraseña y la repitas para verificar que la has
                      ingresado correctamente. La contraseña debe tener al menos
                      6 caracteres y no puede ser igual a la anterior.
                    </li>
                    <img
                      className="img"
                      width={350}
                      src={Contraseña}
                      alt="Contraseña"
                    />
                    <li>
                      Una vez que hayas cambiado la contraseña con éxito, serás
                      redirigido nuevamente a la página de inicio de sesión para
                      ingresar con tu nueva contraseña.
                    </li>
                  </ol>
                </div>
              )}
            </div>

            <div className="one-faq">
              <div className="question-container">
                <h3 className="question">
                  ¿Cómo puedo modificar mi contraseña desde el panel?
                </h3>
                <button
                  className="toggle-button"
                  onClick={() => toggleExpansion(3)}
                >
                  {expanded[3] ? "-" : "+"}
                </button>
              </div>
              {expanded[3] && (
                <div className="answer">
                  <p>
                    Puedes modificar tu contraseña en el panel siguiendo los
                    siguientes pasos:
                  </p>
                  <ol className="order-list">
                    <li>
                      Ingresa al{" "}
                      <Link to="/panel" className="ref">
                        panel
                      </Link>{" "}
                      utilizando tu usuario/email y contraseña actuales.
                    </li>
                    <li>
                      En la parte superior derecha, encontrarás un botón con un
                      candado. Haz clic en este botón para abrir un modal de
                      cambio de contraseña.
                    </li>
                    <img
                      className="img"
                      width={60}
                      src={Candado}
                      alt="Cambiar contraseña"
                    />
                    <li>
                      En el modal, se te solicitará ingresar tu nueva contraseña
                      y repetirla para verificar que la has ingresado
                      correctamente. Recuerda que la contraseña debe tener al
                      menos 6 caracteres y no puede ser igual a la anterior.
                    </li>
                    <img
                      className="img"
                      width={300}
                      src={ActualizarContraseña}
                      alt="Actualizar contraseña"
                    />
                    <li>
                      Una vez que hayas ingresado y verificado tu nueva
                      contraseña, haz clic en el botón 'Actualizar' para
                      modificar la contraseña de manera permanente en el
                      sistema.
                    </li>
                  </ol>
                </div>
              )}
            </div>

            <div className="one-faq">
              <div className="question-container">
                <h3 className="question">
                  ¿Tienes alguna duda o quieres comunicarte con nosotros?
                </h3>
                <button
                  className="toggle-button"
                  onClick={() => toggleExpansion(4)}
                >
                  {expanded[4] ? "-" : "+"}
                </button>
              </div>
              {expanded[4] && (
                <p className="answer">
                  Si tienes alguna duda o quieres comunicarte con nosotros,
                  puedes hacerlo a través de{" "}
                  <a
                    href="https://wa.me/5493517476389"
                    target="_blank"
                    rel="noreferrer"
                    className="ref-wpp"
                  >
                    WhatsApp
                  </a>
                  . Envíanos un mensaje o llama al{" "}
                  <a href="tel:+5493517476389" className="ref">
                    +54 9 351 747 6389
                  </a>{" "}
                  y te responderemos lo antes posible.
                </p>
              )}
            </div>

            <div className="one-faq">
              <div className="question-container">
                <h3 className="question">
                  ¿Es posible exportar datos a Excel desde los gestores de
                  WhatsCart?
                </h3>
                <button
                  className="toggle-button"
                  onClick={() => toggleExpansion(5)}
                >
                  {expanded[5] ? "-" : "+"}
                </button>
              </div>
              {expanded[5] && (
                <div className="answer">
                  <p>
                    Únicamente se pueden exportar datos a Excel en las gestiones
                    de productos, detalles de stock, pedidos y reportes. Para
                    hacerlo, haz clic en el botón verde que dice "Descargar" en
                    la parte superior derecha.
                  </p>
                  <img
                    className="img"
                    width={160}
                    src={Excel}
                    alt="Descargar Excel"
                  />
                </div>
              )}
            </div>

            <div className="one-faq">
              <div className="question-container">
                <h3 className="question">
                  ¿Cuál es el proceso para verificar la validez de un pedido
                  recibido por WhatsApp en WhatsCart?
                </h3>
                <button
                  className="toggle-button"
                  onClick={() => toggleExpansion(6)}
                >
                  {expanded[6] ? "-" : "+"}
                </button>
              </div>
              {expanded[6] && (
                <div className="answer">
                  <p>
                    En la parte inferior del pedido recibido por WhatsApp,
                    aparecerá un número de pedido con diversos caracteres. Para
                    verificar la validez del pedido, sigue los siguientes pasos:
                  </p>
                  <ol className="order-list">
                    <li>Copia el número de pedido del mensaje de WhatsApp.</li>
                    <img
                      className="img"
                      width={300}
                      src={WhatsApp}
                      alt="Pedido WhatsApp"
                    />
                    <li>
                      Ve a la sección de gestión de pedidos en el panel de
                      WhatsCart.
                    </li>
                    <img
                      className="img"
                      width={150}
                      src={Pedidos}
                      alt="Gestion de pedidos"
                    />
                    <li>
                      En la parte superior izquierda de la sección de gestión de
                      pedidos, encontrarás un buscador.
                    </li>
                    <img
                      className="img"
                      width={150}
                      src={Buscador}
                      alt="Buscador"
                    />
                    <li>
                      Pega el número de pedido copiado en el buscador y presiona
                      el botón.
                    </li>
                    <img
                      className="img"
                      width={150}
                      src={BuscadorConPedido}
                      alt="Buscador con pedido"
                    />
                    <li>
                      Compara los datos del pedido en WhatsApp con los datos
                      registrados en la base de datos.
                    </li>
                    <img
                      id="pedido-verificado"
                      className="img"
                      width={900}
                      src={PedidoVerificado}
                      alt="Pedido verificado"
                    />
                  </ol>
                  <p className="disclaimer">
                    *Es importante notar que el número de pedido registrado en
                    la base de datos no puede ser modificado por el usuario,
                    mientras que el mensaje de WhatsApp sí puede ser editado.
                    Esta verificación asegura que los datos correspondan
                    correctamente y no hayan sido alterados.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Faqs;
