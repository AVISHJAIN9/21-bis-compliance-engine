import io
import csv

BIS_SCHEME_1_CHECKLIST = {
    "factory_layout": {"name": "Factory Layout & Production Machinery List", "weight": 15, "critical": True, "action": "Submit complete factory layout drawing and installed manufacturing machinery details."},
    "test_equipment": {"name": "Mandatory In-House Test Benches (Clause-Specific)", "weight": 25, "critical": True, "action": "Procure and commission all required testing apparatus per the product standard SIT."},
    "calibration_certs": {"name": "Valid NABL Calibration Certificates (<1 yr)", "weight": 15, "critical": True, "action": "Ensure all testing instruments have unexpired calibration from NABL-accredited labs."},
    "qc_personnel": {"name": "Qualified Quality Control Personnel Undertaking", "weight": 15, "critical": True, "action": "Appoint designated QC chemist/engineer with qualification certificates filed."},
    "raw_material_certs": {"name": "Raw Material Test Certificates & Traceability Log", "weight": 15, "critical": False, "action": "Maintain supplier batch test certificates and raw material acceptance logs."},
    "sit_register": {"name": "Scheme of Inspection and Testing (SIT) Register", "weight": 15, "critical": False, "action": "Implement daily production batch testing register matching the official BIS SIT format."}
}

AIS_HOMOLOGATION_CHECKLIST = {
    "form_22_drawings": {"name": "CMVR Form 22 Technical Specifications & Engineering Drawings", "weight": 25, "critical": True, "action": "Prepare complete engineering blueprints and Form 22 technical spec sheets."},
    "prototype_bench": {"name": "Homologation Prototype & Test Bench Readiness", "weight": 25, "critical": True, "action": "Assemble compliant prototype sample for destructive/safety verification at test agency."},
    "calibration_certs": {"name": "NABL Calibration Certificates for In-House Diagnostics", "weight": 15, "critical": True, "action": "Provide valid calibration certificates for diagnostic benches and multimeters."},
    "cop_plan": {"name": "Conformity of Production (COP) Plan (AIS-037)", "weight": 20, "critical": True, "action": "Establish formal COP procedural document for recurring surveillance batch audits."},
    "traceability_log": {"name": "Critical Component Sourcing & Safety Traceability", "weight": 15, "critical": False, "action": "Maintain sub-assembly traceability records for cells, BMS, or telemetry modules."}
}

def evaluate_readiness(uploaded_docs: list, standard: str = "") -> dict:
    is_automotive = "AIS" in standard.upper()
    active_checklist = AIS_HOMOLOGATION_CHECKLIST if is_automotive else BIS_SCHEME_1_CHECKLIST
    
    score = 0
    fulfilled = []
    gaps = []
    has_critical_gap = False

    for key, item in active_checklist.items():
        if key in uploaded_docs:
            score += item["weight"]
            fulfilled.append(item["name"])
        else:
            if item["critical"]:
                has_critical_gap = True
            gaps.append({
                "item": item["name"],
                "weight_loss": item["weight"],
                "critical": item["critical"],
                "action_required": item["action"]
            })

    if score >= 85 and not has_critical_gap:
        status = "Audit Ready (Minimal Compliance Risk)"
    elif score >= 60:
        status = "Conditional Readiness (Minor Gaps Present)"
    else:
        status = "Non-Compliant (Critical Deficits Identified)"

    return {
        "regime": "Automotive Homologation (CMVR)" if is_automotive else "BIS Scheme-I (ISI Mark)",
        "readiness_score": f"{score}%",
        "status": status,
        "critical_gap_flag": has_critical_gap,
        "fulfilled_criteria": fulfilled,
        "gaps_identified": gaps,
        "actionable_next_step": gaps[0]["action_required"] if gaps else "Proceed to portal filing."
    }

def generate_csv_report(matched_item: dict, readiness: dict, query_text: str) -> str:
    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow(["REGULATORY AUDIT REPORT - STATUTORY COMPLIANCE DETERMINATION"])
    writer.writerow(["Query Input", query_text])
    writer.writerow(["Standard", matched_item.get("standard", "N/A")])
    writer.writerow(["Regulatory Regime", readiness.get("regime", "N/A")])
    writer.writerow(["Quality Control Order", matched_item.get("qco_order", "N/A")])
    writer.writerow(["Authorized Lab", matched_item.get("lab", "N/A")])
    writer.writerow(["Readiness Score", readiness.get("readiness_score", "0%")])
    writer.writerow(["Audit Status", readiness.get("status", "N/A")])
    writer.writerow([])
    writer.writerow(["DEFICIENT STATUTORY ARTIFACTS", "IMPACT (WEIGHT)", "CRITICAL", "REQUIRED ACTION"])
    
    for gap in readiness.get("gaps_identified", []):
        writer.writerow([
            gap.get("item", ""),
            f"-{gap.get('weight_loss', 0)}%",
            "YES" if gap.get("critical") else "NO",
            gap.get("action_required", "")
        ])

    return output.getvalue()
