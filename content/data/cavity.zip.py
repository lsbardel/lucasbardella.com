import sys

from cfd.cavity import Cavity

if __name__ == "__main__":
    sys.stdout.buffer.write(Cavity().zip_data())
