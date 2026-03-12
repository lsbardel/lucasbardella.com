import numpy as np
from foamlib import Dimensioned, DimensionSet, FoamCase

from .models import CFDModel


class Cavity(CFDModel):
    nu: float = 0.01
    end_time: float = 1.0
    n_cells: int = 50

    @property
    def case_name(self) -> str:
        return super().case_name + f"_{int(1/self.nu)}"

    def control_dict(self, case: FoamCase) -> None:
        with case.control_dict as f:
            f["application"] = "icoFoam"
            f["startFrom"] = "startTime"
            f["startTime"] = 0
            f["stopAt"] = "endTime"
            f["endTime"] = self.end_time
            f["deltaT"] = self.delta_t
            f["writeControl"] = "timeStep"
            f["writeInterval"] = self.write_interval
            f["purgeWrite"] = 0
            f["writeFormat"] = "ascii"
            f["writePrecision"] = 6
            f["writeCompression"] = False
            f["timeFormat"] = "general"
            f["timePrecision"] = 6
            f["runTimeModifiable"] = False

    def fv_schemes(self, case: FoamCase) -> None:
        """
        Numerical discretisation schemes.

        - ddtSchemes: time derivative — Euler (first-order implicit)
        - gradSchemes: gradient — Gauss linear (second-order)
        - divSchemes: divergence for convection — Gauss linearUpwind (bounded)
        - laplacianSchemes: diffusion — Gauss linear corrected (second-order)
        - interpolationSchemes: face interpolation — linear
        - snGradSchemes: surface-normal gradient — corrected
        """
        with case.fv_schemes as f:
            f["ddtSchemes"] = {"default": "Euler"}
            f["gradSchemes"] = {"default": ("Gauss", "linear")}
            f["divSchemes"] = {
                "default": "none",
                "div(phi,U)": ("Gauss", "linearUpwind", "grad(U)"),
            }
            f["laplacianSchemes"] = {"default": ("Gauss", "linear", "corrected")}
            f["interpolationSchemes"] = {"default": "linear"}
            f["snGradSchemes"] = {"default": "corrected"}

    def fv_solution(self, case: FoamCase) -> None:
        """
        Linear solvers and pressure-velocity coupling.

        - p/pFinal: pressure solved with PCG (conjugate gradient) + DIC preconditioner.
          pFinal uses relTol=0 to converge fully on the last corrector step.
        - U: velocity solved with smoothSolver + symGaussSeidel smoother.
        - PISO: 2 correctors per time step (standard for cavity), no non-orthogonal
          corrections needed for a structured mesh.
        """
        with case.fv_solution as f:
            f["solvers"] = {
                "p": {
                    "solver": "PCG",
                    "preconditioner": "DIC",
                    "tolerance": 1e-6,
                    "relTol": 0.05,
                },
                "pFinal": {
                    "solver": "PCG",
                    "preconditioner": "DIC",
                    "tolerance": 1e-6,
                    "relTol": 0,
                },
                "U": {
                    "solver": "smoothSolver",
                    "smoother": "symGaussSeidel",
                    "tolerance": 1e-5,
                    "relTol": 0,
                },
            }
            f["PISO"] = {
                "nCorrectors": 2,
                "nNonOrthogonalCorrectors": 0,
                "pRefCell": 0,
                "pRefValue": 0,
            }

    def block_mesh_dict(self, case: FoamCase) -> None:
        """
        Mesh definition for the unit-square cavity.

        Vertices define a 1×1×0.1 box. The small depth (0.1) with a single
        cell layer and 'empty' front/back patches makes it effectively 2D.

        Patches:
        - movingWall: top face (y=1), lid moves at U=(1,0,0)
        - fixedWalls: left, right, and bottom faces — no-slip
        - frontAndBack: z-faces — empty (2D treatment)
        """
        n = self.n_cells
        with case.block_mesh_dict as f:
            f["scale"] = 1
            f["vertices"] = [
                [0, 0, 0],
                [1, 0, 0],
                [1, 1, 0],
                [0, 1, 0],
                [0, 0, 0.1],
                [1, 0, 0.1],
                [1, 1, 0.1],
                [0, 1, 0.1],
            ]
            f["blocks"] = [
                "hex",
                [0, 1, 2, 3, 4, 5, 6, 7],
                [n, n, 1],
                "simpleGrading",
                [1, 1, 1],
            ]
            f["edges"] = []
            f["boundary"] = [
                ("movingWall", {"type": "wall", "faces": [[3, 7, 6, 2]]}),
                (
                    "fixedWalls",
                    {
                        "type": "wall",
                        "faces": [[0, 4, 7, 3], [2, 6, 5, 1], [1, 5, 4, 0]],
                    },
                ),
                (
                    "frontAndBack",
                    {
                        "type": "empty",
                        "faces": [[0, 3, 2, 1], [4, 5, 6, 7]],
                    },
                ),
            ]
            f["mergePatchPairs"] = []

    def transport_properties(self, case: FoamCase) -> None:
        """
        Physical fluid properties.

        nu is the kinematic viscosity [m²/s]. With the default lid velocity U=1
        and cavity size L=1, Re = U·L/nu = 1/0.01 = 100.
        """
        with case.transport_properties as f:
            f["nu"] = Dimensioned(self.nu, DimensionSet(length=2, time=-1), "nu")

    def initial_conditions(self, case: FoamCase) -> None:
        """
        Initial and boundary conditions at t=0.

        U (velocity) [m/s]:
        - movingWall: lid moves at (1, 0, 0)
        - fixedWalls: no-slip (zero velocity)
        - frontAndBack: empty (2D)
        - internal field: zero (fluid at rest initially)

        p (kinematic pressure = p/rho) [m²/s²]:
        - all walls: zeroGradient (no pressure BC needed for closed cavity)
        - internal field: zero
        """
        with case[0]["U"] as f:
            f.dimensions = DimensionSet(length=1, time=-1)
            f.internal_field = np.zeros(3)
            f["boundaryField"] = {
                "movingWall": {"type": "fixedValue", "value": [1, 0, 0]},
                "fixedWalls": {"type": "noSlip"},
                "frontAndBack": {"type": "empty"},
            }

        with case[0]["p"] as f:
            f.dimensions = DimensionSet(length=2, time=-2)
            f.internal_field = 0
            f["boundaryField"] = {
                "movingWall": {"type": "zeroGradient"},
                "fixedWalls": {"type": "zeroGradient"},
                "frontAndBack": {"type": "empty"},
            }
