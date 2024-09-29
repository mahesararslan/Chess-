import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form"
import axios from "axios";
import { z } from "zod";
import { signinSchema } from "../zodTypes";
import { Link, useNavigate } from "react-router-dom";
import GoogleButton from "./GoogleButton";




type FormFields = z.infer<typeof signinSchema>;

const SigninForm = () => {
    const navigate = useNavigate();

    const { register, handleSubmit, setError, formState:{errors, isSubmitting} } = useForm<FormFields>({
        resolver: zodResolver(signinSchema)
    });

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            const response: any = await axios.post(`${import.meta.env.VITE_NODE_BACKEND_URL}/signin`, data);
            
            if(response.data.token) {
                localStorage.setItem("token", response.data.token);
                navigate("/home");
            }
        }
        catch (error) {
            setError("root", {
                type: "manual",
                message: "Invalid username or password!"
            });
        }
    }

    return <form className="bg-stone-800 px-10 pb-10 rounded-lg text-white shadow-lg space-y-4 md:space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex justify-center">
            <img src="/chess-logo.png" width={150} alt="" />
        </div>
        <div>
            <label className="block mb-2 text-sm font-medium text-white" htmlFor="username">Userame</label>
            <input {...register("username")} type="text" placeholder="name@gmail.com" className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-stone-600" />
            {errors.username && <span className="text-red-500 font-bold text-sm">{errors.username.message}</span>}
        </div>
        <div>
            <label className="block mb-2 text-sm font-medium text-white" htmlFor="password">Password</label>
            <input {...register("password")} type="password" placeholder="******" className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-stone-600" />
            {errors.password && <span className="text-red-500 font-bold text-sm">{errors.password.message}</span>}
        </div>
        <button disabled={isSubmitting} type="submit" className="w-full text-white bg-stone-900 hover:ring-4 focus:outline-none hover:ring-zinc-900 rounded-lg text-md font-bold px-5 py-3 text-center">
            {isSubmitting ? "Signin in..." : "Sign in"}
        </button>
        <GoogleButton label={"Sign in with Google"} onClick={() => {
            console.log("Google Signin clicked");
        }} />
        <Link to={"/signup"}>
            <p className="underline mt-5 text-center" >Don't have an Account?</p>
        </Link>
        {errors.root && <span className="text-red-500 font-bold text-sm">{errors.root.message}</span>}
    </form>
}

export default SigninForm;