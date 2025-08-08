// pages/_app.js
import '../styles/globals.css'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer' // ⬅️ Si aún no existe, crea el componente o comenta esta línea

export default function MyApp({ Component, pageProps }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Cabecera fija */}
      <Navbar />

      {/*
        Main:
        - pt-24: deja hueco bajo el header fijo (≈96px). Si tu Navbar usa h-16 (~64px), pt-20 también sirve.
        - pb-16: respiración antes del footer.
        - Contenedor base consistente en TODA la app.
      */}
      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Component {...pageProps} />
        </div>
      </main>

      {/* Pie de página (opcional pero recomendado para identidad y navegación rápida) */}
      <Footer />
    </div>
  )
}
