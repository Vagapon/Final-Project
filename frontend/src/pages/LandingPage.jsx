import Spline from "@splinetool/react-spline";

export default function LandingPage() {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* 3D Scene */}
    <Spline scene="https://prod.spline.design/rcMwBuZr9XyT1WND/scene.splinecode" />
  

      {/* UI Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none mt-24">
        {/* <img
          src="/bot.png" // bạn có thể dùng ảnh robot ở giữa
          alt="robot"
          className="w-24 h-24 mb-4 pointer-events-auto"
        /> */}
        {/* <h2 className="text-2xl font-semibold">Hey GreatStack! 👋</h2>
        <h1 className="text-4xl font-bold mb-2">Welcome to our app</h1>
        <p className="text-gray-600 max-w-md mb-6">
          Let's start with a quick product tour and we will have you up and running in no time!
        </p> */}
        <button className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-semibold pointer-events-auto hover:bg-indigo-700">
          Get Started
        </button>
      </div>

      {/* Avatar menu ở góc phải trên */}
      <div className="absolute top-4 right-4 pointer-events-auto">
        <div className="relative group">
          <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center cursor-pointer">
            G
          </div>
          <div className="absolute right-0 mt-2 bg-white shadow-lg rounded text-sm w-32 hidden group-hover:block z-50">
            <button className="block w-full px-4 py-2 hover:bg-gray-100 text-left">Verify email</button>
            <button className="block w-full px-4 py-2 hover:bg-gray-100 text-left">Logout</button>
          </div>
        </div>
      </div>
    </div>
  );
}
