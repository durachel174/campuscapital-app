"""
Seed list of 50 target universities with IPEDS UNITID values.
Covers all four archetypes: Prestige Fortress, Expansion Player,
Regional Value, and Tuition Dependent.
"""

TARGET_UNIVERSITIES = [
    # --- Prestige Fortress (elite private) ---
    {"unit_id": 166027, "name": "Harvard University", "alias": "Harvard", "state": "MA", "city": "Cambridge", "control": "private-nonprofit", "archetype": "Prestige Fortress"},
    {"unit_id": 243744, "name": "Stanford University", "alias": "Stanford", "state": "CA", "city": "Stanford", "control": "private-nonprofit", "archetype": "Prestige Fortress"},
    {"unit_id": 190836, "name": "Massachusetts Institute of Technology", "alias": "MIT", "state": "MA", "city": "Cambridge", "control": "private-nonprofit", "archetype": "Prestige Fortress"},
    {"unit_id": 130794, "name": "Yale University", "alias": "Yale", "state": "CT", "city": "New Haven", "control": "private-nonprofit", "archetype": "Prestige Fortress"},
    {"unit_id": 215062, "name": "University of Pennsylvania", "alias": "UPenn", "state": "PA", "city": "Philadelphia", "control": "private-nonprofit", "archetype": "Prestige Fortress"},
    {"unit_id": 186131, "name": "Princeton University", "alias": "Princeton", "state": "NJ", "city": "Princeton", "control": "private-nonprofit", "archetype": "Prestige Fortress"},
    {"unit_id": 190150, "name": "Columbia University in the City of New York", "alias": "Columbia", "state": "NY", "city": "New York", "control": "private-nonprofit", "archetype": "Prestige Fortress"},
    {"unit_id": 217156, "name": "Brown University", "alias": "Brown", "state": "RI", "city": "Providence", "control": "private-nonprofit", "archetype": "Prestige Fortress"},
    {"unit_id": 182670, "name": "Dartmouth College", "alias": "Dartmouth", "state": "NH", "city": "Hanover", "control": "private-nonprofit", "archetype": "Prestige Fortress"},
    {"unit_id": 147767, "name": "University of Chicago", "alias": "UChicago", "state": "IL", "city": "Chicago", "control": "private-nonprofit", "archetype": "Prestige Fortress"},

    # --- Major Public Flagships ---
    {"unit_id": 110635, "name": "University of California-Los Angeles", "alias": "UCLA", "state": "CA", "city": "Los Angeles", "control": "public", "archetype": "Prestige Fortress"},
    {"unit_id": 110662, "name": "University of California-Berkeley", "alias": "UC Berkeley", "state": "CA", "city": "Berkeley", "control": "public", "archetype": "Prestige Fortress"},
    {"unit_id": 170976, "name": "University of Michigan-Ann Arbor", "alias": "Michigan", "state": "MI", "city": "Ann Arbor", "control": "public", "archetype": "Prestige Fortress"},
    {"unit_id": 139755, "name": "Georgia Institute of Technology-Main Campus", "alias": "Georgia Tech", "state": "GA", "city": "Atlanta", "control": "public", "archetype": "Expansion Player"},
    {"unit_id": 228723, "name": "The University of Texas at Austin", "alias": "UT Austin", "state": "TX", "city": "Austin", "control": "public", "archetype": "Expansion Player"},
    {"unit_id": 204796, "name": "The Ohio State University", "alias": "Ohio State", "state": "OH", "city": "Columbus", "control": "public", "archetype": "Expansion Player"},
    {"unit_id": 240444, "name": "University of Wisconsin-Madison", "alias": "UW Madison", "state": "WI", "city": "Madison", "control": "public", "archetype": "Expansion Player"},
    {"unit_id": 174066, "name": "University of Minnesota-Twin Cities", "alias": "UMN", "state": "MN", "city": "Minneapolis", "control": "public", "archetype": "Expansion Player"},
    {"unit_id": 163286, "name": "University of Maryland-College Park", "alias": "UMD", "state": "MD", "city": "College Park", "control": "public", "archetype": "Expansion Player"},
    {"unit_id": 236948, "name": "University of Washington-Seattle Campus", "alias": "UW Seattle", "state": "WA", "city": "Seattle", "control": "public", "archetype": "Expansion Player"},
    {"unit_id": 126614, "name": "University of Colorado Boulder", "alias": "CU Boulder", "state": "CO", "city": "Boulder", "control": "public", "archetype": "Expansion Player"},
    {"unit_id": 199120, "name": "University of North Carolina at Chapel Hill", "alias": "UNC", "state": "NC", "city": "Chapel Hill", "control": "public", "archetype": "Prestige Fortress"},
    {"unit_id": 218663, "name": "University of Virginia-Main Campus", "alias": "UVA", "state": "VA", "city": "Charlottesville", "control": "public", "archetype": "Prestige Fortress"},
    {"unit_id": 232186, "name": "Virginia Polytechnic Institute and State University", "alias": "Virginia Tech", "state": "VA", "city": "Blacksburg", "control": "public", "archetype": "Expansion Player"},
    {"unit_id": 145637, "name": "University of Illinois Urbana-Champaign", "alias": "UIUC", "state": "IL", "city": "Champaign", "control": "public", "archetype": "Expansion Player"},

    # --- Large Enrollment / Expansion Players ---
    {"unit_id": 104151, "name": "Arizona State University-Tempe", "alias": "ASU", "state": "AZ", "city": "Tempe", "control": "public", "archetype": "Expansion Player"},
    {"unit_id": 159391, "name": "Louisiana State University and Agricultural & Mechanical College", "alias": "LSU", "state": "LA", "city": "Baton Rouge", "control": "public", "archetype": "Expansion Player"},
    {"unit_id": 179867, "name": "University of Missouri-Columbia", "alias": "Mizzou", "state": "MO", "city": "Columbia", "control": "public", "archetype": "Regional Value"},
    {"unit_id": 147536, "name": "Northwestern University", "alias": "Northwestern", "state": "IL", "city": "Evanston", "control": "private-nonprofit", "archetype": "Prestige Fortress"},
    {"unit_id": 162928, "name": "Johns Hopkins University", "alias": "Johns Hopkins", "state": "MD", "city": "Baltimore", "control": "private-nonprofit", "archetype": "Prestige Fortress"},
    {"unit_id": 214777, "name": "Carnegie Mellon University", "alias": "CMU", "state": "PA", "city": "Pittsburgh", "control": "private-nonprofit", "archetype": "Expansion Player"},
    {"unit_id": 167358, "name": "Northeastern University", "alias": "Northeastern", "state": "MA", "city": "Boston", "control": "private-nonprofit", "archetype": "Expansion Player"},
    {"unit_id": 134097, "name": "University of Florida", "alias": "UF", "state": "FL", "city": "Gainesville", "control": "public", "archetype": "Expansion Player"},
    {"unit_id": 228769, "name": "Texas A & M University-College Station", "alias": "Texas A&M", "state": "TX", "city": "College Station", "control": "public", "archetype": "Expansion Player"},
    {"unit_id": 110705, "name": "University of California-San Diego", "alias": "UC San Diego", "state": "CA", "city": "La Jolla", "control": "public", "archetype": "Expansion Player"},

    # --- Regional State Schools ---
    {"unit_id": 202134, "name": "Bowling Green State University-Main Campus", "alias": "BGSU", "state": "OH", "city": "Bowling Green", "control": "public", "archetype": "Regional Value"},
    {"unit_id": 178396, "name": "Missouri State University", "alias": "Missouri State", "state": "MO", "city": "Springfield", "control": "public", "archetype": "Regional Value"},
    {"unit_id": 240727, "name": "University of Wisconsin-Milwaukee", "alias": "UWM", "state": "WI", "city": "Milwaukee", "control": "public", "archetype": "Regional Value"},
    {"unit_id": 199148, "name": "North Carolina State University at Raleigh", "alias": "NC State", "state": "NC", "city": "Raleigh", "control": "public", "archetype": "Expansion Player"},
    {"unit_id": 221759, "name": "The University of Tennessee-Knoxville", "alias": "UTK", "state": "TN", "city": "Knoxville", "control": "public", "archetype": "Regional Value"},
    {"unit_id": 230764, "name": "Utah State University", "alias": "Utah State", "state": "UT", "city": "Logan", "control": "public", "archetype": "Regional Value"},
    {"unit_id": 196097, "name": "SUNY at Albany", "alias": "SUNY Albany", "state": "NY", "city": "Albany", "control": "public", "archetype": "Regional Value"},
    {"unit_id": 209807, "name": "University of Oregon", "alias": "Oregon", "state": "OR", "city": "Eugene", "control": "public", "archetype": "Regional Value"},
    {"unit_id": 193900, "name": "New York University", "alias": "NYU", "state": "NY", "city": "New York", "control": "private-nonprofit", "archetype": "Expansion Player"},

    # --- Tuition Dependent Private Schools ---
    {"unit_id": 218070, "name": "Providence College", "alias": "Providence", "state": "RI", "city": "Providence", "control": "private-nonprofit", "archetype": "Tuition Dependent"},
    {"unit_id": 237011, "name": "Seattle University", "alias": "Seattle U", "state": "WA", "city": "Seattle", "control": "private-nonprofit", "archetype": "Tuition Dependent"},
    {"unit_id": 192439, "name": "Fordham University", "alias": "Fordham", "state": "NY", "city": "Bronx", "control": "private-nonprofit", "archetype": "Tuition Dependent"},
    {"unit_id": 210775, "name": "Drexel University", "alias": "Drexel", "state": "PA", "city": "Philadelphia", "control": "private-nonprofit", "archetype": "Tuition Dependent"},
    {"unit_id": 130183, "name": "Quinnipiac University", "alias": "Quinnipiac", "state": "CT", "city": "Hamden", "control": "private-nonprofit", "archetype": "Tuition Dependent"},
]
