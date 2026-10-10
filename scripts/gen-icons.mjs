import sharp from 'sharp'

const src = process.argv[2] ?? 'ion-source.png' // 元の画像の場所を引数で渡す

await sharp(src).resize(192, 192).toFile('public/icons/icon-192.png')
await sharp(src).resize(512, 512).toFile('public/icons/icon-512.png')

console.log('Icons generated!')
