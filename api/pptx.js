const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");

// Icon imports from react-icons
const { FaIdCard, FaCalendarCheck, FaBook, FaUserCheck, FaCreditCard, FaBus, FaBoxes, FaDoorOpen, FaWifi, FaUniversity, FaShieldAlt, FaChartLine, FaMobileAlt, FaLightbulb, FaCheckCircle, FaTimes, FaArrowRight, FaUsers, FaClock, FaLeaf } = require("react-icons/fa");
const { MdNfc, MdSecurity, MdSchool, MdPayment } = require("react-icons/md");
const { HiChip } = require("react-icons/hi");

// Color palette - Deep futuristic tech cos who doesn't like that?
const C = {
  darkBg: "050D1A",       // Deep navy black
  midBg: "0A1628",        // Navy
  cardBg: "0F1F3D",       // Card navy
  accentBlue: "00D4FF",   // Cyan electric
  accentGold: "FFB800",   // Gold accent
  accentPurple: "7C3AED", // Purple
  accentGreen: "00E676",  // Neon green
  white: "FFFFFF",
  gray: "8899AA",
  lightGray: "C8D8E8",
  highlight: "1A3A6B",    // Highlight blue
};

async function renderIcon(IconComponent, color = "#FFFFFF", size = 256) {
  const svg = ReactDOMServer.renderToStaticMarkup(
    React.createElement(IconComponent, { color, size: String(size) })
  );
  const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + pngBuffer.toString("base64");
}

async function main() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.title = "NFC Smart Card System - Nnamdi Azikiwe University";
  pres.author = "Drexx Technologies";

  // ─── Slide helpers ───────────────────────────────────
  function addDarkBg(slide) {
    slide.background = { color: C.darkBg };
    // Top subtle accent stripe
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0, y: 0, w: 10, h: 0.04,
      fill: { color: C.accentBlue }, line: { color: C.accentBlue }
    });
  }

  function addCornerGlow(slide, right=true) {
    // Abstract corner circle glow
    slide.addShape(pres.shapes.OVAL, {
      x: right ? 8.2 : -1.2, y: right ? -1.0 : 3.5,
      w: 3.0, h: 3.0,
      fill: { color: C.accentBlue, transparency: 88 },
      line: { color: C.accentBlue, transparency: 85, width: 1 }
    });
    slide.addShape(pres.shapes.OVAL, {
      x: right ? 8.8 : -0.6, y: right ? -0.4 : 4.1,
      w: 1.8, h: 1.8,
      fill: { color: C.accentBlue, transparency: 80 },
      line: { color: C.accentBlue, transparency: 78, width: 1 }
    });
  }

  function addSlideNumber(slide, num, total) {
    slide.addText(`${num} / ${total}`, {
      x: 9.2, y: 5.3, w: 0.7, h: 0.2,
      fontSize: 9, color: C.gray, align: "right"
    });
  }

  function sectionPill(slide, label, color) {
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 0.5, y: 0.18, w: 1.8, h: 0.3,
      fill: { color: color, transparency: 75 },
      line: { color: color, width: 1 }
    });
    slide.addText(label, {
      x: 0.5, y: 0.18, w: 1.8, h: 0.3,
      fontSize: 9, color: color, align: "center", valign: "middle", bold: true, charSpacing: 1.5
    });
  }

  // ─── SLIDE 1: TITLE ────────────────────────────────────────────────────────
  {
    const slide = pres.addSlide();
    addDarkBg(slide);
    addCornerGlow(slide, true);

    // Large circle motif bottom-left
    slide.addShape(pres.shapes.OVAL, {
      x: -1.5, y: 3.8, w: 4, h: 4,
      fill: { color: C.accentPurple, transparency: 92 },
      line: { color: C.accentPurple, transparency: 88, width: 1 }
    });

    // NFC wave rings (concentric)
    for (let i = 0; i < 4; i++) {
      const sz = 0.7 + i * 0.45;
      const cx = 5.0 - sz/2;
      const cy = 2.6 - sz/2;
      slide.addShape(pres.shapes.OVAL, {
        x: cx, y: cy, w: sz, h: sz,
        fill: { type: "none" },
        line: { color: C.accentBlue, width: i === 0 ? 2 : 1, transparency: i * 22 }
      });
    }

    // NFC chip card shape
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 4.2, y: 1.8, w: 1.6, h: 1.05,
      fill: { color: C.cardBg },
      line: { color: C.accentBlue, width: 1 },
      shadow: { type: "outer", color: "00D4FF", blur: 18, offset: 0, angle: 270, opacity: 0.3 }
    });
    // Chip on card
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 4.5, y: 2.05, w: 0.5, h: 0.38,
      fill: { color: C.accentGold },
      line: { color: "CC9200", width: 1 }
    });

    // DREXX TECHNOLOGIES label
    slide.addText("DREXX TECHNOLOGIES PRESENTS", {
      x: 0.6, y: 1.0, w: 8.8, h: 0.35,
      fontSize: 11, color: C.accentBlue, bold: true, charSpacing: 4, align: "center"
    });

    // Main title
    slide.addText("NFC Smart Card", {
      x: 0.4, y: 1.45, w: 9.2, h: 1.1,
      fontSize: 52, color: C.white, bold: true, align: "center"
    });
    slide.addText("University Management System", {
      x: 0.4, y: 2.5, w: 9.2, h: 0.6,
      fontSize: 26, color: C.accentBlue, align: "center", charSpacing: 2
    });

    // Divider line
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 3.5, y: 3.25, w: 3.0, h: 0.025,
      fill: { color: C.accentGold }, line: { color: C.accentGold }
    });

    slide.addText("Proposed for Nnamdi Azikiwe University, Awka", {
      x: 0.5, y: 3.4, w: 9.0, h: 0.4,
      fontSize: 14, color: C.lightGray, align: "center", italic: true
    });

    slide.addText("A Unified Digital Identity & Campus Operations Platform", {
      x: 1.0, y: 4.0, w: 8.0, h: 0.35,
      fontSize: 12, color: C.gray, align: "center"
    });

    // Bottom bar
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0, y: 5.32, w: 10, h: 0.3,
      fill: { color: C.highlight }, line: { color: C.highlight }
    });
    slide.addText("CONFIDENTIAL — FOR MANAGEMENT REVIEW", {
      x: 0.3, y: 5.33, w: 6, h: 0.28,
      fontSize: 8, color: C.gray, valign: "middle"
    });
    slide.addText("2025", {
      x: 8.5, y: 5.33, w: 1.2, h: 0.28,
      fontSize: 8, color: C.gray, align: "right", valign: "middle"
    });
  }

  // ─── SLIDE 2: THE PROBLEM ──────────────────────────────────────────────────
  {
    const slide = pres.addSlide();
    addDarkBg(slide);
    addCornerGlow(slide, false);
    sectionPill(slide, "THE PROBLEM", "FF4444");
    addSlideNumber(slide, 2, 16);

    slide.addText("Current Challenges at UNIZIK", {
      x: 0.5, y: 0.55, w: 9.0, h: 0.65,
      fontSize: 32, color: C.white, bold: true
    });

    const problems = [
      { t: "Multiple Physical Cards", d: "Students carry separate ID cards, library cards, and more — cumbersome and easy to lose." },
      { t: "Manual Attendance", d: "Lecturers spend 10–15 minutes per class on roll calls, reducing teaching time." },
      { t: "Event Chaos", d: "No reliable way to verify attendance or track refreshment distribution at school events — leading to fraud." },
      { t: "No Digital Infrastructure", d: "Paper-based processes are error-prone, slow to audit, and expensive to maintain." },
    ];

    problems.forEach((p, i) => {
      const col = i < 2 ? 0 : 1;
      const row = i % 2;
      const x = col === 0 ? 0.5 : 5.3;
      const y = 1.4 + row * 1.65;

      slide.addShape(pres.shapes.RECTANGLE, {
        x, y, w: 4.5, h: 1.45,
        fill: { color: "1A0A0A" },
        line: { color: "FF4444", width: 1 },
        shadow: { type: "outer", color: "FF4444", blur: 10, offset: 0, angle: 270, opacity: 0.15 }
      });
      // Red accent left
      slide.addShape(pres.shapes.RECTANGLE, {
        x, y, w: 0.07, h: 1.45,
        fill: { color: "FF4444" }, line: { color: "FF4444" }
      });
      slide.addText(p.t, {
        x: x + 0.18, y: y + 0.1, w: 4.2, h: 0.35,
        fontSize: 13, color: "FF6666", bold: true, margin: 0
      });
      slide.addText(p.d, {
        x: x + 0.18, y: y + 0.48, w: 4.2, h: 0.85,
        fontSize: 10.5, color: C.lightGray, margin: 0
      });
    });

    // Bottom callout
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0.5, y: 4.85, w: 9.0, h: 0.55,
      fill: { color: C.cardBg },
      line: { color: C.accentBlue, width: 1 }
    });
    slide.addText("There is a smarter, unified solution — and it already exists.", {
      x: 0.5, y: 4.85, w: 9.0, h: 0.55,
      fontSize: 13, color: C.accentBlue, align: "center", valign: "middle", bold: true, italic: true
    });
  }

  // ─── SLIDE 3: WHAT IS NFC? ─────────────────────────────────────────────────
  {
    const slide = pres.addSlide();
    addDarkBg(slide);
    addCornerGlow(slide, true);
    sectionPill(slide, "TECHNOLOGY", C.accentPurple);
    addSlideNumber(slide, 3, 16);

    slide.addText("What is NFC Technology?", {
      x: 0.5, y: 0.55, w: 9.0, h: 0.65,
      fontSize: 32, color: C.white, bold: true
    });

    // Left: visual card
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0.5, y: 1.35, w: 3.6, h: 3.8,
      fill: { color: C.cardBg },
      line: { color: C.accentBlue, width: 1.5 },
      shadow: { type: "outer", color: "00D4FF", blur: 20, offset: 0, angle: 270, opacity: 0.3 }
    });

    // Card internal design
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0.5, y: 1.35, w: 3.6, h: 1.05,
      fill: { color: C.highlight }, line: { color: C.highlight }
    });
    slide.addText("UNIZIK", {
      x: 0.6, y: 1.4, w: 3.4, h: 0.45,
      fontSize: 18, color: C.accentBlue, bold: true, charSpacing: 3, margin: 0
    });
    slide.addText("Smart ID Card", {
      x: 0.6, y: 1.85, w: 3.4, h: 0.38,
      fontSize: 10, color: C.lightGray, margin: 0
    });

    // Chip
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0.85, y: 2.6, w: 0.7, h: 0.55,
      fill: { color: C.accentGold }, line: { color: "AA7700", width: 1 }
    });
    // NFC symbol area
    slide.addShape(pres.shapes.OVAL, {
      x: 2.6, y: 2.5, w: 0.8, h: 0.8,
      fill: { type: "none" },
      line: { color: C.accentBlue, width: 2 }
    });
    slide.addShape(pres.shapes.OVAL, {
      x: 2.75, y: 2.65, w: 0.5, h: 0.5,
      fill: { type: "none" },
      line: { color: C.accentBlue, width: 1.5 }
    });
    slide.addShape(pres.shapes.OVAL, {
      x: 2.9, y: 2.8, w: 0.2, h: 0.2,
      fill: { color: C.accentBlue }, line: { color: C.accentBlue }
    });

    // Student info lines
    slide.addText("Student Name", {
      x: 0.7, y: 3.3, w: 3.2, h: 0.3, fontSize: 10, color: C.gray, margin: 0
    });
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0.7, y: 3.6, w: 2.8, h: 0.025,
      fill: { color: C.gray, transparency: 50 }, line: { color: C.gray, transparency: 50 }
    });
    slide.addText("Reg. Number", {
      x: 0.7, y: 3.75, w: 3.2, h: 0.28, fontSize: 10, color: C.gray, margin: 0
    });
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0.7, y: 4.0, w: 2.0, h: 0.025,
      fill: { color: C.gray, transparency: 50 }, line: { color: C.gray, transparency: 50 }
    });
    slide.addText("NFC • RFID • SMARTCARD", {
      x: 0.7, y: 4.4, w: 3.2, h: 0.28,
      fontSize: 8, color: C.accentBlue, charSpacing: 1.5, margin: 0
    });

    // Right: descriptions
    const facts = [
      { h: "Near Field Communication (NFC)", b: "A short-range wireless technology that enables data exchange within 4cm — secure, instant, and contactless." },
      { h: "Embedded Microchip", b: "Each card holds a tamper-proof chip storing student data, identity credentials, and usage history." },
      { h: "One Tap = Many Actions", b: "A single tap can verify identity, log attendance, access the library, confirm event check-in, and more — simultaneously." },
      { h: "Global Standard", b: "The same technology used in bank cards, airport IDs, and access control systems worldwide. Proven and reliable." },
    ];

    facts.forEach((f, i) => {
      const y = 1.35 + i * 1.0;
      slide.addText(f.h, {
        x: 4.6, y, w: 5.0, h: 0.3,
        fontSize: 12.5, color: C.accentBlue, bold: true, margin: 0
      });
      slide.addText(f.b, {
        x: 4.6, y: y + 0.3, w: 5.0, h: 0.55,
        fontSize: 10.5, color: C.lightGray, margin: 0
      });
      if (i < 3) {
        slide.addShape(pres.shapes.RECTANGLE, {
          x: 4.6, y: y + 0.88, w: 5.0, h: 0.018,
          fill: { color: C.highlight }, line: { color: C.highlight }
        });
      }
    });
  }

  // ─── SLIDE 4: THE SOLUTION OVERVIEW ───────────────────────────────────────
  {
    const slide = pres.addSlide();
    addDarkBg(slide);
    sectionPill(slide, "SOLUTION", C.accentGreen);
    addSlideNumber(slide, 4, 16);

    slide.addText("One Card. Every Need.", {
      x: 0.5, y: 0.52, w: 9.0, h: 0.75,
      fontSize: 38, color: C.white, bold: true, align: "center"
    });
    slide.addText("The UNIZIK NFC Smart Card replaces all physical cards with a single intelligent credential", {
      x: 1.0, y: 1.25, w: 8.0, h: 0.4,
      fontSize: 13, color: C.gray, align: "center", italic: true
    });

    // Central card visual
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 3.9, y: 1.75, w: 2.2, h: 1.4,
      fill: { color: C.cardBg },
      line: { color: C.accentBlue, width: 2 },
      shadow: { type: "outer", color: "00D4FF", blur: 25, offset: 0, angle: 270, opacity: 0.4 }
    });
    slide.addText("UNIZIK", {
      x: 3.9, y: 1.82, w: 2.2, h: 0.42,
      fontSize: 20, color: C.accentBlue, bold: true, align: "center", charSpacing: 3
    });
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 4.1, y: 2.35, w: 0.5, h: 0.38,
      fill: { color: C.accentGold }, line: { color: "AA7700" }
    });
    slide.addText("NFC •", {
      x: 4.65, y: 2.45, w: 1.2, h: 0.25,
      fontSize: 9, color: C.accentBlue, margin: 0
    });
    slide.addText("SMART ID", {
      x: 3.9, y: 2.85, w: 2.2, h: 0.25,
      fontSize: 9, color: C.gray, align: "center"
    });

    // Spoke labels around card
    const spokes = [
      { t: "Student Digital ID",    x: 0.3,  y: 1.8,  ax: 3.85,  ay: 2.2  },
      { t: "Library Access",         x: 0.2,  y: 3.2,  ax: 3.85,  ay: 2.75 },
      { t: "Attendance Tracking",   x: 7.4,  y: 1.8,  ax: 6.15,  ay: 2.2  },
      { t: "Event Check-in",        x: 7.2,  y: 3.2,  ax: 6.15,  ay: 2.75 },
      { t: "Digital Payments",      x: 3.8,  y: 4.3,  ax: 4.6,  ay: 3.2  },
      { t: "Building Access",       x: 1.5,  y: 4.5,  ax: 4.0,  ay: 3.15 },
      { t: "Transport",             x: 6.4,  y: 4.5,  ax: 6.05, ay: 3.15 },
    ];

    const colors = [C.accentBlue, C.accentGreen, C.accentBlue, C.accentGreen, C.accentGold, C.accentGold, C.accentGold];
    spokes.forEach((s, i) => {
      // Line
      slide.addShape(pres.shapes.LINE, {
        x: Math.min(s.x + 0.8, s.ax), y: s.y + 0.15,
        w: Math.abs(s.ax - s.x - 0.8), h: Math.abs(s.ay - s.y - 0.15),
        line: { color: colors[i], width: 1, transparency: 45 }
      });
      slide.addShape(pres.shapes.RECTANGLE, {
        x: s.x, y: s.y, w: 2.0, h: 0.42,
        fill: { color: C.cardBg },
        line: { color: colors[i], width: 1 }
      });
      slide.addText(s.t, {
        x: s.x, y: s.y, w: 2.0, h: 0.42,
        fontSize: 10.5, color: colors[i], bold: true, align: "center", valign: "middle"
      });
    });

    slide.addText("+ More capabilities built in", {
      x: 1.5, y: 5.1, w: 7.0, h: 0.28,
      fontSize: 10, color: C.gray, align: "center", italic: true
    });
  }

  // ─── SLIDE 5: CARD DESIGN MOCKUP ──────────────────────────────────────────
  {
    const slide = pres.addSlide();
    addDarkBg(slide);

    slide.addShape(pres.shapes.OVAL, {
      x: 7.0, y: 3.0, w: 5, h: 5,
      fill: { color: C.accentGold, transparency: 93 },
      line: { color: C.accentGold, transparency: 90, width: 1 }
    });
    slide.addShape(pres.shapes.OVAL, {
      x: -1.5, y: -1.0, w: 4, h: 4,
      fill: { color: C.accentBlue, transparency: 92 },
      line: { color: C.accentBlue, transparency: 89, width: 1 }
    });

    sectionPill(slide, "CARD DESIGN", C.accentGold);
    addSlideNumber(slide, 5, 17);

    slide.addText("The UNIZIK Smart Card", {
      x: 0.5, y: 0.52, w: 9.0, h: 0.65,
      fontSize: 34, color: C.white, bold: true
    });
    slide.addText("One physical card. Engineered for a smart campus.", {
      x: 0.5, y: 1.16, w: 8.0, h: 0.35,
      fontSize: 12, color: C.gray, italic: true
    });

    // ── FRONT OF CARD ─────────────────────────────────
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0.55, y: 1.65, w: 4.2, h: 2.65,
      fill: { color: "001830" },
      line: { color: C.accentBlue, width: 0 },
      shadow: { type: "outer", color: "00D4FF", blur: 30, offset: 0, angle: 270, opacity: 0.5 }
    });
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0.6, y: 1.7, w: 4.1, h: 2.55,
      fill: { color: "071428" },
      line: { color: C.accentBlue, width: 1.5 }
    });
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0.6, y: 1.7, w: 4.1, h: 0.72,
      fill: { color: C.highlight }, line: { color: C.highlight }
    });
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0.6, y: 2.39, w: 4.1, h: 0.035,
      fill: { color: C.accentGold }, line: { color: C.accentGold }
    });
    slide.addText("NNAMDI AZIKIWE UNIVERSITY", {
      x: 0.7, y: 1.73, w: 3.9, h: 0.3,
      fontSize: 8.5, color: C.accentBlue, bold: true, charSpacing: 1, margin: 0
    });
    slide.addText("AWKA  ·  ANAMBRA STATE  ·  NIGERIA", {
      x: 0.7, y: 2.03, w: 3.9, h: 0.25,
      fontSize: 7, color: C.lightGray, charSpacing: 0.5, margin: 0
    });
    // Photo placeholder
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0.75, y: 2.52, w: 0.95, h: 1.18,
      fill: { color: C.highlight }, line: { color: C.accentBlue, width: 1 }
    });
    slide.addShape(pres.shapes.OVAL, {
      x: 1.0, y: 2.62, w: 0.45, h: 0.45,
      fill: { color: "1A3A6B" }, line: { color: C.accentBlue, width: 0.5 }
    });
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0.78, y: 3.1, w: 0.9, h: 0.55,
      fill: { color: "0D2040" }, line: { color: C.accentBlue, width: 0.5 }
    });
    slide.addText("PHOTO", {
      x: 0.75, y: 2.52, w: 0.95, h: 1.18,
      fontSize: 7, color: C.gray, align: "center", valign: "bottom"
    });
    // Student info
    slide.addText("STUDENT FULL NAME", {
      x: 1.82, y: 2.55, w: 2.75, h: 0.25, fontSize: 9.5, color: C.white, bold: true, margin: 0
    });
    slide.addText("REG. NUMBER: 20XX / XXXXXX / XX", {
      x: 1.82, y: 2.82, w: 2.75, h: 0.22, fontSize: 7.5, color: C.lightGray, margin: 0
    });
    slide.addText("FACULTY OF ENGINEERING", {
      x: 1.82, y: 3.06, w: 2.75, h: 0.22, fontSize: 7.5, color: C.gray, margin: 0
    });
    slide.addText("DEPARTMENT: ELECTRICAL ENGINEERING", {
      x: 1.82, y: 3.28, w: 2.75, h: 0.22, fontSize: 7, color: C.gray, margin: 0
    });
    slide.addText("LEVEL: 300  ·  SESSION: 2024/2025", {
      x: 1.82, y: 3.5, w: 2.75, h: 0.22, fontSize: 7, color: C.gray, margin: 0
    });
    // EMV Chip
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0.75, y: 3.83, w: 0.65, h: 0.48,
      fill: { color: C.accentGold }, line: { color: "AA8800", width: 1 }
    });
    slide.addShape(pres.shapes.RECTANGLE, { x: 0.87, y: 3.83, w: 0.01, h: 0.48, fill: { color: "AA8800" }, line: { color: "AA8800" } });
    slide.addShape(pres.shapes.RECTANGLE, { x: 1.0, y: 3.83, w: 0.01, h: 0.48, fill: { color: "AA8800" }, line: { color: "AA8800" } });
    slide.addShape(pres.shapes.RECTANGLE, { x: 0.75, y: 4.03, w: 0.65, h: 0.01, fill: { color: "AA8800" }, line: { color: "AA8800" } });
    // NFC rings
    for (let r = 0; r < 3; r++) {
      const sz = 0.22 + r * 0.2;
      slide.addShape(pres.shapes.OVAL, {
        x: 4.2 - sz, y: 3.72 + (0.3 - sz / 2), w: sz, h: sz,
        fill: { type: "none" },
        line: { color: C.accentBlue, width: r === 0 ? 1.5 : 1, transparency: r * 25 }
      });
    }
    slide.addShape(pres.shapes.OVAL, {
      x: 4.27, y: 3.89, w: 0.12, h: 0.12,
      fill: { color: C.accentBlue }, line: { color: C.accentBlue }
    });
    slide.addText("UNIZIK SMART ID  ·  NFC ENABLED", {
      x: 1.55, y: 3.88, w: 2.6, h: 0.22, fontSize: 6.5, color: C.gray, charSpacing: 0.5, margin: 0
    });
    slide.addText("FRONT", {
      x: 0.6, y: 4.4, w: 4.1, h: 0.28,
      fontSize: 9, color: C.accentGold, align: "center", charSpacing: 3, bold: true
    });

    // ── BACK OF CARD ──────────────────────────────────
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 5.3, y: 1.65, w: 4.2, h: 2.65,
      fill: { color: "001830" },
      line: { color: C.accentBlue, width: 0 },
      shadow: { type: "outer", color: "00D4FF", blur: 30, offset: 0, angle: 270, opacity: 0.5 }
    });
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 5.35, y: 1.7, w: 4.1, h: 2.55,
      fill: { color: "071428" }, line: { color: C.accentBlue, width: 1.5 }
    });
    // Magnetic stripe
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 5.35, y: 1.7, w: 4.1, h: 0.45,
      fill: { color: "111111" }, line: { color: "111111" }
    });
    // Signature strip
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 5.5, y: 2.28, w: 2.5, h: 0.35,
      fill: { color: "E8E0D0" }, line: { color: "C0B090", width: 1 }
    });
    slide.addText("SIGNATURE", {
      x: 5.5, y: 2.28, w: 2.5, h: 0.35, fontSize: 7, color: "999999", align: "left", valign: "middle"
    });
    // Barcode lines
    for (let b = 0; b < 22; b++) {
      slide.addShape(pres.shapes.RECTANGLE, {
        x: 5.5 + b * 0.1, y: 2.75,
        w: b % 3 === 0 ? 0.06 : 0.03, h: 0.5,
        fill: { color: b % 5 === 0 ? C.white : C.lightGray },
        line: { color: b % 5 === 0 ? C.white : C.lightGray }
      });
    }
    slide.addText("BARCODE / QR CODE", {
      x: 5.5, y: 3.28, w: 2.5, h: 0.2, fontSize: 6.5, color: C.gray, align: "center", charSpacing: 1
    });
    slide.addText("This card is the property of Nnamdi Azikiwe University.", {
      x: 5.45, y: 3.6, w: 4.0, h: 0.25, fontSize: 7, color: C.gray, italic: true, margin: 0
    });
    slide.addText("If found, please return to the Registry Office.", {
      x: 5.45, y: 3.85, w: 4.0, h: 0.22, fontSize: 7, color: C.gray, italic: true, margin: 0
    });
    slide.addText("Powered by Drexx Technologies  ·  drexxtech.ng", {
      x: 5.45, y: 4.08, w: 4.0, h: 0.22, fontSize: 7, color: C.accentBlue, margin: 0
    });
    slide.addText("BACK", {
      x: 5.35, y: 4.4, w: 4.1, h: 0.28,
      fontSize: 9, color: C.accentGold, align: "center", charSpacing: 3, bold: true
    });

    // Feature callouts
    const callouts = [
      { t: "ISO/IEC 14443", s: "Certified standard" },
      { t: "Hologram Security", s: "Anti-counterfeit" },
      { t: "AES-128 Chip", s: "Encrypted data" },
      { t: "5-Year Lifespan", s: "Durable PVC card" },
    ];
    callouts.forEach((c, i) => {
      const x = 0.55 + i * 2.35;
      slide.addShape(pres.shapes.RECTANGLE, {
        x, y: 4.82, w: 2.1, h: 0.6,
        fill: { color: C.cardBg }, line: { color: C.accentBlue, width: 0.75 }
      });
      slide.addText(c.t, {
        x, y: 4.86, w: 2.1, h: 0.27,
        fontSize: 10, color: C.accentBlue, bold: true, align: "center"
      });
      slide.addText(c.s, {
        x, y: 5.13, w: 2.1, h: 0.22,
        fontSize: 8.5, color: C.gray, align: "center"
      });
    });
  }

  // ─── SLIDE 6: PRIMARY USE CASE 1 — Student Digital ID ─────────────────────
  {
    const slide = pres.addSlide();
    addDarkBg(slide);
    addCornerGlow(slide, true);
    sectionPill(slide, "PRIMARY SOLUTION 1", C.accentBlue);
    addSlideNumber(slide, 6, 17);

    slide.addText("Student Digital ID", {
      x: 0.5, y: 0.55, w: 9.0, h: 0.65,
      fontSize: 34, color: C.white, bold: true
    });
    slide.addText("A tamper-proof, verifiable digital identity embedded in every student's smart card", {
      x: 0.5, y: 1.18, w: 7.5, h: 0.38,
      fontSize: 12, color: C.gray, italic: true
    });

    // Left: card mockup detailed
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0.5, y: 1.7, w: 3.8, h: 2.5,
      fill: { color: C.cardBg },
      line: { color: C.accentBlue, width: 2 },
      shadow: { type: "outer", color: "00D4FF", blur: 22, offset: 0, angle: 270, opacity: 0.35 }
    });
    // Header band
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0.5, y: 1.7, w: 3.8, h: 0.75,
      fill: { color: C.highlight }, line: { color: C.highlight }
    });
    slide.addText("NNAMDI AZIKIWE UNIVERSITY", {
      x: 0.55, y: 1.73, w: 3.7, h: 0.3,
      fontSize: 8, color: C.accentBlue, bold: true, charSpacing: 0.8, margin: 0
    });
    slide.addText("AWKA, ANAMBRA STATE", {
      x: 0.55, y: 2.03, w: 3.7, h: 0.28,
      fontSize: 7.5, color: C.lightGray, margin: 0
    });
    // Photo placeholder
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0.65, y: 2.55, w: 0.85, h: 1.0,
      fill: { color: C.highlight },
      line: { color: C.accentBlue, width: 1 }
    });
    slide.addText("PHOTO", {
      x: 0.65, y: 2.55, w: 0.85, h: 1.0,
      fontSize: 8, color: C.gray, align: "center", valign: "middle"
    });
    // Text fields
    slide.addText("Chukwuemeka Obi", {
      x: 1.6, y: 2.55, w: 2.55, h: 0.3, fontSize: 10.5, color: C.white, bold: true, margin: 0
    });
    slide.addText("REG: 2021/249857/EE", {
      x: 1.6, y: 2.85, w: 2.55, h: 0.25, fontSize: 8, color: C.lightGray, margin: 0
    });
    slide.addText("Faculty of Engineering", {
      x: 1.6, y: 3.1, w: 2.55, h: 0.25, fontSize: 8, color: C.gray, margin: 0
    });
    slide.addText("Electrical Engineering", {
      x: 1.6, y: 3.35, w: 2.55, h: 0.25, fontSize: 8, color: C.accentBlue, margin: 0
    });
    // NFC / chip
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0.65, y: 3.75, w: 0.55, h: 0.4,
      fill: { color: C.accentGold }, line: { color: "AA7700" }
    });
    slide.addShape(pres.shapes.OVAL, {
      x: 3.3, y: 3.7, w: 0.6, h: 0.6,
      fill: { type: "none" }, line: { color: C.accentBlue, width: 1.5 }
    });
    slide.addShape(pres.shapes.OVAL, {
      x: 3.43, y: 3.83, w: 0.34, h: 0.34,
      fill: { type: "none" }, line: { color: C.accentBlue, width: 1 }
    });
    slide.addShape(pres.shapes.OVAL, {
      x: 3.56, y: 3.96, w: 0.1, h: 0.1,
      fill: { color: C.accentBlue }, line: { color: C.accentBlue }
    });

    // Right: Features
    const features = [
      { h: "Unique Cryptographic ID", b: "Each card stores an encrypted student profile — name, photo, department, and level — impossible to forge." },
      { h: "Instant Verification", b: "Security personnel can validate identity in under 1 second using a tap on any NFC-enabled reader." },
      { h: "Replaces All Physical IDs", b: "One card replaces the current student ID, library card, and future departmental cards." },
      { h: "Real-time Update", b: "Student records (level, status, enrollment) are updated remotely without reissuing the card." },
    ];

    features.forEach((f, i) => {
      const y = 1.7 + i * 0.97;
      slide.addShape(pres.shapes.RECTANGLE, {
        x: 4.7, y, w: 5.0, h: 0.86,
        fill: { color: C.cardBg },
        line: { color: C.accentBlue, width: 0.75 }
      });
      slide.addShape(pres.shapes.RECTANGLE, {
        x: 4.7, y, w: 0.06, h: 0.86,
        fill: { color: C.accentBlue }, line: { color: C.accentBlue }
      });
      slide.addText(f.h, {
        x: 4.88, y: y + 0.06, w: 4.7, h: 0.3,
        fontSize: 12, color: C.accentBlue, bold: true, margin: 0
      });
      slide.addText(f.b, {
        x: 4.88, y: y + 0.38, w: 4.7, h: 0.38,
        fontSize: 10, color: C.lightGray, margin: 0
      });
    });

    // Bottom tag
    slide.addText("Student Digital ID is the foundation upon which all other functions are built.", {
      x: 0.5, y: 4.95, w: 9.0, h: 0.35,
      fontSize: 10, color: C.accentGold, italic: true, align: "center"
    });
  }

  // ─── SLIDE 6: PRIMARY USE CASE 2 — Event Check-in & Refreshments ──────────
  {
    const slide = pres.addSlide();
    addDarkBg(slide);
    addCornerGlow(slide, false);
    sectionPill(slide, "PRIMARY SOLUTION 2", C.accentGreen);
    addSlideNumber(slide, 7, 17);

    slide.addText("Event Check-in &", {
      x: 0.5, y: 0.5, w: 9.0, h: 0.55,
      fontSize: 34, color: C.white, bold: true
    });
    slide.addText("Refreshment Management", {
      x: 0.5, y: 1.0, w: 9.0, h: 0.55,
      fontSize: 34, color: C.accentGreen, bold: true
    });
    slide.addText("Eliminating double-dipping, ghost attendance, and refreshment fraud at school events", {
      x: 0.5, y: 1.58, w: 8.5, h: 0.35,
      fontSize: 12, color: C.gray, italic: true
    });

    // Left: Process flow
    const steps = [
      { n: "1", t: "Student Arrives", d: "Taps NFC card at event entrance reader", c: C.accentGreen },
      { n: "2", t: "Attendance Logged", d: "System records time-stamped entry in real time", c: C.accentBlue },
      { n: "3", t: "Refreshment Eligibility", d: "Card is flagged — eligible for ONE refreshment", c: C.accentGold },
      { n: "4", t: "Refreshment Tap", d: "Student taps again at refreshment station — collected!", c: C.accentGreen },
    ];

    steps.forEach((s, i) => {
      const y = 2.1 + i * 0.78;
      // Number circle
      slide.addShape(pres.shapes.OVAL, {
        x: 0.4, y: y + 0.05, w: 0.45, h: 0.45,
        fill: { color: s.c }, line: { color: s.c }
      });
      slide.addText(s.n, {
        x: 0.4, y: y + 0.05, w: 0.45, h: 0.45,
        fontSize: 13, color: C.darkBg, bold: true, align: "center", valign: "middle"
      });
      // Connector line (not for last)
      if (i < 3) {
        slide.addShape(pres.shapes.LINE, {
          x: 0.62, y: y + 0.52, w: 0, h: 0.27,
          line: { color: s.c, width: 1.5, transparency: 40 }
        });
      }
      slide.addText(s.t, {
        x: 1.05, y: y + 0.04, w: 4.5, h: 0.28,
        fontSize: 12, color: C.white, bold: true, margin: 0
      });
      slide.addText(s.d, {
        x: 1.05, y: y + 0.3, w: 4.5, h: 0.3,
        fontSize: 10, color: C.gray, margin: 0
      });
    });

    // Right: impact cards
    const impacts = [
      { t: "Zero Double Collection", d: "System marks card as 'refreshment received' — tapping again shows an alert: ALREADY COLLECTED.", c: C.accentGreen },
      { t: "Real-time Headcount", d: "Organisers see live attendance numbers. No manual counting, no guesswork.", c: C.accentBlue },
      { t: "Audit Trail", d: "Full timestamped record of who attended and who collected. Exportable for accountability reports.", c: C.accentGold },
    ];

    impacts.forEach((im, i) => {
      const y = 2.1 + i * 1.08;
      slide.addShape(pres.shapes.RECTANGLE, {
        x: 6.0, y, w: 3.7, h: 0.95,
        fill: { color: C.cardBg },
        line: { color: im.c, width: 1 }
      });
      slide.addShape(pres.shapes.RECTANGLE, {
        x: 6.0, y, w: 0.06, h: 0.95,
        fill: { color: im.c }, line: { color: im.c }
      });
      slide.addText(im.t, {
        x: 6.15, y: y + 0.06, w: 3.4, h: 0.28,
        fontSize: 11.5, color: im.c, bold: true, margin: 0
      });
      slide.addText(im.d, {
        x: 6.15, y: y + 0.37, w: 3.4, h: 0.5,
        fontSize: 9.5, color: C.lightGray, margin: 0
      });
    });

    // Bottom
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0.5, y: 5.05, w: 9.0, h: 0.38,
      fill: { color: "001A0A" },
      line: { color: C.accentGreen, width: 1 }
    });
    slide.addText("This alone saves thousands of naira per event — and eliminates student complaints about fairness.", {
      x: 0.5, y: 5.05, w: 9.0, h: 0.38,
      fontSize: 10.5, color: C.accentGreen, align: "center", valign: "middle", italic: true
    });
  }

  // ─── SLIDE 7: PRIMARY USE CASE 3 — Library Card ───────────────────────────
  {
    const slide = pres.addSlide();
    addDarkBg(slide);
    addCornerGlow(slide, true);
    sectionPill(slide, "PRIMARY SOLUTION 3", C.accentGold);
    addSlideNumber(slide, 8, 17);

    slide.addText("Unified Library Card", {
      x: 0.5, y: 0.55, w: 9.0, h: 0.65,
      fontSize: 34, color: C.white, bold: true
    });
    slide.addText("The university currently issues a separate plastic library card alongside the student ID. This ends today.", {
      x: 0.5, y: 1.2, w: 8.8, h: 0.38,
      fontSize: 12, color: C.gray, italic: true
    });

    // Before / After comparison
    // BEFORE
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0.4, y: 1.72, w: 4.2, h: 2.9,
      fill: { color: "150A00" },
      line: { color: "FF8800", width: 1.5 }
    });
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0.4, y: 1.72, w: 4.2, h: 0.45,
      fill: { color: "3A1800" }, line: { color: "3A1800" }
    });
    slide.addText("BEFORE", {
      x: 0.4, y: 1.72, w: 4.2, h: 0.45,
      fontSize: 13, color: "FF8800", bold: true, align: "center", valign: "middle", charSpacing: 3
    });
    const befores = [
      "2 physical cards issued per student",
      "Extra production & printing cost per card",
      "Students lose library cards frequently",
      "Manual log books for borrowing records",
      "No digital borrowing history",
      "Staff manually verify library membership",
    ];
    befores.forEach((b, i) => {
      slide.addText([
        { text: "✗  ", options: { color: "FF4444", bold: true } },
        { text: b, options: { color: C.lightGray } }
      ], {
        x: 0.6, y: 2.28 + i * 0.35, w: 3.9, h: 0.32,
        fontSize: 10.5
      });
    });

    // AFTER
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 5.4, y: 1.72, w: 4.2, h: 2.9,
      fill: { color: "001A08" },
      line: { color: C.accentGreen, width: 1.5 },
      shadow: { type: "outer", color: "00E676", blur: 15, offset: 0, angle: 270, opacity: 0.2 }
    });
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 5.4, y: 1.72, w: 4.2, h: 0.45,
      fill: { color: "003D18" }, line: { color: "003D18" }
    });
    slide.addText("WITH NFC SMART CARD", {
      x: 5.4, y: 1.72, w: 4.2, h: 0.45,
      fontSize: 11, color: C.accentGreen, bold: true, align: "center", valign: "middle", charSpacing: 1
    });
    const afters = [
      "One card serves as both ID & library card",
      "Zero extra card production cost",
      "Lost card remotely deactivated in seconds",
      "Digital borrowing log updated in real time",
      "Complete history accessible by student & staff",
      "Tap to borrow, tap to return — instant processing",
    ];
    afters.forEach((a, i) => {
      slide.addText([
        { text: "✓  ", options: { color: C.accentGreen, bold: true } },
        { text: a, options: { color: C.lightGray } }
      ], {
        x: 5.6, y: 2.28 + i * 0.35, w: 3.9, h: 0.32,
        fontSize: 10.5
      });
    });

    // Arrow between
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 4.68, y: 3.08, w: 0.6, h: 0.04,
      fill: { color: C.accentBlue }, line: { color: C.accentBlue }
    });
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 4.86, y: 2.9, w: 0.04, h: 0.45,
      fill: { color: C.accentBlue }, line: { color: C.accentBlue }
    });

    // Bottom cost saving
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0.4, y: 4.77, w: 9.2, h: 0.56,
      fill: { color: C.cardBg },
      line: { color: C.accentGold, width: 1 }
    });
    slide.addText("💡  Estimated saving: ₦150–₦300 per student in card production cost alone, annually.", {
      x: 0.5, y: 4.77, w: 9.0, h: 0.56,
      fontSize: 12, color: C.accentGold, align: "center", valign: "middle", bold: true
    });
  }

  // ─── SLIDE 8: PRIMARY USE CASE 4 — Attendance Tracking ───────────────────
  {
    const slide = pres.addSlide();
    addDarkBg(slide);
    addCornerGlow(slide, false);
    sectionPill(slide, "PRIMARY SOLUTION 4", C.accentBlue);
    addSlideNumber(slide, 9, 17);

    slide.addText("Attendance Tracking", {
      x: 0.5, y: 0.52, w: 9.0, h: 0.65,
      fontSize: 34, color: C.white, bold: true
    });
    slide.addText("From 15-minute roll calls to a 10-second tap — transforming how class attendance is recorded", {
      x: 0.5, y: 1.16, w: 8.5, h: 0.38,
      fontSize: 12, color: C.gray, italic: true
    });

    // Stats row
    const stats = [
      { v: "15min", l: "Lost Per Class\n(Manual)" },
      { v: "→ 10sec", l: "With NFC\nTap System" },
      { v: "100%", l: "Data\nAccuracy" },
      { v: "0", l: "Paper\nRequired" },
    ];
    stats.forEach((s, i) => {
      slide.addShape(pres.shapes.RECTANGLE, {
        x: 0.4 + i * 2.3, y: 1.7, w: 2.1, h: 1.1,
        fill: { color: C.cardBg },
        line: { color: i === 1 ? C.accentGreen : C.accentBlue, width: 1 }
      });
      slide.addText(s.v, {
        x: 0.4 + i * 2.3, y: 1.78, w: 2.1, h: 0.5,
        fontSize: i === 0 ? 22 : 24, color: i === 1 ? C.accentGreen : C.accentBlue,
        bold: true, align: "center"
      });
      slide.addText(s.l, {
        x: 0.4 + i * 2.3, y: 2.28, w: 2.1, h: 0.44,
        fontSize: 9, color: C.gray, align: "center"
      });
    });

    // How it works
    slide.addText("How It Works", {
      x: 0.4, y: 2.98, w: 3, h: 0.35,
      fontSize: 14, color: C.accentBlue, bold: true, margin: 0
    });

    const steps = [
      "Lecturer activates attendance session via the UNIZIK portal or a department device.",
      "Students tap their NFC card on the reader (or a mobile NFC device) as they enter.",
      "System timestamps and records each entry automatically — late arrivals are flagged.",
      "Attendance report is immediately available to the lecturer, HOD, and registry.",
      "Students can view their own attendance percentage via the student portal.",
    ];
    steps.forEach((s, i) => {
      slide.addShape(pres.shapes.OVAL, {
        x: 0.38, y: 3.4 + i * 0.38, w: 0.28, h: 0.28,
        fill: { color: C.accentBlue }, line: { color: C.accentBlue }
      });
      slide.addText(String(i + 1), {
        x: 0.38, y: 3.4 + i * 0.38, w: 0.28, h: 0.28,
        fontSize: 9, color: C.darkBg, align: "center", valign: "middle", bold: true
      });
      slide.addText(s, {
        x: 0.78, y: 3.38 + i * 0.38, w: 8.8, h: 0.32,
        fontSize: 10.5, color: C.lightGray, margin: 0
      });
    });

    // Right-side benefit box
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 5.7, y: 2.92, w: 3.95, h: 2.0,
      fill: { color: C.cardBg },
      line: { color: C.accentBlue, width: 1 }
    });
    slide.addText("Benefits at a Glance", {
      x: 5.8, y: 2.98, w: 3.75, h: 0.3,
      fontSize: 12, color: C.accentBlue, bold: true, margin: 0
    });
    const benefits = ["Eliminates proxy attendance", "Instant registry sync", "Automated absentee alerts to parents", "Supports 75% attendance enforcement"];
    benefits.forEach((b, i) => {
      slide.addText([
        { text: "● ", options: { color: C.accentGreen } },
        { text: b, options: { color: C.lightGray } }
      ], {
        x: 5.8, y: 3.35 + i * 0.38, w: 3.75, h: 0.32, fontSize: 10.5
      });
    });
  }

  // ─── SLIDE 9: LATER SOLUTIONS OVERVIEW ────────────────────────────────────
  {
    const slide = pres.addSlide();
    addDarkBg(slide);

    // Purple glow
    slide.addShape(pres.shapes.OVAL, {
      x: 7.5, y: 2.5, w: 5, h: 5,
      fill: { color: C.accentPurple, transparency: 90 },
      line: { color: C.accentPurple, transparency: 87, width: 1 }
    });

    sectionPill(slide, "FUTURE SOLUTIONS", C.accentPurple);
    addSlideNumber(slide, 10, 17);

    slide.addText("Expanding Capabilities", {
      x: 0.5, y: 0.52, w: 9.0, h: 0.65,
      fontSize: 34, color: C.white, bold: true
    });
    slide.addText("The same NFC card infrastructure enables a growing ecosystem of campus services", {
      x: 0.5, y: 1.16, w: 8.5, h: 0.38,
      fontSize: 12, color: C.gray, italic: true
    });

    const later = [
      { t: "Digital Payments", d: "Cashless transactions across campus — cafeteria, printing, bookshop, and more.", c: C.accentGold },
      { t: "Transportation", d: "Smart fare collection on university buses. Students tap to board — no cash, no queues.", c: C.accentBlue },
      { t: "Inventory Management", d: "Track equipment, lab tools, and assets issued to students or departments.", c: C.accentGreen },
      { t: "Building Access Control", d: "Restrict access to labs, staff offices, server rooms, and secure facilities.", c: C.accentPurple },
      { t: "Hostel Management", d: "Room key replacement — students tap into their hostel block and room.", c: C.accentBlue },
      { t: "Health Centre", d: "Store medical records and insurance info. Verify student identity at the clinic.", c: C.accentGreen },
    ];

    later.forEach((l, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = 0.4 + col * 3.2;
      const y = 1.75 + row * 1.55;

      slide.addShape(pres.shapes.RECTANGLE, {
        x, y, w: 3.0, h: 1.35,
        fill: { color: C.cardBg },
        line: { color: l.c, width: 1 },
        shadow: { type: "outer", color: "000000", blur: 8, offset: 2, angle: 135, opacity: 0.2 }
      });
      slide.addShape(pres.shapes.RECTANGLE, {
        x, y, w: 3.0, h: 0.07,
        fill: { color: l.c }, line: { color: l.c }
      });
      slide.addText(l.t, {
        x: x + 0.18, y: y + 0.15, w: 2.7, h: 0.32,
        fontSize: 12.5, color: l.c, bold: true, margin: 0
      });
      slide.addText(l.d, {
        x: x + 0.18, y: y + 0.5, w: 2.7, h: 0.72,
        fontSize: 10, color: C.lightGray, margin: 0
      });
    });

    slide.addText("All powered by the same card — no extra hardware per service needed.", {
      x: 0.5, y: 5.08, w: 9.0, h: 0.3,
      fontSize: 10, color: C.accentPurple, align: "center", italic: true
    });
  }

  // ─── SLIDE 10: DIGITAL PAYMENTS DETAIL ─────────────────────────────────────
  {
    const slide = pres.addSlide();
    addDarkBg(slide);
    addCornerGlow(slide, true);
    sectionPill(slide, "FUTURE SOLUTION — PAYMENTS", C.accentGold);
    addSlideNumber(slide, 11, 17);

    slide.addText("Campus Digital Payments", {
      x: 0.5, y: 0.52, w: 9.0, h: 0.65,
      fontSize: 34, color: C.white, bold: true
    });
    slide.addText("A closed-loop prepaid wallet embedded in every student's NFC card", {
      x: 0.5, y: 1.18, w: 8.0, h: 0.35,
      fontSize: 12, color: C.gray, italic: true
    });

    // Payment locations
    const locations = ["Cafeteria", "Bookshop", "Printing Lab", "Photocopy Center", "Campus Gym", "Transport Fare"];
    locations.forEach((loc, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 0.5 + col * 2.8;
      const y = 1.72 + row * 0.85;
      slide.addShape(pres.shapes.RECTANGLE, {
        x, y, w: 2.5, h: 0.65,
        fill: { color: C.cardBg },
        line: { color: C.accentGold, width: 1 }
      });
      slide.addText(loc, {
        x, y, w: 2.5, h: 0.65,
        fontSize: 12, color: C.accentGold, align: "center", valign: "middle", bold: true
      });
    });

    // Right panel
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 6.2, y: 1.72, w: 3.5, h: 3.85,
      fill: { color: C.cardBg },
      line: { color: C.accentGold, width: 1 }
    });
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 6.2, y: 1.72, w: 3.5, h: 0.06,
      fill: { color: C.accentGold }, line: { color: C.accentGold }
    });
    slide.addText("How it works", {
      x: 6.3, y: 1.82, w: 3.3, h: 0.35,
      fontSize: 13, color: C.accentGold, bold: true, margin: 0
    });
    const paySteps = [
      "Parent/student funds wallet via bank transfer or USSD",
      "Balance stored encrypted on card & synced server-side",
      "Merchant taps student card to deduct payment",
      "Student & parent get SMS receipt instantly",
      "Low-balance alert sent automatically",
    ];
    paySteps.forEach((p, i) => {
      slide.addText([
        { text: `${i + 1}. `, options: { color: C.accentGold, bold: true } },
        { text: p, options: { color: C.lightGray } }
      ], {
        x: 6.3, y: 2.3 + i * 0.6, w: 3.3, h: 0.5, fontSize: 10.5
      });
    });

    // Bottom note
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0.5, y: 5.05, w: 5.5, h: 0.38,
      fill: { color: "1A1000" }, line: { color: C.accentGold, width: 1 }
    });
    slide.addText("No cash = No theft. No loss. Full accountability.", {
      x: 0.5, y: 5.05, w: 5.5, h: 0.38,
      fontSize: 11.5, color: C.accentGold, align: "center", valign: "middle", bold: true
    });
  }

  // ─── SLIDE 11: SYSTEM ARCHITECTURE ────────────────────────────────────────
  {
    const slide = pres.addSlide();
    addDarkBg(slide);
    sectionPill(slide, "TECHNICAL", C.accentBlue);
    addSlideNumber(slide, 12, 17);

    slide.addText("System Architecture", {
      x: 0.5, y: 0.52, w: 9.0, h: 0.65,
      fontSize: 34, color: C.white, bold: true
    });

    // Architecture tiers
    const tiers = [
      { t: "NFC Smart Card", items: ["Student ID data", "Encrypted credentials", "Wallet balance", "Biometric reference"], c: C.accentBlue },
      { t: "Edge Readers", items: ["Attendance readers", "Event scanners", "Payment terminals", "Library kiosks"], c: C.accentGreen },
      { t: "Central Server", items: ["University database", "Real-time sync", "Analytics engine", "Admin dashboard"], c: C.accentGold },
      { t: "User Interfaces", items: ["Student portal", "Lecturer portal", "Admin panel", "Parent notifications"], c: C.accentPurple },
    ];

    tiers.forEach((t, i) => {
      const x = 0.4 + i * 2.38;
      slide.addShape(pres.shapes.RECTANGLE, {
        x, y: 1.55, w: 2.15, h: 3.5,
        fill: { color: C.cardBg },
        line: { color: t.c, width: 1.5 }
      });
      slide.addShape(pres.shapes.RECTANGLE, {
        x, y: 1.55, w: 2.15, h: 0.5,
        fill: { color: t.c }, line: { color: t.c }
      });
      slide.addText(t.t, {
        x, y: 1.55, w: 2.15, h: 0.5,
        fontSize: 11, color: C.darkBg, bold: true, align: "center", valign: "middle"
      });
      t.items.forEach((item, j) => {
        slide.addText([
          { text: "→ ", options: { color: t.c, bold: true } },
          { text: item, options: { color: C.lightGray } }
        ], {
          x: x + 0.15, y: 2.18 + j * 0.6, w: 1.9, h: 0.5, fontSize: 10
        });
      });
      // Arrow to next
      if (i < 3) {
        slide.addShape(pres.shapes.RECTANGLE, {
          x: x + 2.17, y: 3.25, w: 0.2, h: 0.04,
          fill: { color: C.gray }, line: { color: C.gray }
        });
      }
    });

    // Security note
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0.4, y: 5.2, w: 9.2, h: 0.33,
      fill: { color: C.cardBg },
      line: { color: C.accentBlue, width: 1 }
    });
    slide.addText("🔒  AES-128 Encryption on all card data  |  ISO/IEC 14443 Compliant  |  TLS 1.3 Server Communication  |  Daily Encrypted Backups", {
      x: 0.4, y: 5.2, w: 9.2, h: 0.33,
      fontSize: 9, color: C.accentBlue, align: "center", valign: "middle"
    });
  }

  // ─── SLIDE 12: IMPLEMENTATION ROADMAP ─────────────────────────────────────
  {
    const slide = pres.addSlide();
    addDarkBg(slide);
    addCornerGlow(slide, true);
    sectionPill(slide, "ROADMAP", C.accentGreen);
    addSlideNumber(slide, 13, 17);

    slide.addText("Implementation Roadmap", {
      x: 0.5, y: 0.52, w: 9.0, h: 0.65,
      fontSize: 34, color: C.white, bold: true
    });

    const phases = [
      { p: "Phase 1", d: "Months 1–3", t: "Foundation", items: ["System design & database setup", "Reader hardware installation (pilot faculties)", "NFC card production & personalization", "Staff training"], c: C.accentBlue },
      { p: "Phase 2", d: "Months 4–6", t: "Primary Launch", items: ["Student ID rollout", "Library integration", "Attendance system live", "Event management module"], c: C.accentGreen },
      { p: "Phase 3", d: "Months 7–12", t: "Expansion", items: ["Digital wallet activation", "Transport integration", "Building access control", "Full campus deployment"], c: C.accentGold },
      { p: "Phase 4", d: "Year 2+", t: "Scale & Optimize", items: ["Analytics & reporting suite", "Mobile app companion", "Inter-university federation", "New feature modules"], c: C.accentPurple },
    ];

    phases.forEach((ph, i) => {
      const x = 0.4 + i * 2.38;
      const barH = 0.12;
      // Phase bar
      slide.addShape(pres.shapes.RECTANGLE, {
        x, y: 1.5, w: 2.15, h: barH,
        fill: { color: ph.c }, line: { color: ph.c }
      });
      // Timeline dot
      slide.addShape(pres.shapes.OVAL, {
        x: x + 0.85, y: 1.42, w: 0.28, h: 0.28,
        fill: { color: ph.c }, line: { color: ph.c }
      });
      slide.addText(ph.p, {
        x, y: 1.65, w: 2.15, h: 0.35,
        fontSize: 13, color: ph.c, bold: true, align: "center"
      });
      slide.addText(ph.d, {
        x, y: 1.98, w: 2.15, h: 0.28,
        fontSize: 9.5, color: C.gray, align: "center"
      });
      slide.addShape(pres.shapes.RECTANGLE, {
        x, y: 2.3, w: 2.15, h: 0.35,
        fill: { color: ph.c, transparency: 80 }, line: { color: ph.c }
      });
      slide.addText(ph.t, {
        x, y: 2.3, w: 2.15, h: 0.35,
        fontSize: 11.5, color: ph.c, bold: true, align: "center", valign: "middle"
      });
      ph.items.forEach((item, j) => {
        slide.addText([
          { text: "· ", options: { color: ph.c } },
          { text: item, options: { color: C.lightGray } }
        ], {
          x: x + 0.1, y: 2.75 + j * 0.55, w: 1.95, h: 0.5, fontSize: 9.5
        });
      });
    });

    // Timeline base line
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0.4, y: 1.554, w: 9.2, h: 0.025,
      fill: { color: C.highlight }, line: { color: C.highlight }
    });

    slide.addText("Full deployment achievable within 12 months from project approval", {
      x: 1.0, y: 5.1, w: 8.0, h: 0.3,
      fontSize: 11, color: C.accentGreen, align: "center", italic: true
    });
  }

  // ─── SLIDE 13: WHY DREXX TECHNOLOGIES ─────────────────────────────────────
  {
    const slide = pres.addSlide();
    addDarkBg(slide);
    addCornerGlow(slide, false);
    sectionPill(slide, "ABOUT DREXX", C.accentBlue);
    addSlideNumber(slide, 14, 17);

    slide.addText("Why Drexx Technologies?", {
      x: 0.5, y: 0.52, w: 9.0, h: 0.65,
      fontSize: 34, color: C.white, bold: true
    });

    // Logo/Brand box
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0.5, y: 1.5, w: 3.5, h: 2.0,
      fill: { color: C.cardBg },
      line: { color: C.accentBlue, width: 2 },
      shadow: { type: "outer", color: "00D4FF", blur: 20, offset: 0, angle: 270, opacity: 0.3 }
    });
    slide.addText("DREXX", {
      x: 0.5, y: 1.7, w: 3.5, h: 0.85,
      fontSize: 42, color: C.accentBlue, bold: true, align: "center", charSpacing: 5
    });
    slide.addText("TECHNOLOGIES", {
      x: 0.5, y: 2.55, w: 3.5, h: 0.35,
      fontSize: 13, color: C.lightGray, align: "center", charSpacing: 3
    });
    slide.addText("Smart Solutions for Smarter Institutions", {
      x: 0.5, y: 3.0, w: 3.5, h: 0.3,
      fontSize: 9, color: C.gray, align: "center", italic: true
    });

    const points = [
      { h: "Local Expertise", b: "Nigerian company — we understand UNIZIK's unique operational environment, culture, and challenges." },
      { h: "End-to-End Solution", b: "We handle hardware, software, card production, deployment, and ongoing technical support." },
      { h: "Proven Technology Stack", b: "Built on globally-certified NFC standards (ISO/IEC 14443). Tested infrastructure, not experimental." },
      { h: "Dedicated Support Team", b: "On-site support during deployment, plus 24/7 remote helpdesk and quarterly system audits." },
      { h: "Scalable Architecture", b: "System grows with UNIZIK — from 1 faculty to all faculties — without major re-investment." },
    ];

    points.forEach((p, i) => {
      slide.addText(p.h, {
        x: 4.4, y: 1.5 + i * 0.78, w: 5.3, h: 0.3,
        fontSize: 12.5, color: C.accentBlue, bold: true, margin: 0
      });
      slide.addText(p.b, {
        x: 4.4, y: 1.8 + i * 0.78, w: 5.3, h: 0.35,
        fontSize: 10.5, color: C.lightGray, margin: 0
      });
      if (i < 4) {
        slide.addShape(pres.shapes.RECTANGLE, {
          x: 4.4, y: 2.17 + i * 0.78, w: 5.3, h: 0.018,
          fill: { color: C.highlight }, line: { color: C.highlight }
        });
      }
    });
  }

  // ─── SLIDE 14: ROI / VALUE PROPOSITION ────────────────────────────────────
  {
    const slide = pres.addSlide();
    addDarkBg(slide);
    addCornerGlow(slide, true);
    sectionPill(slide, "VALUE & ROI", C.accentGold);
    addSlideNumber(slide, 15, 17);

    slide.addText("Return on Investment", {
      x: 0.5, y: 0.52, w: 9.0, h: 0.65,
      fontSize: 34, color: C.white, bold: true
    });

    const metrics = [
      { v: "₦300", l: "Saved per student\non card production" },
      { v: "≥90%", l: "Reduction in\nattendance fraud" },
      { v: "100%", l: "Elimination of\nrefreshment fraud" },
      { v: "12mo", l: "Projected full\ncost recovery" },
    ];

    metrics.forEach((m, i) => {
      slide.addShape(pres.shapes.RECTANGLE, {
        x: 0.4 + i * 2.3, y: 1.55, w: 2.1, h: 1.4,
        fill: { color: C.cardBg },
        line: { color: C.accentGold, width: 1.5 },
        shadow: { type: "outer", color: "FFB800", blur: 12, offset: 0, angle: 270, opacity: 0.2 }
      });
      slide.addText(m.v, {
        x: 0.4 + i * 2.3, y: 1.65, w: 2.1, h: 0.65,
        fontSize: 28, color: C.accentGold, bold: true, align: "center"
      });
      slide.addText(m.l, {
        x: 0.4 + i * 2.3, y: 2.3, w: 2.1, h: 0.5,
        fontSize: 9.5, color: C.lightGray, align: "center"
      });
    });

    // Qualitative benefits
    slide.addText("Beyond the Numbers", {
      x: 0.4, y: 3.12, w: 5.0, h: 0.38,
      fontSize: 15, color: C.white, bold: true, margin: 0
    });
    const quals = [
      "Enhanced institutional reputation and modernisation image",
      "Improved student experience and campus safety",
      "Data-driven decision making for management",
      "Compliance-ready audit trails for accreditation bodies",
    ];
    quals.forEach((q, i) => {
      slide.addText([
        { text: "✦  ", options: { color: C.accentGold, bold: true } },
        { text: q, options: { color: C.lightGray } }
      ], {
        x: 0.4, y: 3.6 + i * 0.42, w: 5.2, h: 0.38, fontSize: 11
      });
    });

    // Right: big quote
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 5.7, y: 3.05, w: 4.0, h: 2.45,
      fill: { color: C.cardBg },
      line: { color: C.accentGold, width: 1 }
    });
    slide.addText('"', {
      x: 5.8, y: 3.1, w: 3.8, h: 0.7,
      fontSize: 60, color: C.accentGold, align: "left"
    });
    slide.addText("A university that runs on smart infrastructure attracts better students, better funding, and better outcomes.", {
      x: 5.85, y: 3.55, w: 3.7, h: 1.3,
      fontSize: 13, color: C.lightGray, italic: true, align: "center", valign: "middle"
    });
    slide.addText("— Drexx Technologies", {
      x: 5.85, y: 5.0, w: 3.7, h: 0.3,
      fontSize: 10, color: C.accentGold, align: "right", italic: true
    });
  }

  // ─── SLIDE 15: SECURITY & COMPLIANCE ──────────────────────────────────────
  {
    const slide = pres.addSlide();
    addDarkBg(slide);
    addCornerGlow(slide, false);
    sectionPill(slide, "SECURITY", C.accentGreen);
    addSlideNumber(slide, 16, 17);

    slide.addText("Security & Data Protection", {
      x: 0.5, y: 0.52, w: 9.0, h: 0.65,
      fontSize: 34, color: C.white, bold: true
    });

    const secItems = [
      { t: "AES-128 Encryption", d: "All data stored on the NFC chip is encrypted using AES-128 — the same standard used by financial institutions globally.", c: C.accentBlue },
      { t: "ISO/IEC 14443 Certified", d: "Cards comply with international smart card standards — ensuring compatibility with global readers and long-term viability.", c: C.accentGreen },
      { t: "Instant Card Deactivation", d: "A lost or stolen card can be remotely deactivated within seconds. A replacement is reissued without data loss.", c: C.accentGold },
      { t: "Role-Based Access Control", d: "Lecturers, HODs, security, library staff, and admin each see only the data relevant to their function.", c: C.accentPurple },
      { t: "Nigerian Data Protection Act", d: "System is designed in compliance with the NDPR — student data is kept in-country, with strict access logs.", c: C.accentBlue },
      { t: "Tamper-Proof Hardware", d: "Cards include physical security features — holograms, UV printing, and anti-clone chip architecture.", c: C.accentGreen },
    ];

    secItems.forEach((s, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = col === 0 ? 0.4 : 5.2;
      const y = 1.55 + row * 1.25;

      slide.addShape(pres.shapes.RECTANGLE, {
        x, y, w: 4.55, h: 1.1,
        fill: { color: C.cardBg },
        line: { color: s.c, width: 1 }
      });
      slide.addShape(pres.shapes.RECTANGLE, {
        x, y, w: 0.06, h: 1.1,
        fill: { color: s.c }, line: { color: s.c }
      });
      slide.addText(s.t, {
        x: x + 0.18, y: y + 0.08, w: 4.25, h: 0.3,
        fontSize: 12, color: s.c, bold: true, margin: 0
      });
      slide.addText(s.d, {
        x: x + 0.18, y: y + 0.42, w: 4.25, h: 0.55,
        fontSize: 10, color: C.lightGray, margin: 0
      });
    });

    slide.addText("Security is not a feature. It is the foundation.", {
      x: 1.0, y: 5.15, w: 8.0, h: 0.3,
      fontSize: 11, color: C.accentGreen, align: "center", italic: true
    });
  }

  // ─── SLIDE 16: CALL TO ACTION / CLOSING ───────────────────────────────────
  {
    const slide = pres.addSlide();
    // Dark to deep bg
    slide.background = { color: "020810" };
    // Top stripe
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0, y: 0, w: 10, h: 0.04,
      fill: { color: C.accentBlue }, line: { color: C.accentBlue }
    });

    // Large glow circles
    slide.addShape(pres.shapes.OVAL, {
      x: -1.5, y: -1, w: 5, h: 5,
      fill: { color: C.accentPurple, transparency: 90 },
      line: { color: C.accentPurple, transparency: 87, width: 1 }
    });
    slide.addShape(pres.shapes.OVAL, {
      x: 7.5, y: 2.5, w: 4, h: 4,
      fill: { color: C.accentBlue, transparency: 90 },
      line: { color: C.accentBlue, transparency: 87, width: 1 }
    });

    addSlideNumber(slide, 17, 17);

    slide.addText("The Future of UNIZIK", {
      x: 0.5, y: 0.7, w: 9.0, h: 0.75,
      fontSize: 14, color: C.accentBlue, align: "center", bold: true, charSpacing: 5
    });
    slide.addText("Starts with One Card.", {
      x: 0.5, y: 1.4, w: 9.0, h: 1.0,
      fontSize: 46, color: C.white, bold: true, align: "center"
    });

    // Divider
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 3.5, y: 2.5, w: 3.0, h: 0.03,
      fill: { color: C.accentGold }, line: { color: C.accentGold }
    });

    slide.addText("We invite Nnamdi Azikiwe University's management to take the next step.", {
      x: 0.8, y: 2.65, w: 8.4, h: 0.45,
      fontSize: 14, color: C.lightGray, align: "center"
    });

    // CTA Boxes
    const ctas = [
      { t: "Request a Live Demo", d: "See the system in action on your campus", c: C.accentBlue },
      { t: "Pilot Program", d: "Start with one faculty — at no commitment", c: C.accentGreen },
      { t: "Detailed Proposal", d: "Full costings and technical specification", c: C.accentGold },
    ];
    ctas.forEach((c, i) => {
      const x = 0.5 + i * 3.17;
      slide.addShape(pres.shapes.RECTANGLE, {
        x, y: 3.28, w: 2.95, h: 1.2,
        fill: { color: C.cardBg },
        line: { color: c.c, width: 1.5 },
        shadow: { type: "outer", color: "000000", blur: 15, offset: 2, angle: 135, opacity: 0.3 }
      });
      slide.addText(c.t, {
        x: x + 0.1, y: 3.38, w: 2.75, h: 0.42,
        fontSize: 12.5, color: c.c, bold: true, align: "center"
      });
      slide.addText(c.d, {
        x: x + 0.1, y: 3.82, w: 2.75, h: 0.52,
        fontSize: 10, color: C.gray, align: "center"
      });
    });

    // Contact
    slide.addText("Contact Drexx Technologies", {
      x: 0.5, y: 4.65, w: 9.0, h: 0.32,
      fontSize: 12, color: C.accentBlue, bold: true, align: "center", charSpacing: 2
    });
    slide.addText("📧  hello@drexxtech.ng     📞  +234 812 392 7685     🌐  drexxtech.ng", {
      x: 0.5, y: 4.97, w: 9.0, h: 0.32,
      fontSize: 11, color: C.lightGray, align: "center"
    });

    // Bottom bar
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0, y: 5.32, w: 10, h: 0.3,
      fill: { color: C.cardBg }, line: { color: C.cardBg }
    });
    slide.addText("DREXX TECHNOLOGIES  ·  NFC Smart Card System  ·  UNIZIK Awka  ·  2025", {
      x: 0.3, y: 5.33, w: 9.4, h: 0.28,
      fontSize: 8, color: C.gray, align: "center", valign: "middle"
    });
  }

  // ─── WRITE FILE ────────────────────────────────────────────────────────────
  await pres.writeFile({ fileName: "/home/drexx/UNIZIK_NFC_SmartCard_Drexx.pptx" });
  console.log("✅ Presentation created successfully!");
}

main().catch(console.error);