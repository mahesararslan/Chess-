import { FaChessKing } from "react-icons/fa";


export const Button = ({ onClick, children }: { onClick: () => void, children: React.ReactNode }) => {
    return <button onClick={onClick} className="mx-5 shadow-lg px-8 py-4 max-w-full text-2xl bg-lime-700 hover:bg-lime-400 text-white font-bold rounded">
        <div className="flex gap-4 justify-center">
            <FaChessKing size={40} />
            {children}
        </div>
    </button>
}