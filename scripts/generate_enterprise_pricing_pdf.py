from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


OUTPUT_PATH = Path(__file__).resolve().parents[1] / "public" / "enterprise-pricing-plans.pdf"


def build_pdf() -> None:
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "title",
        parent=styles["Title"],
        fontSize=24,
        textColor=colors.HexColor("#0f172a"),
        spaceAfter=8,
    )
    subtitle_style = ParagraphStyle(
        "subtitle",
        parent=styles["Normal"],
        fontSize=11,
        textColor=colors.HexColor("#475569"),
        spaceAfter=16,
    )
    heading_style = ParagraphStyle(
        "heading",
        parent=styles["Heading2"],
        fontSize=14,
        textColor=colors.HexColor("#0f172a"),
        spaceAfter=6,
    )
    body_style = ParagraphStyle(
        "body",
        parent=styles["BodyText"],
        fontSize=10,
        textColor=colors.HexColor("#334155"),
        leading=14,
    )

    doc = SimpleDocTemplate(
        str(OUTPUT_PATH),
        pagesize=letter,
        leftMargin=0.75 * inch,
        rightMargin=0.75 * inch,
        topMargin=0.75 * inch,
        bottomMargin=0.75 * inch,
        title="StepSync Flow Enterprise Pricing",
    )

    elements = [
        Paragraph("StepSync Flow — Enterprise Pricing", title_style),
    ]

    data = [
        [
            Paragraph("<b>Enterprise</b>", heading_style),
            Paragraph("<b>Enterprise Plus</b>", heading_style),
        ],
        [
            Paragraph("<b>Per seat / month:</b> $3 (30-seat minimum)", body_style),
            Paragraph("<b>Per seat / month:</b> $2 (50-seat minimum)", body_style),
        ],
        [
            Paragraph("<b>Annual contract:</b> $3 (30-seat minimum)", body_style),
            Paragraph("<b>Annual contract:</b> $2 (50-seat minimum)", body_style),
        ],
        [
            Paragraph(
                "• SSO (SAML/OIDC)<br/>"
                "• Advanced RBAC + department scoping<br/>"
                "• Public links with password protection<br/>"
                "• Basic audit logs<br/>"
                "• Email + chat support<br/>"
                "• 99.5% uptime SLA",
                body_style,
            ),
            Paragraph(
                "• Everything in Enterprise<br/>"
                "• Dedicated success manager<br/>"
                "• Custom integrations (API + webhooks)<br/>"
                "• Advanced audit logs & export<br/>"
                "• Quarterly security review<br/>"
                "• 99.9% uptime SLA",
                body_style,
            ),
        ],
    ]

    table = Table(data, colWidths=[3.4 * inch, 3.4 * inch])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f8fafc")),
                ("BOX", (0, 0), (-1, -1), 0.6, colors.HexColor("#e2e8f0")),
                ("INNERGRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#e2e8f0")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("TOPPADDING", (0, 0), (-1, -1), 10),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
                ("RIGHTPADDING", (0, 0), (-1, -1), 10),
            ]
        )
    )

    elements.append(table)
    elements.append(Spacer(1, 18))
    elements.append(
        Paragraph(
            "Contact hello@stepsyncflow.com to request a custom quote.",
            subtitle_style,
        )
    )

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    doc.build(elements)


if __name__ == "__main__":
    build_pdf()
