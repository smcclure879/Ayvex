module TrySignal exposing (..)

import Mouse
import Signal exposing (map2)
import Graphics.Element exposing (Element, show)

combine x y = show (x, y)

main : Signal Element
main =
  map2 combine Mouse.x Mouse.y