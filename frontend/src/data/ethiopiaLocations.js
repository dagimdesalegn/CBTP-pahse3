export const ethiopiaLocations = [
  {
    region: 'Addis Ababa',
    cities: [
      {
        name: 'Addis Ababa',
        woredas: [
          { name: 'Addis Ketema', kebeles: ['01', '02', '03', '04'] },
          { name: 'Akaky Kaliti', kebeles: ['01', '02', '03', '04'] },
          { name: 'Arada', kebeles: ['01', '02', '03', '04'] },
          { name: 'Bole', kebeles: ['01', '02', '03', '04', '05'] },
          { name: 'Gullele', kebeles: ['01', '02', '03'] },
          { name: 'Kirkos', kebeles: ['01', '02', '03', '04'] },
          { name: 'Kolfe Keranio', kebeles: ['01', '02', '03', '04'] },
          { name: 'Lemi Kura', kebeles: ['01', '02', '03'] },
          { name: 'Lideta', kebeles: ['01', '02', '03'] },
          { name: 'Nifas Silk-Lafto', kebeles: ['01', '02', '03', '04'] },
          { name: 'Yeka', kebeles: ['01', '02', '03', '04'] },
        ],
      },
    ],
  },
  {
    region: 'Oromia',
    cities: [
      {
        name: 'Adama',
        woredas: [
          { name: 'Adama Town', kebeles: ['01', '02', '03', '04'] },
          { name: 'Adama Rural', kebeles: ['Boku', 'Dabe', 'Geda'] },
        ],
      },
      {
        name: 'Jimma',
        woredas: [
          { name: 'Jimma Town', kebeles: ['Bosa Addis', 'Hermata', 'Mentina'] },
          { name: 'Mana', kebeles: ['Bilida', 'Yebu', 'Sombo'] },
        ],
      },
      {
        name: 'Bishoftu',
        woredas: [
          { name: 'Bishoftu Town', kebeles: ['01', '02', 'Babogaya'] },
          { name: 'Ada’a', kebeles: ['Denkaka', 'Godino', 'Ude'] },
        ],
      },
    ],
  },
  {
    region: 'Amhara',
    cities: [
      {
        name: 'Bahir Dar',
        woredas: [
          { name: 'Bahir Dar City', kebeles: ['01', '02', '03', '04'] },
          { name: 'Bahir Dar Zuria', kebeles: ['Meshenti', 'Sebatamit', 'Yigoma'] },
        ],
      },
      {
        name: 'Gondar',
        woredas: [
          { name: 'Gondar City', kebeles: ['Azezo', 'Maraki', 'Piassa'] },
          { name: 'Gondar Zuria', kebeles: ['Degoma', 'Teda', 'Tseda'] },
        ],
      },
    ],
  },
  {
    region: 'Tigray',
    cities: [
      {
        name: 'Mekelle',
        woredas: [
          { name: 'Mekelle City', kebeles: ['Adi Haki', 'Ayder', 'Hadnet'] },
          { name: 'Enderta', kebeles: ['May Mekden', 'Quiha', 'Romanat'] },
        ],
      },
    ],
  },
  {
    region: 'Sidama',
    cities: [
      {
        name: 'Hawassa',
        woredas: [
          { name: 'Hawassa City', kebeles: ['Addis Ketema', 'Tabor', 'Tula'] },
          { name: 'Hawassa Zuria', kebeles: ['Dore Bafeno', 'Finchawa', 'Wondo Genet'] },
        ],
      },
    ],
  },
  {
    region: 'SNNPR',
    cities: [
      {
        name: 'Wolaita Sodo',
        woredas: [
          { name: 'Sodo Town', kebeles: ['Arada', 'Merkato', 'Selam'] },
          { name: 'Sodo Zuria', kebeles: ['Humbo', 'Wadu', 'Waraza'] },
        ],
      },
      {
        name: 'Arba Minch',
        woredas: [
          { name: 'Arba Minch Town', kebeles: ['Sikela', 'Secha', 'Shecha'] },
          { name: 'Arba Minch Zuria', kebeles: ['Chano', 'Lante', 'Sile'] },
        ],
      },
    ],
  },
]

const normalize = (value = '') => value.toLowerCase().trim()
const matches = (value, query) => normalize(value).includes(normalize(query))
const unique = (values) => [...new Set(values.filter(Boolean))]

export function getRegionSuggestions(query = '') {
  return ethiopiaLocations
    .map(location => location.region)
    .filter(region => matches(region, query))
}

export function getCitySuggestions(region = '', query = '') {
  return unique(
    ethiopiaLocations
      .filter(location => !region || matches(location.region, region))
      .flatMap(location => location.cities.map(city => city.name))
  ).filter(city => matches(city, query))
}

export function getWoredaSuggestions(region = '', city = '', query = '') {
  return unique(
    ethiopiaLocations
      .filter(location => !region || matches(location.region, region))
      .flatMap(location => location.cities)
      .filter(locationCity => !city || matches(locationCity.name, city))
      .flatMap(locationCity => locationCity.woredas.map(woreda => woreda.name))
  ).filter(woreda => matches(woreda, query))
}

export function getKebeleSuggestions(region = '', city = '', woredaSubcity = '', query = '') {
  return unique(
    ethiopiaLocations
      .filter(location => !region || matches(location.region, region))
      .flatMap(location => location.cities)
      .filter(locationCity => !city || matches(locationCity.name, city))
      .flatMap(locationCity => locationCity.woredas)
      .filter(woreda => !woredaSubcity || matches(woreda.name, woredaSubcity))
      .flatMap(woreda => woreda.kebeles)
  ).filter(kebele => matches(kebele, query))
}
