FROM cfd

WORKDIR /project
RUN uv sync --extra cfd --extra dev --no-install-project
WORKDIR /workspace
