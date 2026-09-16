import { access, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";


const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const sourceDir = path.join(projectRoot, "输入");
const targetDir = path.join(
  projectRoot,
  "src",
  "content",
  "entries",
  "ai-assisted-personal-website",
);

const force = process.argv.includes("--force");

const images = [
  { source: "Cover.png", target: "cover.webp", width: 1600 },
  { source: "V1 1.png", target: "v1-1.webp", width: 1600 },
  { source: "V1 2.png", target: "v1-2.webp", width: 1600 },
  { source: "V1 3.png", target: "v1-3.webp", width: 1600 },
  { source: "V2.png", target: "v2.webp", width: 1600 },
  { source: "V3.png", target: "v3.webp", width: 1600 },
];

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

await mkdir(targetDir, { recursive: true });

for (const image of images) {
  const sourcePath = path.join(sourceDir, image.source);
  const targetPath = path.join(targetDir, image.target);

  if (!(await exists(sourcePath))) {
    console.log(`[prepare-images] skip missing source: ${image.source}`);
    continue;
  }

  if (!force && (await exists(targetPath))) {
    console.log(`[prepare-images] skip existing target: ${image.target}`);
    continue;
  }

  const { default: sharp } = await import("sharp");

  await sharp(sourcePath)
    .rotate()
    .resize({ width: image.width, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(targetPath);

  console.log(`[prepare-images] wrote ${image.target}`);
}
