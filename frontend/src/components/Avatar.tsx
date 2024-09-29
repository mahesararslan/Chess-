
export function Avatar({ name,size="small" } : { name: string, size?:"big" | "small" }) {

    return <div  className={`relative cursor-pointer inline-flex items-center justify-center overflow-hidden bg-lime-800 hover:bg-lime-600 hover:text-lg rounded-full ${size === "small" ? "h-6 w-6" : "h-12 w-12" }`}>
        <span className={`${size === "small" ? "text-xs" : "text-md font-semibold"} text-white `}>{name[0].toUpperCase()}</span>
    </div>
    
}