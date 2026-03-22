"use client"

import { useEffect } from "react"
import { Feed } from "@/app/components/Feed"
import {
  usePrimalActions,
} from "../../controllers/state/primal-slice"
import {
  useAccountNostr,
} from "../../controllers/state/account-slice"

export default function FeedPage() {
  const nostrAccount = useAccountNostr()
  const primalActions = usePrimalActions()

  useEffect(() => {
    primalActions.primalGetTrending(
      nostrAccount?.accountPublicKey || undefined
    )
  }, [nostrAccount?.accountPublicKey])

  return (
    <section className="flex flex-col space-y-2">
      <Feed />
    </section>
  )
}
