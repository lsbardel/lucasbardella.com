import codecs
import base64

hex_string = """
77
65
6C
63
6F
6D
65
20
74
6F
20
74
68
65
20
61
6E
65
72
61
20
20
20
20
0A
0A
50
4F
48
73
31
30
44
78
68
2F
57
69
6B
48
69
77
6A
70
56
37
46
59
41
66
34
37
4D
6C
50
54
54
6A
77
52
79
57
49
37
77
53
6D
74
6D
56
49
70
38
79
45
70
5A
54
57
49
69
4F
2B
51
62
52
47
5A
70
41
6E
4C
46
2F
63
53
44
75
51
47
67
64
4C
30
47
65
2B
64
31
30
67
51
3D
3D
"""

def decode_hex(hex_str: str, encoding="utf-8") -> str:
    """Decode a hex string to bytes."""
    cleaned_hex = "".join(hex_string.split())
    db = codecs.decode(cleaned_hex, 'hex')
    bits = [v for v in (d.strip() for d in db.decode(encoding).split("\n")) if v]
    b64 = base64.b64decode(bits[1].encode(encoding))
    return b64


if __name__ == "__main__":
    print(decode_hex(hex_string))
