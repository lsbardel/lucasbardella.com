"""
Turbulent backward-facing step case definition using foamlib.

Geometry from the OpenFOAM v13 tutorial:
  https://doc.cfd.direct/openfoam/user-guide-v13/backwardstep

The domain is a 2-D channel with an abrupt expansion (step) at x=0:
  - Inlet channel:  x ∈ [-20.6, 0] mm,  y ∈ [0, 25.4] mm
  - Full channel:   x ∈ [0, 290] mm,    y ∈ [-25.4, 25.4] mm
  - Depth (z):      1 mm  (empty front/back → 2-D treatment)

Reynolds number:  Re = U·H / ν = 10 × 0.0254 / 1e-5 ≈ 25 400  (turbulent)
Solver:           simpleFoam (steady-state SIMPLEC)
Turbulence:       k-ε RAS

Run this module to (re)generate the case directory:

    uv run --extra cfd python -m cfd.backward_step
"""

from foamlib import Dimensioned, DimensionSet, FoamCase

from .models import CFDModel

# Geometry (metres)
X0 = -0.0206  # inlet face
X1 = 0.0  # step location
X2 = 0.2540  # intermediate x split
X3 = 0.2900  # outlet
Y_BOT = -0.0254  # channel floor (downstream of step)
Y_MID = 0.0  # step height / inlet floor
Y_TOP = 0.0254  # channel ceiling
Z_BACK = -0.0005
Z_FRONT = 0.0005

# Mesh grading: refine toward walls in y
NEG_Y_GRAD = 4.0  # coarse→fine toward lower wall
POS_Y_GRAD = 0.25  # fine→coarse away from upper wall (1/NEG_Y_GRAD)


class BackwardStep(CFDModel):
    """Turbulent backward-facing step case."""

    u_inlet: float = 10.0  # inlet mean velocity [m/s]
    nu: float = 1e-5  # kinematic viscosity [m²/s]
    end_time: int = 2000  # max iterations
    write_interval: int = 100  # write every N steps
    # turbulence init (k-ε, 5% intensity, mixing length = step height / 10)
    k_init: float = 0.375  # [m²/s²]
    epsilon_init: float = 14.855  # [m²/s³]
    omega_init: float = 440.2  # [1/s] (for kOmega* alternatives)

    # ------------------------------------------------------------------
    def control_dict(self, case: FoamCase) -> None:
        with case.control_dict as f:
            f["application"] = "simpleFoam"
            f["startFrom"] = "startTime"
            f["startTime"] = 0
            f["stopAt"] = "endTime"
            f["endTime"] = self.end_time
            f["deltaT"] = 1
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
        with case.fv_schemes as f:
            f["ddtSchemes"] = {"default": "steadyState"}
            f["gradSchemes"] = {
                "default": ("Gauss", "linear"),
                "grad(U)": ("cellLimited", "Gauss", "linear", 1),
            }
            f["divSchemes"] = {
                "default": "none",
                "div(phi,U)": ("bounded", "Gauss", "linearUpwind", "grad(U)"),
                "div(phi,k)": ("bounded", "Gauss", "linearUpwind", "grad(k)"),
                "div(phi,epsilon)": (
                    "bounded",
                    "Gauss",
                    "linearUpwind",
                    "grad(epsilon)",
                ),
                "div((nuEff*dev2(T(grad(U)))))": ("Gauss", "linear"),
            }
            f["laplacianSchemes"] = {"default": ("Gauss", "linear", "corrected")}
            f["interpolationSchemes"] = {"default": "linear"}
            f["snGradSchemes"] = {"default": "corrected"}

    def fv_solution(self, case: FoamCase) -> None:
        with case.fv_solution as f:
            f["solvers"] = {
                "p": {
                    "solver": "GAMG",
                    "smoother": "GaussSeidel",
                    "tolerance": 1e-7,
                    "relTol": 0.01,
                },
                "U": {
                    "solver": "smoothSolver",
                    "smoother": "symGaussSeidel",
                    "tolerance": 1e-7,
                    "relTol": 0.1,
                },
                "k": {
                    "solver": "smoothSolver",
                    "smoother": "symGaussSeidel",
                    "tolerance": 1e-7,
                    "relTol": 0.1,
                },
                "epsilon": {
                    "solver": "smoothSolver",
                    "smoother": "symGaussSeidel",
                    "tolerance": 1e-7,
                    "relTol": 0.1,
                },
            }
            f["SIMPLE"] = {
                "consistent": True,
                "nNonOrthogonalCorrectors": 0,
                "residualControl": {
                    "p": 1e-4,
                    "U": 1e-4,
                    "k": 1e-4,
                    "epsilon": 1e-4,
                },
            }
            f["relaxationFactors"] = {
                "equations": {
                    "U": 0.9,
                    "k": 0.9,
                    "epsilon": 0.9,
                }
            }

    def block_mesh_dict(self, case: FoamCase) -> None:
        """
        Five-block structured mesh for the backward-facing step.

        Vertex layout (front plane, z = Z_FRONT):
          v0  (X0, Y_MID)  — inlet bottom-left
          v1  (X0, Y_TOP)  — inlet top-left
          v2  (X1, Y_MID)  — step corner (inlet bottom-right = step top)
          v3  (X1, Y_TOP)  — inlet top-right
          v4  (X1, Y_BOT)  — step bottom
          v5  (X2, Y_BOT)  — intermediate lower
          v6  (X2, Y_MID)  — intermediate mid
          v7  (X2, Y_TOP)  — intermediate upper
          v8  (X3, Y_BOT)  — outlet lower
          v9  (X3, Y_MID)  — outlet mid
          v10 (X3, Y_TOP)  — outlet upper

        Back plane (z = Z_BACK) has the same layout as v11..v21.

        Blocks (hex, front then back vertex indices):
          0  inlet upper:          v0 v2 v3 v1 | v11 v13 v14 v12   18×30×1
          1  mid downstream lower: v4 v5 v6 v2 | v15 v16 v17 v13   180×27×1
          2  mid downstream upper: v2 v6 v7 v3 | v13 v17 v18 v14   180×30×1
            (note: X1→X2, so v2→v6)
          Wait — need to re-index for foamlib hex format [front4, back4]

        Patches:
          inlet     — left face of block 0
          outlet    — right faces of blocks 3 & 4 (far downstream)
          upperWall — top faces of blocks 0, 2, 4
          lowerWall — bottom face of step (x=X1 from Y_BOT to Y_MID) + bottom
                      faces of blocks 1 & 3
          frontAndBack — empty (2-D)
        """
        s = 0.001  # scale: mm → m
        # All coordinates in mm for readability, scale applied via "scale"
        verts_mm = [
            # front plane (z = +0.5)
            [X0 / s, Y_MID / s, 0.5],  # 0
            [X0 / s, Y_TOP / s, 0.5],  # 1
            [X1 / s, Y_MID / s, 0.5],  # 2
            [X1 / s, Y_TOP / s, 0.5],  # 3
            [X1 / s, Y_BOT / s, 0.5],  # 4
            [X2 / s, Y_BOT / s, 0.5],  # 5
            [X2 / s, Y_MID / s, 0.5],  # 6
            [X2 / s, Y_TOP / s, 0.5],  # 7
            [X3 / s, Y_BOT / s, 0.5],  # 8
            [X3 / s, Y_MID / s, 0.5],  # 9
            [X3 / s, Y_TOP / s, 0.5],  # 10
            # back plane (z = -0.5)
            [X0 / s, Y_MID / s, -0.5],  # 11
            [X0 / s, Y_TOP / s, -0.5],  # 12
            [X1 / s, Y_MID / s, -0.5],  # 13
            [X1 / s, Y_TOP / s, -0.5],  # 14
            [X1 / s, Y_BOT / s, -0.5],  # 15
            [X2 / s, Y_BOT / s, -0.5],  # 16
            [X2 / s, Y_MID / s, -0.5],  # 17
            [X2 / s, Y_TOP / s, -0.5],  # 18
            [X3 / s, Y_BOT / s, -0.5],  # 19
            [X3 / s, Y_MID / s, -0.5],  # 20
            [X3 / s, Y_TOP / s, -0.5],  # 21
        ]

        # y-grading: NEG_Y_GRAD refines toward lower wall, POS_Y_GRAD toward upper wall
        ng = NEG_Y_GRAD
        pg = POS_Y_GRAD

        blocks = [
            # Block 0: inlet upper  [x: X0→X1, y: Y_MID→Y_TOP]
            # hex vertices: front(0→2→3→1), back(11→13→14→12)
            (
                "hex",
                [0, 2, 3, 1, 11, 13, 14, 12],
                [18, 30, 1],
                "simpleGrading",
                [1, pg, 1],
            ),
            # Block 1: mid downstream lower  [x: X1→X2, y: Y_BOT→Y_MID]
            # hex vertices: front(4→5→6→2), back(15→16→17→13)
            (
                "hex",
                [4, 5, 6, 2, 15, 16, 17, 13],
                [180, 27, 1],
                "simpleGrading",
                [1, ng, 1],
            ),
            # Block 2: mid downstream upper  [x: X1→X2, y: Y_MID→Y_TOP]
            # hex vertices: front(2→6→7→3), back(13→17→18→14)
            (
                "hex",
                [2, 6, 7, 3, 13, 17, 18, 14],
                [180, 30, 1],
                "simpleGrading",
                [1, pg, 1],
            ),
            # Block 3: far downstream lower  [x: X2→X3, y: Y_BOT→Y_MID]
            # hex vertices: front(5→8→9→6), back(16→19→20→17)
            (
                "hex",
                [5, 8, 9, 6, 16, 19, 20, 17],
                [25, 27, 1],
                "simpleGrading",
                [1, ng, 1],
            ),
            # Block 4: far downstream upper  [x: X2→X3, y: Y_MID→Y_TOP]
            # hex vertices: front(6→9→10→7), back(17→20→21→18)
            (
                "hex",
                [6, 9, 10, 7, 17, 20, 21, 18],
                [25, 30, 1],
                "simpleGrading",
                [1, pg, 1],
            ),
        ]

        with case.block_mesh_dict as f:
            f["scale"] = s
            f["vertices"] = verts_mm
            f["blocks"] = blocks
            f["edges"] = []
            f["boundary"] = [
                (
                    "inlet",
                    {
                        "type": "patch",
                        "faces": [[1, 0, 11, 12]],
                    },
                ),
                (
                    "outlet",
                    {
                        "type": "patch",
                        "faces": [
                            [8, 19, 20, 9],  # block 3 right
                            [9, 20, 21, 10],  # block 4 right
                        ],
                    },
                ),
                (
                    "upperWall",
                    {
                        "type": "wall",
                        "faces": [
                            [1, 12, 14, 3],  # block 0 top
                            [3, 14, 18, 7],  # block 2 top
                            [7, 18, 21, 10],  # block 4 top
                        ],
                    },
                ),
                (
                    "lowerWall",
                    {
                        "type": "wall",
                        "faces": [
                            [0, 2, 13, 11],  # inlet floor (block 0 bottom)
                            [2, 4, 15, 13],  # step vertical face
                            [4, 5, 16, 15],  # block 1 bottom (mid downstream)
                            [5, 8, 19, 16],  # block 3 bottom (far downstream)
                        ],
                    },
                ),
                (
                    "frontAndBack",
                    {
                        "type": "empty",
                        "faces": [
                            # front (z=+0.5): each block's front face
                            [0, 1, 3, 2],
                            [4, 2, 6, 5],
                            [2, 3, 7, 6],
                            [5, 6, 9, 8],
                            [6, 7, 10, 9],
                            # back (z=-0.5): same blocks reversed
                            [11, 13, 14, 12],
                            [15, 17, 16, 13][::1],
                            [13, 18, 17, 14][::1],
                            [16, 20, 19, 17][::1],
                            [17, 21, 20, 18][::1],
                        ],
                    },
                ),
            ]
            f["mergePatchPairs"] = []

    def momentum_transport(self, case: FoamCase) -> None:
        """k-ε RAS turbulence model."""
        with case["constant"]["momentumTransport"] as f:
            f["simulationType"] = "RAS"
            f["RAS"] = {
                "model": "kEpsilon",
                "turbulence": "on",
                "printCoeffs": "on",
            }

    def transport_properties(self, case: FoamCase) -> None:
        with case["constant"]["transportProperties"] as f:
            f["viscosityModel"] = "Newtonian"
            f["nu"] = Dimensioned(self.nu, DimensionSet(length=2, time=-1), "nu")

    def initial_conditions(self, case: FoamCase) -> None:
        """Boundary and initial conditions at t=0."""
        u_in = self.u_inlet
        k0 = self.k_init
        eps0 = self.epsilon_init

        # Velocity
        with case[0]["U"] as f:
            f.dimensions = DimensionSet(length=1, time=-1)
            f.internal_field = [u_in, 0.0, 0.0]
            f["boundaryField"] = {
                "inlet": {
                    "type": "flowRateInletVelocity",
                    "meanVelocity": u_in,
                    "value": [u_in, 0.0, 0.0],
                },
                "outlet": {"type": "zeroGradient"},
                "upperWall": {"type": "noSlip"},
                "lowerWall": {"type": "noSlip"},
                "frontAndBack": {"type": "empty"},
            }

        # Pressure (kinematic)
        with case[0]["p"] as f:
            f.dimensions = DimensionSet(length=2, time=-2)
            f.internal_field = 0.0
            f["boundaryField"] = {
                "inlet": {"type": "zeroGradient"},
                "outlet": {"type": "fixedValue", "value": 0.0},
                "upperWall": {"type": "zeroGradient"},
                "lowerWall": {"type": "zeroGradient"},
                "frontAndBack": {"type": "empty"},
            }

        # Turbulent kinetic energy k
        with case[0]["k"] as f:
            f.dimensions = DimensionSet(length=2, time=-2)
            f.internal_field = k0
            f["boundaryField"] = {
                "inlet": {"type": "fixedValue", "value": k0},
                "outlet": {"type": "zeroGradient"},
                "upperWall": {"type": "kqRWallFunction", "value": k0},
                "lowerWall": {"type": "kqRWallFunction", "value": k0},
                "frontAndBack": {"type": "empty"},
            }

        # Turbulent dissipation rate epsilon
        with case[0]["epsilon"] as f:
            f.dimensions = DimensionSet(length=2, time=-3)
            f.internal_field = eps0
            f["boundaryField"] = {
                "inlet": {"type": "fixedValue", "value": eps0},
                "outlet": {"type": "zeroGradient"},
                "upperWall": {"type": "epsilonWallFunction", "value": eps0},
                "lowerWall": {"type": "epsilonWallFunction", "value": eps0},
                "frontAndBack": {"type": "empty"},
            }

        # Turbulent viscosity nut
        with case[0]["nut"] as f:
            f.dimensions = DimensionSet(length=2, time=-1)
            f.internal_field = 0.0
            f["boundaryField"] = {
                "inlet": {"type": "calculated", "value": 0.0},
                "outlet": {"type": "calculated", "value": 0.0},
                "upperWall": {"type": "nutkWallFunction", "value": 0.0},
                "lowerWall": {"type": "nutkWallFunction", "value": 0.0},
                "frontAndBack": {"type": "empty"},
            }
