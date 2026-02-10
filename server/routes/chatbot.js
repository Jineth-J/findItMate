const express = require('express');
const router = express.Router();
const ChatbotConversation = require('../models/ChatbotConversation');
const { optionalAuth } = require('../middleware/auth');

// Knowledge base for the chatbot (moved from frontend)
const KNOWLEDGE_BASE = {
    platform: {
        name: 'FindItMate',
        description: 'AI-powered student accommodation platform connecting students with verified, safe, and affordable hostels near Sri Lankan universities.',
        features: ['AI Tour Planner', 'Safety Scores', 'Group Search', 'Multilingual Support', 'Verified Listings', 'Budget Calculator']
    },
    areas: [
        { name: 'Reid Avenue, Colombo 07', distance: '2 min walk', popular: true },
        { name: 'Baseline Road, Colombo 08', distance: '10 min walk', popular: true },
        { name: 'Havelock Road, Colombo 05', distance: '15 min walk', popular: false },
        { name: 'Flower Road, Colombo 07', distance: '5 min walk', popular: true },
        { name: 'Wijerama Road, Colombo 07', distance: '8 min walk', popular: false }
    ],
    pricing: {
        single: { min: 12000, max: 25000, avg: 15000 },
        shared: { min: 7000, max: 15000, avg: 9000 },
        suite: { min: 18000, max: 45000, avg: 28000 }
    },
    amenities: ['WiFi', 'AC', 'Attached Bath', 'Kitchen Access', 'Study Area', 'Gym', 'Laundry', 'CCTV', 'Parking', 'Hot Water'],
    safety: {
        features: ['Verified landlords', 'CCTV surveillance', '24/7 security', 'Fire safety equipment', 'Female-only floors available'],
        tips: ['Always visit the property before signing', 'Check the lease agreement carefully', 'Verify the landlord identity on our platform', 'Use our safety score as a guide']
    },
    faqs: {
        deposit: 'Most landlords require a security deposit equal to 1-2 months rent. This is refundable at the end of your lease, minus any damages.',
        lease: 'Standard lease periods are 6 months or 12 months. Some landlords offer flexible month-to-month arrangements at a slightly higher rate.',
        utilities: 'Utilities (electricity, water) are usually separate from rent and cost around LKR 2,000-5,000/month depending on usage.',
        transport: 'Most listed properties are within walking distance (5-15 min) of UCSC. Bus routes 138, 154, and 177 also serve the area.',
        meals: 'About 40% of our listings include meals (full-board or half-board). You can filter for this in the search.'
    }
};

// Generate AI response based on user query
function generateResponse(query, language, conversationHistory = []) {
    const q = query.toLowerCase().trim();

    // === SINHALA ===
    if (language === 'si' || /[අ-ෆ]/.test(q)) {
        if (q.match(/(ආයුබෝවන්|කොහොමද|hello|hi|හායි)/)) {
            return {
                response: 'ආයුබෝවන්! 👋 මම FindItMate AI සහායකයා. UCSC අසල නවාතැන් සෙවීමට, මිල ගණන් සැසඳීමට, ආරක්ෂාව පිළිබඳ දැනගැනීමට හෝ ඕනෑම ප්‍රශ්නයකට මට උදව් කළ හැක.\n\nඔබට අවශ්‍ය කුමක්ද? 😊',
                suggestions: ['මිල අඩු කාමර', 'UCSC අසල', 'ආරක්ෂිත තැන්', 'කෑම සහිත නවාතැන්']
            };
        }
        if (q.match(/(මිල|ගණන්|කීයද|price|cost|budget|අයවැය)/)) {
            return {
                response: `📊 **මිල ගණන් මාර්ගෝපදේශය:**\n\n🏠 **තනි කාමර:** LKR ${KNOWLEDGE_BASE.pricing.single.min.toLocaleString()} - ${KNOWLEDGE_BASE.pricing.single.max.toLocaleString()}/මාසයකට\n\n👥 **බෙදාගන්නා කාමර:** LKR ${KNOWLEDGE_BASE.pricing.shared.min.toLocaleString()} - ${KNOWLEDGE_BASE.pricing.shared.max.toLocaleString()}/මාසයකට\n\nඔබේ අයවැය කීයද? මට ඒ අනුව සොයා දිය හැක.`,
                suggestions: ['LKR 10,000 ට අඩු', 'LKR 15,000 ට අඩු', 'කෑම සහිත මිල']
            };
        }
        if (q.match(/(ස්තූතියි|එච්චරයි|thanks|thank)/)) {
            return { response: 'සුළු දෙයක්! 😊 ඔබට තව උදව් අවශ්‍ය නම් ඕනෑම වෙලාවක අහන්න. 🏠✨', suggestions: [] };
        }
        return {
            response: 'මට ඔබට උදව් කිරීමට කැමතියි! 😊 කරුණාකර පහත විකල්පයක් තෝරන්න.',
            suggestions: ['කාමර සොයන්න', 'මිල ගණන්', 'ආරක්ෂාව', 'උදව්']
        };
    }

    // === TAMIL ===
    if (language === 'ta' || /[\u0B80-\u0BFF]/.test(q)) {
        if (q.match(/(வணக்கம்|ஹலோ|hi|hello)/)) {
            return {
                response: 'வணக்கம்! 👋 நான் FindItMate AI உதவியாளர். UCSC அருகில் தங்குமிடம் தேட, விலைகளை ஒப்பிட நான் உதவ முடியும்.\n\nஉங்களுக்கு என்ன தேவை? 😊',
                suggestions: ['மலிவான அறைகள்', 'UCSC அருகில்', 'பாதுகாப்பான இடங்கள்', 'உணவுடன்']
            };
        }
        if (q.match(/(நன்றி|thanks|thank)/)) {
            return { response: 'மகிழ்ச்சி! 😊 மேலும் உதவி தேவைப்பட்டால் கேளுங்கள். 🏠✨', suggestions: [] };
        }
        return {
            response: 'நான் உங்களுக்கு உதவ விரும்புகிறேன்! 😊',
            suggestions: ['அறைகளைத் தேடு', 'விலைகள்', 'பாதுகாப்பு', 'உதவி']
        };
    }

    // === ENGLISH ===
    // Greetings
    if (q.match(/^(hi|hello|hey|good morning|good afternoon|good evening|howdy|sup|what's up|yo)\b/)) {
        return {
            response: "Hello there! 👋 Welcome to FindItMate — I'm your personal accommodation assistant.\n\nI can help you with:\n🏠 **Finding rooms** near UCSC based on your budget and preferences\n💰 **Comparing prices** across different areas and room types\n🛡️ **Safety information** about neighborhoods and properties\n🗺️ **Tour planning** to visit multiple properties efficiently\n\nWhat would you like to explore today?",
            suggestions: ['Find me a room', 'What are the prices?', 'Is it safe?', 'How does the tour planner work?']
        };
    }

    // Identity / About
    if (q.match(/(who are you|what are you|your name|what can you do|about you)/)) {
        return {
            response: "I'm the **FindItMate AI Assistant** 🤖 — your personal housing advisor.\n\n📍 **Search & Recommend** — I know every verified listing near UCSC\n🧠 **Smart Advice** — I can explain lease terms, deposits, and utilities\n🗣️ **Multilingual** — I speak English, Sinhala (සිංහල), and Tamil (தமிழ்)\n🗺️ **Tour Planning** — I can help organize property visits\n\nI'm available 24/7 — ask me anything!",
            suggestions: ['Find rooms near UCSC', 'Budget advice', 'Safety tips', 'How to book']
        };
    }

    // Pricing
    if (q.match(/(price|cost|how much|budget|afford|expensive|cheap|rent|monthly)/)) {
        return {
            response: `📊 **Pricing Guide for UCSC Area:**\n\n🏠 **Single Rooms:** LKR ${KNOWLEDGE_BASE.pricing.single.min.toLocaleString()} – ${KNOWLEDGE_BASE.pricing.single.max.toLocaleString()}/month\n\n👥 **Shared Rooms:** LKR ${KNOWLEDGE_BASE.pricing.shared.min.toLocaleString()} – ${KNOWLEDGE_BASE.pricing.shared.max.toLocaleString()}/month\n\n✨ **Premium Suites:** LKR ${KNOWLEDGE_BASE.pricing.suite.min.toLocaleString()} – ${KNOWLEDGE_BASE.pricing.suite.max.toLocaleString()}/month\n\n📌 **Additional costs:** Utilities LKR 2,000–5,000/month\n\nWhat's your monthly budget?`,
            suggestions: ['Under LKR 10,000', 'Under LKR 15,000', 'Under LKR 20,000', 'With meals included']
        };
    }

    // Location
    if (q.match(/(location|area|where|near|close|distance|walk|colombo|ucsc|campus|university)/)) {
        const areas = KNOWLEDGE_BASE.areas.filter(a => a.popular).map(a => `📍 **${a.name}** (${a.distance})`).join('\n');
        return {
            response: `🗺️ **Popular Areas Near UCSC:**\n\n${areas}\n\n🚌 **Transport:** Bus routes 138, 154, 177 serve the area\n\nWould you like to see properties in a specific area?`,
            suggestions: ['Reid Avenue rooms', 'Cheapest area', 'Closest to UCSC', 'Plan a tour']
        };
    }

    // Safety
    if (q.match(/(safe|safety|security|secure|danger|crime|girl|female|women|cctv)/)) {
        return {
            response: `🛡️ **Safety at FindItMate:**\n\n${KNOWLEDGE_BASE.safety.features.map(f => `✅ ${f}`).join('\n')}\n\n**Safety Tips:**\n${KNOWLEDGE_BASE.safety.tips.map(t => `💡 ${t}`).join('\n')}\n\nWould you like to see the highest-rated safe properties?`,
            suggestions: ['Safest properties', 'Female-only hostels', 'Verified landlords', 'Safety scores explained']
        };
    }

    // Food / Meals
    if (q.match(/(food|meal|eat|kitchen|cook|breakfast|lunch|dinner)/)) {
        return {
            response: `🍲 **Food & Meal Options:**\n\n**Hostels with Meals:**\n• Full-board (3 meals): +LKR 8,000-12,000/month\n• Half-board (2 meals): +LKR 5,000-8,000/month\n\n**Self-Catering:**\n• ~60% of listings have kitchen access\n• Monthly grocery budget: ~LKR 5,000-8,000\n\nWant me to filter for rooms with meals included?`,
            suggestions: ['Rooms with meals', 'Kitchen access', 'Cheapest food options']
        };
    }

    // Help
    if (q.match(/(help|support|assist|what can|options|menu)/)) {
        return {
            response: `🤝 **I can help with:**\n\n🔍 **Search & Discovery** — Find rooms by budget, location, amenities\n💰 **Financial Guidance** — Price comparisons, budget planning\n🛡️ **Safety & Verification** — Safety scores, verified landlords\n🗺️ **Tour Planning** — Organize property visits\n📋 **Booking & Leases** — Step-by-step guide\n\n🗣️ **Languages:** English, සිංහල, தமிழ்\n\nJust ask me anything!`,
            suggestions: ['Find a room', 'Prices', 'Safety', 'How to book']
        };
    }

    // Thank you
    if (q.match(/(thank|thanks|bye|goodbye|see you|take care)/)) {
        return {
            response: "You're very welcome! 😊 I'm available 24/7 whenever you need help. Wishing you all the best in finding your perfect student home! ✨",
            suggestions: []
        };
    }

    // Default response
    return {
        response: `I appreciate your question! 🤔 I'm an expert on student accommodation near UCSC.\n\nHere's what I can help with:\n🏠 Room Search\n💰 Pricing\n🛡️ Safety\n🗺️ Tours\n\nTry asking:\n• "Find me a room under LKR 15,000"\n• "Is Colombo 07 safe?"\n• "What amenities are available?"`,
        suggestions: ['Find a room', 'Check prices', 'Safety info', 'Help']
    };
}

// @route   GET /api/chatbot/conversation
// @desc    Get or create chatbot conversation
// @access  Public (with optional auth)
router.get('/conversation', optionalAuth, async (req, res) => {
    try {
        const { sessionId } = req.query;
        const userId = req.user?._id;
        const userType = req.user?.userType || 'guest';

        if (!userId && !sessionId) {
            return res.status(400).json({
                success: false,
                message: 'Either login or provide a sessionId'
            });
        }

        const conversation = await ChatbotConversation.findOrCreate(userId, sessionId, userType);

        res.json({
            success: true,
            data: {
                id: conversation._id,
                messages: conversation.messages,
                language: conversation.language,
                userType: conversation.userType
            }
        });
    } catch (error) {
        console.error('Get chatbot conversation error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/chatbot/message
// @desc    Send a message and get AI response
// @access  Public (with optional auth)
router.post('/message', optionalAuth, async (req, res) => {
    try {
        const { content, language = 'en', sessionId } = req.body;
        const userId = req.user?._id;
        const userType = req.user?.userType || 'guest';

        if (!content) {
            return res.status(400).json({ success: false, message: 'Message content is required' });
        }

        if (!userId && !sessionId) {
            return res.status(400).json({
                success: false,
                message: 'Either login or provide a sessionId'
            });
        }

        // Get or create conversation
        let conversation = await ChatbotConversation.findOrCreate(userId, sessionId, userType);

        // Update language preference
        if (conversation.language !== language) {
            conversation.language = language;
        }

        // Add user message
        await conversation.addMessage('user', content);

        // Generate AI response
        const { response, suggestions } = generateResponse(content, language, conversation.messages);

        // Add bot response
        await conversation.addMessage('bot', response, suggestions);

        // Reload to get updated messages
        conversation = await ChatbotConversation.findById(conversation._id);

        res.json({
            success: true,
            data: {
                userMessage: {
                    role: 'user',
                    content,
                    timestamp: new Date()
                },
                botMessage: {
                    role: 'bot',
                    content: response,
                    suggestions,
                    timestamp: new Date()
                },
                conversationId: conversation._id
            }
        });
    } catch (error) {
        console.error('Send chatbot message error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   DELETE /api/chatbot/clear
// @desc    Clear conversation history
// @access  Public (with optional auth)
router.delete('/clear', optionalAuth, async (req, res) => {
    try {
        const { sessionId } = req.query;
        const userId = req.user?._id;

        let conversation;
        if (userId) {
            conversation = await ChatbotConversation.findOne({ userId });
        } else if (sessionId) {
            conversation = await ChatbotConversation.findOne({ sessionId });
        }

        if (!conversation) {
            return res.status(404).json({ success: false, message: 'Conversation not found' });
        }

        await conversation.clearMessages();

        res.json({
            success: true,
            message: 'Conversation cleared successfully'
        });
    } catch (error) {
        console.error('Clear chatbot conversation error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
