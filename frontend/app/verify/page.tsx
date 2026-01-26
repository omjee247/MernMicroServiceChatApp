"use client"

import Loading from "@/components/Loading"
import VerifyOTP from "@/components/VerifyOTP"
import { Suspense } from "react"

const VerifyPage = () => {

    return(
        <div>
            <Suspense fallback={<Loading/>}>
                <VerifyOTP/>
            </Suspense>
        </div>
    )
}

export default VerifyPage