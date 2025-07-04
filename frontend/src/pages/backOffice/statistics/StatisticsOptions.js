import { useEffect } from 'react'

import Swal from "sweetalert2";

import { useNavigate } from "react-router-dom"

import { Link } from 'react-router-dom';

import { Helmet } from 'react-helmet';

import { ReactComponent as Order } from "../../../assets/svgs/order.svg";
import { ReactComponent as Statistic } from "../../../assets/svgs/statistic.svg";
import { ReactComponent as Back } from "../../../assets/svgs/back.svg";

function StatisticsOptions() {
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      const expiracionEnSegundos = (JSON.parse(atob(token.split(".")[1]))).exp;
      const expiracionEnMilisegundos = expiracionEnSegundos * 1000;
      const fechaExpiracion = new Date(expiracionEnMilisegundos);
      const fechaActual = new Date();

      if (fechaExpiracion <= fechaActual) {
        localStorage.removeItem('token');
        navigate('/login');
      }

      const temporizador = setInterval(() => {
        const token = localStorage.getItem("token");
        if (!token) {
          clearInterval(temporizador);
          return;
        }

        const expiracionEnSegundos = (JSON.parse(atob(token.split(".")[1]))).exp;
        const expiracionEnMilisegundos = expiracionEnSegundos * 1000;
        const fechaExpiracion = new Date(expiracionEnMilisegundos);
        const fechaActual = new Date();

        if (fechaExpiracion <= fechaActual) {
          localStorage.removeItem('token');
          Swal.fire({
            icon: 'warning',
            title: 'Tu sesión ha expirado',
            text: "Te estamos redirigiendo a la página de autenticación...",
            timer: 4500,
            timerProgressBar: true,
            showConfirmButton: false
          })
          navigate('/login');
        }
      }, 3 * 60 * 60 * 1000); // 3 horas

      return () => {
        clearInterval(temporizador);
      };
    }
  }, [navigate]);

  return (
    <div>
      <Helmet>
        <title>La Gran Feria | Opciones para pedidos</title>
      </Helmet>
      <section className='general-container'>
        <div className="general-content">
          <div className='wel-out'>
            <h2 className='error welc-title'>Estadísticas de pedidos</h2>

            <Link to="/panel" className="btn-logout" aria-label='Logout'>
              <Back className="logout" />
            </Link>
          </div>

          <h2 className="title-error">Cliqué en la sección que desee analizar</h2>

          <div className='secciones'>
            <div className='seccion-dividida2'>


              <Link to="/reportes-pedidos" className='btn btn-dark category-btn'>
                <Order className='category-svg' />
                <p className='category-title'>Reportes</p>
              </Link>

              <Link to="/graficos-pedidos" className='btn btn-dark category-btn'>
                <Statistic className='category-svg' />
                <p className='category-title'>Gráficos</p>
              </Link>


            </div>

          </div>

        </div>
      </section>
    </div>
  )
}

export default StatisticsOptions