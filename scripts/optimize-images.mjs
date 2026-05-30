#!/usr/bin/env node
/**
 * optimize-images — convert + compress raster images to WebP.
 *
 * Drop originals into `raw-images/<feature>/…` (mirrors `static/`), then run
 * `pnpm images`. Each image is resized (capped, never upscaled), re-encoded as
 * WebP, and written to the matching path under `static/`. The raw source is
 * deleted once converted (pass `--keep` to retain it).
 *
 * Examples:
 *   raw-images/shows/poster.png   ->  static/shows/poster.webp
 *   raw-images/bio/missy.jpg      ->  static/bio/missy.webp
 *
 * Flags:
 *   --keep            keep the raw source files instead of deleting them
 *   --quality=<1-100> WebP quality (default 80)
 *   --max-width=<px>  cap the longest edge width (default 2000)
 */
import { readdir, stat, mkdir, unlink, rmdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join, relative, dirname, extname, sep } from 'node:path';
import sharp from 'sharp';

const REPO_ROOT = fileURLToPath(new URL('..', import.meta.url));
const INPUT_DIR = join(REPO_ROOT, 'raw-images');
const OUTPUT_DIR = join(REPO_ROOT, 'static');
const CONVERTIBLE = new Set(['.png', '.jpg', '.jpeg', '.tif', '.tiff', '.webp']);

function parseFlags(argv) {
	const flags = { keep: false, quality: 80, maxWidth: 2000 };
	for (const arg of argv) {
		if (arg === '--keep') flags.keep = true;
		else if (arg.startsWith('--quality=')) flags.quality = Number(arg.slice(10));
		else if (arg.startsWith('--max-width=')) flags.maxWidth = Number(arg.slice(12));
	}
	return flags;
}

/** Recursively collect convertible image paths under `dir`. */
async function collectImages(dir) {
	let entries;
	try {
		entries = await readdir(dir, { withFileTypes: true });
	} catch (error) {
		if (error.code === 'ENOENT') return [];
		throw error;
	}
	const files = [];
	for (const entry of entries) {
		if (entry.name.startsWith('.')) continue;
		const full = join(dir, entry.name);
		if (entry.isDirectory()) {
			files.push(...(await collectImages(full)));
		} else if (CONVERTIBLE.has(extname(entry.name).toLowerCase())) {
			files.push(full);
		}
	}
	return files;
}

function formatKB(bytes) {
	return `${(bytes / 1024).toFixed(1)} KB`;
}

async function main() {
	const flags = parseFlags(process.argv.slice(2));
	if (!Number.isFinite(flags.quality) || flags.quality < 1 || flags.quality > 100) {
		console.error(`Invalid --quality (expected 1-100): ${flags.quality}`);
		process.exit(1);
	}

	const images = await collectImages(INPUT_DIR);
	if (images.length === 0) {
		console.log(
			`No images found in raw-images/.\n` +
				`Drop originals into raw-images/<feature>/ (mirrors static/), then re-run "pnpm images".`
		);
		return;
	}

	let totalIn = 0;
	let totalOut = 0;
	let converted = 0;

	for (const inputPath of images) {
		const rel = relative(INPUT_DIR, inputPath);
		const outRel = rel.slice(0, rel.length - extname(rel).length) + '.webp';
		const outputPath = join(OUTPUT_DIR, outRel);

		try {
			await mkdir(dirname(outputPath), { recursive: true });
			const inputBytes = (await stat(inputPath)).size;
			await sharp(inputPath)
				.rotate() // honor EXIF orientation, then drop the metadata
				.resize({ width: flags.maxWidth, withoutEnlargement: true })
				.webp({ quality: flags.quality })
				.toFile(outputPath);
			const outputBytes = (await stat(outputPath)).size;

			totalIn += inputBytes;
			totalOut += outputBytes;
			converted += 1;
			const pct = inputBytes > 0 ? Math.round((1 - outputBytes / inputBytes) * 100) : 0;
			console.log(
				`✓ ${rel} → static/${outRel.split(sep).join('/')}  ` +
					`(${formatKB(inputBytes)} → ${formatKB(outputBytes)}, -${pct}%)`
			);

			if (!flags.keep) await unlink(inputPath);
		} catch (error) {
			console.error(`✗ ${rel}: ${error instanceof Error ? error.message : error}`);
		}
	}

	if (!flags.keep) await pruneEmptyDirs(INPUT_DIR);

	const savedPct = totalIn > 0 ? Math.round((1 - totalOut / totalIn) * 100) : 0;
	console.log(
		`\nDone: ${converted}/${images.length} converted · ` +
			`${formatKB(totalIn)} → ${formatKB(totalOut)} (-${savedPct}%)` +
			`${flags.keep ? ' · originals kept' : ''}`
	);
}

/** Remove now-empty directories left behind under `dir` (but keep `dir` itself). */
async function pruneEmptyDirs(dir) {
	let entries;
	try {
		entries = await readdir(dir, { withFileTypes: true });
	} catch {
		return;
	}
	for (const entry of entries) {
		if (!entry.isDirectory()) continue;
		const full = join(dir, entry.name);
		await pruneEmptyDirs(full);
		try {
			await rmdir(full); // only succeeds when empty
		} catch {
			/* not empty — leave it */
		}
	}
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
