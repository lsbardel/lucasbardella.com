import pytest

from cfd.cavity import Cavity


@pytest.fixture
def cavity() -> Cavity:
    return Cavity()


def test_cavity_cell_centers(cavity: Cavity):
    centers = cavity.get_cell_centres()
    assert centers.shape == (2500, 3)


def test_cavity_mesh(cavity: Cavity):
    mesh = cavity.mesh()
    data = mesh.model_dump()
    assert len(data) == 4


def test_binary_export(cavity: Cavity):
    zip_data = cavity.zip_data()
    assert isinstance(zip_data, bytes)
