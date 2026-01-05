import {PlayerId, Scenario} from "./scenario";
import { buildMapRegionDef} from "../map/region/state/region.state";

export const scenario1: Scenario = {
  turn: 1,
  playersAttributes: {
    'PLAYER_1': {
      color: '#cdef12'
    },
    'PLAYER_2': {
      color: '#123456'
    }
  },
  neighbours: [
    new Set(['Podlaskie', 'Mazowieckie']),
    new Set(['Podlaskie', 'Lubelskie']),
    new Set(['Podlaskie', 'Warmińsko Mazurskie']),
    new Set(['Podlaskie', 'Suwalskie']),
    new Set(['Lubelskie', 'Mazowieckie']),
    new Set(['Łódzkie', 'Mazowieckie']),
    new Set(['Łódzkie', 'Lubelskie']),
    new Set(['Mazowieckie', 'Warmińsko Mazurskie']),
    new Set(['Warmińsko Mazurskie', 'Suwalskie']),
    new Set(['Wielkopolskie', 'Łódzkie']),
    new Set(['Wielkopolskie', 'Warmińsko Mazurskie']),
    new Set(['Wielkopolskie', 'Mazowieckie']),
  ]
}
