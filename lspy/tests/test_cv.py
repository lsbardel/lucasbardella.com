import pytest

from lspy import cv


@pytest.fixture(scope="module")
def sections() -> dict[str, list[cv.Entry]]:
    return cv.parse(cv.CV_MARKDOWN.read_text())


def find(entries: list[cv.Entry], organisation: str) -> cv.Entry:
    for entry in entries:
        if entry.organisation == organisation:
            return entry
    raise AssertionError(f"no entry for {organisation}")


@pytest.mark.parametrize(
    "dates, expected, note",
    [
        ("October 2023 - July 2025", "Oct 2023 - Jul 2025", ""),
        ("April 2009 – March 2014", "Apr 2009 - Mar 2014", ""),
        ("1985 - 1990", "1985 - 1990", ""),
        (
            "November 2008 - Present (Intermittent Consulting Engagements)",
            "Nov 2008 - Present",
            "Intermittent Consulting Engagements",
        ),
    ],
)
def test_short_dates(dates: str, expected: str, note: str):
    assert cv.short_dates(dates) == (expected, note)


@pytest.mark.parametrize(
    "location, expected",
    [
        ("London, UK", "London"),
        ("London UK", "London"),
        ("Lugano, Switzerland", "Lugano"),
        ("Turin, Italy", "Turin"),
        ("Adria - Italy", "Adria"),
    ],
)
def test_short_location(location: str, expected: str):
    assert cv.short_location(location) == expected


@pytest.mark.parametrize(
    "heading, title, organisation",
    [
        ("Owner - [Quantmind](https://quantmind.com)", "Owner", "Quantmind"),
        (
            "Director - Quantitative Analyst - [Citi](https://citi.com)",
            "Director - Quantitative Analyst",
            "Citi",
        ),
        (
            "[Imperial College London](https://imperial.ac.uk)",
            "",
            "Imperial College London",
        ),
        ("Strategist - JWM Partners", "Strategist", "JWM Partners"),
    ],
)
def test_split_heading(heading: str, title: str, organisation: str):
    assert cv.split_heading(heading) == (title, organisation)


@pytest.mark.parametrize(
    "text, expected",
    [
        # inline markup is flattened, print carries no emphasis and no links
        ("**bold** text", "bold text"),
        ("[Citi](https://citi.com)", "Citi"),
        ("[thesis](/phd-thesis.pdf)", "thesis"),
        ("see [what I'm working on now](/now).", "see what I'm working on now."),
        ("cash & derivatives", r"cash \& derivatives"),
        ("over 80% of liquidity", r"over 80\% of liquidity"),
        ("**Coding**: Rust<br>", "Coding: Rust"),
        ("1996 – 2000", "1996 -- 2000"),
    ],
)
def test_md_to_tex(text: str, expected: str):
    assert cv.md_to_tex(text) == expected


def test_work_entry(sections: dict[str, list[cv.Entry]]):
    entry = find(sections["Work Experience"], "Quantmind")
    assert entry.title == "Owner"
    assert entry.dates == "Nov 2008 - Present"
    assert entry.note == "Intermittent Consulting Engagements"
    assert entry.location == "London"
    assert dict(entry.meta)["Technologies"].startswith("Rust, Python, TypeScript")


def test_title_containing_a_separator(sections: dict[str, list[cv.Entry]]):
    entry = find(sections["Work Experience"], "Citi")
    assert entry.title == "Director - Quantitative Analyst"
    assert entry.dates == "Apr 2009 - Mar 2014"


def test_dates_are_chronological(sections: dict[str, list[cv.Entry]]):
    """The hand written LaTeX had a reversed range, guard against it coming back."""
    for entry in sections["Work Experience"] + sections["Education"]:
        start, _, end = entry.dates.partition(" - ")
        if end and end != "Present":
            assert int(start[-4:]) <= int(end[-4:]), entry.organisation


def test_education_entry(sections: dict[str, list[cv.Entry]]):
    entry = find(sections["Education"], "Imperial College London")
    assert entry.title == "PhD"
    assert entry.dates == "1996 - 2000"
    assert "Rolls-Royce" in entry.body[0]
    assert r"\cvevent{1996 - 2000}{PhD}{Imperial College London}{London}" in (
        cv.render_entry(entry)
    )


def test_entry_without_a_title_leads_with_the_organisation():
    """A heading carrying no qualification must not emit an empty first field."""
    entry = cv.Entry(
        organisation="Politecnico di Torino",
        dates="1990 - 1995",
        location="Turin",
        body=["Five year degree in Aeronautical Engineering."],
    )
    assert r"\cvevent{1990 - 1995}{Politecnico di Torino}{}{Turin}" in cv.render_entry(
        entry
    )


def test_every_entry_is_complete(sections: dict[str, list[cv.Entry]]):
    for entries in sections.values():
        assert entries
        for entry in entries:
            assert entry.organisation
            assert entry.dates
            assert entry.location
            assert entry.body


def test_pdf_meta_merges_technologies_and_drops_specialities():
    assert cv.pdf_meta(
        [
            ("Specialities", "electronic trading, market making"),
            ("Coding", "Rust, Python"),
            ("Technologies", "PostgreSQL, Redis"),
        ]
    ) == [("Technologies", "Rust, Python, PostgreSQL, Redis")]


def test_pdf_meta_keeps_other_keys():
    assert cv.pdf_meta([("PhD", "A thesis title")]) == [("PhD", "A thesis title")]


def test_pdf_meta_deduplicates():
    meta = [("Coding", "Python, Rust"), ("Technology", "Rust, AWS")]
    assert cv.pdf_meta(meta) == [("Technologies", "Python, Rust, AWS")]


def test_only_the_lead_paragraph_reaches_the_pdf(sections: dict[str, list[cv.Entry]]):
    entry = find(sections["Work Experience"], "Onyx Capital")
    assert len(entry.body) > 1, "the web entry should carry more than its lead"
    rendered = cv.render_entry(entry)
    assert entry.body[0] in rendered
    for paragraph in entry.body[1:]:
        assert paragraph not in rendered


def test_exam_marks_survive_into_print():
    """Marks live in the lead paragraph so the condensing cannot drop them."""
    academic = (cv.CV_DIR / "academic.tex").read_text()
    assert "110/110" in academic
    assert "56/60" in academic


def test_generated_latex_carries_no_markup():
    for filename in cv.SECTIONS.values():
        content = (cv.CV_DIR / filename).read_text()
        assert r"\href" not in content
        assert "http" not in content
        assert r"\textbf" not in content
        assert "Specialities" not in content


def test_latex_sources_in_sync(sections: dict[str, list[cv.Entry]]):
    """The committed LaTeX must match what content/cv.md generates."""
    for name, filename in cv.SECTIONS.items():
        path = cv.CV_DIR / filename
        assert path.read_text() == cv.render(
            sections[name]
        ), f"{filename} is stale, run `make cv-sync`"


def test_sync_is_idempotent(tmp_path):
    for filename in cv.SECTIONS.values():
        (tmp_path / filename).write_text("stale")
    assert len(cv.sync(target=tmp_path)) == len(cv.SECTIONS)
    assert cv.sync(target=tmp_path) == []


def test_sync_rejects_an_empty_section(tmp_path):
    source = tmp_path / "cv.md"
    source.write_text("## Work Experience\n\n## Education\n")
    with pytest.raises(ValueError, match="no entries found"):
        cv.sync(source=source, target=tmp_path)
