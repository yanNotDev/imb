import Image from "next/image";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { QUESTIONS } from "../../portal/test";
import {
  SunIcon,
  MoonIcon,
  LoginIcon,
  LogoutIcon,
  UserCircleIcon,
} from "@heroicons/react/solid";

const Navbar = () => {
  const { data: session } = useSession();
  const { systemTheme, theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const renderThemeChanger = () => {
    if (!mounted) return null;

    const currentTheme = theme === "system" ? systemTheme : theme;

    if (currentTheme === "dark") {
      return (
        <button
          className="flex h-full w-full items-center justify-center text-gray-300 hover:text-red-600"
          role="button"
          onClick={() => setTheme("light")}
        >
          {/* <div className="rings-halo absolute z-50 h-full w-full bg-contain bg-center bg-no-repeat opacity-70"></div> */}
          <MoonIcon className="h-6 w-6" />
        </button>
      );
    } else {
      return (
        <button
          className="flex h-full w-full items-center justify-center  text-black hover:text-orange-600"
          role="button"
          onClick={() => setTheme("dark")}
        >
          {/* <div className="rings-halo absolute z-50 h-full w-full bg-contain bg-center bg-no-repeat opacity-70"></div> */}
          <SunIcon className="h-6 w-6" />
        </button>
      );
    }
  };

  const handleSignOut = async () => {
    // Clear all question-related localStorage items
    QUESTIONS.forEach(question => {
      localStorage.removeItem(`Q${question.id}`);
    });
    // Clear other localStorage items
    localStorage.removeItem("teamName");
    localStorage.removeItem("teamMembers");
    localStorage.removeItem("answers");
    await signOut({ callbackUrl: "/" });
  };

  return (
    <nav className="relative z-20 overflow-hidden border-b border-gray-200 bg-white font-general text-gray-900 shadow-sm duration-75 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100">
      <div className="z-5 pattern-opacity-30 pattern-dots absolute h-[100vh] w-[100vw] duration-150 pattern-bg-white pattern-gray-200 pattern-size-4 dark:pattern-gray-800 dark:pattern-bg-gray-900"></div>

      <div className="mx-auto flex max-w-7xl flex-row items-center justify-between px-4 py-3">
        <div className="relative z-20 flex flex-row items-center">
          <Link href="/" className="group">
            <Image
              src="/images/logo.png"
              alt="logo"
              className="mx-4 my-1 inline h-12 w-12 transform transition duration-300 group-hover:scale-110 md:my-0"
              height={400}
              width={400}
              priority
            />
          </Link>
          <h1 className="relative hidden select-none text-2xl font-extrabold tracking-tight duration-75 dark:text-white sm:inline lg:text-3xl 2xl:text-4xl">
            <span className="bg-gradient-to-r from-imb-yellow to-imb-blue bg-clip-text text-transparent">
              IMB Test Portal
            </span>
          </h1>
        </div>
        <div className="relative z-20 flex items-center gap-4">
          <div className="flex h-full items-center py-2 px-2 duration-75 dark:text-white">
            <span className="hidden select-none text-lg font-medium sm:inline">
              {session?.user?.name || "Not signed in"}
            </span>
            <div className="relative my-auto ml-3 inline h-10 w-10 overflow-hidden rounded-full border-2 border-imb-yellow duration-75 dark:border-imb-blue">
              {session?.user.image ? (
                <Image
                  src={session?.user.image}
                  alt="Profile Picture"
                  className="relative h-full w-full object-cover"
                  height={500}
                  width={500}
                />
              ) : (
                <UserCircleIcon className="relative h-full w-full text-imb-yellow duration-75 dark:text-imb-blue" />
              )}
              <div className="absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500 duration-75 dark:border-gray-900"></div>
            </div>
          </div>

          <button
            className="flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition duration-150 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            onClick={session ? () => void handleSignOut() : () => void signIn("discord")}
          >
            {session ? (
              <LogoutIcon className="h-5 w-5" />
            ) : (
              <LoginIcon className="h-5 w-5" />
            )}
          </button>

          <div className="relative flex items-center justify-center rounded-lg border border-gray-200 bg-white p-2 shadow-sm transition duration-150 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
            {renderThemeChanger()}
          </div>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
