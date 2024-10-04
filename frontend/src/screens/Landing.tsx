import { useNavigate } from "react-router-dom"
import { Button } from "../components/Button";
import { Appbar } from "../components/Appbar";

export const Landing = () => {
    const navigate = useNavigate();
    return <div className="flex flex-col items-center bg-stone-800 h-screen">
        <Appbar />
        <div className="pt-8 max-w-screen-lg">
            <div className="grid grid-cols-1 md:gap-10 md:grid-cols-2 ">
                <div className="p-5 flex justify-center bg-stone-800">
                    <img src={"/chessboard.png"} className="md:max-w-96 shadow-lg" />
                </div>
                <div className="md:pt-16">
                    <div className="flex justify-center">
                        <h1 className="text-4xl font-bold text-white">Play chess online!</h1>
                    </div>
                    <div className="mb-5 md:mb-0 mt-8 flex justify-center">
                        <Button onClick={() => {
                            navigate("/game")
                        }} >
                            Play Online
                        </Button>
                    </div>    
                </div>
            </div>
        </div>
    </div>

}