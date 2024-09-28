import { Link } from "react-router-dom"

export const Appbar = () => {

    return <div>
        <div className="bg-stone-700 h-16 flex justify-between items-center w-screen">
            <div className="ml-8">
                <img src="/chess-logo.png" width={150} alt="" />
            </div>
            <div className="mr-8 flex gap-2">
                <Link to={"/signup"}><button className="text-white font-bold py-2 px-3 bg-lime-700 rounded-md hover:bg-lime-500">Signup</button></Link>
                <Link to={"/signin"}><button className="text-white font-bold py-2 px-3 bg-stone-700 rounded-lg hover:bg-stone-800">Login</button></Link>
            </div>
        </div>
    </div>
}