module Codec exposing
    ( Persisted
    , decodeBackup
    , decodeImportPayload
    , decodePersisted
    , encodeBackup
    , encodePersisted
    , encodeQuestion
    , encodeQuestionList
    , encodeTest
    , fixMissingIds
    , persistedDecoder
    )

{-| JSON encoding/decoding for the domain model.

Field names match the original app.html schema exactly, so backup files and
question exports produced by that version still load here, and files
exported here still describe the same shape.

Missing/malformed fields decode to sensible defaults (mirroring the old
`migrateData`) rather than failing outright, since this is the code path
that reads user-supplied backup files and pasted JSON. The one thing a
decoder can't do is *generate* a fresh id for a record that's missing one
(decoders are pure) — `fixMissingIds` does that as a separate pass, given a
starting counter to generate from.
-}

import Json.Decode as Decode exposing (Decoder)
import Json.Encode as Encode
import Types exposing (Answer, BackupData, Group, ImportItem, Question, Snapshot, Test)



-- small hand-rolled decode-pipeline helpers (no external decode package)


apply : Decoder a -> Decoder (a -> b) -> Decoder b
apply argDecoder funcDecoder =
    Decode.map2 (\f a -> f a) funcDecoder argDecoder


required : String -> Decoder a -> Decoder (a -> b) -> Decoder b
required field decoder pipeline =
    apply (Decode.field field decoder) pipeline


optional : String -> Decoder a -> a -> Decoder (a -> b) -> Decoder b
optional field decoder default pipeline =
    apply (Decode.oneOf [ Decode.field field decoder, Decode.succeed default ]) pipeline



-- Answer


encodeAnswer : Answer -> Encode.Value
encodeAnswer a =
    Encode.object
        [ ( "text", Encode.string a.text )
        , ( "justification", Encode.string a.justification )
        ]


answerDecoder : Decoder Answer
answerDecoder =
    Decode.succeed Answer
        |> optional "text" Decode.string ""
        |> optional "justification" Decode.string ""


answerWithDefault : Decoder Answer
answerWithDefault =
    Decode.oneOf [ answerDecoder, Decode.succeed { text = "", justification = "" } ]



-- Snapshot


encodeSnapshot : Snapshot -> Encode.Value
encodeSnapshot s =
    Encode.object
        [ ( "version", Encode.int s.version )
        , ( "savedAt", Encode.int s.savedAt )
        , ( "category", Encode.string s.category )
        , ( "text", Encode.string s.text )
        , ( "correct", encodeAnswer s.correct )
        , ( "wrong", Encode.list encodeAnswer s.wrong )
        , ( "tags", Encode.list Encode.string s.tags )
        ]


snapshotDecoder : Decoder Snapshot
snapshotDecoder =
    Decode.succeed Snapshot
        |> optional "version" Decode.int 1
        |> optional "savedAt" Decode.int 0
        |> optional "category" Decode.string ""
        |> optional "text" Decode.string ""
        |> optional "correct" answerWithDefault { text = "", justification = "" }
        |> optional "wrong" (Decode.list answerWithDefault) []
        |> optional "tags" (Decode.list Decode.string) []



-- Question


encodeQuestion : Question -> Encode.Value
encodeQuestion q =
    Encode.object
        [ ( "id", Encode.string q.id )
        , ( "familyId", Encode.string q.familyId )
        , ( "version", Encode.int q.version )
        , ( "history", Encode.list encodeSnapshot q.history )
        , ( "updatedAt", Encode.int q.updatedAt )
        , ( "category", Encode.string q.category )
        , ( "text", Encode.string q.text )
        , ( "correct", encodeAnswer q.correct )
        , ( "wrong", Encode.list encodeAnswer q.wrong )
        , ( "tags", Encode.list Encode.string q.tags )
        ]


encodeQuestionList : List Question -> Encode.Value
encodeQuestionList =
    Encode.list encodeQuestion


questionDecoder : Decoder Question
questionDecoder =
    Decode.succeed Question
        |> optional "id" Decode.string ""
        |> optional "familyId" Decode.string ""
        |> optional "version" Decode.int 1
        |> optional "history" (Decode.list snapshotDecoder) []
        |> optional "updatedAt" Decode.int 0
        |> optional "category" Decode.string ""
        |> optional "text" Decode.string ""
        |> optional "correct" answerWithDefault { text = "", justification = "" }
        |> optional "wrong" (Decode.list answerWithDefault) []
        |> optional "tags" (Decode.list Decode.string) []



-- Group / Test


encodeGroup : Group -> Encode.Value
encodeGroup g =
    Encode.object
        [ ( "id", Encode.string g.id )
        , ( "name", Encode.string g.name )
        , ( "questionIds", Encode.list Encode.string g.questionIds )
        ]


groupDecoder : Decoder Group
groupDecoder =
    Decode.succeed Group
        |> optional "id" Decode.string ""
        |> optional "name" Decode.string "Group"
        |> optional "questionIds" (Decode.list Decode.string) []


encodeTest : Test -> Encode.Value
encodeTest t =
    Encode.object
        [ ( "id", Encode.string t.id )
        , ( "name", Encode.string t.name )
        , ( "looseQuestionIds", Encode.list Encode.string t.looseQuestionIds )
        , ( "groups", Encode.list encodeGroup t.groups )
        ]


testDecoder : Decoder Test
testDecoder =
    Decode.succeed Test
        |> optional "id" Decode.string ""
        |> optional "name" Decode.string "Test"
        |> optional "looseQuestionIds" (Decode.list Decode.string) []
        |> optional "groups" (Decode.list groupDecoder) []



-- Backup file / pasted-JSON "questions + tests" shape


encodeBackup : List Question -> List Test -> Encode.Value
encodeBackup questions tests =
    Encode.object
        [ ( "schemaVersion", Encode.int 1 )
        , ( "questions", encodeQuestionList questions )
        , ( "tests", Encode.list encodeTest tests )
        ]


backupDecoder : Decoder BackupData
backupDecoder =
    Decode.succeed BackupData
        |> optional "questions" (Decode.list questionDecoder) []
        |> optional "tests" (Decode.list testDecoder) []


decodeBackup : String -> Result Decode.Error BackupData
decodeBackup =
    Decode.decodeString backupDecoder



-- persisted IndexedDB blob: { questions, tests, config: { activeTestId } }


encodePersisted : List Question -> List Test -> Maybe String -> Encode.Value
encodePersisted questions tests activeTestId =
    Encode.object
        [ ( "schemaVersion", Encode.int 1 )
        , ( "questions", encodeQuestionList questions )
        , ( "tests", Encode.list encodeTest tests )
        , ( "config"
          , Encode.object
                [ ( "activeTestId"
                  , case activeTestId of
                        Just id ->
                            Encode.string id

                        Nothing ->
                            Encode.null
                  )
                ]
          )
        ]


type alias Persisted =
    { questions : List Question
    , tests : List Test
    , activeTestId : Maybe String
    }


persistedDecoder : Decoder Persisted
persistedDecoder =
    Decode.succeed Persisted
        |> optional "questions" (Decode.list questionDecoder) []
        |> optional "tests" (Decode.list testDecoder) []
        |> optional "config" (Decode.field "activeTestId" (Decode.nullable Decode.string)) Nothing


decodePersisted : Decode.Value -> Maybe Persisted
decodePersisted value =
    Decode.decodeValue persistedDecoder value
        |> Result.toMaybe



-- "Import questions (JSON)" pasted payload: single item or array of items


importItemDecoder : Decoder ImportItem
importItemDecoder =
    Decode.succeed ImportItem
        |> optional "category" Decode.string ""
        |> optional "question" Decode.string ""
        |> optional "answers" (Decode.oneOf [ Decode.field "correct" Decode.string, Decode.succeed "" ]) ""
        |> optional "answers" (Decode.oneOf [ Decode.field "wrong" (Decode.list Decode.string), Decode.succeed [] ]) []
        |> optional "justification" (Decode.oneOf [ Decode.field "correct" Decode.string, Decode.succeed "" ]) ""
        |> optional "justification" (Decode.oneOf [ Decode.field "wrong" (Decode.list Decode.string), Decode.succeed [] ]) []


importPayloadDecoder : Decoder (List ImportItem)
importPayloadDecoder =
    Decode.oneOf
        [ Decode.list importItemDecoder
        , Decode.map List.singleton importItemDecoder
        ]


decodeImportPayload : String -> Result Decode.Error (List ImportItem)
decodeImportPayload =
    Decode.decodeString importPayloadDecoder



-- id self-healing: a decoded Question/Test/Group may have an empty id if
-- the source JSON omitted one (the old app fell back to `uid()` for this).
-- Threads a plain counter so every generated id in one pass is distinct.


fixMissingIds : Int -> List Question -> List Test -> ( List Question, List Test, Int )
fixMissingIds startCounter questions tests =
    let
        ( fixedQuestions, afterQuestions ) =
            List.foldr
                (\q ( acc, counter ) ->
                    if q.id == "" then
                        let
                            newId =
                                "q_" ++ String.fromInt counter

                            familyId =
                                if q.familyId == "" then
                                    newId

                                else
                                    q.familyId
                        in
                        ( { q | id = newId, familyId = familyId } :: acc, counter + 1 )

                    else if q.familyId == "" then
                        ( { q | familyId = q.id } :: acc, counter )

                    else
                        ( q :: acc, counter )
                )
                ( [], startCounter )
                questions

        ( fixedTests, afterTests ) =
            List.foldr
                (\t ( acc, counter ) ->
                    let
                        ( id, counter1 ) =
                            if t.id == "" then
                                ( "test_" ++ String.fromInt counter, counter + 1 )

                            else
                                ( t.id, counter )

                        ( fixedGroups, counter2 ) =
                            List.foldr
                                (\g ( gacc, gcounter ) ->
                                    if g.id == "" then
                                        ( { g | id = "grp_" ++ String.fromInt gcounter } :: gacc, gcounter + 1 )

                                    else
                                        ( g :: gacc, gcounter )
                                )
                                ( [], counter1 )
                                t.groups
                    in
                    ( { t | id = id, groups = fixedGroups } :: acc, counter2 )
                )
                ( [], afterQuestions )
                tests
    in
    ( fixedQuestions, fixedTests, afterTests )
