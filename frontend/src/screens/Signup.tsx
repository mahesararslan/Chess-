import SignupForm from "../components/SignupForm";


export const Signup = () => {
  return (
    <div
      style={{ backgroundImage: "url('/chessboard.jpeg')" }}
      className="relative bg-cover bg-center bg-no-repeat flex justify-center items-center h-screen md:h-auto"
    >
      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-60"></div>
      
      {/* Signin form container */}
      <div className="w-80 relative z-10 bg-stone-800 bg-opacity-90 rounded-lg shadow-lg">
        <SignupForm />
      </div>
    </div>
  );
};
