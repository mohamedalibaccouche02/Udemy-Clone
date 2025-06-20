"use client"
import { UserButton } from "@clerk/nextjs"
import { usePathname} from "next/navigation"
import { LogOut } from "lucide-react"
import Link from "next/link"
import { Button } from "./ui/button"
export const NavbarRoutes = () => {
    const pathname = usePathname()
    const isTeacher=pathname?.startsWith("/teacher")
    const isPlayer=pathname?.includes("/chapter")
    return(
    <div className="flex gap-x-2 ml-auto">
        {isTeacher || isPlayer ? (
            <Link href="/"> 
            <Button size={"sm"} variant="ghost">
                <LogOut className="h-4 w-4 mr-2" />
                Exit
            </Button>
            </Link>
        ) : (
            <Link href="/teacher/courses">
                <Button size={"sm"} variant="ghost">
                    Teacher Mode
                </Button>
            </Link>
        )}
        <UserButton 
        afterSignOutUrl="/"/>
    </div>
)}