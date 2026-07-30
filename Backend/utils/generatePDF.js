const PDFDocument = require("pdfkit");

const BRAND_NAVY = "#1e3a8a";
const BRAND_BLUE = "#2563eb";
const TEXT_GRAY = "#555555";
const DARK_TEXT = "#111827";

const ACTION_TEXT = {
    Completion: "has successfully completed the course",
    Achievement: "has been awarded this certificate of achievement for",
    Participation: "has successfully participated in",
};

const dataUriToBuffer = (dataUri) => {
    if (!dataUri || typeof dataUri !== "string") {
        return null;
    }
    const match = dataUri.match(/^data:image\/\w+;base64,(.+)$/);
    return match ? Buffer.from(match[1], "base64") : null;
};

const formatDate = (date) => {
    if (!date) {
        return null;
    }
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) {
        return null;
    }
    return parsed.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
};

/**
 * Streams a professional, printable A4-landscape certificate PDF straight to
 * the given writable stream (an Express response, in practice). Nothing is
 * written to disk - the document exists only in memory for the request.
 *
 * `certificate` should be a Certificate document with `organization`
 * populated (at least its `name`), since the org name appears on the layout.
 */
function generateCertificatePDF(certificate, outputStream) {
    const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 0 });
    doc.pipe(outputStream);

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;

    // Decorative double border frame
    doc.lineWidth(3).strokeColor(BRAND_NAVY).rect(24, 24, pageWidth - 48, pageHeight - 48).stroke();
    doc.lineWidth(1).strokeColor(BRAND_BLUE).rect(34, 34, pageWidth - 68, pageHeight - 68).stroke();

    const orgName =
        certificate.organization && certificate.organization.name
            ? certificate.organization.name
            : "CertiVerify";

    // Header: platform + issuing organization name (no logo field exists yet
    // in the Organization model, so it is gracefully omitted per "if available")
    doc.font("Helvetica-Bold").fontSize(14).fillColor(BRAND_BLUE).text("CertiVerify", 0, 55, {
        align: "center",
    });
    doc.font("Helvetica").fontSize(16).fillColor(TEXT_GRAY).text(orgName, 0, 78, {
        align: "center",
    });

    // Title
    const certTitle = `CERTIFICATE OF ${(certificate.certificateType || "Completion").toUpperCase()}`;
    doc.font("Times-Bold").fontSize(38).fillColor(BRAND_NAVY).text(certTitle, 0, 120, {
        align: "center",
    });

    doc.font("Times-Italic").fontSize(16).fillColor(TEXT_GRAY).text("This is to certify that", 0, 185, {
        align: "center",
    });

    // Recipient name, underlined
    const recipientName = certificate.recipientName || "Recipient";
    doc.font("Helvetica-Bold").fontSize(30).fillColor(DARK_TEXT).text(recipientName, 0, 215, {
        align: "center",
    });

    const nameWidth = Math.min(doc.widthOfString(recipientName) + 40, 520);
    const underlineX = (pageWidth - nameWidth) / 2;
    doc
        .moveTo(underlineX, 255)
        .lineTo(underlineX + nameWidth, 255)
        .lineWidth(1)
        .strokeColor(BRAND_BLUE)
        .stroke();

    const actionText = ACTION_TEXT[certificate.certificateType] || ACTION_TEXT.Completion;
    doc.font("Times-Italic").fontSize(16).fillColor(TEXT_GRAY).text(actionText, 0, 270, {
        align: "center",
    });

    doc.font("Helvetica-Bold").fontSize(22).fillColor(BRAND_NAVY).text(certificate.course || "", 0, 300, {
        align: "center",
    });

    // ----- Footer: dates (left) / QR code (center) / signature (right) -----
    const footerY = pageHeight - 150;

    const issueDate = formatDate(certificate.issueDate);
    const expiryDate = formatDate(certificate.expiryDate);

    doc.font("Helvetica").fontSize(11).fillColor(TEXT_GRAY);
    doc.text(`Certificate ID: ${certificate.certificateId}`, 70, footerY, { width: 240 });
    if (issueDate) {
        doc.text(`Issue Date: ${issueDate}`, 70, footerY + 18, { width: 240 });
    }
    if (expiryDate) {
        doc.text(`Expiry Date: ${expiryDate}`, 70, footerY + 36, { width: 240 });
    }

    const qrBuffer = dataUriToBuffer(certificate.qrCode);
    if (qrBuffer) {
        const qrSize = 90;
        const qrX = pageWidth / 2 - qrSize / 2;
        doc.image(qrBuffer, qrX, footerY - 10, { width: qrSize, height: qrSize });
        doc.font("Helvetica").fontSize(9).fillColor(TEXT_GRAY).text(
            "Scan to verify",
            qrX,
            footerY - 10 + qrSize + 4,
            { width: qrSize, align: "center" }
        );
    }

    const sigWidth = 220;
    const sigX = pageWidth - 70 - sigWidth;
    doc
        .moveTo(sigX, footerY + 40)
        .lineTo(sigX + sigWidth, footerY + 40)
        .lineWidth(1)
        .strokeColor("#999999")
        .stroke();
    doc.font("Helvetica").fontSize(11).fillColor(TEXT_GRAY).text(
        "Authorized Signature",
        sigX,
        footerY + 46,
        { width: sigWidth, align: "center" }
    );
    doc.font("Helvetica-Oblique").fontSize(10).fillColor(TEXT_GRAY).text(
        orgName,
        sigX,
        footerY + 62,
        { width: sigWidth, align: "center" }
    );

    doc.end();
}

module.exports = generateCertificatePDF;
