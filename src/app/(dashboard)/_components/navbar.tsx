import NavbarRoutes from "src/components/navbar-routes"
import { MobieleSideBar } from "./mobilesidebar"

export const Navbar = () => {
    return (
        <div className="p-4 border-b h-full bg-white shadow-sm flex items-center " >
        <MobieleSideBar />
        <NavbarRoutes />
         </div>
    )
}