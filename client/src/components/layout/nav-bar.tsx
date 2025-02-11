import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import SearchBar from "./search-bar";

export default function NavBar() {
  const { user, logoutMutation } = useAuth();

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-[#FFA500]">
            AfriStay
          </Link>

          <div className="hidden md:block flex-1 mx-8">
            <SearchBar />
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-[#333333]">Welcome, {user.username}</span>
                <Button
                  variant="outline"
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                >
                  {logoutMutation.isPending ? "Logging out..." : "Logout"}
                </Button>
              </>
            ) : (
              <Link href="/auth">
                <Button>Login / Register</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}