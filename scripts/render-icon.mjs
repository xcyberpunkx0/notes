import sharp from "sharp";
await sharp("src/assets/brand/icon-source.svg")
  .resize(1024, 1024)
  .png()
  .toFile("src/assets/brand/icon-source.png");
console.log("wrote src/assets/brand/icon-source.png");
