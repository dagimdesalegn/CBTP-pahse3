import { resolveStorageUrl } from '../src/utils/storageUrl.js'

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message)
  }
}

assert(resolveStorageUrl('/storage/products/item.jpg', '/api') === '/storage/products/item.jpg', 'same-origin API should keep storage URLs relative')
assert(resolveStorageUrl('/storage/products/item.jpg', '') === '/storage/products/item.jpg', 'empty API base should keep storage URLs relative')
assert(resolveStorageUrl('/storage/products/item.jpg', 'http://127.0.0.1:8000/api') === '/storage/products/item.jpg', 'localhost API base should not leak into production storage URLs')
assert(resolveStorageUrl('/storage/products/item.jpg', 'https://shemachoch.tech/api') === 'https://shemachoch.tech/storage/products/item.jpg', 'absolute API base should resolve storage origin')
assert(resolveStorageUrl('https://cdn.example.com/item.jpg', '/api') === 'https://cdn.example.com/item.jpg', 'absolute image URLs should be unchanged')

console.log('Storage image URLs resolve correctly.')
