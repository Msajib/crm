# Bangladesh Voice Connectivity & Integration Report

## 1. Overview
Twilio and other major global VoIP providers (like Plivo or Nexmo) have limited support for local call termination in Bangladesh due to strict BTRC (Bangladesh Telecommunication Regulatory Commission) regulations. To implement a functional calling system within the CRM for Bangladesh, local **IP Telephony (IPP)** or **SIP Trunking** services must be used.

## 2. Recommended Providers in Bangladesh

### A. Amber IT (Top Choice for Business)
- **Service:** IP Phone & SIP Trunk.
- **Why:** Excellent API support and reliable SIP infrastructure.
- **Credentials needed:** 
    - SIP Domain (e.g., `sip.amberit.com.bd`)
    - Username (Your 11-digit IP Phone number)
    - Password
    - WebRTC Proxy (For browser-based calling)

### B. Metrotel (MetroNet)
- **Service:** SIP Trunking for Enterprises.
- **Why:** Stable connection for high-volume call centers.
- **Credentials needed:** SIP Server IP/Host, Username, Password.

### C. BTCL (Government)
- **Service:** "Alaap" or standard SIP.
- **Why:** Lowest cost, but setup can be bureaucratic.

---

## 3. Configuration Instructions for Bangladesh (Amber IT)

### Step 1: Procurement
Contact Amber IT Sales (amberit.com.bd) to request a **SIP Trunk / IP Phone** account. Specifically mention you need it for **CRM Integration**.

### Step 2: Obtain Credentials
Log in to your Amber IT customer portal or contact their support to get:
1. **User ID:** Usually your 096xx number.
2. **Password:** Your SIP password (not portal password).
3. **SIP Server:** `sip.amberit.com.bd` or a specific IP.

### Step 3: Configure in Integration Hub
Navigate to **Integration Hub -> Voice** in the CRM Dashboard and select **Amber IT**.
1. Enter your **SIP Domain**.
2. Enter your **Username** and **Password**.
3. Set your **Caller ID** (the number assigned to you).

---

## 4. Global Provider: Twilio (Advanced Setup)

To use Twilio effectively for international or supported regions:
1. **Account SID & Auth Token:** Found in Twilio Console.
2. **Twilio Phone Number:** Purchase a number in the "Phone Numbers" section.
3. **TwiML App SID:** Create a TwiML App in "Voice -> Settings -> TwiML Apps" to handle WebRTC calls.

---

## 5. Technical Implementation Details
The CRM uses **WebRTC** for browser-based calling.
- **For Twilio:** Uses `twilio-client` JS SDK.
- **For Amber IT / Local SIP:** Uses `JsSIP` or `SIP.js` connecting to a WebSocket (WSS) proxy. Most local providers require a VPN or a specific proxy to allow WSS connections from a web browser.
