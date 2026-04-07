const express = require("express");
const cors = require("cors");
const cheerio = require("cheerio");
const { chromium } = require("playwright");
const PDFDocument = require("pdfkit");
const crypto = require("crypto");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const connectDatabase = require("./config/db");
const User = require("./models/User");

const app = express();
const PORT = 5000;

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5000",
       process.env.CLIENT_URL,
    ],
    credentials: true,
  })
);
app.use(express.json({ limit: "5mb" }));
dotenv.config();
// database added here ==============
connectDatabase();

// routes define here =============
const authRouter = require("./routes/authRoutes");
const reportRouter = require("./routes/reportRoutes");


app.use("/api/auth", authRouter);
app.use("/api/report", reportRouter);

app.get("/", (req, res) => {
  res.send("Backend is running");
});

const savedReports = new Map();

function normalizeUrl(input) {
  const trimmed = String(input || "").trim();
  if (!trimmed) throw new Error("URL is required");

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

function cleanText(text) {
  return String(text || "")
    .replace(/\s+/g, " ")
    .trim();
}

function countWords(text) {
  const cleaned = cleanText(text);
  if (!cleaned) return 0;
  return cleaned.split(" ").filter(Boolean).length;
}

function containsAny(text, words) {
  const lower = String(text || "").toLowerCase();
  return words.some((word) => lower.includes(word));
}

function clamp(num, min, max) {
  return Math.max(min, Math.min(max, num));
}

function toTitle(value) {
  if (!value) return "";
  return String(value)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatSeconds(ms) {
  return `${(ms / 1000).toFixed(2)}s`;
}

function formatMs(ms) {
  return `${Math.round(ms)}ms`;
}

function formatMb(bytes) {
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function scoreToLabel(score) {
  if (score >= 90) return "excellent";
  if (score >= 75) return "good";
  if (score >= 55) return "average";
  return "poor";
}

function getConfidenceLevel({ pageSizeBytes, requestCount, loadTimeMs }) {
  let score = 0;
  if (pageSizeBytes > 0) score += 1;
  if (requestCount > 0) score += 1;
  if (loadTimeMs > 0) score += 1;

  if (score >= 3) return "medium";
  if (score === 2) return "medium";
  return "low";
}

function getStatusFromThreshold(value, goodMax, improveMax) {
  if (value <= goodMax) return "good";
  if (value <= improveMax) return "needs-improvement";
  return "poor";
}

function statusLabel(status) {
  if (status === "good") return "Strong performance";
  if (status === "needs-improvement") return "High impact issue";
  return "Below industry average";
}

function metricPercentileCopy(status) {
  if (status === "good")
    return "Faster or healthier than many comparable websites.";
  if (status === "needs-improvement")
    return "This is weaker than recommended for a modern conversion-focused page.";
  return "Slower or weaker than a large share of modern websites.";
}

function approximatePercentile(status) {
  if (status === "good") return "Faster than roughly 60% of websites";
  if (status === "needs-improvement")
    return "Slower than roughly 60% of websites";
  return "Slower than roughly 78% of websites";
}

function getHeadlineQuality(h1) {
  if (!h1) return "missing";

  const text = h1.trim();
  const lower = text.toLowerCase();
  const wordCount = countWords(text);

  const weakPatterns = [
    "welcome",
    "home",
    "homepage",
    "hello",
    "hi",
    "untitled",
  ];

  if (text.length < 10 || wordCount < 3) return "weak";
  if (containsAny(lower, weakPatterns)) return "weak";
  if (text.length >= 20 && wordCount >= 5) return "strong";

  return "medium";
}

function getMetaDescriptionQuality(metaDescription) {
  if (!metaDescription) return "missing";
  const length = metaDescription.length;
  if (length < 50) return "weak";
  if (length > 170) return "weak";
  return "good";
}

function getCtaStrength(text) {
  if (!text) return "missing";

  const lower = text.toLowerCase();

  const strongWords = [
    "get started",
    "book a call",
    "contact us",
    "contact me",
    "get a quote",
    "request a quote",
    "schedule a call",
    "book now",
    "request consultation",
    "start now",
    "talk to us",
    "talk to me",
    "free consultation",
    "book consultation",
    "request demo",
    "get in touch",
  ];

  const weakWords = [
    "learn more",
    "read more",
    "discover",
    "more info",
    "click here",
    "see more",
    "view more",
    "guide",
    "download",
  ];

  if (strongWords.some((word) => lower.includes(word))) return "strong";
  if (weakWords.some((word) => lower.includes(word))) return "weak";
  return "medium";
}

function getCtaPriority(text) {
  const lower = String(text || "").toLowerCase();

  const strong = [
    "book a call",
    "get a quote",
    "contact us",
    "contact me",
    "schedule a call",
    "request a quote",
    "get started",
    "free consultation",
    "talk to us",
    "talk to me",
    "book consultation",
    "request demo",
    "get in touch",
  ];

  const medium = [
    "book",
    "contact",
    "call",
    "quote",
    "demo",
    "start",
    "consultation",
    "request",
  ];

  const weak = [
    "learn more",
    "read more",
    "guide",
    "download",
    "discover",
    "see more",
    "view more",
  ];

  if (strong.some((word) => lower.includes(word))) return 3;
  if (medium.some((word) => lower.includes(word))) return 2;
  if (weak.some((word) => lower.includes(word))) return 1;
  return 0;
}

function getCheckState({ passed = false, warning = false, detected = true }) {
  if (!detected) return "not-detected";
  if (passed) return "passed";
  if (warning) return "warning";
  return "needs-fix";
}

function getWeakestCategory(categories) {
  return Object.entries(categories).sort((a, b) => a[1] - b[1])[0]?.[0] || null;
}

function severityWeight(severity) {
  if (severity === "high") return 3;
  if (severity === "medium") return 2;
  return 1;
}

function effortWeight(effort) {
  if (effort === "low") return 3;
  if (effort === "medium") return 2;
  return 1;
}

function categoryWeight(category) {
  const map = {
    performance: 4,
    seo: 3,
    trust: 3,
    ux: 3,
    technical: 2,
    content: 2,
    accessibility: 2,
  };
  return map[category] || 1;
}

function getPriorityRank(issue) {
  return (
    severityWeight(issue.severity) * 100 +
    effortWeight(issue.effort) * 10 +
    categoryWeight(issue.category)
  );
}

function buildVerdict({ score, weakestCategory, performanceStatus }) {
  if (score >= 90) {
    return {
      title: "Strong foundation with targeted improvement opportunities",
      tone: "excellent",
      summary:
        performanceStatus === "poor"
          ? "The site is strong overall, but performance is still holding it back. Speed-related fixes would likely create the fastest visible gain."
          : "The page shows strong structure, trust, and clarity. Only targeted refinements are needed to make the report feel top-tier.",
    };
  }

  if (score >= 75) {
    return {
      title: "Good overall quality, but important refinements remain",
      tone: "good",
      summary: `The website has a solid base, but ${toTitle(
        weakestCategory || "technical",
      )} is still limiting overall performance and polish.`,
    };
  }

  if (score >= 55) {
    return {
      title: "Usable foundation, but several important gaps remain",
      tone: "average",
      summary:
        "The page has some good building blocks, but multiple weaknesses are likely reducing trust, search visibility, or conversion strength.",
    };
  }

  return {
    title: "Important fundamentals need attention",
    tone: "poor",
    summary:
      "The audit found several missing or weak essentials that may reduce site quality, trust, and conversion effectiveness.",
  };
}

function buildExecutiveSummary({
  score,
  weakestCategory,
  performanceStatus,
  headlineQuality,
  ctaStrength,
}) {
  const speedProblem = performanceStatus === "poor";
  const clarityProblem =
    headlineQuality === "weak" || headlineQuality === "missing";
  const ctaProblem = ctaStrength === "weak" || ctaStrength === "missing";

  return {
    whatIsWorking:
      score >= 85
        ? "The page has a strong overall structure, credible presentation, and solid content coverage."
        : "The page includes some useful foundational elements that can be improved rather than rebuilt from scratch.",
    whatIsHurting: speedProblem
      ? "Performance is the biggest issue, and slow loading is likely reducing trust, engagement, and conversion potential."
      : clarityProblem || ctaProblem
        ? "Messaging and conversion clarity are weaker than they should be, which may reduce action-taking."
        : `The weakest category is ${toTitle(
            weakestCategory || "technical",
          )}, which is limiting the page from feeling fully polished.`,
    whatToDoFirst: speedProblem
      ? "Prioritize performance fixes first, then improve weaker messaging or trust elements."
      : clarityProblem
        ? "Strengthen the main headline and supporting copy first."
        : ctaProblem
          ? "Improve the CTA wording and placement first."
          : `Prioritize improvements in ${toTitle(weakestCategory || "technical")} first.`,
  };
}

function buildProgressScaffold(issues) {
  return {
    totalIssues: issues.length,
    fixedIssues: 0,
    remainingIssues: issues.length,
    summary: `You’ve fixed 0 of ${issues.length} issues`,
    supportsMarkFixed: true,
  };
}

function buildPerformanceMetrics({
  loadTimeMs,
  requestCount,
  pageSizeBytes,
  hasLayoutShiftRisk,
}) {
  const fcpMs = Math.round(loadTimeMs * 0.32);
  const lcpMs = Math.round(loadTimeMs * 0.72);
  const tbtMs = Math.max(80, Math.round(loadTimeMs * 0.18));
  const cls = hasLayoutShiftRisk ? 0.18 : 0.05;

  const fcpStatus = getStatusFromThreshold(fcpMs, 1800, 3000);
  const lcpStatus = getStatusFromThreshold(lcpMs, 2500, 4000);
  const tbtStatus = getStatusFromThreshold(tbtMs, 200, 600);
  const clsStatus =
    cls <= 0.1 ? "good" : cls <= 0.25 ? "needs-improvement" : "poor";
  const pageSizeMb = pageSizeBytes / (1024 * 1024);
  const pageSizeStatus =
    pageSizeMb <= 2 ? "good" : pageSizeMb <= 4 ? "needs-improvement" : "poor";
  const requestStatus =
    requestCount <= 60
      ? "good"
      : requestCount <= 120
        ? "needs-improvement"
        : "poor";

  return [
    {
      key: "fcp",
      label: "First visible content",
      technicalLabel: "First Contentful Paint",
      shortLabel: "FCP",
      value: formatSeconds(fcpMs),
      rawValue: fcpMs,
      unit: "ms",
      status: fcpStatus,
      premiumStatus: statusLabel(fcpStatus),
      percentileText: approximatePercentile(fcpStatus),
      tag: "Estimated",
      tooltip:
        "This measures when users first see something useful on the page.",
      explanation: metricPercentileCopy(fcpStatus),
    },
    {
      key: "lcp",
      label: "Main content loaded",
      technicalLabel: "Largest Contentful Paint",
      shortLabel: "LCP",
      value: formatSeconds(lcpMs),
      rawValue: lcpMs,
      unit: "ms",
      status: lcpStatus,
      premiumStatus: statusLabel(lcpStatus),
      percentileText: approximatePercentile(lcpStatus),
      tag: "Estimated",
      tooltip:
        "This measures when the main visible content is loaded enough to be useful.",
      explanation: metricPercentileCopy(lcpStatus),
    },
    {
      key: "tbt",
      label: "Blocked interaction time",
      technicalLabel: "Total Blocking Time",
      shortLabel: "TBT",
      value: formatMs(tbtMs),
      rawValue: tbtMs,
      unit: "ms",
      status: tbtStatus,
      premiumStatus: statusLabel(tbtStatus),
      percentileText: approximatePercentile(tbtStatus),
      tag: "Estimated",
      tooltip:
        "This estimates how long scripts block users from interacting smoothly with the page.",
      explanation: metricPercentileCopy(tbtStatus),
    },
    {
      key: "cls",
      label: "Visual stability",
      technicalLabel: "Cumulative Layout Shift",
      shortLabel: "CLS",
      value: cls.toFixed(2),
      rawValue: cls,
      unit: "score",
      status: clsStatus,
      premiumStatus: statusLabel(clsStatus),
      percentileText: approximatePercentile(clsStatus),
      tag: "Estimated",
      tooltip:
        "This measures how much the page unexpectedly shifts while loading.",
      explanation: metricPercentileCopy(clsStatus),
    },
    {
      key: "page-size",
      label: "Total page size",
      technicalLabel: "Total Page Size",
      shortLabel: "Page Size",
      value: formatMb(pageSizeBytes),
      rawValue: Number(pageSizeMb.toFixed(2)),
      unit: "mb",
      status: pageSizeStatus,
      premiumStatus: statusLabel(pageSizeStatus),
      percentileText: approximatePercentile(pageSizeStatus),
      tag: "Measured",
      tooltip:
        "This is the total weight of the page resources we observed loading.",
      explanation: metricPercentileCopy(pageSizeStatus),
    },
    {
      key: "requests",
      label: "Total requests",
      technicalLabel: "Total Requests",
      shortLabel: "Requests",
      value: String(requestCount),
      rawValue: requestCount,
      unit: "count",
      status: requestStatus,
      premiumStatus: statusLabel(requestStatus),
      percentileText: approximatePercentile(requestStatus),
      tag: "Measured",
      tooltip:
        "This is how many requests the browser had to make to load the page.",
      explanation: metricPercentileCopy(requestStatus),
    },
  ];
}

function buildScoreBreakdown(categories, recommendations) {
  const categoryMeta = {
    performance: { max: 20, title: "Performance" },
    seo: { max: 20, title: "SEO" },
    trust: { max: 20, title: "Trust" },
    content: { max: 20, title: "Content" },
    technical: { max: 20, title: "Technical" },
  };

  return Object.entries(categories).map(([key, score]) => {
    const max = categoryMeta[key]?.max || 20;
    const deduction = Math.max(max - score, 0);
    const related = recommendations.filter(
      (item) =>
        item.category === key ||
        (key === "technical" && item.category === "ux"),
    );
    const topReasons = related
      .sort((a, b) => (b.scoreImpact || 0) - (a.scoreImpact || 0))
      .slice(0, 2)
      .map((item) => item.problem);

    let deductionReason = "No major deductions.";
    if (deduction > 0 && topReasons.length > 0) {
      deductionReason = `-${deduction} points due to ${topReasons.join(" and ").toLowerCase()}.`;
    }

    return {
      category: key,
      label: categoryMeta[key]?.title || toTitle(key),
      score,
      max,
      deduction,
      deductionReason,
      relatedIssueIds: related.map((item) => item.id),
    };
  });
}

function buildFixDetails(issue) {
  const defaults = {
    explanation: issue.problem,
    whyItMatters: issue.impact,
    steps: [issue.fix],
    tools: [],
    codeHint: null,
    expectedImpact: issue.estimatedEffect || null,
    estimatedScoreImprovement: issue.scoreImpact || 0,
  };

  const map = {
    "performance-speed-warning": {
      explanation:
        "The page is taking too long to fully load, which means visitors wait longer before the experience feels complete.",
      steps: [
        "Compress large images before upload.",
        "Defer or remove non-critical scripts so important content loads first.",
        "Enable lazy loading for below-the-fold images and embeds.",
      ],
      tools: ["TinyPNG", "Cloudflare", "PageSpeed Insights"],
      codeHint:
        'Add `loading="lazy"` to below-the-fold images and defer non-critical scripts where possible.',
    },
    "performance-speed-critical": {
      explanation:
        "The page is significantly slower than expected, which can make visitors leave before they engage.",
      steps: [
        "Compress and convert heavy images to WebP.",
        "Reduce third-party widgets and defer non-essential JavaScript.",
        "Enable lazy loading for off-screen media and optimize server caching.",
      ],
      tools: ["TinyPNG", "Cloudflare", "ImageOptim", "PageSpeed Insights"],
      codeHint:
        'Use modern image formats like WebP and add `loading="lazy"` to non-critical images.',
    },
    "page-size-warning": {
      explanation:
        "The page payload is heavier than ideal, which increases download time on slower connections.",
      steps: [
        "Identify your largest images or media files.",
        "Compress them before upload and use WebP where possible.",
        "Remove unused assets or heavy sections that do not support conversions.",
      ],
      tools: ["TinyPNG", "Squoosh", "Cloudinary"],
      codeHint:
        "Aim to keep major hero images under roughly 300KB where practical.",
    },
    "page-size-heavy": {
      explanation:
        "The page payload is too large, which can meaningfully delay both visible content and full loading.",
      steps: [
        "Audit the heaviest assets first.",
        "Convert oversized images to WebP and compress them aggressively.",
        "Lazy-load anything not needed immediately when the page opens.",
      ],
      tools: ["TinyPNG", "Cloudinary", "ImageOptim"],
      codeHint:
        'For React image tags, use `loading="lazy"` on non-critical imagery and serve responsive image sizes.',
    },
    "request-count-warning": {
      explanation:
        "The page is making more requests than ideal, which can slow down rendering and add network overhead.",
      steps: [
        "Audit third-party scripts and remove anything non-essential.",
        "Combine or reduce duplicate CSS and JavaScript bundles.",
        "Simplify plugin/widget usage where possible.",
      ],
      tools: ["Chrome DevTools", "PageSpeed Insights", "Cloudflare"],
      codeHint:
        "Fewer third-party embeds and analytics scripts usually improve request count quickly.",
    },
    "request-count-high": {
      explanation:
        "The page is making too many network requests, increasing complexity and slowing load performance.",
      steps: [
        "Remove unnecessary third-party scripts and widgets.",
        "Consolidate CSS and JavaScript bundles.",
        "Delay non-essential resources until after main content is visible.",
      ],
      tools: [
        "Chrome DevTools",
        "PageSpeed Insights",
        "Webpack Bundle Analyzer",
      ],
      codeHint:
        "Focus first on the largest and least essential requests rather than every request equally.",
    },
    "seo-meta-missing": {
      explanation:
        "Search engines may auto-generate a poor snippet when no meta description is present.",
      steps: [
        "Write a 140–160 character meta description.",
        "Explain the page value clearly and naturally.",
        "Include the main benefit and relevant keyword once.",
      ],
      tools: ["Yoast SEO", "Rank Math", "Screaming Frog"],
      codeHint:
        '<meta name="description" content="Clear summary of your page value in about 140-160 characters.">',
    },
    "seo-meta-weak": {
      explanation:
        "The current meta description is present, but it may be too short, too long, or not persuasive enough.",
      steps: [
        "Rewrite the description into a clear 140–160 character summary.",
        "Lead with the main outcome or benefit.",
        "Avoid vague wording and unnecessary filler.",
      ],
      tools: ["Yoast SEO", "Rank Math"],
      codeHint:
        '<meta name="description" content="Specific benefit-driven summary for the page.">',
    },
    "trust-https": {
      explanation:
        "Without HTTPS, browsers and users may treat the website as less trustworthy or secure.",
      steps: [
        "Install an SSL certificate on your hosting provider.",
        "Force redirect all traffic from HTTP to HTTPS.",
        "Update internal links and canonical URLs if needed.",
      ],
      tools: ["Cloudflare", "cPanel", "Vercel", "Netlify"],
      codeHint:
        "Set a site-wide redirect from http:// to https:// once SSL is active.",
    },
    "content-headline-weak": {
      explanation:
        "Your headline is not clearly communicating what the page offers and why someone should care.",
      steps: [
        "State what you do in plain language.",
        "Add who it is for or the result it creates.",
        "Place the revised headline prominently at the top of the page.",
      ],
      tools: ["Notion", "Google Docs"],
      codeHint:
        "Try this structure: [Service] for [Audience] that helps you [Outcome].",
    },
    "content-headline-missing": {
      explanation:
        "Without a clear headline, users may not understand the page quickly enough to keep reading.",
      steps: [
        "Add one clear H1 near the top of the page.",
        "Summarize the page purpose in plain English.",
        "Make sure the headline matches the visitor intent.",
      ],
      tools: ["Notion", "Google Docs"],
      codeHint:
        "Keep one primary H1 only, and make it specific rather than generic.",
    },
    "technical-cta-missing": {
      explanation:
        "Users need a clear next step. Without one, they may leave without acting.",
      steps: [
        "Add a primary CTA near the top of the page.",
        "Repeat the same CTA in at least one later section.",
        "Use direct action language like Book a Call or Get a Quote.",
      ],
      tools: ["Figma", "Hotjar"],
      codeHint:
        "Place a high-contrast button near the hero section and repeat it lower on the page.",
    },
    "technical-cta-weak": {
      explanation:
        "A vague CTA makes it harder for users to understand what happens next.",
      steps: [
        "Replace generic wording with an action-oriented CTA.",
        "Make the CTA outcome obvious.",
        "Use the same CTA consistently across the page.",
      ],
      tools: ["Figma", "Hotjar"],
      codeHint:
        'Prefer labels like "Book a Call", "Get a Quote", or "Start Now" over "Learn More".',
    },
  };

  const override = map[issue.id];
  return override ? { ...defaults, ...override } : defaults;
}

function createReportId() {
  return crypto.randomBytes(8).toString("hex");
}

function buildShareMeta(reportId) {
  return {
    reportId,
    sharePath: `/results?report=${reportId}`,
    pdfPath: `/api/report/${reportId}/pdf`,
    apiPath: `/api/report/${reportId}`,
  };
}

function getTodayDateString() {
  return new Date().toISOString().split("T")[0];
}

function resetAuditUsageIfNeeded(user) {
  const today = getTodayDateString();

  if (user.usageDate !== today) {
    user.auditsUsedToday = 0;
    user.usageDate = today;
  }
}

function getAuditUsageData(user) {
  if (!user) return null;

  return {
    plan: user.plan,
    auditsUsedToday: user.auditsUsedToday,
    auditsRemaining:
      user.plan === "free" ? Math.max(0, 2 - user.auditsUsedToday) : null,
    usageDate: user.usageDate,
  };
}

async function getAuthenticatedUserFromRequest(req) {
  try {
    const authHeader = req.headers.authorization || "";

    if (!authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded?.userId) {
      return null;
    }

    const user = await User.findById(decoded.userId);

    return user || null;
  } catch {
    return null;
  }
}

function createAuditPdfBuffer(audit) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
      bufferPages: true,
    });

    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const pageWidth =
      doc.page.width - doc.page.margins.left - doc.page.margins.right;

    const addSectionTitle = (title) => {
      doc.moveDown(1);
      doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .fillColor("#475569")
        .text(title.toUpperCase(), {
          width: pageWidth,
        });
      doc.moveDown(0.4);
    };

    const addRule = () => {
      const y = doc.y;
      doc
        .moveTo(doc.page.margins.left, y)
        .lineTo(doc.page.width - doc.page.margins.right, y)
        .strokeColor("#E2E8F0")
        .lineWidth(1)
        .stroke();
      doc.moveDown(0.8);
    };

    const ensureSpace = (height = 100) => {
      if (doc.y + height > doc.page.height - doc.page.margins.bottom) {
        doc.addPage();
      }
    };

    doc.fillColor("#0f172a");
    doc.font("Helvetica-Bold").fontSize(24).text("Website Audit Report");
    doc.moveDown(0.3);
    doc
      .font("Helvetica")
      .fontSize(11)
      .fillColor("#475569")
      .text(String(audit.url || ""));
    doc.text(
      `Generated ${audit.generatedAt ? new Date(audit.generatedAt).toLocaleString() : "just now"}`,
    );
    doc.moveDown(0.8);

    doc
      .roundedRect(doc.page.margins.left, doc.y, pageWidth, 92, 14)
      .fillAndStroke("#F8FAFC", "#E2E8F0");
    const boxTop = doc.y;
    doc.fillColor("#0f172a");
    doc
      .font("Helvetica-Bold")
      .fontSize(38)
      .text(String(audit.score ?? 0), doc.page.margins.left + 24, boxTop + 18, {
        width: 100,
      });
    doc
      .font("Helvetica")
      .fontSize(11)
      .fillColor("#475569")
      .text("Overall score", doc.page.margins.left + 24, boxTop + 60);

    doc
      .font("Helvetica-Bold")
      .fontSize(16)
      .fillColor("#0f172a")
      .text(
        audit.verdict?.title || "",
        doc.page.margins.left + 150,
        boxTop + 20,
        {
          width: pageWidth - 170,
        },
      );
    doc
      .font("Helvetica")
      .fontSize(11)
      .fillColor("#475569")
      .text(
        audit.verdict?.summary || "",
        doc.page.margins.left + 150,
        boxTop + 48,
        {
          width: pageWidth - 170,
        },
      );

    doc.y = boxTop + 110;

    addSectionTitle("What to Fix First");
    (audit.whatToFixFirst || []).slice(0, 3).forEach((item, index) => {
      ensureSpace(90);
      doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .fillColor("#0f172a")
        .text(`${index + 1}. ${item.problem}`);
      doc
        .font("Helvetica")
        .fontSize(10)
        .fillColor("#475569")
        .text(`Impact: ${item.impact}`);
      doc.text(`Fix: ${item.fix}`);
      doc
        .fillColor("#166534")
        .text(
          `Estimated score improvement: +${item.estimatedScoreImprovement || 0} points`,
        );
      doc.moveDown(0.8);
    });
    addRule();

    addSectionTitle("Speed Summary");
    const speedSummary = audit.speedContext || {};
    doc
      .font("Helvetica-Bold")
      .fontSize(11)
      .fillColor("#0f172a")
      .text(
        `${speedSummary.userVisibleLoadTime?.label || "First visible content"}: ${speedSummary.userVisibleLoadTime?.value || "N/A"}`,
      );
    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#475569")
      .text(speedSummary.userVisibleLoadTime?.explanation || "");
    doc.moveDown(0.6);
    doc
      .font("Helvetica-Bold")
      .fontSize(11)
      .fillColor("#0f172a")
      .text(
        `${speedSummary.estimatedFullLoadTime?.label || "Full page load"}: ${speedSummary.estimatedFullLoadTime?.value || "N/A"}`,
      );
    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#475569")
      .text(speedSummary.estimatedFullLoadTime?.explanation || "");
    addRule();

    addSectionTitle("Performance Metrics");
    (audit.performanceMetrics || []).forEach((metric) => {
      ensureSpace(48);
      doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .fillColor("#0f172a")
        .text(
          `${metric.label}: ${metric.value} (${metric.premiumStatus || metric.status || "N/A"})`,
        );
      doc
        .font("Helvetica")
        .fontSize(10)
        .fillColor("#475569")
        .text(metric.tooltip || "");
      doc.moveDown(0.5);
    });
    addRule();

    addSectionTitle("Recommendations");
    (audit.recommendations || []).slice(0, 8).forEach((item, index) => {
      ensureSpace(110);
      doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .fillColor("#0f172a")
        .text(`${index + 1}. ${item.problem}`);
      doc
        .font("Helvetica")
        .fontSize(10)
        .fillColor("#475569")
        .text(`Why it matters: ${item.impact}`);
      doc.text(`Fix: ${item.fix}`);
      if (item.estimatedEffect) {
        doc.text(`Expected impact: ${item.estimatedEffect}`);
      }
      doc.fillColor("#166534").text(`Score impact: +${item.scoreImpact || 0}`);
      doc.fillColor("#475569");
      doc.moveDown(0.6);
    });

    doc.end();
  });
}

async function analyzeWebsite(url) {
  let browser;

  try {
    browser = await chromium.launch({ headless: true });

    const page = await browser.newPage({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
      viewport: { width: 1440, height: 900 },
    });

    let requestCount = 0;
    let pageSizeBytes = 0;

    page.on("requestfinished", async (request) => {
      requestCount += 1;
      try {
        const response = await request.response();
        if (response) {
          const headers = response.headers();
          const contentLength = headers["content-length"];
          if (contentLength && !Number.isNaN(Number(contentLength))) {
            pageSizeBytes += Number(contentLength);
          } else {
            const body = await response.body().catch(() => null);
            if (body) pageSizeBytes += body.length;
          }
        }
      } catch {
        // Ignore network accounting errors.
      }
    });

    const startTime = Date.now();

    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(2000);

    const loadTimeMs = Date.now() - startTime;
    const finalUrl = page.url();
    const html = await page.content();
    const pageTitle = await page.title();

    const $ = cheerio.load(html);
    $("script, style, noscript").remove();

    const title = cleanText(pageTitle || $("title").first().text());
    const metaDescription = cleanText(
      $('meta[name="description"]').attr("content") || "",
    );
    const h1 = cleanText($("h1").first().text());

    const headings = $("h1, h2, h3")
      .map((i, el) => cleanText($(el).text()))
      .get()
      .filter(Boolean);

    const images = $("img");
    const imageCount = images.length;
    const imagesWithAlt = images
      .map((i, el) => ($(el).attr("alt") || "").trim())
      .get()
      .filter(Boolean).length;
    const imagesMissingAlt = imageCount - imagesWithAlt;

    const imageSources = $("img")
      .map((i, el) => $(el).attr("src") || "")
      .get()
      .filter(Boolean);

    const formsCount = $("form").length;
    const paragraphCount = $("p").length;

    const semanticSectionCount =
      $("section").length +
      $("main").length +
      $("article").length +
      $("header").length +
      $("footer").length;

    const visualSectionCount = Math.max(semanticSectionCount, headings.length);

    const allLinksAndButtons = $("a, button")
      .map((i, el) => {
        const text = cleanText($(el).text());
        const tag = el.tagName?.toLowerCase() || "";
        const classes = ($(el).attr("class") || "").toLowerCase();
        return { text, tag, classes };
      })
      .get()
      .filter((item) => item.text);

    const realButtons = $("button").length;

    const ctaLikeLinks = $("a").filter((i, el) => {
      const text = cleanText($(el).text()).toLowerCase();
      const classes = ($(el).attr("class") || "").toLowerCase();

      return (
        text.includes("contact") ||
        text.includes("quote") ||
        text.includes("book") ||
        text.includes("call") ||
        text.includes("start") ||
        text.includes("demo") ||
        text.includes("consultation") ||
        text.includes("request") ||
        classes.includes("btn") ||
        classes.includes("button")
      );
    }).length;

    const buttonCount = realButtons + ctaLikeLinks;

    const bodyText = cleanText($("body").text());
    const wordCount = countWords(bodyText);

    const phoneRegex =
      /(\+?\d{1,3}[\s\-()]*)?(\(?\d{2,4}\)?[\s\-()]*)?\d{3,4}[\s\-()]?\d{3,4}/g;
    const emailRegex = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;

    const phonesFound = bodyText.match(phoneRegex) || [];
    const emailsFound = bodyText.match(emailRegex) || [];

    const hasPhone = phonesFound.length > 0;
    const hasEmail = emailsFound.length > 0;
    const hasContactInfo = hasPhone || hasEmail;

    const testimonialKeywords = [
      "testimonial",
      "testimonials",
      "reviews",
      "what clients say",
      "client feedback",
      "case study",
      "case studies",
      "success stories",
    ];

    const realTrustKeywords = [
      "trusted by",
      "certified",
      "award",
      "awards",
      "partners",
      "our clients",
      "client logos",
      "guarantee",
      "guarantees",
      "accredited",
      "verified",
      "proven results",
    ];

    const aboutKeywords = [
      "about us",
      "about me",
      "our story",
      "who we are",
      "who i am",
      "our company",
    ];

    const hasTestimonials = containsAny(bodyText, testimonialKeywords);
    const hasRealTrustProof = containsAny(bodyText, realTrustKeywords);
    const hasAboutSection = containsAny(bodyText, aboutKeywords);
    const hasSocialLinks =
      $(
        'a[href*="linkedin.com"], a[href*="facebook.com"], a[href*="instagram.com"], a[href*="twitter.com"], a[href*="x.com"], a[href*="youtube.com"], a[href*="tiktok.com"]',
      ).length > 0;

    const usesHttps = finalUrl.startsWith("https://");
    const hasLayoutShiftRisk = $("iframe, video, img").length > 6;

    const ctaCandidates = allLinksAndButtons
      .map((item) => ({
        text: item.text,
        priority: getCtaPriority(item.text),
      }))
      .filter((item) => item.text && item.priority > 0)
      .sort((a, b) => b.priority - a.priority);

    const primaryCTA = ctaCandidates[0]?.text || null;
    const ctaStrength = getCtaStrength(primaryCTA);
    const headlineQuality = getHeadlineQuality(h1);
    const metaDescriptionQuality = getMetaDescriptionQuality(metaDescription);

    const categories = {
      performance: 0,
      seo: 0,
      trust: 0,
      content: 0,
      technical: 0,
    };

    const recommendations = [];
    const issues = [];

    function addIssue({
      id,
      category,
      severity,
      effort,
      problem,
      impact,
      fix,
      estimatedEffect,
      scoreImpact,
      source = "simulated-lighthouse",
      tag = "Estimated",
      businessImpact,
    }) {
      const issue = {
        id,
        category,
        severity,
        effort,
        problem,
        impact,
        fix,
        estimatedEffect: estimatedEffect || null,
        scoreImpact: scoreImpact || 0,
        source,
        tag,
        businessImpact:
          businessImpact ||
          "This may reduce conversions, hurt SEO visibility, or make users leave earlier.",
        priorityRank: 0,
      };

      issue.priorityRank = getPriorityRank(issue);
      issue.fixDetails = buildFixDetails(issue);

      recommendations.push(issue);

      issues.push({
        id,
        category,
        severity,
        effort,
        problem,
        impact,
        scoreImpact: issue.scoreImpact,
        priorityRank: issue.priorityRank,
      });
    }

    if (loadTimeMs <= 2500) {
      categories.performance += 10;
    } else if (loadTimeMs <= 4500) {
      categories.performance += 7;
    } else if (loadTimeMs <= 8000) {
      categories.performance += 4;
      addIssue({
        id: "performance-speed-warning",
        category: "performance",
        severity: "medium",
        effort: "medium",
        problem: `Estimated full page load is ${formatSeconds(loadTimeMs)}, which is slower than recommended.`,
        impact:
          "Slower pages often reduce engagement and can increase bounce rate, especially on mobile connections.",
        fix: "Reduce large assets, defer non-critical scripts, and compress images so more content renders earlier.",
        estimatedEffect: "Could reduce perceived wait time by 1–2 seconds.",
        scoreImpact: 8,
        businessImpact:
          "This may cause users to leave before exploring the page fully.",
        tag: "Estimated",
      });
    } else {
      addIssue({
        id: "performance-speed-critical",
        category: "performance",
        severity: "high",
        effort: "high",
        problem: `Estimated full page load is ${formatSeconds(loadTimeMs)}, which is well below industry average.`,
        impact:
          "Very slow loading can significantly increase bounce rate, reduce trust, and hurt SEO performance.",
        fix: "Compress and convert large images to WebP, remove or defer blocking scripts, enable lazy loading, and reduce third-party assets.",
        estimatedEffect:
          "Could reduce load time by roughly 2–4 seconds depending on asset weight.",
        scoreImpact: 12,
        businessImpact:
          "This can reduce conversions significantly because users may leave before the page feels ready.",
        tag: "Estimated",
      });
    }

    if (pageSizeBytes <= 2 * 1024 * 1024) {
      categories.performance += 5;
    } else if (pageSizeBytes <= 4 * 1024 * 1024) {
      categories.performance += 3;
      addIssue({
        id: "page-size-warning",
        category: "performance",
        severity: "medium",
        effort: "medium",
        problem: `Total page size is ${formatMb(pageSizeBytes)}, which is moderately heavy.`,
        impact:
          "Larger pages usually take longer to download, especially for first-time visitors and mobile users.",
        fix: "Compress images, reduce unused assets, and trim oversized media files.",
        estimatedEffect:
          "Can improve initial loading speed and lower bandwidth costs.",
        scoreImpact: 6,
        businessImpact:
          "This may slow first visits and create a heavier mobile experience.",
        tag: "Measured",
      });
    } else {
      addIssue({
        id: "page-size-heavy",
        category: "performance",
        severity: "high",
        effort: "medium",
        problem: `Total page size is ${formatMb(pageSizeBytes)}, which is too heavy for a conversion-focused page.`,
        impact:
          "Heavy pages often slow down rendering and delay meaningful content from appearing.",
        fix: "Audit the largest files, convert imagery to modern formats, lazy-load non-critical assets, and remove unused resources.",
        estimatedEffect:
          "Can noticeably improve load speed and Largest Contentful Paint.",
        scoreImpact: 8,
        businessImpact:
          "This can hurt conversions because users see a slower, heavier experience.",
        tag: "Measured",
      });
    }

    if (requestCount <= 60) {
      categories.performance += 5;
    } else if (requestCount <= 120) {
      categories.performance += 3;
      addIssue({
        id: "request-count-warning",
        category: "performance",
        severity: "medium",
        effort: "medium",
        problem: `The page makes ${requestCount} requests, which is relatively high.`,
        impact:
          "More requests can increase loading overhead and make the page feel slower.",
        fix: "Combine or remove unnecessary assets, reduce third-party widgets, and simplify the dependency footprint.",
        estimatedEffect:
          "Can improve load consistency and reduce network overhead.",
        scoreImpact: 4,
        businessImpact:
          "This may make the site feel slower and less responsive.",
        tag: "Measured",
      });
    } else {
      addIssue({
        id: "request-count-high",
        category: "performance",
        severity: "high",
        effort: "high",
        problem: `The page makes ${requestCount} requests, which is too many for efficient loading.`,
        impact:
          "A high request count usually increases complexity and can delay rendering on slower networks.",
        fix: "Reduce third-party scripts, consolidate asset bundles, and remove non-essential resources.",
        estimatedEffect: "Can improve FCP, TBT, and overall responsiveness.",
        scoreImpact: 6,
        businessImpact:
          "This may cause users to wait longer and leave earlier.",
        tag: "Measured",
      });
    }

    if (title) {
      categories.seo += 6;
    } else {
      addIssue({
        id: "seo-title-missing",
        category: "seo",
        severity: "high",
        effort: "low",
        problem: "No page title was detected.",
        impact:
          "Missing titles weaken search visibility and make the page harder to understand in browser tabs and search results.",
        fix: "Add a clear page title that describes the page topic and primary value.",
        estimatedEffect:
          "Can improve search relevance and click-through understanding.",
        scoreImpact: 6,
        businessImpact:
          "This can hurt SEO ranking and reduce click-through from search.",
      });
    }

    if (metaDescriptionQuality === "good") {
      categories.seo += 6;
    } else if (metaDescriptionQuality === "weak") {
      categories.seo += 3;
      addIssue({
        id: "seo-meta-weak",
        category: "seo",
        severity: "medium",
        effort: "low",
        problem: `Meta description exists but appears weak (${metaDescription.length} characters).`,
        impact:
          "Weak metadata can reduce click-through rate because search snippets may look incomplete or less compelling.",
        fix: "Rewrite the meta description to clearly summarize the page value in about 140–160 characters.",
        estimatedEffect: "Can improve search result appearance and CTR.",
        scoreImpact: 3,
        businessImpact:
          "This may reduce search clicks even when rankings are decent.",
      });
    } else {
      addIssue({
        id: "seo-meta-missing",
        category: "seo",
        severity: "high",
        effort: "low",
        problem: "No meta description was found.",
        impact:
          "Search engines may generate a weaker snippet automatically, which can reduce click-through performance.",
        fix: "Add a custom meta description that clearly explains the page and encourages the right click.",
        estimatedEffect: "Can improve snippet quality and search presentation.",
        scoreImpact: 4,
        businessImpact:
          "This can hurt search click-through and reduce qualified visits.",
      });
    }

    if (headings.length >= 4) {
      categories.seo += 4;
    } else if (headings.length >= 2) {
      categories.seo += 2;
    } else {
      addIssue({
        id: "seo-heading-structure",
        category: "seo",
        severity: "medium",
        effort: "low",
        problem: `The page has limited heading structure (${headings.length} headings detected).`,
        impact:
          "Weak heading hierarchy can hurt readability and make the content harder for search engines to understand.",
        fix: "Break the page into clearer sections with descriptive subheadings.",
        estimatedEffect: "Can improve readability and topical clarity.",
        scoreImpact: 2,
        businessImpact:
          "This may weaken SEO clarity and make the page harder to scan.",
      });
    }

    if (imagesMissingAlt === 0 || imageCount === 0) {
      categories.seo += 4;
    } else {
      addIssue({
        id: "seo-alt-text",
        category: "seo",
        severity:
          imagesMissingAlt > Math.max(2, Math.floor(imageCount / 2))
            ? "medium"
            : "low",
        effort: imagesMissingAlt > 3 ? "medium" : "low",
        problem: `${imagesMissingAlt} image${imagesMissingAlt === 1 ? "" : "s"} appear to be missing alt text.`,
        impact:
          "Missing alt text weakens image accessibility and reduces descriptive context for search engines.",
        fix: "Add concise, descriptive alt text to important images that convey meaning.",
        estimatedEffect:
          "Can improve accessibility and image-related search clarity.",
        scoreImpact: imagesMissingAlt > 3 ? 3 : 1,
        businessImpact:
          "This may hurt accessibility quality and reduce image search visibility.",
      });
    }

    if (hasTestimonials) {
      categories.trust += 5;
    } else {
      addIssue({
        id: "trust-testimonials",
        category: "trust",
        severity: "medium",
        effort: "medium",
        problem: "No testimonials or review-style trust signals were detected.",
        impact:
          "Without social proof, visitors may hesitate more before contacting or buying.",
        fix: "Add testimonials, client reviews, short case studies, or proof quotes near key decision points.",
        estimatedEffect: "Can increase credibility and reduce hesitation.",
        scoreImpact: 5,
        businessImpact:
          "This may reduce conversions because users do not see enough reassurance.",
      });
    }

    if (hasContactInfo) {
      categories.trust += 4;
    } else {
      addIssue({
        id: "trust-contact-info",
        category: "trust",
        severity: "medium",
        effort: "low",
        problem: "No visible contact information was detected.",
        impact:
          "Missing contact details can make the business feel less legitimate and harder to trust.",
        fix: "Add a visible email address, phone number, or contact method in the header, footer, or contact section.",
        estimatedEffect:
          "Can improve perceived legitimacy and lead confidence.",
        scoreImpact: 4,
        businessImpact:
          "This may cause users to hesitate or abandon before reaching out.",
      });
    }

    if (hasAboutSection) {
      categories.trust += 4;
    } else {
      addIssue({
        id: "trust-about",
        category: "trust",
        severity: "medium",
        effort: "medium",
        problem: "No clear About section was detected.",
        impact:
          "Visitors may struggle to understand who is behind the business and why they should trust it.",
        fix: "Add an About section that explains your background, expertise, and approach.",
        estimatedEffect: "Can improve trust and reduce uncertainty.",
        scoreImpact: 3,
        businessImpact:
          "This may reduce confidence, especially for new visitors.",
      });
    }

    if (hasRealTrustProof) {
      categories.trust += 4;
    } else {
      addIssue({
        id: "trust-proof",
        category: "trust",
        severity: "high",
        effort: "medium",
        problem: "Strong trust proof was not clearly detected.",
        impact:
          "Missing trust proof can reduce confidence at the point where users are deciding whether to act.",
        fix: "Add certifications, awards, guarantees, partner logos, media mentions, or concrete client proof.",
        estimatedEffect:
          "Can improve conversion confidence and reduce friction.",
        scoreImpact: 5,
        businessImpact:
          "This can reduce conversions because users may not feel reassured enough to act.",
      });
    }

    if (usesHttps) {
      categories.trust += 3;
    } else {
      addIssue({
        id: "trust-https",
        category: "trust",
        severity: "high",
        effort: "medium",
        problem: "Website is not using HTTPS.",
        impact:
          "This can create immediate trust and security concerns for users and browsers.",
        fix: "Install an SSL certificate and redirect all traffic to HTTPS.",
        estimatedEffect:
          "Can improve trust, browser compatibility, and security perception.",
        scoreImpact: 6,
        businessImpact:
          "This may cause users to leave because the site feels unsafe.",
      });
    }

    if (wordCount >= 800) {
      categories.content += 10;
    } else if (wordCount >= 300) {
      categories.content += 6;
    } else if (wordCount >= 120) {
      categories.content += 3;
      addIssue({
        id: "content-thin",
        category: "content",
        severity: "medium",
        effort: "medium",
        problem: `Content depth is limited (${wordCount} words detected).`,
        impact:
          "Thin pages are often less persuasive and less useful for both visitors and search engines.",
        fix: "Add helpful content that explains services, process, benefits, and next steps more clearly.",
        estimatedEffect: "Can improve clarity, trust, and search usefulness.",
        scoreImpact: 5,
        businessImpact:
          "This may reduce conversions because users do not get enough context to decide.",
      });
    } else {
      addIssue({
        id: "content-short",
        category: "content",
        severity: "high",
        effort: "medium",
        problem: `Page content is too short (${wordCount} words detected).`,
        impact:
          "Very short pages often fail to explain the offer well enough to convert or rank effectively.",
        fix: "Expand the page with useful, structured content that answers likely visitor questions.",
        estimatedEffect:
          "Can improve trust, SEO relevance, and conversion clarity.",
        scoreImpact: 7,
        businessImpact:
          "This can lower both SEO visibility and conversion confidence.",
      });
    }

    if (headlineQuality === "strong") {
      categories.content += 5;
    } else if (headlineQuality === "medium") {
      categories.content += 3;
      addIssue({
        id: "content-headline-medium",
        category: "content",
        severity: "medium",
        effort: "low",
        problem: `The main headline exists but could be clearer (${h1 || "headline detected"}).`,
        impact:
          "If the headline is not specific enough, users may take longer to understand the offer.",
        fix: "Rewrite the H1 to clearly state what you do, who it is for, and the result.",
        estimatedEffect: "Can improve first-impression clarity and engagement.",
        scoreImpact: 3,
        businessImpact:
          "This may reduce engagement because users need more time to understand the page.",
      });
    } else if (headlineQuality === "weak") {
      categories.content += 1;
      addIssue({
        id: "content-headline-weak",
        category: "content",
        severity: "high",
        effort: "low",
        problem: `The main headline is weak or too generic (${h1 || "weak headline"}).`,
        impact:
          "Weak hero messaging can lower engagement in the first few seconds and hurt conversions.",
        fix: "Use a stronger value-driven headline that immediately communicates the offer.",
        estimatedEffect: "Can improve clarity and reduce bounce risk.",
        scoreImpact: 6,
        businessImpact:
          "This may cause users to leave because the value is not clear quickly enough.",
      });
    } else {
      addIssue({
        id: "content-headline-missing",
        category: "content",
        severity: "high",
        effort: "low",
        problem: "No main headline was detected.",
        impact:
          "Without a strong H1, users may not understand the page purpose quickly enough.",
        fix: "Add a clear, descriptive H1 near the top of the page.",
        estimatedEffect: "Can improve clarity and first-impression quality.",
        scoreImpact: 6,
        businessImpact:
          "This may significantly reduce clarity and conversions.",
      });
    }

    if (paragraphCount >= 3) {
      categories.content += 5;
    } else {
      addIssue({
        id: "content-supporting-copy",
        category: "content",
        severity: paragraphCount === 0 ? "high" : "medium",
        effort: paragraphCount === 0 ? "medium" : "low",
        problem:
          paragraphCount === 0
            ? "Very little supporting copy was found."
            : `Supporting copy is limited (${paragraphCount} paragraph${paragraphCount === 1 ? "" : "s"} detected).`,
        impact:
          "Limited explanatory copy can reduce trust and make the page less persuasive.",
        fix: "Add short supporting sections that explain the service, audience, outcomes, and next step.",
        estimatedEffect: "Can improve clarity and decision confidence.",
        scoreImpact: paragraphCount === 0 ? 5 : 3,
        businessImpact:
          "This may reduce conversions because users do not get enough reassurance or explanation.",
      });
    }

    if (buttonCount >= 2) {
      categories.technical += 5;
    } else {
      addIssue({
        id: "technical-cta-coverage",
        category: "ux",
        severity: "medium",
        effort: "low",
        problem: `Only ${buttonCount} clear button-style action${buttonCount === 1 ? "" : "s"} were detected.`,
        impact:
          "Limited CTA coverage can reduce conversion opportunities across the page.",
        fix: "Repeat the primary CTA in more than one strategic section of the page.",
        estimatedEffect:
          "Can improve click-through and lead capture opportunity.",
        scoreImpact: 3,
        businessImpact:
          "This may lower leads because users are not prompted to act often enough.",
      });
    }

    if (ctaStrength === "strong") {
      categories.technical += 5;
    } else if (ctaStrength === "medium") {
      categories.technical += 3;
      addIssue({
        id: "technical-cta-strength",
        category: "ux",
        severity: "medium",
        effort: "low",
        problem: `CTA wording is present but not especially persuasive (${primaryCTA || "no strong CTA detected"}).`,
        impact:
          "Weaker CTA copy can reduce urgency and make the next step feel less compelling.",
        fix: "Use clearer action wording such as Book a Call, Get a Quote, or Start Now.",
        estimatedEffect: "Can improve action-taking and reduce hesitation.",
        scoreImpact: 2,
        businessImpact:
          "This may reduce click-through because the action feels too passive.",
      });
    } else if (ctaStrength === "weak") {
      categories.technical += 1;
      addIssue({
        id: "technical-cta-weak",
        category: "ux",
        severity: "high",
        effort: "low",
        problem: `CTA text appears weak or vague (${primaryCTA || "unclear CTA"}).`,
        impact:
          "Weak CTA copy often lowers click-through because the benefit of acting is not clear enough.",
        fix: "Replace vague CTA wording with a stronger action-focused phrase.",
        estimatedEffect: "Can improve conversion clarity with minimal effort.",
        scoreImpact: 4,
        businessImpact:
          "This may reduce conversions because the next step does not feel compelling enough.",
      });
    } else {
      addIssue({
        id: "technical-cta-missing",
        category: "ux",
        severity: "high",
        effort: "low",
        problem: "No clear call-to-action was detected.",
        impact:
          "Without a clear next step, users may leave without taking action.",
        fix: "Add a prominent CTA near the top of the page and repeat it in later sections.",
        estimatedEffect: "Can improve conversion opportunity immediately.",
        scoreImpact: 6,
        businessImpact:
          "This may significantly reduce leads or sales because users do not know what to do next.",
      });
    }

    if (visualSectionCount >= 4 || formsCount > 0) {
      categories.technical += 5;
    } else {
      addIssue({
        id: "technical-structure",
        category: "ux",
        severity: "medium",
        effort: "medium",
        problem: `Page structure looks limited (${visualSectionCount} strong sections detected).`,
        impact:
          "Weak page structure can make the journey feel flat and reduce decision clarity.",
        fix: "Create clearer sections, stronger layout blocks, and more guided content flow.",
        estimatedEffect: "Can improve readability and page usability.",
        scoreImpact: 3,
        businessImpact:
          "This may reduce conversions because the page feels less guided and less trustworthy.",
      });
    }

    const totalScore = clamp(
      categories.performance +
        categories.seo +
        categories.trust +
        categories.content +
        categories.technical,
      0,
      100,
    );

    const performanceMetrics = buildPerformanceMetrics({
      loadTimeMs,
      requestCount,
      pageSizeBytes,
      hasLayoutShiftRisk,
    });

    const fcpMetric = performanceMetrics.find((item) => item.key === "fcp");
    const performanceStatus = performanceMetrics.some(
      (item) => item.status === "poor",
    )
      ? "poor"
      : performanceMetrics.some((item) => item.status === "needs-improvement")
        ? "needs-improvement"
        : "good";

    const weakestCategory = getWeakestCategory(categories);
    const scoreLabel = scoreToLabel(totalScore);

    const verdict = buildVerdict({
      score: totalScore,
      weakestCategory,
      performanceStatus,
    });

    const executiveSummary = buildExecutiveSummary({
      score: totalScore,
      weakestCategory,
      performanceStatus,
      headlineQuality,
      ctaStrength,
    });

    const sortedRecommendations = recommendations.sort((a, b) => {
      if (b.priorityRank !== a.priorityRank)
        return b.priorityRank - a.priorityRank;
      if ((b.scoreImpact || 0) !== (a.scoreImpact || 0))
        return (b.scoreImpact || 0) - (a.scoreImpact || 0);
      return a.problem.localeCompare(b.problem);
    });

    const topIssues = issues
      .sort((a, b) => {
        if (b.priorityRank !== a.priorityRank)
          return b.priorityRank - a.priorityRank;
        return (b.scoreImpact || 0) - (a.scoreImpact || 0);
      })
      .slice(0, 3);

    const whatToFixFirst = sortedRecommendations
      .sort((a, b) => {
        if (severityWeight(b.severity) !== severityWeight(a.severity)) {
          return severityWeight(b.severity) - severityWeight(a.severity);
        }
        if (effortWeight(b.effort) !== effortWeight(a.effort)) {
          return effortWeight(b.effort) - effortWeight(a.effort);
        }
        return (b.scoreImpact || 0) - (a.scoreImpact || 0);
      })
      .slice(0, 3)
      .map((item) => ({
        id: item.id,
        category: item.category,
        severity: item.severity,
        effort: item.effort,
        problem: item.problem,
        impact: item.impact,
        fix: item.fix,
        estimatedScoreImprovement: item.scoreImpact || 0,
        fixDetails: item.fixDetails,
      }));

    const scoreBreakdown = buildScoreBreakdown(
      categories,
      sortedRecommendations,
    );

    const groupedChecks = {
      fundamentals: [
        {
          label: "Page title",
          state: getCheckState({ passed: Boolean(title) }),
          details: Boolean(title) ? "Detected" : "Missing",
        },
        {
          label: "Meta description",
          state: getCheckState({
            passed: metaDescriptionQuality === "good",
            warning: metaDescriptionQuality === "weak",
            detected: metaDescriptionQuality !== "missing",
          }),
          details:
            metaDescriptionQuality === "good"
              ? "Well sized"
              : metaDescriptionQuality === "weak"
                ? "Present but weak"
                : "Not detected",
        },
        {
          label: "Main headline (H1)",
          state: getCheckState({
            passed: headlineQuality === "strong",
            warning: headlineQuality === "medium" || headlineQuality === "weak",
            detected: headlineQuality !== "missing",
          }),
          details: toTitle(
            headlineQuality === "missing" ? "not-detected" : headlineQuality,
          ),
        },
        {
          label: "Call-to-action",
          state: getCheckState({
            passed: ctaStrength === "strong",
            warning: ctaStrength === "medium" || ctaStrength === "weak",
            detected: ctaStrength !== "missing",
          }),
          details: toTitle(
            ctaStrength === "missing" ? "not-detected" : ctaStrength,
          ),
        },
      ],
      trustAndContent: [
        {
          label: "Enough content",
          state: getCheckState({
            passed: wordCount >= 800,
            warning: wordCount >= 300 && wordCount < 800,
            detected: wordCount > 0,
          }),
          details: `${wordCount} words`,
        },
        {
          label: "Testimonials",
          state: getCheckState({ passed: hasTestimonials, detected: true }),
          details: hasTestimonials ? "Detected" : "Not detected",
        },
        {
          label: "Trust signals",
          state: getCheckState({ passed: hasRealTrustProof, detected: true }),
          details: hasRealTrustProof ? "Detected" : "Not detected",
        },
        {
          label: "Social links",
          state: getCheckState({ passed: hasSocialLinks, detected: true }),
          details: hasSocialLinks ? "Detected" : "Not detected",
        },
      ],
      technical: [
        {
          label: "Uses HTTPS",
          state: getCheckState({ passed: usesHttps, detected: true }),
          details: usesHttps ? "Secure" : "Not secure",
        },
        {
          label: "Full page load",
          state: getCheckState({
            passed: performanceStatus === "good",
            warning: performanceStatus === "needs-improvement",
            detected: true,
          }),
          details: formatSeconds(loadTimeMs),
        },
        {
          label: "Forms detected",
          state: getCheckState({ passed: formsCount > 0, detected: true }),
          details: formsCount > 0 ? `${formsCount} found` : "None found",
        },
        {
          label: "Image alt text",
          state: getCheckState({
            passed: imageCount === 0 || imagesMissingAlt === 0,
            warning:
              imageCount > 0 &&
              imagesMissingAlt > 0 &&
              imagesMissingAlt < imageCount,
            detected: imageCount > 0,
          }),
          details:
            imageCount === 0
              ? "No images found"
              : imagesMissingAlt === 0
                ? "All images covered"
                : `${imagesMissingAlt} missing`,
        },
      ],
    };

    return {
      url: finalUrl,
      generatedAt: new Date().toISOString(),
      score: totalScore,
      scoreLabel,
      weakestCategory,
      verdict,
      executiveSummary,
      analysisMeta: {
        dataSource: "Analysis based on simulated Lighthouse data",
        confidence: getConfidenceLevel({
          pageSizeBytes,
          requestCount,
          loadTimeMs,
        }),
        tags: ["Simulated", "Estimated"],
      },
      speedContext: {
        estimatedFullLoadTime: {
          value: formatSeconds(loadTimeMs),
          label: "Full page load",
          explanation:
            "Full load includes scripts and background resources. It represents when most page resources have finished loading.",
          status: performanceStatus,
          premiumStatus: statusLabel(performanceStatus),
          percentileText: approximatePercentile(performanceStatus),
        },
        userVisibleLoadTime: {
          value: fcpMetric?.value || "N/A",
          label: "First visible content",
          explanation:
            "This reflects when users first see content. It is usually the clearest measure of perceived speed.",
          status: fcpMetric?.status || "needs-improvement",
          premiumStatus: fcpMetric?.premiumStatus || "High impact issue",
          percentileText:
            fcpMetric?.percentileText ||
            approximatePercentile("needs-improvement"),
        },
      },
      performanceMetrics,
      highlights: [
        performanceStatus === "poor"
          ? {
              label: "Performance is a critical issue",
              tone: "critical",
              description: `${formatSeconds(loadTimeMs)} full load time is below industry average.`,
            }
          : null,
        weakestCategory
          ? {
              label: `${toTitle(weakestCategory)} is the weakest category`,
              tone: "neutral",
              description: "This is the main opportunity area for the page.",
            }
          : null,
        primaryCTA
          ? {
              label: `Primary CTA: ${primaryCTA}`,
              tone: ctaStrength === "strong" ? "positive" : "neutral",
              description: `CTA strength is currently rated ${toTitle(ctaStrength)}.`,
            }
          : null,
      ].filter(Boolean),
      topIssues,
      whatToFixFirst,
      priorityActions: sortedRecommendations.slice(0, 5),
      recommendations: sortedRecommendations,
      categories,
      groupedChecks,
      performance: {
        loadTimeMs,
        loadTimeSeconds: Number((loadTimeMs / 1000).toFixed(2)),
        totalPageSizeBytes: pageSizeBytes,
        totalPageSizeMb: Number((pageSizeBytes / (1024 * 1024)).toFixed(2)),
        totalRequests: requestCount,
        status: statusLabel(performanceStatus),
      },
      retention: {
        progress: buildProgressScaffold(sortedRecommendations),
        canRerunAudit: true,
        supportsIssueFixTracking: true,
      },
      exportOptions: {
        supportsPdf: true,
        supportsShareLink: true,
      },
      roadmap: {
        fixFirst: sortedRecommendations
          .filter((item) => item.severity === "high")
          .slice(0, 3),
        fixNext: sortedRecommendations
          .filter((item) => item.severity === "medium")
          .slice(0, 4),
        optionalImprovements: sortedRecommendations
          .filter((item) => item.severity === "low")
          .slice(0, 4),
      },
      meta: {
        title,
        metaDescription,
        h1,
        imageCount,
        imageSources: imageSources.slice(0, 10),
        imagesWithAlt,
        imagesMissingAlt,
        wordCount,
        paragraphCount,
        headingCount: headings.length,
        sectionCount: semanticSectionCount,
        visualSectionCount,
        formCount: formsCount,
        buttonCount,
        realButtons,
        ctaLikeLinks,
        ctaCandidateCount: ctaCandidates.length,
        ctaText: primaryCTA,
        ctaStrength,
        headlineQuality,
        metaDescriptionQuality,
        hasPhone,
        hasEmail,
        usesHttps,
        requestCount,
        pageSizeBytes,
      },
      scoreExplanation: [
        {
          category: "performance",
          score: categories.performance,
          max: 20,
          note: "Measures speed, asset weight, and request complexity.",
          interpretation:
            categories.performance >= 16
              ? "Performance is in a strong range."
              : "Performance is limiting the page more than it should.",
          relatedIssues: sortedRecommendations
            .filter((item) => item.category === "performance")
            .map((item) => item.id),
        },
        {
          category: "seo",
          score: categories.seo,
          max: 20,
          note: "Measures metadata, headings, and image text support.",
          interpretation:
            categories.seo >= 16
              ? "SEO fundamentals are in a healthy range."
              : "SEO fundamentals need refinement.",
          relatedIssues: sortedRecommendations
            .filter((item) => item.category === "seo")
            .map((item) => item.id),
        },
        {
          category: "trust",
          score: categories.trust,
          max: 20,
          note: "Measures trust proof, contact cues, and credibility signals.",
          interpretation:
            categories.trust >= 16
              ? "Trust signals are strong."
              : "Credibility and reassurance can be improved.",
          relatedIssues: sortedRecommendations
            .filter((item) => item.category === "trust")
            .map((item) => item.id),
        },
        {
          category: "content",
          score: categories.content,
          max: 20,
          note: "Measures content depth, clarity, and supporting copy quality.",
          interpretation:
            categories.content >= 16
              ? "Content coverage is strong."
              : "Content clarity or depth still has room to improve.",
          relatedIssues: sortedRecommendations
            .filter((item) => item.category === "content")
            .map((item) => item.id),
        },
        {
          category: "technical",
          score: categories.technical,
          max: 20,
          note: "Measures CTA coverage, structure, and technical execution basics.",
          interpretation:
            categories.technical >= 16
              ? "Technical execution is in a solid range."
              : "Technical and UX execution is limiting the page.",
          relatedIssues: sortedRecommendations
            .filter(
              (item) => item.category === "technical" || item.category === "ux",
            )
            .map((item) => item.id),
        },
      ],
      scoreBreakdown,
      future: {
        competitorComparisonReady: true,
        aiFixesReady: true,
        auditHistoryReady: true,
      },
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

app.post("/api/audit", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url || typeof url !== "string") {
      return res.status(400).json({
        error: "Valid URL is required",
      });
    }

    const normalizedUrl = normalizeUrl(url);

    const user = await getAuthenticatedUserFromRequest(req);

    // 🔴 BLOCK guests here
    if (!user) {
      return res.status(401).json({
        code: "AUTH_REQUIRED",
        message: "Please log in to run an audit.",
      });
    }

    // ✅ continue for logged-in users
    resetAuditUsageIfNeeded(user);

    if (user.plan === "free" && user.auditsUsedToday >= 2) {
      await user.save();

      return res.status(403).json({
        code: "FREE_PLAN_LIMIT_REACHED",
        message: "Free limit reached. Upgrade to continue.",
        usage: getAuditUsageData(user),
      });
    }

    const result = await analyzeWebsite(normalizedUrl);

    if (user && user.plan === "free") {
      user.auditsUsedToday += 1;
      await user.save();
    }

    return res.json({
      ...result,
      usage: user ? getAuditUsageData(user) : null,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Something went wrong while scanning the website",
    });
  }
});

app.post("/api/report/save", (req, res) => {
  try {
    const { audit } = req.body;

    if (!audit || typeof audit !== "object") {
      return res.status(400).json({ error: "Valid audit payload is required" });
    }

    const existingId = audit?.share?.reportId;
    const reportId = existingId || createReportId();
    const share = buildShareMeta(reportId);
    const savedAudit = {
      ...audit,
      share,
      exportOptions: {
        ...(audit.exportOptions || {}),
        supportsPdf: true,
        supportsShareLink: true,
      },
    };

    savedReports.set(reportId, {
      id: reportId,
      audit: savedAudit,
      createdAt: Date.now(),
    });

    return res.json({
      reportId,
      share,
      audit: savedAudit,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: error.message || "Unable to save report" });
  }
});

app.get("/api/report/:reportId", (req, res) => {
  const report = savedReports.get(req.params.reportId);

  if (!report) {
    return res.status(404).json({ error: "Report not found" });
  }

  return res.json({
    reportId: report.id,
    audit: report.audit,
  });
});

app.get("/api/report/:reportId/pdf", async (req, res) => {
  try {
    const report = savedReports.get(req.params.reportId);

    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    const pdfBuffer = await createAuditPdfBuffer(report.audit);
    const filename = `audit-report-${req.params.reportId}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    return res.send(pdfBuffer);
  } catch (error) {
    return res
      .status(500)
      .json({ error: error.message || "Unable to generate PDF" });
  }
});

app.post("/api/report/pdf", async (req, res) => {
  try {
    const { audit } = req.body;

    if (!audit || typeof audit !== "object") {
      return res.status(400).json({ error: "Valid audit payload is required" });
    }

    const pdfBuffer = await createAuditPdfBuffer(audit);
    const filename = `audit-report.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    return res.send(pdfBuffer);
  } catch (error) {
    return res
      .status(500)
      .json({ error: error.message || "Unable to generate PDF" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
