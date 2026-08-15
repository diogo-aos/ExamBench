module Data exposing
    ( allTags
    , filteredQuestions
    , findReferences
    , moveQuestionInTest
    , nextId
    , seedQuestions
    , snapshotOf
    , tagColorIndex
    , withQuestionRemoved
    )

import Set exposing (Set)
import Types exposing (Answer, Group, Question, Reference, Slot(..), Snapshot, Test)



-- id generation: a plain counter + the current wall-clock millis (kept in
-- the model) is plenty unique for a single browser session, and avoids
-- pulling in elm/random just for this.


nextId : String -> Int -> Int -> String
nextId prefix nowMillis counter =
    prefix ++ "_" ++ String.fromInt nowMillis ++ "_" ++ String.fromInt counter


tagColorIndex : String -> Int
tagColorIndex tag =
    let
        step acc ch =
            (acc * 31 + Char.toCode ch) |> modBy 4294967296

        hash =
            String.foldl (\ch acc -> step acc ch) 0 tag
    in
    modBy 6 hash


snapshotOf : Question -> Snapshot
snapshotOf q =
    { version = q.version
    , savedAt = q.updatedAt
    , category = q.category
    , text = q.text
    , correct = q.correct
    , wrong = q.wrong
    , tags = q.tags
    }


findReferences : List Test -> String -> List Reference
findReferences tests questionId =
    tests
        |> List.concatMap
            (\t ->
                let
                    looseRef =
                        if List.member questionId t.looseQuestionIds then
                            [ { testName = t.name, where_ = "ungrouped" } ]

                        else
                            []

                    groupRefs =
                        t.groups
                            |> List.filter (\g -> List.member questionId g.questionIds)
                            |> List.map (\g -> { testName = t.name, where_ = g.name })
                in
                looseRef ++ groupRefs
            )


withQuestionRemoved : String -> Test -> Test
withQuestionRemoved questionId test =
    { test
        | looseQuestionIds = List.filter ((/=) questionId) test.looseQuestionIds
        , groups =
            List.map
                (\g -> { g | questionIds = List.filter ((/=) questionId) g.questionIds })
                test.groups
    }


insertBefore : Maybe String -> String -> List String -> List String
insertBefore beforeId questionId ids =
    case beforeId of
        Nothing ->
            ids ++ [ questionId ]

        Just before ->
            if List.member before ids then
                List.foldr
                    (\id acc ->
                        if id == before then
                            questionId :: id :: acc

                        else
                            id :: acc
                    )
                    []
                    ids

            else
                ids ++ [ questionId ]


{-| Remove `questionId` from wherever it currently sits in the test, then
re-insert it at `target` (before `beforeId`, or at the end when Nothing).
Mirrors `moveQuestionInTestLocal` in the original app.
-}
moveQuestionInTest : String -> Slot -> Maybe String -> Test -> Test
moveQuestionInTest questionId target beforeId test =
    let
        cleared =
            withQuestionRemoved questionId test
    in
    case target of
        Loose ->
            { cleared | looseQuestionIds = insertBefore beforeId questionId cleared.looseQuestionIds }

        InGroup groupId ->
            { cleared
                | groups =
                    List.map
                        (\g ->
                            if g.id == groupId then
                                { g | questionIds = insertBefore beforeId questionId g.questionIds }

                            else
                                g
                        )
                        cleared.groups
            }


allTags : List Question -> List String
allTags questions =
    questions
        |> List.concatMap .tags
        |> Set.fromList
        |> Set.toList
        |> List.sort


filteredQuestions : String -> Set String -> List Question -> List Question
filteredQuestions search activeTags questions =
    let
        needle =
            String.toLower (String.trim search)

        matchesTags q =
            Set.isEmpty activeTags || List.any (\t -> Set.member t activeTags) q.tags

        matchesSearch q =
            if needle == "" then
                True

            else
                (q.category :: q.text :: q.tags)
                    |> String.join " "
                    |> String.toLower
                    |> String.contains needle
    in
    List.filter (\q -> matchesTags q && matchesSearch q) questions



-- seed data: the same starter question bank the original app ships with,
-- loaded the first time IndexedDB comes back empty.


seedQuestions : Int -> List Question
seedQuestions nowMillis =
    seedRaw
        |> List.indexedMap
            (\i r ->
                let
                    id =
                        nextId "q" nowMillis i
                in
                { id = id
                , familyId = id
                , version = 1
                , history = []
                , updatedAt = nowMillis
                , category = r.category
                , text = r.text
                , correct = { text = r.correctText, justification = r.correctJust }
                , wrong = r.wrong
                , tags = r.tags
                }
            )


type alias SeedRaw =
    { category : String
    , text : String
    , correctText : String
    , correctJust : String
    , wrong : List Answer
    , tags : List String
    }


seedRaw : List SeedRaw
seedRaw =
    [ { category = "combined (cyber intelligence) — case study: Darknet Diaries Ep.178 'Ubiquiti'"
      , text = "The engineer already had the technical skill to abuse the company's cloud environment (capability) and, after years of feeling underpaid and overlooked, the personal grievance to want to act on it (intent). What he lacked for a long time was a way to reach the master credential vault without immediate suspicion — something the shift to near-universal remote work during the pandemic quietly gave him, since privileged remote access to the cloud environment became routine for his role. Using the standard threat equation from the course, which missing element did remote work primarily supply, completing the threat?"
      , correctText = "Opportunity — Threat = Intent + Capability + Opportunity; remote access removed the practical barrier that had been keeping an already-motivated, already-skilled insider from acting"
      , correctJust = "The course defines a threat as the combination of Intent, Capability and Opportunity. In this case, Nick's discontent (intent) and his cloud engineering expertise (capability) both predate the pandemic; what changed was routine, less-scrutinized remote access to privileged systems, which supplied the missing opportunity to act on an intent and capability he already had."
      , wrong =
            [ { text = "Intent — remote work is what first made him resentful about his pay and lack of recognition", justification = "His resentment grew from years of pay and promotion decisions, not from the work-from-home arrangement itself." }
            , { text = "Capability — remote work is what taught him the technical skills needed to navigate the cloud environment", justification = "His technical skill came from his career at AWS and then Ubiquiti, well before the pandemic reshaped work arrangements." }
            , { text = "Attribution — remote work is what allowed investigators to identify him as the culprit", justification = "Attribution is a separate, later problem for defenders/investigators; it is not one of the three elements of the threat equation." }
            , { text = "None of the others.", justification = "One option correctly names the missing element of the threat equation." }
            ]
      , tags = [ "cyber-intel", "ubiquiti-case-study" ]
      }
    , { category = "combined (offensive) — case study: Darknet Diaries Ep.178 'Ubiquiti'"
      , text = "In his anonymous ransom email, the engineer claimed to be an unrelated outside hacker, demanded 25 Bitcoin, and dangled a second 'secret backdoor' for an additional 25 Bitcoin — all while secretly being the Ubiquiti employee assigned to help investigate the very 'breach' he had staged. Using the JP 3-13 desired-effects framework from the course, which effect does constructing this false external-attacker persona best represent?"
      , correctText = "Deceive — to cause a person (here, the company's leadership and investigators) to believe what is not true"
      , correctJust = "Nothing about the ransom persona or the backdoor claim damaged, denied or degraded any system — its entire purpose was to make Ubiquiti's leadership and investigators believe a sophisticated outside actor was responsible, which matches the course's definition of Deceive exactly."
      , wrong =
            [ { text = "Destroy — to damage a system so badly it cannot be restored without being entirely rebuilt", justification = "No systems were rendered permanently unusable by the ransom note or the false persona itself." }
            , { text = "Deny — to prevent the adversary from accessing and using critical information, systems and services", justification = "The company's systems remained accessible to legitimate users throughout; nothing was denied." }
            , { text = "Degrade — to reduce the effectiveness or efficiency of adversary C2 or communications systems", justification = "No communications or command-and-control systems were degraded by posing as an outsider." }
            , { text = "Influence — to cause others to behave in a manner favorable to friendly forces", justification = "Influence is about shaping behavior toward the attacker's favor in a broad strategic sense; here the mechanism is specifically getting the target to believe a false claim, which is Deceive." }
            ]
      , tags = [ "offensive", "ubiquiti-case-study" ]
      }
    , { category = "combined (tools and tactics + defensive) — case study: Darknet Diaries Ep.178 'Ubiquiti'"
      , text = "Before staging the extortion attempt, the engineer privately messaged a colleague asking whether an employee could be paid through the company's bug-bounty program for reporting a security issue. The colleague found the question odd, given no such issue had been reported, and quietly saved the message. That saved message later became part of the evidence trail. Which course concept does the colleague's reaction best illustrate?"
      , correctText = "Monitoring employee behaviour — closely observing and noting unusual conduct, even when not obviously malicious at the time, is a recognized and valuable defensive measure, especially around sensitive infrastructure"
      , correctJust = "No technical control caught this — a human colleague noticed an inconsistency (a question implying knowledge of an unreported issue) and preserved it. This matches the course's point that closely monitoring employee behaviour, including seemingly small anomalies, is a valuable practice in environments hosting sensitive infrastructure, and it can generate evidence long before a technical alert ever fires."
      , wrong =
            [ { text = "Least privilege authorization — the colleague should have restricted the engineer's bug-bounty program access", justification = "Access scoping addresses what systems a user can reach, not how a suspicious verbal or written question gets noticed and escalated." }
            , { text = "Packet filtering — the message should have been automatically blocked by a networking device", justification = "Packet filtering operates on network traffic, not on the content or intent behind an internal chat message between colleagues." }
            , { text = "Communication encryption — the message should have been encrypted to prevent later use as evidence", justification = "Encryption protects confidentiality in transit or storage; it has nothing to do with why this message was significant, and encrypting it would not have prevented it from being used as evidence once disclosed." }
            , { text = "None of the others.", justification = "One option correctly names the concept the colleague's behaviour illustrates." }
            ]
      , tags = [ "defensive", "tools-tactics", "ubiquiti-case-study" ]
      }
    , { category = "combined (defensive) — case study: Darknet Diaries Ep.178 'Ubiquiti'"
      , text = "As part of the investigation, forensic examiners reviewed hours of footage from the company-issued security camera and dissected the engineer's company-issued laptop bit by bit — and found nothing. The intrusion had in fact been carried out from a separate, personal MacBook connected through his home Wi-Fi router, a device the company had no visibility into at all. What does this best illustrate about defending against insider threats operating from home?"
      , correctText = "Physical security and monitoring of company-issued devices have limited value against an insider using personal, unmonitored hardware and networks; effective detection has to extend to anomalous use of the privileged accounts and credentials themselves, not just the endpoints the organization controls"
      , correctJust = "The case shows a clean split between the company's visibility (camera footage, the issued laptop — both clean) and where the actual attack occurred (a personal device on a home network). This is precisely why detection ultimately had to rely on account/credential-level evidence — anomalous logins, session renaming, log-retention changes — rather than on monitoring physical assets, illustrating that insider-threat defense must follow the account and the data, not just the hardware the organization owns."
      , wrong =
            [ { text = "Reviewing camera footage and company devices is always sufficient to detect an insider attack, so the investigators must have missed something on the seized laptop", justification = "The case is presented explicitly as a gap: physical/device monitoring found nothing, which is the point being tested, not evidence of an investigative failure." }
            , { text = "Since the personal laptop was outside company control, the intrusion legally could not be attributed to the employee at all", justification = "Attribution ultimately succeeded through IP, MAC-address and traffic-volume analysis at the router and through account activity logs — the personal device did not place the intrusion outside investigative reach." }
            , { text = "Physical security measures are irrelevant to every category of cyber threat and should be deprioritized generally", justification = "Physical security remains highly relevant for other threat categories (e.g., theft of hardware, unauthorized facility access); the point here is narrower — it has limited value against this specific insider scenario." }
            , { text = "None of the others.", justification = "One option correctly states the lesson about defending beyond company-owned endpoints." }
            ]
      , tags = [ "defensive", "ubiquiti-case-study" ]
      }
    , { category = "combined (offensive + defensive, ethics) — case study: Darknet Diaries Ep.178 'Ubiquiti'"
      , text = "At sentencing, the engineer argued the entire episode was really an unsanctioned 'security drill' meant to force the company to take its vulnerabilities seriously, and asked for no prison time. The judge rejected this framing and imposed a six-year sentence. Based on how the course distinguishes legitimate security testing (e.g., authorized penetration testing, bug-bounty programs) from illegitimate activity, why does this defense fail?"
      , correctText = "Legitimate security testing requires prior authorization, a defined scope, and transparency with the organization; here the activity was concealed, involved covering tracks, an extortion demand for money, and false statements to federal investigators — none of which are compatible with an authorized test regardless of the stated intent"
      , correctJust = "The course frames authorized offensive activity (bug bounties, sanctioned red-teaming) as bounded by prior authorization and defined scope. Here, every hallmark of a legitimate test was absent: the activity was hidden through obfuscation, a genuine ransom was demanded, and the engineer lied to the FBI — factors the court treated as decisive, resulting in guilty pleas to damaging protected computers, wire fraud and false statements."
      , wrong =
            [ { text = "Any employee with sufficient technical skill is automatically authorized to test their employer's production systems without approval", justification = "Technical skill or job role does not confer authorization; scope and prior approval are what define legitimate testing, and neither was present here." }
            , { text = "A stated good intention legally converts an unauthorized intrusion into an authorized one after the fact", justification = "Motive can be considered at sentencing, but it does not retroactively authorize an intrusion or excuse extortion and lying to federal investigators — the guilty plea and sentence reflect this." }
            , { text = "Because Ubiquiti's security practices were genuinely weak, exploiting them was not a crime", justification = "The presence of real vulnerabilities does not make unauthorized exploitation lawful; the course's ethical-hacking framing is about authorization, not about whether flaws existed." }
            , { text = "Since no ransom was ultimately paid, no crime occurred", justification = "The wire fraud and computer damage charges rested on the intrusion, exfiltration and extortion attempt itself, not on whether the ransom was ultimately collected." }
            ]
      , tags = [ "offensive", "defensive", "ethics", "ubiquiti-case-study" ]
      }
    ]
