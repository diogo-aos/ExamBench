module Types exposing
    ( Answer
    , BackupData
    , EditContext
    , Group
    , ImportItem
    , PendingOverwrite
    , QuestionData
    , Question
    , Reference
    , Slot(..)
    , Snapshot
    , Test
    )

{-| Domain model shared across the app. Mirrors the data shape of the
original app.html (see test-manage/README.md "Data model") field for field,
so existing backup/export JSON stays compatible.
-}


type alias Answer =
    { text : String
    , justification : String
    }


{-| A frozen copy of a question's content, pushed onto `history` whenever a
question is edited in place (see `applyOverwrite` in the original app).
-}
type alias Snapshot =
    { version : Int
    , savedAt : Int
    , category : String
    , text : String
    , correct : Answer
    , wrong : List Answer
    , tags : List String
    }


type alias Question =
    { id : String
    , familyId : String
    , version : Int
    , history : List Snapshot
    , updatedAt : Int
    , category : String
    , text : String
    , correct : Answer
    , wrong : List Answer
    , tags : List String
    }


type alias Group =
    { id : String
    , name : String
    , questionIds : List String
    }


type alias Test =
    { id : String
    , name : String
    , looseQuestionIds : List String
    , groups : List Group
    }


{-| Where a question lives inside a test: loose (ungrouped) or inside a
named group. Used both as a drag/drop target and to remember which slot a
question was edited from (so "save as new version" can swap just that one
reference).
-}
type Slot
    = Loose
    | InGroup String


type alias EditContext =
    { testId : String
    , location : Slot
    }


{-| The editable fields of a question form, independent of whether the
question is new or an edit-in-progress.
-}
type alias QuestionData =
    { category : String
    , text : String
    , correct : Answer
    , wrong : List Answer
    , tags : List String
    }


type alias Reference =
    { testName : String
    , where_ : String
    }


type alias PendingOverwrite =
    { data : QuestionData
    , refs : List Reference
    }


type alias BackupData =
    { questions : List Question
    , tests : List Test
    }


{-| The loose external shape accepted by "Import questions (JSON)" —
category / question / answers / justification, distinct from a `Question`.
-}
type alias ImportItem =
    { category : String
    , question : String
    , answersCorrect : String
    , answersWrong : List String
    , justificationCorrect : String
    , justificationWrong : List String
    }
