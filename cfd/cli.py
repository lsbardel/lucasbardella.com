import click

from .cavity import Cavity
from .models import CFDModel


def cases_map() -> dict[str, CFDModel]:
    cases = {}
    for test_case in (Cavity(end_time=5), Cavity(end_time=25, nu=0.001)):
        cases[test_case.case_name] = test_case
    return cases


@click.command()
@click.option(
    "--case",
    "-c",
    type=click.Choice(cases_map()),
    help="Name of the case to run. If not specified, runs the default case.",
)
def cli(case: str | None = None):
    all_cases = cases_map()
    if case is None:
        cases = tuple(all_cases)
    else:
        cases = (case,)
    for case_name in cases:
        case = all_cases[case_name]
        case.foam_case(clean=True).run()
        case.export_results()


if __name__ == "__main__":
    cli()
