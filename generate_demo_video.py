#!/usr/bin/env python3
"""
RoadGuardian AI — Automated High-Definition Video Demonstration Generator
Generates an executive-ready 720p HD MP4 video walkthrough and poster thumbnail.
"""

import os
import sys
import subprocess
import math
from PIL import Image, ImageDraw, ImageFont

WIDTH = 1280
HEIGHT = 720
FPS = 30
DURATION_SEC = 24
TOTAL_FRAMES = FPS * DURATION_SEC

# Load Fonts
FONT_BOLD_PATH = "/usr/share/fonts/TTF/JetBrainsMonoNerdFontPropo-Bold.ttf"
FONT_REG_PATH = "/usr/share/fonts/Adwaita/AdwaitaSans-Regular.ttf"

def get_font(size, bold=True):
    try:
        path = FONT_BOLD_PATH if bold else FONT_REG_PATH
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    except Exception:
        pass
    return ImageFont.load_default()

font_title = get_font(44, bold=True)
font_subtitle = get_font(24, bold=False)
font_h1 = get_font(32, bold=True)
font_h2 = get_font(22, bold=True)
font_body = get_font(18, bold=False)
font_mono = get_font(16, bold=True)
font_mono_lg = get_font(20, bold=True)
font_tag = get_font(13, bold=True)

# Colors (Government India Theme)
NAVY_BG = (10, 16, 40)
NAVY_CARD = (18, 26, 60)
NAVY_HEADER = (0, 0, 128)
SAFFRON = (255, 153, 51)
INDIA_GREEN = (19, 136, 8)
WHITE = (255, 255, 255)
GRAY_TEXT = (180, 190, 210)
MUTED_BORDER = (45, 60, 100)
ALERT_AMBER = (245, 158, 11)
CYAN_ACCENT = (6, 182, 212)
RED_ACCENT = (239, 68, 68)

def draw_header(draw, active_tab=""):
    # Top Gov Banner
    draw.rectangle([(0, 0), (WIDTH, 36)], fill=(5, 8, 25))
    draw.text((30, 8), "GOVERNMENT OF INDIA INITIATIVE  |  MINISTRY OF ROAD TRANSPORT & HIGHWAYS", fill=GRAY_TEXT, font=font_tag)
    draw.text((WIDTH - 280, 8), "NODE: IND-204-VX  •  AES-256 ENCRYPTED", fill=INDIA_GREEN, font=font_tag)
    
    # Tricolor bar
    draw.rectangle([(0, 36), (WIDTH, 39)], fill=SAFFRON)
    draw.rectangle([(0, 39), (WIDTH, 42)], fill=WHITE)
    draw.rectangle([(0, 42), (WIDTH, 45)], fill=INDIA_GREEN)

    # Main Navigation Bar
    draw.rectangle([(0, 45), (WIDTH, 105)], fill=NAVY_HEADER)
    
    # Emblem Box
    draw.rectangle([(30, 52), (72, 98)], fill=WHITE)
    draw.rectangle([(35, 57), (67, 93)], fill=(0, 0, 100))
    draw.text((45, 66), "🏛️", fill=WHITE, font=font_mono)
    
    # Title in navbar
    draw.text((85, 54), "राष्ट्रीय सड़क सुरक्षा पोर्टल", fill=WHITE, font=font_h2)
    draw.text((85, 80), "ROADGUARDIAN AI  •  NATIONAL ROAD SAFETY PORTAL", fill=SAFFRON, font=font_tag)

    # Right pills
    draw.rectangle([(WIDTH - 270, 60), (WIDTH - 30, 92)], fill=(255, 255, 255, 30), outline=MUTED_BORDER)
    draw.text((WIDTH - 250, 68), "🔴 LIVE ON VERCEL & RENDER", fill=WHITE, font=font_tag)

def draw_footer_progress(draw, frame_idx):
    progress = frame_idx / TOTAL_FRAMES
    draw.rectangle([(0, HEIGHT - 18), (WIDTH, HEIGHT)], fill=(5, 8, 25))
    draw.rectangle([(0, HEIGHT - 18), (int(WIDTH * progress), HEIGHT)], fill=SAFFRON)

def render_frame(frame_idx):
    img = Image.new("RGB", (WIDTH, HEIGHT), color=NAVY_BG)
    draw = ImageDraw.Draw(img)

    # Subtle tech grid lines
    for x in range(0, WIDTH, 80):
        draw.line([(x, 105), (x, HEIGHT - 18)], fill=(15, 24, 55), width=1)
    for y in range(105, HEIGHT, 80):
        draw.line([(0, y), (WIDTH, y)], fill=(15, 24, 55), width=1)

    t = frame_idx / FPS  # Time in seconds

    # ==========================================
    # SCENE 1: Executive Title Intro (0 - 3.5s)
    # ==========================================
    if t < 3.5:
        draw_header(draw)
        # Main Hero Box
        box_y = 150
        draw.rectangle([(140, box_y), (WIDTH - 140, box_y + 440)], fill=NAVY_CARD, outline=SAFFRON, width=2)
        
        # Glow pulse
        alpha = int((math.sin(t * 4) + 1) * 20 + 20)
        draw.rectangle([(144, box_y + 4), (WIDTH - 144, box_y + 444)], outline=(255, 153, 51, alpha), width=2)

        draw.text((200, box_y + 50), "AI-POWERED CIVIC INFRASTRUCTURE", fill=SAFFRON, font=font_h2)
        draw.text((200, box_y + 90), "RoadGuardian AI v2.0", fill=WHITE, font=font_title)
        
        draw.rectangle([(200, box_y + 155), (WIDTH - 200, box_y + 157)], fill=INDIA_GREEN)

        features = [
            "⚡ Google Gemini 2.5 Flash Vision AI Hazard Detection",
            "📶 Resilient Offline-First PWA Synchronization with LocalForage",
            "💬 WhatsApp Civic Bot & Interactive Incident Triage Gateway",
            "🏛️ Department Authority Workflow, 3D Heatmap & Public Tenders",
            "🏆 Verified Citizen Rewards & Instant 1-Click Registration"
        ]
        
        y_off = box_y + 180
        for i, feat in enumerate(features):
            item_prog = min(1.0, max(0.0, (t - 0.5 - i * 0.3) * 3))
            if item_prog > 0:
                draw.text((220, y_off), feat, fill=WHITE, font=font_body)
                draw.text((200, y_off), "•", fill=SAFFRON, font=font_h2)
            y_off += 40

        badge_text = "PRODUCTION CERTIFIED • FULL STACK ARCHITECTURE"
        draw.rectangle([(200, box_y + 380), (700, box_y + 415)], fill=(19, 136, 8, 80), outline=INDIA_GREEN)
        draw.text((220, box_y + 390), badge_text, fill=WHITE, font=font_mono)

    # ==========================================
    # SCENE 2: Instant 1-Click Registration (3.5 - 7.0s)
    # ==========================================
    elif t < 7.0:
        draw_header(draw)
        rel_t = t - 3.5

        # Section Header
        draw.text((80, 130), "FEATURE 1: ZERO-FRICTION ONBOARDING", fill=SAFFRON, font=font_tag)
        draw.text((80, 150), "Instant 1-Click Citizen Registration & Authentication", fill=WHITE, font=font_h1)

        # Registration Card
        card_x = 180
        card_y = 210
        draw.rectangle([(card_x, card_y), (card_x + 920, card_y + 420)], fill=NAVY_CARD, outline=MUTED_BORDER, width=2)
        
        # Tabs
        draw.rectangle([(card_x + 40, card_y + 30), (card_x + 460, card_y + 75)], fill=WHITE)
        draw.text((card_x + 120, card_y + 42), "👤 CITIZEN REGISTRATION", fill=(0, 0, 100), font=font_h2)
        draw.rectangle([(card_x + 460, card_y + 30), (card_x + 880, card_y + 75)], fill=(25, 35, 75))
        draw.text((card_x + 540, card_y + 42), "🏛️ OFFICIAL CLEARANCE", fill=GRAY_TEXT, font=font_h2)

        # Big 1-Click Button with pulse
        pulse = 1.0 + 0.03 * math.sin(rel_t * 6)
        btn_w = int(840 * pulse)
        btn_x = card_x + 40 - int((btn_w - 840) / 2)
        btn_y = card_y + 110
        draw.rectangle([(btn_x, btn_y), (btn_x + btn_w, btn_y + 70)], fill=INDIA_GREEN, outline=(100, 255, 100), width=2)
        draw.text((btn_x + 160, btn_y + 20), "🚀 INSTANT CITIZEN REGISTRATION (1-CLICK)", fill=WHITE, font=font_h2)

        # Simulation trigger
        if rel_t > 1.5:
            # Success banner
            draw.rectangle([(card_x + 40, card_y + 210), (card_x + 880, card_y + 330)], fill=(10, 50, 25), outline=INDIA_GREEN, width=2)
            draw.text((card_x + 60, card_y + 230), "✅ VERIFIED CITIZEN CREDENTIALS ISSUED", fill=(100, 255, 100), font=font_h2)
            draw.text((card_x + 60, card_y + 265), "Civic ID: CITIZEN-7429  |  Initial Civic Points: 50  |  Status: ACTIVE OBSERVER", fill=WHITE, font=font_body)
            draw.text((card_x + 60, card_y + 295), "Session securely stored in localStorage • Direct redirect to Incident Dashboard", fill=GRAY_TEXT, font=font_tag)

        # Google button secondary
        draw.rectangle([(card_x + 40, card_y + 355), (card_x + 880, card_y + 395)], fill=(255, 255, 255, 20), outline=MUTED_BORDER)
        draw.text((card_x + 290, card_y + 365), "G  Or Sign In with Google OAuth / Government ID", fill=GRAY_TEXT, font=font_body)

    # ==========================================
    # SCENE 3: Gemini 2.5 Flash Vision AI (7.0 - 11.0s)
    # ==========================================
    elif t < 11.0:
        draw_header(draw)
        rel_t = t - 7.0

        draw.text((80, 130), "FEATURE 2: COMPUTER VISION & DAMAGE SCORING", fill=SAFFRON, font=font_tag)
        draw.text((80, 150), "Google Gemini 2.5 Flash AI Damage Detection", fill=WHITE, font=font_h1)

        # Left: Simulated Camera Viewport
        cam_x, cam_y, cam_w, cam_h = 100, 210, 560, 420
        draw.rectangle([(cam_x, cam_y), (cam_x + cam_w, cam_y + cam_h)], fill=(12, 16, 30), outline=CYAN_ACCENT, width=2)
        
        # Asphalt road drawing simulation
        draw.polygon([(cam_x + 80, cam_y + cam_h), (cam_x + cam_w - 80, cam_y + cam_h), (cam_x + 360, cam_y + 60), (cam_x + 200, cam_y + 60)], fill=(35, 40, 50))
        # Road lane stripes
        draw.line([(cam_x + 280, cam_y + 60), (cam_x + 280, cam_y + cam_h)], fill=(200, 200, 200), width=4)
        
        # Pothole representation
        draw.ellipse([(cam_x + 180, cam_y + 220), (cam_x + 380, cam_y + 330)], fill=(15, 18, 22), outline=(100, 100, 100), width=3)
        draw.ellipse([(cam_x + 210, cam_y + 240), (cam_x + 350, cam_y + 310)], fill=(5, 5, 8))

        # Dynamic scanning laser line
        scan_y = cam_y + int((rel_t * 120) % cam_h)
        draw.line([(cam_x, scan_y), (cam_x + cam_w, scan_y)], fill=(0, 255, 200), width=3)

        # AI Detection Bounding Box
        box_x1, box_y1, box_x2, box_y2 = cam_x + 150, cam_y + 190, cam_x + 410, cam_y + 360
        draw.rectangle([(box_x1, box_y1), (box_x2, box_y2)], outline=RED_ACCENT, width=3)
        draw.rectangle([(box_x1, box_y1 - 30), (box_x1 + 220, box_y1)], fill=RED_ACCENT)
        draw.text((box_x1 + 10, box_y1 - 25), "POTHOLE (94.8% CONF)", fill=WHITE, font=font_mono)

        # Right: AI Telemetry Breakdown
        tel_x = 700
        draw.rectangle([(tel_x, cam_y), (tel_x + 480, cam_y + cam_h)], fill=NAVY_CARD, outline=MUTED_BORDER, width=2)
        draw.text((tel_x + 30, cam_y + 30), "AI DAMAGE TELEMETRY", fill=SAFFRON, font=font_h2)
        
        metrics = [
            ("DETECTED HAZARD", "STRUCTURAL POTHOLE"),
            ("SEVERITY SCORE", "7.8 / 10  [HIGH]"),
            ("AI MODEL", "gemini-2.5-flash"),
            ("LATITUDE / LONGITUDE", "12.8481° N, 77.6567° E"),
            ("PREDICTED BUDGET", "₹ 14,500 ($175 USD)"),
            ("ROUTED DEPARTMENT", "Road Works Division"),
            ("SLA REPAIR WINDOW", "24 Hours (Active)"),
        ]

        my = cam_y + 80
        for label, val in metrics:
            draw.text((tel_x + 30, my), label, fill=GRAY_TEXT, font=font_tag)
            draw.text((tel_x + 30, my + 18), val, fill=WHITE if "HIGH" not in val else (255, 100, 100), font=font_mono_lg)
            my += 48

    # ==========================================
    # SCENE 4: Civil False-Positive Rejection (11.0 - 14.5s)
    # ==========================================
    elif t < 14.5:
        draw_header(draw)
        rel_t = t - 11.0

        draw.text((80, 130), "FEATURE 3: STRICT CIVIL VALIDATION", fill=SAFFRON, font=font_tag)
        draw.text((80, 150), "False-Positive Rejection (Non-Road Hazard Filter)", fill=WHITE, font=font_h1)

        # Left: Ambiguous screenshot (Speedtest / selfie)
        cam_x, cam_y, cam_w, cam_h = 100, 210, 500, 420
        draw.rectangle([(cam_x, cam_y), (cam_x + cam_w, cam_y + cam_h)], fill=(20, 25, 40), outline=ALERT_AMBER, width=2)
        
        # Screen mockup
        draw.rectangle([(cam_x + 40, cam_y + 40), (cam_x + cam_w - 40, cam_y + cam_h - 40)], fill=(10, 12, 20), outline=MUTED_BORDER)
        draw.ellipse([(cam_x + 150, cam_y + 120), (cam_x + 350, cam_y + 320)], outline=(80, 90, 120), width=6)
        draw.text((cam_x + 190, cam_y + 200), "SPEEDTEST", fill=GRAY_TEXT, font=font_mono)
        draw.text((cam_x + 195, cam_y + 230), "45.8 Mbps", fill=CYAN_ACCENT, font=font_mono_lg)

        # Red cross slash
        draw.line([(cam_x + 40, cam_y + 40), (cam_x + cam_w - 40, cam_y + cam_h - 40)], fill=(239, 68, 68, 180), width=4)
        draw.line([(cam_x + 40, cam_y + cam_h - 40), (cam_x + cam_w - 40, cam_y + 40)], fill=(239, 68, 68, 180), width=4)

        # Right: Amber Warning Banners
        tel_x = 640
        draw.rectangle([(tel_x, cam_y), (tel_x + 540, cam_y + cam_h)], fill=NAVY_CARD, outline=ALERT_AMBER, width=2)
        
        draw.rectangle([(tel_x + 20, cam_y + 25), (tel_x + 520, cam_y + 140)], fill=(45, 30, 10), outline=ALERT_AMBER, width=2)
        draw.text((tel_x + 40, cam_y + 45), "⚠️ NOT A ROAD HAZARD / NON-ROAD IMAGE", fill=ALERT_AMBER, font=font_h2)
        draw.text((tel_x + 40, cam_y + 80), "Civil Engineering AI Engine validated that this", fill=WHITE, font=font_body)
        draw.text((tel_x + 40, cam_y + 105), "image contains NO physical roadway damage.", fill=WHITE, font=font_body)

        draw.text((tel_x + 40, cam_y + 170), "🛡️ Municipal Bandwidth Protection:", fill=SAFFRON, font=font_h2)
        rules = [
            "• Screenshots, speed tests & documents automatically flagged",
            "• Indoor photos, portraits & vehicles without hazards rejected",
            "• Zero bogus tickets dispatched to municipal repair teams",
            "• Preserves emergency response budget for genuine hazards"
        ]
        my = cam_y + 215
        for r in rules:
            draw.text((tel_x + 40, my), r, fill=GRAY_TEXT, font=font_body)
            my += 36

        draw.rectangle([(tel_x + 40, cam_y + 360), (tel_x + 500, cam_y + 395)], fill=(19, 136, 8, 40), outline=INDIA_GREEN)
        draw.text((tel_x + 60, cam_y + 370), "STATUS: DISMISS CONFIRMED (0 FALSE TICKETS)", fill=(100, 255, 100), font=font_tag)

    # ==========================================
    # SCENE 5: Offline-First PWA Synchronization (14.5 - 18.0s)
    # ==========================================
    elif t < 18.0:
        draw_header(draw)
        rel_t = t - 14.5

        draw.text((80, 130), "FEATURE 4: OFFLINE-FIRST PWA RESILIENCE", fill=SAFFRON, font=font_tag)
        draw.text((80, 150), "Local IndexedDB Queue & One-Tap Manual Sync", fill=WHITE, font=font_h1)

        # Banner Card (matching app UI)
        b_x, b_y = 100, 210
        draw.rectangle([(b_x, b_y), (b_x + 1080, b_y + 90)], fill=(45, 35, 15), outline=ALERT_AMBER, width=2)
        draw.text((b_x + 30, b_y + 25), "💾 4 LOCAL OFFLINE REPORTS READY FOR SYNC", fill=ALERT_AMBER, font=font_h2)
        draw.text((b_x + 30, b_y + 55), "Reports are saved securely on device (IndexedDB). Tap 'Sync Now' when online.", fill=WHITE, font=font_tag)

        # Sync button with click simulation
        syncing = rel_t > 1.2
        btn_col = (19, 136, 8) if not syncing else (10, 80, 30)
        draw.rectangle([(b_x + 860, b_y + 22), (b_x + 1050, b_y + 68)], fill=btn_col, outline=WHITE, width=2)
        btn_txt = "🔄 SYNC NOW" if not syncing else "⏳ SYNCING..."
        draw.text((b_x + 885, b_y + 35), btn_txt, fill=WHITE, font=font_mono_lg)

        # Table Feed showing transition from OFFLINE to VERIFIED HZ-ID
        t_y = 330
        draw.rectangle([(b_x, t_y), (b_x + 1080, t_y + 300)], fill=NAVY_CARD, outline=MUTED_BORDER, width=2)
        
        # Table Header
        draw.rectangle([(b_x, t_y), (b_x + 1080, t_y + 45)], fill=(25, 35, 75))
        draw.text((b_x + 30, t_y + 14), "INCIDENT LOG ID", fill=GRAY_TEXT, font=font_tag)
        draw.text((b_x + 280, t_y + 14), "CLASSIFICATION", fill=GRAY_TEXT, font=font_tag)
        draw.text((b_x + 560, t_y + 14), "LOCATION VECTOR", fill=GRAY_TEXT, font=font_tag)
        draw.text((b_x + 850, t_y + 14), "STATUS / SEVERITY", fill=GRAY_TEXT, font=font_tag)

        rows = [
            ("HZ-3491" if syncing else "HZ-OFFLINE-1", "WATERLOGGING", "12.8481, 77.6567", "VERIFIED (7.8/10)" if syncing else "SYNC PENDING"),
            ("HZ-3492" if syncing else "HZ-OFFLINE-2", "POTHOLE", "12.8463, 77.6651", "IN PROGRESS (8.5/10)" if syncing else "SYNC PENDING"),
            ("HZ-3493" if syncing else "HZ-OFFLINE-3", "ROAD DEBRIS", "12.8512, 77.6432", "VERIFIED (6.0/10)" if syncing else "SYNC PENDING"),
        ]

        ry = t_y + 60
        for lid, cls, loc, st in rows:
            st_col = (100, 255, 100) if "VERIFIED" in st or "IN PROGRESS" in st else ALERT_AMBER
            draw.text((b_x + 30, ry), lid, fill=CYAN_ACCENT if "OFFLINE" not in lid else ALERT_AMBER, font=font_mono)
            draw.text((b_x + 280, ry), cls, fill=WHITE, font=font_mono)
            draw.text((b_x + 560, ry), loc, fill=GRAY_TEXT, font=font_mono)
            draw.text((b_x + 850, ry), st, fill=st_col, font=font_mono)
            draw.line([(b_x + 20, ry + 35), (b_x + 1060, ry + 35)], fill=(30, 42, 80), width=1)
            ry += 55

        if syncing:
            draw.text((b_x + 30, t_y + 250), "✅ 4/4 Reports Reconciled with PostgreSQL Node in Australia (0 ms Data Loss)", fill=(100, 255, 100), font=font_h2)

    # ==========================================
    # SCENE 6: WhatsApp Civic Bot & AI Triage (18.0 - 21.0s)
    # ==========================================
    elif t < 21.0:
        draw_header(draw)
        rel_t = t - 18.0

        draw.text((80, 130), "FEATURE 5: CITIZEN REPORTING GATEWAY", fill=SAFFRON, font=font_tag)
        draw.text((80, 150), "Interactive WhatsApp Civic Triage & Twilio Webhook", fill=WHITE, font=font_h1)

        # Phone mockup container
        p_x, p_y, p_w, p_h = 340, 210, 600, 430
        draw.rectangle([(p_x, p_y), (p_x + p_w, p_y + p_h)], fill=(11, 20, 26), outline=(0, 168, 132), width=3)
        
        # WhatsApp Green Header
        draw.rectangle([(p_x, p_y), (p_x + p_w, p_y + 55)], fill=(32, 44, 51))
        draw.ellipse([(p_x + 20, p_y + 12), (p_x + 52, p_y + 44)], fill=(0, 168, 132))
        draw.text((p_x + 28, p_y + 18), "🤖", fill=WHITE, font=font_tag)
        draw.text((p_x + 65, p_y + 14), "RoadGuardian National Bot", fill=WHITE, font=font_mono)
        draw.text((p_x + 65, p_y + 34), "Official Govt Verified Business", fill=(0, 200, 150), font=font_tag)

        # Chat Bubble 1: Citizen
        draw.rectangle([(p_x + 150, p_y + 80), (p_x + p_w - 30, p_y + 150)], fill=(0, 92, 75))
        draw.text((p_x + 170, p_y + 95), "Deep crater pothole near metro pillar 42.", fill=WHITE, font=font_body)
        draw.text((p_x + 170, p_y + 120), "Buses swerving into opposite lane!", fill=WHITE, font=font_body)

        # Chat Bubble 2: Bot Response (appears after 0.8s)
        if rel_t > 0.8:
            draw.rectangle([(p_x + 30, p_y + 170), (p_x + p_w - 80, p_y + 340)], fill=(32, 44, 51))
            draw.text((p_x + 50, p_y + 185), "✅ Report Registered: Ticket #1042", fill=(0, 255, 180), font=font_mono_lg)
            draw.text((p_x + 50, p_y + 220), "• Category: Critical Road Crater", fill=WHITE, font=font_body)
            draw.text((p_x + 50, p_y + 248), "• Severity: 8.8 / 10 [High Alert]", fill=RED_ACCENT, font=font_body)
            draw.text((p_x + 50, p_y + 276), "• Department: Municipal Road Division", fill=WHITE, font=font_body)
            draw.text((p_x + 50, p_y + 304), "• SLA Window: 24 Hours. Repair dispatched!", fill=INDIA_GREEN, font=font_body)

    # ==========================================
    # SCENE 7: Authority Dashboard, Heatmap & Tenders (21.0 - 24.0s)
    # ==========================================
    else:
        draw_header(draw)
        rel_t = t - 21.0

        draw.text((80, 130), "FEATURE 6: DEPARTMENT TRIAGE & PUBLIC TENDERS", fill=SAFFRON, font=font_tag)
        draw.text((80, 150), "Authority Management, 3D Heatmap & Contractor Bidding", fill=WHITE, font=font_h1)

        # 3 Metrics Cards
        cx = 80
        mcards = [
            ("ACTIVE INCIDENTS", "19", INDIA_GREEN),
            ("VERIFIED REPAIRS", "8", SAFFRON),
            ("CONTRACTOR TENDERS", "₹ 4,20,000", CYAN_ACCENT)
        ]
        for title, val, col in mcards:
            draw.rectangle([(cx, 210), (cx + 340, 310)], fill=NAVY_CARD, outline=col, width=2)
            draw.text((cx + 25, 230), title, fill=GRAY_TEXT, font=font_tag)
            draw.text((cx + 25, 255), val, fill=WHITE, font=font_title)
            cx += 380

        # Public Tenders Panel
        draw.rectangle([(80, 340), (WIDTH - 80, 560)], fill=NAVY_CARD, outline=MUTED_BORDER, width=2)
        draw.text((110, 360), "🏛️ ACTIVE MUNICIPAL REPAIR TENDERS (OPEN BIDDING)", fill=SAFFRON, font=font_h2)
        
        tenders = [
            ("TND-892", "NH-44 Flyover Crater Resurfacing", "₹ 1,80,000", "PWD Road Division", "CLOSING IN 48H"),
            ("TND-893", "Outer Ring Road Drainage & Manhole Fix", "₹ 2,40,000", "Water & Sanitation", "3 CONTRACTORS BID")
        ]
        ty = 410
        for tid, tname, tcost, tdept, tstatus in tenders:
            draw.text((110, ty), tid, fill=CYAN_ACCENT, font=font_mono)
            draw.text((230, ty), tname, fill=WHITE, font=font_h2)
            draw.text((700, ty), tcost, fill=(100, 255, 100), font=font_mono_lg)
            draw.text((880, ty), tdept, fill=GRAY_TEXT, font=font_mono)
            draw.text((1050, ty), tstatus, fill=SAFFRON, font=font_tag)
            draw.line([(100, ty + 40), (WIDTH - 100, ty + 40)], fill=(35, 45, 80), width=1)
            ty += 60

        # Final Live CTA Footer
        draw.rectangle([(80, 580), (WIDTH - 80, 640)], fill=(19, 136, 8, 80), outline=INDIA_GREEN, width=2)
        draw.text((120, 595), "🌐 LIVE PORTAL: https://road-guardian-ai-beta.vercel.app  •  API: https://roadguardian-ai-fhvy.onrender.com", fill=WHITE, font=font_mono_lg)

    draw_footer_progress(draw, frame_idx)
    return img

def main():
    print("🎬 RoadGuardian AI — Starting High-Definition Video Render...")
    output_mp4 = "/home/aspirant/Projects/RoadGuardian_AI/docs/roadguardian-demo.mp4"
    output_frontend_mp4 = "/home/aspirant/Projects/RoadGuardian_AI/roadguardian-frontend/public/roadguardian-demo.mp4"
    output_poster = "/home/aspirant/Projects/RoadGuardian_AI/docs/demo-thumbnail.png"
    output_frontend_poster = "/home/aspirant/Projects/RoadGuardian_AI/roadguardian-frontend/public/demo-thumbnail.png"

    # 1. Generate High-Res Poster Thumbnail (Scene 3 frame)
    poster_frame = render_frame(FPS * 8)
    poster_frame.save(output_poster)
    poster_frame.save(output_frontend_poster)
    print(f"✅ Poster thumbnail saved: {output_poster}")

    # 2. Pipe frames to FFmpeg to encode H.264 MP4
    ffmpeg_cmd = [
        "ffmpeg",
        "-y",
        "-f", "rawvideo",
        "-vcodec", "rawvideo",
        "-s", f"{WIDTH}x{HEIGHT}",
        "-pix_fmt", "rgb24",
        "-r", str(FPS),
        "-i", "-",
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "22",
        "-pix_fmt", "yuv420p",
        "-movflags", "+faststart",
        output_mp4
    ]

    proc = subprocess.Popen(ffmpeg_cmd, stdin=subprocess.PIPE)

    for i in range(TOTAL_FRAMES):
        frame = render_frame(i)
        proc.stdin.write(frame.tobytes())
        if i % 60 == 0:
            print(f"Rendering frame {i}/{TOTAL_FRAMES} ({(i/TOTAL_FRAMES)*100:.1f}%)...")

    proc.stdin.close()
    proc.wait()

    # Also copy to frontend public directory
    subprocess.run(["cp", output_mp4, output_frontend_mp4])
    print(f"✅ Video demonstration generated successfully: {output_mp4}")
    print(f"✅ Deployed to frontend static assets: {output_frontend_mp4}")

if __name__ == "__main__":
    main()
