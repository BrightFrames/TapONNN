const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '../frontend/src/locales');
const languages = ['hi', 'mr', 'gu', 'bn', 'ta', 'te', 'kn', 'ml', 'pa'];

const newTranslations = {
    nav: {
        marketplace: { hi: "बाज़ार", mr: "बाजार", default: "Marketplace" }
    },
    shop: {
        title: { hi: "मेरी दुकान", mr: "माझे दुकान", default: "My Shop" },
        manage: { hi: "प्रबंधन", mr: "व्यवस्थापन", default: "Manage" },
        products: { hi: "उत्पाद", mr: "उत्पादने", default: "Products" },
        orders: { hi: "ऑर्डर और पूछताछ", mr: "ऑर्डर्स आणि चौकशी", default: "Orders & Enquiries" },
        addBio: { hi: "बायो जोड़ें", mr: "बायो जोडा", default: "Add bio" },
        add: { hi: "जोड़ें", mr: "जोडा", default: "Add" },
        publishTitle: { hi: "अपनी दुकान प्रकाशित करें", mr: "आपले दुकान प्रकाशित करा", default: "Publish your Shop" },
        publishDesc: { hi: "आपकी दुकान अभी छिपी हुई है।", mr: "आपले दुकान सध्या लपलेले आहे.", default: "Your Shop is currently hidden." },
        links: { hi: "लिंक", mr: "लिंक्स", default: "Links" },
        offerings: { hi: "प्रस्ताव", mr: "ऑफर्स", default: "Offerings" },
        searchProducts: { hi: "उत्पाद खोजें", mr: "उत्पादने शोधा", default: "Search products" },
        connect: { hi: "कनेक्ट", mr: "कनेक्ट", default: "Connect" },
        livePreview: { hi: "लाइव पूर्वावलोकन", mr: "थेट पूर्वावलोकन", default: "Live Preview" },
        previewDesc: { hi: "आपकी वर्तमान थीम को दर्शाता है", mr: "तुमची वर्तमान थीम दर्शवते", default: "Reflects your current theme" },
        addNewProduct: { hi: "नया उत्पाद जोड़ें", mr: "नवीन उत्पादन जोडा", default: "Add New Product" },
        addProductDesc: { hi: "अपनी दुकान में कोई उत्पाद या लिंक जोड़ें।", mr: "तुमच्या दुकानात उत्पादन किंवा लिंक जोडा.", default: "Add a product or link to your shop." },
        productName: { hi: "उत्पाद का नाम", mr: "उत्पादनाचे नाव", default: "Product Name" },
        price: { hi: "कीमत ($)", mr: "किंमत ($)", default: "Price ($)" },
        type: { hi: "प्रकार", mr: "प्रकार", default: "Type" },
        selectType: { hi: "प्रकार चुनें", mr: "प्रकार निवडा", default: "Select type" },
        digitalProduct: { hi: "डिजिटल उत्पाद", mr: "डिजिटल उत्पादन", default: "Digital Product" },
        physicalProduct: { hi: "भौतिक उत्पाद", mr: "भौतिक उत्पादन", default: "Physical Product" },
        physicalService: { hi: "भौतिक सेवा", mr: "भौतिक सेवा", default: "Physical Service" },
        digitalService: { hi: "डिजिटल सेवा", mr: "डिजिटल सेवा", default: "Digital Service" },
        description: { hi: "विवरण", mr: "वर्णन", default: "Description" },
        productUrl: { hi: "उत्पाद URL", mr: "उत्पादन URL", default: "Product URL" },
        productImage: { hi: "उत्पाद छवि", mr: "उत्पादन प्रतिमा", default: "Product Image" },
        saveProduct: { hi: "उत्पाद सहेजें", mr: "उत्पादन जतन करा", default: "Save Product" },
        status: { hi: "स्थिति", mr: "स्थिती", default: "Status" },
        enquiry: { hi: "पूछताछ", mr: "चौकशी", default: "Enquiry" },
        transactionRef: { hi: "ट्रांजेक्शन रिफरेन्स", mr: "व्यवहार संदर्भ", default: "Transaction Ref" },
        message: { hi: "संदेश", mr: "संदेश", default: "Message" },
        reject: { hi: "अस्वीकार करें", mr: "नाकारा", default: "Reject" },
        markDone: { hi: "पूर्ण चिह्नित करें", mr: "पूर्ण झाले असे चिन्हांकित करा", default: "Mark Done" },
        verify: { hi: "सत्यापित करें", mr: "सत्यापित करा", default: "Verify" },
        noOrders: { hi: "अभी तक कोई ऑर्डर या पूछताछ नहीं।", mr: "अद्याप कोणतीही ऑर्डर किंवा चौकशी नाही.", default: "No orders or enquiries yet." },
        searchPlaceholder: { hi: "उत्पाद URL खोजें या पेस्ट करें", mr: "शोधा किंवा उत्पादन URL पेस्ट करा", default: "Search or paste product URL" },
        addFirstProduct: { hi: "अपना पहला उत्पाद जोड़ें", mr: "पहिले उत्पादन जोडा", default: "Add your first product" },
        sellDesc: { hi: "अपने दर्शकों को सीधे भौतिक या डिजिटल उत्पाद बेचें।", mr: "तुमच्या प्रेक्षकांना थेट भौतिक किंवा डिजिटल वस्तू विक्री करा.", default: "Sell physical or digital goods directly to your audience." },
        noProducts: { hi: "अभी तक कोई उत्पाद नहीं", mr: "अद्याप कोणतीही उत्पादने नाहीत", default: "No products yet" }
    },
    earnings: {
        title: { hi: "भुगतान इतिहास", mr: "पेमेंट इतिहास", default: "Payment History" },
        breadcrumb: { hi: "बिलिंग - भुगतान इतिहास - भुगतान किया गया", mr: "बिलिंग - पेमेंट इतिहास - पैसे दिले", default: "Billing - Payment History - Paid" },
        paymentHistory: { hi: "भुगतान इतिहास", mr: "पेमेंट इतिहास", default: "Payment history" },
        refundHistory: { hi: "धनवापसी इतिहास", mr: "परतावा इतिहास", default: "Refund history" },
        paymentId: { hi: "भुगतान आईडी", mr: "पेमेंट आयडी", default: "Payment ID" },
        invoiceId: { hi: "चालान आईडी", mr: "इन्व्हॉइस आयडी", default: "Invoice ID" },
        service: { hi: "सेवा", mr: "सेवा", default: "Service" },
        paidTitle: { hi: "शीर्षक", mr: "शीर्षक", default: "Title" },
        paidAt: { hi: "भुगतान किया गया", mr: "पैसे दिले", default: "Paid at" },
        amount: { hi: "राशि", mr: "रक्कम", default: "Amount" },
        noHistory: { hi: "कोई भुगतान इतिहास नहीं मिला", mr: "कोणताही पेमेंट इतिहास सापडला नाही", default: "No Payment History Found" },
        noRefunds: { hi: "कोई धनवापसी नहीं", mr: "कोणताही परतावा नाही", default: "No Refunds" }
    },
    media: {
        title: { hi: "मीडिया लाइब्रेरी", mr: "मीडिया लायब्ररी", default: "Media Library" },
        desc: { hi: "अपने सभी चित्र, वीडियो और दस्तावेज़ एक ही स्थान पर अपलोड और प्रबंधित करें।", mr: "तुमचे सर्व फोटो, व्हिडिओ आणि दस्तऐवज एकाच ठिकाणी अपलोड आणि व्यवस्थापित करा.", default: "Upload and manage all your images, videos, and documents in one place." },
        upload: { hi: "मीडिया अपलोड करें", mr: "मीडिया अपलोड करा", default: "Upload Media" },
        comingSoon: { hi: "चरण 7 में जल्द आ रहा है", mr: "फेज 7 मध्ये लवकरच येत आहे", default: "Coming Soon in Phase 7" }
    },
    nfc: {
        title: { hi: "NFC कार्ड", mr: "NFC कार्ड्स", default: "NFC Cards" },
        desc: { hi: "अपने डिजिटल प्रोफाइल को फिजिकल NFC कार्ड से लिंक करें। तुरंत साझा करने के लिए टैप करें।", mr: "तुमचे डिजिटल प्रोफाइल फिजिकल NFC कार्डशी लिंक करा. त्वरित शेअर करण्यासाठी टॅप करा.", default: "Link your digital profile to a physical NFC card. Tap to share instantly." },
        order: { hi: "कार्ड ऑर्डर करें", mr: "कार्ड ऑर्डर करा", default: "Order Card" }
    },
    explore: {
        title: { hi: "खोजें", mr: "शोधा", default: "Explore" },
        desc: { hi: "TapX पर रचनाकारों और व्यवसायों की खोज करें", mr: "TapX वर निर्माते आणि व्यवसाय शोधा", default: "Discover creators and businesses on TapX" },
        search: { hi: "उपयोगकर्ता नाम खोजें...", mr: "वापरकर्तानाव शोधा...", default: "Search username..." },
        viewProfile: { hi: "प्रोफाइल देखें", mr: "प्रोफाइल पहा", default: "View Profile" },
        noResults: { hi: "कोई निर्माता नहीं मिला", mr: "कोणीही निर्माता सापडला नाही", default: "No creators found matching" }
    },
    banner: {
        upgradeText: { hi: "अधिक टूल अनलॉक करने के लिए अपग्रेड करें।", mr: "अधिक साधने अनलॉक करण्यासाठी अपग्रेड करा.", default: "Unlock more tools to grow your audience faster." },
        upgradeTextMobile: { hi: "अपग्रेड करें", mr: "अपग्रेड करा", default: "Upgrade to unlock more tools." }
    }
};

languages.forEach(lang => {
    const filePath = path.join(localesDir, lang, 'common.json');
    try {
        if (fs.existsSync(filePath)) {
            const fileContent = fs.readFileSync(filePath, 'utf8');
            let json = JSON.parse(fileContent);

            // Append new sections
            for (const [section, keys] of Object.entries(newTranslations)) {
                if (!json[section]) {
                    json[section] = {};
                }
                for (const [key, translations] of Object.entries(keys)) {
                    // Use translated value if available, else default
                    json[section][key] = translations[lang] || translations['default'];
                }
            }

            fs.writeFileSync(filePath, JSON.stringify(json, null, 4), 'utf8');
            console.log(`Updated ${lang}/common.json`);
        } else {
            console.log(`File not found: ${filePath}`);
        }
    } catch (e) {
        console.error(`Error updating ${lang}:`, e);
    }
});
