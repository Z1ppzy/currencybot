import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
      <div className="min-h-screen bg-[#0a061d] text-white">
        <div className="container mx-auto grid lg:grid-cols-2 gap-8 px-4 py-12 lg:py-20 items-center">
          <div className="space-y-8">
            <div className="inline-block">
              <div className="bg-indigo-500/10 rounded-full px-4 py-1.5 text-sm font-medium text-indigo-400 inline-flex items-center">
                <span className="bg-indigo-500 text-white md:px-2 md:py-0.5 px-4 py-3 rounded-full text-xs mr-2">100% ACCURACY</span>
                Exclusive & the best exchange rate insights in real time.
              </div>
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
              Fastest & secure platform to track currency and crypto exchange rates in real time.
            </h1>

            <p className="text-gray-400 text-lg max-w-xl">
              Track real-time exchange rates for currencies and cryptocurrencies with daily updates and trend analysis.
            </p>

            <Button size="lg" className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-full px-8 flex flex-row items-center justify-center">
              Try for FREE
              <svg className="w-7 h-7 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
              </svg>
            </Button>
          </div>

          <div className="relative h-[400px] lg:h-[600px]">
            <Image
                src="/bitok.png"
                alt="Crypto investment platform illustration"
                fill
                className="object-contain"
                priority
            />
          </div>
        </div>
      </div>
  )
}

