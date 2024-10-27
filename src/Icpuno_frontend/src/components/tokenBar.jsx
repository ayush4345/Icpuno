
'use client'

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "./ui/avatar"
import { useEffect, useState } from "react";

export default function TokenInfoBar() {

    const [balance, setBalance] = useState(0)

    const ISSERVER = typeof window === "undefined";

    const [tokenAmount, setTokenAmount] = useState(0);

    useEffect(() => {
        // Retrieve game data from local storage
        if (!ISSERVER) {
            const storedUserData = localStorage.getItem('amount');

            if (storedUserData) {
                setTokenAmount(storedUserData);
            }
        }

    }, [balance]);

    return (
        <div className={`w-[100%] xl:max-w-[1280px] flex justify-between items-center mx-auto pt-5 px-3`}>
            <a href="/">
                <h2 className="font-extrabold text-[24px] text-white cursor-pointer">
                    UNO
                </h2>
            </a>
            <div className="flex gap-4 items-center">
                <a href="/play" className="text-white font-semibold text-lg hover:underline p-1 rounded-md cursor-pointer">Play</a >
                <Avatar>
                    <AvatarImage src={`https://api.dicebear.com/8.x/notionists/svg`} alt="@user" />
                    <AvatarFallback>AY</AvatarFallback>
                </Avatar>
            </div>
        </div>
    )
}