[out:json][timeout:180];
way(18.90,72.81,18.96,72.85)["landuse"~"^(park|grass|recreation_ground|cemetery|meadow|forest)$"];
way(18.90,72.81,18.96,72.85)["leisure"~"^(park|garden|pitch|playground|track)$"];
way(18.90,72.81,18.96,72.85)["natural"~"^(water|coastline|beach|wood)$"];
way(18.90,72.81,18.96,72.85)["waterway"~"^(river|canal|stream|dock)$"];
way(18.90,72.81,18.96,72.85)["railway"~"^(rail|light_rail|tram|subway)$"];
out body; >; out skel qt;
