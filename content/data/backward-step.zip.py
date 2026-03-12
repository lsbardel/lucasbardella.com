import sys

from cfd.backward_step import BackwardStep

if __name__ == "__main__":
    sys.stdout.buffer.write(BackwardStep().zip_data())
