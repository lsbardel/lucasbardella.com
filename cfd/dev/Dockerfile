FROM microfluidica/openfoam:2512

COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

WORKDIR /project

COPY pyproject.toml uv.lock ./

RUN uv sync --extra cfd --no-install-project --frozen

ENV PATH="/project/.venv/bin:$PATH"

WORKDIR /workspace
