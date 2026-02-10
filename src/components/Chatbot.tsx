import React, { useEffect, useState, useRef, Fragment, useCallback } from 'react';
import { X, Send, Bot, Sparkles, Trash2 } from 'lucide-react';
import { Room } from '../types';
import { chatbotAPI, getAuthToken } from '../services/api';
interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}
interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  rooms: Room[];
  onNavigateToRoom: (roomId: string) => void;
}
// Knowledge base for the chatbot
const KNOWLEDGE_BASE = {
  platform: {
    name: 'FindItMate',
    description:
      'AI-powered student accommodation platform connecting students with verified, safe, and affordable hostels near Sri Lankan universities.',
    features: [
      'AI Tour Planner',
      'Safety Scores',
      'Group Search',
      'Multilingual Support',
      'Verified Listings',
      'Budget Calculator']

  },
  areas: [
    {
      name: 'Reid Avenue, Colombo 07',
      distance: '2 min walk',
      popular: true
    },
    {
      name: 'Baseline Road, Colombo 08',
      distance: '10 min walk',
      popular: true
    },
    {
      name: 'Havelock Road, Colombo 05',
      distance: '15 min walk',
      popular: false
    },
    {
      name: 'Flower Road, Colombo 07',
      distance: '5 min walk',
      popular: true
    },
    {
      name: 'Wijerama Road, Colombo 07',
      distance: '8 min walk',
      popular: false
    }],

  pricing: {
    single: {
      min: 12000,
      max: 25000,
      avg: 15000
    },
    shared: {
      min: 7000,
      max: 15000,
      avg: 9000
    },
    suite: {
      min: 18000,
      max: 45000,
      avg: 28000
    }
  },
  amenities: [
    'WiFi',
    'AC',
    'Attached Bath',
    'Kitchen Access',
    'Study Area',
    'Gym',
    'Laundry',
    'CCTV',
    'Parking',
    'Hot Water'],

  safety: {
    features: [
      'Verified landlords',
      'CCTV surveillance',
      '24/7 security',
      'Fire safety equipment',
      'Female-only floors available'],

    tips: [
      'Always visit the property before signing',
      'Check the lease agreement carefully',
      'Verify the landlord identity on our platform',
      'Use our safety score as a guide']

  },
  faqs: {
    deposit:
      'Most landlords require a security deposit equal to 1-2 months rent. This is refundable at the end of your lease, minus any damages.',
    lease:
      'Standard lease periods are 6 months or 12 months. Some landlords offer flexible month-to-month arrangements at a slightly higher rate.',
    utilities:
      'Utilities (electricity, water) are usually separate from rent and cost around LKR 2,000-5,000/month depending on usage. Some all-inclusive options include utilities.',
    transport:
      'Most listed properties are within walking distance (5-15 min) of UCSC. Bus routes 138, 154, and 177 also serve the area.',
    meals:
      'About 40% of our listings include meals (full-board or half-board). You can filter for this in the search. Kitchen access is available in about 60% of listings.'
  }
};
// Advanced response generator
function generateResponse(
  query: string,
  rooms: Room[],
  language: 'en' | 'si' | 'ta',
  conversationHistory: Message[])
  : {
    response: string;
    suggestions?: string[];
  } {
  const q = query.toLowerCase().trim();
  const lastBotMessage =
    [...conversationHistory].reverse().find((m) => m.type === 'bot')?.content ||
    '';
  // === SINHALA ===
  if (language === 'si' || /[අ-ෆ]/.test(q)) {
    if (q.match(/(ආයුබෝවන්|කොහොමද|hello|hi|හායි)/)) {
      return {
        response:
          'ආයුබෝවන්! 👋 මම FindItMate AI සහායකයා. UCSC අසල නවාතැන් සෙවීමට, මිල ගණන් සැසඳීමට, ආරක්ෂාව පිළිබඳ දැනගැනීමට හෝ ඕනෑම ප්‍රශ්නයකට මට උදව් කළ හැක.\n\nඔබට අවශ්‍ය කුමක්ද? 😊',
        suggestions: [
          'මිල අඩු කාමර',
          'UCSC අසල',
          'ආරක්ෂිත තැන්',
          'කෑම සහිත නවාතැන්']

      };
    }
    if (q.match(/(මිල|ගණන්|කීයද|price|cost|budget|අයවැය)/)) {
      return {
        response: `📊 **මිල ගණන් මාර්ගෝපදේශය:**\n\n🏠 **තනි කාමර:** LKR ${KNOWLEDGE_BASE.pricing.single.min.toLocaleString()} - ${KNOWLEDGE_BASE.pricing.single.max.toLocaleString()}/මාසයකට\n(සාමාන්‍ය: LKR ${KNOWLEDGE_BASE.pricing.single.avg.toLocaleString()})\n\n👥 **බෙදාගන්නා කාමර:** LKR ${KNOWLEDGE_BASE.pricing.shared.min.toLocaleString()} - ${KNOWLEDGE_BASE.pricing.shared.max.toLocaleString()}/මාසයකට\n(සාමාන්‍ය: LKR ${KNOWLEDGE_BASE.pricing.shared.avg.toLocaleString()})\n\n✨ **Suite:** LKR ${KNOWLEDGE_BASE.pricing.suite.min.toLocaleString()} - ${KNOWLEDGE_BASE.pricing.suite.max.toLocaleString()}/මාසයකට\n\nවිදුලිය සහ ජලය සඳහා අමතරව LKR 2,000-5,000ක් පමණ වැය වේ.\n\nඔබේ අයවැය කීයද? මට ඒ අනුව සොයා දිය හැක.`,
        suggestions: ['LKR 10,000 ට අඩු', 'LKR 15,000 ට අඩු', 'කෑම සහිත මිල']
      };
    }
    if (q.match(/(කොහෙද|ස්ථානය|location|place|ළඟ|අසල)/)) {
      const areas = KNOWLEDGE_BASE.areas.
        filter((a) => a.popular).
        map((a) => `📍 ${a.name} (${a.distance})`).
        join('\n');
      return {
        response: `🗺️ **ජනප්‍රිය ප්‍රදේශ UCSC අසල:**\n\n${areas}\n\nබොහෝ නවාතැන් විශ්ව විද්‍යාලයට විනාඩි 5-15 ඇවිදීමේ දුරින් පිහිටා ඇත. Tour Planner භාවිතා කර ඔබට ප්‍රශස්ත මාර්ගයක් සැලසුම් කළ හැක.`,
        suggestions: [
          'සිතියම පෙන්වන්න',
          'ළඟම ඇති තැන්',
          'Tour එකක් සැලසුම් කරන්න']

      };
    }
    if (q.match(/(ආරක්ෂ|safe|security)/)) {
      return {
        response:
          '🛡️ **ආරක්ෂාව අපේ ප්‍රමුඛතාවයයි!**\n\n✅ සියලුම දේපල හිමියන් සත්‍යාපනය කර ඇත\n✅ CCTV නිරීක්ෂණ\n✅ 24/7 ආරක්ෂක සේවා\n✅ ගිනි ආරක්ෂණ උපකරණ\n✅ කාන්තා පමණක් මහල් ලබා ගත හැක\n\nසෑම ලැයිස්තුගත කිරීමකටම ආරක්ෂක ලකුණු (Safety Score) ඇත. ඉහළ ලකුණු සහිත ස්ථාන සොයන්න.',
        suggestions: ['කාන්තා නවාතැන්', 'ඉහළ ආරක්ෂාව', 'සත්‍යාපිත ස්ථාන']
      };
    }
    if (q.match(/(ස්තූතියි|එච්චරයි|බොහොම|thanks|thank)/)) {
      return {
        response:
          'සුළු දෙයක්! 😊 ඔබට තව උදව් අවශ්‍ය නම් ඕනෑම වෙලාවක අහන්න. ඔබට හොඳම නවාතැනක් සොයා ගැනීමට සුභ පැතුම්! 🏠✨',
        suggestions: []
      };
    }
    return {
      response:
        'මට ඔබට උදව් කිරීමට කැමතියි! 😊 කරුණාකර පහත විකල්පයක් තෝරන්න, නැතහොත් ඔබේ ප්‍රශ්නය වෙනත් ආකාරයකින් අසන්න.',
      suggestions: ['කාමර සොයන්න', 'මිල ගණන්', 'ආරක්ෂාව', 'උදව්']
    };
  }
  // === TAMIL ===
  if (language === 'ta' || /[\u0B80-\u0BFF]/.test(q)) {
    if (q.match(/(வணக்கம்|ஹலோ|hi|hello)/)) {
      return {
        response:
          'வணக்கம்! 👋 நான் FindItMate AI உதவியாளர். UCSC அருகில் தங்குமிடம் தேட, விலைகளை ஒப்பிட, பாதுகாப்பை உறுதிப்படுத்த நான் உதவ முடியும்.\n\nஉங்களுக்கு என்ன தேவை? 😊',
        suggestions: [
          'மலிவான அறைகள்',
          'UCSC அருகில்',
          'பாதுகாப்பான இடங்கள்',
          'உணவுடன்']

      };
    }
    if (q.match(/(விலை|கட்டணம்|எவ்வளவு|price|budget)/)) {
      return {
        response: `📊 **விலை வழிகாட்டி:**\n\n🏠 **தனி அறை:** LKR ${KNOWLEDGE_BASE.pricing.single.min.toLocaleString()} - ${KNOWLEDGE_BASE.pricing.single.max.toLocaleString()}/மாதம்\n\n👥 **பகிர்வு அறை:** LKR ${KNOWLEDGE_BASE.pricing.shared.min.toLocaleString()} - ${KNOWLEDGE_BASE.pricing.shared.max.toLocaleString()}/மாதம்\n\nமின்சாரம் மற்றும் தண்ணீருக்கு கூடுதலாக LKR 2,000-5,000 செலவாகும்.\n\nஉங்கள் பட்ஜெட் என்ன?`,
        suggestions: [
          'LKR 10,000 க்கு கீழ்',
          'LKR 15,000 க்கு கீழ்',
          'உணவுடன் விலை']

      };
    }
    if (q.match(/(இடம்|எங்கே|அருகில்|location|place)/)) {
      return {
        response:
          '🗺️ **UCSC அருகிலுள்ள பிரபலமான பகுதிகள்:**\n\n📍 Reid Avenue, Colombo 07 (2 நிமிட நடை)\n📍 Baseline Road, Colombo 08 (10 நிமிட நடை)\n📍 Flower Road, Colombo 07 (5 நிமிட நடை)\n\nபெரும்பாலான தங்குமிடங்கள் 5-15 நிமிட நடை தூரத்தில் உள்ளன.',
        suggestions: [
          'வரைபடம் காட்டு',
          'அருகிலுள்ள இடங்கள்',
          'சுற்றுலா திட்டம்']

      };
    }
    if (q.match(/(பாதுகாப்பு|safe|security)/)) {
      return {
        response:
          '🛡️ **பாதுகாப்பு எங்கள் முன்னுரிமை!**\n\n✅ அனைத்து உரிமையாளர்களும் சரிபார்க்கப்பட்டவர்கள்\n✅ CCTV கண்காணிப்பு\n✅ 24/7 பாதுகாப்பு\n✅ பெண்களுக்கான தனி மாடிகள்\n\nஒவ்வொரு பட்டியலிலும் பாதுகாப்பு மதிப்பெண் உள்ளது.',
        suggestions: [
          'பெண்கள் விடுதி',
          'உயர் பாதுகாப்பு',
          'சரிபார்க்கப்பட்டவை']

      };
    }
    if (q.match(/(நன்றி|thanks|thank)/)) {
      return {
        response:
          'மகிழ்ச்சி! 😊 மேலும் உதவி தேவைப்பட்டால் கேளுங்கள். சிறந்த தங்குமிடம் கிடைக்க வாழ்த்துக்கள்! 🏠✨',
        suggestions: []
      };
    }
    return {
      response:
        'நான் உங்களுக்கு உதவ விரும்புகிறேன்! 😊 கீழே உள்ள விருப்பங்களில் ஒன்றைத் தேர்ந்தெடுக்கவும்.',
      suggestions: ['அறைகளைத் தேடு', 'விலைகள்', 'பாதுகாப்பு', 'உதவி']
    };
  }
  // === ENGLISH (Advanced conversational AI) ===
  // Greetings
  if (
    q.match(
      /^(hi|hello|hey|good morning|good afternoon|good evening|howdy|sup|what's up|yo)\b/
    )) {
    return {
      response:
        "Hello there! 👋 Welcome to FindItMate — I'm your personal accommodation assistant.\n\nI can help you with:\n🏠 **Finding rooms** near UCSC based on your budget and preferences\n💰 **Comparing prices** across different areas and room types\n🛡️ **Safety information** about neighborhoods and properties\n🗺️ **Tour planning** to visit multiple properties efficiently\n🍲 **Meal options** and nearby food facilities\n\nWhat would you like to explore today?",
      suggestions: [
        'Find me a room',
        'What are the prices?',
        'Is it safe?',
        'How does the tour planner work?']

    };
  }
  // Identity / About
  if (
    q.match(
      /(who are you|what are you|your name|what can you do|about you|tell me about yourself)/
    )) {
    return {
      response:
        "Great question! 🤖 I'm the **FindItMate AI Assistant** — think of me as your personal housing advisor.\n\nHere's what I can do:\n\n📍 **Search & Recommend** — I know every verified listing near UCSC and can match you based on budget, location, amenities, and group size.\n\n🧠 **Smart Advice** — I can explain lease terms, deposit requirements, utility costs, and help you understand what to look for.\n\n🗣️ **Multilingual** — I speak English, Sinhala (සිංහල), and Tamil (தமிழ்).\n\n🗺️ **Tour Planning** — I can help you organize property visits efficiently.\n\nI'm available 24/7 — ask me anything!",
      suggestions: [
        'Find rooms near UCSC',
        'Budget advice',
        'Safety tips',
        'How to book']

    };
  }
  // How are you / Small talk
  if (q.match(/(how are you|how do you do|how's it going|what's new)/)) {
    return {
      response:
        "I'm doing wonderfully, thank you for asking! 😊 I'm always energized when I get to help students find their perfect home.\n\nHow about you? Are you currently looking for accommodation, or just exploring what's available?",
      suggestions: ['I need a room', 'Just browsing', 'Tell me about prices']
    };
  }
  // Jokes / Fun
  if (q.match(/(joke|funny|make me laugh|humor)/)) {
    const jokes = [
      'Why did the student bring a ladder to the hostel? Because they heard the rent was going through the roof! 😄',
      "What's a hostel's favorite type of music? Room and bass! 🎵",
      "Why don't hostels ever get lonely? Because they're always fully booked! 📚"];

    const joke = jokes[Math.floor(Math.random() * jokes.length)];
    return {
      response: `${joke}\n\nAlright, now that we've had a laugh — shall we get back to finding you the perfect place to stay? 🏠`,
      suggestions: ['Find a room', 'Check prices', 'Tell me another joke']
    };
  }
  // Pricing - Detailed
  if (
    q.match(
      /(price|cost|how much|budget|afford|expensive|cheap|rent|monthly|per month)/
    )) {
    const matchBudget = q.match(/(\d{1,3}[,.]?\d{3})/);
    if (matchBudget) {
      const budget = parseInt(matchBudget[1].replace(/[,.]/g, ''));
      const affordable = rooms.filter((r) => r.price <= budget / 100);
      return {
        response: `💰 Great! With a budget of **LKR ${budget.toLocaleString()}**, here's what I found:\n\n${affordable.length > 0 ?
            `I found **${affordable.length} properties** within your budget!\n\n${affordable.
              slice(0, 3).
              map(
                (r) =>
                  `🏠 **${r.name}** — LKR ${r.price}/night (${r.type})\n   ⭐ ${r.rating} rating | ${r.capacity} guests | ${r.amenities.slice(0, 3).join(', ')}`
              ).
              join('\n\n')}` :
            "Hmm, that's a tight budget. Let me suggest some shared room options that might work."}\n\n💡 **Pro tip:** Shared rooms can save you 30-40% compared to single rooms. Also, look for listings that include meals — they offer better overall value.`,

        suggestions: [
          'Show me shared rooms',
          'Include meals in budget',
          'Cheapest options']

      };
    }
    return {
      response: `📊 **Complete Pricing Guide for UCSC Area:**\n\n🏠 **Single Rooms:**\n   Range: LKR ${KNOWLEDGE_BASE.pricing.single.min.toLocaleString()} – ${KNOWLEDGE_BASE.pricing.single.max.toLocaleString()}/month\n   Average: LKR ${KNOWLEDGE_BASE.pricing.single.avg.toLocaleString()}/month\n\n👥 **Shared Rooms (2 people):**\n   Range: LKR ${KNOWLEDGE_BASE.pricing.shared.min.toLocaleString()} – ${KNOWLEDGE_BASE.pricing.shared.max.toLocaleString()}/month\n   Average: LKR ${KNOWLEDGE_BASE.pricing.shared.avg.toLocaleString()}/month\n\n✨ **Premium Suites:**\n   Range: LKR ${KNOWLEDGE_BASE.pricing.suite.min.toLocaleString()} – ${KNOWLEDGE_BASE.pricing.suite.max.toLocaleString()}/month\n\n📌 **Additional costs to budget for:**\n   • Utilities: LKR 2,000–5,000/month\n   • Security deposit: 1-2 months rent\n   • Key money: Usually 1 month rent\n\n💡 **My recommendation:** For most students, a shared room at LKR 8,000-10,000 with meals included offers the best value.\n\nWhat's your monthly budget? I can find the best matches for you.`,
      suggestions: [
        'Under LKR 10,000',
        'Under LKR 15,000',
        'Under LKR 20,000',
        'With meals included']

    };
  }
  // Under specific budget
  if (
    q.match(/(under|below|less than|within)\s*(lkr\s*)?\d/i) ||
    q.match(/\d+k/i)) {
    const numMatch = q.match(/(\d+)[,.]?(\d*)/);
    let budget = numMatch ? parseInt(numMatch[1] + (numMatch[2] || '')) : 15000;
    if (q.includes('k')) budget *= 1000;
    if (budget < 100) budget *= 1000;
    return {
      response: `🔍 Searching for rooms under **LKR ${budget.toLocaleString()}**...\n\nHere's what I recommend:\n\n${budget <= 10000 ? '👥 **Shared rooms** are your best bet at this budget. Look for:\n   • Baseline Road area (most affordable)\n   • Rooms with kitchen access (save on food costs)\n   • 2-person sharing for best value' : budget <= 15000 ? '🏠 You have good options! At this budget you can find:\n   • Single rooms in Colombo 07-08\n   • Shared rooms with AC and attached bath\n   • Some options with meals included' : '✨ Excellent budget! You can access:\n   • Premium single rooms with all amenities\n   • Rooms with meals, AC, WiFi, and attached bath\n   • Properties very close to UCSC (2-5 min walk)'}\n\n💡 Use the **"Find Hostels"** tab to browse all options with filters, or I can narrow it down further.\n\nWould you like me to focus on a specific area or amenity?`,
      suggestions: [
        'Near UCSC',
        'With meals',
        'With AC & WiFi',
        'Show all options']

    };
  }
  // Location queries
  if (
    q.match(
      /(location|area|where|near|close|distance|walk|colombo|ucsc|campus|university|reid|baseline|havelock|flower)/
    )) {
    return {
      response: `🗺️ **Accommodation Areas Near UCSC:**\n\n${KNOWLEDGE_BASE.areas.map((a) => `${a.popular ? '⭐' : '📍'} **${a.name}**\n   Distance: ${a.distance} ${a.popular ? '(Popular!)' : ''}`).join('\n\n')}\n\n🚌 **Transport Options:**\n   • Bus routes 138, 154, 177 serve the area\n   • Most properties are within walking distance\n   • Tuk-tuk rides within the area cost LKR 100-300\n\n💡 **My recommendation:** Reid Avenue and Flower Road offer the best proximity to campus. Baseline Road is more affordable but slightly further.\n\nWould you like to see properties in a specific area?`,
      suggestions: [
        'Reid Avenue rooms',
        'Cheapest area',
        'Closest to UCSC',
        'Plan a tour']

    };
  }
  // Safety
  if (
    q.match(
      /(safe|safety|security|secure|danger|crime|girl|female|women|cctv|guard)/
    )) {
    return {
      response: `🛡️ **Safety at FindItMate — Your Security Matters:**\n\n**Our Verification Process:**\n${KNOWLEDGE_BASE.safety.features.map((f) => `✅ ${f}`).join('\n')}\n\n**Safety Score System:**\nEvery property gets a safety score (1-10) based on:\n   • Location safety rating\n   • Building security features\n   • Landlord verification level\n   • Student reviews and feedback\n\n${q.match(/(girl|female|women)/) ? '👩 **For Female Students:**\n   • Female-only floors and buildings available\n   • Properties with female wardens\n   • Extra security measures for women\'s hostels\n   • Filter by "Female Only" in search\n\n' : ''}**Safety Tips:**\n${KNOWLEDGE_BASE.safety.tips.map((t) => `💡 ${t}`).join('\n')}\n\nWould you like me to show you the highest-rated safe properties?`,
      suggestions: [
        'Safest properties',
        'Female-only hostels',
        'Verified landlords',
        'Safety scores explained']

    };
  }
  // Food / Meals
  if (
    q.match(
      /(food|meal|eat|kitchen|cook|breakfast|lunch|dinner|canteen|restaurant|hungry)/
    )) {
    return {
      response: `🍲 **Food & Meal Options:**\n\n**Hostels with Meals:**\n   • About 40% of listings include meals\n   • Full-board (3 meals): adds ~LKR 8,000-12,000/month\n   • Half-board (2 meals): adds ~LKR 5,000-8,000/month\n   • Rice & curry is the most common menu\n\n**Self-Catering Options:**\n   • ~60% of listings have kitchen access\n   • Shared kitchens are common in hostels\n   • Monthly grocery budget: ~LKR 5,000-8,000\n\n**Nearby Restaurants & Canteens:**\n   • UCSC canteen (cheapest option)\n   • Several student-friendly restaurants on Reid Avenue\n   • Average meal cost: LKR 250-500\n\n💡 **My tip:** Hostels with meals included often offer the best value when you factor in time and convenience. A room at LKR 12,000 with meals can be cheaper than LKR 8,000 without!\n\nWant me to filter for rooms with meals included?`,
      suggestions: [
        'Rooms with meals',
        'Kitchen access',
        'Cheapest food options',
        'All-inclusive rooms']

    };
  }
  // Amenities
  if (
    q.match(
      /(wifi|internet|ac|air condition|bath|bathroom|laundry|parking|gym|study|amenity|amenities|facility|facilities)/
    )) {
    return {
      response: `🏠 **Available Amenities Across Listings:**\n\n${KNOWLEDGE_BASE.amenities.map((a) => `✅ ${a}`).join('\n')}\n\n**Most Common Combinations:**\n   🥇 WiFi + AC + Attached Bath (Premium)\n   🥈 WiFi + Fan + Shared Bath (Standard)\n   🥉 WiFi + Kitchen Access (Budget-friendly)\n\n💡 **Pro tip:** WiFi is available in 95% of listings. AC adds about LKR 3,000-5,000 to monthly rent. If you're on a budget, a good fan room near campus might be a better deal than an AC room further away.\n\nWhich amenities are most important to you?`,
      suggestions: [
        'Must have AC',
        'WiFi is enough',
        'Need attached bath',
        'Show all amenities']

    };
  }
  // Tour planner
  if (q.match(/(tour|visit|plan|schedule|see|check out|look at|viewing)/)) {
    return {
      response: `🗺️ **AI Tour Planner — How It Works:**\n\n1️⃣ **Browse & Add** — Find rooms you like and click the "+" button to add them to your tour list\n\n2️⃣ **Plan Your Route** — Go to the Tour Planner page and our AI will calculate the optimal visiting order to save you time\n\n3️⃣ **Visit Properties** — Follow the planned route. The map shows directions between each stop\n\n4️⃣ **Compare & Decide** — After visiting, compare your notes and make your choice\n\n💡 **Tips for a great tour:**\n   • Add 3-5 properties per tour (more gets tiring)\n   • Schedule tours on weekday mornings (landlords are more available)\n   • Bring a friend for safety and a second opinion\n   • Take photos and notes at each property\n\nWould you like to start browsing rooms to add to your tour?`,
      suggestions: [
        'Browse rooms',
        'Open Tour Planner',
        'How to book',
        'Safety tips for visits']

    };
  }
  // Booking / How to book
  if (
    q.match(
      /(book|reserve|how to|process|sign up|register|account|lease|agreement|deposit|key money)/
    )) {
    const topic = q.match(/(deposit)/) ?
      'deposit' :
      q.match(/(lease|agreement)/) ?
        'lease' :
        q.match(/(key money)/) ?
          'deposit' :
          null;
    if (
      topic &&
      KNOWLEDGE_BASE.faqs[topic as keyof typeof KNOWLEDGE_BASE.faqs]) {
      return {
        response: `📋 **${topic.charAt(0).toUpperCase() + topic.slice(1)} Information:**\n\n${KNOWLEDGE_BASE.faqs[topic as keyof typeof KNOWLEDGE_BASE.faqs]}\n\n💡 Need more details about the booking process?`,
        suggestions: [
          'Full booking process',
          'Lease terms',
          'Payment methods',
          'Talk to support']

      };
    }
    return {
      response: `📋 **How to Book on FindItMate:**\n\n1️⃣ **Create Account** — Sign up as a student (free!)\n2️⃣ **Search & Filter** — Use our smart search to find rooms matching your needs\n3️⃣ **Tour Properties** — Visit your shortlisted rooms using our AI Tour Planner\n4️⃣ **Book & Pay** — Secure your room with a verified booking\n\n**What You'll Need:**\n   • Valid student ID\n   • Security deposit (1-2 months rent)\n   • Key money (usually 1 month)\n   • First month's rent\n\n**Lease Terms:**\n   ${KNOWLEDGE_BASE.faqs.lease}\n\n**Deposit Info:**\n   ${KNOWLEDGE_BASE.faqs.deposit}\n\nReady to get started?`,
      suggestions: [
        'Create account',
        'Browse rooms',
        'Deposit details',
        'Lease explained']

    };
  }
  // Group / Sharing
  if (q.match(/(group|friend|share|sharing|together|roommate|partner|split)/)) {
    return {
      response: `👥 **Group Accommodation Search:**\n\nSearching with friends? Great idea! Here's how FindItMate helps:\n\n**Group Search Feature:**\n   • Select group size (2, 3, 4-6) in the search bar\n   • AI automatically calculates per-person costs\n   • See which rooms accommodate your group size\n\n**Cost Savings:**\n   • 2-person sharing: Save 30-40% vs single rooms\n   • 4-person sharing: Save up to 50%\n   • Example: LKR 18,000 suite ÷ 2 = LKR 9,000/person\n\n**Tips for Group Living:**\n   • Discuss budgets upfront\n   • Agree on house rules before signing\n   • Choose rooms with enough bathroom access\n   • Consider kitchen access for group cooking\n\nHow many people are in your group?`,
      suggestions: [
        '2 people',
        '3-4 people',
        'Show shared rooms',
        'Per-person costs']

    };
  }
  // Specific room types
  if (q.match(/(single|double|suite|standard|deluxe|premium|luxury)/)) {
    const type = q.match(/(suite)/) ?
      'suite' :
      q.match(/(deluxe|premium|luxury)/) ?
        'deluxe' :
        'standard';
    const matching = rooms.filter((r) => r.type === type);
    return {
      response: `🏠 **${type.charAt(0).toUpperCase() + type.slice(1)} Rooms:**\n\nI found **${matching.length} ${type} rooms** available:\n\n${matching.
        slice(0, 3).
        map(
          (r) =>
            `⭐ **${r.name}**\n   💰 LKR ${r.price}/night | Rating: ${r.rating}/5\n   🛏️ Capacity: ${r.capacity} | Amenities: ${r.amenities.slice(0, 4).join(', ')}`
        ).
        join(
          '\n\n'
        )}\n\n${type === 'standard' ? '💡 Standard rooms offer the best value for solo students.' : type === 'deluxe' ? '💡 Deluxe rooms include premium amenities like AC and attached bath.' : '💡 Suites are perfect for those wanting maximum comfort or sharing with friends.'}\n\nWould you like to see more details on any of these?`,
      suggestions: [
        'View details',
        'Compare prices',
        'Different type',
        'Add to tour']

    };
  }
  // Help
  if (q.match(/(help|support|assist|what can|options|menu)/)) {
    return {
      response: `🤝 **I'm here to help! Here's everything I can assist with:**\n\n🔍 **Search & Discovery**\n   • Find rooms by budget, location, or amenities\n   • Compare different room types\n   • Get personalized recommendations\n\n💰 **Financial Guidance**\n   • Price comparisons across areas\n   • Budget planning (rent + utilities + food)\n   • Understanding deposits and key money\n\n🛡️ **Safety & Verification**\n   • Safety scores explained\n   • Verified landlord information\n   • Tips for safe property visits\n\n🗺️ **Tour Planning**\n   • How to use the AI Tour Planner\n   • Best times to visit properties\n   • What to look for during visits\n\n📋 **Booking & Leases**\n   • Step-by-step booking guide\n   • Lease agreement explanations\n   • Payment process\n\n🗣️ **Languages:** English, සිංහල, தமிழ்\n\nJust ask me anything!`,
      suggestions: ['Find a room', 'Prices', 'Safety', 'How to book']
    };
  }
  // Thank you / Goodbye
  if (q.match(/(thank|thanks|bye|goodbye|see you|take care|cheers)/)) {
    return {
      response:
        "You're very welcome! 😊 It was great chatting with you.\n\n🏠 Remember, I'm available 24/7 whenever you need help with your accommodation search. Just click the chat button anytime!\n\nWishing you all the best in finding your perfect student home. Take care! ✨",
      suggestions: []
    };
  }
  // Compliments
  if (
    q.match(/(good|great|awesome|amazing|helpful|nice|cool|smart|impressive)/)) {
    return {
      response:
        "Thank you so much! 😊 That really means a lot. I'm constantly learning to serve you better.\n\nIs there anything else I can help you with? Whether it's finding rooms, comparing prices, or planning tours — I'm all ears!",
      suggestions: ['Find rooms', 'Compare prices', 'Plan a tour']
    };
  }
  // Contextual follow-ups based on last message
  if (q.match(/(yes|yeah|sure|ok|okay|please|show me|tell me more|go ahead)/)) {
    if (lastBotMessage.includes('budget') || lastBotMessage.includes('price')) {
      return {
        response:
          'Let me help you find the best options! 🔍\n\nTo give you the most accurate recommendations, could you tell me:\n\n1️⃣ **Your monthly budget** (e.g., LKR 10,000-15,000)\n2️⃣ **Room type preference** (single or shared)\n3️⃣ **Must-have amenities** (WiFi, AC, meals, etc.)\n\nOr you can simply browse all rooms using the **"Find Hostels"** tab!',
        suggestions: ['Under LKR 10k', 'Under LKR 15k', 'Browse all rooms']
      };
    }
    if (lastBotMessage.includes('tour') || lastBotMessage.includes('visit')) {
      return {
        response:
          'Great! To start planning your tour:\n\n1️⃣ Head to **"Find Hostels"** in the navigation\n2️⃣ Browse rooms and click the **"+"** button on cards you like\n3️⃣ Go to **"Tour Planner"** to see your list and generate the optimal route\n\nI\'d recommend adding 3-5 properties for a productive tour day. Would you like to start browsing?',
        suggestions: [
          'Browse rooms',
          'Safety tips for visits',
          'What to look for']

      };
    }
    return {
      response:
        'Of course! What specific topic would you like to explore? I can help with rooms, prices, locations, safety, tours, or anything else related to student accommodation. 😊',
      suggestions: [
        'Find rooms',
        'Check prices',
        'Safety info',
        'Tour planning']

    };
  }
  // Catch-all with intelligent fallback
  return {
    response: `I appreciate your question! 🤔 While I may not have a specific answer for that, I'm an expert on student accommodation near UCSC.\n\nHere's what I can help you with right now:\n\n🏠 **Room Search** — Find the perfect room based on your needs\n💰 **Pricing** — Understand costs and plan your budget\n🛡️ **Safety** — Learn about verified properties and safety scores\n🗺️ **Tours** — Plan efficient property visits\n🍲 **Amenities** — Food, WiFi, AC, and more\n\nTry asking something like:\n• "Find me a room under LKR 15,000"\n• "Is Colombo 07 safe for students?"\n• "What amenities do most hostels have?"\n\nI'm here to help! 😊`,
    suggestions: ['Find a room', 'Check prices', 'Safety info', 'Help']
  };
}
export function Chatbot({
  isOpen,
  onClose,
  rooms,
  onNavigateToRoom
}: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'si' | 'ta'>(
    'en'
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasLoadedRef = useRef(false);

  // Get or create session ID for guest users
  const getSessionId = (): string => {
    let sessionId = localStorage.getItem('chatbot_session_id');
    if (!sessionId) {
      sessionId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('chatbot_session_id', sessionId);
    }
    return sessionId;
  };
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);
  // Load conversation from backend
  const loadConversation = useCallback(async () => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    setIsLoading(true);

    try {
      const token = getAuthToken();
      const sessionId = token ? undefined : getSessionId();

      const response = await chatbotAPI.getConversation(sessionId);

      if (response.success && response.data) {
        const loadedMessages: Message[] = response.data.messages.map((msg, index) => ({
          id: `loaded_${index}`,
          type: msg.role === 'user' ? 'user' : 'bot',
          content: msg.content,
          timestamp: new Date(msg.timestamp),
          suggestions: msg.suggestions
        }));

        if (loadedMessages.length > 0) {
          setMessages(loadedMessages);
        } else {
          // Show welcome message if no history
          showWelcomeMessage();
        }
      } else {
        showWelcomeMessage();
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
      showWelcomeMessage();
    } finally {
      setIsLoading(false);
    }
  }, [selectedLanguage]);

  const showWelcomeMessage = () => {
    const greetings = {
      en: {
        text: "Hello! 👋 I'm your **FindItMate AI Assistant** — your personal guide to finding the perfect student accommodation near UCSC.\n\nI can help you with:\n🏠 Finding rooms matching your budget\n💰 Price comparisons & budget planning\n🛡️ Safety information & verified listings\n🗺️ Tour planning & property visits\n\nHow can I help you today?",
        suggestions: [
          'Find me a room',
          'What are the prices?',
          'Is it safe?',
          'How does booking work?']
      },
      si: {
        text: 'ආයුබෝවන්! 👋 මම **FindItMate AI සහායකයා** — UCSC අසල නවාතැන් සෙවීමට ඔබේ පුද්ගලික මාර්ගෝපදේශකයා.\n\nමට ඔබට උදව් කළ හැක:\n🏠 ඔබේ අයවැයට ගැලපෙන කාමර සොයා ගැනීම\n💰 මිල ගණන් සැසඳීම\n🛡️ ආරක්ෂාව පිළිබඳ තොරතුරු\n\nඅද මට ඔබට කෙසේ උදව් කළ හැකිද?',
        suggestions: ['මිල අඩු කාමර', 'UCSC අසල', 'ආරක්ෂිත තැන්', 'කෑම සහිත']
      },
      ta: {
        text: 'வணக்கம்! 👋 நான் **FindItMate AI உதவியாளர்** — UCSC அருகில் தங்குமிடம் தேட உங்கள் தனிப்பட்ட வழிகாட்டி.\n\nநான் உதவ முடியும்:\n🏠 உங்கள் பட்ஜெட்டுக்கு ஏற்ற அறைகள்\n💰 விலை ஒப்பீடுகள்\n🛡️ பாதுகாப்பு தகவல்கள்\n\nஇன்று நான் உங்களுக்கு எப்படி உதவலாம்?',
        suggestions: [
          'மலிவான அறைகள்',
          'UCSC அருகில்',
          'பாதுகாப்பு',
          'உணவுடன்']
      }
    };
    setMessages([
      {
        id: 'init',
        type: 'bot',
        content: greetings[selectedLanguage].text,
        timestamp: new Date(),
        suggestions: greetings[selectedLanguage].suggestions
      }]
    );
  };

  useEffect(() => {
    if (isOpen) {
      hasLoadedRef.current = false;
      loadConversation();
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, loadConversation]);
  const handleSend = async (text?: string) => {
    const messageText = text || inputValue.trim();
    if (!messageText) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: messageText,
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const token = getAuthToken();
      const sessionId = token ? undefined : getSessionId();

      const response = await chatbotAPI.sendMessage(messageText, selectedLanguage, sessionId);

      if (response.success && response.data) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: response.data.botMessage.content,
          timestamp: new Date(response.data.botMessage.timestamp),
          suggestions: response.data.botMessage.suggestions
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        throw new Error('Failed to get response');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Fallback to client-side response generation
      const { response, suggestions } = generateResponse(
        messageText,
        rooms,
        selectedLanguage,
        [...messages, userMessage]
      );
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: response,
        timestamp: new Date(),
        suggestions
      };
      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = async () => {
    try {
      const token = getAuthToken();
      const sessionId = token ? undefined : getSessionId();
      await chatbotAPI.clearConversation(sessionId);
      showWelcomeMessage();
    } catch (error) {
      console.error('Failed to clear conversation:', error);
      showWelcomeMessage();
    }
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  // Simple markdown-like rendering for bold text
  const renderContent = (content: string) => {
    const parts = content.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-bold">
            {part.slice(2, -2)}
          </strong>);

      }
      // Handle newlines
      return part.split('\n').map((line, j) =>
        <Fragment key={`${i}-${j}`}>
          {j > 0 && <br />}
          {line}
        </Fragment>
      );
    });
  };
  if (!isOpen) return null;
  return (
    <div className="fixed bottom-24 right-6 w-[400px] max-w-[calc(100vw-48px)] h-[620px] max-h-[calc(100vh-120px)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 border border-gray-200 animate-in slide-in-from-bottom-10 duration-300">
      {/* Header */}
      <div className="bg-[#3E2723] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-yellow-300" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">FindItMate AI</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <p className="text-xs text-white/70">Always here to help</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-white/10 rounded-lg p-0.5 border border-white/20">
            {(['en', 'si', 'ta'] as const).map((lang) =>
              <button
                key={lang}
                onClick={() => setSelectedLanguage(lang)}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${selectedLanguage === lang ? 'bg-white text-[#3E2723]' : 'text-white/70 hover:text-white'}`}>

                {lang.toUpperCase()}
              </button>
            )}
          </div>
          <button
            onClick={handleClearChat}
            className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors text-white/70 hover:text-white"
            title="Clear chat">
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors text-white/70 hover:text-white">

            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAF9F6] scroll-smooth">
        {messages.map((message) =>
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>

            <div
              className={`max-w-[88%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>

              {message.type === 'bot' &&
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-5 h-5 bg-[#3E2723] rounded-md flex items-center justify-center">
                    <Sparkles className="h-3 w-3 text-yellow-300" />
                  </div>
                  <span className="text-xs font-semibold text-[#795548]">
                    FindItMate AI
                  </span>
                </div>
              }

              <div
                className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${message.type === 'user' ? 'bg-[#3E2723] text-white rounded-br-sm' : 'bg-white text-[#3E2723] rounded-bl-sm border border-[#E8E0D5] shadow-sm'}`}>

                {renderContent(message.content)}
              </div>

              {/* Suggestions */}
              {message.type === 'bot' &&
                message.suggestions &&
                message.suggestions.length > 0 &&
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {message.suggestions.map((suggestion, idx) =>
                    <button
                      key={idx}
                      onClick={() => handleSend(suggestion)}
                      className="px-3 py-1.5 text-xs font-medium bg-white border border-[#D7CCC8] text-[#5D4037] rounded-full hover:bg-[#3E2723] hover:text-white hover:border-[#3E2723] transition-all shadow-sm">

                      {suggestion}
                    </button>
                  )}
                </div>
              }

              <p
                className={`text-[10px] mt-1 opacity-40 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>

                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        )}

        {/* Typing Indicator */}
        {isTyping &&
          <div className="flex justify-start">
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 bg-[#3E2723] rounded-md flex items-center justify-center mt-1">
                <Sparkles className="h-3 w-3 text-yellow-300" />
              </div>
              <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-sm border border-[#E8E0D5] shadow-sm">
                <div className="flex gap-1.5 items-center">
                  <span
                    className="w-2 h-2 bg-[#795548] rounded-full animate-bounce"
                    style={{
                      animationDelay: '0ms'
                    }}>
                  </span>
                  <span
                    className="w-2 h-2 bg-[#795548] rounded-full animate-bounce"
                    style={{
                      animationDelay: '150ms'
                    }}>
                  </span>
                  <span
                    className="w-2 h-2 bg-[#795548] rounded-full animate-bounce"
                    style={{
                      animationDelay: '300ms'
                    }}>
                  </span>
                  <span className="text-xs text-[#A1887F] ml-2">
                    Thinking...
                  </span>
                </div>
              </div>
            </div>
          </div>
        }

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white border-t border-gray-100">
        <div className="flex items-center gap-2 bg-[#F5F0E8] rounded-xl px-3 py-2 border border-[#E8E0D5] focus-within:border-[#795548] focus-within:ring-2 focus-within:ring-[#795548]/10 transition-all">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              selectedLanguage === 'si' ?
                'ඔබේ ප්‍රශ්නය මෙහි ටයිප් කරන්න...' :
                selectedLanguage === 'ta' ?
                  'உங்கள் கேள்வியை இங்கே தட்டச்சு செய்யவும்...' :
                  'Ask me anything about accommodation...'
            }
            className="flex-1 bg-transparent outline-none text-sm text-[#3E2723] placeholder-[#A1887F] px-1" />

          <button
            onClick={() => handleSend()}
            disabled={!inputValue.trim()}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all transform active:scale-95 ${inputValue.trim() ? 'bg-[#3E2723] text-white hover:bg-[#2D1B18] shadow-md' : 'bg-[#D7CCC8] text-[#A1887F] cursor-not-allowed'}`}>

            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="text-[10px] text-center text-[#A1887F] mt-1.5">
          Powered by FindItMate AI • Supports EN, SI, TA
        </p>
      </div>
    </div>);

}