import { readFileSync, renameSync, writeFileSync } from "node:fs";
import { join, parse } from "node:path";
import { cwd } from "node:process";
import ResEdit from "resedit";
import pkgJson from "../package.json" assert { type: "json" };

function windowsPostBuild(output) {
	const exe = ResEdit.NtExecutable.from(readFileSync(output));
	const res = ResEdit.NtExecutableResource.from(exe);
	const iconFile = ResEdit.Data.IconFile.from(
		readFileSync(join(cwd(), "./assets/icon.ico"))
	);

	ResEdit.Resource.IconGroupEntry.replaceIconsForResource(
		res.entries,
		1,
		1033,
		iconFile.icons.map(item => item.data)
	);

	const vi = ResEdit.Resource.VersionInfo.fromEntries(res.entries)[0];

	vi.setStringValues(
		{ lang: 1033, codepage: 1200 },
		{
			ProductName: "vRYjs",
			FileDescription: "VALORANT Rank Yoinker JS",
			CompanyName: "vRYjs",
			LegalCopyright: `vRYjs 2023`,
		}
	);
	vi.removeStringValue({ lang: 1033, codepage: 1200 }, "OriginalFilename");
	vi.removeStringValue({ lang: 1033, codepage: 1200 }, "InternalName");
	vi.setFileVersion(1, 0, 0, 1033);
	vi.setProductVersion(1, 0, 0, 1033);
	vi.outputToResourceEntries(res.entries);
	res.outputResource(exe);

	writeFileSync(output, Buffer.from(exe.generate()));

	const out = parse(output);
	renameSync(
		output,
		join(out.dir, `${out.name}-v${pkgJson.version}${out.ext}`)
	);
}

windowsPostBuild("./bin/vRYjs.exe");
