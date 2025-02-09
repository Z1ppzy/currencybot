"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const tiers = [
  {
    name: "Standard",
    price: "$0",
    description: "Essential features for casual users",
    features: [
      "Real-time exchange rates",
      "Basic currency converter",
      "5 currency pairs",
      "Daily rate updates",
      "Mobile app access",
    ],
    limitations: ["Limited historical data", "No alerts", "Basic support"],
  },
  {
    name: "Premium",
    price: "$9.99",
    description: "Advanced tools for frequent travelers and traders",
    features: [
      "All Standard features",
      "50 currency pairs",
      "Hourly rate updates",
      "Price alerts",
      "Historical data (1 year)",
      "Advanced charts",
      "Priority support",
    ],
    limitations: ["Limited API access"],
  },
  {
    name: "Ultimate",
    price: "$19.99",
    description: "Comprehensive solution for professionals",
    features: [
      "All Premium features",
      "Unlimited currency pairs",
      "Real-time rate updates",
      "Custom alerts",
      "Full historical data",
      "Advanced analytics",
      "API access",
      "Personal account manager",
    ],
    limitations: [],
  },
]

export default function Products() {
  const [selectedTier, setSelectedTier] = useState("Standard")

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0A1F] to-[#1C1B33] text-gray-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold sm:text-4xl lg:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-[#6366F1] to-[#818CF8]">
            Choose Your Plan
          </h2>
          <p className="mt-4 text-xl text-gray-300">Select the perfect plan for your currency tracking needs</p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3 lg:gap-x-8">
          {tiers.map((tier) => (
            <Card
              key={tier.name}
              className={`flex flex-col justify-between bg-gradient-to-b from-[#1C1B33] to-[#2D2B52] border-[#3F3D6D] ${
                selectedTier === tier.name ? "ring-2 ring-[#6366F1]" : ""
              }`}
            >
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-white">{tier.name}</CardTitle>
                <CardDescription className="text-gray-300">{tier.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="text-4xl font-bold mb-6 text-[#6366F1]">
                  {tier.price}
                  <span className="text-lg font-normal text-gray-300">/month</span>
                </div>
                <ul className="space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center text-gray-200">
                      <Check className="h-5 w-5 text-green-400 mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                  {tier.limitations.map((limitation) => (
                    <li key={limitation} className="flex items-center text-gray-400">
                      <X className="h-5 w-5 text-red-400 mr-2 flex-shrink-0" />
                      <span>{limitation}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className={`w-full ${
                    selectedTier === tier.name
                      ? "bg-gradient-to-r from-[#6366F1] to-[#818CF8] hover:from-[#818CF8] hover:to-[#6366F1]"
                      : "bg-[#3F3D6D] hover:bg-[#4F4D7D]"
                  } text-white font-semibold`}
                  onClick={() => setSelectedTier(tier.name)}
                >
                  {selectedTier === tier.name ? "Current Plan" : "Select Plan"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold mb-4 text-white">All Plans Include</h3>
          <div className="flex flex-wrap justify-center gap-4">
            {["24/7 Support", "Secure Transactions", "Regular Updates", "Cross-platform Access"].map((feature) => (
              <Badge key={feature} className="bg-[#3F3D6D] text-gray-200 px-3 py-1 text-sm">
                {feature}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

