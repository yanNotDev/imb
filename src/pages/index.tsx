import { type NextPage } from "next";
import Image from "next/image";
import { signIn, useSession } from "next-auth/react";
import Navbar from "./components/navbar";
import TestPortal from "../portal/portal";
import { CursorClickIcon } from "@heroicons/react/solid";
import Head from "next/head";

const Home: NextPage = () => {
  const { data: session } = useSession();

  return (
    <>
      <Head>
        <title>IMB Test Portal</title>
      </Head>
      <main className="min-h-[100vh] overflow-hidden bg-white font-general duration-150 dark:bg-gray-900">
        <Navbar />
        {!session?.user ? (
          <div className="relative z-10 flex h-[calc(100vh-3.58rem)] w-full flex-col items-center justify-center px-4">
            <div className="z-5 pattern-opacity-30 pattern-cross absolute h-[100vh] w-[100vw] duration-150 pattern-bg-white pattern-gray-200 pattern-size-8 dark:pattern-gray-800 dark:pattern-bg-gray-900"></div>
            <div className="relative z-10 max-w-4xl text-center">
              <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Welcome to{" "}
                <span className="inline-block bg-gradient-to-r from-imb-yellow to-imb-blue bg-clip-text px-3 py-1 text-transparent">
                  IMB 2025
              </span>
              </h1>
              <p className="mb-8 text-lg text-gray-600 dark:text-gray-400 sm:text-xl">
                Join the International Math Bowl and showcase your mathematical prowess in this exciting competition!
              </p>
            <button
                onClick={() => void signIn("discord")}
                className="group relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-r from-imb-yellow to-imb-blue p-[2px] text-lg font-semibold text-white transition duration-300 hover:shadow-lg hover:shadow-imb-yellow/20 focus:outline-none focus:ring-2 focus:ring-imb-yellow/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            >
                <span className="relative flex items-center rounded-lg bg-white px-8 py-3 text-gray-900 transition duration-300 group-hover:bg-transparent group-hover:text-white dark:bg-gray-900 dark:text-white">
                  <CursorClickIcon className="mr-2 h-6 w-6" /> Sign in with Discord
                </span>
            </button>
            </div>
          </div>
        ) : (
          <TestPortal />
        )}
      </main>
    </>
  );
};

export default Home;
