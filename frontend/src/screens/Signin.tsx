import SigninForm from "../components/SigninForm";

export const Signin = () => {
  return (
    <div
      style={{ backgroundImage: "url('/chessboard.jpeg')" }}
      className="relative bg-cover bg-center bg-no-repeat flex justify-center items-center h-screen"
    >
      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-60"></div>
      
      {/* Signin form container */}
      <div className="w-80 relative z-10 bg-stone-800 bg-opacity-90 rounded-lg shadow-lg">
        <SigninForm />
      </div>
    </div>
  );
};
