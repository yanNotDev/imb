"use client"; // Error components must be Client components
import { ArrowSmRightIcon, EyeOffIcon } from "@heroicons/react/solid";
import Link from "next/link";
import Image from "next/image";
import Navbar from "./components/navbar";
import Head from "next/head";

export default function Error() {
  return (
    <>
      <Head>
        <title>Error 404</title>
      </Head>
      <main className="min-h-[100vh] overflow-hidden bg-white font-general duration-150 dark:bg-gray-900">
        <Navbar />
        <div className="relative z-10 flex h-[calc(100vh-3.58rem)] w-full flex-col items-center justify-center px-4">
          <div className="z-5 pattern-opacity-30 pattern-cross absolute h-[100vh] w-[100vw] duration-150 pattern-bg-white pattern-gray-200 pattern-size-8 dark:pattern-gray-800 dark:pattern-bg-gray-900"></div>
          <div className="relative z-10 max-w-4xl text-center">
            <EyeOffIcon className="mx-auto mb-6 h-16 w-16 rounded-2xl bg-gradient-to-r from-imb-yellow to-imb-blue p-2 text-white drop-shadow-lg" />
            <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
              <span className="inline-block bg-gradient-to-r from-imb-yellow to-imb-blue bg-clip-text px-3 py-1 text-transparent">
                Page Not Found
              </span>
            </h1>
            <p className="mb-8 text-lg text-gray-600 dark:text-gray-400 sm:text-xl">
              Sorry about that! Please return to the portal.
            </p>
            <Link href="/">
              <button className="group relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-r from-imb-yellow to-imb-blue p-[2px] text-lg font-semibold text-white transition duration-300 hover:shadow-lg hover:shadow-imb-yellow/20 focus:outline-none focus:ring-2 focus:ring-imb-yellow/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900">
                <span className="relative flex items-center rounded-lg bg-white px-8 py-3 text-gray-900 transition duration-300 group-hover:bg-transparent group-hover:text-white dark:bg-gray-900 dark:text-white">
                  Back to home <ArrowSmRightIcon className="ml-2 h-5 w-5" />
                </span>
              </button>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
