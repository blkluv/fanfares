"use client"

import { usePrimalNotes, usePrimalProfiles, usePrimalNoteStats, usePrimalIsFetching } from "../controllers/state/primal-slice"
import { FeedPost } from "./FeedPost"
import Lottie from "lottie-react"
import { LottieLoading } from "./Lottie"

export function Feed() {
  const primalNotes = usePrimalNotes() || {}
  const primalProfiles = usePrimalProfiles() || {}
  const primalNoteStats = usePrimalNoteStats() || {}
  const primalIsFetching = usePrimalIsFetching()

  const renderLoading = () => {
    return (
      <div className="w-full h-full flex items-center gap-2">
        <Lottie className="w-20" animationData={LottieLoading} loop />
        <p>Loading...</p>
      </div>
    )
  }

  const renderNotes = () => {
    return Object.values(primalNotes).map((note: any) => {
      if (!note) return null

      const profile = primalProfiles[note.pubkey]
      const stats = primalNoteStats[note.id]

      if (!profile) return null

      return (
        <FeedPost
          key={note.id}
          note={note}
          profile={profile}
          stats={stats}
        />
      )
    })
  }

  return (
    <>
      <h1 className="font-black text-center text-gray-100 text-xl/4 md:mt-4 md:text-start md:text-4xl">
        Nostr Universe
      </h1>

      {primalIsFetching ? renderLoading() : renderNotes()}
    </>
  )
}