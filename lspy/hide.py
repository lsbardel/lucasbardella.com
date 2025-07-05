import base64
import codecs


def decode_hex(hex_str: str, encoding="utf-8") -> bytes:
    """Decode a hex string to bytes."""
    cleaned_hex = "".join(hex_str.split())
    db = codecs.decode(cleaned_hex, "hex")
    bits = [v for v in (d.strip() for d in db.decode(encoding).split("\n")) if v]
    b64 = base64.b64decode(bits[1].encode(encoding))
    return b64


def encode_hex(value: str, encoding="utf-8") -> str:
    """Encode a string to hex, split into two-digit chunks."""
    b64 = base64.b64encode(value.encode(encoding))
    tgt = codecs.encode(b64, "hex").decode("ascii")
    # Split into two-digit chunks
    return " ".join(tgt[i : i + 2] for i in range(0, len(tgt), 2))
