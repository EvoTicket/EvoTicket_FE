import { Header } from "@/src/components/header";
import { RoleGuard } from "@/src/components/RoleGuard";

export default function userLayout({ children }: { children: React.ReactNode }) {
    return (
        <RoleGuard requireUser>
            <Header />
            <main>{children}</main>
        </RoleGuard>
    )
}