import sharp from 'sharp'

const src = '（手元のフォルダ）'

await sharp(src).resize(192, 192).toFile('public/icons/icon-192.png')
await sharp(src).resize(512, 512).toFile('public/icons/icon-512.png')

console.log('Icons generated!')
