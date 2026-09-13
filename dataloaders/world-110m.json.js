const response = await fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json");
process.stdout.write(await response.text());
