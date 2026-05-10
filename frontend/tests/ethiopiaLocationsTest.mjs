import {
  ethiopiaLocations,
  getCitySuggestions,
  getKebeleSuggestions,
  getRegionSuggestions,
  getWoredaSuggestions,
} from '../src/data/ethiopiaLocations.js'

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message)
  }
}

assert(Array.isArray(ethiopiaLocations), 'locations should be an array')
assert(ethiopiaLocations.length >= 5, 'locations should include a starter set of regions')
assert(getRegionSuggestions('or').includes('Oromia'), 'region suggestions should match typed input')
assert(getCitySuggestions('Oromia', 'ad').includes('Adama'), 'city suggestions should depend on region')
assert(getWoredaSuggestions('Addis Ababa', 'Addis Ababa', 'bole').includes('Bole'), 'woreda suggestions should depend on region and city')
assert(getKebeleSuggestions('Addis Ababa', 'Addis Ababa', 'Bole', '0').includes('03'), 'kebele suggestions should depend on upstream fields')

console.log('Ethiopia location suggestions are shaped correctly.')
