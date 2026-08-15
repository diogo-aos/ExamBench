port module Ports exposing (loadFromDb, saveToDb)

{-| The only two ports in the app: one out, one in, both carrying the whole
persisted state (questions + tests + config) as a single JSON blob rather
than one message per record/store. See js/db.js for the IndexedDB side.
-}

import Json.Decode as Decode
import Json.Encode as Encode


port saveToDb : Encode.Value -> Cmd msg


port loadFromDb : (Decode.Value -> msg) -> Sub msg
