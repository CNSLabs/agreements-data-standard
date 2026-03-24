import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const specs = [
  {
    dir: "schemas/core",
    name: "@agreements-standard/core",
    version: "1.1.0-draft.0",
    primary: "agreement.schema.json",
    mode: "schema",
    deps: []
  },
  {
    dir: "schemas/profiles/evm",
    name: "@agreements-standard/profile-evm",
    version: "1.0.0-draft.0",
    primary: "agreement.schema.json",
    mode: "schema",
    deps: ["@agreements-standard/core"]
  },
  {
    dir: "schemas/profiles/vc",
    name: "@agreements-standard/profile-vc",
    version: "1.0.0-draft.0",
    primary: "agreement-envelope.schema.json",
    mode: "schema",
    deps: ["@agreements-standard/core"]
  },
  {
    dir: "schemas/profiles/eip712",
    name: "@agreements-standard/profile-eip712",
    version: "1.0.0-draft.0",
    primary: "agreement.schema.json",
    mode: "schema",
    deps: ["@agreements-standard/core"]
  },
  {
    dir: "schemas/compositions/evm-eip712",
    name: "@agreements-standard/composition-evm-eip712",
    version: "1.0.0-draft.0",
    primary: "agreement.schema.json",
    mode: "schema",
    deps: [
      "@agreements-standard/core",
      "@agreements-standard/profile-evm",
      "@agreements-standard/profile-eip712"
    ]
  },
  {
    dir: "schemas/compositions/vc-eip712",
    name: "@agreements-standard/composition-vc-eip712",
    version: "1.0.0-draft.0",
    primary: "agreement-envelope.schema.json",
    mode: "schema",
    deps: [
      "@agreements-standard/core",
      "@agreements-standard/profile-vc",
      "@agreements-standard/profile-eip712"
    ]
  },
  {
    dir: "schemas/compositions/evm-vc-eip712",
    name: "@agreements-standard/composition-evm-vc-eip712",
    version: "1.0.0-draft.0",
    primary: "agreement-envelope.schema.json",
    mode: "schema",
    deps: [
      "@agreements-standard/composition-evm-eip712",
      "@agreements-standard/composition-vc-eip712"
    ]
  },
  {
    dir: "templates",
    name: "@agreements-standard/fixtures",
    version: "1.0.0-draft.0",
    primary: "fixtures.manifest.json",
    mode: "fixtures",
    deps: [
      "@agreements-standard/core",
      "@agreements-standard/profile-evm",
      "@agreements-standard/profile-vc",
      "@agreements-standard/profile-eip712",
      "@agreements-standard/composition-evm-eip712",
      "@agreements-standard/composition-vc-eip712",
      "@agreements-standard/composition-evm-vc-eip712"
    ]
  }
];

const versionByName = Object.fromEntries(specs.map((spec) => [spec.name, spec.version]));

const errors = [];
let checkedFiles = 0;

function readJson(relativePath) {
  const absolutePath = path.join(rootDir, relativePath);
  return JSON.parse(fs.readFileSync(absolutePath, "utf8"));
}

function exists(relativePath) {
  return fs.existsSync(path.join(rootDir, relativePath));
}

function toPosix(relativePath) {
  return relativePath.split(path.sep).join("/");
}

function walk(dirPath, files = []) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      walk(entryPath, files);
      continue;
    }
    files.push(entryPath);
  }
  return files;
}

function listCanonicalFiles(spec) {
  const absoluteDir = path.join(rootDir, spec.dir);
  if (spec.mode === "schema") {
    return walk(absoluteDir)
      .filter((filePath) => filePath.endsWith(".schema.json"))
      .map((filePath) => toPosix(path.relative(absoluteDir, filePath)))
      .sort();
  }

  return ["core", "profiles", "compositions"]
    .flatMap((subdir) => {
      const absoluteSubdir = path.join(absoluteDir, subdir);
      return walk(absoluteSubdir)
        .filter((filePath) => filePath.endsWith(".json"))
        .map((filePath) => toPosix(path.relative(absoluteDir, filePath)));
    })
    .sort();
}

function assert(condition, message) {
  if (!condition) {
    errors.push(message);
  }
}

const rootPackage = readJson("package.json");
const expectedWorkspaces = specs.map((spec) => spec.dir).sort();
const actualWorkspaces = [...(rootPackage.workspaces || [])].sort();
assert(
  JSON.stringify(actualWorkspaces) === JSON.stringify(expectedWorkspaces),
  `Root workspaces do not match expected module directories.\nExpected: ${expectedWorkspaces.join(", ")}\nActual: ${actualWorkspaces.join(", ")}`
);

for (const spec of specs) {
  const packageJsonPath = `${spec.dir}/package.json`;
  assert(exists(packageJsonPath), `Missing package manifest: ${packageJsonPath}`);
  if (!exists(packageJsonPath)) {
    continue;
  }

  const pkg = readJson(packageJsonPath);
  assert(pkg.name === spec.name, `Package ${packageJsonPath} has name ${pkg.name}; expected ${spec.name}`);
  assert(pkg.version === spec.version, `Package ${pkg.name} has version ${pkg.version}; expected ${spec.version}`);
  assert(typeof pkg.exports === "object" && pkg.exports !== null, `Package ${pkg.name} must define exports`);
  assert(pkg.exports["."] === `./${spec.primary}`, `Package ${pkg.name} must map "." to "./${spec.primary}"`);
  assert(pkg.exports[`./${spec.primary}`] === `./${spec.primary}`, `Package ${pkg.name} must export "./${spec.primary}"`);
  assert(pkg.exports["./package.json"] === "./package.json", `Package ${pkg.name} must export its package.json`);

  const expectedDependencies = Object.fromEntries(spec.deps.map((name) => [name, versionByName[name]]));
  const actualDependencies = pkg.dependencies || {};
  assert(
    JSON.stringify(actualDependencies) === JSON.stringify(expectedDependencies),
    `Package ${pkg.name} dependencies do not match expected dependency matrix`
  );

  const canonicalFiles = listCanonicalFiles(spec);
  for (const relativeFile of canonicalFiles) {
    const exportKey = `./${relativeFile}`;
    assert(pkg.exports[exportKey] === `./${relativeFile}`, `Package ${pkg.name} is missing export "${exportKey}"`);
    assert(exists(`${spec.dir}/${relativeFile}`), `Package ${pkg.name} export target does not exist: ${relativeFile}`);
    checkedFiles += 1;
  }

  for (const [exportKey, exportTarget] of Object.entries(pkg.exports)) {
    assert(typeof exportTarget === "string", `Package ${pkg.name} export ${exportKey} must map to a string target`);
    if (typeof exportTarget !== "string") {
      continue;
    }
    assert(exportTarget.startsWith("./"), `Package ${pkg.name} export ${exportKey} must stay within the package`);
    assert(exists(path.posix.join(spec.dir, exportTarget.slice(2))), `Package ${pkg.name} export target is missing: ${exportTarget}`);
  }
}

const fixturesManifest = readJson("templates/fixtures.manifest.json");
const fixturePaths = fixturesManifest.fixtures.map((fixture) => fixture.path.replace(/^\.\//, "")).sort();
const expectedFixturePaths = listCanonicalFiles(specs.find((spec) => spec.name === "@agreements-standard/fixtures")).sort();
assert(
  JSON.stringify(fixturePaths) === JSON.stringify(expectedFixturePaths),
  "templates/fixtures.manifest.json does not match the canonical fixtures package exports"
);

if (errors.length > 0) {
  console.error("Module verification failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`Verified ${specs.length} workspace modules and ${checkedFiles} exported canonical files.`);
