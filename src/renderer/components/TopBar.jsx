import { useEffect, useState } from 'react'
//import logo from "../assets/logo.png"; // para el logo de la tienda, en su caso

export default function TopBar() {
  const [dateTime, setDateTime] = useState(new Date().toLocaleString())

  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date().toLocaleString())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-22 md:h-12 bg-gray-800 text-white px-5 flex items-center justify-between">
        <div className="text-left w-fit">
          <span className="font-bold w-full">Estado de caja: TEST</span>
        </div>
        <div className="text-center w-auto">
          <span className="font-extrabold text-3xl">Abarrotes "La bamba"</span>
        </div>
        <div className="text-right font-bold w-fit">{dateTime}</div>
      </header>
      <div className="h-22 lg:h-12 shrink-0" />
    </>
  )
}
