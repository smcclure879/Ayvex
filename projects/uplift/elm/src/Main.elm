module Main exposing (..)

import Browser
import Browser.Events as EV exposing (onClick, onKeyPress, onKeyDown, onKeyUp)
import Html exposing (..)
import Json.Decode as D
import Json.Encode as E


type alias Log =
    String

append : Log -> String -> Log
append log x =
       log ++ x

type alias Model =
    { status : String, log : Log }


init : () -> ( Model, Cmd Msg )
init _ =
    ( {status="initialValue",log="initialLog"}
    , Cmd.none
    )


view : Model -> Html Msg
view model =
    div []
        [ text (.log model)]


type Msg
    = LogEntry String
    | CharacterKey Char
    | ControlKey String
    | MouseClick


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        LogEntry l ->
            ( { model | log
            =           (append model.log l) }
            , Cmd.none
            )
        CharacterKey c ->
            ( { model  |  log
            =             (append (.log model) (String.fromChar c))}
            , Cmd.none
            )             

        -- CharacterKey 'd' ->
        --    ( model - 1, Cmd.none )

        -- MouseClick ->
        --    ( model + 5, Cmd.none )

        _ ->
            ( model, Cmd.none )


subscriptions : Model -> Sub Msg
subscriptions _ =
    Sub.batch
        [ onKeyDown (keyDispatcher "-down\n")
        , onKeyUp (keyDispatcher "-up\n")
        , onClick (D.succeed MouseClick)
        ]

keyDispatcher : String -> D.Decoder Msg
keyDispatcher label =
    -- label ++
    --(D.field "key" D.string)
    --Debug.toString 
    label
    --|> D.succeed 
    |> toOtherMsg
    |> D.succeed 

    -- map toOtherMsg label
    --(D.value "blue" D.string)
    --Debug.toString

toOtherMsg : String -> Msg
toOtherMsg s =
    LogEntry s

--        (\x -> label ++ (toKey x))
--        (D.field "key" D.string)
    -- label ++ ( D.value |> Debug.toString |> toKey )
    -- D.map toKey ( label ++ (Debug.toString) )
    




-- keyDecoder : D.Decoder Msg
-- keyDecoder =
--    D.map toKey (D.field "key" D.string)


-- toKey : String -> Msg
-- toKey keyValue =
    -- case String.uncons keyValue of
    --     Just ( char, "" ) ->
    --         CharacterKey char
    --     _ ->
    --         ControlKey keyValue




main : Program () Model Msg
main =
    Browser.element
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }



