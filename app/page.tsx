"use client";
import { signInAction } from "@/actions/auth-action";
import { Button } from "@/components/ui/button";
import todovexLogo from "@/public/logo/todovex.svg";
import clsx from "clsx";
import { Loader, StepForward } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { HeroGeometric } from "@/components/ui/shape-landing-hero";
import { GlowEffectButton } from "@/components/ui/glowing-button";

import { useFormStatus } from "react-dom";

export default function LoginForm() {
  return (
    // <main className=" h-full min-h-screen">
    //   <div className="container relative m-0 mx-auto py-10 md:px-10">
    //     <div className="max-width flex items-center justify-center lg:justify-between">
    //       <Link className="flex items-center gap-1" href="/loggedin">
    //         <h1 className="text-xl hidden lg:flex font-medium text-gray-950 md:text-3xl">
    //           Todo-AI
    //         </h1>
    //       </Link>
    //       <div className="hidden lg:flex w-fit items-center">
    //         <form action={signInAction}>
    //           <GoogleSignInButton />
    //         </form>
    //       </div>
    //     </div>
    //     <div className="w-full px-4 pt pt-12 md:px-4 lg:px-8 xl:px-10 2xl:px-0">
    //       <div className="flex h-full w-full flex-col items-center justify-center">
    //         <h1 className="inline-block text-center text-4xl font-medium tracking-tighter text-dark lg:text-7xl">
    //           An Open Source AI-Powered{" "}
    //           <br className="hidden lg:inline-block" />
    //           Todo App
    //         </h1>
    //         <h2 className="mt-8 text-center text-xl font-light tracking-tight lg:text-3xl">
    //           Todo-AI seamlessly{" "}
    //           <span className="font-bold px-1">organizes your tasks</span> and
    //           <br className="hidden lg:inline-block" />
    //           <span className="font-bold px-1">predicts what&apos;s next</span>
    //           using AI.
    //         </h2>
    //         <div className="mt-12 flex flex-col gap-4">
    //           <form action={signInAction}>
    //             <GetStartedButton />
    //           </form>
    //         </div>
    //       </div>
    //     </div>
    //   </div>
    //   <div className="flex">
    //     <footer className="bottom-0 container mx-auto my-5 flex flex-col items-center justify-between space-y-3 border-t space-x-4 px-3 pt-4 text-center sm:flex-row sm:pt-2 md:text-lg">
    //       <div>
    //         Powered by{" "}
    //         <a
    //           href="https://convex.dev/"
    //           target="_blank"
    //           className="pr-1 font-bold transition hover:text-black/50"
    //         >
    //           Convex
    //         </a>
    //         and
    //         <a
    //           href="https://www.openai.com/"
    //           target="_blank"
    //           className="pl-1 font-bold transition hover:text-black/50"
    //         >
    //           OpenAI
    //         </a>
    //       </div>
    //       <div className="flex space-x-4 pb-4 sm:pb-0">
    //         <a
    //           className="group"
    //           aria-label="Twitter"
    //           href="https://twitter.com/0xsaksham"
    //         >
    //           <svg
    //             aria-hidden="true"
    //             className="h-6 w-6 fill-slate-500 group-hover:fill-blue-500"
    //           >
    //             <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0 0 22 5.92a8.19 8.19 0 0 1-2.357.646 4.118 4.118 0 0 0 1.804-2.27 8.224 8.224 0 0 1-2.605.996 4.107 4.107 0 0 0-6.993 3.743 11.65 11.65 0 0 1-8.457-4.287 4.106 4.106 0 0 0 1.27 5.477A4.073 4.073 0 0 1 2.8 9.713v.052a4.105 4.105 0 0 0 3.292 4.022 4.093 4.093 0 0 1-1.853.07 4.108 4.108 0 0 0 3.834 2.85A8.233 8.233 0 0 1 2 18.407a11.615 11.615 0 0 0 6.29 1.84"></path>
    //           </svg>
    //         </a>
    //         <a
    //           className="group"
    //           aria-label="GitHub"
    //           href="https://github.com/0xSaksham/todo-ai"
    //         >
    //           <svg
    //             aria-hidden="true"
    //             className="h-6 w-6 fill-slate-500 group-hover:fill-slate-900"
    //           >
    //             <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z"></path>
    //           </svg>
    //         </a>
    //       </div>
    //     </footer>
    //   </div>
    // </main>
    <>
      <HeroGeometric />
    </>
  );
}
function GetStartedButton() {
  const { pending } = useFormStatus();

  return (
    <button
      disabled={pending}
      type="submit"
      className="flex items-center justify-center px-8 py-4 mb-2 me-2 overflow-hidden text-xl font-medium text-gray-100 rounded-xl group bg-gradient-to-br from-purple-600 to-orange-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-yellow-300 dark:focus:ring-blue-800"
    >
      <span className="flex items-center gap-1">
        {pending ? (
          <span className=" px-16">
            <Loader className="w-5 h-5" />
          </span>
        ) : (
          <>
            Get Started
            <StepForward />
          </>
        )}
      </span>
    </button>
  );
}

function GoogleSignInButton() {
  const { pending } = useFormStatus();

  return (
    <button
      disabled={pending}
      className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800"
    >
      <span
        className={clsx(
          "relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0",
          pending && "px-16"
        )}
      >
        {pending ? (
          <span className="">
            <Loader className="w-5 h-5" />
          </span>
        ) : (
          "Sign in with Google"
        )}
      </span>
    </button>
  );
}
