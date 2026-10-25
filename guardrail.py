import re

def check_domain_guardrail(query: str, matched_standard: str, similarity_score: float) -> tuple[bool, str]:
    q = query.lower().strip()

    # 1. Non-statutory commercial blocks (unregulated goods & services)
    blocked_keywords = [
        "crypto", "bitcoin", "ethereum", "nft", "blockchain",
        "stock market", "shares", "trading platform",
        "movie", "song", "lyrics", "cricket", "ipl", "weather",
        "dating", "tinder", "social media", "instagram", "facebook",
        "game software", "video game", "mobile app",
        "spoons and dinner forks", "kitchen spoon", "dinner fork", "cutlery",
        "alkaline pencil batteries", "aa battery", "aaa battery", "tv remote control",
        "carbonated bottled soft drink", "soda water", "coca cola", "pepsi"
    ]
    if any(b in q for b in blocked_keywords):
        return False, "Query falls under non-statutory commercial or unregulated consumer category."

    # 2. INSTANT PASS: Exact Statutory Standard Number Match (e.g. 'IS 12269', '12269', 'AIS 156')
    # Extracts all digit sequences like 12269, 14543, 2062, 156, 140
    query_digits = re.findall(r'\b\d{3,5}\b', q)
    matched_digits = re.findall(r'\b\d{3,5}\b', matched_standard.lower())
    if any(d in matched_digits for d in query_digits):
        return True, "Passed via exact statutory standard code match."

    # 3. Handle Common Product Keywords & Syllable/Token Overlap
    # Handles terms like 'waterbottle', 'water bottle', 'cement', 'tmt', 'battery'
    statutory_roots = ["water", "bottle", "cement", "steel", "rebar", "battery", "toy", "kettle", "vltd", "tracking"]
    matched_lower = matched_standard.lower()
    has_root_match = any(root in q for root in statutory_roots)

    # If product root matches (e.g. 'waterbottle' contains 'water') and similarity is positive
    if has_root_match and similarity_score >= 0.20:
        return True, "Passed statutory product root match."

    # 4. Dense Semantic Similarity Threshold
    if similarity_score >= 0.45:
        return True, "Strong semantic standard alignment."

    return False, f"Relevance score ({round(similarity_score, 3)}) is below the required regulatory verification threshold."
