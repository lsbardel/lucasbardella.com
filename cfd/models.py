from __future__ import annotations

import json
import shutil
import zipfile
from io import BytesIO
from pathlib import Path

import humps
import numpy as np
from foamlib import FoamCase, FoamFile
from pydantic import BaseModel

CASE_DIR = Path(__file__).parent / "case"


class CFDModel(BaseModel):
    """Base class for CFD models."""
    delta_t: float = 0.005
    write_interval: int = 20

    @property
    def case_name(self) -> str:
        return humps.depascalize(self.__class__.__name__)

    @property
    def case_path(self) -> Path:
        return CASE_DIR / self.case_name

    def foam_case(self, clean: bool = False) -> FoamCase:
        """Create the case FoamCase object."""
        if clean:
            shutil.rmtree(self.case_path, ignore_errors=True)
        self.case_path.mkdir(parents=True, exist_ok=True)
        (self.case_path / "system").mkdir(exist_ok=True)
        (self.case_path / "constant").mkdir(exist_ok=True)
        (self.case_path / "0").mkdir(exist_ok=True)
        case = FoamCase(self.case_path)
        self.control_dict(case)
        self.fv_schemes(case)
        self.fv_solution(case)
        self.block_mesh_dict(case)
        self.transport_properties(case)
        self.momentum_transport_properties(case)
        self.initial_conditions(case)
        return case

    def mesh(self) -> Mesh:
        """Return the Mesh as pydantic object."""
        return Mesh.from_foam_path(self.case_path)

    def control_dict(self, case: FoamCase):
        """Write controlDict file."""

    def fv_schemes(self, case: FoamCase):
        """Write fvSchemes file."""

    def fv_solution(self, case: FoamCase):
        """Write fvSolution file."""

    def block_mesh_dict(self, case: FoamCase):
        """Write blockMeshDict file."""

    def transport_properties(self, case: FoamCase):
        """Write transportProperties file."""

    def momentum_transport_properties(self, case: FoamCase):
        """Write momentumTransportProperties file."""

    def initial_conditions(self, case: FoamCase):
        """Write initial condition files for U and p."""

    def get_cell_centres(self) -> np.ndarray:
        """Compute cell centres from the mesh geometry."""
        return self.foam_case()[0].cell_centers().internal_field  # type: ignore

    def get_fields(self) -> list[Fields]:
        """
        Export U and p fields at all written time steps to a JSON-serialisable dict.

        For each time step returns:
        - time: simulation time
        - U: list of [ux, uy] velocity vectors at each cell centre
        - p: list of pressure values at each cell centre
        """
        times = []
        for t in self.foam_case()[1:]:
            u_field = t["U"].internal_field
            p_field = t["p"].internal_field
            times.append(
                Fields(
                    time=t.time,
                    U=u_field.tolist(),  # type: ignore
                    p=p_field.tolist(),  # type: ignore
                )
            )
        return times

    def zip_data(self) -> bytes:
        """Export mesh and fields data as a zip file in memory."""
        buf = BytesIO()
        with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
            zf.writestr("mesh.json", self.mesh().model_dump_json())
            zf.writestr(
                "fields.json", json.dumps([f.model_dump() for f in self.get_fields()])
            )
        return buf.getvalue()


class Mesh(BaseModel):
    points: list[list[float]]  # list of [x, y, z] vertex coordinates
    faces: list[list[int]]  # list of face vertex-index lists
    boundary: dict  # dict of patch name -> {type, startFace, nFaces}
    centres: list[
        list[float]
    ]  # list of [x, y, z] cell centre coordinates (one per cell)

    @classmethod
    def from_foam_path(cls, path: Path) -> Mesh:
        """Create a Mesh object from a FoamCase."""
        mesh_path = path / "constant" / "polyMesh"
        point_file = FoamFile(mesh_path / "points")
        faces_file = FoamFile(mesh_path / "faces")
        boundary_file = FoamFile(mesh_path / "boundary")
        points = np.array(point_file[()], dtype=float)
        faces = [[int(i) for i in f] for f in faces_file[()]]  # type: ignore
        boundary = dict(boundary_file[()])  # type: ignore[arg-type]
        return cls(
            points=points.tolist(),
            faces=faces,
            boundary=boundary,
            centres=FoamCase(path)[0].cell_centers().internal_field.tolist(),
        )


class Fields(BaseModel):
    time: float
    U: list[list[float]]  # list of [ux, uy] velocity vectors at each cell centre
    p: list[float]  # list of pressure values at each cell centre
