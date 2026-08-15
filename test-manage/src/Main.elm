module Main exposing (main)

import Array
import Browser
import Codec
import Data
import File
import File.Download
import File.Select
import Html exposing (Attribute, Html, button, div, h1, h2, input, label, p, section, span, text, textarea)
import Html.Attributes as A exposing (checked, class, classList, disabled, draggable, placeholder, type_, value)
import Html.Events as E exposing (onClick, onInput)
import Json.Decode as Decode exposing (Decoder)
import Json.Encode
import Ports
import Set exposing (Set)
import Task
import Time
import Types exposing (Answer, BackupData, EditContext, Group, PendingOverwrite, Question, QuestionData, Slot(..), Test)



-- MAIN


main : Program () Model Msg
main =
    Browser.element
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }



-- MODEL


type FormMode
    = AddMode
    | EditMode


type alias FormState =
    { category : String
    , text : String
    , correctText : String
    , correctJust : String
    , wrong : List Answer
    , tagsInput : String
    }


type DragPayload
    = FromBank (List String)
    | FromTest String


type alias Model =
    { questions : List Question
    , tests : List Test
    , loaded : Bool
    , dbAvailable : Bool
    , dbErrorMsg : String
    , dbSaveError : Bool
    , now : Int
    , idCounter : Int

    , search : String
    , activeTags : Set String
    , selected : Set String

    , formMode : Maybe FormMode
    , editingId : Maybe String
    , editingContext : Maybe EditContext
    , formState : Maybe FormState

    , pendingOverwrite : Maybe PendingOverwrite
    , historyForId : Maybe String

    , importOpen : Bool
    , importText : String
    , importError : String

    , pendingDeleteQ : Maybe String
    , bulkTagInput : String
    , addToMenuOpen : Bool

    , activeTestId : Maybe String
    , renamingTestId : Maybe String
    , pendingDeleteGroup : Maybe String
    , pendingDeleteTest : Maybe String

    , pendingBackupLoad : Maybe BackupData
    , backupError : String
    , resetConfirm : Bool

    , dragging : Maybe DragPayload
    , dragOverTarget : Maybe Slot
    }


emptyFormState : FormState
emptyFormState =
    { category = ""
    , text = ""
    , correctText = ""
    , correctJust = ""
    , wrong = [ { text = "", justification = "" } ]
    , tagsInput = ""
    }


init : () -> ( Model, Cmd Msg )
init _ =
    ( { questions = []
      , tests = []
      , loaded = False
      , dbAvailable = True
      , dbErrorMsg = ""
      , dbSaveError = False
      , now = 0
      , idCounter = 0
      , search = ""
      , activeTags = Set.empty
      , selected = Set.empty
      , formMode = Nothing
      , editingId = Nothing
      , editingContext = Nothing
      , formState = Nothing
      , pendingOverwrite = Nothing
      , historyForId = Nothing
      , importOpen = False
      , importText = ""
      , importError = ""
      , pendingDeleteQ = Nothing
      , bulkTagInput = ""
      , addToMenuOpen = False
      , activeTestId = Nothing
      , renamingTestId = Nothing
      , pendingDeleteGroup = Nothing
      , pendingDeleteTest = Nothing
      , pendingBackupLoad = Nothing
      , backupError = ""
      , resetConfirm = False
      , dragging = Nothing
      , dragOverTarget = Nothing
      }
    , Task.perform Tick Time.now
    )



-- UPDATE


type Msg
    = NoOp
    | Tick Time.Posix
    | DataLoaded Decode.Value
      -- header / global
    | SearchInput String
    | ToggleTagFilter String
    | ClearTagFilters
    | ToggleSelect String
    | ClearSelection
    | BulkTagInput String
    | ApplyBulkTag
    | ToggleAddToMenu
    | AddSelectedTo Slot
    | ExportQuestionsOnly
    | OpenImport
    | CloseImport
    | ImportInput String
    | SubmitImport
    | OpenAddQuestion
    | AskReset
    | CancelReset
    | ResetAll
    | ExportBackup
    | RequestLoadBackup
    | GotBackupFile File.File
    | GotBackupText String
    | ConfirmLoadBackup
    | CancelLoadBackup
      -- bank question actions
    | AskDeleteQuestion String
    | CancelDeleteQuestion
    | DeleteQuestion String
    | OpenHistory String
    | CloseHistory
    | OpenEditFromBank String
    | OpenEditFromTest String Slot
      -- drag / drop
    | DragStartFromBank String
    | DragStartFromTest String
    | DragEnd
    | DragEnterTarget Slot
    | DragLeaveTarget
    | DropOnBank
    | DropOnTarget Slot (Maybe String)
      -- test builder
    | AddTest
    | SetActiveTest String
    | StartRenameTest String
    | CommitRenameTest String String
    | AskDeleteTest String
    | CancelDeleteTest
    | DeleteTest String
    | AddGroup
    | CommitRenameGroup String String
    | AskDeleteGroup String
    | CancelDeleteGroup
    | DeleteGroup String
    | MoveGroup String Int
    | ExportTest String
    | RemoveFromTest String
      -- question form
    | CloseForm
    | FormSetCategory String
    | FormSetText String
    | FormSetCorrectText String
    | FormSetCorrectJust String
    | FormSetTagsInput String
    | FormSetWrongText Int String
    | FormSetWrongJust Int String
    | AddWrongRow
    | RemoveWrongRow Int
    | SaveNewQuestion
    | SaveAsNewVersion
    | SaveOverwrite
    | ConfirmOverwrite
    | CancelOverwrite


save : Model -> Cmd Msg
save model =
    Ports.saveToDb (Codec.encodePersisted model.questions model.tests model.activeTestId)


genId : String -> Model -> ( String, Model )
genId prefix model =
    ( Data.nextId prefix model.now model.idCounter, { model | idCounter = model.idCounter + 1 } )


updateTestById : String -> (Test -> Test) -> List Test -> List Test
updateTestById id f tests =
    List.map
        (\t ->
            if t.id == id then
                f t

            else
                t
        )
        tests


updateActiveTest : (Test -> Test) -> Model -> Model
updateActiveTest f model =
    case model.activeTestId of
        Nothing ->
            model

        Just id ->
            { model | tests = updateTestById id f model.tests }


findActiveTest : Model -> Maybe Test
findActiveTest model =
    model.activeTestId
        |> Maybe.andThen (\id -> List.filter (\t -> t.id == id) model.tests |> List.head)


findQuestion : Model -> String -> Maybe Question
findQuestion model id =
    List.filter (\q -> q.id == id) model.questions |> List.head


updateAt : Int -> (a -> a) -> List a -> List a
updateAt index f xs =
    List.indexedMap
        (\i x ->
            if i == index then
                f x

            else
                x
        )
        xs


removeAt : Int -> List a -> List a
removeAt index xs =
    List.take index xs ++ List.drop (index + 1) xs


dedupe : List String -> List String
dedupe xs =
    List.foldl
        (\x acc ->
            if List.member x acc then
                acc

            else
                acc ++ [ x ]
        )
        []
        xs


mergeTags : List String -> List String -> List String
mergeTags existing added =
    existing ++ List.filter (\t -> not (List.member t existing)) (dedupe added)


downloadJSON : String -> Json.Encode.Value -> Cmd Msg
downloadJSON filename valueAsJson =
    File.Download.string filename "application/json" (Json.Encode.encode 2 valueAsJson)


dateStamp : Int -> String
dateStamp millis =
    let
        posix =
            Time.millisToPosix millis

        pad n =
            String.padLeft 2 '0' (String.fromInt n)
    in
    String.fromInt (Time.toYear Time.utc posix)
        ++ "-"
        ++ pad (monthNumber (Time.toMonth Time.utc posix))
        ++ "-"
        ++ pad (Time.toDay Time.utc posix)


monthNumber : Time.Month -> Int
monthNumber month =
    case month of
        Time.Jan -> 1
        Time.Feb -> 2
        Time.Mar -> 3
        Time.Apr -> 4
        Time.May -> 5
        Time.Jun -> 6
        Time.Jul -> 7
        Time.Aug -> 8
        Time.Sep -> 9
        Time.Oct -> 10
        Time.Nov -> 11
        Time.Dec -> 12


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        NoOp ->
            ( model, Cmd.none )

        Tick posix ->
            ( { model | now = Time.posixToMillis posix }, Cmd.none )

        DataLoaded value ->
            handleDataLoaded value model

        -- header / global
        SearchInput s ->
            ( { model | search = s }, Cmd.none )

        ToggleTagFilter tag ->
            ( { model
                | activeTags =
                    if Set.member tag model.activeTags then
                        Set.remove tag model.activeTags

                    else
                        Set.insert tag model.activeTags
              }
            , Cmd.none
            )

        ClearTagFilters ->
            ( { model | activeTags = Set.empty }, Cmd.none )

        ToggleSelect id ->
            ( { model
                | selected =
                    if Set.member id model.selected then
                        Set.remove id model.selected

                    else
                        Set.insert id model.selected
              }
            , Cmd.none
            )

        ClearSelection ->
            ( { model | selected = Set.empty }, Cmd.none )

        BulkTagInput s ->
            ( { model | bulkTagInput = s }, Cmd.none )

        ApplyBulkTag ->
            let
                newTags =
                    model.bulkTagInput
                        |> String.split ","
                        |> List.map String.trim
                        |> List.filter (not << String.isEmpty)
            in
            if List.isEmpty newTags then
                ( model, Cmd.none )

            else
                let
                    newQuestions =
                        model.questions
                            |> List.map
                                (\q ->
                                    if Set.member q.id model.selected then
                                        { q | tags = mergeTags q.tags newTags }

                                    else
                                        q
                                )

                    newModel =
                        { model | questions = newQuestions, bulkTagInput = "" }
                in
                ( newModel, save newModel )

        ToggleAddToMenu ->
            ( { model | addToMenuOpen = not model.addToMenuOpen }, Cmd.none )

        AddSelectedTo target ->
            case model.activeTestId of
                Nothing ->
                    ( model, Cmd.none )

                Just _ ->
                    let
                        ids =
                            Set.toList model.selected

                        newModel =
                            model
                                |> updateActiveTest
                                    (\t -> List.foldl (\qid acc -> Data.moveQuestionInTest qid target Nothing acc) t ids)
                                |> (\m -> { m | selected = Set.empty, addToMenuOpen = False })
                    in
                    ( newModel, save newModel )

        ExportQuestionsOnly ->
            let
                list =
                    if Set.isEmpty model.selected then
                        model.questions

                    else
                        List.filter (\q -> Set.member q.id model.selected) model.questions
            in
            ( model, downloadJSON ("questions-" ++ dateStamp model.now ++ ".json") (Codec.encodeQuestionList list) )

        OpenImport ->
            ( { model | importOpen = True, importText = "", importError = "" }, Cmd.none )

        CloseImport ->
            ( { model | importOpen = False }, Cmd.none )

        ImportInput s ->
            ( { model | importText = s }, Cmd.none )

        SubmitImport ->
            case Codec.decodeImportPayload model.importText of
                Err _ ->
                    ( { model | importError = "Couldn't parse that as JSON. Check the format and try again." }, Cmd.none )

                Ok items ->
                    let
                        ( newQuestions, newModel1 ) =
                            List.foldl
                                (\item ( acc, m ) ->
                                    let
                                        ( id, m2 ) =
                                            genId "q" m

                                        q =
                                            { id = id
                                            , familyId = id
                                            , version = 1
                                            , history = []
                                            , updatedAt = m2.now
                                            , category = item.category
                                            , text = item.question
                                            , correct = { text = item.answersCorrect, justification = item.justificationCorrect }
                                            , wrong =
                                                item.answersWrong
                                                    |> List.indexedMap
                                                        (\i w ->
                                                            { text = w
                                                            , justification = item.justificationWrong |> List.drop i |> List.head |> Maybe.withDefault ""
                                                            }
                                                        )
                                            , tags = []
                                            }
                                    in
                                    ( acc ++ [ q ], m2 )
                                )
                                ( [], model )
                                items

                        newModel =
                            { newModel1 | questions = newModel1.questions ++ newQuestions, importOpen = False }
                    in
                    ( newModel, save newModel )

        OpenAddQuestion ->
            ( { model
                | editingId = Nothing
                , editingContext = Nothing
                , formState = Just emptyFormState
                , formMode = Just AddMode
              }
            , Cmd.none
            )

        AskReset ->
            ( { model | resetConfirm = True }, Cmd.none )

        CancelReset ->
            ( { model | resetConfirm = False }, Cmd.none )

        ResetAll ->
            let
                newModel =
                    { model
                        | questions = []
                        , tests = []
                        , activeTestId = Nothing
                        , selected = Set.empty
                        , resetConfirm = False
                    }
            in
            ( newModel, save newModel )

        ExportBackup ->
            ( model
            , downloadJSON ("qbank-backup-" ++ dateStamp model.now ++ ".json") (Codec.encodeBackup model.questions model.tests)
            )

        RequestLoadBackup ->
            ( model, File.Select.file [ "application/json" ] GotBackupFile )

        GotBackupFile file ->
            ( model, Task.perform GotBackupText (File.toString file) )

        GotBackupText content ->
            case Codec.decodeBackup content of
                Err _ ->
                    ( { model | backupError = "Couldn't read that file as a backup." }, Cmd.none )

                Ok data ->
                    let
                        ( fixedQ, fixedT, newCounter ) =
                            Codec.fixMissingIds model.idCounter data.questions data.tests

                        fixed =
                            { questions = fixedQ, tests = fixedT }

                        modelWithCounter =
                            { model | idCounter = newCounter, backupError = "" }
                    in
                    if List.isEmpty model.questions && List.isEmpty model.tests then
                        applyLoadedData fixed modelWithCounter

                    else
                        ( { modelWithCounter | pendingBackupLoad = Just fixed }, Cmd.none )

        ConfirmLoadBackup ->
            case model.pendingBackupLoad of
                Nothing ->
                    ( model, Cmd.none )

                Just data ->
                    applyLoadedData data { model | pendingBackupLoad = Nothing }

        CancelLoadBackup ->
            ( { model | pendingBackupLoad = Nothing }, Cmd.none )

        -- bank question actions
        AskDeleteQuestion id ->
            ( { model | pendingDeleteQ = Just id }, Cmd.none )

        CancelDeleteQuestion ->
            ( { model | pendingDeleteQ = Nothing }, Cmd.none )

        DeleteQuestion id ->
            let
                newModel =
                    { model
                        | questions = List.filter (\q -> q.id /= id) model.questions
                        , tests = List.map (Data.withQuestionRemoved id) model.tests
                        , selected = Set.remove id model.selected
                        , pendingDeleteQ = Nothing
                    }
            in
            ( newModel, save newModel )

        OpenHistory id ->
            ( { model | historyForId = Just id }, Cmd.none )

        CloseHistory ->
            ( { model | historyForId = Nothing }, Cmd.none )

        OpenEditFromBank id ->
            ( { model
                | editingId = Just id
                , editingContext = Nothing
                , formState = Just (loadFormStateFrom model id)
                , formMode = Just EditMode
              }
            , Cmd.none
            )

        OpenEditFromTest id slot ->
            case model.activeTestId of
                Nothing ->
                    ( model, Cmd.none )

                Just testId ->
                    ( { model
                        | editingId = Just id
                        , editingContext = Just { testId = testId, location = slot }
                        , formState = Just (loadFormStateFrom model id)
                        , formMode = Just EditMode
                      }
                    , Cmd.none
                    )

        -- drag / drop
        DragStartFromBank id ->
            let
                ids =
                    if Set.member id model.selected && Set.size model.selected > 1 then
                        Set.toList model.selected

                    else
                        [ id ]
            in
            ( { model | dragging = Just (FromBank ids) }, Cmd.none )

        DragStartFromTest id ->
            ( { model | dragging = Just (FromTest id) }, Cmd.none )

        DragEnd ->
            ( { model | dragOverTarget = Nothing }, Cmd.none )

        DragEnterTarget slot ->
            ( { model | dragOverTarget = Just slot }, Cmd.none )

        DragLeaveTarget ->
            ( { model | dragOverTarget = Nothing }, Cmd.none )

        DropOnBank ->
            case ( model.dragging, model.activeTestId ) of
                ( Just (FromTest qid), Just _ ) ->
                    let
                        newModel =
                            model
                                |> updateActiveTest (Data.withQuestionRemoved qid)
                                |> (\m -> { m | dragging = Nothing, dragOverTarget = Nothing })
                    in
                    ( newModel, save newModel )

                _ ->
                    ( { model | dragging = Nothing, dragOverTarget = Nothing }, Cmd.none )

        DropOnTarget target beforeId ->
            case ( model.dragging, model.activeTestId ) of
                ( Nothing, _ ) ->
                    ( { model | dragOverTarget = Nothing }, Cmd.none )

                ( _, Nothing ) ->
                    ( { model | dragOverTarget = Nothing }, Cmd.none )

                ( Just (FromBank ids), Just _ ) ->
                    let
                        newModel =
                            model
                                |> updateActiveTest
                                    (\t -> List.foldl (\qid acc -> Data.moveQuestionInTest qid target beforeId acc) t ids)
                                |> (\m -> { m | dragging = Nothing, dragOverTarget = Nothing })
                    in
                    ( newModel, save newModel )

                ( Just (FromTest qid), Just _ ) ->
                    let
                        newModel =
                            model
                                |> updateActiveTest (Data.moveQuestionInTest qid target beforeId)
                                |> (\m -> { m | dragging = Nothing, dragOverTarget = Nothing })
                    in
                    ( newModel, save newModel )

        -- test builder
        AddTest ->
            let
                ( testId, m1 ) =
                    genId "test" model

                ( groupId, m2 ) =
                    genId "grp" m1

                newTest =
                    { id = testId
                    , name = "Test " ++ String.fromInt (List.length model.tests + 1)
                    , looseQuestionIds = []
                    , groups = [ { id = groupId, name = "Group 1", questionIds = [] } ]
                    }

                newModel =
                    { m2 | tests = model.tests ++ [ newTest ], activeTestId = Just testId }
            in
            ( newModel, save newModel )

        SetActiveTest id ->
            let
                newModel =
                    { model | activeTestId = Just id }
            in
            ( newModel, save newModel )

        StartRenameTest id ->
            ( { model | renamingTestId = Just id }, Cmd.none )

        CommitRenameTest id rawName ->
            let
                name =
                    String.trim rawName

                newModel =
                    { model
                        | renamingTestId = Nothing
                        , tests =
                            if String.isEmpty name then
                                model.tests

                            else
                                updateTestById id (\t -> { t | name = name }) model.tests
                    }
            in
            ( newModel, save newModel )

        AskDeleteTest id ->
            ( { model | pendingDeleteTest = Just id }, Cmd.none )

        CancelDeleteTest ->
            ( { model | pendingDeleteTest = Nothing }, Cmd.none )

        DeleteTest id ->
            let
                wasActive =
                    model.activeTestId == Just id

                remaining =
                    List.filter (\t -> t.id /= id) model.tests

                newModel =
                    { model
                        | tests = remaining
                        , activeTestId =
                            if wasActive then
                                List.head remaining |> Maybe.map .id

                            else
                                model.activeTestId
                        , pendingDeleteTest = Nothing
                    }
            in
            ( newModel, save newModel )

        AddGroup ->
            case model.activeTestId of
                Nothing ->
                    ( model, Cmd.none )

                Just _ ->
                    let
                        ( groupId, m1 ) =
                            genId "grp" model

                        activeGroupCount =
                            findActiveTest model |> Maybe.map (.groups >> List.length) |> Maybe.withDefault 0

                        newModel =
                            m1
                                |> updateActiveTest
                                    (\t ->
                                        { t
                                            | groups =
                                                t.groups
                                                    ++ [ { id = groupId, name = "Group " ++ String.fromInt (activeGroupCount + 1), questionIds = [] } ]
                                        }
                                    )
                    in
                    ( newModel, save newModel )

        CommitRenameGroup groupId rawName ->
            let
                name =
                    String.trim rawName
            in
            if String.isEmpty name then
                ( model, Cmd.none )

            else
                let
                    newModel =
                        updateActiveTest
                            (\t ->
                                { t
                                    | groups =
                                        List.map
                                            (\g ->
                                                if g.id == groupId then
                                                    { g | name = name }

                                                else
                                                    g
                                            )
                                            t.groups
                                }
                            )
                            model
                in
                ( newModel, save newModel )

        AskDeleteGroup id ->
            ( { model | pendingDeleteGroup = Just id }, Cmd.none )

        CancelDeleteGroup ->
            ( { model | pendingDeleteGroup = Nothing }, Cmd.none )

        DeleteGroup id ->
            let
                newModel =
                    model
                        |> updateActiveTest (\t -> { t | groups = List.filter (\g -> g.id /= id) t.groups })
                        |> (\m -> { m | pendingDeleteGroup = Nothing })
            in
            ( newModel, save newModel )

        MoveGroup id dir ->
            let
                newModel =
                    updateActiveTest (\t -> { t | groups = swapAdjacent id dir t.groups }) model
            in
            ( newModel, save newModel )

        ExportTest id ->
            case List.filter (\t -> t.id == id) model.tests |> List.head of
                Nothing ->
                    ( model, Cmd.none )

                Just t ->
                    ( model, downloadJSON (String.replace " " "_" t.name ++ ".json") (encodeTestExport model t) )

        RemoveFromTest qid ->
            let
                newModel =
                    updateActiveTest (Data.withQuestionRemoved qid) model
            in
            ( newModel, save newModel )

        -- question form
        CloseForm ->
            ( { model | formMode = Nothing, editingId = Nothing, editingContext = Nothing, formState = Nothing }, Cmd.none )

        FormSetCategory s ->
            ( mapFormState (\fs -> { fs | category = s }) model, Cmd.none )

        FormSetText s ->
            ( mapFormState (\fs -> { fs | text = s }) model, Cmd.none )

        FormSetCorrectText s ->
            ( mapFormState (\fs -> { fs | correctText = s }) model, Cmd.none )

        FormSetCorrectJust s ->
            ( mapFormState (\fs -> { fs | correctJust = s }) model, Cmd.none )

        FormSetTagsInput s ->
            ( mapFormState (\fs -> { fs | tagsInput = s }) model, Cmd.none )

        FormSetWrongText i s ->
            ( mapFormState (\fs -> { fs | wrong = updateAt i (\w -> { w | text = s }) fs.wrong }) model, Cmd.none )

        FormSetWrongJust i s ->
            ( mapFormState (\fs -> { fs | wrong = updateAt i (\w -> { w | justification = s }) fs.wrong }) model, Cmd.none )

        AddWrongRow ->
            ( mapFormState (\fs -> { fs | wrong = fs.wrong ++ [ { text = "", justification = "" } ] }) model, Cmd.none )

        RemoveWrongRow i ->
            ( mapFormState (\fs -> { fs | wrong = removeAt i fs.wrong }) model, Cmd.none )

        SaveNewQuestion ->
            case model.formState of
                Nothing ->
                    ( model, Cmd.none )

                Just fs ->
                    case questionDataFromForm fs of
                        Nothing ->
                            ( model, Cmd.none )

                        Just data ->
                            let
                                ( id, m1 ) =
                                    genId "q" model

                                q =
                                    { id = id
                                    , familyId = id
                                    , version = 1
                                    , history = []
                                    , updatedAt = m1.now
                                    , category = data.category
                                    , text = data.text
                                    , correct = data.correct
                                    , wrong = data.wrong
                                    , tags = data.tags
                                    }

                                newModel =
                                    { m1 | questions = model.questions ++ [ q ] }
                                        |> closeFormFields
                            in
                            ( newModel, save newModel )

        SaveOverwrite ->
            case ( model.editingId, model.formState |> Maybe.andThen questionDataFromForm ) of
                ( Just id, Just data ) ->
                    let
                        refs =
                            Data.findReferences model.tests id
                    in
                    if List.isEmpty refs then
                        let
                            newModel =
                                applyOverwrite id data model |> closeFormFields
                        in
                        ( newModel, save newModel )

                    else
                        ( { model | pendingOverwrite = Just { data = data, refs = refs } }, Cmd.none )

                _ ->
                    ( model, Cmd.none )

        SaveAsNewVersion ->
            case ( model.editingId, model.formState |> Maybe.andThen questionDataFromForm ) of
                ( Just id, Just data ) ->
                    let
                        newModel =
                            applyNewVersion id data model.editingContext model |> closeFormFields
                    in
                    ( newModel, save newModel )

                _ ->
                    ( model, Cmd.none )

        ConfirmOverwrite ->
            case ( model.editingId, model.pendingOverwrite ) of
                ( Just id, Just pending ) ->
                    let
                        newModel =
                            applyOverwrite id pending.data model
                                |> (\m -> { m | pendingOverwrite = Nothing })
                                |> closeFormFields
                    in
                    ( newModel, save newModel )

                _ ->
                    ( model, Cmd.none )

        CancelOverwrite ->
            ( { model | pendingOverwrite = Nothing }, Cmd.none )


swapAdjacent : String -> Int -> List Group -> List Group
swapAdjacent id dir groups =
    let
        idx =
            groups |> List.indexedMap Tuple.pair |> List.filter (\( _, g ) -> g.id == id) |> List.head |> Maybe.map Tuple.first
    in
    case idx of
        Nothing ->
            groups

        Just i ->
            let
                newIdx =
                    i + dir
            in
            if newIdx < 0 || newIdx >= List.length groups then
                groups

            else
                let
                    arr =
                        Array.fromList groups

                    a =
                        Array.get i arr

                    b =
                        Array.get newIdx arr
                in
                case ( a, b ) of
                    ( Just av, Just bv ) ->
                        arr |> Array.set i bv |> Array.set newIdx av |> Array.toList

                    _ ->
                        groups


mapFormState : (FormState -> FormState) -> Model -> Model
mapFormState f model =
    { model | formState = Maybe.map f model.formState }


closeFormFields : Model -> Model
closeFormFields model =
    { model | formMode = Nothing, editingId = Nothing, editingContext = Nothing, formState = Nothing }


loadFormStateFrom : Model -> String -> FormState
loadFormStateFrom model id =
    case findQuestion model id of
        Nothing ->
            emptyFormState

        Just q ->
            { category = q.category
            , text = q.text
            , correctText = q.correct.text
            , correctJust = q.correct.justification
            , wrong =
                if List.isEmpty q.wrong then
                    [ { text = "", justification = "" } ]

                else
                    q.wrong
            , tagsInput = String.join ", " q.tags
            }


questionDataFromForm : FormState -> Maybe QuestionData
questionDataFromForm fs =
    if String.isEmpty (String.trim fs.text) || String.isEmpty (String.trim fs.correctText) then
        Nothing

    else
        Just
            { category = String.trim fs.category
            , text = String.trim fs.text
            , correct = { text = String.trim fs.correctText, justification = String.trim fs.correctJust }
            , wrong = fs.wrong |> List.filter (\w -> not (String.isEmpty (String.trim w.text)))
            , tags = fs.tagsInput |> String.split "," |> List.map String.trim |> List.filter (not << String.isEmpty)
            }


applyOverwrite : String -> QuestionData -> Model -> Model
applyOverwrite id data model =
    { model
        | questions =
            List.map
                (\q ->
                    if q.id == id then
                        { q
                            | version = q.version + 1
                            , history = q.history ++ [ Data.snapshotOf q ]
                            , updatedAt = model.now
                            , category = data.category
                            , text = data.text
                            , correct = data.correct
                            , wrong = data.wrong
                            , tags = data.tags
                        }

                    else
                        q
                )
                model.questions
    }


applyNewVersion : String -> QuestionData -> Maybe EditContext -> Model -> Model
applyNewVersion id data context model =
    case findQuestion model id of
        Nothing ->
            model

        Just original ->
            let
                ( newId, m1 ) =
                    genId "q" model

                newQ =
                    { id = newId
                    , familyId = original.familyId
                    , version = original.version + 1
                    , history = original.history ++ [ Data.snapshotOf original ]
                    , updatedAt = m1.now
                    , category = data.category
                    , text = data.text
                    , correct = data.correct
                    , wrong = data.wrong
                    , tags = data.tags
                    }

                m2 =
                    { m1 | questions = model.questions ++ [ newQ ] }
            in
            case context of
                Nothing ->
                    m2

                Just ctx ->
                    updateTestById ctx.testId
                        (\t ->
                            case ctx.location of
                                Loose ->
                                    { t | looseQuestionIds = List.map (\qid -> ifEq qid id newId) t.looseQuestionIds }

                                InGroup gid ->
                                    { t
                                        | groups =
                                            List.map
                                                (\g ->
                                                    if g.id == gid then
                                                        { g | questionIds = List.map (\qid -> ifEq qid id newId) g.questionIds }

                                                    else
                                                        g
                                                )
                                                t.groups
                                    }
                        )
                        m2.tests
                        |> (\newTests -> { m2 | tests = newTests })


ifEq : a -> a -> a -> a
ifEq value target replacement =
    if value == target then
        replacement

    else
        value


applyLoadedData : BackupData -> Model -> ( Model, Cmd Msg )
applyLoadedData data model =
    let
        newModel =
            { model
                | questions = data.questions
                , tests = data.tests
                , activeTestId = List.head data.tests |> Maybe.map .id
            }
    in
    ( newModel, save newModel )


encodeTestExport : Model -> Test -> Json.Encode.Value
encodeTestExport model t =
    let
        byId qid =
            findQuestion model qid

        questionsFor ids =
            ids |> List.filterMap byId |> Codec.encodeQuestionList
    in
    Json.Encode.object
        [ ( "name", Json.Encode.string t.name )
        , ( "ungrouped", questionsFor t.looseQuestionIds )
        , ( "groups"
          , Json.Encode.list
                (\g ->
                    Json.Encode.object
                        [ ( "name", Json.Encode.string g.name )
                        , ( "questions", questionsFor g.questionIds )
                        ]
                )
                t.groups
          )
        ]


type alias IncomingEnvelope =
    { kind : String
    , dbAvailable : Bool
    , dbErrorMsg : String
    , data : Maybe Codec.Persisted
    }


incomingDecoder : Decoder IncomingEnvelope
incomingDecoder =
    Decode.map4 IncomingEnvelope
        (Decode.oneOf [ Decode.field "kind" Decode.string, Decode.succeed "" ])
        (Decode.oneOf [ Decode.field "dbAvailable" Decode.bool, Decode.succeed True ])
        (Decode.oneOf [ Decode.field "dbErrorMsg" Decode.string, Decode.succeed "" ])
        (Decode.oneOf [ Decode.field "data" (Decode.nullable Codec.persistedDecoder), Decode.succeed Nothing ])


handleDataLoaded : Decode.Value -> Model -> ( Model, Cmd Msg )
handleDataLoaded value model =
    case Decode.decodeValue incomingDecoder value of
        Err _ ->
            ( model, Cmd.none )

        Ok env ->
            case env.kind of
                "saveError" ->
                    ( { model | dbSaveError = True }, Cmd.none )

                _ ->
                    let
                        base =
                            { model | dbAvailable = env.dbAvailable, dbErrorMsg = env.dbErrorMsg, dbSaveError = False }
                    in
                    case env.data of
                        Just persisted ->
                            let
                                ( fixedQ, fixedT, newCounter ) =
                                    Codec.fixMissingIds model.idCounter persisted.questions persisted.tests
                            in
                            if List.isEmpty fixedQ && List.isEmpty fixedT then
                                -- Both the bank and the test list are empty — either this is a
                                -- brand-new database or the user reset everything; either way,
                                -- reseed with the starter bank (matches the original app.html,
                                -- which reseeds any time both IndexedDB stores come back empty,
                                -- not only on a database that's never been written to).
                                seedAndSave { base | idCounter = newCounter }

                            else
                                let
                                    activeId =
                                        case persisted.activeTestId of
                                            Just id ->
                                                if List.any (\t -> t.id == id) fixedT then
                                                    Just id

                                                else
                                                    List.head fixedT |> Maybe.map .id

                                            Nothing ->
                                                List.head fixedT |> Maybe.map .id
                                in
                                ( { base
                                    | questions = fixedQ
                                    , tests = fixedT
                                    , activeTestId = activeId
                                    , idCounter = newCounter
                                    , loaded = True
                                  }
                                , Cmd.none
                                )

                        Nothing ->
                            seedAndSave base


seedAndSave : Model -> ( Model, Cmd Msg )
seedAndSave base =
    let
        seeded =
            Data.seedQuestions base.now

        seededModel =
            { base | questions = seeded, tests = [], activeTestId = Nothing, loaded = True }
    in
    ( seededModel, save seededModel )



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions _ =
    Sub.batch
        [ Time.every 1000 Tick
        , Ports.loadFromDb DataLoaded
        ]



-- VIEW


view : Model -> Html Msg
view model =
    if not model.loaded then
        div [ class "min-h-screen flex items-center justify-center text-stone-400 bg-stone-50" ] [ text "Loading…" ]

    else
        div [ class "bg-stone-50 min-h-screen text-stone-900" ]
            [ div [ class "max-w-7xl mx-auto px-6 py-7" ]
                [ headerView model
                , div [ class "grid grid-cols-1 lg:grid-cols-2 gap-6 mt-5" ]
                    [ bankPanelView model
                    , builderPanelView model
                    ]
                ]
            , modalRootView model
            ]


headerView : Model -> Html Msg
headerView model =
    div []
        [ div [ class "flex items-start justify-between gap-4" ]
            [ div []
                [ h1 [ class "font-serif text-[22px] font-semibold tracking-tight" ] [ text "Question Bank & Test Builder" ]
                , p [ class "mt-1 text-[13px] text-stone-500" ] [ text "Tag, filter, and assemble questions into tests by drag-and-drop." ]
                ]
            , if model.dbSaveError then
                span [ class "text-rose-600 text-xs" ] [ text "⚠ couldn't save" ]

              else
                text ""
            ]
        , if not model.dbAvailable then
            div [ class "bg-amber-50 border border-amber-200 text-amber-800 rounded-md px-3 py-2 text-xs mt-2.5" ]
                [ text model.dbErrorMsg ]

          else
            text ""
        , div [ class "flex flex-wrap items-center gap-3 text-xs text-stone-500 border-t border-stone-200 pt-3 mt-3" ]
            [ outlineBtn "⭳ Download backup" ExportBackup
            , outlineBtn "⭱ Load backup" RequestLoadBackup
            , if String.isEmpty model.backupError then
                text ""

              else
                span [ class "text-rose-600 text-xs" ] [ text model.backupError ]
            , span [ class "flex-1" ] []
            , if model.resetConfirm then
                span [ class "flex items-center gap-1" ]
                    [ span [] [ text "erase everything?" ]
                    , linkDangerBtn "yes" ResetAll
                    , linkBtn "no" CancelReset
                    ]

              else
                linkBtn "reset data" AskReset
            ]
        , case model.pendingBackupLoad of
            Nothing ->
                text ""

            Just data ->
                div [ class "bg-amber-50 border border-amber-200 text-amber-800 rounded-md px-3 py-2 text-xs mt-2.5 flex items-center gap-2 flex-wrap" ]
                    [ span []
                        [ text
                            ("Loaded file has "
                                ++ String.fromInt (List.length data.questions)
                                ++ " question(s) and "
                                ++ String.fromInt (List.length data.tests)
                                ++ " test(s) — replace current data?"
                            )
                        ]
                    , primaryBtnSm "Replace" ConfirmLoadBackup
                    , linkBtn "Cancel" CancelLoadBackup
                    ]
        ]



-- buttons


btnBase : String
btnBase =
    "text-xs px-2.5 py-1.5 rounded-md cursor-pointer border inline-flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"


primaryBtn : String -> Msg -> Html Msg
primaryBtn label_ msg =
    button [ class (btnBase ++ " bg-teal-700 text-white border-teal-700 hover:bg-teal-800"), onClick msg ] [ text label_ ]


primaryBtnSm : String -> Msg -> Html Msg
primaryBtnSm label_ msg =
    button [ class "text-[11px] px-2 py-1 rounded-md cursor-pointer border bg-teal-700 text-white border-teal-700 hover:bg-teal-800", onClick msg ] [ text label_ ]


outlineBtn : String -> Msg -> Html Msg
outlineBtn label_ msg =
    button [ class (btnBase ++ " bg-white text-stone-900 border-stone-300 hover:bg-stone-100"), onClick msg ] [ text label_ ]


primaryBtnSmDisabled : String -> Bool -> Msg -> Html Msg
primaryBtnSmDisabled label_ isDisabled msg =
    button
        [ class "text-[11px] px-2 py-1 rounded-md cursor-pointer border bg-teal-700 text-white border-teal-700 hover:bg-teal-800 disabled:opacity-40 disabled:cursor-not-allowed"
        , onClick msg
        , disabled isDisabled
        ]
        [ text label_ ]


outlineBtnSmDisabled : String -> Bool -> Msg -> Html Msg
outlineBtnSmDisabled label_ isDisabled msg =
    button
        [ class "text-[11px] px-2 py-1 rounded-md cursor-pointer border bg-white text-stone-900 border-stone-300 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed"
        , onClick msg
        , disabled isDisabled
        ]
        [ text label_ ]


dangerBtnXs : String -> Msg -> Html Msg
dangerBtnXs label_ msg =
    button [ class "text-[11px] px-1.5 py-0.5 rounded bg-rose-600 text-white hover:bg-rose-700 cursor-pointer border border-rose-600", onClick msg ] [ text label_ ]


dangerOutlineBtn : String -> Msg -> Html Msg
dangerOutlineBtn label_ msg =
    button [ class (btnBase ++ " bg-white text-rose-700 border-rose-200 hover:bg-rose-50"), onClick msg ] [ text label_ ]


linkBtn : String -> Msg -> Html Msg
linkBtn label_ msg =
    button [ class "bg-transparent border-none text-stone-500 underline decoration-dotted cursor-pointer text-xs p-0 hover:text-stone-900", onClick msg ] [ text label_ ]


linkDangerBtn : String -> Msg -> Html Msg
linkDangerBtn label_ msg =
    button [ class "bg-transparent border-none text-rose-600 font-semibold cursor-pointer text-xs p-0", onClick msg ] [ text label_ ]


iconBtn : String -> Msg -> Html Msg
iconBtn icon msg =
    button [ class "bg-transparent border-none cursor-pointer text-stone-400 text-[13px] p-0.5 leading-none hover:text-teal-700", onClick msg ] [ text icon ]


iconBtnDanger : String -> Msg -> Html Msg
iconBtnDanger icon msg =
    button [ class "bg-transparent border-none cursor-pointer text-stone-400 text-[13px] p-0.5 leading-none hover:text-rose-600", onClick msg ] [ text icon ]


miniBtn : String -> Bool -> Msg -> Html Msg
miniBtn label_ isDisabled msg =
    button
        [ class "bg-transparent border-none text-stone-400 cursor-pointer text-[10px] px-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
        , onClick msg
        , disabled isDisabled
        ]
        [ text label_ ]


formInput : List (Attribute Msg) -> List (Html Msg) -> Html Msg
formInput attrs children =
    input (class "w-full border border-stone-300 rounded-md px-2.5 py-2 text-[13px] focus:outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-50" :: attrs) children


formTextarea : List (Attribute Msg) -> List (Html Msg) -> Html Msg
formTextarea attrs children =
    textarea (class "w-full border border-stone-300 rounded-md px-2.5 py-2 text-[13px] font-inherit focus:outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-50" :: attrs) children



-- tag colors


tagColorClasses : Int -> String
tagColorClasses idx =
    case idx of
        0 ->
            "bg-emerald-50 border-emerald-200 text-emerald-700"

        1 ->
            "bg-sky-100 border-sky-200 text-sky-700"

        2 ->
            "bg-amber-50 border-amber-200 text-amber-800"

        3 ->
            "bg-rose-50 border-rose-200 text-rose-700"

        4 ->
            "bg-violet-50 border-violet-200 text-violet-700"

        _ ->
            "bg-teal-50 border-teal-200 text-teal-800"


tagPill : String -> Html Msg
tagPill t =
    span [ class ("font-mono text-[10px] px-1.5 py-0.5 rounded-full border " ++ tagColorClasses (Data.tagColorIndex t)) ] [ text t ]



-- bank panel


bankPanelView : Model -> Html Msg
bankPanelView model =
    section
        [ class "bg-white border border-stone-200 rounded-xl flex flex-col"
        , E.preventDefaultOn "dragover" (Decode.succeed ( NoOp, True ))
        , E.preventDefaultOn "drop" (Decode.succeed ( DropOnBank, True ))
        ]
        [ div [ class "p-4 border-b border-stone-200 flex flex-col gap-2.5" ]
            [ div [ class "flex items-center justify-between gap-2.5 flex-wrap" ]
                [ h2 [ class "font-serif text-[15px] font-semibold" ]
                    [ text "Question bank "
                    , span [ class "text-stone-500" ] [ text ("(" ++ String.fromInt (List.length model.questions) ++ ")") ]
                    ]
                , div [ class "flex gap-2 flex-wrap" ]
                    [ outlineBtn "⭳ Export questions" ExportQuestionsOnly
                    , outlineBtn "⭱ Import" OpenImport
                    , primaryBtn "+ Add question" OpenAddQuestion
                    ]
                ]
            , div [ class "relative" ]
                [ span [ class "absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" ] [ text "🔍" ]
                , formInput
                    [ placeholder "Search questions, tags, categories..."
                    , onInput SearchInput
                    , value model.search
                    , class "pl-8"
                    ]
                    []
                ]
            , tagChipsView model
            ]
        , bulkToolbarView model
        , div [ class "flex-1 overflow-y-auto max-h-screen" ] (bankListView model)
        ]


tagChipsView : Model -> Html Msg
tagChipsView model =
    let
        all =
            Data.allTags model.questions
    in
    if List.isEmpty all then
        text ""

    else
        div [ class "flex flex-wrap gap-1.5" ]
            (List.map (tagChip model.activeTags) all
                ++ (if Set.isEmpty model.activeTags then
                        []

                    else
                        [ linkBtn "clear" ClearTagFilters ]
                   )
            )


tagChip : Set String -> String -> Html Msg
tagChip activeTags t =
    let
        isActive =
            Set.member t activeTags
    in
    button
        [ classList
            [ ( "font-mono text-[11px] px-2.5 py-1 rounded-full border cursor-pointer", True )
            , ( tagColorClasses (Data.tagColorIndex t), True )
            , ( "ring-1 ring-teal-700", isActive )
            , ( "hover:bg-stone-100", not isActive )
            ]
        , onClick (ToggleTagFilter t)
        ]
        [ text t ]


bulkToolbarView : Model -> Html Msg
bulkToolbarView model =
    if Set.isEmpty model.selected then
        text ""

    else
        let
            activeTest =
                findActiveTest model
        in
        div [ class "px-4 py-2 bg-teal-50 border-b border-teal-200 flex flex-wrap items-center gap-2 text-xs" ]
            [ span [ class "font-semibold" ] [ text (String.fromInt (Set.size model.selected) ++ " selected") ]
            , input
                [ class "w-[110px] border border-stone-300 rounded-md px-2 py-1 text-[12px] focus:outline-none focus:border-teal-700"
                , placeholder "tag, tag"
                , value model.bulkTagInput
                , onInput BulkTagInput
                ]
                []
            , primaryBtnSmDisabled "Apply tag" (String.isEmpty (String.trim model.bulkTagInput)) ApplyBulkTag
            , div [ class "relative inline-block" ]
                (button
                    [ class "text-[11px] px-2 py-1 rounded-md cursor-pointer border bg-white text-stone-900 border-stone-300 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed"
                    , onClick ToggleAddToMenu
                    , disabled (activeTest == Nothing)
                    ]
                    [ text "Add to ▾" ]
                    :: (if model.addToMenuOpen then
                            [ addToMenuView activeTest ]

                        else
                            []
                       )
                )
            , button [ class "bg-transparent border-none text-stone-500 underline decoration-dotted cursor-pointer text-xs p-0 hover:text-stone-900 ml-auto", onClick ClearSelection ] [ text "clear" ]
            ]


addToMenuView : Maybe Test -> Html Msg
addToMenuView maybeTest =
    case maybeTest of
        Nothing ->
            text ""

        Just t ->
            div [ class "absolute z-20 top-full mt-1 bg-white border border-stone-200 rounded-md shadow-lg min-w-[140px]" ]
                (button [ class "block w-full text-left px-3 py-1.5 border-none bg-transparent cursor-pointer text-[12px] whitespace-nowrap hover:bg-stone-100", onClick (AddSelectedTo Loose) ] [ text "Ungrouped" ]
                    :: List.map
                        (\g ->
                            button
                                [ class "block w-full text-left px-3 py-1.5 border-none bg-transparent cursor-pointer text-[12px] whitespace-nowrap hover:bg-stone-100"
                                , onClick (AddSelectedTo (InGroup g.id))
                                ]
                                [ text g.name ]
                        )
                        t.groups
                )


bankListView : Model -> List (Html Msg)
bankListView model =
    let
        filtered =
            Data.filteredQuestions model.search model.activeTags model.questions
    in
    if List.isEmpty filtered then
        [ div [ class "p-8 text-center text-[13px] text-stone-400" ]
            [ text
                (if List.isEmpty model.questions then
                    "No questions yet — add one or import a batch."

                 else
                    "No questions match this search or tag filter."
                )
            ]
        ]

    else
        List.map (questionCardView model) filtered


questionCardView : Model -> Question -> Html Msg
questionCardView model q =
    let
        isSel =
            Set.member q.id model.selected
    in
    div
        [ classList
            [ ( "px-4 py-3 flex gap-2.5 cursor-grab border-b border-stone-100 hover:bg-stone-50 active:cursor-grabbing", True )
            , ( "bg-teal-50", isSel )
            ]
        , draggable "true"
        , E.on "dragstart" (Decode.succeed (DragStartFromBank q.id))
        , E.on "dragend" (Decode.succeed DragEnd)
        ]
        [ input [ type_ "checkbox", checked isSel, onClick (ToggleSelect q.id) ] []
        , span [ class "text-stone-400 flex-shrink-0 mt-0.5" ] [ text "⠿" ]
        , div [ class "flex-1 min-w-0" ]
            [ if String.isEmpty q.category then
                text ""

              else
                div [ class "font-mono text-stone-500 text-[11px] truncate" ] [ text q.category ]
            , div [ class "text-[13px] text-stone-800 mt-0.5" ] [ text q.text ]
            , div [ class "flex flex-wrap gap-1 mt-1.5" ] (List.map tagPill q.tags)
            ]
        , div [ class "flex flex-col items-center gap-1.5 flex-shrink-0" ]
            [ span [ class "font-mono text-[11px] text-stone-400" ] [ text ("v" ++ String.fromInt q.version) ]
            , if List.isEmpty q.history then
                text ""

              else
                iconBtn "🕓" (OpenHistory q.id)
            , iconBtn "✎" (OpenEditFromBank q.id)
            , if model.pendingDeleteQ == Just q.id then
                span [ class "flex items-center gap-1" ]
                    [ dangerBtnXs "yes" (DeleteQuestion q.id)
                    , linkBtn "no" CancelDeleteQuestion
                    ]

              else
                iconBtnDanger "🗑" (AskDeleteQuestion q.id)
            ]
        ]



-- test builder panel


builderPanelView : Model -> Html Msg
builderPanelView model =
    section [ class "bg-white border border-stone-200 rounded-xl flex flex-col" ]
        [ div [ class "p-4 border-b border-stone-200 flex flex-col gap-2.5" ]
            [ div [ class "flex items-center justify-between gap-2.5 flex-wrap" ]
                [ h2 [ class "font-serif text-[15px] font-semibold" ] [ text "Test builder" ]
                , testActionsView model
                ]
            , testTabsView model
            , p [ class "text-[11px] text-stone-400 m-0" ]
                [ text "Double-click a test's name to rename it. Drag a question back onto the bank to remove it from the test." ]
            ]
        , div [ class "flex-1 overflow-y-auto max-h-screen p-4 flex flex-col gap-3.5" ] (testContentView model)
        ]


testActionsView : Model -> Html Msg
testActionsView model =
    div [ class "flex gap-2 flex-wrap" ]
        ((case findActiveTest model of
            Just t ->
                [ outlineBtnSmDisabled "Export JSON" False (ExportTest t.id) ]

            Nothing ->
                []
         )
            ++ [ primaryBtnSm "+ New test" AddTest ]
        )


testTabsView : Model -> Html Msg
testTabsView model =
    if List.isEmpty model.tests then
        text ""

    else
        div [ class "flex flex-wrap gap-1.5" ] (List.map (testTabView model) model.tests)


testTabView : Model -> Test -> Html Msg
testTabView model t =
    if model.renamingTestId == Just t.id then
        input
            [ class "text-[12px] px-2 py-1 border border-teal-700 rounded-md"
            , A.autofocus True
            , value t.name
            , onBlurWithValue (CommitRenameTest t.id)
            , onEnterWithValue (CommitRenameTest t.id)
            ]
            []

    else
        let
            isActive =
                model.activeTestId == Just t.id
        in
        span [ class "flex items-center" ]
            [ button
                [ classList
                    [ ( "font-mono text-[11px] px-2.5 py-1 rounded-full border cursor-pointer bg-stone-50 border-stone-200 text-stone-500", True )
                    , ( "bg-teal-700 text-white border-teal-700", isActive )
                    ]
                , onClick (SetActiveTest t.id)
                , E.onDoubleClick (StartRenameTest t.id)
                ]
                [ text t.name ]
            , if isActive then
                if model.pendingDeleteTest == Just t.id then
                    span [ class "flex items-center gap-1 ml-1" ]
                        [ dangerBtnXs "yes" (DeleteTest t.id)
                        , linkBtn "no" CancelDeleteTest
                        ]

                else
                    button [ class "bg-transparent border-none text-stone-400 cursor-pointer text-[13px] ml-1 px-0.5", onClick (AskDeleteTest t.id) ] [ text "×" ]

              else
                text ""
            ]


testContentView : Model -> List (Html Msg)
testContentView model =
    case findActiveTest model of
        Nothing ->
            [ div [ class "p-8 text-center text-[13px] text-stone-400" ]
                [ text "Create a test to start building — then drag questions in from the bank." ]
            ]

        Just t ->
            looseSectionView model t
                :: List.indexedMap (groupCardView model t) t.groups
                ++ [ button [ class "w-full p-2.5 rounded-md border border-dashed border-stone-300 bg-transparent text-stone-500 text-xs cursor-pointer hover:border-teal-700 hover:text-teal-700", onClick AddGroup ] [ text "+ Add group" ] ]


dropTargetAttrs : Slot -> List (Attribute Msg)
dropTargetAttrs slot =
    [ E.preventDefaultOn "dragover" (Decode.succeed ( NoOp, True ))
    , E.on "dragenter" (Decode.succeed (DragEnterTarget slot))
    , E.on "dragleave" (Decode.succeed DragLeaveTarget)
    , E.preventDefaultOn "drop" (Decode.succeed ( DropOnTarget slot Nothing, True ))
    ]


dropTargetClass : Slot -> String -> Model -> Attribute Msg
dropTargetClass slot baseClass model =
    classList
        [ ( baseClass, True )
        , ( "drop-target-active", model.dragOverTarget == Just slot )
        ]


looseSectionView : Model -> Test -> Html Msg
looseSectionView model t =
    let
        count =
            List.length t.looseQuestionIds
    in
    div (dropTargetClass Loose "border border-dashed border-stone-200 rounded-lg" model :: dropTargetAttrs Loose)
        [ div [ class "px-3.5 py-2 border-b border-stone-200 flex items-center gap-2" ]
            [ span [ class "text-[13px] font-semibold text-stone-500" ] [ text "Ungrouped questions" ]
            , span [ class "font-mono text-[11px] text-stone-400" ]
                [ text (String.fromInt count ++ " question" ++ pluralS count) ]
            ]
        , div [ class "p-2 flex flex-col gap-2 min-h-[50px]" ]
            ((if count == 0 then
                [ div [ class "p-2.5 text-center text-[11px] text-stone-400" ] [ text "drop questions here to add them without a group" ] ]

              else
                []
             )
                ++ List.map (\qid -> testRowView model qid Loose) t.looseQuestionIds
            )
        ]


groupCardView : Model -> Test -> Int -> Group -> Html Msg
groupCardView model t gi g =
    let
        isFirst =
            gi == 0

        isLast =
            gi == List.length t.groups - 1

        count =
            List.length g.questionIds
    in
    div (dropTargetClass (InGroup g.id) "border border-stone-200 rounded-lg" model :: dropTargetAttrs (InGroup g.id))
        [ div [ class "px-3.5 py-2 border-b border-stone-200 flex items-center gap-2" ]
            [ miniBtn "▲" isFirst (MoveGroup g.id -1)
            , miniBtn "▼" isLast (MoveGroup g.id 1)
            , input
                [ class "text-[13px] font-semibold border-none bg-transparent flex-1 min-w-0 px-1 py-0.5 rounded focus:outline-none focus:bg-stone-50"
                , value g.name
                , onBlurWithValue (CommitRenameGroup g.id)
                , onEnterWithValue (CommitRenameGroup g.id)
                ]
                []
            , span [ class "font-mono text-[11px] text-stone-400" ] [ text (String.fromInt count ++ " question" ++ pluralS count) ]
            , if model.pendingDeleteGroup == Just g.id then
                span [ class "flex items-center gap-1" ]
                    [ dangerBtnXs "yes" (DeleteGroup g.id)
                    , linkBtn "no" CancelDeleteGroup
                    ]

              else
                iconBtnDanger "🗑" (AskDeleteGroup g.id)
            ]
        , div [ class "p-2 flex flex-col gap-2 min-h-[50px]" ]
            ((if count == 0 then
                [ div [ class "p-2.5 text-center text-[11px] text-stone-400" ] [ text "drop questions here" ] ]

              else
                []
             )
                ++ List.map (\qid -> testRowView model qid (InGroup g.id)) g.questionIds
            )
        ]


pluralS : Int -> String
pluralS n =
    if n == 1 then
        ""

    else
        "s"


testRowView : Model -> String -> Slot -> Html Msg
testRowView model qid slot =
    case findQuestion model qid of
        Nothing ->
            text ""

        Just q ->
            div
                [ class "border border-stone-200 rounded-md p-2.5 bg-white cursor-grab hover:border-teal-200 active:cursor-grabbing"
                , draggable "true"
                , E.on "dragstart" (Decode.succeed (DragStartFromTest qid))
                , E.on "dragend" (Decode.succeed DragEnd)
                , E.preventDefaultOn "dragover" (Decode.succeed ( NoOp, True ))
                , E.custom "drop" (Decode.succeed { message = DropOnTarget slot (Just qid), stopPropagation = True, preventDefault = True })
                ]
                [ div [ class "flex items-start gap-2" ]
                    [ span [ class "text-stone-400 flex-shrink-0" ] [ text "⠿" ]
                    , div [ class "flex-1 min-w-0 flex flex-col gap-1" ]
                        ((if String.isEmpty q.category then
                            []

                          else
                            [ div [ class "font-mono text-stone-500 text-[11px] truncate" ] [ text q.category ] ]
                         )
                            ++ [ div [ class "text-[13px] text-stone-800" ] [ text q.text ]
                               , div [ class "text-[12px] flex gap-1.5 items-start text-emerald-700" ] [ text ("✓ " ++ q.correct.text) ]
                               ]
                            ++ List.map (\w -> div [ class "text-[12px] flex gap-1.5 items-start text-stone-500" ] [ text ("• " ++ w.text) ]) q.wrong
                        )
                    , div [ class "flex flex-col items-center gap-1.5 flex-shrink-0" ]
                        [ span [ class "font-mono text-[11px] text-stone-400" ] [ text ("v" ++ String.fromInt q.version) ]
                        , iconBtn "✎" (OpenEditFromTest qid slot)
                        , iconBtnDanger "🗑" (RemoveFromTest qid)
                        ]
                    ]
                ]



-- event decoder helpers


targetValueDecoder : Decoder String
targetValueDecoder =
    Decode.at [ "target", "value" ] Decode.string


onBlurWithValue : (String -> Msg) -> Attribute Msg
onBlurWithValue toMsg =
    E.on "blur" (Decode.map toMsg targetValueDecoder)


onEnterWithValue : (String -> Msg) -> Attribute Msg
onEnterWithValue toMsg =
    E.on "keydown"
        (Decode.field "key" Decode.string
            |> Decode.andThen
                (\key ->
                    if key == "Enter" then
                        Decode.map toMsg targetValueDecoder

                    else
                        Decode.fail "not enter"
                )
        )



-- modals


modalRootView : Model -> Html Msg
modalRootView model =
    div []
        ((case model.formMode of
            Just mode ->
                [ questionFormModalView model mode ]

            Nothing ->
                []
         )
            ++ (case model.pendingOverwrite of
                    Just pending ->
                        [ confirmOverwriteModalView pending ]

                    Nothing ->
                        []
               )
            ++ (case model.historyForId of
                    Just id ->
                        [ versionHistoryModalView model id ]

                    Nothing ->
                        []
               )
            ++ (if model.importOpen then
                    [ importModalView model ]

                else
                    []
               )
        )


modalOverlay : List (Html Msg) -> Html Msg
modalOverlay children =
    div [ class "fixed inset-0 bg-stone-900/40 flex items-center justify-center p-4 z-50" ] children


modalShell : String -> List (Html Msg) -> Html Msg
modalShell extraClass children =
    div [ class ("bg-white border border-stone-200 rounded-xl w-full max-h-screen overflow-y-auto " ++ extraClass) ] children


modalHeader : String -> Maybe Msg -> Html Msg
modalHeader title closeMsg =
    div [ class "px-5.5 py-4 border-b border-stone-200 flex items-center gap-2 justify-between sticky top-0 bg-white" ]
        [ h2 [ class "font-serif text-base m-0" ] [ text title ]
        , case closeMsg of
            Just msg ->
                iconBtn "✕" msg

            Nothing ->
                text ""
        ]


questionFormModalView : Model -> FormMode -> Html Msg
questionFormModalView model mode =
    let
        fs =
            Maybe.withDefault emptyFormState model.formState

        footer =
            case mode of
                EditMode ->
                    div [ class "flex flex-col gap-2" ]
                        [ p [ class "text-[11px] text-stone-400 m-0" ] [ text "Editing this version changes it everywhere it's used. Saving as a new version leaves other tests on the old one." ]
                        , div [ class "flex justify-end gap-2" ]
                            [ outlineBtn "Cancel" CloseForm
                            , primaryBtn "Save as new version" SaveAsNewVersion
                            , dangerOutlineBtn "Edit this version" SaveOverwrite
                            ]
                        ]

                AddMode ->
                    div [ class "flex justify-end gap-2" ]
                        [ outlineBtn "Cancel" CloseForm
                        , primaryBtn "Save" SaveNewQuestion
                        ]
    in
    modalOverlay
        [ modalShell "max-w-xl"
            [ modalHeader
                (case mode of
                    EditMode ->
                        "Edit question"

                    AddMode ->
                        "Add question"
                )
                (Just CloseForm)
            , div [ class "px-5.5 py-4 flex flex-col gap-3.5" ]
                ([ formField "Category"
                    [ formInput [ value fs.category, onInput FormSetCategory, placeholder "e.g. combined (offensive) — case study: ..." ] [] ]
                 , formField "Question"
                    [ formTextarea [ A.rows 3, value fs.text, onInput FormSetText ] [] ]
                 , div [ class "rounded-md p-2.5 flex flex-col gap-1.5 relative bg-emerald-50 border border-emerald-200" ]
                    [ label [ class "text-[11px] font-semibold uppercase tracking-wide text-emerald-700" ] [ text "Correct answer" ]
                    , formTextarea [ A.rows 2, value fs.correctText, onInput FormSetCorrectText, placeholder "Answer text" ] []
                    , formTextarea [ A.rows 2, value fs.correctJust, onInput FormSetCorrectJust, placeholder "Justification" ] []
                    ]
                 , div [ class "flex flex-col gap-1.5" ]
                    [ div [ class "flex items-center justify-between" ]
                        [ label [ class "text-[11px] font-semibold uppercase tracking-wide text-stone-500" ] [ text "Wrong answers" ]
                        , linkBtn "+ add" AddWrongRow
                        ]
                    , div [ class "flex flex-col gap-2" ] (List.indexedMap wrongAnswerView fs.wrong)
                    ]
                 , formField "Tags"
                    [ formInput [ class "font-mono", value fs.tagsInput, onInput FormSetTagsInput, placeholder "comma, separated, tags" ] [] ]
                 ]
                )
            , div [ class "px-5.5 py-3.5 border-t border-stone-200 sticky bottom-0 bg-white flex flex-col gap-2" ] [ footer ]
            ]
        ]


formField : String -> List (Html Msg) -> Html Msg
formField labelText children =
    div [ class "flex flex-col gap-1" ]
        (label [ class "text-[11px] font-semibold uppercase tracking-wide text-stone-500" ] [ text labelText ] :: children)


wrongAnswerView : Int -> Answer -> Html Msg
wrongAnswerView i w =
    div [ class "rounded-md p-2.5 flex flex-col gap-1.5 relative bg-rose-50 border border-rose-200" ]
        [ button [ class "bg-transparent border-none cursor-pointer text-stone-400 text-[13px] p-0.5 leading-none hover:text-rose-600 absolute top-1.5 right-1.5", onClick (RemoveWrongRow i) ] [ text "✕" ]
        , formTextarea [ A.rows 2, value w.text, onInput (FormSetWrongText i), placeholder "Answer text" ] []
        , formTextarea [ A.rows 2, value w.justification, onInput (FormSetWrongJust i), placeholder "Justification" ] []
        ]


confirmOverwriteModalView : PendingOverwrite -> Html Msg
confirmOverwriteModalView pending =
    modalOverlay
        [ modalShell "max-w-md"
            [ div [ class "px-5.5 py-4 border-b border-stone-200 flex items-center gap-2 justify-between sticky top-0 bg-white" ]
                [ span [ class "text-amber-800" ] [ text "⚠" ]
                , h2 [ class "font-serif text-base m-0 flex-1" ] [ text "This question is used elsewhere" ]
                ]
            , div [ class "px-5.5 py-4 flex flex-col gap-3.5" ]
                [ p [ class "m-0" ] [ text "Editing this version directly will change it everywhere it's referenced:" ]
                , Html.ul [ class "text-[13px] pl-4.5 m-0" ]
                    (List.map (\r -> Html.li [] [ text (r.testName ++ " — " ++ r.where_) ]) pending.refs)
                , p [ class "text-[11px] text-stone-400 m-0" ] [ text "If you only want this test to see the change, cancel and choose \"Save as new version\" instead." ]
                ]
            , div [ class "px-5.5 py-3.5 border-t border-stone-200 sticky bottom-0 bg-white" ]
                [ div [ class "flex justify-end gap-2" ]
                    [ outlineBtn "Cancel" CancelOverwrite
                    , button [ class (btnBase ++ " bg-rose-600 text-white border-rose-600 hover:bg-rose-700"), onClick ConfirmOverwrite ] [ text "Edit everywhere" ]
                    ]
                ]
            ]
        ]


versionHistoryModalView : Model -> String -> Html Msg
versionHistoryModalView model id =
    case findQuestion model id of
        Nothing ->
            text ""

        Just q ->
            let
                currentEntry =
                    { version = q.version, savedAt = q.updatedAt, text = q.text, correct = q.correct, current = True }

                pastEntries =
                    q.history |> List.map (\h -> { version = h.version, savedAt = h.savedAt, text = h.text, correct = h.correct, current = False })

                entries =
                    (currentEntry :: pastEntries) |> List.sortBy (\e -> negate e.version)
            in
            modalOverlay
                [ modalShell "max-w-md"
                    [ modalHeader "Version history" (Just CloseHistory)
                    , div [ class "px-5.5 py-4 flex flex-col gap-0" ] (List.map historyEntryView entries)
                    ]
                ]


historyEntryView : { version : Int, savedAt : Int, text : String, correct : Answer, current : Bool } -> Html Msg
historyEntryView e =
    div
        [ classList
            [ ( "border rounded-md p-2.5 mb-2.5", True )
            , ( "border-teal-200 bg-teal-50", e.current )
            , ( "border-stone-200", not e.current )
            ]
        ]
        [ div [ class "flex items-center justify-between text-[11px] text-stone-500" ]
            [ span [ class "font-mono" ] [ text ("v" ++ String.fromInt e.version ++ (if e.current then " (current)" else "")) ]
            , span [] [ text (formatTimestamp e.savedAt) ]
            ]
        , div [ class "text-[13px] text-stone-800 mt-0.5" ] [ text e.text ]
        , div [ class "text-[11px] text-emerald-700" ] [ text ("✓ " ++ e.correct.text) ]
        ]


formatTimestamp : Int -> String
formatTimestamp millis =
    if millis == 0 then
        ""

    else
        let
            posix =
                Time.millisToPosix millis

            pad n =
                String.padLeft 2 '0' (String.fromInt n)
        in
        String.fromInt (Time.toYear Time.utc posix)
            ++ "-"
            ++ pad (monthNumber (Time.toMonth Time.utc posix))
            ++ "-"
            ++ pad (Time.toDay Time.utc posix)
            ++ " "
            ++ pad (Time.toHour Time.utc posix)
            ++ ":"
            ++ pad (Time.toMinute Time.utc posix)
            ++ " UTC"


importModalView : Model -> Html Msg
importModalView model =
    modalOverlay
        [ modalShell "max-w-xl"
            [ modalHeader "Import questions (JSON)" (Just CloseImport)
            , div [ class "px-5.5 py-4 flex flex-col gap-3.5" ]
                ([ p [ class "text-[11px] text-stone-400 m-0" ]
                    [ text "Paste an array of questions in the category / question / answers / justification format. Tags come in empty — select the imported items in the bank and apply tags in bulk afterward." ]
                 , formTextarea
                    [ class "font-mono"
                    , A.rows 10
                    , onInput ImportInput
                    , placeholder "[ { \"category\": ..., \"question\": ..., \"answers\": {...}, \"justification\": {...} } ]"
                    , value model.importText
                    ]
                    []
                 ]
                    ++ (if String.isEmpty model.importError then
                            []

                        else
                            [ p [ class "text-rose-600 text-xs m-0" ] [ text model.importError ] ]
                       )
                )
            , div [ class "px-5.5 py-3.5 border-t border-stone-200 sticky bottom-0 bg-white" ]
                [ div [ class "flex justify-end gap-2" ]
                    [ outlineBtn "Cancel" CloseImport
                    , primaryBtn "Import" SubmitImport
                    ]
                ]
            ]
        ]
