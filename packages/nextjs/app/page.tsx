"use client";

import Link from "next/link";
import type { NextPage } from "next";
// import { useAccount } from "wagmi";
import { AcademicCapIcon, BookOpenIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

// import { Address } from "~~/components/scaffold-eth";

const Home: NextPage = () => {
  // const { address: connectedAddress } = useAccount();

  return (
    <>
      <div className="flex items-center flex-col flex-grow mt-16">
        {" "}
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-2xl mb-4">Welcome to</span>
            <span className="block text-4xl font-bold mb-14">POAPademy</span>
          </h1>
        </div>
        <div className="flex-grow bg-base-300 w-full px-8 py-1 pt-20">
          {" "}
          <div className="flex justify-center items-center gap-24 flex-col md:flex-row">
            {" "}
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <BookOpenIcon className="h-8 w-8 fill-secondary mb-4" />
              <p>
                Add a new course & quiz using the{" "}
                <Link href="/add-courses" passHref className="link">
                  Add Courses
                </Link>{" "}
                tab.
              </p>
            </div>
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <AcademicCapIcon className="h-8 w-8 fill-secondary mb-4" />
              <p>
                See all the available courses using the{" "}
                <Link href="/courses" passHref className="link">
                  Courses
                </Link>{" "}
                tab.
              </p>
            </div>
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <MagnifyingGlassIcon className="h-8 w-8 fill-secondary mb-4" />
              <p>
                Explore your POAP collection using the{" "}
                <Link href="/poaps" passHref className="link">
                  My Poaps
                </Link>{" "}
                tab.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
