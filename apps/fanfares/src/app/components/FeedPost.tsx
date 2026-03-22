"use client"

import { FaRegComment, FaRegHeart, FaRetweet } from "react-icons/fa"
import { BsLightningCharge } from "react-icons/bs"
import Link from "next/link"
import { EventTemplate, Event as NostrEvent } from "nostr-tools"
import { useState } from "react"
import { RenderContent } from "./RenderContent"
import { useRouter } from "next/navigation"
import { NIP07, NostrProfile, getLud16Url } from "utils"
import { NostrPostStats } from "../controllers/primal/primalHelpers"
import { bech32 } from "bech32"
import {
  useAccountNostr,
  useAccountWebln,
} from "../controllers/state/account-slice"

// window typing
declare global {
  interface Window {
    nostr: NIP07
  }
}

interface FeedPostProps {
  note: NostrEvent<1>
  profile: NostrProfile
  stats?: NostrPostStats
}

export function FeedPost({ note, profile, stats }: FeedPostProps) {
  const router = useRouter()
  const [futureFeatureModalOn, setFutureFeatureModalOn] = useState(false)

  const nostrAccount = useAccountNostr()
  const webln = useAccountWebln()

  const goToProfilePage = () => {
    router.push(`/p/${note.pubkey}`)
  }

  const goToNotePage = () => {
    router.push(`/e/${note.id}`)
  }

  const zap = async () => {
    if (typeof window === "undefined") return // ✅ SSR guard

    if (!nostrAccount) {
      console.warn("nostr account not loaded")
      return
    }

    if (!profile.lud16) {
      console.warn("zap target has no lud16")
      return
    }

    if (!webln) {
      console.warn("webln not loaded")
      return
    }

    const zapTag = note.tags.find(tag => tag[0] === "zap")

    const lud16 =
      zapTag && Array.isArray(zapTag) && zapTag.length >= 2
        ? zapTag[1]
        : profile.lud16

    let lud16Url = null

    try {
      lud16Url = getLud16Url(lud16)
    } catch (e) {
      console.warn(e)
    }

    if (!lud16Url) return

    const response = await fetch(lud16Url)

    if (!response.ok) {
      console.error("zap error", await response.json())
      return
    }

    const sendDetails = await response.json()

    if (!sendDetails.allowsNostr) return

    if (
      !sendDetails.nostrPubkey ||
      !/^[0-9a-fA-F]{64}$/.test(sendDetails.nostrPubkey)
    ) {
      return
    }

    const buffer = Buffer.from(lud16, "utf8")
    const words = bech32.toWords(buffer)
    const encoded = bech32.encode("lnurl", words)

    const zapRequest: EventTemplate<9734> = {
      kind: 9734,
      content: "",
      pubkey: nostrAccount.accountPublicKey,
      created_at: Math.floor(Date.now() / 1000),
      tags: [
        ["relays", "wss://relay.primal.net"],
        ["amount", "55000"],
        ["lnurl", encoded],
        ["p", sendDetails.nostrPubkey],
        ["e", note.id],
      ],
    }

    const signed = await window.nostr?.signEvent(zapRequest)
    if (!signed) return

    const encodedEvent = encodeURIComponent(JSON.stringify(signed))

    const { pr: invoice } = await (
      await fetch(
        `${sendDetails.callback}?amount=55000&nostr=${encodedEvent}&lnurl=${encoded}`
      )
    ).json()

    webln.sendPayment(invoice)
  }

  return (
    <div className="border-buttonAccent mb-4 w-full rounded-md flex relative border pl-4 pr-4 py-3 flex-col mx-auto md:mx-0 mr-4">
      <div className="flex w-full h-12 gap-x-2">
        <img
          onClick={goToProfilePage}
          src={profile?.picture ?? "https://placehold.co/100"}
          className="border-2 border-buttonAccent object-cover rounded-full cursor-pointer w-10 h-10"
          alt="Profile"
        />

        <div className="flex flex-col">
          <p onClick={goToProfilePage} className="text-sm font-bold cursor-pointer">
            {profile?.display_name}
          </p>

          <Link
            href="#"
            className="text-white/50 text-sm font-thin hover:text-buttonAccentHover"
          >
            {" " + profile.nip05}
          </Link>
        </div>
      </div>

      <div className="flex-grow overflow-hidden space-y-1 mt-2">
        <div className="cursor-pointer" onClick={goToNotePage}>
          <RenderContent rawContent={note.content ?? ""} />
        </div>
      </div>

      {stats && (
        <div className="mt-5 flex gap-4 justify-evenly">
          <span onClick={zap} className="text-sm px-4 py-2 cursor-pointer flex items-center">
            <BsLightningCharge className="zap-color" />
            &nbsp;{stats.satszapped}
          </span>

          <span className="text-sm px-4 py-2 flex items-center">
            <FaRetweet className="retweet-color" />
            &nbsp;{stats.reposts}
          </span>

          <span className="text-sm px-4 py-2 flex items-center">
            <FaRegComment className="comment-color" />
            &nbsp;{stats.replies}
          </span>

          <span className="text-sm px-4 py-2 flex items-center">
            <FaRegHeart className="like-color" />
            &nbsp;{stats.likes}
          </span>
        </div>
      )}
    </div>
  )
}