

import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import GoogleButton from "./GoogleButton";
import { signupSchema } from "../zodTypes";
import axios from "axios";

type FormFields = z.infer<typeof signupSchema>;

const SignupForm = () => {
    const navigate = useNavigate();

    const { register, handleSubmit, setError, formState:{errors, isSubmitting} } = useForm<FormFields>({
        resolver: zodResolver(signupSchema)
    });

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            
            const response: any = await axios.post(`${import.meta.env.VITE_NODE_BACKEND_URL}/signup`, data);

            if(response.data.token) {
                localStorage.setItem("token", response.data.token);
                navigate("/");
            }
        }
        catch (error) {
            setError("root", {
                type: "manual",
                message: "Signup Failed, Please try again!"
            });
        }
    }

    return <form className="bg-stone-800 px-10 pb-10 rounded-lg text-white shadow-lg space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex justify-center">
            <img src="/chess-logo.png" width={150} alt="" />
        </div>
        <div>
            <label className="block mb-2 text-sm font-medium text-white" htmlFor="username">Name</label>
            <input {...register("name")} type="text" placeholder="Arslan" className="bg-gray-50 border border-gray-300 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-stone-600" />
            {errors.name && <span className="text-red-500 font-bold text-sm">{errors.name.message}</span>}
        </div>
        <div>
            <label className="block mb-2 text-sm font-medium text-white" htmlFor="username">Username</label>
            <input {...register("username")} type="text" placeholder="arslan@gmail.com" className="bg-gray-50 border border-gray-300 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-stone-600" />
            {errors.username && <span className="text-red-500 font-bold text-sm">{errors.username.message}</span>}
        </div>
        <div>
            <label className="block mb-2 text-sm font-medium text-white" htmlFor="password">Password</label>
            <input {...register("password")} type="password" placeholder="******" className="bg-gray-50 border border-gray-300 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-stone-600" />
            {errors.password && <span className="text-red-500 font-bold text-sm">{errors.password.message}</span>}
        </div>
        <button disabled={isSubmitting} type="submit" className="w-full font-bold text-white bg-stone-900 hover:ring-4 focus:outline-none hover:ring-zinc-900 text-md rounded-lg px-5 py-3 text-center">
            {isSubmitting ? "Signing up..." : "Sign up"}
        </button>
        <GoogleButton label={"Sign up with Google"} onClick={(event: any) => {
            event.preventDefault();
            window.location.href = `${import.meta.env.VITE_NODE_BACKEND_URL}/auth/google`;
        }} />
        <Link to={"/signin"}>
            <p className="underline mt-5 text-center" >Already have an Account?</p>
        </Link>
        {errors.root && <span className="text-red-500 font-bold text-sm">{errors.root.message}</span>}
    </form>
}

export default SignupForm;