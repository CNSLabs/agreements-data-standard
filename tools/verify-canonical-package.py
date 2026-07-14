#!/usr/bin/env python3
"""Dependency-free verifier for the IP-005 canonical package reference vector.

This intentionally does not import the TypeScript compiler or any Ethereum
library. It provides a second-language reproduction of the canonical bytes and
legacy Keccak-256 digest used by the EVM profile.
"""

from __future__ import annotations

import argparse
import copy
import hashlib
import json
from pathlib import Path
from typing import Any


MASK_64 = (1 << 64) - 1
ROTATION_OFFSETS = (
    (0, 36, 3, 41, 18),
    (1, 44, 10, 45, 2),
    (62, 6, 43, 15, 61),
    (28, 55, 25, 21, 56),
    (27, 20, 39, 8, 14),
)
ROUND_CONSTANTS = (
    0x0000000000000001,
    0x0000000000008082,
    0x800000000000808A,
    0x8000000080008000,
    0x000000000000808B,
    0x0000000080000001,
    0x8000000080008081,
    0x8000000000008009,
    0x000000000000008A,
    0x0000000000000088,
    0x0000000080008009,
    0x000000008000000A,
    0x000000008000808B,
    0x800000000000008B,
    0x8000000000008089,
    0x8000000000008003,
    0x8000000000008002,
    0x8000000000000080,
    0x000000000000800A,
    0x800000008000000A,
    0x8000000080008081,
    0x8000000000008080,
    0x0000000080000001,
    0x8000000080008008,
)


def rotate_left(value: int, shift: int) -> int:
    if shift == 0:
        return value
    return ((value << shift) | (value >> (64 - shift))) & MASK_64


def keccak_f1600(state: list[int]) -> None:
    for round_constant in ROUND_CONSTANTS:
        columns = [
            state[x] ^ state[x + 5] ^ state[x + 10] ^ state[x + 15] ^ state[x + 20]
            for x in range(5)
        ]
        deltas = [columns[(x - 1) % 5] ^ rotate_left(columns[(x + 1) % 5], 1) for x in range(5)]
        for x in range(5):
            for y in range(5):
                state[x + 5 * y] ^= deltas[x]

        rotated = [0] * 25
        for x in range(5):
            for y in range(5):
                rotated[y + 5 * ((2 * x + 3 * y) % 5)] = rotate_left(
                    state[x + 5 * y], ROTATION_OFFSETS[x][y]
                )

        for x in range(5):
            for y in range(5):
                state[x + 5 * y] = (
                    rotated[x + 5 * y]
                    ^ ((~rotated[(x + 1) % 5 + 5 * y]) & rotated[(x + 2) % 5 + 5 * y])
                ) & MASK_64

        state[0] ^= round_constant


def keccak_256(payload: bytes) -> bytes:
    rate = 136
    padded = bytearray(payload)
    padded.append(0x01)  # Keccak domain separator (not FIPS SHA3's 0x06).
    padded.extend(b"\x00" * ((rate - (len(padded) % rate)) % rate))
    padded[-1] |= 0x80

    state = [0] * 25
    for offset in range(0, len(padded), rate):
        block = padded[offset : offset + rate]
        for lane in range(rate // 8):
            state[lane] ^= int.from_bytes(block[lane * 8 : lane * 8 + 8], "little")
        keccak_f1600(state)

    output = bytearray()
    while len(output) < 32:
        for lane in range(rate // 8):
            output.extend(state[lane].to_bytes(8, "little"))
            if len(output) >= 32:
                return bytes(output[:32])
        keccak_f1600(state)
    return bytes(output[:32])


def utf16_sort_key(value: str) -> bytes:
    return value.encode("utf-16-be", "surrogatepass")


def canonicalize(value: Any) -> str:
    if value is None:
        return "null"
    if value is True:
        return "true"
    if value is False:
        return "false"
    if isinstance(value, str):
        # ensure_ascii=False matches JSON.stringify for scalar Unicode values.
        value.encode("utf-8")  # Reject unpaired surrogates.
        return json.dumps(value, ensure_ascii=False, separators=(",", ":"))
    if isinstance(value, int):
        if abs(value) > 9_007_199_254_740_991:
            raise ValueError("JSON integer exceeds the ECMAScript safe-integer range")
        return str(value)
    if isinstance(value, float):
        raise ValueError("This dependency-free proof verifier rejects JSON floats")
    if isinstance(value, list):
        return "[" + ",".join(canonicalize(item) for item in value) + "]"
    if isinstance(value, dict):
        if not all(isinstance(key, str) for key in value):
            raise ValueError("JSON object keys must be strings")
        entries = []
        for key in sorted(value, key=utf16_sort_key):
            entries.append(f"{canonicalize(key)}:{canonicalize(value[key])}")
        return "{" + ",".join(entries) + "}"
    raise ValueError(f"Unsupported JSON value: {type(value).__name__}")


def reject_duplicate_keys(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for key, value in pairs:
        if key in result:
            raise ValueError(f"Duplicate JSON object key: {key}")
        result[key] = value
    return result


def digest_package(package: Any) -> tuple[bytes, str]:
    canonical_bytes = canonicalize(package).encode("utf-8")
    return canonical_bytes, "0x" + keccak_256(canonical_bytes).hex()


def mutation_digests(package: dict[str, Any]) -> dict[str, str]:
    mutations: dict[str, dict[str, Any]] = {}

    prose = copy.deepcopy(package)
    prose["agreement"]["content"]["data"] += "\nAmended."
    mutations["prose"] = prose

    execution = copy.deepcopy(package)
    execution["agreement"]["execution"]["states"]["SETTLED"]["name"] = "Paid"
    mutations["executionPolicy"] = execution

    initialization = copy.deepcopy(package)
    initialization["initialization"]["values"]["amount"] = "1000001"
    mutations["initialization"] = initialization

    target = copy.deepcopy(package)
    target["target"]["chainId"] = "84532"
    mutations["targetChain"] = target

    return {name: digest_package(value)[1] for name, value in mutations.items()}


def main() -> int:
    default_vector = Path(__file__).resolve().parents[1] / "test-vectors/canonical-package-v0/reference-package.json"
    parser = argparse.ArgumentParser()
    parser.add_argument("package", nargs="?", type=Path, default=default_vector)
    parser.add_argument("--expected", type=Path)
    args = parser.parse_args()

    expected_path = args.expected or args.package.with_name("reference-package.expected.json")
    source_bytes = args.package.read_bytes()
    package = json.loads(source_bytes, object_pairs_hook=reject_duplicate_keys)
    expected = json.loads(expected_path.read_text(encoding="utf-8"))
    canonical_bytes, package_digest = digest_package(package)

    # Protect the independent Keccak implementation against SHA3 confusion.
    empty_digest = keccak_256(b"").hex()
    if empty_digest != "c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470":
        raise AssertionError("Keccak-256 self-test failed")

    result = {
        "verifier": "python-stdlib-independent-ip005-0.1",
        "source": args.package.name,
        "sourceSha256": hashlib.sha256(source_bytes).hexdigest(),
        "canonicalUtf8Length": len(canonical_bytes),
        "packageDigest": package_digest,
        "mutations": mutation_digests(package),
    }

    for field in ("sourceSha256", "canonicalUtf8Length", "packageDigest"):
        if result[field] != expected[field]:
            raise AssertionError(f"{field} mismatch: {result[field]} != {expected[field]}")
    if any(digest == package_digest for digest in result["mutations"].values()):
        raise AssertionError("A semantic mutation did not change the package digest")

    print(json.dumps(result, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
