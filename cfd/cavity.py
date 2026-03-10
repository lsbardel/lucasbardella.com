from foamlib import FoamCase

case = FoamCase("./cavity")

# ✅ Named property — transportProperties has a shortcut
with case.transport_properties as f:
    f["nu"] = 0.01

# ✅ Same pattern for controlDict
with case.control_dict as f:
    f["endTime"] = 2.0
    f["writeInterval"] = 20

# ✅ For arbitrary files that don't have a named shortcut, use .file()
with case.file("constant/transportProperties") as f:
    f["nu"] = 0.01
