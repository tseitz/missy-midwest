#!/usr/bin/env node
/**
 * optimize-images — convert + compress raster images to WebP, in place.
 *
 * Drop source images (.png/.jpg/.jpeg/.tif/.tiff) straight into the static/
 * folder where they belong (e.g. static/shop/classic-trucker.jpg), then run
 * `pnpm images`. Each is resized (capped, never upscaled), re-encoded as WebP
 * beside itself (classic-trucker.jpg -> classic-trucker.webp), and the original
 * source is removed (pass --keep to retain it).
 *
 * Output size is standardized per folder (see PRESETS — e.g. shop images cap at
 * 1400px) so a folder stays consistent no matter how large each source was.
 * --quality / --max-width override the preset.
 *
 * Existing .webp files are skipped by default. Pass --recompress (with an
 * explicit folder or file target, so you don't degrade unrelated images) to
 * re-encode webps in place — handy for shrinking an oversized export.
 *
 * A few "leave as authored" assets are skipped on a default whole-static run —
 * favicons and the press-kit / header / support / archive folders hold files
 * linked by exact name or distributed as PNG/JPG. Pass an explicit folder to
 * convert one of those on purpose:  pnpm images archive
 *
 * Usage:
 *   pnpm images                                   convert everything under static/ (minus SKIP)
 *   pnpm images shop                              convert only static/shop/ (SKIP ignored)
 *   pnpm images --keep shop                       ...and keep the source files
 *   pnpm images --recompress --max-width=1400 shop/lake-tank.webp   shrink one webp
 *
 * Flags:
 *   --recompress      also re-encode existing .webp files (requires a target)
 *   --keep            keep the source files instead of deleting them
 *   --quality=<1-100> WebP quality (overrides the folder preset)
 *   --max-width=<px>  cap the longest edge width (overrides the folder preset)
 */
import { readdir, stat, unlink, rename } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join, relative, extname, sep } from 'node:path';
import sharp from 'sharp';

const REPO_ROOT = fileURLToPath(new URL('..', import.meta.url));
const STATIC_DIR = join(REPO_ROOT, 'static');

// Raster source formats. .webp is added only under --recompress (it's the
// output format, so it's never touched on a normal run).
const RASTER = ['.png', '.jpg', '.jpeg', '.tif', '.tiff'];

// Static-relative paths left untouched on a default (whole-static) run: linked
// by exact name (favicons) or distributed as PNG/JPG (press kit, logos, QR,
// archive). Pass an explicit folder argument to convert one of these on purpose.
const SKIP = ['favicon.png', 'favicon_bak.png', 'press-kit', 'header', 'support', 'archive'];

// Per-feature output presets so every image in a folder lands at a consistent
// size regardless of how large the source was. CLI --quality / --max-width win.
const DEFAULT_PRESET = { maxWidth: 2000, quality: 80 };
const PRESETS = {
	shop: { maxWidth: 1200, quality: 74 } // product shots: card ~500px, detail ~700px
};

function presetFor(relPath) {
	return PRESETS[relPath.split('/')[0]] ?? DEFAULT_PRESET;
}

function parseFlags(argv) {
	const flags = { keep: false, recompress: false, quality: null, maxWidth: null, target: null };
	for (const arg of argv) {
		if (arg === '--keep') flags.keep = true;
		else if (arg === '--recompress') flags.recompress = true;
		else if (arg.startsWith('--quality=')) flags.quality = Number(arg.slice(10));
		else if (arg.startsWith('--max-width=')) flags.maxWidth = Number(arg.slice(12));
		else if (!arg.startsWith('--')) flags.target = arg;
	}
	return flags;
}

function isSkipped(relPath) {
	return SKIP.some((s) => relPath === s || relPath.startsWith(`${s}/`));
}

/** Recursively collect paths under `dir` whose extension is in `exts`. */
async function collectImages(dir, exts) {
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
			files.push(...(await collectImages(full, exts)));
		} else if (exts.has(extname(entry.name).toLowerCase())) {
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
	if (
		flags.quality !== null &&
		(!Number.isFinite(flags.quality) || flags.quality < 1 || flags.quality > 100)
	) {
		console.error(`Invalid --quality (expected 1-100): ${flags.quality}`);
		process.exit(1);
	}
	if (flags.recompress && !flags.target) {
		console.error(
			'--recompress needs an explicit folder or file target so it cannot degrade ' +
				'unrelated webps. e.g. pnpm images --recompress shop'
		);
		process.exit(1);
	}

	const exts = new Set(flags.recompress ? [...RASTER, '.webp'] : RASTER);
	const scoped = Boolean(flags.target);
	const scanRoot = scoped ? join(STATIC_DIR, flags.target.replace(/^static[\\/]/, '')) : STATIC_DIR;

	const rootStat = await stat(scanRoot).catch(() => null);
	const found = rootStat?.isFile()
		? exts.has(extname(scanRoot).toLowerCase())
			? [scanRoot]
			: []
		: await collectImages(scanRoot, exts);

	const images = [];
	let skipped = 0;
	for (const inputPath of found) {
		const rel = relative(STATIC_DIR, inputPath).split(sep).join('/');
		if (!scoped && isSkipped(rel)) {
			skipped += 1;
			continue;
		}
		images.push(inputPath);
	}

	const scanLabel = relative(REPO_ROOT, scanRoot).split(sep).join('/') || 'static';
	if (images.length === 0) {
		console.log(
			`No convertible images to process under ${scanLabel}.` +
				(skipped > 0 ? `  (${skipped} skipped by SKIP list)` : '') +
				`\nDrop .png/.jpg/.jpeg/.tif/.tiff files into static/<feature>/ and re-run "pnpm images".`
		);
		return;
	}

	let totalIn = 0;
	let totalOut = 0;
	let converted = 0;

	for (const inputPath of images) {
		const rel = relative(STATIC_DIR, inputPath).split(sep).join('/');
		const outputPath = `${inputPath.slice(0, inputPath.length - extname(inputPath).length)}.webp`;
		const outRel = `${rel.slice(0, rel.length - extname(rel).length)}.webp`;
		// CLI flags win, else the folder preset standardizes the output size.
		const preset = presetFor(rel);
		const quality = flags.quality ?? preset.quality;
		const maxWidth = flags.maxWidth ?? preset.maxWidth;
		// Write to a temp file then atomically rename — safe even when re-encoding
		// a webp in place (input and output share a path).
		const tmpPath = `${outputPath}.tmp`;
		try {
			const inputBytes = (await stat(inputPath)).size;
			await sharp(inputPath)
				.rotate() // honor EXIF orientation, then drop the metadata
				.resize({ width: maxWidth, withoutEnlargement: true })
				.webp({ quality })
				.toFile(tmpPath);
			await rename(tmpPath, outputPath);
			const outputBytes = (await stat(outputPath)).size;

			totalIn += inputBytes;
			totalOut += outputBytes;
			converted += 1;
			const pct = inputBytes > 0 ? Math.round((1 - outputBytes / inputBytes) * 100) : 0;
			console.log(
				`✓ static/${rel} → static/${outRel}  (${formatKB(inputBytes)} → ${formatKB(outputBytes)}, -${pct}%)`
			);

			if (!flags.keep && inputPath !== outputPath) await unlink(inputPath);
		} catch (error) {
			await unlink(tmpPath).catch(() => {});
			console.error(`✗ static/${rel}: ${error instanceof Error ? error.message : error}`);
		}
	}

	const savedPct = totalIn > 0 ? Math.round((1 - totalOut / totalIn) * 100) : 0;
	console.log(
		`\nDone: ${converted}/${images.length} processed · ` +
			`${formatKB(totalIn)} → ${formatKB(totalOut)} (-${savedPct}%)` +
			`${skipped > 0 ? ` · ${skipped} skipped` : ''}` +
			`${flags.keep ? ' · originals kept' : ''}`
	);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
