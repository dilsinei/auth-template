import logo from "../../assets/images/dlt_systems_logo.svg";

export default function HeaderBlur() {
    return (
        <header
            className="w-full py-3 fixed top-0 left-0 z-50
            bg-white/30 backdrop-blur-xl border-b border-white/20 shadow-lg"
        >
            <div className="container mx-auto px-4 flex items-center justify-center">
                {/* LOGO CENTRALIZADO */}
                <div className="flex flex-col items-center">
                    <img src={logo} alt="DLT Systems" className="h-10 drop-shadow" />
                    <p className="text-[11px] text-gray-700/80 font-light tracking-wide">Soluções em Tecnologia</p>
                </div>
            </div>
        </header>
    );
}
