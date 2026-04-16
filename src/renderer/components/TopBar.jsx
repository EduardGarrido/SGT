import { useEffect, useState } from "react";
//import logo from "../assets/logo.png"; // para el logo de la tienda, en su caso

function TopBar() {
  const [dateTime, setDateTime] = useState(new Date().toLocaleString());

  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date().toLocaleString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="w-full h-12 bg-gray-800 text-white px-5 flex items-center justify-between">
        <div className="flex-1 text-left">
            <span class="font-bold">Estado de caja: TEST</span>
        </div>
        <div className="flex-1 text-center">
            <span class="font-extrabold text-3xl">Abarrotes "La bamba"</span>
        </div>
        <div className="flex-1 text-right font-bold">{dateTime}</div>
    </header>
  );
}

export default TopBar;