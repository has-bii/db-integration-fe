import Navbar from "./Navbar";

export default function Layout({ children }) {
  return (
    <div className="flex flex-col w-screen h-screen">
      <Navbar />
      <div className="w-full py-10 h-full overflow-y-auto">
        <div className="container mx-auto">{children}</div>
      </div>
    </div>
  );
}
